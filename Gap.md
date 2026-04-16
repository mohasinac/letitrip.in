# Gap.md - Consolidated Architecture and Style Gap Master Plan

Last updated: 2026-04-17
Scope: letitrip.in (consumer) + appkit (source of truth)
Supersedes: architecturegap.md, styleandarchitec.md

## Intent
This file is the single authoritative gap-analysis, policy, and execution tracker.

Primary operating principle: measure twice, cut once.
That means every migration step must pass analysis and dependency checks before edits begin.

## Analysis-First Policy (Highest Priority)

### A1) Mandatory pre-change analysis gates
A change batch can start only when all gates are green:

1. Ownership gate
- Is the target reusable across >= 2 consumers?
- If yes, implementation must live in appkit.

2. Coupling gate
- Identify all imports/usages, including action -> repository -> schema -> seed chains.
- Confirm no hidden consumer-only dependency will break after extraction.

3. Configurability gate
- If behavior differs by market/app, require typed config/adapter extension points.
- No hardcoded market defaults in shared appkit logic.

4. Runtime boundary gate
- Confirm server/client boundary is valid (SSR-first, minimal 'use client').
- Confirm no browser API leakage into server views.

5. Validation gate
- Define exact checks before coding (typecheck, targeted smoke, and migration tracker update).

### A2) Analysis artifacts required per batch
Each batch must include:
- Dependency map (who calls target + what target calls)
- Reuse classification (shared vs local-only)
- Risk list (behavioral regressions, API breaks, SSR drift)
- Rollback plan (what to revert if validation fails)
- Exit criteria (objective done checks)

## Non-Negotiable Rules (Unified)

1. Appkit-first ownership for reusable logic.
2. Thin consumer in letitrip (routes, actions entrypoints, config, runtime wiring only).
3. No parallel implementations for same concept; merge with typed config in appkit.
4. SSR-first discipline; no client-only views unless unavoidable.
5. Shared UI uses appkit semantic wrappers.
6. No consumer re-export compatibility shims.
7. No consumer-owned shared hooks/repos/validators/schemas/shared UI.
8. No market hardcoding in appkit (INR/IN/+91/etc.) unless injected config.
9. Re-export elimination must be complete.
10. Validation gates required before phase closure.
11. Style contract required for appkit UI: sibling .style.css + direct import + stable class hooks.
12. Baseline default-with-override contract is mandatory:
- Every shared appkit API/component that accepts consumer-provided config/values must also define internal fallback defaults.
- If consumer value is missing, appkit must still behave correctly using baseline defaults.
- Baseline defaults must match current letitrip behavior unless intentionally versioned and documented.
- Consumer-provided values always override baseline defaults when present.

## Consolidated Gap Register (Current)

### Critical (P0)
1. Market-specific defaults in shared appkit layers.
- appkit/src/tokens/index.ts
- appkit/src/features/payments/schemas/index.ts
- appkit/src/features/wishlist/components/WishlistPage.tsx

2. Shared seed payloads still market-specific.
- appkit/src/seed/products-seed-data.ts
- appkit/src/seed/orders-seed-data.ts
- appkit/src/seed/addresses-seed-data.ts
- appkit/src/seed/users-seed-data.ts

