import type { Locale } from "../i18n/messages";
import { createClient } from "../lib/supabase/client";

export type FrameworkItem = {
  id: string;
  code: string;
  name: string;
  domainCode: string;
  domainName: string;
  currentScore: number | null;
  targetScore: number;
  currentLevel: number | null;
  requiredLevel: number;
  gapScore: number;
  priority: "NONE" | "MODERATE" | "HIGH" | "CRITICAL" | null;
  assessedAt: string | null;
};

export type LatestAssessmentInsight = {
  id: string;
  title: string;
  competencyName: string;
  score: number;
  completedAt: string;
} | null;

export type LearnerProfileUpdate = {
  fullName: string;
  designation: string;
  department: string;
  cadre: string;
  assignment: string;
  qualification: string;
  experienceYears: number | null;
  priorTraining: string;
};

export type ReportRow = Record<string, string | number>;
export type LearnerReports = {
  competency: ReportRow[];
  assessment: ReportRow[];
  learning: ReportRow[];
};

type CompetencyRow = {
  id: string;
  code: string;
  name: string;
  competency_domains: { code?: string | null; name?: string | null } | null;
};

type ScoreRow = {
  competency_id: string;
  score: number | string;
  assessed_at: string | null;
  current_level: number | string;
  required_level: number | string;
};

type GapRow = {
  competency_id: string;
  gap_score: number | string;
  priority: "NONE" | "MODERATE" | "HIGH" | "CRITICAL";
};

function localizedTitle(localizations: Array<{ locale: string; title: string }> | null | undefined, locale: Locale) {
  const items = localizations ?? [];
  return items.find((item) => item.locale === locale)?.title
    ?? items.find((item) => item.locale === "en")?.title
    ?? items[0]?.title
    ?? "Learning module";
}

async function currentUser() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("AUTH_REQUIRED");
  return { supabase, user: data.user };
}

export async function loadCompetencyFramework(): Promise<FrameworkItem[]> {
  const { supabase, user } = await currentUser();
  const [competencyResult, scoreResult, gapResult] = await Promise.all([
    supabase.from("competencies").select("id,code,name,competency_domains(code,name)").order("code"),
    supabase.from("user_competencies").select("competency_id,score,current_level,required_level,assessed_at").eq("user_id", user.id),
    supabase.from("skill_gaps").select("competency_id,gap_score,priority").eq("user_id", user.id),
  ]);

  const firstError = [competencyResult.error, scoreResult.error, gapResult.error].find(Boolean);
  if (firstError) throw firstError;

  const scores = new Map(((scoreResult.data ?? []) as ScoreRow[]).map((item) => [item.competency_id, item]));
  const gaps = new Map(((gapResult.data ?? []) as GapRow[]).map((item) => [item.competency_id, item]));

  return ((competencyResult.data ?? []) as unknown as CompetencyRow[]).map((item) => {
    const score = scores.get(item.id);
    const gap = gaps.get(item.id);
    const currentScore = score ? Number(score.score) : null;
    const targetScore = 70;
    const gapScore = gap ? Number(gap.gap_score) : currentScore === null ? targetScore : Math.max(0, targetScore - currentScore);
    return {
      id: item.id,
      code: item.code,
      name: item.name,
      domainCode: item.competency_domains?.code ?? "OTHER",
      domainName: item.competency_domains?.name ?? "Other competencies",
      currentScore,
      targetScore,
      currentLevel: score ? Number(score.current_level) : null,
      requiredLevel: score ? Number(score.required_level) : 3,
      gapScore,
      priority: gap?.priority ?? null,
      assessedAt: score?.assessed_at ?? null,
    };
  });
}

export async function loadLatestAssessmentInsight(): Promise<LatestAssessmentInsight> {
  const { supabase, user } = await currentUser();
  const { data, error } = await supabase
    .from("assessment_attempts")
    .select("id,score,completed_at,assessments(title,competencies(name))")
    .eq("user_id", user.id)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(1);
  if (error) throw error;
  const row: any = data?.[0];
  if (!row?.completed_at || row.score === null || row.score === undefined) return null;
  return {
    id: row.id,
    title: row.assessments?.title ?? "Assessment",
    competencyName: row.assessments?.competencies?.name ?? "General competency",
    score: Number(row.score),
    completedAt: row.completed_at,
  };
}

export async function updateLearnerProfile(input: LearnerProfileUpdate) {
  const { supabase, user } = await currentUser();
  const cleanExperience = input.experienceYears === null
    ? null
    : Math.max(0, Math.min(60, Math.round(input.experienceYears)));
  const metadata = {
    ...(user.user_metadata ?? {}),
    full_name: input.fullName.trim(),
    designation: input.designation.trim(),
    department: input.department.trim(),
    cadre: input.cadre.trim(),
    assignment: input.assignment.trim(),
    qualification: input.qualification.trim(),
    experience_years: cleanExperience,
    prior_training: input.priorTraining.trim(),
  };

  const { error: authError } = await supabase.auth.updateUser({ data: metadata });
  if (authError) throw authError;

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: input.fullName.trim(),
      department: input.department.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (profileError) throw profileError;
}

export async function loadLearnerReports(locale: Locale): Promise<LearnerReports> {
  const { supabase, user } = await currentUser();
  const [framework, attemptsResult, enrollmentResult] = await Promise.all([
    loadCompetencyFramework(),
    supabase
      .from("assessment_attempts")
      .select("score,completed_at,assessments(title,competencies(name))")
      .eq("user_id", user.id)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false }),
    supabase
      .from("learning_enrollments")
      .select("status,progress,completed_at,courses(code,competencies(name),course_localizations(locale,title))")
      .eq("user_id", user.id)
      .order("progress", { ascending: false }),
  ]);

  const firstError = [attemptsResult.error, enrollmentResult.error].find(Boolean);
  if (firstError) throw firstError;

  const competency: ReportRow[] = framework.map((item) => ({
    code: item.code,
    competency: item.name,
    domain: item.domainName,
    current_score: item.currentScore ?? "Not assessed",
    target_score: item.targetScore,
    current_level: item.currentLevel ?? "Not assessed",
    required_level: item.requiredLevel,
    gap_score: item.gapScore,
    priority: item.priority ?? "UNMEASURED",
    assessed_at: item.assessedAt ?? "",
  }));

  const assessment: ReportRow[] = (attemptsResult.data ?? []).map((row: any) => ({
    assessment: row.assessments?.title ?? "Assessment",
    competency: row.assessments?.competencies?.name ?? "General competency",
    score: Number(row.score ?? 0),
    completed_at: row.completed_at ?? "",
  }));

  const learning: ReportRow[] = (enrollmentResult.data ?? []).map((row: any) => ({
    code: row.courses?.code ?? "",
    learning_item: localizedTitle(row.courses?.course_localizations, locale),
    competency: row.courses?.competencies?.name ?? "Role capability",
    status: row.status,
    progress: Number(row.progress ?? 0),
    completed_at: row.completed_at ?? "",
  }));

  return { competency, assessment, learning };
}
