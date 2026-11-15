import { copyFile, mkdir, readFile } from 'node:fs/promises';

await mkdir('dist/evidence-room', { recursive: true });
await copyFile('dist/index.html', 'dist/evidence-room/index.html');
const cname = (await readFile('dist/CNAME', 'utf8')).trim();
if (cname !== 'crossoverstockton.org') throw new Error(`Unexpected CNAME: ${cname}`);
console.log(JSON.stringify({ published: 'dist', domain: cname, evidenceRoomRoute: true }));
