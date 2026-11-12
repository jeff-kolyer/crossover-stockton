const iconPaths = {
  index:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  overview:'<path d="m3 10 9-7 9 7v10H3zM9 20v-7h6v7"/>',
  metrics:'<path d="M4 20v-8h4v8m2 0V4h4v16m2 0v-6h4v6M2 21h20"/>',
  activity:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  story:'<path d="M3 4h7a3 3 0 0 1 3 3v14a3 3 0 0 0-3-3H3zM21 4h-5a3 3 0 0 0-3 3v14a3 3 0 0 1 3-3h5z"/>',
  tasks:'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="m8 12 2.5 2.5L16 9"/>',
  events:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
  places:'<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  organizations:'<circle cx="9" cy="8" r="3"/><path d="M2 20v-2a7 7 0 0 1 14 0v2M17 5a3 3 0 0 1 0 6M18 14a6 6 0 0 1 4 6"/>',
  initiatives:'<path d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5"/>',
  improvements:'<path d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5"/>',
  findings:'<path d="M9 18h6M10 21h4M8 15a7 7 0 1 1 8 0l-1 3H9z"/>',
  sources:'<path d="M3 4h7a3 3 0 0 1 3 3v14a3 3 0 0 0-3-3H3zM21 4h-5a3 3 0 0 0-3 3v14a3 3 0 0 1 3-3h5z"/>',
  about:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
  document:'<path d="M6 2h8l4 4v16H6zM14 2v5h4M9 12h6M9 16h6"/>',
  intake:'<path d="M3 20h18M5 17v-5h3v5M10.5 17V5h3v12M16 17V9h3v8"/>',
  reported:'<path d="M4 5h16v11H9l-5 4V5Z"/><path d="M8 9h8M8 12h5"/>',
  unknown:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4.1 1.9c-1.1.8-1.6 1.3-1.6 2.6M12 17h.01"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  down:'<path d="m5 9 7 7 7-7"/>',
  close:'<path d="M5 5l14 14M19 5 5 19"/>',
  right:'<path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/>',
  left:'<path d="M10.5 4.5 3 12m0 0 7.5 7.5M3 12h18"/>',
  external:'<path d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"/>',
  check:'<path d="m4 12 5 5L20 6"/>'
};
const icon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || iconPaths.document}</svg>`;
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date = value => value ? new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(`${String(value).slice(0,10)}T12:00:00Z`)) : '';
const short = (value, max=175) => {const s=String(value || '').trim();return s.length > max ? `${s.slice(0,max).trimEnd()}…` : s};
const cap = value => String(value || '').replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase());
const viewHref = name => {if(name==='home'||name==='menu')return '/';if(name==='about')return '/about/';const page=name;if(!story.silent.menu.some(item=>item.page===page))throw new Error(`Story has no ${name} page`);return `/${encodeURIComponent(gap.fields.slug)}/${page}/`};
const recordHref = record => `/${record.schema === 'organization' ? 'organization' : 'record'}/${encodeURIComponent(record.id)}/`;
const externalHref = url => /^https:\/\/[^\s]+$/i.test(url || '') ? url : '';
let feed, story, records, byId, gap;
const all = type => records.filter(r => r.schema === type);
const related = type => all(type).filter(r => (r.fields?.gap_ids || r.fields?.related_gap_ids || []).includes(gap.id));
const lookup = id => byId.get(id);
const sorted = items => [...items].sort((a,b) => String(b.dateForSort?.value || b.fields?.occurred_at || b.fields?.last_reviewed_at || '').localeCompare(String(a.dateForSort?.value || a.fields?.occurred_at || a.fields?.last_reviewed_at || '')));
const link = (id,label) => {const r=lookup(id);return r ? `<a href="${recordHref(r)}">${esc(label || r.title)} ${icon('right')}</a>` : ''};
const sourceLink = r => {const f=r.fields || {};const url=externalHref(f.source?.url || f.source_url || f.website);return url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Original source ${icon('external')}</a>` : ''};
const relationLinks = ids => (ids || []).map(id=>link(id)).filter(Boolean).join('<br>');
const row = (r,meta='',activityList=false) => {const work=r.schema === 'task' || r.schema === 'activity';const taskStatus=r.schema === 'task'?r.fields?.status:'';const status=activityList&&taskStatus?` work-${['done','completed'].includes(taskStatus)?'done':taskStatus}`:activityList&&r.schema==='activity'?' work-event':'';const happened=activityList&&(r.schema==='activity'||['done','completed'].includes(taskStatus));const description=r.schema === 'task' ? r.fields?.list_context : r.description || r.fields?.summary || r.fields?.description || r.fields?.statement;return `<article class="row${work?' work-row':''}${status}"><span class="row-icon">${icon(happened?'check':r.schema === 'finding' ? 'findings' : work ? 'activity' : 'document')}</span><div><a class="row-title" href="${recordHref(r)}">${esc(r.title)}</a><p>${esc(short(description,210))}</p></div><span class="row-meta">${esc(meta || date(r.dateForSort?.value || r.fields?.occurred_at || r.fields?.last_reviewed_at))}</span></article>`};
const panel = (heading,body,extra='') => `<section class="panel ${extra}"><h2>${esc(heading)}</h2>${body}</section>`;
const section = (heading,body,right='') => `<section class="section"><div class="section-heading"><h2>${esc(heading)}</h2>${right}</div>${body}</section>`;
const card = (r,body,footer='Open record') => `<a class="list-card" href="${recordHref(r)}"><h3>${esc(r.title)}</h3><p>${esc(short(body || r.description || r.fields?.description || r.fields?.summary,230))}</p><span class="foot"><span>${esc(footer)}</span>${icon('right')}</span></a>`;
const viewLink = (name,label) => `<a class="quiet-link" href="${viewHref(name)}">${esc(label)} ${icon('right')}</a>`;
const recordOrigin = record => {
  const origin=history.state?.recordOrigin;
  const section=story.silent.menu.find(item=>item.page===origin?.page);
  return origin?.recordId===record?.id&&section&&origin.path===viewHref(section.page)?{...origin,label:section.label}:null;
};
const breadcrumb = (record, current) => {
  const origin=record&&recordOrigin(record);
  return `<nav class="page-breadcrumb" aria-label="Breadcrumb"><a href="/">${record?'Index':'Home'}</a><span aria-hidden="true">›</span>${record?`<a href="${origin?esc(origin.path):'/explore/'}" ${origin?'data-return-to-origin':''}>${origin?esc(origin.label):'Records'}</a><span aria-hidden="true">›</span>`:''}<span aria-current="page">${esc(current)}</span></nav>`;
};
const metricValue = r => {const v=r.fields?.value;return typeof v==='number'?new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(v):v == null?'Unknown':String(v)};
const chapter = id => story.chapters.find(item=>item.id===id);
const gapChapter = id => chapter('gap').chapters.find(item=>item.id===id);
const passage = (chapterId,id) => chapterId==='gap'?chapter('gap').chapters.flatMap(item=>[item,...(item.chapters||[])]).find(item=>item.id===id):chapter(chapterId).sections.find(item=>item.id===id);
const chapterHref = id => id==='introduction'?viewHref('home'):id==='about'?viewHref('about'):id==='gap'?viewHref('overview'):id.startsWith('gap.')?viewHref(id.slice(4)):'';
const sectionRecords = section => {
  if(section.record)return [section.record==='$gap'?gap:section.record==='$founder'?lookup(all('identity')[0]?.fields?.founderPersonId):lookup(section.record)].filter(Boolean);
  const query=section.select;
  if(!query)return [];
  let items=all(query.schema).filter(record=>Object.entries(query.where||{}).every(([key,value])=>record.fields?.[key]===value));
  if(query.gap==='$gap.id')items=items.filter(record=>record.fields?.gap_id===gap.id||(record.fields?.gap_ids||[]).includes(gap.id));
  if(query.sort==='newest')items=sorted(items);
  return query.limit?items.slice(0,query.limit):items;
};
const sectionRecord = section => sectionRecords(section)[0];
const field = (record,path) => path.split('.').reduce((value,key)=>value?.[key],record?.fields);

