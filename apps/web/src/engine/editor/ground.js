import { STOPWORDS, fnv1a } from '../util/text.js';
import { bareWord, capitalisedRuns, neverName, OPENERS, ORDINARY_OPENERS, ROLE_WORDS, TITLES } from './names.js';
import { numbersIn } from './numbers.js';
import { removeSpans, sentenceSpans } from './sentences.js';

/**
 * Grounding: a reply about the writer's own text may not contain a name (or a number stated as a fact about the text) that occurs nowhere the reply could have
 * learnt it from. Measured on the real model: replies invented names ("Haldric Ombrecht": two real names of the text, put together), set-ups and numbers.
 *
 * `groundNames` REMOVES the sentences that break this and never rewords anything. Sentences are judged one by one:
 *  - a capitalised word in the middle of a sentence, or a run of two or more capitalised words anywhere, must occur in `sources` (the text, the writer's
 *    messages, the project's memory...) or in `known` (NIE's own words, the profile's words, the labels of kinds, forms and genres, the names in a library
 *    answer). A run must occur as a run: "Haldric Ombrecht" is not grounded by "Emeric Haldric" in one place and "Isaura Ombrecht" in another.
 *    (The one capitalised word that opens a sentence proves nothing and is not judged, unless it is followed by 's.)
 *  - a number of ten or more, or one with a comma or a decimal point, in a sentence that speaks of the text ("your chapter", "the draft"), must occur in the
 *    sources (as digits or in words: "ninety" and "90" are the same number). A section or chapter number is a place, not a fact, and is left alone unless
 *    `sections` (how many sections the text has) says it cannot exist.
 * What the check cannot see: a set-up or a fact made of ordinary words. It stops the inventions that can be counted, nothing more.
 *
 * With `facts: true` (an answer from the library) a sentence is also judged on the dates and patterns it states: a year, a decade ("the 1990s"), a century ("the 17th century",
 * "seventeenth-century") or a run of five or more capitals (a rhyme scheme such as ABABCDCDEFEFGG) that no source has goes with the sentence. A century and a decade are grounded by a
 * year of that century or decade in a source as well as by the same words; the reply can say "the 17th century" when a record says 1606. It stops an invented date or an invented
 * scheme; a true date set against the wrong thing (a real year given to the wrong poem) is made of words that are all in the records and gets through.
 */

// ── what the reply may rely on ───────────────────────────────────────────────

// Vocabularies are cached by a hash of the source text (a 10,000-word text is read once, not on every reply). Bounded (the last six sources of 4,000 characters or
// more: a short one is cheaper to read again than to look up), keyed by content, holding only the words of a source: no project state. `clearGroundingCache` empties
// it (the caller does so when the writer switches or deletes a project).
const CACHE = new Map();
const CACHE_MAX = 6;
const CACHE_MIN_CHARS = 4000;

export const clearGroundingCache = () => CACHE.clear();
export const groundingCacheSize = () => CACHE.size;
const SOURCE_CAP_CHARS = 3_000_000;

// (A role or title in front of a name, "Commissioner Haldric", "Captain Vane", is not part of the name: the name after it is what must be in a source. See ROLE_WORDS.)

