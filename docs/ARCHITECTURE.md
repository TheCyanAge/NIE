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

## Holding everything in a project (the project mind)

The writer's complaint was that NIE forgets: what they said twenty messages ago, what they kept, what they decided was deliberate. A 3B model with a 4,096-token window cannot hold a
project in its head, so the project is held in code and the model is shown what bears on each message (`apps/web/src/engine/mind/`).

1. **What is kept** (`state.js`, `record.js`; `project.mind`). The writer's own statements, split into sentences, bounded (600 statements, 260 characters each), with their order.
   A question, a request, filler, a pasted text (400+ words) and a scene with quoted dialogue are not statements; at most 30 are taken from one message. Pasted text is held by the reading notes and the
   story text instead. Messages are numbered by the writer's messages (`Orchestrator#turnOf`), so "3 messages ago" is right even when two of the three were questions. A project saved before the mind existed has
   no `mind`: opening it remembers what the writer said in its conversation (`backfillMind` in `project/store.js`), once.
2. **Where it looks** (`sources.js`). Not just the statements: the idea sheet and its "also" details, ideas set aside, ideas kept, the Idea Board, characters, themes, motifs, the timeline,
   what was marked deliberate, the working premise, the writer's rules and the project profile. Every passage keeps where it came from.
3. **Finding what bears on a message** (`recall.js`). BM25 over those passages with the writer's own words only (no embeddings, no model call, so it is instant and works with no model),
   with light word families ("who" looks for people, "where" for places) and a per-source cap so one source cannot crowd out the rest. The result is a short block in the prompt
   and the same items on the reply (`meta.recalled`), shown under it as "What I remembered from earlier". The current message is excluded, and recall runs before the message is stored.
4. **Asking NIE what it holds** ("what do you remember about my story?", "what have I told you?"). Answered by code from the real contents (`describeMind`), never by the model,
   so it cannot claim to remember what was not recorded. The same list is on the Idea Board as "Everything NIE holds", where the writer can look through it and remove statements or kept ideas,
   or forget everything they said in chat.

