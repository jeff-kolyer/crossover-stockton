import type { DogCareFactor, DogCareSettings } from "./dogCareScenario";

export interface ModeledImprovement {
  id: string;
  projectId: string;
  adjustments: Partial<DogCareSettings>;
}

// These point changes are teaching assumptions, separate from project records.
export const modeledImprovements: ModeledImprovement[] = [
  { id: "municipal-shelter-expansion", projectId: "stockton-animal-shelter-renovation", adjustments: { shelter: 15 } },
  { id: "canine-campus-proposal", projectId: "canine-campus", adjustments: { shelter: 10, foster: 10, prevention: 5 } },
];

export const factorExplanations: Record<DogCareFactor, string> = {
  shelter: "Shelter capacity affects how many reached dogs can enter temporary care. More space helps only if dogs are first identified and reached.",
  foster: "Foster homes and rescue partners add temporary care options for dogs who have been reached. Availability also depends on suitable placements and support.",
  response: "After a dog is reported, a responder must be able to assess and reach it. Additional care space alone cannot change this step.",
  reporting: "Dogs must be noticed and reported before a response can begin. Historical reports do not establish where a dog is now.",
  prevention: "Prevention and support can reduce the number of dogs needing new placement. The model treats this as a limited early step, not a measured local rate.",
  placement: "Adoption and reunification create lasting outcomes after dogs enter care. In this model they do not increase the number who can enter temporary care.",
};

export function improvementAdjustments(selectedIds: readonly string[]): DogCareSettings {
  const selected = new Set(selectedIds);
  const totals: DogCareSettings = { shelter: 0, foster: 0, response: 0, reporting: 0, prevention: 0, placement: 0 };
  for (const improvement of modeledImprovements) {
    if (!selected.has(improvement.id)) continue;
    for (const key of Object.keys(improvement.adjustments) as DogCareFactor[]) {
      totals[key] += improvement.adjustments[key] ?? 0;
    }
  }
  return totals;
}

export function effectiveCareSettings(manual: DogCareSettings, selectedIds: readonly string[]): DogCareSettings {
  const adjustments = improvementAdjustments(selectedIds);
  const effective = { ...manual };
  for (const key of Object.keys(effective) as DogCareFactor[]) {
    effective[key] = Math.max(0, Math.min(100, manual[key] + adjustments[key]));
  }
  return effective;
}
