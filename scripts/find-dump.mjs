#!/usr/bin/env node
// The address of the newest CirrusSearch content dump of a wiki, found by reading Wikimedia's dump index (the folder layout has moved before, so several are tried).
//   node scripts/find-dump.mjs simplewiki           prints the https address (and nothing else on stdout)
// Exits non-zero, listing every address it tried, when none has a dump.
const UA = 'NIE-encyclopedia-builder/0.1 (https://github.com/TheCyanAge/NIE; finds the newest dump to build an offline article pack)';
const wiki = process.argv[2] || 'simplewiki';
if (!/^[a-z0-9_]{3,30}$/.test(wiki)) throw new Error('The wiki name is like simplewiki or enwiki.');

const BASES = ['https://dumps.wikimedia.org/other/cirrussearch/', 'https://dumps.wikimedia.org/other/cirrus_search_index/'];
const tried = [];
const get = async (url, init) => {
  tried.push(url);
  try {
    return await fetch(url, { ...init, headers: { 'User-Agent': UA }, redirect: 'follow' });
  } catch {
    return null;
  }
};

for (const base of BASES) {
  // the folders are dated (20260101/) next to current/; the file inside is <wiki>-<date>-cirrussearch-content.json.gz
  const idx = await get(base);
  if (!idx?.ok) continue;
  const dates = [...(await idx.text()).matchAll(/href="(\d{8})\/?"/g)].map((m) => m[1]).sort().reverse();
  for (const folder of ['current', ...dates.slice(0, 4)]) {
    const listing = await get(`${base}${folder}/`);
    if (!listing?.ok) continue;
    const names = [...(await listing.text()).matchAll(new RegExp(`href="(${wiki}-(\\d{8})-cirrussearch-content\\.json\\.gz)"`, 'g'))].map((m) => ({ file: m[1], date: m[2] })).sort((a, b) => b.date.localeCompare(a.date));
    if (!names.length) continue;
    const url = `${base}${folder}/${names[0].file}`;
    const head = await get(url, { method: 'HEAD' });
    if (head?.ok) {
      console.log(url);
      process.exit(0);
    }
  }
}
console.error(`No CirrusSearch content dump found for ${wiki}. Tried:\n${tried.map((t) => `  ${t}`).join('\n')}`);
process.exit(1);
