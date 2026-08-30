import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { NormalizedAiUsage } from "./vercel-ai-provider";

export type GenerationFeature = "QUIZ" | "TUTOR";

export function hashPrivateText(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function startAiGeneration(
  admin: SupabaseClient,
  input: {
    id: string;
    userId: string;
    feature: GenerationFeature;
    sourceDocumentId?: string | null;
    model: string;
    requestMetadata?: Record<string, unknown>;
  },
) {
  const { error } = await admin.from("ai_generations").insert({
    id: input.id,
    user_id: input.userId,
    feature: input.feature,
    source_document_id: input.sourceDocumentId ?? null,
    model: input.model,
    status: "PENDING",
    request_metadata: input.requestMetadata ?? {},
  });
  if (error) throw error;
}

export async function completeAiGeneration(
  admin: SupabaseClient,
  id: string,
  input: {
    usage: NormalizedAiUsage;
    resultMetadata: Record<string, unknown>;
  },
) {
  const { error } = await admin
    .from("ai_generations")
    .update({
      status: "COMPLETE",
      token_usage: input.usage,
      result_metadata: input.resultMetadata,
      error_code: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
}

export async function failAiGeneration(admin: SupabaseClient, id: string, errorCode: string) {
  const { error } = await admin
    .from("ai_generations")
    .update({
      status: "ERROR",
      error_code: errorCode.slice(0, 120),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) console.error("AI generation ledger error update failed", error.message);
}
