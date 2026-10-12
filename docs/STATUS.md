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
