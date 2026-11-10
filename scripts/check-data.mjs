import { existsSync, readFileSync } from "node:fs";
import { resolve, sep } from "node:path";
import { validateRecord } from "./schema-validator.mjs";

const read = (name) => JSON.parse(readFileSync(`src/data/${name}.json`, "utf8"));
const datasets = [
  ["crossover", "identity"], ["people", "person"], ["principles", "principle"], ["methods", "method"],
  ["gaps", "gap"],
  ["tasks", "task"], ["activities", "activity"], ["evidence", "evidence"],
  ["findings", "finding"], ["organizations", "organization"],
  ["locations", "location"], ["measurements", "measurement"],
  ["claims", "claim"],
  ["improvements", "initiative"],
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
  for (const field of ["preferred_image", "preferred_logo", "homeImage"]) {
    const asset = item[field];
    if (asset === undefined) continue;
    if (typeof asset !== "string" || !asset.trim()) { errors.push(`${file}:${item.id} ${field} must be a nonempty path or URL`); continue; }
    if (asset.startsWith("/")) {
      const local = resolve(publicRoot, `.${asset}`);
      if (!local.startsWith(`${publicRoot}${sep}`) || !existsSync(local)) errors.push(`${file}:${item.id} ${field} does not resolve to a public asset: ${asset}`);
    } else if (!asset.startsWith("https://")) errors.push(`${file}:${item.id} ${field} must be a public path or HTTPS URL`);
  }
  if (file === "gaps" && Object.hasOwn(item, "artwork")) errors.push(`gap:${item.id} still uses legacy artwork instead of preferred_image`);
  if (file === "gaps" && Object.hasOwn(item, "status")) errors.push(`gap:${item.id} still uses unsupported legacy status`);
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
for (const file of ["tasks", "activities", "evidence", "findings", "locations", "measurements"]) {
  checkRefs(records.get(file), "gaps", "gap_ids", file);
  for (const item of records.get(file) ?? []) if (Object.hasOwn(item, "investigation_id")) errors.push(`${file}:${item.id} retains investigation_id`);
}
const taskOrders = new Map();
for (const task of records.get("tasks") ?? []) {
  if (!Number.isSafeInteger(task.order_by_id) || task.order_by_id < 1) errors.push(`task:${task.id} order_by_id must be a positive integer`);
  const key = String(task.order_by_id);
  if (taskOrders.has(key)) errors.push(`task:${task.id} order_by_id duplicates task:${taskOrders.get(key)}`);
  taskOrders.set(key, task.id);
}
for (const prop of ["organization_ids", "location_ids", "map_reference_location_ids", "basis_record_ids", "activity_record_ids"]) {
  const target = { organization_ids: "organizations", location_ids: "locations", map_reference_location_ids: "locations", basis_record_ids: "records", activity_record_ids: "activities" }[prop];
  checkRefs(records.get("tasks"), target, prop, "task");
}
const currentGaps = records.get("gaps") ?? [];
if (currentGaps.length < 1 || currentGaps.filter((gap) => gap.default).length !== 1) errors.push("gaps: expected exactly one default gap");
if (new Set(currentGaps.map((gap) => gap.slug)).size !== currentGaps.length) errors.push("gaps: duplicate slug");
for (const prop of ["supporting_record_ids", "contradicting_record_ids"]) checkRefs(records.get("findings"), "records", prop, "finding");
checkRefs(records.get("findings"), "tasks", "related_task_ids", "finding");
checkRefs(records.get("claims"), "records", "sourceRecordIds", "claim");
checkRefs(records.get("claims"), "gaps", "gap_id", "claim");
checkRefs(records.get("claims"), "measurements", "measurementId", "claim");
checkRefs(records.get("measurements"), "records", "source_record_id", "measurement");
checkRefs(records.get("locations"), "records", "evidence_record_id", "location");
checkRefs(records.get("locations"), "records", "evidence_record_ids", "location");
checkRefs(records.get("locations"), "locations", "parent_location_id", "location");
checkRefs(records.get("locations"), "locations", "canonical_location_id", "location");
checkRefs(records.get("locations"), "tasks", "related_task_ids", "location");
checkRefs(records.get("locations"), "organizations", "organization_ids", "location");
checkRefs(records.get("organizations"), "locations", "map_location_id", "organization");
checkRefs(records.get("records"), "locations", "location_ids", "evidence");
for (const location of records.get("locations") ?? []) {
  if (location.facility_map_embed_url != null) {
    let valid = false;
    try {
      const url = new URL(location.facility_map_embed_url);
      valid = url.protocol === "https:" && ["google.com", "www.google.com"].includes(url.hostname)
        && /^\/maps\/d\/(?:u\/\d+\/)?embed$/.test(url.pathname) && Boolean(url.searchParams.get("mid"));
    } catch { /* Invalid URL. */ }
    if (!valid) errors.push(`location:${location.id} facility_map_embed_url must be a Google My Maps embed URL with a map ID`);
  }
  if (location.parent_location_id === location.id || location.canonical_location_id === location.id)
    errors.push(`location:${location.id} cannot refer to itself`);
  const seen = new Set([location.id]);
  let ancestor = location;
  while (ancestor.parent_location_id) {
    ancestor = (records.get("locations") ?? []).find((item) => item.id === ancestor.parent_location_id);
    if (!ancestor) break;
    if (seen.has(ancestor.id)) { errors.push(`location:${location.id} parent cycle`); break; }
    seen.add(ancestor.id);
  }
  if (location.map_reference?.verified && !location.map_reference.source_url?.startsWith("https://"))
    errors.push(`location:${location.id} verified map reference requires an HTTPS source URL`);
}
checkRefs(records.get("records"), "gaps", "gap_ids", "evidence");
checkRefs(records.get("records"), "organizations", "organization_ids", "evidence");
for (const file of ["improvements"]) {
  checkRefs(records.get(file), "gaps", "gap_ids", file);
  checkRefs(records.get(file), "organizations", "organization_ids", file);
  for (const item of records.get(file) ?? []) if (item.construction_contract_amount_usd != null &&
    (!(item.construction_contract_amount_usd > 0) || !item.funding_source_urls?.some(url => /^https:\/\//.test(url))))
    errors.push(`${file}:${item.id} construction contract amount requires a positive value and HTTPS funding source`);
}
const currentNeedIds = new Set((records.get("gaps") ?? []).filter((gap) => gap.active).map((gap) => gap.id));
for (const file of ["evidence"]) {
  for (const item of records.get(file) ?? []) {
    if (!item.gap_ids?.some((id) => currentNeedIds.has(id)))
      errors.push(`${file}:${item.id} has no current need`);
  }
}
checkRefs(records.get("improvements"), "records", "evidence_record_ids", "initiative");
for (const item of records.get("records") ?? []) {
  if (item.organization_interaction && (item.record_type !== "activity" || item.trust !== "crossover_source"
    || item.source?.type !== "firsthand_account" || !item.occurred_at || !item.organization_ids?.length))
    errors.push(`evidence:${item.id} organization_interaction requires a completed firsthand Crossover activity linked to an organization`);
  if (item.record_type === "activity" && item.occurred_at && item.evidence_status?.startsWith("planned")) errors.push(`evidence:${item.id} planned status conflicts with occurred_at`);
  if (item.source?.url && !/^https?:\/\//.test(item.source.url)) errors.push(`evidence:${item.id} invalid source URL`);
  if (item.public_update === true) {
    if (item.record_type !== "activity" || !item.occurred_at) errors.push(`evidence:${item.id} public update needs a completed activity`);
    if (item.visibility !== "public") errors.push(`evidence:${item.id} public update needs explicit public visibility`);
    const activeNeedIds = new Set((records.get("gaps") ?? []).filter((gap) => gap.active).map((gap) => gap.id));
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
