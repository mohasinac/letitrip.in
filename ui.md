# UI Migration Tracker

## Snapshot
- Date: 2026-04-20
- Production domain: https://www.letitrip.in/
- Deployed Vercel commit: `903468002a245c4663c502c892ab1f9fd2355da5` (short: `9034680`)
- Local HEAD at verification time: `bcd69b38b46f953a305e101b20bfc9640d6fb7e1`
- Local ahead of deployed commit at verification: `170` commits

## 2026-04-20 Parity Audit Delta (Deployed vs Local)

### Verified observations
- [x] Deployed production homepage currently renders expected shell controls:
  - theme toggle
  - mobile bottom navbar
  - sidebar grouped sections (Browse/Support)
  - title-bar controls (search/cart/profile/menu)
- [x] Local appkit watch works (`npm --prefix ../appkit run watch`) and reports clean compile.
- [ ] Local letitrip dev parity check is currently blocked by package resolution:
  - `next dev` fails to resolve `@mohasinac/appkit/server`.
  - Direct Node import confirms root cause:
    - `Cannot find module '.../appkit/dist/tokens/index' imported from .../appkit/dist/server.js`
  - This happens when appkit is externalized from Next bundling and Node ESM resolves extensionless internal imports.

### Root-cause status
- [~] Root cause identified: `@mohasinac/appkit` is listed in `serverExternalPackages` and then loaded by Node runtime as external ESM.
- [ ] Pending fix in consumer runtime wiring:
  - remove/adjust appkit externalization in `next.config.js` so Next bundles appkit instead of Node external resolution.

### Immediate execution order (mandatory)
1. Fix `next.config.js` externalization for appkit so local dev can run.
2. Re-run `npm run dev` and smoke parity against deployed pages (home + detail + dashboard families).
3. Capture route-level deltas for:
   - wrapping/overflow regressions
   - dashboard drawer trigger visibility
   - bottom actions registration behavior on listing pages
   - locale/theme/dev/notification slot visibility across auth roles
4. Implement missing behavior in appkit components first, then keep letitrip thin shells (mapping only labels/messages/routes).

## Objectives
1. Remove blank route outputs (`return null`) from locale routes.
2. Wire locale page routes to appkit-owned views/components.
3. Keep letitrip.in as thin orchestration only.
4. Migrate in order: Commerce -> Discovery -> Account/Seller/Admin.

## Phase Status
- Phase 1: Completed
- Phase 2: In progress
  - Layout parity recovery (appkit-first): In progress
  - Commerce routes: Started and wired
  - Discovery routes: Started and wired (first pass)
  - Account/Seller/Admin route groups: Pending bulk conversion from scaffold to dedicated appkit views
- Phase 3: Pending (data bindings, role gating, actions, i18n labels/constants)

## Export Refactor (Appkit Entrypoints)
**Status: Completed 2026-04-20**

Refactored appkit entrypoints to cleanly separate client-only and server-only exports:
- **index.js (client-only)**: `@mohasinac/appkit` default import → safe for browser (UI, hooks, layouts, client providers)
- **server.js (server-only)**: `@mohasinac/appkit/server` → server-safe only (repositories, admin actions, auth providers, seed/migration tools)
- **Removed**: `src/client.ts` alias file (no re-export shims allowed)
- **Build**: Both tsc watch + generation scripts (`generate-client.mjs`, `generate-index.mjs`) now write to final entrypoints

Consumers import directly without intermediate barrels:
```ts
// ✓ Client code (browser-safe)
import { Button, useAuth } from '@mohasinac/appkit';

// ✓ Server code (server-only)
import { UserRepository, createServerAction } from '@mohasinac/appkit/server';
```

### Appkit-First Contract (Mandatory)
- Reuse appkit primitives/components first. Do not recreate letitrip-local layout/UI implementations.
- Keep letitrip as thin config/wiring only: route shells, message mapping, provider wiring, feature toggles.
- Any reusable visual or behavioral parity fix discovered in letitrip must be implemented in appkit and consumed from letitrip.
- Breadcrumbs, search controls, drawer behavior, navbar/bottom-action behavior, theme/locale controls, and dashboard drawer orchestration must be appkit-owned.

