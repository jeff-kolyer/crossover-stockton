import { readFileSync } from "node:fs";

const publicStyles = ["src/styles/public.css", "src/styles/home.css", "src/styles/public-chrome.css"];
const css = Object.fromEntries(publicStyles.map((path) => [path, readFileSync(path, "utf8")]));
const homePage = readFileSync("src/components/HomePage.tsx", "utf8");
const homeLanding = readFileSync("src/components/HomeLanding.tsx", "utf8");
const aboutPage = readFileSync("src/components/AboutPage.tsx", "utf8");
const actionIndex = readFileSync("src/components/ActionIndexPage.tsx", "utf8");
const component = readFileSync("src/components/PublicPrimaryAction.tsx", "utf8");
const canonical = new Set([
  ".public-site .public-primary-action",
  ".public-site .public-primary-action:hover",
  ".public-site .public-primary-action:focus-visible",
]);

function rules(source) {
  const withoutComments = source.replace(/\/\*[\s\S]*?\*\//g, "");
  return [...withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selectors: match[1].split(",").map((selector) => selector.trim().replace(/\s+/g, " ")),
    declarations: match[2],
  }));
}

function validate(styles = css) {
  const errors = [];
  const seen = new Map();

  for (const [path, source] of Object.entries(styles)) {
    for (const { selectors, declarations } of rules(source)) {
      for (const selector of selectors) {
        if (!selector || selector.startsWith("@")) continue;
        const targetsPrimary = selector.replaceAll(":not(.public-primary-action)", "").includes(".public-primary-action");
        const isCanonical = path === "src/styles/public.css" && canonical.has(selector);
        if (isCanonical) seen.set(selector, (seen.get(selector) ?? 0) + 1);
        if (targetsPrimary && !isCanonical) errors.push(`${path}: primary action has a competing selector: ${selector}`);

        // A second colored link/button is another primary-button implementation.
        const interactive = /(?:^|[\s>+~,])(?:a|button)(?=[:.#\[\s>+~,]|$)|\.[\w-]*(?:-button|-primary|-cta)(?=[:.#\[\s>+~,]|$)/i.test(selector);
        const backgrounds = [...declarations.matchAll(/(?:^|;)\s*background(?:-color)?\s*:\s*([^;]+)/gi)].map((match) => match[1].trim().toLowerCase());
        if (interactive && !isCanonical && backgrounds.some((value) => !/^(?:none|transparent|white|#fff|#ffffff)$/.test(value))) {
          errors.push(`${path}: colored action background outside the shared style: ${selector}`);
        }

        // These ancestor selectors would restyle either Home primary action.
        if (path === "src/styles/home.css" && /\.(?:hero-action-row|home-landing-investigation-copy|home-landing)\s+(?:a|button)(?=[:.#\[\s]|$)/.test(selector) && !selector.includes(":not(.public-primary-action)")) {
          errors.push(`${path}: ancestor selector can override a primary action: ${selector}`);
        }
      }
    }
  }

  for (const selector of canonical) {
    if (seen.get(selector) !== 1) errors.push(`Expected exactly one ${selector} rule in src/styles/public.css`);
  }
  for (const [path, source] of [["src/components/HomePage.tsx", homePage], ["src/components/HomeLanding.tsx", homeLanding]]) {
    if ((source.match(/<PublicPrimaryAction\b/g) ?? []).length !== 1) errors.push(`${path}: expected one shared Home primary action`);
    if (/hero-investigation-button|home-landing-primary/.test(source)) errors.push(`${path}: legacy primary-action class remains`);
  }
  if ((aboutPage.match(/<PublicPrimaryAction\b/g) ?? []).length !== 1 || aboutPage.includes("PlainActionButton")) {
    errors.push("AboutPage must use the shared public action for its /action/ link");
  }
  if (actionIndex.includes("<PublicPrimaryAction") || actionIndex.includes("action-index-button") || !actionIndex.includes("<p><a href={action.href}")) {
    errors.push("ActionIndexPage must use a plain text link for each action");
  }
  for (const [path, source, allowed] of [
    ["src/components/HomePage.tsx", homePage, "../styles/home.css"],
    ["src/components/HomeLanding.tsx", homeLanding, ""],
    ["src/components/AboutPage.tsx", aboutPage, ""],
    ["src/components/ActionIndexPage.tsx", actionIndex, ""],
  ]) {
    const imports = [...source.matchAll(/import\s+["']([^"']+\.css)["']/g)].map((match) => match[1]);
    if (imports.some((name) => name !== allowed)) errors.push(`${path}: unexpected public CSS import; add any needed rules to the shared public styles`);
  }
  if ((component.match(/className="public-primary-action"/g) ?? []).length !== 2 || !component.includes("<a ") || !component.includes("<button ")) {
    errors.push("PublicPrimaryAction must render both links and buttons with the same class");
  }

  return errors;
}

if (process.argv.includes("--self-test")) {
  const duplicate = { ...css, "src/styles/home.css": `${css["src/styles/home.css"]}\n.crossover-home .duplicate-primary-button { background: #1f6b34; padding: 0 12px; }` };
  if (!validate(duplicate).some((error) => error.includes("duplicate-primary-button"))) throw new Error("Duplicate primary style went undetected");
  console.log("Duplicate public primary-action style correctly rejected.");
} else {
  const errors = validate();
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
  } else {
    console.log("Public primary actions use one component and one style authority.");
  }
}
