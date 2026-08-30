export type CompetencyScore = { competencyId: string; score: number; confidence: number };
export type SkillGap = { competencyId: string; severity: "low" | "medium" | "high"; score: number; reason: string };

export function deriveSkillGaps(scores: CompetencyScore[], threshold = 60): SkillGap[] {
  return scores.map((item) => ({
    competencyId: item.competencyId,
    score: item.score,
    confidence: item.confidence,
    severity: item.score < 40 ? "high" : item.score < threshold ? "medium" : "low",
    reason: item.score < threshold ? "Below the current competency threshold" : "At or above the current competency threshold"
  })).sort((a,b) => a.score - b.score);
}
