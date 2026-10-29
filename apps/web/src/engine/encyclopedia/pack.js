import fs from 'node:fs';
import zlib from 'node:zlib';
import { pushVarint, readVarint } from './varint.js';
import { terms, titleKey, titleKeys } from './tokens.js';
import { definitionSubject } from './define.js';
import { tidyLead } from './grounding.js';
import { articleUrl, wikipediaTarget } from '../web/wikipedia.js';

/**
 * The offline encyclopedia: one file, built once from a Wikipedia dump and searched on the writer's own computer. Nothing leaves the machine when it is used.
 *
 *   'NIEPACK1' | u32 headerLength | header (JSON) | sections...
 *   blocks    the articles (title and lead text), 128 to a block, each block deflated, so one article costs one small read
 *   blockIdx  where each block starts (u32 each)
 *   lens      u16 per article: how many terms it has (for BM25)
 *   ranks     u8 per article: how prominent it is (0 to 255); article 0 is the most prominent
 *   dict      the index terms, sorted, one per line, deflated
 *   dictMeta  three u32 per term: how many articles have it, where its postings start, how long they are
 *   postings  per term: article numbers (as gaps) and counts, as varints
 *   keys/keyIds  the names an article is found by (its title, the title without a bracketed part, redirects), sorted, deflated, with the article each names
 *
 * Article numbers follow prominence, so a tie in the score goes to the more prominent article. Text is Wikipedia's, CC BY-SA: the header carries the licence and where to find authors.
 */

const MAGIC = 'NIEPACK1';
export const PACK_VERSION = 1;
// How a question is scored. Chosen on the real Simple English pack (120,000 articles) with scripts/encyclopedia-eval.mjs: 60 tuning questions and 39 never tuned on.
// Before (b 0.75, prior 0.2^1): right article in the top 3 for 83% of the tuning questions (average rank 0.804) and 90% of the others (0.905).
// Now: 90% (0.851) and 92% (0.906); asking for the names in the question too (`titles`) makes it 92% (0.858) and 95% (0.919), better in all eight pairs compared. Length normalisation is almost off because every lead is clipped to one window, so a long lead is not a wordier article;
// the prominence boost is concentrated on the most-read articles (a power of 8), which is where a short question about a famous thing most likely points.
// What it cannot do: a question whose answer is not named in it ("capital of Italy") finds articles about Italy, not Rome.
export const TUNING = Object.freeze({ k1: 1.2, b: 0.15, priorWeight: 1, priorPower: 8, titles: true });
const TITLE_WEIGHT = 3;

const u32 = (arr) => Buffer.from(Uint32Array.from(arr).buffer);
const u16 = (arr) => Buffer.from(Uint16Array.from(arr).buffer);
const asArray = (buf, Type) => {
  const copy = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
  return new Type(copy);
};
const MAX_HEADER = 1 << 20;
const MAX_DOCS = 5_000_000;
const MAX_BLOCK_TEXT = 32 << 20;
const MAX_INDEX_TEXT = 512 << 20;
const SECTION_NAMES = ['blocks', 'blockIdx', 'lens', 'ranks', 'dict', 'dictMeta', 'postings', 'keys', 'keyIds'];

/** A pack file is data the writer picked, so its header is checked against the file before anything large is read. */
function checkHeader(h, size) {
  const bad = (why) => new Error(`This encyclopedia pack is damaged (${why}).`);
  if (!h || typeof h !== 'object' || !h.sections || typeof h.sections !== 'object') throw bad('no section table');
  if (!Number.isInteger(h.docs) || h.docs < 1 || h.docs > MAX_DOCS) throw bad('article count');
  if (!Number.isInteger(h.terms) || h.terms < 0 || h.terms > 50_000_000) throw bad('term count');
  if (!Number.isInteger(h.blockDocs) || h.blockDocs < 1 || h.blockDocs > 4096) throw bad('block size');
  if (!(h.avgLen > 0)) throw bad('average length');
  for (const k of SECTION_NAMES) {
    const sec = h.sections[k];
    if (!sec || !Number.isInteger(sec.off) || !Number.isInteger(sec.len) || sec.off < 0 || sec.len < 0 || sec.off + sec.len > size) throw new Error('The encyclopedia pack is cut short (the download did not finish).');
  }
  const S = h.sections;
  if (S.lens.len !== h.docs * 2 || S.ranks.len !== h.docs) throw bad('article tables');
  if (S.blockIdx.len !== Math.ceil(h.docs / h.blockDocs) * 4) throw bad('block table');
  if (S.dictMeta.len !== h.terms * 12) throw bad('term table');
}

