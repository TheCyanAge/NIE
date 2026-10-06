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

The Windows package is built on a real Windows machine by GitHub Actions and tested there before you download it: the installed
program is started, the real offline model must load and answer, and the installer must install and uninstall cleanly.

1. On GitHub open this repository → **Actions** → **windows-package**. Open the newest run with a green tick, or press **Run workflow**
   (leave "Put the offline model inside the installer" ticked) and wait for it to finish (about 15-25 minutes).
2. Under **Artifacts** download **NIE-Windows-Setup** (the installer; GitHub gives it to you inside a .zip, so unzip it first).
   **NIE-Windows-portable** is the same app as a plain folder if you would rather not install.
3. Run **Narrative Integrity Engine Setup … .exe** and finish the wizard (keep "Create a desktop shortcut" ticked).
4. Double-click **Narrative Integrity Engine** on your desktop. The offline model is inside the installer, so it works with no internet.

Downloading an artifact needs you to be signed in to GitHub, and artifacts are deleted after 30 days, so if the newest run is older than that, press
**Run workflow** again. (The installer is about 2.2 GB because it carries the offline model, which is more than GitHub allows for a
Release download.)

Windows may show a blue "Windows protected your PC" (SmartScreen) box, because the installer is not code-signed yet
([docs/WINDOWS_SIGNING.md](docs/WINDOWS_SIGNING.md)). Choose **More info → Run anyway**.

## Run it

```bash
npm install
npm test                  # engine + desktop services (fast)
npm run test:ui           # end-to-end UI tests (Chromium)
npm run dev:web           # the UI in a browser: http://127.0.0.1:5173
```

Desktop (Windows) and the installer: see [docs/BUILDING.md](docs/BUILDING.md). Signing: [docs/WINDOWS_SIGNING.md](docs/WINDOWS_SIGNING.md).
Design and status: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/STATUS.md](docs/STATUS.md).
