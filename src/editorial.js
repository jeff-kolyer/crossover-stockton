import articles from './data/articles.json';
import content from './data/site-content.json';
import { PRIMARY_RECORDS } from './generated/records.js';

const main = document.querySelector('#site-main');
const dialog = document.querySelector('#record-dialog');
const mapModal = document.querySelector('#fullscreen-map-modal');
const recordById = new Map();
const primaryById = new Map(PRIMARY_RECORDS.map(item => [item.id, item]));
let records = [];
let route = { page: 'home', article: null, record: null };
let workFilter = 'all';
let explorer = { query: '', status: 'all', kind: 'all', selectedId: null, subTab: 'artifact' };

const ARTICLE_MAPS = {
  'field-call-density': {
    title: 'Stockton Field-Call Density & Dumping Corridors (7,183 Logs)',
    subtitle: 'Single-layer geospatial summary of Animal Services dispatch concentration across Stockton corridors',
    legend: '<strong>Single-Layer View:</strong> Shaded zones indicate concentrations of loose-dog, injured-stray, and weekly dumping calls extracted from the 7,183 municipal dispatch logs. Drag to pan; use + / − to zoom.',
    svg: `
      <svg viewBox="0 0 800 500" class="article-map-svg">
        <defs>
          <pattern id="grid-light" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#EAE6DD" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="800" height="500" fill="url(#grid-light)"/>
        <path d="M 40 185 Q 190 215, 290 250 T 520 270 T 760 255" fill="none" stroke="#BFDBFE" stroke-width="14" stroke-linecap="round"/>
        <path d="M 165 40 Q 210 160, 290 250 L 340 460" fill="none" stroke="#DBEAFE" stroke-width="9" stroke-linecap="round"/>
        <text x="85" y="172" font-family="JetBrains Mono, monospace" font-size="10" fill="#1D4ED8" font-weight="600">SAN JOAQUIN RIVER / DEEP WATER CHANNEL</text>
        <text x="535" y="292" font-family="JetBrains Mono, monospace" font-size="10" fill="#1D4ED8" font-weight="600">MORMON SLOUGH CORRIDOR</text>
        <line x1="255" y1="20" x2="310" y2="480" stroke="#D6D3CD" stroke-width="3"/>
        <line x1="560" y1="20" x2="610" y2="480" stroke="#D6D3CD" stroke-width="3"/>
        <line x1="60" y1="115" x2="740" y2="115" stroke="#D6D3CD" stroke-width="2.5"/>
        <line x1="60" y1="355" x2="740" y2="355" stroke="#D6D3CD" stroke-width="2.5"/>
        <text x="263" y="42" font-family="JetBrains Mono, monospace" font-size="9.5" fill="#505662">I-5</text>
        <text x="568" y="42" font-family="JetBrains Mono, monospace" font-size="9.5" fill="#505662">HWY 99</text>
        <text x="68" y="108" font-family="JetBrains Mono, monospace" font-size="9.5" fill="#505662">MARCH LN / TRINITY PKWY</text>
        <text x="68" y="348" font-family="JetBrains Mono, monospace" font-size="9.5" fill="#505662">DR. MLK JR. BLVD (CHARTER WAY)</text>
        <ellipse cx="520" cy="255" rx="115" ry="52" fill="#DC2626" fill-opacity="0.14" stroke="#B91C1C" stroke-width="2" stroke-dasharray="5 4"/>
        <circle cx="520" cy="255" r="7" fill="#B91C1C"/>
        <rect x="425" y="182" width="195" height="44" rx="8" fill="#FFFFFF" stroke="#B91C1C" stroke-width="1.5"/>
        <text x="522" y="200" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="700" fill="#13161C">Mormon Slough &amp; Industrial</text>
        <text x="522" y="216" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9.5" fill="#B91C1C">3–10 dumped encounters / wk</text>
        <ellipse cx="325" cy="405" rx="95" ry="48" fill="#1D4ED8" fill-opacity="0.12" stroke="#1D4ED8" stroke-width="2"/>
        <circle cx="315" cy="405" r="7" fill="#1D4ED8"/>
        <rect x="215" y="422" width="215" height="44" rx="8" fill="#FFFFFF" stroke="#1D4ED8" stroke-width="1.5"/>
        <text x="322" y="440" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="700" fill="#13161C">1575 S. Lincoln St (Animal Shelter)</text>
        <text x="322" y="456" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9.5" fill="#1D4ED8">3,106 stray intakes (2024 baseline)</text>
        <ellipse cx="395" cy="295" rx="75" ry="38" fill="#D97706" fill-opacity="0.15" stroke="#92400E" stroke-width="1.8"/>
        <circle cx="395" cy="295" r="6" fill="#92400E"/>
        <rect x="335" y="310" width="185" height="40" rx="8" fill="#FFFFFF" stroke="#92400E" stroke-width="1.5"/>
        <text x="427" y="327" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10.5" font-weight="700" fill="#13161C">Central / St. Mary's Pathways</text>
        <text x="427" y="341" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#92400E">ISSUE-01: Pet bed scale under audit</text>
        <ellipse cx="235" cy="115" rx="85" ry="40" fill="#166534" fill-opacity="0.11" stroke="#166534" stroke-width="1.8" stroke-dasharray="4 4"/>
        <circle cx="235" cy="115" r="6" fill="#166534"/>
        <rect x="135" y="54" width="200" height="40" rx="8" fill="#FFFFFF" stroke="#166534" stroke-width="1.5"/>
        <text x="235" y="71" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10.5" font-weight="700" fill="#13161C">North &amp; Trinity Pkwy Zone</text>
        <text x="235" y="85" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#166534">Clinic waitlist &amp; containment calls</text>
      </svg>
    `
  },
  'handoff-nodes': {
    title: 'Community Care & Handoff Points Across Stockton',
    subtitle: 'Single-layer view of clinics, microchip scanning hubs, and shelter/outreach nodes',
    legend: '<strong>Single-Layer View:</strong> Active clinics, shelter walk-in hours, and community support hubs where reporting and rescue handoffs succeed without kennel bottlenecks.',
    svg: `
      <svg viewBox="0 0 800 500" class="article-map-svg">
        <defs>
          <pattern id="grid-handoff" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#EAE6DD" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="800" height="500" fill="url(#grid-handoff)"/>
        <line x1="250" y1="20" x2="295" y2="480" stroke="#DDD9D0" stroke-width="3"/>
        <line x1="565" y1="20" x2="605" y2="480" stroke="#DDD9D0" stroke-width="3"/>
        <line x1="60" y1="220" x2="740" y2="220" stroke="#DDD9D0" stroke-width="2.5"/>
        <text x="258" y="40" font-family="JetBrains Mono, monospace" font-size="9.5" fill="#505662">I-5</text>
        <text x="573" y="40" font-family="JetBrains Mono, monospace" font-size="9.5" fill="#505662">HWY 99</text>
        <text x="68" y="212" font-family="JetBrains Mono, monospace" font-size="9.5" fill="#505662">ALPINE AVE / CENTRAL CORRIDOR</text>
        <path d="M 390 165 Q 340 270, 315 395" fill="none" stroke="#1D4ED8" stroke-width="2" stroke-dasharray="6 5"/>
        <path d="M 390 165 Q 445 225, 465 280" fill="none" stroke="#166534" stroke-width="2" stroke-dasharray="6 5"/>
        <circle cx="390" cy="165" r="10" fill="#166534"/>
        <rect x="275" y="95" width="235" height="54" rx="10" fill="#FFFFFF" stroke="#166534" stroke-width="1.8"/>
        <text x="392" y="115" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="11.5" font-weight="700" fill="#13161C">ACT Spay/Neuter Clinic (Alpine Ave)</text>
        <text x="392" y="131" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9.5" fill="#166534">Low-cost sterilization · (209) 462-7729</text>
        <circle cx="315" cy="395" r="10" fill="#1D4ED8"/>
        <rect x="180" y="415" width="275" height="54" rx="10" fill="#FFFFFF" stroke="#1D4ED8" stroke-width="1.8"/>
        <text x="317" y="435" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="11.5" font-weight="700" fill="#13161C">Stockton Animal Shelter (1575 S. Lincoln)</text>
        <text x="317" y="451" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9.5" fill="#1D4ED8">Walk-in chip/vax Wed–Sun 1–3:30 PM</text>
        <circle cx="465" cy="280" r="9" fill="#92400E"/>
        <rect x="485" y="254" width="245" height="54" rx="10" fill="#FFFFFF" stroke="#92400E" stroke-width="1.8"/>
        <text x="607" y="274" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="11.5" font-weight="700" fill="#13161C">St. Mary's Dining Room &amp; Pathways</text>
        <text x="607" y="290" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9.5" fill="#92400E">Fremont pop-up clinics &amp; pet shelter audit</text>
      </svg>
    `
  }
};

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const articleById = id => articles.find(article => article.id === id);
const dateLabel = date => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? '')) return date || 'Date not listed';
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
};
const statusClass = value => {
  const lower = String(value).toLowerCase();
  return /identified gap/.test(lower) ? 'gap' : /verif|checked|firsthand|complete/.test(lower) ? 'verified' : /wait|reported/.test(lower) ? 'waiting' : '';
};
const statusText = value => String(value ?? 'Record').replaceAll('_', ' ');
const readingTime = article => article.readTime || `${Math.max(2, Math.ceil(article.sections.flatMap(section => section.paragraphs ?? []).join(' ').split(/\s+/).length / 190))} min read`;
const articleUrl = id => `/?page=articles&article=${encodeURIComponent(id)}`;
const recordUrl = id => `/?page=explorer&record=${encodeURIComponent(id)}`;
const aboutText = value => {
  let html = escapeHtml(value);
  for (const phrase of ['A New Earth', 'repentance', 'metanoia', 'pain-body']) html = html.replaceAll(phrase, `<em>${phrase}</em>`);
  if (html.startsWith('Crossover is')) html = html.replace('Crossover', '<strong>Crossover</strong>');
  html = html.replace('We set ourselves against no person.', '<strong>We set ourselves against no person.</strong>');
  for (const phrase of ['Human Presence (&quot;Sorrow Guides&quot;):', 'AI &amp; Records as a Clear Mirror:', 'Acting Locally:']) html = html.replace(phrase, `<strong>${phrase}</strong>`);
  return html;
};

