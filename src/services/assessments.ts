import type { Locale } from "../i18n/messages";
import { createClient } from "../lib/supabase/client";

export type AssessmentSummary = { id: string; title: string };
export type AssessmentOption = { id: string; label: string };
export type AssessmentQuestion = { id: string; text: string; options: AssessmentOption[] };
export type AssessmentResult = { attemptId: string; score: number; correct: number; total: number };

export async function listAssessments(locale: Locale): Promise<AssessmentSummary[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("assessments")
    .select("id,title")
    .eq("locale", locale)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function loadAssessmentQuestions(assessmentId: string): Promise<AssessmentQuestion[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("questions")
    .select("id,question_text,options")
    .eq("assessment_id", assessmentId)
    .order("created_at", { ascending: true });
  if (error) throw error;

  return (data ?? []).map((question) => ({
    id: question.id,
    text: question.question_text,
    options: Array.isArray(question.options) ? (question.options as unknown as AssessmentOption[]) : [],
  }));
}

export async function submitAssessment(
  assessmentId: string,
  answers: Array<{ questionId: string; answer: string }>,
): Promise<AssessmentResult> {
  const supabase = createClient();
  const { data, error } = await supabase.functions.invoke("submit-assessment", {
    body: { assessmentId, answers },
  });
  if (error) throw error;
  if (!data?.attemptId || typeof data.score !== "number") throw new Error("INVALID_ASSESSMENT_RESPONSE");
  return data as AssessmentResult;
}
