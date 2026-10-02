# NIE: notes for AI assistants and contributors

## Non-negotiable product rules
1. **NIE never writes or edits the writer's text.** No rewrites, no replacement wording, no drafted prose or dialogue.
   Full Scan only *locates* (exact character ranges) and *explains briefly* where text breaks the writer's own rules.
   Brainstorm is conversation about ideas; requests to write/rewrite are declined deterministically before any model call
   (`engine/orchestrator/builtin.js`, `guard.js`). Tests enforce this: do not weaken them.
2. **One NIE.** Online model, offline model and built-in guidance are routing, never separate assistants (`engine/ai/engine.js`).
   The model chooser lives in Settings only. Offline status strings are exact and must stay truthful.
3. **Project isolation.** New project = factory-fresh; delete = every key under the project prefix removed; transient session state is
   rebuilt on every switch (`ui/app.js`). NIE's narrative knowledge library is code, not project data.
4. **Intent over rules.** A flag is not a mistake: findings are classed hard / likely / possible / stylistic / intentional / strength,
   and the profile interpreter (`engine/profile/interpret.js`) demotes things the writer declared deliberate. No single quality score.
5. **Never fake readiness.** A file existing is not a working model; offline rule checks that need meaning say "needs the language model".

## Layout
- `apps/web`: UI (native ES modules, no bundler) and the shared engine in `apps/web/src/engine` (also imported by the desktop main process).
- `apps/desktop`: Electron main, preload bridge, llama-server service, model manager/downloader, updater.
- `tests/`: `npm test` (node:test; engine + desktop services against a fake llama-server), `npm run test:ui` (Playwright, real UI).
- `scripts/`: runtime fetch, icon/logo generation, dev server. `docs/`: building, signing, architecture, status.

## Commands
`npm test` · `npm run test:ui` · `npm run dev:web` · `npm run icons` · `npm run fetch:runtime` · `npm run desktop` · `npm run build:desktop`

## Gotchas learned the hard way
- `llama-server` needs its *whole* runtime beside it (CPU backend DLL especially). Pass `-np 1` or the context is split across slots.
- Inputs must never be coverable by stale layers: setup is a `<dialog>`, the tour has its own overlay, and `ui/recovery.js` self-heals first.
- Node's `TextDecoder('windows-1252')` is really Latin-1: use `ingest/formats.js#decodeWin1252`.
- `speechSynthesis` is a read-only window property: mock it with `Object.defineProperty` in tests.
