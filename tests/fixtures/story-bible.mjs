// A ~10,000-word story bible of an invented novel (The Counterpoise Lines), written the way a working novelist writes one, plus the facts it was
// built to contain. It is the "real long paste" the offline model must understand in full: a bible is dense, dated, and full of defined terms,
// rules and cross-references, so reading only a few excerpts of it gives a generic reply.
//
//   const { text, truth } = loadBible();
//   truth.questions[k] -> { id, kind: 'lookup'|'whole'|'timeline'|'style'|'contradiction'|'snippet', ask, mustMention: [[alt, alt], ...], sections: [..] }
//
// An answer to a question is good when, for EACH inner array of `mustMention`, it contains at least one alternative (case-insensitive substring).
// The alternatives are chosen to survive substring matching (no bare "four", "may", "key", "consistent": they sit inside Fourth, maybe, keyboard,
// inconsistent), and tests/story-bible.test.js keeps it so: a generic answer fails every question, a single section cannot pass a whole-text, timeline
// or contradiction question. A question with `control: true` (a "do these conflict?" question whose right answer is "no") has a first group that is the
// answerer's verdict, not a phrase of the text. Timeline entries carry an `event` line, a plain description for people reading the truth.
// Section numbers are 1-based and are those of `splitSections(text)` (apps/web/src/engine/reading/sections.js); the story-bible tests recompute them,
// so if the text or the splitter changes the tests fail instead of the truth silently going stale.
//
// Nothing here is a real work, a real person or a real organisation, and it resembles nothing else in the repository (tests/fixtures/long-text.mjs
// invents a different thing).

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

let cached = null;

export function loadBible() {
  if (cached) return cached;
  const read = (name) => readFileSync(fileURLToPath(new URL(name, import.meta.url)), 'utf8');
  // .gitattributes pins LF; normalising anyway keeps the section numbers in the truth valid on any checkout
  const text = read('./story-bible.txt').replace(/\r\n?/g, '\n');
  const truth = JSON.parse(read('./story-bible.truth.json'));
  cached = { text, truth };
  return cached;
}
