import { createProjectData } from '../apps/web/src/engine/project/store.js';
import { detectIntent } from '../apps/web/src/engine/intent/intent.js';
import { taskOfIntent } from '../apps/web/src/engine/orchestrator/understand.js';

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

/** The writer's message as it appears inside a "what does the writer mean?" prompt. */
export const messageOfReading = (messages) => messages.at(-1).content.match(/"""\n([\s\S]*?)\n"""/)?.[1] ?? '';

/**
 * Wrap a fake model's chat function so it also answers the "what does the writer mean?" call. By default it answers the way the rules
 * read the message, so older tests keep their meaning; pass `reading(text, messages)` to script it (return an Error to make the call fail).
 * Reading calls go to `reads`, never to `calls`, so tests that count or inspect the ANSWER calls see only those.
 * Notes calls (purpose 'notes' | 'overview') answer with a note made of the section's own first words and names, unless `note(sectionText)` scripts them.
 * The idea agent's reading of an idea into its sheet (purpose 'extract') goes to `extractCalls` and answers "nothing found" (so the rules read it), unless `extract(messages)` scripts it.
 */
export function modelWithReading(replyFn, { calls = [], reads = [], reading = null, noteCalls = [], extractCalls = [], extract = null, note = null, overview = 'This text is told in several parts and follows a few named people. It is organised in numbered sections, each taking up one thread.' } = {}) {
  return async (messages, opts) => {
    // The section-by-section reading ("notes") and the overview made from it are their own calls too: they go to `noteCalls`, never to `calls`.
    if (opts?.purpose === 'notes' || opts?.purpose === 'overview') {
      noteCalls.push({ messages, opts });
      if (opts.purpose === 'overview') return typeof overview === 'function' ? overview(messages) : overview;
      const part = messageOfReading(messages);
      const r = note ? note(part, messages) : { gist: (part.match(/[^.!?]+[.!?]?/)?.[0] ?? part).trim().split(/\s+/).slice(0, 14).join(' ') || 'A part of the text.', names: [...new Set(part.match(/\b[A-Z][a-z]{2,}\b/g) ?? [])].slice(0, 4), terms: [], voice: 'plain, matter-of-fact' };
      if (r instanceof Error) throw r;
      return typeof r === 'string' ? r : JSON.stringify(r);
    }
    if (opts?.purpose === 'extract') {
      extractCalls.push({ messages, opts });
      const r = extract ? extract(messages, opts) : { updates: [], extra: [] };
      if (r instanceof Error) throw r;
      return typeof r === 'string' ? r : JSON.stringify(r);
    }
    if (opts?.purpose === 'understand') {
      reads.push({ messages, opts });
      const text = messageOfReading(messages);
      // A message the rules call plain "discuss" is a general question if it is shaped like one ("What is…?"), otherwise a conversation.
      const fallback = /^\s*(?:what|who|how|which|when|explain|define)\b/i.test(text) ? 'craft' : 'develop';
      const r = reading ? reading(text, messages) : { task: taskOfIntent(detectIntent(text).type) ?? fallback, topic: '' };
      if (r instanceof Error) throw r;
      return typeof r === 'string' ? r : JSON.stringify(r);
    }
    calls.push({ messages, opts });
    return replyFn(messages, calls.length);
  };
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
