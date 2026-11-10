import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

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
  assert.ok(htmlFeed.includes('class="mobile-menu-head">Street dogs and access to care</div>'));
  assert.ok(htmlFeed.includes('<a href="/">Home</a>'));
  assert.ok(htmlFeed.includes('<nav class="crumbs" aria-label="Breadcrumb"><div class="crumbs-desktop"><a href="/">Home</a><span class="crumb-separator" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7"/></svg></span><span class="crumb-current" aria-current="page">Feed</span>'));
  assert.ok(htmlFeed.includes('<h1>Our evolving account</h1>'));
  assert.ok(htmlFeed.includes('href="/feed.txt" target="_blank" rel="noopener noreferrer"'));
  assert.ok(htmlFeed.includes('Text version <svg class="link-arrow'));
  assert.ok(htmlFeed.includes('Listen to the feed'));
  assert.ok(htmlFeed.includes('href="/record/sjcoc-2024-pit-survey-pets/"'));
  assert.ok(htmlFeed.includes('href="/record/canine-campus/"'));
  assert.ok(htmlFeed.includes('class="text-link" href="/record/canine-campus/"'));
  assert.ok(!htmlFeed.includes('?from='));
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

test('the root serves the Overview and the old overview URL stays readable', async () => {
  assert.equal(
    `${story.chapters[0].title} ${story.chapters[0].text}`,
    'See clearly. Act locally. We’re finding out what’s happening in Stockton, where help is needed, and what can be done about it.'
  );
  const root = await page('/');
  const gap = feed.records['dogs-safe-placement'].fields;
  for (const phrase of [gap.hero.eyebrow, 'When a dog needs help: Stockton', "Dogs are being abandoned and found roaming Stockton's streets.", story.silent.homePage.primaryActionLabel, 'Latest activity','Listen to this account','3,106','No verified street census'])
    assert.ok(root.includes(phrase), phrase);
  assert.ok(root.includes('class="design-intro"'));
  assert.ok(root.includes('class="care-shell"'));
  assert.ok(root.includes('<title>Home · Crossover Stockton</title>'));
  assert.ok(root.includes('<span>Home</span>'));
  assert.ok(!root.includes('aria-label="Breadcrumb"'));
  assert.ok(root.includes('href="/street-dogs/metrics/"'));
  assert.equal((root.match(/Read or listen to the feed/g) ?? []).length, 2);
  assert.ok(root.includes('rel="canonical" href="https://crossoverstockton.org/"'));
  assert.ok(!root.includes('href="#/'));
  const overview = await page('/street-dogs/overview/');
  assert.equal(feed.records["task-review-sas-field-call-records"].fields.started_at, '2026-11-04');
  assert.equal(feed.records["task-review-sas-field-call-records"].fields.status, 'in_progress');
  assert.ok(feed.records["task-review-sas-field-call-records"].fields.list_context.includes('7,183 cases'));
  for (const phrase of ['When a dog needs help: Stockton','Listen to this account','What we know now','Stockton has an established network of care.','3,106','No verified street census'])
    assert.ok(overview.includes(phrase), phrase);
  assert.ok(overview.includes('rel="canonical" href="https://crossoverstockton.org/"'));
  assert.ok(overview.includes('<meta name="robots" content="noindex,follow">'));
  assert.ok(overview.includes('href="/"'));
});

