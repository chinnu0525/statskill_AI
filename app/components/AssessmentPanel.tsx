"use client";

import { useEffect, useState } from "react";
import type { Locale } from "../../src/i18n/messages";
import {
  listAssessments,
  loadAssessmentQuestions,
  submitAssessment,
  type AssessmentQuestion,
  type AssessmentSummary,
} from "../../src/services/assessments";

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
  const [score, setScore] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setQuestions([]);
    setAnswers({});
    setScore(null);
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

  async function startAssessment() {
    if (!selectedId) return;
    setBusy(true);
    setMessage("");
    setScore(null);
    try {
      setQuestions(await loadAssessmentQuestions(selectedId));
      setAnswers({});
    } catch {
      setMessage(copy.assessmentLoadFailed);
    } finally {
      setBusy(false);
    }
  }

  async function finishAssessment() {
    if (!selectedId || questions.some((question) => !answers[question.id])) return;
    setBusy(true);
    setMessage("");
    try {
      const result = await submitAssessment(
        selectedId,
        questions.map((question) => ({ questionId: question.id, answer: answers[question.id] })),
      );
      setScore(result.score);
      setQuestions([]);
      setAnswers({});
      onCompleted();
    } catch {
      setMessage(copy.assessmentSubmitFailed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="assessmentCard" aria-labelledby="assessment-title">
      <div className="assessmentHeader">
        <div>
          <h2 id="assessment-title">{copy.assessmentCheck}</h2>
          <p>{copy.assessmentHint}</p>
        </div>
        {!questions.length ? (
          <div className="assessmentActions">
            <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)} aria-label={copy.chooseAssessment}>
              {assessments.length ? assessments.map((item) => <option key={item.id} value={item.id}>{item.title}</option>) : <option value="">{copy.noAssessments}</option>}
            </select>
            <button className="primaryButton compactButton" type="button" onClick={startAssessment} disabled={!selectedId || busy}>
              {copy.startAssessment}
            </button>
          </div>
        ) : null}
      </div>

      {score !== null ? <div className="assessmentScore" role="status">{copy.latestScore}: <strong>{score}%</strong></div> : null}
      {message ? <p className="authMessage" role="status">{message}</p> : null}

      {questions.length ? (
        <div className="questionList">
          {questions.map((question, index) => (
            <fieldset className="questionBlock" key={question.id}>
              <legend>{index + 1}. {question.text}</legend>
              <div className="answerOptions">
                {question.options.map((option) => (
                  <label key={option.id}>
                    <input
                      type="radio"
                      name={question.id}
                      value={option.id}
                      checked={answers[question.id] === option.id}
                      onChange={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <button className="primaryButton" type="button" onClick={finishAssessment} disabled={busy || questions.some((question) => !answers[question.id])}>
            {busy ? copy.submittingAssessment : copy.submitAssessment}
          </button>
        </div>
      ) : null}
    </section>
  );
}
