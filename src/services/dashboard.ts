import type { Locale } from "../i18n/messages";
import { createClient } from "../lib/supabase/client";

export type UserRole = "OFFICIAL" | "TRAINER" | "ADMIN" | "SUPER_ADMIN";

export type DashboardGap = {
  name: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  score: number;
};

export type DashboardCourse = {
  id: string;
  title: string;
  progress: number;
};

export type DashboardData = {
  fullName: string;
  role: UserRole;
  competencyScore: number;
  gaps: DashboardGap[];
  courses: DashboardCourse[];
};

export async function loadDashboardData(locale: Locale): Promise<DashboardData> {
  const supabase = createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw new Error("AUTH_REQUIRED");

  const userId = authData.user.id;
  const [profileResult, competencyResult, gapResult, enrollmentResult] = await Promise.all([
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
  ]);

  const firstError = [profileResult.error, competencyResult.error, gapResult.error, enrollmentResult.error].find(Boolean);
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

  return {
    fullName: profileResult.data?.full_name ?? "",
    role: (profileResult.data?.role ?? "OFFICIAL") as UserRole,
    competencyScore,
    gaps,
    courses,
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
