"use client";

import { ReactNode, useMemo, useState } from "react";
import type { Locale } from "../../src/i18n/messages";

export type PortalRole = "learner" | "trainer" | "admin" | "superadmin";
export type PortalView =
  | "home"
  | "dashboard"
  | "framework"
  | "assessment"
  | "advisor"
  | "learning"
  | "igot"
  | "generator"
  | "trainer"
  | "admin"
  | "superadmin"
  | "reports"
  | "profile";

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
  materialsNode: ReactNode;
  sourceNode: ReactNode;
  aiNode: ReactNode;
  assessmentNode: ReactNode;
  adminNode?: ReactNode;
};

const navItems: Array<{ id: PortalView; label: string; roles: PortalRole[] | "all" }> = [
  { id: "home", label: "Home", roles: "all" },
  { id: "dashboard", label: "Dashboard", roles: ["learner"] },
  { id: "framework", label: "Competency Framework", roles: "all" },
  { id: "assessment", label: "Assessment", roles: ["learner"] },
  { id: "advisor", label: "AI Advisor", roles: ["learner"] },
  { id: "learning", label: "Learning Path", roles: ["learner"] },
  { id: "igot", label: "iGOT Karmayogi", roles: "all" },
  { id: "generator", label: "AI Assessment Generator", roles: ["learner", "trainer", "admin", "superadmin"] },
  { id: "trainer", label: "Trainer Hub", roles: ["trainer", "superadmin"] },
  { id: "admin", label: "Workforce Analytics", roles: ["admin", "superadmin"] },
  { id: "superadmin", label: "System Console", roles: ["superadmin"] },
  { id: "reports", label: "Reports", roles: "all" },
  { id: "profile", label: "Profile", roles: "all" },
];

const competencyDomains = [
  { name: "Statistical", items: ["Survey Design", "Sampling", "National Accounts", "Price Statistics", "Labour Statistics", "Data Quality"] },
  { name: "Technical", items: ["Python", "R", "SQL", "GIS", "Data Visualization", "AI / ML", "APIs & Open Data"] },
  { name: "Digital Governance", items: ["Cybersecurity", "Data Privacy", "Digital Signatures", "Government Cloud", "Digital Public Infrastructure"] },
  { name: "Behavioural & Managerial", items: ["Leadership", "Communication", "Project Management", "Ethics", "Decision Making", "Change Management"] },
];

const recommendationWeights = [
  ["Competency gap", 30],
  ["Role alignment", 20],
  ["Career pathway", 15],
  ["Department priority", 15],
  ["Prior learning", 10],
  ["Future demand", 10],
] as const;

const demoRecommendations = [
  { title: "Python for Official Statistics", source: "iGOT_MOCK", score: 92, competency: "Python", reason: "Bridges a high-priority technical gap for data processing and reproducible analysis." },
  { title: "Advanced Survey Sampling", source: "NSSTA_MOCK", score: 88, competency: "Sampling", reason: "Matches survey assignment needs and strengthens statistical methodology depth." },
  { title: "Data Quality & Metadata Governance", source: "TPAC_DEMO", score: 83, competency: "Data Quality", reason: "Supports departmental data quality priorities and future metadata standards." },
];

const learningRoadmap = [
  { phase: "01", title: "Foundation", duration: "2 weeks", items: ["Python foundations", "Data quality essentials"], progress: 70 },
  { phase: "02", title: "Applied Practice", duration: "3 weeks", items: ["Survey sampling lab", "SQL for official datasets"], progress: 35 },
  { phase: "03", title: "Advanced Capability", duration: "4 weeks", items: ["GIS for field operations", "AI/ML for statistical workflows"], progress: 0 },
  { phase: "04", title: "Assessment & Evidence", duration: "1 week", items: ["Source-grounded assessment", "Competency reassessment"], progress: 0 },
];

function PriorityPill({ priority }: { priority: string }) {
  const normalized = priority.toUpperCase();
  const className = normalized === "HIGH" || normalized === "CRITICAL" ? "pill danger" : normalized === "MEDIUM" ? "pill warning" : "pill neutral";
  return <span className={className}>{normalized}</span>;
}

