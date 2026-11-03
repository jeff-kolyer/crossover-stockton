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
export type ExplorerSnapshot = {
  groups: ExplorerGroup[];
  collections: ExplorerCollection[];
  records: Record<string, ExplorerRecord>;
  unsupportedTypes: string[];
  fieldLabels: Record<string, string>;
};

export const explorerSnapshot = generated as unknown as ExplorerSnapshot;
export const explorerCollections = new Map(explorerSnapshot.collections.map((item) => [item.id, item]));
const isReference = (name: string) => name !== "id" && /(?:_ids?|Ids?|Id)$/.test(name);

export function searchExplorerRecords(query: string) {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return [];
  return Object.values(explorerSnapshot.records).filter((record) => {
    const linkedNames = Object.entries(record.fields).filter(([name]) => isReference(name))
      .flatMap(([, value]) => Array.isArray(value) ? value : [value])
      .map((id) => typeof id === "string" ? explorerSnapshot.records[id]?.title : undefined).filter(Boolean);
    return [record.id, record.typeName, record.title, record.description, JSON.stringify(record.fields), ...linkedNames].join(" ").toLocaleLowerCase().includes(needle);
  });
}
