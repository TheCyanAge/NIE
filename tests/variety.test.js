import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SHAPES,
  avoidBlock,
  isPraiseOpener,
  isStockQuestion,
  memoryOf,
  questionsIn,
  recentAssistant,
  refine,
  scrubForPrompt,
  shapeFor,
  similarity,
  splitSentencesLite,
} from '../apps/web/src/engine/orchestrator/variety.js';
import { estimateTokens, words } from '../apps/web/src/engine/util/text.js';

// Two real replies NIE gave on the offline model: both open with praise, give a numbered list, and carry the same stock steering question
// as a paragraph of their own, followed by one more question.
const REPLY_A = `Great focus! Let's dig deeper into your sci-fi horror idea. Here are a few ideas to explore:

1. What if the horror isn't just from alien life forms, but from the psychological impact of long-term isolation in space? How does this affect the crew's mental states and their perception of danger?
2. Could the horror be derived from the crew's own scientific experiments gone wrong? What if they're trying to create new life forms or cure diseases, but something goes drastically wrong?
3. How about a scenario where the horror is not external, but internal? What if a virus or disease is present in the ship, and the crew must fight both the external threat (aliens) and the internal struggle to survive?

Which of these ideas resonates with your vision, or do you see room for a different direction?

What if the crew's desperation to survive and their own psychological state further fuels the horror?`;

const REPLY_B = `Great focus on the fog's psychological impact and the psychological state of the characters! Let's dive deeper into that idea:

1. How might the fog's effects on the characters' perceptions of day and night impact their behavior and relationships? For example, does it lead to confusion or even violence when they can't reliably tell when it's day or night?
2. What if the fog's effect is not just on perception but also on the characters' memories? Could it be that their past experiences are altered, leading to a sense of déjà vu or a disorienting sense of amnesia?

Which of these directions do you find most compelling, or do you see another angle to explore?

Also, considering the long-term effects you mentioned, what specific psychological or behavioral changes do you think the characters might undergo over time?`;

const STOCK_A = 'Which of these ideas resonates with your vision, or do you see room for a different direction?';
const STOCK_B = 'Which of these directions do you find most compelling, or do you see another angle to explore?';

/** Six varied, specific, good replies. refine must leave every one of them exactly as it is. */
const GOOD = {
  lighthouse:
    "The keeper's habit of winding the clock backwards reads less like carelessness than a private ritual. If the village notices, her isolation stops being a choice and becomes a story other people tell about her. That gives the third chapter a pressure it currently lacks, because every visit from the mainland now risks exposing what the ritual protects. Why does she stop winding the clock the night the boat is late?",
  heist:
    'A heist works when the reader holds one fact the crew does not. Right now both you and the crew know the vault code is changed on Fridays, so the double-cross has nothing to exploit. Try asking which piece of information only the safecracker has, and what she would lose by keeping it back. Whatever you choose should surface in the planning scene, not in the break-in itself, so the payoff feels earned.',
  poem: "Your second stanza turns on the word salt, and the poem hears it twice: once as seasoning, once as the sea that took the narrator's brother. The line breaks after both uses are what make the echo audible. If the third stanza keeps that pattern the poem will feel designed; if it drops it, the ending may read as a different poem. Which of those two do you want the closing image to be?",
  essay:
    'An essay that argues against a consensus has to name the consensus early, or the reader will assume you are attacking a straw version. Your draft saves that for page three. Moving the definition of the common view into the first paragraph lets every later section read as an answer to something. The counterargument currently sits in the conclusion, where it can only apologise; as a middle section it could carry real weight.',
  motive:
    "Marguerite's refusal to sell the orchard is doing two jobs: it shows loyalty to her late husband and it hides the fact that she cannot afford to leave. Readers will forgive the first motive and be moved by the second, but only if they learn it late. What does she believe the buyer already knows about the debt?",
  magic:
    'If magic in your world costs memory, then every spell is a trade the caster can no longer fully evaluate, because the thing paid is the thing that would judge the price. That quietly explains why guilds keep ledgers written by others and why apprentices are never taught their own first spell. It also creates a problem to plan for: a powerful mage who has forgotten the rule itself. How do the guilds stop that from happening?',
};

const user = (content) => ({ role: 'user', content });
const nie = (content, extra = {}) => ({ role: 'assistant', content, ...extra });
const wc = (s) => words(s).length;

// ── sentences ────────────────────────────────────────────────────────────────────────────────────────────────────────────────

test('splitSentencesLite: keeps ? and !, breaks at lines, keeps the "1." marker with its item', () => {
  assert.deepEqual(splitSentencesLite('Great focus! Is it the fog? Yes. It is.'), ['Great focus!', 'Is it the fog?', 'Yes.', 'It is.']);
  assert.deepEqual(splitSentencesLite('Here are ideas:\n1. First one? Maybe.\n2. Second one.\n\nWhich one?'), ['Here are ideas:', '1. First one?', 'Maybe.', '2. Second one.', 'Which one?']);
  assert.deepEqual(splitSentencesLite("Let's dive deeper into that idea:\n\n- a bullet\n- another bullet"), ["Let's dive deeper into that idea:", '- a bullet', '- another bullet']);
  const sa = splitSentencesLite(REPLY_A);
  assert.equal(sa[0], 'Great focus!');
  assert.ok(sa.includes(STOCK_A));
  assert.ok(sa.some((s) => s.startsWith('1. What if the horror')), 'the item marker stays with its first sentence');
  assert.ok(sa.every((s) => s.trim() === s && s.length > 0));
});

test('splitSentencesLite: abbreviations, decimals, initials and ellipses do not end a sentence', () => {
  assert.deepEqual(splitSentencesLite('Dr. Smith arrived at 3.5 hours past noon. He was late.'), ['Dr. Smith arrived at 3.5 hours past noon.', 'He was late.']);
  assert.deepEqual(splitSentencesLite('Use a plain noun, e.g. a lighthouse. J. K. Rowling did.'), ['Use a plain noun, e.g. a lighthouse.', 'J. K. Rowling did.']);
  assert.deepEqual(splitSentencesLite('Well... maybe not. Or yes?!'), ['Well... maybe not.', 'Or yes?!']);
  assert.deepEqual(splitSentencesLite('She said "go." Then she left.'), ['She said "go."', 'Then she left.']);
});

test('splitSentencesLite: never returns an empty or marker-only string', () => {
  for (const t of ['', '   \n\n  ', '1.', '-', '...', '1.\n2.\n3. Real item.', '\n\n.\n\n!', '* \n']) {
    const out = splitSentencesLite(t);
    assert.ok(out.every((s) => typeof s === 'string' && s.trim().length > 0), JSON.stringify(t));
  }
  assert.deepEqual(splitSentencesLite('1.\n2.\n3. Real item.'), ['3. Real item.']);
});

test('questionsIn: the question sentences, trimmed, without list markers', () => {
  assert.deepEqual(questionsIn('A statement. Is it a question? "Really?" he asked. Not this.'), ['Is it a question?', '"Really?"']);
  assert.deepEqual(questionsIn('  Padded question here?  \n\n  Another one?!  '), ['Padded question here?', 'Another one?!']);
  const qs = questionsIn(REPLY_A);
  assert.ok(qs.includes(STOCK_A));
  assert.ok(qs.includes('What if the horror isn\'t just from alien life forms, but from the psychological impact of long-term isolation in space?'), 'the list marker is removed');
  assert.equal(qs.length, 8);
  assert.deepEqual(questionsIn('Why? Because.'), ['Why?']);
  assert.deepEqual(questionsIn('Nothing to ask here.'), []);
});

