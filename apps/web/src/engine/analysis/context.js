import { splitParagraphs, splitSentences, stripDialogue, dialogueSpans, words } from '../util/text.js';

const SCENE_BREAK = /^\s*(?:\*{3,}|\*\s\*\s\*|-{3,}|—{3,}|~{3,}|#{1,3}\s.*|(?:chapter|part|scene|book)\s+[\w.-]+.*)\s*$/i;

const HEADING = /^\s*(?:#{1,3}\s|(?:chapter|part|scene|book)\s)/i;

/** Split text into scenes on explicit breaks (***, ---, headings, "Chapter N") or 3+ blank lines. */
export function segmentScenes(text) {
  const cuts = new Set([0]);
  let offset = 0;
  for (const line of text.split('\n')) {
    if (line.trim() && SCENE_BREAK.test(line)) cuts.add(HEADING.test(line) ? offset : offset + line.length + 1);
    offset += line.length + 1;
  }
  for (const m of text.matchAll(/\n[ \t]*\n[ \t]*\n[ \t]*\n+/g)) cuts.add(m.index + m[0].length);
  const points = [...cuts].filter((c) => c < text.length).sort((x, y) => x - y);
  const scenes = [];
  points.forEach((start, i) => {
    const end = i + 1 < points.length ? points[i + 1] : text.length;
    if (text.slice(start, end).trim()) scenes.push({ index: scenes.length, start, end });
  });
  return scenes.length ? scenes : [{ index: 0, start: 0, end: text.length }];
}

/**
 * Pre-computed view of the text shared by every detector: paragraphs (with scene index),
 * narration with dialogue removed, sentences, and the interpreted profile.
 */
export function buildContext({ text, project, interp }) {
  const scenes = segmentScenes(text);
  const lineStarts = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === '\n') lineStarts.push(i + 1);
  const locate = (pos) => {
    let lo = 0;
    let hi = lineStarts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (lineStarts[mid] <= pos) lo = mid;
      else hi = mid - 1;
    }
    return { line: lo + 1, column: pos - lineStarts[lo] + 1 };
  };
  const sceneOf = (pos) => scenes.findLast((s) => s.start <= pos)?.index ?? 0;
  const paragraphs = splitParagraphs(text).map((p, i) => {
    const narration = stripDialogue(p.text);
    const sentences = splitSentences(p.text).map((s) => ({ ...s, start: p.start + (s.start), end: p.start + s.end }));
    return { ...p, i, scene: sceneOf(p.start), narration, wordCount: words(p.text).length, narrationWords: words(narration).length, sentences };
  });
  const sentences = paragraphs.flatMap((p) => p.sentences.map((s) => ({ ...s, paragraph: p.i, scene: p.scene })));
  const dialogue = dialogueSpans(text);
  const wordTotal = words(text).length;
  const dialogueWords = dialogue.reduce((a, d) => a + words(d.text).length, 0);
  return {
    text,
    project,
    interp,
    memory: project?.memory ?? { characters: [], terminology: [], forbidden: [], motifs: [], intentional: [], dismissed: [] },
    scenes,
    paragraphs,
    sentences,
    dialogue,
    wordTotal,
    dialogueRatio: wordTotal ? dialogueWords / wordTotal : 0,
    locate,
    sentenceAround: (pos) => sentences.find((s) => s.start <= pos && s.end >= pos)?.text ?? text.slice(Math.max(0, pos - 40), pos + 80),
    sceneOf,
  };
}
