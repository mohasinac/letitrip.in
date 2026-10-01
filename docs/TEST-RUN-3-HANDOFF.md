# Test Run 3 — handoff at batch 103

Written 2026-10-01 when the working session ran out of context. **Nothing is lost**:
every count below is recomputed from the verdict files on disk by
`node scripts/test-run-status.mjs`, never typed.

## Resume

```
node scripts/test-run-inflight.mjs --check     # must say "nothing in flight"
node scripts/test-run-preflight.mjs
# then the next batch the loop names: buying/buying-checkout--p2
```

Re-enable the loop by setting `active: true` in `tester/.tester-runs/loop-state.json`.

## State

103/255 batches · 442/1847 cases · pass 186 · fail 63 · null 193 · fixed 25 ·
deferred 29 · open 9.

`lastFixAtRecorded = 100`, `lastDeployAtRecorded = 100` — the batch-100 fix phase is
complete and **appkit 4.42.5 is deployed** (smoke + SEO verified).

## 🛑 Do this FIRST on the checkout page (batches 103–10x)

**Clear the buyer's cart before the first case.** All 12 cases per page add to cart and
then assert an *absolute* quantity or subtotal; none clears it. The seeded cart already
holds 3 lines under Beyblade Arena (Valkyrie ×2, Dranzer S, X App Starter Pack Code —
₹4,695.00 + ₹77.00 shipping), which made `add-to-cart`'s expected 1 / ₹999 unmeasurable
(observed 3 / ₹2,997 — correct arithmetic, wrong precondition). `carts` is CASCADE-tier
and freely mutable. See the OUTOFSCOPE entry.

Already confirmed on this page: **add-to-cart works**, **the sold-out block works**.
Untested: the three-step checkout, GST, the OTP threshold, the multi-seller split.

## The worst open defect

**`/admin/site` renders no editable fields on any tab.** `<main>` is 530–534 chars —
tab `<select>`, tab name, "Save all changes" — and the only input in `<main>` *is* the
tab select. A React **#418 hydration mismatch** fires on every load. Routing is fine
(`?tab=fees`→Fees, nonsense/empty→branding, 20 options). No site setting can be edited
in production. Next step: reproduce locally, read the un-minified #418.

## Partially fixed, needs finishing

**Admin bundle creation.** The symmetric `dynamicRule`/`productIds` fix shipped and
halved the failure (two "required" errors → one), but creation is still blocked by a
basics-section error: a price field showing `1000` reports "This field is required".
`zodErrorMap` emits that text only for `invalid_type` on undefined/null, so a populated
key is missing from the parsed object. Next step: instrument what `SectionForm` hands
`safeParse` for that section — `priceRupees` is its only non-string-typed control.
The cross-store guard the case exists to test is still unreachable.

## Harness issues blocking real coverage

1. **`session-seller.json` is not `tyson@beybladearena.in`.** It's a seeded seller whose
   catalogue is prize draws, so every seller case naming a Beyblade product slug is
   unrunnable. Nearly produced a false "the picker is broken" finding.
2. **Seeded display names collide** — admin and the seller both render "Mock User 1", so
   the account name can't identify the identity.
3. **PRESERVE-tier recovery is better than recorded**: a targeted
   `npx appkit-seed load --collections users` *restored* a display name an earlier run had
   overwritten. That works for seeded uids; it does **not** extend to `addresses`, where a
   created row has no seeded counterpart and `load` cannot delete.

## Backlog that needs its own pass

**70 headings in `docs/TEST-RUN-3-OUTOFSCOPE.md`** and **4 `state.fixQueue` entries**.
The hook's fix phase asks for a per-entry decision (promote to a gap case, or leave
standing) and that has never been done — it is now the largest risk to this run ending
with findings anyone acts on.
