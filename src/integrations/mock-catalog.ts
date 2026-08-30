import type { ExternalLearningItem, LearningCatalogAdapter } from "./catalog";

const items: ExternalLearningItem[] = [
  { source: "IGOT", externalId: "mock-igot-python", title: "Python for Official Statistics", locale: "en", competencyCode: "TECH-PYTHON", level: "BEGINNER", durationMinutes: 180 },
  { source: "IGOT", externalId: "mock-igot-python", title: "आधिकारिक सांख्यिकी के लिए Python", locale: "hi", competencyCode: "TECH-PYTHON", level: "BEGINNER", durationMinutes: 180 },
  { source: "IGOT", externalId: "mock-igot-python", title: "అధికారిక గణాంకాల కోసం Python", locale: "te", competencyCode: "TECH-PYTHON", level: "BEGINNER", durationMinutes: 180 },
  { source: "IGOT", externalId: "mock-igot-gis", title: "GIS Fundamentals", locale: "en", competencyCode: "TECH-GIS", level: "BEGINNER", durationMinutes: 150 },
  { source: "NSSTA", externalId: "mock-nssta-sampling", title: "Advanced Survey Sampling", locale: "en", competencyCode: "STAT-SAMPLING", level: "INTERMEDIATE", durationMinutes: 240 },
  { source: "NSSTA", externalId: "mock-nssta-data", title: "Data Quality & Governance", locale: "en", competencyCode: "DIG-DATA", level: "INTERMEDIATE", durationMinutes: 180 },
  { source: "IGOT", externalId: "mock-igot-aiml", title: "AI / ML Foundations", locale: "en", competencyCode: "TECH-AIML", level: "BEGINNER", durationMinutes: 180 }
];

class MockCatalogAdapter implements LearningCatalogAdapter {
  constructor(public readonly source: "IGOT" | "NSSTA") {}

  async search(input: { competencyCode?: string; locale?: "en" | "hi" | "te"; query?: string }) {
    const normalizedQuery = input.query?.trim().toLowerCase();
    const sourceItems = items.filter((item) => item.source === this.source);
    const preferredLocale = input.locale ?? "en";

    return sourceItems.filter((item) => {
      const localeMatch = item.locale === preferredLocale || item.locale === "en";
      const competencyMatch = !input.competencyCode || item.competencyCode === input.competencyCode;
      const queryMatch = !normalizedQuery || item.title.toLowerCase().includes(normalizedQuery);
      return localeMatch && competencyMatch && queryMatch;
    });
  }

  async getById(externalId: string, locale: "en" | "hi" | "te" = "en") {
    return items.find((item) => item.source === this.source && item.externalId === externalId && item.locale === locale)
      ?? items.find((item) => item.source === this.source && item.externalId === externalId && item.locale === "en")
      ?? null;
  }
}

export const mockIgotAdapter = new MockCatalogAdapter("IGOT");
export const mockNsstaAdapter = new MockCatalogAdapter("NSSTA");
