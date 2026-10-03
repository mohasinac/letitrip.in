# Launch status — measured, not estimated

**As of 2026-10-03/04.** Every row below was driven against **production**
(`https://www.letitrip.in`) as a real signed-in identity, not inferred from
source. Where something is unverified it says so; where a number is quoted the
command that produced it is named.

🛑 **Nothing in this file is hand-counted.** Verdict totals come from
`node scripts/test-run-status.mjs` and `node scripts/test-run-table.mjs`, both
of which recompute from `tester/.tester-runs/*/verdicts/`. If you edit a count
here by hand you have broken the one rule this project keeps relearning.

---

## The question: can we launch?

**The core money path works.** It did not, eight hours ago, and the defect that
blocked it was not visible from source, from `npm run check`, or from a build —
only from placing a real order.

**Three things should be fixed first**, both found by driving the same path. One freezes a buyer's cart permanently; one stops sellers creating listings
from the quick-add form; the third makes every cart and checkout error
invisible. Neither is speculative — both were reproduced on production and
are written up with root causes in `tester/.tester-runs/run-4/fixes.jsonl`.

---

## Verified end-to-end on production

One complete order, driven buyer → admin → seller:

| Stage | Evidence |
|---|---|
| Guest browses home / categories / brand / store / product | h1 + 8 sections + 9 cards; 21 cards on `/brands/brand-beyblade`; 12 on the store |
| Guest price gating | **0** rupee amounts pre-hydration, after hydration, and after reload; 28 "Sign in to see price" |
| Search actually filters | `dranzer` → 1 card, `zzzznope` → 0 + "No products found" |
| Buyer saves an address | PIN 560001 → Bangalore / Karnataka; 452001 → Indore / Madhya Pradesh |
| Checkout, 3 steps | address → extras (seller named, 3 add-ons) → payment |
| Order placed | `order-1-20261003-8mgydl`, HTTP 200, total 2,999 |
| Payment proof | uploaded to Storage, order records `paymentProofUrl` + UTR, **survives reload** |
| Admin review | proof image, UTR, expected-vs-reported UPI with mismatch warning |
| Admin verifies | `paymentStatus: paid` · `status: processing` · `reviewOutcome: approved` |
| Seller sees it | top of `/store/orders`, paid, ₹3,097.80 |

Receipt reconciles exactly: 2,999 + 77 shipping + 10 platform + 1.80 tax + 10
WhatsApp = **3,097.80**, and that same figure appeared on all three checkout
steps and the final order.

---

## Fixed this session

### Multi-lane carts could not be checked out at all — `appkit 4.42.15`

```
POST /api/checkout → 400 CHECKOUT_LANE_BLOCKED
"Settle your 1 won auction first"      ← for the lane being settled
```

Both placement paths fell back to the whole cart as their own "selected" set, so
`assertCheckoutLane` compared `cart.items` against `cart.items`' own active lane,
every off-lane line counted as a violation, and the throw was unconditional.

`previewCheckoutPricing` already scoped correctly (`lane ?? activeLane`) — which
is exactly why the UI was coherent through all three steps and **only the final
POST failed**. Preview and placement resolved the item set by two different
rules. `defaultCheckoutItems()` is now the one rule both use.

**Not an edge case:** `auctionSettlement` pushes a won auction into the cart
whatever is already in it, and `assertCanAddNewItems` only blocks *adding*, never
clears. So any buyer with anything in their cart when they won an auction was
locked out of checkout entirely. PhonePe carried the same defect hard-coded,
with a comment asserting it was correct.

### Also shipped

- **`appkit 4.42.13`** — ten `store-extensions` collections registered in **both**
  seeder maps. The tier held **zero documents in every run ever**.
- **`appkit 4.42.15`** — `/admin/stores` rows now show Verified / Featured. The
  API always returned them; only the list never rendered them. The Root Cause #38
  *data-loss* half is genuinely closed — verified in source before changing
  anything, and the earlier verdict inferring an active wipe was wrong.
- Firestore + Storage + RTDB rules, composite indexes, all Functions on a rebuilt
  bundle, 1,997 seed docs, Vercel deploy with smoke + SEO green.
- **Deleted an orphaned `payoutBatch` Cloud Function** — present in the project,
  in no registry, absent from the built bundle, and **running removed code on a
  schedule**.

---

## Open — fix before launch

### 1. A locked cart line whose offer is gone freezes the cart permanently 🛑

Three guards disagree about one fact and trap the buyer between them:

