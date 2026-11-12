import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { createHash } from 'node:crypto';
import { renderPublicationFeed, renderSitePublicationFeed } from './publication-render.mjs';
import { validatePublication } from './validate-publication.mjs';
import { checkPublicationHistory } from './check-publication-history.mjs';

const read = path => readFile(path, 'utf8');
const html = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const feed = JSON.parse(await read('public/data/records.json'));
const story = JSON.parse(await read('public/site-config.json'));
const publication = JSON.parse(await read('dist/publication.json'));
const records = Object.values(feed.records);
const page = path => read(`dist${path}index.html`);

test('one scrolling project page contains four sections and keeps About separate', async () => {
  const root=await page('/');
  const published=publication.gapPublications.find(item=>item.gapId==='dogs-safe-placement');
  assert.ok(root.includes('class="living-page living-page--continuous"'));
  assert.ok(!root.includes('<h2>What we know</h2>'));
  assert.ok(!root.includes('id="dogs-overview"'));
  assert.equal(published.items.filter(item=>item.section==='overview'&&item.status==='published').sort((a,b)=>a.order-b.order)[0].id,'dogs-scale');
  assert.ok(root.indexOf('id="dogs-scale"')>root.indexOf('<h1>Overview</h1>'));
  assert.ok(root.includes('id="dogs-field-calls"'));
  assert.ok(!root.includes('id="about-vocation"'));
  assert.ok(root.includes('class="gap-identity desktop-identity"'));
  assert.ok(root.includes('<a class="gap-identity desktop-identity" href="/">'));
  assert.ok(root.includes('background:#0789e8'));
  assert.ok(!root.includes('class="compact-metric"'));
  assert.ok(!root.includes('href="/feed/"'));
  assert.ok(!root.includes('<details class="living-references">'));
  assert.equal((root.match(/class="overview-listen living-listen"/g)||[]).length,1);
  const latest=published.items.filter(item=>item.status==='published').map(item=>item.updatedAt).sort().at(-1);
  const formatted=value=>new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'America/Los_Angeles'}).format(new Date(value));
  assert.ok(root.includes(`<div class="living-feed-head"><div><h1>Overview</h1><span class="living-feed-date">Updated ${formatted(latest)}</span></div><button class="overview-listen living-listen" type="button" data-track="account" data-listen-label="Listen to the feed"`));
  assert.ok(!root.includes('<div class="living-meta"><span>Updated '));
  const anchors={overview:'/#overview', 'our-work':'/#our-work', 'whats-next':'/#whats-next', 'open-questions':'/#open-questions'};
  for(const section of published.sections){
    assert.ok(root.includes(`id="${section.id}"`),section.id);
    assert.ok(root.includes(`href="${anchors[section.id]}"`),section.id);
    for(const item of published.items.filter(item=>item.status==='published'))
      assert.ok(root.includes(`id="${item.id}"`),`${section.id}: ${item.id}`);
  }
  assert.ok(root.indexOf('id="overview"')<root.indexOf('id="our-work"'));
  assert.ok(root.indexOf('id="our-work"')<root.indexOf('id="whats-next"'));
  assert.ok(root.indexOf('id="whats-next"')<root.indexOf('id="open-questions"'));
  assert.ok(root.includes('<h2>Our work</h2>')&&root.includes('<h2>What&#39;s next</h2>')&&root.includes('<h2>Questions</h2>'));
  const written=published.items.filter(item=>item.status==='published');
  const ordered=published.sections.toSorted((a,b)=>a.order-b.order).flatMap(section=>written.filter(item=>item.section===section.id).toSorted((a,b)=>a.order-b.order));
  const sourceIds=[...new Set(ordered.flatMap(item=>item.relatedRecordIds||[]))].filter(id=>feed.records[id]);
  const sourceList=root.match(/<section class="living-section living-sources" id="feed-sources">[\s\S]*?<\/section>/)?.[0];
  assert.ok(sourceList?.startsWith(`<section class="living-section living-sources" id="feed-sources"><details><summary><h2>Sources (${sourceIds.length})</h2>`));
  assert.ok(sourceList.includes('</summary><ol>')&&!sourceList.includes('<details open'));
  assert.ok(root.indexOf('id="open-questions"')<root.indexOf('id="feed-sources"'));
  assert.ok(root.indexOf('id="feed-sources"')<root.indexOf('class="living-updates"'));
  assert.equal((sourceList.match(/<li id="source-/g)||[]).length,sourceIds.length);
  for(const [index,id] of sourceIds.entries()){
    const record=feed.records[id];
    const prefix=record.schema==='organization'?'organization':'record';
    assert.ok(sourceList.includes(`<li id="source-${index+1}"><a href="/${prefix}/${id}/">${html(record.title)}</a></li>`),id);
  }
  assert.equal(await read('src/publication.json'),await read('public/publication.json'));
  assert.equal(await read('src/publication.json'),await read('dist/publication.json'));
  const textFeed=await read('dist/feed.txt');
  assert.equal(textFeed,await read('public/feed.txt'));
  const feedJson=JSON.parse(await read('dist/feed.json'));
  assert.equal(await read('dist/feed.json'),await read('public/feed.json'));
  assert.equal(feedJson.title,feed.records['dogs-safe-placement'].title);
  assert.equal(feedJson.updatedAt,latest);
  assert.deepEqual(feedJson.sections,published.sections);
  assert.deepEqual(feedJson.items,ordered);
  assert.deepEqual(JSON.parse(await read('dist/site-config.json')),story);
  assert.ok(textFeed.startsWith("Street dogs and access to care\n\nOverview\n\nUpdated November 11, 2026\n\nA problem whose scale is unknown\n\nDogs are being abandoned and found roaming Stockton's streets."));
  assert.ok(root.includes('<h3>A problem whose scale is unknown</h3>'));
  const expectedFeed=renderPublicationFeed(publication,feed.records,'dogs-safe-placement');
  assert.equal(textFeed,expectedFeed.text);
  assert.equal(await read('dist/feed-content.html'),expectedFeed.html);
  for(const item of written){
    const rendered=root;
    assert.ok(rendered.includes(html(item.body)),item.id);
    const article=rendered.match(new RegExp(`<article[^>]*id="${item.id}"[\\s\\S]*?</article>`))?.[0];
    assert.ok(article&&!article.includes('class="living-item-date"')&&!article.includes('<details class="living-references">'),item.id);
    if(item.image){
      assert.match(item.image.src,/\.jpg$/,item.id);
      assert.ok(article?.includes(`<figure class="living-image"><img src="${html(item.image.src)}" alt="${html(item.image.alt)}"`),item.id);
      assert.ok(article?.includes(`<figcaption class="living-references">${html(item.image.caption)}</figcaption></figure>`),item.id);
    }
    const resolved=[...new Set(item.relatedRecordIds||[])].filter(id=>feed.records[id]);
    assert.equal((article.match(/aria-label="Source \d+"/g)||[]).length,resolved.length,item.id);
    for(const id of resolved)assert.ok(article.includes(`href="#source-${sourceIds.indexOf(id)+1}"`),`${item.id}: ${id}`);
    assert.ok(textFeed.includes(item.body),item.id);
    for(const id of item.relatedRecordIds||[])assert.ok(rendered.includes(`/record/${id}/`)||rendered.includes(`/organization/${id}/`),id);
  }
  const audio=JSON.parse(await read('dist/audio-manifest.json'));
  assert.deepEqual(Object.keys(audio),['account','our-work','whats-next','open-questions','about']);
  assert.equal(audio.account.version,createHash('sha256').update('offline-voice-v1\n').update(textFeed.trim()).digest('hex').slice(0,16));
  for(const section of published.sections.filter(section=>section.id!=='overview')){
    const spoken=renderPublicationFeed(publication,feed.records,'dogs-safe-placement',section.id).text;
    assert.equal(await read(`dist/feed-${section.id}.txt`),spoken);
    assert.equal(audio[section.id].version,createHash('sha256').update('offline-voice-v1\n').update(spoken.trim()).digest('hex').slice(0,16));
  }
  const aboutSpeech=renderSitePublicationFeed(publication,feed.records,'about').text;
  assert.equal(await read('dist/feed-about.txt'),aboutSpeech);
  assert.ok(aboutSpeech.startsWith('About Crossover\n\nOur mission\n\nUpdated November 12, 2026\n\nFrom work to vocation\n\n'));
  assert.ok(aboutSpeech.endsWith(`Jeff Kolyer\n\nFounder, Crossover Stockton\n\n${publication.sitePublications[0].founderSummary}\n`));
  assert.equal(audio.about.version,createHash('sha256').update('offline-voice-v1\n').update(aboutSpeech.trim()).digest('hex').slice(0,16));
  for(const [track,entry] of Object.entries(audio)){
    const file=await readFile(`dist${entry.src}`);
    assert.equal(file.toString('ascii',0,4),'RIFF',track);
    assert.equal(file.toString('ascii',8,12),'WAVE',track);
    assert.ok(file.length>44,track);
  }
  assert.ok((await read('dist/site.js')).includes('navigator.mediaSession.setActionHandler'));
});

test('both publications collect article sources into a collapsed numbered list',async()=>{
  const root=await page('/');
  assert.ok(root.includes('id="feed-sources"'));
  assert.ok(!root.includes('<details class="living-references">'));
  const rendered=await page('/about/');
  const about=publication.sitePublications.find(item=>item.id==='about');
  const articles=about.items.filter(item=>item.status==='published').sort((a,b)=>a.order-b.order);
  const sourceIds=[...new Set(articles.flatMap(item=>item.relatedRecordIds||[]))].filter(id=>feed.records[id]);
  const sourceList=rendered.match(/<section class="living-section living-sources" id="feed-sources">[\s\S]*?<\/section>/)?.[0];
  assert.ok(sourceList?.startsWith(`<section class="living-section living-sources" id="feed-sources"><details><summary><h2>Sources (${sourceIds.length})</h2>`));
  assert.ok(sourceList.includes('</summary><ol>')&&!sourceList.includes('<details open'));
  assert.equal((sourceList.match(/<li id="source-/g)||[]).length,sourceIds.length);
  for(const [index,id] of sourceIds.entries()){
    const record=feed.records[id];
    const prefix=record.schema==='organization'?'organization':'record';
    assert.ok(sourceList.includes(`<li id="source-${index+1}"><a href="/${prefix}/${id}/">${html(record.title)}</a></li>`),id);
  }
  for(const item of articles){
    const article=rendered.match(new RegExp(`<article[^>]*id="${item.id}"[\\s\\S]*?</article>`))?.[0];
    assert.ok(article&&!article.includes('living-item-date')&&!article.includes('<details'),item.id);
    for(const id of new Set(item.relatedRecordIds||[]))assert.ok(article.includes(`href="#source-${sourceIds.indexOf(id)+1}"`),`${item.id}: ${id}`);
  }
  const css=await read('dist/care-site.css');
  assert.ok(css.includes('.living-sources summary{display:flex;align-items:center;justify-content:space-between'));
  assert.ok(css.includes('.living-sources summary svg{width:18px;height:18px;flex:none;fill:none;stroke:currentColor;stroke-width:2;transform:rotate(90deg)'));
  assert.ok(css.includes('.living-sources details[open] summary svg{transform:rotate(-90deg)}'));
});

test('About reads site publication data without a gap or custom article renderer',async()=>{
  const selected=publication.sitePublications.find(item=>item.id==='about');
  const written=selected.items.filter(item=>item.status==='published').sort((a,b)=>a.order-b.order);
  assert.equal(written.length,3);
  assert.ok(written.every(item=>!item.gapId));
  const rendered=await page('/about/');
  assert.ok(rendered.includes('>ABOUT CROSSOVER</span>'));
  assert.ok(rendered.includes('<a class="gap-identity desktop-identity" href="/about/">'));
  assert.ok(rendered.includes('<div class="living-feed-head"><div><h1>Our mission</h1><span class="living-feed-date">Updated '));
  assert.ok(rendered.includes('<h3>From work to vocation</h3>'));
  assert.ok(rendered.indexOf('>ABOUT CROSSOVER</span>')<rendered.indexOf('<h1>Our mission</h1>'));
  assert.ok(rendered.indexOf('<h1>Our mission</h1>')<rendered.indexOf('id="about-vocation"'));
  assert.ok(rendered.includes('data-track="about" data-listen-label="Listen to About"'));
  assert.ok(!rendered.includes('class="living-section-nav"'));
  assert.ok(!rendered.includes('id="dogs-scale"'));
  assert.ok(rendered.includes('<aside class="living-updates" aria-labelledby="living-updates-title"><h2 id="living-updates-title">Latest updates</h2>'));
  assert.ok(rendered.includes('Existing animal-care capacity is under pressure'));
  assert.ok(!rendered.includes('class="about-principles"'));
  assert.ok(rendered.includes('<figure class="living-image"><img src="/images/about/guy-dog-large.jpg"'));
  assert.ok(written.every(item=>rendered.includes(`id="${item.id}"`)));
  assert.ok(written.every((item,index)=>index===0||rendered.indexOf(`id="${written[index-1].id}"`)<rendered.indexOf(`id="${item.id}"`)));
  assert.ok(rendered.includes('<figure class="living-founder"><img src="/images/about/about-the-founder.jpg"'));
  assert.ok(rendered.includes('class="design-button about-linkedin-button"'));
  assert.ok(rendered.includes('linkedin-icon'));
  assert.match(rendered, /Connect on LinkedIn <svg class="link-arrow/);
  assert.ok(rendered.includes('who has lived in Stockton for more than a decade'));
  assert.ok(rendered.includes("Overview explains what is happening. Our work records what we have done and learned."));
  assert.equal((rendered.match(/Illustrative image\. AI-generated\./g)||[]).length,1);
  const speech=renderSitePublicationFeed(publication,feed.records,'about').text;
  assert.ok(speech.startsWith('About Crossover\n\nOur mission\n\nUpdated November 12, 2026\n\nFrom work to vocation\n\n'));
  assert.ok(speech.indexOf(written[0].title)<speech.indexOf(written[1].title));
  assert.ok(speech.indexOf(written[1].title)<speech.indexOf(written[2].title));
  assert.ok(speech.indexOf(written[2].title)<speech.indexOf('Jeff Kolyer'));
  assert.ok(!speech.includes('Illustrative image.')&&!speech.includes('LinkedIn')&&!speech.includes('Sources ('));
  const fixture=structuredClone(publication);
  fixture.sitePublications[0].items.push({...written[2],id:'about-fourth',order:4,title:'A fourth About article',body:'A new data-only article.',relatedRecordIds:[]});
  validatePublication(fixture,feed.records);
  const source=(await read('public/preview/care-site/site.js')).replace(/\bstart\(\);\s*$/,'');
  const context={location:{pathname:'/about/',search:''},URL,URLSearchParams,fixture,recordMap:new Map(records.map(record=>[record.id,record])),fixtureRecords:records};
  runInNewContext(source,context,{timeout:3000});
  const withoutGap=runInNewContext('publication=fixture;gap=undefined;records=fixtureRecords;byId=recordMap;livingPage("about")',context,{timeout:3000});
  assert.ok(withoutGap.includes('id="about-fourth"'));
  assert.ok(withoutGap.includes('<aside class="living-updates"'));
  assert.ok(renderSitePublicationFeed(fixture,feed.records,'about').text.includes('A new data-only article.'));
});

test('editorial dates follow item revisions and body edits change page and spoken text',async()=>{
  const fixture=structuredClone(publication);
  const selected=fixture.gapPublications.find(item=>item.gapId==='dogs-safe-placement');
  const item=selected.items.find(item=>item.id==='dogs-scale');
  item.body='A changed editorial account for rendering and narration.';
  item.updatedAt='2026-11-12T20:00:00Z';
  const context={location:{pathname:'/',search:''},URL,URLSearchParams,fixture,recordMap:new Map(records.map(record=>[record.id,record]))};
  const source=(await read('public/preview/care-site/site.js')).replace(/\bstart\(\);\s*$/,'');
  runInNewContext(source,context,{timeout:3000});
  const changedPage=runInNewContext('publication=fixture;gap={id:"dogs-safe-placement"};byId=recordMap;livingPage()',context,{timeout:3000});
  assert.ok(changedPage.includes(item.body));
  assert.ok(changedPage.includes('<span class="living-feed-date">Updated November 12, 2026</span>'));
  assert.ok(!changedPage.includes('class="living-item-date"'));
  assert.ok(!changedPage.includes('<div class="living-meta"><span>Updated '));
  item.relatedRecordIds=[item.relatedRecordIds[0],'missing-record'];
  const oneSource=runInNewContext('livingPage()',context,{timeout:3000});
  assert.ok(oneSource.match(/id="dogs-scale"[\s\S]*?aria-label="Source 1"[\s\S]*?<\/article>/));
  item.relatedRecordIds=[];
  const noSources=runInNewContext('livingPage()',context,{timeout:3000});
  const noSourceItem=noSources.match(/<article[^>]*id="dogs-scale"[\s\S]*?<\/article>/)?.[0];
  assert.ok(!noSourceItem?.includes('living-citations'));
  assert.ok(!noSourceItem?.includes('<details'));
  const otherPage=runInNewContext('livingPage("our-work")',context,{timeout:3000});
  assert.ok(!otherPage.includes('<div class="living-meta"><span>Updated '));
  assert.ok(otherPage.includes(item.body));
  assert.ok(renderPublicationFeed(fixture,feed.records,'dogs-safe-placement').text.includes(item.body));
  const duplicate=structuredClone(fixture);
  duplicate.gapPublications[0].items[0].title='  OVERVIEW  ';
  const once=renderPublicationFeed(duplicate,feed.records,'dogs-safe-placement');
  assert.ok(once.text.startsWith(`Street dogs and access to care\n\nOverview\n\nUpdated November 12, 2026\n\n${item.body}\n\n`));
  assert.ok(!once.text.includes('OVERVIEW'));
  assert.ok(once.html.includes('<h2>Overview</h2><article id="dogs-scale"><p>'));
  assert.ok(!once.html.includes('<h3>  OVERVIEW  </h3>'));
  assert.throws(()=>checkPublicationHistory({...fixture,gapPublications:[{...selected,items:[{...item,updatedAt:'2026-11-11'},...selected.items.filter(other=>other.id!==item.id)]}]},publication),/without a later updatedAt/);
  const invalid=structuredClone(fixture);
  invalid.gapPublications[0].items[0].updatedAt='2026-11-10';
  assert.throws(()=>validatePublication(invalid,feed.records),/updatedAt must be on or after createdAt/);
});

test('old editorial routes redirect to sections of the single account',async()=>{
  for(const path of ['/feed/','/street-dogs/overview/','/gaps/']){
    const old=await page(path);
    assert.ok(old.includes('content="0;url=/"'),path);
    assert.ok(old.includes('rel="canonical" href="https://crossoverstockton.org/"'),path);
  }
  for(const [path,anchor] of [['/our-work/','our-work'],['/whats-next/','whats-next'],['/questions/','open-questions']]){
    const old=await page(path);
    assert.ok(old.includes(`content="0;url=/#${anchor}"`),path);
    assert.ok(old.includes(`location.replace("/"+location.search+"#${anchor}")`),path);
  }
  assert.ok((await page('/')).includes('rel="canonical" href="https://crossoverstockton.org/"'));
  const sitemap=await read('dist/sitemap.xml');
  assert.ok(!sitemap.includes('https://crossoverstockton.org/feed/'));
  assert.ok(!sitemap.includes('https://crossoverstockton.org/street-dogs/overview/'));
  assert.ok(!sitemap.includes('https://crossoverstockton.org/gaps/'));
  assert.ok(!sitemap.includes('https://crossoverstockton.org/our-work/'));
  assert.ok(!sitemap.includes('https://crossoverstockton.org/whats-next/'));
  assert.ok(!sitemap.includes('https://crossoverstockton.org/questions/'));
});

test('navigation and responsive account keep all resources reachable',async()=>{
  const root=await page('/');
  const links=['tasks','activity','places','organizations','metrics','findings','sources','improvements','events'];
  for(const path of links){
    const url=`/street-dogs/${path}/`;
    assert.ok(root.includes(`href="${url}"`),path);
    assert.ok((await page(url)).includes('class="care-shell"'),path);
  }
  assert.ok(root.includes('href="/about/"'));
  const rail=root.match(/<aside class="care-rail">([\s\S]*?)<\/aside>/)?.[1];
  assert.ok(rail?.includes('aria-label="About Crossover"'));
  assert.ok(rail.indexOf('>Home</span>')<rail.indexOf('>Sources</span>'));
  assert.ok(rail.indexOf('>Sources</span>')<rail.indexOf('aria-label="About Crossover"'));
  assert.ok(!rail.includes('More work'));
  assert.ok(!root.includes('class="care-key-nav"'));
  assert.ok(!root.includes('class="care-rail-label"'));
  assert.ok(root.includes('class="gap-identity mobile-identity"'));
  const css=await read('dist/care-site.css');
  assert.ok(css.includes('.mobile-menu{inset:64px 0 0}'));
  assert.ok(css.includes('.living-image{order:-1;margin:0}'));
  assert.ok(css.includes('.living-page{width:100%;max-width:760px'));
  assert.ok(css.includes('.living-section:last-child{display:block}'));
  const about=await page('/about/');
  assert.ok(about.includes('<strong>Jeff Kolyer</strong>'));
  assert.ok(about.includes('https://www.linkedin.com/in/jeff-kolyer'));
});

test('site-wide feed formats stay in the quiet footer',async()=>{
  for(const path of ['/','/about/','/record/jeff-kolyer/']){
    const rendered=await page(path);
    assert.match(rendered,/<nav class="footer-links" aria-label="Footer"><a href="\/feed\.txt">Text <svg class="link-arrow /,path);
    assert.match(rendered,/<a href="\/feed\.json">Feed JSON <svg class="link-arrow /,path);
    assert.match(rendered,/<a href="\/data\/records\.json">Data JSON <svg class="link-arrow /,path);
    assert.ok(rendered.includes('<a href="/about/">About</a></nav>'),path);
    assert.ok(!rendered.includes('utm_source='),path);
  }
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
  const about = await page('/about/');
  assert.equal((about.match(/<figure class="living-image">/g)||[]).length,1);
  assert.equal((about.match(/<figcaption class="living-references">Illustrative image\. AI-generated\.<\/figcaption>/g)||[]).length,1);
  assert.ok(about.includes('<figure class="living-founder"><img src="/images/about/about-the-founder.jpg"'));
  assert.match(root, /href="\/site\.css\?v=[a-f0-9]{12}"/);
  assert.match(root, /href="\/care-site\.css\?v=[a-f0-9]{12}"/);
  assert.match(root, /src="\/site\.js\?v=[a-f0-9]{12}"/);
  assert.ok(root.includes('src="/images/variants/clean/dog-sidewalk-vulnerable-2026.jpg" alt="Illustrative tan dog walking slowly on a neighborhood sidewalk"'));
  assert.ok(!root.includes('src="/images/home/sunlit-window-view.jpg"'));
  for (const path of ['dist/site.css','dist/care-site.css','dist/site.js','dist/images/variants/clean/dog-sidewalk-vulnerable-2026.jpg','dist/images/variants/clean/dog-through-window.jpg','dist/images/about/about-the-founder.jpg','dist/images/about/guy-dog-large.jpg','dist/images/about/techno.jpg','dist/images/about/notebook.jpg','dist/images/about/hands.jpg','dist/images/about/growing.jpg','dist/fonts/IBMPlexSans-Regular.woff2'])
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