function home(){
  const intro=chapter('introduction'),current=passage('introduction','current-gap'),aboutBridge=passage('introduction','about-bridge');
  const featured=[{page:'overview',label:'Overview',description:gapChapter('overview').teaser,icon:'overview'},...story.silent.menu.filter(item=>['activity','findings'].includes(item.page))];
  return `<div class="home-landing"><section class="home-hero"><div class="home-hero-copy"><h1>${esc(intro.title)}</h1><p>${esc(intro.text)}</p><p class="home-tagline">${esc(intro.tagline)}</p><div class="home-hero-gap"><span>${esc(current.title)}</span><h2>${esc(gap.title)}</h2><p>${esc(field(gap,'description'))}</p><a href="${viewHref('menu')}">Explore the gap ${icon('right')}</a></div></div><img src="${esc(current.image || field(gap,'preferred_image'))}" alt="${esc(current.imageAlt || 'Dog in Stockton')}"></section><nav class="home-featured-links" aria-label="Explore the gap">${featured.map(item=>`<a class="home-link-card" href="${viewHref(item.page)}"><span class="home-link-icon">${icon(item.icon)}</span><span class="home-link-copy"><strong>${esc(item.label)}</strong><small>${esc(item.description)}</small></span><span class="home-link-arrow">${icon('right')}</span></a>`).join('')}</nav><section class="home-about-bridge"><div><h2>${esc(aboutBridge.headline)}</h2><p>${esc(aboutBridge.text)}</p></div><a href="/about/">${esc(aboutBridge.more.label)} ${icon('right')}</a></section></div>`;
}
function gapMenu(){
  const index=story.silent.homePage,intro=chapter('introduction'),current=passage('introduction','current-gap');
  const types={activity:'activity',tasks:'task',findings:'finding',organizations:'organization',improvements:'initiative',places:'location',events:'event',sources:'evidence'};
  const cards=story.silent.menu.map(item=>{
    const count=item.page==='overview'?1:item.page==='metrics'?gapChapter('overview').chapters.find(part=>part.id==='key-figures').figures.length:item.page==='organizations'?all('organization').length:types[item.page]?related(types[item.page]).length:0;
    const noun=item.page==='overview'?'overview':item.page==='metrics'?'key figures':item.page==='findings'?(count===1?'finding':'findings'):item.page==='organizations'?'organizations':item.page==='improvements'?'ideas':item.page==='places'?'places':item.page==='sources'?'sources':count===1?'record':'records';
    return `<a class="home-link-card" href="${viewHref(item.page)}"><span class="home-link-icon">${icon(item.icon)}</span><span class="home-link-copy"><strong>${esc(item.label)}</strong><small>${esc(item.homeDescription)}</small>${count?`<em>${count} ${noun}</em>`:''}</span><span class="home-link-arrow">${icon('right')}</span></a>`;
  }).join('');
  return `<div class="gap-menu-page"><header class="home-introduction"><h1>${esc(intro.title)}</h1><p>${esc(intro.text)} ${esc(intro.tagline)}</p></header><section class="gap-index-hero"><div class="gap-index-copy"><span class="current-gap-tag">${esc(current.title)}</span><h2>${esc(gap.title)}</h2><p>${esc(chapter('gap').text)}</p><a href="${viewHref('overview')}">${esc(index.actionLabel)} ${icon('right')}</a></div><div class="gap-index-image"><img src="${esc(index.image)}" alt="${esc(index.imageAlt)}"></div></section><h2 class="gap-index-section-heading">Explore this gap</h2><nav class="home-link-grid" aria-label="Explore ${esc(gap.title)}">${cards}</nav></div>`;
}
function overview(){
  const situation=passage('gap','situation'), facts=passage('gap','key-figures'), focus=passage('gap','focus'), developments=passage('gap','developments'), finding=lookup(gapChapter('findings').records[0]);
  const recent=lookup(developments.records[0]);
  return `<div class="gap-overview"><section class="hero gap-hero"><div class="hero-copy"><h2>${esc(gap.title)}</h2><p>${esc(situation.text)}</p></div><div class="hero-visual"><img class="hero-image" src="${esc(field(gap,'preferred_image'))}" alt="${esc(situation.imageAlt)}"></div></section>
  <div class="gap-facts" aria-label="${esc(facts.title)}">${facts.figures.map((item,index)=>{const record=lookup(item.record),fields=record.fields,value=record.schema==='measurement'?metricValue(record):fields.reportedValue,href=item.more.chapter?chapterHref(item.more.chapter):recordHref(lookup(item.more.record));return `<a class="gap-fact" href="${href}"><span class="gap-fact-icon">${icon(['intake','reported','unknown'][index])}</span><span class="gap-fact-content"><strong>${esc(value)}</strong><span class="gap-fact-label">${esc(item.label)}</span><small>${esc(item.context)}</small><span class="gap-fact-cta">${esc(item.more.label)} ${icon('right')}</span></span></a>`}).join('')}</div>
  <div class="gap-overview-lower"><section class="gap-focus"><div class="gap-section-top"><a class="quiet-link" href="${chapterHref(focus.more.chapter)}">${esc(focus.more.label)} ${icon('right')}</a></div><h2>${esc(focus.headline)}</h2><p>${esc(focus.text)}</p>${recent?`<div class="gap-record-update"><div class="gap-record-info"><span class="gap-record-icon">${icon('document')}</span><div><strong>${esc(recent.title)}</strong><span>${esc(field(recent,'summary'))}</span></div></div>${link(recent.id,'Read the activity record')}</div>`:''}</section>
  ${finding?`<section class="gap-finding"><h2>${esc(finding.title)}</h2><p>${esc(finding.fields.statement)}</p><a class="quiet-link" href="${viewHref('findings')}">Read finding and evidence ${icon('right')}</a></section>`:''}</div></div>`;
}
function metrics(){const items=related('measurement');return `<p class="lede" style="margin-bottom:24px">${esc(passage('gap','metrics').text)}</p><div class="grid three">${items.map(r=>`<article class="panel number-card"><h3>${esc(cap(r.fields?.measure || r.title))}</h3><strong class="big">${esc(metricValue(r))}</strong><div class="label">${esc(r.fields?.unit || r.title)}</div><small class="scope">${esc([r.fields?.period_start,r.fields?.period_end].filter(Boolean).join(' – ') || r.fields?.note || '')}</small>${r.fields?.note?`<p class="note" style="margin-top:12px">${esc(short(r.fields.note,170))}</p>`:''}<div class="sources-box">${link(r.fields?.source_record_id,'Source record')||link(r.id,'Full measurement')}</div></article>`).join('')}</div>`}
function measurements(){const claims=all('claim').filter(r=>r.fields?.gap_id===gap.id);return `${metrics()}${claims.length?section('Claims',`<div class="grid two">${claims.map(r=>card(r,r.fields?.limitations||r.description,'Examine claim')).join('')}</div>`):''}`}
function activity(){const activities=sorted(related('activity'));const reports=all('evidence').filter(r=>r.fields?.record_type==='field_report' && (r.fields?.gap_ids||[]).includes(gap.id));return `<div class="activity-page">${section('What we have done',`<div class="card-list">${activities.map(r=>row(r,date(r.fields?.occurred_at),true)).join('')||'<div class="empty">No activity recorded yet.</div>'}</div>`)}${section('Field reports',reports.length?`<div class="grid two">${reports.map(r=>card(r,r.fields?.summary,'Read firsthand report')).join('')}</div>`:'<div class="empty">No field reports attached to this gap.</div>')}</div>`}
function tasks(){const priority={in_progress:0,waiting:1,open:2}, items=related('task'),active=items.filter(r=>!['done','completed','cancelled'].includes(r.fields?.status)).sort((a,b)=>(priority[a.fields?.status]??3)-(priority[b.fields?.status]??3)||(a.fields?.order_by_id??99)-(b.fields?.order_by_id??99)),done=items.filter(r=>['done','completed'].includes(r.fields?.status));const stateLabel={open:'Open',in_progress:'In progress',waiting:'Waiting'};return `${section('Current work',`<div class="card-list">${active.map(r=>row(r,stateLabel[r.fields?.status]||cap(r.fields?.status),true)).join('')||'<div class="empty">No current tasks recorded.</div>'}</div>`)}${section('Completed tasks',`<div class="card-list">${done.map(r=>row(r,`Completed · ${date(r.fields?.completed_at)}`,true)).join('')}</div>`)}`}
function events(){const upcoming=all('event').filter(r=>(r.fields?.gap_ids||[]).includes(gap.id));return upcoming.length?`<div class="card-list">${sorted(upcoming).map(r=>row(r,date(r.fields?.scheduled_at))).join('')}</div>`:'<div class="empty">No scheduled events are recorded in the public feed.</div>'}
function places(){const items=related('location');return `<p class="lede" style="margin-bottom:24px">These are places mentioned in records, not a map of verified current conditions. Each place retains its stated geographic precision.</p><div class="grid three">${items.map(r=>`<article class="panel"><h2>${esc(r.title)}</h2><p>${esc(short(r.description||r.fields?.description,180))}</p><p class="note" style="margin-top:12px">${esc(r.fields?.map_reference?.precision?`Map precision: ${r.fields.map_reference.precision}`:'No precise map point asserted')}</p><div class="sources-box">${link(r.id,'Place record')}${r.fields?.map_reference?.query?`<br><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.fields.map_reference.query)}" target="_blank" rel="noopener noreferrer">Open general map reference ${icon('external')}</a>`:''}</div></article>`).join('')}</div>`}
function organizations(){const items=related('organization').length?related('organization'):all('organization');return `<div class="grid two">${items.map(r=>`<article class="panel"><h2>${esc(r.title)}</h2><p>${esc(r.description||r.fields?.summary)}</p><div class="sources-box">${link(r.id,'Organization record')}${externalHref(r.fields?.website)?`<br><a href="${esc(r.fields.website)}" target="_blank" rel="noopener noreferrer">Website ${icon('external')}</a>`:''}</div></article>`).join('')}</div>`}
function improvements(){return `<p class="lede" style="margin-bottom:24px">${esc(passage('gap','improvements').text)}</p><div class="grid two">${related('initiative').map(r=>`<article class="panel"><span class="tag ${esc(r.fields?.development_stage)}">${esc(cap(r.fields?.development_stage||'Stage unknown'))}</span><h2 style="margin-top:15px">${esc(r.title)}</h2><p>${esc(r.description)}</p>${r.fields?.intended_outcome?`<p><strong>Intended result:</strong> ${esc(r.fields.intended_outcome)}</p>`:''}<div class="sources-box">${link(r.id,'Improvement and supporting records')}</div></article>`).join('')}</div>`}
function findings(){return `<div class="grid two">${related('finding').map(r=>`<article class="panel"><span class="tag ${esc(r.fields?.status)}">${esc(cap(r.fields?.status||'Finding'))}</span><h2 style="margin-top:15px">${esc(r.title)}</h2><p>${esc(r.fields?.statement||r.description)}</p>${r.fields?.limitations?`<p class="note"><strong>Limit:</strong> ${esc(r.fields.limitations)}</p>`:''}<div class="sources-box">${link(r.id,'Read finding and evidence')}</div></article>`).join('')}</div>`}
function sources(){const items=sorted(all('evidence').filter(r=>(r.fields?.gap_ids||r.fields?.related_gap_ids||[]).includes(gap.id)));return `<label for="source-search">Search ${items.length} evidence records</label><input class="search" id="source-search" type="search" placeholder="Search titles, publishers, and descriptions…" autocomplete="off"><div class="card-list" id="source-list">${items.map(r=>row(r,r.fields?.source?.publisher||date(r.dateForSort?.value))).join('')}</div><p class="note" style="margin-top:16px">Sources include public documents and firsthand records. A source being published does not mean Crossover independently verified every claim in it.</p>`}
function about(){
  const opening=passage('about','opening'), purpose=passage('about','purpose'), discovery=passage('about','discovery'), starting=passage('about','starting'), founderSection=passage('about','founder');
  const purposeIdentity=sectionRecord(purpose), principle=sectionRecord(discovery), currentGap=sectionRecord(starting), founder=sectionRecord(founderSection);
  const profile=externalHref(field(founder,'profileUrl'));
  return `<div class="about-page"><section class="about-opening"><h1>${esc(opening.headline)}</h1><p>${esc(opening.text)}</p></section>
  <section class="about-purpose"><h2>${esc(field(purposeIdentity,'slogan'))}</h2><p>${esc(purpose.text)}</p></section>
  <section class="about-discovery"><h2>${esc(discovery.headline)}</h2><p>${esc(field(principle,'statement'))}</p></section>
  <div class="about-last-row"><section class="about-starting"><div><h2>${esc(starting.title)}</h2><p>${esc(starting.text)}</p><a class="quiet-link" href="${chapterHref(starting.more.chapter)}">${esc(starting.more.label)} ${icon('right')}</a></div><img src="${esc(field(currentGap,'preferred_image'))}" alt="${esc(starting.imageAlt)}" loading="lazy"></section>
  ${founder?`<section class="about-founder-compact"><img src="${esc(field(founder,'preferred_image'))}" alt="${esc(founderSection.imageAlt)}" width="88" height="88" loading="lazy"><div><h2>Founded by ${esc(founder.title)}</h2><p>${esc(founderSection.text)}</p><div class="about-founder-links">${profile?`<a href="${esc(profile)}" target="_blank" rel="noopener noreferrer">Connect on LinkedIn ${icon('external')}</a>`:''}<a href="${chapterHref(founderSection.more.chapter)}">${esc(founderSection.more.label)} ${icon('right')}</a></div></div></section>`:''}</div></div>`;
}
function recordDetail(r){const f=r.fields||{};const status=f.status||f.development_stage||f.evidence_status||f.verification_status;const paragraphs=[f.statement,f.summary,f.description,f.instructions,f.note,f.limitations,f.unknown].filter(Boolean).filter((s,i,a)=>a.indexOf(s)===i);const groups=[['Tasks',f.task_ids||f.related_task_ids],['Activities',f.activity_record_ids],['Findings',f.finding_ids],['Initiatives',f.initiative_ids||f.related_initiative_ids],['Organizations',f.organization_ids],['Places',f.location_ids],['Supporting records',f.supporting_record_ids||f.basis_record_ids||f.evidence_record_ids],['Source record',f.source_record_id?[f.source_record_id]:[]]].filter(([,ids])=>ids?.some(id=>lookup(id)));const measurement=r.schema==='measurement'?`<div class="panel number-card" style="margin-bottom:18px"><strong class="big">${esc(metricValue(r))}</strong><div class="label">${esc(f.unit||'')}</div><small class="scope">${esc([f.period_start,f.period_end].filter(Boolean).join(' – '))}</small></div>`:'';return `<div class="grid two record-grid"><div>${measurement}${panel('Record',`${status?`<p><span class="tag ${esc(status)}">${esc(cap(status))}</span></p>`:''}${paragraphs.map(s=>`<p>${esc(s)}</p>`).join('')||'<p>No summary is available for this record.</p>'}${f.occurred_at?`<p class="note">Occurred ${esc(date(f.occurred_at))}</p>`:''}${f.last_reviewed_at?`<p class="note">Reviewed ${esc(date(f.last_reviewed_at))}</p>`:''}`)}${f.guiding_questions?.length?section('Guiding questions',panel('Questions',`<ul class="question-list">${f.guiding_questions.map(q=>`<li>${esc(q.title)}</li>`).join('')}</ul>`)):''}</div><div>${panel('Provenance',`<p>${esc(f.source?.publisher||r.typeName||cap(r.schema))}</p>${f.source?.published_at?`<p>Published ${esc(date(f.source.published_at))}</p>`:''}${sourceLink(r)?`<div class="sources-box">${sourceLink(r)}</div>`:''}<p class="note" style="margin-top:20px">Record ID: ${esc(r.id)}</p>`)}${groups.length?section('Connected records',`<div class="panel">${groups.map(([label,ids])=>`<h3 style="margin:0 0 8px">${esc(label)}</h3><div class="relation-links">${relationLinks(ids)}</div>`).join('')}</div>`):''}</div></div>`}
function overviewContinuation(){
  let activityStarted=false;
  const paths=story.silent.reading.filter(path=>path.startsWith('gap.')&&!path.startsWith('gap.overview.'));
  const passages=paths.map(path=>{
    const ids=path.split('.'),group=gapChapter(ids[1]),part=ids[2]?group.chapters.find(item=>item.id===ids[2]):group;
    const heading=ids[1]==='activity'?(activityStarted?'':`<h2>${esc(group.title)}</h2>`):`<h2>${esc(part.title)}</h2>`;
    if(ids[1]==='activity')activityStarted=true;
    const records=(part.records||[]).map(lookup).filter(Boolean);
    const items=records.map(record=>`<article><h4><a href="${recordHref(record)}">${esc(record.title)}</a></h4><p>${esc(record.fields?.statement||record.fields?.summary||record.fields?.list_context||record.fields?.description||record.description||'')}</p>${record.fields?.limitations?`<p><strong>Limit:</strong> ${esc(record.fields.limitations)}</p>`:''}</article>`).join('');
    return `<section class="gap-overview-story-section" id="overview-${esc(part.id)}">${heading}${ids[2]?`<h3>${esc(part.title)}</h3>`:''}${part.text?`<p>${esc(part.text)}</p>`:''}${items?`<div class="gap-overview-story-records">${items}</div>`:''}${part.id==='sources'?`<p><a href="${viewHref('sources')}">Browse the supporting sources ${icon('right')}</a></p>`:''}</section>`;
  }).join('');
  return `<div class="gap-overview-continuation">${passages}</div>`;
}
const views={home,menu:gapMenu,overview:()=>overview()+overviewContinuation(),activity,tasks,events,findings,metrics:measurements,places,organizations,improvements,sources,about};
function render(){
  const path=location.pathname.replace(/\/$/,'')||'/';
  const gapSlug=path.match(/^\/gaps\/([^/]+)(?:\/|$)/)?.[1]||path.match(/^\/([^/]+)(?:\/|$)/)?.[1];
  gap=all('gap').find(record=>record.fields?.slug===decodeURIComponent(gapSlug||''))||all('gap').find(record=>record.fields?.default)||all('gap')[0];
  const recordMatch=path.match(/^\/(?:record|organization)\/([^/]+)$/);
  const recordId=recordMatch?decodeURIComponent(recordMatch[1]):'';
  const record=recordId?lookup(recordId):null;
  const sectionMatch=path.match(/^\/(?:gaps\/)?[^/]+\/(overview|activity|tasks|metrics|findings|organizations|improvements|places|events|sources)$/);
  const alias={'/gaps':'overview','/activity':'activity','/places':'places','/organizations':'organizations','/explore':'sources','/about':'about'};
  const gapBase=`/${encodeURIComponent(gap.fields.slug)}`;
  const inGap=Boolean(record)||path===gapBase||path.startsWith(`${gapBase}/`)||path.startsWith(`/gaps${gapBase}/`);
  const name=path==='/'||path===gapBase?'menu':sectionMatch?.[1]||alias[path]||'menu';
  const view=views[name]?name:'home';
  const heading=record?.title||(view==='menu'?gap.title:story.silent.menu.find(item=>item.page===view)?.label)||cap(view);
  const sub=record?.typeName||story.silent.menu.find(item=>item.page===view)?.description||'';
  document.title=view==='menu'&&!record?'Crossover Stockton · Home':view==='about'&&!record?'About Crossover · Crossover Stockton':`${heading} · Crossover Stockton`;
  const standalone=!record&&view==='about';
  const menuItems=story.silent.menu.map(item=>`<a href="${viewHref(item.page)}" ${view===item.page&&!record?'aria-current="page"':''}>${icon(item.icon)}<span>${esc(item.label)}</span></a>`).join('');
  const rail=standalone?'':`<aside class="rail" aria-label="Gap sections"><a class="rail-brand" href="/" aria-label="Crossover Stockton home"><img src="/images/logo_light.webp" alt=""><span>CROSSOVER<br>STOCKTON</span></a><div class="rail-topline">${esc(gap.title)}</div><nav aria-label="Gap sections"><a href="/" ${view==='menu'?'aria-current="page"':''}>${icon('index')}<span>Index</span></a>${menuItems}</nav><div class="rail-bottom"><a href="/about/">${icon('about')}<span>About Crossover</span></a></div></aside>`;
  const publicHeader=`<header class="public-header"><div class="public-header-inner"><div class="public-brand"><a href="/" aria-label="Crossover Stockton home"><img src="/images/logo_dark.webp" alt="Crossover C logo"></a><a href="/" class="public-brand-name" aria-label="Crossover Stockton home"><span>CROSSOVER</span><span>STOCKTON</span></a></div>${standalone?'':`<span class="public-gap-title">${esc(gap.title)}</span>`}<nav aria-label="Main navigation"><a href="/about/" ${view==='about'?'aria-current="page"':''}>${icon('about')}<span>About</span></a></nav></div></header>`;
  const feedFooter=`<footer class="feed-footer"><div><span>Built from the public Crossover feed and ${records.length} connected records</span><nav aria-label="Public feed"><a href="/feed/">Read the feed ${icon('right')}</a><a href="/feed.json" target="_blank" rel="noopener noreferrer">Feed JSON ${icon('external')}</a><a href="/data/records.json" target="_blank" rel="noopener noreferrer">Read the JSON ${icon('external')}</a></nav></div></footer>`;
  const trail=breadcrumb(record,heading);
  const pageHeading=['home','menu'].includes(view)&&!record?'':`<div class="page-heading">${trail}<div><h1>${esc(heading)}</h1><p>${esc(sub)}</p></div></div>`;
  const origin=record&&recordOrigin(record);
  document.getElementById('app').innerHTML=`${publicHeader}<div class="app${standalone?' standalone menu-mode':''}${view==='menu'?' index-page':''}" id="shell">${rail}<div class="main"><main class="main-inner${standalone?' standalone-inner':''}" id="content" tabindex="-1">${pageHeading}${origin?`<a class="record-return" href="${esc(origin.path)}" data-return-to-origin>Back to ${esc(origin.label)} ${icon('right')}</a>`:''}${record?recordDetail(record):views[view]()}</main></div></div>${feedFooter}`;
  if(view==='sources'&&!record){
    const input=document.getElementById('source-search'),list=document.getElementById('source-list');
    input.addEventListener('input',()=>{const q=input.value.trim().toLowerCase();const filtered=sorted(all('evidence').filter(r=>(r.fields?.gap_ids||r.fields?.related_gap_ids||[]).includes(gap.id)).filter(r=>`${r.title} ${r.description} ${r.fields?.source?.publisher||''}`.toLowerCase().includes(q)));list.innerHTML=filtered.map(r=>row(r,r.fields?.source?.publisher||date(r.dateForSort?.value))).join('')||'<div class="empty">No matching sources.</div>'});
  }
  window.scrollTo({top:history.state?.scrollY??0,behavior:'instant'});
}
async function start(){
  try{
    const [feedResponse,storyResponse]=await Promise.all([fetch('/data/records.json',{cache:'no-store'}),fetch('/site-config.json',{cache:'no-store'})]);
    if(!feedResponse.ok||!storyResponse.ok)throw new Error('Could not load the public feed');
    feed=await feedResponse.json();story=await storyResponse.json();records=Object.values(feed.records||{});byId=new Map(records.map(r=>[r.id,r]));
    gap=all('gap').find(r=>r.fields?.default)||all('gap')[0];if(!gap)throw new Error('No gap in the record feed');
    const pending=sessionStorage.getItem('crossover-record-origin');
    if(pending){
      sessionStorage.removeItem('crossover-record-origin');
      const origin=JSON.parse(pending),targetId=location.pathname.match(/^\/(?:record|organization)\/([^/]+)\/?$/)?.[1];
      const referrer=document.referrer?new URL(document.referrer).pathname:'';
      if(targetId&&decodeURIComponent(targetId)===origin.recordId&&referrer===origin.path)history.replaceState({recordOrigin:origin},'',location.href);
    }
    history.scrollRestoration='manual';render();
    document.querySelector('.skip')?.addEventListener('click',event=>{event.preventDefault();document.getElementById('content')?.focus()});
    document.getElementById('app').addEventListener('click',event=>{
      if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      const anchor=event.target.closest('a[href]');if(!anchor||anchor.target||anchor.hasAttribute('download'))return;
      const target=new URL(anchor.href,location.href);if(target.origin!==location.origin||target.hash||target.search)return;
      if(!/^\/(?:$|about\/?$|street-dogs\/?$|[^/]+\/(?:overview|activity|tasks|metrics|findings|organizations|improvements|places|events|sources)\/?$|gaps\/[^/]+\/(?:overview|activity|tasks|metrics|findings|organizations|improvements|places|events|sources)\/?$|(?:record|organization)\/[^/]+\/?$)/.test(target.pathname))return;
      event.preventDefault();
      if(anchor.hasAttribute('data-return-to-origin')&&history.state?.recordOrigin?.path===target.pathname){
        const origin=history.state.recordOrigin;
        if(Number.isFinite(origin.scrollY))sessionStorage.setItem('crossover-return-scroll',JSON.stringify({path:origin.path,scrollY:origin.scrollY}));
        history.back();return;
      }
      if(target.pathname===location.pathname)return;
      const section=location.pathname.match(/^\/street-dogs\/(overview|activity|tasks|metrics|findings|organizations|improvements|places|events|sources)\/?$/)?.[1];
      const recordId=target.pathname.match(/^\/(?:record|organization)\/([^/]+)\/?$/)?.[1];
      const recordOrigin=section&&recordId?{path:viewHref(section),page:section,recordId:decodeURIComponent(recordId)}:history.state?.recordOrigin&&recordId?{...history.state.recordOrigin,recordId:decodeURIComponent(recordId)}:null;
      history.replaceState({...history.state,scrollY:window.scrollY},'',location.href);
      history.pushState(recordOrigin?{recordOrigin}:null,'',target.pathname);render();
    });
    addEventListener('popstate',render);
  }catch(error){document.getElementById('app').innerHTML=`<main class="loading"><h1>Could not open the gap</h1><p>${esc(error.message)}</p></main>`}
}
start();
