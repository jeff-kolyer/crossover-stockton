import { readFile, writeFile, mkdir } from 'node:fs/promises';

const root = 'src/data';
const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const source = new Map();
const catalog = await readJson(`${root}/catalog-source.json`);
for (const name of ['evidence', 'activities', 'tasks']) {
  for (const record of catalog[name]) source.set(record.id, record);
}
const ledger = (await readJson(`${root}/record-id-ledger.json`)).entries;
const curated = new Map((await readJson(`${root}/curated-records.json`)).map((record) => [record.originalId, record]));
const presentation = new Map((await readJson(`${root}/record-presentation.json`)).map((record) => [record.originalId, record]));
const uiPresentation = new Map((await readJson(`${root}/ui-presentation.json`)).map((record) => [record.originalId, record]));
const ids = new Set();
const records = ledger.map(({ sourceId, displayId }) => {
  if (ids.has(sourceId)) throw new Error(`Duplicate source ID: ${sourceId}`);
  ids.add(sourceId);
  if (curated.has(sourceId)) return { ...curated.get(sourceId), id: displayId, originalId: sourceId };
  const item = source.get(sourceId);
  const detail = presentation.get(sourceId);
  if (!item || !detail) throw new Error(`Missing source or presentation for ${sourceId}`);
  const summary = item.summary ?? item.list_context;
  if (!summary) throw new Error(`Missing source summary for ${sourceId}`);
  const record = {
    id: displayId,
    title: item.title,
    kind: detail.kind,
    status: detail.status,
    publisher: detail.publisher,
    date: detail.date,
    checked: detail.checked,
    sourceUrl: item.source?.url ?? null,
    sourceLabel: item.title,
    summary,
    ...Object.fromEntries(Object.entries(detail).filter(([key]) => !['originalId', 'kind', 'status', 'publisher', 'date', 'checked'].includes(key))),
    originalId: sourceId,
  };
  for (const row of record.rows ?? []) {
    if (row.id === 'account') row.value = summary;
  }
  return record;
});
if (records.length !== 54 || curated.size !== 9 || presentation.size !== 45 || uiPresentation.size !== 54) {
  throw new Error('StreetWatch catalog membership changed; review the record ledger and presentation files.');
}
const output = `${JSON.stringify(records, null, 2)}\n`;
await mkdir('public/data', { recursive: true });
await writeFile('public/data/records.json', output);

const truncate = (value, length = 250) => value.length <= length ? value : `${value.slice(0, length - 1).replace(/\s+\S*$/, '')}…`;
const uiRecords = records.map((record) => {
  const detail = uiPresentation.get(record.originalId);
  if (!detail) throw new Error(`Missing UI presentation for ${record.originalId}`);
  const unchanged = detail.sourceSummary === record.summary;
  const result = {
    id: record.id,
    originalId: record.originalId,
    title: record.title,
    category: detail.category,
    categoryLabel: detail.categoryLabel,
    status: detail.status,
    statusLabel: detail.statusLabel,
    tier: detail.tier,
    dateAcquired: detail.dateAcquired,
    sourceAgency: detail.sourceAgency,
    sourceUrl: record.sourceUrl,
    sourceLabel: record.sourceLabel,
    spatialPrecision: detail.spatialPrecision,
    summary: unchanged ? detail.summary : truncate(record.summary),
    limitations: detail.limitations,
    severityBasis: detail.severityBasis,
    artifactType: detail.artifactType,
    checklistItems: detail.checklistItems,
    extractedClaims: detail.extractedClaims,
    custodyChain: detail.custodyChain,
    agencyResponses: detail.agencyResponses,
  };
  for (const item of result.checklistItems ?? []) {
    if (!unchanged && (item.item === 'Record account' || item.item === 'Activity account')) item.note = truncate(record.summary, 180);
  }
  return result;
});
await mkdir('src/generated', { recursive: true });
await writeFile('src/generated/records.js', `export const PRIMARY_RECORDS = ${JSON.stringify(uiRecords)};\n`);
console.log(`Built ${records.length} StreetWatch records from ${source.size} source records and ${curated.size} curated records.`);
