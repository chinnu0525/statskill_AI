import type { Locale } from "../i18n/messages";
import { createClient } from "../lib/supabase/client";

export type UserRole = "OFFICIAL" | "TRAINER" | "ADMIN" | "SUPER_ADMIN";

export type DashboardGap = {
  name: string;
  priority: "NONE" | "MODERATE" | "HIGH" | "CRITICAL";
  score: number;
};

export type DashboardCourse = {
  id: string;
  title: string;
  progress: number;
};

export type DashboardProfile = {
  designation: string;
  department: string;
  cadre: string;
  assignment: string;
  qualification: string;
  experienceYears: number | null;
  priorTraining: string;
};

export type DashboardData = {
  fullName: string;
  role: UserRole;
  competencyScore: number;
  gaps: DashboardGap[];
  courses: DashboardCourse[];
  profile: DashboardProfile;
  learningHours: number;
  assessmentsCompleted: number;
};

function metadataString(metadata: Record<string, unknown>, key: string) {
  return typeof metadata[key] === "string" ? String(metadata[key]).trim() : "";
}

export async function loadDashboardData(locale: Locale): Promise<DashboardData> {
  const supabase = createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw new Error("AUTH_REQUIRED");

  const userId = authData.user.id;
  const [profileResult, competencyResult, gapResult, enrollmentResult, learningMetricResult, assessmentMetricResult] = await Promise.all([
    supabase.from("profiles").select("full_name,role").eq("id", userId).single(),
    supabase.from("user_competencies").select("score").eq("user_id", userId),
    supabase
      .from("skill_gaps")
      .select("gap_score,priority,competencies(name)")
      .eq("user_id", userId)
      .order("gap_score", { ascending: false })
      .limit(3),
    supabase
      .from("learning_enrollments")
      .select("course_id,progress,courses(id,course_localizations(locale,title))")
      .eq("user_id", userId)
      .order("progress", { ascending: false })
      .limit(5),
    supabase
      .from("learning_enrollments")
      .select("progress,courses(duration_minutes)")
      .eq("user_id", userId),
    supabase
      .from("assessment_attempts")
      .select("id")
      .eq("user_id", userId)
      .not("completed_at", "is", null),
  ]);

  const firstError = [profileResult.error, competencyResult.error, gapResult.error, enrollmentResult.error, learningMetricResult.error, assessmentMetricResult.error].find(Boolean);
  if (firstError) throw firstError;

  const scores = competencyResult.data ?? [];
  const competencyScore = scores.length
    ? Math.round(scores.reduce((sum, item) => sum + Number(item.score), 0) / scores.length)
    : 0;

  const gaps: DashboardGap[] = (gapResult.data ?? []).map((item: any) => ({
    name: item.competencies?.name ?? "Skill",
    priority: item.priority,
    score: Number(item.gap_score),
  }));

  const courses: DashboardCourse[] = (enrollmentResult.data ?? []).map((item: any) => {
    const localizations = item.courses?.course_localizations ?? [];
    const localized = localizations.find((entry: any) => entry.locale === locale)
      ?? localizations.find((entry: any) => entry.locale === "en")
      ?? localizations[0];

    return {
      id: item.course_id,
      title: localized?.title ?? "Learning module",
      progress: Number(item.progress ?? 0),
    };
  });

  const equivalentMinutes = (learningMetricResult.data ?? []).reduce((sum: number, item: any) => {
    const duration = Number(item.courses?.duration_minutes ?? 0);
    const progress = Math.max(0, Math.min(100, Number(item.progress ?? 0)));
    return sum + duration * (progress / 100);
  }, 0);
  const learningHours = Math.round((equivalentMinutes / 60) * 10) / 10;
  const assessmentsCompleted = (assessmentMetricResult.data ?? []).length;

  const metadata = (authData.user.user_metadata ?? {}) as Record<string, unknown>;
  const experience = metadata.experience_years;

  return {
    fullName: profileResult.data?.full_name ?? metadataString(metadata, "full_name"),
    role: (profileResult.data?.role ?? "OFFICIAL") as UserRole,
    competencyScore,
    gaps,
    courses,
    learningHours,
    assessmentsCompleted,
    profile: {
      designation: metadataString(metadata, "designation"),
      department: metadataString(metadata, "department"),
      cadre: metadataString(metadata, "cadre"),
      assignment: metadataString(metadata, "assignment"),
      qualification: metadataString(metadata, "qualification"),
      experienceYears: typeof experience === "number" && Number.isFinite(experience) ? experience : null,
      priorTraining: metadataString(metadata, "prior_training"),
    },
  };
}

export async function updatePreferredLocale(locale: Locale) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await supabase
    .from("profiles")
    .update({ locale, updated_at: new Date().toISOString() })
    .eq("id", data.user.id);
}
