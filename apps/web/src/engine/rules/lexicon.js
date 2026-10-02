import { STOPWORDS } from '../util/text.js';

/**
 * Named patterns a writer can invoke in plain words ("no adverbs", "avoid exclamation marks").
 * `when` recognises the phrase in the rule text; `re` finds each occurrence in the manuscript.
 */
const NON_ADVERB_LY = new Set(
  'only early family lonely lovely friendly ugly silly holy belly bully jelly rely reply apply supply july italy ally fly ply imply comply multiply butterfly assembly anomaly monopoly daily likely lively deadly orderly elderly curly burly curly scaly smelly wobbly hilly wooly woolly gravelly sully tally rally dolly folly jolly lily billy willy molly polly sally kelly emily holly'.split(' ')
);

const PROFANITY = 'damn|damned|goddamn\\w*|shit\\w*|fuck\\w*|bitch\\w*|bastard\\w*|crap\\w*|piss\\w*|asshole\\w*|dick\\w*|bollocks';
const CLICHES = [
  'at the end of the day', 'dark and stormy night', 'avoid it like the plague', 'time will tell', 'only time will tell', 'in the nick of time', 'a blessing in disguise',
  'calm before the storm', 'last but not least', 'when all is said and done', 'tip of the iceberg', 'dead as a doornail', 'heart skipped a beat', 'blood ran cold', 'let out a breath (?:he|she|they|i) (?:didn\'t|hadn\'t) realized? (?:he|she|they|i) was holding',
];

