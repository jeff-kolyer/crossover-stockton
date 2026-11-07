// A separate SITE.md design preview. The feed and records remain the source of page text.
const paths={index:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',story:'<path d="M3 4h7a3 3 0 0 1 3 3v14a3 3 0 0 0-3-3H3zM21 4h-5a3 3 0 0 0-3 3v14a3 3 0 0 1 3-3h5z"/>',activity:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',tasks:'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="m8 12 2.5 2.5L16 9"/>',metrics:'<path d="M4 20v-8h4v8m2 0V4h4v16m2 0v-6h4v6M2 21h20"/>',findings:'<path d="M9 18h6M10 21h4M8 15a7 7 0 1 1 8 0l-1 3H9z"/>',organizations:'<circle cx="9" cy="8" r="3"/><path d="M2 20v-2a7 7 0 0 1 14 0v2M17 5a3 3 0 0 1 0 6M18 14a6 6 0 0 1 4 6"/>',improvements:'<path d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5"/>',places:'<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',events:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',document:'<path d="M6 2h8l4 4v16H6zM14 2v5h4M9 12h6M9 16h6"/>',about:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',chevron:'<path d="m9 5 7 7-7 7"/>',menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',close:'<path d="M5 5l14 14M19 5 5 19"/>'};
const icon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]||paths.document}</svg>`;
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const short=(value,n=210)=>{const text=String(value||'').trim();return text.length>n?`${text.slice(0,n).trimEnd()}…`:text};
const previewBase='/preview/site-md';
const isPreview=location.pathname.startsWith(previewBase);
const route=()=>{
  if(isPreview){const page=location.pathname.slice(previewBase.length).replace(/^\/|\/$/g,'');return page==='record'?`/record/${new URLSearchParams(location.search).get('id')||''}`:page?`/${page}`:'/home'}
  const path=location.pathname.replace(/^\/|\/$/g,'');
  if(!path)return '/home';
  if(path==='street-dogs'||path==='street-dogs/overview')return '/overview';
  if(path==='about')return '/about';
  if(path.startsWith('record/')||path.startsWith('organization/'))return `/record/${decodeURIComponent(path.split('/')[1]||'')}`;
  return path.startsWith('street-dogs/')?`/${path.split('/')[1]}`:'/overview';
};
const href=page=>isPreview?`${previewBase}/${page}/`:page==='home'?'/':page==='about'?'/about/':`/street-dogs/${page}/`;
const recordHref=(id,from)=>isPreview?`${previewBase}/record/?id=${encodeURIComponent(id)}&from=${encodeURIComponent(from)}`:`/${lookup(id)?.schema==='organization'?'organization':'record'}/${encodeURIComponent(id)}/?from=${encodeURIComponent(from)}`;
let feed,records,byId,gap,gapStory,about,menu;
const lookup=id=>byId.get(id);
const section=id=>gapStory.chapters.find(item=>item.id===id);
const related=record=>record.fields?.gap_id===gap.id||(record.fields?.gap_ids||record.fields?.related_gap_ids||[]).includes(gap.id);
const recordText=record=>record?.fields?.statement||record?.fields?.list_context||record?.fields?.summary||record?.fields?.description||record?.description||'';
const recordsFor=part=>part.records?.map(lookup).filter(Boolean)||records.filter(item=>item.schema===part.select?.schema&&(part.select.schema==='organization'?(gap.fields?.organization_ids||[]).includes(item.id):related(item)));
const date=value=>value?new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(`${String(value).slice(0,10)}T12:00:00Z`)):'';
const metricValue=record=>{const value=record?.fields?.value??record?.fields?.reportedValue;return typeof value==='number'?new Intl.NumberFormat('en-US').format(value):value==null?'Unknown':String(value)};
const navLinks=current=>menu.map(item=>`<a href="${href(item.page)}" ${current===`/${item.page}`?'aria-current="page"':''}>${icon(item.icon)}<span>${esc(item.label)}</span></a>`).join('');
const breadcrumbs=(current,title,from)=>{
  if(current==='/home')return '';
  const origin=menu.find(item=>`/${item.page}`===from);
  const parent=origin&&from!=='/overview'?`<a href="${href(origin.page)}">${esc(origin.label)}</a>${icon('chevron')}`:'';
  const backPage=origin?.page||(['/overview','/about'].includes(current)?'home':'overview');
  const backLabel=origin?.label||(backPage==='home'?'Crossover':'Overview');
  return `<nav class="crumbs" aria-label="Breadcrumb"><div class="crumbs-desktop"><a href="${href('home')}">Crossover</a>${icon('chevron')}<a href="${href('overview')}">${esc(gap.title)}</a>${icon('chevron')}${parent}<span aria-current="page">${esc(current==='/overview'?'Overview':title)}</span></div><a class="crumbs-mobile-back" href="${href(backPage)}" aria-label="Back to ${esc(backLabel)}">${icon('chevron')}<span>${esc(backLabel)}</span></a></nav>`;
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
  const focus=section('overview').chapters.find(item=>item.id==='focus');
  const statusTask=lookup(focus.statusRecord);
  const status=statusTask?.fields?.status==='in_progress'?'Investigation in progress':'Investigation status unknown';
  const statusDate=date(statusTask?.fields?.started_at);
  const composition=isPreview?(new URLSearchParams(location.search).get('composition')||'window'):'window';
  const image=composition==='city'?'/images/home/stockton-skyline-commons.jpg':composition==='street'?home.gapImage:home.image;
  const variant=['window','city','street'].includes(composition)?composition:'window';
  return `<section class="home-splash home-splash--${variant}" aria-labelledby="home-question">
    <img class="home-background" src="${esc(image)}" alt="" aria-hidden="true">
    <div class="home-shade"></div>
    <div class="home-intro">
      <h1 id="home-question">${esc(intro.title)}</h1>
      <p>${esc(intro.text)}</p>
    </div>
    <a class="home-gap" href="${href('overview')}">
      <img src="${esc(home.gapImage)}" alt="${esc(home.gapImageAlt)}">
      <span class="home-gap-copy"><span class="home-gap-label">${esc(home.label)}</span><strong>${esc(gap.title)}</strong><span class="home-gap-status">${esc(status)}${statusDate?` · Last substantive update: ${esc(statusDate)}`:''}</span><span>${esc(home.description)}</span><span>${esc(home.closing)}</span><span class="home-gap-action">${esc(home.actionLabel)} ${icon('arrow')}</span></span>
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
function activityPage(){const part=section('activity');return `${heading('Activity',part.summary,'/activity')}${part.chapters.map(group=>`<div class="section-title"><h2>${esc(group.title)}</h2></div>${recordList((group.records||[]).map(lookup).filter(Boolean),'/activity')}`).join('')}`}
function genericPage(id){
  const item=menu.find(entry=>entry.page===id),part=section(id);
  if(!item||!part)return heading('Page unavailable','This page is not part of the public feed.',`/${id}`);
  const items=recordsFor(part),intro=heading(item.label,part.summary||part.text||item.description,`/${id}`);
  const context=part.text&&part.summary&&part.text!==part.summary?`<p class="panel" style="margin-bottom:20px">${esc(part.text)}</p>`:'';
  if(id==='findings')return intro+context+(items.length?items.map(record=>`<article class="panel" style="margin-bottom:14px"><h2>${esc(record.title)}</h2><p>${esc(record.fields?.statement||recordText(record))}</p>${record.fields?.limitations?`<p style="margin-top:15px"><strong>Limit:</strong> ${esc(record.fields.limitations)}</p>`:''}${relationGroups(record,'/findings')}<p style="margin-top:16px"><a class="text-link" href="${recordHref(record.id,'/findings')}">Finding, evidence, and related work ${icon('arrow')}</a></p></article>`).join(''):'<p class="empty">No findings are recorded yet.</p>');
  if(id==='metrics'){const claims=records.filter(record=>record.schema==='claim'&&record.fields?.gap_id===gap.id);return intro+context+`<div class="section-title"><h2>Measurements</h2></div>`+recordList(items,'/metrics',true)+`<div class="section-title"><h2>Claims and unknowns</h2></div>`+recordList(claims,'/metrics',true)}
  if(id==='events'&&!items.length)return intro+'<p class="empty">No scheduled events are recorded yet.</p>';
  return intro+context+recordList(items,`/${id}`,['organizations','improvements','places'].includes(id));
}
function aboutPage(){
  const founderId=records.find(record=>record.schema==='identity')?.fields?.founderPersonId;
  const founder=lookup(founderId)||records.find(record=>record.schema==='person');
  return `${heading('About Crossover','','/about')}<div class="about-stack">${about.sections.map(item=>{
    const record=item.record==='$gap'?gap:item.record==='$founder'?founder:lookup(item.record);
    const text=item.text||recordText(record);
    const image=item.id==='starting'?gap.fields?.preferred_image:item.id==='founder'?record?.fields?.preferred_image:'';
    const destination=item.more?.chapter==='gap.overview'?'overview':item.more?.chapter==='gap.sources'?'sources':'';
    const profile=safeUrl(record?.fields?.profileUrl);
    return `<section class="panel about-panel">${image?`<img class="about-photo${item.id==='founder'?' about-photo--portrait':''}" src="${esc(image)}" alt="${esc(item.imageAlt||'')}">`:''}<h2>${esc(item.headline||item.title||record?.title||'About Crossover')}</h2><p>${esc(text)}</p>${destination?`<p class="about-link"><a class="text-link" href="${href(destination)}">${esc(item.more.label)} ${icon('arrow')}</a></p>`:''}${profile?`<p class="about-link"><a class="text-link" href="${esc(profile)}" target="_blank" rel="noopener noreferrer">Connect on LinkedIn ↗</a></p>`:''}</section>`;
  }).join('')}</div>`;
}
function detailPage(path){
  const match=path.match(/^\/record\/([^/]+)$/),record=match&&lookup(match[1]);
  const from=new URLSearchParams(location.search).get('from')||'';
  if(!record)return heading('Record unavailable','This record is not in the public feed.',path);
  const fields=record.fields||{};
  const excluded=new Set(['title','name','summary','description','statement','list_context','instructions','limitations','purpose','biography']);
  const displayed=Object.entries(fields).filter(([key,value])=>value!=null&&['string','number','boolean'].includes(typeof value)&&!excluded.has(key)).slice(0,20);
  const source=fields.source||{},sourceUrl=safeUrl(source.url||fields.source_url),website=safeUrl(fields.website),profile=safeUrl(fields.profileUrl);
  const external=[sourceUrl&&`<a href="${esc(sourceUrl)}" target="_blank" rel="noopener noreferrer">Original source ↗</a>`,website&&`<a href="${esc(website)}" target="_blank" rel="noopener noreferrer">Organization website ↗</a>`,profile&&`<a href="${esc(profile)}" target="_blank" rel="noopener noreferrer">Profile ↗</a>`].filter(Boolean);
  const mapQuery=fields.map_reference?.query,mapUrl=mapQuery?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`:'';
  const details=displayed.length?`<dl>${displayed.map(([key,value])=>`<dt>${esc(key.replaceAll('_',' '))}</dt><dd>${esc(value)}</dd>`).join('')}</dl>`:'';
  return `${heading(record.title,recordText(record),path,from)}<div class="detail-body">
    ${fields.instructions?`<section class="panel"><h2>Instructions</h2><p>${esc(fields.instructions)}</p></section>`:''}
    ${fields.limitations?`<section class="panel"><h2>Limitations</h2><p>${esc(fields.limitations)}</p></section>`:''}
    ${fields.unknown?`<section class="panel"><h2>What remains unknown</h2><p>${esc(fields.unknown)}</p></section>`:''}
    ${source.publisher||external.length||mapUrl?`<section class="panel"><h2>Source and location</h2>${source.publisher?`<p>${esc(source.publisher)}</p>`:''}<div class="external-links">${external.join('')}${mapUrl?`<a href="${esc(mapUrl)}" target="_blank" rel="noopener noreferrer">Open on Google Maps ↗</a>`:''}</div></section>`:''}
    ${relationGroups(record,from||'/sources')}
    <section class="panel"><h2>Record details</h2>${details}<details class="raw-fields"><summary>All public fields</summary><pre>${esc(JSON.stringify(fields,null,2))}</pre></details></section>
    ${isPreview?`<p><a class="text-link" href="/${record.schema==='organization'?'organization':'record'}/${encodeURIComponent(record.id)}/">Open permanent record ${icon('arrow')}</a></p>`:''}
  </div>`;
}
function render(){const current=route(),isAbout=current==='/about',isHome=current==='/home';const title=isHome?'Crossover Stockton':isAbout?'About Crossover':current.startsWith('/record/')?'Public record':gap.title;const inner=isHome?homePage():current==='/overview'?overview():current==='/activity'?activityPage():isAbout?aboutPage():current.startsWith('/record/')?detailPage(current):genericPage(current.slice(1));const shell=`<div class="shell${isHome?' home-shell':''}"><aside class="rail" aria-label="Gap sections"><a class="rail-logo" href="${href('home')}"><img src="/images/logo_light.webp" alt=""><span>CROSSOVER<br>STOCKTON</span></a><div class="rail-gap">${esc(gap.title)}</div><nav class="rail-nav" aria-label="Gap sections">${navLinks(current)}</nav><div class="rail-foot"><a href="${href('about')}">${icon('about')} About Crossover</a></div></aside><div class="site"><header class="top"><a class="mobile-logo" href="${href('home')}"><img src="/images/logo_dark.webp" alt=""><span>CROSSOVER<br>STOCKTON</span></a><span class="top-title">${esc(title)}</span><div class="top-actions"><a class="top-about" href="${href('about')}">${icon('about')}<span>About</span></a><button class="menu-toggle" type="button" aria-label="Open gap menu" aria-expanded="false" aria-controls="mobile-menu">${icon('menu')}</button></div></header><div class="mobile-menu" id="mobile-menu"><p>${esc(gap.title)}</p><nav aria-label="Mobile gap sections">${navLinks(current)}</nav><a class="menu-about" href="${href('about')}">About Crossover</a></div><main class="main${isHome?' home-main':''}" id="content" tabindex="-1"><div class="content${isHome?' home-content':''}">${inner}</div></main><footer class="footer"><span>${isPreview?'Read the data behind this preview.':'Explore the public feed and records.'}</span><div class="footer-links"><a href="/feed/">Full feed</a><a href="/feed.json" target="_blank" rel="noopener noreferrer">Feed JSON ↗</a><a href="/data/records.json" target="_blank" rel="noopener noreferrer">Public records JSON ↗</a></div></footer></div></div>`;document.getElementById('app').innerHTML=shell;document.title=`${isHome?'Home':current==='/about'?'About':current.startsWith('/record/')?'Record':menu.find(item=>`/${item.page}`===current)?.label||'Crossover'} · Crossover Stockton${isPreview?' preview':''}`;document.querySelector('.menu-toggle').addEventListener('click',toggleMenu);window.scrollTo(0,0)}
function toggleMenu(){const open=!document.getElementById('mobile-menu').classList.contains('open');document.getElementById('mobile-menu').classList.toggle('open',open);document.querySelector('.menu-toggle').setAttribute('aria-expanded',String(open));document.querySelector('.menu-toggle').setAttribute('aria-label',open?'Close gap menu':'Open gap menu');document.querySelector('.menu-toggle').innerHTML=icon(open?'close':'menu');document.body.classList.toggle('menu-open',open)}
function isSitePage(path){
  if(isPreview)return path.startsWith(`${previewBase}/`);
  return path==='/'||path==='/about/'||/^\/street-dogs\/(?:overview|activity|tasks|metrics|findings|organizations|improvements|places|events|sources)\/$/.test(path)||/^\/(?:record|organization)\/[^/]+\/$/.test(path);
}
function navigateToSitePage(event){
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const link=event.target.closest('a[href]');
  if(!link||link.target||link.hasAttribute('download'))return;
  const destination=new URL(link.href);
  if(destination.origin!==location.origin||!isSitePage(destination.pathname))return;
  if(destination.pathname===location.pathname&&destination.search===location.search&&destination.hash)return;
  event.preventDefault();
  if(destination.href===location.href)return;
  history.replaceState({...history.state,scrollY:window.scrollY},'');
  history.pushState({scrollY:0},'',destination.pathname+destination.search+destination.hash);
  document.body.classList.remove('menu-open');
  render();
  document.getElementById('content')?.focus({preventScroll:true});
}
function restoreSitePage(event){
  document.body.classList.remove('menu-open');
  render();
  requestAnimationFrame(()=>window.scrollTo(0,event.state?.scrollY||0));
}
async function start(){try{if(location.pathname==='/preview/site-md.html'){location.replace(`${previewBase}/overview/`);return}const [storyResponse,recordsResponse]=await Promise.all([fetch('/feed.json'),fetch('/data/records.json')]);if(!storyResponse.ok||!recordsResponse.ok)throw new Error('Could not load the public feed.');feed=await storyResponse.json();const data=await recordsResponse.json();records=Object.values(data.records||{});byId=new Map(records.map(item=>[item.id,item]));gap=records.find(item=>item.schema==='gap'&&item.fields?.default)||records.find(item=>item.schema==='gap');if(!gap)throw new Error('No current gap in the public feed.');gapStory=feed.chapters.find(item=>item.id==='gap');about=feed.chapters.find(item=>item.id==='about');menu=feed.silent.menu;history.scrollRestoration='manual';history.replaceState({...history.state,scrollY:window.scrollY},'');render();document.addEventListener('click',navigateToSitePage);window.addEventListener('popstate',restoreSitePage);document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.body.classList.contains('menu-open'))toggleMenu()})}catch(error){document.getElementById('app').innerHTML=`<main class="loading"><h1>Preview unavailable</h1><p>${esc(error.message)}</p></main>`}}
start();
