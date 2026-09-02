"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Locale } from "../../src/i18n/messages";
import { learnerInsightMessages } from "../../src/i18n/learner-insight-messages";
import {
  loadCompetencyFramework,
  loadLatestAssessmentInsight,
  loadLearnerReports,
  updateLearnerProfile,
  type FrameworkItem,
  type LatestAssessmentInsight,
  type LearnerProfileUpdate,
  type LearnerReports,
  type ReportRow,
} from "../../src/services/learner-insights";

type ProfileProps = {
  locale: Locale;
  fullName: string;
  profile: Omit<LearnerProfileUpdate, "fullName">;
  onSaved?: () => void;
};

function scoreLevel(score: number | null) {
  if (score === null) return "—";
  if (score >= 80) return "L5";
  if (score >= 60) return "L4";
  if (score >= 40) return "L3";
  if (score >= 20) return "L2";
  return "L1";
}

function priorityClass(priority: FrameworkItem["priority"], gapScore: number) {
  if (!priority && gapScore <= 0) return "met";
  if (priority === "CRITICAL" || priority === "HIGH") return "high";
  if (priority === "MODERATE") return "medium";
  return "low";
}

export function CompetencyFrameworkPanel({ locale }: { locale: Locale }) {
  const copy = learnerInsightMessages[locale];
  const [items, setItems] = useState<FrameworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    loadCompetencyFramework()
      .then((data) => active && setItems(data))
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [refreshKey]);

  const grouped = useMemo(() => {
    const map = new Map<string, FrameworkItem[]>();
    for (const item of items) {
      const key = `${item.domainCode}:${item.domainName}`;
      map.set(key, [...(map.get(key) ?? []), item]);
    }
    return [...map.entries()];
  }, [items]);

  if (loading) return <div className="insightLoading">{copy.loading}</div>;
  if (error) return <div className="insightError"><span>{copy.noData}</span><button type="button" onClick={() => setRefreshKey((v) => v + 1)}>{copy.retry}</button></div>;

  return <section className="liveFrameworkPanel">
    <div className="livePanelIntro"><div><h2>{copy.frameworkTitle}</h2><p>{copy.frameworkHint}</p></div><span className="targetBadge">5-level model</span></div>
    <div className="frameworkDomainGrid">
      {grouped.map(([key, domainItems]) => <article className="portalCard liveDomainCard" key={key}>
        <div className="liveDomainHeading"><div><span>{domainItems[0]?.domainCode}</span><h3>{domainItems[0]?.domainName}</h3></div><strong>{domainItems.filter((item) => item.currentScore !== null).length}/{domainItems.length} {copy.measured}</strong></div>
        <div className="liveCompetencyList">{domainItems.map((item) => {
          const current = item.currentScore;
          const gap = Math.max(0, item.gapScore);
          return <div className="liveCompetencyItem" key={item.id}>
            <div className="competencyIdentity"><span>{item.code}</span><strong>{item.name}</strong><small>{current === null ? copy.notAssessed : `${copy.currentScore}: ${Math.round(current)} · L${item.currentLevel ?? scoreLevel(current).replace("L", "")}`}</small></div>
            <div className="scoreMeter" aria-label={`${item.name} level ${item.currentLevel ?? 0} of 5`}><i style={{ width: `${Math.max(0, Math.min(100, (item.currentLevel ?? 0) * 20))}%` }}/><b style={{ left: `${item.requiredLevel * 20}%` }}/></div>
            <div className="competencyNumbers"><span><small>{copy.targetScore}</small><b>L{item.requiredLevel}</b></span><span><small>{copy.gap}</small><b>{Math.max(0, item.requiredLevel - (item.currentLevel ?? 0))}</b></span><em className={`gapBadge ${priorityClass(item.priority, gap)}`}>{item.priority === "NONE" ? copy.targetMet : item.priority ?? copy.notAssessed}</em></div>
          </div>;
        })}</div>
      </article>)}
    </div>
  </section>;
}

export function LatestAssessmentInsightPanel({ locale }: { locale: Locale }) {
  const copy = learnerInsightMessages[locale];
  const [insight, setInsight] = useState<LatestAssessmentInsight>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    loadLatestAssessmentInsight().then((data) => active && setInsight(data)).catch(() => active && setInsight(null)).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  return <div className="latestAssessmentPanel">
    <h2>{copy.latestAssessment}</h2>
    {loading ? <p>{copy.loading}</p> : insight ? <>
      <div className="latestScore"><strong>{Math.round(insight.score)}%</strong><div><b>{insight.title}</b><span>{insight.competencyName}</span></div></div>
      <div className="latestAssessmentMeta"><span>{copy.score}: {Math.round(insight.score)}/100</span><span>{copy.completedOn}: {new Date(insight.completedAt).toLocaleDateString(locale)}</span></div>
    </> : <p>{copy.noAssessment}</p>}
  </div>;
}

