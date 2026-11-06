import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { Script } from "node:vm";

const read = (path) => readFile(path, "utf8");
const escapeHtml = (value) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const feed = JSON.parse(await read("public/data/records.json"));
const records = Object.values(feed.records);
const organizations = records.filter(({ schema }) => schema === "organization");

test("retired articles and stories are absent while supporting records remain", async () => {
  assert.equal(records.filter(({ schema }) => schema === "article" || schema === "story").length, 0);
  const finding = feed.records["finding-public-street-dog-information-fragmented"];
  assert.ok(finding.fields.supporting_record_ids.length > 0);
  assert.equal(finding.fields.article_id, undefined);
  const shelter = feed.records["sas-2024-kennel-statistics"];
  assert.ok(shelter.fields.context_sources.some(({ url }) => url.includes("k643-feip")));
  const oldArticle = await read("dist/articles/public-access-to-stray-dog-information/index.html");
  assert.ok(oldArticle.includes('content="0;url=/gaps/street-dogs/findings/"'));
});

test("findings show analysis with their supporting records and related work", async () => {
  const page = await read("dist/gaps/street-dogs/findings/index.html");
  for (const finding of records.filter(({ schema }) => schema === "finding")) {
    assert.ok(page.includes(escapeHtml(finding.fields.statement)), finding.id);
    assert.ok(page.includes(escapeHtml(finding.fields.limitations)), finding.id);
    for (const id of [...finding.fields.supporting_record_ids, ...finding.fields.objective_ids, ...finding.fields.related_task_ids]) {
      assert.ok(page.includes(`/record/${id}/`), `${finding.id} links ${id}`);
    }
  }
});

