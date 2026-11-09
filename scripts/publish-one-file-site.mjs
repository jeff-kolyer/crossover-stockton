import { copyFile, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, sep } from "node:path";
import { renderStaticPages } from "./render-static-pages.mjs";
import { renderSiteMdPages } from "./render-site-md-pages.mjs";

const workspace = resolve(".");
const dist = resolve("dist");
if (!dist.startsWith(`${workspace}${sep}`)) throw new Error("dist must be inside the workspace");

const html = await readFile("public/preview/one-file-site.html", "utf8");
const feedBytes = await readFile("public/data/records.json");
const feed = JSON.parse(feedBytes.toString("utf8"));
const story = JSON.parse(await readFile("public/feed.json", "utf8"));
const records = Object.values(feed.records);
const origin = "https://crossoverstockton.org";
const gapIconPaths = {
  story: '<path d="M3 4h7a3 3 0 0 1 3 3v14a3 3 0 0 0-3-3H3zM21 4h-5a3 3 0 0 0-3 3v14a3 3 0 0 1 3-3h5z"/>',
  activity: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  tasks: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="m8 12 2.5 2.5L16 9"/>',
  metrics: '<path d="M4 20v-8h4v8m2 0V4h4v16m2 0v-6h4v6M2 21h20"/>',
  findings: '<path d="M9 18h6M10 21h4M8 15a7 7 0 1 1 8 0l-1 3H9z"/>',
  organizations: '<circle cx="9" cy="8" r="3"/><path d="M2 20v-2a7 7 0 0 1 14 0v2M17 5a3 3 0 0 1 0 6M18 14a6 6 0 0 1 4 6"/>',
  improvements: '<path d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5"/>',
  places: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  events: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
  document: '<path d="M5 2h9l4 4v5M14 2v4h4M5 2v20h8"/><circle cx="16" cy="16" r="3.5"/><path d="m18.5 18.5 3 3"/>',
};
const gapIcon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${gapIconPaths[name] ?? gapIconPaths.document}</svg>`;
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
  for (const view of ["overview", "activity", "findings", "metrics", "places", "organizations", "initiatives", "improvements", "sources"]) {
    const target = view === "initiatives" ? "improvements" : view;
    redirects.set(`/needs/${encodeURIComponent(gap.id)}/${view}/`, `${base}${target}/`);
    redirects.set(`/projects/${encodeURIComponent(gap.fields.slug)}/${view}/`, `${base}${target}/`);
  }
  redirects.set(`${base}initiatives/`, `${base}improvements/`);
  redirects.set(`/projects/${encodeURIComponent(gap.fields.slug)}/`, `${base}overview/`);
  redirects.set(`${base}reports/`, `${base}activity/#field-reports`);
  redirects.set(`/projects/${encodeURIComponent(gap.fields.slug)}/reports/`, `${base}activity/#field-reports`);
  redirects.set(`/needs/${encodeURIComponent(gap.id)}/reports/`, `${base}activity/#field-reports`);
  for (const [oldView, nextView] of [["numbers", "metrics"], ["questions", "overview"], ["objectives", "overview"]]) {
    redirects.set(`${base}${oldView}/`, `${base}${nextView}/`);
    redirects.set(`/projects/${encodeURIComponent(gap.fields.slug)}/${oldView}/`, `${base}${nextView}/`);
    redirects.set(`/needs/${encodeURIComponent(gap.id)}/${oldView}/`, `${base}${nextView}/`);
  }
  redirects.set(`${base}projects/`, `${base}improvements/`);
  redirects.set(`/projects/${encodeURIComponent(gap.fields.slug)}/projects/`, `${base}improvements/`);
  redirects.set(`/needs/${encodeURIComponent(gap.id)}/projects/`, `${base}improvements/`);
}
for (const id of ["where-dogs-need-help", "food-and-water", "response-barriers", "additional-help", "improvement-outcomes"])
  redirects.set(`/record/${id}/`, "/gaps/street-dogs/overview/");
redirects.set("/projects/", "/gaps/");
redirects.set("/street-dogs/story/", "/street-dogs/overview/");
redirects.set("/feed/story/", "/feed/");
for (const [old, target] of [...redirects]) redirects.set(old, target.replaceAll("/projects/street-dogs/", "/gaps/street-dogs/").replaceAll("/gaps/street-dogs/initiatives/", "/gaps/street-dogs/improvements/").replace(/^\/projects\/$/, "/gaps/"));
const currentGap = records.find(record => record.schema === "gap" && record.fields?.default);
if (!currentGap) throw new Error("No default gap in the public feed");
const currentSlug = encodeURIComponent(currentGap.fields.slug);
redirects.set(`/${currentSlug}/`, `/${currentSlug}/overview/`);
redirects.set(`/gaps/${currentSlug}/`, `/${currentSlug}/overview/`);
for (const item of story.silent.menu) redirects.set(`/gaps/${currentSlug}/${item.page}/`, `/${currentSlug}/${item.page}/`);

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
await copyFile("public/preview/site-md.css", resolve(dist, "site.css"));
await copyFile("public/preview/care-site/style.css", resolve(dist, "care-site.css"));
await copyFile("public/preview/care-site/site.js", resolve(dist, "site.js"));
await mkdir(resolve(dist, "images/home"), { recursive: true });
await copyFile("public/images/home/sunlit-window-view.jpg", resolve(dist, "images/home/sunlit-window-view.jpg"));
await mkdir(resolve(dist, "images/about"), { recursive: true });
for (const file of (await readdir("public/images/about")).filter(name => /\.(?:jpg|png|webp)$/i.test(name)))
  await copyFile(resolve("public/images/about", file), resolve(dist, "images/about", file));
