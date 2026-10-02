import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRule } from '../apps/web/src/engine/rules/parse.js';
import { scan, scanWithModel } from '../apps/web/src/engine/analysis/scan.js';
import { parseJudgeReply, buildJudgeMessages, chunkSentences, JUDGE_SYSTEM } from '../apps/web/src/engine/rules/judge.js';
import { addRule, updateRule, removeRule, activeRules } from '../apps/web/src/engine/rules/rules.js';
import { markIntentional, dismissFinding } from '../apps/web/src/engine/project/memory.js';
import { projectWith, withRules } from './helpers.js';

const only = (rule, text, extra = {}) => {
  const project = withRules(projectWith(extra), Array.isArray(rule) ? rule : [rule]);
  return scan({ text, project, observations: false });
};
const hit = (r, text) => r.findings.map((f) => text.slice(f.start, f.end));

// ── understanding rules written in plain language ───────────────────────────

test('forbidden words are understood, quoted or bare', () => {
  assert.deepEqual(parseRule('Never use the word "suddenly"').parts, [{ kind: 'forbid', terms: ['suddenly'] }]);
  assert.deepEqual(parseRule("Don't say okay.").parts, [{ kind: 'forbid', terms: ['okay'] }]);
  assert.deepEqual(parseRule('Avoid the words very, really or just').parts[0].terms, ['very', 'really', 'just']);
  assert.deepEqual(parseRule("No 'literally' anywhere").parts[0].terms, ['literally']);
});

test('named patterns, limits, POV, tense and terminology are understood', () => {
  assert.deepEqual(parseRule('No adverbs').parts, [{ kind: 'pattern', id: 'adverbs' }]);
  assert.deepEqual(parseRule('Avoid exclamation marks and semicolons').parts.map((p) => p.id), ['exclamation', 'semicolon']);
  assert.deepEqual(parseRule('No sentence longer than 25 words').parts, [{ kind: 'limit', unit: 'sentence', metric: 'words', dir: 'max', n: 25 }]);
  assert.deepEqual(parseRule('Paragraphs must be under 120 words').parts, [{ kind: 'limit', unit: 'paragraph', metric: 'words', dir: 'max', n: 120 }]);
  assert.deepEqual(parseRule('Max 4 sentences per paragraph').parts, [{ kind: 'limit', unit: 'paragraph', metric: 'sentences', dir: 'max', n: 4 }]);
  assert.deepEqual(parseRule('At least 30 words per paragraph').parts, [{ kind: 'limit', unit: 'paragraph', metric: 'words', dir: 'min', n: 30 }]);
  assert.deepEqual(parseRule('Stay in first person').parts, [{ kind: 'pov', wanted: ['first'], banned: [] }]);
  assert.deepEqual(parseRule('Never use second person').parts, [{ kind: 'pov', wanted: [], banned: ['second'] }]);
  assert.deepEqual(parseRule('Past tense only').parts, [{ kind: 'tense', wanted: ['past'], banned: [] }]);
  assert.deepEqual(parseRule('Use "the Hollow" not "the Pit"').parts, [{ kind: 'terminology', prefer: 'the Hollow', avoid: 'the Pit' }]);
  assert.deepEqual(parseRule('"Pit" must be called "Hollow"').parts, [{ kind: 'terminology', prefer: 'Hollow', avoid: 'Pit' }]);
});

test('meaning-based rules: negative ones get an offline keyword approximation, positive ones need the model', () => {
  const a = parseRule('Samantha would never willingly go near water');
  assert.equal(a.parts.length, 0);
  assert.equal(a.method, 'keyword');
  assert.equal(a.semantic.subject.label, 'Samantha');
  assert.ok(a.semantic.groups[0].includes('river'));
  assert.match(a.understood, /offline keyword match/);

  const b = parseRule('Magic cannot resurrect the dead');
  assert.equal(b.semantic.subject.label, 'Magic');
  assert.equal(b.semantic.groups.length, 2);
  assert.equal(b.semantic.need, 2);

  const c = parseRule('Samantha always wears gloves');
  assert.equal(c.method, 'model');
  assert.match(c.understood, /needs the language model/);
});

test('every rule says how it was understood, so the writer can correct it', () => {
  for (const t of ['No adverbs', 'Never use the word "x"', 'No sentence longer than 25 words', 'Samantha never lies', 'Samantha always wears gloves']) {
    assert.ok(parseRule(t).understood.length > 10, t);
  }
});

// ── finding WHERE rules are broken ───────────────────────────────────────────

