import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const gaps = JSON.parse(await readFile(new URL("../src/data/needs.json", import.meta.url), "utf8")).records.filter((gap) => gap.active).sort((a, b) => a.rank - b.rank);
const articles = JSON.parse(await readFile(new URL("../src/data/articles.json", import.meta.url), "utf8")).records;
const findingRecords = JSON.parse(await readFile(new URL("../src/data/findings.json", import.meta.url), "utf8"));
const activityObjectiveRecords = JSON.parse(await readFile(new URL("../src/data/objectives.json", import.meta.url), "utf8")).filter((objective) => objective.investigation_id === "street-dog-immediate-welfare");
const activityObjectives = activityObjectiveRecords.map((objective) => objective.id);
const records = (await Promise.all(["evidence", "activities"].map(async (name) => JSON.parse(await readFile(new URL(`../src/data/${name}.json`, import.meta.url), "utf8"))))).flat();
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
  assert.ok(!html.includes("shared-map"), `${gap.slug}: workspace map embedded in reference page`);
  if (gap.id === "dogs-safe-placement") {
    assert.ok(html.includes('href="/work/dogs/findings/"'), "Dogs: Findings link missing");
    assert.ok(html.indexOf('id="gap-articles">Articles</h2>') > html.indexOf('id="gap-investigation"'), "Dogs: Articles must follow the existing gap content");
    assert.ok(html.includes('href="/articles/where-are-stray-dogs/"'), "Dogs: opening investigation article missing");
  }
  else assert.ok(!html.includes('href="/work/dogs/findings/"'), `${gap.slug}: unrelated Findings link`);
}

