import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";

const root = path.resolve(import.meta.dirname, "..");
const cssFiles = [
  "src/styles/app.css",
  "src/styles/public.css",
  "src/styles/public-chrome.css",
  "src/styles/home.css",
  "src/styles/map.css",
  "src/styles/activity.css",
  "src/styles/controls.css",
  "src/styles/investigation-google.css",
  "src/components/PublicMobileMenu.layout.css",
];
const properties = /^(?:font|font-size|line-height|margin(?:-(?:top|right|bottom|left|inline(?:-start|-end)?|block(?:-start|-end)?))?|padding(?:-(?:top|right|bottom|left|inline(?:-start|-end)?|block(?:-start|-end)?))?|gap|row-gap|column-gap)$/;
const output = [
  "## Complete declaration inventory",
  "",
  "This appendix lists every authored typography and spacing declaration in the first-party CSS loaded by the site. Each row gives the source line, selector, property, and value. An `@media` condition is part of the selector column. External Leaflet and MapLibre CSS are outside Crossover's authored layout system. Dynamic TSX styles and class composition are listed separately above. This table records source declarations, including declarations that are overridden at runtime.",
  "",
];
let count = 0;
const declarations = [];
for (const file of cssFiles) {
  const content = fs.readFileSync(path.join(root, file), "utf8");
  const parsed = postcss.parse(content, { from: file });
  const rows = [];
  parsed.walkDecls((decl) => {
    if (!properties.test(decl.prop)) return;
    const rule = decl.parent;
    if (rule.type !== "rule") return;
    const media = [];
    for (let node = rule.parent; node && node.type !== "root"; node = node.parent) {
      if (node.type === "atrule") media.unshift(`@${node.name} ${node.params}`);
    }
    const selector = `${media.length ? `${media.join(" / ")} · ` : ""}${rule.selector}`.replace(/\s+/g, " ").replaceAll("|", "\\|");
    rows.push(`| ${decl.source.start.line} | ${selector} | \`${decl.prop}\` | \`${decl.value.replaceAll("|", "\\|")}\` |`);
    declarations.push({ file, line: decl.source.start.line, selector, property: decl.prop, value: decl.value, media });
    count++;
  });
  output.push(`### ${file} (${rows.length} declarations)`, "", "| Line | Selector or component | Property | Existing value |", "|---:|---|---|---|", ...rows, "");
}
if (process.argv.includes("--stats")) {
  const group = (key) => Object.fromEntries([...Map.groupBy(declarations, (row) => row[key])].map(([value, rows]) => [value, rows.length]).sort((a, b) => b[1] - a[1]));
  process.stdout.write(JSON.stringify({ total: count, byFile: group("file"), byProperty: group("property"), fontSizes: declarations.filter((row) => row.property === "font-size"), lineHeights: declarations.filter((row) => row.property === "line-height"), media: [...new Set(declarations.flatMap((row) => row.media))], values: group("value") }, null, 2));
  process.exit(0);
}
if (process.argv.includes("--duplicates")) {
  const groups = Map.groupBy(declarations, (row) => `${row.selector}|${row.property}`);
  process.stdout.write(JSON.stringify([...groups].filter(([, rows]) => rows.length > 1).map(([key, rows]) => ({ key, rows })), null, 2));
  process.exit(0);
}
output.splice(4, 0, `Total: **${count}** declarations across ${cssFiles.length} first-party CSS files.`, "");
output.push("## Semantic text and control selectors", "", "These are all first-party CSS rules whose selectors directly name an HTML heading, paragraph, list, link, or button, plus the named shared link/button/status component classes. This includes non-spacing overrides such as color and border. The complete declaration inventory above gives every relevant font and spacing value; this table gives the entire rule body so other component-specific overrides remain visible.", "", "| File:line | Selector | Declarations |", "|---|---|---|");
const semanticSelector = /(?:^|[\s>+~,:])(?:h[1-6]|p|ul|ol|li|a|button)(?=$|[\s>+~,:.#\[])/i;
const semanticClass = /(?:arrow-text-link|public-primary-action|plain-action-button|home-landing-status)/;
for (const file of cssFiles) {
  const parsed = postcss.parse(fs.readFileSync(path.join(root, file), "utf8"), { from: file });
  parsed.walkRules((rule) => {
    if (!semanticSelector.test(rule.selector) && !semanticClass.test(rule.selector)) return;
    const media = [];
    for (let node = rule.parent; node && node.type !== "root"; node = node.parent) if (node.type === "atrule") media.unshift(`@${node.name} ${node.params}`);
    const selector = `${media.length ? `${media.join(" / ")} · ` : ""}${rule.selector}`.replace(/\s+/g, " ").replaceAll("|", "\\|");
    const declarations = rule.nodes.filter((node) => node.type === "decl").map((node) => `${node.prop}: ${node.value}`).join("; ").replaceAll("|", "\\|");
    output.push(`| ${file}:${rule.source.start.line} | ${selector} | ${declarations} |`);
  });
}
output.push("", "## TSX dynamic style and class composition", "", "These are authored runtime style expressions and dynamic class assignments. Data-driven colors and drag position values are state, not spacing tokens. Static `className` references are covered by the CSS selector tables above.", "", "| File:line | Expression |", "|---|---|");
const componentsDir = path.join(root, "src/components");
for (const file of ["src/App.tsx", ...fs.readdirSync(componentsDir).filter((name) => name.endsWith(".tsx")).map((name) => `src/components/${name}`)]) {
  const lines = fs.readFileSync(path.join(root, file), "utf8").split(/\r?\n/);
  lines.forEach((line, index) => {
    if (!line.includes("style=") && !line.includes("className={")) return;
    const expression = line.trim().replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("`", "&#96;").replaceAll("|", "\\|");
    output.push(`| ${file}:${index + 1} | ${expression} |`);
  });
}
output.push("");
const inventory = output.join("\n");
if (process.argv.includes("--write-audit")) {
  const auditPath = path.join(root, "docs/LAYOUT_AUDIT.md");
  const existing = fs.readFileSync(auditPath, "utf8");
  const marker = "## Complete declaration inventory";
  const markerIndex = existing.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Missing inventory marker in ${auditPath}`);
  fs.writeFileSync(auditPath, `${existing.slice(0, markerIndex).trimEnd()}\n\n${inventory}\n`);
} else {
  process.stdout.write(inventory);
}
