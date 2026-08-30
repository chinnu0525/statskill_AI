"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { localeLabels, messages, type Locale } from "../src/i18n/messages";
import { assessmentMessages } from "../src/i18n/assessment-messages";
import { adminMessages } from "../src/i18n/admin-messages";
import { retrievalMessages } from "../src/i18n/retrieval-messages";
import { aiMessages } from "../src/i18n/ai-messages";
import { getCurrentUser, signIn, signOut, signUp, type SignupProfile } from "../src/services/auth";
import { loadDashboardData, updatePreferredLocale, type DashboardData } from "../src/services/dashboard";
import { isSupabaseConfigured } from "../src/lib/supabase/client";
import { DocumentUpload } from "./components/DocumentUpload";
import { AssessmentPanel } from "./components/AssessmentPanel";
import { AdminOverview } from "./components/AdminOverview";
import { SourceSearch } from "./components/SourceSearch";
import { AiWorkspace } from "./components/AiWorkspace";
import { PortalExperience } from "./components/PortalExperience";

const locales: Locale[] = ["en", "hi", "te"];
const storageKey = "statskill-locale";

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

  const copy = useMemo(() => ({
    ...messages[locale],
    ...assessmentMessages[locale],
    ...adminMessages[locale],
    ...retrievalMessages[locale],
    ...aiMessages[locale],
  }), [locale]);
  const configured = isSupabaseConfigured();
  const isAdmin = dashboard?.role === "ADMIN" || dashboard?.role === "SUPER_ADMIN";

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey) as Locale | null;
    if (saved && locales.includes(saved)) {
      setLocale(saved);
      setHasPreference(true);
      document.documentElement.lang = saved;
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !configured) {
      setCheckingAuth(false);
      return;
    }

    let active = true;
    getCurrentUser()
      .then(({ data }) => {
        if (!active) return;
        const isAuthenticated = Boolean(data.user);
        setAuthenticated(isAuthenticated);
        if (isAuthenticated) void refreshDashboard(locale);
      })
      .finally(() => active && setCheckingAuth(false));

    return () => {
      active = false;
    };
  }, [hydrated, configured]);

  async function refreshDashboard(targetLocale: Locale) {
    setLoadingDashboard(true);
    try {
      const data = await loadDashboardData(targetLocale);
      setDashboard(data);
    } catch {
      setDashboard(null);
    } finally {
      setLoadingDashboard(false);
    }
  }

  function chooseLocale(nextLocale: Locale) {
    setLocale(nextLocale);
    setHasPreference(true);
    setGeneratedAssessmentId("");
    window.localStorage.setItem(storageKey, nextLocale);
    document.documentElement.lang = nextLocale;
    if (authenticated) {
      void updatePreferredLocale(nextLocale);
      void refreshDashboard(nextLocale);
    }
  }

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthMessage("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    try {
      if (authMode === "signup") {
        const experienceRaw = String(form.get("experienceYears") ?? "").trim();
        const profile: SignupProfile = {
          fullName: String(form.get("fullName") ?? "").trim(),
          designation: String(form.get("designation") ?? "").trim(),
          department: String(form.get("department") ?? "").trim(),
          cadre: String(form.get("cadre") ?? "").trim(),
          assignment: String(form.get("assignment") ?? "").trim(),
          qualification: String(form.get("qualification") ?? "").trim(),
          experienceYears: experienceRaw ? Number(experienceRaw) : null,
          priorTraining: String(form.get("priorTraining") ?? "").trim(),
        };
        const { data, error } = await signUp(email, password, profile, locale);
        if (error) throw error;
        if (!data.session) {
          setAuthMessage(copy.checkEmail);
          return;
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
      }

      setAuthenticated(true);
      await refreshDashboard(locale);
    } catch {
      setAuthMessage(copy.authError);
    }
  }

  async function handleSignOut() {
    await signOut();
    setAuthenticated(false);
    setDashboard(null);
    setGeneratedAssessmentId("");
  }

  function handleQuizGenerated(assessmentId: string) {
    setGeneratedAssessmentId(assessmentId);
    setAssessmentRefreshKey((current) => current + 1);
  }

  if (hydrated && !hasPreference) {
    return (
      <div className="languageGate" role="dialog" aria-modal="true" aria-labelledby="language-title">
        <div className="languageCard nationalLanguageCard">
          <div className="authGovLabel">Government of India · MoSPI</div>
          <div className="brand compact">StatSkill AI</div>
          <h1 id="language-title">{copy.chooseLanguage}</h1>
          <p>{copy.chooseLanguageHint}</p>
          <div className="languageOptions">
            {locales.map((item) => (
              <button key={item} type="button" onClick={() => chooseLocale(item)}>
                <span>{localeLabels[item]}</span>
                <span aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (checkingAuth) {
    return <main className="portalLoading"><div className="portalLoader" /><strong>Preparing StatSkill AI</strong><span>Loading your secure workspace…</span></main>;
  }

  if (!authenticated) {
    return (
      <main className="publicAuthPage">
        <section className="authStory">
          <div className="authGovLabel">Government of India · Ministry of Statistics & Programme Implementation</div>
          <div className="authIdentity"><span>SA</span><div><strong>StatSkill <em>AI</em></strong><small>National Competency & Learning Portal for Official Statistics</small></div></div>
          <div className="authStoryCopy">
            <span>Building a future-ready statistical workforce</span>
            <h1>One secure platform to assess, learn, practice and grow.</h1>
            <p>Map role-specific competency gaps, receive explainable learning recommendations, use approved learning material for grounded AI assistance, and measure improvement through secure assessments.</p>
          </div>
          <div className="authFeatureList">
            <div><b>01</b><span><strong>Competency intelligence</strong><small>Statistical, technical, digital-governance and behavioural capability mapping.</small></span></div>
            <div><b>02</b><span><strong>iGOT + NSSTA learning</strong><small>Personalized pathways through adapter-based catalog integration.</small></span></div>
            <div><b>03</b><span><strong>Grounded local AI</strong><small>Private learning-material assistance and quiz generation without a paid AI provider.</small></span></div>
          </div>
          <small className="authCompliance">Multilingual · Accessible · Account-scoped learning material · Secure assessment scoring</small>
        </section>

        <section className="authPortalPanel" aria-labelledby="auth-title">
          <div className="authPanelTop">
            <div>
              <span>{authMode === "signin" ? "Secure official access" : "Create your competency profile"}</span>
              <h1 id="auth-title">{authMode === "signin" ? copy.welcomeBack : copy.createAccount}</h1>
              <p>{authMode === "signin" ? copy.authHint : "Register your official profile. Optional career details improve future recommendations."}</p>
            </div>
            <select value={locale} onChange={(event) => chooseLocale(event.target.value as Locale)} aria-label={copy.changeLanguage}>
              {locales.map((item) => <option key={item} value={item}>{localeLabels[item]}</option>)}
            </select>
          </div>

          {!configured ? <div className="notice">{copy.configurationNeeded}</div> : null}

          <form className="portalAuthForm" onSubmit={handleAuth}>
            {authMode === "signup" ? (
              <>
                <div className="authFormGrid">
                  <label><span>{copy.fullName}</span><input name="fullName" autoComplete="name" required placeholder="e.g. Ananya Sharma" /></label>
                  <label><span>Designation</span><input name="designation" placeholder="Statistical Officer" /></label>
                  <label><span>Department / Organisation</span><input name="department" placeholder="NSO / DES / MoSPI division" /></label>
                  <label><span>Cadre / Service</span><input name="cadre" placeholder="ISS / SSS / State Statistical Service" /></label>
                </div>
                <details className="profileDisclosure">
                  <summary>Add career & learning context <span>Optional, recommended</span></summary>
                  <div className="authFormGrid disclosureGrid">
                    <label className="wide"><span>Current role / assignment</span><input name="assignment" placeholder="e.g. Household survey operations and data quality" /></label>
                    <label><span>Highest qualification</span><input name="qualification" placeholder="Degree / specialization" /></label>
                    <label><span>Years of experience</span><input name="experienceYears" type="number" min="0" max="50" step="1" placeholder="3" /></label>
                    <label className="wide"><span>Prior training</span><textarea name="priorTraining" rows={3} placeholder="Key iGOT, NSSTA or departmental training already completed" /></label>
                  </div>
                </details>
              </>
            ) : null}

            <div className="authFormGrid credentialsGrid">
              <label><span>{copy.email}</span><input name="email" type="email" autoComplete="email" required placeholder="official@example.gov.in" /></label>
              <label><span>{copy.password}</span><input name="password" type="password" minLength={8} autoComplete={authMode === "signin" ? "current-password" : "new-password"} required placeholder="Minimum 8 characters" /></label>
            </div>

            <button className="portalAuthSubmit" type="submit" disabled={!configured}>
              {authMode === "signin" ? copy.signIn : copy.createAccount}
            </button>
          </form>

          {authMessage ? <p className="authMessage portalAuthMessage" role="status">{authMessage}</p> : null}

          <div className="authSwitchRow">
            <span>{authMode === "signin" ? copy.noAccount : copy.haveAccount}</span>
            <button type="button" onClick={() => { setAuthMode(authMode === "signin" ? "signup" : "signin"); setAuthMessage(""); }}>
              {authMode === "signin" ? copy.createAccount : copy.signIn}
            </button>
          </div>
          <small className="authPrivacyNote">By continuing, you are using a demo/hackathon environment. Do not upload confidential or restricted government material.</small>
        </section>
      </main>
    );
  }

  const materialsNode = (
    <div className="productionModule">
      <DocumentUpload copy={copy} onDocumentProcessed={() => setMaterialsRefreshKey((current) => current + 1)} />
    </div>
  );
  const sourceNode = <div className="productionModule"><SourceSearch copy={copy} /></div>;
  const aiNode = (
    <div className="productionModule">
      <AiWorkspace locale={locale} copy={copy} onQuizGenerated={handleQuizGenerated} materialsRefreshKey={materialsRefreshKey} />
    </div>
  );
  const assessmentNode = (
    <div className="productionModule">
      <AssessmentPanel
        locale={locale}
        copy={copy}
        onCompleted={() => void refreshDashboard(locale)}
        refreshKey={assessmentRefreshKey}
        preferredAssessmentId={generatedAssessmentId}
      />
    </div>
  );

  return (
    <>
      {loadingDashboard ? <div className="portalRefreshNotice">Refreshing competency data…</div> : null}
      <PortalExperience
        locale={locale}
        localeLabels={localeLabels}
        fullName={dashboard?.fullName}
        actualRole={dashboard?.role}
        competencyScore={dashboard?.competencyScore ?? 0}
        gaps={dashboard?.gaps ?? []}
        courses={dashboard?.courses ?? []}
        onLocaleChange={chooseLocale}
        onSignOut={handleSignOut}
        materialsNode={materialsNode}
        sourceNode={sourceNode}
        aiNode={aiNode}
        assessmentNode={assessmentNode}
        adminNode={isAdmin ? <div className="productionModule"><AdminOverview copy={copy} /></div> : undefined}
      />
    </>
  );
}
