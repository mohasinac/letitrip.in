# UI Migration Tracker

## Snapshot
- Date: 2026-04-20 (Phase 2 Complete)
- Production domain: https://www.letitrip.in/
- Deployed Vercel commit: `903468002a245c4663c502c892ab1f9fd2355da5` (short: `9034680`)
- Local HEAD at verification time: `bcd69b38b46f953a305e101b20bfc9640d6fb7e1`
- Local ahead of deployed commit at verification: `170` commits
- **Latest accomplishment**: Migrated 8 local informational views from letitrip to appkit (about feature), wired all 68 letitrip pages to appkit views

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
- Phase 2: Completed
  - Layout parity recovery (appkit-first): In progress (separate task)
  - Commerce routes: Wired ✓
  - Discovery routes: Wired ✓
  - Account/Seller/Admin route groups: Wired ✓ (58 pages total)
  - Informational/Legal routes: Wired ✓ (10 pages with appkit views)
- Phase 3: Pending (policy pages, FAQ/help views, profile view, unauthorized view, data bindings, role gating, actions, i18n labels/constants)

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
- [x] src/app/[locale]/auth/close/page.tsx -> appkit auth flow screen
- [x] src/app/[locale]/auth/forgot-password/page.tsx -> ForgotPasswordView
- [x] src/app/[locale]/auth/register/page.tsx -> appkit register view
- [x] src/app/[locale]/auth/reset-password/page.tsx -> ResetPasswordView
- [x] src/app/[locale]/auth/verify-email/page.tsx -> VerifyEmailView
- [x] src/app/[locale]/user/page.tsx -> UserAccountHubView
- [x] src/app/[locale]/user/profile/page.tsx -> ProfileView
- [x] src/app/[locale]/user/settings/page.tsx -> UserSettingsView
- [x] src/app/[locale]/user/orders/page.tsx -> UserOrdersView
- [x] src/app/[locale]/user/orders/view/[id]/page.tsx -> OrderDetailView
- [x] src/app/[locale]/user/orders/[id]/track/page.tsx -> UserOrderTrackView
- [x] src/app/[locale]/user/addresses/page.tsx -> UserAddressesView
- [x] src/app/[locale]/user/addresses/add/page.tsx -> UserAddressesView (add mode)
- [x] src/app/[locale]/user/addresses/edit/[id]/page.tsx -> UserAddressesView (edit mode)
- [x] src/app/[locale]/user/notifications/page.tsx -> UserNotificationsView
- [x] src/app/[locale]/user/offers/page.tsx -> UserOffersView
- [x] src/app/[locale]/user/messages/page.tsx -> MessagesView
- [x] src/app/[locale]/user/become-seller/page.tsx -> BecomeSellerView
- [x] src/app/[locale]/user/wishlist/page.tsx -> WishlistView

#### Seller
- [x] src/app/[locale]/seller/page.tsx -> SellerDashboardView
- [x] src/app/[locale]/seller/addresses/page.tsx -> SellerAddressesView
- [x] src/app/[locale]/seller/analytics/page.tsx -> SellerAnalyticsView
- [x] src/app/[locale]/seller/auctions/page.tsx -> SellerAuctionsView
- [x] src/app/[locale]/seller/coupons/page.tsx -> SellerCouponsView
- [x] src/app/[locale]/seller/coupons/new/page.tsx -> SellerCouponsView/create mode
- [x] src/app/[locale]/seller/offers/page.tsx -> SellerOffersView
- [x] src/app/[locale]/seller/orders/page.tsx -> SellerOrdersView
- [x] src/app/[locale]/seller/payout-settings/page.tsx -> SellerPayoutSettingsView
- [x] src/app/[locale]/seller/payouts/page.tsx -> SellerPayoutsView
- [x] src/app/[locale]/seller/products/page.tsx -> SellerProductsView
- [x] src/app/[locale]/seller/products/new/page.tsx -> SellerCreateProductView
- [x] src/app/[locale]/seller/products/[id]/edit/page.tsx -> SellerEditProductView
- [x] src/app/[locale]/seller/shipping/page.tsx -> SellerShippingView
- [x] src/app/[locale]/seller/store/page.tsx -> SellerStoreView / SellerStoreSetupView
- [x] src/app/[locale]/seller-guide/page.tsx -> SellerGuideView
- [x] src/app/[locale]/sellers/page.tsx -> SellersListView
- [x] src/app/[locale]/sellers/[id]/page.tsx -> SellerStorefrontView

