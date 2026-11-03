import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';

const root = path.resolve(import.meta.dirname, '..');
const authoredCss = ['src/styles/crossover.css'];
const registry = JSON.parse(fs.readFileSync(path.join(root, 'docs/layout-exceptions.json'), 'utf8'));
const exceptions = new Map(registry.map((entry) => [`${entry.file}|${entry.selector}|${entry.property}|${entry.value}`, entry]));
const used = new Set();
const issues = [];
const standard = new Set([0, 4, 8, 16, 24]);
const typeProperty = /^(font-size|line-height)$/;
const spacingProperty = /^(margin(?:-.+)?|padding(?:-.+)?|gap|row-gap|column-gap)$/;
const verticalMargin = /^(margin|margin-top|margin-bottom|margin-block|margin-block-start|margin-block-end)$/;
const semantic = /(?:^|[\s>+~,])(?:h[1-6]|p|ul|ol|figure|blockquote|hr)(?=$|[\s>+~.#:\[])/;

function exceptionFor(file, selector, declaration) {
  const key = `${file}|${selector}|${declaration.prop}|${declaration.value}`;
  const entry = exceptions.get(key);
  if (entry) used.add(key);
  return entry;
}

for (const file of authoredCss) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const css = postcss.parse(source, { from: file });
  css.walkDecls((decl) => {
    const selector = decl.parent.selector ?? '<root>';
    const atMedia = Boolean(decl.parent.parent?.type === 'atrule' && decl.parent.parent.name === 'media');
    const registered = exceptionFor(file, selector, decl);
    const location = `${file}:${decl.source.start.line}`;
    const report = (reason) => { if (!registered) issues.push(`${location} ${selector} { ${decl.prop}: ${decl.value} } — ${reason}`); };

    if (decl.prop.startsWith('--')) {
      if (decl.prop.startsWith('--space-') && !standard.has(Number(decl.value.replace('px', '')))) report('spacing token is outside the four-step scale');
      if (decl.prop.startsWith('--type-') && selector !== ':root') report('typography tokens must be defined centrally');
      if (/--(?:layout|home|public|hero|sheet|crossover)-[\w-]*(?:width|height|size|gap|pad|shift|rail|inset|max|offset)/.test(decl.prop) && !(selector === ':root' && decl.prop.startsWith('--layout-width-')) && [...decl.value.matchAll(/(-?\d+(?:\.\d+)?)(px|vw|vh|rem|em)/g)].some(([, number, unit]) => unit !== 'px' || !standard.has(Number(number)))) report('specialized geometry token requires a registered exception');
      return;
    }
    if (typeProperty.test(decl.prop)) {
      if (!/^var\(--type-[\w-]+\)$/.test(decl.value) && !['inherit', 'normal', '1'].includes(decl.value)) report('typography must use a central role token');
      if (atMedia && !selector.includes('layout-action-metrics')) report('responsive typography requires a registered exception');
    }
    if (decl.prop === 'font-family' && selector !== ':root' && !/^var\(--font-[\w-]+\)$/.test(decl.value)) report('font family must use a central role token');
    if (decl.prop === 'font' && /\d(?:px|rem|em|\s*\/)/.test(decl.value)) report('font shorthand hides a local size or line height');
    if (/h[1-3]/.test(selector) && !/^(?:h1|h2|h3)$/.test(selector) && /^(font-family|font-size|font-weight|line-height|letter-spacing)$/.test(decl.prop)) report('semantic heading typography cannot be overridden by a page or component');
    if (spacingProperty.test(decl.prop)) {
      if (verticalMargin.test(decl.prop) && semantic.test(selector) && decl.value !== '0') report('standard content elements cannot own external margins');
      if (verticalMargin.test(decl.prop) && !['0', '0 auto', 'auto'].includes(decl.value) && !decl.prop.includes('inline') && !decl.prop.includes('scroll')) report('vertical separation belongs to a parent layout');
      if (/(?:^|[^-])\d+(?:\.\d+)?(?:px|em|rem|vw|vh)/.test(decl.value)) {
        const values = [...decl.value.matchAll(/(-?\d+(?:\.\d+)?)(px|em|rem|vw|vh)/g)];
        if (values.some(([, number, unit]) => unit !== 'px' || !standard.has(Number(number)))) report('spacing must use 0, 4, 8, 16, or 24px, or a registered geometry exception');
      }
      if (/var\(--(?!space-|layout-)[\w-]+\)/.test(decl.value)) report('non-scale spacing variable requires a registered exception');
    }
  });
}

for (const file of fs.readdirSync(path.join(root, 'src/components')).filter((name) => name.endsWith('.tsx'))) {
  const content = fs.readFileSync(path.join(root, 'src/components', file), 'utf8');
  if (/style=\{\{[^}]*\b(?:margin|padding|gap|fontSize|lineHeight)\s*:/.test(content)) issues.push(`src/components/${file} — inline typography or spacing is prohibited`);
}

const cssFiles = [
  ...fs.readdirSync(path.join(root, 'src/styles')).filter((name) => name.endsWith('.css')).map((name) => `src/styles/${name}`),
  ...fs.readdirSync(path.join(root, 'src/components')).filter((name) => name.endsWith('.css')).map((name) => `src/components/${name}`),
];
if (cssFiles.length !== 1 || cssFiles[0] !== authoredCss[0]) issues.push(`Expected one authored stylesheet: ${cssFiles.join(', ')}`);
const entry = fs.readFileSync(path.join(root, 'src/main.tsx'), 'utf8');
if ((entry.match(/import\s+["']\.\/styles\/crossover\.css["']/g) ?? []).length !== 1) issues.push('src/main.tsx must import crossover.css exactly once');
for (const dir of ['src', 'src/components']) {
  for (const file of fs.readdirSync(path.join(root, dir)).filter((name) => name.endsWith('.tsx') && !(dir === 'src' && name === 'main.tsx'))) {
    const content = fs.readFileSync(path.join(root, dir, file), 'utf8');
    if (/import\s+["'][^"']+\.css["']/.test(content) && file !== 'LeafletLocationsMap.tsx') issues.push(`${dir}/${file} imports first-party CSS`);
  }
}
const shellCss = postcss.parse(fs.readFileSync(path.join(root, authoredCss[0]), 'utf8'));
for (const [mode, expected] of [['standard', 'var(--space-4)'], ['hero', 'var(--space-4)'], ['flush', '0']]) {
  const selector = `.page-shell--${mode}`;
  const rules = shellCss.nodes.filter((node) => node.type === 'rule' && node.selector === selector);
  if (rules.length !== 1 || !rules[0].nodes.some((node) => node.type === 'decl' && node.prop === 'padding-block' && node.value === expected)) issues.push(`${selector} must own its named page origin (${expected})`);
}

for (const entry of registry) {
  const key = `${entry.file}|${entry.selector}|${entry.property}|${entry.value}`;
  if (!entry.name || !entry.reason || !entry.owner || typeof entry.responsive !== 'boolean') issues.push(`docs/layout-exceptions.json — incomplete exception: ${key}`);
  if (!used.has(key)) issues.push(`docs/layout-exceptions.json — stale exception: ${key}`);
}

if (issues.length) {
  console.error(`Layout check found ${issues.length} violation${issues.length === 1 ? '' : 's'}:\n${issues.join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`Layout check passed: ${authoredCss.length} authored stylesheet and ${registry.length} registered geometry exceptions.`);
}
