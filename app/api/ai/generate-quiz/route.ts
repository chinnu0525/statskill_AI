import { AiContractValidationError } from "../../../../src/domain/ai";
import { authenticateBearerRequest, ServerAuthError } from "../../../../src/lib/server/supabase-admin";
import { AiContextError, loadQuizGroundingContext } from "../../../../src/services/server/ai-context";
import {
  completeAiGeneration,
  failAiGeneration,
  startAiGeneration,
} from "../../../../src/services/server/ai-generation-ledger";
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
  let authenticatedUserId: string | null = null;
  let generationStarted = false;
  let admin: Awaited<ReturnType<typeof authenticateBearerRequest>>["admin"] | null = null;

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

    const { data: existingAssessment } = await admin
      .from("assessments")
      .select("id,title")
      .eq("generation_id", body.requestId)
      .eq("owner_id", auth.user.id)
      .maybeSingle();
    if (existingAssessment) {
      return Response.json({
        generationId: body.requestId,
        assessmentId: existingAssessment.id,
        title: existingAssessment.title,
        reused: true,
      });
    }

    const { data: existingGeneration } = await admin
      .from("ai_generations")
      .select("status,feature")
      .eq("id", body.requestId)
      .eq("user_id", auth.user.id)
      .maybeSingle();
    if (existingGeneration?.status === "PENDING") return jsonError("GENERATION_IN_PROGRESS", 409);
    if (existingGeneration) return jsonError("REQUEST_ID_ALREADY_USED", 409);

    const { document, chunks } = await loadQuizGroundingContext(admin, auth.user.id, body.documentId);
    const model = configuredGatewayModel();

    await startAiGeneration(admin, {
      id: body.requestId,
      userId: auth.user.id,
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

    const { data: assessmentId, error: persistenceError } = await admin.rpc("persist_generated_assessment", {
      p_generation_id: body.requestId,
      p_owner_id: auth.user.id,
      p_document_id: document.id,
      p_title: generation.value.title,
      p_locale: body.locale,
      p_questions: generation.value.questions,
    });
    if (persistenceError || !assessmentId) throw persistenceError ?? new Error("ASSESSMENT_PERSISTENCE_FAILED");

    try {
      await completeAiGeneration(admin, body.requestId, auth.user.id, {
        usage: generation.usage,
        resultMetadata: {
          assessmentId,
          title: generation.value.title,
          questionCount: generation.value.questions.length,
          responseId: generation.responseId,
          responseModel: generation.responseModel,
        },
      });
    } catch (ledgerError) {
      console.error("Quiz persisted but generation ledger completion failed", ledgerError instanceof Error ? ledgerError.message : "unknown");
    }

    return Response.json({
      generationId: body.requestId,
      assessmentId,
      title: generation.value.title,
      reused: false,
    });
  } catch (error) {
    if (admin && generationId && authenticatedUserId && generationStarted) {
      await failAiGeneration(admin, generationId, authenticatedUserId, safeErrorCode(error));
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
