"use client";

import { ReactNode, useMemo, useState } from "react";
import type { Locale } from "../../src/i18n/messages";
import { portalMessages } from "../../src/i18n/portal-messages";
import { ExternalCatalogPanel, LearningPathPanel } from "./LearningCatalogPanels";
import { RecommendationAdvisor } from "./RecommendationAdvisor";

export type PortalRole = "learner" | "trainer" | "admin" | "superadmin";
export type PortalView = "home" | "dashboard" | "framework" | "assessment" | "advisor" | "learning" | "igot" | "generator" | "trainer" | "admin" | "superadmin" | "reports" | "profile";

type Gap = { name: string; priority: string };
type Course = { id: string; title: string; progress: number };

type Props = {
  locale: Locale;
  localeLabels: Record<Locale, string>;
  fullName?: string | null;
  actualRole?: string | null;
  competencyScore: number;
  gaps: Gap[];
  courses: Course[];
  learningHours?: number;
  assessmentsCompleted?: number;
  onLocaleChange: (locale: Locale) => void;
  onSignOut: () => void;
  onLearningChanged?: () => void;
  materialsNode: ReactNode;
  sourceNode: ReactNode;
  aiNode: ReactNode;
  assessmentNode: ReactNode;
  frameworkNode: ReactNode;
  reportsNode: ReactNode;
  profileNode: ReactNode;
  latestInsightNode: ReactNode;
  adminNode?: ReactNode;
  trainerNode?: ReactNode;
  superAdminNode?: ReactNode;
};

const navConfig: Array<{
  id: PortalView;
  key: "home" | "dashboard" | "framework" | "assessment" | "advisor" | "learningPath" | "igot" | "generator" | "trainerHub" | "workforceAnalytics" | "systemConsole" | "reports" | "profile";
  roles: PortalRole[] | "all";
}> = [
  { id: "home", key: "home", roles: "all" },
  { id: "dashboard", key: "dashboard", roles: ["learner"] },
  { id: "framework", key: "framework", roles: "all" },
  { id: "assessment", key: "assessment", roles: ["learner"] },
  { id: "advisor", key: "advisor", roles: ["learner"] },
  { id: "learning", key: "learningPath", roles: ["learner"] },
  { id: "igot", key: "igot", roles: "all" },
  { id: "generator", key: "generator", roles: ["learner", "trainer", "admin", "superadmin"] },
  { id: "trainer", key: "trainerHub", roles: ["trainer", "superadmin"] },
  { id: "admin", key: "workforceAnalytics", roles: ["admin", "superadmin"] },
  { id: "superadmin", key: "systemConsole", roles: ["superadmin"] },
  { id: "reports", key: "reports", roles: "all" },
  { id: "profile", key: "profile", roles: "all" },
];

function initialRole(role?: string | null): PortalRole {
  if (role === "SUPER_ADMIN") return "superadmin";
  if (role === "ADMIN") return "admin";
  if (role === "TRAINER") return "trainer";
  return "learner";
}

function initialView(role?: string | null): PortalView {
  const normalized = initialRole(role);
  if (normalized === "trainer") return "trainer";
  if (normalized === "admin") return "admin";
  if (normalized === "superadmin") return "superadmin";
  return "dashboard";
}

function StatCard({ label, value, note }: { label: string; value: string | number; note: string }) {
  return <article className="portalStatCard"><span>{label}</span><strong>{value}</strong><small>{note}</small></article>;
}

function DemoBanner({ text }: { text: string }) {
  return <div className="noticePanel demoDataBanner">ⓘ {text}</div>;
}

function Empty({ text }: { text: string }) {
  return <div className="portalEmptyState">{text}</div>;
}

function Pill({ priority }: { priority: string }) {
  const p = priority.toUpperCase();
  return <span className={`pill ${p === "HIGH" || p === "CRITICAL" ? "danger" : p === "MODERATE" ? "warning" : "neutral"}`}>{p}</span>;
}

