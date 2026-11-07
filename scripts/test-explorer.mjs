import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildExplorerSnapshot, searchExplorer } from "./explorer-snapshot.mjs";
import { loadExplorerRoots } from "./explorer-roots.mjs";
import { googleMapsSearchUrl } from "../src/lib/googleMapsUrl.ts";

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
const published = await readJson("../src/generated/explorer-public.json");
const sourceActions = await readJson("../src/data/tasks.json");
const sourceLocations = await readJson("../src/data/locations.json");
const needsSource = await readJson("../src/data/gaps.json");
const sourceProjects = await readJson("../src/data/improvements.json");
const policy = await readJson("../src/model/explorer-publication.json");
const roots = await loadExplorerRoots(policy);
const schemas = Object.fromEntries(await Promise.all(policy.collections.map(async ({ schema }) =>
  [schema, await readJson(`../src/schemas/${schema}.schema.json`)])));

test("published counts come from unique records, and schema metadata names types", () => {
  const evidence = published.collections.find((item) => item.id === "evidence");
  assert.ok(evidence?.recordIds.length > 0);
  assert.equal(evidence.recordIds.length, new Set(evidence.recordIds).size);
  assert.equal(published.records[evidence.recordIds[0]].typeName, schemas.evidence.title);
  for (const id of ["tasks", "findings", "locations", "initiatives"]) {
    const collection = published.collections.find((item) => item.id === id);
    assert.ok(collection?.recordIds.length > 0);
    assert.equal(collection.recordIds.length, new Set(collection.recordIds).size);
  }
});

test("locations publish typed geographic references with usable Google Maps searches", () => {
  const collection = published.collections.find(({ id }) => id === "locations");
  assert.equal(collection.recordIds.length, sourceLocations.length);
  assert.equal(published.fieldInfo.location_type.kind, "value");
  assert.match(published.locationGuidance.presentation, /prominent Open in Google Maps link/);
  for (const location of sourceLocations) {
    const publicRecord = published.records[location.id];
    assert.ok(collection.recordIds.includes(location.id), location.id);
    assert.equal(publicRecord.fields.location_type, location.location_type);
    assert.deepEqual(publicRecord.fields.map_reference, location.map_reference);
    assert.equal(publicRecord.fields.category, location.category);
    const url = googleMapsSearchUrl(publicRecord.fields.map_reference);
    assert.equal(new URL(url).origin, "https://www.google.com");
    assert.equal(new URL(url).searchParams.get("api"), "1");
    assert.equal(new URL(url).searchParams.get("query"), location.map_reference.query);
    assert.equal(publicRecord.fields.google_maps_url, undefined);
  }
  assert.equal(googleMapsSearchUrl({ query: "  ", precision: "general_area", verified: false }), null);
  assert.equal(googleMapsSearchUrl({ query: "x".repeat(2048), precision: "general_area", verified: false }), null);
});

test("the feed explains flat newest-first browse semantics and preserves date meanings", () => {
  assert.equal(published.browseGuidance.defaultTypeFilter, "all");
  assert.equal(published.browseGuidance.defaultLayout, "flat");
  assert.equal(published.browseGuidance.defaultSort, "dateForSort.value descending");
  assert.equal(published.browseGuidance.undatedPlacement, "last");
  assert.match(published.browseGuidance.defaultView, /All types.*flat list, newest first/);
  assert.match(published.browseGuidance.filtering, /undated records after dated records/);
  assert.match(published.browseGuidance.dateMeaning, /dateForSort.field/);
  assert.deepEqual(published.records["crossover-2026-11-02-sas-field-call-records-received"].dateForSort,
    { field: "occurred_at", value: "2026-11-02" });
  assert.deepEqual(published.records["stocktonia-2026-10-20-animal-control-proposals"].dateForSort,
    { field: "published_at", value: "2026-10-20" });
  const matching = searchExplorer(published, "stockton");
  assert.deepEqual(matching.map(({ id }) => id), [...matching].sort((a, b) =>
    (b.dateForSort ? Date.parse(b.dateForSort.value) : -Infinity)
    - (a.dateForSort ? Date.parse(a.dateForSort.value) : -Infinity) || a.id.localeCompare(b.id)).map(({ id }) => id));
});

