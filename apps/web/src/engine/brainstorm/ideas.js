import { clip, fnv1a, pick, seededShuffle } from '../util/text.js';
import { KNOWLEDGE, forProfile, search } from '../knowledge/index.js';
import { KIND_IDS, LENSES, LENSES_BY_KIND, ROTATION, detectKind, kindLabel } from './lenses.js';
import { fillSlots, slotsFor } from './slots.js';
import { ideaId } from '../project/board.js';
import story from './banks/story.js';
import character from './banks/character.js';
import world from './banks/world.js';
import article from './banks/article.js';
import essay from './banks/essay.js';
import poem from './banks/poem.js';
import script from './banks/script.js';

/**
 * NIE's offline idea engine. Ideas are CONCEPT-LEVEL: a "what if", an angle, a complication, a question. Never manuscript
 * prose, dialogue or scene text, and never an edit of the writer's words. Deterministic for a given project state, so it is
 * testable, and it avoids repeating what this project has already been shown.
 */

export const BANKS = { story, character, world, article, essay, poem, script };

/** What a lens's ideas are called in a sentence ("Here are a few twists…"). */
export const LEAD_NOUN = {
  spark: 'sparks', premise: 'premises', next: 'possible next beats', twist: 'twists', opposite: 'flipped versions', stakes: 'ways to raise the stakes',
  complication: 'complications', secret: 'secrets', conflict: 'conflicts', theme: 'things it could really be about', ending: 'endings', opening: 'ways in',
  pov: 'points of view', structure: 'structures', setting: 'settings', blend: 'genre blends', title: 'title directions', motif: 'motifs',
  question: 'questions worth answering first', develop: 'ways to go deeper', want: 'wants', flaw: 'flaws', contradiction: 'contradictions',
  relationship: 'relationship dynamics', history: 'backstory threads', quirk: 'quirks and habits', arc: 'arcs', foil: 'foils', rule: 'world rules',
  culture: 'cultural details', place: 'places', tension: 'tensions', texture: 'textures', angle: 'angles', hook: 'hooks', headline: 'headline directions',
  sources: 'sources to look for', counter: 'counter-arguments', reader: 'ways to think about the reader', case: 'cases and examples', myth: 'myths to challenge',
  scope: 'ways to narrow it', format: 'formats', thread: 'through-lines', turn: 'turns', scene: 'scenes to mine', image: 'images', form: 'forms',
  voice: 'voices', constraint: 'constraints', sound: 'sound ideas', visual: 'visual ideas', dynamic: 'dynamics', mixed: 'ideas',
};
export const leadNoun = (lens) => LEAD_NOUN[lens] ?? 'ideas';

let compiled = null;
function compile() {
  if (compiled) return compiled;
  compiled = {};
  for (const kind of KIND_IDS) {
    compiled[kind] = (BANKS[kind] ?? []).map(([lens, template]) => ({ id: ideaId(`${kind}|${template}`), kind, lens, template }));
  }
  return compiled;
}

/** All templates for a kind: [{ id, kind, lens, template }] */
export const bankFor = (kind) => compile()[kind] ?? [];
export const bankStats = () => Object.fromEntries(KIND_IDS.map((k) => [k, bankFor(k).length]));

// ── Resolving what is being brainstormed ─────────────────────────────────────

/** Effective kind: explicit choice > words in this message > what we noticed earlier > the premise/title > story. */
export function resolveKind(project, message = '', explicit = null) {
  const chosen = explicit && explicit !== 'auto' ? explicit : project.brainstorm?.kind && project.brainstorm.kind !== 'auto' ? project.brainstorm.kind : null;
  if (chosen && KIND_IDS.includes(chosen)) return { kind: chosen, source: 'chosen' };
  const fromMessage = detectKind(message);
  if (fromMessage) return { kind: fromMessage, source: 'message' };
  const earlier = project.brainstorm?.detectedKind;
  if (earlier && KIND_IDS.includes(earlier)) return { kind: earlier, source: 'earlier' };
  const fromPremise = detectKind(`${project.conversation?.workingPremise?.summary ?? ''}`) || detectKind(String(project.profile?.identity?.title ?? '')) || null;
  if (fromPremise) return { kind: fromPremise, source: 'premise' };
  return { kind: 'story', source: 'default' };
}

