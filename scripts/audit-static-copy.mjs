import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = path.resolve(import.meta.dirname, '..');
const files = fs.readdirSync(path.join(root, 'src/components')).filter((name) => name.endsWith('.tsx')).map((name) => `src/components/${name}`);
files.push(...fs.readdirSync(path.join(root, 'src/lib')).filter((name) => /\.(tsx?|jsx?)$/.test(name)).map((name) => `src/lib/${name}`));
files.push('src/App.tsx', 'src/view/crossoverActions.ts');
const allCandidates = process.argv.includes('--candidates');
const directOnly = process.argv.includes('--direct');
let directCount = 0;
for (const file of files) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const rows = [];
  const visit = (node) => {
    if (ts.isJsxText(node)) {
      const value = node.getText(tree).replace(/\s+/g, ' ').trim();
      if (/[a-z]/i.test(value)) rows.push({ line: tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1, kind: 'text', value });
    }
    if (ts.isJsxAttribute(node) && node.initializer && ts.isStringLiteral(node.initializer) && /^(alt|aria-label|title|placeholder)$/.test(node.name.text)) {
      rows.push({ line: tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1, kind: node.name.text, value: node.initializer.text });
    }
    if (ts.isStringLiteral(node) && !ts.isJsxAttribute(node.parent)) {
      const property = ts.isPropertyAssignment(node.parent) ? node.parent.name.getText(tree) : '';
      const isDisplayProperty = /^(?:title|label|summary|description|text|eyebrow|buttonLabel|alt|note)$/.test(property);
      let ancestor = node.parent;
      let inJsxExpression = false;
      while (ancestor && !ts.isSourceFile(ancestor)) {
        if (ts.isJsxExpression(ancestor)) { inJsxExpression = true; break; }
        ancestor = ancestor.parent;
      }
      if ((isDisplayProperty || inJsxExpression) && /[a-z]/i.test(node.text) && !/^\/(?:images|work|reality|stories|action|about|connection|updates)/.test(node.text)) rows.push({ line: tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1, kind: isDisplayProperty ? property : 'expression', value: node.text });
      else if (allCandidates && /(?:[A-Z][a-z]+|[a-z]+ [a-z]+)/.test(node.text) && !/^\//.test(node.text)) rows.push({ line: tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1, kind: 'candidate', value: node.text });
    }
    if (allCandidates && (ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) && /[A-Za-z]{2,} [A-Za-z]{2,}/.test(node.text)) rows.push({ line: tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1, kind: 'template', value: node.text });
    ts.forEachChild(node, visit);
  };
  visit(tree);
  const visibleRows = directOnly ? rows.filter((row) => row.kind === 'text' || ['alt', 'aria-label', 'title', 'placeholder'].includes(row.kind) && row.value.trim()) : rows;
  directCount += visibleRows.length;
  if (visibleRows.length) console.log(JSON.stringify({ file, count: visibleRows.length, rows: visibleRows }));
}
if (directOnly) {
  if (directCount) process.exitCode = 1;
  else console.log('No direct JSX text or static display attributes in component source.');
}
