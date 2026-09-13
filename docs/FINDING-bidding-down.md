# 🔴 Bidding is down in production — and the failure is invisible in the admin error surfaces

Found 2026-09-13 during tester run `run-1789300124915` (Phase 5, `buying/bidding`).
Evidence screenshots: `tester/.tester-runs/run-1789300124915/shots/bid-db-error.png`,
`…/bid-broken-second-auction.png`, `…/admin-server-errors.png`.

## 1. No bid can be placed

Four attempts, two different live auctions, four rejections. **Nothing was written
in any case** — current bid and bid count were unchanged after every attempt.

| Auction | State | Amount sent | Result |
|---|---|---|---|
| `auction-beyblade-metal-lightning-l-drago` | 13 bids, ₹3,199, min inc ₹200 | **₹3,399** — the modal's own prefill | `A database error occurred. Please try again.` |
| same | same | ₹3,399 again | identical — deterministic, not transient |
| `auction-beyblade-x-shark-edge` | **0 bids**, ₹799 start | **₹799** — the modal's own prefill | `The information provided is not valid.` |
| same | same | ₹899 — clearly above the minimum | `A database error occurred. Please try again.` |

Two distinct failure modes, so this is not one bad fixture.

### 1a. The database error

Hits both auctions, at amounts **the UI itself computed as valid**. The bid submits
as a **Server Action** — `POST` to the page URL returning **HTTP 200**, with the
failure carried inside the action envelope — which is why nothing appears as a
failed request in the network panel.

**Reads on the same pages are completely healthy**: listings render, and L-Drago's
13-bid history paginates correctly across three pages.

### 🛑 It is NOT a quota problem — controlled, and ruled out

My first instinct was Firestore write-quota exhaustion, because the user-facing
string (`DB_001`) is the same one the `/api/site-settings` outage produced earlier
in this session. **That is wrong, and acting on it would waste the investigation.**

Control, run minutes *after* the bid failures and as a different identity (admin):

```
add-to-cart on product-beyblade-burst-valkyrie
  → ✓ "Beyblade Burst B-01 Valkyrie" added to cart — 1 item, ₹999.00 total
```

Other writes that succeeded earlier in the same run, as the bot identity:
an offer created at ₹1,200 on `classified-beyblade-stadium-set` (verified persisted
as **Pending** on `/user/offers` after a reload), several cart adds, and a quantity
change to 10.

**So ordinary Firestore writes work. Bid writes specifically do not.**

### The differential that points somewhere

The distinguishing property is almost certainly **atomicity**. A bid must be
transactional — concurrent bidders make it the one write here that genuinely needs
`runTransaction` — whereas a cart add is a plain set/update.

That matches a known failure signature exactly: a bundler-evading runtime
`require()` given a **relative** specifier in `core/unit-of-work.ts`, which resolved
against the emitted chunk in production and made `runBatch` / `runTransaction` throw
**before touching Firestore** — killing bid placement and the post-payment stock
decrement while leaving every non-transactional write healthy. It passes `tsc`,
`npm run check` and a full `next build`, and only fails once the code runs in a
Lambda.

### Narrowed further by reading the code — two hypotheses eliminated

**Confirmed the primitive is in play.** `appkit/src/features/auctions/actions/bid-actions.ts`
line 18 imports `unitOfWork` and line 218 calls `unitOfWork.runBatch(...)`. Cart adds
do not. So the transactional-vs-plain split is real, not inferred.

**Eliminated — the relative-require bug is NOT the cause.**
`npm run audit relative-runtime-require` reports **0 violations**;
`appkit/src/core/unit-of-work.ts` line 21 is a **static** `import { getAdminDb } from
"../providers/db-firebase"` with a comment recording why the lazy form was removed;
and the installed `dist/core/unit-of-work.js` carries that same static import.
Consumer pins `^4.37.0`, installed `4.37.0`.

**So something inside `fn(batch)` or `batch.commit()` is throwing.** The handler is:

