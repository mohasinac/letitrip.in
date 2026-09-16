# Cycle 1 — batch-fix everything, deploy once, then test

**Baseline** (pass 1, `run-1789432098900`): 495 yes / **237 no** / **554 null**
over 226 batches. 100 distinct fail causes, 107 distinct block causes.

**Shape of this cycle**: fix every queue entry with no interleaved verification →
ONE `npm run check` → ONE publish + deploy → test the 192-batch suite → collect →
cycle 2.

Triage inputs, both generated rather than hand-written:
- `docs/TRIAGE-run-1789432098900.md` — `scripts/triage-findings.mjs`, clusters by
  root-cause signature
- `docs/FAILURES-bucketed.md` — `scripts/bucket-failures.mjs`, buckets all 237 by
  symptom shape across page boundaries

---

## Fix queue

| # | Root cause | Cases | Status |
|---|---|---|---|
| C1 | count vs listing — badge is all-statuses / double-counts the ancestor chain | ~36 | pending |
| C2 | grouped + bundle cart lines destroyed when `/cart` opens | ~5 | pending |
| C3 | guest price gate not applied on `/cart` | 3 | pending |
| C4 | cart order summary does not recalculate on qty change | 1 | pending |
| C5 | `/sellers` renders no content | 1 | pending |
| C6 | search inert on `/faqs`, `/faqs/[cat]`, scam registry | ~5 | pending |
| C7 | admin order rows show a raw order id, not the item (22/25) | 1 | pending |
| C8 | cart and checkout agree, created order does not | 1 | pending |
| C9 | coupon editor reports 3 issues on an untouched record | 1 | pending |
| C10 | store/category facets inert (rating, classified city) | ~2 | pending |
| C11 | cart empty state has no CTA | 1 | pending |
| C12 | long tail — 169 unbucketed failures | ~169 | pending |
| C13 | make 13 real-email cases testable via `inbox.mjs` | 13 null | pending |
| C14 | rewrite 6 interactive-Google cases to the observable half | 6 null | pending |

---

## Fixes applied

### C1 — counts vs listing (partial, and the residue is architectural)

**Root cause**: `countersReconcile` tallied `status == "published"` and nothing
else, while every listing surface renders the **Available** scope. Two different
populations, so the badge could never match the tab it opens. The seed keeps a
sold/ended fixture for *every* listing type, so at least one unavailable
published row always exists — the disagreement was permanent, not occasional.