test('forbidden word: every occurrence is highlighted exactly, whole words only, any case', () => {
  const text = 'He felt Suddenly small. Then suddenly it was over. The suddenness of it, though, was fine.\n\nSuddenly, again.';
  const r = only('Never use the word "suddenly"', text);
  assert.deepEqual(hit(r, text), ['Suddenly', 'suddenly', 'Suddenly']);
  assert.ok(r.findings.every((f) => f.class === 'hard-conflict' && f.section === 'rule'));
});

test('each violation carries line, column, scene, the rule, and a brief reason', () => {
  const text = 'First line is fine.\nSecond line says suddenly here.\n\n***\n\nThird line also says suddenly.';
  const r = only('Never use the word "suddenly"', text);
  assert.equal(r.findings.length, 2);
  assert.equal(r.findings[0].meta.line, 2);
  assert.equal(r.findings[0].meta.column, 18);
  assert.equal(r.findings[0].sceneIndex, 0);
  assert.equal(r.findings[1].sceneIndex, 1);
  assert.equal(r.findings[0].meta.ruleText, 'Never use the word "suddenly"');
  assert.ok(r.findings.every((f) => f.message.length <= 160), 'explanations stay brief');
  assert.match(r.findings[0].message, /ruled out/);
});

test('adverbs: flags -ly adverbs but not ordinary -ly words', () => {
  const text = 'She walked slowly. The family was only happy. He spoke quietly and carefully to his lonely friend.';
  const r = only('No adverbs', text);
  assert.deepEqual(hit(r, text), ['slowly', 'quietly', 'carefully']);
  assert.ok(r.findings.every((f) => f.class === 'likely-issue'), 'pattern approximations are not presented as certain');
});

test('exclamation marks, semicolons, contractions, similes, dialogue', () => {
  const text = 'Stop! He ran; she did not. "Don\'t go," he said. It was like a dream.';
  assert.deepEqual(hit(only('Never use exclamation marks', text), text), ['!']);
  assert.deepEqual(hit(only('No semicolons', text), text), [';']);
  assert.deepEqual(hit(only('No contractions', text), text), ["Don't"]);
  assert.deepEqual(hit(only('Avoid similes', text), text), ['like a']);
  assert.deepEqual(hit(only('No dialogue', text), text), ['"Don\'t go,"']);
});

test('sentence length limit highlights the whole sentence and says how long it is', () => {
  const long = Array.from({ length: 30 }, (_, i) => `word${i}`).join(' ') + '.';
  const text = `Short one here. ${long} Another short one.`;
  const r = only('No sentence longer than 25 words', text);
  assert.equal(r.findings.length, 1);
  assert.equal(text.slice(r.findings[0].start, r.findings[0].end), long);
  assert.equal(r.findings[0].message, '30-word sentence; your limit is 25.');
});

test('paragraph limits by words and by sentences', () => {
  const p1 = 'One. Two. Three. Four. Five. Six.';
  const p2 = 'Just one.';
  const text = `${p1}\n\n${p2}`;
  const r = only('Max 4 sentences per paragraph', text);
  assert.equal(r.findings.length, 1);
  assert.equal(text.slice(r.findings[0].start, r.findings[0].end), p1);
  assert.match(r.findings[0].message, /6 sentences/);
  const m = only('At least 5 words per paragraph', text);
  assert.equal(m.findings.length, 1);
  assert.equal(text.slice(m.findings[0].start, m.findings[0].end), p2);
});

const THIRD = 'She walked down the hall and she opened the door. Her hands were cold, and her breath was slow in the dark. He waited for her by the stairs.';
const FIRST = 'I walked down the hall and I opened the door. My hands were cold, and my breath was slow in the dark. I waited by the stairs and I watched myself go.';
const PRESENT = 'She walks down the hall and opens the door. The room is cold and the lamp has gone out. She looks at the bed and feels the dust on her hands.';

test('POV rules: the paragraph that breaks the rule is highlighted, with the reason', () => {
  const text = [THIRD, THIRD, FIRST, THIRD].join('\n\n');
  const r = only('Third person only', text);
  assert.equal(r.findings.length, 1);
  assert.equal(text.slice(r.findings[0].start, r.findings[0].end), FIRST);
  assert.match(r.findings[0].message, /Reads as first person; your rule allows only third person/);
  assert.equal(only('Never use first person', text).findings.length, 1);
  assert.equal(only('Never use second person', text).findings.length, 0);
});

