// A long, deterministic, invented text for testing how well NIE can read something far longer than its model's window.
// It is made of templated paragraphs (no real text, nothing copyrighted) with unique facts planted at known places ("needles"), and
// decoys that share words with them, so finding the right passage takes more than matching one word.
//
//   const { text, needles } = makeLongText({ words: 20000, seed: 7 });
//   needles[0] -> { id, question, answer, at: 0.05, chapter: 1, fact: 'the sentence that holds it' }
//
// Same arguments, same text, byte for byte.

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NAMES = ['Ilsa Quade', 'Tomas Verrick', 'Marit Oland', 'Dov Anselm', 'Brenna Hale', 'Corin Ashby', 'Odalys Venn', 'Pell Hargrove', 'Wren Calloway', 'Fenn Marlowe'];
const PLACES = ['the boathouse', 'the salt market', 'the east pier', 'the chapel steps', 'the signal tower', 'the net loft', 'the old cannery', 'the ferry landing', 'the clock yard', 'the quarry road'];
const THINGS = ['a coil of rope', 'a tin lantern', 'a ledger', 'a pair of gloves', 'a folded map', 'a cracked compass', 'a jar of tar', 'a woollen scarf', 'a set of scales', 'a wooden spoon'];
const WEATHER = ['a low fog', 'a hard wind off the water', 'thin rain', 'a flat grey calm', 'sleet that would not settle', 'a cold bright morning', 'a heavy, salted dusk'];
const VERBS = ['carried', 'counted', 'mended', 'weighed', 'wrapped', 'set down', 'checked', 'dragged', 'dried', 'sorted'];
const MOODS = ['quietly', 'without looking up', 'with more care than it needed', 'as if it were already late', 'the way people do when they are being watched', 'slowly'];

const TEMPLATES = [
  (r) => `${pick(r, NAMES)} ${pick(r, VERBS)} ${pick(r, THINGS)} to ${pick(r, PLACES)}, ${pick(r, MOODS)}.`,
  (r) => `There was ${pick(r, WEATHER)} over ${pick(r, PLACES)} that day, and nobody said much.`,
  (r) => `${pick(r, NAMES)} watched ${pick(r, NAMES)} from ${pick(r, PLACES)} and said nothing about ${pick(r, THINGS)}.`,
  (r) => `By the time the bell rang, ${pick(r, THINGS)} had been moved twice and ${pick(r, NAMES)} had stopped asking why.`,
  (r) => `"Leave it at ${pick(r, PLACES)}," ${pick(r, NAMES)} said, and went on ${pick(r, VERBS).replace(/ed$/, 'ing').replace(/ $/, '')} as though the matter were closed.`,
  (r) => `${pick(r, NAMES)} had a habit of ${pick(r, ['humming', 'counting steps', 'tapping the rail', 'checking the tide table'])} whenever ${pick(r, NAMES)} came near ${pick(r, PLACES)}.`,
  (r) => `It was ${pick(r, WEATHER)} again, and the road to ${pick(r, PLACES)} ${pick(r, ['ran with water', 'was empty', 'smelled of tar', 'held its breath'])}.`,
  (r) => `Nobody at ${pick(r, PLACES)} remembered who had left ${pick(r, THINGS)} there, only that it had been there a long while.`,
  (r) => `${pick(r, NAMES)} ${pick(r, VERBS)} ${pick(r, THINGS)} ${pick(r, MOODS)}, and then ${pick(r, VERBS)} ${pick(r, THINGS)}.`,
  (r) => `They talked about ${pick(r, ['the price of salt', 'the new lamp', 'the winter', 'a boat that had not come back', 'the council', 'nothing in particular'])} until the light went.`,
];

const pick = (r, list) => list[Math.floor(r() * list.length)];

