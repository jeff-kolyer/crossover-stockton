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
  ["/reality/", "/projects/"],
  ["/connection/", "/projects/"],
  ["/updates/", "/activity/"],
  ["/data/", "/explore/"],
  ["/work/", "/activity/"],
  ["/responses/", "/projects/street-dogs/initiatives/"],
  ["/stories/", "/projects/"],
  ["/stories/streetdogs-fed-about-70-animals/", "/record/ssd-2026-06-08-street-response/"],
  ["/stories/34-cats-moved-out-of-overcrowding/", "/record/sas-2026-03-05-cat-transfer/"],
  ["/record/streetdogs-fed-70-animals/", "/record/ssd-2026-06-08-street-response/"],
  ["/record/cats-transferred-out-of-overcrowding/", "/record/sas-2026-03-05-cat-transfer/"],
  ["/articles/", "/projects/"],
  ["/needs/", "/projects/"],
  ["/articles/friction-of-volunteering/", "/projects/street-dogs/findings/"],
  ["/articles/public-access-to-stray-dog-information/", "/projects/street-dogs/findings/"],
  ["/articles/caring-for-stocktons-dogs/", "/projects/street-dogs/initiatives/"],
  ["/articles/where-are-stray-dogs/", "/projects/street-dogs/overview/"],
  ["/record/friction-of-volunteering/", "/projects/street-dogs/findings/"],
  ["/record/public-access-to-stray-dog-information/", "/projects/street-dogs/findings/"],
  ["/record/caring-for-stocktons-dogs/", "/projects/street-dogs/initiatives/"],
  ["/record/where-are-stray-dogs/", "/projects/street-dogs/overview/"],
  ["/needs/dogs-safe-placement/picture/", "/projects/street-dogs/overview/"],
  ["/needs/dogs-safe-placement/actions/", "/projects/street-dogs/activity/"],
  ["/needs/dogs-safe-placement/stories/", "/projects/street-dogs/overview/"],
  ["/needs/dogs-safe-placement/articles/", "/projects/street-dogs/overview/"],
  ["/work/dogs/", "/"],
  ["/work/dogs/tasks/", "/activity/"],
  ["/work/dogs/activity/", "/activity/"],
  ["/work/dogs/map/", "/places/"],
  ["/work/dogs/findings/", "/explore/"],
  ["/action/", "/activity/"],
  ["/investigation/", "/"],
  ["/investigation/plan/", "/"],
  ["/investigation/objectives/", "/projects/street-dogs/overview/"],
  ["/investigation/questions/", "/projects/street-dogs/overview/"],
  ["/investigation/activity/", "/activity/"],
  ["/investigation/findings/", "/explore/"],
  ["/investigation/evidence/", "/explore/"],
  ["/investigation/people-places/", "/places/"],
  ["/investigation/records/", "/explore/"],
  ["/record/investigation/", "/record/action/"],
]);
for (const record of records) {
  const fields = record.fields ?? {};
  if (record.schema === "article" && /^\/articles\/[a-z0-9-]+\/$/.test(fields.path ?? ""))
    redirects.set(fields.path, route(record.id));
  if (record.schema === "gap" && /^[a-z0-9-]+$/.test(fields.slug ?? ""))
    redirects.set(`/reality/${fields.slug}/`, route(record.id));
  if (record.schema === "evidence" && fields.record_type === "field_report") {
    redirects.set(`/reports/${encodeURIComponent(record.id)}/`, route(record.id));
    redirects.set(`/work/dogs/reports/${encodeURIComponent(record.id)}/`, route(record.id));
  }
}
for (const gap of records.filter((record) => record.schema === "gap")) {
  const base = `/gaps/${encodeURIComponent(gap.fields.slug)}/`;
  redirects.set(base, `${base}overview/`);
  redirects.set(`/record/${encodeURIComponent(gap.id)}/`, `${base}overview/`);
  for (const view of ["overview", "activity", "findings", "metrics", "places", "organizations", "initiatives", "sources"]) {
    redirects.set(`/needs/${encodeURIComponent(gap.id)}/${view}/`, `${base}${view}/`);
    redirects.set(`/projects/${encodeURIComponent(gap.fields.slug)}/${view}/`, `${base}${view}/`);
  }
  redirects.set(`/projects/${encodeURIComponent(gap.fields.slug)}/`, `${base}overview/`);
  redirects.set(`${base}reports/`, `${base}activity/#field-reports`);
  redirects.set(`/projects/${encodeURIComponent(gap.fields.slug)}/reports/`, `${base}activity/#field-reports`);
  redirects.set(`/needs/${encodeURIComponent(gap.id)}/reports/`, `${base}activity/#field-reports`);
  for (const [oldView, nextView] of [["numbers", "metrics"], ["questions", "overview"], ["objectives", "overview"]]) {
    redirects.set(`${base}${oldView}/`, `${base}${nextView}/`);
    redirects.set(`/projects/${encodeURIComponent(gap.fields.slug)}/${oldView}/`, `${base}${nextView}/`);
    redirects.set(`/needs/${encodeURIComponent(gap.id)}/${oldView}/`, `${base}${nextView}/`);
  }
  redirects.set(`${base}projects/`, `${base}initiatives/`);
  redirects.set(`/projects/${encodeURIComponent(gap.fields.slug)}/projects/`, `${base}initiatives/`);
  redirects.set(`/needs/${encodeURIComponent(gap.id)}/projects/`, `${base}initiatives/`);
}
for (const id of ["where-dogs-need-help", "food-and-water", "response-barriers", "additional-help", "improvement-outcomes"])
  redirects.set(`/record/${id}/`, "/gaps/street-dogs/overview/");
