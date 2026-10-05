// Notable works: picture books, early readers, middle grade, young adult, children's poetry, fairy-tale collections and retellings, graphic novels for young readers, and international children's literature.
// Reference data only. Year = first publication of the original (translations keep the original year and language). Summaries are neutral and spoiler-free. Age bands (picture book, middle grade, young adult) are the usual trade labels, not rules; many of these books are read across ages.
// Children's classics already held in other files are not repeated here: Alice's Adventures in Wonderland, The Wonderful Wizard of Oz, The Hobbit, The Lion, the Witch and the Wardrobe, A Wizard of Earthsea, The Dark Is Rising, A Wrinkle in Time, Northern Lights, Harry Potter and the Philosopher's Stone, Sabriel, The Neverending Story, Pippi Longstocking, Finn Family Moomintroll, The Little Prince, The Adventures of Pinocchio, Fairy Tales Told for Children (Andersen), the Grimm and Perrault collections, Smile, Bone, Maus and Lord of the Flies.
export const PREFIX = 'work-kid-';
export default [
  // ---- Picture books: early and mid twentieth-century classics ----
  {
    id: 'work-kid-peter-rabbit', kind: 'work', name: 'The Tale of Peter Rabbit', author: 'Beatrix Potter', year: 1902, language: 'English', region: 'England', confidence: 'established',
    summary: "A small-format picture book about a disobedient young rabbit in a vegetable garden, with the author's own watercolours; printed privately in 1901 and published commercially in 1902.",
    kw: ['potter', 'rabbit', 'animal fable', 'small format', 'text and image', 'early picture book'], genres: ['picture book', 'animal fable'],
  },
  {
    id: 'work-kid-millions-of-cats', kind: 'work', name: 'Millions of Cats', author: 'Wanda Gág', year: 1928, language: 'English', region: 'United States', confidence: 'established',
    summary: 'An early American picture book in which an old man sets out to find one cat and comes home with a great many, told with a chanted refrain and hand-lettered text woven into the drawings.',
    kw: ['gag', 'cats', 'refrain', 'early american picture book', 'folk tale style'], genres: ['picture book', 'folk tale'],
  },
  {
    id: 'work-kid-the-story-of-ferdinand', kind: 'work', name: 'The Story of Ferdinand', author: 'Munro Leaf', year: 1936, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A picture book, illustrated by Robert Lawson, about a bull who prefers sitting quietly among flowers to fighting; a gentle story whose calm hero resists what everyone around him expects.',
    kw: ['leaf', 'lawson', 'bull', 'pacifism', 'nonconformity', 'gentle protagonist'], genres: ['picture book', 'fable'],
  },
  {
    id: 'work-kid-madeline', kind: 'work', name: 'Madeline', author: 'Ludwig Bemelmans', year: 1939, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A rhyming picture book set in a Paris boarding school that follows the smallest and boldest of twelve schoolgirls; known for brisk verse and loose, sketchy illustrations of the city.',
    kw: ['bemelmans', 'paris', 'boarding school', 'rhyming picture book', 'series character'], genres: ['picture book', 'verse story'],
  },
  {
    id: 'work-kid-the-little-house', kind: 'work', name: 'The Little House', author: 'Virginia Lee Burton', year: 1942, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A picture book that follows a small country house as seasons pass and a city grows around it; an early model of change over time as the shape of a picture-book story.',
    kw: ['burton', 'house', 'seasons', 'urbanisation', 'passage of time', 'picture book structure'], genres: ['picture book'],
  },
  {
    id: 'work-kid-make-way-for-ducklings', kind: 'work', name: 'Make Way for Ducklings', author: 'Robert McCloskey', year: 1941, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A picture book about a pair of mallards raising their ducklings in the middle of Boston, with warm brown-toned drawings; a gentle, place-rooted story of a family looking for a home.',
    kw: ['mccloskey', 'ducks', 'boston', 'place-based story', 'animal family'], genres: ['picture book'],
  },
  {
    id: 'work-kid-curious-george', kind: 'work', name: 'Curious George', author: 'H. A. Rey', year: 1941, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A picture book about an inquisitive monkey whose curiosity keeps leading to mishaps, created by H. A. Rey with Margret Rey; the first of a long series of adventures.',
    kw: ['rey', 'margret rey', 'monkey', 'curiosity', 'series character', 'mishap plot'], genres: ['picture book', 'series fiction'],
  },
  {
    id: 'work-kid-the-runaway-bunny', kind: 'work', name: 'The Runaway Bunny', author: 'Margaret Wise Brown', year: 1942, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A picture book built as a conversation between a young rabbit who says he will run away and a mother who says how she will follow; a model of repetition and reassurance.',
    kw: ['brown', 'hurd', 'bunny', 'repetition', 'bedtime', 'parent and child'], genres: ['picture book', 'bedtime story'],
  },
  {
    id: 'work-kid-goodnight-moon', kind: 'work', name: 'Goodnight Moon', author: 'Margaret Wise Brown', year: 1947, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A bedtime picture book that says goodnight, one by one, to the objects in a child-rabbit\'s room; a standard example of a quiet, rhythmic text paced to wind a child down toward sleep.',
    kw: ['brown', 'hurd', 'bedtime', 'lullaby text', 'rhythm', 'goodnight'], genres: ['picture book', 'bedtime story'],
  },
  {
    id: 'work-kid-stone-soup', kind: 'work', name: 'Stone Soup', author: 'Marcia Brown', year: 1947, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A picture-book retelling of the old European folk tale in which hungry soldiers coax a village into sharing food; a well-known example of a traditional tale adapted for young readers.',
    kw: ['marcia brown', 'folk tale retelling', 'soup', 'cleverness', 'trickster'], genres: ['picture book', 'folk tale retelling'],
  },
  {
    id: 'work-kid-harold-and-the-purple-crayon', kind: 'work', name: 'Harold and the Purple Crayon', author: 'Crockett Johnson', year: 1955, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A picture book in which a small boy draws his own world with a crayon as he walks through the night; a playful model of a character whose actions shape the page itself.',
    kw: ['crockett johnson', 'crayon', 'imagination', 'line drawing', 'metafiction for children'], genres: ['picture book', 'fantasy'],
  },
  {
    id: 'work-kid-where-the-wild-things-are', kind: 'work', name: 'Where the Wild Things Are', author: 'Maurice Sendak', year: 1963, language: 'English', region: 'United States', confidence: 'established',
    summary: "A picture book about a boy sent to bed whose imagination carries him to an island of wild creatures; noted for its very short text and for pictures that grow across the pages before shrinking back.",
    kw: ['sendak', 'wild things', 'imagination', 'anger', 'picture book design', 'there and back again'], genres: ['picture book', 'fantasy'],
  },
  {
    id: 'work-kid-the-snowy-day', kind: 'work', name: 'The Snowy Day', author: 'Ezra Jack Keats', year: 1962, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A picture book that follows a small boy exploring the snow in his city neighbourhood, with collage illustrations; often cited as a landmark for placing a Black child at the centre of a mainstream American picture book.',
    kw: ['keats', 'snow', 'collage', 'city childhood', 'diverse picture books', 'a day in the life'], genres: ['picture book', 'slice of life'],
  },
  {
    id: 'work-kid-swimmy', kind: 'work', name: 'Swimmy', author: 'Leo Lionni', year: 1963, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A picture book fable about a small black fish who shows a school of red fish how to swim together as one large shape; a model of the short, spare, fable-like picture book.',
    kw: ['lionni', 'fish', 'fable', 'cooperation', 'spare text', 'picture book as fable'], genres: ['picture book', 'fable'],
  },
  {
    id: 'work-kid-the-giving-tree', kind: 'work', name: 'The Giving Tree', author: 'Shel Silverstein', year: 1964, language: 'English', region: 'United States', confidence: 'established',
    summary: "A short picture book, in minimal line drawings, about a tree and a boy across a lifetime; widely loved, and read by some as tender and by others as troubling, so it is often discussed.",
    kw: ['silverstein', 'tree', 'giving', 'parable', 'ambiguity', 'minimal illustration'], genres: ['picture book', 'parable'],
  },
  {
    id: 'work-kid-corduroy', kind: 'work', name: 'Corduroy', author: 'Don Freeman', year: 1968, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A picture book about a toy bear in a department store who goes looking for a lost button and, he hopes, a home; a classic of a small, concrete want driving a whole story.',
    kw: ['freeman', 'toy bear', 'department store', 'longing', 'belonging', 'small stakes'], genres: ['picture book', 'toy story'],
  },
  {
    id: 'work-kid-the-tiger-who-came-to-tea', kind: 'work', name: 'The Tiger Who Came to Tea', author: 'Judith Kerr', year: 1968, language: 'English', region: 'England', confidence: 'established',
    summary: 'A picture book in which an unexpected tiger arrives at the kitchen table and a mother and child treat the extraordinary visit calmly; a model of the surreal handled in a plain, domestic voice.',
    kw: ['kerr', 'tiger', 'tea', 'domestic surreal', 'visitor story', 'deadpan'], genres: ['picture book', 'domestic fantasy'],
  },
  {
    id: 'work-kid-rosies-walk', kind: 'work', name: "Rosie's Walk", author: 'Pat Hutchins', year: 1968, language: 'English', region: 'England', confidence: 'established',
    summary: 'A picture book whose single sentence describes a hen walking around a farmyard while the pictures reveal what follows her; a classic of text and image telling two different stories.',
    kw: ['hutchins', 'hen', 'farm', 'irony between text and image', 'dramatic irony', 'one sentence'], genres: ['picture book', 'comic story'],
  },
  {
    id: 'work-kid-elmer', kind: 'work', name: 'Elmer', author: 'David McKee', year: 1968, language: 'English', region: 'England', confidence: 'established',
    summary: 'A picture book about a patchwork elephant who is unlike the rest of the herd and wonders whether to blend in; a gentle story about difference, with a distinctive visual design.',
    kw: ['mckee', 'elephant', 'patchwork', 'difference', 'identity', 'colour'], genres: ['picture book'],
  },
  // ---- Picture books: Dr. Seuss, beginning readers and interactive books ----
  {
    id: 'work-kid-mulberry-street', kind: 'work', name: 'And to Think That I Saw It on Mulberry Street', author: 'Dr. Seuss', year: 1937, language: 'English', region: 'United States', confidence: 'established',
    summary: "Dr. Seuss's first children's book: a rhyming picture book about a boy whose ordinary walk home grows into an elaborate imagined parade, a model of an exaggerating, escalating anecdote.",
    kw: ['seuss', 'theodor geisel', 'rhyme', 'imagination', 'exaggeration', 'anapestic verse'], genres: ['picture book', 'verse story'],
  },
  {
    id: 'work-kid-the-cat-in-the-hat', kind: 'work', name: 'The Cat in the Hat', author: 'Dr. Seuss', year: 1957, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A rhyming beginning reader about two children and a chaotic visitor on a rainy day, written with a limited vocabulary; a landmark of the easy-reader format.',
    kw: ['seuss', 'beginner book', 'easy reader', 'limited vocabulary', 'rhyme', 'early reader'], genres: ['early reader', 'verse story'],
  },
  {
    id: 'work-kid-green-eggs-and-ham', kind: 'work', name: 'Green Eggs and Ham', author: 'Dr. Seuss', year: 1960, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A rhyming beginning reader written with only fifty different words, in which one character keeps refusing a dish he has never tried; a well-known example of constraint and repetition.',
    kw: ['seuss', 'fifty words', 'constraint', 'repetition', 'early reader', 'refusal'], genres: ['early reader', 'verse story'],
  },
  {
    id: 'work-kid-the-lorax', kind: 'work', name: 'The Lorax', author: 'Dr. Seuss', year: 1971, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A rhyming picture-book fable about a creature who speaks for the trees against a business that cuts them down; a widely cited example of an environmental message in a children\'s book.',
    kw: ['seuss', 'environmental fable', 'trees', 'message book', 'rhyme', 'ecology'], genres: ['picture book', 'fable', 'verse story'],
  },
  {
    id: 'work-kid-pat-the-bunny', kind: 'work', name: 'Pat the Bunny', author: 'Dorothy Kunhardt', year: 1940, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A touch-and-feel book for babies that invites the child to pat, sniff and peek as the pages are turned; an early and enduring example of the interactive novelty book.',
    kw: ['kunhardt', 'touch and feel', 'baby book', 'interactive', 'novelty book'], genres: ['board book', 'interactive book'],
  },
  {
    id: 'work-kid-brown-bear-brown-bear', kind: 'work', name: 'Brown Bear, Brown Bear, What Do You See?', author: 'Bill Martin Jr.', year: 1967, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A picture book, illustrated by Eric Carle, with a repeating question-and-answer pattern that runs through colours and animals; a staple of first reading and a model of predictable text.',
    kw: ['martin', 'eric carle', 'predictable text', 'colours', 'repetition', 'read aloud'], genres: ['picture book', 'concept book'],
  },
  {
    id: 'work-kid-very-hungry-caterpillar', kind: 'work', name: 'The Very Hungry Caterpillar', author: 'Eric Carle', year: 1969, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A picture book with holes in its pages that follows a caterpillar through a week of eating; known for collage illustrations and a counting, day-by-day structure that ends in change.',
    kw: ['carle', 'caterpillar', 'collage', 'counting', 'days of the week', 'die-cut pages', 'metamorphosis'], genres: ['picture book', 'concept book'],
  },
  {
    id: 'work-kid-wheres-spot', kind: 'work', name: "Where's Spot?", author: 'Eric Hill', year: 1980, language: 'English', region: 'England', confidence: 'established',
    summary: 'A lift-the-flap book for very young children in which a mother dog searches for her puppy behind doors and in baskets; a widely known example of the flap-book format.',
    kw: ['hill', 'lift the flap', 'dog', 'hide and seek', 'toddler book', 'interactive'], genres: ['board book', 'interactive book'],
  },
  {
    id: 'work-kid-dear-zoo', kind: 'work', name: 'Dear Zoo', author: 'Rod Campbell', year: 1982, language: 'English', region: 'England', confidence: 'established',
    summary: 'A lift-the-flap picture book in which a child asks a zoo to send a pet and receives a series of unsuitable animals; a model of repetition with a small payoff at the end.',
    kw: ['campbell', 'zoo', 'lift the flap', 'repetition', 'pets', 'toddler'], genres: ['picture book', 'interactive book'],
  },
  {
    id: 'work-kid-chicka-chicka-boom-boom', kind: 'work', name: 'Chicka Chicka Boom Boom', author: 'Bill Martin Jr. and John Archambault', year: 1989, language: 'English', region: 'United States', confidence: 'established',
    summary: 'An alphabet picture book in rhythmic verse in which the letters race up a coconut tree, illustrated by Lois Ehlert; written to be chanted aloud.',
    kw: ['alphabet book', 'ehlert', 'rhythm', 'chant', 'letters', 'read aloud'], genres: ['picture book', 'alphabet book'],
  },
  {
    id: 'work-kid-alexander-terrible-day', kind: 'work', name: 'Alexander and the Terrible, Horrible, No Good, Very Bad Day', author: 'Judith Viorst', year: 1972, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A picture book narrated by a small boy whose day goes wrong in countless small ways, illustrated by Ray Cruz; a model of a comic, child-sized voice of complaint.',
    kw: ['viorst', 'bad day', 'child narrator', 'comic complaint', 'first person picture book'], genres: ['picture book', 'comic story'],
  },
  // ---- Picture books: rhyme, repetition and read-aloud ----
  {
    id: 'work-kid-mr-gumpys-outing', kind: 'work', name: "Mr Gumpy's Outing", author: 'John Burningham', year: 1970, language: 'English', region: 'England', confidence: 'established',
    summary: 'A picture book in which a man lets children and animals into his boat on the condition that they behave; a cumulative story with a gentle comic turn.',
    kw: ['burningham', 'boat', 'cumulative story', 'rules and rule-breaking', 'animals', 'river'], genres: ['picture book', 'cumulative tale'],
  },
  {
    id: 'work-kid-dogger', kind: 'work', name: 'Dogger', author: 'Shirley Hughes', year: 1977, language: 'English', region: 'England', confidence: 'established',
    summary: 'A picture book about a small boy who loses his much-loved toy dog and the older sister who helps; known for warm, realistic scenes of ordinary family life.',
    kw: ['hughes', 'lost toy', 'siblings', 'family life', 'realistic picture book', 'comfort object'], genres: ['picture book', 'domestic realism'],
  },
  {
    id: 'work-kid-each-peach-pear-plum', kind: 'work', name: 'Each Peach Pear Plum', author: 'Janet and Allan Ahlberg', year: 1978, language: 'English', region: 'England', confidence: 'established',
    summary: 'A rhyming picture book in which characters from nursery rhymes and tales hide in each picture and are spotted one by one; it rewards close looking and playful intertextual reference.',
    kw: ['ahlberg', 'i spy', 'nursery rhyme characters', 'intertextuality', 'look and find', 'rhyme'], genres: ['picture book', 'interactive book'],
  },
  {
    id: 'work-kid-the-snowman', kind: 'work', name: 'The Snowman', author: 'Raymond Briggs', year: 1978, language: 'None (wordless)', region: 'England', confidence: 'established',
    summary: 'A wordless picture book told in comic-strip panels about a boy and a snowman who comes to life for one night; a landmark of storytelling through sequential images alone.',
    kw: ['briggs', 'wordless picture book', 'panels', 'snow', 'sequential art', 'christmas'], genres: ['picture book', 'wordless picture book'],
  },
  {
    id: 'work-kid-not-now-bernard', kind: 'work', name: 'Not Now, Bernard', author: 'David McKee', year: 1980, language: 'English', region: 'England', confidence: 'established',
    summary: 'A short, deadpan picture book about a boy whose parents keep brushing him off, with a darkly comic turn; a model of humour that comes from what the adults fail to notice.',
    kw: ['mckee', 'being ignored', 'deadpan', 'dark humour', 'parents', 'monster'], genres: ['picture book', 'comic story'],
  },
  {
    id: 'work-kid-hairy-maclary', kind: 'work', name: "Hairy Maclary from Donaldson's Dairy", author: 'Lynley Dodd', year: 1983, language: 'English', region: 'New Zealand', confidence: 'established',
    summary: "A cumulative rhyming picture book from New Zealand in which a small dog's neighbourhood walk gathers a parade of other dogs with bouncing, memorable names.",
    kw: ['dodd', 'new zealand picture book', 'dogs', 'cumulative rhyme', 'names', 'read aloud'], genres: ['picture book', 'cumulative tale'],
  },
  {
    id: 'work-kid-possum-magic', kind: 'work', name: 'Possum Magic', author: 'Mem Fox', year: 1983, language: 'English', region: 'Australia', confidence: 'established',
    summary: 'An Australian picture book, illustrated by Julie Vivas, in which a grandmother possum makes her granddaughter invisible and then travels around the country, naming its places and foods, to undo it.',
    kw: ['fox', 'vivas', 'australia', 'possum', 'invisibility', 'journey structure'], genres: ['picture book', 'fantasy'],
  },
  {
    id: 'work-kid-the-napping-house', kind: 'work', name: 'The Napping House', author: 'Audrey Wood', year: 1984, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A cumulative picture book, illustrated by Don Wood, in which a growing pile of sleepers on a bed ends in a sudden change; it shows how a repeated structure can build to a surprise.',
    kw: ['wood', 'cumulative', 'sleep', 'bed', 'repetition', 'build to a surprise'], genres: ['picture book', 'cumulative tale'],
  },
  {
    id: 'work-kid-the-polar-express', kind: 'work', name: 'The Polar Express', author: 'Chris Van Allsburg', year: 1985, language: 'English', region: 'United States', confidence: 'established',
    summary: "A picture book about a boy who boards a mysterious train on Christmas Eve, noted for its dreamlike pictures and a quiet, wondering tone; a standard example of the seasonal fantasy picture book.",
    kw: ['van allsburg', 'train', 'christmas', 'wonder', 'dreamlike illustration', 'belief'], genres: ['picture book', 'fantasy'],
  },
  {
    id: 'work-kid-jumanji', kind: 'work', name: 'Jumanji', author: 'Chris Van Allsburg', year: 1981, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A picture book in which two bored children find a board game whose events become real; known for its detailed black-and-white pencil illustrations and a story that escalates by the rules of the game.',
    kw: ['van allsburg', 'board game', 'escalation', 'rules of the game', 'black and white illustration'], genres: ['picture book', 'fantasy'],
  },
  {
    id: 'work-kid-love-you-forever', kind: 'work', name: 'Love You Forever', author: 'Robert Munsch', year: 1986, language: 'English', region: 'Canada', confidence: 'established',
    summary: 'A Canadian picture book following a parent and child from babyhood into adulthood, anchored by a repeated lullaby verse; popular and often discussed for its sentiment.',
    kw: ['munsch', 'lullaby', 'parent and child', 'refrain', 'sentimental picture book', 'canada'], genres: ['picture book'],
  },
  {
    id: 'work-kid-the-paper-bag-princess', kind: 'work', name: 'The Paper Bag Princess', author: 'Robert Munsch', year: 1980, language: 'English', region: 'Canada', confidence: 'established',
    summary: 'A Canadian picture book, illustrated by Michael Martchenko, in which a princess goes after a dragon to rescue a prince; a well-known reversal of fairy-tale roles.',
    kw: ['munsch', 'martchenko', 'princess', 'dragon', 'role reversal', 'feminist fairy tale'], genres: ['picture book', 'fairy-tale parody'],
  },
  {
    id: 'work-kid-we-are-going-on-a-bear-hunt', kind: 'work', name: "We're Going on a Bear Hunt", author: 'Michael Rosen', year: 1989, language: 'English', region: 'England', confidence: 'established',
    summary: 'A picture book, illustrated by Helen Oxenbury, with a chanted call-and-response text in which a family pushes through grass, mud and snow in search of a bear; made to be performed aloud.',
    kw: ['rosen', 'oxenbury', 'call and response', 'onomatopoeia', 'performance', 'read aloud'], genres: ['picture book', 'chant'],
  },
  {
    id: 'work-kid-owl-babies', kind: 'work', name: 'Owl Babies', author: 'Martin Waddell', year: 1992, language: 'English', region: 'Northern Ireland', confidence: 'established',
    summary: 'A picture book, illustrated by Patrick Benson, about three young owls waiting at night for their mother; a model of short text, a child\'s fear and quiet reassurance.',
    kw: ['waddell', 'benson', 'owls', 'separation anxiety', 'night', 'reassurance'], genres: ['picture book'],
  },
  {
    id: 'work-kid-guess-how-much-i-love-you', kind: 'work', name: 'Guess How Much I Love You', author: 'Sam McBratney', year: 1994, language: 'English', region: 'Northern Ireland', confidence: 'established',
    summary: 'A picture book, illustrated by Anita Jeram, of two hares comparing how far and wide their love reaches; built on a repeated game of one-upmanship.',
    kw: ['mcbratney', 'jeram', 'hares', 'bedtime', 'one-upmanship', 'parent and child'], genres: ['picture book', 'bedtime story'],
  },
  {
    id: 'work-kid-owl-moon', kind: 'work', name: 'Owl Moon', author: 'Jane Yolen', year: 1987, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A picture book, illustrated by John Schoenherr, about a girl and her father walking through winter woods at night to look for an owl; noted for lyrical, quiet prose and patient pacing.',
    kw: ['yolen', 'schoenherr', 'owls', 'winter', 'lyrical prose', 'father and child'], genres: ['picture book', 'nature writing'],
  },
  // ---- Picture books: contemporary ----
  {
    id: 'work-kid-chrysanthemum', kind: 'work', name: 'Chrysanthemum', author: 'Kevin Henkes', year: 1991, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A picture book about a mouse who loves her long name until classmates tease her about it at school; a model of a small, true-to-life childhood problem told with mouse characters.',
    kw: ['henkes', 'mouse', 'names', 'teasing', 'school story', 'self-esteem'], genres: ['picture book', 'school story'],
  },
  {
    id: 'work-kid-the-gruffalo', kind: 'work', name: 'The Gruffalo', author: 'Julia Donaldson', year: 1999, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A rhyming picture book, illustrated by Axel Scheffler, in which a mouse invents a fearsome creature to keep predators away; a model of rhyme, repetition and a clever turn.',
    kw: ['donaldson', 'scheffler', 'mouse', 'rhyming picture book', 'trickster', 'forest'], genres: ['picture book', 'verse story'],
  },
  {
    id: 'work-kid-click-clack-moo', kind: 'work', name: 'Click, Clack, Moo: Cows That Type', author: 'Doreen Cronin', year: 2000, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A comic picture book, illustrated by Betsy Lewin, in which farm animals type demands to the farmer; a model of deadpan humour told partly through notes and negotiation.',
    kw: ['cronin', 'lewin', 'farm animals', 'notes', 'negotiation', 'deadpan humour'], genres: ['picture book', 'comic story'],
  },
  {
    id: 'work-kid-room-on-the-broom', kind: 'work', name: 'Room on the Broom', author: 'Julia Donaldson', year: 2001, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A rhyming picture book, illustrated by Axel Scheffler, about a witch whose broom gathers more and more passengers; a model of cumulative structure and a rhythmic read-aloud text.',
    kw: ['donaldson', 'scheffler', 'witch', 'cumulative structure', 'rhyme', 'read aloud'], genres: ['picture book', 'verse story', 'cumulative tale'],
  },
  {
    id: 'work-kid-dont-let-the-pigeon-drive-the-bus', kind: 'work', name: "Don't Let the Pigeon Drive the Bus", author: 'Mo Willems', year: 2003, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A picture book in which a narrator speaks directly to the reader while a pigeon pleads and bargains to drive a bus; known for its voice-driven design of speech bubbles and direct address.',
    kw: ['willems', 'pigeon', 'direct address', 'speech bubbles', 'interactive narration', 'tantrum'], genres: ['picture book', 'comic story'],
  },
  {
    id: 'work-kid-lost-and-found-jeffers', kind: 'work', name: 'Lost and Found', author: 'Oliver Jeffers', year: 2005, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A picture book about a boy who tries to return a penguin to the South Pole; it shows how spare text and a minimal drawing style can carry real feeling.',
    kw: ['jeffers', 'penguin', 'friendship', 'loneliness', 'spare text', 'minimal illustration'], genres: ['picture book'],
  },
  {
    id: 'work-kid-i-want-my-hat-back', kind: 'work', name: 'I Want My Hat Back', author: 'Jon Klassen', year: 2011, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A picture book of dry, deadpan humour in which a bear searches for his missing hat; known for restrained text and for leaving readers to infer what the pictures imply.',
    kw: ['klassen', 'bear', 'deadpan', 'inference', 'dark humour', 'restraint'], genres: ['picture book', 'comic story'],
  },
  {
    id: 'work-kid-the-day-the-crayons-quit', kind: 'work', name: 'The Day the Crayons Quit', author: 'Drew Daywalt', year: 2013, language: 'English', region: 'United States', confidence: 'established',
    summary: 'An epistolary picture book, illustrated by Oliver Jeffers, in which a boy opens letters of complaint from his crayons; a model of distinct voices built from short letters.',
    kw: ['daywalt', 'jeffers', 'letters', 'epistolary picture book', 'crayons', 'distinct voices'], genres: ['picture book', 'epistolary fiction'],
  },
  {
    id: 'work-kid-sam-and-dave-dig-a-hole', kind: 'work', name: 'Sam and Dave Dig a Hole', author: 'Mac Barnett', year: 2014, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A picture book, illustrated by Jon Klassen, in which two boys dig a deep hole while the pictures show what the characters miss; an example of dramatic irony between text and image.',
    kw: ['barnett', 'klassen', 'digging', 'dramatic irony', 'text and image', 'perspective'], genres: ['picture book', 'comic story'],
  },
  {
    id: 'work-kid-last-stop-on-market-street', kind: 'work', name: 'Last Stop on Market Street', author: 'Matt de la Peña', year: 2015, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A picture book, illustrated by Christian Robinson, about a boy and his grandmother on a bus ride across a city; noted for its observant, lyrical text about noticing beauty in ordinary places.',
    kw: ['de la pena', 'christian robinson', 'bus ride', 'grandmother', 'city', 'noticing'], genres: ['picture book', 'slice of life'],
  },
  // ---- Picture books: wordless and image-led ----
  {
    id: 'work-kid-tuesday-wiesner', kind: 'work', name: 'Tuesday', author: 'David Wiesner', year: 1991, language: 'None (wordless)', region: 'United States', confidence: 'established',
    summary: 'A nearly wordless picture book in which frogs rise on lily pads and drift over a sleeping town one night; known for cinematic panel sequencing and a dry visual punchline.',
    kw: ['wiesner', 'frogs', 'wordless picture book', 'cinematic panels', 'surreal'], genres: ['picture book', 'wordless picture book'],
  },
  {
    id: 'work-kid-flotsam', kind: 'work', name: 'Flotsam', author: 'David Wiesner', year: 2006, language: 'None (wordless)', region: 'United States', confidence: 'established',
    summary: 'A wordless picture book in which a boy finds an old camera washed up on a beach and develops its film; known for layered, highly detailed images that reward re-reading.',
    kw: ['wiesner', 'camera', 'beach', 'wordless picture book', 'detail', 'mystery'], genres: ['picture book', 'wordless picture book'],
  },
  {
    id: 'work-kid-the-arrival', kind: 'work', name: 'The Arrival', author: 'Shaun Tan', year: 2006, language: 'None (wordless)', region: 'Australia', confidence: 'established',
    summary: 'A wordless graphic novel in sepia drawings about a man who leaves his family for an unfamiliar country; a landmark of picture-book storytelling for older readers, and a study of migration.',
    kw: ['tan', 'migration', 'wordless graphic novel', 'sepia', 'immigrant experience', 'visual storytelling'], genres: ['picture book', 'wordless graphic novel'],
  },
  // ---- Picture books: international and traditional ----
  {
    id: 'work-kid-max-and-moritz', kind: 'work', name: 'Max and Moritz', author: 'Wilhelm Busch', year: 1865, language: 'German', region: 'Germany', confidence: 'established',
    summary: 'A German picture story in rhymed verse about two mischievous boys, told in seven pranks with caricature drawings; an influential forerunner of the comic strip and the cautionary tale.',
    kw: ['busch', 'max und moritz', 'pranks', 'verse story', 'caricature', 'early comic strip', 'cautionary tale'], genres: ['picture story', 'cautionary tale', 'verse story'],
  },
  {
    id: 'work-kid-struwwelpeter', kind: 'work', name: 'Struwwelpeter', author: 'Heinrich Hoffmann', year: 1845, language: 'German', region: 'Germany', confidence: 'established',
    summary: 'A German collection of illustrated cautionary verse tales with exaggerated consequences for misbehaviour; widely translated and parodied, and often discussed as an extreme case of the cautionary tale.',
    kw: ['hoffmann', 'shock-headed peter', 'cautionary tale', 'verse', 'nineteenth century children\'s book', 'moral tales'], genres: ['cautionary tale', 'verse story', 'picture book'],
  },
  {
    id: 'work-kid-the-story-of-babar', kind: 'work', name: 'The Story of Babar', author: 'Jean de Brunhoff', year: 1931, language: 'French', region: 'France', confidence: 'established',
    summary: 'A large-format French picture book about a young elephant who leaves the forest for a city and returns changed; an influential European picture book that began a long series.',
    kw: ['de brunhoff', 'babar', 'histoire de babar', 'elephant', 'large format', 'series'], genres: ['picture book', 'series fiction'],
  },
  {
    id: 'work-kid-miffy', kind: 'work', name: 'Miffy (nijntje)', author: 'Dick Bruna', year: 1955, language: 'Dutch', region: 'Netherlands', confidence: 'established',
    summary: 'A Dutch picture book about a small rabbit, drawn with thick black outlines and a few flat colours; the first of a long series known for extreme visual and verbal simplicity.',
    kw: ['bruna', 'nijntje', 'rabbit', 'simplicity', 'flat colour', 'toddler picture book'], genres: ['picture book', 'series fiction'],
  },
  {
    id: 'work-kid-the-rainbow-fish', kind: 'work', name: 'The Rainbow Fish', author: 'Marcus Pfister', year: 1992, language: 'German', region: 'Switzerland', confidence: 'established',
    summary: 'A Swiss picture book about a fish with shimmering scales who learns about sharing, known for its foil-stamped illustrations and plainly stated message; it began an international series.',
    kw: ['pfister', 'der regenbogenfisch', 'sharing', 'foil', 'moral picture book', 'fish'], genres: ['picture book', 'fable'],
  },
  {
    id: 'work-kid-anansi-the-spider', kind: 'work', name: 'Anansi the Spider: A Tale from the Ashanti', author: 'Gerald McDermott', year: 1972, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A picture book retelling an Akan trickster tale about Anansi and his six sons, with bold, flat, patterned illustrations; an early example of a West African tale in an American picture book.',
    kw: ['mcdermott', 'anansi', 'akan', 'ashanti', 'trickster tale', 'folktale retelling', 'west africa'], genres: ['picture book', 'folk tale retelling', 'trickster tale'],
  },
  {
    id: 'work-kid-why-mosquitoes-buzz', kind: 'work', name: "Why Mosquitoes Buzz in People's Ears", author: 'Verna Aardema', year: 1975, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A picture book, illustrated by Leo and Diane Dillon, retelling a West African tale in which one small act of mischief sets off a chain of consequences; a cumulative pourquoi tale.',
    kw: ['aardema', 'dillon', 'pourquoi tale', 'chain of events', 'cumulative tale', 'african folktale retelling'], genres: ['picture book', 'folk tale retelling', 'pourquoi tale'],
  },
  {
    id: 'work-kid-mufaros-beautiful-daughters', kind: 'work', name: "Mufaro's Beautiful Daughters", author: 'John Steptoe', year: 1987, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A picture book fairy tale inspired by a southern African story, in which two sisters respond differently when a king seeks a wife; known for richly detailed paintings by its author.',
    kw: ['steptoe', 'african fairy tale', 'two sisters', 'kindness and pride', 'picture book painting', 'zimbabwe'], genres: ['picture book', 'folk tale retelling', 'fairy tale'],
  },
  {
    id: 'work-kid-lon-po-po', kind: 'work', name: 'Lon Po Po: A Red-Riding Hood Story from China', author: 'Ed Young', year: 1989, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A picture book retelling a Chinese variant of Red Riding Hood in which three sisters face a wolf disguised as their grandmother; known for its panelled pastel and watercolour paintings.',
    kw: ['young', 'chinese fairy tale', 'red riding hood variant', 'wolf', 'three sisters', 'tale variants'], genres: ['picture book', 'folk tale retelling', 'fairy tale'],
  },
  {
    id: 'work-kid-the-mitten', kind: 'work', name: 'The Mitten', author: 'Jan Brett', year: 1989, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A picture book retelling an old Ukrainian folk tale in which animals crowd into a lost mitten in winter; a cumulative tale told with richly bordered illustrations that preview what comes next.',
    kw: ['brett', 'ukrainian folk tale', 'cumulative tale', 'winter', 'border illustrations', 'animals'], genres: ['picture book', 'folk tale retelling', 'cumulative tale'],
  },
  // ---- Early readers and chapter books ----
  {
    id: 'work-kid-little-bear', kind: 'work', name: 'Little Bear', author: 'Else Holmelund Minarik', year: 1957, language: 'English', region: 'United States', confidence: 'established',
    summary: 'An early reader in four short stories about a small bear and his family, illustrated by Maurice Sendak; an influential model of simple vocabulary combined with real warmth and imagination.',
    kw: ['minarik', 'sendak', 'i can read', 'easy reader', 'short stories', 'simple vocabulary'], genres: ['early reader', 'animal story'],
  },
  {
    id: 'work-kid-frog-and-toad-are-friends', kind: 'work', name: 'Frog and Toad Are Friends', author: 'Arnold Lobel', year: 1970, language: 'English', region: 'United States', confidence: 'established',
    summary: 'An early reader of five short, gentle stories about two friends of different temperaments; a model of how few words, careful rhythm and dry humour can carry a character relationship.',
    kw: ['lobel', 'friendship', 'easy reader', 'short stories', 'two characters', 'understatement'], genres: ['early reader', 'animal story'],
  },
  {
    id: 'work-kid-amelia-bedelia', kind: 'work', name: 'Amelia Bedelia', author: 'Peggy Parish', year: 1963, language: 'English', region: 'United States', confidence: 'established',
    summary: 'An early reader about a housekeeper who follows instructions literally, so that figures of speech and double meanings cause comic trouble; a classic of wordplay for beginning readers.',
    kw: ['parish', 'literal interpretation', 'idioms', 'wordplay', 'early reader', 'misunderstanding comedy'], genres: ['early reader', 'comic story'],
  },
  {
    id: 'work-kid-henry-and-mudge', kind: 'work', name: 'Henry and Mudge: The First Book', author: 'Cynthia Rylant', year: 1987, language: 'English', region: 'United States', confidence: 'established',
    summary: 'The first of a long early-chapter series about a boy and his very large dog, illustrated by Suçie Stevenson; known for simple sentences and affectionate, low-key everyday stories.',
    kw: ['rylant', 'boy and dog', 'early chapter book', 'series', 'everyday life', 'easy reader'], genres: ['early reader', 'series fiction'],
  },
  {
    id: 'work-kid-nate-the-great', kind: 'work', name: 'Nate the Great', author: 'Marjorie Weinman Sharmat', year: 1972, language: 'English', region: 'United States', confidence: 'established',
    summary: 'An early reader that introduces a young detective in a pancake-fuelled, hard-boiled-style voice; a child-sized parody of the detective story told in short, flat sentences.',
    kw: ['sharmat', 'young detective', 'mystery for beginners', 'first-person voice', 'detective parody', 'series'], genres: ['early reader', 'detective story', 'parody'],
  },
  {
    id: 'work-kid-boxcar-children', kind: 'work', name: 'The Boxcar Children', author: 'Gertrude Chandler Warner', year: 1924, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A chapter book about four orphaned siblings who make a home in an abandoned railway car; the first of a very long series and a long-standing model of self-reliance stories for young readers.',
    kw: ['warner', 'siblings', 'orphans', 'railway car', 'self reliance', 'chapter book series'], genres: ['chapter book', 'series fiction'],
  },
  {
    id: 'work-kid-beezus-and-ramona', kind: 'work', name: 'Beezus and Ramona', author: 'Beverly Cleary', year: 1955, language: 'English', region: 'United States', confidence: 'established',
    summary: "A chapter book about an older sister's exasperation with her small, imaginative sister Ramona; the book in which Ramona first appears, admired for its realistic, child's-eye view of family life.",
    kw: ['cleary', 'ramona', 'sisters', 'family comedy', 'child perspective', 'realistic children\'s fiction'], genres: ['chapter book', 'domestic realism'],
  },
  {
    id: 'work-kid-dinosaurs-before-dark', kind: 'work', name: 'Dinosaurs Before Dark', author: 'Mary Pope Osborne', year: 1992, language: 'English', region: 'United States', confidence: 'established',
    summary: 'The first Magic Tree House book, a short chapter book in which two siblings find a treehouse that carries them back in time; the start of a long series that mixes adventure with factual learning.',
    kw: ['osborne', 'magic tree house', 'time travel for kids', 'series', 'chapter book', 'educational fantasy'], genres: ['chapter book', 'time-travel adventure', 'series fiction'],
  },
  {
    id: 'work-kid-junie-b-jones-stupid-smelly-bus', kind: 'work', name: 'Junie B. Jones and the Stupid Smelly Bus', author: 'Barbara Park', year: 1992, language: 'English', region: 'United States', confidence: 'established',
    summary: "The first Junie B. Jones book, a chapter book narrated in the vivid, mistake-prone first-person voice of a kindergartner; a well-known model of comic child narration.",
    kw: ['park', 'junie b jones', 'child narrator', 'kindergarten', 'first person voice', 'series'], genres: ['chapter book', 'comic story', 'series fiction'],
  },
  {
    id: 'work-kid-captain-underpants', kind: 'work', name: 'The Adventures of Captain Underpants', author: 'Dav Pilkey', year: 1997, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A comic chapter book mixing prose with comic-strip pages, in which two schoolboys invent a superhero; the first of a very popular series and a model of the hybrid text-and-comics format.',
    kw: ['pilkey', 'toilet humour', 'hybrid comic', 'reluctant readers', 'school pranks', 'series'], genres: ['chapter book', 'comic story', 'hybrid novel'],
  },
  {
    id: 'work-kid-there-is-a-bird-on-your-head', kind: 'work', name: 'There Is a Bird on Your Head', author: 'Mo Willems', year: 2007, language: 'English', region: 'United States', confidence: 'established',
    summary: 'An early reader in speech bubbles featuring Elephant and Piggie, two friends whose conversations carry the plot; a model of comic timing and character built almost entirely from dialogue.',
    kw: ['willems', 'elephant and piggie', 'speech bubbles', 'dialogue only', 'comic timing', 'early reader'], genres: ['early reader', 'comic story'],
  },
  {
    id: 'work-kid-mercy-watson-to-the-rescue', kind: 'work', name: 'Mercy Watson to the Rescue', author: 'Kate DiCamillo', year: 2005, language: 'English', region: 'United States', confidence: 'established',
    summary: 'The first book in a series of illustrated early chapter books about a pig who loves buttered toast, with illustrations by Chris Van Dusen; an example of light comedy and short chapters for new readers.',
    kw: ['dicamillo', 'van dusen', 'pig', 'early chapter book', 'comic series', 'buttered toast'], genres: ['chapter book', 'comic story', 'series fiction'],
  },
  {
    id: 'work-kid-dog-man', kind: 'work', name: 'Dog Man', author: 'Dav Pilkey', year: 2016, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A full-length comic for young readers about a police officer with the head of a dog, presented as made by two fictional schoolboys; the first of a series of comics written for young and reluctant readers.',
    kw: ['pilkey', 'graphic novel for children', 'superhero parody', 'reluctant readers', 'comic series'], genres: ['graphic novel', 'comic story', 'series fiction'],
  },
  // ---- Children's poetry ----
  {
    id: 'work-kid-a-book-of-nonsense', kind: 'work', name: 'A Book of Nonsense', author: 'Edward Lear', year: 1846, language: 'English', region: 'England', confidence: 'established',
    summary: 'A collection of limericks, each paired with the poet\'s own comic drawing, that helped popularise the limerick as a nonsense form; a founding book of English nonsense verse.',
    kw: ['lear', 'limerick', 'nonsense verse', 'illustrated verse', 'victorian children\'s poetry'], genres: ['nonsense verse', 'limerick', "children's poetry"],
  },
  {
    id: 'work-kid-nonsense-songs-lear', kind: 'work', name: 'Nonsense Songs, Stories, Botany and Alphabets', author: 'Edward Lear', year: 1871, language: 'English', region: 'England', confidence: 'established',
    summary: 'A collection of longer nonsense poems and prose, including the song of the owl and the pussycat, with the poet\'s drawings; a landmark of sound-driven nonsense verse.',
    kw: ['lear', 'owl and the pussycat', 'nonsense songs', 'invented words', 'sound play', 'victorian nonsense'], genres: ['nonsense verse', "children's poetry"],
  },
  {
    id: 'work-kid-sing-song', kind: 'work', name: 'Sing-Song: A Nursery Rhyme Book', author: 'Christina Rossetti', year: 1872, language: 'English', region: 'England', confidence: 'established',
    summary: 'A collection of short, musical poems for young children by a major Victorian poet, in the manner of nursery rhymes; notable for the craft of very brief, simple verse.',
    kw: ['rossetti', 'nursery rhyme', 'victorian poetry', 'short lyrics', 'children\'s poems', 'songlike'], genres: ["children's poetry", 'nursery rhyme'],
  },
  {
    id: 'work-kid-a-childs-garden-of-verses', kind: 'work', name: "A Child's Garden of Verses", author: 'Robert Louis Stevenson', year: 1885, language: 'English', region: 'Scotland', confidence: 'established',
    summary: "A collection of short poems about play, bedtime, illness and imagination, written from a child's point of view; a long-running Victorian favourite and a model of a child-focused lyric voice.",
    kw: ['stevenson', 'child\'s point of view', 'victorian poetry', 'bedtime verse', 'play', 'lyric'], genres: ["children's poetry", 'lyric poetry'],
  },
  {
    id: 'work-kid-bad-childs-book-of-beasts', kind: 'work', name: "The Bad Child's Book of Beasts", author: 'Hilaire Belloc', year: 1896, language: 'English', region: 'England', confidence: 'established',
    summary: 'A collection of comic verses about animals, with drawings by B. T. B., written in the mock-instructional tone of the Victorian primer; a classic of light and witty verse for children.',
    kw: ['belloc', 'comic verse', 'animals', 'mock didactic', 'light verse', 'victorian humour'], genres: ['light verse', "children's poetry"],
  },
  {
    id: 'work-kid-peacock-pie', kind: 'work', name: 'Peacock Pie', author: 'Walter de la Mare', year: 1913, language: 'English', region: 'England', confidence: 'established',
    summary: 'A collection of rhymes and lyrics for children by an English poet, mixing nursery-rhyme play with moments of strangeness; admired for its musical, precise language.',
    kw: ['de la mare', 'nursery rhyme', 'lyric', 'strangeness', 'edwardian poetry', 'musical verse'], genres: ["children's poetry", 'nursery rhyme'],
  },
  {
    id: 'work-kid-when-we-were-very-young', kind: 'work', name: 'When We Were Very Young', author: 'A. A. Milne', year: 1924, language: 'English', region: 'England', confidence: 'established',
    summary: 'A collection of light verse about childhood, illustrated by E. H. Shepard; a model of rhythm and comic observation in poetry for young children, and a companion to the Pooh books.',
    kw: ['milne', 'shepard', 'light verse', 'childhood', 'rhythm', 'comic observation'], genres: ["children's poetry", 'light verse'],
  },
  {
    id: 'work-kid-the-dream-keeper', kind: 'work', name: 'The Dream Keeper and Other Poems', author: 'Langston Hughes', year: 1932, language: 'English', region: 'United States', confidence: 'established',
    summary: "A collection of poems chosen for young readers from the work of a leading Harlem Renaissance poet, with themes of dreams, music and Black American life; an early landmark of Black children's poetry.",
    kw: ['hughes', 'harlem renaissance', 'young readers', 'dreams', 'jazz rhythm', 'black american poetry'], genres: ["children's poetry", 'lyric poetry'],
  },
  {
    id: 'work-kid-old-possums-book', kind: 'work', name: "Old Possum's Book of Practical Cats", author: 'T. S. Eliot', year: 1939, language: 'English', region: 'England', confidence: 'established',
    summary: 'A collection of comic poems about cats of many characters by a major modernist poet, in bouncing light-verse metres; later adapted as a stage musical.',
    kw: ['eliot', 'cats', 'light verse', 'comic characters', 'rhyme', 'practical cats'], genres: ['light verse', "children's poetry"],
  },
  {
    id: 'work-kid-bronzeville-boys-and-girls', kind: 'work', name: 'Bronzeville Boys and Girls', author: 'Gwendolyn Brooks', year: 1956, language: 'English', region: 'United States', confidence: 'established',
    summary: "A collection of short poems about children in a Black neighbourhood of Chicago by a major American poet; notable for treating children's inner lives with seriousness and respect.",
    kw: ['brooks', 'chicago', 'children\'s poems', 'black american poetry', 'neighbourhood', 'child voice'], genres: ["children's poetry", 'lyric poetry'],
  },
  {
    id: 'work-kid-hailstones-and-halibut-bones', kind: 'work', name: 'Hailstones and Halibut Bones', author: 'Mary O\'Neill', year: 1961, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A collection of poems that each explore a colour through images, feelings and sounds; a well-known model of a concept built through figurative language.',
    kw: ['o\'neill', 'colours', 'imagery', 'concept poems', 'figurative language', 'classroom poetry'], genres: ["children's poetry", 'concept poetry'],
  },
  {
    id: 'work-kid-alligator-pie', kind: 'work', name: 'Alligator Pie', author: 'Dennis Lee', year: 1974, language: 'English', region: 'Canada', confidence: 'established',
    summary: 'A collection of rhythmic, playful verse rooted in Canadian childhood, with a title poem that became a favourite chant; a landmark of Canadian poetry for children.',
    kw: ['lee', 'canadian children\'s poetry', 'chant', 'playground rhyme', 'rhythm', 'nonsense'], genres: ["children's poetry", 'light verse'],
  },
  {
    id: 'work-kid-where-the-sidewalk-ends', kind: 'work', name: 'Where the Sidewalk Ends', author: 'Shel Silverstein', year: 1974, language: 'English', region: 'United States', confidence: 'established',
    summary: "A collection of comic and offbeat poems, with the poet's own line drawings; one of the most widely read books of children's verse in English.",
    kw: ['silverstein', 'comic poems', 'line drawings', 'offbeat humour', 'light verse', 'classroom poetry'], genres: ["children's poetry", 'light verse'],
  },
  {
    id: 'work-kid-revolting-rhymes', kind: 'work', name: 'Revolting Rhymes', author: 'Roald Dahl', year: 1982, language: 'English', region: 'England', confidence: 'established',
    summary: 'A collection of rhyming retellings of well-known fairy tales with sharp, comic twists, illustrated by Quentin Blake; a model of parody in verse for young readers.',
    kw: ['dahl', 'blake', 'fairy tale parody', 'rhyming couplets', 'comic twist', 'retelling in verse'], genres: ["children's poetry", 'fairy-tale parody', 'verse story'],
  },
  {
    id: 'work-kid-please-mrs-butler', kind: 'work', name: 'Please Mrs Butler', author: 'Allan Ahlberg', year: 1983, language: 'English', region: 'England', confidence: 'established',
    summary: 'A collection of comic poems about school life in the voice of its pupils, illustrated by Fritz Wegner; a classic of classroom humour and of poetry from a child\'s point of view.',
    kw: ['ahlberg', 'school poems', 'comic poems', 'child narrator', 'classroom humour', 'wegner'], genres: ["children's poetry", 'light verse'],
  },
  {
    id: 'work-kid-the-new-kid-on-the-block', kind: 'work', name: 'The New Kid on the Block', author: 'Jack Prelutsky', year: 1984, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A collection of humorous poems on odd characters and everyday annoyances, illustrated by James Stevenson; a popular example of rhythmic, comic verse written for reading aloud.',
    kw: ['prelutsky', 'humorous poetry', 'read aloud', 'comic characters', 'rhythm', 'light verse'], genres: ["children's poetry", 'light verse'],
  },
  {
    id: 'work-kid-joyful-noise', kind: 'work', name: 'Joyful Noise: Poems for Two Voices', author: 'Paul Fleischman', year: 1988, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A collection of poems about insects written to be read aloud by two performers at once, with interlocking parts; a distinctive model of poetry as performance.',
    kw: ['fleischman', 'two voices', 'insects', 'performance poetry', 'choral reading', 'read aloud'], genres: ["children's poetry", 'performance poetry'],
  },
  // ---- Middle grade: nineteenth and early twentieth-century classics ----
  {
    id: 'work-kid-the-water-babies', kind: 'work', name: 'The Water-Babies', author: 'Charles Kingsley', year: 1863, language: 'English', region: 'England', confidence: 'established',
    summary: "A Victorian fantasy about a chimney sweep's boy who becomes a water-baby and learns by adventure; it mixes natural history, moral satire and fairy tale, and is now read with attention to its period attitudes.",
    kw: ['kingsley', 'victorian fantasy', 'chimney sweep', 'moral fairy tale', 'satire', 'underwater'], genres: ['fantasy', 'moral tale'],
  },
  {
    id: 'work-kid-the-princess-and-the-goblin', kind: 'work', name: 'The Princess and the Goblin', author: 'George MacDonald', year: 1872, language: 'English', region: 'Scotland', confidence: 'established',
    summary: 'A fantasy about a young princess, a miner\'s son and goblins living beneath a mountain; an influential Victorian fantasy admired by later fantasy writers, including C. S. Lewis.',
    kw: ['macdonald', 'goblins', 'victorian fantasy', 'princess', 'mines', 'fairy tale novel'], genres: ['fantasy', 'fairy tale'],
  },
  {
    id: 'work-kid-through-the-looking-glass', kind: 'work', name: 'Through the Looking-Glass, and What Alice Found There', author: 'Lewis Carroll', year: 1871, language: 'English', region: 'England', confidence: 'established',
    summary: "The sequel to Alice's Adventures in Wonderland, a dream-fantasy structured around a chess game and containing the nonsense poem Jabberwocky; a landmark of invented words and playful logic.",
    kw: ['carroll', 'jabberwocky', 'chess', 'portmanteau words', 'nonsense', 'victorian fantasy'], genres: ['fantasy', 'nonsense literature'],
  },
  {
    id: 'work-kid-little-women', kind: 'work', name: 'Little Women', author: 'Louisa May Alcott', year: 1868, language: 'English', region: 'United States', confidence: 'established',
    summary: "A novel of four sisters growing up in New England during and after the Civil War, drawing on the author's own family; a foundational American family story and a model of the domestic novel for girls.",
    kw: ['alcott', 'sisters', 'domestic novel', 'coming of age', 'civil war era', 'family story'], genres: ['domestic novel', 'coming-of-age story'],
  },
  {
    id: 'work-kid-black-beauty', kind: 'work', name: 'Black Beauty', author: 'Anna Sewell', year: 1877, language: 'English', region: 'England', confidence: 'established',
    summary: 'A novel narrated in the first person by a horse who tells of his changing owners; written to encourage kindness to animals and one of the best-known animal autobiographies.',
    kw: ['sewell', 'horse', 'animal narrator', 'animal welfare', 'autobiography of an animal', 'first person animal'], genres: ['animal story', 'fictional autobiography'],
  },
  {
    id: 'work-kid-tom-sawyer', kind: 'work', name: 'The Adventures of Tom Sawyer', author: 'Mark Twain', year: 1876, language: 'English', region: 'United States', confidence: 'established',
    summary: "A novel of a mischievous boy's adventures in a Mississippi River town, mixing comedy, nostalgia and real menace; a foundational American boyhood story and the companion to Adventures of Huckleberry Finn.",
    kw: ['twain', 'boyhood', 'mississippi', 'mischief', 'small town', 'american boy book'], genres: ['boyhood novel', 'adventure novel', 'regional fiction'],
  },
  {
    id: 'work-kid-heidi', kind: 'work', name: 'Heidi', author: 'Johanna Spyri', year: 1880, language: 'German', region: 'Switzerland', confidence: 'established',
    summary: 'A Swiss novel about an orphan girl sent to live with her grandfather in the Alps and later taken to a city; a classic of home, nature and belonging, translated around the world.',
    kw: ['spyri', 'alps', 'orphan', 'switzerland', 'homesickness', 'heidis lehr- und wanderjahre'], genres: ['children\'s classic', 'domestic novel'],
  },
  {
    id: 'work-kid-treasure-island', kind: 'work', name: 'Treasure Island', author: 'Robert Louis Stevenson', year: 1883, language: 'English', region: 'Scotland', confidence: 'established',
    summary: 'An adventure novel narrated by a boy who sails in search of buried treasure alongside pirates; it helped shape later pirate stories, including the treasure map, and is often read by older children.',
    kw: ['stevenson', 'pirates', 'treasure map', 'adventure', 'first person narrator', 'long john silver'], genres: ['adventure novel', 'pirate fiction'],
  },
  {
    id: 'work-kid-the-jungle-book', kind: 'work', name: 'The Jungle Book', author: 'Rudyard Kipling', year: 1894, language: 'English', region: 'England', confidence: 'established',
    summary: 'A collection of stories, mostly about Mowgli, a boy raised by wolves in an Indian jungle, with other animal tales; written in the British colonial era and now read with attention to its period attitudes.',
    kw: ['kipling', 'mowgli', 'jungle', 'animal tales', 'law of the jungle', 'rikki-tikki-tavi'], genres: ['animal story', 'story collection', 'adventure'],
  },
  {
    id: 'work-kid-just-so-stories', kind: 'work', name: 'Just So Stories', author: 'Rudyard Kipling', year: 1902, language: 'English', region: 'England', confidence: 'established',
    summary: "A collection of playful pourquoi tales, written in a read-aloud voice, explaining how animals came to be as they are, with the author's own illustrations; a model of oral, rhythmic children's prose.",
    kw: ['kipling', 'pourquoi tales', 'how the animals', 'read aloud', 'oral style', 'origin stories'], genres: ['pourquoi tale', 'story collection'],
  },
  {
    id: 'work-kid-five-children-and-it', kind: 'work', name: 'Five Children and It', author: 'E. Nesbit', year: 1902, language: 'English', region: 'England', confidence: 'established',
    summary: 'A fantasy in which siblings meet a grumpy sand-fairy who grants one wish a day, with unintended consequences; a model of magic with rules, set inside realistic family life.',
    kw: ['nesbit', 'wishes', 'psammead', 'magic with rules', 'edwardian children\'s fantasy', 'unintended consequences'], genres: ['fantasy', 'family story'],
  },
  {
    id: 'work-kid-a-little-princess', kind: 'work', name: 'A Little Princess', author: 'Frances Hodgson Burnett', year: 1905, language: 'English', region: 'England', confidence: 'established',
    summary: 'A novel about a girl at a London boarding school whose fortunes change sharply and who keeps her dignity through imagination and kindness; an expansion of the author\'s earlier story Sara Crewe.',
    kw: ['burnett', 'boarding school', 'sara crewe', 'rags to riches', 'imagination', 'orphan'], genres: ['school story', "children's classic"],
  },
  {
    id: 'work-kid-the-railway-children', kind: 'work', name: 'The Railway Children', author: 'E. Nesbit', year: 1906, language: 'English', region: 'England', confidence: 'established',
    summary: 'A family story about three children who move to a house near a railway after their father is suddenly taken away; a classic of Edwardian child-centred realism with a warm, direct narrator.',
    kw: ['nesbit', 'railway', 'family story', 'edwardian', 'realism', 'children in a crisis'], genres: ['family story', 'domestic realism'],
  },
  {
    id: 'work-kid-wind-in-the-willows', kind: 'work', name: 'The Wind in the Willows', author: 'Kenneth Grahame', year: 1908, language: 'English', region: 'England', confidence: 'established',
    summary: 'A novel in loosely linked episodes about riverbank animals, their friendships, homes and mishaps; a standard of English pastoral animal fantasy.',
    kw: ['grahame', 'riverbank', 'toad', 'mole and rat', 'animal fantasy', 'pastoral'], genres: ['animal fantasy', 'pastoral fiction'],
  },
  {
    id: 'work-kid-anne-of-green-gables', kind: 'work', name: 'Anne of Green Gables', author: 'L. M. Montgomery', year: 1908, language: 'English', region: 'Canada', confidence: 'established',
    summary: 'A novel about an imaginative orphan girl who is sent by mistake to a farm on Prince Edward Island; a landmark of Canadian literature and of the growing-up story for girls.',
    kw: ['montgomery', 'prince edward island', 'orphan', 'imagination', 'coming of age', 'canadian classic'], genres: ['coming-of-age story', 'domestic novel'],
  },
  {
    id: 'work-kid-peter-and-wendy', kind: 'work', name: 'Peter and Wendy', author: 'J. M. Barrie', year: 1911, language: 'English', region: 'Scotland', confidence: 'established',
    summary: "The novel version of Barrie's Peter Pan story, narrated in a knowing, ironic adult voice that comments on childhood; a landmark of narrative voice in children's fantasy.",
    kw: ['barrie', 'peter pan', 'never land', 'narrator voice', 'ironic narrator', 'childhood and growing up'], genres: ['fantasy', 'adventure novel'],
  },
  {
    id: 'work-kid-the-secret-garden', kind: 'work', name: 'The Secret Garden', author: 'Frances Hodgson Burnett', year: 1911, language: 'English', region: 'England', confidence: 'established',
    summary: 'A novel about a lonely girl sent to a Yorkshire manor who discovers a locked garden; a classic of healing through nature and friendship, with a strong sense of place.',
    kw: ['burnett', 'yorkshire', 'garden', 'healing', 'orphan', 'secret place'], genres: ["children's classic", 'domestic novel'],
  },
  {
    id: 'work-kid-pollyanna', kind: 'work', name: 'Pollyanna', author: 'Eleanor H. Porter', year: 1913, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel about an orphan girl whose habit of finding something to be glad about changes a town; so well known that its name entered English as a word for relentless optimism.',
    kw: ['porter', 'optimism', 'glad game', 'orphan', 'small town', 'pollyannaish'], genres: ["children's classic", 'sentimental fiction'],
  },
  {
    id: 'work-kid-the-story-of-doctor-dolittle', kind: 'work', name: 'The Story of Doctor Dolittle', author: 'Hugh Lofting', year: 1920, language: 'English', region: 'England', confidence: 'established',
    summary: 'A novel about a country doctor who learns the languages of animals and sails on an adventure; the first of a long series, whose original text contains period stereotypes that later editions altered.',
    kw: ['lofting', 'talking to animals', 'doctor', 'animal languages', 'voyage', 'series'], genres: ['animal fantasy', 'adventure novel'],
  },
  {
    id: 'work-kid-bambi', kind: 'work', name: 'Bambi', author: 'Felix Salten', year: 1923, language: 'German', region: 'Austria', confidence: 'established',
    summary: "A novel following a young deer from birth to maturity in the forest, told from the animals' perspective with little human presence; a serious, lyrical example of the realistic animal novel.",
    kw: ['salten', 'deer', 'forest', 'realistic animal story', 'bambi eine lebensgeschichte', 'nature'], genres: ['animal story', 'nature fiction'],
  },
  {
    id: 'work-kid-winnie-the-pooh', kind: 'work', name: 'Winnie-the-Pooh', author: 'A. A. Milne', year: 1926, language: 'English', region: 'England', confidence: 'established',
    summary: "A collection of linked stories about a toy bear and his friends, illustrated by E. H. Shepard; known for gentle humour, wordplay and a narrator who talks directly with a child listener.",
    kw: ['milne', 'shepard', 'toy bear', 'hundred acre wood', 'narrator and listener', 'wordplay'], genres: ['animal fantasy', 'story cycle'],
  },
  {
    id: 'work-kid-swallows-and-amazons', kind: 'work', name: 'Swallows and Amazons', author: 'Arthur Ransome', year: 1930, language: 'English', region: 'England', confidence: 'established',
    summary: 'An adventure novel about siblings who sail and camp on an island in a lake and play at pirates; the first of a series admired for taking children\'s imaginative play seriously and for its sailing detail.',
    kw: ['ransome', 'sailing', 'island camping', 'make-believe', 'lake district', 'series'], genres: ['adventure novel', 'family story'],
  },
  {
    id: 'work-kid-little-house-in-the-big-woods', kind: 'work', name: 'Little House in the Big Woods', author: 'Laura Ingalls Wilder', year: 1932, language: 'English', region: 'United States', confidence: 'established',
    summary: "A novel drawn from the author's childhood in a Wisconsin log cabin in the 1870s, narrated plainly through a child's eyes; the first of the Little House series, now read with attention to its portrayal of Native peoples.",
    kw: ['wilder', 'pioneer life', 'log cabin', 'frontier', 'autobiographical fiction', 'little house series'], genres: ['historical fiction', 'autobiographical fiction'],
  },
  {
    id: 'work-kid-mary-poppins', kind: 'work', name: 'Mary Poppins', author: 'P. L. Travers', year: 1934, language: 'English', region: 'England', confidence: 'established',
    summary: 'A novel in loosely linked episodes about a nanny with magical powers who joins a London family; its stern, enigmatic central character differs notably from later screen versions.',
    kw: ['travers', 'nanny', 'magic', 'london', 'episodic novel', 'enigmatic protagonist'], genres: ['fantasy', 'episodic novel'],
  },
  {
    id: 'work-kid-ballet-shoes', kind: 'work', name: 'Ballet Shoes', author: 'Noel Streatfeild', year: 1936, language: 'English', region: 'England', confidence: 'established',
    summary: 'A family story about three adopted sisters who train at a London stage school to earn money; the first of the author\'s Shoes books and a model of the vocation-and-career novel for girls.',
    kw: ['streatfeild', 'stage school', 'sisters', 'vocation', 'career novel', 'london'], genres: ['family story', 'career novel'],
  },
  // ---- Middle grade: mid-century classics ----
  {
    id: 'work-kid-stuart-little', kind: 'work', name: 'Stuart Little', author: 'E. B. White', year: 1945, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A short novel about a mouse born into a human family, told as a series of small adventures in a plain, matter-of-fact style; known for treating the fantastic as ordinary and for an open ending.',
    kw: ['white', 'mouse', 'matter of fact fantasy', 'plain style', 'open ending', 'new york'], genres: ['fantasy', 'episodic novel'],
  },
  {
    id: 'work-kid-the-hundred-dresses', kind: 'work', name: 'The Hundred Dresses', author: 'Eleanor Estes', year: 1944, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A short novel about a girl teased at school over her poor clothing and the classmates who later reconsider how they acted; a classic treatment of bystanders and quiet cruelty.',
    kw: ['estes', 'bullying', 'bystander', 'school', 'guilt', 'immigrant child'], genres: ['school story', 'realistic fiction'],
  },
  {
    id: 'work-kid-johnny-tremain', kind: 'work', name: 'Johnny Tremain', author: 'Esther Forbes', year: 1943, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A historical novel about an apprentice silversmith in Boston as the American Revolution begins; widely taught as an example of historical fiction told through an ordinary young person.',
    kw: ['forbes', 'american revolution', 'boston', 'apprentice', 'historical fiction', 'taught in schools'], genres: ['historical fiction'],
  },
  {
    id: 'work-kid-eagle-of-the-ninth', kind: 'work', name: 'The Eagle of the Ninth', author: 'Rosemary Sutcliff', year: 1954, language: 'English', region: 'England', confidence: 'established',
    summary: 'A historical novel set in Roman Britain about a young officer who searches for the lost emblem of a vanished legion; a defining example of children\'s historical fiction with a strong sense of landscape.',
    kw: ['sutcliff', 'roman britain', 'lost legion', 'historical adventure', 'quest', 'landscape'], genres: ['historical fiction', 'adventure novel'],
  },
  {
    id: 'work-kid-the-borrowers', kind: 'work', name: 'The Borrowers', author: 'Mary Norton', year: 1952, language: 'English', region: 'England', confidence: 'established',
    summary: 'A fantasy about tiny people who live beneath the floorboards of a house and survive by borrowing from the humans above; a model of detailed small-scale world-building.',
    kw: ['norton', 'tiny people', 'miniature world', 'world-building', 'household fantasy', 'arrietty'], genres: ['fantasy', 'miniature world fiction'],
  },
  {
    id: 'work-kid-charlottes-web', kind: 'work', name: "Charlotte's Web", author: 'E. B. White', year: 1952, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel about a pig, a spider and a farm girl; a model of plain, exact prose and of how a children\'s book can handle friendship, loyalty and death.',
    kw: ['white', 'pig', 'spider', 'farm', 'friendship', 'death in children\'s books', 'plain style'], genres: ['animal fantasy', "children's classic"],
  },
  {
    id: 'work-kid-the-hundred-and-one-dalmatians', kind: 'work', name: 'The Hundred and One Dalmatians', author: 'Dodie Smith', year: 1956, language: 'English', region: 'England', confidence: 'established',
    summary: 'A comic adventure about two dogs and their owners whose puppies are stolen; notable for its warm, wry narrator and its strong dog\'s-eye view of London households.',
    kw: ['smith', 'dalmatians', 'dogs', 'puppies', 'london', 'comic adventure'], genres: ['animal fantasy', 'adventure novel'],
  },
  {
    id: 'work-kid-a-bear-called-paddington', kind: 'work', name: 'A Bear Called Paddington', author: 'Michael Bond', year: 1958, language: 'English', region: 'England', confidence: 'established',
    summary: 'A comic novel in episodes about a polite bear from Peru adopted by a London family; a model of gentle comedy in which good manners meet chaos.',
    kw: ['bond', 'paddington', 'bear', 'immigrant bear', 'london', 'comedy of manners', 'episodic'], genres: ['comic fantasy', 'episodic novel'],
  },
  {
    id: 'work-kid-toms-midnight-garden', kind: 'work', name: "Tom's Midnight Garden", author: 'Philippa Pearce', year: 1958, language: 'English', region: 'England', confidence: 'established',
    summary: 'A time-slip novel in which a boy staying with relatives finds a garden that appears at night and a friend from another era; a landmark of time fantasy with a quiet, deeply felt ending.',
    kw: ['pearce', 'time slip', 'garden', 'time fantasy', 'loneliness', 'carnegie medal'], genres: ['time fantasy', 'ghost story'],
  },
  {
    id: 'work-kid-the-witch-of-blackbird-pond', kind: 'work', name: 'The Witch of Blackbird Pond', author: 'Elizabeth George Speare', year: 1958, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A historical novel set in seventeenth-century Connecticut about a girl from Barbados who arrives among strict Puritan relatives; known for its theme of suspicion of outsiders.',
    kw: ['speare', 'puritans', 'connecticut', 'witch suspicion', 'outsider', 'historical fiction'], genres: ['historical fiction'],
  },
  {
    id: 'work-kid-island-of-the-blue-dolphins', kind: 'work', name: 'Island of the Blue Dolphins', author: "Scott O'Dell", year: 1960, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel inspired by the true story of a Native American girl who lived alone for years on an island off California; a long-standing school read on survival and self-reliance.',
    kw: ["o'dell", 'survival', 'island', 'native american', 'solitude', 'based on true events'], genres: ['survival story', 'historical fiction'],
  },
  {
    id: 'work-kid-where-the-red-fern-grows', kind: 'work', name: 'Where the Red Fern Grows', author: 'Wilson Rawls', year: 1961, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel about a boy in the Ozarks and his two hunting dogs, narrated with strong emotion; a long-standing school read on devotion, hard work and loss.',
    kw: ['rawls', 'ozarks', 'hunting dogs', 'boy and dog', 'grief', 'rural childhood'], genres: ['boy-and-dog story', 'rural fiction'],
  },
  {
    id: 'work-kid-james-and-the-giant-peach', kind: 'work', name: 'James and the Giant Peach', author: 'Roald Dahl', year: 1961, language: 'English', region: 'England', confidence: 'established',
    summary: 'A fantasy about an orphan boy who escapes cruel aunts by travelling in an enormous peach with talking insects; known for its comic-cruel opening and surreal adventure.',
    kw: ['dahl', 'peach', 'insects', 'cruel guardians', 'orphan', 'surreal adventure'], genres: ['fantasy', 'comic fantasy'],
  },
  {
    id: 'work-kid-wolves-of-willoughby-chase', kind: 'work', name: 'The Wolves of Willoughby Chase', author: 'Joan Aiken', year: 1962, language: 'English', region: 'England', confidence: 'established',
    summary: 'A melodramatic adventure set in an alternate nineteenth-century England overrun by wolves, about two cousins and a cruel governess; the first of the Wolves Chronicles and a model of affectionate melodrama.',
    kw: ['aiken', 'alternate history', 'wolves', 'governess', 'melodrama', 'orphan peril'], genres: ['alternate history', 'adventure novel'],
  },
  {
    id: 'work-kid-charlie-and-the-chocolate-factory', kind: 'work', name: 'Charlie and the Chocolate Factory', author: 'Roald Dahl', year: 1964, language: 'English', region: 'England', confidence: 'established',
    summary: 'A fantasy in which five children win a tour of an eccentric confectioner\'s factory; a model of comic moral parable, vivid invention and punishment-by-consequence.',
    kw: ['dahl', 'chocolate factory', 'willy wonka', 'golden ticket', 'moral parable', 'comic invention'], genres: ['fantasy', 'moral tale', 'comic fantasy'],
  },
  {
    id: 'work-kid-harriet-the-spy', kind: 'work', name: 'Harriet the Spy', author: 'Louise Fitzhugh', year: 1964, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel about an eleven-year-old who records blunt observations of her neighbours in notebooks and faces consequences when they are read; a landmark of unsentimental, realistic children\'s fiction.',
    kw: ['fitzhugh', 'notebooks', 'spying', 'new york', 'honesty', 'realistic children\'s fiction'], genres: ['realistic fiction', 'school story'],
  },
  {
    id: 'work-kid-from-the-mixed-up-files', kind: 'work', name: 'From the Mixed-Up Files of Mrs. Basil E. Frankweiler', author: 'E. L. Konigsburg', year: 1967, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel about two siblings who run away to live in a New York art museum and chase a mystery about a statue; framed as a letter from an eccentric older woman.',
    kw: ['konigsburg', 'museum', 'runaway', 'art mystery', 'framing device', 'new york'], genres: ['mystery', 'realistic fiction'],
  },
  {
    id: 'work-kid-the-mouse-and-his-child', kind: 'work', name: 'The Mouse and His Child', author: 'Russell Hoban', year: 1967, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A fantasy about a clockwork toy mouse and his child who set out to become self-winding; a philosophical and sometimes dark novel read across ages.',
    kw: ['hoban', 'clockwork toys', 'philosophical fantasy', 'quest', 'toy story', 'dark children\'s fiction'], genres: ['fantasy', 'toy story'],
  },
  {
    id: 'work-kid-the-owl-service', kind: 'work', name: 'The Owl Service', author: 'Alan Garner', year: 1967, language: 'English', region: 'England', confidence: 'established',
    summary: 'A novel in which an old Welsh legend begins to repeat itself among three teenagers in a valley; a landmark of myth-driven fantasy for older children and young adults.',
    kw: ['garner', 'welsh myth', 'mabinogion', 'teenagers', 'folklore', 'blodeuwedd'], genres: ['mythic fantasy', 'ghost story'],
  },
  {
    id: 'work-kid-the-iron-man', kind: 'work', name: 'The Iron Man', author: 'Ted Hughes', year: 1968, language: 'English', region: 'England', aka: ['The Iron Giant'], confidence: 'established',
    summary: 'A short novel in five episodes about a giant made of iron who appears from the sea and a boy who befriends him; written by a major poet in a spare, mythic style.',
    kw: ['hughes', 'iron giant', 'myth', 'giant', 'poet as children\'s author', 'episodic'], genres: ['mythic fantasy', 'science fiction for children'],
  },
  {
    id: 'work-kid-fantastic-mr-fox', kind: 'work', name: 'Fantastic Mr Fox', author: 'Roald Dahl', year: 1970, language: 'English', region: 'England', confidence: 'established',
    summary: 'A short comic novel in which a clever fox outwits three farmers who try to dig him out; a model of brisk plotting and a hero who succeeds by wit.',
    kw: ['dahl', 'fox', 'farmers', 'wit', 'comic plotting', 'short novel'], genres: ['animal fantasy', 'comic fantasy'],
  },
  {
    id: 'work-kid-mrs-frisby-and-the-rats-of-nimh', kind: 'work', name: 'Mrs. Frisby and the Rats of NIMH', author: 'Robert C. O\'Brien', year: 1971, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel about a widowed field mouse who seeks help from a colony of unusually intelligent rats; a blend of animal fantasy and science fiction.',
    kw: ["o'brien", 'field mouse', 'intelligent rats', 'animal science fiction', 'laboratory', 'nimh'], genres: ['animal fantasy', 'science fiction for children'],
  },
  {
    id: 'work-kid-watership-down', kind: 'work', name: 'Watership Down', author: 'Richard Adams', year: 1972, language: 'English', region: 'England', confidence: 'established',
    summary: 'A novel about rabbits who leave their warren in search of a new home, with their own mythology and a few invented words; a widely read crossover novel shelved as adult, young adult or children\'s.',
    kw: ['adams', 'rabbits', 'warren', 'animal epic', 'invented language', 'crossover novel'], genres: ['animal fantasy', 'epic', 'quest story'],
  },
  {
    id: 'work-kid-tuck-everlasting', kind: 'work', name: 'Tuck Everlasting', author: 'Natalie Babbitt', year: 1975, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A short fantasy about a girl who learns a family\'s secret about living forever; a reflective, lyrical middle-grade novel about mortality and choice.',
    kw: ['babbitt', 'immortality', 'mortality', 'lyrical prose', 'moral question', 'secret'], genres: ['fantasy', 'philosophical fiction'],
  },
  {
    id: 'work-kid-roll-of-thunder-hear-my-cry', kind: 'work', name: 'Roll of Thunder, Hear My Cry', author: 'Mildred D. Taylor', year: 1976, language: 'English', region: 'United States', confidence: 'established',
    summary: "A novel told through a young girl about a Black farming family in Depression-era Mississippi, centred on land, dignity and racism; the best known of the Logan family books.",
    kw: ['taylor', 'mississippi', 'great depression', 'racism', 'land ownership', 'logan family', 'jim crow'], genres: ['historical fiction', 'family saga'],
  },
  {
    id: 'work-kid-bridge-to-terabithia', kind: 'work', name: 'Bridge to Terabithia', author: 'Katherine Paterson', year: 1977, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel about two lonely children who invent an imaginary kingdom in the woods; known for a quiet, realistic treatment of friendship and grief.',
    kw: ['paterson', 'imaginary kingdom', 'friendship', 'grief', 'loss', 'realistic fiction with fantasy play'], genres: ['realistic fiction', 'problem novel'],
  },
  {
    id: 'work-kid-the-westing-game', kind: 'work', name: 'The Westing Game', author: 'Ellen Raskin', year: 1978, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A puzzle mystery in which a large cast of heirs competes to solve a dead millionaire\'s game; a classic of the clue-driven, fair-play mystery for middle-grade readers.',
    kw: ['raskin', 'puzzle mystery', 'heirs', 'fair play clues', 'ensemble cast', 'red herrings'], genres: ['mystery', 'puzzle novel'],
  },
  {
    id: 'work-kid-the-witches', kind: 'work', name: 'The Witches', author: 'Roald Dahl', year: 1983, language: 'English', region: 'England', confidence: 'established',
    summary: 'A dark comic fantasy in which a boy and his grandmother learn that witches are real and disguised as ordinary women; known for its blend of menace and comedy.',
    kw: ['dahl', 'witches', 'grandmother', 'dark comedy', 'children\'s horror', 'disguise'], genres: ['dark fantasy', 'comic fantasy'],
  },
  {
    id: 'work-kid-the-bfg', kind: 'work', name: 'The BFG', author: 'Roald Dahl', year: 1982, language: 'English', region: 'England', confidence: 'established',
    summary: 'A fantasy about an orphan girl and a gentle giant who blows dreams into children\'s bedrooms; known for its invented, comically garbled vocabulary.',
    kw: ['dahl', 'giant', 'dreams', 'invented words', 'gobblefunk', 'orphan girl'], genres: ['fantasy', 'comic fantasy'],
  },
  {
    id: 'work-kid-matilda', kind: 'work', name: 'Matilda', author: 'Roald Dahl', year: 1988, language: 'English', region: 'England', confidence: 'established',
    summary: 'A comic novel about a gifted girl who loves reading and faces neglectful parents and a tyrannical headmistress; a classic of the clever child against unjust adults.',
    kw: ['dahl', 'reading', 'gifted child', 'tyrannical headmistress', 'telekinesis', 'comic cruelty'], genres: ['comic fantasy', 'school story'],
  },
  // ---- Middle grade: late twentieth century to today ----
  {
    id: 'work-kid-are-you-there-god-its-me-margaret', kind: 'work', name: "Are You There God? It's Me, Margaret.", author: 'Judy Blume', year: 1970, language: 'English', region: 'United States', confidence: 'established',
    summary: "A first-person novel in which an eleven-year-old girl voices her questions about religion, friendship and growing up; a landmark of frank, child-centred realism that has also been challenged in libraries.",
    kw: ['blume', 'puberty', 'religion', 'friendship', 'first person', 'banned and challenged books'], genres: ['realistic fiction', 'coming-of-age story'],
  },
  {
    id: 'work-kid-tales-of-a-fourth-grade-nothing', kind: 'work', name: 'Tales of a Fourth Grade Nothing', author: 'Judy Blume', year: 1972, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A comic novel narrated by a boy who feels outshone by his mischievous younger brother; a model of humour built on a child narrator\'s exasperated, believable voice.',
    kw: ['blume', 'siblings', 'comic narrator', 'family comedy', 'first person', 'fourth grade'], genres: ['comic fiction', 'family story'],
  },
  {
    id: 'work-kid-bunnicula', kind: 'work', name: 'Bunnicula', author: 'James Howe', year: 1979, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A comic mystery narrated by a family dog who suspects the household\'s new pet rabbit of being a vampire; a model of parody horror for beginning chapter-book readers.',
    kw: ['howe', 'vampire rabbit', 'dog narrator', 'horror parody', 'comic mystery', 'pet story'], genres: ['comic mystery', 'horror parody'],
  },
  {
    id: 'work-kid-scary-stories-to-tell-in-the-dark', kind: 'work', name: 'Scary Stories to Tell in the Dark', author: 'Alvin Schwartz', year: 1981, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A collection of folklore-based scary tales and rhymes retold for young readers, with illustrations by Stephen Gammell; a standard model of horror built for telling aloud, and a frequent target of challenges.',
    kw: ['schwartz', 'gammell', 'folklore horror', 'campfire stories', 'urban legends', 'told aloud'], genres: ['horror', 'folklore collection'],
  },
  {
    id: 'work-kid-goodnight-mister-tom', kind: 'work', name: 'Goodnight Mister Tom', author: 'Michelle Magorian', year: 1981, language: 'English', region: 'England', confidence: 'established',
    summary: 'A novel about a boy evacuated from London at the start of the Second World War and the gruff older man who takes him in; a classic of home-front historical fiction.',
    kw: ['magorian', 'evacuee', 'second world war', 'home front', 'foster family', 'historical fiction'], genres: ['historical fiction', 'war story'],
  },
  {
    id: 'work-kid-war-horse', kind: 'work', name: 'War Horse', author: 'Michael Morpurgo', year: 1982, language: 'English', region: 'England', confidence: 'established',
    summary: 'A novel narrated by a horse that is sold to the army and sent to the First World War; an example of an animal narrator used to observe war without taking sides.',
    kw: ['morpurgo', 'first world war', 'horse narrator', 'animal narrator', 'war story', 'historical fiction'], genres: ['historical fiction', 'animal story', 'war story'],
  },
  {
    id: 'work-kid-dear-mr-henshaw', kind: 'work', name: 'Dear Mr. Henshaw', author: 'Beverly Cleary', year: 1983, language: 'English', region: 'United States', confidence: 'established',
    summary: 'An epistolary novel of letters and diary entries by a boy writing to his favourite author, which gradually reveal his family troubles; a model of a young voice discovering writing.',
    kw: ['cleary', 'letters', 'diary', 'epistolary', 'young writer', 'divorce'], genres: ['epistolary novel', 'realistic fiction'],
  },
  {
    id: 'work-kid-sarah-plain-and-tall', kind: 'work', name: 'Sarah, Plain and Tall', author: 'Patricia MacLachlan', year: 1985, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A very short historical novel about a prairie family and a woman from the coast who answers an advertisement to become the children\'s stepmother; known for spare, poetic prose.',
    kw: ['maclachlan', 'prairie', 'spare prose', 'stepmother', 'historical fiction', 'short novel'], genres: ['historical fiction', 'short novel'],
  },
  {
    id: 'work-kid-redwall', kind: 'work', name: 'Redwall', author: 'Brian Jacques', year: 1986, language: 'English', region: 'England', confidence: 'established',
    summary: 'The first of a long fantasy series about woodland animals defending their abbey from invaders; a well-known model of animal heroic fantasy, with feasts, riddles and songs.',
    kw: ['jacques', 'animal fantasy', 'abbey', 'mice and rats', 'series', 'heroic fantasy'], genres: ['animal fantasy', 'epic fantasy', 'series fiction'],
  },
  {
    id: 'work-kid-hatchet', kind: 'work', name: 'Hatchet', author: 'Gary Paulsen', year: 1987, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A survival novel about a thirteen-year-old stranded in the Canadian wilderness after a plane crash, equipped with little but a hatchet; known for lean, immediate prose and close attention to practical detail.',
    kw: ['paulsen', 'wilderness survival', 'plane crash', 'solitude', 'lean prose', 'brian robeson'], genres: ['survival story', 'adventure novel'],
  },
  {
    id: 'work-kid-number-the-stars', kind: 'work', name: 'Number the Stars', author: 'Lois Lowry', year: 1989, language: 'English', region: 'United States', confidence: 'established',
    summary: "A historical novel set in occupied Denmark in 1943 about a girl whose family helps shelter her Jewish friend; widely taught as an introduction to the Holocaust for younger readers.",
    kw: ['lowry', 'denmark', 'holocaust', 'resistance', 'second world war', 'friendship'], genres: ['historical fiction', 'war story'],
  },
  {
    id: 'work-kid-maniac-magee', kind: 'work', name: 'Maniac Magee', author: 'Jerry Spinelli', year: 1990, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel about an orphaned boy who becomes a local legend in a town divided by race; it blends tall-tale narration with realistic scenes of prejudice and belonging.',
    kw: ['spinelli', 'tall tale', 'racism', 'homelessness', 'legend', 'orphan'], genres: ['realistic fiction', 'tall tale'],
  },
  {
    id: 'work-kid-the-giver', kind: 'work', name: 'The Giver', author: 'Lois Lowry', year: 1993, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A dystopian novel about a boy chosen to hold his community\'s memories in a society that has removed pain and choice; a classic first step into dystopian fiction for young readers.',
    kw: ['lowry', 'dystopia', 'memory', 'utopia gone wrong', 'sameness', 'young dystopian fiction'], genres: ['dystopian fiction', 'science fiction'],
  },
  {
    id: 'work-kid-walk-two-moons', kind: 'work', name: 'Walk Two Moons', author: 'Sharon Creech', year: 1994, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel in which a girl tells of a road trip with her grandparents while recounting the story of a friend; a model of nested narratives and delayed revelation in middle grade.',
    kw: ['creech', 'road trip', 'nested story', 'grief', 'frame narrative', 'first person'], genres: ['realistic fiction', 'frame narrative'],
  },
  {
    id: 'work-kid-the-watsons-go-to-birmingham', kind: 'work', name: 'The Watsons Go to Birmingham - 1963', author: 'Christopher Paul Curtis', year: 1995, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel narrated by a boy in a Black family from Michigan that begins as comic domestic fiction and turns serious when the family travels south during the civil rights era.',
    kw: ['curtis', 'civil rights', 'birmingham', 'family comedy', 'tonal shift', 'first person'], genres: ['historical fiction', 'family story'],
  },
  {
    id: 'work-kid-ella-enchanted', kind: 'work', name: 'Ella Enchanted', author: 'Gail Carson Levine', year: 1997, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A retelling of Cinderella in which a girl is cursed with obedience; a well-known example of a fairy-tale retelling that gives its heroine a reason and a will of her own.',
    kw: ['levine', 'cinderella retelling', 'curse', 'obedience', 'fairy-tale retelling', 'first person'], genres: ['fairy-tale retelling', 'fantasy'],
  },
  {
    id: 'work-kid-holes', kind: 'work', name: 'Holes', author: 'Louis Sachar', year: 1998, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel about a boy sent to a desert detention camp where inmates dig holes all day, intercut with an older story; admired for its tightly interlocking plot and dry humour.',
    kw: ['sachar', 'detention camp', 'interlocking plots', 'curse', 'desert', 'dry humour'], genres: ['mystery', 'adventure novel', 'comic fiction'],
  },
  {
    id: 'work-kid-skellig', kind: 'work', name: 'Skellig', author: 'David Almond', year: 1998, language: 'English', region: 'England', confidence: 'established',
    summary: 'A short novel about a boy who finds a strange, frail being in a derelict garage during a time of family worry; a quietly mystical story that blends realism and wonder.',
    kw: ['almond', 'magic realism', 'garage', 'illness in the family', 'mystery', 'quiet novel'], genres: ['magic realism', 'realistic fiction'],
  },
  {
    id: 'work-kid-the-bad-beginning', kind: 'work', name: 'The Bad Beginning', author: 'Lemony Snicket (Daniel Handler)', year: 1999, language: 'English', region: 'United States', confidence: 'established',
    summary: 'The first of A Series of Unfortunate Events, about three orphans pursued by a scheming relative; known for a darkly comic narrator who addresses the reader and defines unusual words.',
    kw: ['snicket', 'handler', 'orphans', 'gothic comedy', 'intrusive narrator', 'series', 'a series of unfortunate events'], genres: ['gothic fiction for children', 'comic fiction', 'series fiction'],
  },
  {
    id: 'work-kid-bud-not-buddy', kind: 'work', name: 'Bud, Not Buddy', author: 'Christopher Paul Curtis', year: 1999, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A historical novel about a ten-year-old orphan travelling across Depression-era Michigan to find the man he believes is his father; narrated in a lively, rule-making voice.',
    kw: ['curtis', 'great depression', 'orphan', 'jazz', 'road story', 'child narrator'], genres: ['historical fiction', 'picaresque'],
  },
  {
    id: 'work-kid-because-of-winn-dixie', kind: 'work', name: 'Because of Winn-Dixie', author: 'Kate DiCamillo', year: 2000, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A short novel narrated by a girl who adopts a stray dog in a small Florida town and slowly gathers a community of friends; known for its warm voice and gently comic small-town cast.',
    kw: ['dicamillo', 'stray dog', 'small town', 'first person', 'community', 'florida'], genres: ['realistic fiction', 'animal story'],
  },
  {
    id: 'work-kid-esperanza-rising', kind: 'work', name: 'Esperanza Rising', author: 'Pam Muñoz Ryan', year: 2000, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A historical novel about a girl who moves from a wealthy Mexican ranch to a California farm-labour camp during the Great Depression; with chapters named for the crops of the farming year.',
    kw: ['munoz ryan', 'mexican american', 'migrant farm workers', 'great depression', 'class change', 'immigration'], genres: ['historical fiction'],
  },
  {
    id: 'work-kid-the-thief-lord', kind: 'work', name: 'The Thief Lord', author: 'Cornelia Funke', year: 2000, language: 'German', region: 'Germany', confidence: 'established',
    summary: 'A novel about two orphaned brothers who hide in Venice with a band of street children led by a mysterious boy; a blend of adventure, mystery and a touch of magic. Original title Herr der Diebe.',
    kw: ['funke', 'herr der diebe', 'venice', 'street children', 'orphans', 'adventure'], genres: ['adventure novel', 'fantasy'],
  },
  {
    id: 'work-kid-artemis-fowl', kind: 'work', name: 'Artemis Fowl', author: 'Eoin Colfer', year: 2001, language: 'English', region: 'Ireland', confidence: 'established',
    summary: 'A fantasy thriller about a twelve-year-old criminal mastermind who targets the hidden fairy world; a model of the heist story with technology and magic set against each other.',
    kw: ['colfer', 'fairies', 'heist', 'criminal mastermind', 'anti-hero protagonist', 'fantasy thriller'], genres: ['fantasy', 'heist story', 'thriller'],
  },
  {
    id: 'work-kid-mortal-engines', kind: 'work', name: 'Mortal Engines', author: 'Philip Reeve', year: 2001, language: 'English', region: 'England', confidence: 'established',
    summary: 'A steampunk adventure set in a far future where entire cities move on wheels and consume smaller ones; a striking example of a high-concept premise carried by fast plotting.',
    kw: ['reeve', 'traction cities', 'steampunk', 'post-apocalyptic', 'high concept', 'young adult science fiction'], genres: ['steampunk', 'post-apocalyptic fiction', 'science fiction'],
  },
  {
    id: 'work-kid-journey-to-the-river-sea', kind: 'work', name: 'Journey to the River Sea', author: 'Eva Ibbotson', year: 2001, language: 'English', region: 'England', confidence: 'established',
    summary: 'A historical adventure about an English orphan sent in 1910 to live with relatives in the Amazon; a warm, humorous novel of travel with a strong sense of place.',
    kw: ['ibbotson', 'amazon', 'orphan', 'edwardian', 'travel adventure', 'brazil'], genres: ['historical fiction', 'adventure novel'],
  },
  {
    id: 'work-kid-hoot', kind: 'work', name: 'Hoot', author: 'Carl Hiaasen', year: 2002, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A comic environmental mystery about a boy new to Florida who joins an effort to save burrowing owls from a development; a model of eccentric characters and a light satirical tone.',
    kw: ['hiaasen', 'florida', 'burrowing owls', 'environmental mystery', 'satire', 'comic crime'], genres: ['comic mystery', 'environmental fiction'],
  },
  {
    id: 'work-kid-coraline', kind: 'work', name: 'Coraline', author: 'Neil Gaiman', year: 2002, language: 'English', region: 'England', confidence: 'established',
    summary: 'A dark fantasy about a girl who finds a door to a mirror-world copy of her home, ruled by an unsettling other mother; a modern model of children\'s horror-fantasy with a brave, practical heroine.',
    kw: ['gaiman', 'other mother', 'parallel world', 'horror for children', 'brave heroine', 'uncanny'], genres: ['dark fantasy', 'children\'s horror'],
  },
  {
    id: 'work-kid-inkheart', kind: 'work', name: 'Inkheart', author: 'Cornelia Funke', year: 2003, language: 'German', region: 'Germany', confidence: 'established',
    summary: 'A fantasy about a girl whose father can read characters out of books and the villains who want to use that gift; a story about the power of reading in which every chapter opens with an epigraph from another book. Original title Tintenherz.',
    kw: ['funke', 'tintenherz', 'books come alive', 'bookbinder', 'reading', 'epigraphs'], genres: ['fantasy', 'metafiction for children'],
  },
  {
    id: 'work-kid-the-tale-of-despereaux', kind: 'work', name: 'The Tale of Despereaux', author: 'Kate DiCamillo', year: 2003, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A fantasy about a small mouse who loves stories, a princess and a rat in the dungeon, told by a narrator who speaks directly to the reader; a model of the storyteller\'s voice in modern middle grade.',
    kw: ['dicamillo', 'mouse', 'knight', 'direct address', 'storyteller narrator', 'fairy-tale tone'], genres: ['fantasy', 'fairy-tale fantasy'],
  },
  {
    id: 'work-kid-warriors-into-the-wild', kind: 'work', name: 'Warriors: Into the Wild', author: 'Erin Hunter (collective pen name)', year: 2003, language: 'English', region: 'England', confidence: 'established',
    summary: 'The first book of a long fantasy series about clans of wild cats with their own laws and legends, written by a team under a shared pen name; a major example of animal-clan fantasy.',
    kw: ['erin hunter', 'warrior cats', 'clans', 'cats', 'series fiction', 'animal fantasy'], genres: ['animal fantasy', 'series fiction'],
  },
  {
    id: 'work-kid-the-wee-free-men', kind: 'work', name: 'The Wee Free Men', author: 'Terry Pratchett', year: 2003, language: 'English', region: 'England', confidence: 'established',
    summary: 'A Discworld novel for younger readers about a young witch-in-training who confronts a fairy queen with the help of tiny, brawling Nac Mac Feegles; a model of humour and folklore combined.',
    kw: ['pratchett', 'discworld', 'tiffany aching', 'witches', 'folklore', 'comic fantasy'], genres: ['comic fantasy', 'fantasy'],
  },
  {
    id: 'work-kid-the-lightning-thief', kind: 'work', name: 'The Lightning Thief', author: 'Rick Riordan', year: 2005, language: 'English', region: 'United States', confidence: 'established',
    summary: 'The first Percy Jackson novel, in which a boy learns he is the son of a Greek god; a model of retelling classical myth in a contemporary American setting with a wisecracking first-person narrator.',
    kw: ['riordan', 'percy jackson', 'greek mythology', 'first person', 'demigods', 'myth retelling'], genres: ['mythological fantasy', 'urban fantasy', 'series fiction'],
  },
  {
    id: 'work-kid-the-penderwicks', kind: 'work', name: 'The Penderwicks', author: 'Jeanne Birdsall', year: 2005, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A family story about four sisters on a summer holiday in a country house; deliberately written in the manner of classic family novels, with an affectionate and old-fashioned narrator.',
    kw: ['birdsall', 'sisters', 'summer holiday', 'classic family story', 'old-fashioned style', 'series'], genres: ['family story', 'realistic fiction'],
  },
  {
    id: 'work-kid-diary-of-a-wimpy-kid', kind: 'work', name: 'Diary of a Wimpy Kid', author: 'Jeff Kinney', year: 2007, language: 'English', region: 'United States', confidence: 'established',
    summary: 'An illustrated novel presented as the journal of a middle schooler, with cartoons on every page; the first of a very popular series and a model of the hybrid text-and-drawing format.',
    kw: ['kinney', 'illustrated novel', 'diary format', 'hybrid format', 'middle school', 'comic narrator'], genres: ['hybrid novel', 'diary novel', 'comic fiction'],
  },
  {
    id: 'work-kid-the-graveyard-book', kind: 'work', name: 'The Graveyard Book', author: 'Neil Gaiman', year: 2008, language: 'English', region: 'England', confidence: 'established',
    summary: 'A novel about a boy raised by ghosts in a graveyard, told in linked episodes that span his childhood; a modern gothic coming-of-age story that draws on the structure of The Jungle Book.',
    kw: ['gaiman', 'ghosts', 'graveyard', 'episodic structure', 'orphan', 'gothic for children'], genres: ['gothic fiction', 'fantasy', 'coming-of-age story'],
  },
  {
    id: 'work-kid-the-evolution-of-calpurnia-tate', kind: 'work', name: 'The Evolution of Calpurnia Tate', author: 'Jacqueline Kelly', year: 2009, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A historical novel set in 1899 Texas about a girl who becomes fascinated by science and natural history against the expectations placed on her; narrated with warm humour.',
    kw: ['kelly', 'texas', '1899', 'natural history', 'girls and science', 'historical fiction'], genres: ['historical fiction', 'coming-of-age story'],
  },
  {
    id: 'work-kid-when-you-reach-me', kind: 'work', name: 'When You Reach Me', author: 'Rebecca Stead', year: 2009, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel set in 1970s New York about a girl who receives mysterious notes predicting events; an inventive blend of realistic school life and a carefully built time puzzle.',
    kw: ['stead', 'time puzzle', 'new york', 'notes', 'a wrinkle in time', 'mystery'], genres: ['science fiction', 'mystery', 'realistic fiction'],
  },
  {
    id: 'work-kid-where-the-mountain-meets-the-moon', kind: 'work', name: 'Where the Mountain Meets the Moon', author: 'Grace Lin', year: 2009, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A fantasy inspired by Chinese folklore, with colour illustrations and nested tales, about a girl who sets out to change her family\'s fortune; a model of interwoven stories within a quest.',
    kw: ['lin', 'chinese folklore', 'nested stories', 'quest', 'illustrated novel', 'dragon'], genres: ['fantasy', 'folklore-inspired fiction', 'quest fantasy'],
  },
  {
    id: 'work-kid-a-long-walk-to-water', kind: 'work', name: 'A Long Walk to Water', author: 'Linda Sue Park', year: 2010, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A short novel that alternates two stories, one inspired by the real experience of a boy from Sudan who walked across the country during its civil war; widely used in classrooms.',
    kw: ['park', 'sudan', 'lost boys', 'alternating narratives', 'water', 'based on a true story'], genres: ['historical fiction', 'dual narrative'],
  },
  {
    id: 'work-kid-out-of-my-mind', kind: 'work', name: 'Out of My Mind', author: 'Sharon M. Draper', year: 2010, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel narrated by an eleven-year-old with cerebral palsy who cannot speak but has a remarkable memory and mind; an example of first-person voice used to challenge assumptions about disability.',
    kw: ['draper', 'cerebral palsy', 'disability', 'first person', 'communication', 'school story'], genres: ['realistic fiction', 'school story'],
  },
  {
    id: 'work-kid-wonder', kind: 'work', name: 'Wonder', author: 'R. J. Palacio', year: 2012, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel told in several first-person voices about a boy with a facial difference starting at a mainstream school; known for its rotating narrators and its focus on kindness.',
    kw: ['palacio', 'facial difference', 'multiple narrators', 'kindness', 'school story', 'rotating viewpoints'], genres: ['realistic fiction', 'school story'],
  },
  {
    id: 'work-kid-the-one-and-only-ivan', kind: 'work', name: 'The One and Only Ivan', author: 'Katherine Applegate', year: 2012, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A short novel in brief chapters narrated by a gorilla living in a shopping-mall zoo, inspired by a real gorilla; known for its spare, free-verse-like prose.',
    kw: ['applegate', 'gorilla narrator', 'captive animals', 'spare prose', 'short chapters', 'animal narrator'], genres: ['animal story', 'realistic fiction'],
  },
  {
    id: 'work-kid-the-wild-robot', kind: 'work', name: 'The Wild Robot', author: 'Peter Brown', year: 2016, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A short illustrated novel about a robot washed up on a wild island who learns to survive among its animals; a model of robot-and-nature fiction in simple, clear language.',
    kw: ['brown', 'robot', 'island', 'nature', 'illustrated novel', 'adaptation'], genres: ['science fiction', 'survival story'],
  },
  {
    id: 'work-kid-ghost-reynolds', kind: 'work', name: 'Ghost', author: 'Jason Reynolds', year: 2016, language: 'English', region: 'United States', confidence: 'established',
    summary: 'The first of the Track series, a novel about a boy with a painful past who joins a youth running team; known for its rhythmic, contemporary first-person voice.',
    kw: ['reynolds', 'track team', 'running', 'first person voice', 'trauma', 'series'], genres: ['sports fiction', 'realistic fiction', 'series fiction'],
  },
  {
    id: 'work-kid-the-girl-who-drank-the-moon', kind: 'work', name: 'The Girl Who Drank the Moon', author: 'Kelly Barnhill', year: 2016, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A fantasy about a baby accidentally fed moonlight who is raised by a kind witch, a swamp monster and a tiny dragon, and the town that fears them; a layered fairy-tale novel about stories and fear.',
    kw: ['barnhill', 'witch', 'moonlight', 'fairy-tale fantasy', 'multiple viewpoints', 'fear'], genres: ['fantasy', 'fairy-tale fantasy'],
  },
  {
    id: 'work-kid-story-of-tracy-beaker', kind: 'work', name: 'The Story of Tracy Beaker', author: 'Jacqueline Wilson', year: 1991, language: 'English', region: 'England', confidence: 'established',
    summary: 'A novel in the voice of a girl living in a children\'s home, written as her own account with illustrations by Nick Sharratt; a popular example of defiant, humorous first-person narration about foster care.',
    kw: ['wilson', 'sharratt', 'children\'s home', 'foster care', 'first person narrator', 'defiant voice'], genres: ['realistic fiction', 'first-person narrative'],
  },
  // ---- Verse novels for young readers ----
  {
    id: 'work-kid-out-of-the-dust', kind: 'work', name: 'Out of the Dust', author: 'Karen Hesse', year: 1997, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A verse novel in the diary-like free-verse poems of a girl living through the Dust Bowl in 1930s Oklahoma; a landmark of the verse novel for young readers.',
    kw: ['hesse', 'dust bowl', 'free verse', 'verse novel', 'great depression', 'diary poems'], genres: ['verse novel', 'historical fiction'],
  },
  {
    id: 'work-kid-love-that-dog', kind: 'work', name: 'Love That Dog', author: 'Sharon Creech', year: 2001, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A short verse novel told in a boy\'s journal entries as he resists and then discovers poetry in class; a model of voice, white space and the quiet reveal of a reason for grief.',
    kw: ['creech', 'verse novel', 'poetry in the classroom', 'journal entries', 'boy and dog', 'white space'], genres: ['verse novel', 'school story'],
  },
  {
    id: 'work-kid-crank', kind: 'work', name: 'Crank', author: 'Ellen Hopkins', year: 2004, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A young-adult verse novel about a teenager\'s descent into addiction, with poems shaped in varied forms on the page; an influential example of the issue-driven verse novel.',
    kw: ['hopkins', 'verse novel', 'addiction', 'concrete poetry', 'shaped poems', 'issue novel'], genres: ['verse novel', 'problem novel'],
  },
  {
    id: 'work-kid-inside-out-and-back-again', kind: 'work', name: 'Inside Out and Back Again', author: 'Thanhha Lai', year: 2011, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A middle-grade verse novel based on the author\'s experience as a girl leaving Vietnam for the United States; short, plain poems carry a year of loss and adjustment.',
    kw: ['lai', 'vietnam', 'refugee', 'verse novel', 'immigration', 'autobiographical fiction'], genres: ['verse novel', 'historical fiction'],
  },
  {
    id: 'work-kid-the-crossover', kind: 'work', name: 'The Crossover', author: 'Kwame Alexander', year: 2014, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A middle-grade verse novel narrated by a twelve-year-old basketball player, with poems whose rhythm mimics the game; a model of poetry with the pace of sport.',
    kw: ['alexander', 'basketball', 'verse novel', 'rhythm', 'sports fiction', 'brothers'], genres: ['verse novel', 'sports fiction'],
  },
  {
    id: 'work-kid-brown-girl-dreaming', kind: 'work', name: 'Brown Girl Dreaming', author: 'Jacqueline Woodson', year: 2014, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A memoir in verse about the author\'s childhood in South Carolina and New York in the 1960s and 1970s; a model of how short poems can build a life story and a writer\'s origins.',
    kw: ['woodson', 'memoir in verse', 'childhood', 'civil rights era', 'becoming a writer', 'free verse'], genres: ['verse memoir', 'memoir', 'verse novel'],
  },
  {
    id: 'work-kid-long-way-down', kind: 'work', name: 'Long Way Down', author: 'Jason Reynolds', year: 2017, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A young-adult verse novel set almost entirely within one elevator ride, as a boy weighs whether to take revenge for his brother; a model of compression in time and place.',
    kw: ['reynolds', 'verse novel', 'elevator', 'single setting', 'revenge', 'compressed time'], genres: ['verse novel', 'realistic fiction'],
  },
  {
    id: 'work-kid-the-poet-x', kind: 'work', name: 'The Poet X', author: 'Elizabeth Acevedo', year: 2018, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A young-adult verse novel about a Dominican American girl in Harlem who finds her voice through slam poetry; shaped by the cadences of performance poetry.',
    kw: ['acevedo', 'slam poetry', 'verse novel', 'harlem', 'dominican american', 'spoken word'], genres: ['verse novel', 'coming-of-age story'],
  },
  // ---- Young adult: landmarks of realism and the problem novel ----
  {
    id: 'work-kid-the-outsiders', kind: 'work', name: 'The Outsiders', author: 'S. E. Hinton', year: 1967, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel narrated by a teenage member of a working-class gang in 1960s Oklahoma, written while the author was still in her teens; a founding text of modern young-adult realism.',
    kw: ['hinton', 'gangs', 'class conflict', 'first person', 'teen narrator', 'oklahoma', 'ya origins'], genres: ['young adult fiction', 'realistic fiction'],
  },
  {
    id: 'work-kid-the-pigman', kind: 'work', name: 'The Pigman', author: 'Paul Zindel', year: 1968, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel told in alternating first-person voices by two teenagers who befriend a lonely old man; an early model of the double narration and of the unsentimental problem novel for teenagers.',
    kw: ['zindel', 'alternating narrators', 'friendship across ages', 'problem novel', 'first person', 'consequences'], genres: ['young adult fiction', 'problem novel'],
  },
  {
    id: 'work-kid-the-chocolate-war', kind: 'work', name: 'The Chocolate War', author: 'Robert Cormier', year: 1974, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel about a boy at a Catholic school who refuses to sell chocolates in an annual fundraiser, and the pressure that falls on him; a landmark of unflinching, unresolved young-adult fiction.',
    kw: ['cormier', 'school politics', 'peer pressure', 'bleak ending', 'conformity', 'challenged books'], genres: ['young adult fiction', 'school story'],
  },
  {
    id: 'work-kid-annie-on-my-mind', kind: 'work', name: 'Annie on My Mind', author: 'Nancy Garden', year: 1982, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A young-adult novel about the love between two teenage girls in New York, told partly in retrospect; an early landmark of LGBTQ young-adult fiction, notable for its hopeful ending.',
    kw: ['garden', 'lgbtq young adult', 'first love', 'retrospective narration', 'new york', 'early queer ya'], genres: ['young adult fiction', 'romance'],
  },
  {
    id: 'work-kid-alanna-the-first-adventure', kind: 'work', name: 'Alanna: The First Adventure', author: 'Tamora Pierce', year: 1983, language: 'English', region: 'United States', confidence: 'established',
    summary: 'The first of the Song of the Lioness quartet, in which a girl disguises herself as a boy to train as a knight; a model of girl-led secondary-world fantasy.',
    kw: ['pierce', 'song of the lioness', 'knight training', 'disguise', 'girl hero', 'secondary world'], genres: ['young adult fantasy', 'series fiction'],
  },
  {
    id: 'work-kid-weetzie-bat', kind: 'work', name: 'Weetzie Bat', author: 'Francesca Lia Block', year: 1989, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A short, lyrical novel set in a dreamlike Los Angeles about a girl and her unconventional chosen family; known for a poetic, fairy-tale voice applied to a contemporary city.',
    kw: ['block', 'los angeles', 'chosen family', 'lyrical prose', 'magic realism', 'fairy-tale voice'], genres: ['young adult fiction', 'magic realism'],
  },
  {
    id: 'work-kid-looking-for-alibrandi', kind: 'work', name: 'Looking for Alibrandi', author: 'Melina Marchetta', year: 1992, language: 'English', region: 'Australia', confidence: 'established',
    summary: 'A novel about a teenage girl of Italian descent in her final school year in Sydney; a landmark of Australian young-adult fiction and of migrant-family stories.',
    kw: ['marchetta', 'sydney', 'italian australian', 'family secrets', 'school story', 'identity'], genres: ['young adult fiction', 'coming-of-age story'],
  },
  {
    id: 'work-kid-tomorrow-when-the-war-began', kind: 'work', name: 'Tomorrow, When the War Began', author: 'John Marsden', year: 1993, language: 'English', region: 'Australia', confidence: 'established',
    summary: 'A first-person novel in which a group of Australian teenagers return from a camping trip to find their country invaded; the first of a series about survival, resistance and moral choice.',
    kw: ['marsden', 'invasion', 'teen survival', 'resistance', 'first person', 'australia', 'series'], genres: ['young adult fiction', 'war fiction', 'series fiction'],
  },
  {
    id: 'work-kid-speak', kind: 'work', name: 'Speak', author: 'Laurie Halse Anderson', year: 1999, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel about a high-school girl who stops speaking after a traumatic event the previous summer; known for short chapters, sharp humour and the use of silence as a narrative device.',
    kw: ['halse anderson', 'silence', 'trauma', 'high school', 'first person', 'short chapters'], genres: ['young adult fiction', 'problem novel'],
  },
  {
    id: 'work-kid-the-perks-of-being-a-wallflower', kind: 'work', name: 'The Perks of Being a Wallflower', author: 'Stephen Chbosky', year: 1999, language: 'English', region: 'United States', confidence: 'established',
    summary: 'An epistolary novel in the form of letters from a shy first-year student to an unnamed recipient; a well-known example of the letters format used to build a confiding, unreliable-seeming voice.',
    kw: ['chbosky', 'epistolary', 'letters', 'high school', 'first person', 'coming of age'], genres: ['young adult fiction', 'epistolary novel'],
  },
  {
    id: 'work-kid-monster-myers', kind: 'work', name: 'Monster', author: 'Walter Dean Myers', year: 1999, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel told partly as a screenplay and partly as a journal by a teenager on trial for murder; a model of formal experiment that puts a reader in the narrator\'s attempt to see himself.',
    kw: ['myers', 'screenplay format', 'trial', 'journal', 'formal experiment', 'identity'], genres: ['young adult fiction', 'experimental fiction'],
  },
  {
    id: 'work-kid-noughts-and-crosses', kind: 'work', name: 'Noughts & Crosses', author: 'Malorie Blackman', year: 2001, language: 'English', region: 'England', confidence: 'established',
    summary: 'A novel set in an alternate society ruled by dark-skinned Crosses over pale Noughts, following a love story across the divide; a well-known inversion used to examine racism.',
    kw: ['blackman', 'alternate society', 'racism', 'role reversal', 'romeo and juliet pattern', 'dystopian'], genres: ['young adult fiction', 'dystopian fiction', 'speculative fiction'],
  },
  {
    id: 'work-kid-feed', kind: 'work', name: 'Feed', author: 'M. T. Anderson', year: 2002, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A satirical dystopian novel in which a feed implanted in the brain delivers advertising and chatter; known for its invented teenage slang and bleak comedy about consumer culture.',
    kw: ['anderson', 'satire', 'invented slang', 'consumerism', 'technology', 'dystopian'], genres: ['dystopian fiction', 'satire', 'young adult fiction'],
  },
  {
    id: 'work-kid-boy-meets-boy', kind: 'work', name: 'Boy Meets Boy', author: 'David Levithan', year: 2003, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A light romantic comedy set in a high school and town where being gay is unremarkable; an early young-adult novel to imagine an accepting world rather than only a hostile one.',
    kw: ['levithan', 'romantic comedy', 'lgbtq young adult', 'accepting world', 'utopian setting', 'high school'], genres: ['young adult fiction', 'romantic comedy'],
  },
  {
    id: 'work-kid-the-book-thief', kind: 'work', name: 'The Book Thief', author: 'Markus Zusak', year: 2005, language: 'English', region: 'Australia', confidence: 'established',
    summary: 'A novel narrated by Death about a girl in Nazi Germany who steals books; noted for its unusual narrator, fragmented style and long length for a young-adult book.',
    kw: ['zusak', 'death as narrator', 'nazi germany', 'books and reading', 'stylised prose', 'crossover'], genres: ['historical fiction', 'young adult fiction', 'war story'],
  },
  {
    id: 'work-kid-looking-for-alaska', kind: 'work', name: 'Looking for Alaska', author: 'John Green', year: 2005, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A boarding-school novel structured as a countdown, with chapters headed by the number of days before and after a central event; a model of a structure that organises grief.',
    kw: ['green', 'boarding school', 'countdown structure', 'grief', 'first novel', 'before and after'], genres: ['young adult fiction', 'coming-of-age story'],
  },
  {
    id: 'work-kid-twilight', kind: 'work', name: 'Twilight', author: 'Stephenie Meyer', year: 2005, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A paranormal romance about a teenage girl who moves to a rainy town and falls in love with a vampire; the book that launched a major wave of paranormal romance in young-adult publishing.',
    kw: ['meyer', 'vampire romance', 'paranormal romance', 'first person', 'series', 'forbidden love'], genres: ['paranormal romance', 'young adult fiction', 'series fiction'],
  },
  {
    id: 'work-kid-uglies', kind: 'work', name: 'Uglies', author: 'Scott Westerfeld', year: 2005, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A dystopian novel set in a society where everyone undergoes surgery at sixteen to become conventionally beautiful; the first of a series about appearance, conformity and control.',
    kw: ['westerfeld', 'beauty and conformity', 'dystopian', 'surgery', 'series', 'hoverboards'], genres: ['dystopian fiction', 'young adult fiction', 'series fiction'],
  },
  {
    id: 'work-kid-jellicoe-road', kind: 'work', name: 'Jellicoe Road', author: 'Melina Marchetta', year: 2006, language: 'English', region: 'Australia', confidence: 'established',
    summary: 'A novel in which a girl at an Australian boarding school finds that a story written long ago bears on her own past; known for interwoven timelines and delayed revelation. Also published as On the Jellicoe Road.',
    kw: ['marchetta', 'interwoven timelines', 'boarding school', 'delayed reveal', 'australia', 'mystery of the past'], genres: ['young adult fiction', 'mystery'],
  },
  {
    id: 'work-kid-absolutely-true-diary-part-time-indian', kind: 'work', name: 'The Absolutely True Diary of a Part-Time Indian', author: 'Sherman Alexie', year: 2007, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A semi-autobiographical novel in diary and cartoon form, illustrated by Ellen Forney, about a boy who leaves his reservation school for a mostly white one; a widely taught and widely challenged book.',
    kw: ['alexie', 'forney', 'reservation', 'cartoons', 'semi-autobiographical', 'diary format'], genres: ['young adult fiction', 'diary novel', 'hybrid novel'],
  },
  // ---- Young adult: dystopia, fantasy, romance and contemporary fiction since 2008 ----
  {
    id: 'work-kid-the-hunger-games', kind: 'work', name: 'The Hunger Games', author: 'Suzanne Collins', year: 2008, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A dystopian novel in which a teenage girl takes her sister\'s place in a televised fight to the death; narrated in first-person present tense and a defining example of the young-adult dystopia.',
    kw: ['collins', 'dystopia', 'first person present tense', 'katniss', 'reality television', 'survival', 'series'], genres: ['dystopian fiction', 'young adult fiction', 'series fiction'],
  },
  {
    id: 'work-kid-the-knife-of-never-letting-go', kind: 'work', name: 'The Knife of Never Letting Go', author: 'Patrick Ness', year: 2008, language: 'English', region: 'United States', confidence: 'established',
    summary: 'The first of the Chaos Walking trilogy, a science-fiction novel on a colony world where everyone hears each other\'s thoughts; written in a distinctive spelling-driven first-person dialect.',
    kw: ['ness', 'chaos walking', 'telepathy as noise', 'dialect narration', 'colony world', 'chase narrative'], genres: ['science fiction', 'young adult fiction', 'dystopian fiction'],
  },
  {
    id: 'work-kid-graceling', kind: 'work', name: 'Graceling', author: 'Kristin Cashore', year: 2008, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A young-adult fantasy about a young woman whose unusual skill makes her a feared royal weapon and who tries to choose her own path; an influential girl-led secondary-world fantasy.',
    kw: ['cashore', 'graces', 'secondary world', 'strong heroine', 'royal court', 'high fantasy'], genres: ['young adult fantasy', 'epic fantasy'],
  },
  {
    id: 'work-kid-the-maze-runner', kind: 'work', name: 'The Maze Runner', author: 'James Dashner', year: 2009, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A dystopian novel in which a boy wakes without memory in a community of teenagers surrounded by a changing maze; an example of a mystery-box premise driving a fast plot.',
    kw: ['dashner', 'maze', 'amnesia', 'mystery box', 'group of boys', 'series'], genres: ['dystopian fiction', 'young adult fiction', 'series fiction'],
  },
  {
    id: 'work-kid-daughter-of-smoke-and-bone', kind: 'work', name: 'Daughter of Smoke & Bone', author: 'Laini Taylor', year: 2011, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A fantasy about a blue-haired art student in Prague raised by creatures from another world; known for lush, ornate prose and a modern setting joined to an old war between angels and chimaera.',
    kw: ['taylor', 'prague', 'chimaera', 'angels', 'lyrical prose', 'urban fantasy', 'star-crossed lovers'], genres: ['young adult fantasy', 'romance'],
  },
  {
    id: 'work-kid-divergent', kind: 'work', name: 'Divergent', author: 'Veronica Roth', year: 2011, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A dystopian novel set in a society divided into factions by personality, in which a sixteen-year-old must choose where she belongs; a model of the sorting-into-groups premise.',
    kw: ['roth', 'factions', 'dystopia', 'sorting', 'first person present tense', 'choice', 'series'], genres: ['dystopian fiction', 'young adult fiction', 'series fiction'],
  },
  {
    id: 'work-kid-between-shades-of-gray', kind: 'work', name: 'Between Shades of Gray', author: 'Ruta Sepetys', year: 2011, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A historical novel about a Lithuanian teenager deported to Siberia by Soviet authorities in 1941; an example of historical fiction that brings a lesser-known history to young readers.',
    kw: ['sepetys', 'lithuania', 'soviet deportation', 'siberia', 'second world war', 'historical fiction'], genres: ['historical fiction', 'young adult fiction', 'war story'],
  },
  {
    id: 'work-kid-a-monster-calls', kind: 'work', name: 'A Monster Calls', author: 'Patrick Ness', year: 2011, language: 'English', region: 'England', confidence: 'established',
    summary: 'A novel about a boy visited at night by a yew-tree monster who tells him stories while his mother is ill; written from an idea by Siobhan Dowd and illustrated by Jim Kay.',
    kw: ['ness', 'siobhan dowd', 'jim kay', 'grief', 'monster as helper', 'illness', 'stories within a story'], genres: ['dark fantasy', 'young adult fiction'],
  },
  {
    id: 'work-kid-cinder', kind: 'work', name: 'Cinder', author: 'Marissa Meyer', year: 2012, language: 'English', region: 'United States', confidence: 'established',
    summary: 'The first of the Lunar Chronicles, a science-fiction retelling of Cinderella with a cyborg mechanic as its heroine; a well-known example of the fairy-tale-in-space retelling.',
    kw: ['meyer', 'lunar chronicles', 'cinderella retelling', 'cyborg', 'fairy tale science fiction', 'series'], genres: ['fairy-tale retelling', 'science fiction', 'young adult fiction'],
  },
  {
    id: 'work-kid-code-name-verity', kind: 'work', name: 'Code Name Verity', author: 'Elizabeth Wein', year: 2012, language: 'English', region: 'United Kingdom', confidence: 'established',
    summary: 'A Second World War novel framed as the written account of a captured young woman agent, with a second voice that reframes it; known for an unreliable narrator and a mid-book change of perspective.',
    kw: ['wein', 'second world war', 'unreliable narrator', 'dual narrators', 'friendship', 'frame narrative'], genres: ['historical fiction', 'war story', 'young adult fiction'],
  },
  {
    id: 'work-kid-the-fault-in-our-stars', kind: 'work', name: 'The Fault in Our Stars', author: 'John Green', year: 2012, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel narrated by a sixteen-year-old with cancer who meets a boy in a support group; known for a witty, self-aware first-person voice used to talk about illness.',
    kw: ['green', 'illness', 'cancer', 'first person', 'witty voice', 'teen romance', 'sick lit'], genres: ['young adult fiction', 'romance'],
  },
  {
    id: 'work-kid-aristotle-and-dante', kind: 'work', name: 'Aristotle and Dante Discover the Secrets of the Universe', author: 'Benjamin Alire Sáenz', year: 2012, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A coming-of-age novel set in 1980s El Paso about two Mexican American boys whose friendship deepens; a quiet, dialogue-driven novel about identity, family and love.',
    kw: ['saenz', 'el paso', 'mexican american', 'friendship', 'coming out', 'lgbtq young adult', 'dialogue'], genres: ['young adult fiction', 'coming-of-age story'],
  },
  {
    id: 'work-kid-the-raven-boys', kind: 'work', name: 'The Raven Boys', author: 'Maggie Stiefvater', year: 2012, language: 'English', region: 'United States', confidence: 'established',
    summary: 'The first of the Raven Cycle, a contemporary fantasy about a girl from a family of psychics and four boys from a private school searching for a buried Welsh king; known for atmosphere and an ensemble cast.',
    kw: ['stiefvater', 'raven cycle', 'ley lines', 'ensemble cast', 'contemporary fantasy', 'virginia'], genres: ['contemporary fantasy', 'young adult fiction', 'series fiction'],
  },
  {
    id: 'work-kid-eleanor-and-park', kind: 'work', name: 'Eleanor & Park', author: 'Rainbow Rowell', year: 2013, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A romance set in 1986 told in alternating third-person chapters about two misfit teenagers who bond over comics and music; known for its period detail and its balance of tenderness and hardship.',
    kw: ['rowell', 'alternating perspectives', '1980s setting', 'mixtapes', 'comics', 'teen romance'], genres: ['young adult fiction', 'romance'],
  },
  {
    id: 'work-kid-ill-give-you-the-sun', kind: 'work', name: "I'll Give You the Sun", author: 'Jandy Nelson', year: 2014, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel told by twins in alternating time periods, one at thirteen and one at sixteen, about art, family and a shared loss; an example of two voices and two timelines used to hold back information.',
    kw: ['nelson', 'twins', 'alternating timelines', 'art', 'dual narrators', 'family secrets'], genres: ['young adult fiction', 'coming-of-age story'],
  },
  {
    id: 'work-kid-to-all-the-boys-ive-loved-before', kind: 'work', name: "To All the Boys I've Loved Before", author: 'Jenny Han', year: 2014, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A contemporary romance in which a girl\'s private love letters to her old crushes are mailed by accident; a well-known example of a fake-relationship premise in young-adult romance.',
    kw: ['han', 'love letters', 'fake dating', 'sisters', 'high school romance', 'korean american'], genres: ['young adult fiction', 'romantic comedy'],
  },
  {
    id: 'work-kid-simon-vs-the-homo-sapiens-agenda', kind: 'work', name: 'Simon vs. the Homo Sapiens Agenda', author: 'Becky Albertalli', year: 2015, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A contemporary novel about a gay teenager who corresponds anonymously by email with a classmate while someone threatens to out him; a mainstream breakout for LGBTQ young-adult romance.',
    kw: ['albertalli', 'anonymous emails', 'coming out', 'lgbtq young adult', 'high school romance', 'epistolary elements'], genres: ['young adult fiction', 'romance'],
  },
  {
    id: 'work-kid-six-of-crows', kind: 'work', name: 'Six of Crows', author: 'Leigh Bardugo', year: 2015, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A heist fantasy told through several close-third viewpoints, about six young outcasts hired for an impossible job; a model of the caper structure in a fantasy world.',
    kw: ['bardugo', 'heist fantasy', 'ensemble cast', 'multiple viewpoints', 'grishaverse', 'caper'], genres: ['young adult fantasy', 'heist story'],
  },
  {
    id: 'work-kid-scythe', kind: 'work', name: 'Scythe', author: 'Neal Shusterman', year: 2016, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A dystopian novel set in a world that has conquered death, where trained scythes must kill to control the population; a novel built on a single, sharp ethical premise.',
    kw: ['shusterman', 'dystopia', 'death conquered', 'ethics', 'apprenticeship', 'series'], genres: ['dystopian fiction', 'science fiction', 'young adult fiction'],
  },
  {
    id: 'work-kid-the-sun-is-also-a-star', kind: 'work', name: 'The Sun Is Also a Star', author: 'Nicola Yoon', year: 2016, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel set over a single day in New York, told in alternating viewpoints with short interludes about side characters and facts; an example of a compressed time frame in a romance.',
    kw: ['yoon', 'single day', 'new york', 'alternating perspectives', 'immigration', 'interludes'], genres: ['young adult fiction', 'romance'],
  },
  {
    id: 'work-kid-the-hate-u-give', kind: 'work', name: 'The Hate U Give', author: 'Angie Thomas', year: 2017, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A first-person novel narrated by a Black teenage girl who witnesses the police shooting of a friend and must decide whether to speak publicly; a defining young-adult novel of racial justice.',
    kw: ['thomas', 'police shooting', 'activism', 'code-switching', 'first person', 'racial justice'], genres: ['young adult fiction', 'realistic fiction'],
  },
  {
    id: 'work-kid-dear-martin', kind: 'work', name: 'Dear Martin', author: 'Nic Stone', year: 2017, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel in which a Black teenager at an elite school writes letters to Martin Luther King Jr. while confronting racism after a violent encounter with police; part prose and part letters and script.',
    kw: ['stone', 'letters to mlk', 'racism', 'school debate', 'mixed forms', 'police violence'], genres: ['young adult fiction', 'epistolary novel'],
  },
  {
    id: 'work-kid-children-of-blood-and-bone', kind: 'work', name: 'Children of Blood and Bone', author: 'Tomi Adeyemi', year: 2018, language: 'English', region: 'United States', confidence: 'established',
    summary: 'The first of the Legacy of Orisha series, a fantasy drawing on West African, especially Yoruba, mythology about a girl who tries to restore magic to her people; a major Black-led fantasy for young adults.',
    kw: ['adeyemi', 'yoruba mythology', 'west african fantasy', 'orisha', 'quest', 'series', 'multiple viewpoints'], genres: ['young adult fantasy', 'epic fantasy', 'series fiction'],
  },
  {
    id: 'work-kid-darius-the-great-is-not-okay', kind: 'work', name: 'Darius the Great Is Not Okay', author: 'Adib Khorram', year: 2018, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A contemporary novel about a half-Persian teenager with depression who visits his grandparents in Iran and makes a friend; a gentle, humorous story about family, belonging and mental health.',
    kw: ['khorram', 'persian american', 'depression', 'iran', 'friendship', 'family visit', 'first person'], genres: ['young adult fiction', 'coming-of-age story'],
  },
  {
    id: 'work-kid-felix-ever-after', kind: 'work', name: 'Felix Ever After', author: 'Kacen Callender', year: 2020, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A contemporary novel about a Black transgender teenager and aspiring artist who sets out for revenge after a cruel prank and finds himself questioning identity and love; a leading transgender young-adult romance.',
    kw: ['callender', 'transgender protagonist', 'art school', 'identity', 'lgbtq young adult', 'first love'], genres: ['young adult fiction', 'romance'],
  },
  // ---- Fairy-tale collections and retellings ----
  {
    id: 'work-kid-the-blue-fairy-book', kind: 'work', name: 'The Blue Fairy Book', author: 'Andrew Lang', year: 1889, language: 'English', region: 'Scotland', confidence: 'established',
    summary: 'The first of the coloured fairy books, a collection of tales from many countries retold for children; hugely influential in making European and other traditional tales familiar in English.',
    kw: ['lang', 'coloured fairy books', 'folk tale anthology', 'victorian anthology', 'fairy tale collection', 'cinderella'], genres: ['fairy tale collection', 'folk tale anthology'],
  },
  {
    id: 'work-kid-english-fairy-tales', kind: 'work', name: 'English Fairy Tales', author: 'Joseph Jacobs', year: 1890, language: 'English', region: 'England', confidence: 'established',
    summary: 'A collection of English folk tales retold in a plain, speakable style meant for reading aloud; it helped fix the standard forms of several well-known tales, such as the one about three little pigs.',
    kw: ['jacobs', 'english folk tales', 'read aloud style', 'jack tales', 'folklore collection', 'oral style'], genres: ['fairy tale collection', 'folk tale anthology'],
  },
  {
    id: 'work-kid-the-happy-prince-and-other-tales', kind: 'work', name: 'The Happy Prince and Other Tales', author: 'Oscar Wilde', year: 1888, language: 'English', region: 'Ireland', confidence: 'established',
    summary: 'A collection of five original literary fairy tales with a moral and satirical edge, written in the manner of Andersen; a model of the literary fairy tale in English.',
    kw: ['wilde', 'literary fairy tale', 'sacrifice', 'satire', 'andersen influence', 'selfish giant'], genres: ['literary fairy tale', 'story collection'],
  },
  {
    id: 'work-kid-beauty-mckinley', kind: 'work', name: 'Beauty: A Retelling of the Story of Beauty and the Beast', author: 'Robin McKinley', year: 1978, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel-length retelling of Beauty and the Beast narrated by the heroine, who is bookish rather than beautiful; an influential example of the novel-length fairy-tale retelling for young adults.',
    kw: ['mckinley', 'beauty and the beast', 'fairy-tale retelling', 'first person', 'bookish heroine', 'novelisation of a tale'], genres: ['fairy-tale retelling', 'young adult fantasy'],
  },
  {
    id: 'work-kid-dealing-with-dragons', kind: 'work', name: 'Dealing with Dragons', author: 'Patricia C. Wrede', year: 1990, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A comic fantasy in which a princess bored by etiquette lessons volunteers to keep house for a dragon; a well-known example of knowing, humorous play with fairy-tale conventions.',
    kw: ['wrede', 'enchanted forest chronicles', 'princess', 'dragon', 'fairy-tale parody', 'comic fantasy'], genres: ['comic fantasy', 'fairy-tale parody'],
  },
  {
    id: 'work-kid-briar-rose', kind: 'work', name: 'Briar Rose', author: 'Jane Yolen', year: 1992, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A novel that links the tale of Sleeping Beauty to a family\'s Holocaust history as a granddaughter investigates her grandmother\'s past; a serious example of fairy tale used as a lens on history.',
    kw: ['yolen', 'sleeping beauty', 'holocaust', 'fairy-tale retelling', 'family secrets', 'historical fiction'], genres: ['fairy-tale retelling', 'historical fiction'],
  },
  {
    id: 'work-kid-grimm-tales-pullman', kind: 'work', name: 'Grimm Tales: For Young and Old', author: 'Philip Pullman', year: 2012, language: 'English', region: 'England', confidence: 'established',
    summary: 'A selection of the Brothers Grimm tales retold by the novelist Philip Pullman in a clear, spare modern English with short notes on each tale; a recent example of a literary retelling that keeps the tales\' structures intact.',
    kw: ['pullman', 'grimm retellings', 'fairy tale collection', 'retelling', 'tale notes', 'spare style'], genres: ['fairy tale collection', 'fairy-tale retelling'],
  },
  // ---- Graphic novels and comics for young readers ----
  {
    id: 'work-kid-the-adventures-of-tintin', kind: 'work', name: 'The Adventures of Tintin', author: 'Hergé', year: 1929, language: 'French', region: 'Belgium', confidence: 'established',
    summary: 'A long-running series of comic albums about a young reporter and his dog, begun in 1929; a landmark of the European adventure comic and of the clean-line (ligne claire) drawing style.',
    kw: ['herge', 'tintin', 'ligne claire', 'franco-belgian comics', 'adventure comics', 'bande dessinee'], genres: ['adventure comic', 'graphic novel', 'series fiction'],
  },
  {
    id: 'work-kid-asterix-the-gaul', kind: 'work', name: 'Asterix the Gaul', author: 'René Goscinny and Albert Uderzo', year: 1961, language: 'French', region: 'France', confidence: 'established',
    summary: 'The first Asterix album, a comic about a village of Gauls resisting Roman rule with the help of a magic potion; a model of comic adventure built on puns, caricature and historical parody.',
    kw: ['goscinny', 'uderzo', 'asterix', 'puns', 'roman gaul', 'franco-belgian comics', 'historical parody'], genres: ['comic', 'historical parody', 'series fiction'],
  },
  {
    id: 'work-kid-amulet-the-stonekeeper', kind: 'work', name: 'Amulet: The Stonekeeper', author: 'Kazu Kibuishi', year: 2008, language: 'English', region: 'United States', confidence: 'established',
    summary: 'The first volume of a fantasy graphic-novel series in which two children follow their mother into a hidden world; a leading example of the middle-grade fantasy graphic novel.',
    kw: ['kibuishi', 'amulet', 'fantasy graphic novel', 'siblings', 'portal fantasy', 'series'], genres: ['graphic novel', 'fantasy', 'series fiction'],
  },
  {
    id: 'work-kid-anyas-ghost', kind: 'work', name: "Anya's Ghost", author: 'Vera Brosgol', year: 2011, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A young-adult graphic novel about a self-conscious teenager who falls into a well and befriends a ghost; a model of a supernatural story used for a story about self-image and friendship.',
    kw: ['brosgol', 'ghost story', 'graphic novel', 'teen self-image', 'friendship', 'russian american'], genres: ['graphic novel', 'ghost story'],
  },
  {
    id: 'work-kid-drama-telgemeier', kind: 'work', name: 'Drama', author: 'Raina Telgemeier', year: 2012, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A middle-grade graphic novel about a middle-school stage crew putting on a musical, with crushes and friendship troubles behind the scenes; a popular model of the school-ensemble graphic novel.',
    kw: ['telgemeier', 'school theatre', 'stage crew', 'friendship', 'graphic novel', 'ensemble cast'], genres: ['graphic novel', 'school story'],
  },
  {
    id: 'work-kid-el-deafo', kind: 'work', name: 'El Deafo', author: 'Cece Bell', year: 2014, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A graphic memoir about the author\'s childhood hearing loss, in which she imagines herself as a superhero; the characters are drawn as rabbits, a choice that keeps the story gentle and accessible.',
    kw: ['bell', 'graphic memoir', 'hearing loss', 'deaf experience', 'rabbit characters', 'childhood'], genres: ['graphic memoir', 'graphic novel'],
  },
  {
    id: 'work-kid-roller-girl', kind: 'work', name: 'Roller Girl', author: 'Victoria Jamieson', year: 2015, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A middle-grade graphic novel about a girl who joins a roller derby summer camp as a friendship begins to change; a model of a sports story that doubles as a story about growing apart.',
    kw: ['jamieson', 'roller derby', 'friendship change', 'graphic novel', 'sports story', 'summer camp'], genres: ['graphic novel', 'sports fiction'],
  },
  {
    id: 'work-kid-nimona', kind: 'work', name: 'Nimona', author: 'Noelle Stevenson', year: 2015, language: 'English', region: 'United States', confidence: 'established',
    summary: 'A graphic novel, first a webcomic, about a shape-shifting girl who becomes the sidekick of a villain in a world that mixes medieval fantasy and science fiction; known for its witty tonal shifts.',
    kw: ['stevenson', 'webcomic', 'shapeshifter', 'villain protagonist', 'fantasy science fiction', 'tonal shift'], genres: ['graphic novel', 'fantasy', 'webcomic'],
  },
  // ---- International children's literature ----
  {
    id: 'work-kid-the-swiss-family-robinson', kind: 'work', name: 'The Swiss Family Robinson', author: 'Johann David Wyss', year: 1812, language: 'German', region: 'Switzerland', confidence: 'established',
    summary: 'A novel about a shipwrecked family who build a new life on a tropical island, written in the tradition of Robinson Crusoe and edited for publication by the author\'s son; a founding family-survival story.',
    kw: ['wyss', 'shipwreck', 'family survival', 'robinsonade', 'island', 'der schweizerische robinson'], genres: ['robinsonade', 'adventure novel', 'survival story'],
  },
  {
    id: 'work-kid-cuore', kind: 'work', name: 'Cuore', author: 'Edmondo De Amicis', year: 1886, language: 'Italian', region: 'Italy', confidence: 'established',
    summary: 'An Italian novel in the form of a schoolboy\'s diary across one school year, with letters and short tales embedded; a sentimental, patriotic classic widely translated.',
    kw: ['de amicis', 'heart', 'school diary', 'italian unification', 'embedded tales', 'moral education'], genres: ['school story', 'diary novel'],
  },
  {
    id: 'work-kid-the-wonderful-adventures-of-nils', kind: 'work', name: 'The Wonderful Adventures of Nils', author: 'Selma Lagerlöf', year: 1906, language: 'Swedish', region: 'Sweden', confidence: 'established',
    summary: 'A Swedish novel in which a boy shrunk to thumb size travels across the country on the back of a goose; commissioned as a school reader to teach geography, and a model of instruction wrapped in adventure.',
    kw: ['lagerlof', 'nils holgersson', 'goose', 'geography reader', 'sweden', 'journey structure'], genres: ['fantasy', 'adventure novel', 'educational fiction'],
  },
  {
    id: 'work-kid-emil-and-the-detectives', kind: 'work', name: 'Emil and the Detectives', author: 'Erich Kästner', year: 1929, language: 'German', region: 'Germany', confidence: 'established',
    summary: 'A German novel about a boy who tracks a thief across Berlin with the help of a gang of city children; a pioneering urban detective story for young readers.',
    kw: ['kastner', 'emil und die detektive', 'berlin', 'children detectives', 'city story', 'weimar'], genres: ['detective story', 'adventure novel'],
  },
  {
    id: 'work-kid-the-wizard-of-the-emerald-city', kind: 'work', name: 'The Wizard of the Emerald City', author: 'Alexander Volkov', year: 1939, language: 'Russian', region: 'Russia', confidence: 'established',
    summary: 'A Russian reworking of L. Frank Baum\'s Oz story that grew into its own long series; a prominent example of an adaptation developing a separate life in another language.',
    kw: ['volkov', 'oz adaptation', 'russian children\'s literature', 'emerald city', 'series', 'adaptation'], genres: ['fantasy', 'adaptation', 'series fiction'],
  },
  {
    id: 'work-kid-the-children-of-noisy-village', kind: 'work', name: 'The Children of Noisy Village', author: 'Astrid Lindgren', year: 1947, language: 'Swedish', region: 'Sweden', confidence: 'established',
    summary: 'A Swedish story of six children in a small farming village, narrated by one of them in a plain, sunny voice; a classic of everyday childhood realism. Original title Alla vi barn i Bullerbyn.',
    kw: ['lindgren', 'bullerbyn', 'village life', 'everyday childhood', 'child narrator', 'swedish classic'], genres: ['realistic fiction', 'family story'],
  },
  {
    id: 'work-kid-karlsson-on-the-roof', kind: 'work', name: 'Karlsson-on-the-Roof', author: 'Astrid Lindgren', year: 1955, language: 'Swedish', region: 'Sweden', confidence: 'established',
    summary: 'A Swedish comic fantasy about a lonely boy in Stockholm and a self-confident little man with a propeller on his back who lives on the roof; a model of a vain, funny and unreliable friend.',
    kw: ['lindgren', 'karlsson pa taket', 'stockholm', 'comic friend', 'propeller', 'swedish children\'s literature'], genres: ['comic fantasy', 'urban fantasy'],
  },
  {
    id: 'work-kid-the-brothers-lionheart', kind: 'work', name: 'The Brothers Lionheart', author: 'Astrid Lindgren', year: 1973, language: 'Swedish', region: 'Sweden', confidence: 'established',
    summary: 'A Swedish fantasy that faces death directly through two brothers who find each other in a land of legends and fight a tyrant; widely discussed for its serious treatment of mortality in a children\'s book.',
    kw: ['lindgren', 'brodrna lejonhjarta', 'death', 'afterlife fantasy', 'brothers', 'tyranny'], genres: ['fantasy', 'afterlife fantasy'],
  },
  {
    id: 'work-kid-ronia-the-robbers-daughter', kind: 'work', name: "Ronia, the Robber's Daughter", author: 'Astrid Lindgren', year: 1981, language: 'Swedish', region: 'Sweden', confidence: 'established',
    summary: 'A Swedish fantasy about a girl growing up in a forest among robbers and strange creatures, who befriends the child of a rival band; known for its strong sense of landscape and for a feud turned to friendship.',
    kw: ['lindgren', 'ronja rovardotter', 'forest', 'feud', 'robber clan', 'wild creatures'], genres: ['fantasy', 'adventure novel'],
  },
  {
    id: 'work-kid-emil-lindgren-mio', kind: 'work', name: 'Mio, My Son', author: 'Astrid Lindgren', year: 1954, language: 'Swedish', region: 'Sweden', confidence: 'established',
    summary: 'A Swedish fantasy in which a lonely boy is taken to a land of the far-away and is called on to face a dark knight; a gentle, lyrical quest that begins in a boy\'s longing for a father.',
    kw: ['lindgren', 'mio min mio', 'far-away land', 'quest', 'loneliness', 'lyrical fantasy'], genres: ['fantasy', 'quest fantasy'],
  },
  {
    id: 'work-kid-jim-button', kind: 'work', name: 'Jim Button and Luke the Engine Driver', author: 'Michael Ende', year: 1960, language: 'German', region: 'Germany', confidence: 'established',
    summary: 'A German fantasy-adventure about a foundling boy, a locomotive driver and their steam engine, travelling to far countries; one of the best-known German children\'s novels. Original title Jim Knopf und Lukas der Lokomotivführer.',
    kw: ['ende', 'jim knopf', 'locomotive', 'island kingdom', 'adventure', 'german classic'], genres: ['fantasy', 'adventure novel'],
  },
  {
    id: 'work-kid-momo', kind: 'work', name: 'Momo', author: 'Michael Ende', year: 1973, language: 'German', region: 'Germany', confidence: 'established',
    summary: 'A German fantasy about a girl who can listen so well that others are changed by it, and her struggle against grey men who steal people\'s time; a parable about attention, work and haste.',
    kw: ['ende', 'time thieves', 'grey men', 'listening', 'parable', 'modern fable'], genres: ['fantasy', 'parable'],
  },
  {
    id: 'work-kid-tales-on-the-telephone', kind: 'work', name: 'Tales on the Telephone', author: 'Gianni Rodari', year: 1962, language: 'Italian', region: 'Italy', confidence: 'established',
    summary: 'An Italian collection of very short fantastic tales, each brief enough to be told over the phone; a model of concise, playful invention with an eye to the absurd. Original title Favole al telefono.',
    kw: ['rodari', 'favole al telefono', 'very short stories', 'absurd', 'italian children\'s literature', 'micro-fiction'], genres: ['story collection', 'fantasy', 'micro-fiction'],
  },
  {
    id: 'work-kid-crocodile-gena', kind: 'work', name: 'Crocodile Gena and His Friends', author: 'Eduard Uspensky', year: 1966, language: 'Russian', region: 'Russia', confidence: 'established',
    summary: 'A Russian children\'s story about a crocodile who works in a zoo and befriends a strange furry creature called Cheburashka; the origin of one of the best-known Russian children\'s characters.',
    kw: ['uspensky', 'cheburashka', 'crocodile gena', 'russian classic', 'soviet children\'s literature', 'friendship'], genres: ['children\'s classic', 'animal fantasy'],
  },
  {
    id: 'work-kid-gon-the-little-fox', kind: 'work', name: 'Gon, the Little Fox', author: 'Nankichi Niimi', year: 1932, language: 'Japanese', region: 'Japan', confidence: 'established',
    summary: 'A short Japanese story about a mischievous fox and a lonely man, widely taught in schools in Japan; known for a quiet, tragic mood and a very short, compact form. Original title Gongitsune.',
    kw: ['niimi', 'gongitsune', 'fox', 'japanese children\'s literature', 'short story', 'schoolroom classic'], genres: ['animal story', 'short story'],
  },
  {
    id: 'work-kid-kikis-delivery-service', kind: 'work', name: "Kiki's Delivery Service", author: 'Eiko Kadono', year: 1985, language: 'Japanese', region: 'Japan', confidence: 'established',
    summary: 'A Japanese novel about a thirteen-year-old witch who leaves home to start a flying delivery service in a seaside town; later adapted as a well-known animated film. Original title Majo no Takkyubin.',
    kw: ['kadono', 'majo no takkyubin', 'young witch', 'coming of age', 'delivery service', 'japanese fantasy'], genres: ['fantasy', 'coming-of-age story'],
  },
  {
    id: 'work-kid-totto-chan', kind: 'work', name: 'Totto-chan: The Little Girl at the Window', author: 'Tetsuko Kuroyanagi', year: 1981, language: 'Japanese', region: 'Japan', confidence: 'established',
    summary: 'A Japanese memoir of the author\'s early childhood at an unconventional Tokyo school in the years before the Second World War; widely read and a landmark of memoir for children.',
    kw: ['kuroyanagi', 'madogiwa no totto-chan', 'progressive school', 'memoir', 'childhood in tokyo', 'japanese bestseller'], genres: ['memoir', 'school story'],
  },
  {
    id: 'work-kid-the-little-black-fish', kind: 'work', name: 'The Little Black Fish', author: 'Samad Behrangi', year: 1968, language: 'Persian', region: 'Iran', confidence: 'established',
    summary: 'An Iranian allegorical story about a small fish who leaves the stream to see the wider world; widely read and often discussed for what it suggests about curiosity and independence.',
    kw: ['behrangi', 'mahi-ye siyah-e kuchulu', 'allegory', 'iranian children\'s literature', 'journey', 'independence'], genres: ['allegory', 'fable'],
  },
  {
    id: 'work-kid-chike-and-the-river', kind: 'work', name: 'Chike and the River', author: 'Chinua Achebe', year: 1966, language: 'English', region: 'Nigeria', confidence: 'established',
    summary: 'A short Nigerian novel for young readers about a boy who sets out on his first journey to a city across the Niger; written by a major novelist as an early African children\'s book in English.',
    kw: ['achebe', 'nigeria', 'niger river', 'african children\'s literature', 'first journey', 'village and city'], genres: ['children\'s classic', 'adventure novel'],
  },
  {
    id: 'work-kid-la-edad-de-oro', kind: 'work', name: 'La Edad de Oro', author: 'José Martí', year: 1889, language: 'Spanish', region: 'Cuba', confidence: 'established',
    summary: 'A children\'s magazine written largely by the Cuban poet and patriot José Martí, with tales, essays and verse for Spanish-speaking young readers; a foundational work of Latin American children\'s literature.',
    kw: ['marti', 'children\'s magazine', 'latin american children\'s literature', 'essays for children', 'cuba', 'four issues'], genres: ['children\'s magazine', 'story collection'],
  },
  {
    id: 'work-kid-cuentos-de-la-selva', kind: 'work', name: 'Cuentos de la selva', author: 'Horacio Quiroga', year: 1918, language: 'Spanish', region: 'Uruguay', confidence: 'established',
    summary: 'A Uruguayan collection of animal tales set in the subtropical jungle of northern Argentina and Paraguay, told in a direct, rhythmic voice; an important work of Latin American children\'s literature.',
    kw: ['quiroga', 'jungle tales', 'animal stories', 'rioplatense', 'latin american children\'s literature', 'tales from the jungle'], genres: ['animal story', 'story collection'],
  },
  {
    id: 'work-kid-a-menina-do-narizinho-arrebitado', kind: 'work', name: 'A Menina do Narizinho Arrebitado', author: 'Monteiro Lobato', year: 1920, language: 'Portuguese', region: 'Brazil', confidence: 'established',
    summary: 'The first of the Yellow Woodpecker Ranch tales, a Brazilian children\'s book mixing a girl\'s play, talking toys and folklore; the start of a series that shaped Brazilian children\'s literature.',
    kw: ['lobato', 'sitio do picapau amarelo', 'brazilian children\'s literature', 'narizinho', 'talking toys', 'folklore'], genres: ['fantasy', 'series fiction'],
  },
  {
    id: 'work-kid-the-magic-pudding', kind: 'work', name: 'The Magic Pudding', author: 'Norman Lindsay', year: 1918, language: 'English', region: 'Australia', confidence: 'established',
    summary: 'An Australian comic fantasy about a koala, a sailor and a penguin who defend a pudding that renews itself however much is eaten; a classic of Australian comic writing with the author\'s own drawings.',
    kw: ['lindsay', 'koala', 'pudding', 'australian classic', 'comic fantasy', 'illustrated novel'], genres: ['comic fantasy', 'illustrated novel'],
  },
  {
    id: 'work-kid-snugglepot-and-cuddlepie', kind: 'work', name: 'Snugglepot and Cuddlepie', author: 'May Gibbs', year: 1918, language: 'English', region: 'Australia', confidence: 'established',
    summary: 'An Australian children\'s book about two small gumnut-figure friends and their adventures in the bush, with the author\'s own illustrations; a classic of Australian children\'s fantasy rooted in native plants and animals.',
    kw: ['gibbs', 'gumnut babies', 'australian bush', 'illustrated fantasy', 'native plants', 'australian classic'], genres: ['fantasy', 'illustrated novel'],
  },
  {
    id: 'work-kid-playing-beatie-bow', kind: 'work', name: 'Playing Beatie Bow', author: 'Ruth Park', year: 1980, language: 'English', region: 'Australia', confidence: 'established',
    summary: 'A time-slip novel set in Sydney in which a teenage girl follows a strange child back into the nineteenth century; a well-known Australian example of historical time fantasy.',
    kw: ['park', 'sydney', 'time slip', 'the rocks', 'time fantasy', 'australian young adult'], genres: ['time fantasy', 'historical fiction', 'young adult fiction'],
  },
  {
    id: 'work-kid-the-changeover', kind: 'work', name: 'The Changeover', author: 'Margaret Mahy', year: 1984, language: 'English', region: 'New Zealand', confidence: 'established',
    summary: 'A supernatural novel set in New Zealand about a teenage girl who must take on unusual powers to save her small brother; a landmark of New Zealand young-adult fiction blending the everyday and the uncanny.',
    kw: ['mahy', 'new zealand', 'witchcraft', 'supernatural', 'domestic setting', 'young adult fantasy'], genres: ['young adult fantasy', 'supernatural fiction'],
  },
  {
    id: 'work-kid-whale-rider', kind: 'work', name: 'Whale Rider', author: 'Witi Ihimaera', year: 1987, language: 'English', region: 'New Zealand', confidence: 'established',
    summary: 'A short novel set in a Māori community in New Zealand about a girl who wants a role her people expect only a boy to hold; widely taught and read by younger and adult readers alike.',
    kw: ['ihimaera', 'maori literature', 'new zealand', 'whale', 'tradition and change', 'crossover'], genres: ['literary fiction', 'myth-inflected fiction', 'young adult fiction'],
  },
  {
    id: 'work-kid-jacob-two-two', kind: 'work', name: 'Jacob Two-Two Meets the Hooded Fang', author: 'Mordecai Richler', year: 1975, language: 'English', region: 'Canada', confidence: 'established',
    summary: 'A Canadian comic fantasy by a major novelist about a small boy who has to say everything twice and is sentenced by a children\'s prison; a model of comic fantasy built on a child\'s sense of injustice.',
    kw: ['richler', 'canadian children\'s literature', 'comic fantasy', 'child hero', 'injustice', 'montreal'], genres: ['comic fantasy'],
  },
  // MORE
];
