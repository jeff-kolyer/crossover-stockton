import { readFile } from "node:fs/promises";

const read = async (name) => JSON.parse(await readFile(new URL(`../src/data/${name}.json`, import.meta.url), "utf8"));
const [tasks, questions, findings, records, locations, organizations, projects, investigations, articles] = await Promise.all([
  "tasks", "investigation-questions", "findings", "records", "investigation-locations", "orgs", "projects", "dogs-investigations", "articles",
].map(read));
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
const taskById = indexed(tasks, "tasks");
const questionById = indexed(questions, "questions");
const findingById = indexed(findings, "findings");
const recordById = indexed(records, "records");
const locationById = indexed(locations, "locations");
const organizationById = indexed(organizations, "organizations");
const projectById = indexed(projects, "projects");
const articleById = indexed(articles, "articles");
const investigationIds = new Set(investigations.active_investigations.map((item) => item.id));
const validDate = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T12:00:00Z`));
const refs = (owner, field, index) => {
  check(Array.isArray(owner[field]), `${owner.id}: ${field} must be an array`);
  for (const id of owner[field] ?? []) check(index.has(id), `${owner.id}: unknown ${field} id ${id}`);
};
const actualActivities = new Map(records.filter((record) => record.record_type === "activity"
  && investigationIds.has(record.investigation_id)
  && record.occurred_at
  && !record.evidence_status?.startsWith("planned")
  && record.source.publisher?.startsWith("Crossover Stockton"))
  .map((record) => [record.id, record]));

for (const record of records) {
  if (record.record_type === "activity" && record.source.publisher?.startsWith("Crossover Stockton")) {
    check(investigationIds.has(record.investigation_id), `${record.id}: actual Activity needs an investigation_id`);
    check(validDate(record.occurred_at), `${record.id}: an actual Activity needs an occurrence date`);
    check(!record.evidence_status?.startsWith("planned"), `${record.id}: planned work must not be typed Activity`);
  }
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

for (const task of tasks) {
  check(investigationIds.has(task.investigation_id), `${task.id}: unknown investigation`);
  check(["open", "waiting", "done", "cancelled"].includes(task.status), `${task.id}: invalid status`);
  check(Boolean(task.title && task.instructions), `${task.id}: title and instructions required`);
  refs(task, "location_ids", locationById);
  for (const id of task.location_ids) check(locationById.get(id)?.investigation_id === task.investigation_id, `${task.id}: location ${id} belongs to another investigation`);
  refs(task, "organization_ids", organizationById);
  refs(task, "question_ids", questionById);
  refs(task, "basis_record_ids", recordById);
  refs(task, "activity_record_ids", actualActivities);
  for (const id of task.activity_record_ids) check(actualActivities.get(id)?.investigation_id === task.investigation_id, `${task.id}: Activity ${id} belongs to another investigation`);
  if (task.status === "done") {
    check(validDate(task.completed_at), `${task.id}: done Task needs completed_at`);
    check(task.activity_record_ids.length > 0, `${task.id}: done Task needs an actual Activity`);
    for (const id of task.activity_record_ids) check(actualActivities.get(id)?.occurred_at === task.completed_at, `${task.id}: completion date differs from Activity ${id}`);
  } else {
    check(!task.completed_at, `${task.id}: incomplete Task has completed_at`);
  }
}

for (const question of questions) {
  check(investigationIds.has(question.investigation_id), `${question.id}: unknown investigation`);
  check(Boolean(question.title && question.description), `${question.id}: title and description required`);
  refs(question, "task_ids", taskById);
  for (const id of question.task_ids) check(taskById.get(id)?.investigation_id === question.investigation_id, `${question.id}: Task ${id} belongs to another investigation`);
  refs(question, "activity_record_ids", actualActivities);
  for (const id of question.activity_record_ids) check(actualActivities.get(id)?.investigation_id === question.investigation_id, `${question.id}: Activity ${id} belongs to another investigation`);
  refs(question, "evidence_record_ids", recordById);
  refs(question, "finding_ids", findingById);
  for (const id of question.finding_ids) check(findingById.get(id)?.investigation_id === question.investigation_id, `${question.id}: Finding ${id} belongs to another investigation`);
  for (const id of question.task_ids) check(taskById.get(id)?.question_ids.includes(question.id), `${question.id}: Task ${id} does not link back`);
  for (const id of question.finding_ids) check(findingById.get(id)?.related_question_ids.includes(question.id), `${question.id}: Finding ${id} does not link back`);
}

for (const finding of findings) {
  check(investigationIds.has(finding.investigation_id), `${finding.id}: unknown investigation`);
  check(["established", "developing", "contradicted", "insufficient_evidence", "preliminary", "exploratory"].includes(finding.status), `${finding.id}: invalid status`);
  check(finding.current === undefined || typeof finding.current === "boolean", `${finding.id}: current must be boolean`);
  if (finding.article_id) check(articleById.get(finding.article_id)?.published, `${finding.id}: article must exist and be published`);
  check(Boolean(finding.title && finding.statement && finding.limitations), `${finding.id}: title, statement, and limitations required`);
  check(validDate(finding.last_reviewed_at), `${finding.id}: invalid review date`);
  refs(finding, "supporting_record_ids", recordById);
  refs(finding, "contradicting_record_ids", recordById);
  refs(finding, "related_question_ids", questionById);
  for (const id of finding.related_question_ids) check(questionById.get(id)?.investigation_id === finding.investigation_id, `${finding.id}: Question ${id} belongs to another investigation`);
  refs(finding, "related_task_ids", taskById);
  for (const id of finding.related_task_ids) check(taskById.get(id)?.investigation_id === finding.investigation_id, `${finding.id}: Task ${id} belongs to another investigation`);
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
  console.log(`Validated ${tasks.length} Tasks, ${actualActivities.size} canonical Activities, ${questions.length} Questions, and ${findings.length} Findings.`);
}
