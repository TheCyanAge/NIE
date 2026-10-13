/**
 * What stands out in an Analysis, as plain statements about the text and one question each.
 *
 * Both the evidence the model is given (evidence.js) and the read-back of a pasted text (readback.js) are built from these, so they can never disagree.
 * Every statement is TRUE of the Analysis it is made from (the tests recompute each number), says "possible" where the program only suspects something, cites
 * sections by their 1-based number, quotes only fragments of the text itself, and says nothing about quality. Statements have no "I" and no "you": the caller
 * decides who is speaking. Questions are in the second person and ask about intent; none is advice.
 */

const num = (n) => Math.round(n).toLocaleString('en-US');
const pct = (x) => (x > 0 && x < 0.005 ? 'under 1%' : `${Math.round(x * 100)}%`);
const times = (r) => (Math.round(r * 10) / 10).toFixed(1);
const joinAnd = (list) => (list.length <= 1 ? (list[0] ?? '') : `${list.slice(0, -1).join(', ')} and ${list.at(-1)}`);
/** A fragment of the writer's words (or a heading, or a rule) in quotes, with nothing in it that could end the sentence or the question (a quotation mark inside becomes a single one); a long heading is cut to its first ten words. */
const q = (s) => {
  const flat = String(s).replace(/["“”]/g, "'").replace(/[?!]+/g, '').replace(/\s+/g, ' ').trim();
  const w = flat.split(' ');
  return `"${w.length > 10 ? `${w.slice(0, 10).join(' ')}…` : flat}"`;
};
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

/** "section 4", "sections 3, 7 and 12", "sections 5 to 14": 1-based numbers of 0-based indexes; runs of three or more are ranges; long lists end "and N more". */
export function listSections(indices, { max = 6 } = {}) {
  const u = [...new Set((indices ?? []).filter(Number.isInteger))].sort((a, b) => a - b);
  if (!u.length) return 'no section';
  const parts = [];
  for (let k = 0; k < u.length; ) {
    let j = k;
    while (j + 1 < u.length && u[j + 1] === u[j] + 1) j++;
    if (j - k >= 2) parts.push(`${u[k] + 1} to ${u[j] + 1}`);
    else for (let t = k; t <= j; t++) parts.push(String(u[t] + 1));
    k = j + 1;
  }
  const shown = parts.slice(0, max);
  const rest = parts.length - shown.length;
  const list = rest > 0 ? `${shown.join(', ')} and ${rest} more` : joinAnd(shown);
  return `${u.length === 1 ? 'section' : 'sections'} ${list}`;
}

const range = (a, b) => Array.from({ length: Math.min(b - a + 1, 400) }, (_, k) => a + k);
const sectionsOf = (a) => a.covered?.sections ?? a.sections?.length ?? 0;

// ── names ────────────────────────────────────────────────────────────────────

/** The names to speak of first: names that act like people, then the rest, each by how often it comes up. */
export function rankedCast(a) {
  const rank = { person: 0, name: 1, place: 2 };
  return [...(a.cast ?? [])].sort((x, y) => (rank[x.kind] ?? 1) - (rank[y.kind] ?? 1) || y.mentions - x.mentions || x.first - y.first);
}

/** "Calla Reth (also Calla and Reth)": a name counts every form the text uses for it, and says which. */
export const nameWithAliases = (c) => (c.aliases?.length ? `${c.name} (also ${joinAnd(c.aliases)})` : c.name);

/** "Isaura appears in 9 of 25 sections (first in 9, last in 24); Linnet in 12; Calla Reth in 11". Null when the text has no name that comes back. */
export function castLine(a, limit = 3) {
  const M = sectionsOf(a);
  const top = rankedCast(a).slice(0, limit);
  if (!top.length || !M) return null;
  const [first, ...rest] = top;
  const head = `${nameWithAliases(first)} appears in ${first.sections.length} of ${M} ${M === 1 ? 'section' : 'sections'} (first in ${first.first + 1}, last in ${first.last + 1})`;
  return [head, ...rest.map((c) => `${c.name} in ${c.sections.length}`)].join('; ');
}

/** "Commission (22 of 25 sections), Ladder (16 of 25 sections)": the terms the text keeps using, each with the sections it occurs in. Null when there are none. */
export function termsLine(a, limit = 5) {
  const M = sectionsOf(a);
  const top = (a.terms ?? []).slice(0, limit);
  if (!top.length || !M) return null;
  return top.map((t) => `${t.term} (${t.sections.length} of ${M} ${M === 1 ? 'section' : 'sections'})`).join(', ');
}

function castFindings(a) {
  const M = sectionsOf(a);
  if (M < 5) return [];
  const need = Math.max(4, Math.ceil(M * 0.2));
  const out = [];
  for (const c of a.cast ?? []) {
    if (c.sections.length < 3) continue;
    const gap = [...c.gaps].sort((x, y) => y[1] - y[0] - (x[1] - x[0]))[0];
    if (!gap || gap[1] - gap[0] + 1 < need) continue;
    const span = listSections(range(gap[0], gap[1]));
    out.push({
      id: `cast.gap.${c.name}`,
      instrument: 'cast',
      strength: (c.kind === 'person' ? 60 : 40) + Math.min(10, gap[1] - gap[0] + 1 - need),
      sections: range(gap[0], gap[1]).slice(0, 12),
      text: `${c.name} appears in ${c.sections.length} of ${M} sections but not in ${span}`,
      question: `${c.name} is missing from ${span}: is that an absence you intended?`,
    });
  }
  return out.sort((x, y) => y.strength - x.strength).slice(0, 2);
}

function typoFindings(a) {
  return (a.names ?? []).slice(0, 2).map((n) => ({
    id: `names.${n.a}.${n.b}`,
    instrument: 'names',
    strength: n.bCount <= 2 ? 65 : 55,
    sections: n.sections,
    text: `${q(n.b)} appears ${n.bCount === 1 ? 'once' : `${n.bCount} times`}, in ${listSections(n.sections)}, where ${q(n.a)} appears ${n.aCount} times (a possible typo in a name)`,
    question: `${q(n.b)} appears only in ${listSections(n.sections)} while ${q(n.a)} appears ${n.aCount} times: did you intend two different names?`,
  }));
}

// ── pacing ───────────────────────────────────────────────────────────────────

const bucket = (r) => (r >= 3 ? 'more than three times' : r >= 2 ? 'more than twice' : `${times(r)} times`);

function pacingFindings(a) {
  const p = a.pacing;
  const out = [];
  if (!p) return out;
  const useUnits = (p.units?.length ?? 0) >= 4;
  const median = Math.round(useUnits ? p.unitMedian : p.median);
  const list = useUnits ? p.unitOutliers : p.outliers;
  for (const o of list.slice(0, 2)) {
    const where = useUnits ? listSections(range(o.from, o.to)) : '';
    const what = useUnits ? (o.title ? (o.from === o.to ? `${where} (${q(o.title)})` : `${q(o.title)} (${where})`) : where) : `section ${o.i + 1}`;
    const secs = useUnits ? range(o.from, o.to) : [o.i];
    const yard = useUnits ? 'the median length of the stretches under a heading' : 'the median section length';
    const typical = useUnits ? 'a typical stretch under a heading' : 'a typical section';
    out.push({
      id: `pacing.${useUnits ? 'unit' : 'section'}.${o.kind}.${useUnits ? o.from : o.i}`,
      instrument: 'pacing',
      strength: o.kind === 'long' ? 75 + Math.min(15, Math.round((o.ratio - 2) * 5)) : 50,
      sections: secs,
      text: `${what} is ${times(o.ratio)} times ${yard} (${num(o.words)} words against ${num(median)})`,
      question:
        o.kind === 'long'
          ? `${cap(what)} is ${bucket(o.ratio)} the length of ${typical}: did you mean that as a deliberate slowing?`
          : `${cap(what)} is much shorter than ${typical} (${num(o.words)} words against ${num(median)}): did you mean it to be short?`,
    });
  }
  const r = p.rhythm;
  if (r) {
    for (const s of r.longSentences.slice(0, 1)) {
      out.push({
        id: `pacing.sentences.${s.i}`,
        instrument: 'pacing',
        strength: 45,
        sections: [s.i],
        text: `section ${s.i + 1} averages ${s.avg} words a sentence against a median of ${r.sentenceMedian}`,
        question: `Section ${s.i + 1} averages ${s.avg} words a sentence where a typical section averages ${r.sentenceMedian}: did you mean that stretch to read differently?`,
      });
    }
    for (const d of r.dialogue.slice(0, 1)) {
      out.push({
        id: `pacing.dialogue.${d.i}`,
        instrument: 'pacing',
        strength: 40,
        sections: [d.i],
        text:
          d.kind === 'heavy'
            ? `quoted dialogue is ${pct(d.share)} of the words in section ${d.i + 1} against a median of ${pct(r.dialogueMedian)}`
            : `section ${d.i + 1} has no quoted dialogue; the median section has ${pct(r.dialogueMedian)}`,
        question:
          d.kind === 'heavy'
            ? `Quoted dialogue is ${pct(d.share)} of section ${d.i + 1} where a typical section has ${pct(r.dialogueMedian)}: did you mean that scene to be mostly talk?`
            : `Section ${d.i + 1} has no quoted dialogue where a typical section has ${pct(r.dialogueMedian)}: did you mean that?`,
      });
    }
  }
  return out;
}

/** A true statement about pacing even when nothing stands out. */
function pacingNeutral(a) {
  const p = a.pacing;
  if (!p || a.sections?.length < 2) return null;
  if ((p.units?.length ?? 0) >= 4) {
    const w = p.units.map((u) => u.words).filter((x) => x > 0);
    if (!w.length) return null;
    return `the ${p.units.length} stretches under headings run from ${num(Math.min(...w))} to ${num(Math.max(...w))} words, with a median of ${num(p.unitMedian)}`;
  }
  const secs = a.sections.filter((s) => s.words > 0);
  if (!secs.length) return null;
  const lo = secs.reduce((m, s) => (s.words < m.words ? s : m));
  const hi = secs.reduce((m, s) => (s.words > m.words ? s : m));
  return `section lengths run from ${num(lo.words)} words (section ${lo.i + 1}) to ${num(hi.words)} words (section ${hi.i + 1}), with a median of ${num(p.median)}`;
}

/** Quoted dialogue by thirds of the text (needs three sections). */
export function dialogueLine(a) {
  const t = a.pacing?.dialogueByThirds;
  if (!t || t.length !== 3) return null;
  return `quoted dialogue is ${pct(t[0])}, ${pct(t[1])} and ${pct(t[2])} of the words in the first, middle and last thirds of the ${sectionsOf(a)} sections`;
}

// ── voice ────────────────────────────────────────────────────────────────────

function voiceFindings(a) {
  const shifts = a.voice?.shifts ?? [];
  if (!shifts.length) return [];
  const basis = (what) => (what === 'tense' ? 'verb cues' : 'pronouns');
  const word = (s, v) => (s.what === 'tense' ? `${v} tense` : v);
  if (shifts.length >= 5) {
    const first = shifts[0];
    return [
      {
        id: 'voice.many',
        instrument: 'voice',
        strength: 50,
        sections: shifts.map((s) => s.at).slice(0, 12),
        text: `person or tense changes ${shifts.length} times between sections that read clearly, first at section ${first.at + 1} (counted from verb cues and pronouns)`,
        question: `Person or tense changes ${shifts.length} times from section to section, first at section ${first.at + 1}: did you plan that movement?`,
      },
    ];
  }
  return shifts.slice(0, 2).map((s, k) => {
    const adjacent = s.previous === s.at - 1;
    return {
      id: `voice.${s.what}.${s.at}`,
      instrument: 'voice',
      strength: 65 - k * 3,
      sections: [s.previous, s.at],
      text: adjacent
        ? `section ${s.at + 1} reads as ${word(s, s.to)} where section ${s.previous + 1} reads as ${word(s, s.from)} (counted from ${basis(s.what)})`
        : `section ${s.at + 1} reads as ${word(s, s.to)}, after ${word(s, s.from)} in section ${s.previous + 1} (the sections between do not read clearly either way; counted from ${basis(s.what)})`,
      question: `Section ${s.at + 1} reads as ${word(s, s.to)} where section ${s.previous + 1} reads as ${word(s, s.from)}: did you mean that change?`,
    };
  });
}

function voiceNeutral(a) {
  const v = a.voice;
  const M = sectionsOf(a);
  if (!v || !M) return null;
  if (!v.clear.tense && !v.clear.person) return 'no section has enough verb or pronoun cues to say which tense or person it is in';
  if (v.shifts.length) return null;
  return `no change of tense or person was counted between sections that read clearly (${v.clear.tense} of ${M} sections have a clear tense, ${v.clear.person} a clear person)`;
}

/** The measured style facts in one line (labels only where the counts support them). Null when there is too little text. */
export function styleLine(a) {
  const s = a.style;
  if (!s || !(s.words >= 30)) return null;
  if (s.language?.readable === false) return 'few of its words are common English words, so person, tense and register could not be read with English word lists';
  const parts = [];
  if (s.pov?.label === 'first person' || s.pov?.label === 'second person' || s.pov?.label === 'third person') parts.push(s.pov.label);
  else if (s.pov?.label === 'mixed') parts.push('mixed point of view');
  if (s.tense?.label === 'past' || s.tense?.label === 'present') parts.push(`${s.tense[s.tense.label] >= 0.95 ? '' : 'mostly '}${s.tense.label} tense`);
  else if (s.tense?.label === 'mixed') parts.push('tense moves between past and present');
  const bits = [];
  if (parts.length) bits.push(parts.join(', '));
  if (s.sentences >= 3) bits.push(`sentences average ${Math.round(s.sentence.mean)} words`);
  if (s.words >= 100) {
    const d = s.dialogue ?? {};
    // speech set off by a dash or by a speaker's name, which the quotation count does not see, is said as such
    if ((d.dashLines ?? 0) >= 5 && d.share < 0.15) bits.push(`${d.dashLines} lines open with a dash`);
    else bits.push(`quoted dialogue is ${pct(d.share + (d.cueShare ?? 0))} of the words`);
  }
  if (!bits.length) return null;
  const M = sectionsOf(a);
  const where = M && a.covered && !a.covered.complete ? `the first ${M} sections` : M === 1 ? 'the section' : `all ${M} sections`;
  return `${bits.join('; ')} (counted across ${where})`;
}

// ── figures, timeline, repeats, rules ────────────────────────────────────────

function figureFindings(a) {
  const out = [];
  for (const g of (a.figures ?? []).filter((f) => f.conflict).slice(0, 3)) {
    let pair = null;
    for (const x of g.items) {
      const y = g.items.find((z) => z.section !== x.section && z.value !== x.value);
      if (y) {
        pair = [x, y].sort((m, n) => m.section - n.section);
        break;
      }
    }
    if (!pair) continue;
    const [x, y] = pair;
    const inferred = [x, y].filter((i) => i.inferred);
    const how = inferred.length ? `; the sentence in ${listSections(inferred.map((i) => i.section))} says "it", read as ${q(g.noun)} from the sentence before` : '';
    out.push({
      id: `figures.${g.noun}.${g.unit}`,
      instrument: 'figures',
      strength: 90,
      sections: [x.section, y.section],
      text: `${q(g.noun)} is given ${q(x.written)} in section ${x.section + 1} and ${q(y.written)} in section ${y.section + 1} (a possible conflict: the same measure may be given two numbers${how})`,
      question: `Your text gives ${q(x.written)} in section ${x.section + 1} and ${q(y.written)} in section ${y.section + 1} for ${q(g.noun)}: did you mean those to be the same measure?`,
    });
  }
  return out;
}

function figureNeutral(a) {
  const n = (a.figures ?? []).length;
  if (n) return `${n === 1 ? 'one measure is' : `${n} measures are`} stated in more than one section as a plain number and unit, and ${n === 1 ? 'it does' : 'none of them does'} not differ`;
  return 'no measure was stated twice as a plain number and unit, so none could be compared';
}

function timelineFindings(a) {
  const t = a.timeline;
  if (!t || !t.jumps?.length) return [];
  if (t.jumps.length >= 3) {
    const j = t.jumps[0];
    return [
      {
        id: 'timeline.many',
        instrument: 'timeline',
        strength: 55,
        sections: t.jumps.map((x) => x.toSection).slice(0, 12),
        text: `the dated entries go back in time ${t.jumps.length} times, first from ${q(j.from)} (section ${j.fromSection + 1}) to ${q(j.to)} (section ${j.toSection + 1})`,
        question: `Your dated entries go back in time ${t.jumps.length} times, first from ${q(j.from)} to ${q(j.to)}: did you plan that structure?`,
      },
    ];
  }
  return t.jumps.slice(0, 2).map((j, k) => ({
    id: `timeline.${j.toSection}`,
    instrument: 'timeline',
    strength: 80 - k * 2,
    sections: [j.fromSection, j.toSection],
    text: `the dated entries go back in time: ${q(j.from)} (section ${j.fromSection + 1}) is followed by ${q(j.to)} (section ${j.toSection + 1})`,
    question: `Your dated entries go back from ${q(j.from)} in section ${j.fromSection + 1} to ${q(j.to)} in section ${j.toSection + 1}: did you mean that jump back in time?`,
  }));
}

function timelineNeutral(a) {
  const st = a.timeline?.stamps ?? [];
  if (st.length < 3 || a.timeline.jumps.length) return null;
  return `${st.length} dated entries run from ${q(st[0].label)} (section ${st[0].section + 1}) to ${q(st.at(-1).label)} (section ${st.at(-1).section + 1}), and none goes back in time`;
}

function repeatFindings(a) {
  const out = [];
  for (const r of a.repeats ?? []) {
    if (r.kind === 'opener') {
      out.push({
        id: `repeats.opener.${r.phrase}`,
        instrument: 'repeats',
        strength: 45,
        sections: [r.at ?? r.sections[0]],
        text: `${q(r.phrase)} begins ${r.count} sentences in a row in section ${(r.at ?? r.sections[0]) + 1} (a possible tic)`,
        question: `${q(r.phrase)} begins ${r.count} sentences in a row in section ${(r.at ?? r.sections[0]) + 1}: did you intend that run?`,
      });
    } else {
      out.push({
        id: `repeats.phrase.${r.phrase}`,
        instrument: 'repeats',
        strength: 40 + Math.min(15, r.count),
        sections: r.sections,
        text: `the words ${q(r.phrase)} come back ${r.count} times, in ${listSections(r.sections)} (a possible tic or refrain)`,
        question: `The words ${q(r.phrase)} come back in ${listSections(r.sections)}: did you choose that as a refrain?`,
      });
    }
  }
  return out.sort((x, y) => y.strength - x.strength).slice(0, 2);
}

function repeatNeutral(a) {
  return `no phrase of five words with two or more content words comes back in three of the ${sectionsOf(a)} sections, and no sentence opener starts four sentences in a row in any of them`;
}

/** Rules, rule by rule: how many places each is flagged in (at most 25 are listed per rule), where most. */
export function ruleStats(rules) {
  if (!rules) return [];
  const by = new Map();
  for (const f of rules.findings) {
    const e = by.get(f.ruleId) ?? { ruleId: f.ruleId, rule: f.rule, count: 0, bySection: new Map() };
    e.count++;
    e.bySection.set(f.section, (e.bySection.get(f.section) ?? 0) + 1);
    by.set(f.ruleId, e);
  }
  const items = new Map(rules.items.map((i) => [i.id, i]));
  return [...by.values()]
    .map((e) => {
      const top = [...e.bySection.entries()].sort((x, y) => y[1] - x[1] || x[0] - y[0])[0];
      const it = items.get(e.ruleId);
      return { ruleId: e.ruleId, rule: e.rule, count: e.count, more: Boolean(it?.truncated) || rules.findings.length < rules.count, topSection: top[0], topCount: top[1] };
    })
    .sort((x, y) => y.count - x.count || (x.rule < y.rule ? -1 : 1));
}

const rulesCaveat = (rules) => (rules.needsModel ? ` ${rules.needsModel === 1 ? 'One rule needs' : `${rules.needsModel} rules need`} the language model and ${rules.needsModel === 1 ? 'was' : 'were'} not checked by the program.` : '');

function ruleFindings(a) {
  const r = a.rules;
  if (!r || !r.count) return [];
  const stats = ruleStats(r);
  if (!stats.length) return [];
  const top = stats[0];
  const bySec = Object.entries(r.bySection).sort((x, y) => y[1] - x[1] || Number(x[0]) - Number(y[0]));
  const [bestSection, bestCount] = bySec[0];
  return [
    {
      id: 'rules.top',
      instrument: 'rules',
      strength: 85,
      sections: bySec.slice(0, 6).map(([s]) => Number(s)),
      text: `${num(r.count)} ${r.count === 1 ? 'place is' : 'places are'} flagged against your rules, most of them in section ${Number(bestSection) + 1} (${bestCount}); the rule flagged most is ${q(top.rule)} (${top.count}${top.more ? ' or more' : ''} ${top.count === 1 ? 'place' : 'places'}, most in section ${top.topSection + 1})`,
      question: `Your rule ${q(top.rule)} is flagged ${top.count}${top.more ? ' or more' : ''} ${top.count === 1 ? 'time' : 'times'}, most often in section ${top.topSection + 1}: are those places exceptions you intended?`,
    },
  ];
}

function ruleNeutral(a) {
  const r = a.rules;
  if (!r) return null;
  const checked = r.items.filter((i) => i.state !== 'needs-model' && i.state !== 'disabled').length;
  if (r.count) return null;
  return `the program found nothing to flag in any of the ${sectionsOf(a)} sections for the ${checked} ${checked === 1 ? 'rule' : 'rules'} it can check.${rulesCaveat(r)}`;
}

/** What the rules line says about rules that need the language model (so a count is never read as "all rules checked"). */
export function rulesNote(a) {
  return a.rules ? rulesCaveat(a.rules).trim() : '';
}

// ── all of it ────────────────────────────────────────────────────────────────

/** Everything that stands out, strongest first. Each: { id, instrument, strength, sections: [0-based], text, question }. */
export function standouts(a) {
  if (!a || !a.sections?.length) return [];
  const all = [...figureFindings(a), ...timelineFindings(a), ...ruleFindings(a), ...pacingFindings(a), ...voiceFindings(a), ...castFindings(a), ...typoFindings(a), ...repeatFindings(a)];
  return all.map((f, k) => ({ f, k })).sort((x, y) => y.f.strength - x.f.strength || x.k - y.k).map(({ f }) => f);
}

const FINDERS = { pacing: pacingFindings, voice: voiceFindings, figures: figureFindings, timeline: timelineFindings, repeats: repeatFindings, rules: ruleFindings, names: typoFindings };

/** A true statement for an instrument when nothing stands out in it (so a question about it is still answered with a measurement). Null when something does. */
export function neutralLine(a, instrument) {
  if (!a || !a.sections?.length) return null;
  if (FINDERS[instrument]?.(a).length) return null;
  switch (instrument) {
    case 'pacing':
      return pacingNeutral(a);
    case 'voice':
      return voiceNeutral(a);
    case 'figures':
      return figureNeutral(a);
    case 'timeline':
      return timelineNeutral(a);
    case 'repeats':
      return repeatNeutral(a);
    case 'rules':
      return ruleNeutral(a);
    case 'names':
      return `no possible typo in a name was counted in the ${sectionsOf(a)} sections`;
    case 'cast':
      return castLine(a);
    default:
      return null;
  }
}
