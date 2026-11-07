import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(path, 'utf8');
const html = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const feed = JSON.parse(await read('public/data/records.json'));
const story = JSON.parse(await read('public/feed.json'));
const records = Object.values(feed.records);
const page = path => read(`dist${path}index.html`);

test('the published feed preserves editorial order and portable data', async () => {
  const text = await page('/feed/');
  const daily = await read('dist/feed/daily.txt');
  assert.equal(text, await read('public/feed/index.html'));
  assert.equal(daily, await read('public/feed/daily.txt'));
  for (const [a,b] of [['introduction','gap'],['gap','about'],['improvements','findings'],['findings','sources']])
    assert.ok(text.indexOf(`id="${a}"`) < text.indexOf(`id="${b}"`), `${a} before ${b}`);
  assert.ok(daily.indexOf('Proposed and active improvements:') < daily.indexOf('What the evidence supports so far:'));
  assert.ok(daily.startsWith('What would you do if you no longer had to work for money?'));
  assert.ok(!daily.startsWith('Crossover Stockton Feed'));
  assert.deepEqual(JSON.parse(await read('dist/feed.json')), story);
  assert.deepEqual(JSON.parse(await read('dist/data/records.json')), feed);
});

test('the root introduces Crossover and leads into the separate gap Overview', async () => {
  assert.equal(
    `${story.chapters[0].title} ${story.chapters[0].text}`,
    "What would you do if you no longer had to work for money? You could use that freedom to escape from the world or to become more involved in it. We're starting in Stockton, getting out into the community, discovering where help is needed, and exploring what we can do. The work discovers the work."
  );
  const root = await page('/');
  for (const phrase of ['What would you do if you no longer had to work for money?','You could use that freedom to escape from the world or to become more involved in it.','The work discovers the work.','Street dogs and access to care'])
    assert.ok(root.includes(phrase), phrase);
  assert.ok(root.includes('href="/street-dogs/overview/"'));
  assert.ok(root.includes('class="shell home-shell"'));
  assert.ok(!root.includes('3,106'));
  assert.ok(!root.includes('class="figure-grid"'));
  assert.ok(!root.includes('href="#/'));
  const overview = await page('/street-dogs/overview/');
  assert.equal(feed.records["task-review-sas-field-call-records"].fields.started_at, '2026-11-04');
  assert.equal(feed.records["task-review-sas-field-call-records"].fields.status, 'in_progress');
  assert.ok(feed.records["task-review-sas-field-call-records"].fields.list_context.includes('7,183 cases'));
  for (const phrase of ['Investigation in progress','Last substantive update: Nov 4, 2026','Currently:','7,183 Animal Services case records','3,106','No verified street census'])
    assert.ok(overview.includes(phrase), phrase);
  assert.ok(overview.includes('rel="canonical" href="https://crossoverstockton.org/street-dogs/overview/"'));
  assert.ok(overview.includes('href="/"'));
});

test('all ten sections remain reachable and readable', async () => {
  assert.deepEqual(story.silent.menu.map(item => item.label), ['Overview','Activity','Tasks','Measurements','Findings','Organizations','Improvements','Places','Events','Sources']);
  for (const item of story.silent.menu) {
    const section = await page(`/street-dogs/${item.page}/`);
    assert.ok(section.includes('class="shell"'), item.page);
    assert.ok(section.includes('href="/"'), item.page);
    assert.ok(!section.includes('href="#/'), item.page);
  }
  assert.ok((await page('/street-dogs/tasks/')).includes('Review Animal Services field-call records'));
  assert.ok((await page('/street-dogs/activity/')).includes('Received Stockton Animal Services field-call records'));
  assert.ok((await page('/street-dogs/improvements/')).includes('Canine Campus'));
});

test('About uses feed content and retains founder and record links', async () => {
  const about = await page('/about/');
  for (const heading of ['From work to vocation.','See clearly. Act locally.','The work discovers the work.',"Where we're starting",'Founded by Jeff Kolyer'])
    assert.ok(about.includes(html(heading)), heading);
  for (const link of ['https://www.linkedin.com/in/jeff-kolyer','/street-dogs/sources/','/feed/'])
    assert.ok(about.includes(`href="${link}"`), link);
  assert.ok(about.includes('alt="Jeff Kolyer"'));
  assert.ok(about.includes('alt="Dog on a Stockton neighborhood sidewalk"'));
});

test('record details retain instructions, limits, and supporting links', async () => {
  for (const record of records.filter(item => item.schema === 'task')) {
    const detail = await page(`/record/${record.id}/`);
    assert.ok(detail.includes(`<h2>Instructions</h2><p>${html(record.fields.instructions)}</p>`), record.id);
    assert.doesNotMatch(detail, /Created \(estimated\)|Est\. created|Undated/);
  }
  for (const finding of records.filter(item => item.schema === 'finding')) {
    const detail = await page(`/record/${finding.id}/`);
    assert.ok(detail.includes(html(finding.fields.statement)), finding.id);
    assert.ok(detail.includes(html(finding.fields.limitations)), finding.id);
    for (const id of [...finding.fields.supporting_record_ids,...finding.fields.related_task_ids])
      assert.ok(detail.includes(`/record/${id}/`), `${finding.id}: ${id}`);
  }
  for (const claim of records.filter(item => item.schema === 'claim')) {
    const detail = await page(`/record/${claim.id}/`);
    for (const id of claim.fields.sourceRecordIds ?? [])
      assert.ok(detail.includes(`/record/${id}/`), `${claim.id}: ${id}`);
  }
});

test('organization and place pages link to each other', async () => {
  for (const org of records.filter(item => item.schema === 'organization' && item.fields.map_location_id)) {
    assert.ok((await page(`/organization/${org.id}/`)).includes(`/record/${org.fields.map_location_id}/`), org.id);
    assert.ok((await page(`/record/${org.fields.map_location_id}/`)).includes(`/organization/${org.id}/`), org.id);
  }
});

test('every public record and the new design assets are published', async () => {
  for (const record of records) {
    const prefix = record.schema === 'organization' ? 'organization' : 'record';
    const detail = await page(`/${prefix}/${encodeURIComponent(record.id)}/`);
    if (record.schema === 'gap') { assert.ok(detail.includes('url='), record.id); continue; }
    assert.ok(detail.includes('class="shell"'), record.id);
    assert.ok(detail.includes(html(record.title)), record.id);
  }
  const root = await page('/');
  assert.ok(root.includes('href="/site.css"'));
  assert.ok(root.includes('src="/site.js"'));
  for (const path of ['dist/site.css','dist/site.js','dist/images/variants/clean/dog-sidewalk.jpg','dist/images/about/about-the-founder.jpg','dist/fonts/IBMPlexSans-Regular.woff2'])
    assert.ok((await readFile(path)).length > 10000, path);
});
