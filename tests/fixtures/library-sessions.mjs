// Scripted conversations ABOUT the library, for measuring on the real model (scripts/library-lab.mjs) and for checking, with no model, that the follow-ups are read as intended
// (tests/library-threads.test.js). Everything here is invented; nothing is anyone's project.
//
// Each step:  say          what the writer types
//             follow       the follow-up the engine should read it as when a language model is running (null = an ordinary message, not a follow-up; a list = any of these,
//                          for a subject whose facets the library may or may not hold yet)
//             followRules  the same, with no model (defaults to `follow`; a pronoun question the library cannot pick out is only understood when a model is running)
//             mustMention  groups of alternatives: the reply must mention one of each (words that only the library's record of the subject would give)
//             notLibrary   true: the reply must not be a library answer (it is about the writer's own story)

export const LIBRARY_SESSIONS = [
  {
    id: 'gothic-thread',
    about: 'A back-and-forth on one genre: its facets, more, a comparison, a pronoun question.',
    steps: [
      { say: 'What is gothic fiction?', follow: null, mustMention: [['castle', 'secrets', 'decay']] },
      { say: 'what about its tropes?', follow: 'facet', mustMention: [['house', 'castle', 'heroine', 'double', 'secret']] },
      { say: 'tell me more', follow: 'more', mustMention: [['Rebecca', 'heroine', 'ornate']] },
      { say: 'how is it different from horror?', follow: 'compare', mustMention: [['horror']] },
      { say: 'why did it start in Britain?', follow: 'context', followRules: null, mustMention: [['Walpole', 'Otranto', 'eighteenth', 'medieval', 'Enlightenment']] },
      { say: 'and who are the key authors?', follow: 'facet', mustMention: [['Walpole', 'Radcliffe', 'Shelley', 'Poe']] },
      { say: 'what do readers expect from it?', follow: 'facet', mustMention: [['reader', 'expect', 'atmosphere', 'dread', 'mood']] },
      { say: 'what is the vocabulary people use for it?', follow: 'facet', mustMention: [['Female Gothic', 'sublime', 'uncanny', 'terror', 'horror']] },
    ],
  },
  {
    id: 'another-subject',
    about: 'A new subject replaces the old one; naming another subject outright is a new question, not a follow-up.',
    steps: [
      { say: 'What is gothic fiction?', follow: null },
      { say: 'what are the tropes of romance?', follow: null },
      { say: 'and the history?', follow: ['facet', 'missing'], mustMention: [['romance', 'Romance']] }, // (a history of romance, or a plain statement that the library holds none)
      { say: 'tell me more', follow: 'more' },
    ],
  },
  {
    id: 'form-without-profile',
    about: 'A subject the library holds no facets of: a facet question is answered by saying so.',
    steps: [
      { say: 'What is a sestina?', follow: null, mustMention: [['sestina']] },
      { say: 'what about its tropes?', follow: ['missing', 'facet'] }, // (says it holds none, until the library has a profile of the sestina)
    ],
  },
  {
    id: 'form-with-profile',
    about: 'A form the library holds a whole-subject profile of: a facet question is answered from that profile, and "tell me more" goes on to the next part of it.',
    steps: [
      { say: 'What is a villanelle?', follow: null, mustMention: [['villanelle']] },
      { say: 'what about its history?', follow: 'facet', mustMention: [['Passerat', 'French', 'Thomas', 'Roethke', 'nineteen']] },
      { say: 'tell me more', follow: 'more' },
    ],
  },
  {
    id: 'not-hijacked',
    about: "Talk about the writer's own story is never taken for a library follow-up.",
    steps: [
      { say: 'What is gothic fiction?', follow: null },
      { say: 'My heroine is trapped in her aunt\'s house and starts hearing someone in the walls. What should she want most?', follow: null, notLibrary: true },
      { say: 'What does the aunt hide?', follow: null, notLibrary: true },
    ],
  },
];