test("firsthand activities derive contacted organizations without turning references into partners", () => {
  const contacted = Object.values(published.records).filter((record) =>
    record.schema === "organization" && record.fields.contact_activity_ids?.length);
  assert.deepEqual(contacted.map(({ id }) => id).sort(), ["stockton-animal-services", "stockton-street-dogs"]);
  assert.equal(published.fieldInfo.contact_activity_ids.kind, "reference");
  assert.match(published.fieldInfo.contact_activity_ids.description, /before claiming.*collaboration/);
  for (const organization of contacted) {
    for (const id of organization.fields.contact_activity_ids) {
      const activity = published.records[id];
      assert.equal(activity.schema, "activity");
      assert.equal(activity.fields.trust, "crossover_source");
      assert.equal(activity.fields.source.type, "firsthand_account");
      assert.ok(activity.fields.organization_ids.includes(organization.id));
      assert.ok(activity.fields.organization_interaction);
    }
  }
  assert.equal(published.records["stockton-street-dogs"].fields.contact_activity_ids.length, 1);
  assert.equal(published.records["crossover-2026-10-07-street-dogs-volunteer-application"].fields.organization_interaction, "outreach_attempt");
});

test("new firsthand contact updates the organization link while outside reports do not", () => {
  const fixturePolicy = { ...policy, collections: policy.collections.filter(({ id }) =>
    ["organizations", "activities"].includes(id)) };
  const source = {
    organizations: [{ id: "org-one", name: "Organization one" }, { id: "org-two", name: "Organization two" }],
    activities: [
      { id: "contact", title: "Asked about volunteering", record_type: "activity", trust: "crossover_source",
        source: { publisher: "Crossover Stockton", type: "firsthand_account" }, occurred_at: "2026-11-03",
        organization_ids: ["org-one"], organization_interaction: "outreach_attempt" },
      { id: "report", title: "Outside report", record_type: "activity", trust: "source_supported",
        source: { publisher: "News", type: "local_reporting" }, occurred_at: "2026-11-03",
        organization_ids: ["org-two"] },
    ],
  };
  const { snapshot } = buildExplorerSnapshot(fixturePolicy, schemas, source,
    [{ id: "organizations", title: "Organizations", collectionIds: ["organizations", "activities"] }]);
  assert.deepEqual(snapshot.records["org-one"].fields.contact_activity_ids, ["contact"]);
  assert.equal(snapshot.records["org-two"].fields.contact_activity_ids, undefined);
});

test("visual preferences publish when supplied and remain optional", () => {
  const need = needsSource.records[0];
  assert.equal(published.records[need.id].fields.preferred_image, need.preferred_image);
  assert.equal(published.records[need.id].fields.thumbnail_image, need.thumbnail_image);
  assert.equal(published.records["crossover-stockton"].fields.preferred_logo, "/images/logo_light.webp");
  assert.equal(published.fieldInfo.preferred_image.kind, "url");
  assert.equal(published.fieldInfo.preferred_logo.kind, "url");
  assert.ok(published.visualGuidance.evidence.includes("not investigation evidence"));
  assert.equal(published.records["crossover-2026-10-14-sas-first-visit"].fields.preferred_image, undefined);
  const definition = policy.collections.find((item) => item.id === "organizations");
  const fixture = [
    { id: "with-visuals", name: "Example", visual_description: "A volunteer at a community table", preferred_image: "/images/example.jpg", logo_description: "A blue circle", preferred_logo: "/images/example-logo.svg" },
    { id: "without-visuals", name: "No image supplied" },
  ];
  const { snapshot } = buildExplorerSnapshot({ ...policy, collections: [definition] }, schemas, { organizations: fixture }, [{ id: "organizations", title: "Organizations", collectionIds: ["organizations"] }]);
  for (const field of policy.sharedFields) assert.equal(snapshot.records["with-visuals"].fields[field], fixture[0][field]);
  for (const field of policy.sharedFields) assert.equal(snapshot.records["without-visuals"].fields[field], undefined);
});

test("task order follows each task record's order_by_id", () => {
  const collection = published.collections.find((item) => item.id === "tasks");
  const ordered = [...sourceActions].sort((a, b) => a.order_by_id - b.order_by_id || a.id.localeCompare(b.id));
  assert.deepEqual(collection.recordIds, ordered.map((action) => action.id));
  assert.equal(ordered[1].id, "task-review-sas-field-call-records");
});

