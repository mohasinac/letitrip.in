# Prune Backlog - Pending Only (letitrip.in)

This file now contains only open migration work. Completed items were removed after verification against the current workspace.

Last updated: April 13, 2026 — committed `aa809ced` (batch E + complete decision ledger)
Verification basis: repository scan + targeted path and symbol checks.

Session note:
- `npx tsc --noEmit` passes in `letitrip.in` (pre-commit hook verified on commit).
- Latest commits: appkit `65caf03`, letitrip `aa809ced`.
- This session completed: TG11 wave-1 hook batches A/B/C/D/E; complete 28-basename decision ledger written (TG11 task 1 DONE).

Prune file integrity note (session):
- exists: yes (`prune.md` present)
- modified or committed state: committed code batch `4d0e2e8b`; tracker now updated post-commit
- deletion check result: no prune deletion in git history (modifications only)

Index comparison note (current generated indexes):
- `letitrip.in/index.md` and `appkit/index.md` are now generated via `scripts/get-index.js` and include internal + exported symbol inventories.
- Source-only overlap snapshot from generated indexes:
	- letitrip src files indexed: 1050
	- appkit src files indexed: 781
	- basename overlap (`src/**`): 213
	- exact relative path overlap (`src/**`): 184
	- admin `*View.tsx` overlap: 22
	- hook basename overlap (`use*.ts*`): 28
- Prune history check: `prune.md` was not deleted in letitrip git history (modifications only).

---

## Pending Architectural Verdicts

### Verdict A - Listing Logic Consolidation

Status: partial (progressed)

