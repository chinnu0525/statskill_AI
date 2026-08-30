import {
  AiContractValidationError,
  type AiDifficulty,
  type GroundingContextChunk,
} from "../domain/ai";
import type { Locale } from "../i18n/messages";
import { createClient } from "../lib/supabase/client";
import { listLearningMaterials, type LearningDocument } from "./documents";
import {
  answerLocalTutor,
  generateLocalQuiz,
  LOCAL_AI_MODEL,
  LocalAiError,
  type LocalAiProgress,
} from "./local-ai";
import { listMyDocumentChunks, searchMyDocumentChunks, type SourceChunk } from "./retrieval";

export type GeneratedQuizResult = {
  generationId: string;
  assessmentId: string;
  title: string;
  reused: boolean;
};

export type TutorResult = {
  generationId: string;
  supported: boolean;
  answer: string;
  sourceChunkIds: string[];
  reused: boolean;
};

export type { LocalAiProgress } from "./local-ai";

export class AiApiError extends Error {
  constructor(public readonly code: string, public readonly status: number) {
    super(code);
    this.name = "AiApiError";
  }
}

function sourceTitle(chunk: SourceChunk) {
  const title = chunk.metadata.source_title;
  return typeof title === "string" && title.trim() ? title.trim() : "Uploaded learning material";
}

function toGroundingChunks(chunks: SourceChunk[]): GroundingContextChunk[] {
  return chunks.map((chunk) => ({
    id: chunk.id,
    documentId: chunk.documentId,
    chunkIndex: chunk.chunkIndex,
    content: chunk.content,
    sourceTitle: sourceTitle(chunk),
  }));
}

function mapLocalError(error: unknown): AiApiError {
  if (error instanceof AiApiError) return error;
  if (error instanceof AiContractValidationError) return new AiApiError("LOCAL_AI_OUTPUT_INVALID", 422);
  if (error instanceof LocalAiError) {
    const status = error.code === "LOCAL_AI_WEBGPU_REQUIRED"
      ? 422
      : error.code === "LOCAL_AI_MODEL_LOAD_FAILED"
        ? 503
        : error.code === "LOCAL_AI_OUTPUT_INVALID"
          ? 422
          : 500;
    return new AiApiError(error.code, status);
  }
  return new AiApiError("LOCAL_AI_FAILED", 500);
}

async function markGenerationFailed(generationId: string, code: string) {
  const supabase = createClient();
  await supabase.rpc("fail_my_ai_generation", {
    p_generation_id: generationId,
    p_error_code: code.slice(0, 120),
  });
}

