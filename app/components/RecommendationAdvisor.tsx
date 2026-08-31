"use client";

import { useEffect, useState } from "react";
import type { Locale } from "../../src/i18n/messages";
import {
  enrollLocalRecommendation,
  loadAdvisorRecommendations,
  type AdvisorRecommendation,
} from "../../src/services/recommendations";

const copy: Record<Locale, Record<string, string>> = {
  en: {
    loading: "Ranking learning options from your latest competency gaps…",
    failed: "Recommendations could not be loaded. Please try again.",
    empty: "No learning recommendations are available yet. Complete a competency assessment first.",
    refresh: "Refresh recommendations",
    score: "Recommendation score",
    why: "Why this course?",
    enroll: "Enroll",
    enrolled: "Enrolled",
    enrolling: "Enrolling…",
    mock: "MOCK CATALOG",
    local: "LOCAL COURSE",
    external: "Open external item",
    mockAction: "Demo catalog item",
    reason: "Recommendation rationale",
    breakdown: "Explainable score breakdown",
    close: "Close",
    success: "Course added to your learning plan.",
    enrollFailed: "The course could not be added to your learning plan.",
    gap: "Gap",
    role: "Role",
    career: "Career",
    department: "Department",
    priorLearning: "Prior learning",
    demand: "Demand",
    weighting: "Weighted as Gap 30%, Role 20%, Career 15%, Department 15%, Prior Learning 10%, Demand 10%.",
    mockNote: "Mock external catalog data is shown for SIH demonstration only. No real iGOT/NSSTA enrollment is performed.",
  },
  hi: {
    loading: "आपके नवीनतम दक्षता अंतर के आधार पर सीखने के विकल्प रैंक किए जा रहे हैं…",
    failed: "अनुशंसाएँ लोड नहीं हो सकीं। कृपया फिर प्रयास करें।",
    empty: "अभी कोई सीखने की अनुशंसा उपलब्ध नहीं है। पहले दक्षता मूल्यांकन पूरा करें।",
    refresh: "अनुशंसाएँ रीफ़्रेश करें",
    score: "अनुशंसा स्कोर",
    why: "यह पाठ्यक्रम क्यों?",
    enroll: "नामांकन करें",
    enrolled: "नामांकित",
    enrolling: "नामांकन हो रहा है…",
    mock: "मॉक कैटलॉग",
    local: "स्थानीय पाठ्यक्रम",
    external: "बाहरी आइटम खोलें",
    mockAction: "डेमो कैटलॉग आइटम",
    reason: "अनुशंसा का कारण",
    breakdown: "व्याख्यायित स्कोर विवरण",
    close: "बंद करें",
    success: "पाठ्यक्रम आपके सीखने की योजना में जोड़ दिया गया है।",
    enrollFailed: "पाठ्यक्रम आपकी सीखने की योजना में नहीं जोड़ा जा सका।",
    gap: "अंतर",
    role: "भूमिका",
    career: "कैरियर",
    department: "विभाग",
    priorLearning: "पूर्व सीखना",
    demand: "मांग",
    weighting: "भार: अंतर 30%, भूमिका 20%, कैरियर 15%, विभाग 15%, पूर्व सीखना 10%, मांग 10%।",
    mockNote: "SIH प्रदर्शन के लिए मॉक बाहरी कैटलॉग डेटा दिखाया गया है। वास्तविक iGOT/NSSTA नामांकन नहीं किया जाता।",
  },
  te: {
    loading: "మీ తాజా సామర్థ్య లోపాల ఆధారంగా అభ్యాస ఎంపికలను ర్యాంక్ చేస్తున్నాం…",
    failed: "సిఫార్సులను లోడ్ చేయలేకపోయాము. మళ్లీ ప్రయత్నించండి.",
    empty: "ఇంకా అభ్యాస సిఫార్సులు లేవు. ముందుగా సామర్థ్య మూల్యాంకనాన్ని పూర్తి చేయండి.",
    refresh: "సిఫార్సులను రిఫ్రెష్ చేయండి",
    score: "సిఫార్సు స్కోర్",
    why: "ఈ కోర్సు ఎందుకు?",
    enroll: "నమోదు చేయండి",
    enrolled: "నమోదైంది",
    enrolling: "నమోదు చేస్తోంది…",
    mock: "మాక్ క్యాటలాగ్",
    local: "లోకల్ కోర్సు",
    external: "బాహ్య అంశాన్ని తెరవండి",
    mockAction: "డెమో క్యాటలాగ్ అంశం",
    reason: "సిఫార్సు కారణం",
    breakdown: "వివరణాత్మక స్కోర్ విభజన",
    close: "మూసివేయండి",
    success: "కోర్సు మీ అభ్యాస ప్రణాళికలో చేర్చబడింది.",
    enrollFailed: "కోర్సును మీ అభ్యాస ప్రణాళికలో చేర్చలేకపోయాము.",
    gap: "లోపం",
    role: "పాత్ర",
    career: "కెరీర్",
    department: "విభాగం",
    priorLearning: "మునుపటి అభ్యాసం",
    demand: "డిమాండ్",
    weighting: "బరువులు: లోపం 30%, పాత్ర 20%, కెరీర్ 15%, విభాగం 15%, మునుపటి అభ్యాసం 10%, డిమాండ్ 10%.",
    mockNote: "SIH డెమో కోసం మాక్ బాహ్య క్యాటలాగ్ డేటా చూపబడుతుంది. నిజమైన iGOT/NSSTA నమోదు జరగదు.",
  },
};

