import test from 'node:test';
import assert from 'node:assert/strict';
import { styleProfile, describeStyle, PROMPT_LINE_MAX_TOKENS } from '../apps/web/src/engine/reading/style.js';
import { estimateTokens } from '../apps/web/src/engine/util/text.js';
import { makeLongText } from './fixtures/long-text.mjs';

// Every sample is invented for this file. Nothing here is a writer's real text.

const MEMOIR = `I remember the kitchen in my grandmother's house better than I remember my own face. I was seven that summer, and I spent most mornings under the table with a book, listening to her hum while she worked. She woke before dawn every day. I never understood how she did it. My mother said she had never needed sleep, and I believed her, because I had never once seen her sit down. We ate at the long table by the window. I watched her hands, and I tried to copy the way she folded the dough, but mine always came out crooked. She laughed at me, gently, and she told me that my hands would learn in their own time. I did not believe her then. I believe her now.`;

const NARRATIVE = `Mara pushed the gate open and stepped into the yard. The rain had stopped, but the stones were slick, and she walked with her arms held out. "You're late," Tomas said from the porch. "I know," she answered. She set her bag down and looked at the house. Light moved behind the curtains. Tomas watched her, and he did not smile. "Did anyone follow you?" he asked. "No one," Mara said. She did not tell him about the car at the corner. He took her bag and led her inside, and neither of them spoke again until the door was locked.`;

const INSTRUCTIONS = `You open the box and lift out the lamp. You are holding a small brass lantern, and your hands feel warm. Press the switch once. The light comes on, and you hear a soft click. Turn the dial slowly until the glow steadies. You do not need to hurry. If you see the flame flicker, you wait a moment and you try again. Your eyes adjust to the dim room. Hold the lantern low and walk to the door. You are ready.`;

const WORLDBUILDING = `Year one, March. The Council of Harbors establishes the first tide registry, a ledger that records every vessel entering the strait. The registry is administered by the Office of Navigation, which answers to no single port. Its authority rests on the assumption that shared information reduces conflict between coastal communities. Year two, October. The registry expands to include cargo declarations, and the resulting data allows the Council to calculate tariffs with unprecedented accuracy. Critics argue that the system concentrates too much administrative power, but the Council maintains that transparency is the foundation of cooperation. Year three, June. The first salvage regulation takes effect. It defines ownership of abandoned vessels according to the depth of the wreck and the duration of abandonment, and it creates a tribunal to resolve disputes between claimants. Year four, February. The tribunal is overwhelmed by applications, because the regulation does not distinguish between genuine abandonment and temporary mooring. Year five, August. A revision introduces a mandatory waiting period, and the Council publishes the first annual assessment of maritime commerce, which shows that the registry now covers most of the strait.`;

const LYRICAL = `The sea breathes silver under a pale moon, and the wind folds its quiet wings over the salt dark. Light spills like milk across the tide. Light spills like ash across the stones. Light spills like a whispered name across the empty harbour, and the night hums like a held breath, and the stars hang as if they had been dropped by sleeping hands.`;

// a screenplay: speech sits under the speaker's name, not between quotation marks
const SCRIPT = `INT. HARBOUR PUB - NIGHT

A low room, thick with smoke. MARA (30s, wet coat) pushes through the door and scans the faces.

TOMAS
You're late.

MARA
There was a car at the corner.

TOMAS
There's always a car at the corner.

MARA
Not like this one.

Tomas puts down his glass. He looks past her at the window.

TOMAS
Did you see the plate?

MARA
Would I be standing here if I had?

A beat. The BARMAN wipes the same spot on the counter.

BARMAN
Last orders in ten.

TOMAS
We won't need ten.

He stands, drops a note on the table, and takes her arm.

EXT. QUAY - CONTINUOUS

Rain. The lamps hum. A black saloon idles at the far end, its lights off.

MARA
That's it.

TOMAS
Walk slowly.

MARA
I am walking slowly.

TOMAS
Walk slower.

They move along the edge of the water. The saloon's door opens. A MAN steps out, holding something long and wrapped in cloth.`;

// a first-person diary that talks mostly about other people: more "he" than "I", but still a diary
const DIARY = `March 3. Rain again. I stayed in and mended the net, and Pa said nothing about it, which is his way of saying well done.

March 4. The boats did not go out. Ilse came by with a loaf and we ate it standing in the doorway, watching the water climb the steps.

March 7. A letter from Henrik. He is well, he says, and the ship is clean, and the food is bad. He asks after the dog. I will write back tomorrow.

March 9. Pa is ill. He says it is nothing. I do not believe him, and neither does Ilse, and neither does the dog.

March 12. The doctor came. Rest, he says, and broth, and no work. Pa laughed in his face.`;

// not English: every English word list in the module would read it wrongly ("he" is Spanish for "I have")
const SPANISH = `Ayer fui al mercado con mi madre y compramos tomates, pan y un poco de queso. El vendedor nos saludó con una sonrisa y nos contó que el verano había sido muy seco. Mi madre le dijo que en su pueblo pasaba lo mismo todos los años, y estuvieron hablando durante casi media hora. Yo me quedé mirando las frutas, los colores, las manos de la gente que pasaba con sus bolsas. Cuando volvimos a casa el sol ya estaba muy alto y hacía mucho calor. He visto que el pueblo ha cambiado mucho. Él me dijo que ya no quedan tiendas. He pensado en volver. Me parece que he perdido algo. Me dicen que he cambiado. Yo he vuelto a casa, he comido y he dormido.`;

const profileOf = (text) => styleProfile(text);

// ── labels on small hand-written samples ─────────────────────────────────────

