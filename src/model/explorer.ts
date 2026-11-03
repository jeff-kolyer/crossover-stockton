import generated from "../generated/explorer-public.json";

export type ExplorerRecord = {
  id: string;
  schema: string;
  typeName: string;
  title: string;
  description: string;
  fields: Record<string, unknown>;
};
export type ExplorerCollection = { id: string; title: string; group: string; schema: string; recordIds: string[] };
export type ExplorerGroup = { id: string; title: string; collectionIds: string[] };
export type ExplorerFieldInfo = { label: string; kind: "reference" | "date" | "url" | "value"; description?: string };
export type ExplorerPath = { groupId: string; collectionId: string; recordId: string };
export type ExplorerSnapshot = {
  groups: ExplorerGroup[];
  collections: ExplorerCollection[];
  records: Record<string, ExplorerRecord>;
  unsupportedTypes: string[];
  fieldLabels: Record<string, string>;
  fieldInfo: Record<string, ExplorerFieldInfo>;
};

export const explorerSnapshot = generated as unknown as ExplorerSnapshot;
export const explorerCollections = new Map(explorerSnapshot.collections.map((item) => [item.id, item]));
export const explorerGroups = new Map(explorerSnapshot.groups.map((item) => [item.id, item]));
export const explorerFieldInfo = (name: string): ExplorerFieldInfo => explorerSnapshot.fieldInfo[name] ?? { label: name, kind: "value" };

export function explorerPathForRecord(recordId: string, preferredCollectionId?: string): ExplorerPath | undefined {
  const record = explorerSnapshot.records[recordId];
  if (!record) return undefined;
  const collections = explorerSnapshot.collections.filter((collection) => collection.recordIds.includes(recordId));
  const collection = collections.find((item) => item.id === preferredCollectionId)
    ?? collections.find((item) => item.schema === record.schema)
    ?? collections[0];
  return collection ? { groupId: collection.group, collectionId: collection.id, recordId } : undefined;
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
