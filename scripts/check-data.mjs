import { existsSync, readFileSync } from "node:fs";
import { resolve, sep } from "node:path";
import { validateRecord } from "./schema-validator.mjs";

const read = (name) => JSON.parse(readFileSync(`src/data/${name}.json`, "utf8"));
const datasets = [
  ["crossover", "identity"], ["people", "person"], ["principles", "principle"], ["methods", "method"],
  ["needs", "need"], ["investigations", "investigation"],
  ["objectives", "objective"], ["tasks", "action"], ["activities", "activity"], ["evidence", "evidence"],
  ["findings", "finding"], ["organizations", "organization"], ["stories", "story"],
  ["locations", "location"], ["measurements", "measurement"],
  ["claims", "claim"],
  ["projects", "project"], ["articles", "article"],
];
const errors = [];
const records = new Map();
for (const [file, schema, key] of datasets) {
  const data = file === "principles" || file === "methods" ? read("crossover")[file] : read(file);
  const items = key ? data[key] : Array.isArray(data) ? data : Array.isArray(data.records) ? data.records : [data.identity ?? data.record ?? data];
  if (!Array.isArray(items)) { errors.push(`${file}: expected an array at ${key}`); continue; }
  const ids = new Set();
  for (const item of items) {
    if (ids.has(item.id)) errors.push(`${file}: duplicate ID ${item.id}`);
    ids.add(item.id);
    errors.push(...validateRecord(item, schema, `${file}:${item.id ?? "?"}`));
  }
  records.set(file, items);
}
const allRecords = [...(records.get("evidence") ?? []), ...(records.get("activities") ?? [])];
if (new Set(allRecords.map(({ id }) => id)).size !== allRecords.length) errors.push("activities and evidence share a record ID");
records.set("records", allRecords);
const publicRoot = resolve("public");
for (const [file] of datasets) for (const item of records.get(file) ?? []) {
  for (const field of ["preferred_image", "preferred_logo"]) {
    const asset = item[field];
    if (asset === undefined) continue;
    if (typeof asset !== "string" || !asset.trim()) { errors.push(`${file}:${item.id} ${field} must be a nonempty path or URL`); continue; }
    if (asset.startsWith("/")) {
      const local = resolve(publicRoot, `.${asset}`);
      if (!local.startsWith(`${publicRoot}${sep}`) || !existsSync(local)) errors.push(`${file}:${item.id} ${field} does not resolve to a public asset: ${asset}`);
    } else if (!asset.startsWith("https://")) errors.push(`${file}:${item.id} ${field} must be a public path or HTTPS URL`);
  }
  if (file === "needs" && Object.hasOwn(item, "artwork")) errors.push(`need:${item.id} still uses legacy artwork instead of preferred_image`);
  if (file === "needs" && Object.hasOwn(item, "status")) errors.push(`need:${item.id} still uses unsupported legacy status`);
  if (file === "stories" && Object.hasOwn(item, "image")) errors.push(`story:${item.id} still uses legacy image instead of preferred_image`);
}
const ids = (file) => new Set((records.get(file) ?? []).map(({ id }) => id));
const checkRefs = (items, target, prop, source) => {
  const valid = ids(target);
  for (const item of items) for (const id of Array.isArray(item[prop]) ? item[prop] : item[prop] ? [item[prop]] : []) {
    if (!valid.has(id)) errors.push(`${source}:${item.id} ${prop} → missing ${target}:${id}`);
  }
};
checkRefs(records.get("crossover"), "people", "founderPersonId", "identity");
checkRefs(records.get("crossover"), "principles", "principleIds", "identity");
checkRefs(records.get("crossover"), "methods", "methodIds", "identity");
checkRefs(records.get("investigations"), "needs", "gap_id", "investigation");
for (const investigation of records.get("investigations") ?? []) {
  if (Object.hasOwn(investigation, "uncertainties")) errors.push(`investigation:${investigation.id} duplicates its investigation objectives in uncertainties`);
}
checkRefs(records.get("measurements"), "investigations", "investigation_id", "measurement");
checkRefs(records.get("objectives"), "investigations", "investigation_id", "objective");
checkRefs(records.get("tasks"), "investigations", "investigation_id", "task");
const taskOrders = new Map();
for (const task of records.get("tasks") ?? []) {
  if (!Number.isSafeInteger(task.order_by_id) || task.order_by_id < 1) errors.push(`task:${task.id} order_by_id must be a positive integer`);
  const key = String(task.order_by_id);
  if (taskOrders.has(key)) errors.push(`task:${task.id} order_by_id duplicates task:${taskOrders.get(key)}`);
  taskOrders.set(key, task.id);
}
for (const prop of ["objective_ids", "organization_ids", "location_ids", "map_reference_location_ids", "basis_record_ids", "activity_record_ids"]) {
  const target = { objective_ids: "objectives", organization_ids: "organizations", location_ids: "locations", map_reference_location_ids: "locations", basis_record_ids: "records", activity_record_ids: "activities" }[prop];
  checkRefs(records.get("tasks"), target, prop, "task");
}
for (const prop of ["activity_record_ids", "evidence_record_ids", "finding_ids", "task_ids"]) {
  const target = { activity_record_ids: "activities", evidence_record_ids: "records", finding_ids: "findings", task_ids: "tasks" }[prop];
  checkRefs(records.get("objectives"), target, prop, "objective");
}
checkRefs(records.get("findings"), "investigations", "investigation_id", "finding");
for (const prop of ["supporting_record_ids", "contradicting_record_ids"]) checkRefs(records.get("findings"), "records", prop, "finding");
checkRefs(records.get("claims"), "records", "sourceRecordIds", "claim");
checkRefs(records.get("claims"), "needs", "needId", "claim");
checkRefs(records.get("claims"), "measurements", "measurementId", "claim");
checkRefs(records.get("measurements"), "records", "source_record_id", "measurement");
checkRefs(records.get("locations"), "investigations", "investigation_id", "location");
checkRefs(records.get("locations"), "records", "evidence_record_id", "location");
checkRefs(records.get("locations"), "records", "evidence_record_ids", "location");
for (const location of records.get("locations") ?? []) {
  if (location.map_reference?.verified && !location.map_reference.source_url?.startsWith("https://"))
    errors.push(`location:${location.id} verified map reference requires an HTTPS source URL`);
}
checkRefs(records.get("records"), "needs", "gap_ids", "evidence");
checkRefs(records.get("records"), "organizations", "organization_ids", "evidence");
for (const file of ["projects", "stories"]) {
  checkRefs(records.get(file), "needs", "gap_ids", file);
  checkRefs(records.get(file), "organizations", "organization_ids", file);
}
checkRefs(records.get("projects"), "records", "evidence_record_ids", "project");
checkRefs(records.get("articles"), "needs", "related_gap_ids", "article");
checkRefs(records.get("articles"), "locations", "related_location_ids", "article");
for (const item of records.get("records") ?? []) {
  if (item.organization_interaction && (item.record_type !== "activity" || item.trust !== "crossover_source"
    || item.source?.type !== "firsthand_account" || !item.occurred_at || !item.organization_ids?.length))
    errors.push(`evidence:${item.id} organization_interaction requires a completed firsthand Crossover activity linked to an organization`);
  if (item.record_type === "activity" && item.occurred_at && item.evidence_status?.startsWith("planned")) errors.push(`evidence:${item.id} planned status conflicts with occurred_at`);
  if (item.source?.url && !/^https?:\/\//.test(item.source.url)) errors.push(`evidence:${item.id} invalid source URL`);
  if (item.public_update === true) {
    if (item.record_type !== "activity" || !item.occurred_at) errors.push(`evidence:${item.id} public update needs a completed activity`);
    if (item.visibility !== "public") errors.push(`evidence:${item.id} public update needs explicit public visibility`);
    const activeNeedIds = new Set((records.get("needs") ?? []).filter((need) => need.active).map((need) => need.id));
    if (!item.gap_ids?.some((id) => activeNeedIds.has(id))) errors.push(`evidence:${item.id} public update needs an active related need`);
  }
}
for (const item of records.get("claims") ?? []) {
  if (item.verificationStatus === "not_established" && item.sourceRecordIds.length) errors.push(`claim:${item.id} unknown quantity has source records`);
  if (item.kind === "administrative_count" && !item.measurementId) errors.push(`claim:${item.id} administrative count needs measurement`);
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else console.log(`Data check passed: ${datasets.length} semantic collections; IDs, schemas, references, and provenance checked.`);
