# NIE's offline library

This folder is NIE's built-in reference library: style-guide rules, word usage, manuscript formats, genres with representative
works, forms, devices, movements, traditions, notable works and publishing conventions. It exists so NIE can answer from what it
already holds, with no internet. It is **reference material, never a rule NIE enforces**: every entry says when departing from
it is legitimate. (Full Scan only ever enforces the *writer's own* rules.)

It cannot be complete ("every rule for every literary project" has no end), so it is built to be **honest and extendable**:
every rule names its guide and edition, entries say when practice `varies` or is `contested`, the app shows coverage, and when a
question is not covered NIE says so instead of guessing.

## Files

One file per topic, in a folder named for its kind: `rules/`, `usage/`, `guides/`, `formats/`, `genres/`, `forms/`, `devices/`,
`structures/`, `movements/`, `traditions/`, `works/`, `market/`, `process/`, `profiles/` (see Profiles below), and `enrich/` (adds works/references to entries that
already exist in the core library). Never edit `index.js`: `node scripts/build-library-index.mjs` regenerates it.

```js
// Record format. Plain data only (no imports, no code).
export const PREFIX = 'rule-chi-punct-';          // every id in this file starts with this (ends with a hyphen)
export default [
  {
    id: 'rule-chi-punct-serial-comma',
    kind: 'rule',
    name: 'Serial comma',
    summary: 'Chicago style puts a comma before the "and" or "or" that closes a list of three or more items, so each item stays distinct.',
    conv: ['Applies to lists of three or more.', 'Also applies to lists of phrases and clauses.'],
    example: 'We packed tents, lanterns, and spare rope.',
    watch: ['A missing serial comma can fuse the last two items into one when an item itself contains "and".'],
    intent: ['Newspaper house styles usually drop it; a writer may drop it on purpose for rhythm if the meaning stays clear.'],
    q: ['Is there any list in this piece where leaving it out would change who or what is meant?'],
    kw: ['serial comma', 'oxford comma', 'list comma', 'comma before and'],
    topic: 'punctuation',
    guide: 'Chicago',
    asOf: 'Chicago 17th ed. (2017); 18th ed. (2024) keeps this',
    confidence: 'established',
    refs: ['The Chicago Manual of Style'],
  },
];
```

## Fields

| Field | Meaning |
| --- | --- |
| `id`, `kind`, `name`, `summary` | Required. `summary` is 40-460 characters, one or two plain sentences ending in a full stop. |
| `kind` | `rule`, `usage`, `guide`, `format`, `genre`, `form`, `technique` (devices, tropes, narrative techniques), `structure`, `style`, `movement`, `tradition`, `work`, `market`, `process`, `profile` (one facet of a genre, form, tradition or movement: see Profiles). |
| `conv` | The details of the rule/convention: sub-rules, steps, typical features. Up to 10 short strings. |
| `example` | A short illustration YOU invent (never taken from a guide or a book). |
| `watch` | Common mistakes, traps and exceptions. |
| `intent` | When departing from this is legitimate (house style, voice, genre, era, a deliberate effect). Present on nearly every entry. |
| `q` | Useful questions for the writer. Each ends with `?`. |
| `kw` | 3-14 lowercase search keywords: synonyms, how a writer would phrase it ("how do I…"), common misspellings, related terms. |
| `aka` | Other names. |
| `scope` | What it applies to (forms, genres, audiences). |
| `topic` | Rules: `punctuation`, `numbers`, `capitalization`, `citation`, `dialogue`, `format`… |
| `guide` | Rules: the style guide or standard ("AP", "Chicago", "MLA", "APA", "General English"…). |
| `asOf` | Rules and guides: the edition/date the entry reflects. Style guides change; say which edition. |
| `confidence` | `established` (all major sources agree), `varies` (depends on publisher/house/region), `contested` (informed people disagree). |
| `works` | `[{ title, author, year }]`: up to 8 representative works. Genres need at least 2. |
| `refs` | Reference works to read more, **titles and editions only** (e.g. `"The Chicago Manual of Style"`). |
| `author`, `year`, `language` | Works: author, first publication year (integer; or `"c. 800 BCE"` style for ancient/oral), original language. |

Kind-specific requirements are enforced by `tests/library.test.js`.

## Honesty rules (the test enforces the checkable ones)

1. **Paraphrase. Never copy.** Style guides are copyrighted. State the rule in your own words; invent your own examples. No quote longer than 14 words.
2. **Cite the guide and edition, nothing finer.** No section numbers, page numbers, chapter numbers, URLs or addresses. `refs` are titles only. You do not reliably remember section numbers; do not invent them.
3. **Say which edition.** `asOf` is required for rules and guides. If you are not sure what the current edition is, say what you are sure of ("17th ed. (2017) or later") rather than guessing.
4. **Use `confidence` truthfully.** If publishers differ, it is `varies`. If experts disagree, `contested`. Never present a house preference as a universal law.
5. **Works must be real and correctly attributed.** Only include a work if you are certain of its author and approximate first-publication year. If unsure, leave it out. Year is the first publication of the original (translations keep the original year and `language`).
6. **No invented facts.** Nothing that would need fact-checking and that you are not sure of: dates, statistics, prizes, quotations, who coined what. Prefer fewer, correct entries.
7. **No real-person claims beyond bibliographic facts.** No gossip, no characterisations of living people.
8. **Safe to read.** Dark themes are fine as subject matter; no gratuitous cruelty, slurs, or sexual content.
9. **Reference, not rule.** NIE never tells a writer a convention is mandatory. Use `intent` to say when breaking it is a legitimate choice.

## Profiles: the whole subject, one facet at a time

A genre, form, tradition or movement has its own entry (what it is, its conventions, a few works). A writer also asks about the whole subject:
"what are the subgenres of fantasy?", "how did the detective story begin?", "what do romance readers expect?", "how is noir different from hardboiled?".
Each of those questions is answered by a **profile** record: `kind: 'profile'`, `parent` = the id of the entry it is about, `topic` = the facet. One file per subject,
`profiles/<subject-slug>.js`, with `PREFIX = 'profile-<subject-slug>-'` and ids `profile-<subject-slug>-<facet>`. `profiles/gothic-fiction.js` is the model: read it first.

| Facet (`topic`) | What it holds | Name it like |
| --- | --- | --- |
| `history` | Where it came from and how it changed: 6 to 10 dated milestones, earliest first. Approximate dates are fine ("late 1790s"); disputed origins are `contested`. | `Fantasy: history and origins` |
| `subgenres` | Its branches and types, one line each, and how to tell them apart. | `Fantasy: subgenres and types` |
| `tropes` | Recurring settings, figures, images and plot moves, and what each is for. | `Fantasy: tropes, motifs and character types` |
| `readers` | What readers or audiences expect and what disappoints them; length, shelving and series practice where you are sure (`asOf` required: market practice changes). | `Fantasy: what readers expect` |
| `craft` | How it is built: structure, pacing, point of view, voice, setting, the rules of its world. Never sample prose. | `Fantasy: how it is built (structure, voice, setting)` |
| `compare` | How it differs from its nearest neighbours, one line per neighbour. | `Fantasy: how it differs from neighbouring genres` |
| `canon` | Landmark authors and works by era (at least 4 `works`, up to 8, exact author and first-publication year; the year must agree with the rest of the library, and the lint checks that). | `Fantasy: landmark authors and works` |
| `pitfalls` | Common failures, and the fresh angles writers take. | `Fantasy: common pitfalls and fresh angles` |
| `terms` | The words critics, writers and fans use for it, each defined in one line. | `Fantasy: vocabulary of the genre` |

For a tradition or movement the facets keep their ids and shift in meaning: `subgenres` = the forms and genres within it; `tropes` = its recurring themes and motifs;
`readers` = how a reader approaches it (translation, access, what to read first); `craft` = its characteristic style and technique; `compare` = how it relates to neighbouring
traditions or movements; `pitfalls` = common misconceptions and the traps for a writer drawing on it.

A profile needs: `topic`, `parent` (an existing entry id), `name` in the form `Subject: facet`, `summary`, at least 5 `conv` points (each 60 to 300 characters; the substance), `confidence`,
at least 6 `kw` that are the ways a writer would ask ("history of X", "when did X begin", "types of X", "X vs Y", "who are the key X authors"), and one or two `q` questions for the writer.
`watch` and `intent` are short and optional. No `example` (a profile gives facts, never sample prose).

Honesty rules for profiles are the rules above, held harder, because a profile makes many more claims: **write only what you are certain of**; keep dates approximate when you are not;
never invent a work, an author, a coinage, a statistic or a prize; fewer certain points beat more shaky ones; say `contested` or `varies` when informed people disagree. Facts that can be
checked (dates, titles, authors, who coined or first did what) are checked by a second pass against sources before a file is accepted.

## Style of entries

- Plain, warm, precise English. Present tense. No marketing words, no exclamation marks.
- Entries stand alone: do not refer to "the previous entry".
- Be specific and useful: a writer should be able to act on `summary` + `conv` + `example` without reading anything else.
- Cover what writers actually ask. Think of questions like "how do I punctuate dialogue", "what is a villanelle", "what's the screenplay format for a scene heading", "affect or effect", "what genre is…", "who wrote an example of…".
- Avoid near-duplicates inside a file; make each entry earn its place.

## Checks

```
node scripts/build-library-index.mjs        # regenerate index.js after adding/removing files
node --test tests/library.test.js            # lint every record (this is what must pass)
```
