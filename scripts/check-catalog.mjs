import { readFile } from 'node:fs/promises';
import { validateRecord } from './schema-validator.mjs';

const read = async (name) => JSON.parse(await readFile(`src/data/${name}.json`, 'utf8'));
const catalog = await read('catalog-source');
const curated = await read('curated-records');
const ledger = (await read('record-id-ledger')).entries;
const presentation = await read('record-presentation');
const ui = await read('ui-presentation');
const articles = await read('articles');
const siteContent = await read('site-content');
const errors = [];
const groups = [['evidence', 33, 'evidence'], ['activities', 5, 'activity'], ['tasks', 7, 'task']];
const source = new Map();
for (const [name, expected, schema] of groups) {
  const items = catalog[name];
  if (!Array.isArray(items) || items.length !== expected) {
    errors.push(`${name}: expected ${expected} records`);
    continue;
  }
  for (const item of items) {
    if (source.has(item.id)) errors.push(`duplicate source ID: ${item.id}`);
    source.set(item.id, item);
    errors.push(...validateRecord(item, schema, `${name}:${item.id}`));
    if (!item.gap_ids?.includes('dogs-safe-placement')) errors.push(`${item.id}: missing current gap`);
    if (item.source?.url && !/^https?:\/\//.test(item.source.url)) errors.push(`${item.id}: invalid source URL`);
  }
}
const activityIds = new Set(catalog.activities?.map((item) => item.id));
for (const task of catalog.tasks ?? []) {
  for (const id of task.basis_record_ids ?? []) if (!source.has(id)) errors.push(`${task.id}: missing basis ${id}`);
  for (const id of task.activity_record_ids ?? []) if (!activityIds.has(id)) errors.push(`${task.id}: missing activity ${id}`);
}
const ids = (items) => new Set(items.map((item) => item.originalId));
if (curated.length !== 9 || presentation.length !== 45 || ui.length !== 54 || ledger.length !== 54) errors.push('catalog collection size mismatch');
const curatedIds = ids(curated);
const presentationIds = ids(presentation);
const uiIds = ids(ui);
const displayIds = new Set();
const sourceIds = new Set();
for (const { sourceId, displayId } of ledger) {
  if (sourceIds.has(sourceId) || displayIds.has(displayId)) errors.push(`duplicate ledger ID: ${sourceId} / ${displayId}`);
  sourceIds.add(sourceId);
  displayIds.add(displayId);
  if (!uiIds.has(sourceId)) errors.push(`missing UI presentation: ${sourceId}`);
  if (source.has(sourceId) && !presentationIds.has(sourceId)) errors.push(`missing record presentation: ${sourceId}`);
  if (!source.has(sourceId) && !curatedIds.has(sourceId)) errors.push(`missing catalog source: ${sourceId}`);
}
for (const id of source.keys()) if (!sourceIds.has(id)) errors.push(`unused source record: ${id}`);
for (const id of curatedIds) if (!sourceIds.has(id)) errors.push(`unused curated record: ${id}`);
for (const id of presentationIds) if (!source.has(id)) errors.push(`orphan record presentation: ${id}`);
const articleIds = new Set();
for (const article of articles) {
  if (!article.id || articleIds.has(article.id)) errors.push(`missing or duplicate article ID: ${article.id}`);
  articleIds.add(article.id);
  if (article.type === 'about') {
    if (!article.title || !article.intro || !article.image || !article.sections?.length || !article.groundingCards?.length) errors.push(`${article.id}: incomplete About article`);
    continue;
  }
  if (!article.title || !article.dek || !article.date || !article.sections?.length || !article.sourceIds?.length) errors.push(`${article.id}: incomplete article`);
  for (const section of article.sections ?? []) if (!section.paragraphs?.length && !section.bullets?.length) errors.push(`${article.id}: incomplete section`);
  for (const id of article.sourceIds ?? []) if (!displayIds.has(id)) errors.push(`${article.id}: unknown source record ${id}`);
}
for (const item of [...siteContent.priorities, ...siteContent.ai.ideas]) {
  if (!articleIds.has(item.articleId)) errors.push(`site content references unknown article ${item.articleId}`);
}
for (const id of siteContent.doing.order) if (!displayIds.has(id)) errors.push(`doing page references unknown record ${id}`);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Catalog check passed: ${source.size} source records, ${curated.length} curated records, ${ledger.length} stable display IDs.`);
}
