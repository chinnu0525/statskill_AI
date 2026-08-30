export type AssessmentQuestion = {
  id: string;
  competencyId: string;
  correctAnswer: string;
  weight?: number;
};

export type AssessmentResponse = {
  questionId: string;
  answer: string;
};

export type CompetencyAssessmentResult = {
  competencyId: string;
  score: number;
  answered: number;
  correct: number;
};

export function scoreAssessment(
  questions: AssessmentQuestion[],
  responses: AssessmentResponse[],
): CompetencyAssessmentResult[] {
  const responseByQuestion = new Map(responses.map((response) => [response.questionId, response.answer]));
  const buckets = new Map<string, { earned: number; possible: number; answered: number; correct: number }>();

  for (const question of questions) {
    const weight = Math.max(0.1, question.weight ?? 1);
    const bucket = buckets.get(question.competencyId) ?? { earned: 0, possible: 0, answered: 0, correct: 0 };
    const response = responseByQuestion.get(question.id);
    const isCorrect = response !== undefined && response === question.correctAnswer;

    bucket.possible += weight;
    if (response !== undefined) bucket.answered += 1;
    if (isCorrect) {
      bucket.correct += 1;
      bucket.earned += weight;
    }
    buckets.set(question.competencyId, bucket);
  }

  return [...buckets.entries()].map(([competencyId, bucket]) => ({
    competencyId,
    score: bucket.possible ? Math.round((bucket.earned / bucket.possible) * 100) : 0,
    answered: bucket.answered,
    correct: bucket.correct,
  }));
}
