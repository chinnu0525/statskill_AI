import type { Locale } from "../i18n/messages";
import { createClient } from "../lib/supabase/client";

export type RecommendationBreakdown = {
  gap: number;
  role: number;
  career: number;
  department: number;
  priorLearning: number;
  demand: number;
};

export type AdvisorRecommendation = {
  id: string;
  title: string;
  sourceSystem: string;
  competencyName: string;
  score: number;
  reason: string;
  isMock: boolean;
  url: string | null;
  breakdown: RecommendationBreakdown;
};

type GapRow = {
  competency_id: string;
  gap_score: number | string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  competencies: { code?: string | null; name?: string | null } | null;
};

type CourseRow = {
  id: string;
  source_system: string;
  competency_id: string | null;
  level: string | null;
  duration_minutes: number | null;
  competencies: { code?: string | null; name?: string | null } | null;
  course_localizations: Array<{ locale: string; title: string }> | null;
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

const weights = {
  gap: 0.30,
  role: 0.20,
  career: 0.15,
  department: 0.15,
  priorLearning: 0.10,
  demand: 0.10,
} as const;

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function weightedScore(parts: RecommendationBreakdown) {
  return Math.round(
    parts.gap * weights.gap
      + parts.role * weights.role
      + parts.career * weights.career
      + parts.department * weights.department
      + parts.priorLearning * weights.priorLearning
      + parts.demand * weights.demand,
  );
}

function stringMetadata(metadata: Record<string, unknown> | null, key: string) {
  const value = metadata?.[key];
  return typeof value === "string" ? value.trim() : "";
}

function normalizedText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function gapSignal(priority: GapRow["priority"] | undefined, gapScore: number) {
  if (!priority) return 30;
  if (priority === "HIGH") return clamp(85 + gapScore / 3);
  if (priority === "MEDIUM") return clamp(65 + gapScore / 3);
  return clamp(45 + gapScore / 4);
}

function buildBreakdown({
  gap,
  hasAssignment,
  hasDepartment,
  alreadyTrained,
  external,
}: {
  gap?: GapRow;
  hasAssignment: boolean;
  hasDepartment: boolean;
  alreadyTrained: boolean;
  external: boolean;
}): RecommendationBreakdown {
  const gapScore = Number(gap?.gap_score ?? 0);
  return {
    gap: gapSignal(gap?.priority, gapScore),
    role: gap ? 88 : 62,
    career: hasAssignment ? (gap ? 82 : 68) : 58,
    department: hasDepartment ? (gap ? 80 : 66) : 56,
    priorLearning: alreadyTrained ? 42 : 78,
    demand: external ? 82 : 72,
  };
}

function localizationTitle(localizations: CourseRow["course_localizations"], locale: Locale) {
  const items = localizations ?? [];
  return items.find((item) => item.locale === locale)?.title
    ?? items.find((item) => item.locale === "en")?.title
    ?? items[0]?.title
    ?? "Learning module";
}

function externalGap(row: ExternalRow, gaps: GapRow[]) {
  const competencyId = stringMetadata(row.metadata, "competency_id");
  if (competencyId) {
    const byId = gaps.find((gap) => gap.competency_id === competencyId);
    if (byId) return byId;
  }

  const competencyCode = normalizedText(stringMetadata(row.metadata, "competency_code"));
  if (competencyCode) {
    const byCode = gaps.find((gap) => normalizedText(gap.competencies?.code ?? "") === competencyCode);
    if (byCode) return byCode;
  }

  const competencyName = normalizedText(stringMetadata(row.metadata, "competency_name"));
  const title = normalizedText(row.title);
  return gaps.find((gap) => {
    const gapName = normalizedText(gap.competencies?.name ?? "");
    if (!gapName) return false;
    return competencyName.includes(gapName) || gapName.includes(competencyName) || title.includes(gapName);
  });
}

function isMockSource(sourceSystem: string) {
  const source = sourceSystem.toUpperCase();
  return source.includes("MOCK") || source.includes("DEMO");
}

export async function loadAdvisorRecommendations(locale: Locale, limit = 6): Promise<AdvisorRecommendation[]> {
  const supabase = createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw new Error("AUTH_REQUIRED");

  const userId = authData.user.id;
  const [gapResult, courseResult, externalResult, enrollmentResult] = await Promise.all([
    supabase
      .from("skill_gaps")
      .select("competency_id,gap_score,priority,competencies(code,name)")
      .eq("user_id", userId)
      .order("gap_score", { ascending: false }),
    supabase
      .from("courses")
      .select("id,source_system,competency_id,level,duration_minutes,competencies(code,name),course_localizations(locale,title)"),
    supabase
      .from("external_catalog_items")
      .select("id,source_system,external_id,title,locale,url,metadata"),
    supabase
      .from("learning_enrollments")
      .select("course_id,status")
      .eq("user_id", userId),
  ]);

  const firstError = [gapResult.error, courseResult.error, externalResult.error, enrollmentResult.error].find(Boolean);
  if (firstError) throw firstError;

  const gaps = (gapResult.data ?? []) as unknown as GapRow[];
  const courses = (courseResult.data ?? []) as unknown as CourseRow[];
  const externalRows = (externalResult.data ?? []) as unknown as ExternalRow[];
  const enrolledIds = new Set((enrollmentResult.data ?? []).map((item) => item.course_id));
  const metadata = (authData.user.user_metadata ?? {}) as Record<string, unknown>;
  const hasAssignment = Boolean(typeof metadata.assignment === "string" && metadata.assignment.trim());
  const hasDepartment = Boolean(typeof metadata.department === "string" && metadata.department.trim());
  const priorTraining = normalizedText(typeof metadata.prior_training === "string" ? metadata.prior_training : "");

  const localRecommendations: AdvisorRecommendation[] = courses.map((course) => {
    const gap = gaps.find((item) => item.competency_id === course.competency_id);
    const competencyName = course.competencies?.name ?? "Role capability";
    const alreadyTrained = enrolledIds.has(course.id) || (priorTraining && normalizedText(competencyName).split(" ").some((term) => term.length > 3 && priorTraining.includes(term)));
    const breakdown = buildBreakdown({ gap, hasAssignment, hasDepartment, alreadyTrained: Boolean(alreadyTrained), external: false });
    const score = weightedScore(breakdown);
    return {
      id: course.id,
      title: localizationTitle(course.course_localizations, locale),
      sourceSystem: course.source_system,
      competencyName,
      score,
      reason: gap
        ? `Addresses your ${gap.priority.toLowerCase()}-priority ${competencyName} gap (${Math.round(Number(gap.gap_score))} points).`
        : `Relevant to ${competencyName} for your current role profile.`,
      isMock: isMockSource(course.source_system),
      url: null,
      breakdown,
    };
  });

  const externalByIdentity = new Map<string, ExternalRow>();
  for (const row of externalRows) {
    const key = `${row.source_system}:${row.external_id}`;
    const current = externalByIdentity.get(key);
    if (!current || row.locale === locale || (current.locale !== locale && row.locale === "en")) externalByIdentity.set(key, row);
  }

  const externalRecommendations: AdvisorRecommendation[] = [...externalByIdentity.values()].map((row) => {
    const gap = externalGap(row, gaps);
    const competencyName = gap?.competencies?.name
      ?? stringMetadata(row.metadata, "competency_name")
      ?? "Role capability";
    const alreadyTrained = Boolean(priorTraining && normalizedText(competencyName).split(" ").some((term) => term.length > 3 && priorTraining.includes(term)));
    const breakdown = buildBreakdown({ gap, hasAssignment, hasDepartment, alreadyTrained, external: true });
    const score = weightedScore(breakdown);
    return {
      id: row.id,
      title: row.title,
      sourceSystem: row.source_system,
      competencyName,
      score,
      reason: gap
        ? `Mapped to your ${gap.priority.toLowerCase()}-priority ${competencyName} gap (${Math.round(Number(gap.gap_score))} points).`
        : `Catalog item relevant to the current role profile; no measured matching gap was found.`,
      isMock: isMockSource(row.source_system),
      url: row.url,
      breakdown,
    };
  });

  return [...localRecommendations, ...externalRecommendations]
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, Math.max(1, Math.min(limit, 12)));
}