| Action | Result |
|---|---|
| Check out | 400 — *"The offer for one of your items no longer exists. **Remove it and try again**."* |
| Remove it | 400 — *"This item requires payment and cannot be removed or modified."* |
| Add anything else | 400 — *"Complete your accepted offer first"* |

The error prescribes the one action the system forbids, and the cart page renders
**zero** remove controls. Measured live: three real standard items the buyer
cannot buy, behind one line they cannot clear.

**Fix:** `assertLockedLinesStillValid` has already established the referenced
record is missing — at that point the lock protects nothing. Allow removal, or
prune the line on read.

### 2. Every cart / checkout 400 is silent

Three observed today, each with a clear, user-safe server message and **0
`[role=alert]`, 0 `[role=status]`**, and no occurrence of the message anywhere in
the DOM. The buyer clicks and the button appears dead.

**Fix:** pipe through `toUserMessage(code, t)` into a toast or inline error, per
Rule #9's server-error path. Never fall back to the raw server message
(Root Cause #86).

### 3. A seller cannot create a listing from the quick-add form 🛑

On `/store/products/new` the required product image **never registers**. The
upload shows a progress indicator reaching 50%, clears, and the field still
reads *"Product image is required"* — so Publish is refused forever.

Everything else on that form works: title, description, price, stock, and the
category picker resolving the leaf `Beyblade X Tops`.

**Decisive evidence:** across the whole session there is **not one** request to
`/api/media/sign`, `/api/media/finalize` or `storage.googleapis.com`. The
documented sign → PUT → finalize flow never runs; two `POST /store/products/new`
Server Actions returned 200 instead. The percentage implies XHR (`fetch` cannot
report upload progress) and a `fetch` interceptor captured nothing.

**The working reference is in the same codebase**: the payment-proof uploader on
`/user/orders/{id}/payment` performs the full chain correctly against the same
bucket — I drove it successfully an hour earlier.

🛑 **Scope, stated precisely:** this is the **quick-add** form. The
*"Show all fields (advanced)"* path was **not** tested, and nor was editing an
existing listing's images. Do not read this as "image upload is broken
everywhere" — it is one form, and the one most sellers will use.

### 4. Minor — `Submit Proof` enables on the fraud checkbox alone

Clicking it with `buyerMarkedPaid` unticked fires nothing and writes nothing,
while the upload itself has already succeeded — so the page looks right and the
order keeps `paymentProofUrl: null`.

---

## Unverified — known gaps

- **Digital-code delivery.** Root Cause #103 records that the pool had **no
  writer**, so every such purchase delivered nothing. Fixed on disk, **never
  driven live**. This is the biggest remaining unknown on the money path.
- **Standard-product purchase as its own path.** The order proven above was an
  **auction-win** lane. The checkout machinery is shared, but a plain
  add-to-cart → buy has not been completed end to end, because the frozen cart
  above blocked it.
- **Razorpay.** Gated behind `siteSettings.payment.razorpayEnabled`, default
  false. Manual UPI/Cash and COD are what buyers get today, and both render.

---

## Testing position

Run 3 finished: **255/255 batches, 1,337 of 1,847 cases — 465 pass / 203 fail /
669 null**. Run 4 re-drives the failures plus every case sharing their page
(772 cases, 127 batches); **4 are recorded**, 123 outstanding.

Two corrections worth carrying, because both changed what the backlog *is*:

1. **203 failures are not 203 defects.** On the core happy-path slice **6 of 7
   were already fixed and never re-driven**. Only 12% carry prediction language.
2. **669 nulls are mostly capability gaps**, and most capabilities already exist
   — 48 were refused for needing a "human channel" that is mostly email, which
   `tester/scripts/check-inbox.mjs` can already read.

### 🛑 Read this before trusting any single finding of mine

I nearly recorded **six** false defects today — the checkout address card, the
admin Delete menu, seller order rows, `/admin/sections` controls, the admin
Verify Payment button, and a wrong state on an address. Every one was my own
selector or procedure, and every one was caught only by re-driving before
recording.

The rule that saved them is Rule #4, and it is the cheapest rule in this repo:
**re-drive a "this whole thing is broken" reading from a fresh navigation before
believing it.**

---

## Where the detail lives

| | |
|---|---|
| Per-case verdicts + the generated table | `docs/TEST-RUN-3.md` (regenerate: `node scripts/test-run-table.mjs`) |
| Queued fixes with root causes | `tester/.tester-runs/run-4/fixes.jsonl` |
| Noticed-but-not-chased observations | `docs/TEST-RUN-3-OUTOFSCOPE.md` |
| Live counts | `node scripts/test-run-status.mjs` |
| Resume testing | set `active: true` in `tester/.tester-runs/loop-state.json` |
