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

_(root cause · files touched · sweep result · verified live — appended as each lands)_

---

## Tests run

_(batches worked, yes/no/null, delta vs baseline — appended in step 5)_

---

## Still failing

_(ids + why, at cycle close)_

---

## Residue

_(data left behind, fixture gaps opened)_
