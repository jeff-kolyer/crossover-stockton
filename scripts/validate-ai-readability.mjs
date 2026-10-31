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
if (!featuredGap || !homeHtml.includes(`href="/reality/${featuredGap.slug}/"`)) throw new Error("The homepage does not link to the dog gap page.");
const workIndexHtml = await readFile(new URL("work/index.html", dist), "utf8");
const workIndexText = await readFile(new URL("work/page.txt", dist), "utf8");
if (!workIndexHtml.includes("Dogs on the street in Stockton") || !workIndexText.includes("Field reports, locations, pathways to care, and current findings")) throw new Error("The investigation index does not summarize the active investigation.");
if (!workIndexText.includes(`${origin}/work/dogs/`)) throw new Error("The investigation index lacks its workspace link.");

for (const gap of gaps.filter((item) => item.active)) {
  const gapHtml = await readFile(new URL(`./reality/${gap.slug}/index.html`, dist), "utf8");
  if (!gapHtml.includes("What&#x27;s happening?") || !gapHtml.includes("What remains unknown?") || !gapHtml.includes('id="gap-sources"')) throw new Error(`${gap.slug} lacks reference sections.`);
  if (gapHtml.includes('class="crossover-primary-tabs"') || gapHtml.includes('class="dog-gap-tabs"')) throw new Error(`${gap.slug} contains workspace navigation.`);
  if (gap.id === "dogs-safe-placement" && !gapHtml.includes('href="/work/dogs/findings/"')) throw new Error("The dog gap page lacks its Findings link.");
}

console.log(`Verified initial HTML and plain text for ${urls.length} public pages`);
