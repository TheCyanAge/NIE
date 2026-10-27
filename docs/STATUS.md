# Status against the specification

Legend: ✅ built and tested here · 🟡 built, needs verification on Windows / real hardware · ⬜ not built yet

| Spec | What | Status |
| --- | --- | --- |
| 1–2, 5–7 | Narrative knowledge library (genres, structures, styles, forms, techniques) | ✅ ≈180 entries, searchable; **seed content, to be grown** |
| 3, 28 | One NIE identity; model chooser only in Settings | ✅ |
| 4 | "Wiki of storytelling" depth | ✅ a large offline library (style-guide rules, usage, formats, genres with example works, forms, devices, movements, traditions, works, publishing): ≈10,400 written entries (873 of them whole-subject profile records) plus ≈2,600 derived lookup records (≈13,000 in all) for works listed inside other entries. Every entry is linted, authors/years are cross-checked across files, and strong/weak/none retrieval is measured on a 140-question fixture. 🟡 **Accuracy: written with AI assistance and not verified entry by entry.** A 220-claim sample checked against the web found no outright errors and 5 imprecise claims (now fixed), but many of those checks were from knowledge rather than a source. The Settings page says so. It can never be literally exhaustive, so NIE cites guide + edition and says when something is not covered |
| 8, 16–17 | Intent recognition; adaptive, conversational Brainstorm | ✅ rule-based intent + working premise; richer with the model |
| 9–12 | Project / profile contexts, profile-driven interpretation | ✅ |
| 10, 52–56 | Project isolation, New/Delete project | ✅ (unit + UI tests) |
| 13–14, 57–61 | Full Scan: classes, no meaningless score, patterns, intent-aware | ✅ **Now centred on the writer's own rules** (see below) |
| **new** | NIE never creates/edits text; finds rule violations, highlights WHERE, explains briefly why | ✅ |
| 15, 44, 62–64 | Brainstorm, helps from zero, starter hint only once, contextual suggestions | ✅ |
| **new** | Brainstorm as an idea partner for any literary project (stories, characters, worlds, articles, essays, poems, scripts): kind picker, quick lenses, offline idea banks, genre blends, develop-an-idea, per-project Idea Board, "remember this" / "show my idea board" | ✅ unit + UI tests. 🟡 the offline banks are hand-written seed content (hundreds of ideas), not a model: with the language model running, ideas are far more specific to the project |
| 18, 77 | "NIE is thinking 🪶📜..." with waving dots | ✅ |
| 19–22, 65–68 | Read mode: any supported format → Story Text → scan | ✅ TXT/MD/HTML/RTF/DOCX/ODT/EPUB; PDF basic (text PDFs; no OCR) |
| 66 | Read aloud (pause/resume/section navigation) | ✅ logic + UI against a mock synthesiser; 🟡 real Windows voices |
| 23–25, 29–32 | Electron app, llama runtime packaging, validation | ✅ services tested against a fake llama-server; ✅ the packaged exe, real llama.cpp runtime and real Qwen model start and answer on a real Windows runner (CI smoke test) |
| 26–27, 70–72 | Offline-first, persistent server, non-blocking startup, auto download | ✅ logic; 🟡 end-to-end on a real install |
| 33 | Honest Starting / Ready / Failed wording | ✅ exact strings, tested |
| 34–36 | Inno Setup installer, shortcuts | ✅ built by the `windows-package` workflow on a real Windows runner, silently installed into the default per-user folder (desktop shortcut target checked), the installed copy smoke-tested with the real model, then uninstalled cleanly (files, shortcuts, registry). 🟡 not yet tested on a clean consumer PC; unsigned, so SmartScreen warns |
| 37–38 | Multi-size icon, new latte-cream logo | ✅ ICO verified (256/128/64/48/32/16, small sizes simplified) |
| (new) | Web search with numbered sources (optional, off by default; one setting for Tavily, Brave, Serper, SearXNG or any JSON search API) | ✅ engine, orchestrator route and desktop wiring tested against fake responses and fake models (what leaves the computer, the checks on the answer, every failure kind, Stop, no model, an online model); 🟡 **not run against the live search services** (the development environment cannot reach them; the request formats come from their public documentation); 🟡 not measured on the real offline model, so how well a 3B model writes from sources is unknown |
| 39 | Code signing | 🟡 documented (`docs/WINDOWS_SIGNING.md`); needs a certificate |
| 40–41 | Updater with honest "not configured" | ✅ logic tested; 🟡 live updates need GitHub owner/repo + signed releases |
| 42–51 | Three modes, tour with spotlight, separate onboarding/tour, persisted preference, Help → Tour | ✅ (UI tests check geometry, non-interactivity, cleanup) |
| 73–76 | Input safety, self-healing guard, Safe Recovery, quiet/throttled diagnostics | ✅ |
| 69, 72 | Performance (no needless rebuilds, workers, kept-alive model) | ✅ by design; 🟡 not profiled on real hardware |
| 78 | Settings (AI, updates, tour, application) | ✅ |
| **new** | The language model reads every message first (what is the writer asking?), with the rules as the fallback; every reply records who understood it | ✅ unit + UI tests; ✅ **measured on the real Qwen model** (below) |
| **new** | Any length of text: a long paste or a long Story Text is cut into sections at the writer's own structure, ranked against the question, and the model is shown an outline sample, the opening, the best matches and the latest part; the reply says exactly what was looked at | ✅ unit + UI tests; ✅ **measured on the real model** (below). 🟡 slow on a slow CPU; see Known limits |
| **new** | Brainstorm follows an idea like an interviewer: a sheet of what the writer said (their own words), questions asked now and then, one at a time, never twice, about this idea; a recap and an offer to keep it on the Idea Board and in project memory (the writer can add details first, say not yet, or keep it part-way); a new idea sets the old one aside | ✅ unit + UI tests with no model and with a scripted one; 🟡 real-model numbers in the `agent-lab` workflow (below) |
| **new** | NIE holds everything said or built in a project (the writer's statements, the idea sheet, kept and set-aside ideas, characters, themes, rules...), finds what bears on each message, shows what it drew on, can say and list what it holds, and keeps each project's mind separate; a pasted text gets a read-back built from counts and is not forgotten after twelve messages | ✅ unit + UI tests (isolation across switch, reload, delete; old projects backfilled); ✅ **measured on the real model** (below). 🟡 recall is by words, not meaning |
| **new** | Editorial instruments: counted facts about a long text (cast, pacing, voice, figures, dated entries, repeats, terms, the writer's rules) given to the model, exact answers to questions that are about the counts, a check that a reply names only what the text names | ✅ unit tests; ✅ measured against the story bible's answer key with no model (`scripts/editor-probe.mjs`) and on the real model (below) |
| 82 | "Human-level" narrative reasoning | ⬜ aspirational: depends on the model and a much larger library |

## Measured on the real model
Everything here was measured with the real Qwen2.5-3B-Instruct (Q4_K_M) on GitHub's Linux runner (`understanding-eval` workflow, `scripts/understanding-probe.mjs`),
not with a fake. Runner speed varies a lot from run to run, so only same-run comparisons mean much.

**Understanding what the writer asks** (260 labelled messages in `tests/fixtures/understanding-messages.json`, 10 kinds of ask):
- Task read correctly: **78.5%** with the model, against 28.5% for the old rules alone; 69.0% on the hard cases; 75.6% when there is chat history.
- Requests to write or edit the writer's text recognised and declined: **98.1%** (the old rules: 51.9%).
- The cost: **1.9%** of ordinary requests are wrongly taken for a write/edit request and declined (the old rules: 0.5%). The first version was 11.3%; a message is now
  only declined as a write/edit request if it also contains a request (`looksLikeARequest`). A wrong label mostly makes NIE decline too often or answer in the wrong style;
  every model reply still passes the reply guard (`guardReply`) that withholds prose written for the writer.
- About one second per message for the reading step (a short, schema-constrained answer).
- Two model slots (`-np 2`, one for the short reading prompt and one for the long answer prompt) were about 7% faster than one on the same machine, so they stay.

**Reading long texts** (invented texts with six planted facts, asked as questions; `--long`):
- Facts found, old way (the first part only) against the new way: 8,040 words **0/6 → 6/6**; 39,907 words **0/6 → 6/6**; 146,731 words **0/6 → 6/6**.
  Before the "answer from the text, name the section" instruction the same test found only 3 to 5 of 6, so that instruction is part of the design, not a detail.
- The largest prompt was about 2,100 tokens, inside the 4,096-token window.
- It is slower: about 43 to 55 seconds for an answer against 12 to 14 seconds for the old first-part reading, because more of the text is read first (CPU prefill is
  the bottleneck). A whole 8,117-word paste through the full path (reading step plus answer) took about 100 seconds on that runner.
- Six facts in three invented texts is a small test. It shows the method works, not that every question about a long text will be answered correctly.

**Reading a 10,000-word invented story bible one section at a time, and sounding different** (`notes-lab` workflow, 2 CPU threads, `scripts/notes-lab.mjs`):
- The notes pass reads 25 sections in about 7 to 8 minutes (median 18 s per section, 15 tokens a second writing); every section gets a short note (gist, names, terms, voice) kept with the
  project, so the second question costs nothing extra. Names the notes caught: **86%** of people who appear at least twice in a section; defined terms caught in the section that defines them: **79 to 83%**.
  The one-paragraph overview names only about one in eight of the cast, so NIE does not rely on it for "who is in this" (the per-section notes and the measured recurring names carry that).
- Putting the notes block at the end of the system prompt lets the server reuse it between turns: about 1,580 of ~2,200 prompt tokens were served from its cache, and an answer
  took 26 to 43 s instead of 60 to 110 s on the same machine. NIE's token estimate is about 16 to 18% above the real count, so it errs on the safe side.
- Answers to the bible's questions that mention what they should: **2 of 6 either way** in the small run (one question per kind); lookup and style questions are answered correctly, whole-text,
  timeline and contradiction questions are where a 3B model still falls short. The notes do not fix that; they are what makes the answer come from the whole text rather than the first part.
- Sounding the same: with the earlier prompt wording alone, a ten-message conversation had 3 praise openers, 1 stock question and 1 question asked twice; with the full change
  (different reply shape each turn, an avoid-list, history scrubbed of praise, replies cleaned) it had **0, 0 and 0**.

**Following an idea like an interviewer** (`agent-lab` workflow, `scripts/agent-lab.mjs`, four scripted writers: a cozy mystery, a character, a folk song, an article; about 40 messages in all; 2 CPU threads; four runs, the last on the final design):
- Asking: **ask rate 0.58** over the turns where the writer told NIE something (a question about every other turn, not every turn), three questions in a row in one session of four (a clear statement the model
  had read as "unclear" got a clarifying question; fixed since), **no reply with two questions**, **no question asked twice**, no stock "what do you think?" question, and 15 of 16 questions in the three sessions
  that print it share words with the writer's own idea. The first run asked 0.55; a second, after one wording change in the brief, asked on every turn (a 3B model told to say what a detail "makes you wonder" writes a
  question), so the planner and a check on the reply now keep a turn that must not ask from asking, whatever the model writes.
- Remembering: **8/8, 6/6, 5/6 and 6/7** of the things the writers planted were on the sheet at the end (the first run: 6/8, 5/6, 3/6, 5/7). Nothing on the sheet was a word the writer had not said.
  Missed: "I want the listener to feel proud and sad" (read as a craft question) and a point made in a long sentence.
- Not making things up: the first full runs showed short comments inventing story imagery ("the singer's eyes are fixed on the mill's smokestacks"): a line of story the writer never wrote. A comment is now
  kept only if its content words are the writer's own, the vocabulary of the idea's parts, or plain craft words; otherwise it is cut and NIE says what it recorded (or keeps only its question).
- Offering: the offer to keep the idea came at message 9 or 10 in the three sessions where the writer said they were done or asked to keep it, and the yes filed it on the Idea Board and in memory.
- Cost: about **37 s a turn** on the slow runner (reading the message 4 s, reading the idea into the sheet 5 s, writing the reply 28 s; the first message of a session also loads the model, about 20 s more).
  The offer, the yes, "not yet" and a style command need no model and take no time.
- Honest limit: these are scripted writers who answer what they are asked. A real conversation wanders more, and a 3B model's comments on an idea are thin next to a large hosted model's. What makes NIE behave
  like an attentive interviewer here is the scaffold (the sheet, the planner, questions written by hand for each kind of piece, form and genre, and checks on every reply), not the model's own judgment.

**The project mind and the editorial instruments** (`agent-lab` memory session, `notes-lab --editor`; same runner and model; one run each, so read the direction, not the decimals):
- Remembering what was said earlier (the `memory` session: eight facts told, then seven questions asked later about them, and three more questions about the story). With the mind: **6 of 7** probes answered from what
  was told; with the mind off (`nomind`): **4 of 7**. The misses with the mind on were one question the agent filed as part of the idea ("What happened to my heroine's brother?" was read by the model as the writer
  telling NIE something and answered with "I have that down"): a bug that was there before and that this session showed; a question is now never filed as part of the idea. Replies with two or more questions: **0 with the
  mind, 3 without**. Cost: about 36 s a turn with the mind (recall is a few milliseconds; the rest is the model).
- A text pasted with no question (the invented 10,000-word bible; 25 sections read one at a time first, about 11 minutes on this runner, once): the reply came back in **12 s**, built from counts and notes, without
  the words "the writer", with one question to the writer in the second person, and the two things planted in the bible that the instruments can see: the water volume given as forty thousand barrels in section 3 and sixty
  thousand in section 21, and the dated entries going back from Year six to Year one. It also listed "Book" as a term found in 23 of 25 sections: an ordinary word a model note had named. Fixed: a note's term has to be
  there as written, and a lower-case word in nearly every section is not a coined term.
- Ten of the bible's own questions (whole-text, timeline, style, contradiction, snippet), asked with and without the instruments: answers that mention what the answer key says: **3/10 without, 2/10 with**: no
  improvement from showing a 3B model the counts. Replies that said "the writer" to the writer: **2/10 without, 0/10 with**. Replies that named something not in the text: 0/10 both ways (one sentence was cut
  by the check). What the run showed: given the counts, the model still repeated the question back ("Does it say the same thing everywhere?") or made a claim the text does not make ("This is clearly stated in
  section 8"). So questions that are only about the counts (is it consistent about a number, where do its dates run backwards, what tense, how does the pace run, what does it repeat) are now answered by the counts
  themselves, with their sections and one question about the finding, and no model; anything that needs reading, judging or a reason still goes to the model, shown the counts. Measured again after the change
  (same ten questions, a faster runner): answers that mention what the answer key says **2/10 without the instruments, 4/10 with them**; "the writer" said to the writer 1/10 and 0/10; invented names 0/10 and 0/10;
  the questions the counts answer (the water volume, the backwards dated entries, point of view and tense) came back in **0.6 s each** instead of 15 to 150 s. The questions that need reading the whole story
  (who does what, how it ends, a comparison, whether a year agrees between a character note and the dated entries) are still mostly missed: that is the model's limit, not something the counts reach.
- Two further memory runs (agent mode only, after the fixes above): probes **5/7 and 5/7**, so the first run's 6/7 was the top of the range, not the middle. Reading the per-turn labels showed why two probes failed: a question
  about the writer's own project that the model read as a general question about writing ("What tone did I say I wanted?", "Who owes the guild money, and how much?") was sent to the offline library, which skips the
  project's memory, and the model answered with advice about "free-form tags". Now a question the writer's own statements answer (a match against the project's memory, or a plain "did I say / I told you") is answered
  from the memory; a general question (what is a MacGuffin?) finds nothing of theirs and still goes to the library. The idea sheet is also searched on turns that answer a question. These two changes are tested
  (a test that fails on the old code). Measured on the real model after the change (one run): **7 of 7** probes answered from what the writer said, including "Who owes the guild money, and how much?" (Oleander Bruck, a hundred
  silver marks) and "What tone did I say I wanted?" (a slow, sun-bleached fable); facts on the sheet 7/7; ask rate 0.57; no question asked twice; about 48 s a turn on the slow runner. One run is one sample: the three
  runs of this session scored 6/7, 5/7, 5/7 before the fix and 7/7 after it, against 4/7 with the mind switched off. Still seen: the model often adds a question of its own to an answer (one reply in the run had two
  questions), and some answers drift into the story instead of simply stating what was said ("Your story is set in... Given this backdrop, how does the compass..."); both are the model's habits, and the checks on a reply cut
  only repeats and stock questions.
- Measured against the bible's answer key with no model (`scripts/editor-probe.mjs`, 0.3 s): all **8 of 8** of its people are listed, **1 of 2** planted inconsistencies is flagged (the year of the Fourth Line runaway, given in
  a character note and in the dated entries, is missed), the backwards jump in its dated entries is found, **14 of 24** defined terms are in the list of recurring terms, and 4 of 4 replies (2 true, 2 invented) are kept or cut correctly.
- Honest limit: a 3B model is not GPT, Gemini, Claude or Perplexity. What the instruments and the mind give is exact counts, a memory that cannot drift, and checks on every reply; they do not give the model
  better judgment of a story.

## Whole-subject profiles and talking about the library

Why: a probe showed single-topic questions were well covered ("what is a villanelle?") but whole-subject ones were not ("what are the subgenres of fantasy?" found nothing), and a writer who asked NIE what its model knew
was told, wrongly, that it had no library. The fixes are in three parts.

- **Profiles** (`library/profiles/*.js`): one record per facet (history, subgenres, tropes, what readers expect, how it is built, how it differs from its neighbours, landmark works, pitfalls, vocabulary) for a genre, form,
  tradition or movement. **As of this writing 96 subjects are installed besides the Gothic fiction example** (97 in all, 873 records): fantasy, science fiction, romance, mystery, thriller, horror, children's literature, picture books, young adult fiction,
  poetry, lyric poetry, epic poetry, memoir, biography, the essay, the screenplay, the stage play, tragedy, historical fiction, literary fiction, crime fiction, Romanticism, Realism, Modernism, comics and graphic novels, manga, webcomics, epic fantasy, urban fantasy, dark fantasy, narrative nonfiction, true crime, popular science, the sonnet, haiku, free verse, space opera, cyberpunk, dystopian fiction, Russian, French and German literature, middle grade, YA fantasy, YA contemporary, television drama, the sitcom, musical theatre, postmodernism, naturalism, surrealism, the cozy mystery, noir, the police procedural, interactive fiction, visual novels, video game narrative, travel writing, nature writing, self-help, narrative poetry, spoken word poetry, the ballad, historical romance, romantic comedy, paranormal romance, Japanese literature, Chinese literature, African American literature, the psychological thriller, espionage fiction, cosmic horror, comedy, satire, magical realism, radio drama, fiction podcasts, nonfiction podcasts, YA romance, early chapter books, fairy tales, existentialism, the Harlem Renaissance, the Beat Generation, the western, adventure fiction, war fiction, literary journalism, narrative history, business books, fan fiction, webnovels, light novels, the villanelle, the ode and the elegy. All 96 subjects of the first plan are installed; more can be added the same way (written by one agent, checked by another with search), and the Settings page and "what does your library know?" report the real number at any time.
- **How they were made and checked.** Each file is written by one AI agent from a strict brief (no sample prose, dates only when sure, a work is listed only with its author and year, fewer certain points over more shaky ones) and then
  fact-checked by a second agent that did not write it, which lists every date, title, author, number and "first"/"coined" claim, searches the web for them, and corrects, softens or removes what it cannot confirm. Counts from the
  verifiers (claims checked / corrected / softened / removed): first three batches 729 / 24 / 27 / 2; poetry 231 / 3 / 2 / 0; memoir, biography and the essay 188 / 4 / 12 / 0; stage and screen 255 / 12 / 19 / 0; historical, literary and crime fiction
  228 / 9 / 12 / 0; Romanticism, Realism and Modernism 317 / 11 / 5 / 2 (the Modernism file was not searched in that pass, so it was held back and checked again on its own, with search: 112 / 3 / 4 / 0). The first four batches were also checked a second time by a fresh checker (an unplanned repeat after a restarted run: 246 / 3 / 5 / 0; 220 / 4 / 3 / 0; 236 / 1 / 7 / 0; 231 / 2 / 2 / 0), and the installed text includes its edits. Further resumes repeated the checks of the first eight batches once or twice more (the per-pass numbers are in `docs/library-checks/`); that was a mistake in how I resumed the workflow and it cost a lot of budget, but each extra pass made small, useful softenings and they are installed. Later batches were each checked once (Comics, manga and webcomics 233 / 6 / 5 / 0; Fantasy subgenres 165 / 2 / 11 / 0; Narrative nonfiction, true crime and popular science 178 / 5 / 8 / 4; the sonnet, haiku and free verse 270 / 6 / 14 / 2; Science fiction subgenres and dystopia 224 / 5 / 13 / 2; Russian, French and German literature 312 / 10 / 5 / 1; middle grade and YA subtypes 158 / 1 / 12 / 2; television and musical theatre 216 / 11 / 22 / 2; postmodernism, naturalism and surrealism 260 / 9 / 13 / 1; mystery and crime subgenres 220 / 6 / 18 / 0). Two batches (interactive fiction, visual novels and game narrative; travel writing, nature writing and self-help) were first checked from recall only (no web search left), held back, and installed after a second check with search (134 / 11 / 6 / 0 and 220 / 5 / 15 / 0; the second check of the interactive fiction batch corrected eleven claims the first had left). Narrative, spoken word and the ballad 286 / 5 / 10 / 0; Romance subgenres 128 / 7 / 16 / 3, of which only historical romance was searched, so the romantic comedy and paranormal romance files, the Japanese, Chinese and African American literature files and the darker thriller and horror subgenre files (psychological thriller, espionage fiction, cosmic horror; their checkers searched nothing) were held back. Each group has since had a second check with search (romantic comedy and paranormal romance 130 / 2 / 12 / 0; Japanese, Chinese and African American literature 405 / 5 / 6 / 0; darker thriller and horror 110 / 2 / 4 / 1) and all are installed. Comedy, satire and magical realism 278 / 6 / 5 / 0; audio drama and podcasts 172 / 4 / 17 / 0; YA romance, early chapter books and fairy tales 184 / 10 / 16 / 1; existentialism, the Harlem Renaissance and the Beats 232 / 4 / 14 / 1; western, adventure and war fiction 260 / 9 / 11 / 1; journalism, history writing and the business book 140 / 7 / 9 / 0; fan fiction, webnovels and light novels 126 / 3 / 11 / 0 (the checker's search budget ran out part-way through the light-novel file); ode, elegy and villanelle 154 / 13 / 18 / 1, of which only the villanelle was searched. The ode, elegy and light-novel files were therefore held back until a second check with search had been through them (98 / 3 / 6 / 0; the ode and elegy files had had no web check before it) and are installed too. The last two were the least searched: their checkers' web search budget ran out part-way (the Russian, French and German checker got five searches that returned results), so most of their dates rest on recall and on the library's own records, as their lists in `docs/library-checks/` say; the historical/literary/crime and the Romanticism/Realism/Modernism batches got a second pass as well (179 / 2 / 1 / 0 and 330 / 2 / 4 / 0). The eight batches of that last group were then each checked a second time by a fresh checker (1,468 claims looked at, 15 corrected, 42 softened, 0 removed; 21 of the 24 files changed); the shared web-search allowance ran out in every one of those runs, so that second check is itself partly from recall, and its reports in `docs/library-checks/` say which files were searched. Outside the profiles, nothing had been checked against the web before; two rounds on the works the library lists searched 218 of its 5,860 distinct works (205 confirmed; of the 96 drawn at random none had an author search contradicted or could not be found; the differences were which date a year stands for, such as a serial before the book or a play's performance before its printing; one title spelling and one inconsistent date were fixed), and 4,976 are still unchecked (author, year and existence only: summaries and plots were not examined) (`docs/library-checks/works-ledger.json`, `scripts/library-verify-queue.mjs`). Every file also passes the library lint (including a cross-check that the year of any work agrees with every other record that lists it)
  and `scripts/library-profile-check.mjs`, which asks each facet its own question and checks the right record answers. **What this is not:** the web checks were search summaries (the verifiers could not fetch Wikipedia), a number of well-known dates were
  confirmed only from recall and the library's own records, and market and shelving practice is hedged and marked "varies". It is a much better-checked set of records than the rest of the library, not a verified one. The verifiers' own lists of
  what they could not confirm are kept in `docs/library-checks/` and are worded loosely in the text.
- **Retrieval.** A profile competes only when the question asks for its facet *and* names its subject. This was measured to matter: before the second condition, "What are the subgenres of fantasy?" was answered, as a strong match, with the subgenres
  of Gothic fiction (a regression test now covers it).
- **A conversation about the library** (`knowledge/thread.js`): after an answer, "what about its tropes?", "and the history?", "tell me more" / "what else?" (the rest of the overview, then each facet once, then a plain "that is everything I hold"),
  "how is it different from romance?" (side by side, with the profile's own point) and, with a model, a pronoun question ("why did it start in Britain?") stay on the subject; a facet the library has no record of is said plainly; the facets not yet shown
  are offered as chips. It is kept per project and ends when idea cards take over. Measured on the real model (`scripts/library-lab.mjs`, scripted conversations in `tests/fixtures/library-sessions.mjs`, a slow 2-thread runner, about 35 s a turn):

  What the first two runs showed (17 of 17 follow-ups read as intended; the model's retelling still added authors, titles and examples of its own, "Anne Rice", "Rosemary's Baby", so its replies go through a names check against the
  records) was not enough. Those runs' headline count, "replies naming something no record holds", re-runs the product's own check on a reply it has already cleaned, so it is zero by construction and says nothing; it is **not** evidence.
  What measures a library answer is an **audit**: the lab prints every full reply and the library's records on the subject (`AUDIT-RECORDS` / `AUDIT-REPLY` lines), and a separate agent (not the model being measured) splits each reply
  into claims and judges each against the records: supported, not in the records, wrong, or crediting the writer with something they never said. Five audits of the same kind of scripted conversation (33 replies each, ten conversations
  of which five are a "tour" of profiles beyond Gothic fiction), as the answer path changed (the table shows four; the fourth column is the last, taken after the fix for the one credited claim; the audit before it judged 386 claims: 361 supported, 23 not in the records, 0 wrong, 1 credited, 1 of 33 replies):

  | | the model retells the records | direct questions answered with the library's text | + the reading of a question after a library answer (a mistake, below) | + the reading guarded, final |
  | --- | --- | --- | --- | --- |
  | claims judged | 202 | 351 | 393 | 446 |
  | supported by the records | 152 (75%) | 307 (87%) | 361 (92%) | 419 (94%) |
  | not in the records | 33 | 30 | 23 | 26 |
  | wrong | 10 | 1 | 1 | 0 |
  | crediting the writer with something they never said | 7 | 9 | 4 | 0 |
  | replies with a wrong or credited claim | **13 of 33** | 4 of 33 | 4 of 33 | **0 of 33** |
  | replies written by code / by the model | 1 / 32 | 29 / 4 | 29 / 4 | 32 / 1 |
  | follow-ups read as intended (lab) | not recorded for this run (17 of 17 in the two earlier ones) | one conversation 2 of 4, the rest all | the same conversation 2 of 4 | all ten conversations |
  | mean turn on the lab runner | about 18 s | 6.1 s | 8.7 s | 4.4 s |

  What the audits found, in order:
  1. A 3B model retelling the records got something wrong or credited the writer with things in 13 of 33 replies: "Walter Scott belongs to the Victorian period", "both the Bishop and the Pound sestina were published in 1909",
     a rhyme scheme of its own for the villanelle, "Lewis Turco is credited with its invention" (the terzanelle's credit), "your reference to Robert Jordan" in answer to "What is epic fantasy?". Most of it was made of words that are all
     in the records and put together wrongly, which no check on names, numbers or dates can see. So **a direct question that the library matches strongly by an entry's own name, and every follow-up in a library thread (facet, "tell me
     more", comparison), is now answered with the library's own text, composed by code** (`libraryReply`), with or without a model: instant, and checked against the web when the profile was written. The model reads the message and does not retell
     the records. A weaker match, a question with more in it ("... and would it suit a poem about my mother?", "in two sentences"), a pronoun question ("why did it start in Britain?"), a long text of the writer's in play and an online model
     (not measured) still go to the model, whose reply now loses any sentence that names something, or states a year, decade, century or rhyme scheme, that the records do not hold, or that credits the writer with something they said.
  2. An adversarial review of that change found it answered compound questions with a canned dump, put a novel (Fingersmith) ahead of the technique for "what is a plot twist?", ignored an online model, deleted correct edition years
     and mistook "1,500 words" and "NEVER" for years and rhyme schemes. All fixed, with tests.
  3. The audits then showed one real defect left: after "What is gothic fiction?", "what are the tropes of romance?" was read as a request for ideas and answered with story cards that invented "your gothic castle" and "the forbidden love
     affair you mentioned"; the follow-ups after it found no library thread. The reading step is shown the last two messages, and NIE's last message was now a library card. **A first fix made it worse**: showing the reading a one-line summary of
     the card instead (`tests/fixtures/understanding-after-library.json`, ten questions, `understanding-eval` with the `fixture` input) read 2 of 6 general questions correctly against 6 of 6 with the card as it is; and three extra examples in
     the reading prompt (one used the word "tropes") took two of the six back to "ideas". Both were reverted. The label of a short factual question like this flips between "craft" and "ideas" with the smallest change, a near-tie for a 3B model,
     so it is no longer left to the label: while a library conversation is open, a short factual question that the model read as ideas, develop, unclear or chat but that names something the library holds is kept a library question, and the change
     of label is recorded as `understood.overruled`. After that the lab reads every conversation as intended and an audit found one credited claim ("... as you mentioned" in the single model-written reply); the check on a model's library
     reply now removes sentences of that kind, and the last audit finds none. **But that audit had a single model-written reply** (the pronoun question, 5 claims, all supported) and 32 composed by code, so it shows that the code-composed
     answers match the records and that the reading is now right on these conversations; it says little about how accurate the model's own library replies are (the first audit, 33 replies by the model, is the measure of that).

  **What the audits cannot see.** They were judged by an AI agent against the records the lab printed, not against the web (the records themselves are the fact-checked profiles and the library); 33 replies on scripted conversations is a small
  sample; a verbatim bullet counts as one supported claim, so copying inflates "supported"; 17 of the 23 "not in the records" in the last audit are library text from entries the lab did not print (a second card such as "Gothic fiction
  (eighteenth-century origins)"), not necessarily false; a true fact given to the wrong thing, or a poor choice of which entry answers, is invisible to any check (a code-composed answer cannot say something false, but it can answer the wrong
  question: the cyberpunk-versus-space-opera comparison says plainly that the library holds no note on the difference and shows two overviews, and "tell me more" can return only the few leftover bullets). The audit also judged the model's
  one remaining reply type (the pronoun question) as having no real answer where the records give no reason. Library answers by code are accurate to the records and often long and list-like; they are less like a conversation, and that is the
  price of not being wrong.
- **A rule-reading bug found on the way**: with no model, "What is a sonnet?", "what is a haiku" and "Explain the villanelle" were read as requests for ideas (the form word counted as a lens) and got no answer. They now go to the library.
- **Honest limits.** A direct library question is answered by code from the records, instantly; everything else the model writes is a 3B model's: it can be flat, repeat itself or drift, and a reply from it takes 15 to 70 s on a slow computer. The records are what NIE knows; the library cannot be complete, and "seemingly
  infinite knowledge of all literature" is not something a program on one computer can offer. What can be offered is a large library that says what it holds and what it does not, a conversation that stays on the subject, and the optional online
  model in Settings for questions beyond it. A larger offline model (for example a 7B) was considered and **not** added: Settings has no model chooser beyond the one bundled model, the download address of a larger model cannot be verified from
  here, and it would be several times slower on an ordinary CPU.

## How Brainstorm talks (the conversation lab)

A writer typed "hey" in Brainstorm and NIE answered about a "thanks" that was never there. To measure how Brainstorm TALKS, not guess, `scripts/talk-lab.mjs` (workflow `talk-lab`) runs scripted conversations from an empty project on the
real Qwen2.5-3B (Q4_K_M) through the whole product path and prints every reply with the message before it (`TALK-REPLY`); a separate AI reviewer (never the model being measured) then rates every reply on six things: did it understand the message in the
context of the conversation, did it state anything the writer never said, does it read like a person (natural / stiff / robotic), does it help, did it break the rule that NIE never writes the writer's text, is the length right. The conversations are in
`tests/fixtures/talk-sessions.mjs`: eleven (45 replies) that the early fixes were written against, eight "held out" (36 replies, `heldout`) written after the first round, and eight more (37 replies, `heldout2`) written after those had been read and used, and run
only on the code before round five. `engine_commit` lets the lab run an earlier engine on the same conversations.

**On the conversations the fixes were written against** (45 replies; the reviewer's counts; each row is one run of one version):

| Version | Context good / partly / wrong | Invented | Natural / stiff / robotic | Helps / thin / none | Rule |
|---|---|---|---|---|---|
| Before (`b3ab042`) | 8 / 28 / 9 | 6 | 2 / 25 / 18 | 9 / 29 / 7 | 1 borderline |
| Round 1 (small talk on its own, a reply is read against NIE's last message, one suggestion that says it is NIE's) | 20 / 21 / 4 | 2 | 2 / 24 / 19 | 13 / 28 / 4 | 0 |
| Round 2 | 22 / 17 / 6 | 2 | 4 / 23 / 18 | 19 / 23 / 3 | 0 |
| Round 3 | 22 / 17 / 6 | 3 | 6 / 23 / 16 | 20 / 20 / 5 | 0 |
| Round 3, part two | 29 / 15 / 1 | 2 | 5 / 30 / 10 | 23 / 21 / 1 | 0 |
| Round 3, part three (`684fe06`) | 23 / 17 / 5 | 0 | 4 / 32 / 9 | 15 / 25 / 5 | 0 |
| Round 4 (`cf57166`) | 22 / 20 / 3 | 5 | 4 / 26 / 15 | 13 / 31 / 1 | 0 |

The last three rows are nearly the same code, so the spread between them (context good 22 to 29, robotic 9 to 15, helps 13 to 23) is the run-to-run noise of a 3B model and of one reviewer: differences of several replies in one row mean nothing.
Against the "before" row the direction is clear and larger than that noise: far fewer replies that misread what the message refers to (wrong 9 to 1 to 5), fewer invented details (6 to 0 to 5), more that help (9 to 13 to 23), fewer robotic (18 to 9 to 15).
But these are the conversations the fixes were written against, so they flatter NIE.

**On conversations nobody had tuned on** (the fairer test):

| Set and version | Replies | Context good / partly / wrong | Invented | Natural / stiff / robotic | Helps / thin / none | Rule |
|---|---|---|---|---|---|---|
| `heldout`, `684fe06` | 36 | 10 / 16 / 10 | 4 | 1 / 19 / 16 | 4 / 23 / 9 | 0 |
| `heldout`, `cf57166` (after fixes made from the line above) | 36 | 7 / 22 / 7 | 4 | 1 / 18 / 17 | 6 / 27 / 3 | 0 |
| `heldout2`, `cf57166` (never looked at before this run) | 37 | 14 / 16 / 7 | 8 | 1 / 22 / 14 | 8 / 23 / 6 | 2 borderline (it coined names) |
| `heldout`, the "before" engine (`b3ab042`), same conversations | 36 | 11 / 15 / 10 | 6 | 1 / 18 / 17 | 7 / 17 / 12 | 1 |
| `heldout2`, the "before" engine, same conversations | 37 | 11 / 19 / 7 | 7 | 1 / 16 / 20 | 4 / 22 / 11 | 1 borderline |
| **Both unseen sets together, before** | 73 | 22 / 34 / 17 | 13 | 2 / 34 / 37 | 11 / 39 / 23 | 2 |
| **Both unseen sets together, `cf57166`** | 73 | 21 / 38 / 14 | 12 | 2 / 40 / 31 | 14 / 50 / 9 | 2 borderline |

(The "before" engine is the one at `b3ab042`, before any of this work, run on the same conversations with the same model and judged the same way. Round five, `c14096b`, is what the second set showed and was not measured again on unseen conversations.)

**What this says, plainly.** On conversations nobody had tuned on, the work made Brainstorm better in two ways and not in the way it was meant to. It gives far fewer replies that are no use at all (23 of 73 before, 9 now) and fewer that read as robotic (37 to 31): the
canned filing lines ("Got it, here's what I have for who it is for: ...", "Right, I have that.", "Mm, okay."), a hello answered with a remark about the word "hello", a goodbye answered with a form question, and the library's own wording leaking into a reply are mostly gone.
It did NOT understand more of what a message refers to: replies the reviewer rated as understanding the context well were 22 of 73 before and 21 now, and on the first unseen set they were 11 before and 7 now (the difference is within the noise, but it is not an improvement). Invented details are about
the same (13 and 12). The very large gains in the first table were gains on those 45 conversations, which the fixes were written against; they did not carry over. A person on the other end would still notice the stiffness: most replies are rated "stiff" and "thin", correct and on topic
but flat, generic ("adds a layer of complexity") and short of an idea the writer can use. A 3B model is the limit of that. A larger local model, or an online model (Settings), would very likely do better; that has not been measured here, and NIE's rules (it never writes the writer's text) are the same
with any model.

**What the reviewer and the lab cannot see.** One reviewer, one run per row, small sets; "stiff vs robotic" and "thin vs helps" are judgment calls. The writer's lines are scripted and cannot react to NIE. The reviewer sees the reply text, not the screen (idea
cards, chips), the speed (a reply took 15 to 40 seconds on the 2-thread runner, about 25 on average), or how it feels to use. Several of the checks in code (`holdSmallTalk`, `holdToPlan`) remove what the model first said before the reviewer sees it, so the numbers describe
the replies a writer would get, not the raw model; the lab prints the raw text (`TALK-RAW`) so the layer that changed it can be found. The "rule" column counts replies that wrote the writer's text; none did, but two coined a ready-made name (since changed to offer
directions a name could take), and a few "What if" lines read like one-sentence plot beats, which were counted as concepts.

## Rules, in detail
Understood and **checked exactly**: forbidden words/phrases; terminology ("use X not Y"); sentence/paragraph length limits; first/second/third person and
past/present tense; named patterns (adverbs, exclamation marks, semicolons, em dashes, ellipses, contractions, profanity, filter/hedge words, similes,
dialogue, passive voice, clichés, tags other than "said"). **Meaning-based** rules ("Samantha never lies") are judged by the language model when it is
running, and otherwise approximated by keywords (negative rules only) and labelled "keyword approximation". Positive meaning rules say "needs the language model".
Every rule shows how NIE understood it.

## Known limits
- Force-quitting NIE (Task Manager, a crash) can leave `llama-server.exe` running in the background and holding about 2 GB of memory until it is ended in Task Manager. A normal quit stops it.
- The 1.9 GB model is stored under the roaming profile (`%APPDATA%`); on PCs with roaming profiles or redirected folders that may be slow to sync. Moving it to `%LOCALAPPDATA%` is planned.
- The model download is not checked against a pinned SHA-256 (it is checked for size and the GGUF header); the CI log shows the checksum of the real download so it can be pinned.
- The portable exe unpacks to a temporary folder every time it starts (a few seconds); the installed copy does not.
- PDF: text PDFs with simple font encodings only; scanned PDFs are reported as unreadable (no OCR).
- The 3B model is small: its verdicts are shown as *possible issues* and can be marked as exceptions.
- The installer and the packaged app are tested on GitHub's Windows runner (a fresh machine, but not a consumer PC with other software, antivirus or a different Windows version).
- A long text is read in parts, not all at once: a question that needs the whole text at the same time ("list every place she lies", "is the pacing even throughout?")
  can only be answered from the parts NIE was shown, and the reply says which those were. NIE never says it read all of a text it did not.
- Reading a long text takes a slow computer minutes (the model must read the shown parts before the first word). Time limits are on silence, not on the whole reply,
  so a slow computer that is still answering is not cut off. NIE waits up to four minutes for the first word, and once it is answering a minute of silence stops it.
- The model's reading of a message is wrong about one time in five (above). When it is, NIE's answer can be in the wrong style; the panel under "What NIE understands"
  shows how a message was read. Requests to write or edit were recognised 98.1% of the time with the model running, and about half the time (51.9%) by the rules alone,
  so with no model running the rules decide and the ones they miss get the ordinary built-in guidance (which writes no prose for the writer).
- With an online model, the parts of the text shown to it leave the computer; each such reply says roughly how many words.
- Web search needs a key (or a SearXNG address) the writer supplies and works only when online. The words of the question go to the search service they chose, and a few public pages are fetched; NIE shows the query under the reply. The sources are what a search service returned: NIE does not judge how reliable they are, and a model's summary of them (especially a small offline one) can still be wrong in ways the checks cannot see.
- The all-in-one installer from the `windows-package` workflow is about 2.2 GB (it carries the offline model), so it is a workflow artifact (sign-in required, kept 30 days). The release installer is small and downloads the model on the first run.
