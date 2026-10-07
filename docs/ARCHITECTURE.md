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
| Rule-based intent recognition (the fallback reader), working premise (adapts when the writer changes direction), form sniffing | `engine/intent/` |
| Project store: fresh-by-construction creation, full deletion, preferences | `engine/project/` |
| **Rules**: plain-language rule parsing, exact span checking, model judging by sentence number | `engine/rules/` |
| Full Scan: classified findings, observations, honest accounting (no score) | `engine/analysis/` |
| Orchestrator: the language model's reading of what the writer asks (`understand.js`), brainstorm, built-in guidance, prompt budgeting, no-write guard | `engine/orchestrator/` |
| Brainstorm idea partner: kinds (story, character, world, article, essay, poem, script), lenses, offline idea banks, genre blends, develop-an-idea, model-reply parsing | `engine/brainstorm/` |
| Reading a text of any length: sections, retrieval over the writer's own words, what the model is shown and what NIE says it looked at | `engine/reading/` |
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
3. Brainstorm requests to write/rewrite are recognised (`intent/intent.js`) and declined without calling a model; when a model is running it also
   reads every other message (`orchestrator/understand.js`: a label and a topic as schema-constrained JSON, never prose) and a `write`/`edit`
   reading gets the same fixed decline, which catches the phrasings the rules miss; the system prompt forbids drafting;
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

## Reading a text of any length

The offline model reads 4,096 tokens at a time (about 3,000 words), and NIE's own instructions, the project's notes and the reply share that window.
A text longer than what is left used to be cut off after its first part. Now nothing is dropped and nothing is claimed that did not happen:

1. `reading/sections.js` cuts the text into sections (~2,200 characters) at its own structure: chapter headings, paragraphs, sentence ends. Every character
   lies in exactly one section; nothing is rewritten.
2. `reading/context.js` indexes the sections (BM25 over the writer's own words, names weighted up; 150,000 words indexes in well under a second) and, for each
   message, builds what the model sees within the window: an outline of the whole text, the opening, the sections that best match the question (cut around the
   matching sentence, not blindly from the start), and the most recent part. Questions about the ending, the opening or the middle are recognised.
3. `orchestrator` decides which long text a message is about: a long paste (its short first or last paragraph is the ask), a follow-up soon after one, or the
   project's Story Text for questions about the writer's own work. Craft questions and questions about NIE never pull the writer's text in.
4. The reply says what was looked at ("I can't hold all of that in mind at once, so for this I looked closely at sections 1, 128 and 129 ... and skimmed an
   outline of the rest"), the sections are recorded on the message, and the sidebar says how NIE reads the text. A built-in (no model) reply claims no reading.

Honest limits: the model still sees only a few thousand tokens per message, so a question that needs the whole text at once ("list every place X appears")
is answered from the best matches and the outline, and NIE says so. Finding a passage needs no model and is instant; understanding it is the 3B model's job.

