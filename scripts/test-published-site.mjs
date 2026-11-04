import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { Script } from "node:vm";

const read = (path) => readFile(path, "utf8");
const escapeHtml = (value) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const feed = JSON.parse(await read("public/data/records.json"));
const records = Object.values(feed.records);
const organizations = records.filter(({ schema }) => schema === "organization");

test("every article publishes its complete text as readable HTML", async () => {
  const articles = records.filter(({ schema }) => schema === "article");
  assert.ok(articles.length > 0);
  for (const article of articles) {
    const page = await read(`dist/record/${article.id}/index.html`);
    const readablePage = page.replace(/<span class="civic-heart">♥<\/span>/g, "♥");
    const content = article.fields.content;
    assert.ok(page.includes('<article class="article-content">'), article.id);
    assert.ok(page.includes(`<p class="article-lede">${escapeHtml(content.introduction)}</p>`), article.id);
    for (const [index, section] of content.sections.entries()) {
      assert.ok(page.includes(`<section id="article-section-${index + 1}"><h2>${escapeHtml(section.heading)}</h2>`), `${article.id}: ${section.heading}`);
      for (const paragraph of section.paragraphs ?? []) assert.ok(readablePage.includes(`<p>${escapeHtml(paragraph)}</p>`), `${article.id}: missing paragraph`);
      for (const link of section.links ?? []) assert.ok(page.includes(escapeHtml(link.display_label || link.label || "Read source")), `${article.id}: missing source link`);
    }
    for (const id of article.fields.related_location_ids ?? []) {
      const place = feed.records[id];
      assert.ok(page.includes(`<a href="/record/${id}/">${escapeHtml(place.title)}</a>`), `${article.id}: ${id} place label`);
    }
  }
});

test("Needs leads to a listing of every published article", async () => {
  const articles = records.filter(({ schema }) => schema === "article");
  const needs = await read("dist/needs/index.html");
  const index = await read("dist/articles/index.html");
  const investigation = await read("dist/investigation/index.html");
  assert.ok(investigation.includes('<a class="articles-cta" href="/articles/">Read articles →</a>'));
  const section = needs.split('<h2>Articles on these needs</h2>')[1]?.split('<h2>Work taking shape</h2>')[0];
  assert.ok(section, "Needs has an Articles section before Responses");
  assert.ok(section.includes('href="/articles/">All articles</a>'));
  assert.ok(section.includes('href="/record/public-access-to-stray-dog-information/"'));
  assert.ok(section.includes('href="/record/where-are-stray-dogs/"'));
  assert.ok(index.includes('<a href="/needs/" aria-current="page">Needs</a>'));
  assert.ok(index.indexOf('href="/record/public-access-to-stray-dog-information/"') < index.indexOf('href="/record/where-are-stray-dogs/"'), "the November 4 update appears first");
  for (const article of articles) {
    assert.ok(index.includes(`<a href="/record/${article.id}/">${escapeHtml(article.title)}</a>`), article.id);
    const page = await read(`dist/record/${article.id}/index.html`);
    assert.ok(page.includes('<a href="/needs/" aria-current="page">Needs</a>'), article.id);
    assert.ok(page.includes('<a href="/articles/">Articles</a> / <span aria-current="page">'), article.id);
  }
});

