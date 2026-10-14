import { fnv1a } from '../util/text.js';
import { slotsFor } from '../agent/detect.js';
import packs from '../agent/packs/index.js';
import { clipAtBoundary } from '../agent/state.js';
import { normalizeProfile } from '../profile/profile.js';
import { MIND_LIMITS, mindOf } from './state.js';

/**
 * Every place a project holds the writer's own material, as one flat list of passages that can be searched:
 * what they said (the mind), the idea sheet NIE is filling in, ideas set aside, ideas kept, the Idea Board, characters, themes, motifs, the timeline,
 * things marked deliberate, the working premise, the writer's rules and the profile they declared. The writer's long text and NIE's notes on it belong to
 * the long-text reading and are not passages here.
 *
 * Every `text` is the writer's own words (with the label of the part they belong to, such as "Main character: ..."); the only wording of NIE's in a passage is
 * its `where` label. An Idea Board item that NIE made (not the writer) carries `by: 'nie'`, so it can be shown but never presented as something the writer said.
 * Pure: reads the project it is given, changes nothing, keeps nothing between calls.
 */

/** How much a source counts when passages compete: the writer's deliberate acts, rules and kept ideas, then recorded parts, then what they said, then NIE's board items. */
export const WEIGHTS = Object.freeze({
  rule: 1,
  deliberate: 0.95,
  kept: 0.95,
  profile: 0.9,
  character: 0.85,
  theme: 0.8,
  motif: 0.8,
  timeline: 0.8,
  sheet: 0.75,
  board: 0.7, // the writer's own Idea Board notes
  extra: 0.7,
  premise: 0.65,
  said: 0.55,
  'set-aside': 0.5,
  nie: 0.35, // an Idea Board item NIE made
});
export const SOURCES = Object.freeze(['rule', 'deliberate', 'kept', 'profile', 'character', 'theme', 'motif', 'timeline', 'sheet', 'board', 'extra', 'premise', 'said', 'set-aside']);

const MAX_TEXT = 700;
/** The notes NIE itself puts on Idea Board items ("Still open: Setting, Ending" when it keeps an idea; "Set aside earlier"): its bookkeeping, never the writer's words. */
const NIE_NOTE = /^(?:Still open: .*|Set aside earlier)$/s;
const MAX_LIST = 400; // no list in a project is read past its newest 400 entries

const list = (v) => (Array.isArray(v) ? v.slice(-MAX_LIST) : []);
const text = (v, n = MAX_TEXT) => clipAtBoundary(v, n);
const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/** "one message ago", "3 messages ago": by the writer's message numbers (`mind.turn` is the newest). Without them, an honest "earlier". */
function agoPhrase(entry, mind, nowTurn) {
  const current = Number.isFinite(nowTurn) ? nowTurn : mind.turn;
  const d = current - entry.turn;
  if (!(entry.turn > 0) || !(current > 0) || d < 0 || d > 100000) return 'you said, earlier in this project';
  if (d === 0) return 'you said, in your last message';
  return d === 1 ? 'you said, one message ago' : `you said, ${d} messages ago`;
}

/** The recorded slot values of a sheet in pack order, each with its label from the pack in use ("Main character"), else the slot's own id: [{ id, label, value, turn }]. */
function sheetValues(state) {
  if (!isObject(state) || !isObject(state.slots)) return [];
  const labels = new Map();
  try {
    for (const s of slotsFor({ kind: state.kind ?? null, form: state.form ?? null, genres: Array.isArray(state.genres) ? state.genres : [] }, { packs })) labels.set(s.id, s.label);
  } catch {
    /* a sheet this build has no pack for: the ids are used */
  }
  const order = [...labels.keys()];
  const rank = (id) => (order.includes(id) ? order.indexOf(id) : 999);
  const out = [];
  for (const id of Object.keys(state.slots).filter((k) => Object.hasOwn(state.slots, k)).sort((a, b) => rank(a) - rank(b))) {
    const rec = state.slots[id];
    const value = isObject(rec) ? text(rec.value, 240) : '';
    if (value) out.push({ id, label: labels.get(id) ?? id, value, turn: Number.isFinite(rec.turn) ? rec.turn : 0 });
  }
  return out;
}

