"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "../../src/i18n/messages";
import {
  listAssessments,
  loadAssessmentQuestions,
  submitAssessment,
  type AssessmentQuestion,
  type AssessmentResult,
  type AssessmentSummary,
} from "../../src/services/assessments";

const DEFAULT_DURATION_SECONDS = 20 * 60;
const SESSION_KEY = "statskill-assessment-session-v1";

type SavedAssessmentSession = {
  assessmentId: string;
  answers: Record<string, string>;
  marked: Record<string, boolean>;
  currentIndex: number;
  expiresAt: number;
};

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = Math.max(totalSeconds % 60, 0).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function readSavedSession(): SavedAssessmentSession | null {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedAssessmentSession>;
    if (!parsed.assessmentId || typeof parsed.expiresAt !== "number") return null;
    return {
      assessmentId: parsed.assessmentId,
      answers: parsed.answers ?? {},
      marked: parsed.marked ?? {},
      currentIndex: typeof parsed.currentIndex === "number" ? parsed.currentIndex : 0,
      expiresAt: parsed.expiresAt,
    };
  } catch {
    return null;
  }
}

function clearSavedSession() {
  try { window.sessionStorage.removeItem(SESSION_KEY); } catch { /* storage unavailable */ }
}

export function AssessmentPanel({ locale, copy, onCompleted, refreshKey = 0, preferredAssessmentId = "" }: {
  locale: Locale;
  copy: Record<string, string>;
  onCompleted: () => void;
  refreshKey?: number;
  preferredAssessmentId?: string;
}) {
  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [marked, setMarked] = useState<Record<string, boolean>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(DEFAULT_DURATION_SECONDS);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const timeoutHandled = useRef(false);

  const currentQuestion = questions[currentIndex];
  const answeredCount = useMemo(() => questions.filter((question) => Boolean(answers[question.id])).length, [answers, questions]);
  const markedCount = useMemo(() => questions.filter((question) => marked[question.id]).length, [marked, questions]);
  const unansweredCount = questions.length - answeredCount;
  const expired = questions.length > 0 && secondsRemaining <= 0;

  useEffect(() => {
    let active = true;
    setQuestions([]);
    setAnswers({});
    setMarked({});
    setResult(null);
    setCurrentIndex(0);
    setExpiresAt(null);
    setSecondsRemaining(DEFAULT_DURATION_SECONDS);
    timeoutHandled.current = false;

    const saved = readSavedSession();
    listAssessments(locale)
      .then(async (items) => {
        if (!active) return;
        setAssessments(items);
        if (saved && items.some((item) => item.id === saved.assessmentId)) {
          try {
            const loaded = await loadAssessmentQuestions(saved.assessmentId);
            if (!active) return;
            setSelectedId(saved.assessmentId);
            setQuestions(loaded);
            setAnswers(saved.answers);
            setMarked(saved.marked);
            setCurrentIndex(Math.min(Math.max(saved.currentIndex, 0), Math.max(loaded.length - 1, 0)));
            setExpiresAt(saved.expiresAt);
            setSecondsRemaining(Math.max(0, Math.ceil((saved.expiresAt - Date.now()) / 1000)));
            return;
          } catch {
            clearSavedSession();
          }
        }
        const preferred = preferredAssessmentId && items.some((item) => item.id === preferredAssessmentId)
          ? preferredAssessmentId
          : items[0]?.id ?? "";
        setSelectedId(preferred);
      })
      .catch(() => {
        if (!active) return;
        setAssessments([]);
        setSelectedId("");
      });

    return () => { active = false; };
  }, [locale, refreshKey, preferredAssessmentId]);

  useEffect(() => {
    if (!questions.length || !expiresAt || result) return;
    const updateRemaining = () => setSecondsRemaining(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)));
    updateRemaining();
    const timer = window.setInterval(updateRemaining, 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt, questions.length, result]);

  useEffect(() => {
    if (!questions.length || !expiresAt) return;
    try {
      const saved: SavedAssessmentSession = { assessmentId: selectedId, answers, marked, currentIndex, expiresAt };
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(saved));
    } catch { /* storage unavailable; assessment still works in memory */ }
  }, [answers, currentIndex, expiresAt, marked, questions.length, selectedId]);

  useEffect(() => {
    if (!expired || result || busy || timeoutHandled.current) return;
    timeoutHandled.current = true;
    setMessage(copy.timeExpiredSubmitting);
    void finishAssessment({ timedOut: true });
  }, [busy, copy.timeExpiredSubmitting, expired, result]);

  async function startAssessment() {
    if (!selectedId) return;
    setBusy(true);
    setMessage("");
    setResult(null);
    timeoutHandled.current = false;
    try {
      const loaded = await loadAssessmentQuestions(selectedId);
      const deadline = Date.now() + DEFAULT_DURATION_SECONDS * 1000;
      setQuestions(loaded);
      setAnswers({});
      setMarked({});
      setCurrentIndex(0);
      setExpiresAt(deadline);
      setSecondsRemaining(DEFAULT_DURATION_SECONDS);
    } catch {
      setMessage(copy.assessmentLoadFailed);
    } finally {
      setBusy(false);
    }
  }

  function chooseAnswer(questionId: string, optionId: string) {
    if (expired || busy) return;
    setAnswers((current) => ({ ...current, [questionId]: optionId }));
    setMessage("");
  }

  function toggleMarked(questionId: string) {
    if (expired || busy) return;
    setMarked((current) => ({ ...current, [questionId]: !current[questionId] }));
  }

  function goToQuestion(index: number) {
    if (index < 0 || index >= questions.length) return;
    setCurrentIndex(index);
  }

  async function finishAssessment(options: { timedOut?: boolean } = {}) {
    if (!selectedId || !questions.length || busy) return;
    const timedOut = Boolean(options.timedOut || expired);

    if (!timedOut && unansweredCount > 0) {
      const firstUnanswered = questions.findIndex((question) => !answers[question.id]);
      if (firstUnanswered >= 0) setCurrentIndex(firstUnanswered);
      setMessage(copy.answerAllFirst.replace("{count}", String(unansweredCount)));
      return;
    }
    if (!timedOut && !window.confirm(copy.confirmSubmit)) return;

    setBusy(true);
    if (!timedOut) setMessage("");
    try {
      const submittedAnswers = questions
        .filter((question) => Boolean(answers[question.id]))
        .map((question) => ({ questionId: question.id, answer: answers[question.id] }));
      const submitted = await submitAssessment(selectedId, submittedAnswers);
      clearSavedSession();
      setResult(submitted);
      setQuestions([]);
      setAnswers({});
      setMarked({});
      setExpiresAt(null);
      onCompleted();
    } catch {
      setMessage(timedOut ? copy.timeExpiredSubmitFailed : copy.assessmentSubmitFailed);
    } finally {
      setBusy(false);
    }
  }

  function resetResult() {
    clearSavedSession();
    setResult(null);
    setMessage("");
    setExpiresAt(null);
    setSecondsRemaining(DEFAULT_DURATION_SECONDS);
    timeoutHandled.current = false;
  }

  const selectedTitle = assessments.find((assessment) => assessment.id === selectedId)?.title ?? copy.assessmentCheck;
  const resultBand = result ? (result.score >= 80 ? copy.resultStrong : result.score >= 60 ? copy.resultDeveloping : copy.resultReview) : "";

  return (
    <section className="assessmentCard quizPlayer" aria-labelledby="assessment-title">
      <div className="assessmentHeader">
        <div>
          <span className="assessmentEyebrow">{copy.secureAssessment}</span>
          <h2 id="assessment-title">{copy.assessmentCheck}</h2>
          <p>{copy.assessmentHint}</p>
        </div>
        {!questions.length && !result ? (
          <div className="assessmentActions">
            <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)} aria-label={copy.chooseAssessment}>
              {assessments.length ? assessments.map((item) => <option key={item.id} value={item.id}>{item.title}</option>) : <option value="">{copy.noAssessments}</option>}
            </select>
            <button className="primaryButton compactButton" type="button" onClick={startAssessment} disabled={!selectedId || busy}>
              {busy ? copy.loadingAssessment : copy.startAssessment}
            </button>
          </div>
        ) : null}
      </div>

      {message ? <p className="authMessage assessmentMessage" role="status">{message}</p> : null}

      {result ? (
        <div className="quizResult" role="status">
          <div className="resultBadge" aria-hidden="true">✓</div>
          <div className="resultIntro">
            <span>{copy.assessmentCompleted}</span>
            <h3>{selectedTitle}</h3>
            <p>{resultBand}</p>
          </div>
          <div className="resultMetrics">
            <article><span>{copy.latestScore}</span><strong>{result.score}%</strong></article>
            <article><span>{copy.correctAnswers}</span><strong>{result.correct} / {result.total}</strong></article>
            {result.currentLevel ? <article><span>{copy.competencyLevel}</span><strong>{result.currentLevel} / {result.requiredLevel ?? 5}</strong></article> : null}
            <article><span>{copy.completionStatus}</span><strong>{copy.completed}</strong></article>
          </div>
          <div className="resultFeedback">
            <div><strong>{copy.nextStep}</strong><p>{result.score >= 80 ? copy.nextStepStrong : copy.nextStepReview}</p></div>
            <div><strong>{copy.secureScoring}</strong><p>{copy.bloomScoringHint}</p></div>
          </div>
          <button className="primaryButton" type="button" onClick={resetResult}>{copy.takeAnother}</button>
        </div>
      ) : null}

      {questions.length && currentQuestion ? (
        <div className={`quizShell ${expired ? "expired" : ""}`}>
          <div className="quizTopbar">
            <div>
              <span className="assessmentEyebrow">{expired ? copy.timeExpiredLabel : copy.inProgress}</span>
              <strong>{selectedTitle}</strong>
            </div>
            <div className={`quizTimer ${secondsRemaining <= 60 ? "urgent" : ""}`} aria-label={copy.timeRemaining}>
              <span>{copy.timeRemaining}</span><strong>{formatTime(secondsRemaining)}</strong>
            </div>
            <button className="primaryButton compactButton" type="button" onClick={() => finishAssessment({ timedOut: expired })} disabled={busy}>
              {busy ? copy.submittingAssessment : expired ? copy.retryTimedSubmission : copy.submitAssessment}
            </button>
          </div>

          <div className="quizLayout">
            <div className="quizQuestionPane">
              <div className="questionMeta">
                <span>{copy.questionOf.replace("{current}", String(currentIndex + 1)).replace("{total}", String(questions.length))}</span>
                <button
                  className={`reviewButton ${marked[currentQuestion.id] ? "marked" : ""}`}
                  type="button"
                  onClick={() => toggleMarked(currentQuestion.id)}
                  aria-pressed={Boolean(marked[currentQuestion.id])}
                  disabled={expired || busy}
                >
                  {marked[currentQuestion.id] ? copy.markedForReview : copy.markForReview}
                </button>
              </div>

              <fieldset className="quizQuestionBlock" disabled={expired || busy}>
                <legend>{currentQuestion.text}</legend>
                <div className="quizAnswerOptions">
                  {currentQuestion.options.map((option, optionIndex) => {
                    const selected = answers[currentQuestion.id] === option.id;
                    return (
                      <label className={selected ? "selected" : ""} key={option.id}>
                        <input
                          type="radio"
                          name={currentQuestion.id}
                          value={option.id}
                          checked={selected}
                          onChange={() => chooseAnswer(currentQuestion.id, option.id)}
                        />
                        <span className="optionLetter" aria-hidden="true">{String.fromCharCode(65 + optionIndex)}</span>
                        <span>{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <div className="quizQuestionFooter">
                <button className="secondaryButton" type="button" onClick={() => goToQuestion(currentIndex - 1)} disabled={currentIndex === 0}>{copy.previous}</button>
                <span className="sessionSave">✓ {copy.sessionSaved}</span>
                {currentIndex < questions.length - 1 ? (
                  <button className="primaryButton compactButton" type="button" onClick={() => goToQuestion(currentIndex + 1)}>{copy.next}</button>
                ) : (
                  <button className="primaryButton compactButton" type="button" onClick={() => finishAssessment({ timedOut: expired })} disabled={busy}>{expired ? copy.retryTimedSubmission : copy.finishAndSubmit}</button>
                )}
              </div>
            </div>

            <aside className="questionPalette" aria-label={copy.questionPalette}>
              <div className="paletteHeading"><div><h3>{copy.questionPalette}</h3><p>{answeredCount}/{questions.length} {copy.answered}</p></div><span>{markedCount} {copy.marked}</span></div>
              <div className="paletteGrid">
                {questions.map((question, index) => {
                  const isCurrent = index === currentIndex;
                  const isAnswered = Boolean(answers[question.id]);
                  const isMarked = Boolean(marked[question.id]);
                  const stateClass = isCurrent ? "current" : isMarked ? "marked" : isAnswered ? "answered" : "unanswered";
                  return (
                    <button
                      key={question.id}
                      type="button"
                      className={stateClass}
                      onClick={() => goToQuestion(index)}
                      aria-current={isCurrent ? "step" : undefined}
                      aria-label={`${copy.question} ${index + 1}: ${isMarked ? copy.markedForReview : isAnswered ? copy.answered : copy.unanswered}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
              <div className="paletteLegend">
                <span><i className="answered" />{copy.answered}</span>
                <span><i className="marked" />{copy.marked}</span>
                <span><i className="current" />{copy.current}</span>
                <span><i className="unanswered" />{copy.unanswered}</span>
              </div>
              <div className="assessmentPrivacyNote"><strong>{copy.privateAssessment}</strong><p>{copy.privateAssessmentHint}</p></div>
            </aside>
          </div>
        </div>
      ) : null}
    </section>
  );
}