function articleCard(article) {
  const metaLeft = article.recordId && article.dateDisplay ? `${article.recordId} · ${article.dateDisplay}` : article.eyebrow;
  return `<article class="paper-card article-card">
    <div class="article-meta"><span>${escapeHtml(metaLeft)}</span><span>${escapeHtml(readingTime(article))}</span></div>
    <h3 class="card-title"><a href="${articleUrl(article.id)}" data-article-link="${escapeHtml(article.id)}">${escapeHtml(article.title)}</a></h3>
    <p class="card-summary">${escapeHtml(article.summary || article.dek)}</p>
    <div class="card-bottom"><div class="tag-list">${article.tags.slice(0, 2).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div><a class="text-link" href="${articleUrl(article.id)}" data-article-link="${escapeHtml(article.id)}">Read Article →</a></div>
  </article>`;
}

function workCard(record) {
  const next = record.rows?.find(row => row.id === 'next-step')?.value;
  const areaTags = (content.doing.areas[record.id] || record.kind)
    .split('·')
    .map(part => part.trim())
    .filter(Boolean)
    .slice(0, 2);
  return `<article class="paper-card work-card">
    <div class="work-card-body">
      <div class="card-top"><span class="card-id">${escapeHtml(record.id)}</span><span class="status ${statusClass(record.status)}">${escapeHtml(statusText(record.status))}</span></div>
      <h3 class="card-title">${escapeHtml(record.title)}</h3>
      <p class="card-summary">${escapeHtml(record.summary)}</p>
    </div>
    <div class="work-card-next">
      <p><strong>Next:</strong> ${escapeHtml(next || 'See the work record for the next step.')}</p>
    </div>
    <div class="card-bottom">
      <div class="tag-list">${areaTags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>
      <a class="text-link" href="${recordUrl(record.id)}" data-record-link="${escapeHtml(record.id)}">View record →</a>
    </div>
  </article>`;
}

