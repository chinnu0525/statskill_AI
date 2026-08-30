import type { AiDifficulty } from "../domain/ai";
import type { Locale } from "../i18n/messages";
import { createClient } from "../lib/supabase/client";
import { listLearningMaterials, type LearningDocument } from "./documents";

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

export class AiApiError extends Error {
  constructor(public readonly code: string, public readonly status: number) {
    super(code);
    this.name = "AiApiError";
  }
}

async function accessToken() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) throw new AiApiError("AUTH_REQUIRED", 401);
  return data.session.access_token;
}

async function postAi<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const token = await accessToken();
  const response = await fetch(path, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    throw new AiApiError(typeof payload.error === "string" ? payload.error : "AI_REQUEST_FAILED", response.status);
  }
  return payload as T;
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
}): Promise<GeneratedQuizResult> {
  return postAi<GeneratedQuizResult>("/api/ai/generate-quiz", {
    requestId: input.requestId ?? crypto.randomUUID(),
    documentId: input.documentId,
    locale: input.locale,
    questionCount: input.questionCount,
    difficulty: input.difficulty,
  });
}

export async function askGroundedTutor(input: {
  locale: Locale;
  question: string;
  requestId?: string;
}): Promise<TutorResult> {
  return postAi<TutorResult>("/api/ai/tutor", {
    requestId: input.requestId ?? crypto.randomUUID(),
    locale: input.locale,
    question: input.question,
  });
}