for (const [path, active] of [["", "tasks"], ["tasks/", "tasks"], ["activity/", "activity"], ["map/", "map"]]) {
  const html = await readFile(new URL(`./work/dogs/${path}index.html`, dist), "utf8");
  assert.ok(html.includes(`href="/work/dogs/${active}/" aria-current="page"`), `${path}: active workspace tab missing`);
  assert.ok(html.includes("shared-map"), `${path}: shared workspace map missing`);
}
const activity = await readFile(new URL("./work/dogs/activity/index.html", dist), "utf8");
assert.ok(activity.includes('<h2 id="recorded-activity-title">Activity</h2>') && activity.indexOf('id="recorded-activity-title"') < activity.indexOf(`id="${activityObjectives[0]}"`), "Activity: page must begin with Activity");
assert.ok(!activity.includes('id="investigation-about-title"') && !activity.includes('id="investigation-objectives-title"'), "Activity: Overview content belongs in its detail view");
assert.equal((activity.match(/class="activity-question-toggle" aria-expanded="false"/g) ?? []).length, activityObjectives.length, "Activity: all objectives must start collapsed");
let previousObjective = activity.indexOf('id="recorded-activity-title"');
for (const objectiveId of activityObjectives) {
  const position = activity.indexOf(`id="${objectiveId}"`);
  assert.ok(position > previousObjective, `Activity: ${objectiveId} missing or out of order`);
  assert.ok(activity.includes(`href="/work/dogs/findings/#${objectiveId}"`), `Activity: ${objectiveId} Findings link missing`);
  assert.ok(activity.includes(`id="${objectiveId}-records" class="activity-question-records" hidden=""`), `Activity: ${objectiveId} records must start hidden`);
  previousObjective = position;
}
assert.ok(activity.includes('id="organizations"') && activity.includes('id="organization-stockton-street-dogs"'), "Activity: organization details missing");
for (const record of records.filter((item) => (item.record_type === "activity" || item.record_type === "field_report") && item.gap_ids.includes("dogs-safe-placement"))) {
  assert.equal(activity.split(`id="${record.id}"`).length - 1, 1, `Activity: ${record.id} must appear once`);
}
assert.ok(!activity.includes('investigation-overview-dialog'), "Activity: obsolete Overview dialog remains");
const findings = await readFile(new URL("./work/dogs/findings/index.html", dist), "utf8");
assert.ok(findings.includes('href="/work/dogs/findings/" aria-current="page"'), "Findings: active tab missing");
assert.ok(findings.includes("shared-map"), "Findings: shared workspace map missing");
assert.ok(findings.includes('<h2 id="investigation-findings">Summary</h2>'), "Findings: summary heading missing");
assert.ok(findings.includes('<h2 id="current-findings-heading">Findings</h2>'), "Findings: section missing");
assert.ok(!findings.includes('If AI can drive cars') && !findings.includes('id="investigation-objectives"') && !findings.includes('id="crossover-reference-title"'), "Findings: old introduction or reference wall remains");
const currentFindings = findingRecords.filter((finding) => finding.investigation_id === "street-dog-immediate-welfare" && finding.current !== false);
assert.equal((findings.match(/<article id="finding-/g) ?? []).length, currentFindings.length, "Findings: list entries must match current records");
const escapeHtml = (value) => value.replaceAll("&", "&amp;").replaceAll("'", "&#x27;");
for (const objective of activityObjectiveRecords) {
  const title = escapeHtml(objective.title);
  assert.ok(activity.includes(title) && findings.includes(title), `${objective.id}: Activity and Findings must use one objective title`);
}
let lastFindingPosition = findings.indexOf('id="current-findings-heading"');
for (const objectiveId of activityObjectives) {
  const position = findings.indexOf(`id="${objectiveId}"`);
  assert.ok(position > lastFindingPosition, `Findings: ${objectiveId} missing or out of order`);
  assert.ok(findings.includes(`href="/work/dogs/activity/#${objectiveId}"`), `Findings: ${objectiveId} Activity link missing`);
  lastFindingPosition = position;
  for (const finding of currentFindings.filter((item) => item.primary_objective_id === objectiveId)) {
    const article = publishedArticles.find((item) => item.id === finding.article_id);
    assert.ok(article, `${finding.id}: related article missing`);
    const row = `<h4>${escapeHtml(finding.title)}</h4><div>${escapeHtml(finding.statement)}</div>`;
    const findingPosition = findings.indexOf(row);
    assert.ok(findingPosition > position && findings.includes(`href="${article.path}"`), `${finding.id}: row or article link missing`);
    assert.ok(findings.includes(escapeHtml(finding.limitations)), `${finding.id}: limitation missing`);
  }
}
const sitemap = await readFile(new URL("./sitemap.xml", dist), "utf8");
for (const article of publishedArticles) {
  const html = await readFile(new URL(`.${article.path}index.html`, dist), "utf8");
  assert.ok(sitemap.includes(`<loc>https://crossoverstockton.org${article.path}</loc>`), `${article.id}: sitemap URL missing`);
  assert.ok(html.includes('class="shared-map"') && html.includes('href="/work/dogs/findings/"') && !html.includes('<h2>Articles</h2>'), `${article.id}: workspace map or Findings back link missing`);
  if (article.show_in_findings) assert.ok(findings.includes(`href="${article.path}"`), `${article.id}: Findings index link missing`);
  for (const gapId of article.related_gap_ids) {
    const gap = gaps.find((item) => item.id === gapId);
    assert.ok(gap, `${article.id}: unknown related gap ${gapId}`);
    const gapHtml = await readFile(new URL(`./reality/${gap.slug}/index.html`, dist), "utf8");
    assert.ok(gapHtml.includes(`href="${article.path}"`), `${article.id}: related gap link missing`);
  }
  const escapedDescription = article.description.replaceAll("&", "&amp;").replaceAll("'", "&#39;");
  const escapedTitle = article.title.replaceAll("&", "&amp;").replaceAll("'", "&#x27;");
  assert.ok(html.includes(`<h1>${escapedTitle}</h1>`) && html.includes(`rel="canonical" href="https://crossoverstockton.org${article.path}"`) && html.includes(`content="${escapedDescription}"`), `${article.id}: article title, description, or canonical missing`);
}
console.log(`Verified ${gaps.length} shared gap references, the three Work map views, and ${publishedArticles.length} published articles.`);

