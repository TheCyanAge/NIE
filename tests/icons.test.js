import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { packIco, packBmp24, readIcoDirectory, SIZES } from '../scripts/ico.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

test('icon.ico carries every Windows size so Explorer, Desktop, taskbar, Start Menu and high-DPI all get a crisp icon', () => {
  const buf = fs.readFileSync(path.join(root, 'assets/icon.ico'));
  const dir = readIcoDirectory(buf);
  assert.deepEqual(dir.map((d) => d.width).sort((a, b) => b - a), [256, 128, 64, 48, 40, 32, 24, 20, 16], 'including 20 and 24, the title bar and taskbar sizes at 125% and 150% display scaling');
  for (const e of dir) {
    assert.equal(e.width, e.height);
    assert.equal(e.bpp, 32);
    assert.ok(e.isPng, `${e.width}px entry is a PNG image`);
    assert.ok(buf.subarray(e.offset, e.offset + 8).equals(PNG_SIG));
    assert.ok(e.offset + e.bytes <= buf.length, 'entry lies inside the file');
    // The PNG's own IHDR must agree with the directory entry.
    const ihdr = buf.subarray(e.offset + 16, e.offset + 24);
    assert.equal(ihdr.readUInt32BE(0), e.width);
    assert.equal(ihdr.readUInt32BE(4), e.height);
  }
});

test('the window\'s own icon on Windows is the multi-size .ico shipped with the app, so the title bar gets the bold 16/20/24px image and not the 256px PNG shrunk', () => {
  const shipped = path.join(root, 'apps/web/assets/icon.ico');
  assert.ok(fs.existsSync(shipped), 'icon.ico is inside the folder that is packaged as resources/web');
  assert.ok(fs.readFileSync(shipped).equals(fs.readFileSync(path.join(root, 'assets/icon.ico'))), 'the same file the installer and the exe use');
  const main = fs.readFileSync(path.join(root, 'apps/desktop/main.js'), 'utf8');
  assert.match(main, /process\.platform === 'win32' \? 'icon\.ico' : 'icon\.png'/);
  assert.match(main, /icon: iconPath/);
});

test('ICO packer lays out directory and data correctly', () => {
  const fake = (n) => ({ size: n, png: Buffer.concat([PNG_SIG, Buffer.alloc(8 + n)]) });
  const ico = packIco(SIZES.map(fake));
  const dir = readIcoDirectory(ico);
  assert.equal(dir.length, SIZES.length);
  assert.equal(dir[0].width, 256);
  let expectedOffset = 6 + 16 * SIZES.length;
  for (const e of dir) {
    assert.equal(e.offset, expectedOffset);
    expectedOffset += e.bytes;
  }
  assert.equal(ico.length, expectedOffset);
});

test('installer wizard images are real BMPs with the sizes Inno Setup expects', () => {
  for (const [file, w, h] of [['wizard-large.bmp', 164, 314], ['wizard-small.bmp', 55, 58]]) {
    const b = fs.readFileSync(path.join(root, 'assets', file));
    assert.equal(b.toString('latin1', 0, 2), 'BM');
    assert.equal(b.readInt32LE(18), w);
    assert.equal(b.readInt32LE(22), h);
    assert.equal(b.readUInt16LE(28), 24);
    assert.equal(b.length, b.readUInt32LE(2));
  }
  // 2×2: top row red, green; bottom row blue, fully transparent. BMP stores rows bottom-up, pixels as BGR, rows padded to 4 bytes.
  const px = new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 255, 0]);
  const bmp = packBmp24(2, 2, px);
  assert.deepEqual([...bmp.subarray(54, 54 + 6)], [255, 0, 0, 255, 255, 255], 'bottom row first: blue, then transparent flattened onto white');
  assert.deepEqual([...bmp.subarray(54 + 8, 54 + 14)], [0, 0, 255, 0, 255, 0], 'then the top row: red, green');
});

test('the installer\'s side panel carries the mark and the name and nothing else: no line of text under the product name', () => {
  const b = fs.readFileSync(path.join(root, 'assets/wizard-large.bmp'));
  const w = b.readInt32LE(18);
  const h = b.readInt32LE(22);
  const rowBytes = Math.ceil((w * 3) / 4) * 4;
  const rowRange = (yTop) => {
    const o = 54 + (h - 1 - yTop) * rowBytes; // rows run bottom-up
    let widest = 0;
    for (let c = 0; c < 3; c++) { // per colour channel: the blue, green and red of cream differ from each other by design
      let min = 255;
      let max = 0;
      for (let x = 0; x < w; x++) { min = Math.min(min, b[o + x * 3 + c]); max = Math.max(max, b[o + x * 3 + c]); }
      widest = Math.max(widest, max - min);
    }
    return widest;
  };
  // The three lines of the name run from y=202 to about 270; below that the panel is plain cream (its background gradient moves a few levels, text moves dozens).
  for (let y = 282; y < h; y += 3) assert.ok(rowRange(y) < 14, `row ${y} of the panel is plain background (range ${rowRange(y)})`);
  assert.ok(Math.max(...Array.from({ length: 60 }, (_, k) => rowRange(205 + k))) > 40, 'while the name\'s own lines are there');
  const src = fs.readFileSync(path.join(root, 'scripts/build-icons.mjs'), 'utf8');
  assert.doesNotMatch(src, /CYAN AGE/i, 'the generator no longer draws a publisher line');
});

test('the logo is the latte-cream wave mark, and the small variant drops the text for legibility', () => {
  const full = fs.readFileSync(path.join(root, 'assets/logo.svg'), 'utf8');
  const small = fs.readFileSync(path.join(root, 'assets/logo-small.svg'), 'utf8');
  assert.match(full, /aria-label="NIE"/);
  assert.match(full, /radialGradient/);
  assert.match(full, /<line x1="250"/, 'the central divider');
  assert.ok((full.match(/<path/g) ?? []).length >= 7, 'tangled strands, the clean wave, and the NIE letterforms');
  assert.ok((small.match(/<path/g) ?? []).length < (full.match(/<path/g) ?? []).length, 'fewer, bolder strokes');
  assert.ok(!/NIE<\/text>/.test(full), 'letters are outlines, so they render identically everywhere');
  assert.ok(fs.existsSync(path.join(root, 'apps/web/assets/mark.svg')));
});
