(() => {
  "use strict";

  // Published pages keep readable HTML for visitors without JavaScript. With JavaScript,
  // mount the same application used at / so direct links and in-page navigation agree.
  const route = location.pathname;
  const section = route.match(/^\/street-dogs\/(overview|activity|tasks|metrics|findings|organizations|improvements|places|events|sources)\/?$/)?.[1];
  if (section) {
    document.addEventListener("click", event => {
      const link = event.target.closest("a[href]");
      if (!link || link.target || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = new URL(link.href, location.href);
      const recordId = target.origin === location.origin && target.pathname.match(/^\/(?:record|organization)\/([^/]+)\/?$/)?.[1];
      if (!recordId) return;
      sessionStorage.setItem("crossover-record-origin", JSON.stringify({ path: route, page: section, recordId: decodeURIComponent(recordId), scrollY: window.scrollY }));
    });
    addEventListener("pageshow", () => {
      const raw = sessionStorage.getItem("crossover-return-scroll");
      if (!raw) return;
      sessionStorage.removeItem("crossover-return-scroll");
      const saved = JSON.parse(raw);
      if (saved.path === route) requestAnimationFrame(() => window.scrollTo(0, saved.scrollY));
    });
  }
  const supported = /^\/(?:about|gaps|activity|places|organizations|explore)\/$/.test(route)
    || /^\/gaps\/[^/]+\/(?:overview|activity|findings|metrics|places|organizations|initiatives|sources)\/$/.test(route)
    || /^\/(?:record|organization)\/[^/]+\/$/.test(route);
  if (!supported) return;

  document.body.classList.add("spa-active");
  document.body.insertAdjacentHTML("afterbegin", '<div id="app"></div>');
  document.querySelector(".skip")?.setAttribute("href", "#content");
  for (const fallbackStyle of document.head.querySelectorAll("style")) fallbackStyle.remove();
  const style = document.createElement("style");
  style.textContent = "body.spa-active > .site-header,body.spa-active > #main,body.spa-active > .footer{display:none!important}";
  document.head.append(style);
  for (const href of ["/preview/ai-variant.css", "/preview/ai-variant-modern.css"]) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.append(link);
  }
  const script = document.createElement("script");
  script.src = "/preview/ai-variant.js";
  document.body.append(script);
})();
