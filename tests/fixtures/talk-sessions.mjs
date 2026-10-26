// Scripted conversations for measuring, on the real model (scripts/talk-lab.mjs), how Brainstorm TALKS: does it understand what a message means in the context of the conversation (a standalone message, a reply to
// NIE's last reply, "yes", "the second one", a greeting after some work), answer like a thoughtful person, and actually help? The writers here are invented; nothing is anyone's project.
// Each conversation starts from a new, empty project (as a first-time user sees it). A writer's line cannot adapt to what NIE answers, so the lines are the kind a person types whatever came before.
// `note` is for whoever reads the transcript: what a person on the other end would see in that message.

export const TALK_SESSIONS = [
  {
    id: 'greet-fresh',
    about: 'A first hello in an empty project, small talk, then a vague wish to write.',
    steps: [
      { say: 'hey', note: 'a bare greeting; nothing else in the chat' },
      { say: 'how are you?', note: 'small talk aimed at NIE' },
      { say: "I want to write something but I don't know what yet", note: 'no idea yet: help them start' },
    ],
  },
  {
    id: 'greet-in-flow',
    about: 'Thanks, "ok cool" and a return after the writer has told NIE about their idea.',
    steps: [
      { say: "I'm writing a mystery set on a night train. The conductor vanishes between two stations.", note: 'a first statement of an idea' },
      { say: 'thanks!', note: 'thanks for NIE\'s reply to the idea; not a new topic' },
      { say: 'hey, back again', note: 'a greeting in a project that already has an idea' },
      { say: 'ok cool', note: 'an acknowledgement of whatever NIE just said' },
    ],
  },
  {
    id: 'premise-and-replies',
    about: 'An idea, then the writer answers NIE\'s last reply in the ways a person does: with detail, "yes", "no, not quite", "say more".',
    steps: [
      { say: "I'm working on a story about a lighthouse keeper who forges the tide tables.", note: 'the idea' },
      { say: 'I think she does it to protect her brother, he caused a wreck years ago.', note: 'detail that may or may not answer what NIE asked' },
      { say: 'yes', note: 'agreeing with NIE\'s last reply' },
      { say: 'no, not really, more that she is afraid of being found out', note: 'correcting NIE\'s last reply' },
      { say: 'can you say more about that?', note: '"that" is whatever NIE just said' },
    ],
  },
  {
    id: 'twists',
    about: 'A request for twists, then following up on one, pushing back, and thanking.',
    steps: [
      { say: 'I have a heist story: four friends rob the museum where one of them works. Can you give me some twists for the ending?', note: 'a request for ideas with context' },
      { say: 'the second one is interesting. why would that work?', note: '"the second one" is the second thing NIE just offered' },
      { say: 'hmm that feels a bit obvious, something less predictable?', note: 'pushback on NIE\'s last answer' },
      { say: 'I like that last one. what would it do to the narrator?', note: '"that last one" is the last thing NIE offered' },
      { say: 'thanks, that helps a lot', note: 'closing thanks' },
    ],
  },
  {
    id: 'stuck',
    about: 'A writer who is stuck and says little at first.',
    steps: [
      { say: "I'm completely stuck on my story and I don't know where to go with it", note: 'no details at all: ask and help, do not invent' },
      { say: "it's a fantasy about a girl who can hear the dead", note: 'the first real detail' },
      { say: "she doesn't want the gift. she's trying to ignore it", note: 'more detail' },
      { say: 'yeah exactly', note: 'agreeing with NIE\'s last reply' },
    ],
  },
  {
    id: 'character-callbacks',
    about: 'A named character, a question about her, and a later message that needs what was said before.',
    steps: [
      { say: 'My protagonist is Marta, a retired surgeon who lost her license after a mistake.', note: 'a named character' },
      { say: 'what should she want most?', note: '"she" is Marta' },
      { say: "she'd never admit it though", note: '"it" is whatever NIE just suggested she wants' },
      { say: 'what would Marta do when the hospital calls her back?', note: 'the name again, a new situation' },
      { say: "that's good. and her daughter?", note: 'a daughter nobody has mentioned yet' },
    ],
  },
  {
    id: 'pushback',
    about: 'A writer who rejects what NIE offers and asks to go back.',
    steps: [
      { say: 'I want a thriller about a translator who realises the speech she is translating is a lie.', note: 'the idea' },
      { say: 'give me a few directions', note: 'a request for ideas' },
      { say: "that's cliché", note: 'rejecting NIE\'s last answer' },
      { say: "no I don't like that direction, too political", note: 'rejecting again, with a reason' },
      { say: 'ok go back to the first thing you said', note: 'refers to NIE\'s first direction, earlier in the chat' },
    ],
  },
  {
    id: 'tired',
    about: 'A personal remark, "yeah", and then work.',
    steps: [
      { say: "I'm so tired today and I can't focus", note: 'not about the work: respond like a person' },
      { say: 'yeah', note: 'answering NIE\'s last reply' },
      { say: 'ok let\'s try anyway. my idea is a boy who finds a map inside a library book', note: 'the idea, after the small talk' },
    ],
  },
  {
    id: 'write-request',
    about: 'Asks NIE to write; NIE does not write the writer\'s text, and should say so kindly and still help.',
    steps: [
      { say: 'write the opening scene for me', note: 'a request NIE declines; no idea has been given' },
      { say: 'ok then just give me a first line', note: 'the same request, smaller' },
      { say: 'fine. what about the setting instead? it is a flooded city', note: 'a new, workable question' },
    ],
  },
  {
    id: 'meta',
    about: 'Questions about NIE and about what NIE remembers.',
    steps: [
      { say: 'I am writing about a girl who can hear the dead.', note: 'the idea' },
      { say: 'what can you do?', note: 'about NIE' },
      { say: 'are you a real person?', note: 'about NIE' },
      { say: 'do you remember what my story is about?', note: 'needs what the writer said at the start' },
    ],
  },
  {
    id: 'craft-then-story',
    about: 'A general craft question in the middle of talking about one\'s own story, then back to the story.',
    steps: [
      { say: "I'm writing about a lighthouse keeper who forges tide tables.", note: 'the idea' },
      { say: "what's a MacGuffin?", note: 'a general craft question' },
      { say: 'could the tide tables be one?', note: 'back to their story, using the answer and the idea' },
      { say: 'what else could work as one?', note: 'a follow-up: "one" is a MacGuffin' },
    ],
  },
];

