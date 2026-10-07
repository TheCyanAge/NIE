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

  // ---- More newspaper strips and British comics ----
  {
    id: "work-scr-thimble-theatre-popeye", kind: 'work', name: "Thimble Theatre (Popeye)", author: "E. C. Segar", year: 1919, language: "English", region: "United States", confidence: 'established',
    genres: ["comic strip", "adventure comedy"], kw: ["segar", "popeye", "olive oyl", "newspaper strip", "sailor"],
    summary: "A newspaper strip that began in 1919 around Olive Oyl and her family; the sailor Popeye joined it in 1929 and grew into one of the best-known characters in American comics.",
  },
  {
    id: "work-scr-terry-and-the-pirates", kind: 'work', name: "Terry and the Pirates", author: "Milton Caniff", year: 1934, language: "English", region: "United States", confidence: 'established',
    genres: ["comic strip", "adventure fiction"], kw: ["caniff", "adventure strip", "china", "pilots", "shadow art"],
    summary: "An adventure strip set in China and the Pacific, admired for its cinematic, shadow-heavy drawing and for the memorable villains and allies who moved through its serial plots.",
  },
  {
    id: "work-scr-flash-gordon", kind: 'work', name: "Flash Gordon", author: "Alex Raymond", year: 1934, language: "English", region: "United States", confidence: 'established',
    genres: ["comic strip", "science fiction", "space opera"], kw: ["alex raymond", "mongo", "sunday strip", "space adventure", "planetary romance"],
    summary: "A Sunday science-fiction adventure strip set largely on the planet Mongo, noted for lavish illustration and for its influence on later space opera in comics and film.",
  },
  {
    id: "work-scr-lil-abner", kind: 'work', name: "Li'l Abner", author: "Al Capp", year: 1934, language: "English", region: "United States", confidence: 'established',
    genres: ["comic strip", "satire"], kw: ["al capp", "dogpatch", "social satire", "newspaper strip", "political humour"],
    summary: "A newspaper strip set in the backwoods town of Dogpatch that mixed broad comedy with social and political satire and ran for more than four decades.",
  },
  {
    id: "work-scr-for-better-or-for-worse", kind: 'work', name: "For Better or For Worse", author: "Lynn Johnston", year: 1979, language: "English", region: "Canada", confidence: 'established',
    genres: ["comic strip", "family comic"], kw: ["lynn johnston", "family strip", "ageing characters", "newspaper strip", "everyday life"],
    summary: "A family strip whose characters aged more or less in step with its readers, mixing everyday humour with storylines about illness, prejudice and loss.",
  },
  {
    id: "work-scr-the-beano", kind: 'work', name: "The Beano", author: "D. C. Thomson & Co.", year: 1938, language: "English", region: "United Kingdom", confidence: 'established',
    genres: ["children's comic", "humour comic"], kw: ["beano", "dennis the menace", "bash street kids", "british comics", "weekly comic"],
    summary: "A British weekly comic of short humour strips, home to Dennis the Menace and the Bash Street Kids, and central to the tradition of British children's comics.",
  },
  {
    id: "work-scr-2000-ad", kind: 'work', name: "2000 AD", author: "Pat Mills, John Wagner and others", year: 1977, language: "English", region: "United Kingdom", confidence: 'established',
    genres: ["comic anthology", "science fiction"], kw: ["2000 ad", "british comics", "weekly anthology", "judge dredd", "mills", "wagner"],
    summary: "A British weekly science-fiction anthology comic, the home of Judge Dredd, that gave early work to many writers and artists later prominent in American comics.",
  },

  // ---- More superhero, fantasy and genre comics ----
  {
    id: "work-scr-swamp-thing-wein-wrightson", kind: 'work', name: "Swamp Thing", author: "Len Wein and Bernie Wrightson", year: 1971, language: "English", region: "United States", confidence: 'established',
    genres: ["horror comic", "superhero comic"], kw: ["swamp thing", "len wein", "wrightson", "dc comics", "monster comic", "house of secrets"],
    summary: "A horror character introduced in a DC anthology story in 1971 and given his own series in 1972, a swamp creature with a human past that later writers repeatedly reinterpreted.",
  },
  {
    id: "work-scr-saga-of-the-swamp-thing", kind: 'work', name: "Saga of the Swamp Thing (Alan Moore run)", author: "Alan Moore, Stephen Bissette and John Totleben", year: 1984, language: "English", region: "United Kingdom", confidence: 'established',
    genres: ["horror comic", "fantasy"], kw: ["alan moore", "swamp thing", "bissette", "totleben", "literary horror", "ecology"],
    summary: "A run on the horror series that recast its title character as a plant elemental rather than a transformed man, helping open American mainstream comics to literary horror and ecological themes.",
  },
  {
    id: "work-scr-batman-year-one", kind: 'work', name: "Batman: Year One", author: "Frank Miller and David Mazzucchelli", year: 1987, language: "English", region: "United States", confidence: 'established',
    genres: ["superhero comic", "crime fiction", "origin story"], kw: ["batman", "frank miller", "mazzucchelli", "origin story", "gotham", "james gordon"],
    summary: "A retelling of Batman's first year in Gotham in a grounded, procedural tone, following both the new vigilante and a young police lieutenant, James Gordon.",
  },
  {
    id: "work-scr-batman-the-killing-joke", kind: 'work', name: "Batman: The Killing Joke", author: "Alan Moore and Brian Bolland", year: 1988, language: "English", region: "United Kingdom", confidence: 'established',
    genres: ["superhero comic", "psychological thriller"], kw: ["batman", "joker", "alan moore", "brian bolland", "one bad day", "origin of a villain"],
    summary: "A one-shot Batman and Joker story that sets out a possible origin for the villain around the idea that a single bad day can break a person.",
  },
  {
    id: "work-scr-the-league-of-extraordinary-gentlemen", kind: 'work', name: "The League of Extraordinary Gentlemen", author: "Alan Moore and Kevin O'Neill", year: 1999, language: "English", region: "United Kingdom", confidence: 'established',
    genres: ["steampunk", "adventure fiction", "pastiche"], kw: ["alan moore", "kevin o'neill", "literary mash-up", "victorian characters", "crossover", "pastiche"],
    summary: "A comic that gathers characters from Victorian and later popular fiction into one shared world, a much-discussed example of literary crossover and pastiche in comics.",
  },
  {
    id: "work-scr-all-star-superman", kind: 'work', name: "All-Star Superman", author: "Grant Morrison and Frank Quitely", year: 2005, language: "English", region: "United Kingdom", confidence: 'established',
    genres: ["superhero comic", "science fiction"], kw: ["superman", "grant morrison", "frank quitely", "twelve issues", "mythic storytelling"],
    summary: "A twelve-issue series of self-contained stories in which Superman knows his time is limited, praised for its warmth and for telling a mythic character in clear, economical episodes.",
  },
  {
    id: "work-scr-preacher", kind: 'work', name: "Preacher", author: "Garth Ennis and Steve Dillon", year: 1995, language: "English", region: "United Kingdom", confidence: 'established',
    genres: ["dark fantasy", "road story", "black comedy"], kw: ["garth ennis", "steve dillon", "jesse custer", "vertigo", "road comic", "mature readers"],
    summary: "A violent, darkly comic series for adult readers about a Texas minister, his ex-girlfriend and an Irish vampire crossing America in search of God.",
  },
  {
    id: "work-scr-sin-city", kind: 'work', name: "Sin City", author: "Frank Miller", year: 1991, language: "English", region: "United States", confidence: 'established',
    genres: ["noir", "crime fiction"], kw: ["frank miller", "black and white comics", "hardboiled", "dark horse", "pulp noir", "basin city"],
    summary: "A black-and-white crime series set in a corrupt city, with stark high-contrast art and hardboiled narration drawn from pulp noir.",
  },
  {
    id: "work-scr-monstress", kind: 'work', name: "Monstress", author: "Marjorie Liu and Sana Takeda", year: 2015, language: "English", region: "United States", confidence: 'established',
    genres: ["fantasy", "dark fantasy"], kw: ["marjorie liu", "sana takeda", "image comics", "matriarchal world", "worldbuilding", "war aftermath"],
    summary: "A fantasy series set in an Asian-inspired world scarred by a great war, noted for lavish, detailed art and morally tangled characters.",
  },
  {
    id: "work-scr-black-panther-lee-kirby", kind: 'work', name: "Black Panther (T'Challa)", author: "Stan Lee and Jack Kirby", year: 1966, language: "English", region: "United States", confidence: 'established',
    genres: ["superhero comic", "science fiction"], kw: ["black panther", "wakanda", "t'challa", "marvel comics", "fantastic four", "afrofuturism"],
    summary: "A king-turned-hero from the fictional African nation of Wakanda, introduced in Fantastic Four in 1966 and widely cited as the first major Black superhero in mainstream American comics.",
  },

  // ---- Alternative comics, graphic memoir and graphic nonfiction ----
  {
    id: "work-scr-ghost-world", kind: 'work', name: "Ghost World", author: "Daniel Clowes", year: 1997, language: "English", region: "United States", confidence: 'established',
    genres: ["graphic novel", "coming-of-age"], kw: ["daniel clowes", "eightball", "teenage friendship", "alternative comics", "suburban boredom"],
    summary: "A graphic novel about two teenage friends facing the end of high school, noted for its dry observation of suburban boredom and as a landmark of literary alternative comics.",
  },
  {
    id: "work-scr-black-hole-burns", kind: 'work', name: "Black Hole", author: "Charles Burns", year: 1995, language: "English", region: "United States", confidence: 'established',
    genres: ["graphic novel", "horror", "coming-of-age"], kw: ["charles burns", "teenage horror", "body horror", "1970s suburbia", "metaphor", "serialised comic"],
    summary: "A graphic novel serialised from 1995 and collected in 2005, in which a mysterious disease changes the bodies of 1970s teenagers, using horror imagery as a metaphor for adolescence.",
  },
  {
    id: "work-scr-asterios-polyp", kind: 'work', name: "Asterios Polyp", author: "David Mazzucchelli", year: 2009, language: "English", region: "United States", confidence: 'established',
    genres: ["graphic novel", "literary fiction"], kw: ["mazzucchelli", "visual style", "form and content", "architect", "colour as meaning", "marriage"],
    summary: "A graphic novel about an architecture professor whose visual style shifts with each character and mood, an example of drawing and colour carrying part of the story's meaning.",
  },
  {
    id: "work-scr-building-stories", kind: 'work', name: "Building Stories", author: "Chris Ware", year: 2012, language: "English", region: "United States", confidence: 'established',
    genres: ["graphic novel", "experimental fiction"], kw: ["chris ware", "boxed set", "chicago", "nonlinear reading", "book design", "apartment building"],
    summary: "A boxed set of booklets, broadsheets and folded pieces about the residents of one Chicago building, with no fixed reading order.",
  },
  {
    id: "work-scr-stuck-rubber-baby", kind: 'work', name: "Stuck Rubber Baby", author: "Howard Cruse", year: 1995, language: "English", region: "United States", confidence: 'established',
    genres: ["graphic novel", "historical fiction"], kw: ["howard cruse", "civil rights", "1960s south", "coming out", "lgbtq comics", "alabama"],
    summary: "A graphic novel about a young man in the 1960s American South coming to terms with his sexuality against the civil rights movement, an early long-form gay graphic novel.",
  },
  {
    id: "work-scr-are-you-my-mother", kind: 'work', name: "Are You My Mother?", author: "Alison Bechdel", year: 2012, language: "English", region: "United States", confidence: 'established',
    genres: ["graphic memoir"], kw: ["alison bechdel", "mother and daughter", "winnicott", "psychoanalysis", "memoir", "family relationships"],
    summary: "A graphic memoir about the author's relationship with her mother, interwoven with the ideas of the psychoanalyst Donald Winnicott and with her own writing life.",
  },
  {
    id: "work-scr-cant-we-talk-about-something-more-pleasant", kind: 'work', name: "Can't We Talk about Something More Pleasant?", author: "Roz Chast", year: 2014, language: "English", region: "United States", confidence: 'established',
    genres: ["graphic memoir"], kw: ["roz chast", "ageing parents", "caregiving", "new yorker cartoonist", "grief and humour", "memoir"],
    summary: "A graphic memoir by a New Yorker cartoonist about caring for her ageing parents, mixing cartoons and photographs, and humour with grief.",
  },
  {
    id: "work-scr-they-called-us-enemy", kind: 'work', name: "They Called Us Enemy", author: "George Takei, Justin Eisinger, Steven Scott and Harmony Becker", year: 2019, language: "English", region: "United States", confidence: 'established',
    genres: ["graphic memoir", "history"], kw: ["george takei", "internment camps", "japanese american history", "second world war", "childhood memoir"],
    summary: "A graphic memoir of the author's childhood in the American internment camps for people of Japanese ancestry during the Second World War.",
  },
  {
    id: "work-scr-the-tale-of-one-bad-rat", kind: 'work', name: "The Tale of One Bad Rat", author: "Bryan Talbot", year: 1994, language: "English", region: "United Kingdom", confidence: 'established',
    genres: ["graphic novel", "social realism"], kw: ["bryan talbot", "beatrix potter", "runaway teenager", "lake district", "trauma and recovery", "british graphic novel"],
    summary: "A British graphic novel about a young runaway working through trauma, with its story threaded through the life and landscapes of Beatrix Potter.",
  },
  {
    id: "work-scr-gemma-bovery", kind: 'work', name: "Gemma Bovery", author: "Posy Simmonds", year: 1999, language: "English", region: "United Kingdom", confidence: 'established',
    genres: ["graphic novel", "adaptation", "comedy of manners"], kw: ["posy simmonds", "madame bovary", "guardian serial", "baker narrator", "normandy", "classic novel retelling"],
    summary: "A graphic novel that transposes the plot of a classic French novel into modern Britain and Normandy, narrated by a local baker who watches events unfold.",
  },

  // ---- Franco-Belgian and European comics ----
  {
    id: "work-scr-becassine", kind: 'work', name: "Bécassine", author: "Joseph Pinchon and Caumery (Maurice Languereau)", year: 1905, language: "French", region: "France", confidence: 'established',
    genres: ["comic strip", "humour comic", "children's comic"], kw: ["becassine", "pinchon", "caumery", "early french comics", "breton maid", "la semaine de suzette"],
    summary: "A long-running French comic about a naive young housemaid from Brittany, first published in a girls' magazine and an early landmark of French-language comics.",
  },
  {
    id: "work-scr-lucky-luke", kind: 'work', name: "Lucky Luke", author: "Morris (Maurice de Bevere), later with René Goscinny", year: 1946, language: "French", region: "Belgium", confidence: 'established',
    genres: ["western comic", "parody", "humour comic"], kw: ["lucky luke", "morris", "goscinny", "franco-belgian comics", "comic western", "dalton brothers"],
    summary: "A Franco-Belgian comic western parody about a cowboy who draws faster than his shadow, with René Goscinny writing many of its best-known albums.",
  },
  {
    id: "work-scr-the-smurfs", kind: 'work', name: "The Smurfs (Les Schtroumpfs)", author: "Peyo (Pierre Culliford)", year: 1958, language: "French", region: "Belgium", confidence: 'established',
    genres: ["comic strip", "fantasy", "children's comic"], kw: ["smurfs", "schtroumpfs", "peyo", "belgian comics", "johan and peewit", "little blue creatures"],
    summary: "A Belgian comic about small blue creatures in a forest village, first appearing in 1958 as side characters in another series before becoming a franchise in their own right.",
  },
  {
    id: "work-scr-blake-and-mortimer", kind: 'work', name: "Blake and Mortimer", author: "Edgar P. Jacobs", year: 1946, language: "French", region: "Belgium", confidence: 'established',
    genres: ["adventure comic", "science fiction", "ligne claire"], kw: ["edgar p. jacobs", "ligne claire", "tintin magazine", "british heroes", "dense text", "franco-belgian comics"],
    summary: "A Franco-Belgian adventure series about a British scientist and a military intelligence officer, known for its detailed ligne claire drawing and text-rich, serial-style storytelling.",
  },
  {
    id: "work-scr-gaston-lagaffe", kind: 'work', name: "Gaston (Gaston Lagaffe)", author: "André Franquin", year: 1957, language: "French", region: "Belgium", confidence: 'established',
    genres: ["humour comic", "gag strip"], kw: ["gaston lagaffe", "franquin", "spirou magazine", "office comedy", "visual gags", "sound effects"],
    summary: "A gag series about a well-meaning, accident-prone office assistant at a comics magazine, known for inventive visual comedy and playful sound effects.",
  },
  {
    id: "work-scr-valerian-and-laureline", kind: 'work', name: "Valerian and Laureline", author: "Pierre Christin and Jean-Claude Mézières", year: 1967, language: "French", region: "France", confidence: 'established',
    genres: ["science fiction", "space opera", "comic series"], kw: ["valerian", "laureline", "christin", "mezieres", "pilote", "spatio-temporal agents"],
    summary: "A French science-fiction series about two agents who travel through space and time, admired for its inventive alien worlds and political storytelling, and a visual influence on later space opera.",
  },
  {
    id: "work-scr-corto-maltese", kind: 'work', name: "Corto Maltese", author: "Hugo Pratt", year: 1967, language: "Italian", region: "Italy", confidence: 'established',
    genres: ["adventure comic", "historical fiction"], kw: ["hugo pratt", "corto maltese", "ballad of the salt sea", "sailor adventurer", "italian comics", "literary comics"],
    summary: "An Italian adventure series about a sailor of fortune in the early twentieth century, appreciated for its literary tone, historical settings and moral ambiguity.",
  },
  {
    id: "work-scr-the-incal", kind: 'work', name: "The Incal", author: "Alejandro Jodorowsky and Moebius (Jean Giraud)", year: 1980, language: "French", region: "France", confidence: 'established',
    genres: ["science fiction", "space opera", "comic series"], kw: ["incal", "jodorowsky", "moebius", "metal hurlant", "john difool", "adult fantasy"],
    summary: "A science-fiction comic series about a down-at-heel detective drawn into a cosmic struggle, first serialised in Metal Hurlant and influential on later visual science fiction.",
  },
  {
    id: "work-scr-persepolis", kind: 'work', name: "Persepolis", author: "Marjane Satrapi", year: 2000, language: "French", region: "France", confidence: 'established',
    genres: ["graphic memoir", "coming-of-age"], kw: ["marjane satrapi", "iran", "iranian revolution", "childhood memoir", "black and white art", "l'association"],
    summary: "A graphic memoir in stark black and white about growing up in Iran during and after the 1979 revolution, first published in French in several volumes from 2000.",
  },
  {
    id: "work-scr-blacksad", kind: 'work', name: "Blacksad", author: "Juan Díaz Canales and Juanjo Guarnido", year: 2000, language: "French", region: "Spain", confidence: 'established',
    genres: ["noir", "detective fiction", "anthropomorphic comic"], kw: ["blacksad", "diaz canales", "guarnido", "animal characters", "detective noir", "dargaud"],
    summary: "A noir detective series with animal characters set in the 1950s United States, written by a Spanish author and drawn by a Spanish artist and first published in French.",
  },
  {
    id: "work-scr-the-arab-of-the-future", kind: 'work', name: "The Arab of the Future (L'Arabe du futur)", author: "Riad Sattouf", year: 2014, language: "French", region: "France", confidence: 'established',
    genres: ["graphic memoir", "autobiography"], kw: ["riad sattouf", "childhood memoir", "libya", "syria", "family and politics", "child's viewpoint"],
    summary: "A multi-volume graphic memoir of a French-Syrian childhood spent partly in Libya and Syria, told largely from a child's point of view.",
  },
  {
    id: "work-scr-aya-of-yop-city", kind: 'work', name: "Aya de Yopougon", author: "Marguerite Abouet and Clément Oubrerie", year: 2005, language: "French", region: "Ivory Coast", confidence: 'established',
    genres: ["graphic novel", "comedy of manners", "coming-of-age"], kw: ["aya", "yopougon", "marguerite abouet", "oubrerie", "abidjan", "african comics", "1970s"],
    summary: "A comic about a young woman and her friends in a working-class district of Abidjan in the late 1970s, an affectionate, humorous portrait of everyday life in Ivory Coast.",
  },
  {
    id: "work-scr-the-rabbis-cat", kind: 'work', name: "The Rabbi's Cat (Le Chat du rabbin)", author: "Joann Sfar", year: 2002, language: "French", region: "France", confidence: 'established',
    genres: ["graphic novel", "fable", "historical fiction"], kw: ["joann sfar", "talking cat", "algiers", "jewish and muslim culture", "1930s", "philosophical comic"],
    summary: "A graphic novel narrated by a talking cat living with a rabbi's family in 1930s Algiers, a humorous look at faith, identity and truth-telling.",
  },
  {
    id: "work-scr-epileptic", kind: 'work', name: "Epileptic (L'Ascension du Haut Mal)", author: "David B. (Pierre-François Beauchard)", year: 1996, language: "French", region: "France", confidence: 'established',
    genres: ["graphic memoir"], kw: ["david b", "epilepsy", "family illness", "sibling memoir", "black and white art", "l'association"],
    summary: "A multi-volume graphic memoir about growing up with a brother's epilepsy and the family's search for cures, drawn in dense, imaginative black-and-white imagery.",
  },
  {
    id: "work-scr-the-photographer", kind: 'work', name: "The Photographer (Le Photographe)", author: "Emmanuel Guibert, Didier Lefèvre and Frédéric Lemercier", year: 2003, language: "French", region: "France", confidence: 'established',
    genres: ["graphic reportage", "graphic nonfiction"], kw: ["le photographe", "guibert", "lefevre", "afghanistan", "medecins sans frontieres", "photo and drawing"],
    summary: "A work of graphic reportage that combines drawn panels with photographs to follow a photographer's journey with a medical aid mission into Afghanistan in 1986.",
  },
  {
    id: "work-scr-pyongyang", kind: 'work', name: "Pyongyang", author: "Guy Delisle", year: 2003, language: "French", region: "Canada", confidence: 'established',
    genres: ["graphic travelogue", "graphic nonfiction"], kw: ["guy delisle", "north korea", "travel comics", "animation work", "observational humour", "journal comic"],
    summary: "A graphic travelogue about two months spent in North Korea's capital supervising animation work, told in a restrained, observational and gently humorous style.",
  },
  {
    id: "work-scr-mafalda", kind: 'work', name: "Mafalda", author: "Quino (Joaquín Salvador Lavado)", year: 1964, language: "Spanish", region: "Argentina", confidence: 'established',
    genres: ["comic strip", "social satire"], kw: ["mafalda", "quino", "argentine comics", "political humour", "child philosopher", "latin american comics"],
    summary: "An Argentine comic strip about a thoughtful, outspoken girl who questions the adult world, widely read across Latin America and in translation.",
  },
  {
    id: "work-scr-el-eternauta", kind: 'work', name: "El Eternauta", author: "Héctor Germán Oesterheld and Francisco Solano López", year: 1957, language: "Spanish", region: "Argentina", confidence: 'established',
    genres: ["science fiction", "comic series"], kw: ["el eternauta", "oesterheld", "solano lopez", "argentine comics", "alien invasion", "buenos aires"],
    summary: "An Argentine science-fiction comic about survivors of a deadly snowfall and an alien invasion in Buenos Aires, a landmark of Latin American comics read for its political resonance.",
  },
  {
    id: "work-scr-condorito", kind: 'work', name: "Condorito", author: "Pepo (René Ríos Boettiger)", year: 1949, language: "Spanish", region: "Chile", confidence: 'established',
    genres: ["humour comic", "gag strip"], kw: ["condorito", "pepo", "chilean comics", "gag comic", "latin american humour", "okey magazine"],
    summary: "A Chilean gag comic about a condor in a small town, famous for its visual puns and running gags.",
  },
  {
    id: "work-scr-diabolik", kind: 'work', name: "Diabolik", author: "Angela and Luciana Giussani", year: 1962, language: "Italian", region: "Italy", confidence: 'established',
    genres: ["crime fiction", "pocket comic", "thriller"], kw: ["diabolik", "giussani", "italian comics", "fumetti neri", "master thief", "pocket-sized comics"],
    summary: "An Italian comic about a master thief with a talent for disguise, published in pocket-sized volumes and central to Italian popular comics.",
  },
  {
    id: "work-scr-dylan-dog", kind: 'work', name: "Dylan Dog", author: "Tiziano Sclavi", year: 1986, language: "Italian", region: "Italy", confidence: 'established',
    genres: ["horror comic", "supernatural fiction"], kw: ["dylan dog", "sclavi", "bonelli", "italian horror comics", "nightmare investigator", "london setting"],
    summary: "An Italian horror comic series about a London investigator of the supernatural, known for blending gothic horror with surreal, melancholic storytelling.",
  },
  {
    id: "work-scr-tex", kind: 'work', name: "Tex", author: "Gian Luigi Bonelli and Aurelio Galleppini", year: 1948, language: "Italian", region: "Italy", confidence: 'established',
    genres: ["western comic", "adventure comic"], kw: ["tex willer", "bonelli", "galleppini", "italian western comic", "fumetti", "ranger"],
    summary: "An Italian western comic about a ranger of the American frontier, one of the longest-running and best-selling comic series in Italy.",
  },
  {
    id: "work-scr-suske-en-wiske", kind: 'work', name: "Suske en Wiske (Spike and Suzy)", author: "Willy Vandersteen", year: 1945, language: "Dutch", region: "Belgium", confidence: 'established',
    genres: ["adventure comic", "children's comic"], kw: ["suske en wiske", "vandersteen", "flemish comics", "dutch-language comics", "spike and suzy", "time travel adventures"],
    summary: "A Flemish adventure comic about two children and their friends travelling through time and space, among the best-loved comics in Dutch-language Europe.",
  },

  // ---- Comics from India, the Middle East and China ----
  {
    id: "work-scr-amar-chitra-katha", kind: 'work', name: "Amar Chitra Katha", author: "Anant Pai (founding editor)", year: 1967, language: "English", region: "India", confidence: 'established',
    genres: ["educational comic", "mythology", "biography"], kw: ["amar chitra katha", "anant pai", "indian mythology", "illustrated classics", "history comics", "indian comics"],
    summary: "An Indian comic series that retells myths, legends and historical biographies in illustrated form, published in English and many Indian languages, and a childhood staple for generations of readers.",
  },
  {
    id: "work-scr-corridor-banerjee", kind: 'work', name: "Corridor", author: "Sarnath Banerjee", year: 2004, language: "English", region: "India", confidence: 'established',
    genres: ["graphic novel", "literary fiction"], kw: ["sarnath banerjee", "delhi", "indian graphic novel", "urban life", "city stories", "early indian graphic novel"],
    summary: "An early Indian graphic novel that follows a loosely connected group of city dwellers through Delhi, in an observational and wry style.",
  },
  {
    id: "work-scr-metro-el-shafee", kind: 'work', name: "Metro", author: "Magdy El Shafee", year: 2008, language: "Arabic", region: "Egypt", confidence: 'established',
    genres: ["graphic novel", "dystopian fiction", "social satire"], kw: ["magdy el shafee", "cairo", "egyptian comics", "arabic graphic novel", "corruption", "heist"],
    summary: "An Arabic graphic novel set in Cairo about a young man's debt, corruption and a planned robbery, widely described as the first Egyptian graphic novel for adults and noted for its social criticism.",
  },
  {
    id: "work-scr-sanmao", kind: 'work', name: "Sanmao (Three Hairs)", author: "Zhang Leping", year: 1935, language: "Chinese", region: "China", confidence: 'established',
    genres: ["comic strip", "social satire"], kw: ["sanmao", "zhang leping", "chinese comics", "manhua", "street child", "shanghai"],
    summary: "A Chinese comic series about a poor, scruffy boy with three hairs, begun in Shanghai in 1935 and long loved as a symbol of childhood hardship and resilience.",
  },

  // ---- Japanese manga: postwar founders and classics ----
  {
    id: "work-scr-sazae-san", kind: 'work', name: "Sazae-san", author: "Machiko Hasegawa", year: 1946, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "family comic", "comic strip"], kw: ["hasegawa", "sazae", "postwar japan", "family manga", "woman manga artist", "four-panel strip"],
    summary: "A long-running family comic strip about a cheerful young woman and her relatives in postwar Japan, and an early major work by a woman manga creator.",
  },
  {
    id: "work-scr-new-treasure-island", kind: 'work', name: "New Treasure Island (Shin Takarajima)", author: "Osamu Tezuka and Shichima Sakai", year: 1947, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "adventure comic"], kw: ["tezuka", "shin takarajima", "postwar manga", "cinematic panels", "story manga", "early tezuka"],
    summary: "An adventure manga whose film-like pacing and sweeping panels are often cited as a starting point for postwar story manga, and an early success for the young Osamu Tezuka.",
  },
  {
    id: "work-scr-jungle-emperor", kind: 'work', name: "Jungle Emperor (Kimba the White Lion)", author: "Osamu Tezuka", year: 1950, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "animal epic", "adventure comic"], kw: ["tezuka", "kimba", "white lion", "jungle taitei", "animal story", "early manga"],
    summary: "A manga about a white lion cub who grows up to rule the jungle, an early epic of animal life in postwar manga that was later adapted for television.",
  },
  {
    id: "work-scr-astro-boy", kind: 'work', name: "Astro Boy (Tetsuwan Atom)", author: "Osamu Tezuka", year: 1952, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "science fiction"], kw: ["tezuka", "tetsuwan atom", "robot boy", "mighty atom", "robots and humans", "early anime"],
    summary: "A manga about a robot boy with a human heart, serialised from 1952, which also became one of Japan's first television anime series and shaped later science-fiction manga.",
  },
  {
    id: "work-scr-phoenix-tezuka", kind: 'work', name: "Phoenix (Hi no Tori)", author: "Osamu Tezuka", year: 1954, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "epic", "science fiction"], kw: ["tezuka", "hi no tori", "immortality", "reincarnation", "life and death", "interlinked stories"],
    summary: "A series of linked stories from ancient to far-future ages, all circling a legendary bird whose blood grants immortality, which Tezuka returned to over several decades.",
  },
  {
    id: "work-scr-buddha-tezuka", kind: 'work', name: "Buddha", author: "Osamu Tezuka", year: 1972, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "historical fiction", "religious biography"], kw: ["tezuka", "siddhartha", "life of the buddha", "religious manga", "historical epic"],
    summary: "A manga retelling of the life of the historical Buddha, weaving invented companions and episodes of adventure around the traditional story.",
  },
  {
    id: "work-scr-black-jack", kind: 'work', name: "Black Jack", author: "Osamu Tezuka", year: 1973, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "medical drama"], kw: ["tezuka", "unlicensed surgeon", "medical ethics", "episodic manga", "doctor stories"],
    summary: "An episodic manga about a brilliant unlicensed surgeon who charges enormous fees, using each case to explore medical ethics and the value of a life.",
  },
  {
    id: "work-scr-barefoot-gen", kind: 'work', name: "Barefoot Gen (Hadashi no Gen)", author: "Keiji Nakazawa", year: 1973, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "historical fiction", "autobiographical fiction"], kw: ["nakazawa", "hiroshima", "atomic bomb", "war manga", "survivor story", "anti-war"],
    summary: "A semi-autobiographical manga about a boy and his family in Hiroshima before and after the atomic bombing, drawn from the author's own experience as a survivor.",
  },
  {
    id: "work-scr-onward-towards-our-noble-deaths", kind: 'work', name: "Onward Towards Our Noble Deaths", author: "Shigeru Mizuki", year: 1973, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "war fiction", "autobiographical fiction"], kw: ["mizuki", "new britain", "pacific war", "war memoir comic", "soldier's experience", "gekiga"],
    summary: "A fictionalised manga account of a Japanese army unit in the Pacific war, based on the author's own experience as a soldier in New Britain.",
  },
  {
    id: "work-scr-lone-wolf-and-cub", kind: 'work', name: "Lone Wolf and Cub", author: "Kazuo Koike and Goseki Kojima", year: 1970, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "samurai fiction", "historical fiction"], kw: ["koike", "kojima", "kozure okami", "samurai", "gekiga", "edo period", "father and son"],
    summary: "A samurai epic about a disgraced executioner and his infant son travelling through Edo-period Japan, noted for its long cinematic serial structure and spare, expressive drawing.",
  },
  {
    id: "work-scr-doraemon", kind: 'work', name: "Doraemon", author: "Fujiko F. Fujio", year: 1969, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "children's comic", "science fiction comedy"], kw: ["doraemon", "fujiko f. fujio", "robot cat", "time travel gadgets", "children's manga", "nobita"],
    summary: "A children's manga about a robot cat from the future who helps a schoolboy with fantastic gadgets, one of Japan's best-known characters.",
  },
  {
    id: "work-scr-ashita-no-joe", kind: 'work', name: "Ashita no Joe (Tomorrow's Joe)", author: "Asao Takamori and Tetsuya Chiba", year: 1968, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "sports fiction"], kw: ["ashita no joe", "boxing manga", "chiba", "takamori", "underdog story", "sports manga"],
    summary: "A boxing manga about an angry young drifter who finds purpose in the ring, widely seen as a defining work of sports manga.",
  },
  {
    id: "work-scr-the-rose-of-versailles", kind: 'work', name: "The Rose of Versailles", author: "Riyoko Ikeda", year: 1972, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "shojo manga", "historical fiction"], kw: ["riyoko ikeda", "versailles", "oscar", "french revolution", "shojo", "historical romance"],
    summary: "A shojo manga set around the French court before the Revolution, following a woman raised as a soldier, and a landmark of historical drama in girls' comics.",
  },
  {
    id: "work-scr-the-heart-of-thomas", kind: 'work', name: "The Heart of Thomas (Toma no shinzo)", author: "Moto Hagio", year: 1974, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "shojo manga", "coming-of-age"], kw: ["moto hagio", "year 24 group", "boys' school", "german setting", "psychological shojo", "grief and forgiveness"],
    summary: "A shojo manga set in a German boys' school, which helped shape the psychological, emotionally intense style of 1970s girls' comics and its generation of woman creators.",
  },

  // ---- Japanese manga: the 1980s to the 2000s ----
  {
    id: "work-scr-akira", kind: 'work', name: "Akira", author: "Katsuhiro Otomo", year: 1982, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "science fiction", "cyberpunk"], kw: ["otomo", "neo-tokyo", "biker gangs", "psychic powers", "dystopian manga", "detailed art"],
    summary: "A science-fiction manga set in a post-catastrophe Neo-Tokyo, about biker gangs, secret experiments and psychic power, whose detailed art influenced comics and animation worldwide.",
  },
  {
    id: "work-scr-nausicaa-manga", kind: 'work', name: "Nausicaa of the Valley of the Wind", author: "Hayao Miyazaki", year: 1982, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "fantasy", "post-apocalyptic fiction"], kw: ["miyazaki", "toxic jungle", "ecological fantasy", "princess", "animage", "epic manga"],
    summary: "An ecological fantasy manga about a princess in a world edged by a poisonous jungle, serialised for more than a decade; the 1984 film adapts only part of it.",
  },
  {
    id: "work-scr-dragon-ball", kind: 'work', name: "Dragon Ball", author: "Akira Toriyama", year: 1984, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "martial arts", "adventure comic"], kw: ["toriyama", "goku", "shonen", "journey to the west", "martial arts manga", "power escalation"],
    summary: "A martial-arts adventure manga, loosely inspired by a classic Chinese tale, about a boy with a monkey tail who seeks magical orbs; its fights and pacing shaped later shonen manga.",
  },
  {
    id: "work-scr-urusei-yatsura", kind: 'work', name: "Urusei Yatsura", author: "Rumiko Takahashi", year: 1978, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "romantic comedy", "science fiction comedy"], kw: ["rumiko takahashi", "alien girl", "lum", "slapstick", "romcom manga", "weekly shonen sunday"],
    summary: "A romantic-comedy manga about a lecherous student and an alien girl who declares herself his bride, and the first major hit by Rumiko Takahashi.",
  },
  {
    id: "work-scr-ranma-one-half", kind: 'work', name: "Ranma 1/2", author: "Rumiko Takahashi", year: 1987, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "martial arts comedy", "romantic comedy"], kw: ["ranma", "rumiko takahashi", "gender swap", "martial arts comedy", "slapstick", "shonen sunday"],
    summary: "A martial-arts romantic comedy about a teenage fighter who changes sex when splashed with cold water, pairing slapstick with playful treatment of gender.",
  },
  {
    id: "work-scr-sailor-moon", kind: 'work', name: "Sailor Moon", author: "Naoko Takeuchi", year: 1991, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "magical girl", "shojo manga"], kw: ["naoko takeuchi", "magical girl", "sailor guardians", "team of heroines", "shojo", "nakayoshi"],
    summary: "A magical-girl manga about schoolgirls who fight evil as sailor-suited warriors, which helped popularise the team-of-heroines format around the world.",
  },
  {
    id: "work-scr-slam-dunk", kind: 'work', name: "Slam Dunk", author: "Takehiko Inoue", year: 1990, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "sports fiction"], kw: ["takehiko inoue", "basketball manga", "sports manga", "underdog team", "shonen jump", "high school sports"],
    summary: "A basketball manga about a delinquent teenager who joins his school's team, hugely popular in Japan and across East Asia.",
  },
  {
    id: "work-scr-ghost-in-the-shell-manga", kind: 'work', name: "Ghost in the Shell", author: "Masamune Shirow", year: 1989, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "cyberpunk", "science fiction"], kw: ["masamune shirow", "cyborg", "identity and consciousness", "hackers", "networked future", "cyberpunk manga"],
    summary: "A cyberpunk manga about a cyborg security officer investigating hackers in a networked near future, exploring identity, memory and what counts as a self.",
  },
  {
    id: "work-scr-berserk", kind: 'work', name: "Berserk", author: "Kentaro Miura", year: 1989, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "dark fantasy"], kw: ["kentaro miura", "mercenary swordsman", "dark fantasy manga", "fate and ambition", "detailed art", "medieval-style world"],
    summary: "A dark-fantasy manga about a mercenary swordsman in a brutal medieval-style world, long admired for its detailed art and its themes of fate, ambition and survival.",
  },
  {
    id: "work-scr-monster-urasawa", kind: 'work', name: "Monster", author: "Naoki Urasawa", year: 1994, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "psychological thriller", "mystery"], kw: ["urasawa", "manhunt", "surgeon", "europe setting", "thriller manga", "moral questions"],
    summary: "A suspense manga about a surgeon who is pulled into a manhunt across Europe after saving a boy's life, praised for its thriller plotting and its questions about moral responsibility.",
  },
  {
    id: "work-scr-20th-century-boys", kind: 'work', name: "20th Century Boys", author: "Naoki Urasawa", year: 1999, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "mystery", "science fiction thriller"], kw: ["urasawa", "childhood friends", "cult leader", "dual timeline", "mystery manga", "nostalgia"],
    summary: "A mystery manga that moves between the 1960s and a dystopian near future as old friends confront a cult figure tied to their childhood games.",
  },
  {
    id: "work-scr-pluto-urasawa", kind: 'work', name: "Pluto", author: "Naoki Urasawa and Takashi Nagasaki, after Osamu Tezuka", year: 2003, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "science fiction", "detective fiction"], kw: ["urasawa", "astro boy reimagined", "robot detective", "robot murders", "tezuka homage", "mystery manga"],
    summary: "A mystery series that reimagines a classic Astro Boy story as a detective tale about murdered robots and humans, an homage with its own serious tone.",
  },
  {
    id: "work-scr-one-piece", kind: 'work', name: "One Piece", author: "Eiichiro Oda", year: 1997, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "adventure comic", "shonen manga"], kw: ["eiichiro oda", "pirates", "shonen jump", "worldbuilding", "found family", "long-running manga"],
    summary: "A pirate-adventure manga about a young captain and his crew searching for a legendary treasure, one of the best-selling manga series of all time and known for elaborate worldbuilding.",
  },
  {
    id: "work-scr-naruto", kind: 'work', name: "Naruto", author: "Masashi Kishimoto", year: 1999, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "shonen manga", "ninja fiction"], kw: ["kishimoto", "ninja", "shonen jump", "outcast hero", "rivalry", "coming-of-age"],
    summary: "A ninja-adventure manga about an outcast boy who dreams of leading his village, with a long serialisation and a large international readership.",
  },
  {
    id: "work-scr-death-note", kind: 'work', name: "Death Note", author: "Tsugumi Ohba and Takeshi Obata", year: 2003, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "psychological thriller", "supernatural fiction"], kw: ["ohba", "obata", "notebook", "battle of wits", "detective versus criminal", "moral dilemma"],
    summary: "A psychological thriller about a student who finds a notebook that kills anyone whose name is written in it, and the detective who hunts him, built around a battle of wits.",
  },
  {
    id: "work-scr-fullmetal-alchemist", kind: 'work', name: "Fullmetal Alchemist", author: "Hiromu Arakawa", year: 2001, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "fantasy", "shonen manga"], kw: ["hiromu arakawa", "alchemy", "equivalent exchange", "brothers", "rules-based magic", "tight plotting"],
    summary: "A fantasy adventure about two brothers who use alchemy in an attempt to undo a family tragedy, praised for its carefully planned plot and its rules-based magic.",
  },
  {
    id: "work-scr-hunter-x-hunter", kind: 'work', name: "Hunter x Hunter", author: "Yoshihiro Togashi", year: 1998, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "adventure comic", "shonen manga"], kw: ["togashi", "nen", "power system", "rules and strategy", "shonen jump", "licensed hunters"],
    summary: "A fantasy adventure about a boy training to become a Hunter in search of his father, known for intricate rules in its power system and for strategy-driven fights.",
  },
  {
    id: "work-scr-fruits-basket", kind: 'work', name: "Fruits Basket", author: "Natsuki Takaya", year: 1998, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "shojo manga", "fantasy romance"], kw: ["natsuki takaya", "zodiac curse", "family drama", "found family", "healing", "shojo"],
    summary: "A shojo manga about an orphaned teenager who discovers that a family is cursed to turn into zodiac animals, blending comedy, romance and family drama.",
  },
  {
    id: "work-scr-cardcaptor-sakura", kind: 'work', name: "Cardcaptor Sakura", author: "CLAMP", year: 1996, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "magical girl", "shojo manga"], kw: ["clamp", "magical cards", "magical girl", "gentle tone", "nakayoshi", "ensemble cast"],
    summary: "A magical-girl manga about a schoolgirl who must recapture magical cards she accidentally released, noted for its gentle tone and strong supporting cast.",
  },
  {
    id: "work-scr-detective-conan", kind: 'work', name: "Detective Conan (Case Closed)", author: "Gosho Aoyama", year: 1994, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "mystery", "detective fiction"], kw: ["gosho aoyama", "case closed", "child detective", "puzzle mysteries", "shonen sunday", "long-running mystery"],
    summary: "A mystery manga about a teenage detective shrunk into a child's body, built on puzzle-driven cases and a long-running overarching plot.",
  },
  {
    id: "work-scr-nana-yazawa", kind: 'work', name: "Nana", author: "Ai Yazawa", year: 2000, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "josei manga", "drama"], kw: ["ai yazawa", "josei", "tokyo", "punk band", "female friendship", "relationships"],
    summary: "A josei manga about two young women, both named Nana, who share a Tokyo apartment, one a punk singer and one a romantic, known for realistic relationships and a bittersweet tone.",
  },
  {
    id: "work-scr-vinland-saga", kind: 'work', name: "Vinland Saga", author: "Makoto Yukimura", year: 2005, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "historical fiction", "adventure comic"], kw: ["yukimura", "vikings", "norse sagas", "revenge and peace", "historical manga", "seinen"],
    summary: "A historical manga set in the Viking age, loosely based on Icelandic saga accounts of Vinland, that follows a young warrior from revenge toward questions about violence and peace.",
  },
  {
    id: "work-scr-uzumaki", kind: 'work', name: "Uzumaki", author: "Junji Ito", year: 1998, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "horror"], kw: ["junji ito", "spirals", "body horror", "cosmic dread", "horror manga", "obsession"],
    summary: "A horror manga in which a coastal town becomes obsessed with spirals, admired as a model of building dread from a single strange idea.",
  },

  // ---- Japanese manga: the 2010s and after, and a manga history ----
  {
    id: "work-scr-attack-on-titan", kind: 'work', name: "Attack on Titan", author: "Hajime Isayama", year: 2009, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "dark fantasy", "shonen manga"], kw: ["isayama", "giants", "walled city", "revelations", "shingeki no kyojin", "moral complexity"],
    summary: "A dark-fantasy manga in which humanity lives behind walls to escape giant man-eating creatures, known for escalating revelations and shifting moral perspectives.",
  },
  {
    id: "work-scr-my-hero-academia", kind: 'work', name: "My Hero Academia", author: "Kohei Horikoshi", year: 2014, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "superhero fiction", "shonen manga"], kw: ["horikoshi", "quirks", "hero academy", "shonen jump", "superhero manga", "coming-of-age"],
    summary: "A superhero manga set in a world where most people have powers, following a boy born without one who trains at a school for heroes.",
  },
  {
    id: "work-scr-demon-slayer", kind: 'work', name: "Demon Slayer", author: "Koyoharu Gotouge", year: 2016, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "dark fantasy", "shonen manga"], kw: ["gotouge", "kimetsu no yaiba", "demon hunter", "sibling story", "taisho era", "shonen jump"],
    summary: "A dark-fantasy manga set in early twentieth-century Japan about a boy who becomes a demon hunter in order to cure his sister.",
  },
  {
    id: "work-scr-jujutsu-kaisen", kind: 'work', name: "Jujutsu Kaisen", author: "Gege Akutami", year: 2018, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "supernatural fiction", "shonen manga"], kw: ["gege akutami", "curses", "sorcerers", "school setting", "shonen jump", "supernatural action"],
    summary: "A supernatural action manga about a high-school student who swallows a cursed object and joins a school of sorcerers who fight curses.",
  },
  {
    id: "work-scr-chainsaw-man", kind: 'work', name: "Chainsaw Man", author: "Tatsuki Fujimoto", year: 2018, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "dark comedy", "action comic"], kw: ["fujimoto", "devils", "chainsaw devil", "offbeat tone", "shonen jump", "unpredictable plot"],
    summary: "A dark-comic action manga about a young man who merges with a chainsaw devil and hunts devils for a government agency, known for its offbeat tone and unpredictable turns.",
  },
  {
    id: "work-scr-spy-x-family", kind: 'work', name: "Spy x Family", author: "Tatsuya Endo", year: 2019, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["manga", "comedy", "espionage"], kw: ["tatsuya endo", "fake family", "secret identities", "premise-driven comedy", "spy comedy", "found family"],
    summary: "A comedy about a spy, an assassin and a telepathic child who pose as a family for a mission, an example of premise-driven comedy built on everyone's secrets.",
  },
  {
    id: "work-scr-a-drifting-life", kind: 'work', name: "A Drifting Life (Gekiga hyoryu)", author: "Yoshihiro Tatsumi", year: 2008, language: "Japanese", region: "Japan", confidence: 'established',
    genres: ["graphic memoir", "manga", "gekiga"], kw: ["tatsumi", "gekiga", "manga history", "postwar japan", "autobiography", "alternative manga"],
    summary: "A long autobiographical manga about the rise of gekiga, the mature, realist comics movement Tatsumi helped found, and about his early career in postwar Japan.",
  },

  {
    id: "work-scr-zork", kind: 'work', name: "Zork", author: "Marc Blank, Tim Anderson, Bruce Daniels and Dave Lebling", year: 1977, language: "English", region: "United States", confidence: 'established',
    summary: "A text adventure begun at the Massachusetts Institute of Technology in the late 1970s and sold by Infocom from 1980; players type commands to explore a vast underground world, and its parser and dry humour made it a model for interactive fiction.",
    kw: ["zork", "text adventure", "infocom", "interactive fiction", "great underground empire", "parser fiction", "who wrote zork"], genres: ["interactive fiction", "text adventure"],
  },
];
