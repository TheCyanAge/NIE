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
  assert.deepEqual(dir.map((d) => d.width).sort((a, b) => b - a), [256, 128, 64, 48, 32, 16]);
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
