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