**Fixed**: the tally now applies `isListingRowAvailable()` — the *same*
predicate the listing query uses, shared rather than re-derived (re-deriving it
is how Root Cause #73's four partial copies happened). `ProductTallyRow` grew
the availability inputs; the query has no `.select()`, so the fields were
already being fetched.

`appkit/src/_internal/server/jobs/core/countersReconcile.ts`

**🛑 What this does NOT fix, stated plainly**: availability is partly
**time-based** — an auction ends, a prize-draw window closes — and no write
trigger can observe time passing. `onProductWrite` counts publish/unpublish
transitions only, so between nightly reconciles the stored number drifts high as
auctions expire. A stored counter is therefore accurate only to the last run.

Cases asserting **exact** badge/listing equality may still fail on a leaf whose
auction ended since midnight. The complete fix is render-time counts — the page
header already does this (`counts.products ?? metrics…`); the child chips read
the stored metric. Making the chips use the same live source would make them
agree by construction. Left in the queue as C1b rather than claimed as done.

### C1b — the live counter now agrees with the reconciler

Making the child chips query live would cost one query per child on every page
render, against Rule #6's ~3-round-trip budget. Wrong trade to close a ≤24h
window.

Instead `onProductWrite` now counts **published AND available** rather than
published alone, so the live counter maintains the same population the nightly
recount does. It closes more drift than it appears to, because the transitions
that matter are all writes — a sale decrements stock, a refund restores it, and
`auctionSettlement` writes to the product when an auction ends. A purely
time-based expiry with no accompanying write is the only residue, and the
nightly recount is its healer.

`appkit/src/_internal/server/jobs/core/onProductWrite.ts`

Also corrected here: my first version of the tally interface declared
`auctionEndDate?: unknown`, which `audit-unknown-leakage` blocked — rightly. On a
raw snapshot it is a Firestore `Timestamp`; typing it `Date | string` would have
been a lie and `unknown` was a dodge. It is left undeclared, with the reason
written down, since `AvailabilityRow` is `Record<string, FirestoreValue>` and the
predicate reads it off the document anyway.

### C2 — cart validation deleted every grouped and bundle line ✅

**Root cause**: `runCartValidation` sends every line's `productId` to
`POST /api/cart/validate`, which answers by calling
`productRepository.findById` on each one. But **a multi-member line's
`productId` is not a product id** — a group line carries the GROUP's id, a
bundle line carries the bundle CATEGORY's id, by design, because the line stands
for a selection rather than for one product.

Neither resolves. Both came back `stale` — "no longer published" — and the very
next block `deleteCartItem`s them.

So the line was built perfectly (right members, right discounted price; the
tester confirmed `lineKind: "bundle"` at price 2999 rather than the ₹4,597 sum
of its members) and then **destroyed the instant /cart rendered**. Every grouped
and bundle cart case was testing a cart that had silently emptied itself, which
is why several read as "the feature does not exist".

**Fixed** at the caller, where the line kind is known: a multi-member line now
contributes its MEMBERS' product ids instead of its own. Those are real products
and are what actually has to stay purchasable.

The apply-side needed no guard and that is by construction, not luck: a
multi-member line's own id is never sent, so it can never appear in `stale` or
`moveable`, so it can never be matched and deleted.

`src/components/routing/CartRouteClient.tsx` · `appkit/src/client.ts`
(exports `isMultiMemberLine` / `getCartLineMembers` — reading `groupMembers`
directly would miss carts written before that field existed; the fallback lives
inside those accessors).

### C3 — guest prices on /cart, and the audit that was told not to look ✅

**Root cause (two halves).** `/cart` rendered the amount in five places with no
gate, while `/products` correctly showed "Sign in to see price". And
`audit-guest-price-leak` reported clean throughout — because its own header
asserted that *"admin, seller, **cart**, checkout and order surfaces … are
signed-in by definition"*.

**That premise is false.** `useGuestCart` exists, `useGuestCartMerge` merges a
guest cart on login, and the tester observed the amounts while signed out. The
audit was not broken; it had been told the cart could not leak.

Why gating the cart is right rather than merely case-compliance: a guest who can
add any item and read its price **has a price oracle that bypasses the gate
entirely** — the same reasoning that already withholds the price facet and the
money sorts.

**Fixed**, matching the documented three-way split:
- `<GatedPrice>` — the lane subtotal and the lane total (primary amounts)
- `<PricesOnly>` — the per-group subtotal (secondary, beside a gated primary)
- `useCanSeePrices()` — the bottom-bar `infoLabel` and the per-store `money()`
  helper, because **a string prop cannot be wrapped in a slot**

**Audit corrected too**, or this regresses the moment someone adds a sixth
amount: the false premise is replaced with the reason it was false, and
`GUEST_REACHABLE_FILES` adds the cart client to R2's scan — as a FILE, since
`src/components/routing` also holds dashboard-only clients and sweeping the
folder would bury a real finding in signed-in noise.

**Verified by breaking it.** With every gate reference stripped, R2 reports:

```
FAIL: 5 violation(s).   CartRouteClient.tsx:1197, 1323, 1533, 1588, 1880
```

Five — exactly the count the tester reported seeing. Restored, it passes.

🛑 **My first attempt at this audit change was blind**, and only the control
caught it: one of two string replacements silently failed to match, so the loop
still iterated `PUBLIC_DIRS` alone and the cart file was never opened. It
printed a confident `OK: 0 violations`. That is the fourth vacuous sweep this
session — the rule is now simply *never trust a sweep you have not watched fail*.

`src/components/routing/CartRouteClient.tsx` · `appkit/src/client.ts` ·
`scripts/audit-guest-price-leak.mjs`

### C4 — the summary had no dependency on the cart ✅

`usePricingPreview`'s effect depended on
`[enabled, addressId, paymentMethod, lane, addonSignal, couponSignal]` — **no
signal for cart contents at all.** Changing a quantity therefore never refetched
the server-computed summary.

The signal pattern was already there and correct: add-ons have one, coupons have
one. The thing a buyer changes most often had none.

**Why it presented as it did**: the line total moved (local arithmetic) and the
header badge moved (it counts items), so two of the three numbers on screen
updated and the one carrying the money did not. That is worse than all three
freezing — it reads as a working page with a wrong total, and the buyer has no
cue that anything is stale.

**Fixed** with an `itemsSignal` of item ids and quantities, including a grouped
line's **per-member** quantities — a group line's own `quantity` is pinned to 1
by the cart invariant, so member edits would otherwise be invisible to the
signal and the summary would freeze for precisely the lines that are hardest to
reason about.

Swept the other caller: `CheckoutRouteClient` had the same missing dependency.
Quantities are not editable there, so it is not the same defect — but a cart
mutated in another tab would leave those figures stale while looking live, so it
gets the same signal.

`src/lib/hooks/usePricingPreview.ts` · `CartRouteClient.tsx` ·
`CheckoutRouteClient.tsx`

### C5 — /sellers was a slot shell with no slots filled ✅

`<SellersListView />` was rendered with **zero render props**. Every slot on
`SlottedListingView` is optional, so it produced a correct `<h1>`, a correct
breadcrumb and then a blank region — which is exactly what the tester measured
(200, right title, zero cards, not even an empty state). **Root Cause #8**, and
that shell's only consumer anywhere was this one page.

**Fixed by reuse, not by filling the shell in.** `/sellers` now renders
`StoresIndexPageView` scoped to verified stores, so it inherits what `/stores`
already got right: the SSR `q` push-down (whose own comment records a live
`?q=zzzznope` returning two real cards), sandbox hiding, the ad slots and the
shared listing component. Filling in `SellersListView` would have created a
second store directory to fix twice.

**A second defect found on the way**: `isVerified` was **not in
`listStores`'s sieve field map**, and sievejs runs with
`throwExceptions: false` — so a filter on it is dropped *silently*. A "Verified
Sellers" page would have listed every store while claiming to list verified
ones. That is Root Cause #62's EMITTED_BUT_UNFILTERABLE, and the map's own
comment documents `isFeatured` having been found the same way two fixes ago.

`appkit/src/features/stores/components/StoresIndexPageView.tsx` ·
`appkit/src/features/stores/repository/store.repository.ts` ·
`src/app/[locale]/sellers/page.tsx`

### C6 — two unrelated causes behind one symptom ✅

The tester reported "search inert" on three surfaces. They are **two different
bugs**, and the FAQ one is not a search bug at all.

#### /faqs and /faqs/[category] — a MISSING INDEX, not a broken filter

Measured against production, which settled it in three requests:

```
?search=refund&sorts=-priority,order   → total 12    (the SIDEBAR's query)
?search=refund&sorts=-createdAt        → 9 FAILED_PRECONDITION: requires an index
?category=returns_refunds&sorts=-createdAt → 9 FAILED_PRECONDITION
```

`FAQPageContent` runs **two** queries: the list (default sort `-createdAt`) and
a count query for the sidebar (sorted `priority,order`). Only the second sort
was indexed. So the sidebar counted 14 real matches while the list threw and
rendered zero — two numbers from two queries, one of which had died silently.

Both missing composite indexes added to `appkit/firebase/base/firestore.indexes.json`
and regenerated into the root file (both are tracked and must ship together):

- `isActive + category + createdAt DESC`
- `searchTxt CONTAINS + isActive + createdAt DESC`

**And the silence is closed too**: the list now renders an error state instead
of an empty one. A failed query is not an empty result, and rendering it as one
is precisely what let this sit behind a plausible "no questions found".

#### /scams — the search box never reached the query

`ScamRegistryView` reads `q` and `listVerifiedScammers` **never passed it on**,
building filters from `scamType` and `scamPlatform` only. So `?q=zzzznope`
returned every verified profile and the counter still read the full total —
invisible to any real search term, because a real term also returns rows. Same
shape as the `/stores` SSR search fixed earlier: parsed, then not used.

The repository already had the machinery — its sibling `listAll` takes
`opts.search` with `planSearchTxt`/`refineSearchTxt`. `listVerified` now mirrors
it exactly, **including the empty-plan guard**: a search narrowing to no usable
token must return nothing rather than the whole registry, because failing open
here publishes every profile to someone who searched a stop-word.

`appkit/src/features/faq/components/FAQPageContent.tsx` ·
`appkit/src/features/scams/repository/scammer.repository.ts` ·
`appkit/src/features/scams/actions/scam-actions.ts` ·
`appkit/firebase/base/firestore.indexes.json` + regenerated root

🛑 **The indexes need deploying** (`npm run firebase -- deploy --only indexes`)
— that is a Firebase deploy, separate from the Vercel one, and until it runs the
FAQ list stays empty in production.

### C7 — the seed wrote a shape no order surface reads ✅

Root Cause #52 was fixed in the VIEWS — they read `items[0].productTitle` for
the row label. The rows still showed `🧾 Order order-1-20260822-aucwon` on 22 of
25, because **44 of the 50 seeded orders have no `items[]` at all**.

The generator that produces most of them writes the LEGACY flat shape —
`productId`, `productTitle`, `quantity`, `unitPrice` at the top level — and
never the canonical array. So the product was known the whole time; it simply
was not where any reader looks.

Same family as Root Cause #60 (a writer producing a shape no reader can render),
except the writer is the **seed**, which is exactly why it survived a fix aimed
at the readers.

**Fixed on both sides, deliberately:**

1. **The seed** now emits a proper `items[]` alongside the legacy flat fields —
   the root cause.
2. **The readers** fall back to the flat shape when `items[]` is absent
   (`AdminOrdersView`, `SellerOrdersView`). Root Cause #42's rule: prefer making
   the reader resilient over fixing only today's seed data, because the next
   hand-written fixture or legacy document lands in the same shape.

🛑 **Needs a reseed to take effect** — the fix is to data the seed produces, so
existing production orders keep their flat shape until re-seeded. That is what
the reader fallback is for: those rows render correctly either way.

`appkit/src/seed/orders-seed-data.ts` ·
`appkit/src/features/admin/components/AdminOrdersView.tsx` ·
`appkit/src/features/seller/components/SellerOrdersView.tsx`

### C8 — the money one. Two defects, and the tester's arithmetic located both ✅

Evidence: a cart quoted **₹2,319.80** on the cart page and on all three checkout
steps produced an order recording **₹2,549.60** — and the ₹2,319.80 was still on
screen at the instant the buyer committed.

#### C8a — the quote priced a payment method the buyer did not choose

`previewPaymentMethod` is derived from which options are **offered**, not which
is **selected**:

```ts
showCashOption ? "cash" : showCod ? "cod" : showRazorpay ? "online" : "emi"
```

So whenever cash is on offer the summary is priced as cash — and
`computeCodHandlingFee` returns 0 unless `paymentMethod === "cod"`. The ₹229.80
gap is exactly that fee.

**The tester attributed it to the 10% COD deposit, and that reading is wrong in
a way worth recording**: server-side the deposit is a **split** of the total
(`deposit + remaining = total`), not an extra charge. Both quantities are 10% of
the same subtotal, so they are numerically identical here and the evidence
cannot separate them. The code can: `codHandlingFee` is added "on top of the
order total", the deposit is not.

**There is no selected-method state to price instead** — each button places the
order with a hardcoded method, so choosing COD and committing are one click.
Turning checkout into select-then-confirm is a product decision, not a bug fix,
so it is **not** done here.

What is done: the COD block now shows the **COD-inclusive total**. The addition
is exact rather than a re-estimate, because `cod` and `cash` differ server-side
by this fee alone — every other line is identical — so the COD total is the
previewed total plus the handling fee.

#### C8b — the order page printed the grand total on the Subtotal row

```ts
const subtotal = doc.totalPrice - shippingCost + discount;   // ✗
```

It backs the subtotal out of the total by removing shipping and restoring the
discount — and ignores the platform fee, GST, COD handling and all three add-ons.
With shipping and discount both zero it returns the grand total unchanged, which
is why the page read "Subtotal ₹2,549.60 / Total ₹2,549.60" above items summing
to ₹2,298.00. A page that visibly does not add up, on the document a buyer opens
when they think they were overcharged.

**Fixed by summing the items**, which are on the document and carry their own
price and quantity. They cannot drift out of step with the fee list the way a
subtraction must every time a fee is added — the old derivation survives only as
a fallback for documents with no items.

`appkit/src/_internal/server/features/orders/adapters.ts` ·
`src/components/routing/CheckoutRouteClient.tsx`

### C9 — the editor never loaded the record it was accusing ✅

`GET /api/admin/coupons/[id]` called `getCouponByCode(id)`. That helper
upper-cases its argument and matches the `code` field — so
`/api/admin/coupons/coupon-arena25` searched for a coupon whose code is
`"COUPON-ARENA25"`, found nothing and returned 404.

The editor seeds from that response and **returns early when it is absent**, so
the form sat at its defaults and its validator reported three "required" issues
on a record the admin had not touched — including *"A discount value is
required"* on a coupon that plainly has one.

**The sibling `PATCH` twenty lines below has always used `findById`**, which is
the whole shape of it: saving worked while opening did not, so the editor looked
broken in a way that pointed at validation rather than at a 404.

**Fixed** with `findById` first, keeping the by-code lookup as a **fallback**
rather than deleting it — the route's param is named `id`, but a human-typed
code is the obvious thing to paste into this URL, and answering both costs one
extra read only when the first misses.

Swept all **378** route files for the same GET/PATCH asymmetry (a non-id lookup
on `id` in a file that elsewhere resolves the same segment with `findById`).
One hit: this file, matching on the fallback I deliberately kept. No others.

`src/app/api/admin/coupons/[id]/route.ts`

---

## Tests run

_(batches worked, yes/no/null, delta vs baseline — appended in step 5)_

---

## Still failing

_(ids + why, at cycle close)_

---

## Residue

_(data left behind, fixture gaps opened)_
