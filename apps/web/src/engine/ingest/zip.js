/**
 * Minimal ZIP reader (enough for DOCX, ODT and EPUB). Uses the platform's DecompressionStream, so it runs
 * unchanged in browsers, Web Workers and Node 22. ZIP64 and encryption are not supported (reported clearly).
 */

const u16 = (b, o) => b[o] | (b[o + 1] << 8);
const u32 = (b, o) => (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;
const utf8 = new TextDecoder('utf-8');

async function inflateRaw(data) {
  const ds = new DecompressionStream('deflate-raw');
  const stream = new Blob([data]).stream().pipeThrough(ds);
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

export function isZip(bytes) {
  return bytes.length > 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && (bytes[2] === 0x03 || bytes[2] === 0x05) && (bytes[3] === 0x04 || bytes[3] === 0x06);
}

export async function readZip(input) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  // End of central directory record.
  let eocd = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 22 - 65535); i--) {
    if (u32(bytes, i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error('This does not look like a valid ZIP-based file (no directory found).');
  const count = u16(bytes, eocd + 10);
  let p = u32(bytes, eocd + 16);
  if (count === 0xffff || p === 0xffffffff) throw new Error('ZIP64 archives are not supported.');

  const entries = new Map();
  for (let n = 0; n < count; n++) {
    if (u32(bytes, p) !== 0x02014b50) throw new Error('The ZIP directory is damaged.');
    const flags = u16(bytes, p + 8);
    const method = u16(bytes, p + 10);
    const csize = u32(bytes, p + 20);
    const usize = u32(bytes, p + 24);
    const nameLen = u16(bytes, p + 28);
    const extraLen = u16(bytes, p + 30);
    const commentLen = u16(bytes, p + 32);
    const offset = u32(bytes, p + 42);
    const name = utf8.decode(bytes.subarray(p + 46, p + 46 + nameLen));
    entries.set(name, { name, flags, method, csize, usize, offset });
    p += 46 + nameLen + extraLen + commentLen;
  }

  async function read(name) {
    const e = entries.get(name);
    if (!e) return null;
    if (e.flags & 1) throw new Error('This file is password-protected.');
    if (u32(bytes, e.offset) !== 0x04034b50) throw new Error('The ZIP file is damaged.');
    const start = e.offset + 30 + u16(bytes, e.offset + 26) + u16(bytes, e.offset + 28);
    const raw = bytes.subarray(start, start + e.csize);
    if (e.method === 0) return raw;
    if (e.method === 8) return inflateRaw(raw);
    throw new Error(`Unsupported ZIP compression method ${e.method}.`);
  }

  return {
    names: () => [...entries.keys()],
    has: (n) => entries.has(n),
    read,
    async text(name) {
      const b = await read(name);
      return b ? utf8.decode(b) : null;
    },
  };
}
