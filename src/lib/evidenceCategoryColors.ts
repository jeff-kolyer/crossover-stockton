import type { InvestigationLocation } from "../components/InvestigationLocations";

export const evidenceCategoryColors: Record<InvestigationLocation["category"], string> = {
  historical_published_report: "#64748B",
  recent_public_report: "#E88A24",
  official_animal_services_record: "#2563EB",
  crossover_firsthand: "#168B72",
};
