# Fact-checks of the whole-subject profiles

Each profile file in `apps/web/src/engine/knowledge/library/profiles/` was written by one AI agent and then checked by a second that did not write it (web search for dates, titles, authors, numbers and "first"/"coined" claims).
This folder keeps what the checkers reported, so the limits are visible: the counts, and what each checker said it could NOT confirm. The text of the profiles is worded loosely where a checker was unsure.
The checkers could not fetch Wikipedia (DNS failure) and worked from search summaries; a number of well-known dates were confirmed only from recall and the library's own records. Nothing here is a claim that the profiles are verified entry by entry.

| Batch | Subjects | Claims checked | Corrected | Softened | Removed | Searched |
| --- | --- | --- | --- | --- | --- | --- |
| Mystery, thriller and horror | mystery, thriller, horror | 220 | 5 | 7 | 1 | yes |
| The three biggest fiction genres | fantasy, science-fiction, romance | 231 | 15 | 12 | 0 | yes |
| Children's literature, picture books and young adult | childrens-literature, picture-book, young-adult-fiction | 278 | 4 | 8 | 1 | yes |
| Poetry and its two oldest modes | poetry, lyric-poetry, epic-poetry | 231 | 3 | 2 | 0 | yes |
| Memoir, biography and the essay | memoir, biography, essay | 188 | 4 | 12 | 0 | yes |
| Writing for the stage and the screen | screenplay, stage-play, tragedy | 255 | 12 | 19 | 0 | yes |
| Historical, literary and crime fiction | historical-fiction, literary-fiction, crime-fiction | 228 | 9 | 12 | 0 | yes |
| Romanticism, realism and modernism | romanticism, realism, modernism | 317 | 11 | 5 | 2 | yes |

## What the checkers could not confirm

### Mystery, thriller and horror

- Gaboriau's L'Affaire Lerouge: sources say serialised in Le Pays in 1865 (not 1863), republished in Le Soleil in 1866, book by Dentu in 1866. The text gives only 1866, the book year, which matches the library, so I left it.
- Hammett's Red Harvest (1929) and The Maltese Falcon (1930) are book dates, and both were serialised in Black Mask earlier. The text does not claim first publication, so I left them.
- The Great God Pan (1894) is the book date. Some references list an 1890 magazine version that I could not confirm. The library uses 1894.
- Ring (1991) and Uzumaki (1998) returned no search results. The Only Good Indians (2020) was only weakly confirmed. These rest on my knowledge, and Uzumaki also matches a library record.
- Van Dine 1928, Knox 1929 and The Mysterious Affair at Styles (US 1920, UK 1921) match the library but were not re-found by search. The Detection Club's 1930 founding was confirmed as the commonly cited year (dinners from 1928, constitution adopted 1932).
- The three Cambridge and Symons reference titles were not searched. Danse Macabre and The Philosophy of Horror were confirmed in passing.
- The general-practice claims (shelving, 'high concept', 'page-turner', shops using 'suspense' for slower dread) and the market-wide 'labelled strands and big sales' wording are hedged but unverified by search. The word-count ranges match the library's market entries.
- WebFetch to Wikipedia failed (host not resolvable), so every check came from WebSearch summaries or my own knowledge.

### The three biggest fiction genres

- WebFetch could not reach Wikipedia (DNS failure), so all checks used WebSearch summaries. A few well-known title years returned no search result and rest on solid recall plus agreement with the library: Nine Princes in Amber 1970, American Gods 2001, Mistborn 2006, Snow Crash 1992, Solaris 1961, Pamela 1740, Evelina 1778, Rebecca 1938, Nine Coaches Waiting 1958, Sweet Savage Love 1974, The Kiss Quotient 2018, Red, White & Royal Blue 2019, Beach Read 2020.
- Campbell 'from 1937' (sources say late 1937, with full control in May 1938; the Golden Age is usually dated from 1939). The text hedges this, and the watch note says critics date the Golden Age differently.
- Harlequin's takeover of Mills & Boon is dated 1971 or 1972 depending on source, so the text now says 'early 1970s'.
- Persuasion is dated 1817 to match the library. It was published in December 1817 but the first-edition title page says 1818.
- Length, series, shelving and bookshop-section statements in all three readers facets are market guidance, not fact. They match the library's mkt-len entries and are marked 'varies'.
- Judgement calls kept hedged: Morris 'often cited' as early invented-world fantasy; Rendezvous with Rama as a 'common example' of hard SF; Left Hand of Darkness as a 'frequent example' of soft SF.

### Children's literature, picture books and young adult

- Peter Rabbit 1902 is the Warne trade edition (private printing December 1901); the file uses 1902, matching the library entry.
- Charlie and the Chocolate Factory: 1964 is the US first edition; search results disagreed on the UK date (1964 or 1967). The file claims no UK date.
- Lear 1846 and Pippi Langstrump 1945 returned no search hit; they rest on solid prior knowledge. Andersen 1835 was supported by one French source.
- Roald Dahl as a narrator who addresses the reader: confirmed only for The Magic Finger by search; the text now says 'several' rather than 'many'.
- Caldecott as the start of the modern picture book is a critical judgement (Sendak is the usual source); the text keeps 'often called'.
- Tablets from about 2010 bringing picture-book apps was not searched; it is kept as a loose date.
- Rosie's Walk: one museum page says 1967, but catalogue, Kirkus and ALA records say 1968; 1968 is kept.
- New adult origin in 2009: a Cambridge Element credits St Martin's Press, but the Publishers Weekly article was not read.
- A Wizard of Earthsea as a YA landmark rests on one secondary source; the watch line already warns that some listed books were not written for the YA market.
- 'Teen books among those most often challenged' was not confirmed by search; it is a hedged general observation.
- The Kate Greenaway Medal was renamed (Carnegie Medal for Illustration); sources date the change to 2022 or 2023 and the file now words this around either date.

### Poetry and its two oldest modes

- poetry.js: chapbook and full-length page counts vary by press and no authoritative standard was found; the figures are common guidance under a record already marked varies.
- poetry.js: Enheduanna's authorship of the hymns credited to her is debated, and her blood relation to Sargon is uncertain; the text already hedges both.
- poetry.js: 'books sell in far smaller numbers than fiction', the social-media poetry sentence, and the Baudelaire and Whitman characterisations are qualitative or interpretive, with no statistic checked.
- poetry.js: volta, ars poetica and in medias res origins rest on solid general knowledge and were not searched; stanza etymology was confirmed.
- lyric-poetry.js: Pindar 'mostly first half of the fifth century' is supported by the earliest and latest dated odes (498 and about 446 BCE) but is a range, not a count.
- lyric-poetry.js: Donne's The Sun Rising as a 'variation' on the aubade is interpretive and no source was found for it.
- lyric-poetry.js: the Wordsworth preface phrase and Mill's 1833 remark were web-checked by the writer and not re-fetched from primary texts.
- lyric-poetry.js: 'confessional' as a label from Rosenthal's 1959 review of Lowell is a simplification, since the adjective first appears in a passage about Whitman in the same review.
- epic-poetry.js: Roland composition date (estimates from about 1040 to 1115), the Mahabharata window of 400 BCE to 400 CE, and the standard Gilgamesh version are inherently approximate or debated; the text hedges or omits them.
- epic-poetry.js: Paradise Lost 'more than 10,000' lines is true by the usual count (about 10,565) but that figure was not confirmed by a source; Lucan's century and Lewis's primary and secondary pairing came from general knowledge or summaries, not primary texts.

### Memoir, biography and the essay

