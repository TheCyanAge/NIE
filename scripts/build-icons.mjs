// Renders assets/logo.svg with Chromium at every Windows icon size and packs a multi-resolution icon.ico.
//   npm run icons     (needs playwright-core and an installed Chromium; set CHROMIUM_PATH to override)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { packIco, packBmp24, SIZES } from './ico.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const full = fs.readFileSync(path.join(root, 'assets/logo.svg'), 'utf8');
const small = fs.readFileSync(path.join(root, 'assets/logo-small.svg'), 'utf8'); // bolder, text-free: legible at 16-48px

function findChromium() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH ?? '/opt/pw-browsers';
  if (fs.existsSync(path.join(base, 'chromium'))) return path.join(base, 'chromium');
  return undefined; // let playwright-core look in its default location
}

const browser = await chromium.launch({ executablePath: findChromium() });
const page = await browser.newPage();
const png = {};
for (const size of [...SIZES, 512]) {
  await page.setViewportSize({ width: size, height: size });
  const svg = size <= 48 ? small : full;
  await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`);
  png[size] = await page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
}
// Installer wizard images (Inno Setup needs BMPs): latte-cream panels with the mark.
const dataUri = (svgText) => `data:image/svg+xml;base64,${Buffer.from(svgText).toString('base64')}`;
async function wizardBmp(width, height, html) {
  await page.setViewportSize({ width, height });
  await page.setContent(`<style>html,body{margin:0;width:${width}px;height:${height}px;overflow:hidden}</style>${html}`);
  const shot = await page.screenshot({ clip: { x: 0, y: 0, width, height } });
  const rgba = await page.evaluate(async ({ b64, width, height }) => {
    const bmp = await createImageBitmap(await (await fetch(`data:image/png;base64,${b64}`)).blob());
    const c = document.createElement('canvas');
    c.width = width; c.height = height;
    const ctx = c.getContext('2d');
    ctx.drawImage(bmp, 0, 0);
    return Array.from(ctx.getImageData(0, 0, width, height).data);
  }, { b64: shot.toString('base64'), width, height });
  return packBmp24(width, height, rgba);
}
const bg = 'background:radial-gradient(120% 80% at 50% 30%,#fcf6ee,#efdfcf);';
fs.writeFileSync(path.join(root, 'assets/wizard-large.bmp'), await wizardBmp(164, 314,
  `<div style="${bg}width:164px;height:314px;position:relative;font-family:Georgia,'Liberation Serif',serif;color:#7a5236">
     <img src="${dataUri(full)}" style="position:absolute;left:22px;top:46px;width:120px;height:120px">
     <div style="position:absolute;left:0;right:0;top:186px;text-align:center;font-size:15px;letter-spacing:.18em;line-height:1.5">NARRATIVE<br>INTEGRITY<br>ENGINE</div>
     <div style="position:absolute;left:0;right:0;bottom:18px;text-align:center;font-size:10px;letter-spacing:.2em;opacity:.7">THE CYAN AGE</div></div>`));
fs.writeFileSync(path.join(root, 'assets/wizard-small.bmp'), await wizardBmp(55, 58,
  `<div style="${bg}width:55px;height:58px;position:relative"><img src="${dataUri(small)}" style="position:absolute;left:4px;top:5px;width:47px;height:47px"></div>`));
await browser.close();

fs.writeFileSync(path.join(root, 'assets/icon.ico'), packIco(SIZES.map((s) => ({ size: s, png: png[s] }))));
fs.writeFileSync(path.join(root, 'assets/icon.png'), png[512]);
fs.writeFileSync(path.join(root, 'apps/web/assets/icon.png'), png[256]);
console.log('Wrote assets/icon.ico (' + SIZES.join(', ') + ' px), icon.png, wizard-large.bmp, wizard-small.bmp');