test('first-person memoir: first person, past tense, narrative', () => {
  const p = profileOf(MEMOIR);
  assert.equal(p.pov.label, 'first person');
  assert.ok(p.pov.first > 0.5, `first-person share ${p.pov.first}`);
  assert.equal(p.tense.label, 'past');
  assert.ok(p.tense.past > 0.8, `past share ${p.tense.past}`);
  assert.equal(p.register.label, 'narrative');
  assert.equal(p.dialogue.lines, 0);
  assert.equal(p.dialogue.share, 0);
  assert.deepEqual(p.structure, ['no headings']);
});

test('third-person past narrative with dialogue', () => {
  const p = profileOf(NARRATIVE);
  assert.equal(p.pov.label, 'third person');
  assert.ok(p.pov.third > 0.9, `third-person share ${p.pov.third}`);
  assert.equal(p.tense.label, 'past');
  assert.equal(p.register.label, 'narrative');
  assert.equal(p.dialogue.lines, 4);
  assert.ok(p.dialogue.share > 0.08 && p.dialogue.share < 0.2, `dialogue share ${p.dialogue.share}`);
});

test('present-tense second-person instructions', () => {
  const p = profileOf(INSTRUCTIONS);
  assert.equal(p.pov.label, 'second person');
  assert.ok(p.pov.second > 0.9);
  assert.equal(p.tense.label, 'present');
  assert.ok(p.tense.present > 0.9, `present share ${p.tense.present}`);
  assert.equal(p.dialogue.lines, 0);
});

test('dense expository worldbuilding with time stamps', () => {
  const p = profileOf(WORLDBUILDING);
  assert.equal(p.tense.label, 'present');
  assert.equal(p.register.label, 'expository');
  assert.ok(p.register.abstractShare > 0.03, `abstract ${p.register.abstractShare}`);
  assert.ok(p.sentence.mean > 15, `sentence mean ${p.sentence.mean}`);
  assert.ok(p.structure.some((s) => s.startsWith('time stamps (') && s.includes('Year one, March')), JSON.stringify(p.structure));
  assert.ok(!p.structure.includes('no headings'));
  assert.equal(p.dialogue.lines, 0);
  // the time stamps are labels, not sentences: they must not drag the average down
  const stampsOnly = p.sentences;
  assert.ok(stampsOnly <= 17, `${stampsOnly} sentences`);
});

test('lyrical prose is told apart from plain narrative', () => {
  assert.equal(profileOf(LYRICAL).register.label, 'lyrical');
  assert.notEqual(profileOf(NARRATIVE).register.label, 'lyrical');
  assert.notEqual(profileOf(MEMOIR).register.label, 'lyrical');
});

test('text that is nothing but dialogue is conversational and has no person or tense to read', () => {
  const p = profileOf('"Come here." "No." "Please." "Fine, but only for a minute."');
  assert.equal(p.dialogue.lines, 4);
  assert.equal(p.dialogue.share, 1);
  assert.equal(p.register.label, 'conversational');
  assert.equal(p.pov.label, 'unclear');
  assert.equal(p.tense.label, 'unclear');
});

test('thin evidence gives unclear, never a guess', () => {
  const p = profileOf('She walked. He ran.');
  assert.equal(p.pov.label, 'unclear');
  assert.equal(p.tense.label, 'unclear');
  assert.equal(p.promptLine, '', 'too little text for a style line');
  const mixed = profileOf('I walked home. She walked home. They walked home. We walked home. He walked home. You walked home. I walked home. She walked home. They walked home. We walked home.');
  assert.equal(mixed.pov.label, 'mixed');
});

test('tense moves between past and present is called mixed', () => {
  const text = 'She walked to the door. He is waiting outside. She took the bag. They are late again. He watched her go. She is sure of it. They stood in the road. He is angry now. She knew it. He is afraid.';
  const p = profileOf(text);
  assert.equal(p.tense.label, 'mixed');
  assert.equal(p.tense.past, 0.5);
  assert.equal(p.tense.present, 0.5);
});

// ── dialogue ─────────────────────────────────────────────────────────────────

test('dialogue share is the share of words inside quotation marks', () => {
  const p = profileOf('He said, "Go home now, please." Then he left the room.');
  assert.equal(p.words, 11);
  assert.equal(p.dialogue.lines, 1);
  assert.equal(p.dialogue.share, Number((4 / 11).toFixed(3)));

  const q = profileOf('"Where were you?" she asked.\n"Out."\n"Out where?"\n"Just out."');
  assert.equal(q.dialogue.lines, 4);
  assert.equal(q.dialogue.share, 0.8);
});

test('curly quotes and apostrophes read the same as straight ones', () => {
  const straight = `"I don't know," Mara said. "We can't stay here," Tomas told her. She didn't answer. It wasn't her fault, and he knew it.`;
  const curly = straight.replace(/"([^"]*)"/g, '“$1”').replace(/'/g, '’');
  assert.deepEqual(profileOf(curly), profileOf(straight));
  assert.equal(profileOf(curly).dialogue.lines, 2);
});

test('single curly quotes (British style) are dialogue too, apostrophes are not quotes', () => {
  const p = profileOf('‘Where are you going?’ she asked. ‘Out,’ he said. ‘Out where?’ ‘Just out, and don’t ask me again.’ She watched him leave, and she didn’t follow him. It wasn’t her place, and she knew the dogs’ bowls were empty.');
  assert.equal(p.dialogue.lines, 4);
  const spoken = 4 + 1 + 2 + 7;
  assert.equal(p.dialogue.share, Number((spoken / p.words).toFixed(3)));
  assert.equal(p.pov.third, 1);
  // only apostrophes: no quotations at all
  assert.equal(profileOf('It wasn’t her place, and she didn’t follow him. The dogs’ bowls were empty, and Mara’s coat hung by the door as it always did.').dialogue.lines, 0);
});

test('scare quotes and titles are not dialogue', () => {
  const p = profileOf('The street calls them "zombies" and the book is called "Winter Light" in most libraries, but the doctors say "the locked" in private. Nobody argues about it any more at all.');
  assert.equal(p.dialogue.lines, 0, 'one- to three-word quotations without speech punctuation are not lines of speech');
});

