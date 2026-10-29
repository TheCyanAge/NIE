import test from 'node:test';
import assert from 'node:assert/strict';
import { absentReply, answerSentence, focusSources, splitProse, supportCheck, tidyLead, tidyReply } from '../apps/web/src/engine/encyclopedia/grounding.js';

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

test('the best article is shown whole; of the others the model sees the first sentence and those that bear on the question, in order', () => {
  const [best, a, b] = focusSources([{ n: 1, title: 'Everest climbing', text: LONG }, { n: 2, title: 'Mount Everest', text: LONG }, { n: 3, title: 'Short', text: 'A short article.' }], 'how tall is Mount Everest', { maxChars: 200, perSource: 3 });
  assert.equal(best.text, LONG, 'the best match is not cut');
  assert.equal(a.full, LONG);
  assert.match(a.text, /^Mount Everest is the highest mountain on Earth\./);
  assert.match(a.text, /8,849 metres tall/, 'the sentence that has the answer is there');
  assert.ok(a.text.length < LONG.length);
  assert.equal(b.text, 'A short article.');
  const [, c] = focusSources([{ n: 1, title: 'x', text: LONG }, { n: 2, title: 'y', text: LONG }], 'zebra migration', { maxChars: 200, perSource: 3 });
  assert.match(c.text, /^Mount Everest is the highest mountain on Earth\. It is in the Himalayas\./, 'nothing matches: the first two sentences');
});

test('"how tall" keeps the sentence with the figure even when it shares no word with the question, and the words of the article\'s own title do not count', () => {
  const text = 'Mount Everest is the highest mountain on Earth. Mount Everest is in the Himalayas, a tall mountain range in Asia. It is about 8,848 metres (29,029 feet) high and one of the Seven Summits. Mount Everest is on the line between Nepal and China. Mount Everest is cold. Mount Everest is windy and Mount Everest is dangerous to climb.';
  const [, f] = focusSources([{ n: 1, title: 'Other', text: 'x' }, { n: 2, title: 'Mount Everest', text }], 'How tall is Mount Everest?', { maxChars: 260, perSource: 3 });
  assert.match(f.text, /8,848 metres/);
  const [, g] = focusSources([{ n: 1, title: 'Other', text: 'x' }, { n: 2, title: 'Italy', text: 'Italy is a country in Southern Europe. Italy is a democratic republic. Italy has famous food and wine and Italy is old. Its capital, Rome, is one of the most famous cities in the world. Italy has many regions and Italy has many cities.' }], 'What is the capital of Italy?', { maxChars: 230, perSource: 3 });
  assert.match(g.text, /Rome/);
});

