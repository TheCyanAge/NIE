# Status against the specification

Legend: ✅ built and tested here · 🟡 built, needs verification on Windows / real hardware · ⬜ not built yet

| Spec | What | Status |
| --- | --- | --- |
| 1–2, 5–7 | Narrative knowledge library (genres, structures, styles, forms, techniques) | ✅ ≈180 entries, searchable; **seed content, to be grown** |
| 3, 28 | One NIE identity; model chooser only in Settings | ✅ |
| 4 | "Wiki of storytelling" depth | ✅ a large offline library (style-guide rules, usage, formats, genres with example works, forms, devices, movements, traditions, works, publishing): ≈9,500 written entries plus ≈2,500 derived lookup records (≈12,000 in all) for works listed inside other entries. Every entry is linted, authors/years are cross-checked across files, and strong/weak/none retrieval is measured on a 140-question fixture. 🟡 **Accuracy: written with AI assistance and not verified entry by entry.** A 220-claim sample checked against the web found no outright errors and 5 imprecise claims (now fixed), but many of those checks were from knowledge rather than a source. The Settings page says so. It can never be literally exhaustive, so NIE cites guide + edition and says when something is not covered |
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
  tradition or movement. **As of this writing 78 subjects are installed besides the Gothic fiction example** (79 in all, 711 records): fantasy, science fiction, romance, mystery, thriller, horror, children's literature, picture books, young adult fiction,
  poetry, lyric poetry, epic poetry, memoir, biography, the essay, the screenplay, the stage play, tragedy, historical fiction, literary fiction, crime fiction, Romanticism, Realism, Modernism, comics and graphic novels, manga, webcomics, epic fantasy, urban fantasy, dark fantasy, narrative nonfiction, true crime, popular science, the sonnet, haiku, free verse, space opera, cyberpunk, dystopian fiction, Russian, French and German literature, middle grade, YA fantasy, YA contemporary, television drama, the sitcom, musical theatre, postmodernism, naturalism, surrealism, the cozy mystery, noir, the police procedural, interactive fiction, visual novels, video game narrative, travel writing, nature writing, self-help, narrative poetry, spoken word poetry, the ballad, historical romance, romantic comedy, paranormal romance, Japanese literature, Chinese literature, African American literature, the psychological thriller, espionage fiction, cosmic horror, comedy, satire, magical realism, radio drama, fiction podcasts and nonfiction podcasts. The plan is about 96 subjects in priority order; the rest
  are written in waves as the work allows, and the Settings page and "what does your library know?" report the real number at any time.
- **How they were made and checked.** Each file is written by one AI agent from a strict brief (no sample prose, dates only when sure, a work is listed only with its author and year, fewer certain points over more shaky ones) and then
  fact-checked by a second agent that did not write it, which lists every date, title, author, number and "first"/"coined" claim, searches the web for them, and corrects, softens or removes what it cannot confirm. Counts from the
  verifiers (claims checked / corrected / softened / removed): first three batches 729 / 24 / 27 / 2; poetry 231 / 3 / 2 / 0; memoir, biography and the essay 188 / 4 / 12 / 0; stage and screen 255 / 12 / 19 / 0; historical, literary and crime fiction
  228 / 9 / 12 / 0; Romanticism, Realism and Modernism 317 / 11 / 5 / 2 (the Modernism file was not searched in that pass, so it was held back and checked again on its own, with search: 112 / 3 / 4 / 0). The first four batches were also checked a second time by a fresh checker (an unplanned repeat after a restarted run: 246 / 3 / 5 / 0; 220 / 4 / 3 / 0; 236 / 1 / 7 / 0; 231 / 2 / 2 / 0), and the installed text includes its edits. Further resumes repeated the checks of the first eight batches once or twice more (the per-pass numbers are in `docs/library-checks/`); that was a mistake in how I resumed the workflow and it cost a lot of budget, but each extra pass made small, useful softenings and they are installed. Later batches were each checked once (Comics, manga and webcomics 233 / 6 / 5 / 0; Fantasy subgenres 165 / 2 / 11 / 0; Narrative nonfiction, true crime and popular science 178 / 5 / 8 / 4; the sonnet, haiku and free verse 270 / 6 / 14 / 2; Science fiction subgenres and dystopia 224 / 5 / 13 / 2; Russian, French and German literature 312 / 10 / 5 / 1; middle grade and YA subtypes 158 / 1 / 12 / 2; television and musical theatre 216 / 11 / 22 / 2; postmodernism, naturalism and surrealism 260 / 9 / 13 / 1; mystery and crime subgenres 220 / 6 / 18 / 0). Two batches (interactive fiction, visual novels and game narrative; travel writing, nature writing and self-help) were first checked from recall only (no web search left), held back, and installed after a second check with search (134 / 11 / 6 / 0 and 220 / 5 / 15 / 0; the second check of the interactive fiction batch corrected eleven claims the first had left). Narrative, spoken word and the ballad 286 / 5 / 10 / 0; Romance subgenres 128 / 7 / 16 / 3, of which only historical romance was searched, so the romantic comedy and paranormal romance files, the Japanese, Chinese and African American literature files and the darker thriller and horror subgenre files (psychological thriller, espionage fiction, cosmic horror; their checkers searched nothing) were held back. Each group has since had a second check with search (romantic comedy and paranormal romance 130 / 2 / 12 / 0; Japanese, Chinese and African American literature 405 / 5 / 6 / 0; darker thriller and horror 110 / 2 / 4 / 1) and all are installed. Comedy, satire and magical realism 278 / 6 / 5 / 0; audio drama and podcasts 172 / 4 / 17 / 0. The last two were the least searched: their checkers' web search budget ran out part-way (the Russian, French and German checker got five searches that returned results), so most of their dates rest on recall and on the library's own records, as their lists in `docs/library-checks/` say; the historical/literary/crime and the Romanticism/Realism/Modernism batches got a second pass as well (179 / 2 / 1 / 0 and 330 / 2 / 4 / 0). Every file also passes the library lint (including a cross-check that the year of any work agrees with every other record that lists it)
  and `scripts/library-profile-check.mjs`, which asks each facet its own question and checks the right record answers. **What this is not:** the web checks were search summaries (the verifiers could not fetch Wikipedia), a number of well-known dates were
  confirmed only from recall and the library's own records, and market and shelving practice is hedged and marked "varies". It is a much better-checked set of records than the rest of the library, not a verified one. The verifiers' own lists of
  what they could not confirm are kept in `docs/library-checks/` and are worded loosely in the text.
