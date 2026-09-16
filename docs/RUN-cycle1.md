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

### C2 — in progress, not yet found

Eliminated so far, so the next pass does not re-walk them:

- `GET /api/cart` does **not** drop items — it only enriches `storeName`.
- `cartRepository.pruneForItems` prunes selection / coupons / add-ons only,
  never `items`.
- `getCartForUser` is a bare `findByUserId` with a deliberate no-catch.
- `addGroupLineToCart` is the ADD path; its stock check throws rather than deletes.

Still to check: the cart PAGE's own client/SSR reconciliation, and any
"validate the cart" sweep that resolves `item.productId` — the strongest
hypothesis remains that a product-existence sweep drops both line kinds, because
a **group** line's `productId` is a group id and a **bundle** line's is a
category id, so neither resolves as a product.

---

## Tests run

_(batches worked, yes/no/null, delta vs baseline — appended in step 5)_

---

## Still failing

_(ids + why, at cycle close)_

---

## Residue

_(data left behind, fixture gaps opened)_
