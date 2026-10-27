import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const gaps = JSON.parse(await readFile(new URL("../src/data/gaps.json", import.meta.url), "utf8")).filter((gap) => gap.active).sort((a, b) => a.rank - b.rank);
const dist = new URL("../dist/", import.meta.url);
const sections = ["What&#x27;s happening?", "What&#x27;s documented?", "What remains unknown?", "Who&#x27;s responding?", "Sources"];

for (const [index, gap] of gaps.entries()) {
  const html = await readFile(new URL(`./reality/${gap.slug}/index.html`, dist), "utf8");
  const previous = gaps[index - 1];
  const next = gaps[index + 1];
  assert.ok(html.includes(`<h1>${gap.title}</h1>`), `${gap.slug}: title missing`);
  assert.ok(html.includes('href="/reality/"') && html.includes("Back to needs"), `${gap.slug}: needs link missing`);
  assert.ok(html.includes('aria-label="Previous and next gaps"'), `${gap.slug}: sequential navigation missing`);
  if (previous) assert.ok(html.includes(`href="/reality/${previous.slug}/"`), `${gap.slug}: Previous link missing`);
  if (next) assert.ok(html.includes(`href="/reality/${next.slug}/"`), `${gap.slug}: Next link missing`);
  let last = -1;
  for (const section of sections) {
    const position = html.indexOf(section);
    assert.ok(position > last, `${gap.slug}: ${section} missing or out of order`);
    last = position;
  }
  assert.ok(!html.includes('class="dog-gap-tabs"') && !html.includes('class="dog-gap-sidebar"'), `${gap.slug}: legacy gap navigation remains`);
  assert.ok(!html.includes("crossover-shared-map"), `${gap.slug}: workspace map embedded in reference page`);
  if (gap.id === "dogs-safe-placement") assert.ok(html.includes('href="/work/dogs/"'), "Dogs: related investigation missing");
  else assert.ok(!html.includes('href="/work/dogs/"'), `${gap.slug}: unrelated investigation link`);
}

for (const [path, active] of [["", "tasks"], ["tasks/", "tasks"], ["activity/", "activity"], ["map/", "map"], ["findings/", "findings"]]) {
  const html = await readFile(new URL(`./work/dogs/${path}index.html`, dist), "utf8");
  assert.ok(html.includes(`href="/work/dogs/${active}/" aria-current="page"`), `${path}: active workspace tab missing`);
  assert.ok(html.includes("crossover-shared-map"), `${path}: shared workspace map missing`);
}
console.log(`Verified ${gaps.length} shared gap references, sequential links, and the four Work views.`);

