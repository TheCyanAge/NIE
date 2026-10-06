// Notable works: crime, mystery, thriller, romance, historical fiction, westerns, adventure, comic novels and satire, war fiction, sports fiction, family sagas and genre-defining bestsellers.
// Reference data only. Year = first publication of the original (a serial or magazine appearance, where that came first and is the usual citation). Summaries are neutral and spoiler-free.
export const PREFIX = 'work-pop-';
export default [
  // ---- Detective fiction: origins and the nineteenth century ----
  {
    id: 'work-pop-the-murders-in-the-rue-morgue', kind: 'work', name: 'The Murders in the Rue Morgue', author: 'Edgar Allan Poe', year: 1841, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A short story in which the amateur reasoner C. Auguste Dupin explains a baffling double killing in Paris; widely cited as an early model for the detective story and for the brilliant investigator with an admiring narrator.',
    kw: ['poe', 'dupin', 'first detective story', 'locked room', 'detective origins'], genres: ['detective fiction', 'short story', 'locked-room mystery'],
  },
  {
    id: 'work-pop-the-purloined-letter', kind: 'work', name: 'The Purloined Letter', author: 'Edgar Allan Poe', year: 1844, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A short story in which Dupin outthinks the police over a compromising letter taken from a royal apartment; often cited for its contest of minds between investigator and thief.',
    kw: ['poe', 'dupin', 'ratiocination', 'detective short story'], genres: ['detective fiction', 'short story'],
  },
  {
    id: 'work-pop-the-woman-in-white', kind: 'work', name: 'The Woman in White', author: 'Wilkie Collins', year: 1859, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A sensation novel told through a patchwork of witness accounts, in which a drawing master is drawn into a conspiracy around a mysterious woman dressed in white; a landmark of Victorian suspense and multiple narration.',
    kw: ['wilkie collins', 'sensation novel', 'victorian suspense', 'multiple narrators', 'serial'], genres: ['sensation novel', 'mystery', 'epistolary-style multiple narration'],
  },
  {
    id: 'work-pop-lady-audleys-secret', kind: 'work', name: "Lady Audley's Secret", author: 'Mary Elizabeth Braddon', year: 1862, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: "A sensation novel in which a charming young wife's past is slowly uncovered by her husband's nephew; popular in its day for its domestic menace and its inversion of the submissive Victorian heroine.",
    kw: ['braddon', 'sensation novel', 'victorian', 'secrets', 'domestic suspense'], genres: ['sensation novel', 'mystery'],
  },
  {
    id: 'work-pop-the-moonstone', kind: 'work', name: 'The Moonstone', author: 'Wilkie Collins', year: 1868, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A Victorian novel about the theft of a great diamond, told by several narrators and involving a methodical police inquiry; often called the first full-length detective novel in English.',
    kw: ['wilkie collins', 'first detective novel', 'diamond', 'sergeant cuff', 'multiple narrators'], genres: ['detective fiction', 'sensation novel'],
  },
  {
    id: 'work-pop-the-leavenworth-case', kind: 'work', name: 'The Leavenworth Case', author: 'Anna Katharine Green', year: 1878, language: 'English', region: 'United States', confidence: 'established',
    summary: 'An American detective novel that opens with a wealthy man found shot in his library and follows a patient police detective; an influential early work by a writer sometimes called the mother of the detective novel.',
    kw: ['anna katharine green', 'american detective novel', 'mother of detective fiction', 'ebenezer gryce'], genres: ['detective fiction'],
  },
  {
    id: 'work-pop-laffaire-lerouge', kind: 'work', name: "L'Affaire Lerouge", author: 'Émile Gaboriau', year: 1866, language: 'French', region: 'France', confidence: 'established',
    summary: 'An early French detective novel about the murder of a widow in a village near Paris, pursued by an amateur sleuth and a police investigator; Gaboriau\'s books helped shape the roman policier. Often translated as The Lerouge Case.',
    kw: ['gaboriau', 'roman policier', 'french detective fiction', 'lecoq', 'the lerouge case'], genres: ['detective fiction', 'roman policier'],
  },
  {
    id: 'work-pop-the-mystery-of-a-hansom-cab', kind: 'work', name: 'The Mystery of a Hansom Cab', author: 'Fergus Hume', year: 1886, language: 'English', region: 'Australia', confidence: 'established',
    summary: 'A Melbourne-set mystery that begins with a passenger found dead in a cab; a very large seller in its day, it shows the detective novel spreading quickly beyond Britain and the United States.',
    kw: ['fergus hume', 'melbourne', 'australian crime fiction', 'victorian mystery'], genres: ['detective fiction'],
  },
  {
    id: 'work-pop-a-study-in-scarlet', kind: 'work', name: 'A Study in Scarlet', author: 'Arthur Conan Doyle', year: 1887, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'The first Sherlock Holmes story, published in Beeton\'s Christmas Annual, which introduces Holmes and Dr. Watson to each other and shows deduction from small details; it later splits into two contrasting halves.',
    kw: ['sherlock holmes', 'conan doyle', 'watson', 'deduction', 'first holmes'], genres: ['detective fiction', 'novella'],
  },
  {
    id: 'work-pop-the-adventures-of-sherlock-holmes', kind: 'work', name: 'The Adventures of Sherlock Holmes', author: 'Arthur Conan Doyle', year: 1892, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A collection of twelve short stories first printed in a monthly magazine, which fixed the form of the self-contained detective story built around a recurring pair of characters.',
    kw: ['sherlock holmes', 'conan doyle', 'strand magazine', 'short story series', 'detective short stories'], genres: ['detective fiction', 'short story collection'],
  },
  {
    id: 'work-pop-the-big-bow-mystery', kind: 'work', name: 'The Big Bow Mystery', author: 'Israel Zangwill', year: 1892, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A short novel about a murder in a locked room in London\'s East End; often cited as the first full-length locked-room mystery.',
    kw: ['zangwill', 'locked room', 'impossible crime', 'victorian london'], genres: ['locked-room mystery', 'detective fiction'],
  },
  {
    id: 'work-pop-the-hound-of-the-baskervilles', kind: 'work', name: 'The Hound of the Baskervilles', author: 'Arthur Conan Doyle', year: 1902, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A Holmes novel set on Dartmoor, in which a family legend of a spectral dog meets rational investigation; a model for blending gothic atmosphere with detection.',
    kw: ['sherlock holmes', 'conan doyle', 'dartmoor', 'gothic mystery', 'legend'], genres: ['detective fiction', 'gothic mystery'],
  },
  {
    id: 'work-pop-the-mystery-of-the-yellow-room', kind: 'work', name: 'The Mystery of the Yellow Room', author: 'Gaston Leroux', year: 1907, language: 'French', region: 'France', confidence: 'established',
    summary: 'A French locked-room novel in which a young reporter and a famous police detective race to explain an attack inside a sealed chamber; a key text of the impossible-crime tradition. In French, Le Mystère de la chambre jaune.',
    kw: ['gaston leroux', 'locked room', 'impossible crime', 'rouletabille', 'le mystere de la chambre jaune'], genres: ['locked-room mystery', 'detective fiction'],
  },
  {
    id: 'work-pop-the-riddle-of-the-sands', kind: 'work', name: 'The Riddle of the Sands', author: 'Erskine Childers', year: 1903, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A yachting adventure in which two amateur sailors uncover signs of a foreign invasion plan along a coast of shallow channels; often named as an early spy novel and an influence on later invasion-scare fiction.',
    kw: ['erskine childers', 'spy novel', 'sailing', 'invasion', 'early spy fiction'], genres: ['spy fiction', 'adventure'],
  },
  {
    id: 'work-pop-the-four-just-men', kind: 'work', name: 'The Four Just Men', author: 'Edgar Wallace', year: 1905, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A thriller in which a small group of vigilantes announces that it will kill a politician despite police protection; an early success for a writer who became one of the most prolific popular thriller authors in Britain.',
    kw: ['edgar wallace', 'vigilantes', 'early thriller', 'british thriller'], genres: ['thriller'],
  },
  {
    id: 'work-pop-fantomas', kind: 'work', name: 'Fantômas', author: 'Pierre Souvestre and Marcel Allain', year: 1911, language: 'French', region: 'France', confidence: 'established',
    summary: 'The first of a long French series of popular novels about a shape-shifting criminal mastermind and the inspector who pursues him; its villain-centred, serial-thriller energy influenced pulp fiction and early cinema.',
    kw: ['fantomas', 'souvestre', 'allain', 'villain protagonist', 'french pulp'], genres: ['crime fiction', 'serial thriller', 'pulp'],
  },
  {
    id: 'work-pop-the-innocence-of-father-brown', kind: 'work', name: 'The Innocence of Father Brown', author: 'G. K. Chesterton', year: 1911, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A story collection featuring a mild Catholic priest who solves crimes through insight into human nature rather than physical clues; a model for the moral and paradoxical detective tale.',
    kw: ['chesterton', 'father brown', 'priest detective', 'paradox', 'detective short stories'], genres: ['detective fiction', 'short story collection'],
  },
  {
    id: 'work-pop-trents-last-case', kind: 'work', name: "Trent's Last Case", author: 'E. C. Bentley', year: 1913, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A detective novel in which an artist and journalist investigates a financier\'s death; often described as a reaction against the infallible super-detective and a forerunner of the Golden Age puzzle.',
    kw: ['bentley', 'trent', 'golden age', 'fallible detective', 'clue puzzle'], genres: ['detective fiction', 'golden age mystery'],
  },

  // ---- Golden Age ----
  {
    id: 'work-pop-the-mysterious-affair-at-styles', kind: 'work', name: 'The Mysterious Affair at Styles', author: 'Agatha Christie', year: 1920, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: "Agatha Christie's first published novel, set in a country house during the First World War, which introduces the Belgian detective Hercule Poirot and his friend and narrator Captain Hastings.",
    kw: ['agatha christie', 'poirot', 'hastings', 'country house mystery', 'first christie novel'], genres: ['golden age mystery', 'country-house mystery'],
  },
  {
    id: 'work-pop-the-red-house-mystery', kind: 'work', name: 'The Red House Mystery', author: 'A. A. Milne', year: 1922, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A country-house detective novel by the creator of Winnie-the-Pooh, in which an amateur and his friend investigate a death at an English country house; a light, mannered example of the early 1920s puzzle.',
    kw: ['milne', 'country house', 'amateur detective', 'golden age'], genres: ['golden age mystery', 'country-house mystery'],
  },
  {
    id: 'work-pop-whose-body', kind: 'work', name: 'Whose Body?', author: 'Dorothy L. Sayers', year: 1923, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'The first Lord Peter Wimsey novel, in which an aristocratic amateur investigates a corpse found in a stranger\'s bath; it launched a series known for wit, literate puzzles and wartime trauma.',
    kw: ['dorothy sayers', 'lord peter wimsey', 'amateur sleuth', 'golden age'], genres: ['golden age mystery'],
  },
  {
    id: 'work-pop-the-roman-hat-mystery', kind: 'work', name: 'The Roman Hat Mystery', author: 'Ellery Queen (Frederic Dannay and Manfred B. Lee)', year: 1929, language: 'English', region: 'United States', confidence: 'established',
    summary: 'The first novel in a long series credited to the pen name Ellery Queen, shared by two cousins; known for fair-play puzzle plotting in which the reader receives the clues alongside the detective.',
    kw: ['ellery queen', 'fair play', 'puzzle mystery', 'american golden age', 'theatre murder'], genres: ['golden age mystery', 'puzzle mystery'],
  },
  {
    id: 'work-pop-the-poisoned-chocolates-case', kind: 'work', name: 'The Poisoned Chocolates Case', author: 'Anthony Berkeley', year: 1929, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A novel in which a club of amateur criminologists each offers a different solution to the same poisoning; a playful, self-aware landmark of Golden Age puzzle writing.',
    kw: ['anthony berkeley', 'multiple solutions', 'golden age', 'crimes circle', 'puzzle'], genres: ['golden age mystery', 'puzzle mystery'],
  },
  {
    id: 'work-pop-the-murder-at-the-vicarage', kind: 'work', name: 'The Murder at the Vicarage', author: 'Agatha Christie', year: 1930, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: "The first novel to feature Miss Marple, an elderly village woman whose knowledge of human behaviour makes her a sharper detective than the police; it sets the template for the cosy village mystery.",
    kw: ['miss marple', 'agatha christie', 'cosy mystery', 'village mystery', 'amateur sleuth'], genres: ['cosy mystery', 'golden age mystery'],
  },
  {
    id: 'work-pop-malice-aforethought', kind: 'work', name: 'Malice Aforethought', author: 'Francis Iles (Anthony Berkeley Cox)', year: 1931, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A crime novel that states the murderer\'s intentions from the outset, so interest lies in character and in watching the plan unfold; a model for the inverted and psychological crime story.',
    kw: ['francis iles', 'inverted mystery', 'howcatchem', 'criminal viewpoint', 'psychological crime'], genres: ['inverted detective story', 'psychological crime'],
  },
  {
    id: 'work-pop-the-murder-of-roger-ackroyd', kind: 'work', name: 'The Murder of Roger Ackroyd', author: 'Agatha Christie', year: 1926, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: "A Poirot novel set in a country village, famous for the debate it started about what counts as fair play with the reader in a detective story.",
    kw: ['agatha christie', 'poirot', 'fair play', 'twist ending', 'village mystery'], genres: ['golden age mystery'],
  },
  {
    id: 'work-pop-the-benson-murder-case', kind: 'work', name: 'The Benson Murder Case', author: 'S. S. Van Dine', year: 1926, language: 'English', region: 'United States', confidence: 'established',
    summary: 'The first Philo Vance novel, featuring a cultured amateur detective; a bestseller that helped set the tone of American puzzle mysteries in the late 1920s.',
    kw: ['van dine', 'philo vance', 'american golden age', 'amateur detective', 'puzzle mystery'], genres: ['golden age mystery', 'puzzle mystery'],
  },
  {
    id: 'work-pop-murder-on-the-orient-express', kind: 'work', name: 'Murder on the Orient Express', author: 'Agatha Christie', year: 1934, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A Poirot case set on a snowbound luxury train, built on a closed circle of suspects; one of the best-known and most adapted of all detective novels.',
    kw: ['agatha christie', 'poirot', 'closed circle', 'train mystery', 'whodunit'], genres: ['golden age mystery', 'closed-circle mystery'],
  },
  {
    id: 'work-pop-the-nine-tailors', kind: 'work', name: 'The Nine Tailors', author: 'Dorothy L. Sayers', year: 1934, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A Wimsey mystery set in the Fens, built around the English craft of change ringing; admired for its precise sense of place and its use of specialist knowledge as plot material.',
    kw: ['dorothy sayers', 'lord peter wimsey', 'bell ringing', 'fens', 'specialist knowledge'], genres: ['golden age mystery'],
  },
  {
    id: 'work-pop-fer-de-lance', kind: 'work', name: 'Fer-de-Lance', author: 'Rex Stout', year: 1934, language: 'English', region: 'United States', confidence: 'established',
    summary: 'The first novel about the armchair detective Nero Wolfe and his legman Archie Goodwin, who narrates; it set up the series\' pairing of an eccentric genius with a wry first-person narrator.',
    kw: ['rex stout', 'nero wolfe', 'archie goodwin', 'armchair detective', 'sidekick narrator'], genres: ['golden age mystery', 'armchair detective'],
  },
  {
    id: 'work-pop-a-man-lay-dead', kind: 'work', name: 'A Man Lay Dead', author: 'Ngaio Marsh', year: 1934, language: 'English', region: 'New Zealand', confidence: 'established',
    summary: "The first novel in Ngaio Marsh's Roderick Alleyn series, set at a country-house weekend built around a murder game; it launched a long Golden Age career by a New Zealand writer.",
    kw: ['ngaio marsh', 'roderick alleyn', 'new zealand', 'house party', 'golden age'], genres: ['golden age mystery', 'country-house mystery'],
  },
  {
    id: 'work-pop-the-hollow-man', kind: 'work', name: 'The Hollow Man', author: 'John Dickson Carr', year: 1935, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A locked-room mystery featuring Dr. Gideon Fell, notable for a chapter in which a character discusses the conventions of impossible-crime plots; a landmark of the form. Published in the United States as The Three Coffins.',
    kw: ['john dickson carr', 'gideon fell', 'locked room', 'impossible crime', 'the three coffins'], genres: ['locked-room mystery', 'golden age mystery'],
  },
  {
    id: 'work-pop-gaudy-night', kind: 'work', name: 'Gaudy Night', author: 'Dorothy L. Sayers', year: 1935, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A Wimsey novel set in an Oxford women\'s college, in which a campaign of anonymous harassment is investigated alongside questions about work, marriage and intellectual integrity; admired as a crime novel that doubles as a novel of ideas.',
    kw: ['dorothy sayers', 'harriet vane', 'oxford', 'novel of ideas', 'academic mystery'], genres: ['golden age mystery', 'academic mystery'],
  },
  {
    id: 'work-pop-and-then-there-were-none', kind: 'work', name: 'And Then There Were None', author: 'Agatha Christie', year: 1939, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A novel in which ten strangers are gathered on an isolated island and begin to die one by one; widely cited among the best-selling mystery novels and a model of the closed-circle puzzle.',
    kw: ['agatha christie', 'closed circle', 'island mystery', 'ten little indians', 'countdown plot'], genres: ['golden age mystery', 'closed-circle mystery'],
  },
  {
    id: 'work-pop-the-moving-toyshop', kind: 'work', name: 'The Moving Toyshop', author: 'Edmund Crispin', year: 1946, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A comic Oxford detective novel starring the eccentric professor Gervase Fen; known for its high spirits, farce and allusive literary humour.',
    kw: ['edmund crispin', 'gervase fen', 'oxford', 'comic mystery', 'farce'], genres: ['comic mystery', 'golden age mystery'],
  },
  {
    id: 'work-pop-the-daughter-of-time', kind: 'work', name: 'The Daughter of Time', author: 'Josephine Tey', year: 1951, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A novel in which a bedridden detective re-examines a famous historical reputation using records and documents; a notable example of the armchair-investigation and historical-mystery forms.',
    kw: ['josephine tey', 'historical mystery', 'armchair detective', 'richard iii', 'alan grant'], genres: ['historical mystery', 'armchair detective'],
  },
  {
    id: 'work-pop-the-tiger-in-the-smoke', kind: 'work', name: 'The Tiger in the Smoke', author: 'Margery Allingham', year: 1952, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A late Albert Campion novel set in foggy postwar London, often admired as a work that lifts the detective novel toward the atmosphere and menace of the thriller.',
    kw: ['margery allingham', 'albert campion', 'postwar london', 'fog', 'crossover thriller'], genres: ['golden age mystery', 'thriller'],
  },
  {
    id: 'work-pop-the-case-of-the-velvet-claws', kind: 'work', name: 'The Case of the Velvet Claws', author: 'Erle Stanley Gardner', year: 1933, language: 'English', region: 'United States', confidence: 'established',
    summary: 'The first Perry Mason novel, introducing a defence attorney who solves cases through courtroom tactics; the series helped popularise the courtroom-driven mystery.',
    kw: ['perry mason', 'erle stanley gardner', 'courtroom mystery', 'defence attorney', 'legal mystery'], genres: ['legal mystery', 'courtroom drama'],
  },
  {
    id: 'work-pop-cover-her-face', kind: 'work', name: 'Cover Her Face', author: 'P. D. James', year: 1962, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'The first novel with the poet-policeman Adam Dalgliesh, set in an English manor house; the start of a career that brought psychological depth and literary prose to the traditional mystery.',
    kw: ['pd james', 'adam dalgliesh', 'manor house mystery', 'literary crime', 'british mystery'], genres: ['detective fiction', 'police procedural'],
  },
  {
    id: 'work-pop-a-judgement-in-stone', kind: 'work', name: 'A Judgement in Stone', author: 'Ruth Rendell', year: 1977, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A psychological crime novel that states the crime and culprit at the outset and examines how circumstance and shame lead to it; a leading example of the why-dunit.',
    kw: ['ruth rendell', 'whydunit', 'psychological crime', 'inverted mystery', 'domestic crime'], genres: ['psychological crime', 'inverted detective story'],
  },
  {
    id: 'work-pop-last-bus-to-woodstock', kind: 'work', name: 'Last Bus to Woodstock', author: 'Colin Dexter', year: 1975, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'The first Inspector Morse novel, set in Oxford; it introduces a cerebral, opera-loving detective and his patient sergeant, and launched a long-running series.',
    kw: ['colin dexter', 'inspector morse', 'oxford', 'police procedural', 'british crime'], genres: ['police procedural', 'detective fiction'],
  },

  // ---- Hardboiled, noir and American crime ----
  {
    id: 'work-pop-red-harvest', kind: 'work', name: 'Red Harvest', author: 'Dashiell Hammett', year: 1929, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel in which an unnamed operative from a detective agency sets the factions of a corrupt mining town against one another; an early landmark of the hardboiled style and its moral ambiguity.',
    kw: ['hammett', 'continental op', 'hardboiled', 'corruption', 'black mask'], genres: ['hardboiled fiction', 'crime fiction'],
  },
  {
    id: 'work-pop-little-caesar', kind: 'work', name: 'Little Caesar', author: 'W. R. Burnett', year: 1929, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A gangster novel following a small-time criminal\'s rise and fall in an urban underworld; an early landmark of the gangster story told from the criminal\'s point of view.',
    kw: ['w r burnett', 'gangster novel', 'underworld', 'criminal protagonist'], genres: ['gangster fiction', 'crime fiction'],
  },
  {
    id: 'work-pop-the-maltese-falcon', kind: 'work', name: 'The Maltese Falcon', author: 'Dashiell Hammett', year: 1930, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A San Francisco private-eye novel in which Sam Spade is drawn into the search for a prized statuette; a defining text of hardboiled fiction, known for observing its hero from the outside without access to his thoughts.',
    kw: ['hammett', 'sam spade', 'private eye', 'hardboiled', 'objective narration'], genres: ['hardboiled fiction', 'private-eye fiction'],
  },
  {
    id: 'work-pop-the-thin-man', kind: 'work', name: 'The Thin Man', author: 'Dashiell Hammett', year: 1934, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A comic detective novel about a retired detective and his witty wife, drawn into a missing-inventor case; the banter between husband and wife shaped later crime comedy.',
    kw: ['hammett', 'nick and nora charles', 'comic detective', 'married detectives', 'banter'], genres: ['comic mystery', 'detective fiction'],
  },
  {
    id: 'work-pop-the-postman-always-rings-twice', kind: 'work', name: 'The Postman Always Rings Twice', author: 'James M. Cain', year: 1934, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A short, hard-edged crime novel narrated by a drifter who becomes caught up in an affair and a plot at a roadside diner; a defining example of stripped-down noir told from the wrongdoer\'s side.',
    kw: ['james m cain', 'noir', 'first person criminal', 'depression-era crime', 'spare style'], genres: ['noir', 'crime fiction'],
  },
  {
    id: 'work-pop-they-shoot-horses-dont-they', kind: 'work', name: "They Shoot Horses, Don't They?", author: 'Horace McCoy', year: 1935, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A short, bleak novel set during a Depression-era dance marathon in California; admired for its spare style, its fatalism and its image of exploitation as entertainment.',
    kw: ['horace mccoy', 'dance marathon', 'depression', 'noir', 'fatalism'], genres: ['noir', 'american crime fiction'],
  },
  {
    id: 'work-pop-brighton-rock', kind: 'work', name: 'Brighton Rock', author: 'Graham Greene', year: 1938, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A novel about a teenage gang leader in a seaside town and a woman who pursues the truth about a death; it fuses crime plotting with questions of conscience and belief.',
    kw: ['graham greene', 'gangster', 'seaside crime', 'moral crime novel', 'catholic novel'], genres: ['crime fiction', 'literary thriller'],
  },
  {
    id: 'work-pop-the-big-sleep', kind: 'work', name: 'The Big Sleep', author: 'Raymond Chandler', year: 1939, language: 'English', region: 'United States', confidence: 'established',
    summary: 'The first Philip Marlowe novel, in which a Los Angeles private detective is hired by a wealthy, ailing general; celebrated for its voice, its similes and its mood of urban corruption.',
    kw: ['raymond chandler', 'philip marlowe', 'private eye', 'los angeles', 'hardboiled voice'], genres: ['hardboiled fiction', 'private-eye fiction'],
  },
  {
    id: 'work-pop-farewell-my-lovely', kind: 'work', name: 'Farewell, My Lovely', author: 'Raymond Chandler', year: 1940, language: 'English', region: 'United States', confidence: 'established',
    summary: "A Marlowe novel in which a search for a missing woman draws the detective through Los Angeles' underworld; it shows Chandler's blend of lyrical first-person narration and moral weariness.",
    kw: ['raymond chandler', 'philip marlowe', 'private eye', 'los angeles', 'first person narration'], genres: ['hardboiled fiction', 'private-eye fiction'],
  },
  {
    id: 'work-pop-mildred-pierce', kind: 'work', name: 'Mildred Pierce', author: 'James M. Cain', year: 1941, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A domestic novel of ambition and class in 1930s Southern California, in which a mother builds a restaurant business while her bond with her daughter shapes everything; often grouped with noir for its bleak mood.',
    kw: ['james m cain', 'domestic noir', 'depression-era', 'mother daughter', 'california'], genres: ['noir', 'domestic drama'],
  },
  {
    id: 'work-pop-laura', kind: 'work', name: 'Laura', author: 'Vera Caspary', year: 1943, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel in which a police detective investigating the death of a glamorous advertising executive becomes absorbed in her portrait and her story; a classic of noir atmosphere, told through shifting narrators.',
    kw: ['vera caspary', 'noir', 'multiple narrators', 'obsession', 'new york mystery'], genres: ['noir', 'mystery'],
  },
  {
    id: 'work-pop-in-a-lonely-place', kind: 'work', name: 'In a Lonely Place', author: 'Dorothy B. Hughes', year: 1947, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A noir novel told close to the viewpoint of a disturbed man in postwar Los Angeles; admired for its psychological suspense and its sense of dread in everyday settings.',
    kw: ['dorothy b hughes', 'noir', 'close viewpoint', 'postwar los angeles', 'psychological suspense'], genres: ['noir', 'psychological thriller'],
  },
  {
    id: 'work-pop-i-the-jury', kind: 'work', name: 'I, the Jury', author: 'Mickey Spillane', year: 1947, language: 'English', region: 'United States', confidence: 'established',
    summary: 'The first Mike Hammer novel, a violent, fast-moving private-eye story that sold in very large numbers and became a benchmark for postwar pulp crime fiction.',
    kw: ['mickey spillane', 'mike hammer', 'pulp crime', 'private eye', 'paperback bestseller'], genres: ['hardboiled fiction', 'pulp'],
  },
  {
    id: 'work-pop-the-moving-target', kind: 'work', name: 'The Moving Target', author: 'Ross Macdonald (Kenneth Millar)', year: 1949, language: 'English', region: 'United States', confidence: 'established',
    summary: 'The first Lew Archer novel, in which a Californian private detective searches for a missing oilman; the series later became known for family secrets and psychological depth within the private-eye form.',
    kw: ['ross macdonald', 'kenneth millar', 'lew archer', 'california', 'family secrets'], genres: ['private-eye fiction', 'hardboiled fiction'],
  },
  {
    id: 'work-pop-strangers-on-a-train', kind: 'work', name: 'Strangers on a Train', author: 'Patricia Highsmith', year: 1950, language: 'English', region: 'United States', confidence: 'established',
    summary: "Highsmith's first published novel, a suspense story in which a chance meeting leads two men to consider a swap of murders; a model of the psychological thriller about ordinary people drawn toward crime.",
    kw: ['patricia highsmith', 'psychological suspense', 'swap murders', 'doubles', 'first novel'], genres: ['psychological thriller', 'suspense'],
  },
  {
    id: 'work-pop-the-killer-inside-me', kind: 'work', name: 'The Killer Inside Me', author: 'Jim Thompson', year: 1952, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A noir novel narrated by a deputy sheriff in a small Texas town, whose calm, friendly voice conceals a violent mind; a landmark of the disturbed first-person criminal narrator.',
    kw: ['jim thompson', 'noir', 'first person narrator', 'small town texas', 'unreliable narrator'], genres: ['noir', 'psychological crime'],
  },
  {
    id: 'work-pop-the-long-goodbye', kind: 'work', name: 'The Long Goodbye', author: 'Raymond Chandler', year: 1953, language: 'English', region: 'United States', confidence: 'established',
    summary: "A Marlowe novel centred on friendship and loyalty, often considered Chandler's most personal and ambitious; it stretches the private-eye form toward the literary novel.",
    kw: ['raymond chandler', 'philip marlowe', 'friendship', 'literary crime', 'private eye'], genres: ['hardboiled fiction', 'private-eye fiction'],
  },
  {
    id: 'work-pop-the-talented-mr-ripley', kind: 'work', name: 'The Talented Mr. Ripley', author: 'Patricia Highsmith', year: 1955, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A psychological suspense novel following a charming young American in Italy who slides into deceit; it begins a series that keeps the reader aligned with an amoral protagonist.',
    kw: ['patricia highsmith', 'tom ripley', 'amoral protagonist', 'psychological suspense', 'italy'], genres: ['psychological thriller', 'suspense'],
  },
  {
    id: 'work-pop-pop-1280', kind: 'work', name: 'Pop. 1280', author: 'Jim Thompson', year: 1964, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A darkly comic noir narrated by a small-town sheriff in the American South; it combines grim humour with bleak social observation.',
    kw: ['jim thompson', 'noir', 'dark comedy', 'sheriff narrator', 'southern crime'], genres: ['noir', 'black comedy'],
  },
  {
    id: 'work-pop-cotton-comes-to-harlem', kind: 'work', name: 'Cotton Comes to Harlem', author: 'Chester Himes', year: 1965, language: 'English', region: 'United States', confidence: 'established',
    summary: "A comic and violent novel about two Harlem detectives pursuing a swindle that preys on residents' hopes; part of Himes's Harlem series, which combined crime fiction with social satire.",
    kw: ['chester himes', 'harlem', 'grave digger and coffin ed', 'social satire', 'black crime fiction'], genres: ['crime fiction', 'social satire'],
  },
  {
    id: 'work-pop-the-godfather', kind: 'work', name: 'The Godfather', author: 'Mario Puzo', year: 1969, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A crime novel of an American Mafia family and the succession of power within it; a defining bestseller of the crime family saga.',
    kw: ['mario puzo', 'mafia', 'crime family saga', 'organized crime', 'corleone'], genres: ['crime fiction', 'family saga'],
  },
  {
    id: 'work-pop-the-friends-of-eddie-coyle', kind: 'work', name: 'The Friends of Eddie Coyle', author: 'George V. Higgins', year: 1970, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A Boston crime novel told almost entirely through the talk of small-time criminals, informers and police; celebrated for its dialogue-driven method.',
    kw: ['george v higgins', 'boston', 'dialogue driven', 'informers', 'crime dialogue'], genres: ['crime fiction'],
  },
  {
    id: 'work-pop-the-blessing-way', kind: 'work', name: 'The Blessing Way', author: 'Tony Hillerman', year: 1970, language: 'English', region: 'United States', confidence: 'established',
    summary: 'The first Navajo Tribal Police novel, a mystery that draws on Navajo customs and the Southwest landscape; it helped establish the culturally grounded regional mystery.',
    kw: ['tony hillerman', 'joe leaphorn', 'navajo', 'southwest', 'regional mystery'], genres: ['regional mystery', 'police procedural'],
  },
  {
    id: 'work-pop-the-sins-of-the-fathers', kind: 'work', name: 'The Sins of the Fathers', author: 'Lawrence Block', year: 1976, language: 'English', region: 'United States', confidence: 'established',
    summary: 'An early Matthew Scudder novel about a former police officer working as an unlicensed detective in New York; the series is noted for its sober tone and its feeling for the city.',
    kw: ['lawrence block', 'matthew scudder', 'new york', 'private eye', 'urban crime'], genres: ['private-eye fiction'],
  },
  {
    id: 'work-pop-a-is-for-alibi', kind: 'work', name: 'A Is for Alibi', author: 'Sue Grafton', year: 1982, language: 'English', region: 'United States', confidence: 'established',
    summary: 'The first of the alphabet series featuring Kinsey Millhone, a private investigator in a fictional California town; a leading example of the female hardboiled detective of the 1980s.',
    kw: ['sue grafton', 'kinsey millhone', 'alphabet series', 'female private eye', 'california'], genres: ['private-eye fiction', 'series fiction'],
  },
  {
    id: 'work-pop-indemnity-only', kind: 'work', name: 'Indemnity Only', author: 'Sara Paretsky', year: 1982, language: 'English', region: 'United States', confidence: 'established',
    summary: 'The first V. I. Warshawski novel, set in Chicago; it helped open the American private-eye tradition to women protagonists with their own social concerns.',
    kw: ['sara paretsky', 'v i warshawski', 'chicago', 'female private eye', 'feminist crime'], genres: ['private-eye fiction'],
  },
  {
    id: 'work-pop-l-a-confidential', kind: 'work', name: 'L.A. Confidential', author: 'James Ellroy', year: 1990, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A dense, fast-moving novel of three Los Angeles police officers in the early 1950s, noted for its clipped prose and its picture of institutional corruption.',
    kw: ['james ellroy', 'los angeles', 'corrupt police', 'historical noir', 'clipped prose'], genres: ['noir', 'historical crime fiction'],
  },
  {
    id: 'work-pop-devil-in-a-blue-dress', kind: 'work', name: 'Devil in a Blue Dress', author: 'Walter Mosley', year: 1990, language: 'English', region: 'United States', confidence: 'established',
    summary: 'The first Easy Rawlins novel, set in 1948 Los Angeles, in which an out-of-work Black veteran takes a job finding a missing woman; it brought race and history into the hardboiled tradition.',
    kw: ['walter mosley', 'easy rawlins', 'los angeles 1948', 'black detective', 'historical noir'], genres: ['hardboiled fiction', 'historical crime fiction'],
  },
  {
    id: 'work-pop-get-shorty', kind: 'work', name: 'Get Shorty', author: 'Elmore Leonard', year: 1990, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A crime comedy in which a Miami loan shark\'s collector moves into the film business in Hollywood; typical of Leonard\'s dialogue-led, lightly told style.',
    kw: ['elmore leonard', 'crime comedy', 'hollywood', 'dialogue', 'loan shark'], genres: ['crime comedy', 'caper'],
  },
  {
    id: 'work-pop-the-black-echo', kind: 'work', name: 'The Black Echo', author: 'Michael Connelly', year: 1992, language: 'English', region: 'United States', confidence: 'established',
    summary: 'The first Harry Bosch novel, a Los Angeles police procedural featuring a detective haunted by his service in Vietnam; the start of a long, carefully continuous series.',
    kw: ['michael connelly', 'harry bosch', 'los angeles', 'police procedural', 'vietnam veteran'], genres: ['police procedural'],
  },
  {
    id: 'work-pop-mystic-river', kind: 'work', name: 'Mystic River', author: 'Dennis Lehane', year: 2001, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A crime novel about three boyhood friends in Boston whose lives are re-entangled by a murder; praised as crime fiction with the weight of a social novel.',
    kw: ['dennis lehane', 'boston', 'childhood friends', 'literary crime', 'working class'], genres: ['crime fiction', 'literary crime'],
  },
  {
    id: 'work-pop-no-country-for-old-men', kind: 'work', name: 'No Country for Old Men', author: 'Cormac McCarthy', year: 2005, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A spare crime novel set in the Texas borderlands, following a hunter who finds drug money, a relentless killer and a weary sheriff; notable for minimal punctuation and its western-noir blend.',
    kw: ['cormac mccarthy', 'texas', 'borderlands', 'western noir', 'sheriff'], genres: ['western noir', 'crime fiction'],
  },
  {
    id: 'work-pop-the-lincoln-lawyer', kind: 'work', name: 'The Lincoln Lawyer', author: 'Michael Connelly', year: 2005, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A legal thriller about a Los Angeles defence attorney who works from the back seat of his car; the first Mickey Haller novel.',
    kw: ['michael connelly', 'mickey haller', 'legal thriller', 'defence attorney', 'los angeles'], genres: ['legal thriller'],
  },

  // ---- Police procedural and international crime ----
  {
    id: 'work-pop-pietr-le-letton', kind: 'work', name: 'Pietr-le-Letton', author: 'Georges Simenon', year: 1931, language: 'French', region: 'France', confidence: 'established',
    summary: 'The first published Maigret novel, introducing the Paris police commissaire known for patient attention to people and place. English translations carry titles such as The Strange Case of Peter the Lett.',
    kw: ['simenon', 'maigret', 'paris police', 'french crime fiction', 'roman dur'], genres: ['police procedural', 'detective fiction'],
  },
  {
    id: 'work-pop-cop-hater', kind: 'work', name: 'Cop Hater', author: 'Ed McBain (Evan Hunter)', year: 1956, language: 'English', region: 'United States', confidence: 'established',
    summary: 'The first 87th Precinct novel, introducing an ensemble police squad in a fictional city; a founding example of the American police procedural with a team rather than a lone hero.',
    kw: ['ed mcbain', 'evan hunter', '87th precinct', 'police procedural', 'ensemble cast'], genres: ['police procedural'],
  },
  {
    id: 'work-pop-roseanna', kind: 'work', name: 'Roseanna', author: 'Maj Sjöwall and Per Wahlöö', year: 1965, language: 'Swedish', region: 'Sweden', confidence: 'established',
    summary: 'The first of ten Martin Beck novels, a Swedish police procedural that treats policing as patient teamwork and uses the genre to examine society; a foundation of Nordic crime fiction.',
    kw: ['sjowall', 'wahloo', 'martin beck', 'nordic crime', 'swedish police procedural'], genres: ['police procedural', 'nordic noir'],
  },
  {
    id: 'work-pop-the-day-of-the-owl', kind: 'work', name: 'The Day of the Owl', author: 'Leonardo Sciascia', year: 1961, language: 'Italian', region: 'Italy', confidence: 'established',
    summary: 'A short Sicilian crime novel in which a carabinieri captain meets a wall of silence while investigating a killing; a landmark of novels about the Mafia and the limits of the law. In Italian, Il giorno della civetta.',
    kw: ['sciascia', 'sicily', 'mafia novel', 'italian crime fiction', 'il giorno della civetta'], genres: ['crime fiction', 'political crime novel'],
  },
  {
    id: 'work-pop-tatuaje', kind: 'work', name: 'Tatuaje', author: 'Manuel Vázquez Montalbán', year: 1974, language: 'Spanish', region: 'Spain', confidence: 'established',
    summary: 'The first novel about the Barcelona private detective Pepe Carvalho, a gourmet and former Communist; it used crime fiction to comment on Spanish society and politics.',
    kw: ['vazquez montalban', 'pepe carvalho', 'barcelona', 'spanish crime fiction', 'political crime novel'], genres: ['private-eye fiction', 'political crime novel'],
  },
  {
    id: 'work-pop-knots-and-crosses', kind: 'work', name: 'Knots and Crosses', author: 'Ian Rankin', year: 1987, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'The first Inspector Rebus novel, set in Edinburgh; it begins a long series of Scottish police procedurals marked by a bruised, music-loving detective.',
    kw: ['ian rankin', 'inspector rebus', 'edinburgh', 'tartan noir', 'scottish crime'], genres: ['police procedural', 'tartan noir'],
  },
  {
    id: 'work-pop-faceless-killers', kind: 'work', name: 'Faceless Killers', author: 'Henning Mankell', year: 1991, language: 'Swedish', region: 'Sweden', confidence: 'established',
    summary: 'The first Kurt Wallander novel, a Swedish police story that ties a rural murder to questions about immigration and a changing society; it helped bring Nordic crime fiction to a worldwide readership. In Swedish, Mördare utan ansikte.',
    kw: ['henning mankell', 'wallander', 'swedish crime', 'nordic noir', 'mordare utan ansikte'], genres: ['police procedural', 'nordic noir'],
  },
  {
    id: 'work-pop-death-at-la-fenice', kind: 'work', name: 'Death at La Fenice', author: 'Donna Leon', year: 1992, language: 'English', region: 'United States', confidence: 'established',
    summary: 'The first Commissario Guido Brunetti novel, set in Venice and beginning with the death of a conductor at the opera house; known for its portrait of the city and everyday Italian institutions.',
    kw: ['donna leon', 'guido brunetti', 'venice', 'opera house', 'italian setting'], genres: ['police procedural'],
  },
  {
    id: 'work-pop-miss-smillas-feeling-for-snow', kind: 'work', name: "Miss Smilla's Feeling for Snow", author: 'Peter Høeg', year: 1992, language: 'Danish', region: 'Denmark', confidence: 'established',
    summary: 'A Danish novel in which a Greenlandic-Danish woman with a scientist\'s knowledge of snow investigates the death of a boy; it combines thriller, social comment and a vivid sense of cold. In Danish, Frøken Smillas fornemmelse for sne.',
    kw: ['peter hoeg', 'smilla', 'danish thriller', 'greenland', 'nordic crime'], genres: ['thriller', 'nordic noir'],
  },
  {
    id: 'work-pop-the-shape-of-water', kind: 'work', name: 'The Shape of Water', author: 'Andrea Camilleri', year: 1994, language: 'Italian', region: 'Italy', confidence: 'established',
    summary: 'The first Inspector Montalbano novel, set in a fictional Sicilian town; it combines procedural plotting with humour, regional language and food. In Italian, La forma dell\'acqua.',
    kw: ['andrea camilleri', 'montalbano', 'sicily', 'italian crime fiction', 'la forma dellacqua'], genres: ['police procedural', 'comic mystery'],
  },
  {
    id: 'work-pop-total-kheops', kind: 'work', name: 'Total Khéops', author: 'Jean-Claude Izzo', year: 1995, language: 'French', region: 'France', confidence: 'established',
    summary: 'The first novel of the Marseille trilogy, in which a former policeman turns investigator after a friend\'s death; the series is known for its portrait of the port city, its food and its tensions.',
    kw: ['jean-claude izzo', 'marseille', 'fabio montale', 'french noir', 'polar'], genres: ['noir', 'polar'],
  },
  {
    id: 'work-pop-pars-vite-et-reviens-tard', kind: 'work', name: 'Pars vite et reviens tard', author: 'Fred Vargas', year: 2001, language: 'French', region: 'France', confidence: 'established',
    summary: 'A French mystery in which a Paris police commissaire follows strange messages on doors and a medieval-plague obsession; known for its offbeat characters and cerebral, whimsical plotting. Published in English as Have Mercy on Us All.',
    kw: ['fred vargas', 'adamsberg', 'french crime fiction', 'plague', 'have mercy on us all'], genres: ['polar', 'detective fiction'],
  },
  {
    id: 'work-pop-jar-city', kind: 'work', name: 'Jar City', author: 'Arnaldur Indriðason', year: 2000, language: 'Icelandic', region: 'Iceland', confidence: 'established',
    summary: 'An Icelandic police novel in which Inspector Erlendur investigates a killing that leads into old family and medical secrets; central to the international rise of Icelandic crime fiction. In Icelandic, Mýrin.',
    kw: ['arnaldur indridason', 'erlendur', 'icelandic crime', 'nordic noir', 'myrin'], genres: ['police procedural', 'nordic noir'],
  },
  {
    id: 'work-pop-case-histories', kind: 'work', name: 'Case Histories', author: 'Kate Atkinson', year: 2004, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'The first Jackson Brodie novel, interweaving several cold cases through a former policeman turned private investigator; noted for its literary style and ironic tone.',
    kw: ['kate atkinson', 'jackson brodie', 'cold cases', 'literary crime', 'interwoven plots'], genres: ['literary crime', 'private-eye fiction'],
  },
  {
    id: 'work-pop-the-girl-with-the-dragon-tattoo', kind: 'work', name: 'The Girl with the Dragon Tattoo', author: 'Stieg Larsson', year: 2005, language: 'Swedish', region: 'Sweden', confidence: 'established',
    summary: 'The first of three Millennium novels, in which a disgraced journalist and a young hacker investigate a decades-old disappearance; a worldwide bestseller of Nordic crime. In Swedish, Män som hatar kvinnor.',
    kw: ['stieg larsson', 'millennium trilogy', 'nordic noir', 'swedish thriller', 'lisbeth salander'], genres: ['thriller', 'nordic noir'],
  },
  {
    id: 'work-pop-the-devotion-of-suspect-x', kind: 'work', name: 'The Devotion of Suspect X', author: 'Keigo Higashino', year: 2005, language: 'Japanese', region: 'Japan', confidence: 'established',
    summary: 'A Japanese novel in which a mathematician shields a neighbour after a killing while a physicist friend of the police tries to unravel his scheme; a modern classic of the inverted, battle-of-wits mystery.',
    kw: ['keigo higashino', 'japanese mystery', 'mathematician', 'inverted mystery', 'galileo'], genres: ['inverted detective story', 'honkaku mystery'],
  },
  {
    id: 'work-pop-the-broken-shore', kind: 'work', name: 'The Broken Shore', author: 'Peter Temple', year: 2005, language: 'English', region: 'Australia', confidence: 'established',
    summary: 'An Australian crime novel set on the Victorian coast, in which a damaged detective investigates a killing in a small community; widely admired for its compressed prose and its social observation.',
    kw: ['peter temple', 'australian crime', 'victoria', 'rural crime', 'spare prose'], genres: ['crime fiction', 'police procedural'],
  },
  {
    id: 'work-pop-still-life-penny', kind: 'work', name: 'Still Life', author: 'Louise Penny', year: 2005, language: 'English', region: 'Canada', confidence: 'established',
    summary: 'The first Chief Inspector Armand Gamache novel, set in a small Quebec village; a popular modern example of the village mystery with a literary, humane tone.',
    kw: ['louise penny', 'armand gamache', 'three pines', 'quebec', 'village mystery'], genres: ['cosy mystery', 'police procedural'],
  },
  {
    id: 'work-pop-the-keeper-of-lost-causes', kind: 'work', name: 'The Keeper of Lost Causes', author: 'Jussi Adler-Olsen', year: 2007, language: 'Danish', region: 'Denmark', confidence: 'established',
    summary: 'The first Department Q novel, a Danish thriller in which a sidelined detective is given a cold-case unit in a basement; the series is known for its cases and its dark humour. In Danish, Kvinden i buret.',
    kw: ['jussi adler-olsen', 'department q', 'danish thriller', 'cold case', 'nordic crime'], genres: ['police procedural', 'nordic noir'],
  },
  {
    id: 'work-pop-the-snowman', kind: 'work', name: 'The Snowman', author: 'Jo Nesbø', year: 2007, language: 'Norwegian', region: 'Norway', confidence: 'established',
    summary: 'A Norwegian thriller starring the Oslo detective Harry Hole, who hunts a killer active during the first snowfalls; a leading title in the Nordic serial-killer thriller. In Norwegian, Snømannen.',
    kw: ['jo nesbo', 'harry hole', 'oslo', 'serial killer', 'nordic noir'], genres: ['thriller', 'nordic noir'],
  },
  {
    id: 'work-pop-in-the-woods', kind: 'work', name: 'In the Woods', author: 'Tana French', year: 2007, language: 'English', region: 'Ireland', confidence: 'established',
    summary: "A Dublin Murder Squad novel in which a detective investigates a child's death near the woods where his own childhood trauma occurred; praised for atmosphere and character over neat resolution.",
    kw: ['tana french', 'dublin murder squad', 'irish crime', 'psychological mystery', 'atmospheric'], genres: ['psychological crime', 'police procedural'],
  },
  {
    id: 'work-pop-black-water-rising', kind: 'work', name: 'Black Water Rising', author: 'Attica Locke', year: 2009, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A Houston-set thriller of the early 1980s in which a Black lawyer is drawn into a murder that touches civil rights history and local politics; a notable debut of historical and social crime fiction.',
    kw: ['attica locke', 'houston', 'civil rights', 'legal thriller', 'historical crime'], genres: ['legal thriller', 'historical crime fiction'],
  },
  {
    id: 'work-pop-slow-horses', kind: 'work', name: 'Slow Horses', author: 'Mick Herron', year: 2010, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'The first novel about a dumping ground for failed British intelligence officers, treated with dry, bleak humour; a leading modern example of the comic-cynical spy novel.',
    kw: ['mick herron', 'jackson lamb', 'slough house', 'spy comedy', 'british intelligence'], genres: ['spy fiction', 'comic thriller'],
  },
  {
    id: 'work-pop-the-ice-princess', kind: 'work', name: 'The Ice Princess', author: 'Camilla Läckberg', year: 2003, language: 'Swedish', region: 'Sweden', confidence: 'established',
    summary: 'A Swedish village crime novel in which a writer returns to her hometown and becomes entangled in a death; it opened a long series of domestic-flavoured Nordic mysteries. In Swedish, Isprinsessan.',
    kw: ['camilla lackberg', 'fjallbacka', 'swedish crime', 'nordic noir', 'isprinsessan'], genres: ['nordic noir', 'village mystery'],
  },
  {
    id: 'work-pop-the-dry', kind: 'work', name: 'The Dry', author: 'Jane Harper', year: 2016, language: 'English', region: 'Australia', confidence: 'established',
    summary: 'An Australian crime novel set in a drought-stricken farming town, where a federal agent returns for a funeral and reopens a past death; central to the recent wave of Australian rural noir.',
    kw: ['jane harper', 'aaron falk', 'australian outback', 'rural noir', 'drought'], genres: ['rural noir', 'crime fiction'],
  },
  {
    id: 'work-pop-magpie-murders', kind: 'work', name: 'Magpie Murders', author: 'Anthony Horowitz', year: 2016, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: "A mystery that nests a fictional Golden Age novel inside a modern editor's investigation; a self-aware homage to the puzzle tradition.",
    kw: ['anthony horowitz', 'novel within a novel', 'golden age homage', 'metafiction mystery', 'publishing'], genres: ['metafictional mystery', 'golden age pastiche'],
  },
  {
    id: 'work-pop-the-thursday-murder-club', kind: 'work', name: 'The Thursday Murder Club', author: 'Richard Osman', year: 2020, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A comic mystery in which four retirees in a comfortable retirement village investigate cold cases and then a fresh killing; part of the recent revival of the gentle, humorous village mystery.',
    kw: ['richard osman', 'cosy mystery', 'retirement village', 'amateur sleuths', 'comic mystery'], genres: ['cosy mystery', 'comic mystery'],
  },
  {
    id: 'work-pop-the-no-1-ladies-detective-agency', kind: 'work', name: "The No. 1 Ladies' Detective Agency", author: 'Alexander McCall Smith', year: 1998, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A gentle series opener about a woman who sets up a detective agency in Botswana; cosy in tone but attentive to community, ethics and place.',
    kw: ['alexander mccall smith', 'precious ramotswe', 'botswana', 'cosy mystery', 'african setting'], genres: ['cosy mystery', 'series fiction'],
  },
  {
    id: 'work-pop-one-for-the-money', kind: 'work', name: 'One for the Money', author: 'Janet Evanovich', year: 1994, language: 'English', region: 'United States', confidence: 'established',
    summary: 'The first Stephanie Plum novel, a comic crime story about a New Jersey woman who becomes a bail-enforcement agent; a template for the humorous, female-led mystery series.',
    kw: ['janet evanovich', 'stephanie plum', 'bounty hunter', 'comic crime', 'new jersey'], genres: ['comic mystery', 'series fiction'],
  },
  {
    id: 'work-pop-the-mermaids-singing', kind: 'work', name: 'The Mermaids Singing', author: 'Val McDermid', year: 1995, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: "A serial-killer thriller that alternates the profiler's and the killer's perspectives; a landmark of the British psychological crime novel of the 1990s.",
    kw: ['val mcdermid', 'tony hill', 'profiler', 'serial killer', 'forensic crime'], genres: ['psychological thriller', 'crime fiction'],
  },
  {
    id: 'work-pop-azazel', kind: 'work', name: 'Azazel', author: 'Boris Akunin (Grigory Chkhartishvili)', year: 1998, language: 'Russian', region: 'Russia', confidence: 'established',
    summary: 'The first Erast Fandorin novel, a historical detective story set in Moscow in the 1870s; it launched a hugely popular series of period mysteries. Published in English as The Winter Queen.',
    kw: ['boris akunin', 'fandorin', 'russian detective', 'historical mystery', 'the winter queen'], genres: ['historical mystery', 'detective fiction'],
  },
  {
    id: 'work-pop-the-honjin-murders', kind: 'work', name: 'The Honjin Murders', author: 'Seishi Yokomizo', year: 1946, language: 'Japanese', region: 'Japan', confidence: 'established',
    summary: 'A Japanese locked-room mystery set on a traditional family estate, introducing the detective Kosuke Kindaichi; a central work of the honkaku, or puzzle-first, tradition.',
    kw: ['seishi yokomizo', 'kosuke kindaichi', 'locked room', 'honkaku', 'japanese puzzle mystery'], genres: ['locked-room mystery', 'honkaku mystery'],
  },
  {
    id: 'work-pop-the-decagon-house-murders', kind: 'work', name: 'The Decagon House Murders', author: 'Yukito Ayatsuji', year: 1987, language: 'Japanese', region: 'Japan', confidence: 'established',
    summary: 'A Japanese novel in which members of a university mystery club visit an isolated island and are killed one by one; often credited with starting the shin honkaku, or new orthodox, revival of puzzle mysteries.',
    kw: ['yukito ayatsuji', 'shin honkaku', 'closed circle', 'island mystery', 'japanese puzzle mystery'], genres: ['closed-circle mystery', 'honkaku mystery'],
  },
  {
    id: 'work-pop-out-kirino', kind: 'work', name: 'Out', author: 'Natsuo Kirino', year: 1997, language: 'Japanese', region: 'Japan', confidence: 'established',
    summary: 'A Japanese crime novel about women working a night shift at a lunch-box factory who are drawn into covering up a killing; noted for its social commentary on work, money and gender.',
    kw: ['natsuo kirino', 'japanese crime', 'night shift', 'women and crime', 'social realism'], genres: ['crime fiction', 'social crime novel'],
  },

  // ---- Psychological, domestic and legal suspense ----
  {
    id: 'work-pop-rebecca', kind: 'work', name: 'Rebecca', author: 'Daphne du Maurier', year: 1938, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: "A gothic romantic-suspense novel in which a young second wife lives in the shadow of her husband's dead first wife at a Cornish estate; a model for the genre's atmosphere of dread and domestic secrets.",
    kw: ['daphne du maurier', 'gothic suspense', 'manderley', 'romantic suspense', 'unreliable memory'], genres: ['romantic suspense', 'gothic fiction'],
  },
  {
    id: 'work-pop-anatomy-of-a-murder', kind: 'work', name: 'Anatomy of a Murder', author: 'Robert Traver (John D. Voelker)', year: 1958, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A courtroom novel written by a Michigan lawyer-judge under a pen name, centred on the defence of a soldier accused of murder; admired for its realistic procedure and moral grey areas.',
    kw: ['robert traver', 'john voelker', 'courtroom novel', 'legal drama', 'michigan'], genres: ['legal thriller', 'courtroom drama'],
  },
  {
    id: 'work-pop-presumed-innocent', kind: 'work', name: 'Presumed Innocent', author: 'Scott Turow', year: 1987, language: 'English', region: 'United States', confidence: 'established',
    summary: "A legal thriller narrated by a prosecutor who becomes the accused in a colleague's murder; a model of the courtroom novel's procedural realism and moral ambiguity.",
    kw: ['scott turow', 'legal thriller', 'prosecutor narrator', 'courtroom', 'chicago'], genres: ['legal thriller'],
  },
  {
    id: 'work-pop-the-silence-of-the-lambs', kind: 'work', name: 'The Silence of the Lambs', author: 'Thomas Harris', year: 1988, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A thriller in which a young FBI trainee consults an imprisoned psychiatrist to help catch another killer; it shaped the profiler-and-serial-killer subgenre.',
    kw: ['thomas harris', 'hannibal lecter', 'clarice starling', 'serial killer', 'fbi profiler'], genres: ['psychological thriller', 'serial killer fiction'],
  },
  {
    id: 'work-pop-a-time-to-kill', kind: 'work', name: 'A Time to Kill', author: 'John Grisham', year: 1989, language: 'English', region: 'United States', confidence: 'established',
    summary: "Grisham's debut, a courtroom novel in which a trial puts race and justice in a small Mississippi town under pressure.",
    kw: ['john grisham', 'courtroom novel', 'mississippi', 'legal thriller', 'race and justice'], genres: ['legal thriller', 'courtroom drama'],
  },
  {
    id: 'work-pop-the-firm', kind: 'work', name: 'The Firm', author: 'John Grisham', year: 1991, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A legal thriller in which a young tax lawyer discovers that his prestigious firm hides a dangerous secret; a bestseller that set the template for the 1990s legal thriller.',
    kw: ['john grisham', 'legal thriller', 'law firm', 'conspiracy thriller', 'bestseller'], genres: ['legal thriller'],
  },
  {
    id: 'work-pop-the-secret-history', kind: 'work', name: 'The Secret History', author: 'Donna Tartt', year: 1992, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A campus novel that reveals a killing early and traces how a circle of classics students arrives at it; a landmark of the why-dunit and of the dark-academia mood.',
    kw: ['donna tartt', 'dark academia', 'whydunit', 'campus novel', 'classics students'], genres: ['literary thriller', 'campus novel'],
  },
  {
    id: 'work-pop-gone-girl', kind: 'work', name: 'Gone Girl', author: 'Gillian Flynn', year: 2012, language: 'English', region: 'United States', confidence: 'established',
    summary: "A psychological thriller of a marriage told through alternating perspectives after a wife's disappearance; a defining example of the domestic thriller and the unreliable narrator.",
    kw: ['gillian flynn', 'domestic thriller', 'unreliable narrator', 'marriage', 'dual narrators'], genres: ['psychological thriller', 'domestic suspense'],
  },
  {
    id: 'work-pop-the-girl-on-the-train', kind: 'work', name: 'The Girl on the Train', author: 'Paula Hawkins', year: 2015, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A thriller narrated by several women, centred on a commuter who watches a couple from a train window and becomes entangled in a disappearance; a leading title in the wave of domestic-noir bestsellers.',
    kw: ['paula hawkins', 'domestic noir', 'commuter', 'unreliable witness', 'multiple narrators'], genres: ['psychological thriller', 'domestic noir'],
  },
  {
    id: 'work-pop-the-silent-patient', kind: 'work', name: 'The Silent Patient', author: 'Alex Michaelides', year: 2019, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A psychological thriller about a therapist who tries to make a woman speak after she shoots her husband and falls silent; a debut bestseller of the twist-driven 2010s thriller.',
    kw: ['alex michaelides', 'psychological thriller', 'therapist', 'twist ending', 'debut'], genres: ['psychological thriller'],
  },

  // ---- Spy fiction and thrillers ----
  {
    id: 'work-pop-the-thirty-nine-steps', kind: 'work', name: 'The Thirty-Nine Steps', author: 'John Buchan', year: 1915, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A fast adventure in which Richard Hannay, wrongly suspected of murder, flees across Scotland while trying to expose a plot; a founding text of the man-on-the-run thriller and of the British spy adventure.',
    kw: ['john buchan', 'richard hannay', 'man on the run', 'chase thriller', 'early spy fiction'], genres: ['spy fiction', 'thriller', 'adventure'],
  },
  {
    id: 'work-pop-ashenden', kind: 'work', name: 'Ashenden: or The British Agent', author: 'W. Somerset Maugham', year: 1928, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: "A set of linked stories about a writer working as a British agent in the First World War, drawn from the author's own wartime intelligence work; it treats espionage as dull, ironic and morally untidy rather than glamorous.",
    kw: ['maugham', 'ashenden', 'realistic spy fiction', 'linked stories', 'first world war'], genres: ['spy fiction', 'short story cycle'],
  },
  {
    id: 'work-pop-the-mask-of-dimitrios', kind: 'work', name: 'The Mask of Dimitrios', author: 'Eric Ambler', year: 1939, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A thriller in which a detective-story writer in Istanbul becomes fascinated by the life of a dead criminal and retraces it across Europe; it moved the spy and crime thriller toward realism and ordinary protagonists. Published in the United States as A Coffin for Dimitrios.',
    kw: ['eric ambler', 'a coffin for dimitrios', 'ordinary man thriller', 'realistic thriller', 'istanbul'], genres: ['thriller', 'spy fiction'],
  },
  {
    id: 'work-pop-rogue-male', kind: 'work', name: 'Rogue Male', author: 'Geoffrey Household', year: 1939, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A first-person thriller of pursuit in which an English hunter stalks a European dictator and is then hunted himself; praised for its lean, vivid chase narrative and its sense of a man alone against a machine.',
    kw: ['geoffrey household', 'chase thriller', 'manhunt', 'first person thriller', 'hunted hero'], genres: ['thriller', 'chase novel'],
  },
  {
    id: 'work-pop-casino-royale', kind: 'work', name: 'Casino Royale', author: 'Ian Fleming', year: 1953, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'The first James Bond novel, in which a British agent is sent to ruin a Soviet-backed paymaster at a French casino; it established the series\' mix of glamour, brand detail and cold-war menace.',
    kw: ['ian fleming', 'james bond', '007', 'secret agent', 'cold war spy'], genres: ['spy fiction', 'thriller'],
  },
  {
    id: 'work-pop-the-spy-who-came-in-from-the-cold', kind: 'work', name: 'The Spy Who Came in from the Cold', author: 'John le Carré', year: 1963, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A bleak Cold War novel in which a weary British agent takes on a last mission in East Germany; its moral ambiguity and unglamorous tradecraft reshaped the spy novel as literary fiction.',
    kw: ['le carre', 'cold war', 'moral ambiguity', 'berlin', 'realistic spy novel'], genres: ['spy fiction', 'cold war fiction'],
  },
  {
    id: 'work-pop-tinker-tailor-soldier-spy', kind: 'work', name: 'Tinker Tailor Soldier Spy', author: 'John le Carré', year: 1974, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A novel in which the retired intelligence officer George Smiley is called back to find a Soviet mole at the top of British intelligence; a defining example of the slow-burn, institutional spy novel.',
    kw: ['le carre', 'george smiley', 'mole hunt', 'the circus', 'institutional spy novel'], genres: ['spy fiction', 'cold war fiction'],
  },
  {
    id: 'work-pop-a-perfect-spy', kind: 'work', name: 'A Perfect Spy', author: 'John le Carré', year: 1986, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: "A novel that follows a double agent's disappearance and his own written account of his life as the son of a charming con man; often described as the author's most autobiographical book, it uses espionage as a way into character and betrayal.",
    kw: ['le carre', 'double agent', 'father and son', 'coming of age spy novel', 'betrayal'], genres: ['spy fiction', 'literary thriller'],
  },
  {
    id: 'work-pop-the-ipcress-file', kind: 'work', name: 'The Ipcress File', author: 'Len Deighton', year: 1962, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A brisk, ironic Cold War spy novel narrated by an unnamed, working-class British agent who investigates the kidnapping of scientists; known for its sardonic voice and its anti-Bond sense of bureaucracy and class.',
    kw: ['len deighton', 'cold war', 'anti-bond', 'sardonic narrator', 'british spy novel'], genres: ['spy fiction', 'cold war fiction'],
  },
  {
    id: 'work-pop-our-man-in-havana', kind: 'work', name: 'Our Man in Havana', author: 'Graham Greene', year: 1958, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A comic spy novel in which a vacuum-cleaner salesman in pre-revolutionary Cuba is recruited by British intelligence and begins to invent his reports; a satire of intelligence-gathering and of institutional credulity.',
    kw: ['graham greene', 'havana', 'spy satire', 'comic spy novel', 'fabricated intelligence'], genres: ['spy fiction', 'comic thriller', 'satire'],
  },
  {
    id: 'work-pop-the-manchurian-candidate', kind: 'work', name: 'The Manchurian Candidate', author: 'Richard Condon', year: 1959, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A Cold War political thriller about a Korean War veteran and a conspiracy built on brainwashing and manipulated loyalty; it became a reference point for paranoia and sleeper-agent stories.',
    kw: ['richard condon', 'brainwashing', 'sleeper agent', 'political thriller', 'paranoia'], genres: ['political thriller', 'cold war fiction'],
  },
  {
    id: 'work-pop-the-day-of-the-jackal', kind: 'work', name: 'The Day of the Jackal', author: 'Frederick Forsyth', year: 1971, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: "A thriller that follows, in documentary detail, a professional assassin's plot against the French president and the police effort to stop him; known for making a foreknown historical outcome suspenseful through process and method.",
    kw: ['frederick forsyth', 'assassin', 'procedural thriller', 'documentary style', 'paris'], genres: ['thriller', 'procedural thriller'],
  },
  {
    id: 'work-pop-six-days-of-the-condor', kind: 'work', name: 'Six Days of the Condor', author: 'James Grady', year: 1974, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A paranoid thriller in which a low-level CIA reader returns from lunch to find his colleagues killed and must work out why; a model of the 1970s conspiracy thriller in which the hero distrusts his own side.',
    kw: ['james grady', 'cia', 'conspiracy thriller', 'paranoia', 'seventies thriller'], genres: ['conspiracy thriller', 'spy fiction'],
  },
  {
    id: 'work-pop-eye-of-the-needle', kind: 'work', name: 'Eye of the Needle', author: 'Ken Follett', year: 1978, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A Second World War thriller in which a German spy in Britain races to get a crucial discovery to his superiors while a young woman on a remote island is drawn into events; an early success of the cat-and-mouse espionage plot. Published in the United States as Storm Island.',
    kw: ['ken follett', 'storm island', 'world war two spy', 'cat and mouse', 'espionage thriller'], genres: ['spy fiction', 'thriller'],
  },
  {
    id: 'work-pop-the-bourne-identity', kind: 'work', name: 'The Bourne Identity', author: 'Robert Ludlum', year: 1980, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A thriller in which a man with no memory finds that he has deadly skills and a price on his head; a template for the amnesiac-hero chase and for the global conspiracy thriller.',
    kw: ['robert ludlum', 'jason bourne', 'amnesia', 'chase thriller', 'global conspiracy'], genres: ['thriller', 'spy fiction'],
  },
  {
    id: 'work-pop-gorky-park', kind: 'work', name: 'Gorky Park', author: 'Martin Cruz Smith', year: 1981, language: 'English', region: 'United States', confidence: 'established',
    summary: "A Moscow detective story in which a militia investigator examines three frozen bodies found in a park and runs into state secrets; it set the police procedural in the Soviet Union and shows how a regime's rules shape an investigation.",
    kw: ['martin cruz smith', 'arkady renko', 'moscow', 'soviet setting', 'police procedural'], genres: ['police procedural', 'thriller'],
  },
  {
    id: 'work-pop-the-hunt-for-red-october', kind: 'work', name: 'The Hunt for Red October', author: 'Tom Clancy', year: 1984, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A Cold War thriller about a Soviet submarine commander who may be trying to defect and the American analyst who tries to read his intentions; a founding example of the technological or military thriller.',
    kw: ['tom clancy', 'jack ryan', 'submarine', 'techno-thriller', 'military thriller'], genres: ['techno-thriller', 'military thriller'],
  },
  {
    id: 'work-pop-jaws', kind: 'work', name: 'Jaws', author: 'Peter Benchley', year: 1974, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel about a New England beach town menaced by a great white shark and the officials who hesitate to close the beaches; a landmark of the creature thriller and of the summer blockbuster bestseller.',
    kw: ['peter benchley', 'shark', 'creature thriller', 'beach town', 'blockbuster novel'], genres: ['thriller', 'creature feature'],
  },
  {
    id: 'work-pop-fatherland', kind: 'work', name: 'Fatherland', author: 'Robert Harris', year: 1992, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'An alternative-history thriller set in a Germany that won the Second World War, in which a police detective investigates a death that touches a state secret; a leading example of the alternate-history crime novel.',
    kw: ['robert harris', 'alternate history', 'nazi germany what if', 'detective thriller', 'counterfactual'], genres: ['alternate history', 'police procedural', 'thriller'],
  },
  {
    id: 'work-pop-the-da-vinci-code', kind: 'work', name: 'The Da Vinci Code', author: 'Dan Brown', year: 2003, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A conspiracy thriller in which a symbologist and a cryptologist follow a trail of art, symbols and puzzles across Paris and London after a murder in a museum; a worldwide bestseller whose short, cliffhanging chapters became a model for the page-turner.',
    kw: ['dan brown', 'robert langdon', 'puzzle thriller', 'cliffhanger chapters', 'conspiracy bestseller'], genres: ['conspiracy thriller', 'puzzle thriller'],
  },
  {
    id: 'work-pop-the-cuckoos-calling', kind: 'work', name: "The Cuckoo's Calling", author: 'Robert Galbraith (J. K. Rowling)', year: 2013, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: "The first Cormoran Strike novel, a London private-eye story about the apparent suicide of a famous model; published under the pen name Robert Galbraith, which belongs to J. K. Rowling.",
    kw: ['robert galbraith', 'j k rowling', 'cormoran strike', 'private eye', 'london crime'], genres: ['private-eye fiction', 'detective fiction'],
  },

  // ---- Romance: early and classic ----
  {
    id: 'work-pop-the-sheik', kind: 'work', name: 'The Sheik', author: 'E. M. Hull', year: 1919, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A bestselling desert romance in which a headstrong Englishwoman is taken captive by a sheikh; hugely popular in its day, it shaped the abduction-romance tradition and is now read critically for its colonial attitudes.',
    kw: ['e m hull', 'desert romance', 'abduction romance', 'early bestseller', 'popular romance history'], genres: ['romance', 'desert romance'],
  },
  {
    id: 'work-pop-the-blue-castle', kind: 'work', name: 'The Blue Castle', author: 'L. M. Montgomery', year: 1926, language: 'English', region: 'Canada', confidence: 'established',
    summary: 'A romance for adult readers by the author of Anne of Green Gables, in which a repressed young woman in small-town Ontario decides to live on her own terms; a gentle model of the late-blooming heroine.',
    kw: ['montgomery', 'canadian romance', 'late bloomer', 'small town', 'ontario'], genres: ['romance', 'comedy of manners'],
  },
  {
    id: 'work-pop-these-old-shades', kind: 'work', name: 'These Old Shades', author: 'Georgette Heyer', year: 1926, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'An early Georgian-set romance of intrigue, disguise and a wary nobleman, notable for its witty banter and carefully built period manners; a foundation stone of the historical romance tradition.',
    kw: ['heyer', 'georgian romance', 'historical romance', 'banter', 'period slang'], genres: ['historical romance', 'comedy of manners'],
  },
  {
    id: 'work-pop-regency-buck', kind: 'work', name: 'Regency Buck', author: 'Georgette Heyer', year: 1935, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'Usually described as the first Regency-set novel by Heyer, who helped make the Regency a distinct romance setting with its own slang, fashions, social codes and comic sensibility.',
    kw: ['heyer', 'regency romance', 'regency setting', 'comedy of manners', 'period detail'], genres: ['regency romance', 'historical romance'],
  },
  {
    id: 'work-pop-the-grand-sophy', kind: 'work', name: 'The Grand Sophy', author: 'Georgette Heyer', year: 1950, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A Regency comedy in which a confident, managing young woman rearranges her cousins\' lives; admired for its farcical plotting and a heroine who drives every scene.',
    kw: ['heyer', 'regency comedy', 'meddling heroine', 'farce', 'romantic comedy history'], genres: ['regency romance', 'romantic comedy'],
  },
  {
    id: 'work-pop-the-flame-and-the-flower', kind: 'work', name: 'The Flame and the Flower', author: 'Kathleen E. Woodiwiss', year: 1972, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A long historical romance published as a paperback original, widely regarded as the book that opened the modern historical-romance boom of the 1970s and its sweeping, high-stakes style.',
    kw: ['woodiwiss', 'historical romance boom', 'paperback original', 'bodice ripper', 'seventies romance'], genres: ['historical romance'],
  },
  {
    id: 'work-pop-outlander', kind: 'work', name: 'Outlander', author: 'Diana Gabaldon', year: 1991, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A time-travel historical romance in which a Second World War nurse is carried to eighteenth-century Scotland; it blends love story, adventure and dense period detail and opened a long series.',
    kw: ['gabaldon', 'time travel romance', 'scotland', 'jamie fraser', 'series opener'], genres: ['historical romance', 'time-travel romance'],
  },
  {
    id: 'work-pop-the-thorn-birds', kind: 'work', name: 'The Thorn Birds', author: 'Colleen McCullough', year: 1977, language: 'English', region: 'Australia', confidence: 'established',
    summary: 'A family saga and forbidden love story set on an Australian sheep station across several decades; a worldwide bestseller of the late 1970s and a landmark of the popular romantic saga.',
    kw: ['mccullough', 'australian saga', 'forbidden love', 'family saga', 'sheep station'], genres: ['family saga', 'romance'],
  },
  {
    id: 'work-pop-riders', kind: 'work', name: 'Riders', author: 'Jilly Cooper', year: 1985, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A comic, sprawling romance among rival show-jumpers in the English countryside; the first of the Rutshire Chronicles, known for its high spirits, rivalries and very large cast.',
    kw: ['jilly cooper', 'rutshire chronicles', 'show jumping', 'bonkbuster', 'comic romance'], genres: ['romance', 'comic novel', 'sports fiction'],
  },
  // ---- Romance: contemporary and romantic comedy ----
  {
    id: 'work-pop-bridget-joness-diary', kind: 'work', name: "Bridget Jones's Diary", author: 'Helen Fielding', year: 1996, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: "A diary-form comic novel about a single London woman's year of work, friends and romance, loosely modelled on Pride and Prejudice; a landmark of modern women's comic fiction.",
    kw: ['helen fielding', 'diary novel', 'chick lit', 'romantic comedy', 'singleton'], genres: ['romantic comedy', 'diary novel', 'chick lit'],
  },
  {
    id: 'work-pop-the-secret-dreamworld-of-a-shopaholic', kind: 'work', name: 'The Secret Dreamworld of a Shopaholic', aka: ['Confessions of a Shopaholic'], author: 'Sophie Kinsella (Madeleine Wickham)', year: 2000, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A comic novel of a young financial journalist whose spending outruns her income and whose white lies keep growing; the first of a long series and a popular example of chick lit.',
    kw: ['sophie kinsella', 'shopaholic', 'chick lit', 'comic heroine', 'series opener'], genres: ['chick lit', 'romantic comedy'],
  },
  {
    id: 'work-pop-the-notebook', kind: 'work', name: 'The Notebook', author: 'Nicholas Sparks', year: 1996, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A sentimental love story set in North Carolina and framed by an older man reading aloud; the book that launched Sparks\'s run of bestselling romances.',
    kw: ['nicholas sparks', 'sentimental romance', 'frame story', 'north carolina', 'tearjerker'], genres: ['contemporary romance', 'sentimental fiction'],
  },
  {
    id: 'work-pop-the-bridges-of-madison-county', kind: 'work', name: 'The Bridges of Madison County', author: 'Robert James Waller', year: 1992, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A short, bestselling novel about a brief romance between a farm wife and a travelling photographer in rural Iowa; a defining popular love story of the early 1990s.',
    kw: ['waller', 'iowa', 'brief encounter', 'short bestseller', 'forbidden romance'], genres: ['contemporary romance'],
  },
  {
    id: 'work-pop-love-story', kind: 'work', name: 'Love Story', author: 'Erich Segal', year: 1970, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A short, sentimental novel of two students from different backgrounds who fall in love; a huge bestseller that became a film in the same year and set a template for the romantic tearjerker.',
    kw: ['erich segal', 'tearjerker', 'campus romance', 'seventies bestseller', 'sentimental fiction'], genres: ['contemporary romance', 'sentimental fiction'],
  },
  {
    id: 'work-pop-me-before-you', kind: 'work', name: 'Me Before You', author: 'Jojo Moyes', year: 2012, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A contemporary love story between a young woman and the man she is hired to care for after a life-changing accident; widely read and widely discussed for its treatment of disability and choice.',
    kw: ['jojo moyes', 'contemporary romance', 'disability in fiction', 'book club novel', 'emotional bestseller'], genres: ['contemporary romance', 'women\'s fiction'],
  },
  {
    id: 'work-pop-one-day', kind: 'work', name: 'One Day', author: 'David Nicholls', year: 2009, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A novel that revisits the same date each year across two decades in the lives of two friends; a well-known model of the one-day-per-chapter structure for a long love story.',
    kw: ['david nicholls', 'same date each year', 'friends to lovers', 'time-skip structure', 'bestselling romance'], genres: ['contemporary romance', 'structural experiment'],
  },
  {
    id: 'work-pop-the-rosie-project', kind: 'work', name: 'The Rosie Project', author: 'Graeme Simsion', year: 2013, language: 'English', region: 'Australia', confidence: 'established',
    summary: 'A romantic comedy narrated by a precise, socially awkward geneticist who designs a questionnaire to find a wife; a popular example of the voice-driven romcom.',
    kw: ['simsion', 'romcom', 'first person comedy', 'neurodivergent narrator', 'australian novel'], genres: ['romantic comedy', 'first-person comic novel'],
  },
  {
    id: 'work-pop-the-hating-game', kind: 'work', name: 'The Hating Game', author: 'Sally Thorne', year: 2016, language: 'English', region: 'Australia', confidence: 'established',
    summary: 'A workplace romantic comedy between two rival assistants who share an office; a leading modern example of the enemies-to-lovers trope.',
    kw: ['sally thorne', 'enemies to lovers', 'office romance', 'workplace romcom', 'banter'], genres: ['romantic comedy', 'contemporary romance'],
  },
  {
    id: 'work-pop-the-kiss-quotient', kind: 'work', name: 'The Kiss Quotient', author: 'Helen Hoang', year: 2018, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A contemporary romance with an autistic heroine who hires an escort to teach her about intimacy; notable for bringing neurodivergent leads into mainstream romance.',
    kw: ['helen hoang', 'autistic heroine', 'neurodivergent romance', 'fake relationship', 'contemporary romance'], genres: ['contemporary romance', 'romantic comedy'],
  },
  {
    id: 'work-pop-beach-read', kind: 'work', name: 'Beach Read', author: 'Emily Henry', year: 2020, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A romantic comedy about two rival authors, one of romance and one of literary fiction, who challenge each other to write in the other\'s genre; a popular example of the writers-in-love story.',
    kw: ['emily henry', 'writers falling in love', 'rivals to lovers', 'romcom', 'genre swap'], genres: ['romantic comedy', 'contemporary romance'],
  },
  {
    id: 'work-pop-the-duke-and-i', kind: 'work', name: 'The Duke and I', author: 'Julia Quinn', year: 2000, language: 'English', region: 'United States', confidence: 'established',
    summary: 'The first Bridgerton novel, a Regency romance built on a pretend courtship between a duke determined never to marry and a viscount\'s sister; a model for the modern Regency romance with ensemble family series.',
    kw: ['julia quinn', 'bridgerton', 'fake courtship', 'regency romance', 'sibling series'], genres: ['regency romance', 'historical romance'],
  },
  {
    id: 'work-pop-normal-people', kind: 'work', name: 'Normal People', author: 'Sally Rooney', year: 2018, language: 'English', region: 'Ireland', confidence: 'established',
    summary: 'A novel following the on-and-off relationship of two Irish people from school into adulthood; noted for its plain style and for setting dialogue without quotation marks.',
    kw: ['sally rooney', 'irish novel', 'no quotation marks', 'millennial love story', 'class and desire'], genres: ['contemporary romance', 'literary fiction'],
  },
  {
    id: 'work-pop-daisy-jones-and-the-six', kind: 'work', name: 'Daisy Jones & The Six', author: 'Taylor Jenkins Reid', year: 2019, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel told as an oral history of a fictional 1970s rock band and the tangled relationships inside it; a popular example of the interview-collage form.',
    kw: ['taylor jenkins reid', 'oral history novel', 'fictional band', 'documentary format', 'seventies music'], genres: ['oral-history novel', 'romance', 'women\'s fiction'],
  },
  // ---- Romance: LGBTQ+ landmarks ----
  {
    id: 'work-pop-the-price-of-salt', kind: 'work', name: 'The Price of Salt', author: 'Patricia Highsmith (as Claire Morgan)', year: 1952, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel of love between two women in 1950s America, first published under a pseudonym and later reissued as Carol; notable for its hopeful ending in an era when such books were expected to end badly.',
    kw: ['highsmith', 'carol', 'claire morgan', 'lesbian fiction', 'fifties america'], genres: ['LGBTQ+ romance', 'lesbian fiction'],
  },
  {
    id: 'work-pop-rubyfruit-jungle', kind: 'work', name: 'Rubyfruit Jungle', author: 'Rita Mae Brown', year: 1973, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A comic coming-of-age novel narrated by an outspoken working-class lesbian heroine; an early landmark of openly lesbian fiction in the United States.',
    kw: ['rita mae brown', 'lesbian coming of age', 'first person comic voice', 'working class', 'seventies lesbian fiction'], genres: ['LGBTQ+ fiction', 'coming-of-age novel'],
  },
  {
    id: 'work-pop-tipping-the-velvet', kind: 'work', name: 'Tipping the Velvet', author: 'Sarah Waters', year: 1998, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A debut novel that follows a young woman from an oyster-house family into the world of Victorian music halls and romantic discovery; a landmark of lesbian historical fiction.',
    kw: ['sarah waters', 'victorian music hall', 'lesbian historical fiction', 'neo-victorian', 'debut novel'], genres: ['LGBTQ+ historical fiction', 'neo-Victorian fiction'],
  },
  {
    id: 'work-pop-fingersmith', kind: 'work', name: 'Fingersmith', author: 'Sarah Waters', year: 2002, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A Victorian crime-and-love novel in which a young pickpocket is drawn into a con, told in parts that shift point of view; a landmark of lesbian historical fiction and plot-twist craft.',
    kw: ['sarah waters', 'victorian con', 'plot twists', 'shifting viewpoint', 'neo-victorian crime'], genres: ['LGBTQ+ historical fiction', 'neo-Victorian fiction', 'crime fiction'],
  },
  {
    id: 'work-pop-call-me-by-your-name', kind: 'work', name: 'Call Me by Your Name', author: 'André Aciman', year: 2007, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A first-person novel of a summer romance between a teenage boy and an older visiting scholar on the Italian coast; a landmark of modern gay literary fiction.',
    kw: ['aciman', 'gay romance', 'summer romance', 'first person retrospective', 'italy'], genres: ['LGBTQ+ romance', 'literary fiction'],
  },
  {
    id: 'work-pop-red-white-and-royal-blue', kind: 'work', name: 'Red, White & Royal Blue', author: 'Casey McQuiston', year: 2019, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A romantic comedy about the son of a United States president and a British prince; a mainstream bestseller for LGBTQ+ romance and a lively example of the rivals-to-lovers arc.',
    kw: ['casey mcquiston', 'gay romcom', 'rivals to lovers', 'royal romance', 'queer romance bestseller'], genres: ['LGBTQ+ romance', 'romantic comedy'],
  },
  {
    id: 'work-pop-brokeback-mountain', kind: 'work', name: 'Brokeback Mountain', author: 'Annie Proulx', year: 1997, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A short story of a decades-long relationship between two ranch hands in Wyoming, first published in a magazine and later collected in a book of Wyoming stories; it sits where the western and the love story meet.',
    kw: ['annie proulx', 'wyoming', 'queer western', 'short story', 'ranch hands'], genres: ['short story', 'LGBTQ+ romance', 'western'],
  },
  {
    id: 'work-pop-the-time-travelers-wife', kind: 'work', name: "The Time Traveler's Wife", author: 'Audrey Niffenegger', year: 2003, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A love story between a man with an involuntary time-travel condition and the woman he marries; a popular example of speculative romance told in alternating viewpoints and shifting dates.',
    kw: ['niffenegger', 'time travel romance', 'speculative romance', 'dual viewpoint', 'dated chapters'], genres: ['speculative romance', 'time-travel romance'],
  },

  // ---- Historical fiction: nineteenth and early twentieth century ----
  {
    id: 'work-pop-ivanhoe', kind: 'work', name: 'Ivanhoe', author: 'Walter Scott', year: 1819, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A medieval romance of knights, outlaws and divided loyalties in twelfth-century England; it did much to fix popular images of the Middle Ages and of the Saxon and Norman divide.',
    kw: ['walter scott', 'medieval romance', 'knights and outlaws', 'historical novel origins', 'saxons and normans'], genres: ['historical novel', 'medieval romance', 'adventure'],
  },
  {
    id: 'work-pop-the-last-days-of-pompeii', kind: 'work', name: 'The Last Days of Pompeii', author: 'Edward Bulwer-Lytton', year: 1834, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A historical novel set in the Roman town in the days before the eruption of Vesuvius; an influential model of the novel that builds a lost city through its characters and daily life.',
    kw: ['bulwer-lytton', 'pompeii', 'roman world', 'ancient setting', 'disaster historical novel'], genres: ['historical novel', 'ancient-world fiction'],
  },
  {
    id: 'work-pop-ben-hur', kind: 'work', name: 'Ben-Hur: A Tale of the Christ', author: 'Lew Wallace', year: 1880, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A historical adventure of a Jewish nobleman wronged under Roman rule, famous for its galley and chariot-race set pieces; one of the best-selling American novels of the nineteenth century.',
    kw: ['lew wallace', 'chariot race', 'roman empire', 'biblical epic', 'revenge and faith'], genres: ['historical novel', 'biblical fiction', 'adventure'],
  },
  {
    id: 'work-pop-the-cloister-and-the-hearth', kind: 'work', name: 'The Cloister and the Hearth', author: 'Charles Reade', year: 1861, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A long novel of fifteenth-century Europe that imagines the parents of the scholar Erasmus; admired for its dense research and its sustained picture of a vanished world.',
    kw: ['charles reade', 'fifteenth century', 'erasmus', 'research heavy historical', 'victorian historical novel'], genres: ['historical novel'],
  },
  {
    id: 'work-pop-lorna-doone', kind: 'work', name: 'Lorna Doone', author: 'R. D. Blackmore', year: 1869, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A romance of outlaws, feuding families and a farmer\'s love in seventeenth-century Exmoor; long a staple of regional and historical romantic adventure.',
    kw: ['blackmore', 'exmoor', 'outlaws', 'west country romance', 'seventeenth century'], genres: ['historical romance', 'regional fiction', 'adventure'],
  },
  // ---- Historical fiction: swashbucklers and sea ----
  {
    id: 'work-pop-scaramouche', kind: 'work', name: 'Scaramouche', author: 'Rafael Sabatini', year: 1921, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A swashbuckling novel of the French Revolution in which a young man becomes an actor, a fencer and a political agitator; known for a famous opening sentence.',
    kw: ['sabatini', 'swashbuckler', 'french revolution', 'fencing', 'theatre and politics'], genres: ['swashbuckler', 'historical novel', 'adventure'],
  },
  {
    id: 'work-pop-captain-blood', kind: 'work', name: 'Captain Blood: His Odyssey', author: 'Rafael Sabatini', year: 1922, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A swashbuckler about a physician in seventeenth-century England who is sold into slavery and turns to piracy; a classic of the pirate adventure and its code of gentlemanly rogues.',
    kw: ['sabatini', 'pirate adventure', 'swashbuckler', 'caribbean', 'gentleman rogue'], genres: ['swashbuckler', 'pirate fiction', 'historical novel'],
  },
  {
    id: 'work-pop-the-scarlet-pimpernel', kind: 'work', name: 'The Scarlet Pimpernel', author: 'Baroness Orczy', year: 1905, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'An adventure set in the French Revolution about a secret English hero who rescues aristocrats from the guillotine; an early template for the hero who hides behind a foppish public mask.',
    kw: ['baroness orczy', 'secret identity', 'french revolution', 'masked hero', 'rescue adventure'], genres: ['swashbuckler', 'historical novel', 'adventure'],
  },
  {
    id: 'work-pop-the-happy-return', kind: 'work', name: 'The Happy Return', aka: ['Beat to Quarters'], author: 'C. S. Forester', year: 1937, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'The first-published Horatio Hornblower novel, a Napoleonic-era sea story about a captain on a lonely mission; it fixed the conventions of the naval series built around one commander.',
    kw: ['forester', 'hornblower', 'napoleonic naval', 'sea novel', 'beat to quarters'], genres: ['naval fiction', 'historical novel', 'adventure'],
  },
  {
    id: 'work-pop-master-and-commander', kind: 'work', name: 'Master and Commander', author: 'Patrick O\'Brian', year: 1969, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'The opening volume of a long Napoleonic naval series built on the friendship of a ship\'s captain and his surgeon; praised for period language, seamanship and sustained characterisation.',
    kw: ['patrick o\'brian', 'aubrey and maturin', 'napoleonic naval', 'series opener', 'period voice'], genres: ['naval fiction', 'historical novel'],
  },
  {
    id: 'work-pop-sharpes-eagle', kind: 'work', name: "Sharpe's Eagle", author: 'Bernard Cornwell', year: 1981, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'The first published Richard Sharpe novel, a Peninsular War adventure about a rifleman who rises from the ranks; a landmark of military historical series fiction.',
    kw: ['bernard cornwell', 'richard sharpe', 'peninsular war', 'military historical', 'series opener'], genres: ['military historical fiction', 'adventure'],
  },
  {
    id: 'work-pop-the-last-kingdom', kind: 'work', name: 'The Last Kingdom', author: 'Bernard Cornwell', year: 2004, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'The first Saxon Stories novel, narrated by a Northumbrian raised by Danes in the England of Alfred the Great; a popular example of historical fiction told through a divided-loyalty narrator.',
    kw: ['bernard cornwell', 'uhtred', 'viking england', 'alfred the great', 'first person historical'], genres: ['historical novel', 'military historical fiction'],
  },
  // ---- Historical fiction: landmarks of the twentieth century ----
  {
    id: 'work-pop-i-claudius', kind: 'work', name: 'I, Claudius', author: 'Robert Graves', year: 1934, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A fictional autobiography of the Roman emperor Claudius, narrated as a memoir of the court of Augustus and his successors; a model of the historical novel written as a first-person chronicle.',
    kw: ['robert graves', 'roman emperor', 'fictional memoir', 'imperial rome', 'court intrigue'], genres: ['historical novel', 'fictional memoir'],
  },
  {
    id: 'work-pop-gone-with-the-wind', kind: 'work', name: 'Gone with the Wind', author: 'Margaret Mitchell', year: 1936, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A saga of the American South before, during and after the Civil War, centred on a plantation heroine; enormously popular, and now widely discussed for its romanticised, one-sided view of slavery and the Confederacy.',
    kw: ['margaret mitchell', 'civil war saga', 'southern novel', 'scarlett o\'hara', 'critical reading'], genres: ['historical novel', 'family saga', 'historical romance'],
  },
  {
    id: 'work-pop-forever-amber', kind: 'work', name: 'Forever Amber', author: 'Kathleen Winsor', year: 1944, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A Restoration-era historical romance following a young woman\'s climb through Charles II\'s London; a huge bestseller of the 1940s, controversial on release for its frankness.',
    kw: ['kathleen winsor', 'restoration london', 'rags to riches', 'historical romance', 'wartime bestseller'], genres: ['historical romance', 'historical novel'],
  },
  {
    id: 'work-pop-katherine', kind: 'work', name: 'Katherine', author: 'Anya Seton', year: 1954, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A historical romance based on the life of Katherine Swynford and her long relationship with John of Gaunt in fourteenth-century England; a much-loved model of romance anchored in real history.',
    kw: ['anya seton', 'john of gaunt', 'medieval england', 'biographical historical romance', 'plantagenet'], genres: ['historical romance', 'biographical novel'],
  },
  {
    id: 'work-pop-ross-poldark', kind: 'work', name: 'Ross Poldark', author: 'Winston Graham', year: 1945, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'The first Poldark novel, in which a soldier returns to Cornwall in the late eighteenth century to find his fortunes changed; opener of a long series that blends family drama, romance and regional history.',
    kw: ['winston graham', 'poldark', 'cornwall', 'tin mining', 'historical series'], genres: ['historical novel', 'family saga', 'regional fiction'],
  },
  {
    id: 'work-pop-the-egyptian', kind: 'work', name: 'The Egyptian', aka: ['Sinuhe egyptiläinen'], author: 'Mika Waltari', year: 1945, language: 'Finnish', region: 'Finland', confidence: 'established',
    summary: 'A historical novel narrated by a royal physician in ancient Egypt in the age of the pharaoh Akhenaten; a rare Finnish bestseller worldwide and a model of the ancient-world first-person memoir.',
    kw: ['mika waltari', 'sinuhe', 'ancient egypt', 'akhenaten', 'finnish novel'], genres: ['historical novel', 'ancient-world fiction', 'fictional memoir'],
  },
  {
    id: 'work-pop-hawaii', kind: 'work', name: 'Hawaii', author: 'James A. Michener', year: 1959, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A sweeping novel that traces the islands from geological formation through settlement, missionary arrival and migration to statehood; a leading example of the long, multi-generation historical epic.',
    kw: ['michener', 'epic historical novel', 'multi-generational', 'pacific history', 'saga structure'], genres: ['historical novel', 'family saga'],
  },
  {
    id: 'work-pop-exodus', kind: 'work', name: 'Exodus', author: 'Leon Uris', year: 1958, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A historical novel of the founding of Israel that follows Jewish refugees and fighters in the 1940s; a huge international bestseller that blends reportage-style detail with dramatic fiction.',
    kw: ['leon uris', 'israel founding', 'bestselling historical', 'post-war europe', 'documentary style fiction'], genres: ['historical novel', 'political fiction'],
  },
  {
    id: 'work-pop-shogun', kind: 'work', name: 'Shōgun', author: 'James Clavell', year: 1975, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A long novel of an English pilot shipwrecked in feudal Japan; a bestseller that introduced many English-language readers to the culture and politics of the period, told with a stranger\'s eyes.',
    kw: ['james clavell', 'feudal japan', 'outsider protagonist', 'samurai era', 'asian saga'], genres: ['historical novel', 'adventure', 'family saga'],
  },
  {
    id: 'work-pop-the-far-pavilions', kind: 'work', name: 'The Far Pavilions', author: 'M. M. Kaye', year: 1978, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A long romantic adventure set in nineteenth-century British India and the north-west frontier, following a British-born man raised as an Indian; a lush example of the imperial-era epic.',
    kw: ['m m kaye', 'british india', 'north-west frontier', 'romantic epic', 'raj fiction'], genres: ['historical romance', 'adventure', 'historical novel'],
  },
  {
    id: 'work-pop-the-pillars-of-the-earth', kind: 'work', name: 'The Pillars of the Earth', author: 'Ken Follett', year: 1989, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A long novel of twelfth-century England built around the construction of a cathedral and the lives drawn into it; a bestseller that made the medieval epic a mainstream popular form.',
    kw: ['ken follett', 'cathedral building', 'medieval england', 'epic historical', 'twelfth century'], genres: ['historical novel', 'epic'],
  },
  {
    id: 'work-pop-roots', kind: 'work', name: 'Roots: The Saga of an American Family', author: 'Alex Haley', year: 1976, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A fictionalised family history that traces a lineage from an African village through slavery and emancipation in America; a landmark of popular historical writing whose claims of strict fact have been disputed.',
    kw: ['alex haley', 'slavery narrative', 'family history', 'genealogy', 'faction'], genres: ['historical novel', 'family saga', 'fictionalised family history'],
  },
  {
    id: 'work-pop-cold-mountain', kind: 'work', name: 'Cold Mountain', author: 'Charles Frazier', year: 1997, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A debut novel that follows a wounded Confederate soldier walking home across the South while a woman struggles to keep a farm; an Odyssey-shaped Civil War story with a strong sense of place.',
    kw: ['charles frazier', 'civil war', 'odyssey structure', 'blue ridge', 'dual narrative'], genres: ['historical novel', 'war fiction'],
  },
  {
    id: 'work-pop-the-killer-angels', kind: 'work', name: 'The Killer Angels', author: 'Michael Shaara', year: 1974, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel of the Battle of Gettysburg told through the viewpoints of commanders on both sides; influential for its close, interior approach to a famous battle.',
    kw: ['michael shaara', 'gettysburg', 'civil war battle', 'multiple viewpoints', 'military historical'], genres: ['historical novel', 'war fiction'],
  },
  {
    id: 'work-pop-burr', kind: 'work', name: 'Burr', author: 'Gore Vidal', year: 1973, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel of the early American republic framed by the memoirs of Aaron Burr and the questions of a young journalist; a leading example of historical fiction that revises a reputation.',
    kw: ['gore vidal', 'aaron burr', 'founding fathers', 'revisionist history novel', 'frame narrative'], genres: ['historical novel', 'fictional memoir'],
  },
  // ---- Historical fiction: contemporary landmarks ----
  {
    id: 'work-pop-alias-grace', kind: 'work', name: 'Alias Grace', author: 'Margaret Atwood', year: 1996, language: 'English', region: 'Canada', confidence: 'established',
    summary: 'A novel that reimagines the real case of a convicted servant in nineteenth-century Canada, told through documents, memory and an uncertain narrator; a notable example of historical fiction about unreliable testimony.',
    kw: ['atwood', 'grace marks', 'unreliable narrator', 'nineteenth-century canada', 'true crime fiction'], genres: ['historical novel', 'fictionalised true crime'],
  },
  {
    id: 'work-pop-wolf-hall', kind: 'work', name: 'Wolf Hall', author: 'Hilary Mantel', year: 2009, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A novel of the court of Henry VIII from the close, present-tense viewpoint of Thomas Cromwell; admired for making a familiar period feel immediate and for its distinctive use of the pronoun for its hero.',
    kw: ['hilary mantel', 'thomas cromwell', 'tudor court', 'present tense historical', 'close third person'], genres: ['historical novel', 'Tudor fiction'],
  },
  {
    id: 'work-pop-bring-up-the-bodies', kind: 'work', name: 'Bring Up the Bodies', author: 'Hilary Mantel', year: 2012, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'The second Thomas Cromwell novel, set at the court of Henry VIII during the fall of Anne Boleyn; a notable example of a sequel that tightens the pace and narrows the focus.',
    kw: ['hilary mantel', 'anne boleyn', 'tudor court', 'sequel craft', 'present tense'], genres: ['historical novel', 'Tudor fiction'],
  },
  {
    id: 'work-pop-the-other-boleyn-girl', kind: 'work', name: 'The Other Boleyn Girl', author: 'Philippa Gregory', year: 2001, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A Tudor court novel told by Mary Boleyn, sister of Anne; a bestseller that helped drive a wave of popular, women-centred fiction about royal courts.',
    kw: ['philippa gregory', 'tudor court', 'mary boleyn', 'women-centred history', 'royal intrigue'], genres: ['historical novel', 'historical romance', 'Tudor fiction'],
  },
  {
    id: 'work-pop-girl-with-a-pearl-earring', kind: 'work', name: 'Girl with a Pearl Earring', author: 'Tracy Chevalier', year: 1999, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel that imagines the maid behind a famous Dutch painting in seventeenth-century Delft; a model of fiction built around an artwork and the unrecorded life behind it.',
    kw: ['tracy chevalier', 'vermeer', 'delft', 'art-inspired novel', 'imagined servant'], genres: ['historical novel', 'art-inspired fiction'],
  },
  {
    id: 'work-pop-year-of-wonders', kind: 'work', name: 'Year of Wonders', author: 'Geraldine Brooks', year: 2001, language: 'English', region: 'Australia', confidence: 'established',
    summary: 'A novel set in an English village that quarantines itself during the plague of 1666; a leading example of historical fiction that gives a servant, not a gentleman, the central view.',
    kw: ['geraldine brooks', 'plague village', 'eyam', 'quarantine', 'seventeenth century'], genres: ['historical novel', 'plague fiction'],
  },
  {
    id: 'work-pop-burial-rites', kind: 'work', name: 'Burial Rites', author: 'Hannah Kent', year: 2013, language: 'English', region: 'Australia', confidence: 'established',
    summary: 'A debut novel inspired by a real murder case in nineteenth-century Iceland and the woman condemned for it; notable for its stark landscape and its mix of documents and fiction.',
    kw: ['hannah kent', 'iceland', 'condemned woman', 'based on true events', 'debut novel'], genres: ['historical novel', 'fictionalised true crime'],
  },
  {
    id: 'work-pop-the-red-tent', kind: 'work', name: 'The Red Tent', author: 'Anita Diamant', year: 1997, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel that retells the story of Dinah from the book of Genesis in her own voice, centring the women\'s world around her; a popular example of biblical fiction told from a marginal viewpoint.',
    kw: ['anita diamant', 'dinah', 'biblical retelling', 'women\'s history', 'book club favourite'], genres: ['biblical fiction', 'historical novel', 'retelling'],
  },
  {
    id: 'work-pop-pachinko', kind: 'work', name: 'Pachinko', author: 'Min Jin Lee', year: 2017, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A multi-generational saga of a Korean family in Japan across the twentieth century; widely read for its patient, intimate treatment of discrimination, work and belonging.',
    kw: ['min jin lee', 'zainichi korean', 'family saga', 'multigenerational', 'japan and korea'], genres: ['family saga', 'historical novel'],
  },
  {
    id: 'work-pop-all-the-light-we-cannot-see', kind: 'work', name: 'All the Light We Cannot See', author: 'Anthony Doerr', year: 2014, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A Second World War novel that alternates between a blind French girl and a German boy, told in very short chapters; a bestseller noted for its braided timeline and lyrical, compressed prose.',
    kw: ['anthony doerr', 'wwii novel', 'short chapters', 'braided timelines', 'occupied france'], genres: ['historical novel', 'war fiction'],
  },
  {
    id: 'work-pop-a-gentleman-in-moscow', kind: 'work', name: 'A Gentleman in Moscow', author: 'Amor Towles', year: 2016, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel about an aristocrat sentenced to live inside a Moscow hotel across decades of Soviet history; a popular example of a single confined setting used to hold a large span of time.',
    kw: ['amor towles', 'house arrest', 'moscow hotel', 'confined setting', 'soviet era'], genres: ['historical novel', 'comedy of manners'],
  },
  // ---- Historical mystery and thriller ----
  {
    id: 'work-pop-the-alienist', kind: 'work', name: 'The Alienist', author: 'Caleb Carr', year: 1994, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A historical thriller in which a psychologist, a journalist and a police secretary hunt a serial killer in 1890s New York; an influential model of the period crime novel with early forensic method.',
    kw: ['caleb carr', 'gilded age new york', 'serial killer historical', 'early psychology', 'period thriller'], genres: ['historical thriller', 'crime fiction'],
  },
  {
    id: 'work-pop-dissolution', kind: 'work', name: 'Dissolution', author: 'C. J. Sansom', year: 2003, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'The first Shardlake novel, a mystery set in 1530s England during the dissolution of the monasteries, with a hunchbacked lawyer as investigator; a leading example of the Tudor-era detective story.',
    kw: ['c j sansom', 'shardlake', 'tudor mystery', 'monastery murder', 'historical detective'], genres: ['historical mystery', 'detective fiction'],
  },
  {
    id: 'work-pop-a-morbid-taste-for-bones', kind: 'work', name: 'A Morbid Taste for Bones', author: 'Ellis Peters (Edith Pargeter)', year: 1977, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'The first Brother Cadfael mystery, in which a Benedictine monk and former crusader investigates a death in twelfth-century Shrewsbury; a leading example of the medieval cosy mystery.',
    kw: ['ellis peters', 'brother cadfael', 'medieval mystery', 'monk detective', 'shrewsbury'], genres: ['historical mystery', 'detective fiction'],
  },

  // ---- Westerns ----
  {
    id: 'work-pop-the-log-of-a-cowboy', kind: 'work', name: 'The Log of a Cowboy', author: 'Andy Adams', year: 1903, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A fictionalised account of a cattle drive from Texas to Montana written by a former trail hand; valued for its realistic detail of the daily work of the drive rather than for gunfights.',
    kw: ['andy adams', 'cattle drive', 'trail drive', 'realist western', 'cowboy work'], genres: ['western', 'realist fiction'],
  },
  {
    id: 'work-pop-the-virginian', kind: 'work', name: 'The Virginian: A Horseman of the Plains', author: 'Owen Wister', year: 1902, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A Wyoming novel often called the first great cowboy novel; it fixed the laconic hero, the code of the range and the showdown as lasting conventions of the western.',
    kw: ['owen wister', 'first western novel', 'cowboy hero', 'wyoming', 'western conventions'], genres: ['western'],
  },
  {
    id: 'work-pop-riders-of-the-purple-sage', kind: 'work', name: 'Riders of the Purple Sage', author: 'Zane Grey', year: 1912, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A Utah-set western of a lone gunman, a threatened ranch owner and a powerful religious community; a bestseller that set the pattern for the pulp western and its romantic landscape.',
    kw: ['zane grey', 'utah', 'pulp western', 'gunslinger', 'romantic western landscape'], genres: ['western', 'romance'],
  },
  {
    id: 'work-pop-the-ox-bow-incident', kind: 'work', name: 'The Ox-Bow Incident', author: 'Walter Van Tilburg Clark', year: 1940, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A western about a Nevada posse that hunts suspected cattle thieves and the doubts of a few of its members; a landmark of the western as moral drama about mob justice.',
    kw: ['walter van tilburg clark', 'lynching', 'mob justice', 'posse', 'moral western'], genres: ['western', 'social novel'],
  },
  {
    id: 'work-pop-the-big-sky', kind: 'work', name: 'The Big Sky', author: 'A. B. Guthrie Jr.', year: 1947, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel of a young man who travels up the Missouri with mountain men in the 1830s; a landmark of the fur-trade frontier story and of the western as history rather than formula.',
    kw: ['a b guthrie', 'mountain men', 'fur trade', 'missouri river', 'frontier history'], genres: ['western', 'historical novel'],
  },
  {
    id: 'work-pop-shane', kind: 'work', name: 'Shane', author: 'Jack Schaefer', year: 1949, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A short novel in which a mysterious gunman helps a homesteading family, told by a boy remembering the summer; a model of the lone-gunfighter western and of retrospective child narration.',
    kw: ['jack schaefer', 'gunfighter', 'homesteaders', 'child narrator', 'classic western'], genres: ['western'],
  },
  {
    id: 'work-pop-the-way-west', kind: 'work', name: 'The Way West', author: 'A. B. Guthrie Jr.', year: 1949, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel of a wagon train crossing the Oregon Trail in the 1840s, following a large cast through hardship and dispute; a landmark of the pioneer-trail story.',
    kw: ['a b guthrie', 'oregon trail', 'wagon train', 'pioneers', 'trail novel'], genres: ['western', 'historical novel'],
  },
  {
    id: 'work-pop-hondo', kind: 'work', name: 'Hondo', author: 'Louis L\'Amour', year: 1953, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel of an army scout who meets a woman and her son on a lonely Arizona homestead in Apache country; published as a tie-in with a film and an early title in L\'Amour\'s long western career.',
    kw: ['louis l\'amour', 'army scout', 'apache country', 'novelisation', 'popular western'], genres: ['western'],
  },
  {
    id: 'work-pop-the-searchers', kind: 'work', name: 'The Searchers', author: 'Alan Le May', year: 1954, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel of a man\'s years-long search for a kidnapped niece in Comanche country; the source of a celebrated film and a model of the obsessive-quest western.',
    kw: ['alan le may', 'search for a captive', 'comanche', 'obsessive quest', 'texas'], genres: ['western'],
  },
  {
    id: 'work-pop-warlock', kind: 'work', name: 'Warlock', author: 'Oakley Hall', year: 1958, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel of a frontier town that hires a famous gunman as its protector, told through documents and several voices; an early example of the literary, questioning western.',
    kw: ['oakley hall', 'gunman marshal', 'multiple voices', 'literary western', 'frontier town'], genres: ['western', 'literary fiction'],
  },
  {
    id: 'work-pop-welcome-to-hard-times', kind: 'work', name: 'Welcome to Hard Times', author: 'E. L. Doctorow', year: 1960, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A short, bleak novel of a frontier town destroyed by a violent stranger and the survivors who try to rebuild; an early revisionist western about fear and fragile community.',
    kw: ['doctorow', 'revisionist western', 'frontier town', 'bad man', 'dakota territory'], genres: ['western', 'revisionist fiction'],
  },
  {
    id: 'work-pop-butchers-crossing', kind: 'work', name: "Butcher's Crossing", author: 'John Williams', year: 1960, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel of a buffalo hunt in the 1870s that follows a young Harvard dropout into the plains; a revisionist western about greed and wilderness that found new readers decades later.',
    kw: ['john williams', 'buffalo hunt', 'revisionist western', 'wilderness and greed', 'rediscovered novel'], genres: ['western', 'revisionist fiction'],
  },
  {
    id: 'work-pop-hombre', kind: 'work', name: 'Hombre', author: 'Elmore Leonard', year: 1961, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A western about a stagecoach party and a man raised by Apaches, told by a young witness; an early showcase of Leonard\'s spare style and of the reluctant-hero story.',
    kw: ['elmore leonard', 'stagecoach', 'raised by apaches', 'reluctant hero', 'spare style'], genres: ['western'],
  },
  {
    id: 'work-pop-monte-walsh', kind: 'work', name: 'Monte Walsh', author: 'Jack Schaefer', year: 1963, language: 'English', region: 'United States', confidence: 'established',
    summary: 'An episodic, elegiac novel about a working cowboy and his friends as the open range gives way to fences and wages; a quiet counterpart to the gunfighter western.',
    kw: ['jack schaefer', 'working cowboy', 'end of the open range', 'elegiac western', 'episodic novel'], genres: ['western', 'elegy'],
  },
  {
    id: 'work-pop-little-big-man', kind: 'work', name: 'Little Big Man', author: 'Thomas Berger', year: 1964, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A comic, picaresque novel narrated by a very old man who claims to have been raised among the Cheyenne and to have survived Custer\'s last fight; a revisionist western and an unreliable-narrator classic.',
    kw: ['thomas berger', 'picaresque western', 'unreliable narrator', 'cheyenne', 'little bighorn'], genres: ['western', 'picaresque novel', 'revisionist fiction'],
  },
  {
    id: 'work-pop-true-grit', kind: 'work', name: 'True Grit', author: 'Charles Portis', year: 1968, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel narrated, decades later, by a determined fourteen-year-old who hires a hard-bitten marshal to pursue her father\'s killer; admired for its formal, comic first-person voice.',
    kw: ['charles portis', 'first person voice', 'marshal and girl', 'revenge quest', 'comic western'], genres: ['western', 'first-person novel'],
  },
  {
    id: 'work-pop-the-shootist', kind: 'work', name: 'The Shootist', author: 'Glendon Swarthout', year: 1975, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A short novel about an ageing gunfighter who spends his last weeks in a small town in 1901; an elegy for the closing of the frontier and its legends.',
    kw: ['glendon swarthout', 'ageing gunfighter', 'end of the west', 'elegiac western', 'one last gunfight'], genres: ['western', 'elegy'],
  },
  {
    id: 'work-pop-lonesome-dove', kind: 'work', name: 'Lonesome Dove', author: 'Larry McMurtry', year: 1985, language: 'English', region: 'United States', confidence: 'established',
    summary: 'An epic of two retired Texas Rangers who drive a herd of cattle north to Montana; a landmark that revived the western as a long, character-rich novel with a large ensemble.',
    kw: ['larry mcmurtry', 'cattle drive', 'texas rangers', 'epic western', 'ensemble cast'], genres: ['western', 'epic'],
  },
  {
    id: 'work-pop-blood-meridian', kind: 'work', name: 'Blood Meridian', author: 'Cormac McCarthy', year: 1985, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A violent, ornate novel of a teenage runaway among scalp hunters on the 1850s border between the United States and Mexico; the best-known example of the anti-western, with graphic brutality.',
    kw: ['cormac mccarthy', 'anti-western', 'scalp hunters', 'border violence', 'ornate prose'], genres: ['western', 'anti-western', 'literary fiction'],
  },
  {
    id: 'work-pop-deadwood', kind: 'work', name: 'Deadwood', author: 'Pete Dexter', year: 1986, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A comic and violent novel of the South Dakota gold camp and its real-life residents, among them Wild Bill Hickok and Calamity Jane; a blend of documented history and invention.',
    kw: ['pete dexter', 'gold rush town', 'wild bill hickok', 'calamity jane', 'black hills'], genres: ['western', 'historical novel'],
  },
  {
    id: 'work-pop-the-sisters-brothers', kind: 'work', name: 'The Sisters Brothers', author: 'Patrick deWitt', year: 2011, language: 'English', region: 'Canada', confidence: 'established',
    summary: 'A darkly comic gold-rush western narrated by one of two hired killers on the road to California; a popular example of the picaresque western with a deadpan first-person voice.',
    kw: ['patrick dewitt', 'gold rush', 'hired killers', 'deadpan voice', 'picaresque western'], genres: ['western', 'picaresque novel', 'dark comedy'],
  },
  {
    id: 'work-pop-the-son', kind: 'work', name: 'The Son', author: 'Philipp Meyer', year: 2013, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A multi-generational Texas saga told in three voices across a century, taking in Comanche captivity, ranching and oil wealth; a modern example of the epic western.',
    kw: ['philipp meyer', 'texas saga', 'comanche captivity', 'three narrators', 'oil and ranching'], genres: ['western', 'family saga', 'historical novel'],
  },
  {
    id: 'work-pop-news-of-the-world', kind: 'work', name: 'News of the World', author: 'Paulette Jiles', year: 2016, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A short novel in which an elderly man who reads newspapers aloud to paying audiences escorts a girl, returned from Kiowa captors, across Texas in 1870; a spare and tender road western.',
    kw: ['paulette jiles', 'road western', 'texas 1870', 'unlikely pair', 'short chapters'], genres: ['western', 'historical novel'],
  },
  // ---- Adventure classics ----
  {
    id: 'work-pop-king-solomons-mines', kind: 'work', name: "King Solomon's Mines", author: 'H. Rider Haggard', year: 1885, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A quest novel of an African expedition in search of lost treasure and a missing man; the founding text of the lost-world adventure, now read critically for its colonial attitudes.',
    kw: ['rider haggard', 'allan quatermain', 'lost world adventure', 'treasure quest', 'imperial adventure'], genres: ['adventure', 'lost-world fiction'],
  },
  {
    id: 'work-pop-she', kind: 'work', name: 'She: A History of Adventure', author: 'H. Rider Haggard', year: 1887, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'An adventure of an expedition that finds a hidden African kingdom ruled by a mysterious, long-lived queen; influential on later lost-world stories and on the immortal-ruler figure.',
    kw: ['rider haggard', 'hidden kingdom', 'immortal queen', 'lost world', 'victorian adventure'], genres: ['adventure', 'lost-world fiction', 'romance'],
  },
  {
    id: 'work-pop-kidnapped', kind: 'work', name: 'Kidnapped', author: 'Robert Louis Stevenson', year: 1886, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A historical adventure in which a young Scot is tricked aboard a ship and then crosses the Highlands with a Jacobite fugitive; a model of the road-and-friendship adventure.',
    kw: ['stevenson', 'jacobite', 'highlands', 'buddy adventure', 'scottish historical adventure'], genres: ['adventure', 'historical novel'],
  },
  {
    id: 'work-pop-the-man-who-would-be-king', kind: 'work', name: 'The Man Who Would Be King', author: 'Rudyard Kipling', year: 1888, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A story, told by a journalist narrator, of two adventurers who set out to become kings in a remote mountain land; a model of the frame-narrator adventure and of ambition\'s irony.',
    kw: ['kipling', 'frame narrator', 'imperial adventure', 'two adventurers', 'kafiristan'], genres: ['adventure', 'short story'],
  },
  {
    id: 'work-pop-the-prisoner-of-zenda', kind: 'work', name: 'The Prisoner of Zenda', author: 'Anthony Hope (Anthony Hope Hawkins)', year: 1894, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'An adventure about an English gentleman who closely resembles the king of a small European country; the original of the Ruritanian romance of look-alikes, palace plots and duels.',
    kw: ['anthony hope', 'ruritanian romance', 'look-alike', 'royal impostor', 'swashbuckler'], genres: ['adventure', 'Ruritanian romance'],
  },
  {
    id: 'work-pop-captains-courageous', kind: 'work', name: 'Captains Courageous', author: 'Rudyard Kipling', year: 1897, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A sea story of a pampered rich boy who falls from an ocean liner and is picked up by a Grand Banks fishing schooner; a model of the education-through-hard-work adventure.',
    kw: ['kipling', 'grand banks', 'fishing schooner', 'coming of age at sea', 'sea adventure'], genres: ['adventure', 'sea story', 'coming-of-age novel'],
  },
  {
    id: 'work-pop-the-four-feathers', kind: 'work', name: 'The Four Feathers', author: 'A. E. W. Mason', year: 1902, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'An adventure about a young officer branded a coward by his friends who sets out to redeem himself in the Sudan campaign; a landmark of the honour-and-redemption tale.',
    kw: ['a e w mason', 'cowardice and honour', 'sudan campaign', 'redemption adventure', 'imperial war story'], genres: ['adventure', 'military fiction'],
  },
  {
    id: 'work-pop-the-call-of-the-wild', kind: 'work', name: 'The Call of the Wild', author: 'Jack London', year: 1903, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A short novel of a domestic dog thrust into the harsh work of the Yukon gold rush, told largely from the dog\'s point of view; a classic of the animal adventure.',
    kw: ['jack london', 'klondike', 'sled dog', 'animal viewpoint', 'wilderness survival'], genres: ['adventure', 'animal story'],
  },
  {
    id: 'work-pop-the-sea-wolf', kind: 'work', name: 'The Sea-Wolf', author: 'Jack London', year: 1904, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A sea adventure in which a refined gentleman rescued from drowning falls under the command of a brutal, philosophical sealing captain; a study of power and survival at sea.',
    kw: ['jack london', 'sealing schooner', 'ruthless captain', 'survival of the fittest', 'sea adventure'], genres: ['adventure', 'sea story'],
  },
  {
    id: 'work-pop-white-fang', kind: 'work', name: 'White Fang', author: 'Jack London', year: 1906, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel that follows a wolfdog from the Yukon wild through cruelty and gradual domestication; a companion to The Call of the Wild that runs the same journey in the opposite direction.',
    kw: ['jack london', 'wolfdog', 'yukon', 'animal story', 'nature versus nurture'], genres: ['adventure', 'animal story'],
  },
  {
    id: 'work-pop-prester-john', kind: 'work', name: 'Prester John', author: 'John Buchan', year: 1910, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'An adventure of a young Scot who gets caught up in an African uprising; an early example of Buchan\'s chase-and-quest style and a book now read with attention to its imperial assumptions.',
    kw: ['john buchan', 'african adventure', 'chase and quest', 'imperial adventure', 'young hero'], genres: ['adventure'],
  },
  {
    id: 'work-pop-tarzan-of-the-apes', kind: 'work', name: 'Tarzan of the Apes', author: 'Edgar Rice Burroughs', year: 1912, language: 'English', region: 'United States', confidence: 'established',
    summary: 'The first Tarzan story, serialised in a pulp magazine, about a boy raised by apes in the African jungle who becomes lord of the forest; a founding pulp hero and a long-running series.',
    kw: ['edgar rice burroughs', 'jungle hero', 'raised by apes', 'pulp adventure', 'feral child'], genres: ['adventure', 'pulp fiction'],
  },
  {
    id: 'work-pop-beau-geste', kind: 'work', name: 'Beau Geste', author: 'P. C. Wren', year: 1924, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A French Foreign Legion adventure that opens with a family mystery about a missing jewel and brothers who vanish into the Legion; the book that popularised the desert-fort story.',
    kw: ['p c wren', 'foreign legion', 'desert fort', 'brothers adventure', 'sahara'], genres: ['adventure'],
  },
  {
    id: 'work-pop-mutiny-on-the-bounty', kind: 'work', name: 'Mutiny on the Bounty', author: 'Charles Nordhoff and James Norman Hall', year: 1932, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel based on the 1789 mutiny on HMS Bounty and its aftermath, told by a fictional midshipman; a popular dramatisation of a real naval event that inspired several films.',
    kw: ['nordhoff and hall', 'hms bounty', 'naval mutiny', 'tahiti', 'based on real events'], genres: ['adventure', 'sea story', 'historical novel'],
  },
  {
    id: 'work-pop-the-wreck-of-the-mary-deare', kind: 'work', name: 'The Wreck of the Mary Deare', author: 'Hammond Innes', year: 1956, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A sea adventure and salvage mystery built on a derelict freighter found with one man aboard and an inquiry that follows; a leading example of the British maritime thriller.',
    kw: ['hammond innes', 'salvage', 'derelict ship', 'maritime thriller', 'court inquiry'], genres: ['adventure', 'sea story', 'thriller'],
  },
  {
    id: 'work-pop-the-guns-of-navarone', kind: 'work', name: 'The Guns of Navarone', author: 'Alistair MacLean', year: 1957, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A Second World War adventure about a small team sent to destroy two huge German guns on a Greek island; a model of the mission thriller with a tightly ticking clock.',
    kw: ['alistair maclean', 'wwii mission', 'commando adventure', 'ticking clock', 'greek island'], genres: ['adventure', 'war fiction', 'thriller'],
  },
  {
    id: 'work-pop-when-the-lion-feeds', kind: 'work', name: 'When the Lion Feeds', author: 'Wilbur Smith', year: 1964, language: 'English', region: 'South Africa', confidence: 'established',
    summary: 'The first novel of the Courtney saga, a historical adventure of brothers in nineteenth-century southern Africa; the book that began Smith\'s long run of action-driven family epics.',
    kw: ['wilbur smith', 'courtney family', 'southern africa', 'adventure saga', 'series opener'], genres: ['adventure', 'family saga'],
  },
  {
    id: 'work-pop-the-eagle-has-landed', kind: 'work', name: 'The Eagle Has Landed', author: 'Jack Higgins (Harry Patterson)', year: 1975, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A wartime thriller about a German plot to seize Winston Churchill in rural England, told with close attention to the plotters; a model of the what-if war adventure and of the sympathetic opposition.',
    kw: ['jack higgins', 'wwii thriller', 'plot to kidnap churchill', 'what-if war novel', 'norfolk village'], genres: ['war thriller', 'adventure'],
  },
  {
    id: 'work-pop-the-mediterranean-caper', kind: 'work', name: 'The Mediterranean Caper', author: 'Clive Cussler', year: 1973, language: 'English', region: 'United States', confidence: 'established',
    summary: 'The first Dirk Pitt adventure, an action story of smuggling, sunken ships and a daring hero; the start of a long series of fast, technology-heavy sea and treasure thrillers.',
    kw: ['clive cussler', 'dirk pitt', 'sea adventure', 'treasure hunt', 'series opener'], genres: ['adventure', 'thriller'],
  },

  // ---- Comic novels and satire ----
  {
    id: 'work-pop-three-men-in-a-boat', kind: 'work', name: 'Three Men in a Boat', author: 'Jerome K. Jerome', year: 1889, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A comic account of three friends and a dog on a boating holiday up the Thames; it began as a serious guide and turned into a model of the comic travel narrative built on digression and understatement.',
    kw: ['jerome k jerome', 'thames', 'comic travel', 'digression', 'british humour'], genres: ['comic novel', 'travel comedy'],
  },
  {
    id: 'work-pop-the-diary-of-a-nobody', kind: 'work', name: 'The Diary of a Nobody', author: 'George Grossmith and Weedon Grossmith', year: 1892, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A comic diary of a pompous London clerk and his suburban household, first serialised in a humorous magazine; a classic of the self-regarding narrator who does not see his own absurdity.',
    kw: ['grossmith', 'diary novel', 'suburban comedy', 'pompous narrator', 'victorian humour'], genres: ['comic novel', 'diary novel'],
  },
  {
    id: 'work-pop-zuleika-dobson', kind: 'work', name: 'Zuleika Dobson', author: 'Max Beerbohm', year: 1911, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A fantastical satire of Oxford undergraduate life in which a visiting conjuror\'s granddaughter inspires wild devotion; admired for its ornate, mock-heroic style.',
    kw: ['max beerbohm', 'oxford satire', 'mock-heroic', 'edwardian comedy', 'femme fatale comedy'], genres: ['satire', 'comic novel', 'fantasy of manners'],
  },
  {
    id: 'work-pop-queen-lucia', kind: 'work', name: 'Queen Lucia', author: 'E. F. Benson', year: 1920, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'The first of the Lucia novels, a comedy of social rivalry in an English village with a self-appointed queen of its culture; a model of the gentle comedy of manners driven by small status contests.',
    kw: ['e f benson', 'mapp and lucia', 'village rivalry', 'social comedy', 'status games'], genres: ['comic novel', 'comedy of manners'],
  },
  {
    id: 'work-pop-something-fresh', kind: 'work', name: 'Something Fresh', aka: ['Something New'], author: 'P. G. Wodehouse', year: 1915, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'The first Blandings Castle novel, a comedy of impostors, stolen jewellery and romantic mix-ups at an English country house; the start of Wodehouse\'s mature comic world.',
    kw: ['p g wodehouse', 'blandings castle', 'country house comedy', 'farce plotting', 'impostors'], genres: ['comic novel', 'farce'],
  },
  {
    id: 'work-pop-leave-it-to-psmith', kind: 'work', name: 'Leave It to Psmith', author: 'P. G. Wodehouse', year: 1923, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A Blandings Castle comedy in which the unflappable, monocled Psmith takes on a series of false roles; admired as a showcase of Wodehouse\'s precisely timed farce and comic similes.',
    kw: ['p g wodehouse', 'psmith', 'blandings', 'comic similes', 'mistaken identity'], genres: ['comic novel', 'farce'],
  },
  {
    id: 'work-pop-right-ho-jeeves', kind: 'work', name: 'Right Ho, Jeeves', author: 'P. G. Wodehouse', year: 1934, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A Jeeves and Wooster novel in which Bertie narrates his well-meant, disastrous attempts to manage his friends\' love lives; often cited as a peak of the comic plot built on crossed schemes.',
    kw: ['p g wodehouse', 'jeeves and wooster', 'comic narrator', 'crossed schemes', 'farce structure'], genres: ['comic novel', 'farce'],
  },
  {
    id: 'work-pop-gentlemen-prefer-blondes', kind: 'work', name: 'Gentlemen Prefer Blondes', author: 'Anita Loos', year: 1925, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A comic novel in the form of a diary kept by a sharp-witted, shrewdly naive showgirl in the 1920s; a landmark of satirical voice in which the narrator\'s misspellings and logic do the comic work.',
    kw: ['anita loos', 'diary novel', 'jazz age comedy', 'comic voice', 'satire of wealth'], genres: ['satire', 'diary novel', 'comic novel'],
  },
  {
    id: 'work-pop-elmer-gantry', kind: 'work', name: 'Elmer Gantry', author: 'Sinclair Lewis', year: 1927, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A satire of American revivalist religion that follows a charming, self-serving preacher through the churches and tents of the Midwest; controversial on publication for its attack on religious hypocrisy.',
    kw: ['sinclair lewis', 'revivalist preacher', 'religious satire', 'hypocrisy', 'midwest'], genres: ['satire', 'social novel'],
  },
  {
    id: 'work-pop-decline-and-fall', kind: 'work', name: 'Decline and Fall', author: 'Evelyn Waugh', year: 1928, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A debut satire in which a mild young man, expelled from Oxford, drifts through a series of absurd jobs and society circles; a model of deadpan comedy about an innocent in a crooked world.',
    kw: ['evelyn waugh', 'deadpan satire', 'innocent hero', 'interwar britain', 'debut novel'], genres: ['satire', 'comic novel'],
  },
  {
    id: 'work-pop-vile-bodies', kind: 'work', name: 'Vile Bodies', author: 'Evelyn Waugh', year: 1930, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A satire of the fast-living London party set of the late 1920s, told in brisk, dialogue-heavy scenes with abrupt shifts of tone; a landmark of the Bright Young Things novel.',
    kw: ['evelyn waugh', 'bright young things', 'london party set', 'dialogue-driven satire', 'interwar comedy'], genres: ['satire', 'comic novel'],
  },
  {
    id: 'work-pop-1066-and-all-that', kind: 'work', name: '1066 and All That', author: 'W. C. Sellar and R. J. Yeatman', year: 1930, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A comic spoof of English school history that recasts the national story as a run of memorable events and good or bad kings; a classic of parody that mimics the textbook form.',
    kw: ['sellar and yeatman', 'history parody', 'textbook spoof', 'comic history', 'english history'], genres: ['parody', 'comic history'],
  },
  {
    id: 'work-pop-diary-of-a-provincial-lady', kind: 'work', name: 'Diary of a Provincial Lady', author: 'E. M. Delafield', year: 1930, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A comic diary of a middle-class Englishwoman\'s domestic round, household budgets and social obligations, told with wry self-mockery; a model of the diary form for gentle domestic humour.',
    kw: ['e m delafield', 'diary form', 'domestic comedy', 'wry self-mockery', 'interwar england'], genres: ['comic novel', 'diary novel'],
  },
  {
    id: 'work-pop-cold-comfort-farm', kind: 'work', name: 'Cold Comfort Farm', author: 'Stella Gibbons', year: 1932, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A comic novel in which a practical young Londoner sets out to tidy the lives of her gloomy rural relatives; a celebrated parody of the earthy, fate-ridden rural melodrama.',
    kw: ['stella gibbons', 'rural parody', 'melodrama spoof', 'flora poste', 'interwar comedy'], genres: ['parody', 'comic novel'],
  },
  {
    id: 'work-pop-scoop', kind: 'work', name: 'Scoop', author: 'Evelyn Waugh', year: 1938, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A satire of Fleet Street in which a nature columnist is mistakenly sent to cover a war in a distant country; a classic send-up of newspaper ambition and foreign reporting.',
    kw: ['evelyn waugh', 'fleet street', 'newspaper satire', 'mistaken identity', 'war correspondent comedy'], genres: ['satire', 'comic novel'],
  },
  {
    id: 'work-pop-miss-pettigrew-lives-for-a-day', kind: 'work', name: 'Miss Pettigrew Lives for a Day', author: 'Winifred Watson', year: 1938, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A light comic novel in which a middle-aged governess, sent to the wrong address, spends one eventful day in a glamorous nightclub singer\'s world; a charming model of the single-day structure.',
    kw: ['winifred watson', 'single day story', 'governess', 'london comedy', 'wrong address'], genres: ['comic novel', 'comedy of manners'],
  },
  {
    id: 'work-pop-the-pursuit-of-love', kind: 'work', name: 'The Pursuit of Love', author: 'Nancy Mitford', year: 1945, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A comic and bittersweet novel narrated by a cousin of an eccentric aristocratic family, following a daughter\'s romantic quests; a model of upper-class comedy with a fond, observing narrator.',
    kw: ['nancy mitford', 'aristocratic family', 'observer narrator', 'comedy of manners', 'interwar england'], genres: ['comic novel', 'comedy of manners'],
  },
  {
    id: 'work-pop-the-loved-one', kind: 'work', name: 'The Loved One', author: 'Evelyn Waugh', year: 1948, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A short, sharp satire of Los Angeles funeral culture and its English expatriate community; a compact example of black comedy and cross-cultural satire.',
    kw: ['evelyn waugh', 'black comedy', 'funeral industry satire', 'hollywood expatriates', 'short satire'], genres: ['satire', 'black comedy'],
  },
  {
    id: 'work-pop-lucky-jim', kind: 'work', name: 'Lucky Jim', author: 'Kingsley Amis', year: 1954, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A campus comedy about a junior history lecturer at a provincial English university and his battles with pretension; a landmark of mid-century British comic writing, famed for its physical comedy.',
    kw: ['kingsley amis', 'campus novel', 'academic satire', 'angry young men', 'physical comedy'], genres: ['campus novel', 'comic novel', 'satire'],
  },
  {
    id: 'work-pop-the-ginger-man', kind: 'work', name: 'The Ginger Man', author: 'J. P. Donleavy', year: 1955, language: 'English', region: 'Ireland', confidence: 'established',
    summary: 'A bawdy, rule-breaking comic novel of a feckless American student and his chaotic life in postwar Dublin; notable for its shifting person and tense and for its early run-ins with censors.',
    kw: ['j p donleavy', 'dublin', 'picaresque rogue', 'postwar comedy', 'banned book'], genres: ['picaresque novel', 'comic novel'],
  },
  {
    id: 'work-pop-auntie-mame', kind: 'work', name: 'Auntie Mame', author: 'Patrick Dennis (Edward Everett Tanner III)', year: 1955, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A comic novel in which an orphaned boy is sent to live with his flamboyant, unconventional aunt in New York; a model of the larger-than-life relative seen through a child\'s eyes.',
    kw: ['patrick dennis', 'eccentric aunt', 'new york comedy', 'child narrator', 'bohemian life'], genres: ['comic novel', 'picaresque novel'],
  },
  {
    id: 'work-pop-catch-22', kind: 'work', name: 'Catch-22', author: 'Joseph Heller', year: 1961, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A satirical novel of an American bombardier in the Second World War and the circular military logic that traps him; it gave English a phrase for a no-win bind and is known for its looping, nonlinear structure.',
    kw: ['joseph heller', 'war satire', 'absurd bureaucracy', 'nonlinear structure', 'black comedy'], genres: ['satire', 'war fiction', 'black comedy'],
  },
  {
    id: 'work-pop-flashman', kind: 'work', name: 'Flashman', author: 'George MacDonald Fraser', year: 1969, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A comic historical novel presented as the memoirs of the bully from Tom Brown\'s School Days, now an unabashed Victorian coward and cad; the first of a series that mixes parody with careful research.',
    kw: ['george macdonald fraser', 'flashman papers', 'faux memoir', 'historical parody', 'anti-hero narrator'], genres: ['comic novel', 'historical novel', 'parody'],
  },
  {
    id: 'work-pop-portnoys-complaint', kind: 'work', name: "Portnoy's Complaint", author: 'Philip Roth', year: 1969, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A comic confession delivered as a monologue to a psychoanalyst by a guilt-ridden young man; a landmark of the neurotic comic voice, with frank sexual humour.',
    kw: ['philip roth', 'comic monologue', 'confessional voice', 'jewish american humour', 'guilt and family'], genres: ['comic novel', 'monologue novel'],
  },
  {
    id: 'work-pop-porterhouse-blue', kind: 'work', name: 'Porterhouse Blue', author: 'Tom Sharpe', year: 1974, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A farce about a reforming new head of a very traditional Cambridge college and the staff who resist him; a model of the campus satire driven by escalating comic disasters.',
    kw: ['tom sharpe', 'cambridge college', 'campus satire', 'farce', 'tradition versus reform'], genres: ['satire', 'campus novel', 'farce'],
  },
  {
    id: 'work-pop-wilt', kind: 'work', name: 'Wilt', author: 'Tom Sharpe', year: 1976, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A black farce about a put-upon polytechnic lecturer who finds himself suspected of a serious crime; a model of comic escalation built on misunderstanding and institutional absurdity.',
    kw: ['tom sharpe', 'black farce', 'police interrogation comedy', 'polytechnic', 'escalating misunderstanding'], genres: ['farce', 'satire', 'black comedy'],
  },
  {
    id: 'work-pop-a-confederacy-of-dunces', kind: 'work', name: 'A Confederacy of Dunces', author: 'John Kennedy Toole', year: 1980, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A comic novel of a slothful, pompous New Orleans man and the people tangled in his schemes; published after the author\'s death and now a cult classic of comic character.',
    kw: ['john kennedy toole', 'new orleans', 'comic grotesque', 'posthumous publication', 'pompous protagonist'], genres: ['comic novel', 'picaresque novel'],
  },
  {
    id: 'work-pop-the-secret-diary-of-adrian-mole', kind: 'work', name: 'The Secret Diary of Adrian Mole, Aged 13¾', author: 'Sue Townsend', year: 1982, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A comic diary of a self-important teenage would-be intellectual, whose view of his family and school life leaves the real story to the reader; a model of the gap between narrator and truth.',
    kw: ['sue townsend', 'adrian mole', 'teen diary', 'dramatic irony', 'british comedy'], genres: ['comic novel', 'diary novel'],
  },
  {
    id: 'work-pop-heartburn', kind: 'work', name: 'Heartburn', author: 'Nora Ephron', year: 1983, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A comic novel of a marriage ending, narrated by a cookery writer, with recipes woven into the story; a well-known example of confessional comedy and the voice-driven romantic comedy.',
    kw: ['nora ephron', 'marriage comedy', 'recipes in fiction', 'confessional voice', 'divorce novel'], genres: ['comic novel', 'romantic comedy'],
  },
  {
    id: 'work-pop-the-bonfire-of-the-vanities', kind: 'work', name: 'The Bonfire of the Vanities', author: 'Tom Wolfe', year: 1987, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A satirical novel of 1980s New York in which a bond trader\'s life unravels after a single wrong turn; a landmark of the social-realist, reporter-style big city novel.',
    kw: ['tom wolfe', 'new york satire', 'wall street', 'social realism', 'class and race in the city'], genres: ['satire', 'social novel'],
  },
  {
    id: 'work-pop-thank-you-for-smoking', kind: 'work', name: 'Thank You for Smoking', author: 'Christopher Buckley', year: 1994, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A political and corporate satire narrated by a tobacco industry lobbyist who spins every question; a clear example of a persuasive, self-justifying narrator driving a satirical plot.',
    kw: ['christopher buckley', 'lobbyist', 'washington satire', 'spin', 'persuasive narrator'], genres: ['satire', 'political comedy'],
  },
  {
    id: 'work-pop-straight-man', kind: 'work', name: 'Straight Man', author: 'Richard Russo', year: 1997, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A campus comedy about a middle-aged English department chair coping with budget cuts, rivalry and his own wit during one troubled week; a well-regarded modern academic satire.',
    kw: ['richard russo', 'campus novel', 'department chair', 'academic comedy', 'single week'], genres: ['campus novel', 'comic novel'],
  },
  {
    id: 'work-pop-the-hundred-year-old-man', kind: 'work', name: 'The Hundred-Year-Old Man Who Climbed Out of the Window and Disappeared', author: 'Jonas Jonasson', year: 2009, language: 'Swedish', region: 'Sweden', confidence: 'established',
    summary: 'A comic picaresque in which a centenarian leaves his care home and sets off on an unplanned adventure, with flashbacks through a century of world events; a popular Swedish export in the tradition of the comic wanderer.',
    kw: ['jonas jonasson', 'swedish comic novel', 'picaresque', 'historical flashbacks', 'centenarian hero'], genres: ['comic novel', 'picaresque novel'],
  },
  {
    id: 'work-pop-whered-you-go-bernadette', kind: 'work', name: "Where'd You Go, Bernadette", author: 'Maria Semple', year: 2012, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A comic novel told through emails, memos and a teenage narrator\'s account, as a daughter searches for her eccentric architect mother; a popular example of the documents-in-fiction format.',
    kw: ['maria semple', 'epistolary comedy', 'emails in fiction', 'seattle', 'eccentric mother'], genres: ['comic novel', 'epistolary novel'],
  },

  // ---- War fiction ----
  {
    id: 'work-pop-the-red-badge-of-courage', kind: 'work', name: 'The Red Badge of Courage', author: 'Stephen Crane', year: 1895, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A short novel of a young Union soldier\'s first experience of battle, focused on fear, self-deception and impression; an early model of psychological war fiction written by an author with no combat experience.',
    kw: ['stephen crane', 'american civil war', 'psychological war fiction', 'impressionist prose', 'fear in battle'], genres: ['war fiction', 'historical novel'],
  },
  {
    id: 'work-pop-generals-die-in-bed', kind: 'work', name: 'Generals Die in Bed', author: 'Charles Yale Harrison', year: 1930, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A short, blunt first-person novel of a Canadian infantryman\'s experience of trench warfare in the First World War; part of the wave of unsentimental war books at the end of the 1920s.',
    kw: ['charles yale harrison', 'first world war', 'trench warfare', 'anti-war novel', 'first person soldier'], genres: ['war fiction', 'anti-war novel'],
  },
  {
    id: 'work-pop-a-farewell-to-arms', kind: 'work', name: 'A Farewell to Arms', author: 'Ernest Hemingway', year: 1929, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A love story set on the Italian front in the First World War, narrated by an American ambulance driver in spare, repetitive prose; a landmark of the lost-generation war novel.',
    kw: ['hemingway', 'italian front', 'ambulance driver', 'war and love', 'spare prose'], genres: ['war fiction', 'romance', 'literary fiction'],
  },
  {
    id: 'work-pop-johnny-got-his-gun', kind: 'work', name: 'Johnny Got His Gun', author: 'Dalton Trumbo', year: 1939, language: 'English', region: 'United States', confidence: 'established',
    summary: 'An anti-war novel told entirely from inside the mind of a gravely wounded soldier of the First World War; notable for its stark, claustrophobic viewpoint and its long life as a pacifist text.',
    kw: ['dalton trumbo', 'anti-war novel', 'wounded soldier', 'interior viewpoint', 'pacifist classic'], genres: ['war fiction', 'anti-war novel'],
  },
  {
    id: 'work-pop-for-whom-the-bell-tolls', kind: 'work', name: 'For Whom the Bell Tolls', author: 'Ernest Hemingway', year: 1940, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel of an American explosives expert with a guerrilla band in the Spanish Civil War over roughly three days; a model of tight time compression within a war story.',
    kw: ['hemingway', 'spanish civil war', 'guerrilla band', 'compressed timeframe', 'bridge mission'], genres: ['war fiction', 'literary fiction'],
  },
  {
    id: 'work-pop-the-naked-and-the-dead', kind: 'work', name: 'The Naked and the Dead', author: 'Norman Mailer', year: 1948, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel of a platoon on a Pacific island in the Second World War, with flashbacks into the soldiers\' civilian lives; a leading example of the ensemble war novel with a social conscience.',
    kw: ['norman mailer', 'pacific war', 'platoon novel', 'ensemble cast', 'flashback biographies'], genres: ['war fiction'],
  },
  {
    id: 'work-pop-the-young-lions', kind: 'work', name: 'The Young Lions', author: 'Irwin Shaw', year: 1948, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A Second World War novel that follows two Americans and a German soldier on converging paths; a well-known example of the war novel that gives both sides a human face.',
    kw: ['irwin shaw', 'wwii ensemble', 'converging lives', 'german and american soldiers', 'war epic'], genres: ['war fiction'],
  },
  {
    id: 'work-pop-the-caine-mutiny', kind: 'work', name: 'The Caine Mutiny', author: 'Herman Wouk', year: 1951, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A naval novel set aboard a minesweeper under a captain whose fitness for command is questioned, ending in a court-martial; a classic of the war story that turns into courtroom drama.',
    kw: ['herman wouk', 'minesweeper', 'court martial', 'command and authority', 'naval fiction'], genres: ['war fiction', 'naval fiction'],
  },
  {
    id: 'work-pop-from-here-to-eternity', kind: 'work', name: 'From Here to Eternity', author: 'James Jones', year: 1951, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A long novel of peacetime army life on a Hawaiian base in the months before Pearl Harbor; admired for its unvarnished picture of barracks, rank and loyalty.',
    kw: ['james jones', 'army barracks', 'hawaii 1941', 'peacetime army', 'pearl harbor'], genres: ['war fiction', 'military fiction'],
  },
  {
    id: 'work-pop-the-cruel-sea', kind: 'work', name: 'The Cruel Sea', author: 'Nicholas Monsarrat', year: 1951, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A novel of the Battle of the Atlantic as experienced by the crews of two escort ships, drawn from the author\'s naval service; a classic of British naval fiction.',
    kw: ['nicholas monsarrat', 'battle of the atlantic', 'convoy escort', 'naval fiction', 'wartime duty'], genres: ['war fiction', 'naval fiction'],
  },
  {
    id: 'work-pop-the-bridge-on-the-river-kwai', kind: 'work', name: 'The Bridge on the River Kwai', aka: ['Le Pont de la rivière Kwaï'], author: 'Pierre Boulle', year: 1952, language: 'French', region: 'France', confidence: 'established',
    summary: 'A novel of British prisoners of war ordered to build a railway bridge for their Japanese captors, and the colonel whose pride in the work becomes its own problem; a study of duty and misplaced loyalty.',
    kw: ['pierre boulle', 'prisoner of war camp', 'burma railway', 'duty and pride', 'wwii novel in translation'], genres: ['war fiction'],
  },
  {
    id: 'work-pop-run-silent-run-deep', kind: 'work', name: 'Run Silent, Run Deep', author: 'Edward L. Beach', year: 1955, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A Pacific war submarine novel by a veteran submariner, about a commander with a private grudge; a model of the technical, claustrophobic undersea war story.',
    kw: ['edward l beach', 'submarine novel', 'pacific war', 'undersea warfare', 'obsessive commander'], genres: ['war fiction', 'naval fiction'],
  },
  {
    id: 'work-pop-the-winds-of-war', kind: 'work', name: 'The Winds of War', author: 'Herman Wouk', year: 1971, language: 'English', region: 'United States', confidence: 'established',
    summary: 'The first part of a large historical novel following an American naval officer and his family through the opening of the Second World War; a model of the family saga set against world events.',
    kw: ['herman wouk', 'wwii family saga', 'naval officer', 'epic war novel', 'historical panorama'], genres: ['war fiction', 'historical novel', 'family saga'],
  },
  {
    id: 'work-pop-das-boot', kind: 'work', name: 'Das Boot', author: 'Lothar-Günther Buchheim', year: 1973, language: 'German', region: 'Germany', confidence: 'established',
    summary: 'A novel based on the author\'s time as a war correspondent aboard a German U-boat in 1941; known for its claustrophobic realism and its refusal to glamorise the war at sea.',
    kw: ['buchheim', 'u-boat', 'submarine war', 'claustrophobic realism', 'german war novel'], genres: ['war fiction', 'naval fiction'],
  },
  {
    id: 'work-pop-schindlers-ark', kind: 'work', name: "Schindler's Ark", aka: ["Schindler's List"], author: 'Thomas Keneally', year: 1982, language: 'English', region: 'Australia', confidence: 'established',
    summary: 'A documentary-style novel based on the true story of Oskar Schindler, who protected Jewish workers during the Holocaust; a landmark of the non-fiction novel and of testimony-based fiction.',
    kw: ['thomas keneally', 'oskar schindler', 'holocaust fiction', 'non-fiction novel', 'testimony-based'], genres: ['historical novel', 'war fiction', 'non-fiction novel'],
  },
  {
    id: 'work-pop-empire-of-the-sun', kind: 'work', name: 'Empire of the Sun', author: 'J. G. Ballard', year: 1984, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A novel drawn from the author\'s boyhood in wartime Shanghai and an internment camp, seen through the eyes of a child; a model of war as experienced by a young, adaptable narrator.',
    kw: ['j g ballard', 'shanghai', 'internment camp', 'child viewpoint', 'autobiographical novel'], genres: ['war fiction', 'autobiographical novel'],
  },
  {
    id: 'work-pop-the-things-they-carried', kind: 'work', name: 'The Things They Carried', author: 'Tim O\'Brien', year: 1990, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A linked collection of stories about American soldiers in Vietnam and their memories, which blurs fact and invention on purpose; a key text on truth and storytelling in war writing.',
    kw: ['tim o\'brien', 'vietnam war', 'linked stories', 'story truth', 'metafiction'], genres: ['war fiction', 'short story cycle', 'metafiction'],
  },
  {
    id: 'work-pop-regeneration', kind: 'work', name: 'Regeneration', author: 'Pat Barker', year: 1991, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A novel set in a Scottish military hospital in 1917, where a psychiatrist treats officers broken by the war, among them real figures of the time; the first of a trilogy and a model of history-based war fiction.',
    kw: ['pat barker', 'shell shock', 'craiglockhart', 'first world war trilogy', 'war poets'], genres: ['war fiction', 'historical novel'],
  },
  {
    id: 'work-pop-birdsong', kind: 'work', name: 'Birdsong', author: 'Sebastian Faulks', year: 1993, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A novel of the First World War that moves between pre-war France, the trenches of the Somme and a later-century search for family history; a popular example of the dual-timeline war story.',
    kw: ['sebastian faulks', 'somme', 'dual timeline', 'trench warfare', 'first world war love story'], genres: ['war fiction', 'historical novel', 'romance'],
  },
  {
    id: 'work-pop-captain-corellis-mandolin', kind: 'work', name: "Captain Corelli's Mandolin", author: 'Louis de Bernières', year: 1994, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A novel of love and occupation on a Greek island during the Second World War, mixing comedy, history and tragedy with changing narrators; a bestseller of the 1990s.',
    kw: ['louis de bernieres', 'cephalonia', 'occupation', 'wartime love story', 'shifting narrators'], genres: ['war fiction', 'historical novel', 'romance'],
  },
  {
    id: 'work-pop-matterhorn', kind: 'work', name: 'Matterhorn', author: 'Karl Marlantes', year: 2010, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A long novel of a Marine rifle company in Vietnam, drawn from the author\'s own service; admired for its detail of small-unit life and the pressures of command.',
    kw: ['karl marlantes', 'vietnam war', 'marine company', 'small unit', 'veteran author'], genres: ['war fiction'],
  },
  {
    id: 'work-pop-the-yellow-birds', kind: 'work', name: 'The Yellow Birds', author: 'Kevin Powers', year: 2012, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A short novel of the Iraq War about a young soldier haunted by a promise he could not keep; a leading example of the post-2001 war novel by a veteran, noted for its lyrical, fragmentary prose.',
    kw: ['kevin powers', 'iraq war', 'veteran writer', 'lyrical prose', 'promise and guilt'], genres: ['war fiction'],
  },
  {
    id: 'work-pop-redeployment', kind: 'work', name: 'Redeployment', author: 'Phil Klay', year: 2014, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A collection of stories about American service members in and after the Iraq War, each in a distinct voice; a leading example of the contemporary war story cycle by a veteran.',
    kw: ['phil klay', 'iraq war', 'short story collection', 'veteran voices', 'homecoming'], genres: ['war fiction', 'short story collection'],
  },
  // ---- Sports fiction ----
  {
    id: 'work-pop-the-natural', kind: 'work', name: 'The Natural', author: 'Bernard Malamud', year: 1952, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A baseball novel that blends myth and sport in the career of a gifted but flawed player; a landmark of the sports novel as modern legend.',
    kw: ['bernard malamud', 'baseball novel', 'myth and sport', 'grail quest', 'american legend'], genres: ['sports fiction', 'myth-inspired fiction'],
  },
  {
    id: 'work-pop-bang-the-drum-slowly', kind: 'work', name: 'Bang the Drum Slowly', author: 'Mark Harris', year: 1956, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A baseball novel narrated by a star pitcher about his loyalty to a limited, quietly ailing catcher; admired for its colloquial first-person voice and its restrained feeling.',
    kw: ['mark harris', 'baseball novel', 'first person colloquial voice', 'friendship and loyalty', 'sports fiction'], genres: ['sports fiction', 'first-person novel'],
  },
  {
    id: 'work-pop-the-hustler', kind: 'work', name: 'The Hustler', author: 'Walter Tevis', year: 1959, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel of a gifted young pool player who takes on a legend in marathon matches and learns what winning costs; a model of tension built from a game most readers never play.',
    kw: ['walter tevis', 'pool hustler', 'high stakes game', 'obsession and talent', 'sports and gambling'], genres: ['sports fiction'],
  },
  {
    id: 'work-pop-dead-cert', kind: 'work', name: 'Dead Cert', author: 'Dick Francis', year: 1962, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'The first racing thriller by the former jockey Dick Francis, in which a rider investigates the fatal fall of a friend; the start of a long run of crime novels set in the world of horse racing.',
    kw: ['dick francis', 'horse racing thriller', 'jockey detective', 'steeplechase', 'sports crime'], genres: ['sports fiction', 'thriller', 'crime fiction'],
  },
  {
    id: 'work-pop-end-zone', kind: 'work', name: 'End Zone', author: 'Don DeLillo', year: 1972, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel of a small Texas college football team that uses the game\'s jargon to explore language, war and ritual; an early example of the literary novel that treats a sport as a system of meaning.',
    kw: ['don delillo', 'college football', 'language of sport', 'literary sports novel', 'ritual and violence'], genres: ['sports fiction', 'literary fiction'],
  },
  {
    id: 'work-pop-north-dallas-forty', kind: 'work', name: 'North Dallas Forty', author: 'Peter Gent', year: 1973, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel by a former professional footballer about a veteran player facing pain, drugs and club management; a landmark of the insider sports novel that treats a team as a workplace.',
    kw: ['peter gent', 'pro football novel', 'insider view', 'sport as work', 'player and management'], genres: ['sports fiction'],
  },
  {
    id: 'work-pop-the-great-american-novel', kind: 'work', name: 'The Great American Novel', author: 'Philip Roth', year: 1973, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A comic baseball novel about a vanished wartime league and its misfit teams, narrated by an aged sportswriter; a satire that plays with both American myth and the idea of the national novel.',
    kw: ['philip roth', 'baseball satire', 'comic sports novel', 'american myth', 'fictional league'], genres: ['sports fiction', 'satire'],
  },
  {
    id: 'work-pop-shoeless-joe', kind: 'work', name: 'Shoeless Joe', author: 'W. P. Kinsella', year: 1982, language: 'English', region: 'Canada', confidence: 'established',
    summary: 'A baseball fantasy in which an Iowa farmer builds a field in his corn and welcomes the ghosts of old players; the source of a well-known film and a model of whimsical magic realism in sports fiction.',
    kw: ['w p kinsella', 'baseball fantasy', 'iowa cornfield', 'magic realism', 'field of dreams'], genres: ['sports fiction', 'fantasy', 'magic realism'],
  },
  {
    id: 'work-pop-the-sportswriter', kind: 'work', name: 'The Sportswriter', author: 'Richard Ford', year: 1986, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A first-person novel in which a former novelist turned sportswriter reviews his life across a long Easter weekend; the first of the Frank Bascombe books, notable for its voice more than its sports.',
    kw: ['richard ford', 'frank bascombe', 'first person voice', 'suburban novel', 'sportswriter'], genres: ['literary fiction', 'first-person novel'],
  },
  {
    id: 'work-pop-the-brothers-k', kind: 'work', name: 'The Brothers K', author: 'David James Duncan', year: 1992, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A long novel of a Pacific Northwest family, its baseball-obsessed father and four brothers across the Vietnam era; a leading example of sport as the thread through a family epic.',
    kw: ['david james duncan', 'baseball family', 'vietnam era', 'family epic', 'pacific northwest'], genres: ['sports fiction', 'family saga'],
  },
  {
    id: 'work-pop-the-art-of-fielding', kind: 'work', name: 'The Art of Fielding', author: 'Chad Harbach', year: 2011, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A campus novel about a gifted college shortstop and the friends, mentors and rivals whose lives are tied to his game; a well-known modern example of the literary baseball novel.',
    kw: ['chad harbach', 'college baseball', 'shortstop', 'campus novel', 'friendship and ambition'], genres: ['sports fiction', 'campus novel'],
  },

  // ---- Family sagas ----
  {
    id: 'work-pop-the-man-of-property', kind: 'work', name: 'The Man of Property', author: 'John Galsworthy', year: 1906, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'The first Forsyte novel, a study of a wealthy English family and its habit of treating people and things as possessions; the opening of the Forsyte chronicles and a model of the multi-volume family saga.',
    kw: ['john galsworthy', 'forsyte saga', 'victorian family', 'property and marriage', 'series opener'], genres: ['family saga', 'social novel'],
  },
  {
    id: 'work-pop-the-light-years', kind: 'work', name: 'The Light Years', author: 'Elizabeth Jane Howard', year: 1990, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'The first Cazalet Chronicle novel, following a large upper-middle-class English family and its servants in the years before the Second World War; a model of the multi-volume domestic saga.',
    kw: ['elizabeth jane howard', 'cazalet chronicle', 'english family', 'pre-war england', 'series opener'], genres: ['family saga', 'historical novel'],
  },
  {
    id: 'work-pop-rich-man-poor-man', kind: 'work', name: 'Rich Man, Poor Man', author: 'Irwin Shaw', year: 1969, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A family saga that follows two brothers and a sister from the end of the Second World War through the 1960s, one rising and one falling; a bestseller that later became an early television mini-series.',
    kw: ['irwin shaw', 'american family saga', 'sibling rivalry', 'postwar america', 'mini-series source'], genres: ['family saga'],
  },
  {
    id: 'work-pop-noble-house', kind: 'work', name: 'Noble House', author: 'James Clavell', year: 1981, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A long novel of rival trading houses and a financial crisis in 1960s Hong Kong; a leading example of the commercial epic that makes business and place a plot engine.',
    kw: ['james clavell', 'hong kong', 'trading house', 'business epic', 'asian saga'], genres: ['family saga', 'adventure', 'historical novel'],
  },
  {
    id: 'work-pop-the-joy-luck-club', kind: 'work', name: 'The Joy Luck Club', author: 'Amy Tan', year: 1989, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel of linked stories about four Chinese immigrant mothers and their American-born daughters, told in alternating voices; a landmark of Chinese American fiction and of the interwoven-narrators form.',
    kw: ['amy tan', 'mothers and daughters', 'chinese american', 'linked stories', 'multiple narrators'], genres: ['family saga', 'linked-story novel'],
  },
  {
    id: 'work-pop-homegoing', kind: 'work', name: 'Homegoing', author: 'Yaa Gyasi', year: 2016, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A debut novel that follows two half-sisters\' descendants, one line in Ghana and one in America, across about three centuries, with one chapter for each generation; a model of the generational-chain structure.',
    kw: ['yaa gyasi', 'ghana and america', 'generational structure', 'slavery legacy', 'chapter per generation'], genres: ['family saga', 'historical novel'],
  },
  {
    id: 'work-pop-crazy-rich-asians', kind: 'work', name: 'Crazy Rich Asians', author: 'Kevin Kwan', year: 2013, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A comic novel in which a New York academic meets her boyfriend\'s fabulously wealthy family in Singapore; a bestseller that popularised the luxury-satire romance with a large family cast.',
    kw: ['kevin kwan', 'singapore', 'wealth satire', 'meeting the family', 'romantic comedy'], genres: ['romantic comedy', 'satire', 'family saga'],
  },
  {
    id: 'work-pop-the-shell-seekers', kind: 'work', name: 'The Shell Seekers', author: 'Rosamunde Pilcher', year: 1987, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A family novel about an elderly woman, her paintings and her three grown children, moving between present and memory; a large bestseller of the late 1980s in the warm, domestic saga tradition.',
    kw: ['rosamunde pilcher', 'family novel', 'mother and children', 'memory and inheritance', 'cornwall'], genres: ['family saga', 'women\'s fiction'],
  },
  {
    id: 'work-pop-circle-of-friends', kind: 'work', name: 'Circle of Friends', author: 'Maeve Binchy', year: 1990, language: 'English', region: 'Ireland', confidence: 'established',
    summary: 'An Irish novel of friendship, first love and class that moves from a small town to a Dublin university in the 1950s; typical of Binchy\'s warm, ensemble storytelling.',
    kw: ['maeve binchy', 'irish novel', 'friendship', 'dublin university', 'ensemble storytelling'], genres: ['women\'s fiction', 'family saga', 'romance'],
  },
  {
    id: 'work-pop-fried-green-tomatoes', kind: 'work', name: 'Fried Green Tomatoes at the Whistle Stop Cafe', author: 'Fannie Flagg', year: 1987, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel that moves between a modern woman and an elderly storyteller in an Alabama nursing home and the Depression-era cafe at the centre of her tale; known for alternating timelines and newspaper-style interludes.',
    kw: ['fannie flagg', 'alabama', 'dual timeline', 'newspaper columns in fiction', 'southern women\'s fiction'], genres: ['women\'s fiction', 'historical novel', 'frame narrative'],
  },
  {
    id: 'work-pop-kane-and-abel', kind: 'work', name: 'Kane and Abel', author: 'Jeffrey Archer', year: 1979, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A saga of two men born on the same day on different continents, an American banker and a Polish immigrant, whose paths become a lifelong rivalry; a defining popular bestseller of the late 1970s.',
    kw: ['jeffrey archer', 'rivalry saga', 'parallel lives', 'immigrant success', 'business epic'], genres: ['family saga', 'thriller'],
  },
  {
    id: 'work-pop-hollywood-wives', kind: 'work', name: 'Hollywood Wives', author: 'Jackie Collins', year: 1983, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A glossy, soap-style novel of the women and men around the film business in Hollywood; a defining example of the 1980s blockbuster of glamour, scandal and ambition.',
    kw: ['jackie collins', 'hollywood novel', 'glamour and scandal', 'eighties bestseller', 'soap-style fiction'], genres: ['popular fiction', 'saga'],
  },
  {
    id: 'work-pop-watermelon', kind: 'work', name: 'Watermelon', author: 'Marian Keyes', year: 1995, language: 'English', region: 'Ireland', confidence: 'established',
    summary: 'A comic novel of a woman whose husband leaves her on the day she gives birth and who goes home to her large Dublin family; a landmark of Irish women\'s comic fiction.',
    kw: ['marian keyes', 'irish comic fiction', 'chick lit', 'family comedy', 'dublin'], genres: ['comic novel', 'women\'s fiction', 'chick lit'],
  },
  // ---- Popular bestsellers that defined their genres ----
  {
    id: 'work-pop-peyton-place', kind: 'work', name: 'Peyton Place', author: 'Grace Metalious', year: 1956, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel of secrets, class and scandal beneath the respectable surface of a New England town; a huge bestseller and the model for later small-town soap fiction.',
    kw: ['grace metalious', 'small town secrets', 'new england', 'fifties bestseller', 'soap-style fiction'], genres: ['popular fiction', 'soap-opera fiction'],
  },
  {
    id: 'work-pop-valley-of-the-dolls', kind: 'work', name: 'Valley of the Dolls', author: 'Jacqueline Susann', year: 1966, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel of three women\'s rise and fall in show business, built around ambition and pills; a sixties phenomenon and a model of the glossy showbiz saga.',
    kw: ['jacqueline susann', 'show business', 'sixties bestseller', 'rise and fall', 'glossy saga'], genres: ['popular fiction', 'saga'],
  },
  {
    id: 'work-pop-airport', kind: 'work', name: 'Airport', author: 'Arthur Hailey', year: 1968, language: 'English', region: 'Canada', confidence: 'established',
    summary: 'A novel set over a single stormy night at a major airport, built from researched professional detail; a model of the disaster-at-work bestseller that teaches readers an institution as it tells the story.',
    kw: ['arthur hailey', 'airport novel', 'single night structure', 'researched setting', 'disaster fiction'], genres: ['popular fiction', 'disaster fiction'],
  },
  {
    id: 'work-pop-the-help', kind: 'work', name: 'The Help', author: 'Kathryn Stockett', year: 2009, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel of Black maids and a young white woman in 1960s Mississippi, told in alternating first-person voices; a huge bestseller, widely discussed for its choice of voice and perspective.',
    kw: ['kathryn stockett', 'civil rights era', 'mississippi', 'alternating voices', 'book club bestseller'], genres: ['historical novel', 'women\'s fiction'],
  },
  {
    id: 'work-pop-where-the-crawdads-sing', kind: 'work', name: 'Where the Crawdads Sing', author: 'Delia Owens', year: 2018, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel that combines a murder investigation with the coming of age of a girl raised alone in a North Carolina marsh; a bestseller that blends mystery, nature writing and romance.',
    kw: ['delia owens', 'marsh girl', 'north carolina', 'nature and mystery', 'dual timeline'], genres: ['mystery', 'coming-of-age novel', 'romance'],
  },
  {
    id: 'work-pop-the-lovely-bones', kind: 'work', name: 'The Lovely Bones', author: 'Alice Sebold', year: 2002, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel narrated from the afterlife by a murdered teenage girl who watches her family and the investigation; a bestseller known for its unusual narrator and its focus on grief.',
    kw: ['alice sebold', 'narrator from beyond', 'grief', 'family after loss', 'afterlife narrator'], genres: ['literary fiction', 'domestic drama'],
  },
  {
    id: 'work-pop-water-for-elephants', kind: 'work', name: 'Water for Elephants', author: 'Sara Gruen', year: 2006, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel of a young veterinary student who joins a travelling circus during the Depression, told by the same man in old age; a popular example of the framed historical romance.',
    kw: ['sara gruen', 'travelling circus', 'depression era', 'old narrator frame', 'historical romance'], genres: ['historical novel', 'romance', 'frame narrative'],
  },
  {
    id: 'work-pop-big-little-lies', kind: 'work', name: 'Big Little Lies', author: 'Liane Moriarty', year: 2014, language: 'English', region: 'Australia', confidence: 'established',
    summary: 'A domestic suspense novel that begins with a death at a school event and works back through the gossip and secrets of three parents; a model of the comic-suspense hybrid with a mystery frame.',
    kw: ['liane moriarty', 'domestic suspense', 'school parents', 'gossip and secrets', 'frame of witness statements'], genres: ['domestic suspense', 'women\'s fiction', 'mystery'],
  },
  {
    id: 'work-pop-the-seven-husbands-of-evelyn-hugo', kind: 'work', name: 'The Seven Husbands of Evelyn Hugo', author: 'Taylor Jenkins Reid', year: 2017, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel in which an ageing film star tells her life story to a young journalist; popular for its framed-memoir structure, its Hollywood setting and its slow reveal of what the story is for.',
    kw: ['taylor jenkins reid', 'old hollywood', 'framed memoir', 'biographer character', 'booktok favourite'], genres: ['contemporary fiction', 'frame narrative', 'romance'],
  },
  {
    id: 'work-pop-eleanor-oliphant-is-completely-fine', kind: 'work', name: 'Eleanor Oliphant Is Completely Fine', author: 'Gail Honeyman', year: 2017, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A debut novel of an isolated, literal-minded Glasgow office worker whose routines are disturbed by an unexpected friendship; a bestseller about loneliness with a distinctive narrative voice.',
    kw: ['gail honeyman', 'glasgow', 'loneliness', 'distinctive voice', 'unreliable self-knowledge'], genres: ['contemporary fiction', 'first-person novel'],
  },
  {
    id: 'work-pop-the-nightingale', kind: 'work', name: 'The Nightingale', author: 'Kristin Hannah', year: 2015, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A Second World War novel about two sisters in occupied France who respond to the German occupation in different ways; a bestseller of women\'s wartime historical fiction.',
    kw: ['kristin hannah', 'occupied france', 'two sisters', 'resistance', 'women in wartime'], genres: ['historical novel', 'war fiction', 'women\'s fiction'],
  },
  // ---- More crime, mystery and thrillers ----
  {
    id: 'work-pop-the-abc-murders', kind: 'work', name: 'The A.B.C. Murders', author: 'Agatha Christie', year: 1936, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A Poirot novel in which a killer sends the detective letters naming towns in alphabetical order before each crime; a well-known model of the serial-pattern puzzle.',
    kw: ['agatha christie', 'poirot', 'alphabet killer', 'serial pattern', 'golden age puzzle'], genres: ['detective fiction', 'golden age mystery'],
  },
  {
    id: 'work-pop-death-on-the-nile', kind: 'work', name: 'Death on the Nile', author: 'Agatha Christie', year: 1937, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A Poirot mystery aboard a Nile steamer after a wealthy honeymooner is killed; a classic of the closed-circle puzzle with a travel setting and a crowd of motives.',
    kw: ['agatha christie', 'poirot', 'nile steamer', 'closed circle', 'travel mystery'], genres: ['detective fiction', 'golden age mystery', 'closed-circle mystery'],
  },
  {
    id: 'work-pop-the-wheel-spins', kind: 'work', name: 'The Wheel Spins', aka: ['The Lady Vanishes'], author: 'Ethel Lina White', year: 1936, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A thriller in which a young woman on a European train finds that an elderly fellow passenger has vanished and no one believes her; a model of the disbelieved-witness plot, later filmed as The Lady Vanishes.',
    kw: ['ethel lina white', 'the lady vanishes', 'train mystery', 'disbelieved witness', 'vanishing passenger'], genres: ['thriller', 'mystery'],
  },
  {
    id: 'work-pop-a-kiss-before-dying', kind: 'work', name: 'A Kiss Before Dying', author: 'Ira Levin', year: 1953, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A suspense novel told in parts from the viewpoints of a charming young man and the women his ambition touches; an early model of the villain\'s-eye suspense plot with shifting focus.',
    kw: ['ira levin', 'villain viewpoint', 'ambitious killer', 'shifting protagonists', 'fifties suspense'], genres: ['psychological suspense', 'crime fiction'],
  },
  {
    id: 'work-pop-from-russia-with-love', kind: 'work', name: 'From Russia, with Love', author: 'Ian Fleming', year: 1957, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A James Bond novel built around a Soviet plot to lure and discredit the British agent, with its opening chapters spent on the opposing side; often cited for its slow-burn structure and its view of the enemy.',
    kw: ['ian fleming', 'james bond', 'cold war thriller', 'villain viewpoint opening', 'slow burn structure'], genres: ['spy fiction', 'thriller'],
  },
  {
    id: 'work-pop-marathon-man', kind: 'work', name: 'Marathon Man', author: 'William Goldman', year: 1974, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A thriller in which a graduate student and long-distance runner is drawn into a conspiracy tied to his brother\'s secret career; a model of the ordinary person trapped in an extraordinary plot.',
    kw: ['william goldman', 'ordinary man in conspiracy', 'runner', 'seventies thriller', 'nazi fugitive plot'], genres: ['thriller', 'conspiracy thriller'],
  },
  {
    id: 'work-pop-red-dragon', kind: 'work', name: 'Red Dragon', author: 'Thomas Harris', year: 1981, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A thriller in which a gifted FBI profiler is drawn out of retirement to catch a serial killer, and in which Hannibal Lecter first appears; a model of the profiler procedural.',
    kw: ['thomas harris', 'hannibal lecter', 'fbi profiler', 'serial killer thriller', 'profiling'], genres: ['thriller', 'police procedural', 'psychological thriller'],
  },
  {
    id: 'work-pop-postmortem', kind: 'work', name: 'Postmortem', author: 'Patricia Cornwell', year: 1990, language: 'English', region: 'United States', confidence: 'established',
    summary: 'The first Kay Scarpetta novel, in which a Virginia chief medical examiner investigates a series of murders; a landmark of forensic crime fiction and of the pathologist as detective.',
    kw: ['patricia cornwell', 'kay scarpetta', 'medical examiner', 'forensic crime', 'series opener'], genres: ['forensic crime fiction', 'police procedural', 'thriller'],
  },
  {
    id: 'work-pop-killing-floor', kind: 'work', name: 'Killing Floor', author: 'Lee Child (Jim Grant)', year: 1997, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'The first Jack Reacher novel, in which a drifting former military policeman is arrested in a quiet Georgia town; a template for the lone-wanderer thriller and its short, punchy chapters.',
    kw: ['lee child', 'jack reacher', 'lone wanderer', 'series opener', 'small town thriller'], genres: ['thriller', 'action thriller'],
  },
  {
    id: 'work-pop-tell-no-one', kind: 'work', name: 'Tell No One', author: 'Harlan Coben', year: 2001, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A thriller in which a widower receives a message suggesting that his murdered wife may be alive; a model of the high-concept hook that drives a fast, twisting plot.',
    kw: ['harlan coben', 'high-concept hook', 'twisting plot', 'wife presumed dead', 'standalone thriller'], genres: ['thriller', 'mystery'],
  },
  {
    id: 'work-pop-before-i-go-to-sleep', kind: 'work', name: 'Before I Go to Sleep', author: 'S. J. Watson', year: 2011, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A psychological thriller narrated by a woman who loses her memory each night and relies on a journal; a leading modern example of memory loss used as a narrative device.',
    kw: ['s j watson', 'amnesia thriller', 'journal narrator', 'memory loss device', 'psychological thriller'], genres: ['psychological thriller', 'domestic suspense'],
  },
  {
    id: 'work-pop-in-a-dark-dark-wood', kind: 'work', name: 'In a Dark, Dark Wood', author: 'Ruth Ware', year: 2015, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A psychological thriller set during a hen weekend at an isolated glass house in the woods; a popular modern example of the closed-circle suspense with a fragile narrator.',
    kw: ['ruth ware', 'closed circle', 'isolated house', 'hen party thriller', 'unreliable memory'], genres: ['psychological thriller', 'closed-circle mystery'],
  },
  {
    id: 'work-pop-the-dinner', kind: 'work', name: 'The Dinner', aka: ['Het diner'], author: 'Herman Koch', year: 2009, language: 'Dutch', region: 'Netherlands', confidence: 'established',
    summary: 'A novel narrated across the courses of a single restaurant dinner, in which two couples discuss a crime involving their sons; a model of the unreliable-narrator suspense novel in one setting.',
    kw: ['herman koch', 'dutch novel', 'single dinner structure', 'unreliable narrator', 'moral dilemma thriller'], genres: ['psychological thriller', 'unreliable narrator fiction'],
  },
  {
    id: 'work-pop-dont-look-back', kind: 'work', name: "Don't Look Back", aka: ['Se deg ikke tilbake'], author: 'Karin Fossum', year: 1996, language: 'Norwegian', region: 'Norway', confidence: 'established',
    summary: 'An Inspector Sejer novel in which a young girl\'s body is found in a small Norwegian community; a leading example of the quiet, psychology-led strand of Nordic crime fiction.',
    kw: ['karin fossum', 'inspector sejer', 'norwegian crime', 'psychological crime', 'small community'], genres: ['crime fiction', 'nordic crime', 'police procedural'],
  },
  {
    id: 'work-pop-the-hypnotist', kind: 'work', name: 'The Hypnotist', aka: ['Hypnotisören'], author: 'Lars Kepler (Alexander Ahndoril and Alexandra Coelho Ahndoril)', year: 2009, language: 'Swedish', region: 'Sweden', confidence: 'established',
    summary: 'A Swedish crime thriller in which a police inspector asks a former hypnotist for help with a brutal case; a bestselling example of the later Nordic noir wave, written under a shared pen name.',
    kw: ['lars kepler', 'joona linna', 'swedish thriller', 'nordic noir', 'shared pen name'], genres: ['crime fiction', 'nordic crime', 'thriller'],
  },
  {
    id: 'work-pop-the-perfect-murder', kind: 'work', name: 'The Perfect Murder', author: 'H. R. F. Keating', year: 1964, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'The first Inspector Ghote novel, a Bombay police procedural by a British author; a notable early example of the Indian-set mystery written in English.',
    kw: ['h r f keating', 'inspector ghote', 'bombay', 'indian setting', 'police procedural'], genres: ['police procedural', 'detective fiction'],
  },
  {
    id: 'work-pop-points-and-lines', kind: 'work', name: 'Points and Lines', aka: ['Ten to sen'], author: 'Seichō Matsumoto', year: 1958, language: 'Japanese', region: 'Japan', confidence: 'established',
    summary: 'A Japanese mystery built around a seemingly airtight alibi worked out from railway timetables; a landmark of the social school of Japanese detective fiction that turned to realistic motive and setting.',
    kw: ['seicho matsumoto', 'timetable alibi', 'japanese mystery', 'social school detective', 'railway puzzle'], genres: ['detective fiction', 'japanese mystery', 'alibi puzzle'],
  },
  {
    id: 'work-pop-the-plotters', kind: 'work', name: 'The Plotters', aka: ['Seolgyejadeul'], author: 'Kim Un-su', year: 2010, language: 'Korean', region: 'South Korea', confidence: 'established',
    summary: 'A Korean thriller of a young assassin in a world where killings are commissioned and designed by shadowy planners; an example of the Korean noir novel and of ironic, institutional crime fiction.',
    kw: ['kim un-su', 'korean noir', 'assassin novel', 'plotters and killers', 'translated thriller'], genres: ['crime fiction', 'noir', 'thriller'],
  },
  {
    id: 'work-pop-my-sister-the-serial-killer', kind: 'work', name: 'My Sister, the Serial Killer', author: 'Oyinkan Braithwaite', year: 2018, language: 'English', region: 'Nigeria', confidence: 'established',
    summary: 'A short, darkly comic crime novel from Lagos about a nurse who keeps cleaning up after her sister\'s crimes; notable for its brevity, its very short chapters and its sharp, ironic voice.',
    kw: ['oyinkan braithwaite', 'lagos', 'dark comedy crime', 'very short chapters', 'nigerian crime fiction'], genres: ['crime fiction', 'black comedy'],
  },
];