test('tense rules point at the paragraph in the wrong tense', () => {
  const past = 'She walked down the hall and opened the door. The room was cold and the lamp had burned out. She looked at the bed and felt the dust on her hands.';
  const text = [past, past, PRESENT, past].join('\n\n');
  const r = only('Past tense only', text);
  assert.equal(r.findings.length, 1);
  assert.equal(text.slice(r.findings[0].start, r.findings[0].end), PRESENT);
  assert.match(r.findings[0].message, /Reads as present tense/);
});

test('terminology rule finds the term to avoid', () => {
  const text = 'They climbed into the Pit. Later, the Hollow echoed.';
  const r = only('Use "the Hollow" not "the Pit"', text);
  assert.deepEqual(hit(r, text), ['the Pit']);
  assert.match(r.findings[0].message, /use "the Hollow"/);
});

// ── meaning-based rules: honest offline approximation ───────────────────────

test('keyword approximation finds candidates, labels them, and respects negation', () => {
  const text = [
    'Samantha waded into the river up to her knees.',
    'Samantha never went near the river after that day.',
    'Mara swam across the lake while Joss watched.',
  ].join(' ');
  const r = only('Samantha would never willingly go near water', text);
  assert.deepEqual(hit(r, text), ['Samantha waded into the river up to her knees.']);
  assert.equal(r.findings[0].class, 'possible-issue');
  assert.equal(r.findings[0].meta.method, 'keyword');
  assert.match(r.findings[0].message, /Keyword match/);
  assert.equal(r.rules.items[0].state, 'approximate');
});

test('world rules with several concepts need all of them in the same sentence', () => {
  const text = 'Magic could light a lamp. The corpse lay in the grave. The magic raised her brother from the dead.';
  const r = only('Magic cannot resurrect the dead', text);
  assert.deepEqual(hit(r, text), ['The magic raised her brother from the dead.']);
});

test('a subject mentioned in the previous sentence counts, at lower confidence', () => {
  const text = 'Samantha stood on the shore. She stepped into the water.';
  const r = only('Samantha would never go near water', text);
  const f = r.findings.map((x) => ({ s: text.slice(x.start, x.end), c: x.confidence }));
  assert.ok(f.some((x) => x.s === 'She stepped into the water.' && x.c < 0.5));
});

test('rules that need meaning are not faked offline', () => {
  const r = only('Samantha always wears gloves', 'Samantha took off her gloves and laid them on the table, and she smiled at the guard.');
  assert.equal(r.findings.length, 0);
  assert.equal(r.rules.items[0].state, 'needs-model');
  assert.match(r.headline, /1 not checked offline \(needs the language model\)/);
});

test('aliases from project memory extend the subject of a rule', () => {
  const project = withRules(projectWith({ memory: { characters: [{ name: 'Samantha', aliases: ['Sam'], notes: '' }] } }), ['Samantha would never go near water']);
  const text = 'Sam waded into the river.';
  const r = scan({ text: text + ' ' + text, project, observations: false });
  assert.ok(r.findings.length >= 1);
});

// ── bookkeeping ──────────────────────────────────────────────────────────────

test('disabled rules are listed but not checked; rules can be added, edited, removed', () => {
  const project = projectWith();
  const rule = addRule(project, { text: 'Never use the word "very"', category: 'voice' });
  assert.equal(addRule(project, { text: 'never use the word "very"' }).id, rule.id, 'no duplicates');
  const text = 'It was very cold and very dark outside the very old house, and nobody went out there.';
  assert.equal(scan({ text, project, observations: false }).findings.length, 3);
  updateRule(project, rule.id, { enabled: false });
  const r = scan({ text, project, observations: false });
  assert.equal(r.findings.length, 0);
  assert.equal(r.rules.items[0].state, 'disabled');
  assert.equal(activeRules(project).length, 0);
  removeRule(project, rule.id);
  assert.equal(project.rules.length, 0);
});

test('the writer can mark a violation as an exception or dismiss it; both persist across scans', () => {
  const project = withRules(projectWith(), ['Never use the word "suddenly"']);
  const text = 'It was quiet. Suddenly a door slammed. Then suddenly it stopped, and nobody spoke at all.';
  const first = scan({ text, project, observations: false });
  assert.equal(first.findings.length, 2);
  markIntentional(project, first.findings[0]);
  dismissFinding(project, first.findings[1]);
  const second = scan({ text, project, observations: false });
  assert.equal(second.findings.length, 1);
  assert.equal(second.findings[0].class, 'intentional-possibility');
  assert.equal(second.dismissedCount, 1);
  assert.equal(second.rules.items[0].count, 1);
});

