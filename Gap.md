# Gap.md - Consolidated Architecture and Style Gap Master Plan

Last updated: 2026-04-17 (B11 appkit barrel split done; letitrip rewires deferred to end-state rewrite)
Scope: letitrip.in (consumer, reference-only during phases) + appkit (source of truth, active migration target)
Supersedes: architecturegap.md, styleandarchitec.md

## Intent
This file is the single authoritative gap-analysis, policy, and execution tracker.

Primary operating principle: measure twice, cut once.
That means every migration step must pass analysis and dependency checks before edits begin.

### Letitrip-Deferred Policy
**All phases (1–8) target appkit only.** letitrip.in is used exclusively as a reference for default design, behavior, and baseline expectations during these phases — no letitrip code changes are made. Consumer-side rewires, import updates, schema retirements, action refactors, shim deletions, and all other letitrip modifications are deferred to a dedicated **Post-Phase Consumer Rewrite** pass that begins only after all appkit-side phases are complete and validated. This ensures appkit APIs are stable and proven before consumer adoption work begins.

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

15. Server/client boundary isolation:
- Every file in appkit must be classifiable as **server-only**, **client-only**, or **universal** (safe for both). No file may silently depend on a runtime it was not designed for.
- Server-only files (repositories, crypto helpers, admin DB access, server actions, seed data, email senders) must include `import "server-only"` at the top. This causes a clear build error if the file is accidentally pulled into a client bundle.
- Client-only files (hooks using `useState`/`useEffect`, components using `window`/`localStorage`/`document`, files with `"use client"`) should include `import "client-only"` when they would break or be meaningless on the server.
- Universal files (types, schemas, constants, pure utility functions, shared formatters with no runtime dependency) need no guard but must not import from server-only or client-only modules.
- **Barrel files must not mix server and client exports.** Each `features/*/index.ts` must be split into:
  - `index.ts` — client-safe exports only (types, schemas, hooks, components, constants)
  - `server.ts` — server-only exports (repositories, server actions, crypto helpers, admin DB access)
  Consumers import from the appropriate sub-path: `@mohasinac/appkit/features/auth` for client-safe, `@mohasinac/appkit/features/auth/server` for server-only.
- `process.env` usage rules:
  - `NEXT_PUBLIC_*` vars are safe anywhere.
  - Non-public env vars (`PII_ENCRYPTION_KEY`, `CONSENT_OTP_HMAC_KEY`, `UPSTASH_REDIS_*`, etc.) must only appear in server-only files guarded by `import "server-only"`.
  - Prefer injecting config via props or provider contracts over reading `process.env` directly in shared modules. Direct `process.env` reads are acceptable only in provider implementations and top-level config resolvers.
- The `"browser"` condition in `package.json` exports should be extended to feature sub-paths that contain server-only code, or the barrel split above must be implemented so the condition is unnecessary.
- When a consumer imports from appkit, the server/client boundary must be enforced at build time — not rely on tree-shaking to strip server code from client bundles.
- Config values needed at runtime (site URL, feature flags, API keys) must flow through typed provider contracts or `SiteConfig`, not through direct `process.env` reads scattered across shared modules.

## Consolidated Gap Register (Current)

### Critical (P0)
1. Market-specific defaults in shared appkit layers.
- appkit/src/tokens/index.ts
- appkit/src/features/payments/schemas/index.ts
- appkit/src/features/wishlist/components/WishlistPage.tsx

2. Shared seed payloads still market-specific.
- appkit/src/seed/addresses-seed-data.ts — hardcoded Indian addresses, `+91` phones
- appkit/src/seed/bids-seed-data.ts — INR amounts
- appkit/src/seed/cart-seed-data.ts — INR prices
- appkit/src/seed/coupons-seed-data.ts — INR discount amounts
- appkit/src/seed/events-seed-data.ts — INR ticket prices
- appkit/src/seed/orders-seed-data.ts — INR order totals, Indian addresses
- appkit/src/seed/payouts-seed-data.ts — INR payout amounts
- appkit/src/seed/products-seed-data.ts — INR prices, Indian dimensions
- appkit/src/seed/site-settings-seed-data.ts — INR/IN defaults
- appkit/src/seed/store-addresses-seed-data.ts — Indian addresses
- appkit/src/seed/stores-seed-data.ts — Indian store data
- appkit/src/seed/users-seed-data.ts — `+91` phone numbers, Indian names
- appkit/src/seed/factories/ — all factory files
- appkit/src/seed/defaults/ — all default files

3. Appkit full-page views too client-heavy versus SSR-first rule (20 confirmed `"use client"` views).
- appkit/src/features/admin/components/AdminAnalyticsView.tsx
- appkit/src/features/admin/components/AdminBidsView.tsx
- appkit/src/features/admin/components/AdminBlogView.tsx
- appkit/src/features/admin/components/AdminCouponsView.tsx
- appkit/src/features/admin/components/AdminCarouselView.tsx
- appkit/src/features/admin/components/AdminFaqsView.tsx
- appkit/src/features/admin/components/AdminCategoriesView.tsx
- appkit/src/features/admin/components/AdminDashboardView.tsx
- appkit/src/features/admin/components/AdminMediaView.tsx
- appkit/src/features/wishlist/components/WishlistView.tsx
- appkit/src/features/copilot/components/AdminCopilotView.tsx
- appkit/src/features/user/components/UserSettingsView.tsx
- appkit/src/features/user/components/UserOrdersView.tsx
- appkit/src/features/user/components/UserOffersView.tsx
- appkit/src/features/user/components/UserNotificationsView.tsx
- appkit/src/features/user/components/UserAddressesView.tsx
- appkit/src/features/user/components/ProfileView.tsx
- appkit/src/features/user/components/OrderDetailView.tsx
- appkit/src/features/user/components/MessagesView.tsx
- appkit/src/features/user/components/BecomeSellerView.tsx

4. Missing baseline fallback discipline in value-consumption paths.
- Pattern: optional consumer values are accepted, but fallback behavior is inconsistent across modules.
- Risk: runtime behavior drift when letitrip config values are omitted or partially injected.

5. ~~Mixed server/client barrel exports in appkit feature entrypoints.~~ ✅ RESOLVED (B11)
- All ~29 `features/*/index.ts` barrels split: server-only exports (repositories, actions, crypto) moved to `server.ts`; `index.ts` retains only client-safe exports (types, schemas, hooks, components, constants).
- 13 new `server.ts` files created, 15 existing updated, 28 `index.ts` cleaned, 17 features had `export * from "./actions"` moved to `server.ts`.
- Internal appkit imports rewired (`repositories/index.ts`, `unit-of-work.ts`, 7 cross-feature action files).
- Consumer-side rewires partially done (16/28 letitrip action files); remainder deferred to letitrip end-state rewrite.

### High (P1)
4. letitrip action wrappers not uniformly thin.
- letitrip.in/src/actions/seller.actions.ts
- letitrip.in/src/actions/seller-coupon.actions.ts
- letitrip.in/src/actions/admin.actions.ts
- letitrip.in/src/actions/category.actions.ts
- letitrip.in/src/actions/review.actions.ts

5. Schema ownership split by compatibility fallbacks/barrels (19 files in `letitrip.in/src/db/schema/`).
- `addresses.ts` → `@mohasinac/appkit/features/account/schemas`
- `bids.ts` → `@mohasinac/appkit/features/auctions/schemas`
- `blog-posts.ts` → `@mohasinac/appkit/features/blog/schemas`
- `cart.ts` → `@mohasinac/appkit/features/cart/schemas`
- `categories.ts` → `@mohasinac/appkit/features/categories/schemas`
- `coupons.ts` → `@mohasinac/appkit/features/promotions/schemas`
- `events.ts` → `@mohasinac/appkit/features/events/schemas`
- `field-names.ts` → distribute to each feature's `schemas/index.ts`
- `notifications.ts` → `@mohasinac/appkit/features/admin/schemas`
- `offers.ts` → `@mohasinac/appkit/features/seller/schemas`
- `orders.ts` → `@mohasinac/appkit/features/orders/schemas`
- `payouts.ts` → `@mohasinac/appkit/features/payments/schemas`
- `products.ts` → `@mohasinac/appkit/features/products/schemas`
- `reviews.ts` → `@mohasinac/appkit/features/reviews/schemas`
- `sessions.ts` → `@mohasinac/appkit/features/auth/schemas`
- `store-addresses.ts` → `@mohasinac/appkit/features/stores/schemas`
- `stores.ts` → `@mohasinac/appkit/features/stores/schemas`
- `tokens.ts` → `@mohasinac/appkit/features/auth/schemas`
- `users.ts` → `@mohasinac/appkit/features/auth/schemas`

6. Functions runtime still has local repository layer (15 files in `letitrip.in/functions/src/repositories/`).
- `bid.repository.ts` → `@mohasinac/appkit/features/auctions/server`
- `cart.repository.ts` → `@mohasinac/appkit/features/cart/server`
- `category.repository.ts` → `@mohasinac/appkit/features/categories/server`
- `coupon.repository.ts` → `@mohasinac/appkit/features/promotions/server`
- `notification.repository.ts` → `@mohasinac/appkit/features/admin/server`
- `offer.repository.ts` → `@mohasinac/appkit/features/seller/server`
- `order.repository.ts` → `@mohasinac/appkit/features/orders/server`
- `payout.repository.ts` → `@mohasinac/appkit/features/payments/server`
- `product.repository.ts` → `@mohasinac/appkit/features/products/server`
- `review.repository.ts` → `@mohasinac/appkit/features/reviews/server`
- `session.repository.ts` → `@mohasinac/appkit/features/auth/server`
- `store.repository.ts` → `@mohasinac/appkit/features/stores/server`
- `token.repository.ts` → `@mohasinac/appkit/features/auth/server`
- `user.repository.ts` → `@mohasinac/appkit/features/auth/server`
- `index.ts` — barrel to delete after rewires

