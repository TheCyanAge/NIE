# NIE: notes for AI assistants and contributors

## Non-negotiable product rules
1. **NIE never writes or edits the writer's text.** No rewrites, no replacement wording, no drafted prose or dialogue.
   Full Scan only *locates* (exact character ranges) and *explains briefly* where text breaks the writer's own rules.
   Brainstorm is an idea partner: it offers *concepts* (a what-if, an angle, a complication, a question), never manuscript prose,
   dialogue, a ready-to-paste headline/line, or an edit. Requests to write/rewrite are declined deterministically before any model
   call (`engine/orchestrator/builtin.js`, `guard.js`); "give me twists/ideas/premises" is *not* such a request, "write a scene with
   twists" is (`intent/intent.js`, `brainstorm/commands.js`). The idea banks (`engine/brainstorm/banks/*.js`) are validated by
   `tests/brainstorm-banks.test.js` (no quotes, no digits, no narration, length limits). Do not weaken any of this.
2. **One NIE.** Online model, offline model and built-in guidance are routing, never separate assistants (`engine/ai/engine.js`).
   The model chooser lives in Settings only. Offline status strings are exact and must stay truthful.
3. **Project isolation.** New project = factory-fresh; delete = every key under the project prefix removed; transient session state is
   rebuilt on every switch (`ui/app.js`). NIE's narrative knowledge library is code, not project data.
4. **Intent over rules.** A flag is not a mistake: findings are classed hard / likely / possible / stylistic / intentional / strength,
   and the profile interpreter (`engine/profile/interpret.js`) demotes things the writer declared deliberate. No single quality score.
5. **Never fake readiness.** A file existing is not a working model; offline rule checks that need meaning say "needs the language model".

## Layout
- Brainstorm: `engine/brainstorm/` (lenses = what to push on, kinds = what is being made, offline idea banks + seeded selection that never
  repeats until a lens is exhausted, `ideas.js` also parses a model's numbered list into cards and drops over-long "ideas"). The Idea
  Board is project data (`project.brainstorm`, `project/board.js`): isolated, deleted with the project, never edited by NIE.
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
- `llama-server` needs its *whole* runtime beside it (CPU backend DLL especially). Pass `-np 1` or the context is split across slots.
- Inputs must never be coverable by stale layers: setup is a `<dialog>`, the tour has its own overlay, and `ui/recovery.js` self-heals first.
- Node's `TextDecoder('windows-1252')` is really Latin-1: use `ingest/formats.js#decodeWin1252`.
- `speechSynthesis` is a read-only window property: mock it with `Object.defineProperty` in tests.
