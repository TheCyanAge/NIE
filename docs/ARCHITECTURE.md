# Architecture

```
NIE UI (apps/web)  ──►  Orchestrator  ──►  AIEngine  ──►  online provider (optional)
 Full Scan | Brainstorm | Read           │              └─►  local model service ──► llama-server ──► Qwen2.5 3B
 Projects  | Settings                    │              └─►  built-in guidance (no model needed)
                                         ▼
        Project memory · Profile + interpreter · Rules checker · Narrative library · Intent
```

Qwen is the language model. The narrative library is the knowledge. The project profile is the context. Project memory is the
continuity. Intent / style / pattern interpretation is the reading. NIE is the unified result.

## Where things live

| Concern | Code |
| --- | --- |
| Narrative library (≈180 genres, structures, styles, forms, techniques; BM25-style search) | `apps/web/src/engine/knowledge/` |
| Project profile + interpreter (fragmented, unreliable, surreal, clinical, nonfiction forms → what to treat as deliberate) | `engine/profile/` |
| Intent recognition, working premise (adapts when the writer changes direction), form sniffing | `engine/intent/` |
| Project store: fresh-by-construction creation, full deletion, preferences | `engine/project/` |
| **Rules**: plain-language rule parsing, exact span checking, model judging by sentence number | `engine/rules/` |
| Full Scan: classified findings, observations, honest accounting (no score) | `engine/analysis/` |
| Orchestrator: brainstorm, built-in guidance, prompt budgeting, no-write guard | `engine/orchestrator/` |
| Brainstorm idea partner: kinds (story, character, world, article, essay, poem, script), lenses, offline idea banks, genre blends, develop-an-idea, model-reply parsing | `engine/brainstorm/` |
| Idea Board (kept ideas, notes, export), per project | `engine/project/board.js`, `ui/views/board.js` |
| AI routing, OpenAI-compatible client with streaming, bridges | `engine/ai/` |
| File ingestion (zero-dependency ZIP/DOCX/ODT/EPUB/RTF/HTML/MD/PDF) in a Web Worker | `engine/ingest/` |
| Read-aloud (chunking, pause/resume, section navigation) | `engine/readaloud/` |
| UI (vanilla ES modules): views, tour, input guard/recovery, setup dialog | `apps/web/src/ui/` |
| Electron main, preload bridge, runtime/model validation, persistent llama-server, downloader, updater | `apps/desktop/` |

## How "never writes or edits" is enforced

1. Rule violations are `{start, end}` ranges into the writer's text plus a brief reason; findings have no replacement field.
2. For meaning-based rules the model is shown **numbered sentences** and may only answer with numbers and a short reason; each number maps back
   to a range in the writer's own text, so a hallucinated quote cannot even be highlighted (`rules/judge.js`).
3. Brainstorm requests to write/rewrite are recognised (`intent/intent.js`) and declined without calling a model; the system prompt forbids drafting;
   `orchestrator/guard.js` strips any long composed passage from a reply that isn't the writer's own words.
4. Brainstorm ideas are concepts by construction: the offline banks are linted (`tests/brainstorm-banks.test.js`: no quotation marks, digits or
   narration, 12-40 word concepts), a model's idea list is parsed into cards and any item over 60 words is dropped (never edited), and
   the idea instruction goes in the user turn so the system prompt stays identical between turns and llama.cpp can reuse its prompt cache.

## Project isolation

`ProjectStore.create()` always builds from a factory; `delete()` removes every key under the project's prefix; the app replaces `project`
**and** the transient `session` on every switch and every view rebuilds from scratch. NIE's library is code, not stored data, so it is untouched.

## Offline model

`LocalModelManager` → locate model (bundled → downloaded; an explicit choice is never silently replaced) → download if missing (resumable, header + size
verified) → `LlamaService` validates the *whole* runtime, starts `llama-server` with its folder as cwd and on PATH, waits for `/health`, and then proves the model
replies before reporting **ready**. Failures surface the real cause ("no backends are loaded" → missing CPU backend).

## UI robustness

Setup is a `<dialog>` (display:none when closed); the tour owns a separate overlay that is emptied when it ends; `ui/recovery.js` checks the current
mode's input can actually be clicked, self-heals stray layers first, counts *recurring* blockers, and only then offers Recovery Mode (a top-layer popover).
