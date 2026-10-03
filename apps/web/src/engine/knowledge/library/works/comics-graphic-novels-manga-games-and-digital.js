// Notable works: comics, graphic novels, manga, webcomics, interactive fiction, narrative games, electronic literature,
// web serials, light novels, television series noted for their writing, and radio and audio drama.
// Reference records only: each entry names a real work, its creators, its first-publication (or first-broadcast, first-release) year
// and original language, with one neutral sentence on what it is and why it matters. No plot spoilers, no quotations.
// For serialised works the year is the start of the serial or first appearance. See ../README.md for the record format.
export const PREFIX = 'work-scr-';
export default [
  // ---- Newspaper strips and early American comics ----
  {
    id: "work-scr-the-yellow-kid", kind: 'work', name: "The Yellow Kid", author: "Richard F. Outcault", year: 1895, language: "English", region: "United States", confidence: 'established',
    genres: ["comic strip", "humour comic"], kw: ["outcault", "hogans alley", "early comics", "newspaper comic", "colour printing"],
    summary: "A colour newspaper comic about the children of a crowded city alley, centred on a bald child in a yellow nightshirt, often cited in histories of the American comic strip.",
  },
  {
    id: "work-scr-little-nemo-in-slumberland", kind: 'work', name: "Little Nemo in Slumberland", author: "Winsor McCay", year: 1905, language: "English", region: "United States", confidence: 'established',
    genres: ["comic strip", "fantasy", "dream narrative"], kw: ["mccay", "sunday strip", "dream comic", "page layout", "early comics"],
    summary: "A full-page Sunday newspaper comic in which a boy has elaborate dreams and wakes in the final panel, admired for its architectural page designs and play with panel size and perspective.",
  },
  {
    id: "work-scr-krazy-kat", kind: 'work', name: "Krazy Kat", author: "George Herriman", year: 1913, language: "English", region: "United States", confidence: 'established',
    genres: ["comic strip", "surreal humour"], kw: ["herriman", "ignatz", "offissa pup", "coconino county", "dialect"],
    summary: "A comic strip about a cat, a mouse and a dog in a shifting desert landscape, noted for its inventive dialect, poetic captions and a recurring loop of affection and thrown bricks.",
  },
  {
    id: "work-scr-gasoline-alley", kind: 'work', name: "Gasoline Alley", author: "Frank King", year: 1918, language: "English", region: "United States", confidence: 'established',
    genres: ["comic strip", "family comic"], kw: ["frank king", "skeezix", "ageing characters", "newspaper strip", "daily life"],
    summary: "A newspaper strip that began as a gag strip about car culture and became notable for letting its characters grow older in step with its readers, a rarity among comics.",
  },
  {
    id: "work-scr-dick-tracy", kind: 'work', name: "Dick Tracy", author: "Chester Gould", year: 1931, language: "English", region: "United States", confidence: 'established',
    genres: ["comic strip", "crime fiction", "detective fiction"], kw: ["chester gould", "police detective", "crime strip", "gadgets", "villains"],
    summary: "A newspaper crime strip about a police detective, known for its angular art, grotesque villains and inventive gadgets, and an influence on later crime comics and film.",
  },
  {
    id: "work-scr-prince-valiant", kind: 'work', name: "Prince Valiant", author: "Hal Foster", year: 1937, language: "English", region: "United States", confidence: 'established',
    genres: ["comic strip", "historical adventure", "Arthurian fiction"], kw: ["hal foster", "arthurian", "sunday strip", "captions instead of balloons", "adventure strip"],
    summary: "A Sunday newspaper adventure set in the days of King Arthur, illustrated like classic book art and unusual in using captions beneath the pictures instead of speech balloons.",
  },
  {
    id: "work-scr-the-spirit", kind: 'work', name: "The Spirit", author: "Will Eisner", year: 1940, language: "English", region: "United States", confidence: 'established',
    genres: ["comic strip", "crime fiction", "superhero comic"], kw: ["eisner", "newspaper insert", "splash page", "cinematic layout", "masked crime fighter"],
    summary: "A weekly newspaper-insert comic about a masked crime fighter, admired for its cinematic layouts and for opening pages in which the title lettering becomes part of the scene.",
  },
  {
    id: "work-scr-action-comics-no-1", kind: 'work', name: "Action Comics No. 1", author: "Jerry Siegel and Joe Shuster", year: 1938, language: "English", region: "United States", confidence: 'established',
    genres: ["superhero comic", "comic book"], kw: ["superman", "siegel and shuster", "golden age", "first superhero", "comic book origins"],
    summary: "The comic book issue in which Superman first appeared, widely taken as the start of the superhero genre and of the American comic book industry's golden age.",
  },
  {
    id: "work-scr-detective-comics-no-27", kind: 'work', name: "Detective Comics No. 27", author: "Bob Kane and Bill Finger", year: 1939, language: "English", region: "United States", confidence: 'established',
    genres: ["superhero comic", "crime fiction", "comic book"], kw: ["batman", "bob kane", "bill finger", "golden age", "masked vigilante"],
    summary: "The issue that introduced Batman, a masked vigilante without superpowers who works as a detective, bringing pulp crime and noir moods into early superhero comics.",
  },
  {
    id: "work-scr-wonder-woman-marston", kind: 'work', name: "Wonder Woman", author: "William Moulton Marston and H. G. Peter", year: 1941, language: "English", region: "United States", confidence: 'established',
    genres: ["superhero comic", "comic book"], kw: ["marston", "h g peter", "golden age", "female superhero", "amazon"],
    summary: "A superhero series that introduced a warrior princess from a hidden island of Amazons, one of the earliest and most enduring female leads in American comic books.",
  },
  {
    id: "work-scr-captain-america-comics", kind: 'work', name: "Captain America Comics", author: "Joe Simon and Jack Kirby", year: 1941, language: "English", region: "United States", confidence: 'established',
    genres: ["superhero comic", "war comic"], kw: ["simon and kirby", "golden age", "patriotic hero", "wartime comics", "marvel"],
    summary: "A wartime superhero comic that debuted before the United States entered the Second World War, showing how comic books reflected and shaped popular politics.",
  },
  {
    id: "work-scr-archie", kind: 'work', name: "Archie", author: "Bob Montana, John L. Goldwater and Vic Bloom", year: 1941, language: "English", region: "United States", confidence: 'established',
    genres: ["teen comic", "humour comic"], kw: ["archie andrews", "riverdale", "teen humour", "betty and veronica", "comic book"],
    summary: "A humour comic about teenagers in the small town of Riverdale, whose love triangle and everyday gags made it a staple of American teen comics for decades.",
  },
  {
    id: "work-scr-mad-kurtzman", kind: 'work', name: "Mad", author: "Harvey Kurtzman and William Gaines", year: 1952, language: "English", region: "United States", confidence: 'established',
    genres: ["satire", "humour comic", "parody"], kw: ["mad magazine", "kurtzman", "ec comics", "parody comics", "american satire"],
    summary: "A humour comic book, later a magazine, that parodied films, advertising and other comics, and became a lasting model for American satire and for the underground comics that followed.",
  },
  {
    id: "work-scr-peanuts", kind: 'work', name: "Peanuts", author: "Charles M. Schulz", year: 1950, language: "English", region: "United States", confidence: 'established',
    genres: ["comic strip", "humour comic"], kw: ["schulz", "charlie brown", "snoopy", "newspaper strip", "children in comics"],
    summary: "A newspaper strip about a group of children and a beagle, noted for its spare line, quiet melancholy and gentle philosophical humour across fifty years of daily publication.",
  },
  {
    id: "work-scr-pogo", kind: 'work', name: "Pogo", author: "Walt Kelly", year: 1948, language: "English", region: "United States", confidence: 'established',
    genres: ["comic strip", "political satire", "animal fable"], kw: ["walt kelly", "okefenokee swamp", "dialect humour", "wordplay", "animal comic"],
    summary: "A newspaper strip set in a Georgia swamp whose animal cast speaks in rich dialect and wordplay, often used for political allegory and satire.",
  },
  {
    id: "work-scr-doonesbury", kind: 'work', name: "Doonesbury", author: "Garry Trudeau", year: 1970, language: "English", region: "United States", confidence: 'established',
    genres: ["comic strip", "political satire"], kw: ["trudeau", "political comic", "newspaper strip", "campus comedy", "satire"],
    summary: "A newspaper strip of political and social satire following a recurring cast across decades, which won a Pulitzer Prize for editorial cartooning in 1975.",
  },
  {
    id: "work-scr-bloom-county", kind: 'work', name: "Bloom County", author: "Berkeley Breathed", year: 1980, language: "English", region: "United States", confidence: 'established',
    genres: ["comic strip", "political satire", "surreal humour"], kw: ["breathed", "opus the penguin", "newspaper strip", "1980s comics", "satire"],
    summary: "A newspaper strip about children and animals in a small town that mixes political satire with surreal comedy and running jokes.",
  },
  {
    id: "work-scr-the-far-side", kind: 'work', name: "The Far Side", author: "Gary Larson", year: 1980, language: "English", region: "United States", confidence: 'established',
    genres: ["single-panel cartoon", "absurdist humour"], kw: ["larson", "single panel", "cartoon captions", "animal humour", "science humour"],
    summary: "A single-panel cartoon series of absurd animal, scientific and domestic scenes, known for deadpan captions and humour that depends on a sudden shift in logic.",
  },
  {
    id: "work-scr-calvin-and-hobbes", kind: 'work', name: "Calvin and Hobbes", author: "Bill Watterson", year: 1985, language: "English", region: "United States", confidence: 'established',
    genres: ["comic strip", "humour comic", "fantasy"], kw: ["watterson", "calvin", "hobbes", "childhood imagination", "newspaper strip"],
    summary: "A newspaper strip about a six-year-old boy and his stuffed tiger, who appears to him as a living companion, noted for its imaginative fantasies and its warm treatment of childhood.",
  },
  {
    id: "work-scr-dykes-to-watch-out-for", kind: 'work', name: "Dykes to Watch Out For", author: "Alison Bechdel", year: 1983, language: "English", region: "United States", confidence: 'established',
    genres: ["comic strip", "serial comic", "slice-of-life"], kw: ["bechdel", "lesbian comics", "serial strip", "ensemble cast", "political comedy"],
    summary: "A long-running serial strip following a circle of friends in a fictional American city, noted for its ensemble storytelling, political commentary and early representation of lesbian lives in comics.",
  },

  // ---- Superhero comics, the Marvel age and the British invasion ----
  {
    id: "work-scr-fantastic-four-no-1", kind: 'work', name: "Fantastic Four No. 1", author: "Stan Lee and Jack Kirby", year: 1961, language: "English", region: "United States", confidence: 'established',
    genres: ["superhero comic", "science fiction"], kw: ["stan lee", "jack kirby", "marvel comics", "silver age", "superhero team"],
    summary: "The first issue of the series usually credited with launching Marvel's shared superhero universe, featuring heroes who argue and have personal troubles as well as powers.",
  },
  {
    id: "work-scr-amazing-fantasy-no-15", kind: 'work', name: "Amazing Fantasy No. 15", author: "Stan Lee and Steve Ditko", year: 1962, language: "English", region: "United States", confidence: 'established',
    genres: ["superhero comic"], kw: ["spider-man", "stan lee", "steve ditko", "silver age", "teenage hero"],
    summary: "The issue that introduced Spider-Man, a teenage hero with money worries, family duties and self-doubt, which helped define the more human, flawed superhero of Marvel comics.",
  },
  {
    id: "work-scr-x-men-lee-kirby", kind: 'work', name: "X-Men", author: "Stan Lee and Jack Kirby", year: 1963, language: "English", region: "United States", confidence: 'established',
    genres: ["superhero comic", "science fiction"], kw: ["mutants", "marvel comics", "stan lee", "jack kirby", "prejudice allegory"],
    summary: "A superhero series about mutants who are feared by the society they protect, often read as an allegory for prejudice and later developed by many writers into a vast shared saga.",
  },
  {
    id: "work-scr-v-for-vendetta", kind: 'work', name: "V for Vendetta", author: "Alan Moore and David Lloyd", year: 1982, language: "English", region: "United Kingdom", confidence: 'established',
    genres: ["dystopian fiction", "graphic novel", "political thriller"], kw: ["alan moore", "david lloyd", "warrior magazine", "anarchist", "near-future britain"],
    summary: "A dystopian story of a masked anarchist in a near-future fascist Britain, first serialised in a British anthology magazine and later completed at an American publisher.",
  },
  {
    id: "work-scr-judge-dredd", kind: 'work', name: "Judge Dredd", author: "John Wagner and Carlos Ezquerra", year: 1977, language: "English", region: "United Kingdom", confidence: 'established',
    genres: ["science fiction comic", "satire", "dystopian fiction"], kw: ["2000 ad", "mega-city one", "british comics", "wagner", "ezquerra"],
    summary: "A British science fiction comic about a lawman in a future megacity who acts as police, judge and executioner, using dark humour to satirise authority and consumer culture.",
  },
  {
    id: "work-scr-dan-dare", kind: 'work', name: "Dan Dare: Pilot of the Future", author: "Frank Hampson", year: 1950, language: "English", region: "United Kingdom", confidence: 'established',
    genres: ["science fiction comic", "adventure comic"], kw: ["eagle comic", "space pilot", "british comics", "hampson", "mekon"],
    summary: "A British space adventure starring an Earth pilot, first published in the Eagle weekly and noted for its detailed, carefully planned art and influence on later British comics.",
  },
  {
    id: "work-scr-watchmen", kind: 'work', name: "Watchmen", author: "Alan Moore and Dave Gibbons", year: 1986, language: "English", region: "United Kingdom and United States", confidence: 'established',
    genres: ["superhero comic", "graphic novel", "alternate history"], kw: ["alan moore", "dave gibbons", "dc comics", "deconstruction of superheroes", "twelve issues"],
    summary: "A twelve-issue series set in an alternate 1980s that examines power, politics and the superhero genre through interlocking stories, flashbacks and a fictional comic within the comic.",
  },
  {
    id: "work-scr-the-dark-knight-returns", kind: 'work', name: "The Dark Knight Returns", author: "Frank Miller", year: 1986, language: "English", region: "United States", confidence: 'established',
    genres: ["superhero comic", "dystopian fiction"], kw: ["batman", "frank miller", "dark superhero", "television news panels", "dc comics"],
    summary: "A four-issue story of an older Batman returning to action, told with dense news-broadcast panels and a bleak urban tone, and an influence on later darker superhero comics.",
  },
  {
    id: "work-scr-from-hell", kind: 'work', name: "From Hell", author: "Alan Moore and Eddie Campbell", year: 1989, language: "English", region: "United Kingdom", confidence: 'established',
    genres: ["historical fiction", "graphic novel", "crime fiction"], kw: ["jack the ripper", "alan moore", "eddie campbell", "victorian london", "research appendix"],
    summary: "A heavily researched graphic novel about the Whitechapel murders of 1888, accompanied by extensive notes on the sources and theories behind its imagined account.",
  },
  {
    id: "work-scr-the-sandman", kind: 'work', name: "The Sandman", author: "Neil Gaiman", year: 1989, language: "English", region: "United Kingdom and United States", confidence: 'established',
    genres: ["fantasy comic", "graphic novel", "mythic fiction"], kw: ["gaiman", "dream of the endless", "vertigo", "dc comics", "75 issues"],
    summary: "A monthly series of seventy-five issues about Dream, one of the Endless, that blends mythology, horror and literary allusion, and brought many new readers to comics.",
  },
  {
    id: "work-scr-marvels", kind: 'work', name: "Marvels", author: "Kurt Busiek and Alex Ross", year: 1994, language: "English", region: "United States", confidence: 'established',
    genres: ["superhero comic", "alternate viewpoint"], kw: ["busiek", "alex ross", "painted comics", "marvel history", "ordinary witness"],
    summary: "A four-issue series retelling decades of Marvel history through the eyes of an ordinary news photographer, noted for its realistic painted art and its focus on how the public sees heroes.",
  },
  {
    id: "work-scr-hellboy", kind: 'work', name: "Hellboy: Seed of Destruction", author: "Mike Mignola", year: 1994, language: "English", region: "United States", confidence: 'established',
    genres: ["supernatural comic", "pulp adventure", "horror comic"], kw: ["hellboy", "mignola", "dark horse", "occult detective", "folklore comics"],
    summary: "The first Hellboy story, introducing a demon raised to fight occult threats, blending pulp adventure, folklore and a distinctive heavy-shadow art style.",
  },
  {
    id: "work-scr-fables", kind: 'work', name: "Fables", author: "Bill Willingham", year: 2002, language: "English", region: "United States", confidence: 'established',
    genres: ["fantasy comic", "fairy-tale retelling", "urban fantasy"], kw: ["willingham", "vertigo", "fairy tale characters", "new york fantasy", "folklore"],
    summary: "A long-running series in which characters from fairy tales and folklore live in hidden exile in modern New York, mixing mystery, politics and fantasy.",
  },
  {
    id: "work-scr-y-the-last-man", kind: 'work', name: "Y: The Last Man", author: "Brian K. Vaughan and Pia Guerra", year: 2002, language: "English", region: "United States", confidence: 'established',
    genres: ["post-apocalyptic fiction", "science fiction comic"], kw: ["vaughan", "pia guerra", "vertigo", "post-apocalyptic", "gender and society"],
    summary: "A sixty-issue science fiction series that follows the apparent sole surviving male after a sudden catastrophe, using its premise to examine gender and society.",
  },
  {
    id: "work-scr-the-walking-dead-comic", kind: 'work', name: "The Walking Dead (comic series)", author: "Robert Kirkman, Tony Moore and Charlie Adlard", year: 2003, language: "English", region: "United States", confidence: 'established',
    genres: ["horror comic", "post-apocalyptic fiction"], kw: ["kirkman", "zombies", "image comics", "survival drama", "black and white comic"],
    summary: "A long-running black-and-white series of survival in a world overrun by zombies, focused on the people left alive rather than on the creatures.",
  },
  {
    id: "work-scr-saga", kind: 'work', name: "Saga", author: "Brian K. Vaughan and Fiona Staples", year: 2012, language: "English", region: "United States", confidence: 'established',
    genres: ["space opera", "fantasy comic", "family drama"], kw: ["vaughan", "fiona staples", "image comics", "ongoing series", "romance across enemy lines"],
    summary: "An ongoing space opera about two soldiers from warring worlds who try to raise their child, mixing fantasy, romance and war with a strong ensemble of side characters.",
  },
  {
    id: "work-scr-ms-marvel-2014", kind: 'work', name: "Ms. Marvel (Kamala Khan)", author: "G. Willow Wilson and Adrian Alphona", year: 2014, language: "English", region: "United States", confidence: 'established',
    genres: ["superhero comic", "young adult comic"], kw: ["kamala khan", "g willow wilson", "marvel", "teen superhero", "pakistani-american"],
    summary: "A superhero series about a Pakistani-American teenager in New Jersey who gains shape-changing powers, notable for grounding the genre in family, faith and school life.",
  },

  // ---- Independent, literary and autobiographical comics ----
  {
    id: "work-scr-zap-comix", kind: 'work', name: "Zap Comix", author: "Robert Crumb", year: 1968, language: "English", region: "United States", confidence: 'established',
    genres: ["underground comix", "satire"], kw: ["crumb", "underground comics", "counterculture", "comix", "head shops"],
    summary: "An underground comic book that launched the comix movement, with personal, satirical and taboo-breaking work sold outside the mainstream and the Comics Code.",
  },
  {
    id: "work-scr-a-contract-with-god", kind: 'work', name: "A Contract with God", author: "Will Eisner", year: 1978, language: "English", region: "United States", confidence: 'established',
    genres: ["graphic novel", "literary comics", "slice-of-life"], kw: ["eisner", "tenement stories", "bronx", "early graphic novel", "linked stories"],
    summary: "A book of linked stories about life in a Bronx tenement, issued as a book rather than a periodical and often credited with popularising the term graphic novel.",
  },
  {
    id: "work-scr-raw-anthology", kind: 'work', name: "Raw", author: "Art Spiegelman and Francoise Mouly", year: 1980, language: "English", region: "United States", confidence: 'established',
    genres: ["comics anthology", "avant-garde comics"], kw: ["spiegelman", "mouly", "oversized anthology", "alternative comics", "early maus"],
    summary: "An oversized avant-garde comics anthology that gave early space to many cartoonists from several countries and published the first chapters of Maus.",
  },
  {
    id: "work-scr-love-and-rockets", kind: 'work', name: "Love and Rockets", author: "Gilbert, Jaime and Mario Hernandez", year: 1981, language: "English", region: "United States", confidence: 'established',
    genres: ["independent comics", "literary comics", "magic realism"], kw: ["hernandez brothers", "palomar", "locas", "fantagraphics", "latino characters"],
    summary: "An independent comic series by three brothers that follows Latino characters in a Latin American village and in California, admired for decades of long-form character development.",
  },
  {
    id: "work-scr-maus", kind: 'work', name: "Maus", author: "Art Spiegelman", year: 1986, language: "English", region: "United States", confidence: 'established',
    genres: ["graphic memoir", "Holocaust literature", "biography"], kw: ["spiegelman", "holocaust memoir", "animal allegory", "graphic novel", "pulitzer"],
    summary: "A two-volume graphic memoir in which the author recounts his father's survival of the Holocaust, drawing Jews as mice and Germans as cats, awarded a special Pulitzer Prize in 1992.",
  },
  {
    id: "work-scr-bone", kind: 'work', name: "Bone", author: "Jeff Smith", year: 1991, language: "English", region: "United States", confidence: 'established',
    genres: ["fantasy comic", "adventure comic", "all-ages comic"], kw: ["jeff smith", "self-published", "black and white", "cousins", "epic fantasy"],
    summary: "A self-published black-and-white fantasy about three cousins lost in a strange valley, mixing slapstick comedy with the structure of an epic quest.",
  },
  {
    id: "work-scr-understanding-comics", kind: 'work', name: "Understanding Comics", author: "Scott McCloud", year: 1993, language: "English", region: "United States", confidence: 'established',
    genres: ["comics theory", "nonfiction comic"], kw: ["mccloud", "comics theory", "sequential art", "closure", "how comics work"],
    summary: "A book about how comics work, written and drawn as a comic, that explains ideas such as the gutter, closure and the range of image styles.",
  },
  {
    id: "work-scr-palestine-sacco", kind: 'work', name: "Palestine", author: "Joe Sacco", year: 1993, language: "English", region: "United States", confidence: 'established',
    genres: ["comics journalism", "nonfiction comic"], kw: ["joe sacco", "reportage", "occupied territories", "journalism comics", "first-person reporting"],
    summary: "A work of comics journalism built from the author's travels and interviews in the occupied territories in the early 1990s, drawn in the voice of a reporter who appears in the story.",
  },
  {
    id: "work-scr-safe-area-gorazde", kind: 'work', name: "Safe Area Gorazde", author: "Joe Sacco", year: 2000, language: "English", region: "United States", confidence: 'established',
    genres: ["comics journalism", "nonfiction comic", "war reportage"], kw: ["joe sacco", "bosnian war", "reportage", "eyewitness accounts", "journalism comics"],
    summary: "Comics reportage on the Bosnian war as experienced in one besieged town, assembled from interviews and the author's own visits as a reporter.",
  },
  {
    id: "work-scr-jimmy-corrigan", kind: 'work', name: "Jimmy Corrigan, the Smartest Kid on Earth", author: "Chris Ware", year: 2000, language: "English", region: "United States", confidence: 'established',
    genres: ["graphic novel", "literary comics"], kw: ["chris ware", "acme novelty library", "page design", "diagrammatic layout", "loneliness"],
    summary: "A graphic novel about a lonely man and his estranged father, shifting between two periods and noted for precise diagrammatic layouts and an unusually controlled use of colour and type.",
  },
  {
    id: "work-scr-fun-home-bechdel", kind: 'work', name: "Fun Home", author: "Alison Bechdel", year: 2006, language: "English", region: "United States", confidence: 'established',
    genres: ["graphic memoir", "coming-of-age memoir"], kw: ["bechdel", "family tragicomic", "literary allusion", "coming out", "memoir comic"],
    summary: "A graphic memoir about the author's relationship with her father, a funeral-home director and English teacher, and her own coming out, structured around literary references.",
  },
  {
    id: "work-scr-blankets", kind: 'work', name: "Blankets", author: "Craig Thompson", year: 2003, language: "English", region: "United States", confidence: 'established',
    genres: ["graphic memoir", "coming-of-age story"], kw: ["craig thompson", "first love", "religious upbringing", "brush line", "autobiographical comic"],
    summary: "An autobiographical graphic novel about growing up in a strict Christian family, first love and doubts about faith, drawn in a flowing brush line.",
  },
  {
    id: "work-scr-american-born-chinese", kind: 'work', name: "American Born Chinese", author: "Gene Luen Yang", year: 2006, language: "English", region: "United States", confidence: 'established',
    genres: ["graphic novel", "young adult comic", "magic realism"], kw: ["gene luen yang", "identity", "monkey king", "stereotypes", "immigrant experience"],
    summary: "A graphic novel that weaves three stories, one about a schoolboy, one drawn from the legend of the Monkey King and one in sitcom form, into a reflection on identity and stereotype.",
  },
  {
    id: "work-scr-daytripper", kind: 'work', name: "Daytripper", author: "Fabio Moon and Gabriel Ba", year: 2010, language: "English", region: "Brazil and United States", confidence: 'established',
    genres: ["graphic novel", "magic realism", "literary comics"], kw: ["twin brothers", "brazilian comics", "vertigo", "life and chance", "obituary writer"],
    summary: "A graphic novel by two Brazilian brothers in which each chapter centres on a different age in one man's life, reflecting on how chance and ordinary days shape a life.",
  },
  {
    id: "work-scr-scott-pilgrim", kind: 'work', name: "Scott Pilgrim", author: "Bryan Lee O'Malley", year: 2004, language: "English", region: "Canada", confidence: 'established',
    genres: ["graphic novel", "romantic comedy", "fantasy comic"], kw: ["o'malley", "toronto", "video game logic", "indie comics", "six volumes"],
    summary: "A six-volume black-and-white series about a young musician in Toronto who must defeat his new girlfriend's evil exes, combining video-game rules with indie romance.",
  },
  {
    id: "work-scr-this-one-summer", kind: 'work', name: "This One Summer", author: "Mariko Tamaki and Jillian Tamaki", year: 2014, language: "English", region: "Canada", confidence: 'established',
    genres: ["graphic novel", "young adult comic", "coming-of-age story"], kw: ["tamaki", "summer holiday", "friendship", "blue-toned art", "adolescence"],
    summary: "A graphic novel about two girls at a lake house for the summer, noted for its blue-toned art and its quiet treatment of friendship and the edge of adolescence.",
  },
  {
    id: "work-scr-march-lewis", kind: 'work', name: "March", author: "John Lewis, Andrew Aydin and Nate Powell", year: 2013, language: "English", region: "United States", confidence: 'established',
    genres: ["graphic memoir", "history comic"], kw: ["john lewis", "civil rights movement", "nate powell", "trilogy", "nonviolent protest"],
    summary: "A three-volume graphic memoir of the American civil rights movement told from the perspective of John Lewis, drawn in black and white by Nate Powell.",
  },
  {
    id: "work-scr-smile-telgemeier", kind: 'work', name: "Smile", author: "Raina Telgemeier", year: 2010, language: "English", region: "United States", confidence: 'established',
    genres: ["graphic memoir", "middle-grade comic"], kw: ["telgemeier", "middle school", "dental injury", "kids graphic novel", "scholastic graphix"],
    summary: "A graphic memoir for young readers about the author's dental injuries and middle-school years, and a landmark in the rise of comics for children in libraries and bookstores.",
  },
  {
    id: "work-scr-new-kid", kind: 'work', name: "New Kid", author: "Jerry Craft", year: 2019, language: "English", region: "United States", confidence: 'established',
    genres: ["graphic novel", "middle-grade comic"], kw: ["jerry craft", "private school", "newbery medal", "kids graphic novel", "belonging"],
    summary: "A middle-grade graphic novel about a Black seventh-grader navigating a new private school, which won the Newbery Medal in 2020.",
  },
  {
    id: "work-scr-ethel-and-ernest", kind: 'work', name: "Ethel and Ernest", author: "Raymond Briggs", year: 1998, language: "English", region: "United Kingdom", confidence: 'established',
    genres: ["graphic memoir", "biography"], kw: ["raymond briggs", "working-class london", "parents biography", "twentieth century", "british comics"],
    summary: "A graphic biography of the author's parents, an ordinary London couple whose married life spans much of the twentieth century and its changes.",
  },

  // MORE
];
