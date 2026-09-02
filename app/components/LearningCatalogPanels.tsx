"use client";

import { useEffect, useMemo, useState } from "react";
import type { Locale } from "../../src/i18n/messages";
import {
  loadExternalCatalog,
  loadLearningPath,
  updateLearningProgress,
  type ExternalCatalogItem,
  type LearningPathItem,
} from "../../src/services/learning";

type PanelCopy = {
  loadingPath: string;
  loadFailed: string;
  emptyPath: string;
  currentPlan: string;
  completed: string;
  inProgress: string;
  notStarted: string;
  progress: string;
  duration: string;
  level: string;
  competency: string;
  source: string;
  phase: string;
  refresh: string;
  catalogLoading: string;
  emptyCatalog: string;
  search: string;
  allSources: string;
  catalogStatus: string;
  mockOnly: string;
  catalogItems: string;
  mockBadge: string;
  liveBadge: string;
  openItem: string;
  demoItem: string;
  catalogDisclaimer: string;
  deliveryMode: string;
  startCourse: string;
  saveProgress: string;
  markComplete: string;
  saving: string;
  progressSaved: string;
  updateFailed: string;
};

const panelCopy: Record<Locale, PanelCopy> = {
  en: {
    loadingPath: "Loading your enrolled learning path…",
    loadFailed: "Learning data could not be loaded. Please try again.",
    emptyPath: "Your learning path is empty. Use the Learning Advisor to add a recommended local course.",
    currentPlan: "Current learning plan",
    completed: "Completed",
    inProgress: "In progress",
    notStarted: "Not started",
    progress: "Progress",
    duration: "Duration",
    level: "Level",
    competency: "Competency",
    source: "Source",
    phase: "Phase",
    refresh: "Refresh",
    catalogLoading: "Loading the external training catalog…",
    emptyCatalog: "No external catalog items are available.",
    search: "Search catalog",
    allSources: "All sources",
    catalogStatus: "Catalog adapter status",
    mockOnly: "Demo adapters active",
    catalogItems: "catalog items",
    mockBadge: "MOCK",
    liveBadge: "LIVE",
    openItem: "Open catalog item",
    demoItem: "Demo item only",
    catalogDisclaimer: "IGOT_MOCK / NSSTA_MOCK entries are seeded SIH demonstration data. They do not represent live government catalog or enrollment results.",
    deliveryMode: "Delivery",
    startCourse: "Start course",
    saveProgress: "Save progress",
    markComplete: "Mark complete",
    saving: "Saving…",
    progressSaved: "Learning progress updated.",
    updateFailed: "Progress could not be updated. Please try again.",
  },
  hi: {
    loadingPath: "आपका नामांकित सीखने का मार्ग लोड हो रहा है…",
    loadFailed: "सीखने का डेटा लोड नहीं हो सका। कृपया फिर प्रयास करें।",
    emptyPath: "आपका सीखने का मार्ग खाली है। अनुशंसित स्थानीय पाठ्यक्रम जोड़ने के लिए Learning Advisor का उपयोग करें।",
    currentPlan: "वर्तमान सीखने की योजना",
    completed: "पूर्ण",
    inProgress: "जारी",
    notStarted: "शुरू नहीं हुआ",
    progress: "प्रगति",
    duration: "अवधि",
    level: "स्तर",
    competency: "दक्षता",
    source: "स्रोत",
    phase: "चरण",
    refresh: "रीफ़्रेश",
    catalogLoading: "बाहरी प्रशिक्षण कैटलॉग लोड हो रहा है…",
    emptyCatalog: "कोई बाहरी कैटलॉग आइटम उपलब्ध नहीं है।",
    search: "कैटलॉग खोजें",
    allSources: "सभी स्रोत",
    catalogStatus: "कैटलॉग एडेप्टर स्थिति",
    mockOnly: "डेमो एडेप्टर सक्रिय",
    catalogItems: "कैटलॉग आइटम",
    mockBadge: "मॉक",
    liveBadge: "लाइव",
    openItem: "कैटलॉग आइटम खोलें",
    demoItem: "केवल डेमो आइटम",
    catalogDisclaimer: "IGOT_MOCK / NSSTA_MOCK प्रविष्टियाँ SIH प्रदर्शन के लिए सीड किया गया डेटा हैं। ये वास्तविक सरकारी कैटलॉग या नामांकन परिणाम नहीं हैं।",
    deliveryMode: "माध्यम",
    startCourse: "पाठ्यक्रम शुरू करें",
    saveProgress: "प्रगति सहेजें",
    markComplete: "पूर्ण चिह्नित करें",
    saving: "सहेजा जा रहा है…",
    progressSaved: "सीखने की प्रगति अद्यतन हुई।",
    updateFailed: "प्रगति अद्यतन नहीं हो सकी। फिर प्रयास करें।",
  },
  te: {
    loadingPath: "మీ నమోదు చేసిన అభ్యాస మార్గాన్ని లోడ్ చేస్తున్నాం…",
    loadFailed: "అభ్యాస డేటాను లోడ్ చేయలేకపోయాము. మళ్లీ ప్రయత్నించండి.",
    emptyPath: "మీ అభ్యాస మార్గం ఖాళీగా ఉంది. సిఫార్సు చేసిన లోకల్ కోర్సును జోడించడానికి Learning Advisor ను ఉపయోగించండి.",
    currentPlan: "ప్రస్తుత అభ్యాస ప్రణాళిక",
    completed: "పూర్తైంది",
    inProgress: "కొనసాగుతోంది",
    notStarted: "ప్రారంభించలేదు",
    progress: "పురోగతి",
    duration: "వ్యవధి",
    level: "స్థాయి",
    competency: "సామర్థ్యం",
    source: "మూలం",
    phase: "దశ",
    refresh: "రిఫ్రెష్",
    catalogLoading: "బాహ్య శిక్షణ క్యాటలాగ్‌ను లోడ్ చేస్తున్నాం…",
    emptyCatalog: "బాహ్య క్యాటలాగ్ అంశాలు లేవు.",
    search: "క్యాటలాగ్‌లో వెతకండి",
    allSources: "అన్ని మూలాలు",
    catalogStatus: "క్యాటలాగ్ అడాప్టర్ స్థితి",
    mockOnly: "డెమో అడాప్టర్లు సక్రియం",
    catalogItems: "క్యాటలాగ్ అంశాలు",
    mockBadge: "మాక్",
    liveBadge: "లైవ్",
    openItem: "క్యాటలాగ్ అంశం తెరవండి",
    demoItem: "డెమో అంశం మాత్రమే",
    catalogDisclaimer: "IGOT_MOCK / NSSTA_MOCK ఎంట్రీలు SIH డెమో కోసం సీడ్ చేసిన డేటా. ఇవి నిజమైన ప్రభుత్వ క్యాటలాగ్ లేదా నమోదు ఫలితాలు కావు.",
    deliveryMode: "డెలివరీ",
    startCourse: "కోర్సు ప్రారంభించండి",
    saveProgress: "పురోగతిని సేవ్ చేయండి",
    markComplete: "పూర్తిగా గుర్తించండి",
    saving: "సేవ్ చేస్తోంది…",
    progressSaved: "అభ్యాస పురోగతి నవీకరించబడింది.",
    updateFailed: "పురోగతిని నవీకరించలేకపోయాము. మళ్లీ ప్రయత్నించండి.",
  },
};

