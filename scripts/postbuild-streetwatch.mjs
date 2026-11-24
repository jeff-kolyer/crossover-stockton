import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { pages } from '../src/pages.js';

const escAttr = value => String(value ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escXml = value => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const template = await readFile('dist/index.html', 'utf8');
await mkdir('dist/evidence-room', { recursive: true });
await copyFile('dist/index.html', 'dist/evidence-room/index.html');
await copyFile('dist/index.html', 'dist/404.html');

function prerenderPage(route, page) {
  const title = route === '/' ? 'Crossover · From thinking to being. From scarcity to stewardship.' : `${page.title} · Crossover`;
  const desc = page.description;
  const body = page.render();
  return template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escXml(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escAttr(desc)}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${escAttr(title)}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${escAttr(desc)}">`)
    .replace('<main id="content" tabindex="-1"></main>', `<main id="content" tabindex="-1">${body}</main>`);
}

for (const [route, page] of Object.entries(pages)) {
  const html = prerenderPage(route, page);
  if (route === '/') {
    await writeFile('dist/index.html', html, 'utf8');
  } else {
    const dir = `dist/${route.slice(1)}`;
    await mkdir(dir, { recursive: true });
    await writeFile(`${dir}/index.html`, html, 'utf8');
  }
}

const cname = (await readFile('dist/CNAME', 'utf8')).trim();
if (cname !== 'crossoverstockton.org') throw new Error(`Unexpected CNAME: ${cname}`);

const urls = [...Object.keys(pages), '/workspace.html'].map(route => `  <url><loc>https://${cname}${route}</loc></url>`).join('\n');
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, 'utf8');

const llms = [
  '# Crossover',
  '',
  '> From thinking to being. From scarcity to stewardship. Grounded in practical local work in Stockton, California.',
  '',
  '## Pages',
  ...Object.entries(pages).map(([route, page]) => `- [${page.title}](https://${cname}${route}): ${page.description}`),
  `- [Workspace (Pathways, Tasks & Evidence)](https://${cname}/workspace.html): Tracked pathways, open tasks, and evidence records in Stockton.`
].join('\n') + '\n';
await writeFile('dist/llms.txt', llms, 'utf8');

console.log(JSON.stringify({ published: 'dist', domain: cname, prerendered: Object.keys(pages).length, evidenceRoomRoute: true }));
