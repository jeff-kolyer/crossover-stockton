import { readFileSync } from "node:fs";

const data = (name) => JSON.parse(readFileSync(new URL(`../src/data/${name}.json`, import.meta.url), "utf8"));
const investigationData = data("dogs-investigations");
const locations = data("investigation-locations");
const work = data("work").find((item) => item.id === investigationData.work_id);
const gapIds = new Set(data("gaps").map((gap) => gap.id));
const recordIds = new Set(data("records").map((record) => record.id));
const recordById = new Map(data("records").map((record) => [record.id, record]));
const projectIds = new Set(data("projects").map((project) => project.id));
const threadIds = new Set((work?.threads ?? []).map((thread) => thread.id));
const findingIds = new Set(investigationData.established_findings.map((finding) => finding.id));
const errors = [];

function references(owner, values, known, label) {
  for (const id of values ?? []) if (!known.has(id)) errors.push(`${owner}: unknown ${label} ${id}`);
}

if (!work) errors.push("Investigation work item not found");
if (work?.investigation_data_id !== investigationData.id) errors.push("Work item does not reference investigation data");
if (work?.gap_id !== investigationData.gap_id || !gapIds.has(investigationData.gap_id)) errors.push("Investigation gap mismatch");
if (new Set(investigationData.active_investigations.map((item) => item.id)).size !== investigationData.active_investigations.length) errors.push("Duplicate active investigation ID");
if (findingIds.size !== investigationData.established_findings.length) errors.push("Duplicate established finding ID");

for (const investigation of investigationData.active_investigations) {
  if (investigation.gap_id !== investigationData.gap_id) errors.push(`${investigation.id}: gap mismatch`);
  if (!["preparing_fieldwork", "in_progress", "completed"].includes(investigation.status)) errors.push(`${investigation.id}: invalid status`);
  if (!investigation.last_updated_at || !investigation.next_verification_step) errors.push(`${investigation.id}: missing update or verification step`);
  if (!investigation.public_approach?.trim() || !investigation.safeguards?.length) errors.push(`${investigation.id}: missing public approach or detailed safeguards`);
  if (new Set(investigation.questions.map((question) => question.id)).size !== investigation.questions.length) errors.push(`${investigation.id}: duplicate question ID`);
  for (const question of investigation.questions) if (!["HeartPulse", "Utensils", "Users"].includes(question.icon)) errors.push(`${investigation.id}: unsupported question icon ${question.icon}`);
  references(investigation.id, investigation.evidence_record_ids, recordIds, "evidence record");
  references(investigation.id, investigation.related_barrier_thread_ids, threadIds, "thread");
  references(investigation.id, investigation.related_project_ids, projectIds, "project");
  references(investigation.id, investigation.verified_finding_ids, findingIds, "finding");
  for (const context of investigation.evidence_context) if (context.record_id && !investigation.evidence_record_ids.includes(context.record_id)) errors.push(`${investigation.id}: context record not linked as evidence ${context.record_id}`);
  if (investigation.illustrative_outcome.status !== "illustrative_only") errors.push(`${investigation.id}: possible outcome presented as established`);
}
for (const finding of investigationData.established_findings) {
  references(finding.id, finding.evidence_record_ids, recordIds, "evidence record");
  references(finding.id, finding.related_barrier_thread_ids, threadIds, "thread");
  references(finding.id, finding.related_project_ids, projectIds, "project");
}

const investigationIds = new Set(investigationData.active_investigations.map((item) => item.id));
if (new Set(locations.map((location) => location.id)).size !== locations.length) errors.push("Duplicate investigation location ID");
for (const location of locations) {
  if (!investigationIds.has(location.investigation_id)) errors.push(`${location.id}: unknown investigation ${location.investigation_id}`);
  if (!location.name?.trim() || !location.area?.trim() || !location.description?.trim() || !location.unknown?.trim() || !location.coordinate_note?.trim()) errors.push(`${location.id}: missing description, area, unknown, or coordinate note`);
  if (!Array.isArray(location.coordinates) || location.coordinates.length !== 2 || !location.coordinates.every(Number.isFinite)) errors.push(`${location.id}: invalid coordinates`);
  else {
    const [lat, lng] = location.coordinates;
    if (lat < 37.85 || lat > 38.1 || lng < -121.45 || lng > -121.2) errors.push(`${location.id}: coordinates outside Stockton region`);
    if (location.coordinates.some((value) => String(value).split(".")[1]?.length > 3)) errors.push(`${location.id}: coordinates are too precise for public reference markers`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(location.evidence_date) || Number.isNaN(Date.parse(location.evidence_date))) errors.push(`${location.id}: invalid evidence date`);
  if (!["reported", "exploratory"].includes(location.status)) errors.push(`${location.id}: invalid status`);
  if (!["Published local report", "County report"].includes(location.evidence_type)) errors.push(`${location.id}: invalid evidence type`);
  try { if (new URL(location.source_url).protocol !== "https:") throw new Error(); } catch { errors.push(`${location.id}: invalid source URL`); }
  try { if (new URL(location.coordinate_reference_url).protocol !== "https:") throw new Error(); } catch { errors.push(`${location.id}: invalid coordinate reference URL`); }
  if (location.evidence_record_id && recordById.get(location.evidence_record_id)?.source?.url !== location.source_url) errors.push(`${location.id}: evidence record URL mismatch`);
  if (location.field_report_id && recordById.get(location.field_report_id)?.record_type !== "field_report") errors.push(`${location.id}: field report reference does not resolve`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${investigationData.active_investigations.length} active investigation, ${investigationData.established_findings.length} finding, ${locations.length} locations, and their references.`);
}