test("the one-file interactive version remains available without hash route links", async () => {
  const preview = await read("public/preview/one-file-site.html");
  const interactive = await read("dist/interactive/index.html");
  assert.ok(interactive.includes(preview.slice(-500)));
  assert.match(interactive, /<meta name="robots" content="noindex,follow">/);
  assert.doesNotMatch(preview, /href="#\//);
  assert.match(preview, /\?page=organizations/);
  assert.deepEqual((await readdir("dist")).filter((name) => name === "assets"), []);
});

test("About uses the published identity statements without the old photographs", async () => {
  const statements = feed.records["crossover-stockton"].fields.statements;
  const source = JSON.parse(await read("src/data/crossover.json")).identity.statements;
  assert.deepEqual(statements, source);
  const page = await read("dist/about/index.html");
  for (const key of ["missionQuestion", "opportunity", "startingApproach", "animalCareInvestigation", "presencePractice", "publicCommitment"]) {
    assert.ok(page.includes(escapeHtml(statements[key])), key);
  }
  assert.doesNotMatch(page, /src="\/images\/about\//);
});

test("the St. Mary's action publishes instructions without an invented date", async () => {
  const id = "task-verify-st-marys-church-street-dog-scale";
  const record = feed.records[id];
  const page = await read(`dist/record/${id}/index.html`);
  assert.equal(record.dateForSort, undefined);
  assert.equal(record.fields.completed_at, undefined);
  assert.ok(record.fields.instructions);
  assert.equal(record.fields.public_instructions, undefined);
  assert.ok(page.includes(`<h2>Instructions</h2><p>${escapeHtml(record.fields.instructions)}</p>`));
  assert.doesNotMatch(page, /Created \(estimated\)|Est\. created|Undated/);
});

test("open tasks have no displayed date; completed tasks use completion dates", async () => {
  const actions = records.filter(({ schema }) => schema === "task");
  assert.equal(actions.length, 12);
  for (const action of actions) {
    assert.equal(action.fields.estimated_created_at, undefined);
    assert.equal(action.fields.creation_date_basis, undefined);
    assert.equal(action.fields.recorded_at, undefined);
    assert.equal(action.dateForSort?.field, action.fields.completed_at ? "completed_at" : undefined);
    const page = await read(`dist/record/${action.id}/index.html`);
    assert.doesNotMatch(page, /Created \(estimated\)|Est\. created/);
  }
  const activity = await read("dist/activity/index.html");
  assert.match(activity, /class="row undated-action"><div><h3>/);
  assert.doesNotMatch(activity, /class="row-date">Undated<\/span>/);
});

test("every task publishes its source instructions on its record page", async () => {
  const sourceActions = JSON.parse(await read("src/data/tasks.json"));
  assert.equal(sourceActions.length, 12);
  for (const action of sourceActions) {
    const record = feed.records[action.id];
    const page = await read(`dist/record/${action.id}/index.html`);
    assert.equal(record.fields.instructions, action.instructions, `${action.id} instructions in feed`);
    assert.ok(page.includes(`<h2>Instructions</h2><p>${escapeHtml(action.instructions)}</p>`), `${action.id} instructions on page`);
  }
});

test("the overview and metrics keep points, claims, and source links", async () => {
  for (const need of records.filter(({ schema }) => schema === "gap")) {
    const project = { id: need.fields.slug };
    const page = await read(`dist/gaps/${project.id}/overview/index.html`);
    const metrics = await read(`dist/gaps/${project.id}/metrics/index.html`);
    assert.ok(need.fields.what_we_are_seeing?.length, `${need.id} public record points`);
    assert.match(page, /<summary>What the public record shows<\/summary>/);
    for (const point of need.fields.what_we_are_seeing) {
      assert.ok(page.includes(`<li>${escapeHtml(point)}</li>`), `${need.id} point appears on page`);
    }
    for (const claim of records.filter(({ schema, fields }) => schema === "claim" && fields.gap_id === need.id)) {
      assert.ok(metrics.includes(`/record/${claim.id}/`), `${need.id} links claim ${claim.id}`);
      const claimPage = await read(`dist/record/${claim.id}/index.html`);
      for (const sourceId of claim.fields.sourceRecordIds ?? []) {
        assert.ok(claimPage.includes(`/record/${sourceId}/`), `${claim.id} links source ${sourceId}`);
      }
    }
  }
});

test("objective pages retain the guiding questions and related work", async () => {
  const page = await read("dist/gaps/street-dogs/objectives/index.html");
  for (const objective of records.filter(({ schema }) => schema === "objective")) {
    for (const question of objective.fields.guiding_questions) assert.ok(page.includes(escapeHtml(question.title)));
    for (const id of objective.fields.task_ids) assert.ok(page.includes(`/record/${id}/`));
  }
});

test("organizations and their documented places link to each other", async () => {
  for (const organization of organizations) {
    const placeId = organization.fields.map_location_id;
    const page = await read(`dist/organization/${organization.id}/index.html`);
    if (!placeId) {
      assert.doesNotMatch(page, /<h2>Place<\/h2>/, organization.id);
      continue;
    }
    const place = feed.records[placeId];
    assert.equal(place?.schema, "location", organization.id);
    assert.match(page, new RegExp(`<h2>Place<\\/h2>[\\s\\S]*?href="/record/${placeId}/"`), organization.id);
    assert.ok(page.includes('Open on Google Maps <svg class="external-arrow"'), organization.id);
    const placePage = await read(`dist/record/${placeId}/index.html`);
    assert.ok(placePage.includes(`<h3>Organization</h3><a href="/organization/${organization.id}/">${escapeHtml(organization.title)}</a>`), placeId);
  }
});

test("the homepage opens the default gap's full-width workspace", async () => {
  const root = await read("dist/index.html");
  assert.equal(await read("index.html"), root);
  assert.deepEqual(Object.values(feed.records).filter(({schema}) => schema === "gap").map(({fields}) => fields.slug), ["street-dogs"]);
  assert.equal(Object.values(feed.records).find(({schema}) => schema === "gap").fields.default, true);
  assert.ok(root.includes('href="/preview/ai-variant-modern.css"'));
  assert.ok(root.includes('src="/preview/ai-variant.js"'));
  assert.ok(root.includes('href="https://crossoverstockton.org/"'));
  assert.ok(!root.includes('content="noindex,nofollow"'));
  const app = await read("dist/preview/ai-variant.js");
  assert.ok(app.includes("r.fields?.list_context"));
  assert.ok(app.includes("work-in_progress" ) || app.includes("work-${r.fields.status}"));
  new Script(app, { filename: "ai-variant.js" });
  new Script(await read("dist/static-navigation.js"), { filename: "static-navigation.js" });
});

test("each gap view is a separate full-width page with a sidebar", async () => {
  const views = ["overview", "objectives", "metrics", "activity", "places", "organizations", "initiatives", "findings", "sources"];
  const list = await read("dist/gaps/index.html");
  assert.ok(list.includes('href="/gaps/street-dogs/overview/"'));
  assert.ok(!list.includes("pet-inclusive-shelter"));
  const app = await read("dist/preview/ai-variant.js");
  assert.ok(app.includes("const sections = ['overview','objectives','metrics','activity','places','organizations','initiatives','findings','sources']"));
  for (const view of views) {
    const page = await read(`dist/gaps/street-dogs/${view}/index.html`);
    assert.ok(page.includes('class="need-workspace"'), view);
    assert.ok(page.includes('class="need-sidebar"'), view);
    assert.ok(page.includes('class="need-sidebar-brand"'), view);
    assert.ok(page.includes('class="need-sidebar-brand" href="/gaps/street-dogs/overview/"'), view);
    assert.ok(page.includes('class="need-mobile-project-title" href="/gaps/street-dogs/overview/"'), view);
    assert.ok(page.includes('class="need-mobile-project-title"'), view);
    assert.ok(page.includes('aria-label="Street dogs and access to care overview"'), view);
    assert.ok(!page.includes('<span>CROSSOVER<br>STOCKTON</span>'), view);
    assert.ok(page.includes('body:has(.need-workspace) .site-header{display:none}'), view);
    assert.ok(page.includes('id="sidebar-toggle" type="button"'), view);
    assert.ok(page.includes('class="need-sidebar-divider"'), view);
    assert.ok(!page.includes('>All activity</span></a>'), view);
    assert.ok(!page.includes('>Explore sources</span></a>'), view);
    assert.ok(page.includes(`href="/gaps/street-dogs/${view}/" aria-current="page"`), view);
  }
  const picture = await read("dist/gaps/street-dogs/overview/index.html");
  assert.ok(picture.includes('<h1>Overview</h1>'));
  assert.equal((picture.match(/<h1>/g) ?? []).length, 1);
  assert.ok(picture.includes("The current picture"));
  assert.ok(picture.includes("Latest updates"));
  assert.ok(picture.includes("What we’re working to establish"));
  assert.ok(picture.includes("Public feed records"));
  const objectives = await read("dist/gaps/street-dogs/objectives/index.html");
  assert.ok(objectives.includes("Establish the extent of the problem"));
  assert.ok(objectives.includes("Questions we are working through"));
  assert.ok(objectives.includes("Related work and evidence"));
  assert.ok(objectives.includes('href="/gaps/">'));
  assert.ok(objectives.includes('href="/about/">'));
  for (const objective of records.filter(({ schema }) => schema === "objective")) {
    assert.ok(objectives.includes(escapeHtml(objective.title)), objective.id);
    for (const field of ["task_ids", "measurement_ids", "initiative_ids"]) {
      for (const id of objective.fields[field] ?? []) assert.ok(objectives.includes(`/record/${id}/`), `${objective.id} links ${id}`);
    }
  }
  const metrics = await read("dist/gaps/street-dogs/metrics/index.html");
  assert.ok(metrics.includes("Measurement details"));
  assert.ok(metrics.includes("Source record"));
  assert.ok(!metrics.includes("Animal Services field-call case records received"));
  const activity = await read("dist/gaps/street-dogs/activity/index.html");
  assert.ok(activity.includes("<h2>Tasks</h2>"));
  assert.ok(activity.includes("<h2>Field reports</h2>"));
  assert.ok(activity.includes('/record/crossover-2026-10-14-sas-first-visit/'));
  assert.ok(activity.includes('/record/crossover-2026-10-14-sas-volunteer-application/'));
  const retiredReports = await read("dist/gaps/street-dogs/reports/index.html");
  assert.ok(retiredReports.includes('content="0;url=/gaps/street-dogs/activity/#field-reports"'));
  for (const [oldView, nextView] of [["questions", "objectives"], ["numbers", "metrics"]]) {
    const retired = await read(`dist/gaps/street-dogs/${oldView}/index.html`);
    assert.ok(retired.includes(`content="0;url=/gaps/street-dogs/${nextView}/"`));
  }
  const sources = await read("dist/gaps/street-dogs/sources/index.html");
  assert.ok(sources.includes("source records relate to this gap"));
  const initiatives = await read("dist/gaps/street-dogs/initiatives/index.html");
  assert.ok(initiatives.includes("<h1>Initiatives</h1>"));
  assert.ok(initiatives.includes("Canine Campus"));
  const retired = await read("dist/gaps/street-dogs/projects/index.html");
  assert.ok(retired.includes('content="0;url=/gaps/street-dogs/initiatives/"'));
});

test("public routes and source records remain readable", async () => {
  for (const section of ["gaps", "activity", "places", "explore", "organizations", "about"]) {
    const page = await read("dist/" + section + "/index.html");
    assert.ok(page.includes('<main id="main"'), section);
    assert.ok(page.includes('class="need-sidebar"'), section);
    assert.ok(page.includes('class="need-mobile-project-title"'), section);
  }
  for (const record of records) {
    const page = await read("dist/record/" + encodeURIComponent(record.id) + "/index.html");
    if (record.schema === "gap") assert.ok(page.includes('content="0;url=/gaps/street-dogs/overview/"'));
    else {
      assert.ok(page.includes(escapeHtml(record.title)), record.id);
      assert.ok(page.includes('class="need-sidebar"'), record.id);
    }
    assert.ok(!page.includes('href="#/'), record.id);
  }
  const explore = await read("dist/explore/index.html");
  assert.equal(explore.match(/class="record-row"/g)?.length, records.length);
  assert.deepEqual(JSON.parse(await read("dist/data/records.json")), feed);
});

test("retired routes lead to current pages", async () => {
  for (const [route, target] of [["investigation", "/"], ["investigation/activity", "/activity/"], ["investigation/evidence", "/explore/"], ["action", "/activity/"]]) {
    const page = await read("dist/" + route + "/index.html");
    assert.ok(page.includes('content="0;url=' + target + '"'), route);
  }
  const formerProject = await read("dist/projects/street-dogs/sources/index.html");
  assert.ok(formerProject.includes('content="0;url=/gaps/street-dogs/sources/"'));
  const sitemap = await read("dist/sitemap.xml");
  assert.ok(!sitemap.includes("/investigation/"));
  assert.ok(sitemap.includes("/gaps/street-dogs/"));
  assert.ok(!sitemap.includes("/projects/street-dogs/"));
  assert.ok(!sitemap.includes("/needs/"));
  assert.ok(sitemap.includes("/places/"));
});
