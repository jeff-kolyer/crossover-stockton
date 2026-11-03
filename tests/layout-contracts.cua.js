// Run in Codex's cua_repl after the initial browser selection call.
// This is a rendered browser test: it measures computed styles and boxes,
// which the PostCSS build check cannot determine from source alone.
await (async () => {
  const browser = await cua.getBrowser({ id: "iab" });
  const viewport = await browser.capabilities.get("viewport");
  const tab = await cua.createBrowserTab("iab", "http://localhost:5173/action/", { visible: false });
  const routes = ["/", "/about/", "/action/", "/reality/", "/connection/", "/updates/", "/work/dogs/activity/"];
  const failures = [];
  try {
    for (const width of [320, 375, 412, 768, 1280]) {
      await viewport.set({ width, height: 924 });
      for (const route of routes) {
        await tab.goto(`http://localhost:5173${route}`);
        const result = await tab.playwright.evaluate(() => {
          const gap = (selector) => [...document.querySelectorAll(selector)]
            .filter((node) => node.children.length > 1)
            .map((node) => ({
              value: getComputedStyle(node).gap,
              actual: node.children[1].getBoundingClientRect().top - node.children[0].getBoundingClientRect().bottom,
            }));
          const metricColumns = [...document.querySelectorAll(".layout-action-metrics")]
            .map((node) => [...node.children].map((child) => child.getBoundingClientRect().width));
          const boundaries = [...document.querySelectorAll(".layout-record-list--separated")]
            .flatMap((node) => [...node.children].map((child, index) => ({
              index,
              last: index === node.children.length - 1,
              before: getComputedStyle(child).paddingTop,
              after: getComputedStyle(child).paddingBottom,
              border: getComputedStyle(child).borderTopWidth,
            })));
          return {
            route: location.pathname,
            overflow: document.documentElement.scrollWidth > innerWidth,
            headings: gap(".layout-heading-group"),
            prose: gap(".layout-prose-stack"),
            metricColumns,
            boundaries,
          };
        });
        for (const entry of result.headings) if (entry.value !== "4px" || Math.abs(entry.actual - 4) > 1) failures.push(`${width} ${route}: HeadingGroup ${JSON.stringify(entry)}`);
        for (const entry of result.prose) if (entry.value !== "16px" || Math.abs(entry.actual - 16) > 1) failures.push(`${width} ${route}: ProseStack ${JSON.stringify(entry)}`);
        for (const columns of result.metricColumns) if (columns.length !== 3 || Math.max(...columns) - Math.min(...columns) > 1) failures.push(`${width} ${route}: ActionMetrics columns ${columns}`);
        for (const item of result.boundaries) {
          if (item.index > 0 && (item.before !== "16px" || item.border !== "1px")) failures.push(`${width} ${route}: boundary before ${JSON.stringify(item)}`);
          if (!item.last && item.after !== "16px") failures.push(`${width} ${route}: boundary after ${JSON.stringify(item)}`);
        }
        if (result.overflow) failures.push(`${width} ${route}: horizontal overflow`);
      }
    }
  } finally {
    await viewport.reset();
    await tab.close();
  }
  if (failures.length) throw new Error(failures.join("\n"));
  nodeRepl.write(`Rendered layout contracts passed on ${routes.length} routes at five widths.`);
})();
