import generated from "../generated/explorer-public.json";

export type ExplorerRecord = {
  id: string;
  schema: string;
  typeName: string;
  title: string;
  description: string;
  dateForSort?: { field: string; value: string };
  fields: Record<string, unknown>;
};
export type ExplorerCollection = { id: string; title: string; group: string; schema: string | null; recordIds: string[]; hidden?: boolean; investigationId?: string; parentCollectionId?: string; childCollectionIds?: string[] };
export type ExplorerGroup = { id: string; title: string; collectionIds: string[]; investigationIds?: string[] };
export type ExplorerInvestigation = { id: string; title: string; collectionIds: string[] };
export type ExplorerFieldInfo = { label: string; kind: "reference" | "date" | "url" | "value"; description?: string };
export type ExplorerPath = { groupId: string; investigationId: string | null; collectionId: string | null; recordId: string };
export type ExplorerSnapshot = {
  groups: ExplorerGroup[];
  investigations: ExplorerInvestigation[];
  recordChildren: Record<string, string[]>;
  collections: ExplorerCollection[];
  records: Record<string, ExplorerRecord>;
  unsupportedTypes: string[];
  fieldLabels: Record<string, string>;
  fieldInfo: Record<string, ExplorerFieldInfo>;
  visualGuidance?: { preferredAssets: string; descriptions: string; evidence: string; logos: string };
};

export const explorerSnapshot = generated as unknown as ExplorerSnapshot;
export const explorerCollections = new Map(explorerSnapshot.collections.map((item) => [item.id, item]));
export const explorerGroups = new Map(explorerSnapshot.groups.map((item) => [item.id, item]));
export const explorerInvestigations = new Map(explorerSnapshot.investigations.map((item) => [item.id, item]));
export const explorerDirectCollection = (group: ExplorerGroup | undefined): ExplorerCollection | undefined => {
  if (!group || group.collectionIds.length !== 1 || group.investigationIds?.length) return undefined;
  const collection = explorerCollections.get(group.collectionIds[0]);
  return collection && !collection.childCollectionIds?.length ? collection : undefined;
};
export const explorerRecordsByDate = Object.values(explorerSnapshot.records)
  .sort((a, b) => (b.dateForSort ? Date.parse(b.dateForSort.value) : -Infinity) - (a.dateForSort ? Date.parse(a.dateForSort.value) : -Infinity) || a.id.localeCompare(b.id));
export const explorerFieldInfo = (name: string): ExplorerFieldInfo => explorerSnapshot.fieldInfo[name] ?? { label: name, kind: "value" };
export const explorerChildCollections = (recordId: string) => (explorerSnapshot.recordChildren[recordId] ?? [])
  .map((id) => explorerCollections.get(id)).filter((item): item is ExplorerCollection => Boolean(item));

export function explorerPathForRecord(recordId: string, preferredCollectionId?: string, preferredInvestigationId?: string): ExplorerPath | undefined {
  const record = explorerSnapshot.records[recordId];
  if (!record) return undefined;
  if (explorerInvestigations.has(recordId) && !preferredCollectionId) return { groupId: "investigation", investigationId: recordId, collectionId: null, recordId };
  const collections = explorerSnapshot.collections.filter((collection) => !collection.hidden && collection.recordIds.includes(recordId));
  const collection = collections.find((item) => item.id === preferredCollectionId)
    ?? collections.find((item) => item.investigationId === preferredInvestigationId)
    ?? collections.find((item) => item.schema === record.schema)
    ?? collections[0];
  if (collection) return { groupId: collection.group, investigationId: collection.investigationId ?? null, collectionId: collection.id, recordId };
  if (explorerInvestigations.has(recordId)) return { groupId: "investigation", investigationId: recordId, collectionId: null, recordId };
  return undefined;
}

export function searchExplorerRecords(query: string) {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return [];
  return Object.values(explorerSnapshot.records).filter((record) => {
    const linkedNames = Object.entries(record.fields).filter(([name]) => explorerFieldInfo(name).kind === "reference")
      .flatMap(([, value]) => Array.isArray(value) ? value : [value])
      .map((id) => typeof id === "string" ? explorerSnapshot.records[id]?.title : undefined).filter(Boolean);
    return [record.id, record.typeName, record.title, record.description, JSON.stringify(record.fields), ...linkedNames].join(" ").toLocaleLowerCase().includes(needle);
  });
}
