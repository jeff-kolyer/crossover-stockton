import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Script } from "node:vm";

const html = await readFile("public/preview/one-file-site.html", "utf8");
const noImagesHtml = await readFile("public/preview/no-images-site.html", "utf8");
const cleanHtml = await readFile("public/preview/clean-site.html", "utf8");
const feed = JSON.parse(await readFile("public/data/records.json", "utf8"));
const story = JSON.parse(await readFile("public/feed.json", "utf8"));
const embedded = (id, page = html) => {
  const match = page.match(new RegExp(`<script id="${id}" type="application/json">([\\s\\S]*?)<\\/script>`));
  assert.ok(match, `${id} is embedded`);
  return JSON.parse(match[1]);
};

test("the current site is self-contained and uses the new image set", () => {
  const bundledFeed = embedded("feed-data");
  const bundledStory = embedded("story-data");
  const assets = embedded("asset-data");
  assert.deepEqual(Object.keys(bundledFeed.records), Object.keys(feed.records));
  assert.ok(assets["/images/logo_dark.webp"]?.startsWith("data:image/webp;base64,"));
  assert.ok(assets["/images/logo_light.webp"]?.startsWith("data:image/webp;base64,"));
  assert.ok(assets["/images/variants/clean/dog-sidewalk.jpg"]?.startsWith("data:image/jpeg;base64,"));
  assert.equal(assets["/images/home/home-hero.jpg"], undefined);
  assert.deepEqual(bundledStory, story);
  assert.equal(bundledFeed.experienceSpec, undefined);
  assert.equal(bundledStory.chapters[0].title, "See clearly. Act locally.");
  assert.equal(bundledFeed.records["crossover-stockton"].fields.statements, undefined);
  assert.equal(bundledStory.chapters[0].record, "crossover-stockton");
  assert.deepEqual(bundledStory.chapters[1].chapters.slice(-4).map(item => item.id), ["improvements", "events", "findings", "sources"]);
  assert.ok(!Object.values(bundledFeed.records).some(({ schema }) => schema === "article" || schema === "story"));
  assert.equal(/<script[^>]+src=|<link[^>]+href=|<img[^>]+src="\//i.test(html), false);
  assert.equal((html.match(/data:font\/woff2;base64,/g) || []).length, 4);
  assert.ok(html.includes('font-family:"IBM Plex Sans"'));
  assert.ok(!html.includes("fonts.googleapis.com"));
  assert.equal(html.includes("__EMBEDDED_"), false);
  const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
  new Script(scripts.at(-1)[1], { filename: "one-file-site.html" });
});

test("the text-first variant shares the feed and embeds no images", () => {
  assert.deepEqual(embedded("feed-data", noImagesHtml), feed);
  assert.deepEqual(embedded("story-data", noImagesHtml), story);
  assert.deepEqual(embedded("asset-data", noImagesHtml), {});
  assert.ok(noImagesHtml.includes(".hero-inner{min-height:0;padding-block:82px}"));
  assert.ok(noImagesHtml.includes('||"data:,"'));
  assert.equal(noImagesHtml.includes("__VARIANT_CSS__"), false);
  assert.equal(/data:image\//.test(noImagesHtml), false);
  const scripts = [...noImagesHtml.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
  new Script(scripts.at(-1)[1], { filename: "no-images-site.html" });
});

test("the clean preview mirrors the current site", () => {
  assert.equal(cleanHtml, html);
  const bundledFeed = embedded("feed-data", cleanHtml);
  const cleanAssets = embedded("asset-data", cleanHtml);
  assert.deepEqual(Object.keys(bundledFeed.records), Object.keys(feed.records));
  assert.equal(bundledFeed.records["street-dog-immediate-welfare"], undefined);
  assert.ok(cleanAssets["/images/variants/clean/dog-sidewalk.jpg"]?.startsWith("data:image/jpeg;base64,"));
  assert.ok(cleanAssets["/images/variants/clean/dog-park.jpg"]?.startsWith("data:image/jpeg;base64,"));
  assert.ok(cleanAssets["/images/about/about-the-founder.jpg"]?.startsWith("data:image/jpeg;base64,"));
  assert.ok(cleanAssets["/images/about/about-crossover-hero.jpg"]?.startsWith("data:image/jpeg;base64,"));
  assert.ok(Object.keys(cleanAssets).every(path => path.startsWith("/images/variants/clean/") || ["/images/about/about-the-founder.jpg", "/images/about/about-crossover-hero.jpg", "/images/home/desk-window-stockton-v2.png"].includes(path) || path.startsWith("/images/icons/") || path.startsWith("/images/logo_")));
  assert.deepEqual(bundledFeed, feed);
  assert.ok(cleanHtml.includes(".story-opening{"));
  const scripts = [...cleanHtml.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
  new Script(scripts.at(-1)[1], { filename: "clean-site.html" });
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
