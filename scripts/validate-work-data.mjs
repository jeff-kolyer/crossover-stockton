import { readFile } from "node:fs/promises";

const read = async name => {
  const data = JSON.parse(await readFile(new URL(`../src/data/${name}.json`, import.meta.url), "utf8"));
  return Array.isArray(data) ? data : data.records;
};
const names = ["gaps", "tasks", "findings", "activities", "evidence", "locations", "organizations", "improvements", "measurements"];
const data = Object.fromEntries(await Promise.all(names.map(async name => [name, await read(name)])));
const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };
const by = Object.fromEntries(names.map(name => [name, new Map(data[name].map(item => [item.id, item]))]));
by.records = new Map([...data.evidence, ...data.activities].map(item => [item.id, item]));
const validDate = value => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T12:00:00Z`));
const refs = (item, field, map) => {
  check(Array.isArray(item[field]), `${item.id}: ${field} must be an array`);
  for (const id of item[field] ?? []) check(map.has(id), `${item.id}: unknown ${field} id ${id}`);
};
for (const name of ["tasks", "findings", "activities", "evidence", "locations"]) for (const item of data[name]) {
  check(!Object.hasOwn(item, "investigation_id"), `${name}:${item.id} still has investigation_id`);
  for (const id of item.gap_ids ?? []) check(by.gaps.has(id), `${name}:${item.id} links missing gap ${id}`);
}
const actual = new Map(data.activities.filter(item => item.record_type === "activity" && item.occurred_at && !item.evidence_status?.startsWith("planned") && item.source.publisher?.startsWith("Crossover Stockton")).map(item => [item.id, item]));
for (const activity of actual.values()) {
  check(validDate(activity.occurred_at), `${activity.id}: invalid occurrence date`);
  check(activity.gap_ids?.length > 0, `${activity.id}: Activity needs a direct project link`);
}
for (const location of data.locations) {
  check(["dog_sighting", "human_services", "animal_care"].includes(location.marker_type) || (location.location_type === "general_area" && location.marker_type == null), `${location.id}: invalid marker_type`);
  if (location.evidence_record_id) check(by.records.has(location.evidence_record_id), `${location.id}: unknown evidence record`);
  for (const id of location.evidence_record_ids ?? []) check(by.records.has(id), `${location.id}: unknown evidence record ${id}`);
}
for (const task of data.tasks) {
  check(task.gap_ids?.length > 0, `${task.id}: Task needs a direct project link`);
  check(["open", "in_progress", "waiting", "done", "cancelled"].includes(task.status), `${task.id}: invalid workflow state`);
  check(Boolean(task.title && task.instructions), `${task.id}: title and instructions required`);
  for (const [field, map] of [["location_ids", by.locations], ["organization_ids", by.organizations], ["basis_record_ids", by.records], ["activity_record_ids", actual]]) refs(task, field, map);
  if (task.map_reference_location_ids) refs(task, "map_reference_location_ids", by.locations);
  if (task.status === "done") {
    check(validDate(task.completed_at), `${task.id}: completed task needs a date`);
    check(task.activity_record_ids.length > 0, `${task.id}: completed task needs Activity`);
    for (const id of task.activity_record_ids) check(actual.get(id)?.occurred_at === task.completed_at, `${task.id}: completion date differs from Activity ${id}`);
  } else check(!task.completed_at, `${task.id}: incomplete task has completed_at`);
}
for (const finding of data.findings) {
  check(finding.gap_ids?.length > 0, `${finding.id}: finding needs a direct project link`);
  check(validDate(finding.last_reviewed_at), `${finding.id}: invalid review date`);
  check(Boolean(finding.title && finding.statement && finding.limitations), `${finding.id}: title, statement and limitations required`);
  for (const [field, map] of [["supporting_record_ids", by.records], ["contradicting_record_ids", by.records], ["related_task_ids", by.tasks], ["related_initiative_ids", by.improvements], ["location_ids", by.locations]]) refs(finding, field, map);
  check(finding.supporting_record_ids.length + finding.contradicting_record_ids.length > 0, `${finding.id}: finding needs evidence`);
}
if (errors.length) { console.error(errors.join("\n")); process.exitCode = 1; }
else console.log(`Validated ${data.gaps.length} gap, ${data.tasks.length} tasks, ${actual.size} canonical activities, and ${data.findings.length} findings.`);
