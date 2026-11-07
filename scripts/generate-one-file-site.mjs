import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, sep } from "node:path";

const feed = JSON.parse(await readFile("public/data/records.json", "utf8"));
const template = await readFile("site/one-file-template.html", "utf8");
const noImagesCss = await readFile("site/no-images.css", "utf8");
const cleanCss = await readFile("site/clean.css", "utf8");
const fontFiles = [["Regular",400],["Medium",500],["SemiBold",600],["Bold",700]];
const fontCss = (await Promise.all(fontFiles.map(async ([name,weight]) => {
  const bytes = await readFile(`public/fonts/IBMPlexSans-${name}.woff2`);
  return `@font-face{font-family:"IBM Plex Sans";src:url("data:font/woff2;base64,${bytes.toString("base64")}") format("woff2");font-style:normal;font-weight:${weight};font-display:block}`;
}))).join("\n");
const imagePaths = new Set(["/images/logo_light.webp", "/images/logo_dark.webp", "/images/variants/clean/dog-park.jpg", "/images/variants/clean/dog-sidewalk.jpg", "/images/about/about-the-founder.jpg"]);
const collect = (value) => {
  if (typeof value === "string" && value.startsWith("/images/")) imagePaths.add(value);
  else if (Array.isArray(value)) value.forEach(collect);
  else if (value && typeof value === "object") Object.values(value).forEach(collect);
};
for (const record of Object.values(feed.records)) collect(record.fields);
collect(feed.experienceSpec);

const publicRoot = resolve("public");
const dataUri = async (path) => {
  const diskPath = resolve(publicRoot, `.${path}`);
  if (!diskPath.startsWith(`${publicRoot}${sep}`)) throw new Error(`Unsafe image path: ${path}`);
  const extension = path.split(".").at(-1)?.toLowerCase();
  const mime = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", svg: "image/svg+xml" }[extension];
  if (!mime) throw new Error(`Unsupported image type: ${path}`);
  return `data:${mime};base64,${(await readFile(diskPath)).toString("base64")}`;
};
const cleanAssets = {};
for (const path of [...imagePaths].sort()) {
  if (!path.startsWith("/images/variants/clean/") && !path.startsWith("/images/about/about-the-founder.") && !path.startsWith("/images/icons/") && !path.startsWith("/images/logo_")) throw new Error(`Unexpected image path: ${path}`);
  cleanAssets[path] = await dataUri(path);
}

const jsonForHtml = (value) => JSON.stringify(value).replaceAll("<", "\\u003c").replaceAll("\u2028", "\\u2028").replaceAll("\u2029", "\\u2029");
const render = (embeddedAssets, variantCss, imageFallback, aliases = {}, embeddedFeed = feed) => {
  const output = template
    .replace("__EMBEDDED_FEED__", jsonForHtml(embeddedFeed))
    .replace("__EMBEDDED_ASSETS__", jsonForHtml(embeddedAssets))
    .replace("__FONT_CSS__", fontCss)
    .replace("__VARIANT_CSS__", variantCss)
    .replace("__IMAGE_FALLBACK__", imageFallback)
    .replace("__IMAGE_ALIASES__", jsonForHtml(aliases))
    .replaceAll('href="#/', 'href="?page=');
  if (/__EMBEDDED_FEED__|__EMBEDDED_ASSETS__|__FONT_CSS__|__VARIANT_CSS__|__IMAGE_FALLBACK__|__IMAGE_ALIASES__/.test(output)) throw new Error("Template replacement failed");
  return output;
};
const output = render(cleanAssets, cleanCss, "null");
const noImagesOutput = render({}, noImagesCss, '"data:,"');
const cleanOutput = output;
await mkdir("public/preview", { recursive: true });
await writeFile("public/preview/one-file-site.html", output);
await writeFile("public/preview/no-images-site.html", noImagesOutput);
await writeFile("public/preview/clean-site.html", cleanOutput);
console.log(`Generated public/preview/one-file-site.html from ${Object.keys(feed.records).length} feed records and ${Object.keys(cleanAssets).length} embedded assets (${(Buffer.byteLength(output) / 1024 / 1024).toFixed(2)} MB).`);
console.log(`Generated public/preview/no-images-site.html from the same feed without embedded images (${(Buffer.byteLength(noImagesOutput) / 1024 / 1024).toFixed(2)} MB).`);
console.log(`Generated public/preview/clean-site.html with ${Object.keys(cleanAssets).length} understated assets (${(Buffer.byteLength(cleanOutput) / 1024 / 1024).toFixed(2)} MB).`);
