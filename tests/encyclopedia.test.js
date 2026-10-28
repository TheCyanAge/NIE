import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pushVarint, readVarint } from '../apps/web/src/engine/encyclopedia/varint.js';
import { terms, titleKey, titleKeys } from '../apps/web/src/engine/encyclopedia/tokens.js';
import { clipLead, cleanLead, parseDocLine, rankingField, toEntry } from '../apps/web/src/engine/encyclopedia/cirrus.js';
import { TopN } from '../apps/web/src/engine/encyclopedia/select.js';
import { buildPack, Pack } from '../apps/web/src/engine/encyclopedia/pack.js';
import { buildFromDump } from '../apps/web/src/engine/encyclopedia/build.js';
import { definitionalAnswer, definitionSubject, titleNames } from '../apps/web/src/engine/encyclopedia/define.js';
import { ARTICLES, sampleDump } from './fixtures/cirrus-sample.mjs';

const dump = async (o = {}) => buildFromDump(Readable.from([sampleDump()]), { name: 'sample', lang: 'en', builtAt: '2026-01-01', ...o });
const packOf = async (o) => Pack.open((await dump(o)).bytes);

test('varints round-trip, and a cut-off one is an error rather than a wrong number', () => {
  const out = [];
  const values = [0, 1, 127, 128, 300, 16383, 16384, 2 ** 21, 2 ** 28 + 5];
  for (const v of values) pushVarint(out, v);
  const buf = Buffer.from(out);
  let at = 0;
  for (const v of values) {
    const r = readVarint(buf, at);
    assert.equal(r.value, v);
    at = r.next;
  }
  assert.equal(at, buf.length);
  assert.throws(() => readVarint(Buffer.from([0x80]), 0));
});

test('words meet however they are written: plural, final e, accents, case; titles are found by their plain name', () => {
  assert.deepEqual(terms('Bridges'), terms('bridge'));
  assert.deepEqual(terms('it rises'), terms('rise'));
  assert.deepEqual(terms('Café'), terms('cafe'));
  assert.deepEqual(terms('Tell me about the Eiffel Tower', { question: true }), terms('Eiffel Tower'));
  assert.equal(titleKey('Hamlet (1996 film)'), 'hamlet 1996 film');
  assert.ok(titleKeys('Hamlet (1996 film)').includes('hamlet'));
  assert.ok(titleKeys('The Salt Ledger').includes('salt ledger'));
});

test('a dump line is an article, an index line or nothing; only real articles with a real lead become entries', () => {
  assert.equal(parseDocLine('{"index":{"_id":"1"}}'), null);
  assert.equal(parseDocLine('not json'), null);
  assert.equal(parseDocLine(''), null);
  const doc = (o) => ({ title: 'Thing', namespace: 0, opening_text: 'A thing is an object that this invented sentence describes at some length for the test.', ...o });
  assert.equal(toEntry(doc({ namespace: 1 })), null, 'a talk page');
  assert.equal(toEntry(doc({ opening_text: 'Short.' })), null, 'a lead too short to say anything');
  assert.equal(toEntry(doc({ opening_text: 'Thing may refer to: a very long list of unrelated things that the page goes on to name below.' })), null, 'a disambiguation page');
  assert.equal(toEntry(doc({ title: 'List of things' })), null);
  const e = toEntry(doc({ popularity_score: 0.5, incoming_links: 7, redirect: [{ namespace: 0, title: 'Stuff' }, { namespace: 1, title: 'Talk:Stuff' }] }));
  assert.equal(e.rank, 0.5);
  assert.deepEqual(e.aliases, ['Stuff']);
  assert.equal(toEntry(doc({ popularity_score: 0.5, incoming_links: 7 }), { rankBy: 'incoming_links' }).rank, 7);
  assert.equal(rankingField([{ incoming_links: 3 }]), 'incoming_links');
  assert.equal(rankingField([{ popularity_score: 0.1 }]), 'popularity_score');
});

