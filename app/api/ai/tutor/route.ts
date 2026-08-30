import { AiContractValidationError } from "../../../../src/domain/ai";
import { authenticateBearerRequest, ServerAuthError } from "../../../../src/lib/server/supabase-admin";
import { loadTutorGroundingContext } from "../../../../src/services/server/ai-context";
import {
  completeAiGeneration,
  failAiGeneration,
  hashPrivateText,
  startAiGeneration,
} from "../../../../src/services/server/ai-generation-ledger";
import { configuredGatewayModel, VercelAiGatewayProvider } from "../../../../src/services/server/vercel-ai-provider";

export const runtime = "nodejs";

type TutorRequest = {
  requestId: string;
  locale: "en" | "hi" | "te";
  question: string;
};

type StoredTutorResult = {
  answer?: unknown;
  supported?: unknown;
  sourceChunkIds?: unknown;
  responseId?: unknown;
  responseModel?: unknown;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseRequest(value: unknown): TutorRequest | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const body = value as Record<string, unknown>;
  const keys = Object.keys(body);
  if (keys.some((key) => !["requestId", "locale", "question"].includes(key))) return null;
  if (typeof body.requestId !== "string" || !uuidPattern.test(body.requestId)) return null;
  if (body.locale !== "en" && body.locale !== "hi" && body.locale !== "te") return null;
  if (typeof body.question !== "string") return null;
  const question = body.question.trim();
  if (!question || question.length > 1200) return null;
  return { requestId: body.requestId, locale: body.locale, question };
}

function jsonError(code: string, status: number) {
  return Response.json({ error: code }, { status });
}

function unsupportedAnswer(locale: "en" | "hi" | "te") {
  if (locale === "hi") return "अपलोड की गई सामग्री में इस प्रश्न का समर्थन करने के लिए पर्याप्त जानकारी नहीं मिली।";
  if (locale === "te") return "అప్‌లోడ్ చేసిన మెటీరియల్‌లో ఈ ప్రశ్నకు మద్దతు ఇచ్చేంత సమాచారం దొరకలేదు.";
  return "The uploaded learning material does not contain enough evidence to answer this question.";
}

function readStoredResult(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const result = value as StoredTutorResult;
  if (typeof result.answer !== "string" || typeof result.supported !== "boolean" || !Array.isArray(result.sourceChunkIds)) return null;
  if (!result.sourceChunkIds.every((item) => typeof item === "string")) return null;
  return {
    answer: result.answer,
    supported: result.supported,
    sourceChunkIds: result.sourceChunkIds as string[],
  };
}

function safeErrorCode(error: unknown) {
  if (error instanceof AiContractValidationError) return "AI_OUTPUT_VALIDATION_FAILED";
  if (error instanceof Error && error.message === "AI_GATEWAY_MODEL_NOT_CONFIGURED") return "AI_GATEWAY_NOT_CONFIGURED";
  if (error instanceof Error && error.message === "AI_GATEWAY_AUTH_NOT_CONFIGURED") return "AI_GATEWAY_AUTH_NOT_CONFIGURED";
  return "AI_TUTOR_FAILED";
}

export async function POST(request: Request) {
  let admin: Awaited<ReturnType<typeof authenticateBearerRequest>>["admin"] | null = null;
  let generationId: string | null = null;
  let authenticatedUserId: string | null = null;
  let generationStarted = false;

  try {
    const auth = await authenticateBearerRequest(request);
    admin = auth.admin;
    authenticatedUserId = auth.user.id;

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return jsonError("INVALID_JSON", 400);
    }
    const body = parseRequest(rawBody);
    if (!body) return jsonError("INVALID_REQUEST", 400);
    generationId = body.requestId;

    const { data: existing } = await admin
      .from("ai_generations")
      .select("status,feature,result_metadata")
      .eq("id", body.requestId)
      .eq("user_id", auth.user.id)
      .maybeSingle();

    if (existing?.feature && existing.feature !== "TUTOR") return jsonError("REQUEST_ID_ALREADY_USED", 409);
    if (existing?.status === "PENDING") return jsonError("GENERATION_IN_PROGRESS", 409);
    if (existing?.status === "COMPLETE") {
      const stored = readStoredResult(existing.result_metadata);
      if (stored) return Response.json({ generationId: body.requestId, ...stored, reused: true });
      return jsonError("GENERATION_RESULT_UNAVAILABLE", 409);
    }
    if (existing) return jsonError("REQUEST_ID_ALREADY_USED", 409);

    const chunks = await loadTutorGroundingContext(admin, auth.user.id, body.question);
    if (!chunks.length) {
      return Response.json({
        generationId: body.requestId,
        supported: false,
        answer: unsupportedAnswer(body.locale),
        sourceChunkIds: [],
        reused: false,
      });
    }

    const model = configuredGatewayModel();
    await startAiGeneration(admin, {
      id: body.requestId,
      userId: auth.user.id,
      feature: "TUTOR",
      model,
      requestMetadata: {
        locale: body.locale,
        questionHash: hashPrivateText(body.question),
        contextChunkIds: chunks.map((chunk) => chunk.id),
      },
    });
    generationStarted = true;

    const provider = new VercelAiGatewayProvider(auth.user.id);
    const generation = await provider.answerTutorWithMetadata({
      locale: body.locale,
      question: body.question,
      chunks,
    });

    const resultMetadata = {
      answer: generation.value.answer,
      supported: generation.value.supported,
      sourceChunkIds: generation.value.sourceChunkIds,
      responseId: generation.responseId,
      responseModel: generation.responseModel,
    };

    try {
      await completeAiGeneration(admin, body.requestId, auth.user.id, {
        usage: generation.usage,
        resultMetadata,
      });
    } catch (ledgerError) {
      console.error("Tutor answer generated but ledger completion failed", ledgerError instanceof Error ? ledgerError.message : "unknown");
    }

    return Response.json({
      generationId: body.requestId,
      answer: generation.value.answer,
      supported: generation.value.supported,
      sourceChunkIds: generation.value.sourceChunkIds,
      reused: false,
    });
  } catch (error) {
    if (admin && generationId && authenticatedUserId && generationStarted) {
      await failAiGeneration(admin, generationId, authenticatedUserId, safeErrorCode(error));
    }
    if (error instanceof ServerAuthError) return jsonError(error.message, error.status);
    if (error instanceof AiContractValidationError) return jsonError("AI_OUTPUT_VALIDATION_FAILED", 422);
    if (error instanceof Error && error.message === "AI_GATEWAY_MODEL_NOT_CONFIGURED") return jsonError("AI_GATEWAY_NOT_CONFIGURED", 503);
    if (error instanceof Error && error.message === "AI_GATEWAY_AUTH_NOT_CONFIGURED") return jsonError("AI_GATEWAY_AUTH_NOT_CONFIGURED", 503);
    console.error("Tutor request failed", error instanceof Error ? error.message : "unknown");
    return jsonError("AI_TUTOR_FAILED", 500);
  }
}
