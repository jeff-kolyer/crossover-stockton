/**
 * An illustrative flow for a hypothetical cohort of 100 dogs at risk of
 * inadequate care. Slider settings are relative scenario levels, not measured
 * Stockton rates, counts, shelter occupancy, or forecasts.
 *
 * Prevention can keep up to 20 dogs safely supported before they need a new
 * placement. Reporting and response then act in sequence. Shelter and foster
 * levels contribute to a shared temporary-care limit (up to 90 places).
 * Adoption/reunification applies only after a dog enters care. Rounding occurs
 * at each stage, and each downstream stage is capped by its upstream stage.
 */

export type DogCareFactor =
  | "shelter"
  | "foster"
  | "response"
  | "reporting"
  | "prevention"
  | "placement";

export type DogCareSettings = Record<DogCareFactor, number>;

export interface DogCareResult {
  cohort: 100;
  supportedBeforeEntry: number;
  needingResponse: number;
  detected: number;
  reached: number;
  careSpaces: number;
  enteredCare: number;
  homeOrReunited: number;
  inTemporaryCare: number;
  receivingCare: number;
  withoutAdequateCare: number;
  constraint: { label: string; explanation: string };
}

export const defaultDogCareSettings: DogCareSettings = {
  shelter: 45,
  foster: 35,
  response: 70,
  reporting: 75,
  prevention: 25,
  placement: 55,
};

export const dogCareFactors: Array<{
  key: DogCareFactor;
  label: string;
  description: string;
}> = [
  { key: "shelter", label: "Shelter capacity", description: "Relative availability of safe shelter places" },
  { key: "foster", label: "Foster / rescue capacity", description: "Relative availability of temporary homes and partners" },
  { key: "response", label: "Response to reports", description: "Share of detected dogs a responder can reach" },
  { key: "reporting", label: "Observation and reporting", description: "Share of dogs needing response that are identified" },
  { key: "prevention", label: "Prevention / spay-neuter", description: "Support that may avert a need for new placement" },
  { key: "placement", label: "Adoption and reunification", description: "Share entering care who reach a lasting home" },
];

function level(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function calculateDogCareScenario(settings: DogCareSettings): DogCareResult {
  const shelter = level(settings.shelter);
  const foster = level(settings.foster);
  const response = level(settings.response);
  const reporting = level(settings.reporting);
  const prevention = level(settings.prevention);
  const placement = level(settings.placement);

  const supportedBeforeEntry = Math.round(prevention * 0.2);
  const needingResponse = 100 - supportedBeforeEntry;
  const detected = Math.round(needingResponse * reporting / 100);
  const reached = Math.round(detected * response / 100);
  const careSpaces = Math.round(shelter * 0.55 + foster * 0.35);
  const enteredCare = Math.min(reached, careSpaces);
  const homeOrReunited = Math.round(enteredCare * placement / 100);
  const inTemporaryCare = enteredCare - homeOrReunited;
  const receivingCare = supportedBeforeEntry + enteredCare;
  const withoutAdequateCare = 100 - receivingCare;

  const missedInReporting = needingResponse - detected;
  const missedInResponse = detected - reached;
  const missedAtCapacity = reached - enteredCare;
  let constraint: DogCareResult["constraint"];

  if (missedAtCapacity > 0 && missedAtCapacity >= missedInReporting && missedAtCapacity >= missedInResponse) {
    const shelterGain = Math.min(reached, Math.round(Math.min(100, shelter + 10) * 0.55 + foster * 0.35)) - enteredCare;
    const fosterGain = Math.min(reached, Math.round(shelter * 0.55 + Math.min(100, foster + 10) * 0.35)) - enteredCare;
    constraint = {
      label: shelterGain >= fosterGain ? "Shelter capacity" : "Foster / rescue capacity",
      explanation: "More dogs are reached than can enter temporary care in this scenario. Additional usable places could help; a lasting home is a separate later step.",
    };
  } else if (missedInReporting >= missedInResponse && missedInReporting > 0) {
    constraint = {
      label: "Observation and reporting",
      explanation: "The largest modeled drop happens before dogs are identified. Adding care space alone would not reach those dogs.",
    };
  } else if (missedInResponse > 0) {
    constraint = {
      label: "Response to reports",
      explanation: "The largest modeled drop is between identifying a dog and reaching it. Adding care space alone would not change that step.",
    };
  } else {
    constraint = {
      label: "No access-stage loss",
      explanation: "Every dog needing a response reaches temporary care in this scenario. Adoption and reunification still determine how many leave care for a lasting home.",
    };
  }

  return {
    cohort: 100,
    supportedBeforeEntry,
    needingResponse,
    detected,
    reached,
    careSpaces,
    enteredCare,
    homeOrReunited,
    inTemporaryCare,
    receivingCare,
    withoutAdequateCare,
    constraint,
  };
}
