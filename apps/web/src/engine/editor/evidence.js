import { estimateTokens } from '../util/text.js';
import { castLine, dialogueLine, neutralLine, rulesNote, standouts, styleLine, termsLine } from './findings.js';

/**
 * Editorial evidence: the measured facts the model is given to reason over and cite, chosen by what the writer asked.
 *
 * A 3B model cannot judge pacing, consistency or a cast of twelve from the few passages it is shown, and it invents when it tries. The program has already
 * counted: `analyseText` measured the text, and this module turns the part of that which bears on the question into at most six short lines, each citing
 * sections (1-based), each true of the Analysis, hedged where it is only a possibility, and none saying anything about quality.
 */

const MAX_LINES = 6;

// Word cues in the writer's message. The order of the cues in the message is the order of the lines.
const CUES = [
  ['pacing', /\b(?:pac(?:e|es|ed|ing)|slow(?:s|ly|er|ing)?|fast(?:er)?|rhythm|tempo|drag(?:s|ged|ging)?|sag(?:s|ging)?|rush(?:ed|ing)?|length|lengths|long(?:er)?|short(?:er)?|balance[ds]?|dialogue|sentence length)\b/i],
  ['consistency', /\b(?:consisten\w*|inconsisten\w*|contradict\w*|continuity|timelines?|chronolog\w*|same|differ\w*|numbers?|figures?|conflict\w*|mismatch\w*|typos?|misspell\w*|spell(?:ing|ed|s)?|how (?:many|much))\b/i],
  ['cast', /\b(?:who|cast|characters?|appear\w*|protagonists?|names?|disappear\w*|vanish\w*|drops? out|people)\b/i],
  ['voice', /\b(?:voice|tense|pov|point of view|person|tone|style|narrat\w*|first person|third person|second person)\b/i],
  ['rules', /\b(?:rules?|break\w*|violat\w*|allowed|forbid\w*|forbidden|against my)\b/i],
  ['repeats', /\b(?:repeat\w*|tics?|echo\w*|overus\w*|again and again|repetit\w*|recur\w*)\b/i],
  ['terms', /\b(?:terms?|glossary|jargon|vocabulary|coined|invented words?|made-up words?)\b/i],
  ['bundle', /\b(?:whole|overall|feedback|read it|thoughts?|summary|summar\w*|general|everything|review|critique|what do you think|opinion|assess\w*)\b/i],
];

/** Which instruments a message is about, in the order it mentions them ('bundle' when it asks about the whole text or about nothing in particular). */
export function topicsOf(query) {
  const q = typeof query === 'string' ? query : '';
  const found = [];
  for (const [id, re] of CUES) {
    const m = re.exec(q);
    if (m) found.push({ id, at: m.index });
  }
  const topics = found.sort((a, b) => a.at - b.at).map((f) => f.id);
  return topics.length ? topics : ['bundle'];
}

const LABEL = { terms: 'Terms', pacing: 'Pacing', figures: 'Figures', timeline: 'Timeline', names: 'Names', cast: 'Names', voice: 'Voice', rules: 'Rules', repeats: 'Repeats' };
const line = (instrument, text, extra = {}) => ({ instrument, label: extra.label ?? LABEL[instrument] ?? instrument, text, ...extra });
const sentence = (l) => `${l.label}: ${String(l.text).trim().replace(/[.;:,\s]+$/, '')}.`;

/** What stands out in an instrument (every finding of it), or a plain measurement when nothing does and `neutral` allows one. */
function ofInstrument(a, found, instrument, { neutral = true, max = 2 } = {}) {
  const own = found.filter((f) => f.instrument === instrument).slice(0, max);
  if (own.length) return own.map((f) => line(instrument, f.text, { id: f.id }));
  const n = neutral ? neutralLine(a, instrument) : null;
  return n ? [line(instrument, n)] : [];
}

function castLines(a, found) {
  const list = castLine(a);
  return [...(list ? [line('cast', list)] : []), ...found.filter((f) => f.instrument === 'cast').slice(0, 1).map((f) => line('cast', f.text, { id: f.id }))];
}

function styleLines(a) {
  const s = styleLine(a);
  return s ? [line('voice', s, { label: 'Style' })] : [];
}

function ruleLines(a, found) {
  if (!a.rules) return [line('rules', 'no rules were available to check any section against')];
  const own = found.find((f) => f.instrument === 'rules');
  const note = rulesNote(a);
  const text = own ? (note ? `${own.text}. ${note}` : own.text) : neutralLine(a, 'rules');
  return text ? [line('rules', text, own ? { id: own.id } : {})] : [];
}