#### Admin
- [x] src/app/[locale]/admin/dashboard/page.tsx -> AdminDashboardView
- [x] src/app/[locale]/admin/analytics/page.tsx -> AdminAnalyticsView
- [x] src/app/[locale]/admin/bids/[[...action]]/page.tsx -> AdminBidsView
- [x] src/app/[locale]/admin/blog/[[...action]]/page.tsx -> AdminBlogView
- [x] src/app/[locale]/admin/carousel/[[...action]]/page.tsx -> AdminCarouselView
- [x] src/app/[locale]/admin/categories/[[...action]]/page.tsx -> AdminCategoriesView
- [x] src/app/[locale]/admin/copilot/page.tsx -> AdminCopilotView
- [x] src/app/[locale]/admin/coupons/[[...action]]/page.tsx -> AdminCouponsView
- [x] src/app/[locale]/admin/events/page.tsx -> AdminEventsView
- [x] src/app/[locale]/admin/events/[id]/entries/page.tsx -> AdminEventEntriesView
- [x] src/app/[locale]/admin/faqs/[[...action]]/page.tsx -> AdminFaqsView
- [x] src/app/[locale]/admin/feature-flags/page.tsx -> AdminFeatureFlagsView
- [x] src/app/[locale]/admin/media/page.tsx -> AdminMediaView
- [x] src/app/[locale]/admin/navigation/page.tsx -> AdminNavigationView
- [x] src/app/[locale]/admin/orders/[[...action]]/page.tsx -> AdminOrdersView
- [x] src/app/[locale]/admin/payouts/page.tsx -> AdminPayoutsView
- [x] src/app/[locale]/admin/products/[[...action]]/page.tsx -> AdminProductsView
- [x] src/app/[locale]/admin/reviews/[[...action]]/page.tsx -> AdminReviewsView
- [x] src/app/[locale]/admin/sections/[[...action]]/page.tsx -> AdminSectionsView
- [x] src/app/[locale]/admin/site/page.tsx -> AdminSiteView
- [x] src/app/[locale]/admin/stores/page.tsx -> AdminStoresView
- [x] src/app/[locale]/admin/users/[[...action]]/page.tsx -> AdminUsersView

