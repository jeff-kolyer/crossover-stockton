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
  assert.ok(daily.indexOf('Improvements') < daily.indexOf('Findings'));
  assert.deepEqual(JSON.parse(await read('dist/feed.json')), story);
  assert.deepEqual(JSON.parse(await read('dist/data/records.json')), feed);
});

test('the root is the full Overview, with links to other sections', async () => {
  const root = await page('/');
  for (const phrase of ['Street dogs and access to care','3,106','Reported dumped-dog encounters','No verified street census'])
    assert.ok(root.includes(phrase), phrase);
  assert.ok(root.includes('/record/crossover-2026-11-02-sas-field-call-records-received/'));
  for (const item of story.silent.menu.filter(item => item.page !== 'overview'))
    assert.ok(root.includes(`href="/street-dogs/${item.page}/"`), item.page);
  assert.ok(!root.includes('From work to vocation.'));
  assert.ok(!root.includes('href="#/'));
  const overview = await page('/street-dogs/overview/');
  assert.ok(overview.includes('content="noindex,follow"'));
  assert.ok(overview.includes('rel="canonical" href="https://crossoverstockton.org/"'));
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
