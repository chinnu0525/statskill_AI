"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "../lib/supabase/client";
import { localeLabels, messages, type Locale } from "../src/i18n/messages";

const starterGaps = [
  ["GIS", "highPriority"],
  ["AI / ML", "highPriority"],
  ["Python", "mediumPriority"]
] as const;

const fallbackProgress = [62, 34, 18];
const locales: Locale[] = ["en", "hi", "te"];
const storageKey = "statskill-locale";

type CourseItem = { id: string; name: string; progress: number };

export default function Home() {
  const [locale, setLocale] = useState<Locale>("en");
  const [hydrated, setHydrated] = useState(false);
  const [hasPreference, setHasPreference] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authBusy, setAuthBusy] = useState<"signin" | "signup" | null>(null);
  const [authMessage, setAuthMessage] = useState("");
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [competencyScore, setCompetencyScore] = useState(0);

  const copy = useMemo(() => messages[locale], [locale]);

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
    let active = true;
    let unsubscribe: (() => void) | undefined;

    async function initializeAuth() {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        if (active) setUser(data.user ?? null);
        const listener = supabase.auth.onAuthStateChange((_event, session) => {
          if (active) setUser(session?.user ?? null);
        });
        unsubscribe = () => listener.data.subscription.unsubscribe();
      } catch {
        if (active) setAuthMessage(messages.en.authError);
      } finally {
        if (active) setAuthReady(true);
      }
    }

    void initializeAuth();
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setCourses([]);
      setCompetencyScore(0);
      return;
    }

    let active = true;

    async function loadDashboardData() {
      setCoursesLoading(true);
      try {
        const supabase = createClient();
        const [courseResult, competencyResult] = await Promise.all([
          supabase
            .from("course_localizations")
            .select("course_id,title")
            .eq("locale", locale)
            .limit(3),
          supabase
            .from("user_competencies")
            .select("score")
            .eq("user_id", user.id)
        ]);

        if (courseResult.error) throw courseResult.error;
        if (competencyResult.error) throw competencyResult.error;

        if (active) {
          setCourses(
            (courseResult.data ?? []).map((item, index) => ({
              id: item.course_id,
              name: item.title,
              progress: fallbackProgress[index] ?? 0
            }))
          );

          const scores = (competencyResult.data ?? []).map((item) => Number(item.score));
          const average = scores.length
            ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
            : 0;
          setCompetencyScore(average);
        }
      } catch {
        if (active) {
          setCourses([]);
          setCompetencyScore(0);
        }
      } finally {
        if (active) setCoursesLoading(false);
      }
    }

    void loadDashboardData();
    return () => {
      active = false;
    };
  }, [locale, user]);

  function chooseLocale(nextLocale: Locale) {
    setLocale(nextLocale);
    setHasPreference(true);
    window.localStorage.setItem(storageKey, nextLocale);
    document.documentElement.lang = nextLocale;

    if (user) {
      const supabase = createClient();
      void supabase
        .from("profiles")
        .update({ locale: nextLocale, updated_at: new Date().toISOString() })
        .eq("id", user.id);
    }
  }

  async function signIn() {
    setAuthBusy("signin");
    setAuthMessage("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch {
      setAuthMessage(copy.authError);
    } finally {
      setAuthBusy(null);
    }
  }

  async function signUp() {
    setAuthBusy("signup");
    setAuthMessage("");
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { locale } }
      });
      if (error) throw error;
      if (!data.session) setAuthMessage(copy.checkEmail);
    } catch {
      setAuthMessage(copy.authError);
    } finally {
      setAuthBusy(null);
    }
  }

  async function signOut() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setUser(null);
    } catch {
      setAuthMessage(copy.authError);
    }
  }

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

      {hydrated && hasPreference && authReady && !user ? (
        <div className="authGate" role="dialog" aria-modal="true" aria-labelledby="auth-title">
          <div className="languageCard authCard">
            <div className="authTop">
              <div className="brand compact">StatSkill AI</div>
              <select value={locale} onChange={(event) => chooseLocale(event.target.value as Locale)} aria-label={copy.changeLanguage}>
                {locales.map((item) => <option key={item} value={item}>{localeLabels[item]}</option>)}
              </select>
            </div>
            <h1 id="auth-title">{copy.signInTitle}</h1>
            <p>{copy.signInHint}</p>
            <div className="authForm">
              <label>
                <span>{copy.email}</span>
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
              </label>
              <label>
                <span>{copy.password}</span>
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" minLength={6} required />
              </label>
              {authMessage ? <div className="authMessage" role="status">{authMessage}</div> : null}
              <div className="authActions">
                <button className="primaryButton" type="button" disabled={!!authBusy || !email || password.length < 6} onClick={signIn}>
                  {authBusy === "signin" ? copy.signingIn : copy.signIn}
                </button>
                <button className="secondaryButton" type="button" disabled={!!authBusy || !email || password.length < 6} onClick={signUp}>
                  {authBusy === "signup" ? copy.creatingAccount : copy.createAccount}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="shell">
        <aside className="sidebar">
          <div className="brand">StatSkill AI</div>
          <nav className="nav" aria-label={copy.dashboard}>
            <a className="active" href="#dashboard">{copy.dashboard}</a>
            <a href="#skills">{copy.skills}</a>
            <a href="#learning">{copy.learning}</a>
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
          </div>
        </aside>

        <main className="main" id="dashboard">
          <header className="top">
            <div>
              <p className="eyebrow">{copy.workspace}</p>
              <h1 className="h1">{copy.goodMorning}</h1>
            </div>
            <div className="topActions">
              <label className="languageSelect">
                <span className="srOnly">{copy.changeLanguage}</span>
                <select value={locale} onChange={(event) => chooseLocale(event.target.value as Locale)}>
                  {locales.map((item) => <option key={item} value={item}>{localeLabels[item]}</option>)}
                </select>
              </label>
              {user ? <button className="textButton" type="button" onClick={signOut}>{copy.signOut}</button> : null}
            </div>
          </header>

          <section className="grid" aria-label={copy.competencyOverview}>
            <article className="card">
              <div className="label">{copy.competency}</div>
              <div className="score">{competencyScore}%</div>
            </article>

            <article className="card" id="skills">
              <div className="label">{copy.priority}</div>
              {starterGaps.map(([name, priorityKey]) => (
                <div className="gap" key={name}>
                  <span>{name}</span>
                  <span className="priority">{copy[priorityKey]}</span>
                </div>
              ))}
            </article>

            <article className="card">
              <div className="label">{copy.recommended}</div>
              <strong>{courses[0]?.name ?? "Python for Official Statistics"}</strong>
              <div className="muted">{copy.continueHint}</div>
              <a className="action" href="#learning">{copy.continue} →</a>
            </article>
          </section>

          <h2 className="section" id="learning">{copy.liveCatalog}</h2>
          <section className="card">
            {coursesLoading ? <div className="muted">{copy.loading}</div> : null}
            {!coursesLoading && courses.length === 0 ? <div className="muted">{copy.noCourses}</div> : null}
            {courses.map((course) => (
              <div className="course" key={course.id}>
                <div>
                  <strong>{course.name}</strong>
                  <div className="progress" aria-label={`${course.progress}% ${copy.complete}`}>
                    <span style={{ width: `${course.progress}%` }} />
                  </div>
                </div>
                <span className="muted">{course.progress}%</span>
              </div>
            ))}
          </section>
        </main>
      </div>
    </>
  );
}
