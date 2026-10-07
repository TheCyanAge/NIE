import { search, getEntry, KIND_LABELS, libraryStatus } from '../knowledge/index.js';
import { pick, clip } from '../util/text.js';

/**
 * Built-in guidance: what NIE says when no language model is available (or the model failed).
 * Deterministic, built from the project's own words and the offline knowledge library.
 * Like everything else in NIE it never drafts or edits the writer's text: it reflects, asks and points.
 */

export const DECLINE_EDIT =
  "I don't rewrite or edit your text. Your words stay yours. What I can do is show you exactly where something breaks a rule you've set, and why. If a line is bothering you, add what's wrong as a rule in Full Scan and I'll mark every place it happens, or tell me what's nagging at you and we'll talk it through.";

export const DECLINE_WRITE =
  "I don't write or continue the story for you; that part is yours. I can help you think, though: tell me the idea and I'll ask the questions that sharpen it, test a twist with you, or, once you've written something, show you where it breaks your rules.";

/** How NIE is answering right now, in words that match the real state (see the exact offline status strings in ai/engine.js). */
export function describeStatus(status) {
  if (!status) return "I'm answering from my built-in library and guidance.";
  if (status.route === 'online') return "Right now I'm answering through the online model set up in Settings.";
  const local = status.local ?? {};
  if (local.state === 'ready') return "Right now my offline language model is running on this computer, so I don't need the internet.";
  if (local.state === 'starting' && local.phase === 'download') return 'My offline language model is being downloaded. Until it is ready I answer from my built-in library and guidance.';
  if (local.state === 'starting') return 'My offline language model is still starting. Until it is ready I answer from my built-in library and guidance.';
  if (local.state === 'failed') return "My offline language model failed to start, so I'm using my built-in library and guidance.";
  return "The offline language model isn't installed here, so I'm using my built-in library and guidance.";
}

/** Plain facts about NIE, for answering "what can you do?" (given to the language model as its only source, and used as the built-in answer). */
export function aboutNieFacts(status) {
  return [
    "NIE is a thinking partner for writers: stories, poems, essays, articles, memoir, scripts, worldbuilding.",
    "NIE never writes, rewrites or edits the writer's text. Their words stay theirs.",
    "Brainstorm (this chat): ideas, angles, twists, complications and questions, never drafted text. The writer can keep favourites on the project's Idea Board.",
    "Full Scan: the writer sets their own rules, and NIE marks the exact places where the text breaks them and says briefly why. A flag is not always a mistake, so findings are sorted by how sure NIE is, and anything the writer calls deliberate is respected.",
    'Read: opens a document and reads it aloud.',
    "A built-in library of writing craft, style, usage, forms, genres and notable works answers general questions with no internet, says when practice varies, and says so when it has nothing instead of guessing. It is large but not complete.",
    'Projects are stored on this computer and kept separate from each other.',
    describeStatus(status),
  ].join('\n');
}

export function aboutNieReply(status) {
  return [
    "I'm NIE, a thinking partner for writers. I never write or edit your text; I help you think, and I show you where your own rules are broken.",
    ['Here is what I can do:', '- Brainstorm with you: ideas, twists, complications and questions for a story, essay, poem or anything else, kept on your Idea Board if you like.', "- Full Scan: you set the rules for your project, and I mark the exact places that break them and say why.", '- Read your document aloud.', '- Answer questions about craft, style, grammar, forms, genres and well-known works from my built-in library, which works with no internet.'].join('\n'),
    describeStatus(status),
  ].join('\n\n');
}

const list = (items) => (items.length <= 1 ? (items[0] ?? '') : items.slice(0, -1).join(', ') + ' and ' + items.at(-1));
const sentenceCase = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const REALITY = { realist: 'grounded, character-driven', speculative: 'speculative, with its own rules', unclear: null };

function firstQuestions(entries, n = 2) {
  return entries.flatMap((e) => e.questions).filter(Boolean).slice(0, n);
}

