import { runInNewContext } from "node:vm";

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]);

const plainText = (value) => String(value ?? "")
  .replace(/<br\s*\/?\s*>/gi, " ")
  .replace(/<[^>]*>/g, "")
  .replace(/&(?:amp|lt|gt|quot|#39);/g, (entity) => ({
    "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'",
  })[entity])
  .replace(/\s+/g, " ").trim();

const publicPath = (route) => route === "/" ? "/" : `/${route.replace(/^\/+|\/+$/g, "")}/`;
const routeFromQuery = (value) => {
  try {
    const route = decodeURIComponent(value).replace(/^\/+|\/+$/g, "");
    return publicPath(route === "work" ? "/responses" : `/${route}`);
  } catch { return "/"; }
};

export function renderStaticPages(oneFile, feed, origin, navigationVersion) {
  const bundled = (id) => {
    const match = oneFile.match(new RegExp(`<script id="${id}" type="application/json">([\\s\\S]*?)<\\/script>`));
    if (!match) throw new Error(`Missing embedded ${id}`);
    return match[1];
  };
  const assets = JSON.parse(bundled("asset-data"));
  const scripts = [...oneFile.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
  const clientScript = scripts.at(-1)?.[1];
  if (!clientScript) throw new Error("Missing one-file site renderer");

  const nodes = new Map();
  const node = (id) => {
    if (!nodes.has(id)) nodes.set(id, {
      innerHTML: "", textContent: id === "feed-data" ? bundled("feed-data") : id === "asset-data" ? bundled("asset-data") : "",
      classList: { remove() {}, toggle() {}, contains() { return false; } },
      setAttribute() {}, addEventListener() {}, remove() {},
      insertAdjacentHTML(position, html) { if (position !== "beforeend") throw new Error(position); this.innerHTML += html; },
    });
    return nodes.get(id);
  };
  const listeners = new Map();
  const location = { search: "", hash: "" };
  const document = { getElementById: node, addEventListener() {} };
  const window = { addEventListener: (event, callback) => listeners.set(event, callback), scrollTo() {} };
  runInNewContext(clientScript, { document, window, location, URL, URLSearchParams, console }, { timeout: 3000 });
  const rerender = listeners.get("hashchange");
  if (!rerender) throw new Error("One-file renderer did not register navigation");

  const shell = oneFile.slice(0, oneFile.indexOf('<script id="feed-data"'));
  const records = Object.values(feed.records);
  const coreRoutes = ["/", "/needs", "/investigation", "/articles", "/activity", "/responses", "/organizations", "/places", "/explore", "/about"];
  const routes = coreRoutes.map((route) => ({ route, sitemap: true }));
  for (const record of records) {
    routes.push({ route: `/record/${encodeURIComponent(record.id)}`, sitemap: record.schema !== "organization" });
    if (record.schema === "organization") routes.push({ route: `/organization/${encodeURIComponent(record.id)}`, sitemap: true });
  }

  const pages = routes.map(({ route, sitemap }) => {
    location.search = `?page=${encodeURIComponent(route.slice(1))}`;
    location.hash = "";
    rerender();
    let main = node("main").innerHTML;
    if (route === "/explore") {
      main = main.replace('<div class="record-list" id="explore-results"></div>', `<div class="record-list" id="explore-results">${node("explore-results").innerHTML}</div>`);
      main = main.replace('<p class="explore-count" id="explore-count" role="status" aria-live="polite"></p>', `<p class="explore-count" id="explore-count" role="status" aria-live="polite">${escapeHtml(node("explore-count").textContent)}</p>`);
    }
    for (const [path, data] of Object.entries(assets)) main = main.replaceAll(data, path);
    if (!main.trim()) throw new Error(`Static content missing for ${route}`);
    const heading = plainText(main.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] || (route === "/about" ? "About Crossover" : "Crossover Stockton"));
    const description = plainText(main.match(/<p[^>]*>([\s\S]*?)<\/p>/)?.[1] || feed.records["crossover-stockton"]?.fields?.purpose || "Crossover Stockton public record").slice(0, 160);
    const title = route === "/" ? "Crossover Stockton — See clearly. Act locally." : `${heading} | Crossover Stockton`;
    const canonical = route.startsWith("/record/") && feed.records[decodeURIComponent(route.slice("/record/".length))]?.schema === "organization"
      ? publicPath(route.replace("/record/", "/organization/")) : publicPath(route);
    const noindex = canonical !== publicPath(route);
    let html = shell
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
      .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escapeHtml(description)}">`)
      .replace("</head>", `<link rel="canonical" href="${escapeHtml(origin + canonical)}">${noindex ? '<meta name="robots" content="noindex,follow">' : ""}</head>`)
      .replace('<main id="main" tabindex="-1"></main>', `<main id="main" tabindex="-1">${main}</main>`)
      .replace('<nav class="nav" id="site-nav" aria-label="Main navigation"></nav>', `<nav class="nav" id="site-nav" aria-label="Main navigation">${node("site-nav").innerHTML}</nav>`)
      .replace('<nav id="footer-nav" aria-label="Footer navigation"></nav>', `<nav id="footer-nav" aria-label="Footer navigation">${node("footer-nav").innerHTML}</nav>`)
      .replace('<img id="header-logo"', '<img src="/images/logo_dark.webp" id="header-logo"')
      .replace('<img id="footer-logo"', '<img src="/images/logo_light.webp" id="footer-logo"')
      .replace('<p id="footer-purpose"></p>', `<p id="footer-purpose">${escapeHtml(node("footer-purpose").textContent)}</p>`)
      .replace('<span id="record-count"></span>', `<span id="record-count">${records.length}</span>`)
      .replace('id="header-linkedin" target=', `id="header-linkedin" href="${escapeHtml(node("header-linkedin").href)}" target=`)
      .replace('</div></div></footer>', '<a href="/data/records.json">Public feed (JSON) ↗</a></div></div></footer>')
      .replaceAll('href="#/"', 'href="/"')
      .replace(/href="\?page=([^"]*)"/g, (_, value) => `href="${escapeHtml(routeFromQuery(value))}"`);
    html += `<script src="/static-navigation.js?v=${navigationVersion}" defer></script>\n</body>\n</html>\n`;
    return { path: publicPath(route), html, sitemap };
  });
  return { pages, assets: Object.keys(assets) };
}
