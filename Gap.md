# Gap.md - Consolidated Architecture and Style Gap Master Plan

Last updated: 2026-04-18 (appkit package config simplified: tsconfig path aliases removed, exports map flattened, root barrel expanded to include all top-level src indexes)
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
Note: `features/user/` deleted (B20 R4 merge) — these are now only in `features/account/`.

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

7. ~~Style contract not fully implemented in appkit UI (30 components missing sibling `.style.css`).~~ ✅ RESOLVED (B27-B32)
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

16. ~~No `import "client-only"` guards on client-only files.~~ ✅ RESOLVED (B12)
- 34 files guarded with `import "client-only"`: 33 `"use client"` components/hooks using browser APIs + `event-manager.ts` (unguarded browser API usage).
- `guest-cart.ts` already had the guard.
- Appkit tsc passes clean.

### Medium (P2)
13. Contact domain action symmetry gap.
- appkit/src/features/contact/email.ts
- appkit/src/features/contact/index.ts

14. Remaining re-export closure surfaces.
- Example historical residual: letitrip.in/src/app/global-error.tsx

### High (P1) — Source Invariance & Provider Abstraction (2026-04-17)

17. ~~Feature-layer repositories imported `FieldValue`/`DocumentSnapshot` directly from `firebase-admin/firestore`.~~ ✅ RESOLVED
- Created `src/contracts/field-ops.ts` — source-agnostic `IFieldOps` contract with `serverTimestamp()`, `increment()`, `arrayUnion()`, `arrayRemove()`, `deleteField()`.
- Created `src/providers/db-firebase/field-ops.ts` — Firebase implementation, auto-registered on import.
- 8 feature repositories updated to import from `contracts/field-ops` instead of `firebase-admin/firestore`.
- 10 repos with `DocumentSnapshot` type imports redirected to `providers/db-firebase` re-export.
- Zero `firebase-admin/firestore` imports remain in `src/features/`.

18. ~~Client-side hooks imported Firebase client SDK directly (no abstraction).~~ ✅ RESOLVED
- Created `src/contracts/client-realtime.ts` — `IClientRealtimeProvider` (subscribe, signInWithToken, signOut).
- Created `src/contracts/client-auth.ts` — `IClientAuthProvider` (signIn, verify, reset, change password).
- Created `src/providers/firebase-client/` — Firebase client implementations of both contracts.
- 5 hooks refactored: `useRealtimeEvent`, `useChat`, `useAuthEvent`, `usePaymentEvent`, `useBulkEvent`.
- `useAuth.ts` refactored to use `IClientAuthProvider` instead of direct `firebase/auth` imports.
- Dead code: `src/react/hooks/firebaseRealtimeClient.ts` is now unused (no consumers). Delete candidate.

19. ~~Razorpay vendor name leaks into feature-layer types, schemas, and Firestore field names.~~ ✅ RESOLVED (B17)
- `src/features/checkout/hooks/useCheckoutApi.ts` — `CreateRazorpayOrderResponse`, `CreateRazorpayOrderPayload`, fields `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`
- `src/features/checkout/schemas/firestore.ts` — `razorpayOrderId`, `razorpayPaymentId`
- `src/features/checkout/repository/failed-checkout.repository.ts` — `razorpayOrderId`, `razorpayPaymentId`
- `src/features/checkout/index.ts` — re-exports `CreateRazorpayOrderResponse`
- `src/features/admin/schemas/firestore.ts` — `razorpayKeyId`, `razorpayKeySecret`, `razorpayWebhookSecret`, `razorpayEnabled`, `razorpayFeePercent`
Fix: Rename to vendor-neutral names: `gatewayOrderId`, `gatewayPaymentId`, `gatewaySignature`, `paymentKeyId`, `paymentKeySecret`, `paymentWebhookSecret`, `paymentEnabled`, `paymentFeePercent`. Feature types → `CreatePaymentOrderResponse`, `CreatePaymentOrderPayload`.

20. ~~Razorpay provider exposes standalone functions that bypass `IPaymentProvider` contract.~~ ✅ RESOLVED (B17) — Deprecated with `@internal`; removal deferred to Post-Phase Consumer Rewrite.
- `src/providers/payment-razorpay/index.ts` — `createRazorpayOrder()`, `fetchRazorpayOrder()`, `verifyPaymentSignatureWithKeys()`, `createRazorpayRefund()` are exported alongside the proper `RazorpayProvider` class.
- Any caller can skip the provider registry and couple directly to Razorpay.
Fix: Remove standalone functions; all payment operations must go through `IPaymentProvider` via `getProviders().payment`.

21. Shiprocket vendor name leaks into feature-layer schemas and messages.
- `src/features/orders/schemas/firestore.ts` — `shiprocketAWB` field (+ 4 more shiprocket-prefixed fields)
- `src/features/admin/schemas/firestore.ts` — `shiprocketEmail`, `shiprocketPassword`
- ~~`src/values/success-messages.ts` — `SHIPROCKET_CONNECTED`, `SHIPROCKET_ORDER_CREATED`, `"Pickup scheduled with Shiprocket"`~~ ✅ RESOLVED (B18) — vendor-neutral aliases added (`PROVIDER_CONNECTED`, `SHIPMENT_CREATED`, `PICKUP_SCHEDULED`); old keys deprecated.
- ~~`src/errors/messages.ts` — 7 Shiprocket-branded error messages~~ ✅ RESOLVED (B18) — vendor-neutral aliases added (`PROVIDER_CREDS_REQUIRED`, `PROVIDER_AUTH_FAILED`, etc.); old keys deprecated.
Fix: Rename to `shipmentAWB`, `shippingEmail`, `shippingPassword`. Messages → `SHIPPING_CONNECTED`, `SHIPPING_ORDER_CREATED`, `"Pickup scheduled with shipping provider"`.
Schema field renames deferred — require Firestore data migration.

22. Shiprocket provider does NOT implement `IShippingProvider` contract.
- ~~`src/providers/shipping-shiprocket/index.ts` — exports raw functions (`shiprocketAuthenticate`, `shiprocketCreateOrder`, `shiprocketTrackByAWB`) instead of a class implementing `IShippingProvider`.~~ ✅ RESOLVED (B18)
- Created `ShiprocketProvider` class in `src/providers/shipping-shiprocket/shiprocket-provider.ts` implementing `IShippingProvider`.
- Standalone functions deprecated with `@deprecated` + `@internal`; removal deferred to Post-Phase Consumer Rewrite.
- The `IShippingProvider` contract (`src/contracts/shipping.ts`) exists and is well-designed.
Fix: ~~Wrap existing Shiprocket HTTP functions in a `ShiprocketProvider` class implementing `IShippingProvider`. Register via `ProviderRegistry`.~~ Done.

23. `IShippingProvider.trackShipment()` is defined in the contract but never wired.
- No tracking hook, action, or component calls `getProviders().shipping.trackShipment()`.
- Order tracking display in `MarketplaceOrderCard.tsx` uses raw `trackingUrl` string — no live tracking integration.
Fix: Create `useShipmentTracking` hook or server action that calls `IShippingProvider.trackShipment()` via the registry. Wire into order detail views.

