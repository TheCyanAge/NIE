import test from 'node:test';
import assert from 'node:assert/strict';
import { absentReply, focusSources, supportCheck, tidyLead, tidyReply } from '../apps/web/src/engine/encyclopedia/grounding.js';

test('Wikipedia\'s leftovers are taken out of an opening, and its words are not touched', () => {
  assert.equal(tidyLead('The speed of light, usually denoted by c {\\displaystyle c}, is a constant. It is 299,792,458 metres per second.'), 'The speed of light, usually denoted by c, is a constant. It is 299,792,458 metres per second.');
  assert.equal(tidyLead('Lua error in package.lua at line 80: module \'Module:Pagetype/setindex\' not found. Homer is a Greek poet.'), 'Homer is a Greek poet.');
  assert.equal(tidyLead('A lighthouse is a tall building. This short article can be made longer. You can help Wikipedia by adding to it.'), 'A lighthouse is a tall building.');
  assert.equal(tidyLead('Wikimedia Commons has media related to Lighthouses. The tower is tall.[source?]'), 'The tower is tall.');
  assert.equal(tidyLead('The Simple English Wiktionary has a definition for: radium. Radium is a chemical element.'), 'Radium is a chemical element.');
  assert.equal(tidyLead('Nested {\\displaystyle {\\frac {1}{\\sqrt {1-({\\frac {v}{c}})^{2}}}}} formula.'), 'Nested formula.');
  assert.equal(tidyLead('Plain text stays exactly as it is.'), 'Plain text stays exactly as it is.');
});

const LONG = 'Mount Everest is the highest mountain on Earth. It is in the Himalayas. People climb it every year. The first people to reach the top were Edmund Hillary and Tenzing Norgay in 1953. Many have died trying. It is 8,849 metres tall. The weather is cold. There is little oxygen.';

test('of a long article the model sees its first sentence and those that share words with the question, in order; a short one whole', () => {
  const [a, b] = focusSources([{ n: 1, title: 'Mount Everest', text: LONG }, { n: 2, title: 'Short', text: 'A short article.' }], 'how tall is Mount Everest', { maxChars: 200, perSource: 3 });
  assert.equal(a.full, LONG);
  assert.match(a.text, /^Mount Everest is the highest mountain on Earth\./);
  assert.match(a.text, /8,849 metres tall/, 'the sentence that has the answer is there');
  assert.ok(a.text.length < LONG.length);
  assert.equal(b.text, 'A short article.');
  const [c] = focusSources([{ n: 1, title: 'x', text: LONG }], 'zebra migration', { maxChars: 200, perSource: 3 });
  assert.match(c.text, /^Mount Everest is the highest mountain on Earth\. It is in the Himalayas\./, 'nothing matches: the first two sentences');
});

test('a reply that repeats itself is said once, marks at the start move to the end of the first sentence, and a runaway reply is cut at a sentence', () => {
  assert.equal(tidyReply('[1] [3]\nThe ship sank after hitting an iceberg.').text, 'The ship sank after hitting an iceberg. [1][3]');
  assert.equal(tidyReply('[1] Machu Picchu is in Peru. [2] Machu Picchu is in Peru. Machu Picchu is in Peru.').text.match(/Machu Picchu is in Peru/g).length, 1);
  const long = Array.from({ length: 40 }, (_, i) => `Sentence number ${i} says something quite different from the others here.`).join(' ');
  const cut = tidyReply(long, { maxWords: 60 }).text;
  assert.ok(cut.split(/\s+/).length <= 60 && cut.endsWith('.'), cut);
  assert.equal(tidyReply('- one\n- two').text, '- one\n- two', 'a list is left as it is');
  assert.equal(tidyReply('').text, '');
  assert.equal(tidyReply('Edgar Allan Poe wrote horror stories. [1]').changed, false);
});

const SOURCES = [
  { title: 'Lighthouse', text: 'A lighthouse is a tall building that sends out light for use in navigation. The light is usually covered by a Fresnel lens. Almost all lighthouses are automatic now.' },
  { title: 'Eiffel Tower', text: 'The Eiffel Tower is a wrought-iron landmark in Paris. It was built between 1887 and 1889 for the World Fair.' },
  { title: 'Chrysler Building', text: 'The Chrysler Building is a skyscraper in New York City. It is 1,046 feet (319 m) tall and has 77 floors.' },
];

test('a sentence made of words the articles do not hold goes; one that follows them stays', () => {
  const r = supportCheck('A lighthouse is a tall building that sends out light for navigation [1]. The keeper had to regularly check the lens and respond to any emergencies [1].', SOURCES);
  assert.match(r.text, /^A lighthouse is a tall building/);
  assert.doesNotMatch(r.text, /keeper/);
  assert.equal(r.removed.length, 1);
  assert.equal(r.removed[0].why, 'words');
  assert.ok(r.removed[0].missing.includes('keeper'));
});

test('a figure no article holds goes, even when the words are all there; a figure it holds (written with or without commas) stays', () => {
  const bad = supportCheck('The Eiffel Tower is 330 metres tall and was built in Paris for the World Fair [2].', SOURCES);
  assert.equal(bad.emptied, true);
  assert.deepEqual(bad.removed[0].missing, ['330']);
  assert.equal(bad.removed[0].why, 'numbers');
  assert.equal(supportCheck('The Eiffel Tower was built between 1887 and 1889 for the World Fair [2].', SOURCES).removed.length, 0);
  assert.equal(supportCheck('The Chrysler Building is 1046 feet tall and has 77 floors in New York City [3].', SOURCES).removed.length, 0, '1,046 and 1046 are the same figure');
  assert.equal(supportCheck('The Chrysler Building has 78 floors in New York City [3].', SOURCES).removed.length, 1);
});

test('saying what the articles do not hold is never judged by its words, and short sentences are not judged', () => {
  const r = supportCheck('The articles do not mention the population of Veldhaven. They cover lighthouses.', SOURCES);
  assert.equal(r.removed.length, 0);
  assert.equal(supportCheck('Yes, it is.', SOURCES).removed.length, 0);
  assert.equal(supportCheck('', SOURCES).emptied, true);
});

test('the check is made against the whole article, not the part the model was shown', () => {
  const focused = focusSources([{ title: 'Mount Everest', text: LONG }], 'where is Everest', { maxChars: 100, perSource: 2 });
  assert.equal(supportCheck('Many climbers have died trying to reach the top of Mount Everest.', focused).removed.length, 0);
});

test('the model saying the passages do not answer is recognised', () => {
  for (const yes of ['The passages do not say.', 'The articles do not say what caused it.', "The passages don't say.", '[1] The sources do not tell us.']) assert.equal(absentReply(yes), true, yes);
  for (const no of ['The passages say the fire began in a bakery.', 'The Eiffel Tower is tall.', '']) assert.equal(absentReply(no), false, no);
});