// ── Genre blending (built from the knowledge library, not a bank) ─────────────

const topGenres = () => KNOWLEDGE.filter((e) => e.kind === 'genre' && !e.parent && e.questions.length);

function primaryGenre(project, message) {
  const declared = forProfile(project.profile).find((e) => e.kind === 'genre');
  if (declared) return declared.parent ? KNOWLEDGE.find((e) => e.id === declared.parent) ?? declared : declared;
  const text = `${message} ${project.conversation?.workingPremise?.summary ?? ''}`.trim();
  const found = text ? search(text, { kinds: ['genre'], limit: 1 })[0] : null;
  return found ? (found.parent ? KNOWLEDGE.find((e) => e.id === found.parent) ?? found : found) : null;
}

function blendIdeas(project, message, count, seed) {
  const primary = primaryGenre(project, message);
  const pool = seededShuffle(topGenres().filter((g) => g.id !== primary?.id), `${seed}|blend`);
  return pool.slice(0, count).map((g) => {
    const text = primary
      ? `${primary.name} × ${g.name}: keep ${primary.name} as the spine and let ${g.name} pressure it. ${g.questions[0]}`
      : `${g.name} × ${seededShuffle(pool.filter((x) => x.id !== g.id), `${seed}|${g.id}`)[0]?.name ?? 'another genre'}: pick one as the engine and let the other make trouble for it. ${g.questions[0]}`;
    return { id: ideaId(`blend|${text}`), kind: 'story', lens: 'blend', lensLabel: LENSES.blend.label, text };
  });
}

// ── Generating ideas ─────────────────────────────────────────────────────────

/**
 * @param {object} o
 * @param {object} o.project
 * @param {string} [o.message]
 * @param {string} o.kind         one of KIND_IDS
 * @param {string|null} [o.lens]  one of LENS ids, or null for a mixed set (one idea per different lens)
 * @param {number} [o.count]
 * @returns {{ ideas: {id:string,kind:string,lens:string,lensLabel:string,text:string}[], lens: string|null }}
 *   `ideas` never contains an idea already shown in this project until the bank for that lens is exhausted.
 */
export function generateIdeas({ project, message = '', kind, lens = null, count = 3, salt = '' }) {
  const seed = `${project.id}|${project.conversation?.messages?.length ?? 0}|${kind}|${lens ?? 'mixed'}|${salt}`;
  if (lens === 'blend') return { ideas: blendIdeas(project, message, count, seed), lens };

  const slots = slotsFor(project, message);
  const shown = new Set(project.brainstorm?.shown ?? []);
  const pool = bankFor(kind);
  const render = (t) => ({ id: t.id, kind: t.kind, lens: t.lens, lensLabel: LENSES[t.lens]?.label ?? t.lens, text: fillSlots(t.template, slots) });

  const takeFrom = (lensId, n, taken) => {
    const all = pool.filter((t) => t.lens === lensId && !taken.has(t.id));
    let fresh = all.filter((t) => !shown.has(t.id));
    // Everything in this lens has been shown: start the cycle again rather than going silent.
    if (!fresh.length) fresh = all;
    return seededShuffle(fresh, `${seed}|${lensId}`).slice(0, n);
  };

  const out = [];
  const taken = new Set();
  if (lens) {
    for (const t of takeFrom(lens, count, taken)) {
      out.push(render(t));
      taken.add(t.id);
    }
  } else {
    // Mixed: spread across different lenses so the set has range.
    const order = seededShuffle(ROTATION[kind] ?? LENSES_BY_KIND[kind] ?? [], `${seed}|order`);
    for (const l of order) {
      if (out.length >= count) break;
      const [t] = takeFrom(l, 1, taken);
      if (t) {
        out.push(render(t));
        taken.add(t.id);
      }
    }
  }
  return { ideas: dedupeByText(out), lens };
}