// NIE's own vocabulary and the capitalised words of ordinary English that a reply uses without a source for them: languages and peoples, periods and movements,
// the names of well-known craft ideas and style guides, feasts and seasons. Reference vocabulary of the craft, written in code like the knowledge library; nothing of any project.
const BUILTIN = [
  'NIE. Idea Board. Full Scan. Story Text. Story Bible. Project Memory. Brainstorm. Settings. Bible. Markdown. Scrivener. Word. Docs.',
  'English. American. British. French. German. Spanish. Latin. Greek. Italian. Irish. Scottish. Welsh. Dutch. Russian. Chinese. Japanese. Indian. European. African. Asian. Australian. Canadian. Roman. Norse. Celtic. Arabic. Hebrew. Nordic. Slavic.',
  'Gothic. Victorian. Edwardian. Georgian. Elizabethan. Jacobean. Regency. Romantic. Romanticism. Modernist. Modernism. Postmodern. Postmodernist. Realist. Realism. Naturalist. Naturalism. Symbolist. Surrealist. Imagist. Beat. Augustan. Byronic. Dickensian. Orwellian. Kafkaesque. Shakespearean. Homeric. Biblical. Arthurian. Aristotelian. Socratic. Freudian. Jungian. Oedipal. Machiavellian. Kantian. Marxist. Noir. Renaissance. Medieval. Baroque. Classical. Hellenistic. Southern Gothic. Magical Realism. Golden Age. Dark Ages. Middle Ages.',
  'Fantasy. Romance. Mystery. Thriller. Horror. Crime. Western. Memoir. Poetry. Fiction. Nonfiction. Screenplay. Novel. Novella. Essay. Science Fiction. Young Adult. Literary Fiction. Historical Fiction. Short Story. Flash Fiction.',
  'Chicago. Oxford. Harvard. Associated Press. Elements of Style. Manual of Style. Stylebook. Merriam-Webster. Webster. Fowler. Modern English Usage. Plain English. Strunk. Turabian. Vancouver.',
  "Hero's Journey. Three-Act. Save the Cat. Chekhov's Gun. Freytag's Pyramid. Snowflake Method. Mary Sue. Deus Ex Machina. In Medias Res. Bildungsroman. MacGuffin. Red Herring. Bechdel. Aristotle. Poetics.",
  'Christmas. Easter. Halloween. Thanksgiving. Lent. Advent. Ramadan. Diwali. Hanukkah. Passover. God. Heaven. Hell. Earth. Sun. Moon.',
  // the craft's own terms, as a reply capitalises them
  'Dramatic Irony. Verbal Irony. Situational Irony. Call to Adventure. Dark Night of the Soul. Opening Image. Closing Image. Final Image. Midpoint. Plot Point. Plot Twist. Fish Out of Water. Show, Don\'t Tell. Rule of Three.',
  'Inciting Incident. Rising Action. Falling Action. Turning Point. Point of View. Close Third. Deep POV. Third Person Limited. Third Person Omniscient. First Person. Second Person. Free Indirect Discourse. Stream of Consciousness.',
  'Unreliable Narrator. Frame Narrative. Epistolary. Cold Open. Cliffhanger. Foreshadowing. Flashback. Flashbacks. Backstory. Exposition. Info Dump. Epiphany. Catharsis. Pathetic Fallacy. Foil. Anti-Hero. Antihero. Protagonist. Antagonist. Mentor. Trickster.',
  'Femme Fatale. Final Girl. Chosen One. Found Family. Love Triangle. Enemies to Lovers. Slow Burn. Locked Room. Whodunit. Cozy Mystery. Space Opera. Cyberpunk. Steampunk. Solarpunk. Grimdark. Dystopian. Post-Apocalyptic. Epic Fantasy.',
  'High Fantasy. Low Fantasy. Urban Fantasy. Portal Fantasy. Sword and Sorcery. Slice of Life. Coming of Age. Coming-of-Age. Magical Realism. Gothic Horror. Cosmic Horror. Body Horror. Psychological Thriller. Legal Thriller. Romantic Comedy.',
  'Satire. Parody. Pastiche. Fable. Parable. Allegory. Myth. Legend. Folktale. Fairy Tale. Anaphora. Alliteration. Assonance. Consonance. Enjambment. Caesura. Iambic Pentameter. Free Verse. Blank Verse. Sonnet. Haiku. Limerick. Villanelle. Sestina.',
  'Elegy. Ode. Ballad. Couplet. Quatrain. Stanza. Refrain. Metaphor. Metaphors. Simile. Similes. Personification. Hyperbole. Understatement. Irony. Symbolism. Symbol. Symbols. Motif. Motifs. Theme. Themes. Trope. Tropes. Archetype. Archetypes.',
  'Voice. Tone. Diction. Syntax. Imagery. Pacing. Characterization. Characterisation. Dialogue. Subtext. Conflict. Stakes. Tension. Atmosphere. Mood. Setting. Worldbuilding. Plot. Structure. Beat Sheet. Story Circle. Seven-Point Structure. Five-Act Structure.',
  'Three-Act Structure. Act One. Act Two. Act Three. Setup. Payoff. Climax. Denouement. Resolution. Epilogue. Prologue. Adverbs. Adjectives. Verbs. Nouns. Sentences. Fragments. Clauses. Punctuation. Tense. Repetition. Rhythm. Contrast. Echoes.',
  // the themes a reply lists
  'Loss. Memory. Family. Grief. Love. Death. Identity. Belonging. Power. Freedom. Justice. Revenge. Redemption. Betrayal. Loyalty. Sacrifice. Hope. Fear. Duty. Honour. Honor. Guilt. Shame. Pride. Ambition. Isolation. Loneliness. Friendship. Faith. Fate.',
  'Time. Nature. Change. Home. War. Peace. Class. Gender. Silence. Humour. Humor. Wit. Suspense. Mystery. Romance. Horror. Tragedy. Comedy. Drama. Melodrama. Pathos. Desire. Hunger. Innocence. Memory. Work. Money. Faith. Truth. Lies. Secrets.',
  // the best-known writers on the craft, and the works about it
  'Strunk and White. Zinsser. On Writing Well. Politics and the English Language. Orwell. Hemingway. Vonnegut. Forster. Aspects of the Novel. Campbell. Vogler. Truby. McKee. Snyder. Lamott. Bird by Bird. Dillard. Gardner. Stephen King. On Writing.',
].join(' ');