test("adding and removing publishable evidence changes the inventory without view edits", () => {
  const fixture = { id: "explorer-test-evidence", title: "Test public observation", summary: "A public fixture", record_type: "external_report", trust: "external", limitations: ["Limited scope"], source: { publisher: "Test publisher", url: "https://example.org/source" }, internal_note: "never publish" };
  const fixturePolicy = { collections: [{ id: "evidence", schema: "evidence", title: "Evidence records", query: "evidence", fields: ["id", "title", "summary", "record_type", "trust", "limitations", "source"] }], nestedFields: policy.nestedFields, fieldLabels: policy.fieldLabels };
  const fixtureRoots = [{ id: "knowledge", title: "Evidence and knowledge", collectionIds: ["evidence"] }];
  const base = [fixture];
  const added = buildExplorerSnapshot(fixturePolicy, schemas, { evidence: [...base, { ...fixture, id: "explorer-test-added", title: "Added public evidence" }] }, fixtureRoots).snapshot;
  assert.equal(added.collections[0].recordIds.length, 2);
  assert.equal(added.records["explorer-test-added"].title, "Added public evidence");
  assert.equal(added.records["explorer-test-added"].fields.source.publisher, "Test publisher");
  assert.deepEqual(added.records["explorer-test-added"].fields.limitations, ["Limited scope"]);
  assert.equal(JSON.stringify(added).includes("never publish"), false);
  const removed = buildExplorerSnapshot(fixturePolicy, schemas, { evidence: base }, fixtureRoots).snapshot;
  assert.equal(removed.collections[0].recordIds.length, 1);
  assert.equal(removed.records["explorer-test-added"], undefined);
});

test("duplicate appearances, missing references, and unpublished records are handled explicitly", () => {
  const fixturePolicy = { collections: [
    { id: "evidence", schema: "evidence", title: "Evidence", query: "evidence", fields: ["id", "title", "sourceRecordIds"] },
    { id: "activities", schema: "activity", title: "Activities", query: "activities", fields: ["id", "title"] },
  ], nestedFields: {}, fieldLabels: {}, relationshipFields: ["sourceRecordIds"] };
  const shared = { id: "shared", title: "Shared activity", sourceRecordIds: ["missing-record"] };
  const { snapshot, diagnostics } = buildExplorerSnapshot(fixturePolicy, schemas, { evidence: [shared, { id: "secret", title: "Private", published: false }], activities: [shared] }, [{ id: "knowledge", title: "Knowledge", collectionIds: ["evidence", "activities"] }]);
  assert.equal(Object.keys(snapshot.records).length, 1);
  assert.equal(snapshot.records.shared.typeName, schemas.activity.title);
  assert.equal(snapshot.records.secret, undefined);
  assert.ok(diagnostics.some((line) => line.includes("missing-record")));
});

test("search finds public records by title, type, ID, and source publisher", () => {
  const record = { id: "fixture-1", title: "A named record", typeName: "Evidence", description: "Public description", fields: { source: { publisher: "Public publisher" }, organization_ids: ["org-1"] } };
  const organization = { id: "org-1", title: "Partner agency", typeName: "Organization", description: "", fields: {} };
  const snapshot = { records: { [record.id]: record, [organization.id]: organization }, fieldInfo: { organization_ids: { kind: "reference" } } };
  for (const query of ["named", "evidence", "fixture-1", "publisher"]) assert.equal(searchExplorer(snapshot, query).length, 1);
  assert.ok(searchExplorer(snapshot, "Partner agency").some((item) => item.id === record.id));
  assert.equal(searchExplorer(snapshot, "unrelated").length, 0);
});

test("generated browser payload omits internal and precise-location fields", () => {
  const serialized = JSON.stringify(published);
  for (const field of ["internal_note", "visit_notes", "checklist", "coordinates", "private_contact"]) assert.equal(serialized.includes(`\"${field}\"`), false);
  assert.ok(published.groups.length > 0);
});

test("explicit internal visibility is excluded even from an allowed collection", () => {
  const fixturePolicy = { collections: [
    { id: "evidence", schema: "evidence", title: "Evidence", query: "evidence", fields: ["id", "title", "source"] },
  ], nestedFields: policy.nestedFields, fieldLabels: policy.fieldLabels, relationshipFields: policy.relationshipFields };
  const { snapshot } = buildExplorerSnapshot(fixturePolicy, schemas, { evidence: [
    { id: "public", title: "Public", source: { publisher: "City" } },
    { id: "internal", title: "Internal", visibility: "internal", source: { publisher: "Private" } },
  ] }, [{ id: "knowledge", title: "Knowledge", collectionIds: ["evidence"] }]);
  assert.deepEqual(snapshot.collections[0].recordIds, ["public"]);
  assert.equal(snapshot.records.internal, undefined);
  assert.equal(JSON.stringify(snapshot).includes("Private"), false);
});

