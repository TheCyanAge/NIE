/**
 * Brainstorm commands that never need a model: keeping and recalling ideas ("remember this", "show my idea board").
 * Deterministic, instant and honest: they act on this project's Idea Board only.
 */

const BOARD_TARGET = String.raw`(?:to|in|on|into)\s+(?:the\s+|my\s+)?(?:memory|idea\s?board|board|notes?)\b`;
const REMEMBER = new RegExp(
  String.raw`^\s*(?:nie[,:]?\s+)?(?:please\s+)?(?:` +
    // "save this to my idea board" must win over "save this" (otherwise "to my idea board" would become the note)
    String.raw`(?:save|add|put|keep|store)\s+(?:this|that|these|it)?\s*${BOARD_TARGET}` +
    String.raw`|(?:remember|note|store|keep|save|log|jot(?:\s+down)?)\s+(?:this|that|these|those|it)\b` +
    String.raw`|(?:don'?t|do\s+not)\s+forget\b` +
    String.raw`|remember\s*[:\-–—]` +
    String.raw`)\s*[:\-–—,]?\s*([\s\S]*)$`,
  'i'
);

const RECALL =
  /\b(?:bring\s+up|show(?:\s+me)?|open|list|view|see|what(?:'s|\s+is)(?:\s+on)?)\b[^.?!]{0,25}\b(?:idea\s?board|memory|memories|kept\s+ideas|saved\s+ideas|my\s+notes)\b|\bwhat\s+(?:do\s+you|have\s+you|did\s+you)\s+(?:remember|remembered|kept|saved)\b/i;

/** @returns {{ type: 'remember', note: string } | { type: 'recall' } | null} */
export function parseMemoryCommand(text) {
  const t = String(text ?? '').trim();
  if (!t) return null;
  const r = t.match(REMEMBER);
  if (r) return { type: 'remember', note: r[1].trim() };
  if (RECALL.test(t)) return { type: 'recall' };
  return null;
}

/** "Let's develop this idea: …" (what a board/card "Develop" button sends). */
export function parseDevelop(text) {
  const m = String(text ?? '').match(/^\s*let'?s\s+develop\s+this\s+idea\s*[:\-–—]\s*([\s\S]+)$/i);
  return m ? m[1].trim() : null;
}

/** Does the message ask for something (as opposed to sharing a premise)? Used before trusting a lens keyword. */
export const ASKS_FOR_IDEAS =
  /\b(?:give\s+me|show\s+me|got\s+any|have\s+any|any|some|more|another|other|fresh|new|different|need|want|suggest|brainstorm|come\s+up\s+with|think\s+of|help\s+me|surprise\s+me|ideas?|options|what\s+(?:could|should|might|are)|how\s+(?:could|can|should|might)|generate|create)\b/i;

export const WANTS_MORE = /\b(?:more|another|again|different|other|else|keep\s+going)\b/i;

/** Things that are prose, not ideas. "write a scene with three twists" is still a request to write a scene. */
export const PROSE_OBJECT =
  /\b(?:scenes?|chapters?|paragraphs?|passages?|dialogue|stor(?:y|ies)|poems?|essays?|articles?|posts?|first\s+lines?|opening\s+lines?|sentences?|stanzas?|verses?|monologues?|letters?|summar(?:y|ies)|synops[ie]s|outlines?|drafts?|scripts?|screenplays?|lyrics|songs?|speeches|speech|descriptions?|text|copy|blurbs?|bios?|intros?|introductions?|conclusions?|endings?\b(?!\s+ideas))\b/i;

/** "write me some ideas / twists / premises" asks for ideas (fine), unlike "write me a twist ending scene". */
export const IDEA_OBJECT = /\b(?:ideas?|premises|twists|concepts|angles|directions|options|possibilities|suggestions|prompts|complications|secrets|conflicts|themes|motifs|questions|sparks?)\b/i;

/** Explicit requests, as opposed to a premise that happens to contain a word like "secrets": "give me some twists for my story". */
export const EXPLICIT_ASK = /\b(?:give\s+me|show\s+me|got\s+any|do\s+you\s+have\s+any|have\s+any|come\s+up\s+with|think\s+of|suggest|brainstorm|surprise\s+me|any\s+ideas|more\s+ideas)\b/i;
