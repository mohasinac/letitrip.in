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

13. Reuse-first composition:
- Before building any new component, hook, utility, layout, or view, search appkit for a semantically equivalent piece first.
- If one exists, compose or extend it (add a variant/prop/slot) — do not build a parallel implementation.
- New files are only justified when the concept has no prior owner in appkit and is genuinely distinct.
- When reviewing existing components, prefer extending them with typed props over wrapping them in another layer.
- New letitrip files are limited to routes, server actions, project config, and runtime wiring only.

14. Constants over hard-coded strings:
- Never hard-code route paths, label strings, message copy, aria labels, status values, or other repeated string literals.
- All route paths → import from `ROUTES` constants in appkit (`src/constants/routes.ts` or feature-scoped `routes.ts`).
- All user-facing labels, button text, validation messages, empty-state copy, and notification strings → import from `MESSAGES`/`LABELS` constants.
- Status/enum-like string values (e.g. `"published"`, `"pending"`, `"active"`) → typed enums or `as const` objects in the feature schema; never bare string literals in logic.
- This applies everywhere: components, hooks, server actions, repositories, validators, seeds, and functions.

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

### High (P1) — NEW (2026-04-17)
10. Status string literals used instead of typed enum constants: ~40+ violations.
- appkit/src/features/admin/actions/admin-read-actions.ts — `p.status === "published"`
- appkit/src/features/events/api/[id]/route.ts — `event.status === "draft"` / `"paused"`
- appkit/src/seo/json-ld.ts — `product.status === "published"`
- appkit/src/features/reviews/actions/review-actions.ts — `product.status === "published"`
- appkit/src/features/reviews/api/route.ts — `r.status === "approved"`
- appkit/src/features/stores/actions/store-query-actions.ts — `p.status === "published"`
- appkit/src/features/products/actions/product-actions.ts — `p.status === "published"`
- appkit/src/features/promotions/actions/promotions-actions.ts — `p.status === "published"` (×2)
- appkit/src/features/seller/actions/seller-actions.ts — `"pending"` / `"published"`
- appkit/src/features/auth/hooks/useAuth.ts — `authEvent.status === "pending"`
- appkit/src/features/auth/actions/profile-actions.ts — `p.status === "published"` (×2)
- letitrip.in/functions/src/jobs/auctionSettlement.ts — `r.status === "rejected"`
- letitrip.in/functions/src/triggers/onProductWrite.ts — `"published"` (×2)
- letitrip.in/functions/src/triggers/onReviewWrite.ts — `"approved"` (×2)
- letitrip.in/functions/src/jobs/payoutBatch.ts — `r.status === "rejected"`
- letitrip.in/src/actions/admin.actions.ts — `newStatus === "approved"`
- letitrip.in/src/app/api/admin/blog/route.ts — `body!.status === "published"`
- letitrip.in/src/app/api/admin/coupons/[id]/route.ts — `body!.status === "published"`
- letitrip.in/src/app/api/cart/route.ts — `"out_of_stock"`, `"discontinued"`, `"sold"`, `"draft"` (×4)
- letitrip.in/src/app/api/auth/google/callback/route.ts — `"error"` / `"pending"` status checks
- letitrip.in/src/actions/seller.actions.ts — `"shipped"`, `"delivered"`, `"confirmed"` (×3)
Fix: all enum-like status values must use typed `as const` objects or enums from the feature schema.
Blocked by: R1 (baseline resolver) for market defaults; schema ownership resolve for status enums.

11. Hard-coded route path segments in component logic.
- letitrip.in/src/components/layout/Sidebar.tsx — `pathname?.startsWith("/admin/")` / `"/seller/"` (multiple)
- appkit/src/next/components/UnauthorizedView.tsx — default prop `loginHref = "/auth/login"`
- appkit/src/next/components/NotFoundView.tsx — default prop `homeHref = "/"`
Fix: path segments used in logic must be `ROUTES` constants; default props that form canonical paths must reference `ROUTES`.

12. Reuse violation — duplicate TextLink component.
- letitrip.in/src/components/typography/TextLink.tsx duplicates appkit/src/ui/components/TextLink.tsx.
Fix: delete letitrip copy, replace all import sites with `@mohasinac/appkit/ui`.

