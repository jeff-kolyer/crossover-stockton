import { readFile, writeFile } from 'node:fs/promises';
import { syncPublication } from './publication-source.mjs';
import { renderPublicationFeed } from './publication-render.mjs';

const records=JSON.parse(await readFile('public/data/records.json','utf8')).records;
const data=await syncPublication();
const gap=Object.values(records).find(record=>record.schema==='gap'&&record.fields?.default);
if(!gap) throw new Error('No default gap for the publication');
const rendered=renderPublicationFeed(data,records,gap.id);
await writeFile('public/feed-content.html',rendered.html);
await writeFile('public/feed.txt',rendered.text);
console.log('Rendered the current gap publication as HTML and spoken text');
