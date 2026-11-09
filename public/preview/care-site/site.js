// A separate SITE.md design preview. The feed and records remain the source of page text.
const paths={index:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',story:'<path d="M3 4h7a3 3 0 0 1 3 3v14a3 3 0 0 0-3-3H3zM21 4h-5a3 3 0 0 0-3 3v14a3 3 0 0 1 3-3h5z"/>',activity:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',tasks:'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="m8 12 2.5 2.5L16 9"/>',metrics:'<path d="M4 20v-8h4v8m2 0V4h4v16m2 0v-6h4v6M2 21h20"/>',findings:'<path d="M9 18h6M10 21h4M8 15a7 7 0 1 1 8 0l-1 3H9z"/>',organizations:'<circle cx="9" cy="8" r="3"/><path d="M2 20v-2a7 7 0 0 1 14 0v2M17 5a3 3 0 0 1 0 6M18 14a6 6 0 0 1 4 6"/>',improvements:'<path d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5"/>',places:'<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',events:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',document:'<path d="M5 2h9l4 4v5M14 2v4h4M5 2v20h8"/><circle cx="16" cy="16" r="3.5"/><path d="m18.5 18.5 3 3"/>',audioLines:'<path d="M3 10v4M7 7v10M11 4v16M15 8v8M19 6v12M22 10v4"/>',about:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',chevron:'<path d="m9 5 7 7-7 7"/>',menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',close:'<path d="M5 5l14 14M19 5 5 19"/>'};
paths.home='<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>';
paths.headphones='<path d="M3 14v-3a9 9 0 0 1 18 0v3"/><rect x="3" y="13" width="4" height="7" rx="2"/><rect x="17" y="13" width="4" height="7" rx="2"/>';
// Original left-facing dog-head silhouette inspired by the supplied profile reference.
paths.dog='<path fill="currentColor" stroke="none" d="M93 49V22c0-8 3-11 7-8 18 13 37 51 41 79 2 11 17 24 28 34 5 5 3 10-1 15-16 21-45 36-73 38-6 0-9-3-12-9l-17-42H40c-12 0-17-5-22-15-5-10-9-20-8-27 0-4 3-6 7-7l31-5c9-17 23-26 45-26Z"/><path fill="currentColor" stroke="none" d="M65 47V32c0-8 2-11 5-9 6 4 11 12 13 20Z"/>';
paths.firsthand='<path d="M2 12s3.5-5 10-5 10 5 10 5-3.5 5-10 5S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>';
paths.question='<circle cx="12" cy="12" r="10"/><path d="M9.5 9a2.7 2.7 0 0 1 5.3.7c0 2-2.8 2.4-2.8 4.4M12 17.5h.01"/>';
paths.arrowLeft='<path d="M20 12H4m6 6-6-6 6-6"/>';
paths.arrowExternal='<path d="M6 18 18 6M8 6h10v10"/>';
paths.document='<path d="M5 2h9l5 5v15H5zM14 2v5h5M8 12h8M8 16h8"/>';
// Internal navigation uses horizontal arrows; destinations outside the site use the diagonal arrow.
const icon=name=>`<svg class="${name.startsWith('arrow')?'link-arrow':''} ${name==='arrowLeft'?'link-arrow-left':''} ${name==='dog'?'dog-icon':''}" viewBox="${name==='dog'?'0 0 180 190':'0 0 24 24'}" aria-hidden="true">${paths[name]||paths.document}</svg>`;
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const short=(value,n=210)=>{const text=String(value||'').trim();return text.length>n?`${text.slice(0,n).trimEnd()}…`:text};
const previewBase='/preview/care-site/index.html';
const isPreview=location.pathname.startsWith(previewBase);
const route=()=>{
  if(!isPreview){
    const path=location.pathname;
    if(path==='/'||path==='/street-dogs/overview/')return '/overview';
    if(path==='/about/'||path==='/feed/')return path.slice(0,-1);
    const section=path.match(/^\/street-dogs\/(activity|tasks|metrics|findings|organizations|improvements|places|events|sources)\/$/);
    if(section)return `/${section[1]}`;
    const record=path.match(/^\/(?:record|organization)\/([^/]+)\/$/);
    if(record)return `/record/${decodeURIComponent(record[1])}`;
    return '/overview';
  }
  const params=new URLSearchParams(location.search);
  const page=params.get('page')||'overview';
  return page==='record'?`/record/${params.get('id')||''}`:page==='index'?'/overview':`/${page}`;
};
const href=page=>isPreview?`${previewBase}?page=${encodeURIComponent(page)}`:page==='overview'?'/':page==='about'||page==='feed'?`/${page}/`:`/street-dogs/${page}/`;
const recordHref=(id,from)=>isPreview?`${previewBase}?page=record&id=${encodeURIComponent(id)}&from=${encodeURIComponent(from)}`:`/${byId.get(id)?.schema==='organization'?'organization':'record'}/${encodeURIComponent(id)}/?from=${encodeURIComponent(from)}`;
let feed,feedContent,feedNarration,records,byId,gap,gapStory,about,menu,activeFilter='all';
let activeListenButton=null;
const lookup=id=>byId.get(id);
const section=id=>gapStory.chapters.find(item=>item.id===id);
const related=record=>record.fields?.gap_id===gap.id||(record.fields?.gap_ids||record.fields?.related_gap_ids||[]).includes(gap.id);
const recordText=record=>record?.fields?.statement||record?.fields?.list_context||record?.fields?.summary||record?.fields?.description||record?.description||'';
const recordsFor=part=>part.records?.map(lookup).filter(Boolean)||records.filter(item=>item.schema===part.select?.schema&&(part.select.schema==='organization'?(gap.fields?.organization_ids||[]).includes(item.id):related(item)));
const date=value=>value?new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(`${String(value).slice(0,10)}T12:00:00Z`)):'';
const metricValue=record=>{const value=record?.fields?.value??record?.fields?.reportedValue;return typeof value==='number'?new Intl.NumberFormat('en-US').format(value):value==null?'Unknown':String(value)};
const navGroups=[
  {label:"WHAT'S HAPPENING?",pages:['overview','feed']},
  {label:"WHO'S HELPING?",pages:['organizations','improvements','places','events']},
  {label:'OUR WORK',pages:['activity','tasks','metrics','findings']},
];
const navItem=page=>page==='feed'?{page,label:'Feed',icon:'audioLines'}:menu.find(item=>item.page===page);
const navLinks=(current,pages)=>pages.map(page=>{const item=navItem(page);return `<a href="${href(item.page)}" ${current===`/${item.page}`?'aria-current="page"':''}>${icon(item.icon)}<span>${esc(item.label)}</span></a>`}).join('');
const groupedNav=current=>navGroups.map(group=>`<div class="rail-gap">${esc(group.label)}</div><nav class="rail-nav" aria-label="${esc(group.label)}">${navLinks(current,group.pages)}</nav>`).join('');
const groupedMobileNav=current=>navGroups.map(group=>`<div class="rail-gap">${esc(group.label)}</div><nav aria-label="${esc(group.label)}">${navLinks(current,group.pages)}</nav>`).join('');
const breadcrumbs=(current,title,from)=>{
  if(['/home','/overview','/about'].includes(current))return '';
  const isRecord=current.startsWith('/record/');
  const parent=isRecord&&(from==='/feed'?{page:'feed',label:'Feed'}:menu.find(item=>`/${item.page}`===from));
  const parentPage=parent?.page||'overview';
  const parentLabel=parent?.label||'Overview';
  const label=isRecord?'Data Record':title;
  return `<nav class="crumbs" aria-label="Breadcrumb"><div class="crumbs-desktop"><a href="${href(parentPage)}">${esc(parentLabel)}</a>${icon('chevron')}<span aria-current="page">${esc(label)}</span></div></nav>`;
};
const heading=(title,description,current,from)=>`${breadcrumbs(current,title,from)}<header class="page-intro"><h1>${esc(title)}</h1>${description?`<p>${esc(description)}</p>`:''}</header>`;
const card=(record,from)=>`<a class="record-card" href="${recordHref(record.id,from)}"><strong>${esc(record.title)}</strong><p>${esc(short(recordText(record)))}</p><small>Open record ${icon('arrow')}</small></a>`;
const recordList=(items,from,grid=false)=>items.length?`<div class="${grid?'record-grid':'record-list'}">${items.map(item=>card(item,from)).join('')}</div>`:'<p class="empty">No public records are listed here yet.</p>';
const safeUrl=value=>/^https:\/\/[^\s]+$/i.test(value||'')?value:'';
const relationshipFields=[
  ['Supporting records',['supporting_record_ids','evidence_record_ids','evidence_record_id','basis_record_ids']],
  ['Sources',['sourceRecordIds','source_record_ids','source_record_id','report_record_ids']],
  ['Related work',['related_task_ids','activity_record_ids','contact_activity_ids','related_initiative_ids']],
  ['Organizations',['organization_ids']],
  ['Places',['location_ids','related_location_ids','map_location_id','map_reference_location_ids']],
];
function homePage(){
  const intro=feed.chapters.find(item=>item.id==='introduction');
  const home=feed.silent.homePage;
  const composition=isPreview?(new URLSearchParams(location.search).get('composition')||'window'):'window';
  const image=composition==='city'?'/images/home/stockton-skyline-commons.jpg':composition==='street'?home.gapImage:home.image;
  const variant=['window','city','street'].includes(composition)?composition:'window';
  return `<section class="home-splash home-splash--${variant}" aria-labelledby="home-question">
    <img class="home-background" src="${esc(image)}" alt="" aria-hidden="true">
    <div class="home-shade"></div>
    <div class="home-intro">
      <h1 id="home-question">${esc(intro.title).replace(' Act','<br>Act')}</h1>
      <p class="home-lead">${esc(intro.text)}</p>
      <p>${esc(intro.method)}</p>
      <div class="home-actions"><a class="home-primary" href="${href('overview')}">Explore the work ${icon('arrow')}</a><button class="home-listen" type="button" aria-label="Listen to the latest update"><span class="listen-icon" aria-hidden="true">▶</span><span>Latest update (Listen)</span></button></div>
    </div>
    <a class="home-gap" href="${href('overview')}">
      <img src="${esc(home.gapImage)}" alt="${esc(home.gapImageAlt)}">
      <span class="home-gap-copy"><span class="home-gap-label">${esc(home.label)}</span><strong>Dogs on Stockton’s Streets</strong><span class="home-gap-description">${esc(home.description).replace(' And what','<br>And what')}</span><span class="home-gap-action">${esc(home.actionLabel)} ${icon('arrow')}</span></span>
    </a>
  </section>`;
}
function relationGroups(record,from){
  const fields=record.fields||{};
  return relationshipFields.map(([title,keys])=>{
    const ids=[...new Set(keys.flatMap(key=>{const value=fields[key];return Array.isArray(value)?value:value?[value]:[]}))];
    const related=ids.map(lookup).filter(Boolean);
    if(title==='Organizations'&&record.schema==='location')related.push(...records.filter(item=>item.schema==='organization'&&item.fields?.map_location_id===record.id));
    return related.length?`<section class="panel related-group"><h2>${esc(title)}</h2>${recordList([...new Map(related.map(item=>[item.id,item])).values()],from,true)}</section>`:'';
  }).join('');
}
function overview(){const chapter=section('overview'),situation=chapter.chapters.find(item=>item.id==='situation'),figures=chapter.chapters.find(item=>item.id==='key-figures'),focus=chapter.chapters.find(item=>item.id==='focus'),activity=section('activity'),development=lookup(activity.chapters.find(item=>item.id==='developments').records[0]),finding=lookup(section('findings').records[0]),statusTask=lookup(focus.statusRecord),statusDate=date(statusTask?.fields?.started_at);return `${heading(situation.title,chapter.summary,'/overview')}<div class="overview-status"><strong>${statusTask?.fields?.status==='in_progress'?'Investigation in progress':'Investigation status unknown'}</strong>${statusDate?`<span>Last substantive update: ${esc(statusDate)}</span>`:''}</div><p class="overview-current"><strong>Currently:</strong> ${esc(focus.currentWork||focus.text)}</p><section class="story-hero"><div><h2>What needs attention</h2><p>${esc(situation.text)}</p></div><img src="${esc(gap.fields?.preferred_image||feed.silent.homePage.image)}" alt="${esc(situation.imageAlt||feed.silent.homePage.imageAlt)}"></section><div class="section-title"><h2>${esc(figures.title)}</h2><a href="${href('metrics')}">All measurements ${icon('arrow')}</a></div><div class="figure-grid">${figures.figures.map(item=>{const record=lookup(item.record);return `<article class="figure"><strong>${esc(metricValue(record))}</strong><span>${esc(item.label)}</span><small>${esc(item.context)}</small><a href="${recordHref(item.record,'/overview')}">${esc(item.more.label)} ${icon('arrow')}</a></article>`}).join('')}</div><div class="section-title"><h2>Our current focus</h2><a href="${href('activity')}">View activity ${icon('arrow')}</a></div><div class="two-col"><article class="panel"><h2>${esc(focus.headline)}</h2><p>${esc(focus.text)}</p>${development?`<div class="section-title"><h2>Latest development</h2></div>${card(development,'/overview')}`:''}</article><article class="panel"><h2>Developing finding</h2>${finding?`<p>${esc(short(recordText(finding),440))}</p><p style="margin-top:16px"><a class="text-link" href="${recordHref(finding.id,'/overview')}">Read finding and evidence ${icon('arrow')}</a></p>`:''}</article></div><div class="section-title"><h2>More from this gap</h2></div><nav class="tiles" aria-label="More gap sections">${menu.filter(item=>item.page!=='overview').map(item=>`<a class="tile" href="${href(item.page)}"><div class="tile-head">${icon(item.icon)}${icon('arrow')}</div><strong>${esc(item.label)}</strong><span>${esc(item.description)}</span></a>`).join('')}</nav>`}
function narrativeOverview(){
  const chapter=section('overview'),situation=chapter.chapters.find(item=>item.id==='situation'),focus=chapter.chapters.find(item=>item.id==='focus');
  const statusTask=lookup(focus.statusRecord),updated=date(chapter.updatedAt||statusTask?.fields?.started_at);
  const opening=esc(situation.text)
    .replace('Animal Services reports shelter-capacity pressure',`<a href="${recordHref('stocktonia-2026-10-20-sas-capacity-intake','/overview')}">Animal Services reports shelter-capacity pressure</a>`)
    .replace('rescue groups are responding',`<a href="${recordHref('stockton-street-dogs','/overview')}">rescue groups are responding</a>`)
    .replace('number of dogs currently on the streets remains unknown',`<a href="${recordHref('stockton-current-street-dog-population-unknown','/overview')}">number of dogs currently on the streets remains unknown</a>`);
  const work=esc(focus.currentWork||focus.text).replace('7,183 Animal Services case records',`<a href="${recordHref('task-review-sas-field-call-records','/overview')}">7,183 Animal Services case records</a>`);
  return `${breadcrumbs('/overview','Overview')}<article class="overview-report" aria-labelledby="overview-report-title"><header class="overview-report-header"><p class="overview-report-kicker">CURRENT FOCUS · DOGS ON STOCKTON’S STREETS</p><h1 id="overview-report-title">Overview</h1><p class="overview-report-date">Updated ${esc(updated||'date pending')}</p><button class="overview-listen" type="button"><span class="listen-icon" aria-hidden="true">▶</span><span>Listen</span></button></header><p class="overview-spoken overview-opening">${opening}</p><a class="overview-continue" href="#overview-more">Continue reading ${icon("arrow")}</a><div id="overview-more" class="overview-more"><p class="overview-spoken">${esc(focus.text)}</p><p class="overview-spoken">${work}</p><p class="overview-support">Explore the <a href="${href('metrics')}">measurements</a>, <a href="${href('findings')}">findings</a>, <a href="${href('organizations')}">organizations</a>, and <a href="${href('activity')}">activity</a> behind this account.</p></div></article><div class="overview-workspace"><h2 class="overview-workspace-title">Explore the evidence</h2>${overview()}</div>`;
}
const listingCopy={
  activity:['What happened','A chronological record of firsthand activity, submissions, and received records.'],
  tasks:['What happens next','Steps to investigate, verify, follow up, and try to help.'],
  metrics:['The numbers','Measurements, attributed estimates, and what they do—and don’t—show.'],
  findings:['What we’re learning','Supported conclusions, evidence, and unresolved questions.'],
  organizations:['Who is involved','Public agencies and community groups connected to the situation.'],
  improvements:['What could change','Existing efforts and proposed ways to improve outcomes.'],
  places:['Where the work happens','Places and services connected to the public record.'],
  events:['Public milestones','Dated events documented in the public record.'],
  sources:['The underlying record','Documents, datasets, and public information behind this work.']
};
function listingItems(id){
  const part=section(id);
  if(id==='activity')return records.filter(record=>record.schema==='activity'&&related(record)).sort((a,b)=>(b.fields?.occurred_at||'').localeCompare(a.fields?.occurred_at||''));
  if(id==='tasks'){const priority={in_progress:0,open:1,waiting:2,done:3,cancelled:4};return recordsFor(part).sort((a,b)=>(priority[a.fields?.status]??5)-(priority[b.fields?.status]??5)||(a.fields?.order_by_id??99)-(b.fields?.order_by_id??99))}
  if(id==='metrics')return [...recordsFor(part),...records.filter(record=>record.schema==='claim'&&record.fields?.gap_id===gap.id)];
  return recordsFor(part);
}
function recordStatus(record){
  const fields=record.fields||{};
  return String(fields.status||fields.development_stage||fields.stage||fields.verificationStatus||'').toLowerCase();
}
function listingFilterValue(record,id){return id==='metrics'?record.schema:recordStatus(record)}
function filterLabel(value){return value==='measurement'?'Measurements':value==='claim'?'Claims and unknowns':value.replaceAll('_',' ')}
function recordDate(record){
  const fields=record.fields||{};
  const raw=fields.occurred_at||fields.started_at||fields.published_at||fields.last_reviewed_at||record.dateForSort?.value;
  return raw?(/^\d{4}-\d{2}-\d{2}/.test(raw)?date(raw):String(raw)):'';
}
function listingRows(items,id){
  if(!items.length)return '<p class="record-empty">No published records match this filter.</p>';
  return items.map(record=>`<a class="work-record" href="${recordHref(record.id,`/${id}`)}"><span class="work-record-date">${esc(recordDate(record)||record.schema)}</span><span class="work-record-main"><span class="work-record-status">${esc(recordStatus(record).replaceAll('_',' ')||record.schema)}</span><strong>${esc(record.title)}</strong><span class="work-record-description">${esc(short(recordText(record),260))}</span></span><span class="work-record-arrow" aria-hidden="true">${icon("arrow")}</span></a>`).join('');
}
function listingPage(id){
  const item=menu.find(entry=>entry.page===id),part=section(id);
  if(!item||!part)return heading('Page unavailable','This section is not part of the public feed.',`/${id}`);
  const [title,description]=listingCopy[id]||[item.label,item.description];
  const items=listingItems(id),statuses=[...new Set(items.map(record=>listingFilterValue(record,id)).filter(Boolean))];
  const filters=['all',...(statuses.length>1?statuses:[])];
  const visible=activeFilter==='all'?items:items.filter(record=>listingFilterValue(record,id)===activeFilter);
  return `<div class="work-listing"><div class="eyebrow">DOGS ON STOCKTON’S STREETS / ${esc(item.label)}</div><h1>${esc(title)}</h1><p class="work-listing-lede">${esc(description)}</p><div class="work-banner"><div><strong>This is part of an evolving public account.</strong><p>These ${items.length} published records retain their sources, dates, and limitations.</p></div><a href="${href('overview')}">${icon("arrowLeft")} Return to overview</a></div><div class="work-listing-head"><h2>${esc(item.label)} <span class="work-visible-count">(${visible.length})</span></h2><button type="button" class="work-search-link">Search all records ${icon("arrow")}</button></div><div class="work-filters" aria-label="Filter ${esc(item.label)}">${filters.map(value=>`<button type="button" data-filter="${esc(value)}" aria-pressed="${activeFilter===value}">${esc(value==='all'?'All':filterLabel(value))}</button>`).join('')}</div><div class="listing-results">${listingRows(visible,id)}</div></div>`;
}
function updateListingFilter(value){
  const id=route().slice(1),items=listingItems(id);
  activeFilter=value;
  const visible=value==='all'?items:items.filter(record=>listingFilterValue(record,id)===value);
  document.querySelector('.listing-results').innerHTML=listingRows(visible,id);
  document.querySelector('.work-visible-count').textContent=`(${visible.length})`;
  document.querySelectorAll('[data-filter]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.filter===value)));
}
function designOverview(){
  const chapter=section('overview'),situation=chapter.chapters.find(item=>item.id==='situation'),figures=chapter.chapters.find(item=>item.id==='key-figures'),focus=chapter.chapters.find(item=>item.id==='focus');
  const introduction=feed.chapters.find(item=>item.id==='introduction');
  const activity=listingItems('activity').slice(0,4);
  const questions=gap.fields?.unknown_questions||[];
  const questionLinks=[recordHref('stockton-current-street-dog-population-unknown','/overview'),href('activity'),href('tasks')];
  const opening=esc(situation.text).replace('Animal Services reports shelter-capacity pressure',`<a href="${recordHref('stocktonia-2026-10-20-sas-capacity-intake','/overview')}">Animal Services reports shelter-capacity pressure</a>`).replace('rescue groups are responding',`<a href="${recordHref('stockton-street-dogs','/overview')}">rescue groups are responding</a>`).replace('number of dogs currently on the streets remains unknown',`<a href="${recordHref('stockton-current-street-dog-population-unknown','/overview')}">number of dogs currently on the streets remains unknown</a>`);
  const currentWork=esc(focus.currentWork||focus.text).replace('7,183 Animal Services case records',`<a href="${recordHref('task-review-sas-field-call-records','/overview')}">7,183 Animal Services case records</a>`);
  return `<div class="design-overview"><section class="design-hero"><div><div class="eyebrow">CURRENT FOCUS · STOCKTON, CALIFORNIA</div><h1>Dogs on<br>Stockton’s Streets</h1><p>${esc(feed.silent.homePage.description)}</p><div class="design-hero-actions"><a class="design-button" href="#open-questions">What we’re doing ${icon("arrow")}</a><a class="design-button secondary" href="${href('feed')}">${icon('headphones')}<span>Read or listen to the feed</span></a></div></div><div class="design-graphic"><img src="${esc(feed.silent.homePage.image)}" alt="${esc(feed.silent.homePage.imageAlt)}"><span>STOCKTON / LOOKING CLOSER</span></div></section><section class="design-intro"><div><div class="eyebrow">${esc(introduction.title)}</div><p>${esc(introduction.text)}</p></div><a href="${href('about')}">About Crossover ${icon("arrow")}</a></section><section class="design-section" id="current-picture"><div class="design-section-head"><div><div class="eyebrow">01 / THE SITUATION</div><h2>The current picture</h2><p>Two attributed figures. One important unknown.</p></div><a href="${href('metrics')}">All measurements ${icon("arrow")}</a></div><div class="design-stats">${figures.figures.map((figure,index)=>{const record=lookup(figure.record);return `<a class="design-stat" href="${recordHref(record.id,'/overview')}"><span class="design-stat-top">${icon(["dog","firsthand","question"][index])}<strong>${esc(metricValue(record))}</strong></span><span>${esc(figure.label)}</span><small>${esc(figure.context)} ${icon("arrow")}</small></a>`}).join('')}</div></section><section class="design-section" id="living-update"><div class="design-section-head"><div><div class="eyebrow">02 / LIVING ACCOUNT</div><h2>What we know now</h2><p>A public account that changes as the evidence changes.</p></div></div><div class="design-split"><article class="design-report"><div class="design-report-meta"><span>● Updated ${esc(date(chapter.updatedAt))}</span><span>OVERVIEW</span></div><p class="overview-spoken">${opening}</p><p class="overview-spoken">${currentWork}</p><p class="overview-spoken">${esc(focus.text)}</p><div class="design-report-actions"><button class="overview-listen" type="button"><span class="listen-icon" aria-hidden="true">▶</span><span>Listen to this account</span></button><a href="${href('feed')}">Read or listen to the feed ${icon("arrow")}</a><a href="${href('findings')}">See what we’re learning ${icon("arrow")}</a></div></article><aside class="design-latest"><h3>Latest activity</h3>${activity.map(record=>`<a href="${recordHref(record.id,'/overview')}"><small>${esc(recordDate(record))}</small><strong>${esc(record.title)} ${icon("arrow")}</strong><span>${esc(short(recordText(record),110))}</span></a>`).join('')}<a class="design-all" href="${href('activity')}">View all activity ${icon("arrow")}</a></aside></div></section><section class="design-section" id="open-questions"><div class="design-section-head"><div><div class="eyebrow">03 / OPEN QUESTIONS</div><h2>What we’re trying to find out</h2></div></div><div class="design-questions">${[questions[0],questions[3],questions[5]].filter(Boolean).map((question,index)=>`<a href="${questionLinks[index]}"><small>QUESTION 0${index+1} ${icon("arrow")}</small>${esc(question)}</a>`).join('')}</div></section><section class="design-section"><div class="design-section-head"><div><div class="eyebrow">04 / THE WORKSPACE</div><h2>Follow the work</h2><p>Explore the records, their sources, and their limits.</p></div></div><nav class="design-directory" aria-label="Explore the work">${menu.filter(item=>item.page!=='overview').map(item=>`<a href="${href(item.page)}"><strong>${icon(item.icon)} ${esc(item.label)} ${icon("arrow")}</strong><span>${esc(item.description)}</span></a>`).join('')}</nav></section></div>`;
}
function activityPage(){const part=section('activity');return `${heading('Activity',part.summary,'/activity')}${part.chapters.map(group=>`<div class="section-title"><h2>${esc(group.title)}</h2></div>${recordList((group.records||[]).map(lookup).filter(Boolean),'/activity')}`).join('')}`}
function genericPage(id){
  const item=menu.find(entry=>entry.page===id),part=section(id);
  if(!item||!part)return heading('Page unavailable','This page is not part of the public feed.',`/${id}`);
  const items=recordsFor(part),intro=heading(item.label,part.summary||part.text||item.description,`/${id}`);
  const context=part.text&&part.summary&&part.text!==part.summary?`<p class="panel" style="margin-bottom:20px">${esc(part.text)}</p>`:'';
  if(id==='findings')return intro+context+(items.length?items.map(record=>`<article class="panel finding-panel" style="margin-bottom:14px"><h2>${esc(record.title)}</h2><p>${esc(record.fields?.statement||recordText(record))}</p>${record.fields?.limitations?`<p style="margin-top:15px"><strong>Limit:</strong> ${esc(record.fields.limitations)}</p>`:''}${relationGroups(record,'/findings')}<p style="margin-top:16px"><a class="text-link" href="${recordHref(record.id,'/findings')}">Finding, evidence, and related work ${icon('arrow')}</a></p></article>`).join(''):'<p class="empty">No findings are recorded yet.</p>');
  if(id==='metrics'){const claims=records.filter(record=>record.schema==='claim'&&record.fields?.gap_id===gap.id);return intro+context+`<div class="section-title"><h2>Measurements</h2></div>`+recordList(items,'/metrics',true)+`<div class="section-title"><h2>Claims and unknowns</h2></div>`+recordList(claims,'/metrics',true)}
  if(id==='events'&&!items.length)return intro+'<p class="empty">No scheduled events are recorded yet.</p>';
  return intro+context+recordList(items,`/${id}`,['organizations','improvements','places'].includes(id));
}
function aboutPage(){
  const opening=about.sections.find(item=>item.id==='opening');
  const purpose=about.sections.find(item=>item.id==='purpose');
  const discovery=about.sections.find(item=>item.id==='discovery');
  const starting=about.sections.find(item=>item.id==='starting');
  const founderSection=about.sections.find(item=>item.id==='founder');
  const identity=records.find(record=>record.schema==='identity');
  const principles=(identity?.fields?.principleIds||[]).map(lookup).filter(Boolean);
  const principleImages={
    'work-to-vocation':{src:'/images/about/techno.jpg',alt:'Robotic arm in a workshop'},
    compassion:{src:'/images/about/hands.jpg',alt:'Two hands reaching toward one another'},
    'contact-with-reality':{src:'/images/about/notebook.jpg',alt:'Notebook of field observations'},
    'work-discovers-work':{src:'/images/about/growing.jpg',alt:'Plant growing beside a city'}
  };
  const founderId=identity?.fields?.founderPersonId;
  const founder=lookup(founderId)||records.find(record=>record.schema==='person');
  const profile=safeUrl(founder?.fields?.profileUrl);
  const openingText=opening.text.slice(opening.text.indexOf(' What if')+1);
  const technologyText=opening.text.slice(0,opening.text.indexOf(' What if'));
  return `<div class="design-overview about-page">
    <section class="design-hero" aria-labelledby="about-opening">
      <div><span class="eyebrow">ABOUT CROSSOVER</span><h1 id="about-opening">${esc(opening.headline)}</h1><p>${esc(openingText)}</p></div>
      <div class="design-graphic"><img src="/images/about/guy-dog.jpg" alt="Person sitting beside a dog at sunset"></div>
    </section>
    <section class="design-section about-principles-section" aria-labelledby="about-principles">
      <div class="design-section-head"><div><span class="eyebrow">GUIDING IDEAS</span><h2 id="about-principles">Principles</h2><p>${esc(technologyText)} ${esc(purpose.text)}</p></div></div>
      <div class="about-principles">${principles.map((principle,index)=>{const image=principleImages[principle.id];const title=principle.id==='work-discovers-work'?discovery.headline:principle.title;return `<article class="about-principle"><img src="${esc(image.src)}" alt="${esc(image.alt)}" loading="lazy"><div><span class="eyebrow">${String(index+1).padStart(2,'0')} / PRINCIPLE</span><h3>${esc(title)}</h3><p>${esc(recordText(principle))}</p></div></article>`}).join('')}</div>
    </section>
    <section class="design-section about-starting-band" aria-labelledby="about-starting">
      <div><span class="eyebrow">IN STOCKTON, NOW</span><h2 id="about-starting">${esc(starting.title)}</h2><p>${esc(starting.text)}</p><p><a class="text-link" href="${href('overview')}">${esc(starting.more.label)} ${icon('arrow')}</a></p></div><img src="${esc(gap.fields?.preferred_image||'/images/variants/clean/dog-sidewalk.jpg')}" alt="${esc(starting.imageAlt)}" loading="lazy">
    </section>
    <section class="design-section" aria-labelledby="about-founder">
      <div class="about-founder"><img src="${esc(founder?.fields?.preferred_image||'/images/about/about-the-founder.jpg')}" alt="${esc(founderSection.imageAlt)}" loading="lazy"><div><span class="eyebrow">FOUNDER</span><h2 id="about-founder">${esc(founderSection.headline)}</h2><p>${esc(founderSection.text)}</p>${profile?`<p><a class="design-button about-linkedin-button" href="${esc(profile)}" target="_blank" rel="noopener noreferrer">Connect on LinkedIn ${icon("arrowExternal")}</a></p>`:''}<p><a class="text-link" href="${href('sources')}">${esc(founderSection.more.label)} ${icon('arrow')}</a></p></div></div>
    </section>
  </div>`;
}
function detailPage(path){
  const match=path.match(/^\/record\/([^/]+)$/),record=match&&lookup(match[1]);
  const from=new URLSearchParams(location.search).get('from')||'';
  if(!record)return heading('Record unavailable','This record is not in the public feed.',path);
  const fields=record.fields||{};
  const excluded=new Set(['title','name','summary','description','statement','list_context','instructions','limitations','purpose','biography']);
  const displayed=Object.entries(fields).filter(([key,value])=>value!=null&&['string','number','boolean'].includes(typeof value)&&!excluded.has(key)).slice(0,20);
  const source=fields.source||{},sourceUrl=safeUrl(source.url||fields.source_url),website=safeUrl(fields.website),profile=safeUrl(fields.profileUrl);
  const external=[sourceUrl&&`<a href="${esc(sourceUrl)}" target="_blank" rel="noopener noreferrer">Original source ${icon("arrowExternal")}</a>`,website&&`<a href="${esc(website)}" target="_blank" rel="noopener noreferrer">Organization website ${icon("arrowExternal")}</a>`,profile&&`<a href="${esc(profile)}" target="_blank" rel="noopener noreferrer">Profile ${icon("arrowExternal")}</a>`].filter(Boolean);
  const mapQuery=fields.map_reference?.query,mapUrl=mapQuery?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`:'';
  const details=displayed.length?`<dl>${displayed.map(([key,value])=>`<dt>${esc(key.replaceAll('_',' '))}</dt><dd>${esc(value)}</dd>`).join('')}</dl>`:'';
  return `${heading(record.title,recordText(record),path,from)}<div class="detail-body">
    ${fields.instructions?`<section class="panel"><h2>Instructions</h2><p>${esc(fields.instructions)}</p></section>`:''}
    ${fields.limitations?`<section class="panel"><h2>Limitations</h2><p>${esc(fields.limitations)}</p></section>`:''}
    ${fields.unknown?`<section class="panel"><h2>What remains unknown</h2><p>${esc(fields.unknown)}</p></section>`:''}
    ${source.publisher||external.length||mapUrl?`<section class="panel"><h2>Source and location</h2>${source.publisher?`<p>${esc(source.publisher)}</p>`:''}<div class="external-links">${external.join('')}${mapUrl?`<a href="${esc(mapUrl)}" target="_blank" rel="noopener noreferrer">Open on Google Maps ${icon("arrowExternal")}</a>`:''}</div></section>`:''}
    ${relationGroups(record,from||'/sources')}
    <section class="panel"><h2>Record details</h2>${details}<details class="raw-fields"><summary>All public fields</summary><pre>${esc(JSON.stringify(fields,null,2))}</pre></details></section>
    ${isPreview?`<p><a class="text-link" href="/${record.schema==='organization'?'organization':'record'}/${encodeURIComponent(record.id)}/">Open permanent record ${icon("arrowExternal")}</a></p>`:''}
  </div>`;
}
function feedPage(){
  const reading=feedContent.replace(/href="\/(?:record|organization)\/([^/"?]+)\/"/g,(_,id)=>`href="${recordHref(decodeURIComponent(id),'/feed')}"`);
  return `<div class="site-feed">${breadcrumbs('/feed','Feed')}<header class="site-feed-header"><div><p class="eyebrow">CROSSOVER STOCKTON</p><h1>Feed</h1><p>${esc(feed.description)}</p><button class="overview-listen feed-listen" type="button"><span class="listen-icon" aria-hidden="true">▶</span><span>Listen to the feed</span></button></div><a href="/feed.txt" target="_blank" rel="noopener noreferrer" aria-label="Open text version of the feed">Text version ${icon("arrowExternal")}</a></header><div class="feed-reading">${reading}</div></div>`;
}
function render({reuseExisting=false}={}){
  if(reuseExisting&&document.querySelector('#app > .care-shell')){
    document.querySelector('.menu-toggle').addEventListener('click',toggleMenu);
    setupHomeSearch();
    return;
  }
  const current=route();
  const inner=current==='/overview'?designOverview():current==='/about'?aboutPage():current==='/feed'?feedPage():current.startsWith('/record/')?detailPage(current):listingPage(current.slice(1));
  const navLink=([page,label,symbol])=>`<a href="${href(page)}" ${current==='/'+page?'aria-current="page"':''}>${icon(symbol)}<span>${label}</span></a>`;
  const groups=[
    {label:"WHAT'S HAPPENING?",items:[['overview','Overview','home'],['feed','Feed','audioLines']]},
    {label:"WHO'S HELPING?",items:[['organizations','Organizations','organizations'],['improvements','Improvements','improvements'],['places','Places','places'],['events','Events','events']]},
    {label:'OUR WORK',items:[['activity','Activity','activity'],['tasks','Actions','tasks'],['metrics','Measurements','metrics'],['findings','Findings','findings']]},
  ];
  const grouped=groups.map(group=>`<div class="care-nav-group"><div class="care-group-label">${group.label}</div><nav class="care-rail-nav" aria-label="${group.label}">${group.items.map(navLink).join('')}</nav></div>`).join('');
  const sourcesNav=`<nav class="care-rail-nav" aria-label="Sources">${navLink(['sources','Sources','document'])}</nav>`;
  const keys=[['overview','Overview','home'],['feed','Feed','audioLines'],['activity','Activity','activity'],['tasks','Actions','tasks']];
  const keyLinks=keys.map(([page,label,symbol])=>`<a href="${href(page)}" ${current==='/'+page?'aria-current="page"':''} aria-label="${label}">${icon(symbol)}<span>${label}</span></a>`).join('');
  const shell=`<div class="care-shell"><aside class="care-rail"><a class="care-brand" href="${href('overview')}"><img src="/images/logo_light.webp" alt=""><span>CROSSOVER<br>STOCKTON</span></a><div class="care-rail-label">STREET DOGS AND<br>ACCESS TO CARE</div><div class="care-rail-groups">${grouped}</div><div class="care-rail-sources">${sourcesNav}</div></aside><div class="care-site"><header class="care-top"><a class="care-mobile-brand" href="${href('overview')}"><img src="/images/logo_dark.webp" alt=""><span>CROSSOVER<br>STOCKTON</span></a><strong>Street dogs and access to care</strong><div class="care-top-actions"><div class="home-search"><button class="home-search-toggle" type="button" aria-label="Search the site" aria-expanded="false" aria-controls="home-search-panel"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg></button><div class="home-search-panel" id="home-search-panel" hidden><label for="home-search-input">Search Crossover Stockton</label><input id="home-search-input" type="search" placeholder="Search sections and records"><div class="home-search-results"></div></div></div><a href="${href('about')}" ${current==='/about'?'aria-current="page"':''}>${icon('about')}<span>About</span></a><button class="menu-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu">${icon('menu')}<span>Menu</span></button></div></header><nav class="care-key-nav" aria-label="Key sections">${keyLinks}</nav><div class="mobile-menu" id="mobile-menu">${grouped}<div class="care-mobile-sources">${sourcesNav}</div></div><main class="main" id="content" tabindex="-1"><div class="content">${inner}</div></main><footer class="footer"><span>See clearly. Act locally.</span><div class="footer-links"><a href="${href('overview')}">Overview</a><a href="${href('feed')}">Feed</a><a href="${href('sources')}">Sources</a><a href="${href('about')}">About</a></div></footer></div></div>`;
  document.getElementById('app').innerHTML=shell;
  document.title=`${current==='/about'?'About':current==='/feed'?'Feed':current.startsWith('/record/')?'Record':menu.find(item=>'/'+item.page===current)?.label||'Crossover'} · Crossover Stockton${isPreview?' — new site preview':''}`;
  document.querySelector('.menu-toggle').addEventListener('click',toggleMenu);
  setupHomeSearch();
  window.scrollTo(0,0);
}
function setupHomeSearch(){
  const button=document.querySelector('.home-search-toggle'),panel=document.querySelector('.home-search-panel'),input=document.querySelector('#home-search-input'),results=document.querySelector('.home-search-results');
  const pages=[{label:'About Crossover',url:href('about')},{label:'Feed',url:href('feed')},...menu.map(item=>({label:item.label,url:href(item.page)}))];
  const recordPages=records.map(item=>({label:item.title,url:recordHref(item.id,'/overview'),search:`${item.title} ${recordText(item)} ${item.schema}`.toLowerCase()}));
  function update(){const term=input.value.trim().toLowerCase();const matches=(term?[...pages,...recordPages].filter(item=>(item.search||item.label.toLowerCase()).includes(term)):pages).slice(0,18);results.innerHTML=matches.length?matches.map(item=>`<a href="${item.url}">${esc(item.label)} ${icon('arrow')}</a>`).join(''):'<p>No matching sections or records.</p>'}
  button.addEventListener('click',()=>{const open=panel.hidden;panel.hidden=!open;button.setAttribute('aria-expanded',String(open));if(open){update();input.focus()}});
  input.addEventListener('input',update);
  panel.addEventListener('keydown',event=>{if(event.key==='Escape'){panel.hidden=true;button.setAttribute('aria-expanded','false');button.focus()}});
}
function toggleMenu(){const open=!document.getElementById('mobile-menu').classList.contains('open');document.getElementById('mobile-menu').classList.toggle('open',open);document.querySelector('.menu-toggle').setAttribute('aria-expanded',String(open));document.querySelector('.menu-toggle').setAttribute('aria-label',open?'Close gap menu':'Open gap menu');document.querySelector('.menu-toggle').innerHTML=icon(open?'close':'menu')+'<span>'+(open?'Close':'Menu')+'</span>';document.body.classList.toggle('menu-open',open)}
function handleListingControls(event){
  const filterButton=event.target.closest('[data-filter]');
  if(filterButton){updateListingFilter(filterButton.dataset.filter);return}
  if(event.target.closest('.work-search-link'))document.querySelector('.home-search-toggle')?.click();
}
function handleListen(event){
  const button=event.target.closest('.home-listen,.overview-listen');
  if(!button)return;
  if(!('speechSynthesis' in window)){location.href='/feed/';return}
  const isFeed=button.classList.contains('feed-listen');
  const isOverview=button.classList.contains('overview-listen')&&!isFeed;
  const idleLabel=isFeed?'Listen to the feed':isOverview?'Listen to this account':'Latest update (Listen)';
  if(activeListenButton){const previous=activeListenButton;activeListenButton=null;speechSynthesis.cancel();previous.querySelector('span:last-child').textContent=previous.classList.contains('feed-listen')?'Listen to the feed':previous.classList.contains('overview-listen')?'Listen to this account':'Latest update (Listen)';if(previous===button)return}
  const focus=section('overview').chapters.find(item=>item.id==='focus');
  const narrative=isFeed?feedNarration:isOverview?[...document.querySelectorAll('.overview-spoken')].map(item=>item.textContent.trim()).join(' '):`Latest update from Crossover Stockton. ${focus.currentWork||focus.text}`;
  const parts=isFeed?narrative.split(/\n\s*\n/).filter(Boolean):[narrative];
  activeListenButton=button;
  button.querySelector('span:last-child').textContent='Stop listening';
  const speakNext=()=>{if(activeListenButton!==button)return;const part=parts.shift();if(!part){activeListenButton=null;button.querySelector('span:last-child').textContent=idleLabel;return}const update=new SpeechSynthesisUtterance(part);update.lang='en-US';update.rate=.95;update.onend=speakNext;update.onerror=speakNext;speechSynthesis.speak(update)};
  speakNext();
}
function isSitePage(path){
  if(isPreview)return path===previewBase;
  return path==='/'||path==='/about/'||path==='/feed/'||/^\/street-dogs\/(?:overview|activity|tasks|metrics|findings|organizations|improvements|places|events|sources)\/$/.test(path)||/^\/(?:record|organization)\/[^/]+\/$/.test(path);
}
function navigateToSitePage(event){
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const link=event.target.closest('a[href]');
  if(!link||link.target||link.hasAttribute('download'))return;
  const destination=new URL(link.href);
  if(destination.origin!==location.origin||!isSitePage(destination.pathname))return;
  if(destination.pathname===location.pathname&&destination.search===location.search&&destination.hash){
    const target=document.getElementById(decodeURIComponent(destination.hash.slice(1)));
    if(!target)return;
    event.preventDefault();
    const targetY=Math.max(0,target.getBoundingClientRect().top+window.scrollY-85);
    history.replaceState({...history.state,scrollY:window.scrollY},'');
    if(destination.href!==location.href)history.pushState({scrollY:targetY},'',destination.pathname+destination.search+destination.hash);
    target.scrollIntoView({behavior:'smooth',block:'start'});
    return;
  }
  event.preventDefault();
  if(destination.href===location.href)return;
  history.replaceState({...history.state,scrollY:window.scrollY},'');
  history.pushState({scrollY:0},'',destination.pathname+destination.search+destination.hash);
  activeFilter='all';
  document.body.classList.remove('menu-open');
  render();
  document.getElementById('content')?.focus({preventScroll:true});
}
function restoreSitePage(event){
  activeFilter='all';
  document.body.classList.remove('menu-open');
  render();
  requestAnimationFrame(()=>window.scrollTo(0,event.state?.scrollY||0));
}
async function start(){try{const [storyResponse,recordsResponse,feedContentResponse,feedTextResponse]=await Promise.all([fetch('/feed.json'),fetch('/data/records.json'),fetch('/feed-content.html'),fetch('/feed.txt')]);if(!storyResponse.ok||!recordsResponse.ok||!feedContentResponse.ok||!feedTextResponse.ok)throw new Error('Could not load the public feed.');feed=await storyResponse.json();feedContent=await feedContentResponse.text();feedNarration=await feedTextResponse.text();const data=await recordsResponse.json();records=Object.values(data.records||{});byId=new Map(records.map(item=>[item.id,item]));gap=records.find(item=>item.schema==='gap'&&item.fields?.default)||records.find(item=>item.schema==='gap');if(!gap)throw new Error('No current gap in the public feed.');gapStory=feed.chapters.find(item=>item.id==='gap');about=feed.chapters.find(item=>item.id==='about');menu=feed.silent.menu;history.scrollRestoration='manual';history.replaceState({...history.state,scrollY:window.scrollY},'');render({reuseExisting:true});document.addEventListener('click',handleListen);document.addEventListener('click',handleListingControls);document.addEventListener('click',navigateToSitePage);window.addEventListener('popstate',restoreSitePage);document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.body.classList.contains('menu-open'))toggleMenu();if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();document.querySelector('.home-search-toggle')?.click()}})}catch(error){document.getElementById('app').innerHTML=`<main class="loading"><h1>Site unavailable</h1><p>${esc(error.message)}</p></main>`}}
start();