test('a stray quotation mark cannot swallow the narration', () => {
  const body = 'She walked on past the old mill and the long wall and the church. '.repeat(60);
  const p = profileOf(`She said "hello. ${body} And then, much later, she said "goodbye. ${body}`);
  assert.ok(p.dialogue.share < 0.5, `share ${p.dialogue.share}`);
  assert.equal(p.pov.label, 'third person');
});

// ── Windows line endings, odd shapes ──────────────────────────────────────────

test('Windows line endings give exactly the same profile', () => {
  const unix = `Chapter 1\n\n${NARRATIVE}\n\nChapter 2\n\n${MEMOIR}\n\nChapter 3\n\n${INSTRUCTIONS}\n`;
  assert.deepEqual(profileOf(unix.replace(/\n/g, '\r\n')), profileOf(unix));
  assert.deepEqual(profileOf(String.fromCharCode(0xfeff) + unix), profileOf(unix), 'a byte-order mark is ignored');
});

test('chapter headings, numbered parts and scene breaks are found, and headings are not sentences', () => {
  const chapters = `Chapter 1\n\n${NARRATIVE}\n\nChapter 2\n\n${NARRATIVE}\n\nChapter 3\n\n${NARRATIVE}`;
  const p = profileOf(chapters);
  assert.ok(p.structure.includes('chapter headings'), JSON.stringify(p.structure));
  assert.equal(p.paragraphs, 3, 'headings are not paragraphs of prose');
  assert.equal(profileOf(NARRATIVE).sentences, p.sentences / 3, 'headings add no sentences');

  const parts = `Part I\n\n${MEMOIR}\n\nPart II\n\n${MEMOIR}\n\nPart III\n\n${MEMOIR}`;
  assert.ok(profileOf(parts).structure.includes('numbered parts'));
  const breaks = `${NARRATIVE}\n\n* * *\n\n${NARRATIVE}\n\n* * *\n\n${NARRATIVE}`;
  assert.ok(profileOf(breaks).structure.includes('scene breaks'));
  assert.equal(profileOf(`# One\n\n${MEMOIR}\n\n## Two\n\n${MEMOIR}`).structure[0], 'headings marked with #');
});

test('"Part I" is a heading, not the narrator', () => {
  const text = `Part I\n\n${NARRATIVE}\n\nPart I\n\n${NARRATIVE}\n\nBook I\n\n${NARRATIVE}`;
  assert.equal(profileOf(text).pov.label, 'third person');
  assert.ok(profileOf(text).pov.first < 0.05);
});

test('one huge paragraph is one paragraph', () => {
  const p = profileOf('The tide came in and the boats rose with it. '.repeat(300));
  assert.equal(p.paragraphs, 1);
  assert.equal(p.paragraph.meanWords, p.words);
  assert.ok(p.structure.some((s) => s.startsWith('one unbroken block')));
  assert.ok(!describeStyle(p).includes('average 3'), 'a single paragraph is described as one, not averaged');
  assert.match(describeStyle(p), /single paragraph/);
});

test('time stamps are short labels; a sentence that merely starts with "Year" is not one', () => {
  const stamps = (text) => profileOf(text).structure.some((x) => x.startsWith('time stamps'));
  const body = 'Nothing much happened in the valley that season, and the people there went about their work as they always had done. ';
  assert.equal(stamps(`Day 1. ${body}Day 2. ${body}Day 3. ${body}Day 4. ${body}`), true);
  assert.equal(stamps(`Year minus nine. ${body}Year zero. ${body}Year two and a half to six. ${body}`), true);
  assert.equal(stamps(`March 3, 1987.\n\n${body}\n\nMarch 9, 1987.\n\n${body}\n\n4 April 1987\n\n${body}`), true);
  assert.equal(stamps(`Year four was the worst. ${body}Day one began badly. ${body}Week two went by. ${body}Year five came and went. ${body}`), false);
  assert.equal(stamps(`Day 1. ${body}`), false, 'one label is not a structure');
  const p = profileOf(`Day 1. ${body}Day 2. ${body}Day 3. ${body}`);
  assert.equal(p.sentences, 3, 'the labels are not counted as sentences');
});

test('lines with no blank lines between them are read line by line', () => {
  const lines = Array.from({ length: 6 }, (_, i) => `Line ${i + 1} of the story goes on for a little while, as lines do.`).join('\n');
  assert.equal(profileOf(lines).paragraphs, 6);
});

test('text without punctuation does not break anything', () => {
  const text = 'she walked down the road and she saw the river and she stopped by the old stone bridge and she waited for him '.repeat(40);
  const p = profileOf(text);
  assert.equal(p.sentences, 1);
  assert.equal(p.sentence.longest, p.words);
  assert.equal(p.pov.label, 'third person');
  assert.equal(p.tense.label, 'past');
  assertSane(p);
});

test('ALL CAPS text: no names are invented from capitals, and the cues still work', () => {
  const caps = NARRATIVE.toUpperCase();
  const p = profileOf(caps);
  assert.deepEqual(p.signature, []);
  assert.equal(p.pov.label, 'third person');
  assert.equal(p.tense.label, 'past');
  assert.equal(p.register.label, 'narrative');
  assert.equal(p.dialogue.lines, 4);
  assertSane(p);
  // "I" stays the narrator, "US" does not become "us"
  assert.equal(profileOf(MEMOIR.toUpperCase()).pov.label, 'first person');
  assert.notEqual(profileOf('The US Navy and the US Senate met in the US capital, and the US press covered the US plan at length. '.repeat(3)).pov.label, 'first person');
});

