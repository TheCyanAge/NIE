/**
 * What a writer might ask a lookup, for scripts/encyclopedia-lab.mjs: the real offline model answers from the real encyclopedia pack and each reply is checked against the numbered
 * articles it was shown. `kind` says what the question is testing; `after` keeps a question in the same conversation as the one before it (a follow-up).
 *   definition   "what/who is X": quoted from the article, no model
 *   fact         a fact or a few facts about a named thing: the model summarises articles
 *   explain      how or why: the model has to reason a little from the articles
 *   compare      two things
 *   relational   the answer is not named in the question (the pack may not find it: the reply must say so, not guess)
 *   absent       about something no article holds (an invented place, the future): the reply must say so
 *   follow       a short follow-up that means nothing alone
 *   story        talk about the writer's own story with the Web switch on: must NOT be sent to a lookup
 *   write        a request to write: must be declined, lookup or not
 *   fresh        questions added after the first measurements, never used to tune anything: do the fixes carry over?
 */
export const LAB_QUESTIONS = [
  { id: 'sonnet', kind: 'definition', say: 'What is a sonnet?' },
  { id: 'cleopatra', kind: 'definition', say: 'Who was Cleopatra?' },
  { id: 'lighthouse', kind: 'definition', say: 'What is a lighthouse?' },
  { id: 'haiku', kind: 'definition', say: 'What is a haiku?' },

  { id: 'everest', kind: 'fact', say: 'How tall is Mount Everest?' },
  { id: 'eiffel', kind: 'fact', say: 'When was the Eiffel Tower built?' },
  { id: 'eiffel-follow', kind: 'follow', say: 'and how tall is it?', after: 'eiffel' },
  { id: 'pride', kind: 'fact', say: 'Who wrote Pride and Prejudice and what is it about?' },
  { id: 'curie', kind: 'fact', say: 'What did Marie Curie discover?' },
  { id: 'machu', kind: 'fact', say: 'Where is Machu Picchu and who built it?' },
  { id: 'shelley', kind: 'fact', say: 'Tell me about Mary Shelley.' },
  { id: 'poe', kind: 'fact', say: 'What is Edgar Allan Poe known for?' },
  { id: 'odyssey', kind: 'fact', say: 'What is the Odyssey about?' },
  { id: 'wwii', kind: 'fact', say: 'When did World War II start and end?' },
  { id: 'lightspeed', kind: 'fact', say: 'What is the speed of light?' },
  { id: 'monalisa', kind: 'fact', say: 'Who painted the Mona Lisa and where is it now?' },
  { id: 'fire', kind: 'fact', say: 'What caused the Great Fire of London?' },
  { id: 'blackdeath', kind: 'fact', say: 'What was the Black Death and how many people died?' },
  { id: 'industrial', kind: 'fact', say: 'What was the Industrial Revolution?' },
  { id: 'french-rev', kind: 'fact', say: 'What happened in the French Revolution?' },

  { id: 'titanic', kind: 'explain', say: 'Why did the Titanic sink?' },
  { id: 'photosynthesis', kind: 'explain', say: 'How does photosynthesis work?' },
  { id: 'vaccines', kind: 'explain', say: 'How do vaccines work?' },
  { id: 'castles', kind: 'explain', say: 'How did medieval castles defend against attackers?' },
  { id: 'rome-food', kind: 'explain', say: 'What did people eat in ancient Rome?' },
  { id: 'sky', kind: 'explain', say: 'Why is the sky blue?' },
  { id: 'lighthouse-use', kind: 'explain', say: 'What was a lighthouse keeper\'s job?' },

  { id: 'simile', kind: 'compare', say: 'What is the difference between a metaphor and a simile?' },
  { id: 'novel-epic', kind: 'compare', say: 'How is an epic poem different from a novel?' },

  { id: 'capital-italy', kind: 'relational', say: 'What is the capital of Italy?' },
  { id: 'tallest', kind: 'relational', say: 'What is the tallest building in the world?' },
  { id: 'earhart', kind: 'relational', say: 'Who was the first woman to fly across the Atlantic?' },
  { id: 'telephone', kind: 'relational', say: 'Who invented the telephone?' },

  { id: 'veldhaven', kind: 'absent', say: 'What is the population of Veldhaven?' },
  { id: 'future', kind: 'absent', say: 'Who won the 2031 football World Cup?' },

  { id: 'story-arc', kind: 'story', say: 'My detective Mara keeps lying to her partner. Is that a good arc for her?' },
  { id: 'story-opening', kind: 'story', say: 'I think my opening chapter is too slow, what do you think?' },

  { id: 'write-scene', kind: 'write', say: 'Look up the Great Fire of London and write me a scene about it.' },

  { id: 'f-kili', kind: 'fresh', say: 'What is the tallest mountain in Africa?' },
  { id: 'f-thames', kind: 'fresh', say: 'How long is the River Thames?' },
  { id: 'f-wall', kind: 'fresh', say: 'When was the Great Wall of China built?' },
  { id: 'f-churchill', kind: 'fresh', say: 'Who was Winston Churchill?' },
  { id: 'f-volcano', kind: 'fresh', say: 'What is a volcano?' },
  { id: 'f-bones', kind: 'fresh', say: 'How many bones are in the human body?' },
  { id: 'f-brazil', kind: 'fresh', say: 'What language is spoken in Brazil?' },
  { id: 'f-cats', kind: 'fresh', say: 'Why do cats purr?' },
  { id: 'f-colosseum', kind: 'fresh', say: 'What was the Colosseum used for?' },
  { id: 'f-frankenstein', kind: 'fresh', say: 'Who wrote Frankenstein?' },
  { id: 'f-pompeii', kind: 'fresh', say: 'What happened at Pompeii?' },
  { id: 'f-rainbow', kind: 'fresh', say: 'How does a rainbow form?' },
];
