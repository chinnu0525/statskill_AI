"use client";

import { useEffect, useState } from "react";
import type { Locale } from "../../src/i18n/messages";
import { roleWorkspaceMessages } from "../../src/i18n/role-workspace-messages";
import { loadSystemHealth, loadTrainerWorkspace, type SystemHealth, type TrainerWorkspace } from "../../src/services/role-workspaces";

function statusClass(status: string) {
  const normalized = status.toUpperCase();
  if (normalized === "CHUNKED" || normalized === "READY" || normalized === "COMPLETED") return "ok";
  if (normalized.includes("FAILED") || normalized.includes("ERROR") || normalized === "MISCONFIGURED") return "bad";
  return "pending";
}

export function TrainerWorkspacePanel({ locale }: { locale: Locale }) {
  const copy = roleWorkspaceMessages[locale];
  const [workspace, setWorkspace] = useState<TrainerWorkspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<"forbidden" | "failed" | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true); setError(null);
    loadTrainerWorkspace()
      .then((data) => active && setWorkspace(data))
      .catch((reason) => active && setError(reason instanceof Error && reason.message === "FORBIDDEN" ? "forbidden" : "failed"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [refreshKey]);

  if (loading) return <div className="roleLoading">{copy.loading}</div>;
  if (error === "forbidden") return <div className="roleError">{copy.accessDenied}</div>;
  if (error || !workspace) return <div className="roleError"><span>{copy.unavailable}</span><button type="button" onClick={() => setRefreshKey((value) => value + 1)}>{copy.retry}</button></div>;

  return <section className="roleWorkspace">
    <div className="rolePanelIntro"><div><h2>{copy.trainerTitle}</h2><p>{copy.trainerHint}</p></div><button type="button" onClick={() => setRefreshKey((value) => value + 1)}>{copy.retry}</button></div>
    <div className="roleMetricGrid">
      <article><span>{copy.materials}</span><strong>{workspace.materials.length}</strong></article>
      <article><span>{copy.processed}</span><strong>{workspace.processedCount}</strong></article>
      <article><span>{copy.generatedAssessments}</span><strong>{workspace.assessments.length}</strong></article>
      <article><span>{copy.generatedQuestions}</span><strong>{workspace.questionCount}</strong></article>
    </div>
    <div className="roleSplit">
      <article className="portalCard roleListCard"><div className="cardHeading"><h3>{copy.recentMaterials}</h3><span>{workspace.materials.length}</span></div>{workspace.materials.length ? <div className="roleRows">{workspace.materials.map((item) => <div className="roleRow" key={item.id}><div><strong>{item.title}</strong><small>{copy.created}: {new Date(item.createdAt).toLocaleDateString(locale)}</small></div><span className={`roleStatus ${statusClass(item.status)}`}>{item.status}</span></div>)}</div> : <p className="roleEmpty">{copy.noMaterials}</p>}</article>
      <article className="portalCard roleListCard"><div className="cardHeading"><h3>{copy.assessmentLibrary}</h3><span>{workspace.assessments.length}</span></div>{workspace.assessments.length ? <div className="roleRows">{workspace.assessments.map((item) => <div className="roleRow assessment" key={item.id}><div><strong>{item.title}</strong><small>{copy.source}: {item.sourceDocumentTitle}</small><small>{copy.created}: {new Date(item.createdAt).toLocaleDateString(locale)}</small></div><b>{item.questionCount} {copy.questions}</b></div>)}</div> : <p className="roleEmpty">{copy.noAssessments}</p>}</article>
    </div>
  </section>;
}

export function SystemConsolePanel({ locale }: { locale: Locale }) {
  const copy = roleWorkspaceMessages[locale];
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<"forbidden" | "failed" | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true); setError(null);
    loadSystemHealth()
      .then((data) => active && setHealth(data))
      .catch((reason) => active && setError(reason instanceof Error && reason.message === "FORBIDDEN" ? "forbidden" : "failed"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [refreshKey]);

  if (loading) return <div className="roleLoading">{copy.loading}</div>;
  if (error === "forbidden") return <div className="roleError">{copy.accessDenied}</div>;
  if (error || !health) return <div className="roleError"><span>{copy.unavailable}</span><button type="button" onClick={() => setRefreshKey((value) => value + 1)}>{copy.retry}</button></div>;

  return <section className="roleWorkspace systemWorkspace">
    <div className="rolePanelIntro"><div><h2>{copy.systemTitle}</h2><p>{copy.systemHint}</p></div><button type="button" onClick={() => setRefreshKey((value) => value + 1)}>{copy.retry}</button></div>
    <div className="systemHealthGrid">
      <article><span>{copy.overallStatus}</span><strong className={health.overallStatus === "ready" ? "okText" : "badText"}>{health.overallStatus}</strong></article>
      <article><span>{copy.release}</span><strong>{health.release ?? "—"}</strong></article>
      <article><span>{copy.supabase}</span><strong className={health.supabaseReady ? "okText" : "badText"}>{health.supabaseReady ? copy.ready : copy.unavailable}</strong></article>
      <article><span>{copy.aiRuntime}</span><strong>{health.aiRuntime}</strong></article>
      <article><span>{copy.providerCredential}</span><strong>{health.aiProviderCredentialRequired ? copy.configured : copy.notRequired}</strong></article>
    </div>
    <article className="portalCard adapterCard"><div className="cardHeading"><h3>{copy.externalCatalogs}</h3><span>{health.adapters.length}</span></div>{health.adapters.length ? <div className="roleRows">{health.adapters.map((adapter) => <div className="roleRow" key={adapter.sourceSystem}><div><strong>{adapter.sourceSystem}</strong><small>{adapter.itemCount} items</small></div><span className={`roleStatus ${adapter.mode === "MOCK" ? "mock" : "pending"}`}>{adapter.mode === "MOCK" ? copy.mock : copy.configured}</span></div>)}</div> : <p className="roleEmpty">{copy.unavailable}</p>}</article>
  </section>;
}

export function AdminPrivacyNotice({ locale }: { locale: Locale }) {
  const copy = roleWorkspaceMessages[locale];
  return <aside className="adminPrivacyNotice"><strong>{copy.adminPrivacyTitle}</strong><p>{copy.adminPrivacyHint}</p></aside>;
}
