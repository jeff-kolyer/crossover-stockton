import { readFile } from "node:fs/promises";

const dist = new URL("../dist/", import.meta.url);
const origin = "https://crossoverstockton.org";
const sitemap = await readFile(new URL("sitemap.xml", dist), "utf8");
const robots = await readFile(new URL("robots.txt", dist), "utf8");
const llms = await readFile(new URL("llms.txt", dist), "utf8");
const gaps = JSON.parse(await readFile(new URL("../src/data/gaps.json", import.meta.url), "utf8"));
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

if (!urls.length || !robots.includes(`Sitemap: ${origin}/sitemap.xml`)) {
  throw new Error("The sitemap or robots.txt is missing its public page list.");
}

for (const url of urls) {
  const page = new URL(url);
  if (page.origin !== origin || !page.pathname.endsWith("/")) {
    throw new Error(`Unexpected sitemap URL: ${url}`);
  }

  const directory = new URL(`.${page.pathname}`, dist);
  const [html, plain] = await Promise.all([
    readFile(new URL("index.html", directory), "utf8"),
    readFile(new URL("page.txt", directory), "utf8"),
  ]);
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? "";
  const visibleText = main.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const textUrl = `${url}page.txt`;

  if (!html.includes('data-prerendered="true"') || visibleText.length < 120) {
    throw new Error(`Missing meaningful initial HTML at ${url}`);
  }
  if (plain.trim().length < 120 || !plain.includes(url)) {
    throw new Error(`Missing meaningful plain text at ${textUrl}`);
  }
  if (!html.includes(`href="${textUrl}"`) || !llms.includes(`](${textUrl})`)) {
    throw new Error(`Plain-text discovery link missing for ${url}`);
  }
}

const homeHtml = await readFile(new URL("index.html", dist), "utf8");
const homeText = await readFile(new URL("page.txt", dist), "utf8");
const featuredGap = gaps.find((gap) => gap.id === "dogs-safe-placement");
if (!featuredGap || !homeHtml.includes(`href="/reality/${featuredGap.slug}/"`)) {
  throw new Error("The homepage does not link to the active dog-placement gap.");
}
if (!homeHtml.includes("Why do so many dogs struggle to reach care?") || !homeText.includes("Stockton's animal shelter reports regular overcrowding.") || !homeText.includes("Explore what we're learning")) {
  throw new Error("The homepage does not summarize the active investigation.");
}
for (const path of [`/reality/${featuredGap.slug}/our-findings/`, `/reality/${featuredGap.slug}/dogs-locations-map/`, `/reality/${featuredGap.slug}/ways-to-help/`]) {
  if (!homeHtml.includes(`href="${path}"`) || !homeText.includes(`${origin}${path}`)) {
    throw new Error(`The homepage investigation card does not link to ${path}.`);
  }
}

for (const gap of gaps.filter((item) => item.active && item.work_ids?.length)) {
  const gapHtml = await readFile(new URL(`./reality/${gap.slug}/index.html`, dist), "utf8");
  if (gap.id === "dogs-safe-placement") {
    for (const path of ["research/", "ways-to-help/", "improvements/", "our-findings/", "dogs-locations-map/"]) {
      const href = path.startsWith("/") ? path : `/reality/${gap.slug}/${path}`;
      if (!gapHtml.includes(`href="${href}"`)) throw new Error(`The dog gap page does not link to ${href}.`);
    }
    continue;
  }
  for (const workId of gap.work_ids) {
    if (!gapHtml.includes(`href="/work/${workId}/"`)) {
      throw new Error(`The gap page does not link to work item ${workId}.`);
    }
  }
}

console.log(`Verified initial HTML and plain text for ${urls.length} public pages`);
