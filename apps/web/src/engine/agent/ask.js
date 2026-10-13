import { isStockQuestion, similarity, splitSentencesLite } from '../orchestrator/variety.js';
import { STOPWORDS, fnv1a } from '../util/text.js';
import { slotsFor } from './detect.js';
import { fillQuestion } from './packs/schema.js';
import { slotForRole } from './sheet.js';
import { slotValue, squash, stemList } from './state.js';

/**
 * Asking: turning a slot's bank of questions into ONE question about this writer's own project, and keeping a model's reply to the plan.
 *
 * Questions come from the packs (written ahead of time, checked by the schema); the writer's own names and phrases are slotted into them. NIE never
 * composes a question of its own here. `enforceReply` only REMOVES whole sentences from a model's reply, or swaps a question for the bank question;
 * it never rewords, so what the writer reads is either the model's words or a prepared question, never an edit of either.
 */

const hash = (...parts) => parseInt(fnv1a(parts.join('|')), 16);
const SAME_QUESTION = 0.6; // as alike as this to a question already asked is a repeat
const REPLY_SIMILAR = 0.5; // the looser test for a model's question

// ── the writer's own words, shaped to slot into a question ───────────────────

export const clean = (v) => squash(v).replace(/[?"“”`]/g, '').replace(/^[\s,;:.\-–—]+|[\s,;:\-–—]+$/g, '');
const ARTICLES = new Set(['the', 'his', 'her', 'their', 'my', 'our', 'your', 'this', 'that', 'these', 'those', 'its', 'some']);
const PRONOUNS = new Set(['i', 'me', 'myself', 'we', 'us', 'she', 'he', 'they', 'it', 'you', 'no', 'nobody', 'none', 'nothing', 'everyone', 'everything', 'someone', 'something', 'anyone', 'nowhere', 'everywhere', 'anywhere', 'somewhere', 'elsewhere', 'here', 'there', 'somebody', 'anybody', 'whoever']);
const CAP_RUN = String.raw`\p{Lu}[\p{L}'’-]*(?:\s+\p{Lu}[\p{L}'’-]*){0,2}`;
export const CLAUSE = /[,;:()—–]|\s+(?:who|that|which|whose|where|when|while|because|but|and|with|after|before|until|as|is|was|are|were|has|had|wants?|needs?|must|can|will|gets?|goes?|tries|tried|hopes?|keeps?|finds?|hears?|sees?|knows?)\s+/i;
const PLACE_CUT = /\s+(?:in|on|at|near|by|beside|behind|under|above|below|inside|outside|during|from|of|off|across|along|over|beyond|past|between|among|within|beneath|through|into|onto)\s+/i;
// How writers (and the no-model rules, which keep the whole sentence) introduce a slot's value: "It is set in X", "The theme is X", "A story about X".
// Stripping the lead-in leaves the writer's own noun phrase to slot into a question; if nothing usable is left the question uses the neutral wording.
const PLACE_LEADS = [
  /^(?:it|this|that|the (?:story|book|novel|poem|piece|film|play|script|world|scene|setting)|everything)(?:'s|\s+is|\s+takes place|\s+happens|\s+unfolds|\s+begins|\s+starts|\s+opens)?\s+/i,
  /^(?:is\s+)?(?:set|takes place|happens|unfolds|begins|starts|opens)\s+/i,
  /^(?:in|at|on|inside|aboard|beneath|under|outside|near|behind|within|around|across|from|to)\s+/i,
];
const THING_LEADS = [
  /^(?:it(?:'s|\s+is)|this\s+is|that(?:'s|\s+is)|the\s+(?:story|book|poem|piece|idea|plot|premise)\s+is)\s+(?:mostly\s+|mainly\s+|really\s+)?(?:about\s+)?/i,
  /^(?:an?|the|my|our)\s+(?:short\s+)?(?:story|poem|book|novel|script|essay|article|song|film|play|piece|idea|project|screenplay)\s+(?:about|of|on|where|in which)\s+/i,
  /^about\s+/i,
];
const THEME_LEADS = [
  /^(?:the\s+|my\s+)?(?:main\s+|central\s+|big\s+|core\s+|real\s+)?(?:themes?|messages?|points?|ideas?|topics?|subjects?)\s+(?:is|are|of|would be|will be)?\s*(?:that\s+|about\s+|of\s+)?/i,
  /^(?:it(?:'s|\s+is)|this\s+is|the\s+(?:story|book|poem|piece|film|play|novel)\s+is)\s+(?:mostly\s+|mainly\s+|really\s+|all\s+)?about\s+/i,
  /^(?:a\s+story\s+about|the\s+theme\s+of|about)\s+/i,
];
const stripLeads = (v, leads) => leads.reduce((s, re) => s.replace(re, ''), v).trim();
const VERBISH = /\b(?:is|are|was|were|be|been|has|have|had|who|that|which|wants?|needs?|must|can|could|will|would|gets?|goes?|tries|finds?|discovers?|meets?|loses?|falls?|becomes?|returns?|learns?|decides?|hides?|steals?|inherits?|wakes?|escapes?|kills?|murders?|saves?|follows?|builds?|makes?|hears?|sees?|knows?|about|where|when|while|after|before)\b/i;

// Words that only look like names because a sentence opens with them ("Also the oven is older...", "Maybe she knows"): never a person, never a place.
const OPENERS = new Set(['also', 'then', 'maybe', 'perhaps', 'meanwhile', 'however', 'finally', 'first', 'next', 'later', 'soon', 'once', 'still', 'now', 'here', 'there', 'today', 'tonight', 'yesterday', 'tomorrow', 'again', 'always', 'never', 'often', 'sometimes', 'usually', 'suddenly', 'eventually', 'slowly', 'quietly', 'together', 'alone', 'everyone', 'everybody', 'nobody', 'someone', 'something', 'nothing', 'everything', 'because', 'although', 'though', 'while', 'when', 'where', 'after', 'before', 'since', 'unless', 'instead', 'otherwise', 'actually', 'basically', 'honestly', 'plus', 'yes', 'no', 'ok', 'okay', 'oh', 'well', 'so', 'but', 'and', 'or', 'if', 'what', 'who', 'why', 'how', 'all', 'some', 'many', 'most', 'each', 'every', 'both', 'one', 'two', 'three']);

/** A capitalised name (or short run of them) inside a value; a capital that only opens the value counts only when a name could follow it. */
export function nameIn(value) {
  for (const m of value.matchAll(/\p{Lu}[\p{L}'’-]*(?:\s+\p{Lu}[\p{L}'’-]*){0,2}/gu)) {
    const all = m[0].split(/\s+/);
    const words = [...all];
    while (words.length && (STOPWORDS.has(words[0].toLowerCase()) || (m.index === 0 && OPENERS.has(words[0].toLowerCase())))) words.shift();
    if (!words.length) continue;
    if (m.index === 0 && words.length === all.length && !/^(?:\s*[,:;(]|['’]s\b|\s+(?:is|was|has|had|who|wants?|must|can|will|and|the)\b|\s*$)/i.test(value.slice(m[0].length))) continue;
    return words.join(' ');
  }
  return null;
}

/** The first words of a value up to the first clause, with "the" added when a noun stands bare ("a lighthouse keeper" -> "the lighthouse keeper"). */
function nounPhrase(value, { max = 4, cut = CLAUSE } = {}) {
  const words = value.split(cut)[0].split(/\s+/).filter(Boolean).slice(0, max);
  while (words.length && STOPWORDS.has(words.at(-1).toLowerCase())) words.pop();
  if (!words.length || PRONOUNS.has(words[0].toLowerCase())) return null;
  if (/^\p{Lu}/u.test(words[0])) words[0] = words[0].toLowerCase(); // nameIn already ruled out a name
  if (words[0] === 'a' || words[0] === 'an') words[0] = 'the';
  else if (!ARTICLES.has(words[0])) words.unshift('the');
  return words.join(' ');
}

const personPhrase = (value) => {
  const v = clean(value);
  if (!v || PRONOUNS.has(v.toLowerCase())) return null;
  // "The Widow" is a title, so it keeps its article: "the Widow". (No `i` flag: with it \p{Lu} would match any letter.)
  const titled = v.match(new RegExp(`^(?:[Tt]he|[Aa]n?)\\s+(${CAP_RUN})(?=$|[\\s,;:.'’])`, 'u'));
  return titled ? `the ${titled[1]}` : nameIn(v) ?? nounPhrase(v);
};
const placePhrase = (value) => {
  const v = stripLeads(clean(value), PLACE_LEADS);
  if (!v) return null;
  const called = v.match(new RegExp(`\\b(?:called|named|known as|dubbed)\\s+(${CAP_RUN})`, 'u'));
  if (called) return called[1];
  // a name counts when the place IS the name ("Lagos in 1923"), not when it only turns up late ("a small island off the coast of Maine" is the island)
  const lead = v.match(new RegExp(`^${CAP_RUN}`, 'u'))?.[0];
  if (lead && !STOPWORDS.has(lead.split(/\s+/)[0].toLowerCase())) return lead;
  return nounPhrase(v, { max: 5, cut: new RegExp(`${CLAUSE.source}|${PLACE_CUT.source}`, 'i') });
};
const thingPhrase = (value) => {
  const v = stripLeads(clean(value), THING_LEADS);
  return v && v.split(/\s+/).length <= 5 && !VERBISH.test(v) ? nameIn(v) ?? nounPhrase(v, { max: 5 }) : null; // a whole sentence of premise does not slot into "what is {thing} really about?"
};
const wantPhrase = (value) => {
  const v = clean(value);
  if (!v) return null;
  const infinitive = v.match(/\b(?:wants?|needs?|wanted|tries|trying|tried|hopes?|hoping|wishes?|longs?|has|have)\s+to\s+(.+)$/i);
  const object = v.match(/\b(?:wants?|needs?|wanted)\s+(?!to\b)(.+)$/i);
  const out = infinitive ? `to ${infinitive[1]}` : object ? object[1] : v;
  const words = out.split(/[;,]|\s+(?:but|because|before|until)\s+/i)[0].split(/\s+/).filter(Boolean).slice(0, 9);
  while (words.length > 1 && STOPWORDS.has(words.at(-1).toLowerCase())) words.pop();
  return words.join(' ') || null;
};
const themePhrase = (value) => {
  const words = stripLeads(clean(value), THEME_LEADS).split(CLAUSE)[0].split(/\s+/).filter(Boolean).slice(0, 4);
  while (words.length && STOPWORDS.has(words.at(-1).toLowerCase())) words.pop();
  const out = words.join(' ');
  return out && !PRONOUNS.has(out.toLowerCase()) ? out : null;
};
/** A theme or a setting as the writer would file it: their own words without the lead-in that introduced it ("The theme is forgiveness" -> "forgiveness"). */
export const themeCore = (value) => stripLeads(clean(value), THEME_LEADS) || clean(value);
export const placeCore = (value) => stripLeads(clean(value), PLACE_LEADS) || clean(value);
const genrePhrase = (label) => (/^[A-Z][a-z\s-]+$/.test(label) ? label[0].toLowerCase() + label.slice(1) : label);

/**
 * The values that slot into a pack question's {placeholders}, taken from what the writer said. `own` lists the placeholders filled with their words
 * (a question that uses only those is the most specific one); {kind} is the pack's noun, which is NIE's term, not the writer's.
 */
export function placeholderValues(state, ctx) {
  const slots = slotsFor(state, ctx);
  const text = (role) => {
    const s = slotForRole(slots, role);
    return s ? slotValue(state, s.id) : '';
  };
  const values = {};
  const own = new Set();
  const set = (name, v) => {
    if (v) {
      values[name] = v;
      own.add(name);
    }
  };
  set('who', personPhrase(text('who')));
  set('place', placePhrase(text('place')));
  set('thing', thingPhrase(text('thing')));
  set('want', wantPhrase(text('want')));
  set('other', personPhrase(text('other')));
  set('theme', themePhrase(text('theme')));
  const genre = (state.genres ?? []).map((id) => (ctx?.packs?.genres ?? []).find((a) => a?.id === id)?.label).find(Boolean);
  set('genre', genre ? genrePhrase(genre) : themePhrase(slotValue(state, 'genre')));
  const noun = ctx?.packs?.kinds?.[state.kind]?.noun;
  if (noun) values.kind = noun;
  return { values, own };
}

// ── picking a question ───────────────────────────────────────────────────────

const EASY = new Set(['either', 'concrete']);
const PLAIN_FIRST = new Set(['open', 'either', 'concrete', 'whatif']);
const wellFormed = (t) => (t.match(/\?/g) ?? []).length === 1 && t.endsWith('?') && !/\n|["“”`]|\s{2}|\s[?,.]/.test(t) && !isStockQuestion(t);
const isRepeat = (text, asked, limit = SAME_QUESTION) => asked.some((a) => a.toLowerCase() === text.toLowerCase() || similarity(a, text) >= limit);

/**
 * One question for a slot, filled with the writer's own words. Never one that is (or is alike to) anything in `state.asked`. Prefers a question whose
 * placeholders are all the writer's words, a type unlike the last two asked, and (with `easy`) an easy type; ties are broken by a seeded choice, so it
 * varies from idea to idea but is the same for the same inputs. Null when the slot's bank is used up.
 * @returns {{ text: string, type: string, slot: string } | null}
 */
export function pickQuestion({ state, slotId, ctx, seed = '', easy = false }) {
  const slot = slotsFor(state, ctx).find((s) => s.id === slotId);
  if (!slot || !Array.isArray(slot.questions)) return null;
  const { values, own } = placeholderValues(state, ctx);
  const asked = state.asked.map((a) => a.text);
  const recent = state.asked.slice(-2).map((a) => a.type).filter(Boolean);
  const cands = [];
  for (const q of slot.questions) {
    if (!q || typeof q.text !== 'string') continue;
    const names = [...new Set([...q.text.matchAll(/\{([a-z]+)\}/g)].map((m) => m[1]))].filter((n) => n !== 'kind');
    let text = fillQuestion(q.text, values);
    let specific = names.length === 0 ? 1 : names.every((n) => own.has(n)) ? 2 : 0;
    if (!wellFormed(text)) {
      text = fillQuestion(q.text, {}); // the writer's phrase read badly in this question: use the neutral wording
      specific = 0;
      if (!wellFormed(text)) continue;
    }
    if (!isRepeat(text, asked)) cands.push({ text, type: q.type, specific });
  }
  if (!cands.length) return null;
  const wantsEasy = easy && cands.some((c) => EASY.has(c.type));
  // the first question about a part starts plainly: "who changes the most?" or "what does it cost them?" assume the writer has already said something about it
  const fresh = !state.asked.some((a) => a.slot === slotId) && cands.some((c) => PLAIN_FIRST.has(c.type));
  const rank = (c) => [wantsEasy && EASY.has(c.type) ? 1 : 0, c.specific, fresh && PLAIN_FIRST.has(c.type) ? 1 : 0, recent.includes(c.type) ? 0 : 1];
  const cmp = (a, b) => rank(b).reduce((d, v, i) => d || v - rank(a)[i], 0);
  cands.sort(cmp);
  const best = cands.filter((c) => cmp(cands[0], c) === 0);
  const chosen = best[hash(seed, slotId, state.turn, state.asked.length) % best.length];
  return { text: chosen.text, type: chosen.type, slot: slotId };
}

/** The content stems of what this session is about: the recorded values and the writer's last six messages (strings, or { role, content }). */
export function askTerms(state, recentMessages = []) {
  const terms = new Set();
  const add = (t) => stemList(t).forEach((s) => terms.add(s));
  for (const rec of Object.values(state.slots ?? {})) add(rec?.value);
  for (const e of state.extra ?? []) add(e);
  const mine = (Array.isArray(recentMessages) ? recentMessages : []).filter((m) => typeof m === 'string' || (m && m.role !== 'assistant')).slice(-6);
  for (const m of mine) add(typeof m === 'string' ? m : m.content);
  return terms;
}

// ── keeping a model's reply to the plan ──────────────────────────────────────

const LIST_MARK = /^(?:\d{1,3}[.)]|[-*•])[ \t]+/;
function endsWithQ(s) {
  for (let i = s.length - 1; i >= 0; i--) {
    if (s[i] === '?') return true;
    if (!'!"\'”’)]*_'.includes(s[i])) return false;
  }
  return false;
}

/** Sentences with their place in the reply, whether they are a question, sit in a list item, stand alone as a paragraph, or end their paragraph. */
function analyse(text) {
  const lines = [];
  let start = 0;
  let prev = false;
  for (;;) {
    let end = text.indexOf('\n', start);
    if (end < 0) end = text.length;
    const raw = text.slice(start, end);
    const trimmed = raw.trimStart();
    if (trimmed) {
      prev = LIST_MARK.test(trimmed.slice(0, 8)) || (prev && raw.length - trimmed.length >= 2);
      lines.push({ start, end, item: prev });
    } else prev = false;
    if (end >= text.length) break;
    start = end + 1;
  }
  const spans = [];
  let cursor = 0;
  let para = 0;
  for (const s of splitSentencesLite(text)) {
    const at = text.indexOf(s, cursor);
    if (at < 0) continue;
    if (spans.length && /\n[ \t\r]*\n/.test(text.slice(cursor, at))) para++;
    spans.push({ text: s, start: at, end: at + s.length, para, q: endsWithQ(s), item: lines.some((l) => at >= l.start && at <= l.end && l.item) });
    cursor = at + s.length;
  }
  for (const sp of spans) {
    const mates = spans.filter((o) => o.para === sp.para);
    sp.last = mates.at(-1) === sp;
    sp.alone = mates.every((o) => o.q && !o.item);
  }
  return spans;
}

/** Remove [from, to) and the gap that joined it to its neighbours; everything else stays byte for byte. */
function cut(text, from, to) {
  const before = text.slice(0, from);
  const after = text.slice(to);
  const next = after.search(/\S/);
  if (next === -1) return before.trimEnd() + after;
  const kept = before.trimEnd();
  if (!kept) return before + after.slice(next);
  const gapBefore = before.slice(kept.length);
  const gapAfter = after.slice(0, next);
  return kept + (gapAfter.split('\n').length > gapBefore.split('\n').length ? gapAfter : gapBefore) + after.slice(next);
}
const enoughLeft = (t, min = 8) => (t.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) ?? []).length >= min && !/[:;,—–-]\s*$/.test(t) && !/^\p{Ll}/u.test(t.trimStart());
/** A question that can be removed whole: it stands alone as a paragraph, or it closes its paragraph. Never one inside a list item. */
const removable = (sp) => sp.q && !sp.item && (sp.alone || sp.last);

/** Remove the questions `drop(spans)` names, last first, one at a time, keeping at least 8 words and never leaving a reply that ends on a colon. */
function removeQuestions(text, drop, changes, why, min = 8) {
  let cur = text;
  for (let guard = 0; guard < 8; guard++) {
    let done = false;
    for (const target of drop(analyse(cur)).filter(removable).reverse()) {
      const next = cut(cur, target.start, target.end);
      if (!enoughLeft(next, min)) continue; // this one cannot go without leaving too little; try the one before it
      changes.push(`${why}: ${target.text}`);
      cur = next;
      done = true;
      break;
    }
    if (!done) break;
  }
  return cur;
}

/**
 * Make a model's reply obey the plan without writing anything of NIE's own except a prepared bank question.
 *  - not an 'ask' turn: remove the questions that stand alone as a paragraph or close one (a 'serve' reply may keep one);
 *  - an 'ask' turn (or a 'serve' turn that also asks): exactly one question: keep the best, drop the other trailing or standalone ones, and swap the
 *    kept one for the plan's bank question when it names nothing of this session or repeats one already asked; add the bank question when there is none.
 * Idempotent: running it on its own output changes nothing.
 * @returns {{ text: string, changes: string[] }}
 */
export function enforceReply(reply, plan, { state, ctx, askedTexts, terms } = {}) {
  const changes = [];
  let text = typeof reply === 'string' ? reply : '';
  const asked = askedTexts ?? (state?.asked ?? []).map((a) => a.text);
  const session = terms instanceof Set ? terms : state ? askTerms(state) : new Set();
  const hits = (t) => [...new Set(stemList(t))].filter((s) => session.has(s)).length;
  const repeated = (t) => isRepeat(t, asked, REPLY_SIMILAR);
  const bad = (t) => repeated(t) || isStockQuestion(t);
  // the best question of several: not a repeat, not stock, most terms of this session, the later one
  const best = (qs) => [...qs].sort((a, b) => Number(bad(a.text)) - Number(bad(b.text)) || hits(b.text) - hits(a.text) || b.start - a.start)[0];
  const asks = plan?.act === 'ask' || (plan?.act === 'serve' && plan?.alsoAsk);

  if (!asks) {
    if (plan?.act === 'serve') {
      // a serve reply may keep ONE question, and only a good one
      const dropAllButOne = (spans) => {
        const qs = spans.filter(removable);
        const keep = qs.length ? best(qs) : null;
        return qs.filter((s) => s !== keep || bad(s.text));
      };
      text = removeQuestions(text, dropAllButOne, changes, 'dropped a question');
      // an answer that is a run of questions ("3. What ...? 4. How ...? 5. ...?") still ends with one at most
      if (analyse(text).filter((s) => s.q && !s.item).length > 1) text = removeQuestions(text, dropAllButOne, changes, 'dropped a question', 3);
    } else {
      text = removeQuestions(text, (spans) => spans.filter((s) => s.q), changes, 'dropped a question');
    }
    return { text, changes };
  }

  const bank = plan.question?.text ?? '';
  const keepBest = (spans) => {
    const qs = spans.filter((s) => s.q && !s.item);
    const keep = qs.length ? best(qs) : null;
    return qs.filter((s) => s !== keep);
  };
  text = removeQuestions(text, keepBest, changes, 'dropped an extra question');
  // a reply that is nothing but questions (the model's praise was cleaned away) still ends up with exactly one
  if (analyse(text).filter((s) => s.q && !s.item).length > 1) text = removeQuestions(text, keepBest, changes, 'dropped an extra question', 3);
  const left = analyse(text).filter((s) => s.q && !s.item);
  if (!left.length) {
    if (bank) {
      text = text.trim() ? `${text.trimEnd()}\n\n${bank}` : bank;
      changes.push('added a prepared question');
    }
  } else {
    const q = best(left);
    if (bank && q.text !== bank && (hits(q.text) === 0 || bad(q.text))) {
      text = text.slice(0, q.start) + bank + text.slice(q.end);
      changes.push(`replaced a question that did not fit this session: ${q.text}`);
    }
  }
  return { text, changes };
}

