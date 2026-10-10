# bladekingbeys.com — crawled on purpose

A counterfeit seller, crawled deliberately. 1,277 products, median **₹419**,
interquartile range **₹100**, `on_sale: false` on all 1,277 — **the low price
is the pitch**, not a promotion. 44.5% out of stock. Categories are organised
by **which launcher is bundled**, which is the whole merchandising logic.

## 🛑 The headline finding: they make no authenticity claim at all

Not even a false one. Case-insensitive across every title and description:

| Term | Occurrences in 1,277 products |
|---|---|
| `original` · `Takara` · `Tomy` · `authentic` · `genuine` | **0 each** |
| `replica` · `copy` · `fake` · `midfake` · `1:1` | **0 each** |
| `quality` · `premium` · `grade` · `Hasbro` | **0 each** |
| `Beyblade` | **3** |

**The strategy is to be their own brand.** 1,247 of 1,277 titles (97.7%) begin
`BLADEKING BEYS`, and the About page frames them as *"a popular brand in the
Beyblade community"* with *"custom parts or upgraded components"*, *"limited
edition models"*, *"modular customization"* — explicitly *"like many other
**aftermarket brands** in the Beyblade world"*.

🛑 **So "aftermarket" and "custom" are the words our buyers will be sold, not
"fake" or "replica".** The authenticity UI and the spot-a-fake guide must
answer *that* framing specifically. A tier list offering only
original/reproduction/fake does not help a buyer who was told "upgraded
aftermarket".

## The detection signals, ranked by mechanical applicability

| # | Signal | Why it works |
|---|---|---|
| 1 | **Systematic misspelling of the canonical name** | `Pegasis` · `Scythee` · `Libraa'` · `Orian'` · `Fireblase` · `Jupitar` · `Temp'` · `Cosmec'` · `EmperorMight-H0p'` — trailing apostrophes and digit-for-letter swaps, consistently, as trademark evasion. **A fuzzy match against the canonical name list flags nearly this whole catalogue** — and the local corpus gives us that list, offline, for 320 beys |
| 2 | **Price** | Median ₹419 against ₹1,599 (BAS). Head-to-head on one SKU: **BX-00 Dran Sword 3-60F — ₹349 here, ₹4,499 at BAS. 12.9×** |
| 3 | **Invented SKU suffixes** | `BB108gold`, `BB98blue`, `bx- white 00-20`, `BX-00 shark`, `BB-00-70gold`. Takara Tomy does not issue `-00` retail SKUs or colour suffixes |
| 4 | **Empty vendor/brand field** | Empty on 100% of 1,277. BAS populates `Vendor: Takara Tomy` on every card |
| 5 | **Seller's own prefix leading the title** | Genuine listings lead with the marque or the product code |
| 6 | **A bundled non-retail accessory in every title** | *"+ Toy Storage Box"* — their entire value-add narrative, and no TT retail product includes one |
| 7 | Zero reviews, zero ratings, empty image `alt` on every image | |

🛑 **They DO use real TT codes** — 516 `B-xx`, 189 `BB-xx`, 147 `BX-xx`,
95 `UX-xx`, 85 `CX-xx` — which is why **code-matching alone is not a
detector**. Only name-vs-code *consistency* is.

## Three provenance findings

1. **138 images carry Amazon's CDN naming** (`*._AC_SL1500_.jpg`) — scraped
   and re-uploaded.
2. **Product descriptions still contain Amazon's own HTML classes**
   (`<li class="a-spacing-mini">`), which is conclusive listing theft.
3. **Some images are AI-generated** (`ChatGPT-Image-Aug-13-2026-*.png`), so
   the photo may depict **no physical object**.

One stadium listing admits the material outright: *"made of **flimsey
plastic**"*. The About page lists three people as "CEO, co-founder" with
unedited template names, and the returns page still contains the literal token
`{physical address}`.

## 🛑 The misspelling corpus is a SEARCH-ALIAS asset

This is the counter-intuitive use, and it is the most valuable thing in this
file.

**A counterfeiter's trademark-evasion spellings are exactly what a real buyer
mistypes.** Someone who half-remembers "Pegasus" types `Pegasis`. So indexing
these as `aliases` on the feature/model leaf makes **our** search tolerant of
the misspellings people actually use, at **zero query-time cost** — it is more
tokens in an array that is already `array-contains`-indexed.

| Evasion spelling | Canonical |
|---|---|
| `Pegasis` | Pegasus |
| `Scythee` | Scythe |
| `Jupitar` | Jupiter |
| `Fireblase` | Fireblaze |
| `Orian'` | Orion |
| `Cosmec'` | Cosmic |
| `Libraa'` | Libra |
| `Temp'` | Tempo |

🛑 **Watch the 600-token cap**, which truncates **silently**
(`search-txt.ts`). Aliases must be added with a budget, not unbounded — a
model leaf that blows the cap loses tokens nobody chose to drop.

## What this does NOT license

Flagging a listing as counterfeit on these signals alone would be an
accusation we cannot substantiate per-listing. The signals belong in:

- **the spot-a-fake buying guide** — explaining them to a buyer, with the
  "aftermarket" framing answered directly;
- **the search-alias set** — the misspellings, used for recall only;
- **the scam registry**, which already exists with 27 scam types and an
  evidence model, for a report about a specific seller.

They do **not** belong in an automated listing-rejection rule. A fuzzy name
match has false positives, and a false counterfeit accusation against a real
seller is worse than a missed one.
