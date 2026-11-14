import fs from 'node:fs';
import path from 'node:path';

const repository = path.resolve(import.meta.dirname, '..');
const source = path.resolve(repository, 'site/streetwatch');
const output = path.resolve(repository, 'dist');
if (path.dirname(output) !== repository || path.basename(output) !== 'dist') {
  throw new Error('Refusing to replace a directory outside this repository');
}
if (!fs.existsSync(path.join(source, 'index.html'))) {
  throw new Error('StreetWatch build is missing its index.html');
}

fs.rmSync(output, {recursive:true,force:true});
fs.cpSync(source, output, {recursive:true});
fs.copyFileSync(path.join(repository, 'public/CNAME'), path.join(output, 'CNAME'));
fs.copyFileSync(path.join(source, 'index.html'), path.join(repository, 'index.html'));

const evidenceRoute = path.join(output, 'evidence-room');
fs.mkdirSync(evidenceRoute, {recursive:true});
fs.copyFileSync(path.join(source, 'index.html'), path.join(evidenceRoute, 'index.html'));

console.log(JSON.stringify({published:'dist',domain:fs.readFileSync(path.join(output,'CNAME'),'utf8').trim(),evidenceRoomRoute:true}));