// Craft words a reply capitalises as a label ("Character Development:", "Narrative Voice", "Key Observations"): ordinary English, never a name. A run is read as a
// label when every word in it is one of these, is found in lower case in a source, or looks like an abstract noun (ends in -tion, -ment, -ness, -ity...).
const CRAFT = new Set(
  ('narrative narrator narrators arc arcs conflict conflicts tension stakes motif motifs perspective atmosphere mood language relationships relationship consistency continuity suggestions ' +
    'suggestion strengths strength weaknesses weakness areas area improvement improvements overview summary analysis feedback takeaways takeaway conclusion introduction background context ' +
    'premise protagonist protagonists antagonist antagonists world worldbuilding backstory exposition foreshadowing resolution climax rising falling action transitions transition sentence ' +
    'sentences grammar punctuation spelling clarity concision redundancy repetition imagery symbolism sensory emotional emotion emotions key main major minor central core overall general ' +
    'specific detail details observations observation development devices device technique techniques craft free indirect discourse stream consciousness unreliable inciting incident twist twists ' +
    'reveal reveals payoff setup pacing rhythm cadence texture register diction syntax style genre tone theme themes subtext dialogue monologue interior exterior scene sequel beat beats act ' +
    'acts opening hook closing ending middle beginning draft revision revisions edit edits character characters plot structure voice point view tense person show tell active passive ' +
    'fiction nonfiction poem poems poetry prose verse chapter chapters section sections paragraph paragraphs word words line lines story stories reader readers writer writers').split(' ')
);
const ABSTRACT_SUFFIX = /(?:tion|sion|ment|ness|ity|ance|ence|ship|ical|ional|ative|itive|ism|ology|able|ible|ful|less|ings?|ery|ics|ous|hood)s?$/;

