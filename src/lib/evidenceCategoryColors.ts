import type { InvestigationLocation } from "../components/InvestigationLocations";

export const evidenceCategoryColors: Record<InvestigationLocation["category"], string> = {
  historical_published_report: "#7E858A",
  recent_public_report: "#E78924",
  official_animal_services_record: "#026BF5",
  crossover_firsthand: "#16836C",
};

export const evidenceMarkerColors: Record<NonNullable<InvestigationLocation["marker_kind"]>, string> = {
  reported_sighting: "#E78924",
  historical_sighting: "#7E858A",
  major_reported_concern: "#7E858A",
  firsthand_observation: "#16836C",
};

export const taskRingColor = "#26C675";
