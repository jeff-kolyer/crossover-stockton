import { readFile } from "node:fs/promises";

const dist = new URL("../dist/", import.meta.url);
const origin = "https://crossoverstockton.org";
const sitemap = await readFile(new URL("sitemap.xml", dist), "utf8");
const robots = await readFile(new URL("robots.txt", dist), "utf8");
const llms = await readFile(new URL("llms.txt", dist), "utf8");
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

console.log(`Verified initial HTML and plain text for ${urls.length} public pages`);