function relevant(text, kinds, limit = 3) {
  return search(text, { kinds, limit });
}

/** `modelReady`: the offline model is running but its answer could not be used this time (so never say it is missing). `status`: AIEngine.status(). */
export function builtinReply({ intent, project, message, report = null, modelReady = false, status = null }) {
  const seed = `${message}|${project.conversation.messages.length}`;
  const wp = project.conversation.workingPremise ?? {};
  const cues = intent.premiseCues;

  switch (intent.type) {
    case 'request-edit':
      return DECLINE_EDIT;
    case 'request-write':
      return DECLINE_WRITE;

    case 'about-nie':
      return aboutNieReply(status);

    case 'greeting':
      return pick(
        ["Hey. What are we working on: an idea, a draft, or something you'd like me to check against your rules?", "Hi. Bring me whatever you have: a spark of an idea, a stuck scene, or a passage you want checked against your rules."],
        seed
      );

    case 'empty':
      return 'Tell me what you have, even if it is only a sentence.';

    case 'start-from-zero':
      return [
        "Okay, let's hear the idea. We can build from whatever you already have.",
        pick(
          ["Even a single image, a feeling, or a \"what if\" is enough to start. What's the first thing you picture: a person, a place, or a moment?", "It doesn't have to make sense yet. What's the first thing that comes to mind: someone, somewhere, or something that happens?"],
          seed
        ),
        "And is there a feeling you'd like a reader to walk away with?",
      ].join('\n\n');

    case 'share-premise': {
      const who = list(cues.characters.slice(0, 3));
      const themes = cues.themes.slice(0, 3);
      const reality = REALITY[cues.reality];
      const opening = cues.modes.includes('mystery')
        ? "That's a solid hook: a crime like that comes with someone's secret already attached."
        : cues.modes.includes('horror')
          ? "That gives me a lot of dread to work with."
          : cues.reality === 'speculative'
            ? 'Interesting. That sets up a world with its own rules.'
            : themes.length
              ? "There's something quietly human in that."
              : 'Okay, I can work with that.';
      const reflect = themes.length
        ? `I'm reading it as ${reality ?? 'open'}, with ${list(themes)} at the centre. Tell me if that's off.`
        : 'I want to be careful not to guess too much yet.';
      const entries = relevant(`${message} ${wp.summary ?? ''}`, ['technique', 'genre'], 2);
      const qs = [
        who ? `What does ${cues.characters[0].startsWith('the ') ? '' : 'the '}${cues.characters[0]} want most right now, and what's in the way?` : 'Who are we following, and what do they want right now?',
        ...firstQuestions(entries, 2),
      ].slice(0, 3);
      return [opening, reflect, 'A few things would help me:\n' + qs.map((q) => `- ${q}`).join('\n')].join('\n\n');
    }

    case 'direction-change': {
      const lastRevision = wp.revisions?.at(-1)?.text ?? message;
      const shifted = wp.reality === 'speculative' && cues.reality === 'speculative';
      const entries = [getEntry('twist-of-perspective'), getEntry('dramatic-irony')].filter(Boolean);
      return [
        shifted ? "That's a real change of direction. It moves the story away from plain realism and gives it a secret to carry." : "Okay, that changes the shape of it.",
        `With "${clip(lastRevision.replace(/^\s*actually,?\s*/i, ''), 120)}", the earlier scenes would read differently once the reader knows.`,
        [
          'Some things worth deciding:',
          `- Does the emotional core you started with${wp.themes?.length ? ` (${list(wp.themes.filter((t) => t !== cues.themes[0]).slice(0, 2))})` : ''} stay, or does it become the cover for something else?`,
          '- Does the reader find out at the same moment the character does, or before? Letting the reader know first gives you dramatic irony; holding it back makes the reveal land as a shock.',
          ...firstQuestions(entries, 1).map((q) => `- ${q}`),
        ].join('\n'),
      ].join('\n\n');
    }

    case 'craft-question': {
      const e = search(message, { kinds: ['style', 'technique', 'structure', 'genre', 'form'], limit: 1 })[0];
      if (!e) return "I'm not sure which craft idea you mean. Can you say a little more? For example: a narrative technique, a structure, a style or a genre.";
      const parts = [`${e.name}: ${e.summary}`];
      if (e.conventions.length) parts.push(`It often shows up as ${list(e.conventions.slice(0, 3).map((c) => c.toLowerCase()))}.`);
      if (e.deliberateWhen.length) parts.push(`Worth knowing: ${e.deliberateWhen[0].replace(/\.$/, '')}.`);
      parts.push(e.questions[0] ? `If you want to try it in your own project: ${e.questions[0]}` : 'Want to talk through how it might apply to your project?');
      return parts.join('\n\n');
    }

    case 'request-ideas':
    case 'what-if':
    case 'discuss': {
      const entries = relevant(message, ['technique', 'structure', 'genre', 'style'], 3);
      if (!entries.length) {
        return "Tell me a bit more about what you're working with: who's in it, where it happens, or what feeling you're after. Then I can ask sharper questions or test an idea with you.";
      }
      const levers = entries.flatMap((e) => e.conventions.slice(0, 1).map((c) => `${e.name.toLowerCase()}: ${c.toLowerCase()}`)).slice(0, 3);
      const qs = firstQuestions(entries, 2);
      return [
        intent.type === 'what-if' ? "Let's follow that and see where it leads." : 'Here are some angles worth considering.',
        levers.length ? levers.map((l) => `- ${l}`).join('\n') : '',
        qs.length ? 'To narrow it down:\n' + qs.map((q) => `- ${q}`).join('\n') : '',
        "I'm using my built-in guidance right now, so I'm working from the craft library and what you've told me rather than reading your story in depth.",
      ].filter(Boolean).join('\n\n');
    }

    case 'feedback-request': {
      const e = search(message, { kinds: ['technique'], limit: 1 })[0] ?? getEntry('endings');
      return [
        modelReady
          ? "I can't give you a reliable read on that right now, and I don't want to guess about your story."
          : "I can't judge that properly without the language model, and I don't want to guess about your story.",
        `What I can do is ask what you want the reader to feel. ${e?.questions?.[0] ?? 'What should they expect, and what should they feel when it lands?'}`,
        'If you add the specific thing that worries you as a rule in Full Scan, I can mark every place it happens.',
      ].join('\n\n');
    }

    case 'share-passage': {
      const lines = ["Thanks for sharing that. I won't change a word of it, but here's what stands out."];
      if (report) lines.push(conversationalSummary(report));
      lines.push('Is there something specific you want me to look at?');
      return lines.join('\n\n');
    }

    default:
      return "I'm listening. Tell me more about what you're working on, or what's bothering you about it.";
  }
}

