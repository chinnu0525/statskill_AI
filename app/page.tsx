"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { localeLabels, messages, type Locale } from "../src/i18n/messages";
import { getCurrentUser, signIn, signOut, signUp } from "../src/services/auth";
import { loadDashboardData, updatePreferredLocale, type DashboardData } from "../src/services/dashboard";
import { isSupabaseConfigured } from "../src/lib/supabase/client";
import { DocumentUpload } from "./components/DocumentUpload";

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

  const copy = useMemo(() => messages[locale], [locale]);
  const configured = isSupabaseConfigured();

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
    const fullName = String(form.get("fullName") ?? "").trim();

    try {
      if (authMode === "signup") {
        const { data, error } = await signUp(email, password, fullName, locale);
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
  }

  const gaps = dashboard?.gaps ?? [];
  const courses = dashboard?.courses ?? [];
  const recommendedCourse = courses[0];

  return (
    <>
      {hydrated && !hasPreference ? (
        <div className="languageGate" role="dialog" aria-modal="true" aria-labelledby="language-title">
          <div className="languageCard">
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
      ) : null}

      {!checkingAuth && !authenticated ? (
        <main className="authShell">
          <section className="authPanel" aria-labelledby="auth-title">
            <div className="authBrand">StatSkill AI</div>
            <p className="eyebrow">{copy.workspace}</p>
            <h1 id="auth-title">{copy.welcomeBack}</h1>
            <p className="muted">{copy.authHint}</p>

            {!configured ? <div className="notice">{copy.configurationNeeded}</div> : null}

            <form className="authForm" onSubmit={handleAuth}>
              {authMode === "signup" ? (
                <label>
                  <span>{copy.fullName}</span>
                  <input name="fullName" autoComplete="name" required />
                </label>
              ) : null}
              <label>
                <span>{copy.email}</span>
                <input name="email" type="email" autoComplete="email" required />
              </label>
              <label>
                <span>{copy.password}</span>
                <input name="password" type="password" minLength={8} autoComplete={authMode === "signin" ? "current-password" : "new-password"} required />
              </label>
              <button className="primaryButton" type="submit" disabled={!configured}>
                {authMode === "signin" ? copy.signIn : copy.createAccount}
              </button>
            </form>

            {authMessage ? <p className="authMessage" role="status">{authMessage}</p> : null}

            <button className="textButton" type="button" onClick={() => setAuthMode(authMode === "signin" ? "signup" : "signin")}>
              {authMode === "signin" ? `${copy.noAccount} ${copy.createAccount}` : `${copy.haveAccount} ${copy.signIn}`}
            </button>

            <div className="authLanguages" aria-label={copy.changeLanguage}>
              {locales.map((item) => (
                <button key={item} type="button" className={locale === item ? "selected" : ""} onClick={() => chooseLocale(item)}>
                  {localeLabels[item]}
                </button>
              ))}
            </div>
          </section>
        </main>
      ) : null}

      {authenticated ? (
        <div className="shell">
          <aside className="sidebar">
            <div className="brand">StatSkill AI</div>
            <nav className="nav" aria-label={copy.dashboard}>
              <a className="active" href="#dashboard">{copy.dashboard}</a>
              <a href="#skills">{copy.skills}</a>
              <a href="#learning">{copy.learning}</a>
              <a href="#materials">{copy.learningMaterials}</a>
              <a href="#assessments">{copy.assessments}</a>
              <a href="#assistant">{copy.assistant}</a>
            </nav>
            <div className="language">
              {copy.language}
              <div className="localeLinks" aria-label={copy.changeLanguage}>
                {locales.map((item) => (
                  <button key={item} type="button" className={item === locale ? "selected" : ""} onClick={() => chooseLocale(item)}>
                    {localeLabels[item]}
                  </button>
                ))}
              </div>
              <button className="textButton sidebarSignOut" type="button" onClick={handleSignOut}>{copy.signOut}</button>
            </div>
          </aside>

          <main className="main" id="dashboard">
            <header className="top">
              <div>
                <p className="eyebrow">{copy.workspace}</p>
                <h1 className="h1">{copy.goodMorning}{dashboard?.fullName ? `, ${dashboard.fullName}` : ""}</h1>
              </div>
              <label className="languageSelect">
                <span className="srOnly">{copy.changeLanguage}</span>
                <select value={locale} onChange={(event) => chooseLocale(event.target.value as Locale)}>
                  {locales.map((item) => <option key={item} value={item}>{localeLabels[item]}</option>)}
                </select>
              </label>
            </header>

            {loadingDashboard ? <div className="notice">{copy.loading}</div> : null}

            <section className="grid" aria-label={copy.competencyOverview}>
              <article className="card">
                <div className="label">{copy.competency}</div>
                <div className="score">{dashboard?.competencyScore ?? 0}%</div>
                <div className="muted">{copy.competencyChange}</div>
              </article>

              <article className="card" id="skills">
                <div className="label">{copy.priority}</div>
                {gaps.length ? gaps.map((gap) => (
                  <div className="gap" key={gap.name}>
                    <span>{gap.name}</span>
                    <span className="priority">
                      {gap.priority === "HIGH" ? copy.highPriority : gap.priority === "MEDIUM" ? copy.mediumPriority : copy.lowPriority}
                    </span>
                  </div>
                )) : <div className="muted emptyState">{copy.noGaps}</div>}
              </article>

              <article className="card">
                <div className="label">{copy.recommended}</div>
                <strong>{recommendedCourse?.title ?? copy.noCourses}</strong>
                {recommendedCourse ? <>
                  <div className="muted">{copy.continueHint}</div>
                  <a className="action" href="#learning">{copy.continue} →</a>
                </> : null}
              </article>
            </section>

            <h2 className="section" id="learning">{copy.learningPath}</h2>
            <section className="card">
              {courses.length ? courses.map((course) => (
                <div className="course" key={course.id}>
                  <div>
                    <strong>{course.title}</strong>
                    <div className="progress" aria-label={`${course.progress}% ${copy.complete}`}>
                      <span style={{ width: `${course.progress}%` }} />
                    </div>
                  </div>
                  <span className="muted">{course.progress}%</span>
                </div>
              )) : <div className="muted emptyState">{copy.noCourses}</div>}
            </section>

            <div id="materials" className="materialsSection">
              <DocumentUpload copy={copy} />
            </div>
          </main>
        </div>
      ) : null}
    </>
  );
}