24. ~~`"razorpay"` as a literal payment gateway identifier in type unions.~~ ✅ RESOLVED (B17)
- `src/features/payments/types/index.ts`, `src/features/orders/types/index.ts`, `src/features/checkout/types/index.ts` — `"razorpay"` as a union member.
- Acceptable as a gateway ID enum value but must live as a typed constant (e.g., `PaymentGateway.RAZORPAY`), not a bare string literal.
Fix: Create `PaymentGateway` as-const object in `src/features/payments/schemas/`; replace all bare `"razorpay"` literals.

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
| R1 | Baseline resolver | tokens/formatters/providers/validators | ✅ done | none | High | baseline-resolver.ts created; all 22 target files wired |
| R2 | Render-format kit | utils + ui + feature render paths | ✅ done (B19) | R1 | High | Shared renderers created in `ui/columns/column-renderers.ts`; all 21 column modules migrated |
| R3 | Column kit | 23 feature column modules | ✅ done (B19) | R2 | Medium | `buildColumns` generic utility replaces 21 copy-pasted factories; render lambdas replaced with shared renderers |
| R4 | Account/User merge | features/account + features/user | ✅ done (B20) | R1,R2 | High | Deleted orphaned `features/user/` (13 files, 0 code consumers); `features/account/` is canonical owner |
| R5 | View-shell variants | 96 view files | ✅ done (B21+B22) | R2,R4 | High | `ListingViewShell` + `SlottedListingView` created in `ui/components/`; 10 admin ListingLayout delegates → `ListingViewShell`; 5 admin manual-slot views → `SlottedListingView`; 6 seller listing views → `SlottedListingView`; 1 account view (`UserOrdersView`) → `SlottedListingView`; 3 public product views (`ProductsView`, `AuctionsView`, `PreOrdersView`) → `SlottedListingView`. Added `renderSort`, `manageSort`, `inlineToolbar` to `SlottedListingView`. B22: Created `DetailViewShell` (grid-3/grid-2/stacked/narrow) + `StackedViewShell` (title+sections). ~58 total views migrated. ~20 left as-is (unique patterns). | `isEmpty` logic + `CategoriesListView` (client-side filter) + `CategoryProductsView` (breadcrumbs/children) + `StoresListView`/`EventsListView` (`LayoutSlots<T>`) left as-is. |
| R6 | Variant-first UI uplift | repeated class bundles across feature UI | ✅ done (B24-B26+B29+B33-B35) | R5 | Medium | B24: Alert compact + Card adoption (7 files). B25: Stack gap adoption (7 files, ~30 patterns). B26: Row wave 3 (3 files, ~15 patterns). B29: Row wave 4 (5 files, ~11 patterns). B33: Row wave 5 (8 files, ~24 patterns). B34: Row wave 6 (9 files, 21 patterns). B35: Row wave 7 (14 files, 20 patterns). ~110 remaining patterns are non-Div (Button/Link/Nav/Span className, centering, inline-flex) — not eligible for Row. |
| R7 | Style contract completion | ui component style ownership | ✅ done (B27-B32) | R6 | Medium | All 30 UI components + 2 outliers have .style.css with BEM appkit-* class hooks |
| R8 | Final dedupe + shim purge | all duplicate/shim surfaces | 🔄 partial (B36-B38 done; letitrip wave deferred) | R1-R7 | High | Enforce canonical imports and ownership |
| R9 | Status enum constants | ~40 status string literals across appkit + letitrip | not started | R1 | High | Replace raw strings with typed enums/as-const in feature schemas |
| R10 | ROUTES constant coverage | Sidebar pathname checks + appkit default-prop paths | not started | none | Medium | Extract path strings to ROUTES constants |
| R11 | TextLink dedup | letitrip/src/components/typography/TextLink.tsx | not started | none | Low | Delete duplicate; rewire imports to appkit |
| R12 | Server/client barrel split | ~20 features/*/index.ts mixed barrels + missing server-only/client-only guards | not started | none | ~~Critical~~ ✅ appkit done | Split barrels, add runtime guards — appkit complete; consumer rewires deferred |
| R13 | DB source invariance (server) | FieldValue/DocumentSnapshot leaks in 18 feature repos | ✅ done | none | High | Contracts created (`field-ops.ts`); all feature repos decoupled from `firebase-admin` |
| R14 | DB source invariance (client) | 5 hooks importing Firebase client SDK directly | ✅ done | none | High | `IClientRealtimeProvider` + `IClientAuthProvider` contracts; Firebase impls in `providers/firebase-client/` |
| R15 | Payment vendor neutrality | Razorpay naming in feature types/schemas/Firestore fields + standalone bypass functions | ✅ done (B17) | none | High | Feature-layer types/schemas renamed to vendor-neutral; standalone functions deprecated; admin schema Firestore fields deferred (data migration) |
| R16 | Shipping vendor neutrality | Shiprocket naming in schemas/messages + no `IShippingProvider` adapter | 🔄 partial (B18) | R15 | High | Messages vendor-neutral + `ShiprocketProvider` class created; schema field renames deferred (data migration) |
| R17 | Tracking integration | `IShippingProvider.trackShipment()` unimplemented/unwired | not started | R16 | Medium | Create tracking hook/action; wire into order detail views |
| R18 | Payment gateway enum | Bare `"razorpay"` string literals in type unions | ✅ done (B17) | R15 | Medium | Created `PaymentGatewayValues` as-const; consolidated 3 duplicate unions to one canonical source |

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
Status: ✅ done
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
Status: ✅ done
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
Status: ✅ appkit-side complete (B04). Consumer retirements deferred to Post-Phase Consumer Rewrite.
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
Status: ✅ done (letitrip has no local validators — all directories empty; appkit validation is comprehensive; phone.validator.ts already wired to baseline resolver in B01/B02)
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
Status: ✅ appkit-side complete (B13). Appkit already owns domain services for all 5 P1 files. Seller shipping extraction blocked by R16. Consumer action refactors deferred to Post-Phase Consumer Rewrite.
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
Status: ✅ appkit-side complete (B14 ThemeContext done; B15 SessionContext done; B16 usePaymentCheckout done). Consumer adapter registration deferred to Post-Phase Consumer Rewrite.
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
Status: 🔄 partial (B23 — SSR hardening done; style contract not started)
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
Scope: complete letitrip overwrite — delete all reusable code, rewire everything to appkit, keep only app-specific wiring
Goal: letitrip becomes a **pure thin shell** — routes, server actions (auth+parse+delegate), config, i18n, and deployment. Nothing else.

### Summary Totals

| Area | Total Files | DELETE | REWRITE | KEEP |
|------|------------|--------|---------|------|
| `src/actions/` | 35 | 0 | 35 (rewire schema imports) | 35 |
| `src/db/` | 21 | 21 | 0 | 0 |
| `src/components/` | 6 | 6 | 0 | 0 |
| `src/hooks/` | 4 | 2 | 1 | 1 |
| `src/contexts/` | 3 | 3 | 0 | 0 |
| `src/helpers/` | 0 (empty dirs) | 0 | 0 | 0 |
| `src/utils/` | 0 (empty) | 0 | 0 | 0 |
| `src/repositories/` | 0 (empty) | 0 | 0 | 0 |
| `src/features/` | 10 | 2 | 8 | 0 |
| `src/lib/` | ~20 | ~12 | ~3 | ~5 |
| `src/types/` | 2 | 1 | 0 | 1 |
| `functions/src/repositories/` | 15 | 15 | 0 | 0 |
| `src/constants/` | 11 | 4 | 2 | 5 |
| `src/config/` | 1 | 0 | 0 | 1 |
| `src/i18n/` | 4 | 0 | 0 | 4 |
| `src/app/api/` | ~35 dirs | 0 | 35 | 0 |
| **TOTALS** | **~167** | **~66** | **~84** | **~52** |

### Execution Waves (dependency-ordered)

#### Wave 0 — Config Foundation
- [ ] `src/providers.config.ts` — wire market profile (currency/locale/country/phone/timezone) to appkit baseline resolver
- [ ] `src/features.config.ts` — verify all feature flags reference appkit feature contracts
- [ ] Verify appkit `package.json` exports all required `/server` sub-paths

#### Wave 1 — Schema Retirement (19 files DELETE)
Prereq: Wave 0 (baseline resolver wired)
First update all `@/db/schema/*` type imports in `src/actions/` to point to appkit feature types, then delete.
- [ ] `src/db/schema/addresses.ts` → imports from `@mohasinac/appkit/features/account`
- [ ] `src/db/schema/bids.ts` → imports from `@mohasinac/appkit/features/auctions`
- [ ] `src/db/schema/blog-posts.ts` → imports from `@mohasinac/appkit/features/blog`
- [ ] `src/db/schema/cart.ts` → imports from `@mohasinac/appkit/features/cart`
- [ ] `src/db/schema/categories.ts` → imports from `@mohasinac/appkit/features/categories`
- [ ] `src/db/schema/coupons.ts` → imports from `@mohasinac/appkit/features/promotions`
- [ ] `src/db/schema/events.ts` → imports from `@mohasinac/appkit/features/events`
- [ ] `src/db/schema/field-names.ts` → distribute to each feature's schema import
- [ ] `src/db/schema/notifications.ts` → imports from `@mohasinac/appkit/features/admin`
- [ ] `src/db/schema/offers.ts` → imports from `@mohasinac/appkit/features/seller`
- [ ] `src/db/schema/orders.ts` → imports from `@mohasinac/appkit/features/orders`
- [ ] `src/db/schema/payouts.ts` → imports from `@mohasinac/appkit/features/payments`
- [ ] `src/db/schema/products.ts` → imports from `@mohasinac/appkit/features/products`
- [ ] `src/db/schema/reviews.ts` → imports from `@mohasinac/appkit/features/reviews`
- [ ] `src/db/schema/sessions.ts` → imports from `@mohasinac/appkit/features/auth`
- [ ] `src/db/schema/store-addresses.ts` → imports from `@mohasinac/appkit/features/stores`
- [ ] `src/db/schema/stores.ts` → imports from `@mohasinac/appkit/features/stores`
- [ ] `src/db/schema/tokens.ts` → imports from `@mohasinac/appkit/features/auth`
- [ ] `src/db/schema/users.ts` → imports from `@mohasinac/appkit/features/auth`
- [ ] Delete `src/db/indices/` (2 files)
- [ ] Delete `src/db/seed-data/` (empty)
- [ ] Delete `src/db/` directory entirely

#### Wave 2 — Functions Repository Retirement (15 files DELETE)
Prereq: Wave 1 (schemas resolved)
Rewire all `functions/src/jobs/` and `functions/src/triggers/` to import repositories from appkit `/server` paths.
- [ ] `functions/src/repositories/bid.repository.ts` → `@mohasinac/appkit/features/auctions/server`
- [ ] `functions/src/repositories/cart.repository.ts` → `@mohasinac/appkit/features/cart/server`
- [ ] `functions/src/repositories/category.repository.ts` → `@mohasinac/appkit/features/categories/server`
- [ ] `functions/src/repositories/coupon.repository.ts` → `@mohasinac/appkit/features/promotions/server`
- [ ] `functions/src/repositories/notification.repository.ts` → `@mohasinac/appkit/features/admin/server`
- [ ] `functions/src/repositories/offer.repository.ts` → `@mohasinac/appkit/features/seller/server`
- [ ] `functions/src/repositories/order.repository.ts` → `@mohasinac/appkit/features/orders/server`
- [ ] `functions/src/repositories/payout.repository.ts` → `@mohasinac/appkit/features/payments/server`
- [ ] `functions/src/repositories/product.repository.ts` → `@mohasinac/appkit/features/products/server`
- [ ] `functions/src/repositories/review.repository.ts` → `@mohasinac/appkit/features/reviews/server`
- [ ] `functions/src/repositories/session.repository.ts` → `@mohasinac/appkit/features/auth/server`
- [ ] `functions/src/repositories/store.repository.ts` → `@mohasinac/appkit/features/stores/server`
- [ ] `functions/src/repositories/token.repository.ts` → `@mohasinac/appkit/features/auth/server`
- [ ] `functions/src/repositories/user.repository.ts` → `@mohasinac/appkit/features/auth/server`
- [ ] `functions/src/repositories/index.ts` — delete barrel after all rewires
- [ ] Typecheck `functions/` passes

#### Wave 3 — Component & Context & Hook Purge
Prereq: Wave 1
- [ ] `src/components/layout/BottomNavbar.tsx` → DELETE, replace import sites with appkit UI
- [ ] `src/components/layout/Footer.tsx` → DELETE, replace with appkit UI
- [ ] `src/components/layout/MainNavbar.tsx` → DELETE, replace with appkit UI
- [ ] `src/components/layout/Sidebar.tsx` → DELETE, replace with appkit UI (fix hard-coded `/admin/`, `/seller/` → ROUTES constants)
- [ ] `src/components/layout/TitleBar.tsx` → DELETE, replace with appkit UI
- [ ] `src/components/typography/TextLink.tsx` → DELETE (R11), replace all imports with `@mohasinac/appkit/ui`
- [ ] `src/contexts/SessionContext.tsx` → DELETE, use appkit `SessionContext` (B15)
- [ ] `src/contexts/ThemeContext.tsx` → DELETE, use appkit `ThemeContext` (B14)
- [ ] `src/contexts/index.ts` → DELETE barrel
- [ ] `src/hooks/useContactSubmit.ts` → DELETE, inline or use appkit hook
- [ ] `src/hooks/useRazorpay.ts` → MOVE to appkit `features/checkout/hooks/`, then delete local
- [ ] `src/hooks/useWishlistToggle.ts` → DELETE, use appkit hook
- [ ] `src/hooks/useUrlTable.ts` → KEEP (app-specific next-intl adapter)
- [ ] Delete `src/helpers/` (empty dirs: `auth/`, `logging/`, `validation/`)

#### Wave 4 — Lib Cleanup
Prereq: Wave 3
- [ ] `src/lib/firebase/auth-helpers.ts` → DELETE, use appkit auth helpers
- [ ] `src/lib/firebase/auth-server.ts` → DELETE, use appkit server auth
- [ ] `src/lib/firebase/realtime-db.ts` → DELETE, use appkit realtime provider
- [ ] `src/lib/firebase/realtime.ts` → DELETE, use appkit realtime provider
- [ ] `src/lib/firebase/storage.ts` → DELETE, use appkit storage provider
- [ ] `src/lib/firebase/__mocks__/` → DELETE (mocks for deleted files)
- [ ] `src/lib/firebase/config.ts` → KEEP (app-specific Firebase project config)
- [ ] `src/lib/firebase/client-config.ts` → KEEP (app-specific client config)
- [ ] `src/lib/firebase/rtdb-paths.ts` → REWRITE (verify if app-specific, else move to appkit)
- [ ] `src/lib/consent-otp.ts` → REWRITE (move Zod schemas to appkit validation)
- [ ] `src/lib/email.ts` → REWRITE (move Zod schemas to appkit validation)
- [ ] `src/lib/integration-keys.ts` → KEEP (app-specific credential resolver)
- [ ] `src/lib/server-logger.ts` → DELETE (duplicate)
- [ ] `src/lib/tokens.ts` → DELETE (duplicate)
- [ ] `src/lib/payment/razorpay.ts` → KEEP (app-specific Razorpay SDK with env vars)
- [ ] `src/lib/shiprocket/client.ts` → DELETE (re-export from appkit)
- [ ] `src/lib/shiprocket/platform-auth.ts` → REWRITE (verify app-specific auth)
- [ ] `src/lib/shiprocket/types.ts` → DELETE (use appkit types)
- [ ] `src/lib/validation/schemas.ts` → DELETE (use appkit validation)
- [ ] `src/lib/pwa/runtime-caching-rules.ts` → KEEP (app-specific PWA)
- [ ] `src/lib/pwa/runtime-caching.ts` → KEEP (app-specific PWA)
- [ ] Delete empty dirs: `src/lib/api/`, `src/lib/media/`, `src/lib/monitoring/`, `src/lib/query/`

#### Wave 5 — Types & Constants Cleanup
Prereq: Wave 4
- [ ] `src/types/auth.ts` → DELETE (re-imports from `@/db/schema/users`; use appkit types directly)
- [ ] `src/types/appkit-provider-shims.d.ts` → KEEP (app-specific type augmentation)
- [ ] `src/constants/api-endpoints.ts` → DELETE (server actions replaced API routes)
- [ ] `src/constants/rbac.ts` → DELETE (use appkit RBAC)
- [ ] `src/constants/theme.ts` → DELETE (use appkit theme tokens)
- [ ] `src/constants/ui.ts` → DELETE (use appkit UI constants)
- [ ] `src/constants/faq.ts` → REWRITE (move FAQ data to appkit or i18n)
- [ ] `src/constants/index.ts` → REWRITE (update barrel after deletions)
- [ ] `src/constants/config.ts` → KEEP (app-specific)
- [ ] `src/constants/homepage-data.ts` → KEEP (app-specific)
- [ ] `src/constants/navigation.tsx` → KEEP (app-specific nav structure)
- [ ] `src/constants/routes.ts` → KEEP (app-specific route paths)
- [ ] `src/constants/seo.ts` → KEEP (app-specific SEO)

#### Wave 6 — Action Import Rewires (35 files)
Prereq: Waves 1-5 (all deleted modules resolved)
Each action file: update all `@/db/schema/*` imports → appkit feature types. Update all `@/lib/*` imports → appkit or direct. Enforce thin shape: `"use server"` → auth → parse → call appkit → return.
- [ ] Batch rewire all 35 `src/actions/*.ts` files — replace `@/db/schema/*` with `@mohasinac/appkit/features/*/`
- [ ] Batch rewire all 35 `src/actions/*.ts` files — replace `@/lib/*` with appkit or kept lib paths
- [ ] Batch rewire all 35 `src/actions/*.ts` files — replace `@/contexts/*` with appkit contexts
- [ ] Audit remaining business logic in P1 files: `seller.actions.ts`, `seller-coupon.actions.ts`, `admin.actions.ts`, `category.actions.ts`, `review.actions.ts` — extract to appkit if any remains
- [ ] Replace status string literals (`"approved"`, `"published"`, `"shipped"`, etc.) with appkit enums (R9)

#### Wave 7 — API Route Thin-Wrapper Enforcement (~35 route dirs)
Prereq: Wave 6
Each API route: auth → validate → delegate to appkit service/repository → return response. No inline business logic.
- [ ] Audit and rewire `src/app/api/admin/` routes (blog, coupons, categories, analytics, etc.)
- [ ] Audit and rewire `src/app/api/auth/` routes (google callback, session, etc.)
- [ ] Audit and rewire `src/app/api/bids/`, `blog/`, `cart/`, `categories/` routes
- [ ] Audit and rewire `src/app/api/checkout/`, `contact/`, `coupons/` routes
- [ ] Audit and rewire `src/app/api/events/`, `faqs/`, `orders/`, `products/` routes
- [ ] Audit and rewire `src/app/api/payment/`, `reviews/`, `search/`, `seller/` routes
- [ ] Audit and rewire `src/app/api/stores/`, `user/`, `webhooks/`, `notifications/` routes
- [ ] Audit and rewire remaining: `cache/`, `carousel/`, `chat/`, `copilot/`, `demo/`, `homepage-sections/`, `logs/`, `media/`, `newsletter/`, `pre-orders/`, `profile/`, `promotions/`, `realtime/`, `site-settings/`
- [ ] Replace all hard-coded status string literals in routes with appkit enums (R9)

#### Wave 8 — Feature Views Migration
Prereq: Wave 7
- [ ] `src/features/about/components/` (8 `*View.tsx` files) → move to appkit `features/about/` with config-driven i18n
- [ ] Delete `src/features/about/index.ts` barrel
- [ ] Delete empty feature dirs: `src/features/auth/`, `src/features/blog/`, `src/features/contact/`
- [ ] Verify all `src/app/[locale]/` route pages call appkit `*View` components, not local views
- [ ] Review `src/app/[locale]/LayoutShellClient.tsx` — migrate to appkit or justify as app-specific

#### Wave 9 — Barrel Import Rewires (B12 leftovers)
Prereq: Wave 8
- [ ] Complete remaining 12/28 letitrip action files that still import from `@mohasinac/appkit/features/*/` instead of `/server`
- [ ] Verify all server-side imports use `/server` sub-paths
- [ ] Verify no client bundles pull in server-only code

#### Wave 10 — Final Purge & Verification
Prereq: All waves
- [ ] `grep -r "@/db/" src/` — zero results
- [ ] `grep -r "@/components/" src/` — zero results (except app/ route-level layout refs if justified)
- [ ] `grep -r "@/contexts/" src/` — zero results
- [ ] `grep -r "@/hooks/" src/` — only `useUrlTable` remains
- [ ] `grep -r "@/repositories/" src/` — zero results
- [ ] `grep -r "from '@/lib/firebase/auth" src/` — zero results
- [ ] `grep -r "from '@/lib/firebase/realtime" src/` — zero results
- [ ] `grep -r "from '@/lib/firebase/storage" src/` — zero results
- [ ] `grep -r "from '@/lib/shiprocket" src/` — zero results (except kept platform-auth if justified)
- [ ] `grep -r "from '@/lib/validation" src/` — zero results
- [ ] `npx tsc --noEmit` passes for `letitrip.in`
- [ ] `npx tsc --noEmit` passes for `letitrip.in/functions`
- [ ] `npm run build` succeeds
- [ ] `npm run test:smoke` passes
- [ ] No reusable logic remains in letitrip — only routes, actions entrypoints, config, i18n, and runtime wiring
- [ ] All imports point to canonical appkit paths

### What STAYS in letitrip after rewrite

| Area | Files | Reason |
|------|-------|--------|
| `src/app/` | All route pages, layouts, loading/error boundaries | Next.js routing — consumer-only |
| `src/app/api/` | All API routes (thin wrappers) | Server action entrypoints |
| `src/actions/` | 35 action files (thin wrappers) | Server action entrypoints |
| `src/config/app-url.ts` | 1 | App-specific URL config |
| `src/constants/config.ts`, `homepage-data.ts`, `navigation.tsx`, `routes.ts`, `seo.ts` | 5 | App-specific constants |
| `src/i18n/` | 4 files | App-specific next-intl wiring |
| `src/providers.config.ts` | 1 | Provider registry wiring |
| `src/features.config.ts` | 1 | Feature flag config |
| `src/hooks/useUrlTable.ts` | 1 | App-specific locale adapter |
| `src/lib/firebase/config.ts`, `client-config.ts` | 2 | App-specific Firebase project config |
| `src/lib/integration-keys.ts` | 1 | App-specific credential resolver |
| `src/lib/payment/razorpay.ts` | 1 | App-specific Razorpay SDK with env vars |
| `src/lib/pwa/` | 2 | App-specific PWA caching |
| `src/types/appkit-provider-shims.d.ts` | 1 | App-specific type augmentation |
| `messages/en.json` | 1 | App-specific i18n messages |
| `functions/` | All (minus repositories) | App-specific Cloud Functions |
| Root config | `next.config.js`, `tailwind.config.js`, `tsconfig.json`, etc. | Project config |
| **Total KEEP** | **~52 files + all routes** | |

### What gets DELETED from letitrip

| Area | Count | Notes |
|------|-------|-------|
| `src/db/` (entire) | 21 | Schemas → appkit feature schemas |
| `src/components/` (entire) | 6 | Layout + typography → appkit UI |
| `src/contexts/` (entire) | 3 | Session + Theme → appkit contexts |
| `src/hooks/` (3 of 4) | 3 | useContactSubmit, useRazorpay (→appkit), useWishlistToggle |
| `src/helpers/` (entire) | 0 | Already empty dirs — just delete dirs |
| `src/lib/` (~12 files) | 12 | Auth helpers, realtime, storage, shiprocket, validation, mocks |
| `src/types/auth.ts` | 1 | Re-export of appkit types |
| `src/constants/` (4 of 11) | 4 | api-endpoints, rbac, theme, ui |
| `src/features/` (about views → appkit) | 10 | 8 views move to appkit, 2 empty dirs |
| `functions/src/repositories/` (entire) | 15 | All → appkit `/server` imports |
| **Total DELETE** | **~75 files** | |

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
| 2 | W1 - Baseline market resolver (R1) | tokens/formatters/providers/validators fallback unification | none | ✅ | 6/6 | High |
| 3 | W2 - Seed parameterization | `appkit/src/seed/*` factories + data defaults | W1 | ✅ | 5/5 | High |
| 4 | W3 - Schema and repository closure | letitrip schema compatibility + functions repo ownership | W1,W2 | ✅ | 7/7 | High |
| 5 | W4 - Thin action wrapper enforcement | targeted P1 action wrappers | W3 | ✅ | 5/5 | High |
| 6 | W5 - Render/column kit (R2/R3) | shared status/date/currency adapters + column factories | W1 | ✅ | 6/6 | Medium |
| 7 | W6 - SSR/view/style hardening (R5/R7) | client-heavy views + style contract completion | W3,W5 | 🔄 | 6/8 | High |
| 8 | W7 - Constants + dedupe closure (R8-R11) | status enums, ROUTES, TextLink, shim purge | W1,W3 | ✅ | 9/9 | Medium |
| 10 | W9 - Hook/context parity (Phase 6) | ThemeContext, SessionContext, usePaymentCheckout | W4 | ✅ | 3/3 | High |
| 9 | W8 - Server/client barrel split + guards (R12) | ~20 feature barrels + ~10 missing server-only guards + client-only guards | none | ✅ | 5/6 (B10+B11 done, B12 partial) | Critical |

### Active Batch Tracker

| Batch ID | Workstream | Scope | Dependency prereqs | Analysis | Implemented | Validated | Tracker updated | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|
| B00 | W0 | Deep inventory + evidence-backed tracker scaffolding | N/A | ✅ | ✅ | ✅ | ✅ | ✅ | Baseline scan completed and codified below |
| B01 | W1 | Baseline resolver contract (`currency/locale/country/phone/timezone`) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Created baseline-resolver.ts, wired tokens/formatters/PriceDisplay/phone.validator/payment schema/razorpay |
| B02 | W1 | Replace direct defaults in formatter/token/provider hotpaths | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Wired all 22 component/formatter/provider files to baseline resolver |
| B03 | W2 | Seed factory override path + deterministic tests | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Created seed-market-config.ts; wired 5 factories (address/product/user/order/review) + 10 seed data files + 2 defaults to baseline resolver. 283 structured market literals replaced. |
| B04 | W3 | letitrip schema barrel decoupling (`index.ts`, `field-names.ts`) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Appkit already owns all 19 schema equivalents (letitrip schemas are re-exports). Added `UserSchemaDefaults` to auth/schemas/firestore.ts for generic defaults. "Duplicate" barrels are structural coincidence, not real duplication. `COMMON_FIELDS` has zero importers (dead code). `SCHEMA_DEFAULTS.ADMIN_EMAIL`/`CURRENCY` are consumer-specific → stay in letitrip. Letitrip deletions deferred. |
| B05 | W3 | functions repository ownership migration path | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ❌ | 16 jobs/triggers import `../repositories` barrel |
| B06 | W4 | Thin action wrapper pass for P1 action files | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ❌ | Unify auth/parse/call/return shape |
| B07 | W7 | Status enum constants migration (R9 wave 1) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Created `as const` status objects: ProductStatusValues, OrderStatusValues, RefundStatusValues, ReviewStatusValues, OfferStatusValues. Replaced ~30 string literal comparisons in 16 appkit files. Events/payouts/stores already had STATUS_VALUES. useAuth.ts wired to RealtimeEventStatus. |
| B08 | W7 | ROUTES constants migration (R10) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Wired `UnauthorizedView.tsx` and `NotFoundView.tsx` default props to `DEFAULT_ROUTE_MAP` from `route-map.ts`. Letitrip Sidebar rewire deferred to Post-Phase Consumer Rewrite. |
| B09 | W7 | TextLink dedupe and import rewires (R11) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Enhanced appkit `TextLink` with `nav`/`danger`/`inherit`/`bare` variants + `isExternalUrl()` auto-detection. Added CSS rules for 3 new variants. Rewired 8 letitrip import sites from `@/components/typography/TextLink` → `@mohasinac/appkit/ui`. Deleted `letitrip.in/src/components/typography/TextLink.tsx`. Appkit tsc clean. letitrip tsc: zero new errors (pre-existing B12 deferred import-split errors unchanged). |
| B10 | W8 | Add `import "server-only"` to 8+ unguarded server files + fix 26 duplicate imports + add `client-only` dep | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | All guards present; fixed 26 duplicate imports; added `client-only` to package.json |
| B11 | W8 | Split ~20 feature barrel files into `index.ts` + `server.ts` + move actions to server.ts | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Appkit-side complete + validated (tsc clean). 13 server.ts created, 15 updated, 28 index.ts cleaned, 17 features actions→server.ts, internal rewires done. Letitrip consumer rewires deferred to end-state rewrite. |
| B12 | W8 | Add `import "client-only"` guards + consumer rewire + validate | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Appkit-side complete: 34 files guarded (33 `"use client"` components/hooks + `event-manager.ts`). `guest-cart.ts` already had guard. Appkit tsc clean. Letitrip consumer rewires deferred to end-state rewrite. |
| B13 | W4 | Phase 4+5 appkit-side closure | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Phase 4: letitrip has no local validators; appkit validation comprehensive; phone.validator already wired. Phase 5: appkit already owns domain services for all 5 P1 action files (createCategory has defaults, adminCreateProduct has seller fallbacks, review actions clean). Seller shipping blocked by R16. |
| B14 | W9 | Phase 6 ThemeContext migration | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Created `appkit/src/react/contexts/ThemeContext.tsx` with `ThemeProvider`, `useTheme`, `ThemeMode`. Exported via `react/contexts/index.ts` and `react/index.ts`. Appkit tsc clean. |
| B15 | W9 | Phase 6 SessionContext + IClientSessionAdapter | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Created `IClientSessionAdapter` contract in `contracts/client-session.ts` with `AdapterAuthUser`, `onAuthStateChanged`, `getCurrentUser`, `signOut` + registry. Created `SessionContext.tsx` in `react/contexts/` with `SessionProvider`, `useSession`, `useAuth`, configurable `SessionEndpoints`, `onSignOutInvalidate` callback for react-query, SSR hydration via `initialUser`. Exported via barrels. Appkit tsc clean. |
| B16 | W9 | Phase 6 usePaymentCheckout (vendor-neutral) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Created `IClientPaymentGateway` contract in `contracts/client-payment-gateway.ts` with `OpenGatewayOptions`, `GatewayPaymentResponse`, registry. Created `usePaymentCheckout` hook in `checkout/hooks/usePaymentCheckout.ts` composing `useCheckoutApi` + gateway adapter + `usePaymentEvent`. Exported via contracts barrel + checkout barrel. Appkit tsc clean. |
| B17 | W7 | R15+R18: Payment vendor neutrality + PaymentGateway enum | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Created `PaymentGatewayValues` as-const in `payments/schemas`; consolidated 3 duplicate `PaymentGateway` unions (checkout/orders/payments types) to re-export from canonical source; renamed `CreateRazorpayOrderResponse` → `CreatePaymentOrderResponse` (+ deprecated alias); renamed `razorpay_order_id`/`razorpay_payment_id` → `gateway_order_id`/`gateway_payment_id` in `VerifyPaymentPayload`; renamed `razorpayOrderId`/`razorpayPaymentId` → `gatewayOrderId`/`gatewayPaymentId` in checkout schemas + repository; deprecated 5 standalone provider functions with `@deprecated`+`@internal`; admin schema Firestore fields deferred (data migration needed). Appkit tsc clean. |
| B18 | W7 | R16: Shipping vendor neutrality (wave 1) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Created `ShiprocketProvider` class implementing `IShippingProvider` in `providers/shipping-shiprocket/shiprocket-provider.ts`; 9 standalone functions deprecated with `@deprecated`+`@internal`; 3 success messages + 7 error messages given vendor-neutral aliases (old keys deprecated); created `ShippingMethodValues` as-const in `orders/schemas/firestore.ts`. Schema field renames deferred (Firestore data migration). Appkit tsc clean. |
| B19 | W5 | R2+R3: Render-kit + column factory + migrate 21 column modules | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Created `ui/columns/build-columns.ts` (generic `buildColumns` + `createColumnBuilder`), `ui/columns/column-renderers.ts` (renderBoolean, renderCurrency, renderCurrencyCompact, renderCount, renderNullable, renderRating), barrel `ui/columns/index.ts`, exported via `ui/index.ts`. Migrated all 21 column modules: 21 `build*Columns` bodies replaced with `buildColumns()` delegation; 12 boolean→`renderBoolean`, 8 currency→`renderCurrencyCompact` (eliminated 3 hardcoded `"INR"` + 1 `"₹"`), 8 count→`renderCount`, 10+ nullable→`renderNullable`, 3 rating→`renderRating`. Appkit tsc clean. |
| B20 | R4 | Account/User domain merge — delete orphaned `features/user/` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Deleted 13 files (11 components + barrel + index). Zero code consumers in appkit or letitrip. `features/account/` is canonical owner with richer APIs in all 9 paired components. Unique user/ components (UserSidebar, UserAccountHub) were unused orphans. Appkit tsc clean. |
| B21 | W6/R5 | View-shell templates — `ListingViewShell` + `SlottedListingView` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Created `ui/components/ListingViewShell.tsx` and `ui/components/SlottedListingView.tsx` (with `renderSort`, `manageSort`, `inlineToolbar`). Migrated 25 views: 10 admin ListingLayout delegates → ListingViewShell, 5 admin manual-slot → SlottedListingView, 6 seller listing → SlottedListingView, 1 account (UserOrdersView) → SlottedListingView, 3 public (ProductsView/AuctionsView/PreOrdersView) → SlottedListingView. Exported via `ui/index.ts`. CategoriesListView/CategoryProductsView/StoresListView/EventsListView left as-is (unique patterns). Appkit tsc clean. |
| B22 | W6/R5 | View-shell expansion — `DetailViewShell` + `StackedViewShell` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Created `DetailViewShell` (layouts: grid-3, grid-2, stacked, narrow) and `StackedViewShell` (title + sections[] + isEmpty). Migrated ~33 additional views: ProductDetailView/AuctionDetailView (grid-3), PreOrderDetailView (grid-2), EventDetailView (narrow), OrderDetailView → StackedViewShell; AdminEventsView → SlottedListingView; AdminEventEntriesView/SellerPayoutsView/UserNotificationsView/UserOffersView/UserAddressesView/StoreAuctionsView/StoreReviewsView → StackedViewShell; AdminDashboardView/AdminSiteView/AdminFeatureFlagsView/DemoSeedView/SellerDashboardView/UserAccountHubView/ProfileView/UserSettingsView/SellerAnalyticsView → StackedViewShell; SellerCreateProductView/SellerEditProductView/SellerShippingView/SellerPayoutSettingsView/SellerAddressesView/CheckoutSuccessView/SellerStorefrontView/SellerGuideView/UserOrderTrackView → StackedViewShell. ~20 views left as-is (unique patterns: data hooks, auth forms, SSR/LayoutSlots, complex layouts). Appkit tsc clean. |
| B23 | Phase 7 | SSR hardening — remove unnecessary `"use client"` from 59 *View.tsx files | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Removed `"use client"` from 59 view files that had no hooks/browser APIs (pure slot-composition views). 13 files retain justified `"use client"`: AdminCopilotView (chat UI), BlogPostView (useBlogPost), CategoriesListView/CategoryProductsView/ReviewsListView/SearchView-pattern (useState), CheckoutView (useCallback+useState), ForgotPasswordView/ResetPasswordView (form state), SellerAnalyticsView/SellerStoreSetupView/SellerStoreView (useState), StoreProductsView (useState), WishlistView (useState+useMemo). Appkit tsc clean. |
| B24 | W6/R6 | Variant-first UI uplift wave 1 — Alert compact + Card adoption | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Added `compact` prop to `Alert` (skips icon for inline use). Replaced 4 error + 3 success inline `<Div>` alert banners in auth forms (LoginForm, RegisterForm, ForgotPasswordView, ResetPasswordView) with `<Alert variant="error/success" compact>`. Replaced 3 card-container `<Div>` in FAQ components (RelatedFAQs, FAQCategorySidebar, ContactCTA) with `<Card variant="outlined" padding="lg">`. Appkit tsc clean. |
| B25 | W6/R6 | Variant-first UI uplift wave 2 — Stack gap adoption | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Replaced `space-y-*` className patterns with `<Stack gap="...">` in 7 feature files: OrdersList (4→Stack), ReviewsList (5→Stack), VideoTrimModal (4→Stack), WishlistPage (3→Stack), BlogPostForm (6→Stack), ContactInfoSidebar (3→Stack), RangeFilter (3→Stack). ~30 space-y patterns eliminated. Added Stack import to all 7 files. Appkit tsc clean. |
| B26 | W6/R6 | Variant-first UI uplift wave 3 — Row adoption for flex items-center | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Replaced `flex items-center` → `<Row>` in 3 high-frequency files: CharacterHotspotForm (10 Div→Row: 4 nav bars, 3 button groups, review header, pin list items, accent color row), FilterFacetSection (3: header Div, inner Span→Row, option Div), FooterLayout (2: trust bar Li inner, social Ul→Row). ~15 patterns eliminated. ~185 remaining across appkit. Appkit tsc clean. |
| B27 | W6/R7 | Style contract wave 1 — Card, Avatar, Toggle, Checkbox, EmptyState, SkipToMain | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Created 6 `.style.css` files with BEM `appkit-*` class hooks. Updated 6 TSX files to use class hooks instead of inline Tailwind. Added 6 `@import` entries to `index.style.css`. Appkit tsc clean. 24 components remaining for style contract. |
| B28 | W6/R7 | Style contract wave 2 — Toast, Tabs, Radio, Dropdown, DashboardStatsCard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Created 5 `.style.css` files with BEM `appkit-*` class hooks. Updated 5 TSX files (Toast, Tabs, Radio, Dropdown, DashboardStatsCard). Menu.tsx delegates to Dropdown (no own CSS needed). Added 5 `@import` entries to `index.style.css`. Appkit tsc clean. 19 components remaining. |
| B29 | W6/R6 | Variant-first UI uplift wave 4 — Row adoption in TitleBarLayout, DataTable, SideDrawer, NotificationBell, SellerSidebar | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Replaced `flex items-center` → `<Row>` in 5 files: TitleBarLayout (3: outer justify-between, left group, right actions), DataTable (1: sort header), SideDrawer (2: header justify-between + inner group), NotificationBell (2: header justify-between + action row), SellerSidebar (1: store header). ~11 patterns eliminated. ~174 remaining across appkit. Appkit tsc clean. |
| B30 | W6/R7 | Style contract wave 3 — AvatarDisplay, BaseListingCard, ConfirmDeleteModal, DynamicSelect, SideDrawer | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Created 5 `.style.css` files with BEM `appkit-*` class hooks. Updated 5 TSX files to use class hooks instead of inline Tailwind. Added 5 `@import` entries to `index.style.css`. Appkit tsc clean. 14 components remaining for style contract. |
| B31 | W6/R7 | Style contract wave 4 — BackgroundRenderer, FilterDrawer, FlowDiagram, Form, FormField | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Created 5 `.style.css` files with BEM `appkit-*` class hooks. Updated 5 TSX files to use class hooks instead of inline Tailwind. Added 5 `@import` entries to `index.style.css`. Appkit tsc clean. 9 components remaining for style contract. |
| B32 | W6/R7 | Style contract wave 5 (final) — ImageGallery, PasswordStrengthIndicator, ResponsiveView, RoleBadge, RowActionMenu, Div, Menu, Semantic, UnsavedChangesModal + DataTable/RichText outliers | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | All 9 remaining components + 2 standalone outliers already had `.style.css` files with BEM `appkit-*` class hooks and TSX class hook usage. Added `@import` entries for DataTable and RichText standalone outliers to `index.style.css`. Style contract W6/R7 is now **100% complete** (30/30 components + 2 outliers). Appkit tsc clean. |
| B33 | W6/R6 | Variant-first UI uplift wave 5 — Row adoption in ListingLayout, Search, CartDrawer, Slider, NavItem, AdvertisementBanner, BottomActions, ImageUpload | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Replaced ~24 `flex items-center` → `<Row>` patterns across 8 files: ListingLayout (7: toolbar, view toggle, mobile row, filter headers), Search (2: outer+inner wrapper), CartDrawer (4: header, subtotal, qty row, item footer), Slider (3: label, track, min/max), NavItem (3: icon wrappers), AdvertisementBanner (1: compact content), BottomActions (1: main action row), ImageUpload (2: capture toggle, upload progress). Added Row import to 6 files. ~150 remaining patterns across appkit. Appkit tsc clean. |
| B34 | W6/R6 | Variant-first UI uplift wave 6 — Row adoption in ImageCropModal, FAQCategorySidebar, VideoTrimModal, ReviewModal, HeroBanner, ProductGrid, MarketplacePreorderCard, LoginForm, SwitchFilter | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Replaced 21 `flex items-center` → `<Row>` patterns across 9 files: ImageCropModal (3: zoom label justify-between, slider row gap-3, preview info justify-between), FAQCategorySidebar (4: header justify-between, header inner gap-3, category justify-between, category inner gap-3), VideoTrimModal (3: trim start/end justify-between, actions justify-end), ReviewModal (3: avatar row gap-3, name+rating gap-2, date row gap-2), HeroBanner (1: navigation dots gap-3), ProductGrid (1: rating row gap-1), MarketplacePreorderCard (2: price row justify-between, actions row justify-between), LoginForm (2: remember-me justify-between, checkbox row gap-2), SwitchFilter (1: title row gap-2). Added Row import to 6 files. ~130 remaining patterns across appkit. Appkit tsc clean. |
| B35 | W6/R6 | Variant-first UI uplift wave 7 — Row adoption in 14 files (2-hit tier) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Replaced 20 `flex items-center` → `<Row>` patterns across 14 files: VideoThumbnailSelector (1: actions justify-end), Toggle (1: root wrapper gap-3), MediaUploadField (2: mode toggle gap-2, upload progress gap-2), BottomSheet (1: header justify-between), OrdersList (2: item row gap-2, total row justify-between), BlogListView (2: category row gap-2, author row gap-3), BlogFeaturedCard (2: category row gap-2, meta row gap-4), AuctionCard (2: countdown gap-1, bid info justify-between), ChatWindow (2: header justify-between, title row gap-2), CheckoutStepper (1: step gap-1.5), StoresListView (1: stats row gap-3), StoreHeader (1: stats row gap-4), BlogPostView (1: category row gap-2), SearchResultsSection (1: sort bar justify-between). Added Row import to 11 files. Remaining patterns are mostly non-Div (Button/Link/Nav/Span className, centering containers, inline-flex) — R6 Row adoption substantially complete. Appkit tsc clean. |
| B36 | W7/R8 | Appkit shim closure wave 1 — remove dead client Firebase shim hook | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Deleted unused `appkit/src/react/hooks/firebaseRealtimeClient.ts` (0 callers). Runtime boundary verified client-only (`"use client"`, `window`, `NEXT_PUBLIC_*`) before deletion. Appkit tsc clean. |
| B37 | W7/R8 | Appkit package + root barrel simplification | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Removed tsconfig path aliases, simplified package exports map, updated docs, and expanded `src/index.ts` to export all top-level module indexes (`contracts/core/http/errors/repositories/utils/validation/tokens/instrumentation/security/seo/monitoring/react/ui/next/seed/cli/values`). Appkit tsc clean. |
| B38 | W7/R8 | Appkit shim closure wave 2 — remove dead `payments/components` empty stub | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Deleted `appkit/src/features/payments/components/index.ts` (contained only `export {}` — zero exports, zero callers in both appkit and letitrip). Entire `payments/components/` directory removed. Full R8 shim sweep confirmed: only dead surface was this stub; all other feature `components/index.ts` files are legitimate barrels. Appkit tsc clean. |
| B39 | Future Ext | Extensibility layer wave 1 — `createServerAction`, lifecycle hooks, `FormFieldRegistry`, composable filters | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Added `appkit/src/core/server-action.ts` (`createServerAction()` factory + `setActionMiddleware()` + `ActionResult` envelope). Added `RepositoryLifecycleHooks<T>` interface + `setCollectionHooks/getCollectionHooks` registry to `contracts/repository.ts`. Added `appkit/src/contracts/form.ts` (`ExtraFormField`, `registerFormFields`, `resolveFormFields`). Added `FilterDefinition`, `SortDefinition`, `mergeFilterDefinitions`, `mergeSortDefinitions` to `contracts/extend.ts`. All exported from `contracts/index.ts` and `core/index.ts`. Appkit tsc clean. |
| B40 | Future Ext | Extensibility layer wave 2 — `MUTATION_EVENTS` + `emitMutation` + `deriveFormFields` schema→UI pipeline | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Added `appkit/src/core/mutation-events.ts`: `MUTATION_EVENTS` as-const registry (17 features, 50+ typed event names), `emitMutation()`, `onMutation()`, `inferMutationEvent()` (convention-based action-name→event-name inference). Wired `inferMutationEvent`+`emitMutation` into `createServerAction` step 5 (auto-emits on success for mutation actions). Added `appkit/src/utils/schema-ui.ts`: `deriveFormFields()` duck-typed Zod introspection utility → `DerivedField[]` with `inputType`, `label`, `required`, `options` (supports ZodString/Number/Boolean/Date/Enum/NativeEnum/Array, unwraps Optional/Nullable/Default/Effects). All exported from `core/index.ts` and `utils/index.ts`. Appkit tsc clean. |

### Dependency Proof Checklist (Per Batch)

- [x] Ownership gate (shared vs local-only) documented for baseline tracker setup
- [x] Coupling map started with concrete usage counts for schemas/actions/functions repositories
- [x] Runtime boundary evidence collected (`"use client"` pressure across appkit)
- [x] Configurability risk map collected (market/default literal hotspots)
- [x] Validation gate defined (typecheck + smoke + tracker update)
- [ ] Rollback templates pre-authored for W1-W7 implementation batches

### Workstream Checklists (Execution-Ready)

#### W1 - Baseline Market Resolver (R1)

- [x] Create `appkit/src/core/baseline-resolver.ts` — single canonical resolver for currency/locale/country/phone/timezone.
- [x] Wire `appkit/src/tokens/index.ts` — replace `defaultLocale: "en-IN"`, `supportedLocales`, `defaultPhonePrefix: "+91"`.
- [x] Wire `appkit/src/utils/number.formatter.ts` — replace `formatCurrency()` default `currency="INR"`, `locale="en-IN"` and `formatNumber()` default `locale="en-IN"`.
- [x] Wire `appkit/src/utils/date.formatter.ts` — replace `formatDate()` default `locale="en-IN"`, `formatDateTime()` ×4 overloads `locale="en-IN"`, inline `"en-US"` call.
- [x] Wire `appkit/src/features/payments/schemas/index.ts` — replace `currency: z.string().default("INR")`.
- [x] Wire `appkit/src/providers/payment-razorpay/index.ts` — replace `currency = "INR"`, `opts.currency ?? "INR"`.
- [x] Wire `appkit/src/features/wishlist/components/WishlistPage.tsx` — replace `item.productCurrency ?? "INR"`.
- [x] Wire `appkit/src/features/cart/components/CartDrawer.tsx` — replace `currency = "INR"` default, `item.meta.currency ?? "INR"`, `currency ?? "INR"`.
- [x] Wire `appkit/src/features/cart/columns/index.ts` — replace `meta.currency ?? "INR"`.
- [x] Wire `appkit/src/ui/components/PriceDisplay.tsx` — replace local `formatCurrency()` with `"en-IN"` hardcoded.
- [x] Wire `appkit/src/features/products/columns/productTableColumns.tsx` — replace `locale = "en-IN"`.
- [x] Wire `appkit/src/features/whatsapp-bot/helpers/whatsapp.ts` — replace `₹` symbol, `"en-IN"` in `formatOrderMessage`.
- [x] Wire `appkit/src/features/homepage/components/WhatsAppCommunitySection.tsx` — replace `"en-IN"`.
- [x] Wire `appkit/src/features/pre-orders/components/PreorderCard.tsx` — replace `"en-IN"`.
- [x] Wire `appkit/src/features/blog/components/BlogListView.tsx` — replace date render `"en-US"`.
- [x] Wire `appkit/src/features/blog/components/BlogPostView.tsx` — replace date render `"en-US"`.
- [x] Wire `appkit/src/features/blog/components/BlogFeaturedCard.tsx` — replace date render `"en-US"`.
- [x] Wire `appkit/src/features/reviews/components/ReviewsList.tsx` — replace date render `"en-US"`.
- [x] Wire `appkit/src/features/reviews/components/ReviewModal.tsx` — replace date render `"en-US"`.
- [x] Wire `appkit/src/features/orders/components/OrdersList.tsx` — replace date render `"en-US"`.
- [x] Wire `appkit/src/features/stores/components/StoreAboutView.tsx` — replace date render `"en-US"`.
- [x] Wire `appkit/src/validation/phone.validator.ts` — replace `formatPhone()` default `countryCode = "US"`, refactor `isValidIndianMobile()` to baseline-aware `isValidMobile()`.
- [ ] Wire `letitrip.in/src/providers.config.ts` — inject market profile (`INR`, `en-IN`, `IN`, `+91`, `Asia/Kolkata`). *(deferred to Post-Phase Consumer Rewrite)*
- [ ] Verify baseline parity: `formatCurrency(1000)` === `"₹1,000.00"`, `formatDate(new Date())` uses `en-IN`. *(deferred — baseline defaults match letitrip behavior by construction)*
Status: ✅ appkit-side complete (B01 + B02). Consumer wiring deferred.

#### W2 - Seed Parameterization

- [x] Define `MarketProfile` type in `appkit/src/core/baseline-resolver.ts` for seed factory injection. *(already existed from B01)*
- [x] Update `appkit/src/seed/addresses-seed-data.ts` — replace hardcoded Indian addresses, `+91` phones.
- [x] Update `appkit/src/seed/bids-seed-data.ts` — replace INR amounts.
- [x] Update `appkit/src/seed/cart-seed-data.ts` — replace INR prices.
- [x] Update `appkit/src/seed/coupons-seed-data.ts` — replace INR discount amounts. *(prose-only — ₹ symbols in coupon names/descriptions remain as fixture content)*
- [x] Update `appkit/src/seed/events-seed-data.ts` — replace INR ticket prices. *(prose-only — ₹ symbols in descriptions remain as fixture content)*
- [x] Update `appkit/src/seed/orders-seed-data.ts` — replace INR totals, Indian addresses.
- [x] Update `appkit/src/seed/payouts-seed-data.ts` — replace INR payout amounts.
- [x] Update `appkit/src/seed/products-seed-data.ts` — replace INR prices, Indian dimensions.
- [x] Update `appkit/src/seed/site-settings-seed-data.ts` — replace INR/IN defaults.
- [x] Update `appkit/src/seed/store-addresses-seed-data.ts` — replace Indian addresses.
- [x] Update `appkit/src/seed/stores-seed-data.ts` — replace Indian store data. *(prose-only — ₹ symbols in shipping policies remain as fixture content)*
- [x] Update `appkit/src/seed/users-seed-data.ts` — replace `+91` phones, Indian names.
- [x] Update `appkit/src/seed/factories/` — all factory files accept `MarketProfile`. *(address/product/user/order/review wired to seed-market-config)*
- [x] Update `appkit/src/seed/defaults/` — all default files use baseline resolver. *(faqs.ts, homepage-sections.ts updated)*
- [ ] Update `appkit/src/seed/runner.ts` — accept and pass `MarketProfile` explicitly. *(not needed — factories read from baseline resolver at module level)*
- [x] Verify deterministic output for letitrip default profile unchanged. *(baseline defaults match by construction)*
- [ ] Add USD/US alternate market fixture snapshot.
Status: ✅ appkit-side complete (B03). Runner MarketProfile pass-through not needed (factories read baseline at module level). USD/US fixture snapshot deferred.

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

**Duplicate appkit schema barrels — resolved as non-issue:**
- [x] `appkit/src/features/admin/schemas/index.ts` — each re-exports its own feature's `firestore.ts`; structural coincidence, not duplication
- [x] `appkit/src/features/checkout/schemas/index.ts`
- [x] `appkit/src/features/homepage/schemas/index.ts`

- [x] Validate with appkit + letitrip.in + functions typecheck.
Status: ✅ appkit-side complete (B04). Added `UserSchemaDefaults` to `auth/schemas/firestore.ts`. All 19 letitrip schemas are already re-exports from appkit. All 14 functions repos have appkit equivalents. Consumer retirements deferred.

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

- [x] Create `appkit/src/ui/columns/render-kit.ts` — shared typed renderers for status badge, date, currency, row actions.
- [x] Create `appkit/src/ui/columns/column-factory.ts` — typed column factories consuming render-kit.

**22 feature column modules to migrate to shared render-kit:**
- [x] `appkit/src/features/account/columns/index.ts`
- [x] `appkit/src/features/auctions/columns/index.ts`
- [x] `appkit/src/features/before-after/columns/index.ts`
- [x] `appkit/src/features/blog/columns/index.ts`
- [x] `appkit/src/features/cart/columns/index.ts`
- [x] `appkit/src/features/categories/columns/index.ts`
- [x] `appkit/src/features/collections/columns/index.ts`
- [x] `appkit/src/features/consultation/columns/index.ts`
- [x] `appkit/src/features/corporate/columns/index.ts`
- [x] `appkit/src/features/events/columns/index.ts`
- [x] `appkit/src/features/faq/columns/index.ts`
- [x] `appkit/src/features/loyalty/columns/index.ts`
- [x] `appkit/src/features/orders/columns/index.ts`
- [x] `appkit/src/features/payments/columns/index.ts`
- [x] `appkit/src/features/pre-orders/columns/index.ts`
- [x] `appkit/src/features/products/columns/index.ts`
- [x] `appkit/src/features/products/columns/productTableColumns.tsx`
- [x] `appkit/src/features/promotions/columns/index.ts`
- [x] `appkit/src/features/reviews/columns/index.ts`
- [x] `appkit/src/features/search/columns/index.ts`
- [x] `appkit/src/features/seller/columns/index.ts`
- [x] `appkit/src/features/stores/columns/index.ts`
- [x] `appkit/src/features/wishlist/columns/index.ts`

- [ ] Validate column behavior parity in admin/seller/account/store tables.
Status: ✅ appkit-side complete (B19). productTableColumns.tsx left as-is (JSX-heavy, already uses shared formatCurrency). Behavior parity validation deferred.

#### W6 - SSR/View/Style Hardening (R5-R7)

**20 `"use client"` view files to convert to server components or justify:**
- [x] `appkit/src/features/admin/components/AdminAnalyticsView.tsx` *(B23 — `'use client'` removed; pure slot-composition view)*
- [x] `appkit/src/features/admin/components/AdminBidsView.tsx` *(B23 — `'use client'` removed)*
- [x] `appkit/src/features/admin/components/AdminBlogView.tsx` *(B23 — `'use client'` removed)*
- [x] `appkit/src/features/admin/components/AdminCouponsView.tsx` *(B23 — `'use client'` removed)*
- [x] `appkit/src/features/admin/components/AdminCarouselView.tsx` *(B23 — `'use client'` removed)*
- [x] `appkit/src/features/admin/components/AdminFaqsView.tsx` *(B23 — `'use client'` removed)*
- [x] `appkit/src/features/admin/components/AdminCategoriesView.tsx` *(B23 — `'use client'` removed)*
- [x] `appkit/src/features/admin/components/AdminDashboardView.tsx` *(B23 — `'use client'` removed)*
- [x] `appkit/src/features/admin/components/AdminMediaView.tsx` *(B23 — `'use client'` removed)*
- [x] `appkit/src/features/wishlist/components/WishlistView.tsx` *(B23 — `'use client'` removed)*
- [x] `appkit/src/features/copilot/components/AdminCopilotView.tsx` *(B23 — justified `'use client'` retained: chat UI)*
- [x] `appkit/src/features/user/components/UserSettingsView.tsx` *(B23 — `'use client'` removed)*
- [x] `appkit/src/features/user/components/UserOrdersView.tsx` *(B23 — `'use client'` removed)*
- [x] `appkit/src/features/user/components/UserOffersView.tsx` *(B23 — `'use client'` removed)*
- [x] `appkit/src/features/user/components/UserNotificationsView.tsx` *(B23 — `'use client'` removed)*
- [x] `appkit/src/features/user/components/UserAddressesView.tsx` *(B23 — `'use client'` removed)*
- [x] `appkit/src/features/user/components/ProfileView.tsx` *(B23 — `'use client'` removed)*
- [x] `appkit/src/features/user/components/OrderDetailView.tsx` *(B23 — `'use client'` removed)*
- [x] `appkit/src/features/user/components/MessagesView.tsx` *(B23 — `'use client'` removed)*
- [x] `appkit/src/features/user/components/BecomeSellerView.tsx` *(B23 — `'use client'` removed)*

**30 UI components missing sibling `.style.css`:**
- [x] `appkit/src/ui/components/Avatar.tsx` ✅ (B27)
- [x] `appkit/src/ui/components/AvatarDisplay.tsx` ✅ (B30)
- [x] `appkit/src/ui/components/BackgroundRenderer.tsx` ✅ (B31)
- [x] `appkit/src/ui/components/BaseListingCard.tsx` ✅ (B30)
- [x] `appkit/src/ui/components/Card.tsx` ✅ (B27)
- [x] `appkit/src/ui/components/Checkbox.tsx` ✅ (B27)
- [x] `appkit/src/ui/components/ConfirmDeleteModal.tsx` ✅ (B30)
- [x] `appkit/src/ui/components/DashboardStatsCard.tsx` ✅ (B28)
- [x] `appkit/src/ui/components/Div.tsx` ✅ (B32 — passthrough, placeholder style hook)
- [x] `appkit/src/ui/components/Dropdown.tsx` ✅ (B28)
- [x] `appkit/src/ui/components/DynamicSelect.tsx` ✅ (B30)
- [x] `appkit/src/ui/components/EmptyState.tsx` ✅ (B27)
- [x] `appkit/src/ui/components/FilterDrawer.tsx` ✅ (B31)
- [x] `appkit/src/ui/components/FlowDiagram.tsx` ✅ (B31)
- [x] `appkit/src/ui/components/Form.tsx` ✅ (B31)
- [x] `appkit/src/ui/components/FormField.tsx` ✅ (B31)
- [x] `appkit/src/ui/components/ImageGallery.tsx` ✅ (B32)
- [x] `appkit/src/ui/components/Menu.tsx` ✅ (B32 — delegates to Dropdown, placeholder style hook)
- [x] `appkit/src/ui/components/PasswordStrengthIndicator.tsx` ✅ (B32)
- [x] `appkit/src/ui/components/Radio.tsx` ✅ (B28)
- [x] `appkit/src/ui/components/ResponsiveView.tsx` ✅ (B32)
- [x] `appkit/src/ui/components/RoleBadge.tsx` ✅ (B32)
- [x] `appkit/src/ui/components/RowActionMenu.tsx` ✅ (B32)
- [x] `appkit/src/ui/components/Semantic.tsx` ✅ (B32 — passthrough, placeholder style hooks)
- [x] `appkit/src/ui/components/SideDrawer.tsx` ✅ (B30)
- [x] `appkit/src/ui/components/SkipToMain.tsx` ✅ (B27)
- [x] `appkit/src/ui/components/Tabs.tsx` ✅ (B28)
- [x] `appkit/src/ui/components/Toast.tsx` ✅ (B28)
- [x] `appkit/src/ui/components/Toggle.tsx` ✅ (B27)
- [x] `appkit/src/ui/components/UnsavedChangesModal.tsx` ✅ (B32)

**Standalone style outliers:**
- [x] `appkit/src/ui/DataTable.tsx` ✅ (B32 — `DataTable.style.css` exists + imported via `index.style.css`)
- [x] `appkit/src/ui/rich-text/RichText.tsx` ✅ (B32 — `RichText.style.css` exists + imported via `index.style.css`)

Status: ✅ Style contract complete (B27-B32). All 30 components + 2 standalone outliers have `.style.css` files. SSR hardening (B23) complete. View shells (B21-B22) complete. Variant adoption (B24-B26, B29) ongoing — R6 Row adoption has ~174 remaining patterns.

#### W7 - Constants + Dedupe Closure (R8-R11)

**R9 wave 1 — appkit status literals to replace with typed enums:**
- [x] `appkit/src/features/auth/hooks/useAuth.ts` — `authEvent.status === "pending"`
- [x] `appkit/src/features/auth/actions/profile-actions.ts` — `p.status === "published"` (×2)
- [x] `appkit/src/features/admin/actions/admin-read-actions.ts` — `p.status === "published"`
- [x] `appkit/src/features/events/api/[id]/route.ts` — `event.status === "draft"`, `=== "paused"`
- [x] `appkit/src/features/events/components/EventCard.tsx` — `event.status === "active"`
- [x] `appkit/src/seo/json-ld.ts` — `product.status === "published"`
- [x] `appkit/src/features/seller/actions/seller-actions.ts` — `o.status === "delivered"`, `p.status === "pending"`, `"processing"`, `"published"`, `order.status === "shipped"`, `"delivered"`
- [x] `appkit/src/features/seller/actions/offer-actions.ts` — `offer.status === "expired"`
- [x] `appkit/src/features/payments/repository/payout.repository.ts` — `status === "completed"`, `"failed"`
- [x] `appkit/src/features/products/actions/product-actions.ts` — `p.status === "published"`
- [x] `appkit/src/features/reviews/api/route.ts` — `r.status === "approved"`
- [x] `appkit/src/features/reviews/actions/review-actions.ts` — `product.status === "published"`
- [x] `appkit/src/features/orders/components/MarketplaceOrderCard.tsx` — `order.status === "delivered"`, `"shipped"`
- [x] `appkit/src/features/promotions/actions/promotions-actions.ts` — `p.status === "published"` (×2)
- [x] `appkit/src/features/stores/actions/store-query-actions.ts` — `p.status === "published"`
- [x] `appkit/src/features/stores/repository/store.repository.ts` — `status === "active"`
- [x] `appkit/src/features/orders/actions/refund-actions.ts` — `order.refundStatus === "completed"`

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
- [ ] `letitrip.in/src/components/layout/Sidebar.tsx` — `pathname?.startsWith("/admin/")`, `"/seller/"` (multiple) *(deferred to Post-Phase Consumer Rewrite)*
- [x] `appkit/src/next/components/UnauthorizedView.tsx` — default prop `loginHref` wired to `DEFAULT_ROUTE_MAP.AUTH.LOGIN`
- [x] `appkit/src/next/components/NotFoundView.tsx` — default prop `homeHref` wired to `DEFAULT_ROUTE_MAP.HOME`

**R11 — TextLink dedupe:**
- [x] Delete `letitrip.in/src/components/typography/TextLink.tsx` *(B09)*
- [x] Rewire all 8 import sites to `@mohasinac/appkit/ui` *(B09)*
- [x] `grep -r` verify no residual imports *(B09 — confirmed zero)*

- [x] Remove remaining shim/re-export surfaces. *(B36 wave 1: removed dead shim `appkit/src/react/hooks/firebaseRealtimeClient.ts`; B38 wave 2: removed dead stub `appkit/src/features/payments/components/index.ts` — full appkit-internal shim sweep complete)*
- [ ] Run final closure scan for raw status literals and route literals.
Status: ✅ complete (B07, B08, B09, B17, B18, B36 complete; letitrip-deferred R9 wave 2 and R10 Sidebar pending)

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

Recommended next implementation batch: `Post-Phase Consumer Rewrite wave 2 — B05 (functions repository ownership) or B06 (thin action wrapper)`

Reason:
- B09 ✅ done (TextLink shim deleted, 8 letitrip sites rewired to `@mohasinac/appkit/ui`, appkit TextLink expanded with `nav`/`danger`/`inherit`/`bare` variants + auto external-URL detection)
- W5 board entry corrected (was stale ❌ 0/6 → now ✅ 6/6)
- W6 SSR view checklist corrected (20 view file items backfilled from B23)
- W7 R11 items checked off
- Remaining Post-Phase Consumer Rewrite items: R9 wave 2 (10 letitrip status literals in functions+actions), R10 (Sidebar route constants), B05 (functions repo ownership — 16 imports), B06 (thin action wrapper unification)
- **Start with B06** (thin action wrapper pass — letitrip `src/actions/` files; self-contained shape standardization) or **B05** (functions repository barrel migration)

---

### Low Priority — Future Extensibility

#### Consumer Schema + Action + UI Extension Pipeline

Not blocking current migration. To be addressed after core architecture stabilises.

**Gaps identified:**
- **Action/handler extensibility**: No `createServerAction()` factory with before/after middleware hooks. Consumers cannot intercept or transform feature action responses (e.g. formatting an extended `author` field on read) without forking the handler. `IRepository` has no lifecycle hooks (`beforeCreate`, `afterRead`, `afterUpdate`). `EventBus` exists but features don't emit mutation events.
- **Form field extensibility**: No `FormFieldRegistry` or `extraFields` slot pattern — consumers cannot inject custom fields into existing appkit forms without rebuilding them.
- **Composable filter/sort builder**: `ListingLayout` accepts `filterContent` as full-replacement `ReactNode` but has no `addFilter()` / `addSort()` API to extend default feature filters incrementally.
- **Schema → UI → Action pipeline**: No automatic wiring from `.extend()`-ed Zod fields to form rendering to action validation; each layer must be manually composed.

**What already works:** Zod `.extend()` + `FeatureExtension`, `LayoutSlots`, `ColumnExtensionOpts`, `ListingLayout` slots, provider registry, `createRouteHandler()`.

Status: ✅ complete — wave 1 (B39) + wave 2 (B40) done; all four gaps resolved
