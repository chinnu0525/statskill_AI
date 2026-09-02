import { createClient } from "../lib/supabase/client";

export type TrainerMaterial = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
};

export type TrainerAssessment = {
  id: string;
  title: string;
  createdAt: string;
  sourceDocumentTitle: string;
  questionCount: number;
  reviewStatus: "PRIVATE" | "PENDING_REVIEW" | "APPROVED" | "REJECTED";
};

export type TrainerWorkspace = {
  materials: TrainerMaterial[];
  assessments: TrainerAssessment[];
  processedCount: number;
  questionCount: number;
};

export type SystemAdapter = {
  sourceSystem: string;
  mode: "MOCK" | "SEEDED";
  itemCount: number;
};

export type SystemHealth = {
  overallStatus: string;
  supabaseReady: boolean;
  aiRuntime: string;
  aiProviderCredentialRequired: boolean;
  release: string | null;
  adapters: SystemAdapter[];
};

async function authenticatedRole() {
  const supabase = createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw new Error("AUTH_REQUIRED");
  const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", authData.user.id).single();
  if (profileError) throw profileError;
  return { supabase, user: authData.user, role: String(profile?.role ?? "OFFICIAL") };
}

export async function loadTrainerWorkspace(): Promise<TrainerWorkspace> {
  const { supabase, user, role } = await authenticatedRole();
  if (role !== "TRAINER" && role !== "SUPER_ADMIN") throw new Error("FORBIDDEN");

  const [documentResult, assessmentResult] = await Promise.all([
    supabase
      .from("documents")
      .select("id,title,status,created_at")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("assessments")
      .select("id,title,created_at,source_document_id,origin,review_status")
      .eq("owner_id", user.id)
      .eq("origin", "AI_GENERATED")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const firstError = [documentResult.error, assessmentResult.error].find(Boolean);
  if (firstError) throw firstError;

  const documents: TrainerMaterial[] = (documentResult.data ?? []).map((row: any) => ({
    id: row.id,
    title: row.title,
    status: row.status,
    createdAt: row.created_at,
  }));
  const documentTitle = new Map(documents.map((item) => [item.id, item.title]));
  const assessmentRows = assessmentResult.data ?? [];
  const assessmentIds = assessmentRows.map((row) => row.id);
  let questionRows: Array<{ assessment_id: string }> = [];
  if (assessmentIds.length) {
    const { data, error } = await supabase.from("questions").select("assessment_id").in("assessment_id", assessmentIds);
    if (error) throw error;
    questionRows = (data ?? []) as Array<{ assessment_id: string }>;
  }
  const counts = new Map<string, number>();
  for (const row of questionRows) counts.set(row.assessment_id, (counts.get(row.assessment_id) ?? 0) + 1);

  const assessments: TrainerAssessment[] = assessmentRows.map((row: any) => ({
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
    sourceDocumentTitle: row.source_document_id ? documentTitle.get(row.source_document_id) ?? "Learning material" : "Learning material",
    questionCount: counts.get(row.id) ?? 0,
    reviewStatus: row.review_status ?? "PRIVATE",
  }));

  return {
    materials: documents,
    assessments,
    processedCount: documents.filter((item) => item.status === "CHUNKED").length,
    questionCount: questionRows.length,
  };
}

export async function reviewTrainerAssessment(assessmentId: string, status: "APPROVED" | "REJECTED" | "PENDING_REVIEW") {
  const { supabase, role } = await authenticatedRole();
  if (role !== "TRAINER" && role !== "SUPER_ADMIN") throw new Error("FORBIDDEN");
  const { error } = await supabase.rpc("review_my_generated_assessment", {
    p_assessment_id: assessmentId,
    p_status: status,
  });
  if (error) throw error;
}

export async function loadSystemHealth(): Promise<SystemHealth> {
  const { supabase, role } = await authenticatedRole();
  if (role !== "SUPER_ADMIN") throw new Error("FORBIDDEN");

  const [healthResponse, catalogResult] = await Promise.all([
    fetch("/api/health", { cache: "no-store" }),
    supabase.from("external_catalog_items").select("source_system"),
  ]);
  if (catalogResult.error) throw catalogResult.error;

  let health: any = null;
  try { health = await healthResponse.json(); }
  catch { health = null; }

  const sourceCounts = new Map<string, number>();
  for (const row of catalogResult.data ?? []) {
    const source = String(row.source_system ?? "UNKNOWN");
    sourceCounts.set(source, (sourceCounts.get(source) ?? 0) + 1);
  }

  const adapters: SystemAdapter[] = [...sourceCounts.entries()].map(([sourceSystem, itemCount]) => ({
    sourceSystem,
    mode: sourceSystem.toUpperCase().includes("MOCK") || sourceSystem.toUpperCase().includes("DEMO") ? "MOCK" : "SEEDED",
    itemCount,
  }));

  return {
    overallStatus: typeof health?.status === "string" ? health.status : healthResponse.ok ? "ready" : "unavailable",
    supabaseReady: Boolean(health?.checks?.supabase),
    aiRuntime: typeof health?.checks?.aiRuntime === "string" ? health.checks.aiRuntime : "unknown",
    aiProviderCredentialRequired: Boolean(health?.checks?.aiProviderCredentialRequired),
    release: typeof health?.release === "string" ? health.release : null,
    adapters,
  };
}
