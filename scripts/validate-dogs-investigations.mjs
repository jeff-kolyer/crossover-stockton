import { readFileSync } from "node:fs";

const data = (name) => JSON.parse(readFileSync(new URL(`../src/data/${name}.json`, import.meta.url), "utf8"));
const investigationData = data("dogs-investigations");
const locations = data("investigation-locations");
const maintenance = data("investigation-map-maintenance");
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
  if (investigation.records_request && (!investigation.records_request.submitted_at || !investigation.records_request.review_plan?.trim())) errors.push(`${investigation.id}: incomplete records request`);
  if (investigation.records_request) {
    const request = recordById.get(investigation.records_request.activity_record_id);
    const activityPage = data("work").find((item) => item.id === request?.work_id && item.activity_record_ids?.includes(request.id));
    if (request?.record_type !== "activity" || !activityPage) errors.push(`${investigation.id}: records request must link to a published activity record`);
  }
  if (investigation.care_coordination && (!investigation.care_coordination.central_question?.trim() || !investigation.care_coordination.participation_scope?.trim() || !investigation.care_coordination.questions?.length || !investigation.care_coordination.potential_outcome?.trim() || !investigation.care_coordination.public_source_review?.checked_at || !investigation.care_coordination.public_source_review?.sources?.length)) errors.push(`${investigation.id}: incomplete care coordination thread`);
  if (investigation.care_coordination?.decentralized_protocol_concept?.status !== "concept_only" || investigation.care_coordination?.decentralized_protocol_concept?.steps?.length !== 5) errors.push(`${investigation.id}: decentralized care protocol must remain a five-step concept`);
  if (investigation.fieldwork_plan) {
    const plan = recordById.get(investigation.fieldwork_plan.activity_record_id);
    if (plan?.outcome?.status !== "planned" || plan?.occurred_at || plan?.report_record_ids?.length) errors.push(`${investigation.id}: fieldwork plan must be planned, not observed`);
    if (plan?.planned_for && (!/^\d{4}-\d{2}-\d{2}$/.test(plan.planned_for) || Number.isNaN(Date.parse(plan.planned_for)))) errors.push(`${investigation.id}: invalid planned visit date`);
    if (!work?.record_ids?.includes(plan?.id) && !data("work").some((item) => item.activity_record_ids?.includes(plan?.id))) errors.push(`${investigation.id}: fieldwork plan not connected to a work page`);
    if (!investigation.fieldwork_plan.observation_fields?.length || !investigation.fieldwork_plan.result_options?.includes("No dogs observed") || !investigation.fieldwork_plan.report_outline?.trim()) errors.push(`${investigation.id}: incomplete observation template`);
    for (const site of plan?.planned_sites ?? []) if (site.location_id && !locations.some((location) => location.id === site.location_id)) errors.push(`${investigation.id}: unknown planned site ${site.location_id}`);
  }
  if (new Set(investigation.questions.map((question) => question.id)).size !== investigation.questions.length) errors.push(`${investigation.id}: duplicate question ID`);
  for (const question of investigation.questions) if (!["ClipboardList", "HeartPulse", "MapPin", "Package", "Users"].includes(question.icon)) errors.push(`${investigation.id}: unsupported question icon ${question.icon}`);
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
  if (location.coordinates === null) {
    if (location.coordinate_reference_url !== null || !location.coordinate_note.includes("No point plotted")) errors.push(`${location.id}: unpinned corridor needs a clear note and no coordinate reference`);
  } else if (!Array.isArray(location.coordinates) || location.coordinates.length !== 2 || !location.coordinates.every(Number.isFinite)) errors.push(`${location.id}: invalid coordinates`);
  else {
    const [lat, lng] = location.coordinates;
    if (lat < 37.85 || lat > 38.1 || lng < -121.45 || lng > -121.2) errors.push(`${location.id}: coordinates outside Stockton region`);
    if (location.coordinates.some((value) => String(value).split(".")[1]?.length > 3)) errors.push(`${location.id}: coordinates are too precise for public reference markers`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(location.evidence_date) || Number.isNaN(Date.parse(location.evidence_date))) errors.push(`${location.id}: invalid evidence date`);
  if (!["Occurred", "Reported occurrence", "Report published"].includes(location.date_label)) errors.push(`${location.id}: missing date meaning`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(location.source_reviewed_at ?? "") && location.source_reviewed_at !== null) errors.push(`${location.id}: invalid source review date`);
  if (!location.source_reviewed_at) errors.push(`${location.id}: missing source review date`);
  if (!location.verification_status?.trim() || !location.last_known_outcome?.trim()) errors.push(`${location.id}: missing verification or outcome`);
  if (!["historical_published_report", "recent_public_report", "official_animal_services_record", "crossover_firsthand"].includes(location.category)) errors.push(`${location.id}: invalid category`);
  if (location.category === "recent_public_report" && !location.source_reviewed_at) errors.push(`${location.id}: recent public report lacks review date`);
  if (!["reported", "exploratory"].includes(location.status)) errors.push(`${location.id}: invalid status`);
  if (!["Published local report", "County report", "Public PawBoost report", "Official Animal Services record", "Crossover firsthand observation"].includes(location.evidence_type)) errors.push(`${location.id}: invalid evidence type`);
  try { if (new URL(location.source_url).protocol !== "https:") throw new Error(); } catch { errors.push(`${location.id}: invalid source URL`); }
  if (location.coordinate_reference_url !== null) try { if (new URL(location.coordinate_reference_url).protocol !== "https:") throw new Error(); } catch { errors.push(`${location.id}: invalid coordinate reference URL`); }
  if (location.evidence_record_id && recordById.get(location.evidence_record_id)?.source?.url !== location.source_url) errors.push(`${location.id}: evidence record URL mismatch`);
  if (location.field_report_id && recordById.get(location.field_report_id)?.record_type !== "field_report") errors.push(`${location.id}: field report reference does not resolve`);
}

for (const field of ["last_sources_checked", "last_map_updated", "next_scheduled_review"]) {
  if (maintenance[field] !== null && (!/^\d{4}-\d{2}-\d{2}$/.test(maintenance[field] ?? "") || Number.isNaN(Date.parse(maintenance[field])))) errors.push(`Map maintenance: invalid ${field}`);
}
if (!maintenance.review_policy?.trim()) errors.push("Map maintenance: missing review policy");
if (maintenance.last_sources_checked && locations.some((location) => location.source_reviewed_at && location.source_reviewed_at > maintenance.last_sources_checked)) errors.push("Map maintenance: source check predates a map record review");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${investigationData.active_investigations.length} active investigation, ${investigationData.established_findings.length} finding, ${locations.length} locations, and their references.`);
}
