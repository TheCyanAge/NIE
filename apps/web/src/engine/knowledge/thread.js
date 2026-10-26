import { STOPWORDS } from '../util/text.js';
import { FACET_ORDER, THREAD_VERSION, clampInt, emptyThread, sanitizeThread } from './thread-state.js';
import { KNOWLEDGE, PROFILE_FACETS, facetsAsked, getEntry, searchScored } from './index.js';

/**
 * A conversation about the library: which subject ("Gothic fiction", "the villanelle") the last library answer was about, which facets of it have been shown,
 * and how to read the next short message ("what about its tropes?", "tell me more", "how is it different from romance?") against that subject.
 *
 * The thread is plain JSON kept at `project.conversation.library`, so it belongs to the project (isolated with it, removed with it). Nothing here keeps state of its own:
 * every function takes the thread it is given and returns a new one.
 *
 * It only ever points at what the library holds. It rewrites no message of the writer's (the writer's words stay as typed in the chat); the rewritten question
 * is a search, not a quotation, and the answer is the library's own record, shown with its sources.
 */

const SHORT = Object.freeze({ history: 'History', subgenres: 'Subgenres', tropes: 'Tropes', craft: 'How it is built', readers: 'What readers expect', compare: 'How it differs', canon: 'Landmark works', pitfalls: 'Pitfalls', terms: 'Vocabulary' });
/** The kinds of entry a follow-up can be about (never a single work or a word-usage note). */
const SUBJECT_KINDS = Object.freeze(['genre', 'form', 'tradition', 'movement', 'structure', 'style', 'technique', 'market', 'process', 'format']);
/** A thread is followed for this many of the writer's messages after the answer it comes from; after that a short message is not assumed to be about it. */
export const MAX_AGE = 3;
/** The points of an overview entry that a first answer shows (see `renderEntry`): "tell me more" continues from here. */
export const OVERVIEW_SHOWN = 4;
const OVERVIEW_WORKS = 4;

export { FACET_ORDER, THREAD_VERSION, emptyThread, sanitizeThread };
const int = clampInt;

// ── what the library holds about a subject ──────────────────────────────────

// The library is the same for every project, so this index of "which profile records belong to which entry" is derived data about it, not project state.
const derived = { list: null, size: -1, byParent: new Map() };
function profilesByParent() {
  if (derived.list !== KNOWLEDGE || derived.size !== KNOWLEDGE.length) {
    const map = new Map();
    for (const e of KNOWLEDGE) {
      if (e.kind !== 'profile' || !e.parent) continue;
      if (!map.has(e.parent)) map.set(e.parent, new Map());
      map.get(e.parent).set(e.topic, e);
    }
    Object.assign(derived, { list: KNOWLEDGE, size: KNOWLEDGE.length, byParent: map });
  }
  return derived.byParent;
}
/** The facets the library holds for this subject, as a Map of facet id to entry (empty when it holds none). */
export const profilesOf = (subjectId) => profilesByParent().get(subjectId) ?? new Map();

/** The subject an entry belongs to (a profile belongs to its parent), or null for a record that cannot be followed up (a single work). */
export function subjectFrom(entry) {
  if (!entry) return null;
  if (entry.kind === 'profile') {
    const parent = entry.parent ? getEntry(entry.parent) : null;
    return parent ? { id: parent.id, name: parent.name, kind: parent.kind, facet: entry.topic } : null;
  }
  if (entry.kind === 'work') return null;
  return { id: entry.id, name: entry.name, kind: entry.kind, facet: null };
}

/**
 * The thread after the library answered with these entries at this turn. A new subject starts a new thread; the same subject keeps what has been shown.
 * An answer with no subject to follow (a single work, nothing at all) ends the thread.
 */
export function noteAnswer(thread, entries, turn, query = '') {
  let s = subjectFrom(entries?.[0]);
  // The question can name the subject itself while the closest entries are about something else: "what are the tropes of romance?" is answered by entries about particular tropes, but it is
  // Romance that the conversation is about. (Unless the answer already is that subject's own entry or one of its profiles.)
  const phrase = query ? String(query).trim().match(NAMED_AFTER)?.[1] : null;
  const named = phrase && remainderOf(phrase) ? lookupName(phrase, null, s?.kind) : null; // (a phrase of only facet words, "the history", names nothing)
  if (named && named.id !== s?.id) s = subjectFrom(named);
  if (!s) return { ...emptyThread(), turn: int(turn, 1000000) };
  const same = thread?.subject?.id === s.id;
  const shown = new Set(same ? thread.shown : []);
  let entryShown = same ? thread.entryShown : 0;
  for (const e of entries ?? []) {
    if (e.kind === 'profile' && e.parent === s.id) shown.add(e.topic);
    else if (e.id === s.id) entryShown = Math.max(entryShown, Math.min(OVERVIEW_SHOWN, e.conventions?.length ?? 0));
  }
  return { v: THREAD_VERSION, subject: { id: s.id, name: s.name, kind: s.kind }, shown: FACET_ORDER.filter((f) => shown.has(f)), entryShown, turn: int(turn, 1000000) };
}

