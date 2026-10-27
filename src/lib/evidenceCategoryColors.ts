import type { InvestigationLocation } from "../components/InvestigationLocations";

export const evidenceCategoryColors: Record<InvestigationLocation["category"], string> = {
  historical_published_report: "#78889A",
  recent_public_report: "#D18A35",
  official_animal_services_record: "#326CB3",
  crossover_firsthand: "#32856E",
};