// ── praise ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────

test('isPraiseOpener: true for praise and filler at the start of a reply', () => {
  for (const s of [
    'Great focus!',
    'Great start!',
    "Great focus on the fog's psychological impact and the psychological state of the characters!",
    "That's a fascinating premise!",
    'What a striking image!',
    'Thanks for sharing',
    'Thanks for sharing this!',
    'Thank you for sharing your story.',
    'Interesting premise.',
    'Wonderful idea!',
    'EXCELLENT CHOICE!',
    'Nice work on the opening!',
    'Love the setup!',
    'Fascinating question.',
    'Awesome, let\'s dig in!',
    'That’s a really compelling concept!',
    'Intriguing direction!',
    'Great!',
    '**Great focus!**',
    'I love how the fog becomes a character.',
    'Good idea.',
    'Great question!',
    "That's a great start!",
    'That sounds like an intriguing concept!',
    'That sounds fascinating.',
    "I'd be happy to help with that!",
    "I'm excited to explore this with you!",
    'Well done on the opening.',
  ]) {
    assert.equal(isPraiseOpener(s), true, s);
  }
});

test('isPraiseOpener: false for content sentences that merely start with the same word', () => {
  for (const s of [
    'Great Britain is where the story starts.',
    'Good and evil swap places in the third act.',
    'Interesting that the keeper never speaks of the storm.',
    'Nice, France, is where the second act opens.',
    'Great storms batter the lighthouse every winter!',
    'Love, in this story, is a debt.',
    'What a lighthouse keeper does at night is rarely written about.',
    "That's a long way to row in the dark.",
    "Let's dig deeper into your sci-fi horror idea.",
    'The keeper winds the clock.',
    'Is this a great idea?',
    'Good Omens is a novel about an angel and a demon.',
    '',
    '   ',
  ]) {
    assert.equal(isPraiseOpener(s), false, s);
  }
  assert.equal(isPraiseOpener('Great idea — the keeper could secretly be the ghost the village fears, and that changes every scene she is in.'), false, 'a sentence that carries real content is not "mostly praise"');
});

// ── stock questions ─────────────────────────────────────────────────────────────────────────────────────────────────────────

test('isStockQuestion: generic steering questions that fit any story', () => {
  for (const s of [
    STOCK_A,
    STOCK_B,
    'What do you think?',
    'What do you think of these?',
    'How does that sound?',
    'Does that resonate?',
    'Do any of these ideas resonate with you?',
    'Would you like to explore any of these further?',
    'Would you like to explore the harbour scene?',
    'What direction do you want to take?',
    "Is there anything else you'd like to explore?",
    'Let me know what you think.',
    'Which of these would you like to explore first?',
    'Which one speaks to you?',
    'Which direction do you want to take?',
    'Which one do you prefer?',
    'Do you see another angle to explore?',
    'Does that make sense?',
    'What are your thoughts?',
    'Also, which of these directions feels right to you?',
    '3. Which of these ideas stands out?',
    'How do these ideas resonate with you?',
    'Do these ideas spark anything for you?',
    'How do you feel about these ideas?',
    "Is there a particular direction you'd like to explore further?",
    'What do you think about these ideas?',
    "Does this sound like something you'd want to explore?",
    'Which of these ideas do you think would work best for your story?',
    'Would you like me to elaborate on any of these ideas?',
    'Which of these ideas, if any, resonates with you most?',
    'Which of these options would you say works best?',
  ]) {
    assert.equal(isStockQuestion(s), true, s);
  }
});

test('isStockQuestion: false for specific questions, even ones that start the same way', () => {
  for (const s of [
    'Why does the keeper stop winding the clock?',
    'What do you think the keeper hears in the foghorn?',
    'Which of the two sisters does the keeper trust?',
    'Which of those two do you want the closing image to be?',
    'Which of these doors would you open if the lamp went out?',
    'Would you like the keeper to hear it first?',
    'How does that sound to the harbour master?',
    'What does she believe the buyer already knows about the debt?',
    'Does the keeper feel safe alone?',
    'Is there anything in the logbook that the village could use against her?',
    'Do you see the fog as a threat or a shelter?',
    'Also, considering the long-term effects you mentioned, what specific psychological or behavioral changes do you think the characters might undergo over time?',
    'Does this sound like something the keeper would say?',
    'Which of them does the keeper tell first?',
    'Which one would you spend a week on?',
    'Which idea would you hand to the keeper?',
    'Which of these ideas does the keeper already know about?',
    'How do the villagers feel about the keeper?',
    'The keeper winds the clock.',
    '',
  ]) {
    assert.equal(isStockQuestion(s), false, s);
  }
});

// ── similarity ───────────────────────────────────────────────────────────────────────────────────────────────────────────────

test('similarity: the two stock questions are alike, genuinely different questions are not', () => {
  assert.ok(similarity(STOCK_A, STOCK_B) > 0.6, String(similarity(STOCK_A, STOCK_B)));
  const q1 = 'Why does the keeper stop winding the clock?';
  const q2 = 'What does the keeper owe the harbor master?';
  const q3 = 'Who rowed out to the lighthouse the night the lamp went dark?';
  assert.ok(similarity(q1, q2) < 0.25, String(similarity(q1, q2)));
  assert.ok(similarity(q1, q3) < 0.25);
  assert.ok(similarity(q2, q3) < 0.25);
  assert.ok(similarity('How does the village react when the clock stops?', 'What does the harbor master hide in the cellar?') < 0.25);
});

test('similarity: 1 for identical, 0 for nothing shared, symmetric, within 0..1', () => {
  const pairs = [
    [STOCK_A, STOCK_B],
    ['Why does the keeper stop winding the clock?', 'What makes the keeper stop winding the clock?'],
    ['What is the keeper afraid of?', 'Is the lighthouse haunted?'],
    ['A tiny sentence.', 'Another much longer sentence about something else entirely, with many more words in it.'],
    ['', 'text'],
    ['same words here', 'same words here'],
  ];
  for (const [a, b] of pairs) {
    const s = similarity(a, b);
    assert.ok(s >= 0 && s <= 1, `${a} / ${b}: ${s}`);
    assert.equal(s, similarity(b, a), 'symmetric');
  }
  assert.equal(similarity(STOCK_A, STOCK_A), 1);
  assert.equal(similarity('What do you think?', 'what do you think'), 1);
  assert.equal(similarity('The keeper winds the clock.', 'A violin leans against the ocean.'), 0);
  assert.equal(similarity('', ''), 0);
  assert.equal(similarity('the of and', 'a an the'), 0, 'words that carry no content share nothing');
  assert.ok(similarity('Why does the keeper stop winding the clock?', 'What makes the keeper stop winding the clock?') >= 0.5, 'a reworded repeat is a repeat');
  assert.ok(similarity("What is the keeper's greatest fear?", 'What does the keeper fear most?') < 0.7);
});

// ── recent replies ───────────────────────────────────────────────────────────────────────────────────────────────────────────