3. Appkit full-page views too client-heavy versus SSR-first rule.
- appkit/src/features/*/components/*View.tsx (multi-file)

4. Missing baseline fallback discipline in value-consumption paths.
- Pattern: optional consumer values are accepted, but fallback behavior is inconsistent across modules.
- Risk: runtime behavior drift when letitrip config values are omitted or partially injected.

### High (P1)
4. letitrip action wrappers not uniformly thin.
- letitrip.in/src/actions/seller.actions.ts
- letitrip.in/src/actions/seller-coupon.actions.ts
- letitrip.in/src/actions/admin.actions.ts
- letitrip.in/src/actions/category.actions.ts
- letitrip.in/src/actions/review.actions.ts

5. Schema ownership split by compatibility fallbacks/barrels.
- letitrip.in/src/db/schema/index.ts
- letitrip.in/src/db/schema/field-names.ts

6. Functions runtime still has local repository layer.
- letitrip.in/functions/src/repositories/index.ts

7. Style contract not fully implemented in appkit UI.
- Missing sibling style files/imports across appkit/src/ui/components/** plus appkit/src/ui/DataTable.tsx and appkit/src/ui/rich-text/RichText.tsx

### Medium (P2)
8. Contact domain action symmetry gap.
- appkit/src/features/contact/email.ts
- appkit/src/features/contact/index.ts

9. Remaining re-export closure surfaces.
- Example historical residual: letitrip.in/src/app/global-error.tsx

## Appkit Mistake Inventory (Baseline Default Violations)

These are current high-confidence mistake locations where fallback behavior is hardcoded inconsistently or bypasses a single baseline config path.

1. Split baseline source (direct literals instead of one canonical baseline contract)
- appkit/src/tokens/index.ts
- appkit/src/utils/number.formatter.ts
- appkit/src/utils/date.formatter.ts
Issue:
- Defaults are repeated in multiple modules as literals (for example INR/en-IN) instead of flowing from one shared baseline resolver.

2. Local component-level fallbacks that do not use shared baseline resolver
- appkit/src/features/wishlist/components/WishlistPage.tsx
- appkit/src/features/cart/components/CartDrawer.tsx
- appkit/src/features/cart/columns/index.ts
- appkit/src/ui/components/PriceDisplay.tsx
Issue:
- Currency fallback is duplicated in component code paths, creating drift risk and inconsistent override behavior.

3. Payment defaults hardcoded in provider/schemas rather than baseline-config driven
- appkit/src/features/payments/schemas/index.ts
- appkit/src/providers/payment-razorpay/index.ts
Issue:
- Default currency is embedded as INR at schema/provider level with no single shared baseline fallback contract.

4. Locale fallback inconsistencies
- appkit/src/utils/date.formatter.ts
- appkit/src/features/blog/components/BlogListView.tsx
- appkit/src/features/blog/components/BlogPostView.tsx
- appkit/src/features/blog/components/BlogFeaturedCard.tsx
- appkit/src/features/reviews/components/ReviewsList.tsx
- appkit/src/features/reviews/components/ReviewModal.tsx
- appkit/src/features/orders/components/OrdersList.tsx
- appkit/src/features/stores/components/StoreAboutView.tsx
Issue:
- Some date-formatting paths use en-US directly, which can diverge from letitrip baseline default locale expectations.

5. Phone normalization/validation contains market-specific assumption without explicit baseline injection path
- appkit/src/validation/phone.validator.ts
Issue:
- Indian-specific logic exists, but it is not mediated through a typed market baseline contract.

## Appkit Code + Style Duplication Analysis (Huge Gap Pass)

Audit date: 2026-04-17
Scope: appkit only
Focus: duplicates, overlap, baseline extraction potential, variant-first simplification

### Snapshot findings

1. Exact duplicate files exist (safe-first cleanup)
- `appkit/src/features/admin/schemas/index.ts`
- `appkit/src/features/checkout/schemas/index.ts`
- `appkit/src/features/homepage/schemas/index.ts`
Finding:
- These are byte-identical schema barrel files and can be collapsed through a shared schema index helper pattern.

2. Near-duplicate feature surfaces exist (`account` vs `user`)
- Duplicate-named components exist in both feature trees:
	- `ProfileView.tsx`, `MessagesView.tsx`, `OrderDetailView.tsx`, `UserOrdersView.tsx`, `UserOffersView.tsx`, `UserAddressesView.tsx`, `UserNotificationsView.tsx`, `UserSettingsView.tsx`, `BecomeSellerView.tsx`
- Ownership pattern already favors `features/account` in appkit integration surfaces.
Finding:
- This is parallel concept ownership and must be merged into one canonical domain with variant/slot extension points.

3. View layer size suggests repeated composition patterns
- `*View.tsx` files in appkit: 96
Finding:
- Multiple role-based pages (admin/seller/account/store) likely repeat shell, header, table, filter, and card composition patterns that can be baseline templates with variants.

4. Column modules are highly repeated and should share formatter/render adapters
- Column modules discovered: 23
Finding:
- Currency, status, date, badge, and row-action renderers are repeated across domain column files and should move to shared column helper/render-kit modules.

5. Style architecture is partially duplicated
- Per-component style files: 45, plus centralized `appkit/src/ui/components/index.style.css`
Finding:
- Mixed styling ownership model (component-local and centralized) causes drift; variant-first primitives should replace repeated class bundles.

6. Repeated market and locale literals are still spread across modules
- Currency fallback patterns: repeated `INR` defaults across schemas/providers/components/hooks/columns.
- Locale formatting paths include mixed defaults (`en-IN`, `en-US`) in view/formatter layers.
Finding:
- Baseline resolver and formatter contracts are not single-source; this increases behavioral drift and duplicated fallback logic.

### Consolidation bias to apply

1. Prefer variants over complex config objects when the difference is visual/layout semantics.
2. Prefer typed adapters/contracts over ad-hoc callback soup when the difference is behavior or provider/runtime integration.
3. One canonical owner per concept in appkit; all other copies become wrappers or are deleted.
4. Keep consumer control strong: enable/disable features, replace providers, override labels/layout slots, and override behavior through typed extension points.

### Priority refactor chain (dependency-aware)

R1. Baseline market resolver (currency/locale/timezone/phone/country)
- Blocker for formatter/provider/schema dedupe.

R2. Shared formatter and rendering kit
- Consolidate money/date/status renderers for columns/cards/views.

R3. Column baseline kit
- Replace repeated inline render lambdas with shared typed column factories.

R4. Account/User domain merge
- Canonicalize account domain; remove parallel user domain implementation or reduce to strict compatibility wrapper.

R5. View-shell templates and role variants
- Extract shared screen scaffolds (title/filter/list/detail/empty/loading/error) into generic view shells with variants.

R6. UI variant uplift
- Convert repeated className bundles into named variants on appkit primitives.

R7. Style source-of-truth simplification
- Complete sibling style contract and retire central style duplication where component-local styles exist.

R8. Final duplicate sweep and shim removal
- Delete redundant files and ensure all imports target canonical owners.

## Dedupe Tracker (Code + Style)

| Refactor ID | Area | Scope | Status | Dependency | Risk | Notes |
|---|---|---|---|---|---|---|
| R1 | Baseline resolver | tokens/formatters/providers/validators | not started | none | High | Required before fallback cleanup |
| R2 | Render-format kit | utils + ui + feature render paths | not started | R1 | High | Prevents repeated money/date/status logic |
| R3 | Column kit | 23 feature column modules | not started | R2 | Medium | Replace repeated render lambdas |
| R4 | Account/User merge | features/account + features/user | not started | R1,R2 | High | Remove parallel concept ownership |
| R5 | View-shell variants | 96 view files | not started | R2,R4 | High | Extract reusable view composition skeletons |
| R6 | Variant-first UI uplift | repeated class bundles across feature UI | not started | R5 | Medium | Variants over complex config |
| R7 | Style contract completion | ui component style ownership | not started | R6 | Medium | Remove mixed centralized/local duplication |
| R8 | Final dedupe + shim purge | all duplicate/shim surfaces | not started | R1-R7 | High | Enforce canonical imports and ownership |

## Refactor Acceptance Rules (SOLID + Approved Patterns)

1. Single Responsibility:
- New baseline utilities must do one job (formatting, resolving defaults, or rendering helpers), not mixed concerns.

2. Open/Closed:
- Extend by adding variants/adapters, not by cloning files.

3. Liskov + Interface Segregation:
- Consumer override APIs must be typed and minimal per concern.

4. Dependency Inversion:
- Feature logic depends on contracts/adapters/providers, never concrete SDK wiring in views.

5. Variant-first policy:
- If mostly presentation difference, use named variants or slots.
- Do not create complex config schemas for purely visual variation.

6. Consumer control policy:
- Every major feature must support consumer enable/disable and override hooks via feature flags/config/providers.

## Dependency Chain (Analyze Before Execution)

The migration dependency chain must be executed from foundation to leaves:

1. Contracts and provider boundaries
2. Repository ownership and repository entrypoints
3. Schema constants and schema barrels
4. Validation and domain rules
5. Seed data factories and market override path
6. Server actions (must depend only on appkit contracts + thin auth/parse/call/return)
7. Hooks and client adapters
8. Shared UI and style contract
9. Feature views and SSR hardening
10. Re-export and compatibility shim elimination
11. Final verification and closure proof

Key rule:
Do not migrate UI layers before repository/schema/action dependencies are stable.

## Phased Execution Plan (Measure-Twice Version)

## Phase 0 - Baseline and risk model
Status: not started
Depends on: none
Deliverables:
- Fresh inventory snapshot of residual local/shared ownership.
- Dependency map for top 20 high-risk files.
- Regression risk matrix (API, runtime, SSR, styling).
Exit criteria:
- Agreed migration order and no unresolved dependency unknowns.

## Phase 1 - Market hardcoding removal in appkit
Status: not started
Depends on: Phase 0
Deliverables:
- Replace hardcoded market defaults with injected typed config.
- Keep letitrip baseline behavior as default profile.
- Introduce one canonical baseline resolver consumed by formatters/components/providers.
Exit criteria:
- No shared appkit market literals without config path.
- Missing consumer values still produce letitrip-equivalent behavior through baseline defaults.

## Phase 2 - Seed parameterization
Status: not started
Depends on: Phase 1
Deliverables:
- Seed factories accept market/context config.
- Verify deterministic output for letitrip baseline and alternate market.
Exit criteria:
- Seed domain uses configuration, not inlined market assumptions.

## Phase 3 - Repository and schema closure
Status: not started
Depends on: Phases 0-2
Deliverables:
- Canonical repository ownership in appkit.
- letitrip compatibility schema barrels retired.
- Functions repository ownership resolved by policy.
Exit criteria:
- No duplicate shared repository/schema ownership across repos.

## Phase 4 - Validation boundary cleanup
Status: not started
Depends on: Phase 3
Deliverables:
- Split reusable validators into appkit.
- Ensure action/api call chains consume appkit-owned validation surfaces.
Exit criteria:
- No shared validation logic trapped in consumer-owned modules.

## Phase 5 - Thin action-wrapper enforcement
Status: not started
Depends on: Phases 3-4
Deliverables:
- Actions reduced to auth/parse/call/return shape.
- Business logic moved into appkit services/repositories.
Exit criteria:
- Target action files pass thin-wrapper audit.

## Phase 6 - Hook parity and adapter hardening
Status: not started
Depends on: Phase 5
Deliverables:
- Hook signatures and behavior parity confirmed.
- App-specific wiring converted into typed extension points.
Exit criteria:
- No reusable hook logic remains local-only without ownership reason.

## Phase 7 - UI style contract and SSR hardening
Status: not started
Depends on: Phases 5-6
Deliverables:
- appkit UI sibling .style.css contract complete.
- View-layer SSR-first compliance re-audited and corrected.
Exit criteria:
- Style contract complete, client-only usage justified, SSR drift resolved.

## Phase 8 - Re-export elimination and closure
Status: not started
Depends on: all prior phases
Deliverables:
- Remaining shims removed.
- Canonical direct imports applied everywhere.
- Final architecture-fit proof package.
Exit criteria:
- Zero undocumented shims and all closure gates passed.

## Detailed Tracker Template (Use per batch)

Use this table for active execution. Keep one row per delivery batch.

| Batch ID | Phase | Scope (files/modules) | Dependency prereqs verified | Analysis complete | Implemented | Validated | Tracker updated | Risk level | Notes |
|---|---|---|---|---|---|---|---|---|---|
| B00 | 0 | Baseline inventory + dependency map | N/A | No | No | No | No | High | Start here |

Definition of statuses:
- Dependency prereqs verified: Yes only after import/use-chain review is written.
- Analysis complete: Yes only after ownership/config/runtime/validation gates all pass.
- Implemented: Yes only after edits + caller rewires + local cleanup are done.
- Validated: Yes only after typecheck and required smoke checks pass.
- Tracker updated: Yes only after this file and migration tracker reflect final state.

## Dependency Checklist (Per File/Module)

1. Upstream callers identified.
2. Downstream dependencies identified.
3. Runtime boundary identified (server/client).
4. Market/config assumptions identified.
5. Ownership target decided (appkit vs local permanent).
6. Canonical import path decided.
7. Rollback path documented.
8. Baseline fallback default documented (must match letitrip behavior if consumer value is missing).

No coding starts until checklist is fully complete.

## Reusable Prompt (for future migration sessions)

Copy/paste prompt:

"""
Use Gap.md as the single source of truth. Operate in analysis-first mode with measure-twice discipline.

Task:
1) Select the next not-started phase and one coherent batch.
2) Produce a dependency map first (callers, callees, runtime boundaries, market assumptions).
3) Verify ownership/configurability/SSR/validation gates.
3.1) Verify baseline fallback defaults exist for every optional consumer-injected value path.
4) Only then implement migration in appkit-first direction.
5) Keep letitrip thin (route/action entrypoints/config/runtime wiring only).
6) Remove duplicate/shim surfaces and rewire to canonical direct imports.
7) Run validation checks and report exact outcomes.
8) Update Gap.md tracker row(s) with precise status and residual risks.

Output format required:
- Analysis summary
- Dependency chain proof
- Implementation diff summary
- Validation results
- Tracker updates
- Next safest batch recommendation
"""

## Definition of Done (Architecture-fit complete)

1. Reusable behavior owned by appkit and independent of consumer paths.
2. Consumer differences injected through typed extension points.
3. No hardcoded market defaults in shared layers without config.
4. letitrip wrappers remain thin and entrypoint-only.
5. No undocumented shim/re-export compatibility files.
6. Style contract complete for appkit UI files.
7. Required validation gates pass and tracker state is current.
8. Every optional consumer-injected value path has appkit-side fallback defaults matching letitrip baseline behavior.
