import { readFileSync } from "node:fs";

const data = (name) => JSON.parse(readFileSync(new URL(`../src/data/${name}.json`, import.meta.url), "utf8"));
const projects = data("projects");
const ids = (items) => new Set(items.map((item) => item.id));
const gapIds = ids(data("needs").records);
const orgIds = ids(data("organizations"));
const recordIds = ids([...data("evidence"), ...data("activities")]);
const projectIds = ids(projects);
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
  for (const field of ["headline", "how_it_helps", "not_yet_verified"]) {
    if (typeof project.capacity_summary?.[field] !== "string" || !project.capacity_summary[field].trim()) errors.push(`${project.id}: missing capacity summary ${field}`);
  }
  references(project.id, project.gap_ids, gapIds, "gap");
  references(project.id, project.organization_ids, orgIds, "organization");
  references(project.id, project.evidence_record_ids, recordIds, "record");
  references(project.id, project.expected_capacity_or_benefit?.evidence_record_ids, recordIds, "benefit record");
  references(project.id, project.actual_additional_capacity?.evidence_record_ids, recordIds, "actual-capacity record");
  for (const milestone of project.milestones) references(project.id, milestone.evidence_record_ids, recordIds, "milestone record");
  if (project.procedure_tracking?.completed != null && project.procedure_tracking.completed < 0) errors.push(`${project.id}: negative completed procedures`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${projects.length} projects and their references.`);
}
