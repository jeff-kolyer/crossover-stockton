import { mkdirSync, writeFileSync } from "node:fs";

const base = "src/schemas";
mkdirSync(base, { recursive: true });
const ref = (name) => ({ $ref: `./common.schema.json#/$defs/${name}` });
const string = { type: "string", minLength: 1 };
const optionalDate = { anyOf: [ref("date"), { type: "null" }] };
const strings = { type: "array", items: string };
const refs = { type: "array", items: ref("id"), uniqueItems: true };
const obj = (properties, required = ["id"], extra = {}) => ({ type: "object", properties, required, additionalProperties: true, ...extra });
const id = ref("id");
const date = ref("date");
const dateOrTime = { anyOf: [date, ref("dateTime")] };
const source = ref("source");
const status = (values) => ({ type: "string", enum: values });
const recordTypes = ["current_service", "update", "planning_update", "activity", "field_report", "capacity_intervention", "outcome", "condition", "operational_change", "response", "current_ask", "capacity_constraint", "current_need", "organization_update", "finding", "operational_condition", "reported_context", "reported_service"];
const evidenceProps = { id, title: string, summary: string, record_type: status(recordTypes), public_update: { type: "boolean", description: "Marks an activity as a meaningful public development; visibility must also authorize publication." }, visibility: status(["public", "internal"]), trust: status(["source_supported", "crossover_source", "government", "organization_source"]), source, investigation_id: id, objective_ids: refs, primary_objective_id: id, gap_ids: refs, organization_ids: refs, location_ids: refs, coverage_id: id, coverage_note: string, observed_dog_count: { type: "number" }, occurred_at: dateOrTime, published_at: optionalDate, checked_at: dateOrTime, recorded_at: dateOrTime, evidence_status: string, basis_record_ids: refs, report_record_ids: refs, outcome: obj({ status: string, summary: string, as_of: dateOrTime }, ["status", "summary", "as_of"]) };
const schemas = {
  "common": { $defs: {
    id: { type: "string", minLength: 1, pattern: "^[A-Za-z0-9][A-Za-z0-9._:-]*$" },
    date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$", description: "Calendar date; meaning comes from the property name (occurred, published, reviewed, requested, or period boundary)." },
    dateTime: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:Z|[+-]\\d{2}:\\d{2})$" },
    source: obj({ id, title: string, publisher: string, url: { type: "string" }, type: string, published_at: optionalDate, retrieved_at: date }, [], { description: "Provenance. Existing sources often have no stable ID or URL; do not fabricate either." }),
    geographicScope: obj({ id, name: string, locality: string, region: string, country: string }, ["id", "name"]),
    relationshipIds: refs,
  } },
  "organization": obj({ id, slug: id, name: string, summary: string, website: { type: "string" }, source_url: { type: "string" }, map_location_id: id, active: { type: "boolean" } }, ["id", "name", "summary"]),
  "principle": obj({ id, title: string, statement: string }, ["id", "title", "statement"]),
  "method": obj({ id, title: string, statement: string }, ["id", "title", "statement"]),
  "identity": obj({ id, name: string, slogan: string, purpose: string, geographicScope: ref("geographicScope"), founderPersonId: id, principleIds: refs, methodIds: refs, statements: { type: "object", additionalProperties: string } }, ["id", "name", "slogan", "purpose", "geographicScope", "founderPersonId", "principleIds", "methodIds"]),
  "person": obj({ id, name: string, roles: { type: "array", items: obj({ organizationId: id, title: string, locality: string }, ["organizationId", "title"]) }, biography: strings, profileUrl: { type: "string" } }, ["id", "name", "roles", "biography"]),
  "need": obj({ id, slug: id, title: string, summary: string, status: status(["critical", "high_priority", "monitored", "improving"]), investigation_status: status(["investigating", "identified"]), active: { type: "boolean" }, organization_ids: refs, record_ids: refs, story_ids: refs, first_seen: dateOrTime, updated_at: dateOrTime, unknown_questions: strings }, ["id", "slug", "title", "summary", "status", "investigation_status"]),
  "investigation": obj({ id, gap_id: id, title: string, publicName: string, primary_goal: string, status: status(["preparing_fieldwork", "in_progress", "completed"]), introduction: string, evidence_record_ids: refs, verified_finding_ids: refs, last_updated_at: date }, ["id", "gap_id", "title", "primary_goal", "status", "introduction"]),
  "objective": obj({ id, investigation_id: id, title: string, description: string, task_ids: refs, activity_record_ids: refs, evidence_record_ids: refs, finding_ids: refs }, ["id", "investigation_id", "title", "description", "task_ids", "activity_record_ids", "evidence_record_ids", "finding_ids"]),
  "claim": obj({ id, statement: string, kind: status(["reported_estimate", "reported_count", "administrative_count", "unknown_quantity", "editorial_interpretation"]), verificationStatus: status(["source_reported", "official_reported", "not_established", "crossover_interpretation"]), sourceRecordIds: refs, limitations: string, reportedValue: { anyOf: [string, { type: "null" }] }, geographicScopeId: id, needId: id, measurementId: id }, ["id", "statement", "kind", "verificationStatus", "sourceRecordIds", "limitations", "needId"]),
  "measurement": obj({ id, measure: string, value: { type: "number" }, unit: string, coverage_id: id, source_record_id: id, period_start: date, period_end: date, evidence_status: status(["official_reported_actual", "calculated_from_official", "self_reported", "planned_authorized", "estimate"]) }, ["id", "measure", "value", "unit", "coverage_id", "source_record_id", "period_start", "period_end", "evidence_status"]),
  "evidence": obj(evidenceProps, ["id", "record_type", "title", "summary", "trust", "source", "gap_ids", "organization_ids"]),
  "source": { ...source, description: "A source entry; an ID is optional until a reviewed source registry exists." },
  "finding": obj({ id, investigation_id: id, title: string, status: status(["established", "developing", "contradicted", "insufficient_evidence", "preliminary", "exploratory"]), statement: string, primary_objective_id: id, supporting_record_ids: refs, contradicting_record_ids: refs, related_objective_ids: refs, limitations: string, last_reviewed_at: date, current: { type: "boolean" } }, ["id", "investigation_id", "title", "status", "statement", "supporting_record_ids", "contradicting_record_ids", "limitations", "last_reviewed_at"]),
  "activity": obj({ ...evidenceProps, record_type: { const: "activity" }, occurred_at: date, investigation_id: id }, ["id", "record_type", "title", "summary", "source", "occurred_at", "investigation_id", "objective_ids"]),
  "action": obj({ id, order_by_id: { type: "number" }, investigation_id: id, title: string, status: status(["open", "waiting", "done", "cancelled"]), type: status(["application", "inquiry", "field_observation", "records_request", "follow_up", "source_review", "organization_contact", "policy_monitoring"]), instructions: string, list_context: string, list_date_label: string, location_ids: refs, organization_ids: refs, objective_ids: refs, basis_record_ids: refs, activity_record_ids: refs, completed_at: date }, ["id", "order_by_id", "investigation_id", "title", "status", "type", "instructions", "location_ids", "organization_ids", "objective_ids", "basis_record_ids", "activity_record_ids"]),
  "project": obj({ id, title: string, description: string, intended_outcome: string, gap_ids: refs, organization_ids: refs, development_stage: string, operational_status: string, funding_status: string, evidence_record_ids: refs, last_verified_at: date }, ["id", "title", "description", "gap_ids", "organization_ids", "development_stage", "operational_status", "funding_status", "evidence_record_ids"]),
  "article": obj({ id, path: string, title: string, date, type: string, description: string, summary: string, published: { type: "boolean" }, related_gap_ids: refs, related_location_ids: refs }, ["id", "path", "title", "date", "type", "description", "summary"]),
  "organization-service": obj({ ...evidenceProps, record_type: status(["current_service", "reported_service"]), source }, ["id", "record_type", "title", "summary", "source"]),
  "story": obj({ id, slug: id, title: string, summary: string, body: string, gap_ids: refs, organization_ids: refs, published_at: date, source_url: { type: "string" }, image: { type: "string" }, active: { type: "boolean" } }, ["id", "slug", "title", "summary", "gap_ids", "organization_ids"]),
  "development": obj({ ...evidenceProps, record_type: status(["update", "planning_update", "operational_change", "organization_update", "capacity_intervention", "reported_context"]) }, ["id", "record_type", "title", "summary", "source"]),
  "location": obj({ id, investigation_id: id, name: string, area: string, coordinates: { anyOf: [{ type: "array", items: { type: "number" }, minItems: 2, maxItems: 2 }, { type: "null" }] }, category: status(["historical_published_report", "recent_public_report", "official_location_record", "crossover_firsthand"]), evidence_date: date, source_url: { type: "string" }, evidence_record_ids: refs, verification_status: string, unknown: string }, ["id", "investigation_id", "name", "area", "coordinates", "category", "evidence_date", "source_url", "verification_status", "unknown"]),
  "page": obj({ id, route: string, sections: { type: "array", items: obj({ id, region: status(["hero", "hero-action", "body"]), source: status(["site-navigation", "action-cards", "identity", "people", "principles", "methods", "needs", "investigations", "objectives", "tasks", "activities", "evidence", "findings", "claims", "organizations", "stories", "locations", "projects", "articles", "measurements", "developments"]), field: string, filter: string, order: string, limit: { type: "number" }, renderer: string, recordIds: refs, method: status(["prose", "media-list", "media-grid", "collection-index", "disclosure-list", "timeline", "evidence-list", "finding-explanation", "statistics", "geographic-map", "split-investigation-workspace"]) }, ["id", "source", "method"], { additionalProperties: false }) } }, ["id", "route", "sections"], { additionalProperties: false }),
  "view": obj({ id, method: status(["prose", "media-list", "media-grid", "collection-index", "disclosure-list", "timeline", "evidence-list", "finding-explanation", "statistics", "geographic-map", "split-investigation-workspace"]), options: { type: "object" } }, ["id", "method"]),
};
const visualProperties = {
  visual_description: { ...string, description: "Optional subject or scene Crossover wants an independent renderer to understand; not alt text or evidence." },
  preferred_image: { ...string, description: "Optional preferred illustrative image path or URL; the renderer may use another image or none." },
  logo_description: { ...string, description: "Optional description of the record's authentic visual identity or symbol; not alt text." },
  preferred_logo: { ...string, description: "Optional preferred existing logo path or URL. Do not present an invented mark as an organization's official logo." },
};
for (const name of ["identity", "person", "principle", "method", "organization", "need", "investigation", "objective", "action", "activity", "evidence", "finding", "location", "claim", "measurement", "story", "project", "article"]) {
  schemas[name].properties = { ...schemas[name].properties, ...visualProperties };
}
schemas.need.properties.thumbnail_image = { ...string, description: "Optional thumbnail variant of the preferred image for compact displays." };
schemas.evidence.properties.image = { ...string, description: "Image attached to a source record; its source and caption remain separate from illustrative preferences." };
schemas.evidence.properties.image_alt = string;
schemas.evidence.properties.image_caption = string;
const titles = { identity: "Identity", person: "Person", principle: "Principle", method: "Method", organization: "Organization", need: "Need", investigation: "Investigation", objective: "Investigation objective", action: "Task", activity: "Activity", evidence: "Evidence record", finding: "Finding", location: "Location", claim: "Claim", measurement: "Measurement", story: "Story", project: "Project", article: "Article", development: "Development", "organization-service": "Organization service", source: "Source" };
for (const [name, body] of Object.entries(schemas)) {
  const schema = { $schema: "https://json-schema.org/draft/2020-12/schema", $id: `https://crossoverstockton.org/schemas/${name}.schema.json`, title: titles[name] ?? name, description: `${name} information definition. Schema describes source data, not page layout.`, ...body };
  writeFileSync(`${base}/${name}.schema.json`, `${JSON.stringify(schema, null, 2)}\n`);
}
