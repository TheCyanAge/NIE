# Narrative Integrity Engine (NIE)

An offline-capable narrative intelligence environment for writers. NIE **never writes or edits your text**: you tell it the
rules of your story in plain words, and it shows you *exactly where* the text breaks them, with a one-line reason. It also
helps you brainstorm, and reads documents aloud, with a local language model (Qwen2.5 3B) running on your own machine.

- **Full Scan**: write your rules ("Samantha never lies", "No adverbs", "Stay in third person"); NIE highlights each place that
  breaks one, in your own text, and says why. Exact checks are exact; meaning-based rules are judged by the language model
  (by sentence number, so it can only ever point at your words) or, offline, approximated by keywords and labelled as such.
- **Brainstorm**: an idea partner for anything literary: stories, characters, worlds, articles, essays and memoir, poems, scripts.
  Pick what you are making (or just talk), tap a lens (twists, complications, angles, hooks, images…) or ask in your own words, and
  NIE throws concept-level ideas at you and asks the question that sharpens them. Star the ones that pull; they live on your
  project's **Idea Board** ("remember this", "show my idea board", "let's develop this idea…" all work in the chat). It works
  with no model at all, from a built-in idea library, and says so. It will never draft, continue or rewrite your text.
- **Read**: import TXT, Markdown, HTML, RTF, DOCX, ODT, EPUB or PDF; it becomes your Story Text; have NIE read it aloud.
- **Projects**: every project is its own world. New means fresh; delete means gone.

One NIE: online model, offline model and built-in guidance are routing, not separate assistants.

## Get the Windows app (no Node.js, no command line)

**Click and run:** download one file and double-click it.

1. Open the [latest release](https://github.com/TheCyanAge/NIE/releases/latest) and download
   **`Narrative-Integrity-Engine-Portable.exe`**, then double-click it. Nothing is installed; NIE opens.
   Prefer a desktop shortcut and a Start menu entry? Download **`Narrative-Integrity-Engine-Setup.exe`** instead and run it.
2. Windows may show a blue "Windows protected your PC" box, because the program is not code-signed yet
   ([docs/WINDOWS_SIGNING.md](docs/WINDOWS_SIGNING.md)). Choose **More info → Run anyway**.
3. The first time, NIE downloads its offline language model (about 1.9 GB) once. It says so while it does, and meanwhile it answers from
   its built-in library. After that it works with no internet at all.

Both files are built on a real Windows machine by GitHub Actions and tested there before they are offered: the app starts, downloads
the real model on a first run, answers with it, installs and uninstalls cleanly. If the Releases page shows no release yet, the
files exist as a *draft* until the repository owner presses **Publish release**; or open **Actions → windows-release → the newest green run → Artifacts → NIE-Windows-click-and-run**
(GitHub asks you to sign in, and keeps artifacts for 30 days).

**Everything inside one installer (works with no internet even on the first run):** the `windows-package` workflow builds a ~2.2 GB installer
that already contains the model. It is too large for a release download, so it is an Actions artifact: **Actions → windows-package →
Run workflow → Artifacts → NIE-Windows-Setup** (sign in; unzip first). See [NOTICE.md](NOTICE.md) about the model's licence before sharing it.

## Run it

```bash
npm install
npm test                  # engine + desktop services (fast)
npm run test:ui           # end-to-end UI tests (Chromium)
npm run dev:web           # the UI in a browser: http://127.0.0.1:5173
```

Desktop (Windows) and the installer: see [docs/BUILDING.md](docs/BUILDING.md). Signing: [docs/WINDOWS_SIGNING.md](docs/WINDOWS_SIGNING.md).
Design and status: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/STATUS.md](docs/STATUS.md).