/**
 * @param {object} project
 * @param {{ includeSheet?: boolean, turn?: number }} [opts]  `includeSheet: false` leaves out the idea NIE is following right now (its sheet and "Also" details),
 *   for a caller that already shows it; `turn`: the number of the writer's newest message, for "N messages ago" (default: the newest the mind has recorded)
 * @returns {{ id: string, source: string, where: string, text: string, turn?: number, weight: number, by?: 'nie' }[]}
 */
export function passagesOf(project, options) {
  const { includeSheet = true, turn = null } = options !== null && typeof options === 'object' ? options : {};
  const out = [];
  if (!isObject(project)) return out;
  try {
    gather(project, out, { includeSheet, turn });
  } catch {
    /* a project with something unreadable in it (a getter that throws): what was read before it still stands, and a reply is never broken by the mind */
  }
  return out;
}

function gather(project, out, { includeSheet, turn }) {
  const seen = new Set();
  const add = (id, source, where, body, extra = {}) => {
    const t = typeof body === 'string' ? body.trim() : '';
    if (!t) return;
    let key = id;
    for (let k = 2; seen.has(key); k++) key = `${id}~${k}`; // two identical entries stay two passages with their own ids
    seen.add(key);
    out.push({ id: key, source, where, text: t, weight: WEIGHTS[extra.by === 'nie' ? 'nie' : source] ?? 0.5, ...extra });
  };
  const hash = (s) => fnv1a(s.toLowerCase());

  // the writer's rules and the profile they declared
  for (const r of list(project.rules)) {
    const t = isObject(r) ? text(r.text, 400) : '';
    if (t) add(`rule:${typeof r.id === 'string' ? r.id : hash(t)}`, 'rule', r.enabled === false ? 'a rule you set, switched off' : 'a rule you set', `Your rule: ${t}`);
  }
  if (isObject(project.profile)) {
    const p = normalizeProfile(project.profile);
    const field = (key, label, value) => {
      const v = Array.isArray(value) ? value.map((x) => text(x, 200)).filter(Boolean).join('; ') : text(value, 300);
      if (v) add(`profile:${key}`, 'profile', 'your project settings', `${label}: ${v}`);
    };
    if (project.title !== 'Untitled project') field('title', 'Title', project.title);
    field('format', 'Form', p.identity.format);
    field('genre', 'Genre', [p.genre.primary, ...p.genre.secondary].filter(Boolean));
    field('tone', 'Tone', p.tone);
    field('audience', 'Audience', p.audience);
    field('prose', 'Prose style', p.style.prose);
    field('pov', 'Point of view', p.style.pov);
    field('tense', 'Tense', p.style.tense);
    field('sentence', 'Sentences', p.style.sentence);
    field('dialogue', 'Dialogue', p.style.dialogue);
    field('description', 'Description', p.style.description);
    for (const k of ['chronology', 'reliability', 'structure', 'pacing']) field(k, { chronology: 'Chronology', reliability: 'Narrator reliability', structure: 'Structure', pacing: 'Pacing' }[k], p.narrative[k]);
    p.authorialIntent.slice(0, 20).forEach((x, i) => field(`intent${i}`, 'Your intent', x));
    p.deliberateAbnormalities.slice(0, 20).forEach((x, i) => field(`abnormal${i}`, 'Deliberate in your writing', x));
    field('instructions', 'Your instructions', p.instructions);
  }

  // what the writer marked deliberate, and the memory they built
  const m = isObject(project.memory) ? project.memory : {};
  for (const x of list(m.intentional)) {
    const quote = isObject(x) ? text(x.quote, 200) : '';
    if (quote) add(`deliberate:${typeof x.fingerprint === 'string' ? x.fingerprint : hash(quote)}`, 'deliberate', 'something you marked as deliberate', `Deliberate: "${quote}"${text(x.note, 200) ? ` (${text(x.note, 200)})` : ''}`);
  }
  for (const c of list(m.characters)) {
    const name = isObject(c) ? text(c.name, 80) : '';
    if (!name) continue;
    const aliases = list(c.aliases).map((a) => text(a, 60)).filter(Boolean);
    const notes = text(c.notes, 400);
    add(`character:${hash(name)}`, 'character', 'a character you recorded', `${name}${aliases.length ? ` (also ${aliases.join(', ')})` : ''}${notes ? `: ${notes}` : ''}`);
  }
  for (const [key, label, where] of [['themes', 'Theme', 'a theme you recorded'], ['motifs', 'Motif', 'a motif you marked'], ['timeline', 'Timeline', 'your timeline']]) {
    const source = key === 'themes' ? 'theme' : key === 'motifs' ? 'motif' : 'timeline';
    for (const t of list(m[key])) {
      const v = text(t, 300);
      if (v) add(`${source}:${hash(v)}`, source, where, `${label}: ${v}`);
    }
  }

  // the working premise (the writer's first telling, and each change of direction)
  const wp = project.conversation?.workingPremise;
  if (isObject(wp)) {
    const summary = text(wp.summary, 500);
    if (summary) add('premise:summary', 'premise', 'your working premise', `Premise: ${summary}`);
    for (const r of list(wp.revisions).slice(-6)) {
      const t = isObject(r) ? text(r.text, 240) : '';
      if (t) add(`premise:${hash(t)}`, 'premise', 'a change of direction you made', `Changed direction: ${t}`);
    }
    // (the premise's `themes` are labels NIE picked from a fixed list of its own, not words the writer used: they are not passages)
    const bits = [['figures', wp.characters], ['settings', wp.settings]]
      .map(([label, v]) => [label, list(v).map((x) => text(x, 60)).filter(Boolean).slice(0, 8)])
      .filter(([, v]) => v.length)
      .map(([label, v]) => `${label}: ${v.join(', ')}`);
    if (bits.length) add('premise:cues', 'premise', 'your working premise', `In your premise, ${bits.join('; ')}`);
  }

  // the idea NIE is following, and the ones set aside or kept
  const agent = isObject(project.conversation?.agent) ? project.conversation.agent : null;
  if (agent && includeSheet) {
    for (const s of sheetValues(agent)) add(`sheet:${s.id}`, 'sheet', "the idea we're on", `${s.label}: ${s.value}`, { turn: s.turn });
    for (const e of list(agent.extra)) {
      const v = text(e, 200);
      if (v) add(`extra:${hash(v)}`, 'extra', "a detail on the idea we're on", `Also: ${v}`);
    }
  }
  for (const s of list(agent?.shelf)) {
    if (!isObject(s)) continue;
    const idea = Number.isFinite(s.idea) ? s.idea : 0;
    for (const v of sheetValues(s)) add(`set-aside:${idea}:${v.id}`, 'set-aside', 'an idea set aside', `${v.label}: ${v.value}`, { turn: v.turn });
    for (const e of list(s.extra)) {
      const v = text(e, 200);
      if (v) add(`set-aside:${idea}:${hash(v)}`, 'set-aside', 'an idea set aside', `Also: ${v}`);
    }
  }

  // the Idea Board; an idea that was kept from the idea sheet is a kept idea (and only while it is still on the board)
  const keptIds = new Set(list(agent?.committed).map((c) => (isObject(c) && typeof c.boardId === 'string' ? c.boardId : '')).filter(Boolean));
  for (const item of list(project.brainstorm?.board)) {
    if (!isObject(item)) continue;
    const t = text(item.text, MAX_TEXT);
    const id = typeof item.id === 'string' && item.id ? item.id : hash(t);
    const note = NIE_NOTE.test(text(item.note, 400)) ? '' : text(item.note, 400);
    const byNie = item.source !== 'writer';
    if (t) {
      if (keptIds.has(id)) add(`kept:${id}`, 'kept', byNie ? 'kept on your Idea Board, an idea from NIE' : 'kept on your Idea Board', t, byNie ? { by: 'nie' } : {});
      else if (byNie) add(`board:${id}`, 'board', 'Idea Board, an idea from NIE', t, { by: 'nie' });
      else add(`board:${id}`, 'board', 'Idea Board', t);
    }
    if (note) add(`board:${id}:note`, 'board', 'your note on an Idea Board item', `Your note: ${note}`);
  }

  // what the writer said (last, so that for equal scores what was set down deliberately is listed first)
  const mind = mindOf(project);
  for (const e of mind.said.slice(-MIND_LIMITS.said * 2)) {
    if (!isObject(e) || typeof e.text !== 'string' || !e.text) continue;
    add(`said:${e.n}`, 'said', agoPhrase(e, mind, turn), e.text, { turn: e.turn });
  }
}