function StatCard({ label, value, note }: { label: string; value: string | number; note: string }) {
  return (
    <article className="portalStatCard">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

function RadarGraphic() {
  return (
    <div className="radarWrap" aria-label="Competency radar comparing current and target capability">
      <svg viewBox="0 0 320 260" role="img">
        <g fill="none" stroke="currentColor" opacity="0.18">
          <polygon points="160,25 270,90 230,220 90,220 50,90" />
          <polygon points="160,58 238,105 210,194 110,194 82,105" />
          <polygon points="160,90 205,120 190,168 130,168 115,120" />
        </g>
        <polygon points="160,46 250,104 212,204 108,185 72,106" fill="rgba(249,115,22,.11)" stroke="#f97316" strokeWidth="2" />
        <polygon points="160,73 220,117 190,178 122,162 94,120" fill="rgba(37,99,235,.15)" stroke="#2563eb" strokeWidth="3" />
        <g className="radarLabels" fill="currentColor">
          <text x="160" y="16" textAnchor="middle">Statistical</text>
          <text x="288" y="93">Technical</text>
          <text x="234" y="244">Digital</text>
          <text x="38" y="244">Behavioural</text>
          <text x="0" y="93">Leadership</text>
        </g>
      </svg>
      <div className="radarLegend"><span><i className="dot current" /> Current</span><span><i className="dot target" /> Required</span></div>
    </div>
  );
}

function initialPortalRole(actualRole?: string | null): PortalRole {
  if (actualRole === "SUPER_ADMIN") return "superadmin";
  if (actualRole === "ADMIN") return "admin";
  if (actualRole === "TRAINER") return "trainer";
  return "learner";
}

export function PortalExperience(props: Props) {
  const [activeView, setActiveView] = useState<PortalView>("dashboard");
  const [demoRole, setDemoRole] = useState<PortalRole>(() => initialPortalRole(props.actualRole));
  const [fontLevel, setFontLevel] = useState(1);
  const [highContrast, setHighContrast] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [whyCourse, setWhyCourse] = useState<typeof demoRecommendations[number] | null>(null);

  const availableNav = useMemo(() => navItems.filter((item) => item.roles === "all" || item.roles.includes(demoRole)), [demoRole]);
  const firstName = props.fullName?.split(" ")[0] || "Official";
  const displayedGaps = props.gaps.length ? props.gaps : [
    { name: "Advanced Survey Sampling", priority: "HIGH" },
    { name: "Python for Statistical Workflows", priority: "HIGH" },
    { name: "Data Quality & Metadata", priority: "MEDIUM" },
  ];
  const displayedCourses = props.courses.length ? props.courses : [
    { id: "demo-1", title: "Python for Official Statistics", progress: 42 },
    { id: "demo-2", title: "GIS Fundamentals", progress: 18 },
  ];

  function navigate(view: PortalView) {
    setActiveView(view);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className={`nationalPortal fontLevel${fontLevel} ${highContrast ? "highContrast" : ""}`}>
      <div className="govStrip">
        <div><strong>GOVERNMENT OF INDIA</strong><span>Ministry of Statistics & Programme Implementation (MoSPI)</span></div>
        <div className="govTools">
          <span>Font</span>
          <button type="button" onClick={() => setFontLevel(0)} aria-label="Decrease font size">A−</button>
          <button type="button" onClick={() => setFontLevel(1)} aria-label="Standard font size">A</button>
          <button type="button" onClick={() => setFontLevel(2)} aria-label="Increase font size">A+</button>
          <button type="button" onClick={() => setHighContrast((value) => !value)} aria-pressed={highContrast}>◐ Contrast</button>
          <select value={props.locale} onChange={(event) => props.onLocaleChange(event.target.value as Locale)} aria-label="Language">
            {(["en", "hi", "te"] as Locale[]).map((locale) => <option key={locale} value={locale}>{props.localeLabels[locale]}</option>)}
          </select>
        </div>
      </div>

      <header className="portalHeader">
        <button className="portalBrand" type="button" onClick={() => navigate("home")}>
          <span className="brandMark">SA</span>
          <span><strong>StatSkill <em>AI</em></strong><small>National Competency & Learning Portal for Official Statistics</small></span>
        </button>
        <div className="headerActions">
          <label className="demoRoleSwitcher">
            <span>Demo role</span>
            <select value={demoRole} onChange={(event) => {
              const role = event.target.value as PortalRole;
              setDemoRole(role);
              const permitted = navItems.find((item) => item.id === activeView);
              if (permitted && permitted.roles !== "all" && !permitted.roles.includes(role)) setActiveView("home");
            }}>
              <option value="learner">Learner</option>
              <option value="trainer">Trainer / Faculty</option>
              <option value="admin">Administrator</option>
              <option value="superadmin">Super Administrator</option>
            </select>
          </label>
          <button type="button" className="iconButton" aria-label="Notifications">🔔</button>
          <button type="button" className="profileChip" onClick={() => navigate("profile")}><span>{firstName.slice(0, 1).toUpperCase()}</span><div><strong>{props.fullName || "Official User"}</strong><small>{props.actualRole || "OFFICIAL"}</small></div></button>
          <button type="button" className="headerSignOut" onClick={props.onSignOut}>Sign out</button>
          <button type="button" className="menuButton" onClick={() => setMobileOpen((value) => !value)} aria-expanded={mobileOpen}>☰</button>
        </div>
      </header>

      <nav className={`portalNav ${mobileOpen ? "open" : ""}`} aria-label="Platform navigation">
        {availableNav.map((item) => <button key={item.id} type="button" className={activeView === item.id ? "active" : ""} onClick={() => navigate(item.id)}>{item.label}</button>)}
      </nav>

      <main className="portalMain">
        {activeView === "home" ? (
          <div className="portalStack">
            <section className="heroPanel">
              <div className="heroCopy">
                <span className="heroBadge">AI-Powered Capacity Building for India&apos;s Official Statistical System</span>
                <h1>Build a future-ready statistical workforce with measurable competency intelligence.</h1>
                <p>Assess capabilities, identify skill gaps, recommend personalized iGOT and NSSTA learning, generate grounded assessments, and continuously measure improvement.</p>
                <div className="heroActions">
                  <button className="saffronButton" type="button" onClick={() => navigate("assessment")}>Assess my skills</button>
                  <button className="ghostLightButton" type="button" onClick={() => navigate("advisor")}>Explore learning pathways</button>
                  <button className="ghostLightButton" type="button" onClick={() => navigate("generator")}>AI assessment generator</button>
                </div>
              </div>
              <div className="loopCard">
                <span>360° competency improvement loop</span>
                {["Official profile", "Competencies", "Skill gaps", "iGOT learning", "AI assessment", "Score growth"].map((step, index) => <div key={step}><b>{index + 1}</b><p>{step}</p>{index < 5 ? <i>→</i> : null}</div>)}
              </div>
            </section>

            <section className="metricGrid">
              <StatCard label="Competency domains" value="10+" note="Official Statistics framework" />
              <StatCard label="Official skills mapped" value="100+" note="Role and assignment aligned" />
              <StatCard label="Learning catalog" value="2,486+" note="iGOT / NSSTA demo catalog" />
              <StatCard label="Active officials" value="12,480+" note="Illustrative national scale" />
              <StatCard label="Grounded assessment" value="98.4%" note="Prototype QA benchmark" />
              <StatCard label="Average gain" value="+6.2%" note="Illustrative competency delta" />
            </section>

            <section className="sectionBlock">
              <div className="sectionHeading"><span>Systematic capacity building</span><h2>How StatSkill AI closes the competency loop</h2><p>Individual development is linked to official role expectations, departmental priorities and future skill demand.</p></div>
              <div className="workflowGrid">
                {[
                  ["01", "Build Profile", "Designation, cadre, department, qualifications, experience and current assignments."],
                  ["02", "Assess Competencies", "Benchmark statistical, technical, digital-governance and behavioural proficiency."],
                  ["03", "Identify Gaps", "Compare current proficiency with role-specific target competency levels."],
                  ["04", "Personalize Learning", "Prioritize iGOT, NSSTA and TPAC learning with explainable scoring."],
                  ["05", "Reassess & Update", "Generate grounded quizzes, score securely and refresh the competency profile."],
                ].map(([num, title, text]) => <article key={num}><span>{num}</span><h3>{title}</h3><p>{text}</p></article>)}
              </div>
            </section>

            <section className="featureGrid">
              {["Competency intelligence", "Explainable learning advisor", "Grounded AI assessment", "Timed quiz player", "Trainer QA console", "Workforce analytics", "Multilingual access", "Accessibility controls"].map((feature) => <article key={feature}><strong>{feature}</strong><p>Integrated into one role-aware national capacity-building experience.</p></article>)}
            </section>
          </div>
        ) : null}

        {activeView === "dashboard" ? (
          <div className="portalStack">
            <section className="welcomePanel"><div><span>Official cadre workspace</span><h1>Good morning, {firstName}</h1><p>Your competency and learning overview is aligned to your current role and assignments.</p></div><div><button onClick={() => navigate("assessment")} type="button">Take skill assessment</button><button onClick={() => navigate("advisor")} type="button">AI learning advisor</button></div></section>
            <section className="metricGrid five">
              <StatCard label="Overall competency" value={`${props.competencyScore || 68}%`} note="Current measured capability" />
              <StatCard label="Skill gaps" value={displayedGaps.length} note={`${displayedGaps.filter((gap) => gap.priority === "HIGH").length} high priority`} />
              <StatCard label="Learning progress" value="42%" note="Across active pathways" />
              <StatCard label="Learning hours" value={props.learningHours || 24} note="Target: 50 hours / year" />
              <StatCard label="Assessments" value={props.assessmentsCompleted || 3} note="Securely scored" />
            </section>
            <section className="dashboardSplit">
              <article className="portalCard"><div className="cardHeading"><h2>Competency radar profile</h2><span>Current vs required</span></div><RadarGraphic /></article>
              <article className="portalCard"><div className="cardHeading"><h2>Prioritized competency gaps</h2><button type="button" onClick={() => navigate("advisor")}>Bridge gaps</button></div><div className="gapList">{displayedGaps.map((gap) => <div key={gap.name}><div><strong>{gap.name}</strong><small>Current L2 → Required L4</small></div><PriorityPill priority={gap.priority} /><button type="button" onClick={() => navigate("advisor")}>View path</button></div>)}</div></article>
            </section>
            <section className="dashboardSplit">
              <article className="portalCard"><div className="cardHeading"><h2>Your recommended learning path</h2><button type="button" onClick={() => navigate("learning")}>Full roadmap</button></div>{displayedCourses.slice(0, 3).map((course) => <div className="courseRow" key={course.id}><div><strong>{course.title}</strong><div className="miniProgress"><span style={{ width: `${course.progress}%` }} /></div></div><b>{course.progress}%</b></div>)}</article>
              <article className="portalCard insightCard"><div className="cardHeading"><h2>Latest assessment insight</h2><span className="pill success">+6% improvement</span></div><strong className="bigScore">82%</strong><p><b>Strong:</b> Multi-stage sampling, price indices</p><p><b>Improve:</b> Non-response imputation, statistical disclosure control</p></article>
            </section>
          </div>
        ) : null}

        {activeView === "framework" ? (
          <div className="portalStack"><section className="pageIntro"><span>Official Statistics competency framework</span><h1>Role-aligned capability matrix</h1><p>Explore current vs required proficiency across the domains expected in India&apos;s Official Statistical System.</p></section><div className="domainGrid">{competencyDomains.map((domain, domainIndex) => <article className="portalCard" key={domain.name}><div className="domainHeader"><span>Domain {domainIndex + 1}</span><h2>{domain.name}</h2></div>{domain.items.map((item, index) => <div className="competencyRow" key={item}><div><strong>{item}</strong><small>L{Math.min(index % 3 + 2, 4)} current · L4 target</small></div><div className="levelDots">{[1,2,3,4,5].map((level) => <i key={level} className={level <= (index % 3 + 2) ? "filled" : ""} />)}</div><PriorityPill priority={index % 3 === 0 ? "HIGH" : index % 3 === 1 ? "MEDIUM" : "LOW"} /></div>)}</article>)}</div><section className="portalCard proficiencyScale"><h2>Five-level proficiency model</h2>{["L1 Awareness", "L2 Foundation", "L3 Working", "L4 Advanced", "L5 Expert"].map((level) => <span key={level}>{level}</span>)}</section></div>
        ) : null}

        {activeView === "assessment" ? (
          <div className="portalStack"><section className="pageIntro"><span>Assess & update</span><h1>Competency assessment</h1><p>Complete source-grounded and role-aligned assessments. Successful results feed back into your competency profile.</p></section>{props.assessmentNode}</div>
        ) : null}

        {activeView === "advisor" ? (
          <div className="portalStack"><section className="pageIntro"><span>Explainable recommendations</span><h1>AI learning advisor</h1><p>Recommendations combine gap severity, role relevance, career trajectory, department priorities, prior learning and future demand.</p></section><section className="weightBar">{recommendationWeights.map(([label, weight]) => <div key={label} style={{ flex: weight }}><strong>{weight}%</strong><span>{label}</span></div>)}</section><div className="recommendationGrid">{demoRecommendations.map((course) => <article className="portalCard recommendationCard" key={course.title}><div className="cardHeading"><span className="sourceBadge">{course.source}</span><strong>{course.score}/100</strong></div><h2>{course.title}</h2><p>{course.reason}</p><span className="competencyTag">{course.competency}</span><div className="cardActions"><button type="button" onClick={() => setWhyCourse(course)}>Why this course?</button><button type="button" className="primary">Enroll / continue</button></div></article>)}</div></div>
        ) : null}

        {activeView === "learning" ? (
          <div className="portalStack"><section className="pageIntro"><span>Personalized roadmap</span><h1>Your learning path</h1><p>Sequenced modules bridge prerequisite gaps before advanced official-statistics capability.</p></section><div className="roadmap">{learningRoadmap.map((phase) => <article key={phase.phase}><span className="phaseNumber">{phase.phase}</span><div><small>{phase.duration}</small><h2>{phase.title}</h2>{phase.items.map((item) => <p key={item}>✓ {item}</p>)}<div className="miniProgress"><span style={{ width: `${phase.progress}%` }} /></div><b>{phase.progress ? `${phase.progress}% complete` : "Not started"}</b></div></article>)}</div></div>
        ) : null}

        {activeView === "igot" ? (
          <div className="portalStack"><section className="pageIntro"><span>External learning ecosystem</span><h1>iGOT Karmayogi & NSSTA hub</h1><p>Catalog, enrolment, completion and competency sync are represented through adapters. Demo entries below are clearly marked mock data until official API credentials are supplied.</p></section><section className="syncBanner"><div><span className="statusDot" /> Mock sync healthy</div><div>Last catalog refresh: 4 min ago</div><div>Adapters: IGOT_MOCK · NSSTA_MOCK</div></section><div className="catalogGrid">{[...demoRecommendations, { title: "GIS for Statistical Field Operations", source: "IGOT_MOCK", score: 79, competency: "GIS", reason: "Supports geospatial field operations and visualization." }].map((course) => <article className="portalCard" key={course.title}><span className="sourceBadge">{course.source}</span><h2>{course.title}</h2><p>{course.reason}</p><div className="catalogMeta"><span>4.5 hrs</span><span>{course.competency}</span><span>Self-paced</span></div><button className="primaryAction" type="button">View learning item</button></article>)}</div></div>
        ) : null}

        {activeView === "generator" ? (
          <div className="portalStack"><section className="pageIntro"><span>Grounded on-device AI</span><h1>AI assessment generator & learning-material assistant</h1><p>Upload approved material, extract source chunks, search evidence, ask grounded questions and generate private assessments. The current AI runtime runs locally in supported browsers with no paid provider.</p></section><section className="pipeline"><span>1 Upload</span><i>→</i><span>2 Semantic chunking</span><i>→</i><span>3 Topic extraction</span><i>→</i><span>4 Source verification</span><i>→</i><span>5 Assessment</span></section>{props.materialsNode}{props.sourceNode}{props.aiNode}</div>
        ) : null}

        {activeView === "trainer" ? (
          <div className="portalStack"><section className="pageIntro"><span>NSSTA faculty console</span><h1>Trainer & question-bank QA hub</h1><p>Review generated questions, verify source grounding, diagnose cohort weak topics and curate training activity.</p></section><section className="metricGrid"><StatCard label="Pending QA" value="18" note="Generated questions" /><StatCard label="Approved today" value="42" note="Source verified" /><StatCard label="Cohorts" value="6" note="Active training groups" /><StatCard label="Weak topics" value="9" note="Need intervention" /></section><section className="dashboardSplit"><article className="portalCard"><h2>Question review queue</h2>{["Sampling frame bias", "CPI elementary aggregates", "Metadata quality checks"].map((item, index) => <div className="reviewRow" key={item}><div><strong>{item}</strong><small>Generated from approved material · Source S{index + 1}</small></div><div><button type="button">View source</button><button type="button">Edit</button><button type="button" className="approve">Approve</button></div></div>)}</article><article className="portalCard"><h2>Cohort weak-topic diagnostics</h2>{[["Non-response adjustment",72],["Seasonal adjustment",64],["GIS joins",58],["Data privacy",51]].map(([topic,value]) => <div className="barRow" key={String(topic)}><span>{topic}</span><div><i style={{ width: `${value}%` }} /></div><b>{value}%</b></div>)}</article></section></div>
        ) : null}

        {activeView === "admin" ? (
          <div className="portalStack"><section className="pageIntro"><span>Enterprise capacity intelligence</span><h1>Workforce analytics</h1><p>Aggregate, privacy-preserving workforce insight for MoSPI capacity-building leaders.</p></section>{props.adminNode || <div className="noticePanel">Your authenticated account does not have ADMIN or SUPER_ADMIN privileges. The demo analytics below are illustrative only.</div>}<section className="dashboardSplit"><article className="portalCard"><h2>Department competency heatmap</h2><div className="heatmap">{["NSO Survey", "National Accounts", "Price Statistics", "Field Operations", "Data Innovation"].map((dept, row) => <div key={dept}><span>{dept}</span>{[1,2,3,4,5].map((col) => <i key={col} style={{ opacity: .25 + (((row + col) % 5) * .16) }} />)}</div>)}</div></article><article className="portalCard"><h2>Three-year future skill forecast</h2>{[["AI / ML",86],["Cloud & APIs",78],["Geospatial analytics",73],["Privacy engineering",68]].map(([skill,value]) => <div className="barRow" key={String(skill)}><span>{skill}</span><div><i style={{ width: `${value}%` }} /></div><b>{value}</b></div>)}</article></section></div>
        ) : null}

        {activeView === "superadmin" ? (
          <div className="portalStack"><section className="pageIntro"><span>Controlled system operations</span><h1>Super administrator console</h1><p>Integration health, audit posture and demo adapter controls. These controls are illustrative and do not bypass production authorization.</p></section><section className="metricGrid"><StatCard label="Supabase" value="Healthy" note="Auth / DB / Storage" /><StatCard label="Local AI" value="Ready" note="Browser WebGPU runtime" /><StatCard label="iGOT adapter" value="MOCK" note="Awaiting official API" /><StatCard label="Security advisor" value="0" note="Last verified findings" /></section><section className="portalCard"><h2>Integration & compliance monitor</h2>{["Supabase Auth + RLS", "Private learning-material storage", "JWT assessment scorer", "iGOT catalog adapter", "NSSTA training adapter", "Audit event stream"].map((item, index) => <div className="systemRow" key={item}><span>{item}</span><b className={index < 3 || index === 5 ? "ok" : "mock"}>{index < 3 || index === 5 ? "Operational" : "Mock adapter"}</b></div>)}</section></div>
        ) : null}

        {activeView === "reports" ? (
          <div className="portalStack"><section className="pageIntro"><span>Evidence & reporting</span><h1>Reports center</h1><p>Generate learner and organisation reports for competency, assessment and learning progress.</p></section><div className="reportGrid">{["Individual competency profile", "Assessment performance", "Learning completion", "Department gap analysis", "Training effectiveness", "Future skill readiness"].map((report, index) => <article className="portalCard" key={report}><span className="reportIcon">▤</span><h2>{report}</h2><p>{index < 3 ? "Learner report" : "Organisation report"} · PDF / CSV export affordance</p><div className="cardActions"><button type="button">Preview</button><button type="button" className="primary">Export</button></div></article>)}</div></div>
        ) : null}

        {activeView === "profile" ? (
          <div className="portalStack"><section className="pageIntro profileIntro"><div className="profileAvatar">{firstName.slice(0,1).toUpperCase()}</div><div><span>Official identity & career profile</span><h1>{props.fullName || "Official User"}</h1><p>Keep designation, assignment, qualifications and experience current so recommendations stay role-relevant.</p></div><button type="button">Edit profile</button></section><section className="dashboardSplit"><article className="portalCard profileDetails"><h2>Official details</h2>{[["Designation","Statistical Officer"],["Department","National Statistical Office"],["Cadre / Service","SSS / Official Statistics"],["Current assignment","Survey operations & data quality"],["Highest qualification","Postgraduate / equivalent"],["Experience","3+ years"]].map(([label,value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</article><article className="portalCard"><h2>Competency & learning summary</h2><div className="profileScore"><strong>{props.competencyScore || 68}%</strong><span>Overall competency</span></div><p>{displayedGaps.length} active gaps · {displayedCourses.length} learning items · 3 recent assessments</p><button type="button" onClick={() => navigate("dashboard")}>Open learner dashboard</button></article></section><section className="portalCard"><h2>Prior training & learning history</h2>{["Introduction to Official Statistics", "Python for Data Analysis", "Survey Sampling Foundations"].map((item) => <div className="historyRow" key={item}><span>✓</span><div><strong>{item}</strong><small>Completed · Verified learning record</small></div></div>)}</section></div>
        ) : null}
      </main>

      <footer className="portalFooter"><div><strong>StatSkill AI</strong><p>AI-powered competency and learning intelligence for India&apos;s Official Statistical System.</p></div><div><strong>Platform</strong><span>Competency Framework</span><span>AI Learning Advisor</span><span>Assessment Generator</span></div><div><strong>Institutions</strong><span>MoSPI</span><span>NSSTA</span><span>iGOT Karmayogi</span></div><div><strong>Compliance & Access</strong><span>DPDP principles</span><span>Security & privacy</span><span>WCAG accessibility</span></div><small>Demo environment · External catalog integrations are clearly marked when mocked.</small></footer>

      <button className="floatingAssistant" type="button" onClick={() => setAssistantOpen((value) => !value)} aria-expanded={assistantOpen}>✦ <span>StatSkill AI</span></button>
      {assistantOpen ? <aside className="assistantDrawer"><div className="cardHeading"><div><span>Grounded assistant</span><h2>Ask your learning material</h2></div><button type="button" onClick={() => setAssistantOpen(false)}>×</button></div><p>The production assistant uses only evidence from your uploaded, owner-scoped materials and runs locally on supported browsers.</p><div className="quickPrompts"><button type="button" onClick={() => { setAssistantOpen(false); navigate("generator"); }}>Ask a grounded question</button><button type="button" onClick={() => { setAssistantOpen(false); navigate("generator"); }}>Generate practice quiz</button><button type="button" onClick={() => { setAssistantOpen(false); navigate("framework"); }}>View competency gaps</button></div><small>AI output is validated before use. When evidence is insufficient, the assistant should abstain.</small></aside> : null}

      {whyCourse ? <div className="modalBackdrop" role="dialog" aria-modal="true" aria-labelledby="why-course-title"><div className="portalModal"><div className="cardHeading"><div><span>Explainable recommendation</span><h2 id="why-course-title">Why {whyCourse.title}?</h2></div><button type="button" onClick={() => setWhyCourse(null)}>×</button></div><p>{whyCourse.reason}</p><div className="scoreBreakdown">{recommendationWeights.map(([label, weight], index) => <div key={label}><span>{label}</span><div><i style={{ width: `${Math.max(40, weight * 3 + index * 4)}%` }} /></div><b>{Math.min(98, 70 + weight - index * 2)}</b></div>)}</div><button className="primaryAction" type="button" onClick={() => setWhyCourse(null)}>Done</button></div></div> : null}
    </div>
  );
}
