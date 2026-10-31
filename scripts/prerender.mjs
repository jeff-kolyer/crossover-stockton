import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { createServer } from "vite";

const origin = "https://crossoverstockton.org";
const dist = new URL("../dist/", import.meta.url);
const gaps = JSON.parse(await readFile(new URL("../src/data/gaps.json", import.meta.url), "utf8"));
const stories = JSON.parse(await readFile(new URL("../src/data/stories.json", import.meta.url), "utf8"));
const work = JSON.parse(await readFile(new URL("../src/data/work.json", import.meta.url), "utf8"));
const records = JSON.parse(await readFile(new URL("../src/data/records.json", import.meta.url), "utf8"));
const articles = JSON.parse(await readFile(new URL("../src/data/articles.json", import.meta.url), "utf8"));
const articleLocations = JSON.parse(await readFile(new URL("../src/data/investigation-locations.json", import.meta.url), "utf8"));
const articlePaths = new Set();
const articleIds = new Set();
for (const article of articles) {
  if (!article.id || articleIds.has(article.id) || !/^\/articles\/[a-z0-9]+(?:-[a-z0-9]+)*\/$/.test(article.path) || articlePaths.has(article.path)
    || !article.title || !/^\d{4}-\d{2}-\d{2}$/.test(article.date)
    || !["finding", "investigation", "opinion", "report", "update"].includes(article.type)
    || !article.description || !article.summary || !article.content?.introduction
    || !Array.isArray(article.content.sections) || typeof article.published !== "boolean"
    || typeof article.show_in_findings !== "boolean" || !Array.isArray(article.related_gap_ids)
    || article.related_gap_ids.some((id) => !gaps.some((gap) => gap.id === id))
    || !Array.isArray(article.related_location_ids)
    || article.related_location_ids.some((id) => !articleLocations.some((location) => location.id === id && location.coordinates && location.marker_kind && location.map_label))
    || article.content.sections.some((section) => !section.heading || !Array.isArray(section.paragraphs)
      || section.paragraphs.some((paragraph) => typeof paragraph !== "string" || !paragraph.trim())
      || (section.links !== undefined && (!Array.isArray(section.links) || section.links.some((link) => !link.label || !link.url))))) {
    throw new Error(`Invalid article record: ${article.id ?? "unknown"}`);
  }
  articleIds.add(article.id);
  articlePaths.add(article.path);
}
const publishedArticles = articles.filter((article) => article.published);
const organizations = JSON.parse(await readFile(new URL("../src/data/orgs.json", import.meta.url), "utf8"));
const engagedOrganizationIds = new Set(records.filter((record) => record.source.publisher?.startsWith("Crossover Stockton") && (record.record_type === "activity" || record.record_type === "field_report" || record.record_type === "field_investigation") && !record.evidence_status?.startsWith("planned")).flatMap((record) => record.organization_ids ?? []));
const dogGapBase = "/reality/too-many-dogs-still-lack-safe-placement/";
const legacyDogWorkSections = {
  "dogs-public-source-review": "research",
  "dogs-map-placement-barriers": "findings",
  "dogs-solutions": "improvements",
  "dogs-direct-field-work": "activity",
  "dogs-locations-map": "map",
};
const legacyDogRoutes = {
  about: dogGapBase,
  tasks: "/work/dogs/",
  activity: "/work/dogs/activity/",
  reports: "/work/dogs/activity/",
  map: "/work/dogs/map/",
  "dogs-locations-map": "/work/dogs/map/",
  findings: "/work/dogs/findings/",
  "our-findings": "/work/dogs/findings/",
  more: dogGapBase,
};
const legacyReferenceSections = {
  about: "",
  more: "",
  "key-factors": "gap-unknown",
  "ways-to-help": "gap-responders",
  improvements: "gap-known",
  research: "gap-sources",
  sources: "gap-sources",
  updates: "gap-known",
};