function renderHome() {
  const selected = ['WORK-2026-002', 'WORK-2026-005', 'WORK-2026-004'].map(id => recordById.get(id)).filter(Boolean);
  const verifiedCount = records.filter(record => /^(verified|complete)$/i.test(record.status) || record.kind === 'Crossover activity').length;
  const openCount = records.filter(record => /^(active|open)$/i.test(record.status)).length;
  const gapCount = content.priorities.length;
  const kindCount = new Set(records.map(record => record.kind)).size;
  return `<section class="hero"><div class="wrap hero-grid">
    <div class="hero-copy"><span class="pill">${escapeHtml(content.home.eyebrow)}</span>
      <h1 class="display">${escapeHtml(content.home.title)}</h1><p class="lead">${escapeHtml(content.home.intro)}</p>
      <div class="hero-actions"><a class="button button-dark" href="/?page=articles" data-page-link="articles">Read Recent Articles →</a><a class="button" href="/?page=doing" data-page-link="doing">See What We're Doing Now</a><a class="button button-quiet" href="/?page=about" data-page-link="about">Why We Exist</a></div>
    </div><figure class="hero-art"><img src="${escapeHtml(content.home.image)}" alt="${escapeHtml(content.home.imageAlt)}" /><figcaption><span>${escapeHtml(content.home.imageCaption)}</span><span class="hero-art-badge">v2.4</span></figcaption></figure>
  </div></section>
  <section class="editorial-section"><div class="wrap"><div class="section-heading"><div><span class="eyebrow">Open Issues & Current Focus</span><h2 class="section-title">What We're Actively Doing Right Now</h2></div><a class="text-link" href="/?page=doing" data-page-link="doing">View all ${content.doing.order.length} tasks & milestones →</a></div><div class="cards-3">${selected.map(workCard).join('')}</div></div></section>
  <section class="editorial-section"><div class="wrap"><div class="section-heading"><div><span class="eyebrow">Published Writing & Field Notes</span><h2 class="section-title">Recent Articles & Analyses</h2></div><a class="text-link" href="/?page=articles" data-page-link="articles">Open Articles Index →</a></div><div class="cards-2">${articles.filter(article => article.type !== 'about' && article.featured).map(articleCard).join('')}</div></div></section>
  <section class="editorial-section archive-section"><div class="wrap"><div class="archive-callout"><div class="archive-top"><div class="archive-copy"><span class="eyebrow">Information Desk & Archive</span><h2 class="section-title">Explore Every Record, Gap & Source</h2><p>Instead of burying evidence inside complicated maps, every article, public dataset, identified gap, open repository issue, and local care resource is indexed in one filterable archive.</p></div><div class="metric-row"><a class="metric metric-complete" href="/?page=explorer" data-explorer-status="verified"><strong>${verifiedCount}</strong><span>Complete / Verified</span></a><a class="metric metric-open" href="/?page=explorer" data-explorer-status="open"><strong>${openCount}</strong><span>Active / Open</span></a><a class="metric metric-gap" href="/?page=doing" data-page-link="doing"><strong>${gapCount}</strong><span>Identified Gaps</span></a></div></div><div class="archive-foot"><span>Total indexed items: <strong>${records.length}</strong> records across ${kindCount} categories</span><a class="button button-dark" href="/?page=explorer" data-page-link="explorer">Open Information Explorer →</a></div></div></div></section>`;
}

function renderArticles() {
  const published = articles.filter(article => article.type !== 'about');
  return `<section class="section-page"><div class="wrap doing-shell"><header class="page-head"><span class="eyebrow">Articles & Analyses</span><h1 class="page-title">What We've Examined & Written</h1><p class="page-intro">Each article examines one concrete question using public records, AI pattern synthesis, and direct field observation—with source citations and focused maps where geography matters.</p></header>
    <div class="articles-index-list">${published.map(art => `<article class="paper-card article-card article-index-card">
      <div class="article-index-top">
        <div class="article-index-meta">
          <span class="article-index-id">${escapeHtml(art.recordId || 'ART')}</span>
          <span class="article-index-dot">•</span>
          <span>${escapeHtml(art.dateDisplay || dateLabel(art.date))} · ${escapeHtml(readingTime(art))}</span>
        </div>
        ${art.mapKey ? '<span class="status">Includes Single-Purpose Map</span>' : ''}
      </div>
      <h2 class="article-index-title"><a href="${articleUrl(art.id)}" data-article-link="${escapeHtml(art.id)}">${escapeHtml(art.title)}</a></h2>
      <p class="article-index-subtitle">${escapeHtml(art.dek)}</p>
      <p class="article-index-summary">${escapeHtml(art.summary || art.dek)}</p>
      <div class="card-bottom">
        <div class="tag-list">${art.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>
        <a class="button button-dark button-compact" href="${articleUrl(art.id)}" data-article-link="${escapeHtml(art.id)}">Read Full Article →</a>
      </div>
    </article>`).join('')}</div>
  </div></section>`;
}

function renderKeyTakeaways(article) {
  if (!article.keyTakeaways?.length) return '';
  return `<aside class="key-takeaways" aria-label="Key takeaways"><div class="eyebrow">Key Takeaways</div><ul>${article.keyTakeaways.map(point => `<li><span class="takeaway-dot" aria-hidden="true">•</span><span>${escapeHtml(point)}</span></li>`).join('')}</ul></aside>`;
}

function renderArticleMap(article) {
  const mapObj = article.mapKey ? ARTICLE_MAPS[article.mapKey] : null;
  if (!mapObj) return '';
  return `<div class="article-map-card">
    <div class="article-map-head">
      <div>
        <span class="eyebrow">Article Map Snapshot</span>
        <h2 class="article-map-title">${escapeHtml(mapObj.title)}</h2>
      </div>
      <button type="button" class="button button-dark button-compact" data-open-map="${escapeHtml(article.mapKey)}">
        <svg class="map-expand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
        <span>Open Full-Screen Map</span>
      </button>
    </div>
    <div class="article-map-stage" data-open-map="${escapeHtml(article.mapKey)}" role="button" tabindex="0" aria-label="Open full-screen map: ${escapeHtml(mapObj.title)}">
      ${mapObj.svg}
      <div class="article-map-overlay">
        <span>Click to inspect full-screen map</span>
      </div>
    </div>
  </div>`;
}

function renderArticle(article) {
  if (!article) return renderArticles();
  const sources = article.sources?.length
    ? article.sources
    : (article.sourceIds ?? []).map(id => {
        const rec = recordById.get(id);
        return rec ? { label: rec.title, ref: rec.id } : null;
      }).filter(Boolean);

  return `<article class="section-page"><div class="wrap article-shell">
    <a class="back-link" href="/?page=articles" data-page-link="articles">← Back to All Articles</a>
    <header class="article-header">
      <div class="article-byline-top">
        <span class="article-kicker">${escapeHtml(article.recordId || article.eyebrow)}</span>
        <span>·</span>
        <span>${escapeHtml(article.dateDisplay || dateLabel(article.date))}</span>
        <span>·</span>
        <span>${escapeHtml(readingTime(article))}</span>
      </div>
      <h1 class="article-title">${escapeHtml(article.title)}</h1>
      <p class="article-dek">${escapeHtml(article.dek)}</p>
    </header>
    ${renderKeyTakeaways(article)}
    ${renderArticleMap(article)}
    <div class="prose article-prose">
      ${article.sections.map(section => `<section>
        ${section.heading ? `<h3>${escapeHtml(section.heading)}</h3>` : ''}
        ${(section.paragraphs ?? []).map(paragraph => `<p>${paragraph}</p>`).join('')}
        ${section.bullets?.length ? `<ul>${section.bullets.map(bullet => `<li>${bullet}</li>`).join('')}</ul>` : ''}
        ${(section.afterParagraphs ?? []).map(paragraph => `<p>${paragraph}</p>`).join('')}
      </section>`).join('')}
    </div>
    <div class="source-list">
      <h2>Linked Sources &amp; Records</h2>
      <ul>
        ${sources.map(src => `<li>
          <span class="source-row-label">${escapeHtml(src.label)}</span>
          <button type="button" class="source-row-ref" data-record-link="${escapeHtml(src.ref)}">${escapeHtml(src.ref)} →</button>
        </li>`).join('')}
      </ul>
    </div>
  </div></article>`;
}

function renderDoing() {
  const doing = content.doing;
  const items = doing.order.map(id => recordById.get(id)).filter(Boolean);
  const state = record => record.kind === 'Crossover activity' ? 'completed' : record.rows?.find(row => row.id === 'progress')?.value === 'in progress' ? 'active' : 'planned';
  const filtered = workFilter === 'all' ? items : items.filter(record => state(record) === workFilter);
  return `<section class="section-page doing-page"><div class="wrap doing-shell"><header class="page-head"><span class="eyebrow">${escapeHtml(doing.eyebrow)}</span><h1 class="page-title">${escapeHtml(doing.title)}</h1><p class="page-intro">${escapeHtml(doing.intro)}</p><div class="doing-steps">${doing.steps.map(step => `<div><span>STEP ${escapeHtml(step.number)} · ${escapeHtml(step.label)}</span><strong>${escapeHtml(step.text)}</strong></div>`).join('')}</div></header>
    <div class="filter-row doing-filters" aria-label="Filter local work">${['all', 'active', 'completed', 'planned'].map(filter => `<button type="button" data-work-filter="${filter}" aria-pressed="${workFilter === filter}">${filter[0].toUpperCase() + filter.slice(1)}</button>`).join('')}</div>
    <div class="doing-list" id="work-list">${filtered.length ? filtered.map(record => {
      const phase = state(record);
      const next = record.rows?.find(row => row.id === 'next-step')?.value;
      return `<article class="doing-card"><div class="doing-card-meta"><div><strong>${escapeHtml(record.id)}</strong><span aria-hidden="true"> · </span><span>${escapeHtml(doing.areas[record.id] || record.kind)}</span></div><span class="doing-badge ${phase}">${phase === 'planned' ? 'Open' : phase}</span></div><h2>${escapeHtml(record.title)}</h2><p>${escapeHtml(record.summary)}</p><div class="doing-card-foot"><p><strong>${phase === 'completed' ? 'Recorded:' : 'Next action:'}</strong> ${escapeHtml(phase === 'completed' ? dateLabel(record.date) : next || 'Confirm the next step with the partner.')}</p><a class="text-link" href="${recordUrl(record.id)}" data-record-link="${escapeHtml(record.id)}">View record →</a></div></article>`;
    }).join('') : '<div class="doing-empty">No items have this status in the current record. Planned work becomes active here when a dated action is documented.</div>'}</div>
  </div></section>`;
}

function renderAi() {
  const ai = content.ai;
  return `<section class="section-page ai-page"><div class="wrap doing-shell"><header class="page-head"><span class="eyebrow">${escapeHtml(ai.eyebrow)}</span><h1 class="page-title">AI & Ideas</h1><p class="page-intro">${escapeHtml(ai.intro)}</p></header>
    <h2 class="section-title ai-section-title">${escapeHtml(ai.sectionTitle)}</h2><div class="ai-grid">${ai.ideas.map(idea => `<article class="ai-card"><div class="ai-card-top"><span>AI-${escapeHtml(idea.number)}</span><span>${escapeHtml(idea.stage)}</span></div><h3>${escapeHtml(idea.title)}</h3><p><strong>Friction:</strong> ${escapeHtml(idea.friction)}</p><p><strong>Applied role:</strong> ${escapeHtml(idea.role)}</p><a class="text-link" href="${articleUrl(idea.articleId)}" data-article-link="${escapeHtml(idea.articleId)}">Read the context →</a></article>`).join('')}</div>
    <section class="ai-aside"><span class="eyebrow">${escapeHtml(ai.aside.eyebrow)}</span><h2>${escapeHtml(ai.aside.title)}</h2><p>${escapeHtml(ai.aside.intro)}</p><ol>${ai.aside.points.map(point => `<li><strong>${escapeHtml(point.title)}:</strong> ${escapeHtml(point.text)}</li>`).join('')}</ol><p>${escapeHtml(ai.aside.conclusion)}</p></section>
  </div></section>`;
}

function matchesStatusFilter(record, statusFilter) {
  return statusFilter === 'all'
    || (statusFilter === 'complete' && (record.kind === 'Crossover activity' || statusText(record.status).toLowerCase() === 'complete'))
    || (statusFilter === 'active' && record.rows?.find(row => row.id === 'progress')?.value === 'in progress')
    || (statusFilter === 'open issue' && statusText(record.status).toLowerCase() === 'open')
    || statusText(record.status).toLowerCase() === statusFilter;
}

function filterRecords() {
  const query = explorer.query.trim().toLowerCase();
  return records.filter(record => {
    const matchesQuery = !query || [record.id, record.originalId, record.title, record.summary, record.publisher, record.kind].some(value => String(value ?? '').toLowerCase().includes(query));
    return matchesQuery && matchesStatusFilter(record, explorer.status) && (explorer.kind === 'all' || record.kind === explorer.kind);
  });
}

function copyTextWithFeedback(text, buttonEl, label) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    if (buttonEl) {
      buttonEl.textContent = 'Copied ✓';
      setTimeout(() => { buttonEl.textContent = label; }, 1800);
    }
  } catch (err) {}
  document.body.removeChild(textarea);
}

