import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = "src/data";
function files(dir) { return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? files(join(dir, entry.name)) : entry.name.endsWith(".json") ? [join(dir, entry.name)] : []); }
const rows = files(root).sort().map((file) => {
  const raw = readFileSync(file);
  const data = JSON.parse(raw.toString("utf8"));
  const items = Array.isArray(data) ? data : Array.isArray(data.active_investigations) ? data.active_investigations : null;
  const keys = [...new Set((items ?? [data]).flatMap((item) => Object.keys(item)))].sort();
  const values = JSON.stringify(data);
  return { file: relative(root, file).replaceAll("\\", "/"), bytes: raw.length, sha256: createHash("sha256").update(raw).digest("hex"), shape: Array.isArray(data) ? "array" : "object", count: items?.length ?? 1, keys, imageReferences: [...new Set(values.match(/\/images\/[^" ]+/g) ?? [])].length, urls: (values.match(/https?:\/\//g) ?? []).length };
});
if (process.argv.includes("--baseline")) writeFileSync("docs/INFORMATION_BASELINE.json", `${JSON.stringify({ date: "2026-11-02", files: rows }, null, 2)}\n`);
console.log(JSON.stringify(rows.map(({ file, bytes, count, shape, keys, imageReferences, urls }) => ({ file, bytes, count, shape, keys: keys.join(", "), imageReferences, urls })), null, 2));
