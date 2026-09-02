import type { Locale } from "../i18n/messages";

export type AiDifficulty = "EASY" | "MEDIUM" | "HARD";
export type BloomLevel = "REMEMBER" | "UNDERSTAND" | "APPLY" | "ANALYZE" | "EVALUATE" | "CREATE";
export type McqOptionId = "A" | "B" | "C" | "D";

export type GroundingContextChunk = {
  id: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  sourceTitle: string;
};

export type QuizGenerationInput = {
  documentId: string;
  locale: Locale;
  questionCount: number;
  difficulty: AiDifficulty;
  competencyId?: string | null;
  chunks: GroundingContextChunk[];
};

export type GeneratedMcqOption = {
  id: McqOptionId;
  label: string;
};

export type GeneratedQuizQuestionDraft = {
  questionText: string;
  options: GeneratedMcqOption[];
  correctOptionId: McqOptionId;
  explanation: string;
  difficulty: AiDifficulty;
  bloomLevel: BloomLevel;
  topic: string;
  sourceChunkIds: string[];
};

export type GeneratedQuizDraft = {
  title: string;
  locale: Locale;
  questions: GeneratedQuizQuestionDraft[];
};

export type TutorInput = {
  locale: Locale;
  question: string;
  chunks: GroundingContextChunk[];
};

export type TutorAnswer = {
  supported: boolean;
  answer: string;
  sourceChunkIds: string[];
};

export interface AiProvider {
  generateQuiz(input: QuizGenerationInput): Promise<GeneratedQuizDraft>;
  answerTutor(input: TutorInput): Promise<TutorAnswer>;
}

export type AiValidationIssue = {
  code: string;
  path: string;
  message: string;
};

const expectedOptionIds: McqOptionId[] = ["A", "B", "C", "D"];
const supportedLocales = new Set<Locale>(["en", "hi", "te"]);
const supportedBloomLevels = new Set<BloomLevel>(["REMEMBER", "UNDERSTAND", "APPLY", "ANALYZE", "EVALUATE", "CREATE"]);