### Medium (P2)
13. Contact domain action symmetry gap.
- appkit/src/features/contact/email.ts
- appkit/src/features/contact/index.ts

14. Remaining re-export closure surfaces.
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
| R9 | Status enum constants | ~40 status string literals across appkit + letitrip | not started | R1 | High | Replace raw strings with typed enums/as-const in feature schemas |
| R10 | ROUTES constant coverage | Sidebar pathname checks + appkit default-prop paths | not started | none | Medium | Extract path strings to ROUTES constants |
| R11 | TextLink dedup | letitrip/src/components/typography/TextLink.tsx | not started | none | Low | Delete duplicate; rewire imports to appkit |

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

---

## Migration-Style Live Tracker (Deep Scan Backed)

Last deep scan: 2026-04-17
Scan basis: workspace-wide static inventory using file and pattern search across `appkit/src`, `letitrip.in/src`, and `letitrip.in/functions/src`.

### Status Icon Legend

| Icon | Meaning | Gate expectation |
|---|---|---|
| ✅ | Done | Implemented + validated + tracker updated |
| 🔄 | In progress | Active implementation, partial coverage only |
| 🟡 | Ready next | Analysis complete, awaiting implementation slot |
| ⛔ | Blocked | Dependency gate not green |
| ❌ | Not started | No implementation begun |
| 🔍 | Analysis only | Inventory/dependency mapping completed |

### Deep Inventory Snapshot

