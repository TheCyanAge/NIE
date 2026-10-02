/**
 * Brainstorm vocabulary: WHAT is being brainstormed (kind) and HOW to push on it (lens).
 *
 * Brainstorm produces IDEAS: short, concept-level statements (a "what if", an angle, a complication, a hook, a question).
 * It never produces manuscript prose, dialogue or scene text, and never edits the writer's words.
 */

export const AUTO = 'auto';

/** What the writer is brainstorming. "auto" (Anything) infers it from what they say. */
export const KINDS = [
  { id: 'story', label: 'Story', blurb: 'Premises, twists, stakes, endings…' },
  { id: 'character', label: 'Characters', blurb: 'Wants, flaws, contradictions, relationships…' },
  { id: 'world', label: 'World', blurb: 'Rules, cultures, places, tensions…' },
  { id: 'article', label: 'Article', blurb: 'Angles, hooks, headlines, structure, sources…' },
  { id: 'essay', label: 'Essay & memoir', blurb: 'Through-lines, turns, scenes to mine…' },
  { id: 'poem', label: 'Poem', blurb: 'Images, forms, turns, constraints…' },
  { id: 'script', label: 'Script', blurb: 'Scene seeds, dynamics, visual ideas…' },
];
export const KIND_IDS = KINDS.map((k) => k.id);
export const kindLabel = (id) => KINDS.find((k) => k.id === id)?.label ?? 'Anything';
/** For sentences like "ideas for ${kindPhrase}". */
export const KIND_PHRASE = { story: 'a story', character: 'character work', world: 'a world-building project', article: 'an article', essay: 'an essay or memoir', poem: 'a poem', script: 'a script' };
export const kindPhrase = (id) => KIND_PHRASE[id] ?? 'a writing project';

/**
 * Every lens, with the words a writer might use for it (`match`), a plain label, and follow-up questions NIE can ask.
 * `ask` is what a button sends (so the conversation reads naturally).
 */