async function hashPrivateText(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function insufficientEvidence(locale: Locale) {
  if (locale === "hi") return "अपलोड की गई सामग्री में इस प्रश्न का उत्तर देने के लिए पर्याप्त प्रमाण नहीं मिला।";
  if (locale === "te") return "అప్‌లోడ్ చేసిన మెటీరియల్‌లో ఈ ప్రశ్నకు సమాధానం ఇవ్వడానికి తగిన ఆధారం కనబడలేదు.";
  return "The uploaded material does not contain enough evidence to answer this question.";
}

export async function listQuizReadyDocuments(): Promise<LearningDocument[]> {
  const documents = await listLearningMaterials();
  return documents.filter((document) => document.status === "CHUNKED");
}

export async function generateDocumentQuiz(input: {
  documentId: string;
  locale: Locale;
  questionCount: number;
  difficulty: AiDifficulty;
  requestId?: string;
  onProgress?: (progress: LocalAiProgress) => void;
}): Promise<GeneratedQuizResult> {
  const requestId = input.requestId ?? crypto.randomUUID();
  const supabase = createClient();

  const { data: existingAssessment, error: existingError } = await supabase
    .from("assessments")
    .select("id,title")
    .eq("generation_id", requestId)
    .maybeSingle();
  if (existingError) throw new AiApiError("AI_PERSISTENCE_FAILED", 500);
  if (existingAssessment) {
    return {
      generationId: requestId,
      assessmentId: String(existingAssessment.id),
      title: String(existingAssessment.title),
      reused: true,
    };
  }

  const sourceChunks = await listMyDocumentChunks(input.documentId, 8);
  const chunks = toGroundingChunks(sourceChunks);
  if (!chunks.length) throw new AiApiError("LOCAL_AI_GROUNDING_REQUIRED", 422);

  let started = false;
  try {
    const { error: beginError } = await supabase.rpc("begin_my_ai_generation", {
      p_generation_id: requestId,
      p_feature: "QUIZ",
      p_source_document_id: input.documentId,
      p_model: `browser:${LOCAL_AI_MODEL}`,
      p_request_metadata: {
        runtime: "browser-webgpu",
        locale: input.locale,
        questionCount: input.questionCount,
        difficulty: input.difficulty,
        contextChunkIds: chunks.map((chunk) => chunk.id),
      },
    });
    if (beginError) throw new AiApiError("AI_LEDGER_FAILED", 500);
    started = true;

    const generation = await generateLocalQuiz({
      documentId: input.documentId,
      locale: input.locale,
      questionCount: input.questionCount,
      difficulty: input.difficulty,
      competencyId: null,
      chunks,
    }, input.onProgress);

    const { data: assessmentId, error: persistenceError } = await supabase.rpc("persist_my_generated_assessment", {
      p_generation_id: requestId,
      p_document_id: input.documentId,
      p_title: generation.value.title,
      p_locale: input.locale,
      p_questions: generation.value.questions,
      p_token_usage: generation.usage,
      p_result_metadata: {
        runtime: "browser-webgpu",
        responseModel: generation.model,
        privateInference: true,
      },
    });
    if (persistenceError || !assessmentId) throw new AiApiError("AI_PERSISTENCE_FAILED", 500);

    return {
      generationId: requestId,
      assessmentId: String(assessmentId),
      title: generation.value.title,
      reused: false,
    };
  } catch (error) {
    const mapped = mapLocalError(error);
    if (started) await markGenerationFailed(requestId, mapped.code);
    throw mapped;
  }
}

export async function askGroundedTutor(input: {
  locale: Locale;
  question: string;
  requestId?: string;
  onProgress?: (progress: LocalAiProgress) => void;
}): Promise<TutorResult> {
  const requestId = input.requestId ?? crypto.randomUUID();
  const trimmed = input.question.trim();
  if (!trimmed) throw new AiApiError("QUESTION_REQUIRED", 400);

  const sourceChunks = await searchMyDocumentChunks(trimmed, 6);
  const chunks = toGroundingChunks(sourceChunks);
  if (!chunks.length) {
    return {
      generationId: requestId,
      supported: false,
      answer: insufficientEvidence(input.locale),
      sourceChunkIds: [],
      reused: false,
    };
  }

  const supabase = createClient();
  let started = false;
  try {
    const questionHash = await hashPrivateText(trimmed);
    const { error: beginError } = await supabase.rpc("begin_my_ai_generation", {
      p_generation_id: requestId,
      p_feature: "TUTOR",
      p_source_document_id: null,
      p_model: `browser:${LOCAL_AI_MODEL}`,
      p_request_metadata: {
        runtime: "browser-webgpu",
        locale: input.locale,
        questionHash,
        contextChunkIds: chunks.map((chunk) => chunk.id),
      },
    });
    if (beginError) throw new AiApiError("AI_LEDGER_FAILED", 500);
    started = true;

    const generation = await answerLocalTutor({
      locale: input.locale,
      question: trimmed,
      chunks,
    }, input.onProgress);

    const { error: completeError } = await supabase.rpc("complete_my_ai_generation", {
      p_generation_id: requestId,
      p_token_usage: generation.usage,
      p_result_metadata: {
        runtime: "browser-webgpu",
        responseModel: generation.model,
        privateInference: true,
        supported: generation.value.supported,
        sourceChunkIds: generation.value.sourceChunkIds,
      },
    });
    if (completeError) throw new AiApiError("AI_LEDGER_FAILED", 500);

    return {
      generationId: requestId,
      supported: generation.value.supported,
      answer: generation.value.answer,
      sourceChunkIds: generation.value.sourceChunkIds,
      reused: false,
    };
  } catch (error) {
    const mapped = mapLocalError(error);
    if (started) await markGenerationFailed(requestId, mapped.code);
    throw mapped;
  }
}