function statusLabel(item: LearningPathItem, t: PanelCopy) {
  if (item.status === "COMPLETED") return t.completed;
  if (item.status === "IN_PROGRESS") return t.inProgress;
  return t.notStarted;
}

function durationLabel(minutes: number | null) {
  if (!minutes) return "—";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining ? `${hours}h ${remaining}m` : `${hours}h`;
}

export function LearningPathPanel({ locale }: { locale: Locale }) {
  const t = panelCopy[locale];
  const [items, setItems] = useState<LearningPathItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [draftProgress, setDraftProgress] = useState<Record<string, number>>({});
  const [savingId, setSavingId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setFailed(false);
    loadLearningPath(locale)
      .then((data) => {
        if (active) {
          setItems(data);
          setDraftProgress(Object.fromEntries(data.map((item) => [item.enrollmentId, item.progress])));
        }
      })
      .catch(() => {
        if (active) {
          setItems([]);
          setFailed(true);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [locale, refreshKey]);

  const completedCount = items.filter((item) => item.status === "COMPLETED").length;
  const averageProgress = items.length
    ? Math.round(items.reduce((sum, item) => sum + item.progress, 0) / items.length)
    : 0;

  async function saveProgress(item: LearningPathItem, progress: number, start = false) {
    if (savingId) return;
    setSavingId(item.enrollmentId);
    setMessage("");
    try {
      await updateLearningProgress(item, progress, { start });
      setMessage(t.progressSaved);
      setRefreshKey((value) => value + 1);
    } catch {
      setMessage(t.updateFailed);
    } finally {
      setSavingId("");
    }
  }

  return (
    <section className="liveLearningPanel" aria-live="polite">
      <div className="learningSummaryBar">
        <div><span>{t.currentPlan}</span><strong>{items.length}</strong></div>
        <div><span>{t.inProgress}</span><strong>{items.filter((item) => item.status === "IN_PROGRESS").length}</strong></div>
        <div><span>{t.completed}</span><strong>{completedCount}</strong></div>
        <div><span>{t.progress}</span><strong>{averageProgress}%</strong></div>
        <button type="button" onClick={() => setRefreshKey((value) => value + 1)} disabled={loading}>{t.refresh}</button>
      </div>

      {loading ? <div className="portalEmptyState">{t.loadingPath}</div> : null}
      {!loading && failed ? <div className="noticePanel">{t.loadFailed}</div> : null}
      {message ? <div className="noticePanel" role="status">{message}</div> : null}
      {!loading && !failed && !items.length ? <div className="portalEmptyState">{t.emptyPath}</div> : null}

      {!loading && items.length ? (
        <ol className="liveRoadmap">
          {items.map((item, index) => (
            <li className="portalCard liveRoadmapItem" key={item.enrollmentId}>
              <div className="livePhaseNumber"><span>{t.phase}</span><strong>{String(index + 1).padStart(2, "0")}</strong></div>
              <div className="liveRoadmapBody">
                <div className="liveRoadmapHeading">
                  <div>
                    <span className={`learningStatus status-${item.status.toLowerCase().replace("_", "-")}`}>{statusLabel(item, t)}</span>
                    <h2>{item.title}</h2>
                  </div>
                  <strong>{item.progress}%</strong>
                </div>
                <div className="learningProgressTrack" aria-label={`${t.progress}: ${item.progress}%`}><i style={{ width: `${item.progress}%` }} /></div>
                <dl className="learningMetaGrid">
                  <div><dt>{t.competency}</dt><dd>{item.competencyName}</dd></div>
                  <div><dt>{t.level}</dt><dd>{item.level}</dd></div>
                  <div><dt>{t.duration}</dt><dd>{durationLabel(item.durationMinutes)}</dd></div>
                  <div><dt>{t.source}</dt><dd>{item.sourceSystem}</dd></div>
                </dl>
                <div className="learningProgressActions">
                  {item.status === "NOT_STARTED" ? <button type="button" onClick={() => void saveProgress(item, 0, true)} disabled={savingId === item.enrollmentId}>{savingId === item.enrollmentId ? t.saving : t.startCourse}</button> : null}
                  <label><span>{t.progress}: {draftProgress[item.enrollmentId] ?? item.progress}%</span><input type="range" min="0" max="100" step="5" value={draftProgress[item.enrollmentId] ?? item.progress} onChange={(event) => setDraftProgress((current) => ({ ...current, [item.enrollmentId]: Number(event.target.value) }))} disabled={savingId === item.enrollmentId || item.status === "COMPLETED"} /></label>
                  <button type="button" onClick={() => void saveProgress(item, draftProgress[item.enrollmentId] ?? item.progress)} disabled={savingId === item.enrollmentId || (draftProgress[item.enrollmentId] ?? item.progress) === item.progress}>{savingId === item.enrollmentId ? t.saving : t.saveProgress}</button>
                  {item.status !== "COMPLETED" ? <button className="completeLearningButton" type="button" onClick={() => void saveProgress(item, 100)} disabled={savingId === item.enrollmentId}>{t.markComplete}</button> : null}
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}

export function ExternalCatalogPanel({ locale }: { locale: Locale }) {
  const t = panelCopy[locale];
  const [items, setItems] = useState<ExternalCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("ALL");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setFailed(false);
    loadExternalCatalog(locale)
      .then((data) => {
        if (active) setItems(data);
      })
      .catch(() => {
        if (active) {
          setItems([]);
          setFailed(true);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [locale, refreshKey]);

  const sources = useMemo(() => [...new Set(items.map((item) => item.sourceSystem))].sort(), [items]);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter((item) => {
      const sourceMatch = source === "ALL" || item.sourceSystem === source;
      const textMatch = !normalized || `${item.title} ${item.competencyName} ${item.sourceSystem}`.toLowerCase().includes(normalized);
      return sourceMatch && textMatch;
    });
  }, [items, query, source]);
  const allMock = items.length > 0 && items.every((item) => item.isMock);

  return (
    <section className="liveCatalogPanel" aria-live="polite">
      <div className="catalogTelemetry">
        <div><span className={allMock ? "telemetryDot mock" : "telemetryDot live"} /><strong>{t.catalogStatus}</strong><span>{allMock ? t.mockOnly : t.liveBadge}</span></div>
        <div><strong>{items.length}</strong><span>{t.catalogItems}</span></div>
        <button type="button" onClick={() => setRefreshKey((value) => value + 1)} disabled={loading}>{t.refresh}</button>
      </div>

      <div className="catalogFilters">
        <label><span>{t.search}</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} /></label>
        <label><span>{t.source}</span><select value={source} onChange={(event) => setSource(event.target.value)}><option value="ALL">{t.allSources}</option>{sources.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      </div>

      {loading ? <div className="portalEmptyState">{t.catalogLoading}</div> : null}
      {!loading && failed ? <div className="noticePanel">{t.loadFailed}</div> : null}
      {!loading && !failed && !filtered.length ? <div className="portalEmptyState">{t.emptyCatalog}</div> : null}

      {!loading && filtered.length ? (
        <div className="catalogGrid liveCatalogGrid">
          {filtered.map((item) => (
            <article className="portalCard liveCatalogCard" key={`${item.sourceSystem}:${item.externalId}`}>
              <div className="catalogCardTop"><span className="sourceBadge">{item.sourceSystem}</span><span className={item.isMock ? "mockBadge" : "localBadge"}>{item.isMock ? t.mockBadge : t.liveBadge}</span></div>
              <h2>{item.title}</h2>
              <span className="competencyTag">{item.competencyName}</span>
              <dl className="catalogDetailList">
                <div><dt>{t.level}</dt><dd>{item.level}</dd></div>
                <div><dt>{t.duration}</dt><dd>{item.durationLabel}</dd></div>
                <div><dt>{t.deliveryMode}</dt><dd>{item.deliveryMode}</dd></div>
              </dl>
              {item.isMock || !item.url ? <button type="button" className="primaryAction" disabled>{t.demoItem}</button> : <a className="primaryAction catalogExternalLink" href={item.url} target="_blank" rel="noopener noreferrer">{t.openItem}</a>}
            </article>
          ))}
        </div>
      ) : null}

      {items.some((item) => item.isMock) ? <p className="advisorMockNote">{t.catalogDisclaimer}</p> : null}
    </section>
  );
}
