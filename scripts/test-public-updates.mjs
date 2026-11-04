import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { publicUpdateCategory, publicUpdateDate, selectPublicUpdates } from "../src/model/publicUpdates.ts";

const readJson = async (name) => JSON.parse(await readFile(new URL(`../src/data/${name}.json`, import.meta.url), "utf8"));
const needs = (await readJson("needs")).records;
const evidence = [...await readJson("evidence"), ...await readJson("activities")];
const objectives = await readJson("objectives");
const actions = await readJson("actions");
const receiptId = "crossover-2026-11-02-sas-field-call-records-received";

test("the receipt is one activity shared by Activity and public Updates", () => {
  const receipt = evidence.find((record) => record.id === receiptId);
  assert.equal(receipt?.record_type, "activity");
  assert.equal(receipt?.public_update, true);
  assert.equal(receipt?.visibility, "public");
  assert.ok(receipt.basis_record_ids.includes("crossover-2026-10-20-sas-field-call-records-request"));
  assert.ok(objectives.some((objective) => objective.activity_record_ids.includes(receiptId)));
  assert.ok(!needs.find((need) => need.id === "dogs-safe-placement").record_ids.includes(receiptId));
  const update = selectPublicUpdates(needs, evidence).find((item) => item.record.id === receiptId);
  assert.equal(update.record, receipt);
  assert.equal(actions.find((action) => action.id === "task-review-sas-field-call-records").status, "open");
  assert.equal(actions.find((action) => action.id === "task-sas-field-call-request-2026-10-20").status, "done");
  assert.deepEqual(publicUpdateDate(receipt), { value: "2026-11-02", meaning: "occurred" });
});

test("ordinary activities stay private to Activity, while curated developments remain", () => {
  const updates = selectPublicUpdates(needs, evidence);
  assert.ok(!updates.some((item) => item.record.id === "crossover-2026-10-20-sas-field-call-records-request"));
  assert.ok(updates.some((item) => item.record.id === "stocktonia-2026-10-20-animal-control-proposals"));
  assert.equal(updates.length, new Set(updates.map((item) => item.record.id)).size);
  assert.ok(updates.findIndex((item) => item.record.id === receiptId) < updates.findIndex((item) => item.record.id === "stocktonia-2026-10-20-animal-control-proposals"));
});

test("publication needs an explicit activity flag and an active related need", () => {
  const base = evidence.find((record) => record.id === receiptId);
  const hidden = { ...base, id: "hidden-fixture", public_update: false };
  const internal = { ...base, id: "internal-fixture", visibility: "internal" };
  const noVisibility = { ...base, id: "no-visibility-fixture", visibility: undefined };
  const unrelated = { ...base, id: "unrelated-fixture", gap_ids: [] };
  const undated = { ...base, id: "undated-fixture", occurred_at: undefined };
  const invalid = { ...base, id: "invalid-fixture", occurred_at: "2026-02-31" };
  const published = { ...base, id: "published-fixture" };
  const updates = selectPublicUpdates(needs, [...evidence, hidden, internal, noVisibility, unrelated, undated, invalid, published]);
  assert.ok(updates.some((item) => item.record.id === published.id));
  for (const fixture of [hidden, internal, noVisibility, unrelated, undated, invalid]) assert.ok(!updates.some((item) => item.record.id === fixture.id), fixture.id);
  assert.deepEqual(publicUpdateDate(undated), { value: null, meaning: "undated" });
  assert.deepEqual(publicUpdateDate(invalid), { value: null, meaning: "invalid" });
});

test("published and reviewed dates retain their distinct meanings", () => {
  const external = evidence.find((record) => record.id === "stocktonia-2026-10-20-animal-control-proposals");
  assert.equal(publicUpdateDate(external).meaning, "published");
  assert.deepEqual(publicUpdateDate({ ...external, published_at: null, checked_at: "2026-11-01" }), { value: "2026-11-01", meaning: "reviewed" });
});

test("public update categories follow provenance and leave unknown combinations unclassified", () => {
  const updates = selectPublicUpdates(needs, evidence);
  assert.ok(updates.every(({ record }) => publicUpdateCategory(record) !== null));
  assert.equal(publicUpdateCategory(updates.find(({ record }) => record.id === receiptId).record), "investigation_update");
  assert.equal(publicUpdateCategory(updates.find(({ record }) => record.id === "stocktonia-2026-10-20-animal-control-proposals").record), "development");
  assert.equal(publicUpdateCategory({ ...evidence.find((record) => record.id === receiptId), trust: "unknown" }), null);
});