Honest limits: recall is by words (with small word families, such as mum/mother and a question word's kind of answer), so "the thing she carries round her neck" will not find "she wears a compass"; the
600-statement cap drops the oldest; a short scene without dialogue, pasted with no question, cannot be told from a telling and is stored as statements; and what the model then does with a recalled item is still
up to a 3B model. A long pasted text is kept in full only for the newest paste (`compactOldPastes`): it stays the text that questions are about for the whole session (`#pastedText`), but an older paste is cut to its start,
and what is left of it is the reading notes, which are not searched by recall.

## Editorial instruments (counting what a small model cannot judge)

`apps/web/src/engine/editor/` measures a long text with ordinary code and hands the model facts, instead of asking it to find them in a window it cannot hold.
`analyseText` cuts the text into sections (the reading module's) and measures, per section: who appears and where (with aliases, and spellings that look like typos), pacing (section and chapter
lengths, dialogue share), tense and person and where they shift, repeated phrases, numbers given for the same thing in two places, a timeline of dated mentions, terms coined by the writer,
what the writer's own rules say about it, and the measured style. Only the first 120 sections are measured (the rest is said to be unmeasured), and the heuristics are English only.

- `editorialEvidence` picks the lines that bear on the question asked (a question about pacing gets pacing) and the model is shown them as "Measured from the text itself (counted by the program, not judged...)".
- `readbackFrame` is the answer to a text pasted with no question: what was counted, what stands out, and one question put to the writer in the second person. No model words it, so it cannot invent; it
  says exactly what was read (`didLine`), and a built-in reply claims no reading beyond that.
- `measuredAnswer` answers a question that is only about the counts (is it consistent about a number or a date, where do its dated entries run backwards, what tense and point of view, how does its pace run, what does
  it repeat, what terms does it coin) from the counts themselves: the lines that question is about (a question about the timeline is not answered with the figures), each with its sections, and the one question the
  finding raises, in the second person. No model is asked, and the reply says so (`meta.looked`). A question that asks for a judgment, an idea, a reason or a comparison ("is the pacing good?", "how does the memo differ?"),
  that names something no counted line is about, or that is about the cast, goes to the model, shown the same counts (`editorialEvidence`). Added because the real model, shown the counts, still answered with its own words.
- `groundNames` checks a model's answer about a text: a sentence naming a person, place or figure that appears nowhere in the text, the writer's messages, the project's memory or the measured facts is removed, and the reply says
  so. If nothing is left the reply is withheld with an honest note and built-in guidance. This was added because the real model invented names and numbers when asked about a long text.
- `findThirdPerson` catches "How does the writer maintain the reader's curiosity?" said to the writer. The prompt says "you", and a reply that still talks about "the writer" is asked for once more.

None of this judges quality or writes anything: it is counts, places in the text, and questions. Measured on the invented bible with its answer key and no model (`scripts/editor-probe.mjs`): all 8 of its people are
listed, one of its two planted inconsistencies is flagged (the water volume; the year of a runaway, given in a character note and in the dated entries, is missed), the backwards jump in its dated entries is found,
and 14 of its 24 defined terms are in the list of recurring terms. What it cannot do: `groundNames` checks names and numbers, so an invented set-up told in ordinary words ("plunged into danger without context") is kept;
the heuristics are English only; and a heading like "IV. Tide Table" is not recognised as one.

## The library, whole-subject profiles, and talking about them

`engine/knowledge/` holds the offline library: plain data records (genres, forms, techniques, movements, traditions, works, style-guide rules, usage, publishing practice) searched by a BM25-style index with name, keyword and body weights
(`searchScored`, `answerFromLibrary`: a match is `strong`, `weak` or `none`, and a miss says so instead of guessing). It is reference knowledge; only the writer's own rules are ever enforced.

**Profiles** (kind `profile`, `library/profiles/*.js`) are the whole-subject view of one genre, form, tradition or movement, one record per facet: history, subgenres, tropes, what readers expect, how it is built, how it differs from its neighbours,
landmark authors and works, pitfalls, vocabulary (`PROFILE_FACETS` in `knowledge/index.js`). A profile competes in search only when the question asks for its facet (`facetsAsked`), so "what is gothic fiction?" is still answered by the genre's own entry and
"what are the subgenres of gothic fiction?" by the profile. The lint holds profiles to a stricter standard than other records (nine facets per subject, a parent that exists, dated works whose years agree with the rest of the library; `scripts/library-lint.mjs`),
`tests/library-profiles.test.js` asks every facet of every profile its own question, and `scripts/library-profile-check.mjs --staging` does the same for a file before it is installed. Profiles are written by one agent and then checked by another that searches for each date,
title, author and "first" and corrects or removes what it cannot confirm (`docs/STATUS.md` says how many subjects have one and how that was checked: it is AI-written and checked, not verified entry by entry).

**Talking about it** (`knowledge/thread.js`, `thread-state.js`). After a library answer, `project.conversation.library` records the subject of the answer, which facets have been shown, and at which message. The thread is plain JSON in the project (sanitized in `project/store.js`, isolated and removed with it);
the module holds no state of its own. `resolveFollowUp` reads a short message against it: "what about its tropes?", "and the history?" (the library's record of that facet), "tell me more" / "what else?" (the rest of the overview, then each facet once, then a plain "that is everything I hold"),
"how is it different from romance?" (the two entries side by side, with the profile's own point for that neighbour), and, only when a model is running, a pronoun question the library cannot pick out ("why did it start in Britain?"), where the subject's records are put in front of the model.
A message that names another subject by its name, or a thing of its own ("how do I write dialogue?"), is not a follow-up; a thread is followed for three messages; idea cards end it (so "more" still means more ideas); a follow-up is never kept as something the writer told NIE. A facet the library has no record of is said plainly
("I don't have a separate entry on the tropes of the villanelle, and I won't guess"). Each library answer offers the facets not yet shown as chips. The answer to a direct question that the library matches strongly by an entry's own name, and to a follow-up in a thread, is the library's own text composed by code (`libraryReply`), with or without a model: the model reads the message, and does not retell the records. That is a measured decision, not a preference: an audit of the model's retelling against the records found a wrong or invented claim in 13 of 33 replies (`docs/STATUS.md`). A weaker match, a question with more in it than the subject ("... and would it suit a poem about my mother?", "in two sentences"), a pronoun question the library cannot pick out, a long text of the writer's in play, and an online model go to the model, shown the records, and its reply loses any sentence that names something, or states a year, decade, century or rhyme scheme, that the records do not hold (`groundNames` with `facts: true`). While a library conversation is open, a short factual question that names something the library holds stays a library question whatever label the model gave it (`#stillALibraryQuestion`). The writer's own message is never rewritten: only which record answers it is chosen.
`scripts/library-lab.mjs` (workflow `library-lab`) runs scripted conversations (`tests/fixtures/library-sessions.mjs`) on the real model and prints every full reply with the records on the subject (AUDIT-RECORDS / AUDIT-REPLY lines), so that someone other than the model can judge each claim against the records; its own count of replies naming something no record has re-runs the product's check on a reply that check has already cleaned, so it is not evidence of anything.

## Where things live

| Concern | Code |
| --- | --- |
| Narrative library (about 13,000 records incl. derived lookups; BM25-style search), whole-subject profiles, the thread of a conversation about the library | `apps/web/src/engine/knowledge/` (`thread.js`, `library/profiles/`) |
| Project profile + interpreter (fragmented, unreliable, surreal, clinical, nonfiction forms → what to treat as deliberate) | `engine/profile/` |
| Rule-based intent recognition (the fallback reader), working premise (adapts when the writer changes direction), form sniffing | `engine/intent/` |
| Project store: fresh-by-construction creation, full deletion, preferences | `engine/project/` |
| **Rules**: plain-language rule parsing, exact span checking, model judging by sentence number | `engine/rules/` |
| Full Scan: classified findings, observations, honest accounting (no score) | `engine/analysis/` |
| Orchestrator: the language model's reading of what the writer asks (`understand.js`), brainstorm, built-in guidance, prompt budgeting, no-write guard | `engine/orchestrator/` |
| Brainstorm idea partner: kinds (story, character, world, article, essay, poem, script), lenses, offline idea banks, genre blends, develop-an-idea, model-reply parsing | `engine/brainstorm/` |
| Reading a text of any length: sections, retrieval over the writer's own words, what the model is shown and what NIE says it looked at | `engine/reading/` |
| Project mind: what the writer said anywhere in the project, recalled by relevance with where each came from, listed and removable | `engine/mind/`, `ui/views/board.js` ("Everything NIE holds") |
| Editorial instruments: counted facts about a long text (cast, pacing, voice, figures, timeline, the writer's rules), the read-back, grounding of replies | `engine/editor/` |
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
Everything NIE learns about a project lives inside that project's object (`project.mind`, `project.conversation.agent`, `project.readingNotes`, the Idea Board), so it is saved with it, comes back when it
is opened, and goes when it is deleted. The mind and editor modules hold no state of their own: each call is a function of the project it is given. What the orchestrator caches
from a text (reading indexes, measured analyses, grounding vocabularies) is keyed by the exact text and cleared on every switch (`Orchestrator.reset`, `clearIndexes`).

## Looking things up on the web (optional)

NIE can answer a factual question from the live web with numbered sources. It is **off until the writer turns it on in Settings** and offline use stays fully offline.

- `engine/web/` is one door, `createWebService({ fetch, getConfig })`: `status()`, `search(query)`, `read(url)`, `test()`. The desktop main process builds it with Node's `fetch` and the stored configuration (the key is encrypted with the OS keystore like the online provider's key and never reaches the renderer); the renderer reaches it through the `NIE_WEB` preload bridge (`web/bridge.js`). The browser build has `createNoWeb()`.
- **One setting for any service.** `providers.js` has adapters for Tavily, Brave Search, Serper and SearXNG, plus `custom` (an address with `{query}`, a header, an optional body and the names of the result fields) so any JSON search API works. A pasted key is told apart by its shape (`tvly-`, `BSA`, 40 hex characters, an https address). The request formats are the services' documented ones, taken from their public documentation through search summaries; they have **not** been exercised against the live services from the development environment (its network policy blocks them), only against fake responses.
- **Any model can use it.** The orchestrator (`#web`) does not care which model answers: the offline model, the online model, or none. `webMessages` gives the model numbered sources (page text when a page could be read, the search snippet otherwise), sized for the offline model's 4,096-token window, and tells it to answer from them only, to cite `[n]`, to treat them as untrusted, and not to write for the writer. With no model, or when nothing of its answer survives, the results are shown as they came (`state: 'results-only'`).
- **What leaves the computer.** The search service gets the words of the writer's question (at most 24 words; a pasted text is never sent; the query is shown under the reply) and the pages it returned are fetched. The project, the manuscript and earlier messages are not sent to the search service. An online model, if that is what answers, also receives the question and the web text, and the reply says roughly how many words. Pages are fetched only over https from public host names (never localhost, a private address or an IP literal), redirects are followed by hand and each hop checked, size and time are capped (`page.js`). A host name that resolves to a private address is not caught; that is why only pages a search service returned are fetched.
- **Checks on the answer** (`answer.js#verifyAnswer`, the same grounding as library answers): a citation mark that points at no source is dropped, and a sentence that names something, or states a year or a number, that no source holds is removed. Nothing is added or reworded, and the reply says when a sentence was left out. The check cannot see a claim made of ordinary words that is simply not in the sources.
- **When it runs** (`orchestrator#webAsk`, before the idea agent so a web question is never filed as part of the idea, and never remembered as something the writer told NIE): the writer says so ("search the web for ...", "look up ...", "google ...", rules in `web/ask.js`), or the Web switch is on and the message is a factual question that is not about their own story, ideas, feedback or small talk. "with sources" alone only asks for the web when it is set up. A request to write is declined first, with or without the web: "search the web and write me a scene" is declined. The reading prompt is unchanged.
- A short follow-up ("and when was it built?") is made into a search of its own: a model rewrites it from the last web question (and is not believed if the rewrite shares no word with either), otherwise the words are joined.

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

## Talking like a person

A writer typed "hey" in Brainstorm and NIE answered about a "thanks" that was never there. The cause was several things at once, not one bug: a hello was steered by craft notes found by plain word
matching, by a brief that told the model to point at "one specific detail" the writer gave (there was none), and by an enforcement step that swapped any comment that added anything for a canned
acknowledgement. Measured on the real model with `scripts/talk-lab.mjs` (eleven scripted conversations, 45 replies, printed with the message before each) and judged by a reviewer other than the model,
the same causes showed up everywhere a message only makes sense in the conversation: "yes", "the second one", "that's cliche", "go back to the first thing you said".

- **Small talk** (`orchestrator/smalltalk.js`). Greetings, thanks, "how are you?", "ok cool", goodbyes and plain tiredness are read by the rules (or by the model's `chat` reading of a short message) and answered on their own:
  the earlier conversation, one instruction chosen by what kind of small talk it is, and, only when the writer has told NIE what they are making, those words offered as something NIE MAY mention. No library notes, no recall, no
  idea sheet. The reply is checked in code (`holdSmallTalk`: short, no list, one question at most, no remark about the message, no name or quoted word the writer never used); a reply that fails, or no model, gets NIE's own line
  (`smallTalkFallback`), chosen by what the writer said. Nothing is recorded in the idea sheet or the project's mind.
- **A reply to NIE** (`orchestrator/replyto.js`). A short message after NIE's reply is told what it replies to (NIE's last words), what kind of reply it looks like (agree, push back, ask why, go back), and for "the second one" /
  "that last one" / "number 3" which item is meant, settled in code from the cards the writer sees (the screen numbers them by position, whatever numbers the model wrote). Such a reaction is never filed under "Also" and never
  remembered as something the writer told NIE (`isReaction`; the agent treats it as a question). When the model labels it "unclear", "tell" or "chat" the label is overruled to "develop" and recorded.
- **Genuine suggestions**. A turn that does not ask answers what the writer said and may add ONE suggestion that NIE says is its own: it begins "What if", "You could", "Maybe" or "One angle" (`isSuggestion`). The model is not allowed to
  state anything about the story that the writer did not say (that was NIE writing their idea, and is why the instruction used to forbid adding anything at all); a suggestion says it is NIE's, so it may bring new things. `holdToPlan`
  keeps it and removes, one sentence at a time, anything else that brings imagery of its own, a quoted line of dialogue, and stacked questions; only when nothing is left does the canned acknowledgement stand in, after one more try
  that says why. Nothing here drafts the writer's text.
- **Notes**. A library note enters a story conversation only when it is a technique, structure, genre, form or movement that matches strongly and covers the message (`storyNotes`);
- **Known wrong readings** of a 3B model are overruled and recorded in `understood.overruled`: a writer with nothing yet ("I want to write something but I don't know what") is read as ideas and given a human line and a few sparks; someone
  doing something ("a girl who can hear the dead") is a story, so NIE does not open with "what are you making: a story, a poem, an article...?".

## Following an idea (the idea agent)

Brainstorm is an agent in the plain sense: it keeps a record of what the writer has said about the idea they are on, decides each turn whether to ask something, asks one
thing at a time about THIS idea, and offers to keep the idea once it has enough. Everything that decides is code (`apps/web/src/engine/agent/`); the model only words
things, and the whole agent works with no model.

1. **The sheet** (`state.js`, `sheet.js`; stored at `project.conversation.agent`, removed with the project). One value per part of the idea (premise, main character,
   what they want, what stands in the way...), each the writer's own words lifted from what they said, never NIE's paraphrase; details that fit no part sit under "Also".
   The panel on the Idea Board shows the sheet, and the writer can edit or remove any part.
2. **What parts there are** (`agent/packs/`): data, not code. Eight kind packs (story, character, world, article, essay and memoir, poem, script, other) give the parts,
   what each means (a hint the extractor shows the model), which come first, and a bank of 8 or more differently shaped questions per part. Add-on packs for 37 forms (a song,
   a picture book, a speech, a sonnet, a memoir, a podcast...) and 42 genres (a cozy mystery, a locked-room mystery, a space opera, a coming-of-age story...) are merged in when the writer's words match
   (`detect.js`; a keyword matches in any form of the verb, so "writing a speech" finds "write a speech"). Whatever the packs do not name, the offline library's own notes on the genre or form reach the model through the
   brief (`libraryNotes`), and the kind pack still applies. `packs/schema.js` and
   `tests/agent-packs.test.js` validate every question: one question, plain speech, no praise, no stock steering, nothing that asks the writer to produce text.
3. **Reading what the writer said** (`extract.js`). With a model: schema-constrained JSON (`purpose: 'extract'`), then GROUNDED: a value is kept only if its words are the
   writer's. Without one, rules route sentences that say what they are for ("the ending is...", "Corin is against her", "she wants to..."), an answer goes to the part that
   was asked about, and a story statement that fits nothing is kept under "Also". A question, a request, a pasted text or "I don't know" is never recorded as the idea.
4. **Deciding the turn** (`plan.js`). Asks on about half the turns, never three in a row, with the gap varying (like a person); the first turn asks; "ask me more" and "stop
   asking questions" are obeyed; the next question is for the next unfilled part whose prerequisites are known, easier after a short answer, never one already asked (or alike).
5. **Wording it** (`ask.js`, `brief.js`, `reply.js`). The model is given a small brief: what is known, what is not, the conventions of the genre from the offline library,
   the questions already asked, and this turn's job. Its reply is then held to the plan (`enforceReply`: at most one question, the planned one if the model's names nothing of
   this session, none on a turn that does not ask) and the question actually shown is recorded. With no model, a short acknowledgement of what was recorded plus the
   planned question is the whole reply.
6. **Keeping it** (`commit.js`). When the core parts (by weight) are known, NIE shows a recap in the writer's words, says what is still open, and asks whether to keep it
   on the Idea Board and in project memory (characters, themes, motifs, setting). The writer can say yes, add or change anything first, or not yet (no new offer for a few turns);
   "remember this" at any time keeps what there is and says what is missing; a new idea sets the old one aside (nothing is lost) and it can be brought back or kept.
   A keep can be taken back: exactly the memory it added is removed.

Honest limits: a 3B model cannot match what large hosted assistants do with a long conversation. What brings NIE closer is the scaffold: a record that cannot drift, a planner
that cannot get bored or pushy, questions written by hand for each kind of piece, and checks on every reply. `scripts/agent-lab.mjs` (workflow `agent-lab`) plays scripted writers
against the real model and reports how often it asks, whether it repeats itself, whether its questions are about the idea, whether its sheet holds what was said, and what a turn costs.

