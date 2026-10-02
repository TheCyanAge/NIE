import { entry as e } from './entry.js';

const F = 'form';

// Forms are what the writing *is* — NIE should read each on its own terms.
// `meta` flags are consumed by the profile interpreter (see profile/interpret.js).
export const forms = [
  e('novel', F, 'Novel', 'Long-form prose fiction with sustained characters, plot and theme.', { conv: ['Character arcs and structural movement over length'], kw: ['novel', 'book', 'chapters', 'manuscript'] }),
  e('short-story', F, 'Short story', 'Compact fiction organised around one effect, situation or turn.', { conv: ['Economy', 'A single decisive moment or shift'], kw: ['short story', 'flash fiction', 'story'] }),
  e('screenplay', F, 'Screenplay', 'A script for film or television, written for the screen.', { conv: ['Slug lines, action, dialogue', 'Only what can be seen or heard'], watch: ['Interior thought cannot be filmed'], kw: ['screenplay', 'film', 'int.', 'ext.', 'scene heading', 'fade in'] }),
  e('stage-play', F, 'Stage play', 'A script for live performance.', { conv: ['Dialogue-driven action', 'Stage directions'], kw: ['play', 'stage', 'act', 'enter', 'exit', 'theatre'] }),
  e('comic-script', F, 'Comic or graphic-novel script', 'A script describing panels, images and captions.', { conv: ['Panel descriptions', 'Economy of caption and balloon text'], kw: ['comic', 'graphic novel', 'panel', 'page', 'caption'] }),
  e('poetry', F, 'Poetry', 'Compressed, line-based writing where sound, image and line break carry meaning.', { conv: ['Line and stanza as units'], intent: ['Grammar and punctuation may be bent on purpose'], kw: ['poem', 'stanza', 'verse', 'line break'] }),
  e('prose-poem', F, 'Prose poem', 'Poetry in prose paragraphs.', { kw: ['prose poem', 'paragraph poem'] }),
  e('journal', F, 'Journal or diary', 'Dated, personal writing for oneself or a private record.', { conv: ['Immediacy', 'Candor', 'Non-linear attention'], intent: ['Plot and arc are not required; the voice is the point'], kw: ['journal', 'diary', 'entry', 'dear diary', 'today'] }),
  e('memoir', F, 'Memoir', 'Nonfiction narrative of lived experience, shaped by reflection.', { conv: ['Scenes plus reflection', 'The narrator\'s later understanding'], kw: ['memoir', 'my life', 'i remember', 'autobiograph'] }),
  e('personal-essay', F, 'Personal essay', 'Reflective nonfiction organised by an idea, not a plot.', { conv: ['A question explored through experience', 'Turn toward insight'], intent: ['Digression can be method'], kw: ['essay', 'reflection', 'argument', 'thesis'] }),
  e('essay', F, 'Essay', 'Nonfiction argument or exploration of an idea.', { conv: ['Thesis or guiding question', 'Evidence and development', 'Closing synthesis'], kw: ['essay', 'thesis', 'argue', 'claim', 'evidence'] }),
  e('report', F, 'Report', 'Structured, factual communication for a reader who needs to act or understand.', { conv: ['Summary first', 'Findings organised by importance', 'Plain, precise language'], watch: ['Narrative embellishment can undermine credibility'], kw: ['report', 'findings', 'summary', 'recommendation', 'methodology', 'executive'] }),
  e('news-narrative', F, 'News-style narrative', 'Reportage that tells what happened and why it matters, often in inverted-pyramid order.', { conv: ['Lede with the most important facts', 'Attribution', 'Declining importance'], kw: ['news', 'article', 'reported', 'according to', 'lede'] }),
  e('investigative-piece', F, 'Investigative piece', 'Long-form nonfiction that documents, verifies and explains concealed events.', { conv: ['Sourcing', 'Narrative structure used to carry evidence'], kw: ['investigation', 'sources', 'documents', 'exposé'] }),
  e('documentary-script', F, 'Documentary script', 'Narration and structure for nonfiction film.', { conv: ['Voice-over with visuals', 'Argument carried by selection and order'], kw: ['documentary', 'narration', 'voiceover', 'interview'] }),
  e('narrative-nonfiction', F, 'Narrative nonfiction', 'True accounts told with the tools of fiction.', { conv: ['Scene, character, tension', 'Accuracy as a constraint'], kw: ['true story', 'narrative nonfiction', 'creative nonfiction'] }),
  e('epistolary-form', F, 'Epistolary writing', 'Fiction or nonfiction in letters, emails or logs.', { conv: ['Documents with a sender, receiver and moment'], kw: ['letters', 'epistolary', 'email', 'logbook'] }),
  e('interactive-narrative', F, 'Interactive narrative', 'Branching or player-driven stories (gamebooks, text adventures, visual novels).', { conv: ['Choices with consequence', 'State tracking'], intent: ['Redundant text across branches can be structural'], kw: ['branching', 'choices', 'interactive', 'visual novel', 'gamebook'] }),
  e('game-writing', F, 'Game writing', 'Story, dialogue and lore for games.', { conv: ['Barks, quest text, environmental storytelling'], kw: ['game', 'quest', 'npc', 'barks', 'lore'] }),
  e('speech', F, 'Speech or monologue', 'Writing intended to be spoken to an audience.', { conv: ['Rhythm for the ear', 'Repetition for emphasis'], intent: ['Deliberate repetition is a rhetorical tool'], kw: ['speech', 'monologue', 'address', 'toast'] }),
  e('lyrics', F, 'Lyrics', 'Words written to be sung.', { kw: ['song', 'chorus', 'verse', 'lyrics'] }),
  e('fan-fiction', F, 'Fan fiction', 'Stories using existing worlds or characters.', { kw: ['fanfic', 'canon', 'au', 'shipping'] }),
  e('worldbuilding-document', F, 'Worldbuilding document', 'Reference writing that defines a setting, system or history.', { intent: ['Encyclopedic tone is correct here'], kw: ['lore', 'bible', 'setting', 'wiki', 'timeline'] }),
  e('experimental-text', F, 'Experimental text', 'Writing that does not fit established categories.', { intent: ['Unusual form is likely the point'], kw: ['experimental', 'hybrid', 'unclassifiable', 'avant-garde'] }),
];
