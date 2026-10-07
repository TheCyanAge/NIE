# NIE: notes for AI assistants and contributors

## Non-negotiable product rules
1. **NIE never writes or edits the writer's text.** No rewrites, no replacement wording, no drafted prose or dialogue.
   Full Scan only *locates* (exact character ranges) and *explains briefly* where text breaks the writer's own rules.
   Brainstorm is an idea partner: it offers *concepts* (a what-if, an angle, a complication, a question), never manuscript prose,
   dialogue, a ready-to-paste headline/line, or an edit. Requests to write/rewrite that the rules recognise are declined deterministically
   before any model call (`engine/orchestrator/builtin.js`, `guard.js`); "give me twists/ideas/premises" is *not* such a request, "write a
   scene with twists" is (`intent/intent.js`, `brainstorm/commands.js`). The rules miss about half of the ways people ask, so when a
   model is running it also reads the message (rule 6) and a `write`/`edit` reading gets the same fixed decline: the reading is only a label. The idea banks (`engine/brainstorm/banks/*.js`) are validated by
   `tests/brainstorm-banks.test.js` (no quotes, no digits, no narration, length limits). Do not weaken any of this.
2. **One NIE.** Online model, offline model and built-in guidance are routing, never separate assistants (`engine/ai/engine.js`).
   The model chooser lives in Settings only. Offline status strings are exact and must stay truthful.
3. **Project isolation.** New project = factory-fresh; delete = every key under the project prefix removed; transient session state is
   rebuilt on every switch (`ui/app.js`). NIE's narrative knowledge library is code, not project data.
4. **Intent over rules.** A flag is not a mistake: findings are classed hard / likely / possible / stylistic / intentional / strength,
   and the profile interpreter (`engine/profile/interpret.js`) demotes things the writer declared deliberate. No single quality score.
5. **Never fake readiness.** A file existing is not a working model; offline rule checks that need meaning say "needs the language model".
6. **The language model understands the writer; the rules are the fallback.** When a model is running (offline or online) it reads every
   message first (`engine/orchestrator/understand.js`): a `task` + `topic` as schema-constrained JSON, never prose. That reading decides how NIE
   answers (idea cards, library, conversation, about-NIE, decline). With no model, a bare greeting, an exact Idea Board command, or a model
   that keeps failing, the rules in `intent/intent.js` read it instead. Every result carries `understood: {by: 'model'|'rules', task, topic}`,
   so NIE never claims to have understood something it only pattern-matched. The reading is measured on the real model with
   `scripts/understanding-probe.mjs` (workflow `understanding-eval`) against `tests/fixtures/understanding-messages.json`; change the prompt
   only with that evidence. Tests that fake a model must answer reading calls (`opts.purpose === 'understand'`): use `modelWithReading` in `tests/helpers.js`.