/** A short, plain-spoken read of a scan report. Points at things; never proposes text. */
export function conversationalSummary(report) {
  const rule = report.findings.filter((f) => f.section === 'rule' && f.class !== 'intentional-possibility');
  const obs = report.findings.filter((f) => f.section === 'observation' && f.class !== 'strength').slice(0, 2);
  const good = report.findings.filter((f) => f.class === 'strength').slice(0, 1);
  const bits = [];
  if (rule.length) bits.push(`${rule.length} place${rule.length === 1 ? '' : 's'} break your rules (I've marked ${rule.length === 1 ? 'it' : 'them'} in Full Scan).`);
  for (const f of obs) bits.push(sentenceCase(f.message));
  for (const f of good) bits.push(`Something that's working: ${f.message.charAt(0).toLowerCase()}${f.message.slice(1)}`);
  return bits.length ? bits.join(' ') : "Nothing jumps out from the checks I can run offline, which isn't the same as it being finished.";
}

// ── Answers from the offline library ────────────────────────────────────────

const workLine = (w) => `${w.title} (${w.author}${w.year ? `, ${w.year}` : ''})`;

/** One entry rendered as a short, sourced answer. Reference only: it says when a writer may depart from it. */
function renderEntry(e) {
  const head = `**${e.name}**  ·  ${KIND_LABELS[e.kind] ?? e.kind}${e.guide ? `  ·  ${e.guide}${e.asOf ? `, ${e.asOf}` : ''}` : ''}`;
  const lines = [head, e.summary];
  if (e.kind === 'work' && e.author) lines.push(`By ${e.author}${e.year ? `, ${e.year}` : ''}${e.language ? ` (${e.language})` : ''}.`);
  if (e.conventions.length) lines.push(e.conventions.slice(0, 4).map((c) => `- ${c}`).join('\n'));
  if (e.example) lines.push(`Example: ${e.example}`);
  if (e.watchFor[0]) lines.push(`Watch for: ${e.watchFor[0]}`);
  if (e.confidence === 'varies') lines.push('This varies by publisher, house style or region, so check the guide your project follows.');
  if (e.confidence === 'contested') lines.push('Informed writers and editors disagree about this one.');
  if (e.deliberateWhen[0]) lines.push(`Departing from it can be legitimate: ${e.deliberateWhen[0].replace(/\.$/, '')}.`);
  if (e.works?.length) lines.push(`Works to look at: ${e.works.slice(0, 4).map(workLine).join('; ')}.`);
  if (e.refs?.length) lines.push(`Read more: ${e.refs.slice(0, 2).join('; ')}.`);
  return lines.join('\n\n');
}

