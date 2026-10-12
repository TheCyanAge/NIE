import test from 'node:test';
import assert from 'node:assert/strict';
import {
  NOTES_VERSION, NOTE_SCHEMA, NOTE_SYSTEM, OVERVIEW_SYSTEM, buildNoteMessages, emptyReadingNotes, estimateReadMs, makeOverview, overviewMessages, parseNote,
  cachedNotes, projectNotesCache, readThrough, rulesNote, sanitizeReadingNotes, sectionKey,
} from '../apps/web/src/engine/reading/notes.js';
import { buildIndex } from '../apps/web/src/engine/reading/context.js';
import { splitSections, sectionText } from '../apps/web/src/engine/reading/sections.js';
import { AIError } from '../apps/web/src/engine/ai/openai-client.js';
import { estimateTokens, fnv1a, words as wordsIn } from '../apps/web/src/engine/util/text.js';
import { makeLongText } from './fixtures/long-text.mjs';
import { projectWith } from './helpers.js';

// ── fakes ────────────────────────────────────────────────────────────────────

const NAME_POOL = ['Ilsa Quade', 'Tomas Verrick', 'Marit Oland', 'Dov Anselm', 'Brenna Hale', 'Corin Ashby', 'Odalys Venn', 'Pell Hargrove', 'Wren Calloway', 'Fenn Marlowe'];
/** The section text inside a note prompt. */
const sectionIn = (messages) => messages.at(-1).content.match(/"""\n([\s\S]*?)\n"""/)?.[1] ?? '';
/** What a good model would say about a section: names that really are in it. */
const noteJson = (text, { extraNames = [], gist } = {}) => {
  const names = NAME_POOL.filter((n) => text.includes(n)).slice(0, 3);
  return JSON.stringify({ gist: gist ?? `The part follows ${names[0] ?? 'the crew'} through an ordinary day`, names: [...names, ...extraNames], terms: [], voice: 'plain, quiet, observational' });
};
const good = (messages) => ({ text: noteJson(sectionIn(messages)), route: 'local' });

/** A fake engine { chat } that records every call; `handler(messages, opts, n)` answers (n counts from 1). */
function engineOf(handler = good) {
  const calls = [];
  return { calls, chat: async (messages, opts) => { calls.push({ messages, opts }); return handler(messages, opts, calls.length); } };
}
const unusable = () => ({ text: 'I am not able to do that, sorry.', route: 'local' });
const nothing = () => ({ text: null, route: 'builtin', error: null });

/** An index made by hand: each part is one section (exact control of word counts and hashes). */
function handIndex(parts) {
  const text = parts.join('\n\n');
  let at = 0;
  const sections = parts.map((p, i) => {
    const start = at;
    const end = i === parts.length - 1 ? text.length : at + p.length + 2;
    at = end;
    const slice = text.slice(start, end);
    return { i, start, end, title: '', under: '', words: wordsIn(slice).length, hash: fnv1a(slice) };
  });
  return { text, sections };
}
const longPart = (seed, n = 60) => `${NAME_POOL[seed % NAME_POOL.length]} carried item${seed} to the pier. ${Array.from({ length: n }, (_, k) => `thing${seed}x${k}`).join(' ')}.`;
const shortPart = (seed) => `Tiny note number ${seed}.`;

const clock = () => { const c = { t: 0, now: () => c.t, tick: (ms = 1000) => (c.t += ms) }; return c; };

// ── the schema and the prompt ────────────────────────────────────────────────

test('the note schema is frozen, has exactly four required fields and takes nothing else', () => {
  assert.equal(NOTES_VERSION, 1);
  assert.ok(Object.isFrozen(NOTE_SCHEMA) && Object.isFrozen(NOTE_SCHEMA.properties) && Object.isFrozen(NOTE_SCHEMA.required));
  assert.equal(NOTE_SCHEMA.type, 'object');
  assert.deepEqual(Object.keys(NOTE_SCHEMA.properties), ['gist', 'names', 'terms', 'voice']);
  assert.deepEqual([...NOTE_SCHEMA.required].sort(), ['gist', 'names', 'terms', 'voice']);
  assert.equal(NOTE_SCHEMA.additionalProperties, false);
  assert.deepEqual(NOTE_SCHEMA.properties.gist, { type: 'string', maxLength: 260 });
  assert.deepEqual(NOTE_SCHEMA.properties.names, { type: 'array', items: { type: 'string', maxLength: 48 }, maxItems: 6 });
  assert.deepEqual(NOTE_SCHEMA.properties.terms, { type: 'array', items: { type: 'string', maxLength: 48 }, maxItems: 4 });
  assert.deepEqual(NOTE_SCHEMA.properties.voice, { type: 'string', maxLength: 70 });
  assert.throws(() => { 'use strict'; NOTE_SCHEMA.properties.gist.maxLength = 9999; }, TypeError);
});

