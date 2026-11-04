import assert from "node:assert/strict";
import { test } from "node:test";
import { createServer } from "vite";

const vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
try {
  const { getPageComposition, resolvePageSection } = await vite.ssrLoadModule("/src/view/registry.ts");
  const { siteModel } = await vite.ssrLoadModule("/src/model/index.ts");

  test("the homepage has one ordered declaration with model-backed fields", () => {
    const page = getPageComposition("home");
    assert.deepEqual(page.sections.map(({ id }) => id), ["slogan", "purpose", "hero-action", "needs", "investigation", "stories", "navigation"]);
    assert.equal(resolvePageSection("home", "slogan").value, siteModel.getIdentity().slogan);
    assert.equal(resolvePageSection("home", "purpose").value, siteModel.getIdentity().purpose);
  });

  test("collection queries select records and retain the homepage ordering", () => {
    const needs = resolvePageSection("home", "needs").items;
    const stories = resolvePageSection("home", "stories").items;
    const navigation = resolvePageSection("home", "navigation").items;
    assert.equal(needs.length, 3);
    assert.ok(needs.every(({ active }) => active));
    assert.ok(needs.every((item, index) => index === 0 || needs[index - 1].rank <= item.rank));
    assert.equal(stories.length, 3);
    assert.ok(stories.every(({ active, featured }) => active && featured));
    assert.ok(stories.every((item, index) => index === 0 || Date.parse(stories[index - 1].published_at) >= Date.parse(item.published_at)));
    assert.deepEqual(navigation.map(({ id }) => id), ["about", "needs", "findings", "map"]);
  });

  test("editing records changes the resolved homepage content", () => {
    const need = siteModel.getNeeds().find(({ active }) => active);
    const investigation = resolvePageSection("home", "investigation").items[0];
    const story = resolvePageSection("home", "stories").items[0];
    const destination = resolvePageSection("home", "navigation").items[0];
    const originals = [need.title, investigation.publicQuestion, story.title, destination.title];
    try {
      need.title = "Updated need";
      investigation.publicQuestion = "Updated investigation";
      story.title = "Updated story";
      destination.title = "Updated destination";
      assert.equal(resolvePageSection("home", "needs").items[0].title, "Updated need");
      assert.equal(resolvePageSection("home", "investigation").items[0].publicQuestion, "Updated investigation");
      assert.equal(resolvePageSection("home", "stories").items[0].title, "Updated story");
      assert.equal(resolvePageSection("home", "navigation").items[0].title, "Updated destination");
    } finally {
      need.title = originals[0];
      investigation.publicQuestion = originals[1];
      story.title = originals[2];
      destination.title = originals[3];
    }
  });

  test("declaration changes alter selected sections without renderer changes", () => {
    const page = getPageComposition("home");
    const removed = page.sections.splice(3, 1)[0];
    try {
      assert.ok(!page.sections.some(({ id }) => id === "needs"));
      assert.throws(() => resolvePageSection("home", "needs"), /Unknown section/);
    } finally {
      page.sections.splice(3, 0, removed);
    }
  });
} finally {
  await vite.close();
}
