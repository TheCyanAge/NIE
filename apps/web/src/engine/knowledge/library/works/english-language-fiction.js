// Notable works: English-language novels and story collections from the early novel (1700s) to the 2020s, across the UK, Ireland, the United States, Canada, Australia, New Zealand, the Caribbean, South Asia and anglophone Africa.
// Reference data only. Year = first publication of the original (a serial or magazine appearance only where that came first and is the usual citation). Summaries are neutral and spoiler-free. No prizes are claimed.
// Crime, science fiction, fantasy, horror, children's and young-adult, poetry, drama and nonfiction live in their own files; works in translation live in world-fiction-in-translation.js.
export const PREFIX = 'work-en-fic-';
export default [
  // ---- The eighteenth-century novel ----
  {
    id: 'work-en-fic-robinson-crusoe', kind: 'work', name: 'Robinson Crusoe', author: 'Daniel Defoe', year: 1719, language: 'English', region: 'England', confidence: 'established',
    summary: 'A fictional first-person account of a man shipwrecked and living alone on a remote island, presented as a true memoir; often cited as an early English novel and a founding survival story.',
    kw: ['defoe', 'castaway', 'island', 'survival story', 'early novel', 'fictional memoir'], genres: ['early novel', 'survival narrative', 'fictional memoir'],
  },
  {
    id: 'work-en-fic-moll-flanders', kind: 'work', name: 'Moll Flanders', author: 'Daniel Defoe', year: 1722, language: 'English', region: 'England', confidence: 'established',
    summary: 'A fictional memoir of a woman who survives through wit, marriage and crime, told in a frank retrospective voice; an early English novel about money, class and self-reinvention.',
    kw: ['defoe', 'picaresque', 'fictional memoir', 'early novel', 'confessional narrator'], genres: ['picaresque', 'fictional memoir', 'early novel'],
  },
  {
    id: 'work-en-fic-a-journal-of-the-plague-year', kind: 'work', name: 'A Journal of the Plague Year', author: 'Daniel Defoe', year: 1722, language: 'English', region: 'England', confidence: 'established',
    summary: 'An invented eyewitness chronicle of the 1665 plague in London, written in the manner of a factual record; a model of documentary realism in fiction.',
    kw: ['defoe', 'plague', 'london', 'fake documentary', 'fictional chronicle', 'realism'], genres: ['historical fiction', 'fictional chronicle'],
  },
  {
    id: 'work-en-fic-pamela', kind: 'work', name: 'Pamela; or, Virtue Rewarded', author: 'Samuel Richardson', year: 1740, language: 'English', region: 'England', confidence: 'established',
    summary: "An epistolary novel told through a young servant's letters and journal as she resists her employer's advances; hugely popular in its day, widely parodied, and a landmark of the letter form and sentimental fiction.",
    kw: ['richardson', 'pamela', 'epistolary novel', 'letters', 'sentimental fiction'], genres: ['epistolary novel', 'sentimental fiction'],
  },
  {
    id: 'work-en-fic-clarissa', kind: 'work', name: 'Clarissa; or, The History of a Young Lady', author: 'Samuel Richardson', year: 1748, language: 'English', region: 'England', confidence: 'established',
    summary: "A very long epistolary novel in which several correspondents' letters build a tragedy around a young woman, her family's pressure over marriage and a determined suitor; admired for how letters reveal competing viewpoints.",
    kw: ['richardson', 'clarissa', 'epistolary novel', 'multiple viewpoints', 'letters'], genres: ['epistolary novel', 'tragedy'],
  },
  {
    id: 'work-en-fic-joseph-andrews', kind: 'work', name: 'Joseph Andrews', author: 'Henry Fielding', year: 1742, language: 'English', region: 'England', confidence: 'established',
    summary: "A comic novel that began as a parody of Pamela and follows a footman and the absent-minded Parson Adams along the road; Fielding described this kind of book as a comic epic in prose.",
    kw: ['fielding', 'comic novel', 'parody', 'picaresque', 'road novel'], genres: ['comic novel', 'picaresque', 'parody'],
  },
  {
    id: 'work-en-fic-tom-jones', kind: 'work', name: 'The History of Tom Jones, a Foundling', author: 'Henry Fielding', year: 1749, language: 'English', region: 'England', confidence: 'established',
    summary: "A comic novel following a foundling's adventures from the English countryside to London, told by a chatty narrator who opens each book with essays on the art of storytelling; a model of intricate plotting.",
    kw: ['fielding', 'tom jones', 'foundling', 'comic novel', 'intrusive narrator', 'plotting'], genres: ['comic novel', 'picaresque', 'bildungsroman'],
  },
  {
    id: 'work-en-fic-tristram-shandy', kind: 'work', name: 'The Life and Opinions of Tristram Shandy, Gentleman', author: 'Laurence Sterne', year: 1759, language: 'English', region: 'England', confidence: 'established',
    summary: "A comic novel in which the narrator's attempts to tell his life are endlessly interrupted by digressions and typographical play; an early and influential experiment in narrative form.",
    kw: ['sterne', 'tristram shandy', 'digression', 'metafiction', 'experimental novel', 'unreliable narrator'], genres: ['metafiction', 'comic novel', 'experimental novel'],
  },
  {
    id: 'work-en-fic-a-sentimental-journey', kind: 'work', name: 'A Sentimental Journey Through France and Italy', author: 'Laurence Sterne', year: 1768, language: 'English', region: 'England', confidence: 'established',
    summary: 'An unfinished travel narrative told by the whimsical Parson Yorick, who attends to small encounters and feelings rather than sights; a landmark of sentimental fiction.',
    kw: ['sterne', 'yorick', 'sentimental fiction', 'travel narrative', 'sensibility'], genres: ['sentimental fiction', 'travel narrative'],
  },
  {
    id: 'work-en-fic-the-vicar-of-wakefield', kind: 'work', name: 'The Vicar of Wakefield', author: 'Oliver Goldsmith', year: 1766, language: 'English', region: 'Ireland', confidence: 'established',
    summary: 'A novel narrated by a country clergyman whose family endures reversals of fortune; widely read and reprinted for generations after its publication.',
    kw: ['goldsmith', 'vicar', 'domestic novel', 'first person narrator', 'eighteenth century'], genres: ['domestic novel', 'sentimental fiction'],
  },
  {
    id: 'work-en-fic-evelina', kind: 'work', name: 'Evelina', author: 'Frances Burney', year: 1778, language: 'English', region: 'England', confidence: 'established',
    summary: "An epistolary novel following a young woman's first entry into London society, observing manners and missteps with comic and moral shrewdness; an influential early novel of manners by a woman writer.",
    kw: ['burney', 'frances burney', 'epistolary novel', 'novel of manners', 'debutante'], genres: ['epistolary novel', 'novel of manners'],
  },
  {
    id: 'work-en-fic-humphry-clinker', kind: 'work', name: 'The Expedition of Humphry Clinker', author: 'Tobias Smollett', year: 1771, language: 'English', region: 'Scotland', confidence: 'established',
    summary: "An epistolary comic novel in which the members of a travelling party describe a tour of Britain in their own letters, so the same places and events appear through several contrasting voices.",
    kw: ['smollett', 'humphry clinker', 'epistolary novel', 'multiple voices', 'travel', 'comic novel'], genres: ['epistolary novel', 'comic novel', 'travel fiction'],
  },
  {
    id: 'work-en-fic-rasselas', kind: 'work', name: 'The History of Rasselas, Prince of Abissinia', author: 'Samuel Johnson', year: 1759, language: 'English', region: 'England', confidence: 'established',
    summary: 'A short philosophical tale of a prince who leaves his secluded valley to search for a way of life that brings lasting happiness; a rare work of long fiction by Samuel Johnson.',
    kw: ['johnson', 'rasselas', 'philosophical tale', 'oriental tale', 'happiness'], genres: ['philosophical tale', 'apologue'],
  },
  {
    id: 'work-en-fic-the-man-of-feeling', kind: 'work', name: 'The Man of Feeling', author: 'Henry Mackenzie', year: 1771, language: 'English', region: 'Scotland', confidence: 'established',
    summary: 'A sentimental novel in loosely linked fragments about a kind, easily moved young man; it helped define the cult of sensibility in late eighteenth-century fiction.',
    kw: ['mackenzie', 'sensibility', 'sentimental novel', 'fragmentary narrative'], genres: ['sentimental fiction'],
  },
  {
    id: 'work-en-fic-caleb-williams', kind: 'work', name: 'Things as They Are; or, The Adventures of Caleb Williams', author: 'William Godwin', year: 1794, language: 'English', region: 'England', confidence: 'established',
    summary: "A novel of pursuit and surveillance in which a secretary uncovers his employer's secret and is hunted for it; shaped by Godwin's political thought and often described as an early thriller.",
    kw: ['godwin', 'caleb williams', 'jacobin novel', 'pursuit', 'novel of ideas', 'early thriller'], genres: ['novel of ideas', 'thriller', 'Jacobin novel'],
  },
  {
    id: 'work-en-fic-wieland', kind: 'work', name: 'Wieland; or, The Transformation', author: 'Charles Brockden Brown', year: 1798, language: 'English', region: 'United States', confidence: 'established',
    summary: "An early American Gothic novel narrated by a sister recounting how her family is overtaken by mysterious voices and religious fervour; one of the first notable American novels.",
    kw: ['charles brockden brown', 'american gothic', 'unreliable narrator', 'early american novel', 'religious mania'], genres: ['gothic fiction', 'early american novel'],
  },
  {
    id: 'work-en-fic-castle-rackrent', kind: 'work', name: 'Castle Rackrent', author: 'Maria Edgeworth', year: 1800, language: 'English', region: 'Ireland', confidence: 'established',
    summary: "A short novel narrated by an old family steward who recounts generations of an Anglo-Irish landlord family; an early Irish regional novel and an influential use of a partial, unreliable narrator.",
    kw: ['edgeworth', 'anglo-irish', 'regional novel', 'unreliable narrator', 'steward', 'irish novel'], genres: ['regional novel', 'satire', 'frame narrative'],
  },

  // ---- Austen and the Romantic era ----
  {
    id: 'work-en-fic-sense-and-sensibility', kind: 'work', name: 'Sense and Sensibility', author: 'Jane Austen', year: 1811, language: 'English', region: 'England', confidence: 'established',
    summary: "Austen's first published novel, following two sisters of opposed temperaments as they face money troubles and love; it sets reason and feeling against each other without simply choosing one.",
    kw: ['austen', 'jane austen', 'novel of manners', 'sisters', 'regency'], genres: ['novel of manners', 'domestic fiction'],
  },
  {
    id: 'work-en-fic-pride-and-prejudice', kind: 'work', name: 'Pride and Prejudice', author: 'Jane Austen', year: 1813, language: 'English', region: 'England', confidence: 'established',
    summary: 'A novel of manners in which a clever young woman and a proud, wealthy man must get past first impressions and social pressure; admired for its ironic narrator and fluid free indirect style.',
    kw: ['austen', 'jane austen', 'free indirect discourse', 'novel of manners', 'regency', 'first impressions'], genres: ['novel of manners', 'romance', 'comedy of manners'],
  },
  {
    id: 'work-en-fic-mansfield-park', kind: 'work', name: 'Mansfield Park', author: 'Jane Austen', year: 1814, language: 'English', region: 'England', confidence: 'established',
    summary: 'A novel about a poor relation raised in a wealthy household, noted for its quiet heroine and its questions about duty, propriety and the moral cost of money and position.',
    kw: ['austen', 'jane austen', 'poor relation', 'duty', 'novel of manners'], genres: ['novel of manners', 'domestic fiction'],
  },
  {
    id: 'work-en-fic-emma', kind: 'work', name: 'Emma', author: 'Jane Austen', year: 1815, language: 'English', region: 'England', confidence: 'established',
    summary: "A comic novel about a self-assured young woman who tries to arrange other people's romances and misreads what she sees; much studied for its close, ironic rendering of one point of view.",
    kw: ['austen', 'jane austen', 'matchmaking', 'free indirect discourse', 'point of view', 'comedy of manners'], genres: ['novel of manners', 'comic novel'],
  },
  {
    id: 'work-en-fic-persuasion', kind: 'work', name: 'Persuasion', author: 'Jane Austen', year: 1817, language: 'English', region: 'England', confidence: 'established',
    summary: "Austen's last completed novel, a quiet story of a woman offered a second chance with a man she once refused; noted for its autumnal mood and its attention to memory and regret.",
    kw: ['austen', 'jane austen', 'second chance', 'regret', 'novel of manners', 'published posthumously'], genres: ['novel of manners', 'romance'],
  },
  {
    id: 'work-en-fic-northanger-abbey', kind: 'work', name: 'Northanger Abbey', author: 'Jane Austen', year: 1817, language: 'English', region: 'England', confidence: 'established',
    summary: 'A comic novel about a young reader of Gothic fiction whose imagination runs ahead of reality; at once a parody of Gothic conventions and an affectionate coming-of-age story, published after Austen\'s death.',
    kw: ['austen', 'jane austen', 'gothic parody', 'satire of genre', 'coming of age', 'novel reader'], genres: ['parody', 'gothic fiction', 'bildungsroman'],
  },
  {
    id: 'work-en-fic-waverley', kind: 'work', name: 'Waverley', author: 'Walter Scott', year: 1814, language: 'English', region: 'Scotland', confidence: 'established',
    summary: 'A novel of the 1745 Jacobite rising seen through a young English officer drawn into Highland affairs; often called a founding work of the historical novel.',
    kw: ['scott', 'walter scott', 'historical novel', 'jacobite', 'scottish novel', 'highlands'], genres: ['historical novel', 'national tale'],
  },
  {
    id: 'work-en-fic-melmoth-the-wanderer', kind: 'work', name: 'Melmoth the Wanderer', author: 'Charles Robert Maturin', year: 1820, language: 'English', region: 'Ireland', confidence: 'established',
    summary: 'A Gothic novel built from nested tales around a man who has made a dark bargain for a long life; known for its framed narratives and its sombre, theatrical atmosphere.',
    kw: ['maturin', 'irish gothic', 'frame narrative', 'nested stories', 'gothic novel', 'wanderer'], genres: ['gothic fiction', 'frame narrative'],
  },
  {
    id: 'work-en-fic-confessions-of-a-justified-sinner', kind: 'work', name: 'The Private Memoirs and Confessions of a Justified Sinner', author: 'James Hogg', year: 1824, language: 'English', region: 'Scotland', confidence: 'established',
    summary: "A Scottish novel presented as an editor's account plus a sinner's own memoir, whose two versions unsettle the reader's sense of what is true; a landmark of the unreliable narrator and the double.",
    kw: ['hogg', 'scottish gothic', 'unreliable narrator', 'doppelganger', 'editor frame', 'double narrative'], genres: ['gothic fiction', 'frame narrative', 'psychological novel'],
  },

  // ---- Nineteenth-century America ----
  {
    id: 'work-en-fic-the-sketch-book', kind: 'work', name: 'The Sketch Book of Geoffrey Crayon, Gent.', author: 'Washington Irving', year: 1819, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A collection of essays and tales supposedly by an American traveller in England, including the stories of Rip Van Winkle and Sleepy Hollow; an early landmark of American short prose.',
    kw: ['irving', 'washington irving', 'rip van winkle', 'sleepy hollow', 'short prose', 'early american literature'], genres: ['short story collection', 'sketch'],
  },
  {
    id: 'work-en-fic-the-last-of-the-mohicans', kind: 'work', name: 'The Last of the Mohicans', author: 'James Fenimore Cooper', year: 1826, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A frontier adventure novel set during the Seven Years\' War in colonial North America; a founding work of American historical romance, now read critically for its portrayal of Native peoples.',
    kw: ['cooper', 'frontier novel', 'leatherstocking', 'historical romance', 'colonial america'], genres: ['historical romance', 'frontier fiction'],
  },
  {
    id: 'work-en-fic-twice-told-tales', kind: 'work', name: 'Twice-Told Tales', author: 'Nathaniel Hawthorne', year: 1837, language: 'English', region: 'United States', confidence: 'established',
    summary: "An early collection of Hawthorne's tales and sketches of New England history and moral life; it helped show the American short story's capacity for symbol and ambiguity.",
    kw: ['hawthorne', 'short story collection', 'new england', 'allegory', 'symbolism', 'dark romanticism'], genres: ['short story collection', 'dark romanticism'],
  },
  {
    id: 'work-en-fic-the-scarlet-letter', kind: 'work', name: 'The Scarlet Letter', author: 'Nathaniel Hawthorne', year: 1850, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel of Puritan New England about a woman publicly shamed for adultery and the men bound to her; a founding work of American literature, rich in symbolism and moral ambiguity.',
    kw: ['hawthorne', 'puritan', 'symbolism', 'new england', 'moral ambiguity', 'american romance'], genres: ['historical novel', 'american romance', 'dark romanticism'],
  },
  {
    id: 'work-en-fic-the-house-of-the-seven-gables', kind: 'work', name: 'The House of the Seven Gables', author: 'Nathaniel Hawthorne', year: 1851, language: 'English', region: 'United States', confidence: 'established',
    summary: "A Gothic-tinged novel about a New England family weighed down by an ancestral wrong and the old house that holds it; Hawthorne's study of inherited guilt.",
    kw: ['hawthorne', 'haunted house', 'inherited guilt', 'american gothic', 'family curse'], genres: ['gothic fiction', 'american romance'],
  },
  {
    id: 'work-en-fic-moby-dick', kind: 'work', name: 'Moby-Dick; or, The Whale', author: 'Herman Melville', year: 1851, language: 'English', region: 'United States', confidence: 'established',
    summary: "A sea novel about a whaling captain's obsession, mixing narrative, drama, natural history and philosophy; it was little admired at first and is now widely regarded as a cornerstone of American fiction.",
    kw: ['melville', 'whale', 'ahab', 'ishmael', 'sea novel', 'encyclopedic novel', 'obsession'], genres: ['sea novel', 'american romance', 'encyclopedic novel'],
  },
  {
    id: 'work-en-fic-bartleby-the-scrivener', kind: 'work', name: 'Bartleby, the Scrivener', author: 'Herman Melville', year: 1853, language: 'English', region: 'United States', confidence: 'established',
    summary: "A short story about a Wall Street copyist who meets every request with a polite refusal, told by his baffled employer; much studied for its unreliable narrator and its open meaning.",
    kw: ['melville', 'bartleby', 'short story', 'wall street', 'unreliable narrator', 'passive resistance'], genres: ['short story', 'literary fiction'],
  },
  {
    id: 'work-en-fic-the-confidence-man', kind: 'work', name: 'The Confidence-Man: His Masquerade', author: 'Herman Melville', year: 1857, language: 'English', region: 'United States', confidence: 'established',
    summary: "A satirical novel set aboard a Mississippi riverboat, where a shape-shifting stranger tests his fellow passengers' trust; a dense, ambiguous work about deception and belief.",
    kw: ['melville', 'riverboat', 'satire', 'trust', 'deception', 'masquerade'], genres: ['satire', 'allegorical novel'],
  },
  {
    id: 'work-en-fic-billy-budd-sailor', kind: 'work', name: 'Billy Budd, Sailor', author: 'Herman Melville', year: 1924, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A late novella of an innocent young sailor and a ship\'s master-at-arms, set aboard a warship in the 1790s; left in manuscript at Melville\'s death and first published in 1924.',
    kw: ['melville', 'novella', 'posthumous', 'navy', 'allegory', 'good and evil'], genres: ['novella', 'sea novel', 'allegory'],
  },
  {
    id: 'work-en-fic-uncle-toms-cabin', kind: 'work', name: "Uncle Tom's Cabin", author: 'Harriet Beecher Stowe', year: 1852, language: 'English', region: 'United States', confidence: 'established',
    summary: 'An anti-slavery novel following enslaved people and their enslavers across the American South; enormously popular in its time and influential on public debate, and since criticised for its stereotypes.',
    kw: ['stowe', 'abolitionist', 'sentimental novel', 'slavery', 'protest novel', 'bestseller'], genres: ['protest novel', 'sentimental fiction'],
  },
  {
    id: 'work-en-fic-clotel', kind: 'work', name: 'Clotel; or, The President\'s Daughter', author: 'William Wells Brown', year: 1853, language: 'English', region: 'United States', confidence: 'established',
    summary: 'An anti-slavery novel about the daughters of an enslaved woman, published in London; it is often described as the first novel by an African American author.',
    kw: ['william wells brown', 'abolitionist', 'african american literature', 'slave narrative', 'early black novel'], genres: ['protest novel', 'african american fiction'],
  },
  {
    id: 'work-en-fic-ruth-hall', kind: 'work', name: 'Ruth Hall', author: 'Fanny Fern', year: 1854, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A semi-autobiographical novel about a widow who supports her children by writing for newspapers; a bestseller in its day and an early portrait of a woman making a living from her pen.',
    kw: ['fanny fern', 'woman writer', 'newspaper columnist', 'domestic fiction', 'writing life', 'autofiction'], genres: ['domestic fiction', 'autobiographical novel'],
  },
  {
    id: 'work-en-fic-our-nig', kind: 'work', name: 'Our Nig; or, Sketches from the Life of a Free Black', author: 'Harriet E. Wilson', year: 1859, language: 'English', region: 'United States', confidence: 'established',
    summary: 'An early novel by an African American woman, drawing on a free Black girl\'s life as an indentured servant in a white New England household; rediscovered and republished in the twentieth century.',
    kw: ['harriet wilson', 'african american literature', 'indentured servant', 'autobiographical novel', 'new england', 'rediscovered text'], genres: ['autobiographical novel', 'african american fiction'],
  },
  // ---- The Victorian novel ----
  {
    id: 'work-en-fic-the-pickwick-papers', kind: 'work', name: 'The Pickwick Papers', author: 'Charles Dickens', year: 1836, language: 'English', region: 'England', confidence: 'established',
    summary: "Dickens's first novel, issued in monthly parts, following a genial club president and his friends on comic journeys through England; its serial success helped establish the part-issue novel.",
    kw: ['dickens', 'serial novel', 'monthly parts', 'comic novel', 'picaresque', 'sam weller'], genres: ['comic novel', 'serial fiction', 'picaresque'],
  },
  {
    id: 'work-en-fic-oliver-twist', kind: 'work', name: 'Oliver Twist', author: 'Charles Dickens', year: 1838, language: 'English', region: 'England', confidence: 'established',
    summary: "A novel of an orphan born in a workhouse who falls among London's thieves; it drew attention to poverty, the Poor Law and street crime and remains among Dickens's most adapted works.",
    kw: ['dickens', 'orphan', 'workhouse', 'poor law', 'social novel', 'victorian london'], genres: ['social novel', 'bildungsroman'],
  },
  {
    id: 'work-en-fic-a-christmas-carol', kind: 'work', name: 'A Christmas Carol', author: 'Charles Dickens', year: 1843, language: 'English', region: 'England', confidence: 'established',
    summary: 'A short ghost story of a miserly man visited on Christmas Eve by spirits who show him his past, present and future; a compact model of the moral fable and the story that forces a reckoning.',
    kw: ['dickens', 'christmas', 'ghost story', 'novella', 'moral fable', 'scrooge'], genres: ['novella', 'ghost story', 'moral fable'],
  },
  {
    id: 'work-en-fic-david-copperfield', kind: 'work', name: 'David Copperfield', author: 'Charles Dickens', year: 1850, language: 'English', region: 'England', confidence: 'established',
    summary: "A first-person bildungsroman following a man from a hard childhood to a career as a writer; it draws partly on Dickens's own life and is a touchstone for the novel of growing up.",
    kw: ['dickens', 'bildungsroman', 'first person narrator', 'coming of age', 'autobiographical novel', 'writer protagonist'], genres: ['bildungsroman', 'autobiographical novel'],
  },
  {
    id: 'work-en-fic-bleak-house', kind: 'work', name: 'Bleak House', author: 'Charles Dickens', year: 1853, language: 'English', region: 'England', confidence: 'established',
    summary: "A sprawling novel centred on an endless lawsuit in the Court of Chancery, alternating a present-tense third-person narrator with a first-person woman narrator; a landmark of the multi-strand plot and of satire on institutions.",
    kw: ['dickens', 'chancery', 'multiple narrators', 'multi-strand plot', 'satire of institutions', 'present tense narration'], genres: ['social novel', 'mystery', 'satire'],
  },
  {
    id: 'work-en-fic-hard-times', kind: 'work', name: 'Hard Times', author: 'Charles Dickens', year: 1854, language: 'English', region: 'England', confidence: 'established',
    summary: 'A short, pointed social novel set in the industrial town of Coketown that criticises a narrow, facts-only approach to education, work and feeling.',
    kw: ['dickens', 'industrial novel', 'utilitarianism', 'education', 'condition of england', 'coketown'], genres: ['social novel', 'industrial novel'],
  },
  {
    id: 'work-en-fic-little-dorrit', kind: 'work', name: 'Little Dorrit', author: 'Charles Dickens', year: 1857, language: 'English', region: 'England', confidence: 'established',
    summary: "A long, darker novel of debt, imprisonment and bureaucracy centred on a family tied to the Marshalsea debtors' prison; Dickens's study of institutions that trap people.",
    kw: ['dickens', 'debtors prison', 'bureaucracy', 'marshalsea', 'social novel', 'victorian'], genres: ['social novel', 'satire'],
  },
  {
    id: 'work-en-fic-a-tale-of-two-cities', kind: 'work', name: 'A Tale of Two Cities', author: 'Charles Dickens', year: 1859, language: 'English', region: 'England', confidence: 'established',
    summary: 'A historical novel set in London and Paris before and during the French Revolution, published in weekly instalments; among the most widely read of Dickens\'s books.',
    kw: ['dickens', 'french revolution', 'historical novel', 'weekly serial', 'london and paris'], genres: ['historical novel', 'serial fiction'],
  },
  {
    id: 'work-en-fic-great-expectations', kind: 'work', name: 'Great Expectations', author: 'Charles Dickens', year: 1861, language: 'English', region: 'England', confidence: 'established',
    summary: "A first-person novel of a blacksmith's apprentice who comes into unexpected fortune and learns what it costs; admired for tight plotting, retrospective narration and its study of class and self-image.",
    kw: ['dickens', 'bildungsroman', 'retrospective narrator', 'class', 'first person narrator', 'pip'], genres: ['bildungsroman', 'social novel'],
  },
  {
    id: 'work-en-fic-our-mutual-friend', kind: 'work', name: 'Our Mutual Friend', author: 'Charles Dickens', year: 1865, language: 'English', region: 'England', confidence: 'established',
    summary: "Dickens's last completed novel, a satire of money and class set around London's river and a fortune left in a will, with a large interwoven cast.",
    kw: ['dickens', 'thames', 'inheritance', 'money', 'satire', 'ensemble cast'], genres: ['social novel', 'satire'],
  },
  {
    id: 'work-en-fic-vanity-fair', kind: 'work', name: 'Vanity Fair', author: 'William Makepeace Thackeray', year: 1848, language: 'English', region: 'England', confidence: 'established',
    summary: 'A satirical novel following two contrasting young women through English society in the era of the Napoleonic wars, with a narrator who calls his characters puppets; subtitled A Novel without a Hero.',
    kw: ['thackeray', 'satire', 'intrusive narrator', 'society', 'serial novel', 'novel without a hero'], genres: ['satire', 'social novel'],
  },
  {
    id: 'work-en-fic-jane-eyre', kind: 'work', name: 'Jane Eyre', author: 'Charlotte Brontë', year: 1847, language: 'English', region: 'England', confidence: 'established',
    summary: 'A first-person novel of an orphaned governess who builds her independence and refuses to trade her conscience for comfort; a blend of social realism, romance and Gothic suspense.',
    kw: ['bronte', 'charlotte bronte', 'governess', 'gothic romance', 'first person narrator', 'bildungsroman'], genres: ['bildungsroman', 'gothic fiction', 'romance'],
  },
  {
    id: 'work-en-fic-wuthering-heights', kind: 'work', name: 'Wuthering Heights', author: 'Emily Brontë', year: 1847, language: 'English', region: 'England', confidence: 'established',
    summary: "A novel of two households on the Yorkshire moors, told through nested accounts framed by an outsider; admired for its intensity, its layered storytelling and its refusal of easy moral judgment.",
    kw: ['bronte', 'emily bronte', 'moors', 'frame narrative', 'nested narrators', 'gothic'], genres: ['gothic fiction', 'frame narrative', 'tragedy'],
  },
  {
    id: 'work-en-fic-the-tenant-of-wildfell-hall', kind: 'work', name: 'The Tenant of Wildfell Hall', author: 'Anne Brontë', year: 1848, language: 'English', region: 'England', confidence: 'established',
    summary: "A novel in which a mysterious newcomer's secluded life is gradually explained by her diary; frank about marriage and a wife's legal position in its day.",
    kw: ['bronte', 'anne bronte', 'diary', 'frame narrative', 'marriage', 'victorian women'], genres: ['epistolary-style frame narrative', 'social novel'],
  },
  {
    id: 'work-en-fic-villette', kind: 'work', name: 'Villette', author: 'Charlotte Brontë', year: 1853, language: 'English', region: 'England', confidence: 'established',
    summary: "Charlotte Brontë's last novel published in her lifetime, narrated by a reserved Englishwoman who becomes a teacher in a Belgian town; noted for its guarded, withholding first-person voice.",
    kw: ['bronte', 'charlotte bronte', 'unreliable narrator', 'reserved narrator', 'teacher', 'belgium'], genres: ['psychological novel', 'bildungsroman'],
  },
  {
    id: 'work-en-fic-mary-barton', kind: 'work', name: 'Mary Barton', author: 'Elizabeth Gaskell', year: 1848, language: 'English', region: 'England', confidence: 'established',
    summary: 'An early industrial novel of working-class life in Manchester in the 1840s, written to make factory workers and their hardships understood by middle-class readers.',
    kw: ['gaskell', 'industrial novel', 'manchester', 'working class', 'condition of england', 'social novel'], genres: ['industrial novel', 'social novel'],
  },
  {
    id: 'work-en-fic-cranford', kind: 'work', name: 'Cranford', author: 'Elizabeth Gaskell', year: 1853, language: 'English', region: 'England', confidence: 'established',
    summary: 'A gently comic, episodic novel about the women of a small market town facing change; admired for its warm, understated humour and its sketch-like structure.',
    kw: ['gaskell', 'small town', 'episodic novel', 'gentle comedy', 'sketches', 'victorian women'], genres: ['episodic novel', 'comic novel'],
  },
  {
    id: 'work-en-fic-north-and-south', kind: 'work', name: 'North and South', author: 'Elizabeth Gaskell', year: 1855, language: 'English', region: 'England', confidence: 'established',
    summary: "A novel that sets a southern clergyman's daughter against the industrial north of England, exploring class conflict and mutual understanding through a love story.",
    kw: ['gaskell', 'industrial novel', 'class conflict', 'mill owner', 'serial novel', 'social novel'], genres: ['industrial novel', 'social novel', 'romance'],
  },
  {
    id: 'work-en-fic-adam-bede', kind: 'work', name: 'Adam Bede', author: 'George Eliot', year: 1859, language: 'English', region: 'England', confidence: 'established',
    summary: "George Eliot's first full-length novel, a rural story of love and ruin set in 1799 that argues for sympathy with ordinary lives; an early statement of her realism.",
    kw: ['george eliot', 'realism', 'rural novel', 'sympathy', 'victorian realism', 'mary ann evans'], genres: ['realist novel', 'rural fiction'],
  },
  {
    id: 'work-en-fic-the-mill-on-the-floss', kind: 'work', name: 'The Mill on the Floss', author: 'George Eliot', year: 1860, language: 'English', region: 'England', confidence: 'established',
    summary: "A novel of a brother and sister growing up in a provincial mill town, drawing partly on Eliot's own childhood; a study of family loyalty and the limits placed on women's opportunities.",
    kw: ['george eliot', 'siblings', 'provincial life', 'family loyalty', 'victorian women', 'realism'], genres: ['realist novel', 'bildungsroman'],
  },
  {
    id: 'work-en-fic-silas-marner', kind: 'work', name: 'Silas Marner', author: 'George Eliot', year: 1861, language: 'English', region: 'England', confidence: 'established',
    summary: 'A short novel about a withdrawn weaver whose life is changed by an unexpected child; admired for blending close realism with the shape of a folk tale.',
    kw: ['george eliot', 'weaver', 'folk tale', 'short novel', 'redemption', 'village life'], genres: ['realist novel', 'novella'],
  },
  {
    id: 'work-en-fic-middlemarch', kind: 'work', name: 'Middlemarch', author: 'George Eliot', year: 1871, language: 'English', region: 'England', confidence: 'established',
    summary: 'A panoramic novel of provincial English life, issued in eight parts across 1871 and 1872, that follows interlocking households through marriage, ambition, reform and money; often cited as a high point of the omniscient narrator.',
    kw: ['george eliot', 'omniscient narrator', 'provincial life', 'ensemble cast', 'victorian realism', 'multi-plot novel'], genres: ['realist novel', 'multi-plot novel', 'social novel'],
  },
  {
    id: 'work-en-fic-daniel-deronda', kind: 'work', name: 'Daniel Deronda', author: 'George Eliot', year: 1876, language: 'English', region: 'England', confidence: 'established',
    summary: "Eliot's last novel, interweaving the story of a self-absorbed young woman with that of a man exploring his heritage; notable for its serious attention to Jewish identity in Victorian fiction.",
    kw: ['george eliot', 'jewish identity', 'victorian realism', 'two plots', 'psychological novel'], genres: ['realist novel', 'psychological novel'],
  },
  {
    id: 'work-en-fic-the-warden', kind: 'work', name: 'The Warden', author: 'Anthony Trollope', year: 1855, language: 'English', region: 'England', confidence: 'established',
    summary: "A short novel about a gentle clergyman whose comfortable post is attacked by reformers and the press; the first of Trollope's Barsetshire series.",
    kw: ['trollope', 'barsetshire', 'church', 'reform', 'series opener', 'victorian'], genres: ['social novel', 'comedy of manners', 'series fiction'],
  },
  {
    id: 'work-en-fic-barchester-towers', kind: 'work', name: 'Barchester Towers', author: 'Anthony Trollope', year: 1857, language: 'English', region: 'England', confidence: 'established',
    summary: 'A comic novel of rival factions in a cathedral town, mixing church politics, ambition and courtship; the second of the Barsetshire novels.',
    kw: ['trollope', 'barsetshire', 'cathedral town', 'church politics', 'comic novel', 'series fiction'], genres: ['comic novel', 'comedy of manners', 'series fiction'],
  },
  {
    id: 'work-en-fic-the-way-we-live-now', kind: 'work', name: 'The Way We Live Now', author: 'Anthony Trollope', year: 1875, language: 'English', region: 'England', confidence: 'established',
    summary: 'A long satirical novel of speculation, financial fraud and social climbing in Victorian London; widely read as a portrait of a money-driven society.',
    kw: ['trollope', 'financial fraud', 'speculation', 'satire', 'victorian london', 'money'], genres: ['satire', 'social novel'],
  },
  {
    id: 'work-en-fic-far-from-the-madding-crowd', kind: 'work', name: 'Far from the Madding Crowd', author: 'Thomas Hardy', year: 1874, language: 'English', region: 'England', confidence: 'established',
    summary: "A novel of a self-reliant young woman farmer and three very different suitors in rural Wessex; Hardy's first major success and the first book to use the Wessex setting by name.",
    kw: ['hardy', 'wessex', 'farm', 'suitors', 'rural novel', 'victorian'], genres: ['rural fiction', 'romance', 'realist novel'],
  },
  {
    id: 'work-en-fic-the-return-of-the-native', kind: 'work', name: 'The Return of the Native', author: 'Thomas Hardy', year: 1878, language: 'English', region: 'England', confidence: 'established',
    summary: "A novel in which the brooding Egdon Heath is almost a character, shaping the hopes and mistakes of a small community; admired for landscape that works as fate.",
    kw: ['hardy', 'egdon heath', 'wessex', 'landscape as character', 'fate', 'tragedy'], genres: ['tragedy', 'rural fiction', 'realist novel'],
  },
  {
    id: 'work-en-fic-the-mayor-of-casterbridge', kind: 'work', name: 'The Mayor of Casterbridge', author: 'Thomas Hardy', year: 1886, language: 'English', region: 'England', confidence: 'established',
    summary: 'A tragedy of a hay-trader who rises to civic prominence while carrying a secret from his past; built around character and consequence rather than coincidence alone.',
    kw: ['hardy', 'wessex', 'tragedy', 'character and fate', 'secret past', 'victorian'], genres: ['tragedy', 'realist novel'],
  },
  {
    id: 'work-en-fic-tess-of-the-durbervilles', kind: 'work', name: "Tess of the d'Urbervilles", author: 'Thomas Hardy', year: 1891, language: 'English', region: 'England', confidence: 'established',
    summary: "A novel of a rural young woman whose life is shaped by class, chance and a double standard of sexual morality; controversial on publication and subtitled A Pure Woman.",
    kw: ['hardy', 'tess', 'wessex', 'double standard', 'tragedy', 'victorian women'], genres: ['tragedy', 'realist novel', 'social novel'],
  },
  {
    id: 'work-en-fic-jude-the-obscure', kind: 'work', name: 'Jude the Obscure', author: 'Thomas Hardy', year: 1895, language: 'English', region: 'England', confidence: 'established',
    summary: "Hardy's last major novel, about a stonemason who longs for education and for a marriage that does not fit social rules; its frankness about class, religion and marriage provoked fierce criticism.",
    kw: ['hardy', 'stonemason', 'education', 'class barriers', 'marriage', 'tragedy'], genres: ['tragedy', 'realist novel', 'social novel'],
  },
  {
    id: 'work-en-fic-sybil', kind: 'work', name: 'Sybil; or, The Two Nations', author: 'Benjamin Disraeli', year: 1845, language: 'English', region: 'England', confidence: 'established',
    summary: 'A political novel about the gulf between rich and poor in 1840s England; a leading example of the condition-of-England novel, written by a future prime minister.',
    kw: ['disraeli', 'condition of england', 'political novel', 'two nations', 'chartism', 'social novel'], genres: ['political novel', 'social novel'],
  },
  {
    id: 'work-en-fic-the-egoist', kind: 'work', name: 'The Egoist', author: 'George Meredith', year: 1879, language: 'English', region: 'England', confidence: 'established',
    summary: "A comic novel that examines a wealthy man's vanity with a narrator who treats the subject as a comedy of the mind; admired for its analytic wit and a famously demanding prose style.",
    kw: ['meredith', 'comedy of ideas', 'vanity', 'dense prose style', 'victorian comedy'], genres: ['comedy of manners', 'psychological novel'],
  },
  {
    id: 'work-en-fic-new-grub-street', kind: 'work', name: 'New Grub Street', author: 'George Gissing', year: 1891, language: 'English', region: 'England', confidence: 'established',
    summary: "A novel of London's literary marketplace that contrasts a principled, struggling novelist with commercial journalists; a classic portrait of writing as a trade.",
    kw: ['gissing', 'writing life', 'literary marketplace', 'poverty', 'publishing', 'victorian london'], genres: ['realist novel', 'social novel', 'naturalism'],
  },
  {
    id: 'work-en-fic-the-way-of-all-flesh', kind: 'work', name: 'The Way of All Flesh', author: 'Samuel Butler', year: 1903, language: 'English', region: 'England', confidence: 'established',
    summary: 'A semi-autobiographical novel about several generations of a clerical family, critical of Victorian parenting and religion; written decades earlier and published after Butler\'s death.',
    kw: ['samuel butler', 'family saga', 'victorian parenting', 'autobiographical novel', 'posthumous', 'satire'], genres: ['bildungsroman', 'family saga', 'satire'],
  },
  {
    id: 'work-en-fic-the-story-of-an-african-farm', kind: 'work', name: 'The Story of an African Farm', author: 'Olive Schreiner', year: 1883, language: 'English', region: 'South Africa', confidence: 'established',
    summary: 'A novel set on a remote South African farm, following young people growing up amid questions of faith and the roles of women; first published under a male pseudonym.',
    kw: ['schreiner', 'south african literature', 'farm', 'faith and doubt', 'feminism', 'pseudonym'], genres: ['bildungsroman', 'realist novel'],
  },
  {
    id: 'work-en-fic-kim', kind: 'work', name: 'Kim', author: 'Rudyard Kipling', year: 1901, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: "A novel of an orphan boy on the roads of British India, drawn into espionage and a holy man's quest; noted for its vivid sense of place and busy cast, and read today with attention to its imperial viewpoint.",
    kw: ['kipling', 'british india', 'espionage', 'picaresque', 'colonial fiction', 'road novel'], genres: ['adventure novel', 'picaresque', 'colonial fiction'],
  },
  {
    id: 'work-en-fic-plain-tales-from-the-hills', kind: 'work', name: 'Plain Tales from the Hills', author: 'Rudyard Kipling', year: 1888, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'An early collection of brief stories and sketches of British and Indian life in colonial India, showing a young writer\'s command of compression and the twist ending.',
    kw: ['kipling', 'short stories', 'british india', 'compression', 'twist ending', 'colonial fiction'], genres: ['short story collection', 'colonial fiction'],
  },
  {
    id: 'work-en-fic-the-old-wives-tale', kind: 'work', name: "The Old Wives' Tale", author: 'Arnold Bennett', year: 1908, language: 'English', region: 'England', confidence: 'established',
    summary: "A novel following two sisters across their lives, from the Staffordshire Potteries to Paris and back, patient in its attention to the passing of time; a major English realist novel of the early twentieth century.",
    kw: ['arnold bennett', 'sisters', 'potteries', 'passage of time', 'edwardian realism', 'life span novel'], genres: ['realist novel', 'family saga'],
  },
  // ---- American realism and the Gilded Age ----
  {
    id: 'work-en-fic-the-celebrated-jumping-frog', kind: 'work', name: 'The Celebrated Jumping Frog of Calaveras County', author: 'Mark Twain', year: 1865, language: 'English', region: 'United States', confidence: 'established',
    summary: "An early tall tale told by a deadpan storyteller about a gambling man and his trained frog; the story that first brought Mark Twain national attention.",
    kw: ['twain', 'tall tale', 'frame story', 'deadpan narrator', 'humor', 'short story'], genres: ['tall tale', 'short story', 'humorous fiction'],
  },
  {
    id: 'work-en-fic-adventures-of-huckleberry-finn', kind: 'work', name: 'Adventures of Huckleberry Finn', author: 'Mark Twain', year: 1884, language: 'English', region: 'United States', confidence: 'established',
    summary: "A first-person novel of a boy and an escaped enslaved man travelling down the Mississippi, written in a vernacular voice; a landmark of American narrative voice that is still debated for its language and its treatment of race.",
    kw: ['twain', 'huck finn', 'vernacular voice', 'mississippi', 'dialect', 'first person narrator', 'banned books'], genres: ['picaresque', 'bildungsroman', 'american vernacular fiction'],
  },
  {
    id: 'work-en-fic-pudd-nhead-wilson', kind: 'work', name: "Pudd'nhead Wilson", author: 'Mark Twain', year: 1894, language: 'English', region: 'United States', confidence: 'established',
    summary: "A novel set in a Missouri river town about two babies exchanged at birth and a lawyer who collects fingerprints; Twain's sharp, sardonic exploration of race and identity.",
    kw: ['twain', 'identity', 'race', 'fingerprints', 'courtroom', 'satire'], genres: ['satire', 'courtroom novel'],
  },
  {
    id: 'work-en-fic-the-rise-of-silas-lapham', kind: 'work', name: 'The Rise of Silas Lapham', author: 'William Dean Howells', year: 1885, language: 'English', region: 'United States', confidence: 'established',
    summary: "A realist novel about a self-made paint manufacturer's rise into Boston society and the moral tests that follow; a central work of American literary realism.",
    kw: ['howells', 'realism', 'self-made man', 'boston', 'moral choice', 'gilded age'], genres: ['realist novel', 'novel of manners'],
  },
  {
    id: 'work-en-fic-the-country-of-the-pointed-firs', kind: 'work', name: 'The Country of the Pointed Firs', author: 'Sarah Orne Jewett', year: 1896, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel built from linked sketches of a Maine coastal village, told by a visiting writer; a model of regional writing and of the loosely connected narrative.',
    kw: ['jewett', 'maine', 'regionalism', 'local color', 'linked sketches', 'woman writer narrator'], genres: ['regional fiction', 'linked stories'],
  },
  {
    id: 'work-en-fic-the-awakening', kind: 'work', name: 'The Awakening', author: 'Kate Chopin', year: 1899, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A short novel of a married woman in Louisiana who begins to question the roles expected of her; controversial in its day and later recognised as an early feminist work.',
    kw: ['chopin', 'louisiana', 'feminist novel', 'marriage', 'selfhood', 'creole'], genres: ['realist novel', 'feminist fiction'],
  },
  {
    id: 'work-en-fic-the-conjure-woman', kind: 'work', name: 'The Conjure Woman', author: 'Charles W. Chesnutt', year: 1899, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A collection of stories in which a formerly enslaved man tells plantation tales in dialect to a northern couple; a layered, ironic frame on slavery, power and who gets to tell the story.',
    kw: ['chesnutt', 'frame narrative', 'dialect', 'plantation tales', 'african american literature', 'storytelling'], genres: ['short story collection', 'frame narrative'],
  },
  {
    id: 'work-en-fic-daisy-miller', kind: 'work', name: 'Daisy Miller', author: 'Henry James', year: 1878, language: 'English', region: 'United States', confidence: 'established',
    summary: "A novella about a young American woman travelling in Europe whose openness collides with the expectations of the expatriate community; an early example of James's international theme.",
    kw: ['james', 'henry james', 'international theme', 'novella', 'americans in europe', 'social judgment'], genres: ['novella', 'novel of manners'],
  },
  {
    id: 'work-en-fic-washington-square', kind: 'work', name: 'Washington Square', author: 'Henry James', year: 1880, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A short novel of a plain, shy heiress, her controlling father and her charming suitor in mid-nineteenth-century New York; admired for its restraint and its cool, ironic narrator.',
    kw: ['james', 'henry james', 'new york', 'heiress', 'irony', 'restraint'], genres: ['psychological novel', 'novel of manners'],
  },
  {
    id: 'work-en-fic-the-portrait-of-a-lady', kind: 'work', name: 'The Portrait of a Lady', author: 'Henry James', year: 1881, language: 'English', region: 'United States', confidence: 'established',
    summary: "A novel of an independent young American woman who inherits money and travels to Europe, where her choices test her idea of freedom; a showpiece of psychological realism.",
    kw: ['james', 'henry james', 'psychological realism', 'independence', 'americans in europe', 'interiority'], genres: ['psychological novel', 'novel of manners'],
  },
  {
    id: 'work-en-fic-what-maisie-knew', kind: 'work', name: 'What Maisie Knew', author: 'Henry James', year: 1897, language: 'English', region: 'United States', confidence: 'established',
    summary: "A novel told largely through the perceptions of a child caught between her divorcing parents, showing how much she sees and how little she can interpret; a model of limited point of view.",
    kw: ['james', 'henry james', 'child narrator', 'limited point of view', 'divorce', 'perception'], genres: ['psychological novel', 'child perspective'],
  },
  {
    id: 'work-en-fic-the-wings-of-the-dove', kind: 'work', name: 'The Wings of the Dove', author: 'Henry James', year: 1902, language: 'English', region: 'United States', confidence: 'established',
    summary: "A late novel of money, love and concealment among a small circle in London and Venice; known for the elaborate, indirect prose of James's later style.",
    kw: ['james', 'henry james', 'late style', 'london and venice', 'moral complexity', 'dense prose'], genres: ['psychological novel'],
  },
  {
    id: 'work-en-fic-the-ambassadors', kind: 'work', name: 'The Ambassadors', author: 'Henry James', year: 1903, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel of a middle-aged American sent to Paris to bring a young man home, and what he comes to see there; an exemplar of sustained single point of view.',
    kw: ['james', 'henry james', 'point of view', 'paris', 'central consciousness', 'late style'], genres: ['psychological novel', 'novel of manners'],
  },
  {
    id: 'work-en-fic-the-house-of-mirth', kind: 'work', name: 'The House of Mirth', author: 'Edith Wharton', year: 1905, language: 'English', region: 'United States', confidence: 'established',
    summary: "A novel of a New York society woman with few resources and exacting social rules; Wharton's sharp study of marriage as a market and of reputation as currency.",
    kw: ['wharton', 'edith wharton', 'new york society', 'marriage market', 'reputation', 'novel of manners'], genres: ['novel of manners', 'social novel', 'tragedy'],
  },
  {
    id: 'work-en-fic-ethan-frome', kind: 'work', name: 'Ethan Frome', author: 'Edith Wharton', year: 1911, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A short framed novel of a poor farmer and the two women in his life in a bleak Massachusetts winter; a model of compression and of the outsider narrator who pieces a story together.',
    kw: ['wharton', 'edith wharton', 'frame narrative', 'new england', 'compression', 'winter'], genres: ['novella', 'tragedy', 'frame narrative'],
  },
  {
    id: 'work-en-fic-the-age-of-innocence', kind: 'work', name: 'The Age of Innocence', author: 'Edith Wharton', year: 1920, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel of 1870s New York high society and a man torn between convention and desire; a precise study of social codes, written with the distance of a generation.',
    kw: ['wharton', 'edith wharton', 'new york', 'social codes', 'convention', 'historical distance'], genres: ['novel of manners', 'historical novel'],
  },
  {
    id: 'work-en-fic-my-antonia', kind: 'work', name: 'My Ántonia', author: 'Willa Cather', year: 1918, language: 'English', region: 'United States', confidence: 'established',
    summary: "A novel narrated by a man remembering a friend from the Nebraska prairie of his childhood, using a frame that both distances and idealises memory; central to Cather's prairie fiction.",
    kw: ['cather', 'willa cather', 'nebraska', 'prairie', 'memory', 'frame narrative', 'immigrant farm'], genres: ['regional fiction', 'frame narrative', 'pastoral'],
  },
  {
    id: 'work-en-fic-the-professors-house', kind: 'work', name: "The Professor's House", author: 'Willa Cather', year: 1925, language: 'English', region: 'United States', confidence: 'established',
    summary: "A novel of a university professor in midlife that encloses a long inset story of the American Southwest; known for its unusual three-part, nested structure.",
    kw: ['cather', 'willa cather', 'inset narrative', 'midlife', 'nested structure', 'southwest'], genres: ['literary fiction', 'frame narrative'],
  },
  {
    id: 'work-en-fic-death-comes-for-the-archbishop', kind: 'work', name: 'Death Comes for the Archbishop', author: 'Willa Cather', year: 1927, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel in episodes about a French priest who becomes bishop in the nineteenth-century New Mexico territory; written in a calm, spare style close to a legend.',
    kw: ['cather', 'willa cather', 'new mexico', 'episodic novel', 'spare prose', 'frontier faith'], genres: ['historical novel', 'episodic novel'],
  },
  {
    id: 'work-en-fic-sister-carrie', kind: 'work', name: 'Sister Carrie', author: 'Theodore Dreiser', year: 1900, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A naturalist novel following a young woman from small-town Wisconsin to Chicago and New York; frank about money and desire, it was poorly promoted on first release and later recognised as a landmark.',
    kw: ['dreiser', 'naturalism', 'chicago', 'ambition', 'urban novel', 'consumer desire'], genres: ['naturalist novel', 'urban fiction'],
  },
  {
    id: 'work-en-fic-an-american-tragedy', kind: 'work', name: 'An American Tragedy', author: 'Theodore Dreiser', year: 1925, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A long naturalist novel following a young man from a poor family through social ambition to a fatal choice, partly based on a real crime; a study of class pressure and desire.',
    kw: ['dreiser', 'naturalism', 'class', 'ambition', 'true crime inspired', 'social determinism'], genres: ['naturalist novel', 'social novel'],
  },
  {
    id: 'work-en-fic-the-jungle', kind: 'work', name: 'The Jungle', author: 'Upton Sinclair', year: 1906, language: 'English', region: 'United States', confidence: 'established',
    summary: "A novel of immigrant workers in Chicago's meatpacking industry written to expose labour conditions; its descriptions of food processing prompted public outcry and made it a famous example of fiction as reform.",
    kw: ['sinclair', 'muckraking', 'meatpacking', 'immigrant workers', 'social reform', 'protest novel'], genres: ['social novel', 'muckraking fiction', 'protest novel'],
  },
  {
    id: 'work-en-fic-martin-eden', kind: 'work', name: 'Martin Eden', author: 'Jack London', year: 1909, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A semi-autobiographical novel of a young sailor who teaches himself to be a writer; an unvarnished picture of the long struggle to be published and what success does to a person.',
    kw: ['jack london', 'writer protagonist', 'self-education', 'rejection slips', 'autobiographical novel', 'ambition'], genres: ['bildungsroman', 'autobiographical novel', 'kunstlerroman'],
  },
  {
    id: 'work-en-fic-the-autobiography-of-an-ex-colored-man', kind: 'work', name: 'The Autobiography of an Ex-Colored Man', author: 'James Weldon Johnson', year: 1912, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A fictional memoir, first published anonymously, of a man of mixed heritage who moves between Black and white worlds; an early landmark of African American fiction and of the passing narrative.',
    kw: ['james weldon johnson', 'passing narrative', 'fictional memoir', 'anonymous publication', 'african american literature', 'identity'], genres: ['fictional memoir', 'passing narrative'],
  },
  {
    id: 'work-en-fic-maggie-a-girl-of-the-streets', kind: 'work', name: 'Maggie: A Girl of the Streets', author: 'Stephen Crane', year: 1893, language: 'English', region: 'United States', confidence: 'established',
    summary: "A short naturalist novel of a girl in New York's Bowery slums, first privately printed at the author's own expense; an early landmark of American naturalism.",
    kw: ['stephen crane', 'naturalism', 'bowery', 'slums', 'self-published', 'urban realism'], genres: ['naturalist novel', 'urban fiction'],
  },
  {
    id: 'work-en-fic-the-open-boat', kind: 'work', name: 'The Open Boat', author: 'Stephen Crane', year: 1897, language: 'English', region: 'United States', confidence: 'established',
    summary: "A short story of four shipwrecked men in a small dinghy, based on the author's own experience; a classic of naturalism and of indifferent nature as antagonist.",
    kw: ['stephen crane', 'shipwreck', 'naturalism', 'survival', 'short story', 'indifferent nature'], genres: ['short story', 'naturalist fiction', 'survival narrative'],
  },

  // ---- Edwardian and modernist fiction from Britain and Ireland ----
  {
    id: 'work-en-fic-heart-of-darkness', kind: 'work', name: 'Heart of Darkness', author: 'Joseph Conrad', year: 1899, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: "A novella in which a narrator on the Thames relays Marlow's river journey into the Congo to find a trading-station agent; a dense frame narrative much studied for its form and much critiqued for its portrayal of Africa.",
    kw: ['conrad', 'joseph conrad', 'marlow', 'frame narrative', 'congo', 'colonialism', 'novella'], genres: ['novella', 'frame narrative', 'modernist fiction'],
  },
  {
    id: 'work-en-fic-lord-jim', kind: 'work', name: 'Lord Jim', author: 'Joseph Conrad', year: 1900, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: "A novel following a young sailor's attempt to live down a moment of cowardice, narrated largely by Marlow in a looping, non-chronological way that keeps reassessing the same events.",
    kw: ['conrad', 'joseph conrad', 'marlow', 'non-chronological narration', 'honour', 'guilt', 'sea novel'], genres: ['modernist fiction', 'sea novel', 'psychological novel'],
  },
  {
    id: 'work-en-fic-nostromo', kind: 'work', name: 'Nostromo', author: 'Joseph Conrad', year: 1904, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A political novel set in an imaginary South American republic, tracing how a silver mine and foreign capital shape its history; ambitious in its time shifts and its large cast.',
    kw: ['conrad', 'joseph conrad', 'political novel', 'time shifts', 'imaginary country', 'capitalism'], genres: ['political novel', 'modernist fiction'],
  },
  {
    id: 'work-en-fic-the-secret-agent', kind: 'work', name: 'The Secret Agent', author: 'Joseph Conrad', year: 1907, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A novel of anarchists, spies and a bomb plot in London, treated with bleak irony; often cited as an early novel about terrorism and a model of the ironic omniscient narrator.',
    kw: ['conrad', 'joseph conrad', 'anarchists', 'london', 'irony', 'spy novel', 'terrorism'], genres: ['political novel', 'spy fiction', 'modernist fiction'],
  },
  {
    id: 'work-en-fic-the-good-soldier', kind: 'work', name: 'The Good Soldier', author: 'Ford Madox Ford', year: 1915, language: 'English', region: 'England', confidence: 'established',
    summary: 'A novel narrated by a self-deceiving man recounting the collapse of two marriages; a landmark of the unreliable narrator, told in a looping, non-chronological way.',
    kw: ['ford madox ford', 'unreliable narrator', 'non-chronological narration', 'impressionism', 'marriage', 'modernist fiction'], genres: ['modernist fiction', 'psychological novel'],
  },
  {
    id: 'work-en-fic-a-room-with-a-view', kind: 'work', name: 'A Room with a View', author: 'E. M. Forster', year: 1908, language: 'English', region: 'England', confidence: 'established',
    summary: "A comic novel of a young Englishwoman's trip to Italy and her return to a restrictive home society; light in touch and serious about honesty of feeling.",
    kw: ['forster', 'e m forster', 'italy', 'edwardian', 'comedy of manners', 'self-discovery'], genres: ['comedy of manners', 'bildungsroman'],
  },
  {
    id: 'work-en-fic-howards-end', kind: 'work', name: 'Howards End', author: 'E. M. Forster', year: 1910, language: 'English', region: 'England', confidence: 'established',
    summary: 'A novel of three English families and a house, exploring class, money and the question of who will inherit England; admired for its authorial voice and its plot built on misunderstandings.',
    kw: ['forster', 'e m forster', 'class', 'edwardian england', 'inheritance', 'house as symbol'], genres: ['social novel', 'novel of manners'],
  },
  {
    id: 'work-en-fic-a-passage-to-india', kind: 'work', name: 'A Passage to India', author: 'E. M. Forster', year: 1924, language: 'English', region: 'England', confidence: 'established',
    summary: 'A novel of English and Indian characters in colonial India, centred on a disastrous expedition to caves; admired for its three-part structure, its symbolism and its refusal of tidy answers.',
    kw: ['forster', 'e m forster', 'british raj', 'colonial india', 'symbolism', 'caves'], genres: ['colonial fiction', 'social novel', 'modernist fiction'],
  },
  {
    id: 'work-en-fic-maurice', kind: 'work', name: 'Maurice', author: 'E. M. Forster', year: 1971, language: 'English', region: 'England', confidence: 'established',
    summary: "A novel about a young Englishman who comes to accept his love of men; written in 1913 and 1914 and kept back until after Forster's death, so published posthumously.",
    kw: ['forster', 'e m forster', 'lgbtq fiction', 'posthumous publication', 'edwardian england', 'coming out'], genres: ['bildungsroman', 'lgbtq fiction'],
  },
  {
    id: 'work-en-fic-sons-and-lovers', kind: 'work', name: 'Sons and Lovers', author: 'D. H. Lawrence', year: 1913, language: 'English', region: 'England', confidence: 'established',
    summary: "A semi-autobiographical novel of a mining family in Nottinghamshire and a son's tangled attachments; a landmark of working-class psychological realism.",
    kw: ['lawrence', 'd h lawrence', 'mining family', 'nottinghamshire', 'autobiographical novel', 'working class'], genres: ['bildungsroman', 'autobiographical novel', 'psychological novel'],
  },
  {
    id: 'work-en-fic-the-rainbow', kind: 'work', name: 'The Rainbow', author: 'D. H. Lawrence', year: 1915, language: 'English', region: 'England', confidence: 'established',
    summary: 'A multi-generational novel of a Midlands family exploring changing relationships and consciousness; it was suppressed in Britain soon after publication on grounds of obscenity.',
    kw: ['lawrence', 'd h lawrence', 'generational novel', 'obscenity trial', 'consciousness', 'midlands'], genres: ['family saga', 'modernist fiction'],
  },
  {
    id: 'work-en-fic-women-in-love', kind: 'work', name: 'Women in Love', author: 'D. H. Lawrence', year: 1920, language: 'English', region: 'England', confidence: 'established',
    summary: 'A novel of two sisters and their lovers that examines desire, power and the state of modern society in loosely symbolic scenes.',
    kw: ['lawrence', 'd h lawrence', 'sisters', 'desire', 'modernity', 'symbolic scenes'], genres: ['modernist fiction', 'psychological novel'],
  },
  {
    id: 'work-en-fic-lady-chatterleys-lover', kind: 'work', name: "Lady Chatterley's Lover", author: 'D. H. Lawrence', year: 1928, language: 'English', region: 'England', confidence: 'established',
    summary: 'A novel of class and sexual intimacy first printed privately in Italy in 1928 and not freely published in the UK until 1960, after a celebrated obscenity trial.',
    kw: ['lawrence', 'd h lawrence', 'obscenity trial', 'censorship', 'class', 'banned books'], genres: ['social novel', 'censored fiction'],
  },
  {
    id: 'work-en-fic-dubliners', kind: 'work', name: 'Dubliners', author: 'James Joyce', year: 1914, language: 'English', region: 'Ireland', confidence: 'established',
    summary: 'A collection of fifteen stories of ordinary life in Dublin, arranged from childhood to public life; a model of the epiphany and of precise, restrained style.',
    kw: ['joyce', 'james joyce', 'epiphany', 'dublin', 'short story collection', 'restrained style'], genres: ['short story collection', 'modernist fiction'],
  },
  {
    id: 'work-en-fic-a-portrait-of-the-artist-as-a-young-man', kind: 'work', name: 'A Portrait of the Artist as a Young Man', author: 'James Joyce', year: 1916, language: 'English', region: 'Ireland', confidence: 'established',
    summary: "A semi-autobiographical novel following Stephen Dedalus's growth into a writer, with the style changing as his mind matures; a landmark of the kunstlerroman.",
    kw: ['joyce', 'james joyce', 'stephen dedalus', 'kunstlerroman', 'coming of age', 'evolving style'], genres: ['bildungsroman', 'kunstlerroman', 'modernist fiction'],
  },
  {
    id: 'work-en-fic-ulysses', kind: 'work', name: 'Ulysses', author: 'James Joyce', year: 1922, language: 'English', region: 'Ireland', confidence: 'established',
    summary: "A novel following a single day in Dublin, echoing Homer's Odyssey and changing style from chapter to chapter; central to modernism and to the stream-of-consciousness technique.",
    kw: ['joyce', 'james joyce', 'stream of consciousness', 'dublin', 'modernism', 'odyssey parallel', 'interior monologue'], genres: ['modernist fiction', 'stream of consciousness', 'encyclopedic novel'],
  },
  {
    id: 'work-en-fic-finnegans-wake', kind: 'work', name: 'Finnegans Wake', author: 'James Joyce', year: 1939, language: 'English', region: 'Ireland', confidence: 'established',
    summary: 'A dream-language novel built from puns and multilingual coinages; the most extreme experiment of Joyce\'s career and a work still debated as to how it should be read.',
    kw: ['joyce', 'james joyce', 'dream language', 'wordplay', 'experimental novel', 'portmanteau'], genres: ['experimental novel', 'modernist fiction'],
  },
  {
    id: 'work-en-fic-jacobs-room', kind: 'work', name: "Jacob's Room", author: 'Virginia Woolf', year: 1922, language: 'English', region: 'England', confidence: 'established',
    summary: "Woolf's first fully experimental novel, which portrays a young man mostly through what others notice and misunderstand about him, so the central figure stays elusive.",
    kw: ['woolf', 'virginia woolf', 'elusive protagonist', 'absence', 'experimental novel', 'modernism'], genres: ['modernist fiction', 'experimental novel'],
  },
  {
    id: 'work-en-fic-mrs-dalloway', kind: 'work', name: 'Mrs Dalloway', author: 'Virginia Woolf', year: 1925, language: 'English', region: 'England', confidence: 'established',
    summary: 'A novel following one London day in the lives of a society hostess and a shell-shocked veteran, moving between minds without a break; a landmark of stream of consciousness and of time in fiction.',
    kw: ['woolf', 'virginia woolf', 'stream of consciousness', 'single day', 'free indirect discourse', 'london', 'shell shock'], genres: ['modernist fiction', 'stream of consciousness'],
  },
  {
    id: 'work-en-fic-to-the-lighthouse', kind: 'work', name: 'To the Lighthouse', author: 'Virginia Woolf', year: 1927, language: 'English', region: 'England', confidence: 'established',
    summary: "A novel in three parts about a family's holiday house and the passing of time, notable for shifting interior perspectives and a middle section that skips a decade in a few pages.",
    kw: ['woolf', 'virginia woolf', 'passage of time', 'shifting point of view', 'family', 'modernism'], genres: ['modernist fiction', 'family novel'],
  },
  {
    id: 'work-en-fic-orlando', kind: 'work', name: 'Orlando: A Biography', author: 'Virginia Woolf', year: 1928, language: 'English', region: 'England', confidence: 'established',
    summary: 'A playful, biography-style novel of a character who lives for centuries and changes sex, using fantasy to look at gender, history and the writing life.',
    kw: ['woolf', 'virginia woolf', 'gender', 'fantasy biography', 'mock biography', 'writer protagonist'], genres: ['fantasy', 'mock biography', 'modernist fiction'],
  },
  {
    id: 'work-en-fic-the-waves', kind: 'work', name: 'The Waves', author: 'Virginia Woolf', year: 1931, language: 'English', region: 'England', confidence: 'established',
    summary: 'A novel of six voices speaking in stylised soliloquy from childhood to old age, interleaved with lyrical passages about the sea; among the most experimental of her books.',
    kw: ['woolf', 'virginia woolf', 'soliloquy', 'six voices', 'lyrical prose', 'experimental novel'], genres: ['experimental novel', 'modernist fiction'],
  },
  {
    id: 'work-en-fic-between-the-acts', kind: 'work', name: 'Between the Acts', author: 'Virginia Woolf', year: 1941, language: 'English', region: 'England', confidence: 'established',
    summary: "Woolf's last novel, set during a village pageant on a June day in 1939, mixing scraps of conversation with the performance; published after her death.",
    kw: ['woolf', 'virginia woolf', 'village pageant', 'posthumous', 'fragmented dialogue', 'pre-war england'], genres: ['modernist fiction', 'pageant novel'],
  },
  {
    id: 'work-en-fic-bliss-and-other-stories', kind: 'work', name: 'Bliss and Other Stories', author: 'Katherine Mansfield', year: 1920, language: 'English', region: 'New Zealand', confidence: 'established',
    summary: 'A collection of short stories noted for sudden shifts of feeling and close attention to small gestures; an early landmark of the modern short story.',
    kw: ['mansfield', 'katherine mansfield', 'modern short story', 'small gestures', 'free indirect discourse', 'epiphany'], genres: ['short story collection', 'modernist fiction'],
  },
  {
    id: 'work-en-fic-the-garden-party-and-other-stories', kind: 'work', name: 'The Garden Party and Other Stories', author: 'Katherine Mansfield', year: 1922, language: 'English', region: 'New Zealand', confidence: 'established',
    summary: "Mansfield's last story collection of her lifetime, with tales of childhood, class and quiet crises; admired for compression and for endings that open outward instead of closing.",
    kw: ['mansfield', 'katherine mansfield', 'short story collection', 'open ending', 'class', 'childhood'], genres: ['short story collection', 'modernist fiction'],
  },
  {
    id: 'work-en-fic-pointed-roofs', kind: 'work', name: 'Pointed Roofs', author: 'Dorothy Richardson', year: 1915, language: 'English', region: 'England', confidence: 'established',
    summary: "The first volume of the long Pilgrimage sequence, following Miriam Henderson as a young teacher in Germany; often cited as an early stream-of-consciousness novel in English.",
    kw: ['dorothy richardson', 'pilgrimage', 'stream of consciousness', 'miriam henderson', 'novel sequence', 'modernism'], genres: ['modernist fiction', 'stream of consciousness', 'novel sequence'],
  },
  {
    id: 'work-en-fic-of-human-bondage', kind: 'work', name: 'Of Human Bondage', author: 'W. Somerset Maugham', year: 1915, language: 'English', region: 'England', confidence: 'established',
    summary: "A long semi-autobiographical novel following a young man's search for purpose through medicine, art and love; a popular example of the bildungsroman in the early twentieth century.",
    kw: ['maugham', 'somerset maugham', 'bildungsroman', 'autobiographical novel', 'search for purpose', 'edwardian'], genres: ['bildungsroman', 'autobiographical novel'],
  },
  {
    id: 'work-en-fic-the-chronicles-of-clovis', kind: 'work', name: 'The Chronicles of Clovis', author: 'Saki (H. H. Munro)', year: 1911, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A collection of witty, sometimes macabre short stories of Edwardian society, known for epigrammatic dialogue, cruel jokes and swift, surprising endings.',
    kw: ['saki', 'h h munro', 'edwardian', 'epigram', 'dark comedy', 'short story collection', 'twist ending'], genres: ['short story collection', 'satire', 'dark comedy'],
  },
  {
    id: 'work-en-fic-voyage-in-the-dark', kind: 'work', name: 'Voyage in the Dark', author: 'Jean Rhys', year: 1934, language: 'English', region: 'Dominica and England', confidence: 'established',
    summary: "A short novel of a young woman from the West Indies drifting through London, narrated in fragments that blend present and memory; a spare study of dependence and displacement.",
    kw: ['jean rhys', 'caribbean', 'london', 'fragmented narration', 'displacement', 'modernism'], genres: ['modernist fiction', 'psychological novel'],
  },
  {
    id: 'work-en-fic-good-morning-midnight', kind: 'work', name: 'Good Morning, Midnight', author: 'Jean Rhys', year: 1939, language: 'English', region: 'Dominica and England', confidence: 'established',
    summary: 'A short novel of a middle-aged woman alone in Paris, moving between present and memories in a spare, melancholy voice; admired for its compressed interior narration.',
    kw: ['jean rhys', 'paris', 'interior monologue', 'loneliness', 'memory', 'modernism'], genres: ['modernist fiction', 'psychological novel'],
  },
  {
    id: 'work-en-fic-wide-sargasso-sea', kind: 'work', name: 'Wide Sargasso Sea', author: 'Jean Rhys', year: 1966, language: 'English', region: 'Dominica and England', confidence: 'established',
    summary: "A novel imagining the earlier life of the first Mrs Rochester from Jane Eyre, set in Jamaica and Dominica; a major postcolonial reply to a classic text and a model of the reimagining.",
    kw: ['jean rhys', 'jane eyre prequel', 'postcolonial', 'caribbean', 'rewriting a classic', 'unreliable narrator'], genres: ['postcolonial fiction', 'literary retelling', 'gothic fiction'],
  },

  // ---- American modernism and the interwar years ----
  {
    id: 'work-en-fic-three-lives', kind: 'work', name: 'Three Lives', author: 'Gertrude Stein', year: 1909, language: 'English', region: 'United States', confidence: 'established',
    summary: 'Three linked novellas about working-class women, written in a repetitive, rhythmic style that shaped modernist prose.',
    kw: ['gertrude stein', 'repetition', 'modernist prose', 'novellas', 'rhythm', 'experimental style'], genres: ['modernist fiction', 'novella'],
  },
  {
    id: 'work-en-fic-winesburg-ohio', kind: 'work', name: 'Winesburg, Ohio', author: 'Sherwood Anderson', year: 1919, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A cycle of linked stories about the residents of a small Ohio town; a model of the story cycle and a major influence on later American short fiction.',
    kw: ['sherwood anderson', 'story cycle', 'linked stories', 'small town', 'grotesque', 'short fiction'], genres: ['short story cycle', 'regional fiction'],
  },
  {
    id: 'work-en-fic-main-street', kind: 'work', name: 'Main Street', author: 'Sinclair Lewis', year: 1920, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A satirical novel of a college-educated woman in a small Minnesota town; a sharp critique of small-town conformity that was an enormous popular success.',
    kw: ['sinclair lewis', 'small town', 'satire', 'conformity', 'midwest', 'social novel'], genres: ['satire', 'social novel'],
  },
  {
    id: 'work-en-fic-babbitt', kind: 'work', name: 'Babbitt', author: 'Sinclair Lewis', year: 1922, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A satire of the American businessman through a real-estate agent in a midwestern city; its title character gave the language a word for conformist boosterism.',
    kw: ['sinclair lewis', 'satire', 'businessman', 'conformity', 'midwest', 'boosterism'], genres: ['satire', 'social novel'],
  },
  {
    id: 'work-en-fic-the-great-gatsby', kind: 'work', name: 'The Great Gatsby', author: 'F. Scott Fitzgerald', year: 1925, language: 'English', region: 'United States', confidence: 'established',
    summary: "A short novel narrated by Nick Carraway about a mysterious rich neighbour on Long Island; a compact study of ambition and the American dream, often praised for its economy, symbolism and observer-narrator.",
    kw: ['fitzgerald', 'f scott fitzgerald', 'jazz age', 'observer narrator', 'american dream', 'long island', 'symbolism'], genres: ['literary fiction', 'jazz age fiction', 'tragedy'],
  },
  {
    id: 'work-en-fic-tender-is-the-night', kind: 'work', name: 'Tender Is the Night', author: 'F. Scott Fitzgerald', year: 1934, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel of a psychiatrist and his wealthy wife among expatriates on the French Riviera, charting charm and gradual decline; known for its shifting time structure.',
    kw: ['fitzgerald', 'f scott fitzgerald', 'riviera', 'expatriates', 'decline', 'jazz age'], genres: ['literary fiction', 'jazz age fiction'],
  },
  {
    id: 'work-en-fic-the-sun-also-rises', kind: 'work', name: 'The Sun Also Rises', author: 'Ernest Hemingway', year: 1926, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel of expatriates travelling from Paris to the fiesta in Pamplona, written in spare prose with much left unsaid; a defining work of the Lost Generation.',
    kw: ['hemingway', 'lost generation', 'iceberg theory', 'expatriates', 'spare prose', 'subtext'], genres: ['modernist fiction', 'lost generation fiction'],
  },
  {
    id: 'work-en-fic-in-our-time', kind: 'work', name: 'In Our Time', author: 'Ernest Hemingway', year: 1925, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A story collection in which short tales, many about the young Nick Adams, alternate with brief vignettes; an early showcase of the omission-driven, understated style Hemingway called the iceberg.',
    kw: ['hemingway', 'nick adams', 'iceberg theory', 'vignettes', 'short story collection', 'understatement'], genres: ['short story collection', 'modernist fiction'],
  },
  {
    id: 'work-en-fic-the-old-man-and-the-sea', kind: 'work', name: 'The Old Man and the Sea', author: 'Ernest Hemingway', year: 1952, language: 'English', region: 'United States', confidence: 'established',
    summary: "A short novel of an ageing Cuban fisherman's long struggle with a giant marlin; plain, rhythmic, symbolic prose that has been widely read in schools.",
    kw: ['hemingway', 'fisherman', 'cuba', 'novella', 'plain style', 'endurance'], genres: ['novella', 'sea novel'],
  },
  {
    id: 'work-en-fic-manhattan-transfer', kind: 'work', name: 'Manhattan Transfer', author: 'John Dos Passos', year: 1925, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel that cuts between many New Yorkers in short, fast sequences using montage; an influential urban collage novel.',
    kw: ['dos passos', 'montage', 'urban novel', 'collage', 'new york', 'ensemble cast'], genres: ['modernist fiction', 'urban fiction', 'ensemble novel'],
  },
  {
    id: 'work-en-fic-look-homeward-angel', kind: 'work', name: 'Look Homeward, Angel', author: 'Thomas Wolfe', year: 1929, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A long autobiographical novel of a boy growing up in a small North Carolina town and his family; known for expansive, lyrical prose.',
    kw: ['thomas wolfe', 'autobiographical novel', 'north carolina', 'lyrical prose', 'family', 'bildungsroman'], genres: ['autobiographical novel', 'bildungsroman'],
  },
  {
    id: 'work-en-fic-the-sound-and-the-fury', kind: 'work', name: 'The Sound and the Fury', author: 'William Faulkner', year: 1929, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel of the decline of a Southern family told in four sections with differing voices and time structures; a landmark of stream of consciousness and fragmented chronology.',
    kw: ['faulkner', 'william faulkner', 'stream of consciousness', 'multiple narrators', 'southern gothic', 'time structure', 'yoknapatawpha'], genres: ['modernist fiction', 'southern gothic', 'stream of consciousness'],
  },
  {
    id: 'work-en-fic-as-i-lay-dying', kind: 'work', name: 'As I Lay Dying', author: 'William Faulkner', year: 1930, language: 'English', region: 'United States', confidence: 'established',
    summary: "A novel of a poor family's journey to bury their mother, told in short first-person chapters by many narrators; a model of polyphonic narration.",
    kw: ['faulkner', 'william faulkner', 'multiple narrators', 'polyphonic narration', 'journey', 'southern gothic'], genres: ['modernist fiction', 'southern gothic', 'polyphonic novel'],
  },
  {
    id: 'work-en-fic-a-rose-for-emily', kind: 'work', name: 'A Rose for Emily', author: 'William Faulkner', year: 1930, language: 'English', region: 'United States', confidence: 'established',
    summary: "A short story told by a collective town voice about a reclusive Southern woman; widely taught for its out-of-order chronology and its communal narrator.",
    kw: ['faulkner', 'william faulkner', 'collective narrator', 'chronology', 'short story', 'southern gothic', 'we narrator'], genres: ['short story', 'southern gothic'],
  },
  {
    id: 'work-en-fic-light-in-august', kind: 'work', name: 'Light in August', author: 'William Faulkner', year: 1932, language: 'English', region: 'United States', confidence: 'established',
    summary: "A novel set in Mississippi about intertwined outsiders and a community's judgements on race and religion; a showcase of Faulkner's non-linear storytelling.",
    kw: ['faulkner', 'william faulkner', 'mississippi', 'race', 'non-linear storytelling', 'yoknapatawpha'], genres: ['southern gothic', 'modernist fiction'],
  },
  {
    id: 'work-en-fic-go-down-moses', kind: 'work', name: 'Go Down, Moses', author: 'William Faulkner', year: 1942, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A book of linked stories about the descendants of a Mississippi family, white and Black, and the legacy of slavery; it sits between a story cycle and a novel.',
    kw: ['faulkner', 'william faulkner', 'linked stories', 'composite novel', 'legacy of slavery', 'yoknapatawpha'], genres: ['short story cycle', 'composite novel', 'southern gothic'],
  },
  {
    id: 'work-en-fic-miss-lonelyhearts', kind: 'work', name: 'Miss Lonelyhearts', author: 'Nathanael West', year: 1933, language: 'English', region: 'United States', confidence: 'established',
    summary: "A short, bleak novel about a newspaper advice columnist overwhelmed by his readers' letters of misery; a classic of dark comedy and compressed form.",
    kw: ['nathanael west', 'advice columnist', 'dark comedy', 'compressed form', 'novella', 'depression era'], genres: ['dark comedy', 'novella', 'satire'],
  },
  {
    id: 'work-en-fic-the-day-of-the-locust', kind: 'work', name: 'The Day of the Locust', author: 'Nathanael West', year: 1939, language: 'English', region: 'United States', confidence: 'established',
    summary: "A novel of Hollywood's fringes, populated by hopefuls and misfits; known for its satire of the dream industry and its stark, grotesque imagery.",
    kw: ['nathanael west', 'hollywood', 'satire', 'grotesque', 'depression era', 'film industry'], genres: ['satire', 'hollywood novel'],
  },
  {
    id: 'work-en-fic-nightwood', kind: 'work', name: 'Nightwood', author: 'Djuna Barnes', year: 1936, language: 'English', region: 'United States', confidence: 'established',
    summary: 'An experimental novel of a circle of expatriates in 1920s Europe, written in dense, baroque prose; a landmark of modernist and queer literature.',
    kw: ['djuna barnes', 'baroque prose', 'queer literature', 'expatriates', 'experimental novel', 'paris'], genres: ['modernist fiction', 'experimental novel', 'queer literature'],
  },
  {
    id: 'work-en-fic-their-eyes-were-watching-god', kind: 'work', name: 'Their Eyes Were Watching God', author: 'Zora Neale Hurston', year: 1937, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel of a Black woman in Florida telling her life story to a friend, blending lyrical narration with dialect dialogue; central to African American and women\'s literature.',
    kw: ['hurston', 'zora neale hurston', 'harlem renaissance', 'dialect', 'frame narrative', 'lyrical prose', 'florida'], genres: ['harlem renaissance fiction', 'bildungsroman', 'frame narrative'],
  },
  {
    id: 'work-en-fic-the-ways-of-white-folks', kind: 'work', name: 'The Ways of White Folks', author: 'Langston Hughes', year: 1934, language: 'English', region: 'United States', confidence: 'established',
    summary: "A story collection about encounters between Black and white Americans, in ironic and often bitter tones; one of Hughes's major works of short fiction.",
    kw: ['langston hughes', 'harlem renaissance', 'irony', 'race relations', 'short story collection'], genres: ['short story collection', 'harlem renaissance fiction'],
  },
  {
    id: 'work-en-fic-cane', kind: 'work', name: 'Cane', author: 'Jean Toomer', year: 1923, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A hybrid of poems, sketches and a closing drama about Black life in the rural South and the urban North; a landmark of the Harlem Renaissance and of formal experiment.',
    kw: ['jean toomer', 'harlem renaissance', 'hybrid form', 'sketches and poems', 'experimental', 'rural south'], genres: ['hybrid form', 'harlem renaissance fiction', 'modernist fiction'],
  },
  {
    id: 'work-en-fic-quicksand', kind: 'work', name: 'Quicksand', author: 'Nella Larsen', year: 1928, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A short novel of a biracial woman searching for a place where she belongs, moving between the South, Chicago, Harlem and Denmark; a Harlem Renaissance study of identity and constraint.',
    kw: ['nella larsen', 'harlem renaissance', 'biracial identity', 'belonging', 'short novel'], genres: ['harlem renaissance fiction', 'psychological novel'],
  },
  {
    id: 'work-en-fic-passing', kind: 'work', name: 'Passing', author: 'Nella Larsen', year: 1929, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A short novel of two light-skinned Black women who meet again in Harlem, one of whom lives as white; a tight study of identity, envy and desire.',
    kw: ['nella larsen', 'harlem renaissance', 'passing narrative', 'identity', 'doubling', 'short novel'], genres: ['harlem renaissance fiction', 'passing narrative', 'psychological novel'],
  },
  {
    id: 'work-en-fic-uncle-toms-children', kind: 'work', name: "Uncle Tom's Children", author: 'Richard Wright', year: 1938, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A collection of novellas and stories about Black life under Southern racism and violence; an early, forceful example of protest fiction.',
    kw: ['richard wright', 'protest fiction', 'jim crow', 'novellas', 'short story collection', 'racism'], genres: ['short story collection', 'protest fiction', 'novella'],
  },
  {
    id: 'work-en-fic-native-son', kind: 'work', name: 'Native Son', author: 'Richard Wright', year: 1940, language: 'English', region: 'United States', confidence: 'established',
    summary: "A novel of a young Black man in Chicago whose life is changed by a single violent accident; a forceful protest novel told in a close third-person view.",
    kw: ['richard wright', 'chicago', 'protest novel', 'close third person', 'naturalism', 'race and class'], genres: ['protest novel', 'naturalist novel'],
  },
  {
    id: 'work-en-fic-call-it-sleep', kind: 'work', name: 'Call It Sleep', author: 'Henry Roth', year: 1934, language: 'English', region: 'United States', confidence: 'established',
    summary: "A novel of a Jewish immigrant boy growing up on New York's Lower East Side, with the child's mind rendered in stream of consciousness and Yiddish speech carried into English.",
    kw: ['henry roth', 'immigrant novel', 'lower east side', 'child perspective', 'stream of consciousness', 'yiddish'], genres: ['immigrant fiction', 'modernist fiction', 'bildungsroman'],
  },
  {
    id: 'work-en-fic-bread-givers', kind: 'work', name: 'Bread Givers', author: 'Anzia Yezierska', year: 1925, language: 'English', region: 'United States', confidence: 'established',
    summary: "A novel of a Jewish immigrant daughter's struggle for education and independence against her strict father on the Lower East Side; a landmark of immigrant women's writing.",
    kw: ['anzia yezierska', 'immigrant novel', 'lower east side', 'generational conflict', 'education', 'women writers'], genres: ['immigrant fiction', 'bildungsroman'],
  },
  // ---- Britain and Ireland: the 1930s to the 1960s ----
  {
    id: 'work-en-fic-a-handful-of-dust', kind: 'work', name: 'A Handful of Dust', author: 'Evelyn Waugh', year: 1934, language: 'English', region: 'England', confidence: 'established',
    summary: 'A bleakly comic novel of a country-house marriage and the casual cruelty of a fashionable set; admired for its restraint and its icy, ironic narrator.',
    kw: ['waugh', 'evelyn waugh', 'satire', 'country house', 'irony', 'interwar england'], genres: ['satire', 'social novel', 'dark comedy'],
  },
  {
    id: 'work-en-fic-brideshead-revisited', kind: 'work', name: 'Brideshead Revisited', author: 'Evelyn Waugh', year: 1945, language: 'English', region: 'England', confidence: 'established',
    summary: 'A novel in which a narrator recalls his friendship with an aristocratic Catholic family and the glamour and loss that followed; a nostalgic retrospective voice with a religious undercurrent.',
    kw: ['waugh', 'evelyn waugh', 'retrospective narration', 'nostalgia', 'catholic novel', 'country house', 'oxford'], genres: ['literary fiction', 'retrospective narrative', 'catholic fiction'],
  },
  {
    id: 'work-en-fic-animal-farm', kind: 'work', name: 'Animal Farm', author: 'George Orwell', year: 1945, language: 'English', region: 'England', confidence: 'established',
    summary: 'A short satirical fable of farm animals who drive out their farmer and build a society of their own; an allegory of revolution and the corruption of power, written in plain prose.',
    kw: ['orwell', 'george orwell', 'allegory', 'fable', 'political satire', 'animal fable'], genres: ['allegory', 'satire', 'fable', 'political fiction'],
  },
  {
    id: 'work-en-fic-burmese-days', kind: 'work', name: 'Burmese Days', author: 'George Orwell', year: 1934, language: 'English', region: 'England', confidence: 'established',
    summary: "A novel of the British colonial community in a Burmese town, critical of imperial attitudes; it draws on Orwell's own service as a colonial police officer.",
    kw: ['orwell', 'george orwell', 'burma', 'british empire', 'colonial fiction', 'imperialism'], genres: ['colonial fiction', 'social novel'],
  },
  {
    id: 'work-en-fic-the-death-of-the-heart', kind: 'work', name: 'The Death of the Heart', author: 'Elizabeth Bowen', year: 1938, language: 'English', region: 'Ireland', confidence: 'established',
    summary: 'A novel of a sixteen-year-old orphan placed with relatives whose polite surfaces hide indifference; a study of innocence meeting sophisticated adults.',
    kw: ['bowen', 'elizabeth bowen', 'innocence', 'london', 'orphan', 'manners', 'interwar'], genres: ['psychological novel', 'novel of manners'],
  },
  {
    id: 'work-en-fic-the-heat-of-the-day', kind: 'work', name: 'The Heat of the Day', author: 'Elizabeth Bowen', year: 1948, language: 'English', region: 'Ireland', confidence: 'established',
    summary: 'A wartime novel set in London during the Blitz, about divided loyalties and suspicion inside a love affair; notable for its atmosphere of dislocation.',
    kw: ['bowen', 'elizabeth bowen', 'blitz', 'wartime london', 'suspicion', 'dislocation'], genres: ['war fiction', 'psychological novel'],
  },
  {
    id: 'work-en-fic-loving', kind: 'work', name: 'Loving', author: 'Henry Green', year: 1945, language: 'English', region: 'England', confidence: 'established',
    summary: 'A novel of servants and employers in an Irish country house during the Second World War, built from dialogue with almost no authorial commentary.',
    kw: ['henry green', 'servants', 'country house', 'dialogue-driven narration', 'class', 'war'], genres: ['literary fiction', 'comedy of manners', 'dialogue novel'],
  },
  {
    id: 'work-en-fic-south-riding', kind: 'work', name: 'South Riding', author: 'Winifred Holtby', year: 1936, language: 'English', region: 'England', confidence: 'established',
    summary: "A novel of local government and ordinary lives in a Yorkshire district, with a broad cast and a headmistress near its centre; published after Holtby's death.",
    kw: ['holtby', 'yorkshire', 'local government', 'ensemble cast', 'posthumous', 'interwar'], genres: ['regional fiction', 'social novel', 'ensemble novel'],
  },
  {
    id: 'work-en-fic-novel-on-yellow-paper', kind: 'work', name: 'Novel on Yellow Paper', author: 'Stevie Smith', year: 1936, language: 'English', region: 'England', confidence: 'established',
    summary: 'A digressive first-person novel in the voice of a young London typist, mixing jokes, reflection and anecdote in a loose, talkative style.',
    kw: ['stevie smith', 'digressive narration', 'first person voice', 'typist', 'london', 'comic voice'], genres: ['experimental novel', 'comic novel'],
  },
  {
    id: 'work-en-fic-frost-in-may', kind: 'work', name: 'Frost in May', author: 'Antonia White', year: 1933, language: 'English', region: 'England', confidence: 'established',
    summary: 'A short novel of a girl at a strict Catholic convent school; a clear-eyed study of religious discipline and individuality.',
    kw: ['antonia white', 'convent school', 'catholic girlhood', 'schooldays', 'discipline', 'short novel'], genres: ['school novel', 'autobiographical novel'],
  },
  {
    id: 'work-en-fic-at-swim-two-birds', kind: 'work', name: 'At Swim-Two-Birds', author: 'Flann O\'Brien', year: 1939, language: 'English', region: 'Ireland', confidence: 'established',
    summary: 'A comic novel in which a student writes about an author whose characters rebel against him; a landmark of Irish metafiction that nests stories inside stories.',
    kw: ['flann obrien', 'brian o nolan', 'metafiction', 'nested stories', 'irish comedy', 'characters rebelling'], genres: ['metafiction', 'comic novel', 'experimental novel'],
  },
  {
    id: 'work-en-fic-the-third-policeman', kind: 'work', name: 'The Third Policeman', author: 'Flann O\'Brien', year: 1967, language: 'English', region: 'Ireland', confidence: 'established',
    summary: 'A comic, eerie novel of a narrator wandering a strange rural landscape policed by obsessive officers; written around 1940 and published after the author\'s death.',
    kw: ['flann obrien', 'brian o nolan', 'surreal comedy', 'posthumous', 'irish fiction', 'absurdism'], genres: ['absurdist fiction', 'dark comedy', 'metafiction'],
  },
  {
    id: 'work-en-fic-murphy', kind: 'work', name: 'Murphy', author: 'Samuel Beckett', year: 1938, language: 'English', region: 'Ireland', confidence: 'established',
    summary: "Beckett's first published novel, a comic and bleak story of a London man who longs to withdraw into his own mind; an early look at the voice and themes of his later work.",
    kw: ['beckett', 'samuel beckett', 'early novel', 'withdrawal', 'dark comedy', 'london', 'modernism'], genres: ['modernist fiction', 'dark comedy'],
  },
  {
    id: 'work-en-fic-the-power-and-the-glory', kind: 'work', name: 'The Power and the Glory', author: 'Graham Greene', year: 1940, language: 'English', region: 'England', confidence: 'established',
    summary: 'A novel of a fugitive priest in a Mexican state that has outlawed the church; a study of faith, weakness and moral struggle.',
    kw: ['greene', 'graham greene', 'catholic novel', 'priest', 'mexico', 'faith and doubt', 'persecution'], genres: ['catholic fiction', 'literary fiction'],
  },
  {
    id: 'work-en-fic-the-heart-of-the-matter', kind: 'work', name: 'The Heart of the Matter', author: 'Graham Greene', year: 1948, language: 'English', region: 'England', confidence: 'established',
    summary: "A novel of a conscientious colonial police officer in wartime West Africa whose decisions entangle him in moral crisis; Greene's study of pity, duty and faith.",
    kw: ['greene', 'graham greene', 'west africa', 'colonial officer', 'catholic novel', 'pity', 'duty'], genres: ['catholic fiction', 'colonial fiction', 'psychological novel'],
  },
  {
    id: 'work-en-fic-the-end-of-the-affair', kind: 'work', name: 'The End of the Affair', author: 'Graham Greene', year: 1951, language: 'English', region: 'England', confidence: 'established',
    summary: 'A novel of a writer recalling a wartime love affair and its abrupt end, narrated by a man whose bitterness complicates his account.',
    kw: ['greene', 'graham greene', 'writer narrator', 'jealousy', 'wartime london', 'unreliable narrator', 'catholic novel'], genres: ['catholic fiction', 'psychological novel', 'first person narrative'],
  },
  {
    id: 'work-en-fic-under-the-volcano', kind: 'work', name: 'Under the Volcano', author: 'Malcolm Lowry', year: 1947, language: 'English', region: 'England', confidence: 'established',
    summary: 'A dense, symbolic novel of a single day in Mexico in 1938, centred on an alcoholic former British consul; carefully structured and often ranked among the great modernist novels.',
    kw: ['malcolm lowry', 'mexico', 'alcoholism', 'symbolism', 'single day', 'modernism', 'day of the dead'], genres: ['modernist fiction', 'symbolic novel'],
  },
  {
    id: 'work-en-fic-a-question-of-upbringing', kind: 'work', name: 'A Question of Upbringing', author: 'Anthony Powell', year: 1951, language: 'English', region: 'England', confidence: 'established',
    summary: 'The first volume of A Dance to the Music of Time, a twelve-novel sequence following a circle of English friends and acquaintances across decades.',
    kw: ['anthony powell', 'dance to the music of time', 'novel sequence', 'roman fleuve', 'series opener', 'english society'], genres: ['novel sequence', 'social novel'],
  },
  {
    id: 'work-en-fic-excellent-women', kind: 'work', name: 'Excellent Women', author: 'Barbara Pym', year: 1952, language: 'English', region: 'England', confidence: 'established',
    summary: "A comic novel of a clergyman's neighbour and church volunteer in postwar London, narrated with dry humour; typical of Pym's quiet attention to small-scale lives.",
    kw: ['barbara pym', 'postwar london', 'church life', 'dry humor', 'spinster narrator', 'comedy of manners'], genres: ['comedy of manners', 'domestic fiction'],
  },
  {
    id: 'work-en-fic-the-go-between', kind: 'work', name: 'The Go-Between', author: 'L. P. Hartley', year: 1953, language: 'English', region: 'England', confidence: 'established',
    summary: 'A novel in which an older man recalls a childhood summer spent carrying messages between two lovers; famous for its opening line about the past and for its retrospective frame.',
    kw: ['hartley', 'l p hartley', 'retrospective narration', 'childhood summer', 'class', 'frame narrative', 'edwardian'], genres: ['retrospective narrative', 'bildungsroman'],
  },
  {
    id: 'work-en-fic-under-the-net', kind: 'work', name: 'Under the Net', author: 'Iris Murdoch', year: 1954, language: 'English', region: 'England', confidence: 'established',
    summary: "Murdoch's first published novel, a comic picaresque of a struggling writer in London; a lively, philosophical debut.",
    kw: ['murdoch', 'iris murdoch', 'picaresque', 'london', 'writer protagonist', 'philosophical novel'], genres: ['picaresque', 'comic novel', 'philosophical novel'],
  },
  {
    id: 'work-en-fic-the-bell', kind: 'work', name: 'The Bell', author: 'Iris Murdoch', year: 1958, language: 'English', region: 'England', confidence: 'established',
    summary: "A novel about a lay religious community beside an abbey and the personal crises of its members; Murdoch's blend of comedy and moral drama.",
    kw: ['murdoch', 'iris murdoch', 'religious community', 'moral drama', 'abbey', 'ensemble cast'], genres: ['moral novel', 'comedy of manners'],
  },
  {
    id: 'work-en-fic-the-sea-the-sea', kind: 'work', name: 'The Sea, the Sea', author: 'Iris Murdoch', year: 1978, language: 'English', region: 'England', confidence: 'established',
    summary: 'A novel narrated by a retired theatre director who moves to a seaside house and revisits his past, in a self-flattering voice that readers learn to distrust; a study of ego and obsession.',
    kw: ['murdoch', 'iris murdoch', 'unreliable narrator', 'ego', 'obsession', 'seaside', 'theatre director'], genres: ['psychological novel', 'unreliable narrator fiction'],
  },
  {
    id: 'work-en-fic-lord-of-the-flies', kind: 'work', name: 'Lord of the Flies', author: 'William Golding', year: 1954, language: 'English', region: 'England', confidence: 'established',
    summary: 'A novel of boys stranded on an island who build a society that falls apart; a widely taught fable about order, fear and savagery.',
    kw: ['golding', 'william golding', 'island', 'fable', 'allegory', 'group dynamics', 'schoolboys'], genres: ['allegory', 'fable', 'survival narrative'],
  },
  {
    id: 'work-en-fic-the-spire', kind: 'work', name: 'The Spire', author: 'William Golding', year: 1964, language: 'English', region: 'England', confidence: 'established',
    summary: "A novel of a medieval cathedral dean obsessed with raising a great spire against practical warnings, told in close, intense narration that traces ambition and self-deception.",
    kw: ['golding', 'william golding', 'cathedral', 'obsession', 'ambition', 'self-deception', 'medieval setting'], genres: ['historical novel', 'psychological novel'],
  },
  {
    id: 'work-en-fic-the-grass-is-singing', kind: 'work', name: 'The Grass Is Singing', author: 'Doris Lessing', year: 1950, language: 'English', region: 'England', confidence: 'established',
    summary: "Lessing's first novel, set among white farmers in colonial Southern Rhodesia; an early, unsparing study of settler society, race and a failing marriage.",
    kw: ['lessing', 'doris lessing', 'rhodesia', 'colonial africa', 'settler society', 'debut novel'], genres: ['colonial fiction', 'psychological novel'],
  },
  {
    id: 'work-en-fic-the-golden-notebook', kind: 'work', name: 'The Golden Notebook', author: 'Doris Lessing', year: 1962, language: 'English', region: 'England', confidence: 'established',
    summary: "A novel built from several coloured notebooks and a framing narrative, exploring a woman writer's fragmented life; a landmark of formally experimental feminist fiction.",
    kw: ['lessing', 'doris lessing', 'notebooks', 'fragmented narrative', 'woman writer', 'feminist fiction', 'writer\'s block'], genres: ['experimental novel', 'feminist fiction', 'metafiction'],
  },
  {
    id: 'work-en-fic-the-fifth-child', kind: 'work', name: 'The Fifth Child', author: 'Doris Lessing', year: 1988, language: 'English', region: 'England', confidence: 'established',
    summary: 'A short novel of a family whose happy domestic life is disturbed by an unusual fifth child; a cool, unsettling study of difference, fear and belonging.',
    kw: ['lessing', 'doris lessing', 'family', 'difference', 'domestic unease', 'short novel'], genres: ['domestic fiction', 'psychological novel'],
  },
  {
    id: 'work-en-fic-the-prime-of-miss-jean-brodie', kind: 'work', name: 'The Prime of Miss Jean Brodie', author: 'Muriel Spark', year: 1961, language: 'English', region: 'Scotland', confidence: 'established',
    summary: 'A short novel of a charismatic Edinburgh schoolteacher and the girls she shapes; notable for flash-forwards that reveal the future early and for its crisp, ironic narrator.',
    kw: ['spark', 'muriel spark', 'flash-forward', 'prolepsis', 'edinburgh', 'school novel', 'ironic narrator'], genres: ['school novel', 'comic novel', 'literary fiction'],
  },
  {
    id: 'work-en-fic-memento-mori', kind: 'work', name: 'Memento Mori', author: 'Muriel Spark', year: 1959, language: 'English', region: 'Scotland', confidence: 'established',
    summary: 'A darkly comic novel in which elderly acquaintances receive anonymous phone calls reminding them that they must die; a witty treatment of ageing and mortality.',
    kw: ['spark', 'muriel spark', 'old age', 'dark comedy', 'mortality', 'anonymous calls'], genres: ['dark comedy', 'literary fiction'],
  },
  {
    id: 'work-en-fic-the-drivers-seat', kind: 'work', name: "The Driver's Seat", author: 'Muriel Spark', year: 1970, language: 'English', region: 'Scotland', confidence: 'established',
    summary: 'A short, cool novel of a woman travelling abroad, told in a detached, controlled voice with early flash-forwards; a study of narrative withholding.',
    kw: ['spark', 'muriel spark', 'detached narration', 'flash-forward', 'novella', 'narrative control'], genres: ['literary fiction', 'novella'],
  },
  {
    id: 'work-en-fic-justine', kind: 'work', name: 'Justine', author: 'Lawrence Durrell', year: 1957, language: 'English', region: 'England', confidence: 'established',
    summary: 'The first novel of the Alexandria Quartet, which retells overlapping events from different viewpoints; known for lush prose and its experiment with perspective.',
    kw: ['durrell', 'lawrence durrell', 'alexandria quartet', 'multiple perspectives', 'lush prose', 'egypt', 'series opener'], genres: ['novel sequence', 'modernist fiction'],
  },
  {
    id: 'work-en-fic-saturday-night-and-sunday-morning', kind: 'work', name: 'Saturday Night and Sunday Morning', author: 'Alan Sillitoe', year: 1958, language: 'English', region: 'England', confidence: 'established',
    summary: 'A novel of a young factory worker in Nottingham seeking pleasure and freedom; a landmark of working-class fiction of the 1950s.',
    kw: ['sillitoe', 'alan sillitoe', 'working class', 'nottingham', 'angry young men', 'kitchen sink realism'], genres: ['working-class fiction', 'kitchen sink realism'],
  },
  {
    id: 'work-en-fic-the-loneliness-of-the-long-distance-runner', kind: 'work', name: 'The Loneliness of the Long-Distance Runner', author: 'Alan Sillitoe', year: 1959, language: 'English', region: 'England', confidence: 'established',
    summary: "A story collection whose title story follows a reform-school boy who runs; a showcase of a defiant first-person working-class voice.",
    kw: ['sillitoe', 'alan sillitoe', 'working class voice', 'short story collection', 'first person', 'defiance'], genres: ['short story collection', 'working-class fiction'],
  },
  {
    id: 'work-en-fic-room-at-the-top', kind: 'work', name: 'Room at the Top', author: 'John Braine', year: 1957, language: 'English', region: 'England', confidence: 'established',
    summary: 'A novel of an ambitious young man from a northern town chasing wealth and status in a more prosperous world; a landmark of 1950s northern realism.',
    kw: ['braine', 'john braine', 'ambition', 'class', 'northern realism', 'angry young men'], genres: ['working-class fiction', 'social novel'],
  },
  {
    id: 'work-en-fic-the-jewel-in-the-crown', kind: 'work', name: 'The Jewel in the Crown', author: 'Paul Scott', year: 1966, language: 'English', region: 'England', confidence: 'established',
    summary: 'The first novel of the Raj Quartet, which examines the last years of British India through many perspectives and documents; an ambitious account of empire ending.',
    kw: ['paul scott', 'raj quartet', 'british india', 'multiple perspectives', 'series opener', 'decolonisation'], genres: ['novel sequence', 'colonial fiction', 'historical fiction'],
  },
  {
    id: 'work-en-fic-a-clockwork-orange', kind: 'work', name: 'A Clockwork Orange', author: 'Anthony Burgess', year: 1962, language: 'English', region: 'England', confidence: 'established',
    summary: 'A short dystopian novel told by a teenage gang member in an invented slang, Nadsat, raising questions of free will, violence and state control.',
    kw: ['burgess', 'anthony burgess', 'nadsat', 'invented slang', 'dystopia', 'free will', 'first person voice'], genres: ['dystopian fiction', 'satire'],
  },
  {
    id: 'work-en-fic-earthly-powers', kind: 'work', name: 'Earthly Powers', author: 'Anthony Burgess', year: 1980, language: 'English', region: 'England', confidence: 'established',
    summary: 'A long novel narrated by an elderly writer looking back over a century of public life, religion and literary history.',
    kw: ['burgess', 'anthony burgess', 'writer narrator', 'twentieth century', 'long novel', 'memoir form'], genres: ['literary fiction', 'fictional memoir'],
  },
];
