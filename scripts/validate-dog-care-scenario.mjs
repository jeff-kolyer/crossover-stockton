import assert from "node:assert/strict";
import { calculateDogCareScenario, defaultDogCareSettings, dogCareFactors } from "../src/lib/dogCareScenario.ts";
import { effectiveCareSettings, improvementAdjustments } from "../src/lib/dogCareImprovements.ts";

const levels = [0, 20, 50, 80, 100];
let checked = 0;

function check(settings) {
  const result = calculateDogCareScenario(settings);
  assert.equal(result.cohort, 100);
  assert.equal(result.needingResponse + result.supportedBeforeEntry, 100);
  assert.ok(result.detected <= result.needingResponse);
  assert.ok(result.reached <= result.detected);
  assert.ok(result.enteredCare <= result.reached);
  assert.ok(result.enteredCare <= result.careSpaces);
  assert.equal(result.homeOrReunited + result.inTemporaryCare, result.enteredCare);
  assert.equal(result.receivingCare, result.supportedBeforeEntry + result.enteredCare);
  assert.equal(result.withoutAdequateCare + result.receivingCare, 100);
  checked += 1;
}

for (const shelter of levels)
  for (const foster of levels)
    for (const response of levels)
      for (const reporting of levels)
        for (const prevention of levels)
          for (const placement of levels)
            check({ shelter, foster, response, reporting, prevention, placement });

for (const { key } of dogCareFactors) {
  const low = calculateDogCareScenario({ ...defaultDogCareSettings, [key]: 0 });
  const high = calculateDogCareScenario({ ...defaultDogCareSettings, [key]: 100 });
  if (key === "placement") {
    assert.equal(low.withoutAdequateCare, high.withoutAdequateCare);
    assert.ok(high.homeOrReunited > low.homeOrReunited);
  } else {
    assert.ok(high.withoutAdequateCare <= low.withoutAdequateCare, `${key} must not worsen access`);
  }
}

const responseBottleneck = { ...defaultDogCareSettings, response: 20 };
const before = calculateDogCareScenario(responseBottleneck);
const after = calculateDogCareScenario({ ...responseBottleneck, shelter: 100 });
assert.equal(before.withoutAdequateCare, after.withoutAdequateCare);
assert.equal(after.constraint.label, "Response to reports");

const selected = ["municipal-shelter-expansion", "canine-campus-proposal"];
const applied = effectiveCareSettings(defaultDogCareSettings, selected);
assert.equal(applied.shelter, 70);
assert.equal(applied.foster, 45);
assert.equal(applied.prevention, 30);
assert.deepEqual(improvementAdjustments([...selected, "canine-campus-proposal"]), improvementAdjustments(selected), "repeated selection must not double-count a project");
assert.equal(effectiveCareSettings(defaultDogCareSettings, ["canine-campus-proposal"]).shelter, 55);
assert.deepEqual(effectiveCareSettings(defaultDogCareSettings, []), defaultDogCareSettings, "reset must restore defaults");
const movedSlider = { ...defaultDogCareSettings, shelter: 60 - improvementAdjustments(selected).shelter };
assert.equal(effectiveCareSettings(movedSlider, selected).shelter, 60, "manual slider movement must coexist with selected projects");
assert.equal(effectiveCareSettings(movedSlider, []).shelter, 35, "removing improvements must preserve the manual baseline");
assert.equal(effectiveCareSettings({ ...defaultDogCareSettings, shelter: 95 }, selected).shelter, 100, "displayed settings must stay bounded");
assert.notDeepEqual(calculateDogCareScenario(applied), calculateDogCareScenario(defaultDogCareSettings), "selected improvements must pass through scenario calculations");

console.log(`Validated ${checked} scenario combinations, bottleneck behavior, and modeled improvement state.`);
