import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(path, 'utf8');
const html = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const feed = JSON.parse(await read('public/data/records.json'));
const story = JSON.parse(await read('public/feed.json'));
const records = Object.values(feed.records);
const page = path => read(`dist${path}index.html`);

test('one curated feed is published in HTML and text with the same selections', async () => {
  const htmlFeed = await page('/feed/');
  const textFeed = await read('dist/feed.txt');
  assert.equal(textFeed, await read('public/feed.txt'));
  assert.ok(htmlFeed.includes('class="care-shell"'));
  assert.ok(htmlFeed.includes('href="/feed/" aria-current="page"><svg'));
  assert.ok(htmlFeed.includes('class="care-group-label">WHAT\'S HAPPENING?</div>'));
  assert.ok(htmlFeed.includes('class="care-group-label">WHO\'S HELPING?</div>'));
  assert.ok(htmlFeed.includes('class="care-group-label">OUR WORK</div>'));
  assert.ok(htmlFeed.indexOf('href="/feed/" aria-current="page"><svg') < htmlFeed.indexOf('class="care-group-label">WHO\'S HELPING?</div>'));
  assert.ok(htmlFeed.indexOf('class="care-group-label">WHO\'S HELPING?</div>') < htmlFeed.indexOf('class="care-group-label">OUR WORK</div>'));
  assert.ok(htmlFeed.includes('class="care-top-actions"'));
  assert.ok(htmlFeed.includes('<a href="/">Overview</a>'));
  assert.ok(htmlFeed.includes('<span aria-current="page">Feed</span>'));
  assert.ok(htmlFeed.includes('href="/feed.txt" target="_blank" rel="noopener noreferrer"'));
  assert.ok(htmlFeed.includes('Text version <svg class="link-arrow'));
  assert.ok(htmlFeed.includes('Listen to the feed'));
  assert.ok(htmlFeed.includes('href="/record/sjcoc-2024-pit-survey-pets/?from='));
  assert.ok(htmlFeed.includes('href="/record/canine-campus/?from='));
  assert.ok(!htmlFeed.includes('href="/gaps/'));
  assert.ok(!htmlFeed.includes('Daily reading'));
  for (const [a,b] of [['introduction','st-marys'],['st-marys','field-calls'],['field-calls','dumping'],['dumping','animal-services'],['animal-services','no-dog-homeless']])
    assert.ok(htmlFeed.indexOf(`id="${a}"`) < htmlFeed.indexOf(`id="${b}"`), `${a} before ${b}`);
  assert.ok(textFeed.indexOf('Before the first field observation') < textFeed.indexOf('Could every dog have a safe place?'));
  assert.ok(textFeed.startsWith('See clearly. Act locally.'));
  assert.ok(!textFeed.startsWith('Crossover Stockton Feed'));
  for (const phrase of ['7,183 field-call case records','3,106 stray-dog intake events','not a verified count','not yet represent operating capacity','Editorial exploration:']) {
    assert.ok(htmlFeed.includes(phrase), phrase);
    assert.ok(textFeed.includes(phrase), phrase);
  }
  assert.ok(!textFeed.includes('Explore the records:'));
  assert.deepEqual(story.silent.reading.slice(1),story.chapters.find(item=>item.id==='briefing').sections.map(item=>`briefing.${item.id}`));
  assert.deepEqual(JSON.parse(await read('dist/feed.json')), story);
  assert.deepEqual(JSON.parse(await read('dist/data/records.json')), feed);
});

test('the root serves the living Overview and the old overview URL stays readable', async () => {
  assert.equal(
    `${story.chapters[0].title} ${story.chapters[0].text}`,
    'See clearly. Act locally. We’re finding out what’s happening in Stockton, where help is needed, and what can be done about it.'
  );
  const root = await page('/');
  for (const phrase of [story.silent.homePage.eyebrow, story.silent.homePage.headline, story.silent.homePage.description, story.silent.homePage.primaryActionLabel, story.silent.homePage.subheroText, 'What we know now','Listen to this account','3,106','No verified street census'])
    assert.ok(root.includes(phrase), phrase);
  assert.ok(root.includes('class="care-shell"'));
  assert.equal((root.match(/Read or listen to the feed/g) ?? []).length, 2);
  assert.ok(root.includes('rel="canonical" href="https://crossoverstockton.org/"'));
  assert.ok(!root.includes('href="#/'));
  const overview = await page('/street-dogs/overview/');
  assert.equal(feed.records["task-review-sas-field-call-records"].fields.started_at, '2026-11-04');
  assert.equal(feed.records["task-review-sas-field-call-records"].fields.status, 'in_progress');
  assert.ok(feed.records["task-review-sas-field-call-records"].fields.list_context.includes('7,183 cases'));
  for (const phrase of ['Updated Nov 4, 2026','What we know now','Listen to this account','Dogs on Stockton’s streets need care','7,183 Animal Services case records','3,106','No verified street census'])
    assert.ok(overview.includes(phrase), phrase);
  assert.ok(overview.includes('rel="canonical" href="https://crossoverstockton.org/"'));
  assert.ok(overview.includes('<meta name="robots" content="noindex,follow">'));
  assert.ok(overview.includes('href="/"'));
});