## Layout
- Brainstorm: `engine/brainstorm/` (lenses = what to push on, kinds = what is being made, offline idea banks + seeded selection that never
  repeats until a lens is exhausted, `ideas.js` also parses a model's numbered list into cards and drops over-long "ideas"). The Idea
  Board is project data (`project.brainstorm`, `project/board.js`): isolated, deleted with the project, never edited by NIE.
- Understanding: `engine/orchestrator/understand.js` (the prompt, the schema, `parseReading`, `applyReading`, the label each rule-intent stands for)
  and `orchestrator/index.js#read` (when to ask, the circuit breaker that stops asking a model that keeps failing). A model's `write`/`edit`
  reading is only believed when the message really contains a request (`looksLikeARequest`): the real 3B model sometimes read plain statements
  as "write" and declined a writer's own premise. `about-nie` questions are answered by fixed, checked facts and the real status
  (`aboutNieReply`, `describeStatus`), never by the model: measured on the real model, a 3B asked to describe NIE rambles and invents abilities.
- Long texts: `engine/reading/` (`sections.js` cuts any text into sections at the writer's own structure with every character in exactly one section;
  `context.js` ranks sections for a question with BM25 over the writer's own words and builds what the model is shown: an outline of the whole, the
  opening, the best matches cut around the matching sentence, and the latest part). `orchestrator/prompt.js#composeMessages({document})` fits that into
  the window and `orchestrator/index.js#documentFor` decides which long text a message is about (a long paste, a follow-up soon after one, or the project's
  Story Text). **Honesty rule: NIE says exactly what it looked at (`describeReading`), never "I read all of it" unless the whole text was shown, and a
  built-in (no-model) reply claims no reading.** Nothing is persisted but derived data; only the newest long paste is kept in full in the chat
  (`compactOldPastes`) so a project cannot outgrow its storage. `tests/fixtures/long-text.mjs` makes deterministic invented texts of any length with
  planted facts; `scripts/understanding-probe.mjs --long` measures it on the real model.
- `apps/web`: UI (native ES modules, no bundler) and the shared engine in `apps/web/src/engine` (also imported by the desktop main process).
- `apps/desktop`: Electron main, preload bridge, llama-server service, model manager/downloader, updater.
- `tests/`: `npm test` (node:test; engine + desktop services against a fake llama-server), `npm run test:ui` (Playwright, real UI).
- `scripts/`: runtime fetch, icon/logo generation, dev server. `docs/`: building, signing, architecture, status.

## The offline library (`engine/knowledge/`)
- Core entries (~180, `genres.js` etc.) load instantly; the large library (`knowledge/library/**`, thousands of records) loads in the background
  with `loadLibrary()` so first paint is never slowed. Records are plain data written to `library/README.md`'s spec and linted by
  `scripts/library-lint.mjs` / `tests/library.test.js` (no URLs, no section/page numbers, no quotes over 14 words, `asOf` + `confidence` on rules,
  real `works` on genres). `node scripts/build-library-index.mjs` regenerates `library/index.js` (the test fails if it is stale).
- NIE answers general craft/style/usage/work questions from it with the guide and edition, flags `varies`/`contested`, and when nothing matches says
  so instead of guessing (`answerFromLibrary`, `libraryReply`, `libraryMissReply`). Library knowledge is reference only: only the writer's own rules are enforced.
- It cannot be exhaustive and is not fully verified; never claim either. It was written with AI assistance and only spot-checked (a 220-claim sample; see docs/STATUS.md); coverage and the reliability note are shown in Settings (`libraryStats`). Retrieval is measured by `tests/fixtures/library-questions.json` (`scripts/library-probe.mjs` asks it anything). Works listed only inside other entries get derived lookup records (`derivedWorks`).

## Windows package
`.github/workflows/windows-package.yml` builds on a real Windows runner, smoke-tests the packaged exe with the real runtime + real Qwen
(`scripts/smoke-windows.mjs`), compiles the Inno Setup installer, silently installs it, smoke-tests the installed copy and uninstalls.
CI runs a NEWER Chromium than a dev container: it has caught real bugs (e.g. `File.bytes` is now a method). Read its logs before assuming a failure is flaky.

## Commands
`npm test` · `npm run test:ui` · `npm run dev:web` · `npm run icons` · `npm run fetch:runtime` · `npm run desktop` · `npm run build:desktop`

## Gotchas learned the hard way
- `llama-server` needs its *whole* runtime beside it (CPU backend DLL especially). `-c` is split between slots: with `-np 2` pass `-c` = window × 2 (8192) so each slot still has the full 4,096 tokens (`LlamaService`, `slots`). Two slots because NIE alternates a short reading prompt and a long answer prompt: with one slot each evicted the other's prompt cache every turn.
- Inputs must never be coverable by stale layers: setup is a `<dialog>`, the tour has its own overlay, and `ui/recovery.js` self-heals first.
- Node's `TextDecoder('windows-1252')` is really Latin-1: use `ingest/formats.js#decodeWin1252`.
- `speechSynthesis` is a read-only window property: mock it with `Object.defineProperty` in tests.