/** The planted facts. Each has a question the writer could ask, the short answer, the sentence that holds it, and a decoy sentence for another place. */
const NEEDLES = [
  { question: 'Where did Tomas Verrick hide the brass key?', answer: 'third floorboard', fact: 'Tomas Verrick hid the brass key beneath the third floorboard of the net loft.', decoy: 'Ilsa Quade lost a silver key somewhere along the east pier and never mentioned it.' },
  { question: 'What colour was the door of the signal tower?', answer: 'green', fact: 'The door of the signal tower had been painted green the summer Marit Oland arrived.', decoy: 'The door of the chapel was left grey, since nobody could agree on a colour.' },
  { question: 'Who owed Dov Anselm eleven shillings?', answer: 'Pell Hargrove', fact: 'Pell Hargrove owed Dov Anselm eleven shillings and had promised to pay it by the first frost.', decoy: 'Fenn Marlowe owed the cannery nine shillings, which was not remembered by anyone.' },
  { question: 'What did Brenna Hale carry in her left pocket?', answer: 'a pressed violet', fact: 'In her left pocket Brenna Hale carried a pressed violet, which she touched whenever she lied.', decoy: 'Wren Calloway kept a pressed leaf in a book, though nobody ever saw it.' },
  { question: 'Which night did the lamp at the ferry landing go out?', answer: 'the night of the second storm', fact: 'The lamp at the ferry landing went out on the night of the second storm, and was not lit again until spring.', decoy: 'The lamp at the clock yard flickered all winter and was blamed on the oil.' },
  { question: 'How many steps led down to the old cannery cellar?', answer: 'nineteen', fact: 'Corin Ashby counted nineteen steps down to the old cannery cellar, and then lost count of the rest.', decoy: 'There were twelve steps up to the chapel, which Odalys Venn climbed daily.' },
  { question: 'What was written inside the lid of the tin lantern?', answer: 'for Anselm, who kept the light', fact: 'Inside the lid of the tin lantern was scratched the line "for Anselm, who kept the light".', decoy: 'The lid of the jar of tar had a date scratched into it, but the date had worn away.' },
  { question: 'Who rowed to the far side of the bay before dawn?', answer: 'Odalys Venn', fact: 'Before dawn Odalys Venn rowed alone to the far side of the bay and came back with an empty boat.', decoy: 'Wren Calloway walked to the far end of the quarry road before dawn, and came back with nothing to say.' },
  { question: 'What did the council vote to sell?', answer: 'the clock yard', fact: 'By a single vote the council decided to sell the clock yard, and the man who cast it left town.', decoy: 'The council voted to repaint the ferry landing, which took a week and pleased no one.' },
  { question: 'What was the name of the boat that did not come back?', answer: 'Little Merrow', fact: 'The boat that did not come back was the Little Merrow, and her name was never painted over.', decoy: 'The boat that came back late was the Gannet, whose captain blamed the tide.' },
  { question: 'Where was Wren Calloway born?', answer: 'Skerrow', fact: 'Wren Calloway was born in Skerrow, a village so small it was left off the map.', decoy: 'Fenn Marlowe was raised in Dunmarrow, which was on every map and no better for it.' },
  { question: 'What did Ilsa Quade whisper at the chapel steps?', answer: 'not yet', fact: 'At the chapel steps Ilsa Quade whispered two words, not yet, and no one asked who they were for.', decoy: 'At the quarry road Pell Hargrove shouted a name into the wind and was not answered.' },
];

/**
 * @param {{ words?: number, seed?: number }} o  approximate length in words (about 600 per chapter)
 */
export function makeLongText({ words = 8000, seed = 7 } = {}) {
  const r = rng(seed);
  const chapters = Math.max(2, Math.round(words / 600));
  const K = Math.min(NEEDLES.length, chapters); // a short text carries fewer facts
  const planted = NEEDLES.slice(0, K);
  const needleChapter = (i) => Math.min(chapters, Math.max(1, Math.round(((i + 0.5) / K) * chapters)));
  const out = [];
  const needles = [];
  for (let c = 1; c <= chapters; c++) {
    out.push(`Chapter ${c}`);
    const paragraphs = 5;
    const here = planted.map((n, i) => ({ n, i })).filter(({ i }) => needleChapter(i) === c);
    for (let p = 0; p < paragraphs; p++) {
      const sentences = [];
      const count = 6 + Math.floor(r() * 3);
      for (let s = 0; s < count; s++) sentences.push(TEMPLATES[Math.floor(r() * TEMPLATES.length)](r));
      // plant the fact in one paragraph of its chapter, and a decoy in another chapter's paragraph so one word is never enough
      for (const { n, i } of here) {
        if (p === (i % paragraphs)) {
          const at = 1 + Math.floor(r() * (sentences.length - 1));
          sentences.splice(at, 0, n.fact);
          needles.push({ id: `n${i + 1}`, question: n.question, answer: n.answer, fact: n.fact, chapter: c, at: Number(((c - 0.5) / chapters).toFixed(3)) });
        }
        if (c % 3 === 1 && p === 3 && (c + i) % 4 === 0) sentences.splice(1, 0, n.decoy);
      }
      out.push(sentences.join(' '));
    }
  }
  needles.sort((a, b) => a.chapter - b.chapter || a.id.localeCompare(b.id));
  return { text: out.join('\n\n'), needles, chapters };
}

export const wordCountOf = (text) => (text.match(/\S+/g) ?? []).length;
