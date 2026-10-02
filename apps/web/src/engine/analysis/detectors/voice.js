import { mk, asIntentional } from '../finding.js';

const PAST = /\b(?:was|were|had|did|said|went|came|saw|knew|thought|felt|looked|turned|walked|took|made|got|stood|sat|ran|began|told|asked|found|left|held|heard|kept|let|seemed|stopped|opened|closed|nodded|smiled|reached|whispered)\b|\b[a-z]{3,}ed\b/gi;
const PRESENT = /\b(?:is|are|am|has|does|says|goes|comes|sees|knows|thinks|feels|looks|turns|walks|takes|makes|gets|stands|sits|runs|begins|tells|asks|finds|leaves|holds|hears|keeps|lets|seems|stops|opens|closes|nods|smiles|reaches|whispers)\b/gi;
const BACKSTORY_OPEN = /^(?:years|months|days|weeks|decades|long|once|back then|before that|earlier|that summer|as a (?:child|boy|girl))\b/i;

export function paragraphTense(narration) {
  const past = (narration.match(PAST) ?? []).length;
  const present = (narration.match(PRESENT) ?? []).length;
  if (past >= 3 && past >= present * 3) return 'past';
  if (present >= 3 && present >= past * 2) return 'present';
  return null;
}

function dominant(labels, min = 3, share = 0.7) {
  const classified = labels.filter(Boolean);
  if (classified.length < min) return null;
  const counts = {};
  for (const l of classified) counts[l] = (counts[l] ?? 0) + 1;
  const [top, n] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return n / classified.length >= share ? { label: top, share: n / classified.length, classified: classified.length } : null;
}

export function tense(ctx) {
  const labels = ctx.paragraphs.map((p) => (p.narrationWords >= 15 ? paragraphTense(p.narration) : null));
  const dom = dominant(labels);
  if (!dom) return [];
  const out = [];
  const { interp } = ctx;

  if (interp.tense && interp.tense !== 'mixed' && interp.tense !== dom.label && dom.share >= 0.85 && dom.classified >= 5) {
    out.push(
      mk({
        detector: 'tense-profile',
        category: 'pov',
        class: 'possible-issue',
        title: 'Tense differs from your profile',
        message: `Your profile says ${interp.tense} tense, but most of this reads as ${dom.label} tense.`,
        quote: ctx.paragraphs.find((p, i) => labels[i] === dom.label)?.text ?? '',
        question: 'Did the profile or the draft change?',
        confidence: 0.6,
        key: `profile-tense-${interp.tense}`,
      })
    );
  }

  let n = 0;
  ctx.paragraphs.forEach((p, i) => {
    const l = labels[i];
    if (!l || l === dom.label || n >= 3) return;
    // Backstory in a present-tense narrative, or "had"-flashbacks, are normal.
    if (dom.label === 'present' && l === 'past') return;
    if (BACKSTORY_OPEN.test(p.narration.trim())) return;
    let f = mk({
      detector: 'tense-drift',
      category: 'pov',
      class: 'possible-issue',
      title: 'Tense shift',
      message: `Most of this is in ${dom.label} tense, but this paragraph moves into ${l}.`,
      quote: p.text,
      start: p.start,
      end: p.end,
      sceneIndex: p.scene,
      question: 'Is the shift deliberate (memory, flashback, a change of mood)?',
      confidence: 0.55,
      key: `tense@${p.start}`,
    });
    if (interp.tolerates('tenseShift')) f = asIntentional(f, interp.why('tenseShift'), 'tense');
    out.push(f);
    n++;
  });
  return out;
}

const FIRST = /\b(?:I|me|my|mine|myself|we|our|ours|us)\b/g;
const SECOND = /\b(?:you|your|yours|yourself)\b/gi;
const THIRD = /\b(?:he|she|him|her|his|hers|himself|herself|they|them|their|theirs)\b/gi;
const INTERIOR = /\b(?:thought|felt|wondered|realized|realised|knew|wished|hoped|feared|remembered|decided)\b/gi;

export function paragraphPov(narration) {
  const first = (narration.match(FIRST) ?? []).length;
  const second = (narration.match(SECOND) ?? []).length;
  const third = (narration.match(THIRD) ?? []).length;
  if (first >= 2 && first > third) return 'first';
  if (second >= 2 && second > first + third) return 'second';
  if (third >= 2 && first === 0) return 'third';
  return null;
}

export function pov(ctx) {
  const { interp } = ctx;
  const out = [];
  const labels = ctx.paragraphs.map((p) => (p.narrationWords >= 12 ? paragraphPov(p.narration) : null));
  const dom = dominant(labels);

  if (interp.pov === 'objective') {
    const hits = ctx.paragraphs.filter((p) => (p.narration.match(INTERIOR) ?? []).length >= 2);
    if (hits.length >= 2) {
      out.push(
        mk({
          detector: 'pov-objective',
          category: 'pov',
          class: 'possible-issue',
          title: 'Interior thought in objective narration',
          message: 'Your profile calls for objective narration (behavior only), but a few passages state what someone thinks or feels.',
          quote: hits[0].text,
          start: hits[0].start,
          end: hits[0].end,
          sceneIndex: hits[0].scene,
          question: 'Should these be shown through action instead — or is this a deliberate exception?',
          confidence: 0.55,
          key: 'objective-interior',
        })
      );
    }
  }
  if (!dom) return out;

  const declared = ['first', 'second', 'third'].includes(interp.pov) ? interp.pov : null;
  if (declared && declared !== dom.label && dom.share >= 0.85 && dom.classified >= 5) {
    out.push(
      mk({
        detector: 'pov-profile',
        category: 'pov',
        class: 'possible-issue',
        title: 'Point of view differs from your profile',
        message: `Your profile says ${declared} person, but most of this reads as ${dom.label} person.`,
        quote: ctx.paragraphs.find((p, i) => labels[i] === dom.label)?.text ?? '',
        question: 'Did the profile or the draft change?',
        confidence: 0.6,
        key: `profile-pov-${declared}`,
      })
    );
  }

  const expected = declared ?? dom.label;
  let n = 0;
  ctx.paragraphs.forEach((p, i) => {
    const l = labels[i];
    if (!l || l === expected || n >= 3) return;
    let f = mk({
      detector: 'pov-drift',
      category: 'pov',
      class: declared ? 'likely-issue' : 'possible-issue',
      title: 'Point-of-view shift',
      message: `The narration is ${expected} person, but this paragraph reads as ${l} person.`,
      quote: p.text,
      start: p.start,
      end: p.end,
      sceneIndex: p.scene,
      question: 'Is the switch deliberate?',
      confidence: declared ? 0.7 : 0.5,
      key: `pov@${p.start}`,
    });
    if (interp.tolerates('povShift')) f = asIntentional(f, interp.why('povShift'), 'point-of-view');
    out.push(f);
    n++;
  });
  return out;
}
