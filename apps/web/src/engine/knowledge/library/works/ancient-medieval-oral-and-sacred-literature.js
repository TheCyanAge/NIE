// Notable works: ancient, medieval, oral and sacred literature (from the earliest writing to about 1800).
// Reference only: each record names a real work, its author or tradition, a first-publication or approximate year and the original
// language, with one neutral sentence on what it is and why it matters. No plot spoilers, no quotations.
// Years marked "c." are approximate. Where scholars place a work in a wide range of dates, or disagree about its authorship,
// `confidence` is `varies` or `contested`. Sacred texts are described in literary-historical terms only, with respect and without
// doctrinal claims. See ../README.md for the record format.
export const PREFIX = 'work-anc-';
export default [
  // ---- Ancient Near East and Egypt ----
  {
    id: 'work-anc-epic-of-gilgamesh', kind: 'work', name: 'The Epic of Gilgamesh', author: 'Anonymous (Mesopotamian scribal tradition)', year: 'c. 1800 BCE', language: 'Akkadian', region: 'Mesopotamia',
    genres: ['epic poem', 'heroic epic', 'wisdom literature'], kw: ['gilgamesh', 'enkidu', 'uruk', 'mesopotamian epic', 'oldest epic', 'flood story'], confidence: 'established',
    summary: 'A Mesopotamian epic poem about the king of Uruk, his friend Enkidu and his search for lasting life, known from Old Babylonian tablets and a later standard version; one of the earliest surviving long works of literature.',
  },
  {
    id: 'work-anc-enuma-elish', kind: 'work', name: 'Enūma Eliš (The Babylonian Epic of Creation)', author: 'Anonymous (Babylonian scribal tradition)', year: 'c. 1100 BCE', language: 'Akkadian', region: 'Babylonia',
    genres: ['creation myth', 'epic poem', 'ritual poetry'], kw: ['enuma elish', 'marduk', 'tiamat', 'babylonian creation', 'creation epic'], confidence: 'varies',
    summary: 'A Babylonian poem on the birth of the gods and the rise of Marduk to kingship, recited at the New Year festival; a key source for Mesopotamian cosmology and an early example of myth used to honour a city and its ruler.',
  },
  {
    id: 'work-anc-atra-hasis', kind: 'work', name: 'Atra-Hasis', author: 'Anonymous (Babylonian scribal tradition)', year: 'c. 1700 BCE', language: 'Akkadian', region: 'Babylonia',
    genres: ['epic poem', 'creation myth', 'flood narrative'], kw: ['atrahasis', 'flood myth', 'creation of humans', 'mesopotamian myth'], confidence: 'established',
    summary: 'An Old Babylonian epic on the creation of humankind, a divine plan to reduce the human population and a survivor warned in time; an early flood narrative that the Gilgamesh epic later draws on.',
  },
  {
    id: 'work-anc-inannas-descent', kind: 'work', name: "Inanna's Descent to the Netherworld", author: 'Anonymous (Sumerian scribal tradition)', year: 'c. 1800 BCE', language: 'Sumerian', region: 'Mesopotamia',
    genres: ['myth', 'narrative poem', 'descent to the underworld'], kw: ['inanna', 'ishtar', 'underworld', 'descent myth', 'sumerian poem', 'ereshkigal'], confidence: 'varies',
    summary: 'A Sumerian poem in which the goddess Inanna passes through seven gates into the realm of the dead and is stripped of her powers at each; known from Old Babylonian tablets and an early story of descent and return.',
  },
  {
    id: 'work-anc-exaltation-of-inanna', kind: 'work', name: 'The Exaltation of Inanna (Nin-me-šara)', author: 'Enheduanna', year: 'c. 2300 BCE', language: 'Sumerian', region: 'Ur and Akkad',
    genres: ['hymn', 'temple hymn', 'lyric poetry'], kw: ['enheduanna', 'first named author', 'inanna', 'sumerian hymn', 'sargon of akkad', 'high priestess'], confidence: 'varies',
    summary: 'A Sumerian hymn attributed to Enheduanna, a high priestess at Ur and daughter of Sargon of Akkad, often called the first named author in history; it addresses the goddess Inanna in a personal first-person voice.',
  },
  {
    id: 'work-anc-baal-cycle', kind: 'work', name: 'The Baal Cycle', author: 'Anonymous (tablets copied by the scribe Ilimilku of Ugarit)', year: 'c. 1350 BCE', language: 'Ugaritic', region: 'Ugarit (Syria)',
    genres: ['myth cycle', 'epic poem', 'Canaanite literature'], kw: ['baal', 'ugarit', 'ras shamra', 'canaanite myth', 'storm god', 'ugaritic poetry'], confidence: 'varies',
    summary: 'A set of Ugaritic poems on the storm god Baal, his struggle against the sea and death, and his enthronement; found at Ras Shamra, it is a key source for Canaanite myth and for early West Semitic poetic style.',
  },
  {
    id: 'work-anc-pyramid-texts', kind: 'work', name: 'The Pyramid Texts', author: 'Anonymous (Egyptian priestly tradition)', year: 'c. 2350 BCE', language: 'Egyptian (Old Egyptian)', region: 'Egypt',
    genres: ['funerary literature', 'ritual texts', 'hymns'], kw: ['pyramid texts', 'old kingdom', 'egyptian spells', 'unas', 'funerary spells', 'afterlife texts'], confidence: 'established',
    summary: 'The oldest surviving body of Egyptian religious writing, carved on the walls of royal pyramids near the end of the Old Kingdom as spells and hymns for the king\'s passage to the afterlife; among the oldest known religious texts.',
  },
  {
    id: 'work-anc-egyptian-book-of-the-dead', kind: 'work', name: 'The Egyptian Book of the Dead', author: 'Anonymous (Egyptian priestly tradition)', year: 'c. 1550 BCE', language: 'Egyptian (Middle and Late Egyptian)', region: 'Egypt',
    genres: ['funerary literature', 'spells', 'illustrated papyrus'], kw: ['book of the dead', 'going forth by day', 'weighing of the heart', 'osiris', 'egyptian afterlife', 'new kingdom papyrus'], confidence: 'varies',
    summary: 'A collection of spells, hymns and illustrations, written on papyrus for the dead from the New Kingdom onward and including the weighing of the heart; the modern title is a convenient label for texts the Egyptians called Going Forth by Day.',
  },
  {
    id: 'work-anc-story-of-sinuhe', kind: 'work', name: 'The Story of Sinuhe', author: 'Anonymous (Egyptian scribal tradition)', year: 'c. 1900 BCE', language: 'Egyptian (Middle Egyptian)', region: 'Egypt',
    genres: ['narrative', 'prose fiction', 'autobiographical tale'], kw: ['sinuhe', 'middle kingdom', 'egyptian story', 'exile tale', 'ancient egyptian fiction'], confidence: 'established',
    summary: 'A Middle Kingdom story of an Egyptian courtier who flees abroad after a king\'s death, builds a new life among foreigners and longs to return home; regarded as a classic of Egyptian narrative prose.',
  },

  // ---- Sacred and wisdom texts read as literature (literary-historical description only) ----
  {
    id: 'work-anc-hebrew-bible', kind: 'work', name: 'The Hebrew Bible (Tanakh)', author: 'Various authors and editors', year: 'c. 500 BCE', language: 'Hebrew (with some Aramaic)', region: 'Ancient Israel and Judah',
    genres: ['scripture', 'narrative', 'prophecy', 'wisdom literature', 'lyric poetry'], kw: ['hebrew bible', 'tanakh', 'old testament', 'genesis', 'biblical narrative', 'parallelism'], confidence: 'varies',
    summary: 'A collection of law, narrative, prophecy, poetry and wisdom writing composed and edited over many centuries, with the dating of its parts debated; studied as literature for its spare storytelling, parallel verse and wide influence on European writing.',
  },
  {
    id: 'work-anc-book-of-job', kind: 'work', name: 'The Book of Job', author: 'Anonymous', year: 'c. 500 BCE', language: 'Hebrew', region: 'Ancient Israel and Judah',
    genres: ['wisdom literature', 'dramatic poetry', 'dialogue'], kw: ['job', 'undeserved suffering', 'wisdom poetry', 'theodicy', 'biblical poetry'], confidence: 'varies',
    summary: 'A book of the Hebrew Bible that sets a long poetic dialogue between a sufferer and his friends inside a prose frame, taking up undeserved suffering; widely read as dramatic poetry and as wisdom literature.',
  },
  {
    id: 'work-anc-book-of-psalms', kind: 'work', name: 'The Book of Psalms', author: 'Anonymous (traditionally associated with King David and other poets)', year: 'c. 500 BCE', language: 'Hebrew', region: 'Ancient Israel and Judah',
    genres: ['lyric poetry', 'hymn', 'lament', 'devotional poetry'], kw: ['psalms', 'psalter', 'hebrew lyric', 'lament', 'biblical poetry', 'praise poem'], confidence: 'varies',
    summary: 'A collection of one hundred and fifty poems in the standard Hebrew count, made of laments, praises, thanksgivings and petitions in parallel lines; a central model for the lyric voice in worship and in English poetry.',
  },
  {
    id: 'work-anc-new-testament', kind: 'work', name: 'The New Testament', author: 'Various early Christian authors', year: 'c. 80 CE', language: 'Koine Greek', region: 'Eastern Mediterranean',
    genres: ['scripture', 'gospel', 'epistle', 'apocalyptic literature'], kw: ['new testament', 'gospels', 'epistles', 'parables', 'acts', 'biblical letters'], confidence: 'varies',
    summary: 'A collection of gospels, letters, a history of the early church and an apocalypse in Greek, written between roughly the middle of the first century and the early second; studied as literature for its parables, letter forms and wide cultural influence.',
  },
  {
    id: 'work-anc-king-james-bible', kind: 'work', name: 'The King James Bible (Authorized Version)', author: 'Translation committees commissioned by King James I', year: 1611, language: 'English', region: 'England',
    genres: ['scripture translation', 'prose', 'liturgical language'], kw: ['king james', 'authorized version', 'kjv', 'english bible', 'jacobean prose', 'bible translation'], confidence: 'established',
    summary: 'The 1611 English translation of the Bible produced by committees of scholars; its rhythmic prose and many phrases passed into everyday English and shaped writers for centuries.',
  },
  {
    id: 'work-anc-quran', kind: 'work', name: "The Qur'an", author: 'Recited by the Prophet Muhammad (text collected after his lifetime)', year: 'c. 650 CE', language: 'Arabic', region: 'Arabian Peninsula',
    genres: ['scripture', 'rhymed prose', 'recitation'], kw: ['quran', 'koran', 'suras', 'classical arabic', 'quranic style', 'recitation'], confidence: 'varies',
    summary: 'The central text of Islam, in classical Arabic, arranged in 114 chapters of varying length in a rhythmic, rhymed prose; it is also a landmark in the history of the Arabic literary language and the art of recitation.',
  },
  {
    id: 'work-anc-rigveda', kind: 'work', name: 'The Rigveda', author: 'Anonymous (Vedic priestly poet families)', year: 'c. 1300 BCE', language: 'Vedic Sanskrit', region: 'Northern India',
    genres: ['hymns', 'ritual poetry', 'scripture'], kw: ['rigveda', 'rig veda', 'vedic hymns', 'vedas', 'oral tradition', 'indo-european poetry'], confidence: 'varies',
    summary: 'A collection of more than a thousand Sanskrit hymns, the oldest of the Vedas, preserved orally with great care for centuries before being written; among the oldest surviving texts in any Indo-European language.',
  },
  {
    id: 'work-anc-upanishads', kind: 'work', name: 'The Principal Upanishads', author: 'Anonymous (Vedic teachers)', year: 'c. 700 BCE', language: 'Sanskrit', region: 'Northern India',
    genres: ['philosophical dialogue', 'scripture', 'wisdom literature'], kw: ['upanishads', 'vedanta', 'brahman', 'atman', 'indian philosophy', 'sanskrit dialogues'], confidence: 'varies',
    summary: 'A group of Sanskrit prose and verse texts that explore the self, the cosmos and ultimate reality through dialogue and parable; central to Indian thought and widely read in translation as contemplative literature.',
  },
  {
    id: 'work-anc-bhagavad-gita', kind: 'work', name: 'The Bhagavad Gita', author: 'Anonymous (traditionally ascribed to Vyasa)', year: 'c. 200 BCE', language: 'Sanskrit', region: 'India',
    genres: ['philosophical poem', 'dialogue', 'scripture'], kw: ['bhagavad gita', 'gita', 'arjuna', 'krishna', 'song of the lord', 'mahabharata episode'], confidence: 'varies',
    summary: 'A Sanskrit poem of seven hundred verses, set inside the Mahabharata as a dialogue between a warrior and his charioteer before battle; one of the most widely translated and discussed texts in Indian literature.',
  },
  {
    id: 'work-anc-dhammapada', kind: 'work', name: 'The Dhammapada', author: 'Anonymous (Buddhist tradition)', year: 'c. 250 BCE', language: 'Pali', region: 'India',
    genres: ['verse anthology', 'wisdom literature', 'scripture'], kw: ['dhammapada', 'buddhist verses', 'pali canon', 'aphorisms', 'path of virtue'], confidence: 'varies',
    summary: 'A Pali anthology of just over four hundred short verses on conduct, the mind and the way to freedom, set out in themed chapters; a compact, aphoristic text widely read in translation.',
  },
  {
    id: 'work-anc-tao-te-ching', kind: 'work', name: 'Tao Te Ching (Daodejing)', author: 'Laozi (traditional attribution)', year: 'c. 350 BCE', language: 'Classical Chinese', region: 'China',
    genres: ['philosophical verse', 'wisdom literature', 'scripture'], kw: ['tao te ching', 'daodejing', 'laozi', 'lao tzu', 'taoism', 'daoism', 'the way'], confidence: 'contested',
    summary: 'A short Classical Chinese text of eighty-one brief chapters in terse, paradoxical verse about the way (dao) and effortless action; its authorship and date are debated, and it is among the most translated books in the world.',
  },
  {
    id: 'work-anc-analects', kind: 'work', name: 'The Analects', author: 'Confucius (sayings recorded by his followers)', year: 'c. 400 BCE', language: 'Classical Chinese', region: 'China',
    genres: ['sayings', 'dialogue', 'ethical philosophy'], kw: ['analects', 'confucius', 'lunyu', 'confucianism', 'chinese classics', 'sayings'], confidence: 'varies',
    summary: 'A collection of brief sayings and exchanges attributed to Confucius and his disciples, compiled after his death; foundational to Chinese ethical and educational thought and a model of concise, conversational prose.',
  },
  {
    id: 'work-anc-zhuangzi', kind: 'work', name: 'The Zhuangzi', author: 'Zhuang Zhou (traditional attribution; later writers contributed)', year: 'c. 300 BCE', language: 'Classical Chinese', region: 'China',
    genres: ['philosophical prose', 'parable', 'fantasy'], kw: ['zhuangzi', 'chuang tzu', 'daoist parables', 'butterfly dream', 'taoism', 'chinese philosophy'], confidence: 'varies',
    summary: 'A Daoist text of parables, dialogues and fantasies, including tales of odd craftsmen and a famous butterfly dream, whose humour and imaginative leaps make it one of the great works of Chinese prose.',
  },
  {
    id: 'work-anc-avesta', kind: 'work', name: 'The Avesta', author: 'Anonymous (Zoroastrian priestly tradition)', year: 'c. 1000 BCE', language: 'Avestan', region: 'Ancient Iran and Central Asia',
    genres: ['scripture', 'hymns', 'ritual texts'], kw: ['avesta', 'gathas', 'zoroastrian texts', 'zarathustra', 'old avestan', 'persian scripture'], confidence: 'contested',
    summary: 'The collected sacred texts of the Zoroastrian tradition in Avestan, whose oldest part, the Gathas, is in an archaic poetic language that scholars date from the late second to the early first millennium BCE; the written Avesta took shape much later.',
  },
  {
    id: 'work-anc-i-ching', kind: 'work', name: 'The I Ching (Book of Changes)', author: 'Anonymous (Zhou dynasty tradition)', year: 'c. 800 BCE', language: 'Classical Chinese', region: 'China',
    genres: ['divination text', 'wisdom literature', 'classic'], kw: ['i ching', 'yijing', 'book of changes', 'hexagrams', 'chinese divination', 'zhou yi'], confidence: 'varies',
    summary: 'A Chinese divination text of sixty-four six-line figures with brief judgments and later commentaries; read for centuries as a book of wisdom and a source of imagery and structure for writers and thinkers.',
  },
  {
    id: 'work-anc-guru-granth-sahib', kind: 'work', name: 'Guru Granth Sahib (Adi Granth)', author: 'Sikh Gurus and other poet-saints (compiled by Guru Arjan in 1604)', year: 1604, language: 'Punjabi, Sant Bhasha and other languages (Gurmukhi script)', region: 'Punjab',
    genres: ['scripture', 'devotional poetry', 'hymns set to ragas'], kw: ['guru granth sahib', 'adi granth', 'sikh scripture', 'kabir', 'gurmukhi', 'devotional hymns'], confidence: 'established',
    summary: 'The scripture of the Sikh tradition, first compiled in 1604 and later given its final form, made of devotional poems set in musical modes by Sikh gurus and by poet-saints such as Kabir and Ravidas; notable as both poetry and music.',
  },
  // ---- Greek and Roman antiquity, and late antiquity ----
  {
    id: 'work-anc-iliad', kind: 'work', name: 'The Iliad', author: 'Homer (traditional attribution)', year: 'c. 750 BCE', language: 'Ancient Greek', region: 'Greece and Ionia',
    genres: ['epic poem', 'heroic epic', 'oral-formulaic poetry'], kw: ['iliad', 'homer', 'achilles', 'trojan war', 'greek epic', 'dactylic hexameter'], confidence: 'established',
    summary: 'An epic poem in dactylic hexameter on a few weeks in the tenth year of the Trojan War, centred on the anger of Achilles; a founding poem of European literature and a model for epic structure and starting in the middle of events.',
  },
  {
    id: 'work-anc-odyssey', kind: 'work', name: 'The Odyssey', author: 'Homer (traditional attribution)', year: 'c. 725 BCE', language: 'Ancient Greek', region: 'Greece and Ionia',
    genres: ['epic poem', 'adventure', 'homecoming story'], kw: ['odyssey', 'homer', 'odysseus', 'ithaca', 'greek epic', 'nostos', 'homecoming'], confidence: 'established',
    summary: 'An epic poem of the long journey home of Odysseus from Troy and of the situation he finds in Ithaca; notable for its flashbacks, stories within stories and the long delay before the hero is recognised.',
  },
  {
    id: 'work-anc-theogony', kind: 'work', name: 'Theogony', author: 'Hesiod', year: 'c. 700 BCE', language: 'Ancient Greek', region: 'Boeotia, Greece',
    genres: ['didactic poem', 'cosmogony', 'genealogical poetry'], kw: ['hesiod', 'theogony', 'greek gods', 'titans', 'origin of the gods', 'muses'], confidence: 'established',
    summary: 'A Greek poem that gives an ordered account of the birth of the gods and the world, from Chaos to the rule of Zeus; the main early source for Greek cosmogony and a model of poetry as genealogy.',
  },
  {
    id: 'work-anc-works-and-days', kind: 'work', name: 'Works and Days', author: 'Hesiod', year: 'c. 700 BCE', language: 'Ancient Greek', region: 'Boeotia, Greece',
    genres: ['didactic poem', 'wisdom literature', 'farming poem'], kw: ['hesiod', 'works and days', 'pandora', 'ages of man', 'farming poem', 'greek moral poetry'], confidence: 'established',
    summary: 'A Greek didactic poem addressed to the poet\'s brother that mixes farming advice, a calendar of lucky and unlucky days, the myths of Pandora and the Ages of Man, and an argument for justice and honest work.',
  },
  {
    id: 'work-anc-poems-of-sappho', kind: 'work', name: 'The Poems of Sappho', author: 'Sappho', year: 'c. 600 BCE', language: 'Ancient Greek (Aeolic)', region: 'Lesbos, Greece',
    genres: ['lyric poetry', 'love poetry', 'fragments'], kw: ['sappho', 'lesbos', 'greek lyric', 'fragments', 'sapphic stanza', 'first person lyric'], confidence: 'established',
    summary: 'Greek lyric poems by a poet of Lesbos, surviving mostly as fragments quoted by later writers or found on papyrus; a model of the intense personal first-person lyric voice and the source of the Sapphic stanza.',
  },
  {
    id: 'work-anc-victory-odes', kind: 'work', name: 'The Victory Odes (Epinikia)', author: 'Pindar', year: 'c. 470 BCE', language: 'Ancient Greek', region: 'Thebes, Greece',
    genres: ['choral lyric', 'ode', 'praise poetry'], kw: ['pindar', 'pindaric ode', 'epinikia', 'olympian odes', 'greek choral poetry', 'victory song'], confidence: 'varies',
    summary: 'Choral poems for winners at the great Greek games that combine praise, myth and moral reflection in an elevated, intricate style; the model for the Pindaric ode in later European poetry.',
  },
  {
    id: 'work-anc-argonautica', kind: 'work', name: 'Argonautica', author: 'Apollonius of Rhodes', year: 'c. 250 BCE', language: 'Ancient Greek', region: 'Alexandria, Egypt',
    genres: ['epic poem', 'Hellenistic poetry', 'quest narrative'], kw: ['argonautica', 'apollonius', 'jason', 'golden fleece', 'medea', 'hellenistic epic'], confidence: 'varies',
    summary: 'A Hellenistic Greek epic on Jason\'s quest for the Golden Fleece, notable for its learned manner and for its psychologically drawn portrait of Medea; a link between Homer and Virgil.',
  },
  {
    id: 'work-anc-idylls', kind: 'work', name: 'The Idylls', author: 'Theocritus', year: 'c. 270 BCE', language: 'Ancient Greek', region: 'Sicily and Alexandria',
    genres: ['pastoral poetry', 'Hellenistic poetry', 'short poems'], kw: ['theocritus', 'idylls', 'pastoral', 'shepherds', 'bucolic poetry', 'origin of pastoral'], confidence: 'varies',
    summary: 'Short Greek poems, many set among herdsmen in the Sicilian countryside, that founded the pastoral tradition later taken up by Virgil and by Renaissance poets.',
  },
  {
    id: 'work-anc-aesops-fables', kind: 'work', name: "Aesop's Fables", author: 'Aesop (traditional attribution)', year: 'c. 550 BCE', language: 'Ancient Greek', region: 'Greece',
    genres: ['fable', 'animal tale', 'moral tale'], kw: ['aesop', 'fables', 'animal fables', 'moral of the story', 'beast fable', 'tortoise and the hare'], confidence: 'varies',
    summary: 'A body of short animal fables with a stated or implied moral, linked to a storyteller said to have lived in the sixth century BCE and gathered by later writers; the model for the fable in Europe.',
  },
  {
    id: 'work-anc-aeneid', kind: 'work', name: 'The Aeneid', author: 'Virgil', year: 'c. 19 BCE', language: 'Latin', region: 'Rome',
    genres: ['epic poem', 'national epic', 'literary epic'], kw: ['aeneid', 'virgil', 'vergil', 'aeneas', 'roman epic', 'founding of rome'], confidence: 'established',
    summary: 'A Latin epic in twelve books on the flight of Aeneas from Troy and the founding of the line that leads to Rome; left not fully revised at Virgil\'s death, it became the model for national and literary epic.',
  },
  {
    id: 'work-anc-eclogues', kind: 'work', name: 'The Eclogues', author: 'Virgil', year: 'c. 38 BCE', language: 'Latin', region: 'Rome',
    genres: ['pastoral poetry', 'short poems', 'dialogue poem'], kw: ['eclogues', 'bucolics', 'virgil', 'pastoral', 'shepherd poems', 'roman pastoral'], confidence: 'established',
    summary: 'Ten Latin pastoral poems that adapt Theocritus to Italian settings and Roman politics; they fixed the convention of shepherds who speak in verse of love, loss and power.',
  },
  {
    id: 'work-anc-georgics', kind: 'work', name: 'The Georgics', author: 'Virgil', year: 'c. 29 BCE', language: 'Latin', region: 'Rome',
    genres: ['didactic poem', 'farming poem', 'nature poetry'], kw: ['georgics', 'virgil', 'didactic poetry', 'farming', 'bees', 'roman poetry'], confidence: 'established',
    summary: 'A four-book Latin didactic poem on crops, vines, livestock and bees that turns practical instruction into a meditation on labour, order and fragility; a model of a poem that teaches a craft.',
  },
  {
    id: 'work-anc-odes-of-horace', kind: 'work', name: 'The Odes', author: 'Horace', year: 'c. 23 BCE', language: 'Latin', region: 'Rome',
    genres: ['lyric poetry', 'ode', 'verse'], kw: ['horace', 'odes', 'carpe diem', 'roman lyric', 'latin odes', 'alcaic stanza'], confidence: 'established',
    summary: 'Four books of Latin lyric poems on love, wine, friendship, public duty and the passing of time, polished into compact stanzas; a standing model for the ode in European poetry.',
  },
  {
    id: 'work-anc-poems-of-catullus', kind: 'work', name: 'The Poems of Catullus', author: 'Catullus', year: 'c. 55 BCE', language: 'Latin', region: 'Rome',
    genres: ['lyric poetry', 'love poetry', 'satire', 'elegy'], kw: ['catullus', 'carmina', 'roman lyric', 'neoteric poets', 'lesbia', 'latin love poems'], confidence: 'varies',
    summary: 'A single book of Latin poems by a poet of the late Roman Republic, ranging from tender and bitter love lyrics to satire and elegy; admired for its direct, personal voice.',
  },
  {
    id: 'work-anc-de-rerum-natura', kind: 'work', name: 'On the Nature of Things (De rerum natura)', author: 'Lucretius', year: 'c. 55 BCE', language: 'Latin', region: 'Rome',
    genres: ['didactic poem', 'philosophical poem', 'science writing'], kw: ['lucretius', 'de rerum natura', 'epicurean', 'atoms', 'science as poetry', 'latin hexameter'], confidence: 'varies',
    summary: 'A six-book Latin philosophical poem that presents Epicurean physics in verse, explaining atoms, the senses and death; a classic case of science and argument written as poetry.',
  },
  {
    id: 'work-anc-metamorphoses-ovid', kind: 'work', name: 'Metamorphoses', author: 'Ovid', year: 'c. 8 CE', language: 'Latin', region: 'Rome',
    genres: ['narrative poem', 'mythology', 'epic poem'], kw: ['ovid', 'metamorphoses', 'transformation myths', 'roman mythology', 'daphne', 'narcissus'], confidence: 'established',
    summary: 'A Latin narrative poem in fifteen books that links hundreds of myths of transformation in one flowing frame; a chief source of classical myth for later European writers and artists.',
  },
  {
    id: 'work-anc-satyricon', kind: 'work', name: 'The Satyricon', author: 'Petronius (traditional attribution)', year: 'c. 60 CE', language: 'Latin', region: 'Rome',
    genres: ['satire', 'comic novel', 'prosimetrum'], kw: ['petronius', 'satyricon', 'trimalchio', 'roman novel', 'menippean satire', 'ancient novel'], confidence: 'varies',
    summary: 'A fragmentary Latin satire in prose and verse that follows a young man\'s misadventures; one of the few surviving ancient comic novels, best known for the feast hosted by a vulgar, newly rich freedman.',
  },
  {
    id: 'work-anc-golden-ass', kind: 'work', name: 'The Golden Ass (Metamorphoses)', author: 'Apuleius', year: 'c. 170 CE', language: 'Latin', region: 'Roman North Africa',
    genres: ['ancient novel', 'picaresque', 'fantasy', 'comic fiction'], kw: ['apuleius', 'golden ass', 'cupid and psyche', 'ancient novel', 'transformed into a donkey', 'roman fiction'], confidence: 'varies',
    summary: 'The only ancient Latin novel to survive complete, a comic and fantastical tale of a man turned into a donkey; it contains the inset tale of Cupid and Psyche and shaped later picaresque and fairy-tale narrative.',
  },
  {
    id: 'work-anc-alexander-romance', kind: 'work', name: 'The Alexander Romance', author: 'Pseudo-Callisthenes (anonymous)', year: 'c. 300 CE', language: 'Ancient Greek', region: 'Alexandria, Egypt',
    genres: ['romance', 'legendary biography', 'travel marvels'], kw: ['alexander romance', 'alexander the great legend', 'pseudo-callisthenes', 'medieval romance source', 'marvels of the east'], confidence: 'varies',
    summary: 'A Greek prose romance of Alexander the Great\'s life that blends history, invention and wonder tales; translated into dozens of languages across Europe and Asia, it was a major source of medieval narrative.',
  },
  {
    id: 'work-anc-physiologus', kind: 'work', name: 'The Physiologus', author: 'Anonymous (early Christian compiler)', year: 'c. 200 CE', language: 'Ancient Greek', region: 'Alexandria, Egypt',
    genres: ['natural history', 'allegory', 'proto-bestiary'], kw: ['physiologus', 'bestiary source', 'medieval animal lore', 'allegorical animals', 'phoenix', 'unicorn'], confidence: 'varies',
    summary: 'A Greek text describing animals, plants and stones, each paired with a moral or religious reading; its many translations and revisions were the basis of the medieval bestiary.',
  },
  {
    id: 'work-anc-consolation-of-philosophy', kind: 'work', name: 'The Consolation of Philosophy', author: 'Boethius', year: 'c. 524 CE', language: 'Latin', region: 'Italy (Ostrogothic kingdom)',
    genres: ['prosimetrum', 'philosophical dialogue', 'consolation literature'], kw: ['boethius', 'consolation of philosophy', 'lady philosophy', 'wheel of fortune', 'prison writing', 'medieval classic'], confidence: 'established',
    summary: 'A Latin dialogue between an imprisoned statesman and Lady Philosophy that alternates prose with verse; one of the most widely read books of the Middle Ages, translated into English by Alfred and by Chaucer, among others.',
  },

  // ---- India and South Asia ----
  {
    id: 'work-anc-mahabharata', kind: 'work', name: 'The Mahabharata', author: 'Anonymous (traditionally ascribed to Vyasa)', year: 'c. 400 BCE', language: 'Sanskrit', region: 'India',
    genres: ['epic poem', 'heroic epic', 'frame narrative'], kw: ['mahabharata', 'kurukshetra', 'pandavas', 'kauravas', 'vyasa', 'sanskrit epic', 'tales within tales'], confidence: 'varies',
    summary: 'A Sanskrit epic of roughly a hundred thousand couplets on a succession struggle within one royal family, taking shape over centuries and holding the Bhagavad Gita and many tales within tales; among the longest poems in the world.',
  },
  {
    id: 'work-anc-ramayana', kind: 'work', name: 'The Ramayana', author: 'Valmiki (traditional attribution)', year: 'c. 400 BCE', language: 'Sanskrit', region: 'India',
    genres: ['epic poem', 'heroic epic', 'romance'], kw: ['ramayana', 'valmiki', 'rama', 'sita', 'adi kavya', 'sanskrit epic', 'retellings'], confidence: 'varies',
    summary: 'A Sanskrit epic in seven books on the exile of Rama, the abduction of Sita and the war to recover her; traditionally called the first poem, it has been retold across South and Southeast Asia in many languages.',
  },
  {
    id: 'work-anc-panchatantra', kind: 'work', name: 'The Panchatantra', author: 'Vishnu Sharma (traditional attribution)', year: 'c. 300 CE', language: 'Sanskrit', region: 'India',
    genres: ['fable collection', 'frame narrative', 'animal tales', 'statecraft literature'], kw: ['panchatantra', 'vishnu sharma', 'animal fables', 'five books', 'indian fables', 'frame story'], confidence: 'contested',
    summary: 'A Sanskrit collection of animal fables nested in a frame, written to teach princes practical wisdom; the original is lost and its date is debated, but its translations carried the fable-in-a-frame form across Asia and Europe.',
  },
  {
    id: 'work-anc-jataka-tales', kind: 'work', name: 'The Jataka Tales', author: 'Anonymous (Buddhist tradition)', year: 'c. 200 BCE', language: 'Pali', region: 'India',
    genres: ['fable collection', 'birth stories', 'moral tale'], kw: ['jataka', 'birth stories', 'buddhist tales', 'previous lives', 'pali canon', 'animal stories'], confidence: 'varies',
    summary: 'About five hundred and fifty Pali stories of the Buddha\'s previous lives as animals and humans, each with verses and a moral, gathered over centuries; a rich store of Indian folktale and fable.',
  },
  {
    id: 'work-anc-kathasaritsagara', kind: 'work', name: 'Kathasaritsagara (Ocean of the Streams of Story)', author: 'Somadeva', year: 'c. 1070 CE', language: 'Sanskrit', region: 'Kashmir',
    genres: ['story collection', 'frame narrative', 'folktale'], kw: ['kathasaritsagara', 'somadeva', 'ocean of story', 'indian folktales', 'vetala tales', 'nested stories'], confidence: 'established',
    summary: 'A Sanskrit verse collection of hundreds of tales within tales, drawn from an older lost work and compiled in Kashmir for a queen; a major source of Indian story and a model of the nested narrative.',
  },
  {
    id: 'work-anc-meghaduta', kind: 'work', name: 'Meghaduta (The Cloud Messenger)', author: 'Kalidasa', year: 'c. 400 CE', language: 'Sanskrit', region: 'India',
    genres: ['lyric poem', 'messenger poem', 'nature poetry'], kw: ['meghaduta', 'kalidasa', 'cloud messenger', 'sanskrit lyric', 'monsoon', 'khandakavya'], confidence: 'varies',
    summary: 'A Sanskrit lyric of just over a hundred verses in which an exiled spirit asks a passing monsoon cloud to carry a message to his beloved; a model of the messenger poem and of landscape as emotion.',
  },
  {
    id: 'work-anc-natya-shastra', kind: 'work', name: 'The Natya Shastra', author: 'Bharata (traditional attribution)', year: 'c. 100 CE', language: 'Sanskrit', region: 'India',
    genres: ['treatise', 'poetics', 'performance theory'], kw: ['natya shastra', 'bharata', 'rasa theory', 'indian aesthetics', 'sanskrit drama theory', 'nine rasas'], confidence: 'contested',
    summary: 'A Sanskrit treatise on drama, dance, music and aesthetics that sets out the theory of rasa, the emotional flavours a work of art evokes; a foundation of Indian poetics and performance with a disputed date.',
  },
  {
    id: 'work-anc-thirukkural', kind: 'work', name: 'The Thirukkural', author: 'Tiruvalluvar', year: 'c. 400 CE', language: 'Tamil', region: 'Southern India',
    genres: ['aphoristic verse', 'wisdom literature', 'ethics'], kw: ['thirukkural', 'tirukkural', 'tiruvalluvar', 'tamil couplets', 'kural', 'tamil classic'], confidence: 'contested',
    summary: 'A Tamil classic of 1,330 couplets in three parts on virtue, wealth and love; admired for its compression, it is widely quoted and translated, and scholars date it variously from the early centuries CE to about the sixth.',
  },
  {
    id: 'work-anc-silappatikaram', kind: 'work', name: 'The Silappatikaram', author: 'Ilango Adigal', year: 'c. 450 CE', language: 'Tamil', region: 'Southern India',
    genres: ['epic poem', 'verse and prose narrative', 'Tamil epic'], kw: ['silappatikaram', 'ilango adigal', 'kannagi', 'tamil epic', 'anklet', 'five great epics'], confidence: 'contested',
    summary: 'A Tamil epic of a merchant couple, the faithful wife Kannagi and the injustice that overtakes them, told in mixed verse and prose and named among the five great Tamil epics; its date is debated.',
  },
  {
    id: 'work-anc-sangam-anthologies', kind: 'work', name: 'The Sangam Anthologies (Ettuthokai)', author: 'Anonymous (many Tamil poets)', year: 'c. 100 CE', language: 'Tamil', region: 'Southern India',
    genres: ['anthology', 'lyric poetry', 'love and war poetry'], kw: ['sangam poetry', 'ettuthokai', 'akam and puram', 'tamil anthologies', 'tinai landscapes', 'classical tamil'], confidence: 'contested',
    summary: 'Classical Tamil poems from the early centuries of the common era, sorted into interior poems of love and exterior poems of war, kingship and ethics, with a code of landscapes; the earliest large body of Tamil literature.',
  },
  {
    id: 'work-anc-gita-govinda', kind: 'work', name: 'Gita Govinda', author: 'Jayadeva', year: 'c. 1180 CE', language: 'Sanskrit', region: 'Eastern India (Bengal or Odisha)',
    genres: ['lyric poem', 'devotional poetry', 'song cycle'], kw: ['gita govinda', 'jayadeva', 'radha and krishna', 'ashtapadi', 'sanskrit lyric', 'devotional songs'], confidence: 'established',
    summary: 'A twelfth-century Sanskrit lyric poem in twelve sections of songs about Radha and Krishna; its songs, set to ragas, shaped later devotional poetry, music, dance and painting.',
  },
  {
    id: 'work-anc-ramcharitmanas', kind: 'work', name: 'Ramcharitmanas', author: 'Tulsidas', year: 'c. 1575 CE', language: 'Awadhi', region: 'Northern India',
    genres: ['epic poem', 'devotional poetry', 'vernacular retelling'], kw: ['ramcharitmanas', 'tulsidas', 'tulsi ramayana', 'awadhi', 'ram katha', 'hindi epic'], confidence: 'established',
    summary: 'An Awadhi retelling in verse of the Rama story by a devotional poet, widely known across northern India through recitation and performance; it brought the epic to a broad audience in a spoken language.',
  },
  {
    id: 'work-anc-rajatarangini', kind: 'work', name: 'Rajatarangini (River of Kings)', author: 'Kalhana', year: 'c. 1148 CE', language: 'Sanskrit', region: 'Kashmir',
    genres: ['verse chronicle', 'history', 'epic chronicle'], kw: ['rajatarangini', 'kalhana', 'kashmir chronicle', 'indian historiography', 'sanskrit history'], confidence: 'established',
    summary: 'A Sanskrit verse chronicle of the kings of Kashmir, often cited as the earliest Indian work to approach history-writing systematically, while mixing legend, politics and moral reflection.',
  },
  {
    id: 'work-anc-mahavamsa', kind: 'work', name: 'The Mahavamsa (Great Chronicle)', author: 'Mahanama (traditional attribution)', year: 'c. 500 CE', language: 'Pali', region: 'Sri Lanka',
    genres: ['verse chronicle', 'history', 'national narrative'], kw: ['mahavamsa', 'mahanama', 'sri lanka chronicle', 'pali chronicle', 'dipavamsa', 'buddhist chronicle'], confidence: 'varies',
    summary: 'A Pali verse chronicle of the kings of Sri Lanka and the arrival of Buddhism on the island; a major source for early Sri Lankan history and a model of the chronicle as national story.',
  },
  // ---- Persian, Arabic, Turkic, Caucasian and African traditions ----
  {
    id: 'work-anc-shahnameh', kind: 'work', name: 'The Shahnameh (Book of Kings)', author: 'Ferdowsi', year: 'c. 1010 CE', language: 'Persian', region: 'Iran',
    genres: ['epic poem', 'national epic', 'heroic epic'], kw: ['shahnameh', 'shahnama', 'ferdowsi', 'firdausi', 'rostam', 'persian epic', 'book of kings'], confidence: 'established',
    summary: 'A Persian epic of roughly fifty thousand couplets that recounts the mythical and historical past of Iran from the first king to the Arab conquest; completed around 1010, it helped preserve and shape the Persian literary language.',
  },
  {
    id: 'work-anc-masnavi', kind: 'work', name: "The Masnavi (Masnavi-ye Ma'navi)", author: 'Jalal al-Din Rumi', year: 'c. 1260 CE', language: 'Persian', region: 'Anatolia (Konya)',
    genres: ['mystical poem', 'narrative verse', 'didactic poetry'], kw: ['masnavi', 'mathnawi', 'rumi', 'sufi poetry', 'persian couplets', 'six books', 'sufi tales'], confidence: 'established',
    summary: 'A long Persian poem in rhyming couplets, in six books, that weaves anecdotes, fables and teaching into a loose chain of digressions on the soul\'s longing; one of the best-loved works of Persian Sufi literature.',
  },
  {
    id: 'work-anc-divan-e-shams', kind: 'work', name: 'Divan-e Shams-e Tabrizi', author: 'Jalal al-Din Rumi', year: 'c. 1260 CE', language: 'Persian', region: 'Anatolia (Konya)',
    genres: ['lyric poetry', 'ghazal', 'mystical poetry'], kw: ['divan-e shams', 'rumi ghazals', 'shams of tabriz', 'sufi lyrics', 'persian lyric', 'divan of shams'], confidence: 'varies',
    summary: 'A large collection of Persian lyrics, mostly ghazals, by Rumi and named for his friend and teacher Shams of Tabriz; known for ecstatic imagery and musical rhythm, with the exact dating of individual poems uncertain.',
  },
  {
    id: 'work-anc-divan-of-hafez', kind: 'work', name: 'The Divan of Hafez', author: 'Hafez', year: 'c. 1380 CE', language: 'Persian', region: 'Iran (Shiraz)',
    genres: ['lyric poetry', 'ghazal', 'mystical poetry'], kw: ['hafez', 'hafiz', 'divan', 'ghazal', 'shiraz poet', 'persian lyric', 'sufi love poetry'], confidence: 'established',
    summary: 'A collection of Persian ghazals from fourteenth-century Shiraz, assembled after the poet\'s death and famous for its play between earthly and mystical love; its lines are still quoted in everyday Persian speech.',
  },
  {
    id: 'work-anc-gulistan', kind: 'work', name: 'The Gulistan (Rose Garden)', author: 'Saadi', year: 'c. 1258 CE', language: 'Persian', region: 'Iran (Shiraz)',
    genres: ['prosimetrum', 'moral tales', 'aphorisms'], kw: ['gulistan', 'golestan', 'saadi', 'sa\'di', 'rose garden', 'persian prose and verse', 'moral anecdotes'], confidence: 'established',
    summary: 'A Persian book of moral stories, aphorisms and verse in eight chapters, written in ornate rhymed prose that alternates with poetry; long used to teach style, manners and good conduct.',
  },
  {
    id: 'work-anc-bustan', kind: 'work', name: 'The Bustan (Orchard)', author: 'Saadi', year: 'c. 1257 CE', language: 'Persian', region: 'Iran (Shiraz)',
    genres: ['didactic poem', 'moral tales', 'narrative verse'], kw: ['bustan', 'boostan', 'saadi', 'persian didactic poem', 'orchard', 'moral anecdotes in verse'], confidence: 'established',
    summary: 'A Persian poem in ten chapters of anecdotes on justice, kindness, humility and contentment; the verse companion to the Gulistan and a model of the short moral tale in rhyming couplets.',
  },
  {
    id: 'work-anc-khamsa-of-nizami', kind: 'work', name: 'The Khamsa (Quintet)', author: 'Nizami Ganjavi', year: 'c. 1190 CE', language: 'Persian', region: 'Ganja (present-day Azerbaijan)',
    genres: ['romance', 'narrative poem', 'romantic epic'], kw: ['khamsa', 'nizami', 'layla and majnun', 'khosrow and shirin', 'persian romance', 'five poems'], confidence: 'established',
    summary: 'Five long Persian narrative poems in rhyming couplets, including the love story of Layla and Majnun and a tale of Khosrow and Shirin; they set the pattern of the Persian romance, and later Persian, Turkish and Indian poets answered them.',
  },
  {
    id: 'work-anc-conference-of-the-birds', kind: 'work', name: 'The Conference of the Birds (Mantiq al-tayr)', author: 'Farid al-Din Attar', year: 'c. 1180 CE', language: 'Persian', region: 'Iran (Nishapur)',
    genres: ['allegorical poem', 'frame narrative', 'mystical poetry'], kw: ['conference of the birds', 'mantiq al-tayr', 'attar', 'simurgh', 'seven valleys', 'sufi allegory'], confidence: 'established',
    summary: 'A Persian poem in which a gathering of birds sets out to find their king, a journey through seven valleys that allegorises the Sufi path and is told through many small stories.',
  },
  {
    id: 'work-anc-rubaiyat', kind: 'work', name: 'The Rubaiyat', author: 'Omar Khayyam (attribution disputed)', year: 'c. 1100 CE', language: 'Persian', region: 'Iran',
    genres: ['quatrains', 'philosophical poetry', 'lyric poetry'], kw: ['rubaiyat', 'omar khayyam', 'quatrains', 'fitzgerald translation', 'persian quatrain', 'rubai'], confidence: 'contested',
    summary: 'Persian quatrains attributed to a mathematician and astronomer, though scholars disagree about which are his; Edward FitzGerald\'s free English version of 1859 made the form famous in the English-speaking world.',
  },
  {
    id: 'work-anc-thousand-and-one-nights', kind: 'work', name: 'One Thousand and One Nights', author: 'Anonymous (many tellers, compilers and editors)', year: 'c. 900 CE', language: 'Arabic', region: 'Middle East and South Asia',
    genres: ['frame narrative', 'folktale collection', 'adventure tales'], kw: ['arabian nights', 'one thousand and one nights', 'scheherazade', 'shahrazad', 'sindbad', 'frame story', 'galland'], confidence: 'varies',
    summary: 'A frame narrative in which Shahrazad saves her life by telling a king stories night after night, assembled over centuries from Indian, Persian and Arabic sources; the tales of Aladdin and Ali Baba entered through Antoine Galland\'s French edition.',
  },
  {
    id: 'work-anc-kalila-wa-dimna', kind: 'work', name: 'Kalila wa Dimna', author: "Ibn al-Muqaffa'", year: 'c. 750 CE', language: 'Arabic', region: 'Iraq',
    genres: ['fable collection', 'frame narrative', 'mirror for princes'], kw: ['kalila wa dimna', 'kalilah and dimnah', 'ibn al-muqaffa', 'arabic fables', 'panchatantra translation', 'animal tales'], confidence: 'established',
    summary: 'An Arabic prose rendering of the animal fables of the Panchatantra by way of a Middle Persian version, praised as a model of elegant Arabic prose; it carried the fable-in-a-frame into Arabic, Hebrew and European literature.',
  },
  {
    id: 'work-anc-muallaqat', kind: 'work', name: "The Mu'allaqat (Suspended Odes)", author: 'Pre-Islamic Arab poets', year: 'c. 550 CE', language: 'Arabic', region: 'Arabian Peninsula',
    genres: ['qasida', 'ode', 'oral poetry anthology'], kw: ['muallaqat', 'hanging odes', 'qasida', 'pre-islamic poetry', 'imru al-qays', 'arabic odes'], confidence: 'varies',
    summary: 'Seven long odes by poets of pre-Islamic Arabia (ten in some counts), composed around the sixth century and kept orally before being written down; the qasida form they show shaped Arabic poetry for centuries.',
  },
  {
    id: 'work-anc-maqamat-of-al-hamadhani', kind: 'work', name: 'The Maqamat of al-Hamadhani', author: 'Badi al-Zaman al-Hamadhani', year: 'c. 990 CE', language: 'Arabic', region: 'Iran and Khorasan',
    genres: ['maqama', 'rhymed prose', 'picaresque'], kw: ['maqamat', 'al-hamadhani', 'maqama', 'arabic rhymed prose', 'trickster tales', 'badi al-zaman'], confidence: 'established',
    summary: 'Short episodes in rhymed prose about a wandering trickster and the narrator who meets him; the first maqamat, they created a genre that blended wit, eloquence and the picaresque in Arabic.',
  },
  {
    id: 'work-anc-maqamat-of-al-hariri', kind: 'work', name: 'The Maqamat of al-Hariri', author: 'al-Hariri of Basra', year: 'c. 1100 CE', language: 'Arabic', region: 'Iraq',
    genres: ['maqama', 'rhymed prose', 'picaresque'], kw: ['maqamat', 'al-hariri', 'abu zayd', 'arabic wordplay', 'rhymed prose', 'basra'], confidence: 'established',
    summary: 'Fifty rhymed-prose episodes in which a trickster-narrator and a witness meet across the Islamic world; admired as a showpiece of Arabic eloquence and wordplay and a lasting model of the maqama.',
  },
  {
    id: 'work-anc-hayy-ibn-yaqzan', kind: 'work', name: 'Hayy ibn Yaqzan', author: 'Ibn Tufayl', year: 'c. 1170 CE', language: 'Arabic', region: 'Al-Andalus (Muslim Spain)',
    genres: ['philosophical tale', 'allegory', 'island narrative'], kw: ['hayy ibn yaqzan', 'ibn tufayl', 'philosophus autodidactus', 'island story', 'self-taught philosopher', 'arabic philosophical novel'], confidence: 'established',
    summary: 'An Arabic philosophical tale of a boy raised alone on an island who reaches knowledge of nature and the divine through reason; often noted as an early example of the solitary-islander story.',
  },
  {
    id: 'work-anc-risalat-al-ghufran', kind: 'work', name: 'Risalat al-Ghufran (Epistle of Forgiveness)', author: "Abu al-'Ala al-Ma'arri", year: 'c. 1033 CE', language: 'Arabic', region: 'Syria',
    genres: ['imaginative prose', 'satire', 'literary criticism', 'afterlife vision'], kw: ['risalat al-ghufran', 'al-maarri', 'epistle of forgiveness', 'journey to paradise', 'arabic satire', 'afterlife vision'], confidence: 'established',
    summary: 'An Arabic prose work in which a literary man, on an imagined visit to Paradise and Hell, converses with poets and scholars of the past; a witty meeting of criticism and fantasy sometimes compared with later visions of the afterlife.',
  },
  {
    id: 'work-anc-ring-of-the-dove', kind: 'work', name: 'The Ring of the Dove (Tawq al-hamama)', author: 'Ibn Hazm', year: 'c. 1022 CE', language: 'Arabic', region: 'Al-Andalus (Muslim Spain)',
    genres: ['treatise', 'prose and verse', 'reflective writing'], kw: ['ring of the dove', 'tawq al-hamama', 'ibn hazm', 'treatise on love', 'andalusi prose', 'courtly love arabic'], confidence: 'varies',
    summary: 'An Arabic treatise on love from Muslim Spain that mixes personal anecdote, verse and observation about how love begins, grows and ends; a notable early example of reflective writing on feeling.',
  },
  {
    id: 'work-anc-kutadgu-bilig', kind: 'work', name: 'Kutadgu Bilig', author: 'Yusuf Khass Hajib', year: 1069, language: 'Karakhanid Turkic', region: 'Central Asia (Balasagun and Kashgar)',
    genres: ['didactic poem', 'mirror for princes', 'allegorical dialogue'], kw: ['kutadgu bilig', 'yusuf khass hajib', 'karakhanid', 'turkic literature', 'wisdom of royal glory', 'mirror for princes'], confidence: 'established',
    summary: 'An early Turkic verse work on kingship, justice and the good life, presented as dialogues among four allegorical figures; the oldest major book in a Turkic language of the Islamic period.',
  },
  {
    id: 'work-anc-book-of-dede-korkut', kind: 'work', name: 'The Book of Dede Korkut', author: 'Anonymous (Oghuz Turkic storytellers)', year: 'c. 1500 CE', language: 'Oghuz Turkic', region: 'Anatolia and the Caucasus',
    genres: ['heroic tales', 'oral epic tradition', 'prose and verse'], kw: ['dede korkut', 'oghuz', 'turkic epic', 'bard tales', 'anatolian epic', 'heroic tales'], confidence: 'varies',
    summary: 'A set of twelve Oghuz Turkic heroic tales introduced by the wise storyteller and bard Dede Korkut, known from sixteenth-century manuscripts and drawing on older oral tradition.',
  },
  {
    id: 'work-anc-secret-history-of-the-mongols', kind: 'work', name: 'The Secret History of the Mongols', author: 'Anonymous', year: 'c. 1240 CE', language: 'Middle Mongol', region: 'Mongolia',
    genres: ['chronicle', 'epic prose', 'court history'], kw: ['secret history of the mongols', 'genghis khan', 'chinggis', 'mongol chronicle', 'steppe literature', 'mongolian prose'], confidence: 'varies',
    summary: 'An anonymous thirteenth-century Mongol chronicle on the ancestry and rise of Genghis Khan and the reign of his son Ögedei; the oldest surviving Mongolian prose work, mixing narrative, speech and verse.',
  },
  {
    id: 'work-anc-knight-in-the-panthers-skin', kind: 'work', name: "The Knight in the Panther's Skin", author: 'Shota Rustaveli', year: 'c. 1200 CE', language: 'Georgian', region: 'Georgia',
    genres: ['romantic epic', 'narrative poem', 'chivalric poem'], kw: ['rustaveli', 'knight in the panther\'s skin', 'vepkhistqaosani', 'georgian epic', 'queen tamar', 'georgian poem'], confidence: 'established',
    summary: 'A Georgian narrative poem in rhyming quatrains on friendship, chivalry and loyal love, written in the age of Queen Tamar; regarded as the national poem of Georgia and a pillar of its literary language.',
  },
  {
    id: 'work-anc-kebra-nagast', kind: 'work', name: 'Kebra Nagast (The Glory of the Kings)', author: 'Anonymous (Ethiopian Christian scribes)', year: 'c. 1320 CE', language: "Ge'ez", region: 'Ethiopia',
    genres: ['national legend', 'compilation', 'religious narrative'], kw: ['kebra nagast', 'queen of sheba', 'makeda', 'solomon and sheba', 'ethiopian legend', 'geez literature'], confidence: 'varies',
    summary: 'A Ge\'ez compilation on the origins of Ethiopian kingship, centred on the meeting of the Queen of Sheba and King Solomon and the son born of it; a founding origin legend and a classic of Ethiopian literature.',
  },
  {
    id: 'work-anc-tarikh-al-sudan', kind: 'work', name: "Tarikh al-Sudan (Chronicle of the Sudan)", author: "Abd al-Rahman al-Sa'di", year: 'c. 1655 CE', language: 'Arabic', region: 'Timbuktu (West Africa)',
    genres: ['chronicle', 'history', 'Timbuktu manuscripts'], kw: ['tarikh al-sudan', 'al-sadi', 'timbuktu chronicle', 'songhai empire', 'west african history', 'sahelian arabic literature'], confidence: 'established',
    summary: 'An Arabic chronicle of the Songhai empire and the Niger bend by a Timbuktu scholar; a principal source for the history of the region and a record of West African Arabic-language scholarship.',
  },
  {
    id: 'work-anc-sundiata-an-epic-of-old-mali', kind: 'work', name: 'Sundiata: An Epic of Old Mali (Soundjata ou l\'épopée mandingue)', author: "D. T. Niane (from the oral account of the griot Djeli Mamadou Kouyaté)", year: 1960, language: 'French', region: 'Mali and Guinea',
    genres: ['epic', 'oral epic', 'griot tradition', 'heroic biography'], kw: ['sundiata', 'sunjata', 'mande epic', 'griot', 'old mali', 'niane', 'oral epic of west africa'], confidence: 'established',
    summary: 'A written version, in French, of the Mande oral epic of Sundiata Keita, founder of the Mali Empire, as told by a hereditary griot; the best-known text of a living West African epic tradition performed with many variants.',
  },
  // ---- China ----
  {
    id: 'work-anc-classic-of-poetry', kind: 'work', name: 'The Classic of Poetry (Shijing)', author: 'Anonymous (many court and folk poets)', year: 'c. 600 BCE', language: 'Classical Chinese', region: 'China',
    genres: ['poetry anthology', 'folk song', 'ritual hymn'], kw: ['shijing', 'book of songs', 'classic of poetry', 'chinese odes', 'earliest chinese poetry', 'confucian classics'], confidence: 'varies',
    summary: 'The earliest Chinese anthology of verse, 305 songs of courtship, farming, feasting, ritual and complaint, said by tradition to have been chosen by Confucius; its images and forms underlie later Chinese poetry.',
  },
  {
    id: 'work-anc-songs-of-chu', kind: 'work', name: 'The Songs of Chu (Chu Ci)', author: 'Qu Yuan and later poets', year: 'c. 300 BCE', language: 'Classical Chinese', region: 'Southern China',
    genres: ['poetry anthology', 'shamanic verse', 'lament'], kw: ['chu ci', 'songs of chu', 'qu yuan', 'li sao', 'songs of the south', 'chinese lament'], confidence: 'varies',
    summary: 'An anthology of southern Chinese verse in long, lyrical lines, led by poems attributed to the statesman Qu Yuan; rich in shamanic and mythic imagery and the counterpart to the northern Classic of Poetry.',
  },
  {
    id: 'work-anc-classic-of-mountains-and-seas', kind: 'work', name: 'The Classic of Mountains and Seas (Shanhaijing)', author: 'Anonymous (compiled over centuries)', year: 'c. 300 BCE', language: 'Classical Chinese', region: 'China',
    genres: ['mythography', 'bestiary', 'geographical lore'], kw: ['shanhaijing', 'shan hai jing', 'mountains and seas', 'chinese mythical creatures', 'nine-tailed fox', 'chinese bestiary'], confidence: 'varies',
    summary: 'A Chinese compilation describing mountains, rivers, distant peoples and strange creatures such as the nine-tailed fox; a primary source for Chinese myth and a bestiary built up by several hands over centuries.',
  },
  {
    id: 'work-anc-art-of-war', kind: 'work', name: 'The Art of War', author: 'Sun Tzu (traditional attribution)', year: 'c. 400 BCE', language: 'Classical Chinese', region: 'China',
    genres: ['treatise', 'strategy', 'aphoristic prose'], kw: ['art of war', 'sun tzu', 'sunzi', 'chinese strategy', 'military treatise', 'sun zi bingfa'], confidence: 'contested',
    summary: 'A compact Chinese treatise on strategy in thirteen short chapters of aphorism, whose authorship and date are debated; it has been read well beyond the military for its ideas on conflict, deception and preparation.',
  },
  {
    id: 'work-anc-in-search-of-the-supernatural', kind: 'work', name: 'In Search of the Supernatural (Soushen ji)', author: 'Gan Bao', year: 'c. 350 CE', language: 'Classical Chinese', region: 'China',
    genres: ['zhiguai', 'supernatural tales', 'anecdote collection'], kw: ['soushen ji', 'gan bao', 'zhiguai', 'chinese ghost stories', 'records of the strange', 'supernatural tales'], confidence: 'established',
    summary: 'A fourth-century Chinese collection of short accounts of ghosts, spirits and marvels, assembled by an official-historian; a founding work of the zhiguai, the records of the strange that fed later Chinese fiction.',
  },
  {
    id: 'work-anc-literary-mind-and-carving-of-dragons', kind: 'work', name: 'The Literary Mind and the Carving of Dragons (Wenxin Diaolong)', author: 'Liu Xie', year: 'c. 500 CE', language: 'Classical Chinese', region: 'China',
    genres: ['literary criticism', 'poetics', 'parallel prose'], kw: ['wenxin diaolong', 'liu xie', 'chinese literary theory', 'literary criticism', 'chinese poetics', 'genre theory'], confidence: 'established',
    summary: 'A systematic Chinese study of literature written in parallel prose, covering genres, imagination, style and criticism; one of the earliest major works of literary theory in China.',
  },
  {
    id: 'work-anc-three-hundred-tang-poems', kind: 'work', name: 'Three Hundred Tang Poems (Tangshi sanbai shou)', author: 'Sun Zhu (compiler)', year: 'c. 1763 CE', language: 'Chinese', region: 'China',
    genres: ['poetry anthology', 'classical Chinese poetry', 'teaching anthology'], kw: ['three hundred tang poems', 'tang poetry', 'li bai', 'du fu', 'wang wei', 'chinese anthology', 'tangshi sanbai shou'], confidence: 'varies',
    summary: 'An anthology of about three hundred poems of the Tang dynasty chosen for teaching and compiled in the eighteenth century; for generations it was the standard first introduction to classical Chinese verse.',
  },
  {
    id: 'work-anc-romance-of-the-three-kingdoms', kind: 'work', name: 'Romance of the Three Kingdoms', author: 'Luo Guanzhong (traditional attribution)', year: 'c. 1350 CE', language: 'Chinese', region: 'China',
    genres: ['historical novel', 'epic novel', 'war narrative'], kw: ['romance of the three kingdoms', 'sanguo yanyi', 'luo guanzhong', 'liu bei', 'cao cao', 'four great classical novels'], confidence: 'varies',
    summary: 'A long Chinese historical novel of the wars after the fall of the Han dynasty, composed in the fourteenth century from chronicle and legend; one of the Four Great Classical Novels, with a famous cast of rulers and strategists.',
  },
  {
    id: 'work-anc-water-margin', kind: 'work', name: 'Water Margin (Outlaws of the Marsh)', author: "Shi Nai'an (traditional attribution)", year: 'c. 1400 CE', language: 'Chinese', region: 'China',
    genres: ['episodic novel', 'outlaw tale', 'martial-hero tradition'], kw: ['water margin', 'outlaws of the marsh', 'shuihu zhuan', 'one hundred and eight outlaws', 'four great classical novels', 'song jiang'], confidence: 'varies',
    summary: 'A Chinese novel about a band of 108 outlaws who gather at a marsh stronghold in the Song dynasty, built from storytellers\' cycles; one of the Four Great Classical Novels and a source of the martial-hero tradition.',
  },
  {
    id: 'work-anc-dream-of-the-red-chamber', kind: 'work', name: 'Dream of the Red Chamber (The Story of the Stone)', author: 'Cao Xueqin', year: 1791, language: 'Chinese', region: 'China',
    genres: ['family saga', 'novel of manners', 'romance'], kw: ['dream of the red chamber', 'story of the stone', 'honglou meng', 'cao xueqin', 'four great classical novels', 'jia family'], confidence: 'established',
    summary: 'A vast Chinese novel of the decline of a great household, centred on a doomed romance among its young people; circulated in manuscript from the 1750s and first printed in 1791, with its last forty chapters traditionally credited to Gao E.',
  },
  {
    id: 'work-anc-strange-tales-from-a-chinese-studio', kind: 'work', name: 'Strange Tales from a Chinese Studio (Liaozhai zhiyi)', author: 'Pu Songling', year: 1766, language: 'Classical Chinese', region: 'China',
    genres: ['supernatural tales', 'short story collection', 'zhiguai tradition'], kw: ['liaozhai zhiyi', 'strange tales from a chinese studio', 'pu songling', 'fox spirits', 'chinese ghost tales', 'classical chinese short stories'], confidence: 'established',
    summary: 'A collection of nearly five hundred short tales of fox spirits, ghosts, scholars and officials, written over decades in refined classical Chinese by a scholar and first printed in 1766, after his death.',
  },

  // ---- Japan ----
  {
    id: 'work-anc-kojiki', kind: 'work', name: 'The Kojiki (Record of Ancient Matters)', author: 'Ō no Yasumaro (compiler)', year: 712, language: 'Old Japanese and Classical Chinese', region: 'Japan',
    genres: ['myth chronicle', 'genealogy', 'songs and prose'], kw: ['kojiki', 'record of ancient matters', 'japanese mythology', 'amaterasu', 'o no yasumaro', 'oldest japanese book'], confidence: 'established',
    summary: 'A Japanese chronicle of myths, genealogies and legends from the age of the gods to the early imperial line, set down in 712 with many songs; the oldest surviving book from Japan and a main source of Japanese myth.',
  },
  {
    id: 'work-anc-nihon-shoki', kind: 'work', name: 'The Nihon Shoki (Chronicles of Japan)', author: 'Prince Toneri and court compilers', year: 720, language: 'Classical Chinese', region: 'Japan',
    genres: ['official history', 'chronicle', 'myth chronicle'], kw: ['nihon shoki', 'nihongi', 'chronicles of japan', 'japanese history', 'early japanese myth', 'six national histories'], confidence: 'established',
    summary: 'A Japanese official history in Classical Chinese, finished in 720, that retells the mythic age and the reigns of the early rulers; together with the Kojiki it is the main source of early Japanese myth.',
  },
  {
    id: 'work-anc-manyoshu', kind: 'work', name: "The Man'yōshū (Collection of Ten Thousand Leaves)", author: 'Anonymous (many poets; Ōtomo no Yakamochi is linked to its compilation)', year: 'c. 760 CE', language: 'Old Japanese', region: 'Japan',
    genres: ['poetry anthology', 'waka', 'long poem (chōka)'], kw: ['manyoshu', 'man\'yoshu', 'ten thousand leaves', 'earliest japanese poetry', 'chōka', 'tanka origins', 'okura', 'hitomaro'], confidence: 'varies',
    summary: 'The oldest anthology of Japanese poetry, about four thousand five hundred poems by emperors, soldiers, farmers and courtiers in long and short forms; it preserves the voice of early Japan and the roots of the waka.',
  },
  {
    id: 'work-anc-kokin-wakashu', kind: 'work', name: 'The Kokin Wakashū (Collection of Ancient and Modern Poems)', author: 'Ki no Tsurayuki and other court poets (compilers)', year: 'c. 905 CE', language: 'Japanese', region: 'Japan',
    genres: ['poetry anthology', 'waka', 'imperial anthology'], kw: ['kokinshu', 'kokin wakashu', 'ki no tsurayuki', 'waka anthology', 'imperial anthology', 'heian poetry', 'kana preface'], confidence: 'established',
    summary: 'The first imperially commissioned anthology of Japanese waka, with a famous preface in Japanese on the nature of poetry; it fixed the seasonal and love categories and the aesthetic of later court verse.',
  },
  {
    id: 'work-anc-tale-of-the-bamboo-cutter', kind: 'work', name: 'The Tale of the Bamboo Cutter (Taketori Monogatari)', author: 'Anonymous', year: 'c. 900 CE', language: 'Japanese', region: 'Japan',
    genres: ['monogatari', 'fairy tale', 'prose narrative'], kw: ['taketori monogatari', 'tale of the bamboo cutter', 'kaguya-hime', 'princess kaguya', 'oldest japanese tale', 'heian monogatari'], confidence: 'varies',
    summary: 'A Japanese tale of a luminous child found in a glowing stalk of bamboo and the impossible tasks she sets her suitors; often called the oldest surviving Japanese prose narrative in the monogatari form.',
  },
  {
    id: 'work-anc-tales-of-ise', kind: 'work', name: 'Tales of Ise (Ise Monogatari)', author: 'Anonymous (episodes linked to the poet Ariwara no Narihira)', year: 'c. 950 CE', language: 'Japanese', region: 'Japan',
    genres: ['uta monogatari', 'poem-tale', 'episodic prose'], kw: ['ise monogatari', 'tales of ise', 'ariwara no narihira', 'uta monogatari', 'poem tales', 'heian prose'], confidence: 'varies',
    summary: 'A Japanese collection of short episodes, each built around a waka, about a courtier often identified with Ariwara no Narihira; an early poem-tale that shaped later court fiction.',
  },
  {
    id: 'work-anc-tosa-diary', kind: 'work', name: 'The Tosa Diary (Tosa Nikki)', author: 'Ki no Tsurayuki', year: 'c. 935 CE', language: 'Japanese', region: 'Japan',
    genres: ['diary', 'travel writing', 'poetic prose'], kw: ['tosa nikki', 'tosa diary', 'ki no tsurayuki', 'heian diary', 'travel diary', 'kana prose'], confidence: 'established',
    summary: 'A travel diary of a return journey from a provincial post, written in Japanese in the voice of a woman by a male court poet; it showed the vernacular as a literary medium and opened the way for women\'s diaries.',
  },
  {
    id: 'work-anc-gossamer-years', kind: 'work', name: 'The Gossamer Years (Kagerō Nikki)', author: "Michitsuna's Mother", year: 'c. 975 CE', language: 'Japanese', region: 'Japan',
    genres: ['diary', 'memoir', 'Heian court literature'], kw: ['kagero nikki', 'gossamer years', 'michitsuna\'s mother', 'heian diary', 'women\'s diary', 'court marriage'], confidence: 'established',
    summary: 'A Heian diary by a noblewoman about her marriage to a powerful courtier; among the earliest extended autobiographical writing by a woman, it explores jealousy and solitude with unusual candour.',
  },
  {
    id: 'work-anc-pillow-book', kind: 'work', name: 'The Pillow Book (Makura no Sōshi)', author: 'Sei Shōnagon', year: 'c. 1000 CE', language: 'Japanese', region: 'Japan',
    genres: ['zuihitsu', 'miscellany', 'court diary', 'list writing'], kw: ['pillow book', 'makura no soshi', 'sei shonagon', 'zuihitsu', 'lists', 'heian court', 'miscellany'], confidence: 'established',
    summary: 'A collection of lists, observations, anecdotes and opinions by a lady-in-waiting at the Heian court; its sharp, witty miscellany gave the zuihitsu form a model and made the list a literary device.',
  },
  {
    id: 'work-anc-tale-of-genji', kind: 'work', name: 'The Tale of Genji (Genji Monogatari)', author: 'Murasaki Shikibu', year: 'c. 1010 CE', language: 'Japanese', region: 'Japan',
    genres: ['court novel', 'monogatari', 'psychological fiction'], kw: ['tale of genji', 'genji monogatari', 'murasaki shikibu', 'heian court', 'first novel', 'hikaru genji'], confidence: 'established',
    summary: 'A Japanese court narrative of the life and loves of Prince Genji and of the generation after him, written by a lady-in-waiting; often called the world\'s first novel for its length, psychological depth and unity of design.',
  },
  {
    id: 'work-anc-murasaki-shikibu-diary', kind: 'work', name: 'The Diary of Lady Murasaki (Murasaki Shikibu Nikki)', author: 'Murasaki Shikibu', year: 'c. 1010 CE', language: 'Japanese', region: 'Japan',
    genres: ['diary', 'court record', 'literary memoir'], kw: ['murasaki shikibu diary', 'heian court diary', 'lady murasaki', 'court ceremony', 'women writers of heian', 'nikki'], confidence: 'established',
    summary: 'A diary by the author of the Genji recording court ceremonies, rivalries and personal reflection, including her remarks on other women writers of her day; a rare view of a major author on her own work and world.',
  },
  {
    id: 'work-anc-sarashina-diary', kind: 'work', name: 'As I Crossed a Bridge of Dreams (Sarashina Nikki)', author: 'Daughter of Sugawara no Takasue', year: 'c. 1060 CE', language: 'Japanese', region: 'Japan',
    genres: ['memoir', 'diary', 'travel writing'], kw: ['sarashina nikki', 'sarashina diary', 'bridge of dreams', 'heian memoir', 'love of tales', 'daughter of takasue'], confidence: 'established',
    summary: 'A memoir by a woman looking back from middle age on a life of travel, reading and religious longing; its quiet tone and its account of a girlhood passion for tales are much cited.',
  },
  {
    id: 'work-anc-konjaku-monogatarishu', kind: 'work', name: 'Tales of Times Now Past (Konjaku Monogatarishū)', author: 'Anonymous', year: 'c. 1120 CE', language: 'Japanese', region: 'Japan',
    genres: ['setsuwa', 'story collection', 'Buddhist tales'], kw: ['konjaku monogatari', 'tales of times now past', 'setsuwa', 'japanese tales', 'indian chinese japanese stories', 'akutagawa source'], confidence: 'varies',
    summary: 'A very large Japanese collection of roughly a thousand tales from India, China and Japan, arranged by region and subject and mixing Buddhist, courtly and popular stories; a rich source for later Japanese fiction.',
  },
  {
    id: 'work-anc-tale-of-the-heike', kind: 'work', name: 'The Tale of the Heike (Heike Monogatari)', author: 'Anonymous (performed by blind lute-players)', year: 'c. 1250 CE', language: 'Japanese', region: 'Japan',
    genres: ['war tale', 'gunki monogatari', 'oral performance'], kw: ['heike monogatari', 'tale of the heike', 'taira and minamoto', 'biwa hoshi', 'genpei war', 'impermanence'], confidence: 'varies',
    summary: 'A Japanese war tale of the rise and fall of the Taira clan in the twelfth century, performed by blind lute-players and written down in several versions; it opens with a celebrated reflection on impermanence.',
  },
  {
    id: 'work-anc-hyakunin-isshu', kind: 'work', name: 'Hyakunin Isshu (One Hundred Poets, One Poem Each)', author: 'Fujiwara no Teika (compiler)', year: 'c. 1235 CE', language: 'Japanese', region: 'Japan',
    genres: ['poetry anthology', 'waka', 'poetry card game'], kw: ['hyakunin isshu', 'one hundred poets', 'fujiwara no teika', 'karuta', 'waka anthology', 'ogura hyakunin'], confidence: 'varies',
    summary: 'An anthology of one hundred waka by one hundred poets from the seventh to the thirteenth century, traditionally selected by the poet and critic Teika; it became the basis of a popular card game and a classroom standard.',
  },

  // ---- Korea and Java ----
  {
    id: 'work-anc-samguk-sagi', kind: 'work', name: 'Samguk Sagi (History of the Three Kingdoms)', author: 'Kim Busik', year: 1145, language: 'Classical Chinese', region: 'Korea',
    genres: ['history', 'chronicle', 'annals'], kw: ['samguk sagi', 'history of the three kingdoms', 'kim busik', 'korean history', 'goryeo', 'silla baekje goguryeo'], confidence: 'established',
    summary: 'The oldest surviving Korean history, compiled by a statesman at royal command and arranged in annals of the Three Kingdoms; a main source for early Korean history and legend.',
  },
  {
    id: 'work-anc-samguk-yusa', kind: 'work', name: 'Samguk Yusa (Memorabilia of the Three Kingdoms)', author: 'Iryeon', year: 'c. 1280 CE', language: 'Classical Chinese', region: 'Korea',
    genres: ['legend collection', 'folklore', 'history'], kw: ['samguk yusa', 'iryeon', 'dangun myth', 'korean legends', 'buddhist miracle tales', 'hyangga'], confidence: 'established',
    summary: 'A Korean collection of legends, folklore, Buddhist miracle tales and history of the Three Kingdoms, compiled by a monk; it preserves the Dangun founding myth and several early native songs.',
  },
  {
    id: 'work-anc-nagarakretagama', kind: 'work', name: 'Nagarakretagama (Desawarnana)', author: 'Prapanca', year: 1365, language: 'Old Javanese', region: 'Java (Majapahit)',
    genres: ['court poem', 'kakawin', 'panegyric'], kw: ['nagarakretagama', 'desawarnana', 'prapanca', 'majapahit', 'kakawin', 'javanese court poetry'], confidence: 'established',
    summary: 'An Old Javanese court poem in praise of the Majapahit king Hayam Wuruk that describes his realm, journeys and rituals; a main source for Majapahit history and for Old Javanese court poetry.',
  },

  // ---- Medieval Britain, Ireland and Scandinavia ----
  {
    id: 'work-anc-beowulf', kind: 'work', name: 'Beowulf', author: 'Anonymous (the Beowulf poet)', year: 'c. 1000 CE', language: 'Old English', region: 'Anglo-Saxon England',
    genres: ['epic poem', 'heroic poetry', 'alliterative verse'], kw: ['beowulf', 'grendel', 'old english epic', 'anglo-saxon poetry', 'alliterative verse', 'geats'], confidence: 'varies',
    summary: 'An Old English heroic poem of about three thousand lines in which a Geatish hero faces monsters and a dragon; it survives in one manuscript of about the year 1000, and scholars date its composition anywhere from the eighth to the early eleventh century.',
  },
  {
    id: 'work-anc-exeter-book', kind: 'work', name: 'The Exeter Book', author: 'Anonymous (Old English poets; copied by an unnamed scribe)', year: 'c. 975 CE', language: 'Old English', region: 'Anglo-Saxon England',
    genres: ['poetry anthology', 'elegy', 'riddles'], kw: ['exeter book', 'the wanderer', 'the seafarer', 'old english riddles', 'anglo-saxon elegy', 'exeter cathedral'], confidence: 'varies',
    summary: 'A tenth-century manuscript anthology of Old English poetry, kept at Exeter Cathedral, that holds elegies such as The Wanderer and The Seafarer, religious verse and nearly a hundred riddles; a main source for the Old English lyric voice.',
  },
  {
    id: 'work-anc-anglo-saxon-chronicle', kind: 'work', name: 'The Anglo-Saxon Chronicle', author: 'Anonymous (monastic scribes in several centres)', year: 'c. 890 CE', language: 'Old English', region: 'Anglo-Saxon England',
    genres: ['chronicle', 'annals', 'history'], kw: ['anglo-saxon chronicle', 'old english annals', 'king alfred', 'wessex', 'peterborough chronicle', 'early english prose'], confidence: 'varies',
    summary: 'A year-by-year record of English history begun in the late ninth century, probably in Wessex under King Alfred, and kept up in several monastic copies, the last of which breaks off in 1154; a main source for early English history and prose.',
  },
  {
    id: 'work-anc-poetic-edda', kind: 'work', name: 'The Poetic Edda (Elder Edda)', author: 'Anonymous (Old Norse poets)', year: 'c. 1270 CE', language: 'Old Norse', region: 'Iceland',
    genres: ['mythological poetry', 'heroic poetry', 'wisdom poetry'], kw: ['poetic edda', 'elder edda', 'codex regius', 'voluspa', 'havamal', 'norse mythology'], confidence: 'varies',
    summary: 'A collection of Old Norse poems about gods and heroes, preserved mainly in the Icelandic Codex Regius of the later thirteenth century, though some poems may be much older; it includes Völuspá and Hávamál and is the chief verse source for Norse myth.',
  },
  {
    id: 'work-anc-prose-edda', kind: 'work', name: 'The Prose Edda (Younger Edda)', author: 'Snorri Sturluson', year: 'c. 1220 CE', language: 'Old Norse', region: 'Iceland',
    genres: ['handbook of poetics', 'mythography', 'skaldic poetry'], kw: ['prose edda', 'younger edda', 'snorri sturluson', 'skaldic verse', 'kennings', 'gylfaginning'], confidence: 'established',
    summary: 'An Icelandic handbook for poets by Snorri Sturluson that retells Norse myths and explains skaldic metres and the poetic circumlocutions called kennings; the fullest narrative source for Norse mythology and an early treatise on poetic craft.',
  },
  {
    id: 'work-anc-heimskringla', kind: 'work', name: 'Heimskringla', author: 'Snorri Sturluson (traditional attribution)', year: 'c. 1230 CE', language: 'Old Norse', region: 'Iceland',
    genres: ['kings\' saga', 'royal history', 'chronicle'], kw: ['heimskringla', 'kings\' sagas', 'norse kings', 'snorri sturluson', 'harald hardrada', 'olaf tryggvason'], confidence: 'varies',
    summary: 'A history of the kings of Norway from legendary times to the later twelfth century, traditionally attributed to Snorri Sturluson; it shows an Icelandic author turning history into vivid, character-driven saga prose.',
  },
  {
    id: 'work-anc-njals-saga', kind: 'work', name: "Njal's Saga (Brennu-Njáls saga)", author: 'Anonymous (Icelandic)', year: 'c. 1280 CE', language: 'Old Norse', region: 'Iceland',
    genres: ['Icelandic saga', 'family saga', 'legal narrative'], kw: ['njals saga', 'brennu-njals saga', 'njal', 'gunnar', 'icelandic sagas', 'feud and law'], confidence: 'varies',
    summary: 'One of the longest and most admired Icelandic family sagas, written in the late thirteenth century about feuds in tenth- and eleventh-century Iceland; notable for its attention to law, honour and the way small slights escalate.',
  },
  {
    id: 'work-anc-egils-saga', kind: 'work', name: "Egil's Saga (Egils saga Skallagrímssonar)", author: 'Anonymous (traditionally linked to Snorri Sturluson)', year: 'c. 1240 CE', language: 'Old Norse', region: 'Iceland',
    genres: ['Icelandic saga', 'family saga', 'skald biography'], kw: ['egils saga', 'egill skallagrimsson', 'skald', 'viking poet', 'icelandic sagas'], confidence: 'contested',
    summary: 'An Icelandic saga of the thirteenth century about the poet and warrior Egill Skallagrímsson, by an unnamed author sometimes linked to Snorri Sturluson; it joins family feud with the figure of the skald and includes verse attributed to Egill.',
  },
  {
    id: 'work-anc-volsunga-saga', kind: 'work', name: 'The Saga of the Volsungs (Völsunga saga)', author: 'Anonymous (Icelandic)', year: 'c. 1270 CE', language: 'Old Norse', region: 'Iceland',
    genres: ['legendary saga', 'heroic legend', 'Norse legend'], kw: ['volsunga saga', 'saga of the volsungs', 'sigurd', 'brynhild', 'fafnir', 'nibelung legend'], confidence: 'varies',
    summary: 'An Icelandic legendary saga of the later thirteenth century that tells of the Volsung family and the dragon-slayer Sigurd, drawing on older Eddic poems; it shares its roots with the German Nibelung tradition and has inspired many later retellings.',
  },
  {
    id: 'work-anc-laxdaela-saga', kind: 'work', name: 'Laxdæla Saga', author: 'Anonymous (Icelandic)', year: 'c. 1245 CE', language: 'Old Norse', region: 'Iceland',
    genres: ['Icelandic saga', 'family saga', 'romantic tragedy'], kw: ['laxdaela saga', 'gudrun osvifsdottir', 'kjartan', 'icelandic family saga', 'breidafjord'], confidence: 'varies',
    summary: 'An Icelandic family saga of the thirteenth century that follows several generations of a western Iceland district, with a tangled bond among Guðrún, Kjartan and Bolli at its centre; admired for its psychological depth and its portrait of Guðrún.',
  },
  {
    id: 'work-anc-vinland-sagas', kind: 'work', name: 'The Vinland Sagas', author: 'Anonymous (Icelandic)', year: 'c. 1250 CE', language: 'Old Norse', region: 'Iceland and Greenland',
    genres: ['Icelandic saga', 'exploration narrative'], kw: ['vinland sagas', 'saga of erik the red', 'saga of the greenlanders', 'leif eriksson', 'norse voyages', 'north america'], confidence: 'varies',
    summary: 'Two Icelandic sagas, the Saga of the Greenlanders and the Saga of Erik the Red, composed in the thirteenth century about Norse voyages from Greenland to lands in the west; the main written sources for Norse contact with North America.',
  },
  {
    id: 'work-anc-gesta-danorum', kind: 'work', name: 'Gesta Danorum (Deeds of the Danes)', author: 'Saxo Grammaticus', year: 'c. 1200 CE', language: 'Latin', region: 'Denmark',
    genres: ['chronicle', 'legendary history', 'Latin prose'], kw: ['gesta danorum', 'saxo grammaticus', 'history of the danes', 'amleth', 'hamlet source', 'danish legend'], confidence: 'established',
    summary: 'A Latin history of the Danes in sixteen books by the Danish cleric Saxo Grammaticus, written around the turn of the thirteenth century; it preserves many legends, including the tale of Amleth, that later writers reworked.',
  },
  {
    id: 'work-anc-tain-bo-cuailnge', kind: 'work', name: 'Táin Bó Cúailnge (The Cattle Raid of Cooley)', author: 'Anonymous (Irish tradition)', year: 'c. 800 CE', language: 'Old and Middle Irish', region: 'Ireland',
    genres: ['epic', 'heroic saga', 'cattle raid tale'], kw: ['tain bo cuailnge', 'cattle raid of cooley', 'cu chulainn', 'queen medb', 'ulster cycle', 'irish epic'], confidence: 'varies',
    summary: 'The central tale of the Irish Ulster Cycle, in which Queen Medb of Connacht invades Ulster for a prized bull while the young Cú Chulainn holds the border; prose with embedded verse, probably first set down in the eighth century and preserved in manuscripts from about 1100 onward.',
  },
  {
    id: 'work-anc-mabinogion', kind: 'work', name: 'The Mabinogion', author: 'Anonymous (Welsh storytellers)', year: 'c. 1200 CE', language: 'Middle Welsh', region: 'Wales',
    genres: ['medieval romance', 'myth', 'tale collection'], kw: ['mabinogion', 'four branches of the mabinogi', 'pwyll', 'branwen', 'culhwch and olwen', 'welsh mythology', 'lady charlotte guest'], confidence: 'varies',
    summary: 'A modern title for eleven medieval Welsh prose tales, found in manuscripts of the fourteenth century but drawing on older oral tradition; they include the Four Branches of the Mabinogi and Arthurian romances and are the classic source of Welsh myth.',
  },
  {
    id: 'work-anc-y-gododdin', kind: 'work', name: 'Y Gododdin', author: 'Aneirin (traditional attribution)', year: 'c. 600 CE', language: 'Old Welsh', region: 'Early medieval Britain',
    genres: ['elegy', 'heroic poetry'], kw: ['y gododdin', 'aneirin', 'catraeth', 'welsh elegy', 'hen ogledd', 'heroic elegy'], confidence: 'contested',
    summary: 'A sequence of Welsh elegiac poems attributed to the poet Aneirin that mourn the warriors of the Gododdin who fell in a battle at Catraeth; traditionally set around 600 CE, though the manuscript is of the thirteenth century and the date of the verse is debated.',
  },
  {
    id: 'work-anc-historia-regum-britanniae', kind: 'work', name: 'Historia Regum Britanniae (History of the Kings of Britain)', author: 'Geoffrey of Monmouth', year: 'c. 1136 CE', language: 'Latin', region: 'Britain',
    genres: ['legendary history', 'chronicle', 'pseudo-history'], kw: ['geoffrey of monmouth', 'history of the kings of britain', 'king arthur', 'merlin', 'king lear source', 'brutus of troy'], confidence: 'established',
    summary: 'A Latin history of the kings of Britain from the legendary Brutus onward, by Geoffrey of Monmouth; its stories of Arthur, Merlin and King Leir shaped later Arthurian and British legend, though it is not reliable history.',
  },
  {
    id: 'work-anc-le-morte-darthur', kind: 'work', name: "Le Morte d'Arthur", author: 'Sir Thomas Malory', year: 1485, language: 'Middle English', region: 'England',
    genres: ['Arthurian romance', 'prose romance', 'compilation'], kw: ['morte darthur', 'malory', 'king arthur', 'lancelot and guinevere', 'round table', 'caxton', 'winchester manuscript'], confidence: 'established',
    summary: 'A prose compilation of Arthurian tales in English, written in the later fifteenth century and printed by William Caxton in 1485; it gathers and retells French and English romances into the form in which most English readers meet Arthur\'s court.',
  },

  // ---- Medieval and early modern continental Europe ----
  {
    id: 'work-anc-lancelot-knight-of-the-cart', kind: 'work', name: 'Lancelot, the Knight of the Cart', author: 'Chrétien de Troyes', year: 'c. 1180 CE', language: 'Old French', region: 'France',
    genres: ['Arthurian romance', 'courtly love', 'verse romance'], kw: ['lancelot', 'chretien de troyes', 'knight of the cart', 'guinevere', 'courtly love', 'le chevalier de la charrette'], confidence: 'varies',
    summary: 'An Old French verse romance by Chrétien de Troyes that introduces Lancelot\'s love for Queen Guinevere and his mission to rescue her, a founding text of courtly love in narrative; its closing section is attributed to a continuator.',
  },
  {
    id: 'work-anc-perceval-story-of-the-grail', kind: 'work', name: 'Perceval, the Story of the Grail (Le Conte du Graal)', author: 'Chrétien de Troyes', year: 'c. 1185 CE', language: 'Old French', region: 'France',
    genres: ['Arthurian romance', 'grail romance', 'unfinished work'], kw: ['perceval', 'conte du graal', 'chretien de troyes', 'holy grail', 'grail legend', 'fisher king', 'unfinished romance'], confidence: 'varies',
    summary: 'The unfinished verse romance by Chrétien de Troyes about a young knight who meets a mysterious grail procession; usually regarded as the earliest surviving grail story, it prompted a long line of continuations and rewritings.',
  },
  {
    id: 'work-anc-yvain-knight-of-the-lion', kind: 'work', name: 'Yvain, the Knight of the Lion', author: 'Chrétien de Troyes', year: 'c. 1180 CE', language: 'Old French', region: 'France',
    genres: ['Arthurian romance', 'verse romance', 'quest narrative'], kw: ['yvain', 'chevalier au lion', 'chretien de troyes', 'knight of the lion', 'laudine', 'chivalric romance'], confidence: 'varies',
    summary: 'A verse romance by Chrétien de Troyes about a knight who wins a lady, loses her through a broken promise and must earn his way back through adventures; notable for balancing love against the demands of chivalric reputation.',
  },
  {
    id: 'work-anc-song-of-roland', kind: 'work', name: 'The Song of Roland (La Chanson de Roland)', author: 'Anonymous (the closing lines name a Turold)', year: 'c. 1100 CE', language: 'Old French', region: 'France',
    genres: ['chanson de geste', 'epic poem', 'heroic poetry'], kw: ['chanson de roland', 'song of roland', 'roland', 'charlemagne', 'roncesvalles', 'oliphant', 'chanson de geste'], confidence: 'varies',
    summary: 'One of the oldest and best-known French chansons de geste, an epic in assonanced laisses about the rearguard of Charlemagne\'s army ambushed in the Pyrenees; the poem is traditionally dated about 1100, and its best-known text is a twelfth-century manuscript now at Oxford.',
  },
  {
    id: 'work-anc-aucassin-and-nicolette', kind: 'work', name: 'Aucassin and Nicolette', author: 'Anonymous', year: 'c. 1200 CE', language: 'Old French', region: 'France',
    genres: ['chantefable', 'romance', 'prosimetrum'], kw: ['aucassin et nicolette', 'chantefable', 'prosimetrum', 'old french romance', 'medieval love story'], confidence: 'varies',
    summary: 'A short Old French romance that alternates sung verse with spoken prose, a mixed form its anonymous author calls a chantefable; a light, playful tale of young lovers who defy their families and the best-known example of the form.',
  },
  {
    id: 'work-anc-roman-de-renart', kind: 'work', name: 'Le Roman de Renart (Reynard the Fox)', author: 'Anonymous (many Old French poets)', year: 'c. 1180 CE', language: 'Old French', region: 'France',
    genres: ['beast epic', 'animal tales', 'verse satire'], kw: ['roman de renart', 'reynard the fox', 'beast epic', 'trickster fox', 'isengrim', 'medieval satire', 'animal fable'], confidence: 'varies',
    summary: 'A body of Old French verse tales, composed by several poets from the late twelfth century, about the trickster fox Renart and his rivalry with the wolf Ysengrin; they parody epic and court life through animal characters and spread the Reynard figure across Europe.',
  },
  {
    id: 'work-anc-tristan-gottfried', kind: 'work', name: 'Tristan (Gottfried von Straßburg)', author: 'Gottfried von Straßburg', year: 'c. 1210 CE', language: 'Middle High German', region: 'Germany',
    genres: ['courtly romance', 'verse romance', 'tragic love story'], kw: ['tristan', 'gottfried von strassburg', 'tristan and isolde', 'courtly romance', 'minne', 'middle high german'], confidence: 'varies',
    summary: 'An unfinished Middle High German verse romance of the lovers Tristan and Isolde, written about 1210; admired for its psychological and linguistic subtlety and a main source for Wagner\'s later opera.',
  },
  {
    id: 'work-anc-divine-comedy', kind: 'work', name: 'The Divine Comedy (La Divina Commedia)', author: 'Dante Alighieri', year: 'c. 1320 CE', language: 'Italian (Tuscan)', region: 'Italy',
    genres: ['epic poem', 'allegory', 'dream vision', 'terza rima'], kw: ['divine comedy', 'divina commedia', 'inferno', 'purgatorio', 'paradiso', 'dante', 'terza rima', 'vision poem'], confidence: 'established',
    summary: 'A long Italian poem in three parts, Inferno, Purgatorio and Paradiso, in which the narrator journeys through the afterlife; written in terza rima and completed shortly before Dante\'s death in 1321, it helped establish Italian as a literary language.',
  },
  {
    id: 'work-anc-canterbury-tales', kind: 'work', name: 'The Canterbury Tales', author: 'Geoffrey Chaucer', year: 'c. 1390 CE', language: 'Middle English', region: 'England',
    genres: ['frame narrative', 'verse tales', 'medieval satire', 'story collection'], kw: ['canterbury tales', 'chaucer', 'general prologue', 'frame story', 'pilgrims', 'wife of bath', 'middle english'], confidence: 'established',
    summary: 'A collection of tales told by a company of pilgrims travelling to Canterbury, framed by a General Prologue that sketches each teller; begun in the late 1380s and unfinished at Chaucer\'s death in 1400, it is a founding work of English literature and a model of the frame narrative.',
  },
  {
    id: 'work-anc-book-of-the-city-of-ladies', kind: 'work', name: 'The Book of the City of Ladies (Le Livre de la cité des dames)', author: 'Christine de Pizan', year: 1405, language: 'Middle French', region: 'France',
    genres: ['allegory', 'prose treatise', 'defence of women'], kw: ['city of ladies', 'cite des dames', 'christine de pizan', 'querelle des femmes', 'early feminist writing'], confidence: 'established',
    summary: 'An allegorical prose work in which the narrator, guided by three allegorical figures, builds a city to house the achievements of notable women; an early and influential defence of women\'s worth by a professional author, written in 1405.',
  },
  {
    id: 'work-anc-book-of-margery-kempe', kind: 'work', name: 'The Book of Margery Kempe', author: 'Margery Kempe (dictated to scribes)', year: 'c. 1436 CE', language: 'Middle English', region: 'England',
    genres: ['spiritual autobiography', 'life writing', 'memoir'], kw: ['margery kempe', 'earliest english autobiography', 'mystic', 'kings lynn', 'pilgrimage', 'dictated memoir'], confidence: 'varies',
    summary: 'A spiritual life story dictated by a merchant\'s wife from King\'s Lynn and recorded in the 1430s, describing her visions, pilgrimages and conflicts with neighbours and clergy; often called the first autobiography in English and read for its unpolished, distinctive voice.',
  },
  {
    id: 'work-anc-revelations-of-divine-love', kind: 'work', name: 'Revelations of Divine Love', author: 'Julian of Norwich', year: 'c. 1395 CE', language: 'Middle English', region: 'England',
    genres: ['spiritual writing', 'mystical prose', 'visionary literature'], kw: ['julian of norwich', 'revelations of divine love', 'showings', 'anchoress', 'middle english mystic', 'all shall be well'], confidence: 'varies',
    summary: 'A Middle English prose account of sixteen visions and a long reflection on them, written by an anchoress of Norwich in a shorter text and a later, longer one; often described as the earliest surviving book in English by a woman.',
  },
  {
    id: 'work-anc-imitation-of-christ', kind: 'work', name: 'The Imitation of Christ (De imitatione Christi)', author: 'Thomas à Kempis (traditional attribution)', year: 'c. 1420 CE', language: 'Latin', region: 'Low Countries',
    genres: ['devotional literature', 'spiritual guide'], kw: ['imitation of christ', 'de imitatione christi', 'thomas a kempis', 'devotio moderna', 'devotional classic'], confidence: 'varies',
    summary: 'A short Latin guide to inner devotion, usually attributed to the Augustinian canon Thomas à Kempis and linked to the Devotio Moderna movement; it circulated widely in manuscript and print and became one of the most reprinted devotional books.',
  },
  {
    id: 'work-anc-golden-legend', kind: 'work', name: 'The Golden Legend (Legenda aurea)', author: 'Jacobus de Voragine', year: 'c. 1260 CE', language: 'Latin', region: 'Italy',
    genres: ['hagiography', 'legend collection', 'medieval compendium'], kw: ['golden legend', 'legenda aurea', 'jacobus de voragine', 'lives of the saints', 'hagiography', 'medieval legends'], confidence: 'established',
    summary: 'A medieval compilation of saints\' lives and accounts of the Church\'s feast days by the Dominican Jacobus de Voragine, arranged by the liturgical year; among the most widely copied books of the later Middle Ages and a rich source of medieval stories and imagery.',
  },
  {
    id: 'work-anc-travels-of-marco-polo', kind: 'work', name: 'The Travels of Marco Polo (Il Milione)', author: 'Marco Polo and Rustichello da Pisa', year: 'c. 1300 CE', language: 'Old French (Franco-Italian)', region: 'Venice and Asia',
    genres: ['travel narrative', 'memoir', 'medieval travel writing'], kw: ['marco polo', 'il milione', 'travels of marco polo', 'rustichello', 'kublai khan', 'silk road'], confidence: 'varies',
    summary: 'An account of the Venetian merchant Marco Polo\'s journeys in Asia and his stay at the court of Kublai Khan as he told it, written down about 1300 with the romance writer Rustichello da Pisa; much copied and disputed in its details, it shaped European images of the East.',
  },
  {
    id: 'work-anc-travels-of-sir-john-mandeville', kind: 'work', name: 'The Travels of Sir John Mandeville', author: 'Anonymous (writing under the name John Mandeville)', year: 'c. 1357 CE', language: 'Anglo-Norman French', region: 'England and France',
    genres: ['travel narrative', 'pseudo-travelogue', 'compilation'], kw: ['mandeville', 'travels of sir john mandeville', 'medieval travel book', 'fictional traveller', 'pilgrim guide', 'imaginary geography'], confidence: 'contested',
    summary: 'A hugely popular medieval travel book that claims to record a knight\'s journeys to the Holy Land and beyond; its author is unknown and most of its marvels come from earlier writers, so it is read as compilation and imagined geography rather than report.',
  },
  {
    id: 'work-anc-heptameron', kind: 'work', name: 'The Heptameron', author: 'Marguerite de Navarre', year: 1558, language: 'French', region: 'France',
    genres: ['frame narrative', 'novella collection', 'Renaissance prose'], kw: ['heptameron', 'marguerite de navarre', 'frame story', 'renaissance novellas', 'decameron imitation', 'storytelling company'], confidence: 'established',
    summary: 'A collection of seventy-two tales, unfinished at the author\'s death, told by travellers kept in an abbey by floods, with the storytellers debating each tale; loosely modelled on the Decameron and first published after the queen\'s death.',
  },
  {
    id: 'work-anc-praise-of-folly', kind: 'work', name: 'The Praise of Folly (Moriae encomium)', author: 'Desiderius Erasmus', year: 1511, language: 'Latin', region: 'Netherlands and England',
    genres: ['satire', 'mock encomium', 'Renaissance humanism'], kw: ['praise of folly', 'moriae encomium', 'erasmus', 'renaissance satire', 'humanism', 'mock praise'], confidence: 'established',
    summary: 'A short Latin satire in which Folly, personified, delivers a speech in her own praise, mocking the vanities of scholars, clergy, rulers and ordinary people; written by Erasmus and first printed in 1511, it is a landmark of Renaissance satire.',
  },
  {
    id: 'work-anc-ship-of-fools', kind: 'work', name: 'The Ship of Fools (Das Narrenschiff)', author: 'Sebastian Brant', year: 1494, language: 'Early New High German', region: 'Basel',
    genres: ['satire', 'allegory', 'illustrated poem'], kw: ['ship of fools', 'narrenschiff', 'sebastian brant', 'moral satire', 'woodcuts', 'medieval satire'], confidence: 'established',
    summary: 'A German verse satire in which a crowd of fools of every kind sails towards a land of fools, each short chapter mocking a vice or folly; illustrated with woodcuts and printed in Basel in 1494, it was soon translated across Europe.',
  },
  {
    id: 'work-anc-till-eulenspiegel', kind: 'work', name: 'Till Eulenspiegel', author: 'Anonymous (traditionally linked to Hermann Bote)', year: 'c. 1510 CE', language: 'German', region: 'Germany',
    genres: ['jest book', 'trickster tales', 'picaresque'], kw: ['till eulenspiegel', 'eulenspiegel', 'jest book', 'trickster', 'german folk book', 'volksbuch'], confidence: 'contested',
    summary: 'A German prose collection of pranks played by a wandering trickster, printed in Strasbourg around 1510; its authorship is uncertain, though the Brunswick writer Hermann Bote is often proposed, and the character became a staple of European comic tradition.',
  },
  {
    id: 'work-anc-pentamerone', kind: 'work', name: 'Il Pentamerone (Lo cunto de li cunti)', author: 'Giambattista Basile', year: 1634, language: 'Neapolitan', region: 'Naples',
    genres: ['fairy tale collection', 'frame narrative', 'Baroque prose'], kw: ['pentamerone', 'lo cunto de li cunti', 'basile', 'tale of tales', 'neapolitan fairy tales', 'cinderella', 'early fairy tales'], confidence: 'established',
    summary: 'A collection of fifty tales in the Neapolitan dialect, told within a frame story over five days and published after Basile\'s death; it holds early literary versions of the Cinderella, Rapunzel and Sleeping Beauty tale types in an ornate Baroque style.',
  },
  {
    id: 'work-anc-facetious-nights', kind: 'work', name: 'The Facetious Nights (Le piacevoli notti)', author: 'Giovanni Francesco Straparola', year: 'c. 1550 CE', language: 'Italian', region: 'Venice',
    genres: ['fairy tale collection', 'frame narrative', 'novella collection'], kw: ['straparola', 'piacevoli notti', 'facetious nights', 'pleasant nights', 'puss in boots origin', 'early fairy tales'], confidence: 'varies',
    summary: 'An Italian two-volume collection of tales told by a company of guests over several nights, published in the early 1550s; among the first European books to print literary fairy tales, including an early form of the Puss in Boots story.',
  },
  {
    id: 'work-anc-simplicissimus', kind: 'work', name: 'Simplicissimus (Der abenteuerliche Simplicissimus Teutsch)', author: 'Hans Jakob Christoffel von Grimmelshausen', year: 1668, language: 'German', region: 'Germany',
    genres: ['picaresque novel', 'war narrative', 'Baroque novel'], kw: ['simplicissimus', 'grimmelshausen', 'thirty years war', 'picaresque', 'german baroque novel'], confidence: 'established',
    summary: 'A German picaresque novel narrated by a naive boy who passes through the Thirty Years\' War as shepherd, soldier and wanderer; first published in 1668 (the title page is dated 1669) and often regarded as the first major German novel.',
  },
  {
    id: 'work-anc-pilgrims-progress', kind: 'work', name: "The Pilgrim's Progress", author: 'John Bunyan', year: 1678, language: 'English', region: 'England',
    genres: ['allegory', 'Christian allegory', 'dream vision'], kw: ['pilgrims progress', 'bunyan', 'christian', 'allegory', 'celestial city', 'puritan literature'], confidence: 'established',
    summary: 'An English prose allegory in which a man named Christian journeys from his home to a distant city, meeting figures who embody temptations and virtues; written by John Bunyan in the 1670s, it was among the most widely read books in English for two centuries.',
  },

  // ---- Eastern Europe, Byzantium, Iberia and the Baltic world ----
  {
    id: 'work-anc-tale-of-igors-campaign', kind: 'work', name: "The Tale of Igor's Campaign (Slovo o polku Igoreve)", author: 'Anonymous', year: 'c. 1185 CE', language: 'Old East Slavic', region: 'Kievan Rus',
    genres: ['epic', 'heroic lay', 'prose poem'], kw: ['tale of igors campaign', 'slovo o polku igoreve', 'lay of igor', 'kievan rus', 'polovtsy', 'old east slavic'], confidence: 'contested',
    summary: 'An Old East Slavic poem in rhythmic prose about a failed campaign of 1185 by a prince of Novgorod-Seversk against the Polovtsians; its only manuscript was lost in 1812, and debate over its date and authenticity continues, though most scholars accept it as medieval.',
  },
  {
    id: 'work-anc-primary-chronicle', kind: 'work', name: 'The Primary Chronicle (Tale of Bygone Years)', author: 'Nestor (traditional attribution)', year: 'c. 1113 CE', language: 'Old East Slavic', region: 'Kievan Rus',
    genres: ['chronicle', 'history', 'annals'], kw: ['primary chronicle', 'tale of bygone years', 'povest vremennykh let', 'kievan rus', 'nestor chronicler', 'rus origins'], confidence: 'varies',
    summary: 'The main surviving chronicle of early Kievan Rus, compiled in the early twelfth century in Kyiv monastic circles and traditionally ascribed to the monk Nestor; it traces the origins of the Rus\' rulers and the adoption of Christianity, mixing legend with annals.',
  },
  {
    id: 'work-anc-life-of-avvakum', kind: 'work', name: 'The Life of Archpriest Avvakum', author: 'Avvakum Petrov', year: 'c. 1672 CE', language: 'Russian (Church Slavonic mixed with vernacular)', region: 'Russia',
    genres: ['autobiography', 'hagiography', 'Old Believer literature'], kw: ['avvakum', 'life of archpriest avvakum', 'russian autobiography', 'old believers', 'vernacular prose', 'protopope avvakum'], confidence: 'varies',
    summary: 'A seventeenth-century account of his own sufferings by a leader of the Old Believers, written during imprisonment in colloquial Russian rather than formal Church Slavonic; a landmark of Russian autobiography and vivid vernacular prose.',
  },
  {
    id: 'work-anc-kalevala', kind: 'work', name: 'The Kalevala', author: 'Elias Lönnrot (compiler)', year: 1835, language: 'Finnish', region: 'Finland and Karelia',
    genres: ['epic poem', 'national epic', 'folk poetry compilation'], kw: ['kalevala', 'lonnrot', 'finnish epic', 'karelian runes', 'vainamoinen', 'sampo', 'national epic'], confidence: 'established',
    summary: 'A Finnish epic assembled by Elias Lönnrot from oral poems he collected in Karelia and Finland; first published in 1835 and expanded in 1849, it helped shape Finnish national identity, and its trochaic metre has been borrowed by later poets.',
  },
  {
    id: 'work-anc-kalevipoeg', kind: 'work', name: 'Kalevipoeg', author: 'Friedrich Reinhold Kreutzwald', year: 1857, language: 'Estonian', region: 'Estonia',
    genres: ['epic poem', 'national epic', 'folk poetry compilation'], kw: ['kalevipoeg', 'kreutzwald', 'estonian epic', 'national epic', 'estonian folklore', 'giant hero'], confidence: 'established',
    summary: 'An Estonian national epic composed by Friedrich Reinhold Kreutzwald from folk tales and songs about a giant hero; published in instalments from 1857 and modelled in part on the Finnish Kalevala.',
  },
  {
    id: 'work-anc-digenes-akritas', kind: 'work', name: 'Digenes Akritas', author: 'Anonymous (Byzantine)', year: 'c. 1100 CE', language: 'Medieval Greek', region: 'Byzantine Empire',
    genres: ['epic', 'romance', 'frontier epic'], kw: ['digenes akritas', 'byzantine epic', 'akritic songs', 'frontier hero', 'medieval greek romance'], confidence: 'varies',
    summary: 'A Byzantine Greek verse romance-epic about a border hero of mixed Greek and Arab descent, surviving in several versions, the oldest from around the twelfth century; it draws on frontier songs and is the best-known Byzantine heroic poem.',
  },
  {
    id: 'work-anc-alexiad', kind: 'work', name: 'The Alexiad', author: 'Anna Komnene', year: 'c. 1148 CE', language: 'Medieval Greek', region: 'Byzantine Empire',
    genres: ['history', 'imperial biography'], kw: ['alexiad', 'anna komnene', 'byzantine history', 'alexios komnenos', 'crusades from byzantine view', 'woman historian'], confidence: 'established',
    summary: 'A history of the reign of the Byzantine emperor Alexios I, written by his daughter Anna Komnene in the mid-twelfth century; one of the few major historical works of the period by a woman and an important Byzantine view of the First Crusade.',
  },
  {
    id: 'work-anc-heliand', kind: 'work', name: 'The Heliand', author: 'Anonymous (Saxon poet)', year: 'c. 830 CE', language: 'Old Saxon', region: 'Saxony',
    genres: ['epic poem', 'biblical epic', 'alliterative verse'], kw: ['heliand', 'old saxon', 'gospel epic', 'alliterative verse', 'saxon christ', 'carolingian'], confidence: 'varies',
    summary: 'An Old Saxon alliterative poem of about six thousand lines that retells the life of Jesus in the idiom of Germanic heroic verse, written in the ninth century; it shows how a new story was fitted to older poetic forms.',
  },
  {
    id: 'work-anc-cantigas-de-santa-maria', kind: 'work', name: 'Cantigas de Santa Maria', author: 'Alfonso X of Castile and his court poets', year: 'c. 1270 CE', language: 'Galician-Portuguese', region: 'Castile',
    genres: ['song collection', 'miracle tales', 'medieval lyric'], kw: ['cantigas de santa maria', 'alfonso x', 'galician-portuguese', 'medieval songs', 'marian miracles', 'illuminated manuscript'], confidence: 'varies',
    summary: 'A collection of more than four hundred songs in Galician-Portuguese that praise the Virgin Mary and recount her miracles, produced at the court of Alfonso X of Castile in the later thirteenth century; prized for its music and its illuminated manuscripts.',
  },
  {
    id: 'work-anc-conde-lucanor', kind: 'work', name: 'El Conde Lucanor (Libro de los enxiemplos del conde Lucanor et de Patronio)', author: 'Don Juan Manuel', year: 1335, language: 'Castilian (medieval Spanish)', region: 'Castile',
    genres: ['exemplum collection', 'frame narrative', 'didactic prose'], kw: ['conde lucanor', 'libro de los enxiemplos', 'don juan manuel', 'exempla', 'medieval spanish prose', 'patronio'], confidence: 'established',
    summary: 'A medieval Castilian collection of fifty-one exemplary tales in which a count asks his counsellor Patronio for advice and receives a story with a moral; by the nobleman Don Juan Manuel, and one of the finest frame-tale collections in Spanish.',
  },
  {
    id: 'work-anc-tirant-lo-blanc', kind: 'work', name: 'Tirant lo Blanc', author: 'Joanot Martorell (completed by Martí Joan de Galba)', year: 1490, language: 'Catalan', region: 'Valencia',
    genres: ['chivalric romance', 'prose romance', 'knightly novel'], kw: ['tirant lo blanc', 'martorell', 'catalan novel', 'chivalric romance', 'valencian', 'cervantes praise'], confidence: 'established',
    summary: 'A long Catalan chivalric romance about the career of a Breton knight, begun by Joanot Martorell and finished after his death; printed in Valencia in 1490, it is notable for its realism and humour, and the priest in Don Quixote singles it out for praise.',
  },
  {
    id: 'work-anc-voyage-of-saint-brendan', kind: 'work', name: 'The Voyage of Saint Brendan (Navigatio Sancti Brendani)', author: 'Anonymous (Irish monastic tradition)', year: 'c. 900 CE', language: 'Latin', region: 'Ireland',
    genres: ['voyage tale', 'hagiography', 'imram'], kw: ['navigatio sancti brendani', 'voyage of saint brendan', 'brendan the navigator', 'immram', 'medieval voyage tale', 'irish sea saga'], confidence: 'varies',
    summary: 'A Latin tale of the Irish monk Brendan and his companions sailing the Atlantic in search of a promised land and meeting marvels along the way; composed about the ninth or tenth century and translated into many languages, it is the best-known medieval voyage legend.',
  },

  // ---- The Americas: Indigenous and colonial-era writing ----
  {
    id: 'work-anc-popol-vuh', kind: 'work', name: 'Popol Vuh', author: "Anonymous (K'iche' Maya authors)", year: 'c. 1550 CE', language: "K'iche'", region: 'Guatemalan highlands',
    genres: ['creation myth', 'epic', 'Maya literature'], kw: ['popol vuh', 'kiche maya', 'quiche', 'hero twins', 'maya creation', 'council book', 'ximenez'], confidence: 'varies',
    summary: 'The K\'iche\' Maya book of creation, myth and dynastic history, written in the Latin alphabet in the mid-sixteenth century from older sources; its hero twins and account of creation make it the best-known work of Maya literature.',
  },
  {
    id: 'work-anc-books-of-chilam-balam', kind: 'work', name: 'The Books of Chilam Balam', author: 'Anonymous (Yucatec Maya scribes)', year: 'c. 1700 CE', language: 'Yucatec Maya (with Spanish)', region: 'Yucatán',
    genres: ['prophecy', 'chronicle', 'miscellany'], kw: ['chilam balam', 'chumayel', 'yucatec maya', 'maya prophecy', 'katun', 'colonial maya manuscripts'], confidence: 'varies',
    summary: 'A group of Yucatec Maya manuscripts, copied by local scribes from the seventeenth to the nineteenth centuries, that mix prophecy, history, ritual, calendar lore and European medicine; they preserve Maya voices under Spanish rule.',
  },
  {
    id: 'work-anc-florentine-codex', kind: 'work', name: 'The Florentine Codex (General History of the Things of New Spain)', author: 'Bernardino de Sahagún with Nahua collaborators', year: 'c. 1577 CE', language: 'Nahuatl and Spanish', region: 'Mexico',
    genres: ['ethnography', 'encyclopedia', 'colonial chronicle'], kw: ['florentine codex', 'sahagun', 'general history of the things of new spain', 'nahua', 'aztec', 'nahuatl'], confidence: 'established',
    summary: 'A twelve-book encyclopedia of Nahua life, religion and the Spanish conquest, compiled in Nahuatl and Spanish by the Franciscan Bernardino de Sahagún with Nahua collaborators and completed in the later sixteenth century; among the richest sources on Aztec society.',
  },
  {
    id: 'work-anc-cantares-mexicanos', kind: 'work', name: 'Cantares Mexicanos (Songs of the Mexicans)', author: 'Anonymous (Nahua poets, recorded by colonial scribes)', year: 'c. 1580 CE', language: 'Nahuatl', region: 'Mexico',
    genres: ['song collection', 'Nahuatl poetry'], kw: ['cantares mexicanos', 'nahuatl poetry', 'flower and song', 'aztec poetry', 'colonial manuscript', 'nahua songs'], confidence: 'varies',
    summary: 'A late sixteenth-century manuscript collection of Nahuatl songs and poems, many of them older, recorded in the Latin alphabet; its paired images such as flower and song make it a principal body of surviving Nahuatl lyric poetry.',
  },
  {
    id: 'work-anc-royal-commentaries-of-the-incas', kind: 'work', name: 'Royal Commentaries of the Incas (Comentarios reales de los incas)', author: 'Inca Garcilaso de la Vega', year: 1609, language: 'Spanish', region: 'Peru and Spain',
    genres: ['chronicle', 'history', 'colonial literature'], kw: ['comentarios reales', 'inca garcilaso', 'royal commentaries', 'inca history', 'quechua', 'colonial peru'], confidence: 'established',
    summary: 'A history of Inca society and the Spanish conquest of Peru by Garcilaso de la Vega, born in Cusco to a Spanish captain and an Inca noblewoman and later living in Spain; first published in Lisbon in 1609 and a founding work of Latin American prose.',
  },
  {
    id: 'work-anc-huarochiri-manuscript', kind: 'work', name: 'The Huarochirí Manuscript', author: 'Anonymous (Quechua authors working for the priest Francisco de Ávila)', year: 'c. 1608 CE', language: 'Quechua', region: 'Peruvian Andes',
    genres: ['myth collection', 'religious narrative', 'oral tradition'], kw: ['huarochiri manuscript', 'quechua', 'andean myth', 'pariacaca', 'francisco de avila', 'runasimi'], confidence: 'varies',
    summary: 'A Quechua-language manuscript recording the myths, rituals and local history of the Huarochirí province in the Peruvian Andes, written down about 1608; one of the very few extended early texts in Quechua.',
  },
  {
    id: 'work-anc-guaman-poma-first-new-chronicle', kind: 'work', name: 'The First New Chronicle and Good Government (Nueva corónica y buen gobierno)', author: 'Felipe Guamán Poma de Ayala', year: 'c. 1615 CE', language: 'Spanish (with Quechua)', region: 'Peru',
    genres: ['chronicle', 'illustrated manuscript', 'petition'], kw: ['guaman poma', 'nueva coronica', 'first new chronicle and good government', 'andean chronicle', 'illustrated chronicle', 'quechua'], confidence: 'established',
    summary: 'An illustrated chronicle of more than a thousand pages by an Andean nobleman, addressed to the king of Spain, that describes Inca history, colonial abuses and proposals for reform in Spanish mixed with Quechua; its hundreds of drawings are a major source for the period.',
  },
  {
    id: 'work-anc-short-account-destruction-of-the-indies', kind: 'work', name: 'A Short Account of the Destruction of the Indies (Brevísima relación de la destrucción de las Indias)', author: 'Bartolomé de las Casas', year: 1552, language: 'Spanish', region: 'Spain and the Americas',
    genres: ['polemic', 'history', 'colonial critique'], kw: ['las casas', 'brevisima relacion', 'destruction of the indies', 'colonial critique', 'black legend', 'advocacy writing'], confidence: 'established',
    summary: 'A short polemical report by the Dominican friar Bartolomé de las Casas on the treatment of indigenous peoples in the Spanish Americas, printed in Seville in 1552; widely translated, it fed later debates about empire and remains a key example of eyewitness advocacy writing.',
  },
  {
    id: 'work-anc-true-history-of-the-conquest-of-new-spain', kind: 'work', name: 'The True History of the Conquest of New Spain (Historia verdadera de la conquista de la Nueva España)', author: 'Bernal Díaz del Castillo', year: 1632, language: 'Spanish', region: 'Mexico and Spain',
    genres: ['chronicle', 'memoir', 'conquest narrative'], kw: ['bernal diaz', 'true history conquest new spain', 'historia verdadera', 'conquistador memoir', 'cortes', 'tenochtitlan'], confidence: 'established',
    summary: 'A soldier\'s long memoir of the Spanish campaigns against the Aztec empire, written decades afterwards and published in 1632 after the author\'s death; valued as an eyewitness account and for its plain, anecdotal voice, but read critically as one participant\'s version.',
  },

  // ---- Africa: oral epics and early written traditions ----
  {
    id: 'work-anc-mwindo-epic', kind: 'work', name: 'The Mwindo Epic', author: 'Anonymous (Nyanga oral tradition; recorded and translated by Daniel Biebuyck and Kahombo Mateene)', year: 1969, language: 'Nyanga', region: 'Eastern Democratic Republic of the Congo',
    genres: ['oral epic', 'hero epic', 'Bantu oral literature'], kw: ['mwindo epic', 'nyanga', 'biebuyck', 'congo oral epic', 'bantu epic', 'mwindo'], confidence: 'varies',
    summary: 'A Nyanga oral epic from eastern Congo about the hero Mwindo, recorded from a bard in the field and published with an English translation in 1969 by Daniel Biebuyck and Kahombo Mateene; a leading example of epic in Central African oral tradition.',
  },
  {
    id: 'work-anc-ozidi-saga', kind: 'work', name: 'The Ozidi Saga', author: 'Anonymous (Ijo oral tradition; collected and translated by J. P. Clark-Bekederemo)', year: 1977, language: 'Ijo (Ijaw)', region: 'Niger Delta, Nigeria',
    genres: ['oral epic', 'performance saga', 'Ijo drama'], kw: ['ozidi saga', 'ijo', 'ijaw epic', 'j p clark', 'niger delta', 'oral performance'], confidence: 'varies',
    summary: 'A multi-day Ijo oral epic-drama from the Niger Delta about the hero Ozidi, recorded in performance by J. P. Clark-Bekederemo and published with an English translation in 1977; it shows how song, dance, drumming and narration combine in an African oral epic.',
  },
  {
    id: 'work-anc-al-inkishafi', kind: 'work', name: 'Al-Inkishafi', author: 'Sayyid Abdalla bin Ali bin Nasir (attributed)', year: 'c. 1810 CE', language: 'Swahili', region: 'Swahili coast (Lamu archipelago)',
    genres: ['didactic poem', 'Swahili verse', 'religious poetry'], kw: ['al-inkishafi', 'swahili poetry', 'utenzi', 'sayyid abdalla', 'pate', 'classical swahili'], confidence: 'varies',
    summary: 'A Swahili poem on the passing of worldly splendour, attributed to Sayyid Abdalla bin Ali bin Nasir of the Lamu region and written in the early nineteenth century; often named among the finest classical Swahili religious poems, it reflects on the ruined town of Pate.',
  },

  // ---- Folktale collections and the tools used to study them ----
  {
    id: 'work-anc-aarne-verzeichnis-der-marchentypen', kind: 'work', name: 'Verzeichnis der Märchentypen (Index of Fairy-Tale Types)', author: 'Antti Aarne', year: 1910, language: 'German', region: 'Finland',
    genres: ['folktale index', 'reference classification'], kw: ['aarne index', 'verzeichnis der marchentypen', 'tale type index', 'folktale classification', 'aarne-thompson'], confidence: 'established',
    summary: 'A catalogue by the Finnish folklorist Antti Aarne that sorts European folktales into numbered tale types with short descriptions; the first form of the system later extended by Stith Thompson and Hans-Jörg Uther, used to compare variants across cultures.',
  },
  {
    id: 'work-anc-types-of-the-folktale', kind: 'work', name: 'The Types of the Folktale', author: 'Antti Aarne and Stith Thompson', year: 1928, language: 'English', region: 'Finland and United States',
    genres: ['folktale index', 'reference classification'], kw: ['aarne-thompson', 'at index', 'tale type', 'types of the folktale', 'folktale numbers', 'folktale classification'], confidence: 'established',
    summary: 'An English-language revision and enlargement by Stith Thompson of Aarne\'s tale-type catalogue, first issued in 1928 and revised in 1961; its numbers became the standard way to cite a folktale type until the later Uther revision.',
  },
  {
    id: 'work-anc-types-of-international-folktales', kind: 'work', name: 'The Types of International Folktales', author: 'Hans-Jörg Uther', year: 2004, language: 'English', region: 'Finland and Germany',
    genres: ['folktale index', 'reference classification'], kw: ['atu index', 'uther', 'types of international folktales', 'aarne-thompson-uther', 'tale type number', 'folktale classification'], confidence: 'established',
    summary: 'A three-part revision and expansion of the Aarne–Thompson tale-type index by Hans-Jörg Uther, published in 2004, which adds new types and corrects older entries; folklorists now cite tale types with the abbreviation ATU.',
  },
  {
    id: 'work-anc-motif-index-of-folk-literature', kind: 'work', name: 'Motif-Index of Folk-Literature', author: 'Stith Thompson', year: 1932, language: 'English', region: 'United States',
    genres: ['folklore index', 'reference classification'], kw: ['motif index', 'stith thompson', 'folklore motifs', 'motif numbers', 'folk literature index', 'recurring story elements'], confidence: 'established',
    summary: 'A multi-volume English-language classification by Stith Thompson of the smallest recurring story elements, or motifs, found in folktales, myths, ballads and jest books, first issued in 1932 to 1936 and revised in the 1950s; a research tool for tracing how one image or event travels between traditions.',
  },
  {
    id: 'work-anc-morphology-of-the-folktale', kind: 'work', name: 'Morphology of the Folktale', author: 'Vladimir Propp', year: 1928, language: 'Russian', region: 'Soviet Union',
    genres: ['folktale analysis', 'narratology', 'structuralist theory'], kw: ['propp', 'morphology of the folktale', 'thirty-one functions', 'folktale functions', 'fairy tale structure', 'russian formalism'], confidence: 'established',
    summary: 'A study by the Russian scholar Vladimir Propp that analyses a set of Russian wonder tales into a fixed sequence of thirty-one narrative functions and a few character roles; it became a foundation for narratology and for later story-structure models.',
  },
  {
    id: 'work-anc-afanasyev-russian-folk-tales', kind: 'work', name: 'Russian Folk Tales (Narodnye russkie skazki)', author: 'Aleksandr Afanasyev', year: 1855, language: 'Russian', region: 'Russia',
    genres: ['folktale collection', 'Russian folklore'], kw: ['afanasyev', 'russian fairy tales', 'baba yaga', 'firebird', 'koschei', 'narodnye russkie skazki', 'russian folktales'], confidence: 'established',
    summary: 'The major nineteenth-century collection of Russian folktales by the folklorist Aleksandr Afanasyev, issued in instalments from 1855; it gathers hundreds of wonder tales, animal tales and legends, including the Baba Yaga and Firebird stories, and is the Russian counterpart to the Grimms\' collection.',
  },
  {
    id: 'work-anc-norske-folkeeventyr', kind: 'work', name: 'Norwegian Folk Tales (Norske Folkeeventyr)', author: 'Peter Christen Asbjørnsen and Jørgen Moe', year: 1841, language: 'Norwegian (Dano-Norwegian)', region: 'Norway',
    genres: ['folktale collection', 'Norwegian folklore'], kw: ['asbjornsen and moe', 'norske folkeeventyr', 'three billy goats gruff', 'east of the sun and west of the moon', 'norwegian fairy tales', 'troll tales'], confidence: 'established',
    summary: 'The first major Norwegian folktale collection, begun in 1841 by Peter Christen Asbjørnsen and Jørgen Moe in the spirit of the Grimms; it holds the trolls and animal tales best known in English and helped shape a written Norwegian storytelling style.',
  },
  {
    id: 'work-anc-deutsche-sagen', kind: 'work', name: 'German Legends (Deutsche Sagen)', author: 'Jacob and Wilhelm Grimm', year: 1816, language: 'German', region: 'Germany',
    genres: ['legend collection', 'folklore'], kw: ['deutsche sagen', 'grimm legends', 'german legends', 'pied piper', 'folk legends', 'local legends'], confidence: 'established',
    summary: 'A companion to the Grimms\' fairy tales, issued in two volumes in 1816 and 1818, that gathers several hundred German legends tied to particular places and persons; it shows the difference between the legend, presented as local belief, and the wonder tale.',
  },
  {
    id: 'work-anc-galland-mille-et-une-nuits', kind: 'work', name: 'Les Mille et Une Nuits (Galland\'s translation)', author: 'Antoine Galland', year: 1704, language: 'French', region: 'France',
    genres: ['story collection', 'frame narrative', 'translation'], kw: ['galland', 'mille et une nuits', 'arabian nights', 'aladdin', 'ali baba', 'european arabian nights', 'translation history'], confidence: 'established',
    summary: 'The first European version of the Arabian Nights, translated and adapted by Antoine Galland in twelve volumes from 1704; it added tales such as Aladdin and Ali Baba, which came from a Syrian storyteller, and it set the Western image of the collection.',
  },
  {
    id: 'work-anc-contes-des-fees-aulnoy', kind: 'work', name: 'Les Contes des fées (Tales of Fairies)', author: "Marie-Catherine d'Aulnoy", year: 1697, language: 'French', region: 'France',
    genres: ['literary fairy tale', 'salon tale'], kw: ['madame d\'aulnoy', 'contes des fees', 'conte de fees', 'fairy tale origin', 'french salon fairy tales', 'white cat', 'blue bird'], confidence: 'established',
    summary: 'A collection of literary fairy tales by Marie-Catherine d\'Aulnoy, first published in 1697, to whom the French term conte de fées is generally credited; the tales were written for a courtly salon audience and influenced later fairy-tale writing.',
  },
  {
    id: 'work-anc-la-belle-et-la-bete', kind: 'work', name: 'La Belle et la Bête (Beauty and the Beast)', author: 'Gabrielle-Suzanne de Villeneuve', year: 1740, language: 'French', region: 'France',
    genres: ['literary fairy tale', 'novella'], kw: ['beauty and the beast', 'la belle et la bete', 'villeneuve', 'fairy tale origin', 'la jeune americaine', 'literary fairy tale'], confidence: 'established',
    summary: 'The long literary tale of Beauty and the Beast, written by Gabrielle-Suzanne de Villeneuve and published in 1740 within a frame story; a shorter version by Jeanne-Marie Leprince de Beaumont, printed in 1756, is the one most often retold.',
  },
  {
    id: 'work-anc-andersen-the-little-mermaid', kind: 'work', name: 'The Little Mermaid (Den lille havfrue)', author: 'Hans Christian Andersen', year: 1837, language: 'Danish', region: 'Denmark',
    genres: ['literary fairy tale', 'tragic romance'], kw: ['the little mermaid', 'den lille havfrue', 'hans christian andersen', 'literary fairy tale', 'sea princess', 'danish fairy tale'], confidence: 'established',
    summary: 'A literary fairy tale about a sea-dweller who longs for a human soul and a place among people, first published in Copenhagen in 1837 in Andersen\'s second booklet of tales; known for its bittersweet tone.',
  },
  {
    id: 'work-anc-andersen-the-snow-queen', kind: 'work', name: 'The Snow Queen (Snedronningen)', author: 'Hans Christian Andersen', year: 1844, language: 'Danish', region: 'Denmark',
    genres: ['literary fairy tale', 'quest tale'], kw: ['the snow queen', 'snedronningen', 'hans christian andersen', 'literary fairy tale', 'quest for a friend', 'seven stories'], confidence: 'established',
    summary: 'A literary fairy tale in seven episodes about a girl who sets out to find a friend taken by a figure of winter, published in Andersen\'s New Fairy Tales in 1844; a much-cited example of a quest story built on friendship.',
  },
  {
    id: 'work-anc-calvino-fiabe-italiane', kind: 'work', name: 'Italian Folktales (Fiabe italiane)', author: 'Italo Calvino', year: 1956, language: 'Italian', region: 'Italy',
    genres: ['folktale collection', 'retold folk tales'], kw: ['fiabe italiane', 'italian folktales', 'calvino', 'folktale retelling', 'two hundred tales', 'regional tales'], confidence: 'established',
    summary: 'A collection of two hundred Italian folktales selected by Italo Calvino from regional collections of the nineteenth and twentieth centuries and retold in standard Italian; a modern counterpart to the Grimms\' project, with an introduction on the nature of the folktale.',
  },

  // ---- South Asia and the Buddhist world ----
  {
    id: 'work-anc-kadambari', kind: 'work', name: 'Kadambari', author: 'Bāṇabhaṭṭa (completed by his son)', year: 'c. 630 CE', language: 'Sanskrit', region: 'North India',
    genres: ['prose romance', 'kavya', 'frame narrative'], kw: ['kadambari', 'banabhatta', 'sanskrit prose romance', 'kavya', 'harshacharita', 'classical sanskrit prose'], confidence: 'varies',
    summary: 'A long Sanskrit prose romance by Bāṇabhaṭṭa, built from stories nested within stories and left unfinished at his death, then completed by his son; a high point of ornate classical prose whose title became a word for a novel in several Indian languages.',
  },
  {
    id: 'work-anc-raghuvamsha', kind: 'work', name: 'Raghuvamsha (The Dynasty of Raghu)', author: 'Kalidasa', year: 'c. 400 CE', language: 'Sanskrit', region: 'North India',
    genres: ['mahakavya', 'epic poem', 'court poem'], kw: ['raghuvamsa', 'raghuvamsha', 'kalidasa', 'mahakavya', 'sanskrit court epic', 'dynasty of raghu'], confidence: 'varies',
    summary: 'A Sanskrit court epic in nineteen cantos by Kālidāsa that traces the line of kings from whom Rama descends; a model of the classical mahākāvya, admired for its imagery and varied metres.',
  },
  {
    id: 'work-anc-kamba-ramayanam', kind: 'work', name: 'The Kamba Ramayanam (Iramavataram)', author: 'Kambar', year: 'c. 1180 CE', language: 'Tamil', region: 'South India',
    genres: ['epic poem', 'retelling of the Ramayana', 'Tamil epic'], kw: ['kamba ramayanam', 'kambar', 'iramavataram', 'tamil ramayana', 'tamil epic', 'ramayana retelling'], confidence: 'varies',
    summary: 'A Tamil retelling of the Rāmāyaṇa by the poet Kambar, usually placed in the twelfth century; it reshapes the Sanskrit story with Tamil settings and imagery and is regarded as a masterpiece of Tamil poetry.',
  },
  {
    id: 'work-anc-manimekalai', kind: 'work', name: 'Manimekalai', author: 'Cāttanār (traditional attribution)', year: 'c. 500 CE', language: 'Tamil', region: 'South India',
    genres: ['epic', 'Buddhist narrative', 'Tamil literature'], kw: ['manimekalai', 'chithalai chathanar', 'tamil epic', 'buddhist tamil literature', 'silappatikaram sequel', 'five great tamil epics'], confidence: 'varies',
    summary: 'A Tamil verse epic, traditionally ascribed to the poet Cāttanār, that continues the story begun in the Silappatikaram by following the daughter of its characters on a Buddhist path; counted among the five great Tamil epics.',
  },
  {
    id: 'work-anc-padmavat', kind: 'work', name: 'Padmavat', author: 'Malik Muhammad Jayasi', year: 1540, language: 'Awadhi', region: 'North India',
    genres: ['epic poem', 'Sufi romance', 'premakhyan'], kw: ['padmavat', 'padmavati', 'jayasi', 'awadhi epic', 'sufi romance', 'premakhyan', 'chittor'], confidence: 'established',
    summary: 'An Awadhi epic poem by the Sufi poet Malik Muhammad Jayasi, composed about 1540, that retells the legend of Queen Padmini of Chittor as an allegory of the soul\'s search; a central work of the Hindi Sufi romance tradition.',
  },
  {
    id: 'work-anc-dnyaneshwari', kind: 'work', name: 'Dnyaneshwari (Bhavartha Deepika)', author: 'Dnyaneshwar', year: 'c. 1290 CE', language: 'Marathi', region: 'Maharashtra',
    genres: ['verse commentary', 'devotional poetry'], kw: ['dnyaneshwari', 'jnaneshwari', 'dnyaneshwar', 'marathi bhagavad gita', 'bhavartha deepika', 'marathi literature'], confidence: 'varies',
    summary: 'A long Marathi verse commentary on the Bhagavad Gita by the saint-poet Dnyāneshwar, traditionally dated to about 1290; one of the first major works in Marathi and a foundation of that literary language.',
  },
  {
    id: 'work-anc-lotus-sutra', kind: 'work', name: 'The Lotus Sutra (Saddharmapundarika)', author: 'Anonymous (Buddhist tradition)', year: 'c. 100 CE', language: 'Sanskrit', region: 'India',
    genres: ['scripture', 'parable collection', 'Mahayana text'], kw: ['lotus sutra', 'saddharma pundarika', 'burning house parable', 'mahayana', 'buddhist parables', 'kumarajiva'], confidence: 'varies',
    summary: 'A Mahayana Buddhist text composed in India over roughly the first two centuries CE, celebrated as literature for its parables, such as the burning house, and its vast imagined settings; its Chinese version by Kumārajīva was widely read across East Asia.',
  },
  {
    id: 'work-anc-buddhacarita', kind: 'work', name: 'Buddhacarita (Life of the Buddha)', author: 'Aśvaghoṣa', year: 'c. 100 CE', language: 'Sanskrit', region: 'India',
    genres: ['mahakavya', 'biographical poem'], kw: ['buddhacarita', 'ashvaghosha', 'life of the buddha poem', 'sanskrit kavya', 'buddhist epic'], confidence: 'varies',
    summary: 'A Sanskrit poem on the life of the Buddha by Aśvaghoṣa, usually dated to about the first or second century CE and complete only in translation; one of the earliest surviving examples of Sanskrit court poetry (kāvya) and a model for joining devotional and literary aims.',
  },
  {
    id: 'work-anc-bardo-thodol', kind: 'work', name: 'The Tibetan Book of the Dead (Bardo Thödol)', author: 'Karma Lingpa (revealer; teaching attributed to Padmasambhava)', year: 'c. 1350 CE', language: 'Tibetan', region: 'Tibet',
    genres: ['funerary text', 'treasure text (terma)', 'scripture'], kw: ['bardo thodol', 'tibetan book of the dead', 'karma lingpa', 'terma', 'padmasambhava', 'intermediate state'], confidence: 'varies',
    summary: 'A Tibetan Buddhist guide read to the dying and the dead to help them through the intermediate state after death, revealed as a "treasure text" by Karma Lingpa in the fourteenth century; its popular English title dates from a translation of 1927.',
  },

  // ---- China, Japan, Korea and Southeast Asia ----
  {
    id: 'work-anc-shishuo-xinyu', kind: 'work', name: 'A New Account of the Tales of the World (Shishuo xinyu)', author: 'Liu Yiqing (with a team of scholars)', year: 'c. 430 CE', language: 'Classical Chinese', region: 'China',
    genres: ['anecdote collection', 'biographical sketches', 'zhiren'], kw: ['shishuo xinyu', 'liu yiqing', 'tales of the world', 'wei-jin anecdotes', 'chinese anecdotes', 'pure conversation'], confidence: 'established',
    summary: 'A fifth-century collection of short anecdotes and sayings about scholars, officials and eccentrics of the Han to Jin periods, sorted under thirty-six headings such as insight, wit and indulgence; prized for its compressed, vivid characterisation.',
  },
  {
    id: 'work-anc-poems-of-tao-yuanming', kind: 'work', name: 'The Poems of Tao Yuanming', author: 'Tao Yuanming (Tao Qian)', year: 'c. 420 CE', language: 'Classical Chinese', region: 'China',
    genres: ['poetry collection', 'pastoral poetry', 'rustic lyric'], kw: ['tao yuanming', 'tao qian', 'peach blossom spring', 'field and garden poetry', 'jin dynasty poetry', 'chinese pastoral'], confidence: 'established',
    summary: 'Poems and short prose, written over several decades and dated only roughly, by the Jin dynasty writer Tao Yuanming, who left office to farm, on field and garden life, wine and plain living; his work set a pattern for Chinese pastoral poetry, and the prose Peach Blossom Spring became a lasting image of utopia.',
  },
  {
    id: 'work-anc-mencius', kind: 'work', name: 'The Mencius (Mengzi)', author: 'Mencius (Meng Ke) and his disciples', year: 'c. 300 BCE', language: 'Classical Chinese', region: 'China',
    genres: ['philosophical dialogue', 'Confucian classic'], kw: ['mencius', 'mengzi', 'confucian classic', 'human nature is good', 'four books'], confidence: 'varies',
    summary: 'A Confucian classic recording the conversations of the philosopher Mencius with rulers and students, with arguments on human nature, government and moral cultivation; read as literature for its lively debates and vivid analogies.',
  },
  {
    id: 'work-anc-zuo-zhuan', kind: 'work', name: 'The Zuo Commentary (Zuo Zhuan)', author: 'Zuo Qiuming (traditional attribution)', year: 'c. 300 BCE', language: 'Classical Chinese', region: 'China',
    genres: ['historical narrative', 'chronicle commentary'], kw: ['zuo zhuan', 'zuozhuan', 'spring and autumn annals', 'chinese historical narrative', 'zuo qiuming'], confidence: 'contested',
    summary: 'A Chinese narrative history of the Spring and Autumn period, framed as a commentary on a terse annals and traditionally credited to Zuo Qiuming; admired as an early great model of Chinese historical storytelling, with speeches, battles and court intrigue.',
  },
  {
    id: 'work-anc-jin-ping-mei', kind: 'work', name: 'Jin Ping Mei (The Plum in the Golden Vase)', author: 'Lanling Xiaoxiao Sheng (pseudonym)', year: 'c. 1610 CE', language: 'Chinese', region: 'China',
    genres: ['novel of manners', 'domestic novel', 'Ming vernacular fiction'], kw: ['jin ping mei', 'plum in the golden vase', 'ming novel', 'lanling xiaoxiao sheng', 'chinese novel of manners', 'xi men qing'], confidence: 'contested',
    summary: 'A long Ming dynasty novel by an author who wrote under a pseudonym, following the household of a prosperous merchant in extended and unsparing domestic detail; counted with the great Ming novels and a landmark of social realism in Chinese fiction.',
  },
  {
    id: 'work-anc-the-scholars-rulin-waishi', kind: 'work', name: 'The Scholars (Rulin waishi)', author: 'Wu Jingzi', year: 'c. 1750 CE', language: 'Chinese', region: 'China',
    genres: ['satirical novel', 'episodic novel', 'Qing fiction'], kw: ['rulin waishi', 'the scholars', 'wu jingzi', 'imperial examinations', 'chinese satire', 'qing novel'], confidence: 'varies',
    summary: 'A Qing dynasty satirical novel about the ambitions and failings of scholars bound up with the imperial examination system, written about the middle of the eighteenth century; episodic rather than centred on one hero, it is a landmark of Chinese social satire.',
  },
  {
    id: 'work-anc-three-words-feng-menglong', kind: 'work', name: 'The Three Words (Sanyan) story collections', author: 'Feng Menglong (compiler and editor)', year: 'c. 1625 CE', language: 'Chinese (vernacular)', region: 'China',
    genres: ['vernacular short story', 'huaben', 'story collection'], kw: ['feng menglong', 'sanyan', 'three words', 'stories old and new', 'vernacular stories', 'ming short fiction'], confidence: 'varies',
    summary: 'Three collections of 120 vernacular short stories compiled and edited by Feng Menglong in the 1620s, adapting older tales and adding new ones; they gave the Chinese vernacular short story its classic form and fed later fiction and drama.',
  },
  {
    id: 'work-anc-shin-kokinshu', kind: 'work', name: 'Shin Kokinshū (New Collection of Ancient and Modern Poems)', author: 'Fujiwara no Teika and other court compilers', year: 'c. 1205 CE', language: 'Japanese', region: 'Japan',
    genres: ['waka anthology', 'imperial anthology'], kw: ['shin kokinshu', 'new kokinshu', 'imperial anthology', 'waka', 'retired emperor go-toba', 'fujiwara no teika', 'honkadori'], confidence: 'varies',
    summary: 'An imperial anthology of waka compiled by a committee under the retired Emperor Go-Toba and completed about 1205; known for its allusive, atmospheric style and for honkadori, the technique of echoing and varying a famous earlier poem.',
  },
  {
    id: 'work-anc-japanese-family-storehouse', kind: 'work', name: 'The Japanese Family Storehouse (Nippon eitaigura)', author: 'Ihara Saikaku', year: 1688, language: 'Japanese', region: 'Japan',
    genres: ['chōnin fiction', 'merchant tales', 'ukiyo-zōshi'], kw: ['nippon eitaigura', 'ihara saikaku', 'merchant stories', 'ukiyo-zoshi', 'edo fiction', 'chonin'], confidence: 'established',
    summary: 'A collection of stories about how townspeople in Edo-period Japan make, keep and lose fortunes, by Ihara Saikaku; published in 1688, it is a key text of ukiyo-zōshi fiction and a lively portrait of merchant life.',
  },
  {
    id: 'work-anc-fushikaden', kind: 'work', name: 'Fūshikaden (Style and the Flower)', author: 'Zeami Motokiyo', year: 'c. 1400 CE', language: 'Japanese', region: 'Japan',
    genres: ['treatise', 'theatre theory', 'noh'], kw: ['fushikaden', 'zeami', 'noh theory', 'the flower hana', 'style and the flower', 'japanese theatre treatise'], confidence: 'varies',
    summary: 'A treatise on the art of Noh by the actor and playwright Zeami, circulated about 1400 as advice on training actors and winning audiences; it develops ideas such as the "flower" of performance and is a foundational work of theatre theory.',
  },
  {
    id: 'work-anc-cloud-dream-of-the-nine', kind: 'work', name: 'The Cloud Dream of the Nine (Kuunmong)', author: 'Kim Manjung', year: 'c. 1687 CE', language: 'Korean and Classical Chinese', region: 'Korea',
    genres: ['dream narrative', 'romance', 'Joseon fiction'], kw: ['kuunmong', 'cloud dream of the nine', 'kim manjung', 'joseon novel', 'dream tale', 'korean classic novel'], confidence: 'contested',
    summary: 'A Korean Joseon dynasty novel by Kim Manjung, written about 1687 during exile, in which a monk\'s dream of worldly success prompts reflection on illusion; scholars debate whether it was first written in Korean or in Chinese.',
  },
  {
    id: 'work-anc-hong-gildong-jeon', kind: 'work', name: 'The Tale of Hong Gildong (Hong Gildong jeon)', author: 'Heo Gyun (traditional attribution)', year: 'c. 1612 CE', language: 'Korean', region: 'Korea',
    genres: ['hero tale', 'social critique', 'Joseon fiction'], kw: ['hong gildong', 'hong gildong jeon', 'heo gyun', 'korean outlaw hero', 'joseon fiction', 'hangul novel'], confidence: 'contested',
    summary: 'A Korean tale of a gifted outlaw hero born to a nobleman and a concubine, traditionally attributed to Heo Gyun and often called the first novel in Hangul; the attribution and early dating are disputed, but its theme of social barriers is central to Korean literary history.',
  },
  {
    id: 'work-anc-sejarah-melayu', kind: 'work', name: 'Sejarah Melayu (The Malay Annals)', author: 'Anonymous (court tradition; ascribed in some versions to Tun Sri Lanang)', year: 'c. 1612 CE', language: 'Classical Malay', region: 'Malay world',
    genres: ['court chronicle', 'historical romance', 'hikayat'], kw: ['sejarah melayu', 'malay annals', 'tun sri lanang', 'melaka sultanate', 'hikayat', 'malay chronicle'], confidence: 'varies',
    summary: 'A court chronicle of the Malay sultanate of Melaka and its rulers that blends dynastic legend with history; its best-known version is dated to 1612 and associated with Tun Sri Lanang, and the work is a founding text of Malay prose.',
  },
  {
    id: 'work-anc-serat-centhini', kind: 'work', name: 'Serat Centhini', author: 'Anonymous (a court team of Surakarta writers)', year: 1814, language: 'Javanese', region: 'Java',
    genres: ['encyclopedic poem', 'tembang macapat', 'court compendium'], kw: ['serat centhini', 'javanese encyclopedia', 'tembang macapat', 'pakubuwana', 'surakarta court', 'javanese literature'], confidence: 'varies',
    summary: 'A vast Javanese verse compendium of religion, customs, arts, travel and lore, composed in sung macapat metres by a court team and completed in 1814 at Surakarta; a major source on Javanese culture before the modern era.',
  },

  // ---- Arabic, Turkic, Persian and Hebrew medieval writing ----
  {
    id: 'work-anc-kitab-al-aghani', kind: 'work', name: 'Kitab al-Aghani (Book of Songs)', author: 'Abu al-Faraj al-Isfahani', year: 'c. 950 CE', language: 'Arabic', region: 'Abbasid world',
    genres: ['anthology', 'literary history', 'biographical compendium'], kw: ['kitab al-aghani', 'book of songs', 'abu al-faraj al-isfahani', 'arabic poetry songs', 'abbasid literary history'], confidence: 'established',
    summary: 'A vast Arabic anthology of poems and songs, with biographies of the poets and musicians and anecdotes about their lives, compiled by Abū al-Faraj al-Iṣfahānī in the tenth century; a prime source for early Arabic poetry, music and court culture.',
  },
  {
    id: 'work-anc-diwan-of-al-mutanabbi', kind: 'work', name: 'The Diwan of al-Mutanabbi', author: 'al-Mutanabbi', year: 'c. 950 CE', language: 'Arabic', region: 'Abbasid world',
    genres: ['poetry collection', 'qasida', 'panegyric'], kw: ['al-mutanabbi', 'diwan', 'qasida', 'arabic panegyric', 'abbasid poet', 'classical arabic poetry'], confidence: 'varies',
    summary: 'The collected poems of Abū al-Ṭayyib al-Mutanabbī, a tenth-century poet of the Abbasid world, whose praise poems and satires in the classical qasida form became standard models of Arabic verse and are among its most quoted lines.',
  },
  {
    id: 'work-anc-poems-of-yunus-emre', kind: 'work', name: 'The Poems of Yunus Emre', author: 'Yunus Emre (many poems attributed on tradition)', year: 'c. 1300 CE', language: 'Old Anatolian Turkish', region: 'Anatolia',
    genres: ['mystical poetry', 'Sufi lyric', 'folk-style verse'], kw: ['yunus emre', 'divan of yunus emre', 'anatolian sufi poet', 'turkish mystic poetry', 'old anatolian turkish'], confidence: 'varies',
    summary: 'Mystical poems in plain Turkish by Yunus Emre, a Sufi poet of Anatolia in the late thirteenth and early fourteenth centuries; his simple language and syllabic verse made him a founding voice of Turkish poetry, and many poems are attributed to him on tradition.',
  },
  {
    id: 'work-anc-fuzuli-leyla-and-majnun', kind: 'work', name: 'Leyla and Majnun (Leylā vü Mecnūn)', author: 'Fuzūlī', year: 'c. 1535 CE', language: 'Azerbaijani Turkic', region: 'Iraq and Anatolia',
    genres: ['romantic epic', 'mathnawi', 'Sufi love story'], kw: ['fuzuli', 'leyla and majnun', 'layla and majnun', 'azeri poetry', 'mathnawi', 'turkic literature', 'divan poetry'], confidence: 'varies',
    summary: 'A verse romance in Azerbaijani Turkic by the poet Fuzūlī, about 1535, that retells the old tale of the lovers Layla and Majnun with a Sufi emphasis on longing; a masterpiece of Turkic literature in the mathnawi form.',
  },
  {
    id: 'work-anc-baburnama', kind: 'work', name: 'The Baburnama', author: 'Bābur', year: 'c. 1530 CE', language: 'Chagatai Turkic', region: 'Central and South Asia',
    genres: ['memoir', 'autobiography', 'court chronicle'], kw: ['baburnama', 'babur', 'memoirs of babur', 'mughal founder', 'chagatai', 'central asian memoir'], confidence: 'established',
    summary: 'The memoirs of Bābur, founder of the Mughal dynasty, written in Chagatai Turkic in the early sixteenth century; known for candid, observant prose on landscapes, people, gardens and his own failures, and a landmark of early autobiography in Asia.',
  },
  {
    id: 'work-anc-navoi-khamsa', kind: 'work', name: 'The Khamsa of Alisher Navoi', author: 'Alisher Navoi', year: 'c. 1485 CE', language: 'Chagatai Turkic', region: 'Central Asia (Herat)',
    genres: ['mathnawi cycle', 'romantic epic', 'Turkic classical poetry'], kw: ['alisher navoi', 'navai', 'khamsa', 'chagatai poetry', 'uzbek classic', 'hamsa'], confidence: 'established',
    summary: 'A cycle of five long poems by Alisher Navoi, written in Chagatai Turkic in the 1480s as a Turkic answer to the Persian khamsa tradition of Nizami; a cornerstone of Central Asian literature.',
  },
  {
    id: 'work-anc-guide-for-the-perplexed', kind: 'work', name: 'The Guide for the Perplexed (Dalalat al-ha\'irin)', author: 'Moses Maimonides', year: 'c. 1190 CE', language: 'Judeo-Arabic', region: 'Egypt',
    genres: ['philosophical treatise', 'theology', 'letter-treatise'], kw: ['guide for the perplexed', 'maimonides', 'dalalat al-hairin', 'medieval jewish philosophy', 'rambam'], confidence: 'established',
    summary: 'A philosophical work written in Arabic with Hebrew letters by Moses Maimonides and addressed to a student, on reading scripture, divine attributes and the limits of human knowledge; a landmark of medieval Jewish thought and of the letter-treatise form.',
  },

  // ---- More from ancient Egypt ----
  {
    id: 'work-anc-tale-of-two-brothers', kind: 'work', name: 'The Tale of Two Brothers', author: 'Anonymous (Egyptian scribal tradition)', year: 'c. 1200 BCE', language: 'Egyptian (Late Egyptian)', region: 'Egypt',
    genres: ['folk tale', 'narrative', 'mythic tale'], kw: ['tale of two brothers', 'anpu and bata', 'papyrus d\'orbiney', 'egyptian folktale', 'new kingdom story'], confidence: 'varies',
    summary: 'A New Kingdom Egyptian story, preserved on a single papyrus of about 1200 BCE, about two brothers whose bond is tested; it contains motifs, such as a heart hidden in a tree, that are recognisable in folktales found much later and far away.',
  },
  {
    id: 'work-anc-eloquent-peasant', kind: 'work', name: 'The Eloquent Peasant', author: 'Anonymous (Egyptian scribal tradition)', year: 'c. 1850 BCE', language: 'Egyptian (Middle Egyptian)', region: 'Egypt',
    genres: ['narrative with speeches', 'wisdom literature', 'petition tale'], kw: ['eloquent peasant', 'khun-anup', 'middle kingdom', 'egyptian rhetoric', 'maat', 'justice story'], confidence: 'varies',
    summary: 'A Middle Kingdom Egyptian tale of a peasant robbed on the road who pleads nine times with an official for justice in elegant speeches; read as a showcase of Egyptian rhetoric and an early story built on an appeal to fairness.',
  },
  {
    id: 'work-anc-shipwrecked-sailor', kind: 'work', name: 'The Tale of the Shipwrecked Sailor', author: 'Anonymous (Egyptian scribal tradition)', year: 'c. 1900 BCE', language: 'Egyptian (Middle Egyptian)', region: 'Egypt',
    genres: ['adventure tale', 'frame story', 'travel narrative'], kw: ['shipwrecked sailor', 'egyptian adventure tale', 'island of the serpent', 'middle kingdom', 'frame tale'], confidence: 'varies',
    summary: 'A Middle Kingdom Egyptian story, written on one papyrus, in which a returning official is comforted by the anecdote of a sailor wrecked on an island of wonders; an early example of a tale within a tale and of the island-adventure plot.',
  },
  {
    id: 'work-anc-instruction-of-amenemope', kind: 'work', name: 'The Instruction of Amenemope', author: 'Anonymous (traditionally ascribed to the scribe Amenemope)', year: 'c. 1100 BCE', language: 'Egyptian (Late Egyptian)', region: 'Egypt',
    genres: ['wisdom literature', 'instruction', 'didactic poem'], kw: ['instruction of amenemope', 'egyptian wisdom', 'sebayt', 'proverbs parallels', 'new kingdom wisdom', 'thirty chapters'], confidence: 'varies',
    summary: 'An Egyptian wisdom text in thirty short chapters, offered by a scribe to his son on honesty, restraint and fair dealing; its likeness to a section of the biblical Book of Proverbs has made it a standard example in studies of ancient wisdom writing.',
  },

  // ---- More from ancient Greece ----
  {
    id: 'work-anc-homeric-hymns', kind: 'work', name: 'The Homeric Hymns', author: 'Anonymous (various poets; ascribed to Homer in antiquity)', year: 'c. 600 BCE', language: 'Ancient Greek', region: 'Greece',
    genres: ['hymn collection', 'epic hymn', 'mythological poetry'], kw: ['homeric hymns', 'hymn to demeter', 'hymn to hermes', 'hymn to apollo', 'greek hymns', 'greek myth poems'], confidence: 'varies',
    summary: 'A collection of thirty-three Greek hexameter hymns to the gods, ascribed in antiquity to Homer but composed by various poets over several centuries; several, such as the hymns to Demeter and Hermes, are miniature mythic narratives.',
  },
  {
    id: 'work-anc-poetics-aristotle', kind: 'work', name: 'Poetics', author: 'Aristotle', year: 'c. 335 BCE', language: 'Ancient Greek', region: 'Greece',
    genres: ['literary theory', 'poetics', 'treatise'], kw: ['aristotle poetics', 'tragedy', 'catharsis', 'mimesis', 'plot', 'peripeteia', 'hamartia', 'unity of action'], confidence: 'established',
    summary: 'A short Greek treatise on tragedy and epic, probably drawn from lecture notes, that treats plot as the soul of drama and discusses reversal, recognition and the arousal of pity and fear; the foundation of Western discussion of narrative structure.',
  },
  {
    id: 'work-anc-symposium-plato', kind: 'work', name: 'Symposium', author: 'Plato', year: 'c. 385 BCE', language: 'Ancient Greek', region: 'Greece',
    genres: ['dialogue', 'philosophical prose', 'speech cycle'], kw: ['plato symposium', 'dialogue on love', 'eros', 'aristophanes speech', 'socrates and diotima', 'ancient dialogue'], confidence: 'established',
    summary: 'A Platonic dialogue set at a dinner party where guests each give a speech in praise of love, ending with the account given by Socrates; admired for its dramatic framing and for the range of styles it holds within a single text.',
  },
  {
    id: 'work-anc-on-the-sublime', kind: 'work', name: 'On the Sublime (Peri hypsous)', author: 'Anonymous (traditionally called Longinus)', year: 'c. 50 CE', language: 'Ancient Greek', region: 'Roman Empire',
    genres: ['literary criticism', 'rhetorical treatise'], kw: ['on the sublime', 'longinus', 'peri hypsous', 'sublimity', 'ancient literary criticism', 'pseudo-longinus'], confidence: 'contested',
    summary: 'An ancient Greek essay on what makes writing lift and move its readers, by an author whose name and date are uncertain and who is traditionally called Longinus, probably of the first century CE; rediscovered in the Renaissance, it shaped later ideas of the sublime.',
  },
  {
    id: 'work-anc-lucian-a-true-story', kind: 'work', name: 'A True Story (Alethe diegemata)', author: 'Lucian of Samosata', year: 'c. 170 CE', language: 'Ancient Greek', region: 'Roman Empire',
    genres: ['satire', 'fantastic voyage', 'parody'], kw: ['lucian', 'true history', 'a true story', 'voyage to the moon', 'ancient science fiction', 'parody of travel tales'], confidence: 'established',
    summary: 'A comic prose narrative by Lucian of Samosata that parodies travellers\' tales by openly declaring that everything in it is false; its voyage to the Moon and its giant creatures make it a frequent starting point for histories of science fiction.',
  },
  {
    id: 'work-anc-daphnis-and-chloe', kind: 'work', name: 'Daphnis and Chloe', author: 'Longus', year: 'c. 200 CE', language: 'Ancient Greek', region: 'Roman Empire',
    genres: ['ancient novel', 'pastoral romance', 'Greek romance'], kw: ['daphnis and chloe', 'longus', 'greek romance', 'pastoral novel', 'ancient novel', 'lesbos'], confidence: 'varies',
    summary: 'A Greek prose romance of the second or third century CE about two foundlings raised among shepherds on Lesbos who slowly learn what their feelings mean; the main ancient example of pastoral fiction and an influence on later pastoral writing.',
  },
  {
    id: 'work-anc-aethiopica-heliodorus', kind: 'work', name: 'Aethiopica (An Ethiopian Story)', author: 'Heliodorus of Emesa', year: 'c. 250 CE', language: 'Ancient Greek', region: 'Roman Empire',
    genres: ['ancient novel', 'Greek romance', 'adventure romance'], kw: ['aethiopica', 'heliodorus', 'theagenes and charicleia', 'greek romance', 'ancient novel', 'in medias res'], confidence: 'varies',
    summary: 'A long Greek romance about separated lovers, famous for opening in the middle of the action and then looping back through narrated flashbacks; probably of the third or fourth century CE, it was much admired and imitated in Renaissance Europe.',
  },
  {
    id: 'work-anc-library-pseudo-apollodorus', kind: 'work', name: 'The Library (Bibliotheca)', author: 'Pseudo-Apollodorus (author unknown)', year: 'c. 150 CE', language: 'Ancient Greek', region: 'Roman Empire',
    genres: ['mythography', 'handbook', 'myth compendium'], kw: ['bibliotheca', 'apollodorus library', 'greek myth handbook', 'mythography', 'labours of heracles', 'theban cycle'], confidence: 'varies',
    summary: 'A handbook retelling Greek myths and heroic legends from the origin of the gods to the end of the Trojan War period, preserved under the name Apollodorus but of unknown authorship; a convenient single-source summary of the myth cycle for later writers.',
  },

  // ---- More from ancient Rome ----
  {
    id: 'work-anc-ars-poetica', kind: 'work', name: 'Ars Poetica (Art of Poetry)', author: 'Horace', year: 'c. 19 BCE', language: 'Latin', region: 'Rome',
    genres: ['verse epistle', 'literary criticism', 'poetics'], kw: ['horace ars poetica', 'art of poetry', 'in medias res', 'decorum', 'literary advice', 'epistle to the pisones'], confidence: 'varies',
    summary: 'A verse letter on the craft of poetry and drama, addressed to the Pisones, that urges decorum, unity and careful revision; it popularised phrases such as in medias res and shaped Renaissance and neoclassical criticism.',
  },
  {
    id: 'work-anc-pharsalia', kind: 'work', name: 'Pharsalia (The Civil War)', author: 'Lucan', year: 'c. 65 CE', language: 'Latin', region: 'Rome',
    genres: ['epic poem', 'historical epic', 'Latin epic'], kw: ['lucan', 'pharsalia', 'civil war epic', 'de bello civili', 'caesar and pompey', 'silver latin'], confidence: 'established',
    summary: 'A Latin epic in ten unfinished books on the civil war between Caesar and Pompey, by Lucan, who died young; it gives the gods no active part and treats the war as a political catastrophe.',
  },
  {
    id: 'work-anc-thebaid', kind: 'work', name: 'Thebaid', author: 'Statius', year: 'c. 92 CE', language: 'Latin', region: 'Rome',
    genres: ['epic poem', 'mythological epic'], kw: ['statius', 'thebaid', 'seven against thebes', 'latin epic', 'eteocles and polynices'], confidence: 'established',
    summary: 'A Latin epic in twelve books on the war between the sons of Oedipus and the expedition of the Seven against Thebes, published about 92 CE; its intense, rhetorical style influenced medieval and Renaissance poets.',
  },
  {
    id: 'work-anc-martial-epigrams', kind: 'work', name: 'Epigrams (Epigrammata)', author: 'Martial', year: 'c. 90 CE', language: 'Latin', region: 'Rome',
    genres: ['epigram collection', 'satiric verse'], kw: ['martial', 'epigrams', 'epigrammata', 'roman satire', 'short verse', 'wit'], confidence: 'established',
    summary: 'Twelve books of short Latin poems by Martial on city life, patrons, poets and manners in Rome, mostly brief and pointed; they fixed the modern idea of the epigram as a compact poem that ends on a witty turn.',
  },
  {
    id: 'work-anc-juvenal-satires', kind: 'work', name: 'Satires (Juvenal)', author: 'Juvenal', year: 'c. 110 CE', language: 'Latin', region: 'Rome',
    genres: ['satire', 'verse satire'], kw: ['juvenal', 'satires', 'roman satire', 'bread and circuses', 'indignation', 'sixteen satires'], confidence: 'varies',
    summary: 'Sixteen Latin verse satires attacking corruption, vanity and hypocrisy in Roman society, composed in the early second century CE; its angry, rhetorical tone set one of the two main models of satire, against the gentler manner of Horace.',
  },
  {
    id: 'work-anc-vulgate', kind: 'work', name: 'The Vulgate', author: 'Jerome (principal translator and reviser)', year: 'c. 405 CE', language: 'Latin', region: 'Roman Empire',
    genres: ['translation', 'scripture translation'], kw: ['vulgate', 'jerome', 'latin bible', 'bible translation', 'medieval latin bible'], confidence: 'varies',
    summary: 'The Latin version of the Christian Bible, largely translated and revised by Jerome from Hebrew and Greek in the late fourth and early fifth centuries; it served as the standard Bible of Western Europe for a thousand years and shaped medieval Latin prose and vocabulary.',
  },
];