const breakdownKeys = ["gap", "role", "career", "department", "priorLearning", "demand"] as const;

export function RecommendationAdvisor({
  locale,
  onEnrollmentChanged,
}: {
  locale: Locale;
  onEnrollmentChanged?: () => void;
}) {
  const t = copy[locale];
  const [items, setItems] = useState<AdvisorRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<AdvisorRecommendation | null>(null);
  const [enrollingId, setEnrollingId] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setMessage("");
    loadAdvisorRecommendations(locale)
      .then((recommendations) => {
        if (active) setItems(recommendations);
      })
      .catch(() => {
        if (active) {
          setItems([]);
          setMessage(t.failed);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [locale, refreshKey, t.failed]);

  async function enroll(item: AdvisorRecommendation) {
    if (item.kind !== "COURSE" || item.isEnrolled || item.isMock) return;
    setEnrollingId(item.id);
    setMessage("");
    try {
      await enrollLocalRecommendation(item.id);
      setMessage(t.success);
      setItems((current) => current.map((candidate) => candidate.id === item.id ? { ...candidate, isEnrolled: true } : candidate));
      onEnrollmentChanged?.();
    } catch {
      setMessage(t.enrollFailed);
    } finally {
      setEnrollingId("");
    }
  }

  return (
    <section className="liveAdvisor" aria-live="polite">
      <div className="advisorToolbar">
        <div>
          <strong>{t.score}</strong>
          <span>{t.weighting}</span>
        </div>
        <button type="button" onClick={() => setRefreshKey((value) => value + 1)} disabled={loading}>
          {t.refresh}
        </button>
      </div>

      {message ? <div className="noticePanel advisorMessage" role="status">{message}</div> : null}
      {loading ? <div className="portalEmptyState">{t.loading}</div> : null}
      {!loading && !items.length ? <div className="portalEmptyState">{t.empty}</div> : null}

      {!loading && items.length ? (
        <div className="recommendationGrid liveRecommendationGrid">
          {items.map((item) => (
            <article className="portalCard recommendationCard liveRecommendationCard" key={`${item.kind}:${item.id}`}>
              <div className="cardHeading">
                <div className="recommendationBadges">
                  <span className="sourceBadge">{item.sourceSystem}</span>
                  {item.isMock ? <span className="mockBadge">{t.mock}</span> : item.kind === "COURSE" ? <span className="localBadge">{t.local}</span> : null}
                </div>
                <strong aria-label={`${t.score}: ${item.score}`}>{item.score}/100</strong>
              </div>
              <h2>{item.title}</h2>
              <span className="competencyTag">{item.competencyName}</span>
              <p className="recommendationReason">{item.reason}</p>
              <div className="cardActions">
                <button type="button" onClick={() => setSelected(item)}>{t.why}</button>
                {item.kind === "COURSE" ? (
                  <button
                    type="button"
                    className="primary"
                    onClick={() => void enroll(item)}
                    disabled={item.isEnrolled || item.isMock || enrollingId === item.id}
                  >
                    {item.isEnrolled ? t.enrolled : enrollingId === item.id ? t.enrolling : item.isMock ? t.mockAction : t.enroll}
                  </button>
                ) : item.isMock || !item.url ? (
                  <button type="button" className="primary" disabled>{t.mockAction}</button>
                ) : (
                  <a className="advisorExternalAction" href={item.url} target="_blank" rel="noopener noreferrer">{t.external}</a>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {items.some((item) => item.isMock) ? <p className="advisorMockNote">{t.mockNote}</p> : null}

      {selected ? (
        <div className="modalBackdrop" role="dialog" aria-modal="true" aria-labelledby="advisor-breakdown-title">
          <div className="portalModal advisorBreakdownModal">
            <div className="cardHeading">
              <div>
                <span>{t.breakdown}</span>
                <h2 id="advisor-breakdown-title">{selected.title}</h2>
              </div>
              <button type="button" onClick={() => setSelected(null)} aria-label={t.close}>×</button>
            </div>
            <div className="advisorReasonPanel"><strong>{t.reason}</strong><p>{selected.reason}</p></div>
            <div className="scoreBreakdown">
              {breakdownKeys.map((key) => (
                <div key={key}>
                  <span>{t[key]}</span>
                  <div><i style={{ width: `${selected.breakdown[key]}%` }} /></div>
                  <b>{selected.breakdown[key]}</b>
                </div>
              ))}
            </div>
            <p className="advisorWeighting">{t.weighting}</p>
            <button type="button" className="primaryAction" onClick={() => setSelected(null)}>{t.close}</button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