test('the system prompt forbids inventing, writing and praise, and asks for the four fields', () => {
  assert.match(NOTE_SYSTEM, /^You take private reading notes on ONE part of a writer's text, for yourself\./);
  assert.match(NOTE_SYSTEM, /Use only words and names that appear in it\./);
  assert.match(NOTE_SYSTEM, /never write, continue or improve the story, never quote long stretches, never praise it/);
  for (const f of ['gist:', 'names:', 'terms:', 'voice:']) assert.ok(NOTE_SYSTEM.includes(f), f);
  assert.match(OVERVIEW_SYSTEM, /Use only what the notes say/);
  assert.match(OVERVIEW_SYSTEM, /never praise it/);
});

test('a section prompt is the fixed system text, then the part number, where it sits, and the section in triple quotes', () => {
  const m = buildNoteMessages('  The boat left at dawn.\n\nNobody waved.  ', { i: 2, total: 29, under: 'Chapter Seven: The Salt Roads and Everything That Happened On Them Afterwards' });
  assert.equal(m.length, 2);
  assert.deepEqual(m[0], { role: 'system', content: NOTE_SYSTEM });
  assert.equal(m[1].role, 'user');
  assert.equal(m[1].content, 'Part 3 of 29 (under "Chapter Seven: The Salt Roads and Everything That…"):\n"""\nThe boat left at dawn.\n\nNobody waved.\n"""\nWrite the notes.');
  assert.equal(buildNoteMessages('Text.', { i: 0, total: 1 })[1].content, 'Part 1 of 1:\n"""\nText.\n"""\nWrite the notes.');
});

// ── reading the model's answer, and keeping it honest ────────────────────────

const SECTION = 'Lake Tegano froze early that year. Delton rowed out with Mara Quill, and the Ferryman Guild met on Tuesday. Then Delton said nothing. "Hello there," said Mara. Delton\'s boat was old, and the lake knew it.';

test('a good JSON answer becomes a note marked as the model\'s', () => {
  const n = parseNote(JSON.stringify({ gist: 'Delton rows out onto the frozen Lake Tegano with Mara Quill.', names: ['Delton', 'Lake Tegano', 'Mara Quill'], terms: ['Ferryman Guild'], voice: 'tense, close, sensory' }), SECTION);
  assert.deepEqual(n, { gist: 'Delton rows out onto the frozen Lake Tegano with Mara Quill.', names: ['Delton', 'Lake Tegano', 'Mara Quill'], terms: ['Ferryman Guild'], voice: 'tense, close, sensory', by: 'model' });
});

test('names and terms the section does not contain are dropped, whatever the model says', () => {
  const n = parseNote(JSON.stringify({ gist: 'Delton rows out with Mara Quill on the frozen lake.', names: ['Delton', 'Zorp the Wise', 'Mara Quill', 'Queen Isolde', 'Delt', 'lake'], terms: ['Ferryman Guild', 'flux capacitor', 'Guild Master'], voice: 'dry' }), SECTION);
  assert.deepEqual(n.names, ['Delton', 'Mara Quill', 'lake'], 'the invented ones are gone, and half a name ("Delt") is not the name');
  assert.deepEqual(n.terms, ['Ferryman Guild']);
});

test('grounding ignores case and runs of spaces, returns the TEXT\'s spelling, and matches whole words only', () => {
  const n = parseNote(JSON.stringify({ gist: 'Delton rows out with Mara Quill on the lake.', names: ['delton', 'LAKE   TEGANO', 'mara\nquill', 'Delton', 'Del', 'ton'], terms: [], voice: '' }), SECTION);
  assert.deepEqual(n.names, ['Delton', 'Lake Tegano', 'Mara Quill'], 'deduplicated case-insensitively; "Del" and "ton" are parts of a word');
  const apostrophe = parseNote(JSON.stringify({ gist: 'Her father\'s boat sinks near the old pier.', names: ["Dad's Boat", 'O\'Hara'], terms: [], voice: '' }), 'Dad’s boat sank near O’Hara’s pier. It was old.');
  assert.deepEqual(apostrophe.names, ['Dad’s boat', 'O’Hara'], 'curly and straight apostrophes are the same letter');
});

test('lists are capped at 6 names and 4 terms, empties and non-strings are dropped', () => {
  const text = NAME_POOL.join(', ') + '. ' + 'alpha beta gamma delta epsilon zeta eta.';
  const n = parseNote(JSON.stringify({ gist: 'A roll call of everyone who matters here.', names: ['', '  ', 7, null, ...NAME_POOL], terms: ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta'], voice: 'list' }), text);
  assert.deepEqual(n.names, NAME_POOL.slice(0, 6));
  assert.deepEqual(n.terms, ['alpha', 'beta', 'gamma', 'delta']);
  const odd = parseNote(JSON.stringify({ gist: 'Delton rows across the lake today.', names: 'Delton, Zorp, Mara Quill', terms: { a: 1 }, voice: 5 }), SECTION);
  assert.deepEqual(odd.names, ['Delton', 'Mara Quill'], 'a comma-separated string is read as a list');
  assert.deepEqual(odd.terms, []);
  assert.equal(odd.voice, '');
});

test('the gist: whitespace collapsed, surrounding quotes removed, cut at 30 words with an ellipsis only when cut mid-thought', () => {
  const g = (gist) => parseNote(JSON.stringify({ gist, names: [], terms: [], voice: '' }), SECTION)?.gist;
  assert.equal(g('  "Delton rows\n out   onto the lake."  '), 'Delton rows out onto the lake.');
  assert.equal(g('“Delton rows out onto the lake.”'), 'Delton rows out onto the lake.');
  assert.equal(g('"Go," said Delton, "now."'), '"Go," said Delton, "now."', 'quotes inside the sentence are the writer\'s speech, not wrapping');
  const forty = Array.from({ length: 40 }, (_, k) => `word${k}`).join(' ');
  const cut = g(forty);
  assert.equal(cut.split(' ').length, 30);
  assert.ok(cut.endsWith('word29…'), cut);
  const endsHere = Array.from({ length: 29 }, (_, k) => `word${k}`).join(' ') + ' end. And then it goes on and on and on.';
  assert.equal(g(endsHere).split(' ').length, 30);
  assert.ok(g(endsHere).endsWith('end.') && !g(endsHere).endsWith('…'), 'a cut that lands on a sentence end gets no ellipsis');
  const exact = Array.from({ length: 30 }, (_, k) => `w${k}`).join(' ');
  assert.equal(g(exact), exact, 'exactly 30 words is not cut');
});

test('a gist that is too short, or the model talking to NIE instead of taking notes, is no note', () => {
  const g = (gist) => parseNote(JSON.stringify({ gist, names: [], terms: [], voice: '' }), SECTION);
  assert.equal(g('Boats.'), null);
  assert.equal(g('Two words'), null);
  assert.equal(g(''), null);
  for (const refusal of ['I cannot help with that request.', "I can't read this part, sorry.", 'As an AI language model I do not take notes.', 'Here are the notes you asked for today.', 'Note: this part is about boats.', 'Sure, here is the summary of this part.', "I'm sorry but that is not something I can do."]) {
    assert.equal(g(refusal), null, refusal);
  }
  assert.ok(g('Sure enough, the crew leaves before dawn.'), '"Sure enough" is a sentence about the story');
  assert.ok(g('Delton cannot swim, which the whole village knows.'), 'a story sentence that merely contains "cannot" is fine');
  assert.equal(parseNote('{"names":["Delton"],"terms":[],"voice":"dry"}', SECTION), null, 'no gist, no note');
});

test('the voice is at most 8 words, with a lower-case first letter and no trailing full stop', () => {
  const v = (voice) => parseNote(JSON.stringify({ gist: 'Delton rows out onto the lake.', names: [], terms: [], voice }), SECTION).voice;
  assert.equal(v('Tense, close, sensory.'), 'tense, close, sensory');
  assert.equal(v('"Dry, technical, explanatory"'), 'dry, technical, explanatory');
  assert.equal(v('one two three four five six seven eight nine ten'), 'one two three four five six seven eight');
  assert.equal(v('Calm'), 'calm');
  assert.equal(v(''), '');
  assert.ok(v('Extraordinarily-hyphenated-description of an unusually extraordinary-sounding prose style indeed').length <= 70);
});

test('tolerates fences, chatter, a cut-off answer and plain junk', () => {
  const body = '{"gist":"Delton rows out onto the frozen lake with Mara Quill.","names":["Delton","Mara Quill"],"terms":[],"voice":"quiet, close"}';
  assert.equal(parseNote('```json\n' + body + '\n```', SECTION).names.length, 2);
  assert.equal(parseNote(`Here is the JSON you wanted:\n${body}\nHope that helps!`, SECTION).voice, 'quiet, close');
  assert.equal(parseNote({ gist: 'Delton rows out onto the lake today.', names: ['Delton'], terms: [], voice: 'dry' }, SECTION).names[0], 'Delton', 'an already parsed object works too');
  // cut off by the token limit in the middle of the names list: what was finished is kept
  const cutOff = parseNote('{"gist":"Delton rows out onto the frozen lake with Mara Quill.","names":["Delton","Mara Qu', SECTION);
  assert.equal(cutOff.gist, 'Delton rows out onto the frozen lake with Mara Quill.');
  assert.deepEqual(cutOff.names, ['Delton']);
  assert.deepEqual(cutOff.terms, []);
  assert.equal(cutOff.by, 'model');
  // cut off inside the gist (or the voice): half a sentence is not a note
  assert.equal(parseNote('{"gist":"Delton rows out onto the fro', SECTION), null);
  assert.equal(parseNote('{"gist":"Delton rows out onto the frozen lake.","names":["Delton"],"terms":[],"voice":"tense, clo', SECTION).voice, '');
  // invalid JSON with all the fields still readable
  const loose = parseNote('{"gist": "Delton rows out onto the lake today.", "names": ["Delton",], "terms": [], "voice": "dry",}', SECTION);
  assert.deepEqual(loose.names, ['Delton']);
  for (const junk of ['', null, undefined, 'not json at all', '[]', '[1,2]', '{}', '{"gist": 5}', 42]) assert.equal(parseNote(junk, SECTION), null, String(junk));
});

// ── nothing the model made up gets into a note ──────────────────────────────

const gistOf = (gist, section = SECTION, where) => parseNote(JSON.stringify({ gist, names: [], terms: [], voice: '' }), section, where)?.gist ?? null;

test('a gist that names someone or somewhere the section never mentions is no note at all', () => {
  assert.equal(gistOf('Queen Isolde of Valdor sails against Delton on the lake.'), null, 'an invented queen and kingdom');
  assert.equal(gistOf('Delton rows out with Mara Quill and Captain Hale.'), null, 'an invented companion');
  assert.equal(gistOf('Delton rows across Lake Tegano toward Valdor.'), null, 'one invented word among real ones is enough');
  assert.equal(gistOf('Delton meets the Duke of Avalon on the ice.'), null);
  assert.equal(gistOf('Delton, Mara Quill and Dolton row out.'), null, 'a misspelt name is not the name');
  assert.equal(gistOf('Delton rows out onto the lake in Tuesday and Friday weather.'), null, 'a day the text never names');
  // what is in the text is fine, however the model writes it
  assert.equal(gistOf('Delton rows out with Mara Quill across Lake Tegano.'), 'Delton rows out with Mara Quill across Lake Tegano.');
  assert.ok(gistOf("Delton's boat crosses LAKE TEGANO while the Ferryman Guild meets on Tuesday."), 'possessives, capitals and a named day that is in the text');
  assert.ok(gistOf('Describes how Delton and the Guilds of the lake villages meet.', 'Delton met the guild. The Ferryman Guild met at the lake villagers\' hall.'), 'plural and derived forms of words the text has');
  assert.ok(gistOf('Nobody speaks while Delton rows out onto the lake.'), 'the first word of a sentence proves nothing either way');
  assert.ok(gistOf('Delton rows out. Afterwards Mara Quill waits at Lake Tegano.'), 'every sentence of the gist is read, each starting fresh');
  assert.ok(gistOf('Delton rows out in Part 2 of the tale, with Mara Quill.'), '"Part" is how the prompt numbers the parts');
});

test('a name that opens the gist is checked too when the model itself lists it among the names', () => {
  const parse = (gist, names) => parseNote(JSON.stringify({ gist, names, terms: [], voice: '' }), SECTION);
  assert.equal(parse('Isolde rows out onto the frozen lake with Delton.', ['Isolde', 'Delton']), null, 'an invented subject the model declared');
  assert.equal(parse('Isolde rows out onto the frozen lake with Delton.', ['Delton']).by, 'model', 'not declared: the limit, noted in the code');
  assert.ok(parse('Introduces Delton, who rows out onto the frozen lake.', ['Delton']), 'a verb that opens the gist is not a name');
  assert.equal(parse('Overview of Delton rowing out onto the frozen lake.', ['Delton', 'Overview']), null, 'a word the model calls a name, that is not in the text, is not safe to keep either');
  assert.ok(parse('Delton rows out onto the frozen lake.', ['Delton', 'queen isolde']), 'lower-case entries are not names');
});

test('the heading a section sits under counts as shown to the model, the section text alone is not the whole prompt', () => {
  const body = 'He mended the nets all morning and said very little to anyone at all about it.';
  assert.equal(gistOf('Continues the Salt Roads journey with the mending of nets.', body), null, 'not in the section, not under the heading');
  assert.ok(gistOf('Continues the Salt Roads journey with the mending of nets.', body, { under: 'Chapter Seven: The Salt Roads' }));
  assert.ok(gistOf('Continues the Salt Roads journey with the mending of nets.', body, { title: 'The Salt Roads' }));
});

test('a voice that names an author or anyone else the text does not is dropped, the gist stays', () => {
  const v = (voice) => parseNote(JSON.stringify({ gist: 'Delton rows out onto the lake today.', names: [], terms: [], voice }), SECTION).voice;
  assert.equal(v('spare, like Hemingway'), '');
  assert.equal(v('quiet, close, Tegano'), 'quiet, close, Tegano');
  assert.equal(v('Hemingway-esque, spare'), 'hemingway-esque, spare', 'the first word is read as a sentence start, not a name (a limit, noted in the code)');
  assert.equal(v('Dry, Technical, Explanatory'), 'dry, Technical, Explanatory', 'a capital after a comma opens a phrase, it is not a name');
  assert.equal(v('plain, like Hemingway'), '');
});

test('a gist that is the prompt read back is the model copying its instructions, not a note', () => {
  assert.equal(gistOf('one plain sentence of at most 25 words saying what happens or is explained in this part'), null);
  assert.equal(gistOf('Up to 6 people, places, groups or named things that matter in this part, spelled as the text does.'), null);
  assert.equal(gistOf('3 to 6 words on how this part is written, for example dry and technical.'), null);
  assert.equal(gistOf('A plain sentence saying what happens in this part of the text.'), null);
  assert.ok(gistOf('Delton says one plain thing and rows away.'), 'one plain thing is a story sentence');
});

test('a function word is not a name: "the", "Then" and "that" are in every text, "Will" is a name where the writer capitalises it in a sentence', () => {
  const n = parseNote(JSON.stringify({ gist: 'Delton rows out onto the frozen lake.', names: ['the', 'Then', 'and', 'Delton'], terms: ['that', 'Ferryman Guild'], voice: '' }), SECTION);
  assert.deepEqual(n.names, ['Delton']);
  assert.deepEqual(n.terms, ['Ferryman Guild']);
  const will = parseNote(JSON.stringify({ gist: 'Mara tells Will about the ferry today.', names: ['Will', 'will'], terms: [], voice: '' }), 'Mara told Will about the ferry. Will you come, she asked. He will.');
  assert.deepEqual(will.names, ['Will']);
});

test('a full stop that closes the model\'s sentence is not part of a name', () => {
  const n = parseNote(JSON.stringify({ gist: 'Delton rows out onto the frozen lake.', names: ['Delton.', 'Mara Quill.', 'Zorp.'], terms: [], voice: '' }), SECTION);
  assert.deepEqual(n.names, ['Delton', 'Mara Quill']);
});

test('a note is the same size in memory as in the cache: the gist is cut at 300 characters, at a word', () => {
  const long = Array.from({ length: 29 }, (_, k) => `extraordinarily${k}`).join(' ');
  const note = parseNote(JSON.stringify({ gist: long, names: [], terms: [], voice: '' }), long);
  assert.ok(note.gist.length <= 300 && note.gist.endsWith('…'), `${note.gist.length}`);
  const cache = projectNotesCache({});
  cache.set('1:aaaa1111', note);
  assert.deepEqual(cache.get('1:aaaa1111'), note, 'what comes back from the cache is what was put in (the overview key hashes the gists)');
});

test('a model that lists a thousand names is not tested a thousand times', () => {
  const t0 = performance.now();
  const names = [...Array(5000)].map((_, k) => `Invented${k} Person`).concat(['Delton']);
  const n = parseNote(JSON.stringify({ gist: 'Delton rows out onto the lake today.', names, terms: [], voice: '' }), SECTION);
  assert.ok(performance.now() - t0 < 500);
  assert.ok(n.names.length <= 6 && n.names.every((x) => SECTION.includes(x)));
});

// ── the rule-based note ──────────────────────────────────────────────────────

test('a rules note is the first sentence and the names in it, marked as rules, with no terms and no voice', () => {
  const n = rulesNote(SECTION, { title: 'Chapter 1' });
  assert.equal(n.by, 'rules');
  assert.equal(n.gist, 'Lake Tegano froze early that year.');
  assert.deepEqual(n.terms, []);
  assert.equal(n.voice, '');
  for (const name of ['Delton', 'Lake Tegano', 'Mara Quill', 'Ferryman Guild']) assert.ok(n.names.includes(name), `${name} in ${n.names.join(', ')}`);
});

test('sentence-initial words, months, days and "Year" are not names; a word capitalised mid-sentence somewhere is', () => {
  const text = 'The harbour was quiet. Nobody spoke. Then Delton left on Monday in March of the Year of Ash. Yesterday Delton came back. Rain fell. Dover was far. We walked to Dover.';
  const n = rulesNote(text);
  assert.ok(n.names.includes('Delton'));
  assert.ok(n.names.includes('Dover'), '"Dover" is capitalised mid-sentence once, so its sentence-initial use counts too');
  for (const not of ['The', 'Nobody', 'Then', 'Monday', 'March', 'Year', 'Yesterday', 'Rain', 'We']) assert.ok(!n.names.includes(not) && !n.names.some((x) => x.split(' ').includes(not)), `${not} is not a name: ${n.names.join(', ')}`);
});

test('two capitals in a row at the start of a sentence are a name ("Lake Tegano froze"), unless the first is a plain opener', () => {
  const n = rulesNote('Lake Tegano froze early. Corin Ashby watched it freeze. Suddenly Wren ran home. Part One ends here.');
  assert.ok(n.names.includes('Lake Tegano') && n.names.includes('Corin Ashby'), n.names.join(', '));
  assert.ok(!n.names.some((x) => /Suddenly|Part|One/.test(x)), n.names.join(', '));
});

test('possessives, titles and "I" are handled: Delton\'s is Delton, "I\'m" is no name', () => {
  const n = rulesNote("She took Delton's oar. I'm sure Dr. Quill saw it. Then I left; Delton waved.");
  assert.ok(n.names.includes('Delton'), n.names.join(', '));
  assert.ok(n.names.includes('Quill'), 'the capital after "Dr." is mid-sentence');
  assert.ok(!n.names.some((x) => /^I/.test(x) && x.length < 3), n.names.join(', '));
  assert.ok(!n.names.some((x) => x.includes("'")), 'no possessive endings');
});

test('a rules note names only the 6 most frequent, most frequent first, and the gist skips a heading and is at most 30 words', () => {
  const people = ['Aldo Brent', 'Bina Corr', 'Cato Dray', 'Dilys Eames', 'Edda Fenn', 'Fitz Garry', 'Gwen Holt'];
  const text = '# The Salt Roads\n\n' + people.map((p, i) => Array(i + 1).fill(`Then we met ${p} there.`).join(' ')).join(' ') + '\n\n' + Array(60).fill('word').join(' ');
  const n = rulesNote(text, { title: 'The Salt Roads' });
  assert.equal(n.names.length, 6);
  assert.equal(n.names[0], 'Gwen Holt');
  assert.ok(!n.names.includes('Aldo Brent'), 'the least frequent is left out');
  assert.equal(n.gist, 'Then we met Aldo Brent there.', 'the heading is not the gist');
  const long = rulesNote(Array(80).fill('word').join(' '));
  assert.equal(long.gist.split(' ').length, 30);
  assert.ok(long.gist.endsWith('…'));
  assert.equal(rulesNote('', { title: 'Epilogue' }).gist, 'Epilogue', 'with no text the title is all there is');
  assert.deepEqual(rulesNote('').names, []);
});

test('a rules note is deterministic and fast on a long section', () => {
  const { text } = makeLongText({ words: 3000, seed: 3 });
  const a = rulesNote(text);
  const b = rulesNote(text);
  assert.deepEqual(a, b);
  const t0 = performance.now();
  for (let i = 0; i < 20; i++) rulesNote(text);
  assert.ok(performance.now() - t0 < 1500, 'twenty notes on a 3,000-word section take well under 1.5 s');
});

// ── the pass over a whole text ───────────────────────────────────────────────

test('keys carry the version and the content hash', () => {
  assert.equal(sectionKey({ hash: 'abcd1234' }), `${NOTES_VERSION}:abcd1234`);
});

test('every section of a 10,000-word text is read, in order, each prompt holding that section and nothing else', async () => {
  const { text } = makeLongText({ words: 10000, seed: 11 });
  const index = buildIndex(text);
  const project = projectWith();
  const cache = projectNotesCache(project);
  const engine = engineOf();
  const r = await readThrough({ engine, index, cache });
  const n = index.sections.length;
  assert.ok(n >= 25 && n <= 60, `${n} sections`);
  assert.equal(engine.calls.length, n, 'one call per section');
  assert.equal(r.total, n);
  assert.equal(r.notes.length, n);
  assert.equal(r.modelRead, n);
  assert.equal(r.complete, true);
  assert.equal(r.failed, false);
  assert.equal(r.tooLong, false);
  assert.equal(r.stoppedEarly, false);
  assert.deepEqual(r.reasons, []);
  assert.ok(r.notes.every((x) => x.by === 'model' && x.gist));
  engine.calls.forEach((c, k) => {
    const s = index.sections[k];
    assert.equal(sectionIn(c.messages), sectionText(text, s).trim(), `call ${k + 1} carries section ${k + 1}`);
    assert.match(c.messages.at(-1).content, new RegExp(`^Part ${k + 1} of ${n}\\b`));
    assert.equal(c.messages[0].content, NOTE_SYSTEM);
    r.notes[k].names.forEach((name) => assert.ok(sectionText(text, s).includes(name), `${name} is in section ${k + 1}`));
  });
  assert.ok(r.notes.some((x) => x.names.length), 'the fake model\'s names really are in the sections');
  assert.equal(cache.size(), n, 'every note is cached');
});

test('the model call is made the way the design says: no stream, temperature 0, 140 tokens, the schema, purpose "notes", the signal', async () => {
  const index = buildIndex(makeLongText({ words: 2500, seed: 2 }).text);
  const ctl = new AbortController();
  const engine = engineOf();
  await readThrough({ engine, index, signal: ctl.signal });
  assert.ok(engine.calls.length >= 2);
  for (const { opts } of engine.calls) {
    assert.equal(opts.purpose, 'notes');
    assert.equal(opts.stream, false);
    assert.equal(opts.temperature, 0);
    assert.equal(opts.maxTokens, 140);
    assert.equal(opts.json, NOTE_SCHEMA);
    assert.equal(opts.signal, ctl.signal);
  }
});

test('the first model call gets the cold timeout, every later one the warm timeout', async () => {
  const index = buildIndex(makeLongText({ words: 2500, seed: 2 }).text);
  const engine = engineOf();
  await readThrough({ engine, index });
  assert.deepEqual(engine.calls.map((c) => c.opts.timeoutMs), engine.calls.map((_, k) => (k === 0 ? 150000 : 90000)));
  const custom = engineOf();
  await readThrough({ engine: custom, index, coldMs: 111, warmMs: 22 });
  assert.deepEqual(custom.calls.map((c) => c.opts.timeoutMs), custom.calls.map((_, k) => (k === 0 ? 111 : 22)));
  // "first" means first of this run: sections served from the cache do not use it up, and a failed first call does
  const idx = handIndex([longPart(1), longPart(2), longPart(3)]);
  const cache = projectNotesCache({});
  cache.set(sectionKey(idx.sections[0]), parseNote(noteJson(sectionText(idx.text, idx.sections[0])), sectionText(idx.text, idx.sections[0])));
  const e2 = engineOf((m, o, n) => (n === 1 ? unusable() : good(m)));
  await readThrough({ engine: e2, index: idx, cache, coldMs: 500, warmMs: 50 });
  assert.deepEqual(e2.calls.map((c) => c.opts.timeoutMs), [500, 50]);
});

test('sections of fewer than 40 words are their own note: no model call, read, not cached', async () => {
  const idx = handIndex([shortPart(1), longPart(2), shortPart(3), longPart(4)]);
  const cache = projectNotesCache({});
  const engine = engineOf();
  const r = await readThrough({ engine, index: idx, cache });
  assert.equal(engine.calls.length, 2);
  assert.deepEqual(r.notes.map((x) => x.by), ['text', 'model', 'text', 'model']);
  assert.equal(r.notes[0].gist, 'Tiny note number 1.');
  assert.equal(r.complete, true, 'nothing to summarise counts as read');
  assert.equal(r.modelRead, 2);
  assert.equal(cache.size(), 2, 'only the model\'s notes are cached');
  assert.equal(cache.get(sectionKey(idx.sections[0])), null);
});

test('progress is reported after every section: monotonic, the eta is null before the first model call and a number after', async () => {
  const idx = handIndex([longPart(1), longPart(2), longPart(3), longPart(4), longPart(5)]);
  const cache = projectNotesCache({});
  const c0 = sectionText(idx.text, idx.sections[0]);
  cache.set(sectionKey(idx.sections[0]), parseNote(noteJson(c0), c0)); // section 1 is already known
  const clk = clock();
  const engine = engineOf((m) => { clk.tick(1000); return good(m); });
  const seen = [];
  await readThrough({ engine, index: idx, cache, now: clk.now, onProgress: (p) => seen.push(p) });
  assert.equal(seen.length, 5);
  assert.deepEqual(seen.map((p) => p.done), [1, 2, 3, 4, 5]);
  assert.ok(seen.every((p) => p.total === 5));
  assert.equal(seen[0].etaMs, null, 'before any model call there is nothing to base an estimate on');
  assert.equal(seen[0].cached, 1);
  assert.equal(seen[0].ms, 0);
  assert.deepEqual(seen.slice(1).map((p) => p.etaMs), [3000, 2000, 1000, 0], 'mean of the model calls so far x the sections still to read');
  assert.deepEqual(seen.map((p) => p.modelRead), [1, 2, 3, 4, 5]);
  assert.equal(seen[1].ms, 1000);
  for (let k = 1; k < seen.length; k++) {
    assert.ok(seen[k].modelRead >= seen[k - 1].modelRead && seen[k].cached >= seen[k - 1].cached && seen[k].done === seen[k - 1].done + 1);
  }
});

test('the eta leaves out sections that are cached or too short to need the model', async () => {
  const idx = handIndex([longPart(1), shortPart(2), longPart(3), shortPart(4), longPart(5)]);
  const cache = projectNotesCache({});
  const c4 = sectionText(idx.text, idx.sections[4]);
  cache.set(sectionKey(idx.sections[4]), parseNote(noteJson(c4), c4));
  const clk = clock();
  const seen = [];
  await readThrough({ engine: engineOf((m) => { clk.tick(2000); return good(m); }), index: idx, cache, now: clk.now, onProgress: (p) => seen.push(p) });
  assert.equal(seen[0].etaMs, 2000, 'after section 1: only section 3 is still to be read');
  assert.equal(seen[2].etaMs, 0);
  assert.equal(seen.at(-1).etaMs, 0);
});

test('msPerSection is the mean time of the model calls, 0 when there were none', async () => {
  const idx = handIndex([longPart(1), longPart(2), longPart(3)]);
  const clk = clock();
  let n = 0;
  const r = await readThrough({ engine: engineOf((m) => { clk.tick([1000, 2000, 3000][n++]); return good(m); }), index: idx, now: clk.now });
  assert.equal(r.msPerSection, 2000);
  const none = await readThrough({ engine: engineOf(), index: handIndex([shortPart(1), shortPart(2)]) });
  assert.equal(none.msPerSection, 0);
  const real = await readThrough({ engine: engineOf(), index: idx });
  assert.ok(Number.isFinite(real.msPerSection) && real.msPerSection >= 0, 'real timers work without a fake clock');
});

test('a reply that is not a usable note falls back to a rules note, is not cached, is not counted as read, and says why', async () => {
  const idx = handIndex([longPart(1), longPart(2)]);
  const cache = projectNotesCache({});
  const r = await readThrough({ engine: engineOf((m, o, n) => (n === 1 ? unusable() : good(m))), index: idx, cache });
  assert.deepEqual(r.notes.map((x) => x.by), ['rules', 'model']);
  assert.equal(r.modelRead, 1);
  assert.equal(r.complete, false, 'a section only skimmed by rules is not read');
  assert.equal(r.failed, false, 'one failure is not the model giving up');
  assert.deepEqual(r.reasons, ['unusable']);
  assert.equal(cache.size(), 1);
  assert.equal(cache.get(sectionKey(idx.sections[0])), null);
  assert.ok(r.notes[0].gist.length > 0, 'the rules note still points at the section');
});

test('each kind of failure is named once: unusable, timeout, no-model', async () => {
  const idx = handIndex([longPart(1), longPart(2), longPart(3), longPart(4), longPart(5), longPart(6)]);
  const timeout = () => ({ text: null, route: 'builtin', error: new AIError('too slow', { kind: 'timeout' }) });
  const seq = [unusable, timeout, nothing, unusable, timeout, nothing]; // never three of the same kind, but also never a success: the third failure stops it
  const r = await readThrough({ engine: engineOf((m, o, n) => seq[n - 1](m)), index: idx, maxFailuresInARow: 99 });
  assert.deepEqual(r.reasons, ['unusable', 'timeout', 'no-model'], 'in the order they first happened, each once');
  assert.equal(r.failed, false);
  assert.equal(r.modelRead, 0);
  const thrower = await readThrough({ engine: engineOf(() => { throw new AIError('connection reset', { kind: 'network' }); }), index: idx });
  assert.deepEqual(thrower.reasons, ['no-model'], 'an engine that throws a provider error is a failure, not a crash');
  const slow = await readThrough({ engine: engineOf(() => { throw new AIError('too slow', { kind: 'timeout' }); }), index: idx });
  assert.deepEqual(slow.reasons, ['timeout']);
});

test('three failures in a row stop the model calls; the rest are rules notes; nothing bad is cached', async () => {
  const idx = handIndex(Array.from({ length: 8 }, (_, k) => longPart(k + 1)));
  const cache = projectNotesCache({});
  for (const bad of [unusable, nothing]) {
    const engine = engineOf(bad);
    const r = await readThrough({ engine, index: idx, cache });
    assert.equal(engine.calls.length, 3, 'the model is asked three times and then left alone');
    assert.equal(r.failed, true);
    assert.equal(r.complete, false);
    assert.equal(r.modelRead, 0);
    assert.equal(r.notes.length, 8);
    assert.ok(r.notes.every((x) => x.by === 'rules'));
    assert.equal(cache.size(), 0);
  }
  const some = engineOf((m, o, n) => (n <= 2 ? good(m) : unusable()));
  const r = await readThrough({ engine: some, index: idx, cache: projectNotesCache({}), maxFailuresInARow: 2 });
  assert.equal(some.calls.length, 4, 'two good notes, then two failures in a row');
  assert.deepEqual(r.notes.map((x) => x.by), ['model', 'model', 'rules', 'rules', 'rules', 'rules', 'rules', 'rules']);
  assert.equal(r.failed, true);
  assert.equal(r.modelRead, 2);
});

test('failures that are not in a row do not stop the pass', async () => {
  const idx = handIndex(Array.from({ length: 9 }, (_, k) => longPart(k + 1)));
  const pattern = [false, false, true, false, false, true, false, false, true]; // two failures, a success, ...
  const engine = engineOf((m, o, n) => (pattern[n - 1] ? good(m) : unusable()));
  const r = await readThrough({ engine, index: idx });
  assert.equal(engine.calls.length, 9);
  assert.equal(r.failed, false);
  assert.equal(r.modelRead, 3);
});

test('sections already cached are not asked again, and an edited section is (and only that one)', async () => {
  const { text } = makeLongText({ words: 6000, seed: 5 });
  const index = buildIndex(text);
  const project = projectWith();
  const first = engineOf();
  await readThrough({ engine: first, index, cache: projectNotesCache(project) });
  assert.equal(first.calls.length, index.sections.length);

  const again = engineOf();
  const r2 = await readThrough({ engine: again, index, cache: projectNotesCache(project) });
  assert.equal(again.calls.length, 0, 'nothing to read twice');
  assert.equal(r2.complete, true);
  assert.equal(r2.modelRead, index.sections.length, 'cached model notes still count as read');
  assert.equal(r2.msPerSection, 0);

  // edit one section without moving any boundary: swap " the " for " she " (same length) in section 4
  const s = index.sections[3];
  const slice = sectionText(text, s);
  assert.ok(slice.includes(' the '));
  const edited = text.slice(0, s.start) + slice.replace(' the ', ' she ') + text.slice(s.end);
  const index2 = buildIndex(edited);
  assert.equal(index2.sections.length, index.sections.length);
  const third = engineOf();
  const r3 = await readThrough({ engine: third, index: index2, cache: projectNotesCache(project) });
  assert.equal(third.calls.length, 1, 'only the edited section is read again');
  assert.ok(sectionIn(third.calls[0].messages).includes(' she '));
  assert.equal(r3.complete, true);
  assert.equal(r3.modelRead, index2.sections.length);
});

test('the notes live in the project: another project does not see them, and they survive a save', async () => {
  const idx = handIndex([longPart(1), longPart(2)]);
  const a = projectWith({ title: 'A' });
  const b = projectWith({ title: 'B' });
  await readThrough({ engine: engineOf(), index: idx, cache: projectNotesCache(a) });
  assert.equal(projectNotesCache(a).size(), 2);
  assert.equal(projectNotesCache(b).size(), 0);
  const saved = JSON.parse(JSON.stringify(a));
  assert.equal(projectNotesCache(saved).size(), 2, 'a JSON round trip keeps them');
  const again = engineOf();
  await readThrough({ engine: again, index: idx, cache: projectNotesCache(saved) });
  assert.equal(again.calls.length, 0);
});

test('an abort is rethrown, what was read stays cached, and a second run resumes where the first stopped', async () => {
  const idx = handIndex(Array.from({ length: 6 }, (_, k) => longPart(k + 1)));
  const cache = projectNotesCache({});
  const ctl = new AbortController();
  const first = engineOf((m, o, n) => {
    if (n === 3) { ctl.abort(); throw new AIError('The request was stopped.', { kind: 'abort' }); }
    return good(m);
  });
  const seen = [];
  await assert.rejects(readThrough({ engine: first, index: idx, cache, signal: ctl.signal, onProgress: (p) => seen.push(p.done) }), (err) => err.kind === 'abort');
  assert.equal(first.calls.length, 3);
  assert.equal(cache.size(), 2, 'the two finished sections are kept');
  assert.deepEqual(seen, [1, 2]);

  const second = engineOf();
  const r = await readThrough({ engine: second, index: idx, cache });
  assert.equal(second.calls.length, 4, 'resumes at the third section');
  assert.equal(sectionIn(second.calls[0].messages), sectionText(idx.text, idx.sections[2]).trim());
  assert.equal(r.complete, true);
  assert.equal(r.modelRead, 6);
  assert.equal(second.calls[0].opts.timeoutMs, 150000, 'a new run has a cold first call again');
});

test('an abort without an abort-kind error still stops the pass, and an already aborted signal makes no call at all', async () => {
  const idx = handIndex(Array.from({ length: 5 }, (_, k) => longPart(k + 1)));
  const ctl = new AbortController();
  const stubborn = engineOf((m, o, n) => { if (n === 2) ctl.abort(); return good(m); }); // an engine that ignores the signal
  const cache = projectNotesCache({});
  await assert.rejects(readThrough({ engine: stubborn, index: idx, cache, signal: ctl.signal }), (err) => err.kind === 'abort');
  assert.equal(stubborn.calls.length, 2);
  assert.equal(cache.size(), 2);
  const thrown = new AbortController();
  const odd = engineOf((m, o, n) => { if (n === 1) { thrown.abort(); throw new Error('socket hang up'); } return good(m); });
  await assert.rejects(readThrough({ engine: odd, index: idx, signal: thrown.signal }), (err) => err.kind === 'abort', 'any error after an abort is the abort');
  const done = new AbortController();
  done.abort();
  const never = engineOf();
  await assert.rejects(readThrough({ engine: never, index: idx, signal: done.signal }), (err) => err.kind === 'abort');
  assert.equal(never.calls.length, 0);
});

test('a progress callback that throws or rejects never breaks the reading', async () => {
  const idx = handIndex([longPart(1), longPart(2), shortPart(3)]);
  let calls = 0;
  const r = await readThrough({ engine: engineOf(), index: idx, onProgress: () => { calls++; throw new Error('the progress bar broke'); } });
  assert.equal(calls, 3);
  assert.equal(r.complete, true);
  const r2 = await readThrough({ engine: engineOf(), index: idx, cache: projectNotesCache({}), onProgress: async () => { throw new Error('async break'); } });
  assert.equal(r2.complete, true);
  await new Promise((resolve) => setImmediate(resolve)); // an unhandled rejection would fail the test run here
});

test('a text longer than maxSections reads the first maxSections and says it is too long', async () => {
  const index = buildIndex(makeLongText({ words: 6000, seed: 8 }).text);
  assert.ok(index.sections.length > 6);
  const engine = engineOf();
  const seen = [];
  const r = await readThrough({ engine, index, maxSections: 6, onProgress: (p) => seen.push(p) });
  assert.equal(engine.calls.length, 6);
  assert.equal(r.notes.length, 6);
  assert.equal(r.total, index.sections.length, 'total is how many sections the text has');
  assert.equal(r.tooLong, true);
  assert.equal(r.complete, false, 'unread sections remain, even though all 6 that were tried are read');
  assert.equal(r.modelRead, 6);
  assert.equal(r.failed, false);
  assert.ok(seen.every((p) => p.total === 6) && seen.length === 6);
  const exact = await readThrough({ engine: engineOf(), index, maxSections: index.sections.length });
  assert.equal(exact.tooLong, false);
  assert.equal(exact.complete, true);
});

test('odd indexes: no sections is an empty, complete read; a missing cache works in memory', async () => {
  const engine = engineOf();
  const r = await readThrough({ engine, index: { text: '', sections: [] } });
  assert.deepEqual([r.notes, r.total, r.modelRead, r.complete, r.failed, r.tooLong], [[], 0, 0, true, false, false]);
  assert.equal(engine.calls.length, 0);
  const idx = handIndex([longPart(1), longPart(2)]);
  const r2 = await readThrough({ engine: engineOf(), index: idx, cache: undefined });
  assert.equal(r2.complete, true);
});

test('a limit that is not a positive number cannot turn into "nothing to read, complete"', async () => {
  const idx = handIndex([longPart(1), longPart(2)]);
  for (const maxSections of [NaN, 0, -3, undefined, null]) {
    const engine = engineOf();
    const r = await readThrough({ engine, index: idx, maxSections });
    assert.equal(engine.calls.length, 2, String(maxSections));
    assert.equal(r.notes.length, 2);
    assert.equal(r.modelRead, 2);
    assert.equal(r.complete, true);
  }
  const some = await readThrough({ engine: engineOf(), index: idx, maxSections: 1 });
  assert.deepEqual([some.notes.length, some.tooLong, some.complete], [1, true, false]);
  assert.equal((await readThrough({ engine: engineOf(), index: idx, maxSections: Infinity })).complete, true);
});

test('sections that arrive without a hash are not read as one: each is keyed by its own text', async () => {
  const idx = handIndex([longPart(1), longPart(2), longPart(3)]);
  const noHash = { text: idx.text, sections: idx.sections.map(({ hash, ...rest }) => rest) };
  const cache = projectNotesCache({});
  const engine = engineOf();
  const r = await readThrough({ engine, index: noHash, cache });
  assert.equal(engine.calls.length, 3, 'three different sections, three readings');
  assert.equal(cache.size(), 3);
  assert.deepEqual(r.notes.map((x) => x.names[0]), ['Tomas Verrick', 'Marit Oland', 'Dov Anselm']);
  const again = engineOf();
  await readThrough({ engine: again, index: noHash, cache });
  assert.equal(again.calls.length, 0, 'and they are found again');
});

test('a missing or null cache is an in-memory one, not a crash', async () => {
  const idx = handIndex([longPart(1), longPart(2)]);
  for (const cache of [null, undefined]) assert.equal((await readThrough({ engine: engineOf(), index: idx, cache })).complete, true);
});

test('a section that is long but has few "words" (unspaced script, a long string) is not a short text: the model reads it', async () => {
  const cjk = '彼女は静かに湖のほとりを歩いた'.repeat(80); // ~1,200 characters, one word to a tokenizer that splits on spaces
  assert.ok(wordsIn(cjk).length < 40 && cjk.length > 600);
  const idx = handIndex([cjk, shortPart(1)]);
  const engine = engineOf(() => ({ text: JSON.stringify({ gist: 'A woman walks quietly along the lake shore.', names: [], terms: [], voice: 'calm, quiet, plain' }), route: 'local' }));
  const r = await readThrough({ engine, index: idx });
  assert.equal(engine.calls.length, 1, 'the long one is asked, the genuinely short one is not');
  assert.deepEqual(r.notes.map((x) => x.by), ['model', 'text']);
  const none = await readThrough({ engine: engineOf(nothing), index: idx });
  assert.equal(none.complete, false, 'and when the model cannot read it, it is not claimed as read');
});

test('the gist may use the heading the section sits under (it is in the prompt), but not a name from nowhere', async () => {
  const body = `${NAME_POOL[0]} ${Array.from({ length: 60 }, (_, k) => `thing${k}`).join(' ')}.`;
  const idx = { text: body, sections: [{ i: 0, start: 0, end: body.length, title: '', under: 'Chapter Seven: The Salt Roads', words: 61, hash: fnv1a(body) }] };
  const ok = await readThrough({ engine: engineOf(() => ({ text: JSON.stringify({ gist: 'Ilsa Quade carries things along the Salt Roads.', names: ['Ilsa Quade'], terms: [], voice: '' }), route: 'local' })), index: idx });
  assert.equal(ok.notes[0].by, 'model');
  const made = await readThrough({ engine: engineOf(() => ({ text: JSON.stringify({ gist: 'Ilsa Quade carries things to King Oswin.', names: ['Ilsa Quade'], terms: [], voice: '' }), route: 'local' })), index: idx, cache: projectNotesCache({}) });
  assert.equal(made.notes[0].by, 'rules', 'a gist with an invented king is not a reading');
  assert.equal(made.modelRead, 0);
  assert.equal(made.complete, false);
  assert.deepEqual(made.reasons, ['unusable']);
});

test('cachedNotes says what is known without asking: cached readings, short sections as themselves, the rest null, and the same "complete" as a finished read', async () => {
  const idx = handIndex([longPart(1), shortPart(2), longPart(3), shortPart(4)]);
  const cache = projectNotesCache({});
  const before = cachedNotes({ index: idx, cache });
  assert.deepEqual(before.notes.map((x) => x?.by ?? null), [null, 'text', null, 'text']);
  assert.deepEqual([before.total, before.modelRead, before.complete, before.tooLong], [4, 0, false, false]);
  await readThrough({ engine: engineOf((m, o, n) => (n === 1 ? good(m) : { text: null, route: 'builtin' })), index: idx, cache, maxFailuresInARow: 9 });
  const part = cachedNotes({ index: idx, cache });
  assert.deepEqual(part.notes.map((x) => x?.by ?? null), ['model', 'text', null, 'text']);
  assert.deepEqual([part.modelRead, part.complete], [1, false], 'a section only skimmed is not known');
  const full = await readThrough({ engine: engineOf(), index: idx, cache });
  const after = cachedNotes({ index: idx, cache });
  assert.deepEqual([after.modelRead, after.complete], [full.modelRead, full.complete]);
  assert.deepEqual(after.notes.map((x) => x.by), full.notes.map((x) => x.by));
  assert.equal(cachedNotes({ index: idx, cache, maxSections: 2 }).complete, false, 'too long to have been read');
  assert.deepEqual(cachedNotes({ index: { text: '', sections: [] } }), { notes: [], total: 0, modelRead: 0, complete: true, tooLong: false });
  assert.doesNotThrow(() => cachedNotes());
});

test('a clock that returns nonsense cannot put NaN into the progress or the estimate', async () => {
  const idx = handIndex([longPart(1), longPart(2), longPart(3)]);
  const seen = [];
  const r = await readThrough({ engine: engineOf(), index: idx, now: () => NaN, onProgress: (p) => seen.push(p) });
  assert.ok(seen.every((p) => Number.isFinite(p.ms) && (p.etaMs === null || Number.isFinite(p.etaMs))));
  assert.equal(r.msPerSection, 0);
  const frac = clock();
  const seen2 = [];
  await readThrough({ engine: engineOf((m) => { frac.tick(1234.567); return good(m); }), index: idx, now: frac.now, onProgress: (p) => seen2.push(p) });
  assert.ok(seen2.every((p) => Number.isInteger(p.ms)), 'whole milliseconds');
});

test('a text with chapter headings reads end to end with each section\'s chapter in its prompt, and identical sections are read once', async () => {
  const text = [...Array(3)].map((_, c) => `Chapter ${c + 1}\n\n${[...Array(4)].map((__, p) => `${NAME_POOL[(c + p) % 10]} ${['carried', 'counted', 'mended'][p % 3]} ${Array.from({ length: 70 }, (___, k) => `item${c}${p}${k}`).join(' ')}.`).join('\n\n')}`).join('\n\n');
  const index = buildIndex(text, splitSections(text));
  const engine = engineOf();
  const r = await readThrough({ engine, index });
  assert.equal(r.complete, true);
  assert.ok(engine.calls.some((c) => /\(under "Chapter 2"\)/.test(c.messages.at(-1).content)), 'the chapter a section sits under is in its prompt');
  // the same text pasted twice in a row: identical sections share notes
  const dup = handIndex([longPart(1), longPart(1), longPart(2)]);
  const e2 = engineOf();
  const d = await readThrough({ engine: e2, index: dup, cache: projectNotesCache({}) });
  assert.equal(e2.calls.length, 2, 'two sections with identical text are read once');
  assert.equal(d.modelRead, 3);
  assert.equal(d.complete, true);
});

// ── the overview ─────────────────────────────────────────────────────────────

const gistNotes = (n, words = 25, names = []) => Array.from({ length: n }, (_, k) => ({ gist: `Part ${k} says ${Array.from({ length: words }, (_, j) => `w${k}z${j}`).join(' ')}`, names: k === 0 ? names : [], terms: [], voice: '', by: 'model' }));
const STORY_NAMES = ['Lake Tegano', 'Delton', 'Mara Quill'];
const OVERVIEW = 'This is a story bible for a fishing village around Lake Tegano. Its main people are Delton, a ferryman, and Mara Quill, who keeps the ledger. It is organised as short entries on places, people and rules of the village.';

test('the overview prompt lists every part when they fit, then asks for 3 or 4 plain sentences from the notes only', () => {
  const notes = gistNotes(5, 10);
  const m = overviewMessages(notes, { words: 9876, sections: 5 });
  assert.equal(m.length, 2);
  assert.deepEqual(m[0], { role: 'system', content: OVERVIEW_SYSTEM });
  const c = m[1].content;
  assert.match(c, /9,876 words/);
  for (let k = 1; k <= 5; k++) assert.ok(c.includes(`Part ${k}: Part ${k - 1} says`), `part ${k}`);
  assert.doesNotMatch(c, /spread evenly/);
  assert.match(c, /In 3 or 4 plain sentences say what this text is as a whole: what it is about, who or what the main named people and things are and what each one is to it, and how it is organised\. Use only what the notes say\. Do not retell the text, quote it, write any story text, or praise it\.$/);
});

test('a long list of notes is thinned evenly to about 1,000 tokens, keeping the first and the last part and their numbers, and the prompt says so', () => {
  const notes = gistNotes(60);
  const c = overviewMessages(notes, { words: 12000, sections: 60 })[1].content;
  const lines = c.split('\n').filter((l) => /^Part \d+:/.test(l));
  assert.ok(lines.length >= 8 && lines.length < 60, `${lines.length} lines`);
  assert.ok(estimateTokens(lines.join('\n')) <= 1000, `${estimateTokens(lines.join('\n'))} tokens`);
  assert.ok(lines[0].startsWith('Part 1:') && lines.at(-1).startsWith('Part 60:'));
  const numbers = lines.map((l) => Number(l.match(/^Part (\d+):/)[1]));
  assert.deepEqual([...numbers].sort((a, b) => a - b), numbers, 'in order');
  assert.equal(new Set(numbers).size, numbers.length);
  const gaps = numbers.slice(1).map((n, k) => n - numbers[k]);
  assert.ok(Math.max(...gaps) - Math.min(...gaps) <= 2, `evenly spread: gaps ${gaps.join(',')}`);
  assert.match(c, new RegExp(`${lines.length} of the 60 parts`));
  assert.ok(estimateTokens(c) < 1400, 'the whole prompt stays small enough for the window');
  const roomy = overviewMessages(notes, { sections: 60, listTokens: 100000 })[1].content;
  assert.equal(roomy.split('\n').filter((l) => /^Part \d+:/.test(l)).length, 60, 'the budget can be raised');
});

test('parts without a gist are skipped but keep their numbers', () => {
  const c = overviewMessages([{ gist: 'First thing happens here.' }, null, { gist: '' }, { gist: 'Fourth thing happens here.' }])[1].content;
  assert.match(c, /Part 1: First thing/);
  assert.match(c, /Part 4: Fourth thing/);
  assert.doesNotMatch(c, /Part 2:|Part 3:/);
});

test('an overview is made once per set of notes: asked with the right options, cleaned, cached, and a changed note asks again', async () => {
  const notes = gistNotes(6, 12, STORY_NAMES);
  const project = projectWith();
  const cache = projectNotesCache(project);
  const ctl = new AbortController();
  const engine = engineOf(() => ({ text: `  ${OVERVIEW}\n`, route: 'local' }));
  const r = await makeOverview({ engine, notes, cache, signal: ctl.signal, words: 9000, sections: 6 });
  assert.deepEqual(r, { text: OVERVIEW, by: 'model' });
  assert.equal(engine.calls.length, 1);
  const { opts, messages } = engine.calls[0];
  assert.equal(opts.purpose, 'overview');
  assert.equal(opts.stream, false);
  assert.equal(opts.maxTokens, 170);
  assert.equal(opts.temperature, 0.3);
  assert.equal(opts.timeoutMs, 90000);
  assert.equal(opts.signal, ctl.signal);
  assert.equal(opts.json, undefined, 'the overview is prose, not a schema');
  assert.match(messages[1].content, /about 9,000 words, in 6 parts/);

  const key = `ov:${NOTES_VERSION}:${fnv1a(notes.map((n) => n.gist).join('\n'))}`;
  assert.equal(cache.getOverview(key), OVERVIEW);
  assert.ok(project.readingNotes.overviews[key]);

  const again = await makeOverview({ engine, notes, cache });
  assert.deepEqual(again, { text: OVERVIEW, by: 'model' });
  assert.equal(engine.calls.length, 1, 'the same notes never cost a second call');
  const fresh = await makeOverview({ engine, notes, cache: projectNotesCache(JSON.parse(JSON.stringify(project))) });
  assert.equal(fresh.text, OVERVIEW);
  assert.equal(engine.calls.length, 1, 'and it survives a save');

  const changed = notes.map((n, k) => (k === 2 ? { ...n, gist: 'A different thing happens in this part instead.' } : n));
  await makeOverview({ engine, notes: changed, cache });
  assert.equal(engine.calls.length, 2, 'one changed gist is a new overview');
});

test('an overview that is not one is rejected: too short, a refusal, JSON, nothing; and nothing is cached', async () => {
  const notes = gistNotes(4, 10);
  const project = {};
  const cache = projectNotesCache(project);
  const replies = [
    'A story about boats.',
    "I'm sorry, but I cannot summarise this text because it is far too long for me to read in one go today.",
    'Sure, here is a short overview of the text that you asked me to write for you right now, in four sentences.',
    '{"overview": "This is a story bible about a village by a lake, with people, places and rules that run through it."}',
    '',
    '- ok',
  ];
  for (const text of replies) {
    const r = await makeOverview({ engine: engineOf(() => ({ text, route: 'local' })), notes, cache });
    assert.deepEqual(r, { text: '', by: 'rules' }, JSON.stringify(text));
  }
  assert.deepEqual(project.readingNotes.overviews, {}, 'no junk overview was stored');
});

test('when the model fails, times out or throws the overview is empty and made by rules; an abort is rethrown', async () => {
  const notes = gistNotes(4, 10);
  for (const handler of [nothing, () => ({ text: null, route: 'builtin', error: new AIError('slow', { kind: 'timeout' }) }), () => { throw new AIError('down', { kind: 'network' }); }, () => { throw new Error('boom'); }]) {
    assert.deepEqual(await makeOverview({ engine: engineOf(handler), notes, cache: projectNotesCache({}) }), { text: '', by: 'rules' });
  }
  await assert.rejects(makeOverview({ engine: engineOf(() => { throw new AIError('stopped', { kind: 'abort' }); }), notes, cache: projectNotesCache({}) }), (e) => e.kind === 'abort');
  const ctl = new AbortController();
  ctl.abort();
  const never = engineOf();
  await assert.rejects(makeOverview({ engine: never, notes, cache: projectNotesCache({}), signal: ctl.signal }), (e) => e.kind === 'abort');
  assert.equal(never.calls.length, 0);
  const none = engineOf();
  assert.deepEqual(await makeOverview({ engine: none, notes: [], cache: projectNotesCache({}) }), { text: '', by: 'rules' });
  assert.deepEqual(await makeOverview({ engine: none, notes: [{ gist: '' }, null], cache: projectNotesCache({}) }), { text: '', by: 'rules' });
  assert.equal(none.calls.length, 0, 'no notes, no call');
});

test('the overview is cleaned: markdown bullets and headings go, it is one paragraph, and it ends at a sentence end within 700 characters', async () => {
  const notes = gistNotes(4, 10, ['Delton', 'Mara Quill']);
  const run = async (text) => (await makeOverview({ engine: engineOf(() => ({ text, route: 'local' })), notes, cache: projectNotesCache({}) })).text;
  const bullets = await run('## Overview\n\n- This is a story bible for a fishing village on a cold northern lake\n- Its main people are Delton the ferryman and Mara Quill who keeps the ledger\n- It is organised as short entries on places and people.');
  assert.doesNotMatch(bullets, /[#*]|^-|\n/);
  assert.match(bullets, /^This is a story bible for a fishing village on a cold northern lake\. Its main people are Delton/);
  assert.ok(wordsIn(bullets).length >= 15);
  const bold = await run('**Overview:** This text is a story bible for a fishing village on a lake, and it lists people, places and rules for the village.');
  assert.doesNotMatch(bold, /\*/);
  const sentence = 'This part of the village keeps a ledger of boats and debts that nobody else is allowed to read.';
  const long = await run(Array(14).fill(sentence).join(' '));
  assert.ok(long.length <= 700, `${long.length} chars`);
  assert.ok(long.endsWith('.'), 'cut at a sentence end');
  assert.equal(long, Array(Math.floor(700 / (sentence.length + 1))).fill(sentence).join(' '), 'as many whole sentences as fit');
  const cutOff = await run(`${sentence} ${sentence} This one starts and then the reply was stopped by the token lim`);
  assert.equal(cutOff, `${sentence} ${sentence}`, 'a trailing half sentence is dropped');
  const whole = await run('"This is a story bible for a village on a lake. It names Delton and Mara Quill, and it lists their places and rules."');
  assert.doesNotMatch(whole, /^"/);
});

test('an overview sentence that names someone the notes never name is dropped, and an overview made only of such sentences is no overview', async () => {
  const notes = gistNotes(6, 12, ['Delton', 'Mara Quill']);
  const run = async (text, n = notes) => makeOverview({ engine: engineOf(() => ({ text, route: 'local' })), notes: n, cache: projectNotesCache({}) });
  const invented = 'It follows Delton and Mara Quill through one winter on the lake. Queen Isolde of Valdor sends her fleet against them in the last part. The village keeps a ledger of boats and debts that nobody else may read.';
  const r = await run(invented);
  assert.equal(r.by, 'model');
  assert.equal(r.text, 'It follows Delton and Mara Quill through one winter on the lake. The village keeps a ledger of boats and debts that nobody else may read.', 'the sentence with the invented queen is gone, the rest is untouched');
  assert.doesNotMatch(r.text, /Isolde|Valdor/);
  const allMade = await run('Queen Isolde of Valdor sails against King Oswin of Karth in a war that spans the whole text and every one of its parts.');
  assert.deepEqual(allMade, { text: '', by: 'rules' });
  const mostlyMade = await run('A story. Queen Isolde of Valdor sails against King Oswin of Karth. Another sentence.');
  assert.deepEqual(mostlyMade, { text: '', by: 'rules' }, 'under 15 words left is not an overview');
  // a name in a note the prompt thinned away is still a name the notes know
  const many = gistNotes(60, 25);
  many[31].names = ['Odalys Venn'];
  const thinned = overviewMessages(many, { sections: 60 })[1].content;
  assert.doesNotMatch(thinned, /Part 32:/, 'part 32 was not shown to the model');
  const kept = await run('It is a long record kept in many parts, and it ends with Odalys Venn closing the ledger of the whole village for good.', many);
  assert.match(kept.text, /Odalys Venn/);
});

test('an overview that is the notes read back ("Part 1: ...") is not an overview', async () => {
  const notes = gistNotes(4, 10);
  const r = await makeOverview({ engine: engineOf(() => ({ text: 'Part 1: says w0z0 w0z1 w0z2 w0z3 w0z4 w0z5. Part 2: says w1z0 w1z1 w1z2 w1z3 w1z4 w1z5 and more of it.', route: 'local' })), notes, cache: projectNotesCache({}) });
  assert.deepEqual(r, { text: '', by: 'rules' });
});

// ── storage ──────────────────────────────────────────────────────────────────

test('an empty structure, and a cache created on a project without notes', () => {
  assert.deepEqual(emptyReadingNotes(), { v: 1, sections: {}, overviews: {} });
  assert.notEqual(emptyReadingNotes(), emptyReadingNotes());
  const project = {};
  const cache = projectNotesCache(project);
  assert.deepEqual(project.readingNotes, emptyReadingNotes(), 'created when missing');
  assert.equal(cache.size(), 0);
  const damaged = { readingNotes: 'junk' };
  projectNotesCache(damaged);
  assert.deepEqual(damaged.readingNotes, emptyReadingNotes(), 'a damaged value is replaced by an empty one');
  assert.doesNotThrow(() => projectNotesCache(null));
  assert.doesNotThrow(() => projectNotesCache(undefined).set('1:abcd1234', { gist: 'Three words here.' }));
});

test('a note goes in and comes out with only its five fields; what comes out is a copy', () => {
  const project = {};
  const cache = projectNotesCache(project);
  const note = { gist: 'Delton rows out across the lake.', names: ['Delton'], terms: ['Guild'], voice: 'quiet', by: 'model', secret: 'x', t: 5, extra: { deep: 1 } };
  assert.equal(cache.set('1:aaaa1111', note), true);
  const got = cache.get('1:aaaa1111');
  assert.deepEqual(got, { gist: 'Delton rows out across the lake.', names: ['Delton'], terms: ['Guild'], voice: 'quiet', by: 'model' });
  assert.deepEqual(Object.keys(project.readingNotes.sections['1:aaaa1111']).sort(), ['n', 't']);
  assert.deepEqual(Object.keys(project.readingNotes.sections['1:aaaa1111'].n).sort(), ['by', 'gist', 'names', 'terms', 'voice']);
  got.names.push('Mallory');
  got.gist = 'changed';
  assert.deepEqual(cache.get('1:aaaa1111').names, ['Delton'], 'the store is not aliased');
  assert.equal(cache.get('1:missing0'), null);
  assert.equal(cache.size(), 1);
});

test('rules notes and junk are never stored; hostile keys are refused', () => {
  const cache = projectNotesCache({});
  assert.equal(cache.set('1:aaaa1111', { gist: 'First sentence only here.', names: [], terms: [], voice: '', by: 'rules' }), false);
  assert.equal(cache.set('1:aaaa1111', { gist: 'Short text itself here.', by: 'text' }), false);
  assert.equal(cache.set('1:aaaa1111', null), false);
  assert.equal(cache.set('1:aaaa1111', { gist: 5 }), false);
  assert.equal(cache.set('1:aaaa1111', { gist: '   ' }), false);
  for (const key of ['__proto__', 'constructor', 'prototype', '', 'a b', 'x'.repeat(100), null, 5]) {
    assert.equal(cache.set(key, { gist: 'A fine note here.', by: 'model' }), false, String(key));
    assert.equal(cache.get(key), null);
  }
  assert.equal(cache.size(), 0);
  assert.equal({}.gist, undefined);
  assert.equal(cache.get('toString'), null, 'inherited properties are not entries');
});

test('entries that are not notes, placed straight into the project, cannot make the cache throw and are pruned first', () => {
  const sections = {};
  for (let k = 0; k < 170; k++) sections[`1:${String(k).padStart(8, '0')}`] = k % 2 ? null : { n: { gist: 'A fine note says things.' }, t: 100 + k };
  const project = { readingNotes: { v: 1, sections, overviews: { 'ov:1:aaaaaaaa': null } } };
  const cache = projectNotesCache(project);
  assert.doesNotThrow(() => cache.set('1:fresh000', { gist: 'A new note says things.' }));
  assert.ok(Object.keys(project.readingNotes.sections).length <= 160);
  assert.ok(project.readingNotes.sections['1:fresh000']);
  assert.equal(cache.getOverview('ov:1:aaaaaaaa'), null);
  assert.doesNotThrow(() => cache.setOverview('ov:1:bbbbbbbb', 'A fine overview text.'));
});

test('the cache keeps at most 160 section notes, dropping the least recently USED, and reading an entry counts as using it', () => {
  const project = {};
  const cache = projectNotesCache(project);
  const key = (k) => `1:${String(k).padStart(8, '0')}`;
  const note = (k) => ({ gist: `Note number ${k} says things.`, names: [], terms: [], voice: '', by: 'model' });
  for (let k = 0; k < 160; k++) cache.set(key(k), note(k));
  assert.equal(cache.size(), 160);
  assert.ok(cache.get(key(0)), 'reading the oldest makes it the newest');
  cache.set(key(160), note(160));
  assert.equal(cache.size(), 160);
  assert.ok(cache.get(key(0)), 'the one that was just used survived');
  assert.equal(cache.get(key(1)), null, 'the least recently used was dropped');
  assert.ok(cache.get(key(2)));
  assert.ok(cache.get(key(160)));
  for (let k = 161; k < 200; k++) cache.set(key(k), note(k));
  assert.equal(cache.size(), 160);
  assert.equal(Object.keys(project.readingNotes.sections).length, 160);
  assert.equal(cache.set(key(160), { ...note(160), gist: 'Rewritten note says other things.' }), true);
  assert.equal(cache.size(), 160, 'replacing an entry does not grow the cache');
  assert.equal(cache.get(key(160)).gist, 'Rewritten note says other things.');
});

test('the cache keeps at most 6 overviews, dropping the least recently used', () => {
  const project = {};
  const cache = projectNotesCache(project);
  for (let k = 0; k < 6; k++) assert.equal(cache.setOverview(`ov:1:0000000${k}`, `Overview number ${k}.`), true);
  assert.equal(cache.getOverview('ov:1:00000000'), 'Overview number 0.');
  cache.setOverview('ov:1:00000006', 'Overview number 6.');
  assert.equal(Object.keys(project.readingNotes.overviews).length, 6);
  assert.equal(cache.getOverview('ov:1:00000001'), null, 'least recently used goes');
  assert.equal(cache.getOverview('ov:1:00000000'), 'Overview number 0.');
  assert.equal(cache.setOverview('ov:1:00000007', ''), false);
  assert.equal(cache.setOverview('__proto__', 'Overview.'), false);
  assert.equal(cache.getOverview('__proto__'), null);
  assert.equal(cache.size(), 0, 'size counts section notes only');
});

test('with an injected clock, the order of use is the order of the clock', () => {
  let t = 1000;
  const project = {};
  const cache = projectNotesCache(project, { now: () => t });
  cache.set('1:aaaa0001', { gist: 'First note says things.' });
  t = 2000;
  cache.set('1:aaaa0002', { gist: 'Second note says things.' });
  t = 3000;
  cache.get('1:aaaa0001');
  assert.equal(project.readingNotes.sections['1:aaaa0001'].t, 3000);
  assert.equal(project.readingNotes.sections['1:aaaa0002'].t, 2000);
  t = 0; // a clock that goes backwards cannot make "least recently used" ambiguous
  cache.set('1:aaaa0003', { gist: 'Third note says things.' });
  assert.ok(project.readingNotes.sections['1:aaaa0003'].t > 0);
});

test('sanitize keeps what is well formed (a save and load changes nothing)', () => {
  const project = {};
  const cache = projectNotesCache(project);
  cache.set('1:aaaa0001', { gist: 'Delton rows out across the lake.', names: ['Delton', 'Lake Tegano'], terms: ['Guild'], voice: 'quiet, close', by: 'model' });
  cache.set('1:aaaa0002', { gist: 'Mara keeps the ledger of debts.', names: [], terms: [], voice: '', by: 'model' });
  cache.setOverview('ov:1:11112222', OVERVIEW);
  const loaded = sanitizeReadingNotes(JSON.parse(JSON.stringify(project.readingNotes)));
  assert.deepEqual(loaded, project.readingNotes);
  assert.deepEqual(sanitizeReadingNotes(loaded), loaded, 'idempotent');
});

test('sanitize survives junk of every kind and returns an empty structure', () => {
  const junk = [null, undefined, [], [1, 2], 'text', '', 42, 0, NaN, true, false, () => 1, Symbol('x'), new Date(), new Map(), /re/, { v: 1, sections: [], overviews: 'x' }, { sections: 5, overviews: null }, { sections: { a: 1, b: null, c: 'x', d: [] } }];
  for (const raw of junk) {
    let out;
    assert.doesNotThrow(() => { out = sanitizeReadingNotes(raw); }, String(typeof raw));
    assert.deepEqual(out, emptyReadingNotes());
  }
  const throwing = Object.defineProperty({}, 'sections', { enumerable: true, get() { throw new Error('boom'); } });
  assert.deepEqual(sanitizeReadingNotes(throwing), emptyReadingNotes(), 'even a hostile getter');
  const cyclic = { v: 1, sections: {} };
  cyclic.sections.self = cyclic;
  assert.deepEqual(sanitizeReadingNotes(cyclic), emptyReadingNotes());
});

test('sanitize drops __proto__, constructor and prototype keys and cannot pollute anything', () => {
  const raw = JSON.parse('{"v":1,"__proto__":{"polluted":1},"sections":{"__proto__":{"n":{"gist":"a b c d"},"t":1},"constructor":{"n":{"gist":"a b c d"},"t":1},"prototype":{"n":{"gist":"a b c d"},"t":1},"1:good0001":{"n":{"gist":"A fine note says things.","names":["A"]},"t":5}},"overviews":{"__proto__":{"text":"x y z","t":1},"ov:1:abcd1234":{"text":"A fine overview text.","t":2}}}');
  const out = sanitizeReadingNotes(raw);
  assert.deepEqual(Object.keys(out.sections), ['1:good0001']);
  assert.deepEqual(Object.keys(out.overviews), ['ov:1:abcd1234']);
  assert.equal(Object.getPrototypeOf(out.sections), Object.prototype);
  assert.equal(Object.getPrototypeOf(out.overviews), Object.prototype);
  assert.equal({}.polluted, undefined);
  assert.equal({}.gist, undefined);
  assert.equal(out.polluted, undefined);
  assert.deepEqual(Object.keys(out).sort(), ['overviews', 'sections', 'v']);
  const odd = sanitizeReadingNotes({ sections: { 'bad key with spaces': { n: { gist: 'A fine note says things.' }, t: 1 }, [`${'k'.repeat(80)}`]: { n: { gist: 'A fine note says things.' }, t: 1 }, '1:ok000001': { n: { gist: 'A fine note says things.' }, t: 1 } } });
  assert.deepEqual(Object.keys(odd.sections), ['1:ok000001'], 'only well-formed keys');
});

test('sanitize clips strings and lists and drops entries that are not notes', () => {
  const long = 'x'.repeat(2000);
  const out = sanitizeReadingNotes({
    v: 7,
    sections: {
      '1:aaaa0001': { n: { gist: long, names: Array(20).fill('Name').map((n, k) => n + k + 'y'.repeat(200)), terms: Array(10).fill('term'), voice: long, by: 'model', evil: 'x' }, t: 3, more: 1 },
      '1:aaaa0002': { n: 'not an object', t: 1 },
      '1:aaaa0003': { n: { gist: 12 }, t: 1 },
      '1:aaaa0004': { n: { gist: 'From the rules, never a reading.', by: 'rules' }, t: 1 },
      '1:aaaa0005': { n: { gist: 'No time given but fine to keep.', names: 'not a list', terms: [1, null, 'ok', {}] }, t: 'soon' },
      '1:aaaa0006': 'nope',
      '1:aaaa0007': { n: { gist: '   ' }, t: 1 },
    },
    overviews: { 'ov:1:aaaa0001': { text: long, t: 1 }, 'ov:1:aaaa0002': { text: 5, t: 1 }, 'ov:1:aaaa0003': null, 'ov:1:aaaa0004': { text: '', t: 1 } },
  });
  assert.equal(out.v, 1);
  assert.deepEqual(Object.keys(out.sections), ['1:aaaa0001', '1:aaaa0005']);
  const n = out.sections['1:aaaa0001'].n;
  assert.ok(n.gist.length <= 300 && n.gist.length > 250, `${n.gist.length}`);
  assert.equal(n.names.length, 6);
  assert.ok(n.names.every((x) => x.length <= 60));
  assert.equal(n.terms.length, 4);
  assert.equal(n.voice.length, 80);
  assert.equal(n.by, 'model');
  assert.deepEqual(Object.keys(n).sort(), ['by', 'gist', 'names', 'terms', 'voice']);
  assert.deepEqual(Object.keys(out.sections['1:aaaa0001']).sort(), ['n', 't']);
  const lenient = out.sections['1:aaaa0005'];
  assert.deepEqual(lenient.n.names, []);
  assert.deepEqual(lenient.n.terms, ['ok']);
  assert.equal(lenient.t, 0);
  assert.deepEqual(Object.keys(out.overviews), ['ov:1:aaaa0001']);
  assert.ok(out.overviews['ov:1:aaaa0001'].text.length <= 800 && out.overviews['ov:1:aaaa0001'].text.length > 700);
});

test('sanitize enforces the same limits as the cache: 160 section notes and 6 overviews, keeping the most recently used', () => {
  const sections = {};
  for (let k = 0; k < 200; k++) sections[`1:${String(k).padStart(8, '0')}`] = { n: { gist: `Note number ${k} says things.` }, t: 1000 + k };
  const overviews = {};
  for (let k = 0; k < 10; k++) overviews[`ov:1:0000000${k}`] = { text: `Overview number ${k}.`, t: 50 + k };
  const out = sanitizeReadingNotes({ v: 1, sections, overviews });
  assert.equal(Object.keys(out.sections).length, 160);
  assert.ok(out.sections['1:00000199'] && out.sections['1:00000040'] && !out.sections['1:00000039'], 'the 40 oldest are gone');
  assert.deepEqual(Object.keys(out.overviews).sort(), ['ov:1:00000004', 'ov:1:00000005', 'ov:1:00000006', 'ov:1:00000007', 'ov:1:00000008', 'ov:1:00000009']);
  // and a cache over a project whose stored notes were too many repairs itself on the first write
  const project = { readingNotes: { v: 1, sections: { ...sections }, overviews: {} } };
  const cache = projectNotesCache(project);
  cache.set('1:fffffff0', { gist: 'A new note says things.' });
  assert.equal(cache.size(), 160);
});

test('the project store\'s own sanitising can rely on it: a note read back from storage is still a note the pass accepts', async () => {
  const idx = handIndex([longPart(1), longPart(2)]);
  const project = projectWith();
  await readThrough({ engine: engineOf(), index: idx, cache: projectNotesCache(project) });
  project.readingNotes = sanitizeReadingNotes(JSON.parse(JSON.stringify(project.readingNotes)));
  const engine = engineOf();
  const r = await readThrough({ engine, index: idx, cache: projectNotesCache(project) });
  assert.equal(engine.calls.length, 0);
  assert.equal(r.modelRead, 2);
});

// ── time estimate ────────────────────────────────────────────────────────────

test('the time estimate is the sections still to read at the measured pace, plus the overview', () => {
  assert.equal(estimateReadMs({ sections: 10 }), 10 * 25000 + 25000);
  assert.equal(estimateReadMs({ sections: 10, cachedCount: 4 }), 6 * 25000 + 25000);
  assert.equal(estimateReadMs({ sections: 10, cachedCount: 4, msPerSection: 10000, overviewMs: 5000 }), 65000);
  assert.equal(estimateReadMs({ sections: 3, cachedCount: 9, msPerSection: 1000, overviewMs: 0 }), 0, 'never negative');
  assert.equal(estimateReadMs({ sections: 0, overviewMs: 0 }), 0);
  const parts = [{ words: 400 }, { words: 12 }, { words: 300 }];
  assert.equal(estimateReadMs({ sections: parts, msPerSection: 1000, overviewMs: 0 }), 2000, 'sections too short to need the model cost nothing');
  assert.ok(Number.isFinite(estimateReadMs({ sections: undefined })));
  assert.equal(estimateReadMs({ sections: [{ words: 3, start: 0, end: 1500 }, { words: 3, start: 1500, end: 1600 }], msPerSection: 1000, overviewMs: 0 }), 1000, 'a long section with few words still needs the model');
});