await writeFile(resolve(dist, "data/records.json"), feedBytes);
await copyFile("public/feed.json", resolve(dist, "feed.json"));
await copyFile("public/feed-content.html", resolve(dist, "feed-content.html"));
await copyFile("public/feed.txt", resolve(dist, "feed.txt"));
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
await copyFile("public/images/variants/clean/dog-sidewalk.jpg", resolve(dist, "images/variants/clean/dog-sidewalk.jpg"));
await copyFile("public/images/variants/clean/dog-through-window.jpg", resolve(dist, "images/variants/clean/dog-through-window.jpg"));
await copyFile("public/images/variants/clean/records-desk.jpg", resolve(dist, "images/variants/clean/records-desk.jpg"));
for (const page of staticSite.pages) {
  const directory = page.path === "/" ? dist : resolve(dist, `.${page.path}`);
  if (directory !== dist && !directory.startsWith(`${dist}${sep}`)) throw new Error(`Unsafe page path: ${page.path}`);
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, "index.html"), page.html);
}
const siteMdTemplate = await readFile("public/preview/care-site/index.html", "utf8");
const siteMdScript = await readFile("public/preview/care-site/site.js", "utf8");
const feedContent = await readFile("public/feed-content.html", "utf8");
const siteMdPages = renderSiteMdPages(siteMdTemplate, siteMdScript, feed, story, origin, feedContent);
for (const page of siteMdPages) {
  const directory = page.path === "/" ? dist : resolve(dist, `.${page.path}`);
  if (directory !== dist && !directory.startsWith(`${dist}${sep}`)) throw new Error(`Unsafe SITE.md page path: ${page.path}`);
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, "index.html"), page.html);
}
await writeFile("index.html", siteMdPages.find(page => page.path === "/").html);
const experimentDirectory = resolve(dist, "preview/style-experiment");
await mkdir(experimentDirectory, { recursive: true });
await writeFile(resolve(experimentDirectory, "index.html"), '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=/"><link rel="canonical" href="https://crossoverstockton.org/"><title>Crossover Stockton</title><script>location.replace("/")</script></head><body><p>Continue to <a href="/">Crossover Stockton</a>.</p></body></html>');
await mkdir(resolve(dist, "interactive"), { recursive: true });
await writeFile(resolve(dist, "interactive/index.html"), html.replace("<head>", '<head><meta name="robots" content="noindex,follow">'));
await writeFile(resolve(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticSite.pages.filter((page) => page.sitemap).map((page) => `<url><loc>${origin}${page.path}</loc></url>`).join("")}<url><loc>${origin}/feed/</loc></url></urlset>\n`);
await writeFile(resolve(dist, "llms.txt"), `# Crossover Stockton\n\nReadable pages: ${origin}/, ${origin}/feed/, ${origin}/activity/, ${origin}/places/, ${origin}/explore/, ${origin}/organizations/, ${origin}/about/\nFeed text: ${origin}/feed.txt\nFeed JSON: ${origin}/feed.json\nFull sitemap: ${origin}/sitemap.xml\nPublic records: ${origin}/data/records.json\nInteractive one-file version: ${origin}/interactive/\n`);

for (const [path, target] of redirects) {
  const directory = resolve(dist, `.${path}`);
  if (!directory.startsWith(`${dist}${sep}`)) throw new Error(`Unsafe redirect path: ${path}`);
  await mkdir(directory, { recursive: true });
  const safeTarget = escapeHtml(target);
  await writeFile(resolve(directory, "index.html"), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=${safeTarget}"><link rel="canonical" href="${origin}${safeTarget}"><title>Moved | Crossover Stockton</title><script>location.replace(${JSON.stringify(target)}+location.search)</script></head><body><p>This page moved to <a href="${safeTarget}">the new Crossover site</a>.</p></body></html>`);
}
await writeFile(resolve(dist, "404.html"), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=/explore/"><title>Find a record | Crossover Stockton</title><script>location.replace('/explore/'+location.search)</script></head><body><p>Find the page in <a href="/explore/">the public record</a>.</p></body></html>`);
console.log(`Published ${siteMdPages.length} SITE.md pages, ${staticSite.pages.length} readable fallbacks, and the interactive one-file site, with ${records.length} feed records and ${redirects.size} legacy redirects.`);
