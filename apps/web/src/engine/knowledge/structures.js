import { entry as e } from './entry.js';

const S = 'structure';

// Structures are tools, not commandments.
export const structures = [
  e('three-act', S, 'Three-act structure', 'Setup, confrontation, resolution — with turning points between them.', {
    conv: ['Inciting incident around the end of the setup', 'Midpoint shift', 'Crisis and climax', 'Resolution'], intent: ['Stories that skip or delay a classic turning point may be deliberately episodic or open-ended'], q: ['Where does the situation change so that the character can no longer go back?'], kw: ['setup', 'confrontation', 'resolution', 'act', 'inciting incident'],
  }),
  e('five-act', S, 'Five-act structure', 'Exposition, rising action, climax, falling action, denouement.', { conv: ['Longer, shapelier rise and fall than three-act'], kw: ['freytag', 'pyramid', 'denouement', 'falling action'] }),
  e('heros-journey', S, 'Hero\'s journey', 'Departure from the ordinary world, trials, a transformative ordeal and return.', { aka: ['monomyth'], conv: ['Call, threshold, ordeal, return with something changed'], kw: ['campbell', 'quest', 'mentor', 'threshold', 'return'] }),
  e('beat-sheet', S, 'Beat-sheet structures', 'Prescriptive beat plans used in screenwriting and commercial fiction.', { watch: ['Mechanical beats can feel formulaic'], kw: ['beat sheet', 'beats', 'midpoint', 'all is lost'] }),
  e('kishotenketsu', S, 'Kishōtenketsu', 'Four-part structure (introduction, development, twist, reconciliation) that needs no central conflict.', { conv: ['Surprise through juxtaposition, not conflict'], intent: ['No antagonist or climax is expected'], kw: ['ki-sho-ten-ketsu', 'twist', 'no conflict', 'japanese'] }),
  e('nonlinear', S, 'Nonlinear narrative', 'Events presented out of chronological order.', { conv: ['Orientation cues for the reader', 'Arrangement that creates meaning'], intent: ['Jumps in time are the design'], q: ['What does the reader learn by seeing this event before the other?'], kw: ['out of order', 'timeline', 'jumbled', 'flash'] }),
  e('circular', S, 'Circular narrative', 'A story that ends where it began, usually changed.', { conv: ['Echoing opening and closing images'], intent: ['Repetition at start and end is intentional'], kw: ['loop', 'full circle', 'return'] }),
  e('nested', S, 'Nested narrative', 'Stories within stories, each framing the other.', { conv: ['Clear entry and exit from each level'], kw: ['story within a story', 'layers', 'embedded'] }),
  e('frame-narrative', S, 'Frame narrative', 'An outer story that contains and comments on an inner one.', { conv: ['The frame returns at the end'], kw: ['framing', 'storyteller', 'told to'] }),
  e('episodic', S, 'Episodic narrative', 'A sequence of loosely connected episodes held together by character or theme.', { intent: ['Weak causality between chapters is the form'], kw: ['episodes', 'series', 'picaresque', 'vignettes'] }),
  e('braided', S, 'Braided narrative', 'Several storylines interwoven, converging or echoing.', { conv: ['Each strand has its own pull', 'Cuts that create rhyme or contrast'], kw: ['intercut', 'multiple storylines', 'converge'] }),
  e('parallel', S, 'Parallel narrative', 'Two or more stories running side by side, often illuminating each other.', { kw: ['parallel', 'dual timeline', 'mirror'] }),
  e('multi-perspective', S, 'Multi-perspective narrative', 'The same story told through multiple viewpoints.', { conv: ['Distinct voices', 'Reveals through disagreement'], intent: ['Contradictions between accounts are often the point'], kw: ['rashomon', 'multiple narrators', 'viewpoints'] }),
  e('fragmented', S, 'Fragmented narrative', 'Story assembled from pieces — scenes, documents, images — that the reader must connect.', { conv: ['Gaps are meaningful', 'Order and juxtaposition carry meaning'], intent: ['Disjointedness is expected'], q: ['Is the fragmentation mimicking how the character remembers, or how the story is withheld?'], kw: ['fragment', 'collage', 'shards', 'mosaic', 'disjointed'] }),
  e('reverse-chronology', S, 'Reverse chronology', 'Events told from end to beginning.', { conv: ['Effect before cause creates dramatic irony'], kw: ['backwards', 'reverse', 'memento'] }),
  e('in-medias-res', S, 'In medias res', 'Beginning in the middle of the action.', { conv: ['Orientation arrives after the hook'], kw: ['middle of the action', 'opening', 'start in the middle'] }),
  e('vignette', S, 'Vignette structure', 'A series of brief, evocative scenes rather than a plot.', { intent: ['Missing plot is the point'], kw: ['vignette', 'snapshot', 'brief scenes'] }),
  e('anthology', S, 'Anthology structure', 'A collection of separate stories, often linked by theme.', { kw: ['collection', 'linked stories', 'themed'] }),
  e('stream-of-consciousness-structure', S, 'Stream-of-consciousness structure', 'Narrative organised by associative mental flow, not event order.', { conv: ['Association drives transitions'], intent: ['Run-on syntax and drifting time are intentional'], kw: ['associative', 'interior flow', 'joyce', 'woolf'] }),
  e('epistolary-structure', S, 'Epistolary structure', 'A story told through letters, diaries, emails, logs or other documents.', { conv: ['Each document has a voice and an occasion'], intent: ['Inconsistent register between documents can be deliberate'], kw: ['letters', 'diary', 'emails', 'documents', 'journal entries'] }),
  e('mystery-box-structure', S, 'Mystery-box structure', 'A central unexplained question sustains forward momentum.', { watch: ['Promise of an answer creates an obligation'], kw: ['unanswered', 'tease', 'reveal'] }),
  e('rule-of-three', S, 'Rule of three', 'Setup, repetition, variation; common in comedy, folk tale and escalation.', { kw: ['three', 'pattern', 'escalation'] }),
  e('tragic-arc', S, 'Tragic arc', 'A trajectory of fall: hubris or circumstance, recognition, catastrophe.', { kw: ['downfall', 'recognition', 'catastrophe'] }),
  e('open-ending', S, 'Open ending', 'An ending that withholds final resolution on purpose.', { intent: ['Lack of closure is the design'], q: ['What question should the reader be left holding?'], kw: ['ambiguous ending', 'unresolved', 'no resolution', 'refuses resolution'] }),
  e('slow-burn', S, 'Slow-burn pacing', 'Deliberately gradual accumulation of tension or feeling.', { conv: ['Small escalations', 'Atmosphere over event'], intent: ['Low early action is the method'], kw: ['slow', 'gradual', 'patient', 'creeping'] }),
];
