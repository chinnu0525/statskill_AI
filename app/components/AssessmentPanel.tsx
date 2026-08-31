"use client";

import { useEffect, useMemo, useState } from "react";
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

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = Math.max(totalSeconds % 60, 0).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
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
  const [secondsRemaining, setSecondsRemaining] = useState(DEFAULT_DURATION_SECONDS);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const currentQuestion = questions[currentIndex];
  const answeredCount = useMemo(() => questions.filter((question) => Boolean(answers[question.id])).length, [answers, questions]);
  const markedCount = useMemo(() => questions.filter((question) => marked[question.id]).length, [marked, questions]);
  const unansweredCount = questions.length - answeredCount;

  useEffect(() => {
    setQuestions([]);
    setAnswers({});
    setMarked({});
    setResult(null);
    setCurrentIndex(0);
    setSecondsRemaining(DEFAULT_DURATION_SECONDS);
    listAssessments(locale)
      .then((items) => {
        setAssessments(items);
        const preferred = preferredAssessmentId && items.some((item) => item.id === preferredAssessmentId)
          ? preferredAssessmentId
          : items[0]?.id ?? "";
        setSelectedId(preferred);
      })
      .catch(() => {
        setAssessments([]);
        setSelectedId("");
      });
  }, [locale, refreshKey, preferredAssessmentId]);

  useEffect(() => {
    if (!questions.length || result || secondsRemaining <= 0) return;
    const timer = window.setInterval(() => setSecondsRemaining((value) => Math.max(value - 1, 0)), 1000);
    return () => window.clearInterval(timer);
  }, [questions.length, result, secondsRemaining]);

  useEffect(() => {
    if (questions.length && secondsRemaining === 0 && !result) setMessage(copy.timeExpired);
  }, [copy.timeExpired, questions.length, result, secondsRemaining]);

  async function startAssessment() {
    if (!selectedId) return;
    setBusy(true);
    setMessage("");
    setResult(null);
    try {
      const loaded = await loadAssessmentQuestions(selectedId);
      setQuestions(loaded);
      setAnswers({});
      setMarked({});
      setCurrentIndex(0);
      setSecondsRemaining(DEFAULT_DURATION_SECONDS);
    } catch {
      setMessage(copy.assessmentLoadFailed);
    } finally {
      setBusy(false);
    }
  }

  function chooseAnswer(questionId: string, optionId: string) {
    setAnswers((current) => ({ ...current, [questionId]: optionId }));
    setMessage("");
  }

  function toggleMarked(questionId: string) {
    setMarked((current) => ({ ...current, [questionId]: !current[questionId] }));
  }

  function goToQuestion(index: number) {
    if (index < 0 || index >= questions.length) return;
    setCurrentIndex(index);
  }

  async function finishAssessment() {
    if (!selectedId || !questions.length) return;
    if (unansweredCount > 0) {
      const firstUnanswered = questions.findIndex((question) => !answers[question.id]);
      if (firstUnanswered >= 0) setCurrentIndex(firstUnanswered);
      setMessage(copy.answerAllFirst.replace("{count}", String(unansweredCount)));
      return;
    }
    if (!window.confirm(copy.confirmSubmit)) return;

    setBusy(true);
    setMessage("");
    try {
      const submitted = await submitAssessment(
        selectedId,
        questions.map((question) => ({ questionId: question.id, answer: answers[question.id] })),
      );
      setResult(submitted);
      setQuestions([]);
      setAnswers({});
      setMarked({});
      onCompleted();
    } catch {
      setMessage(copy.assessmentSubmitFailed);
    } finally {
      setBusy(false);
    }
  }

  function resetResult() {
    setResult(null);
    setMessage("");
    setSecondsRemaining(DEFAULT_DURATION_SECONDS);
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
            <article><span>{copy.completionStatus}</span><strong>{copy.completed}</strong></article>
          </div>
          <div className="resultFeedback">
            <div><strong>{copy.nextStep}</strong><p>{result.score >= 80 ? copy.nextStepStrong : copy.nextStepReview}</p></div>
            <div><strong>{copy.secureScoring}</strong><p>{copy.secureScoringHint}</p></div>
          </div>
          <button className="primaryButton" type="button" onClick={resetResult}>{copy.takeAnother}</button>
        </div>
      ) : null}

      {questions.length && currentQuestion ? (
        <div className="quizShell">
          <div className="quizTopbar">
            <div>
              <span className="assessmentEyebrow">{copy.inProgress}</span>
              <strong>{selectedTitle}</strong>
            </div>
            <div className={`quizTimer ${secondsRemaining <= 60 ? "urgent" : ""}`} aria-label={copy.timeRemaining}>
              <span>{copy.timeRemaining}</span><strong>{formatTime(secondsRemaining)}</strong>
            </div>
            <button className="primaryButton compactButton" type="button" onClick={finishAssessment} disabled={busy}>
              {busy ? copy.submittingAssessment : copy.submitAssessment}
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
                >
                  {marked[currentQuestion.id] ? copy.markedForReview : copy.markForReview}
                </button>
              </div>

              <fieldset className="quizQuestionBlock">
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
                  <button className="primaryButton compactButton" type="button" onClick={finishAssessment} disabled={busy}>{copy.finishAndSubmit}</button>
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
