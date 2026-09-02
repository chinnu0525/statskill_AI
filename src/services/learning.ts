import type { Locale } from "../i18n/messages";
import { createClient } from "../lib/supabase/client";

export type LearningPathItem = {
  enrollmentId: string;
  courseId: string;
  title: string;
  competencyName: string;
  sourceSystem: string;
  level: string;
  durationMinutes: number | null;
  progress: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  startedAt: string | null;
  completedAt: string | null;
};

export type ExternalCatalogItem = {
  id: string;
  sourceSystem: string;
  externalId: string;
  title: string;
  url: string | null;
  isMock: boolean;
  competencyName: string;
  level: string;
  durationLabel: string;
  deliveryMode: string;
};

type EnrollmentRow = {
  id: string;
  course_id: string;
  progress: number | string | null;
  status: LearningPathItem["status"];
  started_at: string | null;
  completed_at: string | null;
  courses: {
    id: string;
    source_system: string;
    level: string | null;
    duration_minutes: number | null;
    competencies: { name?: string | null } | null;
    course_localizations: Array<{ locale: string; title: string }> | null;
  } | null;
};

type ExternalRow = {
  id: string;
  source_system: string;
  external_id: string;
  title: string;
  locale: string;
  url: string | null;
  metadata: Record<string, unknown> | null;
};

function localizedCourseTitle(localizations: EnrollmentRow["courses"] extends infer T ? T extends { course_localizations: infer L } ? L : never : never, locale: Locale) {
  const items = (localizations ?? []) as Array<{ locale: string; title: string }>;
  return items.find((item) => item.locale === locale)?.title
    ?? items.find((item) => item.locale === "en")?.title
    ?? items[0]?.title
    ?? "Learning module";
}

function metadataString(metadata: Record<string, unknown> | null, keys: string[]) {
  for (const key of keys) {
    const value = metadata?.[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function isMockSource(sourceSystem: string) {
  const source = sourceSystem.toUpperCase();
  return source.includes("MOCK") || source.includes("DEMO");
}

export async function loadLearningPath(locale: Locale): Promise<LearningPathItem[]> {
  const supabase = createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw new Error("AUTH_REQUIRED");

  const { data, error } = await supabase
    .from("learning_enrollments")
    .select("id,course_id,progress,status,started_at,completed_at,courses(id,source_system,level,duration_minutes,competencies(name),course_localizations(locale,title))")
    .eq("user_id", authData.user.id);
  if (error) throw error;

  return ((data ?? []) as unknown as EnrollmentRow[])
    .map((row) => ({
      enrollmentId: row.id,
      courseId: row.course_id,
      title: localizedCourseTitle(row.courses?.course_localizations ?? [], locale),
      competencyName: row.courses?.competencies?.name ?? "Role capability",
      sourceSystem: row.courses?.source_system ?? "LOCAL",
      level: row.courses?.level ?? "GENERAL",
      durationMinutes: row.courses?.duration_minutes ?? null,
      progress: Math.max(0, Math.min(100, Math.round(Number(row.progress ?? 0)))),
      status: row.status,
      startedAt: row.started_at,
      completedAt: row.completed_at,
    }))
    .sort((a, b) => {
      const statusRank = { IN_PROGRESS: 0, NOT_STARTED: 1, COMPLETED: 2 } as const;
      return statusRank[a.status] - statusRank[b.status]
        || b.progress - a.progress
        || a.title.localeCompare(b.title);
    });
}

export async function updateLearningProgress(
  item: Pick<LearningPathItem, "enrollmentId" | "startedAt">,
  progressValue: number,
  options: { start?: boolean } = {},
) {
  const supabase = createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw new Error("AUTH_REQUIRED");

  const progress = Math.max(0, Math.min(100, Math.round(progressValue)));
  const started = options.start || progress > 0;
  const status: LearningPathItem["status"] = progress >= 100
    ? "COMPLETED"
    : started
      ? "IN_PROGRESS"
      : "NOT_STARTED";
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("learning_enrollments")
    .update({
      progress,
      status,
      started_at: started ? item.startedAt ?? now : null,
      completed_at: status === "COMPLETED" ? now : null,
    })
    .eq("id", item.enrollmentId)
    .eq("user_id", authData.user.id);
  if (error) throw error;
}

export async function loadExternalCatalog(locale: Locale): Promise<ExternalCatalogItem[]> {
  const supabase = createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw new Error("AUTH_REQUIRED");

  const { data, error } = await supabase
    .from("external_catalog_items")
    .select("id,source_system,external_id,title,locale,url,metadata")
    .order("source_system", { ascending: true });
  if (error) throw error;

  const rows = (data ?? []) as unknown as ExternalRow[];
  const selected = new Map<string, ExternalRow>();
  for (const row of rows) {
    const key = `${row.source_system}:${row.external_id}`;
    const current = selected.get(key);
    if (!current || row.locale === locale || (current.locale !== locale && row.locale === "en")) selected.set(key, row);
  }

  return [...selected.values()]
    .map((row) => ({
      id: row.id,
      sourceSystem: row.source_system,
      externalId: row.external_id,
      title: row.title,
      url: row.url,
      isMock: isMockSource(row.source_system),
      competencyName: metadataString(row.metadata, ["competency_name", "competency", "skill"]) || "Official Statistics capability",
      level: metadataString(row.metadata, ["level", "proficiency_level"]) || "General",
      durationLabel: metadataString(row.metadata, ["duration", "duration_label"]) || "Duration not supplied",
      deliveryMode: metadataString(row.metadata, ["delivery_mode", "mode"]) || "Catalog item",
    }))
    .sort((a, b) => a.sourceSystem.localeCompare(b.sourceSystem) || a.title.localeCompare(b.title));
}
