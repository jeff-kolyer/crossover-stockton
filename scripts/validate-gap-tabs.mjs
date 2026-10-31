import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const gaps = JSON.parse(await readFile(new URL("../src/data/gaps.json", import.meta.url), "utf8")).filter((gap) => gap.active).sort((a, b) => a.rank - b.rank);
const articles = JSON.parse(await readFile(new URL("../src/data/articles.json", import.meta.url), "utf8"));
const findingRecords = JSON.parse(await readFile(new URL("../src/data/findings.json", import.meta.url), "utf8"));
const publishedArticles = articles.filter((article) => article.published);
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

for (const [path, active] of [["", "tasks"], ["tasks/", "tasks"], ["activity/", "activity"], ["map/", "map"]]) {
  const html = await readFile(new URL(`./work/dogs/${path}index.html`, dist), "utf8");
  assert.ok(html.includes(`href="/work/dogs/${active}/" aria-current="page"`), `${path}: active workspace tab missing`);
  assert.ok(html.includes("crossover-shared-map"), `${path}: shared workspace map missing`);
}
const findings = await readFile(new URL("./work/dogs/findings/index.html", dist), "utf8");
assert.ok(findings.includes('href="/work/dogs/findings/" aria-current="page"'), "Findings: active tab missing");
assert.ok(findings.includes("crossover-shared-map"), "Findings: shared workspace map missing");
assert.ok(findings.includes('<h1 class="crossover-workspace-title" id="investigation-findings">Findings</h1>') && findings.includes('Propositions evaluated against evidence. Status and limitations are part of each finding.'), "Findings: heading or subtitle missing");
assert.ok(findings.includes('<h2 class="crossover-workspace-section-title" id="current-findings-heading">Current findings</h2>'), "Findings: current section missing");
assert.ok(!findings.includes('If AI can drive cars') && !findings.includes('id="investigation-questions"') && !findings.includes('id="crossover-reference-title"'), "Findings: old introduction or reference wall remains");
const currentFindings = findingRecords.filter((finding) => finding.investigation_id === "street-dog-immediate-welfare" && finding.current !== false);
assert.equal(currentFindings.length, 3, "Findings: expected exactly three current records");
assert.equal((findings.match(/<article>/g) ?? []).length, 3, "Findings: expected exactly three list entries");
const escapeHtml = (value) => value.replaceAll("&", "&amp;").replaceAll("'", "&#x27;");
let lastFindingPosition = findings.indexOf('id="current-findings-heading"');
for (const finding of currentFindings) {
  const article = publishedArticles.find((item) => item.id === finding.article_id);
  assert.ok(article, `${finding.id}: related article missing`);
  const row = `<strong>${escapeHtml(finding.title)}</strong><p>${escapeHtml(finding.statement)}</p>`;
  const position = findings.indexOf(row);
  assert.ok(position > lastFindingPosition && findings.includes(`href="${article.path}"`), `${finding.id}: row or article link missing or out of order`);
  lastFindingPosition = position;
}
const sitemap = await readFile(new URL("./sitemap.xml", dist), "utf8");
for (const article of publishedArticles) {
  const html = await readFile(new URL(`.${article.path}index.html`, dist), "utf8");
  assert.ok(sitemap.includes(`<loc>https://crossoverstockton.org${article.path}</loc>`), `${article.id}: sitemap URL missing`);
  assert.ok(html.includes('class="crossover-shared-map"') && html.includes('href="/work/dogs/findings/"') && !html.includes('<h2>Articles</h2>'), `${article.id}: workspace map or Findings back link missing`);
  if (article.show_in_findings) assert.ok(findings.includes(`href="${article.path}"`), `${article.id}: Findings index link missing`);
  for (const gapId of article.related_gap_ids) {
    const gap = gaps.find((item) => item.id === gapId);
    assert.ok(gap, `${article.id}: unknown related gap ${gapId}`);
    const gapHtml = await readFile(new URL(`./reality/${gap.slug}/index.html`, dist), "utf8");
    assert.ok(gapHtml.includes(`href="${article.path}"`), `${article.id}: related gap link missing`);
  }
  const escapedDescription = article.description.replaceAll("&", "&amp;").replaceAll("'", "&#39;");
  const escapedTitle = article.title.replaceAll("&", "&amp;").replaceAll("'", "&#x27;");
  assert.ok(html.includes(`<h1 class="crossover-workspace-title">${escapedTitle}</h1>`) && html.includes(`rel="canonical" href="https://crossoverstockton.org${article.path}"`) && html.includes(`content="${escapedDescription}"`), `${article.id}: article title, description, or canonical missing`);
}
console.log(`Verified ${gaps.length} shared gap references, the three Work map views, and ${publishedArticles.length} published articles.`);