test('junk input never throws and gives an empty profile', () => {
  for (const junk of [null, undefined, 42, NaN, {}, [], true, () => 1, '', '   ', '\n\n\n', '...!!!???', '"', '""', '"""', '* * *']) {
    const p = styleProfile(junk);
    assert.equal(p.words, 0, `words for ${String(junk)}`);
    assert.equal(p.promptLine, '');
    assert.deepEqual(p.signature, []);
    assert.equal(p.pov.label, 'unclear');
    assert.equal(p.tense.label, 'unclear');
    assertSane(p);
    assert.equal(typeof describeStyle(p), 'string');
  }
  assert.equal(typeof describeStyle(null), 'string');
  assert.equal(typeof describeStyle(undefined), 'string');
  assert.equal(typeof describeStyle({}), 'string');
  assert.match(describeStyle(styleProfile('')), /not enough text/i);
});

test('odd characters and very long tokens are fine', () => {
  for (const odd of ['\u0000\u0001\u0002', '😀'.repeat(500), 'x'.repeat(100000), 'ñandú ' + 'Ünï Çödé '.repeat(200), '12345 67890 '.repeat(500), "'''---'''".repeat(300)]) {
    const t0 = performance.now();
    const p = styleProfile(odd);
    assert.ok(performance.now() - t0 < 1500, 'finishes quickly');
    assertSane(p);
  }
});

// ── signature terms ───────────────────────────────────────────────────────────

test('signature picks recurring invented names and terms, never ordinary sentence openers', () => {
  const text = [
    'The harbour of Korvath Dunmere lay quiet. Then Zephra Quill came down the hill with a lamp. However, nobody spoke to Zephra.',
    'Suddenly the VORX signal woke the town. The old keeper Mirelle said nothing about it. Then she watched Zephra cross the square.',
    'The next morning Korvath Dunmere sent word to Mirelle. However, the VORX relay stayed dark. Suddenly everyone wanted to speak to Zephra.',
    'Then the keeper Mirelle climbed the tower. The lamp was lit by Zephra Quill, and the VORX relay hummed. However, Korvath Dunmere said no one should trust it.',
    'The night was long. Suddenly the signal stopped, and Mirelle counted the hours until Zephra returned. Then the whole town waited for the VORX to speak again.',
  ].join('\n\n');
  const sig = profileOf(text).signature;
  assert.ok(sig.length > 0 && sig.length <= 8, JSON.stringify(sig));
  for (const want of ['Zephra', 'Mirelle', 'VORX']) assert.ok(sig.some((s) => s === want || s.split(' ').includes(want)), `${want} in ${JSON.stringify(sig)}`);
  assert.ok(sig.includes('Korvath Dunmere'), `a recurring two-word name is one term: ${JSON.stringify(sig)}`);
  for (const bad of ['The', 'Then', 'However', 'Suddenly', 'Year', 'Chapter', 'She', 'It']) assert.ok(!sig.includes(bad), `${bad} must never be a signature term`);
  for (const s of sig) assert.ok(!/^(?:the|then|however|suddenly)$/i.test(s), s);
});

test('signature on a long invented text is names, within 8, never The', () => {
  const { text } = makeLongText({ words: 12000, seed: 11 });
  const sig = profileOf(text).signature;
  assert.ok(sig.length >= 4 && sig.length <= 8, JSON.stringify(sig));
  const names = ['Ilsa Quade', 'Tomas Verrick', 'Marit Oland', 'Dov Anselm', 'Brenna Hale', 'Corin Ashby', 'Odalys Venn', 'Pell Hargrove', 'Wren Calloway', 'Fenn Marlowe'];
  const hits = sig.filter((s) => names.includes(s));
  assert.ok(hits.length >= 4, `names found: ${JSON.stringify(sig)}`);
  for (const s of sig) {
    assert.ok(!/^(?:the|there|they|chapter|by|it|nobody|leave|then)\b/i.test(s), `ordinary word in signature: ${s}`);
  }
});

test('a word capitalised only because it starts sentences is not a term', () => {
  const text = 'Silence fell. Silence held. Silence stayed for hours. Silence broke at last. Nothing moved. Nothing changed. Nothing came. '.repeat(8);
  assert.deepEqual(profileOf(text).signature, []);
});

test('a term that appears in one corner of a long text only is not "recurring"', () => {
  const filler = 'The road ran on between the fields and the river and nobody on it said a word. '.repeat(120);
  const cluster = 'Then Orrin Vale spoke to Orrin Vale about Orrin Vale and the plan. Orrin Vale nodded. ';
  const sig = profileOf(cluster + filler).signature;
  assert.ok(!sig.includes('Orrin Vale') && !sig.includes('Orrin'), JSON.stringify(sig));
  const spread = (cluster.slice(0, 40) + filler.slice(0, 2000)).repeat(6);
  assert.ok(profileOf(spread).signature.length >= 0);
});

test('lower-case coined phrases that recur are found, ordinary phrases are not', () => {
  const sentence = (i) =>
    [
      `The ember tide returned on the ${['first', 'second', 'third', 'fourth', 'fifth', 'sixth'][i]} night, and the people of the coast went inside again.`,
      'Nobody on the long road said anything about the weather, and the days went by one after another.',
    ].join(' ');
  const text = Array.from({ length: 6 }, (_, i) => sentence(i)).join('\n\n').repeat(2);
  const sig = profileOf(text).signature;
  assert.ok(sig.includes('ember tide'), JSON.stringify(sig));
  // verb phrases, function words and anything with a stopword in it are never coined terms
  assert.ok(!sig.some((s) => /returned|went|said|after another|the coast|of the/.test(s)), JSON.stringify(sig));
});

// ── the line for the model and the paragraph for the writer ──────────────────

