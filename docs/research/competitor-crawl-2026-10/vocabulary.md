# The feature vocabulary — ~60 rows, grouped

## Why this is `productFeatures` and not `tags`

**A tag is a category without enough weight to be a node.** "New in Box" is
one. A **midfake Dragoon G still files under `category-dragoon-g`** — the
original model's leaf — and carries a reproduction *feature*; it does not get
its own branch. That split is what keeps the tree at ~330 nodes instead of
thousands.

We already have the right collection, and it is not `tags`. Measured:

| | `productFeatures` | `ProductDocument.tags` |
|---|---|---|
| A real Firestore collection | ✅ `feature-` prefix, `id === slug` | ✖ free text on the product |
| Seeded | **10 rows, registered in BOTH seed maps** | — |
| Repository | ✅ 8 methods | — |
| CRUD routes | ✅ admin **and** store | — |
| Editor pages + nav | ✅ both portals | — |
| A controlled vocabulary | ✅ | ✖ which is how `attack-type` and `attack type` coexist |
| **A facet that has ever rendered** | ✅ fed real options by `useProductFeatures()` | 🛑 **no** — see below |

🛑 **The `tags` facet has never rendered for anyone.** It was guarded by
`tagOptions.length > 0` and **nothing in either repo ever passed
`tagOptions`** — it defaults `[]` at `ProductFilters.tsx`. So retiring `tags`
loses a phantom and keeps the facet that works.

## Four things that must change together

Or the merge is worse than leaving it alone.

| # | Change | Why load-bearing |
|---|---|---|
| 1 | **`MAX_FEATURES_PER_PRODUCT` 10 → 24** | A reproduction, new-in-box, japan-import, attack-type, right-spin, limited-release bey is **6 features before anything optional**. The cap was sized for badges, not a vocabulary |
| 2 | **`buildProductSearchTxt` must index feature LABELS, not ids** | It indexes `features` raw today, so `feature-free-shipping` tokenises to `feature`/`free`/`shipping` — the label "Free Shipping" works **by accident**, and a label like "New in Box" whose slug is `feature-nib` is **unfindable**. The write path must resolve ids → labels |
| 3 | **A composite index on `features`** ✅ **done + deployed (A3)** | There were four `products` composites on `tags` and **zero** containing `features`, so any single-value selection pushed `array-contains` + `orderBy` → `FAILED_PRECONDITION` → `null` → "temporarily unavailable". 🛑 But that was only half: **0 of 72 products carry a feature id** against 10 seeded vocabulary rows, so the facet still shows nothing until B5/B6 assign them. Fixing the index alone would have left it looking identical — Root Cause #90's shape |
| 4 | **`ProductFeaturesSelector` gets search + create + edit** | A flat `Checkbox` grid with no search box is fine for 10 rows and unusable at 60+ |

