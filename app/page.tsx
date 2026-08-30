"use client";

import { useEffect, useMemo, useState } from "react";
import { localeLabels, messages, type Locale } from "../src/i18n/messages";

const gaps = [
  ["GIS", "highPriority"],
  ["AI / ML", "highPriority"],
  ["Python", "mediumPriority"]
] as const;

const courses = [
  ["Python for Official Statistics", 62],
  ["GIS Fundamentals", 34],
  ["AI / ML Foundations", 18]
] as const;

const locales: Locale[] = ["en", "hi", "te"];
const storageKey = "statskill-locale";

export default function Home() {
  const [locale, setLocale] = useState<Locale>("en");
  const [hydrated, setHydrated] = useState(false);
  const [hasPreference, setHasPreference] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey) as Locale | null;
    if (saved && locales.includes(saved)) {
      setLocale(saved);
      setHasPreference(true);
      document.documentElement.lang = saved;
    }
    setHydrated(true);
  }, []);

  const copy = useMemo(() => messages[locale], [locale]);

  function chooseLocale(nextLocale: Locale) {
    setLocale(nextLocale);
    setHasPreference(true);
    window.localStorage.setItem(storageKey, nextLocale);
    document.documentElement.lang = nextLocale;
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
                <button
                  key={item}
                  type="button"
                  className={item === locale ? "selected" : ""}
                  onClick={() => chooseLocale(item)}
                >
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
            <label className="languageSelect">
              <span className="srOnly">{copy.changeLanguage}</span>
              <select value={locale} onChange={(event) => chooseLocale(event.target.value as Locale)}>
                {locales.map((item) => <option key={item} value={item}>{localeLabels[item]}</option>)}
              </select>
            </label>
          </header>

          <section className="grid" aria-label={copy.competencyOverview}>
            <article className="card">
              <div className="label">{copy.competency}</div>
              <div className="score">68%</div>
              <div className="muted">{copy.competencyChange}</div>
            </article>

            <article className="card" id="skills">
              <div className="label">{copy.priority}</div>
              {gaps.map(([name, priorityKey]) => (
                <div className="gap" key={name}>
                  <span>{name}</span>
                  <span className="priority">{copy[priorityKey]}</span>
                </div>
              ))}
            </article>

            <article className="card">
              <div className="label">{copy.recommended}</div>
              <strong>Python for Official Statistics</strong>
              <div className="muted">{copy.continueHint}</div>
              <a className="action" href="#learning">{copy.continue} →</a>
            </article>
          </section>

          <h2 className="section" id="learning">{copy.learningPath}</h2>
          <section className="card">
            {courses.map(([name, progress]) => (
              <div className="course" key={name}>
                <div>
                  <strong>{name}</strong>
                  <div className="progress" aria-label={`${progress}% ${copy.complete}`}>
                    <span style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <span className="muted">{progress}%</span>
              </div>
            ))}
          </section>
        </main>
      </div>
    </>
  );
}
