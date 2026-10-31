import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const dist = new URL("../dist/", import.meta.url);
const gaps = JSON.parse(await readFile(new URL("../src/data/gaps.json", import.meta.url), "utf8"));
const base = "/reality/too-many-dogs-still-lack-safe-placement/";
const sitemap = await readFile(new URL("sitemap.xml", dist), "utf8");
const paths = [...sitemap.matchAll(/<loc>https:\/\/crossoverstockton\.org([^<]+)<\/loc>/g)].map((match) => match[1]);
const oldWork = new Map([
  ["dogs-public-source-review", `${base}#gap-sources`],
  ["dogs-map-placement-barriers", "/work/dogs/findings/"],
  ["dogs-solutions", `${base}#gap-known`],
  ["dogs-direct-field-work", "/work/dogs/activity/"],
  ["dogs-locations-map", "/work/dogs/map/"],
]);

async function expectRedirect(path, target) {
  const html = await readFile(new URL(`.${path}index.html`, dist), "utf8");
  assert.ok(html.includes(`content="0; url=${target}"`), `${path}: redirect missing`);
  assert.ok(!paths.includes(path), `${path}: old URL remains in sitemap`);
}

for (const [workId, target] of oldWork) await expectRedirect(`/work/${workId}/`, target);
await expectRedirect("/action/look-for-dogs-on-the-street/", "/work/dogs/");
for (const gap of gaps.filter((item) => item.active)) {
  const root = `/reality/${gap.slug}/`;
  for (const [section, anchor] of Object.entries({ "key-factors": "gap-unknown", "ways-to-help": "gap-responders", improvements: "gap-known", research: "gap-sources", sources: "gap-sources", updates: "gap-known" })) {
    await expectRedirect(`${root}${section}/`, `${root}#${anchor}`);
  }
  if (gap.id !== "dogs-safe-placement") await expectRedirect(`${root}our-findings/`, `${root}#gap-known`);
}
await expectRedirect(`${base}our-findings/`, "/work/dogs/findings/");
await expectRedirect(`${base}map/`, "/work/dogs/map/");
assert.ok(paths.includes("/work/dogs/map/"), "The map's Work URL is missing from the sitemap");
console.log("Verified legacy gap and dog Work redirects.");

