import { interpretProfile } from '../profile/interpret.js';
import { buildContext } from './context.js';
import { CLASSES, CLASS_LABELS } from './finding.js';
import { names } from './detectors/canon.js';
import { tense, pov } from './detectors/voice.js';
import { repetition, longSentences } from './detectors/patterns.js';
import { pacing, exposition, dialogueTags, formFit, strengths } from './detectors/craft.js';
import { checkRules } from '../rules/check.js';
import { judgeRule } from '../rules/judge.js';
import { findingFingerprint } from '../project/memory.js';

/**
 * Full Scan.
 *
 * Primary job: find where the text breaks the rules the writer set, and say exactly where and why.
 * Secondary (optional): general observations read against the project's profile.
 *
 * NIE only locates and explains. It never writes, rewrites or suggests replacement text, and it never produces
 * a single quality score: a clean result means "no violations found by these checks", not "this is good writing".
 */

const OBSERVATION_DETECTORS = [
  { id: 'names', label: 'Character-name consistency', fn: names },
  { id: 'tense', label: 'Tense consistency', fn: tense },
  { id: 'pov', label: 'Point-of-view consistency', fn: pov },
  { id: 'repetition', label: 'Repetition and recurring patterns', fn: repetition },
  { id: 'long-sentences', label: 'Sentence length and clarity', fn: longSentences },
  { id: 'pacing', label: 'Pacing and dialogue balance', fn: pacing },
  { id: 'exposition', label: 'Exposition placement', fn: exposition },
  { id: 'dialogue-tags', label: 'Dialogue tags', fn: dialogueTags },
  { id: 'form-fit', label: 'Form and register fit', fn: formFit },
  { id: 'strengths', label: 'Strengths', fn: strengths },
];

/** What rule-based observations cannot judge. Honest about limits so a quiet scan is not mistaken for approval. */
export const MODEL_ONLY_CHECKS = [
  { id: 'continuity', label: 'Continuity of facts across scenes' },
  { id: 'characterization', label: 'Characterization and motivation' },
  { id: 'chronology', label: 'Chronology and cause-and-effect' },
  { id: 'theme', label: 'Thematic consistency' },
  { id: 'worldbuilding', label: 'World rules and worldbuilding' },
  { id: 'reader-confusion', label: 'Where a reader might get lost' },
];

const OBSERVATION_CAP = 40;
const order = Object.fromEntries(CLASSES.map((c, i) => [c, i]));

export function prepare({ text, project = null, interp = null }) {
  const body = String(text ?? '');
  const reading = interp ?? interpretProfile(project?.profile ?? {}, { text: body });
  return { body, reading, ctx: buildContext({ text: body, project, interp: reading }) };
}

/** Apply the writer's own decisions (dismissed / marked intentional). */
function applyDecisions(findings, project) {
  const memory = project?.memory ?? { dismissed: [], intentional: [] };
  let dismissedCount = 0;
  const kept = findings.flatMap((f) => {
    const fp = findingFingerprint(f);
    if (memory.dismissed?.includes(fp)) {
      dismissedCount++;
      return [];
    }
    if (memory.intentional?.some((x) => x.fingerprint === fp) && f.class !== 'strength') {
      return [{ ...f, class: 'intentional-possibility', confirmed: true, message: `You marked this as an exception. ${f.message}`, question: null }];
    }
    return [f];
  });
  return { kept, dismissedCount };
}

function sortFindings(findings) {
  return findings.sort(
    (a, b) =>
      (a.section === 'rule' ? 0 : 1) - (b.section === 'rule' ? 0 : 1) ||
      (a.section === 'rule' ? (a.start ?? 0) - (b.start ?? 0) : order[a.class] - order[b.class] || b.confidence - a.confidence || (a.start ?? 0) - (b.start ?? 0))
  );
}

