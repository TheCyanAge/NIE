import readline from 'node:readline';
import { buildPack } from './pack.js';
import { parseDocLine, rankingField, toEntry } from './cirrus.js';
import { TopN } from './select.js';

/**
 * A Wikipedia CirrusSearch dump (an async stream of text, already unzipped) → the bytes of an encyclopedia pack holding the `maxDocs` most prominent articles.
 * Memory is bounded by `maxDocs`, not by the dump.
 * @param {AsyncIterable<string|Buffer>|import('node:stream').Readable} stream
 * @param {{ name: string, title?: string, lang?: string, source?: string, builtAt?: string, maxDocs?: number, maxLead?: number, rankBy?: 'auto'|'popularity_score'|'incoming_links', onProgress?: (p: { read: number, kept: number }) => void }} o
 * @returns {Promise<{ bytes: Buffer, docs: number, read: number, rankBy: string }>}
 */
export async function buildFromDump(stream, { name, title = '', lang = 'en', source = '', builtAt = '', maxDocs = 120000, maxLead = 1200, rankBy = 'auto', onProgress } = {}) {
  const top = new TopN(maxDocs);
  const head = [];
  let field = rankBy === 'auto' ? null : rankBy;
  let read = 0;
  const take = (doc) => {
    read++;
    const entry = toEntry(doc, { maxLead, rankBy: field });
    if (entry) top.add(entry);
    if (onProgress && read % 20000 === 0) onProgress({ read, kept: top.heap.length });
  };
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  for await (const line of rl) {
    const doc = parseDocLine(line);
    if (!doc) continue;
    if (!field) {
      head.push(doc);
      if (head.length < 500) continue;
      field = rankingField(head);
      for (const d of head.splice(0)) take(d);
      continue;
    }
    take(doc);
  }
  if (!field) {
    field = rankingField(head);
    for (const d of head.splice(0)) take(d);
  }
  const entries = top.result();
  if (!entries.length) throw new Error('The dump held no articles NIE could use. Check that it is a CirrusSearch content dump.');
  const bytes = buildPack(entries, { name, title, lang, source, builtAt });
  return { bytes, docs: entries.length, read, rankBy: field };
}