test("records-access article preserves its publication date and dated development", async () => {
  const article = feed.records["public-access-to-stray-dog-information"];
  const page = await read(`dist/record/${article.id}/index.html`);
  assert.equal(article.fields.date, "2026-10-30");
  assert.equal(article.fields.last_updated_at, "2026-11-04");
  assert.match(page, /Originally published Oct 30, 2026 · Last updated Nov 4, 2026/);
  assert.match(page, /Editor&#39;s update — November 4, 2026/);
  assert.match(page, /spreadsheet on November 2/);
  assert.match(page, /7,183 case records/);
  assert.match(page, /<span class="civic-heart">♥<\/span> We appreciate the department&#39;s cooperation and the work involved in making these records available\./);
  assert.match(page, /href="\/record\/crossover-2026-11-02-sas-field-call-records-received\/"/);
  assert.doesNotMatch(page, /result remains pending|examine the field-call records if provided/);
});

test("the root and every feed record have readable HTML with normal URLs", async () => {
  const root = await read("dist/index.html");
  assert.equal(await read("index.html"), root);
  assert.match(root, /<main id="main"[^>]*>[\s\S]*?<h1>See clearly/);
  assert.doesNotMatch(root, /href="#\//);
  assert.doesNotMatch(root, /href="\?page=/);
  assert.doesNotMatch(root, /<script id="feed-data"/);
  assert.doesNotMatch(root, /data:image\/[^\s"]+;base64/);
  assert.match(root, /<script src="\/static-navigation\.js\?v=[a-f0-9]{12}" defer><\/script>/);
  const navigationScript = await read("dist/static-navigation.js");
  assert.equal(navigationScript, await read("public/static-navigation.js"));
  new Script(navigationScript, { filename: "static-navigation.js" });
  for (const section of ["needs", "investigation", "articles", "activity", "responses", "organizations", "places", "explore", "about"]) {
    const page = await read(`dist/${section}/index.html`);
    assert.match(page, /<main id="main"[^>]*>\s*\S/, section);
    assert.doesNotMatch(page, /href="#\//, section);
    assert.doesNotMatch(page, /href="\?page=/, section);
    assert.doesNotMatch(page, /<script id="feed-data"/, section);
  }
  const explore = await read("dist/explore/index.html");
  assert.equal(explore.match(/class="record-row"/g)?.length, records.length);
  assert.match(explore, /id="explore-search"/);
  assert.match(explore, /id="explore-type"/);
  assert.match(explore, /id="explore-sort"/);
  assert.ok(explore.includes(`</div><p class="explore-count" id="explore-count" role="status" aria-live="polite">${records.length} of ${records.length} records</p>`));
  assert.match(explore, /class="record-row" data-schema="/);
  assert.doesNotMatch(explore, /Search and sort in the interactive version/);
  for (const record of records) {
    const path = `dist/record/${encodeURIComponent(record.id)}/index.html`;
    const page = await read(path);
    assert.match(page, /<main id="main"[^>]*>[\s\S]*?<h1/, path);
    assert.ok(page.includes(escapeHtml(record.title)), path);
    assert.doesNotMatch(page, /href="#\//, path);
    assert.doesNotMatch(page, /href="\?page=/, path);
  }
  for (const organization of organizations) {
    const page = await read(`dist/organization/${encodeURIComponent(organization.id)}/index.html`);
    assert.ok(page.includes("Documented Crossover contact"), organization.id);
  }
  for (const [id, section, label] of [
    ["dogs-safe-placement", "needs", "Needs"],
    ["crossover-2026-10-14-sas-volunteer-application", "activity", "Activity"],
    ["crossover-2026-10-14-sas-first-visit", "explore", "Explore"],
  ]) {
    const page = await read(`dist/record/${id}/index.html`);
    assert.ok(page.includes(`<a href="/${section}/" aria-current="page">${label}</a>`), `${id} top navigation`);
    assert.ok(page.includes(`<nav class="wrap breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/${section}/">${label}</a> / <span aria-current="page">`), `${id} breadcrumb`);
  }
  const responsePage = await read("dist/record/streetdogs-fed-70-animals/index.html");
  assert.ok(responsePage.includes('<a href="/needs/" aria-current="page">Needs</a>'), "related story highlights Needs");
  assert.ok(responsePage.includes('<a href="/responses/">Responses</a> / <span aria-current="page">'), "related story keeps its Responses breadcrumb");
  const placePage = await read("dist/record/weston-ranch-carrie-street/index.html");
  assert.ok(placePage.includes('<a href="/places/">Places</a> / <span aria-current="page">'), "place breadcrumb remains available");
  const mainNav = placePage.match(/<nav class="nav" id="site-nav"[^>]*>[\s\S]*?<\/nav>/)?.[0];
  const footerNav = placePage.match(/<nav[^>]*id="footer-nav"[^>]*>[\s\S]*?<\/nav>/)?.[0];
  assert.ok(mainNav && footerNav, "both menus are present");
  assert.doesNotMatch(mainNav, />Places<\/a>/, "Places is absent from the main navigation");
  assert.doesNotMatch(footerNav, />Places<\/a>/, "Places is absent from the footer navigation");
  assert.doesNotMatch(mainNav, />Organizations<\/a>/, "Organizations is absent from the main navigation");
  assert.doesNotMatch(footerNav, />Organizations<\/a>/, "Organizations is absent from the footer navigation");
  assert.doesNotMatch(mainNav, />Responses<\/a>/, "Responses is absent from the main navigation");
  assert.doesNotMatch(footerNav, />Responses<\/a>/, "Responses is absent from the footer navigation");
  assert.doesNotMatch(mainNav, />Articles<\/a>/, "Articles is absent from the main navigation");
  assert.doesNotMatch(footerNav, />Articles<\/a>/, "Articles is absent from the footer navigation");
  for (const id of ["stockton-animal-services-shelter", "st-marys-community-services-campus"]) {
    const embed = feed.records[id].fields.map_reference.embed_url;
    const page = await read(`dist/record/${id}/index.html`);
    assert.match(embed, /^https:\/\/www\.google\.com\/maps\/embed\?pb=/);
    assert.ok(page.includes(`<iframe class="location-map" title="Map of ${escapeHtml(feed.records[id].title)}" src="${escapeHtml(embed)}"`), `${id} embedded map`);
    assert.equal((page.match(/Open on Google Maps ↗/g) || []).length, 1, `${id} has one Google Maps button`);
    assert.match(page, /<div class="detail-section location-detail">[\s\S]*?<iframe class="location-map"/, `${id} mobile map sits in the location section`);
    assert.match(page, /<aside class="detail-aside"><a class="btn map"[^>]*>Open on Google Maps ↗<\/a>/, `${id} desktop button remains in the aside`);
  }
  const broadPlace = await read("dist/record/weston-ranch-carrie-street/index.html");
  assert.doesNotMatch(broadPlace, /<iframe class="location-map"/);
  assert.match(broadPlace, /<h2>[^<]+<\/h2><a class="btn map mobile-map-action"[^>]*>Open on Google Maps ↗<\/a>/, "unembedded places retain a near-top mobile link");
  assert.deepEqual(JSON.parse(await read("dist/data/records.json")), feed);
  assert.equal((await read("dist/CNAME")).trim(), "crossoverstockton.org");
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

test("About uses the published identity statements and existing images", async () => {
  const statements = feed.records["crossover-stockton"].fields.statements;
  const source = JSON.parse(await read("src/data/crossover.json")).identity.statements;
  assert.deepEqual(statements, source);
  const page = await read("dist/about/index.html");
  for (const key of ["missionQuestion", "opportunity", "startingApproach", "animalCareInvestigation", "presencePractice", "publicCommitment"]) {
    assert.ok(page.includes(escapeHtml(statements[key])), key);
  }
  for (const image of ["about-crossover-hero.jpg", "guy-dog.jpg", "techno.jpg", "notebook.jpg", "hands.jpg", "about-the-founder.jpg"]) {
    assert.ok(page.includes(`/images/about/${image}`), image);
  }
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

test("open actions have no displayed date; completed actions use completion dates", async () => {
  const actions = records.filter(({ schema }) => schema === "action");
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

test("every action publishes its source instructions on its record page", async () => {
  const sourceActions = JSON.parse(await read("src/data/actions.json"));
  assert.equal(sourceActions.length, 12);
  for (const action of sourceActions) {
    const record = feed.records[action.id];
    const page = await read(`dist/record/${action.id}/index.html`);
    assert.equal(record.fields.instructions, action.instructions, `${action.id} instructions in feed`);
    assert.ok(page.includes(`<h2>Instructions</h2><p>${escapeHtml(action.instructions)}</p>`), `${action.id} instructions on page`);
  }
});

test("need pages show public record points and their linked claims", async () => {
  for (const need of records.filter(({ schema }) => schema === "need")) {
    const page = await read(`dist/record/${need.id}/index.html`);
    assert.ok(need.fields.what_we_are_seeing?.length, `${need.id} public record points`);
    assert.match(page, /<h2>What the public record shows<\/h2>/);
    for (const point of need.fields.what_we_are_seeing) {
      assert.ok(page.includes(`<li>${escapeHtml(point)}</li>`), `${need.id} point appears on page`);
    }
    for (const claim of records.filter(({ schema, fields }) => schema === "claim" && fields.needId === need.id)) {
      assert.ok(page.includes(`/record/${claim.id}/`), `${need.id} links claim ${claim.id}`);
      for (const sourceId of claim.fields.sourceRecordIds ?? []) {
        assert.ok(page.includes(`/record/${sourceId}/`), `${claim.id} links source ${sourceId}`);
      }
    }
  }
});

test("objective pages place supporting records in the main column", async () => {
  for (const objective of records.filter(({ schema }) => schema === "objective")) {
    const page = await read(`dist/record/${objective.id}/index.html`);
    const mainColumn = page.split('<div class="wrap detail-grid"><div>')[1]?.split('</div><aside class="detail-aside">')[0];
    const sidebar = page.split('<aside class="detail-aside">')[1]?.split('</aside>')[0];
    assert.ok(mainColumn && sidebar, `${objective.id} has both columns`);
    for (const [field, heading] of [
      ["finding_ids", "Findings"],
      ["evidence_record_ids", "Evidence"],
      ["activity_record_ids", "Documented Crossover activity"],
      ["action_ids", "Next actions"],
    ]) {
      if (!objective.fields[field]?.length) continue;
      assert.ok(mainColumn.includes(`<h2>${heading}</h2>`), `${objective.id} ${heading} section`);
      for (const id of objective.fields[field]) {
        assert.ok(mainColumn.includes(`/record/${id}/`), `${objective.id} links ${id} in main column`);
        assert.ok(!sidebar.includes(`/record/${id}/`), `${objective.id} does not duplicate ${id} in sidebar`);
      }
    }
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
    assert.ok(page.includes(`Open on Google Maps ↗`), organization.id);
    const placePage = await read(`dist/record/${placeId}/index.html`);
    assert.ok(placePage.includes(`<h3>Organization</h3><a href="/organization/${organization.id}/">${escapeHtml(organization.title)}</a>`), placeId);
  }
});

test("Investigation provides the path to related organizations and the full directory", async () => {
  const investigation = await read("dist/investigation/index.html");
  const directory = await read("dist/organizations/index.html");
  const organizationIds = feed.records[feed.records["street-dog-immediate-welfare"].fields.gap_id].fields.organization_ids;
  const section = investigation.split('<section class="section" id="organizations">')[1]?.split('<section class="section" id="locations">')[0];
  assert.ok(section, "Organizations section precedes Places");
  assert.ok(investigation.includes('<a href="#organizations">Organizations</a><a href="#locations">Places</a>'));
  assert.ok(section.includes('href="/organizations/">All organizations</a>'));
  for (const id of organizationIds) assert.ok(section.includes(`href="/organization/${id}/"`), id);
  assert.ok(directory.includes('<a href="/investigation/" aria-current="page">Investigation</a>'));
  assert.ok((await read("dist/organization/stockton-animal-services/index.html")).includes('<a href="/investigation/" aria-current="page">Investigation</a>'));
});

test("Needs provides the path to related responses and the full Responses page", async () => {
  const needs = await read("dist/needs/index.html");
  const responses = await read("dist/responses/index.html");
  const section = needs.split('<h2>Work taking shape</h2>')[1];
  assert.ok(section, "Needs includes a responses section");
  assert.ok(section.includes('href="/responses/">All responses</a>'));
  const previewIds = [...new Set([...section.matchAll(/href="\/record\/([^/]+)\/"/g)].map((match) => match[1]))];
  const needIds = new Set(records.filter(({ schema }) => schema === "need").map(({ id }) => id));
  assert.ok(previewIds.some((id) => feed.records[id]?.schema === "project"), "a linked project appears");
  assert.ok(previewIds.some((id) => feed.records[id]?.schema === "story"), "a linked story appears");
  for (const id of previewIds) assert.ok(feed.records[id].fields.gap_ids.some((needId) => needIds.has(needId)), `${id} links to a published need`);
  assert.ok(responses.includes('<a href="/needs/" aria-current="page">Needs</a>'));
});

test("Need status badges link only to a documented investigation", async () => {
  const index = await read("dist/needs/index.html");
  const investigating = await read("dist/record/dogs-safe-placement/index.html");
  const identified = await read("dist/record/pet-inclusive-shelter/index.html");
  const linkedBadge = /<a class="pill dark" href="\/investigation\/"[^>]*>Investigating →<\/a>/;
  assert.match(index, linkedBadge);
  assert.match(investigating, linkedBadge);
  assert.match(identified, /<div class="meta"><span class="pill ">Identified<\/span>/);
});

test("the sitemap lists every canonical page and legacy URLs lead to clean paths", async () => {
  const sitemap = await read("dist/sitemap.xml");
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  assert.equal(urls.length, 10 + records.length);
  assert.ok(urls.includes("https://crossoverstockton.org/articles/"));
  assert.ok(urls.includes("https://crossoverstockton.org/organizations/"));
  assert.ok(urls.includes("https://crossoverstockton.org/organization/stockton-animal-services/"));
  assert.ok(!urls.some((url) => url.includes("#") || url.includes("?page=")));
  assert.ok((await read("dist/robots.txt")).includes("Sitemap: https://crossoverstockton.org/sitemap.xml"));
  const redirects = [
    ["dist/work/dogs/findings/index.html", "/investigation/"],
    ["dist/work/dogs/map/index.html", "/places/"],
    ["dist/data/index.html", "/explore/"],
    ["dist/work/index.html", "/responses/"],
  ];
  const article = records.find(({ schema, fields }) => schema === "article" && fields.path);
  assert.ok(article);
  redirects.push([`dist${article.fields.path}index.html`, `/record/${encodeURIComponent(article.id)}/`]);
  for (const [path, target] of redirects) assert.ok((await read(path)).includes(`url=${target}`), path);
});