test('all ten sections remain reachable and readable', async () => {
  assert.deepEqual(story.silent.menu.map(item => item.label), ['Overview','Activity','Actions','Measurements','Findings','Organizations','Improvements','Places','Events','Sources']);
  for (const item of story.silent.menu) {
    const section = await page(`/street-dogs/${item.page}/`);
    assert.ok(section.includes('class="care-shell"'), item.page);
    assert.ok(section.includes('href="/"'), item.page);
    assert.ok(!section.includes('href="#/'), item.page);
  }
  assert.ok((await page('/street-dogs/tasks/')).includes('Review Animal Services field-call records'));
  assert.ok((await page('/street-dogs/activity/')).includes('Received Stockton Animal Services field-call records'));
  assert.ok((await page('/street-dogs/improvements/')).includes('Canine Campus'));
});

test('About uses feed content and retains founder and record links', async () => {
  const about = await page('/about/');
  for (const heading of ['From work to vocation.','Principles','Vocation','Compassion','Reality','The work discovers the work.','Starting with dogs','Founded by Jeff Kolyer'])
    assert.ok(about.includes(html(heading)), heading);
  assert.ok(about.includes('AI and robotics will replace many jobs.'));
  assert.ok(about.includes('class="design-section about-starting-band"'));
  assert.ok(about.indexOf('class="about-principles"') < about.indexOf('class="design-section about-starting-band"'));
  assert.ok(about.indexOf('class="design-section about-starting-band"') < about.indexOf('class="about-founder"'));
  for (const image of ['techno.jpg','hands.jpg','notebook.jpg','growing.jpg']) assert.ok(about.includes(`/images/about/${image}`), image);
  for (const link of ['https://www.linkedin.com/in/jeff-kolyer','/street-dogs/sources/','/feed/'])
    assert.ok(about.includes(`href="${link}"`), link);
  assert.ok(about.includes('href="/about/" aria-current="page"><svg'));
  assert.ok(about.includes('alt="Jeff Kolyer"'));
  assert.ok(about.includes('alt="Dog on a Stockton neighborhood sidewalk"'));
});

test('record details retain instructions, limits, and supporting links', async () => {
  for (const record of records.filter(item => item.schema === 'task')) {
    const detail = await page(`/record/${record.id}/`);
    assert.ok(detail.includes('<a href="/">Overview</a>'), record.id);
    assert.ok(detail.includes('<span aria-current="page">Data Record</span>'), record.id);
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
    assert.ok(detail.includes('class="care-shell"'), record.id);
    assert.ok(detail.includes(html(record.title)), record.id);
  }
  const root = await page('/');
  assert.match(root, /href="\/site\.css\?v=[a-f0-9]{12}"/);
  assert.match(root, /href="\/care-site\.css\?v=[a-f0-9]{12}"/);
  assert.match(root, /src="\/site\.js\?v=[a-f0-9]{12}"/);
  assert.ok(root.includes('src="/images/variants/clean/dog-through-window.jpg" alt="Illustrative image of a dog on a neighborhood sidewalk seen through a home window"'));
  assert.ok(!root.includes('src="/images/home/sunlit-window-view.jpg"'));
  assert.ok(root.includes('<path d="M3 10v4M7 7v10M11 4v16M15 8v8M19 6v12M22 10v4"/>'));
  assert.ok(root.includes('viewBox="0 0 180 190"'));
  for (const path of ['dist/site.css','dist/care-site.css','dist/site.js','dist/images/variants/clean/dog-sidewalk.jpg','dist/images/variants/clean/dog-through-window.jpg','dist/images/about/about-the-founder.jpg','dist/images/about/guy-dog.jpg','dist/images/about/techno.jpg','dist/images/about/notebook.jpg','dist/images/about/hands.jpg','dist/images/about/growing.jpg','dist/fonts/IBMPlexSans-Regular.woff2'])
    assert.ok((await readFile(path)).length > 10000, path);
});

test('the approved civic skin is published and the earlier experiment redirects home', async () => {
  const experiment = await page('/preview/style-experiment/');
  assert.ok(experiment.includes('content="0;url=/"'));
  const css = await read('dist/care-site.css');
  assert.ok(css.includes('--skin-sidebar:#0d1c2b'));
  assert.match(await page('/'), /href="\/site\.css\?v=[a-f0-9]{12}"/);
  assert.match(await page('/'), /href="\/care-site\.css\?v=[a-f0-9]{12}"/);
});