test('a lead is cut at a sentence end, never mid-sentence, and brackets left empty by pronunciations go', () => {
  const lead = 'First sentence is here. Second sentence is here. Third sentence is here. Fourth sentence is here.';
  const cut = clipLead(lead, 60);
  assert.match(cut, /\.$/);
  assert.ok(cut.length <= 60);
  assert.equal(clipLead('short', 60), 'short');
  assert.equal(cleanLead('The Tower ( ; ) is tall ,  really .'), 'The Tower is tall, really.');
  assert.equal(cleanLead('A thing ( EYE-fəl ) here'), 'A thing (EYE-fəl) here');
});

test('the top N of a long stream are kept, in order, with ties going to the earlier one', () => {
  const t = new TopN(3);
  for (const [i, r] of [5, 1, 9, 3, 7, 9, 2].entries()) t.add({ rank: r, i });
  assert.deepEqual(t.result().map((e) => [e.rank, e.i]), [[9, 2], [9, 5], [7, 4]]);
  const one = new TopN(1);
  one.add({ rank: 1 });
  one.add({ rank: 1, second: true });
  assert.equal(one.result()[0].second, undefined);
});

test('a dump becomes a pack of the articles worth having, most prominent first', async () => {
  const built = await dump();
  assert.equal(built.read, 10);
  assert.equal(built.docs, 6, 'the disambiguation page, the list, the stub and the talk page are left out');
  assert.equal(built.rankBy, 'popularity_score');
  const p = await Pack.open(built.bytes);
  assert.equal(p.info.docs, 6);
  assert.equal(p.info.lang, 'en');
  assert.equal(p.info.builtAt, '2026-01-01');
  assert.equal((await p.get(0)).title, 'Veldhaven', 'the most read article is first');
  assert.equal(await p.get(99), null);
  assert.equal(await p.get(-1), null);
  assert.match(p.info.attribution, /CC BY-SA 4\.0/);
});

test('a dump with only link counts is ranked by links, and maxDocs keeps the best', async () => {
  const lines = ARTICLES.map(([title, lead], i) => `{"index":{"_id":"${i}"}}\n${JSON.stringify({ title, namespace: 0, opening_text: lead, incoming_links: 100 - i })}`).join('\n');
  const built = await buildFromDump(Readable.from([lines]), { name: 'links', maxDocs: 2 });
  assert.equal(built.rankBy, 'incoming_links');
  const p = await Pack.open(built.bytes);
  assert.equal(p.info.docs, 2);
  assert.deepEqual([(await p.get(0)).title, (await p.get(1)).title], ['Marlowe Bridge', 'River Tamsin']);
});

test('an empty or wrong dump says so instead of building an empty pack', async () => {
  await assert.rejects(buildFromDump(Readable.from(['{"index":{}}\n{"title":"x","namespace":1}\n']), { name: 'x' }), /no articles/);
  assert.throws(() => buildPack([], { name: 'x' }), /at least one/);
});

test('questions find the article that answers them, with the exact subject first', async () => {
  const p = await packOf();
  const top = async (q) => (await p.search(q, { limit: 3 })).map((r) => r.title);
  assert.equal((await top('how long is the Marlowe Bridge'))[0], 'Marlowe Bridge');
  assert.equal((await top('who wrote The Salt Ledger'))[0], 'Ilse Quarrel');
  assert.deepEqual((await top('where does the Tamsin rise')).slice(0, 2), ['River Tamsin', 'Karr Hills']);
  assert.deepEqual(await top('xyzzy quux'), []);
  assert.deepEqual(await top('the of and'), []);
  const hit = (await p.search('Marlowe Bridge'))[0];
  assert.equal(hit.url, 'https://en.wikipedia.org/wiki/Marlowe_Bridge');
  assert.match(hit.snippet, /suspension bridge/);
});