test('promptLine is one compact line, measured not guessed, within the token budget', () => {
  const samples = [MEMOIR, NARRATIVE, INSTRUCTIONS, WORLDBUILDING, LYRICAL, SCRIPT, SPANISH, DIARY, makeLongText({ words: 9000 }).text, `Chapter 1\n\n${NARRATIVE}\n\nChapter 2\n\n${NARRATIVE}\n\nChapter 3\n\n${NARRATIVE}`];
  for (const text of samples) {
    const { promptLine } = profileOf(text);
    assert.ok(promptLine.startsWith('Style (measured from the text'), promptLine);
    assert.ok(!promptLine.includes('\n'));
    assert.ok(estimateTokens(promptLine) <= PROMPT_LINE_MAX_TOKENS, `${estimateTokens(promptLine)} tokens: ${promptLine}`);
    assert.ok(!/\b(?:great|good|excellent|beautiful|strong|weak|poor)\b/i.test(promptLine), 'a style line describes, it never judges');
  }
  assert.equal(PROMPT_LINE_MAX_TOKENS, 70);
  const memoir = profileOf(MEMOIR).promptLine;
  assert.match(memoir, /first person/);
  assert.match(memoir, /past tense/);
  assert.match(profileOf(INSTRUCTIONS).promptLine, /second person, present tense/);
  assert.match(profileOf(WORLDBUILDING).promptLine, /time stamps/);
  assert.match(profileOf(WORLDBUILDING).promptLine, /expository/);
});

test('promptLine keeps what matters when there is little room: voice first, terms get what is left', () => {
  const p = profileOf(`${WORLDBUILDING}\n\n${WORLDBUILDING}\n\n${WORLDBUILDING}`);
  assert.match(p.promptLine, /present tense/);
  assert.ok(estimateTokens(p.promptLine) <= 70);
  if (p.signature.length) assert.match(p.promptLine, /recurring terms: /);
});

