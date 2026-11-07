import { runInNewContext } from 'node:vm';

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

export function renderSiteMdPages(template, source, feed, story, origin) {
  const app = { innerHTML: '' };
  const location = { pathname: '/', search: '' };
  const document = {
    title: '',
    getElementById(id) { return id === 'app' ? app : null; },
    querySelector() { return { addEventListener() {} }; },
  };
  const context = {
    document, location, window: { scrollTo() {} }, URLSearchParams,
    sourceFeed: feed, sourceStory: story,
  };
  const renderer = source.replace(/\bstart\(\);\s*$/, '');
  if (renderer === source) throw new Error('Could not isolate the SITE.md renderer');
  runInNewContext(renderer, context, { timeout: 3000 });
  runInNewContext(`feed=sourceStory;records=Object.values(sourceFeed.records);byId=new Map(records.map(item=>[item.id,item]));gap=records.find(item=>item.schema==='gap'&&item.fields?.default)||records.find(item=>item.schema==='gap');gapStory=feed.chapters.find(item=>item.id==='gap');about=feed.chapters.find(item=>item.id==='about');menu=feed.silent.menu;`, context, { timeout: 3000 });

  const gapSlug = Object.values(feed.records).find(item => item.schema === 'gap' && item.fields?.default)?.fields?.slug;
  if (!gapSlug) throw new Error('No default gap slug in the public records');
  const paths = new Set(['/', '/about/', `/${gapSlug}/overview/`, ...story.silent.menu.filter(item => item.page !== 'overview').map(item => `/${gapSlug}/${item.page}/`)]);
  for (const record of Object.values(feed.records)) {
    paths.add(`/${record.schema === 'organization' ? 'organization' : 'record'}/${encodeURIComponent(record.id)}/`);
  }

  return [...paths].map(path => {
    location.pathname = path;
    location.search = '';
    runInNewContext('render()', context, { timeout: 3000 });
    if (!app.innerHTML.includes('class="shell')) throw new Error(`SITE.md page did not render: ${path}`);
    const title = document.title.replace(/ preview$/, '');
    const description = path === '/' ? story.chapters.find(item => item.id === 'introduction')?.text
      : path === '/about/' ? story.chapters.find(item => item.id === 'about')?.sections[0]?.text
      : 'Crossover Stockton public feed and connected records.';
    const canonical = path;
    const html = template
      .replace(/<meta name="robots" content="noindex">\s*/, path === canonical ? '' : '<meta name="robots" content="noindex,follow">\n')
      .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`)
      .replace(/<link rel="stylesheet" href="\/preview\/site-md.css">/, '<link rel="stylesheet" href="/site.css">')
      .replace(/<script src="\/preview\/site-md.js" defer><\/script>/, '<script src="/site.js" defer></script>')
      .replace('</head>', `<meta name="description" content="${escapeHtml(description)}"><link rel="canonical" href="${escapeHtml(origin + canonical)}"></head>`)
      .replace('<div id="app"><p class="loading">Opening the public feed…</p></div>', `<div id="app">${app.innerHTML}</div>`);
    return { path, html };
  });
}
