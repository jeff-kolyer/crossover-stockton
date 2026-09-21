import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const indexFile = join("dist", "index.html");
const gaps = JSON.parse(readFileSync(new URL("../src/data/gaps.json", import.meta.url), "utf8"));
const stories = JSON.parse(readFileSync(new URL("../src/data/stories.json", import.meta.url), "utf8"));

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

for (const route of routes) {
  const routeIndex = join("dist", route.replace(/^\/+/, ""), "index.html");
  mkdirSync(join("dist", route.replace(/^\/+/, "")), { recursive: true });
  copyFileSync(indexFile, routeIndex);
}

console.log(`Generated ${routes.size} static route pages`);
