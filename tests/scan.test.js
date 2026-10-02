import test from 'node:test';
import assert from 'node:assert/strict';
import { scan } from '../apps/web/src/engine/analysis/scan.js';
import { CLASSES } from '../apps/web/src/engine/analysis/finding.js';
import { candidateNames } from '../apps/web/src/engine/analysis/detectors/canon.js';
import { markIntentional, dismissFinding } from '../apps/web/src/engine/project/memory.js';
import { projectWith, withRules } from './helpers.js';

const PAST = [
  'She walked down the hall and opened the door. The room was cold and the lamp had burned out. She looked at the bed and felt the dust on her hands.',
  'He stood at the window and watched the street. The rain had stopped and the pavement was dark. He turned and saw the empty chair beside the fire.',
  'They sat in the kitchen and waited for the kettle. The clock was slow and the light had faded. Nobody spoke, and the silence seemed to grow heavier.',
  'The driver stopped at the corner and looked back. The road was empty and the engine had gone quiet. He nodded once and opened the door for her.',
  'Morning came grey and slow over the roofs. The baker had lit the ovens and the smell of bread was in the air. She walked past without stopping.',
  'The ferry left at noon and the water was flat. A gull followed the wake and then turned away. She watched it until it was gone.',
];
const PRESENT_PARA =
  'She walks down the hall and opens the door. The room is cold and the lamp has gone out. She looks at the bed and feels the dust on her hands.';

const story = (...paras) => paras.join('\n\n');
const byDetector = (r, d) => r.findings.filter((f) => f.detector === d);

test('report shape: classified findings, honest limits, and no meaningless percentage', () => {
  const r = scan({ text: story(...PAST), project: projectWith() });
  assert.ok(!('score' in r) && !('percent' in r) && !('integrity' in r));
  assert.deepEqual(Object.keys(r.counts).sort(), [...CLASSES].sort());
  assert.ok(r.checked.length >= 8);
  assert.ok(r.notChecked.some((c) => c.id === 'continuity'), 'must say what rules cannot judge');
  assert.ok(r.findings.every((f) => CLASSES.includes(f.class)));
  assert.ok(!/100%|\d+%\s*(?:integrity|score)/i.test(r.headline));
});

