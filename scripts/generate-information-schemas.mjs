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
const evidenceProps = { id, title: string, summary: string, record_type: status(recordTypes), public_update: { type: "boolean", description: "Marks an activity as a meaningful public development; visibility must also authorize publication." }, visibility: status(["public", "internal"]), trust: status(["source_supported", "crossover_source", "government", "organization_source"]), source, gap_ids: refs, organization_ids: refs, location_ids: refs, coverage_id: id, coverage_note: string, observed_dog_count: { type: "number" }, occurred_at: dateOrTime, published_at: optionalDate, checked_at: dateOrTime, recorded_at: dateOrTime, evidence_status: string, basis_record_ids: refs, report_record_ids: refs, outcome: obj({ status: string, summary: string, as_of: dateOrTime }, ["status", "summary", "as_of"]) };
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
  "gap": obj({ id, slug: id, title: string, summary: string, active: { type: "boolean" }, default: { type: "boolean" }, current_focus: obj({ title: string, description: string, updated_at: date }, ["title", "description", "updated_at"], { additionalProperties: false }), organization_ids: refs, record_ids: refs, first_seen: dateOrTime, updated_at: dateOrTime, unknown_questions: strings }, ["id", "slug", "title", "summary", "current_focus"]),
  "claim": obj({ id, statement: string, kind: status(["reported_estimate", "reported_count", "administrative_count", "unknown_quantity", "editorial_interpretation"]), verificationStatus: status(["source_reported", "official_reported", "not_established", "crossover_interpretation"]), sourceRecordIds: refs, limitations: string, reportedValue: { anyOf: [string, { type: "null" }] }, geographicScopeId: id, gap_id: id, measurementId: id }, ["id", "statement", "kind", "verificationStatus", "sourceRecordIds", "limitations", "gap_id"]),
  "measurement": obj({ id, measure: string, value: { type: "number" }, unit: string, coverage_id: id, source_record_id: id, period_start: date, period_end: date, evidence_status: status(["official_reported_actual", "calculated_from_official", "self_reported", "planned_authorized", "estimate"]) }, ["id", "measure", "value", "unit", "coverage_id", "source_record_id", "period_start", "period_end", "evidence_status"]),
  "evidence": obj(evidenceProps, ["id", "record_type", "title", "summary", "trust", "source", "gap_ids", "organization_ids"]),
  "source": { ...source, description: "A source entry; an ID is optional until a reviewed source registry exists." },
  "finding": obj({ id, gap_ids: refs, title: string, status: status(["established", "developing", "contradicted", "insufficient_evidence", "preliminary", "exploratory"]), statement: string, related_task_ids: refs, related_initiative_ids: refs, supporting_record_ids: refs, contradicting_record_ids: refs, limitations: string, last_reviewed_at: date, current: { type: "boolean" } }, ["id", "gap_ids", "title", "status", "statement", "related_task_ids", "related_initiative_ids", "supporting_record_ids", "contradicting_record_ids", "limitations", "last_reviewed_at"]),
  "activity": obj({ ...evidenceProps, record_type: { const: "activity" }, occurred_at: date, organization_interaction: { ...status(["outreach_attempt", "response_received", "in_person_visit_and_application", "collaboration"]), description: "What Crossover actually did with or received from the linked organization. An application or inquiry is an outreach attempt, not acceptance or partnership. Use collaboration only when directly documented." } }, ["id", "record_type", "title", "summary", "source", "occurred_at", "gap_ids"]),
  "task": obj({ id, order_by_id: { type: "number" }, gap_ids: refs, title: string, status: status(["open", "in_progress", "waiting", "done", "cancelled"]), type: status(["application", "inquiry", "field_observation", "records_request", "follow_up", "source_review", "organization_contact", "policy_monitoring"]), instructions: string, list_context: string, list_date_label: string, location_ids: refs, organization_ids: refs, basis_record_ids: refs, activity_record_ids: refs, completed_at: date }, ["id", "order_by_id", "gap_ids", "title", "status", "type", "instructions", "location_ids", "organization_ids", "basis_record_ids", "activity_record_ids"]),
  "initiative": obj({ id, title: string, description: string, intended_outcome: string, gap_ids: refs, organization_ids: refs, development_stage: string, operational_status: string, funding_status: string, evidence_record_ids: refs, last_verified_at: date }, ["id", "title", "description", "gap_ids", "organization_ids", "development_stage", "operational_status", "funding_status", "evidence_record_ids"]),
  "article": obj({ id, path: string, title: string, date, type: string, description: string, summary: string, published: { type: "boolean" }, related_gap_ids: refs, related_location_ids: refs }, ["id", "path", "title", "date", "type", "description", "summary"]),
  "organization-service": obj({ ...evidenceProps, record_type: status(["current_service", "reported_service"]), source }, ["id", "record_type", "title", "summary", "source"]),
  "development": obj({ ...evidenceProps, record_type: status(["update", "planning_update", "operational_change", "organization_update", "capacity_intervention", "reported_context"]) }, ["id", "record_type", "title", "summary", "source"]),
  "location": obj({ id, gap_ids: refs, location_type: { type: "string", pattern: "^[a-z][a-z_]*$", description: "Physical place type, independent of the evidence source or reported activity. Current values include animal_care, human_services, park, street_corridor, general_area, and other; future types may be added." }, map_reference: obj({ query: string, precision: status(["address", "named_place", "intersection", "corridor", "general_area"]), verified: { type: "boolean" }, source_url: string, embed_url: string }, ["query", "precision", "verified"], { additionalProperties: false, description: "Public geographic search reference. Precision describes the query, not the accuracy of any associated report or the current location of a person or animal." }), name: string, area: string, coordinates: { anyOf: [{ type: "array", items: { type: "number" }, minItems: 2, maxItems: 2 }, { type: "null" }] }, category: status(["historical_published_report", "recent_public_report", "official_location_record", "crossover_firsthand"]), evidence_date: date, source_url: { type: "string" }, evidence_record_ids: refs, verification_status: string, unknown: string }, ["id", "gap_ids", "location_type", "map_reference", "name", "area", "coordinates", "category", "evidence_date", "source_url", "verification_status", "unknown"]),
};
const visualProperties = {
  visual_description: { ...string, description: "Optional subject or scene Crossover wants an independent renderer to understand; not alt text or evidence." },
  preferred_image: { ...string, description: "Optional preferred illustrative image path or URL; the renderer may use another image or none." },
  logo_description: { ...string, description: "Optional description of the record's authentic visual identity or symbol; not alt text." },
  preferred_logo: { ...string, description: "Optional preferred existing logo path or URL. Do not present an invented mark as an organization's official logo." },
};
for (const name of ["identity", "person", "principle", "method", "organization", "gap", "task", "activity", "evidence", "finding", "location", "claim", "measurement", "initiative", "article"]) {
  schemas[name].properties = { ...schemas[name].properties, ...visualProperties };
}
schemas.gap.properties.thumbnail_image = { ...string, description: "Optional thumbnail variant of the preferred image for compact displays." };
schemas.evidence.properties.image = { ...string, description: "Image attached to a source record; its source and caption remain separate from illustrative preferences." };
schemas.evidence.properties.image_alt = string;
schemas.evidence.properties.image_caption = string;
const titles = { identity: "Identity", person: "Person", principle: "Principle", method: "Method", organization: "Organization", gap: "Gap", task: "Task", activity: "Activity", evidence: "Evidence record", finding: "Finding", location: "Location", claim: "Claim", measurement: "Measurement", initiative: "Initiative", article: "Article", development: "Development", "organization-service": "Organization service", source: "Source" };
for (const [name, body] of Object.entries(schemas)) {
  const schema = { $schema: "https://json-schema.org/draft/2020-12/schema", $id: `https://crossoverstockton.org/schemas/${name}.schema.json`, title: titles[name] ?? name, description: `${name} information definition. Schema describes source data, not page layout.`, ...body };
  writeFileSync(`${base}/${name}.schema.json`, `${JSON.stringify(schema, null, 2)}\n`);
}
