# Rig notes — run `full0911`

Things that affect how a verdict should be READ, kept beside the run rather than
in a commit message. Phase 3 triage should read this before believing a `null`.

---

## Fixed mid-run

### `offers` and five more collections were never seeded (Root Cause #90)

`appkit-seed`'s `COLLECTION_MAP` never contained them, so Firestore held **zero**
documents in every run this project has done. Fixed and seeded 2026-09-11:

| collection | docs | batches affected |
|---|---|---|
| offers | 10 | 8 |
| supportTickets | 8 | 8 |
| catalogueItems | 6 | 4 |
| procurementShipments / shipmentLots / shipmentItems | 23 | 3 |

**Only `buying/offers--p4` had already run**; it was released and re-queued. No
other affected batch had started, so no verdict was lost.

### Time-bound auction fixtures had already expired

`auction-tester-sandbox-cycle-1` — the most-cited fixture at **46 citations** —
had ended 15 minutes before it was noticed, with its batches still hours down the
queue. cycle-2 and cycle-3 were 45 and 105 minutes from ending. Extended to +72h,
and `verify-fixture-lifetimes.mjs` now runs automatically at pool startup.

**Any `buying/bidding*` verdict recorded BEFORE this fix should be re-run**, not
believed. None was, but the ordering is worth stating.

---

## Known limitation — one case cannot pass as written

**`money-flows/auction-win-to-payment`** → *"Placing the highest bid on a closing
auction records you as the winner"*, whose last step is *"Wait past the auction
end time, reloading the page."*

It cites `auction-tester-sandbox-cycle-1`, which 46 other citations need **live**.
One fixture, two contradictory requirements. Extending served 21 of the 22 cases;
this one will record `null` or fail on its final step.

**This is a fixture-design problem, not a product defect.** The fix is a per-batch
manifest for `money-flows` minting an auction that ends ~2 minutes out, so the
case can watch it close without any global fixture having to be short-lived. Do
not "fix" the auction-win code on the strength of this case failing.

---

## Verdicts that need a second look before triage

### `admin/bug-hunter-rewards` — 0 pass / 0 fail / 5 blocked

Both calibration controls answered correctly, so the batch is trustworthy. Two
separate causes, and they want different responses:

1. **`testerChecklistResponses` is empty.** Expected: it is DERIVED tier and is
   wiped at setup, so on a fresh run there are genuinely no submissions to
   confirm. Three cases depend on one existing. **Not a defect** — these cases
   need a seeded response fixture, which does not exist yet.

2. **The tester reported the demo fixtures "do not exist in the catalog".**
   Verified against Firestore: **both exist and are correct** —
   `…-demo-fixture` (`isActive:false`) and `…-demo-fixture-v2` (`isActive:true`).
   So this is either the admin catalog failing to surface them or its search
   failing to match, and it is a **product** question for Phase 3, not a data gap.
   The tester searched "reported bug" with Status=All across 48 pages.

3. **`checklist-admin-bug-hunter-rewards-demo-fixture-v2` was handed to the
   tester as a case.** It is a seed-only reference fixture with no steps and
   nothing to assert; the tester correctly answered `null` saying so. Batching a
   seed-only fixture wastes a case slot and inflates the blocked count. Rig fix:
   `fetch-cases.mjs` should exclude items that carry no `steps`, rather than
   relying on the tester to notice.

---

## Watch item — a batch can run out before it records anything

`admin/bulk-actions` (10 cases, 16KB) ran **159 turns**, ended with
`result: success`, and recorded **nothing**. The transcript shows it doing real
work to the end — its last words are *"Verdict for this case: **no** — the
selection silently carries over hidden rows into the new filter view"* — so
roughly 18 minutes of genuine testing was discarded.

**Why it cannot partially save.** `validateBatch` requires a verdict for *every*
case in the batch; a missing one is a hard `no verdict returned` rejection. And
`record-verdicts.mjs` overwrites rather than merges (it preserves only
`quarantineHistory`). So the skill's single call at the end is not a style
choice — it is the only shape the tool accepts, and an early-ended session
therefore keeps nothing.

**Not being engineered around on n=1.** The retry fired automatically and the
attempt ledger allows 3, so the cost is wall clock rather than lost correctness.

**What would change that judgement:** several batches failing the same way,
especially the larger ones. Sizing is not the obvious culprit — the failed batch
was 10 cases against a max of 12 and a median of 5, and 12-case batches have
completed — but 8 batches sit at the 12 cap and are the ones to watch.

If it recurs, the fix is a `--partial` mode that records the verdicts a session
did reach while leaving the batch marked incomplete, so the retry resumes rather
than restarting. Note that mode must also handle the control check: a partial
record whose calibration controls are not yet answered must not be treated as
having failed them.