export const NAMED_PATTERNS = [
  { id: 'adverbs', label: 'adverbs (-ly words)', when: /\badverbs?\b|-ly words?|\bly words?\b/i, re: /\b[A-Za-z]{3,}ly\b/g, accept: (m) => !NON_ADVERB_LY.has(m[0].toLowerCase()) },
  { id: 'exclamation', label: 'exclamation marks', when: /exclamation|exclaim marks?|\bbangs?\b/i, re: /!+/g },
  { id: 'semicolon', label: 'semicolons', when: /semi-?colons?/i, re: /;/g },
  { id: 'emdash', label: 'em dashes', when: /em[- ]?dash|long dash/i, re: /—|(?<!-)--(?!-)/g },
  { id: 'ellipsis', label: 'ellipses', when: /ellips[ie]s|\.\.\. ?marks?|trailing off/i, re: /…|\.{3}/g },
  { id: 'contractions', label: 'contractions', when: /contractions?/i, re: /\b(?:[A-Za-z]+n['’]t|[A-Za-z]+['’](?:re|ve|ll|d|m)|(?:it|that|he|she|there|what|let|who|here|where)['’]s)\b/gi },
  { id: 'profanity', label: 'profanity', when: /profan\w+|swear(?:ing)?(?: words?)?|curse words?|bad language|expletives?/i, re: new RegExp(`\\b(?:${PROFANITY})\\b`, 'gi') },
  { id: 'filter-words', label: 'filter words (felt, saw, heard…)', when: /filter words?|filtering words?/i, re: /\b(?:felt|saw|heard|noticed|realized|realised|wondered|seemed|watched|knew|decided)\b/gi },
  { id: 'hedge-words', label: 'hedge/filler words (very, really, just…)', when: /hedg(?:e|ing)(?: words?)?|filler words?|weak words?|intensifiers?/i, re: /\b(?:very|really|quite|rather|somewhat|just|actually|basically|literally)\b/gi },
  { id: 'numerals', label: 'numerals', when: /numerals?|digits?|numbers? (?:as|in) (?:digits|numerals)/i, re: /\b\d[\d,.]*\b/g },
  { id: 'all-caps', label: 'ALL-CAPS words', when: /all[- ]?caps|capitali[sz]ed words|shouting/i, re: /\b[A-Z]{3,}\b/g },
  { id: 'similes', label: 'similes', when: /similes?/i, re: /\blike (?:a|an|the)\b|\bas (?:if|though)\b|\bas \w+ as\b/gi },
  { id: 'dialogue', label: 'spoken dialogue', when: /\bdialogue\b|quotation marks|quoted speech|\bquotes\b/i, re: /["“][^"”\n]{1,400}["”]/g },
  {
    id: 'passive',
    label: 'passive voice',
    when: /passive(?: voice)?/i,
    re: /\b(?:was|were|is|are|been|being)\s+(?:\w+ly\s+)?(?:\w{3,}ed|bought|built|brought|caught|done|found|held|kept|left|lost|made|paid|sold|seen|sent|shown|taken|taught|told|written|broken|chosen|given|hidden|stolen|spoken)\b(?:\s+by\b)?/gi,
  },
  { id: 'cliches', label: 'cliché phrases', when: /clich[eé]s?|stock phrases?/i, re: new RegExp(`\\b(?:${CLICHES.join('|')})\\b`, 'gi') },
  {
    id: 'said-only',
    label: 'dialogue tags other than "said"',
    when: /only (?:use )?["'“]?said["'”]?|(?:no|avoid|never use) (?:fancy )?(?:dialogue|speech) tags|just ["'“]?said["'”]? for (?:dialogue|tags)/i,
    re: /(?<=["”]\s*,?\s*(?:[A-Z][a-z]+|he|she|they|I|we)\s)(?:asked|replied|whispered|shouted|muttered|answered|snapped|sighed|growled|murmured|yelled|cried|laughed|hissed|exclaimed|demanded|retorted|declared|stammered|breathed)\b/g,
    standalone: true,
  },
];

/** Words that carry no checking value when extracting the "meaning" of a rule. */
export const GENERIC = new Set([
  ...STOPWORDS,
  'ever', 'never', 'always', 'willingly', 'really', 'truly', 'actually', 'would', 'could', 'should', 'must', 'cannot', 'can', 'will', 'go', 'going', 'went', 'gone',
  'come', 'get', 'make', 'take', 'have', 'has', 'had', 'do', 'does', 'be', 'is', 'are', 'near', 'around', 'about', 'anyone', 'anything', 'something', 'someone',
  'person', 'people', 'thing', 'things', 'way', 'ability', 'able', 'allowed', 'allow', 'even', 'still', 'also', 'too', 'any', 'without', 'not', 'dont', 'doesnt',
  'wont', 'cant', 'only', 'ever', 'unless', 'except', 'character', 'story', 'scene', 'narrator', 'chapter', 'rule', 'ever',
]);

/**
 * Related word-stems for the *offline keyword approximation* of meaning-based rules.
 * Matching is exact, or prefix when the token is 4+ letters. This is deliberately modest: it finds candidates,
 * and the interface labels them as keyword matches rather than certain violations.
 */
export const RELATED = {
  lie: ['lie', 'lied', 'lies', 'lying', 'liar', 'liars', 'fib', 'fibbed', 'falsehood', 'deceiv', 'untrue', 'pretend', 'bluff', 'fabricat'],
  steal: ['steal', 'stole', 'stolen', 'theft', 'thief', 'thieves', 'robb', 'rob', 'pocketed', 'swipe', 'shoplift'],
  kill: ['kill', 'murder', 'stab', 'shot', 'shoot', 'slay', 'slain', 'strangl', 'slaughter', 'execut', 'assassinat'],
  swear: ['swear', 'swore', 'sworn', 'curse', 'cursed', 'cursing', 'damn', 'profan', 'expletive'],
  cry: ['cry', 'cried', 'cries', 'crying', 'weep', 'wept', 'sob', 'sobbed', 'tears', 'tearful', 'bawl'],
  drink: ['drink', 'drank', 'drunk', 'booze', 'whiskey', 'wine', 'beer', 'vodka', 'alcohol', 'tipsy'],
  smoke: ['smoke', 'smoked', 'smoking', 'cigarette', 'cigar', 'tobacco', 'pipe'],
  fight: ['fight', 'fought', 'punch', 'brawl', 'hit', 'struck', 'slap', 'attack', 'violen'],
  run: ['run', 'ran', 'running', 'sprint', 'dash', 'fled', 'flee', 'bolt'],
  fly: ['fly', 'flew', 'flying', 'flown', 'soar', 'airborne'],
  leave: ['leave', 'left', 'leaving', 'depart', 'abandon', 'desert', 'walked out'],
  speak: ['speak', 'spoke', 'spoken', 'talk', 'talked', 'said', 'say', 'utter', 'whisper', 'shout'],
  touch: ['touch', 'touched', 'grab', 'grabbed', 'hug', 'hugged', 'embrace', 'caress', 'stroke'],
  eat: ['eat', 'ate', 'eaten', 'eating', 'meal', 'devour', 'swallow'],
  sleep: ['sleep', 'slept', 'sleeping', 'asleep', 'doze', 'nap'],
  fear: ['fear', 'afraid', 'scared', 'terrified', 'terror', 'dread', 'frightened', 'panic'],
  trust: ['trust', 'trusted', 'trusting', 'believe', 'faith', 'rely'],
  forgive: ['forgive', 'forgave', 'forgiven', 'pardon', 'absolve'],
  help: ['help', 'helped', 'assist', 'aid', 'rescue', 'save', 'saved'],
  hurt: ['hurt', 'harm', 'injure', 'wound', 'pain'],
  water: ['water', 'river', 'lake', 'sea', 'ocean', 'pond', 'pool', 'swim', 'swam', 'drown', 'wade', 'shore', 'stream', 'waves'],
  fire: ['fire', 'flame', 'burn', 'burned', 'burnt', 'blaze', 'torch', 'ember', 'smolder'],
  dead: ['dead', 'death', 'died', 'die', 'corpse', 'cadaver', 'deceased', 'body', 'grave', 'ghost'],
  resurrect: ['resurrect', 'revive', 'revived', 'raise', 'raised', 'reanimat', 'bring back', 'brought back', 'rise from', 'rose from', 'return from the dead', 'undead'],
  magic: ['magic', 'magical', 'spell', 'enchant', 'sorcer', 'wizard', 'witch', 'conjure', 'incantation', 'hex'],
  money: ['money', 'cash', 'coin', 'dollar', 'pound', 'gold', 'pay', 'paid', 'rich', 'wealth', 'poor'],
  gun: ['gun', 'pistol', 'rifle', 'revolver', 'shotgun', 'firearm', 'weapon'],
  love: ['love', 'loved', 'loving', 'adore', 'cherish', 'beloved'],
  remember: ['remember', 'recall', 'memory', 'memories', 'recollect', 'reminisc'],
  forget: ['forget', 'forgot', 'forgotten', 'amnesia'],
  know: ['know', 'knew', 'known', 'aware', 'realiz', 'realis', 'understood'],
  win: ['win', 'won', 'victory', 'triumph', 'prevail'],
  lose: ['lose', 'lost', 'losing', 'defeat'],
  die: ['die', 'died', 'dies', 'dying', 'death', 'perish'],
};

const lookup = new Map();
for (const [key, list] of Object.entries(RELATED)) {
  lookup.set(key, key);
  for (const t of list) if (!lookup.has(t)) lookup.set(t, key);
}

/** The related-token group for a word in a rule (or just the word itself). */
export function expandWord(word) {
  const w = word.toLowerCase();
  const key = lookup.get(w) ?? [...lookup.entries()].find(([t]) => t.length >= 4 && w.startsWith(t))?.[1];
  return key ? [...new Set([key, ...RELATED[key]])] : [w];
}

/** Does `token` (a sentence word) match one of the group's tokens? */
export function tokenMatches(token, group) {
  const t = token.toLowerCase();
  return group.some((g) => t === g || (g.length >= 4 && t.startsWith(g)));
}