/** The lines a topic asks for. */
function linesOf(topic, a, found, query) {
  switch (topic) {
    case 'pacing': {
      const lines = ofInstrument(a, found, 'pacing');
      const d = /\b(?:dialogue|talk|speech|spoken|conversation)\b/i.test(query) ? dialogueLine(a) : null;
      return d ? [...lines, line('pacing', d, { label: 'Dialogue' })] : lines;
    }
    case 'consistency':
      return [
        ...ofInstrument(a, found, 'figures', { max: 2 }),
        ...ofInstrument(a, found, 'timeline', { neutral: (a.timeline?.stamps?.length ?? 0) >= 3 }),
        ...ofInstrument(a, found, 'names', { neutral: /\b(?:typos?|misspell\w*|spell\w*)\b/i.test(query) }),
        ...ofInstrument(a, found, 'voice', { neutral: false, max: 1 }),
      ];
    case 'cast':
      return castLines(a, found);
    case 'voice':
      return [...ofInstrument(a, found, 'voice', { max: 1 }), ...styleLines(a)];
    case 'rules':
      return ruleLines(a, found);
    case 'repeats':
      return ofInstrument(a, found, 'repeats');
    case 'terms': {
      const list = termsLine(a, 6);
      return list ? [line('terms', `the terms that keep coming back are ${list}`)] : [];
    }
    default:
      return [];
  }
}

/** The balanced bundle: the strongest finding of each instrument, then what is always true of the text (its names, its style, its rules, its pacing). */
function bundleLines(a, found) {
  const out = [];
  const seen = new Set();
  for (const f of found) {
    const inst = f.instrument === 'names' ? 'names' : f.instrument;
    if (seen.has(inst)) continue;
    seen.add(inst);
    out.push(inst === 'rules' ? ruleLines(a, [f])[0] : line(inst, f.text, { id: f.id }));
  }
  if (!seen.has('cast')) out.push(...castLines(a, []).slice(0, 1));
  out.push(...styleLines(a));
  if (a.rules && !seen.has('rules')) out.push(...ruleLines(a, []));
  if (!seen.has('pacing')) out.push(...ofInstrument(a, [], 'pacing').slice(0, 1));
  return out;
}

/**
 * @param {{ analysis: object, query?: string, reading?: object|null, budgetTokens?: number, project?: object|null }} o
 *   `reading` and `project` are accepted so the caller can pass what it has; the evidence depends only on the analysis (which already holds the project's rules).
 * @returns {{ block: string, used: string[], stats: object }}  `block` is '' when there is nothing measured to say or no room for it.
 */
export function editorialEvidence(opts) {
  const { analysis, query = '', budgetTokens = 420 } = opts && typeof opts === 'object' ? opts : {};
  const a = analysis;
  const q = typeof query === 'string' ? query : '';
  const topics = topicsOf(q);
  const stats = { lines: 0, tokens: 0, topics, instruments: [], sections: a?.covered?.sections ?? 0, of: a?.covered?.of ?? 0, complete: Boolean(a?.covered?.complete), words: a?.words ?? 0 };
  if (!a || typeof a !== 'object' || !Array.isArray(a.sections) || !a.sections.length || !a.covered || !(budgetTokens > 0)) return { block: '', used: [], stats };

  const found = standouts(a);
  const queue = [];
  const add = (list) => {
    for (const l of list) if (l.text && !queue.some((x) => x.text === l.text)) queue.push(l);
  };
  for (const t of topics) if (t !== 'bundle') add(linesOf(t, a, found, q));
  if (topics.includes('bundle') || queue.length === 0) add(bundleLines(a, found));

  const covered = a.covered.complete ? '' : `; only the first ${a.covered.sections} of ${a.covered.of} sections were measured`;
  const header = `Measured from the text itself (counted by the program, not judged; section numbers are 1-based${covered}):`;
  const render = (list) => [header, ...list.map((l) => `- ${sentence(l)}`)].join('\n');
  const kept = [];
  for (const l of queue.slice(0, MAX_LINES)) {
    if (estimateTokens(render([...kept, l])) > budgetTokens) break;
    kept.push(l);
  }
  if (!kept.length) return { block: '', used: [], stats };
  const block = render(kept);
  const used = [...new Set(kept.map((l) => l.instrument))];
  return { block, used, stats: { ...stats, lines: kept.length, tokens: estimateTokens(block), instruments: used, ids: kept.map((l) => l.id).filter(Boolean) } };
}
