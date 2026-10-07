// Notable works: poetry collections, long poems, verse epics, sonnet sequences, verse novels and anthologies.
// Reference only: each record names a real work, its author, a first-publication or approximate year and the original language,
// with one neutral sentence on what it is and why it matters. No quotations, no prizes or rankings claimed.
// The oldest classical epics, sacred poetry and the Dante / Beowulf / Chaucer-tale tradition are held in the ancient and medieval
// works file; this file covers the poetry that sits around them and the later centuries.
// Years marked "c." are approximate. Where a title, date or text history varies by edition, `confidence` is `varies`.
// See ../README.md for the record format.
export const PREFIX = 'work-poem-';
export default [
  // ---- Medieval and Renaissance Europe ----
  {
    id: 'work-poem-piers-plowman', kind: 'work', name: 'Piers Plowman', author: 'William Langland (traditional attribution)', year: 'c. 1370 CE', language: 'Middle English', region: 'England',
    genres: ['dream vision', 'allegory', 'alliterative verse'], kw: ['langland', 'piers plowman', 'alliterative revival', 'middle english poem', 'dream allegory'], confidence: 'varies',
    summary: 'A Middle English alliterative dream-vision poem in which a dreamer searches for a good Christian life; it survives in three main versions and is a central work of the alliterative revival.',
  },
  {
    id: 'work-poem-sir-gawain-green-knight', kind: 'work', name: 'Sir Gawain and the Green Knight', author: 'Anonymous (the Gawain poet)', year: 'c. 1390 CE', language: 'Middle English', region: 'England',
    genres: ['alliterative verse', 'Arthurian romance', 'narrative poem'], kw: ['gawain', 'green knight', 'arthurian poem', 'middle english romance', 'alliterative'], confidence: 'varies',
    summary: 'An alliterative Arthurian romance about a challenge at Camelot and a knight\'s test of honour, preserved in a single manuscript beside Pearl and a high point of Middle English verse craft.',
  },
  {
    id: 'work-poem-pearl', kind: 'work', name: 'Pearl', author: 'Anonymous (the Pearl poet)', year: 'c. 1380 CE', language: 'Middle English', region: 'England',
    genres: ['dream vision', 'elegy', 'stanzaic poem'], kw: ['pearl poet', 'middle english elegy', 'dream vision', 'linked stanzas', 'grief poem'], confidence: 'varies',
    summary: 'A Middle English dream-vision elegy in tightly linked stanzas, in which a mourning narrator meets a lost loved one; it survives in the manuscript shared with Sir Gawain and is a landmark of medieval stanza craft.',
  },
  {
    id: 'work-poem-troilus-and-criseyde', kind: 'work', name: 'Troilus and Criseyde', author: 'Geoffrey Chaucer', year: 'c. 1385 CE', language: 'Middle English', region: 'England',
    genres: ['narrative poem', 'courtly love poem', 'rhyme royal'], kw: ['chaucer', 'troilus', 'criseyde', 'rhyme royal', 'trojan war love story'], confidence: 'varies',
    summary: 'A long narrative poem in rhyme royal, adapted from an Italian source by Boccaccio, about love and betrayal during the siege of Troy; one of Chaucer\'s major finished works.',
  },
  {
    id: 'work-poem-roman-de-la-rose', kind: 'work', name: 'Le Roman de la Rose (The Romance of the Rose)', author: 'Guillaume de Lorris and Jean de Meun', year: 'c. 1230 CE', language: 'Old French', region: 'France',
    genres: ['dream allegory', 'courtly love poem', 'narrative poem'], kw: ['romance of the rose', 'courtly love', 'dream allegory', 'old french poem', 'medieval allegory'], confidence: 'varies',
    summary: 'An Old French dream allegory of courtly love begun by Guillaume de Lorris and continued by Jean de Meun decades later in a more learned, satirical tone; one of the most widely copied secular poems of the Middle Ages.',
  },
  {
    id: 'work-poem-lais-marie-de-france', kind: 'work', name: 'The Lais of Marie de France', author: 'Marie de France', year: 'c. 1170 CE', language: 'Old French (Anglo-Norman)', region: 'England and France',
    genres: ['lai', 'narrative poem', 'courtly romance'], kw: ['marie de france', 'lais', 'breton lai', 'medieval short romance', 'anglo-norman'], confidence: 'varies',
    summary: 'Twelve short narrative poems in rhyming couplets, drawn from Breton tales of love, magic and fate; among the earliest surviving examples of the lai, by a poet of whom little is known.',
  },
  {
    id: 'work-poem-carmina-burana', kind: 'work', name: 'Carmina Burana', author: 'Anonymous (wandering clerics and student poets)', year: 'c. 1230 CE', language: 'Medieval Latin and Middle High German', region: 'Bavaria (manuscript)',
    genres: ['medieval song collection', 'goliardic verse', 'lyric poetry'], kw: ['carmina burana', 'goliards', 'medieval latin songs', 'codex buranus', 'drinking songs'], confidence: 'varies',
    summary: 'A thirteenth-century manuscript collection of Latin and some German songs on love, drink, satire and the seasons; its texts are widely known through a twentieth-century musical setting.',
  },
  {
    id: 'work-poem-nibelungenlied', kind: 'work', name: 'The Nibelungenlied', author: 'Anonymous', year: 'c. 1200 CE', language: 'Middle High German', region: 'German-speaking Europe',
    genres: ['epic poem', 'heroic epic', 'medieval German literature'], kw: ['nibelungen', 'siegfried', 'kriemhild', 'heroic epic', 'middle high german'], confidence: 'varies',
    summary: 'A Middle High German epic in rhyming four-line stanzas about a hero\'s murder and a queen\'s revenge; composed around 1200 and a foundation of German heroic literature.',
  },
  {
    id: 'work-poem-parzival', kind: 'work', name: 'Parzival', author: 'Wolfram von Eschenbach', year: 'c. 1210 CE', language: 'Middle High German', region: 'German-speaking Europe',
    genres: ['verse romance', 'Grail romance', 'epic poem'], kw: ['wolfram', 'parzival', 'grail', 'arthurian', 'middle high german romance'], confidence: 'varies',
    summary: 'A Middle High German verse romance about the Grail knight, adapted from Chrétien de Troyes and developed at far greater length; a major work of German courtly literature.',
  },
  {
    id: 'work-poem-cantar-de-mio-cid', kind: 'work', name: 'Cantar de mio Cid (The Poem of the Cid)', author: 'Anonymous', year: 'c. 1200 CE', language: 'Old Spanish (Castilian)', region: 'Castile',
    genres: ['epic poem', 'cantar de gesta', 'heroic epic'], kw: ['cid', 'el cid', 'cantar de gesta', 'old spanish epic', 'castilian epic'], confidence: 'varies',
    summary: 'The oldest surviving major Castilian epic, following an exiled nobleman who regains his honour through campaigns and marriages; its date and composition are debated.',
  },
  {
    id: 'work-poem-libro-de-buen-amor', kind: 'work', name: 'Libro de buen amor (The Book of Good Love)', author: 'Juan Ruiz, Archpriest of Hita', year: 'c. 1330 CE', language: 'Old Spanish (Castilian)', region: 'Castile',
    genres: ['narrative verse', 'satire', 'medieval Spanish poetry'], kw: ['archpriest of hita', 'juan ruiz', 'good love', 'medieval spanish satire', 'fables and lyrics'], confidence: 'varies',
    summary: 'A medieval Castilian poem-collection of comic love episodes, fables, satire and religious lyrics framed as a confession; known for its ironic, shifting narrator and lively mixture of tones.',
  },
  {
    id: 'work-poem-coplas-por-la-muerte-de-su-padre', kind: 'work', name: 'Coplas por la muerte de su padre', author: 'Jorge Manrique', year: 'c. 1476 CE', language: 'Spanish', region: 'Castile',
    genres: ['elegy', 'meditative poem', 'copla'], kw: ['jorge manrique', 'coplas', 'elegy for father', 'spanish elegy', 'copla manriqueña'], confidence: 'varies',
    summary: 'An elegy in forty stanzas for the poet\'s father, meditating on how life, fame and fortune pass; its stanza form is still called after the poem in Spanish.',
  },
  {
    id: 'work-poem-canzoniere', kind: 'work', name: 'Canzoniere (Rerum vulgarium fragmenta)', author: 'Francesco Petrarca (Petrarch)', year: 'c. 1374 CE', language: 'Italian', region: 'Italy',
    genres: ['sonnet sequence', 'love poetry', 'lyric poetry'], kw: ['petrarch', 'laura', 'petrarchan sonnet', 'sonnet sequence', 'italian love poems'], confidence: 'varies',
    summary: 'A collection of 366 Italian poems, mostly sonnets, centred on the poet\'s love for Laura; its model of the sonnet sequence and its imagery shaped European love poetry for centuries.',
  },
  {
    id: 'work-poem-vita-nuova', kind: 'work', name: 'Vita nuova (The New Life)', author: 'Dante Alighieri', year: 'c. 1294 CE', language: 'Italian (Tuscan)', region: 'Florence',
    genres: ['prosimetrum', 'love poetry', 'sonnet collection'], kw: ['dante', 'beatrice', 'vita nuova', 'prose and verse', 'early dante'], confidence: 'varies',
    summary: 'A short work of verse and linking prose in which Dante tells and comments on his youthful love poems for Beatrice; an early model of a poet explaining his own poems.',
  },
  {
    id: 'work-poem-orlando-innamorato', kind: 'work', name: 'Orlando innamorato', author: 'Matteo Maria Boiardo', year: 1483, language: 'Italian', region: 'Ferrara',
    genres: ['chivalric epic', 'ottava rima', 'romance epic'], kw: ['boiardo', 'orlando', 'roland in love', 'chivalric romance', 'ottava rima'], confidence: 'varies',
    summary: 'An unfinished Italian chivalric epic in ottava rima that joins Charlemagne\'s court with love and magical adventure; its first two books appeared in 1483 and Ariosto later continued the story.',
  },
  {
    id: 'work-poem-orlando-furioso', kind: 'work', name: 'Orlando Furioso', author: 'Ludovico Ariosto', year: 1516, language: 'Italian', region: 'Ferrara',
    genres: ['chivalric epic', 'ottava rima', 'comic epic'], kw: ['ariosto', 'orlando furioso', 'mad roland', 'ottava rima', 'renaissance epic'], confidence: 'varies',
    summary: 'A sprawling comic-heroic epic in ottava rima following knights, lovers and enchantments across the world; first published in 1516 and revised in 1521 and 1532, it was a model for later Renaissance epic.',
  },
  {
    id: 'work-poem-gerusalemme-liberata', kind: 'work', name: 'Gerusalemme liberata (Jerusalem Delivered)', author: 'Torquato Tasso', year: 1581, language: 'Italian', region: 'Ferrara',
    genres: ['epic poem', 'ottava rima', 'Renaissance epic'], kw: ['tasso', 'jerusalem delivered', 'crusade epic', 'ottava rima', 'italian epic'], confidence: 'established',
    summary: 'A Renaissance epic in ottava rima about the First Crusade, blending history with romance episodes and the epic manner of Virgil; widely read across Europe in the centuries that followed.',
  },
  {
    id: 'work-poem-os-lusiadas', kind: 'work', name: 'Os Lusíadas (The Lusiads)', author: 'Luís de Camões', year: 1572, language: 'Portuguese', region: 'Portugal',
    genres: ['epic poem', 'national epic', 'ottava rima'], kw: ['camoes', 'lusiads', 'vasco da gama', 'portuguese epic', 'national epic'], confidence: 'established',
    summary: 'The Portuguese national epic, in ten cantos of ottava rima, celebrating Vasco da Gama\'s voyage to India and Portugal\'s history; modelled on Virgil and published in 1572.',
  },
  {
    id: 'work-poem-la-araucana', kind: 'work', name: 'La Araucana', author: 'Alonso de Ercilla', year: 1569, language: 'Spanish', region: 'Spain and Chile',
    genres: ['epic poem', 'historical epic', 'octave verse'], kw: ['ercilla', 'araucana', 'mapuche', 'conquest of chile', 'spanish epic'], confidence: 'varies',
    summary: 'An epic poem in octaves on the Spanish conquest of Chile and the Mapuche resistance, written by a soldier who took part in the campaigns; published in parts between 1569 and 1589.',
  },
  {
    id: 'work-poem-noche-oscura', kind: 'work', name: 'Noche oscura (Dark Night)', author: 'Juan de la Cruz (John of the Cross)', year: 'c. 1578 CE', language: 'Spanish', region: 'Spain',
    genres: ['mystical poetry', 'lyric poem', 'lira stanza'], kw: ['john of the cross', 'san juan de la cruz', 'dark night', 'spanish mystic poet', 'lira'], confidence: 'varies',
    summary: 'A short Spanish mystical poem in lira stanzas, written around 1578, describing a night journey toward union with the beloved; the poet later wrote long prose commentaries on it.',
  },
  {
    id: 'work-poem-soledades-gongora', kind: 'work', name: 'Soledades', author: 'Luis de Góngora', year: 'c. 1613 CE', language: 'Spanish', region: 'Spain',
    genres: ['baroque poetry', 'silva', 'long poem'], kw: ['gongora', 'soledades', 'culteranismo', 'spanish baroque', 'difficult poetry'], confidence: 'varies',
    summary: 'A long, ornate Spanish poem in free-rhyming silvas about a shipwrecked youth among rural people; the high point of the dense, Latinate style called culteranismo, circulated in manuscript before it was printed.',
  },
  {
    id: 'work-poem-primero-sueno', kind: 'work', name: 'Primero sueño (First Dream)', author: 'Sor Juana Inés de la Cruz', year: 1692, language: 'Spanish', region: 'New Spain (Mexico)',
    genres: ['philosophical poem', 'baroque poetry', 'silva'], kw: ['sor juana', 'first dream', 'colonial mexican poetry', 'baroque philosophical poem', 'nun poet'], confidence: 'varies',
    summary: 'A long philosophical poem in silvas in which the soul tries to grasp the whole of creation in a single night of sleep; the most ambitious poem by the Mexican nun and scholar.',
  },
  {
    id: 'work-poem-les-amours-ronsard', kind: 'work', name: 'Les Amours', author: 'Pierre de Ronsard', year: 1552, language: 'French', region: 'France',
    genres: ['sonnet sequence', 'love poetry', 'Renaissance lyric'], kw: ['ronsard', 'cassandre', 'pleiade', 'french sonnets', 'renaissance love poems'], confidence: 'established',
    summary: 'A sonnet sequence addressed to Cassandre, a leading book of the Pléiade group of French poets who sought to enrich French with classical and Italian models.',
  },
  {
    id: 'work-poem-les-regrets-du-bellay', kind: 'work', name: 'Les Regrets', author: 'Joachim du Bellay', year: 1558, language: 'French', region: 'France',
    genres: ['sonnet sequence', 'satirical poetry', 'Renaissance lyric'], kw: ['du bellay', 'regrets', 'rome sonnets', 'french sonnets', 'exile poetry'], confidence: 'established',
    summary: 'A French sonnet sequence written during the poet\'s stay in Rome, mixing homesickness, irony and sharp social observation; notable for its plain, conversational voice.',
  },
  {
    id: 'work-poem-le-testament-villon', kind: 'work', name: 'Le Testament (Le Grand Testament)', author: 'François Villon', year: 1461, language: 'French', region: 'France',
    genres: ['mock testament', 'ballade', 'late medieval poetry'], kw: ['villon', 'grand testament', 'ballade', 'medieval french poet', 'mock will'], confidence: 'varies',
    summary: 'A long French poem framed as the poet\'s will, mixing bequests, ballades and rondeaux that look back on youth and mortality; its first-person voice makes it a landmark of late medieval verse.',
  },
  {
    id: 'work-poem-fables-la-fontaine', kind: 'work', name: 'Fables (La Fontaine)', author: 'Jean de La Fontaine', year: 1668, language: 'French', region: 'France',
    genres: ['verse fable', 'satire', 'beast fable'], kw: ['la fontaine', 'fables in verse', 'animal fables', 'french fables', 'verse fable'], confidence: 'varies',
    summary: 'Verse fables in French, many reworking Aesop and other older sources, whose animal characters comment wryly on court and society; the first collection appeared in 1668 and more books followed.',
  },
  {
    id: 'work-poem-mireio', kind: 'work', name: 'Mirèio (Mireille)', author: 'Frédéric Mistral', year: 1859, language: 'Occitan (Provençal)', region: 'Provence',
    genres: ['narrative poem', 'verse epic', 'regional literature'], kw: ['mistral', 'mireille', 'provencal', 'occitan poem', 'felibrige'], confidence: 'established',
    summary: 'A long Provençal narrative poem in twelve cantos about a farmer\'s daughter and a basket-maker\'s son; the flagship work of the Occitan revival of the nineteenth century.',
  },
  {
    id: 'work-poem-cantares-gallegos', kind: 'work', name: 'Cantares gallegos', author: 'Rosalía de Castro', year: 1863, language: 'Galician', region: 'Galicia',
    genres: ['lyric poetry', 'folk-inspired verse', 'regional literature'], kw: ['rosalia de castro', 'galician poetry', 'rexurdimento', 'cantares', 'galician language'], confidence: 'established',
    summary: 'A collection of poems in Galician that helped restore the language to serious literature; a founding book of the nineteenth-century Galician revival.',
  },
  // ---- English verse: Renaissance to the eighteenth century ----
  {
    id: 'work-poem-tottels-miscellany', kind: 'work', name: 'Songes and Sonettes (Tottel\'s Miscellany)', author: 'Richard Tottel (publisher); poems by Henry Howard, Thomas Wyatt and others', year: 1557, language: 'English', region: 'England',
    genres: ['anthology', 'sonnet', 'courtly verse'], kw: ['tottel', 'wyatt', 'surrey', 'early sonnets', 'english anthology'], confidence: 'established',
    summary: 'The first printed English anthology of courtly verse, bringing Wyatt\'s and Surrey\'s poems into print in 1557 and helping to introduce the sonnet to English readers.',
  },
  {
    id: 'work-poem-shepheardes-calender', kind: 'work', name: 'The Shepheardes Calender', author: 'Edmund Spenser', year: 1579, language: 'English', region: 'England',
    genres: ['pastoral', 'eclogue', 'poetic cycle'], kw: ['spenser', 'shepheardes calender', 'pastoral', 'eclogues', 'twelve months'], confidence: 'established',
    summary: 'Twelve pastoral poems, one for each month, in a deliberately varied range of metres; it announced Spenser as a major English poet and carried an early set of notes by a commentator.',
  },
  {
    id: 'work-poem-faerie-queene', kind: 'work', name: 'The Faerie Queene', author: 'Edmund Spenser', year: 1590, language: 'English', region: 'England',
    genres: ['epic poem', 'allegory', 'Spenserian stanza'], kw: ['spenser', 'faerie queene', 'spenserian stanza', 'allegorical epic', 'elizabethan epic'], confidence: 'established',
    summary: 'An unfinished allegorical epic in nine-line stanzas, a form devised for it, about knights who embody virtues, written in praise of Elizabeth I; Books I to III appeared in 1590 and IV to VI in 1596.',
  },
  {
    id: 'work-poem-astrophil-and-stella', kind: 'work', name: 'Astrophil and Stella', author: 'Sir Philip Sidney', year: 1591, language: 'English', region: 'England',
    genres: ['sonnet sequence', 'love poetry', 'Elizabethan lyric'], kw: ['sidney', 'astrophil', 'stella', 'sonnet sequence', 'elizabethan sonnets'], confidence: 'established',
    summary: 'A sequence of 108 sonnets and eleven songs in which a lover speaks of his passion and frustration; published after the author\'s death, it set off the English sonnet-sequence fashion of the 1590s.',
  },
  {
    id: 'work-poem-amoretti-and-epithalamion', kind: 'work', name: 'Amoretti and Epithalamion', author: 'Edmund Spenser', year: 1595, language: 'English', region: 'England',
    genres: ['sonnet sequence', 'wedding poem', 'Spenserian sonnet'], kw: ['spenser', 'amoretti', 'epithalamion', 'spenserian sonnet', 'wedding ode'], confidence: 'established',
    summary: 'A courtship sonnet sequence of 89 poems, in the interlocking Spenserian rhyme scheme, followed by a long wedding song; the two were published together in 1595.',
  },
  {
    id: 'work-poem-hero-and-leander', kind: 'work', name: 'Hero and Leander', author: 'Christopher Marlowe', year: 1598, language: 'English', region: 'England',
    genres: ['narrative poem', 'epyllion', 'heroic couplets'], kw: ['marlowe', 'hero and leander', 'epyllion', 'ovidian poem', 'chapman'], confidence: 'varies',
    summary: 'An unfinished erotic narrative poem in heroic couplets, retelling a classical love story; printed in 1598 after Marlowe\'s death and later continued by George Chapman.',
  },
  {
    id: 'work-poem-shakespeares-sonnets', kind: 'work', name: 'Shakespeare\'s Sonnets', author: 'William Shakespeare', year: 1609, language: 'English', region: 'England',
    genres: ['sonnet sequence', 'love poetry', 'Shakespearean sonnet'], kw: ['shakespeare', 'sonnets', 'dark lady', 'fair youth', 'shakespearean sonnet'], confidence: 'established',
    summary: 'A sequence of 154 sonnets, published in 1609, in which the speaker addresses a beloved young man and a dark-haired woman; the order, the dedication and the identities behind them are still debated.',
  },
  {
    id: 'work-poem-donne-songs-and-sonnets', kind: 'work', name: 'Songs and Sonnets', author: 'John Donne', year: 1633, language: 'English', region: 'England',
    genres: ['metaphysical poetry', 'love lyric', 'lyric poetry'], kw: ['donne', 'metaphysical poets', 'conceit', 'love lyrics', 'songs and sonets'], confidence: 'varies',
    summary: 'The love lyrics of Donne, circulated in manuscript and printed after his death in 1633; central to metaphysical poetry for their argumentative voice and daring comparisons. The group title comes from early printed editions.',
  },
  {
    id: 'work-poem-herbert-the-temple', kind: 'work', name: 'The Temple', author: 'George Herbert', year: 1633, language: 'English', region: 'England',
    genres: ['devotional poetry', 'metaphysical poetry', 'shaped poetry'], kw: ['herbert', 'the temple', 'devotional verse', 'pattern poems', 'easter wings'], confidence: 'established',
    summary: 'A collection of devotional poems, published after the poet\'s death, notable for plain speech, inventive stanza shapes and a few poems arranged on the page in the form of their subjects.',
  },
  {
    id: 'work-poem-herrick-hesperides', kind: 'work', name: 'Hesperides', author: 'Robert Herrick', year: 1648, language: 'English', region: 'England',
    genres: ['lyric poetry', 'epigram', 'Cavalier poetry'], kw: ['herrick', 'hesperides', 'cavalier poets', 'carpe diem', 'country life verse'], confidence: 'established',
    summary: 'A very large collection of short lyrics and epigrams on love, country customs, festivals and the passing of time; a central volume of seventeenth-century English lyric.',
  },
  {
    id: 'work-poem-the-tenth-muse', kind: 'work', name: 'The Tenth Muse Lately Sprung Up in America', author: 'Anne Bradstreet', year: 1650, language: 'English', region: 'England and North America',
    genres: ['lyric poetry', 'colonial poetry', 'verse collection'], kw: ['bradstreet', 'tenth muse', 'colonial american poet', 'puritan poetry', 'first american poetry'], confidence: 'established',
    summary: 'A volume of poems by a woman living in the Massachusetts colony, printed in London in 1650 without her direct supervision; often described as the first book of poetry by an author in English North America.',
  },
  {
    id: 'work-poem-paradise-lost', kind: 'work', name: 'Paradise Lost', author: 'John Milton', year: 1667, language: 'English', region: 'England',
    genres: ['epic poem', 'blank verse', 'religious epic'], kw: ['milton', 'paradise lost', 'blank verse epic', 'fall of man', 'satan'], confidence: 'established',
    summary: 'An epic in blank verse that retells the biblical fall of humankind; first printed in ten books in 1667 and reorganised into twelve in 1674, it is a foundation of English epic poetry.',
  },
  {
    id: 'work-poem-absalom-and-achitophel', kind: 'work', name: 'Absalom and Achitophel', author: 'John Dryden', year: 1681, language: 'English', region: 'England',
    genres: ['verse satire', 'heroic couplets', 'political poem'], kw: ['dryden', 'political satire', 'heroic couplet', 'restoration satire', 'biblical allegory'], confidence: 'established',
    summary: 'A political satire in heroic couplets that uses a biblical story as cover for a crisis in Restoration England; a model of the poised, sharply drawn verse portrait.',
  },
  {
    id: 'work-poem-marvell-miscellaneous-poems', kind: 'work', name: 'Miscellaneous Poems (Marvell)', author: 'Andrew Marvell', year: 1681, language: 'English', region: 'England',
    genres: ['metaphysical poetry', 'lyric poetry', 'political verse'], kw: ['marvell', 'to his coy mistress', 'garden poem', 'horatian ode', 'metaphysical poet'], confidence: 'established',
    summary: 'A posthumous collection that preserves most of Marvell\'s best-known poems, including To His Coy Mistress and the garden and political poems; the lyrics were largely unprinted in his lifetime.',
  },
  {
    id: 'work-poem-essay-on-criticism', kind: 'work', name: 'An Essay on Criticism', author: 'Alexander Pope', year: 1711, language: 'English', region: 'England',
    genres: ['didactic poem', 'heroic couplets', 'verse essay'], kw: ['pope', 'essay on criticism', 'heroic couplets', 'poetry about poetry', 'augustan verse'], confidence: 'established',
    summary: 'A didactic poem in heroic couplets on the art of judging and writing poetry, written when Pope was young; it is the source of many sayings still in circulation.',
  },
  {
    id: 'work-poem-rape-of-the-lock', kind: 'work', name: 'The Rape of the Lock', author: 'Alexander Pope', year: 1712, language: 'English', region: 'England',
    genres: ['mock-heroic poem', 'heroic couplets', 'satire'], kw: ['pope', 'rape of the lock', 'mock epic', 'mock heroic', 'augustan satire'], confidence: 'varies',
    summary: 'A mock-heroic poem in heroic couplets that treats a quarrel over a snipped lock of hair with the machinery of epic; first published in two cantos in 1712 and expanded to five in 1714.',
  },
  {
    id: 'work-poem-essay-on-man', kind: 'work', name: 'An Essay on Man', author: 'Alexander Pope', year: 1733, language: 'English', region: 'England',
    genres: ['philosophical poem', 'heroic couplets', 'verse essay'], kw: ['pope', 'essay on man', 'philosophical verse', 'great chain of being', 'augustan poetry'], confidence: 'varies',
    summary: 'A philosophical poem in heroic couplets, in four epistles, on order, happiness and humankind\'s place in the world; published in parts from 1733 to 1734.',
  },
  {
    id: 'work-poem-vanity-of-human-wishes', kind: 'work', name: 'The Vanity of Human Wishes', author: 'Samuel Johnson', year: 1749, language: 'English', region: 'England',
    genres: ['verse satire', 'imitation', 'heroic couplets'], kw: ['samuel johnson', 'vanity of human wishes', 'imitation of juvenal', 'moral satire', 'heroic couplets'], confidence: 'established',
    summary: 'A moral satire in heroic couplets, imitating a satire by Juvenal, on the way ambition, fame and long life fail to bring happiness; among the most serious English poems of its century.',
  },
  {
    id: 'work-poem-elegy-country-churchyard', kind: 'work', name: 'Elegy Written in a Country Churchyard', author: 'Thomas Gray', year: 1751, language: 'English', region: 'England',
    genres: ['elegy', 'meditative poem', 'quatrains'], kw: ['thomas gray', 'country churchyard', 'elegy', 'graveyard poetry', 'quatrain poem'], confidence: 'established',
    summary: 'A meditative elegy in quatrains on death and the unrecorded lives of the humble; among the most quoted English poems of the eighteenth century.',
  },
  {
    id: 'work-poem-wheatley-poems-on-various-subjects', kind: 'work', name: 'Poems on Various Subjects, Religious and Moral', author: 'Phillis Wheatley', year: 1773, language: 'English', region: 'London and Boston',
    genres: ['verse collection', 'elegy', 'neoclassical poetry'], kw: ['phillis wheatley', 'african american poetry', 'colonial poet', 'poems on various subjects', 'first book by black poet'], confidence: 'established',
    summary: 'The collection of a young enslaved woman, published in London in 1773 and generally regarded as the first book of poems by an African American author.',
  },
  {
    id: 'work-poem-elegiac-sonnets', kind: 'work', name: 'Elegiac Sonnets', author: 'Charlotte Smith', year: 1784, language: 'English', region: 'England',
    genres: ['sonnet collection', 'Romantic poetry', 'elegy'], kw: ['charlotte smith', 'elegiac sonnets', 'sonnet revival', 'sensibility', 'women romantic poets'], confidence: 'established',
    summary: 'A sonnet collection, first published in 1784 and enlarged through many editions, whose melancholy first-person voice helped revive the form for the Romantic generation.',
  },
  {
    id: 'work-poem-the-task', kind: 'work', name: 'The Task', author: 'William Cowper', year: 1785, language: 'English', region: 'England',
    genres: ['blank verse', 'meditative poem', 'descriptive poetry'], kw: ['cowper', 'the task', 'blank verse', 'domestic poetry', 'pre-romantic'], confidence: 'established',
    summary: 'A long blank-verse poem in six books that begins with a sofa and wanders through country life, nature and moral reflection; widely read and a quiet influence on later Romantic poets.',
  },
  {
    id: 'work-poem-burns-kilmarnock-poems', kind: 'work', name: 'Poems, Chiefly in the Scottish Dialect', author: 'Robert Burns', year: 1786, language: 'Scots and English', region: 'Scotland',
    genres: ['lyric poetry', 'song', 'Scots verse'], kw: ['burns', 'kilmarnock edition', 'scots poetry', 'robert burns', 'scottish dialect poems'], confidence: 'established',
    summary: 'Burns\'s first book, printed at Kilmarnock in 1786, which brought songs, satires and verse epistles in Scots to a wide readership and established him as Scotland\'s best-known poet.',
  },
  {
    id: 'work-poem-songs-of-innocence-and-of-experience', kind: 'work', name: 'Songs of Innocence and of Experience', author: 'William Blake', year: 1794, language: 'English', region: 'England',
    genres: ['illuminated poetry', 'lyric poetry', 'Romantic poetry'], kw: ['blake', 'songs of innocence', 'songs of experience', 'illuminated book', 'tyger'], confidence: 'varies',
    summary: 'Short lyrics paired as two contrary states of the soul, engraved and printed by Blake with his own illustrations; Songs of Innocence appeared in 1789 and the combined book in 1794.',
  },
  // ---- Romantic and Victorian English verse ----
  {
    id: 'work-poem-lyrical-ballads', kind: 'work', name: 'Lyrical Ballads', author: 'William Wordsworth and Samuel Taylor Coleridge', year: 1798, language: 'English', region: 'England',
    genres: ['ballad', 'Romantic poetry', 'lyric poetry'], kw: ['wordsworth', 'coleridge', 'lyrical ballads', 'romantic manifesto', 'ancient mariner'], confidence: 'established',
    summary: 'A joint volume of poems in plain, speech-based language, opening with Coleridge\'s Rime of the Ancient Mariner; its 1800 edition added a Preface that is often treated as a founding statement of English Romanticism.',
  },
  {
    id: 'work-poem-the-prelude', kind: 'work', name: 'The Prelude', author: 'William Wordsworth', year: 1850, language: 'English', region: 'England',
    genres: ['autobiographical poem', 'blank verse', 'Romantic poetry'], kw: ['wordsworth', 'the prelude', 'growth of a poet mind', 'blank verse autobiography', 'romantic epic'], confidence: 'varies',
    summary: 'A long autobiographical poem in blank verse on the growth of a poet\'s mind; drafted from 1798, reworked over decades and published after Wordsworth\'s death in 1850, with earlier versions printed later.',
  },
  {
    id: 'work-poem-childe-harolds-pilgrimage', kind: 'work', name: 'Childe Harold\'s Pilgrimage', author: 'Lord Byron', year: 1812, language: 'English', region: 'England',
    genres: ['narrative poem', 'travel poem', 'Spenserian stanza'], kw: ['byron', 'childe harold', 'byronic hero', 'spenserian stanza', 'romantic travel poem'], confidence: 'varies',
    summary: 'A long travel poem in Spenserian stanzas following a restless young wanderer across Europe; its first two cantos appeared in 1812 and made Byron famous, and two more followed later.',
  },
  {
    id: 'work-poem-don-juan', kind: 'work', name: 'Don Juan', author: 'Lord Byron', year: 1819, language: 'English', region: 'England',
    genres: ['satirical epic', 'ottava rima', 'comic verse'], kw: ['byron', 'don juan', 'ottava rima', 'comic epic', 'digressive satire'], confidence: 'varies',
    summary: 'An unfinished comic epic in ottava rima that follows a young man through adventures while its narrator digresses on society and poetry; the first cantos appeared in 1819 and work stopped at the poet\'s death in 1824.',
  },
  {
    id: 'work-poem-the-lady-of-the-lake', kind: 'work', name: 'The Lady of the Lake', author: 'Sir Walter Scott', year: 1810, language: 'English', region: 'Scotland',
    genres: ['narrative poem', 'verse romance', 'Romantic poetry'], kw: ['walter scott', 'lady of the lake', 'highland poem', 'narrative verse', 'loch katrine'], confidence: 'established',
    summary: 'A six-canto narrative poem of chase, feud and rescue set in the Scottish Highlands; a best-seller on publication that fed the Romantic image of the Highlands and of verse romance.',
  },
  {
    id: 'work-poem-clare-poems-descriptive-of-rural-life', kind: 'work', name: 'Poems Descriptive of Rural Life and Scenery', author: 'John Clare', year: 1820, language: 'English', region: 'England',
    genres: ['nature poetry', 'rural poetry', 'lyric poetry'], kw: ['john clare', 'peasant poet', 'northamptonshire', 'nature poems', 'enclosure'], confidence: 'established',
    summary: 'The first book by a farm labourer from Northamptonshire, whose precise observation of fields, birds and seasons and use of dialect words later earned him a lasting place among English nature poets.',
  },
  {
    id: 'work-poem-keats-lamia-isabella-eve-of-st-agnes', kind: 'work', name: 'Lamia, Isabella, The Eve of St. Agnes, and Other Poems', author: 'John Keats', year: 1820, language: 'English', region: 'England',
    genres: ['ode', 'narrative poem', 'Romantic poetry'], kw: ['keats', 'odes', 'eve of st agnes', 'ode to autumn', 'ode on a grecian urn'], confidence: 'established',
    summary: 'Keats\'s last collection, containing three narrative poems and the great odes, including those to a nightingale, on a Grecian urn and to autumn; it appeared months before his death.',
  },
  {
    id: 'work-poem-adonais', kind: 'work', name: 'Adonais', author: 'Percy Bysshe Shelley', year: 1821, language: 'English', region: 'England and Italy',
    genres: ['pastoral elegy', 'Spenserian stanza', 'Romantic poetry'], kw: ['shelley', 'adonais', 'elegy for keats', 'pastoral elegy', 'spenserian stanza'], confidence: 'established',
    summary: 'A pastoral elegy in Spenserian stanzas mourning the death of Keats, which draws on the classical lament tradition to reflect on poetry, fame and mortality.',
  },
  {
    id: 'work-poem-in-memoriam-ahh', kind: 'work', name: 'In Memoriam A.H.H.', author: 'Alfred, Lord Tennyson', year: 1850, language: 'English', region: 'England',
    genres: ['elegy', 'elegiac sequence', 'Victorian poetry'], kw: ['tennyson', 'in memoriam', 'arthur hallam', 'grief poem', 'elegiac cycle'], confidence: 'established',
    summary: 'A long elegiac sequence of short lyrics in a single rhyme pattern, written over about seventeen years after the death of the poet\'s close friend Arthur Hallam; a defining Victorian poem of grief and doubt.',
  },
  {
    id: 'work-poem-idylls-of-the-king', kind: 'work', name: 'Idylls of the King', author: 'Alfred, Lord Tennyson', year: 1859, language: 'English', region: 'England',
    genres: ['narrative poem', 'Arthurian poetry', 'blank verse'], kw: ['tennyson', 'idylls of the king', 'arthurian verse', 'victorian arthurian', 'camelot poem'], confidence: 'varies',
    summary: 'A cycle of blank-verse poems retelling the Arthurian legend; the first four idylls appeared in 1859 and further ones were added until the final arrangement in the mid-1880s.',
  },
  {
    id: 'work-poem-sonnets-from-the-portuguese', kind: 'work', name: 'Sonnets from the Portuguese', author: 'Elizabeth Barrett Browning', year: 1850, language: 'English', region: 'England',
    genres: ['sonnet sequence', 'love poetry', 'Petrarchan sonnet'], kw: ['barrett browning', 'sonnet sequence', 'love sonnets', 'petrarchan', 'how do i love thee'], confidence: 'established',
    summary: 'A sequence of 44 love sonnets in the Petrarchan form, written during the poet\'s courtship and published in 1850 under a title that disguises their personal origin.',
  },
  {
    id: 'work-poem-aurora-leigh', kind: 'work', name: 'Aurora Leigh', author: 'Elizabeth Barrett Browning', year: 1856, language: 'English', region: 'England',
    genres: ['verse novel', 'blank verse', 'Victorian poetry'], kw: ['barrett browning', 'aurora leigh', 'novel in verse', 'woman poet protagonist', 'blank verse novel'], confidence: 'established',
    summary: 'A nine-book verse novel in blank verse about a woman poet\'s ambitions, work and love, mixing narrative with comment on art and society; one of the best-known Victorian verse novels.',
  },
  {
    id: 'work-poem-browning-men-and-women', kind: 'work', name: 'Men and Women', author: 'Robert Browning', year: 1855, language: 'English', region: 'England',
    genres: ['dramatic monologue', 'Victorian poetry', 'lyric poetry'], kw: ['browning', 'dramatic monologue', 'men and women', 'my last duchess', 'fra lippo lippi'], confidence: 'established',
    summary: 'A collection of some fifty poems, many of them dramatic monologues in which a speaker reveals more than they intend; a prime source for studying how voice and irony work in verse.',
  },
  {
    id: 'work-poem-the-ring-and-the-book', kind: 'work', name: 'The Ring and the Book', author: 'Robert Browning', year: 1868, language: 'English', region: 'England',
    genres: ['verse novel', 'dramatic monologue', 'blank verse'], kw: ['browning', 'ring and the book', 'multiple narrators', 'dramatic monologues', 'murder trial poem'], confidence: 'varies',
    summary: 'A long poem in blank verse that tells one Roman murder case through twelve books of differing speakers; published in parts in 1868 and 1869, it is a landmark of multiple-perspective narrative.',
  },
  {
    id: 'work-poem-goblin-market-and-other-poems', kind: 'work', name: 'Goblin Market and Other Poems', author: 'Christina Rossetti', year: 1862, language: 'English', region: 'England',
    genres: ['narrative poem', 'fairy-tale poem', 'Victorian poetry'], kw: ['christina rossetti', 'goblin market', 'sisters poem', 'victorian fairy tale', 'irregular rhyme'], confidence: 'established',
    summary: 'Rossetti\'s first major collection, led by the long fairy-tale poem Goblin Market, with its irregular metre and rhyme; it is read for its play with temptation, sisterhood and desire.',
  },
  {
    id: 'work-poem-modern-love-meredith', kind: 'work', name: 'Modern Love', author: 'George Meredith', year: 1862, language: 'English', region: 'England',
    genres: ['sonnet sequence', 'Victorian poetry', 'marriage poem'], kw: ['meredith', 'modern love', 'sixteen-line sonnets', 'failing marriage poem', 'victorian sonnet sequence'], confidence: 'established',
    summary: 'A sequence of fifty poems of sixteen lines each, closely observing the slow breakdown of a marriage; unusual among Victorian love poems for its psychological candour and expanded sonnet shape.',
  },
  {
    id: 'work-poem-the-house-of-life', kind: 'work', name: 'The House of Life', author: 'Dante Gabriel Rossetti', year: 1881, language: 'English', region: 'England',
    genres: ['sonnet sequence', 'love poetry', 'Pre-Raphaelite poetry'], kw: ['rossetti', 'house of life', 'pre-raphaelite', 'sonnet sequence', 'sonnet of sonnets'], confidence: 'varies',
    summary: 'A sonnet sequence on love, loss and the passing of time, first published in part in 1870 and reaching its final form in 1881; a central work of Pre-Raphaelite poetry.',
  },
  {
    id: 'work-poem-swinburne-poems-and-ballads', kind: 'work', name: 'Poems and Ballads', author: 'Algernon Charles Swinburne', year: 1866, language: 'English', region: 'England',
    genres: ['lyric poetry', 'ballad', 'Victorian poetry'], kw: ['swinburne', 'poems and ballads', 'aestheticism', 'sound patterning', 'victorian controversy'], confidence: 'established',
    summary: 'A collection of lyrics and ballads known for musical, heavily patterned verse and a daring range of subjects; it caused a public controversy when it appeared in 1866.',
  },
  {
    id: 'work-poem-a-shropshire-lad', kind: 'work', name: 'A Shropshire Lad', author: 'A. E. Housman', year: 1896, language: 'English', region: 'England',
    genres: ['lyric poetry', 'ballad stanza', 'pastoral'], kw: ['housman', 'shropshire lad', 'short lyrics', 'countryside elegy', 'young soldiers poems'], confidence: 'established',
    summary: 'A cycle of sixty-three short lyrics in ballad-like stanzas about country youth, love, soldiering and early death; its plain, bitter-sweet tone made it a favourite across the First World War era.',
  },
  {
    id: 'work-poem-wessex-poems', kind: 'work', name: 'Wessex Poems and Other Verses', author: 'Thomas Hardy', year: 1898, language: 'English', region: 'England',
    genres: ['lyric poetry', 'narrative verse', 'Victorian poetry'], kw: ['hardy', 'wessex poems', 'novelist turned poet', 'hardy first poetry book', 'varied stanzas'], confidence: 'established',
    summary: 'Thomas Hardy\'s first collection of poems, published when he was best known as a novelist; it introduces the plain, varied-stanza verse and ironic outlook of his later poetry.',
  },
  {
    id: 'work-poem-barrack-room-ballads', kind: 'work', name: 'Barrack-Room Ballads and Other Verses', author: 'Rudyard Kipling', year: 1892, language: 'English', region: 'England and India',
    genres: ['ballad', 'dramatic monologue', 'dialect verse'], kw: ['kipling', 'barrack-room ballads', 'soldier ballads', 'dialect poetry', 'victorian empire verse'], confidence: 'established',
    summary: 'A collection of ballads spoken in the dialect of ordinary British soldiers; popular in its time and still studied for its use of rhythm and voice, and for the debates over its imperial setting.',
  },
  {
    id: 'work-poem-ballad-of-reading-gaol', kind: 'work', name: 'The Ballad of Reading Gaol', author: 'Oscar Wilde', year: 1898, language: 'English', region: 'England',
    genres: ['ballad', 'protest poem', 'narrative poem'], kw: ['oscar wilde', 'reading gaol', 'prison poem', 'ballad', 'penal reform'], confidence: 'established',
    summary: 'A long ballad in six-line stanzas inspired by the author\'s imprisonment, narrating a prison execution and condemning the penal system; first published under a prison cell number rather than his name.',
  },
  {
    id: 'work-poem-hopkins-poems', kind: 'work', name: 'Poems of Gerard Manley Hopkins', author: 'Gerard Manley Hopkins', year: 1918, language: 'English', region: 'England',
    genres: ['sprung rhythm', 'religious poetry', 'lyric poetry'], kw: ['hopkins', 'sprung rhythm', 'inscape', 'wreck of the deutschland', 'pied beauty'], confidence: 'established',
    summary: 'The first collected edition, prepared by Robert Bridges after the poet\'s death, which brought the sprung rhythm, compounded words and intense nature imagery of his devotional poetry to the public.',
  },
  {
    id: 'work-poem-brooke-1914-and-other-poems', kind: 'work', name: '1914 and Other Poems', author: 'Rupert Brooke', year: 1915, language: 'English', region: 'England',
    genres: ['war poetry', 'sonnet sequence', 'Georgian poetry'], kw: ['rupert brooke', '1914 sonnets', 'the soldier', 'first world war poetry', 'georgian poets'], confidence: 'established',
    summary: 'A posthumous collection led by the five sonnets of 1914, which express early wartime idealism; the volume is often set beside the later, darker verse of the war\'s other poets.',
  },
  {
    id: 'work-poem-sassoon-counter-attack', kind: 'work', name: 'Counter-Attack and Other Poems', author: 'Siegfried Sassoon', year: 1918, language: 'English', region: 'England',
    genres: ['war poetry', 'satirical verse', 'protest poetry'], kw: ['sassoon', 'counter-attack', 'trench poetry', 'first world war poetry', 'anti-war verse'], confidence: 'established',
    summary: 'A collection of short, blunt poems on trench warfare and the failures of those directing it, published in 1918; a key volume of First World War protest verse.',
  },
  {
    id: 'work-poem-owen-poems', kind: 'work', name: 'Poems (Wilfred Owen)', author: 'Wilfred Owen', year: 1920, language: 'English', region: 'England',
    genres: ['war poetry', 'pararhyme', 'elegy'], kw: ['wilfred owen', 'pararhyme', 'first world war poetry', 'anthem for doomed youth', 'dulce et decorum est'], confidence: 'established',
    summary: 'The first collection of Owen\'s poems, edited by Siegfried Sassoon after the poet\'s death in 1918; it presents his half-rhymed, pity-driven verse on the experience of war.',
  },
  // ---- Nineteenth-century American verse ----
  {
    id: 'work-poem-leaves-of-grass', kind: 'work', name: 'Leaves of Grass', author: 'Walt Whitman', year: 1855, language: 'English', region: 'United States',
    genres: ['free verse', 'long-line poetry', 'American epic'], kw: ['whitman', 'leaves of grass', 'song of myself', 'free verse', 'american poetry'], confidence: 'established',
    summary: 'A collection that Whitman first published in 1855 with twelve poems and revised through several editions; its long free-verse lines and inclusive voice reshaped American poetry.',
  },
  {
    id: 'work-poem-dickinson-poems-1890', kind: 'work', name: 'Poems by Emily Dickinson (1890)', author: 'Emily Dickinson (edited by Mabel Loomis Todd and Thomas Wentworth Higginson)', year: 1890, language: 'English', region: 'United States',
    genres: ['lyric poetry', 'hymn meter', 'slant rhyme'], kw: ['dickinson', 'first edition', 'slant rhyme', 'dash', 'posthumous poems'], confidence: 'varies',
    summary: 'The first posthumous selection of Dickinson\'s poems, edited by two friends who regularised her punctuation and some wording; she had published very few poems during her life.',
  },
  {
    id: 'work-poem-dickinson-johnson-edition', kind: 'work', name: 'The Poems of Emily Dickinson (Johnson edition)', author: 'Emily Dickinson (edited by Thomas H. Johnson)', year: 1955, language: 'English', region: 'United States',
    genres: ['lyric poetry', 'scholarly edition', 'hymn meter'], kw: ['dickinson', 'johnson edition', 'variorum', 'dashes and capitals', 'scholarly edition'], confidence: 'varies',
    summary: 'The three-volume edition that first presented all of Dickinson\'s poems in a form close to her manuscripts, with her dashes and capitals; later scholarly editions have revised its numbering and dating.',
  },
  {
    id: 'work-poem-the-raven-and-other-poems', kind: 'work', name: 'The Raven and Other Poems', author: 'Edgar Allan Poe', year: 1845, language: 'English', region: 'United States',
    genres: ['narrative poem', 'gothic poetry', 'refrain poem'], kw: ['poe', 'the raven', 'refrain', 'gothic verse', 'trochaic'], confidence: 'established',
    summary: 'A collection led by The Raven, whose refrain, internal rhyme and trochaic beat made it among the most recited American poems; Poe also wrote an essay on how he built it.',
  },
  {
    id: 'work-poem-evangeline', kind: 'work', name: 'Evangeline: A Tale of Acadie', author: 'Henry Wadsworth Longfellow', year: 1847, language: 'English', region: 'United States',
    genres: ['narrative poem', 'dactylic hexameter', 'verse romance'], kw: ['longfellow', 'evangeline', 'acadia', 'hexameter', 'american narrative poem'], confidence: 'established',
    summary: 'A long narrative poem in unrhymed dactylic hexameter about a woman searching for her lost betrothed after the expulsion of the Acadians; a widely read American poem of the nineteenth century.',
  },
  {
    id: 'work-poem-song-of-hiawatha', kind: 'work', name: 'The Song of Hiawatha', author: 'Henry Wadsworth Longfellow', year: 1855, language: 'English', region: 'United States',
    genres: ['narrative poem', 'trochaic tetrameter', 'American epic'], kw: ['longfellow', 'hiawatha', 'trochaic tetrameter', 'native american legends in verse', 'kalevala metre'], confidence: 'established',
    summary: 'A long narrative poem in unrhymed trochaic tetrameter, modelled in metre on the Finnish Kalevala and drawing on Native American stories as the poet understood them; its rhythm is widely imitated and parodied.',
  },
  // ---- Britain and Ireland, twentieth and twenty-first centuries ----
  {
    id: 'work-poem-wind-among-the-reeds', kind: 'work', name: 'The Wind Among the Reeds', author: 'W. B. Yeats', year: 1899, language: 'English', region: 'Ireland',
    genres: ['symbolist poetry', 'lyric poetry', 'Celtic Twilight'], kw: ['yeats', 'wind among the reeds', 'celtic twilight', 'symbolism', 'irish myth lyrics'], confidence: 'established',
    summary: 'A collection of dreamlike lyrics from Yeats\'s early period, built on Irish myth, rose and other symbols and a hushed, musical line; a high point of the Irish literary revival and of English symbolist verse.',
  },
  {
    id: 'work-poem-the-tower', kind: 'work', name: 'The Tower', author: 'W. B. Yeats', year: 1928, language: 'English', region: 'Ireland',
    genres: ['modernist poetry', 'lyric poetry', 'meditative poetry'], kw: ['yeats', 'the tower', 'sailing to byzantium', 'ageing poems', 'later yeats'], confidence: 'established',
    summary: 'A collection of Yeats\'s later work, with firmer, harder lines on age, art, history and Ireland; it holds poems such as Sailing to Byzantium that are central to modern English-language verse.',
  },
  {
    id: 'work-poem-prufrock-and-other-observations', kind: 'work', name: 'Prufrock and Other Observations', author: 'T. S. Eliot', year: 1917, language: 'English', region: 'United States and England',
    genres: ['modernist poetry', 'dramatic monologue', 'free verse'], kw: ['eliot', 'prufrock', 'love song of j alfred prufrock', 'early modernism', 'urban poetry'], confidence: 'established',
    summary: 'Eliot\'s first collection, with the dramatic monologue The Love Song of J. Alfred Prufrock, whose hesitant, ironic speaker and city imagery helped open the door to modernist English poetry.',
  },
  {
    id: 'work-poem-the-waste-land', kind: 'work', name: 'The Waste Land', author: 'T. S. Eliot', year: 1922, language: 'English', region: 'England',
    genres: ['modernist poetry', 'long poem', 'collage poem'], kw: ['eliot', 'waste land', 'modernism', 'fragmented poem', 'allusion'], confidence: 'established',
    summary: 'A long poem in five parts that combines many voices, languages and literary allusions in fragments, to picture a damaged post-war culture; a landmark of modernist technique, with notes added by the poet.',
  },
  {
    id: 'work-poem-four-quartets', kind: 'work', name: 'Four Quartets', author: 'T. S. Eliot', year: 1943, language: 'English', region: 'England',
    genres: ['meditative poem', 'sequence of long poems', 'modernist poetry'], kw: ['eliot', 'four quartets', 'burnt norton', 'time poem', 'musical structure'], confidence: 'varies',
    summary: 'Four linked long poems on time, memory and faith, each organised in five movements on the pattern of a musical quartet; the poems appeared separately from 1936 and were collected as a book in 1943.',
  },
  {
    id: 'work-poem-pound-the-cantos', kind: 'work', name: 'The Cantos', author: 'Ezra Pound', year: 1925, language: 'English', region: 'United States, France and Italy',
    genres: ['modernist epic', 'long poem', 'collage poem'], kw: ['pound', 'cantos', 'modernist epic', 'ideogram method', 'unfinished long poem'], confidence: 'varies',
    summary: 'A huge, unfinished modernist long poem built from fragments of history, economics, myth and translation in many languages; a first selection appeared in 1925 and the work grew over about fifty years.',
  },
  {
    id: 'work-poem-hugh-selwyn-mauberley', kind: 'work', name: 'Hugh Selwyn Mauberley', author: 'Ezra Pound', year: 1920, language: 'English', region: 'England',
    genres: ['modernist poetry', 'poem sequence', 'satire'], kw: ['pound', 'mauberley', 'poem sequence', 'ironic persona', 'post-war london'], confidence: 'established',
    summary: 'A two-part poem sequence that looks coolly at the position of the artist in a commercial, war-damaged society, using a fictional poet as a mask; compact and exact in its diction.',
  },
  {
    id: 'work-poem-cathay', kind: 'work', name: 'Cathay', author: 'Ezra Pound', year: 1915, language: 'English', region: 'England',
    genres: ['translation', 'imagist poetry', 'free verse'], kw: ['pound', 'cathay', 'chinese poetry in english', 'fenollosa notes', 'free translation'], confidence: 'established',
    summary: 'A small book of free English renderings of classical Chinese poems, worked from another scholar\'s notes; much admired as English verse and much debated as translation.',
  },
  {
    id: 'work-poem-in-parenthesis', kind: 'work', name: 'In Parenthesis', author: 'David Jones', year: 1937, language: 'English', region: 'Wales and England',
    genres: ['war poem', 'modernist prose-verse', 'long poem'], kw: ['david jones', 'in parenthesis', 'first world war', 'welsh myth', 'prose and verse'], confidence: 'established',
    summary: 'A book-length war poem, mixing prose and verse, built on the author\'s service in the infantry in the First World War and layered with Welsh and Arthurian allusion; a major work of British modernism.',
  },
  {
    id: 'work-poem-drunk-man-looks-at-the-thistle', kind: 'work', name: 'A Drunk Man Looks at the Thistle', author: 'Hugh MacDiarmid (Christopher Murray Grieve)', year: 1926, language: 'Scots', region: 'Scotland',
    genres: ['long poem', 'modernist poetry', 'Scots language poetry'], kw: ['macdiarmid', 'drunk man', 'thistle', 'scottish renaissance', 'synthetic scots'], confidence: 'established',
    summary: 'A long, digressive poem in literary Scots, spoken by a drunk man who looks at a thistle and reflects on Scotland, love and identity; a cornerstone of the Scottish literary renaissance.',
  },
  {
    id: 'work-poem-briggflatts', kind: 'work', name: 'Briggflatts', author: 'Basil Bunting', year: 1966, language: 'English', region: 'England',
    genres: ['long poem', 'autobiographical poem', 'modernist poetry'], kw: ['bunting', 'briggflatts', 'northumbrian poet', 'sound-led verse', 'autobiography in verse'], confidence: 'established',
    summary: 'A long autobiographical poem in five parts, built on sound and on the landscape of Northumbria; Bunting meant it to be heard, and it brought him late recognition.',
  },
  {
    id: 'work-poem-autumn-journal', kind: 'work', name: 'Autumn Journal', author: 'Louis MacNeice', year: 1939, language: 'English', region: 'Ireland and England',
    genres: ['long poem', 'journal poem', 'topical poetry'], kw: ['macneice', 'autumn journal', 'munich crisis', 'diary in verse', '1930s poetry'], confidence: 'established',
    summary: 'A long poem in short sections written as a diary of the months around the Munich crisis, mixing private life, memory and public anxiety in a conversational voice.',
  },
  {
    id: 'work-poem-auden-another-time', kind: 'work', name: 'Another Time', author: 'W. H. Auden', year: 1940, language: 'English', region: 'England and United States',
    genres: ['lyric poetry', 'ballad', 'elegy'], kw: ['auden', 'another time', 'in memory of yeats', 'musee des beaux arts', 'light verse and elegy'], confidence: 'established',
    summary: 'A collection of Auden\'s poems from the late 1930s, including elegies, ballads, cabaret songs and poems of the approach of war; it shows the range of his forms and tones.',
  },
  {
    id: 'work-poem-age-of-anxiety', kind: 'work', name: 'The Age of Anxiety', author: 'W. H. Auden', year: 1947, language: 'English', region: 'United States',
    genres: ['long poem', 'alliterative verse', 'baroque eclogue'], kw: ['auden', 'age of anxiety', 'baroque eclogue', 'alliterative long poem', 'wartime bar'], confidence: 'established',
    summary: 'A long poem in a loose alliterative measure, subtitled a baroque eclogue, in which four strangers talk through a night in a wartime bar; its title became a name for the mid-century mood.',
  },
  {
    id: 'work-poem-deaths-and-entrances', kind: 'work', name: 'Deaths and Entrances', author: 'Dylan Thomas', year: 1946, language: 'English', region: 'Wales',
    genres: ['lyric poetry', 'Neo-Romantic poetry', 'elegy'], kw: ['dylan thomas', 'deaths and entrances', 'fern hill', 'welsh poet', 'rich sound poems'], confidence: 'established',
    summary: 'A collection of rich-sounding lyrics of childhood, war and mortality, including Fern Hill; among the most read volumes by the Welsh poet.',
  },
  {
    id: 'work-poem-not-waving-but-drowning', kind: 'work', name: 'Not Waving but Drowning', author: 'Stevie Smith', year: 1957, language: 'English', region: 'England',
    genres: ['light verse', 'lyric poetry', 'dark comic poetry'], kw: ['stevie smith', 'not waving but drowning', 'comic and sad', 'deceptive simplicity', 'odd rhythms'], confidence: 'established',
    summary: 'A collection of short, seemingly simple poems that mix nursery-rhyme rhythm with death and loneliness; the title poem is among the most anthologised of its time.',
  },
  {
    id: 'work-poem-the-less-deceived', kind: 'work', name: 'The Less Deceived', author: 'Philip Larkin', year: 1955, language: 'English', region: 'England',
    genres: ['lyric poetry', 'The Movement', 'formal verse'], kw: ['larkin', 'less deceived', 'the movement', 'plain style', 'mid-century english poetry'], confidence: 'established',
    summary: 'The volume that made Larkin\'s reputation: precise, rhymed poems of ordinary life, disappointment and doubt in a plain, conversational style associated with the Movement.',
  },
  {
    id: 'work-poem-the-whitsun-weddings', kind: 'work', name: 'The Whitsun Weddings', author: 'Philip Larkin', year: 1964, language: 'English', region: 'England',
    genres: ['lyric poetry', 'formal verse', 'meditative poetry'], kw: ['larkin', 'whitsun weddings', 'train poem', 'english lyric', 'rhymed stanzas'], confidence: 'established',
    summary: 'Larkin\'s second major collection, whose title poem follows a train journey through England and whose rhymed stanzas look at love, work and mortality with detailed observation.',
  },
  {
    id: 'work-poem-high-windows', kind: 'work', name: 'High Windows', author: 'Philip Larkin', year: 1974, language: 'English', region: 'England',
    genres: ['lyric poetry', 'formal verse', 'colloquial poetry'], kw: ['larkin', 'high windows', 'late larkin', 'colloquial english', 'ageing poems'], confidence: 'established',
    summary: 'Larkin\'s last full collection, with some of his bluntest language and his most open poems of regret and ageing, including its short title poem.',
  },
  {
    id: 'work-poem-the-hawk-in-the-rain', kind: 'work', name: 'The Hawk in the Rain', author: 'Ted Hughes', year: 1957, language: 'English', region: 'England',
    genres: ['lyric poetry', 'nature poetry', 'animal poetry'], kw: ['ted hughes', 'hawk in the rain', 'animal poems', 'thought-fox', 'first collection'], confidence: 'established',
    summary: 'Hughes\'s first collection, with hard, muscular verse on animals, weather and violence in nature; it includes the poem The Thought-Fox, often used to discuss how a poem comes into being.',
  },
  {
    id: 'work-poem-crow', kind: 'work', name: 'Crow: From the Life and Songs of the Crow', author: 'Ted Hughes', year: 1970, language: 'English', region: 'England',
    genres: ['mythic poetry', 'poem cycle', 'dark fable'], kw: ['ted hughes', 'crow', 'trickster poems', 'myth cycle', 'bleak comic fable'], confidence: 'established',
    summary: 'A cycle of brief, harsh poems following the anti-hero Crow through invented creation and trickster stories; its flat, savage comedy marks a sharp turn in Hughes\'s style.',
  },
  {
    id: 'work-poem-birthday-letters', kind: 'work', name: 'Birthday Letters', author: 'Ted Hughes', year: 1998, language: 'English', region: 'England',
    genres: ['confessional poetry', 'poem sequence', 'elegy'], kw: ['ted hughes', 'birthday letters', 'sylvia plath', 'marriage poems', 'addressed poems'], confidence: 'established',
    summary: 'A sequence of poems addressed to Sylvia Plath, looking back on their marriage after more than thirty years of public silence; published months before the poet\'s death.',
  },
  {
    id: 'work-poem-the-colossus', kind: 'work', name: 'The Colossus and Other Poems', author: 'Sylvia Plath', year: 1960, language: 'English', region: 'England and United States',
    genres: ['formal verse', 'lyric poetry', 'confessional precursor'], kw: ['plath', 'colossus', 'first collection', 'formal stanzas', 'early plath'], confidence: 'established',
    summary: 'Plath\'s only collection published in her lifetime, with tightly crafted, image-rich poems that show the formal control she would later break through.',
  },
  {
    id: 'work-poem-ariel', kind: 'work', name: 'Ariel', author: 'Sylvia Plath', year: 1965, language: 'English', region: 'England and United States',
    genres: ['confessional poetry', 'lyric poetry', 'free verse'], kw: ['plath', 'ariel', 'daddy', 'lady lazarus', 'confessional poems'], confidence: 'established',
    summary: 'A posthumous collection of intense, fast poems on rage, rebirth and the self, first printed in 1965 in an arrangement by Ted Hughes; Plath\'s own ordering appeared in 2004.',
  },
  {
    id: 'work-poem-mercian-hymns', kind: 'work', name: 'Mercian Hymns', author: 'Geoffrey Hill', year: 1971, language: 'English', region: 'England',
    genres: ['prose poetry', 'sequence', 'historical poetry'], kw: ['geoffrey hill', 'mercian hymns', 'offa', 'prose poems', 'england and history'], confidence: 'established',
    summary: 'A sequence of thirty prose-poem hymns that mix the eighth-century king Offa with the poet\'s own Midlands boyhood; dense, allusive and often darkly funny.',
  },
  {
    id: 'work-poem-the-man-with-night-sweats', kind: 'work', name: 'The Man with Night Sweats', author: 'Thom Gunn', year: 1992, language: 'English', region: 'England and United States',
    genres: ['elegy', 'formal verse', 'AIDS poetry'], kw: ['thom gunn', 'night sweats', 'aids elegies', 'metrical verse', 'poems of loss'], confidence: 'established',
    summary: 'A collection of elegies in rhyme and metre for friends lost to AIDS, notable for restrained feeling and exact detail; a central book of poetry on the epidemic.',
  },
  {
    id: 'work-poem-death-of-a-naturalist', kind: 'work', name: 'Death of a Naturalist', author: 'Seamus Heaney', year: 1966, language: 'English', region: 'Northern Ireland',
    genres: ['lyric poetry', 'rural poetry', 'memory poem'], kw: ['heaney', 'death of a naturalist', 'digging', 'farm childhood poems', 'first collection'], confidence: 'established',
    summary: 'Heaney\'s first major collection, with thick-textured poems of childhood, farm work and the Irish countryside; it opens with the poem Digging, about writing and inheritance.',
  },
  {
    id: 'work-poem-heaney-north', kind: 'work', name: 'North', author: 'Seamus Heaney', year: 1975, language: 'English', region: 'Northern Ireland',
    genres: ['lyric poetry', 'bog poems', 'political poetry'], kw: ['heaney', 'north', 'bog poems', 'northern ireland troubles', 'archaeology and violence'], confidence: 'established',
    summary: 'A collection that links ancient northern European bog-preserved bodies with violence in contemporary Northern Ireland, in short, dense lines that weigh the poet\'s duty and distance.',
  },
  {
    id: 'work-poem-heaney-field-work', kind: 'work', name: 'Field Work', author: 'Seamus Heaney', year: 1979, language: 'English', region: 'Ireland',
    genres: ['lyric poetry', 'elegy', 'sonnet sequence'], kw: ['heaney', 'field work', 'glanmore sonnets', 'elegies', 'marriage and landscape'], confidence: 'established',
    summary: 'A collection written after the poet moved to the Irish Republic, mixing elegies, love poems and a sequence of sonnets set at Glanmore, in a warmer, more open voice.',
  },
  {
    id: 'work-poem-the-great-hunger', kind: 'work', name: 'The Great Hunger', author: 'Patrick Kavanagh', year: 1942, language: 'English', region: 'Ireland',
    genres: ['long poem', 'rural realism', 'narrative poem'], kw: ['kavanagh', 'great hunger', 'irish farm life', 'anti-pastoral', 'long poem'], confidence: 'varies',
    summary: 'A long poem about a lifetime of small-farm drudgery and stunted feeling, set in a rural Ireland stripped of romance; first printed in 1942 and a landmark of Irish verse.',
  },
  {
    id: 'work-poem-madoc-a-mystery', kind: 'work', name: 'Madoc: A Mystery', author: 'Paul Muldoon', year: 1990, language: 'English', region: 'Northern Ireland and United States',
    genres: ['long poem', 'postmodern poetry', 'alternate history'], kw: ['muldoon', 'madoc', 'puzzle poem', 'poet philosophers', 'long postmodern poem'], confidence: 'established',
    summary: 'A long, playful poem in short sections that imagines the Romantic poets Coleridge and Southey founding a utopian community in America; it is widely discussed as a puzzle of allusion and form.',
  },
  {
    id: 'work-poem-belfast-confetti', kind: 'work', name: 'Belfast Confetti', author: 'Ciaran Carson', year: 1989, language: 'English', region: 'Northern Ireland',
    genres: ['long-line poetry', 'urban poetry', 'narrative poetry'], kw: ['ciaran carson', 'belfast confetti', 'long lines', 'belfast streets', 'troubles poetry'], confidence: 'established',
    summary: 'A collection in long, story-telling lines that map Belfast street by street amid the Troubles, showing how memory and anecdote can make a city on the page.',
  },
  {
    id: 'work-poem-dain-do-eimhir', kind: 'work', name: 'Dàin do Eimhir (Poems to Eimhir)', author: 'Sorley MacLean', year: 1943, language: 'Scottish Gaelic', region: 'Scotland',
    genres: ['love poetry', 'modern Gaelic poetry', 'political lyric'], kw: ['sorley maclean', 'dain do eimhir', 'gaelic poetry', 'scottish gaelic modernism', 'love and war poems'], confidence: 'established',
    summary: 'A sequence of love poems interwoven with the poet\'s anxiety over fascism and the Spanish Civil War; a foundation of modern Scottish Gaelic poetry.',
  },
  {
    id: 'work-poem-an-dealg-droighin', kind: 'work', name: 'An Dealg Droighin', author: 'Nuala Ní Dhomhnaill', year: 1981, language: 'Irish', region: 'Ireland',
    genres: ['lyric poetry', 'myth-based poetry', 'modern Irish poetry'], kw: ['ni dhomhnaill', 'dealg droighin', 'irish language poetry', 'gaeltacht poet', 'folk myth in poems'], confidence: 'established',
    summary: 'The first collection of a leading Irish-language poet, drawing on folklore, dreams and the experience of women with a fresh, modern directness.',
  },
  {
    id: 'work-poem-eireaball-spideoige', kind: 'work', name: 'Eireaball Spideoige', author: 'Seán Ó Ríordáin', year: 1952, language: 'Irish', region: 'Ireland',
    genres: ['lyric poetry', 'modern Irish poetry', 'introspective verse'], kw: ['o riordain', 'eireaball spideoige', 'irish modernism', 'language and self', 'twentieth-century irish poetry'], confidence: 'established',
    summary: 'A collection of introspective poems on language, selfhood and illness that brought a modernist inwardness to poetry in Irish; one of the most influential Irish-language books of its century.',
  },
  {
    id: 'work-poem-the-worlds-wife', kind: 'work', name: 'The World\'s Wife', author: 'Carol Ann Duffy', year: 1999, language: 'English', region: 'Scotland and England',
    genres: ['dramatic monologue', 'feminist poetry', 'revisionist myth'], kw: ['carol ann duffy', 'worlds wife', 'dramatic monologues', 'wives of famous men', 'comic feminist poems'], confidence: 'established',
    summary: 'A collection of comic and sharp dramatic monologues spoken by the wives and partners of famous men, from myth, history and popular culture, giving voice to figures usually left silent.',
  },
  {
    id: 'work-poem-the-adoption-papers', kind: 'work', name: 'The Adoption Papers', author: 'Jackie Kay', year: 1991, language: 'English', region: 'Scotland',
    genres: ['poem sequence', 'voice poem', 'identity poetry'], kw: ['jackie kay', 'adoption papers', 'multiple voices', 'identity and family', 'scottish poetry'], confidence: 'established',
    summary: 'A sequence in three interlaced voices of a birth mother, an adoptive mother and a daughter; a much-taught example of poetry that handles race, family and belonging in several registers.',
  },
  {
    id: 'work-poem-making-cocoa-for-kingsley-amis', kind: 'work', name: 'Making Cocoa for Kingsley Amis', author: 'Wendy Cope', year: 1986, language: 'English', region: 'England',
    genres: ['light verse', 'parody', 'formal verse'], kw: ['wendy cope', 'making cocoa', 'comic poetry', 'parody of modern poets', 'accessible verse'], confidence: 'established',
    summary: 'A popular collection of witty, formally exact poems that parody famous poets and treat love and daily life with comic honesty; it reached an unusually wide readership for contemporary poetry.',
  },
  {
    id: 'work-poem-dart-oswald', kind: 'work', name: 'Dart', author: 'Alice Oswald', year: 2002, language: 'English', region: 'England',
    genres: ['long poem', 'voice poem', 'nature poetry'], kw: ['alice oswald', 'dart', 'river poem', 'voices of a river', 'devon'], confidence: 'established',
    summary: 'A long poem in many voices that follows the River Dart from source to sea, built from recorded conversations with people who live and work along it; a model of the river poem.',
  },
  {
    id: 'work-poem-memorial-oswald', kind: 'work', name: 'Memorial', author: 'Alice Oswald', year: 2011, language: 'English', region: 'England',
    genres: ['long poem', 'elegy', 'poem after Homer'], kw: ['alice oswald', 'memorial', 'iliad', 'war dead poem', 'similes'], confidence: 'varies',
    summary: 'A long poem that lists the war dead of the Iliad with their short biographies and its similes, working them into a continuous lament; the subtitle differs between UK and US editions.',
  },
  // ---- United States, twentieth and twenty-first centuries ----
  {
    id: 'work-poem-north-of-boston', kind: 'work', name: 'North of Boston', author: 'Robert Frost', year: 1914, language: 'English', region: 'United States',
    genres: ['dramatic narrative poem', 'blank verse', 'rural poetry'], kw: ['frost', 'north of boston', 'mending wall', 'new england poems', 'blank verse dialogue'], confidence: 'established',
    summary: 'A collection of New England poems, many of them dramatic dialogues or narratives in blank verse that catch the cadence of rural speech; it includes Mending Wall and made Frost\'s name.',
  },
  {
    id: 'work-poem-chicago-poems', kind: 'work', name: 'Chicago Poems', author: 'Carl Sandburg', year: 1916, language: 'English', region: 'United States',
    genres: ['free verse', 'urban poetry', 'labour poetry'], kw: ['sandburg', 'chicago poems', 'city poems', 'american free verse', 'working people'], confidence: 'established',
    summary: 'Sandburg\'s first major collection, in plain free verse about the city, its workers and its machines; a defining book of early twentieth-century American urban poetry.',
  },
  {
    id: 'work-poem-spoon-river-anthology', kind: 'work', name: 'Spoon River Anthology', author: 'Edgar Lee Masters', year: 1915, language: 'English', region: 'United States',
    genres: ['dramatic monologue', 'free verse', 'poem cycle'], kw: ['masters', 'spoon river', 'epitaph poems', 'voices of the dead', 'small town monologues'], confidence: 'established',
    summary: 'A cycle of free-verse epitaphs spoken by the dead of an invented Illinois town, who tell what the living never knew; a model of a whole community built from short voices.',
  },
  {
    id: 'work-poem-harmonium', kind: 'work', name: 'Harmonium', author: 'Wallace Stevens', year: 1923, language: 'English', region: 'United States',
    genres: ['modernist poetry', 'lyric poetry', 'philosophical poetry'], kw: ['wallace stevens', 'harmonium', 'imagination and reality', 'thirteen ways of looking at a blackbird', 'first collection'], confidence: 'established',
    summary: 'Stevens\'s first book, with playful, richly coloured poems on imagination, perception and the invented world; it contains Thirteen Ways of Looking at a Blackbird.',
  },
  {
    id: 'work-poem-spring-and-all', kind: 'work', name: 'Spring and All', author: 'William Carlos Williams', year: 1923, language: 'English', region: 'United States',
    genres: ['modernist poetry', 'prose-and-verse hybrid', 'imagist poetry'], kw: ['william carlos williams', 'spring and all', 'red wheelbarrow', 'prose and poems mixed', 'american modernism'], confidence: 'established',
    summary: 'A book that alternates lively prose about imagination and the poet\'s task with short, spare poems on ordinary things, including The Red Wheelbarrow; central to American modernist thinking about the image.',
  },
  {
    id: 'work-poem-paterson', kind: 'work', name: 'Paterson', author: 'William Carlos Williams', year: 1946, language: 'English', region: 'United States',
    genres: ['modernist epic', 'long poem', 'collage poem'], kw: ['william carlos williams', 'paterson', 'city as a man', 'american long poem', 'collage of letters and verse'], confidence: 'varies',
    summary: 'A long poem in several books that treats a New Jersey city and its river as a single living figure, mixing lyric, prose, letters and history; Book One appeared in 1946 and the work grew over the next decade.',
  },
  {
    id: 'work-poem-marianne-moore-observations', kind: 'work', name: 'Observations', author: 'Marianne Moore', year: 1924, language: 'English', region: 'United States',
    genres: ['modernist poetry', 'syllabic verse', 'descriptive poetry'], kw: ['marianne moore', 'observations', 'syllabic verse', 'animal poems', 'precise description'], confidence: 'established',
    summary: 'Moore\'s landmark collection of precise, syllable-counted poems on animals, objects and ideas, with quoted fragments set into the lines; admired for exact diction and unusual stanza shapes.',
  },
  {
    id: 'work-poem-tulips-and-chimneys', kind: 'work', name: 'Tulips & Chimneys', author: 'E. E. Cummings', year: 1923, language: 'English', region: 'United States',
    genres: ['experimental poetry', 'lyric poetry', 'visual poetry'], kw: ['cummings', 'tulips and chimneys', 'lowercase poetry', 'typographic play', 'love poems'], confidence: 'established',
    summary: 'Cummings\'s first collection, mixing tender and satirical poems with a new, spaced and lowercase look on the page; an early landmark of typographic play in American poetry.',
  },
  {
    id: 'work-poem-the-bridge-hart-crane', kind: 'work', name: 'The Bridge', author: 'Hart Crane', year: 1930, language: 'English', region: 'United States',
    genres: ['modernist epic', 'long poem', 'visionary poetry'], kw: ['hart crane', 'the bridge', 'brooklyn bridge', 'american myth poem', 'visionary long poem'], confidence: 'established',
    summary: 'A long poem in linked sections that takes the Brooklyn Bridge as a symbol of American history and aspiration; ambitious, rapturous and dense in language.',
  },
  {
    id: 'work-poem-renascence-and-other-poems', kind: 'work', name: 'Renascence and Other Poems', author: 'Edna St. Vincent Millay', year: 1917, language: 'English', region: 'United States',
    genres: ['lyric poetry', 'sonnet', 'formal verse'], kw: ['millay', 'renascence', 'young poet debut', 'american sonnets', 'lyric poems'], confidence: 'established',
    summary: 'Millay\'s first book, built around the long title poem she wrote as a young woman; it announced a poet at ease with rhyme and traditional forms in a fresh, direct voice.',
  },
  {
    id: 'work-poem-sea-garden', kind: 'work', name: 'Sea Garden', author: 'H.D. (Hilda Doolittle)', year: 1916, language: 'English', region: 'United States and England',
    genres: ['imagist poetry', 'free verse', 'nature poetry'], kw: ['h.d.', 'hilda doolittle', 'imagism', 'sea garden', 'hard clear images'], confidence: 'established',
    summary: 'H.D.\'s first book, with short, hard-edged poems of seashore plants, wind and stone; a leading example of the Imagist ideal of direct treatment and economy of words.',
  },
  {
    id: 'work-poem-helen-in-egypt', kind: 'work', name: 'Helen in Egypt', author: 'H.D. (Hilda Doolittle)', year: 1961, language: 'English', region: 'Switzerland and United States',
    genres: ['long poem', 'epic poem', 'mythic revision'], kw: ['h.d.', 'helen in egypt', 'helen of troy', 'women and myth', 'prose and verse long poem'], confidence: 'established',
    summary: 'A long poem, alternating verse and prose commentary, that retells the story of Helen of Troy through the old tale that she waited in Egypt while a phantom went to Troy; a major woman-centred revision of epic.',
  },
  {
    id: 'work-poem-the-lost-son-and-other-poems', kind: 'work', name: 'The Lost Son and Other Poems', author: 'Theodore Roethke', year: 1948, language: 'English', region: 'United States',
    genres: ['lyric poetry', 'greenhouse poems', 'psychological poetry'], kw: ['roethke', 'lost son', 'greenhouse poems', 'childhood and nature', 'short-line poems'], confidence: 'established',
    summary: 'A collection of strong, rhythmic poems of childhood, plants and inner breakdown, many set in a family greenhouse; it set the pattern for the poet\'s later work.',
  },
  {
    id: 'work-poem-bishop-north-and-south', kind: 'work', name: 'North & South', author: 'Elizabeth Bishop', year: 1946, language: 'English', region: 'United States',
    genres: ['lyric poetry', 'descriptive poetry', 'formal verse'], kw: ['elizabeth bishop', 'north and south', 'first collection', 'exact observation', 'the fish'], confidence: 'established',
    summary: 'Bishop\'s first collection, with poised, closely observed poems on travel, animals and the sea, including The Fish; a model of calm precision.',
  },
  {
    id: 'work-poem-bishop-geography-iii', kind: 'work', name: 'Geography III', author: 'Elizabeth Bishop', year: 1976, language: 'English', region: 'United States',
    genres: ['lyric poetry', 'villanelle', 'memory poem'], kw: ['elizabeth bishop', 'geography iii', 'one art', 'in the waiting room', 'last collection'], confidence: 'established',
    summary: 'Bishop\'s last collection in her lifetime, with a short run of finished poems of memory and loss, including the villanelle One Art and In the Waiting Room.',
  },
  {
    id: 'work-poem-life-studies', kind: 'work', name: 'Life Studies', author: 'Robert Lowell', year: 1959, language: 'English', region: 'United States',
    genres: ['confessional poetry', 'autobiographical poetry', 'free verse'], kw: ['robert lowell', 'life studies', 'confessional poets', 'family poems', 'skunk hour'], confidence: 'established',
    summary: 'A collection that mixes a prose memoir with poems on family, illness and the poet\'s own breakdown in an openly personal voice; widely taken as the book that began confessional poetry.',
  },
  {
    id: 'work-poem-the-dream-songs', kind: 'work', name: 'The Dream Songs', author: 'John Berryman', year: 1969, language: 'English', region: 'United States',
    genres: ['confessional poetry', 'poem sequence', 'persona poetry'], kw: ['berryman', 'dream songs', 'henry', 'three-stanza poems', 'blackface voice debate'], confidence: 'varies',
    summary: 'A sequence of 385 poems of three six-line stanzas each, centred on a figure called Henry who shifts between speakers and states of mind; the first parts were printed in 1964 and 1968, and the whole in 1969.',
  },
  {
    id: 'work-poem-howl-and-other-poems', kind: 'work', name: 'Howl and Other Poems', author: 'Allen Ginsberg', year: 1956, language: 'English', region: 'United States',
    genres: ['Beat poetry', 'free verse', 'long-line poetry'], kw: ['ginsberg', 'howl', 'beat generation', 'long line breath unit', 'city lights pocket poets'], confidence: 'established',
    summary: 'A slim collection whose title poem uses very long, incantatory lines to speak for a generation of outsiders; the work was tried for obscenity in 1957 and became a founding text of the Beat movement.',
  },
  {
    id: 'work-poem-coney-island-of-the-mind', kind: 'work', name: 'A Coney Island of the Mind', author: 'Lawrence Ferlinghetti', year: 1958, language: 'English', region: 'United States',
    genres: ['Beat poetry', 'free verse', 'spoken poetry'], kw: ['ferlinghetti', 'coney island of the mind', 'beat poetry', 'poems to be read aloud', 'jazz poetry'], confidence: 'established',
    summary: 'A popular collection of conversational poems, written to be spoken, with comic, surreal and political touches; one of the best-selling American poetry books of its period.',
  },
  {
    id: 'work-poem-lunch-poems', kind: 'work', name: 'Lunch Poems', author: 'Frank O\'Hara', year: 1964, language: 'English', region: 'United States',
    genres: ['New York School poetry', 'free verse', 'occasional poetry'], kw: ['frank ohara', 'lunch poems', 'new york school', 'i do this i do that', 'city walking poems'], confidence: 'established',
    summary: 'A collection of quick, chatty poems written in a lunch hour about New York streets, friends, art and desire; a key example of the New York School\'s spontaneous, diary-like manner.',
  },
  {
    id: 'work-poem-creeley-for-love', kind: 'work', name: 'For Love: Poems 1950-1960', author: 'Robert Creeley', year: 1962, language: 'English', region: 'United States',
    genres: ['Black Mountain poetry', 'short-line poetry', 'love poetry'], kw: ['creeley', 'for love', 'black mountain poets', 'short lines', 'spare lyric'], confidence: 'established',
    summary: 'A collection of spare, halting, short-line poems on love, marriage and the pressure of saying anything exactly; a central book of the Black Mountain circle.',
  },
  {
    id: 'work-poem-the-maximus-poems', kind: 'work', name: 'The Maximus Poems', author: 'Charles Olson', year: 1960, language: 'English', region: 'United States',
    genres: ['projective verse', 'long poem', 'open-field poetry'], kw: ['charles olson', 'maximus poems', 'gloucester massachusetts', 'projective verse', 'open field'], confidence: 'varies',
    summary: 'A long, open-form poem about the Massachusetts port of Gloucester as a place to think about history, myth and geography, the practice behind Olson\'s projective-verse ideas; collected volumes followed from 1960.',
  },
  {
    id: 'work-poem-self-portrait-in-a-convex-mirror', kind: 'work', name: 'Self-Portrait in a Convex Mirror', author: 'John Ashbery', year: 1975, language: 'English', region: 'United States',
    genres: ['postmodern poetry', 'ekphrastic poem', 'meditative poem'], kw: ['ashbery', 'convex mirror', 'parmigianino', 'ekphrasis', 'new york school'], confidence: 'established',
    summary: 'A collection led by a long meditation on a Renaissance self-portrait in a curved mirror, in drifting, conversational verse that treats seeing, self and time as slippery.',
  },
  {
    id: 'work-poem-changing-light-at-sandover', kind: 'work', name: 'The Changing Light at Sandover', author: 'James Merrill', year: 1982, language: 'English', region: 'United States',
    genres: ['epic poem', 'long poem', 'visionary poetry'], kw: ['james merrill', 'sandover', 'ouija board poem', 'epic of dictation', 'long poem in forms'], confidence: 'varies',
    summary: 'A very long poem, in many metrical forms, that grows out of sessions with a Ouija board and speaks of the dead, science and the cosmos; its three parts appeared separately before the whole volume in 1982.',
  },
  {
    id: 'work-poem-the-branch-will-not-break', kind: 'work', name: 'The Branch Will Not Break', author: 'James Wright', year: 1963, language: 'English', region: 'United States',
    genres: ['deep image poetry', 'free verse', 'lyric poetry'], kw: ['james wright', 'branch will not break', 'deep image', 'midwest poetry', 'quiet lyric'], confidence: 'established',
    summary: 'A collection of short free-verse poems on the Midwest, loneliness and sudden grace, marking Wright\'s move from formal verse to open, image-led writing.',
  },
  {
    id: 'work-poem-the-book-of-nightmares', kind: 'work', name: 'The Book of Nightmares', author: 'Galway Kinnell', year: 1971, language: 'English', region: 'United States',
    genres: ['sequence', 'visionary poetry', 'free verse'], kw: ['galway kinnell', 'book of nightmares', 'poem sequence', 'fatherhood poems', 'death and birth'], confidence: 'established',
    summary: 'A ten-poem sequence on fear, mortality and fatherhood, with the Vietnam era and the births of the poet\'s children in the background; a notable American book-length sequence of the 1970s.',
  },
  {
    id: 'work-poem-turtle-island', kind: 'work', name: 'Turtle Island', author: 'Gary Snyder', year: 1974, language: 'English', region: 'United States',
    genres: ['ecological poetry', 'free verse', 'nature poetry'], kw: ['gary snyder', 'turtle island', 'ecopoetry', 'north american land', 'poems and prose'], confidence: 'established',
    summary: 'A collection of poems and short prose on place, wildness and living responsibly on the North American continent; a core text of American ecological poetry.',
  },
  {
    id: 'work-poem-diving-into-the-wreck', kind: 'work', name: 'Diving into the Wreck', author: 'Adrienne Rich', year: 1973, language: 'English', region: 'United States',
    genres: ['feminist poetry', 'free verse', 'political poetry'], kw: ['adrienne rich', 'diving into the wreck', 'feminist poems', 'myth and revision', 'seventies poetry'], confidence: 'established',
    summary: 'A collection whose title poem takes a solitary dive into a wrecked ship as an image of confronting history; a landmark of feminist poetry and of the move toward plainer, more political writing.',
  },
  {
    id: 'work-poem-the-black-unicorn', kind: 'work', name: 'The Black Unicorn', author: 'Audre Lorde', year: 1978, language: 'English', region: 'United States',
    genres: ['feminist poetry', 'myth-based poetry', 'free verse'], kw: ['audre lorde', 'black unicorn', 'african myth', 'black feminist poetry', 'orisha imagery'], confidence: 'established',
    summary: 'A collection that draws on West African myth and goddess imagery to speak of motherhood, anger and Black women\'s power; a key volume of Black feminist poetry.',
  },
  {
    id: 'work-poem-to-bedlam-and-part-way-back', kind: 'work', name: 'To Bedlam and Part Way Back', author: 'Anne Sexton', year: 1960, language: 'English', region: 'United States',
    genres: ['confessional poetry', 'formal verse', 'lyric poetry'], kw: ['anne sexton', 'to bedlam', 'confessional poet', 'mental illness poems', 'first collection'], confidence: 'established',
    summary: 'Sexton\'s first collection, with rhymed, candid poems about breakdown, family and recovery; a central text of confessional poetry.',
  },
  {
    id: 'work-poem-american-primitive', kind: 'work', name: 'American Primitive', author: 'Mary Oliver', year: 1983, language: 'English', region: 'United States',
    genres: ['nature poetry', 'free verse', 'lyric poetry'], kw: ['mary oliver', 'american primitive', 'nature poems', 'attention to the natural world', 'accessible poetry'], confidence: 'established',
    summary: 'A collection of clear, attentive poems on woods, ponds, animals and wonder; an early landmark in the career of one of America\'s most widely read modern nature poets.',
  },
  {
    id: 'work-poem-the-dead-and-the-living', kind: 'work', name: 'The Dead and the Living', author: 'Sharon Olds', year: 1983, language: 'English', region: 'United States',
    genres: ['confessional poetry', 'free verse', 'family poetry'], kw: ['sharon olds', 'dead and the living', 'family poems', 'body and memory', 'candid poems'], confidence: 'established',
    summary: 'A collection of direct, vivid poems on family, the body and historical violence, written in a frank, unadorned voice; an influential book of late twentieth-century American poetry.',
  },
  {
    id: 'work-poem-rose-li-young-lee', kind: 'work', name: 'Rose', author: 'Li-Young Lee', year: 1986, language: 'English', region: 'United States',
    genres: ['lyric poetry', 'immigrant poetry', 'family poetry'], kw: ['li-young lee', 'rose', 'father poems', 'immigrant memory', 'musical lyric'], confidence: 'established',
    summary: 'A first collection of quietly musical poems about the poet\'s father, memory and exile, drawing on his family\'s history of exile; a model of the intimate immigrant lyric.',
  },
  {
    id: 'work-poem-thomas-and-beulah', kind: 'work', name: 'Thomas and Beulah', author: 'Rita Dove', year: 1986, language: 'English', region: 'United States',
    genres: ['poem sequence', 'narrative poetry', 'family chronicle'], kw: ['rita dove', 'thomas and beulah', 'grandparents poems', 'great migration', 'poems in two parts'], confidence: 'established',
    summary: 'A sequence in two parts, one for each of a married couple, that tells their lives through short poems, loosely based on the poet\'s grandparents and the Great Migration north.',
  },
  {
    id: 'work-poem-the-wild-iris', kind: 'work', name: 'The Wild Iris', author: 'Louise Glück', year: 1992, language: 'English', region: 'United States',
    genres: ['lyric poetry', 'persona poetry', 'poem sequence'], kw: ['gluck', 'wild iris', 'garden poems', 'flowers speak', 'voices of flowers and a gardener'], confidence: 'established',
    summary: 'A sequence of poems in the voices of flowers, a gardener and a god, tracing a cycle of loss and endurance in an austere, clear style.',
  },
  {
    id: 'work-poem-neon-vernacular', kind: 'work', name: 'Neon Vernacular: New and Selected Poems', author: 'Yusef Komunyakaa', year: 1993, language: 'English', region: 'United States',
    genres: ['war poetry', 'blues-inflected poetry', 'free verse'], kw: ['komunyakaa', 'neon vernacular', 'vietnam war poems', 'jazz and blues poetry', 'selected poems'], confidence: 'established',
    summary: 'A selection that gathers the poet\'s poems on the Vietnam War, Black life in the South and jazz, written in compressed lines with strong images and a musical ear.',
  },
  {
    id: 'work-poem-she-had-some-horses', kind: 'work', name: 'She Had Some Horses', author: 'Joy Harjo', year: 1983, language: 'English', region: 'United States',
    genres: ['Native American poetry', 'incantatory poetry', 'free verse'], kw: ['joy harjo', 'she had some horses', 'muscogee poet', 'native american poetry', 'repetition and chant'], confidence: 'established',
    summary: 'A collection in which repetition and chant carry poems of survival, myth and women\'s lives; a major volume by a Muscogee (Creek) poet.',
  },
  {
    id: 'work-poem-the-weary-blues', kind: 'work', name: 'The Weary Blues', author: 'Langston Hughes', year: 1926, language: 'English', region: 'United States',
    genres: ['blues poetry', 'jazz poetry', 'Harlem Renaissance poetry'], kw: ['langston hughes', 'weary blues', 'harlem renaissance', 'blues stanza', 'jazz rhythms'], confidence: 'established',
    summary: 'Hughes\'s first collection, which brings the rhythms and forms of blues and jazz into poems about Black city life; a founding book of the Harlem Renaissance.',
  },
  {
    id: 'work-poem-montage-of-a-dream-deferred', kind: 'work', name: 'Montage of a Dream Deferred', author: 'Langston Hughes', year: 1951, language: 'English', region: 'United States',
    genres: ['jazz poetry', 'poem sequence', 'Harlem poetry'], kw: ['langston hughes', 'montage of a dream deferred', 'bebop rhythm', 'harlem poems', 'dream deferred'], confidence: 'established',
    summary: 'A long sequence of short poems on Harlem life, shaped by bebop rhythms and sudden shifts of voice; it asks what happens to a postponed hope.',
  },
  {
    id: 'work-poem-harlem-shadows', kind: 'work', name: 'Harlem Shadows', author: 'Claude McKay', year: 1922, language: 'English', region: 'Jamaica and United States',
    genres: ['sonnet', 'protest poetry', 'Harlem Renaissance poetry'], kw: ['claude mckay', 'harlem shadows', 'sonnets of protest', 'harlem renaissance', 'jamaican-born poet'], confidence: 'established',
    summary: 'A collection by a Jamaican-born poet that puts traditional forms, especially the sonnet, to work on racial violence, exile and city life; an early landmark of the Harlem Renaissance.',
  },
  {
    id: 'work-poem-a-street-in-bronzeville', kind: 'work', name: 'A Street in Bronzeville', author: 'Gwendolyn Brooks', year: 1945, language: 'English', region: 'United States',
    genres: ['lyric poetry', 'ballad', 'Chicago poetry'], kw: ['gwendolyn brooks', 'street in bronzeville', 'chicago south side', 'first book', 'urban black life poems'], confidence: 'established',
    summary: 'Brooks\'s first book, with ballads, sonnets and portraits of ordinary people on Chicago\'s South Side, set down in exact, musical language.',
  },
  {
    id: 'work-poem-preface-to-a-twenty-volume-suicide-note', kind: 'work', name: 'Preface to a Twenty Volume Suicide Note', author: 'Amiri Baraka (LeRoi Jones)', year: 1961, language: 'English', region: 'United States',
    genres: ['Beat poetry', 'free verse', 'Black Arts precursor'], kw: ['amiri baraka', 'leroi jones', 'suicide note', 'first collection', 'new york poets'], confidence: 'established',
    summary: 'The first collection by the poet then known as LeRoi Jones, with quick, personal and jazz-minded poems from the New York scene before his turn to the Black Arts Movement.',
  },
  {
    id: 'work-poem-and-still-i-rise', kind: 'work', name: 'And Still I Rise', author: 'Maya Angelou', year: 1978, language: 'English', region: 'United States',
    genres: ['lyric poetry', 'performance poetry', 'protest poetry'], kw: ['maya angelou', 'and still i rise', 'poems of resilience', 'rhythm and refrain', 'spoken delivery'], confidence: 'established',
    summary: 'A collection of rhythmic, refrain-driven poems on resilience, love and Black womanhood, written to be read aloud; one of the best-known volumes of the poet.',
  },
  {
    id: 'work-poem-citizen-an-american-lyric', kind: 'work', name: 'Citizen: An American Lyric', author: 'Claudia Rankine', year: 2014, language: 'English', region: 'United States',
    genres: ['hybrid poetry', 'prose poetry', 'lyric essay'], kw: ['claudia rankine', 'citizen', 'american lyric', 'microaggressions', 'prose poems and images'], confidence: 'established',
    summary: 'A book-length work in prose poems, essays and images that records everyday racism and its effects, using the second person to draw readers into each scene.',
  },
  {
    id: 'work-poem-native-guard', kind: 'work', name: 'Native Guard', author: 'Natasha Trethewey', year: 2006, language: 'English', region: 'United States',
    genres: ['historical poetry', 'elegy', 'sonnet sequence'], kw: ['trethewey', 'native guard', 'civil war black soldiers', 'mother elegies', 'crown of sonnets'], confidence: 'established',
    summary: 'A collection that pairs elegies for the poet\'s mother with poems in the voice of a Black Union soldier on the Gulf Coast, using strict forms to recover forgotten history.',
  },
  {
    id: 'work-poem-life-on-mars', kind: 'work', name: 'Life on Mars', author: 'Tracy K. Smith', year: 2011, language: 'English', region: 'United States',
    genres: ['lyric poetry', 'science-themed poetry', 'elegy'], kw: ['tracy k smith', 'life on mars', 'space poems', 'father elegy', 'universe and loss'], confidence: 'established',
    summary: 'A collection that moves between outer space, science fiction films and the death of the poet\'s father to ask what lies beyond what we know; a widely taught recent book.',
  },
  {
    id: 'work-poem-night-sky-with-exit-wounds', kind: 'work', name: 'Night Sky with Exit Wounds', author: 'Ocean Vuong', year: 2016, language: 'English', region: 'United States',
    genres: ['lyric poetry', 'immigrant poetry', 'war and family poetry'], kw: ['ocean vuong', 'night sky with exit wounds', 'vietnam war inheritance', 'queer lyric', 'debut poetry collection'], confidence: 'established',
    summary: 'A first full-length collection of poems on war, family, migration and desire, built on dense images and a tender, searching voice; widely read by a younger generation of poets.',
  },
  {
    id: 'work-poem-the-carrying', kind: 'work', name: 'The Carrying', author: 'Ada Limón', year: 2018, language: 'English', region: 'United States',
    genres: ['lyric poetry', 'nature poetry', 'free verse'], kw: ['ada limon', 'the carrying', 'infertility poems', 'nature and body', 'contemporary lyric'], confidence: 'established',
    summary: 'A collection of clear, intimate poems on the body, longing for a child, and the natural world as company and comfort.',
  },
  {
    id: 'work-poem-the-tradition-jericho-brown', kind: 'work', name: 'The Tradition', author: 'Jericho Brown', year: 2019, language: 'English', region: 'United States',
    genres: ['lyric poetry', 'invented form', 'political poetry'], kw: ['jericho brown', 'the tradition', 'duplex form', 'black queer poetry', 'violence and tenderness'], confidence: 'established',
    summary: 'A collection that weaves love, violence and inheritance through short poems, including many in the duplex, a form the poet invented that blends the sonnet, the ghazal and the blues.',
  },
  {
    id: 'work-poem-dont-call-us-dead', kind: 'work', name: 'Don\'t Call Us Dead', author: 'Danez Smith', year: 2017, language: 'English', region: 'United States',
    genres: ['performance poetry', 'political poetry', 'elegy'], kw: ['danez smith', 'dont call us dead', 'black queer poetry', 'hiv poems', 'spoken word poet'], confidence: 'established',
    summary: 'A collection that imagines a heaven for Black men killed by violence and speaks openly of living with HIV; its voice carries the energy of the poet\'s stage work.',
  },
  {
    id: 'work-poem-american-sonnets-for-my-past-and-future-assassin', kind: 'work', name: 'American Sonnets for My Past and Future Assassin', author: 'Terrance Hayes', year: 2018, language: 'English', region: 'United States',
    genres: ['sonnet sequence', 'political poetry', 'invented sonnet form'], kw: ['terrance hayes', 'american sonnets', 'sonnet sequence', 'trump era poems', 'sonnet variations'], confidence: 'established',
    summary: 'A sequence of seventy sonnets, many with unrhymed or invented lines, that treat race, fear and love in contemporary America; a prime example of the sonnet reworked for the present.',
  },
  {
    id: 'work-poem-deaf-republic', kind: 'work', name: 'Deaf Republic', author: 'Ilya Kaminsky', year: 2019, language: 'English', region: 'United States and Ukraine',
    genres: ['narrative poetry', 'dramatic poem', 'political poetry'], kw: ['ilya kaminsky', 'deaf republic', 'occupation poem', 'allegory', 'poem in two acts'], confidence: 'established',
    summary: 'A book-length poem in two acts, with a cast list, set in an invented occupied town where citizens answer soldiers with deafness and sign; a work of resistance and compassion.',
  },
  {
    id: 'work-poem-postcolonial-love-poem', kind: 'work', name: 'Postcolonial Love Poem', author: 'Natalie Diaz', year: 2020, language: 'English', region: 'United States',
    genres: ['lyric poetry', 'love poetry', 'Indigenous poetry'], kw: ['natalie diaz', 'postcolonial love poem', 'mojave poet', 'native american love poems', 'body and land'], confidence: 'established',
    summary: 'A collection of ardent poems of desire, colonial history and water by a Mojave poet, in which body and land are bound together in strong, shifting images.',
  },
  {
    id: 'work-poem-whereas', kind: 'work', name: 'Whereas', author: 'Layli Long Soldier', year: 2017, language: 'English', region: 'United States',
    genres: ['documentary poetry', 'political poetry', 'hybrid poetry'], kw: ['layli long soldier', 'whereas', 'apology resolution', 'legal language poetry', 'oglala lakota poet'], confidence: 'established',
    summary: 'A collection by an Oglala Lakota poet that answers a government apology to Native peoples with poems in legal diction, white space and personal testimony.',
  },
  {
    id: 'work-poem-milk-and-honey', kind: 'work', name: 'milk and honey', author: 'Rupi Kaur', year: 2014, language: 'English', region: 'Canada',
    genres: ['short-form poetry', 'illustrated poetry', 'social-media poetry'], kw: ['rupi kaur', 'milk and honey', 'instapoetry', 'short poems with drawings', 'self-published collection'], confidence: 'varies',
    summary: 'A collection of brief, lowercase poems and line drawings on hurt, love and healing, self-published in 2014 and reissued by a trade publisher the next year; a landmark of poetry spread through social media.',
  },
  {
    id: 'work-poem-autobiography-of-red', kind: 'work', name: 'Autobiography of Red', author: 'Anne Carson', year: 1998, language: 'English', region: 'Canada',
    genres: ['verse novel', 'poem after myth', 'long poem'], kw: ['anne carson', 'autobiography of red', 'novel in verse', 'geryon', 'stesichoros'], confidence: 'established',
    summary: 'A novel in verse that reworks a fragment about the monster Geryon and Herakles as a modern story of a young man\'s growing up and first love; it is often cited as a model of the verse novel.',
  },
  {
    id: 'work-poem-frank-sonnets', kind: 'work', name: 'frank: sonnets', author: 'Diane Seuss', year: 2021, language: 'English', region: 'United States',
    genres: ['sonnet sequence', 'free-form sonnet', 'autobiographical poetry'], kw: ['diane seuss', 'frank sonnets', 'unrhymed sonnets', 'sonnet variation', 'working-class memoir poems'], confidence: 'established',
    summary: 'A collection of long, loosely rhymed or unrhymed sonnets that carry memory, class, grief and art in a wide, speaking voice; a recent example of how elastic the sonnet can be.',
  },
  // ---- Caribbean, African, Canadian, Australian and New Zealand poetry ----
  {
    id: 'work-poem-omeros', kind: 'work', name: 'Omeros', author: 'Derek Walcott', year: 1990, language: 'English', region: 'Saint Lucia',
    genres: ['epic poem', 'long poem', 'terza rima'], kw: ['walcott', 'omeros', 'caribbean epic', 'saint lucia', 'homer reworked'], confidence: 'established',
    summary: 'A long epic poem in a loose terza rima, set among fishermen on Saint Lucia, that borrows the names and shapes of Homeric story to speak of Caribbean history, colonial legacy and belonging.',
  },
  {
    id: 'work-poem-the-arrivants', kind: 'work', name: 'The Arrivants: A New World Trilogy', author: 'Kamau Brathwaite', year: 1973, language: 'English', region: 'Barbados',
    genres: ['trilogy of poems', 'jazz-inflected poetry', 'nation language poetry'], kw: ['brathwaite', 'arrivants', 'rights of passage', 'nation language', 'african diaspora poetry'], confidence: 'varies',
    summary: 'A trilogy of poem sequences, gathered in 1973 from three earlier volumes, that follows the African diaspora to the Caribbean in rhythms drawn from jazz and Caribbean speech.',
  },
  {
    id: 'work-poem-cahier-dun-retour-au-pays-natal', kind: 'work', name: 'Cahier d\'un retour au pays natal (Notebook of a Return to the Native Land)', author: 'Aimé Césaire', year: 1939, language: 'French', region: 'Martinique',
    genres: ['prose poem', 'long poem', 'négritude poetry'], kw: ['cesaire', 'cahier', 'return to the native land', 'negritude', 'martinique poet'], confidence: 'varies',
    summary: 'A book-length prose poem of anger, return and affirmation that gave the idea of négritude its first major literary form; it appeared in a journal in 1939 and as a book in 1947.',
  },
  {
    id: 'work-poem-jamaica-labrish', kind: 'work', name: 'Jamaica Labrish', author: 'Louise Bennett', year: 1966, language: 'Jamaican Creole', region: 'Jamaica',
    genres: ['dialect poetry', 'performance poetry', 'comic verse'], kw: ['louise bennett', 'miss lou', 'jamaica labrish', 'patois poetry', 'caribbean performance poetry'], confidence: 'established',
    summary: 'A collection of comic and sharp poems in Jamaican Creole, written to be performed; it helped win the language a place in literature and in the Caribbean public ear.',
  },
  {
    id: 'work-poem-i-is-a-long-memoried-woman', kind: 'work', name: 'I Is a Long-Memoried Woman', author: 'Grace Nichols', year: 1983, language: 'English', region: 'Guyana and England',
    genres: ['poem cycle', 'persona poetry', 'Caribbean poetry'], kw: ['grace nichols', 'long-memoried woman', 'poem cycle', 'slavery and memory', 'women poets of the caribbean'], confidence: 'established',
    summary: 'A cycle of poems in the voice of an African woman carried into slavery in the Caribbean, moving from capture to survival; a landmark of Black women\'s poetry in Britain.',
  },
  {
    id: 'work-poem-a-portable-paradise', kind: 'work', name: 'A Portable Paradise', author: 'Roger Robinson', year: 2019, language: 'English', region: 'Trinidad and England',
    genres: ['lyric poetry', 'performance poetry', 'Caribbean-British poetry'], kw: ['roger robinson', 'portable paradise', 'grenfell poems', 'trinidadian british poet', 'poems of memory and place'], confidence: 'established',
    summary: 'A collection that moves between Trinidad, Britain and a London tower-block fire in poems of memory, migration and endurance; the work of a poet also known for his stage performance.',
  },
  {
    id: 'work-poem-motivos-de-son', kind: 'work', name: 'Motivos de son', author: 'Nicolás Guillén', year: 1930, language: 'Spanish', region: 'Cuba',
    genres: ['son poetry', 'Afro-Cuban poetry', 'popular-rhythm verse'], kw: ['guillen', 'motivos de son', 'afrocuban poetry', 'son rhythm', 'cuban national poet'], confidence: 'established',
    summary: 'A small book of eight poems built on the rhythms and speech of Afro-Cuban popular music, which brought everyday Black Cuban voices into serious poetry.',
  },
  {
    id: 'work-poem-poema-en-veinte-surcos', kind: 'work', name: 'Poema en veinte surcos', author: 'Julia de Burgos', year: 1938, language: 'Spanish', region: 'Puerto Rico',
    genres: ['lyric poetry', 'feminist poetry', 'modernist poetry'], kw: ['julia de burgos', 'poema en veinte surcos', 'puerto rican poet', 'river poems', 'women and freedom'], confidence: 'established',
    summary: 'The first book of a leading Puerto Rican poet, with intense lyrics of nature, love and self-assertion in a direct, modern voice.',
  },
  {
    id: 'work-poem-labyrinths-okigbo', kind: 'work', name: 'Labyrinths, with Path of Thunder', author: 'Christopher Okigbo', year: 1971, language: 'English', region: 'Nigeria',
    genres: ['modernist poetry', 'poem sequence', 'African poetry in English'], kw: ['okigbo', 'labyrinths', 'path of thunder', 'nigerian poet', 'biafran war poet'], confidence: 'established',
    summary: 'The collected sequences of a Nigerian poet killed in the Biafran war, in dense, allusive lines that join Igbo ritual and European modernism; published after his death.',
  },
  {
    id: 'work-poem-idanre-and-other-poems', kind: 'work', name: 'Idanre and Other Poems', author: 'Wole Soyinka', year: 1967, language: 'English', region: 'Nigeria',
    genres: ['modernist poetry', 'myth-based poetry', 'African poetry in English'], kw: ['soyinka', 'idanre', 'yoruba myth poetry', 'ogun', 'nigerian poet'], confidence: 'established',
    summary: 'A collection led by a long poem on Ogun, the Yoruba god of iron and the road, with shorter poems of exile and politics; known for dense imagery and complex syntax.',
  },
  {
    id: 'work-poem-chants-dombre', kind: 'work', name: 'Chants d\'ombre', author: 'Léopold Sédar Senghor', year: 1945, language: 'French', region: 'Senegal',
    genres: ['lyric poetry', 'négritude poetry', 'free verse'], kw: ['senghor', 'chants d ombre', 'negritude', 'senegalese poet', 'songs of shadow'], confidence: 'established',
    summary: 'The first collection of the Senegalese poet and statesman, with long, musical lines of homesickness, memory and praise for African culture, a founding book of négritude poetry.',
  },
  {
    id: 'work-poem-coups-de-pilon', kind: 'work', name: 'Coups de pilon', author: 'David Diop', year: 1956, language: 'French', region: 'Senegal and France',
    genres: ['protest poetry', 'négritude poetry', 'free verse'], kw: ['david diop', 'coups de pilon', 'negritude', 'anticolonial poetry', 'hammer blows'], confidence: 'established',
    summary: 'A slim collection of short, forceful poems against colonial rule and for African pride; its author died young, and the book remains a touchstone of anticolonial verse in French.',
  },
  {
    id: 'work-poem-yakhalinkomo', kind: 'work', name: 'Yakhal\'inkomo', author: 'Mongane Wally Serote', year: 1972, language: 'English', region: 'South Africa',
    genres: ['protest poetry', 'township poetry', 'free verse'], kw: ['serote', 'yakhal inkomo', 'black consciousness poetry', 'soweto poets', 'south african poetry'], confidence: 'established',
    summary: 'A first collection of urgent poems about life in the townships under apartheid, in a jazz-influenced voice; a key book of the South African Black consciousness era.',
  },
  {
    id: 'work-poem-rook-en-oker', kind: 'work', name: 'Rook en oker (Smoke and Ochre)', author: 'Ingrid Jonker', year: 1963, language: 'Afrikaans', region: 'South Africa',
    genres: ['lyric poetry', 'protest poetry', 'modern Afrikaans poetry'], kw: ['ingrid jonker', 'rook en oker', 'afrikaans poet', 'apartheid-era poetry', 'smoke and ochre'], confidence: 'established',
    summary: 'A collection of spare, emotionally direct Afrikaans poems of love, grief and conscience from a poet who spoke against apartheid; one of the best-known South African books of poetry.',
  },
  {
    id: 'work-poem-song-of-lawino', kind: 'work', name: 'Song of Lawino', author: 'Okot p\'Bitek', year: 1966, language: 'English', region: 'Uganda',
    genres: ['long poem', 'dramatic monologue', 'African oral-style poetry'], kw: ['okot pbitek', 'song of lawino', 'acholi song', 'east african poetry', 'village woman voice'], confidence: 'varies',
    summary: 'A long poem spoken by a village wife who defends her people\'s ways against her husband\'s admiration for the West; the poet composed it in Acholi and published his English version in 1966.',
  },
  {
    id: 'work-poem-the-january-children', kind: 'work', name: 'The January Children', author: 'Safia Elhillo', year: 2017, language: 'English', region: 'Sudan and United States',
    genres: ['lyric poetry', 'diaspora poetry', 'free verse'], kw: ['safia elhillo', 'january children', 'sudanese american poet', 'diaspora and language', 'debut collection'], confidence: 'established',
    summary: 'A debut collection on Sudanese history, language and the life of a young Sudanese-American woman, written in a clear, intimate voice with Arabic and English together.',
  },
  {
    id: 'work-poem-the-spice-box-of-earth', kind: 'work', name: 'The Spice-Box of Earth', author: 'Leonard Cohen', year: 1961, language: 'English', region: 'Canada',
    genres: ['lyric poetry', 'love poetry', 'formal verse'], kw: ['leonard cohen', 'spice-box of earth', 'montreal poets', 'love and ritual poems', 'canadian lyric'], confidence: 'established',
    summary: 'Cohen\'s second book of poems, with polished lyrics of love, religion and desire that made his name in Canada before his songs reached a wider audience.',
  },
  {
    id: 'work-poem-power-politics', kind: 'work', name: 'Power Politics', author: 'Margaret Atwood', year: 1971, language: 'English', region: 'Canada',
    genres: ['poem sequence', 'love poetry', 'free verse'], kw: ['atwood', 'power politics', 'relationship poems', 'sharp short poems', 'canadian poetry'], confidence: 'established',
    summary: 'A sequence of brief, cool poems that treat a love relationship as a struggle for power, with striking images and few words.',
  },
  {
    id: 'work-poem-the-cariboo-horses', kind: 'work', name: 'The Cariboo Horses', author: 'Al Purdy', year: 1965, language: 'English', region: 'Canada',
    genres: ['conversational poetry', 'landscape poetry', 'free verse'], kw: ['al purdy', 'cariboo horses', 'canadian landscape poetry', 'colloquial voice', 'plain-speaking poet'], confidence: 'established',
    summary: 'A collection in a loose, talkative voice about Canadian places, history and ordinary people; the book that established Purdy as a leading poet of the country.',
  },
  {
    id: 'work-poem-no-language-is-neutral', kind: 'work', name: 'No Language Is Neutral', author: 'Dionne Brand', year: 1990, language: 'English', region: 'Trinidad and Canada',
    genres: ['long poem', 'diaspora poetry', 'political poetry'], kw: ['dionne brand', 'no language is neutral', 'caribbean canadian poetry', 'language and empire', 'diaspora'], confidence: 'established',
    summary: 'A collection and long poem sequence that examines colonial language, migration and desire between the Caribbean and Canada, with a heightened, rhythmic voice.',
  },
  {
    id: 'work-poem-songs-of-a-sourdough', kind: 'work', name: 'Songs of a Sourdough', author: 'Robert Service', year: 1907, language: 'English', region: 'Canada',
    genres: ['ballad', 'narrative verse', 'popular poetry'], kw: ['robert service', 'songs of a sourdough', 'yukon ballads', 'klondike gold rush verse', 'cremation of sam mcgee'], confidence: 'established',
    summary: 'A popular book of rhymed, galloping ballads of the Yukon gold rush, issued in Toronto in 1907 and as The Spell of the Yukon in the United States; a model of the story-in-verse for recitation.',
  },
  {
    id: 'work-poem-collected-works-of-billy-the-kid', kind: 'work', name: 'The Collected Works of Billy the Kid', author: 'Michael Ondaatje', year: 1970, language: 'English', region: 'Canada',
    genres: ['hybrid poetry', 'prose poetry', 'documentary collage'], kw: ['ondaatje', 'billy the kid', 'poetry and prose collage', 'western myth', 'canadian modernist'], confidence: 'established',
    summary: 'A book that mixes poems, prose pieces, photographs and invented documents into a portrait of the outlaw as an artist of violence; a landmark of Canadian genre-blending.',
  },
  {
    id: 'work-poem-fredy-neptune', kind: 'work', name: 'Fredy Neptune: A Novel in Verse', author: 'Les Murray', year: 1998, language: 'English', region: 'Australia',
    genres: ['verse novel', 'narrative poem', 'long poem'], kw: ['les murray', 'fredy neptune', 'verse novel', 'australian german sailor', 'twentieth-century history in verse'], confidence: 'established',
    summary: 'A verse novel following an Australian sailor of German descent through the first half of the twentieth century, who loses the sense of pain after witnessing an atrocity; one of the best-known long poems from Australia.',
  },
  {
    id: 'work-poem-the-moving-image', kind: 'work', name: 'The Moving Image', author: 'Judith Wright', year: 1946, language: 'English', region: 'Australia',
    genres: ['lyric poetry', 'landscape poetry', 'nature poetry'], kw: ['judith wright', 'moving image', 'australian bush poetry', 'landscape and memory', 'first collection'], confidence: 'established',
    summary: 'Wright\'s first collection, with clear, musical poems of the Australian landscape, love and time; it set the course for her later poems of place and history.',
  },
  {
    id: 'work-poem-man-from-snowy-river', kind: 'work', name: 'The Man from Snowy River and Other Verses', author: 'A. B. "Banjo" Paterson', year: 1895, language: 'English', region: 'Australia',
    genres: ['bush ballad', 'narrative verse', 'popular poetry'], kw: ['banjo paterson', 'man from snowy river', 'bush ballads', 'australian verse', 'galloping rhythm'], confidence: 'established',
    summary: 'A very popular collection of rhymed bush ballads of riders, drovers and the outback, whose rolling rhythm is meant for recitation; a key book in Australian popular verse.',
  },
  {
    id: 'work-poem-we-are-going', kind: 'work', name: 'We Are Going', author: 'Oodgeroo Noonuccal (Kath Walker)', year: 1964, language: 'English', region: 'Australia',
    genres: ['protest poetry', 'lyric poetry', 'Indigenous poetry'], kw: ['oodgeroo', 'kath walker', 'we are going', 'aboriginal poet', 'australian protest poetry'], confidence: 'established',
    summary: 'A collection of direct, spoken-sounding poems on Aboriginal dispossession and hope, widely described as the first published book of poems by an Aboriginal Australian writer.',
  },
  {
    id: 'work-poem-no-ordinary-sun', kind: 'work', name: 'No Ordinary Sun', author: 'Hone Tuwhare', year: 1964, language: 'English', region: 'New Zealand',
    genres: ['lyric poetry', 'protest poetry', 'Māori poetry in English'], kw: ['hone tuwhare', 'no ordinary sun', 'maori poet', 'new zealand poetry', 'nuclear testing poem'], confidence: 'established',
    summary: 'An early and influential collection in English by a Māori poet, with plain, rhythmic poems of land, work, love and protest against nuclear testing; widely read in New Zealand.',
  },
  {
    id: 'work-poem-the-monkeys-mask', kind: 'work', name: 'The Monkey\'s Mask', author: 'Dorothy Porter', year: 1994, language: 'English', region: 'Australia',
    genres: ['verse novel', 'crime fiction in verse', 'lesbian detective story'], kw: ['dorothy porter', 'monkeys mask', 'verse crime novel', 'detective verse novel', 'australian poet'], confidence: 'established',
    summary: 'A crime novel told entirely in short poems by a lesbian private detective investigating a young woman\'s disappearance; a notable example of genre storytelling in verse.',
  },
];
