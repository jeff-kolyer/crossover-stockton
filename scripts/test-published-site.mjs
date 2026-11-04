import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { Script } from "node:vm";

const read = (path) => readFile(path, "utf8");
const escapeHtml = (value) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const feed = JSON.parse(await read("public/data/records.json"));
const records = Object.values(feed.records);
const organizations = records.filter(({ schema }) => schema === "organization");

test("the root and every feed record have readable HTML with normal URLs", async () => {
  const root = await read("dist/index.html");
  assert.equal(await read("index.html"), root);
  assert.match(root, /<main id="main"[^>]*>[\s\S]*?<h1>See clearly/);
  assert.match(root, /href="\/organizations\/"/);
  assert.doesNotMatch(root, /href="#\//);
  assert.doesNotMatch(root, /href="\?page=/);
  assert.doesNotMatch(root, /<script id="feed-data"/);
  assert.doesNotMatch(root, /data:image\/[^\s"]+;base64/);
  const staticScript = [...root.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)?.[1];
  assert.ok(staticScript);
  new Script(staticScript, { filename: "static-site.html" });
  for (const section of ["needs", "investigation", "activity", "responses", "organizations", "places", "explore", "about"]) {
    const page = await read(`dist/${section}/index.html`);
    assert.match(page, /<main id="main"[^>]*>\s*\S/, section);
    assert.doesNotMatch(page, /href="#\//, section);
    assert.doesNotMatch(page, /href="\?page=/, section);
    assert.doesNotMatch(page, /<script id="feed-data"/, section);
  }
  assert.equal((await read("dist/explore/index.html")).match(/class="record-row"/g)?.length, records.length);
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

test("the sitemap lists every canonical page and legacy URLs lead to clean paths", async () => {
  const sitemap = await read("dist/sitemap.xml");
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  assert.equal(urls.length, 9 + records.length);
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
