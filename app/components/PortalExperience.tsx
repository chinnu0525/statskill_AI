"use client";

import { ReactNode, useMemo, useState } from "react";
import type { Locale } from "../../src/i18n/messages";
import { portalMessages } from "../../src/i18n/portal-messages";

export type PortalRole = "learner" | "trainer" | "admin" | "superadmin";
export type PortalView = "home" | "dashboard" | "framework" | "assessment" | "advisor" | "learning" | "igot" | "generator" | "trainer" | "admin" | "superadmin" | "reports" | "profile";

type Gap = { name: string; priority: string };
type Course = { id: string; title: string; progress: number };
type Profile = { designation: string; department: string; cadre: string; assignment: string; qualification: string; experienceYears: number | null; priorTraining: string };

type Props = {
  locale: Locale;
  localeLabels: Record<Locale, string>;
  fullName?: string | null;
  actualRole?: string | null;
  competencyScore: number;
  gaps: Gap[];
  courses: Course[];
  profile: Profile;
  learningHours?: number;
  assessmentsCompleted?: number;
  onLocaleChange: (locale: Locale) => void;
  onSignOut: () => void;
  materialsNode: ReactNode;
  sourceNode: ReactNode;
  aiNode: ReactNode;
  assessmentNode: ReactNode;
  adminNode?: ReactNode;
};

const navConfig: Array<{ id: PortalView; key: "home" | "dashboard" | "framework" | "assessment" | "advisor" | "learningPath" | "igot" | "generator" | "trainerHub" | "workforceAnalytics" | "systemConsole" | "reports" | "profile"; roles: PortalRole[] | "all" }> = [
  { id: "home", key: "home", roles: "all" }, { id: "dashboard", key: "dashboard", roles: ["learner"] }, { id: "framework", key: "framework", roles: "all" },
  { id: "assessment", key: "assessment", roles: ["learner"] }, { id: "advisor", key: "advisor", roles: ["learner"] }, { id: "learning", key: "learningPath", roles: ["learner"] },
  { id: "igot", key: "igot", roles: "all" }, { id: "generator", key: "generator", roles: ["learner", "trainer", "admin", "superadmin"] }, { id: "trainer", key: "trainerHub", roles: ["trainer", "superadmin"] },
  { id: "admin", key: "workforceAnalytics", roles: ["admin", "superadmin"] }, { id: "superadmin", key: "systemConsole", roles: ["superadmin"] }, { id: "reports", key: "reports", roles: "all" }, { id: "profile", key: "profile", roles: "all" },
];

const competencyDomains = [
  { name: "Statistical", items: ["Survey Design", "Sampling", "National Accounts", "Price Statistics", "Labour Statistics", "Data Quality"] },
  { name: "Technical", items: ["Python", "R", "SQL", "GIS", "Data Visualization", "AI / ML", "APIs & Open Data"] },
  { name: "Digital Governance", items: ["Cybersecurity", "Data Privacy", "Digital Signatures", "Government Cloud", "Digital Public Infrastructure"] },
  { name: "Behavioural & Managerial", items: ["Leadership", "Communication", "Project Management", "Ethics", "Decision Making", "Change Management"] },
];

