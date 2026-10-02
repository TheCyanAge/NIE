/** ICO container with PNG-compressed images (Windows Vista+). One entry per size so every DPI/surface gets a crisp icon. */
export const SIZES = [256, 128, 64, 48, 32, 16];

export function packIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  const dir = Buffer.alloc(16 * images.length);
  let offset = 6 + dir.length;
  images.forEach(({ size, png }, i) => {
    const e = 16 * i;
    dir.writeUInt8(size >= 256 ? 0 : size, e); // width (0 means 256)
    dir.writeUInt8(size >= 256 ? 0 : size, e + 1); // height
    dir.writeUInt8(0, e + 2); // palette
    dir.writeUInt8(0, e + 3);
    dir.writeUInt16LE(1, e + 4); // planes
    dir.writeUInt16LE(32, e + 6); // bits per pixel
    dir.writeUInt32LE(png.length, e + 8);
    dir.writeUInt32LE(offset, e + 12);
    offset += png.length;
  });
  return Buffer.concat([header, dir, ...images.map((i) => i.png)]);
}

/** Parse an ICO's directory (used by tests to prove every size is present). */
export function readIcoDirectory(buf) {
  if (buf.readUInt16LE(0) !== 0 || buf.readUInt16LE(2) !== 1) throw new Error('not an ICO');
  const n = buf.readUInt16LE(4);
  return Array.from({ length: n }, (_, i) => {
    const e = 6 + 16 * i;
    const w = buf[e] || 256;
    const h = buf[e + 1] || 256;
    const bytes = buf.readUInt32LE(e + 8);
    const offset = buf.readUInt32LE(e + 12);
    const isPng = buf.subarray(offset, offset + 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    return { width: w, height: h, bytes, offset, isPng, bpp: buf.readUInt16LE(e + 6) };
  });
}

/** 24-bit uncompressed BMP from RGBA pixels (alpha is flattened onto white). Inno Setup's wizard images must be BMPs. */
export function packBmp24(width, height, rgba) {
  const rowBytes = Math.ceil((width * 3) / 4) * 4;
  const pixels = Buffer.alloc(rowBytes * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const a = rgba[i + 3] / 255;
      const o = (height - 1 - y) * rowBytes + x * 3; // BMP rows run bottom-up, pixels are BGR
      pixels[o] = Math.round(rgba[i + 2] * a + 255 * (1 - a));
      pixels[o + 1] = Math.round(rgba[i + 1] * a + 255 * (1 - a));
      pixels[o + 2] = Math.round(rgba[i] * a + 255 * (1 - a));
    }
  }
  const head = Buffer.alloc(54);
  head.write('BM', 0, 'latin1');
  head.writeUInt32LE(54 + pixels.length, 2);
  head.writeUInt32LE(54, 10);
  head.writeUInt32LE(40, 14);
  head.writeInt32LE(width, 18);
  head.writeInt32LE(height, 22);
  head.writeUInt16LE(1, 26);
  head.writeUInt16LE(24, 28);
  head.writeUInt32LE(pixels.length, 34);
  head.writeInt32LE(2835, 38);
  head.writeInt32LE(2835, 42);
  return Buffer.concat([head, pixels]);
}
