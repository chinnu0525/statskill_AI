import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { NormalizedAiUsage } from "./vercel-ai-provider";

export type GenerationFeature = "QUIZ" | "TUTOR";

export function hashPrivateText(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function startAiGeneration(
  client: SupabaseClient,
  input: {
    id: string;
    feature: GenerationFeature;
    sourceDocumentId?: string | null;
    model: string;
    requestMetadata?: Record<string, unknown>;
  },
) {
  const { error } = await client.rpc("begin_my_ai_generation", {
    p_generation_id: input.id,
    p_feature: input.feature,
    p_source_document_id: input.sourceDocumentId ?? null,
    p_model: input.model,
    p_request_metadata: input.requestMetadata ?? {},
  });
  if (error) throw error;
}

export async function completeAiGeneration(
  client: SupabaseClient,
  id: string,
  input: {
    usage: NormalizedAiUsage;
    resultMetadata: Record<string, unknown>;
  },
) {
  const { error } = await client.rpc("complete_my_ai_generation", {
    p_generation_id: id,
    p_token_usage: input.usage,
    p_result_metadata: input.resultMetadata,
  });
  if (error) throw error;
}

export async function failAiGeneration(client: SupabaseClient, id: string, errorCode: string) {
  const { error } = await client.rpc("fail_my_ai_generation", {
    p_generation_id: id,
    p_error_code: errorCode.slice(0, 120),
  });
  if (error) console.error("AI generation ledger error update failed", error.message);
}