/**
 * Answer a question from the offline library: sourced, honest about edition and variation, and never presented as a rule
 * NIE enforces.
 * @param {{ strength: string, entries: object[], related: object[] }} answer  from answerFromLibrary()
 */
export function libraryReply(answer) {
  const body = answer.entries.slice(0, 2).map(renderEntry).join('\n\n---\n\n');
  const rest = [...answer.entries.slice(2), ...answer.related].slice(0, 4).map((e) => e.name);
  const tail = [];
  if (rest.length) tail.push(`Related in the library: ${rest.join(', ')}.`);
  tail.push(answer.strength === 'weak' ? "This is the closest I have, so tell me if it isn't what you meant." : 'This comes from my built-in library, so it works with no internet. Style guides are revised, so check the current edition for formal submissions.');
  return [`From NIE's built-in library:`, body, tail.join(' ')].join('\n\n');
}

/** Honest "not in my library", used when nothing relevant was found. */
export function libraryMissReply(answer) {
  const loading = !libraryStatus().loaded;
  const near = answer.near ?? [];
  if (!loading && near.length) {
    // Not an answer, but entries that share the question's words in their names: shown as the closest, never as the answer.
    const lines = near.map((e) => `- ${e.name}: ${firstSentence(e.summary)}`);
    return [
      "I don't have an entry that answers that exactly, and I won't guess, because I can't look things up offline. The closest entries in my built-in library are:",
      lines.join('\n'),
      "Ask about one of them by name, or name the form, genre, style guide or word you mean. If it is something you want kept consistent in your own text, add it as a rule in Full Scan and I'll mark every place that breaks it.",
    ].join('\n\n');
  }
  const nearNames = answer.related?.length ? ` The nearest entries I have are: ${answer.related.map((e) => e.name).join(', ')}.` : '';
  return [
    loading ? "My full library is still loading, so I can only answer from my core craft notes right now. Try again in a moment." : "That isn't in my built-in library, and I won't guess, because I can't look things up offline.",
    `${nearNames} Try naming the form, genre, style guide or word you mean. If it is something you want kept consistent in your own text, add it as a rule in Full Scan and I'll mark every place that breaks it.`.trim(),
  ].join('\n\n');
}
const firstSentence = (t) => { const m = String(t).match(/^.*?[.!?](?=\s|$)/); return (m ? m[0] : String(t)).slice(0, 220); };
