import type { InvestigationLocation } from "../components/InvestigationLocations";

export const evidenceCategoryColors: Record<InvestigationLocation["category"], string> = {
  historical_published_report: "#AEB5BD",
  recent_public_report: "#E88A22",
  official_animal_services_record: "#026BF5",
  crossover_firsthand: "#16836C",
};

export const evidenceMarkerColors: Record<NonNullable<InvestigationLocation["marker_kind"]>, string> = {
  reported_sighting: "#E88A22",
  historical_sighting: "#AEB5BD",
  major_reported_concern: "#AEB5BD",
  firsthand_observation: "#16836C",
};

export const taskRingColor = "#26C675";
