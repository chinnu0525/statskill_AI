"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { localeLabels, messages, type Locale } from "../src/i18n/messages";
import { assessmentMessages } from "../src/i18n/assessment-messages";
import { adminMessages } from "../src/i18n/admin-messages";
import { retrievalMessages } from "../src/i18n/retrieval-messages";
import { aiMessages } from "../src/i18n/ai-messages";
import { portalMessages } from "../src/i18n/portal-messages";
import { getCurrentUser, signIn, signOut, signUp, type SignupProfile } from "../src/services/auth";
import { loadDashboardData, updatePreferredLocale, type DashboardData } from "../src/services/dashboard";
import { isSupabaseConfigured } from "../src/lib/supabase/client";
import { DocumentUpload } from "./components/DocumentUpload";
import { AssessmentPanel } from "./components/AssessmentPanel";
import { AdminOverview } from "./components/AdminOverview";
import { SourceSearch } from "./components/SourceSearch";
import { AiWorkspace } from "./components/AiWorkspace";
import { PortalExperience } from "./components/PortalExperience";
import { CompetencyFrameworkPanel, LatestAssessmentInsightPanel, ProfileEditorPanel, ReportsPanel } from "./components/LearnerInsightPanels";
import { AdminPrivacyNotice, SystemConsolePanel, TrainerWorkspacePanel } from "./components/RoleWorkspacePanels";

const locales: Locale[] = ["en", "hi", "te"];
const storageKey = "statskill-locale";
const emptyProfile = { designation: "", department: "", cadre: "", assignment: "", qualification: "", experienceYears: null, priorTraining: "" };

