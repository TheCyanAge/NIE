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
   lies in exactly one section; nothing is rewritten. Each section has a hash of its own text.
2. `reading/context.js` indexes the sections (BM25 over the writer's own words, names weighted up; 150,000 words indexes in well under a second) and finds the
   sections that best match a message (cut around the matching sentence). Questions about the ending, the opening or the middle are recognised, and a question
   that compares parts ("does X say the same everywhere?") gets several passages word for word.
3. `reading/notes.js` READS the text: for a question about the whole text, feedback, or a paste with no ask, the local model reads every section in turn
   (schema-constrained JSON: gist, names, terms, voice; about 12 seconds a section on a slow 2-thread CPU, so about 5 minutes for 10,000 words; progress and
   an ETA are shown and Stop keeps what was read). Grounding is enforced: a name, term or capitalised word in a note must occur in that section, the overview
   may only name things the notes name. Notes are cached by section hash in `project.readingNotes` (bounded, derived, removed with the project), so a text is
   read once and an edit re-reads only the sections that changed. `reading/style.js` measures point of view, tense, sentence and paragraph shape, dialogue
   share, register and structure from the text with plain word lists (no model).
4. What the model is then shown (`context.js#notesBlock`): the overview, the measured style, ONE LINE ON EVERY SECTION (what it says, who is in it) and the
   closest passages word for word. A single-fact question is answered from the closest passages (nothing is read for it; notes made earlier are still used).
   A text over 60 sections is not read through; it is searched, as before.
5. `orchestrator` decides which long text a message is about: a long paste (its short first or last paragraph is the ask), a follow-up soon after one, the
   project's Story Text, or any question whose own words are found strongly in that text (it need not say "my story"). Craft questions that do not match the text
   and questions about NIE never pull the writer's text in.
6. The reply says what was looked at ("I read it one section at a time and kept a short note on each. For this answer I used my notes on every section and looked
   closely at sections 1, 12 and 29"), the numbers are recorded on the message, and the sidebar says how NIE reads the text. A built-in (no model) reply claims no
   reading; an online model's reply says roughly how many words of the text were sent to the provider.

Honest limits: the model holds one section at a time, so what it keeps is a short note per section plus the passages shown with a question; a question that needs
two distant passages side by side is answered from the best matches. Notes can miss detail (names recalled about 86% of the time, defined terms about 83% in the
lab) and the replies say they are NIE's own notes. Understanding is the 3B model's job; finding and checking are code.

## Sounding different each time

A small model copies the shape of its own earlier replies, which made every reply open with praise, give a numbered list and end with the same stock question.
`orchestrator/variety.js` and the brainstorm prompt change that at four points: the prompt forbids praise openers, announcing what is about to happen, and more than
one question; each turn gets a different reply shape (never the last two used); NIE's own earlier replies are scrubbed of praise and stock questions in the model's
history, and an avoid-list names the openers used lately and the questions already asked; and every reply is cleaned (`refine` only removes: a praise opener, a stock
or repeated question) with one retry when it clearly repeats itself. `scripts/notes-lab.mjs --variety` measures it against the earlier wording on the real model.
