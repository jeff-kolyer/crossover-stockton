import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const svg = await readFile('public/favicon.svg', 'utf8');
const svgUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);

const browser = await chromium.launch();

async function renderPng(size, bg = 'transparent', pad = 1) {
  const ctx = await browser.newContext({ viewport: { width: size, height: size }, deviceScaleFactor: 1, colorScheme: 'light' });
  const page = await ctx.newPage();
  const iconSize = Math.round(size * pad);
  await page.setContent(`
    <body style="margin:0;width:100vw;height:100vh;display:grid;place-items:center;background:${bg}">
      <img src="${svgUrl}" width="${iconSize}" height="${iconSize}" style="display:block">
    </body>
  `);
  const buf = await page.screenshot({ omitBackground: bg === 'transparent' });
  await ctx.close();
  return buf;
}

const p32 = await renderPng(32);
const p48 = await renderPng(48);
const p96 = await renderPng(96);
const p180 = await renderPng(180, '#FFFFFF', 0.74);
const p192 = await renderPng(192, '#FFFFFF', 0.74);
const p512 = await renderPng(512, '#FFFFFF', 0.74);
await browser.close();

await writeFile('public/favicon-96x96.png', p96);
await writeFile('public/apple-touch-icon.png', p180);
await writeFile('public/web-app-manifest-192x192.png', p192);
await writeFile('public/web-app-manifest-512x512.png', p512);
await writeFile('public/assets/crossover-mark-32.png', p32);
await writeFile('public/assets/crossover-mark-192.png', p192);
await writeFile('public/assets/crossover-mark-512.png', p512);

const ico = Buffer.alloc(22);
ico.writeUInt16LE(1, 2);
ico.writeUInt16LE(1, 4);
ico[6] = 48;
ico[7] = 48;
ico.writeUInt16LE(1, 10);
ico.writeUInt16LE(32, 12);
ico.writeUInt32LE(p48.length, 14);
ico.writeUInt32LE(22, 18);
await writeFile('public/favicon.ico', Buffer.concat([ico, p48]));
console.log('Rendered transparent two-tone gold icons.');
