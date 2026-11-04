import { existsSync, readFileSync } from "node:fs";

const readData = (name) => JSON.parse(readFileSync(new URL(`../src/data/${name}.json`, import.meta.url), "utf8"));
const investigation = readData("investigations").records.find((item) => item.id === "street-dog-immediate-welfare");
const measurements = readData("measurements").filter((item) => item.investigation_id === investigation?.id);
const records = new Map([...readData("evidence"), ...readData("activities")].map((item) => [item.id, item]));
const errors = [];

if (!investigation || investigation.gap_id !== "dogs-safe-placement") errors.push("Dog investigation is missing its need");
if (!existsSync(new URL("../docs/research/dogs-research-baseline-2026-10.md", import.meta.url))) errors.push("Source review report is missing");

const measurementIds = new Set();
for (const measurement of measurements) {
  if (measurementIds.has(measurement.id)) errors.push(`Duplicate measurement ${measurement.id}`);
  measurementIds.add(measurement.id);
  if (!Number.isFinite(measurement.value) || measurement.value < 0) errors.push(`${measurement.id}: invalid value`);
  const source = records.get(measurement.source_record_id);
  if (!source) errors.push(`${measurement.id}: unknown source record ${measurement.source_record_id}`);
  if (!source?.coverage_note || source.coverage_id !== measurement.coverage_id) errors.push(`${measurement.id}: coverage is not defined on its evidence record`);
  if (!measurement.species || !measurement.unit || !measurement.period_start || !measurement.period_end || !measurement.verified_at) errors.push(`${measurement.id}: incomplete provenance`);
}

const get = (id) => measurements.find((item) => item.id === `sas-2024-dog-${id}`)?.value;
const intakeParts = ["intake-stray", "intake-owner-surrender", "intake-confiscate", "intake-spay-service", "intake-other"];
const outcomeParts = ["outcome-adopted", "outcome-rescue-transfer", "outcome-return-owner", "outcome-euthanasia", "outcome-died", "outcome-missing", "outcome-other"];
if (intakeParts.reduce((sum, id) => sum + (get(id) ?? NaN), 0) !== get("intake-total")) errors.push("2024 dog intake categories do not total");
if (outcomeParts.reduce((sum, id) => sum + (get(id) ?? NaN), 0) !== get("outcome-total")) errors.push("2024 dog outcome categories do not total");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${measurements.length} dog measurements and their evidence sources.`);
}
