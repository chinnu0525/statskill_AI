import { AiContractValidationError } from "../../../../src/domain/ai";
import { authenticateBearerRequest, ServerAuthError } from "../../../../src/lib/server/supabase-request";
import { AiContextError, loadQuizGroundingContext } from "../../../../src/services/server/ai-context";
import { failAiGeneration, startAiGeneration } from "../../../../src/services/server/ai-generation-ledger";
import { configuredGatewayModel, VercelAiGatewayProvider } from "../../../../src/services/server/vercel-ai-provider";

export const runtime = "nodejs";

type GenerateQuizRequest = {
  requestId: string;
  documentId: string;
  locale: "en" | "hi" | "te";
  questionCount: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseRequest(value: unknown): GenerateQuizRequest | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const body = value as Record<string, unknown>;
  const keys = Object.keys(body);
  if (keys.some((key) => !["requestId", "documentId", "locale", "questionCount", "difficulty"].includes(key))) return null;
  if (typeof body.requestId !== "string" || !uuidPattern.test(body.requestId)) return null;
  if (typeof body.documentId !== "string" || !uuidPattern.test(body.documentId)) return null;
  if (body.locale !== "en" && body.locale !== "hi" && body.locale !== "te") return null;
  if (!Number.isInteger(body.questionCount) || (body.questionCount as number) < 1 || (body.questionCount as number) > 20) return null;
  if (body.difficulty !== "EASY" && body.difficulty !== "MEDIUM" && body.difficulty !== "HARD") return null;
  return body as GenerateQuizRequest;
}

function jsonError(code: string, status: number) {
  return Response.json({ error: code }, { status });
}

function safeErrorCode(error: unknown) {
  if (error instanceof AiContractValidationError) return "AI_OUTPUT_VALIDATION_FAILED";
  if (error instanceof Error && error.message === "AI_GATEWAY_MODEL_NOT_CONFIGURED") return "AI_GATEWAY_NOT_CONFIGURED";
  if (error instanceof Error && error.message === "AI_GATEWAY_AUTH_NOT_CONFIGURED") return "AI_GATEWAY_AUTH_NOT_CONFIGURED";
  return "AI_QUIZ_GENERATION_FAILED";
}

export async function POST(request: Request) {
  let generationId: string | null = null;
  let generationStarted = false;
  let supabase: Awaited<ReturnType<typeof authenticateBearerRequest>>["supabase"] | null = null;

  try {
    const auth = await authenticateBearerRequest(request);
    supabase = auth.supabase;

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return jsonError("INVALID_JSON", 400);
    }

    const body = parseRequest(rawBody);
    if (!body) return jsonError("INVALID_REQUEST", 400);
    generationId = body.requestId;

    const { data: existingAssessment } = await supabase
      .from("assessments")
      .select("id,title")
      .eq("generation_id", body.requestId)
      .maybeSingle();
    if (existingAssessment) {
      return Response.json({
        generationId: body.requestId,
        assessmentId: existingAssessment.id,
        title: existingAssessment.title,
        reused: true,
      });
    }

    const { data: existingGeneration } = await supabase
      .from("ai_generations")
      .select("status,feature")
      .eq("id", body.requestId)
      .maybeSingle();
    if (existingGeneration?.feature && existingGeneration.feature !== "QUIZ") return jsonError("REQUEST_ID_ALREADY_USED", 409);
    if (existingGeneration?.status === "PENDING") return jsonError("GENERATION_IN_PROGRESS", 409);
    if (existingGeneration?.status === "COMPLETE") return jsonError("REQUEST_ID_ALREADY_USED", 409);

    const { document, chunks } = await loadQuizGroundingContext(supabase, body.documentId);
    const model = configuredGatewayModel();

    await startAiGeneration(supabase, {
      id: body.requestId,
      feature: "QUIZ",
      sourceDocumentId: document.id,
      model,
      requestMetadata: {
        locale: body.locale,
        questionCount: body.questionCount,
        difficulty: body.difficulty,
        contextChunkIds: chunks.map((chunk) => chunk.id),
      },
    });
    generationStarted = true;

    const provider = new VercelAiGatewayProvider(auth.user.id);
    const generation = await provider.generateQuizWithMetadata({
      documentId: document.id,
      locale: body.locale,
      questionCount: body.questionCount,
      difficulty: body.difficulty,
      competencyId: null,
      chunks,
    });

    const { data: assessmentId, error: persistenceError } = await supabase.rpc("persist_my_generated_assessment", {
      p_generation_id: body.requestId,
      p_document_id: document.id,
      p_title: generation.value.title,
      p_locale: body.locale,
      p_questions: generation.value.questions,
      p_token_usage: generation.usage,
      p_result_metadata: {
        responseId: generation.responseId,
        responseModel: generation.responseModel,
      },
    });
    if (persistenceError || !assessmentId) throw persistenceError ?? new Error("ASSESSMENT_PERSISTENCE_FAILED");

    return Response.json({
      generationId: body.requestId,
      assessmentId,
      title: generation.value.title,
      reused: false,
    });
  } catch (error) {
    if (supabase && generationId && generationStarted) {
      await failAiGeneration(supabase, generationId, safeErrorCode(error));
    }
    if (error instanceof ServerAuthError) return jsonError(error.message, error.status);
    if (error instanceof AiContextError) return jsonError(error.message, error.status);
    if (error instanceof AiContractValidationError) return jsonError("AI_OUTPUT_VALIDATION_FAILED", 422);
    if (error instanceof Error && error.message === "AI_GATEWAY_MODEL_NOT_CONFIGURED") return jsonError("AI_GATEWAY_NOT_CONFIGURED", 503);
    if (error instanceof Error && error.message === "AI_GATEWAY_AUTH_NOT_CONFIGURED") return jsonError("AI_GATEWAY_AUTH_NOT_CONFIGURED", 503);
    console.error("Quiz generation failed", error instanceof Error ? error.message : "unknown");
    return jsonError("AI_QUIZ_GENERATION_FAILED", 500);
  }
}