export const LENSES = {
  spark: { label: 'Spark ideas', ask: 'Give me a few sparks to react to.', match: /\b(sparks?|inspir\w*|surprise me|anything|i'?m stuck|random ideas?)\b/i, follow: ['Which of these made you feel something, even if you hate it?', 'Is there one you would keep a piece of?'] },
  premise: { label: 'Premises', ask: 'Give me some premise ideas.', match: /\b(premises?|story ideas?|plot ideas?|concepts?|loglines?|pitch(?:es)?)\b/i, follow: ['Which one would you still want to read in a year?', 'What is the one thing you would change about the closest one?'] },
  next: { label: 'What happens next', ask: 'What could happen next?', match: /\b(what (?:could|should|might) happen next|next beat|next scene|what next|where (?:does|could) it go)\b/i, follow: ['Which direction surprises you the most?', 'What does the character not see coming?'] },
  twist: { label: 'Twists', ask: 'Give me some twists.', match: /\b(twists?|surprises?|reveals?|reversals?|plot twists?|shock)\b/i, follow: ['Which twist can you foreshadow fairly?', 'Does the twist change what the reader thought the story was about?'] },
  opposite: { label: 'Flip it', ask: 'Flip it. Give me the opposite.', match: /\b(opposite|flip (?:it|this)|invert|reverse (?:it|this)|other way around|turn (?:it|this) around)\b/i, follow: ['Does the flipped version feel truer or just stranger?', 'What would stay the same if you flipped it?'] },
  stakes: { label: 'Raise the stakes', ask: 'Raise the stakes.', match: /\b(stakes|raise the stakes|higher stakes|more at stake|what'?s at risk|make it matter)\b/i, follow: ['What is the worst thing that could realistically be lost?', 'Who else is hurt if they fail?'] },
  complication: { label: 'Complications', ask: 'Give me some complications.', match: /\b(complicat\w*|obstacles?|make it harder|harder for them|get in the way|problems?)\b/i, follow: ['Which obstacle forces a real choice, not just effort?', 'Which one comes from the character rather than from outside?'] },
  secret: { label: 'Secrets', ask: 'Give me some secrets.', match: /\b(secrets?|hidden|concealed|what are they hiding|hiding something)\b/i, follow: ['Who needs this secret kept the most?', 'When should the reader learn it, and when should the character?'] },
  conflict: { label: 'Conflicts', ask: 'Give me some conflicts.', match: /\b(conflicts?|tension|clash|rivalry|opposition|antagonist|villain)\b/i, follow: ['Is the real conflict outside them or inside?', 'Who is right, in their own mind?'] },
  theme: { label: 'Themes', ask: 'What could this be really about?', match: /\b(themes?|what is (?:it|this) really about|deeper meaning|message|meaning)\b/i, follow: ['Which theme could you argue with, not just illustrate?', 'What would a character who disagrees with it say?'] },
  ending: { label: 'Endings', ask: 'Give me some ending ideas.', match: /\b(endings?|ending ideas?|how (?:does|should|could) (?:it|this) end|conclusion|last scene|finale)\b/i, follow: ['What should the reader feel in the last line?', 'Which ending would feel inevitable only in hindsight?'] },
  opening: { label: 'Openings', ask: 'Give me some opening ideas.', match: /\b(openings?|opening ideas?|how (?:do|should|could) i (?:start|open|begin)|first (?:scene|line|page|image)|starting point)\b/i, follow: ['What question does the opening plant?', 'Where would you cut in: before, during or after the trouble starts?'] },
  pov: { label: 'Point of view', ask: 'Give me some point-of-view ideas.', match: /\b(pov|point of view|who tells|narrator|perspective|whose eyes|narration)\b/i, follow: ['What does this narrator not know, or not admit?', 'Whose version of events would be the most interesting to distrust?'] },
  structure: { label: 'Structure', ask: 'Give me some structure ideas.', match: /\b(structur\w*|shape|organi[sz]e|outline|order|chronolog\w*|timeline|how (?:should|could) i (?:arrange|lay out))\b/i, follow: ['What does the order of events let the reader feel that a straight line would not?', 'Where is the hinge of the whole thing?'] },
  setting: { label: 'Settings', ask: 'Give me some setting ideas.', match: /\b(settings?|locations?|where (?:does|should|could) (?:it|this) (?:happen|take place|be set))\b/i, follow: ['What can only happen in this place?', 'What does the place want from the people in it?'] },
  blend: { label: 'Blend genres', ask: 'Blend it with another genre.', match: /\b(blend|mix (?:it|this)? ?with|combine genres?|cross(?:over)? with|genre mashup|mash-?up)\b/i, follow: ['Which genre is the engine and which is the pressure?', 'What would each genre ban that the other requires?'] },
  title: { label: 'Titles', ask: 'Give me some title ideas.', match: /\b(titles?|title ideas?|what should i call|name for (?:it|this|the (?:story|book|piece|article|poem))|call it)\b/i, follow: ['Does the title promise the right thing, or a slightly wrong thing on purpose?', 'Which one sounds like it could only belong to this piece?'] },
  motif: { label: 'Motifs', ask: 'Give me some motif ideas.', match: /\b(motifs?|recurring|symbols?|symbolism|imagery|refrain|image patterns?)\b/i, follow: ['What should the image mean the first time, and what the last?', 'Which one would you stop noticing and then suddenly notice again?'] },
  question: { label: 'Questions to answer first', ask: 'What questions should I answer first?', match: /\b(questions? (?:to|i should) (?:ask|answer|resolve)|what do i (?:need|have) to (?:decide|know)|what am i missing|what should i figure out)\b/i, follow: ['Which of these can you answer right now, without thinking too hard?', 'Which one are you avoiding?'] },
  develop: { label: 'Develop it', ask: 'Help me develop it.', match: /\b(develop|flesh (?:it )?out|expand (?:on )?(?:it|this)|build (?:on|out)|take (?:it|this) further|go deeper)\b/i, follow: ['Which of these opens the most for you?', 'What is the part you are least sure about?'] },
  // Characters
  want: { label: 'What they want', ask: 'What could they want?', match: /\b(wants?|desires?|goals?|motivations?|drive|what do(?:es)? (?:he|she|they|it) want)\b/i, follow: ['What do they say they want, and what do they actually want?', 'What would they give up to get it?'] },
  flaw: { label: 'Flaws', ask: 'Give me some flaws.', match: /\b(flaws?|weakness(?:es)?|blind spots?|failings?|vices?)\b/i, follow: ['Which flaw makes them hardest to like and easiest to understand?', 'Which flaw costs them the most?'] },
  contradiction: { label: 'Contradictions', ask: 'Give me some contradictions.', match: /\b(contradictions?|paradox\w*|complex(?:ity)?|layers?|surprising about)\b/i, follow: ['Which contradiction would a stranger notice first?', 'When does the contradiction become a problem?'] },
  relationship: { label: 'Relationships', ask: 'Give me some relationship ideas.', match: /\b(relationships?|dynamics?|bond|friendship|rivalry|family|between them)\b/i, follow: ['What does each of them want from the other that they would never ask for?', 'What is the oldest unspoken thing between them?'] },
  history: { label: 'History', ask: 'Give me some backstory ideas.', match: /\b(history|backstory|past|where (?:do(?:es)? (?:he|she|they)) come from|origin)\b/i, follow: ['Which piece of the past is still doing damage?', 'What would they never tell someone new?'] },
  quirk: { label: 'Quirks', ask: 'Give me some quirks and habits.', match: /\b(quirks?|habits?|mannerisms?|tics?|voice|speech)\b/i, follow: ['Which habit would reveal them in a single moment?', 'Which one would they hide?'] },
  arc: { label: 'Arcs', ask: 'Give me some arc ideas.', match: /\b(arcs?|change|growth|transform\w*|journey|develop(?:ment)? of (?:the )?character)\b/i, follow: ['Do they change, or do they refuse to, and what does that cost?', 'What is the smallest moment that shows the change?'] },
  foil: { label: 'Foils', ask: 'Give me some foil ideas.', match: /\b(foils?|opposite character|counterpart|sidekick|ally)\b/i, follow: ['What does the foil see in them that they cannot?', 'What do they admire in the foil?'] },
  // World
  rule: { label: 'Rules', ask: 'Give me some world rules.', match: /\b(rules?|laws?|limits?|magic system|how does (?:it|the world) work)\b/i, follow: ['What does this rule cost?', 'Who benefits from the rule and who pays for it?'] },
  culture: { label: 'Cultures', ask: 'Give me some culture ideas.', match: /\b(cultures?|customs?|traditions?|beliefs?|society|religion|ritual)\b/i, follow: ['What do outsiders misunderstand about this?', 'What would a teenager here rebel against?'] },
  place: { label: 'Places', ask: 'Give me some place ideas.', match: /\b(places?|locations?|landmarks?|map|geograph\w*|city|town)\b/i, follow: ['Where would a character go to be alone?', 'Which place is the most contested?'] },
  tension: { label: 'Tensions', ask: 'Give me some world tensions.', match: /\b(tensions?|faultlines?|power struggle|politics?|factions?)\b/i, follow: ['Which tension can no one afford to name?', 'Who profits if it never resolves?'] },
  texture: { label: 'Texture', ask: 'Give me some texture and detail ideas.', match: /\b(textures?|details?|everyday life|atmosphere|flavou?r|sensory)\b/i, follow: ['Which detail would you only notice if you lived there?', 'What is ordinary here and shocking elsewhere?'] },
  // Articles and essays
  angle: { label: 'Angles', ask: 'Give me some angles.', match: /\b(angles?|approach(?:es)?|take on|perspective on|way in|slant|lens)\b/i, follow: ['Which angle would you be curious enough to spend a week on?', 'Which angle has no one else covered well?'] },
  hook: { label: 'Hooks', ask: 'Give me some hook ideas.', match: /\b(hooks?|lede|lead|grab (?:the )?reader|attention|opening hook)\b/i, follow: ['What will the reader think they are about to learn?', 'Which hook can you actually deliver on?'] },
  headline: { label: 'Headlines', ask: 'Give me some headline ideas.', match: /\b(headlines?|titles? for (?:the|my) article|clickable)\b/i, follow: ['Which headline promises something the piece truly delivers?', 'Which one would you click, and be glad you did?'] },
  sources: { label: 'Sources to find', ask: 'Who or what should I look for as sources?', match: /\b(sources?|interview\w*|who should i (?:talk|speak) to|research|evidence|data|where (?:do|can) i find)\b/i, follow: ['Which source would disagree with your angle?', 'What can only be learned in person?'] },
  counter: { label: 'Counter-arguments', ask: 'What are the strongest counter-arguments?', match: /\b(counter-?arguments?|objections?|disagree|rebuttals?|devil'?s advocate|pushback)\b/i, follow: ['Which objection is the strongest, honestly?', 'What would change your mind?'] },
  reader: { label: 'The reader', ask: 'Who is the reader, and what do they need?', match: /\b(readers?|audience|who is (?:this|it) for|target)\b/i, follow: ['What does your reader already believe about this?', 'What would make them stop reading?'] },
  case: { label: 'Cases and examples', ask: 'Give me some case-study and example ideas.', match: /\b(case stud(?:y|ies)|examples?|anecdotes?|stories? to illustrate|illustrations?)\b/i, follow: ['Which example is surprising rather than just typical?', 'Which example would the reader remember a week later?'] },
  myth: { label: 'Myths to bust', ask: 'What myths could this piece challenge?', match: /\b(myths?|misconceptions?|common belief|assumptions?|myth-?bust\w*)\b/i, follow: ['Who believes this myth, and why is it sensible to?', 'What is the truer, more complicated version?'] },
  scope: { label: 'Narrow it down', ask: 'Help me narrow it down.', match: /\b(scope|narrow (?:it|this)? ?down|too broad|focus|smaller|manageable)\b/i, follow: ['What could you cut and not miss?', 'What is the one question this piece must answer?'] },
  format: { label: 'Formats', ask: 'What formats could this take?', match: /\b(formats?|explainer|profile|listicle|q&a|interview piece|long-?form|investigation|how-?to|what kind of piece)\b/i, follow: ['Which format makes the idea easiest to feel?', 'Which format would surprise your usual reader?'] },
  thread: { label: 'Through-lines', ask: 'What could be the through-line?', match: /\b(through-?lines?|thread|spine|central idea|connecting|what ties)\b/i, follow: ['Which through-line can carry the whole piece?', 'What gets cut if you commit to this one?'] },
  turn: { label: 'The turn', ask: 'What could the turn or insight be?', match: /\b(turns?|insights?|realization|epiphany|what i learned|the point)\b/i, follow: ['Is the insight earned by the material, or tacked on?', 'What did you believe before that you cannot any more?'] },
  scene: { label: 'Scenes to mine', ask: 'What scenes or memories could I mine?', match: /\b(scenes? to mine|memories|moments|remember|episodes|anecdotes? from my life)\b/i, follow: ['Which memory do you keep returning to without knowing why?', 'Which memory would embarrass you, and is that the one?'] },
  // Poetry and script
  image: { label: 'Images', ask: 'Give me some image ideas.', match: /\b(images?|imagery|metaphors?|similes?|what does it look like)\b/i, follow: ['Which image can carry the feeling without naming it?', 'Which image surprises you?'] },
  form: { label: 'Forms', ask: 'What forms could this take?', match: /\b(forms?|sonnet|haiku|villanelle|free verse|stanza|line breaks?|shape)\b/i, follow: ['What does the form make difficult, on purpose?', 'Where should the form break?'] },
  voice: { label: 'Voice', ask: 'Give me some voice ideas.', match: /\b(voice|speaker|persona|tone of voice|who is speaking)\b/i, follow: ['Who is the speaker talking to?', 'What does the speaker avoid saying?'] },
  constraint: { label: 'Constraints', ask: 'Give me some constraints to play with.', match: /\b(constraints?|limits? to play with|rules to follow|challenge myself|exercise)\b/i, follow: ['Which constraint would be fun, and which one would actually help?', 'What does the constraint force you to leave out?'] },
  sound: { label: 'Sound', ask: 'Give me some sound and rhythm ideas.', match: /\b(sounds?|rhythm|rhyme|music|cadence|alliteration)\b/i, follow: ['Where should the sound get in the way of the sense?', 'What should the last sound be?'] },
  visual: { label: 'Visual ideas', ask: 'Give me some visual ideas.', match: /\b(visuals?|visual ideas?|shots?|cinematic|what do we see|camera)\b/i, follow: ['What can the audience see that the characters cannot?', 'Which image would you put on the poster?'] },
  dynamic: { label: 'Dynamics', ask: 'Give me some character dynamic ideas.', match: /\b(dynamics?|power balance|who has the power|status|subtext)\b/i, follow: ['Who has the power at the start, and who at the end?', 'What is the scene really about underneath?'] },
};

export const LENS_IDS = Object.keys(LENSES);

/** Lenses a kind's idea bank may contain. */
export const LENSES_BY_KIND = {
  story: ['spark', 'premise', 'next', 'twist', 'opposite', 'stakes', 'complication', 'secret', 'conflict', 'theme', 'ending', 'opening', 'pov', 'structure', 'setting', 'blend', 'title', 'motif', 'question'],
  character: ['spark', 'want', 'flaw', 'contradiction', 'secret', 'relationship', 'history', 'quirk', 'arc', 'foil', 'question'],
  world: ['spark', 'rule', 'culture', 'place', 'history', 'tension', 'texture', 'secret', 'question'],
  article: ['spark', 'angle', 'hook', 'headline', 'structure', 'sources', 'counter', 'reader', 'case', 'myth', 'scope', 'format', 'question'],
  essay: ['spark', 'angle', 'hook', 'thread', 'structure', 'turn', 'scene', 'tension', 'ending', 'title', 'question'],
  poem: ['spark', 'image', 'form', 'turn', 'voice', 'constraint', 'angle', 'sound', 'title', 'question'],
  script: ['spark', 'premise', 'scene', 'conflict', 'visual', 'twist', 'structure', 'dynamic', 'title', 'question'],
};
// A "scene" lens exists for essays (memories to mine) and scripts (scene seeds); both are in LENSES via 'scene'.

/** The "mixed" rotation used for a plain "give me ideas": one idea from each of several different lenses. */
export const ROTATION = {
  story: ['twist', 'complication', 'stakes', 'secret', 'opposite', 'setting', 'theme', 'conflict', 'next', 'motif'],
  character: ['want', 'contradiction', 'flaw', 'secret', 'relationship', 'history', 'quirk', 'foil', 'arc'],
  world: ['rule', 'tension', 'culture', 'texture', 'place', 'secret', 'history'],
  article: ['angle', 'hook', 'myth', 'case', 'counter', 'format', 'sources', 'reader', 'scope', 'headline'],
  essay: ['angle', 'thread', 'scene', 'turn', 'tension', 'hook', 'ending'],
  poem: ['image', 'turn', 'constraint', 'voice', 'angle', 'form', 'sound'],
  script: ['conflict', 'scene', 'twist', 'dynamic', 'visual', 'premise', 'structure'],
};

/** Quick-action buttons shown under the composer for each kind. */
export const BUTTONS = {
  auto: ['spark', 'premise', 'twist', 'angle', 'opposite', 'stakes', 'question'],
  story: ['spark', 'twist', 'opposite', 'stakes', 'complication', 'blend', 'ending', 'title', 'question'],
  character: ['want', 'flaw', 'contradiction', 'secret', 'relationship', 'quirk', 'question'],
  world: ['rule', 'tension', 'culture', 'texture', 'secret', 'question'],
  article: ['angle', 'hook', 'headline', 'myth', 'counter', 'sources', 'format', 'scope'],
  essay: ['angle', 'thread', 'scene', 'turn', 'hook', 'ending', 'title'],
  poem: ['image', 'constraint', 'form', 'turn', 'voice', 'title'],
  script: ['premise', 'scene', 'conflict', 'twist', 'dynamic', 'visual', 'title'],
};

const KIND_WORDS = [
  ['article', /\b(articles?|blog(?: posts?)?|op-?eds?|newsletters?|feature stor(?:y|ies)|magazine pieces?|white ?papers?|listicles?|explainers?|press release|journalism|news (?:story|piece))\b/i],
  ['essay', /\b(essays?|memoirs?|personal essays?|autobiograph\w*|creative non-?fiction)\b/i],
  ['poem', /\b(poems?|poetry|sonnets?|haiku|lyrics|song ?writing|song lyrics)\b/i],
  ['script', /\b(screenplays?|scripts?|sitcoms?|tv (?:show|series|pilot)|stage plays?|short films?|feature films?|graphic novels?|comics?|audio drama|radio plays?|teleplays?)\b/i],
  ['character', /\b(characters?|protagonists?|antagonists?|villains?|heroes|heroines?)\b/i],
  ['world', /\b(world-?building|world building|magic systems?|fictional (?:world|country|society)|the world of)\b/i],
  ['story', /\b(stor(?:y|ies)|novels?|short stor(?:y|ies)|plots?|fiction|fantasy|thriller|mystery|romance|horror)\b/i],
];

/** Infer the kind from the writer's words; returns null when nothing in the message says. */
export function detectKind(text) {
  const t = String(text ?? '');
  for (const [kind, re] of KIND_WORDS) if (re.test(t)) return kind;
  return null;
}

/** Which lens (if any) is the writer asking for? Specific beats generic; returns null for a plain "give me ideas". */
export function detectLens(text) {
  const t = String(text ?? '');
  if (/^\s*let'?s develop this idea\b/i.test(t)) return 'develop';
  const order = LENS_IDS.filter((id) => !['spark', 'develop'].includes(id));
  const hits = order.filter((id) => LENSES[id].match.test(t));
  if (hits.length) return hits[0];
  if (LENSES.develop.match.test(t)) return 'develop';
  if (LENSES.spark.match.test(t)) return 'spark';
  return null;
}
