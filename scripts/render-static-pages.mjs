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
    return publicPath(route === "work" ? "/action" : route === "responses" ? "/stories" : `/${route}`);
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
      innerHTML: "", textContent: ["feed-data", "story-data", "asset-data"].includes(id) ? bundled(id) : "",
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

  const fontPaths = ["Regular", "Medium", "SemiBold", "Bold"].map(name => `/fonts/IBMPlexSans-${name}.woff2`);
  let fontIndex = 0;
  const shell = oneFile.slice(0, oneFile.indexOf('<script id="feed-data"'))
    .replace(/url\("data:font\/woff2;base64,[A-Za-z0-9+/=]+"\)/g, () => `url("${fontPaths[fontIndex++]}")`);
  if (fontIndex !== fontPaths.length) throw new Error(`Expected ${fontPaths.length} embedded font files, found ${fontIndex}`);
  const records = Object.values(feed.records);
  const story = JSON.parse(bundled("story-data"));
  const coreRoutes = ["/", "/gaps", "/activity", "/places", "/explore", "/organizations", "/about"];
  const routes = coreRoutes.map((route) => ({ route, sitemap: true }));
  const needViews = story.chapters.find(item => item.id === "gap").chapters.map(item => item.id);
  const menuViews = story.silent.menu.map(item => item.page);
  const gapHomeAliases = new Set(records.filter(record => record.schema === "gap").map(record => `/${encodeURIComponent(record.fields.slug)}`));
  for (const record of records) {
    routes.push({ route: `/record/${encodeURIComponent(record.id)}`, sitemap: record.schema !== "organization" });
    if (record.schema === "organization") routes.push({ route: `/organization/${encodeURIComponent(record.id)}`, sitemap: true });

  }

  for (const gap of records.filter((record) => record.schema === "gap")) {
    routes.push({ route: `/${encodeURIComponent(gap.fields.slug)}`, sitemap: false });
    for (const view of needViews) routes.push({ route: `/gaps/${encodeURIComponent(gap.fields.slug)}/${view}`, sitemap: false });
    for (const view of menuViews) routes.push({ route: `/${encodeURIComponent(gap.fields.slug)}/${view}`, sitemap: true });
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
    const canonical = gapHomeAliases.has(route) ? "/" : route.startsWith("/record/") && feed.records[decodeURIComponent(route.slice("/record/".length))]?.schema === "organization"
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
      .replace('</div></div></footer>', '<a href="/feed/">Read the feed <svg class="right-arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg></a><a href="/feed.json" target="_blank" rel="noopener noreferrer">Feed JSON <svg class="external-arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" focusable="false"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"/></svg></a><a href="/data/records.json" target="_blank" rel="noopener noreferrer">Read the JSON <svg class="external-arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" focusable="false"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"/></svg></a></div></div></footer>')
      .replaceAll('href="#/"', 'href="/"')
      .replace(/href="\?page=([^"]*)"/g, (_, value) => `href="${escapeHtml(routeFromQuery(value))}"`);
    html += `<script src="/static-navigation.js?v=${navigationVersion}" defer></script>\n</body>\n</html>\n`;
    return { path: publicPath(route), html, sitemap };
  });
  return { pages, assets: Object.keys(assets) };
}
