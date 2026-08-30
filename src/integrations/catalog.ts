export type ExternalCatalogSource = "IGOT" | "NSSTA";

export type ExternalLearningItem = {
  source: ExternalCatalogSource;
  externalId: string;
  title: string;
  locale: "en" | "hi" | "te";
  competencyCode: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  durationMinutes?: number;
  url?: string;
};

export interface LearningCatalogAdapter {
  readonly source: ExternalCatalogSource;
  search(input: { competencyCode?: string; locale?: "en" | "hi" | "te"; query?: string }): Promise<ExternalLearningItem[]>;
  getById(externalId: string, locale?: "en" | "hi" | "te"): Promise<ExternalLearningItem | null>;
}
