import { NAMED_PATTERNS, GENERIC, expandWord } from './lexicon.js';
import { WORD_RE } from '../util/text.js';

/**
 * Understand a rule the writer typed in plain language.
 *
 * Returns what NIE will actually check, so the writer can see (and correct) how a rule was read:
 *   parts     — exact, pattern-based checks (forbidden words, limits, POV, tense, terminology…)
 *   semantic  — a meaning-based rule ("Samantha never lies"). Checked by the language model when available;
 *               offline it is approximated by keywords (negative rules only) and labelled as such.
 * NIE only ever *locates* text that breaks a rule. Nothing here produces or edits prose.
 */

const NEGATIVE = /\b(?:never|cannot|can'?t|can not|won'?t|will not|would not|wouldn'?t|doesn'?t|does not|don'?t|do not|must not|mustn'?t|should not|shouldn'?t|isn'?t|is not|aren'?t|are not|no|not|nobody|none|without|refuses? to|avoids?|avoid|ban(?:ned)?|forbid(?:den)?|prohibit(?:ed)?)\b/i;
const NEG_NEAR = /\b(?:never|no|not|don'?t|do not|avoid|without|can'?t|cannot|mustn'?t|must not|shouldn'?t|should not|stop|ban|forbid)\b[^.;]{0,25}$/i;

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const termRe = (t) => new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(t.trim()).replace(/\s+/g, '\\s+')}(?![\\p{L}\\p{N}])`, 'giu');

export function quotedTerms(text) {
  const out = [];
  for (const m of text.matchAll(/["“]([^"”\n]{1,60})["”]/g)) out.push(m[1].trim());
  for (const m of text.matchAll(/(?:^|[\s(])['‘]([^'’\n]{1,60})['’](?=[\s.,;:)!?]|$)/g)) out.push(m[1].trim());
  return [...new Set(out.filter(Boolean))];
}

const cache = new Map();

export function parseRule(raw) {
  const text = String(raw ?? '').trim();
  if (!cache.has(text)) cache.set(text, parseUncached(text));
  return cache.get(text);
}

function result(text, parts, semantic, understood, method) {
  return { text, parts, semantic, understood, method };
}

function parseUncached(text) {
  if (!text) return result(text, [], null, 'Empty rule.', 'none');

  // 1) Terminology: use "A" not "B"; "B" must be called "A".
  const t1 = text.match(/\b(?:use|say|write|spell|call it)\s+["“‘']([^"”’']+)["”’']\s*,?\s*(?:not|instead of|rather than|never)\s+["“‘']([^"”’']+)["”’']/i);
  const t2 = text.match(/["“‘']([^"”’']+)["”’']\s+(?:must|should|has to|needs to)\s+(?:always\s+)?be\s+(?:called|named|spelled|written|referred to as)\s+["“‘']([^"”’']+)["”’']/i);
  const term = t1 ? { prefer: t1[1], avoid: t1[2] } : t2 ? { prefer: t2[2], avoid: t2[1] } : null;
  if (term) {
    return result(text, [{ kind: 'terminology', ...term }], null, `Flags "${term.avoid}" — your rule says to use "${term.prefer}".`, 'pattern');
  }

  const parts = [];
  const notes = [];

  // 2) Length limits.
  const limit = parseLimit(text);
  if (limit) {
    parts.push(limit);
    notes.push(`${limit.unit}s ${limit.dir === 'max' ? 'over' : 'under'} ${limit.n} ${limit.metric}`);
  }

  // 3) POV and 4) tense.
  for (const [kind, re] of [['pov', /\b(first|second|third)[- ]person\b/gi], ['tense', /\b(past|present|future)[- ]tense\b/gi]]) {
    const wanted = new Set();
    const banned = new Set();
    for (const m of text.matchAll(re)) {
      const before = text.slice(0, m.index);
      (NEG_NEAR.test(before) ? banned : wanted).add(m[1].toLowerCase());
    }
    if (wanted.size || banned.size) {
      parts.push({ kind, wanted: [...wanted], banned: [...banned] });
      notes.push(`${kind === 'pov' ? 'point of view' : 'tense'}: ${[...wanted].map((w) => `${w} only`).concat([...banned].map((b) => `never ${b}`)).join(', ')}`);
    }
  }

  // 5) Named patterns ("no adverbs", "avoid exclamation marks").
  const negative = NEGATIVE.test(text);
  for (const p of NAMED_PATTERNS) {
    if (!p.when.test(text)) continue;
    if (!negative && !p.standalone) continue;
    if (p.id === 'dialogue' && /\b(?:in|with)\s+(?:quotation marks|quotes)\b/i.test(text)) continue; // "dialogue must be in quotes" is a different rule
    parts.push({ kind: 'pattern', id: p.id });
    notes.push(`no ${p.label}`);
  }

  // 6) Quoted or "the word X" forbidden terms.
  if (negative && !parts.some((p) => p.kind === 'pov' || p.kind === 'tense')) {
    let terms = quotedTerms(text);
    if (!terms.length) {
      const m = text.match(/\b(?:the\s+)?(?:words?|phrases?|terms?)\s+(.+?)\s*[.!]?$/i);
      if (m) terms = m[1].split(/\s*(?:,|\bor\b|\band\b)\s*/i).map((s) => s.replace(/^["“‘'\s]+|["”’'\s.]+$/g, '')).filter((s) => s && s.split(/\s+/).length <= 4);
    }
    if (!terms.length) {
      // "Never say okay." — imperative + a short bare term.
      const m = text.match(/^\s*(?:never|don'?t|do not|avoid|no)\s+(?:use|using|say|saying|write|writing|include|including|put)\s+([A-Za-z][\w'’-]*(?:\s+[A-Za-z][\w'’-]*){0,2})\s*[.!]?$/i);
      if (m && !/^(?:the|a|an|any|more|too|much|many|them|it|this|that)\b/i.test(m[1]) && !NAMED_PATTERNS.some((p) => p.when.test(m[1]))) terms = [m[1].trim()];
    }
    if (terms.length) {
      parts.push({ kind: 'forbid', terms });
      notes.push(`never use ${terms.map((t) => `"${t}"`).join(' or ')}`);
    }
  }

  if (parts.length) return result(text, parts, null, `Checked as: ${notes.join('; ')}.`, 'pattern');

  // 7) Meaning-based rule.
  return parseSemantic(text);
}

function parseLimit(text) {
  const unit = /\bparagraphs?\b/i.test(text) ? 'paragraph' : /\bsentences?\b/i.test(text) ? 'sentence' : null;
  if (!unit) return null;
  const num = text.match(/\b(\d{1,4})\b/);
  if (!num) return null;
  const n = Number(num[1]);
  const sentencesMetric = unit === 'paragraph' && new RegExp(`${n}\\s+sentences?`, 'i').test(text);
  const maxCue = /\b(?:no|not|never)\b[^.]*?\b(?:longer|more|over|above|exceed\w*)\b|\b(?:under|below|less than|at most|max(?:imum)?|no more than|up to|shorter than|within|exceed\w*)\b/i;
  const minCue = /\b(?:at least|minimum|min\b|no (?:fewer|less|shorter)|must be longer than|should be longer than)\b/i;
  const dir = minCue.test(text) ? 'min' : maxCue.test(text) ? 'max' : null;
  if (!dir) return null;
  return { kind: 'limit', unit, metric: sentencesMetric ? 'sentences' : 'words', dir, n };
}

function parseSemantic(text) {
  const polarity = NEGATIVE.test(text) ? 'negative' : 'positive';
  let subject = null;
  let rest = text;

  const m = text.match(
    /^\s*(?:(?:the|a|an)\s+)?((?:[A-Z][\w'’-]*)(?:\s+[A-Z][\w'’-]*){0,2}|[a-z][\w-]*(?:\s+[a-z][\w-]*)?)\s+(?:(?:would|will|should|must|can|could|may|might|does|do|did|is|are|was|were|has|have|had)\s+)?(?:never|always|cannot|can't|can not|won't|doesn't|does not|don't|isn't|aren't|only|refuses|avoids|would|will|should|must|can|could|is|are|has|have)\b/
  );
  const alt = text.match(/^\s*(?:never|don'?t|do not|no)\s+(?:let|allow|have|show|make)\s+([A-Z][\w'’-]*)\b/i);
  if (m) {
    subject = m[1];
    rest = text.slice(m[0].length);
  } else if (alt) {
    subject = alt[1];
    rest = text.slice(alt[0].length);
  }

  const words = (rest.match(WORD_RE) ?? []).map((w) => w.toLowerCase()).filter((w) => w.length >= 3 && !GENERIC.has(w)).slice(0, 4);
  const groups = [...new Map(words.map((w) => [w, expandWord(w)])).values()];
  const subjectTokens = subject ? [...new Set(expandWord(subject.toLowerCase().split(/\s+/).at(-1)))] : [];
  const subjectLabel = subject ?? null;

  const keywordable = polarity === 'negative' && groups.length > 0;
  const semantic = {
    subject: subjectLabel ? { label: subjectLabel, tokens: subjectTokens } : null,
    polarity,
    words,
    groups,
    need: Math.min(2, groups.length),
    checkable: keywordable ? 'keyword' : 'model',
  };

  const understood = keywordable
    ? `Looks for sentences where ${[subjectLabel, ...words.map((w) => `"${w}"`)].filter(Boolean).join(' + ')} appear together (offline keyword match; the language model judges these properly when it is running).`
    : 'This rule is about meaning, so it needs the language model to check. It is not checked offline.';
  return result(text, [], semantic, understood, semantic.checkable);
}

export { termRe };