redirects.set("/projects/", "/gaps/");
for (const [old, target] of [...redirects]) redirects.set(old, target.replaceAll("/projects/street-dogs/", "/gaps/street-dogs/").replace(/^\/projects\/$/, "/gaps/"));

await rm(dist, { recursive: true, force: true });
await mkdir(resolve(dist, "data"), { recursive: true });
await mkdir(resolve(dist, "preview"), { recursive: true });
await mkdir(resolve(dist, "fonts"), { recursive: true });
for (const name of ["Regular", "Medium", "SemiBold", "Bold"])
  await copyFile(`public/fonts/IBMPlexSans-${name}.woff2`, resolve(dist, `fonts/IBMPlexSans-${name}.woff2`));
await copyFile("public/fonts/ibm-plex.css", resolve(dist, "fonts/ibm-plex.css"));
await copyFile("public/fonts/LICENSE.txt", resolve(dist, "fonts/LICENSE.txt"));
for (const file of ["ai-variant.html", "ai-variant.css", "ai-variant-v2.css", "ai-variant-google.css", "ai-variant-modern.css", "ai-variant.js"])
  await copyFile(resolve("public/preview", file), resolve(dist, "preview", file));
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
await mkdir(resolve(dist, "images/variants/clean"), { recursive: true });
await copyFile("public/images/variants/clean/dog-park.jpg", resolve(dist, "images/variants/clean/dog-park.jpg"));
for (const page of staticSite.pages) {
  const directory = page.path === "/" ? dist : resolve(dist, `.${page.path}`);
  if (directory !== dist && !directory.startsWith(`${dist}${sep}`)) throw new Error(`Unsafe page path: ${page.path}`);
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, "index.html"), page.html);
}
const workspaceHtml = (await readFile("public/preview/ai-variant.html", "utf8"))
  .replace(/^[ \t]*<meta name="robots" content="noindex,nofollow">\r?\n/m, '')
  .replace('  <title>Crossover · Gap workspace experiment</title>',
    `  <meta name="description" content="Crossover Stockton starts with real needs in Stockton, takes action, and shares what it learns.">\n  <link rel="canonical" href="${origin}/">\n  <title>Crossover Stockton · Home</title>`);
await writeFile(resolve(dist, "index.html"), workspaceHtml);
await writeFile("index.html", workspaceHtml);
await mkdir(resolve(dist, "interactive"), { recursive: true });
await writeFile(resolve(dist, "interactive/index.html"), html.replace("<head>", '<head><meta name="robots" content="noindex,follow">'));
await writeFile(resolve(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticSite.pages.filter((page) => page.sitemap).map((page) => `<url><loc>${origin}${page.path}</loc></url>`).join("")}</urlset>\n`);
await writeFile(resolve(dist, "llms.txt"), `# Crossover Stockton\n\nReadable pages: ${origin}/, ${origin}/projects/, ${origin}/activity/, ${origin}/places/, ${origin}/explore/, ${origin}/organizations/, ${origin}/about/\nFull sitemap: ${origin}/sitemap.xml\nPublic data feed: ${origin}/data/records.json\nInteractive one-file version: ${origin}/interactive/\n`);

for (const [path, target] of redirects) {
  const directory = resolve(dist, `.${path}`);
  if (!directory.startsWith(`${dist}${sep}`)) throw new Error(`Unsafe redirect path: ${path}`);
  await mkdir(directory, { recursive: true });
  const safeTarget = escapeHtml(target);
  await writeFile(resolve(directory, "index.html"), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=${safeTarget}"><link rel="canonical" href="${origin}${safeTarget}"><title>Moved | Crossover Stockton</title><script>location.replace(${JSON.stringify(target)}+location.search)</script></head><body><p>This page moved to <a href="${safeTarget}">the new Crossover site</a>.</p></body></html>`);
}
await writeFile(resolve(dist, "404.html"), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=/explore/"><title>Find a record | Crossover Stockton</title><script>location.replace('/explore/'+location.search)</script></head><body><p>Find the page in <a href="/explore/">the public record</a>.</p></body></html>`);
console.log(`Published ${staticSite.pages.length} readable pages and the interactive one-file site, with ${records.length} feed records and ${redirects.size} legacy redirects.`);
