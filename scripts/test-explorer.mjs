import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "vite";
import { buildExplorerSnapshot, searchExplorer } from "./explorer-snapshot.mjs";
import { explorerRecordUrl, recordIdFromSearch } from "../src/controller/explorer-url.ts";

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
const published = await readJson("../src/generated/explorer-public.json");
const sourceTasks = await readJson("../src/data/tasks.json");
const sourceArticles = await readJson("../src/data/articles.json");
const sourceProjects = await readJson("../src/data/projects.json");
const sourceWorkstreams = await readJson("../src/data/workstreams.json");
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
    ["finding-public-street-dog-information-fragmented", "findings"],
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
  assert.ok(published.records["finding-public-street-dog-information-fragmented"].fields.limitations);
});

test("Updates is first and reuses the Model's public feed without new record identities", async () => {
  const vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "error" });
  try {
    const { siteModel } = await vite.ssrLoadModule("/src/model/index.ts");
    const { explorerPathForRecord } = await vite.ssrLoadModule("/src/model/explorer.ts");
    const { explorerStateFromSearch } = await vite.ssrLoadModule("/src/controller/explorer.ts");
    const updateIds = siteModel.getPublicUpdates().map(({ record }) => record.id);
    const developments = published.collections.find((item) => item.id === "developments");
    const investigationUpdates = published.collections.find((item) => item.id === "investigation-updates");
    assert.equal(published.groups[0].id, "updates");
    assert.deepEqual(published.groups[0].collectionIds, ["developments", "investigation-updates"]);
    assert.equal(published.collections.some((item) => item.id === "public-updates"), false);
    assert.deepEqual(developments.recordIds, siteModel.getPublicDevelopments().map(({ record }) => record.id));
    assert.deepEqual(investigationUpdates.recordIds, siteModel.getInvestigationUpdates().map(({ record }) => record.id));
    assert.deepEqual(new Set([...developments.recordIds, ...investigationUpdates.recordIds]), new Set(updateIds));
    assert.equal(updateIds.length, new Set(updateIds).size);
    const receiptId = "crossover-2026-11-02-sas-field-call-records-received";
    assert.ok(investigationUpdates.recordIds.includes(receiptId));
    assert.ok(developments.recordIds.includes("stocktonia-2026-10-20-animal-control-proposals"));
    assert.ok(published.collections.find((item) => item.id === "activities")?.recordIds.includes(receiptId));
    assert.ok(published.collections.find((item) => item.id === "evidence")?.recordIds.includes(receiptId));
    assert.equal(published.records[receiptId].fields.id, receiptId);
    for (const activity of siteModel.getAllActivities()) {
      if (activity.public_update !== true) assert.equal(investigationUpdates.recordIds.includes(activity.id), false);
    }
    assert.deepEqual(explorerPathForRecord("finding-public-street-dog-information-fragmented"), {
      groupId: "investigation", investigationId: "street-dog-immediate-welfare", collectionId: "street-dog-immediate-welfare:findings", recordId: "finding-public-street-dog-information-fragmented",
    });
    assert.equal(explorerPathForRecord("friction-of-volunteering")?.groupId, "articles");
    assert.equal(explorerPathForRecord("canine-campus")?.collectionId, "street-dog-immediate-welfare:projects");
    const deepLink = explorerStateFromSearch("?nav=breadcrumb&group=investigation&investigation=street-dog-immediate-welfare&collection=street-dog-immediate-welfare%3Afindings&record=finding-public-street-dog-information-fragmented&view=json");
    assert.equal(deepLink.navigation, "breadcrumb");
    assert.equal(deepLink.display, "json");
    assert.equal(deepLink.investigationId, "street-dog-immediate-welfare");
    assert.equal(deepLink.collectionId, "street-dog-immediate-welfare:findings");
    assert.equal(deepLink.selectedId, "finding-public-street-dog-information-fragmented");
    const investigationLink = explorerStateFromSearch("?nav=breadcrumb&group=investigation&investigation=street-dog-immediate-welfare");
    assert.equal(investigationLink.selectedId, "street-dog-immediate-welfare");
    assert.equal(investigationLink.collectionId, null);
    const linkedEvidence = explorerStateFromSearch("?nav=breadcrumb&group=investigation&investigation=street-dog-immediate-welfare&collection=street-dog-immediate-welfare%3Afindings&via=finding-public-street-dog-information-fragmented&record=crossover-2026-11-02-sas-field-call-records-received");
    assert.equal(linkedEvidence.collectionId, "street-dog-immediate-welfare:findings");
    assert.deepEqual(linkedEvidence.recordTrail, ["finding-public-street-dog-information-fragmented"]);
    assert.equal(linkedEvidence.selectedId, "crossover-2026-11-02-sas-field-call-records-received");
    const updateLink = explorerStateFromSearch("?nav=breadcrumb&group=investigation&investigation=street-dog-immediate-welfare&collection=street-dog-immediate-welfare%3Ainvestigation-updates&record=crossover-2026-11-02-sas-field-call-records-received");
    assert.equal(updateLink.collectionId, "street-dog-immediate-welfare:investigation-updates");
    const oldUpdateLink = explorerStateFromSearch(`?nav=breadcrumb&group=updates&collection=public-updates&record=${receiptId}`);
    assert.equal(oldUpdateLink.collectionId, "investigation-updates");
  } finally {
    await vite.close();
  }
});

