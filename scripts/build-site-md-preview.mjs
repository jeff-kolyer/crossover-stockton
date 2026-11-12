import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const template = await readFile(join(root, 'public/preview/site-md.html'), 'utf8');
const feed = JSON.parse(await readFile(join(root, 'public/site-config.json'), 'utf8'));
const pages = new Set(['home', 'overview', ...feed.silent.menu.map(item => item.page), 'about', 'record']);
const output = join(root, 'public/preview/site-md');

await mkdir(output, { recursive: true });
await writeFile(join(output, 'index.html'), template);
for (const page of pages) {
  const directory = join(output, page);
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, 'index.html'), template);
}

console.log(`Built clean preview URLs for ${pages.size} pages.`);