const dedupeByText = (ideas) => [...new Map(ideas.map((i) => [i.text.toLowerCase(), i])).values()];

/** Record that these ideas were shown, so the next request is different. */
export function markShown(project, ideas) {
  const b = project.brainstorm;
  for (const i of ideas) if (!b.shown.includes(i.id)) b.shown.push(i.id);
  if (b.shown.length > 400) b.shown.splice(0, b.shown.length - 400);
}

// ── Developing an idea ───────────────────────────────────────────────────────

export const DEVELOP_QUESTIONS = {
  story: [
    'Who wants something here badly enough to do something they would regret?',
    'What does this cost the person at the centre of it, and when do they first pay?',
    'What does the reader know that the character does not, or the other way round?',
    'What is the smallest scene that would prove this idea works?',
    'What would make this idea feel inevitable rather than convenient?',
    'Where does it turn: what is the moment after which nothing can go back?',
    'What is the version of this idea you would be embarrassed to write, and is that the better one?',
  ],
  character: [
    'What do they want, and what do they tell other people they want?',
    'What would they never admit about this?',
    'Who knows them best, and what does that person get wrong?',
    'What is the first situation that would make this trait a problem?',
    'What would change them, and what would they refuse to change even if it cost them everything?',
    'How do they behave when no one is watching, and does it match this?',
  ],
  world: [
    'Who benefits from this being true, and who pays for it?',
    'What would an ordinary person here do about it on a Tuesday?',
    'What does this make impossible, and who has found a way around that?',
    'How would an outsider misread it?',
    'Where does it break, and what happens when it does?',
    'What does it say about what this place is afraid of?',
  ],
  article: [
    'What is the one question this piece has to answer, in plain words?',
    'Who disagrees with this angle, and what is the fairest version of their case?',
    'What would you need to find out before you could stand behind this?',
    'What is the example or scene that makes the idea concrete?',
    'Why does this matter now, and to whom?',
    'What would a reader who already knows the topic still learn?',
  ],
  essay: [
    'What do you believe about this that you are not sure you should?',
    'Which moment from your own experience would the whole piece hang on?',
    'What changes between the first paragraph and the last?',
    'What is the sentence you are afraid to put down?',
    'Who is on the other side of this, and what would they say to you?',
    'What does this idea cost you to admit?',
  ],
  poem: [
    'What is the one image this poem cannot do without?',
    'What is the feeling underneath, and could the poem avoid naming it?',
    'Where does it turn, and what makes the turn feel earned?',
    'What would the poem sound like if it were quieter?',
    'What is the form refusing to let you say directly?',
    'What is the last thing the reader should be left holding?',
  ],
  script: [
    'What does each person in the scene want from the other, and what are they willing to pay?',
    'What can the audience see that the characters cannot?',
    'What is the scene really about underneath what they are saying?',
    'Where does the power shift, and what causes it?',
    'What is the smallest image that carries this idea on screen or stage?',
    'What would be lost if this scene were cut?',
  ],
};

export function developQuestions(kind, ideaText, n = 3, salt = '') {
  const list = DEVELOP_QUESTIONS[kind] ?? DEVELOP_QUESTIONS.story;
  return seededShuffle(list, `${fnv1a(ideaText)}|${salt}`).slice(0, n);
}

// ── Offline replies ──────────────────────────────────────────────────────────

const LEADS = [
  (n) => `Here are a few ${n} to react to.`,
  (n) => `Let's put some ${n} on the table.`,
  (n) => `A few ${n}. Take what pulls at you and ignore the rest.`,
];

