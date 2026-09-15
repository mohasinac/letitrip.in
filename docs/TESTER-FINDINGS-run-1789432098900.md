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

**Blocks** `cta-layout/navbar-ctas--admin → announcement-bar-message-renders`
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
