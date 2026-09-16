# Tester findings — run-1789432098900 (pass 1, in progress)

**Snapshot taken 2026-09-15 after batch 35.**
**35 of 226 batches recorded · 100 yes · 30 no · 57 blocked.**
Controls clean in every recorded batch (no quarantines).

Every item below was observed on **live production** (`https://www.letitrip.in`) through
the UI first, with the cause established afterwards. Evidence screenshots live in
`tester/.tester-runs/run-1789432098900/shots/`.

---

## A. Blocking defects — a user cannot complete the task

### A1. `/admin/categories` lists nothing at all
Renders **"No categories found"**, 0 rows, still empty after a 6-second wait — while
`GET /api/admin/categories` returns **200** with `{success, data:{ data:[…], total:58 }}`.
The rows are under `data.data`; the view reads a different item-array key.

- This is the documented `audit-list-envelope` / `NEW_ITEM_ARRAY_KEY` shape.
- **Blocks all admin category *and brand* management** — brands are `categoryType:"brand"`
  rows on the same page.
- **Narrowed**: `/admin/sublisting-categories` lists fine (2 rows), and public
  `/categories` renders all of them with counts. It is this one view.
- Cases: `admin-catalog-listings-{brands,categories}-crud`, `categories-toggle-filters`.

### A2. Seller cannot read their own digital-code pool
`GET /api/store/products/<id>/codes` returns `200 {entries:[]}` while the pool is **empty**
and **HTTP 500 `INTERNAL`** the moment it holds anything.
requestId `3a4ec03f-bffb-48e5-90fd-ec508e50dd57`. POST to the same endpoint is fine (200).

- Codes go in and can never be read back; the pool list is unusable once non-empty.
- Cases: `digital-content-delivery-add-codes-bulk`, `…-pool-list-never-shows-the-code`.

### A3. Admins cannot create Art or Stickers listings
The listing-type selector on `/admin/products/new` offers **seven** options —
`standard, auction, preorder, prize-draw, classified, digital-code, live`. **Art and
Stickers are absent.**

- Root Cause #61 family (a hand-maintained enumeration of `ListingType`).
- The admin *filter* chips carry all nine, and `/admin/art` + `/admin/stickers` exist and
  list correctly — it is the create selector alone.
- Also spells it `preorder` where slugs/routes use `pre-order`.
- Case: `admin-catalog-listings-art-stickers-crud`.

### A4. Cart/Buy refusals are silent — two CTAs read as dead buttons
The server refuses correctly and returns a **user-ready sentence**; the UI discards it.

- `POST /api/cart` → `400 VALIDATION_FAILED` *"Complete your accepted offer first — you
  can add other items once it's paid for."* (requestId `f49dcb48-…`)
- On screen: no toast, no inline error, no badge change, and Buy Now does not navigate.
- Reproduced on **two products and two surfaces** (inline CTA + sticky bar) → shared CTA
  path, one fix.
- The cart page explains the same block properly, so the copy exists and is good.
- Cases: `sticky-cta-bar-desktop-buttons-work`, plus it blocks 4 digital-content cases.

---

## B. Wrong data shown — no error, plausible-looking numbers

### B1. Every category/brand count is exactly **double** the truth
| Surface | Tile says | Page actually has |
|---|---|---|
| Starter Sets (leaf) | 10 | 5 (2 products · 1 auction · 2 pre-orders) |
| Boosters (leaf) | 10 | 5 (same split) |
| Beyblade X Tops (parent) | 20 | header "4 products" |
| Independent Keepers (brand) | 4 | 2 cards |

- **Ruled out**: duplicated taxonomy chains. `BX-02 Dran Sword` carries
  `['category-x-starters','category-x-tops','category-beyblade-x','category-spinning-tops']`
  with no duplicates.
- Consistent with own-count + rollup-count being summed for a leaf (where they are equal),
  but the stored metrics were not readable — **treat the mechanism as a hypothesis**.
- **The read side is correct** and should not be touched: the parent genuinely lists its
  descendants' items (X Tops = exactly the union of its two children), siblings are
  isolated (disjoint sets), and the rollup composes (Spinning Tops 57 = 9+10+14+20+4).
  The hierarchy is summing wrong inputs.

### B2. Public Name sorts are inert
`/products?sort=title` and `?sort=-title` return a **byte-identical** order, equal to the
Newest-First order.

- **NOT** the Root Cause #63 `canSort:false` shape: `/admin/products?sort=title` orders
  correctly ("1-on-1 …", "Bearded Dragon", "Beyblade Burst App …"). The field *is*
  sortable and the admin path honours it.
- Look at `listPublicProducts` and its bounded-fetch / availability branch.
- Case: `browsing-search-search-filter-sort-combo`.

### B3. `/store/digital-codes` renders six blank rows
Checkbox, key icon, **empty title**, "published", menu. The accessible label is literally
`Select undefined`. The API returns real titles under `data.products`; sibling
`/store/products` renders titles, thumbnails, badges and actions perfectly.
Root Cause #52 shape (row mapper reading a field the document lacks).

### B4. Seeded digital-code counters are fiction
A listing advertised `codesAvailable: 3` / `codePoolSize: 10` with **zero** pool entries —
a purchase would have delivered nothing. Adding 3 real codes *corrected* `codePoolSize`
10 → 3, proving `recountPool()` works and the seed never backfilled.
**Check the other digital-code listings for the same gap.** (Root Cause #103 residue.)

---

## C. Missing affordances

- **C1. Carousel slides cannot be reordered.** Order column is display-only: 0 draggable
  rows, 0 drag handles, 0 grip icons across 152 rows, and no order field in the slide
  form. `/admin/sections` ships a full reorder panel for the same job.
- **C2. Per-type admin pages have a dead Filters button.** `/admin/art` and `/admin/live`
  (and 3 siblings) open **no dialog** at all; the same button works on `/admin/products`,
  `/products` and `/art`. Rows, sort and row-click-to-editor all work.
- **C3. `/products` Features facet can only ever return zero.** 0 of 50 products carry
  `features[]`; all 50 carry `tags[]` — and the Tags facet is **absent** from the drawer.
- **C4. Admin › Addresses has no status chips** (it is an owner-ID lookup form, not a
  listing). On Payment Methods the chip *is* URL-reflected but Back leaves the page
  entirely — chips apply via `router.replace`.
- **C5. Free-shipping facet always empties the grid** — 0 of 50 products have
  `shippingPaidBy: "seller"`. A seed gap, not a broken filter, but indistinguishable to a
  user.

---

## D. Confirmed working — do NOT re-investigate

- Admin product edit **persists** (899 → 907 → reload 907, neighbours untouched).
- Homepage section reorder persists **both directions**, 22 sections intact.
- Sublisting categories: full create → list → edit → delete cycle, with a real
  "cannot be undone" confirmation.
- Deals/Featured flag round-trips (false → true → reload → true → restored).
- Admin `-featured` / `-isPromoted` sorts genuinely reorder; type chips multi-select;
  "Clear all" + Apply restores the fresh-load state; row click opens the editor.
- `/admin/carousels` renders the correct "Named Carousels" component (**Root Cause #37 is
  fixed**).
- Digital-content **access model is correct**: seller PDF refused server-side with good
  copy, admin allowed, signed path is `private/digital-content/<id>/<uuid>-name.pdf` —
  random UUID, not a guessable slug.
- Category counts are **identical for guest and signed-in** (23 categories, zero diffs).
- **Sticky CTA bar is excellent**: 12/12 then 3/3. Hidden at top, appears on scroll, hides
  on scroll-up, clears the footer at true max scroll, stacks flush above the mobile nav
  (ends 780, nav starts 779 = 844 − 64). Per-type wording all correct; no bar on ended
  auctions, closed draws, depleted digital codes, or any non-listing page.

---

## E. Case-data defects — these would make a human report a false failure

| Case | Says | Reality |
|---|---|---|
| ended-auction-no-bar | `auction-beyblade-burst-lord-spryzen-ended-unsold` | **404** "Auction Not Found"; real: `auction-beyblade-metal-diablo-nemesis` |
| classified-bar-no-cart | `classified-beyblade-stadium-set` | not seeded; real: `classified-beyblade-x-tournament-kit-hyderabad` |
| digital-code-bar | `digitalcode-beyblade-x-app-starter-pack` | not seeded; real: `…-app-legendary-pack` / `…-launch-codes-depleted` |
| category rollup cases | `/categories/x-starters`, `/categories/x-tops` | unprefixed slugs **404**; real ids carry `category-` |
| product-type-chips-cover-all-types | demands 9 types on `/products` | 4 is correct since the 2026-09-14 general-catalogue change |
| filter-drawer-facets-actually-filter | Tags + Sublisting Type sections | neither exists in the drawer any more |
| admin status labels | "In Review" | chip reads "Pending" |

---

## F. Smaller observations

- Buyer avatar `/media/user-rehan-sheikh-avatar` → **404**.
- Cart renders a raw field name: literal text `storeName: Beyblade Arena`.
- React error **#418** (hydration mismatch) fires on `/products`.
- Guest `/api/notifications?limit=1` → **401**, twice per page.
- Sticky-bar wishlist is **add-only** — "Saved" renders disabled, no way to unsave there.
- `+ Add Product` on `/admin/featured` goes to the generic `/admin/products/new`, not a
  picker for flagging an existing product.
- Admin product rows show **"Unknown seller · No SKU"** while the same products show
  "by Beyblade Arena" publicly.

---

## G. Method notes that cost real time this run

1. **Never `^`-anchor a `browser_find` regex** — `^` matches the snapshot *line*, not the
   label, so it can never match and reads as "element absent". Cost one wrong verdict.
2. **Scroll with `document.scrollingElement`, not `document.body.scrollHeight`** — the
   latter under-scrolls and falsely reported 3 footer links covered by the sticky bar.
3. **A modal here may carry no `role="dialog"`** — probing the a11y tree for one gave a
   false negative and nearly produced a bogus "Delete does nothing" finding. Some editors
   also render **two** action buttons, one hidden; click the visible one.
4. **Admin drawers and the sections reorder panel are pending-until-apply** — a chip click
   alone changes nothing. Do not report that as a dead control.
5. **Read case ids verbatim from the batch file**; rebuilding them from a stripped print
   doubled a path segment and all 14 were rejected.
6. **`evidence.dataObserved` must use exactly the keys in that case's `expectedData`.**
7. `browser_evaluate` returning a small object beats screenshot+read for measurement.

---

## H. Known test pollution

`QA-CODE-ALPHA` / `BRAVO` / `CHARLIE` are in the pool of
`digitalcode-beyblade-x-manual-coaching-session`. Removing them needs entry ids that only
the 500-ing GET can supply (A2). A reseed clears it — the collection is seed-owned.
Everything else I touched was restored.

### G5. `fetch-cases.mjs` re-mints every session file — copy the identity AFTER it, never before

Found at batch 50 (`buying/product-detail--admin`), and it silently ran an admin
batch as a buyer for several navigations before I noticed.

`fetch-cases.mjs` mints **all four** session files fresh on every invocation —
`session-{admin,buyer,seller,guest}.json` all carried the same mtime and
sequential JWT expiries — and it leaves `session.json` on a **buyer** default.
So the documented swap order is wrong in one respect:

```
WRONG:  cp session-admin.json session.json  →  fetch-cases.mjs  →  browse   # clobbered
RIGHT:  fetch-cases.mjs  →  cp session-admin.json session.json  →  browse
```

**The symptom is not an error.** `/admin/products` redirected to `/unauthorized`
while the header still showed a signed-in user, which reads as "the admin session
expired" — it was not expired; `session-admin.json` was valid to 2026-09-20. The
decisive check costs nothing and needs no API call, because `__session` is a JWT:

```bash
node -e "const s=require('./session.json');const c=s.cookies.find(x=>x.name==='__session');
console.log(JSON.parse(Buffer.from(c.value.split('.')[1],'base64url').toString()).email)"
```

**Why this matters beyond one batch**: the wrong identity does not fail loudly, it
just renders a different page. I landed on `/user/profile` for the real account
`rehan.sheikh@gmail.com` (uid `user-yugi-muto`) — a PRESERVE-tier document — which
is one click from the edit-your-display-name step other cases in that group begin
with. Read the account off the page before touching anything, every time.

### G6. Many single-identity batches contain cases whose oracle is in ANOTHER identity

`admin/coupons` recorded **2 yes / 9 blocked**, and none of the nine was a product
fault. The batch browses as admin; nine of its eleven cases end at a buyer's
checkout ("sign in as vivaan.kapoor@gmail.com, apply the coupon, read the
discount"). A batch has exactly one identity, so those cases can never be settled
in the batch that owns them.

This is not an argument for guessing. It is an argument for **splitting by oracle
rather than by page**: the admin half ("every row shows its scope", "no stacking
toggle", "the form offers all four types") is genuinely answerable and was
answered; the checkout half belongs in a buyer batch that references the coupon
by code.

Expect this shape on every admin group whose subject is something a buyer
consumes — coupons, offers, payouts, orders. Budget for it rather than reading the
blocked count as a defect count.

**The one to re-run first** is `coupon-admin-edit-actually-saves`. It targets
`PATCH /api/admin/coupons/[id]`, the route that once returned 200 echoing the
submission back while writing nothing (Root Cause #40), and a coupon-editor fix
shipped earlier in this run is still unverified against it.

### D-badges. `/products` badge contrast, light mode — measured, clean (partial, batch left unrecorded)

Computed WCAG ratios from real rendered colours on `/products` as a guest,
light theme (`data-theme=default-light`), 1440px. 17 badge instances, 4 distinct:

| Badge | ink | fill | ratio | own background? |
|---|---|---|---|---|
| Live Item | white | `rgb(185,28,28)` | **6.47** | yes |
| Digital Code | white | `rgb(21,128,61)` | **5.02** | yes |
| Classified | white | `rgb(192,38,211)` | **4.71** | yes |
| New | `rgb(91,91,99)` | white | 6.73 | no (facet label) |

**Zero below 3:1.** Live Item specifically **does** carry a filled background, so
the `live-item-tag-has-background` claim holds in light mode — the earlier
`bg-danger-surface` defect (Root Cause #67c, a colour Tailwind never generated)
is not reproducing here.

🛑 **Case-data nuance for whoever finishes this batch**: the cases say "all eight
badges" on `/products`, but `/products` is the GENERAL CATALOGUE and spans only
the four types whose plugin sets `inGeneralCatalogue: true` (standard,
classified, digital-code, live). Auction / Pre-Order / Prize Draw / Art Print /
Sticker Sheet badges cannot appear there by design and must be read on their own
browse pages or via the `detail-page-tags-readable` case. Expect 4, not 8.

Still outstanding in this batch: the dark-mode sweep, promo badges
(NEW/SALE/LIMITED — none rendered on page 1), `/faqs` helpful buttons, detail-page
tags, the WhatsApp member pill, lightbox close-on-hover, and the analytics-tags
case. The probe that produced the table above is worth reusing verbatim.

### B-classified-dark. The Classified badge is the only type badge with a theme-DEPENDENT fill, and its dark variant fails contrast

**Two surfaces, one root cause.** Measured WCAG ratios from rendered colours, guest, 1440px:

| Badge | light fill | light ratio | dark fill | dark ratio |
|---|---|---|---|---|
| Live Item | `rgb(185,28,28)` | 6.47 | `rgb(185,28,28)` | **6.47** |
| Digital Code | `rgb(21,128,61)` | 5.02 | `rgb(21,128,61)` | **5.02** |
| **Classified** | `rgb(192,38,211)` | 4.71 | **`rgb(6,182,212)`** | **2.43** |

Live Item and Digital Code are theme-INVARIANT solids — identical fills in both
themes, which is the documented overlay pairing. Classified is the outlier: it
resolves to the theme's `secondary` (magenta in light, cyan in dark) while keeping
fixed white ink, so it inverts underneath its own text. 10px at font-weight 700 is
normal-size text, needing 4.5:1; it measures 2.43.

Reproduced on `/products` AND `/auctions/auction-beyblade-x-shark-edge`, where the
other seven badges score 5.02–10.84 and only Classified fails.

**Calibration**: the word is still *discernible*, not invisible. This is a
contrast-threshold failure and a visible odd-one-out, not a blank pill — do not
read it as the white-on-white class. The fix is to give Classified a solid,
theme-invariant fill like its neighbours rather than a theme-relative token.

### C-absent. Three case subjects no longer exist on the page

Not defects in themselves, but each makes its case untestable as written:

- **FAQ helpful buttons** — `/faqs` hydrates 50 questions (after ~8s) and an
  expanded FAQ contains exactly one button: its own toggle. The only "helpful" on
  the page is the sort option *Most Helpful*. Note `FaqDocument.stats.helpful`
  still exists, so the schema expects a control that no longer renders.
- **WhatsApp member-count pill** — the card renders icon, eyebrow, heading,
  subtitle, four bullets and a *Join the group* button. No member count anywhere.
  Adjacent: its subtitle is muted grey `rgb(139,139,148)` on the branded
  red→cyan gradient and is visibly dimmer than the white bullets — the same
  theme-relative-token-on-branded-backdrop pattern.
- **NEW / SALE / LIMITED promo badges** — zero occurrences across all 24 cards on
  `/products`. The promo badges that ship are *Final Sale* and *Taking Offers*
  (5.02), both legible.

### D-admin-chips. Admin status chips are readable everywhere and correctly theme-inverting

Measured across `/admin/orders`, `/admin/stores`, `/admin/payouts`, both themes,
as admin. **Zero chips below 3:1 anywhere.**

`/admin/orders` light — 8 statuses across **4 colour families**:

| family | statuses | ink / fill | ratio |
|---|---|---|---|
| amber | processing, return_requested | `rgb(180,83,9)` on `rgb(255,251,235)` | 4.84 |
| green | confirmed, shipped, delivered | `rgb(21,128,61)` on `rgb(240,253,244)` | 4.79 |
| red | cancelled, refunded | `rgb(185,28,28)` on `rgb(254,242,242)` | 5.91 |
| neutral | returned | grey on white | 6.73 |

In dark the same chips invert correctly (amber → `rgb(251,191,36)` on
`rgb(28,21,8)` = 10.84), so these do **not** share the Classified badge's
theme-dependent defect (B-classified-dark).

**Colour is grouped by semantics, not one hue per status.** That is neither
failure the case names — it is not "all one colour", and nothing is invisible —
but it does mean *shipped* and *delivered* are not distinguishable by colour
alone. Recorded as an observation, not a defect.

🛑 **METHOD — the computed-style probe UNDERCOUNTS chips.** On `/admin/stores` it
found 1 chip where the page plainly renders 3 (amber pending, green active, red
suspended); same on `/admin/payouts`. A chip whose fill is an `rgba()` below the
0.5-alpha cutoff, or whose text sits in a differently-nested node, slips past it.
**Use the probe for ratios on chips you have already seen, never to enumerate
what exists.** This is the fourth time this run that a probe disagreed with a
screenshot and the screenshot was right.

## A5 (BLOCKING). Seller order documents are in a legacy FLAT shape — no `items[]`, no `buyerId`

Found on `/store/orders` as tyson@beybladearena.in. **One defect, four symptoms**,
which is why it is worth fixing before anything else in the selling group.

Measured from `GET /api/store/orders?pageSize=25` (200, `data.meta.total` = 40)
*after* observing the symptoms in the UI:

- **24 of 25 orders have no `items[]` array at all**
- **25 of 25 have no `buyerId`**
- they carry `unitPrice` / `totalPrice` / `userEmail` / `productId` at the TOP LEVEL
- the one order that *does* have `items[]` still lacks `buyerId` and uses
  `totalPrice` rather than `totalAmount`

This is the shape Root Cause #60 describes — *"flat `productId`/`productTitle`/
`userId`/`unitPrice`/`totalPrice` instead of `buyerId` + `items[]` +
`totalAmount`"* — but it is **not confined to auction wins**. By `orderType`:
2 auction, 1 prize-draw, 1 pre-order, 1 offer, 1 standard and **18 with no
`orderType` at all**, every one of them flat.

### What the seller actually sees

| Symptom | Cause |
|---|---|
| all 25 rows read **"Unknown buyer"** | no `buyerId` on any document |
| **no product name** on any row | row mapper reads `items[0].productTitle`; there is no `items[]` (Root Cause #52's fix has nothing to read) |
| 25 rows show only **4 distinct titles** | see below — a UI truncation, not an id collision |
| `/store` dashboard shows **no revenue and no order count** | same documents; `totalAmount` is absent |

🛑 **The ids are NOT truncated in the data.** The API returns the full
`order-1-20260822-aucwon` (24 chars); the LIST renders it cut to 14
(`order-1-202608`), which is why 25 rows look like 4 duplicates. Do not "fix"
the id generator — fix the title, and preferably render the product name per
Root Cause #52 rather than an id at all.

### `/store` dashboard is an empty slot-shell

`/store` renders the heading plus two bare labels, **"Stats"** and **"Quick
Actions"**, with nothing inside either — whole-page body text is 1,727
characters, zero occurrences of "revenue", and the only money rendered is the
site-wide `₹999` shipping banner. That is Root Cause #8's shape (a shell with no
content) sitting on top of the data problem, so fixing the order shape alone may
not light it up.

## B-public-pages. Three defects on public pages (batch 58)

**1. `/about` promises six values and renders three.** The section copy literally
reads *"Our Values — **Six** things we hold to."* and beneath it are exactly three:
Trust First, Built By Collectors, Move Fast Ship Fast. Each *does* carry its
second paragraph (146/167/141 chars) and the `/ethics` link works — so this is
three missing values, not a broken section. Visible to any visitor who reads the
sentence.

**2. `/pre-orders` opens with generic defaults instead of its per-type ones.**
Two mismatches, same cause:

| | expected | actual |
|---|---|---|
| sort selection | Earliest Delivery | **Newest First** |
| middle availability tab | Sold | **Ended** |

"Earliest Delivery" *is* offered in the dropdown (first of five), just not
selected — and consequently no delivery date renders on the cards at all. Both
values are supposed to derive per listing type from the plugin, which is the same
mechanism that correctly gives `/auctions` its "Ended" label, so the derivation
is simply not reaching this page.

**3. `/bundles` shows a discount % to signed-out visitors.** Prices gate
correctly ("🔒 Sign in to see the bundle price", zero rupee amounts) but every
card carries a top-left badge — **20% / 12% / 19% / 12% / 35% OFF**. A discount
percentage is exactly the "secondary money detail beside an already-gated amount"
that guest gating says must render nothing, and it leaks how much a bundle saves
without showing its price. The sandbox half of the case passes: no tester bundle
is visible to a guest.

**Clean on the same batch**: homepage at both widths (no empty rails), the
WhatsApp invite (resolves to a real group named "letitrip.in", same code on
homepage and `/contact`), About Us in desktop *and* mobile nav, the real founder
and `/developer` page (Mohasin Chinnapattan, github.com/mohasinac), `/products`
(exactly 4 listing-type checkboxes, no mixed-type badges), `/auctions`
(Available/Ended/All), `/categories` (both roots, 34/34 cards carry counts) and
`/brands` (About panel with website, country, founded).

🛑 **METHOD — three false readings in ONE batch, all mine, all caught by looking.**
(a) "24 empty homepage sections" — my heuristic inspected each heading's own
wrapper, not its content container. (b) "/categories has 0 roots" — they were on
page 2 of an A–Z index I had only read page 1 of. (c) "only 2 of 24 category
cards show a count" — the count sits past the 46-character truncation I applied
to each card's text; it is actually 34 of 34. Compare with the earlier
`/admin/stores` undercount: **a probe that returns a small number is far more
often my bug than the page's.** Screenshot first, probe second.

## A6. Category item counts are inflated ~3.5x — three for three

Re-verified against production (this supersedes the earlier "counts are exactly
double" note; the ratio varies, the inflation does not):

| category | index card says | its page renders |
|---|---|---|
| Beyblade Burst | 14 items | **4 products** |
| Beyblade Metal Fight | 10 items | **3 products** |
| Spinning Tops (root) | 57 items | **15 products** |

**Not an availability artifact** — Burst still shows 4 on the *All* tab, so
sold/ended rows do not account for the gap.

**Direction matters for triage**: no card shows zero over a populated page and no
page is empty under a non-zero card. The counts are only ever *too large*, which
points at the stored category metric rather than the listing query. A category
carries two metrics — own-items and own-plus-descendants — and a rollup written
into the field the card reads produces exactly this shape.

**The ancestor aggregation itself is FINE.** `category-spinning-tops` is a tier-0
root with no products of its own and still renders 30 product links with no empty
state, so descendants genuinely do surface on an ancestor page. Only the
displayed number is wrong. Fix the metric, not the query.

### Same page, two missing sections

- **No "Related Brands" block** on `/categories/category-beyblade-burst` — no
  heading, zero `/brands/*` links. "Related Categories" *is* present and lists
  Spinning Tops and Beyblade Original.
- **No grouped-listings carousel** on category pages — zero "Grouped Listings"
  headings after a full scroll.

Working on the same page: highlights render as bullets under "Why shop here", and
the FAQ accordion holds 2 questions that expand to real answers.

---

## FIX CYCLE 1 — shipped and re-verified in production (appkit 4.41.3)

Three fixes, each re-tested against production after deploy rather than assumed.

### 1. Admin categories + carousel listings rendered empty (largest cluster, 3 cases)

**Cause was not where the evidence pointed.** Four hypotheses were checked and
disproved first — wrong endpoint, a malformed URL from appending params to a
query string that already had one, a bad `sorts=name` param, a wrong envelope
key. The exact URL the page requests returns 200 with a 50-element array.

The break was between a successful fetch and `mapRows`: **`ApiClient.ts:170` is
`return data.data as T`**, so `apiClient.get()` unwraps the envelope.
`/api/categories` puts rows directly in `data`, so `mapRows` receives the ARRAY
— and `.data` on an array is `undefined`, the `.items` fallback likewise, so
`toRecordArray(undefined)` gave `[]`.

`AdminCarouselView` had the identical pattern against `/api/carousel`, which
also returns a bare array. Both fixed with a strictly additive
`Array.isArray(response)` branch ahead of the existing checks.

**Verified after deploy**: 50 rows render, empty state gone, and "Takara-Tomy"
(a `categoryType:"brand"` row) is listed — so the brands third of the cluster is
fixed by the same change.

### 2. `/bundles` showed a discount % to signed-out visitors

Every card carried a 20–35% OFF badge beside a correctly-gated
"Sign in to see the bundle price". Wrapped in `PricesOnly` in both
`MarketplaceBundleCard` and `FeaturedBundlesSection` — `BundleDetailView`
already had it right, and in both fixed files the struck-through original total
was *already* wrapped while the badge beside it was not, so this aligned two
renderers with the third rather than inventing a rule.

**Verified after deploy**: 0 badges visible to a guest, price still gated, all 5
cards still render.

### 3. Missing product pages told crawlers to index the soft 404

`/products/<missing>` answers 200 and `generateMetadata` returned only a title,
inheriting the root layout's `index: true`. `/products/<anything>` is unbounded,
so every member was an indexable soft 404.

**Verified after deploy**: missing product now `noindex`; the REAL product page
still serves `index, follow`, so it is an exclusion on the not-found branch and
not a blanket rule.

### 🛑 Parked deliberately: the Classified badge contrast (B-classified-dark)

The fix is not a one-liner and needs a decision I should not make alone.
`classified` is `bg-secondary text-white`, and `--appkit-color-secondary`
inverts between themes (magenta → cyan) — hence 2.43:1 in dark.

There is **no `secondary-solid` token**, and `secondary` is a FLAT string in
`tailwind.cjs`, so `bg-secondary-solid` would silently fail to compile — which
is precisely the Root Cause #67(c) trap (`danger` has the same shape). The real
options are (a) add a brand `-solid`/`-on-solid` family, touching `tokens.css`,
the Tailwind config and `audit-theme-drift`'s invariant-token allowlist, or
(b) move classified onto an existing status solid, which costs it its identity
colour and collides with pre-order's `info`.

Three other badges share the same shape — `prize-draw`, `art` and `stickers` all
pair a theme-relative brand fill with a literal `text-white` — so whichever
option is chosen should cover all four at once.

## A7. `/user/addresses/new` — "Address line 2" and "Landmark" are required EMPTY dropdowns

Found while testing the state picker (batch 61), and it is worse than the case
it turned up under.

Both fields render as real `<select>` elements with **zero options**, and both
are marked required (`*`). A buyer cannot satisfy a required field that offers
nothing to choose, so the add-address form appears uncompletable — the section
badge already reads "4 issues" on a form nobody has touched.

They should be text inputs: a landmark and a second address line are free text.

**Not a labelling illusion** — the page renders a correct Country picker
("India ▾") and a correct State / region picker right below them, so the two
option-less selects are genuinely the wrong control for those two fields rather
than mislabelled country/state controls.

**The state picker itself is fine** (both cases in that batch passed): it is a
constrained searchable dropdown, "karn" narrows it to Karnataka alone, changing
the country to Canada clears the state, and switching back to India does NOT
restore the previous selection.

No address was saved during this test — `addresses` is PRESERVE tier.

## A8. Raw Zod type errors are shown to sellers on `/store/products/new`

At 375px (and dirty), the Quick-add form renders three developer-facing
messages as field errors:

- Price → **"Invalid input: expected number, received undefined"**
- Product Image → **"Invalid input: expected string, received undefined"**
- Description → **"Invalid input: expected string, received undefined"**

These are Zod's default type messages, not authored copy, and they sit under
fields the seller has not filled in yet. The schema needs real messages
(`z.number({ message: "Enter the price." })` etc.) the way the address schema
already does ("Enter the street address.", "Enter the city.").

Worth pairing with the known rule that a validation summary must not accuse a
user before they have done anything — here the individual fields are doing it.

## A9. `/store/products/new` at 375px offers only 2 of 4 editor actions

The route serves a **"Quick add"** form on mobile — Product Name / Category /
Price / Product Image / Description — whose action bar has only **Save Draft**
and **Publish**. No Discard and no Preview exist anywhere on the page, with the
form dirty and after a full-page scroll.

The layout itself is fine: both buttons fit inside 375px on one line, nothing is
clipped, `scrollWidth === clientWidth === 375`. So this is a missing-affordance
question (is Quick-add *meant* to drop Discard/Preview?) rather than an overflow
bug — the case as written assumes the full editor.

## A10 (BLOCKING). The accepted-offer lane cannot be checked out — it is refused by its own guard

Buyer `rehan.sheikh@gmail.com`, cart holding exactly **one accepted offer**.

Checkout walks all three steps normally and Step 3 says:

> "You're paying for your accepted offers. The price is already agreed, so
> coupons don't apply and the rest of your cart stays where it is."

Tick "I understand how manual payment and refunds work" → "Pay via UPI / Cash"
enables → click. **Nothing is created.** The page stays on `/checkout` at Step 3
and prints, above the payment method:

> **"Complete your 1 accepted offer first — the agreed price is only held for a
> limited time."**

Clicked twice, the second time after confirming the checkbox was ticked and
scrolling the button into view. Same result both times, no order id anywhere.

So the page presents the offer lane as the thing being paid for, and the submit
is refused *because an accepted offer exists* — the lane guard is blocking the
lane it exists to protect. The buyer is deadlocked: they cannot pay for the
offer, and because the offer lane outranks standard they also cannot add or
check out anything else.

**Blast radius in this batch alone**: it took out `cod-order-places` (no order
placed), and made `manual-payment-proof-upload` and `payment-page-reachable-later`
untestable for want of an order awaiting payment.

### Clean on the same batch

- **Platform fee**: exactly one `Platform fee ₹10.00` line at Step 2 and Step 3
  (Subtotal ₹780.00, GST ₹1.80, Total ₹791.80). ₹10 is the documented cap, not a
  percentage of ₹780, so the cap is applied; single store, so no `× N` qualifier.
- **Manual-payment copy** is accurate — UPI id, 15-minute window, upload of
  UTR + screenshot, auto-cancel and stock release on lapse.
- **Coupons in the offer lane** are correctly absent, and the UI says why.
- **`/user/orders` maps rows properly** — "Order #9-CASH01, Beyblade Original
  Dranzer S ×1, ₹1,799.00, Processing" — in direct contrast to `/store/orders`
  (A5), which showed "Unknown buyer" and no product name on all 25 rows. Same
  collection, different mapper, so A5 is a seller-side mapping defect rather
  than purely a data-shape one.

### Test pollution noted, not removed

`/checkout` Step 1 lists **two "QA Address buying-checkout-shipping-address-inline-add"**
entries (1 Test Street, Mumbai 400001) left by earlier runs. `addresses` is
PRESERVE tier, so I did not delete them.

## A11 (PRIVACY). `GET /api/events/{id}` returns RAW lottery slots to anonymous callers

Verified signed out — `fetch(..., { credentials: 'omit' })`, HTTP 200. Each slot
of `event-pokemon-number-draw-july-2026` comes back with **all nine stored
fields**:

```
slotNumber, name, image, price, weight,
isBooked, bookedByUserId, bookedByDisplayName, bookedByUserLotteryNumber
```

A guest therefore receives, for every booked slot: the **buyer's display name**
(e.g. `"Ravi K"`), their **internal user id**, and their **lottery number** —
plus the per-slot **`price`** and **`weight`**, where weight is how the odds are
set.

The documented contract is the opposite. `toClientLotterySlot` is an **allow-list**
and the only slot field beyond `slotNumber` / `name` / `isBooked` that is meant
to reach a client is `image`; `price` and `weight` are explicitly "never
exposed". So this endpoint is serving the stored document rather than the
projection — the Root Cause #70 shape (raw document on a public surface), on the
events route.

Two distinct harms: PII (a uid paired with a display name and a lottery number is
identity linkage, not just a nickname) and business data (per-slot pricing and
weighting).

**Not the admin view leaking** — I checked as admin first, then repeated with
credentials omitted and got the identical payload.

### Also on this batch

- **Grouped-listing title edits DO persist** (changed → saved → reloaded → new
  value present; description untouched). The admin-PATCH-strips-unknown-keys
  defect does not reproduce. Title restored afterwards.
- **The booked-slot delete guard is untested** — the editor shows no booking
  state (by design; the write shape cannot express bookings), my row-targeting
  did not land, and I reloaded rather than save an unverified slot list onto a
  lottery holding five real bookings. Confirmed afterwards: 25 slots, bookings
  1-5 intact, nothing written.

🛑 **METHOD**: `document.querySelector('[name="description"]')` matches the
`<meta name="description">` in `<head>` before any form field. Its `.value` is
`undefined`, which reads exactly like a wiped field. Scope form selectors to the
form.

---

## A12 — `spinPrizes[].weight` and `.couponId` published to anonymous callers

**Found**: 2026-09-15, while *verifying* the A11 fix rather than from a case.
**Severity**: same class as A11 — outcome-deciding data on an unauthenticated,
edge-cached endpoint.

`GET /api/events` returned, for `event-daily-beyblade-pull-wheel`:

```json
"spinPrizes": [
  {"id":"spin-10pct","label":"10% Off Coupon","couponId":"coupon-rehan10","weight":15,"isActive":true},
  {"id":"spin-5pct","label":"5% Off Coupon","weight":25,"isActive":true},
  {"id":"spin-grip","label":"Free Launcher Grip Tape","weight":10,"isActive":true},
  ...
]
```

`weight` IS the odds — anyone could compute each prize's exact probability
before spinning. `couponId` names an internal coupon document id.

### Why it was missed the first time

The A11 fix projected `lotteryConfig` and nothing else, because that was the
structure the original report named. `spinPrizes` is a *sibling* field on the
same document with the same problem, and the deny-list spread published it for
the same reason. **Root Cause #84 again**: I fixed what I had enumerated by
hand rather than what the rule would have found.

The verification is what caught it — the post-deploy check greps the response
for `"weight"` rather than only re-reading the field I had just fixed.

### The type was lying, which is the durable lesson

`EventItem.lotteryConfig` is declared as `ClientLotteryConfig` — the
**already-projected** type. The repository hands back the stored document with
`price`, `weight` and `bookedByUserId` still on every slot. So the type asserted
the projection had happened while nothing performed it, and any reviewer reading
the route saw a correctly-typed public payload.

`toClientLotterySlot`/`Config` now accept either shape precisely so the adapter
can be applied to a value whose type is lying — which is where it is needed.

### Fix (appkit 4.41.6)

- `appkit/src/_internal/server/features/events/adapters.ts` — new
  `toPublicEvent()` / `toClientSpinPrize()`. Allow-list, not a spread.
- Both public event routes call it, so they cannot drift (Root Cause #75).
- `toClientSpinPrize` keeps `id`/`label`/`isActive` — verified to be the only
  three fields `SpinWheelView` reads. The winning prize is still resolved
  server-side in `assignSpinPrize` and returned as a coupon CODE.
- The return TYPE is narrowed, so a future caller reaching for `slot.weight`
  is a compile error rather than `undefined` at runtime.

### Verify after deploy

```bash
curl -s "https://www.letitrip.in/api/events?pageSize=20" | grep -c '"weight"'   # expect 0
curl -s "https://www.letitrip.in/api/events?pageSize=20" | grep -c 'couponId'   # expect 0
```

**A11 status**: the lottery half is CONFIRMED FIXED in production — slot keys are
now `slotNumber,name,image,isBooked,bookedByUserLotteryNumber,bookedByDisplayName`
with no `price`, `weight` or `bookedByUserId`.

This also un-blocks the tester case
`checklist-admin-events-raffles-spin-spin-wheel-create`, whose whole assertion is
"no weight values anywhere on the page or in its source" — it was recorded `null`
earlier in this run, and the thing it was written to catch was live at the time.

**A12 VERIFIED IN PRODUCTION** (appkit 4.41.6, deployed 2026-09-15):
`grep -c '"weight"'` on `GET /api/events?pageSize=20` is now **0**, down from 1.
The spin-prize odds are no longer public.

## A13 — an offer event still publishes an internal `couponId` (NOT fixed)

Same verification run found one remaining `couponId` in the events payload, on a
**different** field from the one A12 addressed:

```
"displayCode":"BUYNOW10","couponId":"coupon-buynow10"
```

This is an offer event's own promo block, not `spinPrizes`. Lower severity — no
odds are exposed and `displayCode` is a code the page shows buyers on purpose —
but it is still an internal document id on an unauthenticated endpoint, and it is
the same deny-list-spread cause.

**Deliberately not fixed in this pass.** Recorded for the pass-2 fix cycle. When
it is fixed, the right move is to extend `toPublicEvent` rather than add a third
projection site.

## Store directory findings (batch: public-pages/stores-sellers-directories)

Three defects on `/stores`, all measured against `GET /api/stores`:

1. **The rating facet is inert.** `?rating=5` returns both stores, whose real
   `averageRating` values are **4.1** and **3.6**. The filter badge increments to
   1 and the result set does not change — the exact failure shape the sibling
   `store-classified-live-facets-filter` case describes.
2. **`isVerified` is absent from the public store payload**, so no card can
   render a verified badge. Both seeded stores carry the flag in Firestore.
3. **`totalProducts: 0` on both stores**, including Beyblade Arena, which holds
   essentially the entire catalogue. A counter with no writer — the same shape as
   Root Cause #102's brand `metrics.productCount`.

Store SEARCH is correct and this re-confirms the Root Cause #99 fix:
`?q=zzzznope` returns 0 with a named "No stores found." empty state.

### Two more from the same batch, neither previously recorded

- **A suspended store is publicly browsable and badged "✓ Verified Safe".**
  `/stores/store-vintage-vault-co` renders in full to a signed-out visitor, with
  a green Verified Safe badge, while its own description reads *"Currently
  suspended pending a listing-authenticity review."*
- **Money sorts are offered to guests on store tabs.** The auctions tab's Sort
  dropdown offers a signed-out visitor "Lowest Current Bid", "Highest Current
  Bid" and "Buy It Now: Low–High" while the same cards read "Sign in to see
  price". Ranking hidden amounts is exactly the control § Guest price gating
  says is withheld (`withoutPriceSorts` / `MONEY_SORT_FIELDS`) — it appears the
  store-tab sort list does not go through that filter.
- **Store tab badges are all-statuses counts over available-only views.** Eight
  of eight mismatch on Beyblade Arena. Worst: "Prize Draws (1)" opens to
  "No prize draws found."
- **`/pre-orders` defaults to Newest First while the store's Pre-Orders tab
  defaults to Earliest Delivery** — the Root Cause #63 disagreement, present
  again with the two defaults swapped.

## Two blank/inert public pages (batch: stores-sellers-directories p2)

- **`/sellers` renders nothing.** HTTP 200, correct `<title>`, breadcrumb — and
  a completely empty content area. No heading, no cards, no empty state. Zero
  seller links in the DOM. `/api/sellers` returns HTML, not JSON, so there is no
  API behind the route. This is one of only four routes carrying a short ISR
  window, so it is a real prerendered page that prerenders to nothing.
- **The scam registry's search is inert.** `?q=zzzznope` and
  `?q=Bey_King_India` (an exact alias of one of the three profiles) both return
  all 3 rows. The page's own subtitle advertises "Search by name, phone, or
  UPI". Root Cause #99's shape, on the page where lookup IS the feature.
  There is also no status filter, only a scam-type dropdown and a sort.

## A14 — `/sell` logs the user out (BLOCKING for the whole seller-onboarding funnel)

Reproduced with both signed-in identities the harness holds.

| step | seller (tyson@beybladearena.in) | buyer (rehan.sheikh@gmail.com) |
|---|---|---|
| dashboard before | `/store` → Store Dashboard ✓ | `/user/orders` → renders ✓ |
| second nav (control) | `/store/addresses` → renders ✓ | — |
| **`/sell`** | → `/auth/login`, signed-out chrome | → `/auth/login`, signed-out chrome |
| dashboard after | `/store` → **bounces to `/auth/login`** | `/user/orders` → **bounces** |

The second dashboard navigation is the control that rules out "the session was
just flaky": it worked, then `/sell` broke it.

`curl /sell` returns **200 with no Location header**, so the redirect is
client-side. Root Cause #76 recorded `/sell` as *"returned HTTP 200 carrying an
error instead of redirecting"* because it read `ROUTES.USER.BECOME_SELLER` off
the `"use client"` entry. It now returns 200 carrying a page that **signs you
out** — a different failure on the same route, and still a 200 that no
monitoring flags.

Guest behaviour is correct (`/sell` → `/auth/login`).

**Consequence**: `/user/become-seller` is effectively unreachable from the
advertised entry point, which is why `apply-seller` could not be exercised.

## A15 — the storefront form can never be saved

`/store/storefront` loads fully populated for a real seller, and pressing
**Save Storefront** is rejected with:

> Please fix the following:
> **Branding:** Must be a stored media reference (`/media/<slug>`) or a URL on an approved CDN domain
> **Branding:** Must be a stored media reference (`/media/<slug>`) or a URL on an approved CDN domain

The store's seeded logo and banner are
`/api/media/ext?url=https%3A%2F%2Fplacehold.co%2F…` — neither a `/media/<slug>`
reference nor an approved CDN host. **And the form renders no logo, banner,
image or URL input at all** (enumerated every input on the page), so the seller
cannot correct the value that is blocking them.

Net effect: **no storefront change of any kind can be saved** — name, category,
bio or description — because an untouched, unreachable field fails validation.

Verified nothing persisted: description unchanged in the dashboard and in
`GET /api/stores/store-beyblade-arena` after reload.

Two candidate causes for pass 2, not yet distinguished: either the validator
should accept `/api/media/ext?url=…` (it is this app's own proxy), or the seed
should store branding as `/media/<slug>`. Either way the missing input is a
separate gap — a form must be able to edit the field it validates.

## A16 — leftover tester data in the PRESERVE-tier `addresses` collection

`rehan.sheikh@gmail.com` has **three** addresses and two are QA artefacts from an
earlier run, both labelled `QA Address buying-checkout-shipping-address-inline-add`
at "1 Test Street, Mumbai, Maharashtra 400001", differing only in phone
(9876543210 / 9999999999). That case's cleanup step evidently did not run.

`addresses` is PRESERVE tier, so nothing in the wipe removes them and they will
accumulate with every run of any address or checkout case. They also pollute the
Label dropdown, which derives its options from the labels present.

**Not deleted deliberately** — a wrong delete in a preserve-tier collection is
irreversible, and this is the user's call, not mine. Removing them needs a
targeted delete of exactly those two rows.

Related: `/user/addresses` offers **no filter drawer at all** — a Search box and
a Label dropdown, nothing else — against a case expecting Default and Standing
facets. The search itself is correct (`zzzznope` → 0, `Stadium` → only the
Stadium Lane address).

## A17 — admin "Reject" unpublishes a listing with NO confirmation (Rule #7)

`/admin/products` row menu → **Reject** fires immediately. No modal, no
`[role="dialog"]` in the DOM, just a toast reading **"Product updated."**

Verified it is not a no-op: `art-original-series-anniversary-print` went
`published` → `rejected` and vanished from `GET /api/products`. **Restored** via
Approve (also unconfirmed) and re-verified: status `published`, back in the
public list, detail page 200, `isFeatured` never touched.

This is exactly what Rule #7 / Root Cause #16 exist to prevent — a
status-changing action with no `confirmation` on its ActionDef. The generic
"Product updated." toast compounds it: nothing tells the admin the listing was
just taken off sale.

Smaller, same page: every row reads **"Unknown seller · No SKU"** — the
unresolved-identity shape already recorded on the seller orders list.

## Note for anyone automating the admin bundle editor

The member picker (`PaginatedSelect`) **only re-queries on genuine keyboard
events**. Setting `input.value` through the native setter and dispatching
`input` populates the visible field and returns **zero** options; a single real
`Backspace` keystroke immediately brings the matching products back.

That cost most of a batch. Use real keystrokes (`browser_press_key`) for this
control, and do open → type → select inside ONE evaluate, because any
intervening MCP call (including a screenshot) blurs the dropdown shut.

**Unresolved, flagged rather than scored:** with name, price and two members all
visibly populated, `Create bundle` returned *"Bundle name is required / Bundle
price must be a positive number / Bundle members: This field is required"*. That
would be a Root Cause #98-family defect (validator reading different state than
the inputs show) — but my inputs were synthetic, so it could equally be my own
artefact. **Needs one clean real-keystroke run to settle.** The cross-store guard
itself was never reached.

Counts so far this session: 81 of 226 batches recorded.

## A18 — `/store/grouped-listings` renders every row blank

Ten rows, each showing only a placeholder link icon, an em-dash and Edit/Delete.
No title, no member count. `GET /api/store/grouped-listings` returns all ten
titles, so the data is there and the row mapper never reads it — Root Cause #52's
shape.

**Not cosmetic.** With every row blank there is no way to tell which row is
which. The first row's Edit resolved to "App Unlock Codes" — a seeded group — so
deleting by guess would have destroyed real content. I had to match by index
against the API and verify through Edit before deleting my own test row.

Same page: **Delete fires with no confirmation dialog** — the second Rule #7 gap
found this session, after the admin products Reject (A17).

Also on the grouped-listing create form: `coverImage` is a **plain text field**
and the page has **zero file inputs**, so the "attach an image" step several
cases describe cannot be performed there at all.

The feature itself works — a group created with 2 members and `minActiveMembers: 2`
reloads with both intact.

## A19 — `/seller-guide` is the SECOND completely empty public page

Same shape as `/sellers`: HTTP 200, correct `<title>`, breadcrumb, then nothing.
`main`'s innerText is **0 characters** after a 7-second wait.

Its children are fine — `/seller-guide/bundles` renders "Bundles Guide" and
`/seller-guide/prize-draws` renders "Prize Draws Guide". Only the index is blank.

### Full public link sweep (52 distinct header + footer destinations)

- **All 52 return HTTP 200. None redirects back to the homepage.**
- **2 render nothing**: `/sellers`, `/seller-guide`.
- 4 look broken in raw HTML and are not — `/classified`, `/digital-codes`,
  `/live` and `/promotions` are client-side redirect stubs (to
  `/products?listingType=…` and `/promotions/deals`) with real content once
  hydrated. A crawl-style check that reads SSR HTML flags them as h1-less; they
  are fine.
- `/cart`, `/user/profile`, `/user/become-seller`, `/store` show sign-in chrome
  to a guest, as they should.

Correction to my own first pass: I flagged `/brands` as empty from a zero-anchor
probe. It renders four real brand cards. Reading the screenshot caught it.

## A20 — the carousel editor opens BLANK, and saving would unpublish the hero

`/admin/carousels` correctly lists **Homepage Hero · active · 5 slides** (this is
the 4.41.3 `extractCarouselRows` fix holding). Clicking **Edit carousel** opens
`/admin/carousels/carousel-hero-default/edit` with:

| field | editor shows | actual value |
|---|---|---|
| Carousel name * | **empty** (placeholder only) | Homepage Hero |
| Status | **Draft** | active |

Re-read after a further 8s — unchanged. The page knows the record: the breadcrumb
reads "Carousel hero default / Edit" and the back-link reads "← Homepage Hero".

**The Status default is the dangerous part.** Save is disabled while the required
name is empty, so it cannot be saved blank — but an admin who types a name to
satisfy that field and saves **also flips the site's hero carousel to Draft**,
having never touched the status control. The homepage carousel would go dark.

Nothing was saved; the carousel is still `Homepage Hero / active / 5 slides`.
Note the case's own last step ("set both back to their original values") is
impossible here — the editor cannot show what they were.

Root Cause #98 family: an editor seeded from the wrong source, or not seeded.

### Confirmed still-fixed this batch

- **Lottery is in the event type picker** — all 8 real `EventType` values, no
  invented ones. `lotteryInTypePicker: true`.
- **A non-tester's `/user` sidebar has no Testing group** — Profile, Orders,
  Shopping, Selling, Account, Browse, Support; the word "Testing" appears
  nowhere, zero tester-hub links.

## A21 — Site Settings renders ZERO input fields on every tab

`/admin/site` routes correctly — `?tab=fees` → Fees, `?tab=themes` → Themes, no
param → Branding, `?tab=nonsense` and `?tab=` both fall back to Branding with no
error. The URL is genuinely read.

**But every tab renders a heading, one collapsed accordion labelled with the tab
name, and "Save all changes" — and nothing else.** Input elements (excluding the
sidebar search and newsletter box): **0 on Fees, 0 on Themes, 0 on Branding**,
each after a 9-second wait. Clicking the Fees accordion header directly did not
change the count.

The selector offers **20 tabs** — branding, appearance, themes, announcement,
seo, contact, watermark, fees, integrations, shipping, auction, limits, legal,
whatsapp, notifications, procurement, emi, gst, listings, about — so on this
evidence none of the site's configuration is editable through the UI, while a
Save button invites the attempt. I did not press it.

**Possibly the same root cause as A15** (storefront form): both are settings
surfaces where the section chrome renders and the fields do not reach the user.
Worth triaging together.

## OG images — Root Cause #93's fix CONFIRMED in production

`seo/og-images`: **5 yes, 0 no, 1 null.** No rupee symbol on any of the six cards
the case names (product, bundle, classified, digital code, live item, prize
draw), nor on the auction or brand cards.

The evidence is exact rather than visual: every one of those `og:image` URLs is
the record's own image proxied through `/api/media/ext`, and what such an image
renders is fully determined by its `placehold.co` `text=` parameter. Decoded,
they read only titles. **Structurally there is no longer a surface a price could
be burned into** — these are photographs, not composited price cards.

Homepage card renders properly (200, image/png, 121 KB, 1200×630, brand gradient
+ wordmark + strapline). Brand cards carry their cover image, not an empty slot.
All four OG tags present on product/store/blog, absolute, on the canonical host.

### Two observations that did not fail a case

- **Product OG images are 900×900 (1:1)** while pages declare
  `twitter:card=summary_large_image`, which wants ~1.91:1. Platforms will crop or
  letterbox. The homepage and brand cards are correctly 1200×630.
- **The store page's `og:image` carries an `/en` prefix**
  (`/en/stores/store-beyblade-arena/opengraph-image?<hash>`) while its canonical
  is the unprefixed path. Still absolute and on the canonical host, so no case
  fails — but `/en/...` is the spelling that pays a 307, and a crawler fetching
  the card follows that hop.
- The product card's *title* is legible only because seed images are
  `placehold.co` text placeholders. Real photography would carry no title.

## 🛑 A10 ROOT-CAUSED — the accepted-offer lane is a dead end, and it blocks the whole buying funnel

The cart's lane tabs read **`Cart (1) | Won Auctions | Accepted Offers (1)`**.
The Accepted Offers lane holds *Beyblade Burst Valkyrie* at ₹780 with a padlock
reading **"🔒 Offer accepted — payment required"**, above a banner:

> **"Accepted offers must be paid. These items cannot be removed from your cart."**

That directly contradicts the documented rule in CLAUDE.md § Checkout Lanes:

> **Accepted offers are NOT locked** — declining to buy is the buyer's right; the
> offer lapses at its `checkoutDeadline` instead.

### Why it is a dead end, not an inconvenience

The offer lane **outranks** the standard lane (`CART_LANE_PRIORITY`), so:

- every **Add to Cart** is refused — *"Complete your accepted offer first — you
  can add other items once it's paid for."*
- the standard lane's **"Proceed to checkout" is disabled**, even though that
  lane holds a real line (Valkyrie ×1, ₹999.00, fee ₹10.00, GST ₹1.80, total
  ₹1,010.80)
- and the buyer **cannot remove the offer line to escape**, because the UI has
  made it non-removable

So the buyer can neither shop nor check out, and the only exits are paying the
offer or waiting for `checkoutDeadline` to lapse. The fix is to restore
removability on offer lines — the lock belongs on won-auction lines only.

**Blast radius, measured:** it blocked **10 of 12** cases in
`buying/buying-checkout--p1` alone. Every case beginning "Add to Cart" is
unreachable while any accepted offer is pending, which is most of the buying
funnel.

### Two smaller things seen alongside

- **A generic error rides along with the real message.** Add to Cart raises BOTH
  *"Complete your accepted offer first…"* AND *"Something went wrong. Please try
  again."* — a refusal by design should not also report a fault.
- **A raw field name leaks into buyer copy.** The cart line renders the literal
  string `storeName: Beyblade Arena` beneath the product title.

### A10 — unblocked via the documented admin escalation (state change recorded)

To stop A10 blocking the rest of the buying catalogue I cancelled the offending
offer through the admin UI — the escalation CLAUDE.md § Offer Lifecycle
describes for exactly this ("a leftover locked line keeps the buyer's offer lane
non-empty, and since that lane outranks the standard one it blocks their ENTIRE
cart").

- **Offer cancelled**: `offer-yugi-burst-valkyrie-pending` (Beyblade Burst
  Valkyrie, ₹780, Mock User 3 → Beyblade Arena), `accepted` → **`expired`**.
- Reason given: *"QA run: clearing a stuck accepted-offer lane that blocks the
  buyer cart."*
- **Verified unblocked**: Add to Cart as the buyer now succeeds —
  *"Beyblade Burst B-01 Valkyrie" added to cart — 2 items, ₹1,998.00 total*.

The cancel dialog's own copy confirms the intended design, and contradicts the
cart UI's banner: *"The offer will be expired and **removed from the buyer's
cart**."* So the server-side path does remove offer lines; it is the cart that
wrongly presents them as non-removable by the buyer.

**Seed-state note for later batches**: a second accepted offer remains —
`offer-kaiba-dranzer-s-accepted` (₹1,250, Mock User 2) — so the `accepted`
fixture is still represented. All 7 offer statuses are still present in the data
(accepted / pending / countered / withdrawn / expired / declined / paid).

**This does NOT close A10.** The defect is the cart's refusal to let a buyer
remove an accepted-offer line; that is still live. Only this run's blockage was
cleared.

## Manual-payment flow is ALIVE — Root Cause #57 confirmed fixed end-to-end

With the offer lane cleared, a full checkout ran through:

`/cart` → **Step 1 of 3: Shipping Address** → **Step 2 of 3: Extras & fees** →
**Step 3 of 3: Payment** → order `order-2-20260915-nb54aj` →
`/user/orders/{id}/payment`.

That last page is the one Root Cause #57 recorded as dead — every buyer used to
be told *"This order does not require manual payment upload."* It now renders in
full:

- **"Time remaining: 14:50"**, ticking (read 14:30 twenty seconds later)
- *"Pay and upload proof before the window closes, or the item returns to stock
  and your order is cancelled."*
- **Step 1** — a real UPI payee to transfer to
- **Step 2** — screenshot upload, `transactionId` (UTR), `buyerReportedUpiId`,
  and the two declarations (`buyerMarkedPaid`, `buyerFraudAgreementAccepted`),
  plus **Submit Proof**

Totals check out along the way: Subtotal ₹1,998.00, **Platform fee ₹10.00**
(once per checkout, matching the documented ₹10 cap even with 2 items),
GST ₹1.80, Total ₹2,009.80. No OTP interstitial at that value, correct for the
₹5,000 threshold.

### Left deliberately unpaid — it is this run's cleanup mechanism

`order-2-20260915-nb54aj` was left unpaid on purpose. It is the natural fixture
for `payment-window-expiry`, and the 15-minute sweep cancels it and returns both
Valkyrie units to stock, so **the run leaves nothing to tidy by hand**.

### Two things worth a look

- **The payment-screenshot uploader offers "YouTube" and "External URL" tabs.**
  A YouTube tab on a payment-proof control is hard to justify and widens what a
  buyer may submit as evidence to a human reviewer.
- I **declined to submit proof**. Doing so means ticking *"I confirm I have
  already made this payment"* and *"I confirm this payment is genuine"* for a
  ₹2,009.80 transfer that did not happen, and putting a fabricated proof into a
  real admin review queue. That is a false statement to a person, not a test
  artefact the run can clean up.

## A22 — the manual-payment CONSENT GATE is bypassable from the sticky bottom bar

Step 3 renders a consent checkbox, *"I understand how manual payment and refunds
work"*. With it **unchecked**:

| button | state |
|---|---|
| in-card `Pay via UPI / Cash` (300px) | **disabled** ✓ |
| sticky-bottom-bar `Pay via UPI / Cash` (222px) | **enabled** ✗ |

And it submits. **`order-2-20260915-nb54aj` was placed through that bottom-bar
button with the consent box never ticked.** Ticking the box enables both, which
is the correct end state — the gate simply is not the only door.

Cause, as far as the UI shows: the bottom-chrome action bar publishes a duplicate
primary CTA that does not inherit the card button's `disabled` state. Same tier
as the `useBottomActions` / `BottomChrome` work in CLAUDE.md § "The bottom edge
is three tiers".

### Passes alongside it

- **Mobile checkout is clean.** Ran the whole flow at 390×844 measuring
  `scrollWidth` vs `innerWidth` at every stage — 390 === 390 throughout, product
  page to payment page. Cards stack, the CTA moves into a sticky bar with the
  running total, and the order completed on mobile.
- **Consent-then-pay places the order with no validation error** —
  `order-1-20260915-dhf7oy`, straight to Complete Payment with a 14:49 countdown,
  zero error text.
- **Add-on fees itemise and add up.** Ticking *WhatsApp order updates (+₹10.00)*
  added its own summary line and moved the total ₹1,010.80 → **₹1,020.80**,
  exactly +₹10.

Both test orders were left unpaid and auto-cancel with their 15-minute windows.

## A23 — the cart's sign-in prompt DROPS the return-to-checkout redirect

The two routes to sign-in are not equivalent:

| path | result |
|---|---|
| navigate to `/checkout` signed out | `/auth/login?redirect=/checkout` ✓ |
| press **Go to Login** in the cart's "Sign in required" modal | `/auth/login` — **no redirect param** ✗ |

So a guest who fills a cart and presses *Proceed to checkout* loses the return
intent at exactly the moment it matters. That is the "lands on the homepage
instead of checkout" failure the case is written against; I can evidence the
missing mechanism, though not the final landing (signing in is off-limits to a
batch).

**Everything before that step is sound**: the guest cart persists in
`localStorage.guest_cart` as one line, `/cart` renders it at ₹999.00, and the CTA
opens a proper "Sign in required" modal rather than dropping the click.

Smaller, same batch: **adding to the cart as a guest raises an "Authentication
required" ERROR toast beside the success toast** — a working path reporting a
failure it did not have. Third instance of this shape today, after the
offer-lane block and the admin Reject.

**Guest `/checkout` protection itself is correct**: 0 address fields, no "Step N
of 3", no spinner left turning, `main` innerText 132 chars — the sign-in panel
and nothing else.

## Prize draws — the fairness guarantee holds; the editor is missing its own fields

**Confirmed good (2 passes):**

- **An admin cannot choose who wins.** Expanded every section of the prize-draw
  admin editor and enumerated all 18 fields — zero match
  `winner|assign|choose|pick`. There is no control for nominating a winner,
  biasing an outcome, or re-running a draw.
- **The winner mapping is staff-only and carries no buyer identity.**
  `/admin/prize-draws/{id}/entries` is headed "… — Winner Mapping" under
  *"Visible only to you — buyers never see which item went to which order."*
  Columns ITEM / STATUS / ORDER; the join key is the **order**, and the table
  contains **zero emails and zero buyer names**. Verified on two draws.

**Worth a look:** the prize-draw editor at `/admin/prize-draws/{id}/edit` carries
only **generic product fields** — no reveal-mode selector, no draw duration, no
prize list — even after expanding every collapsible section. The `prizedraw-create`
case expects all three. Either those controls live on the product-creation surface
(the case starts at `/admin/products`) or they are absent; I did not create a draw
to find out, because that case leaves a live purchasable listing behind for the
next two cases to consume.

Two clauses I could not satisfy and did not paper over: the entries view offers
**no search input**, so the case's nonsense-search control has nothing to type
into; and the admin surface **never describes the reveal mechanism** — the
guarantee is enforced by the absence of controls rather than stated. (A promising
"Fair" match turned out to be a value in the Condition dropdown.)

## A24 — the spin wheel is server-DISABLED but the UI offers it and says "try again"

`POST /api/events/event-daily-beyblade-pull-wheel/spin` returns:

```
503  {"ok":false,"success":false,"code":"INTERNAL","error":"feature_disabled"}
```

The Participate tab nonetheless renders a **fully enabled Spin button**, and the
failure surfaces as **"Spin failed. Please try again."** — a permanent policy
refusal presented as a transient fault, inviting indefinite retrying.

Two details for the fix: the code is **`INTERNAL`** for what is a deliberate
feature gate, not an internal failure; and the page never states a spins-per-user
maximum either (no "spins left" / "maximum" / "per user" copy anywhere), so the
sibling case has nothing to read even before it has nothing to spin.

**Good news on A12 from the same page**: the spin-prize `weight` leak has NOT
resurfaced publicly — zero `"weight"` JSON keys in the rendered HTML. (An earlier
true match on the Overview tab was the CSS word *font-weight*, caught by looking.)

## A25 — a poll shows no already-voted state; the limit is enforced server-side only

Voting works and is recorded: *"Vote recorded!"*, results switch to percentages,
participants **362 → 363**.

But revisiting the event shows the poll exactly as before — all 5 radios back,
unselected, **Cast Vote** live, and no "you already voted" text anywhere.

**It is a UI defect, not ballot-stuffing** — and the distinction matters. I voted
a **second** time for a different option: participants stayed at **363**, so the
server counts one participant per user. The UI still said *"Vote recorded!"* for
a vote that changed nothing.

Two smaller notes: this event has **no Participate tab** (Overview + Leaderboard
only), so the case's step 2 cannot be followed as written — voting is inline on
Overview, which is what its own *label* says. And one of the five options in
"Best Blader of the Original Beyblade Series" is literally **"Mock User 6"**, a
seeded persona name sitting beside Kai Hiwatari, Max Tate, Rei Kon and Kenny.

## 🛑 A25 CORRECTED — the poll DOES accept two votes from one user

My earlier note said the one-vote-per-user limit was enforced server-side because
the participant count did not move on my second vote. **That was a timing
artefact and the correction matters**, because it changes the severity from a UI
gap to ballot-stuffing.

Measured across the session: **362** before I voted → **363** after my first vote
→ **363** immediately after my second → and now **364**, confirmed independently
by `GET /api/events` reporting `stats.totalEntries: 364` and
`approvedEntries: 364`.

Two votes from one signed-in user, two increments. The count simply lagged when I
read it. I cannot fully exclude a concurrent voter, but the arithmetic matches my
own two votes exactly, and the UI never once showed an already-voted state.

**So `votesPerUser: 1` does not hold.** Combined with the missing already-voted
state, a user can re-vote indefinitely and the UI encourages it — each attempt
answers "Vote recorded!".

## A26 — the poll Leaderboard says "No votes yet." against 364 recorded votes

The Leaderboard tab renders **"No votes yet."** while, on the same page:

- the header reads **Participants: 364**
- `GET /api/events` reports `stats.totalEntries: 364`, `approvedEntries: 364`
- the **Overview** tab renders real percentage results for all five options

The leaderboard is reading an empty source while everything else reads a
populated one. (The "not a list of voters" clause holds trivially — there are no
rows at all, so no identities leak.)

## A27 — the spin-wheel event has no "Last 10 Spin Results" tab

Tabs are Overview / Participate / Leaderboard plus a Spin control. Zero matches
for "Last 10" and zero for "Guest" anywhere on the page. Almost certainly the
same root as **A24** (the spin endpoint is `feature_disabled`) — a results tab
for a feature nobody can use would have nothing to list.

### Passes in the same batch

- **8/8 event cards carry real 1200×600 covers**, zero broken after a full scroll
  cycle. The emoji in the text are *type badges*, not placeholders — checked.
- **The lottery cover renders on both surfaces**, zero 🎰 placeholders. (Its hero
  is intrinsically 269×99 shown at 736px, so it upscales ~2.7× and will look soft.)
- **Related Events** carousel is populated with real cards and **zero self-links**.
- **Event detail pages load correctly** — badges, dates, participants, share
  control, and tabs that are real routes rather than client-only state.

Note: event cards link to **unprefixed** slugs (`/events/favourite-blader-poll`)
while the checklist refers to `event-`-prefixed ids. Both resolve; worth knowing
before scripting against the ids.

## 🛑 A26 ROOT-CAUSED — `/api/admin/events/{id}/entries` returns `{}`

The empty leaderboard is one symptom of a broken endpoint, not a rendering bug.

| endpoint | result |
|---|---|
| `GET /api/admin/events/{id}/entries` | **200, body literally `{}`** — no `data` key |
| `GET /api/admin/event-entries?eventId={id}` | **200 with real rows**, `total: 10` |

The data is fine; one of the two routes that serve it is not. **Both** the admin
per-event entries page ("No entries found") and the public poll leaderboard
("No votes yet.") go dark, while the stats counter and the Overview percentages
read the working path.

### A25 now CONFIRMED beyond doubt — and it is ballot-stuffing

The working endpoint lists the actual rows, and two of them are mine:

```
cqr8afg9LzitynMcVe   user-yugi-muto   pollVotes: ["kai"]
WEcbg02e6z2xdHy4EQ   user-yugi-muto   pollVotes: ["tyson"]
```

**One uid, two entries, two different options** — exactly my two votes. No
concurrent-voter ambiguity remains. `votesPerUser: 1` does not hold, and the UI
never shows an already-voted state, so a user can re-vote indefinitely.

### A28 — the event's entry counter is inflated ~36×

`stats.totalEntries: 364` and `approvedEntries: 364`, against a real entry count
of **10** from the working endpoint. A counter with no relationship to the rows
it claims to count — the same shape as the category/brand `metrics.productCount`
drift already on record (Root Cause #102 family).

Smaller, same page: the admin events list renders **raw ISO timestamps**
(`2026-09-22T00:29:17.674Z`) instead of formatted dates.

## Form validation — Root Cause #74's fix CONFIRMED, plus one a11y gap

**3 yes, 1 null.** `/user/addresses/new` behaves exactly as the #74 rework
intended:

- **Nothing before submit.** 0 `aria-invalid`, 0 `role=alert`, no summary — the
  regression where a schema-driven form accuses the user of six missing fields
  on first paint is gone.
- **After Save, an itemised, section-prefixed summary** in authored English:
  *"Address: Give the address a label."*, *"Where: Enter the city."* — seven
  entries, plus per-section badges (`Where · Required · 4 issues`).
- **Live on change**, measured with counts: filling one field took the summary
  **7 → 6**, removed that field's inline message (1 → 0 occurrences), and
  re-rendered the badges as `2 issues` / `4 issues`.
- **Inline errors still render under their fields** — the summary supplements
  rather than replaces them.

### 🛑 The one real gap: inline errors are invisible to assistive technology

After submit there are **0 elements with `aria-invalid="true"`** and **0
`role="alert"` nodes** inside the form. The six inline messages are visible red
text with no programmatic association to their inputs. A screen-reader user gets
the summary at best and no per-field signal at all.

I only caught this because my probe's result contradicted the screenshot — the
probe said "no errors", the picture showed six.

### 🛑 Correction to my own earlier note this run

I previously recorded that `/store/products/new` showed **raw Zod messages**
("Invalid input: expected number, received undefined") on Price, Product Image
and Description. **That is not what it does.** I searched the rendered page for
`Invalid input:` and for `expected … received …` and matched **neither**. Every
message is authored copy: *"Title must be at least 3 characters"*,
*"Category is required"*, *"Price is required"*, *"Product image is required"*.

Also: that route is **not a multi-step wizard** — it is a "Quick add" modal with
four fields and no step indicator, so the step-tagging case cannot be tested
there. Section tagging clearly exists in the codebase (the address form does it);
the case needs re-pointing at a real wizard.

## 🛑 A29 — a seller cannot publish a product: Publish fails with a bare "Invalid URL"

Filled the Quick-add form completely — title, price 499, stock 5, description, a
category from the real picker, and an image uploaded from disk through the form's
own control — then pressed **Publish**.

The only response is a toast reading **"Invalid URL"**. No field highlighted, no
summary, modal stays open. `GET /api/products?q=QA%20Product` returns **0**, so
nothing was persisted.

**It is almost certainly the image** — the only URL-shaped value on the form, and
the cropper hands back a locally-generated blob/data URL. That makes this the
same family as **A15** (storefront settings rejecting every save with *"Must be a
stored media reference (`/media/<slug>`) or a URL on an approved CDN domain"*): a
media value the app itself produced, failing the app's own media validation.

The difference is that this toast does not name the field or the expected shape,
so a seller has no way to act on it.

### The upload path itself is sound — the failure is at validation

- **`media-upload` passes**: file chooser arms correctly (`accept="image/*"`), the
  file attaches, and a **Crop Image** step opens showing the real uploaded bitmap
  (intrinsic 256×128). Saving the crop clears the image field's error.
- **`media-upload-preview-no-white-box` passes**: real preview inside ~1s, and
  **zero** images anywhere with `naturalWidth === 0` above 40px wide.

### A30 — the crop tool has no aspect lock

The Crop Image modal offers reposition + zoom only. Enumerated every button:
`×, 50%, 100%, 150%, 200%, Reset, Save Crop, Cancel` — **zero** aspect presets
(no 1:1, 4:3, 16:9 or free). The crop frame measures 384×280, i.e. **1.37:1**,
not square. The case asserts a working 1:1 lock.

### Scope notes for the four untestable media cases

Quick-add has a **single** image slot: its file input is not `multiple`, there is
no gallery or add-more control, and it declares `accept="image/*"` with the hint
*"JPG PNG GIF WebP — max 10MB"*. So multi-image upload, per-image removal and
video-duration capture cannot be exercised here at all — those cases need the
full product editor, not this modal.

One measurement correction worth keeping: my first probe reported a 561-byte
"preview" of 374×132 — that was the **UPI payment icon in the footer**, not the
upload. The screenshot settled it.

## Seller product editor loads POPULATED — the blank-form defect is not present

Worth recording as a confirmed-good, because it was a live concern: opening
`/store/products/product-beyblade-burst-valkyrie/edit` renders **18 populated
fields** with `title` = "Beyblade Burst B-01 Valkyrie". The Root Cause #98-family
blank editor (an `ActionResult` envelope spread as if it were the payload) does
**not** reproduce on this route today.

It also carries the video plumbing the checklist expects: a **Media** section with
**Upload / YouTube / External URL** tabs, plus `externalVideoUrl` and `youtubeId`
fields.

## Video sources — partial verification, no save performed

The YouTube-sourced fixture renders its video slide correctly: a 3-thumbnail
strip whose third entry is **800×450** (16:9 poster) with a play badge, and
selecting it advances the gallery to **3 / 3** with a large play overlay.

Crucially **zero** occurrences of *"No video with supported format and MIME type
found"*, and **no `<video>` element carrying a YouTube watch URL** — the Root
Cause #49 regression is absent.

Playback itself is unverified (the lightbox did not open from my click), and I
**declined the save** the case's procedure requires: this run has already shown
seller publishes failing with "Invalid URL" and a documented path where a save
writes `draft` over a published listing. Saving a real live product to satisfy a
test is the one irreversible step available here.

## The seller quick-add is a centred MODAL, not a side drawer

`New Listing` → `/store/products/new` renders a modal measured **1024×800, left
edge x128, right edge x1152** in a 1280 viewport — inset on both sides, attached
to neither edge, close control top-left.

So `seller-quick-add-drawer-flips` has nothing to measure: a centred modal has no
edge for Left-hand mode to flip. I did **not** toggle the preference — it is a
write to a real account's settings, and with the premise already false it could
not have changed the outcome. The case needs re-pointing at a real `SideDrawer`
surface, or rewriting to describe the modal.

## A31 — Site Settings renders NO fields for any section (admin)

**Surface** `/admin/site` as `admin@letitrip.in`.

**Symptom.** The section dropdown offers nineteen entries (⓪ About … ⑱ Listings)
and switching it changes the heading, but the panel below it is empty. With
`③ Announcement` selected, `<main>` contains one heading ("Site Settings"),
**0 labels, 0 `role="switch"`, and 2 inputs — both page chrome** (the sidebar's
"Search navigation…" box and the footer newsletter email). `① Branding`, which
is what renders on load, is identically empty.

**Why it matters beyond one case.** `Save all changes` sits under the empty
panel. Site Settings is PRESERVE tier; a save from a form that rendered no
fields is how the settings document gets blanked. Not pressed.

**Blocks** the Legal section too (verified 2026-09-15: section select = `legal`, 0 textareas in `<main>`, no "Our Ethics" string, 531 chars total — so Branding, Announcement AND Legal all render empty). Also blocks `cta-layout/navbar-ctas--admin → announcement-bar-message-renders`
(recorded `no`, failedAtStep 2 — the control is absent, not refused), and every
other case that configures anything through Site Settings.

**Evidence** `shots/admin-site-announcement-empty.png`.

## A32 — Public nav marks no section on detail pages

**Surface** any `/products/<slug>`, signed out.

`/products` marks **Products** with `aria-current="page"` and `/events` marks
**Events**; `/products/product-beyblade-metal-dark-bull-video-demo` marks
**nothing at all**. The match is exact-pathname rather than section-prefix. The
page knows where it sits — its own breadcrumb reads Home / Products / … — so the
information exists and does not reach the navigation. Browser-back is not
implicated (it restores the URL correctly and the mark is absent for the same
reason).

**Evidence** `shots/nav-active-detail-unmarked.png`.

## A33 — Guest cart shows "SOLD BY UNKNOWN"

Two Beyblade Arena products added to a signed-out cart render under a seller
header reading **UNKNOWN**. The signed-in cart names the store correctly, so the
store name is lost specifically on the guest path. Aside, found while testing the
header badge (which itself passed cleanly: `(none)→1→2` live, and `/cart` agreed
at 2 lines / 2 units / ₹1,998).

**Evidence** `shots/header-cart-badge-guest.png`.

## A34 — Help/how-it-works pages state things the product does not do

Five separate doc-vs-reality defects, all guest-visible, all money- or
support-facing:

| Page | Says | Reality |
|---|---|---|
| `/how-orders-work` | **"Out for Delivery"** is an order status, with its own icon and description | No such status. `/user/orders` shows Processing / Confirmed / Shipped / Return Requested; the page never names Refunded, Return Requested or Returned |
| `/how-offers-work` | counter "within **20%** (above or below)" | Form on a ₹999 listing enforces `min=699.3` (**30% below**) and `max=998.99` — **above list is refused outright** |
| `/how-checkout-works` | 5 stages: cart → address → payment → **Confirm Your Order** → confirmed | Checkout is "Step 1 of 3": address → **Add-ons & fees** → payment. The add-ons step — WhatsApp ₹10, gift wrap ₹49, shipment protection ₹61.94 — is **not mentioned anywhere**, and the promised Confirm step does not exist |
| `/how-auctions-work` | "you have **48 hours** to complete payment. If you do not pay within **3 days**…" — one paragraph | Self-contradictory. Also promises a reserve indicator and a minimum-bid figure on every listing; a real live auction shows neither |
| `/fees` | "**Buyer Fee 0%** — Buyers pay no platform fee" | The cart charges the buyer **"Platform fee ₹10.00"** + "GST ₹1.80" |

## A35 — `/track` invites an action it does not provide

The page renders "Enter your order ID or tracking number to get real-time
updates on your shipment" and contains **no order-ID or tracking input** — the
only input in the document is the footer newsletter email. A guest is offered
Sign In / View My Orders instead. Its explainer also introduces a third status
vocabulary ("In Transit").

**Evidence** `shots/track-no-input.png`.

## A36 — `/help` promises search it does not have, and links 4 of 7 guides

Intro reads "Browse our help topics **or search** for answers"; zero search
inputs on the page. Links `how-auctions-work`, `how-offers-work`,
`how-payouts-work`, `how-pre-orders-work` — **not** `how-checkout-works`,
`how-orders-work`, `how-reviews-work`, all three of which exist and render.

**Evidence** `shots/help-page.png`.

## A37 — No way to leave a review from a product page

Searched every button and link on `product-beyblade-burst-valkyrie` for
write/leave/add review: **none**, and no eligibility message either. The account
carries 20 reviews, so a route exists — just not the one `/how-reviews-work`
implies.

## 🛑 Harness note — identity swaps need TWO `browser_close` calls

The MCP server writes the live storage state back to `session.json` on teardown,
so `close → cp → navigate` silently clobbers the file you just copied and the
next batch browses as the PREVIOUS identity. Twice this session a batch opened
as the buyer when admin/guest had been copied. Working sequence:
**`browser_close` → `browser_close` → `cp` → navigate → verify the account name
on the page before touching anything.**

## A38 — Admin cannot create a bundle: the member picker's selection never reaches validation

**Surface** `/admin/bundles/new` as `admin@letitrip.in`.

Name `QA Bundle admin-create`, price `1500`, source "Hand-picked products",
two members chosen through the real picker. The picker label reads **"2
selected"** with both chips rendered — and `Create bundle` fails with:

```
Please fix the following:
  Bundle: This field is required
  Bundle members: This field is required
```

URL stays `/admin/bundles/new`; nothing is created. Same family as the seller
listing form rejecting an image it had just accepted (A29) — an authoring form
that cannot save.

🛑 **Reproduction note**: the picker only registers on *genuine* interaction. A
programmatic `option.click()` leaves it at "Search and select products…". Type
into the search and click the option for real, or you will misdiagnose this.

**Evidence** `shots/admin-bundle-create-blocked.png`.

## A39 — Bundle editor's Brand picker offers only "No specific brand"

Same editor. `select[name=brandSlug]`, labelled **Brand**, helper "The bundle's
own brand tag — independent of how its members resolve" — **one option**.
Takara-Tomy and Beyblade are absent, so no brand can ever be saved onto a
bundle. The brand rows exist (the public `/brands` page renders real cards), so
the picker is failing to load its options.

**Evidence** `shots/admin-bundle-editor.png`.

## A40 — `/user/orders` has no order-TYPE filter

Documented behaviour is All / Normal / Auction wins / Offer wins driven by
`OrderDocument.orderType`. The page offers only the SCOPE tabs — Active /
Closed / All — and zero controls named Normal, Auction wins or Offer wins
anywhere, including inside the Filters toolbar (which holds an order-id search
and a four-option sort). A buyer cannot separate an auction win from an
ordinary purchase.

## A41 — Four broken thumbnails on `/user/orders`

14 images wider than 30px, **4 with `naturalWidth === 0`** — laid out at full
size, loaded nothing. The order DETAIL page is clean (3 images, 0 broken) off
the same denormalised `items[]`, so it is the list's own image resolution.

**Also**: a search returning zero rows renders **no empty state at all** — no
message, no clear-search affordance, just an empty region.

**Evidence** `shots/my-orders-list.png`.

## A42 — Claiming a coupon applies nothing

`/promotions/coupons` lists all 11 seeded codes with Copy + Claim and no
`undefined`/`NaN`. **Claim navigates** — `/cart?coupon=LIMITEDSET` →
`/checkout?coupon=LIMITEDSET` — and the summary there reads `Subtotal ₹3,097.00
/ Total ₹3,097.00` with **no discount line and no mention of the code**. Carried
in the URL, then dropped: not applied, not rejected, not acknowledged.

It also does **not** add the coupon to `/user/coupons`, which renders correctly
(Active / Expired / Used, "No active coupons.") but can never be populated by
the Claim control, so the claimed-coupons list has no journey feeding it.

Scope: this is checkout step 1 of 3; the manual coupon box sits further in and
may still work when typed by hand.

**Evidence** `shots/coupon-claim-no-discount.png`.

---

### Run status at the end of this session

**108 of 226 batches recorded.** Remaining: 118.

Next batch: run `node tester/scripts/next-batch.mjs --run run-1789432098900`.

## A43 — Sidebar group collapse is never remembered (admin AND user)

Both dashboards collapse correctly and neither remembers.

- **Admin**: collapsing Catalog takes visible `/admin/*` links 19 → 12; reloading
  `/admin/orders` brings it back expanded. Verified by checking the group's own
  item (`/admin/products`) rather than a count.
- **User**: SHOPPING toggles 17 → 11 → 17; navigating to `/user/profile` shows
  `My Orders` again.

🛑 **Neither sidebar puts `aria-expanded` on its group buttons** — 0 of 12 on
admin, 0 of 4 on user. The only accordion on the page that announces state is
the *footer*. A screen-reader user is never told whether a group is open.

**Evidence** `shots/admin-sidebar-collapse-lost.png`, `shots/dashboard-collapse-after-nav.png`.

## A44 — Dashboard listing toolbars disagree

Three listings, three shapes, for what is meant to be one component:

| Surface | Search | Filters | Sort | Page size | Views |
|---|---|---|---|---|---|
| `/admin/products` | inline, "Search products, SKUs, or seller names" | ✓ | 4 options | 4 options | 3 |
| `/admin/orders` | **none** | ✓ | — | — | 3 |
| `/user/orders` | only after toggling **Filters** | ✓ | 4 options | — | — |

## Passing, with detail worth keeping

- **View mode persists** across navigation — and does it through neither the URL
  (`location.search` empty) nor localStorage (`appkit:theme-id` is the only key),
  so it is server- or cookie-backed. It is also **global across listings**, not
  per-listing.
- **Mobile forces cards**: at 390px `/admin/products` renders 0 tables and 0
  `<tr>` *even after explicitly selecting Table view*, and the page does not
  scroll horizontally. Caveat — the Table control is therefore inert at that
  width while still being offered.
- **List cards carry row actions**: Approve / Reject / Quick edit. No "View"
  item, so an admin can act on a row they have not opened.

## A45 — `/store/bids` is empty while the same dashboard reports 29 bids

**Surface** `/store/bids` as `tyson@beybladearena.in`.

Renders **"No bids found for your auctions."** — zero rows, under the **default
unfiltered view**, so no chip is hiding them.

Two clicks away, the same dashboard contradicts it: `/store/auctions` →
`/store/products?listingType=auction` lists this store's own auctions each with
a bid count — **7 / 3 / 2 / 0 / 4 / 13 bids** — including *Beyblade Burst B-100
Cho-Z Achilles*, whose **public** page also reads "2 bids".

So the bids exist, they belong to auctions this store owns, and the page built
to show them shows none. The filter itself looks correctly built (BID STATUS:
All / Active / Outbid / Won / Lost / Cancelled, with Apply Filters), so this is
a query/attribution problem rather than a missing control — and it blocks the
sort and bidder-search cases with it.

**Evidence** `shots/seller-bids-empty.png`, `shots/seller-auctions-bid-counts.png`.

**Not concluded**: `/store/bundles` is also empty. Five bundles exist publicly,
but a bundle is a category row with no store-owned document and the public list
shows no seller attribution — so unlike the bids page, an empty seller bundles
page may be correct. Left as `null` rather than guessed.

## A46 — Live-item moderation is blind: Approve/Reject with no species, jurisdiction or video

**Surface** `/admin/products?listingType=live` as `admin@letitrip.in`, on the
seeded `live-bonsai-juniper-10yr`.

The row menu offers **Approve / Reject / Quick edit**. I opened *both* detail
surfaces — the Quick edit dialog (fields: `status`, `barcodeId`) and the
row-click edit panel (`?panel=edit&id=live-bonsai-juniper-10yr`). **Neither**
contains the word "species", a jurisdiction list, "CITES", or a single
`<video>`/`<iframe>` element.

So a moderator approves a live-animal listing seeing none of what the decision
rests on — while `/ethics` (verified earlier this run) promises vendor
verification, a declared species, a jurisdiction check at add-to-cart and
restricted transport. **The policy commits to moderation the moderation screen
cannot perform.**

**Evidence** `shots/admin-live-moderation-blind.png`.

### Answered in passing, and it's good news

**Digital codes do not leak to admins.** `?listingType=digital-code` returns the
seeded listings, and searching both the list and the Quick edit dialog for
anything shaped like a redemption key (`XXXX-XXXX-XXXX`) finds **none**. On the
surfaces an admin actually uses, unredeemed codes stay unreadable.

## 🛑 A47 — A custom bid reports success and records a DIFFERENT amount

**Surface** `/auctions/auction-beyblade-burst-cho-z-achilles`, signed in as the buyer.

State: current bid **₹1,850.00**, 3 bids, dialog stating *"Minimum next bid
₹2,050.00 (current bid + ₹200.00 increment)"*.

In Custom mode I typed **2137** (read back from the field to confirm) and pressed
Place Bid. The dialog answered **"✓ Bid placed successfully!"** and the page
behind it did not move.

**The reload is what exposed it:**

| | before | after reload |
|---|---|---|
| bid count | 3 | **4** — a bid WAS written |
| current bid | ₹1,850.00 | **₹1,850.00** — unchanged |
| history top row | — | **₹1,850.00** · `M*** U*** 3***` · 16 Sept **02:16** |

So the typed amount was **discarded**, and the bid that was accepted is *equal to
the standing bid* and **₹200 below the minimum the same dialog had just
enforced** — the identical validation had refused ₹1,900 inline seconds earlier
with *"Bid must be at least ₹2,050.00"*.

The auction now holds **two bids tied at ₹1,850.00 from the same bidder** (02:11
and 02:16), which is incoherent state, and it takes
`bid-succeeds-and-outbids-previous-winner` down with it: a bid equal to the
standing bid displaces nobody.

The page's own copy one line above the field promises *"Any amount from ₹2,050.00
up is accepted — it need not be [a multiple]"*.

🛑 **Honest caveat**: the value was entered with real key events after `Control+A`,
and I cannot rule out the component submitting stale state rather than reading
its own input. From the user's seat that distinction does not exist — they typed
a number, saw success, and got a different bid.

**Evidence** `shots/bid-custom-amount-discarded.png`.

### Passing in the same dialog

- **Below-minimum is refused properly**: ₹1,900 → *"Please fix the following: Bid
  must be at least ₹2,050.00"* as both summary and inline error, dialog stays
  open, nothing written.
- **Presets are exact multiples**: +₹200 → ₹2,050, +₹1,000 → ₹2,850, +₹2,000 →
  ₹3,850 against a ₹200 increment (1× / 5× / 10×), each labelled with step *and*
  resulting bid.
- **The count increments by exactly one per bid** (2 → 3 → 4). What broke was the
  amount, not the counter.

## 🛑 A48 — The hamburger menu is entirely off-screen at 320px — in BOTH hand modes

**Surface** `/` at a 320px viewport, signed in.

| control | left-hand mode | default (right) |
|---|---|---|
| Switch to dark mode | **-16 … 28** (half clipped) | **292 … 336** (clipped) |
| **Open menu** | **-64 … -20** — fully off-screen | **340 … 384** — fully off-screen |

The page does **not** scroll sideways in either mode, so neither control is
reachable. On a 320px phone the primary navigation control cannot be opened.

🛑 **My first read blamed Left-hand mode and was wrong.** Re-measuring with the
mode OFF found the identical two controls clipped off the *opposite* edge. So the
mirrored row does fit "exactly as well as the default row" — the default row
doesn't fit either. That makes this a plain narrow-viewport layout bug affecting
every small-phone user regardless of the setting, which is **more** serious than
the hand-mode question the case was asking.

**Evidence** `shots/hand-mode-320-clipped.png`.

### Left-hand mode itself works, measured in both states

`localStorage["appkit:hand-mode"]` + `<html data-hand>`; it is **not** a write to
the user document, so no PRESERVE-tier data is touched. Centre-x, ON → OFF at
1280px:

| element | ON | OFF |
|---|---|---|
| hamburger | 54 | 1226 |
| theme toggle | 102 | 1178 |
| Today's deals | 236 | 1044 |
| search | 321 | 959 |
| wordmark | 1172 | 108 |
| **centre mark** | **640** | **640** — unmoved, exact |
| hero prev / next | 68 / 116 | 1164 / 1212 |
| "View all" ×3 | 1131 / 1132 / 1125 | 149 / 148 / 155 |

Row 2 at 320px mirrors correctly too: ON → Profile@43, Cart@91, Wishlist@139,
Notifications@187 (left-packed); OFF → Notifications@133 … Profile@277
(right-packed).

🛑 **A second correction worth keeping**: on the section "View all" buttons I
measured the ON state first, saw them on the right, and nearly recorded a failure
on the assumption that right is the default. The OFF baseline showed the default
is the **left** end. Measuring one state and assuming the other is how a passing
feature gets reported as broken.

## 🛑 A49 — Seller order rows say "Unknown buyer" and cannot be opened

**Surface** `/store/orders` as `tyson@beybladearena.in`. 25 rows across 2 pages.

Every row renders the same: a **🧾 emoji** where a thumbnail belongs, a
**truncated** id, **"Unknown buyer"**, a status and a relative date. Zero `<img>`
elements in the whole list.

Three defects in one row:

1. **"Unknown buyer" on all 25** — the seller cannot tell who ordered.
2. **The id is cut to 14 chars.** Real ids look like `order-1-20260915-dhf7oy`;
   the list shows `order-1-202608` **nine times** for nine different orders, so
   the only identifier displayed is not unique.
3. **No line-item detail** — no title, quantity or amount, while the buyer's own
   `/user/orders` shows all of it off the *same* denormalised `items[]`.

**The data is fine.** The top two rows are the orders I placed myself this run
(cancelled, "2h ago"), and statuses across the list are real and varied
(processing / confirmed / shipped / delivered / returned / return_requested /
cancelled). It is purely row rendering — the documented "Order {id} instead of
denormalised item info" defect, on record as fixed for admin *and* seller views.
It is not fixed on the seller side.

### And the rows are a dead end

**No "Open full page" control exists** (0 matches), there are **no row-action
menus**, and a **real** click on a `cursor:pointer` row leaves the URL at
`/store/orders` with no dialog. So a seller can see an order and never open it —
which means no shipping address, no tracking form, no payment panel.

That blocks four more cases in the same batch: `confirm-payment`, `mark-shipped`,
`tracking-visible` and `seller-order-manual-payment-badge`. The last one matters
most: its expected value is `proofScreenshotVisibleToSeller: false`, and since
`false` is the *desired* answer, recording it unverified would be a false green
on a privacy control. Left `null`.

**Evidence** `shots/seller-orders-unknown-buyer.png`.

### A49 addendum — the ADMIN order surface is fine, which sharpens the contrast

Same data, same run, `admin@letitrip.in` on `/admin/orders`: **26 table rows**, a
working row menu (**View full details / Open full page / Update status**), and
opening an order gives a drawer with a real **"Payment Proof"** section reading
*"No proof uploaded yet."*

So the review surface exists and correctly reports an absence. The seller's
equivalent has no detail route at all. Whatever regressed, it regressed on the
seller side only — the admin view is the working reference to diff against.

## 🛑 TESTABILITY — the whole auction-lifecycle family is unreachable

Not a product defect, but it costs coverage on every run and will keep doing so.

The checklist repeatedly says *"let the auction end, **or have an admin settle
it**"*. **There is no admin settle.** On `/admin/products?listingType=auction`
as `admin@letitrip.in` the row menu is **Approve / Reject / Quick edit**, and a
search of the page for `settle | end auction | close auction | declare winner |
finalize` returns **zero**.

So settlement happens only when the scheduled job sees an auction's end date
pass — and no seeded auction does that inside a session (the one I bid on still
reads *"Ends in 1d 3h"*).

**Cases permanently blocked by this**, all recorded `null` this run:
`win-auction`, `auction-win-unpaid-forfeit`, `auction-below-reserve-no-winner`,
`seller-auction-forfeit-notification`, `notification-losing-bidder-no-email`.

**Two ways out**, either would work: seed an auction that is **already settled**
(with a winner, a runner-up and losing bidders), or add an admin settle action.
The first is cheaper and needs no new UI.

🛑 **The email half of the losing-bidder case is the one that matters most and
is least verifiable.** `bid_lost` is deliberately email-**ineligible** — an
auction with 50 losing bidders would otherwise spend half a day's Resend quota in
one settlement — so the assertion is *zero emails*, an **absence**. Recording
that unverified would be a false green on the exact control protecting the quota.

## A50 — The 404 page is a dead end; the 401 tells signed-in users to sign in

**404** (`/this-route-does-not-exist-qa-probe`): correct HTTP 404 status, but it
renders the **bare Next.js default** — the numeral `404`, "This page could not be
found.", and **nothing else**. No header, no footer, **zero links**. A visitor who
mistypes a URL is stranded with no navigation, which reads as the site being down
rather than one route being wrong. The checklist's clause is explicit: *"at least
one working link back into the site."*

**401** (`/unauthorized`) is the opposite and well built: *"401 — Unauthorized /
You need to be signed in to view this page."* with **Sign in** and **Go home**,
full chrome and working nav.

🛑 **But I hit it WHILE SIGNED IN** — as `rehan.sheikh@gmail.com`, a buyer opening
`/admin/dashboard` — and it still said *"You need to be signed in"*. The real
problem is that a buyer lacks admin permission. It sends an already-authenticated
user to a login form that cannot help them: **a 403 situation wearing 401 copy**.

Neither page leaks a stack trace, file path or error digest.

**Evidence** `shots/error-pages-401-404.png`.

### Aside from the unfinished checkout case — a keyboard-access smell

On checkout Step 1 the saved-address cards are **plain clickable `div`s**: the
step contains **zero form inputs**, no radios, no labels. Continue is correctly
disabled until one is picked (and selecting one moved the total ₹3,097.00 →
₹3,118.80, fees applying exactly when the page promised). But a keyboard user has
no obvious way to choose an address, and any automation looking for a radio will
conclude the step is broken.

## A51 — Auth forms fall back to "Invalid value" instead of authored copy

Two separate forms, same defect — which is why it is worth fixing centrally.

**`/auth/register`**, empty submit:

```
Please fix the following:
  Create Account: Enter your name        ← authored, good
  Create Account: Invalid value          ← raw schema fallback
  Required
  Invalid value
```

**`/auth/forgot-password`**, empty submit: **"Invalid value"** twice — summary and
inline — on a form whose entire content is *one email field*. No authored message
tells the visitor to enter their address.

The forms clearly *have* authored strings for some rules (a bad email with terms
unchecked gives the well-written *"You must accept the terms to continue"*) and
fall through to the generic ones for the rest.

🛑 **Second defect in the same measurement: `aria-invalid` is 0 after submit** on
both. The errors are visible text with no programmatic association to their
inputs — the same gap recorded earlier on the address form. Screen-reader users
get the summary at best.

**What is right**, and worth keeping: **zero** alerts before submit on both forms,
so the "accuses you of six missing fields on first paint" regression is absent.

**Evidence** `shots/register-validation.png`.

**Deliberately not done**: account creation writes to the preserve-tier `users`
collection; the reset link sends real mail to an address I do not control. Both
stopped at validation by choice, not inability.

## 🛑 A52 — "Remove all" wipes the wishlist with NO confirmation

`/wishlist` → **Remove all** → the list emptied immediately. I watched for a
dialog and there was none (`confirmDialogAppeared: false`); the page went
straight to *"Your wishlist is empty."*

CLAUDE.md Rule #7 is explicit: every action with `kind: "danger"` **MUST** carry
a `confirmation` config, because "missing confirmation = immediate irreversible
execution". There is also **no undo and no toast** — single-item removal gives no
feedback either, beyond the card vanishing.

**Evidence** `shots/wishlist-empty-after-remove-all.png`.

## A53 — The wishlist cannot add to cart

Enumerated every visible control on `/wishlist` with two items saved:

- page: **Sync all**, **Remove all**
- toolbar: Filters, sort (Newest / Oldest / Price ↑ / Price ↓)
- each card: **Select**, remove-icon, **Sync**, **Remove**

**Zero** buttons match add-to-cart. A buyer who saved something for later must
open the product page to buy it.

Also: the wishlist TYPE filter offers **All types / Standard / Auction /
Pre-Order** — three of nine listing types. Art, stickers, classifieds, digital
codes, live items and prize draws have no entry.

### What works well here

- **Add from PDP**: the button flips to **"In Wishlist"** — state on the control,
  not a vanishing toast — and the item really lands (count 1 → 2, correct price).
- **Remove takes the right item and survives a reload**: 2 → 1, Wizard Arrow gone,
  Valkyrie retained, still gone after a genuine reload.
- **One product, one entry** — no duplicates.
- **Empty state** is clean: *"Your wishlist is empty."* with the counter removed
  rather than showing "0 saved item".

## A54 — The saved-wishlist heart goes solid but not RED

Measured the same product's heart in both states via computed style:

| state | svg fill |
|---|---|
| not saved | `none` (outline, dark stroke) |
| **saved** | **`rgb(24, 24, 27)`** — near-black zinc ink |

So it does go solid, which is half the claim. It is **not red**. A saved item
gets a solid dark-grey heart that reads as ordinary text colour rather than an
active state.

🛑 **A screenshot alone would pass this.** A small filled heart on a light button
looks "on"; only reading the computed fill shows the colour is wrong.

**Evidence** `shots/wishlist-heart-filled-not-red.png`.

### Working well — wishlist and history

- **View / Remove per card**, and **View is a real `<a href>`** to the product's
  own detail route. (My first sweep scanned `<button>` only and reported View
  missing — checked before writing the verdict; a "no" there would have been my
  selector's fault, not the product's.)
- **Sync** per card → *"✓ Item synced."*; **Sync all** → *"✓ 1 item synced."* —
  the bulk toast reports a **count**, which is what lets a user notice when a bulk
  action touched fewer rows than expected.
- **History is accurate and most-recent-first**, checkable against my own
  browsing: 11 unique products in exactly the order I opened them.
- **Revisit reorders rather than duplicating**, shown with a real before/after:
  Valkyrie sat **4th**, I opened its page, it moved to **1st** — and the total
  stayed **11 unique entries** with 2 anchors (card + title), same as every row.

Note each history/wishlist entry contributes **two** anchors, so a naive link
count doubles the apparent item count.

## A55 — `/wishlist` shows guests a permanently empty list with no sign-in route

Signed out, `/wishlist` renders the full furniture — "My Wishlist", Filters,
sort, TYPE and PRICE RANGE facets — and **"Your wishlist is empty."**

**Zero** sign-in affordances in the main region: no "Sign in", no "Log in", no
"Create account". A guest is told they have no saved items, which is
indistinguishable from a signed-in user with an empty list, and is offered
filtering and sorting over a list that can never contain anything.

🛑 **The correct copy already exists a few components away.** Tapping the heart on
a product gives a proper dialog — *"Sign in required / You need to be signed in
to save items to your wishlist."* with **Cancel** and **Go to Login** — and,
importantly, the heart **does not** optimistically flip to a saved state it
cannot honour. That sibling case passes cleanly. This page just does not use the
same treatment.

**Evidence** `shots/wishlist-guest-empty-no-signin.png`,
`shots/wishlist-guest-signin-prompt.png`.

## A56 — The Add FAQ drawer accuses the admin before they type

Opening `/admin/faqs` → **Add FAQ** on a clean load, **without touching
anything**, immediately renders:

- **2 `role="alert"` nodes**
- *"Question must be at least 5 characters"*
- *"Answer is required"*
- a section badge reading **"2 issues"**

This is Root Cause #74's regression — a form telling the user they have made two
mistakes on a form they have not typed into.

**The summary half is correctly gated** (no "Please fix the following:" appears
until submit), so `submitAttemptCount` is doing its job there. What is ungated is
the **inline per-field errors**, which should wait on `touched`.

🛑 **It is drawer-specific, not global** — which makes it a localised fix. Measured
this run: `/user/addresses/new` shows **0** alerts before submit, and
`/auth/register` shows **0**. Only this drawer pre-accuses.

**Evidence** `shots/faq-drawer-errors-before-typing.png`.

### Passing — and rare: a save path fully verified in both directions

`faq-create-edit-category` is the first authoring flow this run to pass end to
end **with the reload oracle applied twice**:

| step | result | after reload |
|---|---|---|
| create with category **Auctions** | ✓ "FAQ created." | row = `… \| auctions \| Published` |
| edit category → **General** | ✓ "FAQ updated." | row = `… \| general`, no `auctions` |

Category lives under **Filing & ordering** and offers Shipping / Returns /
Payments / Auctions / Pre-orders / General — matching the seeded taxonomy.

## Clean sweep — FAQ/help presentation on mobile (3/3 pass)

All three verified at **390px** as a signed-out visitor.

- **Dividers are real.** Every `/faqs` row carries a 1px bottom border in
  `lab(90.952 0 0)` (light grey); homepage FAQ rows use `rgb(228,228,231)`. I
  checked the **colour**, not just the width — `1px solid transparent` would pass
  a naive width check and show nothing.
- **Homepage FAQ section is populated**, not truncated: its own chips (All /
  Shipping / Returns & Refunds / Orders & Payment) and a run of questions starting
  with *"What is LetItRip?"* — the same first entry as the full list, so both
  surfaces draw from one source. `/faqs` holds **52** distinct questions.
- **Tabs collapse into a dropdown** on the category page, and the collapsed
  control carries **more** information than the desktop strip: nine options *with
  counts* — Products (15), Auctions (9), Pre-Orders (7), Prize Draws (7),
  Classifieds (8), Digital Codes (8), Bundles (5), Art & Stickers (11),
  Stores (2). Selecting drives a real route, not client-only state.

🛑 **That last one is a regression check that passed.** Root Cause #72 was a
category tab bar whose count map covered 6 of 10 ids, leaving four tabs
structurally unhideable and several types missing. All nine types now appear with
counts.

**Evidence** `shots/faqs-mobile-borders.png`, `shots/tabs-mobile-dropdown.png`.

## A57 — Footer column headings are lighter, smaller and the same colour as their links

Measured at 1280px, heading vs the links directly beneath it:

| | weight | size | colour |
|---|---|---|---|
| **Shop / Support / For Sellers / Learn / Legal** | **450** | **11px** | `rgb(91,91,99)` |
| their link items | **500** | **13px** | `rgb(91,91,99)` |

The heading is lighter *and* smaller *and* identically coloured — there is no
dimension on which it stands out. **Same in dark mode**: headings 450/11px
`rgb(180,180,189)` against links 500 `rgb(180,180,189)`. So it is how the
component is built, not a light-theme accident, and it takes
`footer-weight-both-themes` down with it: the weights are *consistent* across
themes and *inverted* in both.

### Passing — with the hover pattern worth copying

- **Dark mode inverts cleanly**: footer bg `rgb(250,250,250)` → `rgb(2,6,23)`,
  text `rgb(91,91,99)` → `rgb(180,180,189)`.
- **Hover is themed, not hardcoded**: the link class is
  `hover:text-primary dark:hover:text-secondary` — a token pair with a dark
  counterpart, which is exactly the shape Root Cause #79 says to use instead of a
  fixed `hover:*-zinc-50` tint. *(Read from the declaration — synthetic events
  don't fire CSS `:hover`, and a real hover hit the collapsed mobile copy.)*
- **Links are readable**: fw500 / 13px / `rgb(91,91,99)` on `rgb(250,250,250)` ≈ 6:1.
- **Mobile accordions work** and **carry `aria-expanded`** (false → true → false).

🛑 **That last point is the reference implementation for A43.** The admin and user
dashboard sidebars use the same collapsible-group pattern with **zero**
`aria-expanded` — 0 of 12 and 0 of 4. The footer already does it right.

## A58 — `/help/auctions` documents a feature that does not exist, and an email that is deliberately never sent

**Proxy bidding is documented and absent.** The page describes *"Max bid (proxy
bidding) — enter the maximum you're willing to pay. LetItRip will automatically
bid on your behalf up to that amount…"*. The real bid modal, enumerated in detail
this run, offers three quick-bid presets, a Custom option, **one** `bidAmount`
field, Place Bid and Buy Now. No max-bid field, nothing bidding on your behalf.
Custom is a one-off amount — a different mechanic.

**The outbid email is promised and withheld by design.** *"you'll receive an
in-app notification **and email** if someone outbids you."* `bid_outbid` sits on
the email-**ineligible** list precisely so one busy auction cannot spend the daily
send quota. The page promises the one thing the system is built not to do.

*Accurate on the same page*: the increment rule matches exactly what I measured
(₹1,650 + ₹200 → minimum ₹1,850, "min increment ₹200.00" on the listing).

## A59 — `/help/shopping` sends buyers to a checkout step that doesn't exist

*"Enter your coupon code at **step 2 of checkout (Order Summary)**."*

Checkout announces its own steps: **"Step 1 of 3: Shipping Address"**, and the
three are Shipping Address → **Add-ons & fees** → Payment. There is no "Order
Summary" step, and step 2 is the add-ons picker. **Both the number and the name
are wrong.**

This compounds A42 — claiming a coupon lands at `/checkout?coupon=CODE` and the
code is silently dropped. A buyer following this page has no working route to
apply a coupon *and* no accurate place to look for one.

*Accurate on the same page*: "to complete checkout, save your wishlist, or contact
support you must be signed in" — verified separately against the guest wishlist
prompt.

## A60 — `/scams` links 1 of its 3 sub-pages

The registry page anchors **`/scams/report`** and **neither** `/scams/types` nor
`/scams/faqs`. Both exist and are substantial:

- `/scams/types` — 200, h1 *"Scam Types — LetItRip Scam Registry"*, ~21,000 chars
  of rendered content across **Price Manipulation**, **Social Engineering**,
  **Condition Misrepresentation**, with entries like Undervaluation (Lowball
  Trick), Sympathy Play, Trust Building Fraud, Urgency Pressure.
- `/scams/faqs` — 200, h1 *"Scam Awareness FAQs"*.

Two fully-built public pages reachable only by typing the URL — Root Cause #37's
shape. The linking is **one-way**, not absent: `/scams/types` *does* link back to
`/scams`, so the child knows the parent and the parent doesn't know the child.

**Evidence** `shots/scams-types-unlinked.png`.

### Passing — help hub and scam types are in good order

- **All four `/help/*` sub-pages load** with distinct h1/title pairs and real,
  topic-specific bodies. The round trip works **both ways**: `/help` links all
  four, and all four carry `href="/help"`.
- **`/scams/types` matches the registry's real categories** — I took the six type
  labels visible on `/scams` itself (Fake Price Reference, Bait and Switch,
  Impersonation, Advance Payment Ghost, Fake Payment Screenshot, Payment Ghost)
  and **all six** appear on the types page. `categoriesOnlyOnOneSide: 0`.
- **The public seller guide is genuinely public**: `/seller-guide` and both
  sub-pages return 200 with **no session**, and all three are linked from `/help`
  — so a signed-out visitor reaches them by navigation, not by bookmark.

## 🛑 A61 — Seller analytics renders `₹NaN` and three `undefined`s

`/store/analytics` as `tyson@beybladearena.in`, in full — this is the entire
259-character main region:

```
Store Analytics | From | To
TOTAL REVENUE    ₹NaN
TOTAL ORDERS     undefined
TOTAL PRODUCTS   undefined
PUBLISHED        undefined
```

Waited 24s across two probes and checked for loading state first: **0 skeletons,
0 spinners**. This is the settled render, not a page still fetching.

**The seller has real data to show**, which is what makes it more than cosmetic —
the same account's payouts list carries ₹11,400.00 and ₹13,774.05 with a ₹12,000
gross breakdown, and its product list shows six auctions with live bid counts.
`₹NaN` specifically means a currency formatter was handed `undefined` and
formatted it anyway instead of guarding.

**Evidence** `shots/seller-analytics-nan-undefined.png`.

### The payouts page is excellent — and it localises A49

Same dashboard, same seller, opposite quality:

- Rows carry the **full** payout id, amount, "Requested: 1d ago", status chip.
- **Row actions → View Details / Open full page / Export.** The seller ORDERS
  list has **no row menu and no detail route at all** — so payouts is the working
  reference to diff the orders list against.
- **The detail breakdown reconciles exactly**, checked by arithmetic not by
  eyeballing: ₹12,000.00 − ₹600.00 − ₹475.00 = **₹10,925.00**. The refund
  deduction is itemised with its order id *and* the human reason ("Piece arrived
  with a chipped bit — buyer requested partial refund").
- **The "Remind me" toggle persists** — flipped false→true, survived a full
  reload and panel re-open, restored to false afterwards.

**Not called**: row checkboxes wouldn't register on two attempts and no bulk bar
appeared — but the checkbox is nested inside a row button *also* named "Select
Payout…", so a click in that overlap could toggle twice and net to nothing.
Recorded `null`; that's my instrument's ambiguity, not demonstrated breakage.

## A62 — Cart order summary does not recalculate when a line quantity changes
**Where:** `/cart` (buyer) · **Batch:** `buying/cart--p1` · **Severity:** high — the buyer is shown a total below what they owe

Cart held Dark Bull ×2 = ₹2,198.00 and an art print ×1 = ₹899.00, `Subtotal (2 items) ₹3,097.00`.
Raising the art print 1 → 3 with two real `+` clicks:

| Surface | After the change | Correct |
|---|---|---|
| Line total | ₹2,697.00 | ✓ |
| Header cart badge | 3 → 5 | ✓ |
| **Order summary subtotal** | **₹3,097.00** | ✗ should be ₹4,895.00 |

**It is a stale render, not bad arithmetic.** A full reload shows `Subtotal (2 items) ₹4,895.00`
and `Total ₹4,916.80` with quantities 2 and 3 — the write persisted and the server figure is
right. The line-total and badge subscriptions re-derive on a quantity change; the summary's
does not. Nothing on screen indicates the number is stale.

## A63 — RETRACTED (was: grouped listing with a stock-1 member can never be added)
**Status: WITHDRAWN — this was my measurement error, not a product defect.**

I originally reported that a two-member group add was refused on an empty cart by a false
stock guard. It was not false. Two mistakes compounded:

1. My probe read `data.items` from `GET /api/cart`; the real response shape is
   **`data.cart.items`**, so a cart holding one line reported as empty.
2. An earlier *Remove item from cart* click had not taken effect, so the Golden Retriever
   Puppy (**stock 1**) was still in the cart when I retried.

The guard was therefore doing exactly the right thing, and saying so clearly:
*"Only 1 left of 'Golden Retriever Puppy — 6 Months, Vaccinated' once your cart is counted."*
It counts existing cart contents against available stock and names the offending item.

**Re-tested with the cart empty on BOTH oracles** (API `items` 0 / `itemCount` 0 /
`subtotal` 0, page reading *"Your cart is empty"*): the two-member add succeeds first time,
no alert, producing exactly **one** cart line — `lineKind: "group"`, price ₹28,200
(25,000 + 3,200), two members at quantity 1 each. `group-picker-one-line` is a **pass**.

**The lesson worth keeping:** verify a precondition on the user-facing surface, not only on a
hand-parsed API shape. A wrong key path returns an empty array, which is indistinguishable
from an empty cart — and it manufactured a confident, evidenced, entirely fictional finding.

## A64 — Two currency formatters on the same cart screen
**Where:** `/cart` · **Severity:** low

Same page, same amount, two spellings: the line item and the `Subtotal` row render
`₹25,000.00`; the cart tab summary and the `Total` render `₹25000.00` / `₹25011.80` with no
thousands separator.

## A65 — Emptied cart has no way back to the catalogue
**Where:** `/cart` empty state · **Severity:** low

After *Remove all* the page reads `Your cart is empty` / `Add products from the marketplace to
continue.` — the second line is plain text, not a link. There is no browse CTA.

**Credit where due, same batch:** the cart's *Remove all* **is** properly gated — a dialog
reading *"Clear your cart? / Every item will be removed. This can't be undone."* with Cancel
and Clear cart, and nothing is deleted until confirmed. The **wishlist's** *Remove all* has no
confirmation at all (A52), so the pattern exists in the codebase and the wishlist does not use it.

## A66 — 🛑 Every multi-member cart line is silently DELETED when the buyer opens /cart
**Where:** `/cart` load · **Batches:** `buying/cart--p1`, `buying/cart--p2` · **Severity: highest of this run** — grouped listings and bundles are both unpurchasable

A grouped or bundle line is created correctly and then destroyed, server-side and without a
word to the buyer, the moment they navigate to the cart to check out.

**Four reproductions, two features, both member types:**

| Line | Members | On the group/bundle page | After opening `/cart` |
|---|---|---|---|
| `group` — Beyblade Arena Extras | 2 live items | 1 line, ₹28,200, **stable over 12 s** | **0 items** |
| `group` — Beyblade Arena Extras (repeat) | 2 live items | 1 line, ₹28,200 | **0 items** |
| `group` — Original Series Lineage | 2 **standard products** | 1 line, ₹3,298 (1,499 + 1,799) | **0 items** |
| `bundle` — Original Collector's Set | 3 standard products | 1 line, ₹2,999, `lineKind: "bundle"` | **0 items** |

**It is a real deletion, not a rendering failure.** `GET /api/cart` (`data.cart.items`) reports
the line on the originating page — twice, eight seconds apart, so it is not transient — and
reports `0` when sampled at 1.5 s, 4 s and 6 s after the cart page loads. The page renders
*"Your cart is empty."*

**Scope is precisely multi-member lines.** Ordinary single-product lines survive navigation and
full reloads throughout this run (Dark Bull, an art print, a ₹25,000 live item). A one-member
group selection becomes an ordinary product line by design — and that one survives too.

**The header badge does not agree with the deletion.** After the bundle add it read `1` on the
homepage while the cart held nothing, so the buyer is invited back to a cart that is empty.

**What this costs:** the entire group-picker and bundle purchase paths. The picker itself is
well built — running totals that reconcile, per-member steppers, stock caps that hard-disable
at the limit, a stock refusal that names the offending item — and none of it can be bought.

**Cases it takes down** (all recorded against this one cause, not as separate defects):
`group-line-member-edit-recalculates`, `group-line-remove-member`, `group-line-link-target`,
`bundle-copies-stepper`, `bundle-line-in-cart`, `group-checkout-order-rows`,
`group-checkout-stock`, `group-lane-gate`.

**Where to look:** something on the cart's load path prunes lines it cannot validate.
`CartDocument.items[].groupMembers` is the field a single-product line lacks, and
`getCartLineMembers()` / `isMultiMemberLine()` are the readers. A prune that drops
un-resolvable lines *without surfacing anything* would produce exactly this.

**Not yet established:** whether the prune happens in the cart page's own data load or in a
shared repository read that the cart page is simply the first to hit. A single-product line
proves the read path works in general, so the discriminator is the multi-member branch.

## A67 — Bundle page: raising "Copies" changes no number on the page
**Where:** `/bundles/{slug}` · **Severity:** low

The Copies stepper moves 1 → 2 but every price on the page stays put (₹2,999.00). The sibling
group picker at `/groups/{slug}` *does* show a running total (`2 items · ₹28,200.00`), so the
two multi-member surfaces disagree about whether to show one.

**Bundle pricing itself is correct:** members ₹1,499 + ₹1,799 + ₹1,299 = ₹4,597, bundle price
₹2,999, `35% OFF` and `You save ₹1,598.00` all reconcile, and the cart line is created at the
discounted ₹2,999 rather than the sum.

## A68 — Bundle description contradicts its own member list
**Where:** `/bundles/bundle-original-collectors-set` · **Severity:** low (content)

*"Both original-generation Beyblades — Dranzer S and Driger V — bundled at a discount."*
The bundle has **three** members; the third is a Metal Fight BB-28 Storm Pegasus, which is not
original-generation. Header says `· 3 items`, so the page contradicts itself on one screen.

## A62 — addendum: the stale summary is specific to the QUANTITY path
**Batch:** `buying/cart--p3`

Removing a line **does** re-derive the summary — three lines at ₹3,297 → removed one →
`Subtotal (2 items)` immediately, no reload needed. So the summary is not generally
unreactive; only the quantity-change path fails to push an update. That narrows the fix to
whatever the `+`/`−` handler notifies (it updates the line total and the header badge and not
the summary) rather than to the summary component itself.

## A64 — addendum: confirmed on a second, unrelated cart
Same page, same amount, two spellings — now seen on a three-line cart as well:
seller-card header `₹3297.00` and floating-bar `Total: ₹2309.80` against the summary's
`Subtotal (3 items) ₹3,297.00`. It is the tab/summary-header and bottom-bar formatters that
drop the separator, not the line rows.

## Cart — what is genuinely solid (recorded so a fix does not regress it)
Measured this session on `buying/cart--p3`, all passing with evidence:

- **Add-to-cart toast** names item, count and value: `✓ "Beyblade Burst B-59 Regalia Genesis" added to cart — 2 items, ₹2,398.00 total`
- **Remove item** removes the right row and updates the summary
- **Persistence** across a hard reload — subtotal recomputed server-side (₹2,298)
- **Checkout button** `rgb(15,118,110)` on white, 16px/500, 320×44 — a real primary button
- **360px**: `scrollWidth === clientWidth`, **zero** elements past either edge, item rows
  contained inside a single rounded seller card (row x141–278 inside card x33–327), no
  card-in-card
- **Bottom chrome tiers published correctly**: `--bottom-nav-height: calc(4rem + 0px)`,
  `--bottom-chrome-height: 120px`, and the last row scrolls clear of the bar
- **One** fixed bottom nav, Cart tab with a live badge, **no** Wishlist tab (header keeps it)

## Method note — a DOM measurement is not an observation; the screenshot is
Recorded because it nearly produced three false findings in one session, in both directions.

| What I measured | What I concluded | What was true |
|---|---|---|
| `GET /api/cart` → `data.items` | cart empty | wrong key path — real shape is **`data.cart.items`**; the cart held a line, and the "false stock guard" (A63) was the guard working correctly |
| `getBoundingClientRect().height` of the element containing *"Platform fee"* → 21px in both toggle states | "Show details" is a no-op | the collapse happens on an **ancestor that clips its child** (`grid-template-rows: 1fr → 0fr`), so the child keeps its height while invisible. The toggle works |
| `--bottom-chrome-height` unchanged at 120px after tapping *Details* on mobile | no panel opened | the panel renders as an **overlay above** the bar, not as a child that grows the measured tier. The panel opened |

Two rules that would have caught all three:

1. **Verify a precondition on the user-facing surface, not only via a hand-parsed API shape.**
   A wrong key returns `[]`, which is indistinguishable from an empty collection.
2. **Take the screenshot and read it before writing a `no`.** Every one of these was settled
   in one glance at the image after several confident, wrong probes.

Also worth knowing for anyone measuring the cart: at desktop width there are **four**
elements containing *"Platform fee"* — two in the desktop Summary and two belonging to the
mobile bottom bar, which stays in the DOM at zero height. Any measurement must exclude the
`position: fixed` ancestors first.

## Cart add-ons and fees — verified correct, with arithmetic (`buying/cart--p5`)
Recorded in detail because these are the money paths and a regression here is expensive.

- **Per-seller add-on fee charged once.** Ticking *WhatsApp order updates* on the seller card
  adds one `WhatsApp updates ₹10.00` line to that card and one to the summary; total
  ₹2,309.80 → ₹2,319.80, exactly +₹10.00.
- **Fees reconcile**: 2,298.00 + 10.00 (WhatsApp) + 10.00 (platform) + 1.80 (GST) = **2,319.80**,
  the displayed total. GST is 18% of the *platform fee*, not of the goods — correct per the
  documented commission-GST rule.
- **Breakdown follows the SELECTION, not the cart.** Deselecting the ₹1,399 item →
  `1 of 2 items selected`, `Subtotal (1 item) ₹899.00`, total ₹920.80 (= 899+10+10+1.80), and
  the value-based add-on re-prices itself (Shipment protection ₹45.96 → ₹30.00).
- **Deselecting a seller's last item** disables their add-on inputs (`disabled=true`, not just
  greyed), replaces them with *"Select an item from this seller to add extras."*, drops their
  fee lines, and **disables the checkout button** (`opacity 0.5`) rather than offering a ₹0.00
  purchase. The ticked state is retained while disabled, so re-selecting restores the choice.
- **Platform fee is capped, shown by measurement**: ₹10.00 at a ₹2,298.00 selected subtotal and
  still ₹10.00 at ₹899.00 — a percentage would have fallen.
- Partial selection gives a genuinely good CTA: **"Proceed to checkout 1 item"** with
  *"Or checkout all 2 items"* beneath.

**Untestable in the seeded catalogue:** every reachable product belongs to **one** seller
(Beyblade Arena), so the two-seller half of four cases — *"₹10, not ₹20"*, the `(N stores)`
qualifier, per-seller order records, cross-seller fee separation — could not be exercised at
all. A second seller with at least one purchasable listing would unlock them.

## A69 — "Calculating shipping & fees…" never resolves at zero selection
**Where:** `/cart` summary, 0 items selected · **Severity:** low

With nothing selected the breakdown reads `Subtotal (0 items) ₹0.00` followed by a permanent
*"Calculating shipping & fees…"*. There is nothing to calculate; it should say so (or show
nothing) rather than leave a spinner-style message that never completes.

## A70 — 🛑 Clicking a payment METHOD places the order immediately — no confirmation, no review
**Where:** `/checkout` step 3 · **Batch:** `buying/cart--p6` · **Severity: high** — an irreversible money commitment fires on what reads as a selection

Step 3 ("Payment") presents two options rendered as `<button>`s: **"Pay via UPI / Cash"** and
**"Cash on Delivery"**. Clicking one does not select it — it **places the order**. I clicked
*Cash on Delivery* intending to compare its totals against the other method and landed
directly on `/checkout/success?orderId=order-2-20260915-tpi7ax` with a real ₹2,549.60 order
created.

There is no "Place order" button, no confirmation dialog, and no review step between choosing
how to pay and being committed. A buyer comparing the two options loses the comparison on the
first click.

**It also makes the platform-fee-per-method case untestable by construction** — you cannot see
the second method's totals without placing a second order.

*(Disclosure: this order was placed accidentally while testing. It is left in place as evidence;
orders are CASCADE-tier and are wiped between runs.)*

## A71 — 🛑 The order is charged ₹229.80 MORE than the buyer was quoted, undisclosed
**Where:** checkout → created order · **Batch:** `buying/cart--p6` · **Severity: highest money defect of the run**

One cart, carried end to end, reading the figures at every stage:

| Stage | Total |
|---|---|
| Cart breakdown (2,298.00 + 10.00 WhatsApp + 10.00 platform + 1.80 GST) | **₹2,319.80** |
| Checkout Order Summary, step 1 (after address) | **₹2,319.80** |
| Checkout Order Summary, step 2 (Extras & fees) | **₹2,319.80** |
| Checkout Order Summary, step 3 (Payment) | **₹2,319.80** |
| **The order that was created** | **₹2,549.60** |

**+₹229.80, which is exactly 10.00% of the ₹2,298.00 goods subtotal** — matching the documented
COD deposit percentage. So a COD charge is applied *after* the method is chosen, and because
choosing the method **is** placing the order (A70), the buyer never sees the revised figure.
The ₹2,319.80 quote was on screen at the instant of commitment.

**The order's own breakdown does not add up either:**

```
Items (2):  Regalia Genesis ×1  ₹1,399.00
            Anniversary Print ×1  ₹899.00     → ₹2,298.00
Payment Summary:
            WhatsApp updates · ₹10.00
            Subtotal            ₹2,549.60     ← the GRAND TOTAL on the Subtotal row
            Total               ₹2,549.60
```

No COD line, no platform-fee line, no GST line. The one fee shown (₹10.00) reconciles with
nothing, and the buyer has no way to see where ₹251.60 of their ₹2,549.60 went.

Note a COD *deposit* is normally an amount paid **upfront against** the total, not added **to**
it — so this may be a double-count as well as an undisclosed one. Worth checking
`computeCodHandlingFee()` / `codDepositPercent` against what the order records.

## A72 — The order-confirmation page is a placeholder
**Where:** `/checkout/success?orderId=…` · **Severity:** medium — the moment a buyer most needs detail

The entire page reads:

> Order Confirmed · Thank you for your order · Your order has been placed successfully.
> **"Order details will appear here."** · Continue Shopping

That middle sentence is placeholder copy shipped to production. The order id is sitting in the
URL and the order renders fine at `/user/orders/view/{id}` — so this is a UI never wired to
data it already has (Root Cause #52), not missing data. No total, no items, no order number,
and no link to the order.

## A73 — Order id shown to the buyer disagrees with the real id
**Where:** `/user/orders`, order detail · **Severity:** low

The order created as `order-2-20260915-tpi7ax` is displayed everywhere as **`#5-TPI7AX`**. The
leading number differs (2 vs 5) — the id's own prefix is the item count, and the order has 2
items, so `#5` matches neither the id nor the contents. A buyer quoting `#5-TPI7AX` to support
is quoting something that does not appear in the database.

## A74 — 🛑 Guest price gate is not applied on the cart, or in the add-to-cart toast
**Where:** `/cart` and the add-to-cart toast, signed out · **Batch:** `buying/cart--guest` · **Severity: high** — this is the gate the platform deliberately built

Signed out, `/products/product-beyblade-burst-valkyrie` behaves correctly: **"Sign in to see
price"**, zero ₹ amounts on the page.

The **cart** for that same signed-out visitor shows the amount five times:

```
SOLD BY UNKNOWN                  ₹999.00
Beyblade Burst B-01 Valkyrie     ₹999.00
Summary · 1 item                 ₹999.00
Subtotal (1 item)                ₹999.00
Total                            ₹999.00
```

`"Sign in to see price"` appears **zero** times on the cart page.

**Second leak on the same path — the toast.** Adding the item while signed out raised:

> ✓ "Beyblade Burst B-01 Valkyrie" added to cart — 1 item, **₹999.00** total

A money value inside a plain string, which is exactly the case the platform's own guidance
singles out: a string cannot be wrapped in a slot component, so it must be gated with the
`useCanSeePrices()` hook. That hook is not being used here.

**Contradictory feedback in the same moment**: two toasts fired together — `! Authentication
required` *and* the success toast above. The visitor cannot tell which one is true.

**Cosmetic but related:** the guest cart renders **`SOLD BY UNKNOWN`** where a signed-in buyer
sees `SOLD BY BEYBLADE ARENA`.

## A75 — 🛑 Guest group/bundle add fails silently — a 401 nothing surfaces
**Where:** `/groups/{slug}` picker, signed out · **Batch:** `buying/cart--guest` · **Severity: medium-high**

Signed out, the picker accepts a selection normally (both members to qty 1, running total
shown). Pressing **Add selected to cart** produces **nothing a visitor can see** — no login
modal, no toast, no inline error — and the selection is cleared.

**Cause, from the console:** `POST /api/cart/group` → **401**, twice. The server is correct;
the client never surfaces the refusal. From the visitor's side the button is simply dead.

**The fix already exists in this codebase.** The cart's own checkout CTA, in exactly this
situation, opens:

> **Sign in required** — "You need to be signed in to checkout." — Cancel / Go to Login

The picker needs the same treatment. Same shape as A52 (the wishlist's *Remove all* lacking
the confirmation dialog the cart's has) — a good pattern that one surface doesn't use.

Covers two cases: `group-picker-guest` and `cart-guest-group-line-refused`. The latter's data
key is satisfied (`guestCartBundleLines: 0` — no half-created line) while its actual claim,
that the visitor is *told* to sign in, fails.

## Guest cart — what works (`buying/cart--guest`)
- Guest can add to cart and the line **survives a full reload** (`cartLinesAfterReload: 1`)
- Fee area degrades honestly: **"Sign in to see shipping & fees."** in place of the fee rows,
  and **"Sign in to add extras for this seller."** where the add-ons would be — no blanks, no errors
- Checkout CTA opens a proper **"Sign in required"** modal and keeps the visitor on `/cart`
- The product-page group strip and its **"Pick items from this group →"** link work signed out

**Measurement note:** `GET /api/cart` returns **401** for a guest — the guest cart is
client-side. The cart *page* is the only honest oracle; an API probe reports it empty.

## A76 — Admin cannot filter orders by add-on, so "who needs gift-wrapping today?" is unanswerable
**Where:** `/admin/orders` · **Batch:** `buying/cart--admin` · **Severity:** medium — an operational question with no way to ask it

The Filters drawer offers exactly two facets and nothing else:

- **STATUS** — All / Pending / Confirmed / Processing / Shipped / Delivered / Cancelled / Refunded / Return Requested / Returned
- **MANUAL PAYMENT** — All / Awaiting payment / Awaiting verification

No WhatsApp, no Gift wrap, no Shipment protection, no generic add-on facet. The toolbar search
is scoped to *"Product, store, or tracking number"*, and the rows carry no add-on chips, so an
admin cannot even scan for them by eye. A buyer pays ₹49 for gift wrap and nothing downstream
can find that order.

## A49 — widened: "Unknown buyer" is on the ADMIN orders list too, not just the seller's
Every row of `/admin/orders` reads **`Unknown buyer · - · order-…`**. This was recorded earlier
in the run against `/store/orders`; it is the same defect on both dashboards, so it is not
seller-scoped and is likely one adapter.

## `group-picker-cross-store` has no fixture in this catalogue
All **ten** groups on `/admin/grouped-listings` are single-seller — nine under
`store-beyblade-arena`, one under `store-letitrip-official`. The platform documents seeding
`product-tester-crossstore-a/b` precisely so the cross-store refusal is testable, but **no group
uses them**, so the read-only rendering of a cross-seller group cannot be observed at all.
Worth seeding a group in that shape; a guard with no data that triggers it is a guard nobody
can verify.

## A77 — 🛑 `/admin/return-requests` crashes — return triage is unavailable
**Where:** `/admin/return-requests` (the sidebar's "Returns" link) · **Batch:** `admin/orders-fulfillment--p1` · **Severity: high**

The page renders the error boundary instead of a list:

> Something went wrong · An unexpected error occurred. Please try again. · **Try again**

Zero rows, zero triage controls.

**Cause, from the console:**

```
TypeError: Cannot read properties of undefined (reading 'title')
  caught by ErrorView, reported [high]
```

Something reads `.title` off an undefined object during the client render — most likely a row
mapper reaching into an order/product shape the return record does not carry. Same
adapter-shaped family as the rest of this run.

**It matters right now:** the admin orders list holds a real order in `return_requested`
state, so there is a return waiting that no admin can action.

*(I first tried `/admin/returns` and got a 404 — that was my invented URL. The nav points at
`/admin/return-requests`. A route that 404s in a report is usually the report.)*

## A78 — 🛑 The "Awaiting payment" filter returns the entire unfiltered list
**Where:** `/admin/orders` Filters → MANUAL PAYMENT · **Severity: medium-high** — the payment-review queue cannot be worked

| `?paymentReview=` | Rows | Payment-state strings |
|---|---|---|
| *(absent)* | 25 | 24 |
| `awaiting_verification` | **1** — "No orders found" | 0 |
| `awaiting_payment` | **25** | **24** |
| `zzzznope` (deliberately bogus) | **25** | **24** |

`awaiting_payment` behaves **identically to a nonsense value**, which is what identifies the
parameter as ignored rather than merely unselective. The proof it is wrong rather than
coincidental: that result set contains rows labelled **"Payment verified"** and orders whose
status is delivered, refunded and returned. A delivered, refunded order is not awaiting payment.

`awaiting_verification` works correctly (and is legitimately empty).

## A79 — Two status enums, both with holes, on the same page
**Where:** `/admin/orders` and `/admin/bids` · **Severity:** medium

**Orders.** The detail editor's status dropdown offers **7** values — Pending, Processing,
Shipped, Delivered, Cancelled, Refunded, Return requested. **`Confirmed` and `Returned` are
missing**, yet both are real stored values (rows exist in each) and both appear in *this same
page's own filter drawer*. An admin can filter to Confirmed but can never set it, and can
never mark a completed return as Returned.

**Bids.** The filter drawer offers All / Active / Outbid / Won / **Cancelled** — and:

- `status=cancelled` → **"No bids found"** (a chip matching zero rows)
- `status=lost` → **8 rows** (the largest non-active state, with **no chip at all**)
- `status=won` → 2 rows (works)

Root Cause #33 (a dead chip) and #72 (missing coverage) in one drawer, verified in both
directions.

## A80 — A verified order's detail page says "No proof uploaded yet."
**Where:** admin order detail, `order-1-20260822-aucwon` · **Severity:** medium

The list row says **"Payment verified"**. The detail page shows **zero** Verify / Request
re-upload / Reject controls — correct — but no "Payment verified" badge either. Its Payment
Proof panel reads **"No proof uploaded yet."**, so the two surfaces contradict each other
about the same order and the state an admin needs is only on the one they cannot open.

## Admin orders/bids — what works
- Status change **persists**: `order-2-20260915-tpi7ax` Pending → Processing → Save → full
  reload → Processing
- Payment state is rendered **inline on the row** (24 strings across 25 rows)
- `/admin/bids` data is real and internally consistent — the same auction at ₹1,850.00 appears
  once `active` and once `outbid`, which is what a bid history should look like
- Bid filtering genuinely narrows: won → 2, lost → 8, cancelled → empty

## A81 — 🛑 22 of 25 admin order rows show a raw order id instead of the item
**Where:** `/admin/orders` · **Batch:** `admin/orders-fulfillment--p2` · **Severity:** medium-high

Counted over the rendered table: **22 rows** render as `🧾 Order order-1-20260822-aucwon` — an
emoji placeholder beside the order's own id — and only **3** render a product title with a real
thumbnail.

**The lead on the cause is in which 3 work.** The three correct rows are orders created through
the live checkout during this run; the 22 broken ones are seeded. The same split appears on the
detail pages — a freshly-created order lists its items with prices, a seeded auction-win order
shows **no items at all**. That points at seeded orders carrying an `items[]` shape the current
mapper cannot read, not at the list component.

Click-through itself works: every row has `Open full page`, and the destination renders.

## A82 — Admin payout rows have no row-action menu, so an excellent detail page is URL-only
**Where:** `/admin/payouts` · **Severity:** medium

Three real clicks on three different rows' **Row actions** buttons produced no menu, and a
whole-page search for `Open full page` / `Mark as paid` / `View Details` found nothing. On
`/admin/orders` the identical control opens a menu containing `Open full page`.

**Typing the URL reaches a page that is genuinely good** — and reconciles:

```
₹11,400.00 · pending · Beyblade Arena · tyson@beybladearena.in · [Mark as paid]
Gross amount            ₹12,000.00
Platform fee (0.05%)      -₹600.00
Refund deductions         -₹475.00
Net amount              ₹10,925.00     ← 12,000 − 600 − 475 = 10,925 ✓
Refund deductions (1): order-7-20260515-s1t2u3  -₹475.00
```

## A83 — "Platform fee (0.05%)" is charged at 5%
**Where:** `/admin/payouts/{id}/view` · **Severity:** medium — a wrong rate on a page sellers read

₹600.00 on ₹12,000.00 is **5%**, not 0.05%. The rate is being rendered without multiplying by
100 (a `0.05` fraction printed as a percentage). The *amount* is right and reconciles; the
*label* is off by a factor of 100.

## A49 — sharpened: the buyer name is available, one surface just doesn't read it
`/admin/fulfillment` shows the buyer on **every** row (`Mock User 1 / 2 / 3`) while
`/admin/orders` shows `Unknown buyer` on **all 25**. Same admin, same orders, same session — so
this is a mapper gap on the orders list, not missing data. That should make it a small fix.

## Admin fulfillment queue — works
Store-scoped (picker → Beyblade Arena → `Change Store`), and every row is genuinely pending:
`confirmed` or `processing` only, none delivered/cancelled/refunded. Rows carry the order id,
status, buyer name and a `Mark Picked` action. *(Copy nit: the heading says "Fulfillment Queue",
the line under it says "fulfilment queue".)*

## A84 — 🛑 "Save Configuration" on `/store/shipping` issues no write request
**Where:** `/store/shipping` (seller) · **Batch:** `selling/seller-shipping-payouts-setup` · **Severity: high**

Filled Carrier Name = `QA Carrier 1789432098900`, Shipping Price = `77`, pressed **Save
Configuration**. No error, no confirmation. After a full reload: **both fields empty**, panel
still reads *"Shipping Carrier — Not configured"*, `2 issues` badge back.

**Cause, from the network log:** the page issues `GET /api/store/shipping` on load and there is
**no PUT/POST/PATCH to it at all** after the click. The button fires no write request.

This is the **same shape** as the seller listing editor already recorded this run (its "Save
Changes" likewise issues no request) — two seller-dashboard save buttons wired to nothing
suggests one cause, not two.

## A85 — 🛑 Root Cause #74 is live again on `/store/shipping` — errors before any interaction
**Severity:** medium

On first paint, untouched, both fields empty, the form renders two `role="alert"` messages:

> Carrier name is required · Enter a valid shipping price (0 for free)

with the inputs pointing at them via `aria-describedby="field-…-error"`. So these are errors,
not hints — I checked the roles rather than reading the wording.

Internally inconsistent too: **`aria-invalid` is `null`** on both fields, so the error is
announced while the field does not report itself invalid.

**The payout-method form leaks a narrower version of the same thing**: `/store/payout-methods/new`
shows a pink **"2 issues"** badge on first paint while correctly withholding the error *list*
and the per-field messages. So the documented `submitAttemptCount` gate is working for the
summary and **the count badge is not gated by it**.

## A86 — 🛑 Payout method: the list row is blank and Delete does nothing
**Where:** `/store/payouts?tab=methods` · **Severity: high** — a seller cannot identify or remove a payout destination

Created Type `UPI`, Label `QA Test Method run-1789432098900`, VPA `qatester1789432098900@okaxis`.

| Step | Result |
|---|---|
| Create | ✓ saved, redirected to the methods tab |
| **List row** | ✗ renders **`💳 —`** with two **empty `<p>` elements**; `QA Test Method` appears **0 times** in the page source |
| Edit form | ✓ loads Type `upi`, the label and the VPA correctly |
| **Delete** (edit page) | ✗ no dialog, no navigation, no deletion |
| **Delete** (row-actions menu) | ✗ same — row survives both |

**The record is complete and the list payload is not** — the edit form proves the create
persisted everything, which localises this to the list serializer (Root Cause #38's shape).
With two methods a seller could not tell them apart.

**Privacy key passes:** the full VPA appears **0 times** in the list source
(`fullIdentifierInSource: 0`). It is present on the *edit* page, which is correct — the owner
must be able to see and change their own identifier.

*(Cleanup I could not do: because Delete is inert, test method `zJ8zothPmx85kZB3zvO9` is still
attached to `store-beyblade-arena`. Stores are wiped between runs, so it will not persist.)*

**Minor, same form:** the UPI VPA field is a multi-line `<textarea>` for a single-line identifier.

## Seller tab consolidation — works
- Clicking a tab writes back: `/store/payouts` → click Methods → **`?tab=methods`**
- The absorbed URL **`/store/payout-methods` redirects to `/store/payouts?tab=methods` with the
  Methods tab active** (read off the `aria-selected`/`data-state` marker, not appearance) — it
  lands on the right *tab*, which is the distinction the case draws

## A87 — 🛑 "Shop by Category" is mostly bundles, all reading "0 items" — and the same page says otherwise
**Where:** homepage category rail · **Batch:** `design-ux/homepage-carousels--guest--p1` · **Severity:** medium-high

Of seven tiles, only **two** are real browse categories. The other **five are pricing bundles**,
every one showing **`0 items`** — confirmed by their hrefs (`/categories/bundle-*`):

| Tile | "Shop by Category" rail | "Curated Bundles" section, same page |
|---|---|---|
| Burst Battlers Pack | **0 items** | **· 3 items** |
| Every Generation Starter Pack | **0 items** | **· 4 items** |
| Metal Fusion Duo | **0 items** | **· 3 items** |
| Original Collector's Set | **0 items** | **· 3 items** |
| X-Series Starter Set | **0 items** | **· 3 items** |
| *Spinning Tops* (real category) | 57 items | — |
| *Living Collectibles* (real category) | 4 items | — |

**The page contradicts itself**, which is what makes this a count bug rather than genuinely
empty bundles — one section reads their membership correctly and the rail reports zero for all
five. Two fixes: bundle rows should not appear in a browse-category rail at all, and the count
the rail reads (`metrics.productCount`) has no writer for bundle rows — the same family as the
reconciler defect where brand rows' `metrics.productCount` has no writer either.

## A88 — The homepage content rails do not auto-scroll at all
**Where:** Featured Products and sibling rails · **Severity:** medium — three cases are written against a behaviour that isn't there

Reset `scrollLeft` to 0 and sampled 8 times over 16s: **0 every time**.

**Both innocent explanations ruled out before concluding** — either would look identical:

- *pause-on-hover* — the rail reported `matches(':hover') === false` and the whole document had
  **zero** `:hover` elements
- *pause-when-off-screen* — called `scrollIntoView` first and confirmed the rail was in the
  viewport at `top: 147` (viewport ~800)

**The hero is different and works**: it auto-advances every ~6s through all five slides and
wraps (recorded as a pass). So this is specifically the *content* rails being manual-only.
They are navigable — the arrows work correctly including wrap-around, and native scrolling
works — but `carousel-loops`, `carousel-no-flicker` and `carousel-pause-on-interaction` are all
written against auto-scrolling rails and cannot pass as things stand.

## Homepage — verified working (`design-ux/homepage-carousels--guest--p1`)
- **Root Cause #73's fix holds.** The Live Auctions strip carries 7 auctions with *future*
  countdowns (1d/2d/3d/3d/4d/5d/6d) and **zero** Ended/Closed/Sold markers. The documented
  historical failure was the opposite — sorted by end date ascending with no lower bound, so it
  led with the longest-dead lots.
- **Hero video genuinely plays** — `currentTime` advanced 2.24 → 4.33 over 3s, then looped to
  0.74. A single-instant `paused` read said `true` and would have been a false negative.
- **Arrows wrap at both ends**: at `scrollLeft 0`, Previous → 1080 (= max); at 1080, Next → 0.
- **Social feed is genuinely absent**, not CSS-hidden: **0** requests to
  instagram/twitter/x/facebook/tiktok/youtube-embed hosts, 0 iframes page-wide.
- Promo, newsletter (1 `input[type=email]` + Subscribe), spotlight, featured stores (★ 4.1 with
  real descriptions) and events all render real seeded data.
- **Guest price gating is correct here** — "Sign in to see the bid", "Sign in to see the bundle price".

## A89 — Footer newsletter shows no inline error, only the browser's native bubble
**Where:** footer newsletter · **Batch:** `design-ux/homepage-carousels--guest--p2` · **Severity:** low-medium

Typing `not-an-email` and submitting produces **no inline error**: zero `role="alert"` elements
in the footer, `aria-invalid` is `null`, no toast. The only feedback is the native
`validationMessage` — *"Please include an '@' in the email address…"* — an OS-drawn popup that
vanishes on the next interaction and leaves the field unmarked for assistive technology.

Submission *is* correctly blocked and the typed value retained, which is the half that works.
But this codebase's own form standard is that a field surfaces its error through `aria-invalid`
plus a `role="alert"` block, and the footer newsletter doesn't use that pattern.

*(The homepage newsletter, by contrast, subscribes correctly on **Enter** alone — confirmation
"Thanks for subscribing. Check your inbox for updates." and the input resets.)*

## A90 — Organization and WebSite JSON-LD are each emitted twice on the homepage
**Severity:** low · Five blocks total: `Organization`, `WebSite`, `Organization`, `WebSite`,
`FAQPage`. Duplicate entity markup is worth collapsing.

## Homepage p2 — verified working
- **Exactly one `<h1>`** ("Buy, Sell & Auction Collectibles") against 22 `<h2>`s
- **FAQ structured data matches**: all **16** declared questions are in the DOM
- **Announcement strip overlays** rather than pushes — `position: absolute`, `top: 139` = the
  hero's own top edge, 36px tall, with a dismiss ×
- **No gap** between nav and hero (nav ends ≈93, hero starts 139, banner fills 139–175)
- **Every hero slide has copy**: 5 distinct headlines, and the on-screen slide showed
  headline + *"Filter by category, condition and price across every seller on the marketplace."*
  + a **Start browsing** button
- **No franchise-specific strip.** Section headings and sub-copy are entirely generic; the
  franchise names present are all *item content* (a store name, event titles, blog titles) and
  span four franchises — Beyblade, Pokémon, Gundam, Hot Wheels

## Method — two more near-misses this batch, both caught the same way
1. **FAQ structured data** looked like a textbook mismatch (6 of 16 questions on the page) —
   because `innerText` excludes collapsed accordion panels. `innerHTML` found **all 16**.
   Content behind expandable UI is acceptable to search engines.
2. **A screenshot caught two hero headlines printed over each other**, which looked like a real
   overlap bug. Measuring the track showed slides at `left` −1128/−739/−349/**160**/1376 with
   one in the viewport — it was a mid-transition frame, not a fault.

That is now **five** would-be false findings this run caught by re-measuring rather than
trusting a first reading. The pattern is always the same: a single view of a moving or
partially-rendered thing.

## A91 — 🛑 `/admin/sections` is a dead-end list — the homepage sections editor cannot be opened
**Where:** `/admin/sections` · **Batch:** `design-ux/homepage-carousels--admin` · **Severity: high** — the entire homepage is unconfigurable

All 22 sections list correctly (name, order number, enabled state) and **every row is a dead end**.
Established three ways rather than assumed:

- each row contains **0 buttons, 0 links, 0 elements with `cursor: pointer`**
- a **real click on a row** changes nothing — URL stays `/admin/sections`, no dialog, no drawer
- the only buttons anywhere on the page are the sidebar nav items and **Log out** — no New, no
  Edit, no Configure, no Row actions

Root Cause #56's shape (see it, never open it). **It blocks four cases in this batch outright**,
each of which begins *"open the homepage sections editor"*: `section-config-actually-renders`,
`section-save-preserves-other-fields`, `carousel-toggles-take-effect`, `banner-buttons-from-config`.

## A92 — The "Reviews" section is configured Enabled at order 10 and renders nothing
**Severity:** medium

The admin config lists **Reviews · Order: 10 · Enabled · Active**. On the homepage there is no
reviews section at all: the band between *Featured Stores* (y 5510) and *Events & Offers*
(y 6201) holds only store-card content — no heading, no review cards — and the word "review"
appears just **four** times on the entire page, all inside store rating labels.

There are 79 seeded reviews, so it is not an empty-state.

**This corrects part of an earlier pass**: in `--guest--p1` I credited
`sections-social-proof-render` partly on "collector reviews", on the strength of ★4.1/★3.6
ratings appearing on store cards. Those are store ratings, not a reviews section.

## Homepage section order — verified against the config, section by section
Every enabled section renders in its configured position:

`Welcome(1)` → `Carousel(2)` → `Trust indicators(3)` → `Categories(4)` → `Products(5)` →
`Auctions(6)` → `Pre orders(7)` → `Featured bundles(8)` → `Stores(9)` → ~~`Reviews(10)`~~ →
`Events(11)` → `Event raffles(12)` → `Prize draws(13)` → `Blog articles(14)` → `Banner(15)` →
`Newsletter(16)` → `Stats(17)` → `Features(18)` → `Whatsapp community(19)` → `Faq(20)` →
`Brands(21)`; `Social feed(22)` is **Disabled** and correctly absent — which independently
confirms why nothing social rendered in the guest batch.

**Also verified render-side** (the config half being unreachable):
- Trust bar: exactly **4** items — Authenticity checked · Escrow-backed payments ·
  Straightforward returns · Real human support
- *Security You Can Trust*: exactly **4**, each with a description, and **platform-specific**
  rather than boilerplate — "Public scam registry", "Encrypted personal data — Addresses, phone
  numbers and payout details are encrypted at rest"
- Seller CTA banner carries exactly the two expected buttons: **Start selling →** → `/seller-guide`,
  **Browse the marketplace** → `/products`

## A93 — 🛑 The price-range facet empties the result list no matter what you choose
**Where:** `/products` filter drawer → `/api/products` · **Batch:** `content-discovery/search` · **Severity: high** — a buyer who touches the price slider sees "no products"

Seen in the UI first: `q=beyblade` + Min price 5000 via the drawer → **0 results**, empty state.
Then `minPrice=500` → also 0, on a catalogue whose cheapest visible item is **₹899**.

Network, to explain what was already visible:

| Query | HTTP | total |
|---|---|---|
| *(no price param)* | 200 | **50** (first price ₹899) |
| `minPrice=0` | 200 | **0** |
| `minPrice=1` | 200 | **0** |
| `minPrice=500` | 200 | **0** |
| `maxPrice=999999` | 200 | **0** |

**`minPrice=0` excluding everything is the proof** it is not a threshold or a unit mismatch:
the mere *presence* of either bound empties the set, in both directions, with and without a
search term. Every response is a 200.

## A94 — Sorting is discarded whenever a search term is present
**Where:** `/products` · **Severity:** medium-high

With `q=beyblade`, `sort=title` and `sort=-title` return a **byte-identical** first five, and
neither ordering is alphabetical. The URL updates correctly and the term is retained.

**The control localises it:** without `q`, the same sort works in both directions —
`?sort=title` → *1-on-1 Beyblade X…, Bearded Dragon…, Beyblade Burst App…, Beyblade Burst B-01…*
(properly ascending), `?sort=-title` → *Original Series…, Metal Fight…, Beyblade Burst B-97…*.

Note the order returned **with** a search matches the **descending** list, so the search path
appears to impose one fixed ordering regardless of the direction requested.

## A95 — The "Sold" availability tab returns the full unfiltered set
**Severity:** medium

With `q=beyblade`: `availability=available` → **39**, `availability=all` → **50**,
`availability=sold` → **50**. The three are mutually constrained, so *sold* should be ~11.
Returning the full set means that tab is inert — the archive is unbrowsable.

**Working alongside it**, worth recording so a fix doesn't regress them: `availability=available`
narrows correctly, `condition=broken` → 0 against an unfiltered 50, and the search itself is
sound — `q=zzzznope` → **0** against `q=beyblade` → 50.

**No facet labelled "tag" exists** on `/products`; the drawer offers Listing type, Category,
Condition, Price Range, Brand, Shipping, Bundles and Features. I exercised Condition as the
nearest equivalent.

## A96 — 🛑 The FAQ question list is empty on EVERY filtered view, while the counts are right
**Where:** `/faqs?q=…` and `/faqs/{category}` · **Batch:** `content-discovery/search--guest` · **Severity: high**

| View | Sidebar count | Results area | Questions rendered |
|---|---|---|---|
| `/faqs` unfiltered | All FAQs **50** | "63 questions" | **51** ✓ |
| `/faqs?q=refund` | All FAQs **12** (Returns & Refunds 7, General 3, Orders & Payment 1, Scam Awareness 1) | **"0 questions"** | **0** ✗ |
| `/faqs/returns_refunds` | (sidebar says 7) | **"0 questions"** | **0** ✗ |

The category counts recompute **correctly** — Shipping/Product/Account/Technical all drop to 0
for "refund" while Returns & Refunds keeps all 7. So the query works and only the *list*
fails to render.

**The unfiltered page proves the list component works**, so one fix likely covers both entry
points: the questions render on the unfiltered page and on no filtered view, whether the
filter comes from a search term or a category route.

*(Copy nit: `/faqs/returns_refunds` titles itself "**Returns_refunds** FAQs" — the raw slug, not
the sidebar's "Returns & Refunds".)*

## A97 — 🛑 Store search returns nothing for a word in a store's own name
**Where:** `/stores?q=…` · **Severity:** medium-high

`/stores?q=beyblade` renders **"No stores found."** with zero cards — while the unfiltered list
holds two stores, one of them named **"Beyblade Arena"** with a description full of the word.
API agrees: unfiltered **2**, `q=beyblade` **0**.

**Events and blog are fine**: events 8 → 7 → 0 (nonsense); blog 3 → 3 → 0. `/api/reviews`
returns **HTTP 400** even with no parameters, so review search was not exercised — not called a
defect without knowing what it requires.

## A98 — Typeahead: mojibake prices, and prices shown to signed-out visitors
**Where:** header search suggestions · **Severity:** medium

Every suggestion price renders as **`â‚¹899`**, `â‚¹749`, `â‚¹1,599` — UTF-8 `₹` decoded as
Latin-1. The announcement banner on the same page shows `₹999` correctly, so the corruption is
specific to the typeahead payload, not the page encoding.

**And the prices are shown at all** — I was signed out (header offering *Sign in / Register*).
This is another un-gated surface alongside the cart leak in **A74**.

## Search — verified working (`content-discovery/search--guest`)
- **Typeahead differs by term** and needs a *real keystroke* — a programmatic value-set produces
  no dropdown at all
- **No drafts/archived/probe rows** in suggestions (the one "Sold Out" entry is a published listing)
- **Prefix match**: `dran` 6 ⊃ `dranzer` 4, both ≪ 50 unfiltered, `zzzznope` 0
- **AND semantics proven by arithmetic**: `red dranzer` **0** < `red` 2 and `dranzer` 4 — an OR
  would have returned ≥ 4
- **Case-insensitive** on terms that exist: BEYBLADE/beyblade/Beyblade all 50, DRANZER/dranzer
  both 4. *The accent half is untested* — POKEMON/pokemon/Pokémon all return 0 only because the
  catalogue has no Pokémon products, which proves nothing
- **Single chars narrow**: x 24, v 25, q 0, z 9. `b` → 50 is corpus truth, not a no-op — and
  testing `b` alone would have produced a false finding
- **`/scams`** lists real verified profiles with aliases, all six scam types, and a report CTA

## Root Cause #83 is FIXED — verified on `/admin/team`
**Batch:** `content-discovery/search--admin`

The documented failure was that any filter chip produced a malformed concatenated clause and
silently emptied the team list. It does not: applying the **Blog** chip gives
`?page=1&group=blog_poster` and returns exactly **1 row — Mock Employee 1, the Blog Poster**.
Not empty, and the right row.

*Two caveats on that verdict.* `emptyChipCount` **cannot** be 0 with this fixture — 20 chips
against 2 employees in 2 groups means ~18 chips must legitimately return nothing. And
`/api/admin/team` **ignores the `group` parameter entirely** (no group / `blog_poster` /
`zzzznope` all return 2), so the narrowing that works is happening **client-side**.

## A99 — `/admin/products` promises seller-name search and doesn't do it
**Severity:** low-medium

The box says *"Search products, SKUs, or **seller names**"*. `q=Beyblade Arena` → **"No products
found"**, though every product in the catalogue belongs to that seller. Seller names are not in
the search corpus.

*(Consistent with search being AND-based across words — no product title contains both
"Beyblade" and "Arena" — so the fix is to index the seller name, not to loosen the operator.)*

## A49 — third surface: `/admin/products` shows "Unknown seller"
Every row's seller column reads **"Unknown seller"**, matching "Unknown buyer" on both the admin
and seller order lists. Three surfaces, same symptom — likely one adapter.

## Admin search — verified working
- **`/admin/scammers`** keeps all three of its placeholder's promises: `Vikram` (partial name)
  5 → **1**; `paytm` 5 → **1**, matching **Bey_King_India / Rare Blades Official** whose names
  contain no "paytm" — so the **UPI index is real**; `zzzznope` → *"No scammer profiles found"*
- **Older records are findable**: `/admin/products?q=Dragoon` → 4 rows including two seeded
  fixtures (*Dragoon F (Video Demo)*, *Dragoon Storm (Rare Sealed)*)
- **Nonsense returns nothing on every reachable surface** — `/products` 0/50, `/stores` 0/2,
  events 0/8, blog 0/3, `/admin/scammers` and `/admin/products` both empty-state.
  `/api/reviews` is HTTP 400 with no params, so it could not be included either way

## Note — `search-no-empty-toolbar-gap` is not testable as written
It refers to *"a listing page whose search box was removed"* and names no page. Every admin
listing I opened still **has** one: `/admin/team`, `/admin/scammers`, `/admin/products`,
`/admin/orders`. The case needs the page named.

## A100 — The Bug Hunters leaderboard has no link anywhere on the site
**Where:** site footer · **Batch:** `public-pages/bug-hunters--guest` · **Severity:** medium — a built page nothing points at

Enumerated **all 93 footer anchors**, matching on both visible text (`Bug Hunter(s)`) and
destination (`href` containing `/bug-hunters`). **Zero matches on either.**

The SUPPORT column — where the case says it belongs — contains exactly: Help Centre, FAQs,
Contact Us, Track Order, About Us, Our Ethics, Developer, Scam Registry, Item Requests, Report
a Problem.

`/bug-hunters` itself **works** (recorded as a pass): it renders *"Bug Hunters Leaderboard"*,
*"Testers ranked by confirmed bugs found during our QA program."* and a ranked entry. But the
only link I have seen anywhere is the **"← Back to Tester Hub"** control *on* that page, which
points the other way. It is reachable only by typing the URL — Root Cause #37's shape.

*Method note: I searched the footer's DOM rather than its rendered text, so a link inside a
collapsed mobile accordion would still have been found. It is absent, not merely hidden.*

## Bug Hunters leaderboard — the bot is correctly excluded
`botAccountOnLeaderboard: 0`. The word "Claude" appears nowhere on the page; the only
occurrences of "Tester" are in the heading and description, not in a row. Worth recording
plainly: **the account driving this entire run is the bot, and its activity is properly kept
off a board that exists to credit people.**

Two limits stated rather than glossed:
- With a **single** entry, *"ranked by confirmed-bug count, most bugs first"* is trivially
  satisfied — one row is sorted whatever the comparator does. The ordering half needs two
  testers with different counts.
- Copy defect: the entry reads **"1 bugs"**.

## Case-quality note — `leaderboard-empty-state` cannot be performed as written
**Batch:** `public-pages/bug-hunters--admin`

Step 3 is *"un-confirm it, so no confirmed bugs remain"*. On `/admin/tester-feedback` →
**Main Issues** I enumerated every button and anchor and searched text + aria-labels for
`unmark / un-confirm / undo / remove / revoke / clear / not a bug / reopen / credit`:
**zero matches**. The only mutating control is **"Mark as Bug"**, which goes the other way.

Two further reasons not to force it:

- **The fixture reference is stale.** The case says the bug is *"credited to Mock User 18"*;
  the live credit line reads **"Confirmed — credited to Mock User 3"**.
- **The record is a deliberate demo fixture and says so**: *"Seed fixture — the reported bug
  behind the v1 demo case. Already confirmed and credited, then reopened as v2. Exists so an
  admin can see what a confirmed submission looks like without waiting for a real tester to
  file one."* Un-confirming it would destroy the thing it exists to demonstrate — with no
  supported way to restore it.

The populated state of `/bug-hunters` is verified good (guest batch); only the **zero-bugs**
state is untested. To make this case runnable, either add an un-confirm control or seed a
second, disposable confirmed bug.

## A101 — 🛑 A rejected coupon shows the buyer nothing at all
**Where:** checkout step 3 coupon box · **Batch:** `buying/buying-coupons--p1` · **Severity: medium-high**

Applying **ARENA25** — a store coupon for the very seller whose item is in the cart — produced:
**no message, no toast, no inline error, no discount, no change to the total.** Nothing.

**Cause, from the console:** `POST /api/cart/coupon` → **HTTP 400**. The server rejected it and
the client swallowed the response.

The rejection may well be correct (per-user limit, expiry, first-order-only — the page's own
help panel lists six such reasons). **That is exactly why the silence is the defect**: the buyer
cannot tell a declined coupon from a broken button, and the reason is already enumerated one
click away in "Why a coupon might not apply".

**It also poisons four sibling cases.** A category-restricted rejection, a duplicate-code
rejection and a second-store rejection are all *indistinguishable from each other and from a
silent failure*, so none of them can produce a trustworthy pass until a reason is surfaced.

Same family as **A75** (guest group-add → 401, nothing shown).

## A102 — 🛑 A free-shipping coupon applies at −₹0.00 and shipping is still charged
**Severity:** medium-high — the coupon "works" and does nothing

**FREESHIP499** (platform-wide, ₹499 minimum; cart was ₹1,399, so it qualifies) **is accepted**:

```
Coupon | FREESHIP499 | −₹0.00 off | Remove coupon
cart.appliedCoupons = [{ code: "FREESHIP499", amount: 0 }]
Order Summary: Shipping ₹77.00 … Total ₹1,497.80   (unchanged)
```

The discount calculator returns **0** for the `free_shipping` type and never touches the
shipping line. The UI is at least honest — it prints `−₹0.00` — but the buyer has applied a
free-shipping coupon and is still paying ₹77 shipping.

## Coupons — the machinery itself is sound (`buying/buying-coupons--p1`)
Worth recording precisely, because it narrows A101/A102 to two specific types rather than
"coupons are broken":

**SEALED20 works completely.** On a ₹1,399 item:
- discount **₹279.80** = **20% of ₹1,399** — *not* 20% of the ₹1,497.80 total (299.56), so the
  basis is the item subtotal, exactly as `discountBasis: 1399` expects
- Order Summary gains **"Coupon discount −₹279.80"**
- Total **₹1,497.80 → ₹1,218.00**, and the whole summary reconciles:
  1,399 + 77 + 10 + 10 + 1.80 = 1,497.80 − 279.80 = 1,218.00
- The coupon row, the stored cart (`amount: 279.8`) and the summary line all agree

**Remove works** — code gone from the page, `appliedCoupons: []` in the stored cart, input restored.

**The help panel is genuinely good** and collapsed by default on both `/cart` and checkout
(native `<details>`, 1,369 chars at checkout). It documents the stacking rules, where each
discount lands, six reasons a coupon may not apply, and closes with: *"Coupons are re-checked
when you place the order. If one has expired or run out while it sat in your cart, it's removed
and your total is recalculated before payment."*

**Corrects an earlier doc finding:** the coupon box is on **step 3 (Payment)**, not step 2.
`/help/shopping` tells buyers "step 2 of checkout (Order Summary)" — wrong on both counts.

**Blocked by the single-seller catalogue** (7 cases): every stacking case needs a cart spanning
two sellers, and every reachable product belongs to Beyblade Arena.

## A103 — 🛑 "Apply at checkout" from My Coupons carries the code and the checkout ignores it
**Where:** `/user/coupons` → `/checkout?coupon=CODE` · **Batch:** `buying/buying-coupons--p2` · **Severity:** medium-high

My Coupons lists three claimed coupons (SEALED20, FREESHIP499, LIMITEDSET), each with an
**"Apply at checkout"** button. Pressing it on FREESHIP499 navigates to
**`/checkout?coupon=FREESHIP499`** — so the wallet does its half correctly.

The checkout then does nothing with it. After a full load: the stored cart still holds **only
SEALED20**, `FREESHIP499` appears **nowhere** on the page, and there is **no alert, toast or
inline message**. The click accomplishes nothing and says nothing.

**Distinct mechanism from A101**, though the outcome looks identical: typing a code into the
checkout box at least fires `POST /api/cart/coupon` (which 400s silently). Here **no request is
made at all** — the query parameter is simply never read.

It also lands on **Step 1 of 3**, where the coupon box doesn't exist (it's on step 3), so the
buyer isn't even deposited near the control they'd need to do it by hand.

## A104 — The cart shows a coupon's discount but not which coupon
**Severity:** low-medium

After a hard reload of `/cart` with SEALED20 applied, the summary correctly shows
**"Coupon discount −₹279.80"** and Total ₹1,218.00 — but **`SEALED20` appears nowhere on the
page**, and the cart has no coupon UI at all. A buyer returning to their cart can see that
₹279.80 is off and neither which code did it nor how to remove it.

*(The persistence itself is correct and is recorded as a pass: the coupon survives a hard load
and is still listed, with its amount and a Remove control, when checkout is reopened.)*

## Coupons help panel — present and consistent on all three surfaces
**Batch:** `buying/buying-coupons--guest`

`/promotions/coupons` (signed out) carries the same `How coupons work / Stacking rules`
`<details>`, **collapsed by default**, **above the grid**. The grid itself is fully populated for
a guest — all eleven seeded codes with descriptions and Copy/Claim controls: LIMITEDSET,
SEALED20, ARENAVIP, NEWBLADER, OFFICIAL10, BUYNOW10, ARENA25, BLADER50, TOURNAMENT2026,
FREESHIP499, REHAN10.

| Surface | Panel | Collapsed by default | Length |
|---|---|---|---|
| `/cart` | ✓ | ✓ | — |
| `/promotions/coupons` | ✓ | ✓ | 1,201 chars |
| checkout step 3 | ✓ | ✓ | 1,369 chars |

The 168-char difference is the checkout copy's closing sentence — *"Coupons are re-checked when
you place the order…"* — which is an order-placement concern and reasonably omitted while
browsing. **Not a defect.**

*Navigation note:* `/promotions` **redirects to `/promotions/deals`**, so that case's own
startPage lands on the Deals tab where no panel exists (and none is wanted). The coupons
listing is `/promotions/coupons`.

## A101 — SHARPENED: ARENA25 is valid and is still refused
**Batch:** `buying/buying-coupons--admin` · **Upgrades A101 from "silent refusal" to "wrong refusal, silently"**

`/admin/coupons` shows ARENA25 as:

```
ACTIVE | SELLER | 25% OFF | Beyblade Arena — 25% Off (Max ₹500)
Min order: ₹1000 | Expires: 25/10/2026 | 0/200 used
```

Against the cart that was refused: **₹1,399** (above the ₹1,000 minimum), seller **Beyblade
Arena** (the coupon's own store), today **16/09/2026** (well before expiry), usage **0 of 200**.

**Every condition is satisfied and the coupon is still rejected with a 400** — and the buyer is
told nothing. So this is not "the UI fails to explain a correct refusal"; a valid coupon is
being refused, invisibly.

## A105 — Second order confirms the quote/charge gap, with a different amount
**Where:** checkout → order · **Severity: high** (corroborates A71)

`order-1-20260916-rhj4nf`, placed with SEALED20:

| | |
|---|---|
| Quoted at checkout, every step | **₹1,218.00** |
| Recorded on the order | **₹1,418.00** |

**+₹200.00.** The order's own arithmetic is self-inconsistent too:

```
Items (1)                      ₹1,399.00
Subtotal                       ₹1,620.80   ← 1,399 + 10 + 10 + 1.80 + an unexplained ₹200.00
Shipping                          ₹77.00
Discount (SEALED20)            −₹279.80
Total                          ₹1,418.00
```

This is the **second** order this run whose recorded total exceeds its quote — A71's was
+₹229.80 (exactly 10% of goods) on a ₹2,298 cart; this is +₹200.00 on a ₹1,399 cart, so it is
**not a consistent percentage** and the two need reconciling together.

## Coupon usage count — verified correct
`SEALED20` **28/75 → 29/75** across a real order. `usageIncrement: 1` exactly. The coupon is
also recorded on the order: *"SEALED20 · −₹279.80"* and *"Discount (SEALED20) −₹279.80"*.

**Per-user limit: unresolved, deliberately not called.** Re-applying SEALED20 immediately after
the order consumed it **succeeded** at full value. That is only a defect if its per-user limit is
1 — and the admin list exposes only the *total* (29/75), with no per-user figure anywhere. The
observation is recorded; the conclusion needs the coupon's stored config.

## A106 — 🛑 A listing cannot be reported from the listing
**Where:** product page → `/report` · **Batch:** `admin/users-trust` · **Severity:** medium-high

Searched the entire product page for any control matching `report / flag / problem / abuse` by
text, aria-label or href. The **only** matches are two footer *"Report a Problem"* links — global
site chrome present on every page, pointing at the generic `/report` form. **No per-listing or
per-store report affordance exists.**

**And the generic form can't realistically stand in for one.** It asks the buyer to type an
**Entity Id** into a free-text box — *"Tell us which item this is about"* — with nothing
prefilled, because nothing linked them there from the item. A buyer would need to know the
internal slug (`product-beyblade-burst-valkyrie`) to report a product.

*(I did not file a real report to test the success path. The form warns "Reports go to the
LetItRip trust & safety team. Frivolous reports may impact your account", its default Reason is
**Scam**, and a filed report is an accusation against a seller in a human queue. That half needs
a fixture explicitly marked as QA.)*

## A85 — now on FOUR forms: validation errors render before any interaction
`/store/shipping`, `/store/payout-methods/new`, **`/item-requests/new`**, **`/report`** — all
render `role="alert"` field errors and an "N issues" badge on first paint, untouched.

**The gate exists and is half-wired.** On both forms tested here the *summary* is correctly
gated — "Please fix the following: …" appeared only after pressing Submit — while the
**per-field messages and the count badge are outside it**. So the fix is to move those two
behind the same `submitAttemptCount` gate the summary already uses.

**`aria-invalid` is `null`** on every field checked, before *and* after a failed submit — the
errors are announced while the fields don't report themselves invalid.

## Validation itself is correct on both forms
Empty submits are properly refused, file nothing, and name the specific rule rather than just
"required":
- `/item-requests/new` → *"Give the request a title of at least 3 characters."* /
  *"Describe what you're after in at least 10 characters."*
- `/report` → *"Tell us which item this is about."* / *"Please describe the problem in at least
  10 characters."*

## A107 — No route from the user list to a user detail page
**Where:** `/admin/users` · **Batch:** `admin/users-trust--admin--p1` · **Severity:** medium

Searched the page for anchors matching `/admin/users/` — **zero**. The row-actions menu offers
only **Manage Selected · Ban user · Lift ban** — no View, no Open full page, no Details.

**Third instance of the same shape this run**, after `/admin/payouts` (row menu never opens,
leaving an excellent detail page URL-only — A82) and `/admin/sections` (rows have no affordance
at all — A91). Worth triaging as one pattern.

*(I did not type a guessed `/admin/users/{id}` — I have no id from the page, and inventing one
is the trap that produced a false 404 earlier in this run.)*

## The Trust & Safety queues are all built, healthy — and all empty
Four surfaces render correctly with genuinely good empty-state copy, and hold **no data**:

| Surface | State |
|---|---|
| `/admin/item-requests` | *"Queue empty / No item requests pending approval."* |
| `/admin/support-tickets` | *"No support tickets found"* |
| `/admin/moderation` | *"Inbox zero / No pending moderation."* — and it explains the actions first: *"Approving releases the asset; rejecting blocks it."* |
| `/admin/reports` | *"No open reports / All caught up."* |
| `/admin/banned-addresses` | *"No addresses found"* — with STATUS chips All/Banned/Unban Requested/Suspicious and Sort by Flagged Date or City |

**This is a fixture gap, not a defect** — `supportTickets` is one of the collections documented
as never registered with the seeder. Seeding one row into each would make ~6 cases testable
(approve/reject, triage, assignment, unban flow).

**`/admin/scammers` is the exception and it works**: 5 profiles with aliases, scam types and
counts, and a search that keeps all three of its promises — `Vikram` → 1, `paytm` → 1 (matched
by UPI, since neither name contains it), `zzzznope` → empty state.

## Three cases declined, not blocked
- **`admin-delete-user-complete`** — destroys a Firestore profile, sessions **and the Firebase
  Auth record**, with no undo. `/admin/users` row 1–25 include **real signups**
  (`radhadanu61@gmail.com`, `qa-signup-*@mailnull.com`). Even a seeded persona is wrong: the
  seed does not recreate Auth records for existing uids, so it would stay broken for every later
  batch. Needs a disposable account on staging.
- **`users-role-change`** — writes to a preserve-tier user doc, and its own data key
  (`unintendedFieldChanges`) names the exact risk this run has already documented: editors
  seeded from list rows re-sending stale defaults for untouched fields.
- **`sessions-revoke`** — signs a real person out.

## A108 — The Add Product form accuses you before you have typed anything (fifth instance)
**Where:** `/admin/products` → Add Product · **Severity:** medium · **Cluster:** A85

On first paint, untouched, the drawer renders one `role="alert"` reading **"Product title is
required"** in red under an empty Title field. `errorsBeforeSubmit` expected **0**, observed **1**.

Fifth form in this run with the same shape, after `/store/shipping`, `/report`,
`/item-requests/new` and the address form. `aria-invalid` is `null` on **44/44** inputs both
before and after a failed submit.

**One difference from the others worth noting:** this form renders **no error summary at all**
(no "Please fix the following" block), where `/report` and `/item-requests/new` both do. So the
per-field/summary split that made A85 tractable does not apply here — there is nothing gated.

## A109 — A raw Zod internal is shown to the admin as the error message
**Where:** `/admin/products` → Add Product → Create · **Severity:** high

Submitting with only a title set gives `POST /api/admin/products` **400** and renders, under the
**Price (₹)** label:

> **Invalid input: expected number, received undefined**

That is the server's own validator text reaching the user verbatim. It names no field, states no
rule, and tells an admin that "a number is undefined" rather than that Price is required.
CLAUDE.md Rule #9 point 6 forbids exactly this — `toUserMessage(code, t)` exists so that an
unmapped code never prints server internals.

The *placement* is correct (inside the field's own `appkit-form-field` wrapper), so this is a
message-mapping defect, not a layout one.

## A110 — A draft cannot be saved; publish validation is enforced on a draft
**Where:** `/admin/products` → Add Product · **Severity:** high

Zero controls matching `/draft/i` anywhere in the editor — the only submit is **Create product**.
The form does carry a Status select defaulting to `draft`, so I tested the substantive claim:
title only, status `draft`, everything else empty → **400**, nothing created.

This is not a naming quibble about a missing button. Publish-time validation is being applied to
a record explicitly marked **draft**, which is the failure the case names outright: *"A draft save
that enforces publish validation is the failure."* A seller or admin cannot start a listing and
finish it later.

## A111 — The admin orders list shows no money at all
**Where:** `/admin/orders` · **Severity:** high

The table has **four columns**: checkbox · Name · Status · Updated · row actions. There is **no
total or amount column**, at any width, and the card view at 390 omits it too.

Tested against the table's own `innerHTML` rather than rendered text, to rule out a column hidden
behind a media query: **`/₹/.test(table.innerHTML) === false`**. Zero rupee values in 25 rows.

**Why this is more than a missing column:** this run has already recorded **two orders whose
stored total exceeds the total quoted at checkout** (A71 ₹2,319.80 → ₹2,549.60; A105 ₹1,218.00 →
₹1,418.00). The one surface where an operator would notice that at a glance does not show the
number.

## A112 — Row actions and bulk actions carry no icons (7 of 7 entries)
**Where:** `/admin/products`, `/admin/stores` · **Severity:** low

| Surface | Entries | With an icon |
|---|---|---|
| `/admin/products` row menu | Approve · Reject · Quick edit | **0 of 3** |
| `/admin/stores` row menu | Manage Store · Open full page · Verify store · Suspend store | **0 of 4** |
| bulk bar | Toggle Featured · Apply | **0 of 2** |

**Destructive marking works** — Reject computes to `rgb(185,28,28)` against `rgb(63,63,70)` for its
siblings — so the `destructive` flag reaches the renderer while `iconKey` does not. Per the case's
own reasoning this reads as a **registry-adoption gap**: an entry defined inline also bypasses
permission gating and confirmation copy.

## ✅ VERIFIED FIXED — the `/admin/stores` list-serializer defect (Root Cause #38)
Changed one presentation flag on Beyblade Arena and watched the wire. The PATCH body:

```json
{"storeStatus":"active","isFeatured":true,"isVerified":true,
 "capabilities":["host_auctions","host_preorders","verified_seller","create_coupons","suggest_brands"]}
```

`isVerified` and all five capabilities are sent with their **real** values, not stale `undefined`
defaults. After a reload the store is still Verified and still Active. Editing an unrelated field
no longer un-verifies a store. *(I restored `isFeatured` afterwards.)*

## ✅ Two halves that pass, worth recording so nobody re-tests them
- **Status badges** are correct everywhere checked — `/admin/orders` renders all nine statuses in
  three colour families, and **dark mode inverts both the tint and the ink** (pending
  `rgb(28,21,8)` / `rgb(251,191,36)`; cancelled `rgba(127,29,29,.25)` / `rgb(251,113,133)`).
  Root Cause #67's pairing is honoured.
- **Phone width** is genuinely handled: `/admin/orders`, `/admin/users` and `/admin/products` each
  render **zero visible `<table>`** at 390 and `scrollWidth === clientWidth`, and row menus stay
  fully on screen (orders: left 198 → right 356 in a 390 viewport).

### Two measurements of my own I corrected before filing them
1. An option-count probe said the last-section picker had "96 options, 72 clipped" — the selector
   had caught every `<li>` on the page including breadcrumbs. **The screenshot showed the picker
   opens as a normal overlay.** Not a bug.
2. `--bottom-chrome-height` reads `0px` on `/admin/products` while a bulk bar is visible, which
   looked like Root Cause #71. **The bar is inline at the top of the list, not fixed to the bottom
   edge** — so `0px` is correct. Not a bug.

## A113 — `/admin/sections` cannot create a section at all
**Where:** `/admin/sections` · **Severity:** high · **Extends A91**

The read side works: 22 homepage sections listed with `Order: N • Enabled` and an Active badge.
The write side does not exist. Scanning every visible control for `new|add|create` returns **one**
match and it is a false positive — the sidebar link to `/admin/newsletter`, matched on
"**New**sletter". There is **no `<select>` on the page**, so there is no section-type picker to open.

The case was written to catch *a type the picker omits*. In fact **the picker does not exist**, so
no homepage section can be created, and the 22 that exist can't be edited, reordered or deleted
either — the first row contains **zero** buttons or links and its cursor computes to `auto`.

Third and most complete instance of the dead-end-list pattern (A82 `/admin/payouts`, A107
`/admin/users`): those at least offer *some* verb. This one offers none.

## A114 — Catalogue approvals: the numbers are shown, the photographs are not
**Where:** `/admin/catalogue-approvals` · **Severity:** high

**Genuinely improved** — Root Cause #56's "deciding blind" is half repaired. A **View** button now
sits beside Approve/Reject, and the modal shows *Submitted by · Estimated price ₹12,000.00 ·
Quantity 1 · Condition fair · Submitted 3d ago*, with Approve and Reject available from inside it.

**What is still missing is the part that matters.** The modal contains **zero `<img>` elements**
and **no description**. The list row's "thumbnail" is the **📚 emoji** — `querySelector('tbody img')`
is `null`. So an admin approves or rejects a **₹12,000 "played"-condition Charizard** with no
photograph at all, and *condition* is precisely the claim a photograph exists to corroborate.

Also: **no status filters.** The only "Status" on the page is the table column header.

## A115 — Sold, ended, closed and depleted all render as one badge: `published`
**Where:** `/admin/products` → Sold & Ended · **Severity:** medium

All **12** rows in the unavailable scope carry the identical `published` badge. There is no Sold
chip — sold-ness is a **toggle switch** in the Flags column.

The only thing distinguishing a sold product from an ended auction from a depleted code pool is
text the seed wrote **into the product title**: `(Sold Out)`, `— Allocation Closed`,
`— Ended (Revealed)`. That is authored prose, not rendered state, so a listing created through the
UI would show nothing at all.

**Legibility is fine** in both themes (`published` ink `rgb(17,94,89)` light → `rgb(103,232,249)`
dark; the Sold toggle label `rgb(91,91,99)` → `rgb(180,180,189)`). It is the *collapsing of four
states into one word* that fails.

## ✅ VERIFIED FIXED — the scammer `removed` status drift
Both sides are present and wired, against the documented `SCAMMER_FIELDS` gap:

- the Review editor offers `pending_review / verified / rejected / **removed**`
- the Filters drawer has **All · Pending · Verified · Rejected · Removed**
- `?status=removed` with nothing removed renders a correct empty state, not the full list
- set one profile to removed: the badge renders legibly in **both** themes (light
  `rgb(255,255,255)`/`rgb(91,91,99)`, dark `rgba(15,23,42,.9)`/`rgb(180,180,189)`) and the chip
  returned exactly that row

*Restored to `verified` and re-confirmed after a full reload — the fixture is as I found it.*

## ✅ Also fixed — `/admin/payment-methods` blank sort dropdown
Default sort is `-bannedAt` and the options are `['-bannedAt','type']`. The default **is** among
them, so the dropdown no longer opens blank.

**But the list is empty** ("No payment methods found"), so the clustering and masking claims are
untestable. I deliberately did **not** record `fullIdentifierInSource: 0` as a pass — with zero
rows nothing *could* have leaked, so that 0 measures an empty list, not working masking.

## A116 — No analytics alert threshold exists in Site Settings
**Where:** `/admin/site` · **Severity:** low (scope question, recorded as `null`)

`/admin/site` is a picker over **19** groups; there is no Analytics group. I expanded the three
plausible homes and enumerated every label:

- **Integrations** (19 fields): Razorpay ×3, SMTP host/port/user, From address, Google Maps key,
  Place ID, GA ID, FB Pixel, GTM, Meta/social tokens
- **Limits** (4): max products per store, max custom fields, max custom sections, cancellation window
- **Notifications**: send toggles, daily email/WhatsApp ceilings, Resend key, From email/name,
  digest recipients, minimum priorities

`/threshold/i` and `/alert/i` are **absent from the rendered page in all three**. Credential fields
do render as `type=password`, so they are masked on screen.

### A method correction that nearly became a false finding
My first probe on `/admin/scammers` reported **"no status filter chips exist"** — the Filters
drawer simply isn't marked `role="dialog"`, so the query missed it. The screenshot showed all five
chips, including `Removed`. Had I filed from the measurement alone I would have reported the exact
opposite of the truth, on a case whose whole subject is that chip.

## A117 — Every category page renders a breadcrumb whose links 404
**Where:** every `/categories/{id}` page (8 checked) · **Severity:** high

The page chrome renders a breadcrumb built mechanically from the URL:

> Home / Categories / **Category spinning tops** / **Products** / **Sort** / **Relevance** / Page

**All four middle entries are clickable `<a>` elements, and three of them return HTTP 404** —
confirmed by opening them directly, not just from the console:

| href | status |
|---|---|
| `/categories/category-spinning-tops/products` | **404** |
| `/categories/category-spinning-tops/products/sort` | **404** |
| `/categories/category-spinning-tops/products/sort/relevance` | **404** |
| `…/products/sort/relevance/page/1` | 200 — the form the page itself redirects to |

The working URL is the same path **plus a trailing `/page/1`**. So the routes exist only in their
paginated form while the breadcrumb links the unsuffixed ones.

The first crumb also labels the category with its **raw slug** — "Category spinning tops" — while
the page's *own* breadcrumb immediately below correctly reads "Home / Categories / Spinning Tops".
There are two breadcrumbs on the page and only one is right.

## A118 — A signed-out visitor polls an authenticated endpoint twice per page
**Where:** every page · **Severity:** medium (cost)

`GET /api/notifications?limit=1` → **401**, fired **twice on every page load while signed out**.
Reproduced on all eight category pages plus both brand pages.

That is two billed function invocations per anonymous page view for a call that cannot succeed —
the same class of standing cost as Root Cause #94's client timers, and the reason the
`consoleErrors: 0` expectation can never be met by a guest.

## A119 — A category advertises "2 stores" and there is no way to see them
**Where:** `/categories/{id}` · **Severity:** medium

The Spinning Tops hero renders four count pills: `15 products · 9 auctions · 7 pre-orders ·
**2 stores**`. The store count is resolved and displayed — and then:

- the **"2 stores" pill is not a link** (no anchor/button ancestor, `cursor: auto`)
- there is **no Stores tab** — scoped to `<main>`, the only category-scoped hrefs are the three
  `/products…` ones; all four elements reading "Stores" are site chrome pointing at the global
  `/stores`
- **`GET /categories/category-spinning-tops/stores` → 404**

So the comparison the case wanted (stores on a deep category vs. its root) cannot be made in
either direction, because the tab exists nowhere.

## ✅ The category-tree rebuild works — four passes worth recording
- **Four tiers, three clicks**, no typed URLs: Spinning Tops → Beyblade Burst → Burst Parts →
  Layers, each parent rendering its children as Subcategory chips, the leaf rendering none.
- **Both roots reachable**, and the second one is no longer a dead branch: Living Collectibles
  walks down through Bonsai → Juniper Bonsai to a real live-item listing. The whole subtree carries
  counts (Companion Animals 2, Live Plants 2, Dogs 1, Reptiles 1, Bonsai 2, Juniper 2,
  Retrievers 1, Lizards 1).
- **The ancestor chain is honoured at the root**, exactly: root `15 products` = Burst 4 + Metal
  Fight 3 + X 4 + Original 4 + Battle Gear 0. No truncation, no blank grid — the
  `array-contains-any` cap failure is not happening.
- **Mid-tier scoping is real**: Burst (4) is strictly smaller than the root (15), and none of Metal
  Fight's three products appears on the Burst page.

🛑 **Caveat on the ancestor result**: all 95 products came from the seed, which hand-writes the
chain. This does **not** prove a listing created through the seller form gets its ancestors
appended on write — that still needs a UI-created listing to test.

## ✅ Brand vs category rendering is correct
`/brands/brand-takara-tomy` shows **About this brand** with Website `takaratomy.co.jp`, Country
Japan, Founded 2006 — the brand-only fields that were seeded and rendered nowhere for a long time.
`/brands/brand-beyblade` likewise (Founded 1999). `/categories/category-beyblade-burst` shows
**none** of them, and the strings "Website", "Country", "Founded" are absent entirely — no empty
labelled slots left behind. Both kinds render the shared "Why shop here" and FAQ sections.

Brand matching by display name also holds: `product-beyblade-x-knife-shinobi` names its brand
**"Takara-Tomy"**, character for character identical to the brand page's `h1`.

## A120 — A live item has two working detail pages and the category links to the wrong one
**Where:** `/categories/category-bonsai-juniper` → listing card · **Severity:** medium

The leaf links its listing to **`/products/live-bonsai-juniper-10yr`**. Both routes return 200 and
they are *different pages*:

- `/live/live-bonsai-juniper-10yr` → *"Juniper Bonsai — 10 Years Trained **(Juniper (Juniperus
  procumbens))**"* — the live-item page, with species
- `/products/live-bonsai-juniper-10yr` → *"Juniper Bonsai — 10 Years Trained"* — the generic page

Nothing errors; the visitor just never reaches the page built for the type. Same shape as the
documented `detailRoute` defect. Minor, found alongside: the `/live/` page's title ends
**"— LetItRip | LetItRip"**.

### Method notes from this batch (two probes that were wrong)
1. An unscoped search for a "Stores tab" found one and clicking it navigated to `/stores` — that
   was the **site nav**. Scoping to `<main>` is what showed no category Stores tab exists.
2. A page-wide regex for "Metal Fight" on the Burst page returns **true** — from the
   related-categories strip, not a product. Only the product titles settle the scoping question.

## ✅ The carousel component is sound — 11 of 12 pass, 0 defects
`design-ux/carousel-arrow-bounds`, guest, measured at 1280 / 768 / 640 / 390 across the homepage,
a product page, two category pages and a brand page.

**The arrow bounds are guaranteed structurally, not by luck.** The scroll container is
`overflow-x: auto` with a box of `108 → 1172` at 1280; the arrows sit at `68–104` and `1176–1212`,
entirely outside it with a 4px gutter each side. **Across every width and page tested, the count of
arrows whose rect intersects a rail's rect was ZERO.** A card physically cannot render under an
arrow because the rail clips it first.

| Claim | Result |
|---|---|
| Arrows never cover cards | rail 108–1172, arrows 68–104 / 1176–1212, **0 intersections** |
| No overlap mid-scroll | at `scrollLeft 540/1080` cards cut flush at 108; arrows never moved |
| No arrows on mobile | 390: **16 in DOM, 0 rendered**; visible at 640/768/1280 → the `sm` breakpoint |
| Card not clipped at 390 | rail `36–354`, card 318px at `l:36 rt:354`; page `scrollWidth === clientWidth` |
| Swipe & snap | stride 334; target 477 → rests **334**, target 1081 → rests **1002** (3×334) |
| No white fade smear | parent `::before`/`::after` both `none`; **zero** gradient children; clean in both themes |
| Tall-rail arrows centred | 429px and 447px rails: both arrows `offsetFromRailMid = **0**` |
| Dark-mode arrows | hover goes **lighter** (`#334155`) than base (`#1f2937`), chevron stays near-white |
| Resize across breakpoint | clean both directions, 0 overlaps at every width, never scrolls sideways |
| Product-page rails | same `appkit-hscroller__arrow`, rails 172–1108, 0 intersections, 0 arrows at 390 |
| Category/brand rails | Spinning Tops renders **8** grouped rails, 0 intersections; brand page 6, same |

### The one non-pass is a premise mismatch, not a defect
**`arrow-end-state-no-jump` → `null`.** The case is explicitly about *"a carousel that does not
loop"* — **this one loops**. Measured on a rail with max scroll 1080: Next from 0 gives
`810 → 1080 → 0 → 810`, wrapping at the end; Previous at 0 jumps to 1080, wrapping the other way.
Neither arrow ever disables, which is *correct* for a looping rail. Someone should decide whether
looping is intended, since the case's author clearly expected otherwise.

### 🛑 Four measurements that were wrong, and what corrected each
This batch was unusually rich in traps. Recording them because each would have been a confident,
evidenced, **false** finding.

1. **"Cards slide under the arrow mid-scroll."** `getBoundingClientRect` on scrolled-out children
   returns `l:-162 rt:92`, which enters the left arrow strip (68–104) by 24px. That is **layout**
   geometry of an element `overflow:auto` **clips**. The screenshot shows paint stopping dead at
   108. → *Rect math does not know about clipping.*
2. **"Next at the end does nothing — six clicks, no movement."** It was six *wraps* through a
   three-position cycle that happened to land back where it started. Re-running one click at a
   time revealed the loop. → *Sample every step, not just the endpoints.*
3. **"The dark hover rule can't match — it's `.dark` and this app uses `data-theme`."** `<html>`
   carries **both**; my earlier 60-character read of `className` had truncated before `dark`.
   → *A truncated string is not evidence of absence.*
4. **"Category pages don't render grouped carousels — the brand page has six and the category page
   has none."** True of `/categories/category-beyblade-burst`, and it reads exactly like an
   unwired variant. `/categories/category-spinning-tops` renders **eight**. → *One negative case
   is data, not behaviour; check a second before generalising.*

## A121 — 🛑 A seller's listing edit is silently discarded. CONFIRMED TWICE.
**Where:** `/store/products/{slug}/edit` · **Severity:** critical · **Root Cause #40's shape**

Pressing **Update →** issues `POST /store/products/product-beyblade-burst-valkyrie/edit` → **200**,
with no toast, no error and no navigation. **After a reload the edit is gone and every other field
is byte-identical.**

Run twice, by two different input methods, because one technique is not enough for a claim this
size:

| Attempt | Method | After reload |
|---|---|---|
| description + `" QA-EDIT-MARKER"` | native value setter + input/change events | marker **absent** |
| title + `"X"` | a **real browser keystroke** — the field visibly showed `…ValkyrieX` | title back to `Beyblade Burst B-01 Valkyrie` |

**The good news is in the case's own data key: `unintendedFieldChanges: 0`.** Nothing emptied
itself, no image was dropped, no type-specific field blanked. This is not corruption — it is total
inertness. The seller's work is discarded while the UI behaves exactly as it would on success.

Nothing needed restoring, because nothing was ever written.

### The method correction that nearly buried this
My first reading was **"zero network requests fired"**, from a `window.fetch` hook — which would
have matched the previously-recorded symptom exactly. It was **wrong**: the POST is a **Next.js
Server Action**, invisible to a fetch wrapper but plain in the browser's own request log. Reporting
"the button is wired to nothing" would have sent someone hunting a missing handler when the handler
runs and returns 200.

**The reload is the oracle. The network panel is not.**

## A122 — `/store/products/new` is a flat "Quick add", not the sectionised form
**Where:** `/store/products/new` · **Severity:** informational — but it blocked 4 cases

The drawer reads *"Quick add — fill the essentials and publish. You can add more details later."*
and has **six flat fields** (Product Name · Category · Price · Product Image · Description · Stock
Quantity), **zero sections**, no error summary and no issues badge.

The sectionised form is the **edit** view — seven sections (Basic Info · Media · Pricing ·
Shipping · Returns · Publish · SEO) — and **all of them are permanently open**. So "collapse two
sections and publish" has no home on either surface, and four cases in this batch are `null` for
that reason rather than for a defect.

**It also renders `This field is required` in red under an empty, untouched Product Name on first
paint** — the **sixth** form in this run with that behaviour. `aria-invalid` null on 6/6 inputs.

## A123 — No pinned action bar on mobile; Discard and the issue sheet don't exist
**Where:** `/store/products/new` at 390 · **Severity:** medium

`--bottom-chrome-height` reads **0px** and a scan for fixed elements near the bottom edge returns
**none** — the actions sit at the foot of the scrolling content. Before scrolling, Publish and Save
Draft measure `bottom: 926` against an 844px viewport; after scrolling they are at `800–844`, fully
visible and unclipped. So they are reachable, but only by scrolling the whole form.

Missing entirely: **no Discard control** (the desktop editor has one; this drawer offers only the
✕), **no error sheet**, and **no "N issues" label** — so the case's central assertion, that the
count falls as fields are fixed, has nothing to test.

## ✅ Two section behaviours that are correct
- **No dead chevrons.** All seven section headings: not a button, not inside one, `cursor: auto`,
  no `aria-expanded`. The six svgs beside headings are section *icons*. An always-open section
  showing no chevron is exactly what was asked for.
- **Pickers are not clipped by their section.** The address picker in **Shipping** opens a 113px
  popover ending at y=531 in an 800px viewport, with **no clipping ancestor** in six levels — the
  only `overflow: hidden` is the list's own scroll body.

## Site Settings save — DECLINED, not failed
**`/admin/site`** · recorded `null`

The case asks for a Fees field to be changed and saved on the live settings singleton, hunting a
defect whose symptom is that **saving one tab blanks the others**. Three reasons I did not:

1. If the defect is present, **performing the test is what causes the damage** — and the restore
   step is the same save that just proved itself broken.
2. `siteSettings` is **PRESERVE tier**, alongside `users` / `addresses` / `sessions`. The tester's
   own post-wipe assertion hashes `siteSettings.credentials` to confirm it survived.
3. The risk is asymmetric: a pass tells us little; a failure destroys branding, fees, integrations
   and legal copy on production.

### What read-only work did establish
**The blast radius is real** — 20 groups behind a single **"Save all changes"**:

| Group | Fields | Populated |
|---|---|---|
| About | 44 | **39** — hero copy, mission, how-it-works, values, milestones, team |
| Fees | 17 | **16** — platform fee 5%, GST 18%, gateway 2%, max platform fee ₹10, payout hold 2d, min payout ₹100, featured ₹999, promoted ₹499, COD deposit 10%, WhatsApp addon ₹10 |
| Integrations | 19 | Razorpay key/secret/webhook, SMTP, Maps, GA, FB Pixel, GTM, Meta tokens |
| Limits / Notifications | 4 / ~15 | — |

**Navigating between groups does not lose data.** About (39 filled) → Fees (16 filled) → back to
About: still 39 filled, identical values. That is the most reassuring signal obtainable without
submitting. **Credential fields render as `type=password`**, masked on screen.

**What remains unknown is the only thing that matters:** whether "Save all changes" serialises the
whole document from state or only the touched group. No amount of read-only probing settles it.

**Recommendation:** run this on staging, or capture the outgoing payload from one save on a
throwaway project and diff it against the stored document — not against production.

## ✅ The offer lifecycle works end to end — and pins down A49 exactly
`buying/offers--p1` · 5 yes, 1 no, 6 blocked.

**Buyer → seller, inside a minute.** Made a real offer of **₹1,450** on a **₹1,799** listing:
modal states *"Minimum offer: ₹1,259.3"*, the submit button relabels live to *"Send offer of
₹1,450"*, confirmation *"Offer sent!"*, and it lands on `/user/offers` as
*"Driger V · 0m ago · Pending · LISTED ₹1,799 · YOUR OFFER ₹1,450"*. The seller's notification
reads *"New offer received — Mock User 3 offered ₹1450 on 'Beyblade Original — Driger V'"* with a
**Respond** link to `/store/offers` — the store's list, not the buyer's, exactly as required.

**`/user/offers` is one of the better surfaces in the app.** Six offers, five statuses (Pending /
Countered / Withdrawn / Declined / Expired), each with a labelled money row and — the half most
likely to be dropped — **the seller's note**: *"Best I can do is ₹1,150."* above an
**Accept ₹1,150** button, and on the declined one *"Sorry, we cannot go below ₹1,300 for this
piece."*

**The seller's detail panel is the Root Cause #56 repair done right.** "View details" sits *first*
in the row menu, above Accept/Counter/Reject, and shows the buyer's note, both prices, the expiry
and an **Offer history** block — all before any decision. **Counter opens a real form**
(`counterAmount` + rule text + optional note), and its empty submit raises the error **on the field
AND in a correctly-gated "Please fix the following:" summary** — the one form this run that gets
that right.

## A124 — `Unknown buyer` on every offer row, while the notification names them
**Where:** `/store/offers` · **Severity:** high · **Cluster:** A49

Every row and the detail panel read **"Unknown buyer"**. The same offer's seller notification says
**"Mock User 3"**.

So the identity reaches the notification layer and is **lost by the offers adapter** — that narrows
A49 from "several surfaces say Unknown" to a specific adapter, with a working counterexample on the
same record. A seller judging ₹1,450 against a ₹1,799 listing cannot see who is asking.

## A125 — A two-minute-old offer says "Offer expires 1m ago"
**Where:** `/store/offers` → View details · **Severity:** medium

The panel for an offer created at 07:35:30 — and displayed as *"pending"*, with *"Offer made
16/09/2026, 07:35:30"* in its own history — renders **`Offer expires: 1m ago`**.

Either the deadline is computed from the wrong timestamp, or a future date is being fed to a
past-tense relative formatter. The seller is told a brand-new pending offer has already lapsed.

## A126 — Two different accounts of why one offer ended
**Where:** `/user/offers` vs `/user/notifications` · **Severity:** low

The Valkyrie offer badges **`Expired`** in the list, while the buyer's notification for the same
record says it was **"cancelled by an administrator"** with a reason. Both are terminal, but the
buyer is shown two different stories. There is no offer-expiry notification as such — the only
expiry entries on the page are *"Payment window expired"*, which are order-related.

*(Consistent with `adminCancelOffer` calling `expireMany`, so `expired` is the stored status while
the notification describes the cause.)*

## ✅ An expired accepted offer is correctly locked out
`Beyblade Burst Valkyrie` — Expired, LISTED ₹999, YOUR OFFER ₹780, **AGREED PRICE ₹780**. In the
cart the **Accepted Offers** tab reads *"No accepted offers in your cart."*, its summary is
lane-scoped (*"This total covers your accepted offers only"*), and **Proceed to checkout is
disabled** with the reason spelled out — *"There's nothing in this tab yet."* The line is gone and
checkout is genuinely unavailable rather than failing later.

### Six cases blocked, all for reasons already evidenced
- **4 type-specific field round trips** (classified city, live species/CITES/jurisdictions,
  digital-code delivery method, prize-draw entry price) — all blocked by **A121**: the seller save
  writes nothing, so an emptied field is indistinguishable from the blanket failure. **Prioritise
  the live-item one** when saves are fixed; an emptied permitted-jurisdictions list has real-world
  consequences.
- **accept → checkout charges the agreed price**, and **offer flips to paid** — not attempted. It
  needs a real order placed on production, on a payment step that **commits on the first method
  click** (A70), on a money path with **two recorded quote-vs-order mismatches** (A71, A105). Worth
  doing by someone who can watch each step and stop.

*Two state changes I declined on shared fixture data: Decline on a pending offer, and submitting a
real counter — both would have moved offers the later cases in this same batch read.*

## A127 — The address form greets you with "Fix 7 issues" before you type a character
**Where:** `/user/addresses/new` · **Severity:** medium · **Cluster:** A85 · **Seventh form**

On first paint, untouched: the **Address Required** header carries a red **"3 issues"** badge, the
**Where Required** header carries **"4 issues"**, and two `role="alert"` messages render — *"Enter
the state or region."* and *"Enter the postal code."* `errorsBeforeSubmit` expected **0**,
observed **7**.

**The summary IS correctly gated** — "Please fix the following" is absent before Save and appears
after — so the gate exists and the **per-section badges and per-field messages sit outside it**.
That is the cleanest statement of this cluster yet.

*The fields are not red-bordered (I measured a false positive on all ten; the screenshot shows
ordinary grey). `aria-invalid` is null on 10/10 inputs before and after a failed submit.*

### And the flip side makes the fix obvious
The **live recomputation is correct and already running**. From a failed empty Save:

| action | badges |
|---|---|
| after empty Save | `3 issues / 4 issues` |
| fill Label | `2 issues / 4 issues` |
| fill Full name | **`1 issue`** `/ 4 issues` — singular handled |
| fill Phone | `4 issues` — the Address badge **disappears** rather than showing "0 issues" |

No second Save needed. So the machinery works; it simply **also runs on mount** and paints its
result before the user has done anything.

## A128 — A notification's "Track Order" link 404s
**Where:** `/user/notifications` · **Severity:** medium · `notFoundCount: 1`, expected 0

`Track Order` points at **`/user/orders/order-1-20260515-abc123`** → **HTTP 404**.

**It is the route shape, not a dead id**: the sibling *Re-upload proof* notification points at
`/user/orders/order-4-20260825-upiman/**payment**` and that **loads fine**. So
`/user/orders/{id}/…` exists while the bare `/user/orders/{id}` does not.

Everything else routes correctly — offer → `/user/offers` (the list, correct since no per-offer
page exists), bid → `/auctions/{slug}`, product → `/products/{slug}`, and the seller's offer entry
→ `/store/offers`. Scope the fix to the one href.

## ✅ The mobile form chrome is right
At 390: a pinned bar with **Cancel + Save Address** above the user tab strip — **exactly two bars**,
no overlap. And it honours the layout contract rather than just looking right:
**`--bottom-chrome-height` reads 57px with the bar alone and grows to 91px** when a failed Save adds
the issues sheet to the same tier.

The sheet reads **"Fix 7 issues"** (= 3 + 4), lists the real failures (*"Enter the recipient /
street address / city / state or region"*), and **stays closed through ordinary typing** while the
label falls to "Fix 6 issues".

*Two steps I could not do honestly: the soft keyboard (a resized desktop browser has none, so
`--keyboard-inset-height` stays 0), and reopen-on-second-Save — the count reverted 6 → 7, which is
consistent with my programmatic field value not surviving the re-render, so I could not tell a
genuine reopen from a reset. Both want a human on a real device.*

### Seven blocked, each with a named reason
- **4 type-specific field round-trips** — blocked by **A121** (seller saves write nothing).
- **2 email cases** — no inbox exists for this harness, and *"no email arrived"* cannot be
  established by waiting.
- **`address-routes-normalised`** — **declined**: it creates then deletes an address, and
  `addresses` is PRESERVE tier. With two known save paths that return 200 and write nothing, I
  would not create a record whose deletion I could not guarantee. *The read-only half — do old URL
  shapes resolve? — is safe and is the valuable part, especially given A128.*

## A129 — The buyer cannot open an offer at all; the seller can
**Where:** `/user/offers` · **Severity:** medium · Fails 2 cases outright, blocks a 3rd

Each offer renders as a card carrying **only action buttons** — *Withdraw Offer* on the pending
one, *Accept ₹1,150* / *Withdraw* on the countered one, and **nothing at all** on the expired,
declined and withdrawn ones. There is no View, no Details, no History, no Timeline.

Nor are the cards click-through: the title is **not inside an anchor**, the card computes
**`cursor: auto`**, and the whole page contains no *"timeline"*, *"history"*, *"Offer made"* or
*"Superseded"* text.

**The asymmetry is the finding.** `/store/offers`' row menu opens a **View details** modal with the
buyer's note, both prices, the expiry and an **Offer history** block of timestamped rounds — all
before acting. The buyer, whose money is at stake, gets two amounts and a button.

The legacy-timestamp case is blocked by this too, and its fixture is *sitting right there unusable*:
`Beyblade Burst Valkyrie`, Expired, LISTED ₹999 / OFFER ₹780 / **AGREED ₹780** — exactly the
pre-history record wanted, on a card with zero controls. That matters because a **fabricated
timestamp cannot be detected later** — a plausible date is indistinguishable from a real one once
stored.

## A130 — "Must be at least 1" on a text field (second raw-validator leak)
**Where:** `/store/features` → Add Feature · **Severity:** medium · **Cluster:** A109

**What this editor gets right**, and it is worth saying because seven other forms do not: it opens
with **zero errors on first paint**, the **Create feature button is enabled** rather than greyed
out, the empty submit is **refused** with errors on the fields *and* in a **correctly-gated**
"Please fix the following:" summary, and a **whitespace-only** label (three spaces) is refused too.
The case's named failure — a permanently disabled button with no explanation — does not occur.

**What fails is the wording.** The error on a text *label* field reads **"Must be at least 1"** — no
field name, no units, no human phrasing. The summary compounds it by prefixing the **section**
rather than the field: **"Feature: Must be at least 1"**, twice, so a seller cannot tell which of
the two failing fields is which. `aria-invalid` is null after the failed submit.

Same family as **A109** (*"Invalid input: expected number, received undefined"* on the admin product
form). Two confirmed instances of raw validator text reaching users.

### Nine blocked — and what each is actually waiting on
| Case | Waiting on |
|---|---|
| cross-store template access | a **second seller account** (`meera.blader@gmail.com`); the interesting half is whether contents render *before* refusal |
| payout blank details · bad IFSC | not reached. **The IFSC case's value is step 6** — are stored bank details *masked* after reload |
| shipping rateless rule | pre-empted by **A84** (Save issues no write). **The client-side half still works**: is **zero accepted as free shipping**, or swept up by a truthiness check |
| grouped-listing count | needs a **hand-crafted request** — the UI by design cannot produce the mismatch |
| feature create · feature edit page | **declined** — creating a record I might not be able to delete, given several seller write paths that report success and write nothing. *Create renders a real form at `?panel=create`* — note it is a **drawer**, which is a hint the edit-on-its-own-URL claim may fail |
| store category rejects empty | not reached; the sibling editor validates correctly, but "probably" is not a verdict |
| three-round chain | **doubly blocked** — 3 rounds × 2 identities to build, and then A129 means the buyer cannot read it. **Re-scope it to the seller**, whose modal does have the history block |

## A131 — The offer detail modal fetches nothing; it renders the list's cache
**Where:** `/store/offers` → View details · **Severity:** high

Loading the page fires **one** data request — `GET /api/store/offers?page=1&pageSize=25&sorts=-createdAt`.
Opening a row's **View details** modal then fires **nothing**: no `/api/store/offers/{id}`, no server
action, nothing in the browser's own network log. The modal paints instantly from data the list
already held.

So there is **no code path** by which the detail could show anything but what the list last cached —
exactly the failure the case names: *"a detail served from a stale list shows the seller a
superseded amount, and accepting from that view accepts a price that no longer stands."*

I could not stage the two-window setup (one browser, identity selected by swapping a session file),
so I measured the **mechanism** rather than the symptom. **Checked with two instruments** — a
`window.fetch` hook *and* the browser's own request log — because earlier in this run a fetch hook
missed a Next.js Server Action and nearly produced a false "no requests" finding. Both agree.

**This pairs badly with A132 below**: a seller can accept a superseded amount from a stale modal in
two clicks with nothing in between.

## A132 — Accept has no confirmation step
**Where:** `/store/offers` row menu · **Severity:** medium · **Cluster:** A70

One click on a menu item committed this store to selling at **₹1,450 instead of ₹1,799** — a ₹349
concession — with **no dialog in between**. Same shape as A70 (clicking a payment *method* places
the order outright). CLAUDE.md Rule #7 requires a `confirmation` config on committing actions.

## ✅ The seller's own actions survived the admin surface, and Accept really writes
Row menu offers **View details · Accept · Counter · Reject**. I accepted the QA offer I had created
(Driger V, ₹1,450 vs ₹1,799) and it persisted through a full reload **on both sides**:

- seller — *"Offer: ₹1,450.00 · Listed: ₹1,799.00 · **accepted**"*
- buyer — *"Driger V · **Accepted** · LISTED ₹1,799 · YOUR OFFER ₹1,450 · **AGREED PRICE ₹1,450**"*
  with a **Checkout at Agreed Price** button

The agreed price is stored as the negotiated figure, not the listing price.

**Two precision notes.** The third action is labelled **Reject**, not *Decline* as the checklist
words it — align one or the other. And acceptance does **not** auto-create the buyer's cart line:
immediately afterwards the Accepted Offers tab still read *"No accepted offers in your cart."* with
checkout disabled. The buyer's route in is the explicit **Checkout at Agreed Price** button, which
matches the documented design where the line is written by an offer-checkout *action*. Recorded as
a **wording mismatch in the case**, not a defect — but a seller reading it would expect the line to
appear on its own.

## A133 — An admin order has no History block at all
**Where:** `/admin/orders/{id}/view` and the row menu's "View full details" · **Severity:** medium

Both routes into an order were checked. **"View full details"** opens an *edit drawer* (a Status
select and Save changes) carrying items, add-ons and the coupon line — **no history**.
**"Open full page"** lands on `/admin/orders/{id}/view`, and searching the rendered page for
*"Status history"*, *"History"* and *"Timeline"* returns **nothing**.

**The anti-fabrication intent is satisfied**, and the distinction matters: nothing invented appears
either — no step dresses up the record's `createdAt`/`updatedAt` as a transition, because no steps
are shown. This is a **missing surface, not a lying one**, which is much the better failure. But an
admin looking at an order cannot see what happened to it.

**The component exists and simply isn't wired here** — the store detail page renders a proper
History block (below).

## ✅ The store suspension timeline names who, when and why
`/admin/stores/store-vintage-vault-co/view`:

> **Suspended** · **Admin** · 06/09/2026, 05:59:17 · *"Three listings flagged as possible
> reproductions; suspended while authenticity documentation is reviewed."*
> **Created** · 07/02/2026, 05:59:17

All three facts present, plus a second transition in order rather than only the latest.

## ✅ History carries no PII — `piiInHistory: 0`
The actor renders as **"Admin"** — a *role*, not a person. Checked the rendered text **and the page
source**: the only email in the rendered page is `admin@letitrip.in` (my own session, in the sidebar
chrome), and the source adds only site-wide chrome — the `you@example.com` / `your@email.com`
newsletter placeholders and the footer's `legal@` / `support@` / `privacy@`. Zero phone matches.

**Two limits, stated plainly:** this is solid for the **store** leg, which is the surface that
actually renders history today. The **order** leg has no block to inspect, so it contributes no
evidence either way — and the offer and payout legs were not reached.

## A134 — The homepage-section validation case has no authoring path to test
**Where:** `/admin/sections` · **Extends A113**

Step 2 — *"start a new section"* — cannot be performed. No create control exists (the only
`new|add|create` match is a false positive: the sidebar's `/admin/**new**sletter` link), there is no
`<select>`, and the rows are inert (first row: 0 buttons, 0 links, `cursor: auto`). So there is
nowhere to type malformed JSON or a negative order — **the validation being tested cannot exist for
a user.**

### Eight blocked — and one of them is a decline, not an omission
- **`catalogue-rejection-reason-survives` — DECLINED.** It requires rejecting a real user's
  submission **twice** with written reasons, and the surface holds exactly one: a ₹12,000
  "played"-condition Charizard from `user-rohit-collector`. Step 3 ("have the owner resubmit it") is
  something I cannot do at all, so I could not finish the case even after causing that. And per
  A114 that detail view shows **no photos** — a rejection there would be issued without seeing the
  item.
- **payout UTR · store approval** — both are live writes (money-movement record; publishing a store
  to the marketplace) whose cleanup depends on a second write, on a build with several admin paths
  that report success and write nothing.
- **ticket resolution timestamp** — the queue is empty. One of ~13 cases blocked by the empty
  moderation / reports / tickets / item-requests / banned-addresses / payment-methods fixtures.
- **notification type filters** — 🛑 note for whoever runs it: **the real union is 30 values, not
  the 28 in the case label** (it grew when `account_action` split into `support_ticket_update` and
  `scam_report_update`). Counting against 28 would mark a correct list wrong.
- **payout failure reasons** — this is a *snapshot-diff detector*, and it fails invisibly: if
  history is built by diffing against one earlier snapshot rather than appending per transition,
  only the latest reason survives and the page still looks reasonable. **Counting entries against
  attempts is the assertion that catches it**, not reading them for plausibility.

## A135 — 🛑 The blog editor opens EMPTY on an existing post
**Where:** `/admin/blog?panel=edit&id=…` · **Severity:** critical · **Same shape as A98**

Opened the published post *"Collector Spotlight: Building India's Largest Gundam Collection"* and
read every field's **value**, not its appearance:

| field | value | length |
|---|---|---|
| Title | `""` | **0** |
| Slug | `""` | **0** |
| Excerpt | `""` | **0** |
| Content (rich text) | — | **0** |

**What is visible in those boxes is `placeholder` text** — *"e.g. How to Grade Pokémon Cards"*,
*"blog-how-to-grade-pokemon-cards"*, *"Short summary shown in listings and cards"* — which reads
exactly like real data at a glance. That is why this is easy to miss. **The list row behind the
drawer still shows the real title**, so the record is intact; the editor fails to load it.

**The red "3 issues" badge is a symptom, not the finding** — the form believes its required fields
are empty because it never populated them.

🛑 **I did not press Save, deliberately.** This is the shape of **A98**, where an `ActionResult`
envelope was spread as if it were the payload and saving wrote a published listing back as a draft.
Here a Save would overwrite a published post's **title, slug, excerpt and body with empty strings**.
That is the next thing to check — **from a staging copy, not this one**.

*On the case's literal question there is no slug-specific error and no `role="alert"` anywhere — so
a tester reading only the slug field would score this a pass.*

## ✅ The bottom-bar contract holds on admin listings
- **Bulk bar survives a drawer.** Ticked two rows → *"2 selected"* + Toggle Featured/Promoted/On
  Sale + Apply. Quick edit drawer open → **still "2 selected"**. Cancel → still there, no empty
  flash. *Mechanism note:* they never compete — `--bottom-chrome-height` is `0px` throughout because
  this bulk bar is **inline at the top of the list**, not bottom-pinned. The case passes
  structurally rather than by a correctly-maintained stack.
- **No second bar inside a modal**, at either width. 1280: modal footer `Cancel` / `Save →`,
  `--bottom-chrome-height` `0px`. 390: full-screen modal, footer inside it, **nothing below**.
  `screenBottomBars: 0`.
  ⚠️ At 390 that variable reads **64px** while the modal is open — that is the **modal's own
  footer** registering in the tier, not a duplicate. Don't read it as evidence of a second bar.
- **The blog editor is sections, not steps** — Content and Media rendered at once, no *"Step N of
  M"*, no gate on reaching Media before filling the title.

### Eight blocked — with the reason each is worth running
- **3 role cases** — create/delete writes on an **authorisation surface**, on a build with admin
  saves that report success and write nothing. Staging.
- **2 bid cases** — need **three identities** in sequence. Prioritise `bid-detail-hides-bidder`: it
  is a PII assertion whose step 2 requires searching the **page source**, because a masked display
  over an unmasked payload looks identical to a fix from the screen.
- **`admin-bid-view-before-cancel`** — cheap and read-only; good first pick next pass. Its real
  question is whether Cancel's confirmation **names the consequence**, and A132 found a committing
  action with no confirmation at all.
- **`blog-new-post-url`** — publishes to the live blog. *Read-only half worth doing:* check existing
  post URLs for a doubled `blog-` segment. The editor's own hint (*"Must start with `blog-`"*) means
  a doubling bug would come from re-prefixing an already-prefixed slug.
- **`blog-readtime-updates`** — **blocked by A135, dangerously.** "Add paragraphs and save, then
  restore the original body" is impossible when the body loads empty: following it literally would
  replace a published post's entire content with only what was typed, and there would be nothing to
  restore from.

## ✅ The admin/seller offer boundary holds exactly — `adminActions: 2`
`/admin/offers` row menu = **View · Cancel Offer**. No Accept, no Counter, no Decline. The seller
side was separately confirmed this run to still hold all three of its own actions, so the
capability was **moved, not duplicated** — an admin coordinates, the store prices its own goods.
No bulk cancel appears either.

### This also sharpens A124
The admin row reads **"Mock User 1 → Beyblade Arena"** — *the buyer is named here.* `/store/offers`
shows **"Unknown buyer"** for the same kind of record. So the identity is available and **is**
rendered — by this adapter and not by that one. That is now two independent counterexamples
(notification layer, admin list) against one failing adapter.

## ✅ The Cancel-Offer dialog is the reference for validation copy
> *"Cancel this offer?"* — **Reason for cancelling** — *"The offer will be expired and removed from
> the buyer's cart, and they'll be notified. **This cannot be undone** — the buyer would need to
> make a new offer. **The buyer sees this reason, and it is recorded in the audit log.**"*

Empty submit → refused, field error **and** gated summary:
**"Give a reason of at least 10 characters — the buyer sees this."**
`"Too short"` (9 chars) → refused identically, typed text preserved.

**That message states the rule *and why the rule exists*.** Compare A109 (*"Invalid input: expected
number, received undefined"*) and A130 (*"Must be at least 1"*). Point the message-quality fixes at
this one.

**Recorded `null`, not pass:** I verified the refusals and **declined step 5**. The only pending
offers belong to real buyers — the one I opened is Mock User 1's ₹950 offer on a ₹1,199 listing —
and the dialog's own copy says it cannot be undone. The audit-log, history and buyer-notification
assertions remain untested; the offer is still pending.

## A136 — The new-event form shows "3 issues" before you type (eighth instance)
`/admin/events/new` · **Cluster:** A85

The **Details Required** section carries a red **"3 issues"** badge on first paint of a *brand-new*
event form. Eighth surface in this cluster, after the address form, seller quick-add, admin product
editor, `/store/shipping`, `/report`, `/item-requests/new` and the blog editor.

*The case this appeared under passes on its own terms:* Details, Media, Settings and Raffle are all
present at once, there is **no "Step N of M"**, and **zero** of the visible controls are disabled —
so Raffle is reachable without completing Details.

### Two blocked, both by A135 — and one is actively dangerous
- **`blog-error-summary-jumps-to-section`** — step 2 is *"clear its title"*, but every field is
  **already empty**. There is nothing to clear, and step 4's Save would blank a published post.
- **`blog-media-survives-collapse`** — ends *"Remove the media and restore the post"*, impossible
  when the editor loads nothing to restore from. *The premise is worth keeping though:* an upload
  aborted by collapsing its section would present as a file that simply isn't attached — looking
  like a slow network rather than a bug.

## ✅ VERIFIED FIXED — Root Cause #70, the public site-settings leak
`GET /api/site-settings` anonymous is **1,431 bytes over exactly 11 allow-listed keys**:

`contact · payment · listings · notificationChannels · announcementBar · navConfig · actionConfig ·
background · watermark · disabledRoutes · effectiveWatermark`

- **No `featureFlags` block at all** → `adminCheckoutBypass` and the mock-provider flags cannot be
  in it. `operationalFlagsInPublicResponse: 0`
- **No `credentials` block**
- Searched for `razorpayKeySecret`, `webhookSecret`, `accessToken`, `apiKey`, `smtpPass`,
  `resendApiKey`, `gstin`, `gatewayFeePercent`, `payoutHoldDays`, `minPayoutAmount`,
  `surchargeSellerSharePercent` — **none present**

That response previously carried the whole settings document minus three deleted keys. The
allow-list projection is doing its job.

*It also answers half of the ads case for free: a provider credential stored in ad settings has no
route into that response.*

## ✅ The media library renders, proxies and filters correctly
200 items, **24 tiles, 0 broken** (all complete, `naturalWidth > 0`). **Zero raw bucket URLs** —
checked for `firebasestorage.googleapis.com` and `storage.googleapis.com`, found none; all six
sampled srcs are `/api/media/…` proxy paths.

**The search control pair works both ways:** `avatar` → one matching tile;
**`zzzznope` → "No files found."**, zero tiles. `nonsenseResultCount: 0`.

### A137 — 23 of 24 media paths live under `/api/media/tmp/`
The only non-`tmp` item is an external placeholder via `/api/media/ext`. `tmp/` is the prefix
uploads *start* in before `finalize` moves them to a permanent path — and which `mediaTmpCleanup`
prunes. **If finalize isn't moving files, the library is living in a folder something else is
designed to delete.** Worth a look.

*Minor, same page:* the header still reads **"200 Items"** when the search returns none — the total
isn't recomputed against the active filter.

### 🛑 Method correction — I had the wrong search box
My first run reported **"the media search does not filter"** — 24 tiles before and after
`zzzznope`. **Wrong.** The page has *two* search inputs and my selector grabbed the sidebar's
**"Search navigation…"** rather than the grid's **"Search filename…"**. I had typed into the wrong
box entirely. That is the eleventh near-false finding this run from an over-broad selector.

### Six blocked, each with the reason and the cheapest next step
- **ads CRUD** — creates a record holding a **provider credential** on a build with saves that
  report success and write nothing. *Untested half: is it masked on reload.*
- **newsletter export** — 🛑 *do step 3 first, it needs no export:* **are subscriber emails shown in
  full or masked?** A masking helper elsewhere in this run turned out to be a no-op.
- **contact submissions** — worth more than it looks: the confirmation email was removed, so the
  admin surface is now **the only place a customer's message can be read**.
- **navigation editor** — mutates the **live public header**; cleanup needs both a delete *and* a
  reorder-restore. Run it with the dead-`href` validation case, since this run has already found
  404ing links shipped in two other places.
- **settings navigation/actions** — cheap and read-only, good first pick. 🛑 *`/admin/site` is a
  **20-group select**, not a tab strip* — a select-driven panel is exactly the pattern that tends
  not to write its state into the URL, which is what the case asks about.
- **feature flags** — the public half is verified above; the toggle half is a **PRESERVE-tier
  write** with a public behaviour change in between.

## A138 — 🛑 "Featured first" and "Promoted first" return HTTP 500 and empty the seller's list
**Where:** `/store/products` sort dropdown · **Severity:** high

Selecting either sort replaces a **25-row list** with **"No products listed yet."** The console gives
the cause:

```
GET /api/store/products?page=1&pageSize=25&sorts=-featured&availability=available     => 500  (x2)
GET /api/store/products?page=1&pageSize=25&sorts=-isPromoted&availability=available   => 500  (x2)
```

**The shape points at a missing composite index.** Every other sort on the same dropdown works —
Newest, Oldest, Title A–Z, Title Z–A, Price High, Price Low all return rows — and the two that fail
are exactly the two whose fields had to be made *sortable* for this feature to exist. A field
flipped to `canSort: true` without deploying the index for the query shape it runs in produces
precisely this: a `FAILED_PRECONDITION` surfacing as a 500, on that sort and no other.

🛑 **Note the failing URL carries `availability=available` alongside the sort** — the index needed
is the *combined* shape, not the sort field alone.

**The user-visible cost is worse than a dead control.** A seller who picks "Featured first" is told
**they have no products at all**, with no error message and no retry — from the UI it is
indistinguishable from an empty store.

## ✅ All nine listing types are in the seller dropdown *and every one filters*
`typeOptionCount: 9` — Product · Auction · Pre-Order · Prize Draw · Classified · Digital Code ·
Live Item · Art Print · Stickers. **No "Bundle".**

The half that matters is that **none returns the unfiltered 25**:

| option | rows | option | rows |
|---|---|---|---|
| All listings | 25 | Classified | 7 |
| Product | 13 | Digital Code | 6 |
| Auction | 7 | Live Item | 3 |
| Pre-Order | 5 | Art Print | 4 |
| Prize Draw | **0** | Stickers | 5 |

And the rows are genuinely of their type, not merely a different count — Auction shows *"7 bids ·
Ends 19 Sept"*, Classified shows Mumbai/Hyderabad, Live Item shows *"Juniper Bonsai"* and *"Bearded
Dragon"*. **Prize Draw returns a proper empty state** (*"No prize-draw listings found"*) rather than
falling back to the full list — the exact shape of the alias-map bug where an unrecognised token
made the whole clause vanish. **Art and Stickers both filter**, which is the other half of that fix.

### 🛑 Method note — twelfth selector miss
My first count returned **0 rows for every option**. The seller products list renders as **cards,
not a table**, so `tbody tr` measured nothing. Counting the per-row **Edit** buttons gave the real
numbers. Had I filed from that, I would have reported every type as broken.

### Ten blocked — and for eight of them there is a read-only half worth extracting
The coupon/bundle/classified CRUD cases all create records on a build with a **documented
non-persisting seller save**, so a create-then-verify result could not be attributed. But each has a
cheap sub-claim that needs no writes:

- **auto-scoped** and **cannot-be-site-wide** → *does the form offer a store/scope control at all?*
  A seller cannot create what the form cannot express — an absent control is the strongest form of
  the guarantee.
- **no-stacking-toggle** → read-only. The subtle half is whether help copy **implies the seller
  controls stacking** rather than stating the platform rule.
- **coupons-crud** → *does any money field's label name a sub-unit?* This run already found an admin
  coupon field labelled in paise.
- **classified-crud** → the public panel must offer Make Offer / Request to Buy and **no cart
  control** — the type's defining capability.
- **bundles-crud** → step 5, the **cross-store member refusal**, has purpose-built fixtures.
- **stacks-with-admin-coupon** → ⚠️ pre-empted: its paired coupon `FREESHIP499` was already observed
  applying at **−₹0.00**, so "the total falls by the sum" would be ambiguous. Re-run with a
  percentage-based admin coupon.

## A139 — The seller sees how many bids, but not what they are worth
**Where:** `/store/auctions` (→ `/store/products?listingType=auction`) · **Severity:** medium

Every auction row carries real auction-specific data rather than product boilerplate — an `auction`
badge plus *"7 bids · Ends 19 Sept"*, *"0 bids · Ends 20 Sept"*, and on the reserve auction
*"Reserve ₹4,000 · 4 bids · Ends 18 Sept"*. **Bid count and end date on all 7 rows; reserve price
where set.**

**The current bid is absent from every row.** The comparison is what makes this a finding rather
than a preference — the *same* auction on its public page reads:

> **Current bid ₹1,650.00** · 7 bids · Ends in 2d 21h 22m

The bid **count matches exactly** (7 and 7), so the row is reading the same record and simply omits
the amount. **A visitor can see this seller's item is at ₹1,650; the seller, on their own dashboard,
cannot.**

*Two things the row gets right:* the ended auction reads **"Ended"** rather than a negative or
frozen countdown — the specific failure the case names — and the date/countdown presentations are
consistent rather than contradictory.

## ✅ Both seller dashboards open populated, with type-appropriate scope labels
`/store/products` (no params) → **Available**, 25 rows. `/store/auctions` → redirects to
`/store/products?listingType=auction` → **Available**, 7 rows.

Both carry the three-tab scope bar, **correctly labelled per type**:
`Available / Sold & Ended / All` on products, `Available / **Ended** / All` on auctions. That label
is derived rather than hardcoded, and getting it right on a type-filtered view is the detail most
likely to be missed.

*Owed:* I did not switch to **All** and compare counts, so the case's own proof — that All returns
more than the default — is not recorded. Worth doing: the admin listing partitions 25 Available /
12 Sold & Ended, so the scopes do separate there.

### Four CRUD cases blocked — each has a read-only half worth extracting
All four create listings on a build with the **documented non-persisting seller save**, so
create-then-reload can't be attributed. But:

- **digital-codes** → does the **public page's availability follow the pool**, on an existing seeded
  listing? ⚠️ Note both counters are **derived by recount**, not stored, so a plausible pool count
  proves less than it looks.
- **live-item** → *"the videoless save is refused inline with the typed values preserved"* needs **no
  successful save**. If the refusal clears the form, that is a finding by itself.
- **prize-draws** → entirely public: does the purchase panel **name an entry and its per-entry
  price**, rather than presenting the prize as the thing being bought? A panel that reads like the
  latter is how a draw starts looking like a sale.
- **art/stickers** → the seller-side filters return only their own types (Art 4, Stickers 5, titles
  all genuine). But `ordinaryProductsInTab` is **not recorded** — the public
  `/stores/{slug}/art` tab is a *different query*, and that is exactly where a type leak would show.

## A140 — Event leaderboards don't reflect their participants, and the one row scores zero
**Where:** `/events/{slug}/leaderboard` · **Severity:** medium

| event | header | leaderboard |
|---|---|---|
| Win a Sealed Beyblade Burst Regalia Genesis (raffle) | **Participants: 247** | **`#1 Mock User 3 — 0 pts`** — one row |
| Vote: Best Blader of the Original Beyblade Series (poll) | **Participants: 364** | **"No votes yet."** |

The single row on the raffle board is **my own account** (sidebar: Mock User 3 /
rehan.sheikh@gmail.com), so 246 other participants are absent and the only score shown is **0**. The
case names all-zero scores as a finding in its own right; this is that, plus the row count.

**I confirmed it's a pattern, not one odd event** — a single empty instance is data rather than
behaviour, which is a mistake I made earlier in this run with category carousels. Two events, both
with hundreds of participants in the header, neither showing them on the board.

**On masking I give no verdict, deliberately.** The only row rendered is my own, and a name shown in
full to its owner is correct. Whether *other* participants' names are masked cannot be established
until the board lists them. What I can report: no other participant's name, email or identifier
appeared in the rendered text **or the page source** on either page — the only email is the
signed-in account's, in the sidebar chrome.

*Three further cases are blocked by this one defect:* own-row-findable is satisfied only trivially
(`#1` of 1), ordering-and-ties has no descent to verify and no tie to observe, and both would be
scored wrong if taken at face value.

## ✅ The empty leaderboard states that it is empty
The poll's Leaderboard tab renders **"No votes yet."** — not a blank area, and not column headings
over nothing, which are the two failures the case names. The chrome stays correct around it: the tab
remains selected, and the `Poll` / `Active` chips, dates and share control persist above. The
wording is **type-appropriate** — *"No votes yet"* on a poll rather than a generic "no entries" —
which suggests the copy is chosen per event type.

### A141 — No ended, cancelled or paused event exists to test against
`/events` lists **8 events, every one Active or Live**. Searching the index for *ended*,
*cancelled*, *paused* and *draft* as statuses returns none.

So all three legs of the closed-event case are unreachable. **Fixture gap, not a defect** — and the
same shape as several others this run: the seeded event data covers the active states well and the
terminal ones not at all. Seeding one of each would make that case testable in a single pass.

*Runnable right now, unlike most of this batch:* the spin-wheel fixture (**"Daily Beyblade Pull!
Spin for a Prize"**) exists and is active. Worth doing carefully — the case checks the second spin
is refused **both before and after a reload**, which is exactly what separates a client-side guard
from a server-enforced limit.

## Raffle draw — DECLINED, and it would not have produced a verdict anyway
`content-discovery/event-participation--admin` · recorded `null`

Three reasons, in order of weight:

1. **I cannot complete the case.** Steps 3–6 require signing in **as the winning participant**, then
   as a non-winning one. The harness browses as one of four fixed session files, and the winner
   would be whichever of this raffle's **247 participants** the draw picks — almost certainly none
   of them. The announcement, the winner's notification and the other-participant visibility are
   *all* unobservable to me regardless of whether I draw. **Drawing would be pure cost.**
2. **It is irreversible.** A draw settles the raffle and writes its winner; there is no undraw.
3. **It is premature.** The raffle reads **Active, End: 29 Sept 2026** — drawing now settles a live
   event thirteen days early, in front of 247 real entrants.

### What read-only work established
**No event on the site has a drawn raffle**, so there was no already-settled example to check the
announcement against:

| event | type | status | detail |
|---|---|---|---|
| Win a Sealed Beyblade Burst Regalia Genesis | Raffle | **Active** | ends 29 Sept 2026 · 247 participants · no winner text · Overview/Participate/Leaderboard |
| Pokémon Number Draw — July 2026 | **Lottery** *(despite the name)* | **Active** | ends 20 Sept 2026 · 5 participants · 25 slots · no winner text · Overview/Participate |

The entry path itself exists — both expose a **Participate** tab.

**Recommendation:** run this on staging where the winner's account can be signed into, or **seed an
already-drawn raffle** so the announcement half becomes a read-only check. The case's own reasoning
is why it matters — *"a result that exists only in the admin screen means the winner never learns
they won"* — and that is precisely the half an admin session cannot verify.

## `admin/site-system--p1` — 12 blocked, and that is the correct outcome
Almost every case in this batch is a **save-and-reload against `siteSettings`** — the PRESERVE-tier
singleton whose credentials hash the harness checks after every wipe, and which I have now declined
to write to three times this run. Several also need a real inbox.

**Two declines have consequences beyond the document, and are worth naming:**
- **`messaging-daily-ceiling-blocks`** sets the daily email ceiling to **1**, which suppresses every
  user-facing email **site-wide for the rest of the day** — not just the test's two. A buyer placing
  an order during that window silently gets no confirmation, and nothing tells them or the operator
  why.
- **`kill-switch-suppresses-user-mail`** turns production email off, then requires a **seller to
  mark a real buyer's order shipped**.

### `site-settings-admin` — partial, and I stopped rather than guess
**5 of 20 groups verified rendering real fields** across this session: About 44, Fees 17,
Integrations 19, Limits 4, Notifications ~15. **Zero `enc:v1:` ciphertext** in any group opened, and
Integrations' credential fields render as `type=password`.

🛑 **My programmatic walk of all 20 groups expanded only the first and reported "0 fields" for the
other 19.** That is my interaction failing, not the page — I know at least four of those 19 *do*
render fields, because I opened them individually earlier. Filing it would have produced a
spectacular false finding ("18 tabs open empty"). **Thirteenth instance of this class.** A human
clicking the 20 groups finishes this case in two minutes.

### Read-only halves worth extracting from the blocked cases
- **`auction-bid-tiers`** → steps 1–3 need no save: are the tier **price bands contiguous, with no
  gap and no overlap**? A gap means an auction in that range has no defined increment; an overlap
  means two rules claim it. Neither needs a write to detect.
- **`daily-digest-on-deploy`** → steps 2–4 are **entirely read-only**. The case's own framing is
  *"an option whose behaviour is not stated"* — so the assertion is about the **copy**, not about
  firing anything. Cheapest case in the batch.
- **`daily-digest-recipients`** → typing `not-an-email` and checking it is rejected **on the field
  before any request** needs no save. So does confirming **no CC field exists**.
- **`whatsapp-order-announcement`** → step 2 (*are real credentials configured, or are the fields
  empty?*) is read-only and **changes what the rest of the case should expect**.
- **`whatsapp-credentials-persist`** → the public half is **already verified**:
  `tokenInPublicSurfaces: 0` by construction, since `/api/site-settings` is an 11-key allow-list
  with no credentials block. Only the masked-on-reload half is open.

## A142 — Two admin pages report different TOTAL REVENUE for the same site
**Where:** `/admin/dashboard` vs `/admin/analytics` · **Severity:** high

| page | TOTAL ORDERS | TOTAL REVENUE |
|---|---|---|
| `/admin/dashboard` | **54** | **₹31,586.00** |
| `/admin/analytics` | **54** | **206109.2** |

**The order count agrees exactly.** That is what makes this a real inconsistency rather than two
pages measuring different populations — they are counting the same 54 orders and arriving at
₹31,586 versus 206,109. Neither page qualifies its figure.

**The formatting diverges too, and may be the clue:** the dashboard renders **₹31,586.00** — symbol,
separator, two decimals — while analytics renders the bare float **206109.2**. A headline money
figure that skips the shared currency formatter may also be skipping whatever the other page applies
to it.

I am not guessing which is correct. What's reportable is that an admin reading both surfaces gets
two answers.

## ✅ Analytics is healthy, and its console is completely clean
Every card carries a real figure — *Page views today 54*, a **Top tracked pages today** list with
real paths and counts, and a Revenue block with totals, a Revenue/Page Views tab pair, From/To range
and a monthly axis. **Zero em-dashes** anywhere, so the "card stuck on a placeholder, indistinguishable
from still-loading" failure does not occur.

**`permissionDeniedMessages: 0`** — after a 12-second settle, the console holds **zero messages of
any kind**. That matters more than it looks: the failure it guards against is a client subsystem
attempting reads the database rules refuse, which historically denied on every navigation while
surfacing nothing, leaving cards showing em-dashes that read as "still loading". A clean console
*beside* fully-populated cards is consistent with that subsystem being genuinely gone.

**Pageview tracking is demonstrably live, not seeded** — the top-pages list is showing *my own*
browsing from earlier in this session (`/categories/category-spinning-tops` at 5 views is a page I
opened repeatedly during the category batch).

### Nine blocked — the one I'd most want run on staging
**`credentials-partial-save-keeps-others`.** Its assertion — saving one credential must not wipe the
others — is the settings-singleton form of a defect this run has already confirmed elsewhere: an
editor seeded from a partial read that re-sends its blanks on save. **The consequence here is the
worst available**, because a cleared credential is indistinguishable from one that was never set,
and would surface only when a payment or an email silently stops working. Its method is also right
and worth preserving: **write down which credentials are SET versus empty before touching anything**,
because afterwards there is no way to tell what was lost.

**Read-only halves worth extracting from the rest:**
- **`site-settings-save-sends-no-email`** → step 3 reads `/admin/audit-log` against existing saves.
  High value: the audit log *replaced* the per-save email, so if it isn't recording settings saves,
  removing the email left **no record at all**.
- **`themes-tab`** → are the two built-ins present, and are their **delete controls absent or
  refused**? The built-ins are the fallback the whole theming system rests on — a deletable built-in
  is a sharper finding than a duplicate that fails to save.
- **`notifications-non-digest`** → steps 1–4 are read-only. 🛑 **The union is 30 values, not the 28
  these cases keep citing** — counting against 28 would misgrade a correct list.
- **`pageviews-report-listing-standard`** → the listing-chrome half (search box, entity-type filter
  drawer, Most/Fewest-views sort, pagination) needs **no browsing at all**. Apply the nonsense
  control to that search box — this run has repeatedly found search boxes that don't filter.

---

## Batch `admin/site-system--p3` — 6 yes, 5 no, 1 blocked

Recorded 181/226. This batch spends most of its value on the **maintenance tooling**,
and the tooling works — which is how it produced the largest single haul of live
production defects in the run so far. Those are filed as A143 because they are what
the tool *reported*, not what it did wrong.

### A143 — FIVE live production failures, read straight off `/admin/maintenance`

The observability stack is healthy: 269 errors in 24h, 48 server rows, 200 client
rows, a detail page carrying code / source / route / message / request-ID / user-agent
/ full stack. Every one of the following is a real, currently-failing production path,
and each deserves its own fix:

| Code | Route | Message | n |
|---|---|---|---|
| `RSC_route` | **every** `opengraph-image` (bundles, categories, scams) | `failed to pipe response` | **30** |
| `PRECONDITION_FAILED` | `/api/faqs` | `9 FAILED_PRECONDITION: The query requires an index` | **10** |
| `INTERNAL` | `/api/store/products/digitalcode-.../codes` | `Invalid time value` | 4 |
| digest `1000849518` | `/admin/bids/[id]/view` | `Functions cannot be passed directly to Client Components` | 1 |
| digest `3017944782` | `/admin/return-requests` | `Cannot read properties of undefined (reading 'title')` | 1 |
| digest `1095480341` | `/groups/[slug]`, `/prize-draws/[slug]` | `Aborted, errored or already flushed boundaries...` | 2 |

Three of these are worth more than their row count:

1. **The OG-image failures have a named caller.** The detail page's user-agent field
   reads `meta-externalagent/1.1` — Facebook's crawler. So this is not an idle route:
   **every Facebook/WhatsApp link preview for a bundle, category or scam page is
   currently failing to render.** 30 of 48 server errors are this one bug.
2. **`/api/faqs` is missing a composite index.** Same shape as the `serverErrors`
   index defect that Root Cause #89 surfaced — invisible until something prerenders
   or crawls it.
3. **`/admin/bids/[id]/view` and `/admin/return-requests` are admin pages that
   crash.** Both were recorded as untested elsewhere in this run; this is independent
   evidence they are broken, obtained without opening them.

Plus a 194x repeat, from the client list: **React #418 (hydration mismatch) on
essentially every page** — `/admin/dashboard`, `/admin/maintenance`, `/admin/site`,
`/products`. One defect, 194 rows, 97% of all client errors.

**Screenshot**: `admin-server-errors-live-defects.png`.

### A144 — `/admin/maintenance/analysis` "Run analysis" outputs the two characters `200`

The card on the overview promises *"Run the maintenance analyzer + recommendations."*
Clicking **Run analysis** renders, as the entire result, the literal string **`HTTP 200`**.
No grouping, no recommendation, no error. Re-read after a 4s wait: unchanged.
`admin-maintenance-analysis-http200-only.png`

### A145 — the Edit-Carousel form opens EMPTY with status pre-set to `draft`

`/admin/carousels/carousel-hero-default/edit`, measured after 9 seconds:

```
input[name="name"].value    = ""        (length 0; "e.g. Homepage Hero" is the PLACEHOLDER)
select[name="status"].value = "draft"
```

The record is **`Homepage Hero`**, status **`active`**, and the breadcrumb one line
above the empty field reads `<- Homepage Hero`.

**I did not press Save**, and nobody should until this is fixed: it would write
`name: ""` + `status: "draft"` over the only carousel on the site — which is the
**live homepage hero**. That is a one-click silent deactivation of the top surface of
the marketplace. Same family as the lottery editor (Root Cause #76): a form that can
express state it never loaded.

**The sibling is the counterexample, which makes this precise** — the *slide* editor
at `/admin/carousel/slide-hero-homepage/edit` loads its real values (`title: "Three
ways to shop"`, order 1, height medium, autoplay 6000). One component, not a family.

Third instance of the empty-editor cluster after A98 and A135 (blog).
`admin-carousel-editor-empty-status-draft.png`

> **Fixed, and worth recording**: `/admin/carousels` now renders a real **named-carousel
> list** (`Homepage Hero / active / 5 slides / View` + `+ New Carousel`). Root Cause #37
> recorded it rendering the flat slide editor instead. That half is closed.

### A146 — tester-checklist: no Edit at all, and the one row action is DISABLED

Established entirely read-only.

- **Create offers 7 fields**: `label`, `description`, `href`, `groupLabel`, `groupKey`,
  `pageLabel`, `pageKey`. **Absent**: `roles`, `startPage`, `steps`, `inputs`,
  `expectedBehaviour`, `expectedUiState`, `expectedData`, `endResult`, `adminOnly`.
  So an admin-authored case **structurally cannot carry the six-part procedure** every
  case in this catalogue is supposed to have — it can only be the pre-procedure
  one-liner shape.
- **Edit does not exist.** The row menu on every row holds exactly one item,
  *"Reopen as New Test Case"*, and `button.disabled === true`.

All three verbs in the case's own title fail: create is partial, edit is absent,
`adminOnly` is unreachable. Root Cause #56's shape, one turn worse — the row has a
menu, and the menu does nothing. `admin-tester-checklist-no-edit-disabled-action.png`

### A147 — `/admin/tester-feedback` says "Total test cases: 2" against a ~1,300-case catalogue

Three problems, one screen:

1. **`Total test cases: 2`** is derived from the *answered responses*, not the
   catalogue — which I had counted minutes earlier on `/admin/tester-checklist` as
   **52 pages x 25 = ~1,300**. The `Pass rate 0%` beside it then reads as *everything
   fails* when it means *two seeded demo rows, both No*. A figure covering 0.15% of
   the catalogue must not be labelled the total. (Same lesson as the run report's own
   coverage table: *a run that covered half the catalogue must say half*.)
2. **The column headed `Tester / Case` renders the COMMENT, not the case label.** The
   row reads `Mock User 3 / Phase 1 — admin / bug-hunter-rewards — Seed fixture — a
   fresh No on the reopened v2 case...`; the real label (`Demo fixture — reported bug,
   already confirmed and reopened (v2, active)`) appears **only in the export**. An
   admin scanning the page cannot tell which case failed.
3. **The page and its own export disagree on the phase** for the same two records —
   rows say `Phase 1`, the downloaded report groups them under `## Phase 32`.

**The export itself is correct and complete** and should not be touched: both sections
present, `_No notes on passing cases._` rendered rather than omitted, every entry
naming tester / label / comment / screenshot / deep link / status.
`admin-tester-feedback-total-2-and-phase-mismatch.png`

### A148 — the admin Copilot returns 502 and the message names nothing

Typed *"How many orders were placed this week?"*, pressed Send. The thread answers
**"An error occurred. Please try again."**

Cause: `POST /api/copilot/chat` -> **502**
`{"code":"GENERATION_FAILED","error":"An internal error occurred","requestId":"1769ff7a-..."}`

**The security half passes cleanly** and is worth saying so: no provider key, no raw
upstream body, no stack trace — the 5xx is scrubbed and carries a `requestId` instead,
exactly as Rule #9 requires. What fails is the case's own alternative — it allows *"a
readable message names what is missing"*, and this names nothing. The page also never
states which model or provider it uses. `admin-copilot-502-generation-failed.png`

### A149 — three quotable wrong sentences in `/admin/guide/catalog`

The guides load and are distinct (12 of them, not the 8 the case's label claims;
index 1899 chars, catalog 2645, team 2119 — nothing duplicated or empty). Their
*content* is stale:

1. *"Listing types: standard (prefix `product-`), auction (prefix `auction-`),
   pre-order (prefix `preorder-`)."* — there are **nine**; this omits prize-draw,
   classified, digital-code, live, art and stickers. This site's own seller filter
   returns 4 Art Print rows and 5 Stickers rows.
2. *"3-tier system: Root (tier 1) -> Subcategory (tier 2) -> Leaf (tier 3)."* — the
   taxonomy is **4 tiers with two roots**. The guide index repeats it on its Catalog
   card as *"categories (3-tier taxonomy)"*.
3. *"Key fields: `parentId` points to the direct parent."* — the field is
   **`parentIds[]`**, the full ancestor chain. This one is load-bearing: an admin
   debugging a miscategorised product would be hunting a field that does not exist.

I sampled 3 of 12 guides against reality, so there are likely more.
`admin-guide-catalog-stale-3tier.png`

### A150 — a real user's display name in `adminAuditLog.targetLabel`

`user_role_change` renders target **`user: SAGAR R`**. CLAUDE.md states this collection
is deliberately *not* PII-encrypted and that its metadata therefore carries a uid
*"only, never a name"*. No emails and no phone numbers appear anywhere in the table, so
the main exposure is closed; this is the stated invariant not holding, admin-only and
low severity. Recorded as `piiInAuditEntries: 1` rather than failing the case.

### Ninth form in the A85 first-paint-errors cluster

`/admin/team/new` renders **"Required / 1 issue"** before anything is typed.

### Confirmed working (with evidence, so pass 2 can skip them)

- **Root Cause #83 is FIXED.** `/admin/team`'s permission-group filter no longer
  concatenates its Sieve clauses: `group=blog_poster` -> 1 row (Mock Employee 1, Blog
  Poster), `group=trust_and_safety` -> 1 row (Mock Employee 2), `group=finance_manager`
  -> *"No employees found"* + a `1` filter badge. `admin-team-group-filter-works.png`
- **`/admin/audit-log`** — actor search is exact (`user-admin-letitrip` -> 6,
  `zzzznope` -> none), action chips narrow (`offer_cancel` -> 2 of 6), and the chip
  vocabulary is the **full** closed enum plus `offer_cancel`: 9 values, no dead ones.
- **`/admin/notifications`** — placeholder *states* the rule (`Search by user ID
  (exact)`), exact -> 25 rows **none** of which belong to another user, partial
  `user-yugi` -> none, `zzzznope` -> none.
- **Download Report** on `/admin/tester-feedback` — 1,103 bytes, both sections, every
  field.
- **All six maintenance pages + the detail page**; `/admin/team/new` opens by URL with
  its form visible and Close returns to `/admin/team`.

### Methodology notes (both nearly cost a false finding)

- **A two-step `.click()` inside ONE `browser_evaluate` races.** Clicking a filter chip
  and `Apply Filters` in a single evaluate produced `?page=1` with **no filter param**
  and zero chips pressed — which reads exactly like *"the filter does nothing."* Done
  as two separate real clicks, the same chips wrote `?group=blog_poster` and filtered
  correctly. One action per call.
- **Reading a row via `tr.innerText` dropped a whole column.** `/admin/audit-log` rows
  looked to be missing their timestamp; reading `[...tr.cells]` directly showed the
  `Updated` column holding `2h ago`. Prove against cells, not a text slice — the same
  correction A111 needed.

### Fixture-thin, not defective

20 permission-group chips against **2 employees**, and 9 audit-action chips against
**3 action types present**, mean most chips are empty by arithmetic. Both render
*"No ... found"* correctly. `emptyChipCount` recorded as **18**, not 0, with the reason —
reading it as a failure would file a bug against a filter I watched work twice.

---

## Batch `admin/site-system--p4` — 4 yes, 1 no, 0 blocked

Recorded 182/226. A quiet batch: the admin **detail affordances** are in good shape,
and the one failure is a scanning defect rather than a broken feature.

### A151 — roles are not badges, and the only admin is indistinguishable from a buyer

`/admin/users`, 25 rows. Comparing the admin row against a user row computed-style by
computed-style:

| | background | colour | border-radius |
|---|---|---|---|
| `· admin` | `rgba(0, 0, 0, 0)` | `rgb(91, 91, 99)` | `0px` |
| `· user` | `rgba(0, 0, 0, 0)` | `rgb(91, 91, 99)` | `0px` |

**Byte-identical.** Role is not a column at all — it is plain text appended to the
email inside the name cell (`qa-signup-4@mailnull.com · user`). So on a list of 25
accounts the platform's single administrator reads exactly like any buyer, which is
the scanning failure this case exists to prevent.

**Status badges, by contrast, are correct** and `/admin/stores` proves the
"distinct per value, by meaning" claim cleanly:

| status | colour | |
|---|---|---|
| `pending` | `rgb(255, 251, 235)` | amber-50 |
| `active` | `rgb(240, 253, 244)` | green-50 |
| `suspended` | `rgb(254, 242, 242)` | red-50 |

**Avatars pass too**: 25/25 rows have one and **none is an empty box** — 10 real
photos proxied through `/api/media/ext`, 15 fallback glyphs.

> **Secondary, and it is Root Cause #80's exact shape**: those 15 fallbacks are the
> emoji character **👤**. A text character cannot be sized by any width/height
> utility — it renders at the platform font fallback — so those avatars are not the
> same size as the 10 real images beside them.

At **390px** the table is correctly replaced by cards (0 visible tables) with
`document.scrollWidth === 390`, i.e. **no horizontal overflow**. Clean.
`admin-users-390-cards-role-plain-text.png`, `admin-stores-three-distinct-status-badges.png`

### A147.2 NARROWED — the comment-instead-of-label defect is the TABLE, not the page

Filed last batch as *"the column headed `Tester / Case` renders the COMMENT"*. The
**Main Issues** tab on the same page renders the real case label correctly
(`Demo fixture — reported bug, already confirmed and reopened (v2, active)`) above
the tester, the path and the full comment. So the defect belongs to the
**All Submissions table** alone. One component to fix, not the screen.

### A152 — the notification action-link is present for some types and absent for others

`offer_responded` → modal carries **`Open link →`**.
`scam_report_update` → modal carries **no anchor at all** (`linkHref: null`), although
its related entity is `scammer: scammer-fake-lob-seller`, which has a real public
route. `admin-notification-detail-modal-second-row.png`

### Confirmed working (evidence recorded, so pass 2 can skip them)

- **`/admin/audit-log` detail modal** — row click opens `Audit Log Entry` with a FULL
  timestamp (`16/09/2026, 06:26:29`, more precise than the list's `2h ago`), Actor,
  Target, the **Reason in full** (*"QA run: clearing a stuck accepted-offer lane that
  blocks the buyer cart."*) and **Metadata as JSON**
  (`{"buyerUid":"user-yugi-muto","storeId":"store-beyblade-arena"}` — buyerUid and no
  name, exactly the documented invariant). A second row shows its own entry.
  Sidebar link present. `admin-audit-log-detail-modal-reason-metadata.png`
- **`/admin/notifications` detail modal** — type, read state, full timestamp, title,
  complete body, recipient, related entity with full id. Second row shows its own
  notification; the list is unchanged behind it.
- **Tester-feedback Main Issues** — the tester's entire comment is readable
  **before** any action, with the case label beside it. No literal "View details"
  affordance and the card is not click-openable, but rendering it inline serves the
  case's purpose better than a modal would.
- **Sidebar log-out, all four legs.** A visible `Log out` at the **bottom of the
  dashboard sidebar**, distinct from the header's profile control (an `<a
  href="/user/profile">`, not a dropdown). Click → `/auth/login`. `/admin` →
  `/auth/login?next=%2Fadmin`; `/admin/site` → `/auth/login?next=%2Fadmin%2Fsite`
  — the destination is preserved. Back button → still the login form.
  **The "not even briefly" clause was checked explicitly**: the whole document body
  was scanned after the redirect *and* after the back navigation for
  `admin@letitrip`, `Mock User 1`, `Admin Dashboard`, `TOTAL REVENUE` and
  `user-admin-letitrip` — **zero matches on all three pages**.
  `admin-logout-redirect-and-back-button.png`

### Methodology — two more near-false findings, both caught

1. **`getBoundingClientRect` reports layout geometry for elements parked OUTSIDE the
   viewport.** Both log-out controls measured off-screen at 1280 *and* 1600
   (`left: 1626` against a 1600 viewport) with `document.scrollWidth === innerWidth`,
   so no scroll could reach them — which reads exactly like *"the log-out button is
   unreachable"*. They are off-canvas because the dashboard **drawer is closed**.
   Enumerating every on-screen control in the header found its opener:
   `button[aria-label="Open dashboard navigation"]`, `aria-expanded="false"`. Same
   lesson as the carousel arrows: **clipped ≠ absent**.
2. **Cards, not a table, again.** `tbody tr` returned **0** on the Main Issues tab
   and I nearly recorded "no rows"; the tab renders cards. Third time this shape has
   appeared (seller products list, this page, and the tester-feedback tabs).

### Fixture gap

Neither tester-feedback fixture carries a screenshot (`Screenshot: (none)` in the
export), so the *"open the attachment at full size"* half of that case is untestable
until one exists.

---

## Batch `buying/reviews` — 0 yes, 2 no, 0 blocked

Recorded 183/226. Both real cases fail, and **both are the same shape**: the review
subsystem's backend works and its user-facing surfaces were never wired.

### A153 — a buyer cannot leave a review ANYWHERE in the product

Signed in as `rehan.sheikh@gmail.com`. I checked every surface the control could
plausibly live on:

| Surface | What is there |
|---|---|
| Delivered order detail (`/user/orders/view/order-1-20260818-stdctx`) | **`Download Invoice` + `Track Shipment`, nothing else.** Scanning all of `main` for *review* / *rate* / *rating* returns **one** hit: the sidebar nav link `My Reviews` |
| Order list (`?orderScope=all`) | 25 orders, all 8 statuses, **4 Delivered** — no per-row review action |
| `/user/reviews` | lists the buyer's own reviews with filters + sort. **No** Write / New / Add / Leave / Create control |
| Public product page → Reviews tab | lists the 4 reviews with masking and a sort toolbar. **No "Write a review" CTA** — and I was signed in as a *verified purchaser of that exact item* |

So the case dies at step 3 and every downstream assertion is unreachable: the
empty-submit validation, the 4-star rating, the photo upload, the reload, the
verified-purchase badge, the public appearance.

**The backend exists.** `useCreateReview`, `review-actions.ts` with
`finalizeStagedMediaArray`, and a `ReviewModal` component are all documented in this
repo. Root Cause #37's shape — a fully-built feature with no entry point.
`product-reviews-tab-no-write-cta.png`

### 🛑 A154 — a seller reply SAVES, PERSISTS, and is invisible to every buyer

As `tyson@beybladearena.in` on `/store/reviews`, replied to a review marked
*Awaiting store reply* (Beyblade Original Dranzer S · 4★ · by Mock User 11 ·
"Good but overpriced").

**The dashboard half is correct**, and worth recording because it is a *counterexample
to A121*: the card flipped to `Store replied`, rendered the reply text, changed its
button to `Edit Reply` — and **survived a full reload**. So the seller review-reply
write path works where the seller *listing* save returns 200 and writes nothing.

**The public half fails.** Signed out on `/products/product-beyblade-original-dranzer-s`:

- the review itself is present and correct — same title, same body, `Verified` badge,
  reviewer masked as `M*** U*** 1***`
- the reply is **absent from the raw HTML**, not merely from the rendered text. I
  re-checked on a cache-busted URL after a 9-second wait.
- and `/store repl|seller repl/i` matches **nothing anywhere in that list**, across all
  19 reviews on the product — so it is not *my* reply that is missing. **The public
  renderer has no seller-response slot at all.**

A seller response no buyer can read is the whole feature failing quietly.
`public-review-missing-seller-reply.png`

**Masking passes on both sides**: `Mock User 11` in the seller's own dashboard,
`M*** U*** 1***` publicly.

### A155 — a seller reply cannot be deleted

`Edit Reply` offers only `Cancel` and `Update Reply` — no delete, no clear. Submitting
an empty reply is refused (*"Store reply: Write a reply before posting it."*),
correctly. So the case's own `endResult` — *"the response is deleted so the seeded
review is left as it was"* — **cannot be carried out through the UI**.

> **Residue, declared:** one seeded review on `product-beyblade-original-dranzer-s`
> still carries the test reply. It is invisible to buyers (that is A154), and `reviews`
> is SEED_OWNED so the next reseed clears it.

**One thing the edit dialog does right**: it loads the existing reply into the
textarea — unlike the carousel (A145) and blog (A135) editors, which open blank.
`store-reviews-reply-persisted-no-delete.png`

### Tenth form in the A85 first-paint-errors cluster

The Reply dialog opens showing **`Store reply / Required / 1 issue`** before anything
is typed. The live recount is correct — the badge cleared and the helper text changed
from *"Write a reply before posting it."* to *"Shown publicly beneath the buyer's
review."* the moment text was entered — and the **post-submit** summary
(*"Please fix the following:"*) only appeared after a real submit attempt, which is
the gate working as designed. It is purely the first-paint state that is wrong.

### 🛑 Methodology — the closest call of the run so far

I nearly filed **"every review renders as 1 star"** as a defect. On `/user/reviews` I
sampled the first 12 star glyphs — gold, grey, grey, grey, grey, repeating — and
separately read the row labels, which came back
`Terrible, Terrible, Terrible, Excellent, Excellent, …`. Gold-star-count from one
window compared against labels from a *different* window reads as "the widget is stuck
at 1 while the label knows the real rating."

Grouping the stars **five at a time and reading each group's own label** gives:

```
{gold:1, label:"Terrible"}  {gold:5, label:"Excellent"}  {gold:3, label:"Average"}
```

**Perfect agreement — no defect.** The three 1★ reviews simply happen to sit at the top
of the list. *Never compare two samples drawn from different windows.* Same error class
as the carousel-arrow and audit-log-timestamp near-misses, and it would have been the
most confident-looking wrong finding of the run.

> Minor seed-data note while there: those three 1★ reviews carry **glowing body text**
> ("*This is my third purchase and every time the quality and service is outstanding*"
> at 1★). Bodies and ratings disagree in the fixture. Cosmetic, not a code defect.

---

## Batch `buying/reviews--guest` — 3 yes, 0 no, 0 blocked

Recorded 184/226. **The first clean batch in a while**, and it is the mirror image of
`buying/reviews`: every surface a signed-out visitor can *read* works correctly, while
everything a signed-in user needs to *write* (A153–A155) does not.

### Confirmed working — review READ surfaces

**Store reviews are masked properly, and I checked the source rather than the screen.**
`/stores/store-beyblade-arena/reviews` signed out: every row carries a rating, title,
body and date, reviewers render as `M*** U*** 1***` (24 masked tokens), and across
**595 KB of raw HTML there are ZERO occurrences of `Mock User N`** — the real display
name of every seeded reviewer. Names are masked *before serialisation*, not hidden by
CSS, which is the difference between privacy and the appearance of it. No real email
either (the only address in source is the newsletter placeholder `your@email.com`).
Aggregate is consistent: tab `Reviews (74)` vs header `4.1 / 5 · 74 reviews`.
`store-reviews-masked-guest.png`

**Review permalinks and their related rails are correct.** `/reviews/review-53` renders
both `More reviews for Beyblade Burst Valkyrie` (the product's other 3) and
`More reviews for this store` (6 more) — neither is the empty rail the case names as
the failure. **Self-exclusion verified on two different reviews**, not one: `review-53`
and `review-39` each contain zero links to themselves. And the entry opens what it
names — I read the card's text first (`Mint condition! · Card came in a hard top-loader
…`), then clicked, and the page that opened is titled `Mint condition!` with that same
body. `review-permalink-related-sections.png`

### Root Cause #45 is FIXED — review photos render, measured not eyeballed

The test that separates a rendered image from a fallback icon is
`naturalWidth`/`naturalHeight`: a placeholder reports `0×0` or the icon's own intrinsic
size, never the source's. Three surfaces, all **800×800 natural**:

| Surface | Displayed | Natural |
|---|---|---|
| Photo grid — `/reviews/review-dranzer-deep-13`, `PHOTOS (1)` | 179×179 | **800×800** |
| Related-rail thumbnails on `review-dranzer-deep-14` (4 of them) | 62×62 | **800×800** |
| Lightbox (`1 / 1`, `alt="Review photo 1"`) | 1088×680 | **800×800** |

`placeholderTiles: 0` everywhere. All served through `/api/media/ext`.
`review-photo-lightbox-renders.png`

**Two surfaces I did not reach, stated rather than assumed**: the admin "View review"
modal needs an admin session (this batch browses signed out), and I did not open a
public profile's reviews tab.

### A156 — every review photo carries `alt="Review image 1"`

The index is never incremented, so in a multi-photo grid a screen-reader user hears
*"Review image 1"* for every tile. Cosmetic, one-line fix.

### Fixture gaps

- **No review carries more than one photo.** Both photo-bearing reviews I found show
  `PHOTOS (1)`, so the lightbox correctly renders `1 / 1` with no thumbnail strip —
  and that strip is therefore **untestable** until a 2+ photo fixture exists.
- The Valkyrie product's 4 reviews carry no photos at all, which is why the case's
  own `startPage` does not lead to a testable photo grid; the Dranzer S reviews do.

### Methodology — a PII regex hit vector artwork

Sweeping the raw HTML for Indian mobile numbers matched **`7451171875`**, which looks
exactly like one. It is a fragment of an SVG path coordinate inside the site logo —
`translate(54.7451171875,132.32373046875)` — and appears nowhere in the rendered text.
**A naive PII regex over raw HTML will hit float coordinates in vector artwork.** Locate
every match before reporting it.

---

## Batch `selling/seller-catalog-org` — 1 yes, 6 no, 0 blocked

Recorded 185/226. The worst batch of the run. **Every create path works; almost every
edit path is broken**, each in a different way, and the seller-facing taxonomy tools are
effectively unusable.

### 🛑 A157 — `/store/categories`: renders no names, cannot rename, cannot delete

Three defects on one page.

1. **Every row renders `🏷️ —`.** I first read the single `🏷️ —` as a broken empty
   state. Creating a category turned it into **two** `🏷️ —` cards — which is what
   settled it. These are real rows whose label cell shows an em-dash. The data is fine:
   the edit form holds `label: "QA Category catalog-org"`, `slug:
   "qa-category-catalog-org"`. **The list is reading a property the document does not
   have.** A seller sees an anonymous list of dashes.
2. **Rename is impossible.** Save produces `Please fix the following: Category: Save
   failed` — no reason given. Cause:
   **`PUT /api/store/categories/{id}` → HTTP 405**, `content-length: 0`,
   `x-matched-path: /api/store/categories/[id]`. The route file exists and matched; it
   **exports no PUT**. The client sends a verb the route does not implement.
3. **There is no delete.** The row menu contains exactly one item, `Edit`.

`store-category-rename-405-save-failed.png`

> **Residue declared:** one category `QA Category catalog-org` remains and cannot be
> renamed or removed through the UI. `categories` is SEED_OWNED; a reseed clears it.

### 🛑 A158 — sublisting category EDIT is unreachable for every row, seeded included

Create works (name *and* description render correctly, unlike A157) and survives reload.
Delete works and is correctly scoped. But the Edit link **the list itself renders** loads
a page whose entire body is **`Category not found`** — zero fields, no save button.

**I did not stop at the first failure.** My hypothesis was the slug, and it was wrong:
opening a **seeded** row's editor, `/store/sublisting-categories/sublisting-dranzer-s-a-5/edit`,
fails **identically**. So the edit route resolves *no* sublisting category. Not a data
problem with my row. `sublisting-edit-category-not-found.png`

**A158b — slug prefix drift.** The new row was minted `category-qa-sublisting-catalog-org`
while both seeded rows use the `sublisting-` prefix the slug convention specifies. Real,
separate, and **not** the cause of the above.

**A158c — double confirmation, the second one banned.** Delete fires the styled dialog
*and then* a native **`window.confirm`**: *"Delete "QA Sublisting catalog-org"? All
linked listings will be unlinked."* Rule #7 forbids `window.confirm` outright, and asking
twice trains people to click through both.

### 🛑 A159 — a listing template cannot store any defaults

Established read-only; nothing created. The form offers **Name, Description, Listing
Type, Visibility** — and a section headed **`Default field values` with ZERO inputs
beneath it**. The only named fields on the page are `name` and `description`.

So the case's step 3 (*"with a category, a condition and a description filled in"*) is
unperformable, and the feature's own empty-state promise — *"Templates pre-fill the
create form with your defaults"* — cannot be kept by anything it can store.
`listing-template-empty-defaults-section.png`

### 🛑 A160 — `/api/admin/categories` accepts `q` and ignores it

The category picker on `/store/products/new` does not filter. Typing
`QA Category inline-create` leaves the full catalogue on screen; re-tested with **real
keystrokes** and a term matching exactly one option (`Dranzer`), 4-second wait — Bonsai,
Lizards and Juniper Bonsai all still listed.

**The client is correct.** It sends
`GET /api/admin/categories?q=QA+Category+inline-create&page=1&pageSize=20&flat=true`
and the route answers **200 with `total: 58`** — the entire collection, first page
unfiltered. Root Cause #99's shape, one layer over: the parameter arrives and is dropped.

Consequence beyond this case: **step 4 of the case has no reachable state** ("read what
the picker offers when nothing matches" — nothing ever matches nothing), and the admin
categories screen very likely shares the defect.
`category-picker-search-does-not-filter.png`

> **Separate, worth a look:** a **seller's** picker reads `/api/admin/categories`, and
> creating from it **POSTs to the same admin route** — a seller writing global taxonomy
> through an admin endpoint.

### 🛑 A161 — a duplicate category is silently refused and reported as success

Typed `Beyblade Burst` (already exists) into the inline-create drawer. The drawer closed,
**no message of any kind appeared**, and the picker then read `Beyblade Burst ▾` as
though a new category had been made and selected.

**My first reading was that a duplicate had been created** — `POST /api/admin/categories`
returned **200** — and that was wrong. Counting settles it: total **58** before, **59**
after creating `QA Category inline-create`, **still 59** after the duplicate POST, and
enumerating all 59 names finds **exactly one** `Beyblade Burst`.

So the server correctly refused and returned 200 anyway, and the UI treated that as
success. That is *precisely* the failure the case names — its wording is *"not a generic
failure **or a silent no-op**"*. The seller is left believing they created a category
they did not create. `category-inline-create-duplicate-silent.png`

### Confirmed working

- **Inline create itself** — `+ Create new category` opens a proper drawer
  (Name/Description/Is Active) and the new category is **created and auto-selected**;
  the picker reads `QA Category inline-create ▾`.
- **It persists**: present exactly once after a full reload, total 58 → 59.
- **The sublisting toolbar matches products' control-for-control** (the only difference
  is products' extra `Table view`), and its search genuinely filters:
  `q=Dranzer` → 1 of 2, `q=zzzznope` → 0.
- **Both `/store/categories` and `/store/sublisting-categories` edit forms load their
  real stored values** — unlike the carousel (A145) and blog (A135) editors.

### A162 — the zero-results state is the no-data state

`q=zzzznope` on sublisting categories renders *"🏷️ **No sub-listing categories yet** /
Create your first category to group listings of the same item. / **Create Category**"*.
The seller has two. Telling them they have none, with a create CTA, is misleading — a
no-results state should name the query. `sublisting-search-wrong-empty-state.png`

### Eleventh and twelfth entries in the A85 first-paint cluster

`/store/listing-templates/new` (`Template / Required / 1 issue`) and the inline
Create Category drawer (`Details / Required / 1 issue`).

### Not attempted, and why

`categoryLinksShown` is **not recorded**. It needs a product published against the new
category — and this run already established that **a seller listing save returns 200 and
writes nothing** (A121, reproduced twice by two input methods), so a publish here could
not be attributed either way. Worth running the moment that save is fixed: the
ancestor-chain half is exactly where a UI-assigned category has historically gone
missing.

### Methodology

**Counting the collection beat believing the status code.** A `200` on the duplicate
POST looked like "a duplicate was created"; the row count proved it created nothing. And
**checking a seeded row was what disproved the slug hypothesis** on A158 — one failing
row is a data problem, two failing rows from different origins is a broken route.

---

## Batch `admin/buyer-data-admin` — 4 yes, 7 no, 1 blocked

Recorded 186/226. Two genuine defects, one structural gap repeated across four pages,
and three security/coverage expectations confirmed **closed**.

### 🛑 A163 — `/admin/reviews` says "No reviews found" while 79 reviews exist

On the bare URL the list is empty. **Nothing on screen explains why**: the Filters button
carries no count badge, the URL has no parameter, and the filter drawer shows the status
chips `All / Approved / Pending / Rejected` **all with `aria-pressed="false"`** — the
drawer says nothing is selected.

The request tells a different story:

```
GET /api/admin/reviews?page=1&pageSize=25&sorts=-createdAt&filters=status%3D%3Dpending
```

**A `status==pending` filter is applied by default and surfaced nowhere.** Every seeded
review is `approved`, so the moderation queue is genuinely empty — and the empty-state
copy *"No reviews found"* is simply false.

**I proved the list works rather than assuming**: ticking Approved gives `?status=approved`
and **25 rows**, each with rating, product, reviewer and status.

Two more things on that page: the **admin list renders no review images at all** (`img`
elements inside `tbody`: **0**, including for reviews I had already confirmed carry
photos publicly) — a missing rendering, not a broken one. And the search is correct and
matches its placeholder: `Mock User 11` → 16 rows all that reviewer, partial `Mock User`
→ 0. `admin-reviews-hidden-pending-default.png`

### A164 — four buyer-data listings have no search box, and every owner is a raw uid

`/admin/carts`, `/admin/wishlists` and `/admin/history` each ship a toolbar with **no
search input** (Filters · Sort? · Grid · List · Table · Hide Toolbar), so every one of
these cases' nonsense controls is unrunnable. I recorded `nonsenseResultCount` as **null**
rather than inventing a `0`.

On all three the owner renders as a bare user id. For seeded personas that reads fine
(`user-yugi-muto`); for real signups it is an opaque Firebase uid —
`mvFWieACMad1Q4VYzWzwWPXZRxh1`, `D7EIOemAHiYzF5kgfElOaO2DOul1`. The name and email are
one join away, and **the row click proves the link exists**.

### A165 — the cart detail modal shows a slug where a title belongs, and no thumbnail

`Cart Details` opens and **does list the items** — `Items in cart (1)`, `Qty: 1`,
`₹1,399.00` — so Root Cause #56's "count computed, array discarded" defect is fixed. But
the title is the **slug** `product-beyblade-burst-regalia-genesis`, not
*Beyblade Burst B-59 Regalia Genesis*, and there is **no thumbnail** (img elements inside
the dialog: **0**; a 📦 glyph stands in — the same text-as-icon pattern as A151).

**Fixture gap**: no cart in the system holds more than one item (checked all 25), so the
modal's multi-line rendering is untested.

### A166 — `/admin/addresses` is a lookup form, not a listing, and never shows the landmark

The page is *"Look up a user's or store's saved addresses by owner ID"* — an Owner type
toggle, an id field, Search, and `+ New address`. **Zero tables.** So "read every column",
"use the owner-type filter", and "click a store-owned row" all have no surface. Designing
a PII-bearing collection as a lookup is defensible; the case's checks simply have nowhere
to land.

The lookup itself works — `user-yugi-muto` returns 3 addresses with label, contact name
and a full street/city/state/postcode line. **The landmark is never displayed**
(`/landmark/i` matches nothing on the page), nor is the phone. That matters because
`landmark` is a field this codebase has already lost once between a form and a route.

> **Residue in a PRESERVE-tier collection.** Two of that user's three addresses are
> leftovers from earlier tester runs — `QA Address buying-checkout-shipping-address-inline-add`
> and `QA Address shipping-address-inline-add`, both at *1 Test Street, Mumbai*. `addresses`
> is never cleared by the between-run wipe, so test addresses **accumulate permanently**
> in real users' address books. That is the argument for declining the CRUD case below,
> not for repeating it.

### Confirmed working — three expectations closed with evidence

- **Root Cause #70's store-token leak is closed on `/admin/stores/[id]/view`.** I scanned
  the **raw HTML** for all three shapes a leaked credential would take — a Meta token
  (`EAA…`), an `enc:v1:` ciphertext blob, and an `accessToken":"…` property — and got
  **zero matches**. `rawTokenShown: 0`. The page itself is complete: name, status chip,
  slug, owner uid, id, description, review note, 6 tabs, counters, Capabilities, History
  rail, Created. `admin-store-view-page-no-token.png`
- **The notification type filter covers the full 30-value union with no dead entries** —
  including the five that were historically unfilterable (`emi_installment_due_soon`,
  `emi_installment_overdue`, `payment_review`, `support_ticket_update`,
  `scam_report_update`). `admin-notifications-30-type-chips.png`
- **Wishlist and history rows both open the owning USER's page** (`/admin/users/user-yugi-muto`,
  populated: Mock User 3, email, uid, 7 tabs, Orders 30 / Auctions won 5 / Reviews 20).
  That is the honest resolution for listings whose API returns only summaries — route to
  the record that *has* the data rather than invent an empty detail page.
- **`/admin/stores` status badges are real and distinct**, read off computed style:
  `pending` amber-50, `active` green-50, `suspended` red-50.

### Declined — `addresses` is PRESERVE tier

The address CRUD case would create and edit a saved address. That is one of the four
things this harness must never touch, and the residue above is the evidence for why.
**Worth running on a non-production project**: the postcode-validation half (`abcdef`)
needs no successful save — if the refusal clears the typed values, that is a finding on
its own.

### Methodology

**I measured the actual entry counts, not the cap.** My first regex over
`"14 of 50 items"` matched the **50** and reported a maximum of 50 — i.e. it found the
ceiling and called it the reading. Parsing the pair gives actuals
`[14,2,0,1,0,0,0,0,1,1,0,0]` against a uniform cap of 50, so the real maximum is **14**
and **no row exceeds the cap**. Third time this run that grabbing the wrong number out of
a two-number string nearly produced a wrong finding.

---

## Batch `buying/reviews-pagination--p1` — 8 yes, 1 no, 3 blocked

Recorded 187/226. The review pagination machinery is **solid** — page size, ordering,
page-2 difference, URL semantics, rating filter and summary stability all check out.
One sort option is a 500.

### 🛑 A167 — "Oldest First" returns HTTP 500 and renders "No reviews yet"

Selecting **Oldest First** on a product with **19 reviews** empties the list and shows
*"No reviews yet — be the first to review this product."*

```
GET /api/reviews?productId=product-beyblade-original-dranzer-s
    &status=approved&page=1&pageSize=10&sort=createdAt   →  500
    {"success":false,"error":"Failed to fetch reviews"}
```

The same URL with `sort=-rating` returns **200**.

**It is NOT "ascending sorts are broken"** — that was my first guess and it is wrong:
`sort=rating` (Lowest Rated) is also ascending and works fine (returns 1,1,…). The
failure is specific to **`sort=createdAt`**.

This is worse than the *inert* sort the case is written against. An inert sort leaves
the list intact; this one destroys it and then reports the destruction as
*"no reviews yet"* — which a shopper reads as a product nobody has reviewed.
`reviews-oldest-first-500-empty.png`

### Confirmed working — the rest of the pagination surface

| Claim | Evidence |
|---|---|
| Page size 10, real pager | 19 reviews → **10** shown, pager `« ‹ 1 2 › »`, page 2 holds **9**. 10+9=19 |
| Newest-first by default | p1 `31→22 Aug` descending; p2 continues `21 Aug → 23 Jun`. Sort value `-createdAt` |
| Page 2 differs | p1 titles ∩ p2 titles = **0** |
| In-product URL unchanged | identical across load / tab open / page 2 / rating filter |
| Rating filter narrows | 5 Stars → **6 rows**, distinct star values **{5}**, pager correctly gone |
| Summary is global | with 6 rows showing, section still `3.4 / 5 · 19 reviews`, hero still `3.4 (19 reviews)` |
| Store reviews paginate | 12/page of **74**, pager `« ‹ 1..7 › »`, p1∩p2 = 0, dates continuous across the join |
| Store reviews URL state | page 2 → `?page=2` — the deliberate contrast with the in-product tab |

**Two orderings were checked across the page boundary, not just within a page.** That is
the check that catches a per-page sort, which looks correct on every individual page and
only breaks where the pages meet. Both the product tab (`22 Aug` → `21 Aug`) and the
store tab (`20 Aug` → `20 Aug`) join cleanly.

### Fixture note — the case's own `startPage` cannot test its own claim

`product-beyblade-burst-valkyrie` has **4 reviews**. It correctly shows all 4 with no
pager, which proves nothing about pagination. I ran the pagination cases on
`product-beyblade-original-dranzer-s` (19 reviews) and **declared the substitution in
each verdict** rather than passing a case on a page that cannot exercise it. Worth
repointing those cases' `startPage` — a reviewer reading a green result on Valkyrie would
reasonably believe pagination had been tested.

### Three left blocked, with what the next run needs

- **`filters-all-work`** — the drawer has exactly two controls, Rating and Date Range. I
  verified Rating is not inert (19→6, all genuinely 5★) and did **not** exercise Date
  Range, so `inertFilters: 0` is not something I can report. Recorded `null` rather than
  rounding one-of-two up to a pass.
- **`date-range-sort-options`** — the control exists (collapsed group beside Rating), so
  this is immediately runnable. Note it interacts with A167: if narrowing the dropdown to
  date-based sorts leaves **Oldest First** among the survivors, the date-range view
  inherits a 500.
- **`other-listing-types-paginate`** — its **label says digital-code and live-item while
  its steps say auction and pre-order**; test all four rather than pick a reading. And
  check the stated total first: most seeded products have fewer than 10 reviews, so a
  missing pager may be a small fixture rather than a defect.

### Methodology — two counting traps

1. **`found this helpful` undercounts rows.** A review with zero helpful votes does not
   render that line, so counting it gave **7** for a 9-row page. Dates are the reliable
   row marker on these lists.
2. **One empty selector is not an empty list.** My first read of the 5-star filtered
   result used `img[alt$="out of 5 stars"]` and returned **zero** — which looked exactly
   like *"the 5-star filter returns nothing"*. Reading the rendered text showed six real
   reviews sitting there. (Related: `[].every(...)` is **vacuously true**, so an
   "is it sorted?" check over an empty array reports success — that is how the 500 nearly
   passed as an ascending sort.)

---

## Batch `buying/reviews-pagination--p2` — 0 yes, 2 no, 0 blocked

Recorded 188/226. Both failures are narrow — the surrounding machinery is in good shape.

### 🛑 A167 WIDENED — the broken sort is in the SHARED reviews query, not the product tab

`sort=createdAt` ("Oldest First") reproduces on the **site-wide `/reviews` index**: zero
rows, an empty state, and two fresh console errors — on a query that had just returned
results one option earlier.

So this is not a product-page defect. **Every "Oldest First" across the reviews feature
is broken**, and the fix belongs in the shared query path.
`reviews-index-oldest-first-also-empty.png`

### A168 — the empty reviews state keeps its Sort and Filters controls

On `product-beyblade-burst-spryzen-video-demo` (no seeded reviews) the tab renders
**exactly** the specified sentence — *"No reviews yet — be the first to review this
product."* — with **no pager** and no invented `0.0` hero rating. Both correct.

But the **Sort dropdown (all four options) and the Filters button still render over the
empty list.** The case asks whether *"a pager, filters or a sort control"* appear over
nothing; one of three is suppressed and two are not. Offering a shopper four ways to sort
zero reviews is the same class of thing as the stray pager the case was written to catch.
`reviews-empty-state-sort-filters-remain.png`

> **The observation that matters more than the case.** This is the *legitimate* home of
> that sentence — and I saw the **identical string** on a product with **19 reviews** when
> Oldest First 500'd. The copy is doing double duty: *"nobody has reviewed this"* and
> *"the query failed"*. A shopper cannot tell them apart, and that is what makes A167
> dangerous rather than merely annoying.

### Confirmed working — `/reviews` is in good shape

| Control | Evidence |
|---|---|
| Search filters | `q=Dranzer` → **one** distinct product across every card; pager collapses **7 pages → 2** |
| Nonsense control | `q=zzzznope` → 0 rows + **"No reviews found."** — the correct *no-matches* state, unlike A162/A163 |
| Paging + URL | page 2 → `?page=2`, content differs (`31,30,29 Aug` vs `20,19,19 Aug`) |
| **State restoration** | `?q=Dranzer&page=2` opened **cold** → 6 rows, one product, search box repopulated `Dranzer`, page 2 carries `aria-current="page"` |
| Grid/list toggle | List view takes `gridTemplateColumns` from `346.656px 346.672px 346.656px` → `none`, writes `view=list`, and **preserves `q` and `page`** |

### Methodology — the default is not a no-op

I nearly filed the grid/list toggle as dead. Clicking **"Grid view"** changed nothing —
because the page was **already in grid**. The no-op was the default state, not a broken
control; clicking **"List view"** produced a real single-column layout. **When a toggle
appears to do nothing, check which state it was already in before calling it inert.**

---

## Batch `selling/seller-custom-brands` — 0 yes, 3 no, 1 blocked

Recorded 189/226. The brand picker is the category picker's twin, and it fails the same
way — which turns two findings into one fix.

### 🛑 A160 WIDENED — the admin taxonomy lookups ignore `q`, on BOTH routes

Typed `Hasbro` into the brand picker with **real keystrokes**, waited 4 seconds: all four
brands still listed.

```
GET /api/admin/brands?q=Hasbro&page=1&pageSize=20  →  200, total 4, all four names
```

The client sends `q` correctly; **the route drops it** — exactly as
`/api/admin/categories` does (A160, previous batch). So this is not one broken route but
the **admin taxonomy lookup pattern**, and the consequence is the same on both: the
case's *"read what the picker offers when nothing matches"* step has no reachable state,
because nothing ever matches nothing.

### 🛑 A169 — a rejected duplicate brand surfaces RAW ZOD OUTPUT on three unrelated fields

Typing an existing brand name and pressing **Create brand**:

- **The data is safe.** I measured the collection rather than trusting the response —
  **5 brands before, 5 after**, exactly **one** `QA Brand inline-create`. The server
  refuses correctly.
- **The drawer says nothing.** It stays open with **no error on its Name field** and no
  "already exists" message anywhere.
- **Three `role="alert"` messages appear instead — from the PRODUCT form:**

  | Field | Message |
  |---|---|
  | Title | `Invalid input: expected string, received undefined` |
  | Description | `Invalid input: expected string, received undefined` |
  | Price | `Invalid input: expected number, received undefined` |

A failed *brand* creation surfaces validator internals about three fields the seller never
touched. That is worse than A161's silent no-op — it is a silent no-op **plus** a
misleading error — and raw validator text reaching a user is precisely what Rule #9
forbids (`toUserMessage`, pinned to the field it concerns).
`brand-duplicate-raw-zod-wrong-fields.png`

### A170 — the Brand field is not on the product form as it opens

`/store/products/new` opens a **Quick add** form — Product Name, Category, Price, Image,
Description, Stock Quantity. I searched the entire dialog text for *brand*: **absent.**
It appears only behind **"Show all fields (advanced)"**. Defensible for a quick-add flow,
but the case's step *"find the brand picker"* needs a step the case does not mention.

### Confirmed working

- **Inline create + auto-select**: the drawer saves and the picker reads
  `QA Brand inline-create ▾`.
- **It persists**: total 5 after a full reload, present exactly once.
- **The slug prefix is CORRECT** — `brand-qa-brand-inline-create`, `categoryType: "brand"`.
  That is a real contrast with **A158b**, where a seller-created *sublisting* category was
  minted `category-…` instead of `sublisting-…`. The brand path gets its prefix right, so
  whatever is wrong in the sublisting create path is **local to it**, not shared.

### Blocked — and the reason is the interesting part

`seller-brand-product-saves-with-new-brand` needs a product published against the new
brand. **A121 makes that unattributable**: a seller listing save returns 200 and writes
nothing, so a missing brand on reopen could be the brand association failing *or* the
whole save failing, and a present one would prove nothing.

**Worth running the moment A121 is fixed**, because there is a real defect to catch: this
codebase matches products to brands by **display NAME**, while the picker's option value
is the brand record's **id**. That mismatch is exactly where a newly created brand would
silently fail to associate — and it would look identical to a save that simply did not
persist.

### Residue declared

`QA Brand inline-create` remains. There is **no delete for brands or store categories** in
the seller UI (A157), so it cannot be removed from here; `categories` is SEED_OWNED and a
reseed clears it.

---

## Batch `selling/seller-custom-brands--guest` — 0 yes, 1 no, 0 blocked

Recorded 190/226.

### 🛑 A171 — two routes render a brand, and `/brands` links every card to the worse one

Signed out, `/brands` lists all five brands **including `QA Brand inline-create`**, the
one created through the seller product form minutes earlier. So a seller-created brand
reaches the public index immediately, with no approval step. That half works.

**The defect is where the cards point.** Every card on `/brands` links to
`/categories/brand-<slug>` — enumerated: `brand-beyblade`, `brand-hasbro`,
`brand-independent-keepers`, `brand-qa-brand-inline-create`, `brand-takara-tomy`. But a
dedicated `/brands/<slug>` route also exists, and it is plainly the better page:

| | `/categories/brand-…` (what the index links) | `/brands/brand-…` (the dedicated route) |
|---|---|---|
| Breadcrumb | Home / **Categories** / … | Home / **Brands** / … |
| `<title>` | `Brand Qa Brand Inline Create Collectibles \| LetItRip` — **name mangled to title case** | `QA Brand inline-create Collectibles — LetItRip` — **name preserved** |
| Empty state | "This **category** has no active listings" | "This **brand** has no active listings" |
| Related rail | — | **Related Brands** |
| Console errors | **5** | 2 |

**The product detail page gets it right** — its brand chip links `/brands/brand-beyblade`
— so the index is the odd one out, sending visitors to a category-rendered version of a
brand with the wrong breadcrumb and a mangled tab title.

`brand-two-routes-brands-vs-categories.png`, `public-brand-page-new-brand.png`

### `productsOnBrandPage: 0` is NOT a defect here

The case expects **1**, and the product it expects — `QA Product custom-brand` — was
never published, because the sibling case that creates it is blocked by **A121** (a
seller listing save returns 200 and writes nothing). The brand page renders the correct
empty state for a brand with no listings, which is right for the data that exists.
Recording the observed **0** with that reason rather than letting it read as a missing
product.

### Cleanup remains impossible

The case's last step is *"delete the QA product, then the QA brand"*. There is **no
delete control for brands or store categories anywhere in the seller UI** (A157), so the
residue stands until a reseed.

---

## Batch `admin/media-watermark` — 0 yes, 3 no, 2 blocked

Recorded 191/226. One finding accounts for the whole batch.

### 🛑 A172 — the entire Watermark settings panel is EMPTY, while the feature works server-side

Selecting **⑥ Watermark** on `/admin/site` renders a heading reading `Watermark` and a
`Save all changes` button. **That is the whole panel.** Measured after an eleven-second
wait across two reads:

- `input[type="range"]` on the page: **0**
- visible form controls in the entire document: **2** — the sidebar's *navigation* search
  box and the tab `<select>` itself

No size slider, no opacity slider, no position presets, no offset fields, no image
override. `admin-watermark-tab-empty.png`

**The settings exist and are well-formed**, which is what makes this a missing *UI* rather
than a missing feature. `GET /api/site-settings` and `GET /api/admin/site` both return:

```json
watermark: { "type":"text", "text":"letitrip.in", "size":10, "opacity":10,
             "position":"center", "offsetX":0, "offsetY":0, "imageUrl":"" }
```

**Every field this batch's five cases want to change is present in the data and editable
by nothing.** Root Cause #37's shape, on a settings panel.

> **Note for whoever fixes it**: the live values are `size: 10` / `opacity: 10`. On a
> percentage scale that is close to invisible — so a tester who looks at a product image,
> sees no watermark, and concludes the pipeline is broken would be wrong. The pipeline is
> fine; the numbers are tiny and unchangeable.

### The fallback chain and theme recolouring ARE working — established read-only

`effectiveWatermark` resolves to:

```json
{ "type":"image", "imageUrl":"/logo.svg", "size":10, "opacity":10, "position":"center",
  "offsetX":0, "offsetY":0,
  "themeGradientStops":["rgb(15, 118, 110)","rgb(20, 184, 166)","rgb(232, 121, 249)"] }
```

Three things follow, all without writing anything:

1. **Fallback tier 2 is reached correctly** — stored watermark is `type:"text"` with an
   empty `imageUrl`, and the effective one resolved to the bundled brand mark at
   `/logo.svg`. That is exactly the documented behaviour when no admin override is set —
   which is also the theme-recolour case's own stated precondition, so **I can confirm
   that precondition holds**.
2. **`themeGradientStops` is populated** with three real colours rather than absent or
   empty, so the mark is coloured from theme tokens rather than a hardcoded value.
3. Those stops are **teal / teal / fuchsia**, not the default light theme's cobalt-and-lime
   — so the active theme is already non-default and the recolouring has demonstrably
   happened at least once.

That is not the same as *watching* it change, so the theme case is recorded `null`, not
`yes`.

### Blocked, and why

- **Theme recolour** — needs a theme switch, i.e. a Site Settings write. `siteSettings` is
  one of the four things this harness must never modify: a preserved singleton holding
  live configuration and encrypted credentials. Changing it would alter production for
  every visitor.
- **Video overlay parity** — the video never mounted. Three gallery thumbnails; clicking
  the last one left **0 `<video>` elements and 0 iframes** after 5s (the 800×450 media item
  is the poster, not the video).

> **A note that should go into that case's steps.** There is no watermark element in the
> DOM on the *image* side either — I searched every element in `main` and found none. That
> is expected: the image mark is composited **server-side by sharp** inside `/api/media`,
> so it is burned into the bytes, while the video overlay is applied **client-side**. The
> comparison therefore cannot be made by reading the DOM on both sides — the image half
> needs eye or pixel inspection of the returned image.

### What this means for the other four cases

All of them begin *"open the watermark settings and change X"*. With no controls, three
are hard failures at step 2 and the remaining two are blocked for the reasons above. The
whole batch is one fix.

---

## Batch `buying/user-dashboard-extras--p1` — 2 yes, 3 no, 7 blocked

Recorded 192/226. Three real defects, one genuinely excellent surface, and a lot of
fixture gaps.

### 🛑 A173 — the order timeline is not on the order page, and stamps no actor

**Location.** The order *detail* page has **no timeline at all** — I read a Delivered and
a Refunded order and searched both for the words *timeline* and *history*: neither
appears. It lives on the separate `/user/orders/{id}/track` page. **A buyer who opens
their order does not see its history.**

**The events themselves are genuine**, which is worth recording as a known-fixed defect:

```
Order placed  03/09/2026, 06:00:02
Shipped       06/09/2026, 06:00:02
Delivered     09/09/2026, 06:00:02
Carrier Delhivery · Tracking number LIR-TRK-88213004
```

Three real transitions, three distinct timestamps from the record — not a fabricated or
evenly-spaced sequence.

**The failure: no entry carries an actor.** The case asks for each transition *"stamped
with who made it"* and not one of the three names anyone. A buyer cannot tell whether the
seller marked it shipped or a job did. `order-track-timeline-no-actor.png`

> **A good behaviour not to mistake for a bug**: the Refunded order reads
> `Order placed 09/08/2026 · Refunded —` with an **em-dash** where the date would be.
> That is the documented correct rendering for a step with no recorded timestamp rather
> than an invented one. It should stay.

### 🛑 A174 — every order shows `addr-yugi-home India` as the delivery address

Under **Delivery Address**, both orders render the address document's **raw id** followed
by the country — no street, no city, no state, no postcode. Two different orders, same
output, so it is systematic.

The buyer cannot read back where their order is going. Third instance of this family this
run, after cart items showing a product **slug** instead of a title (A165) and store
categories rendering `—` instead of a label (A157).
`order-refunded-payment-pending-raw-address.png`

### 🛑 A175 — a REFUNDED order shows a "Payment pending" panel asking the buyer to pay

Order `9-LUZWNG`, status chip **Refunded**, renders:

> *"Payment pending — Transfer the amount via UPI and upload your payment screenshot
> within 15 minutes, or the item returns to stock."* + a **Complete payment** button.

The Delivered order on the same template correctly reads *"Payment verified"*, so the
panel is gating on something that a refund does not clear.

### Confirmed working

- **`/user/offers` is the best-built surface in this batch**, and the only one this run
  has seen that explains itself in a sentence rather than leaving the reader to infer
  state from chips. Four statuses present (Accepted / Expired / Countered / Withdrawn),
  and every row carries the whole negotiation:
  `LISTED ₹1,799 · YOUR OFFER ₹1,450 · AGREED PRICE ₹1,450`, the seller's own words in
  quotes (*"Best I can do is ₹1,150."*), a plain-English explanation, and only the actions
  that status permits. `user-offers-rich-list.png`
- **No money churn in the timeline** — exactly three status entries plus carrier and
  tracking; no coupon, add-on, discount or fee lines. `pricingEntriesInTimeline: 0`.
- **No PII in the timeline** — zero emails and zero occurrences of the buyer's display
  name across both orders' track pages. `piiInTimeline: 0`.

### Declined — two PRESERVE-tier writes

- **addresses-crud** — `addresses` is preserved, and A166's residue is the evidence for
  why: two of this user's three saved addresses are already `QA Address …` leftovers from
  earlier runs. Read-only, I confirmed **exactly one** is flagged Default, so
  `defaultAddressCount: 1` holds.
- **settings-page** — writes to the signed-in user's own document. Its
  `unintendedFieldChanges` check is the collateral-damage test, and this run has already
  found that exact class twice on the admin side (a list endpoint omitting fields its
  editor then re-sent as wrong defaults). Worth running on a non-production project.

### Fixture gaps — three cases have nothing to test

| Case | State |
|---|---|
| `my-prize-draws` | zero entries — correct empty state, but **outcomes** (won/lost) are what the case is about and cannot be seen |
| `my-digital-codes` | zero codes — and note the **pool has no writer**, so this page is the visible end of a supply chain with no source. Seed the *pool* first, then a purchase |
| `order-auction-won-vs-bought-out` | no bought-out order identified among 25 to pair against a win |

`order-offer-shows-what-was-saved` is the cheapest of the remaining: the accepted offer on
`/user/offers` carries a **Checkout at Agreed Price** action that would produce exactly the
order the case needs.

---

## Batch `buying/user-dashboard-extras--p2` — 0 yes, 3 no, 0 blocked

Recorded 193/226. Three failures — and one of them **corrects an earlier finding of mine**.

### 🛑 A167 NARROWED — "Oldest First" is NOT broken everywhere

I recorded last batch that *"every Oldest First across the reviews feature is broken"*.
**That was too wide.** `/user/reviews?sort=createdAt` works perfectly: **16 rows, ascending
— 17 Jun, 22 Jun, 27 Jun, 2 Jul 2026 — no errors, no empty state.**

So the buyer's own review list sorts ascending correctly while `/api/reviews` 500s. The
defect is specific to the **public reviews query path**, not to the sort:

| Surface | `sort=createdAt` |
|---|---|
| `/user/reviews` | ✅ 16 rows ascending |
| `/api/reviews?productId=…` (product tab) | ❌ **HTTP 500** |
| `/reviews` site-wide index | ❌ empty |

A much tighter target for whoever fixes it.

### 🛑 A176 — `/user/returns` names no reason, opens nothing, and its Filters drawer is empty

Two returns list correctly — order id, date, `Return Requested`, item ×qty, total. Three
things the case asks for are absent:

1. **The reason.** `/reason/i` matches **nowhere** on the page. A buyer cannot see what
   they said when they raised the return.
2. **Any way to open one.** No View, no Open, no row link — the only action-shaped
   elements are sidebar nav items. Root Cause #56's dead-end shape, and `UserReturnsView`
   was on that list's unfixed nine.
3. **Status filters.** I clicked the toolbar's Filters button with a real click: the
   drawer contains **zero status chips and no Apply Filters** — one unlabelled control,
   its own close button.

The rest of the toolbar is complete and correct (`Search by order id…`, Sort with three
options, Grid/List), which makes the empty drawer read as unfinished rather than
deliberate. `user-returns-no-reason-no-detail.png`

### 🛑 A177 — `/user/reviews` renders no photos, no edit, and no seller response

The list itself is accurate — 16 rows with product, star row, `(N★)` and date — and the
**search is good**: `Dranzer` → 4 rows all Dranzer S, `zzzznope` → 0.

But:

- **Zero photos.** Non-avatar images on the page: **0**. `placeholderPhotos: 0` is
  satisfied only because nothing renders at all — which is not the pass the expectation
  wants. Review photos **do** render at full 800×800 on the public product page and the
  permalink, so the images exist and this surface just does not show them. Same as
  `/admin/reviews` (A163).
- **No edit affordance** on any row, so *"open one and check it can be edited"* has
  nothing to act on.
- **No seller response** anywhere — consistent with A154, where a seller's reply saves
  and is never shown to any buyer.

`user-reviews-oldest-works-no-photos.png`

### A178 — third instance of the wrong empty state

Searching `zzzznope` on `/user/reviews` renders **"You haven't written any reviews yet."**
to a buyer who has **20**. After A162 (sublisting categories) and A163 (`/admin/reviews`),
this is the **third** surface confusing *no matches* with *nothing exists*. It is now a
pattern worth one shared fix rather than three.

### Confirmed working

- **The standard toolbar is on both pages** and its search filters correctly on the one
  with data, verified with a real term **and** a nonsense control.
- **The sort dropdown is not inert** — `inertSortOptions: 0` on `/user/reviews`, and I
  exercised the option most likely to be broken rather than the safest one.

### Fixture note

Two of the four pages the search-and-sort case names — `/user/digital-codes` and
`/user/prize-draws` — are genuinely empty for this account, so their search boxes have
nothing to narrow and only `/user/reviews` was exercisable.

---

## Batch `admin/bug-hunter-rewards` — 0 yes, 2 no, 2 blocked

Recorded 194/226.

### 🛑 A160 WIDENED AGAIN — a THIRD `/api/admin/*` route ignores `q`

The tester-checklist catalogue's search does not filter. Typing the case title returned
25 unrelated rows; I re-tested with a plain ASCII term in case the **em-dash** in the
title was the culprit:

```
q=invoice  →  25 rows, only 2 containing "invoice", pager still 52 pages
GET /api/admin/tester-checklist-items?page=1&pageSize=25&sorts=order
    &filters=isActive==true&q=invoice   →  200, unfiltered
```

Identical page size and pager to the unfiltered view. The client sends `q` correctly;
the route drops it — after `/api/admin/categories` (A160) and `/api/admin/brands`
(A160-widened). **Three routes, one pattern**, and one fix.

### ✅ The default-filter disclosure here is CORRECT — and it is A163's counterexample

Worth describing because it is the *right* pattern, in the same admin, one page over:

| | `/admin/tester-checklist` | `/admin/reviews` (A163) |
|---|---|---|
| Default filter | `isActive==true` | `status==pending` |
| Filters button | **`Filters 1`** — visible count badge | no badge |
| Drawer state | Status **Active pressed**, Bug-status **All pressed** | **every chip unpressed** |
| Result | 52 pages of Active cases, explained | *"No reviews found"* against 79 real reviews, unexplained |

Switching Status to Inactive gives `?isActive=false` and returns **exactly one row** — the
bug-confirmed v1 fixture, absent from the default view. `defaultViewHidesBugConfirmed: true`.
`tester-checklist-inactive-bug-confirmed.png`

### A179 — the case's own expectation names the wrong tester

`confirm-bug-idempotent` expects the already-confirmed fixture to be credited to
**`Mock User 18`**. It is credited to **`Mock User 3`**:

> `Demo fixture — reported bug, already confirmed and reopened (v1, disabled) ·
>  🐛 found by Mock User 3 (v1) · Bug Confirmed`

A tester following the case literally would look for Mock User 18, not find it, and
reasonably conclude the credit had been **lost or overwritten** — a false positive on a
case whose entire subject is whether a credit moves when it should not. Fix the
expectation (or the seed) before running it.

### Blocked — and the reason generalises

Both write cases were declined for the same structural reason, which is worth stating
once: **`testerChecklistItems` is in none of the wipe's tiers, so it is PRESERVED by
default**, and A146 established the admin UI has **no edit and no delete** — the row
menu's single item, `Reopen as New Test Case`, is `disabled`.

So a confirmation or a reopen is **irreversible by hand and by reseed**. One run would
consume a fixture built for repeated use, leaving the next tester with nothing to test.

**Most of what those cases assert is already observable on the seeded pair**, because the
seed contains both halves of a completed reopen:

- **v1**: inactive, `Bug Confirmed`, credit retained (`🐛 found by Mock User 3 (v1)`),
  hidden from the default view → `originalStaysDisabled: true`, `originalKeepsCredit: true`
- **v2**: active and answerable

So the **data model supports everything the cases assert**; what is missing is the
admin's ability to perform the transition at all.

---

## Batch `selling/seller-ops-comms` — 0 yes, 2 no, 2 blocked

Recorded 195/226.

### 🛑 A180 — the seller's fulfillment queue shows 25 rows with only 6 distinguishable labels

Every row's primary label reads **`🧾 Order order-1-202609`** — the order id truncated
**mid-date** (the real form is `order-1-20260916-rhj4nf`). Counting across the page:

> **25 rows · 6 DISTINCT id strings**

`order-1-202609` and `order-1-202608` each appear several times. **A seller cannot tell
which row is which order**, let alone which product to pull off the shelf.

The case's step 3 asks whether the row names the **item** rather than only an order id.
It names **neither** — no product title appears on any row, even though `items[].productTitle`
is denormalised onto the order document precisely so lists need no extra fetch.

**And every row's second label is `Unknown buyer`.** All 25. That is the same defect
found earlier this run on the seller's **offers** list (A124) — where the notification and
the admin list both name the buyer correctly — so it is **not offer-specific**, and the
two together point at one shared adapter rather than two screens.

**What does work**, and it matters for the dead-end-listing check: rows are click-openable
(`cursor: pointer`) with a real action set — `Mark as shipped`, `View order details`,
`Open full page` — and the toolbar is complete (search, Filters, three view modes,
Active/Closed/All scope, page sizes). **The chrome is fine; the content is unreadable.**
`store-orders-truncated-ids-unknown-buyer.png`

### ✅ Root Cause #37's print-surface duplicate is FIXED, and cleanly

`/store/inventory/print` now returns **HTTP 404**. It used to exist as a degraded duplicate
of the print centre — same component rendered with a **null store**, so no store context
and no data.

**The removal was finished properly**: I searched the store dashboard for any anchor
pointing at it and found **zero**, with the only print-related nav link being
`/store/fulfillment`. No dead nav entry left behind — which is the usual failure mode of a
deletion like this.

The surviving surface is the good one: `/store/print-center` → `/store/fulfillment?tab=print`
renders **`Print Center — Beyblade Arena`** with the store's real inventory listed by
title, including sold and ended items correctly labelled.

> **The `seller-inventory-print` case should be RETIRED, not fixed.** Its literal claim is
> false and the comparison it asks for has one side gone — but two print surfaces *was*
> the defect, and one is the fix. `store-print-center-store-context.png`

### Blocked

- **`seller-addresses-crud`** — a store address is still a row in the **`addresses`**
  collection (discriminated by `ownerType`, not a separate collection), so it is PRESERVE
  tier and lands exactly where a buyer's delivery address does. A166's residue is the
  evidence. **Worth targeting on a non-production project**: this case names a
  **landmark** and asks for it back after a reload, and the admin address surface never
  renders a landmark at all — so it is the field most likely to be accepted and then
  silently dropped.
- **`seller-print-center`** — the page and its store context are confirmed, but I did not
  generate the printable output. That is the half the case protects: **a label missing its
  return address is useless in a way that is invisible until something is posted.**

---

## Batch `buying/user-dashboard-navigation` — 6 yes, 1 no, 1 blocked

Recorded 196/226. **The best-scoring batch of the run.** The user dashboard's navigation
is in genuinely good shape; one accessibility defect.

### 🛑 A181 — `aria-current` is pinned to `/user` on every dashboard page

Two signals, and they disagree. On `/user/support` the **visual** highlight correctly
marks Support — but `aria-current="page"` sits on **`/user`**, the dashboard home. I
checked a **second** page before recording it: on `/user/coupons`, `aria-current="page"`
is **again** on `/user`.

Two different sections, the same misplaced marker — it is pinned to the home rather than
tracking the route.

The consequence is specific: a sighted user sees the right item highlighted, and **a
screen-reader user is told on every page of the dashboard that they are on the dashboard
home**. `aria-current` is the only programmatic signal of location a non-visual user has,
so this is not a cosmetic duplicate of the styling — it is the accessible half being
wrong while the visible half is right, which is the combination least likely to be
noticed. `user-sidebar-logout-and-aria-current.png`

### Confirmed working — measured, not sampled

| Check | Evidence |
|---|---|
| **All links resolve** | **21 enumerated** sidebar destinations, **all HTTP 200**, zero 404s, **zero redirects**. Render-checked `/user/support`, `/user/coupons`, `/user/orders/view/{id}` — no error boundaries. `brokenLinks: 0` |
| **Mobile collapse** | At 390px: **exactly one** fixed bottom bar (`<nav class="fixed bottom-0 left-0 right-0 lg:hidden">`, 65px, 5 links), `--bottom-nav-height: calc(4rem + 0px)` **published**, on-screen `<aside>` count **0**, `scrollWidth === 390` so no overflow |
| **Deep-link direct load** | `/user/orders/view/order-1-20260818-stdctx` cold → full order content + 21 sidebar links |
| **Cross-nav** | Buyer with no store sees **exactly one** of the pair: `Become a Seller`, not `Go to my Store` |
| **Back button** | order detail → coupons → back → order detail with content **and** chrome intact |
| **Sidebar log out** | exists at the bottom of the dashboard sidebar and is reachable once the drawer is opened |

The bottom-nav measurements are worth keeping: **one** bar is the number that matters
(two would put two bars on the same pixels with a height nobody owns), and the published
`--bottom-nav-height` is the layout contract being honoured rather than every other
surface guessing.

### Breadcrumbs — absent by design, not broken

The case says *"where present"*, so the honest answer is that they are **not**. No
`Home / …` trail on `/user/support` or `/user/coupons`; nested pages use a single back
link instead (`← My Orders`). Reasonable for a two-level tree, and **not** recorded as a
defect.

> Breadcrumb accuracy *is* worth testing on this site — just not here. The public brand
> page reached from `/brands` breadcrumbs as **Categories** rather than **Brands**, which
> is A171.

### Two method notes

1. **A derived boolean disagreed with the rendered text, and the text was right.** My
   deep-link check computed `false` while the page plainly showed `ORDER #8-STDCTX … Delivered`
   — most likely a non-breaking space in the heading. **Record what the page says, not
   what your expression concluded.**
2. **Off-viewport is not absent — again.** Both log-out controls measured outside the
   1280px viewport with the drawer closed, identical to the admin trap earlier in this
   run. Opening `button[aria-label="Open dashboard navigation"]` brings it on screen at
   x=1089. `getBoundingClientRect` reports layout coordinates for parked elements; check
   whether a container is **closed** before calling a control unreachable.

---

## Batch `buying/user-dashboard-navigation--guest` — 0 yes, 1 no, 0 blocked

Recorded 197/226.

### ✅ The privacy half is clean — and I sampled rather than glanced

`/user`, `/user/orders` and `/user/addresses` signed out all land on `/auth/login` with
the sign-in form. **I watched each for 5–6 seconds in one-second samples** rather than
reading once, because these routes render a static shell and decide client-side — a flash
of real content is exactly what a single read would miss. Across every sample the path
stayed `/auth/login` and no email, name or order id ever appeared.

Then a **516 KB source scan**: **zero** personal emails, **zero** `Mock User N`, **zero**
uids, **zero** order ids, **zero** seeded address fragments. `userDataInSource: 0`.

### 🛑 A182 — the signed-out redirect drops the destination

The redirect lands on a **bare `/auth/login`** with **no `next` parameter**, from all
three routes. Nothing records where the visitor was trying to go, so the label's second
clause — *"then returns to the originally requested page after signing in"* — cannot
happen. A buyer following an emailed link to their own order is dropped on the login page
and has to find the order again by hand.

**The admin dashboard does this correctly**, which is what makes it a defect rather than a
design choice — verified earlier this run:

| Route | Redirect |
|---|---|
| `/admin` | `/auth/login?next=%2Fadmin` |
| `/admin/site` | `/auth/login?next=%2Fadmin%2Fsite` |
| `/user`, `/user/orders`, `/user/addresses` | `/auth/login` — **no `next`** |

Same codebase, same situation, two behaviours. `user-signed-out-redirect-no-next.png`

### Methodology — a PII sweep that includes your own domain finds your own email

My first source scan reported **13 hits**, which looked alarming. They were
`legal@letitrip.in`, `support@letitrip.in`, `privacy@letitrip.in` and
`conduct@letitrip.in` — the site's **own published contact addresses** in the footer,
caught because my domain pattern included `letitrip.in`. Re-scanning for personal domains
only (`gmail`, `mailnull`, `beybladearena`) returned **zero**.

Second time this run a PII regex has produced a confident false positive, after the SVG
path coordinate that looked like an Indian mobile number. **Locate every match before
reporting a count.**

---

## Batch `selling/seller-marketing-extras` — 0 yes, 2 no, 7 blocked

Recorded 198/226. Five of the seven blocked share one cause, and it is **not** a defect.

### 🛑 A124 QUANTIFIED, and it is not offer-specific

`/store/offers` lists 11 offers and the **money is right on every row**:
`Beyblade Original — Driger V · Offer: ₹1,450.00 · Listed: ₹1,799.00 · accepted · 3h ago`.
Four distinct statuses appear (accepted / expired / pending / countered), so states are
not being collapsed either.

**Every one of the 11 rows reads `Unknown buyer`.** A seller deciding whether to accept
₹1,450 against a ₹1,799 listing cannot see who is asking.

**The data exists** — the buyer's own view names the same offers, the seller's
notification names the buyer, the admin offer list names them. **And it is not
offer-specific**: `/store/orders` shows `Unknown buyer` on all **25** of its rows too
(A180). Two seller surfaces dropping the same field points at **one shared mapper**.
`store-offers-11-unknown-buyer.png`

### 🛑 A154 restated with its full evidence — a seller reply that no buyer can read

Viewing and replying both work, including the part that usually fails here: the reply
posted, the card flipped to `Store replied`, and **it survived a full reload** — worth
stating because the seller *listing* save on the same dashboard returns 200 and writes
nothing (A121). This write path genuinely persists.

Signed out on the product page, the reply is **absent from the raw HTML** (cache-busted,
9-second wait), and `/store repl|seller repl/i` matches **nothing across all 19 reviews**
on that product. So it is not *my* reply that is missing — **the public renderer has no
seller-response slot at all.**

### ✅ Root Cause #70 closed on the PUBLIC store page too

I had confirmed this on the admin store view earlier; this closes the other half.
`/stores/store-beyblade-arena`, **647 KB of source**, scanned for seven leak shapes:

| Pattern | Hits |
|---|---|
| Meta token (`EAA…`) | **0** |
| `enc:v1:` ciphertext | **0** |
| `accessToken":"…` | **0** |
| `wabaId` / `catalogId` | **0** |
| `adminNotes` / `suspensionReason` / `customCommissionRate` | **0** |

`tokenInPublicSource: 0`. That is precisely where the defect used to live — a raw store
document passed into a client component, publishing a decrypted WhatsApp token into the
page HTML. `public-store-no-token-leak.png`

### The five WhatsApp cases are blocked by a CORRECTLY BUILT capability gate

`/store/whatsapp` returns 200 and renders exactly one thing:

> *"WhatsApp catalog sync is not enabled for your store. Contact LetItRip support to
> request access to the WhatsApp Business integration."*

**Zero form fields, zero buttons.** That is the right way to gate a capability — it names
what is unavailable, says who to ask, and leaves no half-wired form to fill in and watch
fail. Recorded as blocked, **not** as failures. `store-whatsapp-capability-gate.png`

> If the integration is meant to be demonstrable in this environment, this is the store
> that needs the flag — it is the main seeded seller.

### Also noted

- **Google Reviews has no surface at all** — `/store` never mentions it, and
  `/store/settings`, `/store/integrations`, `/store/profile` are **all 404**. Its
  credentials are seeded **empty on purpose** so the integration skips rather than making
  a failed, billed Places call — so there is nothing to authenticate with either.
- **`/store/features` is well built**: `0 of 20 used`, the cap shown beside the count, one
  sentence explaining how custom badges relate to platform ones, and a coherent create
  form (Label*, Description, Icon*, Icon Colour). **I did not create one** — the list is
  empty so no row actions are visible, and this run has twice found seller taxonomy with
  no way back (store categories have no delete; the checklist's one row action is
  disabled). Residue on a live store is already accumulating elsewhere.

### A caution about the 404 probe

Fetching `/store/settings` and grepping the body for *"whatsapp"* returns **true** — on a
**404 page**. The not-found response still ships the full app shell, so a word-presence
test against it means nothing. Only the **status code** was load-bearing there.

---

## Batch `admin/category-brand-authoring` — 1 yes, 2 no, 5 blocked

Recorded 199/226. One new defect that **blocks three cases at once**, and a clean pass on
the derived-fields model.

### 🛑 A183 — the parent picker returns "No categories found" for a category that EXISTS

Worse than A160, and a different failure. Typing `Bonsai` (real keystrokes, 4-second wait)
into the Add Category form's **Parent category** picker renders **`No categories found`**
— offering `+ Create new Category` as the only way forward, which would duplicate a
category that already exists.

**The server returned the row.** `GET /api/admin/categories?page=1&pageSize=25&q=Bonsai`
answers **200, total 60, 25 rows** — unfiltered as always — and **`Bonsai` is among them,
at index 8**. So the route ignored the query *and then the client discarded the result*.

| | Seller-side pickers (A160) | This picker (A183) |
|---|---|---|
| Route honours `q` | no | no |
| Picker shows | **everything** — user can scroll to it | **nothing** |
| User's way out | pick the right option | create a **duplicate** |

**This blocks three cases**: creating a child under a parent, re-parenting a subtree, and
by extension anything needing a parent chosen.
`admin-parent-picker-no-categories-found.png`

### 🛑 A184 — the category editor neither shows nor sets the row's KIND

Four kinds of row share the `categories` collection — ordinary listing category, brand,
sub-listing group, pricing bundle — discriminated by an **optional** field that a plain
category **omits entirely**. That makes an explicit control *more* important, not less:
the absence of a value is itself meaningful.

The form has **no type or kind input** — its named fields are `name`, `slug`,
`description`, `parent` — and searching its text for *brand*, *sub-listing* and *bundle*
matches **nothing**. So an admin cannot author a brand, sub-listing or bundle here, and
cannot see which kind an existing row is while editing it.

### ✅ The derived-field model is exactly right

The editor exposes **four** inputs and no structural ones. I enumerated every named field
and checked for the eight this project forbids hand-writing — `tier`, `path`, `ancestors`,
`children`, `subtreeSize`, `position`, `isLeaf`, `rootId` — and found **zero**.

Depth comes from the parent alone, and the form **says so in words**: *"Leave empty to
create a root category."* The slug helper is right too — *"Auto-generated from the name
until you edit it. Used in URLs."*

### The ancestor READ path works; the CREATE path is the untested half

`/categories/category-spinning-tops` states **"15 products"** and renders cards from
*deeper* levels (`art-original-series-anniversary-print`,
`product-beyblade-metal-dark-bull-video-demo`), so root pages do aggregate their subtree.

**But every one of those products came from the seed**, which writes the chain by hand.
The case asks about a product created **through the form** — precisely the path where the
chain has historically gone missing, because the create schema strips an inbound chain and
a read-side backfill re-adds a single-element one on the way out. The product then looks
correctly categorised in **every screen that displays it** while being absent from the
stored value a **query** examines. `categoryPagesListingIt` not recorded.

### Five blocked — and two deliberately so

- **`brand-rename-orphan-check`** — the one write here whose failure mode is
  catalogue-wide. Brands match products by **display NAME**, so a rename silently detaches
  every product and recovery means retyping the exact old string. Confirmed read-only that
  brand rows *do* carry a stable `brand-` slug and `categoryType: "brand"` — so
  name-matching is a **live choice**, not a legacy artefact, and the case's premise holds.
  **Watch the product count on the brand page**, not the brand row, which looks fine
  either way.
- **`delete-category-with-children-refused`** — the most destructive operation on the
  screen; if the refusal is missing, the test *is* the damage. Worth knowing before
  someone runs it: **the row action menu on `/admin/categories` did not open on click**,
  so where deletion even lives is unestablished.
- `reparent-moves-whole-subtree`, `product-created-…`, `brand-cover-image-is-the-hero` —
  blocked by A183, by the create-path caveat above, and by budget respectively.

> **For the re-parent case when A183 is fixed**: its real subject is the *second* clause —
> that descendants stay **reachable**. Products carry their ancestor chain denormalised,
> so a re-parent must rewrite every descendant's chain. If that rewrite is missing, the
> category looks moved while its products quietly vanish from the new parent's page — a
> 200 and an empty grid.

---

## Batch `buying/return-request` — 1 yes, 0 no, 5 blocked

Recorded 200/226. **No defects.** One case passes on evidence I nearly got wrong, and one
fixture gap blocks the other five.

### ✅ The return window is a real server-side gate — and I nearly filed it as missing

No return affordance appears on any of the 25 orders in the list, nor on a **Delivered**
order's detail page — which offers only `Download Invoice` and `Track Shipment`, with the
word *return* absent from the order body entirely. **On its own that reads like a missing
feature.**

**It is not.** `/user/orders/{id}/return` exists, returns **200**, and renders:

> *"Return this order · Order #order-1-20260818-stdctx · **The 7-day return window for this
> order has closed.** · ← Back to order"*

So the window is checked **on the route itself**, not merely by omitting a button — the
difference between a gate and a hidden control, and it means a buyer holding an old link
cannot slip past it. The refusal also **names the rule and the reason in one sentence**.

**The absent button is correct here**: this account's four Delivered orders are dated
3 Sept / 18 Aug / 16 Aug / 1 Aug 2026, the most recent delivered `09/09/2026` per its own
timeline — all at or beyond the seven-day boundary. There is currently no order for which
the control *should* appear. `returnControlOnDeliveredOnly: true`.
`return-window-closed-gate.png`

> **Small inconsistency while someone is in there**: the page titles the order with its
> **raw document id** — `Order #order-1-20260818-stdctx` — where every other surface shows
> `#8-STDCTX`. Same raw-id family as A174 and A180.

### One fixture change would unblock four cases

Every delivered order is outside the window, so **no return form can be opened at all** —
the reason picker never renders. That blocks `not-received-on-final-sale`,
`change-of-mind-refused-by-name`, `partial-gates-selected-lines-only` and
`terms-snapshotted-at-purchase`.

**A delivered order dated within the last few days fixes all four.** It must be computed
**relative to run time**, not a fixed calendar date, or it goes stale the moment the seed
ages — the same reasoning this project already applies to auction end dates.

Two more fixtures are needed beyond that: a **mixed** order (one returnable + one
final-sale line — the delivered orders each hold a single item) and a **prize-draw** order
(`/user/prize-draws` reports *"You haven't entered any prize draws yet"*).

### The assertions worth keeping sharp when someone runs them

- **`not-received` on a final-sale order must be ACCEPTED.** A final-sale term governs
  whether a buyer may change their mind, not whether a seller may keep the money for
  something never delivered. A system that lets the flag block a non-delivery claim is not
  enforcing a policy, it is refusing a refund.
- **`change-of-mind` must not be OFFERED**, not merely rejected — and the panel must say
  why. Offering then rejecting wastes the buyer's time; omitting silently leaves them
  hunting. Both halves are required. The window gate's copy is the pattern to imitate.
- **A final-sale line must not BLOCK a returnable line** in the same order. The tempting
  implementation gates the whole order if *any* line is final sale — simpler, passes on a
  single-line order, and silently traps a returnable purchase behind an unrelated item.
- **`terms-snapshotted`** is **doubly** blocked: the seller listing save returns 200 and
  writes nothing (A121), so the policy edit is unattributable *even if* the window allowed
  the read-back. The principle is invisible in normal operation and only appears when a
  seller **tightens** a policy — at which point every past order silently inherits it.

---

## Batch `buying/return-request--admin` — 0 yes, 1 no

Recorded 201/226. One case, and it fails for a reason already on record — which is
the point of opening it.

### A185 — staff cannot see returns at all: `/admin/return-requests` crashes, and two real returns are sitting behind it

The case asks whether the reason a buyer picks is stored and **visible to staff**.
It cannot be, because the staff page does not render. `/admin/return-requests`
replaces itself with the error boundary:

> *"Something went wrong · An unexpected error occurred. Please try again. · Try again"*

Zero rows. The console names the cause, twice — once raw, once through the app's own
reporter tagged `[high][unknown]` with `component: ErrorView`:

```
TypeError: Cannot read properties of undefined (reading 'title')
```

**This is the live re-verification of one of A143's five findings, and the order
matters.** Earlier in this run I read that route and that exact message out of
`/admin/maintenance` — a report. Opening the page and watching the error boundary
replace it is the verification. Both now agree, so Rule #4 is satisfied and this can
be fixed without first re-proving it exists.

**There is data for it to render, so this is not an empty state.** The buyer account
holds **two** orders in `Return Requested` status — `1-T9MI9F` and `3-MH8B2X`. Those
are real customers waiting on real returns, and no member of staff can see that they
exist. `admin-return-requests-crashes.png`

### What I could not answer, and why that is separate from the crash

Whether the **reason** itself persists is **unanswered** — `notePersisted` is recorded
as `null` rather than guessed. Three independent paths to it are all closed:

1. **Staff side** — the page crashes (above).
2. **Buyer side** — `/user/returns` lists both returns and shows **no reason** at all
   (A176).
3. **Round trip** — a fresh return cannot be filed: every delivered order on this
   account is outside the seven-day window, and the return route refuses before any
   reason picker renders (previous batch).

So the reason is invisible on the buyer surface, invisible on the staff surface
because it crashes, and unverifiable by round trip. On a data-persistence question
that is exactly where a guessed `yes` does the most damage.

### The fix-pass note

A143's `/admin/return-requests` entry moves up: it is not a log line about a route
nobody visits, it is a **support queue with real work in it that staff are locked out
of**. The `(reading 'title')` shape suggests a row mapper reaching into a field that is
absent on these particular documents — the same family as A180/A124's shared mapper,
worth checking together.

---

## Batch `selling/seller-guide` — 0 yes, 1 no

Recorded 202/226. Two defects, and the second is the kind the case itself says matters
most: *"a guide describing a screen that has since changed is worse than no guide,
because the seller trusts it and then cannot find what it names."*

### A186 — `/seller-guide`, the index, is completely empty

It returns **200**, titles itself *"Seller Guide — LetItRip"*, renders the header and
the breadcrumb `Home / Seller guide`, and then a **blank white band** where the content
belongs — straight into the trust-badge strip and the footer.

`main.innerText.length` is **0**. No `h1`, no `h2`, no paragraph, no link.

**It is not slow hydration.** I waited 7s across two loads, and there are **zero console
errors** — the page is succeeding at rendering nothing, which is the signature of a
slot-shell mounted with no render props (Root Cause #8) rather than a failed fetch.

This is the **main** seller guide and it is reachable two ways: the footer's
`FOR SELLERS` column links it as *Seller Guide*, and the store sidebar has a whole
`GUIDES` group pointing at it. A seller who follows either lands on a blank page.
`seller-guide-overview-empty.png`

### A187 — the Bundles Guide's first instruction names a path that does not exist

Verbatim, step 1 of *Creating a Bundle*:

> *"Go to Store Dashboard → **Listings → Bundles** → New Bundle."*

The store sidebar's `LISTINGS` group holds **fifteen** entries — Products, Art,
Stickers, Auctions, Pre-Orders, Prize Draws, Classified, Digital Codes, Live Items,
Grouped Listings, Sub-listing Categories, Feature Badges, Listing Templates, Store
Categories — **and Bundles is not one of them.** A seller following the guide opens the
group it names, finds no Bundles entry, and stops.
`store-listings-group-no-bundles.png`

**The page is real and works.** `/store/bundles` returns 200, renders, and carries a
`+ New Bundle` button — so the guide's *terminology* is right and only the **route to
it** is missing. That makes this a missing nav entry, not a missing feature: Root Cause
#37, and the cheaper of the two possible fixes.

### What is genuinely fine

Both sub-guides render properly and are **distinct** — neither repeats the other, and
the prose is specific and good:

| Page | `h1` | Sections |
|---|---|---|
| `/seller-guide/bundles` | Bundles Guide | What are Bundles · Creating a Bundle · Stock Sync · Tips |
| `/seller-guide/prize-draws` | Prize Draws Guide | What are Prize Draws · Creating a Prize Draw · The Reveal Flow · Rules and Policies · Tips |

`brokenGuideLinks: 0` — but **that number flatters the feature rather than describing
it**. There are no broken links because there are **no links at all**, including none
back to the index.

### The case's own label is wrong

It promises *"the 5 seller guide pages"* and then names **six** (overview, capabilities,
finance, listings, orders, settings). **Three exist.** Every one of
`/seller-guide/{capabilities,finance,listings,orders,settings}` returns **404**. Worth
correcting the case while someone is fixing the pages.

### One claim I could not check — flag it for the fix pass

The prize-draw guide says:

> *"Upload your prize codes (CSV or one-per-line). Codes are encrypted and never shown
> until reveal."*

This seller has **no prize draws** (*"No prize-draw listings found"*), so no editor
could be opened to confirm the upload control exists, and creating one is blocked by the
seller listing save writing nothing (A121). **Re-check this specifically once A121 is
fixed** — an instruction telling a seller to upload something the UI cannot accept is
the same failure shape as A187, and Root Cause #103 is the precedent: a code pool with
readers and no writer.

---

## Batch `buying/order-status-lifecycle` — 5 yes, 5 no, 1 blocked

Recorded 203/226. The richest batch of the run: five real defects, and **three of them
are the same bug wearing different clothes.**

### A188 — the buyer's Cancel Order button fires nothing at all

The cancel page is right in every respect *except* the one that matters. It renders a
required *Reason for cancellation* textarea with a live counter, a `Cancel Order` button
and a `Keep Order` link. I typed the case's exact text and watched the counter move to
**46/500**, so the field's own state had the value.

Clicking `Cancel Order` produced **no network request of any kind** — the entire request
log after the click is GETs, with no POST, no PATCH, and not even a server-action post
back to the page URL. No error appeared, there is **no `role="alert"` node** on the page,
the button is not disabled, and nothing navigated. After a reload the order is still
**Pending** with no reason recorded.

**The button's own accessible name points at the cause.** Its visible label is
`Cancel Order`; its `aria-label` is **`Cancel Selected Items`** — and the page contains
**zero checkboxes**. It reads as a partial-cancellation control mounted on a whole-order
page: the handler asks which items were selected, gets none, and returns silently. That
also makes it an accessibility defect on its own, since a screen-reader user is told they
are cancelling a selection that does not exist. `cancel-order-button-dead.png`

### A189 — the seller's scope tabs at `/store/orders` do not filter

I selected **Closed**, confirmed the tab carried `aria-selected="true"` and the URL read
`?orderScope=closed&page=1`, then **hard-navigated to that URL** to rule out a stale
client render. It returns 25 rows:

| Under "Closed" | |
|---|---|
| **pending 1 · processing 6 · confirmed 3 · shipped 4 · return_requested 1** | **15 active orders** |
| cancelled 5 · delivered 4 · returned 1 | 10 genuinely closed |

`Active` and `All` return the **identical 25 rows** with the identical mix. Nothing is
being scoped.

**The Closed tab is worse than absent** — it asserts that fifteen orders needing work are
finished, in the seller's only view of their own queue.
`seller-orders-scope-tabs-inert.png`

### A190 — the seller's status picker is a static list, so a delivered order can be sent back to Confirmed

Proved by comparing two orders at opposite ends of the lifecycle. **Shipped** order
`order-1-20260806-481j4x` offers: *keep current, Confirmed, Processing, Shipped,
Delivered, Cancelled*. **Delivered** order `order-1-20260818-stdctx` offers the
**identical six**.

Confirmed and Processing move the order **backwards**. But the sharper problem is
`Cancelled`, because **the same platform refuses it to the other party in the same
transaction**: a buyer navigating to the cancel route on a shipped order is told, in
those words, *"This order cannot be cancelled because it is already shipped."* The seller
is offered Cancelled on that same shipped order, and on a delivered one.

Whatever the intended rule is, it is enforced against the buyer and not the seller.
`seller-status-options-static-delivered.png`

### A191 — the order timeline omits unreached steps instead of drawing them as upcoming

A pending order's whole timeline is **one dot** — *"Order placed 16/09/2026, 06:03:05"* —
followed by the chip *"No tracking details yet"*. Confirmed, Processing, Shipped and
Delivered are simply absent. A buyer who has just paid is shown what has happened and
nothing about what happens next. `timeline-no-upcoming-steps.png`

**The delivered order passes — for the wrong reason.** It shows no upcoming steps, but
not because the timeline knows the order is finished; it never draws anything ahead, and
delivered is the one state where that happens to be correct.

**Same root as an unreachable assertion in the sibling case**: the timeline is driven by
*which dates exist* rather than by the known lifecycle, so it cannot render a step with
no date — whether that step is ahead of the order or merely undated behind it. That is
why `status-timeline-real-dates` has no em-dash branch to inspect.

### A192 — the seller order save does not persist (and it is now three surfaces)

Chose **Confirmed** on a pending order with a real click, confirmed the picker had taken
the value, clicked **Save**. No error, no confirmation. Reload → **`pending`**.

I deliberately did **not** go on to check the buyer's side. With no change committed, a
buyer view still reading Pending would be indistinguishable from a buyer view that failed
to pick the change up, and those need opposite fixes.

**Three surfaces now share this shape** — seller listing edit (A121), buyer order cancel
(A188), seller order status (A192). A form that accepts input, reports nothing, and
writes nothing. Worth hunting one shared cause before writing three fixes.

### Smaller findings recorded against their cases

- **The seller list renders raw stored statuses** — `pending`, `processing`, …, and
  literally **`return_requested`** with the underscore. That is exactly the failure
  `all-statuses-render` describes, on the other side of the same order. The buyer's side
  is correct.
- **The buyer's status filter offers 7 of 9 statuses** — `Confirmed` and `Returned` are
  missing, and this account holds 3 Confirmed and 2 Returned orders. Orders that exist
  and cannot be filtered for (Root Cause #72's coverage shape).
- **The seller's order total reads ₹0.00** on both orders inspected, where the buyer sees
  ₹2,299.00 and a full payment summary for the same orders.
- **Some orders show the buyer a raw address document id** — order `6-481J4X` renders its
  Delivery Address as `addr-yugi-home`, while `6-RHJ4NF` renders a real address.
- **Raw order ids persist on every guard and track surface** — `Order #order-1-20260806-481j4x`
  on the cancel page, `Order order-1-20260818-stdctx` on the seller detail, and the
  breadcrumb *"Order 1 20260916 rhj4nf"*. Same family as A174/A180.

### What passed, and one near-miss worth recording

`active-closed-all-tabs` **reconciles exactly** — and I nearly recorded the opposite. My
first measurement read All 25, Active 15, Closed 16, i.e. 31 against 25. **The 25 was the
page size, not the total.** All carries a pager; Active and Closed do not. Page 2 holds 6
more rows, so 25 + 6 = **31** = 15 + 16, `ordersInNeitherTab: 0`, and the two status sets
partition the nine-value union cleanly.

`cancel-allowed-only-before-shipping` is **the pattern the rest of the app should copy**:
the control is absent past shipping *and* the route refuses independently, naming the
rule and the reason in one sentence. A buyer with an old link cannot slip past it.

`order-scope-filter-and-status-filter` passes on the decisive half — `status=delivered`
on the **Active** tab returns 5 delivered orders rather than the empty list two equalities
on one field would produce.

---

## Batch `buying/order-status-lifecycle--admin` — 0 yes, 1 no, 2 blocked

Recorded 204/226. One finding that **points at the writers rather than the reader**, and
two cases blocked by a missing control.

### A193 — the order-row builder works; five order-creation lanes never wrote what it reads

The three surfaces give three different answers and only the buyer's is right.

| Surface | Result |
|---|---|
| **Buyer** `/user/orders` | ✅ Item title + thumbnail + quantity per row, id de-emphasised. A multi-item order lists **both** items in full — more than the case asks for |
| **Seller** `/store/orders` | ❌ **No item at all.** `Order order-1-202609 · Unknown buyer · pending` beside a receipt emoji. The truncated id is the only thing identifying the row, and several rows render as the same visible string |
| **Admin** `/admin/orders` | ⚠️ **Mixed** — and the split is the finding |

On the admin list some rows are correct — `Beyblade Burst B-59 Regalia Genesis`, and one
reading `Beyblade Burst B-59 Regalia Genesis +1 more`, which is exactly the overflow
indication the case wants. Others fall back to the raw id with a receipt emoji:

```
Order order-1-20260822-aucwon
Order order-1-20260729-cash01
Order order-1-20260821-prizedr
Order order-1-20260820-buyout
Order order-1-20260819-preordr
```

**Read the suffixes.** `aucwon` · `cash` · `prizedr` · `buyout` · `preordr`. Every
fallback row is an order created by a **non-standard lane** — auction win, cash payment,
prize draw, buy-now, pre-order. Every row that names its item is an ordinary checkout
order.

So this is **not** a row builder that forgot to read fields already on the record (Root
Cause #52's shape). It is a set of **order-creation paths that never wrote the
denormalised title and image** the row builder expects. That moves the fix from one
mapper to five writers, and it explains why the same list looks correct and broken at
once. `admin-orders-mixed-item-vs-rawid.png`

Alongside it: `Unknown buyer` on **every** staff row (A124, now confirmed on a third
surface), a truncated id plus a bare `-` on every secondary line, and admin thumbnails
that render as empty dark circles rather than product images.

### A194 — the admin scope tabs are inert too

Same defect as A189, on the other staff surface. `/admin/orders?orderScope=closed`
returns pending 1, processing 6, confirmed 3, shipped 2, return_requested 1 — **13 active
orders under "Closed"** — alongside cancelled 6, delivered 4, returned 1, refunded 1.

**Both staff surfaces are inert; only the buyer's tabs work.** That is worth knowing
before anyone fixes one of them: the working implementation is the buyer's.

### A195 — there is no refund control anywhere on the admin order surfaces

The admin order detail for a delivered order renders only a Status picker, a Shipping
section, Cancel and Save changes, plus *"Payment Proof: No proof uploaded yet"*. The word
**refund does not occur anywhere on the page**. The row action menu offers exactly three
items — *View full details*, *Open full page*, *Update status*.

An admin cannot return money to a buyer through the UI.

### The two blocked cases, and why I did not take the available shortcut

**`refund-appears-in-timeline`** is blocked by A195. Order `order-1-20260809-luzwng` is
already in `refunded` status, so I could have read its timeline instead of issuing one —
and that would have been **the wrong test**. A *full* refund moves the order's status
field, so it appears through the ordinary status diff whether or not refunds are
contributed explicitly. The case is about the **partial** refund, which changes no tracked
field and therefore produces nothing at all from a plain before-and-after difference.
Passing the full-refund version would be a false green on precisely the distinction the
case exists to protect.

**`status-history-actor-recorded`** is blocked by A192 — the seller's save does not
persist, so step 2 cannot happen, and an admin-only entry cannot demonstrate that *two*
roles are attributed *differently*.

Worth recording from the timelines that do exist: **not one entry names an actor** —
every one is a step label and a timestamp. That sounds damning until you notice those
timelines are derived from the order's **scalar dates**, not from recorded history
entries, and a date has no actor. Answering `no` on that basis would blame the wrong
mechanism. The half I *can* confirm cleanly is the leak half: **no email address or
personal name appears in any timeline entry.**

---

## Batch `admin/uncovered-admin-pages--p1` — 8 yes, 2 no, 2 blocked

Recorded 205/226. The healthiest batch of the run — **eight of twelve pages work** — and
one of the passes materially narrows an earlier finding.

### A196 — every admin new-order alert prints raw ciphertext where the buyer's name goes

`/admin/admin-notifications` renders fine. The **message body** is the defect:

> 🛍️ New order! `enc:v1:IcDCk1u6SYeI735k:ViULfKfmBCvdE0M=:x0Urzrt3dWI72SUAAetWzQ==`
> purchased an item for ₹3,998. Order #order-2-20260727-t9mi9f

That is this codebase's own AES envelope format, so the notification was composed by
**interpolating an encrypted field without decrypting it**.

**I counted rather than sampled: 383 occurrences of `enc:v1:` against 383
`🛍️ New order!` messages.** Every single one. The alert cannot serve the purpose it
exists for — an admin cannot tell which customer placed the order.
`admin-notifications-ciphertext-names.png`

Secondary: the only per-row control is `Mark read`. There is no detail affordance and no
link to the referenced order, so the case's steps 4–6 have no control to use.

### A197 — the Action Index is a blank shell, and it is not indexing what its name suggests

`/admin/action-index` renders a toolbar, a table header (`Entry · Kind · Portal · Goes to
· Needs · Shown`) and help text, then **"No entries match."**

Not a stale filter: **no query string, no filter count badge, one `tbody` row** (the
empty-state one). With nothing filtered, it lists nothing.

Its own help text describes a **navigation** index — *"Hiding an entry removes it from
the sidebar, the header search and the command palette at once"* — not the CTA registry
the case names. And **the CTA registry has a working surface**: `/admin/settings/actions`
lists 41 actions with categories, auth requirements, permissions and a toggle each. So
the registry is fine; this page is the one that is empty.
`admin-action-index-no-entries.png`

### The pass that narrows an earlier finding — the admin product save DOES persist

`/admin/featured` round-tripped completely. Selecting a row reveals `1 selected ·
Remove from Featured`; applying it took the list 16 → 15, **and a hard reload still
showed 15** with the product gone. Opening that product's editor showed its `Featured`
checkbox unticked — so the write landed on the product document itself. I re-ticked it,
saved, and the list is back to **16** with the product present. **Original state
restored.**

**This matters beyond the case.** Three save paths in this run report success and write
nothing (A121, A188, A192), and it would have been easy to assume the defect was
universal. It is not — **the admin product editor saves correctly**, which narrows that
hunt considerably.

One genuine gap: the page can only take things *out*. Its `+ Add Product` button goes to
`/admin/products/new`, a create-a-new-product form, not a picker for featuring an
existing one.

### The "Unknown seller" mapper, pinned down

Every row on `/admin/stickers` reads **Unknown seller** — but the *same product*,
`Beyblade X Glow-in-the-Dark Sticker Pack`, renders as **Beyblade Arena** on
`/admin/deals` **and** on `/admin/featured`.

**The store is on the record and two other admin lists resolve it.** That narrows this to
the stickers row mapper rather than the product data — the same family as `Unknown buyer`
on every staff order surface (A124/A193).

### Observability pages: all three work, with one caveat worth stating

`/admin/maintenance/client-errors` is the standout. `200 of 200 (source=client)`, and I
verified the ordering across **all 200 rows** — strictly descending, `2026-09-16 06:33:22`
down to `2026-09-15 08:08:26`. The convincing part: **the top two rows were errors I had
caused myself seconds earlier**, on `/admin/maintenance/analysis` and
`/admin/admin-notifications`. Browser → beacon → store → UI, demonstrated end to end.

It also reports something loudly: **196 of the 200 entries are the same React #418
hydration mismatch**, drowning out everything else.

`function-errors` and `payment-rollbacks` both render explicit empty states
(*"No errors in the selected window."*) rather than blank areas — which is what the case
asks. **But a reader should not conclude the functions are healthy.** Zero looks
identical whether nothing failed or nothing writes to that source at all; an empty
observability surface is only reassuring once someone has confirmed the producer exists.

### Two abstentions, both deliberate

**`settings/actions`** — the page renders 41 actions with a toggle each, and I declined
to save. Its own warning reads *"Changes take effect immediately for all users."* This is
live production, and **the restore step cannot be relied on** when three save paths in
this same run write nothing. Disabling `Add to cart` with no working undo is not a trade
worth a small amount of information.

**`shipments/projections`** — renders *"No lots to project yet."*, and I traced why rather
than stopping there. `/admin/shipments` holds **four real shipments** (SH-2026-0001…0004),
but `SH-2026-0004` reads **`Lots (0/10)`** — the shipments were seeded and their **lots
were not**. The empty state is truthful; the feature is unfixtured. That also blocks the
case's most interesting assertion — *no figure inflated by a factor of a hundred* — which
is a currency-unit check with not a single figure to inspect. Run it the moment lot
fixtures exist.

---

## Batch `admin/uncovered-admin-pages--p2` — 1 yes, 1 no

Recorded 206/226.

### A198 — the Catalog guide documents 3 listing types; the system has 9

All twelve guide pages return **200** and all eleven sub-guides are linked from the index
(`guidePagesNotFound: 0`), so the mechanical half is clean. The index even opens with a
genuinely useful disclaimer: *"These guides describe expected platform behaviour. Real
access to each section is enforced independently by the permission system — this page is
reference only."*

**The content is what fails.** `/admin/guide/catalog` states, verbatim:

> *"Listing types: standard (prefix `product-`), auction (prefix `auction-`), pre-order
> (prefix `preorder-`)."*

**Three.** The live system has **nine** — and I did not take that from documentation. I
read **the admin product editor's own listing-type picker** earlier in this same session
and it offers *Standard · Auction · Pre-order · Prize Draw · Classified · Digital Code ·
Live Item*, while `/admin/stickers` lists five sticker listings and `/admin/deals` lists
art prints.

So an admin who reads this guide to learn what they can create **will not discover that
prize draws, classifieds, digital codes, live items, art or stickers exist at all**. Six
of nine types are invisible to the documentation.
`admin-guide-catalog-stale-3-types.png`

A second claim in the same guide — *"Category Taxonomy — 3-tier system: Root (tier 1) →
Subcategory (tier 2) → Leaf (tier 3)"*, echoed on the index as *"categories (3-tier
taxonomy)"* — is recorded with **less confidence**: I believe the tree is deeper, but I
did not find a cheap way to confirm the live depth in this batch. Treat the listing-type
finding as the evidenced one and check this alongside it.

The case's own reasoning is exactly right and worth repeating: *a guide has no compiler
behind it, so it rots silently* — and one that omits six listing types is worse than no
guide, because an admin trusts it and stops looking.

### The pass — `/admin/features` round-trips cleanly, delete included

10 platform features listed with their scope pairs. Created **QA Feature Probe** →
present after a **hard navigation**, `1m ago`, `platform — all`, Active → deleted →
gone, back to 10. **Nothing left behind.**

The delete showed a real confirmation dialog whose copy is honest about its own failure
mode rather than generic:

> *"Delete Feature — Delete this feature? It will fail if any product still references
> it. — Cancel / Delete"*

Two small things worth passing on, neither of which fails the case:

- **My first submit was correctly refused** — `Icon` is required and I had left it empty
  — and the summary appeared only *after* I pressed Create, not on first paint (Root
  Cause #74's fix working). But it reads **"Feature: Must be at least 1"**, and `Feature`
  is the *section* name; the field that failed was `Icon`. The admin is pointed at a step
  rather than an input, and "Must be at least 1" is a raw length constraint that reads
  like a numeric minimum on a text field.
- **The edit panel of the record I had just successfully created reports
  `Visibility — 1 issue`.** The create form accepted something the edit form considers
  incomplete — a create-versus-edit schema asymmetry (Root Cause #39's family).

---

## Batch `selling/store-dashboard-navigation` — 5 yes, 2 no, 1 blocked

Recorded 207/226. The store dashboard's navigation is in good shape — **38 routes, zero
broken** — and the two failures are both narrow and precise.

### A199 — the seller's product search is down, and the page tells them their catalogue is empty

`/store/products?q=Dranzer&sort=price&page=1` renders, verbatim:

> **"Product search is temporarily unavailable."**
> "No products listed yet"

The banner is honest — a failing search that says so is better than one that silently
returns everything. **The sentence underneath it is not.** *"No products listed yet"*
tells this seller they have no products at all, and they do: the same page without a
query listed *Beyblade X Glow-in-the-Dark Sticker Pack*, *Original Series 25th
Anniversary — Glossy Art Print*, *Beyblade X BX-08 Booster* and more, minutes earlier.

So a transient outage is reported as an empty catalogue, and **the two messages
contradict each other on the same screen**. Same family as A162/A163/A178 (a no-data
state shown for a no-matches result) but worse, because the banner directly above it
already says what actually happened. `store-search-unavailable-wrong-empty.png`

**The deep link itself is fine** — pasting `/store/products/{slug}/edit` cold opens the
editor populated on the right record, and the filtered URL restores both the search term
and the sort on first paint.

> **A correction to my own first reading**: I initially recorded the search box as empty.
> It was not — I had matched the sidebar's `Search navigation…` input instead of the
> listing's `Search by name, description, brand or tag…` box, which did carry `Dranzer`.

### A200 — `aria-current="page"` is set on two entries at once, on every `/store/*` page

The section highlight is **correct**: Products on `/store/products`, Orders on
`/store/orders`, and — importantly — Products stays highlighted on the nested
`/store/products/{slug}/edit`.

The defect is that **`Dashboard` → `/store` is marked current on all of them too**. On
`/store/orders`, `aria-current="page"` is on *Orders* (right), *Dashboard* → `/store`
(wrong) and *Store Dashboard* → `/store` (wrong). That shape — every `/store/*` path
matching the `/store` entry — is what a **prefix test rather than an exact match**
produces.

**It hides in plain sight**: the wrongly-marked entry lives inside the `OVERVIEW` group,
which is collapsed while you are in another section, so you rarely *see* two highlights.
It is in the accessibility tree on every page regardless, so a screen-reader user is told
the current page twice with two different answers.

### What works, including one I nearly filed as broken

**The sidebar is complete.** Enumerated group by group — it is an accordion, so only one
group's children are in the DOM at a time and a single scan undercounts. 38 routes, all
**200**: 1 overview · 14 listings · 4 orders/reviews · 4 finance · 8 store · 7 guides.
`brokenLinks: 0`.

**All nine listing types are present** — Products (standard), Art, Stickers, Auctions,
Pre-Orders, Prize Draws, Classified, Digital Codes, Live Items — and each resolves to
*that type's* filtered view (`Auctions → /store/products?listingType=auction`). The five
neighbours (Grouped Listings, Sub-listing Categories, Feature Badges, Listing Templates,
Store Categories) are management surfaces, not types, so the count isn't inflated.

**Bundles' absence here is correct** and should not be "fixed": a bundle is a category row
with a bundle discriminator, not a listing type. The real problem nearby is A187 — the
`/store/bundles` page exists and has no nav entry at all, while the Bundles Guide tells
sellers to reach it via *Listings → Bundles*.

**Mobile is a proper bottom sheet — and I almost filed the opposite.** My geometry probe
put the panel at `x=390` on a 390-wide viewport, entirely off-screen, and I was about to
report *"opening the menu dims the screen and shows nothing"*. **The screenshot disproved
it**: I had measured a different, closed panel (`#secondary-sidebar`, the account drawer),
not the Store Panel. The real sheet has a drag handle, a title, a search field and all six
groups, and it closes on navigation. One fixed bottom bar (65px),
`--bottom-nav-height: calc(4rem + 0px)`, `--bottom-chrome-height: 0px`, no horizontal
scroll. *One element's bounding box is not the feature's state.*

**Logout is thorough.** The sidebar's own `Log out` (distinct from the account drawer's)
redirects to `/auth/login`; returning to `/store` redirects again; and the **browser back
button lands on the login form, not a cached dashboard**.

### The one I declined to answer

`store-user-crossnav` is **not tested**, and I would rather say so than infer it. The
panel links `My Profile → /user/profile` and `Stores → /stores`, both 200 — but the case
asks for a round trip: click through to `/user`, confirm the **sidebar changes** to the
buyer portal, find the way back, and separately open the store's **public** page and
confirm it is the public view rather than the editor. None of that follows from a link
existing. Three navigations would settle it.

---

## Batch `selling/store-dashboard-navigation--guest` — 1 yes, 0 no

Recorded 208/226. **No defects.** The store dashboard's signed-out gate holds, and the
way it was verified matters more than the verdict.

### ✅ `storeDataShownToGuest: 0` — checked on the wire, not just on the screen

Browsing with a genuinely empty session (**0 cookies, 0 origins**), all three of `/store`,
`/store/products` and `/store/payouts` end on the sign-in page. Eleven DOM samples over
five seconds on `/store`: every one already `/auth/login`, `main` 132 characters, **no
spinner**, nothing matching a store name, seller identity, order or money figure at any
point. No flash, no hung loader.

Then I read the **response bodies**, because what renders is not the whole story — a
payload can carry data the page never paints. Across all three routes: **zero**
occurrences of the store slug `store-beyblade-arena`, zero of the seller's email, zero of
`Beyblade Arena`, zero order ids, zero product titles.

### The near-miss, and what actually settled it

My first scan flagged **`₹9`** and **`Payout`** as leaks. Reading the surrounding context
killed both — the `₹` hits are the footer's *"On orders above ₹999"* plus the site's own
fee and EMI thresholds, and `Payout` is the footer's *How Payouts Work* link and
component names in the RSC payload.

**The decisive test was not the regex but a comparison**: the set of `₹` amounts is
**byte-identical on all three routes**. A payouts page carrying real figures would differ
from the products page; identical means public configuration, not this seller's money.
That is a cheaper and far more reliable oracle than context-reading every hit, and worth
reusing for any "is this data leaking?" question.

### Two things worth knowing, neither of which is a leak

**The gate is not an HTTP redirect.** All three routes return **200** with a ~490KB
document that renders the Sign In form. The case's phrasing — *"redirected before any
store data is rendered"* — holds in effect, but the mechanism is render-level rather than
a 3xx, which is worth knowing before anyone tries to assert on a status code.

**The guest still receives the full store-dashboard component tree** in that payload:
component names (`SellerPayoutsView`, `SellerPayoutMethodsView`), every `/store/*` nav
entry with its label and description, and API base paths such as `/api/store/payouts` and
`/api/store/payout-settings`. That discloses the internal surface, not anyone's records —
a payload-size and disclosure observation, not a data leak.

Cosmetic: the breadcrumb renders `Payouts` with `aria-current="page"` above a login form.

---

## Batch `buying/user-uncovered-pages` — 1 yes, 2 no, 1 blocked

Recorded 209/226. One of the more consequential batches: a buyer **cannot correct or
remove a delivery address**, and their pre-orders page denies a pre-order they hold.

### A201 — addresses are create-only: Edit renders "Address not found.", Delete does nothing

**Create works.** `/user/addresses/add` redirects to `/new`, opens with the form already
rendered *including the landmark field*, and the PIN code `560001` auto-resolved the state
to **Karnataka** — a nice touch. Saving landed on the list and the entry survived a hard
reload: `QA PROBE / 221B Test Street / Bengaluru, Karnataka 560001 / 9876543210`.

**Edit fails.** Clicking Edit navigates to `/user/addresses/{id}/edit` and renders exactly
two words — **"Address not found."** — with zero fields, on an address that existed
seconds earlier and renders in full one click away.

**I did not stop at one row**, because a single failing record is a data problem while two
from different origins is a broken route. I opened Edit on the **seeded default**
`addr-yugi-home` — a slug id, written by the seed rather than by me — and it renders
**"Address not found."** too. Two rows, two id shapes, two origins, same result.
`user-address-edit-not-found.png`

**Delete does nothing.** No confirmation dialog, no error, no change; after a hard reload
the row is still there. `user-address-delete-does-nothing.png`

**The consequence is visible in the data itself.** The list also holds **two leftover
`QA ADDRESS BUYING-CHECKOUT-SHIPPING-ADDRESS-INLINE-ADD` rows** from earlier test runs. I
had read those as a previous tester's sloppy cleanup. They are not — **they are rows that
cannot be deleted.**

> 🛑 **My own residue, stated plainly**: the `QA Probe` address remains on the account.
> `addresses` is a **preserved** collection that the between-run wipe does not clean, so
> it will persist. I attempted the deletion the case asks for and the feature refused it.

### A202 — `/user/pre-orders` says "You haven't placed any pre-orders yet" to a buyer who has one

The page renders a toolbar and that empty state. It is not true: `order-1-20260819-preordr`
sits on the same account — **10 September 2026, Confirmed, "Beyblade X BX-08 Wave
(Pre-Order)" ×1, ₹799**. The id ends `-preordr` and the item names itself a pre-order.

Every later assertion in the case is therefore unreachable: no production status, no
expected delivery date, no link back to the listing, no deposit-versus-full-price
distinction — there is nothing listed to read them from. `user-preorder-order-exists.png`

**Three corroborations on that one order**, each matching a finding from elsewhere:

- Display id **`Order #-PREORDR`** — a dash with **nothing before it**. The item-count
  segment is missing, so this is not merely a raw id, it is a **broken** one.
- Delivery address renders as **`addr-yugi-home`** — the second order seen doing this.
- A payment panel reading *"…upload your payment screenshot **within 15 minutes**, or the
  item returns to stock"* — on an order placed **six days ago**. Same stale countdown
  already recorded against a *Refunded* order, now on a *Confirmed* one, which suggests
  the panel renders on payment status without consulting the deadline at all.

### A203 — three buyer forms accuse the user before they have typed anything

| Page | On first paint, nothing typed |
|---|---|
| `/user/support/new` | `What do you need help with? Required` + a red **`2 issues`** pill |
| `/user/addresses/new` | **`3 issues`** on *Address*, **`4 issues`** on *Where* |
| `/user/catalogue/new` | **`2 issues`**, plus **"Invalid value"** under the untouched Condition dropdown |

The catalogue one is the worst-worded: telling a user their untouched select holds an
*invalid value* implies data is present and wrong rather than simply absent.

**This is not universal in the codebase** — the admin Product Features form gets it right,
showing its summary only after Create is pressed. So these three are inconsistent with a
form that already does it correctly, which is where the fix should be copied from.

### The pass

`/user/support/new` satisfies both of its assertions: the form is **already open** when
reached directly by URL (Category defaulted to General, Subject, Description, Cancel,
Submit ticket, a `← All tickets` link and genuinely good guidance copy), and **Cancel
lands on `/user/support`** — the real ticket list with its own toolbar and a proper empty
state, not a dead route.

### The abstention

`/user/catalogue/new` is **half verified and I am not claiming the other half**. The form
opens already-open with Title, Description, Condition, Quantity, Value, Photos
(`+ Add Files (0/8)`), Visibility, Filing and `Add to Catalogue`. I did not fill, upload,
save, reload and delete — and persistence is the half that catches real defects, so
answering `yes` on the render alone would be a false pass on exactly the part that matters.
A second reason for caution: **delete is completely broken on the sibling addresses
surface in this same batch**, so a created item is not reliably removable.

---

## Batch `admin/bans-and-trust` — 2 yes, 0 no, 10 blocked

Recorded 210/226. **Ten abstentions, and they are a decision rather than a shortfall.**

### 🛑 Why I did not ban anyone

Six of these cases require applying a ban. Three facts make that the wrong action here:

1. **`users` is a PRESERVED collection** — the between-run wipe does not touch it, so a
   ban persists indefinitely rather than being cleaned up.
2. **It holds real people.** The list includes **Kavyansh** (`radhadanu61@gmail.com`),
   **King Of Tech** (`kingoftech332@gmail.com`) and **SAGAR R** alongside the seed
   personas. Any account I pick is either someone's real login or a persona every other
   batch depends on.
3. **The undo cannot be trusted.** This run has found **four** write paths that report
   success and change nothing — the seller listing save (A121), the buyer's cancel-order
   button (A188), the seller's order status save (A192) and address delete (A201). If
   unban behaves the same way, I would have permanently locked out an account with no
   working means of restoring it.

`unban-restores-access` is the sharpest version: **unban *is* the undo**, so testing it
requires first applying the ban whose reversal I cannot rely on. When the failure mode is
irreversible, performing the action is not a test — it is the incident.

**One fixture change makes all six runnable**: a dedicated disposable ban-target persona,
referenced by no other fixture and resettable wholesale.

### ✅ The session IP never leaves the server — stronger than masked

On screen, `/admin/sessions` shows no IP: the device line reads `Unknown · Unknown ·
Desktop · —`. That alone only proves the UI does not print it, so I read the payload,
which is where a masked-looking screen usually hides an unmasked value.

`GET /api/admin/sessions` returns `deviceInfo` with exactly four keys —
`userAgent, browser, os, device`. **There is no `ip` field.** Checked across **100**
sessions, not a sample: zero IP-shaped strings anywhere, identical key set on every row.
Not a display mask over data the browser holds — the field is never serialised, which is
the only implementation that survives someone opening devtools.

### ✅ The Disabled filter is genuinely applied — with a caveat I want on the record

The drawer offers `STATUS: All / Active / Disabled` and `ROLE: All / Admin / Seller /
Buyer / Moderator / Employee`. Applying **Disabled** produces `?page=1&status=Disabled`
and the list goes **50 → 0**, rendering *"No users found"*. An ignored filter returns
everyone, which is the failure three other admin lookups in this run exhibit.

**The caveat is exactly the trap this case exists to catch**: the URL carries the
**display label** `Disabled`, capital D, not a stored value. With zero disabled users,
*correctly empty* and *empty because the value never matches* produce the identical
screen. The confident claim is the narrower one — the filter changed the result set, so
it is wired and reaching the query.

### What the read-only checks turned up anyway

**The audit log works and is populated** — `store_status_change`, `offer_cancel` and a
real `user_role_change` on *SAGAR R*, each naming the acting admin and the target. Zero
ban entries, consistent with zero bans ever. Two observations: the actor renders as the
raw uid `user-admin-letitrip` rather than a display name, and **no entry visibly carries a
reason**, which is half of what `hard-ban-recorded-in-audit-log` asserts.

**The users list payload carries `disabled` but no `banType` and no `bannedAt`** — so a
soft ban and a hard ban would be **indistinguishable** in the list, and a temporary ban's
expiry invisible. That is a product decision someone should make deliberately rather than
discover while looking at a real banned account.

**A previously-reported gap is closed**: `isTester` and `canTestAdmin` *are* present in
the list payload now. An earlier finding recorded them as missing, which caused an editor
seeded from a list row to silently strip a tester's flags on save.

**A fixture gap worth one line of seed data**: every session in the system —
**100 of 100**, seeded ones included — carries `userAgent: "node"`, so browser and OS read
`Unknown` everywhere. I cannot tell a broken parser from a parser handed nothing to parse,
and neither could a human. One session with a real Chrome user-agent makes
`sessions-list-device-details` answerable at a glance.

---

## Batch `selling/final-sale-authoring` — 1 yes, 1 no, 1 blocked

Recorded 211/226. The **authoring surface is genuinely well built**; the save underneath
it throws the edit away.

### ✅ Final sale is the default on all four listing types — and the copy is the best in the app

Checked each creation form's Returns step without touching the control: **standard**
(`/store/products/new`), **auction**, **pre-order** and **classified**. In every one,
`Accept change-of-mind returns` carries **`aria-checked="false"`** — returns off, final
sale on — and every one offers a `Return policy (optional)` textarea.
`defaultFinalSale: true`. `final-sale-default-on-classified.png`

**The explanatory copy gets right the exact distinction the return-request batch flagged
as most likely to be got wrong:**

> *"This is a FINAL SALE — the default. Buyers cannot return it for changing their mind.
> They can still claim if the item never arrived, arrived damaged, was the wrong item, was
> not as described, or was counterfeit."*

A final-sale term governs whether a buyer may change their mind, not whether a seller may
keep the money for something never delivered — and this says so in the place a seller will
actually read it. The policy field's caveat is equally careful: *"This is your own wording;
it does not change what the platform allows above."*

**One structural note**, not a failure: the standard form opens on a **Quick add** step
that does not include the control — it lives behind *"Show all fields (advanced)"*. The
stored default is still final sale, so a Quick-add seller is protected; they are just
protected without ever being shown the term they are applying. Auction, pre-order and
classified have no Quick add step.

### A204 — the Returns edit is discarded (A121 re-verified on a named field)

The editor for *Beyblade Burst B-01 Valkyrie* loaded the right record with
`Accept change-of-mind returns` already **ON**. I flipped it **OFF**, confirmed the switch
read `aria-checked="false"`, pressed **`Update →`** — no error — and after a hard
navigation it reads **`true`** again. `final-sale-toggle-reverts-on-reload.png`

**The case's own reasoning is why this is unambiguous**, and it is the sharpest
methodological note in the checklist:

> *"Off is the only testable direction: a field that never saves reads back as its on
> default, so a case that only ever turns it ON passes against a completely broken save."*

This product already had returns ON, so had I followed the literal step of turning them
**on**, the broken save would have **looked like a pass**. Turning it the other way is
what makes the result mean anything.

**A note on the recorded data, because it misleads at a glance**: `finalSale: false`
matches `expectedData` exactly — and it matches **for the wrong reason**. The stored value
was already "returns accepted" and simply survived my edit being thrown away. A screen
that agrees with the expectation while the behaviour beneath it failed is the shape this
run keeps finding.

### The blocked one, and the half nobody has tested

`return-policy-authorable-by-seller` — **the field exists**, which is the new part: a
`returnPolicy` textarea on every creation form and on the editor, currently empty.

I did not type and save, because I had just proved **on this exact form, one step
earlier**, that a Returns change does not persist. Watching a policy come back empty would
add nothing, and it would leave a probe string on a real listing I could not then remove.

**The half that matters most is completely untested** — whether the seller's wording
actually **reaches the buyer** on the public listing page. The case states the stake
better than I can: *a policy that saves in the dashboard but never renders publicly is
worse than no field, because the seller believes they have disclosed something the buyer
never sees.* Run it the moment the seller save is repaired, and check the **public page in
a signed-out window**, not the editor.

---

## Batch `selling/final-sale-authoring--guest` — 0 yes, 1 no

Recorded 212/226.

### A205 — the final-sale term vanishes in the cart, and the page contradicts it there

**Two surfaces of three are exemplary.** The third — the one immediately before payment —
says nothing, and contradicts itself while doing so.

**On the card**, `/products` shows a `Final Sale` pill on all 21 final-sale listings. I
measured it rather than eyeballing: **white `rgb(255,255,255)` on `bg-zinc-900/90`**, a
near-black solid at 90% opacity. That is exactly the **solid pairing** the case asks for
rather than a pale tint, and because it is a fixed dark scrim rather than a
theme-inverting surface token it stays legible over whatever artwork sits behind it —
confirmed unchanged in dark mode. `final-sale-card-badge-light.png`

**On the detail page** it appears twice and better: a `⊘ Final Sale` chip in the spec row,
and a plain-language line — *"Final sale — no change-of-mind returns"*. That line is
properly **themed** rather than fixed: `rgb(180,83,9)` amber-700 in light inverting to
`rgb(251,191,36)` amber-400 in dark. Readable in both, which is the specific failure the
case warns about and this avoids. `final-sale-detail-dark.png`

**In the cart it vanishes.** I added the sticker pack as a guest and opened `/cart`: the
item is there at ₹229.00, and the string *final sale* appears **zero** times on the page.

**And the page actively contradicts it.** The footer trust strip on that same cart screen
reads **"Easy Returns — 7-day hassle-free returns"**, directly beneath a cart whose only
item is explicitly no-change-of-mind. A buyer reading that page would reasonably conclude
the opposite of the truth.

**That is worse than silence**: silence leaves them to check, a contradiction tells them
not to bother. And the term is one they cannot undo after paying — the case puts it
exactly right, *stating it only after purchase is too late*.
`final-sale-absent-in-cart.png`

### One more, from a family now confirmed on a public surface

The cart line reads **`SOLD BY UNKNOWN`**. This is the same mapper failure as
`Unknown buyer` on the staff order surfaces and `Unknown seller` on `/admin/stickers` —
but it is the **first time it has appeared on a buyer-facing public page** rather than an
internal one.

---

## Batch `selling/final-sale-authoring--admin` — 1 yes, 0 no

Recorded 213/226. **No defects**, and the way around the blocker is worth recording.

### ✅ The admin override is the same stored field — proved by inverting the test

Step 1 asks the **seller** to set the flag and save. That is impossible: A204 established one
batch earlier that the seller listing save discards the change. Rather than skip the case, I
inverted it — the real assertion is that an admin override reaches **the same field the
seller edits**, and that can be proved from the admin side, which *does* save.

| Step | Observed |
|---|---|
| Start | Seller editor **and** admin editor both show `Accept change-of-mind returns` = **true** — already evidence both read one value |
| Admin flips OFF, saves | Admin editor after a **hard reload** = **false**. The write landed |
| **Public page** | `/products/product-beyblade-burst-valkyrie` now carries the final-sale badge and *"no change-of-mind returns"* — **22** occurrences where the product previously accepted returns and showed none |
| **Seller editor** | Reopened as `tyson@beybladearena.in` → **false**, without the seller touching anything |

That last row is the case's **named failure condition** — *"a seller editor still reading on
is the failure"* — and it does not occur. Admin editor, seller editor and the buyer-facing
page all agree afterwards, and the buyer's view is the one that binds.
`final-sale-admin-override-same-field.png`

**Restored.** Flipped back ON as admin, saved, confirmed `true` by hard reload. The product
is in its original state.

### The third confirmation of the split that matters

This incidentally confirms, for the **third** time, that **the admin product editor saves
correctly while the seller's does not** — same field, same form family, two different
outcomes.

That makes the admin editor the **known-good reference** to diff the seller's save against,
which is the cheapest available lead on the silent-save family (A121, A188, A192, A201's
delete, A204).

---

## Batch `admin/bulk-actions` — 0 yes, 1 no, 9 blocked

Recorded 214/226. **One root cause blocks almost the whole batch.**

### A206 — row selection is inert on `/admin/products` and `/admin/offers`, so the bulk bar never appears

`/admin/products` renders 25 per-row checkboxes. Clicking the first with a real browser
click does not check it — no tick, no `1 selected`, no bulk bar.

**I did not accept that on one attempt**, because a failed click is usually my own
selector. I tried it **four ways**: two real Playwright clicks (by position and by the
element's id), a direct `element.click()`, and a dispatched bubbling `MouseEvent`. All four
left `checked === false`. The input is **neither disabled nor readOnly**, which rules out
the obvious explanations.

That is what a React **controlled** checkbox does when its `checked` prop never changes:
the DOM flips for an instant and the component resets it because the state handler never
updated.

**Confirmed on a second surface** rather than generalised from one page: `/admin/offers`
behaves identically — 11 checkboxes, a real click, still zero checked, no bar.
`admin-offers-selection-inert.png`

**The contrast is the useful part.** Earlier in this same run, on `/admin/featured`,
selecting a row **did** work — it produced `1 selected` with `Remove from Featured`, and I
completed the action and its undo. Same bulk-bar component, same admin listing family,
opposite outcome. **So the component is fine and these two lists' selection wiring is not.**

### What the blocked cases still tell us

Nine cases are unreachable without a selection. Three notes worth keeping for whoever runs
them once it works:

- **Confirmation behaviour is not uniform in this codebase**, so it cannot be assumed from
  one example. The admin Features delete shows a proper dialog that names its own failure
  mode (*"It will fail if any product still references it"*); the `/admin/featured` bulk
  action applied **immediately with no dialog at all**.
- **The one bulk action I did run reported nothing** — the list went 16 → 15 with no
  success message. So `bulk-action-reports-result` should be checked **per surface**, not
  once.
- **`bulk-no-dead-actions` points at `/admin/offers`, and that page has form**: an earlier
  finding in this project recorded a destructively-labelled bulk action there whose handler
  only called `clearSelection()` — it looked like it worked and did nothing. It was deleted
  rather than wired up. That is exactly the defect this case exists to catch.

And **`select-all-count-matches-page` is a `null` rather than a `no` on purpose**: there is
no select-all control on this list at all, and *"the control is missing"* and *"the control
is wrong"* are different findings with different fixes. I checked only the **list** view —
the toolbar offers grid and table modes too, and a header select-all is exactly the kind of
thing that exists in one and not the others.

### The one I declined

**`bulk-users-actions` — not attempted by choice**, separately from the selection problem.
`users` is **PRESERVE tier** and holds real accounts; a bulk mutation there is the same
irreversible-with-no-trustworthy-undo shape that made me decline to ban anyone, multiplied
by the selection size. Five write paths in this run report success and change nothing.

Its audit-log half is worth preserving too: the log demonstrably records **single**
privileged actions with actor and target, but whether a **bulk** action writes one entry
per affected user or a single lumped one is exactly what nobody checks until they need the
trail.

---

## Batch `selling/product-upload-details` — 1 yes, 1 no, 4 blocked

Recorded 215/226. **The size check works beautifully; the type check does not exist.**

### ✅ An oversize image is refused before any bytes leave the browser

I built a 12 MB PNG and selected it through the real file chooser. The field refused it
with:

> **"File size must be less than 10MB (current: 12.00MB)"**

That message does the two things such a message usually fails to do — it states **the
limit** *and* **the actual size**, so the seller knows what is wrong and by how much
without going to check the file.

**The half that matters is the network, and I checked it rather than assuming**: no
`/api/media/sign`, no upload POST anywhere in the log after selection — all GETs.
`signRequestsMade: 0`. The browser never asked for a signed URL, which is the whole point:
an oversize file that reaches the sign step has already cost a round trip and, on a slow
connection, a long upload that ends in a rejection. `upload-oversize-refused.png`

### A207 — an SVG is not refused; it is accepted and opens the crop editor

I selected `sample-vector.svg` through the real file chooser. No error appeared, and **my
first reading of the DOM was that the file had been silently dropped** — no alert beyond
the pre-existing "This field is required", no blob preview.

**That reading was wrong, and the screenshot corrected it.** A modal titled **"Crop Image"**
is open, **rendering the SVG's content** — the purple-and-yellow *TEST SVG* graphic — with
a zoom slider, a position readout, Reset, Cancel and a primary **Save Crop**. The file was
neither dropped nor refused: it went straight into the image editor and is **one click from
being saved as the product's main image**. `upload-svg-opens-cropper.png`

**How it gets through**: the field's hint says *"JPG PNG GIF WebP — max 10MB"*, but the
underlying input carries **`accept="image/*"`**, and `image/svg+xml` matches that pattern.
Nothing downstream rejects it either.

**This is not purely cosmetic.** SVG is an executable document format rather than a raster
image, which is presumably why the hint lists four raster types and omits it. The media
pipeline is documented as verifying magic bytes at finalize, so the upload may well be
stopped later — but the seller is not told that here, and a control offering to *Save Crop*
on a file the system intends to reject produces a confusing failure at the worst moment.

**The case's second half is unverified**: because the file was *accepted*, there was no
refusal to recover from, so *"the field still works immediately afterwards"* has no failure
state to test against. Re-run it once the type is actually rejected.

### The four blocked, and why

All four need a **published listing** — the crop must be read back from the stored image,
the gallery order from a re-opened editor, the main-vs-gallery collision from the saved
record, and the video from a player that actually renders. Publishing creates a real
product I could not reliably remove: **five write paths in this run report success and
change nothing, one of them a delete.**

Two structural notes from what I could see:

- **Quick add has one file input** — `accept="image/*"`, `multiple=false`. No gallery and
  no video panel at all; both live behind *"Show all fields (advanced)"* in the wizard's
  Media step.
- **The crop editor itself is real and functional** (zoom, position, Reset, Save Crop). So
  the *preview* half of `main-image-crop-applies` is clearly built — it is specifically the
  *upload* half, the half the case exists to check, that has no evidence either way.

---

## Batch `admin/content-deletes--p1` — 0 yes, 0 no, 12 blocked

Recorded 216/226. **All twelve declined**, and the reason is the same one that has governed
every destructive case in this run: these edit the **live production homepage**, and this
run has found **five write paths that report success and change nothing** — one of them a
delete. Where the undo cannot be trusted, performing the action is not a test.

### What I could establish read-only

`/admin/sections` renders clearly: every section with its position and state written out —
*Welcome — Order: 1 • Enabled — Active*, then Carousel, Trust indicators, Categories,
Products, Auctions, Pre orders, Featured bundles, Stores, Reviews, Events, Event raffles.
All **Enabled** and **Active**, so any change there is live for every visitor immediately.

The only action word on the page is **`Reorder`**, and there are **zero toggle switches** —
no Delete, no Disable, no Enable at list level. So `homepage-section-disable-vs-delete` is
recorded as **not tested rather than failed**: *"the controls live one level deeper"* and
*"the controls are confusable"* are different findings, and I have evidence only for the
first. `admin-sections-list.png`

### 🛑 The carousel cases are actively dangerous, not merely irreversible

A145 established earlier in this run that the carousel editor **opens with an empty name
and `status: draft`** against a record that is really `Homepage Hero` and **active**. I did
not press Save then and did not now: saving that form writes the empty draft state over a
live slide and **takes the homepage hero down**.

`carousel-slide-edit-persists` cannot be tested at all until that is fixed — its very first
step already loads the wrong values, so anything typed would be saved alongside them.

### The ordering the next run should use

1. **`blog-edit-persists`** — the most tractable of the twelve and the right place to start:
   a blog post is a single public URL rather than a shared front-page band, `blogPosts` is
   seed-owned and restored by the wipe, and the check is a plain edit → save → reload →
   compare. **If it persists it also gives a second known-good write path** to diff the
   broken seller save against.
2. **`listing-delete-with-orders-refused-or-archived`** — the **safest destructive case in
   the batch**, because its expected outcome is a *refusal*: if the system behaves, nothing
   is destroyed. That is also why it should go early. If the refusal is missing, **the test
   IS the damage** — a hard delete orphans real orders, and every surface reading the
   product through the order starts rendering around a hole.
3. **`homepage-section-reorder`** — the most reversible of the four section cases, and the
   one to run in a maintenance window.

### Assertions worth preserving from the ones I could not run

- **`blog-delete-removes-public-page`** names its own failure mode: the page must return a
  **404, not a blank article**. Those have different causes — a 404 means the route
  correctly found nothing; a blank article means a shell rendered around a missing record.
  A tester who only checks "it left the list" misses it entirely.
- **`carousel-active-limit-enforced`** guards a *silent* failure: extra activations accepted
  and then quietly ignored downstream, so the admin believes six slides are live and sees
  five. Invisible from the admin screen by definition.
- **`homepage-section-delete`**'s ordering half matters because positions are explicit
  integers (`Order: 1`…`12`) — a delete that removes the row without renumbering leaves a
  gap; one that renumbers carelessly reshuffles the page.
- **`listing-delete-removes-public-page`**'s second half is the work: a product can appear
  in a category page, a brand page, a store page, a related-items carousel and the homepage
  at once, and a delete that clears the detail route while leaving stale cards behind
  survives a casual check.

---

## Batch `admin/content-deletes--p2` — 0 yes, 1 no, 1 blocked

Recorded 217/226.

### A208 — the one delete confirmation seen in this entire run does not name the record

On the admin **Product Features** editor earlier in this session I deleted a feature I had
just created. The dialog read, in full:

> **"Delete Feature — Delete this feature? It will fail if any product still references it.
> — Cancel / Delete"**

That is a **good** dialog in one respect and the failing one in another. It is honest about
its own failure mode, which is more than most confirmations manage. But it says **"this
feature"**, not *"QA Feature Probe"* — exactly the generic prompt the case names. The
case's reasoning is right and worth keeping: *the most common delete mistake is the right
action on the wrong row, and only the name catches it.*

**Two of the four named surfaces offer no row delete at all**, which is why coverage is
partial and I want that stated rather than implied:

| Surface | Row actions |
|---|---|
| `/admin/products` | **Approve · Reject · Quick edit** — no Delete |
| `/admin/blog` | **no row action menus at all** — zero action/menu-labelled buttons in the list |
| `/admin/carousel`, `/admin/categories` | not reached |

So the verdict rests on a **real, quoted instance** rather than on an absence — and that
instance is from a fourth surface the case does not list. Someone should still read the
carousel and categories dialogs; one generic prompt does not prove the others are generic
too, but it does establish that at least one is, which is what the case asks to record.
`admin-blog-no-row-actions.png`

### The blocked one is **safe to run** — say so plainly

`delete-reflected-immediately` was not reached, and it should not be mistaken for another
declined destructive case. **It creates its own subject** (*QA Delete Refresh Probe* at 199)
and then removes it, so nothing pre-existing is at risk; products are seed-owned and
restored by the wipe; and the admin product editor is one of the two write paths this run
has **proven** to save correctly. **Run it early.**

Two things the case sets up well:

- The failure it names is specific — a row that disappears and then **returns** a moment
  later, because a cached copy re-hydrated over the deletion. *The delete did happen; the
  screen contradicts it.* That is why it asks for **three** reads (immediately, after ten
  seconds, after a reload), and the ten-second read is the one that catches it.
- The **second-tab** step matters from the other side: a second tab holding its own cache
  is where a stale row survives longest.

And if the delete turns out **not to persist at all**, that is a larger finding than the one
this case is hunting — it would join the five write paths already reporting success and
changing nothing, and on this surface it would mean **admin deletes are cosmetic**.

---

## Batch `selling/quick-add-minimum-details` — 2 yes, 0 no, 4 blocked

Recorded 218/226. **No defects.** The short-form design is sound where it can be checked
without publishing.

### ✅ The short form is the default, and it is exactly six fields

`/store/products/new` opens on a step headed *"Quick add — fill the essentials and publish.
You can add more details later."* with **Product Name\*, Category, Price (₹)\*, Product
Image \*, Description, Stock Quantity** — six, matching the expected count. Three carry a
required asterisk, three do not, which is a sensible minimum for a buyable listing.

**The full form is genuinely one click away**: `Show all fields (advanced)` sits directly
beneath Publish / Save Draft and expands into the wizard (Media, Shipping, Returns,
Publish). Not hidden behind a setting or a different route.

The intro copy deserves credit too — *"you can add more details later"* tells a seller the
decision is not final, which is what makes a short form feel safe rather than like a trap.

### ✅ All four values survive the flip — and I nearly filed the opposite

Typed four values into the quick form, pressed `Show all fields (advanced)`, read them back.
**My first probe reported three of four**, with `description` missing — which would have
been a clean-looking finding, since a long description dropped on the way into the advanced
form is exactly what makes a seller retype work.

**It was my probe that was wrong.** Reading the textarea directly shows the description
intact in full. The first check had searched the page's rendered `innerText`, and **a
textarea's value is not part of `innerText`** — the text was in the field and absent from
the string I searched. `valuesPreserved: 4`.
`quick-add-advanced-flip-keeps-values.png`

> That is the **third** near-miss of this shape in the session. When a probe says a value is
> missing, confirm against the element that holds it before concluding the application lost
> it.

### The four blocked — all on one dependency

Each needs a **published, live listing**, and no reliable self-service removal exists in
this run. Two are worth running early once someone can clean up after them:

- **`publish-with-the-minimum`** is the only case that proves the short form is a *real
  path* rather than a demo. A six-field form producing a listing that is not actually
  **buyable** — no price on the card, no add-to-cart, invisible in the catalogue — would
  look completely correct in the editor and fail the moment a buyer arrived. The assertion
  is not *"did it save"* but *"can a signed-out visitor find it and add it to a cart"*.
- **`description-requirement-is-honest`** is **half-answered, and the half I have points the
  right way**: on the quick form, Name, Price and Image carry asterisks and **Description
  does not** — the form promises it is optional. Whether the save agrees is untested. Both
  directions of disagreement are bad: a field marked optional that the save rejects wastes
  the seller's time, and a field marked required that the save accepts empty trains sellers
  to ignore asterisks.

Also noted: **Condition is not on the quick form at all** — it is in the advanced wizard —
and a related instance is already on record from this run, where the admin catalogue form
shows *"Invalid value"* beneath an **untouched** Condition dropdown on first paint. That
suggests the option set and the validator disagree before anything is even chosen.

---

## Batch `admin/firebase-function-effects--p1` — 1 yes, 1 no, 10 blocked

Recorded 219/226. Most of this batch asks about **scheduled-function side effects** that
cannot be triggered from a browser inside one session — but two were answerable, and one of
them is new.

### A209 — the admin dashboard shows Pending Orders twice, with two different answers

`/admin` renders a **Stats** strip reading `Pending Orders 0 · Pending Payouts 2 · Pending
Reviews 0 · Active Coupons 11`, and immediately below it a tile grid reading
`TOTAL ORDERS 54 · TOTAL REVENUE ₹31,586.00 · TOTAL USERS 67 · TOTAL PRODUCTS 70 ·
**PENDING ORDERS 1** · PENDING REVIEWS 0`.

**Same page, same metric, same moment — `0` in the strip and `1` in the tile.** One is
wrong and a reader has no way to tell which.

On a dashboard whose whole job is to be glanced at, a metric that disagrees with itself is
worse than one that is merely stale: a stale number at least tells a consistent story. It
also undermines its neighbours — having seen one pair disagree, an admin has no reason to
trust that `TOTAL ORDERS` and `TOTAL REVENUE` came from the same source as each other.
`admin-dashboard-pending-orders-disagree.png`

**The revenue figure itself is fine**: ₹31,586 across 54 orders is ~₹585 each — the right
order of magnitude, and neither zero nor inflated by a factor of a hundred, which are the
two failure modes worth checking on a money rollup.

**Being honest about the case's other half**: whether the page reads a single pre-computed
rollup rather than scanning every order is not observable from the browser. It renders
fast, which is *consistent* with a rollup but does not prove one. The `no` rests on the
contradiction, which is unambiguous — not on the read pattern, which I did not measure.

### ✅ The function-errors page is a known gap, not a clean bill of health

The case's claim is exactly right, and I reached the same conclusion **independently**
earlier in this run before reading it: `/admin/maintenance/function-errors` renders
`0 of 0 (source=function)` and *"No errors in the selected window."*, and I noted at the
time that a reader should **not** conclude the functions are healthy, because zero looks
identical whether nothing failed or nothing writes to that source at all.

The page is well built and honest about what it holds. **It cannot be honest about what
never arrives.** Until the producer is confirmed, read it as *"no data path"*, not *"no
errors"* — anyone using it to sign off a deploy is reading a blank instrument.

### Two blocked cases where I already have circumstantial evidence

- **`payment-window-timeout-effect`** — a pre-order placed **10 September** (Confirmed)
  still renders *"…upload your payment screenshot **within 15 minutes**…"* **six days
  later**, neither resolved nor showing an expired state. That is the shape the case hunts.
  I recorded `null` rather than a failure because the buyer's view cannot distinguish *"the
  sweep never ran"* from *"the sweep ran and the panel is stale"* — and those need different
  fixes.
- **`order-create-trigger-effect-staff-signal`** — the signal **does** exist:
  `/admin/admin-notifications` holds **383** *"New order placed"* entries, so the trigger
  fires and produces something staff-visible rather than only a table row. **But it is
  unusable as delivered** — all 383 render the buyer's name as raw `enc:v1:…` ciphertext.
  An admin learns an order happened and cannot tell who placed it.

### The rest, and why they resist a browser

Four need **scheduled functions to fire** (auction settlement, offer expiry, product-write
triggers). Three need **surfaces the product does not render** — the Firebase console's
per-function invocation counts, the deployed HTTPS endpoints, and the RTDB nodes. One
(`media-tmp-cleanup`) needs the storage `tmp/` prefix, which the admin media page does not
show.

Three assertions worth preserving from them:

- **A 401 from an unauthenticated HTTPS function is *healthy*** — it proves the module
  loaded and the auth gate ran. A **500** means it failed before reaching its own logic.
  Both read as "broken" to a casual glance, and the difference is the entire signal.
- **The offer-expiry case's second half is the expensive one**: a lapsed offer must not
  leave a **locked line** in the cart. The offer lane outranks the ordinary one, so a
  leftover line does not clutter the cart — it **blocks checkout entirely**.
- **`counters-reconcile`** should check **ancestor** categories separately from leaves. A
  known past defect in this project overwrote ancestor rollups nightly while leaves looked
  correct, so spot-checking one leaf would miss it precisely.

---

## Batch `admin/firebase-function-effects--p2` — 0 yes, 0 no, 2 blocked

Recorded 220/226. Both blocked, and **the reason the first one is blocked is itself worth
acting on**.

### A210 — the no-op guard cannot be verified from the product, because its oracle is never rendered

Step 3 asks me to note the shipment's computed totals and *"the timestamp showing when
those totals were last computed"*, then Save unchanged and watch whether it moves.

**There is no such timestamp on the page.** `SH-2026-0004`'s editor shows Shipment number,
Supplier, Origin country, Status, Notes, a **Landed cost** block (Customs total, Shipping
total, Labour hours, Labour rate), a **Tracking & dates** block, Save changes, Lots and
History. No computed-totals block, no computed-at stamp.

The only time on screen is a relative **`2d ago`** on the list row — an ordinary
last-updated stamp that would move on *any* save, including a legitimate one. It cannot
distinguish a recomputation from a plain write, so using it would answer a different
question confidently. `shipment-no-computed-at-shown.png`

**And there is nothing to recompute on this record**: it reads `Lots (0/10) — No lots yet.`
Totals derive from lots, so a working guard and a broken one would both produce no visible
change. Any result would be uninformative in both directions.

**Why this is worth recording rather than abstaining quietly.** This case exists because a
trigger once watched the collection it wrote back to, with a no-op comparison that could
never return true — **over a million invocations in a day**, which then blocked deploys and
degraded production. The guard has since been repaired.

But the product surfaces **no way to confirm it is still holding**. The one field that
would show it is not displayed, so a regression would be invisible from the UI and would
announce itself exactly as it did last time: **as a billing page.** Rendering that timestamp
on the shipment editor turns this from an untestable case into a ten-second check.

To run it as written, someone needs a shipment **with lots**, and either that timestamp
surfaced or a direct read of the document.

### The other one is a calendar task, not a harness task

`scheduled-job-count-matches-registry` compares the **GCP Cloud Scheduler** job list against
the **Firebase Functions** list. Neither is a surface this application renders, and the case
says so itself: *"nothing in the product reports either."*

Worth keeping as a human check, because **both failure directions are silent and cost
different things**:

- A Scheduler job with **no matching function** is *billed* — Scheduler charges per
  registered job, not per invocation — so it is money spent on something that cannot run.
- A scheduled function with **no job** simply **never fires**, and nothing reports it. The
  function exists in the codebase, reviews clean, and its work silently does not happen.

The second is the more dangerous, because every other signal says the feature is present.

---

## Batch `selling/media-limits` — 2 yes, 0 no, 4 blocked

Recorded 221/226. **No defects.** The gallery's design is sound where it can be read
without performing ten uploads.

### ✅ One gallery takes both, with a live per-type count

The Media step heads the section **"Gallery (up to 10 images + 1 video)"** and shows two
readouts at once: a combined **`+ Add Files (0/11)`** and a split
**`0/10 images · 0/1 video`**. A seller sees not just how much room is left but how much of
it is *image* room and how much is *video* room — the distinction that matters when the two
caps differ.

The control is genuinely one input rather than two dressed as one: `accept="image/*,video/*"`
with `multiple=true`.

**The copy does real work too.** *"Show multiple angles, grading details, or box contents. A
video can go here too."* tells a seller what to put there rather than what is permitted. And
the separate **"Video options — YouTube, external URL, trim and poster"** panel explains its
own reason for existing: *"The gallery above accepts a video file directly. Use this panel
for a YouTube or external URL, or to trim and pick a poster frame."* That is the sentence
that stops someone hunting for a second uploader.

Worth knowing though the case does not ask: external video links carry *"queued for
moderation and become visible to buyers after admin approval"* — so a YouTube URL is not
immediately live, and the form says so up front rather than letting the seller find out from
a buyer.

### ✅ The caps are flat across types — byte-identical, no per-type table

I read the Media step on `/store/auctions/new` and `/store/pre-orders/new` and compared the
three strings each renders. **Identical, character for character** — heading, `+ Add Files
(0/11)`, and `0/10 images · 0/1 video`. `media-gallery-caps-preorder.png`

**That is the right shape**: a per-type media table looks harmless when written and then
drifts — one type gets raised to 12, another keeps 10, and a seller who learned the rule on
auctions is refused on pre-orders with no explanation. A flat cap cannot drift because there
is only one of it.

**Scope stated rather than implied**: I checked the two types the case names. Classified,
digital-code, live, art and sticker were not opened. If someone wants certainty across the
whole union, those five are quick — open each Media step and compare the same three strings.

### The four blocked, and the assertion each protects

All need either ten sequential uploads or a live publish. Three are worth preserving
precisely:

- **`media-eleventh-image-refused-client-side`** asks for `uploadRequestsForEleventh: 0` —
  the refusal must happen in the **form**, before any signed-URL request leaves the browser.
  *"An error appeared"* is not the same check: a server-side refusal produces an error too,
  and from the seller's chair they look identical while costing very different things.
  **The good news is this app already proves it can do this** — the 12 MB file earlier in
  this run was refused with zero `/api/media/sign` calls. The size limit follows the
  discipline; this case asks whether the count limit does.
- **`media-second-video-refused-first-kept`** — the second half is the one that comes apart.
  A refusal implemented by clearing the field and re-validating would refuse the second video
  **and silently drop the first**, leaving the seller with no video and an error about the one
  they just added. Checking only "was the second refused" passes against exactly that. **Read
  the counter afterwards: it must still say `1/1 video`, not `0/1`.**
- **`media-live-listing-still-requires-video`** — not an arbitrary rule. A live listing is an
  animal or a plant, and a video is the only practical way a buyer can judge the condition of
  something alive before paying. A still can be months old and cannot show the animal is
  moving and alert. A publish that slips through without one lets somebody sell a living thing
  sight-unseen.

---

## Batch `selling/listing-type-fields-roundtrip` — 0 yes, 0 no, 5 blocked

Recorded 222/226. **All five blocked on one dependency** — four are save round-trips, and
the seller listing save was established in this run to accept input, report nothing and
write nothing (A204).

**Running them anyway would have produced five guaranteed failures that say nothing about
the per-type fields.** The values would come back unchanged because the edit never landed,
not because the round-trip is broken — re-finding a known bug while burying five unknown
ones underneath it.

### What I did confirm

The edit form **opens populated**. `/store/products/classified-beyblade-burst-parts-mumbai/edit`
loads the right record — title reads *"Spare Burst Parts Bundle — Mumbai, Ships Too"* — and
the per-type classified section is genuinely rendered: **Meetup**, **Locality**, **Contact
Method** and **negotiable** appear as labels, with **Mumbai** present as a value.
`classified-editor-populated.png`

**But I recorded it `null`, not a pass.** A name-based probe for `city`, `locality`,
`pincode`, `contactMethod`, `negotiable` and `acceptsShipping` returned nothing — on this
form that means those inputs live in a wizard step not yet mounted (the same pattern as
Returns), rather than that the values are missing. *"Mumbai is somewhere in the rendered
text"* is real evidence but weaker than *"the city field contains Mumbai"*, and on a case
about round-tripping that difference is the whole point. The `fieldsChangedByNoOpSave: 0`
half is untested for the same reason as the rest.

### Three notes worth more than the verdicts

- **`roundtrip-live-species-jurisdictions`** is the consequential one. The
  permitted-jurisdictions list decides where a living animal or plant may legally be sent.
  The failure that matters is not the count returning 0 — that is visible and someone would
  notice — but it returning a **different two**, or silently widened. **Check identity of
  the set, not its size.**
- **`roundtrip-digital-code-delivery`** has a second, independent obstacle: `codesAvailable`
  is **derived from the code pool**, not typed into the form, and this run established the
  pool had no seller-facing writer (the route answered 501). Confirm a writer exists before
  running, then check the counter follows the **pool** rather than the form field — a form
  that lets a seller type a pool size while the counter derives from actual codes is exactly
  how a listing advertises stock it does not have.
- **`roundtrip-print-meta`** covers **two** types in one assertion (art and stickers) sharing
  one metadata shape. Cheapest to run, and most likely to expose a per-type divergence.
  Compare the **field sets** across the two before comparing values.

The fixtures are ready: `/api/products?listingType=classified` returns three real listings
across Mumbai and Hyderabad, and the case's expected shape (`city: Mumbai`,
`acceptsShipping: false`, `negotiable: true`) is one those fixtures can express. **The batch
is runnable the moment the seller save works.**

---

## Batch `selling/listing-lifecycle--p1` — 1 yes, 0 no, 11 blocked

Recorded 223/226. Eleven are full create→publish→transact lifecycles running through the
seller create/publish path — the one that accepts input, reports nothing and writes nothing
— and each ends with a live public listing I have no reliable way to remove. Running them
would produce eleven failures that all say the same thing about the save rather than
anything about the lifecycles.

### ✅ The digital-code availability predicate reads the pool, not the stock number

The seed contains exactly the fixture that proves it.
`digitalcode-beyblade-x-app-launch-codes-depleted`: **`stockQuantity: 5`,
`digitalCode.codesAvailable: 0`, `isSold: false`.** That combination is the whole point —
a naive check on the stock number would call this buyable, because 5 is not 0.

**It is not shown.** And I checked three rows rather than one, because the contrast is what
makes it conclusive rather than coincidental:

| Listing | stock | pool | In Available view |
|---|---|---|---|
| Launch Bonus Code (depleted) | **5** | **0** | **absent** |
| Anniversary Pack Code (sold out) | 0 | 0 | absent |
| Legendary Pack Code (partial) | 40 | **6** | **present** |

A non-empty pool is included and an empty pool is excluded **independently of stock** —
only possible if the rule reads the nested `digitalCode.codesAvailable`. The counts agree
too: the API returns 8 digital-code listings and the Available view renders 6 cards, the
two missing being exactly those rows. `digitalcode-depleted-excluded.png`

**Why this field deserves its own case**: `codesAvailable` is nested under `digitalCode`,
and a read of the top-level name returns `undefined` rather than throwing — so a wrong
reference does not fail loudly, it **silently never matches**, and the listing stays buyable
with nothing to deliver. That is the most expensive shape a bug can take on a digital good:
the buyer pays and there is no code.

### The assertions worth keeping from the eleven

- **`auction-reserve-respected-at-close`** is the one I would most want run. The reserve has
  history here: it was displayed, editable and promised to sellers while settlement awarded
  the top bid unconditionally and never consulted it. A seller sets a floor, the interface
  accepts it, and the item sells below it. **Check the winner is absent, not that a notice
  appeared.**
- **`preorder-create-publish-deposit`** — the buyer must be charged the **deposit**, not the
  full price. Taking the whole sum would look like a successful purchase to every automated
  check and surface only on someone's bank statement.
- **`live-create-publish-jurisdiction`** — the purchase must be **blocked**, not warned
  about. A warning a buyer can click past is not a jurisdiction check.
- **`digitalcode-create-publish-claim`** carries a **second** blocker: creating a listing
  *with a code pool* needs the pool writer that answered **501**. Clear that first, or it
  fails for a reason unrelated to the claim flow.
- **`art-` and `sticker-create-publish-sell`** are deliberately parallel — both assert
  checkout happens through the **standard** flow rather than a bespoke one. **Run them
  together and diff**, which is a comparison neither can make alone.

Two also have observable halves on seeded data, worth splitting out: pre-order **production
status rendering** (fixtures span all three values) and classified **contact-not-cart**
(three fixtures across Mumbai and Hyderabad). Confirming those first narrows any later
failure to the create path rather than the type's capability wiring.

---

## Batch `selling/listing-lifecycle--p2` — 0 yes, 0 no, 2 blocked

Recorded 224/226. Both are save round-trips against the seller save that writes nothing.

### `type-survives-edit` — blocked twice, and the second blocker is mine

**First**: it is a save round-trip. A type that came back unchanged would prove only that
the edit never landed.

**Second, and I want this stated separately rather than folded in**: I attempted the half
that *is* readable without saving — opening an existing classified's editor to check the
listing type loads correctly, since a form showing the wrong type on load would convert the
listing on save regardless of what the seller changed. The page **redirected to
`/auth/login`**. My seller session had expired mid-batch, almost certainly because I
exercised the sidebar **Log out** earlier in this run, which correctly invalidated the
session server-side while the session file on disk stayed behind. **That is my harness
state, not a product defect.**

**The case names two distinct mechanisms and both are real here.** A row builder that
collapses several types into one on the way *into* a form, and a form that defaults the
type when the field is absent from the payload, would each silently convert a listing on
save. This run has already seen the first shape — a seller row-mapper collapsing five
listing types down to `standard` with a four-branch ternary — so the concern is not
hypothetical.

**When it is run, check the type on the PUBLIC page too**, not just the editor: the editor
is where a wrong default is invisible, and the public route and badge are where a converted
listing shows itself.

### `unpublish-removes-from-public` — and why the *editable* half is the point

Two save round-trips (unpublish, then republish), with the public catalogue changing in
between. With the save writing nothing, an unpublish that appeared to do nothing would be
indistinguishable from one that worked while the public grid failed to update — **opposite
findings**.

The case makes a point worth keeping: unpublish is the **reversible** half of a pair whose
irreversible half is delete, and it is only useful as an alternative to deleting **if the
listing stays fully editable while hidden** — a seller pulls something down precisely
because they intend to fix it. An unpublish that hides the listing from the seller's *own*
list, or makes it read-only, quietly turns the safe option into a worse version of the
dangerous one, and they find out only when they go looking.

So the check is not *"did it disappear publicly"* but **"is it still in MY list, and can I
still open and change it"**. And run the direct-URL step: a listing removed from the grids
but still served on its own public URL is unpublished in name only.

---

## Batch `selling/listing-lifecycle--guest` — 2 yes, 0 no, 2 blocked

Recorded 225/226. **No defects** — and one "blocked" is a case that needs rewriting rather
than a product that needs fixing.

### ✅ Every type links to its own detail route — a regression check that passes

`wrongRoutes: 0`. On `/products` the card links resolve to **four distinct route families**:
`/products/` (standard), `/classified/`, `/digital-codes/` and `/live/`. On `/auctions`
every card links to `/auctions/{slug}`.

**This is worth more than a routine pass**, because those three types — classified,
digital-code and live — are exactly the ones whose `detailRoute` was once hardcoded to the
standard product page despite each having a working dedicated route, so every card,
carousel and related-items link sent them to the wrong page. What I see now is the corrected
behaviour, holding on the surface where the bug was most visible.

**Scope stated**: five of nine types verified — standard, classified, digital-code, live
(from `/products`) and auction (from `/auctions`). Pre-order, prize-draw, art and stickers
browse on their own nav-linked pages and need checking there.

### ✅ An ended auction's detail page loads and states its outcome

`notFoundPages: 0`. `/auctions/auction-beyblade-burst-spriggan-requiem-bought-out` returns
**5,522 characters**, no 404, no not-found text. The outcome is spelled out in three places:
the `h1` reads *"Beyblade Burst B-128 Spriggan Requiem (Ended — Bought Out)"*, an **Ended**
badge renders, and the page carries the real close time — *"Ended 9/11/2026, 12:29:17 AM"*.
Even the tab title says it. `ended-auction-detail-loads.png`

**The alternative is why this matters.** A closed listing that 404s destroys every link
anyone ever shared to it — a bidder's bookmark, a notification email, a search result — at
exactly the moment somebody wants to check what happened. The listing page agrees too:
`/auctions` shows `Ended` badges on closed rows, so the state is visible *before* clicking.

### A211 — `type-badge-correct-on-card` asks for a number the design forbids

`expectedData` wants **`distinctBadges: 9`** on `/products`. The page carries **three** type
badges — Classified, Digital Code, Live Item — plus standard listings which correctly show
**no** badge, since standard is the default and badging it would add noise to the majority
of cards. Four types, which is **exactly right**: `/products` is the **general catalogue**
and deliberately spans four. The other five each have their own nav-linked browse page, and
putting them in the general grid too would make one item reachable from two places with two
different chromes.

I confirmed the other badges exist rather than assuming: `/auctions` renders its own
**Auction** badge, distinct from anything on `/products`.

**So the case cannot pass on `/products`, and should not.** Nine distinct badges there would
mean the catalogue had absorbed five types that deliberately live elsewhere. The
`expectedData` and the design disagree, and the design is the one with a stated reason.
Recorded `null`, not `no` — **the case needs rewriting**: either count badges across all nine
browse pages, or assert four on `/products`.

### The one I would not round up

`sold-listing-leaves-available-tab` — the tab machinery is plainly there and is **per-type**:
`/products` offers *Available · All*, `/auctions` offers *Available · Ended · All*, the
middle label varying with the types each page spans. And I have direct evidence from earlier
in this run that Available genuinely **excludes** unavailable rows rather than relabelling
them (the digital-codes view: 8 API rows, 6 cards, pool-empty absent, partially-claimed
present).

But I did not do the three-way follow the case asks for — take **one identified listing**,
confirm it in Available, then find it in Sold & Ended **and confirm it is still in All**.
That third part carries the case: a listing that leaves Available and does not reappear in
All has not moved, it has **vanished**. Counting tabs is not following a row across them.

---

## Batch `selling/store-uncovered-pages` — 1 yes, 0 no, 5 blocked

Recorded 226/226. **Pass 1 is complete.**

### ✅ All seven seller guide routes resolve, and the index renders real, personalised content

`/store/guide` plus `/listings`, `/orders`, `/finance`, `/settings`, `/capabilities` and
`/whatsapp` all return **200** — none 404s. The index is not a shell: it opens
*"SELLER GUIDE — **Beyblade Arena** — Everything you need to know about selling on
LetItRip"* and lists guide cards, each with a real description and a `Read guide →` link:

> *Listings: Add products, auctions, and pre-orders. Learn condition grades, media tips, and
> pricing.* · *Orders: Process, ship, and handle returns.* · *Finance: Payout cycles,
> commissions, coupons, and promoted listings explained.*

Written for a seller, not generated from route names — and **personalised with the store's
own name**, which makes it read as part of that seller's dashboard rather than documentation
bolted on. `store-guide-index-renders.png`

**The contrast is the finding worth carrying forward**, and I would not have seen it without
testing both families: this dashboard guide works well, while the **public `/seller-guide`
index renders completely empty** (A186) — 200, correct title, header and breadcrumb, then a
blank band into the footer. Same product, two guide families, opposite outcomes. Anyone
fixing the empty one has a working implementation twenty lines away.

### A212 — `store-analytics-cards-renders` points at the wrong page

`/store/analytics/cards` renders correctly — but it is a **configuration** surface, not a
figures surface: *"Analytics Cards · New custom card · Built-in cards ship by default. Toggle
visibility or add custom cards."* then *"No cards — Add a custom analytics card to your
dashboard."*

The case expects *"real figures rather than an empty or placeholder set"*. **The empty state
here is honest rather than placeholder-ish** — an accurate statement about a seller who has
added no *custom* cards, which tells them what the page is for in the same breath. I checked
for the two failure shapes and found neither: no ₹ amounts, no stray numerals, no
coming-soon text. The page's own copy places the built-in figures elsewhere.

**Second case-versus-page mismatch in this run's final stretch** (after A211). Either point
the case at `/store/analytics`, or assert what this page actually does. Recording `no` would
blame a page for not being a different page.

### Four routes confirmed, content not read — with the useful half noted

`/store/stickers`, `/store/pre-orders`, `/store/support` and
`/store/listing-templates/new` all return **200**, and every store route resolved in the
earlier 38-route sweep. What went untested is each case's *second* half — the create or
open-a-ticket path, which is where this run has repeatedly found the real defects.

Each has a working reference nearby, which narrows any future search:

- **Stickers** — `/admin/stickers` works: five real listings, tabs reconciling 5 + 1 = 6. The
  data exists and one surface reads it correctly.
- **Pre-orders** — seeded pre-orders span all three production-status values, so an empty
  list here would be a query or rendering fault, not missing fixtures.
- **Support** — the buyer's `/user/support/new` opens with the form already rendered and
  cancels to a real ticket list. A working reference implementation for the seller side.
- **Listing templates** — the *"saved template is usable when creating a listing"* half
  depends on the seller save that writes nothing, so it would fail for a borrowed reason.
  **Run the first half anyway**: does the page show the form already open, the way
  `/user/support/new` and `/user/catalogue/new` do? That is independent, cheap, and a blank
  page there would be a finding with nothing to do with saving.

---

# FIX CYCLE 1 — root causes found and shipped (appkit 4.41.7)

Five defects fixed. Four of them were **one line each**, and every one of them
was invisible to `tsc`, to `npm run check` and to a 200 response.

## F1 — the silent-save family: a Zod schema that stripped 38 of 55 fields

**Blocked seven whole batches** (A121, A188, A192, and the per-type round-trip
cases that could never pass).

`productInputSchema` (`_internal/shared/features/products/schema.ts`) declares
**24** fields. `PRODUCT_UPDATABLE_FIELDS` — the codebase's own declaration of
what a seller may change — lists **55**. `z.object()` strips what it does not
declare, and **the parse SUCCEEDS**, so nothing surfaced anywhere: the seller
got a success toast and Firestore got 24 fields.

Measured against the real compiled schema, before and after:

| | dropped from a realistic seller draft |
|---|---|
| before | **38** — incl. `status`, `listingType`, `classified`, `digitalCode`, `liveItem`, `printMeta` |
| after | **1** — `isPromoted`, correctly: it is a paid placement flag |

`status` being among them is why **Publish wrote nothing at all**, and why
`draftToProductInput` carefully assembling four nested per-type blocks was
wasted work — they were discarded one function later.

### Why not `.passthrough()`, which is what the three sibling routes do

That was the obvious fix and it is wrong here. `sellerUpdateProduct` hands its
parsed input **straight to the repository with no field filter**. The sibling
product-update routes get away with passthrough because they are admin-gated;
this path is not. Verified against the shipped schema: of `currentBid`,
`bidCount`, `viewCount`, `storeId`, `slug`, `createdAt`, **0 survive**. Under
passthrough all six would have, and a seller could have forged a bid count or
moved a product into someone else's store.

Deriving the allowed set from the existing constant also means the two cannot
drift — hand-maintained enumerations drifting is Root Cause #61.

This is the **update-side sibling of Root Cause #101**, whose create-side half
(`categorySlugs` stripped on the way in) is already documented.

## F2 — `/admin/return-requests` crashed on a missing confirmation block

`approve-return` had **no `confirmation`** in the action registry while its
sibling `reject-return` did. The view reads `confirmation!.title`, so the
non-null assertion threw *"Cannot read properties of undefined (reading
'title')"* during render and **the page never painted at all**.

Fixed in the registry, not by softening the assertion — Rule #7 requires a
confirmation here regardless, because approving a return starts a real refund.
Swept all 7 `ACTIONS[...].confirmation!` sites against the registry: this was
the only one.

## F3 — addresses and payment methods: `params` read off the wrong object

A201's two halves — *"Edit says Address not found"* and *"Delete does nothing"*
— were **one bug**, and not the one the symptoms suggested.

```ts
const { id } = await (request as unknown as RouteContext).params;   // ✗
```

A `Request` has no `params`. `createRouteHandler` awaits `context.params` and
passes it to the handler as its own argument. So this destructured `undefined`
and threw on every call — GET, PUT and DELETE alike. The 500 surfaced to the
client as no data, which the page renders as *"Address not found."*

**The sweep is the finding.** The same pattern existed at 5 sites across 2
files, and the second file was `user/payment-methods/[id]` — so **editing and
deleting a saved payment method were broken identically**, which no case in the
run had covered.

## F4 — the SVG the picker offered and the server was always going to refuse

`ALLOWED_IMAGE_MIMES` excludes SVG deliberately (XSS surface) and the server
does enforce it — `classifyMime` returns null and finalize 422s. But every
picker said `accept="image/*"`, and **that wildcard matches `image/svg+xml`**.
So the file chooser offered it, the crop editor opened on it, the user framed
and cropped — and the refusal arrived at the very end, reading as a failure
rather than a rule.

`IMAGE_ACCEPT_ATTR`, derived from the allowlist, now replaces the wildcard at
all 8 pickers.

> **A measurement mistake worth recording.** I grepped for consumers of
> `ALLOWED_IMAGE_MIMES`, excluded the defining file from the results, got zero,
> and briefly concluded nothing enforced it — i.e. that SVG was accepted
> end-to-end. The enforcement is `classifyMime`, in that same excluded file.
> Excluding the definition from a usage search inverts the answer.

## F5 — auction terms can no longer move under a live bidder

Not a reported defect — a hole the F1 fix would otherwise have opened. Restoring
`startingBid` / `auctionEndDate` to the writable set makes them writable
mid-auction, so `assertAuctionTermsMutable` freezes them once a real bid exists.

It compares **values, not key presence**. The editor round-trips the whole
draft, so every save resubmits those fields unchanged; rejecting on presence
would have made a live auction entirely unsaveable — the seller could not have
fixed a typo.

## Not fixed, and why

- **A204** (`finalSale` reverting) — `finalSale` was always in the schema and
  survives the parse, so F1 does not explain it. I eliminated the client
  handler, the page, the draft mapper, the ownership check and the repository
  by reading each one. Static reading is exhausted; pass 2 against production
  will settle whether F1 resolved it as a side effect. Recorded rather than
  guessed at.
- **A196** (ciphertext instead of buyer names in admin order alerts) — traced to
  `userName` coming from the session's `displayName`, a PII field. Display-only:
  nothing is lost and nothing leaks. Deferred.
- **A145, A206, A209** — untouched this cycle.

## Leads for fix cycle 2 (traced, not yet fixed)

- **A206** (row selection inert on `/admin/products`, `/admin/offers`) —
  `AdminProductsView` *does* wire `buildBulkActions` (line 275), so the config is
  present and the fault is below it. Next step is `DataListingView`'s row
  checkbox render path, not the view's config.
- **A209** (Pending Orders 0 in the strip, 1 in the tile) — two independent
  sources confirmed: `AdminDashboardView` reads `query.data?.orders?.pending`
  into `DashboardStats`, while the store page renders `stats?.pendingOrders`
  from its own stats call. Two reads of one number, which is the shape of Root
  Cause #73. Reconcile at the source rather than at either renderer.
- **A196** — `userName` originates from the session `displayName`; check whether
  the session builder decrypts PII before the notification is composed.

---

# POST-DEPLOY VERIFICATION — 4.41.7 in production

Re-driven through the real UI against production. **This is why a fix nobody
re-tested is only a hypothesis** — one of the two I checked is confirmed, and
the other proved my diagnosis incomplete.

## ✅ A185 confirmed fixed

`/admin/return-requests` renders: breadcrumb, working toolbar (Filters, Sort,
three view toggles) and an honest *"No return requests"* empty state. No error
boundary, no `Cannot read properties of undefined`. Previously the page never
painted at all. `fix-verify-a185-return-requests.png`

## ❌ A121 NOT fixed — the schema strip was real but was NOT the only cause

The schema fix is proven correct in isolation (38 dropped fields → 1, measured
against the compiled output). It is **not sufficient**: a seller edit still does
not persist. Three distinct defects sit on this one path, and only now is the
third visible, because fixing the first two stopped masking it.

### 1. There are TWO "Save Changes" buttons and the first one is inert

Both are `type="submit"` with **no `<form>` ancestor** — they live in
`div.bottom-0`, the fixed bottom chrome, which is a *sibling* of the form under
`main#main-content`. Clicking the first fires nothing at all: no request, no
toast, no error. That is precisely the *"Save Changes issues no request"* half
of the original report, and it is a genuine second bug.

Clicking the **second** does issue `POST /store/products/<slug>/edit → 200`.

So the run's original observation was accurate and I had mis-attributed it: the
tester had been clicking a decorative duplicate.

### 2. The 200 is a lie — the action returns `{ok: false}`

A server action always returns HTTP 200; the envelope carries the outcome. After
the POST the value does not survive a reload.

### 3. The error message tells the user to fix something invisible

The toast reads **"Fix the highlighted errors and try again."** and **nothing is
highlighted** — `aria-invalid` matches zero elements and `FormErrorSummary`
renders no issues.

That string is `handleSave`'s *fallback*, used when `toUserMessage(result.code)`
cannot map the code. `applyZodIssues` received an empty list. So **this is not a
validation failure at all** — a Zod rejection would carry issues and highlight
its field. It is a thrown non-validation error (the path can raise
`NotFoundError` or `AuthorizationError`), reported through a message written for
a completely different failure.

**This is the worst of the three**, because it actively misdirects: it tells the
seller their input is wrong when the server is refusing for an unrelated reason,
and gives them nothing to act on.

### Next step for cycle 2

Surface the real `code` rather than falling back to the validation wording, then
read it. The two candidates on this path are the product lookup and the
ownership comparison in `sellerUpdateProduct` — note the seller's own
`/store/products` list *does* include this product, so a naive "they don't own
it" reading is already in tension with observed behaviour and must be measured,
not assumed.

**No residue**: every save attempt failed, so the product is unchanged.

## ✅ A201 Edit confirmed fixed · ❌ A201 Delete is a SEPARATE bug, still open

**Edit works.** `/user/addresses/{id}/edit` now loads the real record — "Edit
Address" with every field populated (`QA Probe`, `QA Address Probe`,
`9876543210`, `221B Test Street`, `Opposite the QA park`, `Bengaluru`,
`560001`), where it previously rendered only *"Address not found."*
`fix-verify-a201-address-edit.png`

Note `landmark` is among the restored fields — one of the values the old
`params` bug made unreachable.

**Delete is not fixed, and my route fix was never going to fix it.** Clicking
Delete produces **no confirmation dialog, no request and no removal**; the row
survives a reload and the Delete-button count is unchanged at 4.

So A201 splits the same way A121 does, and I had merged two causes into one
report both times:

| | server side | client side |
|---|---|---|
| A121 | schema stripped 38 fields — **fixed** | Save button inert / wrong error — **open** |
| A201 | `params` read off `request` — **fixed** | Delete button inert — **open** |

**The generalisation worth keeping**: in this codebase a control that "does
nothing" is a *client* defect, and a control that "succeeds and changes nothing"
is a *server* defect. They present almost identically to a tester — the only
distinguishing evidence is whether a request appears in the network panel at
all. Both of these reports contained one of each, and fixing the server half
left the symptom looking unchanged.

🛑 **Residue I could not clear.** Three QA addresses remain on the buyer account
(`QA Probe` at 221B Test Street, and two `QA Address buying-checkout-...` rows at
1 Test Street). `addresses` is **PRESERVE tier**, so no wipe removes them, and
the only UI affordance for removing them is the Delete button that does not
work. They will persist until Delete is fixed.

### 🛑 CORRECTION — A201 Delete is fixed too. My "inert Delete" was a measurement error.

Retested properly: Delete **works end to end**. Clicking it renders
*"Delete this address? This cannot be undone."*, and confirming removes the row
— the QA Probe disappeared from the list and a "deleted" toast fired.

**What I got wrong**: I searched for the confirmation with
`[role="dialog"], .appkit-modal, .appkit-confirm-modal`. This confirm is
**inline JSX** inside the list component, not a modal, so my selector matched
nothing and I read "no dialog appeared" as "the button is inert". The button was
working the whole time; my probe was looking for the wrong shape.

Source confirms the wiring was never in doubt: `AddressCard` renders Delete only
when `onDelete` is defined (`{onDelete && ...}`), so a *visible* Delete button is
itself proof the handler was attached. I had that evidence on screen — four
rendered Delete buttons — and reasoned past it.

**So A201 is fully fixed, both halves**, by the one `params` change. The table
in the previous section is wrong on its second row and is superseded by this:

| | server side | client side |
|---|---|---|
| A121 | schema stripped 38 fields — **fixed** | Save flow — **still open** |
| A201 | `params` read off `request` — **fixed** | *(no client defect — my error)* |

The generalisation about "does nothing" vs "succeeds and changes nothing" still
holds for A121. It simply did not apply here, and I applied it too eagerly.

✅ **Residue cleared.** All three QA addresses (`QA Probe` + two
`QA Address buying-checkout-…`) have been deleted through the repaired UI. The
buyer account is back to its seeded address only. Nothing is left on the
PRESERVE tier.

---

# A121 — THE REAL ROOT CAUSE, and a correction to my own fix

## 🛑 Correction first: I fixed the wrong schema

`src/actions/seller.actions.ts` imports `productUpdateSchema` from
**`@/validation/request-schemas`** — the *consumer's* schema. The one I widened
in cycle 1 lives in appkit (`_internal/shared/features/products/schema.ts`) and
is used by a **different** action (`updateProductAction`).

So that fix is real and the 38→1 measurement stands — for the path it governs.
It was never on the seller edit path. **Root Cause #53 exactly**: two symbols
with the same name, and the one you fix is not the one that runs. I had even
read the correct import line earlier and did not register that it pointed
somewhere else.

## The actual cause: `mainImage: urlSchema`

Captured from the server action's own response body:

```
"ok":false   "code":"VALIDATION_FAILED"   "error":"Invalid URL"
```

`urlSchema` is `z.string().url()`, which demands an **absolute** URL. **Every**
media form this platform mints is relative:

| form | minted by | `z.string().url()` |
|---|---|---|
| `/media/<slug>` | `/api/media/finalize` | ✗ Invalid URL |
| `/api/media/ext?url=…` | `seedExtMedia` | ✗ Invalid URL |

The product's own `mainImage` is `/api/media/ext?url=…`, so **every seller
listing edit has always failed** — rejected because of a value the seller never
typed, could not see, and did not choose. The UI then reported it as "Fix the
highlighted errors" with nothing highlighted.

The file itself documents the trap: its `mediaUrlSchema` comment says the two
copies "refine on the SAME predicate … instead of each re-deriving the rule.
**That re-derivation is what let both copies be wrong in the same way.**" The
helper was fixed. The fields that needed it were not.

**Fixed** with `listingMediaUrlSchema` on `mainImage`, `images`, `video.thumbnailUrl`
and `display.coverImage` — deliberately wider than `isStoredMediaRef` (which
rejects the `ext` form) because a listing legitimately carries platform-minted
`ext` refs, while an arbitrary user avatar should not. Widening at the listing
schema rather than loosening `isStoredMediaRef` keeps the stricter rule for
every other consumer.

Verified against real values, negative controls included:

```
accept  /media/product-abc-image-1.webp        (canonical upload)
accept  /api/media/ext?url=…placehold.co…      (THE failing value)
accept  https://res.cloudinary.com/…           (approved CDN)
REJECT  https://evil.example.com/x.png         (unapproved host)
```

## Two more bugs found in the same block

- **`video.url` rejected YouTube.** The refine required a `.mp4/.webm/.ogg/.mov/.m4v`
  extension, and a YouTube watch URL has none — so a video source
  `MediaUploadField` deliberately offers its own tab for could be authored and
  then never saved. Root Cause #49, on the write side this time.
- **`video.thumbnailUrl: urlSchema`** — it is an image, and the seed wraps it
  through the ext proxy, so it was relative and rejected too.

## And the message that hid all of it

`toUserMessage(code, undefined, {fallback})` short-circuits on
`if (!t) return generic` — **with no translator it returns the fallback for
every code and never consults it**. Passing the validation sentence as that
fallback made every refusal look like a validation problem.

**22 of 28 call sites pass `undefined` for `t`**, so the whole error-code→message
mapping is inert nearly everywhere and every distinct server error renders as
one string. Fixed at the seller shell (`saveFailureMessage` names the code when
there are no issues); the other 21 sites are queued, not done.

---

# Stop hook: fix-then-test

`mode: "fix-then-test"` in `loop-state.json`, added to
`scripts/claude-hooks/tester-loop-continue.mjs`.

- **Phase `fix`** — while `fixQueue` is non-empty, the hook names the next
  defect and explicitly forbids running batches.
- **Phase `test`** — once the queue empties, it switches to re-driving the
  superset: the 237 `no` ids **and** the 554 `null` ids.

Blocked cases are in the superset deliberately: many were blocked *by* the
defects being fixed — a save that writes nothing blocks every case downstream of
it — so re-testing only the failures would leave that coverage unrecovered.

The flip is mechanical (empty queue ⇒ test), so the phase cannot be declared
done early or forgotten. An entry leaves the queue only by explicit edit; the
hook never infers that something is fixed.

**Verified by running it**, both phases and a negative control:

| | result |
|---|---|
| queue of 9 | `▶ FIX PHASE — 9 defect(s) outstanding`, names the next one, exit 2 |
| queue emptied | `▶ TEST PHASE — fixQueue is empty`, points at both id files, exit 2 |
| `fixQueue` **absent** | stands down with a reason, exit 0 — does **not** flip to testing |

That last row is the one that matters: an absent queue is not an empty one, and
treating it as empty would start testing with every defect unfixed. Root Cause
#87 — never trust a gate you have not seen fail.

---

# ✅ A121 FIXED AND VERIFIED IN PRODUCTION (appkit 4.41.8 + consumer schema)

Re-driven through the UI on production:

```
toast:            "Saved."            ← first time in this entire run
after reload:     "Beyblade Burst B-01 Valkyrie [FIXED-4418]"   PERSISTED: true
```

The seller listing editor now saves. `mainImage: listingMediaUrlSchema` was the
fix — `urlSchema` had been rejecting the product's own `/api/media/ext?url=…`
image as "Invalid URL", which is why **every** seller edit had always failed.

Title restored to `Beyblade Burst B-01 Valkyrie` afterwards; no residue.

# ❌ A204 CONFIRMED — and now isolated to ONE FIELD

The same save that persisted the title did **not** persist `finalSale`:

| field | in the same request | after reload |
|---|---|---|
| `title` | `"Beyblade Burst B-01 Valkyrie"` | ✅ persisted |
| `finalSale` | `false` (toggle clicked ON = accepts returns) | ❌ reverted |

`aria-checked` went `false → true` on click, the save returned **"Saved."**, and
the reload shows `false` again. So this is no longer "the save is broken" — the
save works, and one field in the payload is being lost.

**What it is NOT** (checked, so the next person does not re-check):

- not the schema stripping it — `productBaseSchema` names `finalSale` explicitly,
  with a comment warning that it must be named or it is stripped;
- not `compact()` in the draft mapper — that drops `undefined` only, never `false`;
- not the media/`urlSchema` bug — the title proves the write path now works.

**The live hypothesis** is that the lost value is specifically `false`, not
`finalSale`. The toggle is inverted (`onChange({ finalSale: !checked })`), so
turning returns ON writes `finalSale: false` — and a falsy value is exactly what
a "only copy truthy fields" merge would drop. The next step is one experiment,
not more reading: set the toggle the OTHER way so the payload carries
`finalSale: true`, save, reload. If `true` survives and `false` does not, the bug
is falsy-stripping somewhere between the action and Firestore, and the field name
is a red herring.

That experiment is cheap and decisive, and it is the right next move rather than
reading more of the write path.

### 🛑 CORRECTION — A204 is FIXED. My "still broken" reading used the wrong toggle.

The page has **six** `role="switch"` elements. My selector tried to match the
label and fell through to `?? toggles[0]`, which is **"Mark as Featured"** — so
the test flipped a different switch entirely and then reported the returns
toggle as reverting. The fallback silently made the test measure something else.

Retested against the toggle by index, in both directions:

| write | persisted after reload |
|---|---|
| `finalSale: true` (returns OFF) | ✅ |
| `finalSale: false` (returns ON) | ✅ |
| `allowOffers: false` — a FALSY value | ✅ |
| `allowOffers: true` | ✅ |

So the **falsy-strip hypothesis is disproven**, and A204 needed no separate fix:
it was the media-schema bug all along. Every A121-family symptom shared that one
cause, which is what the family always looked like.

**Lesson, and it is the same one twice in this session**: a selector with a
`??` fallback does not fail when it misses — it quietly measures the wrong
thing and returns a confident answer. The inline-confirm miss on A201 Delete was
the same shape. Prefer an explicit index or a selector that throws when it
matches nothing, and state which element was actually operated on.

Product restored to its seeded state: returns ON, offers ON, original title.
