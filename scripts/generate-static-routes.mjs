import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const indexFile = join("dist", "index.html");
const gaps = JSON.parse(readFileSync(new URL("../src/data/gaps.json", import.meta.url), "utf8"));
const stories = JSON.parse(readFileSync(new URL("../src/data/stories.json", import.meta.url), "utf8"));
const preloadByRoute = new Map([
  ["/reality", "/images/reality/reality_banner.jpg"],
  ["/connection", "/images/connection/connection_banner.jpg"],
  ["/action", "/images/action/action_banner.jpg"],
  ["/about", "/images/about/about-crossover-hero.jpg"],
  ["/organizations", "/images/organizations/organizations-we-follow-hero.jpg"],
]);

const routes = new Set([
  "/reality",
  "/connection",
  "/action",
  "/updates",
  "/about",
  "/organizations",
]);

for (const gap of gaps) {
  routes.add(`/reality/${gap.slug}`);
  routes.add(`/reality/${gap.slug}/updates`);
  routes.add(`/reality/${gap.slug}/sources`);
}

for (const story of stories) {
  routes.add(`/stories/${story.slug}`);
}

for (const gap of gaps) {
  preloadByRoute.set(`/reality/${gap.slug}`, gap.artwork);
}

for (const story of stories) {
  preloadByRoute.set(`/stories/${story.slug}`, story.image || "/images/connection/connection_banner.jpg");
}

for (const route of routes) {
  const routeIndex = join("dist", route.replace(/^\/+/, ""), "index.html");
  mkdirSync(join("dist", route.replace(/^\/+/, "")), { recursive: true });
  const preloadImage = preloadByRoute.get(route);
  let html = readFileSync(indexFile, "utf8");
  if (preloadImage) {
    html = html.replace(
      'href="/images/home/background_home.jpg"',
      `href="${preloadImage}"`,
    );
  } else {
    html = html.replace(/\s*<link rel="preload" as="image" href="\/images\/home\/background_home\.jpg" fetchpriority="high" \/>/, "");
  }
  writeFileSync(routeIndex, html);
}

console.log(`Generated ${routes.size} static route pages`);
