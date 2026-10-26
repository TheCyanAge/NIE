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
