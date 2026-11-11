import { readFile, writeFile } from 'node:fs/promises';

export async function syncPublication(){
  const source=await readFile('src/publication.json','utf8');
  const target='public/publication.json';
  if(await readFile(target,'utf8').catch(()=>null)!==source) await writeFile(target,source);
  return JSON.parse(source);
}

if(process.argv[1]?.replaceAll('\\','/').endsWith('/publication-source.mjs')) await syncPublication();