// ── held out ─────────────────────────────────────────────────────────────────
// Conversations written AFTER the first round of fixes, about other subjects and in other voices, and never used to tune anything: the first set was read by whoever was fixing what it showed, so its
// results are partly the result of fixing those 45 turns. These are run on the final code to see whether the changes carry over to messages nobody looked at. (`--sessions heldout`.)
export const HELD_OUT_SESSIONS = [
  {
    id: 'ho-poem',
    about: 'A poem about a grandmother, with a detail, a doubt about form, a request to choose, and a goodbye.',
    steps: [
      { say: "i want to write a poem about my grandmother's kitchen", note: 'the idea; a poem' },
      { say: 'she always hummed while she cooked', note: 'a detail' },
      { say: "not sure it should rhyme", note: 'a doubt about form' },
      { say: 'which would you pick?', note: 'asks NIE to choose between rhyming and not' },
      { say: "ok i'll try it, thanks", note: 'a goodbye' },
    ],
  },
  {
    id: 'ho-essay',
    about: 'An essay on letters, an angle, agreement, a request for the opposite view, and a short reaction.',
    steps: [
      { say: "I'm writing an essay on why people stopped writing letters", note: 'the idea; an essay' },
      { say: 'my angle is that it was about patience, not technology', note: 'the writer states an angle' },
      { say: "that's kind of what I thought", note: 'agreement with NIE\'s last reply' },
      { say: 'what about the opposite view?', note: 'asks for the counter-argument' },
      { say: 'good point', note: 'a short reaction' },
    ],
  },
  {
    id: 'ho-world',
    about: 'A world where it always rains: statements, a question about it, a bare reaction, and "go on".',
    steps: [
      { say: "I'm building a world where it never stops raining", note: 'the idea' },
      { say: 'people live in tall towers connected by bridges', note: 'a detail' },
      { say: 'what do they eat?', note: 'a question about the world; NIE may suggest, not decide' },
      { say: 'interesting', note: 'a bare reaction' },
      { say: 'go on', note: 'asks NIE to continue' },
    ],
  },
  {
    id: 'ho-rejection',
    about: 'A discouraged writer, then back to work on a new idea.',
    steps: [
      { say: 'just got another rejection letter', note: 'not about the work: a person responds' },
      { say: "i dont think i'm any good at this", note: 'discouragement' },
      { say: "ok. i'll keep going i guess", note: 'a small step back' },
      { say: 'can we work on the opening of my novel? its about twin sisters who swap lives', note: 'a real request with an idea in it' },
    ],
  },
  {
    id: 'ho-terse',
    about: 'A terse writer: one or two words at a time.',
    steps: [
      { say: 'hm', note: 'nothing to go on' },
      { say: 'maybe a ghost story', note: 'a tiny idea' },
      { say: 'set in a school', note: 'a detail' },
      { say: 'yeah', note: 'agreeing with whatever NIE said' },
      { say: 'the janitor knows something', note: 'a detail from the writer' },
    ],
  },
  {
    id: 'ho-compare',
    about: 'Two ideas and a request to choose, a why, a combine, and a no.',
    steps: [
      { say: 'two ideas: a cat that predicts deaths, or a town where everyone shares one dream. which is better?', note: 'asks NIE for a view between two ideas' },
      { say: 'why?', note: 'asks for the reasoning behind NIE\'s view' },
      { say: 'ok combine them', note: 'asks NIE for a way to combine the two' },
      { say: "no that's too much", note: 'pushback on NIE\'s last answer' },
    ],
  },
  {
    id: 'ho-switch',
    about: 'One idea, then a different one, then a question that reaches back to the first.',
    steps: [
      { say: 'my novel is about a clockmaker whose clocks run backwards', note: 'the first idea' },
      { say: 'actually forget that. new idea: a chef who loses her sense of taste', note: 'a new idea replaces it' },
      { say: 'what should she do first?', note: '"she" is the chef' },
      { say: 'what was the clockmaker thing again?', note: 'asks NIE to recall the earlier idea' },
    ],
  },
  {
    id: 'ho-opinion',
    about: 'Asking NIE\'s opinion about a name, a follow-up, a new character, and a goodbye.',
    steps: [
      { say: 'what do you think of the name Elias for a lighthouse keeper?', note: 'asks NIE\'s opinion' },
      { say: 'is it too common?', note: 'follow-up about the name' },
      { say: 'ok. and her sister?', note: 'a new character; "her" is not defined yet' },
      { say: "thanks that's all for today", note: 'a goodbye' },
    ],
  },
];

