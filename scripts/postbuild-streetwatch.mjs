import { copyFile, mkdir, readFile } from 'node:fs/promises';

await mkdir('dist/evidence-room', { recursive: true });
await copyFile('dist/index.html', 'dist/evidence-room/index.html');
await copyFile('dist/index.html', 'dist/404.html');
for (const route of ['crossover', 'post-scarcity', 'stewardship', 'work', 'about']) {
  await mkdir(`dist/${route}`, { recursive: true });
  await copyFile('dist/index.html', `dist/${route}/index.html`);
}
const cname = (await readFile('dist/CNAME', 'utf8')).trim();
if (cname !== 'crossoverstockton.org') throw new Error(`Unexpected CNAME: ${cname}`);
console.log(JSON.stringify({ published: 'dist', domain: cname, evidenceRoomRoute: true }));
