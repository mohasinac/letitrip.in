# Prune Backlog - Pending Only (letitrip.in)

This file now contains only open migration work. Completed items were removed after verification against the current workspace.

Last updated: April 13, 2026 (session committed: appkit 65caf03, letitrip afd3a4ad)
Verification basis: repository scan + targeted path and symbol checks.

Session note:
- `npx tsc --noEmit` passes in both `letitrip.in` and `appkit` on the committed state.
- Latest commits in this session: appkit `65caf03`, letitrip `afd3a4ad`.
- Pending task groups below remain the active migration scope.

---

## Pending Architectural Verdicts

### Verdict A - Listing Logic Consolidation

Status: partial

Open findings:
- `src/hooks/usePlaceBid.ts` still exists in letitrip.
- `src/hooks/useRealtimeBids.ts` still exists in letitrip.
- `src/features/products/hooks/useAuctions.ts` still targets `/api/products` (not appkit auction endpoint flow).
- `src/hooks/useAuctionDetail.ts` remains a local divergence point.

Required outcome:
- Auction/pre-order/listing behavior owned in appkit.
- letitrip reduced to config and thin adapters only.

### Verdict E - Semantic Wrapper Variant System

Status: in progress

Open findings:
- TG7 phase-2+ rollout is incomplete from a backlog/closure standpoint.
- Variant adoption and exception documentation still need a final closeout pass.

Required outcome:
- Repeated layout/class bundles replaced by approved appkit semantic variants.
- Remaining exceptions explicitly documented and justified.
- Accessibility gates captured and verified for final migration set.

### Verdict F - i18n and INR Currency Consistency

Status: reopened (partial)

Open findings:
- `src/lib/email.ts` still contains direct `Intl.NumberFormat("en-IN", ...)` usage.
- Currency rendering policy is not fully centralized for all money outputs.

Required outcome:
- Shared formatter ownership documented and consistently applied (or intentional exceptions documented).
- No unintended currency-format drift across UI and generated outputs.

---

## Pending Task Groups

## Task Group 3 - Listing Consolidation (Reopened)

Goal:
- Move reusable auction/pre-order/listing behavior fully into appkit.

Open tasks:
1. Replace local `usePlaceBid` and `useRealtimeBids` ownership with appkit ownership or thin app-level adapters.
2. Resolve endpoint divergence for `useAuctionDetail` and `useAuctions` (`/api/products` vs appkit auction-oriented flow).
3. Remove remaining local listing-rule ownership in letitrip after import rewiring.

Exit condition:
- No reusable listing business logic owned in letitrip.

## Task Group 7 - Semantic Wrapper Variant Expansion

Goal:
- Complete pending variant adoption and closeout documentation.

Open tasks:
1. Finish remaining phase-2/phase-3 migration slices.
2. Complete cross-repo replacement audit for matching class bundles.
3. Finalize exception log for intentional non-variant one-offs.
4. Confirm a11y acceptance gates for all newly adopted variants.

Exit condition:
- Matching repeated class bundles are migrated to appkit semantic variants, except explicitly documented exceptions.

## Task Group 8 - Currency Consistency Finalization (Reopened)

Goal:
- Ensure INR/currency formatting is consistently routed through shared ownership or clearly documented exceptions.

Open tasks:
1. Decide policy for transactional/generated outputs (including email formatting paths).
2. Migrate or document `src/lib/email.ts` currency formatting ownership.
3. Re-run symbol audit for currency formatting drift and update this backlog.

Exit condition:
- Currency formatting is consistently implemented and documented for all relevant output surfaces.

---

## Next Session Start Checklist

1. Re-verify Task Group 3 local listing hooks and endpoint divergence.
2. Continue Task Group 7 variant rollout from current in-progress phase.
3. Close Task Group 8 with explicit email/output formatting policy.
4. Update this file immediately after each meaningful change batch.