## Phase 2.0 (New) Layout + UX Parity Recovery (Appkit-Owned)
Goal: Restore deployed letitrip desktop/mobile behavior without reintroducing local layout ownership.

### 2.0.1 Existing appkit capability inventory (no recreate)
- [x] App shell exists in appkit
  - appkit/src/features/layout/AppLayoutShell.tsx
- [x] Title bar primitive supports missing controls via props/slots
  - appkit/src/features/layout/TitleBarLayout.tsx
  - Supports: notificationSlot, devSlot, promoStripText, onToggleTheme/isDark, dashboard drawer trigger
- [x] Bottom nav + bottom actions + dashboard nav providers exist
  - appkit/src/features/layout/BottomNavbar.tsx
  - appkit/src/features/layout/BottomActions.tsx
  - appkit/src/features/layout/BottomActionsContext.tsx
  - appkit/src/features/layout/DashboardNavContext.tsx
- [x] Locale switcher and breadcrumbs exist
  - appkit/src/features/layout/LocaleSwitcher.tsx
  - appkit/src/features/layout/AutoBreadcrumbs.tsx
- [x] Admin/Seller/User dashboard view families already exist in appkit
  - appkit/src/index.ts exports Admin*View and Seller*View families

### 2.0.2 Gaps identified against deployed UX
- [ ] Theme toggle not wired in current thin shell
- [ ] Locale control not wired in current thin shell
- [ ] Dev/seed quick action not surfaced in shell
- [ ] Notification slot not surfaced in shell
- [ ] Sidebar/drawer content reduced to flat links (missing grouped browse/support/auth behavior)
- [ ] Dashboard drawer trigger behavior not consistently surfaced across user/seller/admin routes
- [ ] Some layout wrapping/responsive behavior regressed due simplified shell wiring

### 2.0.3 Migration tasks (appkit-owned, ordered)
- [~] Extend appkit AppLayoutShell props to expose all TitleBar controls as typed extension points
  - Added in appkit source: notification slot, dev slot, theme toggle pass-through, promo strip, dashboard-nav suppression, sidebar-toggle control
  - Pending: consume from letitrip after appkit dependency update/publish step
- [~] Extend appkit AppLayoutShell sidebar contract from flat list to structured sections
  - Added in appkit source: sidebarSections + sidebarPrimaryActions + sidebarTitle
  - Pending: letitrip data wiring for browse/support/auth grouped drawer content
- [ ] Keep bottom navbar and bottom actions appkit-owned and always mounted through appkit layout contract
  - Only data and labels provided by letitrip
- [ ] Introduce appkit route-shell label contract for breadcrumbs/search/messages
  - letitrip provides translations/messages, appkit renders behavior
- [ ] Wire letitrip LayoutShellClient to appkit-only APIs
  - No local layout recreation
  - Only config mapping: routes, labels, user state, feature visibility

### 2.0.4 Acceptance criteria (must pass)
- [ ] Desktop parity: top title bar actions, nav rows, sidebar drawer grouping, dashboard entry points
- [ ] Mobile parity: bottom navbar visible, bottom actions visible when registered, drawer opens/closes correctly
- [ ] Theme toggle visible and functional
- [ ] Locale control visible and functional (or intentionally hidden via config when single-locale)
- [ ] Seed/dev action available in authorized/dev context
- [ ] Breadcrumb + search behavior consistent across listing/detail pages
- [ ] Wrapping/responsiveness consistent across breakpoints (no clipped controls)

### 2.0.5 Integration note (important)
- letitrip currently consumes npm package @mohasinac/appkit@2.3.0.
- New AppLayoutShell extension points added in appkit source are not active in letitrip until one of:
  - appkit is published with these changes and letitrip dependency is updated, or
  - letitrip is temporarily pointed to local ../appkit package for integration testing.