test("Explorer has six top-level categories and keeps Crossover and Needs independent", () => {
  assert.deepEqual(published.groups.map((group) => group.title), ["Updates", "Crossover", "Needs", "Investigations", "Stories", "Articles"]);
  const crossover = published.groups.find((group) => group.id === "organization");
  assert.equal(crossover?.title, "Crossover");
  assert.deepEqual(crossover.collectionIds, ["identity", "principles", "methods", "people"]);
  assert.deepEqual(published.groups.find((group) => group.id === "needs")?.collectionIds, ["needs"]);
  assert.equal(published.collections.find((item) => item.id === "needs")?.recordIds.length, 5);
});

test("Investigation branches use one canonical record per ID and explicit relationships", () => {
  assert.equal(published.groups.some((group) => group.id === "developments"), false);
  assert.deepEqual(published.groups.find((group) => group.id === "articles")?.collectionIds, ["articles"]);
  assert.equal(published.collections.find((item) => item.id === "articles")?.recordIds.length, 4);
  assert.equal(published.investigations.length, 1);
  const investigation = published.investigations[0];
  assert.equal(investigation.title, "Dogs on the street in Stockton");
  assert.deepEqual(investigation.collectionIds.map((id) => published.collections.find((item) => item.id === id)?.title), ["Updates", "Questions", "Tasks", "Activity", "Findings", "Articles", "Locations", "Evidence", "Improvements", "Organizations"]);
  assert.deepEqual(published.collections.find((item) => item.id === `${investigation.id}:updates`)?.childCollectionIds, [`${investigation.id}:developments`, `${investigation.id}:investigation-updates`]);
  assert.deepEqual(published.recordChildren[investigation.id], investigation.collectionIds);
  assert.equal(published.records[investigation.id].schema, "investigation");
  assert.equal(published.collections.find((item) => item.id === `${investigation.id}:projects`)?.schema, "project");
  for (const id of investigation.collectionIds) {
    const collection = published.collections.find((item) => item.id === id);
    assert.equal(collection.investigationId, investigation.id);
    assert.equal(collection.recordIds.length, new Set(collection.recordIds).size);
    for (const recordId of collection.recordIds) assert.ok(published.records[recordId]);
  }
  const child = (name) => published.collections.find((item) => item.id === `${investigation.id}:${name}`);
  assert.ok(child("developments").recordIds.includes("stocktonia-2026-10-20-animal-control-proposals"));
  assert.ok(child("investigation-updates").recordIds.includes("crossover-2026-11-02-sas-field-call-records-received"));
  assert.equal(child("findings").recordIds.length, 3);
  assert.deepEqual(child("articles").recordIds, sourceArticles.map((article) => article.id));
  for (const findingId of child("findings").recordIds) {
    const articleId = published.records[findingId].fields.article_id;
    assert.ok(child("articles").recordIds.includes(articleId));
    assert.equal(published.fieldInfo.article_id.kind, "reference");
  }
  assert.equal(child("findings").recordIds.some((id) => published.records[id].fields.article_id === "where-are-stray-dogs"), false);
  assert.deepEqual(published.records["caring-for-stocktons-dogs"].fields.related_finding_ids, ["finding-new-facilities-impact-uncertain"]);
  assert.equal(published.fieldInfo.related_finding_ids.label, "Related findings");
  assert.equal(published.fieldInfo.related_finding_ids.kind, "reference");
  assert.equal(published.records["where-are-stray-dogs"].fields.related_finding_ids, undefined);
  assert.equal(child("projects").recordIds.length, 6);
  assert.ok(child("organizations").recordIds.length > 0);
  assert.ok(child("organizations").recordIds.length < 11);
  assert.ok(child("evidence").recordIds.includes("crossover-2026-11-02-sas-field-call-records-received"));
  assert.equal(investigation.collectionIds.some((id) => id.endsWith(":workstreams")), false);
  assert.deepEqual(published.collections.find((item) => item.id === "workstreams").recordIds, sourceWorkstreams.map((item) => item.id));
  assert.equal(published.collections.find((item) => item.id === "workstreams").hidden, true);
});

