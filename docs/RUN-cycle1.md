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

---

## Tests run

_(batches worked, yes/no/null, delta vs baseline — appended in step 5)_

---

## Still failing

_(ids + why, at cycle close)_

---

## Residue

_(data left behind, fixture gaps opened)_
