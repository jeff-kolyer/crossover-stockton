import { runInNewContext } from 'node:vm';

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

export function renderSiteMdPages(template, source, feed, story, publication, origin, feedContent, assetVersion) {
  const app = { innerHTML: '' };
  const location = { pathname: '/', search: '' };
  const document = {
    title: '',
    getElementById(id) { return id === 'app' ? app : null; },
    querySelector() { return { addEventListener() {} }; },
  };
  const context = {
    document, location, window: { scrollTo() {} }, URL, URLSearchParams,
    sourceFeed: feed, sourceStory: story, sourcePublication: publication, sourceFeedContent: feedContent,
  };
  const renderer = source.replace(/\bstart\(\);\s*$/, '');
  if (renderer === source) throw new Error('Could not isolate the SITE.md renderer');
  runInNewContext(renderer, context, { timeout: 3000 });
  runInNewContext(`feed=sourceStory;publication=sourcePublication;feedContent=sourceFeedContent;records=Object.values(sourceFeed.records);byId=new Map(records.map(item=>[item.id,item]));gap=records.find(item=>item.schema==='gap'&&item.fields?.default)||records.find(item=>item.schema==='gap');gapStory=feed.chapters.find(item=>item.id==='gap');menu=feed.silent.menu;`, context, { timeout: 3000 });

  const gapSlug = Object.values(feed.records).find(item => item.schema === 'gap' && item.fields?.default)?.fields?.slug;
  if (!gapSlug) throw new Error('No default gap slug in the public records');
  const paths = new Set(['/', '/about/', '/feed/', `/${gapSlug}/overview/`, ...story.silent.menu.filter(item => item.page !== 'overview').map(item => `/${gapSlug}/${item.page}/`)]);
  for (const record of Object.values(feed.records)) {
    paths.add(`/${record.schema === 'organization' ? 'organization' : 'record'}/${encodeURIComponent(record.id)}/`);
  }

  return [...paths].map(path => {
    location.pathname = path;
    location.search = '';
    runInNewContext('render()', context, { timeout: 3000 });
    if (!app.innerHTML.includes('class="care-shell"')) throw new Error(`Crossover page did not render: ${path}`);
    const title = document.title;
    const sectionByPath={'/':'overview'};
    const sectionId=sectionByPath[path]||(path===`/${gapSlug}/overview/`?'overview':null);
    const description = sectionId ? publication.gapPublications.find(item => item.gapId === Object.values(feed.records).find(record => record.schema === 'gap' && record.fields?.default)?.id)?.items.filter(item => item.section === sectionId && item.status === 'published').sort((a,b)=>a.order-b.order)[0]?.body.slice(0,160)
      : path === '/about/' ? publication.sitePublications.find(item => item.id === 'about')?.items.filter(item => item.status === 'published').sort((a,b)=>a.order-b.order)[0]?.body.slice(0,160)
      : path === '/feed/' ? story.description
      : 'Crossover Stockton public feed and connected records.';
    const canonical = path === `/${gapSlug}/overview/` || path === '/feed/' ? '/' : path;
    const html = template
      .replace(/<meta name="robots" content="noindex">\s*/, path === canonical ? '' : '<meta name="robots" content="noindex,follow">\n')
      .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`)
      .replace(/<link rel="stylesheet" href="\/preview\/site-md.css">/, `<link rel="stylesheet" href="/site.css?v=${assetVersion}">`)
      .replace(/<link rel="stylesheet" href="\/preview\/care-site\/style.css">/, `<link rel="stylesheet" href="/care-site.css?v=${assetVersion}">`)
      .replace(/<script src="\/preview\/care-site\/site.js" defer><\/script>/, `<script src="/site.js?v=${assetVersion}" defer></script>`)
      .replace('</head>', `<meta name="description" content="${escapeHtml(description)}"><link rel="canonical" href="${escapeHtml(origin + canonical)}"></head>`)
      .replace('<div id="app"><p class="loading">Opening the public record…</p></div>', `<div id="app">${app.innerHTML}</div>`);
    return { path, html };
  });
}