## Phase 1 (Completed)
### Core Shell + Smoke Stabilization
- [x] Locale shell moved to appkit shell contract
  - File: src/app/[locale]/LayoutShellClient.tsx
  - Uses: AppLayoutShell
- [x] Homepage wired to appkit view
  - File: src/app/[locale]/page.tsx
  - Uses: MarketplaceHomepageView
- [x] Blog index wired to appkit view
  - File: src/app/[locale]/blog/page.tsx
  - Uses: BlogIndexPageView
- [x] Products index wired to appkit view
  - File: src/app/[locale]/products/page.tsx
  - Uses: ProductsIndexPageView
- [x] Smoke hardening: selectors + API fallback behavior
  - Files: src/app/[locale]/contact/page.tsx, src/app/[locale]/auth/login/page.tsx, src/app/api/products/route.ts

## Phase 2 (In Progress)

### 2.1 Commerce Routes (Started)
- [x] Cart route
  - File: src/app/[locale]/cart/page.tsx
  - Wired to: CartView
  - Notes: First-pass shell + empty state + summary panel
- [x] Checkout route
  - File: src/app/[locale]/checkout/page.tsx
  - Wired to: CheckoutView via client wrapper
  - Wrapper: src/components/routing/CheckoutRouteClient.tsx
- [x] Checkout success route
  - File: src/app/[locale]/checkout/success/page.tsx
  - Wired to: CheckoutSuccessView
- [x] Product detail route
  - File: src/app/[locale]/products/[slug]/page.tsx
  - Wired to: ProductDetailView
- [x] Auctions index route
  - File: src/app/[locale]/auctions/page.tsx
  - Wired to: RoutePlaceholderView (stable phase-2 placeholder)
- [x] Auction detail route
  - File: src/app/[locale]/auctions/[id]/page.tsx
  - Wired to: AuctionDetailView
- [x] Pre-orders index route
  - File: src/app/[locale]/pre-orders/page.tsx
  - Wired to: RoutePlaceholderView (stable phase-2 placeholder)
- [x] Pre-order detail route
  - File: src/app/[locale]/pre-orders/[id]/page.tsx
  - Wired to: PreOrderDetailView

### 2.2 Discovery Routes (Started)
- [x] Categories index
  - File: src/app/[locale]/categories/page.tsx
  - Wired to: CategoriesListView via client wrapper
  - Wrapper: src/components/routing/CategoriesRouteClient.tsx
- [x] Category detail
  - File: src/app/[locale]/categories/[slug]/page.tsx
  - Wired to: CategoryProductsView via client wrapper
  - Wrapper: src/components/routing/CategoryProductsRouteClient.tsx
- [x] Search
  - File: src/app/[locale]/search/page.tsx
  - Wired to: SearchView
- [x] Stores index
  - File: src/app/[locale]/stores/page.tsx
  - Wired to: StoresListView
- [x] Store root
  - File: src/app/[locale]/stores/[storeSlug]/page.tsx
  - Wired to: StoreAboutView
- [x] Store about
  - File: src/app/[locale]/stores/[storeSlug]/about/page.tsx
  - Wired to: StoreAboutView
- [x] Store products
  - File: src/app/[locale]/stores/[storeSlug]/products/page.tsx
  - Wired to: StoreProductsView via client wrapper
  - Wrapper: src/components/routing/StoreProductsRouteClient.tsx
- [x] Store auctions
  - File: src/app/[locale]/stores/[storeSlug]/auctions/page.tsx
  - Wired to: StoreAuctionsView
- [x] Store reviews
  - File: src/app/[locale]/stores/[storeSlug]/reviews/page.tsx
  - Wired to: StoreReviewsView
- [x] Events index
  - File: src/app/[locale]/events/page.tsx
  - Wired to: EventsListView
- [x] Event detail
  - File: src/app/[locale]/events/[id]/page.tsx
  - Wired to: EventDetailView
- [x] Event participate
  - File: src/app/[locale]/events/[id]/participate/page.tsx
  - Wired to: EventParticipateView