7. Style contract not fully implemented in appkit UI (30 components missing sibling `.style.css`).
- appkit/src/ui/components/Avatar.tsx
- appkit/src/ui/components/AvatarDisplay.tsx
- appkit/src/ui/components/BackgroundRenderer.tsx
- appkit/src/ui/components/BaseListingCard.tsx
- appkit/src/ui/components/Card.tsx
- appkit/src/ui/components/Checkbox.tsx
- appkit/src/ui/components/ConfirmDeleteModal.tsx
- appkit/src/ui/components/DashboardStatsCard.tsx
- appkit/src/ui/components/Div.tsx
- appkit/src/ui/components/Dropdown.tsx
- appkit/src/ui/components/DynamicSelect.tsx
- appkit/src/ui/components/EmptyState.tsx
- appkit/src/ui/components/FilterDrawer.tsx
- appkit/src/ui/components/FlowDiagram.tsx
- appkit/src/ui/components/Form.tsx
- appkit/src/ui/components/FormField.tsx
- appkit/src/ui/components/ImageGallery.tsx
- appkit/src/ui/components/Menu.tsx
- appkit/src/ui/components/PasswordStrengthIndicator.tsx
- appkit/src/ui/components/Radio.tsx
- appkit/src/ui/components/ResponsiveView.tsx
- appkit/src/ui/components/RoleBadge.tsx
- appkit/src/ui/components/RowActionMenu.tsx
- appkit/src/ui/components/Semantic.tsx
- appkit/src/ui/components/SideDrawer.tsx
- appkit/src/ui/components/SkipToMain.tsx
- appkit/src/ui/components/Tabs.tsx
- appkit/src/ui/components/Toast.tsx
- appkit/src/ui/components/Toggle.tsx
- appkit/src/ui/components/UnsavedChangesModal.tsx
- appkit/src/ui/DataTable.tsx (standalone outlier)
- appkit/src/ui/rich-text/RichText.tsx (standalone outlier)

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

15. ~~Missing `import "server-only"` guards on server-only files.~~ ✅ RESOLVED (B10)
- All files already had `import "server-only"`; 26 duplicate imports cleaned up.
- `client-only` package added to appkit dependencies.
- All 22 seed files confirmed guarded.

16. No `import "client-only"` guards on client-only files.
- appkit/src/features/cart/utils/guest-cart.ts — uses `localStorage`
- All `"use client"` hook files that depend on browser APIs should also have `import "client-only"` for defense-in-depth.
Fix: add `import "client-only"` to files that use browser-only APIs.

### Medium (P2)
13. Contact domain action symmetry gap.
- appkit/src/features/contact/email.ts
- appkit/src/features/contact/index.ts

14. Remaining re-export closure surfaces.
- Example historical residual: letitrip.in/src/app/global-error.tsx

## Appkit Mistake Inventory (Baseline Default Violations)

These are current high-confidence mistake locations where fallback behavior is hardcoded inconsistently or bypasses a single baseline config path.

1. Split baseline source (direct literals instead of one canonical baseline contract)
- `appkit/src/tokens/index.ts` — `defaultLocale: "en-IN"`, `supportedLocales: ["en-IN","en-US","en-GB"]`, `defaultPhonePrefix: "+91"`
- `appkit/src/utils/number.formatter.ts` — `formatCurrency()` default `currency="INR"`, `locale="en-IN"`; `formatNumber()` default `locale="en-IN"`
- `appkit/src/utils/date.formatter.ts` — `formatDate()` default `locale="en-IN"`, `formatDateTime()` ×4 overloads `locale="en-IN"`, one inline `"en-US"` call
Issue:
- Defaults are repeated in multiple modules as literals instead of flowing from one shared baseline resolver.

2. Local component-level fallbacks that do not use shared baseline resolver
- `appkit/src/features/wishlist/components/WishlistPage.tsx` — `item.productCurrency ?? "INR"`
- `appkit/src/features/cart/components/CartDrawer.tsx` — `currency = "INR"` default prop, `item.meta.currency ?? "INR"`, `currency ?? "INR"`
- `appkit/src/features/cart/columns/index.ts` — `meta.currency ?? "INR"`
- `appkit/src/ui/components/PriceDisplay.tsx` — local `formatCurrency()` with `"en-IN"` hardcoded
Issue:
- Currency fallback is duplicated in component code paths, creating drift risk and inconsistent override behavior.

3. Payment defaults hardcoded in provider/schemas rather than baseline-config driven
- `appkit/src/features/payments/schemas/index.ts` — `currency: z.string().default("INR")`
- `appkit/src/providers/payment-razorpay/index.ts` — `createOrder()` `currency = "INR"`, `opts.currency ?? "INR"`
Issue:
- Default currency is embedded as INR at schema/provider level with no single shared baseline fallback contract.

4. Locale fallback inconsistencies
- `appkit/src/utils/date.formatter.ts` — `formatDate()` uses `"en-IN"` default, one inline call uses `"en-US"`
- `appkit/src/features/blog/components/BlogListView.tsx` — date render `"en-US"` inline
- `appkit/src/features/blog/components/BlogPostView.tsx` — date render `"en-US"` inline
- `appkit/src/features/blog/components/BlogFeaturedCard.tsx` — date render `"en-US"` inline
- `appkit/src/features/reviews/components/ReviewsList.tsx` — date render `"en-US"` inline
- `appkit/src/features/reviews/components/ReviewModal.tsx` — date render `"en-US"` inline
- `appkit/src/features/orders/components/OrdersList.tsx` — date render `"en-US"` inline
- `appkit/src/features/stores/components/StoreAboutView.tsx` — date render `"en-US"` inline
Issue:
- Some date-formatting paths use en-US directly, which diverges from letitrip baseline default locale (en-IN).

5. Phone normalization/validation contains market-specific assumption without explicit baseline injection path
- `appkit/src/validation/phone.validator.ts` — `formatPhone()` defaults to `countryCode = "US"`, `isValidIndianMobile()` hardcodes `+91` strip logic
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
	- `appkit/src/features/user/components/ProfileView.tsx` vs `appkit/src/features/account/` equivalent
	- `appkit/src/features/user/components/MessagesView.tsx`
	- `appkit/src/features/user/components/OrderDetailView.tsx`
	- `appkit/src/features/user/components/UserOrdersView.tsx`
	- `appkit/src/features/user/components/UserOffersView.tsx`
	- `appkit/src/features/user/components/UserAddressesView.tsx`
	- `appkit/src/features/user/components/UserNotificationsView.tsx`
	- `appkit/src/features/user/components/UserSettingsView.tsx`
	- `appkit/src/features/user/components/BecomeSellerView.tsx`
- Ownership pattern already favors `features/account` in appkit integration surfaces.
Finding:
- This is parallel concept ownership and must be merged into one canonical domain with variant/slot extension points.

3. View layer size suggests repeated composition patterns
- `*View.tsx` files in appkit: 96
Finding:
- Multiple role-based pages (admin/seller/account/store) likely repeat shell, header, table, filter, and card composition patterns that can be baseline templates with variants.

