import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';

const itemsOf=data=>new Map([...(data.gapPublications||[]),...(data.sitePublications||[])].flatMap(collection=>collection.items||[]).map(item=>[item.id,item]));
const editorialFields=item=>Object.fromEntries(Object.entries(item).filter(([key])=>key!=='createdAt'&&key!=='updatedAt'));

export function checkPublicationHistory(current,previous){
  const currentItems=itemsOf(current);
  for(const [id,oldItem] of itemsOf(previous)){
    const item=currentItems.get(id);
    if(!item) continue;
    if(item.createdAt!==oldItem.createdAt) throw new Error(`createdAt changed for ${id}`);
    if(JSON.stringify(editorialFields(item))!==JSON.stringify(editorialFields(oldItem)) && Date.parse(item.updatedAt)<=Date.parse(oldItem.updatedAt)){
      throw new Error(`Editorial item ${id} changed without a later updatedAt; use a UTC timestamp for a second edit on the same day`);
    }
  }
}

function gitVersion(revision){
  try{return JSON.parse(execFileSync('git',['show',`${revision}:src/publication.json`],{encoding:'utf8',stdio:['ignore','pipe','ignore']}))}
  catch{return null}
}

if(process.argv[1]?.replaceAll('\\','/').endsWith('/check-publication-history.mjs')){
  const current=JSON.parse(await readFile('src/publication.json','utf8'));
  const head=gitVersion('HEAD');
  const baseline=head&&JSON.stringify(head)!==JSON.stringify(current)?head:gitVersion('HEAD^');
  if(baseline) checkPublicationHistory(current,baseline);
}
