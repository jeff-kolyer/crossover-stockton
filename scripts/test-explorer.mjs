import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "vite";
import { buildExplorerSnapshot, searchExplorer } from "./explorer-snapshot.mjs";
import { explorerRecordUrl, recordIdFromSearch } from "../src/controller/explorer-url.ts";

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
const published = await readJson("../src/generated/explorer-public.json");
const sourceTasks = await readJson("../src/data/tasks.json");
const policy = await readJson("../src/model/explorer-publication.json");
const schemas = Object.fromEntries(await Promise.all(policy.collections.map(async ({ schema }) =>
  [schema, await readJson(`../src/schemas/${schema}.schema.json`)])));

test("published counts come from unique records, and schema metadata names types", () => {
  const evidence = published.collections.find((item) => item.id === "evidence");
  assert.ok(evidence?.recordIds.length > 0);
  assert.equal(evidence.recordIds.length, new Set(evidence.recordIds).size);
  assert.equal(published.records[evidence.recordIds[0]].typeName, schemas.evidence.title);
  for (const id of ["tasks", "questions", "findings", "locations", "stories"]) {
    const collection = published.collections.find((item) => item.id === id);
    assert.ok(collection?.recordIds.length > 0);
    assert.equal(collection.recordIds.length, new Set(collection.recordIds).size);
  }
});

test("task order follows each task record's order_by_id", () => {
  const collection = published.collections.find((item) => item.id === "tasks");
  const ordered = [...sourceTasks].sort((a, b) => a.order_by_id - b.order_by_id || a.id.localeCompare(b.id));
  assert.deepEqual(collection.recordIds, ordered.map((task) => task.id));
  assert.equal(ordered[1].id, "task-review-sas-field-call-records");
});

test("adding and removing publishable evidence changes the inventory without view edits", () => {
  const fixture = { id: "explorer-test-evidence", title: "Test public observation", summary: "A public fixture", record_type: "external_report", trust: "external", limitations: ["Limited scope"], source: { publisher: "Test publisher", url: "https://example.org/source" }, internal_note: "never publish" };
  const fixturePolicy = { groups: [{ id: "knowledge", title: "Evidence and knowledge" }], collections: [{ id: "evidence", schema: "evidence", group: "knowledge", title: "Evidence records", query: "evidence", fields: ["id", "title", "summary", "record_type", "trust", "limitations", "source"] }], nestedFields: policy.nestedFields, fieldLabels: policy.fieldLabels };
  const base = [fixture];
  const added = buildExplorerSnapshot(fixturePolicy, schemas, { evidence: [...base, { ...fixture, id: "explorer-test-added", title: "Added public evidence" }] }).snapshot;
  assert.equal(added.collections[0].recordIds.length, 2);
  assert.equal(added.records["explorer-test-added"].title, "Added public evidence");
  assert.equal(added.records["explorer-test-added"].fields.source.publisher, "Test publisher");
  assert.deepEqual(added.records["explorer-test-added"].fields.limitations, ["Limited scope"]);
  assert.equal(JSON.stringify(added).includes("never publish"), false);
  const removed = buildExplorerSnapshot(fixturePolicy, schemas, { evidence: base }).snapshot;
  assert.equal(removed.collections[0].recordIds.length, 1);
  assert.equal(removed.records["explorer-test-added"], undefined);
});

