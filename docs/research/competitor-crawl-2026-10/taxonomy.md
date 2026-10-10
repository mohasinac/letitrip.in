# Taxonomy — the forest, the brands, and what each axis became

## The constraint that decides everything

`ProductDocument.categorySlugs` holds **one chain per product**, and
`categoriesIn` is applied as `array-contains-any`, which Firestore caps at
**30 values**. `[self, ...allDescendants]` on even a 47-node tree is 48 →
`INVALID_ARGUMENT` → and every caller wraps the query in `.catch(() => null)`,
so the root category page renders **blank with no error anywhere**
(Root Cause #59).

So a combinatorial tree is unavailable, full stop. Each product gets exactly
one chain, and everything orthogonal to that chain is a **feature**, not a
node. worldhobbyshop — the only competitor with a real tree — uses our axis.

## Where each crawled axis went

| Crawled axis | Destination | Why |
|---|---|---|
| generation → part-family → line → **named model** | **THE TREE** | One chain per product; matches WHS |
| accessory / part-type | **THE TREE** | raikages makes part-type its entire top level; real volume per node |
| TCG game → set | **THE TREE** | A card is in exactly one set, and it is what a buyer searches |
| Hot Wheels line (Mainline/Premium/RLC) | **THE TREE** | How collectors shop; what TCI's collections encode |
| release type | `release` features **+ a priceGuidance multiplier** | Orthogonal, but Limited medians 1.8× Regular |
| condition / packaging | `condition` features | 57 "Without Box" rows at ⅓ the boxed median |
| **midfake / repro** | 🛑 the `authenticity` **field** (+ matching feature) | Not a brand, not a category — see below |
| character / lineage | `groupedListings`, `groupTheme` | A character crosses every generation; a node would break the single-chain invariant |
| Latest / Best Sellers / Under ₹1000 / Clearance | existing facets + sorts | Categories for these is the ten-enumerations shape (Root Cause #61) |
| Auction / Pre-Order / Sold | existing `listingType` + availability tabs | Already built |
| TCG language · format | features (+ a tier-2 sealed/singles split) | Price bands differ ~20× |
| TCG PSA grade | `sublisting` + `itemCode` | Our schema literally gives `"PSA 10"` as the example `itemCode` |
| diecast scale | **features** | Hot Wheels mainline is essentially all 1:64, so scale stops being a tree axis entirely |
| Treasure Hunt / Super TH | `chase` features | A THT is a chase variant *of* a mainline casting |
| long-tail tag stuffing (RedEye: 50–160/product) | 🛑 **rejected** | 162 products on one tag is a thin-content signal; `tags` is an index we pay for and it inflates `searchTxt` against a 600-token cap |

## The forest — 6 roots, 4–5 tiers, ~330 nodes

🛑 **Never quote a node count you have not run `buildCategoryTree` against.**

```
category-spinning-tops
├─ beyblade-original → original-tops      [3-layer · spin-gear-sf · magna-core · g-rev-eg · hms]
│                      original-parts     [attack-rings · weight-disks · blade-bases]
│                      original-launchers [ripcord · winder]
│                      original-stadiums  [bakuten-arena · attack-stadium]
├─ beyblade-metal    → metal-tops         [phws · fusion · masters · fury-4d · shogun-steel]
│                      metal-parts        [face-bolts · energy-rings · fusion-wheels
│                                          · spin-tracks · performance-tips]
│                      metal-launchers    [string · ripcord · lr]
│                      metal-stadiums     [bb-10-attack · super-vortex · zero-g]
├─ beyblade-burst    → burst-tops         [burst · god · cho-z · gt · superking · db · bu]
│                      burst-parts        [layers · discs · drivers · chips-armour]
│                      burst-launchers    [string · lr · grips]
│                      burst-stadiums     [standard · beystadium-variants]
├─ beyblade-x        → x-tops             [basic-s1 · unique-ux · custom-cx · x-over]
│                      x-parts            [blades · ratchets · bits]
│                      x-launchers        [string · winders · grips]
│                      x-stadiums         [xtreme-bx-10 · standard-bx]
└─ accessories       → storage-cases · tool-kits · counters-beypointers · sticker-sheets
        ↳ tier-4 under each line: NAMED MODELS — lost-longinus, storm-pegasus, dran-sword …

category-trading-cards → pokemon-tcg [singles · sealed · graded] · one-piece-tcg [same]
                         · other-tcg [weiss-schwarz · dragon-ball · yu-gi-oh · digimon
                                      · union-arena · gundam-tcg · hololive]
                         · card-supplies [sleeves-toploaders · binders-boxes · slab-display]
        ↳ tier-3 under each game: EXPANSION SETS (destined-rivals, op-16, prb-02 …)

category-collectible-figures → anime-figures [1/12 · 1/7-1/8 · 1/6 · prize · nendoroid-chibi]
                         · comic-figures [marvel-legends · dc · vintage-toybiz]
                         · game-figures [pokemon · one-piece · vocaloid]
                         · figure-accessories [stands-cases · posters-prints]

category-hot-wheels      → hw-mainline   [by-series · treasure-hunt-eligible]
                         · hw-premium    [car-culture · boulevard · team-transport
                                          · fast-and-furious · pop-culture]
                         · hw-rlc        (Red Line Club — members-only releases)
                         · hw-multipacks [gift-packs · 5-packs · 10-packs]
                         · hw-track-accessories

category-model-kits      → gundam-kits · pokemon-kits · tool-kits

category-living-collectibles — unchanged, 8 nodes
```

### 🛑 Stadiums belong to their generation, not to a gear bucket

The existing seed has `category-battle-gear → gear-stadiums` holding every
stadium. That came from **our own seed**, not from the crawl, and it is wrong
for the same reason launchers and parts are per-generation: **a stadium is
generation-specific.** A BX-10 Xtreme is a Beyblade X product; a BB-10 Attack
Type is Metal Fight; a Burst Beystadium is neither. One bucket forces a buyer
shopping Beyblade X to filter a list that is mostly not for their beys.

The crawl agrees in prose while being structurally unable to express it:
worldhobbyshop's single "Stadiums & Arenas" category describes itself as *"from
all generations of Beyblade! Be it Plastic Gen / Old School, Metal
Fusion/Master/Fury or the Beyblade Burst"* — the generation split stated in the
body copy because the platform's flat taxonomy could not hold it. **That is the
fourth time in this crawl a competitor's platform forced a conflation we should
not copy.**

What stays cross-generation is the genuinely universal gear: storage cases,
tool kits, counters/Beypointers, blank sticker sheets. A case holds any bey.
That is `category-accessories` (renamed from `battle-gear` — the node's own
description already said "accessories"), and it is deliberately small.

### A named model is a plain category leaf — zero new schema

```
spinning-tops › beyblade-burst › burst-tops › burst-dual-layer › category-lost-longinus
                                                                 ^^^^ sellers list under this
```

`deriveTaxonomy` resolves the leaf **by doc id with no `categoryType` filter**,
so a listing filed under it automatically gets the full chain plus
`categoryNames`, on create and update, through all ~14 write paths. Counters
roll up, the sitemap includes it, the detail page gives it highlights, FAQs,
SEO, cover and OG image, and the grid matches `array-contains` of **one id** —
so depth costs nothing.

🛑 **Do NOT use `categoryType: "sublisting"` for this.** Its two seeded rows
*are* literally named models (*Dranzer S (A-5)*, *Storm Pegasus 105RF*), which
is the trap — the discriminator opts out of every path that works:

| | Plain category | `categoryType: "sublisting"` |
|---|---|---|
| `deriveTaxonomy` derives the chain | ✅ | ❌ never reads `sublistingCategoryId` |
| `countersReconcile` tallies it | ✅ | ❌ `productCount` permanently 0 — the page says "Browse all 0 listings" |
| In the sitemap | ✅ | ❌ explicitly excluded by `NON_LISTING_CATEGORY_TYPES` |
| Highlights / FAQs / SEO / OG | ✅ | partial |

Keep `sublisting` as the **grading/variant** axis (`"PSA 10"`, `"105RF"`),
which is what `itemCode` was for. Zero seeded products link to either
sublisting row, so none of that path has ever run with data.

### A named-model leaf holds EVERY listing type for that model

"Dragoon G stickers" belongs under `category-dragoon-g`, sibling to the bey —
same for spare parts, an art print, or a used one sold as a classified.
`listingType` and `categorySlugs` are independent axes, so the sheet is
`listingType: "stickers"` *and* on the Dragoon G leaf, appearing in both the
leaf page and the cross-cutting `/art` browse.

Relatedness then costs nothing: the bey, its stickers and its parts are
literally the same `array-contains` query, with no heuristic. BAS runs two
sticker collections, hobson a third, raikages sells parts per model — all flat
approximations of exactly this.

🛑 **Cost: scope `priceGuidance` by `listingType` within the leaf**, or a ₹399
sheet and a ₹1,299 bey blend into a meaningless band.

## Local corpus — measured field coverage

`linka/beys/**/*.md`, 334 documents, read as **UTF-8 in Node** (PowerShell
mangles the encoding).

| Field | Coverage | Usable as-is? |
|---|---|---|
| `Type` | **334 / 334 (100%)** | ❌ needs normalising |
| `Spin Direction` | 324 (97%) | ❌ 54 spellings of 3 concepts |
| `System` | 297 (89%) | ✅ light cleanup |
| `Generation` | 291 (87%) | ✅ |
| `Product Code` | 278 (83%) | ❌ markdown + annotations leak in |
| `Series` | 265 (79%) | ✅ |
| `Owner (Anime)` | 236 (71%) | ✅ → `groupTheme: "character"` |
| `Succeeded by` | 137 (41%) | ✅ **136 lineage edges** → `groupTheme: "lineage"` |
| `First Appearance` | 38 (11%) | leave unset |
| `Weight` | **4 (1%)** | ✖ take weights from `case study/` instead |

### The era tree, independently validated — and it corrects ours

```
gen1/plastic  94     gen2/mfb    54     gen3/burst    10     gen4/bx  33
gen1/hms      29     gen2/zerog  13     gen3/god      11
                                        gen3/choz     17
game-original 14  🛑 EXCLUDE            gen3/gt       14
                                        gen3/superking 11
320 real catalog candidates             gen3/db       21
                                        gen3/bu       13
```

Our tree had `burst-single-layer` and `burst-dual-layer` as two leaves; this
corpus **and** worldhobbyshop's own price bands treat the early Burst era as
one. Adopt the corpus's granularity — it is the one an independent source and
a competitor's merchandising agree on.

**The 14 `game-original` documents are the user's own game inventions and must
never reach the marketplace catalog.** They live in their own directory, so the
filter is a **path test, not a heuristic**.

### 🛑 Three mandatory normalisers

Skipping any of these reproduces Root Cause #33: a filter value that is not a
stored value returns zero rows, silently, forever.

1. **`Type` → the 4-value enum.** Clean values cover 235 docs (Attack 99,
   Balance 60, Defense 43, Stamina 33) plus `Endurance` 5 → Stamina. The
   remaining ~90 are one-off freeform strings: `"Attack (Hammer variant —
   heavy slow-smash)"`, `"Balance (per Fandom canonical; not pure Attack as I
   previously assumed)"`, `"Defense (mislabeled as Balance Type on some product
   packaging; confirmed Defense Type per BeybladeBattles.com…)"`. **Take the
   leading enum word as the feature; keep the parenthetical as prose, never as
   a value.** A feature slugged `feature-attack-hammer-variant-heavy-slow-smash`
   is a vocabulary that has already failed.
2. **`Spin` → `right | left | dual`.** 54 spellings: `Right` 204,
   `Right-Spin` 20, `RIGHT` 5, `Dual-Spin (HMS standard)` 18,
   `**Dual-Spin** ⭐` 8, `LEFT` 6, `Left` 8, plus one-offs like
   `"Right (normal) — REVERSES to Left mid-battle (gimmick)"`.
3. **`Product Code` → bare code.** Values arrive as `**BBG-23** (Takara Tomy)`,
   `BX-36 (TT, September 14, 2024)`, `MA-21 (Takara) / TAK14371`. 264
   distinct. Strip markdown, split on `/`, keep the parenthetical as the
   marque + date.

🛑 **Rows that self-flag go to the review list, not the seed.** The corpus
carries its own uncertainty markers — `"[VERIFY — likely left-spin to mirror
Dynamite Belial's right-spin]"`, `"(presumed)"`, `"Unknown — anime-exclusive;
not sold at retail"`. An anime-exclusive bey never sold at retail is **not a
catalog leaf** and must be filtered out, not seeded with a guess.

### The part glossary — from `case study/`

1,920 parseable `## Case N — Part Name (X.X g)` headers; 89 carry a confirmed
weight. Names carry the code after a slash: `Wing 105 Track / W105`,
`R²F Bottom / Right Rubber Flat`, `Boost Disk 145 / BD145`,
`Switch Attack 165 / SA165`.

Classifications present: Performance Tip 49, Bottom 23, Chrome Wheel 19, SG 16,
Disc 13, Track/Spin Track 22, Crystal Wheel 10, Layer 8, Fusion Wheel 7,
Blade Base 5, Blade 5, Attack Ring 5, Energy Ring 4, Bit 4, Metal Wheel 3,
Launcher 3, Grip 3, Weight Disk 2.

🛑 **Key on `(classification, code)`, never code alone.** `105` is an MFB
spin-track height; a bare number in Burst is a disc; `1-60` is a Beyblade X
ratchet. Getting this wrong explains a Burst disc as a spin track.

### What the local corpus does NOT give

The **Takara Tomy ↔ Hasbro alias map** (`NAME_CONFLICTS.md` has exactly **2**
real pairs, and the declared `[Hasbro: xyz]` convention is used **twice**, one
of which is the literal placeholder `xyz`); JP/romaji names; and retail *set*
names as opposed to part names. Those three come from the Fandom API
(`api.php` returns 200 with a plain User-Agent; the HTML is **403**).

🛑 **Facts only.** Fandom is CC-BY-SA: take names, codes, types, weights,
dates, legality — facts are not copyrightable — and **write our own prose**
through the category description templates. raikages is the cautionary example
of doing it badly: 114-char bodies lifted verbatim from the Wiki including
Japanese name and romaji, one of which ends **"Add to Wishlist Add to
Wishlist"** — a UI string scraped into a product body.

## Brands — manufacturers, publishers, collector lines

🛑 worldhobbyshop's Brand attribute contains two **non**-brands:
"Midfake/Repro" (an authenticity class) and "Generic" (the *absence* of a
brand). Both are there because WooCommerce offered one axis. Excluded.

### Beyblade — TWO entities, not three

| Row | Evidence |
|---|---|
| **Takara** | Pre-2006, the original Plastic-Gen maker. beybladeshopindia's Brand field is literally `Takara` on **2,011** products; WHS's plastic-gen copy says *"genuine **Takara** launchers"* while later generations say Takara Tomy. The local corpus independently confirms it — Gen-1 codes carry `(Takara)` (`A-104`, `MA-09`, `MA-21`) while BX-era codes carry `(TT)` |
| **Takara Tomy** | The 2006 merger. n=1,060 WHS · 2,873 BAS · 425 RedEye |
| Hasbro | Western licensee. n=15 WHS, 189 mentions |
| Sonokong (KR) · Funskool (IN) · Young Toys (KR) · NewBoy (ME) · Beys&Bricks | Regional licensees, n=9–10 each |

🛑 **No standalone `Tomy` row.** An earlier draft proposed one. Tomy's own role
in the Beyblade line before the merger is **not established by any source we
hold** — zero occurrences of a `Tomy`-only brand value across all fifteen
commercial crawls, and the local corpus never attributes a product code to
Tomy alone. A brand row with no product that belongs to it is a dead facet,
and worse: `BrandDetailPageView` filters on **display name**, so an empty brand
row is an empty page that still appears in the brands grid.

🛑 **Do not rename `Takara-Tomy`.** `BrandDetailPageView` filters
`sieveFilter("brand", EQ, brandName)` on display name — renaming silently
orphans the whole catalogue. Keep ours and note the discrepancy in a comment.

### TCG publishers

| Row | Publishes |
|---|---|
| The Pokémon Company | Pokémon TCG (Japanese) |
| Wizards of the Coast | Pokémon TCG (English, historically), Magic |
| Nintendo / Creatures Inc. | Pokémon co-owners |
| Bandai | One Piece TCG, Digimon, Gundam Card Game — same row as the figure maker |
| Konami | Yu-Gi-Oh |
| Bushiroad | Weiss Schwarz, Union Arena |

### Figure makers (tag counts)

Banpresto 398 · Bandai + Bandai Spirits + Tamashii Nations 88 ·
Max Factory/Figma 52 · Toy Biz 50 · Mafex 28 + Medicom 12 · Mattel 29 ·
Good Smile/Nendoroid 17 · McFarlane 16 · MegaHouse 16 · Furyu 14 · Taito 11 ·
Hot Toys 11 · Mezco 7 · Beast Kingdom 6 · Sega 6 · Q Posket 4 · NECA 3 ·
Storm Collectibles · Diamond Select · InArt · threezero · Sideshow · Funko

### Diecast — `brand-hot-wheels` only

One row (Mattel's *line*, matching the precedent our existing `brand-beyblade`
row already sets). **Deliberately out of scope**: Matchbox, Tomica, Majorette,
Mini GT, Inno64, Para64, Tarmac Works, M2 Machines, Johnny Lightning, Auto
World, Racing Champions, Greenlight, Maisto, Bburago, Kyosho, Jada, Solido,
Pop Race, Rastar, Centy, CCA. Their crawl data stays here so re-adding one is
a seed change, not another crawl.

**Other**: LEGO · Blokees · Keeppley · Pop Mart · Kakawow

**≈29 brand rows**, up from 4 — 8 Beyblade, 6 TCG publishers, ~14 figure
makers, 1 diecast, plus LEGO.

### 🛑 Brand logos — two traps

**Trap 1 — `display.icon` beats `display.coverImage`.** `BrandsSection` reads
`brand.display?.icon` first. The current seed uses `icon` for **emoji**
(`"🔥"`, `"🐴"`), so an emoji left there **wins over a real logo** in
`coverImage`. Every brand row seeded with a logo must either set `icon` to the
logo or leave it unset.

**Trap 2 — do not reach for `seedExtMedia()`.** It returns
`/api/media/ext?url=…`, which is **persisted into Firestore** and costs one
lambda + a third-party fetch + a full sharp decode/watermark/encode **per
image per render**. That is Root Cause #104 verbatim: ~400 such rows took the
homepage to 160 proxied images and 52.52 GB of Fast Origin Transfer against a
10 GB cap, and the fix cut sitewide proxied images to **6**. Twenty-nine logos
on a homepage brands strip would reintroduce it on the resource we are most
over on.

🛑 And `audit-media-proxy-hosts` would **not** catch it: its two rules flag six
literal placeholder hostnames and `MEDIA_ENDPOINTS.EXT_URL(` outside five
allowed files. A `seedExtMedia(...)` call from a seed file matches neither.
This is a discipline requirement, not an enforced one.

**The compliant pattern: commit the files.** `public/images/brands/<slug>.svg`,
seeded as `display.coverImage: "/images/brands/<slug>.svg"`. Three things
already make it work: `resolveMediaUrl` passes a plain `/images/…` path through
untouched, `next.config.js` already serves `/images/:path*` with
`public, max-age=31536000, immutable`, and `media.ts`'s own header reserves
`seedExtMedia` for "a GENUINELY external seed asset", which 29 self-hosted
logos are not.

## 🛑 Scaling prerequisites — all six closed in Phase A

Recorded because the numbers are the justification for starting at ~330 nodes
rather than four figures.

| Limit | Was | Now |
|---|---|---|
| `onCategoryWrite.shiftPositions` unbounded range read + write per row, per create | **28,853 writes** to build 330 nodes, against 20K/day | 330, via an "already positioned" guard |
| `CATEGORY_SEARCH_SCAN_LIMIT = 100`, capped by `maxPageSize` | "Lost Longinus" unfindable in every picker | `searchTxt` push-down; lineage indexed |
| `/api/categories` never read `page` | admin list stuck at 50 of 58; catalogue pickers empty | `?page=` returns an envelope |
| `useCategoryTree` missing `&flat=true` | facet offered 11 options, 9 not categories | 47, 0 leaked |
| `CategoryDetailPageView` triple-read | 118 reads on the largest root; 2,250 projected at 1,500 nodes | 79 / 810; store queries 26 → 4 |
| `buildCategoryTree` O(n²) | 2.25M comparisons at 1,500 | one indexing pass, output verified identical |