test('recentAssistant: the last n replies, oldest first, without NIE\'s fixed notes', () => {
  const history = [
    user('one'),
    nie('reply 1'),
    user('write me a scene'),
    nie('I do not write for you.', { declined: true, route: 'builtin' }),
    nie('reply 2'),
    user('three'),
    nie('reply 3', { meta: { route: 'local' } }),
    nie('fixed note in meta', { meta: { route: 'builtin', declined: true } }),
    nie('   '),
    nie('reply 4'),
  ];
  assert.deepEqual(recentAssistant(history), ['reply 1', 'reply 2', 'reply 3', 'reply 4']);
  assert.deepEqual(recentAssistant(history, 2), ['reply 3', 'reply 4']);
  assert.deepEqual(recentAssistant(history, 0), []);
  assert.deepEqual(recentAssistant(history, 100).length, 4);
  assert.deepEqual(recentAssistant([user('a')]), []);
});

test('memoryOf: openers (<= 14 words), questions (deduped, <= 25 words) and shapes', () => {
  const long = 'This opening sentence goes on for far more than fourteen words because the model sometimes writes very long first sentences indeed.';
  const history = [
    user('x'),
    nie(`${long} Is that clear? Is that clear?`, { shape: 'one-thread' }),
    user('y'),
    nie(REPLY_A, { shape: 'three-sparks' }),
    nie('A reply without a shape. Why?'),
  ];
  const m = memoryOf(history);
  assert.equal(m.openers.length, 3);
  assert.ok(m.openers.every((o) => o.split(/\s+/).length <= 14));
  assert.ok(m.openers[0].endsWith('…'), 'a cut opener says it was cut');
  assert.equal(m.openers[1], 'Great focus!');
  assert.equal(m.questions.filter((q) => q === 'Is that clear?').length, 1, 'deduped');
  assert.ok(m.questions.includes(STOCK_A));
  assert.ok(m.questions.includes('Why?'));
  assert.ok(m.questions.every((q) => q.split(/\s+/).length <= 26));
  assert.deepEqual(m.shapes, ['one-thread', 'three-sparks']);
  assert.deepEqual(memoryOf([]), { openers: [], questions: [], shapes: [] });
  assert.deepEqual(memoryOf(null), { openers: [], questions: [], shapes: [] });
});

// ── avoidBlock ───────────────────────────────────────────────────────────────────────────────────────────────────────────────

test('avoidBlock: empty when there is nothing to avoid', () => {
  assert.equal(avoidBlock([]), '');
  assert.equal(avoidBlock([user('hello')]), '');
  assert.equal(avoidBlock([nie('I do not write for you.', { declined: true })]), '');
  assert.equal(avoidBlock(null), '');
});