4. Column modules are highly repeated and should share formatter/render adapters
- Column modules discovered (23 files):
  - `appkit/src/features/account/columns/index.ts`
  - `appkit/src/features/auctions/columns/index.ts`
  - `appkit/src/features/before-after/columns/index.ts`
  - `appkit/src/features/blog/columns/index.ts`
  - `appkit/src/features/cart/columns/index.ts`
  - `appkit/src/features/categories/columns/index.ts`
  - `appkit/src/features/collections/columns/index.ts`
  - `appkit/src/features/consultation/columns/index.ts`
  - `appkit/src/features/corporate/columns/index.ts`
  - `appkit/src/features/events/columns/index.ts`
  - `appkit/src/features/faq/columns/index.ts`
  - `appkit/src/features/loyalty/columns/index.ts`
  - `appkit/src/features/orders/columns/index.ts`
  - `appkit/src/features/payments/columns/index.ts`
  - `appkit/src/features/pre-orders/columns/index.ts`
  - `appkit/src/features/products/columns/index.ts`
  - `appkit/src/features/products/columns/productTableColumns.tsx`
  - `appkit/src/features/promotions/columns/index.ts`
  - `appkit/src/features/reviews/columns/index.ts`
  - `appkit/src/features/search/columns/index.ts`
  - `appkit/src/features/seller/columns/index.ts`
  - `appkit/src/features/stores/columns/index.ts`
  - `appkit/src/features/wishlist/columns/index.ts`
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
| R12 | Server/client barrel split | ~20 features/*/index.ts mixed barrels + missing server-only/client-only guards | not started | none | ~~Critical~~ ✅ appkit done | Split barrels, add runtime guards — appkit complete; consumer rewires deferred |

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
Status: ✅ done
Depends on: none
Deliverables: Deep inventory snapshot codified in Live Tracker below.

## Phase 0.5 - Server/client barrel split + runtime guards
Status: ✅ appkit-side complete (B10 + B11). Consumer rewires partial — deferred to letitrip end-state rewrite.
Depends on: none
Target files — add `import "server-only"`:
- `appkit/src/features/auth/consent-otp.ts` — uses `crypto.createHmac`, `crypto.randomInt`, `getAdminDb()`
- `appkit/src/features/auth/token-store.ts` — uses `crypto`, `getAdminDb()`, `prepareForFirestore()`
- `appkit/src/features/contact/email.ts` — uses `getProviders()` (resend email), `serverLogger`, `process.env.NEXTAUTH_URL`
- `appkit/src/features/checkout/actions/checkout-actions.ts` — uses `crypto.timingSafeEqual`, `serverLogger`, `sendEmail`
- `appkit/src/security/pii-encrypt.ts` — uses `crypto.createCipheriv/createDecipheriv/randomBytes/createHmac`, `process.env.PII_ENCRYPTION_KEY`
- `appkit/src/security/settings-encryption.ts` — uses `crypto.createCipheriv/createDecipheriv/randomBytes`, `process.env.SETTINGS_ENCRYPTION_KEY`
- `appkit/src/security/rate-limit.ts` — uses `process.env.UPSTASH_REDIS_REST_URL/TOKEN`
- `appkit/src/monitoring/server-logger.ts` — uses `fs/promises`, `path`, `NextRequest`
- `appkit/src/core/unit-of-work.ts` — imports `firebase-admin/firestore`
- `appkit/src/providers/payment-razorpay/index.ts` — uses `crypto.createHmac/timingSafeEqual`
- `appkit/src/features/whatsapp-bot/helpers/whatsapp.ts` — uses `crypto.createHmac/timingSafeEqual`
- `appkit/src/features/cart/repository/cart.repository.ts` — imports `firebase-admin/firestore` + `crypto.randomUUID`
- `appkit/src/features/products/repository/products.repository.ts` — imports `firebase-admin/firestore` FieldValue
- `appkit/src/features/promotions/repository/coupons.repository.ts` — imports `firebase-admin/firestore` FieldValue
- `appkit/src/features/blog/repository/blog.repository.ts` — imports `firebase-admin/firestore` FieldValue
- `appkit/src/features/homepage/repository/carousel.repository.ts` — imports `firebase-admin/firestore` FieldValue
- `appkit/src/features/categories/repository/categories.repository.ts` — imports `firebase-admin/firestore` FieldValue
- `appkit/src/features/auth/repository/user.repository.ts` — imports `firebase-admin/firestore`
- `appkit/src/features/auth/repository/token.repository.ts` — imports `firebase-admin/firestore`
- `appkit/src/features/faq/repository/faqs.repository.ts` — imports `firebase-admin/firestore` FieldValue
- `appkit/src/providers/db-firebase/sieve.ts` — imports `firebase-admin/firestore`
- `appkit/src/providers/db-firebase/realtime.ts` — imports `firebase-admin/firestore`
- `appkit/src/providers/db-firebase/index.ts` — imports `firebase-admin/firestore`
- `appkit/src/providers/db-firebase/base.ts` — imports `firebase-admin/firestore`
- `appkit/src/providers/db-firebase/admin-app-lite.ts` — imports `firebase-admin/app`
- `appkit/src/providers/db-firebase/admin-storage-lite.ts` — imports `firebase-admin/storage`
- All `appkit/src/seed/*.ts` files: `addresses-seed-data.ts`, `bids-seed-data.ts`, `blog-posts-seed-data.ts`, `carousel-slides-seed-data.ts`, `cart-seed-data.ts`, `categories-seed-data.ts`, `coupons-seed-data.ts`, `events-seed-data.ts`, `faq-seed-data.ts`, `homepage-sections-seed-data.ts`, `index.ts`, `notifications-seed-data.ts`, `orders-seed-data.ts`, `payouts-seed-data.ts`, `products-seed-data.ts`, `reviews-seed-data.ts`, `runner.ts`, `sessions-seed-data.ts`, `site-settings-seed-data.ts`, `store-addresses-seed-data.ts`, `stores-seed-data.ts`, `users-seed-data.ts`

Target files — add `import "client-only"`:
- `appkit/src/features/cart/utils/guest-cart.ts` — uses `localStorage`, `window`

Target barrel files — remove server-only re-exports from `index.ts` (15 already have `server.ts`, 5 need `server.ts` created):
Already have `server.ts` (remove server re-exports from `index.ts`):
- `appkit/src/features/admin/index.ts` — move `notificationRepository`, `chatRepository`, `siteSettingsRepository`
- `appkit/src/features/auctions/index.ts` — move `AuctionsRepository`, `bidRepository`
- `appkit/src/features/auth/index.ts` — move `consent-otp`, `token-store`, `repository`
- `appkit/src/features/blog/index.ts` — move `BlogRepository`, `blogRepository`
- `appkit/src/features/categories/index.ts` — move `CategoriesRepository`, `categoriesRepository`
- `appkit/src/features/events/index.ts` — move `EventRepository`/`EventsRepository`/`eventRepository`, `EventEntryRepository`/`eventEntryRepository`
- `appkit/src/features/faq/index.ts` — move `FAQsRepository`/`FirebaseFAQsRepository`/`faqsRepository`
- `appkit/src/features/homepage/index.ts` — move `carouselRepository`, `homepageSectionsRepository`
- `appkit/src/features/pre-orders/index.ts` — move `PreordersRepository`
- `appkit/src/features/products/index.ts` — move `ProductRepository`/`ProductsRepository`/`productRepository`
- `appkit/src/features/promotions/index.ts` — move `PromotionsRepository`, `couponsRepository`
- `appkit/src/features/reviews/index.ts` — move `ReviewRepository`/`ReviewsRepository`/`reviewRepository`
- `appkit/src/features/search/index.ts` — move `SearchRepository`
- `appkit/src/features/seller/index.ts` — move `SellerRepository`, `PayoutsRepository`, `OfferRepository`/`offerRepository`
- `appkit/src/features/stores/index.ts` — move `StoresRepository`, `StoreRepository`/`storeRepository`, `storeAddressRepository`

Need `server.ts` created:
- `appkit/src/features/account/index.ts` → create `server.ts` with `AccountRepository`, `AddressRepository`, `addressRepository`
- `appkit/src/features/cart/index.ts` → create `server.ts` with `CartRepository`, `cartRepository`
- `appkit/src/features/checkout/index.ts` → create `server.ts` with `failed-checkout.repository`, `checkout-actions.ts`
- `appkit/src/features/contact/index.ts` → create `server.ts` with `email.ts` exports
- `appkit/src/features/orders/index.ts` → create `server.ts` with `OrderRepository`/`OrdersRepository`/`orderRepository`
- `appkit/src/features/payments/index.ts` → create `server.ts` with `PaymentsRepository`, `payoutRepository`
- `appkit/src/features/wishlist/index.ts` → create `server.ts` with `WishlistRepository`, `UserWishlistRepository`/`wishlistRepository`
- `appkit/src/features/collections/index.ts` → create `server.ts` with `CollectionsRepository`
- `appkit/src/features/consultation/index.ts` → create `server.ts` with `ConsultationsRepository`
- `appkit/src/features/corporate/index.ts` → create `server.ts` with `CorporateRepository`
- `appkit/src/features/loyalty/index.ts` → create `server.ts` with `LoyaltyRepository`
- `appkit/src/features/before-after/index.ts` → create `server.ts` with `BeforeAfterRepository`
- `appkit/src/features/whatsapp-bot/index.ts` → create `server.ts` with `helpers/whatsapp` (crypto)
- `appkit/src/features/cron/index.ts` → create `server.ts` with `createCronJob`, `getCronRegistry`, `runJob`, `wrapScheduled`, `wrapPubSub`, etc.

Consumer rewire scope (letitrip server-side imports to update to `/server` sub-path):
- All 35 files in `letitrip.in/src/actions/` that import repositories
- All API route files in `letitrip.in/src/app/api/` that import repositories
- All 15 files in `letitrip.in/functions/src/repositories/` that reference appkit repos
- `letitrip.in/src/providers.config.ts`

Exit criteria:
- `import "server-only"` present in every file that uses `crypto`, `firebase-admin`, `fs`, or non-public `process.env`
- No feature `index.ts` re-exports server-only symbols
- `./features/*/server` export paths registered in `appkit/package.json`
- Typecheck passes for appkit, letitrip.in, and letitrip.in/functions

## Phase 1 - Market hardcoding removal in appkit
Status: not started
Depends on: Phase 0
Letitrip scope: reference-only (used to derive baseline defaults; no letitrip edits in this phase)
Target files with hardcoded market literals to replace with baseline resolver:

Currency defaults (`"INR"`):
- `appkit/src/utils/number.formatter.ts` — `formatCurrency()` default param `currency="INR"`, `formatNumber()` default `locale="en-IN"`
- `appkit/src/features/payments/schemas/index.ts` — zod schema `currency: z.string().default("INR")`
- `appkit/src/providers/payment-razorpay/index.ts` — `createOrder()` `currency = "INR"`, `opts.currency ?? "INR"`
- `appkit/src/features/wishlist/components/WishlistPage.tsx` — `item.productCurrency ?? "INR"`
- `appkit/src/features/cart/components/CartDrawer.tsx` — `currency = "INR"` default, `item.meta.currency ?? "INR"`, `currency ?? "INR"`
- `appkit/src/features/cart/columns/index.ts` — `meta.currency ?? "INR"`
- `appkit/src/ui/components/PriceDisplay.tsx` — local `formatCurrency()` with `"en-IN"` hardcoded
- `appkit/src/features/products/columns/productTableColumns.tsx` — `locale = "en-IN"`
- `appkit/src/features/whatsapp-bot/helpers/whatsapp.ts` — `₹` symbol, `"en-IN"` in `formatOrderMessage`
- `appkit/src/features/homepage/components/WhatsAppCommunitySection.tsx` — `"en-IN"`
- `appkit/src/features/pre-orders/components/PreorderCard.tsx` — `"en-IN"`

Locale defaults (`"en-IN"`, `"en-US"`):
- `appkit/src/utils/date.formatter.ts` — `formatDate()` default `locale="en-IN"`, `formatDateTime()` ×4 overloads `locale="en-IN"`, one inline `"en-US"` call
- `appkit/src/tokens/index.ts` — `defaultLocale: "en-IN"`, `supportedLocales: ["en-IN","en-US","en-GB"]`, `defaultPhonePrefix: "+91"`
- `appkit/src/features/blog/components/BlogListView.tsx` — date render `"en-US"`
- `appkit/src/features/blog/components/BlogPostView.tsx` — date render `"en-US"`
- `appkit/src/features/blog/components/BlogFeaturedCard.tsx` — date render `"en-US"`
- `appkit/src/features/reviews/components/ReviewsList.tsx` — date render `"en-US"`
- `appkit/src/features/reviews/components/ReviewModal.tsx` — date render `"en-US"`
- `appkit/src/features/orders/components/OrdersList.tsx` — date render `"en-US"`
- `appkit/src/features/stores/components/StoreAboutView.tsx` — date render `"en-US"`

Phone/country defaults (`+91`, `"IN"`, `"US"`):
- `appkit/src/validation/phone.validator.ts` — `formatPhone()` default `countryCode = "US"`, `isValidIndianMobile()` with `+91` strip logic

Deliverables:
- Create `appkit/src/core/baseline-resolver.ts` — single canonical resolver for currency/locale/country/phone/timezone
- Wire all appkit files above to read from baseline resolver instead of inline literals
- Baseline defaults derived from current letitrip behavior (`INR`, `en-IN`, `IN`, `+91`, `Asia/Kolkata`) — letitrip is reference only, no edits there
- Appkit falls back to letitrip-derived defaults when consumer provides nothing
- Consumer wiring (`letitrip.in/src/providers.config.ts` market profile injection) deferred to Post-Phase Consumer Rewrite
Exit criteria:
- Zero hardcoded `"INR"`, `"en-IN"`, `"en-US"`, `"+91"` in the appkit files listed above
- Appkit typecheck passes
- `formatCurrency()`, `formatDate()`, `PriceDisplay` produce identical output with and without explicit config

## Phase 2 - Seed parameterization
Status: not started
Depends on: Phase 1
Letitrip scope: reference-only (current seed data used as baseline fixture; no letitrip edits in this phase)
Target files (all in `appkit/src/seed/`):
- `addresses-seed-data.ts` — hardcoded Indian addresses, `+91` phone numbers
- `bids-seed-data.ts` — INR amounts
- `blog-posts-seed-data.ts`
- `carousel-slides-seed-data.ts`
- `cart-seed-data.ts` — INR prices
- `categories-seed-data.ts`
- `coupons-seed-data.ts` — INR discount amounts
- `events-seed-data.ts` — INR ticket prices
- `faq-seed-data.ts`
- `homepage-sections-seed-data.ts`
- `notifications-seed-data.ts`
- `orders-seed-data.ts` — INR order totals, Indian addresses
- `payouts-seed-data.ts` — INR payout amounts
- `products-seed-data.ts` — INR prices, Indian dimensions
- `reviews-seed-data.ts`
- `sessions-seed-data.ts`
- `site-settings-seed-data.ts` — INR/IN defaults
- `store-addresses-seed-data.ts` — Indian addresses
- `stores-seed-data.ts` — Indian store data
- `users-seed-data.ts` — `+91` phone numbers, Indian names
Also:
- `appkit/src/seed/factories/` — all factory files
- `appkit/src/seed/defaults/` — all default files
- `appkit/src/seed/runner.ts` — entry point
- `appkit/src/seed/index.ts` — barrel
Deliverables:
- Each seed file accepts a `MarketProfile` parameter from baseline resolver
- Default profile matches current letitrip data exactly
- Alternate market fixture available for regression snapshot
Exit criteria:
- No inline `INR`/`+91`/Indian-specific data without baseline resolver path
- `runner.ts` passes profile explicitly
- Deterministic output unchanged for default profile

## Phase 3 - Repository and schema closure
Status: not started
Depends on: Phases 0-2
Letitrip scope: reference-only (schema and repository files inventoried for appkit parity; actual letitrip deletions/rewires deferred to Post-Phase Consumer Rewrite)

letitrip schema files to retire in Post-Phase Consumer Rewrite (19 files in `letitrip.in/src/db/schema/`):
- `addresses.ts`, `bids.ts`, `blog-posts.ts`, `cart.ts`, `categories.ts`, `coupons.ts`, `events.ts`, `field-names.ts`, `notifications.ts`, `offers.ts`, `orders.ts`, `payouts.ts`, `products.ts`, `reviews.ts`, `sessions.ts`, `store-addresses.ts`, `stores.ts`, `tokens.ts`, `users.ts`
Each must be mapped to its appkit canonical owner in `appkit/src/features/*/schemas/`.

letitrip functions repositories to migrate in Post-Phase Consumer Rewrite (15 files in `letitrip.in/functions/src/repositories/`):
- `bid.repository.ts` → `@mohasinac/appkit/features/auctions/server`
- `cart.repository.ts` → `@mohasinac/appkit/features/cart/server`
- `category.repository.ts` → `@mohasinac/appkit/features/categories/server`
- `coupon.repository.ts` → `@mohasinac/appkit/features/promotions/server`
- `notification.repository.ts` → `@mohasinac/appkit/features/admin/server`
- `offer.repository.ts` → `@mohasinac/appkit/features/seller/server`
- `order.repository.ts` → `@mohasinac/appkit/features/orders/server`
- `payout.repository.ts` → `@mohasinac/appkit/features/payments/server` or `seller/server`
- `product.repository.ts` → `@mohasinac/appkit/features/products/server`
- `review.repository.ts` → `@mohasinac/appkit/features/reviews/server`
- `session.repository.ts` → `@mohasinac/appkit/features/auth/server`
- `store.repository.ts` → `@mohasinac/appkit/features/stores/server`
- `token.repository.ts` → `@mohasinac/appkit/features/auth/server`
- `user.repository.ts` → `@mohasinac/appkit/features/auth/server`
- `index.ts` — barrel to delete after all rewires

Duplicate schema barrels in appkit (byte-identical, safe to collapse):
- `appkit/src/features/admin/schemas/index.ts`
- `appkit/src/features/checkout/schemas/index.ts`
- `appkit/src/features/homepage/schemas/index.ts`

Exit criteria (appkit-side only during this phase):
- Appkit owns canonical schemas for all 19 letitrip schema equivalents
- Appkit owns canonical repositories for all 15 functions repository equivalents
- Duplicate appkit schema barrels collapsed
- Appkit typecheck passes
- Letitrip schema deletions and functions repository rewires deferred to Post-Phase Consumer Rewrite

## Phase 4 - Validation boundary cleanup
Status: not started
Depends on: Phase 3
Letitrip scope: reference-only (letitrip validators inventoried for parity; deletions deferred to Post-Phase Consumer Rewrite)
Target files:
- `appkit/src/validation/phone.validator.ts` — `formatPhone()`, `isValidIndianMobile()` need baseline market injection
- `appkit/src/validation/index.ts` — barrel
- letitrip-local validators in `letitrip.in/src/helpers/` or `letitrip.in/src/utils/` inventoried as reference for appkit parity
Exit criteria:
- Appkit validation covers all shared patterns found in letitrip validators
- Phone validator uses baseline resolver for country code
- Appkit typecheck passes
- Letitrip validator deletions deferred to Post-Phase Consumer Rewrite

## Phase 5 - Thin action-wrapper enforcement
Status: not started
Depends on: Phases 3-4
Letitrip scope: reference-only (action files audited to identify business logic that must move to appkit services; actual action refactors deferred to Post-Phase Consumer Rewrite)
Target action files to audit for appkit service extraction (35 files in `letitrip.in/src/actions/`):
- `address.actions.ts`, `admin-coupon.actions.ts`, `admin-read.actions.ts`, `admin.actions.ts`, `bid.actions.ts`, `blog.actions.ts`, `carousel.actions.ts`, `cart.actions.ts`, `category.actions.ts`, `chat.actions.ts`, `checkout.actions.ts`, `contact.actions.ts`, `coupon.actions.ts`, `demo-seed.actions.ts`, `event.actions.ts`, `faq.actions.ts`, `newsletter.actions.ts`, `notification.actions.ts`, `offer.actions.ts`, `order.actions.ts`, `product.actions.ts`, `profile.actions.ts`, `promotions.actions.ts`, `realtime-token.actions.ts`, `refund.actions.ts`, `review.actions.ts`, `search.actions.ts`, `sections.actions.ts`, `seller-coupon.actions.ts`, `seller.actions.ts`, `site-settings.actions.ts`, `store-address.actions.ts`, `store.actions.ts`, `wishlist.actions.ts`, `index.ts` (barrel)
Priority P1 files with known business logic leakage:
- `seller.actions.ts` — Shiprocket-specific shipping logic (`updateSellerShipping`, `verifyShiprocketPickupOtp`, `shipOrder` branch)
- `seller-coupon.actions.ts` — coupon validation logic
- `admin.actions.ts` — status branching (`newStatus === "approved"`)
- `category.actions.ts` — category tree logic
- `review.actions.ts` — review approval business rules
Expected shape per file: `"use server"` → auth check → parse input → call appkit service/repository → return result
Exit criteria (appkit-side only during this phase):
- Business logic identified in letitrip actions extracted to appkit services/repositories
- Appkit typecheck passes
- Letitrip action file refactors (thin wrapper shape enforcement) deferred to Post-Phase Consumer Rewrite

## Phase 6 - Hook parity and adapter hardening
Status: not started
Depends on: Phase 5
Letitrip scope: reference-only (letitrip hooks/contexts inventoried; appkit must own all reusable equivalents; letitrip deletions deferred to Post-Phase Consumer Rewrite)
Hooks currently in letitrip to inventory for appkit parity:
- Audit `letitrip.in/src/hooks/` for reusable hooks that must exist in appkit
- Audit `letitrip.in/src/contexts/` for reusable contexts that must exist in appkit
- Verify appkit feature hooks cover all shared patterns
Exit criteria:
- Appkit owns all reusable hook/context equivalents found in letitrip
- Appkit typecheck passes
- Letitrip hook/context deletions and import rewires deferred to Post-Phase Consumer Rewrite

## Phase 7 - UI style contract and SSR hardening
Status: not started
Depends on: Phases 5-6
Letitrip scope: reference-only (letitrip UI patterns used as reference for appkit variant coverage; no letitrip edits in this phase)

View files with `"use client"` that violate SSR-first rule (20 confirmed):
- `appkit/src/features/admin/components/AdminAnalyticsView.tsx`
- `appkit/src/features/admin/components/AdminBidsView.tsx`
- `appkit/src/features/admin/components/AdminBlogView.tsx`
- `appkit/src/features/admin/components/AdminCouponsView.tsx`
- `appkit/src/features/admin/components/AdminCarouselView.tsx`
- `appkit/src/features/admin/components/AdminFaqsView.tsx`
- `appkit/src/features/admin/components/AdminCategoriesView.tsx`
- `appkit/src/features/admin/components/AdminDashboardView.tsx`
- `appkit/src/features/admin/components/AdminMediaView.tsx`
- `appkit/src/features/wishlist/components/WishlistView.tsx`
- `appkit/src/features/copilot/components/AdminCopilotView.tsx`
- `appkit/src/features/user/components/UserSettingsView.tsx`
- `appkit/src/features/user/components/UserOrdersView.tsx`
- `appkit/src/features/user/components/UserOffersView.tsx`
- `appkit/src/features/user/components/UserNotificationsView.tsx`
- `appkit/src/features/user/components/UserAddressesView.tsx`
- `appkit/src/features/user/components/ProfileView.tsx`
- `appkit/src/features/user/components/OrderDetailView.tsx`
- `appkit/src/features/user/components/MessagesView.tsx`
- `appkit/src/features/user/components/BecomeSellerView.tsx`
Action: evaluate each — remove `"use client"` and extract interactive parts into child client components, or document as justified exception.

UI components missing sibling `.style.css` (30 files in `appkit/src/ui/components/`):
- `Avatar.tsx`, `AvatarDisplay.tsx`, `BackgroundRenderer.tsx`, `BaseListingCard.tsx`, `Card.tsx`, `Checkbox.tsx`, `ConfirmDeleteModal.tsx`, `DashboardStatsCard.tsx`, `Div.tsx`, `Dropdown.tsx`, `DynamicSelect.tsx`, `EmptyState.tsx`, `FilterDrawer.tsx`, `FlowDiagram.tsx`, `Form.tsx`, `FormField.tsx`, `ImageGallery.tsx`, `Menu.tsx`, `PasswordStrengthIndicator.tsx`, `Radio.tsx`, `ResponsiveView.tsx`, `RoleBadge.tsx`, `RowActionMenu.tsx`, `Semantic.tsx`, `SideDrawer.tsx`, `SkipToMain.tsx`, `Tabs.tsx`, `Toast.tsx`, `Toggle.tsx`, `UnsavedChangesModal.tsx`
Plus standalone outliers: `appkit/src/ui/DataTable.tsx`, `appkit/src/ui/rich-text/RichText.tsx`

Exit criteria:
- 20 view files either converted to server components or documented as justified
- All 30+ UI components have sibling `.style.css` or documented exemption
- No browser API leakage in server views

## Phase 8 - Re-export elimination and closure (appkit-side)
Status: not started
Depends on: all prior phases
Letitrip scope: reference-only (shim inventory prepared; actual shim deletion and import rewires in letitrip deferred to Post-Phase Consumer Rewrite)
Deliverables:
- Remaining appkit-internal shims removed
- Canonical import paths finalized and documented for consumer adoption
- Architecture-fit proof package for appkit
Exit criteria:
- Zero undocumented appkit-internal shims
- All appkit public API paths stable and documented
- Appkit typecheck passes

## Post-Phase Consumer Rewrite (letitrip.in)
Status: not started
Depends on: all phases (1-8) complete and validated in appkit
Scope: all deferred letitrip changes from phases 1-8
Deliverables:
- `providers.config.ts` market profile wiring to baseline resolver
- 19 schema files retired or reduced to type-only re-exports
- 15 functions repository files deleted; jobs/triggers import from appkit
- 35 action files refactored to thin auth/parse/call/return wrappers
- Reusable hooks/contexts deleted; imports rewired to appkit
- Re-export shims deleted; imports point to canonical appkit paths
- Remaining barrel import rewires (B12 leftovers) completed
Exit criteria:
- Typecheck passes for letitrip.in and letitrip.in/functions
- No reusable logic remains in letitrip — only routes, actions entrypoints, config, and runtime wiring
- All imports point to canonical appkit paths

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

CRITICAL RULE — Letitrip-Deferred Policy:
All phases (1–8) target appkit only. Do NOT modify any letitrip.in files during these phases.
letitrip.in is used exclusively as a **reference** for default design, behavior, and baseline expectations.
All consumer-side changes (import rewires, schema retirements, action refactors, shim deletions) are deferred to the Post-Phase Consumer Rewrite pass that starts only after all appkit phases are complete and validated.
When deriving baseline defaults, read letitrip code to understand current behavior — but make all edits in appkit.

Task:
1) Select the next not-started phase/batch from the Active Batch Tracker. Prioritize B10 (server-only guards) → B11 (barrel split) → B01 (baseline resolver) unless a dependency is unmet.
2) Produce a dependency map first (callers, callees, runtime boundaries, market assumptions) using exact file paths from Gap.md.
3) Verify all gates:
   - Ownership gate: shared vs local-only
   - Coupling gate: import chain from action → repository → schema → seed
   - Configurability gate: no hardcoded market defaults
   - Runtime boundary gate: every file classified as server-only / client-only / universal
   - Baseline fallback gate: appkit-side defaults match letitrip behavior when consumer value is missing
   - Server/client guard gate: `import "server-only"` present on files using `crypto`, `firebase-admin`, `fs`, or non-`NEXT_PUBLIC_` env vars; `import "client-only"` on files using `window`/`localStorage`/`document`
4) Only then implement migration in appkit-first direction. **All edits go to appkit only** — letitrip is read-only reference.
5) When splitting barrels: move server-only exports (repositories, crypto helpers, admin DB access) to `server.ts`; keep types, schemas, hooks, components, constants in `index.ts`. Reference the exact export symbols listed in Gap.md W8 checklist.
6) When adding `import "server-only"`: reference the exact file list in Gap.md Phase 0.5. Do not add to files that only use `NEXT_PUBLIC_*` env vars or `process.env.NODE_ENV`.
7) When replacing market literals: reference the exact file + symbol list in Gap.md W1 checklist. Wire to `appkit/src/core/baseline-resolver.ts`. Derive baseline values by reading letitrip code — do not edit letitrip.
8) When replacing status string literals: reference the exact file + line list in Gap.md W7 R9 checklist. Replace with typed enums/as-const from feature schemas.
9) Do NOT edit letitrip files. Consumer rewires happen in the Post-Phase Consumer Rewrite.
10) Remove duplicate/shim surfaces within appkit and rewire to canonical direct imports.
11) Run validation checks: `tsc --noEmit` for appkit only during phases 1–8. letitrip typecheck deferred to Post-Phase Consumer Rewrite.
12) Update Gap.md: mark batch status, check off completed items in workstream checklists, update Active Batch Tracker row.

Output format required:
- Analysis summary (files touched, gates verified)
- Dependency chain proof (upstream callers, downstream deps per file)
- Implementation diff summary (files created/modified/deleted with exact paths)
- Validation results (typecheck pass/fail per project)
- Tracker updates (batch row status + workstream checklist items checked)
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
9. Every appkit file is classified as server-only, client-only, or universal — with appropriate `server-only`/`client-only` import guards enforced at build time.
10. No barrel file mixes server and client exports; feature entrypoints are split into `index.ts` (client-safe) and `server.ts` (server-only).

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
| Mixed barrel exports | ~~~20 `features/*/index.ts` barrels mix server-only repos/crypto with client hooks/components~~ | ✅ RESOLVED: all barrels split into index.ts (client-safe) + server.ts (server-only) |
| Missing `server-only` guards | ~~8+ server-only files lack `import "server-only"`~~ | ✅ RESOLVED: all guards added (B10) |
| `"browser"` export conditions | Only `db-firebase` and `auth-firebase` providers use `"browser"` stub — feature barrels have no condition | Feature barrel split (R12) needed to close this gap |

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
| 9 | W8 - Server/client barrel split + guards (R12) | ~20 feature barrels + ~10 missing server-only guards + client-only guards | none | ✅ | 5/6 (B10+B11 done, B12 partial) | Critical |

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
| B10 | W8 | Add `import "server-only"` to 8+ unguarded server files + fix 26 duplicate imports + add `client-only` dep | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | All guards present; fixed 26 duplicate imports; added `client-only` to package.json |
| B11 | W8 | Split ~20 feature barrel files into `index.ts` + `server.ts` + move actions to server.ts | ✅ | ✅ | ✅ | ⬜ | ⬜ | 🔄 | Appkit-side complete: 13 server.ts created, 15 updated, 28 index.ts cleaned, 17 features actions→server.ts, internal rewires done. Letitrip consumer rewires deferred to end-state rewrite. |
| B12 | W8 | Add `import "client-only"` guards + consumer rewire + validate | ⬜ | ⬜ | 🔄 | ⬜ | ⬜ | 🔄 | Partial: 16/28 letitrip action files rewired, 12 mixed-import files + API routes remain. Deferred to letitrip end-state rewrite. |

### Dependency Proof Checklist (Per Batch)

- [x] Ownership gate (shared vs local-only) documented for baseline tracker setup
- [x] Coupling map started with concrete usage counts for schemas/actions/functions repositories
- [x] Runtime boundary evidence collected (`"use client"` pressure across appkit)
- [x] Configurability risk map collected (market/default literal hotspots)
- [x] Validation gate defined (typecheck + smoke + tracker update)
- [ ] Rollback templates pre-authored for W1-W7 implementation batches

### Workstream Checklists (Execution-Ready)

#### W1 - Baseline Market Resolver (R1)

- [ ] Create `appkit/src/core/baseline-resolver.ts` — single canonical resolver for currency/locale/country/phone/timezone.
- [ ] Wire `appkit/src/tokens/index.ts` — replace `defaultLocale: "en-IN"`, `supportedLocales`, `defaultPhonePrefix: "+91"`.
- [ ] Wire `appkit/src/utils/number.formatter.ts` — replace `formatCurrency()` default `currency="INR"`, `locale="en-IN"` and `formatNumber()` default `locale="en-IN"`.
- [ ] Wire `appkit/src/utils/date.formatter.ts` — replace `formatDate()` default `locale="en-IN"`, `formatDateTime()` ×4 overloads `locale="en-IN"`, inline `"en-US"` call.
- [ ] Wire `appkit/src/features/payments/schemas/index.ts` — replace `currency: z.string().default("INR")`.
- [ ] Wire `appkit/src/providers/payment-razorpay/index.ts` — replace `currency = "INR"`, `opts.currency ?? "INR"`.
- [ ] Wire `appkit/src/features/wishlist/components/WishlistPage.tsx` — replace `item.productCurrency ?? "INR"`.
- [ ] Wire `appkit/src/features/cart/components/CartDrawer.tsx` — replace `currency = "INR"` default, `item.meta.currency ?? "INR"`, `currency ?? "INR"`.
- [ ] Wire `appkit/src/features/cart/columns/index.ts` — replace `meta.currency ?? "INR"`.
- [ ] Wire `appkit/src/ui/components/PriceDisplay.tsx` — replace local `formatCurrency()` with `"en-IN"` hardcoded.
- [ ] Wire `appkit/src/features/products/columns/productTableColumns.tsx` — replace `locale = "en-IN"`.
- [ ] Wire `appkit/src/features/whatsapp-bot/helpers/whatsapp.ts` — replace `₹` symbol, `"en-IN"` in `formatOrderMessage`.
- [ ] Wire `appkit/src/features/homepage/components/WhatsAppCommunitySection.tsx` — replace `"en-IN"`.
- [ ] Wire `appkit/src/features/pre-orders/components/PreorderCard.tsx` — replace `"en-IN"`.
- [ ] Wire `appkit/src/features/blog/components/BlogListView.tsx` — replace date render `"en-US"`.
- [ ] Wire `appkit/src/features/blog/components/BlogPostView.tsx` — replace date render `"en-US"`.
- [ ] Wire `appkit/src/features/blog/components/BlogFeaturedCard.tsx` — replace date render `"en-US"`.
- [ ] Wire `appkit/src/features/reviews/components/ReviewsList.tsx` — replace date render `"en-US"`.
- [ ] Wire `appkit/src/features/reviews/components/ReviewModal.tsx` — replace date render `"en-US"`.
- [ ] Wire `appkit/src/features/orders/components/OrdersList.tsx` — replace date render `"en-US"`.
- [ ] Wire `appkit/src/features/stores/components/StoreAboutView.tsx` — replace date render `"en-US"`.
- [ ] Wire `appkit/src/validation/phone.validator.ts` — replace `formatPhone()` default `countryCode = "US"`, refactor `isValidIndianMobile()` to baseline-aware `isValidMobile()`.
- [ ] Wire `letitrip.in/src/providers.config.ts` — inject market profile (`INR`, `en-IN`, `IN`, `+91`, `Asia/Kolkata`).
- [ ] Verify baseline parity: `formatCurrency(1000)` === `"₹1,000.00"`, `formatDate(new Date())` uses `en-IN`.
Status: ❌ not started

#### W2 - Seed Parameterization

- [ ] Define `MarketProfile` type in `appkit/src/core/baseline-resolver.ts` for seed factory injection.
- [ ] Update `appkit/src/seed/addresses-seed-data.ts` — replace hardcoded Indian addresses, `+91` phones.
- [ ] Update `appkit/src/seed/bids-seed-data.ts` — replace INR amounts.
- [ ] Update `appkit/src/seed/cart-seed-data.ts` — replace INR prices.
- [ ] Update `appkit/src/seed/coupons-seed-data.ts` — replace INR discount amounts.
- [ ] Update `appkit/src/seed/events-seed-data.ts` — replace INR ticket prices.
- [ ] Update `appkit/src/seed/orders-seed-data.ts` — replace INR totals, Indian addresses.
- [ ] Update `appkit/src/seed/payouts-seed-data.ts` — replace INR payout amounts.
- [ ] Update `appkit/src/seed/products-seed-data.ts` — replace INR prices, Indian dimensions.
- [ ] Update `appkit/src/seed/site-settings-seed-data.ts` — replace INR/IN defaults.
- [ ] Update `appkit/src/seed/store-addresses-seed-data.ts` — replace Indian addresses.
- [ ] Update `appkit/src/seed/stores-seed-data.ts` — replace Indian store data.
- [ ] Update `appkit/src/seed/users-seed-data.ts` — replace `+91` phones, Indian names.
- [ ] Update `appkit/src/seed/factories/` — all factory files accept `MarketProfile`.
- [ ] Update `appkit/src/seed/defaults/` — all default files use baseline resolver.
- [ ] Update `appkit/src/seed/runner.ts` — accept and pass `MarketProfile` explicitly.
- [ ] Verify deterministic output for letitrip default profile unchanged.
- [ ] Add USD/US alternate market fixture snapshot.
Status: ❌ not started (blocked by W1)

#### W3 - Repository and Schema Closure

**letitrip schema files to retire** (19 files in `letitrip.in/src/db/schema/`):
- [ ] `addresses.ts` → map to `@mohasinac/appkit/features/account/schemas`
- [ ] `bids.ts` → map to `@mohasinac/appkit/features/auctions/schemas`
- [ ] `blog-posts.ts` → map to `@mohasinac/appkit/features/blog/schemas`
- [ ] `cart.ts` → map to `@mohasinac/appkit/features/cart/schemas`
- [ ] `categories.ts` → map to `@mohasinac/appkit/features/categories/schemas`
- [ ] `coupons.ts` → map to `@mohasinac/appkit/features/promotions/schemas`
- [ ] `events.ts` → map to `@mohasinac/appkit/features/events/schemas`
- [ ] `field-names.ts` → distribute constants to each feature's `schemas/index.ts`
- [ ] `notifications.ts` → map to `@mohasinac/appkit/features/admin/schemas`
- [ ] `offers.ts` → map to `@mohasinac/appkit/features/seller/schemas`
- [ ] `orders.ts` → map to `@mohasinac/appkit/features/orders/schemas`
- [ ] `payouts.ts` → map to `@mohasinac/appkit/features/payments/schemas`
- [ ] `products.ts` → map to `@mohasinac/appkit/features/products/schemas`
- [ ] `reviews.ts` → map to `@mohasinac/appkit/features/reviews/schemas`
- [ ] `sessions.ts` → map to `@mohasinac/appkit/features/auth/schemas`
- [ ] `store-addresses.ts` → map to `@mohasinac/appkit/features/stores/schemas`
- [ ] `stores.ts` → map to `@mohasinac/appkit/features/stores/schemas`
- [ ] `tokens.ts` → map to `@mohasinac/appkit/features/auth/schemas`
- [ ] `users.ts` → map to `@mohasinac/appkit/features/auth/schemas`

**letitrip functions repositories to migrate** (15 files in `letitrip.in/functions/src/repositories/`):
- [ ] `bid.repository.ts` → import from `@mohasinac/appkit/features/auctions/server`
- [ ] `cart.repository.ts` → import from `@mohasinac/appkit/features/cart/server`
- [ ] `category.repository.ts` → import from `@mohasinac/appkit/features/categories/server`
- [ ] `coupon.repository.ts` → import from `@mohasinac/appkit/features/promotions/server`
- [ ] `notification.repository.ts` → import from `@mohasinac/appkit/features/admin/server`
- [ ] `offer.repository.ts` → import from `@mohasinac/appkit/features/seller/server`
- [ ] `order.repository.ts` → import from `@mohasinac/appkit/features/orders/server`
- [ ] `payout.repository.ts` → import from `@mohasinac/appkit/features/payments/server`
- [ ] `product.repository.ts` → import from `@mohasinac/appkit/features/products/server`
- [ ] `review.repository.ts` → import from `@mohasinac/appkit/features/reviews/server`
- [ ] `session.repository.ts` → import from `@mohasinac/appkit/features/auth/server`
- [ ] `store.repository.ts` → import from `@mohasinac/appkit/features/stores/server`
- [ ] `token.repository.ts` → import from `@mohasinac/appkit/features/auth/server`
- [ ] `user.repository.ts` → import from `@mohasinac/appkit/features/auth/server`
- [ ] `index.ts` — delete barrel after all rewires

**Duplicate appkit schema barrels to collapse:**
- [ ] `appkit/src/features/admin/schemas/index.ts` (byte-identical with checkout/homepage)
- [ ] `appkit/src/features/checkout/schemas/index.ts`
- [ ] `appkit/src/features/homepage/schemas/index.ts`

- [ ] Validate with appkit + letitrip.in + functions typecheck.
Status: ❌ not started

#### W4 - Thin Action Wrapper Enforcement

All 35 files in `letitrip.in/src/actions/` — expected shape: `"use server"` → auth → parse → call appkit → return.

**Priority P1 — known business logic leakage:**
- [ ] `seller.actions.ts` — extract `updateSellerShipping`, `verifyShiprocketPickupOtp`, `shipOrder` Shiprocket branch to appkit provider/adapter (Shiprocket stays as letitrip permanent exception).
- [ ] `seller-coupon.actions.ts` — extract coupon validation logic to `@mohasinac/appkit/features/promotions`.
- [ ] `admin.actions.ts` — extract status branching (`newStatus === "approved"`) to appkit service.
- [ ] `category.actions.ts` — extract category tree logic to `@mohasinac/appkit/features/categories`.
- [ ] `review.actions.ts` — extract review approval rules to `@mohasinac/appkit/features/reviews`.

**Remaining 30 files (verify thin-wrapper conformance):**
- [ ] `address.actions.ts`
- [ ] `admin-coupon.actions.ts`
- [ ] `admin-read.actions.ts`
- [ ] `bid.actions.ts`
- [ ] `blog.actions.ts`
- [ ] `carousel.actions.ts`
- [ ] `cart.actions.ts`
- [ ] `chat.actions.ts`
- [ ] `checkout.actions.ts`
- [ ] `contact.actions.ts`
- [ ] `coupon.actions.ts`
- [ ] `demo-seed.actions.ts`
- [ ] `event.actions.ts`
- [ ] `faq.actions.ts`
- [ ] `newsletter.actions.ts`
- [ ] `notification.actions.ts`
- [ ] `offer.actions.ts`
- [ ] `order.actions.ts`
- [ ] `product.actions.ts`
- [ ] `profile.actions.ts`
- [ ] `promotions.actions.ts`
- [ ] `realtime-token.actions.ts`
- [ ] `refund.actions.ts`
- [ ] `search.actions.ts`
- [ ] `sections.actions.ts`
- [ ] `site-settings.actions.ts`
- [ ] `store-address.actions.ts`
- [ ] `store.actions.ts`
- [ ] `wishlist.actions.ts`
- [ ] `index.ts` (barrel — verify exports only)
Status: ❌ not started

#### W5 - Render/Column Kit (R2-R3)

- [ ] Create `appkit/src/ui/columns/render-kit.ts` — shared typed renderers for status badge, date, currency, row actions.
- [ ] Create `appkit/src/ui/columns/column-factory.ts` — typed column factories consuming render-kit.

**22 feature column modules to migrate to shared render-kit:**
- [ ] `appkit/src/features/account/columns/index.ts`
- [ ] `appkit/src/features/auctions/columns/index.ts`
- [ ] `appkit/src/features/before-after/columns/index.ts`
- [ ] `appkit/src/features/blog/columns/index.ts`
- [ ] `appkit/src/features/cart/columns/index.ts`
- [ ] `appkit/src/features/categories/columns/index.ts`
- [ ] `appkit/src/features/collections/columns/index.ts`
- [ ] `appkit/src/features/consultation/columns/index.ts`
- [ ] `appkit/src/features/corporate/columns/index.ts`
- [ ] `appkit/src/features/events/columns/index.ts`
- [ ] `appkit/src/features/faq/columns/index.ts`
- [ ] `appkit/src/features/loyalty/columns/index.ts`
- [ ] `appkit/src/features/orders/columns/index.ts`
- [ ] `appkit/src/features/payments/columns/index.ts`
- [ ] `appkit/src/features/pre-orders/columns/index.ts`
- [ ] `appkit/src/features/products/columns/index.ts`
- [ ] `appkit/src/features/products/columns/productTableColumns.tsx`
- [ ] `appkit/src/features/promotions/columns/index.ts`
- [ ] `appkit/src/features/reviews/columns/index.ts`
- [ ] `appkit/src/features/search/columns/index.ts`
- [ ] `appkit/src/features/seller/columns/index.ts`
- [ ] `appkit/src/features/stores/columns/index.ts`
- [ ] `appkit/src/features/wishlist/columns/index.ts`

- [ ] Validate column behavior parity in admin/seller/account/store tables.
Status: ❌ not started

#### W6 - SSR/View/Style Hardening (R5-R7)

**20 `"use client"` view files to convert to server components or justify:**
- [ ] `appkit/src/features/admin/components/AdminAnalyticsView.tsx`
- [ ] `appkit/src/features/admin/components/AdminBidsView.tsx`
- [ ] `appkit/src/features/admin/components/AdminBlogView.tsx`
- [ ] `appkit/src/features/admin/components/AdminCouponsView.tsx`
- [ ] `appkit/src/features/admin/components/AdminCarouselView.tsx`
- [ ] `appkit/src/features/admin/components/AdminFaqsView.tsx`
- [ ] `appkit/src/features/admin/components/AdminCategoriesView.tsx`
- [ ] `appkit/src/features/admin/components/AdminDashboardView.tsx`
- [ ] `appkit/src/features/admin/components/AdminMediaView.tsx`
- [ ] `appkit/src/features/wishlist/components/WishlistView.tsx`
- [ ] `appkit/src/features/copilot/components/AdminCopilotView.tsx`
- [ ] `appkit/src/features/user/components/UserSettingsView.tsx`
- [ ] `appkit/src/features/user/components/UserOrdersView.tsx`
- [ ] `appkit/src/features/user/components/UserOffersView.tsx`
- [ ] `appkit/src/features/user/components/UserNotificationsView.tsx`
- [ ] `appkit/src/features/user/components/UserAddressesView.tsx`
- [ ] `appkit/src/features/user/components/ProfileView.tsx`
- [ ] `appkit/src/features/user/components/OrderDetailView.tsx`
- [ ] `appkit/src/features/user/components/MessagesView.tsx`
- [ ] `appkit/src/features/user/components/BecomeSellerView.tsx`

**30 UI components missing sibling `.style.css`:**
- [ ] `appkit/src/ui/components/Avatar.tsx`
- [ ] `appkit/src/ui/components/AvatarDisplay.tsx`
- [ ] `appkit/src/ui/components/BackgroundRenderer.tsx`
- [ ] `appkit/src/ui/components/BaseListingCard.tsx`
- [ ] `appkit/src/ui/components/Card.tsx`
- [ ] `appkit/src/ui/components/Checkbox.tsx`
- [ ] `appkit/src/ui/components/ConfirmDeleteModal.tsx`
- [ ] `appkit/src/ui/components/DashboardStatsCard.tsx`
- [ ] `appkit/src/ui/components/Div.tsx`
- [ ] `appkit/src/ui/components/Dropdown.tsx`
- [ ] `appkit/src/ui/components/DynamicSelect.tsx`
- [ ] `appkit/src/ui/components/EmptyState.tsx`
- [ ] `appkit/src/ui/components/FilterDrawer.tsx`
- [ ] `appkit/src/ui/components/FlowDiagram.tsx`
- [ ] `appkit/src/ui/components/Form.tsx`
- [ ] `appkit/src/ui/components/FormField.tsx`
- [ ] `appkit/src/ui/components/ImageGallery.tsx`
- [ ] `appkit/src/ui/components/Menu.tsx`
- [ ] `appkit/src/ui/components/PasswordStrengthIndicator.tsx`
- [ ] `appkit/src/ui/components/Radio.tsx`
- [ ] `appkit/src/ui/components/ResponsiveView.tsx`
- [ ] `appkit/src/ui/components/RoleBadge.tsx`
- [ ] `appkit/src/ui/components/RowActionMenu.tsx`
- [ ] `appkit/src/ui/components/Semantic.tsx`
- [ ] `appkit/src/ui/components/SideDrawer.tsx`
- [ ] `appkit/src/ui/components/SkipToMain.tsx`
- [ ] `appkit/src/ui/components/Tabs.tsx`
- [ ] `appkit/src/ui/components/Toast.tsx`
- [ ] `appkit/src/ui/components/Toggle.tsx`
- [ ] `appkit/src/ui/components/UnsavedChangesModal.tsx`

**Standalone style outliers:**
- [ ] `appkit/src/ui/DataTable.tsx` — needs sibling `DataTable.style.css`
- [ ] `appkit/src/ui/rich-text/RichText.tsx` — needs sibling `RichText.style.css`

Status: ❌ not started

#### W7 - Constants + Dedupe Closure (R8-R11)

**R9 wave 1 — appkit status literals to replace with typed enums:**
- [ ] `appkit/src/features/auth/hooks/useAuth.ts` — `authEvent.status === "pending"`
- [ ] `appkit/src/features/auth/actions/profile-actions.ts` — `p.status === "published"` (×2)
- [ ] `appkit/src/features/admin/actions/admin-read-actions.ts` — `p.status === "published"`
- [ ] `appkit/src/features/events/api/[id]/route.ts` — `event.status === "draft"`, `=== "paused"`
- [ ] `appkit/src/features/events/components/EventCard.tsx` — `event.status === "active"`
- [ ] `appkit/src/seo/json-ld.ts` — `product.status === "published"`
- [ ] `appkit/src/features/seller/actions/seller-actions.ts` — `o.status === "delivered"`, `p.status === "pending"`, `"processing"`, `"published"`, `order.status === "shipped"`, `"delivered"`
- [ ] `appkit/src/features/seller/actions/offer-actions.ts` — `offer.status === "expired"`
- [ ] `appkit/src/features/payments/repository/payout.repository.ts` — `status === "completed"`, `"failed"`
- [ ] `appkit/src/features/products/actions/product-actions.ts` — `p.status === "published"`
- [ ] `appkit/src/features/reviews/api/route.ts` — `r.status === "approved"`
- [ ] `appkit/src/features/reviews/actions/review-actions.ts` — `product.status === "published"`
- [ ] `appkit/src/features/orders/components/MarketplaceOrderCard.tsx` — `order.status === "delivered"`, `"shipped"`
- [ ] `appkit/src/features/promotions/actions/promotions-actions.ts` — `p.status === "published"` (×2)
- [ ] `appkit/src/features/stores/actions/store-query-actions.ts` — `p.status === "published"`
- [ ] `appkit/src/features/stores/repository/store.repository.ts` — `status === "active"`
- [ ] `appkit/src/features/orders/actions/refund-actions.ts` — `order.refundStatus === "completed"`

**R9 wave 2 — letitrip status literals:**
- [ ] `letitrip.in/functions/src/jobs/auctionSettlement.ts` — `r.status === "rejected"`
- [ ] `letitrip.in/functions/src/triggers/onProductWrite.ts` — `"published"` (×2)
- [ ] `letitrip.in/functions/src/triggers/onReviewWrite.ts` — `"approved"` (×2)
- [ ] `letitrip.in/functions/src/jobs/payoutBatch.ts` — `r.status === "rejected"`
- [ ] `letitrip.in/src/actions/admin.actions.ts` — `newStatus === "approved"`
- [ ] `letitrip.in/src/actions/seller.actions.ts` — `"shipped"`, `"delivered"`, `"confirmed"` (×3)
- [ ] `letitrip.in/src/app/api/admin/blog/route.ts` — `body!.status === "published"`
- [ ] `letitrip.in/src/app/api/admin/coupons/[id]/route.ts` — `body!.status === "published"`
- [ ] `letitrip.in/src/app/api/cart/route.ts` — `"out_of_stock"`, `"discontinued"`, `"sold"`, `"draft"` (×4)
- [ ] `letitrip.in/src/app/api/auth/google/callback/route.ts` — `"error"`, `"pending"`

**R10 — route path constants:**
- [ ] `letitrip.in/src/components/layout/Sidebar.tsx` — `pathname?.startsWith("/admin/")`, `"/seller/"` (multiple)
- [ ] `appkit/src/next/components/UnauthorizedView.tsx` — default prop `loginHref = "/auth/login"`
- [ ] `appkit/src/next/components/NotFoundView.tsx` — default prop `homeHref = "/"`

**R11 — TextLink dedupe:**
- [ ] Delete `letitrip.in/src/components/typography/TextLink.tsx`
- [ ] Rewire all 8 import sites to `@mohasinac/appkit/ui`
- [ ] `grep -r` verify no residual imports

- [ ] Remove remaining shim/re-export surfaces.
- [ ] Run final closure scan for raw status literals and route literals.
Status: ❌ not started

#### W8 - Server/Client Barrel Split + Guards (R12)

**B10 — Add `import "server-only"` to unguarded server files:** ✅ ALL DONE
- [x] All 26 files already had `import "server-only"` — fixed duplicate imports in all 26.
- [x] All 22 seed files already had `import "server-only"`.

**B10 — Add `import "client-only"` to client-dependent files:** ✅ ALL DONE
- [x] `appkit/src/features/cart/utils/guest-cart.ts` — already had `import "client-only"`
- [x] Added `client-only` package to `appkit/package.json` dependencies

**B11 — Remove server-only re-exports from `index.ts` (15 features with existing `server.ts`):** ✅ ALL DONE
- [x] `appkit/src/features/admin/index.ts` — removed repo re-exports + moved `export * from "./actions"` to server.ts
- [x] `appkit/src/features/auctions/index.ts` — removed repo re-exports + moved actions to server.ts
- [x] `appkit/src/features/auth/index.ts` — removed `consent-otp`, `token-store`, `repository`, `actions` re-exports
- [x] `appkit/src/features/blog/index.ts` — removed repo re-exports + moved actions to server.ts
- [x] `appkit/src/features/categories/index.ts` — removed repo re-exports + moved actions to server.ts
- [x] `appkit/src/features/events/index.ts` — removed repo re-exports + moved actions to server.ts
- [x] `appkit/src/features/faq/index.ts` — removed repo re-exports + moved actions to server.ts
- [x] `appkit/src/features/homepage/index.ts` — removed repo re-exports + moved actions to server.ts
- [x] `appkit/src/features/pre-orders/index.ts` — removed repo re-exports
- [x] `appkit/src/features/products/index.ts` — removed repo re-exports + moved actions to server.ts
- [x] `appkit/src/features/promotions/index.ts` — removed repo re-exports + moved actions to server.ts
- [x] `appkit/src/features/reviews/index.ts` — removed repo re-exports + moved actions to server.ts
- [x] `appkit/src/features/search/index.ts` — removed repo re-exports + moved actions to server.ts
- [x] `appkit/src/features/seller/index.ts` — removed repo re-exports + moved actions to server.ts
- [x] `appkit/src/features/stores/index.ts` — removed repo re-exports + moved actions to server.ts

Also moved `export * from "./actions"` to server.ts for these additional features:
- [x] `appkit/src/features/account` — actions to server.ts
- [x] `appkit/src/features/cart` — actions to server.ts
- [x] `appkit/src/features/checkout` — actions to server.ts
- [x] `appkit/src/features/orders` — actions to server.ts
- [x] `appkit/src/features/wishlist` — actions to server.ts

Internal appkit rewires completed:
- [x] `appkit/src/repositories/index.ts` — all imports rewired to direct repository files + `import "server-only"`
- [x] `appkit/src/core/unit-of-work.ts` — all imports rewired to direct repository files
- [x] 7 internal cross-feature action files rewired (admin-read-actions, admin-actions, admin-coupon-actions, chat-actions, seller-actions, review-actions, realtime-token-actions)

**B11 — Create `server.ts` for features that lacked it (13 features — cron excluded as universal):** ✅ ALL DONE
- [x] `appkit/src/features/account/server.ts` — exports `AccountRepository`, `AddressRepository`, `addressRepository` + actions
- [x] `appkit/src/features/cart/server.ts` — exports `CartRepository`, `cartRepository` + actions
- [x] `appkit/src/features/checkout/server.ts` — exports `failed-checkout.repository` + `checkout-actions`
- [x] `appkit/src/features/contact/server.ts` — exports `email.ts` exports
- [x] `appkit/src/features/orders/server.ts` — exports `OrderRepository`/`OrdersRepository`/`orderRepository` + actions
- [x] `appkit/src/features/payments/server.ts` — exports `PaymentsRepository`, `payoutRepository`
- [x] `appkit/src/features/wishlist/server.ts` — exports `WishlistRepository`, `UserWishlistRepository`/`wishlistRepository` + actions
- [x] `appkit/src/features/collections/server.ts` — exports `CollectionsRepository`
- [x] `appkit/src/features/consultation/server.ts` — exports `ConsultationsRepository`
- [x] `appkit/src/features/corporate/server.ts` — exports `CorporateRepository`
- [x] `appkit/src/features/loyalty/server.ts` — exports `LoyaltyRepository`
- [x] `appkit/src/features/before-after/server.ts` — exports `BeforeAfterRepository`
- [x] `appkit/src/features/whatsapp-bot/server.ts` — exports `helpers/whatsapp` crypto exports
- Note: `cron` excluded — module is universal (no crypto/firebase-admin/fs deps), stays in index.ts only

**B12 — Consumer rewire + package.json exports:** 🔄 PARTIAL (deferred to letitrip end-state rewrite)
- [x] Verify `./features/*/server` export path in `appkit/package.json` resolves for all 29 features with server code.

**Completed letitrip rewires (16/28 action files + API routes):**
- [x] `seller.actions.ts` — `userRepository` → `auth/server`, `orderRepository` → `orders/server`
- [x] `seller-coupon.actions.ts` — `userRepository` → `auth/server`
- [x] `checkout.actions.ts` — `checkout/server` + `auth/server`
- [x] `profile.actions.ts` → `auth/server`
- [x] `realtime-token.actions.ts` → `auth/server`
- [x] `address.actions.ts` → `account/server`
- [x] `admin-coupon.actions.ts` → `admin/server`
- [x] `admin-read.actions.ts` → `admin/server`
- [x] `admin.actions.ts` → `admin/server`
- [x] `cart.actions.ts` → `cart/server`
- [x] `category.actions.ts` → `categories/server`
- [x] `order.actions.ts` → `orders/server`
- [x] `review.actions.ts` → `reviews/server`
- [x] `site-settings.actions.ts` → `admin/server`
- [x] `store-address.actions.ts` → `stores/server`
- [x] `coupon.actions.ts` → `promotions/server` (value import only)
- [x] `promotions.actions.ts` → `promotions/server` (value import only)
- [x] `refund.actions.ts` → `orders/server` (value import only)
- [x] `search.actions.ts` → `search/server` (value import only)
- [x] `store.actions.ts` → `stores/server` (value import only)
- [x] `wishlist.actions.ts` → `wishlist/server` (value import only)
- [x] All 13 contact email imports in API routes → `contact/server`
- [x] `app/api/checkout/route.ts` — `failedCheckoutRepository` → `checkout/server`, `consentOtpRef` → `auth/server`
- [x] `app/api/payment/verify/route.ts` — `failedCheckoutRepository` → `checkout/server`, `consentOtpRef` → `auth/server`

**Remaining letitrip rewires (deferred to end-state rewrite):**
12 action files need split imports (mixed functions + types in one import statement):
- [ ] `bid.actions.ts` (auctions) — split functions→`/server`, types stay on barrel
- [ ] `blog.actions.ts` (blog) — split functions→`/server`, schemas+types stay on barrel
- [ ] `carousel.actions.ts` (homepage) — split functions→`/server`, types stay on barrel
- [ ] `chat.actions.ts` (admin) — split functions→`/server`, types stay on barrel
- [ ] `event.actions.ts` (events) — split functions→`/server`, types stay on barrel
- [ ] `faq.actions.ts` (faq) — split functions→`/server`, schemas+types stay on barrel
- [ ] `notification.actions.ts` (admin) — split functions→`/server`, type stays on barrel
- [ ] `offer.actions.ts` (seller) — split functions→`/server`, types stay on barrel
- [ ] `product.actions.ts` (products) — split functions→`/server`, type stays on barrel
- [ ] `sections.actions.ts` (homepage) — split functions→`/server`, schemas+types stay on barrel
- [ ] `seller-coupon.actions.ts` (promotions) — split functions→`/server`, types stay on barrel
- [ ] `seller.actions.ts` (seller) — split functions→`/server`, types stay on barrel

Additional deferred items:
- [ ] Rewire remaining `letitrip.in/src/app/api/` route files importing domain actions from barrels
- [ ] Rewire `letitrip.in/functions/src/repositories/` imports (or delete files per W3)
- [ ] Add `import "client-only"` to additional browser-dependent hooks if identified
- [ ] Validate: typecheck appkit, typecheck letitrip.in, typecheck functions
Status: 🔄 partial — remaining deferred to letitrip end-state rewrite

### High-Confidence Dependency Chain (Updated)

1. W0 tracker baseline (completed)
2. W8 server/client barrel split + guards (R12) — **can start immediately, no dependency on W1**
3. W1 baseline resolver (must land first for market-related work)
4. W2 seed parameterization and W5 render-format kit (parallel after W1)
5. W3 schema/repository closure (after W1, with W2 outputs available)
6. W4 thin wrapper enforcement (after W3)
7. W6 SSR/style hardening (after W3 + W5)
8. W7 constants/dedupe closure and final verification

### Validation Matrix (Per Batch)

| Validation | Command intent | Required for |
|---|---|---|
| Typecheck (appkit) | Ensure shared package integrity after ownership/default changes | W1-W7 |
| Typecheck (letitrip.in) | Ensure consumer wiring remains valid after rewires | W3-W7 |
| Typecheck (functions) | Ensure trigger/job repository and enum rewires are safe | W3, W7 |
| Smoke tests | Guard route/action regressions after wrapper/constants refactors | W4, W7 |
| Tracker sync | Keep Gap.md status truthful after each batch | every batch |

### Execution Strategy

**Appkit-first**: Complete all appkit-owned work (W1-W8) before touching letitrip further. Letitrip consumer rewires (remaining B12, W3-W4, W7 wave 2) will be done as a single end-state rewrite pass after all appkit architecture is stable.

### Next Safest Batch Recommendation

Recommended next implementation batch: `B01 (W1 baseline resolver contract)`

Reason:
- B10 ✅ done (server-only guards)
- B11 ✅ done (appkit barrel split — all server.ts created, index.ts cleaned, actions moved, internal rewires done)
- B12 🔄 partial (letitrip consumer rewires deferred to end-state rewrite)
- B01 unblocks R1-dependent items (`R2`, `R3`, `R9`) and phases 1-3
- All remaining appkit workstreams (W1-W7) can proceed without waiting for letitrip rewires
- Letitrip will be rewired as a complete pass at the end, after appkit architecture is fully stable
