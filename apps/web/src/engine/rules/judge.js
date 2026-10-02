import { parseRule } from './parse.js';
import { tokenMatches } from './lexicon.js';
import { mk } from '../analysis/finding.js';
import { WORD_RE, clip } from '../util/text.js';

/**
 * Language-model judging of meaning-based rules.
 *
 * Safety by construction: the model is shown NUMBERED SENTENCES and may answer only with sentence numbers and a short
 * reason. We map each number back to an exact range in the writer's own text, so a hallucinated quote cannot be
 * highlighted, and the model is never asked to write or change anything.
 */

export const JUDGE_SYSTEM =
  'You check a piece of writing against ONE rule the writer set. You never write, rewrite or suggest text. You only point at sentences that break the rule.';

const CHUNK_CHARS = 1700;
const CHUNK_SENTENCES = 28;
const MAX_HITS_PER_CHUNK = 8;

/** Group sentences into prompt-sized chunks (kept contiguous so pronouns still make sense). */
export function chunkSentences(sentences) {
  const chunks = [];
  let cur = [];
  let chars = 0;
  for (const s of sentences) {
    if (cur.length && (chars + s.text.length > CHUNK_CHARS || cur.length >= CHUNK_SENTENCES)) {
      chunks.push(cur);
      cur = [];
      chars = 0;
    }
    cur.push(s);
    chars += s.text.length + 4;
  }
  if (cur.length) chunks.push(cur);
  return chunks;
}

export function buildJudgeMessages(rule, chunk) {
  const numbered = chunk.map((s, i) => `${i + 1}. ${clip(s.text.replace(/\s+/g, ' '), 400)}`).join('\n');
  return [
    { role: 'system', content: JUDGE_SYSTEM },
    {
      role: 'user',
      content:
        `Rule: ${rule.text}\n\nNumbered sentences:\n${numbered}\n\n` +
        'List the numbers of sentences that clearly break the rule, one per line, as: number | reason (at most 12 words). ' +
        'If no sentence clearly breaks it, reply exactly: NONE',
    },
  ];
}

/** Parse the model's reply into [{ index (0-based), reason }]. Anything that is not a valid sentence number is ignored. */
export function parseJudgeReply(reply, chunkLength) {
  const text = String(reply ?? '').trim();
  if (!text || /^\W*none\W*$/i.test(text)) return [];
  const seen = new Set();
  const hits = [];
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*[-*•]?\s*(?:#|no\.?\s*)?(\d{1,3})\s*(?:[|:.\-–—)]\s*(.*))?$/i);
    if (!m) continue;
    const n = Number(m[1]);
    if (n < 1 || n > chunkLength || seen.has(n)) continue;
    seen.add(n);
    const reason = (m[2] ?? '').replace(/["“”]/g, '').replace(/\s+/g, ' ').trim();
    hits.push({ index: n - 1, reason: clip(reason || 'Breaks this rule.', 140) });
    if (hits.length >= MAX_HITS_PER_CHUNK) break;
  }
  return hits;
}

function subjectTokensFor(sem, characters) {
  if (!sem?.subject) return null;
  const aliases = characters
    .filter((c) => [c.name, ...(c.aliases ?? [])].some((n) => n.toLowerCase() === sem.subject.label.toLowerCase()))
    .flatMap((c) => [c.name, ...(c.aliases ?? [])].flatMap((n) => n.toLowerCase().split(/\s+/)));
  return [...new Set([...sem.subject.tokens, ...aliases])];
}

/**
 * Judge one rule over the whole text.
 * @param {(messages:object[], opts:object) => Promise<string|null>} chat  returns the reply, or null if no model is available
 * @returns {{ findings: object[], completed: boolean, error?: string }}
 */
export async function judgeRule({ ctx, rule, chat, signal, onProgress }) {
  const sem = parseRule(rule.text).semantic;
  const subjectTokens = subjectTokensFor(sem, ctx.memory?.characters ?? []);
  let chunks = chunkSentences(ctx.sentences);
  // Rules about a named subject only matter where that subject appears.
  if (subjectTokens) {
    chunks = chunks.filter((c) => c.some((s) => (s.text.match(WORD_RE) ?? []).some((w) => tokenMatches(w, subjectTokens))));
  }

  const findings = [];
  let done = 0;
  for (const chunk of chunks) {
    if (signal?.aborted) return { findings, completed: false, error: 'cancelled' };
    let reply;
    try {
      reply = await chat(buildJudgeMessages(rule, chunk), { stream: false, temperature: 0.1, maxTokens: 220, signal });
    } catch (err) {
      return { findings, completed: false, error: err?.message ?? String(err) };
    }
    if (reply == null) return { findings, completed: false, error: 'no-model' };
    for (const hit of parseJudgeReply(reply, chunk.length)) {
      const s = chunk[hit.index];
      const where = ctx.locate(s.start);
      findings.push(
        mk({
          detector: 'rule',
          category: 'rule',
          class: 'possible-issue',
          title: clip(rule.text, 90),
          message: hit.reason,
          quote: s.text,
          start: s.start,
          end: s.end,
          sceneIndex: ctx.sceneOf(s.start),
          confidence: 0.6,
          key: `${rule.id}:${s.text.toLowerCase().replace(/\s+/g, ' ').trim()}@0`,
          meta: { ruleId: rule.id, ruleText: rule.text, method: 'model', match: s.text, line: where.line, column: where.column, sentenceStart: s.start, sentenceEnd: s.end },
          source: 'model',
        })
      );
    }
    onProgress?.({ rule: rule.id, done: ++done, total: chunks.length });
  }
  return { findings, completed: true };
}