const deflate = (s) => zlib.deflateSync(Buffer.isBuffer(s) ? s : Buffer.from(s, 'utf8'), { level: 9 });

/**
 * @param {{ title: string, text: string, rank: number, aliases?: string[] }[]} docs   `text` is the lead of the article, as plain text
 * @param {{ name: string, lang?: string, source?: string, builtAt?: string, blockDocs?: number }} o
 * @returns {Buffer}
 */
export function buildPack(docs, { name, lang = 'en', source = '', builtAt = '', blockDocs = 128, title = '' } = {}) {
  const list = [...docs].sort((a, b) => b.rank - a.rank || (a.title < b.title ? -1 : 1));
  const N = list.length;
  if (!N) throw new Error('A pack needs at least one article.');
  const lens = new Array(N);
  const ranks = new Uint8Array(N);
  const postings = new Map(); // term → { ids: number[], tfs: number[] }
  let totalLen = 0;
  list.forEach((d, id) => {
    const counts = new Map();
    const bump = (t, n) => counts.set(t, (counts.get(t) ?? 0) + n);
    let len = 0;
    for (const t of terms(d.title)) {
      bump(t, TITLE_WEIGHT);
      len += 1;
    }
    for (const t of terms(d.text)) {
      bump(t, 1);
      len += 1;
    }
    lens[id] = Math.min(65535, len);
    totalLen += lens[id];
    ranks[id] = 255 - Math.floor((255 * id) / Math.max(1, N - 1));
    for (const [t, n] of counts) {
      let p = postings.get(t);
      if (!p) postings.set(t, (p = { ids: [], tfs: [] }));
      p.ids.push(id);
      p.tfs.push(Math.min(255, n));
    }
  });

  const dictTerms = [...postings.keys()].sort();
  const post = [];
  const meta = [];
  for (const t of dictTerms) {
    const p = postings.get(t);
    const start = post.length;
    let prev = 0;
    for (let i = 0; i < p.ids.length; i++) {
      pushVarint(post, p.ids[i] - prev);
      pushVarint(post, p.tfs[i]);
      prev = p.ids[i];
    }
    meta.push(p.ids.length, start, post.length - start);
  }

  const blocks = [];
  const blockIdx = [];
  let at = 0;
  for (let i = 0; i < N; i += blockDocs) {
    const z = deflate(JSON.stringify(list.slice(i, i + blockDocs).map((d) => [d.title, d.text])));
    blockIdx.push(at);
    blocks.push(z);
    at += z.length;
  }

  const keyMap = new Map();
  list.forEach((d, id) => {
    for (const k of [...titleKeys(d.title), ...(d.aliases ?? []).flatMap((a) => [titleKey(a)])]) if (k && !keyMap.has(k)) keyMap.set(k, id);
  });
  const keys = [...keyMap.keys()].sort();

  const sections = {
    blocks: Buffer.concat(blocks),
    blockIdx: u32(blockIdx),
    lens: u16(lens),
    ranks: Buffer.from(ranks),
    dict: deflate(dictTerms.join('\n')),
    dictMeta: u32(meta),
    postings: Buffer.from(post),
    keys: deflate(keys.join('\n')),
    keyIds: u32(keys.map((k) => keyMap.get(k))),
  };
  const header = { magic: MAGIC, version: PACK_VERSION, name, title: String(title ?? '').slice(0, 80), lang, source, builtAt, docs: N, terms: dictTerms.length, blockDocs, avgLen: totalLen / N, license: 'CC BY-SA 4.0', attribution: `Text from Wikipedia (https://${lang}.wikipedia.org), CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/). Each article's authors are listed in its page history on Wikipedia.`, sections: {} };
  // offsets are absolute and the header's own length depends on them (digits): write it until its length stops changing
  const place = (base) => {
    let off = base;
    for (const [k, buf] of Object.entries(sections)) {
      header.sections[k] = { off, len: buf.length };
      off += buf.length;
    }
  };
  let headerBytes = null;
  let hl = 0;
  for (let i = 0; i < 8 && !headerBytes; i++) {
    place(MAGIC.length + 4 + hl);
    const b = Buffer.from(JSON.stringify(header), 'utf8');
    if (b.length === hl) headerBytes = b;
    hl = b.length;
  }
  if (!headerBytes) throw new Error('The pack header did not settle.');
  const head = Buffer.alloc(MAGIC.length + 4);
  head.write(MAGIC, 0, 'latin1');
  head.writeUInt32LE(headerBytes.length, MAGIC.length);
  return Buffer.concat([head, headerBytes, ...Object.values(sections)]);
}

