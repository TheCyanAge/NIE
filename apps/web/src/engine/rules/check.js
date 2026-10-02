import { mk } from '../analysis/finding.js';
import { paragraphPov, paragraphTense } from '../analysis/detectors/voice.js';
import { parseRule, termRe } from './parse.js';
import { NAMED_PATTERNS, tokenMatches } from './lexicon.js';
import { WORD_RE, words, clip } from '../util/text.js';

/**
 * Find where the text breaks the writer's rules. This module only LOCATES text: each violation is an exact
 * character range in the manuscript plus a brief reason. It never produces, suggests or edits any prose.
 */

const PER_RULE_CAP = 25;
const NEG_WORDS = new Set(['never', 'not', "didn't", 'didnt', 'refused', "wouldn't", "couldn't", 'wouldn’t', 'couldn’t', 'didn’t', 'no', 'without', 'avoided', 'nor', 'neither', 'unable', 'unwilling', 'declined']);

const norm = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim();
const brief = (s, n = 150) => clip(s.replace(/\s+/g, ' ').trim(), n);

/** Class for exact vs. approximate pattern checks. */
const APPROXIMATE_PATTERNS = new Set(['adverbs', 'passive', 'cliches', 'similes']);

function violation(ctx, rule, { start, end, why, cls, method, confidence = 0.9, match = null, extraKey = '' }) {
  const sentence = ctx.sentences.find((s) => s.start <= start && s.end >= start);
  const where = ctx.locate(start);
  const quote = sentence?.text ?? ctx.text.slice(start, end);
  return mk({
    detector: 'rule',
    category: 'rule',
    class: cls,
    title: brief(rule.text, 90),
    message: why,
    quote,
    start,
    end,
    sceneIndex: ctx.sceneOf(start),
    confidence,
    // Stable across rescans, distinct for each occurrence: rule + sentence + offset inside the sentence.
    key: `${rule.id}:${norm(quote)}@${start - (sentence?.start ?? start)}${extraKey}`,
    meta: { ruleId: rule.id, ruleText: rule.text, method, match, line: where.line, column: where.column, sentenceStart: sentence?.start ?? start, sentenceEnd: sentence?.end ?? end },
    source: method === 'model' ? 'model' : 'rules',
  });
}

function runForbid(ctx, rule, part, out) {
  for (const term of part.terms) {
    for (const m of ctx.text.matchAll(termRe(term))) {
      out.push(violation(ctx, rule, { start: m.index, end: m.index + m[0].length, why: `"${m[0]}" is ruled out by this rule.`, cls: 'hard-conflict', method: 'pattern', match: m[0] }));
    }
  }
}

function runTerminology(ctx, rule, part, out) {
  for (const m of ctx.text.matchAll(termRe(part.avoid))) {
    out.push(violation(ctx, rule, { start: m.index, end: m.index + m[0].length, why: `"${m[0]}" — this rule says to use "${part.prefer}".`, cls: 'hard-conflict', method: 'pattern', match: m[0] }));
  }
}

function runPattern(ctx, rule, part, out) {
  const p = NAMED_PATTERNS.find((x) => x.id === part.id);
  if (!p) return;
  const re = new RegExp(p.re.source, p.re.flags.includes('g') ? p.re.flags : p.re.flags + 'g');
  for (const m of ctx.text.matchAll(re)) {
    if (!m[0] || (p.accept && !p.accept(m))) continue;
    out.push(
      violation(ctx, rule, {
        start: m.index,
        end: m.index + m[0].length,
        why: `"${brief(m[0], 40)}" — ${p.label} are ruled out.`.replace('adverbs (-ly words) are', 'adverbs are'),
        cls: APPROXIMATE_PATTERNS.has(p.id) ? 'likely-issue' : 'hard-conflict',
        method: 'pattern',
        match: m[0],
      })
    );
  }
}

function runLimit(ctx, rule, part, out) {
  const { unit, metric, dir, n } = part;
  if (unit === 'sentence') {
    for (const s of ctx.sentences) {
      const wc = words(s.text).length;
      const bad = dir === 'max' ? wc > n : wc < n;
      if (bad) out.push(violation(ctx, rule, { start: s.start, end: s.end, why: dir === 'max' ? `${wc}-word sentence; your limit is ${n}.` : `Only ${wc} words; your minimum is ${n}.`, cls: 'hard-conflict', method: 'pattern', match: s.text }));
    }
  } else {
    for (const p of ctx.paragraphs) {
      const v = metric === 'sentences' ? p.sentences.length : p.wordCount;
      const bad = dir === 'max' ? v > n : v < n;
      if (bad) out.push(violation(ctx, rule, { start: p.start, end: p.end, why: dir === 'max' ? `${v} ${metric} in this paragraph; your limit is ${n}.` : `Only ${v} ${metric}; your minimum is ${n}.`, cls: 'hard-conflict', method: 'pattern', match: p.text.slice(0, 80) }));
    }
  }
}