`ProductDocument.tags` is removed from the schema, the Sieve config,
`PRODUCT_UPDATABLE_FIELDS`, the public projection and
`buildProductSearchTxt` — deliberately, because leaving it as a dead field is
how a second vocabulary quietly re-grows. `tsc` enumerating the call sites is
the point (Root Cause #45).

## The schema addition

```ts
export type FeatureGroup =
  | "condition" | "authenticity" | "release" | "type" | "spin"
  | "commercial" | "sourcing" | "chase" | "grade"
  | "tcg-lang" | "tcg-format" | "figure" | "tournament";

export interface ProductFeatureDocument extends BaseDocument {
  // … existing: id, slug, label, description?, icon, iconColor?,
  //    category, scope, productTypes[], storeId?, isActive, displayOrder
  group: FeatureGroup;      // NEW — namespaces the vocabulary, drives faceting
  searchTxt?: string[];     // NEW — the collection becomes searchable
  aliases?: string[];       // NEW — "rubber flat" finds RF; feeds search aliasing
}
```

**Namespaced, because the same word means different things per vertical.**
"Sealed" on a TCG booster box is not "sealed" on a bey; "Premium" is a Hot
Wheels sub-line, not a quality claim. `group` keeps them apart and lets a
facet render one group at a time instead of one flat 60-value list.

## The vocabulary

| Group | Values |
|---|---|
| **condition** | `nib` (New in Box) · `nip` (New in Packet) · `brand-new` · `pre-owned` · `used` · `loose` · `no-box` · `sealed` · `mint` · `incomplete` · `damaged` |
| **authenticity** | `original` · `reproduction` (label: **Midfake**) · `unverified` |
| **release** | `regular` · `limited` · `early` · `random-booster` · `rlc` · `remake` · `promo` · `store-exclusive` |
| **type** (bey) | `attack` · `defense` · `stamina` · `balance` |
| **spin** | `right-spin` · `left-spin` · `dual-spin` |
| **commercial** | `clearance` · `on-sale` · `latest-release` · `best-seller` · `lot` |
| **sourcing** | `japan-import` · `imported` · `domestic` |
| **tcg-lang** | `japanese` (159 at tcgindia) · `english` (14) · `korean` (12) · `chinese` (2) |
| **tcg-format** | `booster-box` · `booster-pack` · `blister` · `etb` · `bundle` · `collection-box` · `premium-set` · `starter-deck` · `single` |
| **grade** | `psa-9` · `psa-10` · `bgs` · `cgc` · `raw` — pairs with the `sublisting` `itemCode` axis |
| **chase** (Hot Wheels) | `treasure-hunt` · `super-treasure-hunt` · `real-riders` · 🛑 `indian-card` |
| **figure** | `1-12` · `1-6` · `1-7` · `prize-figure` · `articulated` · `pvc` · `statue` · `vintage` · `without-box` |
| **tournament** | `wbo-legal` · `limited-format` |

🛑 **`indian-card` is a genuinely local signal no global taxonomy would
surface.** toycollectorsindia tags 40 products `Hotwheelsindiancard` /
`hotwheelsindian` / `Hotwheels indian`, because the Indian-market blister card
differs from the US one and collectors here price it differently.

🛑 **Do not create a category for anything in this table.** Every one is
orthogonal to the tree: a product has exactly one chain and any number of
features. `category-new-in-box` would duplicate every product that is also in
a generation node — the failure the single-chain invariant exists to prevent.

🛑 **`type` and `spin` come from the local corpus's normalisers, not from this
table read literally** — 100% `Type` coverage in ~90 spellings, 97% `Spin` in
54. Seed the 4 and 3 clean values; map everything else; keep the parenthetical
qualifier as product prose.

Type vocabulary independently mined from 5,471 competitor descriptions, which
is what validates the 4+3 shape: attack-type 65 · stamina-type 37 ·
defense-type 32 · balance-type 28 · right-spin 20 · left-spin 35 ·
dual-spin 6.

## Clicking a feature filters the listing you are on

The param convention is **already established and it is not the `f=` Sieve
escape hatch** — `BlogPostView` links each tag to `?tags=<value>`, consumed via
`TABLE_KEYS`. Products follow the same shape: **`?features=<featureId>`**,
pipe-joined for multi (`a|b`), parsed by `parsePublicProductParams`.

1. **Preserve the listing you are on.** A chip on `/auctions` navigates to
   `/auctions?features=x`, not `/products`. The chip takes the current
   `browseRoute` from `pluginFor(listingType)`, so clicking "New in Box" on a
   prize-draw card keeps you in prize draws.
2. **`FeatureBadge` becomes the link.** It renders a bare `<Span>` today; it
   gains an optional `href`, so the detail-page badge list and the card chip
   row are one component.
3. 🛑 **Not via `f=`.** `SAFE_PRODUCT_FILTER_FIELDS` safelists `tags` but
   **not** `features`, so a raw `f=features@=x` is silently dropped by
   `validateSieveFilters`. Since `tags` is being retired, that safelist entry
   goes with it rather than being repointed.

## Authenticity — both a feature and a field, and why

Structurally, authenticity **is** a lightweight classifier: it belongs in the
table above, and a midfake Dragoon G files under the original's leaf rather
than a separate branch.

But it is **also** a validated required field, for one reason: **a feature can
be omitted and nothing notices.** A mislabelled repro is a refund; a
mislabelled **fake** is a child handling leaded metal. That asymmetry is the
whole argument, and it is the only place in this plan where a schema field is
spent on something otherwise tag-shaped. The enum **writes the matching
feature**, so the facet, badge and search all read one vocabulary while the
form cannot be submitted without an answer.

### Three distinct things, two of which are not brands

| | What it is | Sellable |
|---|---|---|
| **Original** | Licensed manufacture — Takara, Tomy, Takara Tomy, Hasbro, Funskool, Sonokong, Young Toys, NewBoy | Yes |
| **Reproduction** (midfake / repro) | A **1st copy of an original design**, largely Chinese, with **no manufacturer's marque**. Quality generally good; some WBO formats permit certain repro parts | **Yes, when labelled** |
| **Fake** | Poor-quality counterfeit — **lead content, brittle plastic**. BAS's own guide: *"use cadmium or lead in the metal parts"* | **No — a safety and scam matter, not a listing option** |

```ts
/** 🛑 No "fake" value: a lead-bearing counterfeit is not a listing state we
 *  offer. It is a report, and it belongs in the scam registry. */
export type ProductAuthenticity = "original" | "reproduction" | "unverified";
```

**Authenticity and condition are independent** — an original can be broken, a
reproduction can be mint. WHS's Clearance mixes repros with
damaged/incomplete stock; that is a *quality* bucket and stays a facet.

### Our vocabulary choice is already validated by the SEO leader

worldhobbyshop ships a top-level nav category called **"MidFake Beyblades"**
and an FAQ reading: *"**Midfake, reproduction, damaged and significantly
imperfect products are kept separate in our Clearance category, with their
authenticity and condition clearly disclosed.**"* They also pair authenticity
with **condition** as a second, independent axis — exactly this model. BAS
pairs it with NiB / Mint / Used and runs anti-counterfeit copy as hero slide 5:
*"100% original Takara Tomy Beyblades. **Don't fall for cheap imitations!**"*

So `original | reproduction | unverified` matches established community
language, and **"midfake" should be the LABEL on the reproduction tier because
that is the word buyers search.**

Trust copy goes to three surfaces, not a brand page: `/help/authenticity`
(we have `/help/*` and no such page) · two `product_information` FAQs (what a
repro is + tournament legality; how to spot a fake) · a badge wherever
`authenticity !== "original"`.
