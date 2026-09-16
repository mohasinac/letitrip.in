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