export function ProfileEditorPanel({ locale, fullName, profile, onSaved }: ProfileProps) {
  const copy = learnerInsightMessages[locale];
  const initial: LearnerProfileUpdate = useMemo(() => ({ fullName, ...profile }), [fullName, profile]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [values, setValues] = useState<LearnerProfileUpdate>(initial);

  useEffect(() => { if (!editing) setValues(initial); }, [initial, editing]);

  function set<K extends keyof LearnerProfileUpdate>(key: K, value: LearnerProfileUpdate[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await updateLearnerProfile(values);
      setMessage(copy.saved);
      setEditing(false);
      onSaved?.();
    } catch {
      setMessage(copy.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  return <section className="portalCard liveProfilePanel">
    <div className="livePanelIntro"><div><h2>{copy.profileTitle}</h2><p>{copy.profileHint}</p></div>{!editing && <button type="button" onClick={() => { setValues(initial); setEditing(true); setMessage(""); }}>{copy.edit}</button>}</div>
    {editing ? <form className="liveProfileForm" onSubmit={submit}>
      <label><span>{copy.fullName}</span><input value={values.fullName} onChange={(e) => set("fullName", e.target.value)} required maxLength={120}/></label>
      <label><span>{copy.designation}</span><input value={values.designation} onChange={(e) => set("designation", e.target.value)} maxLength={120}/></label>
      <label><span>{copy.department}</span><input value={values.department} onChange={(e) => set("department", e.target.value)} maxLength={160}/></label>
      <label><span>{copy.cadre}</span><input value={values.cadre} onChange={(e) => set("cadre", e.target.value)} maxLength={120}/></label>
      <label className="wide"><span>{copy.assignment}</span><input value={values.assignment} onChange={(e) => set("assignment", e.target.value)} maxLength={240}/></label>
      <label><span>{copy.qualification}</span><input value={values.qualification} onChange={(e) => set("qualification", e.target.value)} maxLength={160}/></label>
      <label><span>{copy.experience}</span><input type="number" min="0" max="60" step="1" value={values.experienceYears ?? ""} onChange={(e) => set("experienceYears", e.target.value === "" ? null : Number(e.target.value))}/></label>
      <label className="wide"><span>{copy.priorTraining}</span><textarea rows={4} value={values.priorTraining} onChange={(e) => set("priorTraining", e.target.value)} maxLength={2000}/></label>
      <div className="profileFormActions"><button type="button" onClick={() => { setEditing(false); setValues(initial); setMessage(""); }} disabled={saving}>{copy.cancel}</button><button className="primaryAction" type="submit" disabled={saving}>{saving ? copy.loading : copy.save}</button></div>
    </form> : <dl className="liveProfileSummary">
      <div><dt>{copy.fullName}</dt><dd>{initial.fullName || "—"}</dd></div><div><dt>{copy.designation}</dt><dd>{initial.designation || "—"}</dd></div><div><dt>{copy.department}</dt><dd>{initial.department || "—"}</dd></div><div><dt>{copy.cadre}</dt><dd>{initial.cadre || "—"}</dd></div><div><dt>{copy.assignment}</dt><dd>{initial.assignment || "—"}</dd></div><div><dt>{copy.qualification}</dt><dd>{initial.qualification || "—"}</dd></div><div><dt>{copy.experience}</dt><dd>{initial.experienceYears ?? "—"}</dd></div><div className="wide"><dt>{copy.priorTraining}</dt><dd>{initial.priorTraining || "—"}</dd></div>
    </dl>}
    {message && <p className={`profileSaveMessage ${message === copy.saved ? "success" : "error"}`} role="status">{message}</p>}
  </section>;
}

function safeCsvCell(value: string | number) {
  let text = String(value ?? "");
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

function toCsv(rows: ReportRow[]) {
  if (!rows.length) return "";
  const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  return [headers.map(safeCsvCell).join(","), ...rows.map((row) => headers.map((header) => safeCsvCell(row[header] ?? "")).join(","))].join("\r\n");
}

function downloadCsv(name: string, rows: ReportRow[]) {
  const csv = toCsv(rows);
  if (!csv) return;
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function ReportsPanel({ locale }: { locale: Locale }) {
  const copy = learnerInsightMessages[locale];
  const [reports, setReports] = useState<LearnerReports | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [preview, setPreview] = useState<{ title: string; rows: ReportRow[] } | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true); setError(false);
    loadLearnerReports(locale).then((data) => active && setReports(data)).catch(() => active && setError(true)).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [locale]);

  if (loading) return <div className="insightLoading">{copy.loading}</div>;
  if (error || !reports) return <div className="insightError">{copy.noData}</div>;

  const cards = [
    { key: "competency", title: copy.competencyReport, rows: reports.competency },
    { key: "assessment", title: copy.assessmentReport, rows: reports.assessment },
    { key: "learning", title: copy.learningReport, rows: reports.learning },
  ] as const;

  return <section className="liveReportsPanel">
    <div className="livePanelIntro"><div><h2>{copy.reportsTitle}</h2><p>{copy.reportsHint}</p></div></div>
    <div className="liveReportGrid">{cards.map((card) => <article className="portalCard liveReportCard" key={card.key}><span className="reportIcon">▤</span><h3>{card.title}</h3><strong>{card.rows.length} {copy.rows}</strong><div className="reportActions"><button type="button" disabled={!card.rows.length} onClick={() => setPreview({ title: card.title, rows: card.rows })}>{copy.preview}</button><button type="button" className="primaryAction" disabled={!card.rows.length} onClick={() => downloadCsv(`statskill-${card.key}`, card.rows)}>{copy.exportCsv}</button></div></article>)}</div>
    {preview && <div className="modalBackdrop" role="dialog" aria-modal="true" aria-label={preview.title}><div className="portalModal reportPreviewModal"><div className="cardHeading"><h2>{preview.title}</h2><button type="button" onClick={() => setPreview(null)}>×</button></div>{preview.rows.length ? <div className="reportTableWrap"><table><thead><tr>{Object.keys(preview.rows[0]).map((key) => <th key={key}>{key.replace(/_/g, " ")}</th>)}</tr></thead><tbody>{preview.rows.slice(0, 25).map((row, index) => <tr key={index}>{Object.keys(preview.rows[0]).map((key) => <td key={key}>{String(row[key] ?? "")}</td>)}</tr>)}</tbody></table></div> : <p>{copy.noData}</p>}<div className="reportModalActions"><button type="button" onClick={() => setPreview(null)}>{copy.close}</button></div></div></div>}
  </section>;
}
