/**
 * Knowledge entries are *reference*, never rules. Every entry carries `deliberateWhen`
 * so NIE can recognise that a departure from the convention may be on purpose.
 *
 * The core library (genres.js, structures.js, …) builds entries with `entry(id, kind, name, summary, opts)`.
 * The large library under library/ is written as plain records and turned into entries by `fromRecord`.
 */
export function entry(id, kind, name, summary, o = {}) {
  return Object.freeze({
    id,
    kind,
    name,
    summary,
    parent: o.parent ?? null,
    aka: o.aka ?? [],
    conventions: o.conv ?? [],
    watchFor: o.watch ?? [],
    deliberateWhen: o.intent ?? [],
    questions: o.q ?? [],
    keywords: o.kw ?? [],
    // Library fields (all optional; empty for the core entries):
    topic: o.topic ?? null, // rules: punctuation, numbers, citation, dialogue…
    guide: o.guide ?? null, // rules: which style guide or standard the rule comes from (e.g. "Chicago")
    scope: o.scope ?? [], // what it applies to (forms, genres, audiences)
    example: o.example ?? null, // a short illustration written for the library (never quoted from a guide)
    works: o.works ?? [], // [{ title, author, year }] representative works
    refs: o.refs ?? [], // reference works to read more (titles only)
    asOf: o.asOf ?? null, // edition / date the entry reflects (style guides change)
    region: o.region ?? null,
    confidence: o.confidence ?? null, // 'established' | 'varies' | 'contested'
    author: o.author ?? null, // works
    year: o.year ?? null,
    language: o.language ?? null,
    genres: o.genres ?? [],
    derived: o.derived ?? false, // a lookup record built from a `works` list inside another entry, not written as its own record
  });
}

/** A plain data record (as written in library/*.js) → a frozen entry. */
export function fromRecord(r) {
  return entry(r.id, r.kind, r.name, r.summary, r);
}