/** A way to read a range of the pack, from memory (tests) or from a file (the real thing). */
async function openReader(source) {
  if (Buffer.isBuffer(source)) return { size: source.length, read: async (off, len) => source.subarray(off, off + len), close: async () => {} };
  const fh = await fs.promises.open(source, 'r');
  const { size } = await fh.stat();
  return {
    size,
    read: async (off, len) => {
      const buf = Buffer.alloc(len);
      const { bytesRead } = await fh.read(buf, 0, len, off);
      return bytesRead === len ? buf : buf.subarray(0, bytesRead);
    },
    close: () => fh.close(),
  };
}

export class Pack {
  /** @param {string|Buffer} source a pack file's path, or its bytes */
  static async open(source) {
    const reader = await openReader(source);
    const head = await reader.read(0, MAGIC.length + 4);
    if (head.length < MAGIC.length + 4 || head.toString('latin1', 0, MAGIC.length) !== MAGIC) {
      await reader.close();
      throw new Error('This is not an encyclopedia pack.');
    }
    const hl = head.readUInt32LE(MAGIC.length);
    if (hl < 2 || hl > MAX_HEADER || MAGIC.length + 4 + hl > reader.size) {
      await reader.close();
      throw new Error('The encyclopedia pack is cut short (the download did not finish).');
    }
    let header;
    try {
      header = JSON.parse((await reader.read(MAGIC.length + 4, hl)).toString('utf8'));
    } catch {
      await reader.close();
      throw new Error('This encyclopedia pack is damaged (header).');
    }
    if (header.version !== PACK_VERSION) {
      await reader.close();
      throw new Error(`This encyclopedia pack is version ${header.version}; this NIE reads version ${PACK_VERSION}.`);
    }
    try {
      checkHeader(header, reader.size);
    } catch (err) {
      await reader.close();
      throw err;
    }
    try {
      const sec = async (k) => {
        const s = header.sections[k];
        const buf = await reader.read(s.off, s.len);
        if (buf.length !== s.len) throw new Error('The encyclopedia pack is cut short (the download did not finish).');
        return buf;
      };
      const pack = new Pack(reader, header);
      pack.lens = asArray(await sec('lens'), Uint16Array);
      pack.ranks = new Uint8Array(await sec('ranks'));
      pack.blockIdx = asArray(await sec('blockIdx'), Uint32Array);
      pack.dictMeta = asArray(await sec('dictMeta'), Uint32Array);
      pack.keyIds = asArray(await sec('keyIds'), Uint32Array);
      const inflate = (buf, max = MAX_INDEX_TEXT) => zlib.inflateSync(buf, { maxOutputLength: max });
      const dict = inflate(await sec('dict')).toString('utf8').split('\n');
      if (dict.length !== header.terms && !(header.terms === 0 && dict.length === 1)) throw new Error('This encyclopedia pack is damaged (term list).');
      pack.termIndex = new Map(dict.map((t, i) => [t, i]));
      pack.keysText = inflate(await sec('keys')).toString('utf8').split('\n');
      if (pack.keyIds.length !== pack.keysText.length && !(pack.keysText.length === 1 && pack.keysText[0] === '' && pack.keyIds.length === 0)) throw new Error('This encyclopedia pack is damaged (name table).');
      return pack;
    } catch (err) {
      await reader.close();
      throw /encyclopedia pack/.test(String(err?.message)) ? err : new Error('This encyclopedia pack is damaged (it could not be read).');
    }
  }