function normalize(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

function validateGroundingChunkSet(chunks: GroundingContextChunk[], documentId?: string) {
  const issues: AiValidationIssue[] = [];
  const ids = new Set<string>();

  for (const [index, chunk] of chunks.entries()) {
    if (!chunk.id.trim()) issues.push({ code: "EMPTY_CHUNK_ID", path: `chunks.${index}.id`, message: "Source chunk id is required." });
    if (ids.has(chunk.id)) issues.push({ code: "DUPLICATE_CHUNK_ID", path: `chunks.${index}.id`, message: "Source chunk ids must be unique." });
    ids.add(chunk.id);
    if (documentId && chunk.documentId !== documentId) {
      issues.push({ code: "CROSS_DOCUMENT_CONTEXT", path: `chunks.${index}.documentId`, message: "Every source chunk must belong to the requested document." });
    }
    if (!chunk.content.trim()) issues.push({ code: "EMPTY_CHUNK_CONTENT", path: `chunks.${index}.content`, message: "Grounding chunks must contain text." });
  }

  return issues;
}

export function validateQuizGenerationInput(input: QuizGenerationInput): AiValidationIssue[] {
  const issues = validateGroundingChunkSet(input.chunks, input.documentId);
  if (!input.documentId.trim()) issues.push({ code: "DOCUMENT_REQUIRED", path: "documentId", message: "A source document is required." });
  if (!supportedLocales.has(input.locale)) issues.push({ code: "UNSUPPORTED_LOCALE", path: "locale", message: "Quiz locale must be English, Hindi, or Telugu." });
  if (!Number.isInteger(input.questionCount) || input.questionCount < 1 || input.questionCount > 20) {
    issues.push({ code: "INVALID_QUESTION_COUNT", path: "questionCount", message: "Question count must be an integer from 1 to 20." });
  }
  if (!input.chunks.length) issues.push({ code: "GROUNDING_REQUIRED", path: "chunks", message: "At least one owned source chunk is required." });
  return issues;
}

export function validateGeneratedQuiz(draft: GeneratedQuizDraft, input: QuizGenerationInput): AiValidationIssue[] {
  const issues: AiValidationIssue[] = [];
  const allowedChunkIds = new Set(input.chunks.map((chunk) => chunk.id));
  const seenQuestions = new Set<string>();

  if (!draft.title.trim()) issues.push({ code: "TITLE_REQUIRED", path: "title", message: "Generated quiz title is required." });
  if (draft.locale !== input.locale) issues.push({ code: "LOCALE_MISMATCH", path: "locale", message: "Generated quiz locale must match the request." });
  if (draft.questions.length !== input.questionCount) {
    issues.push({ code: "QUESTION_COUNT_MISMATCH", path: "questions", message: "Generated quiz must contain exactly the requested number of questions." });
  }

  for (const [questionIndex, question] of draft.questions.entries()) {
    const base = `questions.${questionIndex}`;
    const normalizedQuestion = normalize(question.questionText);
    if (!normalizedQuestion) issues.push({ code: "QUESTION_REQUIRED", path: `${base}.questionText`, message: "Question text is required." });
    if (seenQuestions.has(normalizedQuestion)) issues.push({ code: "DUPLICATE_QUESTION", path: `${base}.questionText`, message: "Generated questions must be unique." });
    seenQuestions.add(normalizedQuestion);

    if (question.options.length !== 4) issues.push({ code: "FOUR_OPTIONS_REQUIRED", path: `${base}.options`, message: "Each MCQ must have exactly four options." });

    const optionIds = question.options.map((option) => option.id);
    const optionIdSet = new Set(optionIds);
    for (const expectedId of expectedOptionIds) {
      if (!optionIdSet.has(expectedId)) issues.push({ code: "OPTION_ID_MISSING", path: `${base}.options`, message: `Option ${expectedId} is required.` });
    }

    const labels = new Set<string>();
    for (const [optionIndex, option] of question.options.entries()) {
      const label = normalize(option.label);
      if (!label) issues.push({ code: "OPTION_LABEL_REQUIRED", path: `${base}.options.${optionIndex}.label`, message: "Option label is required." });
      if (labels.has(label)) issues.push({ code: "DUPLICATE_OPTION", path: `${base}.options.${optionIndex}.label`, message: "Option labels must be unique." });
      labels.add(label);
    }

    if (!optionIdSet.has(question.correctOptionId)) {
      issues.push({ code: "INVALID_CORRECT_OPTION", path: `${base}.correctOptionId`, message: "Correct option must identify one of the four options." });
    }
    if (!question.explanation.trim()) issues.push({ code: "EXPLANATION_REQUIRED", path: `${base}.explanation`, message: "A grounded explanation is required." });
    if (!question.topic.trim()) issues.push({ code: "TOPIC_REQUIRED", path: `${base}.topic`, message: "A topic label is required." });
    if (!supportedBloomLevels.has(question.bloomLevel)) issues.push({ code: "INVALID_BLOOM_LEVEL", path: `${base}.bloomLevel`, message: "Every question must use a supported Bloom taxonomy level." });
    if (!question.sourceChunkIds.length) issues.push({ code: "SOURCE_REQUIRED", path: `${base}.sourceChunkIds`, message: "Every generated question must cite at least one source chunk." });

    const uniqueSources = new Set(question.sourceChunkIds);
    if (uniqueSources.size !== question.sourceChunkIds.length) {
      issues.push({ code: "DUPLICATE_SOURCE", path: `${base}.sourceChunkIds`, message: "Source chunk references must be unique." });
    }
    for (const sourceId of question.sourceChunkIds) {
      if (!allowedChunkIds.has(sourceId)) {
        issues.push({ code: "UNTRUSTED_SOURCE", path: `${base}.sourceChunkIds`, message: "Generated questions may cite only chunks supplied in the owned grounding context." });
      }
    }
  }

  return issues;
}

export function validateTutorAnswer(answer: TutorAnswer, input: TutorInput): AiValidationIssue[] {
  const issues = validateGroundingChunkSet(input.chunks);
  const allowedChunkIds = new Set(input.chunks.map((chunk) => chunk.id));
  if (!input.question.trim()) issues.push({ code: "QUESTION_REQUIRED", path: "question", message: "Tutor question is required." });
  if (!answer.answer.trim()) issues.push({ code: "ANSWER_REQUIRED", path: "answer", message: "Tutor answer is required." });

  if (answer.supported && !answer.sourceChunkIds.length) {
    issues.push({ code: "SOURCE_REQUIRED", path: "sourceChunkIds", message: "Evidence-backed tutor answers must cite at least one supplied source chunk." });
  }
  if (!answer.supported && answer.sourceChunkIds.length) {
    issues.push({ code: "UNSUPPORTED_WITH_CITATIONS", path: "sourceChunkIds", message: "An abstaining tutor answer must not invent source citations." });
  }

  const uniqueSources = new Set(answer.sourceChunkIds);
  if (uniqueSources.size !== answer.sourceChunkIds.length) {
    issues.push({ code: "DUPLICATE_SOURCE", path: "sourceChunkIds", message: "Tutor source references must be unique." });
  }
  for (const sourceId of uniqueSources) {
    if (!allowedChunkIds.has(sourceId)) issues.push({ code: "UNTRUSTED_SOURCE", path: "sourceChunkIds", message: "Tutor answers may cite only supplied grounding chunks." });
  }
  return issues;
}

export function assertValidGeneratedQuiz(draft: GeneratedQuizDraft, input: QuizGenerationInput) {
  const issues = [...validateQuizGenerationInput(input), ...validateGeneratedQuiz(draft, input)];
  if (issues.length) throw new AiContractValidationError(issues);
}

export function assertValidTutorAnswer(answer: TutorAnswer, input: TutorInput) {
  const issues = validateTutorAnswer(answer, input);
  if (issues.length) throw new AiContractValidationError(issues);
}

export class AiContractValidationError extends Error {
  constructor(public readonly issues: AiValidationIssue[]) {
    super("AI_CONTRACT_VALIDATION_FAILED");
    this.name = "AiContractValidationError";
  }
}
