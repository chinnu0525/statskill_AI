"use client";

import { useEffect, useState } from "react";
import { loadAdminAnalytics, type AdminAnalytics } from "../../src/services/admin";

export function AdminOverview({ copy }: { copy: Record<string, string> }) {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setFailed(false);
    loadAdminAnalytics()
      .then((data) => active && setAnalytics(data))
      .catch(() => active && setFailed(true))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  return (
    <section className="adminCard" aria-labelledby="admin-analytics-title">
      <div className="adminIntro">
        <h2 id="admin-analytics-title">{copy.adminAnalytics}</h2>
        <p>{copy.adminAnalyticsHint}</p>
      </div>

      {loading ? <div className="notice">{copy.adminLoading}</div> : null}
      {failed ? <div className="notice">{copy.adminUnavailable}</div> : null}

      {analytics ? (
        <>
          <div className="adminMetrics">
            <article><span>{copy.workforce}</span><strong>{analytics.workforceCount}</strong></article>
            <article><span>{copy.averageCompetency}</span><strong>{analytics.averageCompetency}%</strong></article>
            <article><span>{copy.averageAssessment}</span><strong>{analytics.averageAssessment}%</strong></article>
            <article><span>{copy.highPriorityGaps}</span><strong>{analytics.highPriorityGaps}</strong></article>
            <article><span>{copy.completionRate}</span><strong>{analytics.completionRate}%</strong></article>
          </div>

          <div className="adminGapList">
            <h3>{copy.topOrganizationGaps}</h3>
            {analytics.topGaps.length ? analytics.topGaps.map((gap) => (
              <div className="adminGapRow" key={gap.name}>
                <strong>{gap.name}</strong>
                <span>{gap.affectedLearners} {copy.affectedLearners}</span>
                <span>{gap.averageGap}% {copy.averageGap}</span>
              </div>
            )) : <p className="muted emptyState">{copy.noGaps}</p>}
          </div>
        </>
      ) : null}
    </section>
  );
}