function wordsOfSource(source) {
  const toks = [];
  const caps = [];
  const words = new Set();
  const lower = new Set();
  const pos = new Map();
  let prevEnd = -1;
  const re = /[\p{L}\p{M}\p{N}][\p{L}\p{M}\p{N}'’-]*/gu;
  const push = (t, cap) => {
    toks.push(t);
    caps.push(cap);
    if (t !== '|') {
      const list = pos.get(t);
      if (list) list.push(toks.length - 1);
      else pos.set(t, [toks.length - 1]);
    }
  };
  for (const m of source.matchAll(re)) {
    const bare = bareWord(m[0]);
    if (!bare) continue;
    let brk = prevEnd < 0;
    for (let i = Math.max(prevEnd, 0); !brk && i < m.index; i++) {
      const c = source.charCodeAt(i);
      if (c !== 32 && c !== 9 && c !== 0xa0) brk = true;
    }
    if (brk && toks.at(-1) !== '|') push('|', false);
    prevEnd = m.index + m[0].length;
    const lo = bare.toLowerCase().replace(/’/g, "'");
    const cap = bare[0] !== bare[0].toLowerCase() && bare[0] === bare[0].toUpperCase();
    push(lo, cap);
    words.add(lo);
    if (!cap) lower.add(lo);
    if (lo.includes('-')) for (const part of lo.split('-')) if (part) words.add(part);
  }
  return { toks, caps, words, lower, pos, nums: null, source, trusted: false };
}

function vocabularyOf(source) {
  const s = source.length > SOURCE_CAP_CHARS ? source.slice(0, SOURCE_CAP_CHARS) : source;
  if (s.length < CACHE_MIN_CHARS) return wordsOfSource(s);
  const key = `${s.length}:${fnv1a(s)}`;
  const hit = CACHE.get(key);
  if (hit) {
    CACHE.delete(key);
    CACHE.set(key, hit);
    return hit;
  }
  const v = wordsOfSource(s);
  CACHE.set(key, v);
  while (CACHE.size > CACHE_MAX) CACHE.delete(CACHE.keys().next().value);
  return v;
}

let builtinVocab = null;
const numbersOf = (v) => (v.nums ??= new Set(numbersIn(v.source, { limit: 20000 }).map((n) => n.value)));

/** The vocabularies of every source the reply may rely on. `known` entries are short strings: they are read as sources too. */
function vocabularies(sources, known) {
  const list = [];
  for (const s of typeof sources === 'string' ? [sources] : Array.isArray(sources) ? sources : []) if (typeof s === 'string' && s.trim()) list.push(vocabularyOf(s));
  const extra = (Array.isArray(known) ? known : []).filter((k) => typeof k === 'string' && k.trim()).map((k) => k.trim().slice(0, 200));
  list.push((builtinVocab ??= { ...wordsOfSource(BUILTIN), trusted: true })); // (code, not project data)
  if (extra.length) list.push({ ...wordsOfSource(extra.join('\n')), trusted: true }); // (short, so not worth caching)
  return list;
}

// ("Memoirs" is known where "memoir" is: a plural or a verb ending does not make a new word)
const stems = (w) => (w.length > 4 && w.endsWith('ies') ? [w, `${w.slice(0, -3)}y`] : w.length > 3 && w.endsWith('es') ? [w, w.slice(0, -2), w.slice(0, -1)] : w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? [w, w.slice(0, -1)] : [w]);
const wordKnown = (vs, w) => stems(w).some((x) => vs.some((v) => v.words.has(x)));
const trustedWord = (vs, w) => stems(w).some((x) => vs.some((v) => v.trusted && v.words.has(x)));
const ordinary = (vs, w) => STOPWORDS.has(w) || OPENERS.has(w) || ORDINARY_OPENERS.has(w) || vs.some((v) => v.lower.has(w));

/**
 * Does the run occur in a source, word after word (a capitalised middle word may sit between: "Commissioner Haldric" for "Commissioner Emeric Haldric")?
 * `budget.left` bounds the work for one reply (a common first word in a long text has thousands of places to try): when it runs out the run counts as NOT found,
 * which only ever removes a sentence, never keeps an invented name.
 */
function phraseKnown(vs, parts, budget) {
  for (const v of vs) {
    for (const i of v.pos.get(parts[0]) ?? []) {
      if (--budget.left < 0) return false;
      let at = i;
      let ok = true;
      for (let k = 1; ok && k < parts.length; k++) {
        if (v.toks[at + 1] === parts[k]) at += 1;
        else if (v.caps[at + 1] && v.toks[at + 2] === parts[k]) at += 2;
        else ok = false;
      }
      if (ok) return true;
    }
  }
  return false;
}

// ── names ────────────────────────────────────────────────────────────────────

const isLeadingFiller = (parts, k) => {
  const lo = parts[k].toLowerCase();
  return STOPWORDS.has(lo) || TITLES.has(lo) || (ROLE_WORDS.has(lo) && k + 1 < parts.length);
};

const labelWord = (vs, w) => ordinary(vs, w) || CRAFT.has(w) || trustedWord(vs, w) || (w.length >= 5 && ABSTRACT_SUFFIX.test(w));

/**
 * A run of capitalised words that is not found as a run: every stretch of words in it that is not a label ("Whether", "Opening", "Dark Night") must still be known,
 * a single word anywhere in a source, several words as a run. "Whether Dad" passes (Dad is the text's), "Foreshadowing Aunt Dilys" passes, "Haldric Ombrecht" does not.
 */
function runKnown(vs, lows, budget) {
  for (let i = 0; i < lows.length; ) {
    if (labelWord(vs, lows[i])) {
      i++;
      continue;
    }
    let j = i;
    while (j < lows.length && !labelWord(vs, lows[j])) j++;
    const seg = lows.slice(i, j);
    if (seg.length === 1 ? !wordKnown(vs, seg[0]) : !phraseKnown(vs, seg, budget)) return false;
    i = j;
  }
  return true;
}

// A capitalised word that opens a sentence proves nothing ("Pacing", "Then"), unless it is no word of English that any source or list has and a verb of doing or
// saying follows it at once ("Torvald waits at the gate"): then it is a name, and it has to be one of the sources'.
const PRESENT = new Set(
  ('is was has does says asks replies answers walks runs comes goes sees takes makes knows gives finds tells holds keeps stands sits begins writes speaks hears falls becomes meets leaves feels thinks wants needs waits watches appears arrives enters ' +
    'refuses agrees decides returns follows discovers remembers tries hides lies dies lives loves hates fears carries brings sends calls shouts whispers laughs smiles nods frowns sighs weeps cries looks turns opens closes reads kills saves wins loses ' +
    'plans plays pays picks pushes pulls reaches rises shows sleeps steps stops stays strikes struggles touches travels trusts uses visits wakes warns wears works wonders waves glances stares hesitates reveals climbs leads grows changes moves lingers pauses starts mentions ' +
    'introduces explains suggests offers demands insists hopes realises realizes notices recalls narrates describes confronts confesses admits denies accuses betrays helps joins departs vanishes disappears survives fights chases hunts escapes doubts sells buys owns ' +
    'rules serves guards sings dances paints builds breaks burns cooks cuts drinks drives eats flies hits hurts jumps kicks kisses knocks lifts listens locks marries').split(' ')
);
const PAST = new Set(
  ('said asked replied answered walked ran came went saw took made knew gave found told held kept stood sat began wrote spoke heard fell became met left felt thought wanted needed waited watched appeared arrived entered refused agreed decided returned ' +
    'followed discovered remembered tried hid lied died lived loved hated feared carried brought sent called shouted whispered laughed smiled nodded frowned sighed wept cried looked turned opened closed read killed saved won lost planned played paid picked ' +
    'pushed pulled reached rose set showed slept stepped stopped stayed struck struggled touched travelled traveled trusted used visited woke warned wore worked wondered waved glanced stared hesitated revealed climbed led grew changed moved lingered paused started ' +
    'mentioned introduced explained suggested offered demanded insisted hoped realised realized noticed recalled narrated described confronted confessed admitted denied accused betrayed helped joined departed vanished disappeared survived fought chased hunted ' +
    'escaped doubted sold bought owned served guarded sang danced painted built broke burned burnt cooked drank drove ate flew hit hurt jumped kicked kissed knocked lifted listened locked married will would can could must may might shall should').split(' ')
);
function namelikeOpener(sentence, run, vs) {
  const lo = run.parts[0].toLowerCase().replace(/’/g, "'");
  if (lo.length < 3 || wordKnown(vs, lo) || labelWord(vs, lo)) return false;
  const after = /^[ \t]+([\p{L}']+)/u.exec(sentence.slice(run.end));
  if (!after) return false;
  const verb = after[1].toLowerCase();
  // (a plural noun takes the plain or the past form too: "Adverbs cluster", "Adverbs appeared"; only a singular verb is a sign of a name that ends in s)
  const plural = lo.endsWith('s') && !lo.endsWith('ss');
  return plural ? PRESENT.has(verb) : PRESENT.has(verb) || PAST.has(verb);
}

/** The capitalised names in one sentence that no source has. */
function unknownNames(sentence, vs, ctx) {
  const out = [];
  for (const run of capitalisedRuns(sentence)) {
    const parts = run.parts;
    let lead = 0;
    while (lead < parts.length && isLeadingFiller(parts, lead)) lead++;
    let end = parts.length;
    while (end > lead && STOPWORDS.has(parts[end - 1].toLowerCase())) end--;
    if (lead >= end) continue;
    if (run.initial && lead === 0) {
      const first = parts[0].toLowerCase().replace(/’/g, "'");
      if (end === 1) {
        if (!run.possessive && !namelikeOpener(sentence, run, vs)) continue; // the capital of a sentence's first word proves nothing
      } else if (labelWord(vs, first) || (first.length > 4 && first.endsWith('ly'))) lead = 1;
    }
    let piece = [];
    const flush = () => {
      if (!piece.length) return;
      const lows = piece.map((p) => p.toLowerCase().replace(/’/g, "'"));
      const memo = lows.join(' ');
      let known = ctx.memo.get(memo);
      if (known === undefined) {
        known = lows.length === 1 ? wordKnown(vs, lows[0]) || labelWord(vs, lows[0]) : phraseKnown(vs, lows, ctx.budget) || runKnown(vs, lows, ctx.budget);
        ctx.memo.set(memo, known);
      }
      if (!known) out.push(piece.join(' '));
      piece = [];
    };
    for (let k = lead; k < end; k++) {
      const lo = parts[k].toLowerCase();
      if (neverName(parts[k]) || isHeadingNumber(lo)) flush();
      else piece.push(parts[k]);
    }
    flush();
  }
  return [...new Set(out)];
}

const NUMBER_WORD_RE = /^(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million)(?:-\w+)?$/;
const isHeadingNumber = (lo) => NUMBER_WORD_RE.test(lo);

// ── numbers ──────────────────────────────────────────────────────────────────

const ABOUT_THE_TEXT = /\b(?:your|the|this|that|his|her|their)\s+(?:text|draft|story|novel|bible|chapters?|sections?|scenes?|paragraphs?|manuscript|piece|script|poem|essay|book|passage|notes|opening|ending|document|timeline)\b/i;
const APPROX = /\b(?:about|around|roughly|nearly|almost|approximately|approx\.?|some|over|under|just over|just under|more than|less than|close to|up to)\s*$/i;
const LOCATOR = /\b(?:sections?|chapters?|scenes?|paragraphs?|parts?|pages?|lines?|acts?|passages?|numbers?|no\.?|#)\s*$/i;
// "sections 3, 7 and 12" (no nested quantifier: a long run of digits cannot make this backtrack)
const LOCATOR_LIST = /\b(?:sections?|chapters?|scenes?|paragraphs?|parts?|pages?|lines?|acts?)\s+\d+(?:\s*(?:,\s*(?:and|or)|,|and|or|to|&|–|-)\s*\d+)*$/i;

/** Numbers in the sentence that no source has, when the sentence says them as facts about the text. */
function unknownNumbers(sentence, vs, sections) {
  const speaksOfText = ABOUT_THE_TEXT.test(sentence);
  const out = [];
  const marker = /^\s*\d{1,3}[.)]/.exec(sentence); // "10. Consider...": the number of a list item is not a fact about the text
  const markerEnd = marker ? marker[0].length : 0;
  for (const n of numbersIn(sentence, { limit: 50 })) {
    if (n.end <= markerEnd) continue;
    const before = sentence.slice(Math.max(0, n.start - 40), n.start);
    if (LOCATOR.test(before) || LOCATOR_LIST.test(sentence.slice(Math.max(0, n.start - 60), n.end))) {
      if (Number.isFinite(sections) && sections > 0 && n.digits && n.value > sections) out.push(n.written); // there is no such section
      continue;
    }
    const heavy = n.digits ? n.value >= 10 || /[,.]/.test(n.written) : n.value >= 10;
    if (!(speaksOfText && heavy) || vs.some((v) => numbersOf(v).has(n.value))) continue;
    // "about 10,000 words" for 10,374 is an estimate and says so: within 5% of a number the sources have
    if (APPROX.test(before) && vs.some((v) => [...numbersOf(v)].some((x) => x > 0 && Math.abs(x - n.value) <= 0.05 * x))) continue;
    out.push(n.written);
  }
  return [...new Set(out)];
}

// ── dates and patterns in a library answer ──────────────────────────────────

const ORDINALS = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth', 'twentieth', 'twenty-first'];
const ORD = `(?:\\d{1,2}(?:st|nd|rd|th)|${ORDINALS.join('|')})`;
const CENTURY_RE = new RegExp(`\\b(${ORD}(?:\\s*(?:,|and|or|to|-|–)\\s*${ORD})*)[\\s-]+centur(?:y|ies)\\b`, 'gi');
const ORD_RE = new RegExp(ORD, 'gi');
const DECADE_RE = /\b(\d{3})0s\b/g;
const SCHEME_RE = /\b[A-Z]{5,}\b/g;
const ordinalValue = (w) => (/^\d/.test(w) ? parseInt(w, 10) : ORDINALS.indexOf(w.toLowerCase()) + 1);
const centuryOfYear = (y) => Math.floor((y - 1) / 100) + 1;

/** The years, decades, centuries and capital runs a text states. `said` are the centuries it names outright; `centuries` adds those of its years and decades (what a text can ground). */
function factsIn(text) {
  const years = new Set(numbersIn(text, { limit: 20000 }).filter((n) => n.digits && Number.isInteger(n.value) && n.value >= 1000 && n.value <= 2100).map((n) => n.value));
  const decades = new Set([...text.matchAll(DECADE_RE)].map((m) => Number(m[1]) * 10));
  const said = new Set();
  for (const m of text.matchAll(CENTURY_RE)) for (const o of m[1].matchAll(ORD_RE)) said.add(ordinalValue(o[0]));
  const centuries = new Set(said);
  for (const y of years) centuries.add(centuryOfYear(y));
  for (const d of decades) centuries.add(centuryOfYear(d));
  return { years, decades, said, centuries, schemes: new Set(text.match(SCHEME_RE) ?? []) };
}
const factsOf = (v) => (v.facts ??= factsIn(v.source));
const suffix = (n) => (n % 100 >= 11 && n % 100 <= 13 ? 'th' : n % 10 === 1 ? 'st' : n % 10 === 2 ? 'nd' : n % 10 === 3 ? 'rd' : 'th');

/** Dates and patterns the sentence states that no source has (see `facts` above). */
function unknownFacts(sentence, vs) {
  const have = vs.filter((v) => !v.trusted).map(factsOf);
  const mine = factsIn(sentence);
  const out = [];
  for (const y of mine.years) if (!have.some((f) => f.years.has(y))) out.push(String(y));
  for (const d of mine.decades) if (!have.some((f) => f.decades.has(d) || [...f.years].some((y) => y >= d && y < d + 10))) out.push(`${d}s`);
  for (const c of mine.said) if (!have.some((f) => f.centuries.has(c))) out.push(`${c}${suffix(c)} century`);
  for (const t of mine.schemes) if (!have.some((f) => f.schemes.has(t))) out.push(t);
  return [...new Set(out)];
}

// ── the check ────────────────────────────────────────────────────────────────

/**
 * @param {string} reply
 * @param {{ sources?: string[], known?: string[], sections?: number|null }} o
 *   `sources`: everything the reply may have learnt names and numbers from (the writer's text, their messages, the project's memory, the measured facts it was given).
 *   `known`: a short allow-list (NIE's own words, the profile's words, the labels of kinds, forms and genres, the names in a library answer).
 *   `sections`: how many sections the text has, so that "section 99" of a 25-section text is caught.
 * @returns {{ text: string, removed: { sentence: string, names: string[], numbers: string[] }[], emptied: boolean }}
 *   `emptied` is true when nothing is left: the caller says so instead of showing an empty reply.
 */
export function groundNames(reply, opts) {
  const { sources = [], known = [], sections = null, facts = false } = opts && typeof opts === 'object' ? opts : {};
  const src = typeof reply === 'string' ? reply : '';
  const result = { text: src, removed: [], emptied: false };
  if (!src.trim()) return { ...result, text: '' };
  const vs = vocabularies(sources, known);
  const ctx = { memo: new Map(), budget: { left: 4_000_000 } };
  const spans = sentenceSpans(src);
  const verdicts = spans.map((sp) => ({ sp, names: unknownNames(sp.text, vs, ctx), numbers: [...unknownNumbers(sp.text, vs, sections), ...(facts ? unknownFacts(sp.text, vs) : [])] }));
  // A name the check has just refused comes back in other sentences of the same reply, often at the start of one ("Haldric watches the harbour"), where a capital
  // proves nothing and the first look let it pass: a word that no source has, and that is not ordinary English, goes with the sentences that named it.
  const refused = new Set();
  for (const v of verdicts) {
    for (const nm of v.names) {
      for (const part of nm.split(' ')) {
        const lo = part.toLowerCase().replace(/’/g, "'");
        if (lo.length >= 3 && !wordKnown(vs, lo) && !labelWord(vs, lo)) refused.add(lo);
      }
    }
  }
  if (refused.size) {
    for (const v of verdicts) {
      if (v.names.length) continue;
      for (const run of capitalisedRuns(v.sp.text)) {
        for (const part of run.parts) if (refused.has(part.toLowerCase().replace(/’/g, "'"))) v.names.push(part);
      }
    }
  }
  const cut = [];
  for (const v of verdicts) {
    if (v.names.length || v.numbers.length) {
      cut.push(v.sp);
      result.removed.push({ sentence: v.sp.text, names: [...new Set(v.names)], numbers: v.numbers });
    }
  }
  if (!cut.length) return result;
  const text = removeSpans(src, cut);
  const left = /[\p{L}\p{N}]/u.test(text);
  return { text: left ? text : '', removed: result.removed, emptied: !left };
}