function summarize(report) {
  const counts = Object.fromEntries(CLASSES.map((c) => [c, 0]));
  const ruleCounts = Object.fromEntries(CLASSES.map((c) => [c, 0]));
  for (const f of report.findings) {
    counts[f.class]++;
    if (f.section === 'rule') ruleCounts[f.class]++;
  }
  report.counts = counts;
  report.ruleCounts = ruleCounts;
  report.headline = headlineFor(report);
  return report;
}

export function runScan({ ctx, reading, project, observations = true }) {
  const wc = ctx.wordTotal;
  const rules = project?.rules ?? [];
  const base = {
    words: wc,
    scenes: ctx.scenes.length,
    form: { id: reading.form.id, label: reading.form.label, source: reading.form.source },
    notChecked: observations ? MODEL_ONLY_CHECKS : [],
    createdAt: Date.now(),
  };

  if (wc === 0) {
    return summarize({ ...base, findings: [], rules: { items: rules.map((r) => ({ id: r.id, text: r.text, category: r.category, state: r.enabled ? 'unchecked' : 'disabled', count: 0 })) }, checked: [], dismissedCount: 0, tooShort: true });
  }

  const { findings: ruleFindings, items } = checkRules(ctx, rules);
  let findings = ruleFindings.map((f) => ({ ...f, section: 'rule' }));

  const checked = [];
  // Rules apply to any amount of text; general observations need enough to read.
  if (observations && wc >= 20) {
    let obs = [];
    for (const d of OBSERVATION_DETECTORS) {
      try {
        obs.push(...d.fn(ctx));
        checked.push({ id: d.id, label: d.label });
      } catch (err) {
        // One broken detector must never take the whole scan down.
        obs.push({
          id: `err-${d.id}`, detector: d.id, category: 'system', class: 'possible-issue', title: `A check could not run (${d.label})`,
          message: `The "${d.label}" check failed: ${err?.message ?? err}`, quote: '', key: `err-${d.id}`, confidence: 0, meta: { error: true }, source: 'rules',
        });
      }
    }
    // Don't praise consistency while also flagging a name slip.
    if (obs.some((f) => f.detector === 'names')) obs = obs.filter((f) => f.detector !== 'strength-names');
    obs.sort((a, b) => order[a.class] - order[b.class] || b.confidence - a.confidence || (a.start ?? 0) - (b.start ?? 0));
    findings.push(...obs.slice(0, OBSERVATION_CAP).map((f) => ({ ...f, section: 'observation' })));
  }

  const { kept, dismissedCount } = applyDecisions(findings, project);
  // Keep rule items' counts in step with what the writer hasn't dismissed.
  for (const item of items) item.count = kept.filter((f) => f.meta?.ruleId === item.id).length;

  return summarize({ ...base, findings: sortFindings(kept), rules: { items }, checked, dismissedCount });
}

/**
 * Apply a writer decision to an existing report without re-running anything (so model-judged results are kept).
 * @param {'intentional'|'dismiss'} action
 */
export function reportAfterDecision(report, finding, action) {
  const findings = [];
  let dismissedCount = report.dismissedCount ?? 0;
  for (const f of report.findings) {
    if (f.id !== finding.id) findings.push(f);
    else if (action === 'dismiss') dismissedCount++;
    else findings.push({ ...f, class: 'intentional-possibility', confirmed: true, question: null, message: f.confirmed ? f.message : `You marked this as an exception. ${f.message}` });
  }
  const items = report.rules.items.map((i) => ({ ...i, count: findings.filter((f) => f.meta?.ruleId === i.id).length }));
  return summarize({ ...report, findings: sortFindings(findings), rules: { ...report.rules, items }, dismissedCount });
}

/** Deterministic scan (works offline, instantly). */
export function scan({ text, project = null, interp = null, observations = true }) {
  const { ctx, reading } = prepare({ text, project, interp });
  return runScan({ ctx, reading, project, observations });
}

/**
 * Merge language-model verdicts into a report. Keyword approximations for a judged rule are replaced by the
 * model's answer; rules the model could not finish keep their offline result and say so.
 */