test('describeStyle: 2-3 plain sentences that quote the numbers and say they are measured', () => {
  for (const text of [MEMOIR, NARRATIVE, INSTRUCTIONS, WORLDBUILDING, SCRIPT, SPANISH, DIARY, `Chapter 1\n\n${NARRATIVE}\n\nChapter 2\n\n${NARRATIVE}\n\nChapter 3\n\n${NARRATIVE}`]) {
    const p = profileOf(text);
    const d = describeStyle(p);
    const sentences = d.split(/(?<=[.!?])\s+(?=[A-Z])/);
    assert.ok(sentences.length >= 2 && sentences.length <= 3, `${sentences.length} sentences: ${d}`);
    assert.match(d, /counted from the text|measured from the text/i);
    assert.ok(d.includes(String(Math.round(p.sentence.mean))), 'the average sentence length is quoted');
    assert.ok(d.includes(`${Math.round(p.dialogue.share * 100)}%`) || /under 1%/.test(d) || (p.dialogue.lines === 0 && /No (?:quoted speech|speech in English-style quotation marks) was found/.test(d)), 'the dialogue share is quoted');
    assert.ok(!/\b(?:great|good|excellent|beautiful|brilliant|strong|weak|poor|bad|wonderful|well[- ]written|impressive|nice|compelling|engaging)\b/i.test(d), `no praise or judgment: ${d}`);
    assert.ok(/not a judgment of its quality/.test(d));
    assert.ok(!/undefined|NaN|\[object/.test(d), d);
  }
});

test('describeStyle copes with a partial or odd profile', () => {
  for (const odd of [{ words: 500 }, { words: 500, sentences: 2, pov: {}, tense: {}, register: {}, structure: null, signature: null }, { words: 'many' }, []]) {
    const d = describeStyle(odd);
    assert.equal(typeof d, 'string');
    assert.ok(!/undefined|NaN|\[object|null/.test(d), d);
  }
});

test('describeStyle says exactly what was found for a known sample', () => {
  const d = describeStyle(profileOf(MEMOIR));
  assert.match(d, /first person/);
  assert.match(d, /past tense/);
  assert.match(d, /\d+ words in \d+ sentences/);
  assert.match(d, /No quoted speech was found/);
  const w = describeStyle(profileOf(WORLDBUILDING));
  assert.match(w, /time stamps \("Year one, March"\)/);
  assert.match(w, /expository/);
});

// ── determinism and speed ─────────────────────────────────────────────────────

test('same input, same output: pure and deterministic', () => {
  const { text } = makeLongText({ words: 6000, seed: 3 });
  const a = profileOf(text);
  const b = profileOf(String(text));
  const c = profileOf(`${text}`.split('').join(''));
  assert.deepEqual(a, b);
  assert.deepEqual(a, c);
  assert.equal(JSON.stringify(a), JSON.stringify(b));
  assert.equal(describeStyle(a), describeStyle(b));
  // nothing is shared between calls
  profileOf(MEMOIR);
  assert.deepEqual(profileOf(text), a);
  const frozen = Object.freeze({ ...a });
  assert.doesNotThrow(() => describeStyle(frozen));
});

test('60,000 characters are profiled in well under half a second', () => {
  let text = makeLongText({ words: 11000, seed: 5 }).text;
  while (text.length < 60000) text += '\n\n' + text;
  text = text.slice(0, 60000);
  styleProfile(text); // warm up the JIT, as a running app would have
  const t0 = performance.now();
  const p = styleProfile(text);
  const ms = performance.now() - t0;
  assert.ok(ms < 400, `${ms.toFixed(0)} ms for ${text.length} characters`);
  assert.ok(p.words > 9000);
  assertSane(p);
});

test('a text of 60,000 characters in a single paragraph with no punctuation is also quick', () => {
  const text = 'the old woman walked down to the river and watched the water go by '.repeat(900).slice(0, 60000);
  const t0 = performance.now();
  const p = styleProfile(text);
  assert.ok(performance.now() - t0 < 400);
  assertSane(p);
});

// ── found by review: labels on real-looking prose ───────────────────────────

test('perfect tenses and passives in a present-tense text are not past-tense cues', () => {
  const text =
    'The council has made a decision. The tide has taken the boats. Mara has seen the ledger. It is built on sand. Records are kept in the tower. The gate is held by two guards. The harbour has grown quiet. Nobody has told the keeper. The lamps are lit at dusk. The road is cut by floods.';
  const p = profileOf(text);
  assert.equal(p.tense.label, 'present');
  assert.equal(p.tense.past, 0, '"made", "built", "kept", "held" and "told" follow an auxiliary that already carries the tense');
  // the same sentences in the past are still past
  const past = profileOf(text.replace(/\bhas\b/g, 'had').replace(/\b(?:is|are)\b/g, (m) => (m === 'is' ? 'was' : 'were')));
  assert.equal(past.tense.label, 'past');
  assert.equal(past.tense.present, 0);
});

test('a first-person diary that talks mostly about other people is "mixed", never confidently "third person"', () => {
  const p = profileOf(DIARY);
  assert.notEqual(p.pov.label, 'third person', JSON.stringify(p.pov));
  assert.equal(p.pov.label, 'mixed');
  assert.ok(p.pov.first >= 0.3 && p.pov.third >= 0.5, JSON.stringify(p.pov));
  // the description quotes the numbers a "mixed" rests on instead of just asserting it
  assert.match(describeStyle(p), /mixed point of view \(first person 33%, third person 67% of the pronouns counted\)/);
  // a real third-person story with a stray "my" in it is still third person
  assert.equal(profileOf(`${NARRATIVE} ${NARRATIVE} The note said: my regards to the keeper.`).pov.label, 'third person');
});

test('a speech that runs over several paragraphs is dialogue all the way down, so the narrator stays third person', () => {
  const text = `Old Henrik cleared his throat and began. "When I was a boy, the harbour was twice this size. We had forty boats, and every one of them had a name that meant something. You could stand on the quay at dawn and read the whole village by its hulls.

"Then the cannery closed. I remember the day. My father came home early and sat at the table without taking off his coat. He did not say a word for an hour. We understood, my mother and I, that something had ended.

"I tell you this because you think you are the first to lose a living. You are not. Nobody ever is." He looked at the girl. She watched his hands. He held them out as if they were something he had found. "Do you understand me?"

The girl nodded, though she did not. He saw it, and he smiled, and he let her go. She walked down the quay alone, and she thought about the boats. Her mother was waiting at the gate. She took her hand and said nothing.`;
  const p = profileOf(text);
  assert.equal(p.pov.label, 'third person', JSON.stringify(p.pov));
  assert.ok(p.pov.first === 0, 'the first two paragraphs of the speech are speech, not the narrator saying "I" and "my"');
  assert.ok(p.dialogue.share > 0.45, `dialogue share ${p.dialogue.share}`);
  // curly marks too, and a paragraph that merely ends without a close is not speech when the next one does not open with a mark
  assert.equal(profileOf(text.replace(/"/g, (m, i) => (text[i - 1] === ' ' || text[i - 1] === '\n' || i === 0 ? '“' : '”'))).pov.label, 'third person');
  const stray = profileOf(`She said "hello and then walked on past the mill and the wall. ${'The road ran on and on. '.repeat(30)}\n\nShe never looked back at him, and he never called after her.`);
  assert.ok(stray.dialogue.share < 0.2, `a stray mark followed by an ordinary paragraph is not speech: ${stray.dialogue.share}`);
});

test('speech under a speaker name (a screenplay) is dialogue, not the narrator', () => {
  const p = profileOf(SCRIPT);
  assert.ok(p.dialogue.cueLines >= 12, `${p.dialogue.cueLines} speeches`);
  assert.ok(p.dialogue.cueShare > 0.2 && p.dialogue.cueShare < 0.6, `cue share ${p.dialogue.cueShare}`);
  assert.equal(p.dialogue.lines, 0, 'nothing is inside quotation marks');
  assert.notEqual(p.pov.label, 'mixed', 'the characters\' I / you / we are not the narrator');
  assert.match(p.promptLine, /dialogue, set off by speaker names/);
  assert.match(p.promptLine, /screenplay scene headings/);
  assert.doesNotMatch(p.promptLine, /almost no/, 'it must not claim there is hardly any dialogue');
  const d = describeStyle(p);
  assert.match(d, /No quoted speech was found, but \d+ speeches are set off by a speaker name in capitals on its own line \(\d+% of the words\)/);
  // a heading in capitals is not a speaker; neither is one speaker who says three things
  const headings = profileOf(`CHAPTER ONE\n${NARRATIVE}\n\nCHAPTER TWO\n${NARRATIVE}\n\nCHAPTER THREE\n${NARRATIVE}\n\nCHAPTER FOUR\n${NARRATIVE}`);
  assert.equal(headings.dialogue.cueLines, 0);
  const lone = profileOf(`MARA\nI know.\n\nMARA\nI know it.\n\nMARA\nI know it well.\n\nMARA\nYes.\n\n${NARRATIVE}`);
  assert.equal(lone.dialogue.cueLines, 0, 'one speaker is a heading style, not a script');
  assert.equal(profileOf(SCRIPT.toUpperCase()).dialogue.cueLines, 0, 'in a text that is all capitals nothing marks a speaker');
});

test('text that is not mainly English is not given an English reading', () => {
  const p = profileOf(SPANISH);
  assert.equal(p.language.readable, false);
  assert.ok(p.language.englishShare < 0.12, `${p.language.englishShare}`);
  assert.equal(p.pov.label, 'unclear', '"he" is Spanish for "I have", not a third-person pronoun');
  assert.equal(p.tense.label, 'unclear');
  assert.match(p.promptLine, /few common English words, so person, tense and register are not measured/);
  assert.doesNotMatch(p.promptLine, /narrative register|third person|first person|past tense|present tense/);
  assert.doesNotMatch(p.promptLine, /almost no quoted dialogue/, 'other languages quote in other ways');
  assert.ok(p.signature.every((t) => !/^[a-zà-ÿ]+ [a-zà-ÿ]+$/.test(t)), `no coined phrase out of Spanish function words: ${JSON.stringify(p.signature)}`);
  const d = describeStyle(p);
  assert.match(d, /few of its words are common English words/);
  assert.doesNotMatch(d, /written in|mixed|expository|lyrical|narrative|conversational/, 'no label is claimed');
  assert.equal(describeStyle(profileOf(SPANISH)), d, 'deterministic');
  // English is still English, even with invented names and a scattering of numbers
  for (const text of [MEMOIR, NARRATIVE, WORLDBUILDING, DIARY, `Mara Voss: 34. Tomas Reed: 41. The Warden: unnamed.\n\n${NARRATIVE}`]) assert.equal(profileOf(text).language.readable, true);
});

test('the register wording says what was counted, not what the words are', () => {
  const d = describeStyle(profileOf(WORLDBUILDING));
  assert.doesNotMatch(d, /technical terms|abstract nouns are/, 'a very long word or a date is not a "technical term"');
  assert.match(d, /numbers, acronyms and very long words \d+%/);
  assert.match(d, /words ending in -tion, -ity, -ment/);
  const narrative = describeStyle(profileOf(MEMOIR));
  assert.match(narrative, /nothing in the word counts marks it as expository, lyrical or conversational/);
  const lyrical = profileOf(`${LYRICAL}\n\n${LYRICAL}`);
  assert.equal(lyrical.register.label, 'lyrical');
  assert.equal(typeof lyrical.register.imageryShare, 'number');
  assert.ok(lyrical.register.imageryShare >= 0.08);
  assert.match(describeStyle(lyrical), /image words, similes and repeated openings score \d+ per 100 words/);
});

// ── found by review: ways of setting speech apart ────────────────────────────

test("'straight single quotes' are dialogue when the text quotes in no other way; apostrophes are not", () => {
  const text = `'Where are you going?' asked Elena. 'Out,' said Pavel. 'Out where?' 'Just out. Does it matter?' 'It matters to me,' she said. He stopped at the door and looked back at her. 'I'll be home before dark,' he said. 'You said that yesterday.' 'And yesterday I was.' 'Late.' 'Late,' he agreed, and he almost smiled. Elena turned back to the stove. She heard the door close, and then the gate, and then nothing at all.`;
  const p = profileOf(text);
  assert.equal(p.dialogue.lines, 10);
  assert.ok(p.dialogue.share > 0.3, `${p.dialogue.share}`);
  assert.equal(p.pov.first, 0, 'the "I" inside the marks is a character, not the narrator');
  // apostrophes alone: contractions, possessives and dropped letters never pair up into quotations
  const apostrophes = `It wasn't her place, and she didn't follow him. 'Til morning the dogs' bowls were empty, and Mara's coat hung by the door as it always did. He'd said 'em twice, and she'd heard him both times. They'd gone by dusk, and nobody's lamp was lit in the lane. 'Twas the night before the market, and the baker's boy was late again.`;
  assert.equal(profileOf(apostrophes).dialogue.lines, 0);
});

test('speech set off with a dash at the start of the line is not the narrator', () => {
  const lines = [
    '— Where are you going? asked Elena.',
    '— Out, said Pavel.',
    '— Out where?',
    '— Just out. Does it matter?',
    '— It matters to me.',
    'He stopped at the door and looked back at her. The kitchen was warm and smelled of onions, and a pan hissed on the stove.',
    '— I will be home before dark, he said.',
    '— You said that yesterday.',
    '— And yesterday I was.',
    '— Late.',
    '— Late, he agreed, and he almost smiled.',
    'Elena turned back to the stove. She heard the door close, and then the gate, and then nothing at all. She stirred the pot for a long time, and the steam rose past her face.',
    'Outside, the dog barked twice and fell silent. She did not look up, and she turned the heat down low. The evening went on like any other, and the light faded from the window.',
  ];
  const p = profileOf(lines.join('\n'));
  assert.equal(p.dialogue.dashLines, 10);
  assert.equal(p.dialogue.lines, 0);
  assert.equal(p.pov.first, 0, 'the I and you in the dashed lines are the characters');
  assert.match(p.promptLine, /many lines open with a dash/);
  assert.match(describeStyle(p), /No quoted speech was found, but 10 lines open with a dash, which some writers use to set off speech/);
  // a couple of stray dashes, or a list that uses dashes, is not a way of writing speech
  const stray = profileOf(`${NARRATIVE}\n\n— a note to self\n\n${NARRATIVE}\n\n— another note`);
  assert.equal(stray.dialogue.dashLines, 0);
});

// ── found by review: sentences, stamps, odd spaces ───────────────────────────

test('time stamps may be capitalised any way and use a hyphen; a sentence is still not a stamp', () => {
  const stamps = (text) => profileOf(text).structure.some((x) => x.startsWith('time stamps'));
  const body = 'Nothing much happened in the valley that season, and the people there went about their work as they always had done. ';
  assert.equal(stamps(`DAY 1. ${body}DAY 2. ${body}DAY 3. ${body}`), true);
  assert.equal(stamps(`Day One\n\n${body}\n\nDay Two\n\n${body}\n\nday three\n\n${body}`), true);
  assert.equal(stamps(`Year four - September. ${body}Year five - March. ${body}Year six - May. ${body}`), true);
  assert.equal(stamps(`Year four, the harvest failed and the people went hungry. ${body}Year five, the rains came back late. ${body}Year six, nobody could say what had changed. ${body}`), false);
});

test('a decimal point or a version number is not the end of a sentence, and a long run of them is quick', () => {
  const p = profileOf('The unit reaches a COP of 3.5 in mild weather and stays above 2.8 in frost. Version 2.0.1 fixes the defrost timer. Both ran at 4.2 percent of rated load, which nobody expected.');
  assert.equal(p.sentences, 3);
  const text = '1.1.1.1'.repeat(8600);
  const t0 = performance.now();
  assertSane(styleProfile(text));
  assert.ok(performance.now() - t0 < 300, 'merging the pieces of a number must not re-scan the sentence each time');
});

test('a no-break space is a space', () => {
  // these verbs are only recognised straight after their subject, so a word processor's no-break space must not break the link
  const cues = 'She pushed the gate. He stared at her. They waited. She nodded. He opened the door. They followed her inside. She turned the lamp. He watched the rain. She smiled. He laughed.';
  const nbsp = profileOf(cues.replace(/ /g, '\u00a0'));
  assert.equal(nbsp.tense.label, 'past');
  assert.deepEqual(nbsp.tense, profileOf(cues).tense);
  const narrative = profileOf(NARRATIVE.replace(/ /g, '\u00a0'));
  assert.deepEqual(narrative.pov, profileOf(NARRATIVE).pov);
  assert.deepEqual(narrative.dialogue, profileOf(NARRATIVE).dialogue);
});

test('an outline numeral at the start of a line is not the narrator', () => {
  const text = `I. The Harbour\n\n${NARRATIVE}\n\nII. The Tower\n\n${NARRATIVE}\n\nI. The Return\n\n${NARRATIVE}`;
  const p = profileOf(text);
  assert.equal(p.pov.first, 0);
  assert.equal(p.pov.label, 'third person');
});

// ── found by review: speed on text built to be slow ──────────────────────────

test('unclosed quotation marks cannot make the profile slow', () => {
  const quick = (text, label) => {
    styleProfile(text.slice(0, 2000)); // warm up
    const t0 = performance.now();
    assertSane(styleProfile(text));
    const ms = performance.now() - t0;
    assert.ok(ms < 250, `${label}: ${ms.toFixed(0)} ms`);
  };
  const rep = (s) => s.repeat(Math.ceil(60000 / s.length)).slice(0, 60000);
  quick(rep(' “a'), 'curly double marks, none closed');
  quick(rep(' "a'), 'straight marks, none closed');
  quick(rep(' ‘a'), 'curly single marks, none closed');
  quick(rep("a' 'b "), 'straight single marks');
  quick(rep('— a\n'), 'dashes');
  quick(rep('MARA\n'), 'speaker names with nothing under them');
  quick(rep('MARA\nhi\n\n'), 'speeches');
  quick(rep('Year one and '), 'a time stamp that never ends');
  // the same single-curly-mark reading as before the rewrite: a close more than 1,500 characters away is not a quotation
  assert.equal(profileOf(`‘${'word '.repeat(400)}’ ${NARRATIVE}`).dialogue.lines, 4, 'too long to be speech');
  assert.equal(profileOf(`‘Go home now, please,’ she said. ‘No,’ he said. ${NARRATIVE}`).dialogue.lines, 6);
});

test('a pasted blob is not a recurring term, and no term is long enough to flood the description', () => {
  const blob = `Z${'x'.repeat(3000)}`;
  const filler = 'The road ran on between the fields and nobody on it said a word. '.repeat(40);
  const p = profileOf([blob, filler, `then ${blob}`, filler, `and ${blob}`, filler, `but ${blob}`, filler].join(' '));
  assert.deepEqual(p.signature, []);
  assert.ok(describeStyle(p).length < 1200, `${describeStyle(p).length} characters`);
  for (const t of profileOf(makeLongText({ words: 9000, seed: 4 }).text).signature) assert.ok(t.length <= 60, t);
});

test('a share that only rounds to 100% is not reported as 100%', () => {
  // 1 present cue among 300 past ones: 99.7% past is not "100% past"
  const text = `${'She walked home and she saw the river. '.repeat(150)} He is here. She went on. `;
  const p = profileOf(text);
  assert.equal(p.tense.label, 'past');
  assert.ok(p.tense.past < 1 && p.tense.past >= 0.995, `${p.tense.past}`);
  const d = describeStyle(p);
  assert.match(d, /past tense \(over 99% of those counted\)/);
  assert.doesNotMatch(d, /100%/);
});

test('the new readings are deterministic too', () => {
  for (const text of [SCRIPT, SPANISH, DIARY, `“One.\n\n“Two.\n\n“Three.” He left.`]) {
    assert.deepEqual(profileOf(text), profileOf(`${text}`));
    assert.equal(describeStyle(profileOf(text)), describeStyle(profileOf(text)));
  }
});

// ── helpers ───────────────────────────────────────────────────────────────────

/** Every number is finite and in range, every label is one of the allowed ones, every list holds strings. */
function assertSane(p) {
  const nums = [p.words, p.sentences, p.paragraphs, ...Object.values(p.sentence), p.paragraph.meanWords, p.dialogue.share, p.dialogue.lines, p.dialogue.dashLines, p.dialogue.cueLines, p.dialogue.cueShare, p.pov.first, p.pov.second, p.pov.third, p.tense.past, p.tense.present, p.register.abstractShare, p.register.technicalShare, p.register.imageryShare, p.language.englishShare];
  for (const n of nums) assert.ok(Number.isFinite(n) && n >= 0, `bad number ${n}`);
  assert.equal(typeof p.language.readable, 'boolean');
  for (const s of [p.sentence.longShare, p.sentence.shortShare, p.dialogue.share, p.dialogue.cueShare, p.language.englishShare, p.pov.first, p.pov.second, p.pov.third, p.tense.past, p.tense.present, p.register.abstractShare, p.register.technicalShare]) assert.ok(s <= 1, `share ${s}`);
  assert.ok(['first person', 'second person', 'third person', 'mixed', 'unclear'].includes(p.pov.label));
  assert.ok(['past', 'present', 'mixed', 'unclear'].includes(p.tense.label));
  assert.ok(['expository', 'narrative', 'lyrical', 'conversational'].includes(p.register.label));
  assert.ok(p.structure.every((s) => typeof s === 'string') && p.signature.every((s) => typeof s === 'string'));
  assert.ok(p.signature.length <= 8);
  assert.equal(typeof p.promptLine, 'string');
  assert.ok(estimateTokens(p.promptLine) <= PROMPT_LINE_MAX_TOKENS);
}