test('sentences of prose: a full stop inside a figure, after an abbreviation or in a bracket does not end one', () => {
  assert.deepEqual(splitProse('The building is 1,776.05 feet (541.34 m) tall. It opened in late 2014. St. Paul visited c. 50 AD. He left.'), ['The building is 1,776.05 feet (541.34 m) tall.', 'It opened in late 2014.', 'St. Paul visited c. 50 AD.', 'He left.']);
  assert.deepEqual(splitProse('Is it? Yes! It is. [1] Next.'), ['Is it?', 'Yes!', 'It is.', '[1] Next.']);
  assert.deepEqual(splitProse(''), []);
  assert.deepEqual(splitProse('No end'), ['No end']);
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

test('a name\'s initial does not end a sentence', () => {
  assert.deepEqual(splitProse('It was directed by Joseph L. Mankiewicz. He also wrote it with J. Miles Dale and others. Another one.'), ['It was directed by Joseph L. Mankiewicz.', 'He also wrote it with J. Miles Dale and others.', 'Another one.']);
});

test('a reply that says why needs an article that says why: "because" over words that are all there is not enough', () => {
  const sky = [{ title: 'Sky', text: 'On a clear day the sky appears blue.' }, { title: 'Blue', text: "Blue is the color of the Earth's sky and sea." }];
  const r = supportCheck('The sky appears blue because it is the color of the Earth\'s sky and sea. On a clear day the sky appears blue.', sky);
  assert.equal(r.text, 'On a clear day the sky appears blue.');
  assert.equal(r.removed[0].why, 'reason');
  const why = [{ title: 'Sky', text: 'The sky looks blue because air scatters blue light more than red light.' }];
  assert.equal(supportCheck('The sky looks blue because air scatters blue light.', why).removed.length, 0);
  assert.equal(supportCheck('The Titanic sank after hitting an iceberg.', [{ title: 'Titanic', text: 'The Titanic sank after hitting an iceberg on her first trip.' }]).removed.length, 0, 'no reason claimed, none needed');
});

const art = (n, title, text) => ({ n, title, text });
test('a sentence that holds every word asked is found for a question a small model refused (measured: capital of Italy, Marie Curie, Amelia Earhart, the Great Wall)', () => {
  const found = (q, sources) => answerSentence(q, sources);
  assert.deepEqual(found('What is the capital of Italy?', [art(1, 'Capital', 'Capital can mean: capital city, a city that contains the government of a country.'), art(2, 'Italy', 'Italy (Italian: Italia) is a country in Southern Europe. The country\'s capital, Rome, is one of the most famous cities in the world. It was the capital of the Roman Empire.')]), { n: 2, title: 'Italy', sentence: 'The country\'s capital, Rome, is one of the most famous cities in the world.' }, 'the title stands in for the word "Italy" because the question names that article');
  assert.equal(found('What did Marie Curie discover?', [art(1, 'Marie Curie', 'Marie Curie was a Polish physicist. She did research on radioactivity.'), art(2, 'Polonium', 'Polonium is a rare radioactive metalloid. It was discovered in 1898 by Marie and Pierre Curie.')]).sentence, 'It was discovered in 1898 by Marie and Pierre Curie.', 'a sentence of another article that holds every word of the question itself');
  assert.equal(found('Who was the first woman to fly across the Atlantic?', [art(1, 'The Atlantic', 'The Atlantic is an American magazine.'), art(2, 'Amelia Earhart', 'Amelia Earhart was an American aviator. She was the first woman to fly a plane by herself across the Atlantic Ocean.')]).sentence, 'She was the first woman to fly a plane by herself across the Atlantic Ocean.');
  const wall = [art(1, 'Great Wall of China', 'The Great Wall of China is a series of fortifications in China. Chinese emperors built the wall to protect the north. The first walls were built in the 7th century BCE. The Ming dynasty built the best-known sections.')];
  assert.equal(found('When was the Great Wall of China built?', wall).sentence, 'The first walls were built in the 7th century BCE.', '"when" needs a figure, and the sentence with more of the question\'s words wins');
  assert.equal(found('Who wrote Frankenstein?', [art(1, 'Frankenstein', 'Frankenstein is a 2025 movie. He also wrote and co-produced the movie with others.'), art(2, 'Mary Shelley', 'Mary Shelley was an English writer. She is best known for writing the novel Frankenstein.')]).sentence, 'She is best known for writing the novel Frankenstein.', 'wrote and writing meet; the sentence that has the word itself beats the one that has it through a title');
});

test('and none is found when the articles really do not say, so a true "the articles don\'t answer" stays one', () => {
  const none = (q, sources) => assert.equal(answerSentence(q, sources), null, q);
  none('What caused the Great Fire of London?', [art(1, 'Great Fire of London', 'The Great Fire of London happened in 1666. It lasted for just under five days. It destroyed the homes of 70,000 people.'), art(2, 'Wildfire', 'Wildfire is a general term. Many are caused by humans.')]);
  none('Who invented the telephone?', [art(1, 'Telephone', 'A telephone is a communication tool. People use it to talk with people far away.'), art(2, 'Nikola Tesla', 'Nikola Tesla was an inventor. He is best known for alternating current.')]);
  none('How many bones are in the human body?', [art(1, 'Human body', 'The human body is the body of a person.'), art(2, 'Bone', 'Bones are parts of the skeleton. The bones are the framework of the body.')]);
  none('Why do cats purr?', [art(1, 'Purr by Katy Perry', 'Purr is a fragrance created by Katy Perry. Her love for cats gave her the idea.'), art(2, 'Cat', 'Cats are small mammals. Cats have been tamed for nearly 10,000 years.')]);
  none('What is the population of Veldhaven?', [art(1, 'Population', 'A population is the number of living people in a place.'), art(2, 'Chicago', 'Chicago is a city. As of 2020 the population is 2,746,388.')]);
  none('What was the Colosseum used for?', [art(1, 'Colosseum', 'The Colosseum is a large structure in Rome. It had seating for 50,000 people.')]);
  none('Rome?', [art(1, 'Rome', 'Rome is the capital of Italy.')]);
});

test('the line above an article that points to another is not what the article says (measured: "What is the capital of Japan?" was answered with "This article is about ... For the current capital, see Tokyo.")', () => {
  assert.equal(tidyLead('This article is about the Japanese national capital in general. For the current capital, see Tokyo. The capital of Japan is Tokyo. It has moved before.'), 'The capital of Japan is Tokyo. It has moved before.');
  assert.equal(tidyLead('For other uses, see Mercury (disambiguation). Mercury is the smallest planet.'), 'Mercury is the smallest planet.');
  assert.equal(tidyLead('Everyone is about this article. It is about Tokyo.'), 'Everyone is about this article. It is about Tokyo.', 'only at the start, only as a pointer');
});

test('a reason in a reply must be one an article gives for the same thing: "because" somewhere else in the article is not enough (measured: the sky)', () => {
  const sky = [{ title: 'Sky', text: 'We see the Sun, the Moon, and stars because they are in the sky. On a clear day the sky appears blue.' }, { title: 'Blue', text: "Blue is the color of the Earth's sky and sea." }];
  assert.equal(supportCheck("The sky appears blue because it is the color of the Earth's sky and sea.", sky).removed[0]?.why, 'reason');
  assert.equal(supportCheck('We see the stars because they are in the sky.', sky).removed.length, 0, 'the article does say that');
});

test('a sentence of four or more words with a fifth of them nowhere in the articles goes (measured: the real model\'s supported sentences were all at 100%, the invented one at 71%)', () => {
  const colosseum = [{ title: 'Colosseum', text: 'The Colosseum is a large structure in Rome. A forum was a place to meet, hold big parties and community meetings.' }];
  const r = supportCheck('The Colosseum was used for large parties, community meetings, and entertainment.', colosseum);
  assert.equal(r.emptied, true);
  assert.deepEqual(r.removed[0].missing, ['used', 'entertainment']);
});

test('"who" needs a sentence that names someone, and "how many" accepts a number in words (measured: penicillin got "The first antibiotic discovered was Penicillin"; the spider\'s eight legs were missed)', () => {
  assert.equal(answerSentence('Who discovered penicillin?', [art(1, 'Penicillin', 'Penicillin is a group of antibiotics.'), art(2, 'Antibiotics', 'The first antibiotic discovered was Penicillin, a natural antibiotic produced by a fungus.')]), null);
  assert.equal(answerSentence('Who discovered penicillin?', [art(1, 'Alexander Fleming', 'Alexander Fleming was a Scottish doctor. In 1928 he discovered penicillin.')]).sentence, 'In 1928 he discovered penicillin.', 'a sentence that names no one new but is about the person the article is');
  assert.equal(answerSentence('How many legs does a spider have?', [art(1, 'Spider', 'Spiders are air-breathing arthropods. They have eight legs, and mouthparts with fangs.')]).sentence, 'They have eight legs, and mouthparts with fangs.');
});