- Corrections: memoir.js had H Is for Hawk as 2015 (first published 2014, matching the library) and put Equiano's 1789 narrative under 'nineteenth century'. biography.js dated Suetonius to 'around 100 CE' (about 121). essay.js credited The Tatler to Addison and Steele jointly (Steele founded it).
- Confidence: profile-biography-history was changed from 'established' to 'contested', because its own watch point says 'the first biography' depends on the definition, and the installed fantasy, romance, SF, thriller and YA histories use 'contested' for the same reason. Memoir craft stays 'varies', since two of its points say practice differs by publisher and country.
- Also changed: the biography history points were reordered so Freud (1910) comes before Strachey (1918), as the README's 'earliest first' requires.
- The Gossamer Years (c. 974 against the library's c. 975), Kempe (dictation early 1430s, scribe 1436) and the Pillow Book (c. 1000 to 1002) have uncertain exact dates. The text uses only 'late tenth century', 'fifteenth century' and 'about 1000 CE', which are safe.
- Nabokov: 1951 is the UK title Speak, Memory; the US title that year was Conclusive Evidence. The library's work record uses Speak, Memory (1951), so the text follows it.
- Doubrovsky and 'autofiction' (Fils, 1977) is the standard attribution, but Lejeune used the word in 1978 in a different sense and the practice is older. The record stays 'contested'.
- Search returned no source for these market and shelving claims. All are hedged, and the records carry 'varies' and an asOf date. They are: memoir filed with biography, manuscript against proposal, trade biographies being long and sold on a proposal, and a debut essay collection being harder to sell.
- Black Boy 1945, Testament of Youth 1933, Goodbye to All That 1929 and Bacon's 1612 edition were not returned by search. They match the library's own records and settled knowledge. Only the year 1612 is stated, not the essay count.
- Lyric essay: sources date the term to 1993, 1996 or 1997 (the Seneca Review editorial is the most cited). The text says only 'in the 1990s' and names nobody.
- Tanizaki is 1933 in most sources and 1934 in one, and the library says 1933. Okakura's publisher differs between sources, but 1906 is consistent and no publisher is stated.

### Writing for the stage and the screen

- Aristotle's Poetics points (plot first, the best protagonist, recognition coinciding with reversal, pathos, comedy versus tragedy) were checked through secondary sources only, because a direct fetch of the text failed.
- A few well-known dates were not returned by search and rest on general knowledge: Congreve 1700, McKee's Story 1997, Streetcar 1947, The Crucible 1953, Hedda Gabler 1890, Miss Julie 1888, Anna Karenina 1878 in book form, Jude 1895, the etymology of catastrophe, plus some screenplay credits (Some Like It Hot, Tokyo Story, Network, Fargo).
- Practice claims in the stage-play and screenplay readers facets (copyright, running times, page counts, no-interval plays) are hedged and marked varies but are not individually sourced.
- Pulp Fiction's works entry keeps the library's author string 'Quentin Tarantino and Roger Avary' (shared Oscar), while the strict screenplay credit is Tarantino alone with a shared story credit. The conv text now says this precisely.
- The O.S. versus O.C. gloss: sources disagree on the difference, so the text only says some scripts use O.C. (off camera) and that terms vary.
- Soyinka's Death and the King's Horseman premiere is 1975 or 1976 by source, so the text gives only the 1975 publication year. Dou E and Hayavadana dates are approximate or ambiguous and are now worded that way.

### Historical, literary and crime fiction

- Literary fiction history: sources disagree on when the term 'literary fiction' arose (a 1970s trade interview vs the late nineteenth century). The summary now says so and the record stays contested.
- Crime fiction: the Newgate Calendar's first book edition (1773 or 1774), Maigret's start (1930 serial, 1931 book, one source says later) and Treat's V as in Victim as first procedural are hedged ('from the 1770s', 'around 1930', 'often traced to') rather than pinned to one year.
- Crime Writers' Association founded 1953 was not returned by search this session; it rests on solid knowledge and the writer's own check.
- Historical fiction: Hutcheon may have used 'historiographic metafiction' slightly before the 1988 book; the text ties the term to A Poetics of Postmodernism (1988) and claims no first use. Barker and Atwood are described only as working with documents, doubt and gaps in the record.
- Characterisations kept as widely held views, with hedges: Gone with the Wind criticised for romanticising slavery; In Cold Blood and Gone Girl as helping shape true crime and domestic noir; women private eyes entering the mainstream; Henry James and Woolf as psychological realism.

### Romanticism, realism and modernism

- The web-search budget ran out partway through. Romanticism and most flagged Realism items were searched (De l'Allemagne 1810/1813, Athenaeum 1798, Nightingale subtitle, Weltschmerz, Keats letter, Kubla Khan, Lovejoy, Lake Poets, Balzac title, Courbet, Duranty, Champfleury, Bovary trial, Watt, Granta, Barthes, Middlemarch dates, Howells, Woolf).
- Nothing in modernism.js was searched. Those claims rest on solid knowledge and the library's own records, which match for every dated work: Ulysses ban in 1933 and British trade edition in 1936, May Sinclair 1918, Paterson 1946, and Eliot's 1919 and 1923 coinages.
- Several realism dates were checked only from knowledge and the library: Turgenev's Sportsman's Sketches 1852, Boule de Suif 1880, Sentimental Education 1869 and Socialist Realism 1934. Machado 1881 and Verga 1881 match the library.
- Where sources disagree the text now spans or hedges: Balzac's title (1839 to 1842), dirty realism (Granta 1983, one source says 1984), Woolf's Bennett and Brown essay (first printed December 1923, pamphlet 1924), Huckleberry Finn (1884 UK, 1885 US).
- M. H. Abrams's 1965 date was not confirmed, but no file states it. 'Conversation poems' as a critical label was coined later by Harper (1928) from Coleridge's subtitle, which the file says.
- Judgement calls kept with hedges: Byron's Manfred and Shelley's Prometheus Unbound as closet drama, Peter Schlemihl under doubles, Strindberg and Brecht under modernist drama, Poetic Realism and naturalism as offshoots of realism.

## Second pass on the first four batches

A restarted run checked the first four batches a second time with a fresh checker (an unplanned repeat, but a useful second opinion). The installed text includes the second pass's edits: it changed about 50 more lines (insertions and deletions counted) across 11 of the 12 files, all of them corrections or softenings (for example "from 1937" became "from the late 1930s", Archilochus was replaced by Alcman in a list, "mock-insult" became "put-down", a note was added that The Peter Rabbit text was privately printed in 1901). The first pass's reports are the files without a suffix; the second pass's are `*-second-pass.json`.

| Batch | Claims checked | Corrected | Softened | Removed |
| --- | --- | --- | --- | --- |
| The three biggest fiction genres | 246 | 3 | 5 | 0 |
| Mystery, thriller and horror | 220 | 4 | 3 | 0 |
| Children's literature, picture books and young adult | 236 | 1 | 7 | 0 |
| Poetry and its two oldest modes | 231 | 2 | 2 | 0 |

What the second-pass checkers could not confirm:

### The three biggest fiction genres (second pass)

- Lint caveat: in the repo, `library-profile-check.mjs --staging` reports 18 duplicate-id/name problems per file. Byte-identical copies of fantasy.js, science-fiction.js and romance.js are already installed in library/profiles/, and I did not touch them. In a scratch copy with those three removed, all three files print OK (9 records each, every facet found). The repo is untouched (git status clean).
- The first checker's report at this path was replaced. Its corrections were already in the text and I re-verified them.
- Not returned by search, held on solid knowledge and library agreement: Mistborn 2006, Who Fears Death 2010, The Grace of Kings 2015, Pamela 1740, Rebecca 1938, The Sheik 1919, Solaris 1961, Dune 1965, Dhalgren 1975, Kindred 1979, Snow Crash and A Fire Upon the Deep 1992, Parable of the Sower 1993, Stories of Your Life and Others 2002, Ancillary Justice 2013, Dangerous Visions 1967, The Kiss Quotient 2018, Red, White & Royal Blue 2019.
- The earlier-use claim that sword and sorcery appeared in a 1953 headline could not be found in any source. The text does not state it, and 'proposing in 1961' is confirmed (Ancalagon, April 1961).
- Persuasion is dated 1817 to match the library (the first-edition title page says 1818). Campbell's start at Astounding is dated differently by different sources, so the text now says 'late 1930s'. Harlequin's takeover of Mills & Boon is 1971 or 1972, so the text says 'early 1970s'.
- Critical judgements left hedged: Morris as early fantasy in an entirely invented world, Rendezvous with Rama as hard SF, Left Hand of Darkness as soft SF, Starship Troopers as military SF. Market statements (word counts, shelving, series) are marked varies with asOf 2025.

### Mystery, thriller and horror (second pass)

- Lint: node scripts/library-profile-check.mjs --staging run inside the repo reports only 'duplicate id / duplicate profile' because byte-identical pre-edit copies of all three files are already installed in apps/web/src/engine/knowledge/library/profiles. I did not touch them. I ran the check from a scratch copy with those three installed files removed, and it printed OK for mystery.js, thriller.js and horror.js (9 records each, lint clean, every facet found). The installed copies are now stale and need re-installing from staging.
- Several well-known dates were not returned by any search and rest on solid knowledge plus agreement with the library's own work records: Eco 1980, Magpie Murders 2016, Polidori 1819, Nosferatu 1922, Universal's Dracula and Frankenstein 1931, Psycho (film) 1960, Hill House 1959, Rosemary's Baby 1967, The Exorcist 1971, Carrie 1974, The Shining 1977, Conrad 1907, Fleming 1953, Deighton 1962, le Carre 1963, Forsyth 1971, Clancy 1984, Turow 1987, Harris 1988, Grisham 1991.
- Not sourced and kept hedged: the 'narration may leave things out but not state falsehoods' craft standard (mystery); 'amateurs, not professional agents' for Ambler and Household (thriller); the Hitchcock suspense-versus-surprise credit ('popularly credited') and the MacGuffin ('popularised by', no coiner named); the shop use of 'suspense', 'high concept', 'page-turner' and 'tradecraft'.
- Contested or inexact sources, text kept hedged or limited to the safe claim: Gaboriau (serial 1865, book 1866, text says only 1866); The Honjin Murders (1946, serial-versus-book split unconfirmed); Radcliffe's essay (1826, with older related distinctions); Machen's The Great God Pan (now 'book, 1894'; the first chapter ran in 1890); the Detection Club (founded 1930, constitution 1932).

### Children's literature, picture books and young adult (second pass)

- The lint result is not from the stock command in the real tree. These three profiles are already installed in apps/web/src/engine/knowledge/library/profiles/ (identical to staging before my edits), so `library-profile-check.mjs --staging` there reports only 18 duplicate id/name problems per file and nothing else. I ran it on a scratch copy of the tooling with the installed copies removed, and all three print OK.
- The installed copies were not touched, as instructed. They now differ from staging by 8 small edits and must be re-copied if the fixes should ship.
- The per-turn web search budget ran out after about 35 searches in this pass. Not re-searched: Margaret A. Edwards Award 1988, Newbery Medal 1922, Edmund Evans toy books, the Snowy Day Caldecott win of 1963, the Macmillan children's department of 1919, and BookTok. These rest on solid prior knowledge and the earlier checker's report.
- Charlie and the Chocolate Factory: the US first edition (Knopf, January 1964) is confirmed. The UK date is genuinely disputed (booksellers say 1967, one encyclopedia infobox says late 1964), so the files only say Britain came later and give no UK year.
- Still resting on hedged critical judgements rather than checkable facts: Alice as a turning point, Newbery and Orbis Pictus as origin markers, Caldecott as the start of the modern picture book, Seventeenth Summer and The Outsiders as first YA novel, and Harry Potter widening the audience.
- Not searched: 'tablets from about 2010 brought picture-book apps' and 'present tense has become common in recent decades'. Both are deliberately loose.
- Struwwelpeter: sources disagree on when it took that title (1847 or 1858), so the text says only that 1845 was under another title. Babar: the first English edition is dated 1933 or 1934 by different sources, so no English year is given.

### Poetry and its two oldest modes (second pass)

- INSTALL: poetry.js, lyric-poetry.js and epic-poetry.js were already installed in library/profiles/ (byte-identical to staging before this pass). Staging now differs by four conv strings (poetry-history conv 4; lyric-poetry-history conv 2, lyric-poetry-subgenres conv 7, lyric-poetry-canon conv 3), so the installed copies must be re-copied from staging.
- LINT: node scripts/library-profile-check.mjs --staging reports only 'duplicate id/profile' errors (18 per file) against the installed copies. It prints OK for all three files when run against a scratch copy of the library with those three installed files removed. No repository file was touched.
- SEARCH BUDGET: the shared web-search limit ran out before Pindar's dated range, the title Ars Poetica (Quintilian) and a few similar checks. These rest on earlier results and solid general knowledge, not on a fresh search.
- Nibelungenlied 'about 1200' got only an edition note (around 1200, not certain), not a scholarly source. Lucan 'first century CE', Argonautica 'third century BCE' and the Iliad/Odyssey 'eighth century BCE' are from general knowledge.
- The library holds two Odyssey years (work-anc-odyssey says c. 725 BCE; the majority of other records, and the profile, say c. 700 BCE). Both fit the profile text, and the lint accepts it.
- Interpretive claims remain, hedged where the text hedges: the Alexandrian canon 'helped shape' later ideas of the lyric poet, Whitman as 'a model for free verse', Baudelaire as 'often called a founding book', the social-media poetry dispute, 'new epic poems are uncommon', ring composition 'may have helped oral singers keep their place'.
- Enheduanna: hedging is sufficient. The text says 'traditionally described as' and 'how much she composed is debated', and the watch note repeats it.

## Modernism

Held back after its first check (which searched nothing); checked again on its own: 112 claims, 3 corrected, 4 softened, 0 removed, web search used.

- Pound's Imagist principles (direct treatment of the thing, no unneeded word) are kept as paraphrase of the March 1913 Poetry statement; search confirmed the source but did not return the wording.
- Eliot's 'escape from personality' is kept as paraphrase of 'Tradition and the Individual Talent' (1919); the essay and date are confirmed, the exact line was not returned by search.
- WebFetch could not resolve hosts, so verification used WebSearch summaries (mostly encyclopedia, library and dealer pages) plus prior knowledge. Woolf's death date, Mann 1924, the Kafka posthumous novels, In Our Time 1925, Cane 1923 and Faulkner 1929 were confirmed from knowledge, not from a returned search hit.
- The inclusion of Fitzgerald's The Great Gatsby and Hemingway in the modernist canon is a classification that critics argue over, not a factual claim.

## Later batches

| Batch | Subjects | Claims checked | Corrected | Softened | Removed | Searched |
| --- | --- | --- | --- | --- | --- | --- |
| Comics, manga and webcomics | comics-and-graphic-novels, manga, webcomic | 233 | 6 | 5 | 0 | yes |
| Fantasy subgenres | epic-fantasy, urban-fantasy, dark-fantasy | 165 | 2 | 11 | 0 | yes |

What the checkers could not confirm:

### Comics, manga and webcomics

- The shared web search budget ran out partway through (WebFetch could not resolve hosts either), so some claims were not searched. I kept them only where I am certain or where they agree with the library's own work records, which were themselves only spot-checked. The unsearched claims include Comiket 1975, Norakuro 1931, and the Penny Arcade, Questionable Content, Order of the Stick, xkcd, Kickstarter and Patreon dates.
- Famous Funnies: sources disagree on which 1934 issue was first on newsstands. The text now says 'often called the first true American comic book' and notes the earlier giveaways.
- Grawlix and emanata: Walker's own 1975 book credits Charles D. Rice for the grawlix terms, and I found no coiner for emanata. The text claims only 'helped popularise'.
- Kyle and 'graphic novel': sources differ on the essay title and issue. The text says only 'a 1964 fan essay'.
- Maus Pulitzer: some sources say the special citation was for the second volume only. The text says only 'a special Pulitzer Prize citation in 1992'.
- Year 24 Group membership (Ikeda) is loosely defined. Shonen Jump's 1968 launch date varies by source, so only the year is given.
- The origin of the vertical-scroll webtoon format is not settled. The text now says it grew out of South Korean portals (Daum from 2003, Naver Webtoon from 2004). Heartstopper's print year is left out on purpose.

### Fantasy subgenres

- epic-fantasy: the Shannara/Lord Foul's Bane 'often credited' market claim has no retrieved source; Tolkien drawing most on Beowulf and northern legends, the Eye of the World prophecy and Lord Dunsany rest on recall; Abercrombie's The Blade Itself 2006 was not returned by search (kept on library cross-check and recall)
- urban-fantasy: first-person narration for Dead Until Dark, Moon Called and Magic Bites is from recall (only the Hollows was confirmed); de Lint's Newford, the Tithe and City of Bones YA classification and the cozy branch (no named works) are from recall
- dark-fantasy: no source calls Donaldson's Covenant books dark fantasy, so the text now says only 'an epic fantasy with a bitter, flawed antihero'; HBO Game of Thrones 2011-2019 and the content-warning and cruelty-as-shortcut points were not searched
- WebFetch could not resolve en.wikipedia.org, so all web evidence comes from search-result summaries, not full pages
- Seelie/Unseelie, the Radcliffe terror-and-horror gloss and the 'dark fantasy' term are hedged in the text because sources show the framing is a later simplification or the usage varies


## Second pass on two more batches

The same restarted run also checked two more batches a second time with a fresh checker; its edits (about 9 changed lines in 4 files, all softenings or accuracy notes, for example "Chekhov is the master of this" became "Chekhov is a famous example" and a note that Socialist Realism was formalised at the 1934 Writers' Congress) are installed.

| Batch | Claims checked | Corrected | Softened | Removed |
| --- | --- | --- | --- | --- |
| Historical, literary and crime fiction (second pass) | 179 | 2 | 1 | 0 |
| Romanticism, realism and modernism (second pass) | 330 | 2 | 4 | 0 |

## Repeated passes (what actually happened)

Resuming the workflow after usage limits and a container restart re-ran the fact-checkers for batches that were already checked (an error in how I resumed it, not a plan), so the first eight batches were checked two to four times by fresh checkers.
Each pass's numbers are below (claims checked / corrected / softened / removed). Each later pass made only small edits (softening a claim to "often credited", adding a note that a date differs by country, naming a source more exactly), and those edits are installed.
The exception is the stage and screen batch (screenplay, stage play, tragedy): there a writer was re-run as well, so its later pass checked a different draft; the installed text is the first draft with its first pass (255 / 12 / 19 / 0), and the second draft was not installed.

| Batch | Passes (claims / corrected / softened / removed) |
| --- | --- |
| The three biggest fiction genres | 231/15/12/0, 246/3/5/0, 263/2/2/0 |
| Mystery, thriller and horror | 220/5/7/1, 220/4/3/0, 228/5/8/0 |
| Children's literature, picture books and young adult | 278/4/8/1, 236/1/7/0, 246/1/2/0 |
| Poetry and its two oldest modes | 231/3/2/0, 231/2/2/0, 230/1/3/0 |
| Memoir, biography and the essay | 188/4/12/0, 210/4/3/1 |
| Writing for the stage and the screen | 255/12/19/0 (installed), 251/8/12/0 (a re-written draft, not installed) |
| Historical, literary and crime fiction | 228/9/12/0, 179/2/1/0, 179/5/9/1 |
| Romanticism, realism and modernism | 317/11/5/2, 330/2/4/0, 338/1/2/0 (plus a separate 112/3/4/0 re-check of Modernism) |

A claim that survives several independent checks is not thereby proven: the checkers share the same limits (search summaries rather than full pages, recall for well-known dates).

## Later batches

| Batch | Subjects | Claims checked | Corrected | Softened | Removed | Searched |
| --- | --- | --- | --- | --- | --- | --- |
| Narrative nonfiction, true crime and popular science | narrative-nonfiction, true-crime, popular-science | 178 | 5 | 8 | 4 | yes |
| The best-known forms: sonnet, haiku, free verse | sonnet, haiku, free-verse | 270 | 6 | 14 | 2 | yes |
| Science fiction subgenres and dystopia | space-opera, cyberpunk, dystopian-fiction | 224 | 5 | 13 | 2 | yes |
| Russian, French and German literature | russian-literature, french-literature, german-literature | 312 | 10 | 5 | 1 | yes |

What the checkers could not confirm:

### Narrative nonfiction, true crime and popular science

- narrative-nonfiction: the origin of the label 'creative nonfiction' is disputed. The text now says only that the name was spreading by the 1990s, and the history record stays contested.
- All three files: the 70,000 to 100,000 word figure and the sold-on-proposal practice are market impressions. Sources quote 50,000 to 100,000 words. The figure matches the library's own nonfiction-length entry and is now hedged as quoted advice, with the records marked varies.
- narrative-nonfiction: Herr's Dispatches is listed as a trade classic, but Herr later said parts of it were composite or invented. The profile makes no accuracy claim about it.
- true-crime: 'the distinction from MO is debated'. Douglas's MO versus signature distinction is confirmed, but search found no peer-reviewed critique to cite.
- true-crime: 'skew female' rests on the Vicary and Fraley (2010) finding about readers plus industry podcast data. It is already hedged in the text as a general impression.
- true-crime: the 1970s and 1980s boom rests on secondary accounts (publishers expanded their lists; Helter Skelter and Ann Rule sold very well), with no sales data found.
- true-crime: 'broadsides from the sixteenth century on' is firmly documented for murder pamphlets and ballads of about 1570 to 1620, less so for broadsides as such.
- true-crime: the December 2015 date for Making a Murderer was not search-confirmed (the text gives the year only). The Meaning of Treason is left at 'late 1940s' because sources give 1947 and 1949.
- true-crime: the legal statements (defamation and public records vary by country; 'alleged' does not remove risk) are general media-law points, not checked against any jurisdiction.
- popular-science: Darwin's wide readership and Huxley's 1860s working-men lectures are well-known but had no dedicated source. Only the 1868 Norwich lecture was confirmed.
- popular-science: 'heard as the claim' for the selfish gene and the God particle is a statement about reception, not a dated fact. The standard analogies (rubber sheet, cat in a box, cell as a city) and the embargo and deficit-model definitions are unsourced.

### The best-known forms: sonnet, haiku, free verse

- Direct page fetches (WebFetch and curl) were blocked here, so verification rests on WebSearch summaries of encyclopedias, catalogues and publisher pages, not on reading primary texts.
- free-verse.js: Hartman's Free Verse: An Essay on Prosody is dated 1980 in catalogues and 1981 in Princeton's Legacy reissue listing; the year was removed from the text.
- free-verse.js: Lowell's Life Studies (1959), Rankine's Citizen (2014), Sandburg's Chicago Poems (1916), Williams's Spring and All (1923) and Levertov's organic form returned no search results. They rest on my own solid knowledge, as does the Clifton/Oliver/Gluck 'mainly free verse' note.
- free-verse.js: the 1886 vers libre priority dispute (Kahn, Laforgue, Rimbaud) is real and unsettled; the text and a watch line already say so.
- sonnet.js: the Sicilian sestet rhymes differ by source (CDCDCD or CDECDE), as the text says. Giacomo da Lentini's invention of the sonnet is traditional only. The 'comic' half of the caudate sonnet claim was not separately sourced, and Berryman's rhyme schemes were not checked.
- haiku.js: Teimon and Danrin 'popular among townspeople' is supported in outline but not in those exact words. The toriawase, ichibutsu jitate and ginko glosses are standard terms from my own knowledge. English-language practice claims are generalisations, flagged 'varies'.

### Science fiction subgenres and dystopia

- Web search ran out partway: the per-turn search budget was used up after the first batches. Verified by search: Tucker and Le Zombie 1941, Planet Stories 1939, Foundation 1942 and 1951, Gundam classification, Mirrorshades contents, Bethke's Amazing Stories publication, Stars My Destination 1956, Shockwave Rider 1975, Cyberpunk RPG 1988, Neuromancer vocabulary (ICE, console cowboy, matrix, zaibatsu), Wetware 1988, Waste Tide, Jeter and steampunk. The rest was checked against the library's own records and solid recall, with anything unconfirmed softened or removed.
- Not searched, from solid recall: Count Zero and Mona Lisa Overdrive dates, Virtual Light 1993, the Akira and Ghost in the Shell film dates, Blade Runner 2049 and Cyberpunk 2077 dates, The Circle 2013, The Memory Police dates, V for Vendetta 1982 to 1989, Brazil 1985, Zamyatin's We 'written around 1920', The Iron Heel as an oligarchic tyranny, Mass Effect 2007, the Hitchhiker's radio and novel years, and Bujold's 1986 start.
- Characterisations rather than facts, left hedged: The Expanse as tense and Chambers as gentle, solarpunk as a hopeful reply, whether Star Wars, Foundation, Dune or Gundam count as space opera, and where The Hunger Games and The Handmaid's Tale sit between dystopia and post-apocalyptic fiction.
- Bethke's story writing date (1980 or 1982) was dropped because sources disagree. The date Dozois's label took hold was not checked, so none is given.

### Russian, French and German literature

- Search was only partly usable. Five WebSearch queries returned results: Zamyatin's We, Platonov's Foundation Pit, The Master and Margarita publication history, Heyse's falcon theory, and Jean Paul's Doppelganger. A sixth was refused because the session's search budget was used up, and WebFetch could not resolve any host. Most other dates, titles and attributions were checked from prior knowledge only.
- Weltschmerz 'credited to Jean Paul' (Selina, 1827) could not be confirmed by search. The text is hedged as 'credited'.
- Song of Roland 'around 1100' is the composition date. The Oxford manuscript is later, and the text does not say so. Doubrovsky's 1977 coinage of autofiction was not re-searched.
- Mother Courage is listed as 1941 (the library's year and the Zurich premiere year). The canon text now says it was written in 1939. The first printing may be later.
- The works year for The Master and Margarita is 1966 to match the library. The text gives the real span: written 1928 to 1940, printed cut in 1966 to 1967.
- The compare facets in all three files are interpretive generalisations. Their confidence is correctly 'contested'. The readers facets are market practice, set to 'varies' with asOf 2025.

## Later batches

| Batch | Subjects | Claims checked | Corrected | Softened | Removed | Searched |
| --- | --- | --- | --- | --- | --- | --- |
| Middle grade and the biggest YA subtypes | middle-grade-fiction, ya-fantasy, ya-contemporary | 158 | 1 | 12 | 2 | yes |
| Television and musical theatre | television-drama, sitcom, musical-theatre | 216 | 11 | 22 | 2 | yes |
| Postmodernism, naturalism and surrealism | postmodernism, naturalism, surrealism | 260 | 9 | 13 | 1 | yes |
| Mystery and crime subgenres | cozy-mystery, noir, police-procedural | 220 | 6 | 18 | 0 | yes |

What the checkers could not confirm:

### Middle grade and the biggest YA subtypes

- WebFetch could not reach Wikipedia, so checks went through WebSearch summaries, many of them secondary (Goodreads shelves, library catalogues, retailer pages).
- Several title years rest on solid prior knowledge only, because searches returned nothing usable or returned Newbery award years instead of publication years. These include Little Women, Treasure Island, Anne of Green Gables, The Secret Garden, The Hobbit, Narnia, Charlotte's Web, Hatchet, The Westing Game, Number the Stars, Bud, Not Buddy, Holes, The Giver, Coraline, The Graveyard Book, When You Reach Me, Wonder, A Wizard of Earthsea, Howl's Moving Castle, Twilight, City of Bones, Children of Blood and Bone, The Catcher in the Rye, The Chocolate War, Forever..., Speak, Perks of Being a Wallflower, Looking for Alaska, The Absolutely True Diary, The Fault in Our Stars, Aristotle and Dante, Eleanor & Park and The Hate U Give. The lint also cross-checks the canon works against the library.
- The year Eragon was first self-published is disputed (2001 or 2002 across sources), so the files now give only the Knopf year, 2003.
- Word-count ranges and age bands come from trade convention and agent blogs and forums that vary a lot. They are hedged, marked 'varies', and now match the library's own market entries. The library itself is not uniform on the lower YA protagonist age (fifteen versus fourteen).
- General statements with no single source were kept in softened form: Harry Potter widened the audience for young people's fantasy, graphic novels are a growing part of the middle-grade market, and the non-European-tradition fantasy trend of the late 2010s.
- The challenge claim in ya-contemporary names race, sexuality and gender. The ALA 2010 to 2019 list clearly supports race and sexuality, while gender-themed titles are more prominent in later years. The claim is hedged and was left as written.

### Television and musical theatre

- WebSearch worked, but WebFetch and direct curl were blocked, so every check came from search summaries or solid prior knowledge. Many dates and credits were not located by a search and rest on memory: Gunsmoke and Perry Mason, the 1980s to 2020s TV drama launches, Seinfeld, Friends, Cheers, The Golden Girls, the 1940s to 1960s Broadway shows, The Black Crook and the Ziegfeld Follies, and Mamma Mia and Jersey Boys.
- The season-count claims (22 or more on US networks; 6 to 13 on cable and streaming; about six in Britain), the 20 to 22 minute US half-hour, and the 13 to 24 episode US sitcom season were not found in a source. They stay hedged, in facets marked varies.
- Company (1970) as 'an early concept musical' and Hamilton as 'almost wholly sung' are common labels that informed people could dispute. Both are worded mildly.
- The history facets of all three files are now marked contested (they were established), because the 'first' or 'start' of each form is disputed. The facet names keep the 'Television drama: ...' form.

### Postmodernism, naturalism and surrealism

- The per-turn web search budget ran out before the Sister Carrie check (Doubleday 1900, reissued 1907), so that claim rests on the checker's own knowledge. WebFetch could not resolve any host here, so sources were read only through search summaries.
- Fiedler's 'Cross the Border, Close the Gap': sources give 1968, 1969 and 1970, so the text says only 'late 1960s and 1970s'. Hassan's 1971 book is confirmed.
- 'Some authors placed under the label have questioned it' follows the library's own entry and is not sourced to named authors.
- Die Weber 'published 1892' follows the library's year. Search confirmed the 1893 Freie Buhne staging but not the 1892 publication.
- Surrealism: Breton's war service is confirmed (Saint-Dizier neuropsychiatric centre 1916, Val-de-Grace 1917), but sources differ on dates, so none are given. The Anthologie de l'humour noir date is not stated. Vitrac's expulsion date is deliberately not stated.
- Surrealism: the Nadeau and Seaver and Lane reference titles and Reverdy's image as Breton's source rest on the checker's knowledge and were not searched.
- Gorky's The Lower Depths is classed as naturalist drama, and some critics class it as realist or symbolist.

### Mystery and crime subgenres

- The shared web-search budget ran out before the last few checks. These rest on solid prior knowledge, not a fresh source: St Mary Mead and Chipping Cleghorn; The Thursday Murder Club (retirement village, major bestseller); Chocolate Chip Cookie Murder 2000; The Asphalt Jungle 1949; Total Kheops 1995; Hill Street Blues, Law & Order and Prime Suspect dates; The Wire 2002 to 2008; In the Woods centred on the detective's own past.
- WebFetch could not reach Wikipedia (DNS failure), so checks used search summaries only.
- The origin of the word cozy is unsettled in the sources. The text now says so instead of claiming Golden Age writers never used it.
- Maigret is dated 'from the early 1930s' on purpose, since sources give 1930 (serial), 1931 or 1932 (book).
- Dragnet's television start is given as 1951, but sources split between 14 and 16 December 1951.
- The Killer Inside Me is attributed to Lion Books (dealer listings and a review agree); one library catalogue says Fawcett.
- Several characterisations are unsourced, though hedged: cozy readers' preferences, noir tropes, and the descriptive procedural branches (cold-case, historical, village). The police-procedural subgenres facet is now marked 'varies'.
- 'Cabot Cove syndrome' is framed as informal usage because only blog and fan-site sources were found.

## Later batches

| Batch | Subjects | Claims checked | Corrected | Softened | Removed | Searched |
| --- | --- | --- | --- | --- | --- | --- |
| Interactive fiction, visual novels and game narrative | interactive-fiction, visual-novel, video-game-narrative | 134 | 11 | 6 | 0 | yes |
| Travel writing, nature writing and self-help | travel-writing, nature-writing, self-help | 220 | 5 | 15 | 0 | yes |
| Narrative, spoken word and the ballad | narrative-poetry, spoken-word-poetry, ballad | 286 | 5 | 10 | 0 | yes |
| Romance subgenres (only historical-romance installed: its checker's search budget ran out before the other two, which are held back) | historical-romance, romantic-comedy (held back), paranormal-romance (held back) | 128 | 7 | 16 | 3 | yes |

What the checkers could not confirm:

### Interactive fiction, visual novels and game narrative

- Zork works year is 1977 only because the library's work-scr-zork records it; sources say the game was written 1977 to 1979 and reached home computers in 1980. The text now says so, but the library-wide year is a development year, not a first-publication year.
- WebFetch could not resolve any host (DNS), so all checks used WebSearch summaries of encyclopedia, IFWiki, publisher and press pages. The Walking Dead is confirmed only at the year level (2012).
- Who coined 'interactive fiction' is disputed (one source credits Robert Lafore's 1979 company). The file only says Infocom used the phrase, which is true.
- The 'time cave' term rests on one author's vocabulary (Sam Kabo Ashwell) and is now hedged, not double-sourced.
- Whether Leaf's Shizuku and Kizuato coined or only popularised 'visual novel' differs by source, so the text says 'often credited with popularising'. The Chunsoft 'sound novel' trademark appears in only one wiki source; the file makes no legal claim.
- Hades' reactive dialogue was confirmed from reviews, not a developer interview. No source was found for a GDC Game Narrative Summit by that name, so the text no longer implies one.
- No market-share figure was found for adult versus all-ages visual novels in the early Japanese PC market, so that claim is hedged to 'many'.

### Travel writing, nature writing and self-help

- Gilbert White's Selborne: title page says 1789 but one source says it was issued in December 1788; the text now says 'dated 1789 on its title page' and the works year stays 1789.
- Thomas Harris's I'm OK, You're OK: library catalogues say 1969, Wikipedia says 1967; softened to 'late 1960s'.
- Napoleon Hill as New Thought is a classification (bibliographies list him there, not every scholar does); text stays hedged as 'often placed in its line'.
- Marco Polo (written 1298-1299) and Ibn Battuta (finished 1355 or 1356) are deliberately approximate; sources differ by a year or two.
- Origin of 'new nature writing' and 'toxic positivity' as phrases was not found; neither is claimed beyond being a label or a critics' term.
- Length ranges (70,000 to 100,000 words for travel and nature, 40,000 to 80,000 for self-help) are author-services rules of thumb, not industry data; the readers facets are set to varies with asOf.

### Narrative, spoken word and the ballad

- The web search budget ran out after about 25 queries and WebFetch could not reach Wikipedia, so the remaining claims rest on prior knowledge plus the library's own entries (ballade, romance, corrido, ballad meter agree). Mostly modern works and their years: Hesse 1997, Creech 2001, Woodson 2014, Carson 1998, Oswald 2011, Masefield 1911, Noyes 1906, Frost 1914, Seth 1986, Walcott 1990, Kae Tempest 2016, Patricia Smith 2008 and Sarah Kay's 2011 talk.
- Also not searched: the ballad-collecting dates (Child 1882 to 1898 and 305 ballads, Sharp 1916 to 1918, Library of Congress recordings of the 1930s, Anthology 1952), Cave 1996, Lorca 1928, Kipling, Wilde, Keats, the Beggar's Opera and the ballad etymology.
- Aurora Leigh is dated 1856 although the title page reads 1857. Herder's Volkslieder second part (1779) is from memory. Gilgamesh and Homer dates are kept general.
- Slam time, scoring and judge rules are common practice only and are marked varies. Nuyorican founders and exact date, The Last Poets lineup, and the Marc Smith Get Me High to Green Mill sequence are described loosely because sources differ.
- The Gest of Robyn Hode printing date is now 'the decades around 1500', since editions are dated from the 1490s to about 1510. Ballad origins stay contested.

### Romance subgenres

- Search was only possible for historical-romance.js: the shared web search budget ran out before romantic-comedy.js and paranormal-romance.js, and WebFetch could not resolve any host. Those two files were checked against the library's own records, the writer's confirmations and solid prior knowledge, with anything weaker corrected, softened or removed.
- historical-romance.js, confirmed by search: Flowers from the Storm 1992, Lord of Scoundrels 1995, Whitney My Love 1985, The Wolf and the Dove 1974, A Knight in Shining Armor 1989, The Flame and the Flower 1972 as the first original paperback romance, Regency Buck 1935 as Heyer's first Regency-set novel, Indigo 1996, An Extraordinary Union 2017, Starz Outlander 2014, Bridgerton 2020, the 1753 Marriage Act and Gretna Green, the Married Women's Property Acts, special licence, ton, wallpaper historical, Ramsdell and Radway. Not reached by search, but they match library records and solid knowledge: The Duke and I 2000, Devil in Winter 2006, Sweet Savage Love 1974, Outlander 1991, The Grand Sophy 1950.
- romantic-comedy.js: no film year was web-checked (1934, 1938, 1940, 1959, 1977, 1989, 1990, 1994, 1998, 1999, 2009), nor Jenny Han 2014, The Love Hypothesis 2021, the New Comedy dates, or the Ephron screenplay credit. The 'anti-romcom' label for Annie Hall and the informal term 'meet-ugly' could not be sourced and are now hedged. Dropping either point would still leave the facet with at least 5 points.
- paranormal-romance.js: Villeneuve 1740, Beaumont in 'the 1750s', Dark Shadows 1966 to 1971 with Barnabas introduced in 1967, Silhouette Shadows 1993 to 1996, Dark Prince 1999, True Blood 2008 to 2014, the Twilight films 2008 to 2012 and the Psy-Changeling description rest on the writer's earlier checks, library records and prior knowledge, not a search in this pass.
- General-practice and market-trend statements (word counts of 70,000 to 100,000, shelving, Regency market share, streaming shift, reader-attitude trends) are unsourced and hedged, with confidence 'varies' and asOf where they sit.


## Re-checks of two batches whose first checkers had no web search

Interactive fiction, visual novels and game narrative (first check 234 claims / 2 corrected / 17 softened / 2 removed, from recall only; second check with search: 134 / 11 / 6 / 0) and travel writing, nature writing and self-help (first check 192 / 5 / 11 / 0 from recall only; second check with search 220 / 5 / 15 / 0) were held back after their first check and installed after the second. The second check of the interactive fiction batch corrected eleven claims the first one had left, which is the reason files checked from recall alone are held back.

## Second checks with search (files whose first check had no web search)

| Batch | Subjects | Claims checked | Corrected | Softened | Removed | Searched |
| --- | --- | --- | --- | --- | --- | --- |
| Romance subgenres | historical-romance, romantic-comedy, paranormal-romance | 130 | 2 | 12 | 0 | yes |
| Japanese, Chinese and African American literature | japanese-literature, chinese-literature, african-american-literature | 405 | 5 | 6 | 0 | yes |
| Darker thriller and horror subgenres | psychological-thriller, espionage-fiction, cosmic-horror | 110 | 2 | 4 | 1 | yes |
| Ode, elegy and light novels (the first checks of ode and elegy had no search; the light-novel check ran out of search part-way) | ode, elegy, light-novel | 98 | 3 | 6 | 0 | yes |

What the second checkers could not confirm:

### Romance subgenres

- romantic-comedy.js: Annie Hall as an 'anti-romcom' rests on commentary; (500) Days of Summer is the better-supported example. The text hedges it as a label critics sometimes give.
- romantic-comedy.js: 'late 1980s and 1990s as a high point' rests on journalism (golden age or renaissance), hedged as 'often described'; romcom novel length of roughly 70,000 to 90,000 words rests on writing guides and blogs (facet is 'varies' with asOf).
- romantic-comedy.js: 'meet-ugly' is documented only as informal fan usage (Fanlore, from about 2014); the point can be dropped and the facet would keep 9 points. Emma is dated 1815 to match the library (published December 1815, title page 1816).
- paranormal-romance.js: Guilty Pleasures and the Anita Blake series being 'usually classed as urban fantasy' rests on reviews and catalogue tags, not an authoritative genre history; no source was found for an influence claim, so none is made.
- paranormal-romance.js: 'time-travel romance became well known in the late 1980s and 1990s' rests on reader, blog and encyclopedia-style sources, not sales data; single-title length of roughly 75,000 to 100,000 words rests on one publisher guideline plus general guides (facet is 'varies' with asOf).
- paranormal-romance.js: the mid-2000s 'boom' is a trend claim (sources say paranormal romance was established before Twilight); the text names only books and years. WebFetch could not resolve any host (DNS), so search summaries were the only web source throughout.

### Japanese, Chinese and African American literature

- WebSearch worked this time, but WebFetch could not resolve any host and curl through the proxy returned 403, so no primary text was read. Every check rests on search summaries, not on the works themselves.
- About 170 of the 405 claims were confirmed or corrected against a search result (56 Japanese, 50 Chinese, 64 African American). The rest are standard facts, such as period boundaries, form definitions and well-known titles, held from knowledge and consistent with the library entries.
- Works-field years that are serial, novella or print dates (Camel Xiangzi 1937, Family 1931, Red Sorghum 1986, Journey to the West 1592, Dream of the Red Chamber 1791) follow the library. The text says what each date is where it matters.
- 'First' claims depend on definitions. Wheatley is worded as 'generally seen as the first book of poems', Our Nig as 'usually named' (Webb 1857 and Crafts, published 2002, are caveats), and A Madman's Diary as 'often called' the first modern vernacular story.
- Kishotenketsu (the flagged weakest claim) is kept but hedged. The Chinese four-line-verse origin is confirmed, but sources disagree on who devised it and when.
- James Weldon Johnson's 1922 dialect point rests on a Poetry Foundation paraphrase, because his preface was not read. The wording was narrowed to match that paraphrase.
- Not individually searched, only held from knowledge: dynasty and period boundaries, the Epic of Gesar (one encyclopedia entry), chuanqi as a Ming drama type, Jin Ping Mei's cut and full versions, and general statements about the Asian American and Chicano movements.

### Darker thriller and horror subgenres

- Web evidence came only from search summaries (Wikipedia, publisher, library and Britannica pages); WebFetch could not be used and no primary sources were read.
- Songs of a Dead Dreamer has a disputed first-edition date (1985 per one source, March 1986 per another). It was removed from the cosmic horror works list and the text says mid-1980s; the library's own entry for it still says 1986.
- Crime and Punishment (1866), The Turn of the Screw (1898) and S. T. Joshi's standing as Lovecraft's standard scholar rest on recall; search did not return them.
- The word-count figures (psychological thriller 70,000 to 100,000, espionage 80,000 to 100,000, cosmic horror 70,000 to 90,000) come from blogs, genre guides and one publisher call, not a standard. Those facets are marked 'varies' and hedged.
- Smiley's People is dated 1979 (one bookseller listing says 1980). The Cthulhu Mythos label is credited to Derleth in the sources checked; whether Lovecraft used a similar phrase was not examined, so the text says 'most associated with'.

## Further batches (written and checked once, with search)

| Batch | Subjects | Claims checked | Corrected | Softened | Removed | Searched |
| --- | --- | --- | --- | --- | --- | --- |
| Comedy, satire and magical realism | comedy, satire, magical-realism | 278 | 6 | 5 | 0 | yes |
| Audio drama and podcasts | radio-drama, fiction-podcast, nonfiction-podcast | 172 | 4 | 17 | 0 | yes |
| YA romance, early chapter books and fairy tales | ya-romance, early-chapter-book, fairy-tale | 184 | 10 | 16 | 1 | yes |
| Existentialism, the Harlem Renaissance and the Beats | existentialism, harlem-renaissance, beat-generation | 232 | 4 | 14 | 1 | yes |
| Western, adventure and war fiction | western, adventure-fiction, war-fiction | 260 | 9 | 11 | 1 | yes |
| Journalism, history writing and the business book | literary-journalism, narrative-history, business-book | 140 | 7 | 9 | 0 | yes |
| Fan fiction, webnovels and light novels | fan-fiction, webnovel, light-novel (installed after a second check with search) | 126 | 3 | 11 | 0 | yes |
| Ode, elegy and villanelle | ode, elegy (installed after a second check with search), villanelle | 154 | 13 | 18 | 1 | yes |

### Comedy, satire and magical realism

- Search summaries were the only web source; WebFetch was not used and no primary text was read.
- Franz Roh: one academic paper says he first used the term in a 1923 essay on Karl Haider; the 1925 book is kept as the usual first use (wording says 'usual') and this was not resolved.
- Arturo Uslar Pietri: the date of Letras y hombres de Venezuela (1948, sometimes 1947) and the scope he gave realismo magico (Venezuelan short fiction) rest on secondary summaries; the text now says 'usually dated 1948, sometimes 1947' and 'Venezuelan short fiction'. A primary check is still advisable.
- Several well-known dates returned nothing useful from search and rest on solid own knowledge plus the library's agreeing years: García Márquez Nobel 1982, Tin Drum 1959, Autumn of the Patriarch 1975, Chronicle of a Death Foretold 1981, Beloved 1987, Midnight's Children 1981, Svejk 1921, Animal Farm 1945, Catch-22 1961, Beggar's Opera 1728, SNL 1975, Private Eye 1961.
- Candide as Menippean satire was not explicitly confirmed by search (Frye links it to Gulliver's anatomy tradition); the hedge 'often put' was kept.
- Comedy readers facet: shelving of comic novels and 'many are ordinary length or shorter' could not be checked by search; softened and left under confidence 'varies'. Satire shelving and defamation-law statements are likewise general and unchecked.
- Comedy of humours: Chapman's earlier play means Jonson did not invent the form; the text says only 'associated with'.
- Whether Murakami, Mo Yan, Grass and Bulgakov count as magical realism is argued by critics; each is hedged and the canon facet is marked contested.

### Audio drama and podcasts

- WebFetch could not reach hosts, so the only web source was WebSearch result summaries; no primary pages (BBC Genome, CBS logs, publisher pages) were read.
- The Dark Tower: broadcast day is given as 21 or 26 January 1946 by different pages, and I could not confirm it is wholly in verse (relabelled 'radio play'; text gives only 1946).
- Limetown first-episode date varies by source (21, 26 or 29 July or 2 August 2015); text says only 2015. The Facebook Watch series premiered 16 October 2019, so the writer's '2019' is right.
- Archive 81: one result gave 2019 for the podcast start; 2016 is better supported (Netflix Tudum and others) but no primary source settled it.
- Studs Terkel end year is 1997 per WFMT and Wikipedia but January 1998 per Britannica; Krulwich's start on Radiolab differs by page (text says only 'later with').
- 'Spot effects' usage differs between British studio practice (made live) and general sound-design usage; the glossary line now allows both.
- The speech-rate figure, slot lengths, episode lengths, content-note and transcript practice, the 'public-service broadcasters' statement, and the glossary definitions (diegetic, binaural, track, actuality, paper edit, room tone, right of reply) are general practice or common usage, not checked against a published glossary or sourced statistics.
- Characterisations (Homecoming told through conversations and calls, Alice Isn't Dead as horror, Radio Ballads as documentary-drama, S-Town likened to a novel) rest on memory plus a quick search.

### YA romance, early chapter books and fairy tales

- Web source was WebSearch summaries only; WebFetch could not resolve hosts (ENOTFOUND), so no page was read directly.
- Wildfire's exact launch year (1978 or 1979) is unsettled; the file now says only 'late 1970s'. Sweet Dreams ran to about 1995 or 1996, so the decline is now 'shrank through the 1990s'.
- Straparola's first volume is dated 1550 or 1551 by different sources; the text says both and the works[] year stays 1550 to match the library's 'c. 1550' record.
- The da Silva and Tehrani 2016 study is confirmed, but little published criticism turned up, so 'debated' rests mostly on general knowledge.
- Several dates were not returned by search and rest on solid knowledge plus agreement with the library: Encyclopedia Brown 1963, Nate the Great 1972, Hunger Games 2008, Calvino 1956, Perrault 1697, Propp 1928, Aarne 1910, Tolkien 1939, Wilde 1888, Olrik's law of three.
- Eleanor & Park and Anna and the French Kiss film status was only checked through about 2019, so the file says 'at least three' films.
- The claim that many of the Grimms' informants were educated and middle class is supported by a museum source (Grimmwelt) only.
- Page-count and word-count norms for early chapter books and the phonics-emphasis remark are rough, general statements.

### Existentialism, the Harlem Renaissance and the Beats

- Web source was WebSearch summaries only; WebFetch was not usable, so no primary page or work text was read.
- Esslin's 1961 contrast of Sartre and Camus (reasoned, traditional forms) with the absurdists is paraphrased from solid knowledge; search did not return the passage.
- Robbe-Grillet's late-1950s essay is confirmed as 1958 and anti-anthropomorphic, but that it names Sartre's Nausea was not confirmed; the specific 'nausea' example was dropped.
- Camus admiring Cain is repeated mainly by booksellers; the one scholarly source says the original attribution is missing, so the text now says only that Cain's Postman is often named as a model.
- Sartre's later criticism of the Humanism lecture is supported by the Stanford Encyclopedia (the one publication he openly regretted) but no dated quotation was seen.
- Black Arts Movement criticism of 1920s white patronage could not be confirmed and was removed in favour of a general statement.
- Nugent's Fire!! story is widely called the first Black-authored work on homosexuality; the text keeps only the weaker 'more openly than in earlier Black writing'. The 1935 Harlem riot as an end-marker and Hughes's Mulatto staged 1935 were not confirmed by search.
- Many dates were not individually searched and rest on solid knowledge: most Harlem and existentialist work years, Evergreen Review 1957, Big Table 1959, City Lights 1953 and Pocket Poets 1955, the Johnson, Jones and Carolyn Cassady memoir years, and death years.
- Memoirs of a Beatnik is dated 1969 (some sources say 1968, probably the writing date); Pull My Daisy is dated 1959 (one filmography says 1958).

### Western, adventure and war fiction

- WebFetch could not be used (hosts do not resolve), so search summaries were the only web source; several titles and dates rest on solid knowledge because a summary returned nothing for them (e.g. Cooper, Defoe, Swift and Scott dates, Hatchet, Campbell 1949, The Caine Mutiny 1951, Cold Mountain 1997, Mailer, Jones, Heller, Vonnegut, True Grit's narrator, Stagecoach 1939, Unforgiven 1992, The Wild Bunch 1969, Blood Meridian 1985).
- The Virginian as 'usually named the first major western novel' is disputed by scholars who cite earlier cowboy novels (e.g. Emma Ghent Curtis's The Administratrix, about 1889); the text already calls Wister a convention and the record is 'contested', so it was left.
- Master and Commander is dated 1969 (first US edition; British edition 1970), Matterhorn 2010 (a small-press edition appeared in 2009), The Coral Island 1857 (one Britannica biography says 1858), Around the World in Eighty Days is now 'serialised 1872' (book 1873, works field kept at 1872 to match the library), A Fistful of Dollars 1964 is the Italian release year.
- Interpretive claims (western as frontier nostalgia, The Red Badge of Courage as 'first modern war novel') are worded as critics' views and were not individually sourced.
- Market observations in the readers facets (shelving labels, series, strands of WWII historical fiction) cannot be verified; those records stay 'varies' with an asOf.

### Journalism, history writing and the business book

- Web source was WebSearch summaries only (WebFetch not used), not the works themselves.
- Literary Journalism Studies: the association (IALJS) is confirmed as founded in July 2006, but the journal's 2009 start is inferred from coverage and one article, with no source labelling issue 1. The text only says 'in the 2000s', which holds either way.
- Wolfe's third device is written as 'third-person point of view' (his own phrase, from recall). One secondary source quoted in search said 'multiple points of view'.
- Hume's History volume years differ by listing (1754 to 1762 kept). One museum catalogue gives Gibbon as 1776 to 1789 (1776 to 1788 kept).
- Fayol's Administration industrielle et generale is kept as 1916 (first appearance in a society bulletin; the stand-alone book is usually dated 1917). Search could not confirm the bulletin detail.
- Not returned by any search, so they rest on solid recall: Prescott 1843, Macaulay 1848, Shirer 1960, Schama 1989, Sobel 1995, Clark 2012, McCullough's three dates, Beard SPQR 2015, Taylor 1911, Carnegie 1936, Senge 1990, Built to Last 1994, Good to Great 2001, Schein 1985, Orwell 1933 and 1937, Jack London 1903, Reed 1919.
- Minimum viable product was coined earlier (Frank Robinson, 2001); the text says 'popularised by' Ries, which is defensible. The origin of 'pivot' was not searched.
- Treating Walsh, Garcia Marquez and Poniatowska as crónica writers rests on general usage, not a checked source.

### Fan fiction, webnovels and light novels

- Web source was WebSearch summaries only; WebFetch could not resolve hosts, so no primary pages were read.
- The per-turn search budget ran out part-way through the light-novel checks. Spice and Wolf (February 2006), Toradora (March 2006), Kono Light Novel ga Sugoi (2004), the Haruhi anime month and the Japanese industry terms (kuchi-e, atogaki, shinjin-sho, komikaraizu, media mix, label, light literature) rest on the checker's own knowledge.
- Platform start dates differ between sources and only the year is stated: Qidian (February or May 2002), Kakao Page (February or April 2013). Mo Dao Zu Shi start day (31 October 2015) could not be confirmed, so only 2015 is stated.
- Slash word origin (K/S) is fannish tradition per Fanlore, not documented. The file calls it 'the usual explanation'.
- Fifty Shades of Grey: the common account is that it began as Twilight fan fiction, but its publisher described it as original work.
- Kino's Journey was a Dengeki prize finalist, not a winner. The file now says it came through the prize route.
- Sword Art Online and the Dengeki prize page limit: sources disagree on whether it was turned down or never submitted. The wording now fits both.
- Golden finger was confirmed. Face-slapping (da lian), shuang, mentor-in-an-object and late-bloomer rest on widely used fan usage, not on a source.
- Legal remarks about fan fiction and the claim that most archives forbid selling stay deliberately general.

### Ode, elegy and villanelle

- Only the villanelle claims were checked by web search. The shared search budget ran out before the ode and elegy files, so their claims were checked from my own knowledge and softened where I was not sure. WebFetch could not resolve hosts, so search summaries were my only web source.
- Pindar's works year c. 470 BCE is only a midpoint of his datable odes (about 498 to 446 BCE), copied from the library record. Horace's fourth book is not dated in the text. The Jonson Cary and Morison ode is dated only 'around 1629', unverified.
- Auden's If I Could Tell You was written in 1940 and reportedly first printed in a magazine in early 1941, from one scholarly source. I removed it from the works list (canon keeps 5 works) and left it in the text as 'written 1940'.
- Henley's villanelle year, Roethke's The Waking (1953; an earlier magazine appearance was not ruled out) and the terzanelle's date and scheme are unconfirmed. Robinson's The House on the Hill is called an early American villanelle, not the first.
- Passerat's poem was printed in 1606 (confirmed), and one source says it was written in 1574. Scholars disagree about who fixed the nineteen-line pattern (eighteenth-century dictionary makers, an 1844 treatise, or Banville), so the text says they disagree.

### Ode, elegy and light novels (second check)

- Web source was search summaries only (WebFetch cannot resolve hosts); no page was read in full, and many summaries came from Wikipedia, Britannica and catalogue or retail pages rather than primary editions.
- ode.js: Pindar's works year 'c. 470 BCE' is only a midpoint of his datable odes (498 to 446 BCE, confirmed), kept to match the library's work record.
- ode.js: Tennyson's Wellington ode publication day is disputed (16, 17 or 18 Nov 1852); the text now says only 'in the week of' the funeral.
- ode.js: the Neruda tomato ode could not be confirmed in the 1954 volume by search, so only the onion (Britannica) is named.
- ode.js: 'regular Pindarics' for Gray means the triadic strophe/antistrophe/epode shape (confirmed); the Princeton Encyclopedia ref and the 'few dozen to a few hundred lines' range were not searched.
- elegy.js: Ovid's exile from 8 CE and the epicedium and threnody etymologies were not covered by search and rest on the checker's own knowledge; the Ruskin coinage year is 1854 or 1856 in different sources, so no year is stated.
- elegy.js: Auden's poem is confirmed as published in 1939 (New Republic); a London Mercury appearance was not confirmed. The name 'elegiac stanza' follows handbook usage and handbooks differ.
- light-novel.js: atogaki, shinjin-sho and the kuchi-e usage for light novels are standard Japanese terms checked from knowledge; the search returned no page defining them for light novels.
- light-novel.js: raito bungei was confirmed only as an existing, blurry category, so the claims about its imprints and readers were removed. One source gives June 2006 for Spice and Wolf against 10 Feb 2006 in the Wikipedia volume list; the text states only 2006.
- light-novel.js: the Nifty-Serve origin of the term 'light novel' rests on one source naming Kamikita Keita and 'around 1990'. Re:Zero's works year 2012 is its web start (library convention); print was 2014.

## Second checks of the last eight batches

The eight batches of the last group (comedy, satire and magical realism; audio drama and podcasts; YA romance, early chapter books and fairy tales; existentialism, the Harlem Renaissance and the Beats; western, adventure and war fiction; journalism, history writing and the business book; fan fiction, webnovels and light novels; ode, elegy and villanelle) had each been through one check with search. Each was checked again by a fresh checker that had neither written nor checked it, working on a copy. The reports are the `*-recheck.json` files here; the edits were installed after the lint, the profile check and the library tests passed on the installed files.

| Batch | Subjects | Claims checked | Corrected | Softened | Removed | Searched |
| --- | --- | --- | --- | --- | --- | --- |
| Comedy, satire and magical realism | comedy, satire, magical-realism | 258 | 4 | 5 | 0 | satire and magical realism; comedy from recall |
| Audio drama and podcasts | radio-drama, fiction-podcast, nonfiction-podcast | 77 | 0 | 9 | 0 | radio drama only |
| YA romance, early chapter books and fairy tales | ya-romance, early-chapter-book, fairy-tale | 96 | 2 | 3 | 0 | yes, except the last fairy-tale items |
| Existentialism, the Harlem Renaissance and the Beats | existentialism, harlem-renaissance, beat-generation | 386 | 2 | 5 | 0 | yes, except some Beat items |
| Western, adventure and war fiction | western, adventure-fiction, war-fiction | 186 | 3 | 4 | 0 | yes, except some titles |
| Journalism, history writing and the business book | literary-journalism, narrative-history, business-book | 232 | 1 | 5 | 0 | yes, except some titles and dates |
| Fan fiction, webnovels and light novels | fan-fiction, webnovel, light-novel | 82 | 2 | 6 | 0 | yes, except some light-novel dates |
| Ode, elegy and villanelle | ode, elegy, villanelle | 151 | 1 | 5 | 0 | ode only |

1,468 claims were looked at, 15 corrected and 42 softened. Twenty-one of the 24 files changed; existentialism, literary journalism and the elegy file did not. "Confirmed" in a report means a search summary or the checker's solid knowledge agreed, and each report says which. The shared web-search allowance ran out in every one of the eight runs, so this second check is itself partly from recall, and the files that were not searched this time (the two podcast files, the comedy file, the elegy and villanelle files) say so. A few corrections were real errors (verse satire called "rhymed", the origin of the phrase 'lost generation' worded more firmly than sources allow, the Chicago Renaissance given an earlier start than sources do); most are softenings of a date or a wording that was more exact than the sources.

The checker also found that the library's genre entry for the elegy gave the year of Lycidas as 1637 (when it was written) where every other record, and the first-publication convention, give 1638; that entry now says 1638.

### What the second checkers could not confirm

- Web source was search summaries only; WebFetch to Wikipedia failed (the host does not resolve), so no page was read in full.
- `library-profile-check.mjs --staging` cannot print OK on a copy of a profile that is already installed (it reports the duplicate ids and nothing else), so each checker ran the same lint and the same one-question-per-facet check with the installed copies out of the way. The check was run again on the installed files afterwards and prints OK for all of them.
- Comedy, satire and magical realism: Roh's first use (1923) found no source, so the text keeps "the usual first use"; Uslar Pietri's coinage is "usually 1948, sometimes 1947"; Erasmus 1511 (the first printing; 1509 is the writing date) and Fortress Besieged 1947 rest on knowledge; whether Murakami, Mo Yan, Grass, Bulgakov and Morrison are magical realists is argued by critics and hedged; the readers facets (shelving, length) are general practice marked 'varies'.
- Audio drama and podcasts: Archive 81 (2016 start and the credit), Wolf 359's 2014 start and the Magnus Archives figures rest on knowledge (the end year of Wolf 359 and the founding year of Night Vale Presents were dropped); the Third Programme's opening date was not re-searched; the Dark Tower broadcast day differs by source, so only 1946 is given.
- YA romance, early chapter books and fairy tales: the length ranges and page norms are trade guidance with no published source; at least three of the listed YA romances were filmed (confirmed), but none of the others was found to be; the Wildfire line's launch year is unsettled (late 1970s); Lang, Jacobs, Cox's 345 Cinderella variants, Aarne 1910, Propp 1928, Tolkien 1939, Calvino 1956, Wilde 1888 and Carter 1979 rest on knowledge.
- Existentialism, the Harlem Renaissance and the Beats: The Words (Les Mots) is 1963 or 1964 depending on source (1964 kept); Camus's own words about Cain were not found (the text says only 'often named as a model'); Pull My Daisy 1959, the 1958 coinage of 'beatnik', Big Table, the Naked Lunch dates and trial, Naropa and Sterling Brown's Southern Road (1932) rest on knowledge; Plum Bun is now 'late 1920s' (sources split 1928 and 1929) and Memoirs of a Beatnik 'late 1960s' (1968 or 1969).
- Western, adventure and war fiction: no source uses 'first modern war novel' for The Red Badge of Courage (the text says 'often called'); The Coral Island is 1857, one biography says 1858; the Le Temps serial detail for Around the World in Eighty Days is 1872 or 1873 in different sources; Cooper's dates, The Ox-Bow Incident, Shane, Stagecoach, The Caine Mutiny, Das Boot, Corelli's Mandolin, Cold Mountain, Birdsong, Regeneration, Starship Troopers and The Forever War rest on knowledge; market remarks stay 'varies'.
- Journalism, history writing and the business book: Sims being credited with giving 'literary journalism' currency is disputed by one critic; Wolfe's second and third devices are worded differently by different sources (his own 1974 phrase is kept); Fayol's book edition (1917, 1925 and 1931 all appear) and Drucker's 'knowledge worker' (1959 or 1969) are left undated; Steffens 1904, Blue Ocean 2005, Getting to Yes 1981, Macaulay, Carlyle and Foote rest on recall.
- Fan fiction, webnovels and light novels: Fujimi Fantasia Bunko ('late 1980s'), Kono Light Novel ga Sugoi ('mid-2000s'), Kino's Journey 2000, Haruhi Suzumiya 2003 and its 2006 anime, Spice and Wolf and Toradora! (2006) and Vampire Hunter D (1983) were not searched; Qidian's October 2003 month rests on one source; the slash-from-K/S origin is fan tradition; the Japanese industry terms have no source that defines them for light novels; Sword Art Online and the prize page limit are described as 'reportedly'.
- Ode, elegy and villanelle: only ode.js was searched this time; elegy.js is from knowledge and the villanelle claims rest on the earlier check's search. Pindar's works year is a midpoint kept to match the library; no source calls Dryden's Alexander's Feast 'irregular'; Shelley's 1820 and the placement of Neruda's onion ode in the 1954 volume rest on knowledge; Roethke's The Waking (1953) may have appeared earlier in a magazine; Auden's If I Could Tell You stays 'written 1940'; Passerat's dates, Gosse 1877, Banville 1872, Thomas 1947 and 1951, Plath 1953 and Turco's credit for the terzanelle were not re-run. A later pass with working search should confirm the elegy and villanelle titles and years.

## Checking the works lists against the web (first round)

Everything outside the whole-subject profiles (the genre, form, movement and tradition entries with their `works` lists, and the work records) had been through the lint, the year cross-check and a 220-claim spot-check, but no title, author or year had been checked against the web. This round is the first of a longer one. `scripts/library-verify-queue.mjs` lists the works still unchecked and prepares the next batch; `works-ledger.json` here records what has been confirmed, so a later round starts where this one stopped.

Of 5,860 distinct works (title and author) the library lists, 670 appear in a searched profile, 71 more now have a result in the ledger (68 of the 72 searched were confirmed, 4 differ as described below, and one of the 72 was already in a profile), and 5,119 are not yet checked against the web. This round took 192 works: 96 of the most-referenced ones and 96 drawn at random from the rest (so the random part says something about the unchecked remainder). The shared web-search allowance ran out for most of the eight checkers, so only 74 of the 192 were searched (72 resolved, 2 left unsure); the other 118 are not marked as checked and go back in the queue.

| Part | Works taken | Searched | Confirmed | Differs | Not searched |
| --- | --- | --- | --- | --- | --- |
| Most-referenced | 96 | 49 | 46 | 3 (year) | 47 |
| Random sample | 96 | 23 | 22 | 1 (author) | 73 |

What the differences were. None was a wrong author or a wrong year in the sense of a mistake, but they show what a year in this library means:
- Macbeth (1606) and Romeo and Juliet (about 1595) are dated by performance or composition, not by first printing (1623 and 1597). Great Expectations (1861) is dated by its book edition; the serial began in December 1860.
- Heimskringla is attributed to Snorri Sturluson by scholars; the record already says "traditional attribution".
- The same pattern turned up in unsearched items the checkers flagged from memory (The War of the Worlds and Uncle Tom's Cabin are dated by the book, Dorian Gray by the magazine), so the library mixes serial, book and performance dates. The library README now says so instead of claiming every year is a first publication.
- One real error: the Armah novel's title was spelled "The Beautiful Ones Are Not Yet Born" in its work record, while the novel is "The Beautyful Ones Are Not Yet Born" (and the library's own movement entry already had it right). The record now has the right title and keeps the common misspelling as a search word.

What this does and does not show. 68 of 72 searched works were confirmed with no wrong author or year, which is encouraging, but 72 is a small share of 5,860 and was chosen partly by how often a work is referenced, so it is not an error rate for the library. The random part is 22 confirmed of 23 searched, which is the only part that can be read as a sample, and it is too small for a rate. "Confirmed" means a search result (an encyclopedia summary, a library, publisher or retailer page) showed the author and a consistent year; it does not mean a primary source was read. Several confirmed items carry a caveat in `works-ledger.json` (a serial earlier than the book, a revised edition, a translation with a different year).

### Second round

Round two took the 120 works that went unsearched in round one and then more, 144 in all (72 of the most-referenced and 72 drawn at random), and every one was searched, one search each, none refused (the checkers ran their searches one at a time this time).

| Part | Works taken | Confirmed | Differs | Unsure |
| --- | --- | --- | --- | --- |
| Most-referenced | 72 | 71 | 1 (year) | 0 |
| Random sample | 72 | 66 | 5 (year) | 1 |

The six that differ are again about which date a year stands for, not wrong dates: The Seasons (the library gives the first complete edition, 1730; the parts began in 1726), David Copperfield (book 1850, serial from May 1849), Clarissa (completion 1748; publication began in November 1747), She (book 1887; serial from October 1886), Rich Man, Poor Man (1969 by copyright and one bestseller database, 1970 in library catalogues; search did not settle it and the library keeps 1969) and The Tale of Hong Gildong (date and author both disputed; the record is already marked contested). The one unsure item is the Johnson edition of Dickinson's poems: the edition is confirmed, no result showed the year. The only change to the library from this round: the four records of Everyman gave "c. 1500", "c. 1500 CE" and "c. 1510"; all now say "c. 1510" (the date of the earliest print; composition is put between the 1490s and about 1518). Four records have no year at all (Hikayat Hang Tuah, Farewell My Concubine, the Visuddhimagga, Chunhyangga); the checkers found dates only as ranges or estimates, so none was added.

Both rounds together: 218 works searched (205 confirmed, 9 differing in what the date means, 1 attribution, 3 left unsure and kept in the queue), and 4,976 of the 5,860 distinct works are still not checked against the web. Of the 96 works drawn at random that were searched, 88 were confirmed outright, 6 differed only in what the date means or in a disputed attribution, 2 could not be settled, and none had an author that search contradicted or was a work that could not be found. For those kinds of error (author, year, whether the work exists) that points to a low rate in the unchecked remainder, probably under about 3 percent at the usual confidence, if the 96 are representative. This check cannot see anything else in a record: the summaries of the work records, their genres and any plot claim were not examined, so this is not a statement that the work records are correct.

### Third round

Round three took 72 works: the 36 most-referenced ones still unchecked and 36 drawn at random from the rest (a fixed seed, so the same ledger gives the same draw). One person ran every search, one query per work, and two works (Marinero en tierra, Khamsa) needed a second query because the first summary did not settle the year. Nothing was refused. A result counts only for what its summaries said; where the summaries disagreed or said nothing, the ledger says so.

| Part | Works taken | Confirmed | Differs | Unsure |
| --- | --- | --- | --- | --- |
| Most-referenced | 36 | 34 | 2 (year) | 0 |
| Random sample | 36 | 34 | 2 (year) | 0 |

The four that differ are again about which date a year stands for: Cranford (the library gives the 1853 book; the serial began in December 1851), Martin Eden (the 1909 book; the serial began in September 1908), Endgame (1957 is the French original and its first production, Fin de partie; Beckett's English text is dated 1958), and Pearl (the library says c. 1400, the sources say late 14th century, one proposal early 1390s). Other things the summaries showed that the ledger keeps as notes: Don Juan's 1819 is the year publication began (the last cantos came in 1824 and it is unfinished); The Second Shepherds' Play and Sin Xay have no year in the library and sources only offer ranges (later 15th century; about 1600); The Analects, Doctor Faustus, the Khamsa and The Georgics are dated by ranges, not a single year, so the library's circa is right; The Scholars' c. 1750 is when it was written, it was first printed in 1768-69; Upstairs, Downstairs lists Marsh and Atkins as creators and the sources add Hawkesworth and Whitney; Join, or Die is probably, not certainly, Franklin's own drawing; two sources were set aside because other sources contradict them (one site gave 1828 for Ghalib's first printed divan, one machine-written encyclopedia gave November for the first night of The Wedding). Marinero en tierra is 1925 in a library catalogue and 1924 in a dealer's listing. No author was wrong and every work was found. The library itself was not changed by this round.

Three rounds together: 290 works have a result in the ledger (273 confirmed, 13 differing in what the date means, 1 attribution, 3 left unsure and kept in the queue), and 4,904 of the 5,860 distinct works are still not checked against the web. Of the 132 works drawn at random that were searched in the three rounds, 122 were confirmed outright, 8 differed only in what the date means or in a disputed attribution, 2 could not be settled, and none had an author that search contradicted or was a work that could not be found. For those kinds of error (author, year, whether the work exists) that points to a low rate in the unchecked remainder, probably under about 2.3 percent at the usual confidence (three divided by 132, nothing contradicted), if the 132 are representative; each round's random part is drawn from what was still unchecked at the time, so the three draws are not independent samples of one pool, and this is an estimate, not a guarantee. Everything the earlier rounds said the check cannot see still applies: a summary of a search is not a primary source, and the summaries of the work records, their genres and any plot claim were not examined.
