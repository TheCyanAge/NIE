import { search, getEntry, KIND_LABELS, libraryStatus, libraryStats } from '../knowledge/index.js';
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

/** The same request again, right after the first refusal: said differently and shorter, with something to do instead, never the same paragraph twice. */
export const DECLINE_WRITE_AGAIN =
  "Still a no on writing it for you; the words have to be yours. I can give you a few directions to react to, or ask what the scene needs. Which would help?";
export const DECLINE_EDIT_AGAIN =
  "Still no on rewording it. I can point to where something breaks your own rules, or talk through what the passage is doing. Which would help?";

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

/**
 * Questions about NIE itself are answered from fixed, checked facts, never by a language model: a small model describing its own app
 * invents abilities and rambles, and what NIE says about its own state must be exact. The question picks which facts to lead with.
 */
/** "What does your model / library / database know?", "what do you know?", "how big is your library?": answered from the real counts (see knowledgeReply). */
const KNOWLEDGE_QUESTION = /\bknow(?:s|ledge)?\b|\blibrary\b|\bdatabase\b|\btrained\b|\bremember\b|\bcontain|\bcover\b/i;
const ABOUT_TOPICS = [
  { id: 'person', re: /\b(?:real|actual)\s+(?:person|human)\b|\bare\s+you\s+(?:a\s+|an\s+)?(?:human|person|bot|robot|ai|machine|computer|program|real)\b|\bam\s+i\s+(?:talking|speaking|chatting)\s+(?:to|with)\s+(?:a\s+)?(?:person|human|bot|machine|real)/i, status: false,
    text: "No, I'm not a person. I'm NIE, an AI writing partner. I can't live your story the way you do, but I can think it through with you: ideas, complications, questions, and what the craft says about it. What are you working on?" },
  { id: 'writing', re: /\b(?:write|rewrite|edit|fix|proofread|ghost-?write)\b/i, status: false,
    text: "No. I never write, rewrite or edit your text; your words stay yours. What I can do is brainstorm with you, ask the questions that sharpen an idea, answer craft questions, and, in Full Scan, mark the exact places where your text breaks the rules you set and say why." },
  { id: 'model', re: /\b(?:which|what)\s+(?:language\s+)?(?:model|ai)\b|\bchat\s?gpt\b|\bgpt\b|\bllm\b|\bqwen\b|\b(?:offline|online)\s+(?:model|one|assistant|ai)\b|\bwho\s+(?:made|built|created|developed)\b|\bhow\s+(?:smart|good)\b/i, status: true,
    text: "I'm NIE. When I have a language model it is either the small offline one on this computer (Qwen2.5 3B Instruct by default) or the online model you chose in Settings. A small model is good company for ideas and questions but it is not an expert editor, and I say so when I can't give you a reliable read." },
  { id: 'formats', re: /\b(?:pdf|docx?|word\s+file|epub|rtf|odt|html|markdown|file\s+types?|formats?|import|open\s+a\s+(?:file|document))\b/i, status: false,
    text: "Read mode opens TXT, Markdown, HTML, RTF, Word (DOCX), OpenDocument (ODT), EPUB and PDF files (PDFs that contain text; there is no scanning of images). The text becomes your project's Story Text, and the original file is never changed." },
  { id: 'internet', re: /\b(?:offline|off-?line|internet|wi-?fi|online|connection|connected)\b/i, status: true,
    text: "NIE works with no internet. My built-in library and the checks in Full Scan run on this computer, and so does the offline language model once it has been downloaded (about 1.9 GB, one time). With the optional offline encyclopedia downloaded (Settings), I can also look things up with numbered sources with no internet at all. An online model, and looking things up on Wikipedia or the web, are optional and only used when you turn them on." },
  { id: 'privacy', re: /\b(?:store|stored|storing|save|saved|private|privacy|upload\w*|sent|share[ds]?|leave|keep)\b/i, status: false,
    text: "Your projects are stored on this computer and kept separate from each other. What you write is not sent anywhere unless you set up an online model in Settings; then what I send for a reply (your message and, when your question is about your own text, the parts of it that matter for that question) goes to that provider. If you download the offline encyclopedia in Settings, looking things up happens on this computer and nothing you ask leaves it. Otherwise looking things up is off until you turn it on. With nothing set up, it uses Wikipedia, which needs no key: when you ask me to look something up, only the words of that question go to Wikipedia (never your text or your project), I read the articles it returns, and I ask you once before using it. If this copy of NIE comes with its own search service, run by the NIE developers, the words go to that service instead, which asks a search provider for you and does not keep your questions. If you add your own search key in Settings, the words go to the service you chose." },
  { id: 'scan', re: /\bscan\b/i, status: true,
    text: "Full Scan: you set the rules for your project in plain words, and I mark the exact places in your text where a rule is broken and say briefly why. Rules that need meaning are judged by the language model when one is running; with no model they are approximated by keywords and labelled as such. Nothing is rewritten." },
];