- [x] Promotions
  - File: src/app/[locale]/promotions/page.tsx
  - Wired to: PromotionsView
- [x] Reviews
  - File: src/app/[locale]/reviews/page.tsx
  - Wired to: ReviewsListView via client wrapper
  - Wrapper: src/components/routing/ReviewsRouteClient.tsx

### 2.3 Account/Seller/Admin Route Groups (Exhaustive Task List)
Status legend: [ ] pending, [~] scaffolded shell only, [x] wired to target appkit view

#### Account + Auth
- [ ] src/app/[locale]/auth/close/page.tsx -> appkit auth flow screen
- [ ] src/app/[locale]/auth/forgot-password/page.tsx -> ForgotPasswordView
- [ ] src/app/[locale]/auth/register/page.tsx -> appkit register view
- [ ] src/app/[locale]/auth/reset-password/page.tsx -> ResetPasswordView
- [ ] src/app/[locale]/auth/verify-email/page.tsx -> VerifyEmailView
- [ ] src/app/[locale]/user/page.tsx -> UserAccountHubView
- [ ] src/app/[locale]/user/profile/page.tsx -> ProfileView
- [ ] src/app/[locale]/user/settings/page.tsx -> UserSettingsView
- [ ] src/app/[locale]/user/orders/page.tsx -> UserOrdersView
- [ ] src/app/[locale]/user/orders/view/[id]/page.tsx -> OrderDetailView
- [ ] src/app/[locale]/user/orders/[id]/track/page.tsx -> UserOrderTrackView
- [ ] src/app/[locale]/user/addresses/page.tsx -> UserAddressesView
- [ ] src/app/[locale]/user/addresses/add/page.tsx -> UserAddressesView (add mode)
- [ ] src/app/[locale]/user/addresses/edit/[id]/page.tsx -> UserAddressesView (edit mode)
- [ ] src/app/[locale]/user/notifications/page.tsx -> UserNotificationsView
- [ ] src/app/[locale]/user/offers/page.tsx -> UserOffersView
- [ ] src/app/[locale]/user/messages/page.tsx -> MessagesView
- [ ] src/app/[locale]/user/become-seller/page.tsx -> BecomeSellerView
- [ ] src/app/[locale]/user/wishlist/page.tsx -> WishlistView

#### Seller
- [ ] src/app/[locale]/seller/page.tsx -> SellerDashboardView
- [ ] src/app/[locale]/seller/addresses/page.tsx -> SellerAddressesView
- [ ] src/app/[locale]/seller/analytics/page.tsx -> SellerAnalyticsView
- [ ] src/app/[locale]/seller/auctions/page.tsx -> SellerAuctionsView
- [ ] src/app/[locale]/seller/coupons/page.tsx -> SellerCouponsView
- [ ] src/app/[locale]/seller/coupons/new/page.tsx -> SellerCouponsView/create mode
- [ ] src/app/[locale]/seller/offers/page.tsx -> SellerOffersView
- [ ] src/app/[locale]/seller/orders/page.tsx -> SellerOrdersView
- [ ] src/app/[locale]/seller/payout-settings/page.tsx -> SellerPayoutSettingsView
- [ ] src/app/[locale]/seller/payouts/page.tsx -> SellerPayoutsView
- [ ] src/app/[locale]/seller/products/page.tsx -> SellerProductsView
- [ ] src/app/[locale]/seller/products/new/page.tsx -> SellerCreateProductView
- [ ] src/app/[locale]/seller/products/[id]/edit/page.tsx -> SellerEditProductView
- [ ] src/app/[locale]/seller/shipping/page.tsx -> SellerShippingView
- [ ] src/app/[locale]/seller/store/page.tsx -> SellerStoreView / SellerStoreSetupView
- [ ] src/app/[locale]/seller-guide/page.tsx -> SellerGuideView
- [ ] src/app/[locale]/sellers/page.tsx -> SellersListView
- [ ] src/app/[locale]/sellers/[id]/page.tsx -> SellerStorefrontView

