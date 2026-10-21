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
