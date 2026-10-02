import { mk } from '../finding.js';
import { levenshtein, words } from '../../util/text.js';

/**
 * Character-name consistency. A name that appears once or twice in a form one or two letters away from
 * a name used often (or listed in project memory) is probably a slip.
 */
export function names(ctx) {
  const known = new Map(); // lowercase → canonical
  for (const c of ctx.memory.characters ?? []) {
    known.set(c.name.toLowerCase(), c.name);
    for (const a of c.aliases ?? []) known.set(String(a).toLowerCase(), c.name);
  }

  const lowerSeen = new Set((ctx.text.match(/\b[a-z]{3,}\b/g) ?? []));
  const caps = new Map(); // token → {count, mid, positions[]}
  for (const m of ctx.text.matchAll(/\b[A-Z][a-z]{3,}\b/g)) {
    const before = ctx.text.slice(Math.max(0, m.index - 3), m.index);
    const sentenceStart = m.index === 0 || /(?:^|[.!?…]["”’)]?\s+|\n\s*|["“]\s*)$/.test(before);
    const e = caps.get(m[0]) ?? { count: 0, mid: 0, positions: [] };
    e.count++;
    if (!sentenceStart) e.mid++;
    e.positions.push(m.index);
    caps.set(m[0], e);
  }

  const canon = [];
  for (const [tok, e] of caps) {
    if (known.has(tok.toLowerCase())) canon.push({ name: known.get(tok.toLowerCase()), count: e.count, fromMemory: true });
    else if (e.mid >= 3 && !lowerSeen.has(tok.toLowerCase())) canon.push({ name: tok, count: e.count, fromMemory: false });
  }

  const out = [];
  for (const [tok, e] of caps) {
    if (e.count > 2 || known.has(tok.toLowerCase()) || lowerSeen.has(tok.toLowerCase())) continue;
    for (const c of canon) {
      if (c.name === tok || c.name[0] !== tok[0]) continue;
      const allowed = Math.max(c.name.length, tok.length) >= 7 ? 2 : 1;
      if (levenshtein(c.name.toLowerCase(), tok.toLowerCase(), allowed) > allowed) continue;
      if (!c.fromMemory && c.count < e.count * 3) continue;
      const pos = e.positions[0];
      out.push(
        mk({
          detector: 'names',
          category: 'continuity',
          class: c.fromMemory ? 'likely-issue' : 'possible-issue',
          title: `"${tok}" vs "${c.name}"`,
          message: `I see "${tok}" here, but ${c.fromMemory ? 'your project has' : 'the story otherwise uses'} "${c.name}"${c.count > 1 ? ` (${c.count}×)` : ''}. Same character, or a different one?`,
          quote: ctx.sentenceAround(pos),
          start: pos,
          end: pos + tok.length,
          sceneIndex: ctx.sceneOf(pos),
          question: `Is "${tok}" a typo for "${c.name}", or someone else?`,
          confidence: c.fromMemory ? 0.8 : 0.6,
          key: `${tok}->${c.name}`,
        })
      );
      break;
    }
  }
  return out.slice(0, 6);
}

/** Candidate character names for the "remember these?" prompt, strongest first. */
export function candidateNames(text, limit = 12) {
  const counts = new Map();
  const lower = new Set(text.match(/\b[a-z]{3,}\b/g) ?? []);
  for (const m of text.matchAll(/\b[A-Z][a-z]{2,}\b/g)) {
    const before = text.slice(Math.max(0, m.index - 3), m.index);
    const sentenceStart = m.index === 0 || /(?:^|[.!?…]["”’)]?\s+|\n\s*|["“]\s*)$/.test(before);
    const e = counts.get(m[0]) ?? { count: 0, mid: 0 };
    e.count++;
    if (!sentenceStart) e.mid++;
    counts.set(m[0], e);
  }
  return [...counts.entries()]
    .filter(([w, e]) => e.mid >= 2 && !lower.has(w.toLowerCase()) && words(w).length === 1)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit)
    .map(([name, e]) => ({ name, count: e.count }));
}
