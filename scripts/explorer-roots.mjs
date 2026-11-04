import { readFile, readdir } from "node:fs/promises";

/** Collection data opts into the Explorer hierarchy through its own metadata. */
export async function loadExplorerRoots(policy) {
  const directory = new URL("../src/data/", import.meta.url);
  const names = (await readdir(directory)).filter((name) => name.endsWith(".json"));
  const available = new Set(policy.collections.map(({ id }) => id));
  const claimed = new Set();
  const ranks = new Set();
  const rootIds = new Set();
  const roots = [];
  for (const name of names) {
    const data = JSON.parse(await readFile(new URL(name, directory), "utf8"));
    const root = data.explorer;
    if (!root?.topLevel) continue;
    const id = root.id;
    if (!/^[a-z][a-z-]*$/.test(id) || typeof root.title !== "string" || !root.title.trim()
      || !Number.isSafeInteger(root.rank) || root.rank < 1
      || !Array.isArray(root.collectionIds) || !root.collectionIds.length) throw new Error(`Invalid Explorer root: ${name}`);
    if (ranks.has(root.rank)) throw new Error(`Duplicate Explorer root rank: ${root.rank}`);
    if (rootIds.has(id)) throw new Error(`Duplicate Explorer root ID: ${id}`);
    ranks.add(root.rank);
    rootIds.add(id);
    for (const collectionId of root.collectionIds) {
      if (!available.has(collectionId)) throw new Error(`${name}: unknown collection ${collectionId}`);
      if (claimed.has(collectionId)) throw new Error(`${name}: collection ${collectionId} belongs to multiple roots`);
      claimed.add(collectionId);
    }
    roots.push({ id, title: root.title, rank: root.rank, collectionIds: root.collectionIds });
  }
  return roots.sort((a, b) => a.rank - b.rank);
}
