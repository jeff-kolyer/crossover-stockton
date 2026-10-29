import type { InvestigationLocation } from "../components/InvestigationLocations";

export const evidenceCategoryColors: Record<InvestigationLocation["category"], string> = {
  historical_published_report: "#7E858A",
  recent_public_report: "#E78924",
  official_animal_services_record: "#026BF5",
  crossover_firsthand: "#16836C",
};

export const openTaskColor = "#15A16E";

export function locationMarkerColor(category: InvestigationLocation["category"], hasOpenTask: boolean) {
  return hasOpenTask ? openTaskColor : evidenceCategoryColors[category];
}
