import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { validateRecord } from "./schema-validator.mjs";

const read = (name) => JSON.parse(readFileSync(`src/data/${name}.json`, "utf8"));
const datasets = [
  ["crossover", "identity"], ["people", "person"], ["principles", "principle"], ["methods", "method"],
  ["gaps", "need"], ["dogs-investigations", "investigation", "active_investigations"],
  ["investigation-questions", "question"], ["tasks", "action"], ["records", "evidence"],
  ["findings", "finding"], ["orgs", "organization"], ["stories", "story"],
  ["investigation-locations", "location"], ["dogs-research", "measurement", "measurements"],
  ["claims", "claim"],
  ["workstreams", "workstream"],
  ["work", "legacy-work"], ["projects", "project"], ["articles", "article"],
  ["activity-question-groups", "question-group"],
];
const errors = [];
const records = new Map();
for (const [file, schema, key] of datasets) {
  const data = read(file);
  const items = key ? data[key] : Array.isArray(data) ? data : [data];
  if (!Array.isArray(items)) { errors.push(`${file}: expected an array at ${key}`); continue; }
  const ids = new Set();
  for (const item of items) {
    if (ids.has(item.id)) errors.push(`${file}: duplicate ID ${item.id}`);
    ids.add(item.id);
    errors.push(...validateRecord(item, schema, `${file}:${item.id ?? "?"}`));
  }
  records.set(file, items);
}
const ids = (file) => new Set((records.get(file) ?? []).map(({ id }) => id));
const checkRefs = (items, target, prop, source) => {
  const valid = ids(target);
  for (const item of items) for (const id of Array.isArray(item[prop]) ? item[prop] : item[prop] ? [item[prop]] : []) {
    if (!valid.has(id)) errors.push(`${source}:${item.id} ${prop} → missing ${target}:${id}`);
  }
};
checkRefs(records.get("crossover"), "people", "founderPersonId", "crossover");
checkRefs(records.get("crossover"), "principles", "principleIds", "crossover");
checkRefs(records.get("crossover"), "methods", "methodIds", "crossover");
checkRefs(records.get("dogs-investigations"), "gaps", "gap_id", "investigation");
checkRefs(records.get("investigation-questions"), "dogs-investigations", "investigation_id", "question");
checkRefs(records.get("tasks"), "dogs-investigations", "investigation_id", "task");
const taskOrders = new Map();
for (const task of records.get("tasks") ?? []) {
  if (!Number.isSafeInteger(task.order_by_id) || task.order_by_id < 1) errors.push(`task:${task.id} order_by_id must be a positive integer`);
  const key = String(task.order_by_id);
  if (taskOrders.has(key)) errors.push(`task:${task.id} order_by_id duplicates task:${taskOrders.get(key)}`);
  taskOrders.set(key, task.id);
}
for (const prop of ["question_ids", "organization_ids", "location_ids", "basis_record_ids", "activity_record_ids"]) {
  const target = { question_ids: "investigation-questions", organization_ids: "orgs", location_ids: "investigation-locations", basis_record_ids: "records", activity_record_ids: "records" }[prop];
  checkRefs(records.get("tasks"), target, prop, "task");
}
for (const prop of ["activity_record_ids", "evidence_record_ids", "finding_ids", "task_ids"]) {
  const target = { activity_record_ids: "records", evidence_record_ids: "records", finding_ids: "findings", task_ids: "tasks" }[prop];
  checkRefs(records.get("investigation-questions"), target, prop, "question");
}
checkRefs(records.get("findings"), "dogs-investigations", "investigation_id", "finding");
for (const prop of ["supporting_record_ids", "contradicting_record_ids"]) checkRefs(records.get("findings"), "records", prop, "finding");
checkRefs(records.get("claims"), "records", "sourceRecordIds", "claim");
checkRefs(records.get("claims"), "gaps", "needId", "claim");
checkRefs(records.get("claims"), "dogs-research", "measurementId", "claim");
checkRefs(records.get("dogs-research"), "records", "source_record_id", "measurement");
checkRefs(records.get("investigation-locations"), "dogs-investigations", "investigation_id", "location");
checkRefs(records.get("investigation-locations"), "records", "evidence_record_ids", "location");
checkRefs(records.get("records"), "gaps", "gap_ids", "evidence");
checkRefs(records.get("records"), "orgs", "organization_ids", "evidence");
for (const file of ["projects", "stories"]) {
  checkRefs(records.get(file), "gaps", "gap_ids", file);
  checkRefs(records.get(file), "orgs", "organization_ids", file);
}
checkRefs(records.get("projects"), "records", "evidence_record_ids", "project");
checkRefs(records.get("work"), "gaps", "gap_id", "work");
for (const prop of ["record_ids", "activity_record_ids"]) checkRefs(records.get("work"), "records", prop, "work");
checkRefs(records.get("work"), "projects", "project_ids", "work");
checkRefs(records.get("work"), "orgs", "organization_ids", "work");
checkRefs(records.get("articles"), "gaps", "related_gap_ids", "article");
checkRefs(records.get("articles"), "investigation-locations", "related_location_ids", "article");
for (const prop of ["activityIds", "reportIds", "relatedActivityIds", "relatedReportIds"]) checkRefs(records.get("activity-question-groups"), "records", prop, "activity question group");
for (const item of records.get("records") ?? []) {
  if (item.record_type === "activity" && item.occurred_at && item.evidence_status?.startsWith("planned")) errors.push(`evidence:${item.id} planned status conflicts with occurred_at`);
  if (item.source?.url && !/^https?:\/\//.test(item.source.url)) errors.push(`evidence:${item.id} invalid source URL`);
  if (item.public_update === true) {
    if (item.record_type !== "activity" || !item.occurred_at) errors.push(`evidence:${item.id} public update needs a completed activity`);
    if (item.visibility !== "public") errors.push(`evidence:${item.id} public update needs explicit public visibility`);
    const activeNeedIds = new Set((records.get("gaps") ?? []).filter((need) => need.active).map((need) => need.id));
    if (!item.gap_ids?.some((id) => activeNeedIds.has(id))) errors.push(`evidence:${item.id} public update needs an active related need`);
  }
}
for (const item of records.get("claims") ?? []) {
  if (item.verificationStatus === "not_established" && item.sourceRecordIds.length) errors.push(`claim:${item.id} unknown quantity has source records`);
  if (item.kind === "administrative_count" && !item.measurementId) errors.push(`claim:${item.id} administrative count needs measurement`);
}
const compositions = read("pages/compositions");
const actionConfiguration = read("pages/action").actions;
for (const item of actionConfiguration) {
  if (!ids("workstreams").has(item.id)) errors.push(`action page → missing workstream:${item.id}`);
  if (!item.href?.startsWith("/") || !item.buttonLabel) errors.push(`action page:${item.id} missing link configuration`);
}
const compositionIds = new Set();
const sourceCollections = { identity: "crossover", people: "people", principles: "principles", methods: "methods", needs: "gaps", investigations: "dogs-investigations", questions: "investigation-questions", "question-groups": "activity-question-groups", tasks: "tasks", activities: "records", evidence: "records", findings: "findings", claims: "claims", organizations: "orgs", stories: "stories", locations: "investigation-locations", workstreams: "workstreams", "legacy-work": "work", projects: "projects", articles: "articles", measurements: "dogs-research", developments: "records" };
for (const page of compositions) {
  errors.push(...validateRecord(page, "page", `page:${page.id}`));
  if (compositionIds.has(page.id)) errors.push(`duplicate page composition: ${page.id}`);
  compositionIds.add(page.id);
  const sectionIds = new Set();
  for (const section of page.sections) {
    if (sectionIds.has(section.id)) errors.push(`duplicate section: ${page.id}/${section.id}`);
    sectionIds.add(section.id);
    const source = sourceCollections[section.source];
    if (!source) continue;
    const targetIds = ids(source);
    for (const id of section.recordIds ?? []) if (!targetIds.has(id)) errors.push(`page:${page.id}/${section.id} → missing ${source}:${id}`);
  }
}
for (const file of readdirSync("src/data/pages", { recursive: true })) {
  const full = join("src/data/pages", file);
  if (statSync(full).isFile() && full.endsWith(".json")) JSON.parse(readFileSync(full, "utf8"));
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else console.log(`Data check passed: ${datasets.length} semantic collections and ${compositions.length} page compositions; IDs, schemas, references, and provenance checked.`);
