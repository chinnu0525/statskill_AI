import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.112.4";

const jsonHeaders = { "Content-Type": "application/json" };

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405, headers: jsonHeaders });

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: jsonHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return new Response(JSON.stringify({ error: "server_not_configured" }), { status: 500, headers: jsonHeaders });

  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: jsonHeaders });

  let body: { assessmentId?: string; answers?: Array<{ questionId: string; answer: string }> };
  try { body = await req.json(); } catch { return new Response(JSON.stringify({ error: "invalid_json" }), { status: 400, headers: jsonHeaders }); }
  if (!body.assessmentId || !Array.isArray(body.answers)) return new Response(JSON.stringify({ error: "invalid_request" }), { status: 400, headers: jsonHeaders });

  const { data: assessment, error: assessmentError } = await admin
    .from("assessments")
    .select("id,competency_id,owner_id,review_status")
    .eq("id", body.assessmentId)
    .single();
  if (assessmentError || !assessment) return new Response(JSON.stringify({ error: "assessment_not_found" }), { status: 404, headers: jsonHeaders });
  if (assessment.owner_id && assessment.owner_id !== userData.user.id && assessment.review_status !== "APPROVED") {
    return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: jsonHeaders });
  }

  const { data: questions, error: questionsError } = await admin.from("questions").select("id,bloom_weight").eq("assessment_id", body.assessmentId);
  if (questionsError || !questions?.length) return new Response(JSON.stringify({ error: "assessment_has_no_questions" }), { status: 400, headers: jsonHeaders });

  const questionIds = questions.map((question) => question.id);
  const { data: answerKeys, error: answerError } = await admin.from("question_answers").select("question_id,correct_answer").in("question_id", questionIds);
  if (answerError || !answerKeys) return new Response(JSON.stringify({ error: "scoring_unavailable" }), { status: 500, headers: jsonHeaders });

  const submitted = new Map(body.answers.map((item) => [item.questionId, item.answer]));
  const keyByQuestion = new Map(answerKeys.map((item) => [item.question_id, item.correct_answer]));
  let correct = 0;
  let earnedWeight = 0;
  let possibleWeight = 0;
  for (const question of questions) {
    const weight = Math.max(0.5, Number(question.bloom_weight ?? 1));
    possibleWeight += weight;
    if (submitted.get(question.id) === keyByQuestion.get(question.id)) {
      correct += 1;
      earnedWeight += weight;
    }
  }

  const score = Math.round((earnedWeight / possibleWeight) * 10000) / 100;
  const { data: attempt, error: attemptError } = await admin.from("assessment_attempts").insert({ assessment_id: body.assessmentId, user_id: userData.user.id, score, completed_at: new Date().toISOString() }).select("id").single();
  if (attemptError || !attempt) return new Response(JSON.stringify({ error: "attempt_not_saved" }), { status: 500, headers: jsonHeaders });

  if (assessment.competency_id) {
    const { data: existingCompetency, error: existingError } = await admin
      .from("user_competencies")
      .select("current_level,required_level")
      .eq("user_id", userData.user.id)
      .eq("competency_id", assessment.competency_id)
      .maybeSingle();
    if (existingError) return new Response(JSON.stringify({ error: "competency_read_failed" }), { status: 500, headers: jsonHeaders });

    const previousLevel = Math.max(1, Math.min(5, Number(existingCompetency?.current_level ?? 1)));
    const requiredLevel = Math.max(1, Math.min(5, Number(existingCompetency?.required_level ?? 3)));
    const currentLevel = score >= 80
      ? Math.min(5, previousLevel + 1)
      : score < 60
        ? Math.max(1, previousLevel - 1)
        : previousLevel;
    const levelGap = Math.max(0, requiredLevel - currentLevel);
    const gapScore = levelGap * 25;
    const priority = levelGap === 0 ? "NONE" : levelGap === 1 ? "MODERATE" : levelGap === 2 ? "HIGH" : "CRITICAL";
    const now = new Date().toISOString();
    const { error: competencyError } = await admin.from("user_competencies").upsert({ user_id: userData.user.id, competency_id: assessment.competency_id, score, current_level: currentLevel, required_level: requiredLevel, assessed_at: now }, { onConflict: "user_id,competency_id" });
    if (competencyError) return new Response(JSON.stringify({ error: "competency_update_failed" }), { status: 500, headers: jsonHeaders });

    const { error: gapError } = await admin.from("skill_gaps").upsert({ user_id: userData.user.id, competency_id: assessment.competency_id, priority, gap_score: gapScore, rationale: levelGap > 0 ? `Current level ${currentLevel} is below required level ${requiredLevel}.` : `Required level ${requiredLevel} is met.`, created_at: now }, { onConflict: "user_id,competency_id" });
    if (gapError) return new Response(JSON.stringify({ error: "gap_update_failed" }), { status: 500, headers: jsonHeaders });

    const { error: eventError } = await admin.from("competency_level_events").insert({
      user_id: userData.user.id,
      competency_id: assessment.competency_id,
      assessment_attempt_id: attempt.id,
      previous_level: previousLevel,
      current_level: currentLevel,
      required_level: requiredLevel,
      weighted_score: score,
    });
    if (eventError) return new Response(JSON.stringify({ error: "level_history_failed" }), { status: 500, headers: jsonHeaders });

    return new Response(JSON.stringify({ attemptId: attempt.id, score, correct, total: questionIds.length, previousLevel, currentLevel, requiredLevel, gapPriority: priority }), { status: 200, headers: jsonHeaders });
  }

  return new Response(JSON.stringify({ attemptId: attempt.id, score, correct, total: questionIds.length }), { status: 200, headers: jsonHeaders });
});
