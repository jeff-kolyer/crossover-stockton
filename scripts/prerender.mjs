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
    [`/reality/${gap.slug}/updates/`, `${gap.title} — Updates | Crossover Stockton`, `Updates on ${gap.title.toLowerCase()}.`],
    [`/reality/${gap.slug}/sources/`, `${gap.title} — Sources | Crossover Stockton`, `Sources and evidence for ${gap.title.toLowerCase()}.`],
  ]),
  ...stories.filter((story) => story.active).map((story) => [
    `/stories/${story.slug}/`, `${story.title} | Crossover Stockton`, story.summary,
  ]),
  ...work.map((item) => [`/work/${item.id}/`, "Crossover work | Crossover Stockton", item.summary ?? item.title ?? "Crossover Stockton's work in the community."]),
  ...records.filter((record) => record.record_type === "field_report").map((record) => [
    `/reports/${encodeURIComponent(record.id)}/`, `${record.title} | Crossover Stockton`, record.summary ?? record.title,
  ]),
];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
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
      .replace("</head>", `    <link rel="canonical" href="${url}" />\n  </head>`)
      .replace('<div id="root"></div>', `<div id="root" data-prerendered="true">${content}</div>`);
    const target = new URL(`.${path}index.html`, dist);
    await mkdir(new URL(`.${path}`, dist), { recursive: true });
    await writeFile(target, html);
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(([path]) => `  <url><loc>${origin}${escapeHtml(path)}</loc></url>`).join("\n")}\n</urlset>\n`;
  await writeFile(new URL("sitemap.xml", dist), sitemap);
  await writeFile(new URL("robots.txt", dist), `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
  console.log(`Prerendered ${pages.length} pages and wrote sitemap.xml and robots.txt`);
} finally {
  await vite.close();
}