test('an article is also found by its other names, a leading "the", and its address', async () => {
  const p = await packOf();
  const id = p.findTitle('Marlowe Bridge');
  assert.equal(p.findTitle('Tamsin Crossing'), id, 'a redirect to it');
  assert.equal(p.findTitle('the marlowe bridge'), id);
  assert.equal(p.findTitle('Nonesuch'), null);
  assert.equal((await p.readUrl('https://en.wikipedia.org/wiki/Marlowe_Bridge')).title, 'Marlowe Bridge');
  assert.equal(await p.readUrl('https://en.wikipedia.org/wiki/Nonesuch'), null);
  assert.equal(await p.readUrl('https://example.org/wiki/Marlowe_Bridge'), null, 'only Wikipedia addresses');
  assert.equal(await p.readUrl('https://de.wikipedia.org/wiki/Marlowe_Bridge'), null, 'only this pack\'s language');
});

test('a pack read from a file answers exactly like one in memory; a cut-short, foreign or newer file is refused plainly', async () => {
  const built = await dump();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nie-pack-'));
  try {
    const file = path.join(dir, 'sample.niepack');
    fs.writeFileSync(file, built.bytes);
    const a = await Pack.open(file);
    const b = await Pack.open(built.bytes);
    assert.deepEqual(await a.search('salt traders'), await b.search('salt traders'));
    assert.equal(a.info.bytes, built.bytes.length);
    await a.close();
    const cut = path.join(dir, 'cut.niepack');
    fs.writeFileSync(cut, built.bytes.subarray(0, built.bytes.length - 40));
    await assert.rejects(Pack.open(cut), /cut short|did not finish/);
    const junk = path.join(dir, 'junk.niepack');
    fs.writeFileSync(junk, Buffer.from('this is not a pack at all'));
    await assert.rejects(Pack.open(junk), /not an encyclopedia pack/);
    const header = JSON.parse(built.bytes.subarray(12, 12 + built.bytes.readUInt32LE(8)).toString());
    assert.equal(header.version, 1);
    const newer = Buffer.from(built.bytes);
    const at = newer.indexOf('"version":1');
    newer.write('"version":9', at);
    await assert.rejects(Pack.open(newer), /version 9/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('a larger pack still answers quickly and finds a planted fact among thousands of near-misses', async () => {
  const docs = [];
  for (let i = 0; i < 3000; i++) docs.push({ title: `Town ${i}`, text: `Town ${i} is a place in the invented district of Region ${i % 50}. It has a market, a church and about ${1000 + i} people.`, rank: 3000 - i });
  docs.push({ title: 'Glimmerfen', text: 'Glimmerfen is a marsh where the rare lantern frog lives. Its song can be heard for two kilometres.', rank: 5 });
  const p = await Pack.open(buildPack(docs, { name: 'big' }));
  const t0 = Date.now();
  const hits = await p.search('where does the lantern frog live', { limit: 3 });
  assert.equal(hits[0].title, 'Glimmerfen');
  assert.ok(Date.now() - t0 < 1500, 'a question is answered in well under a second or two');
  assert.equal((await p.search('Town 1234'))[0].title, 'Town 1234');
});

// ── answering "what is X" from the article itself ────────────────────────────

test('only a plain "what or who is X" is a definition question, and X is the thing named', () => {
  const subject = (q) => definitionSubject(q);
  assert.equal(subject('What is a sonnet?'), 'sonnet');
  assert.equal(subject('who was Gustave Eiffel'), 'Gustave Eiffel');
  assert.equal(subject('Tell me about Veldhaven'), 'Veldhaven');
  assert.equal(subject('explain the salt trade'), 'salt trade');
  assert.equal(subject('what is the definition of irony'), 'irony');
  assert.equal(subject('what is my story about'), null);
  assert.equal(subject('what is this chapter missing'), null);
  assert.equal(subject('how long is the Marlowe Bridge'), null);
  assert.equal(subject('what is the best way to open a novel when you have a lot of backstory to carry'), null);
  assert.equal(subject(''), null);
});

test('an article of exactly that name is quoted, numbered, and nothing is added; anything looser is left to the model', () => {
  const sources = [
    { n: 1, title: 'Veldhaven (city)', text: 'Veldhaven is the largest port city of Orsland. About two million people live there. It was founded by salt traders in the ninth century.' },
    { n: 2, title: 'Sonnet', text: 'A sonnet is a poem in fourteen lines.' },
    { n: 3, title: 'Veldhaven Cup', text: 'The Veldhaven Cup is a football competition.' },
  ];
  const a = definitionalAnswer({ question: 'Tell me about Veldhaven', sources });
  assert.equal(a.reply, 'Veldhaven is the largest port city of Orsland. About two million people live there. [1]');
  assert.equal(definitionalAnswer({ question: 'What are sonnets?', sources }).reply, 'A sonnet is a poem in fourteen lines. [2]');
  assert.equal(definitionalAnswer({ question: 'What is the Veldhaven Cup', sources }).n, 3);
  assert.equal(definitionalAnswer({ question: 'What is a football', sources }), null, 'no article of that name');
  assert.equal(definitionalAnswer({ question: 'how old is Veldhaven', sources }), null);
  assert.ok(titleNames('Veldhaven (city)', 'veldhaven'));
  assert.ok(!titleNames('Veldhaven Cup', 'Veldhaven'));
});

test('an article named exactly like the question comes first, however much other articles repeat the word', async () => {
  const docs = [
    { title: 'Glimmerfen', text: 'Glimmerfen is a marsh where the rare lantern frog lives and sings at night.', rank: 5 },
    { title: 'Frog songs', text: `${'Glimmerfen glimmerfen glimmerfen frogs sing there. '.repeat(12)}They are loud.`, rank: 500 },
    { title: 'Marshes', text: 'A marsh is a wetland that floods; Glimmerfen is one of them. ' + 'Marshes hold water. '.repeat(10), rank: 400 },
  ];
  const p = await Pack.open(buildPack(docs, { name: 'exact' }));
  assert.equal((await p.search('Glimmerfen'))[0].title, 'Glimmerfen');
  assert.equal((await p.search('what is Glimmerfen?'))[0].title, 'Glimmerfen');
  assert.deepEqual((await p.search('Glimmerfen', { limit: 2 })).map((r) => r.title).length, 2);
  assert.equal(new Set((await p.search('Glimmerfen')).map((r) => r.id)).size, (await p.search('Glimmerfen')).length, 'nobody twice');
});

test('a pack whose header lies about its own size is refused before anything large is read', async () => {
  const built = (await dump()).bytes;
  const hl = built.readUInt32LE(8);
  const header = JSON.parse(built.subarray(12, 12 + hl).toString());
  const rebuild = (mutate) => {
    const h = structuredClone(header);
    mutate(h);
    const json = Buffer.from(JSON.stringify(h));
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32LE(json.length);
    return Buffer.concat([built.subarray(0, 8), lenBuf, json, built.subarray(12 + hl)]);
  };
  await assert.rejects(Pack.open(rebuild((h) => { h.docs = 6_000_000; })), /damaged/);
  await assert.rejects(Pack.open(rebuild((h) => { h.sections.postings.len = 2 ** 31; })), /cut short/);
  await assert.rejects(Pack.open(rebuild((h) => { delete h.sections.keys; })), /cut short|damaged/);
  await assert.rejects(Pack.open(rebuild((h) => { h.terms += 1; })), /damaged/);
  const garbage = Buffer.concat([built.subarray(0, 12), Buffer.from('{not json at all}'.padEnd(hl, ' ')), built.subarray(12 + hl)]);
  await assert.rejects(Pack.open(garbage), /damaged/);
  // and a header that is fine still opens
  assert.equal((await Pack.open(rebuild(() => {}))).info.docs, 6);
});

test('a pack file that cannot be opened leaves no file handle behind (it can be removed or replaced at once)', { skip: !fs.existsSync('/proc/self/fd') }, async () => {
  const built = (await dump()).bytes;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nie-fd-'));
  try {
    const files = {
      cut: built.subarray(0, built.length - 40),
      junk: Buffer.from('this is not a pack at all'),
      header: Buffer.concat([built.subarray(0, 12), Buffer.from('{not json at all}'.padEnd(built.readUInt32LE(8), ' ')), built.subarray(12 + built.readUInt32LE(8))]),
      empty: Buffer.alloc(0),
    };
    const open = () => fs.readdirSync('/proc/self/fd').length;
    const before = open();
    for (const [name, bytes] of Object.entries(files)) {
      const f = path.join(dir, `${name}.niepack`);
      fs.writeFileSync(f, bytes);
      await assert.rejects(Pack.open(f), /pack/);
    }
    assert.equal(open(), before, 'no descriptor was left open by a failed open');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('a pack carries the name a writer knows it by, and a built one says which Wikipedia it is', async () => {
  const p = await Pack.open(buildPack([{ title: 'Sonnet', text: 'A sonnet is a poem of fourteen lines that follows a set rhyme scheme.', rank: 1 }], { name: 'x', title: 'Simple English Wikipedia' }));
  assert.equal(p.info.title, 'Simple English Wikipedia');
  assert.equal((await Pack.open(buildPack([{ title: 'Sonnet', text: 'A sonnet is a poem of fourteen lines that follows a set rhyme scheme.', rank: 1 }], { name: 'x' }))).info.title, '', 'an older or untitled pack has none');
  assert.equal((await dump({ title: 'Simple English Wikipedia' })).bytes.length > 0, true);
  assert.equal((await Pack.open((await dump({ title: 'Simple English Wikipedia' })).bytes)).info.title, 'Simple English Wikipedia');
});

test('Wikipedia\'s leftovers never reach a reader: taken out when a pack is built, and when an older pack is read', async () => {
  const junk = "Lua error in package.lua at line 80: module 'Module:Pagetype/setindex' not found. The speed of light, usually denoted by c {\\displaystyle c}, is a physical constant that every observer measures the same. This short article can be made longer. You can help Wikipedia by adding to it.";
  const entry = toEntry({ title: 'Speed of light', namespace: 0, opening_text: junk, popularity_score: 1 });
  assert.equal(entry.text, 'The speed of light, usually denoted by c, is a physical constant that every observer measures the same.');
  // an older pack, built before the cleaning, still reads clean
  const old = await Pack.open(buildPack([{ title: 'Speed of light', text: junk, rank: 1 }], { name: 'old' }));
  assert.equal((await old.get(0)).text, entry.text);
  assert.doesNotMatch((await old.search('speed of light'))[0].snippet, /displaystyle|Lua error|made longer/);
});

test('an article named by words of the question comes before generic articles that merely share a word (when the search is asked to look for names)', async () => {
  // (on a real pack the generic articles win on prominence; scripts/encyclopedia-eval.mjs measures whether asking for names helps there)
  const docs = [
    { title: 'Fire', text: 'Fire is a chemical reaction that gives off light and heat. Fire can start in many ways and fire is very dangerous to forests and homes.', rank: 900 },
    { title: 'London', text: 'London is the capital and largest city of England and the United Kingdom, on the Thames.', rank: 800 },
    { title: 'Great Fire of London', text: 'The Great Fire of London happened in 1666. It lasted for just under five days.', rank: 5 },
    { title: 'Death', text: 'Death is the end of a life. People die of age, disease and accidents. Death comes to every living thing.', rank: 700 },
    { title: 'Black Death', text: 'The Black Death was a pandemic in Europe in the 14th century that killed millions.', rank: 4 },
  ];
  const p = await Pack.open(buildPack(docs, { name: 'names' }));
  const first = async (q, tune) => (await p.search(q, { limit: 3, tune }))[0].title;
  assert.equal(await first('what caused the Great Fire of London', { titles: true }), 'Great Fire of London');
  assert.equal(await first('what was the Black Death and how many died', { titles: true }), 'Black Death');
});
