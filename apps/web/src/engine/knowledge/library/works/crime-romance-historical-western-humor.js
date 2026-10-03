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
    id: 'work-pop-arsene-lupin-gentleman-burglar', kind: 'work', name: 'Arsène Lupin, Gentleman-Burglar', author: 'Maurice Leblanc', year: 1907, language: 'French', region: 'France', confidence: 'established',
    summary: 'A story collection introducing a charming thief and master of disguise as its hero, which gave crime fiction a lasting gentleman-rogue protagonist and a French counterpart to Sherlock Holmes. In French, Arsène Lupin, gentleman-cambrioleur.',
    kw: ['maurice leblanc', 'arsene lupin', 'gentleman thief', 'rogue hero', 'french crime fiction'], genres: ['crime fiction', 'caper', 'short story collection'],
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

  // MORE
];
