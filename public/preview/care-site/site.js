// A separate SITE.md design preview. The feed and records remain the source of page text.
const paths={index:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',story:'<path d="M3 4h7a3 3 0 0 1 3 3v14a3 3 0 0 0-3-3H3zM21 4h-5a3 3 0 0 0-3 3v14a3 3 0 0 1 3-3h5z"/>',activity:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',tasks:'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="m8 12 2.5 2.5L16 9"/>',metrics:'<path d="M4 20v-8h4v8m2 0V4h4v16m2 0v-6h4v6M2 21h20"/>',findings:'<path d="M9 18h6M10 21h4M8 15a7 7 0 1 1 8 0l-1 3H9z"/>',organizations:'<circle cx="9" cy="8" r="3"/><path d="M2 20v-2a7 7 0 0 1 14 0v2M17 5a3 3 0 0 1 0 6M18 14a6 6 0 0 1 4 6"/>',improvements:'<path d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5"/>',places:'<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',events:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',document:'<path d="M5 2h9l4 4v5M14 2v4h4M5 2v20h8"/><circle cx="16" cy="16" r="3.5"/><path d="m18.5 18.5 3 3"/>',audioLines:'<path d="M3 10v4M7 7v10M11 4v16M15 8v8M19 6v12M22 10v4"/>',about:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',chevron:'<path d="m9 5 7 7-7 7"/>',menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',close:'<path d="M5 5l14 14M19 5 5 19"/>'};
paths.home='<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>';
paths.headphones='<path d="M3 14v-3a9 9 0 0 1 18 0v3"/><rect x="3" y="13" width="4" height="7" rx="2"/><rect x="17" y="13" width="4" height="7" rx="2"/>';
paths.circlePlay='<circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>';
paths.circlePause='<circle cx="12" cy="12" r="10"/><path d="M10 9v6m4-6v6"/>';
// Original left-facing dog-head silhouette inspired by the supplied profile reference.
paths.dog='<path fill="currentColor" stroke="none" d="M93 49V22c0-8 3-11 7-8 18 13 37 51 41 79 2 11 17 24 28 34 5 5 3 10-1 15-16 21-45 36-73 38-6 0-9-3-12-9l-17-42H40c-12 0-17-5-22-15-5-10-9-20-8-27 0-4 3-6 7-7l31-5c9-17 23-26 45-26Z"/><path fill="currentColor" stroke="none" d="M65 47V32c0-8 2-11 5-9 6 4 11 12 13 20Z"/>';
paths.paw='<ellipse cx="4.7" cy="9" rx="1.7" ry="2.2" fill="currentColor" stroke="none"/><ellipse cx="9.4" cy="5.4" rx="1.7" ry="2.3" fill="currentColor" stroke="none"/><ellipse cx="14.6" cy="5.4" rx="1.7" ry="2.3" fill="currentColor" stroke="none"/><ellipse cx="19.3" cy="9" rx="1.7" ry="2.2" fill="currentColor" stroke="none"/><path fill="currentColor" stroke="none" d="M12 11c-1.7 0-2.8 1.5-3.8 2.8-.5.6-1.1 1.1-1.8 1.5-1.5 1-1.7 2.7-.8 3.8.9 1.1 2.3 1.1 3.6.5.9-.4 1.8-.8 2.8-.8s1.9.4 2.8.8c1.3.6 2.7.6 3.6-.5.9-1.1.7-2.8-.8-3.8-.7-.4-1.3-.9-1.8-1.5-1-1.3-2.1-2.8-3.8-2.8Z"/>';
paths.firsthand='<path d="M2 12s3.5-5 10-5 10 5 10 5-3.5 5-10 5S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>';
paths.question='<circle cx="12" cy="12" r="10"/><path d="M9.5 9a2.7 2.7 0 0 1 5.3.7c0 2-2.8 2.4-2.8 4.4M12 17.5h.01"/>';
paths.arrowLeft='<path d="M20 12H4m6 6-6-6 6-6"/>';
paths.arrowExternal='<path d="M6 18 18 6M8 6h10v10"/>';
paths.linkedin='<rect x="1" y="1" width="22" height="22" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="6.5" cy="7" r="1.5" fill="currentColor" stroke="none"/><path fill="currentColor" stroke="none" d="M5 10h3v9H5zM10 10h3v1.2c.6-.9 1.5-1.4 2.8-1.4 2.5 0 3.2 1.5 3.2 3.9V19h-3v-5c0-1.1-.2-1.9-1.4-1.9-1.1 0-1.6.8-1.6 2V19h-3z"/>';
paths.document='<path d="M5 2h9l5 5v15H5zM14 2v5h5M8 12h8M8 16h8"/>';
// Internal navigation uses horizontal arrows; destinations outside the site use the diagonal arrow.
const icon=name=>`<svg class="${name.startsWith('arrow')?'link-arrow':''} ${name==='arrowLeft'?'link-arrow-left':''} ${name==='dog'?'dog-icon':''} ${name==='linkedin'?'linkedin-icon':''}" viewBox="${name==='dog'?'0 0 180 190':'0 0 24 24'}" aria-hidden="true">${paths[name]||paths.document}</svg>`;
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const short=(value,n=210)=>{const text=String(value||'').trim();return text.length>n?`${text.slice(0,n).trimEnd()}…`:text};
const previewBase='/preview/care-site/index.html';
const isPreview=location.pathname.startsWith(previewBase);

const route=()=>{
  if(!isPreview){
    const path=location.pathname;
    if(path==='/'||path==='/street-dogs/overview/'||path==='/feed/')return '/overview';
    if(path==='/our-work/')return '/our-work';
    if(path==='/whats-next/')return '/whats-next';
    if(path==='/questions/')return '/questions';
    if(path==='/about/')return '/about';
    const section=path.match(/^\/street-dogs\/(activity|tasks|metrics|findings|organizations|improvements|places|events|sources)\/$/);
    if(section)return `/${section[1]}`;
    const record=path.match(/^\/(?:record|organization)\/([^/]+)\/$/);
    if(record)return `/record/${decodeURIComponent(record[1])}`;
    return '/overview';
  }
  const params=new URLSearchParams(location.search);
  const page=params.get('page')||'overview';
  return page==='record'?`/record/${params.get('id')||''}`:page==='index'||page==='feed'?'/overview':`/${page}`;
};
const publicationAnchors={'our-work':'our-work','whats-next':'whats-next',questions:'open-questions'};
const href=page=>isPreview?publicationAnchors[page]?`${previewBase}?page=overview#${publicationAnchors[page]}`:`${previewBase}?page=${encodeURIComponent(page==='feed'?'overview':page)}`:publicationAnchors[page]?`/#${publicationAnchors[page]}`:page==='overview'||page==='feed'?'/':page==='about'?'/about/':`/street-dogs/${page}/`;
const recordHref=id=>isPreview?`${previewBase}?page=record&id=${encodeURIComponent(id)}`:`/${byId.get(id)?.schema==='organization'?'organization':'record'}/${encodeURIComponent(id)}/`;
let feed,publication,feedContent,audioManifest,records,byId,gap,gapStory,menu,activeFilter='all';
let narration = null;
let activeTrack = null;
let pendingPosition = 0;
const lookup=id=>byId.get(id);
const section=id=>gapStory.chapters.find(item=>item.id===id);
const related=record=>record.fields?.gap_id===gap.id||(record.fields?.gap_ids||record.fields?.related_gap_ids||[]).includes(gap.id);
const recordText=record=>record?.fields?.statement||record?.fields?.list_context||record?.fields?.summary||record?.fields?.description||record?.description||'';
const recordsFor=part=>part.records?.map(lookup).filter(Boolean)||records.filter(item=>item.schema===part.select?.schema&&(part.select.schema==='organization'?(gap.fields?.organization_ids||[]).includes(item.id):related(item)));
const date=value=>value?new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(`${String(value).slice(0,10)}T12:00:00Z`)):'';
const longDate=value=>value?new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(`${String(value).slice(0,10)}T12:00:00Z`)):'';
const projectDate=(value,month='short')=>value?new Intl.DateTimeFormat('en-US',{month,day:'numeric',year:'numeric',timeZone:'America/Los_Angeles'}).format(new Date(String(value).includes('T')?value:`${value}T12:00:00Z`)):'';
const metricValue=record=>{const value=record?.fields?.value??record?.fields?.reportedValue;return typeof value==='number'?new Intl.NumberFormat('en-US').format(value):value==null?'Unknown':String(value)};
const navGroups=[
  {label:'THE GAP',pages:['overview','feed']},
  {label:'THE RESPONSE',pages:['organizations','improvements','places','events']},
  {label:'OUR WORK',pages:['activity','tasks','metrics','findings']},
];
const navItem=page=>page==='feed'?{page,label:'Feed',icon:'audioLines'}:page==='overview'?{page,label:'Home',icon:'home'}:menu.find(item=>item.page===page);
const navLinks=(current,pages)=>pages.map(page=>{const item=navItem(page);return `<a href="${href(item.page)}" ${current===`/${item.page}`?'aria-current="page"':''}>${icon(item.icon)}<span>${esc(item.label)}</span></a>`}).join('');
const groupedNav=current=>navGroups.map(group=>`<div class="rail-gap">${esc(group.label)}</div><nav class="rail-nav" aria-label="${esc(group.label)}">${navLinks(current,group.pages)}</nav>`).join('');
const groupedMobileNav=current=>navGroups.map(group=>`<div class="rail-gap">${esc(group.label)}</div><nav aria-label="${esc(group.label)}">${navLinks(current,group.pages)}</nav>`).join('');
const recordParents={
  location:{page:'places',label:'Places'},
  organization:{page:'organizations',label:'Organizations'},
  initiative:{page:'improvements',label:'Improvements'},
  event:{page:'events',label:'Events'},
  activity:{page:'activity',label:'Activity'},
  task:{page:'tasks',label:'Actions'},
  measurement:{page:'metrics',label:'Measurements'},
  claim:{page:'metrics',label:'Measurements'},
  finding:{page:'findings',label:'Findings'},
  evidence:{page:'sources',label:'Sources'},
  source:{page:'sources',label:'Sources'},
  development:{page:'activity',label:'Activity'},
  identity:{page:'about',label:'About'},
  principle:{page:'about',label:'About'},
  method:{page:'about',label:'About'},
  person:{page:'about',label:'About'},
  gap:{page:'overview',label:'Home'},
};
const crumbSeparator='<span class="crumb-separator" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7"/></svg></span>';
const breadcrumbTrail=steps=>steps.map((step,index)=>`${index?crumbSeparator:''}${step.url?`<a href="${esc(step.url)}">${esc(step.label)}</a>`:`<span class="crumb-current" aria-current="page">${esc(step.label)}</span>`}`).join('');
const listingBreadcrumb=label=>`<nav class="crumbs" aria-label="Breadcrumb"><div class="crumbs-desktop">${breadcrumbTrail([{label:'Home',url:href('overview')},{label}])}</div></nav>`;
const breadcrumbs=record=>{
  const parent=record&&recordParents[record.schema];
  if(!parent)return '';
  const placeParent=record.schema==='location'&&lookup(record.fields?.parent_location_id);
  const steps=[{label:'Home',url:href('overview')}];
  if(parent.page!=='overview')steps.push({label:parent.label,url:href(parent.page)});
  if(placeParent)steps.push({label:placeParent.title,url:recordHref(placeParent.id)});
  return `<nav class="crumbs" aria-label="Breadcrumb"><div class="crumbs-desktop">${breadcrumbTrail(steps)}</div></nav>`;
};
const heading=(title,description,record)=>`${breadcrumbs(record)}<header class="page-intro"><h1>${esc(title)}</h1>${description?`<p>${esc(description)}</p>`:''}</header>`;
const card=(record,from)=>`<a class="record-card" href="${recordHref(record.id,from)}"><strong>${esc(record.title)}</strong><p>${esc(short(recordText(record)))}</p><small>Open record ${icon('arrow')}</small></a>`;
const recordList=(items,from,grid=false)=>items.length?`<div class="${grid?'record-grid':'record-list'}">${items.map(item=>card(item,from)).join('')}</div>`:'<p class="empty">No public records are listed here yet.</p>';
const safeUrl=value=>/^https:\/\/[^\s]+$/i.test(value||'')?value:'';
const verifiedLocationCoordinates=fields=>{
  if(fields?.coordinates_verified!==true||!Array.isArray(fields.coordinates)||fields.coordinates.length!==2)return '';
  const [latitude,longitude]=fields.coordinates;
  return Number.isFinite(latitude)&&Number.isFinite(longitude)&&Math.abs(latitude)<=90&&Math.abs(longitude)<=180?`${latitude},${longitude}`:'';
};
const locationMapUrl=fields=>{
  if(fields?.google_maps_url){
    try{const url=new URL(fields.google_maps_url);if(url.protocol==='https:'&&['google.com','www.google.com','maps.google.com'].includes(url.hostname)&&url.pathname.startsWith('/maps'))return url.href}catch{}
  }
  const query=fields?.map_reference?.verified===true&&fields.map_reference.precision!=='address'&&verifiedLocationCoordinates(fields)||fields?.map_reference?.query||verifiedLocationCoordinates(fields);
  return query?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`:'';
};
const locationEmbedUrl=fields=>{
  const reference=fields?.map_reference;
  const coordinates=verifiedLocationCoordinates(fields);
  if(reference?.verified===true&&reference.embed_url){
    try{
      const url=new URL(reference.embed_url);
      if(url.protocol==='https:'&&['google.com','www.google.com','maps.google.com'].includes(url.hostname)&&url.pathname==='/maps/embed'&&url.searchParams.get('pb'))return url.href;
    }catch{}
  }
  const query=reference?.verified===true&&reference.precision==='address'&&reference.query?reference.query:coordinates;
  return query?`https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`:'';
};
const locationMapPanel=record=>{
  const fields=record.fields||{},embed=locationEmbedUrl(fields);
  if(!embed)return '';
  const map=locationMapUrl(fields);
  const label=fields.address||fields.map_reference?.query||record.title;
  return `<section class="location-map-panel" aria-label="Map of ${esc(record.title)}"><div class="location-map-header"><span>${icon('places')}${esc(label)}</span>${map?`<a class="text-link" href="${esc(map)}" target="_blank" rel="noopener noreferrer">Open in Google Maps ${icon('arrowExternal')}</a>`:''}</div><iframe class="location-map-iframe" src="${esc(embed)}" title="Google map of ${esc(record.title)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></section>`;
};
const myMapsEmbedUrl=value=>{
  if(typeof value!=='string')return '';
  try{const url=new URL(value);return url.protocol==='https:'&&['google.com','www.google.com'].includes(url.hostname)&&/^\/maps\/d\/(?:u\/\d+\/)?embed$/.test(url.pathname)&&url.searchParams.get('mid')?url.href:''}catch{return ''}
};
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
function overview(){const chapter=section('overview'),situation=chapter.chapters.find(item=>item.id==='situation'),figures=chapter.chapters.find(item=>item.id==='key-figures'),focus=chapter.chapters.find(item=>item.id==='focus'),activity=section('activity'),development=lookup(activity.chapters.find(item=>item.id==='developments').records[0]),finding=lookup(section('findings').records[0]),statusTask=lookup(focus.statusRecord),statusDate=date(statusTask?.fields?.started_at);return `${heading(situation.title,chapter.summary,'/overview')}<div class="overview-status"><strong>${statusTask?.fields?.status==='in_progress'?'Investigation in progress':'Investigation status unknown'}</strong>${statusDate?`<span>Last substantive update: ${esc(statusDate)}</span>`:''}</div><p class="overview-current"><strong>Currently:</strong> ${esc(focus.currentWork||focus.text)}</p><section class="story-hero"><div><h2>What needs attention</h2><p>${esc(situation.text)}</p></div><img src="${esc(gap.fields?.preferred_image||feed.silent.homePage.image)}" alt="${esc(situation.imageAlt||feed.silent.homePage.imageAlt)}"></section><div class="section-title"><h2>${esc(figures.title)}</h2><a class="text-link" href="${href('metrics')}">All measurements ${icon('arrow')}</a></div><div class="figure-grid">${figures.figures.map(item=>{const record=lookup(item.record);return `<article class="figure"><strong>${esc(metricValue(record))}</strong><span>${esc(item.label)}</span><small>${esc(item.context)}</small><a class="text-link" href="${recordHref(item.record,'/overview')}">${esc(item.more.label)} ${icon('arrow')}</a></article>`}).join('')}</div><div class="section-title"><h2>Our current focus</h2><a class="text-link" href="${href('activity')}">View activity ${icon('arrow')}</a></div><div class="two-col"><article class="panel"><h2>${esc(focus.headline)}</h2><p>${esc(focus.text)}</p>${development?`<div class="section-title"><h2>Latest development</h2></div>${card(development,'/overview')}`:''}</article><article class="panel"><h2>Developing finding</h2>${finding?`<p>${esc(short(recordText(finding),440))}</p><p style="margin-top:16px"><a class="text-link" href="${recordHref(finding.id,'/overview')}">Read finding and evidence ${icon('arrow')}</a></p>`:''}</article></div><div class="section-title"><h2>More from this gap</h2></div><nav class="tiles" aria-label="More gap sections">${menu.filter(item=>item.page!=='overview').map(item=>`<a class="tile" href="${href(item.page)}"><div class="tile-head">${icon(item.icon)}${icon('arrow')}</div><strong>${esc(item.label)}</strong><span>${esc(item.description)}</span></a>`).join('')}</nav>`}
function narrativeOverview(){
  const chapter=section('overview'),situation=chapter.chapters.find(item=>item.id==='situation'),focus=chapter.chapters.find(item=>item.id==='focus');
  const statusTask=lookup(focus.statusRecord),updated=date(chapter.updatedAt||statusTask?.fields?.started_at);
  const opening=esc(situation.text)
    .replace('Animal Services reports shelter-capacity pressure',`<a class="text-link" href="${recordHref('stocktonia-2026-10-20-sas-capacity-intake','/overview')}">Animal Services reports shelter-capacity pressure</a>`)
    .replace('rescue groups are responding',`<a class="text-link" href="${recordHref('stockton-street-dogs','/overview')}">rescue groups are responding</a>`)
    .replace('number of dogs currently on the streets remains unknown',`<a class="text-link" href="${recordHref('stockton-current-street-dog-population-unknown','/overview')}">number of dogs currently on the streets remains unknown</a>`);
  const work=esc(focus.currentWork||focus.text).replace('7,183 Animal Services case records',`<a class="text-link" href="${recordHref('task-review-sas-field-call-records','/overview')}">7,183 Animal Services case records</a>`);
  return `${breadcrumbs('/overview','Overview')}<article class="overview-report" aria-labelledby="overview-report-title"><header class="overview-report-header"><p class="overview-report-kicker">CURRENT FOCUS</p><h1 id="overview-report-title">Overview</h1><p class="overview-report-date">Updated ${esc(updated||'date pending')}</p><button class="overview-listen" type="button"><span class="listen-icon" aria-hidden="true">▶</span><span>Listen</span></button></header><p class="overview-spoken overview-opening">${opening}</p><a class="overview-continue" href="#overview-more">Continue reading ${icon("arrow")}</a><div id="overview-more" class="overview-more"><p class="overview-spoken">${esc(focus.text)}</p><p class="overview-spoken">${work}</p><p class="overview-support">Explore the <a class="text-link" href="${href('metrics')}">measurements</a>, <a class="text-link" href="${href('findings')}">findings</a>, <a class="text-link" href="${href('organizations')}">organizations</a>, and <a class="text-link" href="${href('activity')}">activity</a> behind this account.</p></div></article><div class="overview-workspace"><h2 class="overview-workspace-title">Explore the evidence</h2>${overview()}</div>`;
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
  return id==='places'?recordsFor(part).filter(record=>!record.fields?.canonical_location_id):recordsFor(part);
}
function recordStatus(record){
  const fields=record.fields||{};
  return String(fields.status||fields.development_stage||fields.stage||fields.verificationStatus||'').toLowerCase();
}
function listingFilterValue(record,id){return id==='places'?record.fields?.location_type:id==='metrics'?record.schema:recordStatus(record)}
const placeTypeLabels={animal_care:'Animal care',human_services:'Human services',transitional_housing:'Transitional housing',street_corridor:'Street corridors',park:'Parks',general_area:'General areas'};
function filterLabel(value){return placeTypeLabels[value]|| (value==='measurement'?'Measurements':value==='claim'?'Claims and unknowns':value.replaceAll('_',' '))}
function recordDate(record){
  const fields=record.fields||{};
  const raw=fields.occurred_at||fields.started_at||fields.published_at||fields.last_reviewed_at||record.dateForSort?.value;
  return raw?(/^\d{4}-\d{2}-\d{2}/.test(raw)?date(raw):String(raw)):'';
}
function recentUpdates(limit,siteWide=false){
  const updateDate=record=>record.schema==='activity'?record.fields?.occurred_at:record.schema==='finding'?record.fields?.last_reviewed_at:record.fields?.published_at;
  const candidates=records.filter(record=>(siteWide||related(record))&&updateDate(record)&&(
    record.schema==='activity'||record.schema==='finding'||(record.schema==='evidence'&&record.fields?.source?.url)
  )).sort((a,b)=>updateDate(b).localeCompare(updateDate(a))||a.id.localeCompare(b.id));
  const seenSources=new Set();
  return candidates.filter(record=>{
    if(record.schema!=='evidence')return true;
    const source=record.fields.source.url;
    if(seenSources.has(source))return false;
    seenSources.add(source);
    return true;
  }).slice(0,limit);
}
function emphasizeAccount(text){
  const source=String(text??'');
  const highlights=/Stockton Animal Services|Stockton Street Dogs|Hard Luck|St\. Mary's Pathways|3,106|3[–-]10|\$10\.47 million|7,183|No verified count|capacity pressure|appointments for healthy strays/g;
  let html='',from=0;
  for(const match of source.matchAll(highlights)){
    html+=esc(source.slice(from,match.index))+`<strong>${esc(match[0])}</strong>`;
    from=match.index+match[0].length;
  }
  return html+esc(source.slice(from));
}
function listingRows(items,id){
  if(!items.length)return '<p class="record-empty">No published records match this filter.</p>';
  return items.map(record=>{const childCount=id==='places'?records.filter(item=>item.schema==='location'&&item.fields?.parent_location_id===record.id).length:0;const parent=id==='places'?lookup(record.fields?.parent_location_id):null;const context=childCount?`${childCount} facilities · Stockton, California`:parent?`Part of ${parent.title}`:recordDate(record)||record.schema;const type=id==='places'?filterLabel(record.fields?.location_type):recordStatus(record).replaceAll('_',' ')||record.schema;
    if(id==='places')return `<a class="place-card" href="${recordHref(record.id,`/${id}`)}"><span class="place-card-top"><span class="work-record-status">PLACE</span><span class="place-card-type">${esc(type)}</span></span><strong class="place-card-title">${esc(record.title)}</strong><span class="place-card-description">${esc(short(recordText(record),260))}</span><span class="place-card-footer"><span>${esc(context)}</span><span class="place-card-read">Read more ${icon("arrow")}</span></span></a>`;
    return `<a class="work-record" href="${recordHref(record.id,`/${id}`)}"><span class="work-record-date">${esc(context)}</span><span class="work-record-main"><span class="work-record-status">${esc(type)}</span><strong>${esc(record.title)}</strong><span class="work-record-description">${esc(short(recordText(record),260))}</span></span><span class="work-record-arrow" aria-hidden="true">${icon("arrow")}</span></a>`}).join('');
}
function listingPage(id){
  const item=menu.find(entry=>entry.page===id),part=section(id);
  if(!item||!part)return heading('Page unavailable','This section is not part of the public feed.',`/${id}`);
  const [title,description]=listingCopy[id]||[item.label,item.description];
  const items=listingItems(id),statuses=[...new Set(items.map(record=>listingFilterValue(record,id)).filter(Boolean))];
  if(id==='places')statuses.sort((a,b)=>['animal_care','human_services','transitional_housing','street_corridor','park','general_area'].indexOf(a)-['animal_care','human_services','transitional_housing','street_corridor','park','general_area'].indexOf(b));
  const filters=['all',...(statuses.length>1?statuses:[])];
  const visible=activeFilter==='all'?items:items.filter(record=>listingFilterValue(record,id)===activeFilter);
  return `<div class="work-listing${id==='places'?' work-listing--places':''}">${listingBreadcrumb(item.label)}<h1>${esc(title)}</h1><p class="work-listing-lede">${esc(description)}</p><div class="work-banner"><div><strong>This is part of an evolving public account.</strong><p>These ${items.length} published records retain their sources, dates, and limitations.</p></div><a href="${href('overview')}">${icon("arrowLeft")} Return to Home</a></div><div class="work-listing-head"><h2>${esc(item.label)} <span class="work-visible-count">(${visible.length})</span></h2><button type="button" class="text-link work-search-link">Search all records ${icon("arrow")}</button></div><div class="work-filters" aria-label="Filter ${esc(item.label)}">${filters.map(value=>`<button type="button" data-filter="${esc(value)}" aria-pressed="${activeFilter===value}">${esc(value==='all'?'All':filterLabel(value))}${id==='places'?` <span class="work-filter-count">(${value==='all'?items.length:items.filter(record=>listingFilterValue(record,id)===value).length})</span>`:''}</button>`).join('')}</div><div class="listing-results">${listingRows(visible,id)}</div></div>`;
}
function updateListingFilter(value){
  const id=route().slice(1),items=listingItems(id);
  activeFilter=value;
  const visible=value==='all'?items:items.filter(record=>listingFilterValue(record,id)===value);
  document.querySelector('.listing-results').innerHTML=listingRows(visible,id);
  document.querySelector('.work-visible-count').textContent=`(${visible.length})`;
  document.querySelectorAll('[data-filter]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.filter===value)));
}
const sameEditorialHeading=(item,section)=>item.title.trim().replace(/\s+/g,' ').toLowerCase()===section.title.trim().replace(/\s+/g,' ').toLowerCase();
const editorialTable=table=>table?`<div class="living-table-wrap"><table><caption>${esc(table.caption)}</caption><thead><tr>${table.columns.map(value=>`<th scope="col">${esc(value)}</th>`).join('')}</tr></thead><tbody>${table.rows.map(row=>`<tr>${row.map(value=>`<td>${esc(value)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:'';
function editorialItem(item,section,sourceNumbers){
  const citationNumbers=[...new Set(item.relatedRecordIds||[])].map(id=>sourceNumbers.get(id)).filter(Boolean).sort((a,b)=>a-b);
  const citations=citationNumbers.length?` <sup class="living-citations">[${citationNumbers.map(number=>`<a href="#source-${number}" aria-label="Source ${number}">${number}</a>`).join(', ')}]</sup>`:'';
  const paragraphs=[item.body,...(item.paragraphs||[])];
  const copy=paragraphs.map((text,index)=>`<p>${esc(text)}${index===paragraphs.length-1?citations:''}</p>`).join('');
  return `<article class="living-item${item.image?' has-image':''}" id="${esc(item.id)}"><div class="living-item-copy">${sameEditorialHeading(item,section)?'':`<h3>${esc(item.title)}</h3>`}${copy}${editorialTable(item.table)}</div>${item.image?`<figure class="living-image"><img src="${esc(item.image.src)}" alt="${esc(item.image.alt)}" loading="${section.id==='overview'||section.id==='about'?'eager':'lazy'}"><figcaption class="living-references">${esc(item.image.caption)}</figcaption></figure>`:''}</article>`;
}
function founderProfile(description){
  const identity=records.find(record=>record.schema==='identity');
  const founder=lookup(identity?.fields?.founderPersonId);
  if(!founder)return '';
  const profile=safeUrl(founder.fields?.profileUrl);
  const role=founder.fields?.roles?.find(item=>item.title==='Founder')||founder.fields?.roles?.[0];
  const organization=lookup(role?.organizationId)?.title||'Crossover Stockton';
  description=description||founder.fields?.biography?.[0]||'';
  return `<figure class="living-founder"><img src="${esc(founder.fields?.preferred_image)}" alt="Illustrative portrait of ${esc(founder.fields?.name||founder.title)}" loading="lazy"><figcaption><strong>${esc(founder.fields?.name||founder.title)}</strong><span>${esc(role?.title||'Founder')}, ${esc(organization)}</span><p>${esc(description)}</p>${profile?`<a class="design-button about-linkedin-button" href="${esc(profile)}" target="_blank" rel="noopener noreferrer">${icon('linkedin')}Connect on LinkedIn ${icon('arrowExternal')}</a>`:''}</figcaption></figure>`;
}
function livingPage(page='overview'){
  const isAbout=page==='about';
  const selected=isAbout?publication.sitePublications?.find(item=>item.id==='about'):publication.gapPublications.find(item=>item.gapId===gap?.id);
  if(!selected)return heading('Page unavailable','No publication is available.','/overview');
  const sectionId=page==='questions'?'open-questions':page;
  const sections=[...selected.sections].sort((a,b)=>a.order-b.order);
  if(!sections.some(item=>item.id===sectionId))return heading('Page unavailable','This editorial page is not published.','/overview');
  const items=id=>selected.items.filter(item=>item.section===id&&item.status==='published').sort((a,b)=>a.order-b.order);
  const sectionNav=isAbout?'':`<nav class="living-section-nav" aria-label="Publication sections">${sections.map(item=>{const target=item.id==='open-questions'?'questions':item.id;return `<a href="${target==='overview'?`${href('overview')}#overview`:href(target)}" ${item.id===sectionId?'aria-current="page"':''}>${esc(item.id==='open-questions'?'Questions':item.title)}</a>`}).join('')}</nav>`;
  const latest=Array.isArray(records)?recentUpdates(7,isAbout):[];
  const updateDate=record=>record.schema==='activity'?record.fields?.occurred_at:record.schema==='finding'?record.fields?.last_reviewed_at:record.fields?.published_at;
  const updateType=record=>record.schema==='activity'?'Activity':record.schema==='finding'?'Finding':'Source report';
  const updates=`<aside class="living-updates" aria-labelledby="living-updates-title"><h2 id="living-updates-title">Latest updates</h2><div class="living-update-list">${latest.map(record=>`<a class="living-update" href="${recordHref(record.id)}"><h3>${esc(record.title)}</h3><p>${esc(short(recordText(record),155))}</p><small>${esc(date(updateDate(record)))} · ${updateType(record)}</small></a>`).join('')}</div><a class="living-updates-all" href="${href('activity')}">View activity ${icon('arrow')}</a></aside>`;
  const feedUpdated=selected.items.filter(item=>item.status==='published').map(item=>item.updatedAt).sort().at(-1);
  const sourceIds=[...new Set(sections.flatMap(section=>items(section.id).flatMap(item=>item.relatedRecordIds||[])))].filter(id=>lookup(id));
  const sourceNumbers=new Map(sourceIds.map((id,index)=>[id,index+1]));
  const sources=sourceIds.length?`<section class="living-section living-sources" id="feed-sources"><details><summary>Sources (${sourceIds.length})</summary><ol>${sourceIds.map((id,index)=>`<li id="source-${index+1}"><a href="${recordHref(id)}">${esc(lookup(id).title)}</a></li>`).join('')}</ol></details></section>`:'';
  const renderSection=section=>{
    const title=section.id==='open-questions'?'Questions':section.title;
    const isOpening=isAbout||section.id==='overview';
    const heading=isOpening?`<div class="living-feed-head"><div><h1>${esc(title)}</h1><span class="living-feed-date">Updated ${esc(isAbout?longDate(feedUpdated):projectDate(feedUpdated,'long'))}</span></div><button class="overview-listen living-listen" type="button" data-track="${isAbout?'about':'account'}" data-listen-label="${isAbout?'Listen to About':'Listen to the feed'}"><span class="listen-icon" aria-hidden="true">${icon('circlePlay')}</span><span>${isAbout?'Listen to About':'Listen to the feed'}</span></button></div>`:`<h2>${esc(title)}</h2>`;
    return `<section class="living-section${isOpening?' living-section--overview':''}" id="${esc(section.id)}">${heading}<div class="living-items">${items(section.id).map(item=>editorialItem(item,section,sourceNumbers)).join('')}${isAbout?founderProfile(selected.founderSummary):''}</div></section>`;
  };
  return `<div class="living-layout"><div class="living-page${isAbout?'':' living-page--continuous'}">${sectionNav}${(isAbout?sections.filter(item=>item.id===sectionId):sections).map(renderSection).join('')}${sources}</div>${updates}</div>`;
}
function designOverview(){return livingPage('overview')}
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
function locationSections(record){
  if(record.schema!=='location')return '';
  const fields=record.fields||{};
  const children=records.filter(item=>item.schema==='location'&&item.fields?.parent_location_id===record.id);
  if(children.length){
    const embed=myMapsEmbedUrl(fields.facility_map_embed_url);
    const fullMap=embed.replace(/\/embed\?/, '/viewer?');
    const links=children.map(child=>{const map=locationMapUrl(child.fields);return `<article class="facility-card"><h3><a class="text-link" href="${recordHref(child.id)}">${esc(child.title)} ${icon('arrow')}</a></h3><p>${esc(child.fields?.address||child.fields?.area||'Address unverified')}</p><p>${esc(child.fields?.services?.join(' · ')||recordText(child))}</p>${map?`<a class="text-link" href="${esc(map)}" target="_blank" rel="noopener noreferrer">Google Maps ${icon('arrowExternal')}</a>`:''}</article>`}).join('');
    const mapPanel=embed?`<div class="facility-map-wrap"><iframe class="facility-map" src="${esc(embed)}" title="Map of facilities in ${esc(record.title)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" tabindex="-1" allowfullscreen></iframe><button class="facility-map-activate" type="button"><span>Click to interact with map</span></button></div><p class="facility-map-help"><span class="facility-map-instructions">Scroll past without changing the map. Activate it to drag or zoom.</span> <button class="facility-map-lock text-link" type="button" hidden>Done using map</button> <a class="text-link" href="${esc(fullMap)}" target="_blank" rel="noopener noreferrer">Open full map ${icon('arrowExternal')}</a></p>`:'';
    return `<section class="panel"><h2>Overview</h2><p>${esc(fields.description)}</p><p>${esc(fields.last_known_outcome)}</p></section><section class="panel"><h2>Map and facilities</h2><p>Three facilities share the St. Mary's campus address at 545 W. Sonora Street, so their map markers may overlap. The five cards below distinguish each facility. No map link identifies where the reported dog outreach occurred.</p>${mapPanel}<div class="facility-grid">${links}</div></section><section class="panel"><h2>Investigation questions</h2><ul><li>Which facilities admit people accompanied by dogs, and what restrictions apply?</li><li>What animal care is available nearby?</li><li>Where do people encounter barriers to care?</li><li>What could improve access for people and dogs?</li></ul></section>`;
  }
  const parent=lookup(fields.parent_location_id);
  if(parent){
    const directory=(fields.service_directory_urls||[]).map((url,index)=>safeUrl(url)?`<a class="text-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Service directory${fields.service_directory_urls.length>1?` ${index+1}`:''} ${icon('arrowExternal')}</a>`:'').filter(Boolean);
    return `<div class="location-detail-top"><section class="panel"><h2>Facility information</h2><dl>${fields.address?`<dt>Address</dt><dd>${esc(fields.address)}</dd>`:''}${fields.services?.length?`<dt>Services</dt><dd>${esc(fields.services.join(', '))}</dd>`:''}${fields.operating_organization?`<dt>Operator</dt><dd>${esc(fields.operating_organization)}</dd>`:''}${fields.phone?`<dt>Phone</dt><dd>${esc(fields.phone)}</dd>`:''}${fields.reported_capacity_beds?`<dt>Reported project capacity</dt><dd>${esc(fields.reported_capacity_beds)} beds in a City presentation; current availability and dog-inclusive capacity unverified. ${safeUrl(fields.capacity_report_url)?`<a class="text-link" href="${esc(fields.capacity_report_url)}" target="_blank" rel="noopener noreferrer">City source ${icon('arrowExternal')}</a>`:''}</dd>`:''}<dt>Verification</dt><dd>${esc(fields.verification_status)}</dd></dl><p><a class="text-link" href="${recordHref(parent.id)}">Explore the surrounding area ${icon('arrow')}</a></p>${directory.length?`<div class="external-links">${directory.join('')}</div>`:''}<p>Public review information has not been checked; service directories and provider pages may be more useful for current access details.</p></section>${locationMapPanel(record)}</div>`;
  }
  const canonical=lookup(fields.canonical_location_id);
  return canonical?`<section class="panel"><h2>Area record</h2><p>This historical Church Street report is included in the broader area account. It does not identify a particular facility as the outreach site.</p><a class="text-link" href="${recordHref(canonical.id)}">${esc(canonical.title)} ${icon('arrow')}</a></section>`:locationMapPanel(record);
}
function detailPage(path){
  const match=path.match(/^\/record\/([^/]+)$/),record=match&&lookup(match[1]);
  if(!record)return heading('Record unavailable','This record is not in the public feed.',path);
  const fields=record.fields||{};
  const excluded=new Set(['title','name','summary','description','statement','list_context','instructions','limitations','purpose','biography','google_maps_url','website','phone','address','operating_organization','parent_location_id','canonical_location_id','legacy_location_id','facility_map_embed_url']);
  const displayed=Object.entries(fields).filter(([key,value])=>value!=null&&['string','number','boolean'].includes(typeof value)&&!excluded.has(key)).slice(0,20);
  const source=fields.source||{},sourceUrl=safeUrl(source.url||fields.source_url),website=safeUrl(fields.website),profile=safeUrl(fields.profileUrl);
  const external=[sourceUrl&&`<a class="text-link" href="${esc(sourceUrl)}" target="_blank" rel="noopener noreferrer">Original source ${icon("arrowExternal")}</a>`,website&&`<a class="text-link" href="${esc(website)}" target="_blank" rel="noopener noreferrer">Organization website ${icon("arrowExternal")}</a>`,profile&&`<a class="text-link" href="${esc(profile)}" target="_blank" rel="noopener noreferrer">Profile ${icon("arrowExternal")}</a>`].filter(Boolean);
  const mapUrl=fields.location_type==='general_area'?'':locationMapUrl(fields);
  const details=displayed.length?`<dl>${displayed.map(([key,value])=>`<dt>${esc(key.replaceAll('_',' '))}</dt><dd>${esc(value)}</dd>`).join('')}</dl>`:'';
  return `${heading(record.title,recordText(record),record)}<div class="detail-body">
    ${locationSections(record)}
    ${fields.instructions?`<section class="panel"><h2>Instructions</h2><p>${esc(fields.instructions)}</p></section>`:''}
    ${fields.limitations?`<section class="panel"><h2>Limitations</h2><p>${esc(fields.limitations)}</p></section>`:''}
    ${fields.unknown?`<section class="panel"><h2>What remains unknown</h2><p>${esc(fields.unknown)}</p></section>`:''}
    ${source.publisher||external.length||mapUrl?`<section class="panel"><h2>Source and location</h2>${source.publisher?`<p>${esc(source.publisher)}</p>`:''}<div class="external-links">${external.join('')}${mapUrl?`<a class="text-link" href="${esc(mapUrl)}" target="_blank" rel="noopener noreferrer">Open on Google Maps ${icon("arrowExternal")}</a>`:''}</div></section>`:''}
    ${relationGroups(record,'/sources')}
    <section class="panel"><h2>Record details</h2>${details}<details class="raw-fields"><summary>All public fields</summary><pre>${esc(JSON.stringify(fields,null,2))}</pre></details></section>
    ${isPreview?`<p><a class="text-link" href="/${record.schema==='organization'?'organization':'record'}/${encodeURIComponent(record.id)}/">Open permanent record ${icon("arrowExternal")}</a></p>`:''}
  </div>`;
}
function feedPage(){
  const reading=feedContent.replace(/href="\/(?:record|organization)\/([^/"?]+)\/"/g,(_,id)=>`href="${recordHref(decodeURIComponent(id),'/feed')}"`);
  return `<div class="site-feed">${listingBreadcrumb('Feed')}<header class="site-feed-header"><div><h1>Our evolving account</h1><p>${esc(feed.description)}</p><button class="overview-listen feed-listen" type="button"><span class="listen-icon" aria-hidden="true">▶</span><span>Listen to the feed</span></button></div><a class="text-link" href="/feed.txt" target="_blank" rel="noopener noreferrer" aria-label="Open text version of the feed">Text version ${icon("arrowExternal")}</a></header><div class="feed-reading">${reading}</div></div>`;
}
const editorialSectionForPage=page=>({'/overview':'overview','/our-work':'our-work','/whats-next':'whats-next','/questions':'open-questions'})[page];
let sectionNavListening=false;
function updateSectionNav(){
  const nav=document.querySelector('.living-page--continuous .living-section-nav');
  if(!nav?.querySelectorAll)return;
  const sections=['overview','our-work','whats-next','open-questions'].map(id=>document.getElementById(id)).filter(Boolean);
  const active=sections.reduce((selected,section)=>section.getBoundingClientRect().top<=80?section:selected,sections[0]);
  if(!active)return;
  nav.querySelectorAll('a').forEach(link=>{
    const destination=new URL(link.href);
    if(decodeURIComponent(destination.hash.slice(1))===active.id)link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  });
}
function setupSectionNav(){
  if(typeof window.addEventListener!=='function')return;
  if(!sectionNavListening){window.addEventListener('scroll',updateSectionNav,{passive:true});sectionNavListening=true}
  updateSectionNav();
}
function queueEditorialRouteScroll(){
  if(typeof requestAnimationFrame!=='function')return;
  const hash=decodeURIComponent((location.hash||'').slice(1));
  const source=hash.startsWith('source-')?document.getElementById(hash):null;
  if(source?.closest('.living-sources')){
    source.closest('details').open=true;
    requestAnimationFrame(()=>source.scrollIntoView({block:'start'}));
    return;
  }
  const target=['overview','our-work','whats-next','open-questions'].includes(hash)?hash:editorialSectionForPage(route());
  if(!target||target==='overview'&&!hash)return;
  requestAnimationFrame(()=>document.getElementById(target)?.scrollIntoView({block:'start'}));
}
function render({reuseExisting=false,restoreScroll=false}={}){
  if(reuseExisting&&document.querySelector('#app > .care-shell')){
    document.querySelector('.menu-toggle').addEventListener('click',toggleMenu);
    setupHomeSearch();
    setupSectionNav();
    setupFacilityMap();
    if(!restoreScroll)queueEditorialRouteScroll();
    return;
  }
  const current=route();
  const inner=['/overview','/our-work','/whats-next','/questions','/about'].includes(current)?livingPage(current.slice(1)):current.startsWith('/record/')?detailPage(current):listingPage(current.slice(1));
  const activePage=current.startsWith('/record/')?recordParents[lookup(current.slice('/record/'.length))?.schema]?.page:current.slice(1);
  const activeState=page=>current==='/'+page?'aria-current="page"':activePage===page?'aria-current="location"':'';
  const navLink=([page,label,symbol])=>`<a href="${href(page)}" ${activeState(page)}>${icon(symbol)}<span>${label}</span></a>`;
  const primaryLinks=[['tasks','Actions','tasks'],['activity','Activity','activity'],['places','Places','places'],['organizations','Organizations','organizations'],['metrics','Measurements','metrics'],['findings','Findings','findings'],['sources','Sources','document']];
  const mainNavigation=`<nav class="care-rail-nav" aria-label="Project navigation">${primaryLinks.map(navLink).join('')}</nav>`;
  const aboutNavigation=`<nav class="care-rail-nav care-rail-secondary" aria-label="About Crossover">${navLink(['about','About','about'])}</nav>`;
  const grouped=mainNavigation+aboutNavigation;
  const mobileNavigation=`<nav class="care-rail-nav" aria-label="Project navigation">${[...primaryLinks,['improvements','Improvements','improvements'],['events','Events','events']].map(navLink).join('')}</nav>`+aboutNavigation;
  const identity=`<span class="gap-identity-mark" style="background:${esc(gap?.fields?.identity_color||'#0789e8')}"></span><span>${esc(current==='/about'?'ABOUT CROSSOVER':gap?.title||'Crossover Stockton')}</span>`;
  const identityHref=current==='/about'?href('about'):href('overview');
  const shell=`<div class="care-shell"><aside class="care-rail"><a class="care-brand" href="${href('overview')}"><img src="/images/logo_light.webp" alt=""><span>CROSSOVER<br>STOCKTON</span></a><div class="care-rail-groups">${grouped}</div></aside><div class="care-site"><header class="care-top"><a class="care-mobile-brand" href="${href('overview')}"><img src="/images/logo_dark.webp" alt=""><span>CROSSOVER<br>STOCKTON</span></a><a class="gap-identity desktop-identity" href="${identityHref}">${identity}</a><div class="care-top-actions"><div class="home-search"><button class="home-search-toggle" type="button" aria-label="Search the site" aria-expanded="false" aria-controls="home-search-panel"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg></button><div class="home-search-panel" id="home-search-panel" hidden><label for="home-search-input">Search Crossover Stockton</label><input id="home-search-input" type="search" placeholder="Search sections and records"><div class="home-search-results"></div></div></div><a class="desktop-about" href="${href('about')}" ${activeState('about')}>${icon('about')}<span>About</span></a><button class="menu-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu">${icon('menu')}</button></div></header><div class="mobile-menu" id="mobile-menu">${mobileNavigation}</div><main class="main" id="content" tabindex="-1"><div class="content"><div class="gap-identity mobile-identity">${identity}</div>${inner}</div></main><footer class="footer"><div class="footer-inner"><div class="footer-copy"><span>&copy; ${new Date().getFullYear()} Crossover Stockton</span><span>See clearly. Act locally.</span></div><nav class="footer-links" aria-label="Footer"><a href="/feed.txt">Text ${icon('arrowExternal')}</a><a href="/feed.json">Feed JSON ${icon('arrowExternal')}</a><a href="/data/records.json">Data JSON ${icon('arrowExternal')}</a><a href="${href('about')}">About</a></nav></div></footer></div></div>`;
  document.getElementById('app').innerHTML=shell.replace('/images/logo_light.webp','/images/logo_dark.webp');
  syncListenButtons();
  document.title=current==='/about'?`About Crossover · Crossover Stockton${isPreview?' — new site preview':''}`:current==='/overview'?`Street dogs and access to care · Crossover Stockton${isPreview?' — new site preview':''}`:`${(current.startsWith('/record/')?'Record':menu.find(item=>'/'+item.page===current)?.label||'Crossover')} · Street dogs and access to care · Crossover Stockton${isPreview?' — new site preview':''}`;
  document.querySelector('.menu-toggle').addEventListener('click',toggleMenu);
  setupHomeSearch();
  setupSectionNav();
  setupFacilityMap();
  window.scrollTo(0,0);
  if(!restoreScroll)queueEditorialRouteScroll();
}
function setupFacilityMap(){
  const wrap=document.querySelector('.facility-map-wrap');
  if(!wrap?.querySelector)return;
  const map=wrap.querySelector('.facility-map'),activate=wrap.querySelector('.facility-map-activate'),lock=document.querySelector('.facility-map-lock'),instructions=document.querySelector('.facility-map-instructions');
  const setActive=active=>{wrap.classList.toggle('is-active',active);activate.hidden=active;lock.hidden=!active;map.tabIndex=active?0:-1;instructions.textContent=active?'Drag to explore the map. Hold Ctrl while scrolling to zoom.':'Scroll past without changing the map. Activate it to drag or zoom.'};
  activate.addEventListener('click',()=>setActive(true));
  lock.addEventListener('click',()=>{setActive(false);activate.focus()});
}
function setupHomeSearch(){
  const button=document.querySelector('.home-search-toggle'),panel=document.querySelector('.home-search-panel'),input=document.querySelector('#home-search-input'),results=document.querySelector('.home-search-results');
  const pages=[{label:'About Crossover',url:href('about')},...menu.filter(item=>item.page!=='feed').map(item=>({label:item.page==='overview'?'Home':item.label,url:href(item.page)}))];
  const recordPages=records.map(item=>({label:item.title,url:recordHref(item.id,'/overview'),search:`${item.title} ${recordText(item)} ${item.schema}`.toLowerCase()}));
  function update(){const term=input.value.trim().toLowerCase();const matches=(term?[...pages,...recordPages].filter(item=>(item.search||item.label.toLowerCase()).includes(term)):pages).slice(0,18);results.innerHTML=matches.length?matches.map(item=>`<a href="${item.url}">${esc(item.label)} ${icon('arrow')}</a>`).join(''):'<p>No matching sections or records.</p>'}
  button.addEventListener('click',()=>{const open=panel.hidden;panel.hidden=!open;button.setAttribute('aria-expanded',String(open));if(open){update();input.focus()}});
  input.addEventListener('input',update);
  panel.addEventListener('keydown',event=>{if(event.key==='Escape'){panel.hidden=true;button.setAttribute('aria-expanded','false');button.focus()}});
}
function toggleMenu(){const open=!document.getElementById('mobile-menu').classList.contains('open');document.getElementById('mobile-menu').classList.toggle('open',open);document.querySelector('.menu-toggle').setAttribute('aria-expanded',String(open));document.querySelector('.menu-toggle').setAttribute('aria-label',open?'Close gap menu':'Open gap menu');document.querySelector('.menu-toggle').innerHTML=icon(open?'close':'menu');document.body.classList.toggle('menu-open',open)}
function handleListingControls(event){
  const filterButton=event.target.closest('[data-filter]');
  if(filterButton){updateListingFilter(filterButton.dataset.filter);return}
  if(event.target.closest('.work-search-link'))document.querySelector('.home-search-toggle')?.click();
}
const trackTitles={account:'Street dogs and access to care',overview:'Overview','our-work':'Our work','whats-next':"What's next",'open-questions':'Questions',about:'About Crossover'};
const listenLabels={account:'Listen to the feed',overview:'Listen to overview','our-work':'Listen to our work','whats-next':"Listen to what's next",'open-questions':'Listen to questions',about:'Listen to About'};
const trackForButton=button=>button.dataset.track||'account';
const positionKey=track=>`crossover-audio:${track}:${audioManifest[track].version}`;
function savePosition(){
  if(!activeTrack||!Number.isFinite(narration.currentTime))return;
  try{localStorage.setItem(positionKey(activeTrack),String(narration.currentTime))}catch{}
}
function updateMediaPosition(){
  if(!('mediaSession' in navigator)||!navigator.mediaSession.setPositionState||!Number.isFinite(narration.duration))return;
  try{navigator.mediaSession.setPositionState({duration:narration.duration,playbackRate:narration.playbackRate,position:Math.min(narration.currentTime,narration.duration)})}catch{}
}
function syncListenButtons(){
  if(!narration)return;
  document.querySelectorAll('.home-listen,.overview-listen').forEach(button=>{
    const track=trackForButton(button),playing=track===activeTrack&&!narration.paused;
    button.querySelector('span:last-child').textContent=playing?'Pause listening':button.dataset.listenLabel||listenLabels[track];
    const listenIcon=button.querySelector('.listen-icon');
    if(button.classList.contains('living-listen'))listenIcon.innerHTML=icon(playing?'circlePause':'circlePlay');
    else listenIcon.textContent=playing?'Ⅱ':'▶';
    button.setAttribute('aria-pressed',String(playing));
  });
  const player=document.getElementById('narration-player');
  if(player){player.hidden=!activeTrack;player.querySelector('.narration-title').textContent=trackTitles[activeTrack]||''}
  if('mediaSession' in navigator)navigator.mediaSession.playbackState=narration.paused?'paused':'playing';
  updateMediaPosition();
}
function seekBy(seconds){
  if(!Number.isFinite(narration.duration))return;
  narration.currentTime=Math.max(0,Math.min(narration.duration,narration.currentTime+seconds));
  savePosition();updateMediaPosition();
}
function closeNarration(){
  savePosition();
  narration.pause();
  activeTrack=null;
  pendingPosition=0;
  narration.removeAttribute('src');
  narration.load();
  if('mediaSession' in navigator)navigator.mediaSession.metadata=null;
  syncListenButtons();
}
function setupNarration(){
  narration=new Audio();
  const player=document.createElement('div');
  player.id='narration-player';player.className='narration-player';player.hidden=true;
  player.innerHTML='<strong class="narration-title"></strong><button type="button" data-seek="-15" aria-label="Back 15 seconds">↶ 15</button><button type="button" data-seek="30" aria-label="Forward 30 seconds">30 ↷</button><label>Speed <select aria-label="Playback speed"><option value="0.75">0.75×</option><option value="1" selected>1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></label><button type="button" data-close-player aria-label="Close audio player"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>';
  narration.controls=true;narration.preload='metadata';
  player.insertBefore(narration,player.querySelector('[data-seek]'));
  document.body.append(player);
  player.addEventListener('click',event=>{if(event.target.closest('[data-close-player]')){closeNarration();return}const button=event.target.closest('[data-seek]');if(button)seekBy(Number(button.dataset.seek))});
  player.querySelector('select').addEventListener('change',event=>{narration.playbackRate=Number(event.target.value);updateMediaPosition()});
  narration.addEventListener('loadedmetadata',()=>{if(pendingPosition>0&&pendingPosition<narration.duration-1)narration.currentTime=pendingPosition;pendingPosition=0;updateMediaPosition()});
  narration.addEventListener('timeupdate',()=>{savePosition();updateMediaPosition()});
  narration.addEventListener('seeked',savePosition);
  narration.addEventListener('play',syncListenButtons);
  narration.addEventListener('pause',()=>{savePosition();syncListenButtons()});
  narration.addEventListener('ended',()=>{try{localStorage.removeItem(positionKey(activeTrack))}catch{}activeTrack=null;syncListenButtons()});
  window.addEventListener('pagehide',savePosition);
  if('mediaSession' in navigator){
    const actions={play:()=>narration.play(),pause:()=>narration.pause(),seekbackward:details=>seekBy(-(details.seekOffset||15)),seekforward:details=>seekBy(details.seekOffset||30),seekto:details=>{if(Number.isFinite(details.seekTime)){narration.currentTime=details.seekTime;savePosition()}}};
    for(const [action,handler] of Object.entries(actions))try{navigator.mediaSession.setActionHandler(action,handler)}catch{}
  }
}
function handleListen(event){
  const button=event.target.closest('.home-listen,.overview-listen');
  if(!button)return;
  const track=trackForButton(button);
  if(activeTrack===track){narration.paused?narration.play():narration.pause();return}
  savePosition();activeTrack=track;
  try{pendingPosition=Number(localStorage.getItem(positionKey(track)))||0}catch{pendingPosition=0}
  narration.src=audioManifest[track].src;
  narration.load();
  if('mediaSession' in navigator&&'MediaMetadata' in window)navigator.mediaSession.metadata=new MediaMetadata({title:trackTitles[track],artist:'Crossover Stockton',album:'Crossover Stockton'});
  narration.play().catch(()=>syncListenButtons());
  syncListenButtons();
}
function isSitePage(path){
  if(isPreview)return path===previewBase;
  return path==='/'||['/about/','/our-work/','/whats-next/','/questions/','/feed/'].includes(path)||/^\/street-dogs\/(?:overview|activity|tasks|metrics|findings|organizations|improvements|places|events|sources)\/$/.test(path)||/^\/(?:record|organization)\/[^/]+\/$/.test(path);
}
function cleanLegacyRecordUrl(){
  if(!route().startsWith('/record/'))return;
  const params=new URLSearchParams(location.search);
  if(!params.has('from'))return;
  params.delete('from');
  const query=params.toString();
  history.replaceState(history.state,'',location.pathname+(query?`?${query}`:'')+location.hash);
}
function resolveLegacySectionRoute(){
  if(isPreview)return false;
  const section={'/our-work/':'our-work','/whats-next/':'whats-next','/questions/':'open-questions'}[location.pathname];
  if(!section)return false;
  history.replaceState(history.state,'',`/${location.search}#${section}`);
  return true;
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
    target.closest('.living-sources details')?.setAttribute('open','');
    const targetY=Math.max(0,target.getBoundingClientRect().top+window.scrollY-60);
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
  cleanLegacyRecordUrl();
  activeFilter='all';
  document.body.classList.remove('menu-open');
  render({restoreScroll:true});
  requestAnimationFrame(()=>window.scrollTo(0,event.state?.scrollY||0));
}
async function start(){try{const [storyResponse,recordsResponse,publicationResponse,feedContentResponse,audioResponse]=await Promise.all([fetch('/site-config.json'),fetch('/data/records.json'),fetch('/publication.json'),fetch('/feed-content.html'),fetch('/audio-manifest.json',{cache:'no-store'})]);if(!storyResponse.ok||!recordsResponse.ok||!publicationResponse.ok||!feedContentResponse.ok||!audioResponse.ok)throw new Error('Could not load the current account.');feed=await storyResponse.json();publication=await publicationResponse.json();feedContent=await feedContentResponse.text();audioManifest=await audioResponse.json();const data=await recordsResponse.json();records=Object.values(data.records||{});byId=new Map(records.map(item=>[item.id,item]));gap=records.find(item=>item.schema==='gap'&&item.fields?.default)||records.find(item=>item.schema==='gap');if(!gap&&route()!='/about')throw new Error('No current gap in the public account.');gapStory=feed.chapters.find(item=>item.id==='gap');menu=feed.silent.menu;setupNarration();cleanLegacyRecordUrl();const migrated=resolveLegacySectionRoute();history.scrollRestoration='manual';history.replaceState({...history.state,scrollY:window.scrollY},'');render({reuseExisting:!migrated});syncListenButtons();document.addEventListener('click',handleListen);document.addEventListener('click',handleListingControls);document.addEventListener('click',navigateToSitePage);window.addEventListener('popstate',restoreSitePage);document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.body.classList.contains('menu-open'))toggleMenu();if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();document.querySelector('.home-search-toggle')?.click()}})}catch(error){document.getElementById('app').innerHTML=`<main class="loading"><h1>Site unavailable</h1><p>${esc(error.message)}</p></main>`}}
start();
