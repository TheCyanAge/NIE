import { createProjectData } from '../apps/web/src/engine/project/store.js';

export function projectWith({ profile = {}, memory = {}, storyText = '', title = 'Test' } = {}) {
  const p = createProjectData({ title, storyText });
  p.profile = {
    ...p.profile,
    ...profile,
    identity: { ...p.profile.identity, ...(profile.identity ?? {}) },
    genre: { ...p.profile.genre, ...(profile.genre ?? {}) },
    style: { ...p.profile.style, ...(profile.style ?? {}) },
    narrative: { ...p.profile.narrative, ...(profile.narrative ?? {}) },
  };
  p.memory = { ...p.memory, ...memory };
  return p;
}

export const para = (...sentences) => sentences.join(' ');

import { addRule } from '../apps/web/src/engine/rules/rules.js';

/** Add plain-language rules to a project (strings, or { text, category }). */
export function withRules(project, rules) {
  for (const r of rules) addRule(project, typeof r === 'string' ? { text: r } : r);
  return project;
}

// ── tiny ZIP/PDF writers so ingestion tests build real files ─────────────────
import zlib from 'node:zlib';

function crc32(buf) {
  let c;
  let crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/** files: { name: string|Buffer }. method 8 (deflate) by default; `stored: [names]` stores those uncompressed. */
export function makeZip(files, { stored = [] } = {}) {
  const locals = [];
  const central = [];
  let offset = 0;
  for (const [name, content] of Object.entries(files)) {
    const data = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8');
    const method = stored.includes(name) ? 0 : 8;
    const comp = method === 0 ? data : zlib.deflateRawSync(data);
    const nameBuf = Buffer.from(name, 'utf8');
    const crc = crc32(data);
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0, 6); lh.writeUInt16LE(method, 8);
    lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(comp.length, 18); lh.writeUInt32LE(data.length, 22); lh.writeUInt16LE(nameBuf.length, 26);
    locals.push(lh, nameBuf, comp);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(method, 10);
    ch.writeUInt32LE(crc, 16); ch.writeUInt32LE(comp.length, 20); ch.writeUInt32LE(data.length, 24); ch.writeUInt16LE(nameBuf.length, 28); ch.writeUInt32LE(offset, 42);
    central.push(ch, nameBuf);
    offset += lh.length + nameBuf.length + comp.length;
  }
  const cd = Buffer.concat(central);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); eocd.writeUInt16LE(Object.keys(files).length, 8); eocd.writeUInt16LE(Object.keys(files).length, 10);
  eocd.writeUInt32LE(cd.length, 12); eocd.writeUInt32LE(offset, 16);
  return new Uint8Array(Buffer.concat([...locals, cd, eocd]));
}

/** A one-page PDF whose content stream is Flate-compressed (or not). `lines` become separate text lines. */
export function makePdf(lines, { compress = true } = {}) {
  const esc = (s) => s.replace(/([()\\])/g, '\\$1');
  const content = 'BT\n/F1 12 Tf\n72 720 Td\n14 TL\n' + lines.map((l) => `(${esc(l)}) Tj T*`).join('\n') + '\nET\n';
  const body = compress ? zlib.deflateSync(Buffer.from(content, 'latin1')) : Buffer.from(content, 'latin1');
  const parts = [
    Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Contents 4 0 R >>\nendobj\n4 0 obj\n'),
    Buffer.from(`<< /Length ${body.length}${compress ? ' /Filter /FlateDecode' : ''} >>\nstream\n`),
    body,
    Buffer.from('\nendstream\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n'),
  ];
  return new Uint8Array(Buffer.concat(parts));
}

export const bytes = (s, enc = 'utf8') => new Uint8Array(Buffer.from(s, enc));
