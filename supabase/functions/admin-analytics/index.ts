import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.112.4";

const jsonHeaders = { "Content-Type": "application/json" };
const allowedRoles = new Set(["ADMIN", "SUPER_ADMIN"]);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 100) / 100;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "GET" && req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "unauthorized" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return json({ error: "server_not_configured" }, 500);

  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) return json({ error: "unauthorized" }, 401);

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();
  if (profileError || !profile || !allowedRoles.has(profile.role)) return json({ error: "forbidden" }, 403);
  const now = new Date();
  const quarterStart = new Date(Date.UTC(now.getUTCFullYear(), Math.floor(now.getUTCMonth() / 3) * 3, 1)).toISOString();

  const [
    workforceResult,
    competencyResult,
    assessmentResult,
    gapResult,
    enrollmentResult,
    completedResult,
    quarterlyResult,
  ] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("user_competencies").select("score"),
    admin.from("assessment_attempts").select("score").not("completed_at", "is", null),
    admin.from("skill_gaps").select("gap_score,priority,competencies(name)"),
    admin.from("learning_enrollments").select("id", { count: "exact", head: true }),
    admin.from("learning_enrollments").select("id", { count: "exact", head: true }).eq("status", "COMPLETED"),
    admin.from("competency_level_events").select("previous_level,current_level,required_level,created_at,profiles(department)").gte("created_at", quarterStart),
  ]);

  const firstError = [
    workforceResult.error,
    competencyResult.error,
    assessmentResult.error,
    gapResult.error,
    enrollmentResult.error,
    completedResult.error,
    quarterlyResult.error,
  ].find(Boolean);
  if (firstError) {
    console.error("admin analytics query failed", firstError);
    return json({ error: "analytics_unavailable" }, 500);
  }

  const competencyScores = (competencyResult.data ?? []).map((item) => Number(item.score)).filter(Number.isFinite);
  const assessmentScores = (assessmentResult.data ?? []).map((item) => Number(item.score)).filter(Number.isFinite);
  const highPriorityGaps = (gapResult.data ?? []).filter((item) => item.priority === "HIGH" || item.priority === "CRITICAL").length;

  const gapGroups = new Map<string, { count: number; totalGap: number; highCount: number }>();
  for (const row of gapResult.data ?? []) {
    const competency = Array.isArray(row.competencies) ? row.competencies[0] : row.competencies;
    const name = competency?.name ?? "Other";
    const existing = gapGroups.get(name) ?? { count: 0, totalGap: 0, highCount: 0 };
    existing.count += 1;
    existing.totalGap += Number(row.gap_score ?? 0);
    if (row.priority === "HIGH" || row.priority === "CRITICAL") existing.highCount += 1;
    gapGroups.set(name, existing);
  }

  const topGaps = [...gapGroups.entries()]
    .map(([name, value]) => ({
      name,
      affectedLearners: value.count,
      averageGap: Math.round((value.totalGap / Math.max(value.count, 1)) * 100) / 100,
      highPriorityCount: value.highCount,
    }))
    .sort((a, b) => b.averageGap - a.averageGap || b.affectedLearners - a.affectedLearners)
    .slice(0, 5);

  const totalEnrollments = enrollmentResult.count ?? 0;
  const completedEnrollments = completedResult.count ?? 0;
  const completionRate = totalEnrollments
    ? Math.round((completedEnrollments / totalEnrollments) * 10000) / 100
    : 0;
  const quarterlyEvents = quarterlyResult.data ?? [];
  const quarterlyLevelGain = average(quarterlyEvents.map((item) => Number(item.current_level) - Number(item.previous_level)));
  const quarterlyTargetAttainment = quarterlyEvents.length
    ? Math.round((quarterlyEvents.filter((item) => Number(item.current_level) >= Number(item.required_level)).length / quarterlyEvents.length) * 10000) / 100
    : 0;
  const departmentGroups = new Map<string, { events: number; gain: number; met: number }>();
  for (const item of quarterlyEvents) {
    const joinedProfile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
    const department = joinedProfile?.department?.trim() || "Unassigned";
    const group = departmentGroups.get(department) ?? { events: 0, gain: 0, met: 0 };
    group.events += 1;
    group.gain += Number(item.current_level) - Number(item.previous_level);
    if (Number(item.current_level) >= Number(item.required_level)) group.met += 1;
    departmentGroups.set(department, group);
  }
  const departmentProgress = [...departmentGroups.entries()].map(([department, value]) => ({
    department,
    assessedEvents: value.events,
    averageLevelGain: Math.round((value.gain / value.events) * 100) / 100,
    targetAttainment: Math.round((value.met / value.events) * 10000) / 100,
  })).sort((a, b) => b.targetAttainment - a.targetAttainment || b.averageLevelGain - a.averageLevelGain);

  return json({
    workforceCount: workforceResult.count ?? 0,
    averageCompetency: average(competencyScores),
    averageAssessment: average(assessmentScores),
    highPriorityGaps,
    totalEnrollments,
    completedEnrollments,
    completionRate,
    topGaps,
    quarterlyLevelGain,
    quarterlyTargetAttainment,
    quarterlyEventCount: quarterlyEvents.length,
    quarterStart,
    departmentProgress,
  });
});