export function PortalExperience(props: Props) {
  const t = portalMessages[props.locale];
  const role = initialRole(props.actualRole);
  const [view, setView] = useState<PortalView>(() => initialView(props.actualRole));
  const [fontLevel, setFontLevel] = useState(1);
  const [contrast, setContrast] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const nav = useMemo(() => navConfig.filter((item) => item.roles === "all" || item.roles.includes(role)), [role]);
  const firstName = props.fullName?.split(" ")[0] || t.learner;
  const learningProgress = props.courses.length
    ? `${Math.round(props.courses.reduce((sum, course) => sum + course.progress, 0) / props.courses.length)}%`
    : t.unavailable;
  const highPriorityGaps = props.gaps.filter((gap) => gap.priority.toUpperCase() === "HIGH" || gap.priority.toUpperCase() === "CRITICAL").length;
  const loopTargets = useMemo<PortalView[]>(() => {
    if (role === "learner") return ["profile", "framework", "advisor", "igot", "assessment", "reports"];
    if (role === "trainer") return ["profile", "framework", "trainer", "igot", "generator", "reports"];
    if (role === "admin") return ["profile", "framework", "admin", "igot", "generator", "reports"];
    return ["profile", "framework", "admin", "igot", "generator", "reports"];
  }, [role]);
  const notifications = useMemo(() => {
    if (role !== "learner") {
      const target: PortalView = role === "trainer" ? "trainer" : role === "admin" ? "admin" : "superadmin";
      return [{ id: "workspace", title: t.roleWorkspaceReady, detail: t.roleWorkspaceReadyHint, target }];
    }
    const items: Array<{ id: string; title: string; detail: string; target: PortalView }> = [];
    if (!props.assessmentsCompleted) items.push({ id: "assessment", title: t.assessmentDue, detail: t.assessmentDueHint, target: "assessment" });
    if (highPriorityGaps) items.push({ id: "gaps", title: t.priorityGapAlert, detail: t.priorityGapAlertHint.replace("{count}", String(highPriorityGaps)), target: "advisor" });
    const activeCourses = props.courses.filter((course) => course.progress < 100).length;
    if (activeCourses) items.push({ id: "learning", title: t.learningReminder, detail: t.learningReminderHint.replace("{count}", String(activeCourses)), target: "learning" });
    return items;
  }, [highPriorityGaps, props.assessmentsCompleted, props.courses, role, t]);

  function go(next: PortalView) {
    const allowed = navConfig.find((item) => item.id === next);
    if (!allowed || (allowed.roles !== "all" && !allowed.roles.includes(role))) return;
    setView(next);
    setMobileOpen(false);
    setNotificationsOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return <div className={`nationalPortal fontLevel${fontLevel} ${contrast ? "highContrast" : ""}`}>
    <div className="govStrip">
      <div><strong>{t.government}</strong><span>{t.ministry}</span></div>
      <div className="govTools">
        <span>{t.font}</span>
        <button onClick={() => setFontLevel(0)} type="button">A−</button>
        <button onClick={() => setFontLevel(1)} type="button">A</button>
        <button onClick={() => setFontLevel(2)} type="button">A+</button>
        <button onClick={() => setContrast((value) => !value)} type="button">◐ {t.contrast}</button>
        <select value={props.locale} onChange={(event) => props.onLocaleChange(event.target.value as Locale)} aria-label={t.language}>
          {(["en", "hi", "te"] as Locale[]).map((locale) => <option key={locale} value={locale}>{props.localeLabels[locale]}</option>)}
        </select>
      </div>
    </div>

    <header className="portalHeader">
      <button className="portalBrand" onClick={() => go("home")} type="button">
        <span className="brandMark">SA</span>
        <span><strong>StatSkill <em>AI</em></strong><small>{t.portalSubtitle}</small></span>
      </button>
      <div className="headerActions">
        <div className="notificationControl">
          <button className="iconButton" type="button" aria-label={t.notifications} aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((value) => !value)}>
            🔔{notifications.length ? <span className="notificationCount">{notifications.length}</span> : null}
          </button>
          {notificationsOpen ? <aside className="notificationPanel" aria-label={t.notifications}>
            <div className="notificationHeading"><strong>{t.notifications}</strong><button type="button" onClick={() => setNotificationsOpen(false)} aria-label={t.closeNotifications}>×</button></div>
            {notifications.length ? notifications.map((item) => <button className="notificationItem" type="button" key={item.id} onClick={() => go(item.target)}><strong>{item.title}</strong><span>{item.detail}</span></button>) : <p>{t.noNotifications}</p>}
          </aside> : null}
        </div>
        <button className="profileChip" type="button" onClick={() => go("profile")}>
          <span>{firstName.slice(0, 1).toUpperCase()}</span>
          <div><strong>{props.fullName || t.learner}</strong><small>{props.actualRole || "OFFICIAL"}</small></div>
        </button>
        <button className="headerSignOut" type="button" onClick={props.onSignOut}>{t.signOut}</button>
        <button className="menuButton" type="button" aria-expanded={mobileOpen} onClick={() => setMobileOpen((value) => !value)}>☰</button>
      </div>
    </header>

    <nav className={`portalNav ${mobileOpen ? "open" : ""}`}>
      {nav.map((item) => <button key={item.id} type="button" className={view === item.id ? "active" : ""} onClick={() => go(item.id)}>{t[item.key]}</button>)}
    </nav>

    <main className="portalMain">
      {view === "home" && <div className="portalStack">
        <section className="heroPanel">
          <div className="heroCopy">
            <span className="heroBadge">{t.homeBadge}</span>
            <h1>{t.homeTitle}</h1>
            <p>{t.homeText}</p>
            <div className="heroActions">
              {role === "learner" && <button className="saffronButton" onClick={() => go("assessment")} type="button">{t.assessSkills}</button>}
              <button className="ghostLightButton" onClick={() => go(role === "learner" ? "advisor" : "igot")} type="button">{t.exploreLearning}</button>
              <button className="ghostLightButton" onClick={() => go("generator")} type="button">{t.aiGenerator}</button>
            </div>
          </div>
          <div className="loopCard">
            <span>{t.loopTitle}</span>
            {t.loopSteps.map((step, index) => <button type="button" key={step} onClick={() => go(loopTargets[index])}><b>{index + 1}</b><p>{step}</p><i>→</i></button>)}
          </div>
        </section>

        {role === "learner" && <section className="metricGrid five">
          <StatCard label={t.overallCompetency} value={`${props.competencyScore}%`} note={t.measuredCapability}/>
          <StatCard label={t.skillGaps} value={props.gaps.length} note={props.gaps.length ? `${highPriorityGaps} HIGH / CRITICAL` : t.noMeasuredGaps}/>
          <StatCard label={t.learningProgress} value={learningProgress} note={props.courses.length ? `${props.courses.length} items` : t.noLearningItems}/>
          <StatCard label={t.learningHours} value={props.learningHours ?? "—"} note={props.learningHours === undefined ? t.unavailable : t.measuredCapability}/>
          <StatCard label={t.assessments} value={props.assessmentsCompleted ?? "—"} note={props.assessmentsCompleted === undefined ? t.unavailable : t.measuredCapability}/>
        </section>}

        <section className="sectionBlock">
          <div className="sectionHeading"><span>{t.howBadge}</span><h2>{t.howTitle}</h2><p>{t.howText}</p></div>
          <div className="workflowGrid">{t.workflow.map(([title, text], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
        </section>
        <section className="featureGrid">{t.featureNames.map((name) => <article key={name}><strong>{name}</strong><p>{t.featureText}</p></article>)}</section>
      </div>}

      {view === "dashboard" && <div className="portalStack">
        <section className="welcomePanel">
          <div><span>{t.dashboardBadge}</span><h1>{t.goodMorning}, {firstName}</h1><p>{t.dashboardText}</p></div>
          <div><button type="button" onClick={() => go("assessment")}>{t.takeAssessment}</button><button type="button" onClick={() => go("advisor")}>{t.learningAdvisor}</button></div>
        </section>
        <section className="metricGrid five">
          <StatCard label={t.overallCompetency} value={`${props.competencyScore}%`} note={t.measuredCapability}/>
          <StatCard label={t.skillGaps} value={props.gaps.length} note={props.gaps.length ? `${highPriorityGaps} HIGH / CRITICAL` : t.noMeasuredGaps}/>
          <StatCard label={t.learningProgress} value={learningProgress} note={props.courses.length ? `${props.courses.length} items` : t.noLearningItems}/>
          <StatCard label={t.learningHours} value={props.learningHours ?? "—"} note={props.learningHours === undefined ? t.unavailable : t.measuredCapability}/>
          <StatCard label={t.assessments} value={props.assessmentsCompleted ?? "—"} note={props.assessmentsCompleted === undefined ? t.unavailable : t.measuredCapability}/>
        </section>
        <section className="dashboardSplit">
          <article className="portalCard">
            <div className="cardHeading"><h2>{t.overallCompetency}</h2><span>{t.measuredCapability}</span></div>
            <div className="profileScore"><strong>{props.competencyScore}%</strong><span>{props.gaps.length ? `${props.gaps.length} ${t.skillGaps.toLowerCase()}` : t.noMeasuredGaps}</span></div>
            <div className="miniProgress" aria-label={`${t.overallCompetency}: ${props.competencyScore}%`}><span style={{ width: `${Math.max(0, Math.min(100, props.competencyScore))}%` }}/></div>
          </article>
          <article className="portalCard">
            <div className="cardHeading"><h2>{t.priorityGaps}</h2>{props.gaps.length > 0 && <button type="button" onClick={() => go("advisor")}>{t.bridgeGaps}</button>}</div>
            {props.gaps.length ? <div className="gapList">{props.gaps.map((gap) => <div key={gap.name}><div><strong>{gap.name}</strong><small>{t.measuredCapability}</small></div><Pill priority={gap.priority}/><button type="button" onClick={() => go("advisor")}>{t.viewPath}</button></div>)}</div> : <Empty text={t.noMeasuredGaps}/>} 
          </article>
        </section>
        <section className="dashboardSplit">
          <article className="portalCard">
            <div className="cardHeading"><h2>{t.recommendedLearning}</h2>{props.courses.length > 0 && <button type="button" onClick={() => go("learning")}>{t.fullRoadmap}</button>}</div>
            {props.courses.length ? props.courses.map((course) => <div className="courseRow" key={course.id}><div><strong>{course.title}</strong><div className="miniProgress"><span style={{ width: `${course.progress}%` }}/></div></div><b>{course.progress}%</b></div>) : <Empty text={t.noLearningItems}/>} 
          </article>
          <article className="portalCard">{props.latestInsightNode}</article>
        </section>
      </div>}

      {view === "framework" && <div className="portalStack"><section className="pageIntro"><span>{t.frameworkBadge}</span><h1>{t.frameworkTitle}</h1><p>{t.frameworkText}</p></section>{props.frameworkNode}</div>}
      {view === "assessment" && <div className="portalStack"><section className="pageIntro"><span>{t.assessmentBadge}</span><h1>{t.assessmentTitle}</h1><p>{t.assessmentText}</p></section>{props.assessmentNode}</div>}
      {view === "advisor" && <div className="portalStack"><section className="pageIntro"><span>{t.advisorBadge}</span><h1>{t.advisorTitle}</h1><p>{t.advisorText}</p></section><RecommendationAdvisor locale={props.locale} onEnrollmentChanged={props.onLearningChanged}/></div>}
      {view === "learning" && <div className="portalStack"><section className="pageIntro"><span>{t.learningBadge}</span><h1>{t.learningTitle}</h1><p>{t.learningText}</p></section><LearningPathPanel locale={props.locale}/></div>}
      {view === "igot" && <div className="portalStack"><section className="pageIntro"><span>{t.igotBadge}</span><h1>{t.igotTitle}</h1><p>{t.igotText}</p></section><ExternalCatalogPanel locale={props.locale}/></div>}
      {view === "generator" && <div className="portalStack"><section className="pageIntro"><span>{t.generatorBadge}</span><h1>{t.generatorTitle}</h1><p>{t.generatorText}</p></section><section className="pipeline">{t.pipeline.map((step, index) => <span key={step}>{index + 1} {step}</span>)}</section>{props.materialsNode}{props.sourceNode}{props.aiNode}</div>}
      {view === "trainer" && <div className="portalStack"><section className="pageIntro"><span>{t.trainerBadge}</span><h1>{t.trainerTitle}</h1><p>{t.trainerText}</p></section>{props.trainerNode || <DemoBanner text={t.trainerDemo}/>}</div>}
      {view === "admin" && <div className="portalStack"><section className="pageIntro"><span>{t.adminBadge}</span><h1>{t.adminTitle}</h1><p>{t.adminText}</p></section>{props.adminNode || <DemoBanner text={t.adminUnavailable}/>}</div>}
      {view === "superadmin" && <div className="portalStack"><section className="pageIntro"><span>{t.superBadge}</span><h1>{t.superTitle}</h1><p>{t.superText}</p></section>{props.superAdminNode || <DemoBanner text={t.adminUnavailable}/>}</div>}
      {view === "reports" && <div className="portalStack"><section className="pageIntro"><span>{t.reportsBadge}</span><h1>{t.reportsTitle}</h1><p>{t.reportsText}</p></section>{props.reportsNode}</div>}
      {view === "profile" && <div className="portalStack"><section className="pageIntro profileIntro"><div className="profileAvatar">{firstName.slice(0, 1).toUpperCase()}</div><div><span>{t.profileBadge}</span><h1>{props.fullName || t.learner}</h1><p>{t.profileText}</p></div></section>{props.profileNode}<section className="metricGrid"><StatCard label={t.overallCompetency} value={`${props.competencyScore}%`} note={t.measuredCapability}/><StatCard label={t.skillGaps} value={props.gaps.length} note={t.measuredCapability}/><StatCard label={t.learningCatalog} value={props.courses.length} note={t.measuredCapability}/></section></div>}
    </main>

    <footer className="portalFooter"><div><strong>StatSkill AI</strong><p>{t.portalSubtitle}</p></div><div><strong>{t.framework}</strong><span>{t.advisor}</span><span>{t.generator}</span></div><div><strong>{t.igot}</strong><span>MoSPI</span><span>NSSTA</span></div><small>{t.demoPrivacy}</small></footer>
    <button className="floatingAssistant" type="button" onClick={() => setAssistantOpen((value) => !value)}>✦ <span>StatSkill AI</span></button>
    {assistantOpen && <aside className="assistantDrawer"><div className="cardHeading"><div><span>{t.groundedAssistant}</span><h2>{t.assistantTitle}</h2></div><button type="button" onClick={() => setAssistantOpen(false)}>×</button></div><p>{t.assistantText}</p><div className="quickPrompts"><button type="button" onClick={() => { setAssistantOpen(false); go("generator"); }}>{t.askGrounded}</button><button type="button" onClick={() => { setAssistantOpen(false); go("generator"); }}>{t.generatePractice}</button><button type="button" onClick={() => { setAssistantOpen(false); go("framework"); }}>{t.viewCompetencyGaps}</button></div><small>{t.aiDisclaimer}</small></aside>}
  </div>;
}
