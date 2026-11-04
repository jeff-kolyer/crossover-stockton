import { readFile } from "node:fs/promises";

const read = async (name) => JSON.parse(await readFile(new URL(`../src/data/${name}.json`, import.meta.url), "utf8"));
const [actions, objectives, findings, activities, evidence, locations, organizations, projects, investigations, articles] = await Promise.all([
  "actions", "objectives", "findings", "activities", "evidence", "locations", "organizations", "projects", "investigations", "articles",
].map(read));
const records = [...evidence, ...activities];
const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };
const indexed = (items, name) => {
  const ids = new Set();
  for (const item of items) {
    check(typeof item.id === "string" && item.id.length > 0, `${name}: missing id`);
    check(!ids.has(item.id), `${name}: duplicate id ${item.id}`);
    ids.add(item.id);
  }
  return new Map(items.map((item) => [item.id, item]));
};
const actionById = indexed(actions, "actions");
const objectiveById = indexed(objectives, "objectives");
const findingById = indexed(findings, "findings");
const recordById = indexed(records, "records");
const locationById = indexed(locations, "locations");
const organizationById = indexed(organizations, "organizations");
const projectById = indexed(projects, "projects");
const articleById = indexed(articles.records, "articles");
const investigationIds = new Set(investigations.records.map((item) => item.id));
const validDate = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T12:00:00Z`));
const refs = (owner, field, index) => {
  check(Array.isArray(owner[field]), `${owner.id}: ${field} must be an array`);
  for (const id of owner[field] ?? []) check(index.has(id), `${owner.id}: unknown ${field} id ${id}`);
};
const actualActivities = new Map(activities.filter((record) => record.record_type === "activity"
  && investigationIds.has(record.investigation_id)
  && record.occurred_at
  && !record.evidence_status?.startsWith("planned")
  && record.source.publisher?.startsWith("Crossover Stockton"))
  .map((record) => [record.id, record]));

for (const location of locations) {
  check(["dog_sighting", "human_services", "animal_care"].includes(location.marker_type), `${location.id}: invalid marker_type`);
  if (location.marker_kind === "organization") check(location.marker_type === "human_services", `${location.id}: organization marker must be human services`);
  if (location.marker_kind === "animal_shelter") check(location.marker_type === "animal_care", `${location.id}: shelter marker must be animal care`);
  if (location.evidence_record_id) check(recordById.has(location.evidence_record_id), `${location.id}: unknown evidence_record_id`);
  for (const id of location.evidence_record_ids ?? []) check(recordById.has(id), `${location.id}: unknown evidence_record_ids id ${id}`);
  if (location.field_report_id) check(recordById.get(location.field_report_id)?.record_type === "field_report", `${location.id}: field_report_id must reference a field report`);
}

for (const record of records) {
  if (record.record_type === "activity" && record.source.publisher?.startsWith("Crossover Stockton")) {
    check(investigationIds.has(record.investigation_id), `${record.id}: actual Activity needs an investigation_id`);
    check(validDate(record.occurred_at), `${record.id}: an actual Activity needs an occurrence date`);
    check(!record.evidence_status?.startsWith("planned"), `${record.id}: planned work must not be typed Activity`);
    check(Array.isArray(record.objective_ids) && record.objective_ids.length > 0, `${record.id}: actual Activity needs at least one objective`);
  }
  for (const id of record.objective_ids ?? []) {
    check(objectiveById.get(id)?.investigation_id === record.investigation_id, `${record.id}: objective ${id} belongs to another investigation or is missing`);
    if (record.record_type === "activity") check(objectiveById.get(id)?.activity_record_ids.includes(record.id), `${record.id}: objective ${id} does not link back to Activity`);
  }
  if (record.primary_objective_id) check(record.objective_ids?.includes(record.primary_objective_id), `${record.id}: primary objective must be one of its linked objectives`);
  if (record.investigation_id) check(investigationIds.has(record.investigation_id), `${record.id}: unknown investigation_id`);
  if (record.record_type === "field_report" && record.investigation_id) {
    check([...actualActivities.values()].some((activity) => activity.report_record_ids?.includes(record.id)), `${record.id}: field report needs a linked Activity`);
  }
  for (const reportId of record.report_record_ids ?? []) {
    const report = recordById.get(reportId);
    check(report?.record_type === "field_report", `${record.id}: ${reportId} must reference a field report`);
    if (record.occurred_at && report?.occurred_at) check(record.occurred_at === report.occurred_at, `${record.id}: report date differs from Activity`);
  }
}

for (const action of actions) {
  check(investigationIds.has(action.investigation_id), `${action.id}: unknown investigation`);
  check(["open", "waiting", "done", "cancelled"].includes(action.status), `${action.id}: invalid status`);
  check(Boolean(action.title && action.instructions), `${action.id}: title and instructions required`);
  refs(action, "location_ids", locationById);
  if (action.map_reference_location_ids) refs(action, "map_reference_location_ids", locationById);
  for (const id of action.location_ids) check(locationById.get(id)?.investigation_id === action.investigation_id, `${action.id}: location ${id} belongs to another investigation`);
  refs(action, "organization_ids", organizationById);
  refs(action, "objective_ids", objectiveById);
  check(action.objective_ids?.length > 0, `${action.id}: Action needs at least one objective`);
  for (const id of action.objective_ids ?? []) check(objectiveById.get(id)?.investigation_id === action.investigation_id, `${action.id}: objective ${id} belongs to another investigation`);
  refs(action, "basis_record_ids", recordById);
  refs(action, "activity_record_ids", actualActivities);
  for (const id of action.activity_record_ids) check(actualActivities.get(id)?.investigation_id === action.investigation_id, `${action.id}: Activity ${id} belongs to another investigation`);
  if (action.status === "done") {
    check(validDate(action.completed_at), `${action.id}: done Action needs completed_at`);
    check(action.activity_record_ids.length > 0, `${action.id}: done Action needs an actual Activity`);
    for (const id of action.activity_record_ids) check(actualActivities.get(id)?.occurred_at === action.completed_at, `${action.id}: completion date differs from Activity ${id}`);
  } else {
    check(!action.completed_at, `${action.id}: incomplete Action has completed_at`);
  }
}

for (const objective of objectives) {
  check(investigationIds.has(objective.investigation_id), `${objective.id}: unknown investigation`);
  check(Boolean(objective.title && objective.description), `${objective.id}: title and description required`);
  refs(objective, "action_ids", actionById);
  for (const id of objective.action_ids) check(actionById.get(id)?.investigation_id === objective.investigation_id, `${objective.id}: Action ${id} belongs to another investigation`);
  refs(objective, "activity_record_ids", actualActivities);
  for (const id of objective.activity_record_ids) check(actualActivities.get(id)?.investigation_id === objective.investigation_id, `${objective.id}: Activity ${id} belongs to another investigation`);
  for (const id of objective.activity_record_ids) check(actualActivities.get(id)?.objective_ids?.includes(objective.id), `${objective.id}: Activity ${id} does not link back`);
  refs(objective, "evidence_record_ids", recordById);
  refs(objective, "finding_ids", findingById);
  for (const id of objective.finding_ids) check(findingById.get(id)?.investigation_id === objective.investigation_id, `${objective.id}: Finding ${id} belongs to another investigation`);
  for (const id of objective.action_ids) check(actionById.get(id)?.objective_ids.includes(objective.id), `${objective.id}: Action ${id} does not link back`);
  for (const id of objective.finding_ids) check(findingById.get(id)?.related_objective_ids.includes(objective.id), `${objective.id}: Finding ${id} does not link back`);
}

for (const finding of findings) {
  check(investigationIds.has(finding.investigation_id), `${finding.id}: unknown investigation`);
  check(["established", "developing", "contradicted", "insufficient_evidence", "preliminary", "exploratory"].includes(finding.status), `${finding.id}: invalid status`);
  check(finding.current === undefined || typeof finding.current === "boolean", `${finding.id}: current must be boolean`);
  if (finding.current !== false) check(objectiveById.get(finding.primary_objective_id)?.investigation_id === finding.investigation_id, `${finding.id}: invalid primary objective`);
  if (finding.article_id) check(articleById.get(finding.article_id)?.published, `${finding.id}: article must exist and be published`);
  check(Boolean(finding.title && finding.statement && finding.limitations), `${finding.id}: title, statement, and limitations required`);
  check(validDate(finding.last_reviewed_at), `${finding.id}: invalid review date`);
  refs(finding, "supporting_record_ids", recordById);
  refs(finding, "contradicting_record_ids", recordById);
  refs(finding, "related_objective_ids", objectiveById);
  for (const id of finding.related_objective_ids) check(objectiveById.get(id)?.investigation_id === finding.investigation_id, `${finding.id}: Objective ${id} belongs to another investigation`);
  refs(finding, "related_action_ids", actionById);
  for (const id of finding.related_action_ids) check(actionById.get(id)?.investigation_id === finding.investigation_id, `${finding.id}: Action ${id} belongs to another investigation`);
  refs(finding, "related_project_ids", projectById);
  refs(finding, "location_ids", locationById);
  for (const id of finding.location_ids) check(locationById.get(id)?.investigation_id === finding.investigation_id, `${finding.id}: location ${id} belongs to another investigation`);
  check(finding.supporting_record_ids.length + finding.contradicting_record_ids.length > 0, `${finding.id}: Finding needs evidence`);
  for (const id of finding.supporting_record_ids) check(!finding.contradicting_record_ids.includes(id), `${finding.id}: record ${id} both supports and contradicts`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${actions.length} Actions, ${actualActivities.size} canonical Activities, ${objectives.length} Objectives, and ${findings.length} Findings.`);
}
