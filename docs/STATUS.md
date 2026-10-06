# Status against the specification

Legend: ✅ built and tested here · 🟡 built, needs verification on Windows / real hardware · ⬜ not built yet

| Spec | What | Status |
| --- | --- | --- |
| 1–2, 5–7 | Narrative knowledge library (genres, structures, styles, forms, techniques) | ✅ ≈180 entries, searchable; **seed content, to be grown** |
| 3, 28 | One NIE identity; model chooser only in Settings | ✅ |
| 4 | "Wiki of storytelling" depth | ✅ a large offline library (style-guide rules, usage, formats, genres with example works, forms, devices, movements, traditions, works, publishing) written to a strict spec and linted; 🟡 it can never be literally exhaustive, so NIE cites guide + edition and says when something is not covered |
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
| 82 | "Human-level" narrative reasoning | ⬜ aspirational: depends on the model and a much larger library |

## Rules, in detail
Understood and **checked exactly**: forbidden words/phrases; terminology ("use X not Y"); sentence/paragraph length limits; first/second/third person and
past/present tense; named patterns (adverbs, exclamation marks, semicolons, em dashes, ellipses, contractions, profanity, filter/hedge words, similes,
dialogue, passive voice, clichés, tags other than "said"). **Meaning-based** rules ("Samantha never lies") are judged by the language model when it is
running, and otherwise approximated by keywords (negative rules only) and labelled "keyword approximation". Positive meaning rules say "needs the language model".
Every rule shows how NIE understood it.

## Known limits
- PDF: text PDFs with simple font encodings only; scanned PDFs are reported as unreadable (no OCR).
- The 3B model is small: its verdicts are shown as *possible issues* and can be marked as exceptions.
- The installer and the packaged app are tested on GitHub's Windows runner (a fresh machine, but not a consumer PC with other software, antivirus or a different Windows version).
- The installer is about 2.2 GB (it carries the offline model), so it is distributed as a workflow artifact (sign-in required, kept 30 days), not as a release download.