/**
 * What NIE knows, said from the real counts: the offline language model and the built-in library are two different things, and the writer should hear which is which. (A small model asked
 * this on its own said it had no library; the library is the part that holds the facts.)
 */
const roundDown = (n) => (n >= 1000 ? `${(Math.floor(n / 100) * 100).toLocaleString('en-US')}` : n >= 100 ? `${Math.floor(n / 10) * 10}` : String(n));
export function knowledgeReply(status) {
  const st = libraryStats();
  const b = st.byKind;
  const own = st.total - st.derived;
  const lib = libraryStatus().loaded
    ? `For facts I use my built-in library, which is separate from the model and works with no internet. It holds about ${roundDown(own)} written entries: ${[
        b.genre && `${roundDown(b.genre)} genres and subgenres`,
        b.form && `${roundDown(b.form)} forms`,
        b.technique && `${roundDown(b.technique)} techniques and devices`,
        b.movement && `${roundDown(b.movement)} movements`,
        b.tradition && `${roundDown(b.tradition)} literary traditions`,
        b.work && `${roundDown(b.work)} notable works`,
        b.rule && `${roundDown(b.rule)} style-guide rules`,
        b.usage && `${roundDown(b.usage)} word-usage notes`,
      ].filter(Boolean).join(', ')}, plus publishing and formatting practice. When you ask about a genre, form, work or rule, I answer from the library and say what I'm drawing on.${st.profileSubjects ? ` For ${st.profileSubjects === 1 ? 'one subject' : `${st.profileSubjects} subjects`} so far it also holds a whole-subject profile (its history, subgenres, tropes, what readers expect, how it is built, how it differs from its neighbours, landmark works, pitfalls and vocabulary): ask for one facet, then keep going with "tell me more" or "what about its tropes?".` : ''}`
    : "For facts I use my built-in library, which is separate from the model and works with no internet. It is still loading, so for the next moment I can only answer from my core craft notes.";
  return [
    "There are two different things here, and I try to keep them apart.",
    "My offline language model (Qwen2.5 3B Instruct by default) is small. It learned general language and a lot about how people write from its training, and it is a good partner for ideas and conversation. It has no internet and no database, and it can be wrong about specific facts, dates, titles and who wrote what, so I don't treat it as a source for those.",
    lib,
    "The library cannot be complete, and it was written with AI help and checked by sampling rather than entry by entry, so for anything that matters (a citation, a date, a submission format), check a primary source. When something isn't in the library I say so instead of guessing.",
    describeStatus(status),
  ].join('\n\n');
}

