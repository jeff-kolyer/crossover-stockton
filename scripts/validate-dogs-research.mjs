import { existsSync, readFileSync } from "node:fs";

const readData = (name) => JSON.parse(readFileSync(new URL(`../src/data/${name}.json`, import.meta.url), "utf8"));
const research = readData("dogs-research");
const records = new Set(readData("records").map((item) => item.id));
const projects = new Set(readData("projects").map((item) => item.id));
const works = readData("work");
const errors = [];

function checkReferences(owner, values, known, kind) {
  for (const id of values ?? []) if (!known.has(id)) errors.push(`${owner}: unknown ${kind} ${id}`);
}

const work = works.find((item) => item.id === research.work_id);
if (!work) errors.push(`Unknown research work ${research.work_id}`);
if (work?.research_data_id !== research.id) errors.push("Research work does not reference this dataset");
if (work?.last_reviewed_at !== research.last_reviewed_at) errors.push("Work and dataset review dates differ");
if (!existsSync(new URL(`../${research.report_path}`, import.meta.url))) errors.push("Research report is missing");

const measurementIds = new Set();
for (const measurement of research.measurements) {
  if (measurementIds.has(measurement.id)) errors.push(`Duplicate measurement ${measurement.id}`);
  measurementIds.add(measurement.id);
  if (!Number.isFinite(measurement.value) || measurement.value < 0) errors.push(`${measurement.id}: invalid value`);
  if (!research.coverage[measurement.coverage_id]) errors.push(`${measurement.id}: unknown coverage`);
  if (!measurement.species || !measurement.unit || !measurement.period_start || !measurement.period_end || !measurement.verified_at) errors.push(`${measurement.id}: incomplete provenance`);
  checkReferences(measurement.id, [measurement.source_record_id], records, "record");
}
for (const signal of research.reported_signals) checkReferences(signal.id, [signal.source_record_id], records, "record");
for (const finding of research.latest_findings) checkReferences(finding.id, finding.evidence_record_ids, records, "record");
for (const item of research.research_records) checkReferences(research.id, [item.record_id], records, "record");
checkReferences(research.id, research.planned_improvements.project_ids, projects, "project");

const get = (id) => research.measurements.find((item) => item.id === `sas-2024-dog-${id}`)?.value;
const intakeParts = ["intake-stray", "intake-owner-surrender", "intake-confiscate", "intake-spay-service", "intake-other"];
const outcomeParts = ["outcome-adopted", "outcome-rescue-transfer", "outcome-return-owner", "outcome-euthanasia", "outcome-died", "outcome-missing", "outcome-other"];
if (intakeParts.reduce((sum, id) => sum + (get(id) ?? NaN), 0) !== get("intake-total")) errors.push("2024 dog intake categories do not total");
if (outcomeParts.reduce((sum, id) => sum + (get(id) ?? NaN), 0) !== get("outcome-total")) errors.push("2024 dog outcome categories do not total");
if (research.shelter_flow_reconciliation.beginning_dogs_in_care !== null || research.shelter_flow_reconciliation.ending_dogs_in_care !== null) errors.push("Population reconciliation requires verified stock counts");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${research.measurements.length} dog research measurements and all source/project references.`);
}