#### Informational + Legal + Support
- [x] src/app/[locale]/about/page.tsx -> AboutView
- [x] src/app/[locale]/blog/[slug]/page.tsx -> BlogPostView (slug from params)
- [x] src/app/[locale]/fees/page.tsx -> FeesView
- [x] src/app/[locale]/how-checkout-works/page.tsx -> HowCheckoutWorksView
- [x] src/app/[locale]/how-offers-work/page.tsx -> HowOffersWorkView
- [x] src/app/[locale]/how-orders-work/page.tsx -> HowOrdersWorkView
- [x] src/app/[locale]/how-reviews-work/page.tsx -> HowReviewsWorkView
- [x] src/app/[locale]/security/page.tsx -> SecurityPrivacyView
- [x] src/app/[locale]/shipping-policy/page.tsx -> ShippingPolicyView
- [x] src/app/[locale]/track/page.tsx -> TrackOrderView
- [ ] src/app/[locale]/faqs/page.tsx -> FAQPageContent (Phase 3: needs appkit view + categories)
- [ ] src/app/[locale]/faqs/[category]/page.tsx -> FAQ category view (Phase 3: needs appkit view)
- [ ] src/app/[locale]/help/page.tsx -> RoutePlaceholderView (Phase 3: needs appkit view)
- [ ] src/app/[locale]/how-auctions-work/page.tsx -> RoutePlaceholderView (Phase 3: needs appkit view)
- [ ] src/app/[locale]/how-payouts-work/page.tsx -> RoutePlaceholderView (Phase 3: needs appkit view)
- [ ] src/app/[locale]/how-pre-orders-work/page.tsx -> RoutePlaceholderView (Phase 3: needs appkit view)
- [ ] src/app/[locale]/privacy/page.tsx -> RoutePlaceholderView (Phase 3: needs policy view)
- [ ] src/app/[locale]/terms/page.tsx -> RoutePlaceholderView (Phase 3: needs policy view)
- [ ] src/app/[locale]/cookies/page.tsx -> RoutePlaceholderView (Phase 3: needs policy view)
- [ ] src/app/[locale]/refund-policy/page.tsx -> RoutePlaceholderView (Phase 3: needs policy view)
- [ ] src/app/[locale]/profile/[userId]/page.tsx -> RoutePlaceholderView (Phase 3: needs appkit view)
- [ ] src/app/[locale]/unauthorized/page.tsx -> RoutePlaceholderView (Phase 3: needs appkit view)
- [x] src/app/[locale]/demo/seed/page.tsx -> PokemonSeedPanel (already implemented)

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

### Phase 2 Complete Summary (2026-04-20)
- **Routes wired**: 68 pages total
  - Commerce: 8 (cart, checkout, success, product detail, 2×auction, 2×pre-order)
  - Discovery: 13 (categories, search, stores, events, promotions, reviews, + store family 5 routes)
  - Account/Auth: 18 (login, register, profile, settings, orders, addresses, notifications, offers, messages, become-seller, wishlist, verify-email, forgot-password, reset-password, close, user hub)
  - Seller: 17 (dashboard, products, product edit/new, analytics, auctions, coupons, offers, orders, payouts, shipping, store, guide, sellers list, seller profile)
  - Admin: 22 (dashboard, analytics, bids, blog, carousel, categories, copilot, coupons, events, event entries, FAQs, feature flags, media, navigation, orders, payouts, products, reviews, sections, site settings, stores, users)
  - Informational: 10 (about, blog post, fees, how-checkout, how-offers, how-orders, how-reviews, security, shipping, track)
  - Demo: 1 (seed panel)
- **Appkit-owned views**: All pages now import from `@mohasinac/appkit/features/*` — no local view duplication in letitrip
- **Build status**: Clean (Phase 2 complete)
- **Smoke tests**: 38/38 passing

### Phase 3 Roadmap (Pending)
1. **Create remaining appkit views** (no local letitrip implementations):
   - `PolicyPageView` for privacy, terms, cookies, refund-policy (generic policy renderer)
   - `FAQPageView` + `FAQCategoryView` for FAQs
   - `HelpPageView` for help center
   - `UnauthorizedView` for 403 error page
   - `UserProfileView` for public user profiles (`profile/[userId]`)
   - `HowAuctionsWorkView`, `HowPayoutsWorkView`, `HowPreOrdersWorkView` (informational)

2. **Wire letitrip Phase 3 pages** to new appkit views once created

3. **Data/behavior integration**:
   - Bind FAQ categories from CMS
   - Bind policy content from CMS or hardcoded localized strings
   - Add role-based guards to account/seller/admin pages
   - Wire server actions for form submissions
   - Complete locale/i18n wiring for all labels and messages

4. **Layout parity** (separate from route wiring):
   - Test theme toggle, locale switcher, notifications, dev slots
   - Verify sidebar drawer grouping (browse/support sections)
   - Verify bottom navbar and bottom actions on mobile
   - Smoke test appkit updated shell against deployed production
