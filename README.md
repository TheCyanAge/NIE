# Narrative Integrity Engine (NIE)

An offline-capable narrative intelligence environment for writers. NIE **never writes or edits your text**: you tell it the
rules of your story in plain words, and it shows you *exactly where* the text breaks them, with a one-line reason. It also
helps you brainstorm, and reads documents aloud, with a local language model (Qwen2.5 3B) running on your own machine.

- **Full Scan**: write your rules ("Samantha never lies", "No adverbs", "Stay in third person"); NIE highlights each place that
  breaks one, in your own text, and says why. Exact checks are exact; meaning-based rules are judged by the language model
  (by sentence number, so it can only ever point at your words) or, offline, approximated by keywords and labelled as such.
- **Brainstorm**: conversation about ideas, genre and structure. It asks questions and follows your lead. It will not draft or rewrite.
- **Read**: import TXT, Markdown, HTML, RTF, DOCX, ODT, EPUB or PDF; it becomes your Story Text; have NIE read it aloud.
- **Projects**: every project is its own world. New means fresh; delete means gone.

One NIE: online model, offline model and built-in guidance are routing, not separate assistants.

## Run it

```bash
npm install
npm test                  # engine + desktop services (fast)
npm run test:ui           # end-to-end UI tests (Chromium)
npm run dev:web           # the UI in a browser: http://127.0.0.1:5173
```

Desktop (Windows) and the installer: see [docs/BUILDING.md](docs/BUILDING.md). Signing: [docs/WINDOWS_SIGNING.md](docs/WINDOWS_SIGNING.md).
Design and status: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/STATUS.md](docs/STATUS.md).
