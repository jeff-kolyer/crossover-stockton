import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Script } from "node:vm";

const html = await readFile("public/preview/one-file-site.html", "utf8");
const feed = JSON.parse(await readFile("public/data/records.json", "utf8"));
const embedded = (id) => {
  const match = html.match(new RegExp(`<script id="${id}" type="application/json">([\\s\\S]*?)<\\/script>`));
  assert.ok(match, `${id} is embedded`);
  return JSON.parse(match[1]);
};

test("the output is one self-contained file with the full public feed and images", () => {
  const bundledFeed = embedded("feed-data");
  const assets = embedded("asset-data");
  assert.deepEqual(bundledFeed, feed);
  assert.ok(Object.keys(bundledFeed.records).length > 0);
  assert.ok(assets["/images/logo_dark.webp"]?.startsWith("data:image/webp;base64,"));
  assert.ok(assets["/images/logo_light.webp"]?.startsWith("data:image/webp;base64,"));
  assert.ok(assets["/images/home/home-hero-wide.jpg"]?.startsWith("data:image/jpeg;base64,"));
  assert.equal(/<script[^>]+src=|<link[^>]+href=|<img[^>]+src="\//i.test(html), false);
  assert.equal(html.includes("__EMBEDDED_"), false);
  const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
  new Script(scripts.at(-1)[1], { filename: "one-file-site.html" });
});

test("published places can generate map links and the founder can link to LinkedIn", () => {
  const records = embedded("feed-data").records;
  const locations = Object.values(records).filter(({ schema }) => schema === "location");
  assert.ok(locations.length > 0);
  for (const place of locations) {
    const query = place.fields.map_reference?.query;
    assert.ok(query, place.id);
    const url = new URL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`);
    assert.equal(url.searchParams.get("query"), query);
  }
  const founder = Object.values(records).find(({ schema, fields }) => schema === "person" && fields.profileUrl);
  assert.equal(new URL(founder.fields.profileUrl).hostname, "www.linkedin.com");
});