function runPovOrTense(ctx, rule, part, out) {
  const classify = part.kind === 'pov' ? paragraphPov : paragraphTense;
  const noun = part.kind === 'pov' ? 'person' : 'tense';
  for (const p of ctx.paragraphs) {
    if (p.narrationWords < 12) continue;
    const label = classify(p.narration);
    if (!label) continue;
    const bad = (part.wanted.length && !part.wanted.includes(label)) || part.banned.includes(label);
    if (!bad) continue;
    const allowed = part.wanted.length ? `your rule allows only ${part.wanted.join('/')} ${noun}` : `you ruled out ${part.banned.join('/')} ${noun}`;
    out.push(violation(ctx, rule, { start: p.start, end: p.end, why: `Reads as ${label} ${noun}; ${allowed}.`, cls: 'likely-issue', method: 'pattern', confidence: 0.7, match: p.text.slice(0, 80) }));
  }
}

/** Offline approximation for negative meaning-based rules ("Samantha never lies"). Candidates only. */
function runKeyword(ctx, rule, sem, characters, out) {
  let subjectTokens = null;
  if (sem.subject) {
    const aliases = characters
      .filter((c) => [c.name, ...(c.aliases ?? [])].some((n) => n.toLowerCase() === sem.subject.label.toLowerCase()))
      .flatMap((c) => [c.name, ...(c.aliases ?? [])].flatMap((n) => n.toLowerCase().split(/\s+/)));
    subjectTokens = [...new Set([...sem.subject.tokens, ...aliases])];
  }
  const sents = ctx.sentences;
  const toks = sents.map((s) => (s.text.match(WORD_RE) ?? []).map((w) => w.toLowerCase()));
  for (let i = 0; i < sents.length; i++) {
    const w = toks[i];
    const hitGroups = sem.groups.filter((g) => w.some((t) => tokenMatches(t, g)));
    if (hitGroups.length < sem.need) continue;
    const here = !subjectTokens || w.some((t) => tokenMatches(t, subjectTokens));
    // A sentence that starts with a pronoun continues the previous sentence's subject; one with its own name does not.
    const prev = !here && i > 0 && /^(?:she|he|they|her|his|their)\b/i.test(sents[i].text) && sents[i - 1].paragraph === sents[i].paragraph && toks[i - 1].some((t) => tokenMatches(t, subjectTokens));
    if (!here && !prev) continue;
    // "Samantha never went near the water" respects the rule — skip when a negation precedes the keyword.
    const firstHit = w.findIndex((t) => hitGroups.some((g) => tokenMatches(t, g)));
    if (w.slice(Math.max(0, firstHit - 6), firstHit).some((t) => NEG_WORDS.has(t))) continue;
    const kw = w[firstHit];
    out.push(
      violation(ctx, rule, {
        start: sents[i].start,
        end: sents[i].end,
        why: `Keyword match: ${sem.subject ? `${sem.subject.label} + ` : ''}"${kw}". Check it against this rule.`,
        cls: 'possible-issue',
        method: 'keyword',
        confidence: here ? 0.5 : 0.35,
        match: sents[i].text,
      })
    );
  }
}

/**
 * @returns {{ findings: object[], items: object[] }}
 *   items: one entry per rule saying how it was understood and how it was (or wasn't) checked.
 */
export function checkRules(ctx, rules) {
  const findings = [];
  const items = [];
  const characters = ctx.memory?.characters ?? [];

  for (const rule of rules) {
    const parsed = parseRule(rule.text);
    const base = { id: rule.id, text: rule.text, category: rule.category, understood: parsed.understood, method: parsed.method };
    if (!rule.enabled) {
      items.push({ ...base, state: 'disabled', count: 0 });
      continue;
    }
    const out = [];
    for (const part of parsed.parts) {
      if (part.kind === 'forbid') runForbid(ctx, rule, part, out);
      else if (part.kind === 'terminology') runTerminology(ctx, rule, part, out);
      else if (part.kind === 'pattern') runPattern(ctx, rule, part, out);
      else if (part.kind === 'limit') runLimit(ctx, rule, part, out);
      else if (part.kind === 'pov' || part.kind === 'tense') runPovOrTense(ctx, rule, part, out);
    }
    let state = 'checked';
    if (parsed.semantic) {
      if (parsed.semantic.checkable === 'keyword') {
        runKeyword(ctx, rule, parsed.semantic, characters, out);
        state = 'approximate';
      } else state = 'needs-model';
    }
    out.sort((a, b) => a.start - b.start);
    const truncated = out.length > PER_RULE_CAP;
    findings.push(...out.slice(0, PER_RULE_CAP));
    items.push({ ...base, state, count: out.length, total: out.length, truncated, semantic: Boolean(parsed.semantic) });
  }
  return { findings, items };
}

export { runKeyword };
