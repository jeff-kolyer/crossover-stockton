(() => {
  "use strict";

  // Published pages keep readable HTML for visitors without JavaScript. With JavaScript,
  // mount the same application used at / so direct links and in-page navigation agree.
  const route = location.pathname;
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
