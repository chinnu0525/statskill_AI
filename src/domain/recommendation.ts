import type { SkillGap } from "./competency";

export type LearningCandidate = {
  id: string;
  competencyId: string;
  source: "LOCAL" | "IGOT" | "NSSTA";
  level?: string;
  durationMinutes?: number;
};

export type RankedRecommendation = LearningCandidate & {
  score: number;
  reason: string;
};

const sourceWeight: Record<LearningCandidate["source"], number> = {
  LOCAL: 2,
  IGOT: 3,
  NSSTA: 3,
};

export function rankLearningRecommendations(
  gaps: SkillGap[],
  candidates: LearningCandidate[],
  limit = 5,
): RankedRecommendation[] {
  const gapByCompetency = new Map(gaps.map((gap) => [gap.competencyId, gap]));

  return candidates
    .map((candidate) => {
      const gap = gapByCompetency.get(candidate.competencyId);
      const gapWeight = gap ? gap.gapScore * 2 : 0;
      const priorityWeight = gap?.priority === "HIGH" ? 30 : gap?.priority === "MEDIUM" ? 15 : 5;
      const durationPenalty = candidate.durationMinutes && candidate.durationMinutes > 360 ? 5 : 0;
      const score = gapWeight + priorityWeight + sourceWeight[candidate.source] - durationPenalty;
      return {
        ...candidate,
        score,
        reason: gap
          ? `Addresses a ${gap.priority.toLowerCase()}-priority competency gap of ${gap.gapScore} points.`
          : "Relevant learning resource for the current role profile.",
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