const pages = [
  ["/", "Crossover Stockton", "See what Stockton needs and what Crossover is learning through its investigations."],
  ["/work/", "Investigations | Crossover Stockton", "Explore current Crossover investigations."],
  ["/work/dogs/", "Tasks | Crossover Stockton", "Planned work in the Stockton dog investigation."],
  ["/work/dogs/tasks/", "Tasks | Crossover Stockton", "Planned work in the Stockton dog investigation."],
  ["/work/dogs/activity/", "Activity | Crossover Stockton", "Documented work in the Stockton dog investigation."],
  ["/work/dogs/map/", "Map | Crossover Stockton", "Locations and field observations in the Stockton dog investigation."],
  ["/work/dogs/findings/", "Findings | Crossover Stockton", "Articles on what Crossover has observed, believes, and is still investigating about dog care in Stockton."],
  ...publishedArticles.map((article) => [article.path, `${article.title} | Crossover Stockton`, article.description]),
  ["/reality/", "Reality | Crossover Stockton", "Follow needs in Stockton and the evidence behind them."],
  ["/connection/", "Connection | Crossover Stockton", "Stories of local people and organizations responding to Stockton's needs."],
  ["/action/", "Action | Crossover Stockton", "Follow Crossover's current work and field investigations in Stockton."],
  ["/updates/", "Updates | Crossover Stockton", "Recent updates on Stockton's needs and community response."],
  ["/about/", "About | Crossover Stockton", "Learn how Crossover Stockton connects local reality, response, and action."],
  ["/organizations/", "Organizations | Crossover Stockton", "Organizations Crossover has contacted or visited."],
  ...organizations.filter((org) => org.active && engagedOrganizationIds.has(org.id)).map((org) => [`/organizations/${org.slug}/`, `${org.name} | Crossover Stockton`, `Crossover's recorded involvement with ${org.name}.`]),
  ...gaps.filter((gap) => gap.active).map((gap) => [`/reality/${gap.slug}/`, `${gap.title} — Reality | Crossover Stockton`, gap.summary]),
  ...stories.filter((story) => story.active).map((story) => [
    `/stories/${story.slug}/`, `${story.title} | Crossover Stockton`, story.summary,
  ]),
  ...records.filter((record) => record.record_type === "field_report").map((record) => [
    `/reports/${encodeURIComponent(record.id)}/`, `${record.title} | Crossover Stockton`, record.summary ?? record.title,
  ]),
];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

function decodeHtml(value) {
  const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
  return value.replace(/&(#(?:x[0-9a-f]+|[0-9]+)|[a-z]+);/gi, (entity, code) => {
    if (code.startsWith("#")) {
      const numeric = code[1].toLowerCase() === "x"
        ? Number.parseInt(code.slice(2), 16)
        : Number.parseInt(code.slice(1), 10);
      return Number.isSafeInteger(numeric) && numeric >= 0 && numeric <= 0x10ffff
        ? String.fromCodePoint(numeric)
        : entity;
    }
    return named[code.toLowerCase()] ?? entity;
  });
}

function plainTextFromHtml(markup, pageUrl) {
  const main = markup.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? markup;
  const links = [...main.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)]
    .map(([, href, label]) => `${decodeHtml(label.replace(/<[^>]+>/g, "").trim())}: ${new URL(decodeHtml(href), pageUrl).href}`)
    .filter((line) => !line.startsWith(":"));
  const body = decodeHtml(main
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, "")
    .replace(/<(?:br|hr)\b[^>]*\/?>/gi, "\n")
    .replace(/<(?:h[1-6]|p|li|section|article|div)\b[^>]*>/gi, "\n")
    .replace(/<\/(?:h[1-6]|p|li|section|article|div|header|footer|aside|ul|ol|button|a|span)>/gi, "\n")
    .replace(/<\/strong>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim());
  return `${body}${links.length ? `\n\nLinks\n${[...new Set(links)].join("\n")}` : ""}`;
}

const vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "error" });
try {
  const { default: App } = await vite.ssrLoadModule("/src/App.tsx");
  const template = await readFile(new URL("index.html", dist), "utf8");

  for (const [path, title, description] of pages) {
    const content = renderToString(createElement(App, { initialPath: path }));
    const safeTitle = escapeHtml(title);
    const safeDescription = escapeHtml(description);
    const url = `${origin}${path}`;
    const html = template
      .replace(/<title>[^<]*<\/title>/, `<title>${safeTitle}</title>`)
      .replace(/(<meta name="description" content=")[^"]*(" \/>)/, `$1${safeDescription}$2`)
      .replace(/(<meta property="og:title" content=")[^"]*(" \/>)/, `$1${safeTitle}$2`)
      .replace(/(<meta property="og:description" content=")[^"]*(" \/>)/, `$1${safeDescription}$2`)
      .replace(/(<meta property="og:url" content=")[^"]*(" \/>)/, `$1${url}$2`)
      .replace(/(<meta name="twitter:title" content=")[^"]*(" \/>)/, `$1${safeTitle}$2`)
      .replace(/(<meta name="twitter:description" content=")[^"]*(" \/>)/, `$1${safeDescription}$2`)
      .replace("</head>", `    <link rel="canonical" href="${url}" />\n    <link rel="alternate" type="text/plain" title="Plain text" href="${url}page.txt" />\n  </head>`)
      .replace('<div id="root"></div>', `<div id="root" data-prerendered="true">${content}</div>`);
    const target = new URL(`.${path}index.html`, dist);
    await mkdir(new URL(`.${path}`, dist), { recursive: true });
    await writeFile(target, html);
    await writeFile(new URL(`.${path}page.txt`, dist), `${title}\n${url}\n\n${plainTextFromHtml(content, url)}\n`);
  }

  const legacyRedirects = [
    ...gaps.filter((gap) => gap.active).flatMap((gap) => [
      ...Object.entries(legacyReferenceSections).map(([section, anchor]) => [`/reality/${gap.slug}/${section}/`, `/reality/${gap.slug}/#${anchor}`]),
      ...(gap.id === "dogs-safe-placement" ? [] : [[`/reality/${gap.slug}/our-findings/`, `/reality/${gap.slug}/#gap-known`]]),
    ]),
    ...Object.entries(legacyDogRoutes).map(([section, target]) => [`${dogGapBase}${section ? `${section}/` : ""}`, target]),
    ...Object.entries(legacyDogWorkSections).map(([workId, section]) => [`/work/${workId}/`, section === "research" ? `${dogGapBase}#gap-sources` : section === "improvements" ? `${dogGapBase}#gap-known` : `/work/dogs/${section}/`]),
    ...work.filter((item) => !legacyDogWorkSections[item.id] && item.id.endsWith("-public-source-review")).map((item) => {
      const gap = gaps.find((entry) => entry.work_ids?.includes(item.id));
      return [`/work/${item.id}/`, gap ? `/reality/${gap.slug}/#gap-sources` : "/reality/"];
    }),
  ];
  for (const [path, target] of legacyRedirects) {
    const [destinationPath, destinationFragment] = target.split("#");
    const redirect = `<!doctype html><html lang="en"><head><meta charset="UTF-8" /><meta name="robots" content="noindex" /><meta http-equiv="refresh" content="0; url=${target}" /><link rel="canonical" href="${origin}${destinationPath}" /><title>Moved | Crossover Stockton</title><script>let anchor=${JSON.stringify(destinationFragment ? `#${destinationFragment}` : "")}||location.hash;let path=${JSON.stringify(destinationPath)};const source=${JSON.stringify(path)};if(source==="/work/dogs-map-placement-barriers/"&&anchor==="#field-observation-map"){path="/work/dogs/map/";anchor=""}if(source==="/work/dogs-map-placement-barriers/"&&anchor.startsWith("#pathways-")){path=${JSON.stringify(dogGapBase)};anchor="#gap-responders"}if((source==="/work/dogs-map-placement-barriers/"||source==="/work/dogs-direct-field-work/"||source===${JSON.stringify(`${dogGapBase}our-findings/`)})&&anchor.includes("records-request")){path="/work/dogs/activity/";anchor="#crossover-2026-10-20-sas-field-call-records-request"}if(source===${JSON.stringify(`${dogGapBase}our-findings/`)}&&(anchor==="#investigation-records"||anchor==="#activity-log")){path="/work/dogs/activity/";anchor=""}if((source==="/work/dogs-map-placement-barriers/"||source===${JSON.stringify(`${dogGapBase}our-findings/`)})&&anchor==="#field-observation-procedure"){path="/work/dogs/tasks/";anchor="#dogs-check-louis-park"}location.replace(path+location.search+anchor)</script></head><body><p>This page moved to <a href="${target}">${target}</a>.</p></body></html>`;
    await mkdir(new URL(`.${path}`, dist), { recursive: true });
    await writeFile(new URL(`.${path}index.html`, dist), redirect);
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(([path]) => `  <url><loc>${origin}${escapeHtml(path)}</loc></url>`).join("\n")}\n</urlset>\n`;
  await writeFile(new URL("sitemap.xml", dist), sitemap);
  await writeFile(new URL("robots.txt", dist), `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
  await writeFile(new URL("llms.txt", dist), `# Crossover Stockton\n\nPublic, plain-text versions of the site's pages. These files are generated from the same content as the HTML pages.\n\n${pages.map(([path, title, description]) => `- [${title}](${origin}${path}page.txt): ${description}`).join("\n")}\n`);
  console.log(`Prerendered ${pages.length} pages with plain-text versions, sitemap.xml, robots.txt, and llms.txt`);
} finally {
  await vite.close();
}
