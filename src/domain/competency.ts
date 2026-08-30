export type CompetencyScore = {
  competencyId: string;
  score: number;
  confidence?: number;
};

export type SkillGap = {
  competencyId: string;
  score: number;
  gapScore: number;
  priority: "LOW" | "MEDIUM" | "HIGH";
  reason: string;
};

export function normalizeScore(score: number) {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score * 100) / 100));
}

export function deriveSkillGaps(scores: CompetencyScore[], target = 70): SkillGap[] {
  return scores
    .map((item) => {
      const score = normalizeScore(item.score);
      const gapScore = Math.max(0, target - score);
      const priority = gapScore >= 35 ? "HIGH" : gapScore >= 15 ? "MEDIUM" : "LOW";
      return {
        competencyId: item.competencyId,
        score,
        gapScore,
        priority,
        reason: gapScore > 0 ? `Current score is ${gapScore} points below the target.` : "Target competency level is met.",
      } as SkillGap;
    })
    .sort((a, b) => b.gapScore - a.gapScore);
}

export function calculateCompetencyIndex(scores: CompetencyScore[]) {
  if (!scores.length) return 0;
  const weighted = scores.map((item) => ({
    score: normalizeScore(item.score),
    weight: Math.max(0.1, Math.min(1, item.confidence ?? 1)),
  }));
  const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
  return Math.round(weighted.reduce((sum, item) => sum + item.score * item.weight, 0) / totalWeight);
}
