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
const dogGapBase = "/reality/too-many-dogs-still-lack-safe-placement/";
const legacyDogWorkSections = {
  "dogs-public-source-review": "research",
  "dogs-map-placement-barriers": "our-findings",
  "dogs-solutions": "improvements",
  "dogs-direct-field-work": "our-findings",
};

const pages = [
  ["/", "Crossover Stockton", "See what Stockton needs, who is responding, and practical ways to help."],
  ["/reality/", "Reality | Crossover Stockton", "Follow needs in Stockton and the evidence behind them."],
  ["/connection/", "Connection | Crossover Stockton", "Stories of local people and organizations responding to Stockton's needs."],
  ["/action/", "Action | Crossover Stockton", "Find practical ways to help in Stockton."],
  ["/updates/", "Updates | Crossover Stockton", "Recent updates on Stockton's needs and community response."],
  ["/about/", "About | Crossover Stockton", "Learn how Crossover Stockton connects local reality, response, and action."],
  ["/organizations/", "Organizations | Crossover Stockton", "Local organizations followed by Crossover Stockton."],
  ...gaps.filter((gap) => gap.active).flatMap((gap) => [
    [`/reality/${gap.slug}/`, `${gap.title} — Reality | Crossover Stockton`, gap.summary],
    [`/reality/${gap.slug}/ways-to-help/`, `${gap.title} — Ways to Help | Crossover Stockton`, `Ways to help with ${gap.title.toLowerCase()}.`],
    [`/reality/${gap.slug}/key-factors/`, `${gap.title} — Key Factors | Crossover Stockton`, `Factors affecting ${gap.title.toLowerCase()}.`],
    [`/reality/${gap.slug}/improvements/`, `${gap.title} — Improvements | Crossover Stockton`, `Projects and possibilities related to ${gap.title.toLowerCase()}.`],
    ...(gap.investigation_status === "investigating" ? [[`/reality/${gap.slug}/our-findings/`, `${gap.title} — Our Findings | Crossover Stockton`, `Crossover's investigation of ${gap.title.toLowerCase()}.`]] : []),
    [`/reality/${gap.slug}/research/`, `${gap.title} — Research | Crossover Stockton`, `Research and evidence for ${gap.title.toLowerCase()}.`],
    [`/reality/${gap.slug}/updates/`, `${gap.title} — Updates | Crossover Stockton`, `Updates on ${gap.title.toLowerCase()}.`],
    [`/reality/${gap.slug}/sources/`, `${gap.title} — Sources | Crossover Stockton`, `Sources and evidence for ${gap.title.toLowerCase()}.`],
  ]),
  ...stories.filter((story) => story.active).map((story) => [
    `/stories/${story.slug}/`, `${story.title} | Crossover Stockton`, story.summary,
  ]),
  ...work.filter((item) => !legacyDogWorkSections[item.id]).map((item) => [`/work/${item.id}/`, `${item.title} | Crossover Stockton`, item.summary ?? item.title ?? "Crossover Stockton's work in the community."]),
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

  for (const [workId, section] of Object.entries(legacyDogWorkSections)) {
    const path = `/work/${workId}/`;
    const target = `${dogGapBase}${section}/`;
    const redirect = `<!doctype html><html lang="en"><head><meta charset="UTF-8" /><meta name="robots" content="noindex" /><meta http-equiv="refresh" content="0; url=${target}" /><link rel="canonical" href="${origin}${target}" /><title>Moved | Crossover Stockton</title><script>const anchor=decodeURIComponent(location.hash.slice(1));let path=${JSON.stringify(target)};let hash="";if(${JSON.stringify(workId)}==="dogs-map-placement-barriers"&&anchor==="field-observation-map"){path="/work/dogs-locations-map/";hash=anchor}else if(${JSON.stringify(workId)}==="dogs-map-placement-barriers"&&anchor.startsWith("pathways-")){path=${JSON.stringify(`${dogGapBase}ways-to-help/`)};hash=anchor}else if(${JSON.stringify(workId)}==="dogs-map-placement-barriers"&&(anchor.startsWith("investigation-")||anchor==="field-observation-procedure")){hash=anchor}else if(${JSON.stringify(workId)}==="dogs-direct-field-work"&&anchor){hash=anchor.includes("records-request")?"investigation-records-request":"investigation-records"}else if(anchor){hash=anchor}location.replace(path+location.search+(hash?"#"+encodeURIComponent(hash):""))</script></head><body><p>This page moved to <a href="${target}">${target}</a>.</p></body></html>`;
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
