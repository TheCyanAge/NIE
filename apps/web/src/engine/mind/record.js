import { WORD_RE, splitSentences } from '../util/text.js';
import { removeFromBoard } from '../project/board.js';
import { MIND_LIMITS, NEXT_MAX, SAID_KINDS, ensureMind, renumber, statementText } from './state.js';
import { isNumberish, tokenize, tokensOf } from './tokens.js';

/**
 * Recording what the writer says. Only the writer's own statements about their project go in, in their own words, one statement per entry
 * (clipped, never reworded). Everything here works on the project it is given and keeps nothing between calls.
 */

// ── what is not a statement ──────────────────────────────────────────────────

const FILLER = new Set(
  ('yes yeah yep yup no nope nah ok okay k sure fine cool great nice good right thanks thank you thx please hmm hm um uh oh ah well so maybe perhaps alright all got it i see ' +
    'go on ahead continue next skip pass nothing none idk dunno lol haha mhm sorry whatever anyway ' +
    'definitely absolutely exactly certainly indeed correct true agreed agree precisely totally wow brilliant awesome perfect amazing lovely understood noted ' +
    "that that's thats is it's its works sounds looks for do let's lets let keep going carry very much again too also and then now just really quite pretty fair enough makes sense why not both neither " +
    'of course sir not never me to by hi hello hey hiya bye goodbye morning afternoon evening there nie think thinking minute moment wait hold hang a about give').split(' ')
);
const SHRUG = /^(?:(?:well|um|uh|hmm|honestly|really|oh|so|yeah|no|sorry)\s+)*(?:(?:i|i'm|im|i am)\s+)?(?:(?:really|just|honestly|still|truly|actually)\s+)*(?:don'?t know|do not know|dunno|idk|not sure|have no idea|no idea|no clue|have no clue|can'?t say|cant say|can'?t think|haven'?t decided|havent decided|haven'?t thought|haven'?t figured|don'?t care|do not care|couldn'?t say|can'?t decide|can'?t tell)\b/;
const SHRUG_TAIL = new Set(
  ('yet really sorry honestly about that it this exactly right now at the moment anything either much myself to be honest sure all just but maybe i guess whatever you choose decide up tbh thing so far').split(' ')
);
// "I have no idea what happens next", "not sure about the ending": a shrug that names what it is unsure of, with nothing else in it. (A comma or a second clause makes it a statement:
// "I don't know why she left, nobody does".)
const SHRUG_OBJECT = new Set('what how who where when why which if whether about the my this that it his her their yet anything everything'.split(' '));
// Leaving the choice to NIE or picking one of the options it offered says nothing about the project once the options are gone.
const DELEGATE = /^(?:(?:ok|okay|well|so|um|hmm|oh|yeah)\s+)*(?:whatever(?: you (?:think|like|want|prefer|choose|decide))?|anything|either(?: one| way)?|you (?:can )?(?:choose|decide|pick|tell me)|your (?:call|choice|pick|decision)|up to you|surprise me|i (?:do not|don'?t|dont) (?:mind|care)|it (?:does not|doesn'?t|doesnt) matter|no preference|dealer'?s choice|you know best|i trust you|go with your instinct|any(?: of them| one)?)\b/;
const DELEGATE_TAIL = new Set('is are works fine best better good ok okay then though please thanks thank you really honestly i guess with me either way today now to be'.split(' '));
const CHOICE = /^(?:(?:i(?:'ll| will| would)?\s+)?(?:take|pick|choose|like|prefer|want|love|go with|vote for)\s+)?(?:the\s+)?(?:(?:first|second|third|fourth|fifth|last|former|latter|1st|2nd|3rd|4th|5th)(?:\s+(?:one|option|idea|card|choice))?|(?:one|two|three|four|five|[1-9])|(?:number|option|idea|card|choice)\s+(?:[1-9]|one|two|three|four|five))(?:\s+(?:please|thanks|thank you))?$/;

// Closing a session says nothing about the project: "that's all for today", "I'm done for now", "see you tomorrow", "talk later".
const CLOSING = /^(?:(?:ok|okay|well|so|right|alright)\s+)*(?:that(?:'s| is)?\s+(?:all|it|everything|enough|me)(?:\s+(?:for|from me)(?:\s+(?:now|today|tonight|the moment|the day))?)?|(?:i'?m|i am)\s+(?:done|finished|off|going|leaving|heading off|signing off)(?:\s+(?:for|now|today|tonight))*|(?:see|talk to|speak to)\s+you(?:\s+(?:later|soon|tomorrow|next time|then))?|talk\s+(?:later|soon|tomorrow)|gotta go|good\s*night|night night)$/;

const plain = (s) => s.toLowerCase().replace(/[’‘]/g, "'").replace(/[^\p{L}\p{N}'\s]+/gu, ' ').replace(/\s+/g, ' ').trim();

/** "yes", "ok thanks", "I don't know", "no idea yet", "you choose", "the second one": answers that tell NIE nothing about the project. */
export function isFiller(text) {
  const raw = String(text ?? '');
  const t = plain(raw);
  if (!t) return true;
  const toks = t.split(' ');
  if (toks.length <= 8 && toks.every((w) => FILLER.has(w))) return true;
  if (toks.length <= 8 && CHOICE.test(t)) return true;
  if (toks.length <= 9 && CLOSING.test(t)) return true;
  const d = DELEGATE.exec(t);
  if (d) {
    const rest = t.slice(d[0].length).split(' ').filter(Boolean);
    if (rest.length <= 5 && rest.every((w) => DELEGATE_TAIL.has(w))) return true;
  }
  const m = SHRUG.exec(t);
  if (!m) return false;
  const rest = t.slice(m[0].length).split(' ').filter(Boolean);
  if (rest.length <= 5 && rest.every((w) => SHRUG_TAIL.has(w))) return true;
  return rest.length <= 4 && SHRUG_OBJECT.has(rest[0]) && !/[,;:]/.test(raw);
}

/**
 * The statement as it would be stored, or null when it is not one: not text, no letters, a paste of 400+ words, filler, or nothing a search could find
 * (every word a stopword: "She did it").
 */
export function cleanStatement(text) {
  if (typeof text !== 'string') return null;
  if (text.length > 6000) return null; // far longer than 400 words of anything: a pasted text
  const head = text.slice(0, 6000);
  if ((head.match(WORD_RE) ?? []).length >= MIND_LIMITS.pasted) return null;
  const s = statementText(head);
  if (!s || !/[\p{L}\p{N}]/u.test(s) || isFiller(s) || !tokensOf(s).list.length) return null;
  return s;
}

// ── the sentences of a message ───────────────────────────────────────────────

// A sentence that is a question even without its question mark ("does she die at the end", "what if Mara was the thief", "which of these is better"). The auxiliaries that can never
// open a statement ("is", "are", "was", "does", "did", "has") make any sentence a question; the ones that can ("do not leave the island", "have a look") need a subject after them.
const QUESTION_START = new RegExp(
  '^(?:(?:who|whom|whose|what|which|how|why|where|when)\\s+(?:is|are|was|were|do|does|did|can|could|would|should|will|has|have|had|many|much|about|if|else|of|kind|sort|type|to|not|happens|next)\\b' +
    '|(?:is|are|was|were|does|did|has)\\s+\\S|am\\s+i\\b' +
    '|(?:do|can|could|would|should|will|shall|may|might|must)\\s+(?:it|this|that|there|she|he|they|we|you|i|the|a|an|my|your|his|her|their|our|its|these|those|any|anyone|anybody|everyone|everybody|someone|somebody|nobody|each|every|both|all|some)\\b' +
    '|(?:have|had)\\s+(?:you|i|we|they|she|he|it|there|any|anyone|anybody|everyone|someone|somebody|nobody)\\b)',
  'i'
);
// What a writer asks of NIE, said as a statement or a bare phrase: "any ideas for the ending", "need a name for the baker", "could use some help", "remind me who the villain is", "let me think".
const ASKS_NIE =
  '(?:any|some|got any|have you got any|do you have any)\\s+(?:ideas?|suggestions?|thoughts?|tips?|advice|feedback|help|recommendations?)\\b|' +
  '(?:ideas?|suggestions?|thoughts?|tips|advice|feedback|help|recommendations?)\\s+(?:for|on|with|about)\\b|' +
  '(?:i\\s+|i\'?m\\s+|i am\\s+)?(?:need|needs|want|wants|looking for|searching for|trying to find)\\s+(?:some\\s+|a few\\s+|more\\s+)?(?:ideas?|suggestions?|help|feedback|advice|tips|a hand|a name|names|a title|titles|an idea|a way|another way)\\b|' +
  '(?:could|can)\\s+(?:really\\s+)?use\\b|remind me\\b|let me\\b|let us\\b|' +
  '(?:i\\s+wonder|(?:i\'?m|i am|i was)\\s+wondering|wondering)\\b|(?:change|cut|shorten|lengthen|tighten|fix|improve|redo)\\s+(?:it|this|that|these|those|them)\\b';
const REQUEST_START = new RegExp(
  `^(?:${ASKS_NIE}|can you\\b|could you\\b|would you\\b|will you\\b|can we\\b|could we\\b|let\'?s\\b|lets\\b|help me\\b|give me\\b|tell me\\b|show me\\b|` +
    '(?:write|rewrite|draft|compose|generate|suggest|brainstorm|list|check|scan|find|remember|forget|remove|delete|fix|edit|continue|summari[sz]e|explain|describe|compare|read|look|ask|save|stop)\\b|' +
    'i(?:\'d| would| want| need| wish)\\s+(?:like |love )?(?:you|nie)\\s+to\\b|i(?:\'d| would| want| need)\\s+(?:like |love )?(?:some |a bit of |a little )?(?:help|ideas|suggestions|feedback|advice|a hand|your)\\b|' +
    'thanks\\b|thank you\\b|thx\\b|sorry\\b)',
  'i'
);
// "Make / create / use / start / add ..." is a request for work only when it asks for a piece of text ("make a scene", "add a new paragraph", "start a chapter"); otherwise it is the writer
// saying how the project should be ("use a warm tone throughout", "make the ending bittersweet", "start with Mara waking up"), which the mind keeps.
const ASKS_FOR_TEXT = /^(?:make|create|use|start|add|put)\b[^.!?]{0,30}\b(?:a|an|some|another|new|me)\s+(?:[\p{L}'-]+\s+){0,2}(?:scene|chapter|paragraph|passage|sentence|dialogue|opening|ending|poem|draft|outline|synopsis|blurb|monologue|prologue|epilogue|speech|letter|song|ideas?|twists?|names?|versions?|list)\b/iu;
// What comes before a statement without being part of it: a filler word and its punctuation ("Well, she left"), a politeness, or "remember that ...", "don't forget that ...",
// "let's say ...", "add that ...": the writer telling NIE a fact. (A filler word is only dropped when punctuation follows it: "Well water is cold" keeps its first word.)
const LEAD = new RegExp(
  '^(?:(?:yes|yeah|yep|ok|okay|well|so|oh|hmm|um|uh|great|nice|cool|right|sure|actually|anyway|basically)\\b[,.!:;-]+\\s*)+' +
    '|^(?:please|pls)\\b[,.!]?\\s*' +
    '|^(?:(?:please|pls)[,]?\\s+)?(?:remember(?:\\s+that)?|note(?:\\s+that)?|keep in mind(?:\\s+that)?|bear in mind(?:\\s+that)?|do not forget(?:\\s+that)?|don\'?t forget(?:\\s+that)?|' +
    'make a note(?:\\s+that)?|add a note(?:\\s+that)?|(?:write|jot|note|put)\\s+(?:this\\s+|that\\s+|it\\s+)?down(?:\\s+that)?|add that|just so you know(?:\\s+that)?|for the record|fyi|let\'?s say(?:\\s+that)?|lets say(?:\\s+that)?|assume(?:\\s+that)?)\\b[,:]?\\s*',
  'i'
);
// Full stops that do not end a sentence: 3.5, 10.30, v2.1, "T. S. Eliot", "Capt. Hale", "Oct. 5", "U.S.", "p.m." (the shared splitter knows a few titles only). They are hidden before
// the message is cut into sentences and put back after.
const DOT = '\uE000'; // (private-use characters: never in a writer's message, which is cleaned of them first)
const LINK = '\uE001';
const TITLES = '(?:Mr|Mrs|Ms|Mx|Dr|Prof|Sr|Jr|St|Mt|Ft|Capt|Cpt|Col|Gen|Lt|Sgt|Cmdr|Adm|Rev|Fr|Hon|Gov|Sen|Rep|Pres|Det|Insp|Supt|Maj|Inc|Ltd|Co|Corp|Dept|Univ|Ave|Blvd|Est|Vol|Ch|Fig|Pg|approx|vol|ch|pp|fig|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)';
const PROTECT = [
  [/(?<=\d)\.(?=\d)/g, DOT],
  [new RegExp(`\\b${TITLES}\\.(?=\\s+(?:\\p{Lu}|\\d))`, 'gu'), (m) => m.slice(0, -1) + DOT],
  [/(?<!\p{L})\p{Lu}\.(?=\s*\p{Lu})/gu, (m) => m.slice(0, -1) + DOT], // "T. S. Eliot", "J.K. Rowling"
  [/\b(?:e\.g|i\.e|a\.m|p\.m|etc|vs)\.(?=\s+[\p{Ll}\d])/gu, (m) => m.replaceAll('.', DOT)],
  [/\bNos?\.(?=\s*\d)/gu, (m) => m.slice(0, -1) + DOT], // "No. 5 Quay Street"
  [/(?<=\d\s?)(?:ft|in|lbs?|oz|yds?|mi|cm|mm|km|kg)\.(?=\s+[\p{Ll}\d])/gu, (m) => m.slice(0, -1) + DOT], // "6 ft. 2 in. tall"
  [/(?<!\p{L})\p{L}\.(?=\p{L}\.)/gu, (m) => m.slice(0, -1) + DOT], // the inner dots of "U.S.", "a.m."
];
// (a link's own dots, and a mark that it is there: a sentence with a link in it is about the link)
const URL = /\b(?:https?:\/\/|www\.)\S*[^\s.,;:!?)\]'"”’]|\b[\w.+-]+@[\w-]+(?:\.[\w-]+)+/gi;
const hide = (text) => PROTECT.reduce((t, [re, to]) => t.replace(re, to), text.replace(URL, (u) => u.replace(/[.!?]/g, DOT) + LINK));

/** The shared splitter's sentences, with an ellipsis or a speech tag that it cut in two put back together ("He said...", then "but nobody knows"; "Stop!" she cried). */
function sentencesOf(body) {
  const out = [];
  for (const piece of splitSentences(hide(body))) {
    const t = piece.text;
    const prev = out.at(-1);
    if (prev && /^\p{Ll}/u.test(t) && (/(?:\.{2,}|…)["'”’)\]]*$/.test(prev) || /[!?]["'”’]$/.test(prev))) out[out.length - 1] = `${prev} ${t}`;
    else out.push(t);
  }
  return out;
}

/** Pieces packed greedily into runs that each fit a statement (a piece that alone does not fit is a run of its own). */
function pack(parts) {
  const out = [];
  let cur = '';
  for (const p of parts) {
    if (cur && cur.length + 1 + p.length > MIND_LIMITS.text) {
      out.push(cur);
      cur = p;
    } else cur = cur ? `${cur} ${p}` : p;
  }
  if (cur) out.push(cur);
  return out;
}

/**
 * One long sentence cut into pieces that each fit a statement, so that NOTHING is lost to the length limit: first at strong breaks (; : dashes, ", but ..."), then at any comma,
 * then between words. (Each piece is still the writer's own words, only cut.)
 */
function clauses(sentence) {
  if (sentence.length <= MIND_LIMITS.text) return [sentence];
  const strong = sentence.split(/(?<=[;:—–])\s+|\s+[—–]\s+|(?<=,)\s+(?=(?:but|and|so|because|while|which|though|until|before|after)\b)/i);
  return pack(strong).flatMap((piece) => (piece.length <= MIND_LIMITS.text ? [piece] : pack(piece.split(/(?<=,)\s+/)).flatMap((run) => (run.length <= MIND_LIMITS.text ? [run] : pack(run.split(/\s+/))))));
}

const QUOTED = /["“][^"”\n]{2,200}["”]/g;
const PRIVATE_USE = /[\uE000-\uE001]/g; // (the two characters that mark a hidden full stop and a link below: never the writer's own)
const LIST_MARK = /^(?:[-*•>]+\s*|\d{1,2}[.)]\s+|#{1,6}\s+)/u;

/** Is this piece worth keeping on its own: three words, or two that carry meaning ("Corin hides debts")? */
const worthKeeping = (piece) => {
  const n = (piece.match(WORD_RE) ?? []).length;
  return n >= 4 || (n === 3 && tokensOf(piece).set.size >= 2);
};

/**
 * The statements about the project in a message: its sentences of four or more words (three, when two of them carry meaning: "Corin hides debts") that are not
 * questions and not requests to NIE ("write...", "can you...", "give me..."), at most MIND_LIMITS.perMessage, so one long message becomes several facts that can be
 * found and cited separately. A run of very short sentences ("Mara (47). Captain. Retired. Notices everything.") is kept together as one. A sentence longer than a statement is
 * cut into pieces, not clipped. A pasted text (400+ words) gives none, nor does a scene (a few lines of quoted speech in a long message). A sentence with a link in it gives none.
 * Returns the writer's own sentences, only trimmed (a leading "yes," or bullet mark is dropped).
 */
export function statementsIn(message) {
  if (typeof message !== 'string' || !message.trim() || message.length > 6000) return [];
  const body = message.replace(PRIVATE_USE, '').trim();
  const wc = (body.match(WORD_RE) ?? []).length;
  if (wc >= MIND_LIMITS.pasted) return [];
  if (wc >= 60 && (body.match(QUOTED) ?? []).length >= 3) return []; // a scene with dialogue is a text, not a telling
  const out = [];
  let frag = []; // consecutive sentences too short to stand alone
  const take = (text) => {
    for (const c of clauses(text)) {
      if (!worthKeeping(c)) continue;
      out.push(c.replaceAll(DOT, '.').trim());
      if (out.length >= MIND_LIMITS.perMessage) return true;
    }
    return false;
  };
  const flush = () => {
    const joined = frag.join(' ');
    frag = [];
    return joined && worthKeeping(joined) ? take(joined) : false;
  };
  for (const sentence of sentencesOf(body)) {
    if (sentence.includes(LINK)) { // (a sentence that carries a link: the link is what it is about)
      if (flush()) return out;
      continue;
    }
    let s = sentence.replace(LIST_MARK, '').trim();
    for (let i = 0; i < 3; i++) {
      const t = s.replace(LEAD, '').trim();
      if (t === s) break;
      s = t;
    }
    if (!s) continue;
    if (/\?["'”’)\]*_]*\s*$/.test(s) || QUESTION_START.test(s) || REQUEST_START.test(s) || ASKS_FOR_TEXT.test(s)) {
      if (flush()) return out;
      continue;
    }
    if (!worthKeeping(s)) {
      if (/[\p{L}\p{N}]/u.test(s)) frag.push(s);
      continue;
    }
    if (flush() || take(s)) return out;
  }
  flush();
  return out;
}

// ── the record ───────────────────────────────────────────────────────────────

const containment = (a, b) => {
  let n = 0;
  for (const t of a) if (b.has(t)) n++;
  return n / (a.size || 1);
};

/**
 * How many content words two statements share, or -1 when they plainly do not overlap by 90% of the shorter one (so that neither contains the other):
 * it counts over the shorter and stops at the first miss too many, which is what makes comparing a new statement with 600 old ones cheap.
 */
function sharedWords(a, b) {
  const [small, big] = a.size <= b.size ? [a, b] : [b, a];
  const allowed = Math.floor(small.size / 10);
  let hit = 0;
  let miss = 0;
  for (const t of small) {
    if (big.has(t)) hit++;
    else if (++miss > allowed) return -1;
  }
  return hit;
}

/** Stems of the capitalised words of a text, wherever they stand: names are what tells one person's fact from another's. */
function capStems(text) {
  const out = new Set();
  for (const m of text.slice(0, 600).matchAll(/\p{Lu}[\p{L}'’-]+/gu)) for (const t of tokenize(m[0])) out.add(t);
  return out;
}

/**
 * Two statements that share (nearly) all the words of the shorter one: do they say the same thing? Only when those words come in the same order ("Mara loves Corin" is not
 * "Corin loves Mara") and every word the shorter one has that the longer lacks is neither a number nor a name ("Mara is 47" corrects "Mara is 52", it does not repeat it).
 */
function agree(small, big, smallText) {
  let from = 0;
  let hit = 0;
  for (const t of small.list) {
    const k = big.list.indexOf(t, from);
    if (k >= 0) {
      hit++;
      from = k + 1;
    }
  }
  if (hit < 0.9 * small.list.length) return false;
  let caps = null;
  for (const t of small.set) {
    if (big.set.has(t)) continue;
    if (isNumberish(t)) return false;
    caps ??= capStems(smallText);
    if (caps.has(t)) return false;
  }
  return true;
}

/** Stems of everything the project already holds elsewhere (idea sheet, set-aside ideas, Idea Board, memory, premise): a statement made of these words is not lost if it leaves the mind. */
function anchorStems(project) {
  const set = new Set();
  const add = (text) => {
    if (typeof text === 'string') for (const t of tokensOf(text.length > 600 ? text.slice(0, 600) : text).list) set.add(t); // (bounded: a project's own texts can be any size)
  };
  const addList = (list, f = add) => {
    if (Array.isArray(list)) for (const x of list.slice(-400)) f(x);
  };
  const sheet = (s) => {
    if (!s || typeof s !== 'object') return;
    for (const rec of Object.values(s.slots && typeof s.slots === 'object' ? s.slots : {})) add(rec?.value);
    addList(s.extra);
  };
  const agent = project.conversation?.agent;
  sheet(agent);
  addList(agent?.shelf, sheet);
  addList(agent?.committed, (c) => add(c?.digest));
  addList(project.brainstorm?.board, (i) => {
    add(i?.text);
    add(i?.note);
  });
  const m = project.memory;
  addList(m?.characters, (c) => {
    add(c?.name);
    addList(c?.aliases);
    add(c?.notes);
  });
  for (const k of ['timeline', 'themes', 'motifs']) addList(m?.[k]);
  addList(m?.intentional, (x) => {
    add(x?.quote);
    add(x?.note);
  });
  const wp = project.conversation?.workingPremise;
  add(wp?.summary);
  addList(wp?.revisions, (r) => add(r?.text));
  for (const k of ['characters', 'settings', 'themes']) addList(wp?.[k]);
  return set;
}

/** Mostly made of words the project holds elsewhere. */
const isAnchored = (entry, anchors) => {
  const toks = tokensOf(entry.text).set;
  return toks.size > 0 && containment(toks, anchors) >= 0.75;
};

/**
 * Keep a statement the writer made about their project. Returns the entry, or null when it was refused (see `cleanStatement`) or the project cannot be written to.
 *
 * A statement whose content stems are 90% inside an entry already held is not stored again (the earlier entry is returned and counts as said again just now); one that
 * contains an earlier entry (90% of that entry's stems) replaces it, so a statement that grows ("she wants the bell" ... "she wants the bell before the regatta") stays one fact.
 * Over the cap (MIND_LIMITS.said) the OLDEST entry whose words are not already held elsewhere in the project goes; if all are held elsewhere, the oldest.
 * @param {object} project
 * @param {string} text
 * @param {{ turn?: number|null, kind?: 'told'|'answered'|'added' }} [opts]  `turn`: the number of the writer's message (the same for every statement of one message)
 */
export function rememberSaid(project, text, options) {
  const { turn = null, kind = 'told' } = options !== null && typeof options === 'object' ? options : {};
  return rememberOne(project, text, { turn, kind }, {});
}

/** `rememberSaid`; `shared` carries what the statements of one message can share (the words the project holds elsewhere are worked out once per message, not once per statement). */
function rememberOne(project, text, { turn, kind }, shared) {
  if (!project || typeof project !== 'object') return null;
  const s = cleanStatement(text);
  if (!s) return null;
  try {
    const mind = ensureMind(project);
    const t = Number.isFinite(turn) && turn >= 0 ? Math.min(1e9, Math.floor(turn)) : mind.turn;
    const now = Date.now();
    const here = tokensOf(s);
    const mine = here.set;
    const not = here.neg;
    const single = mine.size < 2; // one content word is not enough to call two statements "the same"
    const absorbed = [];
    for (let i = mind.said.length - 1; i >= 0; i--) {
      const e = mind.said[i];
      if (!e || typeof e.text !== 'string') continue;
      const there = tokensOf(e.text);
      const theirs = there.set;
      if (!theirs.size || there.neg !== not) continue; // "she is a captain" does not repeat "she is not a captain"
      const shared = sharedWords(mine, theirs);
      if (shared < 0) continue;
      const newInOld = shared / mine.size;
      const oldInNew = shared / theirs.size;
      if (newInOld >= 0.9 && (!single || oldInNew >= 0.9) && agree(here, there, s)) {
        e.turn = Math.max(e.turn, t); // said again: it is current again
        e.at = now;
        mind.turn = Math.max(mind.turn, t);
        return e;
      }
      if (oldInNew >= 0.9 && agree(there, here, e.text)) absorbed.push(e);
    }
    if (absorbed.length) mind.said = mind.said.filter((e) => !absorbed.includes(e));
    if (mind.seq >= NEXT_MAX) renumber(mind);
    const entry = { n: mind.seq + 1, turn: t, at: now, text: s, kind: SAID_KINDS.includes(kind) ? kind : 'told' };
    mind.seq = entry.n;
    mind.turn = Math.max(mind.turn, t);
    mind.said.push(entry);
    while (mind.said.length > MIND_LIMITS.said) {
      shared.anchors ??= anchorStems(project);
      const at = mind.said.findIndex((e) => !isAnchored(e, shared.anchors));
      mind.said.splice(at < 0 ? 0 : at, 1);
    }
    return entry;
  } catch {
    return null; // e.g. a frozen project: remembering must never break a reply
  }
}

/**
 * Keep every statement a message makes (`statementsIn`) as the same message: one `turn` for all. Call it ONCE PER WRITER MESSAGE (the message is counted even when
 * it records nothing: a pasted text, a question or a request), so "N messages ago" counts messages. Returns the entries (a repeat returns the entry already held).
 */
export function rememberStatements(project, message, options) {
  const { turn = null, kind = 'told' } = options !== null && typeof options === 'object' ? options : {};
  if (!project || typeof project !== 'object') return [];
  let t;
  try {
    const mind = ensureMind(project);
    t = Number.isFinite(turn) && turn >= 0 ? Math.min(1e9, Math.floor(turn)) : mind.turn + 1;
    mind.turn = Math.max(mind.turn, t); // the message counts even when it says nothing to keep
  } catch {
    return [];
  }
  const out = [];
  const shared = {};
  for (const s of statementsIn(message)) {
    const e = rememberOne(project, s, { turn: t, kind }, shared);
    if (e && !out.includes(e)) out.push(e);
  }
  return out;
}

const numberOf = (id) => (typeof id === 'number' ? id : typeof id === 'string' && /^said:\d{1,10}$/.test(id) ? Number(id.slice(5)) : typeof id === 'string' && /^\d{1,10}$/.test(id) ? Number(id) : NaN);

/** The writer's "forget this": remove one statement (by its number, or its id `said:12`). Returns whether anything was removed. */
export function forgetSaid(project, n) {
  try {
    const id = numberOf(n);
    const list = project?.mind?.said;
    if (!Number.isFinite(id) || !Array.isArray(list)) return false;
    const i = list.findIndex((e) => e?.n === id);
    if (i < 0) return false;
    list.splice(i, 1);
    return true;
  } catch {
    return false;
  }
}

/** "Forget this" for anything `describeMind` lists as removable: a statement (`said:12`) or an Idea Board item (`board:idea_ab12cd34`, `kept:idea_ab12cd34`). */
export function forgetItem(project, id) {
  if (typeof id !== 'string') return false;
  if (id.startsWith('said:')) return forgetSaid(project, id);
  const board = id.startsWith('board:') ? 6 : id.startsWith('kept:') ? 5 : 0; // a kept idea is an Idea Board item too
  try {
    if (board && Array.isArray(project?.brainstorm?.board)) return Boolean(removeFromBoard(project, id.slice(board)));
  } catch {
    /* a board with something unreadable in it: nothing was removed */
  }
  return false;
}
