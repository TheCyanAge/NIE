import { entry as e } from './entry.js';

const G = 'genre';

// Genres are vocabularies a project may draw on — never boxes a story is forced into.
export const genres = [
  // ── Horror ────────────────────────────────────────────────────────────────
  e('horror', G, 'Horror', 'Fiction built to produce dread, fear or revulsion, usually by threatening what a character (and reader) cannot control.', {
    conv: ['Escalating threat or wrongness', 'Vulnerability of the viewpoint character', 'Withholding or delaying the full shape of the threat'],
    intent: ['Anticlimax or an unexplained ending can be the point: unresolved dread lingers'],
    q: ['What is the thing the reader should fear most: being hurt, being wrong, or being alone?', 'How much does the reader see versus suspect?'],
    kw: ['fear', 'dread', 'scary', 'monster', 'haunted', 'terror'],
  }),
  e('psychological-horror', G, 'Psychological horror', 'Horror that comes from a mind under strain: perception, memory and sanity become unreliable.', {
    parent: 'horror', conv: ['Ambiguity about what is real', 'Interior focus', 'Slow erosion rather than sudden attack'],
    intent: ['Contradictions and shifting details are often deliberate here, not continuity errors'],
    q: ['Does the reader ever get a stable ground truth, or only the character\'s version?'], kw: ['paranoia', 'sanity', 'gaslighting', 'delusion', 'unreliable'],
  }),
  e('cosmic-horror', G, 'Cosmic horror', 'Horror of insignificance: forces so vast and indifferent that understanding them is itself destructive.', {
    parent: 'horror', aka: ['Lovecraftian', 'weird fiction'], conv: ['Forbidden knowledge', 'Human scale versus incomprehensible scale', 'Narrators who record rather than defeat'],
    q: ['What does the character learn that cannot be unlearned?'], kw: ['eldritch', 'cosmic', 'ancient', 'void', 'incomprehensible'],
  }),
  e('body-horror', G, 'Body horror', 'Horror centered on transformation, violation or decay of the body.', {
    parent: 'horror', conv: ['Bodily change as dread or metaphor', 'Visceral, specific physical detail'], q: ['What is the body change standing in for: illness, identity, age, desire?'], kw: ['mutation', 'transformation', 'flesh', 'infection', 'disease'],
  }),
  e('folk-horror', G, 'Folk horror', 'Horror rooted in landscape, isolation and old belief: communities whose customs are the threat.', {
    parent: 'horror', conv: ['Rural or isolated setting', 'Outsider entering a closed community', 'Ritual and tradition as menace'], q: ['What does the community believe that the outsider does not?'], kw: ['ritual', 'village', 'pagan', 'cult', 'harvest', 'rural'],
  }),
  e('supernatural-horror', G, 'Supernatural horror', 'Horror from ghosts, spirits, curses or other beings that break natural law.', {
    parent: 'horror', conv: ['Rules (even loose ones) for the supernatural', 'Past wrongs returning'], q: ['What does the haunting want, and is it knowable?'], kw: ['ghost', 'haunting', 'curse', 'possession', 'spirit', 'demon'],
  }),
  e('survival-horror', G, 'Survival horror', 'Horror of scarcity and pursuit: limited resources against an overwhelming threat.', {
    parent: 'horror', conv: ['Resource pressure', 'Constrained escape routes', 'Hard choices about who or what to sacrifice'], kw: ['survival', 'trapped', 'scarcity', 'stalked'],
  }),
  e('existential-horror', G, 'Existential horror', 'Horror of meaninglessness, mortality or the loss of a stable self.', {
    parent: 'horror', conv: ['Quiet, reflective dread', 'Ordinary settings made alien'], intent: ['Plot may deliberately refuse to resolve'], kw: ['meaningless', 'mortality', 'nihilism', 'void', 'identity'],
  }),
  e('gothic-horror', G, 'Gothic horror', 'Atmosphere-driven horror of decaying houses, family secrets and the weight of the past.', {
    parent: 'horror', aka: ['gothic'], conv: ['Oppressive setting as character', 'Buried secrets', 'Heightened emotion'], kw: ['mansion', 'secret', 'inheritance', 'decay', 'atmospheric'],
  }),
  e('slasher', G, 'Slasher', 'Horror in which a relentless killer pursues a group, often with a survivor figure.', {
    parent: 'horror', conv: ['Escalating kill sequence', 'A final survivor', 'Rules the cast fails to learn in time'], kw: ['killer', 'masked', 'stalker', 'final girl'],
  }),
  e('monster-horror', G, 'Monster horror', 'Horror built around a creature or entity that physically threatens the cast.', {
    parent: 'horror', conv: ['The creature is withheld, then revealed', 'Its nature defines the rules of survival'], kw: ['creature', 'beast', 'cryptid'],
  }),
  e('found-footage', G, 'Found footage', 'Horror (or other drama) presented as recovered recordings, logs or documents.', {
    parent: 'horror', conv: ['Diegetic sources justify the narration', 'Gaps and corruption imply the unseen'], intent: ['Rough, fragmentary or "badly framed" prose may be mimicking the source'], kw: ['footage', 'recording', 'tape', 'camcorder', 'documents', 'transcript'],
  }),
  e('analog-horror', G, 'Analog horror', 'Horror presented through degraded media artifacts: broadcasts, VHS tapes, public-information films.', {
    parent: 'horror', conv: ['Mundane format corrupted by intrusion', 'Slow reveal through anomalies'], kw: ['vhs', 'broadcast', 'static', 'public information', 'signal'],
  }),

  // ── Science fiction ───────────────────────────────────────────────────────
  e('science-fiction', G, 'Science fiction', 'Fiction that explores consequences of change — technological, scientific or social — against a plausible or imagined backdrop.', {
    aka: ['sci-fi', 'SF'], conv: ['A "what if" premise with consequences followed through', 'Worldbuilding that touches character life'], q: ['What single change does this world hinge on, and who does it hurt first?'], kw: ['future', 'technology', 'space', 'robot', 'AI', 'alien'],
  }),
  e('hard-sf', G, 'Hard science fiction', 'SF that prioritizes scientific plausibility and technical consequence.', {
    parent: 'science-fiction', conv: ['Explained mechanisms', 'Problem-solving plots'], watch: ['Exposition can swamp scenes'], kw: ['physics', 'engineering', 'orbital', 'realistic science'],
  }),
  e('soft-sf', G, 'Soft science fiction', 'SF that foregrounds social, psychological or philosophical questions over technical rigor.', {
    parent: 'science-fiction', conv: ['Technology as backdrop to human change'], kw: ['sociology', 'psychology', 'anthropology'],
  }),
  e('cyberpunk', G, 'Cyberpunk', 'Near-future SF of corporate power, networked technology and marginal protagonists.', {
    parent: 'science-fiction', conv: ['"High tech, low life"', 'Corporate or systemic antagonist', 'Noir-influenced voice'], kw: ['hacker', 'neon', 'megacorp', 'implant', 'cyberspace'],
  }),
  e('post-cyberpunk', G, 'Post-cyberpunk', 'Cyberpunk that treats pervasive technology as normal and looks for ways to live inside it.', { parent: 'science-fiction', kw: ['ubiquitous', 'networked', 'transhuman'] }),
  e('space-opera', G, 'Space opera', 'Large-scale adventure across stars: empires, fleets, grand conflicts.', {
    parent: 'science-fiction', conv: ['Epic scope', 'Personal stakes inside political wars'], kw: ['starship', 'galactic', 'empire', 'fleet'],
  }),
  e('military-sf', G, 'Military science fiction', 'SF centered on armed conflict, chain of command and the cost of war.', { parent: 'science-fiction', kw: ['soldier', 'marine', 'warship', 'battle'] }),
  e('dystopian', G, 'Dystopian fiction', 'Fiction set in a society whose systems oppress, usually as a warning.', {
    parent: 'science-fiction', conv: ['A protagonist who notices the cracks', 'Control through information, fear or comfort'], q: ['What does the system promise people in exchange for obedience?'], kw: ['totalitarian', 'surveillance', 'regime', 'control'],
  }),
  e('post-apocalyptic', G, 'Post-apocalyptic fiction', 'Stories after civilizational collapse: survival, memory and rebuilding.', {
    parent: 'science-fiction', conv: ['Scarcity', 'The old world as ruin and myth'], kw: ['collapse', 'wasteland', 'survivors', 'after the end'],
  }),
  e('biopunk', G, 'Biopunk', 'SF about biotechnology, genetic engineering and who controls life.', { parent: 'science-fiction', kw: ['genetic', 'biotech', 'engineered', 'clone'] }),
  e('solarpunk', G, 'Solarpunk', 'Optimistic SF imagining sustainable, community-minded futures.', { parent: 'science-fiction', conv: ['Hope as a deliberate stance', 'Ecology and community'], kw: ['sustainable', 'green', 'renewable', 'utopian'] }),
  e('time-travel', G, 'Time-travel fiction', 'Stories driven by movement through time and its paradoxes.', {
    parent: 'science-fiction', conv: ['A consistent rule for causality', 'Consequences that loop back'], watch: ['Unstated causality rules read as plot holes'], q: ['Can the past be changed, or was it always this way?'], kw: ['paradox', 'timeline', 'loop', 'past', 'future'],
  }),
  e('alternate-history', G, 'Alternate history', 'Fiction that diverges from real history at a pivot point and follows the ripple.', { parent: 'science-fiction', kw: ['what if', 'divergence', 'counterfactual'] }),

  // ── Fantasy ───────────────────────────────────────────────────────────────
  e('fantasy', G, 'Fantasy', 'Fiction in which magic or the impossible is part of the story\'s world.', {
    conv: ['A magic or wonder system with cost', 'Worlds with their own history and rules'], q: ['What does magic cost, and who pays?'], kw: ['magic', 'wizard', 'dragon', 'quest', 'kingdom'],
  }),
  e('high-fantasy', G, 'High fantasy', 'Fantasy set in a fully invented world, often with epic stakes.', { parent: 'fantasy', conv: ['Secondary world', 'Large moral conflict'], kw: ['epic', 'chosen one', 'prophecy'] }),
  e('low-fantasy', G, 'Low fantasy', 'Fantasy where magic is rare, subtle or intrudes into a mostly realistic world.', { parent: 'fantasy', kw: ['gritty', 'rare magic', 'realistic'] }),
  e('dark-fantasy', G, 'Dark fantasy', 'Fantasy with horror, moral ambiguity or grim tone.', { parent: 'fantasy', kw: ['grim', 'grimdark', 'bleak', 'morally gray'] }),
  e('urban-fantasy', G, 'Urban fantasy', 'Fantasy set in contemporary cities where the magical hides inside the mundane.', { parent: 'fantasy', conv: ['Hidden-world rules', 'Modern setting'], kw: ['city', 'modern', 'hidden world', 'supernatural'] }),
  e('epic-fantasy', G, 'Epic fantasy', 'Large-scale fantasy about wars, ages and world-shaping choices.', { parent: 'fantasy', kw: ['war', 'saga', 'ensemble', 'world-ending'] }),
  e('sword-and-sorcery', G, 'Sword and sorcery', 'Fast, personal fantasy adventure: wandering heroes, danger, limited stakes.', { parent: 'fantasy', kw: ['mercenary', 'thief', 'barbarian', 'adventure'] }),
  e('mythic-fantasy', G, 'Mythic fantasy', 'Fantasy built from or in dialogue with myth and legend.', { parent: 'fantasy', kw: ['myth', 'legend', 'gods', 'folklore'] }),
  e('fairy-tale-fantasy', G, 'Fairy-tale fantasy', 'Fantasy using the logic, motifs and rhythms of fairy tales.', {
    parent: 'fantasy', conv: ['Rule-of-three patterns', 'Flat, symbolic characters can be intentional'], intent: ['Simple, repetitive diction may be deliberate'], kw: ['fairy tale', 'once upon', 'enchanted', 'retelling'],
  }),

  // ── Mystery, thriller, crime ──────────────────────────────────────────────
  e('mystery', G, 'Mystery', 'Fiction organized around a question — usually who, how or why — and the process of answering it.', {
    conv: ['Fair clues', 'Red herrings', 'A satisfying reason when the answer arrives'], watch: ['Unfair withholding makes an answer feel arbitrary'], q: ['What does the reader know that the detective does not, and vice versa?', 'What is the one clue that will look different once the truth is known?'], kw: ['detective', 'clue', 'whodunit', 'murder', 'investigation', 'puzzle'],
  }),
  e('cozy-mystery', G, 'Cozy mystery', 'Low-violence mystery in a close community, usually with an amateur sleuth.', { parent: 'mystery', kw: ['village', 'amateur sleuth', 'tea', 'small town'] }),
  e('noir', G, 'Noir', 'Crime fiction defined by fatalism, moral compromise and a weary, atmospheric voice.', {
    parent: 'mystery', aka: ['hardboiled'], conv: ['Compromised protagonist', 'Corruption as environment', 'Terse, sardonic narration'], kw: ['hardboiled', 'femme fatale', 'cynical', 'rain', 'private eye'],
  }),
  e('locked-room', G, 'Locked-room mystery', 'A seemingly impossible crime inside a sealed space.', { parent: 'mystery', conv: ['Method is the puzzle', 'Fair-play clues'], kw: ['impossible crime', 'sealed', 'alibi'] }),
  e('police-procedural', G, 'Police procedural', 'Crime stories centered on institutional investigation.', { parent: 'mystery', kw: ['forensic', 'precinct', 'case file', 'evidence'] }),
  e('mystery-box', G, 'Mystery-box fiction', 'Stories that sustain interest through a withheld central question.', {
    parent: 'mystery', watch: ['Withholding must eventually pay off or be recognised as the point'], q: ['What is the reader promised, and when do they get it?'], kw: ['secret', 'unanswered', 'tease', 'reveal'],
  }),
  e('thriller', G, 'Thriller', 'Fiction driven by tension, danger and ticking clocks.', {
    conv: ['Rising stakes', 'Pace that pushes the reader forward', 'A hero with something to lose'], q: ['What is the clock?'], kw: ['suspense', 'chase', 'conspiracy', 'ticking clock', 'danger'],
  }),
  e('psychological-thriller', G, 'Psychological thriller', 'Thriller that works through manipulation, perception and mind games.', { parent: 'thriller', kw: ['manipulation', 'gaslight', 'obsession', 'unreliable'] }),
  e('legal-thriller', G, 'Legal thriller', 'Thriller set in the justice system.', { parent: 'thriller', kw: ['courtroom', 'lawyer', 'trial'] }),
  e('spy-thriller', G, 'Espionage fiction', 'Fiction about intelligence work, betrayal and the cost of secrecy.', { parent: 'thriller', aka: ['spy fiction'], kw: ['spy', 'agent', 'intelligence', 'double agent', 'betrayal'] }),
  e('crime', G, 'Crime fiction', 'Fiction centered on criminals, victims or the consequences of crime.', { conv: ['Moral weight of the act', 'Often sympathetic or complicated perpetrators'], kw: ['heist', 'gang', 'criminal', 'underworld'] }),

  // ── Romance, comedy, tragedy, drama ───────────────────────────────────────
  e('romance', G, 'Romance', 'Fiction where a relationship is the central plot and the arc of emotional connection is the point.', {
    conv: ['Two people drawn together and kept apart', 'An emotionally satisfying outcome in classic romance'], q: ['What is each person afraid will happen if they let the other in?'], kw: ['love', 'relationship', 'couple', 'attraction', 'courtship'],
  }),
  e('romantic-comedy', G, 'Romantic comedy', 'Romance told with humor and misunderstanding.', { parent: 'romance', kw: ['meet-cute', 'banter', 'misunderstanding'] }),
  e('gothic-romance', G, 'Gothic romance', 'Romance entangled with menace, secrets and atmospheric dread.', { parent: 'romance', kw: ['brooding', 'secret', 'estate'] }),
  e('historical-romance', G, 'Historical romance', 'Romance set in a past era with its constraints.', { parent: 'romance', kw: ['regency', 'period', 'courtship'] }),
  e('comedy', G, 'Comedy', 'Fiction organized around humor, incongruity and (often) restoration of order.', {
    conv: ['Timing', 'Escalation of a comic premise', 'Characters with blind spots'], q: ['What is the comic engine: embarrassment, misunderstanding, absurdity, status reversal?'], kw: ['funny', 'humor', 'farce', 'slapstick', 'witty'],
  }),
  e('dark-comedy', G, 'Dark comedy', 'Comedy that finds humor in grim subjects.', { parent: 'comedy', aka: ['black comedy'], kw: ['morbid', 'gallows humor'] }),
  e('satire', G, 'Satire', 'Fiction or nonfiction that uses exaggeration, irony and ridicule to criticise.', {
    conv: ['A target', 'Exaggeration that illuminates', 'Irony'], intent: ['Absurd or implausible events are usually the method, not an error'], q: ['Who or what is being criticised, and what would the writer have them do instead?'], kw: ['irony', 'parody', 'mock', 'political', 'critique'],
  }),
  e('tragedy', G, 'Tragedy', 'Fiction where character, circumstance or flaw leads to a catastrophic, often inevitable fall.', {
    conv: ['Inevitability that feels earned', 'Recognition of what was lost'], intent: ['A bleak ending is usually deliberate'], q: ['Is the downfall chosen, inevitable, or both?'], kw: ['downfall', 'fate', 'hubris', 'catharsis'],
  }),
  e('drama', G, 'Drama', 'Character-centered fiction exploring serious emotional or social conflict without relying on genre machinery.', { conv: ['Conflict arising from character', 'Realistic stakes'], kw: ['family', 'conflict', 'emotional', 'grounded', 'realism'] }),

  // ── Other genres and modes ────────────────────────────────────────────────
  e('historical-fiction', G, 'Historical fiction', 'Fiction set in a real past with attention to period texture.', { conv: ['Period detail that serves story', 'Real events as pressure'], watch: ['Anachronism in diction or attitude can break the period'], kw: ['period', 'history', 'war', 'era', '19th century'] }),
  e('adventure', G, 'Adventure', 'Fiction driven by journeys, quests and physical risk.', { conv: ['Movement through places and obstacles'], kw: ['journey', 'expedition', 'quest', 'explorer'] }),
  e('western', G, 'Western', 'Stories of frontier justice, landscape and law versus lawlessness.', { kw: ['frontier', 'outlaw', 'sheriff', 'gunfighter', 'desert'] }),
  e('war-fiction', G, 'War fiction', 'Fiction about combat, its aftermath and moral injury.', { kw: ['soldier', 'battle', 'trench', 'veteran'] }),
  e('philosophical-fiction', G, 'Philosophical fiction', 'Fiction that explores ideas as seriously as events.', { intent: ['Plot may be thin because the argument is the engine'], kw: ['ideas', 'ethics', 'meaning', 'existential'] }),
  e('literary-fiction', G, 'Literary fiction', 'Fiction that prioritises style, interiority and theme, often resisting genre formula.', { conv: ['Close attention to language', 'Ambiguity tolerated'], intent: ['Quiet or unresolved endings are common'], kw: ['interior', 'character study', 'prose', 'literary'] }),
  e('young-adult', G, 'Young adult fiction', 'Fiction aimed at teen readers, usually foregrounding identity and first experiences.', { conv: ['Voice-forward narration', 'Coming-of-age stakes'], kw: ['teen', 'coming of age', 'school', 'identity'] }),
  e('childrens-literature', G, 'Children\'s literature', 'Fiction for young readers with attention to age-appropriate language and wonder.', { intent: ['Repetition and simple diction are craft choices'], kw: ['picture book', 'middle grade', 'kids', 'fable'] }),
  e('magical-realism', G, 'Magical realism', 'Realistic fiction where the magical is treated as ordinary.', {
    parent: 'fantasy', conv: ['The impossible is narrated matter-of-factly'], intent: ['Characters not reacting to the impossible is deliberate'], kw: ['matter-of-fact', 'everyday magic', 'latin american'],
  }),
  e('surrealism', G, 'Surrealist fiction', 'Fiction that uses dream logic and irrational juxtaposition.', {
    intent: ['Illogical events and non-sequiturs are the method, not continuity errors'], q: ['What emotional logic is replacing causal logic?'], kw: ['dream', 'absurd', 'irrational', 'uncanny', 'bizarre'],
  }),
  e('slipstream', G, 'Slipstream', 'Fiction that sits between realism and the fantastic, producing estrangement rather than clear genre.', { kw: ['estrangement', 'genre-blending', 'liminal'] }),
  e('litrpg', G, 'LitRPG / game fiction', 'Fiction structured by game mechanics, stats and levels.', { aka: ['gamelit'], kw: ['stats', 'level up', 'game system', 'quest log'] }),
  e('slice-of-life', G, 'Slice of life', 'Stories of everyday experience without grand plot structure.', { intent: ['Low plot and episodic movement are the form'], kw: ['everyday', 'quiet', 'mundane', 'domestic'] }),
  e('coming-of-age', G, 'Coming-of-age', 'Stories of growth from innocence toward understanding.', { kw: ['bildungsroman', 'growing up', 'adolescence'] }),
  e('southern-gothic', G, 'Southern gothic', 'Gothic tradition set in a decaying regional society, blending grotesque and tenderness.', { parent: 'gothic-horror', kw: ['grotesque', 'decay', 'small town', 'faith'] }),
];
