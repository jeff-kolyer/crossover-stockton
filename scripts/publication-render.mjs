const escape=value=>String(value).replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const sameHeading=(item,section)=>item.title.trim().replace(/\s+/g,' ').toLowerCase()===section.title.trim().replace(/\s+/g,' ').toLowerCase();

export function renderPublicationFeed(data,records,gapId){
  const publication=data.gapPublications.find(item=>item.gapId===gapId);
  if(!publication) throw new Error(`No publication for gap ${gapId}`);
  const sections=[...publication.sections].sort((a,b)=>a.order-b.order);
  const items=section=>publication.items.filter(item=>item.section===section.id&&item.status==='published').sort((a,b)=>a.order-b.order);
  const tableSpeech=table=>table?[table.caption,...table.rows.map(row=>row.map((value,index)=>`${table.columns[index]}: ${value}`).join('. '))]:[];
  const tableHtml=table=>table?`<table><caption>${escape(table.caption)}</caption><thead><tr>${table.columns.map(value=>`<th scope="col">${escape(value)}</th>`).join('')}</tr></thead><tbody>${table.rows.map(row=>`<tr>${row.map(value=>`<td>${escape(value)}</td>`).join('')}</tr>`).join('')}</tbody></table>`:'';
  const spoken=sections.flatMap(section=>[section.title,...items(section).flatMap(item=>[...(sameHeading(item,section)?[]:[item.title]),item.body,...(item.paragraphs||[]),...tableSpeech(item.table)])]);
  const html=sections.map(section=>`<section id="${escape(section.id)}" class="chapter"><h2>${escape(section.title)}</h2>${items(section).map(item=>`<article id="${escape(item.id)}">${sameHeading(item,section)?'':`<h3>${escape(item.title)}</h3>`}<p>${escape(item.body)}</p>${(item.paragraphs||[]).map(text=>`<p>${escape(text)}</p>`).join('')}${tableHtml(item.table)}${item.relatedRecordIds?.length?`<p class="feed-sources">Related records: ${item.relatedRecordIds.map(id=>`<a href="/${records[id].schema==='organization'?'organization':'record'}/${encodeURIComponent(id)}/">${escape(records[id].title)}</a>`).join(' · ')}</p>`:''}</article>`).join('')}</section>`).join('\n');
  return {html:`${html}\n`,text:`${spoken.join('\n\n')}\n`};
}
