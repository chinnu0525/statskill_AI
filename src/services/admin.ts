import { createClient } from "../lib/supabase/client";

export type AdminGapSummary = {
  name: string;
  affectedLearners: number;
  averageGap: number;
  highPriorityCount: number;
};

export type AdminAnalytics = {
  workforceCount: number;
  averageCompetency: number;
  averageAssessment: number;
  highPriorityGaps: number;
  totalEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
  topGaps: AdminGapSummary[];
};

export async function loadAdminAnalytics(): Promise<AdminAnalytics> {
  const supabase = createClient();
  const { data, error } = await supabase.functions.invoke("admin-analytics", {
    method: "POST",
    body: {},
  });
  if (error) throw error;
  if (!data || typeof data.workforceCount !== "number") throw new Error("INVALID_ADMIN_ANALYTICS_RESPONSE");
  return data as AdminAnalytics;
}