test("top-level categories and labels follow the root data", () => {
  const fixturePolicy = { collections: [{ id: "initiatives", schema: "initiative", title: "Initiatives", query: "initiatives", fields: ["id", "title"] }], nestedFields: {}, fieldLabels: {} };
  const fixtureData = { initiatives: [{ id: "initiative-one", title: "An initiative" }] };
  const withRoot = buildExplorerSnapshot(fixturePolicy, schemas, fixtureData,
    [{ id: "initiatives", title: "Initiatives", collectionIds: ["initiatives"] }]).snapshot;
  assert.deepEqual(withRoot.groups.map(({ id, title }) => [id, title]), [["initiatives", "Initiatives"]]);
  assert.deepEqual(withRoot.groups[0].collectionIds, ["initiatives"]);
  const withoutRoot = buildExplorerSnapshot(fixturePolicy, schemas, fixtureData, []).snapshot;
  assert.deepEqual(withoutRoot.groups, []);
});

test("date metadata follows record dates without adding collections", () => {
  const fixturePolicy = { collections: [{ id: "evidence", schema: "evidence", title: "Evidence", query: "evidence", fields: ["id", "title", "published_at"] }], nestedFields: {}, fieldLabels: {} };
  const evidence = [
    { id: "first", title: "First", published_at: "2026-10-01" },
    { id: "second", title: "Second", published_at: "2026-10-02" },
    { id: "undated", title: "Undated" },
  ];
  const build = (items) => buildExplorerSnapshot(fixturePolicy, schemas, { evidence: items }, [{ id: "evidence", title: "Evidence", collectionIds: ["evidence"] }]).snapshot;
  assert.equal(build(evidence).records.first.dateForSort.value, "2026-10-01");
  assert.equal(build(evidence).records.undated.dateForSort, undefined);
  assert.equal(build([{ ...evidence[0], published_at: "2026-10-03" }, ...evidence.slice(1)]).records.first.dateForSort.value, "2026-10-03");
  assert.deepEqual(build(evidence).collections.map((item) => item.id), ["evidence"]);
});

test("project states survive the public projection", () => {
  for (const project of sourceProjects) {
    const fields = published.records[project.id].fields;
    for (const key of ["intended_outcome", "development_stage", "operational_status", "funding_status", "capacity_summary", "expected_capacity_or_benefit", "actual_additional_capacity", "milestones", "evidence_record_ids", "open_questions", "next_verification_step", "last_verified_at"]) {
      assert.deepEqual(fields[key], project[key], `${project.id}.${key}`);
    }
  }
});

test("project milestones publish public details without nested internal notes", () => {
  const projectCollection = policy.collections.find((item) => item.id === "initiatives");
  const fixture = { id: "project-fixture", title: "Public", milestones: [{ date: "2026-11-02", status: "planned", description: "Public plan", evidence_record_ids: [], internal_note: "secret" }] };
  const { snapshot } = buildExplorerSnapshot({ ...policy, collections: [projectCollection] }, schemas, { initiatives: [fixture] }, [{ id: "initiatives", title: "Initiatives", collectionIds: ["initiatives"] }]);
  assert.deepEqual(snapshot.records[fixture.id].fields.milestones, [{ date: "2026-11-02", status: "planned", description: "Public plan", evidence_record_ids: [] }]);
  assert.equal(JSON.stringify(snapshot).includes("secret"), false);
});

test("one need connects dog care and pet shelter without a separate investigation", () => {
  const needs = Object.values(published.records).filter(record => record.schema === "gap");
  assert.deepEqual(new Set(needs.map(record => record.id)), new Set(["dogs-safe-placement"]));
  assert.equal(published.records["street-dog-immediate-welfare"], undefined);
  for (const id of ["pet-inclusive-shelter", "low-barrier-housing-pathways", "pathways-opened-268-beds", "pathways-neighborhood", "smcs-2026-06-17-pathways-268-beds"])
    assert.equal(published.records[id], undefined);
  assert.equal(JSON.stringify(published).includes('"pet-inclusive-shelter"'), false);
  assert.equal(published.experienceSpec, undefined);
  for (const record of needs) assert.equal(record.fields.investigation_status, undefined);
  for (const schema of ["task", "activity", "finding", "location"]) {
    for (const record of Object.values(published.records).filter(item => item.schema === schema)) {
      assert.equal(record.fields.investigation_id, undefined, record.id);
      assert.ok(record.fields.gap_ids?.length > 0, record.id);
    }
  }
  assert.deepEqual(new Set(published.records["st-marys-community-services-campus"].fields.gap_ids), new Set(["dogs-safe-placement"]));
  assert.match(published.records["dogs-safe-placement"].fields.current_state, /people with pets/i);
});