function downloadRecordCsv(record) {
  if (!record) return;
  const rows = [
    ['Record_ID', 'Original_ID', 'Title', 'Kind', 'Status', 'Publisher', 'Date', 'Checked', 'Source_URL'],
    [record.id, record.originalId || '', record.title, record.kind, statusText(record.status), record.publisher || '', record.date || '', record.checked || '', record.sourceUrl || '']
  ];
  const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${record.id}_entry.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function renderDossierInspector() {
  const panel = document.querySelector('#explorer-dossier-panel');
  if (!panel) return;
  const filtered = filterRecords();
  const rec = recordById.get(explorer.selectedId) || filtered[0] || records[0];
  if (!rec) return;
  explorer.selectedId = rec.id;

  const primary = primaryById.get(rec.id);
  const hasPublicSource = Boolean(rec.sourceUrl && !rec.articleId);
  const limitsText = rec.limits || primary?.limitations || 'No scope limitations recorded.';
  const checkedText = primary?.dateAcquired || (rec.checked && rec.checked !== 'Not dated' ? rec.checked : rec.date) || 'Not dated';

  // Tab 1: Primary Source Artifact
  const checklist = primary?.checklistItems?.length
    ? primary.checklistItems.map(item => ({
        label: item.item,
        badge: item.status || item.time || 'LOGGED',
        note: item.note
      }))
    : (rec.rows ?? []).map(row => ({
        label: row.label,
        badge: statusText(rec.status).toUpperCase(),
        note: `${row.value}${row.unit ? ` ${row.unit}` : ''}${row.note ? ` — ${row.note}` : ''}`
      }));

  const artifactHtml = `
    <div class="dossier-tab-stack">
      ${hasPublicSource ? `<a href="${escapeHtml(rec.sourceUrl)}" target="_blank" rel="noopener noreferrer" class="dossier-source-link">Open original source ↗</a>` : `<p class="dossier-muted-note">${rec.articleId ? 'Published editorial analysis or gap record in Crossover Stockton.' : 'Original artifact is not attached to this preview.'}</p>`}
      ${checklist.length ? checklist.map(item => `
        <div class="dossier-item-card">
          <div class="dossier-item-top">
            <strong>${escapeHtml(item.label)}</strong>
            <span class="status ${statusClass(rec.status)}">${escapeHtml(item.badge)}</span>
          </div>
          <p>${escapeHtml(item.note)}</p>
        </div>
      `).join('') : `<div class="dossier-item-card"><p>${escapeHtml(rec.summary)}</p></div>`}
    </div>
  `;

  // Tab 2: Extracted Claims & Linked Articles
  const citingArticles = articles.filter(art => art.type !== 'about' && art.sourceIds?.includes(rec.id));
  const primaryClaims = primary?.extractedClaims ?? [];
  const totalClaims = primaryClaims.length + citingArticles.length + (rec.articleId ? 1 : 0);

  const claimsHtml = `
    <div class="dossier-tab-stack">
      ${rec.articleId ? `
        <div class="dossier-item-card dossier-claim-row">
          <div>
            <strong>Published Editorial Record</strong>
            <p>${escapeHtml(rec.summary)}</p>
          </div>
          <a class="button button-dark button-compact" href="${articleUrl(rec.articleId)}" data-article-link="${escapeHtml(rec.articleId)}">Read Article →</a>
        </div>
      ` : ''}
      ${primaryClaims.map(c => `
        <div class="dossier-item-card dossier-claim-row">
          <div>
            <strong>${escapeHtml(c.metric)}</strong>
            <p>${escapeHtml(c.note)}</p>
            <span class="dossier-sub-meta">Published on: ${escapeHtml(c.location)}</span>
          </div>
        </div>
      `).join('')}
      ${citingArticles.map(art => `
        <div class="dossier-item-card dossier-claim-row">
          <div>
            <strong>Cited in ${escapeHtml(art.recordId)}: ${escapeHtml(art.title)}</strong>
            <p>${escapeHtml(art.dek)}</p>
          </div>
          <a class="button button-compact" href="${articleUrl(art.id)}" data-article-link="${escapeHtml(art.id)}">Read Article →</a>
        </div>
      `).join('')}
      ${totalClaims === 0 ? '<p class="dossier-muted-note">No separate published claim or article citation is linked to this entry yet.</p>' : ''}
    </div>
  `;

  // Tab 3: Custody & Agency Reply
  const custodyChain = primary?.custodyChain?.length
    ? primary.custodyChain
    : [
        { date: rec.date || 'Catalog', actor: rec.publisher || 'Crossover Stockton', action: `Indexed as ${rec.id} (${rec.kind}).` },
        ...(rec.checked && rec.checked !== 'Not dated' ? [{ date: rec.checked, actor: 'Verification check', action: 'Record status and metadata verified.' }] : [])
      ];
  const agencyResponses = primary?.agencyResponses ?? [];

  const custodyHtml = `
    <div class="dossier-tab-stack">
      <div>
        <div class="eyebrow dossier-section-label">Archival Chain of Custody</div>
        <div class="custody-timeline">
          ${custodyChain.map(ev => `
            <div class="custody-step">
              <div class="custody-step-meta">${escapeHtml(ev.date)} · ${escapeHtml(ev.actor)}</div>
              <p>${escapeHtml(ev.action)}</p>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="dossier-reply-section">
        <div class="eyebrow dossier-section-label">Agency Right-of-Reply &amp; Errata</div>
        ${agencyResponses.length ? agencyResponses.map(resp => `
          <div class="dossier-item-card">
            <div class="dossier-item-top">
              <strong>${escapeHtml(resp.agency)}</strong>
              <span class="mono-label">${escapeHtml(resp.date)}</span>
            </div>
            <p>“${escapeHtml(resp.statement)}”</p>
          </div>
        `).join('') : `
          <div class="dossier-item-card">
            <p>No formal agency clarification or errata has been filed for <strong>${escapeHtml(rec.id)}</strong>. Agencies may submit verbatim responses for publication alongside any record.</p>
          </div>
        `}
      </div>
    </div>
  `;

  panel.innerHTML = `
    <div class="dossier-head">
      <div class="dossier-head-top">
        <div class="dossier-badges">
          <span class="dossier-id">${escapeHtml(rec.id)}</span>
          <span class="status ${statusClass(rec.status)}">${escapeHtml(statusText(rec.status))}</span>
          <span class="tag">${hasPublicSource ? 'ORIGINAL SOURCE LINKED' : rec.articleId ? 'CROSSOVER ARTICLE' : 'NO PUBLIC ARTIFACT'}</span>
        </div>
        <span class="dossier-date">Recorded / checked: ${escapeHtml(checkedText)}</span>
      </div>
      <h2 class="dossier-title">${escapeHtml(rec.title)}</h2>
      <p class="dossier-summary">${escapeHtml(rec.summary)}</p>
      <div class="dossier-actions">
        <button type="button" class="button button-dark button-compact" data-export-csv="${escapeHtml(rec.id)}">Export Entry CSV</button>
        <button type="button" class="button button-compact" data-copy-citation="${escapeHtml(rec.id)}">Copy Formal Citation</button>
        ${rec.articleId ? `<a class="button button-compact" href="${articleUrl(rec.articleId)}" data-article-link="${escapeHtml(rec.articleId)}">Read Linked Article →</a>` : ''}
      </div>
    </div>
    <div class="dossier-scope-bar">
      <div>
        <span class="eyebrow">Scope &amp; Limits</span>
        <p>${escapeHtml(limitsText)}</p>
      </div>
      <span class="tag">${escapeHtml(primary?.severityBasis?.level || rec.kind)}</span>
    </div>
    <div class="dossier-tabs" role="tablist" aria-label="Record dossier sections">
      <button type="button" role="tab" aria-selected="${explorer.subTab === 'artifact'}" data-dossier-tab="artifact">1. Primary Source Artifact</button>
      <button type="button" role="tab" aria-selected="${explorer.subTab === 'claims'}" data-dossier-tab="claims">2. Extracted Claims (${totalClaims})</button>
      <button type="button" role="tab" aria-selected="${explorer.subTab === 'custody'}" data-dossier-tab="custody">3. Custody &amp; Agency Reply</button>
    </div>
    <div class="dossier-body">
      ${explorer.subTab === 'artifact' ? artifactHtml : explorer.subTab === 'claims' ? claimsHtml : custodyHtml}
    </div>
  `;
}

function renderResults() {
  const filtered = filterRecords();
  const count = document.querySelector('#result-count');
  const indexCount = document.querySelector('#index-head-count');
  const list = document.querySelector('#record-list');
  if (!count || !list) return;
  count.textContent = `Showing ${filtered.length} of ${records.length} records`;
  if (indexCount) indexCount.textContent = `MASTER FILE INDEX (${filtered.length})`;
  document.querySelectorAll('[data-status-pill]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.statusPill === explorer.status)));

  if (!filtered.length) {
    list.innerHTML = '<div class="explorer-empty"><p><strong>No matching records</strong></p><p>Try a different search or clear a filter.</p></div>';
    const panel = document.querySelector('#explorer-dossier-panel');
    if (panel) panel.innerHTML = '<div class="dossier-body"><p class="dossier-muted-note">Select a matching record on the left to inspect its primary source, claims, and custody trail.</p></div>';
    return;
  }

  if (!filtered.some(item => item.id === explorer.selectedId)) {
    explorer.selectedId = filtered[0].id;
  }

  list.innerHTML = filtered.map(record => {
    const primary = primaryById.get(record.id);
    const tier = primary?.tier || record.kind.toUpperCase();
    const isSelected = record.id === explorer.selectedId;
    return `<button type="button" class="record-row${isSelected ? ' is-selected' : ''}" data-select-record="${escapeHtml(record.id)}" aria-current="${isSelected ? 'true' : 'false'}">
      <div class="record-meta">
        <span class="card-id">${escapeHtml(record.id)}</span>
        <span class="status ${statusClass(record.status)}">${escapeHtml(statusText(record.status))}</span>
      </div>
      <h2>${escapeHtml(record.title)}</h2>
      <div class="record-foot-meta">
        <span>${escapeHtml(tier)}</span>
        <span>${escapeHtml(record.kind)}</span>
      </div>
    </button>`;
  }).join('');

  renderDossierInspector();
}

function renderExplorer() {
  const statuses = [...new Set(records.map(record => statusText(record.status).toLowerCase()))].sort();
  const kinds = [...new Set(records.map(record => record.kind))].sort();
  const quickStatuses = ['all', 'complete', 'active', 'open issue', 'identified gap', 'verified'];
  const statusCounts = Object.fromEntries(quickStatuses.map(st => [st, records.filter(r => matchesStatusFilter(r, st)).length]));
  return `<section class="section-page explorer-page"><div class="wrap explorer-wrap"><header class="page-head"><span class="eyebrow">Information Desk &amp; Record Index</span><h1 class="page-title">Info Explorer</h1><p class="page-intro">Inspect linked articles, public datasets, identified gaps, open work items, and local care resources. Filter on the left and drill down into primary artifacts, claims, and custody on the right.</p></header>
    <div class="explorer-desk">
      <aside class="explorer-index-panel" aria-label="Master record index">
        <div class="index-panel-head">
          <span id="index-head-count" class="eyebrow">MASTER FILE INDEX (${records.length})</span>
          <span class="index-head-sub">Crossover records</span>
        </div>
        <div class="index-controls">
          <div class="field">
            <label for="record-search">Keyword Search</label>
            <input id="record-search" type="search" placeholder="Search ID, agency, keyword..." value="${escapeHtml(explorer.query)}" />
          </div>
          <div class="index-selects">
            <div class="field">
              <label for="record-status">Status</label>
              <select id="record-status"><option value="all">All</option>${['complete', 'active', 'open issue', ...statuses.filter(status => status !== 'open' && status !== 'complete')].map(status => `<option value="${escapeHtml(status)}" ${explorer.status === status ? 'selected' : ''}>${escapeHtml(statusText(status))}</option>`).join('')}</select>
            </div>
            <div class="field">
              <label for="record-kind">Type</label>
              <select id="record-kind"><option value="all">All</option>${kinds.map(kind => `<option value="${escapeHtml(kind)}" ${explorer.kind === kind ? 'selected' : ''}>${escapeHtml(kind)}</option>`).join('')}</select>
            </div>
          </div>
          <div class="explorer-quick-pills" aria-label="Quick status filters">${quickStatuses.map(status => `<button type="button" data-status-pill="${status}" aria-pressed="${explorer.status === status}">${status === 'all' ? 'All' : status === 'open issue' ? 'Open Issue' : status === 'identified gap' ? 'Identified Gap' : statusText(status)[0].toUpperCase() + statusText(status).slice(1)} (${statusCounts[status]})</button>`).join('')}</div>
          <p class="result-count" id="result-count"></p>
        </div>
        <div id="record-list" class="record-list"></div>
      </aside>
      <section id="explorer-dossier-panel" class="explorer-dossier-panel" aria-label="Record dossier inspector"></section>
    </div>
  </div></section>`;
}

function renderAbout() {
  const about = articleById('about-crossover');
  const founder = about.founder;
  return `<article class="section-page about-page"><div class="wrap article-shell"><header class="page-head"><span class="eyebrow">${escapeHtml(about.eyebrow)}</span><h1 class="page-title">${escapeHtml(about.title)}</h1><p class="article-dek">${aboutText(about.intro)}</p></header>
    <figure class="about-figure"><img src="${escapeHtml(about.image)}" alt="${escapeHtml(about.imageAlt)}" /><figcaption>${escapeHtml(about.imageCaption)}</figcaption></figure>
    <div class="prose about-prose">${about.sections.map(section => `<section><h2>${escapeHtml(section.heading)}</h2>${section.paragraphs.map(paragraph => `<p>${aboutText(paragraph)}</p>`).join('')}${section.bullets?.length ? `<ul>${section.bullets.map(bullet => `<li>${aboutText(bullet)}</li>`).join('')}</ul>` : ''}</section>`).join('')}</div>
    <div class="about-grounding">${about.groundingCards.map(card => `<div><span class="eyebrow">${escapeHtml(card.eyebrow)}</span><h3>${escapeHtml(card.title)}</h3><p>${escapeHtml(card.text)}</p></div>`).join('')}</div>
    ${founder ? `<aside class="about-founder-card" aria-label="Founder">
      <img src="${escapeHtml(founder.image)}" alt="${escapeHtml(founder.imageAlt)}" class="about-founder-photo" />
      <div class="about-founder-info">
        <span class="eyebrow">${escapeHtml(founder.role)}</span>
        <h2>${escapeHtml(founder.name)}</h2>
        <p>${escapeHtml(founder.bio)}</p>
        <a class="button button-compact about-linkedin-link" href="${escapeHtml(founder.linkedinUrl)}" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z"/></svg>
          <span>Connect on LinkedIn ↗</span>
        </a>
      </div>
    </aside>` : ''}
  </div></article>`;
}

function parseRoute() {
  const url = new URL(location.href);
  let page = url.searchParams.get('page') || 'home';
  if (url.pathname.startsWith('/evidence-room') || url.searchParams.get('tab') === 'evidence-room') page = 'explorer';
  if (!['home', 'articles', 'doing', 'ai', 'explorer', 'about'].includes(page)) page = 'home';
  return { page, article: url.searchParams.get('article'), record: url.searchParams.get('record') };
}

function navigate(next, push = true) {
  const url = new URL(location.href);
  url.pathname = '/';
  url.search = '';
  if (next.page !== 'home') url.searchParams.set('page', next.page);
  if (next.article) url.searchParams.set('article', next.article);
  if (next.record) url.searchParams.set('record', next.record);
  if (push) history.pushState({}, '', url);
  route = next;
  if (next.page === 'explorer' && next.record) explorer.selectedId = next.record;
  render();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function render() {
  if (route.page === 'articles') main.innerHTML = route.article && articleById(route.article)?.type !== 'about' ? renderArticle(articleById(route.article)) : renderArticles();
  else if (route.page === 'doing') main.innerHTML = renderDoing();
  else if (route.page === 'ai') main.innerHTML = renderAi();
  else if (route.page === 'explorer') {
    if (route.record && recordById.has(route.record)) explorer.selectedId = route.record;
    main.innerHTML = renderExplorer();
  } else if (route.page === 'about') main.innerHTML = renderAbout();
  else main.innerHTML = renderHome();
  document.querySelectorAll('[data-page-link]').forEach(link => {
    if (link.dataset.pageLink === route.page) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  document.title = route.article && articleById(route.article)
    ? `${articleById(route.article).title} · Crossover Stockton`
    : route.page === 'home'
      ? `Crossover Stockton · ${content.tagline}`
      : `${route.page === 'ai' ? 'AI & Ideas' : route.page === 'doing' ? "What We're Doing" : route.page === 'explorer' ? 'Info Explorer' : route.page[0].toUpperCase() + route.page.slice(1)} · Crossover Stockton`;
  if (route.page === 'explorer') renderResults();
  if (route.page !== 'explorer' && route.record && recordById.has(route.record)) openRecord(route.record, false);
}

function openRecord(id, updateUrl = true) {
  const record = recordById.get(id);
  if (!record) return;
  document.querySelector('#record-dialog-id').textContent = `${record.id} · ${record.kind}`;
  const statusEl = document.querySelector('#record-dialog-status');
  if (statusEl) {
    statusEl.textContent = statusText(record.status);
    statusEl.className = `status ${statusClass(record.status)}`;
  }
  document.querySelector('#record-dialog-content').innerHTML = `<h2 id="record-dialog-title">${escapeHtml(record.title)}</h2><div class="dialog-meta-box"><dl><dt>Status</dt><dd>${escapeHtml(statusText(record.status))}</dd><dt>Publisher</dt><dd>${escapeHtml(record.publisher)}</dd><dt>Record date</dt><dd>${escapeHtml(dateLabel(record.date))}</dd><dt>Checked</dt><dd>${escapeHtml(dateLabel(record.checked))}</dd></dl></div><p class="dialog-summary">${escapeHtml(record.summary)}</p>${record.limits ? `<div class="dialog-section"><h3 class="serif">Scope & limits</h3><p>${escapeHtml(record.limits)}</p></div>` : ''}${record.rows?.length ? `<div class="dialog-section"><h3 class="serif">Details</h3><ul>${record.rows.slice(0, 6).map(row => `<li><strong>${escapeHtml(row.label)}:</strong> ${escapeHtml(row.value)} ${escapeHtml(row.unit || '')}${row.note ? ` — ${escapeHtml(row.note)}` : ''}</li>`).join('')}</ul></div>` : ''}${record.sourceUrl && !record.articleId ? `<p class="dialog-source-link"><a href="${escapeHtml(record.sourceUrl)}" target="_blank" rel="noopener noreferrer">Open original source ↗</a></p>` : ''}`;
  const footEl = document.querySelector('#record-dialog-foot');
  if (footEl) {
    footEl.innerHTML = `<a class="button button-compact" href="${recordUrl(record.id)}" data-explorer-record="${escapeHtml(record.id)}">View in Info Explorer →</a><div class="dialog-foot-actions">${record.articleId ? `<a class="button button-compact" href="${articleUrl(record.articleId)}" data-article-link="${escapeHtml(record.articleId)}">Read Linked Article →</a>` : ''}<button type="button" class="button button-dark button-compact" data-close-dialog>Done</button></div>`;
  }
  if (!dialog.open) dialog.showModal();
  if (updateUrl) {
    const url = new URL(location.href);
    url.searchParams.set('record', id);
    history.replaceState({}, '', url);
  }
}

function closeRecord() {
  if (dialog.open) dialog.close();
  const url = new URL(location.href);
  if (url.searchParams.has('record') && route.page !== 'explorer') {
    url.searchParams.delete('record');
    history.replaceState({}, '', url);
  }
}

// Single-Purpose Full-Screen Map Controller
let mapZoom = 1;
let mapPanX = 0;
let mapPanY = 0;
let isDraggingMap = false;
let dragStartX = 0;
let dragStartY = 0;

function applyMapTransform() {
  const layer = document.querySelector('#fs-map-transform-layer');
  if (layer) layer.style.transform = `translate(${mapPanX}px, ${mapPanY}px) scale(${mapZoom})`;
}

function resetMapTransform() {
  mapZoom = 1;
  mapPanX = 0;
  mapPanY = 0;
  applyMapTransform();
}

function adjustMapZoom(delta) {
  mapZoom = Math.min(2.4, Math.max(0.7, +(mapZoom + delta).toFixed(2)));
  applyMapTransform();
}

function openFullScreenMap(mapKey) {
  const mapObj = ARTICLE_MAPS[mapKey];
  if (!mapObj || !mapModal) return;
  document.querySelector('#fs-map-title').textContent = mapObj.title;
  document.querySelector('#fs-map-subtitle').textContent = mapObj.subtitle;
  document.querySelector('#fs-map-transform-layer').innerHTML = mapObj.svg;
  document.querySelector('#fs-map-legend').innerHTML = mapObj.legend;
  resetMapTransform();
  mapModal.hidden = false;
}

function closeFullScreenMap() {
  if (mapModal) mapModal.hidden = true;
}

const mapViewport = document.querySelector('#fs-map-viewport');
if (mapViewport) {
  mapViewport.addEventListener('mousedown', event => {
    isDraggingMap = true;
    dragStartX = event.clientX - mapPanX;
    dragStartY = event.clientY - mapPanY;
  });
  window.addEventListener('mousemove', event => {
    if (!isDraggingMap) return;
    mapPanX = event.clientX - dragStartX;
    mapPanY = event.clientY - dragStartY;
    applyMapTransform();
  });
  window.addEventListener('mouseup', () => { isDraggingMap = false; });
}

function setMobileMenuOpen(open) {
  const btn = document.querySelector('#mobile-menu-btn');
  const panel = document.querySelector('#mobile-menu-panel');
  if (!btn || !panel) return;
  panel.hidden = !open;
  btn.setAttribute('aria-expanded', String(open));
  btn.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
}

document.addEventListener('click', event => {
  const menuBtn = event.target.closest('#mobile-menu-btn');
  if (menuBtn) {
    const panel = document.querySelector('#mobile-menu-panel');
    setMobileMenuOpen(panel ? panel.hidden : false);
    return;
  }
  const openMenu = document.querySelector('#mobile-menu-panel:not([hidden])');
  if (openMenu && !event.target.closest('.site-header')) {
    setMobileMenuOpen(false);
  }
  const openMapBtn = event.target.closest('[data-open-map]');
  if (openMapBtn) { event.preventDefault(); openFullScreenMap(openMapBtn.dataset.openMap); return; }
  const closeMapBtn = event.target.closest('[data-close-map]');
  if (closeMapBtn) { event.preventDefault(); closeFullScreenMap(); return; }
  const zoomBtn = event.target.closest('[data-map-zoom]');
  if (zoomBtn) { event.preventDefault(); adjustMapZoom(Number(zoomBtn.dataset.mapZoom)); return; }
  const resetMapBtn = event.target.closest('[data-map-reset]');
  if (resetMapBtn) { event.preventDefault(); resetMapTransform(); return; }
  const close = event.target.closest('[data-close-dialog]');
  if (close) { closeRecord(); return; }
  const explorerRecordLink = event.target.closest('[data-explorer-record]');
  if (explorerRecordLink) {
    event.preventDefault();
    const recId = explorerRecordLink.dataset.explorerRecord;
    closeRecord();
    explorer = { query: '', status: 'all', kind: 'all', selectedId: recId, subTab: 'artifact' };
    navigate({ page: 'explorer', article: null, record: recId });
    return;
  }
  const selectRecordBtn = event.target.closest('[data-select-record]');
  if (selectRecordBtn) {
    event.preventDefault();
    explorer.selectedId = selectRecordBtn.dataset.selectRecord;
    explorer.subTab = 'artifact';
    const url = new URL(location.href);
    url.searchParams.set('page', 'explorer');
    url.searchParams.set('record', explorer.selectedId);
    history.replaceState({}, '', url);
    renderResults();
    if (window.innerWidth <= 950) {
      document.querySelector('#explorer-dossier-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    return;
  }
  const dossierTabBtn = event.target.closest('[data-dossier-tab]');
  if (dossierTabBtn) {
    explorer.subTab = dossierTabBtn.dataset.dossierTab;
    renderDossierInspector();
    return;
  }
  const exportBtn = event.target.closest('[data-export-csv]');
  if (exportBtn) {
    downloadRecordCsv(recordById.get(exportBtn.dataset.exportCsv));
    return;
  }
  const copyBtn = event.target.closest('[data-copy-citation]');
  if (copyBtn) {
    const rec = recordById.get(copyBtn.dataset.copyCitation);
    if (rec) {
      const citation = `Crossover Stockton care and action record. Entry [${rec.id}]: "${rec.title}." Source: ${rec.publisher || 'Crossover Stockton'}${rec.sourceUrl ? `, ${rec.sourceUrl}` : ''} (recorded or checked ${rec.checked || rec.date || 'n.d.'}).`;
      copyTextWithFeedback(citation, copyBtn, 'Copy Formal Citation');
    }
    return;
  }
  const recordLink = event.target.closest('[data-record-link]');
  if (recordLink) { event.preventDefault(); openRecord(recordLink.dataset.recordLink); return; }
  const explorerStatus = event.target.closest('[data-explorer-status]');
  if (explorerStatus) { event.preventDefault(); explorer = { query: '', status: explorerStatus.dataset.explorerStatus === 'open' ? 'open issue' : explorerStatus.dataset.explorerStatus, kind: 'all', selectedId: null, subTab: 'artifact' }; navigate({ page: 'explorer', article: null, record: null }); return; }
  const statusPill = event.target.closest('[data-status-pill]');
  if (statusPill) { explorer.status = statusPill.dataset.statusPill; document.querySelector('#record-status').value = explorer.status; renderResults(); return; }
  const articleLink = event.target.closest('[data-article-link]');
  if (articleLink) { event.preventDefault(); closeRecord(); navigate({ page: 'articles', article: articleLink.dataset.articleLink, record: null }); return; }
  const pageLink = event.target.closest('[data-page-link]');
  if (pageLink) { event.preventDefault(); setMobileMenuOpen(false); closeRecord(); closeFullScreenMap(); navigate({ page: pageLink.dataset.pageLink, article: null, record: null }); return; }
  const workButton = event.target.closest('[data-work-filter]');
  if (workButton) { workFilter = workButton.dataset.workFilter; render(); }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    setMobileMenuOpen(false);
    closeFullScreenMap();
  }
});
document.addEventListener('input', event => {
  if (event.target.id === 'record-search') { explorer.query = event.target.value; renderResults(); }
});
document.addEventListener('change', event => {
  if (event.target.id === 'record-status') { explorer.status = event.target.value; renderResults(); }
  if (event.target.id === 'record-kind') { explorer.kind = event.target.value; renderResults(); }
});
dialog.addEventListener('click', event => { if (event.target === dialog) closeRecord(); });
dialog.addEventListener('close', () => {
  const url = new URL(location.href);
  if (url.searchParams.has('record') && route.page !== 'explorer') { url.searchParams.delete('record'); history.replaceState({}, '', url); }
});
window.addEventListener('popstate', () => { closeRecord(); closeFullScreenMap(); route = parseRoute(); render(); });

async function initialize() {
  try {
    const response = await fetch('/data/records.json');
    if (!response.ok) throw new Error(`Record catalog unavailable (${response.status})`);
    const baseRecords = await response.json();
    const articleRecords = articles.filter(article => article.type !== 'about').map(article => ({
      id: article.recordId,
      kind: 'Article',
      title: article.explorerTitle || article.title,
      summary: article.explorerSummary || article.summary,
      status: 'Complete',
      publisher: article.explorerSource || 'Crossover Stockton Editorial',
      date: article.date,
      checked: article.date,
      articleId: article.id,
      sourceUrl: articleUrl(article.id),
      limits: null
    }));
    const gapRecords = content.priorities.map(priority => {
      const article = articleById(priority.articleId);
      return { id: `GAP-${priority.number}`, kind: 'Identified Gap', title: priority.name, summary: priority.summary, status: 'Identified Gap', publisher: 'Crossover Stockton', date: article?.date, checked: null, articleId: priority.articleId, sourceUrl: articleUrl(priority.articleId), limits: 'This is an identified focus area for practical local action.' };
    });
    records = [...articleRecords, ...baseRecords, ...gapRecords];
    records.forEach(record => recordById.set(record.id, record));
    for (const article of articles) for (const id of article.sourceIds ?? []) if (!recordById.has(id)) throw new Error(`Missing source record ${id} in ${article.id}`);
    route = parseRoute();
    render();
  } catch (error) {
    main.innerHTML = `<div class="wrap section-page"><h1 class="page-title">The site could not load its records.</h1><p class="page-intro">Please refresh the page. ${escapeHtml(error.message)}</p></div>`;
    console.error(error);
  }
}

initialize();