test('a quiet scan says what was checked and is not presented as approval', () => {
  const project = withRules(projectWith(), ['Never use the word "magic"']);
  const r = scan({ text: story(PAST[0], PAST[1]), project, observations: false });
  assert.match(r.headline, /No rule violations found \(1 checked exactly\)/);
  assert.ok(!/perfect|100|clean bill|approved|good writing/i.test(r.headline));
  const none = scan({ text: story(PAST[0], PAST[1]), project: projectWith(), observations: false });
  assert.match(none.headline, /haven't added any rules/);
});

test('no text is reported as such rather than scored; short text still gets rule checks but no observations', () => {
  const r = scan({ text: '   ', project: projectWith() });
  assert.match(r.headline, /no text to check/);
  assert.equal(r.findings.length, 0);
  const project = withRules(projectWith(), ['Never use the word "hi"']);
  const short = scan({ text: 'Hi there.', project });
  assert.equal(short.findings.length, 1);
  assert.equal(short.findings[0].section, 'rule');
});

test('a forbidden-word rule produces a hard conflict that points at the exact word', () => {
  const project = withRules(projectWith(), ['Never use the word "magic" - this world has no magic']);
  const text = story(PAST[0], 'Then she used magic to open the lock. ' + PAST[1], PAST[2]);
  const r = scan({ text, project });
  const hard = r.findings.filter((f) => f.class === 'hard-conflict');
  assert.equal(hard.length, 1);
  assert.equal(text.slice(hard[0].start, hard[0].end), 'magic');
  assert.equal(hard[0].section, 'rule');
  assert.match(r.headline, /1 place breaks your rules/);
  const clean = scan({ text: story(...PAST), project });
  assert.equal(clean.counts['hard-conflict'], 0);
  assert.match(clean.headline, /No rule violations found/);
});

test('established terminology is enforced and located', () => {
  const project = withRules(projectWith(), ['Use "the Hollow" not "the Pit"']);
  const text = story(PAST[0], 'They climbed down into the Pit together. ' + PAST[1], PAST[2]);
  const r = scan({ text, project });
  const f = r.findings.filter((x) => x.section === 'rule');
  assert.equal(f.length, 1);
  assert.equal(text.slice(f[0].start, f[0].end), 'the Pit');
});

test('name slips are caught against project memory (likely) and against the story itself (possible)', () => {
  const body = Array.from({ length: 5 }, (_, i) => `Samantha crossed the yard and Samantha waved. ${PAST[i]}`).join('\n\n') + '\n\nThen Samatha closed the gate behind her.';
  const withMemory = scan({ text: body, project: projectWith({ memory: { characters: [{ name: 'Samantha', aliases: [], notes: '' }] } }) });
  const f = byDetector(withMemory, 'names');
  assert.equal(f.length, 1);
  assert.equal(f[0].class, 'likely-issue');
  assert.ok(!('suggestion' in f[0]), 'NIE never proposes replacement text');
  const noMemory = scan({ text: body, project: projectWith() });
  assert.equal(byDetector(noMemory, 'names')[0].class, 'possible-issue');
  assert.ok(!withMemory.findings.some((x) => x.detector === 'strength-names'), 'no praise for consistency next to a name slip');
});

test('tense drift is flagged, and a profile that explains it turns the flag into "could be intentional"', () => {
  const text = story(...PAST.slice(0, 4), PRESENT_PARA, PAST[4], PAST[5]);
  const plain = scan({ text, project: projectWith() });
  const drift = byDetector(plain, 'tense-drift');
  assert.equal(drift.length, 1);
  assert.equal(drift[0].class, 'possible-issue');

  const stream = scan({ text, project: projectWith({ profile: { style: { prose: 'stream-of-consciousness' } } }) });
  const demoted = byDetector(stream, 'tense-drift')[0];
  assert.equal(demoted.class, 'intentional-possibility');
  assert.match(demoted.message, /stream-of-consciousness/i);
  assert.match(demoted.question, /deliberate/i);
});

test('a present-tense story is not faulted for past-tense backstory', () => {
  const presentParas = Array.from({ length: 5 }, () => PRESENT_PARA);
  const r = scan({ text: story(...presentParas, PAST[0]), project: projectWith() });
  assert.equal(byDetector(r, 'tense-drift').length, 0);
});

test('profile POV is enforced; unexplained shifts rank higher than when no POV is declared', () => {
  const third = Array.from({ length: 5 }, () => 'She walked down the hall and she opened the door. Her hands were cold, and her breath was slow in the dark. He waited for her by the stairs and watched her go.');
  const first = 'I walked down the hall and I opened the door. My hands were cold, and my breath was slow in the dark. I waited by the stairs and I watched myself go.';
  const declared = scan({ text: story(...third, first), project: projectWith({ profile: { style: { pov: 'Third person limited' } } }) });
  assert.equal(byDetector(declared, 'pov-drift')[0].class, 'likely-issue');
  const undeclared = scan({ text: story(...third, first), project: projectWith() });
  assert.equal(byDetector(undeclared, 'pov-drift')[0].class, 'possible-issue');
  const multi = scan({ text: story(...third, first), project: projectWith({ profile: { style: { pov: 'Multiple perspectives, alternating' } } }) });
  assert.equal(byDetector(multi, 'pov-drift')[0].class, 'intentional-possibility');
});

test('pattern awareness: a recurring behaviour across scenes is a pattern, not "repetition"', () => {
  const scene = (extra) => `He avoided her eyes and said nothing at all. ${extra}`;
  const text = [scene(PAST[0]), '***', scene(PAST[1]), '***', scene(PAST[2]), '***', scene(PAST[3])].join('\n\n');
  const r = scan({ text, project: projectWith() });
  const pat = byDetector(r, 'pattern-recurring');
  assert.ok(pat.length >= 1);
  assert.equal(pat[0].class, 'stylistic-observation');
  assert.match(pat[0].message, /pattern|motif/i);
  assert.equal(byDetector(r, 'repeat-phrase').length, 0, 'not flagged as clustered repetition');
});

test('a motif the writer declared becomes a strength; clustered echoes stay a possible issue', () => {
  const scene = (extra) => `He avoided her eyes and said nothing at all. ${extra}`;
  const text = [scene(PAST[0]), '***', scene(PAST[1]), '***', scene(PAST[2]), '***', scene(PAST[3])].join('\n\n');
  const withMotif = scan({ text, project: projectWith({ memory: { motifs: ['avoided her eyes'] } }) });
  assert.equal(byDetector(withMotif, 'pattern-recurring')[0].class, 'strength');

  const echo = 'The house was cold. The house was cold. Nobody said it, but the house was cold, and the door stayed shut.';
  const r = scan({ text: story(PAST[0], echo, PAST[1], PAST[2]), project: projectWith() });
  const f = byDetector(r, 'repeat-phrase');
  assert.ok(f.length >= 1);
  assert.equal(f[0].class, 'possible-issue');
  const deliberate = scan({ text: story(PAST[0], echo, PAST[1], PAST[2]), project: projectWith({ profile: { style: { prose: 'Incantatory deliberate repetition' } } }) });
  assert.equal(byDetector(deliberate, 'repeat-phrase')[0].class, 'intentional-possibility');
});

test('very long sentences: clarity risk by default, style under stream-of-consciousness or maximalism', () => {
  const long = 'and then ' + Array.from({ length: 70 }, (_, i) => ['the', 'light', 'moved', 'across', 'the', 'water', 'as', 'it', 'always', 'did'][i % 10]).join(' ') + ' until it stopped.';
  const text = story(PAST[0], long, PAST[1]);
  assert.equal(byDetector(scan({ text, project: projectWith() }), 'long-sentence')[0].class, 'possible-issue');
  assert.equal(byDetector(scan({ text, project: projectWith({ profile: { style: { prose: 'maximalist' } } }) }), 'long-sentence')[0].class, 'stylistic-observation');
});

test('nonfiction is read as nonfiction: no scene, dialogue or backstory complaints for a journal', () => {
  const entries = Array.from({ length: 6 }, (_, i) => `Monday ${i + 1}\nI had been thinking about how I used to walk this road years ago. I had always wanted to come back, and back then I had never imagined the quiet. It was strange to stand there, and I had been sure I would feel more than I did.`).join('\n\n');
  const r = scan({ text: entries, project: projectWith({ profile: { identity: { format: 'journal' } } }) });
  assert.equal(r.form.id, 'journal');
  assert.equal(byDetector(r, 'exposition-block').length, 0);
  assert.equal(byDetector(r, 'dialogue-balance').length, 0);
  const novel = scan({ text: entries, project: projectWith({ profile: { identity: { format: 'novel' } } }) });
  assert.ok(byDetector(novel, 'exposition-block').length >= 1, 'the same text in a novel gets an exposition question');
});

test('clinical register with ornate language becomes a discussion point, not an error', () => {
  const ornate = Array.from({ length: 3 }, () => 'The corridor was like a throat and the ceiling hung like a held breath, as if the building itself were listening. The gossamer light was a tapestry of shimmering dust, and a symphony of pipes whispered of old water. He felt like a stranger there, as though the ethereal glow were watching.').join('\n\n');
  const r = scan({ text: ornate, project: projectWith({ profile: { style: { prose: 'clinical, detached' } } }) });
  const f = byDetector(r, 'register-clash');
  assert.equal(f.length, 1);
  assert.equal(f[0].class, 'stylistic-observation');
  assert.match(f[0].question, /deliberate/i);
  assert.equal(byDetector(scan({ text: ornate, project: projectWith() }), 'register-clash').length, 0);
});

test('strengths are reported alongside issues', () => {
  const varied = [
    'Rain.', 'The street smelled of wet iron and frying onions, and somewhere a radiator clanked in the cold while a child hummed a tune that she could not quite place.', 'She waited.',
    'The light was bright on the pale water, then dark as the shadow of the bridge slid across it, and a bitter, metallic taste rose in her mouth.', 'Nothing.',
    'A gull cried once, a sharp sound over the soft, damp slap of the tide against the stones, and the whole harbour seemed to hold its breath for the length of a single long, slow, trembling heartbeat.',
    'Go.', 'He heard the engine hum and click and settle, and the warm, rough rail was sweet with salt under her fingers as the ferry leaned away from the quay into the grey.', 'Yes.',
    'They stood very still, and for a long time neither of them said anything at all about the letter, or the house, or the winter that was coming whether they wanted it or not.', 'Later.',
    'The bell rang twice over the roofs, and the smell of smoke and bread drifted down the lane toward the sea, where the colour of the morning was pale gold on the swell.', 'Quiet.',
  ].join(' ');
  const r = scan({ text: varied, project: projectWith() });
  assert.ok(byDetector(r, 'strength-rhythm').length === 1);
  assert.ok(r.counts.strength >= 1);
  assert.match(r.headline, /strength/);
});

test('writer decisions stick: intentional demotes, dismissed removes, across re-scans', () => {
  const text = story(...PAST.slice(0, 4), PRESENT_PARA, PAST[4], PAST[5]);
  const project = projectWith();
  const first = byDetector(scan({ text, project }), 'tense-drift')[0];
  assert.equal(first.class, 'possible-issue');

  markIntentional(project, first);
  const second = byDetector(scan({ text, project }), 'tense-drift')[0];
  assert.equal(second.class, 'intentional-possibility');
  assert.equal(second.confirmed, true);

  dismissFinding(project, first);
  const third = scan({ text, project });
  assert.equal(byDetector(third, 'tense-drift').length, 0);
  assert.equal(third.dismissedCount, 1);
});

test('one project\'s decisions and rules never affect another project\'s scan', () => {
  const text = story(...PAST.slice(0, 4), PRESENT_PARA, PAST[4], PAST[5]);
  const a = withRules(projectWith(), ['Never use the word "kettle"']);
  const b = projectWith();
  markIntentional(a, byDetector(scan({ text, project: a }), 'tense-drift')[0]);
  assert.equal(byDetector(scan({ text, project: b }), 'tense-drift')[0].class, 'possible-issue');
  assert.equal(scan({ text, project: b }).counts['hard-conflict'], 0);
  assert.equal(scan({ text, project: a }).counts['hard-conflict'], 1);
});

test('a failing detector degrades gracefully instead of breaking the scan', () => {
  const project = withRules(projectWith(), ['Never use the word "("']); // awkward rule text must not break the scan
  const r = scan({ text: story(...PAST), project });
  assert.ok(Array.isArray(r.findings));
});

test('candidate names for the "remember these?" prompt', () => {
  const t = 'Then Mara said that Joss was late. Later, Mara found Joss at the pier, and Mara waved to Joss. The Harbour was quiet.';
  const names = candidateNames(t).map((n) => n.name);
  assert.ok(names.includes('Mara') && names.includes('Joss'));
});