| Area | Evidence | Impact on plan |
|---|---|---|
| Appkit view surface | 92 `*View.tsx` files under `appkit/src/features/**` | High SSR-hardening blast radius (R5/R7) |
| Appkit UI style sibling files | 45 `*.style.css` in `appkit/src/ui/components/**` | Style contract partially complete; mixed model remains (R7) |
| Appkit seed surfaces | 20 `*-seed-data.ts` files | Market default removal must be parameterized, not file-by-file patching (Phase 2) |
| Column modules | 22 feature column index modules | Strong candidate for shared render/formatter kit (R2/R3) |
| letitrip action entrypoints | 35 files in `letitrip.in/src/actions` | Thin-wrapper audit scope is broad; prioritize P1 list first |
| letitrip functions repositories | 15 files in `letitrip.in/functions/src/repositories` + 1 barrel | Local ownership still central in functions runtime (P1 #6) |
| letitrip schema surfaces | 20 files in `letitrip.in/src/db/schema` | Compatibility barrels still heavily depended upon |
| Duplicate schema barrels (appkit) | SHA256 hash match confirmed for `admin/checkout/homepage` schema `index.ts` files | Safe-first dedupe candidate (R8 precursor) |
| Status literal hotspots | 66 matches found in appkit scan and 37 matches in letitrip+functions scans (pattern-capped views) | Confirms R9 is high risk and cross-repo |
| Market literals hotspot | 200+ capped matches in appkit scan (`INR`, `en-IN`, `en-US`, `+91`) | Confirms R1/Phase 1 remains the critical blocker |
| Client-boundary pressure | 200+ capped `"use client"` matches in appkit scan | Confirms P0 SSR-first drift concern |

### Gap Workstream Board (Migration Doc Style)

| Exec Order | Workstream | Scope | Dependency | Status | Progress | Risk |
|---|---|---|---|---|---|---|
| 1 | W0 - Baseline inventory lock | Evidence map + dependency map for top risk files | none | ✅ | 1/1 | Medium |
| 2 | W1 - Baseline market resolver (R1) | tokens/formatters/providers/validators fallback unification | none | ❌ | 0/6 | High |
| 3 | W2 - Seed parameterization | `appkit/src/seed/*` factories + data defaults | W1 | ❌ | 0/5 | High |
| 4 | W3 - Schema and repository closure | letitrip schema compatibility + functions repo ownership | W1,W2 | ❌ | 0/7 | High |
| 5 | W4 - Thin action wrapper enforcement | targeted P1 action wrappers | W3 | ❌ | 0/5 | High |
| 6 | W5 - Render/column kit (R2/R3) | shared status/date/currency adapters + column factories | W1 | ❌ | 0/6 | Medium |
| 7 | W6 - SSR/view/style hardening (R5/R7) | client-heavy views + style contract completion | W3,W5 | ❌ | 0/8 | High |
| 8 | W7 - Constants + dedupe closure (R8-R11) | status enums, ROUTES, TextLink, shim purge | W1,W3 | ❌ | 0/9 | Medium |

### Active Batch Tracker

| Batch ID | Workstream | Scope | Dependency prereqs | Analysis | Implemented | Validated | Tracker updated | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|
| B00 | W0 | Deep inventory + evidence-backed tracker scaffolding | N/A | ✅ | ✅ | ✅ | ✅ | ✅ | Baseline scan completed and codified below |
| B01 | W1 | Baseline resolver contract (`currency/locale/country/phone/timezone`) | ✅ | ✅ | ⬜ | ⬜ | ⬜ | 🟡 | First implementation batch after this tracker update |
| B02 | W1 | Replace direct defaults in formatter/token/provider hotpaths | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ❌ | Blocked by B01 baseline API |
| B03 | W2 | Seed factory override path + deterministic tests | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ❌ | Depends on baseline resolver injection |
| B04 | W3 | letitrip schema barrel decoupling (`index.ts`, `field-names.ts`) | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ❌ | High caller count; do after baseline path stabilization |
| B05 | W3 | functions repository ownership migration path | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ❌ | 16 jobs/triggers import `../repositories` barrel |
| B06 | W4 | Thin action wrapper pass for P1 action files | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ❌ | Unify auth/parse/call/return shape |
| B07 | W7 | Status enum constants migration (R9 wave 1) | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ❌ | Start with appkit actions/api + functions triggers |
| B08 | W7 | ROUTES constants migration (R10) | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ❌ | Sidebar + appkit next default hrefs |
| B09 | W7 | TextLink dedupe and import rewires (R11) | ✅ | ✅ | ⬜ | ⬜ | ⬜ | 🟡 | 8 known import sites in letitrip |

### Dependency Proof Checklist (Per Batch)

- [x] Ownership gate (shared vs local-only) documented for baseline tracker setup
- [x] Coupling map started with concrete usage counts for schemas/actions/functions repositories
- [x] Runtime boundary evidence collected (`"use client"` pressure across appkit)
- [x] Configurability risk map collected (market/default literal hotspots)
- [x] Validation gate defined (typecheck + smoke + tracker update)
- [ ] Rollback templates pre-authored for W1-W7 implementation batches

### Workstream Checklists (Execution-Ready)

#### W1 - Baseline Market Resolver (R1)

- [ ] Create canonical baseline resolver contract in appkit (single source for currency/locale/country/phone/timezone).
- [ ] Wire `appkit/src/tokens/index.ts` to resolver (remove direct market literals).
- [ ] Wire `appkit/src/utils/number.formatter.ts` and `appkit/src/utils/date.formatter.ts` to resolver defaults.
- [ ] Wire payment defaults in `appkit/src/features/payments/schemas/index.ts` and `appkit/src/providers/payment-razorpay/index.ts`.
- [ ] Wire UI fallback paths (`WishlistPage`, cart columns, `PriceDisplay`) to baseline resolver.
- [ ] Document baseline parity proof with letitrip defaults.
Status: ❌ not started

#### W2 - Seed Parameterization

- [ ] Introduce market/context argument shape for seed factories.
- [ ] Replace inlined `INR`/`+91` assumptions in seed payload generators with baseline-aware defaults.
- [ ] Keep deterministic seed output for letitrip default profile.
- [ ] Add alternate-market fixture snapshot for regression comparison.
- [ ] Update seed entrypoints to pass baseline profile explicitly.
Status: ❌ not started (blocked by W1)

#### W3 - Repository and Schema Closure

- [ ] Map callers of `letitrip.in/src/db/schema/index.ts` and `field-names.ts` by domain.
- [ ] Move remaining shared schema/constants ownership to appkit canonical surfaces.
- [ ] Reduce letitrip schema surfaces to strict local-only exceptions (if any).
- [ ] Replace functions local repository ownership model with appkit-owned contract/provider path.
- [ ] Rewire 16 functions jobs/triggers currently importing `../repositories`.
- [ ] Remove compatibility barrels once all imports are canonical.
- [ ] Validate with functions + app typecheck.
Status: ❌ not started

#### W4 - Thin Action Wrapper Enforcement

- [ ] Audit `seller.actions.ts` for business logic leakage.
- [ ] Audit `seller-coupon.actions.ts` for non-wrapper behavior.
- [ ] Audit `admin.actions.ts` for status/business branching that belongs in appkit.
- [ ] Audit `category.actions.ts` and `review.actions.ts` against auth/parse/call/return template.
- [ ] Publish thin-wrapper conformance checklist and mark each file status.
Status: ❌ not started

#### W5 - Render/Column Kit (R2-R3)

- [ ] Create shared render-format kit for status/date/currency display and parsing.
- [ ] Migrate duplicated format/render code in 22 feature column modules to shared helpers.
- [ ] Convert repeated status badge logic to typed status adapters.
- [ ] Convert repeated date renderers to baseline-aware date formatting adapters.
- [ ] Convert repeated price renderers to baseline-aware currency adapters.
- [ ] Validate column behavior parity in admin/seller/account/store tables.
Status: ❌ not started

#### W6 - SSR/View/Style Hardening (R5-R7)

- [ ] Classify 92 view files into server-safe, mixed, and client-required groups.
- [ ] Remove unnecessary `"use client"` directives from view layers that can be server components.
- [ ] Keep client-only behavior isolated to hooks/forms/interactive atoms.
- [ ] Complete style sibling contract for UI outliers (`DataTable.tsx`, `rich-text/RichText.tsx`).
- [ ] Standardize style ownership model (retire mixed central-vs-sibling duplication where possible).
- [ ] Re-run SSR boundary audit for view files.
- [ ] Validate no browser API leakage in server views.
- [ ] Update tracker with final server/client split counts.
Status: ❌ not started

#### W7 - Constants + Dedupe Closure (R8-R11)

- [ ] R9 wave 1: replace status literals in appkit action/api hotspots with typed schema constants.
- [ ] R9 wave 2: replace status literals in letitrip functions jobs/triggers and API routes.
- [ ] R10: replace route segment logic in sidebar and appkit next defaults with `ROUTES` constants.
- [ ] R11: delete duplicate `letitrip.in/src/components/typography/TextLink.tsx`.
- [ ] Rewire all 8 known TextLink import sites to `@mohasinac/appkit/ui`.
- [ ] Verify no residual imports to deleted local TextLink path.
- [ ] Remove remaining shim/re-export surfaces after rewires.
- [ ] Validate route + auth fallback behavior after constant migration.
- [ ] Run final closure scan for raw status literals and route literals.
Status: ❌ not started

### High-Confidence Dependency Chain (Updated)

1. W0 tracker baseline (completed)
2. W1 baseline resolver (must land first)
3. W2 seed parameterization and W5 render-format kit (parallel after W1)
4. W3 schema/repository closure (after W1, with W2 outputs available)
5. W4 thin wrapper enforcement (after W3)
6. W6 SSR/style hardening (after W3 + W5)
7. W7 constants/dedupe closure and final verification

### Validation Matrix (Per Batch)

| Validation | Command intent | Required for |
|---|---|---|
| Typecheck (appkit) | Ensure shared package integrity after ownership/default changes | W1-W7 |
| Typecheck (letitrip.in) | Ensure consumer wiring remains valid after rewires | W3-W7 |
| Typecheck (functions) | Ensure trigger/job repository and enum rewires are safe | W3, W7 |
| Smoke tests | Guard route/action regressions after wrapper/constants refactors | W4, W7 |
| Tracker sync | Keep Gap.md status truthful after each batch | every batch |

### Next Safest Batch Recommendation

Recommended next implementation batch: `B01 (W1 baseline resolver contract)`

Reason:
- It unblocks R1-dependent items (`R2`, `R3`, `R9`) and phases 1-3.
- It reduces repeated fallback drift before broader migration edits.
- It converts currently scattered market defaults into one auditable surface.