// ── held out, second set ────────────────────────────────────────────────────
// Written after the first held-out set had been read and used to fix things (so that set is no longer held out), and not looked at, nor run, until the final code. Other subjects, other voices again.
export const HELD_OUT_SESSIONS_2 = [
  {
    id: 'h2-memoir',
    about: 'A memoir about a father who ran a hardware shop: a detail, a doubt, a request for structure, and thanks.',
    steps: [
      { say: "I'd like to write about my dad's hardware shop", note: 'the idea; a memoir, not said' },
      { say: 'he knew every customer by name and what they were fixing', note: 'a detail' },
      { say: "i'm worried it's boring", note: 'a doubt' },
      { say: 'how should I even start it?', note: 'asks for a way in; NIE offers concepts, not an opening line' },
      { say: 'ok thank you', note: 'thanks' },
    ],
  },
  {
    id: 'h2-screenplay',
    about: 'A screenplay premise, a hostile reaction to the first idea, and a request for the antagonist.',
    steps: [
      { say: 'screenplay idea: two rival bakers get snowed in together', note: 'the idea; a script' },
      { say: 'no, not a romance please', note: 'a boundary; "that" is whatever NIE just said' },
      { say: 'who should the antagonist be then?', note: 'asks for a suggestion' },
      { say: 'hm. boring', note: 'rejects NIE\'s suggestion, no reason' },
      { say: 'what if the snow is not really snow', note: 'the writer\'s own twist' },
    ],
  },
  {
    id: 'h2-lyrics',
    about: 'A song about moving away; short replies; "surprise me".',
    steps: [
      { say: 'writing a song about leaving my hometown', note: 'the idea; lyrics' },
      { say: 'the chorus should be about the train station', note: 'a plan; NIE must not write the chorus' },
      { say: 'surprise me', note: 'asks for something unexpected' },
      { say: 'ha that is actually good', note: 'a reaction to NIE\'s last suggestion' },
      { say: 'can you just write the chorus then', note: 'asks NIE to write; declined, with alternatives' },
    ],
  },
  {
    id: 'h2-childrens',
    about: 'A children\'s picture book, a question about the audience, and a question about NIE.',
    steps: [
      { say: 'i want to do a picture book about a shy octopus', note: 'the idea' },
      { say: 'for kids around four', note: 'the audience' },
      { say: 'is that too scary, an octopus?', note: 'asks for a view' },
      { say: 'are you able to remember all this tomorrow?', note: 'asks about NIE\'s memory; answered from facts' },
    ],
  },
  {
    id: 'h2-names',
    about: 'A fantasy map and a run of questions about names, with a correction and a pronoun that needs a referent.',
    steps: [
      { say: 'my fantasy world has three cities on one river', note: 'the idea; a world' },
      { say: 'the first one is a trading port', note: 'a detail; "the first one" is the writer\'s own' },
      { say: 'what should I call the port?', note: 'asks for naming ideas; NIE offers directions, not a final name' },
      { say: 'no, something shorter', note: 'a correction to NIE\'s last answer' },
      { say: 'and the second one?', note: '"the second one" is the second city' },
    ],
  },
  {
    id: 'h2-feedback',
    about: 'The writer asks whether the idea is any good, then answers a question NIE asked, then says they changed their mind.',
    steps: [
      { say: 'a detective who is afraid of the dark. is that any good?', note: 'asks for an honest view of an idea' },
      { say: 'she works nights, that is the problem', note: 'the writer\'s own detail' },
      { say: 'actually I changed my mind, she should be afraid of crowds', note: 'a correction by the writer' },
      { say: 'what does that change?', note: '"that" is the change' },
    ],
  },
  {
    id: 'h2-hate',
    about: 'The writer dislikes their own protagonist, jokes, and asks for help with a mean character.',
    steps: [
      { say: 'i hate my protagonist', note: 'frustration about the work' },
      { say: 'she is just so passive', note: 'the reason' },
      { say: 'haha yes exactly', note: 'agreement with whatever NIE said' },
      { say: 'give me a villain that would force her to act', note: 'a request for ideas' },
    ],
  },
  {
    id: 'h2-mixed',
    about: 'A greeting after a break, a question about craft in the middle, and a return to the story.',
    steps: [
      { say: 'hi again', note: 'a greeting; nothing in the project yet' },
      { say: "what's the difference between a theme and a motif?", note: 'a craft question' },
      { say: 'ok so my story is about a ferry that never arrives', note: 'the writer\'s idea after the craft answer' },
      { say: 'could the ferry be a motif?', note: 'connects the craft answer to the idea' },
      { say: 'thanks, bye for now', note: 'a goodbye' },
    ],
  },
];