- **Retrieval.** A profile competes only when the question asks for its facet *and* names its subject. This was measured to matter: before the second condition, "What are the subgenres of fantasy?" was answered, as a strong match, with the subgenres
  of Gothic fiction (a regression test now covers it).
- **A conversation about the library** (`knowledge/thread.js`): after an answer, "what about its tropes?", "and the history?", "tell me more" / "what else?" (the rest of the overview, then each facet once, then a plain "that is everything I hold"),
  "how is it different from romance?" (side by side, with the profile's own point) and, with a model, a pronoun question ("why did it start in Britain?") stay on the subject; a facet the library has no record of is said plainly; the facets not yet shown
  are offered as chips. It is kept per project and ends when idea cards take over. Measured on the real model (`scripts/library-lab.mjs`, scripted conversations in `tests/fixtures/library-sessions.mjs`, a slow 2-thread runner, about 35 s a turn):

  | | first run | after the fixes below |
  | --- | --- | --- |
  | follow-ups read as intended | 17 of 17 | 17 of 17 |
  | replies using the record's own words (checked ones) | 7 of 8 | 8 of 8 |
  | the writer's own story talk left alone | 1 of 2 | 2 of 2 |
  | replies naming something no record holds | 6 | 2 |

  What the first run showed, and what changed: a profile of the wrong subject answered a facet question (above); a reply built from the records still added authors, titles and examples of its own ("Anne Rice", "Rosemary's Baby"), so a library
  answer from the model now goes through the names-and-numbers check against the records and the conversation (the sentence goes, and NIE says so; if nothing is left it shows the record itself); the model spoke of "the notes you provided" and
  of NIE in the third person, so the instruction now says the library is NIE's own; and "What does the aunt hide?" after a message about "her aunt's house" was taken for a library question. The second run showed two more (the subject of
  "what are the tropes of romance?" became the trope "Forbidden love"; the model cited the Chicago Manual of Style for a record that names no guide), fixed in the commit after it; that change has not been re-measured yet. The check can
  also remove a correct sentence (it flagged "Couples", the first word of a sentence, as a name): it errs towards leaving out.
- **A rule-reading bug found on the way**: with no model, "What is a sonnet?", "what is a haiku" and "Explain the villanelle" were read as requests for ideas (the form word counted as a lens) and got no answer. They now go to the library.
- **Honest limits.** The model composing the answer is still a 3B model: it can be flat, repeat itself or drift, and a reply from it takes 15 to 70 s on a slow computer. The records are what NIE knows; the library cannot be complete, and "seemingly
  infinite knowledge of all literature" is not something a program on one computer can offer. What can be offered is a large library that says what it holds and what it does not, a conversation that stays on the subject, and the optional online
  model in Settings for questions beyond it. A larger offline model (for example a 7B) was considered and **not** added: Settings has no model chooser beyond the one bundled model, the download address of a larger model cannot be verified from
  here, and it would be several times slower on an ordinary CPU.

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
- The all-in-one installer from the `windows-package` workflow is about 2.2 GB (it carries the offline model), so it is a workflow artifact (sign-in required, kept 30 days). The release installer is small and downloads the model on the first run.