#### Admin
- [ ] src/app/[locale]/admin/dashboard/page.tsx -> AdminDashboardView
- [ ] src/app/[locale]/admin/analytics/page.tsx -> AdminAnalyticsView
- [ ] src/app/[locale]/admin/bids/[[...action]]/page.tsx -> AdminBidsView
- [ ] src/app/[locale]/admin/blog/[[...action]]/page.tsx -> AdminBlogView
- [ ] src/app/[locale]/admin/carousel/[[...action]]/page.tsx -> AdminCarouselView
- [ ] src/app/[locale]/admin/categories/[[...action]]/page.tsx -> AdminCategoriesView
- [ ] src/app/[locale]/admin/copilot/page.tsx -> AdminCopilotView
- [ ] src/app/[locale]/admin/coupons/[[...action]]/page.tsx -> AdminCouponsView
- [ ] src/app/[locale]/admin/events/page.tsx -> AdminEventsView
- [ ] src/app/[locale]/admin/events/[id]/entries/page.tsx -> AdminEventEntriesView
- [ ] src/app/[locale]/admin/faqs/[[...action]]/page.tsx -> AdminFaqsView
- [ ] src/app/[locale]/admin/feature-flags/page.tsx -> AdminFeatureFlagsView
- [ ] src/app/[locale]/admin/media/page.tsx -> AdminMediaView
- [ ] src/app/[locale]/admin/navigation/page.tsx -> AdminNavigationView
- [ ] src/app/[locale]/admin/orders/[[...action]]/page.tsx -> AdminOrdersView
- [ ] src/app/[locale]/admin/payouts/page.tsx -> AdminPayoutsView
- [ ] src/app/[locale]/admin/products/[[...action]]/page.tsx -> AdminProductsView
- [ ] src/app/[locale]/admin/reviews/[[...action]]/page.tsx -> AdminReviewsView
- [ ] src/app/[locale]/admin/sections/[[...action]]/page.tsx -> AdminSectionsView
- [ ] src/app/[locale]/admin/site/page.tsx -> AdminSiteView
- [ ] src/app/[locale]/admin/stores/page.tsx -> AdminStoresView
- [ ] src/app/[locale]/admin/users/[[...action]]/page.tsx -> AdminUsersView

#### Informational + Legal + Support
- [ ] src/app/[locale]/about/page.tsx -> AboutView
- [ ] src/app/[locale]/blog/[slug]/page.tsx -> BlogPostView
- [ ] src/app/[locale]/faqs/page.tsx -> FAQ page content in appkit
- [ ] src/app/[locale]/faqs/[category]/page.tsx -> FAQ category view
- [ ] src/app/[locale]/help/page.tsx -> support/help appkit view
- [ ] src/app/[locale]/privacy/page.tsx -> legal appkit view
- [ ] src/app/[locale]/terms/page.tsx -> legal appkit view
- [ ] src/app/[locale]/cookies/page.tsx -> legal appkit view
- [ ] src/app/[locale]/refund-policy/page.tsx -> legal/policy appkit view
- [ ] src/app/[locale]/profile/[userId]/page.tsx -> public profile appkit view
- [ ] src/app/[locale]/unauthorized/page.tsx -> unauthorized appkit view
- [ ] src/app/[locale]/demo/seed/page.tsx -> DemoSeedView

## Route Scaffolding (Completed)
- [x] Added shared scaffold component for previously null routes
  - File: src/components/routing/RoutePlaceholderView.tsx
- [x] Replaced all locale `return null` pages with renderable route outputs

## Validation
- [x] Build passes after phase updates
  - Command: npm run build
- [x] Smoke suite passes
  - Command: npm run test:smoke
  - Result: 38/38

## Next Execution Slice
1. Complete Phase 2.0 layout parity tasks in appkit first (shell props, sidebar sections, theme/locale/dev/notification slots).
2. Rewire letitrip thin shell to those appkit extension points only.
3. Continue Phase 2 route migration in order: Account -> Seller -> Admin.
4. Replace temporary placeholders in Commerce/Discovery with full appkit data bindings and shared constants.
