import type { InvestigationLocation } from "../components/InvestigationLocations";

export const evidenceCategoryColors: Record<InvestigationLocation["category"], string> = {
  historical_published_report: "#65686E",
  recent_public_report: "#F8830D",
  official_location_record: "#0D69D9",
  crossover_firsthand: "#3AB034",
};

