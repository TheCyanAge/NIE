import { tidyLead } from './grounding.js';

/**
 * Reading a Wikipedia CirrusSearch content dump (the search index Wikipedia itself builds from every article). One article is two lines of JSON: an `index` line, then the document.
 * The fields used: title, namespace, opening_text (the lead, plain text), text (the whole article, plain text), redirect (titles that lead here), popularity_score or incoming_links.
 * Only the lead of each article is kept, so a pack stays small enough to download, and every article's text is Wikipedia's own, never reworded.
 */

const MAX_LEAD_DEFAULT = 1400;
const MIN_LEAD = 80;

/** One line of a dump → the document, or null for an `index` line, a blank line or something that is not JSON. */
export function parseDocLine(line) {
  const s = String(line ?? '').trim();
  if (!s || s[0] !== '{') return null;
  let o;
  try {
    o = JSON.parse(s);
  } catch {
    return null;
  }
  return o && typeof o === 'object' && !o.index && !o.create && typeof o.title === 'string' ? o : null;
}

/** Cut at a sentence end, at most `max` characters; a lead with no sentence end inside the limit is cut at a word. */
export function clipLead(text, max = MAX_LEAD_DEFAULT) {
  const t = String(text ?? '');
  if (t.length <= max) return t;
  const head = t.slice(0, max);
  const ends = [...head.matchAll(/[.!?]["')\]]?(?=\s+[A-Z0-9"'(])/g)];
  const last = ends.length ? ends[ends.length - 1] : null;
  if (last && last.index + last[0].length >= max * 0.5) return head.slice(0, last.index + last[0].length).trim();
  return `${head.replace(/\s+\S*$/, '')}…`;
}

/** The lead as plain readable text: whitespace collapsed, the empty brackets that pronunciations and dates leave behind removed, nothing else changed. */
export function cleanLead(text) {
  return tidyLead(String(text ?? ''))
    .replace(/\r/g, '')
    .replace(/\s*\n+\s*/g, ' ')
    .replace(/\(\s*(?:[;,]\s*)*\)/g, '')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/\[\s*\d{1,3}\s*\]/g, '')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

const NOT_AN_ARTICLE = /^(?:list|lists|index|outline|timeline|glossary|template|category|file|wikipedia|portal|help|draft|module|mediawiki|user)(?: of|:)/i;
const REFERS = /\b(?:may|can|could) (?:also )?refer to\b|\bis a disambiguation page\b/i;

/**
 * The document a dump line stands for, ready for the pack, or null when it should not be in it: not an article (another namespace), a redirect, a disambiguation page, a list,
 * or a lead too short to say anything.
 * @returns {{ title: string, text: string, rank: number, aliases: string[] } | null}
 */
export function toEntry(doc, { maxLead = MAX_LEAD_DEFAULT, rankBy = 'popularity_score' } = {}) {
  if (!doc || doc.namespace !== 0 && doc.namespace !== undefined) return null;
  const title = String(doc.title ?? '').trim();
  if (!title || title.length > 160 || NOT_AN_ARTICLE.test(title)) return null;
  let lead = String(doc.opening_text ?? '').trim();
  if (!lead && typeof doc.text === 'string') lead = doc.text.split(/\n{2,}|\n/).find((p) => p.trim().length >= MIN_LEAD) ?? '';
  lead = cleanLead(lead);
  if (lead.length < MIN_LEAD || REFERS.test(lead.slice(0, 400))) return null;
  // popularity_score is a share of all page views (tiny numbers); incoming_links is a count. Either orders a dump's articles; one build uses one of them for every article.
  const value = Number(doc[rankBy]);
  const rank = Number.isFinite(value) && value > 0 ? value : 0;
  const aliases = (Array.isArray(doc.redirect) ? doc.redirect : [])
    .map((r) => (r && (r.namespace === 0 || r.namespace === undefined) ? String(r.title ?? '').trim() : ''))
    .filter((t) => t && t.length <= 120 && t !== title)
    .slice(0, 12);
  return { title, text: clipLead(lead, maxLead), rank, aliases };
}

/** The ranking field a dump has, found by looking at its first documents: 'popularity_score' when they carry it, otherwise 'incoming_links'. */
export function rankingField(sample) {
  return sample.some((d) => Number(d?.popularity_score) > 0) ? 'popularity_score' : 'incoming_links';
}
