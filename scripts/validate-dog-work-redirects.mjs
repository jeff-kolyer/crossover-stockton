import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const dist = new URL("../dist/", import.meta.url);
const origin = "https://crossoverstockton.org";
const base = "/reality/too-many-dogs-still-lack-safe-placement/";
const legacy = new Map([
  ["dogs-public-source-review", "research"],
  ["dogs-map-placement-barriers", "our-findings"],
  ["dogs-solutions", "improvements"],
  ["dogs-direct-field-work", "our-findings"],
  ["dogs-locations-map", "dogs-locations-map"],
]);
const sitemap = await readFile(new URL("sitemap.xml", dist), "utf8");
const paths = [...sitemap.matchAll(/<loc>https:\/\/crossoverstockton\.org([^<]+)<\/loc>/g)].map((match) => match[1]);

for (const [workId, section] of legacy) {
  const oldPath = `/work/${workId}/`;
  const target = `${base}${section}/`;
  const html = await readFile(new URL(`.${oldPath}index.html`, dist), "utf8");
  assert.ok(html.includes(`content="0; url=${target}"`), `${oldPath} lacks a redirect`);
  assert.ok(html.includes(`href="${origin}${target}"`), `${oldPath} lacks the new canonical URL`);
  assert.ok(!paths.includes(oldPath), `${oldPath} remains in the sitemap`);
}

for (const path of paths) {
  const html = await readFile(new URL(`.${path}index.html`, dist), "utf8");
  for (const workId of legacy.keys()) {
    assert.ok(!html.includes(`href="/work/${workId}/`), `${path} links to old Work page ${workId}`);
  }
  for (const [, href] of html.matchAll(/href="(\/reality\/too-many-dogs-still-lack-safe-placement\/(?:ways-to-help|improvements|our-findings|research)\/#([^"#]+))"/g)) {
    const url = new URL(href, origin);
    const target = await readFile(new URL(`.${url.pathname}index.html`, dist), "utf8");
    assert.ok(target.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `${path} links to missing anchor ${href}`);
  }
}

assert.ok(paths.includes(`${base}dogs-locations-map/`), "The map's new gap URL is missing from the sitemap");
console.log(`Verified five legacy Work redirects and links across ${paths.length} public pages.`);