test("duplicate appearances, missing references, and unpublished records are handled explicitly", () => {
  const fixturePolicy = { groups: [{ id: "knowledge", title: "Knowledge" }], collections: [
    { id: "evidence", schema: "evidence", group: "knowledge", title: "Evidence", query: "evidence", fields: ["id", "title", "sourceRecordIds"] },
    { id: "activities", schema: "activity", group: "knowledge", title: "Activities", query: "activities", fields: ["id", "title"] },
  ], nestedFields: {}, fieldLabels: {}, relationshipFields: ["sourceRecordIds"] };
  const shared = { id: "shared", title: "Shared activity", sourceRecordIds: ["missing-record"] };
  const { snapshot, diagnostics } = buildExplorerSnapshot(fixturePolicy, schemas, { evidence: [shared, { id: "secret", title: "Private", published: false }], activities: [shared] });
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

test("direct record URLs preserve stable IDs through query parsing", () => {
  const url = explorerRecordUrl("record/with spaces");
  assert.equal(url, "/data/?record=record%2Fwith+spaces");
  assert.equal(recordIdFromSearch(new URL(url, "https://crossover.local").search), "record/with spaces");
  assert.equal(recordIdFromSearch("?record=missing"), "missing");
});

test("explicit internal visibility is excluded even from an allowed collection", () => {
  const fixturePolicy = { groups: [{ id: "knowledge", title: "Knowledge" }], collections: [
    { id: "evidence", schema: "evidence", group: "knowledge", title: "Evidence", query: "evidence", fields: ["id", "title", "source"] },
  ], nestedFields: policy.nestedFields, fieldLabels: policy.fieldLabels, relationshipFields: policy.relationshipFields };
  const { snapshot } = buildExplorerSnapshot(fixturePolicy, schemas, { evidence: [
    { id: "public", title: "Public", source: { publisher: "City" } },
    { id: "internal", title: "Internal", visibility: "internal", source: { publisher: "Private" } },
  ] });
  assert.deepEqual(snapshot.collections[0].recordIds, ["public"]);
  assert.equal(snapshot.records.internal, undefined);
  assert.equal(JSON.stringify(snapshot).includes("Private"), false);
});

test("real records share one public payload across browse paths and inspection modes", () => {
  const examples = [
    ["crossover-stockton", "identity"],
    ["dogs-safe-placement", "needs"],
    ["street-dog-immediate-welfare", "investigations"],
    ["where-dogs-need-help", "questions"],
    ["task-review-sas-field-call-records", "tasks"],
    ["crossover-2026-11-02-sas-field-call-records-received", "activities"],
    ["sas-2024-dog-intake-total", "measurements"],
    ["finding-street-population-unknown", "findings"],
    ["weston-ranch-carrie-street", "locations"],
    ["truckloads-of-food-reached-families", "stories"],
  ];
  for (const [id, collectionId] of examples) {
    const record = published.records[id];
    const collection = published.collections.find((item) => item.id === collectionId);
    assert.ok(record, id);
    assert.ok(collection?.recordIds.includes(id), `${id} in ${collectionId}`);
    const publicJson = JSON.stringify(record.fields, null, 2);
    assert.deepEqual(JSON.parse(publicJson), record.fields);
    assert.equal(record.fields.id, id);
    for (const [field, value] of Object.entries(record.fields)) {
      assert.ok(published.fieldInfo[field], `${id}.${field} has display metadata`);
      assert.deepEqual(JSON.parse(publicJson)[field], value);
    }
  }
  const receipt = published.records["crossover-2026-11-02-sas-field-call-records-received"];
  assert.ok(published.collections.find((item) => item.id === "evidence")?.recordIds.includes(receipt.id));
  assert.equal(published.fieldInfo.basis_record_ids.kind, "reference");
  assert.equal(published.fieldInfo.occurred_at.kind, "date");
  assert.equal(published.fieldInfo.coverage_id.kind, "value");
  assert.ok(receipt.fields.source.publisher);
  assert.ok(receipt.fields.occurred_at);
  assert.ok(published.records["finding-street-population-unknown"].fields.limitations);
});

test("Updates is first and reuses the Model's public feed without new record identities", async () => {
  const vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "error" });
  try {
    const { siteModel } = await vite.ssrLoadModule("/src/model/index.ts");
    const updateIds = siteModel.getPublicUpdates().map(({ record }) => record.id);
    const collection = published.collections.find((item) => item.id === "public-updates");
    assert.equal(published.groups[0].id, "updates");
    assert.deepEqual(published.groups[0].collectionIds, ["public-updates"]);
    assert.deepEqual(collection.recordIds, updateIds);
    assert.equal(collection.recordIds.length, new Set(collection.recordIds).size);
    const receiptId = "crossover-2026-11-02-sas-field-call-records-received";
    assert.ok(collection.recordIds.includes(receiptId));
    assert.ok(published.collections.find((item) => item.id === "activities")?.recordIds.includes(receiptId));
    assert.ok(published.collections.find((item) => item.id === "evidence")?.recordIds.includes(receiptId));
    assert.equal(published.records[receiptId].fields.id, receiptId);
    for (const activity of siteModel.getAllActivities()) {
      if (activity.public_update !== true) assert.equal(collection.recordIds.includes(activity.id), false);
    }
  } finally {
    await vite.close();
  }
});

test("Crossover and Organizations are separate browse groups over the existing records", () => {
  const crossover = published.groups.find((group) => group.id === "organization");
  const organizations = published.groups.find((group) => group.id === "organizations");
  assert.equal(crossover?.title, "Crossover");
  assert.deepEqual(crossover.collectionIds, ["identity", "principles", "methods", "people"]);
  assert.equal(organizations?.title, "Organizations");
  assert.deepEqual(organizations.collectionIds, ["organizations"]);
  const collection = published.collections.find((item) => item.id === "organizations");
  assert.equal(collection.group, "organizations");
  assert.equal(collection.recordIds.length, 11);
  for (const id of collection.recordIds) assert.ok(published.records[id]);
});