const MIXED_FOLLOW = [
  'Which of these made you feel something, even if you hate it?',
  'Is there one you would keep a piece of? Star it and I will remember it for this project.',
  'Which one would you be curious to see through to the end?',
  'Which of these is closest to something you already half-knew?',
];

const NO_PREMISE = "I don't know your project yet, so these are open starting points: react to whichever pulls at you and I'll build from there.";
const BUILTIN_NOTE = "I'm using my built-in guidance right now, so these come from the craft library rather than a language model reading your project.";

/** The premise-aware sentence, or the honest "I don't know your project yet" one. */
function context(project) {
  const wp = project.conversation?.workingPremise ?? {};
  if (wp.summary) return `I'm building on what you've told me: "${clip(wp.summary, 110)}".`;
  return NO_PREMISE;
}

export function composeIdeaReply({ project, kind, lens, ideas, builtin = true, firstTime = true, salt = '' }) {
  const seed = `${project.id}|${project.conversation?.messages?.length ?? 0}|${lens ?? 'mixed'}|${salt}`;
  const noun = leadNoun(lens ?? 'mixed');
  const lead = [pick(LEADS, seed)(noun), context(project)].join(' ');
  const follow = lens ? pick(LENSES[lens]?.follow ?? MIXED_FOLLOW, seed) : pick(MIXED_FOLLOW, seed);
  const tail = [follow, builtin && firstTime ? BUILTIN_NOTE : ''].filter(Boolean).join('\n\n');
  const list = ideas.map((i, n) => `${n + 1}. ${i.text}`).join('\n');
  return { lead, tail, text: [lead, list, tail].join('\n\n') };
}

export function composeDevelopReply({ project, kind, idea, builtin = true, firstTime = true }) {
  const qs = developQuestions(kind, idea, 3, `${project.conversation?.messages?.length ?? 0}`);
  const lead = `Good one to dig into: "${clip(idea, 160)}"`;
  const tail = ['Which of these do you already know the answer to? Start there, and tell me where you get stuck.', builtin && firstTime ? BUILTIN_NOTE : ''].filter(Boolean).join('\n\n');
  const list = qs.map((q, n) => `${n + 1}. ${q}`).join('\n');
  return { lead, tail, ideas: [], text: [lead, 'Here is how I would pull on it:', list, tail].join('\n\n') };
}

// ── Reading a model's reply ──────────────────────────────────────────────────

const ITEM = /^\s*(?:\d{1,2}[.)]|[-*•])\s+(.*\S)\s*$/;
const MAX_IDEA_WORDS = 60;

const clean = (s) => s.replace(/\*\*|__/g, '').replace(/\s+/g, ' ').trim();

/**
 * Split a model reply into { lead, ideas[], tail }. Only a list of 2+ items counts as ideas. Items that are far too long
 * to be an idea (a drafted passage in disguise) are dropped, never edited.
 */
export function parseIdeas(text) {
  const lead = [];
  const tail = [];
  const raw = [];
  let cur = null;
  for (const line of String(text ?? '').split('\n')) {
    const m = line.match(ITEM);
    if (m && !tail.length) {
      cur = { text: m[1] };
      raw.push(cur);
    } else if (!line.trim()) {
      cur = null;
    } else if (cur && /^\s{2,}\S/.test(line)) {
      cur.text += ` ${line.trim()}`;
    } else if (raw.length) {
      tail.push(line.trim());
      cur = null;
    } else {
      lead.push(line.trim());
    }
  }
  const items = raw.map((i) => clean(i.text)).filter(Boolean);
  const ok = items.filter((t) => t.split(/\s+/).length <= MAX_IDEA_WORDS);
  const unique = [...new Map(ok.map((t) => [t.toLowerCase(), t])).values()].slice(0, 6);
  if (unique.length < 2) return { lead: '', ideas: [], tail: '', dropped: items.length - ok.length };
  return { lead: lead.join('\n').trim(), ideas: unique, tail: tail.join('\n').trim(), dropped: items.length - ok.length };
}

export { kindLabel };
