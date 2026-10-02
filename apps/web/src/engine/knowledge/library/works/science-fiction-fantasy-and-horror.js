// Notable works: science fiction, fantasy and horror.
// Reference only: each record names a real work, its author, first-publication year and original language, with one neutral
// sentence on what it is and why it matters. No plot spoilers, no quotations. See ../README.md for the record format.
export const PREFIX = 'work-sff-';
export default [
  // ---- Proto-science fiction, utopias and the scientific romance (to 1900) ----
  {
    id: 'work-sff-somnium', kind: 'work', name: 'Somnium', author: 'Johannes Kepler', year: 1634, language: 'Latin', region: 'Holy Roman Empire',
    genres: ['proto-science fiction', 'dream narrative'], kw: ['kepler', 'moon voyage', 'early science fiction', 'astronomy'], confidence: 'established',
    summary: 'A short Latin dream narrative of a journey to the Moon, written by an astronomer and published after his death, that uses fiction to show how the heavens would look from another world.',
  },
  {
    id: 'work-sff-utopia', kind: 'work', name: 'Utopia', author: 'Thomas More', year: 1516, language: 'Latin', region: 'England',
    genres: ['utopian fiction', 'social satire'], kw: ['more', 'utopia', 'ideal society', 'imaginary island', 'utopian literature'], confidence: 'established',
    summary: 'A Latin account of an imagined island society that gave its name to utopian writing and set a pattern for fiction that tests real institutions by describing a better or stranger one.',
  },
  {
    id: 'work-sff-the-blazing-world', kind: 'work', name: 'The Blazing World', author: 'Margaret Cavendish', year: 1666, language: 'English', region: 'England',
    genres: ['proto-science fiction', 'utopian fiction', 'prose romance'], kw: ['cavendish', 'duchess of newcastle', 'early science fiction', 'other world'], confidence: 'established',
    summary: 'A prose romance in which a woman enters another world through the North Pole and rules it, blending natural philosophy with fantasy; often counted among the earliest works of science fiction.',
  },
  {
    id: 'work-sff-gullivers-travels', kind: 'work', name: "Gulliver's Travels", author: 'Jonathan Swift', year: 1726, language: 'English', region: 'Ireland and England',
    genres: ['satire', 'imaginary voyage', 'proto-science fiction'], kw: ['swift', 'gulliver', 'lilliput', 'satirical travel', 'imaginary voyage'], confidence: 'established',
    summary: 'A satirical travel narrative of four voyages to invented lands, using strange societies to mock politics, science and human pride; a lasting model for satire built on a fantastic premise.',
  },
  {
    id: 'work-sff-micromegas', kind: 'work', name: 'Micromégas', author: 'Voltaire', year: 1752, language: 'French', region: 'France',
    genres: ['philosophical tale', 'proto-science fiction'], kw: ['voltaire', 'micromegas', 'alien visitor', 'philosophical conte', 'giants'], confidence: 'established',
    summary: 'A short philosophical tale in which giant visitors from another star and from Saturn tour Earth, using the outsider\'s view to puncture human self-importance; an early alien-visitor story.',
  },
  {
    id: 'work-sff-frankenstein', kind: 'work', name: 'Frankenstein; or, The Modern Prometheus', author: 'Mary Shelley', year: 1818, language: 'English', region: 'United Kingdom',
    genres: ['gothic fiction', 'proto-science fiction', 'epistolary novel'], kw: ['shelley', 'frankenstein', 'creature', 'creation myth', 'first science fiction novel'], confidence: 'established',
    summary: 'A novel of a scientist who builds a living being and cannot face the result, told through nested letters and accounts; often described as the first science fiction novel and a cornerstone of gothic fiction.',
  },
  {
    id: 'work-sff-the-last-man', kind: 'work', name: 'The Last Man', author: 'Mary Shelley', year: 1826, language: 'English', region: 'United Kingdom',
    genres: ['apocalyptic fiction', 'romantic novel', 'proto-science fiction'], kw: ['shelley', 'plague', 'end of the world', 'apocalypse', 'post-apocalyptic'], confidence: 'established',
    summary: 'A novel set in the late twenty-first century in which a plague gradually ends the human race; an early landmark of apocalyptic fiction and of the story told by the last survivor.',
  },
  {
    id: 'work-sff-journey-to-the-center-of-the-earth', kind: 'work', name: 'Journey to the Center of the Earth', author: 'Jules Verne', year: 1864, language: 'French', region: 'France',
    genres: ['scientific romance', 'adventure novel', 'lost world'], kw: ['verne', 'subterranean', 'underground world', 'voyages extraordinaires', 'volcano'], confidence: 'established',
    summary: 'An adventure in which a professor, his nephew and a guide descend through an Icelandic volcano into a hidden underground world; a founding example of the scientific adventure novel.',
  },
  {
    id: 'work-sff-erewhon', kind: 'work', name: 'Erewhon', author: 'Samuel Butler', year: 1872, language: 'English', region: 'United Kingdom',
    genres: ['utopian fiction', 'satire', 'proto-science fiction'], kw: ['butler', 'erewhon', 'machines evolve', 'satirical utopia', 'victorian satire'], confidence: 'established',
    summary: 'A satirical novel about a hidden country that has rejected machines and treats illness as a crime; it raises early questions about machine evolution and the logic of social convention.',
  },
  {
    id: 'work-sff-flatland', kind: 'work', name: 'Flatland: A Romance of Many Dimensions', author: 'Edwin A. Abbott', year: 1884, language: 'English', region: 'United Kingdom',
    genres: ['mathematical fiction', 'satire', 'speculative fiction'], kw: ['abbott', 'flatland', 'dimensions', 'geometry', 'victorian satire'], confidence: 'established',
    summary: 'A satire narrated by a two-dimensional being who encounters other dimensions; a classic of mathematical imagination that also mocks social rank and rigid habits of thought.',
  },
  {
    id: 'work-sff-looking-backward', kind: 'work', name: 'Looking Backward: 2000-1887', author: 'Edward Bellamy', year: 1888, language: 'English', region: 'United States',
    genres: ['utopian fiction', 'time-slip novel'], kw: ['bellamy', 'utopia', 'sleeper wakes', 'nationalism', 'future society'], confidence: 'established',
    summary: 'A novel in which a man from 1887 wakes in the year 2000 to find a reorganised, cooperative society; one of the most widely read and influential utopian novels of its century.',
  },
  {
    id: 'work-sff-news-from-nowhere', kind: 'work', name: 'News from Nowhere', author: 'William Morris', year: 1890, language: 'English', region: 'United Kingdom',
    genres: ['utopian fiction', 'dream vision'], kw: ['morris', 'utopian romance', 'arts and crafts', 'future england', 'socialist utopia'], confidence: 'established',
    summary: 'A utopian romance in which a sleeper wakes in a future England of common ownership and handcraft, written partly as a reply to the centralised future imagined in Bellamy\'s Looking Backward.',
  },
  {
    id: 'work-sff-the-time-machine', kind: 'work', name: 'The Time Machine', author: 'H. G. Wells', year: 1895, language: 'English', region: 'United Kingdom',
    genres: ['scientific romance', 'science fiction', 'time travel'], kw: ['wells', 'time travel', 'eloi', 'morlocks', 'far future', 'class'], confidence: 'established',
    summary: 'A short novel in which an inventor travels to the far future and finds a divided humanity; it fixed the time machine as a device and used distant time to comment on class and complacency.',
  },
  {
    id: 'work-sff-the-island-of-doctor-moreau', kind: 'work', name: 'The Island of Doctor Moreau', author: 'H. G. Wells', year: 1896, language: 'English', region: 'United Kingdom',
    genres: ['scientific romance', 'science fiction', 'horror'], kw: ['wells', 'moreau', 'vivisection', 'island', 'mad scientist', 'ethics of science'], confidence: 'established',
    summary: 'A scientific romance about a castaway who finds an isolated island where a scientist has been remaking animals; it joins horror to questions about cruelty, ethics and what separates human from beast.',
  },
  {
    id: 'work-sff-the-invisible-man', kind: 'work', name: 'The Invisible Man', author: 'H. G. Wells', year: 1897, language: 'English', region: 'United Kingdom',
    genres: ['scientific romance', 'science fiction'], kw: ['wells', 'invisibility', 'mad scientist', 'village setting', 'scientific romance'], confidence: 'established',
    summary: 'A novel of a scientist who makes himself invisible and cannot undo it, set in an ordinary English village; it treats the power of unseen action as a moral and social problem.',
  },
  {
    id: 'work-sff-the-war-of-the-worlds', kind: 'work', name: 'The War of the Worlds', author: 'H. G. Wells', year: 1898, language: 'English', region: 'United Kingdom',
    genres: ['scientific romance', 'science fiction', 'invasion narrative'], kw: ['wells', 'martians', 'alien invasion', 'first contact', 'invasion literature'], confidence: 'established',
    summary: 'A novel of Martian machines invading Victorian England, told by a first-person witness; it shaped later alien-invasion stories and turned the era\'s fear of invasion upon the empire itself.',
  },
  // ---- Early twentieth century: scientific romance, utopia, adventure, the first magazines ----
  {
    id: 'work-sff-the-first-men-in-the-moon', kind: 'work', name: 'The First Men in the Moon', author: 'H. G. Wells', year: 1901, language: 'English', region: 'United Kingdom',
    genres: ['scientific romance', 'science fiction', 'moon voyage'], kw: ['wells', 'moon', 'selenites', 'cavorite', 'scientific romance'], confidence: 'established',
    summary: 'An adventure of two men who travel to the Moon in an anti-gravity sphere and meet its insect-like inhabitants, combining scientific romance with satire of human society and its ambitions.',
  },
  {
    id: 'work-sff-sultanas-dream', kind: 'work', name: "Sultana's Dream", author: 'Rokeya Sakhawat Hossain', year: 1905, language: 'English', region: 'India (Bengal)',
    genres: ['feminist utopia', 'science fiction', 'short story'], kw: ['rokeya', 'hossain', 'feminist science fiction', 'bengali', 'utopia', 'south asian science fiction'], confidence: 'established',
    summary: 'A short feminist utopia, written in English by a Bengali Muslim writer, set in a land where women run public life and men are secluded; an early South Asian work of science fiction.',
  },
  {
    id: 'work-sff-the-machine-stops', kind: 'work', name: 'The Machine Stops', author: 'E. M. Forster', year: 1909, language: 'English', region: 'United Kingdom',
    genres: ['dystopian fiction', 'science fiction', 'novella'], kw: ['forster', 'machine', 'isolation', 'technology dependence', 'early dystopia'], confidence: 'established',
    summary: 'A novella of a future in which people live in separate cells served by a global machine; it anticipates later concerns about mediated communication, dependence and the loss of direct experience.',
  },
  {
    id: 'work-sff-ralph-124c-41', kind: 'work', name: 'Ralph 124C 41+', author: 'Hugo Gernsback', year: 1911, language: 'English', region: 'United States',
    genres: ['science fiction', 'gadget fiction', 'serial novel'], kw: ['gernsback', 'future inventions', 'early american science fiction', 'modern electrics'], confidence: 'established',
    summary: 'A novel of the year 2660 packed with imagined inventions, first serialised in a magazine; an early example of gadget-driven future fiction by the founding editor of Amazing Stories.',
  },
  {
    id: 'work-sff-a-princess-of-mars', kind: 'work', name: 'A Princess of Mars', author: 'Edgar Rice Burroughs', year: 1912, language: 'English', region: 'United States',
    genres: ['planetary romance', 'science fantasy', 'pulp adventure'], kw: ['burroughs', 'barsoom', 'john carter', 'mars', 'sword and planet'], confidence: 'established',
    summary: 'The first Barsoom adventure, serialised in a pulp magazine, in which an American soldier finds himself on a Mars of dying seas and warring peoples; a model of planetary romance.',
  },
  {
    id: 'work-sff-the-lost-world', kind: 'work', name: 'The Lost World', author: 'Arthur Conan Doyle', year: 1912, language: 'English', region: 'United Kingdom',
    genres: ['lost world adventure', 'scientific romance'], kw: ['conan doyle', 'professor challenger', 'dinosaurs', 'plateau', 'lost world'], confidence: 'established',
    summary: 'An adventure in which an expedition finds a South American plateau where prehistoric creatures survive; a template for later lost-world stories and the first Professor Challenger novel.',
  },
  {
    id: 'work-sff-herland', kind: 'work', name: 'Herland', author: 'Charlotte Perkins Gilman', year: 1915, language: 'English', region: 'United States',
    genres: ['feminist utopia', 'science fiction'], kw: ['gilman', 'all-female society', 'feminist utopia', 'utopian novel', 'the forerunner'], confidence: 'established',
    summary: 'A utopian novel serialised in the author\'s own magazine, in which three men find a hidden country of women with a cooperative way of life; a foundational work of feminist speculative fiction.',
  },
  {
    id: 'work-sff-rur', kind: 'work', name: 'R.U.R. (Rossum\'s Universal Robots)', author: 'Karel Čapek', year: 1920, language: 'Czech', region: 'Czechoslovakia',
    genres: ['science fiction', 'drama', 'dystopian fiction'], kw: ['capek', 'rur', 'robots', 'origin of the word robot', 'artificial workers', 'play'], confidence: 'established',
    summary: 'A play set in a factory that makes artificial workers; it brought the word robot into the world\'s languages and framed machine labour as a question about exploitation and what makes a person.',
  },
  {
    id: 'work-sff-aelita', kind: 'work', name: 'Aelita', author: 'Alexei Tolstoy', year: 1923, language: 'Russian', region: 'Soviet Union',
    genres: ['planetary romance', 'science fiction'], kw: ['tolstoy', 'mars', 'soviet science fiction', 'revolution', 'early russian science fiction'], confidence: 'established',
    summary: 'A Soviet novel of an engineer\'s journey to Mars that mixes adventure, romance and revolutionary politics; an early landmark of Russian science fiction, later adapted as a silent film.',
  },
  {
    id: 'work-sff-we', kind: 'work', name: 'We', author: 'Yevgeny Zamyatin', year: 1924, language: 'Russian', region: 'Soviet Union',
    genres: ['dystopian fiction', 'science fiction'], kw: ['zamyatin', 'one state', 'glass city', 'totalitarian dystopia', 'early dystopia', 'orwell influence'], confidence: 'established',
    summary: 'A dystopian novel narrated as a journal in a glass-walled, mathematically ordered One State, written in 1920-21 and first published in English translation in 1924; a model for later dystopias.',
  },
  {
    id: 'work-sff-metropolis', kind: 'work', name: 'Metropolis', author: 'Thea von Harbou', year: 1925, language: 'German', region: 'Germany',
    genres: ['science fiction', 'dystopian fiction'], kw: ['von harbou', 'fritz lang', 'city of workers', 'class divide', 'weimar science fiction'], confidence: 'established',
    summary: 'A novel, serialised in 1925 alongside the making of Fritz Lang\'s film, of a city whose wealthy rulers live above and whose workers labour below; a key text of Weimar-era science fiction.',
  },
  {
    id: 'work-sff-the-skylark-of-space', kind: 'work', name: 'The Skylark of Space', author: 'E. E. Smith', year: 1928, language: 'English', region: 'United States',
    genres: ['space opera', 'pulp science fiction'], kw: ['doc smith', 'early space opera', 'interstellar travel', 'amazing stories', 'skylark'], confidence: 'established',
    summary: 'An early space opera, serialised in Amazing Stories, in which scientists build a ship able to cross interstellar distances; it helped define the large-scale interstellar adventure.',
  },
  {
    id: 'work-sff-last-and-first-men', kind: 'work', name: 'Last and First Men', author: 'Olaf Stapledon', year: 1930, language: 'English', region: 'United Kingdom',
    genres: ['future history', 'science fiction'], kw: ['stapledon', 'future history', 'deep time', 'evolution of humanity', 'cosmic scale'], confidence: 'established',
    summary: 'A future history of humanity across two billion years, told in the voice of a distant descendant; it set an influential standard for deep-time imagination in science fiction.',
  },
  {
    id: 'work-sff-brave-new-world', kind: 'work', name: 'Brave New World', author: 'Aldous Huxley', year: 1932, language: 'English', region: 'United Kingdom',
    genres: ['dystopian fiction', 'science fiction', 'satire'], kw: ['huxley', 'dystopia', 'world state', 'conditioning', 'soma', 'engineered happiness'], confidence: 'established',
    summary: 'A novel of a future World State in which people are conditioned and kept content through pleasure and drugs; often paired with Orwell\'s novel as a model of dystopia built on comfort rather than fear.',
  },
  {
    id: 'work-sff-war-with-the-newts', kind: 'work', name: 'War with the Newts', author: 'Karel Čapek', year: 1936, language: 'Czech', region: 'Czechoslovakia',
    genres: ['satirical science fiction', 'dystopian fiction'], kw: ['capek', 'newts', 'satire', 'exploited labour', 'nationalism', 'czech science fiction'], confidence: 'established',
    summary: 'A satirical novel in which intelligent amphibians are first exploited as labour and then multiply, using its premise to examine commerce, nationalism and the road to war.',
  },
  {
    id: 'work-sff-star-maker', kind: 'work', name: 'Star Maker', author: 'Olaf Stapledon', year: 1937, language: 'English', region: 'United Kingdom',
    genres: ['cosmic fiction', 'science fiction'], kw: ['stapledon', 'cosmic scale', 'mind travel', 'universe history', 'philosophical science fiction'], confidence: 'established',
    summary: 'A philosophical novel in which a narrator\'s mind travels across the universe and its many forms of life in search of its maker; a landmark of cosmic-scale speculation.',
  },
  {
    id: 'work-sff-out-of-the-silent-planet', kind: 'work', name: 'Out of the Silent Planet', author: 'C. S. Lewis', year: 1938, language: 'English', region: 'United Kingdom',
    genres: ['planetary romance', 'science fiction', 'theological fantasy'], kw: ['lewis', 'mars', 'malacandra', 'space trilogy', 'christian science fiction'], confidence: 'established',
    summary: 'The first of the Space Trilogy, in which a philologist is taken to Mars and meets its peoples; it answers the era\'s scientific romances with a moral and spiritual view of the cosmos.',
  },
  {
    id: 'work-sff-who-goes-there', kind: 'work', name: 'Who Goes There?', author: 'John W. Campbell', year: 1938, language: 'English', region: 'United States',
    genres: ['science fiction', 'horror', 'novella'], kw: ['campbell', 'antarctic', 'shapeshifter', 'paranoia', 'astounding', 'thing from another world'], confidence: 'established',
    summary: 'A novella about an Antarctic research team and a shape-changing alien found in the ice; its tight paranoia and isolated setting made it a model for later horror and thriller storytelling.',
  },
  {
    id: 'work-sff-kallocain', kind: 'work', name: 'Kallocain', author: 'Karin Boye', year: 1940, language: 'Swedish', region: 'Sweden',
    genres: ['dystopian fiction', 'science fiction'], kw: ['boye', 'truth drug', 'world state', 'swedish dystopia', 'totalitarianism', 'surveillance'], confidence: 'established',
    summary: 'A dystopian novel about a totalitarian World State in which a truth drug threatens private thought; an early Swedish dystopia that is often read alongside Zamyatin, Huxley and Orwell.',
  },
  {
    id: 'work-sff-the-invention-of-morel', kind: 'work', name: 'The Invention of Morel', author: 'Adolfo Bioy Casares', year: 1940, language: 'Spanish', region: 'Argentina',
    genres: ['fantastic fiction', 'science fiction', 'novella'], kw: ['bioy casares', 'island', 'latin american science fiction', 'borges', 'fantastic literature'], confidence: 'established',
    summary: 'A short novel in which a fugitive on a remote island finds strangers who seem to repeat the same routines; a landmark of Latin American science fiction and the fantastic.',
  },
  {
    id: 'work-sff-nightfall', kind: 'work', name: 'Nightfall', author: 'Isaac Asimov', year: 1941, language: 'English', region: 'United States',
    genres: ['science fiction', 'short story', 'golden age'], kw: ['asimov', 'six suns', 'astounding', 'golden age', 'classic sf short story'], confidence: 'established',
    summary: 'A short story about a world with six suns where darkness comes only rarely; often named among the finest science fiction short stories and a model of the idea-driven tale.',
  },
  // ---- Golden age and mid-century science fiction (1945-1965) ----
  {
    id: 'work-sff-earth-abides', kind: 'work', name: 'Earth Abides', author: 'George R. Stewart', year: 1949, language: 'English', region: 'United States',
    genres: ['post-apocalyptic fiction', 'science fiction'], kw: ['stewart', 'plague', 'survivor', 'rebuilding society', 'post-apocalyptic classic'], confidence: 'established',
    summary: 'A novel about a survivor who watches a small community rebuild after a plague has removed most people; an early post-apocalyptic classic with a patient, long view of change.',
  },
  {
    id: 'work-sff-nineteen-eighty-four', kind: 'work', name: 'Nineteen Eighty-Four', author: 'George Orwell', year: 1949, language: 'English', region: 'United Kingdom',
    genres: ['dystopian fiction', 'political fiction', 'science fiction'], kw: ['orwell', '1984', 'big brother', 'totalitarianism', 'newspeak', 'doublethink', 'surveillance state'], confidence: 'established',
    summary: 'A novel of a surveillance state, enforced doublethink and rewritten history; it supplied much of the vocabulary later used to discuss totalitarianism and the manipulation of language.',
  },
  {
    id: 'work-sff-i-robot', kind: 'work', name: 'I, Robot', author: 'Isaac Asimov', year: 1950, language: 'English', region: 'United States',
    genres: ['science fiction', 'linked short stories', 'robot fiction'], kw: ['asimov', 'three laws of robotics', 'positronic', 'robot stories', 'golden age'], confidence: 'established',
    summary: 'A linked collection of robot stories in which the Three Laws of Robotics generate puzzles and ethical problems; it shaped how fiction imagines machine behaviour and robot ethics.',
  },
  {
    id: 'work-sff-the-martian-chronicles', kind: 'work', name: 'The Martian Chronicles', author: 'Ray Bradbury', year: 1950, language: 'English', region: 'United States',
    genres: ['science fiction', 'linked short stories', 'fix-up'], kw: ['bradbury', 'mars', 'colonisation', 'mosaic novel', 'lyrical science fiction'], confidence: 'established',
    summary: 'A linked set of stories about settlers on Mars, told as a mosaic of episodes; it treats colonisation as a mirror for American life and is known for its lyrical, elegiac prose.',
  },
  {
    id: 'work-sff-the-day-of-the-triffids', kind: 'work', name: 'The Day of the Triffids', author: 'John Wyndham', year: 1951, language: 'English', region: 'United Kingdom',
    genres: ['disaster fiction', 'science fiction', 'post-apocalyptic fiction'], kw: ['wyndham', 'triffids', 'blindness', 'cosy catastrophe', 'british science fiction'], confidence: 'established',
    summary: 'A novel of a society undone when most people lose their sight and aggressive plants spread; often cited as a defining British disaster novel told through one plain-spoken survivor.',
  },
  {
    id: 'work-sff-foundation', kind: 'work', name: 'Foundation', author: 'Isaac Asimov', year: 1951, language: 'English', region: 'United States',
    genres: ['science fiction', 'space opera', 'future history'], kw: ['asimov', 'psychohistory', 'galactic empire', 'foundation series', 'golden age', 'fix-up'], confidence: 'established',
    summary: 'The first book of a series about a mathematician who predicts the fall of a galactic empire and plans to shorten the dark age that follows; a cornerstone of galaxy-scale science fiction.',
  },
  {
    id: 'work-sff-a-sound-of-thunder', kind: 'work', name: 'A Sound of Thunder', author: 'Ray Bradbury', year: 1952, language: 'English', region: 'United States',
    genres: ['science fiction', 'short story', 'time travel'], kw: ['bradbury', 'time travel', 'butterfly effect', 'dinosaur hunt', 'short story'], confidence: 'established',
    summary: 'A short story about a time-travel hunting trip that shows how a tiny change in the past can alter the present; often cited as an early illustration of the butterfly effect.',
  },
  {
    id: 'work-sff-childhoods-end', kind: 'work', name: "Childhood's End", author: 'Arthur C. Clarke', year: 1953, language: 'English', region: 'United Kingdom',
    genres: ['science fiction', 'first contact'], kw: ['clarke', 'overlords', 'first contact', 'utopia', 'transcendence', 'british science fiction'], confidence: 'established',
    summary: 'A novel in which benevolent alien rulers arrive and end war and want at a cost that reshapes humanity; a major first-contact story that moves from politics to metaphysics.',
  },
  {
    id: 'work-sff-fahrenheit-451', kind: 'work', name: 'Fahrenheit 451', author: 'Ray Bradbury', year: 1953, language: 'English', region: 'United States',
    genres: ['dystopian fiction', 'science fiction'], kw: ['bradbury', 'book burning', 'censorship', 'firemen', 'dystopia', 'media saturation'], confidence: 'established',
    summary: 'A novel set in a future where firemen burn books, which treats censorship, shallow entertainment and the fragility of memory; widely taught as a classic of dystopian writing.',
  },
  {
    id: 'work-sff-more-than-human', kind: 'work', name: 'More Than Human', author: 'Theodore Sturgeon', year: 1953, language: 'English', region: 'United States',
    genres: ['science fiction', 'fix-up novel'], kw: ['sturgeon', 'gestalt', 'outsiders', 'telepathy', 'character-driven science fiction'], confidence: 'established',
    summary: 'A novel about several outsiders whose different abilities join into one larger being; a landmark of character-centred science fiction about identity, belonging and what a person is.',
  },
  {
    id: 'work-sff-the-demolished-man', kind: 'work', name: 'The Demolished Man', author: 'Alfred Bester', year: 1953, language: 'English', region: 'United States',
    genres: ['science fiction', 'crime fiction', 'telepathy'], kw: ['bester', 'telepaths', 'murder', 'science fiction mystery', 'typographic experiment'], confidence: 'established',
    summary: 'A novel set in a society of telepaths in which a murder is planned and investigated; a landmark blend of science fiction and crime fiction, with inventive typography.',
  },
  {
    id: 'work-sff-the-space-merchants', kind: 'work', name: 'The Space Merchants', author: 'Frederik Pohl and C. M. Kornbluth', year: 1953, language: 'English', region: 'United States',
    genres: ['satirical science fiction', 'dystopian fiction'], kw: ['pohl', 'kornbluth', 'advertising', 'consumerism', 'corporate dystopia', 'gravy planet'], confidence: 'established',
    summary: 'A satire of a future ruled by advertising agencies and consumer culture; a key early example of corporate dystopia, later cited by many writers of social science fiction.',
  },
  {
    id: 'work-sff-bring-the-jubilee', kind: 'work', name: 'Bring the Jubilee', author: 'Ward Moore', year: 1953, language: 'English', region: 'United States',
    genres: ['alternate history', 'science fiction'], kw: ['moore', 'confederacy won', 'american civil war', 'alternate history classic', 'time travel'], confidence: 'established',
    summary: 'An alternate-history novel set in a United States where the Confederacy won the Civil War, told through a man who tries to change the past; a model of the form.',
  },
  {
    id: 'work-sff-the-nine-billion-names-of-god', kind: 'work', name: 'The Nine Billion Names of God', author: 'Arthur C. Clarke', year: 1953, language: 'English', region: 'United Kingdom',
    genres: ['science fiction', 'short story'], kw: ['clarke', 'monastery', 'computer', 'twist ending', 'short story', 'ritual'], confidence: 'established',
    summary: 'A short story about a monastery that commissions a computer to finish a ritual task, ending with a famously brief last line; a standard example of the twist ending.',
  },
  {
    id: 'work-sff-the-cold-equations', kind: 'work', name: 'The Cold Equations', author: 'Tom Godwin', year: 1954, language: 'English', region: 'United States',
    genres: ['science fiction', 'short story'], kw: ['godwin', 'astounding', 'fuel limits', 'moral dilemma', 'constraint-driven plot'], confidence: 'established',
    summary: 'A short story in which a rescue shuttle\'s fuel limits force a hard choice; widely anthologised and often debated as a model of the constraint-driven plot.',
  },
  {
    id: 'work-sff-mission-of-gravity', kind: 'work', name: 'Mission of Gravity', author: 'Hal Clement', year: 1954, language: 'English', region: 'United States',
    genres: ['hard science fiction', 'science fiction'], kw: ['hal clement', 'high gravity', 'worldbuilding', 'physics puzzle', 'alien planet', 'astounding'], confidence: 'established',
    summary: 'A novel set on a fast-spinning, high-gravity planet whose inhabitants help human explorers; admired as a model of rigorous, physics-based worldbuilding in hard science fiction.',
  },
  {
    id: 'work-sff-i-am-legend', kind: 'work', name: 'I Am Legend', author: 'Richard Matheson', year: 1954, language: 'English', region: 'United States',
    genres: ['science fiction', 'horror', 'post-apocalyptic fiction'], kw: ['matheson', 'vampires', 'last man', 'plague', 'siege story', 'zombie origins'], confidence: 'established',
    summary: 'A novel about the last man in a world of vampire-like infected people, blending horror and science fiction in a siege story that shaped later plague and zombie fiction.',
  },
  {
    id: 'work-sff-the-stars-my-destination', kind: 'work', name: 'The Stars My Destination', author: 'Alfred Bester', year: 1956, language: 'English', region: 'United States',
    genres: ['science fiction', 'revenge tale', 'space adventure'], kw: ['bester', 'tiger tiger', 'teleportation', 'jaunting', 'revenge', 'cyberpunk precursor'], confidence: 'established',
    summary: 'A revenge story set in a future where people can teleport by thought; a vivid, fast-moving adventure later cited by cyberpunk writers, first issued in Britain under a different title.',
  },
  {
    id: 'work-sff-the-last-question', kind: 'work', name: 'The Last Question', author: 'Isaac Asimov', year: 1956, language: 'English', region: 'United States',
    genres: ['science fiction', 'short story'], kw: ['asimov', 'entropy', 'computer', 'deep time', 'big idea story'], confidence: 'established',
    summary: 'A short story that follows one question about reversing the universe\'s decline across vast ages of ever-larger computers; a well-known example of the big-idea story in short form.',
  },
  {
    id: 'work-sff-the-midwich-cuckoos', kind: 'work', name: 'The Midwich Cuckoos', author: 'John Wyndham', year: 1957, language: 'English', region: 'United Kingdom',
    genres: ['science fiction', 'invasion narrative'], kw: ['wyndham', 'village', 'unusual children', 'small town science fiction', 'british science fiction'], confidence: 'established',
    summary: 'A novel in which a quiet English village is mysteriously cut off for a day and then faces the consequences; a model of small-scale, community-level science fiction.',
  },
  {
    id: 'work-sff-on-the-beach', kind: 'work', name: 'On the Beach', author: 'Nevil Shute', year: 1957, language: 'English', region: 'United Kingdom and Australia',
    genres: ['post-apocalyptic fiction', 'nuclear war fiction'], kw: ['shute', 'nuclear war', 'cold war', 'australia', 'end of the world', 'fallout'], confidence: 'established',
    summary: 'A novel about people in southern Australia waiting for radioactive fallout after a nuclear war; a sober, quiet Cold War story about how ordinary people face an unavoidable end.',
  },
  {
    id: 'work-sff-andromeda-nebula', kind: 'work', name: 'Andromeda Nebula', author: 'Ivan Yefremov', year: 1957, language: 'Russian', region: 'Soviet Union',
    genres: ['utopian fiction', 'science fiction', 'space exploration'], kw: ['yefremov', 'efremov', 'soviet science fiction', 'communist utopia', 'great circle', 'andromeda'], confidence: 'established',
    summary: 'A Soviet novel imagining a utopian far future of interstellar contact and shared knowledge; widely regarded as a turning point for postwar Soviet science fiction.',
  },
  {
    id: 'work-sff-starship-troopers', kind: 'work', name: 'Starship Troopers', author: 'Robert A. Heinlein', year: 1959, language: 'English', region: 'United States',
    genres: ['military science fiction', 'science fiction'], kw: ['heinlein', 'mobile infantry', 'citizenship', 'interstellar war', 'military sf'], confidence: 'established',
    summary: 'A novel of military service in a future interstellar war, narrated by a young infantryman; admired and debated for its views on citizenship, duty and the ethics of force.',
  },
  {
    id: 'work-sff-a-canticle-for-leibowitz', kind: 'work', name: 'A Canticle for Leibowitz', author: 'Walter M. Miller Jr.', year: 1959, language: 'English', region: 'United States',
    genres: ['post-apocalyptic fiction', 'science fiction', 'fix-up novel'], kw: ['miller', 'monastery', 'nuclear war', 'cycles of history', 'preserving knowledge', 'catholic science fiction'], confidence: 'established',
    summary: 'A novel of a monastic order that preserves knowledge through centuries after a nuclear war; a landmark of post-apocalyptic fiction that treats history as a cycle.',
  },
  {
    id: 'work-sff-alas-babylon', kind: 'work', name: 'Alas, Babylon', author: 'Pat Frank', year: 1959, language: 'English', region: 'United States',
    genres: ['post-apocalyptic fiction', 'nuclear war fiction'], kw: ['pat frank', 'nuclear exchange', 'florida', 'survival', 'cold war novel', 'community'], confidence: 'established',
    summary: 'A novel about a small Florida town coping with the aftermath of a nuclear exchange, focused on practical survival and community; a Cold War staple of post-apocalyptic fiction.',
  },
  {
    id: 'work-sff-stranger-in-a-strange-land', kind: 'work', name: 'Stranger in a Strange Land', author: 'Robert A. Heinlein', year: 1961, language: 'English', region: 'United States',
    genres: ['science fiction', 'social satire'], kw: ['heinlein', 'martian upbringing', 'grok', 'counterculture', 'religion', 'outsider view'], confidence: 'established',
    summary: 'A novel about a human raised by Martians who returns to Earth and questions its customs and religions; a major title of 1960s counterculture that gave English the word grok.',
  },
  {
    id: 'work-sff-solaris', kind: 'work', name: 'Solaris', author: 'Stanisław Lem', year: 1961, language: 'Polish', region: 'Poland',
    genres: ['philosophical science fiction', 'first contact'], kw: ['lem', 'alien ocean', 'unknowable alien', 'polish science fiction', 'tarkovsky', 'communication limits'], confidence: 'established',
    summary: 'A novel about scientists studying an ocean-covered planet that seems to respond to them; Lem\'s exploration of how limited human understanding is when it meets the truly alien.',
  },
  {
    id: 'work-sff-harrison-bergeron', kind: 'work', name: 'Harrison Bergeron', author: 'Kurt Vonnegut', year: 1961, language: 'English', region: 'United States',
    genres: ['satirical science fiction', 'dystopian fiction', 'short story'], kw: ['vonnegut', 'enforced equality', 'handicapping', 'satire', 'classroom short story'], confidence: 'established',
    summary: 'A very short satirical story set in a future where equality is enforced by handicapping anyone who is gifted; a frequent classroom text on equality and its limits.',
  },
  {
    id: 'work-sff-the-man-in-the-high-castle', kind: 'work', name: 'The Man in the High Castle', author: 'Philip K. Dick', year: 1962, language: 'English', region: 'United States',
    genres: ['alternate history', 'science fiction'], kw: ['dick', 'axis victory', 'i ching', 'alternate world', 'authenticity', 'forgery'], confidence: 'established',
    summary: 'An alternate-history novel set in a United States divided after an Axis victory in World War II; it explores authenticity and fiction inside fiction rather than conventional plot.',
  },
  {
    id: 'work-sff-the-drowned-world', kind: 'work', name: 'The Drowned World', author: 'J. G. Ballard', year: 1962, language: 'English', region: 'United Kingdom',
    genres: ['new wave science fiction', 'climate fiction', 'disaster fiction'], kw: ['ballard', 'flooded london', 'climate change', 'inner space', 'new wave', 'early climate fiction'], confidence: 'established',
    summary: 'A novel of a hot, flooded future Earth in which survivors drift toward the deep past of memory; an early work of climate-changed fiction and a touchstone of the New Wave.',
  },
  {
    id: 'work-sff-a-wrinkle-in-time', kind: 'work', name: 'A Wrinkle in Time', author: 'Madeleine L\'Engle', year: 1962, language: 'English', region: 'United States',
    genres: ['science fantasy', "children's fiction", 'young adult fiction'], kw: ['lengle', 'tesseract', 'time travel', 'cosmic struggle', 'science fantasy', 'middle grade'], confidence: 'established',
    summary: 'A children\'s novel that blends fantasy with science fiction in a journey through space and time to rescue a father, treating conformity and love as forces in a cosmic struggle.',
  },
  {
    id: 'work-sff-planet-of-the-apes', kind: 'work', name: 'Planet of the Apes', author: 'Pierre Boulle', year: 1963, language: 'French', region: 'France',
    genres: ['satirical science fiction', 'planetary romance'], kw: ['boulle', 'la planete des singes', 'apes rule', 'satire', 'french science fiction'], confidence: 'established',
    summary: 'A novel in which astronauts land on a planet where apes rule and humans are mute animals, written as a satire on human assumptions; first published in French as La Planète des singes.',
  },
  {
    id: 'work-sff-hard-to-be-a-god', kind: 'work', name: 'Hard to Be a God', author: 'Arkady and Boris Strugatsky', year: 1964, language: 'Russian', region: 'Soviet Union',
    genres: ['science fiction', 'social science fiction'], kw: ['strugatsky', 'progressor', 'intervention', 'medieval planet', 'soviet science fiction'], confidence: 'established',
    summary: 'A novel about an observer from Earth living in disguise in a medieval-like world that he may not openly help; a landmark of Soviet science fiction on intervention and ethics.',
  },
  {
    id: 'work-sff-dune', kind: 'work', name: 'Dune', author: 'Frank Herbert', year: 1965, language: 'English', region: 'United States',
    genres: ['science fiction', 'space opera', 'planetary romance'], kw: ['herbert', 'arrakis', 'spice', 'ecology', 'galactic politics', 'worldbuilding', 'dune series'], confidence: 'established',
    summary: 'A novel of rival noble houses fighting over a desert planet that supplies the galaxy\'s most valuable substance; admired for its worldbuilding, ecology and politics, and widely imitated.',
  },
  {
    id: 'work-sff-the-cyberiad', kind: 'work', name: 'The Cyberiad', author: 'Stanisław Lem', year: 1965, language: 'Polish', region: 'Poland',
    genres: ['humorous science fiction', 'fable', 'satire'], kw: ['lem', 'robot constructors', 'trurl', 'klapaucius', 'comic fables', 'wordplay'], confidence: 'established',
    summary: 'A cycle of comic fables about two rival robot constructors, mixing mathematics, philosophy and ingenious wordplay; a high point of humorous science fiction.',
  },
  {
    id: 'work-sff-cosmicomics', kind: 'work', name: 'Cosmicomics', author: 'Italo Calvino', year: 1965, language: 'Italian', region: 'Italy',
    genres: ['fabulism', 'science fantasy', 'linked short stories'], kw: ['calvino', 'cosmicomiche', 'early universe', 'playful science', 'italian fabulist'], confidence: 'established',
    summary: 'A story collection in which a narrator recounts events from the early universe as everyday anecdotes; a model of playful, imaginative engagement with scientific ideas.',
  },
  // ---- The New Wave, feminist and social science fiction, the 1970s and 1980s ----
  {
    id: 'work-sff-aniara', kind: 'work', name: 'Aniara', author: 'Harry Martinson', year: 1956, language: 'Swedish', region: 'Sweden',
    genres: ['epic poem', 'science fiction', 'space poetry'], kw: ['martinson', 'spaceship', 'swedish poetry', 'nuclear age', 'cycle of songs', 'space epic'], confidence: 'established',
    summary: 'A Swedish cycle of poems about passengers on a spacecraft adrift after leaving a ruined Earth; a major work of space-themed poetry and a rare epic in verse within science fiction.',
  },
  {
    id: 'work-sff-the-moon-is-a-harsh-mistress', kind: 'work', name: 'The Moon Is a Harsh Mistress', author: 'Robert A. Heinlein', year: 1966, language: 'English', region: 'United States',
    genres: ['science fiction', 'political fiction', 'artificial intelligence'], kw: ['heinlein', 'lunar colony', 'revolution', 'self-aware computer', 'libertarian science fiction', 'narrative voice'], confidence: 'established',
    summary: 'A novel of a lunar penal colony\'s revolt against Earth, aided by a self-aware computer; known for its narrator\'s distinctive invented dialect and its libertarian politics.',
  },
  {
    id: 'work-sff-babel-17', kind: 'work', name: 'Babel-17', author: 'Samuel R. Delany', year: 1966, language: 'English', region: 'United States',
    genres: ['science fiction', 'space opera', 'linguistic science fiction'], kw: ['delany', 'language and thought', 'sapir-whorf', 'poet starship captain', 'new wave'], confidence: 'established',
    summary: 'A novel about a poet and starship captain who tries to decode an enemy language that shapes the minds of those who use it; a key science-fictional treatment of language and thought.',
  },
  {
    id: 'work-sff-flowers-for-algernon', kind: 'work', name: 'Flowers for Algernon', author: 'Daniel Keyes', year: 1966, language: 'English', region: 'United States',
    genres: ['science fiction', 'epistolary novel', 'psychological fiction'], kw: ['keyes', 'progress reports', 'intelligence experiment', 'first person form', 'classroom novel'], confidence: 'established',
    summary: 'A novel, expanded from an earlier short story, told as progress reports by a man whose intelligence is raised by an experiment; the writing itself changes as he does.',
  },
  {
    id: 'work-sff-lord-of-light', kind: 'work', name: 'Lord of Light', author: 'Roger Zelazny', year: 1967, language: 'English', region: 'United States',
    genres: ['science fantasy', 'mythic science fiction'], kw: ['zelazny', 'hindu gods', 'colonists as gods', 'myth and technology', 'new wave'], confidence: 'established',
    summary: 'A novel in which colonists use advanced technology to take on the roles of Hindu gods, with a rebel challenging their rule; a blend of mythic style and science-fictional logic.',
  },
  {
    id: 'work-sff-dangerous-visions', kind: 'work', name: 'Dangerous Visions', author: 'Harlan Ellison (editor)', year: 1967, language: 'English', region: 'United States',
    genres: ['science fiction anthology', 'new wave'], kw: ['ellison', 'anthology', 'original stories', 'new wave', 'taboo breaking', 'speculative short fiction'], confidence: 'established',
    summary: 'An anthology of original stories by many writers, edited to push past the limits of magazine taboos; a landmark of the New Wave and of the original-anthology tradition.',
  },
  {
    id: 'work-sff-2001-a-space-odyssey', kind: 'work', name: '2001: A Space Odyssey', author: 'Arthur C. Clarke', year: 1968, language: 'English', region: 'United Kingdom',
    genres: ['science fiction', 'first contact', 'hard science fiction'], kw: ['clarke', 'monolith', 'hal 9000', 'kubrick', 'evolution', 'space exploration'], confidence: 'established',
    summary: 'A novel developed alongside Stanley Kubrick\'s film, tracing humanity\'s contact with a mysterious monolith from prehistory to the outer planets, with a ship\'s computer at its centre.',
  },
  {
    id: 'work-sff-do-androids-dream-of-electric-sheep', kind: 'work', name: 'Do Androids Dream of Electric Sheep?', author: 'Philip K. Dick', year: 1968, language: 'English', region: 'United States',
    genres: ['science fiction', 'dystopian fiction', 'noir science fiction'], kw: ['dick', 'androids', 'bounty hunter', 'empathy', 'blade runner source', 'what is human'], confidence: 'established',
    summary: 'A novel about a bounty hunter pursuing escaped androids in a ruined future, which probes empathy and what counts as human; the basis for the film Blade Runner.',
  },
  {
    id: 'work-sff-stand-on-zanzibar', kind: 'work', name: 'Stand on Zanzibar', author: 'John Brunner', year: 1968, language: 'English', region: 'United Kingdom',
    genres: ['new wave science fiction', 'dystopian fiction', 'experimental fiction'], kw: ['brunner', 'overpopulation', 'fragmentary structure', 'media collage', 'dos passos technique'], confidence: 'established',
    summary: 'A sprawling novel of an overpopulated 2010, told through fragments, news items and short scenes instead of one plot thread; a landmark of experimental, structurally ambitious science fiction.',
  },
  {
    id: 'work-sff-pavane', kind: 'work', name: 'Pavane', author: 'Keith Roberts', year: 1968, language: 'English', region: 'United Kingdom',
    genres: ['alternate history', 'science fiction', 'linked short stories'], kw: ['roberts', 'catholic church ruled', 'alternate england', 'steam and signals', 'british science fiction'], confidence: 'established',
    summary: 'A linked set of stories in an alternate England dominated by the Catholic Church into the twentieth century; a lyrical landmark of alternate history with a pastoral, melancholy tone.',
  },
  {
    id: 'work-sff-the-left-hand-of-darkness', kind: 'work', name: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin', year: 1969, language: 'English', region: 'United States',
    genres: ['science fiction', 'anthropological science fiction', 'feminist science fiction'], kw: ['le guin', 'gethen', 'ambisexual society', 'gender', 'hainish cycle', 'ekumen'], confidence: 'established',
    summary: 'A novel about an envoy on a wintry planet whose people have no fixed sex; it uses an imagined society to examine gender, loyalty and politics, and won both the Hugo and the Nebula.',
  },
  {
    id: 'work-sff-slaughterhouse-five', kind: 'work', name: 'Slaughterhouse-Five', author: 'Kurt Vonnegut', year: 1969, language: 'English', region: 'United States',
    genres: ['anti-war fiction', 'science fiction', 'metafiction', 'black comedy'], kw: ['vonnegut', 'dresden', 'unstuck in time', 'so it goes', 'tralfamadore', 'war novel'], confidence: 'established',
    summary: 'An anti-war novel about a soldier who experiences his life out of order and the bombing of Dresden; it mixes memoir, science fiction and dark humour in short, plain sentences.',
  },
  {
    id: 'work-sff-ubik', kind: 'work', name: 'Ubik', author: 'Philip K. Dick', year: 1969, language: 'English', region: 'United States',
    genres: ['science fiction', 'metaphysical fiction'], kw: ['dick', 'reality collapse', 'half-life', 'precognition', 'epigraph advertisements'], confidence: 'established',
    summary: 'A novel in which a team of anti-psychic agents faces a creeping collapse of reality, with advertising-style chapter epigraphs; a prime example of Dick\'s reality-questioning style.',
  },
  {
    id: 'work-sff-ringworld', kind: 'work', name: 'Ringworld', author: 'Larry Niven', year: 1970, language: 'English', region: 'United States',
    genres: ['hard science fiction', 'adventure science fiction'], kw: ['niven', 'megastructure', 'artificial world', 'known space', 'puppeteers', 'exploration'], confidence: 'established',
    summary: 'A novel of an expedition to a vast artificial ring around a star, praised for its sense of scale and puzzle-like exploration; a landmark of hard science fiction and megastructure stories.',
  },
  {
    id: 'work-sff-the-science-fiction-hall-of-fame-volume-one', kind: 'work', name: 'The Science Fiction Hall of Fame, Volume One', author: 'Robert Silverberg (editor)', year: 1970, language: 'English', region: 'United States',
    genres: ['science fiction anthology', 'short story collection'], kw: ['silverberg', 'sfwa', 'best sf short stories', 'anthology', 'golden age stories'], confidence: 'established',
    summary: 'An anthology of short stories chosen by members of a professional writers\' organisation as the finest of their era; a standard overview of science fiction\'s short fiction before the mid-1960s.',
  },
  {
    id: 'work-sff-the-lathe-of-heaven', kind: 'work', name: 'The Lathe of Heaven', author: 'Ursula K. Le Guin', year: 1971, language: 'English', region: 'United States',
    genres: ['science fiction', 'philosophical fiction'], kw: ['le guin', 'effective dreams', 'good intentions', 'reality change', 'taoism'], confidence: 'established',
    summary: 'A novel about a man whose dreams change reality and the doctor who tries to use them; it examines good intentions, control and the limits of planned improvement.',
  },
  {
    id: 'work-sff-the-sheep-look-up', kind: 'work', name: 'The Sheep Look Up', author: 'John Brunner', year: 1972, language: 'English', region: 'United Kingdom',
    genres: ['climate fiction', 'dystopian fiction', 'new wave science fiction'], kw: ['brunner', 'pollution', 'ecological collapse', 'environmental fiction', 'early eco fiction'], confidence: 'established',
    summary: 'A novel following many characters through an America choked by pollution and environmental breakdown; an early landmark of ecological dystopia and environmental science fiction.',
  },
  {
    id: 'work-sff-roadside-picnic', kind: 'work', name: 'Roadside Picnic', author: 'Arkady and Boris Strugatsky', year: 1972, language: 'Russian', region: 'Soviet Union',
    genres: ['science fiction', 'first contact', 'philosophical science fiction'], kw: ['strugatsky', 'the zone', 'stalker', 'tarkovsky', 'alien visitation', 'artifacts'], confidence: 'established',
    summary: 'A novel about a region transformed by a brief alien visitation and the scavengers who enter it for objects no one understands; the source for the film Stalker.',
  },
  {
    id: 'work-sff-the-fifth-head-of-cerberus', kind: 'work', name: 'The Fifth Head of Cerberus', author: 'Gene Wolfe', year: 1972, language: 'English', region: 'United States',
    genres: ['science fiction', 'literary science fiction'], kw: ['wolfe', 'three novellas', 'unreliable memory', 'identity', 'colony planets', 'literary sf'], confidence: 'established',
    summary: 'Three linked novellas set on twin colony planets, about memory, identity and what a story chooses to tell or leave out; a standard example of literary, puzzle-like science fiction.',
  },
  {
    id: 'work-sff-rendezvous-with-rama', kind: 'work', name: 'Rendezvous with Rama', author: 'Arthur C. Clarke', year: 1973, language: 'English', region: 'United Kingdom',
    genres: ['hard science fiction', 'first contact'], kw: ['clarke', 'alien starship', 'sense of wonder', 'exploration', 'megastructure', 'mystery object'], confidence: 'established',
    summary: 'A novel about explorers entering a vast, silent alien spacecraft passing through the solar system; a model of hard science fiction driven by wonder and discovery rather than conflict.',
  },
  {
    id: 'work-sff-the-girl-who-was-plugged-in', kind: 'work', name: 'The Girl Who Was Plugged In', author: 'James Tiptree Jr.', year: 1973, language: 'English', region: 'United States',
    genres: ['science fiction', 'cyberpunk precursor', 'novella'], kw: ['tiptree', 'alice sheldon', 'celebrity', 'advertising', 'remote body', 'pseudonym'], confidence: 'established',
    summary: 'A novella about a young woman who operates a remote-controlled public persona in a world run by advertising; a sharp early look at celebrity, media and corporate control.',
  },
  {
    id: 'work-sff-the-ones-who-walk-away-from-omelas', kind: 'work', name: 'The Ones Who Walk Away from Omelas', author: 'Ursula K. Le Guin', year: 1973, language: 'English', region: 'United States',
    genres: ['philosophical fiction', 'short story', 'speculative fiction'], kw: ['le guin', 'utilitarianism', 'moral thought experiment', 'utopia', 'short story'], confidence: 'established',
    summary: 'A very short story that describes a happy city and the cost on which its happiness rests; widely taught as a moral thought experiment about complicity.',
  },
  {
    id: 'work-sff-the-forever-war', kind: 'work', name: 'The Forever War', author: 'Joe Haldeman', year: 1974, language: 'English', region: 'United States',
    genres: ['military science fiction', 'science fiction'], kw: ['haldeman', 'time dilation', 'veteran estrangement', 'interstellar war', 'vietnam era', 'military sf'], confidence: 'established',
    summary: 'A novel of an interstellar war in which time dilation leaves a veteran estranged from the world he fights for; often read as a response to the Vietnam War.',
  },
  {
    id: 'work-sff-the-dispossessed', kind: 'work', name: 'The Dispossessed', author: 'Ursula K. Le Guin', year: 1974, language: 'English', region: 'United States',
    genres: ['science fiction', 'utopian fiction', 'political science fiction'], kw: ['le guin', 'anarchist society', 'anarres', 'urras', 'ambiguous utopia', 'hainish cycle'], confidence: 'established',
    summary: 'A novel contrasting an anarchist moon society with the wealthy planet it left, following a physicist who travels between them; a model of the critical, ambiguous utopia.',
  },
  {
    id: 'work-sff-the-mote-in-gods-eye', kind: 'work', name: "The Mote in God's Eye", author: 'Larry Niven and Jerry Pournelle', year: 1974, language: 'English', region: 'United States',
    genres: ['science fiction', 'first contact', 'space opera'], kw: ['niven', 'pournelle', 'alien biology', 'imperial navy', 'first contact', 'collaborative novel'], confidence: 'established',
    summary: 'A novel of first contact between a human empire and an alien species whose biology shapes its whole society; noted for the thoroughness of its worldbuilding.',
  },
  {
    id: 'work-sff-the-female-man', kind: 'work', name: 'The Female Man', author: 'Joanna Russ', year: 1975, language: 'English', region: 'United States',
    genres: ['feminist science fiction', 'experimental fiction'], kw: ['russ', 'four women', 'parallel worlds', 'sexism', 'fragmentary form', 'feminist sf'], confidence: 'established',
    summary: 'An experimental novel in which four women from different worlds meet, using shifting voices and a fractured structure to criticise sexism in the real world.',
  },
  {
    id: 'work-sff-women-of-wonder', kind: 'work', name: 'Women of Wonder', author: 'Pamela Sargent (editor)', year: 1975, language: 'English', region: 'United States',
    genres: ['science fiction anthology', 'feminist science fiction'], kw: ['sargent', 'anthology', 'women writers of science fiction', 'feminist sf', 'recovered tradition'], confidence: 'established',
    summary: 'An anthology of science fiction stories by women, gathered to show their long contribution to the field; an influential early collection in the recovery of that tradition.',
  },
  {
    id: 'work-sff-dhalgren', kind: 'work', name: 'Dhalgren', author: 'Samuel R. Delany', year: 1975, language: 'English', region: 'United States',
    genres: ['experimental science fiction', 'new wave'], kw: ['delany', 'bellona', 'long novel', 'fragmentary narrative', 'literary science fiction', 'cut-off city'], confidence: 'established',
    summary: 'A long, experimental novel set in a mid-American city cut off from the rest of the world; noted for its dense, fragmentary style and its place in the late New Wave.',
  },
  {
    id: 'work-sff-woman-on-the-edge-of-time', kind: 'work', name: 'Woman on the Edge of Time', author: 'Marge Piercy', year: 1976, language: 'English', region: 'United States',
    genres: ['feminist science fiction', 'utopian fiction'], kw: ['piercy', 'time travel', 'egalitarian future', 'mental institution', 'feminist utopia', 'contact with the future'], confidence: 'established',
    summary: 'A novel that moves between a woman\'s life in 1970s America and visits to a possible egalitarian future; a landmark of feminist utopian and dystopian science fiction.',
  },
  {
    id: 'work-sff-gateway', kind: 'work', name: 'Gateway', author: 'Frederik Pohl', year: 1977, language: 'English', region: 'United States',
    genres: ['science fiction', 'adventure science fiction'], kw: ['pohl', 'heechee', 'prospectors', 'alien ships', 'psychological sf', 'therapy narrative'], confidence: 'established',
    summary: 'A novel about prospectors who risk their lives on flights in abandoned alien ships, with a narrator who tells his story in therapy; it joins adventure to psychological depth.',
  },
  {
    id: 'work-sff-kindred', kind: 'work', name: 'Kindred', author: 'Octavia E. Butler', year: 1979, language: 'English', region: 'United States',
    genres: ['science fiction', 'historical fiction', 'neo-slave narrative', 'time travel'], kw: ['butler', 'time slip', 'slavery', 'maryland plantation', 'afrofuturism', 'neo-slave narrative'], confidence: 'established',
    summary: 'A novel in which a modern Black woman is repeatedly pulled back to a pre-Civil War plantation; it joins time travel to the history of slavery and is widely taught.',
  },
  {
    id: 'work-sff-the-hitchhikers-guide-to-the-galaxy', kind: 'work', name: "The Hitchhiker's Guide to the Galaxy", author: 'Douglas Adams', year: 1979, language: 'English', region: 'United Kingdom',
    genres: ['comic science fiction', 'satire'], kw: ['adams', 'hitchhiker', 'don\'t panic', 'comic science fiction', 'radio comedy', 'absurdism'], confidence: 'established',
    summary: 'A comic novel about a man whisked off Earth moments before its demolition; it grew from a 1978 radio comedy and became a landmark of humorous science fiction.',
  },
  {
    id: 'work-sff-riddley-walker', kind: 'work', name: 'Riddley Walker', author: 'Russell Hoban', year: 1980, language: 'English', region: 'United Kingdom',
    genres: ['post-apocalyptic fiction', 'literary science fiction'], kw: ['hoban', 'invented dialect', 'future kent', 'nuclear aftermath', 'language as worldbuilding'], confidence: 'established',
    summary: 'A novel narrated in an invented, broken form of English in a ruined future Kent; its language is a central achievement and a model of voice as worldbuilding.',
  },
  {
    id: 'work-sff-the-shadow-of-the-torturer', kind: 'work', name: 'The Shadow of the Torturer', author: 'Gene Wolfe', year: 1980, language: 'English', region: 'United States',
    genres: ['science fantasy', 'literary science fiction'], kw: ['wolfe', 'book of the new sun', 'severian', 'dying earth', 'unreliable narrator', 'archaic vocabulary'], confidence: 'established',
    summary: 'The first volume of The Book of the New Sun, narrated by a trainee torturer in a dying far-future world; admired for its dense, archaic language and unreliable memory.',
  },
  {
    id: 'work-sff-downbelow-station', kind: 'work', name: 'Downbelow Station', author: 'C. J. Cherryh', year: 1981, language: 'English', region: 'United States',
    genres: ['space opera', 'military science fiction', 'political science fiction'], kw: ['cherryh', 'space station', 'merchanter', 'union alliance', 'political intrigue', 'logistics'], confidence: 'established',
    summary: 'A novel of a space station caught between competing powers during a long interstellar war, noted for its political and logistical realism and its large cast.',
  },
  {
    id: 'work-sff-true-names', kind: 'work', name: 'True Names', author: 'Vernor Vinge', year: 1981, language: 'English', region: 'United States',
    genres: ['cyberpunk precursor', 'science fiction', 'novella'], kw: ['vinge', 'virtual reality', 'hackers', 'online identity', 'cyberspace precursor'], confidence: 'established',
    summary: 'A novella about hackers who enter a shared virtual world under secret names and face a powerful threat; an early story of virtual reality and online identity.',
  },
  {
    id: 'work-sff-native-tongue', kind: 'work', name: 'Native Tongue', author: 'Suzette Haden Elgin', year: 1984, language: 'English', region: 'United States',
    genres: ['feminist science fiction', 'linguistic science fiction', 'dystopian fiction'], kw: ['elgin', 'linguist', 'women\'s language', 'laadan', 'language and power', 'feminist dystopia'], confidence: 'established',
    summary: 'A novel in which women linguists build a language of their own in a society that has taken away their rights; it explores language as power and as resistance.',
  },
  {
    id: 'work-sff-bloodchild', kind: 'work', name: 'Bloodchild', author: 'Octavia E. Butler', year: 1984, language: 'English', region: 'United States',
    genres: ['science fiction', 'short story', 'Afrofuturism'], kw: ['butler', 'alien symbiosis', 'dependence', 'short story', 'afrofuturism', 'tlic'], confidence: 'established',
    summary: 'A short story about a young man and an alien species that depends on humans for its young; a closely read work on dependence, obligation and consent.',
  },
  {
    id: 'work-sff-enders-game', kind: 'work', name: "Ender's Game", author: 'Orson Scott Card', year: 1985, language: 'English', region: 'United States',
    genres: ['military science fiction', 'science fiction', 'young adult crossover'], kw: ['card', 'battle school', 'child strategist', 'alien war', 'military training', 'ender wiggin'], confidence: 'established',
    summary: 'A novel about a gifted child trained in a space-war academy, expanded from a short story; a bestselling, widely discussed work about military training, manipulation and responsibility.',
  },
  {
    id: 'work-sff-the-handmaids-tale', kind: 'work', name: "The Handmaid's Tale", author: 'Margaret Atwood', year: 1985, language: 'English', region: 'Canada',
    genres: ['dystopian fiction', 'speculative fiction', 'feminist fiction'], kw: ['atwood', 'gilead', 'theocracy', 'reproductive control', 'canadian dystopia', 'handmaid'], confidence: 'established',
    summary: 'A novel of a theocratic regime that forces fertile women to bear children for the ruling class, narrated by one such woman; a defining modern dystopia.',
  },
  {
    id: 'work-sff-contact', kind: 'work', name: 'Contact', author: 'Carl Sagan', year: 1985, language: 'English', region: 'United States',
    genres: ['hard science fiction', 'first contact'], kw: ['sagan', 'seti', 'radio signal', 'science and faith', 'first contact', 'astronomer author'], confidence: 'established',
    summary: 'A novel by an astronomer about humanity\'s reaction to a signal from space; it balances science, faith and politics and treats first contact as a human process rather than a battle.',
  },
  {
    id: 'work-sff-dawn', kind: 'work', name: 'Dawn', author: 'Octavia E. Butler', year: 1987, language: 'English', region: 'United States',
    genres: ['science fiction', 'first contact', 'Afrofuturism'], kw: ['butler', 'xenogenesis', 'lilith\'s brood', 'alien survivors', 'genetic exchange', 'afrofuturism'], confidence: 'established',
    summary: 'The first novel of the Xenogenesis trilogy, in which survivors of a ruined Earth are offered a future by an alien species whose terms change what humanity means.',
  },
  {
    id: 'work-sff-hyperion', kind: 'work', name: 'Hyperion', author: 'Dan Simmons', year: 1989, language: 'English', region: 'United States',
    genres: ['space opera', 'science fiction', 'frame narrative'], kw: ['simmons', 'pilgrims', 'shrike', 'canterbury tales structure', 'hyperion cantos', 'nested tales'], confidence: 'established',
    summary: 'A novel built from the tales of seven pilgrims travelling to a shrine on a distant world, echoing the frame structure of The Canterbury Tales; a landmark of modern space opera.',
  },
  // ---- Cyberpunk and its successors ----
  {
    id: 'work-sff-neuromancer', kind: 'work', name: 'Neuromancer', author: 'William Gibson', year: 1984, language: 'English', region: 'United States and Canada',
    genres: ['cyberpunk', 'science fiction', 'noir science fiction'], kw: ['gibson', 'cyberspace', 'sprawl trilogy', 'hacker', 'matrix', 'cyberpunk origin'], confidence: 'established',
    summary: 'A novel of a washed-up hacker hired for a last job in a world of corporate power and cyberspace; it helped define cyberpunk and gave readers an enduring image of the network.',
  },
  {
    id: 'work-sff-burning-chrome', kind: 'work', name: 'Burning Chrome', author: 'William Gibson', year: 1986, language: 'English', region: 'United States and Canada',
    genres: ['cyberpunk', 'short story collection'], kw: ['gibson', 'cyberspace stories', 'johnny mnemonic', 'cyberpunk short fiction', 'early gibson'], confidence: 'established',
    summary: 'A story collection that gathers Gibson\'s early cyberspace and near-future tales, showing how cyberpunk took shape in short fiction before its first novels.',
  },
  {
    id: 'work-sff-mirrorshades', kind: 'work', name: 'Mirrorshades: The Cyberpunk Anthology', author: 'Bruce Sterling (editor)', year: 1986, language: 'English', region: 'United States',
    genres: ['cyberpunk', 'science fiction anthology'], kw: ['sterling', 'cyberpunk movement', 'anthology', 'manifesto preface', 'cyberpunk stories'], confidence: 'established',
    summary: 'An anthology that presented cyberpunk as a movement, with an editor\'s preface setting out its themes of technology, street culture and corporate power.',
  },
  {
    id: 'work-sff-snow-crash', kind: 'work', name: 'Snow Crash', author: 'Neal Stephenson', year: 1992, language: 'English', region: 'United States',
    genres: ['cyberpunk', 'satirical science fiction'], kw: ['stephenson', 'metaverse', 'avatar', 'franchise america', 'post-cyberpunk', 'comic cyberpunk'], confidence: 'established',
    summary: 'A fast-moving satire of a franchised America and a virtual Metaverse; it popularised the word metaverse and mixed cyberpunk with comedy, linguistics and ancient history.',
  },
  {
    id: 'work-sff-permutation-city', kind: 'work', name: 'Permutation City', author: 'Greg Egan', year: 1994, language: 'English', region: 'Australia',
    genres: ['hard science fiction', 'mind uploading', 'science fiction'], kw: ['egan', 'digital copies', 'simulated universe', 'identity and computation', 'australian science fiction'], confidence: 'established',
    summary: 'A novel about digital copies of minds and a project to build a self-sustaining virtual universe; a rigorous work of hard science fiction on identity and computation.',
  },
  {
    id: 'work-sff-the-diamond-age', kind: 'work', name: 'The Diamond Age', author: 'Neal Stephenson', year: 1995, language: 'English', region: 'United States',
    genres: ['science fiction', 'post-cyberpunk', 'nanotechnology fiction'], kw: ['stephenson', 'nanotech', 'illustrated primer', 'neo-victorian', 'education and class'], confidence: 'established',
    summary: 'A novel of a nanotechnology-based society and an interactive primer that shapes a girl\'s education; it links technology, class and the way children learn.',
  },
  {
    id: 'work-sff-altered-carbon', kind: 'work', name: 'Altered Carbon', author: 'Richard K. Morgan', year: 2002, language: 'English', region: 'United Kingdom',
    genres: ['cyberpunk', 'noir science fiction'], kw: ['morgan', 'sleeves', 'mind transfer', 'hardboiled sf', 'takeshi kovacs', 'new cyberpunk'], confidence: 'established',
    summary: 'A noir-tinged novel in which minds can be moved between bodies and a hired investigator takes on a case; a modern revival of cyberpunk\'s hard-boiled style.',
  },
  // ---- Space opera, hard science fiction, first contact ----
  {
    id: 'work-sff-consider-phlebas', kind: 'work', name: 'Consider Phlebas', author: 'Iain M. Banks', year: 1987, language: 'English', region: 'United Kingdom',
    genres: ['space opera', 'science fiction'], kw: ['banks', 'the culture', 'culture series', 'new space opera', 'post-scarcity', 'scottish science fiction'], confidence: 'established',
    summary: 'The first Culture novel, following an agent through a vast war between an anarchist utopia and a theocratic empire; it launched a leading series of modern, literary space opera.',
  },
  {
    id: 'work-sff-a-fire-upon-the-deep', kind: 'work', name: 'A Fire Upon the Deep', author: 'Vernor Vinge', year: 1992, language: 'English', region: 'United States',
    genres: ['space opera', 'science fiction', 'first contact'], kw: ['vinge', 'zones of thought', 'pack minds', 'galactic usenet', 'new space opera'], confidence: 'established',
    summary: 'A space opera set across galactic zones where physics limits intelligence and technology, with a group-minded alien species; a landmark of modern space opera and speculative worldbuilding.',
  },
  {
    id: 'work-sff-red-mars', kind: 'work', name: 'Red Mars', author: 'Kim Stanley Robinson', year: 1992, language: 'English', region: 'United States',
    genres: ['hard science fiction', 'colonisation fiction'], kw: ['robinson', 'terraforming', 'mars trilogy', 'first colonists', 'political science fiction'], confidence: 'established',
    summary: 'The first of a trilogy about the settlement and terraforming of Mars, notable for its attention to geology and engineering and to the politics and philosophies of the colonists.',
  },
  {
    id: 'work-sff-doomsday-book', kind: 'work', name: 'Doomsday Book', author: 'Connie Willis', year: 1992, language: 'English', region: 'United States',
    genres: ['science fiction', 'time travel', 'historical science fiction'], kw: ['willis', 'oxford time travel', 'black death', 'plague', 'historian', 'time travel novel'], confidence: 'established',
    summary: 'A novel in which a historian travels to the fourteenth century while a modern epidemic spreads at home; a major time-travel novel that joins historical detail to suspense.',
  },
  {
    id: 'work-sff-the-sparrow', kind: 'work', name: 'The Sparrow', author: 'Mary Doria Russell', year: 1996, language: 'English', region: 'United States',
    genres: ['science fiction', 'first contact', 'literary fiction'], kw: ['russell', 'jesuit mission', 'alien contact', 'faith and doubt', 'ethics of contact'], confidence: 'established',
    summary: 'A novel about a Jesuit-led expedition to an alien world and its aftermath, which examines faith, ethics and the consequences of cultural contact.',
  },
  {
    id: 'work-sff-a-deepness-in-the-sky', kind: 'work', name: 'A Deepness in the Sky', author: 'Vernor Vinge', year: 1999, language: 'English', region: 'United States',
    genres: ['space opera', 'science fiction', 'first contact'], kw: ['vinge', 'spiders', 'on-off star', 'traders and emergents', 'slow travel', 'new space opera'], confidence: 'established',
    summary: 'A novel of two human groups meeting at a star whose planet alternately goes dark, with a native species watched from orbit; set in the same universe as A Fire Upon the Deep.',
  },
  {
    id: 'work-sff-revelation-space', kind: 'work', name: 'Revelation Space', author: 'Alastair Reynolds', year: 2000, language: 'English', region: 'United Kingdom',
    genres: ['space opera', 'hard science fiction'], kw: ['reynolds', 'slower than light', 'archaeology', 'ancient threat', 'new space opera', 'gloomy space opera'], confidence: 'established',
    summary: 'A novel that begins a large-scale, sombre space opera with archaeology, ancient threats and travel slower than light; a leading example of the British new space opera.',
  },
  {
    id: 'work-sff-old-mans-war', kind: 'work', name: "Old Man's War", author: 'John Scalzi', year: 2005, language: 'English', region: 'United States',
    genres: ['military science fiction', 'science fiction'], kw: ['scalzi', 'colonial defence', 'old recruits', 'accessible science fiction', 'military sf'], confidence: 'established',
    summary: 'A novel in which elderly recruits are given new bodies to fight in a colonial war, told in a brisk, accessible style; a popular modern work of military science fiction.',
  },
  {
    id: 'work-sff-blindsight', kind: 'work', name: 'Blindsight', author: 'Peter Watts', year: 2006, language: 'English', region: 'Canada',
    genres: ['hard science fiction', 'first contact', 'horror'], kw: ['watts', 'consciousness', 'alien intelligence', 'vampire crew', 'bleak hard sf', 'canadian science fiction'], confidence: 'established',
    summary: 'A hard science fiction first-contact novel about a crew sent to meet an alien object, built around questions of consciousness; praised for its bleak and demanding ideas.',
  },
  {
    id: 'work-sff-leviathan-wakes', kind: 'work', name: 'Leviathan Wakes', author: 'James S. A. Corey', year: 2011, language: 'English', region: 'United States',
    genres: ['space opera', 'science fiction', 'noir science fiction'], kw: ['the expanse', 'belters', 'protomolecule', 'pen name', 'solar system politics', 'daniel abraham', 'ty franck'], confidence: 'established',
    summary: 'The first novel of The Expanse, set in a solar system divided between Earth, Mars and the Belt, which mixes a detective plot with political science fiction; written under a shared pen name.',
  },
  {
    id: 'work-sff-embassytown', kind: 'work', name: 'Embassytown', author: 'China Miéville', year: 2011, language: 'English', region: 'United Kingdom',
    genres: ['science fiction', 'linguistic science fiction', 'first contact'], kw: ['mieville', 'alien language', 'ariekei', 'speech and meaning', 'new weird'], confidence: 'established',
    summary: 'A novel about humans living beside an alien species whose language works in an unusual way, an exploration of how words relate to meaning and thought.',
  },
  {
    id: 'work-sff-the-martian', kind: 'work', name: 'The Martian', author: 'Andy Weir', year: 2011, language: 'English', region: 'United States',
    genres: ['hard science fiction', 'survival fiction'], kw: ['weir', 'stranded on mars', 'engineering problem solving', 'self-published', 'accessible hard sf'], confidence: 'established',
    summary: 'A novel about an astronaut stranded on Mars who solves survival problems with engineering and humour; a modern hard science fiction bestseller that began as self-published instalments.',
  },
  {
    id: 'work-sff-ancillary-justice', kind: 'work', name: 'Ancillary Justice', author: 'Ann Leckie', year: 2013, language: 'English', region: 'United States',
    genres: ['space opera', 'science fiction'], kw: ['leckie', 'imperial radch', 'ai narrator', 'gender-neutral pronouns', 'ship mind', 'new space opera'], confidence: 'established',
    summary: 'A space opera narrated by a former starship intelligence confined to one body, using a gender-neutral language to look at empire and identity; it reshaped debate about narration in science fiction.',
  },
  {
    id: 'work-sff-the-long-way-to-a-small-angry-planet', kind: 'work', name: 'The Long Way to a Small, Angry Planet', author: 'Becky Chambers', year: 2014, language: 'English', region: 'United States',
    genres: ['space opera', 'science fiction', 'cozy science fiction'], kw: ['chambers', 'wayfarers', 'found family', 'character-driven space opera', 'hopeful science fiction'], confidence: 'established',
    summary: 'A character-driven space novel about the crew of a tunnelling ship, centring friendship and found family over combat; the first of the Wayfarers series and a touchstone of hopeful science fiction.',
  },
  {
    id: 'work-sff-children-of-time', kind: 'work', name: 'Children of Time', author: 'Adrian Tchaikovsky', year: 2015, language: 'English', region: 'United Kingdom',
    genres: ['science fiction', 'space opera', 'evolution fiction'], kw: ['tchaikovsky', 'uplifted spiders', 'generation ship', 'alien evolution', 'non-human society'], confidence: 'established',
    summary: 'A novel of two lines of development, one of spiders on a terraformed planet and one of the last human voyagers, treated with close attention to biology and the shape of a society.',
  },
  {
    id: 'work-sff-all-systems-red', kind: 'work', name: 'All Systems Red', author: 'Martha Wells', year: 2017, language: 'English', region: 'United States',
    genres: ['science fiction', 'novella', 'space adventure'], kw: ['wells', 'murderbot', 'security android', 'first person voice', 'murderbot diaries'], confidence: 'established',
    summary: 'A novella narrated by a security android that has disabled its own controls and would rather watch its entertainment; the first Murderbot Diaries title, known for its wry first-person voice.',
  },
  {
    id: 'work-sff-the-calculating-stars', kind: 'work', name: 'The Calculating Stars', author: 'Mary Robinette Kowal', year: 2018, language: 'English', region: 'United States',
    genres: ['alternate history', 'science fiction', 'space race fiction'], kw: ['kowal', 'lady astronaut', 'meteorite strike', 'women in the space program', 'alternate space race'], confidence: 'established',
    summary: 'An alternate-history novel in which a meteorite strike in 1952 speeds up the American space programme, told by a woman mathematician and pilot; it opens the Lady Astronaut series.',
  },
  {
    id: 'work-sff-a-memory-called-empire', kind: 'work', name: 'A Memory Called Empire', author: 'Arkady Martine', year: 2019, language: 'English', region: 'United States',
    genres: ['space opera', 'political science fiction', 'science fiction'], kw: ['martine', 'ambassador', 'texcalaan', 'language and empire', 'diplomacy', 'political thriller'], confidence: 'established',
    summary: 'A space opera in which an ambassador from a small station arrives at a vast empire\'s capital and finds a murder to solve; focused on language, culture and political imitation.',
  },
  {
    id: 'work-sff-gideon-the-ninth', kind: 'work', name: 'Gideon the Ninth', author: 'Tamsyn Muir', year: 2019, language: 'English', region: 'New Zealand',
    genres: ['science fantasy', 'gothic fiction', 'locked room mystery'], kw: ['muir', 'necromancers', 'locked house', 'space gothic', 'new zealand author', 'genre blending'], confidence: 'established',
    summary: 'A genre-blending novel set in a gothic space empire of necromancers, mixing mystery, humour and horror in a locked-house plot narrated with a sharp comic voice.',
  },
  // ---- Climate fiction, dystopia and speculative fiction since 1990 ----
  {
    id: 'work-sff-parable-of-the-sower', kind: 'work', name: 'Parable of the Sower', author: 'Octavia E. Butler', year: 1993, language: 'English', region: 'United States',
    genres: ['dystopian fiction', 'climate fiction', 'Afrofuturism'], kw: ['butler', 'earthseed', 'collapsing california', 'diary novel', 'climate collapse', 'afrofuturism'], confidence: 'established',
    summary: 'A novel of a near-future California in decay, told through a young woman\'s journal and the faith she begins to shape; a landmark of climate fiction and dystopian writing.',
  },
  {
    id: 'work-sff-the-memory-police', kind: 'work', name: 'The Memory Police', author: 'Yōko Ogawa', year: 1994, language: 'Japanese', region: 'Japan',
    genres: ['dystopian fiction', 'literary fiction', 'speculative fiction'], kw: ['ogawa', 'disappearing objects', 'island', 'forgetting', 'authoritarian control', 'japanese dystopia'], confidence: 'established',
    summary: 'A novel set on an island where objects, and the memory of them, are made to vanish by decree; a quiet dystopia about loss, authority and the act of writing.',
  },
  {
    id: 'work-sff-stories-of-your-life-and-others', kind: 'work', name: 'Stories of Your Life and Others', author: 'Ted Chiang', year: 2002, language: 'English', region: 'United States',
    genres: ['science fiction', 'short story collection', 'philosophical fiction'], kw: ['chiang', 'story of your life', 'arrival film source', 'alien language', 'precise short fiction'], confidence: 'established',
    summary: 'A collection of precise, idea-driven stories, including one about alien language and perception that became a well-known film; a model of philosophical science fiction in short form.',
  },
  {
    id: 'work-sff-oryx-and-crake', kind: 'work', name: 'Oryx and Crake', author: 'Margaret Atwood', year: 2003, language: 'English', region: 'Canada',
    genres: ['speculative fiction', 'climate fiction', 'dystopian fiction'], kw: ['atwood', 'maddaddam', 'genetic engineering', 'post-pandemic', 'biotech dystopia', 'canadian speculative fiction'], confidence: 'established',
    summary: 'A novel of a ruined world told through the memories of a man who was part of the science that led to it; a major work of climate and biotechnology fiction.',
  },
  {
    id: 'work-sff-the-windup-girl', kind: 'work', name: 'The Windup Girl', author: 'Paolo Bacigalupi', year: 2009, language: 'English', region: 'United States',
    genres: ['biopunk', 'climate fiction', 'science fiction'], kw: ['bacigalupi', 'bangkok', 'genetic engineering', 'energy scarcity', 'calorie companies', 'biopunk'], confidence: 'established',
    summary: 'A novel set in a future Thailand shaped by energy scarcity, engineered food and corporate control; a leading work of biopunk and climate-aware science fiction.',
  },
  {
    id: 'work-sff-annihilation', kind: 'work', name: 'Annihilation', author: 'Jeff VanderMeer', year: 2014, language: 'English', region: 'United States',
    genres: ['new weird', 'ecological horror', 'science fiction'], kw: ['vandermeer', 'area x', 'southern reach', 'expedition journal', 'weird ecology', 'new weird'], confidence: 'established',
    summary: 'The first Southern Reach novel, told as an expedition journal into a mysterious zone where nature has changed; a defining work of the New Weird and of ecological strangeness.',
  },
  {
    id: 'work-sff-station-eleven', kind: 'work', name: 'Station Eleven', author: 'Emily St. John Mandel', year: 2014, language: 'English', region: 'Canada',
    genres: ['post-apocalyptic fiction', 'literary fiction', 'speculative fiction'], kw: ['mandel', 'pandemic', 'travelling symphony', 'shakespeare after the collapse', 'literary post-apocalypse'], confidence: 'established',
    summary: 'A novel that moves between the years before and after a pandemic, following a travelling troupe that performs Shakespeare; a literary post-apocalyptic book about art and memory.',
  },
  {
    id: 'work-sff-the-ministry-for-the-future', kind: 'work', name: 'The Ministry for the Future', author: 'Kim Stanley Robinson', year: 2020, language: 'English', region: 'United States',
    genres: ['climate fiction', 'science fiction', 'mosaic novel'], kw: ['robinson', 'climate agency', 'future generations', 'documents and voices', 'policy fiction', 'cli-fi'], confidence: 'established',
    summary: 'A novel told through varied documents and voices about a world agency charged with defending future generations against climate change; a major recent example of climate fiction.',
  },
  // ---- Afrofuturism and the African diaspora ----
  {
    id: 'work-sff-brown-girl-in-the-ring', kind: 'work', name: 'Brown Girl in the Ring', author: 'Nalo Hopkinson', year: 1998, language: 'English', region: 'Canada and Jamaica',
    genres: ['science fiction', 'Afrofuturism', 'Caribbean fantasy'], kw: ['hopkinson', 'toronto', 'caribbean folklore', 'near-future city', 'afro-caribbean speculative fiction'], confidence: 'established',
    summary: 'A near-future novel set in a decayed Toronto that blends Caribbean folk spirituality with science fiction; a foundational work of Caribbean-Canadian speculative fiction.',
  },
  {
    id: 'work-sff-dark-matter-a-century-of-speculative-fiction', kind: 'work', name: 'Dark Matter: A Century of Speculative Fiction from the African Diaspora', author: 'Sheree R. Thomas (editor)', year: 2000, language: 'English', region: 'United States',
    genres: ['Afrofuturism', 'speculative fiction anthology'], kw: ['thomas', 'afrofuturism anthology', 'black speculative fiction', 'african diaspora', 'essays and stories'], confidence: 'established',
    summary: 'An anthology of stories and essays by Black writers across a century of speculative fiction; an early, influential collection that traced the lineage of Afrofuturism.',
  },
  {
    id: 'work-sff-midnight-robber', kind: 'work', name: 'Midnight Robber', author: 'Nalo Hopkinson', year: 2000, language: 'English', region: 'Canada and Jamaica',
    genres: ['science fiction', 'Afrofuturism', 'Caribbean fantasy'], kw: ['hopkinson', 'caribbean english', 'carnival folklore', 'colony planet', 'dialect narration'], confidence: 'established',
    summary: 'A novel set on a Caribbean-inspired colony planet, narrated in a voice rooted in Caribbean English and carnival folklore; a standout of Afrofuturist voice and worldbuilding.',
  },
  {
    id: 'work-sff-who-fears-death', kind: 'work', name: 'Who Fears Death', author: 'Nnedi Okorafor', year: 2010, language: 'English', region: 'United States and Nigeria',
    genres: ['Afrofuturism', 'science fantasy', 'post-apocalyptic fiction'], kw: ['okorafor', 'post-apocalyptic africa', 'magic and technology', 'african fantasy', 'afrofuturism'], confidence: 'established',
    summary: 'A post-apocalyptic fantasy set in a future Africa, following a young woman with magical gifts; it blends fantasy and science fiction in an Afrofuturist frame.',
  },
  {
    id: 'work-sff-binti', kind: 'work', name: 'Binti', author: 'Nnedi Okorafor', year: 2015, language: 'English', region: 'United States and Nigeria',
    genres: ['Afrofuturism', 'science fiction', 'novella'], kw: ['okorafor', 'himba', 'interstellar university', 'novella', 'afrofuturism', 'african space opera'], confidence: 'established',
    summary: 'A novella about a young Himba woman who leaves home to attend an interstellar university; an Afrofuturist work that centres a culture rarely seen in space-faring science fiction.',
  },
  {
    id: 'work-sff-octavias-brood', kind: 'work', name: "Octavia's Brood", author: 'Walidah Imarisha and adrienne maree brown (editors)', year: 2015, language: 'English', region: 'United States',
    genres: ['speculative fiction anthology', 'social justice fiction'], kw: ['imarisha', 'adrienne maree brown', 'visionary fiction', 'organisers and activists', 'butler inspired', 'anthology'], confidence: 'established',
    summary: 'An anthology of speculative stories by activists and organisers, inspired by Octavia Butler, imagining other futures in the service of social justice.',
  },
  {
    id: 'work-sff-rosewater', kind: 'work', name: 'Rosewater', author: 'Tade Thompson', year: 2016, language: 'English', region: 'United Kingdom and Nigeria',
    genres: ['science fiction', 'Afrofuturism', 'first contact'], kw: ['thompson', 'wormwood trilogy', 'nigerian science fiction', 'alien biodome', 'telepath', 'lagos future'], confidence: 'established',
    summary: 'The first novel of the Wormwood trilogy, set in a Nigerian city that grows around an alien biodome, following a government agent with a gift for sensing minds.',
  },
  {
    id: 'work-sff-an-unkindness-of-ghosts', kind: 'work', name: 'An Unkindness of Ghosts', author: 'Rivers Solomon', year: 2017, language: 'English', region: 'United States',
    genres: ['Afrofuturism', 'science fiction', 'generation ship fiction'], kw: ['solomon', 'generation ship', 'hierarchy as slavery', 'healer protagonist', 'afrofuturist space fiction'], confidence: 'established',
    summary: 'A novel set on a generation ship with a rigid hierarchy modelled on slavery, following a gifted healer; a work of Afrofuturist space fiction concerned with power and survival.',
  },
  // ---- Science fiction from China, Japan, the Arab world and elsewhere ----
  {
    id: 'work-sff-japan-sinks', kind: 'work', name: 'Japan Sinks', author: 'Sakyo Komatsu', year: 1973, language: 'Japanese', region: 'Japan',
    genres: ['disaster fiction', 'science fiction'], kw: ['komatsu', 'nippon chinbotsu', 'earthquakes', 'japanese science fiction', 'disaster novel', 'bestseller'], confidence: 'established',
    summary: 'A disaster novel in which earthquakes and volcanic movement threaten to submerge the Japanese islands; a bestselling landmark of Japanese science fiction.',
  },
  {
    id: 'work-sff-the-wandering-earth', kind: 'work', name: 'The Wandering Earth', author: 'Liu Cixin', year: 2000, language: 'Chinese', region: 'China',
    genres: ['science fiction', 'novella', 'hard science fiction'], kw: ['liu cixin', 'moving the earth', 'dying sun', 'chinese science fiction', 'novella', 'scale'], confidence: 'established',
    summary: 'A novella in which humanity sets out to move the entire Earth to escape a dying Sun; a defining example of Liu Cixin\'s large-scale vision and later the basis of a film.',
  },
  {
    id: 'work-sff-harmony-itoh', kind: 'work', name: 'Harmony', author: 'Project Itoh', year: 2008, language: 'Japanese', region: 'Japan',
    genres: ['science fiction', 'dystopian fiction'], kw: ['itoh', 'hamoni', 'health utopia', 'social control', 'japanese science fiction', 'soft dystopia'], confidence: 'established',
    summary: 'A Japanese novel set in a future of total health care and gentle social control, following a young woman\'s quiet rebellion; a leading work of recent Japanese science fiction.',
  },
  {
    id: 'work-sff-the-three-body-problem', kind: 'work', name: 'The Three-Body Problem', author: 'Liu Cixin', year: 2008, language: 'Chinese', region: 'China',
    genres: ['hard science fiction', 'first contact'], kw: ['liu cixin', 'remembrance of earth\'s past', 'cultural revolution', 'chinese science fiction', 'trisolaris', 'dark forest trilogy'], confidence: 'established',
    summary: 'A novel that moves from the Chinese Cultural Revolution to humanity\'s first contact with a distant civilisation; it brought Chinese science fiction to a worldwide readership after its English translation.',
  },
  {
    id: 'work-sff-utopia-towfik', kind: 'work', name: 'Utopia', author: 'Ahmed Khaled Towfik', year: 2008, language: 'Arabic', region: 'Egypt',
    genres: ['dystopian fiction', 'science fiction'], kw: ['towfik', 'tawfik', 'egyptian dystopia', 'class divide', 'walled enclave', 'arabic science fiction'], confidence: 'established',
    summary: 'An Egyptian dystopian novel set in 2023, in which a walled enclave of the wealthy is separated from the poor; a widely read example of Arabic science fiction.',
  },
  {
    id: 'work-sff-waste-tide', kind: 'work', name: 'Waste Tide', author: 'Chen Qiufan', year: 2013, language: 'Chinese', region: 'China',
    genres: ['science fiction', 'cyberpunk', 'climate fiction'], kw: ['chen qiufan', 'huangchao', 'e-waste', 'near-future china', 'chinese cyberpunk', 'technology and labour'], confidence: 'established',
    summary: 'A near-future novel set on an island that recycles the world\'s electronic waste, with a plot about workers, corporations and technology; a notable work of Chinese science fiction.',
  },
  {
    id: 'work-sff-frankenstein-in-baghdad', kind: 'work', name: 'Frankenstein in Baghdad', author: 'Ahmed Saadawi', year: 2013, language: 'Arabic', region: 'Iraq',
    genres: ['horror', 'fantasy', 'satire'], kw: ['saadawi', 'iraq war', 'baghdad', 'arabic horror', 'frankenstein retelling', 'war and loss'], confidence: 'established',
    summary: 'A novel set in Iraq during the US-led occupation, in which a figure stitched from the remains of victims begins to seek revenge; it uses horror to portray war and loss.',
  },
  {
    id: 'work-sff-invisible-planets', kind: 'work', name: 'Invisible Planets: Contemporary Chinese Science Fiction in Translation', author: 'Ken Liu (editor and translator)', year: 2016, language: 'English', region: 'China and United States',
    genres: ['science fiction anthology', 'translated fiction'], kw: ['ken liu', 'chinese science fiction', 'translation', 'anthology', 'contemporary chinese writers'], confidence: 'established',
    summary: 'An anthology of Chinese science fiction in English translation, with essays on the field; a key point of access for English readers to contemporary Chinese writing in the genre.',
  },
  {
    id: 'work-sff-exhalation', kind: 'work', name: 'Exhalation', author: 'Ted Chiang', year: 2019, language: 'English', region: 'United States',
    genres: ['science fiction', 'short story collection', 'philosophical fiction'], kw: ['chiang', 'free will', 'artificial minds', 'time and choice', 'idea-driven stories'], confidence: 'established',
    summary: 'A collection of stories about time, free will, artificial minds and the ethics of knowledge, written with philosophical clarity and a close attention to how an idea unfolds.',
  },
  {
    id: 'work-sff-the-paper-menagerie', kind: 'work', name: 'The Paper Menagerie', author: 'Ken Liu', year: 2011, language: 'English', region: 'United States',
    genres: ['fantasy', 'short story', 'literary fantasy'], kw: ['ken liu', 'origami', 'immigrant family', 'identity and language', 'short story', 'magical realism'], confidence: 'established',
    summary: 'A short story about a boy and his mother\'s living origami animals, treating migration, identity and language; a widely praised and widely taught work of literary fantasy.',
  },
  // ---- Perdido and the New Weird, pulp magazines ----
  {
    id: 'work-sff-perdido-street-station', kind: 'work', name: 'Perdido Street Station', author: 'China Miéville', year: 2000, language: 'English', region: 'United Kingdom',
    genres: ['new weird', 'fantasy', 'science fantasy'], kw: ['mieville', 'new crobuzon', 'steampunk city', 'weird fiction', 'bas-lag', 'urban fantasy'], confidence: 'established',
    summary: 'A dense New Weird novel set in a sprawling city of many species, where an unorthodox scientist unleashes a threat; a defining work of the movement that mixes fantasy, horror and science fiction.',
  },
  {
    id: 'work-sff-the-city-and-the-city', kind: 'work', name: 'The City & the City', author: 'China Miéville', year: 2009, language: 'English', region: 'United Kingdom',
    genres: ['new weird', 'detective fiction', 'speculative fiction'], kw: ['mieville', 'two cities one space', 'unseeing', 'police procedural', 'weird detective', 'borders'], confidence: 'established',
    summary: 'A detective novel set in two cities that occupy the same space, whose citizens are trained not to see each other; a weird-fiction conceit carried by a police procedural plot.',
  },
  {
    id: 'work-sff-weird-tales', kind: 'work', name: 'Weird Tales', author: 'Various contributors', year: 1923, language: 'English', region: 'United States',
    genres: ['pulp magazine', 'weird fiction', 'fantasy', 'horror'], kw: ['pulp', 'lovecraft', 'howard', 'magazine', 'weird fiction', 'sword and sorcery'], confidence: 'established',
    summary: 'The American pulp magazine that gave a home to weird fiction, fantasy and horror; it published early work by Lovecraft and Howard and shaped those genres in the twentieth century.',
  },
  {
    id: 'work-sff-amazing-stories', kind: 'work', name: 'Amazing Stories', author: 'Hugo Gernsback (founding editor)', year: 1926, language: 'English', region: 'United States',
    genres: ['pulp magazine', 'science fiction'], kw: ['gernsback', 'first science fiction magazine', 'pulp', 'scientifiction', 'magazine'], confidence: 'established',
    summary: 'The American pulp magazine generally regarded as the first devoted entirely to science fiction; its founding editor promoted the genre\'s name and its community of readers.',
  },
  {
    id: 'work-sff-astounding-stories', kind: 'work', name: 'Astounding Stories', author: 'Various contributors', year: 1930, language: 'English', region: 'United States',
    genres: ['pulp magazine', 'science fiction'], kw: ['astounding', 'analog', 'campbell', 'golden age', 'pulp magazine', 'street and smith'], confidence: 'established',
    summary: 'The pulp magazine, later renamed Astounding Science Fiction and then Analog, that became the centre of golden age science fiction under its editor John W. Campbell from 1937.',
  },
  // ---- Fantasy before Tolkien: fairy tale, myth and invented worlds ----
  {
    id: 'work-sff-journey-to-the-west', kind: 'work', name: 'Journey to the West', author: "Wu Cheng'en (traditional attribution)", year: 'c. 1592', language: 'Chinese', region: 'China',
    genres: ['Chinese classic novel', 'mythic fantasy', 'picaresque'], kw: ['monkey king', 'sun wukong', 'xuanzang', 'pilgrimage to india', 'ming novel', 'xiyouji'], confidence: 'established',
    summary: 'A Chinese novel of a monk\'s pilgrimage to India with a monkey king and other companions, mixing myth, satire and religion; its earliest surviving edition dates from about 1592.',
  },
  {
    id: 'work-sff-ugetsu-monogatari', kind: 'work', name: 'Tales of Moonlight and Rain (Ugetsu Monogatari)', author: 'Ueda Akinari', year: 1776, language: 'Japanese', region: 'Japan',
    genres: ['supernatural tales', 'ghost stories', 'classical Japanese fiction'], kw: ['ueda akinari', 'ugetsu', 'edo period', 'japanese ghost stories', 'kaidan', 'nine tales'], confidence: 'established',
    summary: 'A collection of nine supernatural tales in classical Japanese, drawing on older Chinese and Japanese ghost stories; a classic of Japanese fantasy and the uncanny.',
  },
  {
    id: 'work-sff-phantastes', kind: 'work', name: 'Phantastes', author: 'George MacDonald', year: 1858, language: 'English', region: 'United Kingdom',
    genres: ['fantasy', 'fairy tale for adults', 'Victorian fantasy'], kw: ['macdonald', 'fairy land', 'faerie romance', 'dream logic', 'influence on lewis'], confidence: 'established',
    summary: 'A fantasy in which a young man enters a fairy land and wanders through its tales and dangers; an early novel-length fantasy for adults that influenced later writers such as C. S. Lewis.',
  },
  {
    id: 'work-sff-alices-adventures-in-wonderland', kind: 'work', name: "Alice's Adventures in Wonderland", author: 'Lewis Carroll', year: 1865, language: 'English', region: 'United Kingdom',
    genres: ["children's fantasy", 'nonsense literature', 'portal fantasy'], kw: ['carroll', 'wonderland', 'nonsense', 'wordplay', 'dream fantasy', 'victorian children\'s fiction'], confidence: 'established',
    summary: 'A children\'s novel about a girl who falls into a dream world governed by nonsense, famous for its wordplay, logic games and parody; a foundation of portal fantasy and nonsense writing.',
  },
  {
    id: 'work-sff-the-wonderful-wizard-of-oz', kind: 'work', name: 'The Wonderful Wizard of Oz', author: 'L. Frank Baum', year: 1900, language: 'English', region: 'United States',
    genres: ["children's fantasy", 'American fairy tale', 'portal fantasy'], kw: ['baum', 'oz', 'dorothy', 'american fairy tale', 'yellow brick road', 'oz series'], confidence: 'established',
    summary: 'A children\'s fantasy about a Kansas girl swept to a magical land; among the first major American fairy tales and the start of a long series of Oz books.',
  },
  {
    id: 'work-sff-the-gods-of-pegana', kind: 'work', name: 'The Gods of Pegāna', author: 'Lord Dunsany', year: 1905, language: 'English', region: 'Ireland',
    genres: ['fantasy', 'invented mythology', 'short fiction'], kw: ['dunsany', 'invented pantheon', 'mythopoeia', 'early secondary world', 'irish fantasy'], confidence: 'established',
    summary: 'A set of short invented myths about an imagined pantheon; an early work of invented mythology that influenced later fantasy writers, notably Lovecraft.',
  },
  {
    id: 'work-sff-the-worm-ouroboros', kind: 'work', name: 'The Worm Ouroboros', author: 'E. R. Eddison', year: 1922, language: 'English', region: 'United Kingdom',
    genres: ['heroic fantasy', 'secondary world fantasy'], kw: ['eddison', 'archaic prose', 'witchland', 'mercury setting', 'saga style', 'early epic fantasy'], confidence: 'established',
    summary: 'A heroic fantasy of rival realms set on an imagined Mercury, noted for its ornate, archaic prose and praised by later fantasy writers as an early model of epic fantasy.',
  },
  {
    id: 'work-sff-the-king-of-elflands-daughter', kind: 'work', name: "The King of Elfland's Daughter", author: 'Lord Dunsany', year: 1924, language: 'English', region: 'Ireland',
    genres: ['fantasy', 'faerie romance'], kw: ['dunsany', 'elfland', 'faerie', 'lyrical fantasy', 'ordinary land and faerie'], confidence: 'established',
    summary: 'A novel about a human lord\'s marriage to an elf princess and the pull between the ordinary land and Faerie; praised for its lyrical prose and its picture of enchantment.',
  },
  {
    id: 'work-sff-lud-in-the-mist', kind: 'work', name: 'Lud-in-the-Mist', author: 'Hope Mirrlees', year: 1926, language: 'English', region: 'United Kingdom',
    genres: ['fantasy', 'faerie romance', 'comic fantasy'], kw: ['mirrlees', 'faerie border', 'merchant town', 'fairy fruit', 'everyday meets uncanny'], confidence: 'established',
    summary: 'A fantasy novel about a prosperous merchant town on the border of Faerie, where forbidden fairy produce seeps in; an influential early fantasy of everyday life meeting the uncanny.',
  },
  {
    id: 'work-sff-the-phoenix-on-the-sword', kind: 'work', name: 'The Phoenix on the Sword', author: 'Robert E. Howard', year: 1932, language: 'English', region: 'United States',
    genres: ['sword and sorcery', 'pulp fantasy', 'short story'], kw: ['howard', 'conan', 'weird tales', 'barbarian hero', 'hyborian age', 'sword and sorcery'], confidence: 'established',
    summary: 'The first published Conan story, which appeared in Weird Tales and introduced the barbarian hero; a founding text of sword and sorcery.',
  },
  // ---- Tolkien, the Inklings and mid-century fantasy ----
  {
    id: 'work-sff-the-hobbit', kind: 'work', name: 'The Hobbit', author: 'J. R. R. Tolkien', year: 1937, language: 'English', region: 'United Kingdom',
    genres: ["children's fantasy", 'quest fantasy', 'secondary world fantasy'], kw: ['tolkien', 'bilbo baggins', 'middle-earth', 'dragon quest', 'there and back again'], confidence: 'established',
    summary: 'A children\'s fantasy about a reluctant hobbit drawn into a quest to recover a treasure guarded by a dragon; the book that introduced Tolkien\'s Middle-earth to the public.',
  },
  {
    id: 'work-sff-titus-groan', kind: 'work', name: 'Titus Groan', author: 'Mervyn Peake', year: 1946, language: 'English', region: 'United Kingdom',
    genres: ['gothic fantasy', 'fantasy of manners', 'secondary world fantasy'], kw: ['peake', 'gormenghast', 'castle novel', 'ritual', 'fantasy without magic', 'baroque prose'], confidence: 'established',
    summary: 'The first Gormenghast novel, set in a vast, decaying castle ruled by ritual; a landmark of fantasy that depends on atmosphere and character rather than quests or magic.',
  },
  {
    id: 'work-sff-the-lion-the-witch-and-the-wardrobe', kind: 'work', name: 'The Lion, the Witch and the Wardrobe', author: 'C. S. Lewis', year: 1950, language: 'English', region: 'United Kingdom',
    genres: ["children's fantasy", 'portal fantasy', 'allegorical fantasy'], kw: ['lewis', 'narnia', 'aslan', 'wardrobe', 'chronicles of narnia', 'christian fantasy'], confidence: 'established',
    summary: 'A children\'s fantasy in which four siblings enter a snowbound land through a wardrobe; the first Narnia book to be published and a model of the portal fantasy.',
  },
  {
    id: 'work-sff-the-lord-of-the-rings', kind: 'work', name: 'The Lord of the Rings', author: 'J. R. R. Tolkien', year: 1954, language: 'English', region: 'United Kingdom',
    genres: ['epic fantasy', 'high fantasy', 'secondary world fantasy'], kw: ['tolkien', 'one ring', 'middle-earth', 'fellowship of the ring', 'frodo', 'epic fantasy template'], confidence: 'established',
    summary: 'An epic fantasy, published in three volumes from 1954, about a quest to destroy a ring of power; it set the template for modern epic fantasy and its detailed invented world.',
  },
  {
    id: 'work-sff-the-once-and-future-king', kind: 'work', name: 'The Once and Future King', author: 'T. H. White', year: 1958, language: 'English', region: 'United Kingdom',
    genres: ['Arthurian fantasy', 'retelling'], kw: ['white', 'king arthur', 'sword in the stone', 'merlyn', 'arthurian retelling', 'camelot'], confidence: 'established',
    summary: 'A retelling of the Arthurian legend that gathers four earlier books, moving from humour to tragedy; a key modern retelling that treats the legend as a story about power and war.',
  },
  {
    id: 'work-sff-the-phantom-tollbooth', kind: 'work', name: 'The Phantom Tollbooth', author: 'Norton Juster', year: 1961, language: 'English', region: 'United States',
    genres: ["children's fantasy", 'portal fantasy', 'wordplay fiction'], kw: ['juster', 'milo', 'dictionopolis', 'puns and wordplay', 'middle grade fantasy', 'allegory of learning'], confidence: 'established',
    summary: 'A children\'s fantasy about a bored boy who travels to a land where words and numbers rule, full of puns and literal-minded jokes; a classic of wordplay fantasy.',
  },
  {
    id: 'work-sff-the-book-of-three', kind: 'work', name: 'The Book of Three', author: 'Lloyd Alexander', year: 1964, language: 'English', region: 'United States',
    genres: ["children's fantasy", 'quest fantasy', 'Welsh-inspired fantasy'], kw: ['alexander', 'prydain', 'assistant pig-keeper', 'welsh mythology', 'chronicles of prydain', 'middle grade'], confidence: 'established',
    summary: 'The first of the Chronicles of Prydain, a children\'s fantasy drawing on Welsh myth in which an assistant pig-keeper grows into a hero.',
  },
  {
    id: 'work-sff-a-wizard-of-earthsea', kind: 'work', name: 'A Wizard of Earthsea', author: 'Ursula K. Le Guin', year: 1968, language: 'English', region: 'United States',
    genres: ['high fantasy', 'coming-of-age fantasy', 'secondary world fantasy'], kw: ['le guin', 'earthsea', 'ged', 'true names', 'wizard school', 'balance in magic'], confidence: 'established',
    summary: 'A fantasy of a young mage whose pride unleashes a shadow; it treats magic as a discipline with consequences and is a model of the coming-of-age fantasy.',
  },
  {
    id: 'work-sff-dragonflight', kind: 'work', name: 'Dragonflight', author: 'Anne McCaffrey', year: 1968, language: 'English', region: 'United States',
    genres: ['science fantasy', 'dragon fantasy'], kw: ['mccaffrey', 'pern', 'dragonriders', 'threadfall', 'dragon bond', 'science fantasy'], confidence: 'established',
    summary: 'The first Pern novel, set on a planet threatened by falling spores and defended by riders bonded to dragons; it joins fantasy imagery to a science-fictional explanation.',
  },
  {
    id: 'work-sff-the-last-unicorn', kind: 'work', name: 'The Last Unicorn', author: 'Peter S. Beagle', year: 1968, language: 'English', region: 'United States',
    genres: ['fantasy', 'fairy tale', 'literary fantasy'], kw: ['beagle', 'unicorn quest', 'wry fairy tale', 'lyrical fantasy', 'self-aware fairy tale'], confidence: 'established',
    summary: 'A fantasy about a unicorn who sets out to learn whether others of her kind still exist, noted for its wry, lyrical voice and its gentle awareness of fairy-tale convention.',
  },
  {
    id: 'work-sff-elric-of-melnibone', kind: 'work', name: 'Elric of Melniboné', author: 'Michael Moorcock', year: 1972, language: 'English', region: 'United Kingdom',
    genres: ['sword and sorcery', 'dark fantasy'], kw: ['moorcock', 'elric', 'stormbringer', 'eternal champion', 'anti-hero', 'melnibone'], confidence: 'established',
    summary: 'A sword-and-sorcery novel introducing a sickly, doomed sorcerer-emperor, an anti-hero who inverts the muscular heroes of earlier pulp fantasy; a landmark of dark fantasy.',
  },
  {
    id: 'work-sff-the-dark-is-rising', kind: 'work', name: 'The Dark Is Rising', author: 'Susan Cooper', year: 1973, language: 'English', region: 'United Kingdom',
    genres: ["children's fantasy", 'contemporary fantasy', 'mythic fantasy'], kw: ['cooper', 'old ones', 'light and dark', 'arthurian myth', 'english folklore', 'winter fantasy'], confidence: 'established',
    summary: 'A children\'s fantasy that blends Arthurian myth with English folklore, following a boy\'s discovery of his part in an ancient struggle between the Light and the Dark.',
  },
  {
    id: 'work-sff-the-sword-of-shannara', kind: 'work', name: 'The Sword of Shannara', author: 'Terry Brooks', year: 1977, language: 'English', region: 'United States',
    genres: ['epic fantasy', 'quest fantasy'], kw: ['brooks', 'shannara', 'tolkienesque quest', 'commercial epic fantasy', 'druid and elves'], confidence: 'established',
    summary: 'A quest fantasy that follows the shape of Tolkien\'s epic closely and became a major commercial success, showing the market for epic fantasy in the late 1970s.',
  },
  {
    id: 'work-sff-lord-fouls-bane', kind: 'work', name: "Lord Foul's Bane", author: 'Stephen R. Donaldson', year: 1977, language: 'English', region: 'United States',
    genres: ['epic fantasy', 'dark fantasy', 'portal fantasy'], kw: ['donaldson', 'thomas covenant', 'unbeliever', 'antihero', 'chronicles of thomas covenant', 'doubting protagonist'], confidence: 'established',
    summary: 'The first Chronicles of Thomas Covenant novel, whose cynical, ill protagonist doubts that the fantasy land he is pulled into is real; an unusual flawed hero in epic fantasy.',
  },
  {
    id: 'work-sff-the-neverending-story', kind: 'work', name: 'The Neverending Story', author: 'Michael Ende', year: 1979, language: 'German', region: 'Germany',
    genres: ["children's fantasy", 'metafiction', 'portal fantasy'], kw: ['ende', 'unendliche geschichte', 'fantastica', 'reading and imagination', 'book within a book', 'german fantasy'], confidence: 'established',
    summary: 'A German novel about a boy who becomes part of the story he is reading, a layered meditation on imagination and reading; one of the best-known German-language fantasies.',
  },
  {
    id: 'work-sff-little-big', kind: 'work', name: 'Little, Big', author: 'John Crowley', year: 1981, language: 'English', region: 'United States',
    genres: ['literary fantasy', 'faerie romance'], kw: ['crowley', 'family saga', 'faerie', 'slow fantasy', 'american literary fantasy'], confidence: 'established',
    summary: 'A novel following several generations of a family linked to the world of Faerie, written in rich, slow prose; widely admired as a literary fantasy.',
  },
  {
    id: 'work-sff-the-mists-of-avalon', kind: 'work', name: 'The Mists of Avalon', author: 'Marion Zimmer Bradley', year: 1983, language: 'English', region: 'United States',
    genres: ['Arthurian fantasy', 'retelling', 'historical fantasy'], kw: ['bradley', 'morgaine', 'arthurian women', 'avalon', 'old religion and christianity', 'feminist retelling'], confidence: 'established',
    summary: 'A retelling of the Arthurian legend from the viewpoints of its women, centred on Morgaine and the clash between the old religion and Christianity.',
  },
  {
    id: 'work-sff-the-colour-of-magic', kind: 'work', name: 'The Colour of Magic', author: 'Terry Pratchett', year: 1983, language: 'English', region: 'United Kingdom',
    genres: ['comic fantasy', 'parody', 'secondary world fantasy'], kw: ['pratchett', 'discworld', 'rincewind', 'twoflower', 'fantasy parody', 'british comic fantasy'], confidence: 'established',
    summary: 'The first Discworld novel, a comic fantasy that parodies genre conventions through a cowardly wizard and a naive tourist; the start of one of the best-loved fantasy series.',
  },
  {
    id: 'work-sff-mythago-wood', kind: 'work', name: 'Mythago Wood', author: 'Robert Holdstock', year: 1984, language: 'English', region: 'United Kingdom',
    genres: ['mythic fantasy', 'contemporary fantasy'], kw: ['holdstock', 'ryhope wood', 'mythagos', 'myth and archetype', 'british fantasy', 'forest of myth'], confidence: 'established',
    summary: 'A novel about an English forest that gives physical form to figures from myth and the human unconscious; an influential work of myth-based fantasy.',
  },
  {
    id: 'work-sff-howls-moving-castle', kind: 'work', name: "Howl's Moving Castle", author: 'Diana Wynne Jones', year: 1986, language: 'English', region: 'United Kingdom',
    genres: ["children's fantasy", 'fairy-tale fantasy', 'comic fantasy'], kw: ['wynne jones', 'howl', 'sophie', 'walking castle', 'witch\'s curse', 'ghibli source'], confidence: 'established',
    summary: 'A fantasy about a young woman who is cursed and takes shelter in a wizard\'s walking castle; witty, shaped by fairy-tale convention, and the source of a well-known animated film.',
  },
  {
    id: 'work-sff-war-for-the-oaks', kind: 'work', name: 'War for the Oaks', author: 'Emma Bull', year: 1987, language: 'English', region: 'United States',
    genres: ['urban fantasy', 'faerie fantasy'], kw: ['bull', 'minneapolis', 'rock band', 'faerie courts', 'early urban fantasy', 'phouka'], confidence: 'established',
    summary: 'An early urban fantasy about a musician drawn into a conflict between faerie courts in Minneapolis, mixing rock-band life with Celtic lore; a model for the form.',
  },
  {
    id: 'work-sff-the-dragonbone-chair', kind: 'work', name: 'The Dragonbone Chair', author: 'Tad Williams', year: 1988, language: 'English', region: 'United States',
    genres: ['epic fantasy', 'secondary world fantasy'], kw: ['williams', 'memory sorrow and thorn', 'osten ard', 'scullion hero', 'long epic fantasy'], confidence: 'established',
    summary: 'The first book of the Memory, Sorrow and Thorn trilogy, an epic fantasy in which a castle kitchen boy is swept into a struggle for a kingdom; an influence on later epic fantasy.',
  },
  {
    id: 'work-sff-tigana', kind: 'work', name: 'Tigana', author: 'Guy Gavriel Kay', year: 1990, language: 'English', region: 'Canada',
    genres: ['historical fantasy', 'secondary world fantasy'], kw: ['kay', 'renaissance italy inspired', 'erased name', 'resistance', 'canadian fantasy', 'memory and loss'], confidence: 'established',
    summary: 'A fantasy of a land under a spell that erases its name from memory, inspired by Renaissance Italy; a leading example of historically inspired fantasy built on loss and resistance.',
  },
  {
    id: 'work-sff-the-eye-of-the-world', kind: 'work', name: 'The Eye of the World', author: 'Robert Jordan', year: 1990, language: 'English', region: 'United States',
    genres: ['epic fantasy', 'quest fantasy'], kw: ['jordan', 'wheel of time', 'two rivers', 'chosen one', 'very long series', 'epic fantasy'], confidence: 'established',
    summary: 'The first volume of The Wheel of Time, a very long epic fantasy that opens with young villagers pursued from home; a defining title of 1990s epic fantasy.',
  },
  {
    id: 'work-sff-good-omens', kind: 'work', name: 'Good Omens', author: 'Terry Pratchett and Neil Gaiman', year: 1990, language: 'English', region: 'United Kingdom',
    genres: ['comic fantasy', 'apocalyptic comedy', 'contemporary fantasy'], kw: ['pratchett', 'gaiman', 'angel and demon', 'apocalypse comedy', 'collaboration', 'british humour'], confidence: 'established',
    summary: 'A comic novel about an angel and a demon who try to prevent the Apocalypse because they have grown fond of Earth; a collaboration that blends fantasy with satire of the end times.',
  },
  {
    id: 'work-sff-the-gunslinger', kind: 'work', name: 'The Gunslinger', author: 'Stephen King', year: 1982, language: 'English', region: 'United States',
    genres: ['dark fantasy', 'western', 'quest fantasy'], kw: ['king', 'dark tower', 'roland', 'man in black', 'western fantasy', 'desert quest'], confidence: 'established',
    summary: 'The first Dark Tower book, a blend of western and fantasy that follows a gunslinger pursuing a man in black across a desert; the opening of King\'s large, linked fantasy series.',
  },
  // ---- Modern epic fantasy, urban fantasy and fantasy for young readers, 1990s to 2000s ----
  {
    id: 'work-sff-assassins-apprentice', kind: 'work', name: "Assassin's Apprentice", author: 'Robin Hobb', year: 1995, language: 'English', region: 'United States',
    genres: ['epic fantasy', 'coming-of-age fantasy'], kw: ['hobb', 'farseer', 'fitz', 'first person epic fantasy', 'royal bastard', 'intimate fantasy'], confidence: 'established',
    summary: 'The first Farseer novel, narrated in a memoir style by a royal bastard trained as an assassin; praised for its intimate first-person voice within epic fantasy.',
  },
  {
    id: 'work-sff-northern-lights', kind: 'work', name: 'Northern Lights', author: 'Philip Pullman', year: 1995, language: 'English', region: 'United Kingdom',
    genres: ["children's fantasy", 'young adult fantasy', 'parallel world fantasy'], kw: ['pullman', 'his dark materials', 'daemons', 'the golden compass', 'lyra', 'parallel worlds'], confidence: 'established',
    summary: 'The first of His Dark Materials, in which a girl travels north to find missing children in a world where every human has an animal companion; published in the United States as The Golden Compass.',
  },
  {
    id: 'work-sff-sabriel', kind: 'work', name: 'Sabriel', author: 'Garth Nix', year: 1995, language: 'English', region: 'Australia',
    genres: ['young adult fantasy', 'dark fantasy'], kw: ['nix', 'old kingdom', 'abhorsen', 'necromancy', 'australian fantasy', 'bells as magic'], confidence: 'established',
    summary: 'A fantasy set across a border between a modern-seeming kingdom and a land of the dead, with a heroine whose inherited work is to put the dead to rest.',
  },
  {
    id: 'work-sff-neverwhere', kind: 'work', name: 'Neverwhere', author: 'Neil Gaiman', year: 1996, language: 'English', region: 'United Kingdom',
    genres: ['urban fantasy', 'contemporary fantasy'], kw: ['gaiman', 'london below', 'hidden london', 'underground fantasy', 'bbc serial', 'urban fantasy'], confidence: 'established',
    summary: 'An urban fantasy about a London beneath the ordinary city, entered by those who fall through its cracks; it began as a television series and was published as a novel the same year.',
  },
  {
    id: 'work-sff-a-game-of-thrones', kind: 'work', name: 'A Game of Thrones', author: 'George R. R. Martin', year: 1996, language: 'English', region: 'United States',
    genres: ['epic fantasy', 'political fantasy', 'grimdark precursor'], kw: ['martin', 'song of ice and fire', 'westeros', 'multiple viewpoints', 'political intrigue', 'subverted tropes'], confidence: 'established',
    summary: 'The first volume of A Song of Ice and Fire, an epic fantasy with many viewpoint characters and political intrigue in place of a single hero; a major influence on later epic fantasy.',
  },
  {
    id: 'work-sff-harry-potter-and-the-philosophers-stone', kind: 'work', name: "Harry Potter and the Philosopher's Stone", author: 'J. K. Rowling', year: 1997, language: 'English', region: 'United Kingdom',
    genres: ["children's fantasy", 'school story', 'contemporary fantasy'], kw: ['rowling', 'harry potter', 'hogwarts', 'wizard school', 'sorcerer\'s stone', 'middle grade fantasy'], confidence: 'established',
    summary: 'The first Harry Potter novel, in which an orphaned boy learns he is a wizard and enters a boarding school of magic; published in the United States as Harry Potter and the Sorcerer\'s Stone.',
  },
  {
    id: 'work-sff-gardens-of-the-moon', kind: 'work', name: 'Gardens of the Moon', author: 'Steven Erikson', year: 1999, language: 'English', region: 'Canada',
    genres: ['epic fantasy', 'grimdark', 'military fantasy'], kw: ['erikson', 'malazan', 'book of the fallen', 'dense worldbuilding', 'in medias res', 'canadian fantasy'], confidence: 'established',
    summary: 'The first of the Malazan Book of the Fallen, a very large epic fantasy known for its density, its scale and its refusal to explain its world to the reader.',
  },
  {
    id: 'work-sff-storm-front', kind: 'work', name: 'Storm Front', author: 'Jim Butcher', year: 2000, language: 'English', region: 'United States',
    genres: ['urban fantasy', 'detective fiction', 'contemporary fantasy'], kw: ['butcher', 'dresden files', 'wizard detective', 'chicago', 'noir fantasy', 'urban fantasy series'], confidence: 'established',
    summary: 'The first Dresden Files novel, in which a wizard works as a private investigator in Chicago; a model of the hard-boiled urban fantasy series.',
  },
  {
    id: 'work-sff-american-gods', kind: 'work', name: 'American Gods', author: 'Neil Gaiman', year: 2001, language: 'English', region: 'United Kingdom and United States',
    genres: ['contemporary fantasy', 'mythic fantasy', 'road novel'], kw: ['gaiman', 'old gods and new gods', 'immigrant gods', 'american road trip', 'mythology', 'shadow moon'], confidence: 'established',
    summary: 'A novel in which old and new gods contend across the American landscape, with an ex-convict hired as a bodyguard; a mythic road story about belief and migration.',
  },
  {
    id: 'work-sff-dead-until-dark', kind: 'work', name: 'Dead Until Dark', author: 'Charlaine Harris', year: 2001, language: 'English', region: 'United States',
    genres: ['urban fantasy', 'paranormal mystery', 'paranormal romance'], kw: ['harris', 'sookie stackhouse', 'southern vampire mysteries', 'louisiana', 'telepathic waitress', 'vampires out in the open'], confidence: 'established',
    summary: 'The first Southern Vampire Mysteries novel, set in a Louisiana town after vampires have come out publicly, narrated by a telepathic waitress; a model of the paranormal mystery.',
  },
  {
    id: 'work-sff-jonathan-strange-and-mr-norrell', kind: 'work', name: 'Jonathan Strange & Mr Norrell', author: 'Susanna Clarke', year: 2004, language: 'English', region: 'United Kingdom',
    genres: ['historical fantasy', 'alternate history', 'fantasy of manners'], kw: ['clarke', 'napoleonic england', 'footnotes', 'english magic', 'pastiche of 19th century novel', 'fairy king'], confidence: 'established',
    summary: 'A historical fantasy about two magicians in Napoleonic-era England, written in the manner of nineteenth-century novels with scholarly footnotes; a landmark of the fantasy of manners.',
  },
  {
    id: 'work-sff-the-blade-itself', kind: 'work', name: 'The Blade Itself', author: 'Joe Abercrombie', year: 2006, language: 'English', region: 'United Kingdom',
    genres: ['epic fantasy', 'grimdark'], kw: ['abercrombie', 'first law', 'morally grey characters', 'grimdark', 'gritty fantasy', 'british fantasy'], confidence: 'established',
    summary: 'The first book of The First Law, a gritty epic fantasy with morally compromised protagonists and dark humour; a leading example of the grimdark style.',
  },
  {
    id: 'work-sff-the-lies-of-locke-lamora', kind: 'work', name: 'The Lies of Locke Lamora', author: 'Scott Lynch', year: 2006, language: 'English', region: 'United States',
    genres: ['heist fantasy', 'secondary world fantasy', 'adventure fantasy'], kw: ['lynch', 'gentleman bastards', 'camorr', 'thieves', 'con artist fantasy', 'heist'], confidence: 'established',
    summary: 'A heist fantasy about a gang of thieves in a Venice-like city, mixing a crime caper with an invented world and sharp dialogue.',
  },
  {
    id: 'work-sff-mistborn-the-final-empire', kind: 'work', name: 'Mistborn: The Final Empire', author: 'Brandon Sanderson', year: 2006, language: 'English', region: 'United States',
    genres: ['epic fantasy', 'heist fantasy', 'hard magic fantasy'], kw: ['sanderson', 'allomancy', 'hard magic system', 'rebellion against a dark lord', 'mistborn', 'rule-based magic'], confidence: 'established',
    summary: 'A heist-driven fantasy about a rebellion against an immortal tyrant, noted for its explicit, rule-based magic system and its tightly planned plot.',
  },
  {
    id: 'work-sff-the-name-of-the-wind', kind: 'work', name: 'The Name of the Wind', author: 'Patrick Rothfuss', year: 2007, language: 'English', region: 'United States',
    genres: ['epic fantasy', 'frame narrative'], kw: ['rothfuss', 'kingkiller chronicle', 'kvothe', 'innkeeper tells his legend', 'university of magic', 'storytelling'], confidence: 'established',
    summary: 'The first Kingkiller Chronicle novel, in which an innkeeper tells his own legend; known for its frame story and its attention to storytelling and the gap between legend and life.',
  },
  {
    id: 'work-sff-the-magicians', kind: 'work', name: 'The Magicians', author: 'Lev Grossman', year: 2009, language: 'English', region: 'United States',
    genres: ['contemporary fantasy', 'portal fantasy', 'literary fantasy'], kw: ['grossman', 'brakebills', 'quentin', 'disillusioned fantasy', 'narnia homage', 'college of magic'], confidence: 'established',
    summary: 'A novel about a young man who finds a college of magic and a fantasy land from his childhood books, treated in a modern, disillusioned manner that questions fantasy\'s comforts.',
  },
  {
    id: 'work-sff-the-way-of-kings', kind: 'work', name: 'The Way of Kings', author: 'Brandon Sanderson', year: 2010, language: 'English', region: 'United States',
    genres: ['epic fantasy'], kw: ['sanderson', 'stormlight archive', 'roshar', 'highstorms', 'surgebinding', 'multi-viewpoint epic'], confidence: 'established',
    summary: 'The first Stormlight Archive novel, a very large epic with several viewpoint characters and an elaborately built world shaped by recurring storms.',
  },
  {
    id: 'work-sff-rivers-of-london', kind: 'work', name: 'Rivers of London', author: 'Ben Aaronovitch', year: 2011, language: 'English', region: 'United Kingdom',
    genres: ['urban fantasy', 'police procedural'], kw: ['aaronovitch', 'midnight riot', 'london police magic', 'peter grant', 'police procedural fantasy', 'river gods'], confidence: 'established',
    summary: 'An urban fantasy about a London police constable who discovers magic and ghosts, blending a police procedural with folklore; published in the United States as Midnight Riot.',
  },
  // ---- Contemporary and diverse voices in fantasy ----
  {
    id: 'work-sff-the-palm-wine-drinkard', kind: 'work', name: 'The Palm-Wine Drinkard', author: 'Amos Tutuola', year: 1952, language: 'English', region: 'Nigeria',
    genres: ['African fantasy', 'folk-tale fiction', 'quest narrative'], kw: ['tutuola', 'yoruba folktales', 'land of the dead', 'nigerian english', 'african literature in english', 'oral storytelling'], confidence: 'established',
    summary: 'A Nigerian novel in English, drawing on Yoruba folktales, in which a man journeys to the land of the dead; an early landmark of African fantasy and of voice drawn from oral tradition.',
  },
  {
    id: 'work-sff-legends-of-the-condor-heroes', kind: 'work', name: 'Legends of the Condor Heroes', author: 'Jin Yong (Louis Cha)', year: 1957, language: 'Chinese', region: 'Hong Kong',
    genres: ['wuxia', 'martial arts fantasy', 'historical fiction'], kw: ['jin yong', 'louis cha', 'wuxia', 'song dynasty', 'martial arts novel', 'serialised novel'], confidence: 'established',
    summary: 'A martial-arts epic set in the Song dynasty, first serialised in Hong Kong; a landmark of the wuxia genre that shaped Chinese-language popular fiction.',
  },
  {
    id: 'work-sff-chandrakanta', kind: 'work', name: 'Chandrakanta', author: 'Devaki Nandan Khatri', year: 1888, language: 'Hindi', region: 'India',
    genres: ['fantasy', 'tilism fiction', 'adventure novel'], kw: ['khatri', 'tilism', 'hindi novel', 'magical enclosures', 'spies and intrigue', 'early hindi fiction'], confidence: 'established',
    summary: 'A very popular early Hindi novel of magic, spies and intrigue that helped build a readership for Hindi prose; a landmark of South Asian fantasy.',
  },
  {
    id: 'work-sff-the-last-wish', kind: 'work', name: 'The Last Wish', author: 'Andrzej Sapkowski', year: 1993, language: 'Polish', region: 'Poland',
    genres: ['dark fantasy', 'linked short stories', 'fairy-tale retelling'], kw: ['sapkowski', 'the witcher', 'geralt', 'slavic folklore', 'monster hunter', 'polish fantasy'], confidence: 'established',
    summary: 'A linked collection of stories about the monster-hunter Geralt that began the Witcher saga, reworking Slavic folklore and well-known fairy tales.',
  },
  {
    id: 'work-sff-the-famished-road', kind: 'work', name: 'The Famished Road', author: 'Ben Okri', year: 1991, language: 'English', region: 'Nigeria and United Kingdom',
    genres: ['magical realism', 'African fantasy'], kw: ['okri', 'abiku', 'spirit child', 'nigerian town', 'magical realism', 'spirit world'], confidence: 'established',
    summary: 'A novel narrated by a spirit-child in a Nigerian town, blending ordinary life with the spirit world; a major work of African magical realism in English.',
  },
  {
    id: 'work-sff-the-fifth-season', kind: 'work', name: 'The Fifth Season', author: 'N. K. Jemisin', year: 2015, language: 'English', region: 'United States',
    genres: ['science fantasy', 'epic fantasy', 'post-apocalyptic fiction'], kw: ['jemisin', 'broken earth', 'orogeny', 'seismic apocalypse', 'second person narration', 'stillness'], confidence: 'established',
    summary: 'The first novel of the Broken Earth trilogy, set on a planet beset by recurring seismic catastrophes and following several women; it blends science fiction and fantasy with an unusual narrative voice.',
  },
  {
    id: 'work-sff-sorcerer-to-the-crown', kind: 'work', name: 'Sorcerer to the Crown', author: 'Zen Cho', year: 2015, language: 'English', region: 'United Kingdom and Malaysia',
    genres: ['historical fantasy', 'fantasy of manners', 'Regency fantasy'], kw: ['zen cho', 'regency england', 'sorcerer royal', 'race and class in magic', 'malaysian british author'], confidence: 'established',
    summary: 'A Regency-era fantasy about a Black Sorcerer Royal and a young woman of magical talent, set in a society that excludes both; a comedy of manners with a pointed view of empire.',
  },
  {
    id: 'work-sff-the-grace-of-kings', kind: 'work', name: 'The Grace of Kings', author: 'Ken Liu', year: 2015, language: 'English', region: 'United States',
    genres: ['epic fantasy', 'silkpunk', 'historical fantasy'], kw: ['ken liu', 'dandelion dynasty', 'silkpunk', 'chinese history inspired', 'rebellion and empire', 'airships and kites'], confidence: 'established',
    summary: 'The first novel of the Dandelion Dynasty, an epic fantasy inspired by Chinese history that draws on what the author calls silkpunk technology; a rebellion story told with long-range historical sweep.',
  },
  {
    id: 'work-sff-uprooted', kind: 'work', name: 'Uprooted', author: 'Naomi Novik', year: 2015, language: 'English', region: 'United States',
    genres: ['fairy-tale fantasy', 'fantasy', 'folklore-inspired fantasy'], kw: ['novik', 'polish fairy tales', 'dragon wizard', 'dark forest', 'village magic', 'standalone fantasy'], confidence: 'established',
    summary: 'A fairy-tale-inspired fantasy, drawing on Eastern European folklore, about a village girl chosen by a wizard to serve in his tower and the corrupting forest beyond; a standalone novel.',
  },
  {
    id: 'work-sff-the-city-of-brass', kind: 'work', name: 'The City of Brass', author: 'S. A. Chakraborty', year: 2017, language: 'English', region: 'United States',
    genres: ['historical fantasy', 'Middle Eastern fantasy', 'epic fantasy'], kw: ['chakraborty', 'daevabad', 'djinn', 'eighteenth-century cairo', 'islamic and persian lore', 'daevabad trilogy'], confidence: 'established',
    summary: 'The first Daevabad novel, a fantasy drawing on Islamic and Persian lore, in which a con artist in eighteenth-century Cairo discovers a hidden world of djinn.',
  },
  {
    id: 'work-sff-the-poppy-war', kind: 'work', name: 'The Poppy War', author: 'R. F. Kuang', year: 2018, language: 'English', region: 'United States',
    genres: ['military fantasy', 'epic fantasy', 'grimdark'], kw: ['kuang', 'chinese history inspired', 'war academy', 'shamanism', 'nikara', 'dark fantasy'], confidence: 'established',
    summary: 'A military fantasy inspired by twentieth-century Chinese history, following a war orphan who enters an elite academy; it treats war and its consequences with seriousness.',
  },
  {
    id: 'work-sff-circe', kind: 'work', name: 'Circe', author: 'Madeline Miller', year: 2018, language: 'English', region: 'United States',
    genres: ['mythic retelling', 'historical fantasy', 'literary fantasy'], kw: ['miller', 'greek myth retelling', 'witch of aiaia', 'odyssey perspective', 'feminist retelling', 'first person myth'], confidence: 'established',
    summary: 'A novel that retells the life of the witch from Greek myth, narrated in her own voice from her exile on an island; a leading example of the feminist myth retelling.',
  },
  {
    id: 'work-sff-trail-of-lightning', kind: 'work', name: 'Trail of Lightning', author: 'Rebecca Roanhorse', year: 2018, language: 'English', region: 'United States',
    genres: ['urban fantasy', 'post-apocalyptic fantasy', 'Indigenous fantasy'], kw: ['roanhorse', 'dinetah', 'navajo-inspired', 'monster hunter', 'sixth world', 'indigenous futurism'], confidence: 'established',
    summary: 'A post-apocalyptic fantasy set in a Navajo-inspired future after floods, with a monster hunter as its protagonist; a landmark of Indigenous-voiced speculative fiction.',
  },
  {
    id: 'work-sff-black-leopard-red-wolf', kind: 'work', name: 'Black Leopard, Red Wolf', author: 'Marlon James', year: 2019, language: 'English', region: 'Jamaica and United States',
    genres: ['epic fantasy', 'African fantasy'], kw: ['james', 'dark star trilogy', 'african-inspired epic', 'tracker narrator', 'unreliable narration', 'african mythology'], confidence: 'established',
    summary: 'The first of the Dark Star trilogy, an African-inspired epic fantasy built around a quest and told by an unreliable tracker; notable for its density and range of reference.',
  },
  {
    id: 'work-sff-the-goblin-emperor', kind: 'work', name: 'The Goblin Emperor', author: 'Katherine Addison', year: 2014, language: 'English', region: 'United States',
    genres: ['fantasy of manners', 'secondary world fantasy', 'court fantasy'], kw: ['addison', 'maia', 'half-goblin emperor', 'court etiquette', 'gentle fantasy', 'political fantasy'], confidence: 'established',
    summary: 'A fantasy of a half-goblin youth unexpectedly crowned emperor, concentrating on court etiquette, decency and politics rather than battle; a model of the low-violence court fantasy.',
  },
  {
    id: 'work-sff-piranesi', kind: 'work', name: 'Piranesi', author: 'Susanna Clarke', year: 2020, language: 'English', region: 'United Kingdom',
    genres: ['literary fantasy', 'mystery', 'portal fantasy'], kw: ['clarke', 'house of halls', 'statues and tides', 'memory puzzle', 'short fantasy novel', 'labyrinth'], confidence: 'established',
    summary: 'A short novel narrated by a man who lives in an endless house of halls, statues and tides; a puzzle of memory and wonder, and a model of the quiet fantasy.',
  },
  {
    id: 'work-sff-babel', kind: 'work', name: 'Babel', author: 'R. F. Kuang', year: 2022, language: 'English', region: 'United States',
    genres: ['historical fantasy', 'dark academia', 'alternate history'], kw: ['kuang', 'oxford translators', 'translation magic', 'colonialism critique', 'dark academia', 'silver-working'], confidence: 'established',
    summary: 'A historical fantasy set at Oxford in which translation fuels the British Empire\'s magic, written as a critique of colonialism and of the academy that serves it.',
  },
  // ---- Gothic fiction and the nineteenth-century ghost story ----
  {
    id: 'work-sff-the-castle-of-otranto', kind: 'work', name: 'The Castle of Otranto', author: 'Horace Walpole', year: 1764, language: 'English', region: 'United Kingdom',
    genres: ['gothic fiction', 'supernatural fiction'], kw: ['walpole', 'first gothic novel', 'haunted castle', 'ancestral curse', 'gothic origins'], confidence: 'established',
    summary: 'A short novel of an ancient curse, a haunted castle and supernatural events; often called the first gothic novel, it established many of the genre\'s settings and effects.',
  },
  {
    id: 'work-sff-the-mysteries-of-udolpho', kind: 'work', name: 'The Mysteries of Udolpho', author: 'Ann Radcliffe', year: 1794, language: 'English', region: 'United Kingdom',
    genres: ['gothic fiction', 'gothic romance'], kw: ['radcliffe', 'explained supernatural', 'terror and horror', 'remote castle', 'sublime landscape', 'gothic heroine'], confidence: 'established',
    summary: 'A gothic novel of a young woman in a remote castle, known for its landscapes, suspense and natural explanations for apparent ghosts; a defining example of the gothic of terror.',
  },
  {
    id: 'work-sff-the-monk', kind: 'work', name: 'The Monk', author: 'Matthew Gregory Lewis', year: 1796, language: 'English', region: 'United Kingdom',
    genres: ['gothic fiction', 'horror'], kw: ['lewis', 'ambition and temptation', 'monastery', 'sensational gothic', 'gothic of horror', 'ambrosio'], confidence: 'established',
    summary: 'A gothic novel of ambition and temptation set in a Spanish monastery, notorious in its day for sensational scenes; a high point of the gothic of horror as against Radcliffe\'s terror.',
  },
  {
    id: 'work-sff-the-vampyre', kind: 'work', name: 'The Vampyre', author: 'John William Polidori', year: 1819, language: 'English', region: 'United Kingdom',
    genres: ['gothic fiction', 'vampire fiction', 'short story'], kw: ['polidori', 'lord ruthven', 'aristocratic vampire', 'villa diodati', 'first english vampire story'], confidence: 'established',
    summary: 'A short tale that introduced the aristocratic vampire to English fiction, growing out of the ghost-story circle that also produced Frankenstein.',
  },
  {
    id: 'work-sff-the-fall-of-the-house-of-usher', kind: 'work', name: 'The Fall of the House of Usher', author: 'Edgar Allan Poe', year: 1839, language: 'English', region: 'United States',
    genres: ['gothic fiction', 'horror', 'short story'], kw: ['poe', 'usher', 'decaying mansion', 'unity of effect', 'american gothic', 'doubles'], confidence: 'established',
    summary: 'A short story of a visitor to a decaying family mansion and its ailing occupants; a model of atmosphere and unity of effect in gothic and horror fiction.',
  },
  {
    id: 'work-sff-the-tell-tale-heart', kind: 'work', name: 'The Tell-Tale Heart', author: 'Edgar Allan Poe', year: 1843, language: 'English', region: 'United States',
    genres: ['gothic fiction', 'psychological horror', 'short story'], kw: ['poe', 'unreliable narrator', 'guilty conscience', 'monologue', 'american gothic', 'madness narrator'], confidence: 'established',
    summary: 'A short monologue by a narrator who insists on his sanity while describing a crime; a classic of the unreliable narrator and of psychological horror.',
  },
  {
    id: 'work-sff-carmilla', kind: 'work', name: 'Carmilla', author: 'J. Sheridan Le Fanu', year: 1872, language: 'English', region: 'Ireland',
    genres: ['gothic fiction', 'vampire fiction', 'novella'], kw: ['le fanu', 'female vampire', 'in a glass darkly', 'pre-dracula', 'irish gothic', 'lesbian subtext'], confidence: 'established',
    summary: 'A novella, serialised in 1871-72 and collected in In a Glass Darkly, of a young woman and her mysterious guest; it gave vampire fiction a female, psychologically charged figure a quarter-century before Dracula.',
  },
  {
    id: 'work-sff-strange-case-of-dr-jekyll-and-mr-hyde', kind: 'work', name: 'Strange Case of Dr Jekyll and Mr Hyde', author: 'Robert Louis Stevenson', year: 1886, language: 'English', region: 'United Kingdom',
    genres: ['gothic fiction', 'horror', 'novella'], kw: ['stevenson', 'jekyll and hyde', 'dual identity', 'victorian double life', 'mystery structure', 'divided self'], confidence: 'established',
    summary: 'A novella of a respectable doctor and his violent double, told as a mystery that is solved by documents; the Victorian classic of dual identity and the divided self.',
  },
  {
    id: 'work-sff-the-picture-of-dorian-gray', kind: 'work', name: 'The Picture of Dorian Gray', author: 'Oscar Wilde', year: 1890, language: 'English', region: 'Ireland and United Kingdom',
    genres: ['gothic fiction', 'philosophical novel', 'decadent literature'], kw: ['wilde', 'portrait that ages', 'aestheticism', 'decadence', 'vanity and moral cost', 'irish author'], confidence: 'established',
    summary: 'A novel of a young man whose portrait ages in his place, first published in a magazine in 1890; a gothic tale of vanity, art and moral cost.',
  },
  {
    id: 'work-sff-the-yellow-wallpaper', kind: 'work', name: 'The Yellow Wallpaper', author: 'Charlotte Perkins Gilman', year: 1892, language: 'English', region: 'United States',
    genres: ['gothic fiction', 'psychological horror', 'short story', 'feminist literature'], kw: ['gilman', 'rest cure', 'unreliable narrator', 'confinement', 'diary form', 'feminist horror'], confidence: 'established',
    summary: 'A short story, in diary form, about a woman confined to rest in a room with oppressive wallpaper; a landmark of psychological horror and of feminist critique.',
  },
  {
    id: 'work-sff-the-great-god-pan', kind: 'work', name: 'The Great God Pan', author: 'Arthur Machen', year: 1894, language: 'English', region: 'United Kingdom',
    genres: ['weird fiction', 'horror', 'novella'], kw: ['machen', 'pan', 'cosmic dread', 'welsh weird', 'fin de siecle horror', 'forbidden experiment'], confidence: 'established',
    summary: 'A novella of a scientific experiment with disturbing results, told through fragments and testimony; a key early work of weird fiction by a Welsh writer.',
  },
  {
    id: 'work-sff-the-king-in-yellow', kind: 'work', name: 'The King in Yellow', author: 'Robert W. Chambers', year: 1895, language: 'English', region: 'United States',
    genres: ['weird fiction', 'horror', 'short story collection'], kw: ['chambers', 'cursed play', 'carcosa', 'invented book', 'decadent horror', 'shared motif'], confidence: 'established',
    summary: 'A collection of stories, several of them linked by a fictional play that unsettles those who read it; an early model of the invented cursed text, later borrowed by many writers.',
  },
  {
    id: 'work-sff-dracula', kind: 'work', name: 'Dracula', author: 'Bram Stoker', year: 1897, language: 'English', region: 'Ireland and United Kingdom',
    genres: ['gothic fiction', 'vampire fiction', 'epistolary novel', 'horror'], kw: ['stoker', 'count dracula', 'transylvania', 'diaries and letters', 'vampire novel', 'epistolary horror'], confidence: 'established',
    summary: 'An epistolary novel, told in diaries, letters and clippings, in which a group sets out to stop a Transylvanian count; it fixed the modern image of the vampire.',
  },
  {
    id: 'work-sff-the-turn-of-the-screw', kind: 'work', name: 'The Turn of the Screw', author: 'Henry James', year: 1898, language: 'English', region: 'United States and United Kingdom',
    genres: ['ghost story', 'psychological fiction', 'novella'], kw: ['james', 'governess', 'ambiguity of ghosts', 'unreliable narrator', 'frame story', 'victorian ghost story'], confidence: 'established',
    summary: 'A novella in which a governess believes her young charges are haunted, famous for the ambiguity over whether the ghosts are real or imagined.',
  },
  // ---- Ghost stories, weird fiction and cosmic horror, 1900-1960 ----
  {
    id: 'work-sff-the-monkeys-paw', kind: 'work', name: "The Monkey's Paw", author: 'W. W. Jacobs', year: 1902, language: 'English', region: 'United Kingdom',
    genres: ['horror', 'short story', 'supernatural fiction'], kw: ['jacobs', 'three wishes', 'cautionary tale', 'be careful what you wish for', 'classic horror short story'], confidence: 'established',
    summary: 'A very short tale of a charm that grants three wishes at a price; a model of the cautionary story and of horror achieved through restraint.',
  },
  {
    id: 'work-sff-ghost-stories-of-an-antiquary', kind: 'work', name: 'Ghost Stories of an Antiquary', author: 'M. R. James', year: 1904, language: 'English', region: 'United Kingdom',
    genres: ['ghost story', 'antiquarian horror', 'short story collection'], kw: ['m r james', 'antiquarian ghost story', 'scholars and libraries', 'english village', 'restrained horror', 'christmas ghost story'], confidence: 'established',
    summary: 'A collection of scholarly ghost stories set in libraries, churches and English villages; it set the pattern for the antiquarian ghost story and for suggestion over display.',
  },
  {
    id: 'work-sff-kwaidan', kind: 'work', name: 'Kwaidan: Stories and Studies of Strange Things', author: 'Lafcadio Hearn', year: 1904, language: 'English', region: 'Japan',
    genres: ['ghost stories', 'folklore retelling', 'short story collection'], kw: ['hearn', 'japanese ghost stories', 'kaidan', 'folklore retold', 'yuki-onna', 'meiji era'], confidence: 'established',
    summary: 'A collection of Japanese ghost stories and sketches retold in English by a writer who lived in Japan; the book introduced many Japanese tales of the uncanny to Western readers.',
  },
  {
    id: 'work-sff-the-willows', kind: 'work', name: 'The Willows', author: 'Algernon Blackwood', year: 1907, language: 'English', region: 'United Kingdom',
    genres: ['weird fiction', 'horror', 'novella'], kw: ['blackwood', 'danube', 'nature horror', 'atmospheric dread', 'cosmic horror precursor', 'marsh island'], confidence: 'established',
    summary: 'A novella about two travellers camping on a Danube island amid an eerie willow marsh; a classic of atmosphere-led, nature-based dread.',
  },
  {
    id: 'work-sff-the-colour-out-of-space', kind: 'work', name: 'The Colour Out of Space', author: 'H. P. Lovecraft', year: 1927, language: 'English', region: 'United States',
    genres: ['weird fiction', 'cosmic horror', 'science fiction horror'], kw: ['lovecraft', 'meteorite', 'blasted heath', 'alien contamination', 'cosmic horror', 'new england horror'], confidence: 'established',
    summary: 'A story of a strange meteorite and its effects on a rural family\'s farm; often counted among Lovecraft\'s best and an early example of horror grounded in science fiction.',
  },
  {
    id: 'work-sff-the-call-of-cthulhu', kind: 'work', name: 'The Call of Cthulhu', author: 'H. P. Lovecraft', year: 1928, language: 'English', region: 'United States',
    genres: ['weird fiction', 'cosmic horror', 'short story'], kw: ['lovecraft', 'cthulhu mythos', 'cosmic indifference', 'documentary structure', 'weird tales', 'elder gods'], confidence: 'established',
    summary: 'A short story told as a gathering of documents and testimony about an ancient being; a defining work of cosmic horror and the centre of the Cthulhu Mythos.',
  },
  {
    id: 'work-sff-at-the-mountains-of-madness', kind: 'work', name: 'At the Mountains of Madness', author: 'H. P. Lovecraft', year: 1936, language: 'English', region: 'United States',
    genres: ['cosmic horror', 'weird fiction', 'science fiction horror', 'novella'], kw: ['lovecraft', 'antarctica', 'expedition', 'old ones', 'scientist narrator', 'astounding stories'], confidence: 'established',
    summary: 'A novella told by a geologist about an Antarctic expedition and what it finds; it fuses science fiction, horror and a cosmic scale in the manner of the polar expedition report.',
  },
  {
    id: 'work-sff-the-lottery', kind: 'work', name: 'The Lottery', author: 'Shirley Jackson', year: 1948, language: 'English', region: 'United States',
    genres: ['horror', 'short story', 'American gothic'], kw: ['jackson', 'village ritual', 'new yorker', 'ordinary evil', 'quiet horror', 'classroom short story'], confidence: 'established',
    summary: 'A short story of an ordinary village\'s annual ritual, which drew a large response when The New Yorker published it; a classic of quiet horror about tradition and conformity.',
  },
  {
    id: 'work-sff-psycho', kind: 'work', name: 'Psycho', author: 'Robert Bloch', year: 1959, language: 'English', region: 'United States',
    genres: ['psychological horror', 'suspense', 'thriller'], kw: ['bloch', 'motel keeper', 'hitchcock source', 'psychological suspense', 'american horror', 'norman bates'], confidence: 'established',
    summary: 'A suspense novel about a lonely motel keeper and a woman who stops there, which shaped modern psychological horror; the source of Hitchcock\'s film.',
  },
  {
    id: 'work-sff-the-haunting-of-hill-house', kind: 'work', name: 'The Haunting of Hill House', author: 'Shirley Jackson', year: 1959, language: 'English', region: 'United States',
    genres: ['gothic fiction', 'psychological horror', 'haunted house fiction'], kw: ['jackson', 'haunted house', 'ambiguous haunting', 'eleanor', 'psychological ghost story', 'american gothic'], confidence: 'established',
    summary: 'A novel about four people invited to investigate a reputedly haunted house; a model of psychological ambiguity in the haunted-house story, with a close focus on one troubled mind.',
  },
  {
    id: 'work-sff-we-have-always-lived-in-the-castle', kind: 'work', name: 'We Have Always Lived in the Castle', author: 'Shirley Jackson', year: 1962, language: 'English', region: 'United States',
    genres: ['gothic fiction', 'psychological fiction', 'American gothic'], kw: ['jackson', 'merricat', 'isolation', 'village suspicion', 'unreliable narrator', 'gothic family'], confidence: 'established',
    summary: 'A novel narrated by a young woman living in seclusion with her sister after a family tragedy; a study of isolation, suspicion and a narrator whose view of events is her own.',
  },
  // ---- Modern horror, 1960s to 1990s ----
  {
    id: 'work-sff-rosemarys-baby', kind: 'work', name: "Rosemary's Baby", author: 'Ira Levin', year: 1967, language: 'English', region: 'United States',
    genres: ['horror', 'domestic horror', 'occult fiction'], kw: ['levin', 'pregnancy horror', 'neighbours', 'paranoia', 'urban gothic', 'domestic suspicion'], confidence: 'established',
    summary: 'A novel of a young woman who comes to suspect her neighbours\' interest in her pregnancy; a model of domestic horror that builds dread from ordinary detail.',
  },
  {
    id: 'work-sff-the-exorcist', kind: 'work', name: 'The Exorcist', author: 'William Peter Blatty', year: 1971, language: 'English', region: 'United States',
    genres: ['horror', 'occult fiction', 'supernatural fiction'], kw: ['blatty', 'possession', 'priests', 'faith and doubt', 'bestselling horror', 'demonic possession'], confidence: 'established',
    summary: 'A novel about the possession of a young girl and the priests who try to help her; a best-selling horror novel that treats faith and doubt alongside its shocks.',
  },
  {
    id: 'work-sff-carrie', kind: 'work', name: 'Carrie', author: 'Stephen King', year: 1974, language: 'English', region: 'United States',
    genres: ['horror', 'supernatural fiction', 'epistolary novel'], kw: ['king', 'telekinesis', 'bullying', 'first novel', 'documents and testimony', 'high school horror'], confidence: 'established',
    summary: 'King\'s first published novel, about a bullied teenager with telekinetic power, told partly through documents and testimony; a landmark of modern American horror.',
  },
  {
    id: 'work-sff-salems-lot', kind: 'work', name: "'Salem's Lot", author: 'Stephen King', year: 1975, language: 'English', region: 'United States',
    genres: ['horror', 'vampire fiction', 'small-town horror'], kw: ['king', 'maine town', 'vampire invasion', 'dracula update', 'small town decay', 'american vampire novel'], confidence: 'established',
    summary: 'A novel of vampires arriving in a small Maine town, which transposes Dracula into American small-town life and treats the community itself as the victim.',
  },
  {
    id: 'work-sff-interview-with-the-vampire', kind: 'work', name: 'Interview with the Vampire', author: 'Anne Rice', year: 1976, language: 'English', region: 'United States',
    genres: ['gothic fiction', 'vampire fiction', 'horror'], kw: ['rice', 'vampire chronicles', 'louis', 'vampire as narrator', 'new orleans gothic', 'moral burden of immortality'], confidence: 'established',
    summary: 'A novel in which a vampire tells his life to a young interviewer, treating vampirism as an inner life and a moral burden; it reshaped the vampire as a sympathetic narrator.',
  },
  {
    id: 'work-sff-the-shining', kind: 'work', name: 'The Shining', author: 'Stephen King', year: 1977, language: 'English', region: 'United States',
    genres: ['horror', 'haunted house fiction', 'psychological horror'], kw: ['king', 'overlook hotel', 'caretaker family', 'addiction and family violence', 'isolation', 'haunted hotel'], confidence: 'established',
    summary: 'A novel about a family wintering as caretakers of an isolated hotel, mixing supernatural horror with a study of addiction and family violence.',
  },
  {
    id: 'work-sff-ghost-story-straub', kind: 'work', name: 'Ghost Story', author: 'Peter Straub', year: 1979, language: 'English', region: 'United States',
    genres: ['horror', 'ghost story', 'literary horror'], kw: ['straub', 'chowder society', 'story within a story', 'small town ghost story', 'literary horror', 'shared past'], confidence: 'established',
    summary: 'A novel of elderly friends in a New England town who tell ghost tales while haunted by a shared past; a literary horror novel about storytelling and guilt.',
  },
  {
    id: 'work-sff-the-woman-in-black', kind: 'work', name: 'The Woman in Black', author: 'Susan Hill', year: 1983, language: 'English', region: 'United Kingdom',
    genres: ['ghost story', 'gothic fiction', 'novella'], kw: ['hill', 'eel marsh house', 'traditional ghost story', 'causeway', 'british ghost story', 'edwardian setting'], confidence: 'established',
    summary: 'A novella that deliberately follows the traditional English ghost story, set in a remote house reached by a tidal causeway; a modern example of restraint and slow-building dread.',
  },
  {
    id: 'work-sff-books-of-blood', kind: 'work', name: 'Books of Blood', author: 'Clive Barker', year: 1984, language: 'English', region: 'United Kingdom',
    genres: ['horror', 'short story collection', 'dark fantasy'], kw: ['barker', 'visceral horror', 'british horror', 'short story volumes', 'imaginative horror', 'body horror'], confidence: 'established',
    summary: 'A set of short-story volumes that brought a fresh, bodily and imaginative approach to 1980s horror, widening the genre\'s range of subject and style.',
  },
  {
    id: 'work-sff-it', kind: 'work', name: 'It', author: 'Stephen King', year: 1986, language: 'English', region: 'United States',
    genres: ['horror', 'supernatural fiction', 'small-town horror'], kw: ['king', 'derry', 'losers club', 'childhood and adulthood timelines', 'shape-shifting evil', 'long horror novel'], confidence: 'established',
    summary: 'A long novel moving between childhood and adulthood in a Maine town, as a group of friends confront a shape-shifting evil; it joins horror to a study of memory and friendship.',
  },
  {
    id: 'work-sff-ring', kind: 'work', name: 'Ring', author: 'Koji Suzuki', year: 1991, language: 'Japanese', region: 'Japan',
    genres: ['horror', 'supernatural thriller', 'J-horror'], kw: ['suzuki', 'ringu', 'cursed video tape', 'japanese horror', 'investigation structure', 'j-horror'], confidence: 'established',
    summary: 'A Japanese horror novel about a cursed video tape and a journalist\'s investigation; the origin of a long-running media franchise and a landmark of modern Japanese horror.',
  },
  // ---- Horror since 2000 ----
  {
    id: 'work-sff-house-of-leaves', kind: 'work', name: 'House of Leaves', author: 'Mark Z. Danielewski', year: 2000, language: 'English', region: 'United States',
    genres: ['horror', 'experimental fiction', 'metafiction'], kw: ['danielewski', 'ergodic literature', 'footnotes', 'typographic play', 'house larger inside', 'layered narrators'], confidence: 'established',
    summary: 'A novel built around a manuscript about a house that is larger inside than outside, with footnotes, shifting typography and layered narrators; a landmark of experimental horror.',
  },
  {
    id: 'work-sff-let-the-right-one-in', kind: 'work', name: 'Let the Right One In', author: 'John Ajvide Lindqvist', year: 2004, language: 'Swedish', region: 'Sweden',
    genres: ['horror', 'vampire fiction', 'social realism'], kw: ['lindqvist', 'lat den ratte komma in', 'swedish horror', 'bullied boy', 'housing estate', 'nordic horror'], confidence: 'established',
    summary: 'A Swedish novel about a bullied boy and a mysterious new neighbour in a bleak housing estate; a modern vampire novel that joins horror to social realism.',
  },
  {
    id: 'work-sff-the-little-stranger', kind: 'work', name: 'The Little Stranger', author: 'Sarah Waters', year: 2009, language: 'English', region: 'United Kingdom',
    genres: ['ghost story', 'gothic fiction', 'historical fiction'], kw: ['waters', 'postwar england', 'decaying country house', 'class anxiety', 'ambiguous haunting', 'doctor narrator'], confidence: 'established',
    summary: 'A ghost-story novel of a country doctor\'s relationship with a decaying house and its family in postwar England; it ties the haunting closely to class and social change.',
  },
  {
    id: 'work-sff-the-weird', kind: 'work', name: 'The Weird: A Compendium of Strange and Dark Stories', author: 'Ann VanderMeer and Jeff VanderMeer (editors)', year: 2011, language: 'English', region: 'United States',
    genres: ['weird fiction anthology', 'horror anthology'], kw: ['vandermeer', 'weird fiction', 'compendium', 'anthology', 'international weird', 'new weird background'], confidence: 'established',
    summary: 'A very large anthology tracing weird fiction from its beginnings in the nineteenth century to the present across many countries; a standard introduction to the tradition.',
  },
  {
    id: 'work-sff-fever-dream', kind: 'work', name: 'Fever Dream', author: 'Samanta Schweblin', year: 2014, language: 'Spanish', region: 'Argentina',
    genres: ['horror', 'ecological horror', 'literary fiction'], kw: ['schweblin', 'distancia de rescate', 'dialogue structure', 'poison and parenting', 'argentine horror', 'rescue distance'], confidence: 'established',
    summary: 'A short, tense novel told as a dialogue between a dying woman and a child, about poison and parenting in the Argentine countryside; first published in Spanish as Distancia de rescate.',
  },
  {
    id: 'work-sff-bird-box', kind: 'work', name: 'Bird Box', author: 'Josh Malerman', year: 2014, language: 'English', region: 'United States',
    genres: ['horror', 'post-apocalyptic fiction'], kw: ['malerman', 'blindfolded survival', 'sensory deprivation horror', 'mother and children', 'post-apocalyptic horror', 'unseen threat'], confidence: 'established',
    summary: 'A post-apocalyptic horror novel about a mother and her children in a world where seeing something can drive people mad; it builds fear from what cannot be seen.',
  },
  {
    id: 'work-sff-things-we-lost-in-the-fire', kind: 'work', name: 'Things We Lost in the Fire', author: 'Mariana Enríquez', year: 2016, language: 'Spanish', region: 'Argentina',
    genres: ['horror', 'short story collection', 'Latin American gothic'], kw: ['enriquez', 'las cosas que perdimos en el fuego', 'argentine gothic', 'social horror', 'buenos aires', 'ghost and city'], confidence: 'established',
    summary: 'A story collection of horror and the macabre in contemporary Argentina, rooted in social anxieties and in the memory of political violence; a leading work of Latin American gothic.',
  },
  {
    id: 'work-sff-the-ballad-of-black-tom', kind: 'work', name: 'The Ballad of Black Tom', author: 'Victor LaValle', year: 2016, language: 'English', region: 'United States',
    genres: ['cosmic horror', 'weird fiction', 'novella', 'literary response'], kw: ['lavalle', 'lovecraft response', 'harlem', 'racism in horror', 'retelling', 'novella'], confidence: 'established',
    summary: 'A novella that retells a Lovecraft story from the viewpoint of a Black musician in 1920s Harlem; it answers the racism in the original while keeping its cosmic dread.',
  },
  {
    id: 'work-sff-mexican-gothic', kind: 'work', name: 'Mexican Gothic', author: 'Silvia Moreno-Garcia', year: 2020, language: 'English', region: 'Canada and Mexico',
    genres: ['gothic fiction', 'horror', 'historical fiction'], kw: ['moreno-garcia', 'haunted mansion', '1950s mexico', 'colonial history', 'gothic romance', 'mexican gothic'], confidence: 'established',
    summary: 'A gothic horror novel set in 1950s Mexico, in which a young woman visits her cousin in a remote mansion; it recasts gothic conventions through Mexican history and colonial legacy.',
  },
  {
    id: 'work-sff-the-only-good-indians', kind: 'work', name: 'The Only Good Indians', author: 'Stephen Graham Jones', year: 2020, language: 'English', region: 'United States',
    genres: ['horror', 'Indigenous horror', 'supernatural fiction'], kw: ['jones', 'blackfeet', 'hunting incident', 'revenge and consequences', 'native american horror', 'indigenous horror'], confidence: 'established',
    summary: 'A horror novel about four Blackfeet men haunted by a hunting incident from their youth, with Native characters and concerns at its centre; a leading work of contemporary Indigenous horror.',
  },
];