test('Overview keeps the simple layout and renders the sourced Living Account', async () => {
  const root = await page('/');
  const positions = ['class="design-intro"', 'id="current-picture"', 'id="living-update"', 'class="design-latest"', 'id="open-questions"', '04 / THE WORKSPACE'].map(label => root.indexOf(label));
  assert.ok(positions.every(position => position >= 0));
  assert.ok(positions.every((position, index) => index === 0 || position > positions[index - 1]));
  assert.ok(root.includes('When a dog needs help: Stockton'));
  assert.ok(root.includes("Dogs are being abandoned and found roaming Stockton's streets. We're tracing what happens when someone tries to help, where care falls short, and what could make it better."));
  assert.ok(root.includes('We follow the evidence, learn from people doing the work'));
  assert.ok(root.includes('Two attributed figures. One important unknown.'));
  assert.equal((root.match(/class="design-stat"/g) ?? []).length, 3);
  assert.ok(root.includes('02 / LIVING ACCOUNT'));
  assert.ok(root.includes('A public account that changes as the evidence changes.'));
  assert.ok(root.includes('class="design-split"'));
  assert.ok(root.includes('Latest activity'));
  assert.ok(root.includes('03 / OPEN QUESTIONS'));
  assert.ok(root.includes('Follow the work'));
  assert.ok(root.includes('Explore the records, their sources, and their limits.'));
  assert.ok(root.includes('href="#open-questions"'));
  assert.ok(root.includes('href="/street-dogs/activity/"'));
  assert.ok(root.includes('href="/feed/"'));
  const account = story.chapters.find(item => item.id === 'gap').chapters.find(item => item.id === 'overview').livingAccount;
  const written = [...root.matchAll(/<p class="overview-spoken">([\s\S]*?)<\/p>/g)].map(match => match[1].replace(/<[^>]+>/g, ''));
  assert.deepEqual(written, account.paragraphs.map(paragraph => html(paragraph.text)));
  assert.ok(!/<p class="overview-spoken">[\s\S]*?<a\b/.test(root.slice(root.indexOf('id="living-update"'), root.indexOf('class="design-report-actions"'))));
  const sources = root.match(/<details class="account-sources">([\s\S]*?)<\/details>/);
  assert.ok(sources, 'one supporting-record disclosure is present');
  assert.equal((root.match(/<details class="account-sources">/g) ?? []).length, 1);
  assert.ok(sources[1].startsWith('<summary>Sources and supporting records</summary>'));
  const groups = [...sources[1].matchAll(/<section class="account-source-group"><h3>[^<]+<\/h3><ul>([\s\S]*?)<\/ul><\/section>/g)];
  assert.equal(groups.length, account.paragraphs.length);
  groups.forEach((group, index) => {
    const expected = account.paragraphs[index].links.map(link => {
      const path = feed.records[link.record].schema === 'organization' ? 'organization' : 'record';
      return `<li><a href="/${path}/${link.record}/">${html(feed.records[link.record].title)}</a></li>`;
    }).join('');
    assert.equal(group[1], expected);
  });
  assert.ok((await read('dist/site.js')).includes("querySelectorAll('#living-update .overview-spoken')"));
  assert.ok(!root.includes('?from='));
  assert.ok(!root.includes('overview-brief-grid'));
  assert.ok(!root.includes('class="overview-section"'));
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
  assert.ok((await page('/street-dogs/activity/')).includes('class="text-link work-search-link"'));
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
    assert.ok(detail.includes('<a href="/">Home</a>'), record.id);
    assert.ok(detail.includes(`<h1>${html(record.title)}</h1>`), record.id);
    assert.ok(!detail.match(/<nav class="crumbs"[^]*?<\/nav>/)?.[0].includes(html(record.title)), record.id);
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

test('record breadcrumbs use canonical collections and clean links', async () => {
  const separator = '<span class="crumb-separator" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7"/></svg></span>';
  for (const item of story.silent.menu.filter(item => item.page !== 'overview')) {
    const listing = await page(`/street-dogs/${item.page}/`);
    assert.ok(listing.includes(`<a href="/">Home</a>${separator}<span class="crumb-current" aria-current="page">${item.label}</span>`), item.page);
  }
  const examples = [
    ['location','south-lincoln-crosstown','Places','/street-dogs/places/'],
    ['organization','stockton-street-dogs','Organizations','/street-dogs/organizations/'],
    ['initiative','canine-campus','Improvements','/street-dogs/improvements/'],
    ['activity',records.find(item => item.schema === 'activity').id,'Activity','/street-dogs/activity/'],
    ['task','task-verify-st-marys-church-street-dog-scale','Actions','/street-dogs/tasks/'],
    ['measurement',records.find(item => item.schema === 'measurement').id,'Measurements','/street-dogs/metrics/'],
    ['claim',records.find(item => item.schema === 'claim').id,'Measurements','/street-dogs/metrics/'],
    ['finding',records.find(item => item.schema === 'finding').id,'Findings','/street-dogs/findings/'],
    ['evidence',records.find(item => item.schema === 'evidence').id,'Sources','/street-dogs/sources/'],
  ];
  for (const [schema,id,parent,href] of examples) {
    const record = feed.records[id];
    assert.equal(record.schema, schema);
    const detail = await page(`/${schema === 'organization' ? 'organization' : 'record'}/${id}/`);
    assert.ok(detail.includes(`<a href="/">Home</a>${separator}<a href="${href}">${parent}</a></div></nav>`), id);
    assert.ok(detail.includes(`href="${href}" aria-current="location"`), `${id}: active collection`);
    assert.ok(!detail.includes('href="/feed/" aria-current="location"'), `${id}: no arrival-based selection`);
    assert.equal((detail.match(/aria-label="Breadcrumb"/g) ?? []).length, 1, id);
    assert.ok(!detail.includes('?from='), id);
  }
  const area = await page('/record/st-marys-community-services-campus/');
  assert.ok(area.includes(`<a href="/">Home</a>${separator}<a href="/street-dogs/places/">Places</a></div></nav>`));
  const facility = await page('/record/st-marys-dining-room-location/');
  assert.ok(facility.includes(`<a href="/">Home</a>${separator}<a href="/street-dogs/places/">Places</a>${separator}<a href="/record/st-marys-community-services-campus/">St. Mary&#39;s / Church Street Area</a></div></nav>`));
  const css = await read('dist/care-site.css');
  assert.ok(css.includes('.crumbs-desktop a:not(:first-child){max-width:110px}'));
  const script = await read('dist/site.js');
  assert.ok(!script.includes('?from='));
  const founder = await page('/record/jeff-kolyer/');
  assert.ok(founder.includes('href="/about/" aria-current="location"'));
});

test('organization and place pages link to each other', async () => {
  for (const org of records.filter(item => item.schema === 'organization' && item.fields.map_location_id)) {
    assert.ok((await page(`/organization/${org.id}/`)).includes(`/record/${org.fields.map_location_id}/`), org.id);
    assert.ok((await page(`/record/${org.fields.map_location_id}/`)).includes(`/organization/${org.id}/`), org.id);
  }
});

test('St. Mary\'s area has five nested facility places and retains historical evidence', async () => {
  const parentId = 'st-marys-community-services-campus';
  const children = records.filter(item => item.schema === 'location' && item.fields.parent_location_id === parentId);
  assert.equal(children.length, 5);
  const index = await page('/street-dogs/places/');
  assert.equal((index.match(/href="\/record\/st-marys-community-services-campus\/"/g) ?? []).length, 1);
  assert.ok(!index.includes('href="/record/st-marys-church-street-corridor/"'));
  for (const child of children) assert.ok(index.includes(`href="/record/${child.id}/"`), child.id);
  const area = await page(`/record/${parentId}/`);
  const embedUrl = feed.records[parentId].fields.facility_map_embed_url;
  if (embedUrl) {
    assert.ok(area.includes('<iframe class="facility-map"'));
    assert.ok(area.includes(`src="${html(embedUrl)}"`));
    assert.ok(area.indexOf('<iframe class="facility-map"') < area.indexOf('class="facility-grid"'));
  } else assert.ok(!area.includes('<iframe class="facility-map"'));
  assert.ok(area.includes('5 facilities · Stockton, California') || index.includes('5 facilities · Stockton, California'));
  assert.ok(area.includes('/record/ssd-2026-06-08-street-response/'));
  assert.ok(area.includes('/record/task-verify-st-marys-church-street-dog-scale/'));
  assert.ok(area.includes('historical report, not a current count'));
  for (const child of children) {
    assert.ok(area.includes(`/record/${child.id}/`), child.id);
    const detail = await page(`/record/${child.id}/`);
    assert.ok(detail.includes(`<a href="/record/${parentId}/">St. Mary&#39;s / Church Street Area</a>`), child.id);
    assert.ok(detail.includes('Open on Google Maps'), child.id);
    assert.ok(detail.includes('href="/street-dogs/places/" aria-current="location"'), child.id);
  }
  const pathways = await page('/record/pathways-neighborhood-location/');
  assert.ok(pathways.includes('268 beds in a City presentation'));
  assert.ok(pathways.includes('/record/st-marys-pathways-pet-accommodation/'));
});

test('Places offers location-type filters for canonical areas and facilities', async () => {
  const index = await page('/street-dogs/places/');
  const places = records.filter(record => record.schema === 'location' && !record.fields?.canonical_location_id);
  const types = [...new Set(places.map(record => record.fields.location_type))];
  assert.ok(index.includes('class="listing-results"'));
  assert.equal((index.match(/class="place-card"/g) ?? []).length, places.length);
  assert.match(index, new RegExp(`data-filter="all"[^>]*>All <span class="work-filter-count">\\(${places.length}\\)</span>`));
  for (const type of types) {
    const count = places.filter(record => record.fields.location_type === type).length;
    assert.match(index, new RegExp(`data-filter="${type}"[^>]*>[^<]+ <span class="work-filter-count">\\(${count}\\)</span>`), type);
  }
  assert.ok(index.includes('href="/record/pathways-neighborhood-location/"'));
  assert.ok(index.includes('Part of St. Mary&#39;s / Church Street Area'));
  assert.ok((await read('dist/site.js')).includes("id==='places'?record.fields?.location_type"));
  assert.ok(!(await read('dist/care-site.css')).includes('.place-results'));
});

test('single-place maps use verified locations and leave broad areas unpinned', async () => {
  const saved = await page('/record/stockton-animal-services-shelter/');
  assert.ok(saved.includes(`src="${html(feed.records['stockton-animal-services-shelter'].fields.map_reference.embed_url)}"`));
  assert.ok(saved.includes('title="Google map of Stockton Animal Services" loading="lazy"'));
  const child = await page('/record/st-marys-dining-room-location/');
  assert.ok(child.includes('class="location-detail-top"'));
  assert.ok(child.indexOf('<h2>Facility information</h2>') < child.indexOf('class="location-map-panel"'));
  assert.ok(child.includes('maps.google.com/maps?q=St.%20Mary&#39;s%20Dining%20Room'));
  assert.ok(child.includes('Open in Google Maps'));
  assert.ok(child.indexOf('class="location-map-panel"') < child.indexOf('<h2>What remains unknown</h2>'));
  for (const id of ['stockton-mens-shelter-location','stockton-district-5-reported-area-2026-09-24','south-lincoln-crosstown']) {
    const broad = await page(`/record/${id}/`);
    assert.ok(!broad.includes('class="location-map-iframe"'), id);
  }
  const shelter = await page('/record/stockton-mens-shelter-location/');
  assert.ok(shelter.includes('Open on Google Maps'));
  const parent = await page('/record/st-marys-community-services-campus/');
  assert.ok(parent.includes('class="facility-map"'));
  assert.ok(!parent.includes('class="location-map-iframe"'));
  assert.ok(parent.includes('Click to interact with map'));
  assert.ok(parent.includes('Done using map'));
  const css = await read('dist/care-site.css');
  assert.ok(css.includes('.facility-map-wrap.is-active .facility-map{pointer-events:auto}'));
  assert.ok((await read('dist/site.js')).includes('setupFacilityMap'));

  const source = (await read('public/preview/care-site/site.js')).replace(/\bstart\(\);\s*$/, '');
  const context = { location: { pathname: '/', search: '' }, URL, URLSearchParams };
  runInNewContext(source, context, { timeout: 3000 });
  const coordinates = runInNewContext('locationEmbedUrl({map_reference:{verified:true,precision:"named_place",query:"Stockton, CA"},coordinates:[37.936,-121.293],coordinates_verified:true})', context);
  assert.equal(coordinates, 'https://maps.google.com/maps?q=37.936%2C-121.293&z=16&output=embed');
  const coordinatesOnly = runInNewContext('locationEmbedUrl({coordinates:[37.936,-121.293],coordinates_verified:true})', context);
  assert.equal(coordinatesOnly, coordinates);
  const unverified = runInNewContext('locationEmbedUrl({map_reference:{verified:false,precision:"named_place",query:"Stockton, CA"},coordinates:[37.936,-121.293]})', context);
  assert.equal(unverified, '');
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
  assert.ok(css.includes('a.text-link,button.text-link{font-weight:700}'));
  assert.match(await page('/'), /href="\/site\.css\?v=[a-f0-9]{12}"/);
  assert.match(await page('/'), /href="\/care-site\.css\?v=[a-f0-9]{12}"/);
});