test('avoidBlock: forbids praise, lists openings and questions already used, newest first, within 120 tokens', () => {
  const history = [user('a'), nie(GOOD.lighthouse), user('b'), nie(GOOD.motive), user('c'), nie(REPLY_B)];
  const block = avoidBlock(history);
  assert.match(block, /^Do not open with praise/i);
  assert.match(block, /Which of these directions do you find most compelling/, 'the stock question that was asked');
  assert.match(block, /Also, considering the long-term effects/, 'and the last question of the newest reply');
  assert.match(block, /You have already asked: /);
  assert.match(block, /Do not ask those again or anything like them\.$/);
  assert.match(block, /openings you used lately: "Marguerite's refusal/, 'non-praise openings are listed, newest first (praise ones are already forbidden)');
  assert.ok(estimateTokens(block) <= 120, `${estimateTokens(block)} tokens`);
  assert.ok(!/Great focus/.test(block), 'praise openings are not quoted back to the model');
  const older = avoidBlock([user('a'), nie(GOOD.lighthouse), user('b'), nie(GOOD.motive)]);
  assert.match(older, /Why does she stop winding the clock/);
  assert.match(older, /What does she believe the buyer already knows/);
  assert.match(older, /The keeper's habit of winding the clock backwards/);
  assert.ok(estimateTokens(older) <= 120);
  // the two stock questions are one question as far as the model is concerned: it is listed once
  const stock = avoidBlock([user('a'), nie(REPLY_A), user('b'), nie(REPLY_B)]);
  assert.equal((stock.match(/Which of these/g) ?? []).length, 1, stock);
});

test('avoidBlock: still within 120 tokens when the examples are very long', () => {
  const longQ = `${'Does the very long and winding question about the keeper and the village and the clock '.repeat(8)}ever end?`;
  const history = [];
  for (let i = 0; i < 8; i++) history.push(user(`m${i}`), nie(`${'An opening that rambles on about the lighthouse and the sea and the night '.repeat(4)}ends here number ${i}. ${longQ} Another question number ${i} about the debt?`));
  const block = avoidBlock(history);
  assert.ok(block.length > 0 && estimateTokens(block) <= 120, `${estimateTokens(block)} tokens`);
  assert.equal(avoidBlock(history.slice(0, 2)).length > 0, true);
  assert.ok(!block.includes('\n'), 'a compact block');
});

test('avoidBlock: if a reply only asked inside its list, those questions are what is listed', () => {
  const block = avoidBlock([user('x'), nie('Here are ideas:\n\n1. What if the tide never turned?\n2. Could the lamp be a signal?')]);
  assert.match(block, /What if the tide never turned/);
});

// ── scrubForPrompt ─────────────────────────────────────────────────────────────────────────────────────────────────────────

test('scrubForPrompt: removes the praise opener and the stock question, keeps the numbered ideas', () => {
  const out = scrubForPrompt(REPLY_A);
  assert.ok(!out.includes('Great focus!'));
  assert.ok(!out.includes('resonates with your vision'));
  assert.ok(out.startsWith("Let's dig deeper into your sci-fi horror idea."));
  for (const marker of ['1. What if the horror', '2. Could the horror be derived', '3. How about a scenario']) assert.ok(out.includes(marker), marker);
  assert.ok(out.includes("What if the crew's desperation to survive"), 'everything else is kept');
  const b = scrubForPrompt(REPLY_B);
  assert.ok(!b.includes('Great focus') && !b.includes('Which of these directions'));
  assert.ok(b.includes('Also, considering the long-term effects'));
});

test('scrubForPrompt: leaves a good reply alone, and never returns an empty string for real text', () => {
  for (const r of Object.values(GOOD)) assert.equal(scrubForPrompt(r), r);
  assert.equal(scrubForPrompt('Great start!'), 'Great start!');
  assert.equal(scrubForPrompt('Which of these ideas resonates with you?'), 'Which of these ideas resonates with you?');
  assert.equal(scrubForPrompt('Great start! What do you think?'), 'Great start! What do you think?');
  assert.ok(scrubForPrompt('Great start! The keeper could be the only one who remembers the wreck. What do you think?').length > 0);
});

// ── shapes ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────

test('SHAPES: enough variety, instructions about form only', () => {
  assert.ok(SHAPES.length >= 8);
  const ids = SHAPES.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length, 'unique ids');
  const KINDS = new Set(['conversation', 'readback', 'question', 'lookup', 'ideas']);
  for (const s of SHAPES) {
    assert.ok(typeof s.id === 'string' && s.id && typeof s.text === 'string');
    assert.ok(Array.isArray(s.kinds) && s.kinds.length > 0 && s.kinds.every((k) => KINDS.has(k)), s.id);
    assert.ok(splitSentencesLite(s.text).length <= 2, `${s.id}: one or two sentences`);
    assert.ok(!/["“”]/.test(s.text), `${s.id}: no quoted wording to copy`);
  }
  for (const k of KINDS) assert.ok(SHAPES.filter((s) => s.kinds.includes(k)).length >= 3, `at least three shapes for ${k}`);
  const noQuestion = SHAPES.filter((s) => /no (?:closing )?question/i.test(s.text));
  assert.ok(noQuestion.length >= 3, 'at least three forbid a closing question');
  const listy = SHAPES.filter((s) => /\blist\b/i.test(s.text));
  assert.ok(listy.length * 2 <= SHAPES.length, `at least half do not use a list (${listy.length} of ${SHAPES.length} do)`);
  const readback = SHAPES.filter((s) => s.kinds.includes('readback'));
  assert.ok(readback.length >= 3);
  for (const s of readback) assert.match(s.text, /first show you understood the whole text/i, `${s.id} shows understanding of the whole text first`);
});

test('SHAPES: none asks for story text, a rewrite or wording to copy (NIE never writes the writer\'s text)', () => {
  for (const s of SHAPES) {
    assert.ok(!/\b(?:write|writes|rewrite|draft|compose|rephrase|polish|edit|dialogue|scene text|prose)\b/i.test(s.text), s.id);
    assert.ok(!/\b(?:headline|title|tagline|opening line|first line)\b/i.test(s.text), `${s.id}: no ready-made line`);
  }
});

test('shapeFor: honours the kind, is deterministic, and never repeats either of the last two shapes in 30 turns', () => {
  for (const kind of ['conversation', 'question', 'lookup', 'ideas', 'readback']) {
    const history = [];
    const used = [];
    const pool = SHAPES.filter((s) => s.kinds.includes(kind));
    for (let turn = 0; turn < 30; turn++) {
      history.push(user(`message ${turn}`));
      const a = shapeFor({ history, kind, seed: `message ${turn}` });
      const b = shapeFor({ history: history.slice(), kind, seed: `message ${turn}` });
      assert.equal(a.id, b.id, 'deterministic');
      assert.ok(a.kinds.includes(kind), `${kind}: ${a.id} is a ${a.kinds}`);
      assert.ok(!used.slice(-2).includes(a.id), `${kind} turn ${turn}: ${a.id} repeats ${used.slice(-2)}`);
      used.push(a.id);
      history.push(nie(`reply ${turn}`, { shape: a.id }));
    }
    // A shape comes back only after every other shape of its kind has been used.
    assert.equal(new Set(used.slice(0, pool.length)).size, pool.length, `${kind}: first ${pool.length} are all different`);
    for (const s of pool) assert.ok(used.includes(s.id), `${kind}: ${s.id} is used`);
  }
});

test('shapeFor: mixed kinds, the seed changes the pick, odd input is safe', () => {
  const history = [user('a'), nie('b', { shape: 'one-thread' }), user('c'), nie('d', { shape: 'honest-take' })];
  const picks = new Set();
  for (let i = 0; i < 20; i++) picks.add(shapeFor({ history, kind: 'conversation', seed: `seed ${i}` }).id);
  assert.ok(picks.size > 1, 'different messages get different shapes');
  assert.ok(![...picks].some((id) => id === 'one-thread' || id === 'honest-take'));
  assert.ok(shapeFor({ history: [], kind: 'unknown-kind' }).kinds.includes('conversation'));
  assert.ok(shapeFor().id);
  assert.ok(shapeFor(null).id);
  assert.ok(shapeFor({ history: 'nope', kind: 'ideas', seed: 5 }).kinds.includes('ideas'));
  // a declined note in between does not hide the shapes before it
  const withNote = [...history, nie('I do not write for you.', { declined: true })];
  assert.ok(!['one-thread', 'honest-take'].includes(shapeFor({ history: withNote, kind: 'conversation', seed: 'x' }).id));
});

// ── refine ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────

test('refine: REPLY_A with no history loses the praise and the stock question, nothing else', () => {
  const r = refine(REPLY_A, { history: [] });
  assert.deepEqual(r.dropped.map((d) => d.kind), ['praise', 'stock-question']);
  assert.equal(r.dropped[0].text, 'Great focus!');
  assert.equal(r.dropped[1].text, STOCK_A);
  const expected = REPLY_A.replace('Great focus! ', '').replace(`${STOCK_A}\n\n`, '');
  assert.equal(r.text, expected);
  assert.equal(r.retry, false, r.reasons.join('; '));
  assert.ok(r.text.includes('1. What if the horror') && r.text.includes('3. How about a scenario'));
  assert.ok(r.text.endsWith('further fuels the horror?'));
});

test('refine: REPLY_B after REPLY_A loses the praise and the same stock steering, and keeps the specific final question', () => {
  const history = [user('a fog story'), nie(REPLY_A)];
  const r = refine(REPLY_B, { history });
  assert.deepEqual(r.dropped.map((d) => d.kind), ['praise', 'stock-question']);
  assert.equal(r.dropped[1].text, STOCK_B);
  assert.ok(!r.text.includes('Great focus'));
  assert.ok(!r.text.includes('Which of these directions'));
  assert.ok(r.text.startsWith("Let's dive deeper into that idea:"));
  assert.ok(r.text.includes('1. How might the fog'), 'the numbered ideas are untouched');
  assert.ok(r.text.includes('2. What if the fog'));
  assert.ok(r.text.endsWith('might undergo over time?'), 'the specific final question stays');
  assert.equal(r.retry, false, r.reasons.join('; '));
  assert.equal(r.text, REPLY_B.replace(/^Great focus on[^!]*! /, '').replace(`${STOCK_B}\n\n`, ''));
});

test('refine: does not change what it is given or the history', () => {
  const history = [user('x'), nie(REPLY_A, { shape: 'three-sparks' })];
  const before = JSON.stringify(history);
  refine(REPLY_B, { history });
  assert.equal(JSON.stringify(history), before);
});

test('refine: six specific, varied replies are left byte-identical', () => {
  const all = Object.values(GOOD);
  for (const r of all) assert.ok(wc(r) >= 40 && wc(r) <= 90, `${wc(r)} words`);
  for (const [name, reply] of Object.entries(GOOD)) {
    for (const history of [[], all.filter((x) => x !== reply).flatMap((x) => [user('q'), nie(x)])]) {
      const r = refine(reply, { history });
      assert.equal(r.text, reply, name);
      assert.deepEqual(r.dropped, [], name);
      assert.equal(r.retry, false, `${name}: ${r.reasons.join('; ')}`);
      assert.deepEqual(r.reasons, [], name);
    }
  }
});

test('refine: a repeated question that ends the reply or stands alone is removed; a new one is not', () => {
  const asked = 'Why does she stop winding the clock the night the boat is late?';
  const history = [user('q'), nie(GOOD.lighthouse)];
  const again = `The clock is the one fixed thing in her routine, so breaking it must mean the night is different from every other. That difference is the scene: everything the villagers expect from her is suspended while the boat is overdue.\n\nWhy does she stop winding the clock when the boat is late?`;
  const r = refine(again, { history });
  assert.deepEqual(r.dropped.map((d) => d.kind), ['repeat-question']);
  assert.ok(r.text.endsWith('while the boat is overdue.'));
  assert.ok(!r.text.includes('winding'));
  const fresh = again.replace(/Why does she stop[^?]*\?/, 'What does the harbor master see from the pier that she cannot?');
  assert.equal(refine(fresh, { history }).text, fresh, 'a different question stays');
  assert.ok(asked.length > 0);
  // the same question in the middle of a paragraph with other sentences is not touched (never reworded)
  const inside = `Think about this: why does she stop winding the clock when the boat is late? That is the scene the draft keeps circling, and it deserves its own page rather than a paragraph tucked in the middle.`;
  assert.equal(refine(inside, { history }).text, inside);
});

test('refine: a trailing stock question in the same paragraph goes, the rest of the paragraph stays', () => {
  const reply = 'The tension between her loyalty and her debt is the engine of the chapter, so let it surface in a small, practical choice. Which of these directions do you find most compelling?';
  const r = refine(reply, { history: [] });
  assert.equal(r.text, 'The tension between her loyalty and her debt is the engine of the chapter, so let it surface in a small, practical choice.');
  assert.deepEqual(r.dropped.map((d) => d.kind), ['stock-question']);
  // two closers in a row
  const two = 'The tension between her loyalty and her debt is the engine of the chapter, so let it surface in a small, practical choice. Let me know what you think. What do you think?';
  assert.equal(refine(two, { history: [] }).text, 'The tension between her loyalty and her debt is the engine of the chapter, so let it surface in a small, practical choice.');
});

test('refine: never removes from inside a list item, and never leaves fewer than 8 words', () => {
  const inList = 'Some directions to weigh:\n\n1. The keeper hides the logbook. Which of these ideas resonates with you?\n2. The village learns the truth early on in the story.';
  assert.equal(refine(inList, { history: [] }).text, inList);
  const tiny = 'Great start! Which of these directions do you find most compelling?';
  const r = refine(tiny, { history: [] });
  assert.equal(r.text, 'Which of these directions do you find most compelling?', 'the praise goes (nine words remain); the question stays because nothing would be left');
  assert.deepEqual(r.dropped.map((d) => d.kind), ['praise']);
  assert.equal(r.retry, true, 'all that is left is a generic question');
  assert.match(r.reasons.join(' '), /generic question/);
  const stuck = 'Great start! Do you like it?';
  const s2 = refine(stuck, { history: [] });
  assert.equal(s2.text, stuck, 'nothing is removed when too little would be left');
  assert.equal(s2.retry, true, 'it still opens with praise');
  assert.match(s2.reasons.join(' '), /praise/);
  const short = 'Great start! Here is a thought with exactly nine words in it.';
  assert.equal(refine(short, { history: [] }).text, 'Here is a thought with exactly nine words in it.');
  const tooShort = 'Great start! Seven words are all that remain here.';
  assert.equal(refine(tooShort, { history: [] }).text, tooShort);
});

test('refine: a stock question as a paragraph between a list and the next paragraph goes, on its own line too', () => {
  const reply = "Here are two ways in:\n\n1. Start with the debt the buyer already knows about.\n2. Start with the night she stopped winding the clock.\nWhich of these directions feels right to you?\n\nThe second one gives the chapter a clock to run against, which the draft currently lacks.";
  const r = refine(reply, { history: [] });
  assert.ok(!r.text.includes('Which of these directions'));
  assert.ok(r.text.includes('2. Start with the night she stopped winding the clock.\n\nThe second one gives'), 'the blank line stays: the paragraph must not become part of item 2');
  assert.equal(r.text, reply.replace('Which of these directions feels right to you?\n\n', '').replace('clock.\n', 'clock.\n\n'));
});

test('refine: retry when the reply still opens with praise, repeats an opener, repeats the last reply, or asks too many questions', () => {
  // still praise: it carries real content, so it cannot be removed whole
  const praiseWithContent = "Great idea — the keeper could secretly be the ghost the village fears, and that changes every scene she appears in from here on.";
  const a = refine(praiseWithContent, { history: [] });
  assert.equal(a.text, praiseWithContent);
  assert.equal(a.retry, true);
  assert.match(a.reasons.join(' '), /praise/);

  // same opening as a recent reply
  const history = [user('x'), nie("Let's pull on that thread for a moment. The debt is the secret here, and the orchard is the lie that hides it from everyone.")];
  const b = refine("Let's pull on that thread for a moment. The harbor master is the only one who could see the lamp go out from where he stands.", { history });
  assert.equal(b.retry, true);
  assert.match(b.reasons.join(' '), /opening/);

  // the same words again
  const prev = GOOD.magic;
  const c = refine(`${GOOD.magic.replace('How do the guilds stop that from happening?', '')}`.trim(), { history: [user('x'), nie(prev)] });
  assert.equal(c.retry, true);
  assert.match(c.reasons.join(' '), /previous reply/);

  // too many questions outside a list
  const many = 'There are several threads here, and each needs its own answer before the chapter can close. Who rowed out that night? Why did the lamp go dark? What did the buyer hear? Where is the logbook now?';
  const d = refine(many, { history: [] });
  assert.equal(d.retry, true);
  assert.match(d.reasons.join(' '), /too many questions/);

  // questions inside list items are the ideas themselves and are not counted
  const list = 'Three sparks to try:\n\n1. What if the lamp never went out? Who would notice?\n2. Could the buyer be her brother? Why would he hide it?\n3. What if the clock is wrong on purpose? Who gains?';
  assert.equal(refine(list, { history: [] }).retry, false);
});

test('refine: odd input gives a safe, empty result', () => {
  for (const v of [null, undefined, 0, 42, {}, [], '', '   ', '!!!']) {
    const r = refine(v, { history: [] });
    assert.equal(typeof r.text, 'string');
    assert.deepEqual(r.dropped, []);
    assert.equal(r.retry, false);
    assert.deepEqual(r.reasons, []);
  }
  assert.equal(refine('A plain sentence about a keeper.', null).text, 'A plain sentence about a keeper.');
  assert.equal(refine('A plain sentence about a keeper.', { history: 'x' }).text, 'A plain sentence about a keeper.');
});

// ── every export copes with anything, quickly ────────────────────────────────────────────────────────────────────────────────

test('every export survives empty, null, undefined, numbers and 50,000-character inputs in under 100 ms', () => {
  const big = [
    'x'.repeat(50000),
    'word '.repeat(10000),
    'This is a sentence about a lighthouse. '.repeat(1300),
    'Is it? '.repeat(7000),
    Array.from({ length: 4000 }, (_, i) => `Is it ${i}?`).join(' '),
    '?'.repeat(49999) + 'a',
    '.'.repeat(49999) + 'a',
    '*'.repeat(49999) + 'a',
    ' '.repeat(49999) + 'a',
    'Great! '.repeat(7000),
    '1. Item one? Yes.\n'.repeat(3000),
    'Which of these ideas resonates with you?\n\n'.repeat(1200),
    `${'Great focus on the fog and the lamp '.repeat(1400)}!`,
    `Great ${'idea '.repeat(10000)}!`,
    'a. '.repeat(16000),
  ];
  const small = ['', '   ', null, undefined, 0, 42, NaN, {}, [], true, [1, 2], 'Great!', '?'];
  const histories = [undefined, null, 'nope', [], [null, 3, 'x', { role: 'assistant' }, { role: 'assistant', content: 7 }], [user('a'), nie(big[3]), nie(big[11]), nie(big[0])]];
  const slow = [];
  const time = (label, fn) => {
    const t0 = performance.now();
    const out = fn();
    const ms = performance.now() - t0;
    if (ms > 100) slow.push(`${label}: ${ms.toFixed(0)} ms`);
    return out;
  };
  for (const v of [...small, ...big]) {
    const tag = typeof v === 'string' ? `${JSON.stringify(v.slice(0, 18))}(${v.length})` : String(v);
    assert.ok(Array.isArray(time(`splitSentencesLite ${tag}`, () => splitSentencesLite(v))));
    assert.ok(Array.isArray(time(`questionsIn ${tag}`, () => questionsIn(v))));
    assert.equal(typeof time(`isPraiseOpener ${tag}`, () => isPraiseOpener(v)), 'boolean');
    assert.equal(typeof time(`isStockQuestion ${tag}`, () => isStockQuestion(v)), 'boolean');
    assert.equal(typeof time(`scrubForPrompt ${tag}`, () => scrubForPrompt(v)), 'string');
    const sim = time(`similarity ${tag}`, () => similarity(v, typeof v === 'string' ? v.slice(5) + 'zzz' : 'a keeper'));
    assert.ok(sim >= 0 && sim <= 1);
    for (const h of histories) {
      const r = time(`refine ${tag}`, () => refine(v, { history: h }));
      assert.equal(typeof r.text, 'string');
      assert.ok(Array.isArray(r.dropped) && Array.isArray(r.reasons) && typeof r.retry === 'boolean');
    }
  }
  for (const h of [...histories, ...small, ...big.map((b) => [user('q'), nie(b)])]) {
    assert.ok(Array.isArray(time('recentAssistant', () => recentAssistant(h))));
    const m = time('memoryOf', () => memoryOf(h));
    assert.ok(Array.isArray(m.openers) && Array.isArray(m.questions) && Array.isArray(m.shapes));
    const block = time('avoidBlock', () => avoidBlock(h));
    assert.equal(typeof block, 'string');
    assert.ok(estimateTokens(block) <= 120);
    assert.ok(typeof time('shapeFor', () => shapeFor({ history: h, kind: 'conversation', seed: 'x' })).id === 'string');
  }
  for (const a of [...small, ...big]) for (const b of [...small.slice(0, 4), big[1]]) assert.ok(time('similarity pair', () => similarity(a, b)) <= 1);
  assert.deepEqual(slow, []);
});

// ── adversarial review: false positives, paraphrases, dangling cuts ──────────────────────────────────────────────────────────

/** Nineteen more specific replies, several opening on the words a praise rule is tempted by. refine must not touch any of them. */
const MORE_GOOD = [
  'Good point of view choices make the narrator trustworthy, and yours already commits: the whole draft stays inside the keeper. The risk is the single paragraph in chapter four that dips into the buyer. Cut the dip or earn it with a signal earlier.',
  'Great opening lines tend to promise a question the book then refuses to answer, and yours does that well in the first paragraph. The second paragraph answers it too soon. Hold the answer back one scene and the chapter gains its tension.',
  'Good way to handle exposition is to hide it inside a conflict, as your second chapter already does with the argument over the ledger. The third chapter drops back to explaining, which is why it sags. What does the buyer want from that scene?',
  'Perfect pitch is the problem for a narrator who hears every lie, because then the reader never gets to doubt anyone. Give her one blind spot, ideally about someone she loves, and the whole confession scene starts to carry weight.',
  "Interesting choice of tense in chapter one makes the reader lean in, and the shift to past in chapter six is the best structural move in the draft. Keep the shift. What does the narrator know in the past tense that she could not say in the present?",
  'How exciting the chase is depends on how much the reader fears the fall, so plant the height early. A single line about the drop in chapter two is enough. Then the rooftop scene needs no further description at all.',
  'Good evening, as the keeper might say to the inspector, is a loaded phrase in your draft because nobody else in the village speaks that way. It marks her as an outsider from the first scene. What do you think the keeper wants from the inspector in that scene?',
  'What do you think the keeper wants? The draft never says, and that is the strength of the first act. The weakness is that by act three the reader has stopped asking. Let one small want surface in chapter five, and the ending will land harder.',
  'Which of the two sisters does the keeper trust? Your draft hints at the younger one, but the older one holds the key. I would test the opposite: let the keeper trust the one she should not, and watch what the second half does with that.',
  'Thanks to the flood in chapter one, the whole valley is cut off, which is why the doctor cannot arrive. Keep that causal chain visible so the reader never wonders why nobody comes. What does the family do with the first day?',
  'Well, the ending works because the reader has been told twice that the door is never locked. When she finally locks it, nothing else needs to happen. That is the whole scene, and it is enough.',
  'Sure of herself in the first chapter, the captain is undone by one small fact: the map is hers, not the stolen one. That reversal is quiet and it works. Do you want the crew to learn it at the same time as she does?',
  "Absolutely nothing in the draft explains why the bridge is out, and that is a strength: the reader supplies a reason and trusts the town more for it. If you add a cause, add it late, and make it smaller than the reader's guess.",
  'Fantastic creatures in your world never eat, never sleep, and never lie, which makes them useful as witnesses and terrible as characters. Give each one a single appetite and the court scenes change completely. What would the heron want?',
  "That's a long way to row in the dark, and your second chapter knows it: the oars are muffled, the lamp is covered, and the narrator counts strokes. The counting is the best detail in the book. Carry it into the last scene.",
  'Exactly the problem with the middle: three scenes of waiting with no change in what anyone wants. Pick one character and give them a deadline. The waiting then has a clock, and the scenes stop sounding alike.',
  'Which idea would you hand to the keeper? Your draft gives her three, but only the debt costs her anything. Cut the other two or make them cost something, because ideas that are free do not read as choices.',
  "Who is the keeper? That is the question the reader asks on page one, and the draft answers it with a job title. Let one habit stand in for the biography. The clock winding is already doing that work, so trust it.",
  'Compelling villains want something the hero also wants. Yours wants the harbor, and so does she, which is why the final confrontation can be a negotiation. Write down what each would give up, and let the scene be about the price.',
];

/** Opens by saying what the model likes: it may be asked again (that is still praise), but its sentence is content and must never be cut. */
const LIKES = 'I like how the fog behaves in the second scene, because it arrives late and leaves early, like a guest. That timing is the character. Keep the fog off the page in the third scene and let the characters\' cold hands do the work.';

test('refine: a sentence that praises and then gives its reason is content, never cut', () => {
  const r = refine(LIKES, { history: [] });
  assert.equal(r.text, LIKES);
  assert.deepEqual(r.dropped, []);
  assert.equal(scrubForPrompt(LIKES), LIKES);
  const point = 'Good point about the ledger: it means the guild can audit every spell, which makes the mage who forgets the rule even more dangerous because nobody would notice until a spell fails in public.';
  assert.equal(refine(point, { history: [] }).text, point);
  assert.equal(scrubForPrompt(point), point);
});

test('refine: nineteen more specific replies are untouched, including ones that open on praise-like words used as content', () => {
  for (const reply of MORE_GOOD) {
    assert.ok(wc(reply) >= 35 && wc(reply) <= 95, `${wc(reply)} words: ${reply.slice(0, 40)}`);
    for (const history of [[], [user('q'), nie(GOOD.heist), user('q'), nie(GOOD.poem)]]) {
      const r = refine(reply, { history });
      assert.equal(r.text, reply, reply.slice(0, 50));
      assert.deepEqual(r.dropped, [], reply.slice(0, 50));
      assert.equal(r.retry, false, `${reply.slice(0, 50)}: ${r.reasons.join('; ')}`);
    }
    assert.equal(scrubForPrompt(reply), reply);
  }
});

test('isPraiseOpener: a praise word that starts a content sentence is not praise (noun phrases, clauses, a reason after the comma)', () => {
  for (const s of [
    'Great opening lines tend to promise a question the book then refuses to answer.',
    'Good way to handle exposition is to hide it inside a conflict, as your second chapter already does.',
    'Good point of view choices make the narrator trustworthy.',
    'Interesting choice of tense in chapter one makes the reader lean in.',
    'Perfect pitch is the problem for a narrator who hears every lie.',
    'How exciting the chase is depends on how much the reader fears the fall.',
    'I like how the fog behaves in the second scene, because it arrives late and leaves early, like a guest.',
    'Your draft is strong on atmosphere but thin on motive, and the thin part is what the reader will notice.',
    'Your second stanza turns on the word salt.',
    'Sounds like the narrator is protecting someone.',
    "That's interesting because the keeper never speaks of the storm at all.",
    'Sure of herself in the first chapter, the captain is undone by one small fact.',
    'Absolutely nothing in the draft explains why the bridge is out.',
  ]) {
    assert.equal(isPraiseOpener(s), false, s);
  }
});

test('isPraiseOpener: more ways of saying the same praise', () => {
  for (const s of [
    'Your premise is intriguing!',
    'Your fog is a wonderful touch.',
    'Sounds great!',
    'Sounds like a great idea!',
    'How exciting!',
    "That's interesting.",
    'This is fascinating!',
    'Great choice of words!',
    "Sure, let's explore this.",
  ]) {
    assert.equal(isPraiseOpener(s), true, s);
  }
});

test('splitSentencesLite: markdown emphasis closes with the sentence ("**Great focus!** Let\'s dig")', () => {
  assert.deepEqual(splitSentencesLite("**Great focus!** Let's dig into the fog."), ['**Great focus!**', "Let's dig into the fog."]);
  assert.deepEqual(splitSentencesLite('She said *no.* Then she left. _Why?_ Nobody knew.'), ['She said *no.*', 'Then she left.', '_Why?_', 'Nobody knew.']);
  const r = refine("**Great focus!** Let's dig into the fog and its effect on the crew's sense of time, because that is where the draft is strongest.", { history: [] });
  assert.equal(r.text, "Let's dig into the fog and its effect on the crew's sense of time, because that is where the draft is strongest.", 'only the praise goes, never the content after it');
  assert.deepEqual(r.dropped.map((d) => d.kind), ['praise']);
});

test('isStockQuestion: paraphrases of the same steering question', () => {
  for (const s of [
    'Do any of these directions interest you?',
    'Do any of these ideas grab you?',
    'Does one of these stand out?',
    'Do you have a favorite among these?',
    'Do you have a preference?',
    'Are any of these what you were looking for?',
    'How does this sit with you?',
    'What do you make of these directions?',
    'What is your reaction?',
    'What do you think of this direction?',
    'What do you think about these possibilities?',
    'Thoughts?',
    'Any thoughts?',
    'Would you like help developing any of them?',
    'Would you like more ideas?',
    'Do you want more ideas?',
    'Which of these grabs you?',
    'Which of these fits your story best?',
    'Which one fits your vision?',
    'Which idea do you like best?',
    'Which idea would you like to develop first?',
    'Which one catches your attention?',
    'Is there a direction you prefer?',
    'Are there any other directions you would like to explore?',
    'Do you have another direction in mind?',
    'Do you have something else in mind?',
    'Do these ideas feel right for your story?',
    'Does this feel like the right direction?',
    'Does this align with your vision?',
    'Do these ideas match your vision?',
    'Do you think any of these would work for your story?',
    'Do you think this is a good direction?',
    'How would you like to proceed?',
    'What should we explore next?',
    "What's next?",
    'Where shall we go from here?',
    'Want to explore one of these?',
    'Any of these catch your eye?',
    'What stands out to you most?',
    'What feels right to you?',
  ]) {
    assert.equal(isStockQuestion(s), true, s);
  }
});

test('isStockQuestion: a single word about the story makes a question specific, however generic the rest sounds', () => {
  for (const s of [
    'What would change your mind?',
    'Which idea would you hand to the keeper?',
    'Which version of the ending do you prefer?',
    'Do you want the keeper to know about the debt?',
    'Do you want them to know?',
    'Do you want this to continue past the funeral?',
    'What does she want from this?',
    'What does he want from them?',
    'Do you think she knew?',
    'Do you think the keeper lied?',
    'Is the ending too quiet?',
    'Does the ending work without the letter?',
    'Do these two scenes need to be in this order?',
    'Which of these chapters is the longest?',
    'How much of this is backstory?',
    'What do you think the fog is hiding?',
    'What do you think the keeper wants?',
    'Is the story told in the first person?',
    'Which draft do you like better?',
    'What does the reader learn next?',
    'What do you want the reader to feel at the end?',
    'Is that true of the keeper too?',
    'Who is the story about?',
    'Which of these 3 chapters is weakest?',
    'Want to talk through how it might apply to your project?',
  ]) {
    assert.equal(isStockQuestion(s), false, s);
  }
});

test('refine: a cut never leaves a reply that stops mid-thought', () => {
  // ends on a colon: the question cannot go (it would leave "Here are some thoughts ...:" with nothing after it), so it asks again instead
  const intro = 'Here are some thoughts on the harbor scene and the lamp:\n\nWhich of these ideas resonates with you?';
  const a = refine(intro, { history: [] });
  assert.equal(a.text, intro);
  assert.equal(a.retry, true);
  assert.match(a.reasons.join(' '), /generic question/);
  // praise followed by a sentence that leans on it: both stay, and it asks again
  for (const lean of [
    'Great idea! It works because the reader learns the rule before the keeper breaks it, which makes the break feel earned.',
    "Great idea! And the keeper's habit of winding the clock backwards gives the third chapter the pressure it needs to carry.",
    'Great idea! Because the clock is wrong on purpose, every scene in the second act has a second meaning for the reader.',
  ]) {
    const r = refine(lean, { history: [] });
    assert.equal(r.text, lean);
    assert.deepEqual(r.dropped, []);
    assert.equal(r.retry, true);
    assert.match(r.reasons.join(' '), /praise/);
  }
  // but a normal sentence after the praise is fine to open on
  assert.equal(refine('Great idea! The keeper could secretly be the ghost the village fears, and that changes every scene she appears in.', { history: [] }).text, 'The keeper could secretly be the ghost the village fears, and that changes every scene she appears in.');
  // a stock question first, then a sentence that leans on it
  const lead = 'Which of these ideas resonates with you?\n\nIt works because the reader learns the rule before the keeper breaks it, which makes the break feel earned.';
  assert.equal(refine(lead, { history: [] }).text, lead);
});

test('refine: a question about the same person is not a repeat of an earlier one; the same question reworded is', () => {
  const asked = (q) => [user('x'), nie(`The keeper winds the clock every night, and the habit is the only fixed point in a draft that otherwise drifts.\n\n${q}`)];
  const next = (q) => `The villagers fill the silence with stories about her, and the draft lets those stories stand in for facts about her past.\n\n${q}`;
  for (const [before, after] of [
    ['Who is the keeper?', 'Why is the keeper afraid?'],
    ['What does she want?', 'What does she want from the buyer?'],
    ['Why does the keeper hide the logbook?', 'Who else has seen the logbook?'],
  ]) {
    const r = refine(next(after), { history: asked(before) });
    assert.equal(r.text, next(after), `${before} / ${after}`);
    assert.deepEqual(r.dropped, []);
  }
  const same = refine(next("What's her name?"), { history: asked('What is her name?') });
  assert.deepEqual(same.dropped.map((d) => d.kind), ['repeat-question'], 'one term each, the same term: a repeat');
  const reworded = refine(next('Why does the keeper stop winding the clock?'), { history: asked('What makes the keeper stop winding the clock?') });
  assert.deepEqual(reworded.dropped.map((d) => d.kind), ['repeat-question']);
});

test('fixed notes as the orchestrator stores them (route "builtin", no declined flag) are not NIE\'s recent replies', () => {
  const decline = nie("I don't write or continue the story for you; that part is yours. I can help you think, though: tell me the idea.", { route: 'builtin', at: 1 });
  const model = nie(GOOD.heist, { route: 'local', shape: 'one-thread' });
  const history = [user('write me a scene'), decline, user('ok'), model];
  assert.deepEqual(recentAssistant(history), [GOOD.heist]);
  assert.deepEqual(memoryOf(history).openers.length, 1);
  assert.equal(avoidBlock([user('write me a scene'), decline]), '', 'a decline is not an opening to avoid');
  assert.ok(!avoidBlock(history).includes("I don't write"));
  // a reply that opens like the decline is not flagged as repeating it
  assert.equal(refine("I don't write or continue the story for you; that part is yours, but I can tell you what the second act is missing.", { history: [user('x'), decline] }).retry, false);
});

test('refine: output is only ever the input with whole sentences removed (seeded fuzz of 600 assembled replies)', () => {
  let seed = 20240607;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const praise = ['Great focus!', 'Great start!', '**Great focus!**', "Great focus on the fog's psychological impact and the state of the crew!", "That's a fascinating premise!", 'What a striking image!', 'Thanks for sharing!', 'Interesting premise.', 'Love the setup!', 'Good point.', 'Wow!', 'Sounds great!', 'Your premise is intriguing!', 'Absolutely!'];
  const content = [
    "The keeper's habit of winding the clock backwards reads as a private ritual.",
    'If the village notices, her isolation becomes a story other people tell about her.',
    "Let's dive deeper into that idea:",
    'Here are a few directions to consider:',
    'That gives the third chapter a pressure it currently lacks, because every visit risks exposing the ritual.',
    'It works because the reader learns the rule before the keeper breaks it.',
    'And the safecracker never learns who sold the plan.',
    'The debt is the secret here, and the orchard is the lie that hides it from everyone.',
    'A second reading of the letter changes who the narrator is protecting.',
  ];
  const stock = [STOCK_A, STOCK_B, 'What do you think?', 'Would you like to explore any of these further?', 'Let me know what you think.', 'Do any of these ideas appeal to you?'];
  const specific = ['Why does she stop winding the clock the night the boat is late?', 'What does the harbor master see from the pier that she cannot?', 'Who rowed out to the lighthouse the night the lamp went dark?'];
  const items = ['1. What if the horror is not external, but internal?', '2. Could the lamp be a signal to someone offshore?', '3. The keeper hides the logbook. Which of these ideas resonates with you?'];
  const open = /[:;,—–-]\s*$/;
  const history = [user('x'), nie(`Great focus! Let's dig deeper.\n\n${STOCK_A}\n\nWhy does she stop winding the clock the night the boat is late?`)];
  for (let t = 0; t < 600; t++) {
    const paras = [];
    for (let i = 0, n = 2 + Math.floor(rnd() * 5); i < n; i++) {
      const r = rnd();
      paras.push(r < 0.45 ? Array.from({ length: 1 + Math.floor(rnd() * 3) }, () => pick(content)).join(' ') : r < 0.65 ? pick(stock) : r < 0.8 ? pick(specific) : items.slice(0, 1 + Math.floor(rnd() * 3)).join('\n'));
    }
    const input = (rnd() < 0.7 ? pick(praise) + (rnd() < 0.5 ? ' ' : '\n\n') : '') + paras.join(rnd() < 0.8 ? '\n\n' : '\n');
    const r = refine(input, { history: t % 2 ? history : [] });
    const wi = words(input).map((w) => w.toLowerCase());
    const wo = words(r.text).map((w) => w.toLowerCase());
    let at = 0;
    for (const w of wo) {
      while (at < wi.length && wi[at] !== w) at++;
      assert.ok(at < wi.length, `a word was added or reworded: ${w}\n${input}\n=>\n${r.text}`);
      at++;
    }
    if (wi.length >= 8) assert.ok(wo.length >= 8, `fewer than 8 words left\n${input}\n=>\n${r.text}`);
    if (!open.test(input)) assert.ok(!open.test(r.text), `ends mid-thought\n${input}\n=>\n${r.text}`);
    const midThought = (t) => /^\p{Ll}/u.test(t.trimStart()) || /^(?:and|or|because|plus|it|they|she|he)\b/i.test(t.trimStart());
    if (!midThought(input)) assert.ok(!midThought(r.text), `starts mid-thought\n${input}\n=>\n${r.text}`);
    for (const line of input.split('\n').filter((l) => /^\d\. /.test(l))) assert.ok(r.text.includes(line), `a list item was touched: ${line}`);
    assert.ok(!/\n{3,}/.test(r.text) || /\n{3,}/.test(input), 'no extra blank lines');
    assert.ok(r.text.trim().length > 0);
  }
});

test('adversarial inputs for the vocabulary and cut rules stay fast', () => {
  const inputs = [
    'What do you think?\n\n'.repeat(2500),
    'Do you?\n\n'.repeat(5500),
    'Which of these ideas resonates with you? '.repeat(1200),
    'do you want any of these ideas to resonate '.repeat(1100) + '?',
    '**Great**! '.repeat(4500),
    `Great idea, because ${'because which but '.repeat(2500)}`,
    Array.from({ length: 2500 }, (_, i) => `Why does keeper${i} wind clock${i}?`).join('\n\n'),
  ];
  const six = [user('q'), ...Array.from({ length: 6 }, () => nie(inputs[6]))];
  let worst = 0;
  for (const v of inputs) {
    for (const h of [[], six]) {
      const t0 = performance.now();
      refine(v, { history: h });
      scrubForPrompt(v);
      isStockQuestion(v);
      isPraiseOpener(v);
      worst = Math.max(worst, performance.now() - t0);
    }
  }
  assert.ok(worst < 400, `${worst.toFixed(0)} ms for one refine + scrub on 50,000 characters`);
});