export function aboutNieReply(status, text = '') {
  if (KNOWLEDGE_QUESTION.test(text)) return knowledgeReply(status);
  const topic = ABOUT_TOPICS.find((t) => t.re.test(text));
  if (topic) return [topic.text, ...(topic.status ? [describeStatus(status)] : [])].join('\n\n');
  return [
    "I'm NIE, a thinking partner for writers. I never write or edit your text; I help you think, and I show you where your own rules are broken.",
    ['Here is what I can do:', '- Brainstorm with you: ideas, twists, complications and questions for a story, essay, poem or anything else. I follow your idea in your own words, ask one question now and then (never the same one twice; say "stop asking questions" whenever you like), and when I think I have it I offer to keep it on your Idea Board and in this project\'s memory. You can add details first.', '- Full Scan: you set the rules for your project, and I mark the exact places that break them and say why.', '- Read your document aloud.', '- Answer questions about craft, style, grammar, forms, genres and well-known works from my built-in library, which works with no internet.', '- Look things up and answer with numbered sources: in the offline encyclopedia if you download it in Settings (no internet, nothing leaves this computer), otherwise on Wikipedia with nothing to set up, or on the wider web if you add a search key. Press the Web switch next to the message box; online lookups stay off until you agree to them.'].join('\n'),
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
      return aboutNieReply(status, message);

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

/** The line that introduces when a writer may depart from a convention. A movement or a tradition is not a rule to depart from: what is said there is simply worth keeping in mind. */
const departLabel = (e) => (e.kind === 'movement' || e.kind === 'tradition' ? 'Keep in mind:' : 'Departing from it can be legitimate:');
const workLine = (w) => `${w.title} (${w.author}${w.year ? `, ${w.year}` : ''})`;

/** One entry rendered as a short, sourced answer. Reference only: it says when a writer may depart from it. */
function renderEntry(e, { compact = false } = {}) {
  const head = `**${e.name}**  ·  ${KIND_LABELS[e.kind] ?? e.kind}${e.guide ? `  ·  ${e.guide}${e.asOf ? `, ${e.asOf}` : ''}` : ''}`;
  const lines = [head, e.summary];
  if (e.kind === 'work' && e.author) lines.push(`By ${e.author}${e.year ? `, ${e.year}` : ''}${e.language ? ` (${e.language})` : ''}.`);
  if (e.conventions.length) lines.push(e.conventions.slice(0, compact ? 3 : e.kind === 'profile' ? 10 : 4).map((c) => `- ${c}`).join('\n')); // (a profile's points ARE the answer: all of them)
  if (compact) return lines.join('\n\n'); // (side by side: what each is, in a few lines)
  if (e.example) lines.push(`Example: ${e.example}`);
  if (e.watchFor[0]) lines.push(`Watch for: ${e.watchFor[0]}`);
  if (e.confidence === 'varies') lines.push('This varies by publisher, house style or region, so check the guide your project follows.');
  if (e.confidence === 'contested') lines.push('Informed writers and editors disagree about this one.');
  if (e.deliberateWhen[0]) lines.push(`${departLabel(e)} ${e.deliberateWhen[0].replace(/\.$/, '')}.`);
  if (e.works?.length) lines.push(`Works to look at: ${e.works.slice(0, 4).map(workLine).join('; ')}.`);
  if (e.refs?.length) lines.push(`Read more: ${e.refs.slice(0, 2).join('; ')}.`);
  return lines.join('\n\n');
}

/** The rest of an overview entry: the points a first answer did not show (`from` is how many it did show), then what to watch for and the works to look at. */
function renderRest(e, from) {
  const lines = [`**${e.name}**  ·  ${KIND_LABELS[e.kind] ?? e.kind}`];
  const rest = (e.conventions ?? []).slice(from);
  if (rest.length) lines.push(rest.map((c) => `- ${c}`).join('\n'));
  // (what the overview already said is not said again: its first watch-for and first departure, its first four works and its first two readings)
  if (e.watchFor?.length > 1) lines.push(`Watch for: ${e.watchFor.slice(1).join(' ')}`);
  if (e.deliberateWhen?.length > 1) lines.push(`${departLabel(e)} ${e.deliberateWhen.slice(1).map((d) => d.replace(/\.$/, '')).join('; ')}.`);
  if (e.works?.length > 4) lines.push(`More works to look at: ${e.works.slice(4, 10).map(workLine).join('; ')}.`);
  if (e.refs?.length > 2) lines.push(`Read more: ${e.refs.slice(2, 5).join('; ')}.`);
  return lines.join('\n\n');
}

/**
 * Answer a question from the offline library: sourced, honest about edition and variation, and never presented as a rule
 * NIE enforces.
 * @param {{ strength: string, entries: object[], related: object[] }} answer  from answerFromLibrary()
 * @param {{ lead?: string, after?: string, rest?: { from: number }, compact?: boolean }} [thread]  a follow-up in a conversation about the library: its own lead line, a library note to add after the entries, and (rest) show the entry's unseen points instead of its overview
 */
export function libraryReply(answer, thread = {}) {
  // (A book that shares the subject's name, "Haiku" by R. H. Blyth under the form, is not a second card for the question: the works to look at are listed on the subject's own card.)
  const entries = answer.entries[0]?.kind === 'work' ? answer.entries : answer.entries.filter((e) => e.kind !== 'work');
  const body = thread.rest ? renderRest(entries[0], thread.rest.from) : entries.slice(0, 2).map((e) => renderEntry(e, { compact: thread.compact })).join('\n\n---\n\n');
  const rest = [...entries.slice(2), ...answer.related].slice(0, 4).map((e) => e.name);
  const tail = [];
  if (rest.length) tail.push(`Related in the library: ${rest.join(', ')}.`);
  const guided = answer.entries.some((e) => e.guide || e.kind === 'rule' || e.kind === 'usage');
  tail.push(answer.strength === 'weak' ? "This is the closest I have, so tell me if it isn't what you meant." : `This comes from my built-in library, so it works with no internet.${guided ? ' Style guides are revised, so check the current edition for formal submissions.' : ' It is reference knowledge, not a verdict on your project.'}`);
  return [thread.lead || `From NIE's built-in library:`, body, thread.after, tail.join(' ')].filter(Boolean).join('\n\n');
}

/** Honest "not in my library", used when nothing relevant was found. */
export function libraryMissReply(answer, { encyclopedia = false } = {}) {
  // (with the offline encyclopedia on this computer, "I can't look things up offline" would be false: say where to look instead)
  const cant = encyclopedia ? ', but the offline encyclopedia on this computer may: press the Web switch next to the message box and ask again, or say "look up" and the topic' : ', because I can\'t look things up offline';
  const loading = !libraryStatus().loaded;
  const near = answer.near ?? [];
  if (!loading && near.length) {
    // Not an answer, but entries that share the question's words in their names: shown as the closest, never as the answer.
    const lines = near.map((e) => `- ${e.name}: ${firstSentence(e.summary)}`);
    return [
      `I don't have an entry that answers that exactly, and I won't guess${cant}. The closest entries in my built-in library are:`,
      lines.join('\n'),
      "Ask about one of them by name, or name the form, genre, style guide or word you mean. If it is something you want kept consistent in your own text, add it as a rule in Full Scan and I'll mark every place that breaks it.",
    ].join('\n\n');
  }
  const nearNames = answer.related?.length ? ` The nearest entries I have are: ${answer.related.map((e) => e.name).join(', ')}.` : '';
  return [
    loading ? 'My full library is still loading, so I can only answer from my core craft notes right now. Try again in a moment.' : `That isn't in my built-in library, and I won't guess${cant}.`,
    `${nearNames} Try naming the form, genre, style guide or word you mean. If it is something you want kept consistent in your own text, add it as a rule in Full Scan and I'll mark every place that breaks it.`.trim(),
  ].join('\n\n');
}
const firstSentence = (t) => { const m = String(t).match(/^.*?[.!?](?=\s|$)/); return (m ? m[0] : String(t)).slice(0, 220); };