/** Everything of an overview entry has been shown (after a "tell me more" that showed the rest of it). */
export const ALL_SHOWN = 100;
export const afterRest = (thread, turn) => ({ ...thread, entryShown: ALL_SHOWN, turn: int(turn, 1000000) });

// ── reading a short message against the subject in focus ───────────────────

const PRONOUN = /\b(?:it|its|it's|that|this|those|these|they|them|their|the (?:genre|form|style|tradition|movement|mode|technique|tradition))\b/i;
const ELLIPSIS = /^(?:and|also|then|now|so|ok(?:ay)?|what about|how about|what of|as for)\b/i;
const MORE = /^(?:(?:ok(?:ay)?|yes|yeah|sure|please|and|so|well|right)[,\s]+)*(?:tell me more|tell me a bit more|more|more please|give me more|more details?|more info(?:rmation)?|go on|go ahead|carry on|continue|keep going|go deeper|say more|expand(?: on (?:that|it))?|elaborate(?: on (?:that|it))?|what else|what else is there|what else do you know|what else can you (?:tell|say)|anything else|is there more|(?:can|could) you (?:tell me|say|give me) more|i(?:'d| would) like (?:to hear )?more|i want (?:to hear )?more)(?: about it| on it| about that| on that| about this| on this| about them)?$/i;
const COMPARE_CUE = /\b(?:different from|differ(?:s|ent|ence|ences)?|compared? (?:to|with)|versus|vs\.?|same as|similar to|distinguish(?:ed)?|apart from|better than|the same)\b/i;
// The phrase after a joining word ("subgenres of romance", "different from noir", "vs thrillers"): what a message names besides the subject in focus.
const NAMED_AFTER = /\b(?:of|in|for|about|from|within|than|to|with|and|vs\.?|versus|or|between)\s+(?:(?:the|a|an)\s+)?([^?.,;!]+?)\s*[?.!]*$/i;

const words = (t) => (String(t).match(/[\p{L}\p{N}'’-]+/gu) ?? []).length;
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isPronoun = (p) => /^(?:it|its|that|this|them|they|those|these|there)$/i.test(p.trim());

const keyOf = (s) => String(s ?? '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
/** The library entry a phrase names ("romance", "the villanelle"), or null; only a name or alias counts, never a loose match. */
function lookupName(phrase, exceptId, preferKind = null) {
  const p = String(phrase ?? '').trim();
  if (!p || isPronoun(p) || words(p) > 6) return null;
  const hits = searchScored(p, { kinds: [...SUBJECT_KINDS], limit: 8, minScore: 1.2 });
  const key = keyOf(p);
  // An entry that is called exactly that beats one that merely has the word in its name ("romance" is Romance, not LGBTQ romance). Among entries with the same name, the one whose
  // name is that (not an alias of it) and of the kind of the subject in focus comes first (a genre is compared with a genre, not with a Spanish ballad form called "romance").
  const rank = (h) => [keyOf(h.entry.name) === key ? 2 : 0, preferKind && h.entry.kind === preferKind ? 1 : 0].reduce((a, b) => a + b, 0);
  const called = hits.filter((h) => [h.entry.name, ...(h.entry.aka ?? [])].some((n) => keyOf(n) === key)).sort((a, b) => rank(b) - rank(a) || b.score - a.score)[0];
  // (Only a name counts. A loose match on the words of a keyword list would take "people use" for a technique called the bandwagon.)
  const top = called ?? hits.find((h) => h.exact);
  if (!top || top.entry.id === exceptId) return null;
  return top.entry;
}

// Words that only carry the question ("what are the key ... of"), not a thing named.
const QUESTION_WORDS = new Set(['key', 'main', 'best', 'common', 'major', 'tell', 'give', 'show', 'list', 'name', 'more', 'some', 'any', 'all', 'other', 'different', 'kinds', 'types', 'whats', 'say', 'explain', 'describe', 'talk', 'know', 'think', 'like', 'please']);
const FACET_RES = Object.values(PROFILE_FACETS).map((f) => new RegExp(f.re.source, 'gi'));
/** What a short message names besides the facet it asks for, the subject in focus and the words of asking: empty when it names nothing else. */
function remainderOf(text) {
  let t = String(text).toLowerCase();
  for (const re of FACET_RES) t = t.replace(re, ' ');
  return (t.match(/[\p{L}\p{N}'’-]+/gu) ?? []).filter((w) => !STOPWORDS.has(w) && !QUESTION_WORDS.has(w) && !isPronoun(w) && w.length > 1).join(' ');
}

/** The text with the subject's own name (and aliases) said as "it", so "tell me more about gothic fiction" and "tell me more about it" read the same. */
function sayItForSubject(text, base) {
  let out = text;
  for (const n of [base.name, ...(base.aka ?? [])].filter((n) => n && n.length > 2).sort((a, b) => b.length - a.length)) out = out.replace(new RegExp(`\\b${escapeRe(n)}\\b`, 'gi'), 'it');
  return out;
}

/** Which facet a message asks for: the one whose cue comes first in it. */
function firstFacet(text) {
  const asked = facetsAsked(text);
  let best = null;
  for (const f of asked) {
    const at = text.search(PROFILE_FACETS[f].re);
    if (at >= 0 && (!best || at < best.at)) best = { f, at };
  }
  return best?.f ?? null;
}

const nextFacet = (thread, profiles) => FACET_ORDER.find((f) => profiles.has(f) && !thread.shown.includes(f)) ?? null;

/** True while the overview entry has something a first answer did not show: more points, a second watch-for or departure, works beyond the first four, readings beyond two. */
export function hasMoreOverview(base, thread) {
  if (thread.entryShown >= ALL_SHOWN) return false;
  return (base.conventions ?? []).length > thread.entryShown || (base.watchFor?.length ?? 0) > 1 || (base.deliberateWhen?.length ?? 0) > 1 || (base.works?.length ?? 0) > OVERVIEW_WORKS || (base.refs?.length ?? 0) > 2;
}

/**
 * Read a short message against the thread. Returns null when the message is not a follow-up (so the ordinary reading and library search handle it), or one of:
 *   { kind: 'facet', facet, entries, lead }          the library's record of that facet of the subject
 *   { kind: 'missing', facet, reply }                 the subject has no record for that facet (said so, with what it does have)
 *   { kind: 'more', entries, lead, rest? }           the next facet, or (rest: { from }) the points of the overview a first answer did not show
 *   { kind: 'exhausted', reply }                     everything held on the subject has been shown
 *   { kind: 'compare', entries, lead, after }        the subject and another entry side by side
 *   { kind: 'context', entries }                     (a model is running) a pronoun question the library cannot pick out: the subject's records, for the model to answer from
 * @param {{ turn: number, model?: boolean }} opts  `turn` counts the writer's messages including this one; `model` is true when a language model reads and answers.
 */
export function resolveFollowUp(text, thread, { turn = 0, model = false } = {}) {
  const raw = String(text ?? '').trim();
  if (!thread?.subject || !raw || raw.length > 160 || words(raw) > 18) return null;
  if (turn < thread.turn || turn - thread.turn > MAX_AGE) return null;
  const base = getEntry(thread.subject.id);
  if (!base) return null;
  const subject = thread.subject;
  const profiles = profilesOf(subject.id);
  const t = sayItForSubject(raw, base).replace(/\s+/g, ' ').trim();
  const bare = t.replace(/[\s.!?,;:]+$/g, '');

  // "tell me more", "go on", "what else?"
  if (MORE.test(bare.toLowerCase())) {
    if (hasMoreOverview(base, thread)) return { kind: 'more', rest: { from: thread.entryShown }, entries: [base], lead: `More on ${subject.name}:` };
    const f = nextFacet(thread, profiles);
    if (f) return { kind: 'more', facet: f, entries: [profiles.get(f)], lead: `More on ${subject.name}, ${PROFILE_FACETS[f].label}:` };
    return { kind: 'exhausted', reply: exhaustedReply(subject, profiles) };
  }

  const lower = bare.toLowerCase();
  const refersToSubject = PRONOUN.test(t) || ELLIPSIS.test(t);

  // "how is it different from romance?"
  if (COMPARE_CUE.test(t) && refersToSubject) {
    const after = t.split(COMPARE_CUE).pop().replace(/^\s*(?:from|with|to|than|and|between|the)\s+/i, '');
    const other = lookupName(after.match(/^\s*(?:(?:the|a|an)\s+)?(.+?)\s*[?.!]*$/i)?.[1], subject.id, subject.kind);
    if (other) {
      // The profile's compare facet has one point per neighbour, written "Subject versus Neighbour: ..."; the point for this neighbour is shown as it is. (Looked for in the other
      // subject's profile too: it may hold the point that the first lacks.)
      const pointIn = (profile, who) => {
        const keys = [who.name, ...(who.aka ?? [])].map(keyOf);
        return (profile?.conventions ?? []).find((c) => {
          const neighbour = c.split(':')[0].split(/\s+(?:versus|vs\.?)\s+/i)[1];
          return neighbour ? keys.includes(keyOf(neighbour)) : false;
        });
      };
      const point = pointIn(profiles.get('compare'), other);
      const reverse = point ? null : pointIn(profilesOf(other.id).get('compare'), base);
      return {
        kind: 'compare',
        entries: [base, other],
        lead: `${subject.name} and ${other.name}, side by side:`,
        after: point ? `On how they differ, my profile of ${subject.name} says: ${point}` : reverse ? `On how they differ, my profile of ${other.name} says: ${reverse}` : `I don't hold a separate note on how ${subject.name} and ${other.name} differ, so this is what each is, side by side.`,
        compact: true,
        other,
      };
    }
  }

  // "what about its tropes?", "and the history?", "subgenres?", "who are the key authors?"
  const facet = firstFacet(lower);
  if (facet) {
    const left = remainderOf(t);
    // It names nothing else, or it points back at the subject and what else it names is no entry of its own. ("how do I write dialogue?" has no pointer back, so it is not about
    // the subject in focus; "what are the tropes of romance?" names another entry, so the library answers that one.)
    if (!left || (refersToSubject && !lookupName(left, subject.id))) {
      const profile = profiles.get(facet);
      if (profile) return { kind: 'facet', facet, entries: [profile], lead: `${subject.name}, ${PROFILE_FACETS[facet].label}:` };
      return { kind: 'missing', facet, reply: missingReply(subject, facet, profiles) };
    }
  }

  // A question that points back at the subject without asking for a facet ("why did it start in Britain?"): with a model, show it the subject's records to answer from
  // (together with whatever the ordinary search finds).
  if (model && PRONOUN.test(t)) {
    const all = [base, ...FACET_ORDER.filter((f) => profiles.has(f)).map((f) => profiles.get(f))];
    return { kind: 'context', entries: all.slice(0, 6) };
  }
  return null;
}

// ── what NIE says on its own about the thread ───────────────────────────────

export function exhaustedReply(subject, profiles) {
  const wider = profiles.has('compare') ? ` Ask how it compares with a neighbouring genre or form, or name another one.` : ' Name a neighbouring genre or form, or ask how it compares with one.';
  return `That is everything I hold on ${subject.name}.${wider}`;
}

export function missingReply(subject, facet, profiles) {
  const have = FACET_ORDER.filter((f) => profiles.has(f)).map((f) => PROFILE_FACETS[f].label);
  const lead = `I don't have a separate entry on the ${PROFILE_FACETS[facet].label} of ${subject.name}, and I won't guess, because I can't look things up offline.`;
  return have.length
    ? `${lead} What I do hold on it: ${have.join('; ')}.`
    : `${lead} All I hold on it is its overview; ask for more of that, or name a neighbouring genre or form.`;
}

/** Chips for the next questions on this subject (each one sends a question; the library answers it). Empty when there is no thread. */
export function chipsFor(thread) {
  const subject = thread?.subject;
  const base = subject ? getEntry(subject.id) : null;
  if (!subject || !base) return [];
  const profiles = profilesOf(subject.id);
  const out = [];
  if (hasMoreOverview(base, thread)) out.push({ label: 'Tell me more', text: '', send: { ask: 'Tell me more.' } });
  for (const f of FACET_ORDER) {
    if (out.length >= 5) break;
    if (profiles.has(f) && !thread.shown.includes(f)) out.push({ label: SHORT[f], text: '', send: { ask: PROFILE_FACETS[f].ask(subject.name) } });
  }
  if (out.length < 2 && !profiles.size) out.push({ label: 'How does it differ from…', text: `How does ${subject.name} differ from ` });
  out.push({ label: 'How would that work in my project?', text: 'How would that work in my project?' });
  out.push({ label: 'Ask about something else', text: 'What is ' });
  return out;
}
