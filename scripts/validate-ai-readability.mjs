import { readFile } from "node:fs/promises";

const dist = new URL("../dist/", import.meta.url);
const origin = "https://crossoverstockton.org";
const sitemap = await readFile(new URL("sitemap.xml", dist), "utf8");
const robots = await readFile(new URL("robots.txt", dist), "utf8");
const llms = await readFile(new URL("llms.txt", dist), "utf8");
const gaps = JSON.parse(await readFile(new URL("../src/data/gaps.json", import.meta.url), "utf8"));
const dogInvestigation = JSON.parse(await readFile(new URL("../src/data/dogs-investigations.json", import.meta.url), "utf8"));
const records = JSON.parse(await readFile(new URL("../src/data/records.json", import.meta.url), "utf8"));
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
const currentQuestion = dogInvestigation.active_investigations[0]?.title;
const fieldReport = records.find((record) => record.id === "crossover-2026-10-14-sas-first-visit");
if (!currentQuestion || !fieldReport || !homeHtml.includes(currentQuestion) || !homeText.includes(currentQuestion) || !homeText.includes(fieldReport.summary) || !homeText.includes("approximate historical reference areas") || !homeText.includes("Organizations contacted:")) {
  throw new Error("The homepage does not describe the active investigation and firsthand work.");
}
for (const workId of featuredGap.work_ids ?? []) {
  if (!homeHtml.includes(`href="/work/${workId}/"`) || !homeText.includes(`${origin}/work/${workId}/`)) {
    throw new Error(`The homepage does not link to work item ${workId}.`);
  }
}

for (const gap of gaps.filter((item) => item.active && item.work_ids?.length)) {
  const gapHtml = await readFile(new URL(`./reality/${gap.slug}/index.html`, dist), "utf8");
  for (const workId of gap.work_ids) {
    if (!gapHtml.includes(`href="/work/${workId}/"`)) {
      throw new Error(`The gap page does not link to work item ${workId}.`);
    }
  }
}

console.log(`Verified initial HTML and plain text for ${urls.length} public pages`);
