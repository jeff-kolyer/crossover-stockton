import { readFile, writeFile } from 'node:fs/promises';
import { syncPublication } from './publication-source.mjs';
import { renderPublicationFeed, renderSitePublicationFeed } from './publication-render.mjs';

const records=JSON.parse(await readFile('public/data/records.json','utf8')).records;
const data=await syncPublication();
const gap=Object.values(records).find(record=>record.schema==='gap'&&record.fields?.default);
if(!gap) throw new Error('No default gap for the publication');
const rendered=renderPublicationFeed(data,records,gap.id);
await writeFile('public/feed-content.html',rendered.html);
await writeFile('public/feed.txt',rendered.text);
for(const section of data.gapPublications.find(item=>item.gapId===gap.id).sections.filter(item=>item.id!=='overview')){
  const spoken=renderPublicationFeed(data,records,gap.id,section.id);
  await writeFile(`public/feed-${section.id}.txt`,spoken.text);
}
await writeFile('public/feed-about.txt',renderSitePublicationFeed(data,records,'about').text);
console.log('Rendered the current gap publication as HTML and spoken text');
