// Small invented texts with ONE thing planted at a known place, for tests/editor.test.js. Nothing here is a real work, a real person or a real organisation.
//
//   const { text, chapters } = chaptered([ { words: 110 }, { words: 110 }, { words: 500 }, ... ], { seed: 3, tense: 'past' });
//   chaptered(spec, { filler: 'unique' }) fills the chapters with sentences whose words are drawn from long lists, so that no phrase comes back by chance (and no tense
//   or person is measurable): for the tests that need a text in which NOTHING repeats and nothing stands out.
//   chapters[k] -> { n: k + 1, words, tense, person } as built (the SECTION of chapter k is k when every chapter is one paragraph under one heading)
//
// Each chapter is a heading ("Chapter 3") and ONE paragraph, so splitSections() cuts the text into exactly one section per chapter: a chapter of 110 words is
// about 650 characters (over the splitter's 500-character minimum, so the next heading starts a new section) and one of 500 words about 3,000 characters (under
// its 3,400-character maximum), which gives a long section 4 to 5 times the median without any trick. Same arguments, same text, byte for byte.

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
const pick = (r, list) => list[Math.floor(r() * list.length)];

export const NAMES = ['Sabeth Orrin', 'Maddox Veil', 'Tamsin Quill'];
const PLACES = ['weir', 'lamp-works', 'upper lock', 'salt shed', 'ferry stair', 'tannery gate', 'bell loft', 'reed bank'];
const THINGS = ['crate', 'ledger', 'lantern', 'coil of chain', 'sack of meal', 'tarred bucket', 'brass gauge', 'folded sail'];
const WEATHER = ['wind', 'drizzle', 'frost', 'haze', 'heat'];

// [past, present] pairs of the same sentence; {n} a name, {p} a place, {t} a thing, {w} weather
const THIRD = [
  ['{n} carried the {t} to the {p} and she set it down at her feet.', '{n} carries the {t} to the {p} and she sets it down at her feet.'],
  ['The {t} was heavy, and she knew her arms would not last the night.', 'The {t} is heavy, and she knows her arms will not last the night.'],
  ['She looked at the {p} and saw that her door had been left open.', 'She looks at the {p} and sees that her door has been left open.'],
  ['By noon the {p} was quiet, and she went back to her {t}.', 'By noon the {p} is quiet, and she goes back to her {t}.'],
  ['The {w} came in over the {p}, and she said nothing of it to {n}.', 'The {w} comes in over the {p}, and she says nothing of it to {n}.'],
  ['{n} wrote the count in her book, and then she took the {t} up the stair.', '{n} writes the count in her book, and then she takes the {t} up the stair.'],
];
const FIRST = [
  ['I carried the {t} to the {p} and set it down.', 'I carry the {t} to the {p} and set it down.'],
  ['My hands were cold, and I knew the {t} would not last the night.', 'My hands are cold, and I know the {t} will not last the night.'],
  ['I looked at the {p} and saw that my door had been left open.', 'I look at the {p} and see that my door has been left open.'],
  ['By noon the {p} was quiet, and I went back to the {t}.', 'By noon the {p} is quiet, and I go back to the {t}.'],
  ['The {w} came in over the {p}, and I said nothing about it.', 'The {w} comes in over the {p}, and I say nothing about it.'],
  ['I wrote the count in my book, then took the {t} up the stair.', 'I write the count in my book, then take the {t} up the stair.'],
];

const ADJ = 'amber bitter brittle broad cold crooked dim dry faint fallow frayed gaunt hollow idle jagged keen lean loud mossy narrow pale quiet rough rusted sallow sharp slack sodden stark stiff stray thin tidy torn vast warped weary wet worn wiry yellow'.split(' ');
const NOUN = 'anchor barrel basin bridle buckle cable candle chisel cistern clamp cobble crane drum fender furnace gantry girder hatch hinge hoist kettle ladle lathe mallet mortar pulley rafter ratchet rivet rudder shackle spindle sprocket trestle trowel valve wedge winch yoke'.split(' ');
const VERB = 'rattled leaned drifted hummed settled shuddered creaked trembled lingered slipped tilted rested echoed dripped swayed glimmered clattered faded sagged'.split(' ');
const OPEN = [
  (r) => `The ${pick(r, ADJ)} ${pick(r, NOUN)} ${pick(r, VERB)} beside the ${pick(r, ADJ)} ${pick(r, NOUN)}.`,
  (r) => `Under a ${pick(r, ADJ)} sky a ${pick(r, NOUN)} ${pick(r, VERB)} against the ${pick(r, NOUN)}.`,
  (r) => `Somewhere a ${pick(r, ADJ)} ${pick(r, NOUN)} ${pick(r, VERB)}, and a ${pick(r, NOUN)} ${pick(r, VERB)} too.`,
  (r) => `Every ${pick(r, ADJ)} ${pick(r, NOUN)} ${pick(r, VERB)} in turn along the ${pick(r, ADJ)} ${pick(r, NOUN)}.`,
  (r) => `Both ${pick(r, ADJ)} ${pick(r, NOUN)}s ${pick(r, VERB)} over a ${pick(r, ADJ)} ${pick(r, NOUN)}.`,
  (r) => `Past noon a ${pick(r, NOUN)} and a ${pick(r, NOUN)} ${pick(r, VERB)} near the ${pick(r, ADJ)} ${pick(r, NOUN)}.`,
];

/** Sentences with no pronoun and no tense cue, each template starting differently and used in turn: nothing in them repeats by chance. */
function uniqueParagraph(words, seed) {
  const r = rng(seed);
  const out = [];
  let n = 0;
  for (let k = 0; n < words; k++) {
    const s = OPEN[k % OPEN.length](r);
    out.push(s);
    n += s.split(/\s+/).length;
  }
  return out.join(' ');
}

/**
 * One paragraph of about `words` words.
 * @param {{ seed?: number, tense?: 'past'|'present', person?: 'third'|'first', name?: string, filler?: 'story'|'unique' }} o
 */
export function paragraph(words, { seed = 1, tense = 'past', person = 'third', name = NAMES[0], filler = 'story' } = {}) {
  if (filler === 'unique') return uniqueParagraph(words, seed);
  const r = rng(seed);
  const bank = person === 'first' ? FIRST : THIRD;
  const out = [];
  let n = 0;
  while (n < words) {
    const [past, present] = pick(r, bank);
    const s = (tense === 'past' ? past : present).replace('{n}', name).replace('{p}', pick(r, PLACES)).replace('{t}', pick(r, THINGS)).replace('{w}', pick(r, WEATHER));
    out.push(s);
    n += s.split(/\s+/).length;
  }
  return out.join(' ');
}

/**
 * A text of chapters, each a heading and one paragraph. `spec[k]` = { words, tense?, person?, name?, extra? } (`extra`: a sentence added at the end of the paragraph,
 * for planting a name, a measure or a phrase).
 */
export function chaptered(spec, { seed = 1, tense = 'past', person = 'third', name = NAMES[0], filler = 'story' } = {}) {
  const chapters = [];
  const parts = spec.map((c, k) => {
    const t = c.tense ?? tense;
    const p = c.person ?? person;
    const body = paragraph(c.words ?? 110, { seed: seed * 101 + k, tense: t, person: p, name: c.name ?? name, filler }) + (c.extra ? ` ${c.extra}` : '');
    chapters.push({ n: k + 1, words: body.split(/\s+/).length, tense: t, person: p });
    return `Chapter ${k + 1}\n\n${body}`;
  });
  return { text: parts.join('\n\n'), chapters };
}
