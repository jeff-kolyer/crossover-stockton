import { readFile, writeFile } from 'node:fs/promises';

const records = JSON.parse(await readFile('public/data/records.json', 'utf8')).records;
const data = JSON.parse(await readFile('public/publication.json', 'utf8'));
const gap = Object.values(records).find(record => record.schema === 'gap' && record.fields?.default);
const publication = data.gapPublications.find(item => item.gapId === gap?.id);
if (!publication) throw new Error('No publication for the default gap');
const escape = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const sections = [...publication.sections].sort((a, b) => a.order - b.order);
const items = section => publication.items.filter(item => item.section === section.id && item.status === 'published').sort((a, b) => a.order - b.order);
const tableSpeech = table => table ? [table.caption, ...table.rows.map(row => row.map((value, index) => `${table.columns[index]}: ${value}`).join('. '))] : [];
const tableHtml = table => table ? `<table><caption>${escape(table.caption)}</caption><thead><tr>${table.columns.map(value => `<th scope="col">${escape(value)}</th>`).join('')}</tr></thead><tbody>${table.rows.map(row => `<tr>${row.map(value => `<td>${escape(value)}</td>`).join('')}</tr>`).join('')}</tbody></table>` : '';
const spoken = sections.flatMap(section => [section.title, ...items(section).flatMap(item => [...(item.title === section.title ? [] : [item.title]), item.body, ...(item.paragraphs || []), ...tableSpeech(item.table)])]);
const html = sections.map(section => `<section id="${escape(section.id)}" class="chapter"><h2>${escape(section.title)}</h2>${items(section).map(item => `<article id="${escape(item.id)}"><h3>${escape(item.title)}</h3><p>${escape(item.body)}</p>${(item.paragraphs || []).map(text => `<p>${escape(text)}</p>`).join('')}${tableHtml(item.table)}${item.relatedRecordIds?.length ? `<p class="feed-sources">Related records: ${item.relatedRecordIds.map(id => `<a href="/${records[id].schema === 'organization' ? 'organization' : 'record'}/${encodeURIComponent(id)}/">${escape(records[id].title)}</a>`).join(' · ')}</p>` : ''}</article>`).join('')}</section>`).join('\n');
await writeFile('public/feed-content.html', `${html}\n`);
await writeFile('public/feed.txt', `${spoken.join('\n\n')}\n`);
console.log('Rendered the current gap publication as HTML and spoken text');
