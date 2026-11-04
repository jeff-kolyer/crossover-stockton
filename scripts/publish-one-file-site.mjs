import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve, sep } from "node:path";

const workspace = resolve(".");
const dist = resolve("dist");
if (!dist.startsWith(`${workspace}${sep}`)) throw new Error("dist must be inside the workspace");

const html = await readFile("public/preview/one-file-site.html");
const feedBytes = await readFile("public/data/records.json");
const feed = JSON.parse(feedBytes.toString("utf8"));
const records = Object.values(feed.records);
const origin = "https://crossoverstockton.org";
const route = (id) => `/#/record/${encodeURIComponent(id)}`;
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]);

const redirects = new Map([
  ["/reality/", "/#/needs"],
  ["/connection/", "/#/work"],
  ["/action/", "/#/activity"],
  ["/updates/", "/#/activity"],
  ["/about/", "/#/about"],
  ["/data/", "/#/explore"],
  ["/work/", "/#/work"],
  ["/work/dogs/", "/#/investigation"],
  ["/work/dogs/tasks/", "/#/investigation"],
  ["/work/dogs/activity/", "/#/activity"],
  ["/work/dogs/map/", "/#/places"],
  ["/work/dogs/findings/", "/#/investigation"],
  ["/organizations/", "/#/about"],
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
await writeFile("index.html", html);
await writeFile(resolve(dist, "index.html"), html);
await writeFile(resolve(dist, "data/records.json"), feedBytes);
await writeFile(resolve(dist, "CNAME"), await readFile("public/CNAME"));
await writeFile(resolve(dist, "favicon.ico"), await readFile("public/favicon.ico"));
await writeFile(resolve(dist, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
await writeFile(resolve(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}/</loc></url></urlset>\n`);
await writeFile(resolve(dist, "llms.txt"), `# Crossover Stockton\n\nOne-file public site: ${origin}/\nPublic data feed: ${origin}/data/records.json\n`);

for (const [path, target] of redirects) {
  const directory = resolve(dist, `.${path}`);
  if (!directory.startsWith(`${dist}${sep}`)) throw new Error(`Unsafe redirect path: ${path}`);
  await mkdir(directory, { recursive: true });
  const safeTarget = escapeHtml(target);
  await writeFile(resolve(directory, "index.html"), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=${safeTarget}"><link rel="canonical" href="${origin}/"><title>Moved | Crossover Stockton</title><script>location.replace('/'+location.search+${JSON.stringify(target.slice(1))})</script></head><body><p>This page moved to <a href="${safeTarget}">the new Crossover site</a>.</p></body></html>`);
}
await writeFile(resolve(dist, "404.html"), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=/#/explore"><title>Find a record | Crossover Stockton</title><script>location.replace('/'+location.search+'#/explore')</script></head><body><p>Find the page in <a href="/#/explore">the public record</a>.</p></body></html>`);
console.log(`Published one-file site to dist with ${records.length} records and ${redirects.size} legacy URL redirects.`);
