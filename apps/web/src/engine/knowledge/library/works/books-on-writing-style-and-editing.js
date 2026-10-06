// Notable works: books about writing, style, usage, editing and storytelling.
// Reference records only: each entry names a real book or essay with its author, first-publication year and original language,
// and says in one neutral sentence what it is for and how it approaches its subject. Years are first publication of the original.
// Craft books are one approach among many; nothing here is a rule NIE enforces.
export const PREFIX = 'work-craft-';
export default [
  // ---- Rhetoric, poetics and criticism before 1900 ----
  {
    id: 'work-craft-rhetoric-aristotle', kind: 'work', name: 'Rhetoric', author: 'Aristotle', year: 'c. 330 BCE', language: 'Ancient Greek', region: 'Ancient Greece', confidence: 'established',
    summary: 'A systematic study of persuasion that sets out the appeals of character, emotion and argument and the main kinds of public speech; it shaped almost every later rhetorical and composition tradition.',
    kw: ['aristotle', 'rhetoric', 'ethos pathos logos', 'persuasion', 'classical rhetoric', 'argument'], genres: ['rhetorical treatise', 'classical rhetoric'],
  },
  {
    id: 'work-craft-de-oratore', kind: 'work', name: 'De Oratore', author: 'Cicero', year: 'c. 55 BCE', language: 'Latin', region: 'Ancient Rome', confidence: 'established',
    summary: 'A dialogue on the education and craft of the ideal orator, covering invention, arrangement, style, memory and delivery; a major source for later European teaching of rhetoric.',
    kw: ['cicero', 'on the orator', 'roman rhetoric', 'oratory', 'five canons of rhetoric'], genres: ['rhetorical treatise', 'dialogue'],
  },
  {
    id: 'work-craft-institutio-oratoria', kind: 'work', name: 'Institutio Oratoria', author: 'Quintilian', year: 'c. 95 CE', language: 'Latin', region: 'Ancient Rome', confidence: 'established',
    summary: 'A twelve-book course on training an orator from childhood, including long discussions of reading, imitation, composition and style that later influenced humanist education.',
    kw: ['quintilian', 'institutes of oratory', 'roman rhetoric', 'education of the orator', 'imitation', 'style'], genres: ['rhetorical treatise', 'educational treatise'],
  },
  {
    id: 'work-craft-defence-of-poesy', kind: 'work', name: 'The Defence of Poesy', author: 'Philip Sidney', year: 1595, language: 'English', region: 'England', confidence: 'established',
    summary: 'A prose defence of poetry as a teacher and shaper of virtue in answer to contemporary attacks on it; an early English statement of what imaginative literature is for, also known as An Apology for Poetry.',
    aka: ['An Apology for Poetry'], kw: ['sidney', 'apology for poetry', 'defence of poetry', 'renaissance criticism', 'purpose of poetry'], genres: ['critical essay', 'literary theory'],
  },
  {
    id: 'work-craft-of-dramatick-poesie', kind: 'work', name: 'Of Dramatick Poesie: An Essay', author: 'John Dryden', year: 1668, language: 'English', region: 'England', confidence: 'established',
    summary: 'A dialogue among four speakers that compares ancient and modern drama, French and English practice, and rhyme against blank verse; an early landmark of English critical prose.',
    kw: ['dryden', 'dramatic poesy', 'rhyme vs blank verse', 'restoration criticism', 'unities', 'ancients and moderns'], genres: ['critical essay', 'dialogue', 'drama criticism'],
  },
  {
    id: 'work-craft-art-poetique-boileau', kind: 'work', name: "L'Art poétique", author: 'Nicolas Boileau', year: 1674, language: 'French', region: 'France', confidence: 'established',
    summary: 'A verse treatise setting out the principles of French classical taste, including clarity, reason and decorum across the poetic genres; widely read as a statement of neoclassical standards.',
    aka: ['The Art of Poetry'], kw: ['boileau', 'art of poetry', 'neoclassicism', 'french classicism', 'decorum', 'verse treatise'], genres: ['verse treatise', 'neoclassical criticism'],
  },
  {
    id: 'work-craft-dictionary-english-language-johnson', kind: 'work', name: 'A Dictionary of the English Language', author: 'Samuel Johnson', year: 1755, language: 'English', region: 'England', confidence: 'established',
    summary: 'A dictionary that illustrated word senses with quotations from earlier authors; it shaped later English lexicography and remains a record of eighteenth-century usage.',
    kw: ['johnson', 'dictionary', 'lexicography', 'eighteenth century english', 'word senses', 'historical usage'], genres: ['dictionary', 'reference work'],
  },
  {
    id: 'work-craft-preface-to-shakespeare', kind: 'work', name: 'Preface to Shakespeare', author: 'Samuel Johnson', year: 1765, language: 'English', region: 'England', confidence: 'established',
    summary: "A critical introduction to an edition of the plays that praises Shakespeare's general nature in character, defends mixed tragicomic form and argues against strict classical unities of time and place.",
    kw: ['johnson', 'shakespeare criticism', 'unities', 'tragicomedy', 'general nature', 'edition preface'], genres: ['critical essay', 'drama criticism'],
  },
  {
    id: 'work-craft-laocoon', kind: 'work', name: 'Laocoön', author: 'Gotthold Ephraim Lessing', year: 1766, language: 'German', region: 'Germany', confidence: 'established',
    summary: 'An essay on the limits of painting and poetry, arguing that poetry suits action unfolding in time while painting suits bodies arranged in space; often cited in discussions of description versus narration.',
    aka: ['Laokoon'], kw: ['lessing', 'poetry and painting', 'description vs narration', 'time and space in art', 'aesthetics', 'limits of the arts'], genres: ['aesthetic treatise', 'critical essay'],
  },
  {
    id: 'work-craft-hamburg-dramaturgy', kind: 'work', name: 'Hamburg Dramaturgy', author: 'Gotthold Ephraim Lessing', year: 1767, language: 'German', region: 'Germany', confidence: 'established',
    summary: "A series of critical notes on the productions of a Hamburg theatre company that grew into a wider discussion of tragedy, Aristotle and French classical drama; important to the shaping of modern German theatre.",
    aka: ['Hamburgische Dramaturgie'], kw: ['lessing', 'dramaturgy', 'german theatre', 'tragedy theory', 'drama criticism', 'aristotle and french drama'], genres: ['drama criticism', 'theatre theory'],
  },
  {
    id: 'work-craft-philosophy-of-rhetoric-campbell', kind: 'work', name: 'The Philosophy of Rhetoric', author: 'George Campbell', year: 1776, language: 'English', region: 'Scotland', confidence: 'established',
    summary: 'A Scottish treatise that grounds rhetoric in the study of the mind, with attention to evidence, clarity and vividness of style, and the effects a speaker or writer aims to produce.',
    kw: ['campbell', 'rhetoric', 'enlightenment rhetoric', 'evidence', 'style', 'composition history'], genres: ['rhetorical treatise'],
  },
  {
    id: 'work-craft-lectures-rhetoric-belles-lettres', kind: 'work', name: 'Lectures on Rhetoric and Belles Lettres', author: 'Hugh Blair', year: 1783, language: 'English', region: 'Scotland', confidence: 'established',
    summary: 'A university course on taste, style, rhetoric and the literary kinds, widely used in English-language teaching of composition and criticism through the late eighteenth and nineteenth centuries.',
    kw: ['blair', 'belles lettres', 'taste', 'composition teaching', 'scottish enlightenment', 'literary kinds'], genres: ['rhetorical treatise', 'lectures'],
  },
  {
    id: 'work-craft-preface-to-lyrical-ballads', kind: 'work', name: 'Preface to Lyrical Ballads', author: 'William Wordsworth', year: 1800, language: 'English', region: 'England', confidence: 'established',
    summary: 'An essay on the aims of the poems it introduces, arguing for subjects from ordinary life and language close to everyday speech; often treated as a manifesto of English Romantic poetics.',
    kw: ['wordsworth', 'romantic poetics', 'poetic diction', 'ordinary language', 'manifesto', 'lyrical ballads preface'], genres: ['manifesto', 'critical essay', 'poetics'],
  },
  {
    id: 'work-craft-biographia-literaria', kind: 'work', name: 'Biographia Literaria', author: 'Samuel Taylor Coleridge', year: 1817, language: 'English', region: 'England', confidence: 'established',
    summary: "A part-autobiographical book of criticism that discusses imagination and fancy, Wordsworth's theory of poetic diction and the nature of poetic judgement.",
    kw: ['coleridge', 'imagination and fancy', 'romantic criticism', 'poetic diction', 'literary autobiography'], genres: ['literary criticism', 'literary autobiography'],
  },
  {
    id: 'work-craft-elements-of-rhetoric-whately', kind: 'work', name: 'Elements of Rhetoric', author: 'Richard Whately', year: 1828, language: 'English', region: 'England', confidence: 'established',
    summary: 'A British treatise on argument and persuasion, notable for its handling of presumption and burden of proof and for its influence on later teaching of argumentative composition.',
    kw: ['whately', 'argument', 'burden of proof', 'presumption', 'composition teaching', 'victorian rhetoric'], genres: ['rhetorical treatise'],
  },
  {
    id: 'work-craft-roget-thesaurus', kind: 'work', name: 'Thesaurus of English Words and Phrases', author: 'Peter Mark Roget', year: 1852, language: 'English', region: 'England', confidence: 'established',
    summary: 'A reference that arranges words by idea rather than alphabet so a writer can find a term from a meaning; still revised and published under the compiler\'s name.',
    aka: ["Roget's Thesaurus"], kw: ['roget', 'thesaurus', 'synonyms', 'word finder', 'word choice', 'reference'], genres: ['thesaurus', 'reference work'],
  },
  {
    id: 'work-craft-technique-of-drama', kind: 'work', name: 'The Technique of Drama', author: 'Gustav Freytag', year: 1863, language: 'German', region: 'Germany', confidence: 'established',
    summary: 'A study of dramatic construction that analyses the five-part structure of the classical play and is the source of the diagram known as Freytag\'s pyramid.',
    aka: ['Die Technik des Dramas'], kw: ['freytag', 'freytag pyramid', 'five act structure', 'dramatic structure', 'exposition', 'climax', 'denouement'], genres: ['drama theory', 'craft book'],
  },
  {
    id: 'work-craft-defence-of-poetry-shelley', kind: 'work', name: 'A Defence of Poetry', author: 'Percy Bysshe Shelley', year: 1840, language: 'English', region: 'England', confidence: 'established',
    summary: 'A prose essay, written in 1821 and published after the author\'s death, arguing that poetry shapes the moral imagination and public life.',
    kw: ['shelley', 'defence of poetry', 'romantic criticism', 'imagination', 'purpose of poetry', 'unacknowledged legislators'], genres: ['critical essay', 'poetics'],
  },
  {
    id: 'work-craft-philosophy-of-composition', kind: 'work', name: 'The Philosophy of Composition', author: 'Edgar Allan Poe', year: 1846, language: 'English', region: 'United States', confidence: 'established',
    summary: 'An essay in which the author describes, or claims to describe, writing a poem step by step from a chosen effect; widely read, and debated for how literally it should be taken.',
    kw: ['poe', 'single effect', 'unity of effect', 'how a poem is composed', 'the raven', 'composition method'], genres: ['critical essay', 'craft essay'],
  },
  {
    id: 'work-craft-the-poetic-principle', kind: 'work', name: 'The Poetic Principle', author: 'Edgar Allan Poe', year: 1850, language: 'English', region: 'United States', confidence: 'established',
    summary: 'An essay published after the author\'s death that argues a poem should aim at the elevation of feeling, and that long poems and didactic purposes weaken it.',
    kw: ['poe', 'poetic principle', 'long poem', 'didacticism', 'lyric poetry', 'american criticism'], genres: ['critical essay', 'poetics'],
  },
  {
    id: 'work-craft-the-art-of-fiction-james', kind: 'work', name: 'The Art of Fiction', author: 'Henry James', year: 1884, language: 'English', region: 'United States and United Kingdom', confidence: 'established',
    summary: 'An essay replying to a lecture on the novel, arguing that fiction is an art as serious as painting and should be judged by how fully it renders life rather than by prescriptions.',
    kw: ['henry james', 'art of fiction', 'novel criticism', 'realism', 'fiction as art', 'against prescriptions'], genres: ['critical essay', 'novel theory'],
  },

  // ---- Early twentieth-century criticism, craft and usage ----
  {
    id: 'work-craft-the-kings-english', kind: 'work', name: "The King's English", author: 'H. W. Fowler and F. G. Fowler', year: 1906, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A guide by two brothers to common faults in English prose, covering vocabulary, syntax and punctuation; the elder brother later wrote a separate dictionary of usage.',
    kw: ['fowler', 'kings english', 'british usage', 'prose faults', 'syntax', 'punctuation'], genres: ['usage guide'],
  },
  {
    id: 'work-craft-elements-of-style', kind: 'work', name: 'The Elements of Style', author: 'William Strunk Jr. (later revised and expanded by E. B. White)', year: 1918, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A short American guide to plain composition and usage, first printed for a Cornell class in 1918 and later expanded by E. B. White; widely used, though many of its rules are now disputed.',
    aka: ['Strunk and White'], kw: ['strunk and white', 'elements of style', 'omit needless words', 'composition', 'american usage', 'style manual'], genres: ['style guide', 'usage guide'],
  },
  {
    id: 'work-craft-sacred-wood', kind: 'work', name: 'The Sacred Wood', author: 'T. S. Eliot', year: 1920, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: "A collection of critical essays that includes the much-cited discussion of tradition and the individual talent, arguing for impersonality in poetry and for the writer's relation to earlier literature.",
    kw: ['eliot', 'tradition and the individual talent', 'impersonality', 'modernist criticism', 'objective correlative'], genres: ['literary criticism', 'essay collection'],
  },
  {
    id: 'work-craft-the-craft-of-fiction', kind: 'work', name: 'The Craft of Fiction', author: 'Percy Lubbock', year: 1921, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A study of how novelists handle point of view and whether a scene is rendered as picture or as drama, drawing heavily on Henry James; an early influential account of fictional technique.',
    kw: ['lubbock', 'craft of fiction', 'point of view', 'picture and drama', 'showing and telling', 'novel technique'], genres: ['craft book', 'novel theory'],
  },
  {
    id: 'work-craft-principles-of-literary-criticism', kind: 'work', name: 'Principles of Literary Criticism', author: 'I. A. Richards', year: 1924, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: "An early work of modern criticism that treats a poem's value in terms of the experience it gives the reader and challenges vague appeals to inspiration.",
    kw: ['richards', 'literary criticism', 'reader experience', 'poetry value', 'cambridge criticism'], genres: ['literary criticism'],
  },
  {
    id: 'work-craft-mr-bennett-and-mrs-brown', kind: 'work', name: 'Mr Bennett and Mrs Brown', author: 'Virginia Woolf', year: 1924, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'An essay arguing that fiction should capture character as it is experienced, not through catalogues of external detail; a statement of modernist aims, later reprinted as Character in Fiction.',
    aka: ['Character in Fiction'], kw: ['woolf', 'modernist fiction', 'character', 'edwardian novelists', 'new fiction', 'essay on the novel'], genres: ['critical essay', 'manifesto'],
  },
  {
    id: 'work-craft-theory-of-prose', kind: 'work', name: 'Theory of Prose', author: 'Viktor Shklovsky', year: 1925, language: 'Russian', region: 'Soviet Union', confidence: 'established',
    summary: 'A collection of formalist essays on plot, digression and the devices of storytelling, with examples from novels and tales, including the distinction between story material and plot arrangement.',
    aka: ['O teorii prozy'], kw: ['shklovsky', 'russian formalism', 'plot and story', 'fabula and syuzhet', 'devices', 'narrative theory'], genres: ['narrative theory', 'formalist criticism'],
  },
  {
    id: 'work-craft-aspects-of-the-novel', kind: 'work', name: 'Aspects of the Novel', author: 'E. M. Forster', year: 1927, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A series of lectures that discusses the novel through story, people, plot, fantasy, prophecy, pattern and rhythm, and that offers the familiar distinction between flat and round characters.',
    kw: ['forster', 'flat and round characters', 'story vs plot', 'novel lectures', 'fantasy and prophecy', 'novel craft'], genres: ['craft book', 'novel theory', 'lectures'],
  },
  {
    id: 'work-craft-supernatural-horror-in-literature', kind: 'work', name: 'Supernatural Horror in Literature', author: 'H. P. Lovecraft', year: 1927, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A survey essay tracing weird and horror fiction from early Gothic tales to the author\'s contemporaries, and arguing that fear of the unknown is the core of the form.',
    kw: ['lovecraft', 'weird fiction', 'horror history', 'gothic', 'cosmic fear', 'horror criticism'], genres: ['critical survey', 'horror criticism'],
  },
  {
    id: 'work-craft-twenty-rules-detective-stories', kind: 'work', name: 'Twenty Rules for Writing Detective Stories', author: 'S. S. Van Dine (pen name of Willard Huntington Wright)', year: 1928, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A list of conventions for fair-play detective fiction, such as giving the reader the same clues as the detective; one of several attempts to codify the Golden Age puzzle mystery.',
    kw: ['van dine', 'detective fiction rules', 'fair play mystery', 'golden age', 'puzzle mystery', 'clue rules'], genres: ['genre rules', 'detective fiction'],
  },
  {
    id: 'work-craft-detective-story-decalogue', kind: 'work', name: 'A Detective Story Decalogue', author: 'Ronald Knox', year: 1929, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'Ten commandments for fair-play detective fiction, written for the introduction to an annual anthology and often paired with other Golden Age rule lists; partly tongue in cheek.',
    aka: ["Knox's Ten Commandments"], kw: ['knox', 'ten commandments of detective fiction', 'fair play', 'golden age', 'detective rules', 'decalogue'], genres: ['genre rules', 'detective fiction'],
  },
  {
    id: 'work-craft-practical-criticism', kind: 'work', name: 'Practical Criticism', author: 'I. A. Richards', year: 1929, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A study of how readers respond to unattributed poems, built from classroom experiments, that records common misreadings and helped establish close reading as a teaching method.',
    kw: ['richards', 'close reading', 'practical criticism', 'misreading', 'poetry teaching', 'cambridge'], genres: ['literary criticism', 'critical method'],
  },
  {
    id: 'work-craft-problems-of-dostoevskys-poetics', kind: 'work', name: "Problems of Dostoevsky's Poetics", author: 'Mikhail Bakhtin', year: 1929, language: 'Russian', region: 'Soviet Union', confidence: 'established',
    summary: "A study arguing that Dostoevsky's novels are polyphonic, giving characters voices not subordinate to the author's own; it first appeared in 1929 under a slightly different title and was revised in 1963.",
    kw: ['bakhtin', 'polyphony', 'dialogism', 'dostoevsky', 'multiple voices', 'novel theory'], genres: ['literary theory', 'novel criticism'],
  },
  {
    id: 'work-craft-seven-types-of-ambiguity', kind: 'work', name: 'Seven Types of Ambiguity', author: 'William Empson', year: 1930, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A close-reading study that classes the ways a poetic passage can carry more than one meaning at once; an influential model for later close reading.',
    kw: ['empson', 'ambiguity', 'close reading', 'poetic meaning', 'multiple meanings'], genres: ['literary criticism', 'close reading'],
  },
  {
    id: 'work-craft-abc-of-reading', kind: 'work', name: 'ABC of Reading', author: 'Ezra Pound', year: 1934, language: 'English', region: 'United States and Europe', confidence: 'established',
    summary: 'A compact and opinionated guide to reading poetry and literature through examples, emphasising direct treatment and precision; a classic of modernist poetics.',
    kw: ['pound', 'abc of reading', 'modernist poetics', 'imagism', 'reading list', 'precision'], genres: ['critical guide', 'poetics'],
  },
  {
    id: 'work-craft-becoming-a-writer', kind: 'work', name: 'Becoming a Writer', author: 'Dorothea Brande', year: 1934, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A guide to writing as a habit and a trained skill, with exercises such as writing early in the day and reading as a writer; much quoted by later creative-writing teachers.',
    kw: ['brande', 'writing habit', 'morning writing', 'writer\'s discipline', 'creative writing classic', 'writing exercises'], genres: ['craft book', 'writing advice'],
  },
  {
    id: 'work-craft-theory-technique-playwriting', kind: 'work', name: 'Theory and Technique of Playwriting', author: 'John Howard Lawson', year: 1936, language: 'English', region: 'United States', confidence: 'established',
    summary: "A manual of dramatic construction that treats conflict between characters' goals as the core of drama; a widely read American text of its period.",
    kw: ['lawson', 'playwriting', 'dramatic conflict', 'dramatic construction', 'play structure', 'american drama'], genres: ['craft book', 'playwriting'],
  },
  {
    id: 'work-craft-philosophy-of-rhetoric-richards', kind: 'work', name: 'The Philosophy of Rhetoric', author: 'I. A. Richards', year: 1936, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'Lectures that treat rhetoric as the study of misunderstanding and its remedies, and that introduced the terms tenor and vehicle for the two parts of a metaphor.',
    kw: ['richards', 'tenor and vehicle', 'metaphor theory', 'misunderstanding', 'new rhetoric'], genres: ['rhetorical theory', 'lectures'],
  },
  {
    id: 'work-craft-if-you-want-to-write', kind: 'work', name: 'If You Want to Write', author: 'Brenda Ueland', year: 1938, language: 'English', region: 'United States', confidence: 'established',
    summary: 'An encouraging guide that argues everyone has something to say and that creative work needs idleness, slowness and attention rather than anxious effort.',
    kw: ['ueland', 'creative confidence', 'slowness', 'imagination', 'writing encouragement', 'beginner writers'], genres: ['craft book', 'writing advice'],
  },
  {
    id: 'work-craft-understanding-poetry', kind: 'work', name: 'Understanding Poetry', author: 'Cleanth Brooks and Robert Penn Warren', year: 1938, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A college textbook that taught poems through close attention to language and form rather than biography and history, and became a model for generations of poetry textbooks.',
    kw: ['brooks and warren', 'new criticism', 'close reading', 'poetry textbook', 'teaching poetry'], genres: ['textbook', 'poetry criticism'],
  },
  {
    id: 'work-craft-theatre-and-its-double', kind: 'work', name: 'The Theatre and Its Double', author: 'Antonin Artaud', year: 1938, language: 'French', region: 'France', confidence: 'established',
    summary: 'A collection of essays and manifestos on theatre as a physical, ritual experience rather than a vehicle for literary text, including the idea of a theatre of cruelty.',
    aka: ['Le Théâtre et son double'], kw: ['artaud', 'theatre of cruelty', 'avant-garde theatre', 'physical theatre', 'manifesto', 'ritual'], genres: ['theatre theory', 'manifesto'],
  },
  {
    id: 'work-craft-art-as-technique', kind: 'work', name: 'Art as Technique', author: 'Viktor Shklovsky', year: 1917, language: 'Russian', region: 'Russia', confidence: 'established',
    summary: 'An essay arguing that art renews perception by making familiar things strange, which introduced the idea of defamiliarisation; a founding text of Russian Formalism, also translated as Art as Device.',
    aka: ['Art as Device'], kw: ['shklovsky', 'defamiliarization', 'ostranenie', 'making strange', 'russian formalism', 'device'], genres: ['critical essay', 'formalist criticism'],
  },
  // ---- Criticism, narratology and literary theory, 1940s to 1980s ----
  {
    id: 'work-craft-mimesis-auerbach', kind: 'work', name: 'Mimesis: The Representation of Reality in Western Literature', author: 'Erich Auerbach', year: 1946, language: 'German', region: 'Turkey and Switzerland', confidence: 'established',
    summary: 'A history of how Western literature represents reality, from Homer and the Bible to the modern novel, built from close readings of single passages and written during the author\'s wartime exile.',
    aka: ['Mimesis'], kw: ['auerbach', 'mimesis', 'representation of reality', 'realism', 'style levels', 'philology'], genres: ['literary history', 'criticism'],
  },
  {
    id: 'work-craft-well-wrought-urn', kind: 'work', name: 'The Well Wrought Urn', author: 'Cleanth Brooks', year: 1947, language: 'English', region: 'United States', confidence: 'established',
    summary: 'Ten close readings of poems from several centuries, including an argument against paraphrasing a poem\'s meaning; a core text of New Criticism.',
    kw: ['brooks', 'new criticism', 'heresy of paraphrase', 'close reading', 'paradox', 'poetry analysis'], genres: ['literary criticism', 'close reading'],
  },
  {
    id: 'work-craft-on-fairy-stories', kind: 'work', name: 'On Fairy-Stories', author: 'J. R. R. Tolkien', year: 1947, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'An essay on the nature of fairy tales that discusses fantasy, recovery, escape, consolation and sub-creation; a foundation text for the study and craft of fantasy.',
    kw: ['tolkien', 'fantasy theory', 'sub-creation', 'secondary world', 'eucatastrophe', 'fairy tale essay'], genres: ['critical essay', 'fantasy criticism'],
  },
  {
    id: 'work-craft-hero-with-a-thousand-faces', kind: 'work', name: 'The Hero with a Thousand Faces', author: 'Joseph Campbell', year: 1949, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A comparative study of hero myths that proposes a common pattern of departure, initiation and return, called the monomyth; a major source for later story-structure models in film and fiction.',
    kw: ['campbell', 'monomyth', 'hero\'s journey', 'myth pattern', 'comparative mythology', 'story structure'], genres: ['comparative mythology', 'story theory'],
  },
  {
    id: 'work-craft-theory-of-literature', kind: 'work', name: 'Theory of Literature', author: 'René Wellek and Austin Warren', year: 1949, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A survey of literary study that separates approaches focused on the text itself from external ones such as biography and society; it became a standard university textbook.',
    kw: ['wellek and warren', 'literary theory', 'intrinsic and extrinsic', 'university textbook', 'new criticism'], genres: ['textbook', 'literary theory'],
  },
  {
    id: 'work-craft-mirror-and-the-lamp', kind: 'work', name: 'The Mirror and the Lamp', author: 'M. H. Abrams', year: 1953, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A history of English Romantic critical theory that contrasts views of art as a mirror of nature with views of art as a lamp expressing the writer\'s mind.',
    kw: ['abrams', 'romantic theory', 'expressive theory', 'mimetic theory', 'critical history', 'orientation of criticism'], genres: ['literary theory', 'critical history'],
  },
  {
    id: 'work-craft-writing-degree-zero', kind: 'work', name: 'Writing Degree Zero', author: 'Roland Barthes', year: 1953, language: 'French', region: 'France', confidence: 'established',
    summary: 'A short essay arguing that a writer\'s choices of form and style carry social and historical meaning beyond the content of what is said.',
    aka: ['Le Degré zéro de l\'écriture'], kw: ['barthes', 'style and form', 'écriture', 'neutral writing', 'french theory', 'language and history'], genres: ['literary theory', 'essay'],
  },
  {
    id: 'work-craft-the-verbal-icon', kind: 'work', name: 'The Verbal Icon', author: 'W. K. Wimsatt', year: 1954, language: 'English', region: 'United States', confidence: 'established',
    summary: 'Essays on poetry and meaning that include two much-discussed arguments, one against judging a poem by the author\'s intention and one against judging it by its emotional effect on readers.',
    kw: ['wimsatt', 'intentional fallacy', 'affective fallacy', 'new criticism', 'authorial intention', 'poetry meaning'], genres: ['literary criticism', 'essay collection'],
  },
  {
    id: 'work-craft-anatomy-of-criticism', kind: 'work', name: 'Anatomy of Criticism', author: 'Northrop Frye', year: 1957, language: 'English', region: 'Canada', confidence: 'established',
    summary: 'A systematic theory of literature that organises works by modes, symbols, myths and genres, and sets out four basic story patterns tied to the seasons.',
    kw: ['frye', 'archetypal criticism', 'four mythoi', 'comedy romance tragedy irony', 'modes', 'genre theory'], genres: ['literary theory', 'genre theory'],
  },
  {
    id: 'work-craft-glossary-of-literary-terms', kind: 'work', name: 'A Glossary of Literary Terms', author: 'M. H. Abrams', year: 1957, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A concise reference of definitions and short essays on literary terms, movements and critical schools, regularly updated through many editions and widely used in teaching.',
    kw: ['abrams', 'glossary', 'literary terms', 'reference', 'critical schools', 'teaching reference'], genres: ['glossary', 'reference work'],
  },
  {
    id: 'work-craft-the-rise-of-the-novel', kind: 'work', name: 'The Rise of the Novel', author: 'Ian Watt', year: 1957, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A study of Defoe, Richardson and Fielding that links the early English novel to changing readership, realism and individualism; a standard account of the form\'s origins.',
    kw: ['watt', 'early novel', 'formal realism', 'defoe richardson fielding', 'novel history', 'eighteenth century'], genres: ['literary history', 'novel theory'],
  },
  {
    id: 'work-craft-poetics-of-space', kind: 'work', name: 'The Poetics of Space', author: 'Gaston Bachelard', year: 1957, language: 'French', region: 'France', confidence: 'established',
    summary: 'A study of how images of houses, drawers, corners and shells shape imagination, treated through poetry as a phenomenology of the image.',
    aka: ['La Poétique de l\'espace'], kw: ['bachelard', 'poetic image', 'house as image', 'space in poetry', 'phenomenology', 'imagination'], genres: ['philosophy of imagination', 'literary theory'],
  },
  {
    id: 'work-craft-rhetoric-of-fiction', kind: 'work', name: 'The Rhetoric of Fiction', author: 'Wayne C. Booth', year: 1961, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A study of how authors guide a reader\'s response through narration, introducing the implied author and the unreliable narrator as working terms and questioning any rule that showing is always better than telling.',
    kw: ['booth', 'implied author', 'unreliable narrator', 'showing vs telling', 'narrative distance', 'point of view'], genres: ['narrative theory', 'novel theory'],
  },
  {
    id: 'work-craft-theatre-of-the-absurd', kind: 'work', name: 'The Theatre of the Absurd', author: 'Martin Esslin', year: 1961, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A critical study that groups playwrights such as Beckett, Ionesco and Genet under one label, describing how their plays dramatise a sense of meaninglessness through form as well as content.',
    kw: ['esslin', 'absurd drama', 'beckett ionesco genet', 'post-war theatre', 'drama criticism'], genres: ['drama criticism', 'theatre history'],
  },
  {
    id: 'work-craft-improvisation-for-the-theater', kind: 'work', name: 'Improvisation for the Theater', author: 'Viola Spolin', year: 1963, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A handbook of theatre games and exercises for training spontaneity and attention, widely used by actors, improvisers and teachers of writing and performance.',
    kw: ['spolin', 'theatre games', 'improvisation', 'actor training', 'spontaneity', 'workshop exercises'], genres: ['craft book', 'performance training'],
  },
  {
    id: 'work-craft-the-lonely-voice', kind: 'work', name: 'The Lonely Voice: A Study of the Short Story', author: 'Frank O\'Connor', year: 1963, language: 'English', region: 'Ireland', confidence: 'established',
    summary: 'A study of the short story as a form, arguing that it centres on outsiders and marginal people, with chapters on writers such as Turgenev, Chekhov and Joyce.',
    aka: ['The Lonely Voice'], kw: ['o\'connor', 'short story theory', 'submerged population', 'outsiders', 'chekhov', 'short fiction form'], genres: ['short story criticism', 'form study'],
  },
  {
    id: 'work-craft-techniques-of-the-selling-writer', kind: 'work', name: 'Techniques of the Selling Writer', author: 'Dwight V. Swain', year: 1965, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A practical manual of commercial fiction technique that breaks scenes into goal, conflict and disaster and sequels into reaction, dilemma and decision; widely used by genre writers.',
    kw: ['swain', 'scene and sequel', 'goal conflict disaster', 'commercial fiction', 'genre craft', 'pulp craft'], genres: ['craft book', 'commercial fiction'],
  },
  {
    id: 'work-craft-poetic-meter-and-poetic-form', kind: 'work', name: 'Poetic Meter and Poetic Form', author: 'Paul Fussell', year: 1965, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A short introduction to English metre and verse form that explains how metrical patterns work and why they matter for meaning.',
    kw: ['fussell', 'metre', 'meter', 'scansion', 'verse form', 'prosody'], genres: ['poetry handbook', 'prosody'],
  },
  {
    id: 'work-craft-rabelais-and-his-world', kind: 'work', name: 'Rabelais and His World', author: 'Mikhail Bakhtin', year: 1965, language: 'Russian', region: 'Soviet Union', confidence: 'established',
    summary: 'A study of carnival and popular laughter in Rabelais and medieval folk culture, introducing the carnivalesque as a literary and social concept.',
    kw: ['bakhtin', 'carnivalesque', 'carnival', 'grotesque', 'popular laughter', 'rabelais'], genres: ['literary theory', 'cultural history'],
  },
  {
    id: 'work-craft-the-empty-space', kind: 'work', name: 'The Empty Space', author: 'Peter Brook', year: 1968, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'Four essays on deadly, holy, rough and immediate theatre, arguing that theatre needs only a performer, an audience and attention.',
    kw: ['brook', 'theatre essays', 'deadly theatre', 'holy theatre', 'rough theatre', 'directing'], genres: ['theatre theory', 'essay collection'],
  },
  {
    id: 'work-craft-s-z', kind: 'work', name: 'S/Z', author: 'Roland Barthes', year: 1970, language: 'French', region: 'France', confidence: 'established',
    summary: 'A line-by-line reading of a short story by Balzac that sorts its meanings into five codes; a landmark of structuralist and post-structuralist reading.',
    kw: ['barthes', 'five codes', 'readerly and writerly', 'balzac', 'sarrasine', 'structuralism'], genres: ['literary theory', 'close reading'],
  },
  {
    id: 'work-craft-the-fantastic-todorov', kind: 'work', name: 'The Fantastic: A Structural Approach to a Literary Genre', author: 'Tzvetan Todorov', year: 1970, language: 'French', region: 'France', confidence: 'established',
    summary: 'A structural study of the fantastic that defines it as hesitation between natural and supernatural explanation and distinguishes it from the uncanny and the marvellous.',
    aka: ['Introduction à la littérature fantastique'], kw: ['todorov', 'fantastic', 'uncanny', 'marvellous', 'genre theory', 'hesitation'], genres: ['genre theory', 'fantasy criticism'],
  },
  {
    id: 'work-craft-the-poetics-of-prose', kind: 'work', name: 'The Poetics of Prose', author: 'Tzvetan Todorov', year: 1971, language: 'French', region: 'France', confidence: 'established',
    summary: 'Essays on narrative structure that include analyses of detective fiction and of the tales of the Decameron; a key text of early French narratology.',
    kw: ['todorov', 'narratology', 'detective fiction typology', 'decameron', 'narrative structure', 'structuralism'], genres: ['narrative theory', 'essay collection'],
  },
  {
    id: 'work-craft-playwriting-structure-of-action', kind: 'work', name: 'Playwriting: The Structure of Action', author: 'Sam Smiley', year: 1971, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A university textbook on how a play is built from dramatic action, covering structure, character and the playwright\'s process.',
    kw: ['smiley', 'playwriting textbook', 'dramatic action', 'play structure', 'university course'], genres: ['craft book', 'playwriting', 'textbook'],
  },
  {
    id: 'work-craft-the-implied-reader', kind: 'work', name: 'The Implied Reader', author: 'Wolfgang Iser', year: 1972, language: 'German', region: 'Germany', confidence: 'established',
    summary: 'A study of how novels from Bunyan to Beckett invite readers to fill gaps and make meaning; a founding text of reception theory.',
    aka: ['Der implizite Leser'], kw: ['iser', 'reception theory', 'reader response', 'gaps in the text', 'implied reader', 'reading process'], genres: ['reader-response theory', 'novel criticism'],
  },
  {
    id: 'work-craft-narrative-discourse', kind: 'work', name: 'Narrative Discourse', author: 'Gérard Genette', year: 1972, language: 'French', region: 'France', confidence: 'established',
    summary: 'A study of narrative built on Proust that distinguishes order, duration, frequency, mood and voice, giving writers and critics a precise vocabulary for time and point of view.',
    aka: ['Discours du récit'], kw: ['genette', 'narratology', 'focalization', 'analepsis prolepsis', 'narrative time', 'voice and mood'], genres: ['narrative theory', 'narratology'],
  },
  {
    id: 'work-craft-the-new-journalism', kind: 'work', name: 'The New Journalism', author: 'Tom Wolfe and E. W. Johnson (editors)', year: 1973, language: 'English', region: 'United States', confidence: 'established',
    summary: 'An anthology and manifesto arguing for reporting that uses scene, dialogue, point of view and telling detail, drawing on journalists of the 1960s and early 1970s.',
    kw: ['wolfe', 'new journalism', 'literary journalism', 'scene by scene', 'status details', 'reporting as narrative'], genres: ['anthology', 'literary journalism'],
  },
  {
    id: 'work-craft-pleasure-of-the-text', kind: 'work', name: 'The Pleasure of the Text', author: 'Roland Barthes', year: 1973, language: 'French', region: 'France', confidence: 'established',
    summary: 'A short, fragmentary essay on the experience of reading, distinguishing text that gives comfort from text that unsettles the reader.',
    aka: ['Le Plaisir du texte'], kw: ['barthes', 'reading pleasure', 'jouissance', 'reader experience', 'text theory'], genres: ['literary theory', 'essay'],
  },
  {
    id: 'work-craft-writing-without-teachers', kind: 'work', name: 'Writing Without Teachers', author: 'Peter Elbow', year: 1973, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A guide to freewriting and to cycles of generating and revising, which treats writing as a process learned by working with other readers rather than by correction.',
    kw: ['elbow', 'freewriting', 'writing process', 'revision', 'writing groups', 'composition teaching'], genres: ['craft book', 'composition'],
  },
  {
    id: 'work-craft-the-dialogic-imagination', kind: 'work', name: 'The Dialogic Imagination', author: 'Mikhail Bakhtin', year: 1975, language: 'Russian', region: 'Soviet Union', confidence: 'established',
    summary: 'A collection of essays written mainly in the 1930s on the novel, heteroglossia and the representation of time and space in narrative, introducing key terms of dialogic theory.',
    kw: ['bakhtin', 'heteroglossia', 'chronotope', 'dialogism', 'novel as genre', 'speech genres'], genres: ['literary theory', 'essay collection'],
  },
  {
    id: 'work-craft-the-act-of-reading', kind: 'work', name: 'The Act of Reading', author: 'Wolfgang Iser', year: 1976, language: 'German', region: 'Germany', confidence: 'established',
    summary: 'A theory of how readers realise a text through gaps and expectations, extending the argument of the author\'s earlier book on the implied reader.',
    aka: ['Der Akt des Lesens'], kw: ['iser', 'reader response', 'reception theory', 'gaps and blanks', 'reading process'], genres: ['reader-response theory'],
  },
  {
    id: 'work-craft-story-and-discourse', kind: 'work', name: 'Story and Discourse: Narrative Structure in Fiction and Film', author: 'Seymour Chatman', year: 1978, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A structuralist account of narrative that separates what is told from how it is told, applied to both fiction and film.',
    aka: ['Story and Discourse'], kw: ['chatman', 'narratology', 'story vs discourse', 'narrative film and fiction', 'structuralism'], genres: ['narrative theory', 'narratology'],
  },
  {
    id: 'work-craft-reader-the-text-the-poem', kind: 'work', name: 'The Reader, the Text, the Poem', author: 'Louise M. Rosenblatt', year: 1978, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A theory of reading as a transaction between reader and text, offering a view of literary meaning as made anew in each act of reading.',
    kw: ['rosenblatt', 'reader response', 'transactional theory', 'efferent and aesthetic reading', 'literary meaning'], genres: ['reader-response theory'],
  },
  {
    id: 'work-craft-metamorphoses-of-science-fiction', kind: 'work', name: 'Metamorphoses of Science Fiction', author: 'Darko Suvin', year: 1979, language: 'English', region: 'Canada', confidence: 'established',
    summary: 'A study that defines science fiction as the literature of cognitive estrangement and traces its history from utopias to modern work.',
    kw: ['suvin', 'cognitive estrangement', 'novum', 'science fiction theory', 'utopia', 'sf definition'], genres: ['genre theory', 'science fiction criticism'],
  },
  {
    id: 'work-craft-language-of-the-night', kind: 'work', name: 'The Language of the Night', author: 'Ursula K. Le Guin', year: 1979, language: 'English', region: 'United States', confidence: 'established',
    summary: 'Essays on fantasy and science fiction, their uses and the craft of imaginative writing, gathered from lectures and articles by the novelist.',
    kw: ['le guin', 'fantasy essays', 'science fiction essays', 'imaginative writing', 'speculative craft'], genres: ['essay collection', 'genre criticism'],
  },
  {
    id: 'work-craft-orality-and-literacy', kind: 'work', name: 'Orality and Literacy: The Technologizing of the Word', author: 'Walter J. Ong', year: 1982, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A study of how oral and written cultures differ in thought and expression, with attention to formulas, repetition and the effects of writing and print on narrative.',
    aka: ['Orality and Literacy'], kw: ['ong', 'oral culture', 'secondary orality', 'writing technology', 'formulaic style', 'oral narrative'], genres: ['media theory', 'cultural history'],
  },
  {
    id: 'work-craft-narrative-fiction-rimmon-kenan', kind: 'work', name: 'Narrative Fiction: Contemporary Poetics', author: 'Shlomith Rimmon-Kenan', year: 1983, language: 'English', region: 'Israel', confidence: 'established',
    summary: 'A concise introduction to narrative theory covering story, text and narration, with chapters on character and focalization.',
    kw: ['rimmon-kenan', 'narratology', 'focalization', 'story text narration', 'narrative theory introduction'], genres: ['narrative theory', 'textbook'],
  },
  {
    id: 'work-craft-time-and-narrative', kind: 'work', name: 'Time and Narrative', author: 'Paul Ricoeur', year: 1983, language: 'French', region: 'France', confidence: 'established',
    summary: 'A three-volume philosophical study of how stories organise human time, drawing on Augustine, Aristotle\'s account of plot and modern fiction and historiography.',
    aka: ['Temps et récit'], kw: ['ricoeur', 'narrative time', 'emplotment', 'mimesis', 'philosophy of narrative'], genres: ['philosophy of narrative', 'narrative theory'],
  },
  {
    id: 'work-craft-reading-for-the-plot', kind: 'work', name: 'Reading for the Plot', author: 'Peter Brooks', year: 1984, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A study of how narrative uses desire, repetition and endings to drive readers forward, drawing on Freud and a range of nineteenth- and twentieth-century fiction.',
    kw: ['brooks', 'plot theory', 'narrative desire', 'endings', 'psychoanalytic criticism', 'narrative drive'], genres: ['narrative theory', 'novel criticism'],
  },
  {
    id: 'work-craft-reading-the-romance', kind: 'work', name: 'Reading the Romance', author: 'Janice A. Radway', year: 1984, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A study of why a group of American women read romance novels, combining ethnography with literary analysis; a founding work of research on popular reading.',
    kw: ['radway', 'romance readers', 'popular fiction', 'reader research', 'genre audience', 'women readers'], genres: ['reception study', 'romance criticism'],
  },
  {
    id: 'work-craft-the-art-of-the-novel-kundera', kind: 'work', name: 'The Art of the Novel', author: 'Milan Kundera', year: 1986, language: 'French', region: 'France and Czechoslovakia', confidence: 'established',
    summary: 'Essays on the novel as a European art form, discussing its history, its devices and writers such as Cervantes, Kafka and Broch.',
    aka: ['L\'Art du roman'], kw: ['kundera', 'novel essays', 'european novel', 'kafka', 'cervantes', 'novel history'], genres: ['essay collection', 'novel theory'],
  },
  // ---- Earlier treatises, manifestos and handbooks (added) ----
  {
    id: 'work-craft-de-vulgari-eloquentia', kind: 'work', name: 'De vulgari eloquentia', author: 'Dante Alighieri', year: 'c. 1305 CE', language: 'Latin', region: 'Italy', confidence: 'established',
    summary: 'An unfinished Latin treatise arguing that the Italian vernacular can be a refined literary language, surveying the dialects of Italy and discussing the style and form of vernacular poetry.',
    aka: ['On Eloquence in the Vernacular'], kw: ['dante', 'vernacular', 'italian language', 'medieval poetics', 'literary language', 'dialects'], genres: ['linguistic treatise', 'poetics'],
  },
  {
    id: 'work-craft-defense-et-illustration', kind: 'work', name: 'La Défense et illustration de la langue française', author: 'Joachim du Bellay', year: 1549, language: 'French', region: 'France', confidence: 'established',
    summary: 'A manifesto urging French poets to enrich their own language by imitating ancient and Italian models creatively rather than only translating them; closely tied to the Pléiade group of poets.',
    aka: ['The Defence and Illustration of the French Language'], kw: ['du bellay', 'pleiade', 'french renaissance', 'imitation', 'vernacular poetry', 'manifesto'], genres: ['literary manifesto', 'renaissance criticism'],
  },
  {
    id: 'work-craft-preface-to-cromwell', kind: 'work', name: 'Preface to Cromwell', author: 'Victor Hugo', year: 1827, language: 'French', region: 'France', confidence: 'established',
    summary: 'A long preface to a verse play that became a manifesto of French Romanticism, rejecting strict classical unities and arguing that drama should mix the grotesque with the sublime.',
    aka: ['Préface de Cromwell'], kw: ['hugo', 'romanticism manifesto', 'grotesque and sublime', 'unities', 'romantic drama', 'french romanticism'], genres: ['literary manifesto', 'drama criticism'],
  },
  {
    id: 'work-craft-the-experimental-novel', kind: 'work', name: 'The Experimental Novel', author: 'Émile Zola', year: 1880, language: 'French', region: 'France', confidence: 'established',
    summary: 'An essay arguing that the novelist should observe and test human behaviour much as a scientist runs experiments; a programme statement for literary naturalism.',
    aka: ['Le Roman expérimental'], kw: ['zola', 'naturalism', 'scientific novel', 'observation', 'french realism', 'novel theory'], genres: ['literary manifesto', 'essay'],
  },
  {
    id: 'work-craft-philosophy-of-style-spencer', kind: 'work', name: 'The Philosophy of Style', author: 'Herbert Spencer', year: 1852, language: 'English', region: 'England', confidence: 'established',
    summary: 'An essay arguing that good style economises the reader\'s attention, so word choice and sentence order should cost the reader as little effort as possible; an early statement of the clarity-first view.',
    kw: ['spencer', 'economy of attention', 'clarity', 'style theory', 'victorian essay', 'sentence order'], genres: ['essay', 'style theory'],
  },
  {
    id: 'work-craft-play-making-archer', kind: 'work', name: 'Play-Making: A Manual of Craftsmanship', author: 'William Archer', year: 1912, language: 'English', region: 'Scotland and England', confidence: 'established',
    summary: 'A practical handbook on constructing a stage play, covering the plot, exposition, crises and the handling of scenes, by a leading theatre critic who also translated Ibsen.',
    kw: ['archer', 'playwriting', 'play construction', 'exposition', 'well-made play', 'theatre craft'], genres: ['playwriting manual', 'craft book'],
  },
  {
    id: 'work-craft-dramatic-technique-baker', kind: 'work', name: 'Dramatic Technique', author: 'George Pierce Baker', year: 1919, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A university teacher\'s survey of how plays are built, with examples drawn from many periods, growing out of his teaching of playwriting at Harvard.',
    kw: ['baker', 'playwriting', 'dramatic structure', '47 workshop', 'harvard', 'play construction'], genres: ['playwriting manual', 'craft book'],
  },
  {
    id: 'work-craft-thirty-six-dramatic-situations', kind: 'work', name: 'The Thirty-Six Dramatic Situations', author: 'Georges Polti', year: 1895, language: 'French', region: 'France', confidence: 'established',
    summary: 'A catalogue that claims all dramatic plots reduce to thirty-six basic situations, each illustrated from drama and fiction; often cited, and often disputed, in discussions of plot types.',
    aka: ['Les Trente-six situations dramatiques'], kw: ['polti', 'plot types', 'dramatic situations', 'plot catalogue', 'basic plots', 'story situations'], genres: ['plot catalogue', 'craft book'],
  },
  {
    id: 'work-craft-on-the-art-of-writing', kind: 'work', name: 'On the Art of Writing', author: 'Arthur Quiller-Couch', year: 1916, language: 'English', region: 'England', confidence: 'established',
    summary: 'Cambridge lectures on reading and writing English prose and verse, best remembered for urging writers to cut ornament that serves their own vanity rather than the reader.',
    kw: ['quiller-couch', 'murder your darlings', 'cambridge lectures', 'prose style', 'cutting ornament', 'jargon'], genres: ['lectures', 'style guide'],
  },
  {
    id: 'work-craft-reader-over-your-shoulder', kind: 'work', name: 'The Reader Over Your Shoulder', author: 'Robert Graves and Alan Hodge', year: 1943, language: 'English', region: 'England', confidence: 'established',
    summary: 'A handbook for writers of English prose that dissects faults in passages from published authors and builds from them a set of principles for plain, clear writing.',
    kw: ['graves and hodge', 'prose faults', 'plain english', 'handbook for writers', 'british usage', 'clarity'], genres: ['style guide', 'handbook'],
  },
  {
    id: 'work-craft-usage-and-abusage', kind: 'work', name: 'Usage and Abusage', author: 'Eric Partridge', year: 1942, language: 'English', region: 'England', confidence: 'established',
    summary: 'A dictionary-style guide to good English that gives opinions on disputed words and constructions in British usage; a mid-century counterpart to Fowler.',
    kw: ['partridge', 'usage guide', 'british usage', 'disputed words', 'guide to good english', 'abusage'], genres: ['usage guide', 'dictionary'],
  },
  {
    id: 'work-craft-art-of-dramatic-writing', kind: 'work', name: 'The Art of Dramatic Writing', author: 'Lajos Egri', year: 1946, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A playwriting guide that builds drama from character, arguing that a clear premise and fully drawn motives and conflict give a play its shape; also read by novelists and screenwriters. An earlier edition appeared in 1942 as How to Write a Play.',
    aka: ['How to Write a Play'], kw: ['egri', 'premise', 'character-driven drama', 'playwriting', 'dramatic conflict', 'orchestration'], genres: ['playwriting manual', 'craft book'],
  },
  {
    id: 'work-craft-modern-american-usage-follett', kind: 'work', name: 'Modern American Usage: A Guide', author: 'Wilson Follett', year: 1966, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A firm and opinionated American usage guide on grammar and diction, completed after the author\'s death by Jacques Barzun and others.',
    kw: ['follett', 'barzun', 'american usage', 'usage guide', 'prescriptive grammar', 'diction'], genres: ['usage guide', 'handbook'],
  },
  {
    id: 'work-craft-the-careful-writer', kind: 'work', name: 'The Careful Writer: A Modern Guide to English Usage', author: 'Theodore M. Bernstein', year: 1965, language: 'English', region: 'United States', confidence: 'established',
    summary: 'An alphabetical usage guide by a longtime New York Times editor that weighs disputed points of word choice and grammar for working writers and editors.',
    kw: ['bernstein', 'usage guide', 'new york times editor', 'word choice', 'newspaper usage', 'careful writer'], genres: ['usage guide', 'journalism handbook'],
  },
  {
    id: 'work-craft-a-rhetoric-of-motives', kind: 'work', name: 'A Rhetoric of Motives', author: 'Kenneth Burke', year: 1950, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A study of rhetoric as the use of language to induce cooperation, developing identification between speaker and audience as its central idea.',
    kw: ['burke', 'identification', 'new rhetoric', 'persuasion', 'audience', 'dramatism'], genres: ['rhetorical theory', 'criticism'],
  },
  {
    id: 'work-craft-the-uses-of-argument', kind: 'work', name: 'The Uses of Argument', author: 'Stephen Toulmin', year: 1958, language: 'English', region: 'England', confidence: 'established',
    summary: 'A philosophical study of how everyday arguments are built, introducing the claim, grounds and warrant layout that later teachers of composition and debate adopted.',
    kw: ['toulmin', 'claim grounds warrant', 'argument structure', 'practical reasoning', 'toulmin model', 'persuasive writing'], genres: ['philosophy of argument', 'rhetorical theory'],
  },
  {
    id: 'work-craft-mystery-and-manners', kind: 'work', name: 'Mystery and Manners', author: "Flannery O'Connor", year: 1969, language: 'English', region: 'United States', confidence: 'established',
    summary: 'Occasional prose on the craft of fiction and the writer in the American South, gathered after the author\'s death; includes talks on the short story, the grotesque and the role of belief in fiction.',
    kw: ["o'connor", 'short story craft', 'southern gothic', 'grotesque', 'fiction essays', 'writer talks'], genres: ['essay collection', 'craft essays'],
  },
  {
    id: 'work-craft-lectures-on-literature-nabokov', kind: 'work', name: 'Lectures on Literature', author: 'Vladimir Nabokov', year: 1980, language: 'English', region: 'United States', confidence: 'established',
    summary: 'Edited lecture notes from the author\'s university teaching of European novels, notable for urging close reading and attention to detail and style over theme and message.',
    kw: ['nabokov', 'close reading', 'reading as a writer', 'novel lectures', 'detail', 'teaching literature'], genres: ['lectures', 'literary criticism'],
  },
  {
    id: 'work-craft-letters-to-a-young-novelist', kind: 'work', name: 'Letters to a Young Novelist', author: 'Mario Vargas Llosa', year: 1997, language: 'Spanish', region: 'Peru', confidence: 'established',
    summary: 'A series of letters to an imagined beginner on the novelist\'s vocation, style, narrators, time, levels of reality and the structural devices of fiction.',
    aka: ['Cartas a un joven novelista'], kw: ['vargas llosa', 'novel craft', 'narrator', 'time in fiction', 'chinese boxes', 'vocation'], genres: ['craft essays', 'letters'],
  },
  {
    id: 'work-craft-six-memos-for-the-next-millennium', kind: 'work', name: 'Six Memos for the Next Millennium', author: 'Italo Calvino', year: 1988, language: 'Italian', region: 'Italy', confidence: 'established',
    summary: 'Lectures prepared for a Harvard series and published after the author\'s death, naming literary values such as lightness, quickness, exactitude, visibility and multiplicity.',
    aka: ['Lezioni americane'], kw: ['calvino', 'lightness', 'quickness', 'exactitude', 'visibility', 'multiplicity', 'norton lectures'], genres: ['lectures', 'craft essays'],
  },
  {
    id: 'work-craft-six-walks-in-the-fictional-woods', kind: 'work', name: 'Six Walks in the Fictional Woods', author: 'Umberto Eco', year: 1994, language: 'English', region: 'Italy', confidence: 'established',
    summary: 'Harvard lectures on how readers make sense of narrative, taking up the reader\'s role, the contract between author and reader and the choices that shape a story.',
    kw: ['eco', 'model reader', 'fictional contract', 'reader response', 'narrative lectures', 'norton lectures'], genres: ['lectures', 'narrative theory'],
  },
  // ---- Fiction craft since the 1980s ----
  {
    id: 'work-craft-art-of-fiction-gardner', kind: 'work', name: 'The Art of Fiction: Notes on Craft for Young Writers', author: 'John Gardner', year: 1984, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A teacher\'s guide to fiction technique built on the idea that a story should create a vivid and continuous dream in the reader\'s mind, with discussion of common craft faults and exercises.',
    kw: ['gardner', 'fictional dream', 'craft faults', 'fiction technique', 'writing exercises', 'creative writing teaching'], genres: ['craft book', 'writing guide'],
  },
  {
    id: 'work-craft-on-becoming-a-novelist', kind: 'work', name: 'On Becoming a Novelist', author: 'John Gardner', year: 1983, language: 'English', region: 'United States', confidence: 'established',
    summary: 'Reflections on the habits, attitudes and training a would-be novelist needs, covering temperament, apprenticeship and the writing life rather than technique alone.',
    kw: ['gardner', 'becoming a writer', 'novelist training', 'apprenticeship', 'writing life', 'fiction advice'], genres: ['craft book', 'writing guide'],
  },
  {
    id: 'work-craft-art-of-fiction-lodge', kind: 'work', name: 'The Art of Fiction', author: 'David Lodge', year: 1992, language: 'English', region: 'England', confidence: 'established',
    summary: 'A collection of short essays, each taking one device or topic of fiction, such as the opening, suspense, point of view or the unreliable narrator, and discussing it through passages from well-known novels.',
    kw: ['lodge', 'fiction devices', 'point of view', 'openings', 'unreliable narrator', 'suspense', 'novel essays'], genres: ['craft essays', 'literary criticism'],
  },
  {
    id: 'work-craft-writing-fiction-burroway', kind: 'work', name: 'Writing Fiction: A Guide to Narrative Craft', author: 'Janet Burroway', year: 1982, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A widely used creative-writing textbook that covers the elements of fiction, including character, setting, plot, point of view and revision, with exercises; later editions add co-authors.',
    kw: ['burroway', 'fiction textbook', 'narrative craft', 'creative writing course', 'elements of fiction', 'exercises'], genres: ['craft book', 'textbook'],
  },
  {
    id: 'work-craft-characters-and-viewpoint', kind: 'work', name: 'Characters and Viewpoint', author: 'Orson Scott Card', year: 1988, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A practical guide to creating characters and choosing and handling point of view, written for fiction writers and part of a Writer\'s Digest series on the elements of fiction.',
    kw: ['card', 'character creation', 'point of view', 'viewpoint', 'fiction craft', 'genre writers'], genres: ['craft book', 'writing guide'],
  },
  {
    id: 'work-craft-self-editing-for-fiction-writers', kind: 'work', name: 'Self-Editing for Fiction Writers', author: 'Renni Browne and Dave King', year: 1993, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A manual for revising your own fiction, written by two professional editors, covering dialogue mechanics, interior monologue, point of view, proportion and exposition.',
    kw: ['browne and king', 'self-editing', 'revision', 'dialogue mechanics', 'show and tell', 'editing your own novel'], genres: ['craft book', 'editing guide'],
  },
  {
    id: 'work-craft-writing-the-breakout-novel', kind: 'work', name: 'Writing the Breakout Novel', author: 'Donald Maass', year: 2001, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A guide by a literary agent on raising a novel\'s ambition through high stakes, strong characters, layered plot and theme, aimed at writers moving from competent to distinctive work.',
    kw: ['maass', 'breakout novel', 'high stakes', 'literary agent advice', 'novel ambition', 'plot and character'], genres: ['craft book', 'writing guide'],
  },
  {
    id: 'work-craft-plot-and-structure-bell', kind: 'work', name: 'Plot & Structure', author: 'James Scott Bell', year: 2004, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A craft guide that explains story structure through opening, confrontation and resolution, with techniques for plotting, scene building and revising a novel.',
    kw: ['bell', 'plot structure', 'three-act structure', 'novel plotting', 'writers digest', 'story structure'], genres: ['craft book', 'writing guide'],
  },
  {
    id: 'work-craft-stein-on-writing', kind: 'work', name: 'Stein on Writing', author: 'Sol Stein', year: 1995, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A craft book by a working editor and novelist, with advice on characterisation, dialogue, conflict and revision drawn from his work with other authors.',
    kw: ['stein', 'editor advice', 'dialogue', 'conflict', 'revision', 'fiction and nonfiction craft'], genres: ['craft book', 'editing guide'],
  },
  {
    id: 'work-craft-writing-down-the-bones', kind: 'work', name: 'Writing Down the Bones', author: 'Natalie Goldberg', year: 1986, language: 'English', region: 'United States', confidence: 'established',
    summary: 'Short chapters on writing practice, using timed free writing and close attention to detail as a way into creative work, shaped by the author\'s Zen practice.',
    kw: ['goldberg', 'freewriting', 'writing practice', 'timed writing', 'zen and writing', 'creative practice'], genres: ['craft book', 'writing guide'],
  },
  {
    id: 'work-craft-bird-by-bird', kind: 'work', name: 'Bird by Bird', author: 'Anne Lamott', year: 1994, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A warm, anecdotal guide to writing and the writing life, known for its advice to take assignments in small pieces and to let first drafts be rough.',
    aka: ['Bird by Bird: Some Instructions on Writing and Life'], kw: ['lamott', 'first drafts', 'writing life', 'small assignments', 'perfectionism', 'writer anxiety'], genres: ['craft book', 'writing memoir'],
  },
  {
    id: 'work-craft-on-writing-king', kind: 'work', name: 'On Writing: A Memoir of the Craft', author: 'Stephen King', year: 2000, language: 'English', region: 'United States', confidence: 'established',
    summary: 'Part autobiography and part toolbox, with advice on vocabulary, grammar, description, dialogue, drafting and revision from a prolific popular novelist.',
    kw: ['stephen king', 'on writing', 'toolbox', 'drafting', 'revision', 'writing memoir', 'adverbs'], genres: ['craft book', 'writing memoir'],
  },
  {
    id: 'work-craft-zen-in-the-art-of-writing', kind: 'work', name: 'Zen in the Art of Writing', author: 'Ray Bradbury', year: 1990, language: 'English', region: 'United States', confidence: 'established',
    summary: 'Essays on creativity and the writing life that advocate writing from enthusiasm, memory and lists of nouns, by a short-story and science-fiction author.',
    kw: ['bradbury', 'enthusiasm', 'creative process', 'word association', 'writing habits', 'speculative writers'], genres: ['craft essays', 'writing guide'],
  },
  {
    id: 'work-craft-the-writing-life-dillard', kind: 'work', name: 'The Writing Life', author: 'Annie Dillard', year: 1989, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A brief, reflective book on the daily labour of writing, describing the long work of making a book and the writer\'s relation to time, place and the page.',
    kw: ['dillard', 'writing routine', 'writer labour', 'the work of writing', 'reflective essays', 'writing life'], genres: ['craft essays', 'writing memoir'],
  },
  {
    id: 'work-craft-reading-like-a-writer', kind: 'work', name: 'Reading Like a Writer', author: 'Francine Prose', year: 2006, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A guide that treats close reading as apprenticeship, looking at how admired authors handle words, sentences, paragraphs, narration, character and dialogue.',
    kw: ['prose', 'close reading', 'learning from authors', 'sentences', 'paragraphs', 'apprenticeship'], genres: ['craft book', 'literary criticism'],
  },
  {
    id: 'work-craft-how-fiction-works', kind: 'work', name: 'How Fiction Works', author: 'James Wood', year: 2008, language: 'English', region: 'England and United States', confidence: 'established',
    summary: 'A short critical guide to narrative technique, with extended attention to free indirect style, detail, character and dialogue, illustrated from many novelists.',
    kw: ['wood', 'free indirect style', 'narration', 'detail', 'character', 'critical guide', 'novel technique'], genres: ['literary criticism', 'craft book'],
  },
  {
    id: 'work-craft-steering-the-craft', kind: 'work', name: 'Steering the Craft', author: 'Ursula K. Le Guin', year: 1998, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A workshop handbook of discussions and exercises on sound, sentence rhythm, point of view and narrative voice, written for writers working alone or in groups.',
    kw: ['le guin', 'writing exercises', 'sentence rhythm', 'workshop handbook', 'point of view', 'narrative voice'], genres: ['craft book', 'writing exercises'],
  },
  {
    id: 'work-craft-negotiating-with-the-dead', kind: 'work', name: 'Negotiating with the Dead', author: 'Margaret Atwood', year: 2002, language: 'English', region: 'Canada', confidence: 'established',
    summary: 'A set of lectures on why writers write, whom they write for and what they owe to the past, treating writing as a journey into an underworld of memory and risk.',
    kw: ['atwood', 'why writers write', 'writer and reader', 'lectures', 'writing and the past', 'writer\'s double self'], genres: ['lectures', 'craft essays'],
  },
  {
    id: 'work-craft-a-swim-in-a-pond-in-the-rain', kind: 'work', name: 'A Swim in a Pond in the Rain', author: 'George Saunders', year: 2021, language: 'English', region: 'United States', confidence: 'established',
    summary: 'Close readings of seven short stories by nineteenth-century Russian writers, used to teach how a story escalates, turns and rewards revision.',
    kw: ['saunders', 'russian short stories', 'story escalation', 'close reading', 'chekhov', 'tolstoy', 'revision'], genres: ['craft book', 'literary criticism'],
  },
  {
    id: 'work-craft-playing-in-the-dark', kind: 'work', name: 'Playing in the Dark', author: 'Toni Morrison', year: 1992, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A work of criticism, written from a novelist\'s view of how texts are made, on how race shapes the imagination of canonical American fiction by white writers.',
    aka: ['Playing in the Dark: Whiteness and the Literary Imagination'], kw: ['morrison', 'race in american literature', 'literary imagination', 'canon', 'africanist presence', 'writer as critic'], genres: ['literary criticism', 'essay'],
  },
  {
    id: 'work-craft-the-art-of-subtext', kind: 'work', name: 'The Art of Subtext', author: 'Charles Baxter', year: 2007, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A short book of essays on what lies beneath a scene\'s surface, showing how what characters leave unsaid and what a story withholds can carry meaning.',
    aka: ['The Art of Subtext: Beyond Plot'], kw: ['baxter', 'subtext', 'unspoken', 'scene craft', 'fiction essays', 'what is withheld'], genres: ['craft essays', 'craft book'],
  },
  {
    id: 'work-craft-wired-for-story', kind: 'work', name: 'Wired for Story', author: 'Lisa Cron', year: 2012, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A guide that argues, drawing on popular accounts of cognitive science, that readers are pulled in by a protagonist\'s goal and the internal struggle behind it.',
    kw: ['cron', 'story and the brain', 'protagonist goal', 'internal struggle', 'story structure', 'cognitive science'], genres: ['craft book', 'writing guide'],
  },
  {
    id: 'work-craft-beginnings-middles-and-ends', kind: 'work', name: 'Beginnings, Middles & Ends', author: 'Nancy Kress', year: 1993, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A Writer\'s Digest guide on how to open a story, sustain its middle and close it, written by a fiction writer and teacher.',
    kw: ['kress', 'story openings', 'sagging middle', 'endings', 'story shape', 'fiction craft'], genres: ['craft book', 'writing guide'],
  },
  {
    id: 'work-craft-scene-and-structure', kind: 'work', name: 'Scene & Structure', author: 'Jack M. Bickham', year: 1993, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A technique guide that breaks fiction into scenes and sequels and shows how to build scenes around a goal, conflict and setback.',
    kw: ['bickham', 'scene and sequel', 'goal conflict disaster', 'scene building', 'fiction structure', 'writers digest'], genres: ['craft book', 'writing guide'],
  },
  {
    id: 'work-craft-telling-lies-for-fun-and-profit', kind: 'work', name: 'Telling Lies for Fun & Profit', author: 'Lawrence Block', year: 1981, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A manual for fiction writers collected from the author\'s magazine columns, mixing practical craft advice with plain talk about the working life of a professional novelist.',
    aka: ['Telling Lies for Fun and Profit'], kw: ['block', 'fiction manual', 'writers digest columns', 'professional writer', 'crime novelist advice', 'craft'], genres: ['craft book', 'writing guide'],
  },
  {
    id: 'work-craft-from-where-you-dream', kind: 'work', name: 'From Where You Dream', author: 'Robert Olen Butler', year: 2005, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A creative-writing guide, edited from lectures by Janet Burroway, that treats fiction as writing from the unconscious, which the author calls dreamspace, rather than from the analytic mind.',
    kw: ['butler', 'dreamspace', 'unconscious', 'sensory writing', 'fiction process', 'burroway'], genres: ['craft book', 'writing guide'],
  },
  // ---- Screenwriting, playwriting and film craft ----
  {
    id: 'work-craft-story-mckee', kind: 'work', name: 'Story: Substance, Structure, Style and the Principles of Screenwriting', author: 'Robert McKee', year: 1997, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A detailed guide to story design that covers structure, scene beats, genre conventions and the controlling idea; written for screenwriters and widely read by novelists and playwrights.',
    aka: ['Story'], kw: ['mckee', 'story structure', 'controlling idea', 'beats', 'genre conventions', 'screenwriting guide'], genres: ['screenwriting guide', 'craft book'],
  },
  {
    id: 'work-craft-screenplay-foundations', kind: 'work', name: 'Screenplay: The Foundations of Screenwriting', author: 'Syd Field', year: 1979, language: 'English', region: 'United States', confidence: 'established',
    summary: 'An early mass-market screenwriting manual that popularised the three-act paradigm with plot points; its prescriptions are widely taught and widely debated.',
    aka: ['Screenplay'], kw: ['syd field', 'three-act paradigm', 'plot points', 'screenwriting manual', 'act structure', 'screenplay structure'], genres: ['screenwriting guide', 'craft book'],
  },
  {
    id: 'work-craft-save-the-cat', kind: 'work', name: 'Save the Cat', author: 'Blake Snyder', year: 2005, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A screenwriting guide that lays out a fixed beat sheet and a set of story types, widely adopted by screenwriters and novelists as a planning shortcut.',
    aka: ['Save the Cat: The Last Book on Screenwriting That You\'ll Ever Need'], kw: ['snyder', 'beat sheet', 'story types', 'screenwriting', 'plot beats', 'logline'], genres: ['screenwriting guide', 'craft book'],
  },
  {
    id: 'work-craft-the-writers-journey', kind: 'work', name: "The Writer's Journey", author: 'Christopher Vogler', year: 1992, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A guide that adapts the hero\'s journey pattern from Joseph Campbell into practical stages and character archetypes for screenwriters and novelists.',
    aka: ['The Writer\'s Journey: Mythic Structure for Writers'], kw: ['vogler', 'hero\'s journey', 'archetypes', 'mythic structure', 'story stages', 'campbell'], genres: ['screenwriting guide', 'craft book'],
  },
  {
    id: 'work-craft-the-anatomy-of-story', kind: 'work', name: 'The Anatomy of Story', author: 'John Truby', year: 2007, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A story-structure guide that builds a narrative from premise and character through a sequence of twenty-two steps, written for screenwriters and novelists.',
    aka: ['The Anatomy of Story: 22 Steps to Becoming a Master Storyteller'], kw: ['truby', '22 steps', 'story structure', 'premise', 'character web', 'screenwriting'], genres: ['screenwriting guide', 'craft book'],
  },
  {
    id: 'work-craft-adventures-in-the-screen-trade', kind: 'work', name: 'Adventures in the Screen Trade', author: 'William Goldman', year: 1983, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A screenwriter\'s account of working in Hollywood that mixes industry anecdote with practical observations on how scripts are developed, rewritten and made.',
    kw: ['goldman', 'hollywood', 'screenwriter memoir', 'script development', 'screen trade', 'film industry'], genres: ['screenwriting memoir', 'craft book'],
  },
  {
    id: 'work-craft-making-a-good-script-great', kind: 'work', name: 'Making a Good Script Great', author: 'Linda Seger', year: 1987, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A guide by a script consultant to reworking a screenplay, covering structure, characters, dialogue and the revisions that turn a competent draft into a stronger one.',
    kw: ['seger', 'script doctoring', 'screenplay revision', 'script consultant', 'rewriting', 'story analysis'], genres: ['screenwriting guide', 'editing guide'],
  },
  {
    id: 'work-craft-writing-screenplays-that-sell', kind: 'work', name: 'Writing Screenplays That Sell', author: 'Michael Hauge', year: 1988, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A guide to developing and selling a screenplay that pairs a staged story-structure model with advice on concept, character and positioning a script for the market.',
    kw: ['hauge', 'screenplay structure', 'selling a script', 'concept', 'six stages', 'movie market'], genres: ['screenwriting guide', 'craft book'],
  },
  {
    id: 'work-craft-in-the-blink-of-an-eye', kind: 'work', name: 'In the Blink of an Eye', author: 'Walter Murch', year: 1995, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A short book by a film editor on what makes a cut work, offering a ranked list of what a good cut preserves; useful to writers thinking about scene transitions and rhythm.',
    kw: ['murch', 'film editing', 'cutting', 'scene transitions', 'rhythm', 'montage', 'film craft'], genres: ['film craft book', 'editing guide'],
  },
  {
    id: 'work-craft-hitchcock-truffaut', kind: 'work', name: 'Hitchcock', author: 'François Truffaut', year: 1966, language: 'French', region: 'France', confidence: 'established',
    summary: 'A book-length interview in which a director explains how he planned and staged his films, long used as a resource on suspense, visual storytelling and the withholding of information.',
    aka: ['Hitchcock/Truffaut', 'Le Cinéma selon Hitchcock'], kw: ['truffaut', 'hitchcock', 'suspense', 'film interview', 'visual storytelling', 'bomb under the table'], genres: ['film interview', 'film craft book'],
  },
  {
    id: 'work-craft-three-uses-of-the-knife', kind: 'work', name: 'Three Uses of the Knife', author: 'David Mamet', year: 1998, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A short book of essays by a playwright and director on why drama exists and how it works, stressing a character\'s pursuit of a goal over description and backstory.',
    kw: ['mamet', 'drama theory', 'action and want', 'playwriting essays', 'dramatic purpose', 'backstory'], genres: ['drama essays', 'craft book'],
  },
  {
    id: 'work-craft-comics-and-sequential-art', kind: 'work', name: 'Comics and Sequential Art', author: 'Will Eisner', year: 1985, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A craft book by a leading cartoonist on how comics tell stories, covering panel layout, timing, lettering, imagery and the grammar of sequential art.',
    kw: ['eisner', 'comics craft', 'panel layout', 'sequential art', 'comic timing', 'graphic storytelling'], genres: ['comics craft book', 'craft book'],
  },
  // ---- Plot, structure and digital narrative ----
  {
    id: 'work-craft-the-seven-basic-plots', kind: 'work', name: 'The Seven Basic Plots', author: 'Christopher Booker', year: 2004, language: 'English', region: 'England', confidence: 'established',
    summary: 'A long study that sorts stories from myth to modern film into seven plot types; widely read, though its claim that these types cover all stories is disputed.',
    aka: ['The Seven Basic Plots: Why We Tell Stories'], kw: ['booker', 'basic plots', 'overcoming the monster', 'rags to riches', 'the quest', 'plot types'], genres: ['plot theory', 'literary criticism'],
  },
  {
    id: 'work-craft-20-master-plots', kind: 'work', name: '20 Master Plots (and How to Build Them)', author: 'Ronald B. Tobias', year: 1993, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A plot guide that describes twenty recurring plot patterns, including quest, pursuit, rivalry and transformation, with advice on building each into a story.',
    aka: ['Twenty Master Plots'], kw: ['tobias', 'master plots', 'plot patterns', 'quest', 'revenge', 'plot guide'], genres: ['plot guide', 'craft book'],
  },
  {
    id: 'work-craft-hamlet-on-the-holodeck', kind: 'work', name: 'Hamlet on the Holodeck', author: 'Janet H. Murray', year: 1997, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A study of how digital media may change storytelling, built around the ideas of immersion, agency and transformation; an early reference for interactive narrative and game writing.',
    aka: ['Hamlet on the Holodeck: The Future of Narrative in Cyberspace'], kw: ['murray', 'interactive narrative', 'immersion', 'agency', 'digital storytelling', 'game writing'], genres: ['interactive narrative theory', 'media criticism'],
  },
  {
    id: 'work-craft-cybertext', kind: 'work', name: 'Cybertext: Perspectives on Ergodic Literature', author: 'Espen J. Aarseth', year: 1997, language: 'English', region: 'Norway', confidence: 'established',
    summary: 'A study of texts that demand non-trivial effort from the reader to traverse, from the I Ching to hypertext and games; a foundation of game studies and electronic literature.',
    aka: ['Cybertext'], kw: ['aarseth', 'ergodic literature', 'hypertext', 'game studies', 'electronic literature', 'interactive fiction'], genres: ['media theory', 'game studies'],
  },
  // ---- Style, usage and nonfiction craft ----
  {
    id: 'work-craft-on-writing-well', kind: 'work', name: 'On Writing Well', author: 'William Zinsser', year: 1976, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A guide to writing nonfiction clearly that stresses simplicity, cutting clutter and keeping a human voice, with chapters on particular kinds of nonfiction; revised many times since its first printing.',
    kw: ['zinsser', 'nonfiction writing', 'clutter', 'simplicity', 'clear writing', 'journalism craft', 'plain style'], genres: ['style guide', 'nonfiction craft'],
  },
  {
    id: 'work-craft-the-sense-of-style', kind: 'work', name: 'The Sense of Style', author: 'Steven Pinker', year: 2014, language: 'English', region: 'United States and Canada', confidence: 'established',
    summary: 'A style guide that draws on linguistics and cognitive science to explain clear prose, built around a model of the writer showing the reader something in the world.',
    aka: ['The Sense of Style: The Thinking Person\'s Guide to Writing in the 21st Century'], kw: ['pinker', 'classic style', 'curse of knowledge', 'cognitive science of writing', 'clear prose', 'style guide'], genres: ['style guide', 'linguistics for writers'],
  },
  {
    id: 'work-craft-style-toward-clarity-and-grace', kind: 'work', name: 'Style: Toward Clarity and Grace', author: 'Joseph M. Williams', year: 1990, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A teaching text on diagnosing unclear prose by asking who does what in each sentence, and on shaping paragraphs and whole documents so readers can follow them.',
    kw: ['williams', 'characters and actions', 'nominalisation', 'clarity', 'sentence diagnosis', 'composition teaching'], genres: ['style guide', 'textbook'],
  },
  {
    id: 'work-craft-eats-shoots-and-leaves', kind: 'work', name: 'Eats, Shoots & Leaves', author: 'Lynne Truss', year: 2003, language: 'English', region: 'England', confidence: 'established',
    summary: 'A humorous popular guide to English punctuation that defends traditional rules; much read, and criticised by some linguists as more prescriptive than the evidence supports.',
    aka: ['Eats, Shoots and Leaves'], kw: ['truss', 'punctuation guide', 'apostrophe', 'comma', 'popular grammar', 'prescriptivism'], genres: ['usage guide', 'punctuation guide'],
  },
  {
    id: 'work-craft-woe-is-i', kind: 'work', name: 'Woe Is I', author: "Patricia T. O'Conner", year: 1996, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A light grammar and usage guide for general readers that gives relaxed advice on common points of confusion, such as pronoun case and who versus whom.',
    aka: ['Woe Is I: The Grammarphobe\'s Guide to Better English in Plain English'], kw: ["o'conner", 'grammarphobe', 'pronoun case', 'who vs whom', 'grammar for general readers', 'usage guide'], genres: ['usage guide', 'grammar guide'],
  },
  {
    id: 'work-craft-between-you-and-me', kind: 'work', name: 'Between You & Me', author: 'Mary Norris', year: 2015, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A grammar book in memoir form by a longtime magazine copy editor, taking up pronouns, commas and house-style questions with humour and personal stories.',
    aka: ['Between You and Me: Confessions of a Comma Queen'], kw: ['norris', 'copy editor memoir', 'new yorker style', 'commas', 'pronouns', 'house style', 'grammar'], genres: ['usage guide', 'editing memoir'],
  },
  {
    id: 'work-craft-dreyers-english', kind: 'work', name: "Dreyer's English", author: 'Benjamin Dreyer', year: 2019, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A guide to clear writing by a veteran publishing-house copy chief that mixes advice on punctuation, usage and style with the author\'s own firm preferences.',
    kw: ['dreyer', 'copy chief', 'usage opinions', 'punctuation', 'house style', 'random house', 'style guide'], genres: ['style guide', 'usage guide'],
  },
  {
    id: 'work-craft-how-to-write-a-sentence', kind: 'work', name: 'How to Write a Sentence', author: 'Stanley Fish', year: 2011, language: 'English', region: 'United States', confidence: 'established',
    summary: 'Reflections on sentence craft that treat a sentence as a form of organised thought, with admired examples from many writers; the subtitle adds that it also shows how to read one.',
    aka: ['How to Write a Sentence: And How to Read One'], kw: ['fish', 'sentence craft', 'syntax', 'sentence forms', 'reading sentences', 'prose style'], genres: ['style guide', 'craft book'],
  },
  {
    id: 'work-craft-artful-sentences', kind: 'work', name: 'Artful Sentences: Syntax as Style', author: 'Virginia Tufte', year: 2006, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A study of syntax as style that shows how sentence shapes in literary prose create effects such as balance, emphasis and rhythm, with many quoted examples.',
    kw: ['tufte', 'syntax as style', 'sentence shapes', 'balance', 'emphasis', 'rhythm', 'prose analysis'], genres: ['style guide', 'craft book'],
  },
  {
    id: 'work-craft-sin-and-syntax', kind: 'work', name: 'Sin and Syntax', author: 'Constance Hale', year: 1999, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A style guide that treats grammar as a toolkit for lively, vivid prose rather than a list of prohibitions, with attention to verbs, rhythm and word choice.',
    aka: ['Sin and Syntax: How to Craft Wickedly Effective Prose'], kw: ['hale', 'lively prose', 'verbs', 'word choice', 'grammar as tool', 'style guide'], genres: ['style guide', 'craft book'],
  },
  {
    id: 'work-craft-writing-with-power', kind: 'work', name: 'Writing with Power', author: 'Peter Elbow', year: 1981, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A guide to the writing process that sets out a two-stage method of generating freely and then revising critically, with discussion of voice and audience.',
    kw: ['elbow', 'freewriting', 'revision method', 'voice', 'audience', 'writing process', 'composition'], genres: ['composition guide', 'craft book'],
  },
  {
    id: 'work-craft-writing-tools', kind: 'work', name: 'Writing Tools: 50 Essential Strategies for Every Writer', author: 'Roy Peter Clark', year: 2006, language: 'English', region: 'United States', confidence: 'established',
    summary: 'Fifty short chapters, each presenting one technique of the writing craft, from word choice to structure, written by a teacher of journalism for writers of every kind.',
    aka: ['Writing Tools'], kw: ['clark', 'writing strategies', 'short chapters', 'journalism teaching', 'toolkit', 'word choice'], genres: ['style guide', 'craft book'],
  },
  {
    id: 'work-craft-several-short-sentences-about-writing', kind: 'work', name: 'Several Short Sentences About Writing', author: 'Verlyn Klinkenborg', year: 2012, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A brief book of short, numbered observations that urges writers to treat each sentence as a unit of thought and to attend to what a sentence actually says.',
    kw: ['klinkenborg', 'sentence by sentence', 'short sentences', 'attention', 'writing teaching', 'prose practice'], genres: ['craft book', 'writing guide'],
  },
  {
    id: 'work-craft-the-elements-of-eloquence', kind: 'work', name: 'The Elements of Eloquence', author: 'Mark Forsyth', year: 2013, language: 'English', region: 'England', confidence: 'established',
    summary: 'A lively popular tour of rhetorical figures that names each device and shows how English writers use it to make a phrase memorable.',
    aka: ['The Elements of Eloquence: How to Turn the Perfect English Phrase'], kw: ['forsyth', 'rhetorical figures', 'memorable phrases', 'chiasmus', 'alliteration', 'popular rhetoric'], genres: ['rhetoric guide', 'popular language book'],
  },
  {
    id: 'work-craft-the-craft-of-research', kind: 'work', name: 'The Craft of Research', author: 'Wayne C. Booth, Gregory G. Colomb and Joseph M. Williams', year: 1995, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A guide to planning, arguing and writing up a research project, covering questions, evidence, claims and the reader\'s expectations; revised in later editions.',
    kw: ['booth colomb williams', 'research writing', 'argument', 'evidence', 'research questions', 'thesis writing'], genres: ['research guide', 'textbook'],
  },
  {
    id: 'work-craft-they-say-i-say', kind: 'work', name: 'They Say / I Say: The Moves That Matter in Academic Writing', author: 'Gerald Graff and Cathy Birkenstein', year: 2006, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A short guide that teaches academic writing as entering a conversation, with templates for stating others\' views and framing one\'s own response.',
    aka: ['They Say / I Say'], kw: ['graff and birkenstein', 'academic writing', 'templates', 'summarising', 'entering the conversation', 'argument'], genres: ['composition guide', 'textbook'],
  },
  // ---- Editing and the publishing process ----
  {
    id: 'work-craft-the-subversive-copy-editor', kind: 'work', name: 'The Subversive Copy Editor', author: 'Carol Fisher Saller', year: 2009, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A guide to the working relationship between editors and authors that stresses when to follow a style rule and when to bend it for the reader\'s sake.',
    aka: ['The Subversive Copy Editor: Advice from Chicago'], kw: ['saller', 'copyediting', 'author-editor relationship', 'house style', 'editing advice', 'chicago style'], genres: ['editing guide', 'publishing handbook'],
  },
  {
    id: 'work-craft-the-forest-for-the-trees', kind: 'work', name: 'The Forest for the Trees', author: 'Betsy Lerner', year: 2000, language: 'English', region: 'United States', confidence: 'established',
    summary: 'An editor-turned-agent\'s account of the writer\'s path to publication, including types of writers and the relationship between author and editor.',
    aka: ['The Forest for the Trees: An Editor\'s Advice to Writers'], kw: ['lerner', 'editor advice', 'author-editor relationship', 'publication path', 'writer temperament', 'literary agent'], genres: ['publishing guide', 'writing guide'],
  },
  {
    id: 'work-craft-editors-on-editing', kind: 'work', name: 'Editors on Editing', author: 'Gerald Gross (editor)', year: 1962, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A collection of essays by working editors on what editing involves in book and magazine publishing, revised in later editions.',
    aka: ['Editors on Editing: An Inside View of What Editors Do'], kw: ['gross', 'book editing', 'magazine editing', 'what editors do', 'publishing practice', 'editor essays'], genres: ['essay collection', 'publishing handbook'],
  },
  {
    id: 'work-craft-the-fiction-editor-the-novel-and-the-novelist', kind: 'work', name: 'The Fiction Editor, the Novel, and the Novelist', author: 'Thomas McCormack', year: 1988, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A book by a publishing editor on how an editor reads a novel and where its problems usually come from, with attention to the relationship between writer and editor.',
    kw: ['mccormack', 'fiction editing', 'novel problems', 'editor and writer', 'manuscript diagnosis', 'st martins'], genres: ['editing guide', 'publishing handbook'],
  },
  {
    id: 'work-craft-the-elements-of-journalism', kind: 'work', name: 'The Elements of Journalism', author: 'Bill Kovach and Tom Rosenstiel', year: 2001, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A study of the principles of news reporting, including a commitment to truth, verification, independence and loyalty to citizens, drawn from interviews with journalists.',
    aka: ['The Elements of Journalism: What Newspeople Should Know and the Public Should Expect'], kw: ['kovach and rosenstiel', 'journalism ethics', 'verification', 'independence', 'news principles', 'reporting'], genres: ['journalism handbook', 'media criticism'],
  },
  {
    id: 'work-craft-writing-for-story', kind: 'work', name: 'Writing for Story', author: 'Jon Franklin', year: 1986, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A guide to narrative newspaper writing that dissects how a story is structured, using the author\'s own prize-winning stories as worked examples.',
    kw: ['franklin', 'narrative journalism', 'story structure in news', 'feature writing', 'newspaper narrative', 'complication resolution'], genres: ['journalism handbook', 'nonfiction craft'],
  },
  {
    id: 'work-craft-telling-true-stories', kind: 'work', name: 'Telling True Stories', author: 'Mark Kramer and Wendy Call (editors)', year: 2007, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A guide to narrative nonfiction from a university journalism foundation that gathers advice from many working writers and editors on reporting, structure, voice and ethics.',
    aka: ['Telling True Stories: A Nonfiction Writers\' Guide from the Nieman Foundation at Harvard University'], kw: ['kramer and call', 'nieman', 'narrative nonfiction', 'literary journalism', 'reporting', 'ethics of nonfiction'], genres: ['nonfiction craft', 'essay collection'],
  },
  {
    id: 'work-craft-draft-no-4', kind: 'work', name: 'Draft No. 4', author: 'John McPhee', year: 2017, language: 'English', region: 'United States', confidence: 'established',
    summary: 'Essays on the writing process by a long-time narrative nonfiction writer, covering structure, editing, revision and the choices that shape a long factual piece.',
    aka: ['Draft No. 4: On the Writing Process'], kw: ['mcphee', 'nonfiction structure', 'revision', 'writing process', 'long-form journalism', 'editing'], genres: ['craft essays', 'nonfiction craft'],
  },
  // ---- Memoir and creative nonfiction craft ----
  {
    id: 'work-craft-the-art-of-memoir', kind: 'work', name: 'The Art of Memoir', author: 'Mary Karr', year: 2015, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A craft book on writing memoir by a poet, memoirist and teacher, mixing instruction with her reading and teaching on voice, truth and memory.',
    kw: ['karr', 'memoir craft', 'voice', 'memory', 'truth in memoir', 'personal narrative'], genres: ['memoir craft book', 'craft book'],
  },
  {
    id: 'work-craft-the-situation-and-the-story', kind: 'work', name: 'The Situation and the Story', author: 'Vivian Gornick', year: 2001, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A short book on the personal essay and memoir that distinguishes the situation, meaning the circumstances, from the story, meaning the insight the writer brings to them.',
    aka: ['The Situation and the Story: The Art of Personal Narrative'], kw: ['gornick', 'personal essay', 'memoir craft', 'narrator persona', 'insight', 'personal narrative'], genres: ['memoir craft book', 'essay'],
  },
  {
    id: 'work-craft-to-show-and-to-tell', kind: 'work', name: 'To Show and to Tell', author: 'Phillip Lopate', year: 2013, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A guide to literary nonfiction by an essayist and teacher that looks at the balance between scene and reflection, the writer\'s persona and the problems of writing about real people.',
    aka: ['To Show and to Tell: The Craft of Literary Nonfiction'], kw: ['lopate', 'personal essay', 'reflection', 'persona', 'writing about real people', 'literary nonfiction'], genres: ['nonfiction craft', 'essay'],
  },
  {
    id: 'work-craft-you-cant-make-this-stuff-up', kind: 'work', name: "You Can't Make This Stuff Up", author: 'Lee Gutkind', year: 2012, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A guide to creative nonfiction, from memoir to literary journalism, by the founder of a journal of the form, covering its forms, ethics and the use of fictional techniques with true material.',
    kw: ['gutkind', 'creative nonfiction', 'literary journalism', 'memoir forms', 'ethics', 'true stories'], genres: ['nonfiction craft', 'craft book'],
  },
  // ---- Poetry craft ----
  {
    id: 'work-craft-a-poetry-handbook', kind: 'work', name: 'A Poetry Handbook', author: 'Mary Oliver', year: 1994, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A compact introduction to reading and writing poems, with short chapters on sound, line, metre, imagery and revision by a poet who teaches through example.',
    kw: ['oliver', 'poetry basics', 'line breaks', 'meter', 'sound in poetry', 'imagery', 'revising poems'], genres: ['poetry craft book', 'writing guide'],
  },
  {
    id: 'work-craft-the-poetry-home-repair-manual', kind: 'work', name: 'The Poetry Home Repair Manual', author: 'Ted Kooser', year: 2005, language: 'English', region: 'United States', confidence: 'established',
    summary: 'Practical advice for beginning poets on making poems clear and engaging to a general reader, covering metaphor, imagery, form and the presentation of poems.',
    aka: ['The Poetry Home Repair Manual: Practical Advice for Beginning Poets'], kw: ['kooser', 'beginning poets', 'metaphor', 'clarity', 'accessible poetry', 'poetry advice'], genres: ['poetry craft book', 'writing guide'],
  },
  {
    id: 'work-craft-how-to-read-a-poem', kind: 'work', name: 'How to Read a Poem', author: 'Edward Hirsch', year: 1999, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A guide to reading poetry attentively that combines close readings with the author\'s account of what poems do for readers and what they ask of them.',
    aka: ['How to Read a Poem: And Fall in Love with Poetry'], kw: ['hirsch', 'reading poetry', 'close reading', 'poetry appreciation', 'lyric', 'poem analysis'], genres: ['poetry criticism', 'writing guide'],
  },
  {
    id: 'work-craft-the-triggering-town', kind: 'work', name: 'The Triggering Town', author: 'Richard Hugo', year: 1979, language: 'English', region: 'United States', confidence: 'established',
    summary: 'Lectures and essays on writing poetry, best known for the idea that a poem begins from a real place or thing that triggers the poet\'s own subject, which may differ from the starting point.',
    aka: ['The Triggering Town: Lectures and Essays on Poetry and Writing'], kw: ['hugo', 'triggering subject', 'poetry teaching', 'place', 'poem origins', 'poetry lectures'], genres: ['poetry craft book', 'craft essays'],
  },
  {
    id: 'work-craft-the-sounds-of-poetry', kind: 'work', name: 'The Sounds of Poetry: A Brief Guide', author: 'Robert Pinsky', year: 1998, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A short guide to how English poems use sound, from vowels and consonants to lines and rhythm, with the argument that poetry is a vocal art.',
    aka: ['The Sounds of Poetry'], kw: ['pinsky', 'sound of poetry', 'vowels and consonants', 'rhythm', 'line', 'poetry as vocal art'], genres: ['poetry craft book', 'writing guide'],
  },
  {
    id: 'work-craft-the-ode-less-travelled', kind: 'work', name: 'The Ode Less Travelled', author: 'Stephen Fry', year: 2005, language: 'English', region: 'England', confidence: 'established',
    summary: 'A popular introduction to writing formal verse that covers metre, rhyme and traditional forms, with exercises for beginners.',
    aka: ['The Ode Less Travelled: Unlocking the Poet Within'], kw: ['fry', 'formal verse', 'metre', 'rhyme', 'traditional forms', 'poetry exercises'], genres: ['poetry craft book', 'writing guide'],
  },
  {
    id: 'work-craft-the-book-of-forms', kind: 'work', name: 'The Book of Forms: A Handbook of Poetics', author: 'Lewis Turco', year: 1968, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A handbook of English-language poetic forms, metres and terms that defines and illustrates each; expanded across later editions.',
    aka: ['The Book of Forms'], kw: ['turco', 'poetic forms', 'prosody', 'sonnet', 'villanelle', 'handbook of poetics'], genres: ['poetry handbook', 'reference work'],
  },
  {
    id: 'work-craft-the-redress-of-poetry', kind: 'work', name: 'The Redress of Poetry', author: 'Seamus Heaney', year: 1995, language: 'English', region: 'Ireland', confidence: 'established',
    summary: 'Lectures by a poet delivered while he held an Oxford professorship, on poetry\'s relation to public life and the imagination, with essays on individual poets.',
    kw: ['heaney', 'poetry and politics', 'oxford lectures', 'imagination', 'poetry criticism', 'poet essays'], genres: ['lectures', 'poetry criticism'],
  },
  {
    id: 'work-craft-proofs-and-theories', kind: 'work', name: 'Proofs and Theories: Essays on Poetry', author: 'Louise Glück', year: 1994, language: 'English', region: 'United States', confidence: 'established',
    summary: 'Essays on poetry and the writing life by an American poet, covering her own process, her teaching and other poets, with attention to doubt and silence in the work.',
    aka: ['Proofs and Theories'], kw: ['gluck', 'poet essays', 'poetry process', 'silence', 'doubt', 'poetry criticism'], genres: ['poetry criticism', 'craft essays'],
  },
  // ---- Writers on writing around the world ----
  {
    id: 'work-craft-morning-yet-on-creation-day', kind: 'work', name: 'Morning Yet on Creation Day', author: 'Chinua Achebe', year: 1975, language: 'English', region: 'Nigeria', confidence: 'established',
    summary: 'Essays and lectures on African literature, colonial attitudes, language choice and the responsibility of the writer in a changing society.',
    kw: ['achebe', 'african literature', 'writer responsibility', 'colonialism', 'language choice', 'essays'], genres: ['essay collection', 'literary criticism'],
  },
  {
    id: 'work-craft-the-fragrance-of-guava', kind: 'work', name: 'The Fragrance of Guava', author: 'Gabriel García Márquez and Plinio Apuleyo Mendoza', year: 1982, language: 'Spanish', region: 'Colombia', confidence: 'established',
    summary: 'A book-length conversation in which a novelist discusses his early life, working methods and influences with a friend and fellow writer.',
    aka: ['El olor de la guayaba'], kw: ['garcia marquez', 'novelist interview', 'working methods', 'influences', 'magical realism', 'latin american writers'], genres: ['interview', 'writer memoir'],
  },
  {
    id: 'work-craft-theory-of-literature-soseki', kind: 'work', name: 'Theory of Literature (Bungakuron)', author: 'Natsume Sōseki', year: 1907, language: 'Japanese', region: 'Japan', confidence: 'established',
    summary: 'A theoretical study of what literature is and how readers experience it, using psychological and social categories; an early and original work of literary theory from Japan.',
    aka: ['Bungakuron'], kw: ['soseki', 'japanese literary theory', 'reader experience', 'meiji', 'literature theory', 'bungakuron'], genres: ['literary theory', 'critical study'],
  },
  {
    id: 'work-craft-novelist-as-a-vocation', kind: 'work', name: 'Novelist as a Vocation', author: 'Haruki Murakami', year: 2015, language: 'Japanese', region: 'Japan', confidence: 'established',
    summary: 'A collection of essays on how the author came to write novels, with reflections on originality, discipline, characters and readers.',
    aka: ['Shokugyō to shite no shōsetsuka'], kw: ['murakami', 'novelist essays', 'originality', 'discipline', 'becoming a writer', 'japanese writers'], genres: ['craft essays', 'writer memoir'],
  },
  // ---- Narrative theory and criticism, further landmarks ----
  {
    id: 'work-craft-transparent-minds', kind: 'work', name: 'Transparent Minds', author: 'Dorrit Cohn', year: 1978, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A study of the techniques fiction uses to present characters\' inner lives, naming quoted monologue, narrated monologue and psycho-narration.',
    aka: ['Transparent Minds: Narrative Modes for Presenting Consciousness in Fiction'], kw: ['cohn', 'interior monologue', 'free indirect discourse', 'psycho-narration', 'consciousness', 'narrative modes'], genres: ['narrative theory', 'novel criticism'],
  },
  {
    id: 'work-craft-a-theory-of-narrative-stanzel', kind: 'work', name: 'A Theory of Narrative', author: 'Franz K. Stanzel', year: 1979, language: 'German', region: 'Austria', confidence: 'established',
    summary: 'A systematic account of narrative situations that distinguishes authorial, first-person and figural narration and arranges them on a typological circle.',
    aka: ['Theorie des Erzählens'], kw: ['stanzel', 'narrative situations', 'authorial narration', 'figural narration', 'typological circle', 'point of view theory'], genres: ['narrative theory', 'poetics'],
  },
  {
    id: 'work-craft-structure-of-the-artistic-text', kind: 'work', name: 'The Structure of the Artistic Text', author: 'Yuri Lotman', year: 1970, language: 'Russian', region: 'Estonia and the Soviet Union', confidence: 'established',
    summary: 'A semiotic study of how literary texts are organised as layered systems of meaning; a foundation of the Tartu-Moscow school of cultural semiotics.',
    aka: ['Struktura khudozhestvennogo teksta'], kw: ['lotman', 'semiotics', 'tartu school', 'text structure', 'artistic text', 'russian structuralism'], genres: ['literary theory', 'semiotics'],
  },
  {
    id: 'work-craft-a-poetics-of-composition', kind: 'work', name: 'A Poetics of Composition', author: 'Boris Uspensky', year: 1970, language: 'Russian', region: 'Soviet Union', confidence: 'established',
    summary: 'A study of point of view in literature and art that separates ideological, phraseological, spatial and temporal, and psychological planes of narration.',
    aka: ['Poetika kompozitsii'], kw: ['uspensky', 'point of view', 'planes of narration', 'composition', 'russian structuralism', 'narrative perspective'], genres: ['narrative theory', 'poetics'],
  },
  {
    id: 'work-craft-linguistics-and-poetics', kind: 'work', name: 'Linguistics and Poetics', author: 'Roman Jakobson', year: 1960, language: 'English', region: 'Russia and United States', confidence: 'established',
    summary: 'An essay setting out six factors of communication and six functions of language, with the poetic function defined as a focus on the message itself.',
    kw: ['jakobson', 'poetic function', 'functions of language', 'communication model', 'structuralism', 'poetics'], genres: ['linguistic essay', 'literary theory'],
  },
  {
    id: 'work-craft-structuralist-poetics', kind: 'work', name: 'Structuralist Poetics', author: 'Jonathan Culler', year: 1975, language: 'English', region: 'United States', confidence: 'established',
    summary: 'An introduction to structuralist approaches to literature that asks how readers acquire the conventions needed to make sense of poems and stories.',
    aka: ['Structuralist Poetics: Structuralism, Linguistics and the Study of Literature'], kw: ['culler', 'literary competence', 'structuralism', 'conventions of reading', 'literary theory', 'semiotics'], genres: ['literary theory', 'critical study'],
  },
  {
    id: 'work-craft-literary-theory-an-introduction', kind: 'work', name: 'Literary Theory: An Introduction', author: 'Terry Eagleton', year: 1983, language: 'English', region: 'England', confidence: 'established',
    summary: 'A survey of twentieth-century approaches to literature, from phenomenology and reception theory to structuralism and psychoanalysis, written from a Marxist standpoint and widely used as a course text.',
    kw: ['eagleton', 'literary theory survey', 'structuralism', 'psychoanalysis', 'marxist criticism', 'reception theory'], genres: ['literary theory', 'textbook'],
  },
  {
    id: 'work-craft-is-there-a-text-in-this-class', kind: 'work', name: 'Is There a Text in This Class?', author: 'Stanley Fish', year: 1980, language: 'English', region: 'United States', confidence: 'established',
    summary: 'Essays arguing that meaning arises from the interpretive habits of reading communities rather than from the text alone; a central work of reader-response criticism.',
    aka: ['Is There a Text in This Class? The Authority of Interpretive Communities'], kw: ['fish', 'interpretive communities', 'reader response', 'meaning', 'reading communities', 'criticism'], genres: ['literary theory', 'essay collection'],
  },
  {
    id: 'work-craft-a-dictionary-of-narratology', kind: 'work', name: 'A Dictionary of Narratology', author: 'Gerald Prince', year: 1987, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A reference work that defines the technical terms of narrative theory, such as focalisation, narratee and story time, for students and critics.',
    kw: ['prince', 'narratology terms', 'narratee', 'focalisation', 'story time', 'narrative theory glossary'], genres: ['reference work', 'narrative theory'],
  },
  {
    id: 'work-craft-cambridge-introduction-to-narrative', kind: 'work', name: 'The Cambridge Introduction to Narrative', author: 'H. Porter Abbott', year: 2002, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A concise student introduction to narrative theory that explains plot, story and discourse, narration and closure with examples from many media.',
    kw: ['abbott', 'narrative introduction', 'story and discourse', 'narration', 'closure', 'narrative theory basics'], genres: ['narrative theory', 'textbook'],
  },
];