const weights = [["Gap", 30], ["Role", 20], ["Career", 15], ["Department", 15], ["Prior", 10], ["Demand", 10]] as const;
const demoRecommendations = [
  { title: "Python for Official Statistics", source: "IGOT_MOCK", score: 92, competency: "Python" },
  { title: "Advanced Survey Sampling", source: "NSSTA_MOCK", score: 88, competency: "Sampling" },
  { title: "Data Quality & Metadata Governance", source: "TPAC_DEMO", score: 83, competency: "Data Quality" },
];
const roadmap = [["01", "Foundation", "2 weeks", 70], ["02", "Applied Practice", "3 weeks", 35], ["03", "Advanced Capability", "4 weeks", 0], ["04", "Assessment & Evidence", "1 week", 0]] as const;

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
function StatCard({ label, value, note }: { label: string; value: string | number; note: string }) { return <article className="portalStatCard"><span>{label}</span><strong>{value}</strong><small>{note}</small></article>; }
function DemoBanner({ text }: { text: string }) { return <div className="noticePanel demoDataBanner">ⓘ {text}</div>; }
function Empty({ text }: { text: string }) { return <div className="portalEmptyState">{text}</div>; }
function Pill({ priority }: { priority: string }) { const p = priority.toUpperCase(); return <span className={`pill ${p === "HIGH" || p === "CRITICAL" ? "danger" : p === "MEDIUM" ? "warning" : "neutral"}`}>{p}</span>; }
function Radar() { return <div className="radarWrap"><svg viewBox="0 0 320 260" role="img"><g fill="none" stroke="currentColor" opacity=".18"><polygon points="160,25 270,90 230,220 90,220 50,90"/><polygon points="160,58 238,105 210,194 110,194 82,105"/><polygon points="160,90 205,120 190,168 130,168 115,120"/></g><polygon points="160,46 250,104 212,204 108,185 72,106" fill="rgba(249,115,22,.11)" stroke="#f97316" strokeWidth="2"/><polygon points="160,73 220,117 190,178 122,162 94,120" fill="rgba(37,99,235,.15)" stroke="#2563eb" strokeWidth="3"/></svg></div>; }