export function applyModelResults(report, project, results) {
  let findings = [...report.findings];
  const items = report.rules.items.map((i) => ({ ...i }));
  let dismissedCount = report.dismissedCount;

  for (const res of results) {
    const item = items.find((i) => i.id === res.ruleId);
    if (!item) continue;
    if (!res.completed) {
      if (res.error && res.error !== 'no-model') item.note = `The language model could not finish this check (${res.error}).`;
      continue;
    }
    findings = findings.filter((f) => !(f.meta?.ruleId === res.ruleId && f.meta?.method === 'keyword'));
    const { kept, dismissedCount: d } = applyDecisions(res.findings.map((f) => ({ ...f, section: 'rule' })), project);
    dismissedCount += d;
    const have = new Set(findings.map((f) => f.id));
    findings.push(...kept.filter((f) => !have.has(f.id)));
    item.state = 'judged';
    item.method = 'model';
    item.count = findings.filter((f) => f.meta?.ruleId === res.ruleId).length;
    delete item.note;
  }
  return summarize({ ...report, findings: sortFindings(findings), rules: { items }, dismissedCount });
}

/**
 * Scan, then let the language model judge the rules that need meaning.
 * @param {(messages, opts) => Promise<string|null>} chat  null reply means no model is available
 */
export async function scanWithModel({ text, project = null, interp = null, observations = true, chat, signal, onProgress }) {
  const { ctx, reading } = prepare({ text, project, interp });
  let report = runScan({ ctx, reading, project, observations });
  if (!chat || report.tooShort) return report;

  const pending = report.rules.items.filter((i) => i.semantic && (i.state === 'approximate' || i.state === 'needs-model'));
  const results = [];
  for (let n = 0; n < pending.length; n++) {
    const item = pending[n];
    const rule = (project.rules ?? []).find((r) => r.id === item.id);
    const res = await judgeRule({
      ctx, rule, chat, signal,
      onProgress: (p) => onProgress?.({ ...p, ruleIndex: n, ruleTotal: pending.length, ruleText: rule.text }),
    });
    results.push({ ruleId: item.id, ...res });
    if (res.error === 'no-model' || res.error === 'cancelled') break;
  }
  report = applyModelResults(report, project, results);
  return report;
}

function plural(n, one, many = one + 's') {
  return `${n} ${n === 1 ? one : many}`;
}

export function headlineFor(report) {
  if (report.tooShort) return 'There is no text to check yet. Write or import something, then scan again.';
  const items = report.rules.items.filter((i) => i.state !== 'disabled');
  const violations = report.findings.filter((f) => f.section === 'rule' && f.class !== 'intentional-possibility');
  const observations = report.findings.filter((f) => f.section === 'observation' && f.class !== 'strength');
  const parts = [];

  if (!items.length) {
    parts.push("You haven't added any rules yet. Add some and I'll show you exactly where the text breaks them");
  } else if (!violations.length) {
    const exact = items.filter((i) => i.state === 'checked').length;
    const approx = items.filter((i) => i.state === 'approximate').length;
    const needs = items.filter((i) => i.state === 'needs-model').length;
    const bits = [];
    const judged = items.filter((i) => i.state === 'judged').length;
    if (exact) bits.push(`${exact} checked exactly`);
    if (approx) bits.push(`${approx} by keyword approximation`);
    if (judged) bits.push(`${judged} judged by the language model`);
    if (needs) bits.push(`${needs} not checked offline (need${needs === 1 ? 's' : ''} the language model)`);
    parts.push(`No rule violations found (${bits.join(', ')})`);
  } else {
    const places = violations.length;
    const broken = new Set(violations.map((f) => f.meta.ruleId)).size;
    parts.push(`${plural(places, 'place')} break${places === 1 ? 's' : ''} your rules (${plural(broken, 'rule')} affected)`);
  }
  if (observations.length) parts.push(plural(observations.length, 'other observation'));
  const strengthsN = report.findings.filter((f) => f.class === 'strength').length;
  if (strengthsN) parts.push(plural(strengthsN, 'strength'));
  return parts.join(' · ') + '.';
}

export { CLASSES, CLASS_LABELS };
