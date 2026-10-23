import assert from "node:assert/strict";
import { calculateDogCareScenario, defaultDogCareSettings, dogCareFactors } from "../src/lib/dogCareScenario.ts";

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

console.log(`Validated ${checked} scenario combinations and bottleneck behavior.`);