```js
async runBatch(fn) {
  try {
    const batch = this.db.batch();
    await fn(batch);
    await batch.commit();
  } catch (error) {
    void normalizeError(error);                    // ← result DISCARDED
    const detail = error instanceof Error ? error.message : String(error);
    throw new DatabaseError(`Batch write failed: ${detail}`, error);
  }
}
```

### Why the real cause is invisible — the full chain

1. The genuine Firestore message **is** captured, into `detail`, and carried on the
   `DatabaseError`.
2. `void normalizeError(error)` classifies it and **discards the result** — the same
   "pure classifier whose return value is thrown away" pattern that left server
   actions unobserved before.
3. `mapToHttpError` **scrubs every 5xx message in production**, keeping the real one
   in `internalMessage` **for recorders only**.
4. The recorders do not record Server Action failures — confirmed empirically above:
   `/admin/maintenance/server-errors` has nothing from any of the four attempts.

So the message that would name the bug exists at every step and reaches no one.

### Where to go next, in order

1. **Fix the observability gap first** (§2). It is a precondition for diagnosing this
   *and* for every future Server Action failure. Right now the system cannot tell you
   what broke.
2. Read the real `internalMessage` from Vercel's runtime logs for a bid attempt —
   that single string almost certainly names the fault outright.
3. Likely candidates once you can see it, in rough order of probability: an
   `undefined` field reaching a Firestore write (Firestore rejects `undefined`
   values outright, and a recently-added bid field that is not always populated
   would fail *every* bid exactly like this); a malformed document shape; or a
   failed precondition on one of the batched writes.

**Do not start at the quota dashboard, and do not re-audit the relative-require
bug — both are ruled out above.**

### 1b. The "not valid" error is a separate, smaller bug

On Shark Edge the modal **prefills ₹799** and its own helper text reads:

> "Any amount from ₹799.00 up is accepted — it need not be an exact multiple of the increment."

Submitting **₹799** is then rejected as invalid. A form that prefills a value its own
validator refuses is broken regardless of which rule was intended. This is also
exactly what the checklist case `first-bid-can-equal-starting-bid` asserts: on an
auction with no bids, the starting bid must itself be an acceptable opening bid.

## 2. The failure is recorded nowhere

Checked as admin immediately afterwards:

| Surface | Result |
|---|---|
| `/admin/maintenance/server-errors` | **9 of 9** rows, newest **14:33:18** — all `RSC_route` / "failed to pipe response" on `opengraph-image` routes. The bid failures at ~14:45 and ~14:51 are **absent**. |
| `/admin/maintenance/function-errors` | **0 of 0** |

This is the known observability gap regressing: `wrapAction` **catches and returns**
an envelope rather than throwing, so Next's `onRequestError` never fires for a
Server Action. `setActionErrorReporter` exists precisely to close that gap — it is
either unregistered or not writing. The audit that asserts these hooks stay
reachable should be re-run.

**Consequence:** a core feature failed in production and produced zero records in
the surface built for exactly that class of error. Nobody would learn about this
except from a user complaint.

## 3. Incidental finding, same page

All 9 server-error rows are OG-image generation failures on
`/[locale]/reviews/[id]/opengraph-image` and `/[locale]/categories/[slug]/opengraph-image`
("failed to pipe response"), spread across 13:14–14:33. Unrelated to bidding, but
it means social/link previews for reviews and categories are currently broken.

## What the tester run recorded

- `bid-increment-tiered` → **no**. Its increment half passes cleanly (real ₹200 tier,
  presets are multiples of it, ₹3,200 correctly rejected with an inline
  `role="alert"` reading "Bid must be at least ₹3,399.00"); the acceptance half
  fails for the reason above.
- Ten further bidding cases → **null**, blocked by this plus expired auction fixtures.
- One genuine positive: the failure copy is **plain English** with no file path,
  stack trace or module-resolution text leaking into the modal — which is the
  sibling admin case's claim, demonstrated by a real server failure.