export default function Home() {
  const [locale, setLocale] = useState<Locale>("en");
  const [hydrated, setHydrated] = useState(false);
  const [hasPreference, setHasPreference] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authMessage, setAuthMessage] = useState("");
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [assessmentRefreshKey, setAssessmentRefreshKey] = useState(0);
  const [generatedAssessmentId, setGeneratedAssessmentId] = useState("");
  const [materialsRefreshKey, setMaterialsRefreshKey] = useState(0);

  const copy = useMemo(() => ({ ...messages[locale], ...assessmentMessages[locale], ...adminMessages[locale], ...retrievalMessages[locale], ...aiMessages[locale] }), [locale]);
  const pc = portalMessages[locale];
  const configured = isSupabaseConfigured();
  const isAdmin = dashboard?.role === "ADMIN" || dashboard?.role === "SUPER_ADMIN";
  const isTrainer = dashboard?.role === "TRAINER" || dashboard?.role === "SUPER_ADMIN";
  const isSuperAdmin = dashboard?.role === "SUPER_ADMIN";

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey) as Locale | null;
    if (saved && locales.includes(saved)) { setLocale(saved); setHasPreference(true); document.documentElement.lang = saved; }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !configured) { setCheckingAuth(false); return; }
    let active = true;
    getCurrentUser().then(({ data }) => {
      if (!active) return;
      const signedIn = Boolean(data.user);
      setAuthenticated(signedIn);
      if (signedIn) void refreshDashboard(locale);
    }).finally(() => active && setCheckingAuth(false));
    return () => { active = false; };
  }, [hydrated, configured]);

  async function refreshDashboard(targetLocale: Locale) {
    setLoadingDashboard(true);
    try { setDashboard(await loadDashboardData(targetLocale)); }
    catch { setDashboard(null); }
    finally { setLoadingDashboard(false); }
  }

  function chooseLocale(nextLocale: Locale) {
    setLocale(nextLocale); setHasPreference(true); setGeneratedAssessmentId("");
    window.localStorage.setItem(storageKey, nextLocale); document.documentElement.lang = nextLocale;
    if (authenticated) { void updatePreferredLocale(nextLocale); void refreshDashboard(nextLocale); }
  }

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setAuthMessage("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    try {
      if (authMode === "signup") {
        const experienceRaw = String(form.get("experienceYears") ?? "").trim();
        const profile: SignupProfile = {
          fullName: String(form.get("fullName") ?? "").trim(), designation: String(form.get("designation") ?? "").trim(), department: String(form.get("department") ?? "").trim(), cadre: String(form.get("cadre") ?? "").trim(), assignment: String(form.get("assignment") ?? "").trim(), qualification: String(form.get("qualification") ?? "").trim(), experienceYears: experienceRaw ? Number(experienceRaw) : null, priorTraining: String(form.get("priorTraining") ?? "").trim(),
        };
        const { data, error } = await signUp(email, password, profile, locale);
        if (error) throw error;
        if (!data.session) { setAuthMessage(copy.checkEmail); return; }
      } else {
        const { error } = await signIn(email, password); if (error) throw error;
      }
      setAuthenticated(true); await refreshDashboard(locale);
    } catch { setAuthMessage(copy.authError); }
  }

  async function handleSignOut() { await signOut(); setAuthenticated(false); setDashboard(null); setGeneratedAssessmentId(""); }
  function handleQuizGenerated(assessmentId: string) { setGeneratedAssessmentId(assessmentId); setAssessmentRefreshKey((value) => value + 1); }

  if (hydrated && !hasPreference) return <div className="languageGate" role="dialog" aria-modal="true" aria-labelledby="language-title"><div className="languageCard nationalLanguageCard"><div className="authGovLabel">{pc.government} · MoSPI</div><div className="brand compact">StatSkill AI</div><h1 id="language-title">{copy.chooseLanguage}</h1><p>{copy.chooseLanguageHint}</p><div className="languageOptions">{locales.map((item) => <button key={item} type="button" onClick={() => chooseLocale(item)}><span>{localeLabels[item]}</span><span aria-hidden="true">→</span></button>)}</div></div></div>;
  if (checkingAuth) return <main className="portalLoading"><div className="portalLoader"/><strong>StatSkill AI</strong><span>{copy.loading}</span></main>;

  if (!authenticated) return <main className="publicAuthPage">
    <section className="authStory"><div className="authGovLabel">{pc.government} · {pc.ministry}</div><div className="authIdentity"><span>SA</span><div><strong>StatSkill <em>AI</em></strong><small>{pc.portalSubtitle}</small></div></div><div className="authStoryCopy"><span>{pc.authStoryBadge}</span><h1>{pc.authStoryTitle}</h1><p>{pc.authStoryText}</p></div><div className="authFeatureList">{pc.authFeatures.map(([title, text], index) => <div key={title}><b>0{index + 1}</b><span><strong>{title}</strong><small>{text}</small></span></div>)}</div><small className="authCompliance">{pc.demoPrivacy}</small></section>
    <section className="authPortalPanel" aria-labelledby="auth-title"><div className="authPanelTop"><div><span>{authMode === "signin" ? pc.authSecure : pc.authCreate}</span><h1 id="auth-title">{authMode === "signin" ? copy.welcomeBack : copy.createAccount}</h1><p>{authMode === "signin" ? copy.authHint : pc.authCreateHint}</p></div><select value={locale} onChange={(event) => chooseLocale(event.target.value as Locale)} aria-label={pc.language}>{locales.map((item) => <option key={item} value={item}>{localeLabels[item]}</option>)}</select></div>
      {!configured && <div className="notice">{copy.configurationNeeded}</div>}
      <form className="portalAuthForm" onSubmit={handleAuth}>
        {authMode === "signup" && <><div className="authFormGrid"><label><span>{copy.fullName}</span><input name="fullName" autoComplete="name" required/></label><label><span>{pc.designationLabel}</span><input name="designation"/></label><label><span>{pc.departmentLabel}</span><input name="department"/></label><label><span>{pc.cadreLabel}</span><input name="cadre"/></label></div><details className="profileDisclosure"><summary>{pc.careerContext} <span>{pc.optionalRecommended}</span></summary><div className="authFormGrid disclosureGrid"><label className="wide"><span>{pc.assignmentLabel}</span><input name="assignment"/></label><label><span>{pc.qualificationLabel}</span><input name="qualification"/></label><label><span>{pc.experienceLabel}</span><input name="experienceYears" type="number" min="0" max="50" step="1"/></label><label className="wide"><span>{pc.priorTrainingLabel}</span><textarea name="priorTraining" rows={3}/></label></div></details></>}
        <div className="authFormGrid credentialsGrid"><label><span>{copy.email}</span><input name="email" type="email" autoComplete="email" required/></label><label><span>{copy.password}</span><input name="password" type="password" minLength={8} autoComplete={authMode === "signin" ? "current-password" : "new-password"} required/></label></div><button className="portalAuthSubmit" type="submit" disabled={!configured}>{authMode === "signin" ? copy.signIn : copy.createAccount}</button>
      </form>
      {authMessage && <p className="authMessage portalAuthMessage" role="status">{authMessage}</p>}
      <div className="authSwitchRow"><span>{authMode === "signin" ? copy.noAccount : copy.haveAccount}</span><button type="button" onClick={() => { setAuthMode(authMode === "signin" ? "signup" : "signin"); setAuthMessage(""); }}>{authMode === "signin" ? copy.createAccount : copy.signIn}</button></div><small className="authPrivacyNote">{pc.demoPrivacy}</small>
    </section>
  </main>;

  const currentProfile = dashboard?.profile ?? emptyProfile;
  const materialsNode = <div className="productionModule"><DocumentUpload copy={copy} onDocumentProcessed={() => setMaterialsRefreshKey((value) => value + 1)}/></div>;
  const sourceNode = <div className="productionModule"><SourceSearch copy={copy}/></div>;
  const aiNode = <div className="productionModule"><AiWorkspace locale={locale} copy={copy} onQuizGenerated={handleQuizGenerated} materialsRefreshKey={materialsRefreshKey}/></div>;
  const assessmentNode = <div className="productionModule"><AssessmentPanel locale={locale} copy={copy} onCompleted={() => void refreshDashboard(locale)} refreshKey={assessmentRefreshKey} preferredAssessmentId={generatedAssessmentId}/></div>;
  const frameworkNode = <CompetencyFrameworkPanel locale={locale}/>;
  const latestInsightNode = <LatestAssessmentInsightPanel locale={locale}/>;
  const reportsNode = <ReportsPanel locale={locale}/>;
  const profileNode = <ProfileEditorPanel locale={locale} fullName={dashboard?.fullName ?? ""} profile={currentProfile} onSaved={() => void refreshDashboard(locale)}/>;
  const adminNode = isAdmin ? <><AdminPrivacyNotice locale={locale}/><div className="productionModule"><AdminOverview copy={copy}/></div></> : undefined;
  const trainerNode = isTrainer ? <TrainerWorkspacePanel locale={locale}/> : undefined;
  const superAdminNode = isSuperAdmin ? <SystemConsolePanel locale={locale}/> : undefined;

  return <>{loadingDashboard && <div className="portalRefreshNotice">{copy.loading}</div>}<PortalExperience key={dashboard?.role ?? "OFFICIAL"} locale={locale} localeLabels={localeLabels} fullName={dashboard?.fullName} actualRole={dashboard?.role} competencyScore={dashboard?.competencyScore ?? 0} gaps={dashboard?.gaps ?? []} courses={dashboard?.courses ?? []} learningHours={dashboard?.learningHours} assessmentsCompleted={dashboard?.assessmentsCompleted} onLocaleChange={chooseLocale} onSignOut={handleSignOut} onLearningChanged={() => void refreshDashboard(locale)} materialsNode={materialsNode} sourceNode={sourceNode} aiNode={aiNode} assessmentNode={assessmentNode} frameworkNode={frameworkNode} reportsNode={reportsNode} profileNode={profileNode} latestInsightNode={latestInsightNode} adminNode={adminNode} trainerNode={trainerNode} superAdminNode={superAdminNode}/></>;
}