  constructor(reader, header) {
    this.reader = reader;
    this.header = header;
    this.cache = new Map();
    this.keyIndex = null;
  }

  get info() {
    const { name, title, lang, docs, terms: t, source, builtAt, license, attribution } = this.header;
    return { name, title: typeof title === 'string' ? title : '', lang, docs, terms: t, source, builtAt, license, attribution, bytes: this.reader.size };
  }

  async close() {
    await this.reader.close();
  }

  async #block(n) {
    const hit = this.cache.get(n);
    if (hit) {
      this.cache.delete(n);
      this.cache.set(n, hit);
      return hit;
    }
    const s = this.header.sections.blocks;
    const from = this.blockIdx[n];
    const to = n + 1 < this.blockIdx.length ? this.blockIdx[n + 1] : s.len;
    const rows = JSON.parse(zlib.inflateSync(await this.reader.read(s.off + from, to - from), { maxOutputLength: MAX_BLOCK_TEXT }).toString('utf8'));
    this.cache.set(n, rows);
    if (this.cache.size > 24) this.cache.delete(this.cache.keys().next().value);
    return rows;
  }

  /** @returns {Promise<{ id: number, title: string, text: string, url: string } | null>} */
  async get(id) {
    if (!Number.isInteger(id) || id < 0 || id >= this.header.docs) return null;
    const rows = await this.#block(Math.floor(id / this.header.blockDocs));
    const row = rows[id % this.header.blockDocs];
    // (an older pack still has Wikipedia's leftovers in its leads: "{\displaystyle c}", "Lua error ...", "This short article can be made longer"; they are taken out as it is read)
    return row ? { id, title: row[0], text: tidyLead(row[1]), url: articleUrl(row[0], this.header.lang) } : null;
  }

  /** The article known by exactly this name (its title, the title without brackets, a redirect to it), or null. */
  findTitle(name) {
    const k = titleKey(name);
    const idx = (this.keyIndex ??= new Map(this.keysText.map((key, i) => [key, i])));
    for (const key of [k, k.replace(/^(?:the|a|an) /, '')]) {
      const i = idx.get(key);
      if (i !== undefined) return this.keyIds[i];
    }
    return null;
  }

  /** The article at a Wikipedia address, if it is in the pack. */
  async readUrl(url) {
    const t = wikipediaTarget(url);
    if (!t || t.lang !== this.header.lang) return null;
    const id = this.findTitle(t.title);
    return id === null ? null : this.get(id);
  }

  /**
   * An article whose name is exactly the question ("Eiffel Tower") or exactly the thing a "what is X" question asks about comes first; then BM25 over title (weighted three times) and lead,
   * the more prominent article winning ties, with a bonus for an article that has every word of the question. `tune` overrides `TUNING` (the evaluation script tries several).
   * @returns {Promise<{ id: number, title: string, url: string, snippet: string, score: number }[]>}
   */
  async search(query, { limit = 6, tune = null } = {}) {
    const n = Math.max(1, Math.min(20, Math.floor(limit) || 6));
    const t = { ...TUNING, ...(tune ?? {}) };
    let ranked = await this.#bm25(query, t);
    const named = t.titles ? this.#titlesIn(query) : { long: [], short: [] };
    if (named.short.length) ranked = this.#liftNamed(ranked, named.short);
    const exact = [];
    for (const name of [query, definitionSubject(query, { bare: true })]) {
      const id = name ? this.findTitle(name) : null;
      if (id !== null && !exact.includes(id)) exact.push(id);
    }
    const top = ranked[0]?.score ?? 1;
    // an article whose name is words of the question ("Great Fire of London" in "what caused the Great Fire of London") comes right after one named exactly like the whole question
    for (const id of named.long) if (!exact.includes(id)) exact.push(id);
    const merged = [...exact.map((id, i) => ({ id, score: top * (1.5 - i * 0.1) })), ...ranked.filter((r) => !exact.includes(r.id))].slice(0, n);
    const out = [];
    for (const r of merged) {
      const d = await this.get(r.id);
      if (d) out.push({ id: d.id, title: d.title, url: d.url, snippet: d.text.length > 300 ? `${d.text.slice(0, 299).replace(/\s+\S*$/, '')}…` : d.text, score: r.score });
    }
    return out;
  }

  /**
   * The articles named by words of the question: the longest names first and not overlapping ("Great Fire of London" and not also "Fire" and "London"); a name of one word only lifts an article
   * the search found or adds one (a one-word name is too often a generic article: Death, Fire, Revolution).
   */
  #titlesIn(query) {
    const ws = String(query).match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) ?? [];
    const used = new Set();
    const long = [];
    const short = [];
    for (let n = Math.min(6, ws.length); n >= 1; n--) {
      for (let i = 0; i + n <= ws.length; i++) {
        if ([...Array(n).keys()].some((k) => used.has(i + k))) continue;
        const gram = ws.slice(i, i + n).join(' ');
        if (!terms(gram, { question: true }).length || (n === 1 && gram.length < 4)) continue;
        const id = this.findTitle(gram);
        if (id === null) continue;
        for (let k = 0; k < n; k++) used.add(i + k);
        (n >= 2 ? long : short).push(id);
      }
    }
    return { long: long.slice(0, 2), short: short.slice(0, 2) };
  }

  #liftNamed(ranked, ids) {
    const top = ranked[0]?.score ?? 1;
    const out = ranked.map((r) => (ids.includes(r.id) ? { ...r, score: r.score * 1.6 } : r));
    for (const id of ids) if (!out.some((r) => r.id === id)) out.push({ id, score: top * 0.5 });
    return out.sort((a, b) => b.score - a.score || a.id - b.id);
  }

  async #bm25(query, { k1, b, priorWeight, priorPower }) {
    const wanted = [...new Set(terms(query, { question: true }))];
    const N = this.header.docs;
    const entries = wanted.map((t) => ({ t, i: this.termIndex.get(t) })).filter((e) => e.i !== undefined).map((e) => ({ ...e, df: this.dictMeta[e.i * 3] }));
    if (!entries.length) return [];
    entries.sort((a, b) => a.df - b.df);
    const useful = entries.filter((e) => e.df <= N * 0.4);
    const use = useful.length ? useful : entries.slice(0, 1);
    const scores = new Map();
    const matched = new Map();
    const ps = this.header.sections.postings;
    for (const e of use) {
      const df = this.dictMeta[e.i * 3];
      const buf = await this.reader.read(ps.off + this.dictMeta[e.i * 3 + 1], this.dictMeta[e.i * 3 + 2]);
      const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
      let at = 0;
      let id = 0;
      while (at < buf.length) {
        let r = readVarint(buf, at);
        id += r.value;
        r = readVarint(buf, r.next);
        const tf = r.value;
        at = r.next;
        if (id >= N) throw new Error('This encyclopedia pack is damaged (index).');
        const norm = tf + k1 * (1 - b + (b * this.lens[id]) / this.header.avgLen);
        scores.set(id, (scores.get(id) ?? 0) + (idf * tf * (k1 + 1)) / norm);
        matched.set(id, (matched.get(id) ?? 0) + 1);
      }
    }
    return [...scores]
      .map(([id, sc]) => ({ id, score: sc * (0.4 + 0.6 * (matched.get(id) / use.length)) * (1 + priorWeight * (this.ranks[id] / 255) ** priorPower) }))
      .sort((a, b) => b.score - a.score || a.id - b.id)
      .slice(0, 40);
  }
}
