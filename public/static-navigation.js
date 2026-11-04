(() => {
  "use strict";

  const legacyRoute = location.hash.startsWith("#/") ? location.hash.slice(1) : "";
  if (legacyRoute && !legacyRoute.startsWith("//") && legacyRoute.split("/").every((part) => /^[a-z0-9%_-]*$/i.test(part))) {
    location.replace((legacyRoute === "/" ? "/" : legacyRoute.endsWith("/") ? legacyRoute : `${legacyRoute}/`) + location.search);
    return;
  }

  const menu = document.getElementById("menu-toggle");
  menu?.addEventListener("click", () => {
    const nav = document.getElementById("site-nav");
    nav.classList.toggle("open");
    menu.setAttribute("aria-expanded", String(nav.classList.contains("open")));
  });

  const sections = new Set(["/", "/needs/", "/investigation/", "/activity/", "/responses/", "/organizations/", "/places/", "/explore/", "/about/"]);
  const recordPath = /^\/(?:record|organization)\/[^/]+\/$/;
  const cache = new Map();
  cache.set(location.pathname, Promise.resolve(document.cloneNode(true)));
  const scrollPositions = new Map();
  let displayedPath = location.pathname;
  let navigationId = 0;
  history.scrollRestoration = "manual";

  const enhanceExplore = () => {
    const list = document.getElementById("explore-results");
    const search = document.getElementById("explore-search");
    const type = document.getElementById("explore-type");
    const sort = document.getElementById("explore-sort");
    const count = document.getElementById("explore-count");
    if (!list || !search || !type || !sort || !count) return;
    const rows = [...list.querySelectorAll(".record-row")];
    const update = () => {
      const query = search.value.toLowerCase().trim();
      const matching = rows.filter((row) =>
        (type.value === "all" || row.dataset.schema === type.value) &&
        (!query || row.dataset.search.includes(query))
      );
      matching.sort((a, b) => {
        if (sort.value.startsWith("title")) {
          const order = a.dataset.title.localeCompare(b.dataset.title, undefined, { sensitivity: "base", numeric: true }) || a.dataset.id.localeCompare(b.dataset.id);
          return sort.value === "title-desc" ? -order : order;
        }
        const aDate = a.dataset.sortDate, bDate = b.dataset.sortDate;
        if (!aDate) return bDate ? 1 : a.dataset.id.localeCompare(b.dataset.id);
        if (!bDate) return -1;
        return (sort.value === "oldest" ? aDate.localeCompare(bDate) : bDate.localeCompare(aDate)) || a.dataset.id.localeCompare(b.dataset.id);
      });
      if (matching.length) list.replaceChildren(...matching);
      else {
        const empty = document.createElement("p");
        empty.className = "empty";
        empty.textContent = "No matching records.";
        list.replaceChildren(empty);
      }
      count.textContent = `${matching.length} of ${rows.length} records`;
    };
    search.addEventListener("input", update);
    type.addEventListener("change", update);
    sort.addEventListener("change", update);
  };

  const destination = (link) => {
    if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return null;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.search || url.hash) return null;
    return sections.has(url.pathname) || recordPath.test(url.pathname) ? url : null;
  };

  const loadPage = (url) => {
    const key = url.pathname;
    if (!cache.has(key)) {
      cache.set(key, fetch(key, { credentials: "same-origin" }).then(async (response) => {
        if (!response.ok) throw new Error(`Page request failed: ${response.status}`);
        const page = new DOMParser().parseFromString(await response.text(), "text/html");
        if (!page.querySelector("main#main") || !page.querySelector('link[rel="canonical"]')) throw new Error("Page content is incomplete");
        return page;
      }).catch((error) => { cache.delete(key); throw error; }));
    }
    return cache.get(key);
  };

  const syncMeta = (page, selector) => {
    const incoming = page.querySelector(selector);
    const current = document.querySelector(selector);
    if (!incoming) { current?.remove(); return; }
    if (current) current.replaceWith(document.importNode(incoming, true));
    else document.head.append(document.importNode(incoming, true));
  };

  const syncBreadcrumb = () => {
    if (history.state?.breadcrumbContext !== "explore" || !recordPath.test(location.pathname)) return;
    const breadcrumb = document.querySelector("main#main .breadcrumbs");
    const title = document.querySelector("main#main h1")?.textContent?.trim();
    if (!breadcrumb || !title) return;
    const home = document.createElement("a");
    home.href = "/";
    home.textContent = "Home";
    const explore = document.createElement("a");
    explore.href = "/explore/";
    explore.textContent = "Explore";
    const current = document.createElement("span");
    current.setAttribute("aria-current", "page");
    current.textContent = title;
    breadcrumb.replaceChildren(home, document.createTextNode(" / "), explore, document.createTextNode(" / "), current);
  };

  const display = (page, url, scrollY, focusMain) => {
    const main = document.importNode(page.querySelector("main#main"), true);
    document.querySelector("main#main").replaceWith(main);
    document.getElementById("site-nav").innerHTML = page.getElementById("site-nav").innerHTML;
    document.getElementById("footer-nav").innerHTML = page.getElementById("footer-nav").innerHTML;
    document.getElementById("site-nav").classList.remove("open");
    menu?.setAttribute("aria-expanded", "false");
    document.title = page.title;
    syncMeta(page, 'meta[name="description"]');
    syncMeta(page, 'meta[name="robots"]');
    syncMeta(page, 'link[rel="canonical"]');
    displayedPath = url.pathname;
    syncBreadcrumb();
    enhanceExplore();
    window.scrollTo(0, scrollY);
    if (focusMain) main.focus({ preventScroll: true });
  };

  const navigate = async (url, push, restoreScroll = 0) => {
    const requestId = ++navigationId;
    try {
      const page = await loadPage(url);
      if (requestId !== navigationId) return;
      if (push) {
        const fromExplore = recordPath.test(url.pathname) &&
          (displayedPath === "/explore/" || history.state?.breadcrumbContext === "explore");
        history.pushState(fromExplore ? { breadcrumbContext: "explore" } : null, "", url.pathname);
      }
      display(page, url, restoreScroll, push);
    } catch {
      if (requestId !== navigationId) return;
      if (push) location.assign(url.href);
      else location.reload();
    }
  };

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
    const url = destination(link);
    if (!url) return;
    event.preventDefault();
    if (url.pathname === displayedPath) { window.scrollTo(0, 0); return; }
    scrollPositions.set(displayedPath, window.scrollY);
    navigate(url, true);
  });

  window.addEventListener("popstate", () => {
    if (location.pathname === displayedPath) return;
    scrollPositions.set(displayedPath, window.scrollY);
    navigate(new URL(location.href), false, scrollPositions.get(location.pathname) ?? 0);
  });

  document.addEventListener("pointerover", (event) => {
    const link = event.target instanceof Element ? event.target.closest("#site-nav a[href], .card h3 a[href], .row h3 a[href]") : null;
    const url = destination(link);
    if (url && url.pathname !== displayedPath) loadPage(url).catch(() => {});
  }, { passive: true });
  enhanceExplore();
  syncBreadcrumb();
})();
