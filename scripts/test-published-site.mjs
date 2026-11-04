import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";

const read = (path) => readFile(path, "utf8");
const feed = JSON.parse(await read("public/data/records.json"));

test("deployment serves the approved one-file site at the root", async () => {
  const preview = await read("public/preview/one-file-site.html");
  assert.equal(await read("index.html"), preview);
  assert.equal(await read("dist/index.html"), preview);
  assert.deepEqual(JSON.parse(await read("dist/data/records.json")), feed);
  assert.equal((await read("dist/CNAME")).trim(), "crossoverstockton.org");
  assert.deepEqual((await readdir("dist")).filter((name) => name === "assets"), []);
});

test("key former pages redirect into the new site", async () => {
  const redirects = [
    ["dist/work/dogs/findings/index.html", "/#/investigation"],
    ["dist/work/dogs/map/index.html", "/#/places"],
    ["dist/data/index.html", "/#/explore"],
    ["dist/work/index.html", "/#/responses"],
    ["dist/organizations/index.html", "/#/organizations"],
  ];
  const article = Object.values(feed.records).find(({ schema, fields }) => schema === "article" && fields.path);
  assert.ok(article);
  redirects.push([`dist${article.fields.path}index.html`, `/#/record/${encodeURIComponent(article.id)}`]);
  for (const [path, target] of redirects) assert.ok((await read(path)).includes(`url=${target}`), path);
});
