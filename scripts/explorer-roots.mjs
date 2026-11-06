import { readFile } from "node:fs/promises";

/** Explorer browse groups are presentation metadata, separate from source records. */
export async function loadExplorerRoots(policy) {
  const definitions = JSON.parse(await readFile(new URL("../src/model/explorer-roots.json", import.meta.url), "utf8"));
  if (!Array.isArray(definitions)) throw new Error("Explorer roots must be a list");
  const available = new Set(policy.collections.map(({ id }) => id));
  const claimed = new Set();
  const ranks = new Set();
  const rootIds = new Set();
  const roots = [];
  for (const root of definitions) {
    const id = root.id;
    if (!/^[a-z][a-z-]*$/.test(id) || typeof root.title !== "string" || !root.title.trim()
      || !Number.isSafeInteger(root.rank) || root.rank < 1
      || !Array.isArray(root.collectionIds) || !root.collectionIds.length) throw new Error(`Invalid Explorer root: ${id}`);
    if (ranks.has(root.rank)) throw new Error(`Duplicate Explorer root rank: ${root.rank}`);
    if (rootIds.has(id)) throw new Error(`Duplicate Explorer root ID: ${id}`);
    ranks.add(root.rank);
    rootIds.add(id);
    for (const collectionId of root.collectionIds) {
      if (!available.has(collectionId)) throw new Error(`${id}: unknown collection ${collectionId}`);
      if (claimed.has(collectionId)) throw new Error(`${id}: collection ${collectionId} belongs to multiple roots`);
      claimed.add(collectionId);
    }
    roots.push({ id, title: root.title, rank: root.rank, collectionIds: root.collectionIds });
  }
  return roots.sort((a, b) => a.rank - b.rank);
}
