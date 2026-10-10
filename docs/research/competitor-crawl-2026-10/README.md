# Competitor crawl — October 2026

Fifteen Indian collectibles storefronts across five platforms, **~25,900 live
listings**. This directory is the persisted form of that crawl: it is what
`appkit/src/seed/**` is seeded *from*, so a number here is a number a fixture
must be able to cite.

> 🛑 **The raw JSON is gone.** The crawl ran in a session temp directory and
> that directory was wiped before this was written. What survives is the
> measured aggregates below — medians, counts, vocabularies, template shapes —
> which is what the seed needs; what does not survive is per-product rows, so
> a question like "what did SKU X cost at site Y" can no longer be answered
> without re-crawling. If a future crawl happens, land raw output in a
> gitignored `.crawl-data/` at the repo root and commit only aggregates here.

## Files

| File | Contents |
|---|---|
| [`price-bands.md`](price-bands.md) | Every measured price band, with `n` — the day-1 `priceGuidance.market` values |
| [`taxonomy.md`](taxonomy.md) | The category forest, brand list, and what each competitor's axis became |
| [`vocabulary.md`](vocabulary.md) | The ~60-row `productFeatures` vocabulary, grouped |
| [`description-templates.md`](description-templates.md) | The reusable bodies, verbatim shapes, and one counter-example |
| [`counterfeit-signals.md`](counterfeit-signals.md) | bladekingbeys.com — the fake-detection signal set and the search-alias corpus |
| [`gst-hsn.md`](gst-hsn.md) | HSN codes and rates, with what is and is not verified |
| [`seo-signals.md`](seo-signals.md) | Measured head/content/JSON-LD comparison |

## Sources

| Site | Platform | Products | Sold out | Median | Max |
|---|---|---|---|---|---|
| toycollectorsindia.com | Shopify | **15,014** | 87.0% | ₹899 | ₹74,999 |
| beybladeartshop.com | Shopify | 1,914 | 81.1% | ₹1,599 | ₹34,999 |
| beybladeshopindia.com | OpenCart | 2,026 | **92.8%** | ₹1,399 | ₹71,999 |
| bladekingbeys.com 🛑 | WooCommerce | 1,277 | 44.5% | **₹419** | ₹2,499 |
| worldhobbyshop.in | WooCommerce | 1,195 | **88.5%** | ₹899 | ₹9,999 |
| redeyemerch.in | Shopify | 1,011 | 76.0% | ₹899 | ₹6,499 |
| tcgrepublic.in | WooCommerce | 826 | 21.9% | ₹450 | ₹75,000 |
| hobbykartindia.com | Wix | 501 (83 sampled) | — | ₹2,350 | ₹38,000 |
| raikagesbeybladestore.in | WooCommerce | 428 | 51.2% | ₹549 | ₹12,999 |
| tcgindia.in | custom Next.js | 272 | — | — | — |
| hobsoncollectibles.com | Shopify | 217 | 17.1% | ₹4,200 | ₹52,999 |
| thelimitlesscorner.com | Odoo | 66 | 4.5% | ₹1,099 | ₹14,999 |
| beyyuniverse.in | WooCommerce | 8 | 100% | — | ₹2,900 |
| beybladeartshop.in | — | — | — | — | parked domain, dead |
| yogiinstinct.in | — | — | — | — | **does not exist** |

`yogiinstinct.in` was verified absent rather than assumed: DNS returns
"Non-existent domain" on all four host spellings and the Wayback Machine has
**zero** snapshots — checked against controls that *do* return data
(`worldhobbyshop.in` archived from Jan 2023, `letitrip.in` present).

## Two readings that shaped the plan more than the price data

**Sold-out is near-universal** — 92.8 / 88.5 / 87.0 / 81.1 / 76.0% on the five
largest. Keeping the archive live is the norm in this market, and our own
"Sold & Ended" tab is empty and therefore untestable. That is why B6 seeds
~215 sold fixtures with `status: "published"` — an `archived` row is removed by
the status filter *before* the availability predicate ever runs.

**Nobody runs a review widget and nobody runs a chat widget.** Across all
fifteen: no Judge.me, Loox or Yotpo; no Intercom, Tidio or Crisp. Our native
reviews — 79 seeded, seller responses, helpful votes, a `/reviews` index and
per-store pages — is ahead of every one of them. Composition changes copied
from these sites must not drop it.

## 🛑 Two corrections to earlier readings of this crawl

Recorded because both were reasoned from before being measured, and both were
wrong in a way that would have changed design decisions.

1. **"Neither leader has an H1 or above-the-fold copy on its homepage."**
   False. Re-measured against served HTML: worldhobbyshop **1 h1 / 17 h2 /
   21 h3**, beybladeartshop **1 / 28 / 60**, toycollectorsindia **2 / 27 / 86**.
   The likely cause of the bad reading is that on the two Shopify sites the
   hero headings sit inside a slideshow whose slides are CSS background images
   with absolutely-positioned overlay text, so a first-viewport or
   pre-hydration measurement misses them.

2. **"beybladeartshop leads on homepage word count."** It does, but not by the
   margin first recorded: toycollectorsindia measures 7,430 words of which
   **3,926 (53%) are the full body text of four blog posts inlined into the
   homepage**, duplicating its own canonical blog URLs. Strip that and TCI is
   ~3,500, below BAS's 5,540. **5,540 is the honest benchmark for curated
   homepage copy.** Inlining whole articles is not a pattern to copy.

And one finding that is itself a correction of intuition: **the SEO leader has
the fewest products and words on its homepage.** worldhobbyshop ships 8 product
cards, 1,816 words and *one* product rail. Its advantage is taxonomy routing
(6 generation tiles + a 25-link systems matrix) plus a 10-question FAQ — not
merchandising volume.

## A non-competitor source that is now primary for product identity

`C:\Users\mohsi\Downloads\Beyblade-Game-master\linka` — a completed local
crawl the user already owns: 43,844 files / 7.25 GB, including **334 Beyblade
documents**, 6,291 beybase.com HTML pages, 39 stadium docs and 36,461 images.
Plus `case study/` beside it: 2,008 numbered cases the user derived from it,
**1,920 with parseable `## Case N — Part Name (X.X g)` headers**.

This replaces the planned network crawl of the Beyblade Wiki (403 on HTML,
needs throttling) for everything except two gaps: JP/romaji names, and the
Takara Tomy ↔ Hasbro alias map. See [`taxonomy.md`](taxonomy.md) for the
measured field coverage and the three mandatory normalisers.

🛑 **The 36,461 crawled images are third-party product photography and are not
republished as our product images.** They are a reference corpus for the
spot-a-fake guide and a source of local test fixtures. Product imagery stays
on `seedPhoto()` tiles until real photography exists — and separately, routing
them through `/api/media/ext` would re-proxy each one at a lambda + sharp cost
per render, which is Root Cause #104 verbatim.