test("a second investigation creates its own scoped branch without copying shared records", () => {
  const ids = new Set(["needs", "investigations", "questions", "tasks", "activities", "findings", "locations", "evidence", "projects", "organizations"]);
  const fixturePolicy = { ...policy, collections: policy.collections.filter((item) => ids.has(item.id)) };
  const { snapshot } = buildExplorerSnapshot(fixturePolicy, schemas, {
    needs: [{ id: "need-one" }, { id: "need-two" }],
    investigations: [{ id: "investigation-one", publicName: "One", gap_id: "need-one" }, { id: "investigation-two", publicName: "Two", gap_id: "need-two" }],
    questions: [{ id: "question-one", investigation_id: "investigation-one", evidence_record_ids: ["evidence-one"] }],
    tasks: [], activities: [],
    findings: [{ id: "finding-one", investigation_id: "investigation-one" }, { id: "finding-two", investigation_id: "investigation-two" }],
    locations: [],
    evidence: [{ id: "evidence-one", title: "One" }, { id: "evidence-two", title: "Two", investigation_id: "investigation-two" }, { id: "unrelated", title: "Unrelated" }],
    projects: [{ id: "shared-project", title: "Shared", gap_ids: ["need-one", "need-two"], organization_ids: ["shared-org"] }],
    organizations: [{ id: "shared-org", name: "Shared organization" }, { id: "unrelated-org", name: "Unrelated organization" }],
  });
  assert.equal(snapshot.investigations.length, 2);
  const child = (investigationId, collectionId) => snapshot.collections.find((item) => item.id === `${investigationId}:${collectionId}`).recordIds;
  assert.deepEqual(child("investigation-one", "findings"), ["finding-one"]);
  assert.deepEqual(child("investigation-two", "findings"), ["finding-two"]);
  assert.deepEqual(child("investigation-one", "evidence"), ["evidence-one"]);
  assert.deepEqual(child("investigation-two", "evidence"), ["evidence-two"]);
  assert.deepEqual(child("investigation-one", "projects"), ["shared-project"]);
  assert.deepEqual(child("investigation-two", "projects"), ["shared-project"]);
  assert.deepEqual(child("investigation-one", "organizations"), ["shared-org"]);
  assert.deepEqual(child("investigation-two", "organizations"), ["shared-org"]);
  assert.deepEqual(snapshot.recordChildren["investigation-one"], snapshot.investigations[0].collectionIds);
  assert.deepEqual(snapshot.recordChildren["investigation-two"], snapshot.investigations[1].collectionIds);
  assert.equal(Object.keys(snapshot.records).filter((id) => id === "shared-project").length, 1);
});

test("published article text and project states survive the public projection", () => {
  for (const article of sourceArticles.filter((item) => item.published)) {
    const fields = published.records[article.id].fields;
    assert.deepEqual(fields.content, article.content);
    assert.equal(fields.path, article.path);
  }
  for (const project of sourceProjects) {
    const fields = published.records[project.id].fields;
    for (const key of ["intended_outcome", "development_stage", "operational_status", "funding_status", "capacity_summary", "expected_capacity_or_benefit", "actual_additional_capacity", "milestones", "evidence_record_ids", "open_questions", "next_verification_step", "last_verified_at"]) {
      assert.deepEqual(fields[key], project[key], `${project.id}.${key}`);
    }
  }
});

test("nested article publication permits only declared public text fields", () => {
  const articleCollection = policy.collections.find((item) => item.id === "articles");
  const fixture = { id: "article-fixture", title: "Public", content: { introduction: "Intro", private_note: "secret", sections: [{ heading: "Section", paragraphs: ["Text"], links: [{ label: "Source", url: "https://example.org", private_contact: "secret" }], internal_note: "secret" }] } };
  const { snapshot } = buildExplorerSnapshot({ ...policy, groups: [{ id: "articles", title: "Articles" }], collections: [articleCollection] }, schemas, { articles: [fixture] });
  assert.deepEqual(snapshot.records[fixture.id].fields.content, { introduction: "Intro", sections: [{ heading: "Section", paragraphs: ["Text"], links: [{ label: "Source", url: "https://example.org" }] }] });
  assert.equal(JSON.stringify(snapshot).includes("secret"), false);
});

test("project milestones publish public details without nested internal notes", () => {
  const projectCollection = policy.collections.find((item) => item.id === "projects");
  const fixture = { id: "project-fixture", title: "Public", milestones: [{ date: "2026-11-02", status: "planned", description: "Public plan", evidence_record_ids: [], internal_note: "secret" }] };
  const { snapshot } = buildExplorerSnapshot({ ...policy, groups: [{ id: "projects", title: "Improvements" }], collections: [projectCollection] }, schemas, { projects: [fixture] });
  assert.deepEqual(snapshot.records[fixture.id].fields.milestones, [{ date: "2026-11-02", status: "planned", description: "Public plan", evidence_record_ids: [] }]);
  assert.equal(JSON.stringify(snapshot).includes("secret"), false);
});