Open findings:
- ~~`src/hooks/usePlaceBid.ts` still exists in letitrip.~~ DELETED — consumers import from `@mohasinac/appkit/features/auctions`.
- ~~`src/hooks/useRealtimeBids.ts` still exists in letitrip.~~ DELETED — consumers import from `@mohasinac/appkit/features/auctions`.
- `src/features/products/hooks/useAuctions.ts` still targets `/api/products` (not appkit's `/api/auctions`). Consumer adapter — stays until API endpoints are unified.
- `src/hooks/useAuctionDetail.ts` uses `FirebaseSieveResult<PublicBid>` and `/api/products/{id}` + `/api/bids` — app-specific adapter. Stays until API endpoints are unified.

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

Status: CLOSED

Verified state:
- No `Intl.NumberFormat` calls remain in `src/`. All currency formatting routes through `formatCurrency` from `@mohasinac/appkit/utils`, either directly (email.ts) or via the letitrip utils barrel (`@/utils`).
- Policy: all money output uses appkit's `formatCurrency(amount, currency, locale)`. Currency code and locale are passed from letitrip config/data, not hard-coded in appkit.
- The `@/utils` barrel re-exports `formatCurrency` from appkit — this is acceptable as `@/utils/index.ts` also contains app-specific helpers and is not a pure re-export shim.

Required outcome:
- Shared formatter ownership documented and consistently applied (or intentional exceptions documented).
- No unintended currency-format drift across UI and generated outputs.

---

## Pending Task Groups

## Task Group 3 - Listing Consolidation (Partially Complete)

Goal:
- Move reusable auction/pre-order/listing behavior fully into appkit.

Completed:
1. ~~Replace local `usePlaceBid` and `useRealtimeBids` ownership with appkit ownership.~~ DONE — files deleted, consumers import from `@mohasinac/appkit/features/auctions`.

Blocked (endpoint divergence — needs API unification before resolution):
2. `src/features/products/hooks/useAuctions.ts`: hits `/api/products`; appkit hits `/api/auctions`. Stays as consumer adapter until `/api/auctions` route exists in letitrip.
3. `src/hooks/useAuctionDetail.ts`: hits `/api/products/{id}` + `/api/bids?productId={id}`. Uses `FirebaseSieveResult<PublicBid>`. Stays as consumer adapter until API is unified and appkit has equivalent detail hook.

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

## Task Group 8 - Currency Consistency Finalization — CLOSED

Verified: No `Intl.NumberFormat` calls in `letitrip.in/src/`. All money output uses `formatCurrency` from `@mohasinac/appkit/utils`. Policy documented in Verdict F above.

## Task Group 11 - Index-Driven Overlap Consolidation (New)

Goal:
- Use generated index overlap data to eliminate parallel ownership and enforce appkit-first implementation ownership.

Evidence (from current generated indexes):
1. 213 basename overlaps under `src/**` between letitrip and appkit.
2. 184 exact relative path overlaps under `src/**`.
3. 22 overlapping admin `*View.tsx` basenames.
4. 28 overlapping hook basenames (`use*.ts*`).

Priority overlap clusters:
1. Admin views with identical basenames (e.g., `AdminAnalyticsView.tsx`, `AdminOrdersView.tsx`, `AdminProductsView.tsx`, `AdminReviewsView.tsx`, `AdminSectionsView.tsx`).
2. Hooks where letitrip still owns local implementations while appkit already has feature hooks (e.g., `usePlaceBid.ts`, `useRealtimeBids.ts`, `useCheckout.ts`, `useAuth.ts`, `useAuctions.ts`).
3. Shared feature/page views with exact-path overlap where letitrip should be reduced to thin adapters.

Open tasks:
1. Build an overlap decision ledger from generated index rows with per-basename classification:
	- move fully to appkit
	- keep letitrip as config-only adapter
	- keep letitrip as consumer-only exception (must be explicitly justified)
2. Execute first migration wave on hooks overlap (28 basenames), starting with listing/auction/cart/auth hooks.
3. Execute second migration wave on admin `*View.tsx` overlap (22 basenames), preserving only consumer-only state wiring.
4. Track each migrated basename with import rewiring and deletion status in this file after each batch.

Wave-1 progress log (hooks overlap):
- 2026-04-13 batch A (FAQ hooks):
	- basename: `useFaqList`
	- classification: move fully to appkit
	- rewiring: homepage FAQ section now imports `useFaqList` directly from `@mohasinac/appkit/features/faq`
	- deletion: removed local shim files `src/features/faq/hooks/useFaqList.ts` and `src/features/faq/hooks/index.ts`
	- local feature barrel update: removed `export * from "./hooks"` from `src/features/faq/index.ts`
	- status: completed
- 2026-04-13 batch B (stores detail hooks):
	- basenames: `useStoreBySlug`, `useStoreProducts`, `useStoreAuctions`, `useStoreReviews`
	- classification: move fully to appkit
	- rewiring: store feature components now import these hooks directly from `@mohasinac/appkit/features/stores`
	- deletion: removed local shim file `src/features/stores/hooks/useStoreBySlug.ts`
	- local hooks barrel update: removed `export * from "./useStoreBySlug"` from `src/features/stores/hooks/index.ts`
	- status: completed
- 2026-04-13 batch C (cart order hook):
	- basename: `useOrder` (cart feature hook wrapper)
	- classification: move fully to appkit
	- rewiring: checkout success view now imports `useOrder` directly from `@mohasinac/appkit/features/cart` with inline endpoint/queryKey options
	- deletion: removed local wrapper `src/features/cart/hooks/useOrder.ts`
	- local hooks barrel update: removed `export { useOrder } from "./useOrder"` from `src/features/cart/hooks/index.ts`
	- status: completed
- 2026-04-13 batch D (wishlist unused hook + productDetail duplicate):
	- basenames: `useWishlist` (local, no consumers), `useProductDetail` (exact duplicate of appkit export)
	- classification: move fully to appkit (both)
	- rewiring for useWishlist: no component consumers found — only barrel export; removed without rewiring
	- rewiring for useProductDetail: `ProductDetailView.tsx` and `PreOrderDetailView.tsx` now import directly from `@mohasinac/appkit/features/products`
	- deletions: `src/features/wishlist/hooks/useWishlist.ts`, `src/features/wishlist/hooks/index.ts`, `src/features/products/hooks/useProductDetail.ts`
	- barrel updates: removed `export * from "./hooks"` from `src/features/wishlist/index.ts`; removed `useProductDetail` export from `src/features/products/hooks/index.ts`
	- status: completed
- 2026-04-13 batch E (copilot orphaned hook + types):
	- basenames: `useCopilotChat` (local, no consumers — letitrip AdminCopilotView delegates to appkit directly)
	- classification: move fully to appkit (orphaned)
	- rewiring: none needed — letitrip `AdminCopilotView` already wraps `AppkitAdminCopilotView` with `endpoint` + i18n labels; appkit's own `useCopilotChat` is used internally
	- deletions: `src/features/copilot/hooks/useCopilotChat.ts`, `src/features/copilot/types/index.ts` (dir removed), `src/features/copilot/types/` (empty dir)
	- barrel updates: removed `useCopilotChat` export from `src/features/copilot/hooks/index.ts`; removed `export * from "./types"` from `src/features/copilot/index.ts`
	- status: completed

Overlap decision ledger (complete — all 28 basenames classified):
- `useFaqList` -> move fully to appkit (completed)
- `useStoreBySlug` -> move fully to appkit (completed)
- `useStoreProducts` -> move fully to appkit (completed)
- `useStoreAuctions` -> move fully to appkit (completed)
- `useStoreReviews` -> move fully to appkit (completed)
- `useOrder` (cart) -> move fully to appkit (completed)
- `useWishlist` (local hook) -> move fully to appkit (completed — no consumers, deleted)
- `useProductDetail` -> move fully to appkit (completed — exact duplicate removed)
- `useCopilotChat` -> move fully to appkit (completed — local hook orphaned, letitrip already delegates to appkit AdminCopilotView)
- `useAuctions` -> keep letitrip as consumer adapter (endpoint divergence: hits letitrip `/api/products`, appkit hits `/api/auctions`; stays until API is unified)
- `useAuctionDetail` -> keep letitrip as consumer-only exception (uses `FirebaseSieveResult<PublicBid>`, hits `/api/products/{id}` + `/api/bids`; stays until API/detail-hook parity available)
- `useCheckout` -> keep letitrip as consumer-only exception (local API orchestration differs from appkit checkout state hook)
- `useAuth` -> keep letitrip as consumer-only exception (local auth/session bridge and route wiring differ from appkit `useCurrentUser` scope)
- `useUnsavedChanges` -> keep letitrip as consumer adapter (wires appkit hook to letitrip's `eventBus` for in-app confirmation modal)
- `useUrlTable` -> keep letitrip as consumer adapter (locale-aware next-intl router injection on top of appkit's `useUrlTable`)
- `useEvents` -> keep letitrip as consumer adapter (admin endpoint: hits `/api/admin/events`; appkit hits `/api/events`)
- `useEvent` -> keep letitrip as consumer adapter (admin endpoint: hits `/api/admin/events/${id}`; appkit hits `/api/events/${slug}`)
- `useProducts` -> keep letitrip as consumer adapter (URL param string-parsing layer over appkit's `useFeatureProducts`)
- `usePreOrders` -> keep letitrip as consumer adapter (hits letitrip `/api/products?type=pre-order`; appkit hits `/api/pre-orders`)
- `useSellerStore` -> keep letitrip as consumer adapter (uses `createStoreAction` / `updateStoreAction` server actions and `useAuth` guard — consumer-specific wiring)
- `useSellerPayouts` -> keep letitrip as consumer adapter (uses `requestPayoutAction` server action and auth guard — consumer-specific)
- `useSellerAnalytics` -> keep letitrip as consumer adapter (uses `useAuth` + `hasAnyRole` — consumer-specific auth gate)
- `useReviews` -> keep letitrip as consumer adapter (uses local `ReviewDocument` from db schema; different API shape from appkit's review hooks)
- `useCopilotFeedback` -> letitrip-only (no appkit counterpart; calls letitrip-specific `API_ENDPOINTS.COPILOT.FEEDBACK`)
- `useStores` -> keep letitrip as consumer adapter (URL table state + local store-listing types not yet in appkit)
- `useCart` -> keep letitrip (cart state hook uses letitrip cart API wiring; distinct from appkit's `useCartQuery`)
- `useWishlistToggle` -> letitrip-only (toggle convenience wrapper specific to letitrip's wishlist implementation)
- `useAdmin` -> keep letitrip (admin state hook with letitrip-specific role/permission model)

Task 1 exit condition: COMPLETE — every overlapping hook basename classified in ledger. No reusable duplicate remains untracked.

Exit condition:
- Every overlapping basename in generated indexes is classified, and no reusable duplicate remains untracked.

## Task Group 12 - Index and Prune Governance (New)

Goal:
- Keep migration decisions reproducible across sessions using generated indexes and prune history discipline.

Open tasks:
1. Require `npm run index:generate` in both repos before each overlap-audit batch.
2. Record overlap metrics deltas in `prune.md` after each migration batch (counts down trend).
3. Maintain a short "prune file integrity" note each session:
	- exists
	- modified/committed state
	- deletion check result
4. Keep `prune.md` as pending-only backlog while retaining evidence snapshots needed for handoff continuity.

Exit condition:
- Overlap audits and prune updates are index-driven, repeatable, and session-resumable without chat history.

---

## Next Session Start Checklist

1. Re-verify Task Group 3 local listing hooks and endpoint divergence.
2. Continue Task Group 7 variant rollout from current in-progress phase.
3. Close Task Group 8 with explicit email/output formatting policy.
4. Generate both indexes (`npm run index:generate`) and refresh overlap metrics.
5. Start Task Group 11 wave-1 on hook overlaps and record decisions per basename.
6. Update this file immediately after each meaningful change batch.