export function PortalExperience(props: Props) {
  const t = portalMessages[props.locale];
  const [view, setView] = useState<PortalView>(() => initialView(props.actualRole));
  const [role, setRole] = useState<PortalRole>(() => initialRole(props.actualRole));
  const [fontLevel, setFontLevel] = useState(1);
  const [contrast, setContrast] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [whyCourse, setWhyCourse] = useState<(typeof demoRecommendations)[number] | null>(null);
  const nav = useMemo(() => navConfig.filter((item) => item.roles === "all" || item.roles.includes(role)), [role]);
  const firstName = props.fullName?.split(" ")[0] || t.learner;
  const learningProgress = props.courses.length ? `${Math.round(props.courses.reduce((sum, course) => sum + course.progress, 0) / props.courses.length)}%` : t.unavailable;
  function go(next: PortalView) { setView(next); setMobileOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }

  return <div className={`nationalPortal fontLevel${fontLevel} ${contrast ? "highContrast" : ""}`}>
    <div className="govStrip"><div><strong>{t.government}</strong><span>{t.ministry}</span></div><div className="govTools"><span>{t.font}</span><button onClick={() => setFontLevel(0)} type="button">A−</button><button onClick={() => setFontLevel(1)} type="button">A</button><button onClick={() => setFontLevel(2)} type="button">A+</button><button onClick={() => setContrast((v) => !v)} type="button">◐ {t.contrast}</button><select value={props.locale} onChange={(e) => props.onLocaleChange(e.target.value as Locale)} aria-label={t.language}>{(["en","hi","te"] as Locale[]).map((l) => <option key={l} value={l}>{props.localeLabels[l]}</option>)}</select></div></div>
    <header className="portalHeader"><button className="portalBrand" onClick={() => go("home")} type="button"><span className="brandMark">SA</span><span><strong>StatSkill <em>AI</em></strong><small>{t.portalSubtitle}</small></span></button><div className="headerActions"><label className="demoRoleSwitcher"><span>{t.demoRole}</span><select value={role} onChange={(e) => { const next=e.target.value as PortalRole; setRole(next); const allowed=navConfig.find((n)=>n.id===view); if(allowed && allowed.roles!=="all" && !allowed.roles.includes(next)) setView("home"); }}><option value="learner">{t.learner}</option><option value="trainer">{t.trainerRole}</option><option value="admin">{t.administrator}</option><option value="superadmin">{t.superAdministrator}</option></select></label><button className="iconButton" type="button" aria-label="Notifications">🔔</button><button className="profileChip" type="button" onClick={() => go("profile")}><span>{firstName.slice(0,1).toUpperCase()}</span><div><strong>{props.fullName || t.learner}</strong><small>{props.actualRole || "OFFICIAL"}</small></div></button><button className="headerSignOut" type="button" onClick={props.onSignOut}>{t.signOut}</button><button className="menuButton" type="button" onClick={() => setMobileOpen((v)=>!v)}>☰</button></div></header>
    <nav className={`portalNav ${mobileOpen ? "open" : ""}`}>{nav.map((item)=><button key={item.id} type="button" className={view===item.id?"active":""} onClick={()=>go(item.id)}>{t[item.key]}</button>)}</nav>
    <main className="portalMain">
      {view === "home" && <div className="portalStack"><section className="heroPanel"><div className="heroCopy"><span className="heroBadge">{t.homeBadge}</span><h1>{t.homeTitle}</h1><p>{t.homeText}</p><div className="heroActions"><button className="saffronButton" onClick={()=>go("assessment")} type="button">{t.assessSkills}</button><button className="ghostLightButton" onClick={()=>go("advisor")} type="button">{t.exploreLearning}</button><button className="ghostLightButton" onClick={()=>go("generator")} type="button">{t.aiGenerator}</button></div></div><div className="loopCard"><span>{t.loopTitle}</span>{t.loopSteps.map((step,i)=><div key={step}><b>{i+1}</b><p>{step}</p>{i<5&&<i>→</i>}</div>)}</div></section><DemoBanner text={t.demoNotice}/><section className="metricGrid"><StatCard label={t.competencyDomains} value="10+" note={t.illustrativeMetric}/><StatCard label={t.skillsMapped} value="100+" note={t.illustrativeMetric}/><StatCard label={t.learningCatalog} value="2,486+" note={t.illustrativeMetric}/><StatCard label={t.activeOfficials} value="12,480+" note={t.illustrativeMetric}/><StatCard label={t.groundedAssessment} value="98.4%" note={t.illustrativeMetric}/><StatCard label={t.averageGain} value="+6.2%" note={t.illustrativeMetric}/></section><section className="sectionBlock"><div className="sectionHeading"><span>{t.howBadge}</span><h2>{t.howTitle}</h2><p>{t.howText}</p></div><div className="workflowGrid">{t.workflow.map(([title,text],i)=><article key={title}><span>0{i+1}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section><section className="featureGrid">{t.featureNames.map((name)=><article key={name}><strong>{name}</strong><p>{t.featureText}</p></article>)}</section></div>}
      {view === "dashboard" && <div className="portalStack"><section className="welcomePanel"><div><span>{t.dashboardBadge}</span><h1>{t.goodMorning}, {firstName}</h1><p>{t.dashboardText}</p></div><div><button type="button" onClick={()=>go("assessment")}>{t.takeAssessment}</button><button type="button" onClick={()=>go("advisor")}>{t.learningAdvisor}</button></div></section><section className="metricGrid five"><StatCard label={t.overallCompetency} value={`${props.competencyScore}%`} note={t.measuredCapability}/><StatCard label={t.skillGaps} value={props.gaps.length} note={props.gaps.length ? `${props.gaps.filter(g=>g.priority==="HIGH").length} HIGH` : t.noMeasuredGaps}/><StatCard label={t.learningProgress} value={learningProgress} note={props.courses.length ? `${props.courses.length} items` : t.noLearningItems}/><StatCard label={t.learningHours} value={props.learningHours ?? "—"} note={t.unavailable}/><StatCard label={t.assessments} value={props.assessmentsCompleted ?? "—"} note={t.unavailable}/></section><section className="dashboardSplit"><article className="portalCard"><div className="cardHeading"><h2>{t.competencyRadar}</h2><span>{t.currentVsRequired}</span></div><Radar/></article><article className="portalCard"><div className="cardHeading"><h2>{t.priorityGaps}</h2>{props.gaps.length>0&&<button type="button" onClick={()=>go("advisor")}>{t.bridgeGaps}</button>}</div>{props.gaps.length?<div className="gapList">{props.gaps.map(g=><div key={g.name}><div><strong>{g.name}</strong><small>{t.measuredCapability}</small></div><Pill priority={g.priority}/><button type="button" onClick={()=>go("advisor")}>{t.viewPath}</button></div>)}</div>:<Empty text={t.noMeasuredGaps}/>}</article></section><section className="dashboardSplit"><article className="portalCard"><div className="cardHeading"><h2>{t.recommendedLearning}</h2>{props.courses.length>0&&<button type="button" onClick={()=>go("learning")}>{t.fullRoadmap}</button>}</div>{props.courses.length?props.courses.map(c=><div className="courseRow" key={c.id}><div><strong>{c.title}</strong><div className="miniProgress"><span style={{width:`${c.progress}%`}}/></div></div><b>{c.progress}%</b></div>):<Empty text={t.noLearningItems}/>}</article><article className="portalCard"><h2>{t.latestInsight}</h2><Empty text={t.noAssessmentInsight}/></article></section></div>}
      {view === "framework" && <div className="portalStack"><section className="pageIntro"><span>{t.frameworkBadge}</span><h1>{t.frameworkTitle}</h1><p>{t.frameworkText}</p></section><div className="domainGrid">{competencyDomains.map((d,di)=><article className="portalCard" key={d.name}><div className="domainHeader"><span>Domain {di+1}</span><h2>{d.name}</h2></div>{d.items.map((item,i)=><div className="competencyRow" key={item}><div><strong>{item}</strong><small>L{(i%3)+2} {t.current} · L4 {t.required}</small></div><div className="levelDots">{[1,2,3,4,5].map(l=><i key={l} className={l<=((i%3)+2)?"filled":""}/>)}</div></div>)}</article>)}</div><section className="portalCard proficiencyScale"><h2>{t.proficiencyModel}</h2>{["L1","L2","L3","L4","L5"].map(l=><span key={l}>{l}</span>)}</section></div>}
      {view === "assessment" && <div className="portalStack"><section className="pageIntro"><span>{t.assessmentBadge}</span><h1>{t.assessmentTitle}</h1><p>{t.assessmentText}</p></section>{props.assessmentNode}</div>}
      {view === "advisor" && <div className="portalStack"><section className="pageIntro"><span>{t.advisorBadge}</span><h1>{t.advisorTitle}</h1><p>{t.advisorText}</p></section><DemoBanner text={t.demoNotice}/><section className="weightBar">{weights.map(([label,w])=><div key={label} style={{flex:w}}><strong>{w}%</strong><span>{label}</span></div>)}</section><div className="recommendationGrid">{demoRecommendations.map(course=><article className="portalCard recommendationCard" key={course.title}><div className="cardHeading"><span className="sourceBadge">{course.source}</span><strong>{course.score}/100</strong></div><h2>{course.title}</h2><span className="competencyTag">{course.competency}</span><div className="cardActions"><button type="button" onClick={()=>setWhyCourse(course)}>{t.whyCourse}</button><button type="button" className="primary">{t.enrollContinue}</button></div></article>)}</div></div>}
      {view === "learning" && <div className="portalStack"><section className="pageIntro"><span>{t.learningBadge}</span><h1>{t.learningTitle}</h1><p>{t.learningText}</p></section><DemoBanner text={t.demoNotice}/><div className="roadmap">{roadmap.map(([phase,title,duration,progress])=><article key={phase}><span className="phaseNumber">{phase}</span><div><small>{duration}</small><h2>{title}</h2><div className="miniProgress"><span style={{width:`${progress}%`}}/></div><b>{progress?`${progress}% ${t.complete}`:t.notStarted}</b></div></article>)}</div></div>}
      {view === "igot" && <div className="portalStack"><section className="pageIntro"><span>{t.igotBadge}</span><h1>{t.igotTitle}</h1><p>{t.igotText}</p></section><DemoBanner text={t.demoNotice}/><section className="syncBanner"><div><span className="statusDot"/> {t.mockSyncHealthy}</div><div>{t.mockAdapters}: IGOT_MOCK · NSSTA_MOCK</div></section><div className="catalogGrid">{demoRecommendations.map(course=><article className="portalCard" key={course.title}><span className="sourceBadge">{course.source}</span><h2>{course.title}</h2><div className="catalogMeta"><span>{course.competency}</span><span>Self-paced</span></div><button type="button" className="primaryAction">{t.viewLearningItem}</button></article>)}</div></div>}
      {view === "generator" && <div className="portalStack"><section className="pageIntro"><span>{t.generatorBadge}</span><h1>{t.generatorTitle}</h1><p>{t.generatorText}</p></section><section className="pipeline">{t.pipeline.map((step,i)=><span key={step}>{i+1} {step}</span>)}</section>{props.materialsNode}{props.sourceNode}{props.aiNode}</div>}
      {view === "trainer" && <div className="portalStack"><section className="pageIntro"><span>{t.trainerBadge}</span><h1>{t.trainerTitle}</h1><p>{t.trainerText}</p></section><DemoBanner text={t.trainerDemo}/><section className="metricGrid"><StatCard label="Pending QA" value="18" note={t.demoNotice}/><StatCard label="Approved" value="42" note={t.demoNotice}/><StatCard label="Cohorts" value="6" note={t.demoNotice}/><StatCard label="Weak topics" value="9" note={t.demoNotice}/></section><section className="portalCard"><h2>{t.trainerHub}</h2>{["Sampling frame bias","CPI elementary aggregates","Metadata quality checks"].map((x,i)=><div className="reviewRow" key={x}><div><strong>{x}</strong><small>DEMO · Source S{i+1}</small></div><Pill priority={i===0?"HIGH":"MEDIUM"}/></div>)}</section></div>}
      {view === "admin" && <div className="portalStack"><section className="pageIntro"><span>{t.adminBadge}</span><h1>{t.adminTitle}</h1><p>{t.adminText}</p></section>{props.adminNode || <DemoBanner text={t.adminUnavailable}/>}<DemoBanner text={t.demoNotice}/><section className="dashboardSplit"><article className="portalCard"><h2>Department heatmap · DEMO</h2><div className="heatmap">{["NSO Survey","National Accounts","Price Statistics","Field Operations","Data Innovation"].map((d,r)=><div key={d}><span>{d}</span>{[1,2,3,4,5].map(c=><i key={c} style={{opacity:.25+(((r+c)%5)*.16)}}/>)}</div>)}</div></article><article className="portalCard"><h2>Future skills · DEMO</h2>{[["AI / ML",86],["Cloud & APIs",78],["Geospatial analytics",73]].map(([s,v])=><div className="barRow" key={String(s)}><span>{s}</span><div><i style={{width:`${v}%`}}/></div><b>{v}</b></div>)}</article></section></div>}
      {view === "superadmin" && <div className="portalStack"><section className="pageIntro"><span>{t.superBadge}</span><h1>{t.superTitle}</h1><p>{t.superText}</p></section><DemoBanner text={t.demoNotice}/><section className="portalCard">{["Supabase Auth + RLS","Private learning-material storage","JWT assessment scorer","iGOT adapter (MOCK)","NSSTA adapter (MOCK)","Audit event stream"].map((x,i)=><div className="systemRow" key={x}><span>{x}</span><b className={i<3||i===5?"ok":"mock"}>{i<3||i===5?"Operational":"MOCK"}</b></div>)}</section></div>}
      {view === "reports" && <div className="portalStack"><section className="pageIntro"><span>{t.reportsBadge}</span><h1>{t.reportsTitle}</h1><p>{t.reportsText}</p></section><DemoBanner text={t.demoNotice}/><div className="reportGrid">{["Individual competency profile","Assessment performance","Learning completion","Department gap analysis","Training effectiveness","Future skill readiness"].map(report=><article className="portalCard" key={report}><span className="reportIcon">▤</span><h2>{report}</h2><div className="cardActions"><button type="button">{t.preview}</button><button type="button" className="primary">{t.export}</button></div></article>)}</div></div>}
      {view === "profile" && <div className="portalStack"><section className="pageIntro profileIntro"><div className="profileAvatar">{firstName.slice(0,1).toUpperCase()}</div><div><span>{t.profileBadge}</span><h1>{props.fullName || t.learner}</h1><p>{t.profileText}</p></div><button type="button">{t.editProfile}</button></section><section className="dashboardSplit"><article className="portalCard profileDetails"><h2>{t.officialDetails}</h2>{[[t.designation,props.profile.designation],[t.department,props.profile.department],[t.cadre,props.profile.cadre],[t.assignment,props.profile.assignment],[t.qualification,props.profile.qualification],[t.experience,props.profile.experienceYears===null?"":String(props.profile.experienceYears)]].map(([label,value])=><div key={label}><span>{label}</span><strong>{value || t.notProvided}</strong></div>)}</article><article className="portalCard"><h2>{t.competencyLearningSummary}</h2><div className="profileScore"><strong>{props.competencyScore}%</strong><span>{t.overallCompetency}</span></div><p>{props.gaps.length} {t.skillGaps} · {props.courses.length} {t.learningCatalog}</p></article></section><section className="portalCard"><h2>{t.priorTrainingHistory}</h2>{props.profile.priorTraining?<p>{props.profile.priorTraining}</p>:<Empty text={t.notProvided}/>}</section></div>}
    </main>
    <footer className="portalFooter"><div><strong>StatSkill AI</strong><p>{t.portalSubtitle}</p></div><div><strong>{t.framework}</strong><span>{t.advisor}</span><span>{t.generator}</span></div><div><strong>{t.igot}</strong><span>MoSPI</span><span>NSSTA</span></div><small>{t.demoPrivacy}</small></footer>
    <button className="floatingAssistant" type="button" onClick={()=>setAssistantOpen(v=>!v)}>✦ <span>StatSkill AI</span></button>
    {assistantOpen&&<aside className="assistantDrawer"><div className="cardHeading"><div><span>{t.groundedAssistant}</span><h2>{t.assistantTitle}</h2></div><button type="button" onClick={()=>setAssistantOpen(false)}>×</button></div><p>{t.assistantText}</p><div className="quickPrompts"><button type="button" onClick={()=>{setAssistantOpen(false);go("generator")}}>{t.askGrounded}</button><button type="button" onClick={()=>{setAssistantOpen(false);go("generator")}}>{t.generatePractice}</button><button type="button" onClick={()=>{setAssistantOpen(false);go("framework")}}>{t.viewCompetencyGaps}</button></div><small>{t.aiDisclaimer}</small></aside>}
    {whyCourse&&<div className="modalBackdrop" role="dialog" aria-modal="true"><div className="portalModal"><div className="cardHeading"><h2>{t.whyCourse}: {whyCourse.title}</h2><button type="button" onClick={()=>setWhyCourse(null)}>×</button></div><DemoBanner text={t.demoNotice}/><div className="scoreBreakdown">{weights.map(([label,w],i)=><div key={label}><span>{label} ({w}%)</span><div><i style={{width:`${80-i*5}%`}}/></div><b>{80-i*3}</b></div>)}</div><button type="button" className="primaryAction" onClick={()=>setWhyCourse(null)}>OK</button></div></div>}
  </div>;
}
