# The offline encyclopedia

NIE can look a question up with **no internet, no account and no search key**, in a copy of the opening of tens of thousands of Wikipedia articles that lives on the writer's computer. Nothing the writer asks leaves the computer. It is optional: the writer downloads it once in Settings (like the language model), or adds a pack file they already have.

## What it is, and is not

- **Is:** the first paragraphs of the most-read articles of one Wikipedia (the first pack is Simple English Wikipedia, built from Wikipedia's own search-index dump), searched with a plain BM25 index. NIE answers from them with numbered sources, like every other lookup.
- **Is not:** all of Wikipedia (only the opening of each article, only the most-read ones), up to date (the reply says the date the pack was built), or checked by NIE. Wikipedia can be wrong, and a small model summarising an article can be wrong in ways the checks cannot see. A narrow or very recent subject may simply not be in it; NIE says so and does not guess.

## How a question is answered (`engine/encyclopedia/`, `engine/web/`)

1. **Source order.** The writer's own search key, then the encyclopedia, then NIE's own search service (if the build has one), then online Wikipedia (`resolveProvider`). The encyclopedia needs **no agreement and no Web switch in Settings** (installing it was the choice; nothing it does leaves the machine), and it can never fall back to the network: `read()` for the pack reads the pack or returns null.
2. **Search** (`pack.js#search`): the question's words are cut the same way the pack's text was (`tokens.js`: lowercase, accents removed, stop words and question words ("tell me", "explain") dropped, plural/-ing/-ed/final-e trimmed), then BM25 over title (counted three times) and lead, a small bonus for the more prominent article, a bonus for covering every word, and a cut of anything far below the best match (it would only give the model something to be wrong about).
3. **"What is X?" / "Who was X?" / "Tell me about X" / "look up X"** with an article of exactly that name (`define.js`): the answer is the article's first sentences, **quoted** with a `[1]` mark, and no model is asked. A small model's retelling of an introduction is the one place it is worse than the introduction. The note under the reply says so ("Quoted from the offline encyclopedia article ... No model wrote this, and nothing left your computer").
4. **Anything else** goes to whichever model is running with the articles as numbered sources (`webMessages({local: true})`), and the same checks as for web answers apply (`verifyAnswer`: a citation to nothing is dropped, a sentence naming or numbering something no article holds is removed). With no model, the leads are shown whole.
5. **Honest limits in the reply:** when nothing matches, NIE says the encyclopedia holds the opening of N articles and that a narrow or recent subject may be missing; the note names the date; an online model that writes the answer is told apart ("About N words ... were sent to your online provider"), and the library's "I can't look things up offline" is only said when it is true.

NIE still never writes for the writer: a request to write is declined before any lookup, and a lookup answers questions only.

## The pack file (`pack.js`)

One file, `NIEPACK1` + a JSON header + sections, read with ranged reads so a pack is never loaded whole into memory: article text in deflated blocks of 128 articles; a sorted term dictionary with varint delta-coded postings; per-article length and prominence; a sorted table of names (title, title without a bracketed part, title without a leading "the", redirects) for exact lookup. Article numbers follow prominence. The header carries the licence and the attribution text. Version 1; a file of another version is refused with a plain message, and a cut-short download is detected.

Measured here on an invented 120,000-article pack (random text, so it compresses worse than prose): 30 s and about 2.2 GB of memory to build, 96 MB, 160 ms to open, 7 to 130 ms per question. **Not measured on the real dump** (see below).

## Building a pack (`.github/workflows/build-encyclopedia.yml`)

Run the workflow (Actions, build-encyclopedia, Run workflow). It: runs the builder tests; finds the newest CirrusSearch content dump (`scripts/find-dump.mjs`, which tries both folder layouts Wikimedia has used) or takes an address you give; streams it through `scripts/build-encyclopedia.mjs` (keeps the `max_docs` most prominent articles, ranked by the dump's `popularity_score` or, failing that, `incoming_links`; keeps the first `max_lead` characters of each lead, cut at a sentence end; drops redirects, other namespaces, disambiguation pages, "List of ..." pages and leads under 80 characters); writes `<name>.niepack` and `manifest.json` (bytes, sha256, article count, date, source, licence); opens the result and runs `scripts/encyclopedia-probe.mjs --canary` (six common-knowledge questions must find their article); and keeps the result as a workflow artifact. With `draft_tag` it also attaches both files to a **draft** release. Nothing is published by the workflow.

To make it downloadable from the app: publish that draft release yourself, then put the pack's address, `sha256`, `bytes`, `name`, `builtAt` and `docs` (all in `manifest.json`) into `apps/desktop/encyclopedia.json` and build the app. Until `url` is filled in, the app says honestly that the encyclopedia is not offered in this build, and the writer can still add a pack file they already have (anyone can build one with the script).

## Licence and attribution (needs your decision)

Wikipedia's text is **CC BY-SA 4.0** (Simple English Wikipedia too). A pack is a collection of extracts of that text, so:

- **Attribution:** every reply names the article and links to it (its page history lists the authors); Settings shows the licence and where the authors are; the pack header carries the attribution text. The leads are shortened (cut at a sentence end) but never reworded.
- **Share-alike:** the pack file itself should be offered under CC BY-SA 4.0 (or a compatible licence). NIE's program code is separate from the pack and is not a derivative of the text, but **whether and how this affects NIE's own licence and the way you distribute the pack is for you (and a lawyer, if it matters to you) to decide.** This is not legal advice. No pack has been published.
- Images and other Wikimedia content are not included.

## What has and has not been verified

- ✅ The format, builder, parser, top-N selection, search, exact-name lookup, quoting of definitions, the provider order, "never touches the network", the wording in each state and the failure modes are covered by `tests/encyclopedia.test.js` and `tests/encyclopedia-web.test.js` against an **invented dump in the CirrusSearch shape**.
- 🟡 **The real dump has not been read.** The development network blocks Wikimedia, so the dump's field names (`opening_text`, `popularity_score`, `incoming_links`, `redirect`) and folder layout come from public documentation, and the builder falls back sensibly when a field is missing. The first run of the workflow on a real dump is the first real test; read its log.
- 🟡 The quality of ranking on real data (which articles are kept, how well real questions find them) is unmeasured; the canary checks are a smoke test, not an evaluation.
- 🟡 The download in the desktop app, the Settings screen and the file picker have been tested against fakes, not run in a real Electron window.
