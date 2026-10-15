import { readFileSync } from "node:fs";

const data = (name) => JSON.parse(readFileSync(new URL(`../src/data/${name}.json`, import.meta.url), "utf8"));
const projects = data("projects");
const work = data("work");
const ids = (items) => new Set(items.map((item) => item.id));
const gapIds = ids(data("gaps"));
const orgIds = ids(data("orgs"));
const recordIds = ids(data("records"));
const projectIds = ids(projects);
const investigation = work.find((item) => item.id === "dogs-map-placement-barriers");
const threadIds = ids(investigation.threads);
const errors = [];
const stages = new Set(["proposed", "funded", "under_development", "operational", "completed", "unknown"]);
const operationalStatuses = new Set(["operational", "partially_operational", "not_operational", "unknown"]);
const fundingStatuses = new Set(["unknown", "authorized", "contract_awarded", "operating_funds_allocated"]);

function references(owner, values, known, label) {
  for (const id of values ?? []) if (!known.has(id)) errors.push(`${owner}: unknown ${label} ${id}`);
}

if (projectIds.size !== projects.length) errors.push("Duplicate project ID");
for (const project of projects) {
  if (!stages.has(project.development_stage)) errors.push(`${project.id}: invalid development stage`);
  if (!operationalStatuses.has(project.operational_status)) errors.push(`${project.id}: invalid operational status`);
  if (!fundingStatuses.has(project.funding_status)) errors.push(`${project.id}: invalid funding status`);
  if (!project.last_verified_at) errors.push(`${project.id}: missing verification date`);
  references(project.id, project.gap_ids, gapIds, "gap");
  references(project.id, project.organization_ids, orgIds, "organization");
  references(project.id, project.evidence_record_ids, recordIds, "record");
  references(project.id, project.barrier_thread_ids, threadIds, "thread");
  references(project.id, project.expected_capacity_or_benefit?.evidence_record_ids, recordIds, "benefit record");
  references(project.id, project.actual_additional_capacity?.evidence_record_ids, recordIds, "actual-capacity record");
  for (const milestone of project.milestones) references(project.id, milestone.evidence_record_ids, recordIds, "milestone record");
  if (project.procedure_tracking?.completed != null && project.procedure_tracking.completed < 0) errors.push(`${project.id}: negative completed procedures`);
}
for (const item of work) {
  references(item.id, item.project_ids, projectIds, "project");
  for (const thread of item.threads ?? []) references(thread.id, thread.project_ids, projectIds, "project");
  for (const contact of item.contact_questions ?? []) {
    references(item.id, [contact.organization_id], orgIds, "contact organization");
    if (contact.status !== "to_ask") errors.push(`${item.id}: contact questions must be marked to_ask`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${projects.length} projects and their references.`);
}
