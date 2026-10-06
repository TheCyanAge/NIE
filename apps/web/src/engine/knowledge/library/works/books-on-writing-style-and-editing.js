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
  // MORE
];
