const escape=value=>String(value).replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const sameHeading=(item,section)=>item.title.trim().replace(/\s+/g,' ').toLowerCase()===section.title.trim().replace(/\s+/g,' ').toLowerCase();
const publicationDate=(value,timeZone)=>new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric',timeZone}).format(new Date(String(value).includes('T')?value:`${value}T12:00:00Z`));

function renderCollection(publication,records,{sectionId,openingTitle,timeZone='America/Los_Angeles'}={}){
  const sections=[...publication.sections].filter(section=>!sectionId||section.id===sectionId).sort((a,b)=>a.order-b.order);
  if(sectionId&&!sections.length)throw new Error(`Unknown publication section: ${sectionId}`);
  const items=section=>publication.items.filter(item=>item.section===section.id&&item.status==='published').sort((a,b)=>a.order-b.order);
  const tableSpeech=table=>table?[table.caption,...table.rows.map(row=>row.map((value,index)=>`${table.columns[index]}: ${value}`).join('. '))]:[];
  const tableHtml=table=>table?`<table><caption>${escape(table.caption)}</caption><thead><tr>${table.columns.map(value=>`<th scope="col">${escape(value)}</th>`).join('')}</tr></thead><tbody>${table.rows.map(row=>`<tr>${row.map(value=>`<td>${escape(value)}</td>`).join('')}</tr>`).join('')}</tbody></table>`:'';
  const latestUpdate=openingTitle?publication.items.filter(item=>item.status==='published').map(item=>item.updatedAt).sort().at(-1):null;
  const spoken=sections.flatMap(section=>[
    section.title,
    ...(openingTitle&&section===sections[0]&&latestUpdate?[`Updated ${publicationDate(latestUpdate,timeZone)}`]:[]),
    ...items(section).flatMap(item=>[...(sameHeading(item,section)?[]:[item.title]),item.body,...(item.paragraphs||[]),...tableSpeech(item.table)])
  ]);
  const html=sections.map(section=>`<section id="${escape(section.id)}" class="chapter"><h2>${escape(section.title)}</h2>${items(section).map(item=>`<article id="${escape(item.id)}">${sameHeading(item,section)?'':`<h3>${escape(item.title)}</h3>`}<p>${escape(item.body)}</p>${(item.paragraphs||[]).map(text=>`<p>${escape(text)}</p>`).join('')}${tableHtml(item.table)}${item.relatedRecordIds?.length?`<p class="feed-sources">Related records: ${item.relatedRecordIds.map(id=>`<a href="/${records[id].schema==='organization'?'organization':'record'}/${encodeURIComponent(id)}/">${escape(records[id].title)}</a>`).join(' · ')}</p>`:''}</article>`).join('')}</section>`).join('\n');
  return {html:`${html}\n`,text:`${[...(openingTitle?[openingTitle]:[]),...spoken].join('\n\n')}\n`};
}

export function renderPublicationFeed(data,records,gapId,sectionId){
  const publication=data.gapPublications.find(item=>item.gapId===gapId);
  if(!publication) throw new Error(`No publication for gap ${gapId}`);
  return renderCollection(publication,records,{sectionId,openingTitle:sectionId?undefined:records[gapId]?.title});
}

export function renderSitePublicationFeed(data,records,siteId){
  const publication=data.sitePublications?.find(item=>item.id===siteId);
  if(!publication) throw new Error(`No site publication: ${siteId}`);
  const rendered=renderCollection(publication,records,{openingTitle:publication.title,timeZone:'UTC'});
  const identity=Object.values(records).find(record=>record.schema==='identity');
  const founder=records[identity?.fields?.founderPersonId];
  if(!founder)return rendered;
  const role=founder.fields?.roles?.find(item=>item.title==='Founder')||founder.fields?.roles?.[0];
  const organization=records[role?.organizationId]?.title||'Crossover Stockton';
  const description=publication.founderSummary||founder.fields?.biography?.[0]||'';
  const founderText=[founder.fields?.name||founder.title,`${role?.title||'Founder'}, ${organization}`,description].join('\n\n');
  return {...rendered,text:`${rendered.text.trimEnd()}\n\n${founderText}\n`};
}
