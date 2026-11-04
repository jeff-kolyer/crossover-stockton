import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, sep } from "node:path";
import { renderStaticPages } from "./render-static-pages.mjs";

const workspace = resolve(".");
const dist = resolve("dist");
if (!dist.startsWith(`${workspace}${sep}`)) throw new Error("dist must be inside the workspace");

const html = await readFile("public/preview/one-file-site.html", "utf8");
const feedBytes = await readFile("public/data/records.json");
const feed = JSON.parse(feedBytes.toString("utf8"));
const records = Object.values(feed.records);
const origin = "https://crossoverstockton.org";
const route = (id) => `/record/${encodeURIComponent(id)}/`;
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]);

const redirects = new Map([
  ["/reality/", "/needs/"],
  ["/connection/", "/responses/"],
  ["/action/", "/activity/"],
  ["/updates/", "/activity/"],
  ["/data/", "/explore/"],
  ["/work/", "/responses/"],
  ["/work/dogs/", "/investigation/"],
  ["/work/dogs/tasks/", "/investigation/"],
  ["/work/dogs/activity/", "/activity/"],
  ["/work/dogs/map/", "/places/"],
  ["/work/dogs/findings/", "/investigation/"],
]);
for (const record of records) {
  const fields = record.fields ?? {};
  if (record.schema === "article" && /^\/articles\/[a-z0-9-]+\/$/.test(fields.path ?? ""))
    redirects.set(fields.path, route(record.id));
  if (record.schema === "need" && /^[a-z0-9-]+$/.test(fields.slug ?? ""))
    redirects.set(`/reality/${fields.slug}/`, route(record.id));
  if (record.schema === "story" && /^[a-z0-9-]+$/.test(fields.slug ?? ""))
    redirects.set(`/stories/${fields.slug}/`, route(record.id));
  if (record.schema === "evidence" && fields.record_type === "field_report") {
    redirects.set(`/reports/${encodeURIComponent(record.id)}/`, route(record.id));
    redirects.set(`/work/dogs/reports/${encodeURIComponent(record.id)}/`, route(record.id));
  }
}

await rm(dist, { recursive: true, force: true });
await mkdir(resolve(dist, "data"), { recursive: true });
await writeFile(resolve(dist, "data/records.json"), feedBytes);
await writeFile(resolve(dist, "CNAME"), await readFile("public/CNAME"));
await writeFile(resolve(dist, "favicon.ico"), await readFile("public/favicon.ico"));
const navigationScript = await readFile("public/static-navigation.js");
const navigationVersion = createHash("sha256").update(navigationScript).digest("hex").slice(0, 12);
await writeFile(resolve(dist, "static-navigation.js"), navigationScript);
await writeFile(resolve(dist, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
const staticSite = renderStaticPages(html, feed, origin, navigationVersion);
for (const imagePath of staticSite.assets) {
  const source = resolve("public", `.${imagePath}`);
  const target = resolve(dist, `.${imagePath}`);
  if (!target.startsWith(`${dist}${sep}`)) throw new Error(`Unsafe image path: ${imagePath}`);
  await mkdir(resolve(target, ".."), { recursive: true });
  await copyFile(source, target);
}
for (const page of staticSite.pages) {
  const directory = page.path === "/" ? dist : resolve(dist, `.${page.path}`);
  if (directory !== dist && !directory.startsWith(`${dist}${sep}`)) throw new Error(`Unsafe page path: ${page.path}`);
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, "index.html"), page.html);
  if (page.path === "/") await writeFile("index.html", page.html);
}
await mkdir(resolve(dist, "interactive"), { recursive: true });
await writeFile(resolve(dist, "interactive/index.html"), html.replace("<head>", '<head><meta name="robots" content="noindex,follow">'));
await writeFile(resolve(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticSite.pages.filter((page) => page.sitemap).map((page) => `<url><loc>${origin}${page.path}</loc></url>`).join("")}</urlset>\n`);
await writeFile(resolve(dist, "llms.txt"), `# Crossover Stockton\n\nReadable pages: ${origin}/, ${origin}/needs/, ${origin}/investigation/, ${origin}/activity/, ${origin}/responses/, ${origin}/organizations/, ${origin}/places/, ${origin}/explore/, ${origin}/about/\nFull sitemap: ${origin}/sitemap.xml\nPublic data feed: ${origin}/data/records.json\nInteractive one-file version: ${origin}/interactive/\n`);

for (const [path, target] of redirects) {
  const directory = resolve(dist, `.${path}`);
  if (!directory.startsWith(`${dist}${sep}`)) throw new Error(`Unsafe redirect path: ${path}`);
  await mkdir(directory, { recursive: true });
  const safeTarget = escapeHtml(target);
  await writeFile(resolve(directory, "index.html"), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=${safeTarget}"><link rel="canonical" href="${origin}${safeTarget}"><title>Moved | Crossover Stockton</title><script>location.replace(${JSON.stringify(target)}+location.search)</script></head><body><p>This page moved to <a href="${safeTarget}">the new Crossover site</a>.</p></body></html>`);
}
await writeFile(resolve(dist, "404.html"), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=/explore/"><title>Find a record | Crossover Stockton</title><script>location.replace('/explore/'+location.search)</script></head><body><p>Find the page in <a href="/explore/">the public record</a>.</p></body></html>`);
console.log(`Published ${staticSite.pages.length} readable pages and the interactive one-file site, with ${records.length} feed records and ${redirects.size} legacy redirects.`);
