import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const gaps = JSON.parse(await readFile(new URL("../src/data/gaps.json", import.meta.url), "utf8"));
const base = new URL("../dist/reality/too-many-dogs-still-lack-safe-placement/", import.meta.url);
const sections = [
  ["", "Overview", "What is happening in Stockton?", 3],
  ["key-factors/", "Key Factors", "What affects whether dogs reach care?", 2],
  ["ways-to-help/", "Ways to Help", "How care is reached", 9],
  ["improvements/", "Improvements", "Ideas to test", 3],
  ["our-findings/", "Our Findings", "What we&#x27;re investigating", 9],
  ["research/", "Research", "At a glance", 9],
  ["updates/", "Updates", "Need activity", 2],
];

for (const [path, label, content, minimumAnchors] of sections) {
  const html = await readFile(new URL(`${path}index.html`, base), "utf8");
  const href = `/reality/too-many-dogs-still-lack-safe-placement/${path}`;
  assert.ok(html.includes(`href="${href}" aria-current="page"`), `${label}: active tab or route missing`);
  assert.ok(html.includes(content), `${label}: section content missing`);
  const sidebar = html.match(/<aside class="dog-gap-sidebar"[\s\S]*?<\/aside>/)?.[0] ?? "";
  const anchors = [...sidebar.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);
  assert.ok(anchors.length >= minimumAnchors, `${label}: left menu entries missing`);
  for (const anchor of anchors) {
    const count = [...html.matchAll(new RegExp(`\\bid="${anchor}"`, "g"))].length;
    assert.equal(count, 1, `${label}: #${anchor} must have exactly one destination`);
  }
  assert.ok(html.includes("dog-gap-identity"), `${label}: need identity missing`);
  const identity = html.match(/<section class="dog-gap-identity"[\s\S]*?<\/section>/)?.[0] ?? "";
  assert.ok(identity, `${label}: identity card missing`);
  assert.ok(!identity.includes("Crossover Stockton / Current need"), `${label}: obsolete identity label returned`);
  assert.ok(!identity.includes("View sources") && !identity.includes("Our findings"), `${label}: identity actions returned`);
  assert.ok(html.includes("dog-gap-page is-investigating"), `${label}: investigation color state missing`);
}

const findings = await readFile(new URL("our-findings/index.html", base), "utf8");
const keyFactors = await readFile(new URL("key-factors/index.html", base), "utf8");
const dogOverview = await readFile(new URL("index.html", base), "utf8");
for (const key of ["shelter", "foster", "response", "reporting", "prevention", "placement"]) {
  assert.ok(keyFactors.includes(`id="factor-${key}"`), `Key Factors: ${key} missing`);
  assert.ok(dogOverview.includes(`href="/reality/too-many-dogs-still-lack-safe-placement/key-factors/#factor-${key}"`), `Overview: ${key} deep link missing`);
}
const research = await readFile(new URL("research/index.html", base), "utf8");
const legacySources = await readFile(new URL("sources/index.html", base), "utf8");
assert.ok(!findings.includes('id="research-at-a-glance"'), "Our Findings still contains the research introduction");
assert.ok(research.indexOf('id="research-at-a-glance"') < research.indexOf('id="sources-intro"'), "Research introduction must appear before the source index");
assert.ok(legacySources.includes('id="research-at-a-glance"'), "Legacy Sources route no longer reaches Research");

const identifiedSections = [
  ["", "Overview", "What is happening in Stockton?"],
  ["key-factors/", "Key Factors", "Explore the barriers named"],
  ["ways-to-help/", "Ways to Help", "Take a real step"],
  ["improvements/", "Improvements", "What could improve the outcome?"],
  ["research/", "Research", "What the public record tells us"],
  ["updates/", "Updates", "Need activity"],
];
for (const gap of gaps.filter((item) => item.active && item.investigation_status === "identified")) {
  const directory = new URL(`../dist/reality/${gap.slug}/`, import.meta.url);
  for (const [path, label, content] of identifiedSections) {
    const html = await readFile(new URL(`${path}index.html`, directory), "utf8");
    const href = `/reality/${gap.slug}/${path}`;
    assert.ok(html.includes(`href="${href}" aria-current="page"`), `${gap.slug} ${label}: active tab missing`);
    assert.ok(html.includes(content), `${gap.slug} ${label}: content missing`);
    assert.ok(html.includes("dog-gap-page is-identified"), `${gap.slug} ${label}: identified color state missing`);
    assert.ok(html.includes("Identified"), `${gap.slug} ${label}: status missing`);
    const tabs = html.match(/<nav class="dog-gap-tabs"[\s\S]*?<\/nav>/)?.[0] ?? "";
    assert.ok(!tabs.includes("Our Findings"), `${gap.slug} ${label}: findings tab should be absent`);
    const sidebar = html.match(/<aside class="dog-gap-sidebar"[\s\S]*?<\/aside>/)?.[0] ?? "";
    const anchors = [...sidebar.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);
    assert.ok(anchors.length >= 2, `${gap.slug} ${label}: left menu missing`);
    for (const anchor of anchors) {
      const count = [...html.matchAll(new RegExp(`\\bid="${anchor}"`, "g"))].length;
      assert.equal(count, 1, `${gap.slug} ${label}: #${anchor} must have exactly one destination`);
    }
    assert.ok(html.includes("Back to needs") && html.includes("Browse needs"), `${gap.slug} ${label}: browse controls missing`);
  }
  const legacy = await readFile(new URL("sources/index.html", directory), "utf8");
  assert.ok(legacy.includes('id="research-intro"'), `${gap.slug}: legacy Sources link no longer reaches Research`);
}

console.log("Verified all active gap routes, statuses, tabs, content, and sidebar anchors.");
