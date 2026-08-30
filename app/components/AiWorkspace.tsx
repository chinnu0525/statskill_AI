"use client";

import { FormEvent, useEffect, useState } from "react";
import type { AiDifficulty } from "../../src/domain/ai";
import type { Locale } from "../../src/i18n/messages";
import {
  AiApiError,
  askGroundedTutor,
  generateDocumentQuiz,
  listQuizReadyDocuments,
  type TutorResult,
} from "../../src/services/ai";
import type { LearningDocument } from "../../src/services/documents";

export function AiWorkspace({
  locale,
  copy,
  onQuizGenerated,
  materialsRefreshKey = 0,
}: {
  locale: Locale;
  copy: Record<string, string>;
  onQuizGenerated: (assessmentId: string) => void;
  materialsRefreshKey?: number;
}) {
  const [documents, setDocuments] = useState<LearningDocument[]>([]);
  const [documentId, setDocumentId] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState<AiDifficulty>("MEDIUM");
  const [quizRequestId, setQuizRequestId] = useState<string | null>(null);
  const [quizBusy, setQuizBusy] = useState(false);
  const [quizMessage, setQuizMessage] = useState("");
  const [question, setQuestion] = useState("");
  const [tutorRequestId, setTutorRequestId] = useState<string | null>(null);
  const [tutorBusy, setTutorBusy] = useState(false);
  const [tutorMessage, setTutorMessage] = useState("");
  const [tutorResult, setTutorResult] = useState<TutorResult | null>(null);

  useEffect(() => {
    setQuizRequestId(null);
    listQuizReadyDocuments()
      .then((items) => {
        setDocuments(items);
        setDocumentId((current) => current && items.some((item) => item.id === current) ? current : items[0]?.id ?? "");
      })
      .catch(() => {
        setDocuments([]);
        setDocumentId("");
      });
  }, [materialsRefreshKey]);

  useEffect(() => {
    setQuizRequestId(null);
    setTutorRequestId(null);
  }, [locale]);

  function aiErrorMessage(error: unknown, fallback: string) {
    if (error instanceof AiApiError && ["AI_GATEWAY_NOT_CONFIGURED", "AI_GATEWAY_AUTH_NOT_CONFIGURED"].includes(error.code)) {
      return copy.gatewayNotConfigured;
    }
    return fallback;
  }

  async function handleGenerateQuiz() {
    if (!documentId || quizBusy) return;
    const requestId = quizRequestId ?? crypto.randomUUID();
    if (!quizRequestId) setQuizRequestId(requestId);
    setQuizBusy(true);
    setQuizMessage("");
    try {
      const result = await generateDocumentQuiz({ documentId, locale, questionCount, difficulty, requestId });
      setQuizRequestId(null);
      setQuizMessage(`${copy.quizReady}. ${copy.quizReadyHint}`);
      onQuizGenerated(result.assessmentId);
    } catch (error) {
      setQuizMessage(aiErrorMessage(error, copy.quizGenerationFailed));
    } finally {
      setQuizBusy(false);
    }
  }

  async function handleTutor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || tutorBusy) return;
    const requestId = tutorRequestId ?? crypto.randomUUID();
    if (!tutorRequestId) setTutorRequestId(requestId);
    setTutorBusy(true);
    setTutorMessage("");
    setTutorResult(null);
    try {
      const result = await askGroundedTutor({ locale, question: trimmed, requestId });
      setTutorRequestId(null);
      setTutorResult(result);
    } catch (error) {
      setTutorMessage(aiErrorMessage(error, copy.tutorFailed));
    } finally {
      setTutorBusy(false);
    }
  }

  return (
    <section className="aiWorkspace" aria-labelledby="ai-tools-title">
      <div className="aiWorkspaceHeader">
        <div>
          <h2 id="ai-tools-title">{copy.aiTools}</h2>
          <p>{copy.aiToolsHint}</p>
        </div>
        <span className="aiPrivacyNote">{copy.privacyNote}</span>
      </div>

      <div className="aiGrid">
        <article className="aiCard">
          <div>
            <h3>{copy.quizGenerator}</h3>
            <p>{copy.quizGeneratorHint}</p>
          </div>

          <label className="aiField">
            <span>{copy.chooseMaterial}</span>
            <select
              value={documentId}
              onChange={(event) => {
                setDocumentId(event.target.value);
                setQuizRequestId(null);
              }}
              disabled={!documents.length || quizBusy}
            >
              {documents.length ? documents.map((document) => (
                <option key={document.id} value={document.id}>{document.title}</option>
              )) : <option value="">{copy.noReadyMaterials}</option>}
            </select>
          </label>

          <div className="aiInlineFields">
            <label className="aiField">
              <span>{copy.questionCount}</span>
              <select
                value={questionCount}
                onChange={(event) => {
                  setQuestionCount(Number(event.target.value));
                  setQuizRequestId(null);
                }}
                disabled={quizBusy}
              >
                {[5, 10, 15, 20].map((count) => <option key={count} value={count}>{count}</option>)}
              </select>
            </label>
            <label className="aiField">
              <span>{copy.difficulty}</span>
              <select
                value={difficulty}
                onChange={(event) => {
                  setDifficulty(event.target.value as AiDifficulty);
                  setQuizRequestId(null);
                }}
                disabled={quizBusy}
              >
                <option value="EASY">{copy.easy}</option>
                <option value="MEDIUM">{copy.medium}</option>
                <option value="HARD">{copy.hard}</option>
              </select>
            </label>
          </div>

          <button className="primaryButton" type="button" onClick={handleGenerateQuiz} disabled={!documentId || quizBusy}>
            {quizBusy ? copy.generatingQuiz : copy.generateQuiz}
          </button>
          {quizMessage ? <p className="aiStatus" role="status">{quizMessage}</p> : null}
        </article>

        <article className="aiCard">
          <div>
            <h3>{copy.tutorTitle}</h3>
            <p>{copy.tutorHint}</p>
          </div>

          <form className="aiTutorForm" onSubmit={handleTutor}>
            <textarea
              value={question}
              onChange={(event) => {
                setQuestion(event.target.value);
                setTutorRequestId(null);
              }}
              placeholder={copy.tutorPlaceholder}
              maxLength={1200}
              rows={5}
            />
            <div className="aiTutorFooter">
              <span className="muted">{question.length}/1200</span>
              <button className="primaryButton" type="submit" disabled={!question.trim() || tutorBusy}>
                {tutorBusy ? copy.askingTutor : copy.askTutor}
              </button>
            </div>
          </form>

          {tutorMessage ? <p className="aiStatus" role="status">{tutorMessage}</p> : null}
          {tutorResult ? (
            <div className="aiAnswer" role="status">
              <div className="label">{tutorResult.supported ? copy.groundedAnswer : copy.insufficientEvidence}</div>
              <p>{tutorResult.answer}</p>
              {tutorResult.sourceChunkIds.length ? (
                <div className="aiSources">
                  <span>{copy.sourcesUsed}</span>
                  <div>
                    {tutorResult.sourceChunkIds.map((sourceId) => (
                      <code key={sourceId}>{sourceId.slice(0, 8)}</code>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </article>
      </div>
    </section>
  );
}
