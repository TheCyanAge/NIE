/**
 * A tiny invented dump in the shape of Wikipedia's CirrusSearch content dump (an `index` line, then the document), with made-up articles.
 * The real dump is built in CI; nothing here is Wikipedia's text.
 */
const make = (id, title, lead, extra = {}) => [
  JSON.stringify({ index: { _type: '_doc', _id: String(id) } }),
  JSON.stringify({ title, namespace: 0, namespace_text: '', opening_text: lead, text: `${lead}\n\nLater sections follow here and are not kept.`, incoming_links: 10, popularity_score: 0.00001, ...extra }),
].join('\n');

export const ARTICLES = [
  ['Marlowe Bridge', 'The Marlowe Bridge is a suspension bridge across the River Tamsin in the invented city of Veldhaven. It opened in 1931 and carries four lanes of traffic and a footpath. It is 412 metres long.', { popularity_score: 0.0009, redirect: [{ namespace: 0, title: 'Tamsin Crossing' }] }],
  ['River Tamsin', 'The River Tamsin is a river in the invented country of Orsland. It rises in the Karr Hills and flows south for 180 kilometres before reaching the sea at Veldhaven.', { popularity_score: 0.0005 }],
  ['Veldhaven', 'Veldhaven is the largest port city of Orsland, on the mouth of the River Tamsin. About two million people live in the city, which was founded by salt traders in the ninth century.', { popularity_score: 0.002 }],
  ['Ilse Quarrel', 'Ilse Quarrel (born 1950) is an Orsland novelist and poet. She is best known for the novel The Salt Ledger, which follows three generations of a Veldhaven shipping family.', { popularity_score: 0.0003 }],
  ['Quarrel (disambiguation)', 'Quarrel may refer to: an argument, a crossbow bolt, or the surname of several people listed on this page.', { popularity_score: 0.0004 }],
  ['List of bridges in Orsland', 'This is a list of bridges in Orsland, sorted by length and by the year that each one opened to the public.', { popularity_score: 0.0006 }],
  ['Karr Hills', 'The Karr Hills are a range of low hills in northern Orsland where the River Tamsin rises. The highest point is Mount Helm at 1,204 metres.', { popularity_score: 0.0002 }],
  ['Salt trade', 'The salt trade is the commerce in salt, which was among the most valuable goods in the ancient and medieval world. Salt was used to preserve food and for trade across whole continents.', { popularity_score: 0.0008 }],
  ['Stub', 'Too short.', { popularity_score: 0.5 }],
];

export function sampleDump() {
  return `${ARTICLES.map(([title, lead, extra], i) => make(i + 1, title, lead, extra)).join('\n')}\n{"index":{"_id":"999"}}\n{"title":"Talk:Veldhaven","namespace":1,"opening_text":"${'Discussion page text. '.repeat(10)}"}\n`;
}