test('per-rule results are capped so a noisy rule cannot flood the report', () => {
  const text = Array.from({ length: 60 }, () => 'He ran quickly.').join(' ');
  const r = only('No adverbs', text);
  assert.equal(r.findings.length, 25);
  assert.equal(r.rules.items[0].truncated, true);
  assert.equal(r.rules.items[0].total, 60);
  assert.equal(r.rules.items[0].count, 25);
});

test('NIE never writes or edits: no finding carries replacement or rewritten text, and the input is untouched', () => {
  const text = 'Suddenly, she ran quickly! The family was only happy; the room was like a dream.';
  const copy = String(text);
  const r = scan({ text, project: withRules(projectWith(), ['No adverbs', 'Never use the word "suddenly"', 'No exclamation marks']) });
  assert.equal(text, copy);
  for (const f of r.findings) {
    for (const k of ['suggestion', 'replacement', 'rewrite', 'revised', 'with']) assert.ok(!(k in f), `finding has "${k}"`);
    if (f.start != null) assert.ok(text.includes(f.quote.replace(/…$/, '')) || f.quote === '', 'quotes are always verbatim manuscript text');
  }
});

test('rules and their findings are isolated per project', () => {
  const a = withRules(projectWith(), ['Never use the word "suddenly"']);
  const b = projectWith();
  const text = 'Suddenly, the lights went out in the whole building and nobody could see a thing.';
  assert.equal(scan({ text, project: a, observations: false }).findings.length, 1);
  assert.equal(scan({ text, project: b, observations: false }).findings.length, 0);
});

// ── the language model only judges; it never writes ─────────────────────────

const SAM = 'Samantha handed the guard a forged pass and told him it was real. ' +
  'He believed her and waved her through. ' +
  'Later she admitted to Joss that she had lied to get in. ' +
  'Joss only nodded.';

test('judge prompt forbids writing and shows numbered sentences', () => {
  const project = withRules(projectWith(), ['Samantha never lies']);
  const chunk = chunkSentences([{ text: 'One.' }, { text: 'Two.' }]);
  const msgs = buildJudgeMessages(project.rules[0], chunk[0]);
  assert.equal(msgs[0].content, JUDGE_SYSTEM);
  assert.match(JUDGE_SYSTEM, /never write, rewrite or suggest text/);
  assert.match(msgs[1].content, /1\. One\.\n2\. Two\./);
  assert.match(msgs[1].content, /Rule: Samantha never lies/);
});

test('judge replies are reduced to sentence numbers; anything else is ignored', () => {
  assert.deepEqual(parseJudgeReply('NONE', 5), []);
  assert.deepEqual(parseJudgeReply('none.', 5), []);
  assert.deepEqual(parseJudgeReply('2 | She lies to the guard\n99 | out of range\n2 | duplicate\n0 | zero', 5), [{ index: 1, reason: 'She lies to the guard' }]);
  assert.deepEqual(parseJudgeReply('Here is a better version: "She told the truth."', 5), [], 'prose is never accepted');
  assert.deepEqual(parseJudgeReply('1. lies\n3 - lies again', 5).map((h) => h.index), [0, 2]);
  assert.ok(parseJudgeReply('1 | ' + 'x'.repeat(500), 3)[0].reason.length <= 140);
});

test('scanWithModel: model verdicts replace keyword guesses and map exactly onto the writer\'s own sentences', async () => {
  const project = withRules(projectWith(), ['Samantha never lies']);
  const calls = [];
  const chat = async (messages) => {
    calls.push(messages);
    // The model answers about sentences 1 and 3 and tries to smuggle in new text; only the numbers survive.
    return '1 | Tells the guard a forged pass is real\n3 | Admits she lied\nRewrite: "Samantha told the truth."';
  };
  const r = await scanWithModel({ text: SAM, project, chat, observations: false });
  assert.equal(calls.length, 1);
  assert.equal(r.findings.length, 2);
  assert.deepEqual(r.findings.map((f) => SAM.slice(f.start, f.end)), [
    'Samantha handed the guard a forged pass and told him it was real.',
    'Later she admitted to Joss that she had lied to get in.',
  ]);
  assert.deepEqual(r.findings.map((f) => f.message), ['Tells the guard a forged pass is real', 'Admits she lied']);
  assert.ok(r.findings.every((f) => f.meta.method === 'model' && f.source === 'model' && f.class === 'possible-issue'));
  assert.equal(r.rules.items[0].state, 'judged');
  assert.match(r.headline, /2 places break your rules/);
});

