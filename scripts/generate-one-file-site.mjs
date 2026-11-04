import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, sep } from "node:path";

const feed = JSON.parse(await readFile("public/data/records.json", "utf8"));
const template = await readFile("site/one-file-template.html", "utf8");
const imagePaths = new Set(["/images/logo_light.webp", "/images/logo_dark.webp", "/images/home/home-hero-wide.jpg", "/images/about/about-the-founder.jpg", "/images/about/about-crossover-hero.jpg", "/images/about/guy-dog.jpg", "/images/about/notebook.jpg", "/images/about/techno.jpg", "/images/about/hands.jpg"]);
const collect = (value) => {
  if (typeof value === "string" && value.startsWith("/images/")) imagePaths.add(value);
  else if (Array.isArray(value)) value.forEach(collect);
  else if (value && typeof value === "object") Object.values(value).forEach(collect);
};
for (const record of Object.values(feed.records)) collect(record.fields);

const assets = {};
const publicRoot = resolve("public");
for (const path of [...imagePaths].sort()) {
  const diskPath = resolve(publicRoot, `.${path}`);
  if (!diskPath.startsWith(`${publicRoot}${sep}`)) throw new Error(`Unsafe image path: ${path}`);
  const extension = path.split(".").at(-1)?.toLowerCase();
  const mime = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", svg: "image/svg+xml" }[extension];
  if (!mime) throw new Error(`Unsupported image type: ${path}`);
  assets[path] = `data:${mime};base64,${(await readFile(diskPath)).toString("base64")}`;
}

const jsonForHtml = (value) => JSON.stringify(value).replaceAll("<", "\\u003c").replaceAll("\u2028", "\\u2028").replaceAll("\u2029", "\\u2029");
const output = template
  .replace("__EMBEDDED_FEED__", jsonForHtml(feed))
  .replace("__EMBEDDED_ASSETS__", jsonForHtml(assets))
  .replaceAll('href="#/', 'href="?page=');
if (output.includes("__EMBEDDED_FEED__") || output.includes("__EMBEDDED_ASSETS__")) throw new Error("Template replacement failed");
await mkdir("public/preview", { recursive: true });
await writeFile("public/preview/one-file-site.html", output);
console.log(`Generated public/preview/one-file-site.html from ${Object.keys(feed.records).length} feed records and ${Object.keys(assets).length} embedded images (${(Buffer.byteLength(output) / 1024 / 1024).toFixed(2)} MB).`);
