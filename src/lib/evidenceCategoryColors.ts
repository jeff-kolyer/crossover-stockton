import type { InvestigationLocation } from "../components/InvestigationLocations";

export const evidenceCategoryColors: Record<InvestigationLocation["category"], string> = {
  historical_published_report: "#7E858A",
  recent_public_report: "#E78924",
  official_location_record: "#1672E7",
  crossover_firsthand: "#16836C",
};