test('scanWithModel: positive meaning rules can now be checked; hallucinated numbers highlight nothing', async () => {
  const project = withRules(projectWith(), ['Samantha always wears gloves']);
  const text = 'Samantha tugged on her gloves. She took them off at the table. Joss watched her hands.';
  const r = await scanWithModel({ text, project, chat: async () => '2 | Takes her gloves off\n57 | made up', observations: false });
  assert.deepEqual(r.findings.map((f) => text.slice(f.start, f.end)), ['She took them off at the table.']);
});

test('scanWithModel: only chunks that mention the rule\'s subject are sent', async () => {
  const project = withRules(projectWith(), ['Samantha never lies']);
  const filler = Array.from({ length: 80 }, (_, i) => `Joss counted ${i} crates by the harbour wall.`).join(' ');
  const text = `${filler} Samantha lied to the guard about the pass. ${filler}`;
  let calls = 0;
  await scanWithModel({ text, project, chat: async () => (calls++, 'NONE'), observations: false });
  const total = chunkSentences(scan({ text, project: projectWith(), observations: false }) && []).length; // sanity: chunker handles empty
  assert.equal(total, 0);
  assert.ok(calls >= 1 && calls <= 2, `expected the subject-bearing chunk(s) only, got ${calls}`);
});

test('scanWithModel: with no model the offline results stay and are labelled as such', async () => {
  const project = withRules(projectWith(), ['Samantha never lies', 'Samantha always wears gloves']);
  const r = await scanWithModel({ text: 'Samantha lied to the guard about the pass. He waved her through.', project, chat: async () => null, observations: false });
  assert.equal(r.findings.length, 1);
  const states = Object.fromEntries(r.rules.items.map((i) => [i.text, i.state]));
  assert.equal(states['Samantha never lies'], 'approximate');
  assert.equal(states['Samantha always wears gloves'], 'needs-model');
  assert.ok(r.findings.every((f) => f.meta.method === 'keyword'));
});

test('scanWithModel: a model error keeps offline results and records why', async () => {
  const project = withRules(projectWith(), ['Samantha never lies']);
  const r = await scanWithModel({ text: 'Samantha lied to the guard about the pass. He waved her through.', project, chat: async () => { throw new Error('model crashed'); }, observations: false });
  assert.equal(r.rules.items[0].state, 'approximate');
  assert.match(r.rules.items[0].note, /model crashed/);
  assert.ok(r.findings.length >= 1);
});

test('scanWithModel: cancelling stops further model calls', async () => {
  const project = withRules(projectWith(), ['Samantha never lies', 'Samantha never steals']);
  const ctrl = new AbortController();
  let calls = 0;
  await scanWithModel({ text: SAM, project, signal: ctrl.signal, observations: false, chat: async () => { calls++; ctrl.abort(); return 'NONE'; } });
  assert.equal(calls, 1);
});

test('exact-pattern rules never call the model', async () => {
  const project = withRules(projectWith(), ['No adverbs', 'Never use the word "suddenly"']);
  let calls = 0;
  const r = await scanWithModel({ text: 'She spoke quietly, and suddenly he left the room without a word.', project, chat: async () => (calls++, 'NONE'), observations: false });
  assert.equal(calls, 0);
  assert.equal(r.findings.length, 3);
});

test('reportAfterDecision applies an exception or dismissal in place, keeping model-judged results', async () => {
  const { reportAfterDecision } = await import('../apps/web/src/engine/analysis/scan.js');
  const project = withRules(projectWith(), ['Samantha never lies']);
  const text = 'Samantha lied to the guard about the pass. She also lied to Joss about the key.';
  const judged = await scanWithModel({ text, project, observations: false, chat: async () => '1 | lies to the guard\n2 | lies to Joss' });
  assert.equal(judged.findings.length, 2);
  const a = reportAfterDecision(judged, judged.findings[0], 'intentional');
  assert.equal(a.findings.length, 2);
  assert.equal(a.findings.find((f) => f.id === judged.findings[0].id).class, 'intentional-possibility');
  assert.equal(a.rules.items[0].state, 'judged', 'model verdicts are not thrown away');
  assert.match(a.headline, /1 place breaks your rules/);
  const b = reportAfterDecision(a, judged.findings[1], 'dismiss');
  assert.equal(b.findings.length, 1);
  assert.equal(b.dismissedCount, 1);
  assert.match(b.headline, /No rule violations found/);
});
