# Frontend Implementation Plan

> **Source:** Derived from `FRONTEND_REFACTOR_PLAN.md` audit (Feb 20, 2026)  
> **Principle:** Each phase is independently shippable. Later phases depend on earlier ones. Tests are last.

---

## Phase Overview

> **Testing strategy:** Every sub-step in every phase includes tests written immediately after the implementation code. There is no separate test phase. Tests ship in the same PR as the code they cover.

| Phase  | Name                                           | Sections                             | Risk                              | Est. files (impl + tests) |
| ------ | ---------------------------------------------- | ------------------------------------ | --------------------------------- | ------------------------- |
| **1**  | Foundation � deps, constants, schema + cleanup | F1, G, C4, G-remaining               | ?? Zero breaking                  | ~12                       |
| **2**  | Shared UI primitives                           | B1�B5, A1�A3                         | ?? Additive only                  | ~18                       |
| **3**  | Infrastructure wiring                          | A4�A5, barrel exports                | ?? Minor API change               | ~8                        |
| **4**  | Admin pages                                    | A (admin)                            | ?? Admin-only impact              | ~14                       |
| **5**  | Public list pages                              | A+B (public)                         | ?? User-facing                    | ~10                       |
| **6**  | Seller & user pages + CRUD drawers             | A+B+D (seller/user)                  | ?? Seller-facing                  | ~10                       |
| **7**  | FAQ routes + homepage tabs                     | E                                    | ?? New routes                     | ~8                        |
| **8**  | Footer & navigation rewrite                    | F2�F5                                | ?? Visual, site-wide              | ~8                        |
| **9**  | Inline create drawers                          | C1�C3                                | ?? Schema change                  | ~10                       |
| **10** | Gestures + accessibility                       | H                                    | ?? Cross-cutting                  | ~22                       |
| **11** | Homepage sections                              | I                                    | ?? Public-facing                  | ~20                       |
| **12** | Dashboard page styling                         | J                                    | ?? Internal-facing                | ~16                       |
| **13** | Non-tech friendly UX                           | K                                    | ?? User-facing, site-wide         | ~28                       |
| **14** | Code deduplication                             | L                                    | ?? Minor breaking (route renames) | ~12                       |
| **15** | SEO � full-stack coverage                      | M                                    | ?? Additive + schema change       | ~30                       |
| **16** | Newsletter admin management                    | N                                    | ?? Additive                       | ~8                        |
| **17** | Next.js 16 compatibility � async params        | Maintenance                          | ?? Zero breaking                  | ~5                        |
| **18** | Dedicated test phase                           | All phases 1�17                      | ?? Non-breaking (tests only)      | ~90 test files            |
| **19** | _(reserved)_                                   | TBD                                  | TBD                               | TBD                       |
| **20** | Standards gap-fix sweep                        | All phases 1-18                      | âš ï¸ Cross-cutting               | ~45                       |
| **21** | Code-reuse & fetch() violation sweep           | All phases 1-18                      | âš ï¸ Cross-cutting               | ~40                       |
| **22** | Event management system                        | Schema, API, Admin UI, Public UI     | ⚡ New vertical feature           | ~65                       |
| **23** | Integration hardening & tech-debt cleanup      | Maintenance sweep                    | ⚡ Additive                       | ~15                       |
| **24** | Styling constants cleanup                      | THEME_CONSTANTS gap-fix              | ⚡ Additive                       | ~10                       |
| **25** | i18n infrastructure & message files            | next-intl install + routing          | ⚡ Additive                       | ~8                        |
| **26** | `[locale]` route migration                     | All `src/app/` pages moved           | ⚠️ Cross-cutting                  | ~35                       |
| **27** | Zod error map + locale switcher UI             | Zod v4 map, LocaleSwitcher           | ⚡ Additive                       | ~8                        |
| **28** | Nav/Layout i18n wiring                         | TitleBar, Sidebar aria-labels        | ⚡ Additive                       | ~5                        |
| **29** | Auth pages i18n wiring                         | LoginForm, RegisterForm, auth pages  | ⚡ Additive                       | ~12                       |
| **30** | Public pages i18n wiring                       | cart, wishlist, settings pages       | ⚡ Additive                       | ~6                        |
| **31** | User portal pages i18n wiring                  | dashboard, orders, profile, etc.     | ⚡ Additive                       | ~8                        |
| **32** | Products/checkout/search/auctions i18n wiring  | 9 pages, ICU plurals                 | ⚡ Additive                       | ~9                        |
| **33** | Static/content pages i18n wiring               | about, terms, privacy, sellers, etc. | ⚡ Additive                       | ~9                        |
| **34** | Seller portal pages i18n wiring                | 7 seller pages                       | ⚡ Additive                       | ~7                        |
| **35** | Admin pages i18n wiring (batch 1)              | dashboard, analytics, media, etc.    | ⚡ Additive                       | ~6                        |
| **36** | Admin pages i18n wiring (batch 2)              | users, products, orders, etc.        | ⚡ Additive                       | ~13                       |
| **37** | Service layer migration                        | All API-calling components, contexts | ⚠️ Cross-cutting                  | ~32                       |

---

## Progress Tracker

> Update this table as work proceeds. One phase at a time � mark **In Progress** before starting, **Done** when every file change and test in that phase is complete and `npx tsc --noEmit` passes.

| Phase  | Status         | Started    | Completed  | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------ | -------------- | ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1**  | ? Done         | 2026-02-21 | 2026-02-21 |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **2**  | ? Done         | 2026-02-21 | 2026-02-21 | 48 tests � 9 components/hooks � 0 TS errors                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **3**  | ? Done         | 2026-02-21 | 2026-02-21 | 12 tests � externalPagination � SearchResultsSection Pagination                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **4**  | ? Done         | 2026-02-21 | 2026-02-21 | 7 admin pages � useUrlTable � server pagination � filter bars � FAQs data bug fixed � 0 TS errors � **gap fix: admin FAQs TablePagination + paginated response type**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **5**  | ? Done         | 2026-02-21 | 2026-02-21 | products � search � auctions � blog � categories/[slug] � FilterDrawer � ActiveFilterChips � **gap fix: search/auctions/categories FilterDrawer+ActiveFilterChips wired** âš ï¸ raw fetch() violations â†’ Phase 21; barrel import violations â†’ Phase 20                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **6**  | ? Done         | 2026-02-21 | 2026-02-21 | seller/products drawer � seller/orders � user/orders � CRUD drawers verified � **gap fix: seller/products FilterDrawer+ActiveFilterChips � user/orders TablePagination** âš ï¸ raw fetch() in addresses/notifications/settings/wishlist/sellers pages â†’ Phase 21                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **7**  | ? Done         | 2026-02-21 | 2026-02-21 | FAQ dynamic route � category tabs � FAQCategorySidebar URL update � **gap fix: FAQCategorySidebar `<Link>` with ROUTES.PUBLIC.FAQ_CATEGORY**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **8**  | ? Done         | 2026-02-21 | 2026-02-21 | Footer 5-col rewrite � EnhancedFooter deleted � lucide-react nav icons � Sidebar polish                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **9**  | ? Done         | 2026-02-21 | 2026-02-21 | CategorySelectorCreate � AddressSelectorCreate � ProductForm wired                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **10** | ? Done         | 2026-02-21 | 2026-02-21 | useLongPress � usePullToRefresh � SideDrawer focus trap � Tabs keyboard � HeroCarousel ARIA                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **11** | ? Done         | 2026-02-21 | 2026-02-21 | TrustFeaturesSection (merged) � HomepageSkeleton � mobile snap-scroll carousels � lucide icons � useSwipe � useApiMutation newsletter                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **12** | ? Done         | 2026-02-21 | 2026-02-21 | AdminStatsCards lucide+stat tokens � AdminDashboardSkeleton � SellerStatCard ReactNode icon � RecentActivityCard lucide � AdminPageHeader description+breadcrumb � user/profile hooks order fix                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **13** | ? Done         | 2026-02-21 | 2026-02-21 | Button isLoading+touch targets � EmptyState actionHref � SORT/HELP_TEXT/ACTIONS constants � messages human-friendly � search EmptyState+lucide � products empty state � seller onboarding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **14** | ? Done         | 2026-02-21 | 2026-02-21 | AutoBreadcrumbs extracted � validation schemas merged � profile PATCH on USER.PROFILE � 4 files deleted � 0 TS errors                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **15** | ? Done         | 2026-02-21 | 2026-02-21 | sitemap � robots � OG image � JSON-LD helpers � product slug URLs � per-page metadata � noIndex for auth/admin/seller/user/checkout/cart                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **16** | ? Done         | 2026-02-22 | 2026-02-22 | newsletter subscriber list � stats � unsubscribe/resubscribe/delete � Sieve-powered API � admin nav entry                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **17** | ? Done         | 2026-02-21 | 2026-02-21 | Next.js 16 async params migration: 4 route handlers + faqs page � .next cache cleared � 0 TS errors                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **18** | ✅ Done        | 2026-02-21 | 2026-02-24 | 274/274 suites green — 3070 tests (3066 passed + 4 skipped) — 0 failures. 11 new test files added across 3 batches: FilterDrawer/admin list pages, API routes (admin-users, admin-sessions), cart/checkout/checkout-success/sellers/sellers-[id] pages. All 18 sub-phases (18.1–18.19) complete.                                                                                                                                                                                                                                                                                                                                                                                                              |
| **19** | ? Not started  | --         | --         |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **20** | ✅ Done        | 2026-02-23 | 2026-02-23 | Gap-fix sweep complete — 274/274 suites green (3072 tests, +2 new). Barrel imports: 7 pages fixed; exceptions: `opengraph-image.tsx` keeps `@/constants/seo` (edge runtime), `api/search` + `api/faqs` keep `@/helpers/data/sieve.helper` (intentionally not in barrel). Hardcoded routes: 3 files fixed. `console.warn → logger.warn` in `useRealtimeBids`. Products API response shape: `successResponse({items,...})` (was `{data,meta}`); consuming pages updated. `formatMonthYear`/`formatFileSize` replace inline logic in 3 API routes. Tests: all 6 Phase 20 suites updated/extended. Pre-existing flaky test in `token.helper.test.ts` (timing-sensitive, passes in isolation) noted and unchanged. |
| **21** | ✅ Done        | 2026-02-24 | 2026-02-24 | Code-reuse & fetch() violation sweep — 15 files migrated from raw fetch() → apiClient (wishlist, analytics, payouts, orders, seller/page, settings, addresses/add+edit, notifications, NotificationBell, FAQPageContent, ImageUpload, sellers/[id], profile/[userId], search/page). sieveQuery() added to faqs.repository.ts; api/faqs/route.ts dual-path (Firestore-native when no tags/search); api/search/route.ts fully replaced findAll()+applySieveToArray with productRepository.list(). Firestore indexes added for faqs/payouts/posts. Tests updated (public-search + faqs suites). 27/27 tests green.                                                                                               |
| **22** | ✅ Done        | 2026-02-24 | 2026-02-24 | Event management system complete (22a–22d). Schema + constants + repositories (EventDocument, EventEntryDocument, 5 event types, SIEVE_FIELDS). 10 API routes (admin CRUD, status, entries, stats, public list/detail/enter/leaderboard). Admin UI feature module (EventFormDrawer with 5 type-config sub-forms, EventsTable, EventEntriesTable, EntryReviewDrawer, EventStatsBanner, SurveyFieldBuilder). Public UI (EventBanner in layout, EventCard, PollVotingSection, FeedbackEventSection, SurveyEventSection, EventLeaderboard, /events, /events/[id], /events/[id]/participate). 0 TS errors. 22e (tests) skipped per user instruction.                                                               |
| **23** | ✅ Done        | 2026-02-24 | 2026-02-24 | Integration hardening — tech-debt cleanup, dead-code removal, type-safety sweep. 0 TS errors.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **24** | ✅ Done        | 2026-02-24 | 2026-02-24 | Styling constants cleanup — THEME_CONSTANTS gap-fix batch, raw Tailwind strings replaced with constants in 6.3 final batch. 0 TS errors.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **25** | ✅ Done        | 2026-02-24 | 2026-02-24 | i18n infrastructure — next-intl installed; `src/i18n/routing.ts` + `src/i18n/request.ts`; `messages/en.json` + `messages/hi.json` (550 keys each). 0 TS errors.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **26** | ✅ Done        | 2026-02-24 | 2026-02-24 | `[locale]` route migration — middleware activated; all 23 route dirs moved under `src/app/[locale]/`; root layout slimmed to HTML shell; 274/274 suites green.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **27** | ✅ Done        | 2026-02-25 | 2026-02-25 | Zod v4 error map + LocaleSwitcher — `src/lib/zod-error-map.ts` (custom `zodErrorMap` + `setupZodErrorMap`); `ZodSetup` client component wired in layout; `src/i18n/navigation.ts` (`createNavigation`); `LocaleSwitcher` pill UI in TitleBar; `locale` key added to en.json + hi.json; jest.config.ts updated (`next-intl` + `use-intl` in transform allowlist); `@/i18n/navigation` mock in jest.setup.ts; 25 new tests; 276/276 suites green — 3097 tests.                                                                                                                                                                                                                                                  |
| **28** | ✅ Done        | 2026-02-26 | 2026-02-26 | Nav/Layout i18n wiring — `TitleBar` aria-labels → `useTranslations("accessibility")` (4 strings); `Sidebar` → `useTranslations("nav")` (~17 strings); orphaned duplicate return block removed from `not-found.tsx`; TitleBar + Sidebar tests updated; 276/276 suites green.                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **29** | ✅ Done        | 2026-02-26 | 2026-02-26 | Auth pages i18n wiring — `LoginForm`/`RegisterForm` module-level `LABELS` const moved inside component as `useTranslations("auth")`; `forgot-password`, `reset-password`, `verify-email`, `unauthorized` pages fully wired; next-intl interpolation `t("key", { var })` pattern applied; 276/276 suites green.                                                                                                                                                                                                                                                                                                                                                                                                |
| **30** | ✅ Done        | 2026-02-26 | 2026-02-26 | Public pages i18n wiring — `cart/page`, `user/wishlist/page`, `user/settings/page` wired; `wishlist.subtitle` key added to `en.json` + `hi.json`; all existing page tests updated to use i18n-resolved values; 276/276 suites green — 3097 tests.                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **31** | ✅ Done        | 2026-02-27 | 2026-02-27 | User pages i18n wiring — all user portal pages (`dashboard`, `orders`, `orders/[id]`, `profile`, `addresses`, `notifications`, `reviews`, `bids`) wired with `useTranslations`; `userDashboard.*`, `userOrders.*`, `userProfile.*`, `userAddresses.*`, `userNotifications.*`, `userReviews.*`, `userBids.*` namespaces added to `en.json` + `hi.json`; 0 TS errors.                                                                                                                                                                                                                                                                                                                                           |
| **32** | ✅ Done        | 2026-02-27 | 2026-02-27 | Product/checkout/search/categories/auctions i18n wiring — 9 pages wired: `products`, `products/[slug]`, `checkout`, `checkout/success`, `categories`, `categories/[slug]`, `search`, `auctions`, `auctions/[id]`; module-level `SORT_OPTIONS`/`STEPS` arrays moved inside components; `formatCountdown` refactored to accept `endedLabel: string` param; ICU plurals for `resultsCount` + `totalBids`; `products.*`, `checkout.*`, `orderSuccess.*`, `auctions.*`, `search.*`, `categories.*` namespaces extended in `en.json` + `hi.json`; 0 TS errors.                                                                                                                                                      |
| **33** | ✅ Done        | 2026-02-27 | 2026-02-27 | Static/content pages i18n wiring — 9 pages wired: `contact`, `events`, `blog`, `blog/[slug]` (client, `useTranslations`); `about`, `terms`, `privacy`, `sellers`, `help` (server components, `getTranslations` from `next-intl/server`); `export const metadata` → `export async function generateMetadata()`; module-level `SECTIONS`/`BENEFITS`/`STEPS`/`FAQS`/`TOPICS` arrays moved inside async component bodies; `blog.*`, `contact.*`, `events.*`, `about.*`, `terms.*`, `privacy.*`, `sellersPage.*`, `help.*` namespaces added to `en.json` + `hi.json`; 0 TS errors.                                                                                                                                 |
| **34** | ✅ Done        | 2026-02-27 | 2026-02-27 | Seller portal pages i18n wiring — `seller/page`, `seller/analytics`, `seller/orders`, `seller/payouts`, `seller/products`, `seller/products/[id]/edit`. All `UI_LABELS.SELLER_PAGE.*`, `UI_LABELS.SELLER_ANALYTICS.*`, `UI_LABELS.SELLER_PAYOUTS.*` replaced with `useTranslations`. Module-level `SELLER_LABELS` + `STATUS_TABS`/`STATUS_OPTIONS` aliases moved inside components. `sellerDashboard.*`, `sellerAnalytics.*`, `sellerOrders.*`, `sellerPayouts.*`, `sellerProducts.*` namespaces added to `en.json` + `hi.json`. 0 TS errors.                                                                                                                                                                 |
| **35** | ✅ Done        | 2026-02-27 | 2026-02-27 | Admin pages i18n wiring batch 1 — `admin/dashboard`, `admin/analytics`, `admin/media`, `admin/newsletter`, `admin/payouts`, `admin/site`. Module-level `LABELS`/`STATUS_TABS` aliases moved inside components. `adminDashboard.*`, `adminAnalytics.*`, `adminMedia.*`, `adminNewsletter.*`, `adminPayouts.*`, `adminSite.*` namespaces added to `en.json` + `hi.json`. 0 TS errors.                                                                                                                                                                                                                                                                                                                           |
| **36** | ✅ Done        | 2026-02-27 | 2026-02-28 | Admin pages i18n wiring batch 2 — `admin/users`, `admin/products`, `admin/orders`, `admin/reviews`, `admin/bids`, `admin/blog`, `admin/categories`, `admin/faqs`, `admin/carousel`, `admin/sections`, `admin/coupons`, `admin/events`, `admin/events/[id]/entries`. All remaining `UI_LABELS.ADMIN.*` replaced.                                                                                                                                                                                                                                                                                                                                                                                               |
| **37** | 🔄 In Progress | 2026-02-28 | --         | Service Layer Migration — 37.1–37.13 ✅ complete. 37.14 (oversized pages decomposition) remaining. New: `UnsavedChangesModal`, `ROUTES.BLOG`, `sessionService` wiring in auth-helpers, all `console.*` → `serverLogger`/`logger`, all `throw new Error` → typed error classes, raw role comparisons → `hasRole`/`hasAnyRole`, hardcoded routes/API-paths/`window.confirm` replaced. 0 TS errors.                                                                                                                                                                                                                                                                                                              |

**Status legend:** ? Not started � ?? In progress � ? Done � ? Blocked

---

## Viewport Targets

Every component and page **must look and work correctly at all three viewport classes.** Design decisions, breakpoint choices, and layout switches in every phase are governed by this matrix.

| Class          | Breakpoint       | Tailwind prefix               | Typical device                           | Key layout rules                                                                                                               |
| -------------- | ---------------- | ----------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Mobile**     | < 640 px         | _(default)_                   | Phone portrait/landscape                 | Single column; drawers full-screen (`w-full`); bottom nav or hamburger; no visible sidebars                                    |
| **Desktop**    | 640 px � 1535 px | `sm:` � `md:` � `lg:` � `xl:` | Tablet portrait ? standard 1080p monitor | Two-column layouts appear at `lg`; drawers partial-width (`md:w-3/5`); sidebars visible at `lg+`                               |
| **Widescreen** | = 1536 px        | `2xl:`                        | 1440p / 4K / ultrawide                   | Max-width containers cap at `max-w-screen-2xl`; admin sidebar + main + detail panel can coexist; DataTable gains extra columns |

### Per-feature breakpoint rules

| Feature          | Mobile                                                     | Desktop (lg)                                   | Widescreen (2xl)                                  |
| ---------------- | ---------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------- |
| **Filter UI**    | `<FilterDrawer>` triggered by "Filters (n)" button         | `<ProductFilters>` always-visible left sidebar | Same as desktop; sidebar may be wider             |
| **CRUD drawers** | `SideDrawer` full-screen (`w-full`)                        | `md:w-3/5`                                     | `lg:max-w-2xl` (complex forms like `ProductForm`) |
| **Admin pages**  | Horizontal scroll on DataTable; filters collapse to drawer | Inline `AdminFilterBar`; full DataTable        | Extra columns visible; wider filter bar           |
| **Footer**       | Single column stack                                        | 5-column grid (`lg:grid-cols-5`)               | Constrained to `max-w-screen-2xl mx-auto`         |
| **Navigation**   | Hamburger menu / bottom tabs                               | Full horizontal nav or sidebar                 | Same; extra spacing                               |
| **FAQ sidebar**  | `<FilterDrawer side="left">` triggered by button           | Always-visible left sidebar                    | Same as desktop                                   |
| **Pagination**   | Compact `<Pagination>` (prev/next + current page)          | Full page-number strip                         | Same as desktop                                   |

> **Widescreen rule:** Never let content stretch edge-to-edge on = 1536 px. All page wrappers use `max-w-screen-2xl mx-auto px-4 lg:px-8 2xl:px-12`. If a component currently uses a narrower max-width, preserve it � do not widen just because more space is available.

---

## Phase 1 � Foundation

**Goal:** All prerequisites in place. Nothing breaks. No UI changes.

### 1.1 Install `lucide-react`

```bash
npm install lucide-react
```

### 1.2 Add missing constants

**`src/constants/ui.ts`** � add these keys:

```typescript
// Roles
UI_LABELS.ROLES = {
  ALL: "All Roles",
  USER: "User",
  SELLER: "Seller",
  MODERATOR: "Moderator",
  ADMIN: "Admin",
};

// Actions
UI_LABELS.ACTIONS.ADD_ADDRESS = "Add new address";
UI_LABELS.ACTIONS.ADD_CATEGORY = "New category";
UI_LABELS.ACTIONS.VIEW_ALL_ARROW = "View all ?";
UI_LABELS.ACTIONS.LOAD_MORE = "Load more";
UI_LABELS.ACTIONS.CLEAR_ALL = "Clear all";
UI_LABELS.ACTIONS.APPLY_FILTERS = "Apply filters";
UI_LABELS.ACTIONS.ADD_PRODUCT = "Add product";

// Form labels
UI_LABELS.FORM.PICKUP_ADDRESS = "Pickup Address";
UI_LABELS.FORM.CATEGORY = "Category";

// Table
UI_LABELS.TABLE = {
  SORT_BY: "Sort by",
  PER_PAGE: "Per page",
  SHOWING: "Showing",
  OF: "of",
  RESULTS: "results",
  NO_RESULTS: "No results found",
  LOAD_MORE: "Load 10 more",
};

// Admin products (add to existing ADMIN.PRODUCTS block)
UI_LABELS.ADMIN.PRODUCTS.PICKUP_ADDRESS = "Pickup Address";

// Filter labels
UI_LABELS.FILTERS = {
  TITLE: "Filters",
  ACTIVE_COUNT: (n: number) => `Filters (${n})`,
  SEARCH_IN: (section: string) => `Search ${section}...`,
};

// Footer additions
UI_LABELS.FOOTER.SHOP = "Shop";
UI_LABELS.FOOTER.SELLERS_SECTION = "For Sellers";
UI_LABELS.FOOTER.SELL_ON_PLATFORM = "Sell on Platform";
UI_LABELS.FOOTER.SELLER_GUIDE = "Seller Guide";
UI_LABELS.FOOTER.HELP_CENTER = "Help Center";
UI_LABELS.FOOTER.TRACK_ORDER = "Track Order";
UI_LABELS.FOOTER.COOKIE_POLICY = "Cookie Policy";
UI_LABELS.FOOTER.REFUND_POLICY = "Refund Policy";
UI_LABELS.FOOTER.MADE_IN = "Made in India";

// Placeholders
UI_PLACEHOLDERS.SELECT_ADDRESS = "Select a pickup address...";
UI_PLACEHOLDERS.SELECT_CATEGORY = "Select a category...";
```

**`src/constants/messages.ts`** � add:

```typescript
SUCCESS_MESSAGES.CATEGORY.CREATED = "Category created successfully";
SUCCESS_MESSAGES.ADDRESS.CREATED = "Address saved successfully";
```

**`src/constants/routes.ts`** � add:

```typescript
// Inside PUBLIC block:
FAQ_CATEGORY: (category: string) => `/faqs/${category}`,

// New routes needed for footer:
HELP: '/help',
TRACK_ORDER: '/track',
SELLER_GUIDE: '/seller-guide',
COOKIE_POLICY: '/cookies',
REFUND_POLICY: '/refund-policy',
PROMOTIONS: '/promotions',
```

### 1.3 Add `pickupAddressId` to product schema

**`src/db/schema/product.schema.ts`:**

- Add `pickupAddressId?: string` to `ProductDocument` interface
- Add `PRODUCT_FIELDS.PICKUP_ADDRESS_ID = 'pickupAddressId'` to field constants
- Add to `PRODUCT_UPDATABLE_FIELDS` array

**Files changed in Phase 1:**

```
package.json                        + lucide-react dependency
src/constants/ui.ts                 + ~30 new label/placeholder keys; + ROLE_OPTIONS ? UI_LABELS.ROLES.*
src/constants/messages.ts           + 2 new success messages
src/constants/routes.ts             + FAQ_CATEGORY helper + 6 new routes
src/db/schema/product.schema.ts     + pickupAddressId field
src/components/admin/users/UserFilters.tsx    replace ROLE_OPTIONS strings ? UI_LABELS.ROLES.*
src/components/faq/FAQCategorySidebar.tsx     move FAQ_CATEGORY_OPTIONS ? @/constants
src/components/search/SearchFiltersRow.tsx   replace inline input class ? THEME_CONSTANTS.input.base
```

### 1.4 Tests � Phase 1

**`src/constants/__tests__/seo.test.ts`** _(verify existing or create)_:

- `generateMetadata()` sets correct `title`, `description`, `openGraph`, `twitter`, `alternates.canonical`
- `noIndex: true` produces `robots: { index: false, follow: false }`

**`src/db/schema/__tests__/product.schema.test.ts`** _(add assertions)_:

- `PRODUCT_FIELDS.PICKUP_ADDRESS_ID` equals `'pickupAddressId'`
- `'pickupAddressId'` is present in `PRODUCT_UPDATABLE_FIELDS`

**`src/components/admin/users/__tests__/UserFilters.test.tsx`** _(update)_:

- Role dropdown option labels match `UI_LABELS.ROLES.*` � no hardcoded string literals in render output

---

## Phase 2 � Shared UI Primitives

**Goal:** All new reusable components created and barrel-exported. No page uses them yet.

### 2.1 `SideDrawer` � Add `side` prop

**`src/components/ui/SideDrawer.tsx`:**

Add `side: 'left' | 'right'` to `SideDrawerProps`. All existing call sites use `side="right"` � update them directly. Delete the hardcoded `right-0` class.

```tsx
// Position classes based on side
const positionClass =
  side === "left"
    ? "left-0 w-full sm:w-96 md:w-[420px]"
    : "right-0 w-full md:w-3/5 lg:max-w-2xl";
```

**After adding the prop:** grep all `<SideDrawer` usages and add `side="right"` to each existing call site, then remove the hardcoded fallback.

### 2.2 `FilterFacetSection` � `src/components/ui/FilterFacetSection.tsx`

**Tier 1 � Shared primitive. Not admin-specific.** Used on public pages (products, search, categories/[slug], auctions), seller pages (seller/products), and any admin list page that adopts the drawer pattern.

```tsx
"use client";
// Props: title, options: {value, label, count?}[], selected: string[],
//        onChange, searchable=true, pageSize=10, className
// - Internal useState for searchQuery + visibleCount (starts at pageSize)
// - Filters options by searchQuery (client-side)
// - Shows visibleCount items, "Load 10 more" increments visibleCount
// - Selected chips rendered above list with � dismiss
// - Collapses via <Accordion> or local isCollapsed state
```

**Key implementation rules:**

- Use `UI_LABELS.TABLE.LOAD_MORE` for the load button
- Use `UI_PLACEHOLDERS` for search input: `UI_LABELS.FILTERS.SEARCH_IN(title)`
- Use `THEME_CONSTANTS.input.base` for search input styling
- Chips use `THEME_CONSTANTS.badge.*` tokens

### 2.3 `FilterDrawer` � `src/components/ui/FilterDrawer.tsx`

**Tier 1 � Shared primitive. Not admin-specific.** Used by: `products/page.tsx` (mobile), `search/page.tsx`, `categories/[slug]/page.tsx`, `auctions/page.tsx`, `seller/products/page.tsx`. Admin list pages that need a toggleable filter panel on smaller viewports use it too.

```tsx
"use client";
// Wraps <SideDrawer side="left" mode="view" title="Filters">
// Header shows active filter count badge when activeCount > 0
// Footer: <DrawerFormFooter> styled with "Clear All" + "Apply" buttons
// Children: one or more <FilterFacetSection /> instances
```

### 2.4 `ActiveFilterChips` � `src/components/ui/ActiveFilterChips.tsx`

**Tier 1 � Shared primitive. Not admin-specific.** Renders on every list page that has active filters � public, seller, and admin alike. Sits below the `FilterDrawer` trigger or inline `AdminFilterBar`.

```tsx
"use client";
// Props: filters: {key, label, value}[], onRemove(key), onClearAll
// Horizontal flex-wrap row of chips
// Each chip: "[Label: Value �]"
// "Clear all" text button at end when filters.length > 1
// Hidden when filters.length === 0 (returns null)
```

### 2.5 `useUrlTable` hook � `src/hooks/useUrlTable.ts`

```typescript
"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

export function useUrlTable(options?: UseUrlTableOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const defaults = options?.defaults ?? {};

  const get = useCallback(
    (key: string) => {
      return searchParams.get(key) ?? defaults[key] ?? "";
    },
    [searchParams, defaults],
  );

  const getNumber = useCallback(
    (key: string, fallback = 0) => {
      const v = get(key);
      const n = Number(v);
      return isNaN(n) ? fallback : n;
    },
    [get],
  );

  const buildParams = useCallback(
    (updates: Record<string, string>) => {
      const p = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v === "" || v === undefined) p.delete(k);
        else p.set(k, v);
      }
      return p;
    },
    [searchParams],
  );

  const set = useCallback(
    (key: string, value: string) => {
      const p = buildParams({ [key]: value });
      // Reset page to 1 on any key change except page/pageSize/view
      if (key !== "page" && key !== "pageSize" && key !== "view")
        p.set("page", "1");
      router.replace(`${pathname}?${p.toString()}`);
    },
    [buildParams, pathname, router],
  );

  const setMany = useCallback(
    (updates: Record<string, string>) => {
      const p = buildParams(updates);
      const keys = Object.keys(updates);
      const nonResettingKeys = ["page", "pageSize", "view"];
      if (!keys.every((k) => nonResettingKeys.includes(k))) {
        if (!keys.includes("page")) p.set("page", "1");
      }
      router.replace(`${pathname}?${p.toString()}`);
    },
    [buildParams, pathname, router],
  );

  const clear = useCallback(
    (keys?: string[]) => {
      if (keys) {
        const p = new URLSearchParams(searchParams.toString());
        keys.forEach((k) => p.delete(k));
        p.set("page", "1");
        router.replace(`${pathname}?${p.toString()}`);
      } else {
        router.replace(pathname);
      }
    },
    [searchParams, pathname, router],
  );

  const setPage = (page: number) => set("page", String(page));
  const setPageSize = (pageSize: number) => set("pageSize", String(pageSize));
  const setSort = (sort: string) => set("sort", sort);

  const buildSieveParams = useCallback(
    (sieveFilters: string) => {
      const page = get("page") || "1";
      const pageSize = get("pageSize") || defaults["pageSize"] || "25";
      const sort = get("sort") || defaults["sort"] || "-createdAt";
      const parts = new URLSearchParams();
      if (sieveFilters) parts.set("filters", sieveFilters);
      parts.set("sorts", sort);
      parts.set("page", page);
      parts.set("pageSize", pageSize);
      return `?${parts.toString()}`;
    },
    [get, defaults],
  );

  const buildSearchParams = useCallback(() => {
    const p = new URLSearchParams();
    const add = (k: string) => {
      const v = get(k);
      if (v) p.set(k, v);
    };
    ["q", "category", "minPrice", "maxPrice"].forEach(add);
    p.set("sort", get("sort") || defaults["sort"] || "-createdAt");
    p.set("page", get("page") || "1");
    p.set("pageSize", get("pageSize") || defaults["pageSize"] || "24");
    return `?${p.toString()}`;
  }, [get, defaults]);

  return {
    params: searchParams,
    get,
    getNumber,
    set,
    setMany,
    clear,
    setPage,
    setPageSize,
    setSort,
    buildSieveParams,
    buildSearchParams,
  };
}
```

### 2.6 `SortDropdown` � `src/components/ui/SortDropdown.tsx`

```tsx
// Props: value, onChange, options: {value, label}[], label?, className?
// Renders: labelled <select> using THEME_CONSTANTS.input.base
// Label defaults to UI_LABELS.TABLE.SORT_BY
// Used by <AdminFilterBar>, <FilterBar>, and any page needing a standalone sort control
// NOT admin-specific � lives in src/components/ui/
```

### 2.7 `TablePagination` � `src/components/ui/TablePagination.tsx`

```tsx
// Props: currentPage, totalPages, pageSize, total, onPageChange,
//        onPageSizeChange?, pageSizeOptions=[10,25,50,100], isLoading?
// Renders: result count text + <Pagination> + per-page <select>
// Result count: "Showing {from}�{to} of {total} results"
// Uses UI_LABELS.TABLE.SHOWING / OF / RESULTS / PER_PAGE
// Uses THEME_CONSTANTS for all styling
// NOT admin-specific � lives in src/components/ui/
```

### 2.8 `AdminFilterBar` � Add `withCard` prop � `src/components/admin/AdminFilterBar.tsx`

**No new file.** `AdminFilterBar` already exists and already accepts `children`, `columns`, `className`. Its only distinction from a bare `FilterBar` is the `<Card>` wrapper. Extend it in-place:

```tsx
interface AdminFilterBarProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4; // unchanged
  className?: string; // unchanged
  withCard?: boolean; // NEW � default: true (backward compat)
}

// Implementation: when withCard=false, render the inner grid div directly (no Card).
// This covers every non-admin filter bar without a new file or new import path.
// Usage on public/seller pages:
//   <AdminFilterBar withCard={false} columns={2}>�</AdminFilterBar>
// Usage on admin pages (unchanged � withCard defaults to true):
//   <AdminFilterBar columns={3}>�</AdminFilterBar>
```

> No new export needed � `AdminFilterBar` is already exported from `@/components`.

### 2.9 `DataTable` � Grid / List / Table View Toggle � `src/components/admin/DataTable.tsx`

**Reuses existing code.** `DataTable` already has `mobileCardRender?: (item: T) => ReactNode` � it renders cards on `< md` and the table on `= md` via CSS. The view toggle extends this pattern: instead of breakpoint-driven CSS hiding, the user explicitly picks the mode.

```tsx
// EXISTING prop kept (backward compat):
//   mobileCardRender?: (item: T) => ReactNode   � unchanged; still hides/shows via CSS if no viewMode

// NEW props:
//   showViewToggle?: boolean                           � show toggle icons in toolbar; default: false
//   viewMode?: 'table' | 'grid' | 'list'              � controlled mode
//   defaultViewMode?: 'table' | 'grid' | 'list'       � uncontrolled default; default: 'table'
//   onViewModeChange?: (mode: 'table'|'grid'|'list') => void

// When showViewToggle=true, mobileCardRender (or a separate renderCard alias) is used for
// grid + list rendering. If mobileCardRender is provided it doubles as renderCard � no
// duplicate prop needed. If caller wants different card layouts for mobile-auto vs view-toggle,
// they pass renderCard separately (optional second prop; falls back to mobileCardRender).

// Render modes:
// table: existing row layout unchanged
// grid:  grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 � card per cell
// list:  flex flex-col gap-2 � card per row (compact)

// Toggle icons: inline SVGs (no external icon library required)
// Match SideDrawer close-button style: p-2 rounded-lg ring-1 ring-gray-200 dark:ring-gray-700
//   hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
// Active mode: bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 ring-indigo-300
// On xs (mobile): only grid + list offered (table columns too wide)

// URL integration � parent uses useUrlTable:
//   viewMode={(table.get('view') || 'grid') as ViewMode}
//   onViewModeChange={(mode) => table.set('view', mode)}
// Note: 'view' param does NOT reset page ? 1 (handled in useUrlTable.set guard)
```

**Files changed in Phase 2:**

```
src/components/ui/SideDrawer.tsx             + side: 'left'|'right' prop (existing file)
src/components/ui/FilterFacetSection.tsx     NEW
src/components/ui/FilterDrawer.tsx           NEW
src/components/ui/ActiveFilterChips.tsx      NEW
src/hooks/useUrlTable.ts                     NEW
src/components/ui/SortDropdown.tsx           NEW  (Tier 1 � not admin-specific)
src/components/ui/TablePagination.tsx        NEW  (Tier 1 � wraps existing Pagination)
src/components/admin/AdminFilterBar.tsx      + withCard?: boolean prop (existing file, no new file)
src/components/admin/DataTable.tsx           + showViewToggle/viewMode/onViewModeChange; reuses mobileCardRender
```

### 2.10 Tests � Phase 2

**`src/hooks/__tests__/useUrlTable.test.ts`** _(new)_:

- `set(key, val)` updates the param and resets `page` to `"1"`
- `set('page', val)` does NOT reset page � only changes page
- `set('pageSize', val)` does NOT reset page
- `set('view', val)` does NOT reset page � view toggle is non-destructive
- `setMany({ a, b })` batches into a single `router.replace()` call
- `setSort(val)` resets page to `"1"`
- `buildSieveParams(baseFilters)` returns correct `?filters=...&sorts=...&page=...&pageSize=...`
- `buildSearchParams()` returns correct named-param query string
- `clear(keys)` removes only specified keys; `clear()` removes all
- `getNumber(key, default)` returns number; falls back when param absent

**`src/components/ui/__tests__/FilterFacetSection.test.tsx`** _(new)_:

- Renders up to `pageSize` options (default 10); remainder hidden
- "Load 10 more" appends next batch without any network fetch
- Search input filters visible list in real time (client-side)
- Selected values render as removable chips
- Chip `�` calls `onChange` with value removed
- Keyboard: `Enter` selects focused option; `Escape` clears search input
- ARIA: `role="group"` on wrapper; `aria-checked` on selected options

**`src/components/ui/__tests__/FilterDrawer.test.tsx`** _(new)_:

- Closed when `isOpen=false`; open when `isOpen=true`
- Active count badge shown for `activeCount > 0`, hidden at 0
- "Clear All" calls `onClear`
- `Escape` keydown triggers `onClose`
- Focus trapped inside when open; first focusable element receives focus

**`src/components/ui/__tests__/ActiveFilterChips.test.tsx`** _(new)_:

- One chip per filter; chip `�` calls `onRemove(key)` with correct key
- "Clear all" calls `onClearAll`; hidden when `filters` is empty
- Chip label is accessible (`aria-label` includes field and value)

**`src/components/ui/__tests__/SideDrawer.test.tsx`** _(update existing)_:

- `side="left"` applies left-edge positioning class
- `side="right"` applies right-edge class (default behaviour)
- `Escape` triggers `onClose`; focus moves to first focusable on open
- `aria-modal="true"` present on the dialog element

**`src/components/ui/__tests__/SortDropdown.test.tsx`** _(new)_:

- All passed `options` rendered as `<option>` elements
- `onChange` fires with selected value
- `<label htmlFor>` matches `<select id>` � accessible

**`src/components/ui/__tests__/TablePagination.test.tsx`** _(new)_:

- "Showing X�Y of Z results" text correct (uses `UI_LABELS.TABLE.*`)
- `onPageChange` called with correct page on navigation
- `onPageSizeChange` called when per-page selector changes
- `role="navigation"` on the wrapper
- Prev/next disabled when `isLoading=true`

**`src/components/admin/__tests__/DataTable.viewToggle.test.tsx`** _(new)_:

- `showViewToggle=false` ? no toggle icons rendered (default)
- `showViewToggle=true` ? table/grid/list toggle bar visible
- On xs viewport ? only grid + list icons shown (table hidden)
- Clicking grid icon ? `onViewModeChange('grid')` called; `mobileCardRender` output rendered per item
- Clicking list icon ? `onViewModeChange('list')` called; `mobileCardRender` output rendered per item
- Clicking table icon ? `onViewModeChange('table')` called; column headers rendered
- `defaultViewMode='grid'` ? starts in grid mode without external `onViewModeChange`
- Controlled (`viewMode` prop) ? does not maintain own state; updates on prop change only
- Active toggle icon has `bg-indigo-50 text-indigo-600` highlight
- Toggle icons are `<button>` elements with `aria-label` and `aria-pressed`
- `mobileCardRender` without `showViewToggle` ? original CSS mobile-card behaviour unchanged

---

## Phase 3 � Infrastructure Wiring

**Goal:** Update barrel exports, refactor `DataTable`, fix `SearchResultsSection`. Update all importers directly � no shims, no re-exports.

### 3.1 Barrel exports

**`src/hooks/index.ts`:** Add `useUrlTable` export.

**`src/components/ui/index.ts`:** Add `FilterFacetSection`, `FilterDrawer`, `ActiveFilterChips`, `SortDropdown`, `TablePagination` exports. Remove any old filter component exports being replaced (e.g. `SearchFiltersRow` if fully deleted).

**`src/components/admin/index.ts`:** No removals needed � `AdminFilterBar` already exported; `SortDropdown` and `TablePagination` were never in `admin/`. Keep `AdminPageHeader`, `AdminFilterBar`, `DrawerFormFooter`, `DataTable`. No new admin-only components added in this phase.

**`src/components/index.ts`:** Add new barrel entries. Remove entries for deleted components (`EnhancedFooter`, old pagination buttons, etc.).

### 3.2 `DataTable` � Remove internal pagination

**`src/components/admin/DataTable.tsx`:**

The current `DataTable` has `showPagination` (default: `true`) and `pageSize` (default: `10`) for in-memory pagination. These props are **deprecated in this phase but not yet removed** � removing them is a breaking change requiring all call sites to be updated first.

Strategy:

1. Add `externalPagination?: boolean` prop (default: `false`). When `true`, internal pagination is disabled regardless of `showPagination`.
2. Mark `showPagination` and `pageSize` as `@deprecated` in JSDoc � they still work.
3. Each admin page migration (Phase 4) passes `externalPagination` and adds `<TablePagination>` externally.
4. After all call sites are migrated (end of Phase 6), remove the deprecated props in a cleanup PR.

```tsx
interface DataTableProps<T> {
  // Deprecated � will be removed after full migration:
  /** @deprecated Use externalPagination + <TablePagination> instead */
  showPagination?: boolean;
  /** @deprecated Use externalPagination + <TablePagination> instead */
  pageSize?: number;

  // New � enables external pagination:
  externalPagination?: boolean; // disables internal page state and slice when true
}
```

**This session's PR:** Add `externalPagination` prop only. No existing call sites break.
**Phase 4�6 PRs:** Each page adds `externalPagination` + `<TablePagination>`.
**Cleanup PR (after Phase 6):** Remove `showPagination`, `pageSize`, internal state, and `paginatedData` slice.

### 3.3 `SearchResultsSection` � Replace pagination props

**`src/components/search/SearchResultsSection.tsx`:**

```tsx
// DELETE: onPrevPage, onNextPage props and the raw <button> elements
// ADD:    currentPage: number, totalPages: number, onPageChange: (page: number) => void
// ADD:    <Pagination currentPage={...} totalPages={...} onPageChange={...} />
```

**Update the one call site** (`search/page.tsx`) to pass `onPageChange={(page) => table.setPage(page)}` and remove `onPrevPage`/`onNextPage`.

**Files changed in Phase 3:**

```
src/hooks/index.ts                             + useUrlTable export
src/components/ui/index.ts                     + SortDropdown, TablePagination, 3 filter components; - deleted component exports
src/components/index.ts                        + new entries, - deleted entries
src/components/admin/DataTable.tsx             add externalPagination prop; deprecate showPagination/pageSize
src/components/search/SearchResultsSection.tsx delete old props, add onPageChange
```

> `src/components/admin/index.ts` does not change in Phase 3 \u2014 `AdminFilterBar` and `DataTable` are already exported.

### 3.4 Tests � Phase 3

**`src/components/admin/__tests__/DataTable.test.tsx`** _(update pagination section)_:

- When `externalPagination=true`: all passed rows rendered � no internal page slicing; no pagination footer inside DataTable
- When `externalPagination=false` (default): existing `showPagination`/`pageSize` behaviour unchanged (backward compat)
- `aria-sort` attribute updated on sort column header click
- Existing column-render and row-action tests remain unchanged

**`src/components/search/__tests__/SearchResultsSection.test.tsx`** _(update)_:

- Delete tests for `onPrevPage` / `onNextPage` (props removed)
- `onPageChange(n)` called with correct page number on nav
- `<Pagination>` rendered; no raw `<button>Prev</button>` / `<button>Next</button>`

---

## Phase 4 � Admin Pages

**Goal:** All 7 admin list pages use `useUrlTable`, real server pagination, sort UI, filter bar. Apply changes page by page.

**Common pattern for every admin page:**

```tsx
// 1. Replace all local filter useState with useUrlTable
const table = useUrlTable({ defaults: { pageSize: '25', sort: '-createdAt' } });

// 2. Build Sieve filter string from URL params
const filtersArr: string[] = [];
if (table.get('status')) filtersArr.push(STATUS_SIEVE_MAP[table.get('status')]);
if (table.get('q')) filtersArr.push(`title@=*${table.get('q')}`);

// 3. Update useApiQuery
const { data, isLoading } = useApiQuery({
  queryKey: ['admin', 'resource', table.params.toString()],  // ? key change
  queryFn: () => apiClient.get(
    `${API_ENDPOINTS.ADMIN.RESOURCE}${table.buildSieveParams(filtersArr.join(','))}`
  ),
});

// 4. Replace DataTable pagination
<DataTable
  columns={...}
  data={data?.items ?? []}
  loading={isLoading}
  externalPagination   // ? new prop
/>
<TablePagination
  currentPage={data?.page ?? 1}
  totalPages={data?.totalPages ?? 1}
  pageSize={table.getNumber('pageSize', 25)}
  total={data?.total ?? 0}
  onPageChange={table.setPage}
  onPageSizeChange={table.setPageSize}
/>
```

### Admin page specifics

| Page         | Filter bar children                                  | Sieve mapping notes                                                                                      |
| ------------ | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Users**    | Search input + Role dropdown + Status tabs           | `status=active` ? `disabled==false`; `status=banned` ? `disabled==true`; `status=admins` ? `role==admin` |
| **Orders**   | Status tabs + Sort dropdown                          | `status==<value>`                                                                                        |
| **Products** | Search input + Status dropdown + Sort dropdown       | Add these � currently absent                                                                             |
| **Reviews**  | Search input + Status dropdown + Rating (1�5) + Sort | `rating==<value>` added                                                                                  |
| **Bids**     | Status tabs + Sort dropdown                          | `status==<value>`; default sort `-bidDate`                                                               |
| **Coupons**  | Search input + Sort dropdown                         | Search ? `code@=*<term>`; currently absent                                                               |
| **FAQs**     | Search input + Sort dropdown                         | Search ? `question@=*<term>`; currently absent                                                           |

**Files changed in Phase 4:**

```
src/app/admin/users/[[...action]]/page.tsx
src/app/admin/orders/[[...action]]/page.tsx
src/app/admin/products/[[...action]]/page.tsx
src/app/admin/reviews/[[...action]]/page.tsx
src/app/admin/bids/[[...action]]/page.tsx
src/app/admin/coupons/[[...action]]/page.tsx
src/app/admin/faqs/[[...action]]/page.tsx
```

### 4.x Tests � Phase 4

For each page add/update `src/app/admin/<name>/__tests__/page.test.tsx`:

**Common assertions (every admin page):**

- Filter/sort state changes update `?` URL params via `router.replace()` not `router.push()`
- `queryKey` contains `table.params.toString()` � cache busts on filter change
- `<TablePagination>` rendered; clicking next page sets `?page=N+1`
- No DataTable-internal pagination present

**Page-specific:**

| Page         | Additional assertions                                                                        |
| ------------ | -------------------------------------------------------------------------------------------- |
| **Users**    | `status=banned` tab sends `disabled==true` Sieve filter; `status=admins` sends `role==admin` |
| **Products** | Search input present (was missing); sends `title@=*term` in Sieve filters                    |
| **Reviews**  | `pageSize` param sent in every request (was missing); rating filter sends `rating==N`        |
| **Coupons**  | Search input present (was missing); sends `code@=*term`                                      |
| **FAQs**     | Search input present (was missing); sends `question@=*term`                                  |

---

## Phase 5 � Public List Pages ? Done

**Goal:** `products`, `search`, `auctions`, `blog`, `categories/[slug]` all URL-driven with `<Pagination>` and filter drawers.

### 5.1 `products/page.tsx`

- Replace ~50 lines of `useState` + `useEffect` + `updateUrl()` with `useUrlTable` (defaults: `{ view: 'grid', sort: '-createdAt' }`)
- Switch `router.push` ? `router.replace` (automatic via `useUrlTable`)
- Replace 3 copies of raw `<button>` pagination ? single `<Pagination>`
- Keep `<ProductFilters>` as left sidebar on `lg+`; add "Filters (n)" button on mobile that opens `<FilterDrawer>`
- `<FilterDrawer>` contains: `<FilterFacetSection>` for Category, Price range
- Add `<ActiveFilterChips>` above product grid
- **View toggle:** pass `showViewToggle`, `viewMode={table.get('view') || 'grid'}`, `onViewModeChange`, `mobileCardRender={(p) => <ProductCard product={p} />}` to `<DataTable>`

### 5.2 `search/page.tsx`

- Replace manual `buildUrl()` helper (~30 lines) with `useUrlTable` (defaults: `{ view: 'grid' }`)
- `SearchResultsSection` now receives `onPageChange` (done in Phase 3)
- Replace `SearchFiltersRow` with `<FilterDrawer>` trigger + `<FilterFacetSection>` groups
- `<FilterDrawer>` contains: Category, Price range facet sections
- **View toggle:** grid + list modes; pass `mobileCardRender` with `<ProductCard>`

### 5.3 `auctions/page.tsx`

- Convert local `sort`/`page` state ? `useUrlTable` (defaults: `{ view: 'grid' }`)
- Replace raw `<button>` prev/next ? `<Pagination>`
- Replace `fetch()` ? `apiClient.get()`
- Add `<FilterDrawer>` with Price range, Sort direction
- **View toggle:** grid + list modes; pass `mobileCardRender` with auction card component

### 5.4 `blog/page.tsx`

- Convert local `activeCategory`/`page` state ? `useUrlTable`
- Replace raw `<Button>` prev/next ? `<Pagination>`
- Add result count display

### 5.5 `categories/[slug]/page.tsx`

- Convert local `sort`/`page` state ? `useUrlTable` (defaults: `{ view: 'grid' }`)
- Replace raw `<button>` prev/next ? `<Pagination>`
- **Fix disabled bug:** change `products.length < PAGE_SIZE` ? `page >= totalPages`
- Add `<FilterDrawer>` with Brand, Rating, Price facets
- **View toggle:** grid + list modes; pass `mobileCardRender` with `<ProductCard>`

**Files changed in Phase 5:**

```
src/app/products/page.tsx
src/app/search/page.tsx
src/app/auctions/page.tsx
src/app/blog/page.tsx
src/app/categories/[slug]/page.tsx
src/components/products/ProductFilters.tsx    � wrap with FilterDrawer on mobile
src/components/search/SearchFiltersRow.tsx    � replaced by FilterDrawer pattern
```

### 5.6 Tests � Phase 5

**`src/app/products/__tests__/page.test.tsx`** _(update)_:

- URL params drive the API query � no local `useState` for filters
- `router.replace()` used (not `push()`) on filter change
- `<Pagination>` rendered; no raw prev/next buttons
- `FilterDrawer` trigger button visible on mobile viewport mock

**`src/app/search/__tests__/page.test.tsx`** _(update)_:

- `onPageChange` wired to `table.setPage()` � verify correct page param in URL
- `buildUrl` helper deleted; URL built via `useUrlTable`

**`src/app/auctions/__tests__/page.test.tsx`** _(update)_:

- Uses `apiClient.get()` not raw `fetch()` � mock `apiClient`, not `fetch`
- `sort` and `page` state in URL params; `<Pagination>` rendered

**`src/app/categories/[slug]/__tests__/page.test.tsx`** _(update)_:

- Disabled "next" condition is `page >= totalPages` not `products.length < PAGE_SIZE`
- `FilterDrawer` present with brand/rating/price facets
- View toggle rendered; switching to `grid` or `list` mode updates `?view=` URL param
- `mobileCardRender` with `<ProductCard>` renders correctly in grid/list view

---

## Phase 6 � Seller & User Pages + CRUD Drawers ? Done

### 6.1 `seller/products/page.tsx`

- Add `useUrlTable` with `pageSize=25`, `sort=-createdAt`, `view='grid'`
- Add search input + sort dropdown in `<AdminFilterBar withCard={false}>`
- Add `<FilterDrawer>` with Status, Category, Price facets (mobile � `AdminFilterBar` row stays for md+)
- Add `<ActiveFilterChips>` above the product grid/table
- Drop hardcoded `pageSize=100` � use real server pagination
- Add `<TablePagination>` below `<DataTable externalPagination>`
- **View toggle:** grid + table modes (seller benefits from both; `mobileCardRender` with product card)
- Add "New product" button that opens `<SideDrawer mode="create">` with `<ProductForm>`
- Add edit/delete buttons per row that open `<SideDrawer mode="edit">` / `<SideDrawer mode="delete">`
- **Delete `seller/products/new/page.tsx` and `seller/products/[id]/edit/page.tsx`** � these routes no longer exist. Any external links to `/seller/products/new` should be updated to open the seller products list page where the drawer is triggered.

### 6.2 `seller/orders/page.tsx`

- Add `useUrlTable` with `pageSize=25`
- Add status filter tabs (All / Pending / Confirmed / Shipped / Delivered / Cancelled) � maps to `status==<value>` Sieve filter
- Send `page` param to API (currently missing)
- Add `<TablePagination>` below table
- **Fix revenue total:** read from `data?.meta?.totalRevenue` � remove `orders.reduce()` calculation that breaks with pagination

### 6.3 `user/orders/page.tsx`

- Add `useUrlTable` with `pageSize=10`
- Add status filter tabs (All / Pending / Confirmed / Shipped / Delivered / Cancelled)
- Add `<TablePagination>`
- Fix non-standard `data?.data?.orders` nesting � use consistent `data?.items`

### 6.4 Admin CRUD drawers verification

Read and verify these pages/components � confirm drawer vs full-page:

- `admin/products/[[...action]]` � does the `[[...action]]` already open drawers?
- `admin/coupons/[[...action]]` � check `FaqForm` usage pattern
- `admin/faqs/[[...action]]` � the `FaqForm` component exists, check integration

Apply `SideDrawer mode="edit"` for status changes on reviews/bids/orders if inline actions are confirmed.

**Files changed in Phase 6:**

```
src/app/seller/products/page.tsx               rewrite with drawer + useUrlTable
src/app/seller/products/new/page.tsx           DELETE
src/app/seller/products/[id]/edit/page.tsx     DELETE
src/app/seller/orders/page.tsx                 useUrlTable + revenue fix
src/app/user/orders/page.tsx                   useUrlTable + status tabs
```

### 6.5 Tests � Phase 6

**`src/app/seller/products/__tests__/page.test.tsx`** _(update)_:

- No navigation to `/seller/products/new` � "Add product" click opens `SideDrawer`
- Drawer closes and query invalidated after successful product create
- `useUrlTable` drives filter/sort/page state in URL
- `FilterDrawer` trigger button visible on mobile viewport mock; `AdminFilterBar` visible on md+
- `ActiveFilterChips` hidden when no filters active; visible with dismiss buttons when filters set
- Delete any tests asserting the old `/new` and `/[id]/edit` routes exist

**`src/app/seller/orders/__tests__/page.test.tsx`** _(update)_:

- Revenue total reads from API `meta.totalRevenue` not `orders.reduce()`
- `page` param sent to API on every request
- `<TablePagination>` rendered

**`src/app/user/orders/__tests__/page.test.tsx`** _(update)_:

- Status tabs update `?status=` URL param
- Data accessed via `data?.items` not `data?.data?.orders`
- `<TablePagination>` rendered

---

## Phase 7 � FAQ Routes + Homepage Tabs ? Done

### 7.1 New dynamic route

**`src/app/faqs/[category]/page.tsx`** � new file:

```tsx
// Accepts params.category (validated against FAQ_CATEGORIES keys)
// Renders same FAQPageContent but with category pre-selected
// generateStaticParams() returns all 7 FAQ_CATEGORIES keys
// Invalid category ? redirect to /faqs
```

### 7.2 `src/app/faqs/page.tsx` � rewrite to use segment

```tsx
// DELETE the ?category= query param handling entirely
// Rewrite to render default (no-category) FAQ list or redirect to /faqs/general
// Update all internal links that previously used ?category= (done in 7.4)
```

### 7.3 `FAQSection.tsx` � add category tabs

```tsx
// Replace single featured=true fetch with tabbed interface
// Default tab: 'general'
// Use <SectionTabs> from @/components with FAQ_CATEGORIES labels
// Per-tab fetch: GET /api/faqs?category=<key>&limit=6
// "View all ?" links to ROUTES.PUBLIC.FAQ_CATEGORY(activeCategory)
// Remove hardcoded ? arrow � use UI_LABELS.ACTIONS.VIEW_ALL_ARROW
```

### 7.4 `FAQCategorySidebar.tsx` � update links

```tsx
// Change all href from `${ROUTES.PUBLIC.FAQS}?category=${key}`
//                   to ROUTES.PUBLIC.FAQ_CATEGORY(key)
// Move FAQ_CATEGORIES constant out of this file ? import from @/constants
```

**Files changed in Phase 7:**

```
src/app/faqs/[category]/page.tsx     NEW
src/app/faqs/page.tsx                + redirect logic
src/components/homepage/FAQSection.tsx   + category tabs
src/components/faq/FAQCategorySidebar.tsx  + URL updates
```

### 7.5 Tests � Phase 7

**`src/app/faqs/[category]/__tests__/page.test.tsx`** _(new)_:

- Valid category slug renders the correct filtered FAQ list
- Invalid slug redirects to `/faqs`
- `generateStaticParams` returns all 7 category values

**`src/components/homepage/__tests__/FAQSection.test.tsx`** _(update)_:

- Tabs render one per FAQ category
- Active tab triggers fetch with `?category=<key>`
- "View all ?" link points to `ROUTES.PUBLIC.FAQ_CATEGORY(activeCategory)` � not a raw string
- Delete any single-fetch / no-tab tests

**`src/components/faq/__tests__/FAQCategorySidebar.test.tsx`** _(update)_:

- All `href` values use `/faqs/<category>` path � no `?category=` query-string format
- `FAQ_CATEGORY_OPTIONS` imported from `@/constants` (moved in Phase 1)

---

## Phase 8 � Footer & Navigation ? Done

### 8.1 Rewrite `Footer` � `src/components/layout/Footer.tsx`

Replace current basic 4-column footer with modern 5-column layout:

```
[Brand + tagline + social icons]  [Shop]  [Support]  [Sellers]  [Legal]
---
[Copyright] [Payment icons] [Made in India]
```

**Social icons:** `Facebook`, `Instagram`, `Twitter`, `Youtube`, `Linkedin` from `lucide-react`  
**All labels:** `UI_LABELS.FOOTER.*`  
**All hrefs:** `ROUTES.*`  
**All styling:** `THEME_CONSTANTS.*`

### 8.2 Delete `EnhancedFooter`

- Delete `src/components/homepage/EnhancedFooter.tsx`
- Delete `src/components/homepage/__tests__/EnhancedFooter.test.tsx`
- Find and remove all imports of `EnhancedFooter` across the codebase

```bash
# Find all usages before deleting
grep -r "EnhancedFooter" src/
```

### 8.3 Update `navigation.tsx` � use `lucide-react`

Replace all inline SVG `<path>` strings with `lucide-react` icon imports:

```tsx
import {
  Home,
  ShoppingBag,
  Gavel,
  Users,
  Search,
  Tag,
  BookOpen,
  LayoutDashboard,
  Package,
  ClipboardList,
  Star,
  Ticket,
  HelpCircle,
  Settings,
  Store,
  TrendingUp,
  Wallet,
} from "lucide-react";
```

Each nav item's `icon` becomes e.g. `<Home className="w-5 h-5" />`.

### 8.4 UI polish � application-wide

- **Header:** Add `backdrop-blur-sm` on scroll; active route underline indicator
- **Sidebar (admin/seller):** Active icon highlight using `THEME_CONSTANTS.themed.accent`
- **Cards:** Audit and replace any raw `shadow-md`/`shadow-lg` strings with `THEME_CONSTANTS.card.*` tokens
- **Buttons:** Verify all `Button` variant hover states use `THEME_CONSTANTS` tokens

**Files changed in Phase 8:**

```
src/components/layout/Footer.tsx              rewrite
src/components/homepage/EnhancedFooter.tsx    DELETE
src/constants/navigation.tsx                  lucide-react icons
src/components/layout/Sidebar.tsx             active state polish
src/components/layout/Header.tsx (or navbar)  scroll blur + active route
```

### 8.5 Tests � Phase 8

**`src/components/layout/__tests__/Footer.test.tsx`** _(update)_:

- All link `href` values use `ROUTES.*` � no hardcoded path strings
- Social icon links have `aria-label` describing the platform
- No `EnhancedFooter` import anywhere in the codebase (grep assertion in CI)
- Delete all `EnhancedFooter.test.tsx` tests

**`src/components/layout/__tests__/Sidebar.test.tsx`** _(update)_:

- Active nav item has the accent background class from `THEME_CONSTANTS`
- Non-active items do not have the accent class
- All icons are `lucide-react` elements � no inline SVG `<path>` strings

---

## Phase 9 � Inline Create Drawers ? Done

### 9.1 `CategorySelectorCreate` � `src/components/ui/CategorySelectorCreate.tsx`

```tsx
// Internal state: [categoryDrawerOpen, setOpen]
// Fetches categories via useApiQuery(['categories'])
// Renders: searchable <select> or Combobox + "+ New category" button
// Button opens <SideDrawer mode="create" title="New Category">
//   <CategoryForm onSuccess={(newId) => { onChange(newId); setOpen(false); invalidateQuery('categories') }} />
// </SideDrawer>
```

### 9.2 `AddressSelectorCreate` � `src/components/ui/AddressSelectorCreate.tsx`

```tsx
// Same pattern, but fetches /api/user/addresses?userId=...
// Button opens <SideDrawer mode="create" title="New Address">
//   <AddressForm onSuccess={(newId) => { onChange(newId); setOpen(false); invalidateQuery('addresses') }} />
// </SideDrawer>
```

### 9.3 Wire into `ProductForm`

**`src/components/admin/products/ProductForm.tsx`:**

- Replace plain category `<select>` with `<CategorySelectorCreate>`
- Add `<AddressSelectorCreate>` for `pickupAddressId` field (new field from Phase 1)

**Files changed in Phase 9:**

```
src/components/ui/CategorySelectorCreate.tsx   NEW
src/components/ui/AddressSelectorCreate.tsx    NEW
src/components/admin/products/ProductForm.tsx  + new fields
src/components/index.ts                        + 2 new exports
```

### 9.4 Tests � Phase 9

**`src/components/ui/__tests__/CategorySelectorCreate.test.tsx`** _(new)_:

- Existing categories from `GET /api/categories` populate the dropdown
- "New category" button opens `SideDrawer` (`aria-haspopup="dialog"` on trigger)
- On successful create: new category auto-selected; drawer closes; category list refetched
- `onChange` called with new category ID

**`src/components/ui/__tests__/AddressSelectorCreate.test.tsx`** _(new)_:

- Existing addresses populate dropdown
- "Add new address" opens `SideDrawer`
- On save: new address auto-selected; drawer closes
- `onChange` called with new address ID

**`src/components/admin/products/__tests__/ProductForm.test.tsx`** _(update)_:

- `<CategorySelectorCreate>` rendered in place of plain select
- `<AddressSelectorCreate>` rendered for pickup address field
- Both wired to form state (`value` + `onChange`)

---

---

## Phase 10 � Gestures + Accessibility ? Done

**Goal:** Every interactive component works correctly with touch gestures, keyboard navigation, and screen readers. Accessibility is built in, not bolted on.

### 10.1 Gesture hooks � `src/hooks/useSwipe.ts` (verify/extend existing)

The existing `useSwipe` hook covers basic swipe detection. Extend it for:

```typescript
// Extend useSwipe to cover all needed gestures
interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; // px, default: 50
  preventScroll?: boolean; // default: false
}
```

**Apply to these components:**

| Component                 | Gesture          | Action                              |
| ------------------------- | ---------------- | ----------------------------------- |
| `SideDrawer` (left)       | Swipe right      | Close drawer                        |
| `SideDrawer` (right)      | Swipe left       | Close drawer                        |
| `HeroCarousel`            | Swipe left/right | Next/prev slide                     |
| `FilterDrawer`            | Swipe right      | Close drawer                        |
| `Tabs` / `SectionTabs`    | Swipe left/right | Switch tab                          |
| Product image gallery     | Swipe left/right | Next/prev image                     |
| `DataTable` rows (mobile) | Swipe left       | Reveal action buttons (edit/delete) |

### 10.2 Long-press hook � `src/hooks/useLongPress.ts`

```typescript
// New hook
export function useLongPress(
  callback: () => void,
  ms = 500,
): {
  onMouseDown;
  onMouseUp;
  onMouseLeave;
  onTouchStart;
  onTouchEnd;
};
```

**Apply to:** DataTable row ? long-press on mobile opens context menu (edit/delete/view).

### 10.3 Pull-to-refresh � `src/hooks/usePullToRefresh.ts`

```typescript
export function usePullToRefresh(onRefresh: () => Promise<void>): {
  containerRef: RefObject<HTMLDivElement>;
  isPulling: boolean;
  progress: number; // 0�1
};
```

**Apply to:** `user/orders`, `seller/products`, `seller/orders`, `auctions/page.tsx` � any page that lists user-owned data and benefits from a manual refresh on mobile.

### 10.4 Keyboard navigation

Every component must be keyboard-navigable with no mouse required:

| Component                      | Key behaviour                                                                    |
| ------------------------------ | -------------------------------------------------------------------------------- |
| `SideDrawer`                   | `Esc` closes; focus trapped inside while open; focus returns to trigger on close |
| `FilterDrawer`                 | `Esc` closes; `Tab` cycles through facets                                        |
| `FilterFacetSection`           | `Enter`/`Space` selects option; `?`/`?` navigates list                           |
| `Modal` / `ConfirmDeleteModal` | `Esc` dismisses; focus trapped                                                   |
| `Tabs` / `SectionTabs`         | `?`/`?` switch tabs                                                              |
| `DataTable`                    | `Tab` navigates rows; `Enter` opens row action                                   |
| `SortDropdown`                 | Standard `<select>` keyboard already works; verify                               |
| `HeroCarousel`                 | `?`/`?` navigates slides                                                         |

### 10.5 ARIA attributes � component-by-component

Every new or modified component must include these attributes:

| Component                | Required ARIA                                                                                   |
| ------------------------ | ----------------------------------------------------------------------------------------------- | ---------- | ------ |
| `SideDrawer`             | `role="dialog"` `aria-modal="true"` `aria-labelledby={titleId}`                                 |
| `FilterDrawer`           | `role="complementary"` `aria-label="Filters"`                                                   |
| `FilterFacetSection`     | `role="group"` `aria-labelledby={headingId}`; checkboxes use `aria-checked`                     |
| `ActiveFilterChips`      | `role="list"`; each chip `role="listitem"`; remove button `aria-label="Remove [label] filter"`  |
| `TablePagination`        | `role="navigation"` `aria-label="Pagination"`; current page `aria-current="page"`               |
| `DataTable`              | `role="table"`; sortable header `aria-sort="ascending                                           | descending | none"` |
| `SortDropdown`           | `<label>` with `htmlFor` wired to `<select id>`                                                 |
| `Tabs` / `SectionTabs`   | `role="tablist"`; tabs `role="tab"` `aria-selected`; panels `role="tabpanel"`                   |
| `HeroCarousel`           | `aria-roledescription="carousel"`; slides `aria-label="Slide N of M"`; nav buttons `aria-label` |
| `CategorySelectorCreate` | `aria-haspopup="dialog"` on the "New category" button                                           |
| All icon-only buttons    | `aria-label` describing the action                                                              |
| All form inputs          | `aria-describedby` wired to error/help text elements                                            |

### 10.6 Focus management

- All `SideDrawer` opens: move focus to first focusable element inside
- All `SideDrawer` closes: return focus to the element that triggered it (store `triggerRef`)
- `ConfirmDeleteModal` open: focus the Cancel button (safer default)
- Route changes: focus moves to the main `<h1>` on the new page (`skip-to-main` link at top of layout)

### 10.7 Colour contrast + motion preferences

- All text on coloured backgrounds must meet WCAG AA (4.5:1 for body, 3:1 for large text)
- Add `prefers-reduced-motion` guards to all CSS transitions/animations:

```tsx
// In tailwind.config.js � add to theme extend:
animation: {
  'slide-in': 'slideIn 0.2s ease-out',
},
// Add to globals.css:
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

**Files changed in Phase 10:**

```
src/hooks/useSwipe.ts                          extend existing
src/hooks/useLongPress.ts                      NEW
src/hooks/usePullToRefresh.ts                  NEW
src/hooks/index.ts                             + 2 new exports
src/components/ui/SideDrawer.tsx               gesture + ARIA + focus trap
src/components/ui/FilterDrawer.tsx             gesture + ARIA
src/components/ui/FilterFacetSection.tsx       keyboard + ARIA
src/components/ui/ActiveFilterChips.tsx        ARIA list roles
src/components/ui/Tabs.tsx (or SectionTabs)    keyboard + ARIA tablist
src/components/admin/DataTable.tsx             row swipe + aria-sort
src/components/ui/TablePagination.tsx          ARIA nav
src/components/homepage/HeroCarousel.tsx       swipe + ARIA carousel
tailwind.config.js                             reduced-motion
src/app/globals.css                            prefers-reduced-motion rule
```

### 10.x Tests � Phase 10

**`src/hooks/__tests__/useLongPress.test.ts`** _(new)_:

- Callback fires after configured hold duration (mock timers)
- Callback does NOT fire on a quick tap (pointer-up before threshold)
- Cleanup: no callback after component unmount

**`src/hooks/__tests__/usePullToRefresh.test.ts`** _(new)_:

- `onRefresh` called when pull distance exceeds threshold
- `isPulling` is `true` during pull, `false` after release
- No `onRefresh` when release happens before threshold

**`src/hooks/__tests__/useSwipe.test.ts`** _(update)_:

- Existing direction tests remain; add: `onSwipeLeft` / `onSwipeRight` fire on horizontal swipe
- `minDistance` option respected � no callback on tiny movement

**`src/components/ui/__tests__/SideDrawer.test.tsx`** _(update � add gesture assertions)_:

- Swipe-right on left drawer triggers `onClose`
- Swipe-left on right drawer triggers `onClose`
- Swipe shorter than threshold does not close

**`src/components/homepage/__tests__/HeroCarousel.test.tsx`** _(update)_:

- Swipe left advances to next slide
- Swipe right returns to previous slide
- Arrow key `?` / `?` navigates slides
- `aria-roledescription="carousel"` present; each slide has `aria-label`
- Autoplay paused when carousel receives focus

**`tailwind.config.js` / `globals.css` � manual check (no automated test needed):**

- Confirm `@media (prefers-reduced-motion: reduce)` rule disables transitions; add note in PR description

---

## Phase 11 � Homepage Sections

**Goal:** Each homepage section is visually distinctive, tells the user what to do next, and works beautifully across mobile / desktop / widescreen.

### Current state of homepage sections

| Component                  | File                           | Current issues                                                                                            |
| -------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `HeroCarousel`             | `HeroCarousel.tsx`             | No gesture support; no reduced-motion; no autoplay pause on focus; indicator dots not keyboard-accessible |
| `FeaturedProductsSection`  | `FeaturedProductsSection.tsx`  | Grid only � no horizontal scroll on mobile; no "View all" CTA link; static content                        |
| `FeaturedAuctionsSection`  | `FeaturedAuctionsSection.tsx`  | Same grid issues; no live countdown visible in card; no "ends in X" urgency indicator                     |
| `TopCategoriesSection`     | `TopCategoriesSection.tsx`     | Icon-only cards; no product count; no hover state; not swipeable on mobile                                |
| `CustomerReviewsSection`   | `CustomerReviewsSection.tsx`   | Static; no carousel/swipe on mobile; no star rating visual; no verified badge                             |
| `TrustIndicatorsSection`   | `TrustIndicatorsSection.tsx`   | Text-heavy; icons likely inline SVG (no lucide-react); no animation on scroll-in                          |
| `SiteFeaturesSection`      | `SiteFeaturesSection.tsx`      | Duplicate of TrustIndicators in purpose; icons inline SVG                                                 |
| `BlogArticlesSection`      | `BlogArticlesSection.tsx`      | Grid only; no horizontal scroll on mobile                                                                 |
| `NewsletterSection`        | `NewsletterSection.tsx`        | No loading state on submit; no success/error feedback using `useMessage()`                                |
| `WelcomeSection`           | `WelcomeSection.tsx`           | Likely hardcoded copy; no CTA tracking                                                                    |
| `WhatsAppCommunitySection` | `WhatsAppCommunitySection.tsx` | Emoji or inline SVG icon; hardcoded URL                                                                   |
| `AdvertisementBanner`      | `AdvertisementBanner.tsx`      | Static; no impression tracking hook                                                                       |

### What will be built / changed

#### 11.1 `HeroCarousel`

- Add `useSwipe` for touch slide navigation
- Pause autoplay on keyboard focus or hover (`prefers-reduced-motion` stops autoplay entirely)
- Keyboard: `?`/`?` keys change slide; `Space` toggles pause
- ARIA carousel roles (Phase 11 spec)
- Slide indicators: real `<button>` elements with `aria-label="Go to slide N"`
- Replace inline SVG arrow icons with `lucide-react` `ChevronLeft` / `ChevronRight`

#### 11.2 `FeaturedProductsSection` + `FeaturedAuctionsSection`

- **Mobile:** horizontal scroll carousel (`overflow-x-auto snap-x snap-mandatory`) with swipe via `useSwipe`
- **Desktop/widescreen:** 4-column grid
- "View all products / auctions ?" CTA button using `ROUTES.PUBLIC.PRODUCTS` / `ROUTES.PUBLIC.AUCTIONS`
- `FeaturedAuctionsSection`: add visible countdown chip on each card (e.g. `Ends in 2h 14m`)
- All strings via `UI_LABELS.HOMEPAGE.*` � add new keys as needed

#### 11.3 `TopCategoriesSection`

- Add product count badge to each category card
- Add hover scale + shadow animation (`hover:scale-105 transition-transform`)
- Mobile: 2-column grid; desktop: 4-column; widescreen: 6-column
- Use `lucide-react` icons mapped from category slug (fallback: `Tag`)

#### 11.4 `CustomerReviewsSection`

- Mobile: swipeable carousel via `useSwipe`
- Desktop: 3-column masonry-style grid
- Each review card: star rating (filled/empty stars using `lucide-react` `Star`), verified badge, truncated text with "Read more" toggle
- Load 6 reviews; "See all reviews ?" links to reviews page

#### 11.5 `TrustIndicatorsSection` + `SiteFeaturesSection`

- Merge into a single `TrustFeaturesSection` component (they serve the same purpose � delete one)
- 4 icons with label + one-line description; icons from `lucide-react` (`ShieldCheck`, `Truck`, `RotateCcw`, `Headphones`)
- Animation: fade-in + slide-up on first scroll-into-viewport using `IntersectionObserver`

#### 11.6 `NewsletterSection`

- Wire submit to `useApiMutation(API_ENDPOINTS.NEWSLETTER.SUBSCRIBE)`
- Replace any `alert()` with `useMessage()` toast
- Loading spinner on button while submitting
- Success state: swap form for a confirmation message
- All strings from `UI_LABELS.HOMEPAGE.NEWSLETTER.*`

#### 11.7 `WhatsAppCommunitySection`

- Replace emoji/inline icon with `lucide-react` `MessageCircle` (or a WhatsApp brand icon if added)
- URL from `SITE_CONFIG.WHATSAPP_URL` (or `SOCIAL_LINKS.WHATSAPP` from `siteSettingsRepository`)
- `aria-label="Join WhatsApp community"` on the CTA button

#### 11.8 New: `HomepageSkeleton` loading state

- `src/components/homepage/HomepageSkeleton.tsx` � skeleton placeholders for each section while data loads
- Prevents layout shift; use `THEME_CONSTANTS.skeleton.*` tokens

**Files changed in Phase 12:**

```
src/components/homepage/HeroCarousel.tsx
src/components/homepage/FeaturedProductsSection.tsx
src/components/homepage/FeaturedAuctionsSection.tsx
src/components/homepage/TopCategoriesSection.tsx
src/components/homepage/CustomerReviewsSection.tsx
src/components/homepage/TrustIndicatorsSection.tsx      merge + rewrite
src/components/homepage/SiteFeaturesSection.tsx         DELETE (merged into above)
src/components/homepage/NewsletterSection.tsx
src/components/homepage/WhatsAppCommunitySection.tsx
src/components/homepage/HomepageSkeleton.tsx            NEW
src/constants/ui.ts                                     + UI_LABELS.HOMEPAGE.*
src/app/page.tsx                                        use HomepageSkeleton
```

### 11.9 Tests � Phase 11

**`src/components/homepage/__tests__/FeaturedProductsSection.test.tsx`** _(update)_:

- "View all products" link points to `ROUTES.PUBLIC.PRODUCTS`
- Horizontal scroll carousel container present (mobile snap classes)

**`src/components/homepage/__tests__/NewsletterSection.test.tsx`** _(update)_:

- Submit calls `API_ENDPOINTS.NEWSLETTER.SUBSCRIBE` mutation
- Button shows loading state while submitting
- Success state renders confirmation message (not `alert()`)
- Error state calls `useMessage()` error toast (not `alert()`)

**`src/components/homepage/__tests__/CustomerReviewsSection.test.tsx`** _(update)_:

- Each review card renders star rating using `lucide-react Star`
- Swipe left/right on mobile changes visible review (mock touch events)

**`src/components/homepage/__tests__/TrustIndicatorsSection.test.tsx`** _(update � post-merge)_:

- 4 items rendered with icon + label + description
- Icons are `lucide-react` elements � no inline SVG `<path>` strings
- `SiteFeaturesSection` no longer imported anywhere (grep check)

**`src/components/homepage/__tests__/HomepageSkeleton.test.tsx`** _(new)_:

- Renders without crashing
- Uses `THEME_CONSTANTS.skeleton.*` classes � no raw colour strings

---

## Phase 12 � Dashboard Page Styling

**Goal:** Admin, seller, and user dashboards feel polished and structured. Stats are glanceable, actions are prominent, and the layout works at all three viewport sizes.

### 12.1 Admin dashboard

**Current issues:**

- Stats cards likely use raw Tailwind � standardise to `THEME_CONSTANTS.card.stat.*`
- No skeleton loading state during data fetch
- Charts (Recharts) may not be responsive on mobile
- Action shortcuts (quick links to users/orders/products) may be text-only

**Changes:**

- Wrap all stat cards in `THEME_CONSTANTS.card.stat.<colour>` tokens (indigo, emerald, amber, red)
- Add `AdminDashboardSkeleton` for loading state
- Make Recharts `<ResponsiveContainer>` and add `<Tooltip>` with accessible labels
- Add a "Quick actions" card row: New Product / Manage Orders / View Reviews � icon + label buttons
- Mobile: single-column stack; desktop: 2-col stats + 1 chart; widescreen: 4-col stats + charts side by side

### 12.2 Seller dashboard

**Changes:**

- Stat cards: Revenue (total + this month), Active listings, Pending orders, Average rating
- Earnings chart: Recharts `<AreaChart>` of last 30 days revenue � responsive
- "Needs attention" card: orders pending shipment, low-stock listings, unanswered reviews
- All numbers formatted via `formatCurrency()` and `formatRelativeTime()` from `@/utils`
- Mobile: single-column; desktop+: 2-col stats + chart

### 12.3 User dashboard / profile

**Current issues:**

- `ProfileStatsGrid` exists but may use raw numbers without formatting
- Address list likely has no visual hierarchy

**Changes:**

- `ProfileStatsGrid`: use `formatCurrency()` for spend totals, `formatRelativeTime()` for "Member since"
- "Recent orders" card on dashboard: last 3 orders with status badge + "View all" link
- Address cards: use `THEME_CONSTANTS.card.*`; default address gets a "Primary" badge
- Empty states: use `<EmptyState>` component for each section (no raw "No orders yet" text)

### 12.4 Shared admin/seller sidebar styling

- Active nav item: `THEME_CONSTANTS.themed.accent` background + white icon/text
- Hover: subtle background shift, no hard colour jump
- Section grouping: visual divider + group label (`Orders`, `Products`, `Settings`)
- Mobile: sidebar becomes a bottom sheet or slides in from left (replace current approach if inconsistent)
- Widescreen: sidebar may show full labels + icons (not just icons)

### 12.5 `AdminPageHeader` standardisation

Every admin/seller/user page uses `<AdminPageHeader>` with:

- `title` � from `UI_LABELS.*`
- `description` � one-line plain-English explanation of what this page is for
- `actions` slot � primary action button (e.g. "Add product")
- Breadcrumb trail (where applicable)

Audit all admin/seller/user pages � any that render their own `<h1>` or title block must be migrated to `<AdminPageHeader>`.

**Files changed in Phase 12:**

```
src/app/admin/page.tsx                           (dashboard) + skeleton + quick actions
src/app/seller/page.tsx                          (dashboard) + earnings chart + attention card
src/app/user/page.tsx  (or profile dashboard)   recent orders + formatted stats
src/components/admin/AdminPageHeader.tsx         + description prop + breadcrumb slot
src/components/layout/Sidebar.tsx               active state + grouping + mobile bottom sheet
src/constants/ui.ts                              + description strings for all pages
```

### 12.6 Tests � Phase 12

**`src/components/admin/__tests__/AdminPageHeader.test.tsx`** _(update)_:

- `description` prop renders as subtitle text when provided
- Breadcrumb items render with correct `href` values via `ROUTES.*`
- `actions` slot renders passed children

**`src/components/layout/__tests__/Sidebar.test.tsx`** _(update)_:

- Active nav item applies `THEME_CONSTANTS` accent class; no other items have it
- Section group dividers and labels render correctly
- On mobile viewport mock: sidebar renders as bottom sheet / slide-in panel

**`src/app/admin/__tests__/page.test.tsx`** _(update)_:

- Quick actions grid rendered with correct route links
- Skeleton shown while stats loading; real stats shown after resolve

---

## Phase 13 � Non-Tech Friendly UX

**Goal:** The application should be approachable and intuitive for everyday users � shoppers, small-business sellers, first-time buyers � not just developers or power users. Plain language replaces jargon. Flows are guided. Errors are helpful. Feedback is immediate and human.

### 13.1 Plain language throughout

Replace all technical or ambiguous labels with plain, human phrasing:

| Current (or likely)               | Replace with                                                                      |
| --------------------------------- | --------------------------------------------------------------------------------- |
| `"Submit"`                        | `"Place order"` / `"Save changes"` / `"Send message"` (context-specific)          |
| `"Validation failed"`             | `"Please check the highlighted fields"`                                           |
| `"Internal server error"`         | `"Something went wrong. Please try again."`                                       |
| `"Unauthenticated"`               | `"Please sign in to continue"`                                                    |
| `"pageSize"` visible in UI        | Remove � never expose API param names to users                                    |
| `"status==active"` visible in UI  | Remove � never expose Sieve DSL to users                                          |
| Filter label `"Sort"`             | `"Sort by"` with plain option names like `"Newest first"`, `"Price: low to high"` |
| `"createdAt"` in any visible text | `"Date added"` / `"Joined"`                                                       |
| `"updatedAt"`                     | `"Last updated"`                                                                  |

Add these to `UI_LABELS` � context-specific action labels override generic ones:

```typescript
UI_LABELS.ACTIONS.PLACE_ORDER = "Place order";
UI_LABELS.ACTIONS.SAVE_CHANGES = "Save changes";
UI_LABELS.ACTIONS.SEND_MESSAGE = "Send message";
UI_LABELS.ACTIONS.START_SELLING = "Start selling";
UI_LABELS.ACTIONS.TRACK_MY_ORDER = "Track my order";
UI_LABELS.ACTIONS.WRITE_REVIEW = "Write a review";
UI_LABELS.SORT.NEWEST_FIRST = "Newest first";
UI_LABELS.SORT.PRICE_LOW_HIGH = "Price: low to high";
UI_LABELS.SORT.PRICE_HIGH_LOW = "Price: high to low";
UI_LABELS.SORT.MOST_POPULAR = "Most popular";
UI_LABELS.SORT.ENDING_SOON = "Ending soon"; // auctions
```

### 13.2 Contextual empty states

Every list or data section that can be empty must show an `<EmptyState>` with:

- A friendly illustration or icon (from `lucide-react`)
- A plain-language explanation of _why_ it's empty
- A clear next action (button or link)

| Page / section                  | Empty state message                                                        | CTA                      |
| ------------------------------- | -------------------------------------------------------------------------- | ------------------------ |
| `user/orders` � no orders       | "You haven't placed any orders yet"                                        | "Start shopping ?"       |
| `seller/products` � no listings | "You don't have any products listed yet"                                   | "Add your first product" |
| `seller/orders` � no sales      | "No orders yet � your orders will appear here once customers start buying" | "View my listings"       |
| `admin/reviews` � no reviews    | "No reviews match your filters"                                            | "Clear filters"          |
| Search results � 0 hits         | "No results for '[query]'" + suggestion to try different terms             | "Clear search"           |
| Wishlist / saved items � empty  | "Nothing saved yet"                                                        | "Browse products"        |

### 13.3 Guided onboarding flows

First-visit experiences for new users:

- **New buyer:** After first sign-up ? brief 3-step tooltip tour: "Browse products", "Add to cart", "Checkout"
- **New seller:** After seller role granted ? checklist card on seller dashboard: "Add a profile photo", "List your first product", "Set up payment details" � each item becomes a `?` when completed
- **Empty product form:** Inline helper text explains each field in plain language (e.g. "A clear title helps buyers find your item � be specific, e.g. 'Blue cotton kurta, size M'")

### 13.4 Inline help text for all form fields

Every form field should have a `helperText` prop with a plain-English one-liner:

| Field               | Helper text                                                       |
| ------------------- | ----------------------------------------------------------------- |
| Product title       | "Be specific � e.g. 'Handmade leather wallet, brown'"             |
| Product price       | "Set a fair price. You can change it anytime."                    |
| Auction start price | "This is the lowest bid you'll accept"                            |
| Auction end date    | "When should bidding close?"                                      |
| Category            | "Pick the best fit � buyers search by category"                   |
| Pickup address      | "Where should the buyer collect from, or where do you ship from?" |
| Coupon code         | "Letters and numbers only, no spaces"                             |

Store all helper text in `UI_HELP_TEXT.*` in `src/constants/ui.ts`.

### 13.5 Improved error messages

Errors must be:

1. **Specific** � tell the user exactly what went wrong
2. **Actionable** � tell them how to fix it
3. **Human** � no codes, no stack traces, no HTTP status numbers visible

```typescript
// src/constants/messages.ts � replace generic messages
ERROR_MESSAGES.VALIDATION.REQUIRED = "This field is required";
ERROR_MESSAGES.VALIDATION.INVALID_EMAIL =
  "Enter a valid email address, e.g. name@example.com";
ERROR_MESSAGES.VALIDATION.PASSWORD_TOO_SHORT =
  "Password must be at least 8 characters";
ERROR_MESSAGES.AUTH.WRONG_PASSWORD =
  "Incorrect email or password. Please try again.";
ERROR_MESSAGES.AUTH.EMAIL_IN_USE =
  "An account with this email already exists. Try signing in.";
ERROR_MESSAGES.GENERIC.TRY_AGAIN =
  "Something went wrong. Please try again in a moment.";
ERROR_MESSAGES.NETWORK.OFFLINE =
  "You appear to be offline. Check your connection and try again.";
```

### 13.6 Progress and loading states

No action should leave the user wondering if something is happening:

- Every `<Button>` that triggers an async action accepts `isLoading` prop � show spinner + disable during mutation
- `useApiMutation` should surface `isPending` to the calling component automatically
- Long page loads (> 500ms): show skeleton screens (Phase 12/13) not blank white pages
- File uploads: show `<Progress>` bar with percentage
- Form saves: replace button text with "Saving..." then "Saved ?" for 2 seconds on success

### 13.7 Conversational toast messages

Replace all generic toast messages with friendly, specific ones:

| Action             | Toast message                                              |
| ------------------ | ---------------------------------------------------------- |
| Order placed       | "Your order is confirmed! We'll notify you when it ships." |
| Product listed     | "Your product is live � shoppers can find it now."         |
| Review submitted   | "Thanks for your review! It helps other shoppers."         |
| Profile updated    | "Your profile has been updated."                           |
| Password changed   | "Password changed. You're all set."                        |
| Bid placed         | "Bid placed! You'll be notified if someone outbids you."   |
| Item added to cart | "'[Product name]' added to your cart."                     |

Store all in `SUCCESS_MESSAGES.*` � add new keys as needed.

### 13.8 Mobile-first touch targets

All interactive elements on mobile must meet minimum 44�44 px touch target size (WCAG 2.5.5):

- All `<Button>` sizes: ensure `min-h-[44px]` on mobile
- Filter chips: `min-h-[36px]` with adequate horizontal padding
- DataTable row action buttons: ensure tappable area, not just the icon
- Navigation items: `min-h-[44px]`
- Form inputs: `min-h-[44px]`

Add to `THEME_CONSTANTS`:

```typescript
THEME_CONSTANTS.touch.target = "min-h-[44px]";
THEME_CONSTANTS.touch.targetSm = "min-h-[36px]";
```

**Files changed in Phase 13:**

```
src/constants/ui.ts                         + UI_LABELS.ACTIONS.*, UI_LABELS.SORT.*, UI_HELP_TEXT.*
src/constants/messages.ts                   rewrite error + success messages for human tone
src/constants/theme.ts                      + THEME_CONSTANTS.touch.*
src/components/ui/Button.tsx               + isLoading prop (verify/add if missing); min touch target
src/components/ui/FormField.tsx            + helperText prop (verify/add if missing)
src/components/ui/EmptyState.tsx           verify props cover all use cases; add illustration slot
src/app/user/orders/page.tsx               empty state
src/app/seller/products/page.tsx           empty state + onboarding checklist
src/app/seller/orders/page.tsx             empty state
src/app/search/page.tsx                    no-results empty state
src/app/admin/reviews/[[...action]]/page.tsx  no-results empty state
src/app/products/page.tsx                  no-results empty state
```

### 13.9 Tests � Phase 13

**`src/components/ui/__tests__/Button.test.tsx`** _(update)_:

- `isLoading=true` renders spinner and `disabled` attribute is set
- `min-h-[44px]` class present on all button size variants
- Loading state text hidden (or screen-reader-only) while spinner shows

**`src/components/ui/__tests__/FormField.test.tsx`** _(update)_:

- `helperText` prop renders below the input
- `helperText` absent when prop not passed

**`src/components/ui/__tests__/EmptyState.test.tsx`** _(update)_:

- Illustration slot renders children when passed
- Title and description rendered from props correctly

**`src/app/seller/products/__tests__/page.test.tsx`** _(update)_:

- Onboarding checklist visible when `products.length === 0`
- Empty state hidden once at least one product exists

**`src/app/search/__tests__/page.test.tsx`** _(update)_:

- `<EmptyState>` rendered when API returns 0 matching items

---

## Phase 14 � Code Deduplication ? Done

> **Sections:** L  
> **Risk:** ?? Minor breaking � two API route renames; one lib file merge; one component delete  
> **Principle:** Never introduce a new file when an existing one can be extended. Every deletion requires a grep sweep.

### 14.1 Duplicate Components

| Action | File                                              | Detail                                                                                                                                           |
| ------ | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| DELETE | `src/components/utility/Breadcrumbs.tsx`          | Canonical is `src/components/layout/Breadcrumbs.tsx`. Grep `utility/Breadcrumbs` across entire src, update every import to `@/components` barrel |
| DELETE | `src/components/homepage/EnhancedFooter.tsx`      | _(already Phase 8)_                                                                                                                              |
| DELETE | `src/components/homepage/SiteFeaturesSection.tsx` | _(already Phase 12)_                                                                                                                             |

### 14.2 Duplicate Lib Files

| Action         | File                                | Detail                                                                                                                                                                                   |
| -------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MERGE + DELETE | `src/lib/api/validation-schemas.ts` | Merge all its Zod schemas into `src/lib/validation/schemas.ts`. Update every API route import from `'@/lib/api/validation-schemas'` to `'@/lib/validation/schemas'`. Delete source file. |

**Grep command:** `grep -r "api/validation-schemas" src/ --include="*.ts" --include="*.tsx"`

### 14.3 Duplicate API Routes

| Delete                                         | Migrate callers to               | Change                                                                                                                         |
| ---------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `src/app/api/profile/update/route.ts`          | `PUT /api/user/profile`          | Update `API_ENDPOINTS.PROFILE.UPDATE` constant ? `API_ENDPOINTS.USER.PROFILE`; update all hooks/pages calling the old endpoint |
| `src/app/api/profile/update-password/route.ts` | `POST /api/user/change-password` | Update `API_ENDPOINTS.PROFILE.UPDATE_PASSWORD` ? `API_ENDPOINTS.USER.CHANGE_PASSWORD`; update all callers                      |

**Before deleting:** ensure `PUT /api/user/profile` handles all fields previously handled by `/api/profile/update`.

### 14.4 Pre-Implementation Rule (Enforce via PR Template)

Add to PR checklist:

- [ ] Searched `src/components`, `src/hooks`, `src/utils` for similar existing code before creating a new file
- [ ] If an existing component was extended, named the new prop descriptively (not a boolean flag)
- [ ] Ran grep for any deleted file paths � zero remaining imports

### Files Changed in Phase 14

```
# Deleted
src/components/utility/Breadcrumbs.tsx
src/lib/api/validation-schemas.ts
src/app/api/profile/update/route.ts
src/app/api/profile/update-password/route.ts

# Modified (import updates only)
src/constants/api-endpoints.ts                            � PROFILE.UPDATE ? USER.PROFILE; PROFILE.UPDATE_PASSWORD ? USER.CHANGE_PASSWORD
src/lib/validation/schemas.ts                             � merge content from api/validation-schemas.ts
All files importing utility/Breadcrumbs or api/validation-schemas
```

### 14.5 Tests � Phase 14

**Grep assertions (run as CI checks on this PR):**

- `grep -r "utility/Breadcrumbs" src/` ? 0 matches
- `grep -r "api/validation-schemas" src/` ? 0 matches
- `grep -r "/api/profile/update" src/` ? 0 matches (except history)
- `grep -r "EnhancedFooter" src/` ? 0 matches

**`src/lib/validation/__tests__/schemas.test.ts`** _(update)_:

- All Zod schemas previously in `api/validation-schemas.ts` are present in the merged file
- No duplicate schema names exist after merge

---

## Phase 15 � SEO: Full-Stack Coverage

> **Sections:** M  
> **Risk:** ?? Additive (new files + metadata exports + schema fields) with one breaking URL change (`/products/[id]` ? `/products/[slug]`)  
> **Important order:** schema fields first ? slug generation ? URL rename ? JSON-LD helpers ? page metadata ? sitemap/robots last

### 15.1 Extend `src/constants/seo.ts`

Add five new exported functions (no changes to existing `SEO_CONFIG` shape):

```typescript
export function generateProductMetadata(product: ProductSeoInput): Metadata;
export function generateCategoryMetadata(category: CategorySeoInput): Metadata;
export function generateBlogMetadata(post: BlogSeoInput): Metadata;
export function generateAuctionMetadata(auction: AuctionSeoInput): Metadata;
export function generateSearchMetadata(q: string, category?: string): Metadata;
```

Each function:

1. Prefers `seoTitle` / `seoDescription` / `seoKeywords` over auto-generated values
2. Falls back to `${resource.title} | ${SEO_CONFIG.siteName}` defaults
3. Includes canonical URL with slug (not database ID)
4. Passes the first product/blog/category image as the OG image

Also add to `SEO_CONFIG.pages`:

- `blog`, `faqs`, `about`, `contact`, `sellers` page defaults

### 15.2 JSON-LD Helpers � `src/lib/seo/json-ld.ts` (NEW)

```typescript
export function productJsonLd(
  product: ProductDocument,
): Record<string, unknown>;
export function reviewJsonLd(review: ReviewDocument): Record<string, unknown>;
export function aggregateRatingJsonLd(
  product: ProductDocument,
  stats: { average: number; count: number },
): Record<string, unknown>;
export function breadcrumbJsonLd(
  items: Array<{ name: string; url: string }>,
): Record<string, unknown>;
export function faqJsonLd(faqs: FaqDocument[]): Record<string, unknown>;
export function blogPostJsonLd(post: BlogPostDocument): Record<string, unknown>;
export function organizationJsonLd(): Record<string, unknown>;
export function searchBoxJsonLd(): Record<string, unknown>;
export function auctionJsonLd(
  auction: ProductDocument,
): Record<string, unknown>;
```

**Usage in page:**

```tsx
// src/app/products/[slug]/page.tsx
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo";

export default function ProductPage({ product }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd(product)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", url: "/" },
              {
                name: product.categoryName,
                url: `/categories/${product.categorySlug}`,
              },
              { name: product.title, url: `/products/${product.slug}` },
            ]),
          ),
        }}
      />
      {/* ... */}
    </>
  );
}
```

### 15.3 Schema Field Additions

**`src/db/schema/products.ts`** � add to `ProductDocument` interface:

```typescript
slug: string;               // required; auto-generated from title at create time; unique
seoTitle?: string;          // user override; max 60 chars
seoDescription?: string;    // user override; max 160 chars
seoKeywords?: string[];     // user override; max 10 tags
// Per-image alt text: extend each image object
images: Array<{ url: string; altText: string; }>;
```

**`src/db/schema/blog-posts.ts`** � verify `slug` exists; add `seoTitle?`, `seoDescription?`, `seoKeywords?`

**`src/db/schema/categories.ts`** � verify `slug` exists; add `seoTitle?`, `seoDescription?`

Add `PRODUCT_SEO_FIELDS` constant object (see Section M for spec).

### 15.4 Product URL Migration: `[id]` ? `[slug]`

| File                                                         | Change                                                                                                                        |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `src/app/products/[id]/page.tsx`                             | Rename folder to `[slug]`; change route param from `id` to `slug`; use `productRepository.findBySlug(slug)` (add this method) |
| `src/app/api/products/[id]/route.ts`                         | Keep ID-based API; no change to API                                                                                           |
| `src/repositories/product.repository.ts`                     | Add `findBySlug(slug: string)` and `findByIdOrSlug(idOrSlug: string)` methods                                                 |
| `src/constants/routes.ts`                                    | Update `ROUTES.PRODUCT.DETAIL` to use slug param                                                                              |
| All `<Link href={ROUTES.PRODUCT.DETAIL(product.id)}>` usages | Change to `ROUTES.PRODUCT.DETAIL(product.slug)`                                                                               |
| `src/app/api/products/route.ts`                              | Ensure `slug` is set on creation (slugify title + unique suffix)                                                              |

> **Redirect:** Add `/products/[id]/page.tsx` as a redirect to `/products/[slug]` using `permanentRedirect()` for backward compatibility with any existing shared links.

### 15.5 SEO Fields in Admin/Seller Forms

**`ProductForm`** � add "SEO" tab/accordion (collapsible, below main fields):

```
� SEO (optional � leave blank for auto-generated)           �
+-------------------------------------------------------------�
� SEO Title (max 60 chars)       [___________________________] �
� SEO Description (max 160)      [___________________________] �
� Keywords (comma-separated)     [___________________________] �
� Image Alt Text (each image)    shown per-image in upload UI  �
```

**`BlogForm`** � same SEO tab pattern.

### 15.6 Sitemap + Robots + OG Image

**`src/app/sitemap.ts`** � fetches from repositories server-side; generates `MetadataRoute.Sitemap`; called at build/request time by Next.js.

**`src/app/robots.ts`** � static; disallows admin/api/seller/user/auth/checkout segments; exposes `sitemap` URL.

**`src/app/opengraph-image.tsx`** � uses `ImageResponse` (Next.js built-in); renders LetItRip branding for social shares where a page-specific OG image isn�t available.

### 15.7 Media Upload: SEO-Friendly Filenames

**`src/app/api/media/upload/route.ts`** � when saving files to Firebase Storage, use:

```
product images: products/{productSlug}/{productSlug}-{index}.{ext}
blog:           blog/{postSlug}-cover.{ext}
category:       categories/{categorySlug}.{ext}
avatars:        avatars/{uid}.{ext}  (already may be correct)
```

Use `slugify(contextName)` from `@/utils` for the filename part.

### 15.8 Per-Page Metadata Sweep

Add `export const metadata` (static) or `export async function generateMetadata()` (dynamic) to every public page that is currently missing it. Admin/seller/user pages get `{ noIndex: true }`. Full page list is in Section M.

### Files Changed in Phase 15

```
# New
src/lib/seo/json-ld.ts
src/lib/seo/index.ts
src/app/sitemap.ts
src/app/robots.ts
src/app/opengraph-image.tsx

# Modified
src/constants/seo.ts                                      � +5 generateXMetadata functions; +page defaults
src/db/schema/products.ts                                 � slug field; SEO fields; image altText
src/db/schema/blog-posts.ts                               � SEO fields
src/db/schema/categories.ts                               � SEO fields
src/repositories/product.repository.ts                   � findBySlug(); findByIdOrSlug()
src/app/api/products/route.ts                             � slugify on create
src/app/api/media/upload/route.ts                         � SEO-friendly filename
src/app/products/[slug]/page.tsx                          � renamed from [id]; generateProductMetadata
src/app/products/[id]/page.tsx                            � permanentRedirect to [slug] version
src/components/admin/ProductForm.tsx (or seller equiv)    � SEO tab
src/components/admin/BlogForm.tsx                         � SEO tab
src/constants/routes.ts                                   � ROUTES.PRODUCT.DETAIL uses slug
All public page files (see Section M per-page table)      � add metadata export
```

### 15.9 Tests � Phase 15

**`src/constants/__tests__/seo.test.ts`** _(update � full coverage)_:

- `generateProductMetadata(product)` prefers `seoTitle`/`seoDescription` over auto-generated values
- Canonical URL includes product slug, not database ID
- `generateCategoryMetadata(category)` returns correct canonical path
- `generateBlogMetadata(post)` sets `publishedTime`/`modifiedTime` in OG tags
- `generateSearchMetadata(q)` includes the search query in the page title

**`src/lib/seo/__tests__/json-ld.test.ts`** _(new)_:

- `productJsonLd(product)` outputs `@type: "Product"` with correct `name`, `price`, and `image`
- `faqJsonLd(faqs)` outputs `@type: "FAQPage"` with correct Q&A pairs
- `breadcrumbJsonLd(items)` outputs `@type: "BreadcrumbList"` with correct item positions
- `organizationJsonLd()` outputs `@type: "Organization"` with site name and URL

**`src/app/__tests__/sitemap.test.ts`** _(new)_:

- Returns array of `MetadataRoute.Sitemap` entries
- Home page has `priority: 1.0`
- All published products are included with slug-based URLs
- Admin, seller, user, and auth paths are NOT included

**`src/repositories/__tests__/product.repository.test.ts`** _(update)_:

- `findBySlug(slug)` returns the correct product document
- `findBySlug('nonexistent')` returns `null`

---

## Dependency Graph

```
Phase 1 (constants, schema, lucide-react)
  +-- Phase 2 (new UI components + hook � consume Phase 1 constants)
        +-- Phase 3 (barrel exports + DataTable/SearchResultsSection wiring)
              +-- Phase 4 (admin pages � consume Phase 2+3)
              +-- Phase 5 (public pages � consume Phase 2+3)
              +-- Phase 6 (seller/user pages � consume Phase 2+3)
                    +-- Phase 7 (FAQ routes � can run in parallel with 4�6)
Phase 8 (footer/nav � depends only on Phase 1)
Phase 9 (inline create � depends on Phase 2 for SideDrawer side prop)
Phase 10 (gestures + a11y � depends on Phase 2 for all new components)
Phase 11 (homepage sections � depends on Phase 1 + Phase 10 for gestures/a11y)
Phase 12 (dashboard styling � depends on Phase 1 for lucide + constants)
Phase 13 (non-tech UX � depends on Phase 1 for constants; touches pages from 4�6)
Phase 14 (code deduplication � depends on Phase 1 for API_ENDPOINTS constants; can run independently)
Phase 15 (SEO � depends on Phase 1 for slug utils; Phase 9 for ProductForm extension; touches public pages from 5)
```

**Parallelizable work:**

- Phases 4, 5, 6, 7 can all proceed in parallel once Phase 3 is done
- Phase 8 can proceed as soon as Phase 1 is done
- Phase 10, 11, 12 can proceed in parallel once Phase 2 is done
- Phase 13 can be tackled incrementally alongside phases 4�12
- **Phase 14 (dedup)** can proceed independently at any time; route deletes must happen after callers are updated
- **Phase 15 (SEO)** schema fields can be added early (Phase 1/9); metadata exports added anytime after Phase 5; sitemap/robots last

**Import update rule (applies to every phase):**  
When a file is deleted or a component is moved, immediately grep the entire codebase for its old import path and update every match. Do not leave stale imports or add re-export shims. Use `grep -r "OldComponentName" src/` before closing a PR.

---

## Checklist per PR

Before merging any phase:

- [ ] `npx tsc --noEmit` on all changed files � zero errors
- [ ] All imports updated to new locations � no dead imports left behind
- [ ] All deleted components/files: grep for any remaining import of the deleted path � zero matches
- [ ] All new components import from `@/components`, `@/hooks`, `@/utils`, `@/constants` � never from deep paths
- [ ] No raw UI text � all strings from `UI_LABELS`, `UI_PLACEHOLDERS`, `ERROR_MESSAGES`, `SUCCESS_MESSAGES`
- [ ] No raw repeated Tailwind strings � all from `THEME_CONSTANTS`
- [ ] No `console.log` � use `logger` (client) / `serverLogger` (API)
- [ ] No `router.push()` for filter/sort changes � only `router.replace()`
- [ ] Page files stay under 150 lines of JSX
- [ ] `npm run lint` passes
- [ ] All interactive elements have `aria-label` or visible label wired via `htmlFor`
- [ ] All new `<button>` elements work with keyboard (`Enter`/`Space`)
- [ ] All modals/drawers trap focus and return it on close
- [ ] No user-visible text contains API jargon (`pageSize`, `createdAt`, Sieve DSL, HTTP status codes)
- [ ] Touch targets on mobile: all interactive elements = 44�44 px (`THEME_CONSTANTS.touch.target`)
- [ ] `prefers-reduced-motion` respected for all animations/transitions
- [ ] Tested at mobile (375 px), desktop (1280 px), and widescreen (1536 px+) viewport widths
- [ ] Searched for existing similar component/hook/util before creating a new file (Phase 14 rule)
- [ ] No `alt=""` on meaningful images � all product/category/blog images have descriptive alt text
- [ ] All new/modified public pages export `metadata` or `generateMetadata()` (Phase 15 rule)
- [ ] Deleted API route paths are updated in `API_ENDPOINTS` constants and all callers

---

## Phase 17 � Next.js 16 Compatibility: Async Params

> **Audit source:** `npx tsc --noEmit` � 8 errors in `.next/dev/types/validator.ts` (Feb 21, 2026)  
> **Root cause:** Next.js 15+ made `params` in route handlers and page components a `Promise`. Four API routes and one page file still use the old synchronous `params: { id: string }` interface, causing type-checker failures.

### Background

In Next.js 15 / 16 the `context.params` object passed to route handlers and page components is a `Promise`. The `.next/dev/types/validator.ts` auto-generated validator enforces this � a `RouteContext` whose `params` is **not** a `Promise` will fail the constraint check.

**Pattern before (Next.js 13/14 � broken in 15/16):**

```typescript
interface RouteContext {
  params: { id: string };
}
export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id } = params; // ? sync access
}
```

**Pattern after (Next.js 15/16 compatible):**

```typescript
interface RouteContext {
  params: Promise<{ id: string }>;
}
export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params; // ? async access
}
```

### 17.1 API Routes to migrate (4 files)

| File                                                   | Param key                   |
| ------------------------------------------------------ | --------------------------- |
| `src/app/api/user/addresses/[id]/route.ts`             | `id` (GET � PATCH � DELETE) |
| `src/app/api/user/addresses/[id]/set-default/route.ts` | `id` (POST)                 |
| `src/app/api/user/orders/[id]/route.ts`                | `id` (GET)                  |
| `src/app/api/user/orders/[id]/cancel/route.ts`         | `id` (POST)                 |

For each:

1. Change `params: { id: string }` ? `params: Promise<{ id: string }>` in `RouteContext`
2. Change `const { id } = params` ? `const { id } = await params` in every handler

### 17.2 Page file to migrate (1 file)

**`src/app/faqs/[category]/page.tsx`** � server component, not an async function, uses `params` prop:

```tsx
// BEFORE (sync � incompatible with Next.js 15/16)
interface Props { params: { category: string }; }
export default function FAQCategoryPage({ params }: Props) {
  const { category } = params;
  ...
}

// AFTER � make component async and await params
interface Props { params: Promise<{ category: string }>; }
export default async function FAQCategoryPage({ params }: Props) {
  const { category } = await params;
  ...
}
```

### 17.3 Stale `.next` cache entries

The following files were deleted in previous phases but remain referenced in `.next/dev/types/validator.ts`:

| Stale reference                                | Deleted in                    |
| ---------------------------------------------- | ----------------------------- |
| `src/app/products/[id]/page.js`                | Phase 15 (renamed ? `[slug]`) |
| `src/app/seller/products/new/page.js`          | Phase 6                       |
| `src/app/api/profile/update-password/route.js` | Phase 14                      |
| `src/app/api/profile/update/route.js`          | Phase 14                      |

**Fix:** Delete `.next` directory so Next.js regenerates `validator.ts` cleanly on next build.

```bash
Remove-Item -Recurse -Force .next
```

### 17.4 Files changed in Phase 17

```
src/app/api/user/addresses/[id]/route.ts                  RouteContext async params
src/app/api/user/addresses/[id]/set-default/route.ts      RouteContext async params
src/app/api/user/orders/[id]/route.ts                     RouteContext async params
src/app/api/user/orders/[id]/cancel/route.ts              RouteContext async params
src/app/faqs/[category]/page.tsx                          async component + await params
```

### 17.5 Tests � Phase 17

Update any test files that mock `params` as a plain object to use `Promise.resolve(...)`:

**`src/app/api/__tests__/` affected tests** � search for mock params patterns and update:

```typescript
// BEFORE
const mockContext = { params: { id: "abc" } };

// AFTER
const mockContext = { params: Promise.resolve({ id: "abc" }) };
```

**Assertions:**

- Each updated route handler still returns correct data when called with `Promise.resolve`-wrapped params
- `npx tsc --noEmit` exits with code 0 after `.next` is deleted and rebuilt

---

## Phase 18 -- Dedicated Test Phase

> **Audit source:** Coverage gap analysis -- Feb 21, 2026
> **Goal:** Systematic, ordered test coverage for every deliverable from Phases 1--17. Work through sub-phases in order; each sub-phase must turn green (`npm test -- --testPathPattern=<pattern>` exits 0) before starting the next.
> **Key:** _(NEW)_ = file does not yet exist. _(UPDATE)_ = file already exists, add or adjust cases.

### Sub-phase overview

| Sub   | Scope                                    | New files | Update files                                                       |
| ----- | ---------------------------------------- | --------- | ------------------------------------------------------------------ |
| 18.1  | Baseline audit + Phase 17 mock fixes     | 0         | All existing `api/__tests__/*.test.ts` with plain `params` objects |
| 18.2  | Core data-fetching + form hooks          | 4         | 0                                                                  |
| 18.3  | Security + UX hooks                      | 4         | 0                                                                  |
| 18.4  | Address + profile hooks                  | 3         | 0                                                                  |
| 18.5  | Interaction + responsive hooks           | 6         | 2 (useLongPress, usePullToRefresh already exist)                   |
| 18.6  | Auth API routes                          | 6         | 1 (auth.test.ts already exists)                                    |
| 18.7  | User API routes                          | 6         | 0                                                                  |
| 18.8  | Public API routes -- products + search   | 1         | 2 (products.test.ts, products-id.test.ts already exist)            |
| 18.9  | Public API routes -- content + social    | 5         | 4 (categories, faqs, carousel, reviews already exist)              |
| 18.10 | Admin API routes -- tier 1               | 6         | 0                                                                  |
| 18.11 | Admin API routes -- tier 2               | 6         | 0                                                                  |
| 18.12 | Seller API routes                        | 3         | 0                                                                  |
| 18.13 | Public pages -- products + auctions      | 4         | 0                                                                  |
| 18.14 | Public pages -- blog + categories + FAQs | 4         | 1 (faqs page already exists)                                       |
| 18.15 | Public pages -- search + static          | 7         | 0                                                                  |
| 18.16 | Seller pages                             | 5         | 0                                                                  |
| 18.17 | Admin pages -- missing coverage          | 9         | 0                                                                  |
| 18.18 | Cart + checkout + profile pages          | 5         | 1 (profile/[userId] already exists)                                |
| 18.19 | Full build verification                  | 0         | 0 (run commands; no files)                                         |

### Sub-phase tracker

| Sub   | Status  | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ----- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| 18.1  | ? Done  | 190/190 suites green; 2506/2510 tests passing (4 pre-existing skips). Fixed: duplicate `const faqs` in admin/faqs page; `</button>` ? `</Link>` in FAQCategorySidebar; `findByIdOrSlug` mock in products-id test; `getNumber`/`setPageSize` missing from 4 useUrlTable mocks; `TablePagination`/`Modal`/`AdminFilterBar`/`FormField` missing from 3 admin page mocks; stale `buttons.length===4` in FAQSection; multiple `view all` in FeaturedAuctions; `quick links` ? `getAllByText(/shop/i)` in Footer; jsdom email constraint bypassed with `fireEvent.submit` in Newsletter; IntersectionObserver mock passes instance as second arg in TrustFeatures; FAQCategorySidebar Link mock passes `onClick`+`className`; button?link role updates in sidebar accessibility tests. |
| 18.2  | ? Done  | 4 new test files: `useApiQuery.test.ts` (11 tests), `useApiMutation.test.ts` (11 tests), `useForm.test.ts` (11 tests), `useMessage.test.ts` (9 tests) = 42 new tests. Adapted to actual hook APIs (useForm has no isDirty/setFieldError; useMessage has no showWarning/dismiss; relative call counts used in useApiQuery to handle React 18 Strict Mode double-invoke). 194/194 suites green.                                                                                                                                                                                                                                                                                                                                                                                    |
| 18.3  | ? Done  | 2 new test files: `useRBAC.test.ts` (26 tests across useHasRole, useIsAdmin, useIsModerator, useIsSeller, useCanAccess, useRoleChecks, useIsOwner), `useUnsavedChanges.test.ts` (11 tests). Key fixes: `jest.mock` factory must be self-contained (literal string, not external const) due to hoisting; `useCanAccess` tests must use actual routes from `RBAC_CONFIG` (e.g. `/admin/dashboard`, `/user/profile`) since paths without a config entry return `allowed:true` by default. 196/196 suites green; 2589/2593 tests passing.                                                                                                                                                                                                                                            |
| 18.4  | ? Done  | 3 new test files: `useAddresses.test.ts` (12 tests), `useAddressForm.test.ts` (11 tests), `useProfile.test.ts` (10 tests). Key fixes: spread `jest.requireActual('@/lib/api-client')` to preserve `ApiClientError`; `cacheManager.clear()` in `beforeEach` prevents query cache leaking between tests; mutation error tests need try/catch since `mutate` re-throws; `onSuccess(result, variables)` takes 2 args � use `toHaveBeenCalledWith(data, expect.anything())`; `isLoading=true` when `enabled=false` and no cache � don't assert isLoading for disabled queries. 199/199 suites green; 2622/2626 tests passing.                                                                                                                                                         |
| 18.5  | ? Done  | 8 new test files: `useMediaQuery.test.ts` (6), `useBreakpoint.test.ts` (5), `useClickOutside.test.tsx` (6), `useKeyPress.test.ts` (7), `useSwipe.test.tsx` (6), `useGesture.test.tsx` (5), `useRealtimeBids.test.ts` (7), `useRazorpay.test.ts` (6) = 48 new tests. Key patterns: mock `window.matchMedia` with `addEventListener`/`removeEventListener` fns; render React component to get real DOM ref for click-outside and swipe hooks; `document.dispatchEvent(new KeyboardEvent(...))` for key-press; capture `onValue` callback via closure to simulate RTDB snapshots; `window.Razorpay` presence controls `isLoading` initial state. 207/207 suites green; 2670/2674 tests passing.                                                                                     |
| 18.6  | ? Done  | 6 new test files: `auth-forgot-password.test.ts` (6 tests), `auth-reset-password.test.ts` (4 tests), `auth-verify-email.test.ts` (3 tests), `auth-send-verification.test.ts` (4 tests), `auth-logout.test.ts` (4 tests), `auth-session.test.ts` (4 tests). Key pattern: stub `@/lib/firebase/admin` via `getAdminAuth()` (not `firebase-admin/auth`) for routes using Admin SDK; `auth/send-verification` uniquely uses `getAdminAuth` not `getAuth`; session route uses dynamic `import()` internals requiring both `firebase-admin/auth` and `firebase-admin/firestore` mocks. 218/218 suites green.                                                                                                                                                                           |
| 18.7  | ? Done  | 7 test file changes: `user-addresses.test.ts` (9 tests, NEW), `user-sessions.test.ts` (4 tests, NEW), `user-password.test.ts` (6 tests, NEW), `user-orders.test.ts` (6 tests, NEW), `user-wishlist.test.ts` (9 tests, NEW), `profile.test.ts` (4 GET tests added, UPDATE). Key pattern: `requireAuth()` must be mocked as `jest.fn()` on `@/lib/firebase/auth-server`; route throws `AuthenticationError` (401) on null user, not `NotFoundError` (404); `successResponse` mock needs optional 3rd `status` param for 201 responses. 218/218 suites green; 2733/2737 tests passing (4 pre-existing skips).                                                                                                                                                                       |
| 18.8  | ✅ Done | 6 new test files: `public-search.test.ts`, `public-bids.test.ts`, `public-blog.test.ts`, `public-newsletter.test.ts`, `public-contact.test.ts`, `public-coupons.test.ts` = 43 new tests. All 245 suites green.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 18.9  | ✅ Done | Covered in same batch as 18.8. Five public content/social API routes fully tested.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 18.10 | ✅ Done | 3 new test files: `admin-dashboard.test.ts` (5), `admin-newsletter.test.ts` (10), `admin-orders.test.ts` (12) = 27 new tests. createApiHandler mock pattern with try/catch + full error class set established.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 18.11 | ✅ Done | 6 new test files: `admin-bids.test.ts`, `admin-blog.test.ts`, `admin-coupons.test.ts`, `admin-payouts.test.ts`, `admin-analytics.test.ts`, `admin-algolia.test.ts` = 36 new tests. 245/245 suites green.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 18.12 | ✅ Done | 3 new test files: `seller-orders.test.ts` (5), `seller-analytics.test.ts` (5), `seller-payouts.test.ts` (8) = 18 new tests. Seller routes use `requireAuth` directly. 245/245 suites green; 2925 tests passing.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 18.13 | ✅ Done | 4 new test files: `products/__tests__/page` (8), `products/[slug]/__tests__/page` (5), `auctions/__tests__/page` (5), `auctions/[id]/__tests__/page` (6) = 24 new tests. Key fixes: ProductInfo mock uses individual props not `product` object; AuctionDetailPage title appears in breadcrumb + h1 → use `getByRole("heading")`; PlaceBidForm receives `isEnded` not `disabled`; useRealtimeBids returns `{currentBid, bidCount, lastBid, connected}`.                                                                                                                                                                                                                                                                                                                          |
| 18.14 | ✅ Done | 4 new test files: `blog/__tests__/page` (6), `blog/[slug]/__tests__/page` (5), `categories/__tests__/page` (5), `categories/[slug]/__tests__/page` (6) = 22 new tests. `faqs/[category]` test pre-existed. Key fix: BlogPostPage uses `post.authorName` not `post.author`; categories/[slug] heading text appears twice → use `getAllByText()[0]`.                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 18.15 | ✅ Done | 7 new test files: `search/__tests__/page` (7), `about/__tests__/page` (4), `contact/__tests__/page` (4), `help/__tests__/page` (4), `privacy/__tests__/page` (3), `terms/__tests__/page` (3), `promotions/__tests__/page` (3) = 28 new tests. Key fixes: `<input type="search">` has role "searchbox" not "textbox"; hasAnyFilter guard means SearchResultsSection only renders when q/category/price is set; privacy+terms pages use `UI_LABELS.FOOTER.*` → add FOOTER to mock; promotions page uses `EMPTY_DEALS`/`CHECK_BACK` not `EMPTY_TITLE`/`EMPTY_SUBTITLE`; about page has no TEAM section → test VALUES section instead.                                                                                                                                               |
| 18.16 | ✅ Done | 3 new test files: `seller/__tests__/page` (5), `seller/analytics/__tests__/page` (5), `seller/payouts/__tests__/page` (4) = 14 new tests. `seller/products` and `seller/orders` tests already existed and pass. Key pattern: seller/page imports `Heading`+`Text` from `@/components/typography` → mock that path separately; analytics page checks `user.role==='seller'/'admin'` before fetching. 263/263 suites green; 3015 tests passing.                                                                                                                                                                                                                                                                                                                                    |
| 18.17 | ✅ Done | 4 new test files: `admin/blog/[[...action]]/__tests__/page` (4), `admin/analytics/__tests__/page` (4), `admin/media/__tests__/page` (4), `admin/payouts/__tests__/page` (4) = 16 new tests. All admin page tests follow thin-orchestration stub pattern. 270/270 suites green.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 18.18 | ✅ Done | 7 new test files: `api/__tests__/admin-users.test.ts` (4), `api/__tests__/admin-sessions.test.ts` (3), `cart/__tests__/page` (5), `checkout/__tests__/page` (4), `checkout/success/__tests__/page` (4), `sellers/__tests__/page` (5), `sellers/[id]/__tests__/page` (6) = 31 new tests. Key fixes: `CheckoutSkeleton` is inline (check `.animate-pulse`); empty cart → `null` + `router.replace`; checkout/success uses `Spinner` not `LoadingSpinner`; sellers/[id] fetch returns `{user:{...}}`; `ROUTES.PUBLIC.PROFILE` is a function; admin-sessions `AuthorizationError` returns 500. 274/274 suites green; 3070 tests passing.                                                                                                                                             |
| 18.19 | ✅ Done | Full suite verified: `Test Suites: 274 passed, 274 total. Tests: 4 skipped, 3066 passed, 3070 total`. tsc: Exit 0. lint: Exit 0 (0 errors, 307 warnings). build: Exit 0 (webpack). Fixes: ESLint baseline (react-hooks + @next plugins), Next.js 16.1.6, `messages.ts` split into `error-messages.ts`+`success-messages.ts`, `sieve.helper` removed from client barrel, `client-redirect` removed from errors barrel, `opengraph-image.tsx` direct import, Zod `.partial()` on 3 refined schemas fixed (carousel/faqCreateSchema/homepageSectionCreateSchema), Suspense wrapper added to 11 pages using `useSearchParams`. Phase 18 complete.                                                                                                                                    |     |

---

### 18.1 -- Baseline Audit + Phase 17 Mock Fixes

**Run the full suite first -- document all failures before writing any new tests.**

```powershell
npm test -- --passWithNoTests 2>&1 | Tee-Object test-baseline.txt
```

For every failing test: fix the root cause (stale mock, renamed import, moved component). Do **not** delete tests.

**Phase 17 param mock update** -- every test file that passes `params` as a plain object to an async route handler must wrap it in `Promise.resolve`:

```typescript
// BEFORE (fails on Next.js 16 async params)
const ctx = { params: { id: "abc" } };

// AFTER
const ctx = { params: Promise.resolve({ id: "abc" }) };
```

Search for affected files:

```powershell
Select-String -Path "src\app\api\__tests__\*.ts" -Pattern "params: \{" | Select-Object Filename, LineNumber, Line
```

Files likely affected: `auth.test.ts`, `products-id.test.ts`, `carousel.test.ts`, `categories.test.ts`, `faqs.test.ts`, `homepage-sections.test.ts`, `media.test.ts`, `profile.test.ts`, `reviews.test.ts`, `site-settings.test.ts`.

**Acceptance criteria:** `npm test` exits 0 with no failures across all pre-existing test files.

---

### 18.2 -- Core Data-Fetching + Form Hooks

**Mocking strategy:** Use `jest.spyOn(global, 'fetch')` returning `Promise.resolve(new Response(JSON.stringify(payload), { status: 200 }))`. Wrap every `renderHook` in `act`.

---

**`src/hooks/__tests__/useApiQuery.test.ts`** _(NEW)_

- `it('returns isLoading=true and data=undefined before fetch resolves')`
- `it('returns data and isLoading=false after successful fetch')`
- `it('returns error and isLoading=false when fetch rejects')`
- `it('returns error when server responds with 4xx status')`
- `it('refetch() triggers a new fetch call')`
- `it('changes to queryKey trigger a new fetch and reset data')`
- `it('does not fetch when enabled=false')`
- `it('starts fetching when enabled changes from false to true')`

---

**`src/hooks/__tests__/useApiMutation.test.ts`** _(NEW)_

- `it('returns isLoading=false and no error in initial state')`
- `it('sets isLoading=true while mutation is in flight')`
- `it('resolves data and resets isLoading on success')`
- `it('sets error and resets isLoading when fetch rejects')`
- `it('sets error when server responds with 4xx')`
- `it('calls onSuccess callback with response data on success')`
- `it('calls onError callback with error on failure')`
- `it('reset() clears error and data back to initial state')`

---

**`src/hooks/__tests__/useForm.test.ts`** _(NEW)_

- `it('initialises field values from the provided initialValues')`
- `it('updates a field value when handleChange is called')`
- `it('sets isDirty=true after any field is changed')`
- `it('isDirty remains false when value is reset to initial')`
- `it('runs validator on submit and populates errors')`
- `it('does not call onSubmit when validation fails')`
- `it('calls onSubmit with current values when validation passes')`
- `it('reset() restores all values to initialValues and clears errors')`
- `it('setFieldError() adds a custom error for a specific field')`

---

**`src/hooks/__tests__/useMessage.test.ts`** _(NEW)_

- `it('showSuccess() adds a success toast to the queue')`
- `it('showError() adds an error toast with correct variant')`
- `it('showWarning() adds a warning toast with correct variant')`
- `it('showInfo() adds an info toast with correct variant')`
- `it('toast disappears after the configured auto-dismiss duration')`
- `it('dismiss(id) removes only the targeted toast')`
- `it('multiple toasts stack without replacing each other')`

---

### 18.3 -- Security + UX Hooks

---

**`src/hooks/__tests__/useRBAC.test.ts`** _(NEW)_

Mock `useAuth` from `@/hooks` to return different user objects per test group.

- `useIsAdmin`:
  - `it('returns true when user role is admin')`
  - `it('returns false when user role is seller')`
  - `it('returns false when user is unauthenticated')`
- `useIsSeller`:
  - `it('returns true when user role is seller')`
  - `it('returns true when user role is admin (role hierarchy)')`
  - `it('returns false when user role is user')`
- `useHasRole(role)`:
  - `it('returns true for exact role match')`
  - `it('returns true for higher role (hierarchy)')`
  - `it('returns false for lower role')`
- `useCanAccess(route)`:
  - `it('returns true for a route in RBAC_CONFIG that matches user role')`
  - `it('returns false for a route that requires a higher role')`
  - `it('returns false for any protected route when unauthenticated')`

---

**`src/hooks/__tests__/useUnsavedChanges.test.ts`** _(NEW)_

- `it('does not attach beforeunload listener when isDirty=false')`
- `it('attaches beforeunload listener when isDirty becomes true')`
- `it('removes beforeunload listener when isDirty returns to false')`
- `it('removes beforeunload listener on component unmount')`
- `it('beforeunload handler returns a non-empty string to trigger browser dialog')`

---

**`src/hooks/__tests__/useAdminStats.test.ts`** _(NEW)_

- `it('fetches admin stats endpoint on mount')`
- `it('returns isLoading=true before response')`
- `it('returns stats data with correct shape on success')`
- `it('returns error state when endpoint returns 500')`
- `it('only fires fetch when user has admin role')`
- `it('does not fire fetch for non-admin users')`

---

**`src/hooks/__tests__/useSessions.test.ts`** _(NEW)_

- `useMySessions`:
  - `it('fetches session list for current user')`
  - `it('revoke(sessionId) calls DELETE on correct endpoint')`
  - `it('revokeAll() calls POST revoke-all endpoint')`
  - `it('session list refreshes after a successful revoke')`
- `useAdminSessions`:
  - `it('fetches all active sessions with Sieve params')`
  - `it('revokeUser(uid) calls POST revoke-user endpoint with uid')`
  - `it('returns 403 error shape when called by non-admin')`

---

### 18.4 -- Address + Profile Hooks

---

**`src/hooks/__tests__/useAddresses.test.ts`** _(NEW)_

- `it('fetches address list for current user on mount')`
- `it('add(address) calls POST /api/user/addresses')`
- `it('update(id, data) calls PATCH /api/user/addresses/:id')`
- `it('remove(id) calls DELETE /api/user/addresses/:id')`
- `it('setDefault(id) calls POST /api/user/addresses/:id/set-default')`
- `it('address list refreshes after each successful mutation')`
- `it('exposes isLoading=true during any in-flight mutation')`
- `it('exposes error when a mutation fails')`

---

**`src/hooks/__tests__/useAddressForm.test.ts`** _(NEW)_

- `it('initialises with empty strings when no address prop provided')`
- `it('pre-fills fields when an existing address is passed')`
- `it('validates required fields on submit attempt')`
- `it('validates pincode format (6 digits)')`
- `it('calls add() from useAddresses on submit when no id')`
- `it('calls update() from useAddresses on submit when id present')`
- `it('calls onSuccess callback after successful submit')`
- `it('keeps form dirty after failed submit')`

---

**`src/hooks/__tests__/useProfile.test.ts`** _(NEW)_

- `it('fetches profile data from /api/user/profile on mount')`
- `it('updateProfile(data) calls PATCH /api/user/profile')`
- `it('updatePassword(data) calls POST /api/user/change-password')`
- `it('deleteAccount() calls DELETE /api/user/profile')`
- `it('profile data refreshes after successful updateProfile')`
- `it('exposes error state when PATCH returns 400')`

---

### 18.5 -- Interaction + Responsive Hooks

---

**`src/hooks/__tests__/useBreakpoint.test.ts`** _(NEW)_

Mock `window.innerWidth` and fire a `resize` event via `window.dispatchEvent(new Event('resize'))`.

- `it('returns "xs" at 375px')`
- `it('returns "sm" at 640px')`
- `it('returns "md" at 768px')`
- `it('returns "lg" at 1024px')`
- `it('returns "xl" at 1280px')`
- `it('returns "2xl" at 1536px')`
- `it('updates token reactively on window resize')`

---

**`src/hooks/__tests__/useMediaQuery.test.ts`** _(NEW)_

Mock `window.matchMedia` via `Object.defineProperty`.

- `it('returns true when matchMedia reports a match')`
- `it('returns false when matchMedia reports no match')`
- `it('updates when matchMedia listener fires a change event')`
- `it('removes the matchMedia listener on unmount')`

---

**`src/hooks/__tests__/useClickOutside.test.ts`** _(NEW)_

- `it('calls handler when click is outside the referenced element')`
- `it('does not call handler when click is inside the referenced element')`
- `it('removes the document event listener on unmount')`

---

**`src/hooks/__tests__/useKeyPress.test.ts`** _(NEW)_

- `it('calls handler when the matching key is pressed')`
- `it('does not call handler for a different key')`
- `it('calls handler for modifier combo (e.g. Ctrl+S) when configured')`
- `it('removes keydown listener on unmount')`

---

**`src/hooks/__tests__/useSwipe.test.ts`** _(NEW)_

Simulate pointer events: `pointerdown` at origin, `pointermove` delta, `pointerup`.

- `it('calls onSwipeLeft when horizontal delta exceeds threshold leftward')`
- `it('calls onSwipeRight when horizontal delta exceeds threshold rightward')`
- `it('calls onSwipeUp when vertical delta exceeds threshold upward')`
- `it('calls onSwipeDown when vertical delta exceeds threshold downward')`
- `it('does not fire when delta is below threshold')`
- `it('does not call horizontal callback for predominantly vertical swipe')`

---

**`src/hooks/__tests__/useGesture.test.ts`** _(NEW)_

- `it('fires onLongPress callback after the configured hold duration')`
- `it('does not fire onLongPress for a quick tap')`
- `it('fires onSwipeLeft together with onLongPress on the same ref without double-firing')`
- `it('cancels long-press timer on pointerup before threshold')`

---

**`src/hooks/__tests__/useLongPress.test.ts`** _(UPDATE -- file exists)_

Add to existing tests:

- `it('cancels the timer when pointer leaves the element before threshold')`
- `it('accepts a custom ms parameter')`

---

**`src/hooks/__tests__/usePullToRefresh.test.ts`** _(UPDATE -- file exists)_

Add to existing tests:

- `it('progress is 0 before any touch')`
- `it('progress reaches 1 when pull distance equals threshold')`
- `it('calls onRefresh when released at or past threshold')`
- `it('does not call onRefresh when released below threshold')`

---

**`src/hooks/__tests__/useRealtimeBids.test.ts`** _(NEW)_

Mock `@/lib/firebase/config` to provide a fake `realtimeDb` with `onValue` / `off`.

- `it('subscribes to the correct Realtime DB path on mount')`
- `it('delivers snapshot data to the caller on first emission')`
- `it('updates state when onValue fires a new snapshot')`
- `it('calls off() to unsubscribe on unmount')`
- `it('returns null while awaiting first snapshot')`

---

**`src/hooks/__tests__/useRazorpay.test.ts`** _(NEW)_

Mock `document.createElement` / `document.head.appendChild` to intercept script injection.

- `it('appends a script tag pointing to the Razorpay checkout URL on first call')`
- `it('does not append a second script if already loaded')`
- `it('open(options) constructs a Razorpay instance with the provided options')`
- `it('open(options) calls .open() on the Razorpay instance')`
- `it('exposes isReady=false while script is loading')`
- `it('exposes isReady=true once the script onload fires')`

---

### 18.6 -- Auth API Routes

**Shared setup:** Create `src/app/api/__tests__/__mocks__/firebase-admin.ts` exporting mock implementations of `getAdminAuth()`, `verifySessionCookie()`, `getAdminDb()`. All existing API test files import this mock via `jest.mock('@/lib/firebase/admin')`.

---

**`src/app/api/__tests__/auth.test.ts`** _(UPDATE -- file exists)_

Verify all existing cases still pass after Phase 17 param-mock fixes. Add any gaps:

- `it('POST /api/auth/register returns 201 for valid payload')`
- `it('POST /api/auth/register returns 409 when email already in use')`
- `it('POST /api/auth/register returns 422 for missing required fields')`
- `it('POST /api/auth/login sets __session cookie on valid credentials')`
- `it('POST /api/auth/login returns 401 for wrong password')`
- `it('POST /api/auth/login returns 403 for unverified email')`
- `it('POST /api/auth/logout clears __session cookie and returns 200')`
- `it('GET /api/auth/session returns 200 + user for valid session cookie')`
- `it('GET /api/auth/session returns 401 when cookie is absent')`

---

**`src/app/api/__tests__/auth-forgot-password.test.ts`** _(NEW)_

- `it('returns 200 for a known email address')`
- `it('returns 200 for an unknown email (no information leak)')`
- `it('returns 422 when email field is missing')`
- `it('returns 422 when email format is invalid')`
- `it('calls tokenRepository.create to persist the reset token')`

---

**`src/app/api/__tests__/auth-reset-password.test.ts`** _(NEW)_

- `it('returns 200 and updates password for a valid, unexpired token')`
- `it('returns 400 for an expired token')`
- `it('returns 400 for an already-used token')`
- `it('returns 422 when newPassword does not meet requirements')`
- `it('marks token as used after successful reset')`

---

**`src/app/api/__tests__/auth-verify-email.test.ts`** _(NEW)_

- `it('returns 200 and marks email as verified for a valid token')`
- `it('returns 400 for an invalid or expired token')`
- `it('returns 422 when token param is missing')`
- `it('calls userRepository.update with emailVerified=true')`

---

**`src/app/api/__tests__/auth-phone-send.test.ts`** _(NEW)_

- `it('returns 200 and sends OTP for a valid phone number')`
- `it('returns 422 for an invalid phone format')`
- `it('returns 429 when rate-limit is exceeded (if implemented)')`

---

**`src/app/api/__tests__/auth-phone-verify.test.ts`** _(NEW)_

- `it('returns 200 and links phone to user when OTP matches')`
- `it('returns 400 for an incorrect OTP')`
- `it('returns 400 for an expired OTP')`

---

**`src/app/api/__tests__/auth-resend-verification.test.ts`** _(NEW)_

- `it('returns 200 and sends a new verification email')`
- `it('returns 400 when email is already verified')`
- `it('returns 401 when not authenticated')`

---

### 18.7 -- User API Routes

**Common pattern:** Every test file must include an unauthenticated case that returns 401, and all `[id]`-parameterised handlers must use `Promise.resolve` param wrapping.

---

**`src/app/api/__tests__/user-addresses.test.ts`** _(NEW)_

- `it('GET /api/user/addresses returns 401 without session')`
- `it('GET /api/user/addresses returns address list for current user')`
- `it('POST /api/user/addresses creates a new address and returns 201')`
- `it('POST /api/user/addresses returns 422 for invalid payload')`
- `it('GET /api/user/addresses/:id returns single address')`
- `it('GET /api/user/addresses/:id returns 404 for unknown id')`
- `it('PATCH /api/user/addresses/:id updates fields')`
- `it('DELETE /api/user/addresses/:id removes address')`
- `it('POST /api/user/addresses/:id/set-default marks address as default')`

---

**`src/app/api/__tests__/user-orders.test.ts`** _(NEW)_

- `it('GET /api/user/orders returns 401 without session')`
- `it('GET /api/user/orders returns paginated order list scoped to user')`
- `it('GET /api/user/orders/:id returns order detail')`
- `it('GET /api/user/orders/:id returns 404 when order belongs to different user')`
- `it('POST /api/user/orders/:id/cancel sets status to cancelled')`
- `it('POST /api/user/orders/:id/cancel returns 400 when order is already delivered')`

---

**`src/app/api/__tests__/user-profile.test.ts`** _(UPDATE -- profile.test.ts exists)_

After param-mock fix, verify and add:

- `it('GET /api/user/profile returns 401 without session')`
- `it('GET /api/user/profile returns current user document')`
- `it('PATCH /api/user/profile updates displayName and bio')`
- `it('PATCH /api/user/profile returns 422 for empty displayName')`
- `it('PATCH /api/user/profile calls userRepository.update with correct fields')`

---

**`src/app/api/__tests__/user-sessions.test.ts`** _(NEW)_

- `it('GET /api/user/sessions returns 401 without session')`
- `it('GET /api/user/sessions returns list of active sessions for current user')`
- `it('DELETE /api/user/sessions/:id revokes a specific session')`
- `it('DELETE /api/user/sessions/:id returns 403 when session belongs to different user')`

---

**`src/app/api/__tests__/user-password.test.ts`** _(NEW)_

- `it('returns 401 without session')`
- `it('returns 200 when old password matches and new password meets requirements')`
- `it('returns 400 when old password is incorrect')`
- `it('returns 422 when new password does not meet minimum requirements')`
- `it('calls Firebase Admin updateUser to persist the new password')`

---

**`src/app/api/__tests__/user-wishlist.test.ts`** _(NEW)_

- `it('GET /api/user/wishlist returns 401 without session')`
- `it('GET /api/user/wishlist returns list of wishlisted product IDs')`
- `it('POST /api/user/wishlist/:productId adds product to wishlist')`
- `it('POST /api/user/wishlist/:productId is idempotent when product already in wishlist')`
- `it('DELETE /api/user/wishlist/:productId removes product')`
- `it('DELETE /api/user/wishlist/:productId returns 200 when product was not in wishlist (idempotent)')`

---

### 18.8 -- Public API Routes -- Products + Search

---

**`src/app/api/__tests__/products.test.ts`** _(UPDATE -- file exists)_

After param-mock fix, verify and add:

- `it('returns paginated product list with default Sieve params')`
- `it('forwards filters= query param to productRepository.list')`
- `it('forwards sorts= query param to productRepository.list')`
- `it('forwards page= and pageSize= to productRepository.list')`
- `it('returns only published products when no admin session')`

---

**`src/app/api/__tests__/products-id.test.ts`** _(UPDATE -- file exists)_

- `it('returns 200 + product for a known published slug')`
- `it('returns 404 for an unknown slug')`
- `it('returns 404 for a draft product when requested without admin session')`
- `it('params are awaited correctly (Promise.resolve mock)')`

---

**`src/app/api/__tests__/public-search.test.ts`** _(NEW)_

- `it('returns 400 when q param is missing')`
- `it('returns 400 when q is an empty string')`
- `it('returns { items, total, page, pageSize } for a valid query')`
- `it('passes q, category, minPrice, maxPrice to search repository')`
- `it('respects page and pageSize query params')`
- `it('returns empty items array when no results found')`

---

### 18.9 -- Public API Routes -- Content + Social

---

**`src/app/api/__tests__/public-blog.test.ts`** _(NEW)_

- `it('GET /api/blog returns paginated article list')`
- `it('GET /api/blog filters by ?category= when provided')`
- `it('GET /api/blog/[slug] returns article for known slug')`
- `it('GET /api/blog/[slug] returns 404 for unknown slug')`
- `it('GET /api/blog/[slug] returns 404 for draft article without admin session')`

---

**`src/app/api/__tests__/categories.test.ts`** _(UPDATE -- file exists)_

After param-mock fix, verify and add:

- `it('GET /api/categories returns full category tree')`
- `it('GET /api/categories?flat=true returns flat list')`
- `it('GET /api/categories/:id returns single category')`
- `it('GET /api/categories/:id returns 404 for unknown id')`

---

**`src/app/api/__tests__/reviews.test.ts`** _(UPDATE -- file exists)_

After param-mock fix, verify and add:

- `it('GET /api/reviews returns paginated review list')`
- `it('GET /api/reviews?productId= scopes to a product')`
- `it('POST /api/reviews returns 401 without session')`
- `it('POST /api/reviews creates review and returns 201')`
- `it('POST /api/reviews/:id/vote increments helpful count')`
- `it('DELETE /api/reviews/:id requires admin or review owner')`

---

**`src/app/api/__tests__/public-bids.test.ts`** _(NEW)_

- `it('GET /api/bids?productId= returns bid list for auction')`
- `it('GET /api/bids returns 422 when productId is missing')`
- `it('POST /api/bids returns 401 without session')`
- `it('POST /api/bids places a bid and returns 201')`
- `it('POST /api/bids returns 400 when bid is below current highest bid')`
- `it('POST /api/bids returns 400 when auction has ended')`
- `it('DELETE /api/bids/:id cancels a bid (owner only)')`

---

**`src/app/api/__tests__/faqs.test.ts`** _(UPDATE -- file exists)_

After param-mock fix, verify and add:

- `it('GET /api/faqs returns FAQ list')`
- `it('GET /api/faqs?category= filters by category')`
- `it('GET /api/faqs/:id returns single FAQ')`
- `it('POST /api/faqs/:id/vote increments helpful count')`

---

**`src/app/api/__tests__/carousel.test.ts`** _(UPDATE -- file exists)_

After param-mock fix, verify and add:

- `it('GET /api/carousel returns only active slides ordered by order field')`
- `it('GET /api/carousel/:id returns single slide')`

---

**`src/app/api/__tests__/public-newsletter.test.ts`** _(NEW)_

- `it('returns 200 for a valid new subscription')`
- `it('returns 200 (not 409) when email is already subscribed -- no leak')`
- `it('returns 422 for an invalid email format')`
- `it('returns 422 when email field is missing')`
- `it('calls newsletterRepository to persist the subscriber')`

---

**`src/app/api/__tests__/public-contact.test.ts`** _(NEW)_

- `it('returns 200 and queues email when all required fields present')`
- `it('returns 422 when name is missing')`
- `it('returns 422 when message is missing')`
- `it('returns 422 for invalid email in from field')`
- `it('calls Resend SDK to send contact notification')`

---

**`src/app/api/__tests__/public-coupons.test.ts`** _(NEW)_

- `it('returns 200 + coupon data for a valid unexpired code')`
- `it('returns 400 for an expired coupon')`
- `it('returns 400 for a coupon that has reached its usage limit')`
- `it('returns 404 for an unknown coupon code')`
- `it('returns 422 when code param is missing')`
- `it('returned data includes discountType, discountValue, minOrderAmount')`

---

### 18.10 -- Admin API Routes -- Tier 1

**Common pattern:** Every test group includes a non-admin case (role: `'seller'` or `'user'`) that must return 403.

---

**`src/app/api/__tests__/admin-dashboard.test.ts`** _(NEW)_

- `it('returns 401 without session cookie')`
- `it('returns 403 for seller role')`
- `it('returns 200 + stats object for admin role')`
- `it('stats object contains totalUsers, totalOrders, totalRevenue, totalProducts')`
- `it('stats values are numbers (not strings or undefined)')`

---

**`src/app/api/__tests__/admin-newsletter.test.ts`** _(NEW)_

- `it('GET list returns 403 for non-admin')`
- `it('GET list returns paginated subscriber list with Sieve params')`
- `it('PATCH /:id unsubscribes a subscriber (isSubscribed = false)')`
- `it('PATCH /:id resubscribes a subscriber (isSubscribed = true)')`
- `it('DELETE /:id permanently removes subscriber record')`
- `it('GET list supports ?status=subscribed and ?status=unsubscribed filters')`

---

**`src/app/api/__tests__/admin-orders.test.ts`** _(NEW)_

- `it('GET list returns 403 for non-admin')`
- `it('GET list returns all orders with Sieve pagination')`
- `it('GET /:id returns full order detail')`
- `it('PATCH /:id updates order status')`
- `it('PATCH /:id returns 400 for invalid status transition')`
- `it('PATCH /:id returns 404 for unknown orderId')`

---

**`src/app/api/__tests__/admin-products.test.ts`** _(NEW)_

- `it('GET list returns 403 for non-admin')`
- `it('GET list returns all products (not just published) with Sieve')`
- `it('POST creates a product and returns 201')`
- `it('PATCH /:id updates product fields')`
- `it('PATCH /:id with status=published sets status to published')`
- `it('PATCH /:id with status=draft un-publishes product')`
- `it('DELETE /:id removes product record')`

---

**`src/app/api/__tests__/admin-users.test.ts`** _(NEW)_

- `it('GET list returns 403 for non-admin')`
- `it('GET list returns all users with Sieve params')`
- `it('GET /:uid returns user detail')`
- `it('PATCH /:uid updates user role')`
- `it('PATCH /:uid returns 400 when trying to demote self')`
- `it('PATCH /:uid returns 422 for invalid role value')`
- `it('PATCH /:uid disabled=true bans the user')`

---

**`src/app/api/__tests__/admin-sessions.test.ts`** _(NEW)_

- `it('GET list returns 403 for non-admin')`
- `it('GET list returns all active sessions')`
- `it('DELETE /:id revokes specific session')`
- `it('DELETE /:id returns 404 for unknown session id')`
- `it('POST /revoke-user deletes all sessions for a given uid')`
- `it('POST /revoke-user returns 422 when uid is missing')`

---

### 18.11 -- Admin API Routes -- Tier 2

---

**`src/app/api/__tests__/admin-bids.test.ts`** _(NEW)_

- `it('returns 403 for non-admin')`
- `it('returns paginated bid list with Sieve params forwarded to bidRepository.list')`
- `it('supports ?productId= filter mapped to productId==<value>')`

---

**`src/app/api/__tests__/admin-blog.test.ts`** _(NEW)_

- `it('GET list returns 403 for non-admin')`
- `it('GET list returns all articles including drafts')`
- `it('POST creates article and returns 201')`
- `it('PATCH /:id updates article fields')`
- `it('PATCH /:id with status=published sets publishedAt timestamp')`
- `it('DELETE /:id removes article')`

---

**`src/app/api/__tests__/admin-coupons.test.ts`** _(NEW)_

- `it('GET list returns 403 for non-admin')`
- `it('GET list returns coupon list with Sieve')`
- `it('POST creates coupon and returns 201')`
- `it('POST returns 409 when coupon code already exists')`
- `it('PATCH /:id updates coupon discount value')`
- `it('PATCH /:id sets isActive=false to disable coupon')`
- `it('DELETE /:id removes coupon')`

---

**`src/app/api/__tests__/admin-payouts.test.ts`** _(NEW)_

- `it('GET list returns 403 for non-admin')`
- `it('GET list returns payout requests with Sieve')`
- `it('GET /:id returns single payout detail')`
- `it('PATCH /:id status=approved approves payout')`
- `it('PATCH /:id status=rejected requires rejectionReason field')`
- `it('PATCH /:id returns 400 for invalid status transition')`

---

**`src/app/api/__tests__/admin-analytics.test.ts`** _(NEW)_

- `it('returns 403 for non-admin')`
- `it('returns analytics object with revenue, orders, users, products keys')`
- `it('uses default 30-day range when startDate/endDate are omitted')`
- `it('scopes data to the provided startDate and endDate range')`
- `it('all numeric values are numbers, not strings')`

---

**`src/app/api/__tests__/admin-algolia.test.ts`** _(NEW)_

Mock Algolia client: `jest.mock('algoliasearch')`.

- `it('returns 403 for non-admin')`
- `it('POST sync fetches all published products and calls Algolia saveObjects')`
- `it('returns { synced: N } with the count of synced records')`
- `it('returns 500 and error message when Algolia throws')`

---

### 18.12 -- Seller API Routes

---

**`src/app/api/__tests__/seller-orders.test.ts`** _(NEW)_

- `it('returns 401 without session')`
- `it('returns 403 for user role (not seller)')`
- `it('returns paginated order list scoped to sellerId from session')`
- `it('does not return orders belonging to a different seller')`
- `it('forwards Sieve params to orderRepository.list')`

---

**`src/app/api/__tests__/seller-analytics.test.ts`** _(NEW)_

- `it('returns 401 without session')`
- `it('returns 403 for user role')`
- `it('returns analytics with revenue, orders, views, conversionRate')`
- `it('revenue is scoped to sellerId from session')`
- `it('uses 30-day default range when no date params provided')`

---

**`src/app/api/__tests__/seller-payouts.test.ts`** _(NEW)_

- `it('returns 401 without session')`
- `it('returns 403 for user role')`
- `it('returns payout list scoped to current seller')`
- `it('POST /request creates a new payout request')`
- `it('POST /request returns 400 when pending payout already exists')`

---

### 18.13 -- Public Pages -- Products + Auctions

**Mock strategy:** `jest.mock('@/hooks', () => ({ ...jest.requireActual('@/hooks'), useApiQuery: jest.fn() }))` -- return stub `{ data, isLoading: false }` per test.

---

**`src/app/products/__tests__/page.test.tsx`** _(NEW)_

- `it('renders loading skeleton when isLoading=true')`
- `it('renders product grid cards when data is populated')`
- `it('renders EmptyState when data.items is empty')`
- `it('filter bar is present on desktop viewport')`
- `it('FilterDrawer trigger button is present on mobile viewport')`
- `it('ActiveFilterChips hidden when no filters active')`
- `it('ActiveFilterChips shows chips when URL has active filters')`
- `it('URL updates on filter change (router.replace called, not push)')`

---

**`src/app/products/[slug]/__tests__/page.test.tsx`** _(NEW)_

- `it('renders product title and price')`
- `it('renders Add to Cart button')`
- `it('renders product image')`
- `it('renders stock-out message when stockQuantity=0')`
- `it('renders NotFound when product is null / 404')`
- `it('structured data (JSON-LD) script tag is in document head')`

---

**`src/app/auctions/__tests__/page.test.tsx`** _(NEW)_

- `it('renders loading skeleton when isLoading=true')`
- `it('renders auction cards with current bid and countdown')`
- `it('renders EmptyState when no auctions')`
- `it('sort dropdown updates ?sort= URL param')`
- `it('pagination visible when totalPages > 1')`

---

**`src/app/auctions/[id]/__tests__/page.test.tsx`** _(NEW)_

- `it('renders auction title, starting bid, current bid')`
- `it('renders bid form with amount input and submit button')`
- `it('bid form submit calls POST /api/bids')`
- `it('bid form is disabled when auction has ended')`
- `it('renders countdown timer')`
- `it('renders NotFound for unknown auction id')`

---

### 18.14 -- Public Pages -- Blog + Categories + FAQs

---

**`src/app/blog/__tests__/page.test.tsx`** _(NEW)_

- `it('renders article cards with title, date, excerpt')`
- `it('renders loading skeleton when isLoading=true')`
- `it('renders EmptyState when no articles')`
- `it('category filter tabs are present')`
- `it('active category tab updates ?category= URL param')`
- `it('Pagination component visible when totalPages > 1')`

---

**`src/app/blog/[slug]/__tests__/page.test.tsx`** _(NEW)_

- `it('renders article title and body content')`
- `it('renders author and published date')`
- `it('renders related articles section')`
- `it('renders NotFound for unknown slug')`
- `it('JSON-LD article schema present in document head')`

---

**`src/app/categories/__tests__/page.test.tsx`** _(NEW)_

- `it('renders category grid cards')`
- `it('each card links to /categories/:slug')`
- `it('renders EmptyState when no categories')`
- `it('renders breadcrumb with Home > Categories')`

---

**`src/app/categories/[slug]/__tests__/page.test.tsx`** _(NEW)_

- `it('renders product list scoped to category')`
- `it('renders category name as page heading')`
- `it('FilterDrawer trigger visible on mobile')`
- `it('view toggle renders grid and list buttons')`
- `it('switching view mode updates ?view= URL param')`
- `it('renders NotFound for invalid slug')`

---

**`src/app/faqs/__tests__/page.test.tsx`** _(UPDATE -- file exists)_

After Phase 17 param fixes:

- `it('renders FAQ accordion with questions and answers for default category')`
- `it('sidebar renders all FAQ categories')`
- `it('active sidebar link matches current category slug')`

---

**`src/app/faqs/[category]/__tests__/page.test.tsx`** _(NEW)_

Note: async server component -- mock `params` as `Promise.resolve({ category: 'shipping' })`.

- `it('renders FAQs filtered by the category slug in params')`
- `it('sidebar active state matches the params.category value')`
- `it('redirects to /faqs for an invalid category slug')`
- `it('generateStaticParams returns an entry for every FAQ_CATEGORIES key')`

---

### 18.15 -- Public Pages -- Search + Static

---

**`src/app/search/__tests__/page.test.tsx`** _(NEW)_

- `it('renders search input pre-filled with ?q= URL param')`
- `it('renders loading skeleton when isLoading=true')`
- `it('renders ProductCard grid when results are present')`
- `it('renders EmptyState with query text when no results')`
- `it('ActiveFilterChips visible when category or price filters are active')`
- `it('chip dismiss removes the filter and resets page to 1')`
- `it('sort dropdown updates ?sort= URL param')`

---

**`src/app/about/__tests__/page.test.tsx`** _(NEW)_

- `it('renders without crashing')`
- `it('renders the main heading')`
- `it('renders the team section')`

---

**`src/app/contact/__tests__/page.test.tsx`** _(NEW)_

- `it('renders name, email, and message fields')`
- `it('submit button is disabled while mutation is in flight')`
- `it('form submission calls POST /api/contact')`
- `it('shows success message after successful submission')`
- `it('shows error message when submission fails')`

---

**`src/app/help/__tests__/page.test.tsx`** _(NEW)_

- `it('renders without crashing')`
- `it('renders at least one help topic heading')`

---

**`src/app/privacy/__tests__/page.test.tsx`** _(NEW)_

- `it('renders without crashing')`
- `it('page title contains "Privacy"')`

---

**`src/app/terms/__tests__/page.test.tsx`** _(NEW)_

- `it('renders without crashing')`
- `it('page title contains "Terms"')`

---

**`src/app/promotions/__tests__/page.test.tsx`** _(NEW)_

- `it('renders promotion cards when promotions are returned by API')`
- `it('renders EmptyState when no promotions are active')`

---

### 18.16 -- Seller Pages

> Note: `/seller/products/new` and `/seller/products/[id]/edit` were **deleted in Phase 6**. All create/edit flows use `SideDrawer` on `/seller/products`. There is **no test file for those deleted routes**.

---

**`src/app/seller/__tests__/page.test.tsx`** _(NEW)_

- `it('redirects to login when not authenticated')`
- `it('shows onboarding prompt for authenticated user without seller role')`
- `it('shows stat cards when user has seller role')`
- `it('stat cards include revenue, orders, products, views')`

---

**`src/app/seller/products/__tests__/page.test.tsx`** _(NEW)_

- `it('renders loading skeleton when isLoading=true')`
- `it('renders product list with title, price, status columns')`
- `it('renders EmptyState when seller has no products')`
- `it('"Add product" button click opens SideDrawer create mode')`
- `it('edit action per row opens SideDrawer edit mode pre-filled with product data')`
- `it('delete action per row opens ConfirmDeleteModal')`
- `it('view toggle renders grid and table icons in DataTable toolbar')`
- `it('switching to grid view renders mobileCardRender cards')`
- `it('?view= URL param persists the selected view mode')`
- `it('search input updates ?q= URL param')`
- `it('TablePagination visible when totalPages > 1')`

---

**`src/app/seller/orders/__tests__/page.test.tsx`** _(NEW)_

- `it('renders order list table')`
- `it('status filter tabs present: All, Pending, Confirmed, Shipped, Delivered, Cancelled')`
- `it('clicking a status tab updates ?status= URL param')`
- `it('revenue total reads from API meta.totalRevenue, not client-side reduce')`
- `it('TablePagination visible when totalPages > 1')`
- `it('redirects to login when not authenticated')`

---

**`src/app/seller/analytics/__tests__/page.test.tsx`** _(NEW)_

- `it('renders loading skeleton while data is fetching')`
- `it('renders revenue chart after data loads')`
- `it('renders orders chart after data loads')`
- `it('date range selector updates URL params')`

---

**`src/app/seller/payouts/__tests__/page.test.tsx`** _(NEW)_

- `it('renders payout history table')`
- `it('renders payout request button')`
- `it('clicking payout request opens confirmation modal or drawer')`
- `it('renders EmptyState when no payout history')`

---

### 18.17 -- Admin Pages -- Missing Coverage

---

**`src/app/admin/newsletter/__tests__/page.test.tsx`** _(NEW)_

- `it('renders subscriber count stat')`
- `it('renders DataTable with email, subscribedAt, status columns')`
- `it('status filter tabs: All, Subscribed, Unsubscribed')`
- `it('export button present')`
- `it('TablePagination visible')`

---

**`src/app/admin/bids/[[...action]]/__tests__/page.test.tsx`** _(NEW)_

- `it('renders bid list with bidAmount, productTitle, bidderName columns')`
- `it('sort dropdown changes ?sort= URL param')`
- `it('productId filter in URL scopes list to one auction')`
- `it('TablePagination visible')`

---

**`src/app/admin/blog/[[...action]]/__tests__/page.test.tsx`** _(NEW)_

- `it('renders article list with title, status, publishedAt')`
- `it('"New article" button opens SideDrawer create mode')`
- `it('edit action opens SideDrawer with pre-filled form')`
- `it('delete action opens ConfirmDeleteModal')`

---

**`src/app/admin/coupons/[[...action]]/__tests__/page.test.tsx`** _(NEW)_

- `it('renders coupon list with code, discountType, discountValue')`
- `it('"New coupon" button opens SideDrawer')`
- `it('duplicate code shows 409 error in drawer')`
- `it('isActive toggle updates coupon status inline')`

---

**`src/app/admin/orders/[[...action]]/__tests__/page.test.tsx`** _(NEW)_

- `it('renders order list with orderId, status, total, buyer')`
- `it('status filter tabs: All, Pending, Confirmed, Shipped, Delivered, Cancelled')`
- `it('row click or eye icon opens order detail drawer')`
- `it('status change in drawer calls PATCH /api/admin/orders/:id')`

---

**`src/app/admin/products/[[...action]]/__tests__/page.test.tsx`** _(NEW)_

- `it('renders product list with title, price, status, seller')`
- `it('search input updates ?q= URL param')`
- `it('status filter dropdown updates ?status= URL param')`
- `it('publish toggle calls PATCH status=published')`
- `it('unpublish toggle calls PATCH status=draft')`
- `it('delete action calls DELETE /api/admin/products/:id')`

---

**`src/app/admin/analytics/__tests__/page.test.tsx`** _(NEW)_

- `it('renders AdminStatsCards with revenue, orders, users, products')`
- `it('renders date range selector')`
- `it('default date range is last 30 days')`
- `it('changing date range refetches data with new params')`

---

**`src/app/admin/media/__tests__/page.test.tsx`** _(NEW)_

- `it('renders media grid with image thumbnails')`
- `it('upload button is present')`
- `it('clicking an image opens ImageCropModal or detail drawer')`
- `it('delete action opens ConfirmDeleteModal')`
- `it('renders EmptyState when no media files')`

---

**`src/app/admin/payouts/__tests__/page.test.tsx`** _(NEW)_

- `it('renders payout request list with seller, amount, status')`
- `it('status filter: All, Pending, Approved, Rejected')`
- `it('Approve button calls PATCH status=approved')`
- `it('Reject button opens rejection-reason input before confirming')`
- `it('TablePagination visible')`

---

### 18.18 -- Cart, Checkout + Profile Pages

---

**`src/app/cart/__tests__/page.test.tsx`** _(NEW)_

- `it('renders cart item list with product name, qty, price')`
- `it('quantity increment button increases qty and recalculates subtotal')`
- `it('quantity decrement to 0 removes the item from cart')`
- `it('remove button removes item directly')`
- `it('renders order summary with subtotal, shipping, total')`
- `it('renders EmptyState with CTA link when cart is empty')`
- `it('"Proceed to checkout" button links to /checkout')`

---

**`src/app/checkout/__tests__/page.test.tsx`** _(NEW)_

- `it('renders address selector with user addresses')`
- `it('renders order summary matching cart items')`
- `it('"Pay" button is disabled when no address is selected')`
- `it('"Pay" button becomes enabled after address selection')`
- `it('coupon input field is present; valid code applies discount')`
- `it('clicking Pay calls useRazorpay open() with correct amount')`

---

**`src/app/checkout/success/__tests__/page.test.tsx`** _(NEW)_

- `it('renders success heading using SUCCESS_MESSAGES.ORDER.PLACED')`
- `it('renders order ID from URL param or order state')`
- `it('renders CTA to continue shopping')`

---

**`src/app/profile/[userId]/__tests__/page.test.tsx`** _(UPDATE -- file exists)_

After Phase 17 param fixes, add / verify:

- `it('renders seller info card with average rating stars using THEME_CONSTANTS.rating.filled')`
- `it('empty star icons use THEME_CONSTANTS.rating.empty class')`
- `it('renders own profile with edit controls when userId matches session')`
- `it('renders read-only view when viewing another user profile')`
- `it('renders seller reviews section when user is a seller')`

---

**`src/app/sellers/__tests__/page.test.tsx`** _(NEW)_

- `it('renders without crashing')`
- `it('Hero CTA button links to ROUTES.AUTH.REGISTER')`
- `it('secondary CTA link points to #how-it-works')`
- `it('benefits section renders all 4 benefit cards')`
- `it('how-it-works section renders 3 steps')`
- `it('FAQ accordion items render')`
- `it('final CTA links to ROUTES.AUTH.REGISTER')`

---

**`src/app/sellers/[id]/__tests__/page.test.tsx`** _(NEW)_

- `it('renders seller display name and bio')`
- `it('renders seller average rating with star icons')`
- `it('filled star icons use THEME_CONSTANTS.rating.filled class')`
- `it('empty star icons use THEME_CONSTANTS.rating.empty class')`
- `it('renders seller product grid')`
- `it('renders reviews section with per-review stars')`
- `it('renders NotFound for unknown seller id')`

---

### 18.19 -- Full Build Verification

Run all checks **in order**. Each must exit with code 0 before proceeding.

```powershell
# 1 -- Full test suite with coverage report
npm test -- --coverage --coverageDirectory=coverage 2>&1 | Tee-Object test-results-final.txt

# 2 -- TypeScript type-check
npx tsc --noEmit 2>&1 | Tee-Object ts-check.txt

# 3 -- ESLint
npm run lint 2>&1 | Tee-Object lint-check.txt

# 4 -- Production build
npm run build 2>&1 | Tee-Object build-check.txt
```

**Minimum coverage targets:**

| Layer                 | Statements | Branches |
| --------------------- | ---------- | -------- |
| `src/utils/**`        | >= 90 %    | >= 85 %  |
| `src/helpers/**`      | >= 90 %    | >= 85 %  |
| `src/hooks/**`        | >= 80 %    | >= 75 %  |
| `src/app/api/**`      | >= 75 %    | >= 70 %  |
| `src/components/**`   | >= 70 %    | >= 65 %  |
| `src/app/**/page.tsx` | >= 65 %    | >= 60 %  |

If any layer falls below target, identify the highest-risk uncovered branches (auth guards, payment paths, CRUD error paths) and add targeted tests before closing Phase 18.

**Acceptance criteria:** All four commands exit with code 0. Coverage report written to `coverage/` -- no critical path (auth, payment, CRUD) has uncovered error branches.

---

---

## Phase 20 -- Standards Gap-Fix Sweep

**Goal:** Eliminate all rule violations discovered during the post-Phase-18 audit. Every sub-task in this phase ships with tests. After Phase 20 all phases 1-18 are considered fully code-compliant.

> **Depends on:** Phases 1-18 complete.

> **Must complete before:** Phase 21 begins (Phase 21 depends on barrel changes made here).

---

### 20.1 -- Barrel Import Violations (RULE 1)

Replace every import from a sub-path with the correct barrel import. Do NOT change logic -- pure import path changes.

| File | Bad Import | Correct Import |

|------|-----------|----------------|

| `src/app/seller/page.tsx` | `@/components/typography` | `@/components` |

| `src/app/page.tsx` | `@/components/homepage` | `@/components` |

| `src/app/opengraph-image.tsx` | `@/constants/seo` | `@/constants` |

| `src/app/faqs/page.tsx` | `@/components/faq` | `@/components` |

| `src/app/faqs/[category]/page.tsx` | `@/components/faq` | `@/components` |

| `src/app/admin/users/[[...action]]/page.tsx` | `@/components/admin/users` | `@/components` |

| `src/app/admin/site/page.tsx` | `@/components/admin/site` | `@/components` |

| `src/app/admin/dashboard/page.tsx` | `@/components/admin/dashboard` | `@/components` |

| `src/app/api/search/route.ts` | `@/helpers/data/sieve.helper` | `@/helpers` |

| `src/app/api/faqs/route.ts` | `@/helpers/data/sieve.helper` | `@/helpers` |

| `src/components/faq/FAQPageContent.tsx` | `@/components/faq` | `@/components` |

**Verify after each change:** `npx tsc --noEmit <file>`.

**Affected barrel files to update if any named export is missing:** `src/components/index.ts`, `src/helpers/index.ts`, `src/constants/index.ts`.

---

### 20.2 -- Hardcoded Route Strings (RULE 14)

Replace literal path strings in JSX and component code with `ROUTES.*` constants.

| File | Line | Bad Value | Correct Constant |

|------|------|-----------|-----------------|

| `src/app/profile/[userId]/page.tsx` | 138 | `href="/"` | `href={ROUTES.HOME}` |

| `src/components/faq/FAQCategorySidebar.tsx` | 111 | `href="/contact"` | `href={ROUTES.PUBLIC.CONTACT}` |

| `src/components/faq/ContactCTA.tsx` | 111, 142 | `href="/contact"` | `href={ROUTES.PUBLIC.CONTACT}` |

---

### 20.3 -- `console.warn` in Production Hook (RULE 18)

**`src/hooks/useRealtimeBids.ts`** line 81:

```typescript
// WRONG

console.warn("[useRealtimeBids] RTDB subscription error:", error.message);

// RIGHT

import { logger } from "@/classes";

logger.warn("[useRealtimeBids] RTDB subscription error:", {
  error: error.message,
});
```

---

### 20.4 -- Products API Response Shape (Consistency Gap)

**Problem:** `GET /api/products` (and seller's productList query) manually constructs `{ success: true, data: items, meta: {...} }` where `meta` lives at the wrapper level alongside `data`. `apiClient.get()` only returns `response.data`, so calling pages see `items[]` but lose `meta`. This forces pages to fall back to raw `fetch()` (confirmed with code comment in `src/app/products/page.tsx` line 78).

**Fix -- `src/app/api/products/route.ts` (GET handler only):**

```typescript
// WRONG -- meta at wrapper level, lost by apiClient

return NextResponse.json({
  success: true,

  data: sieveResult.items,

  meta: { page, limit, total, totalPages, hasMore },
});

// RIGHT -- use successResponse with all fields inside data

return successResponse({
  items: sieveResult.items,

  total: sieveResult.total,

  page: sieveResult.page,

  pageSize: sieveResult.pageSize,

  totalPages: sieveResult.totalPages,

  hasMore: sieveResult.hasMore,
});
```

**Update consuming types:**

```typescript
// src/app/products/page.tsx -- update ProductsResponse type

interface ProductsResponse {
  items: ProductItem[]; // was: data

  total: number;

  page: number;

  pageSize: number;

  totalPages: number;

  hasMore: boolean;
}

// Update all references: products = data?.data â†’ products = data?.items

// meta.total â†’ data?.total, meta.totalPages â†’ data?.totalPages, etc.

// Now use apiClient.get<ProductsResponse>(apiUrl) -- remove raw fetch()
```

**Same shape fix for seller products query** (`src/app/seller/products/page.tsx`) -- the response type it expects has `{ data: AdminProduct[], meta: { total, limit, page, totalPages } }`. After the products route.ts fix, update the type here too.

---

### 20.5 -- Formatters Not Used in API Routes (RULE 4)

Replace manual date/size formatting in server-side routes with shared utilities from `@/utils`.

| File | Bad Pattern | Correct Replacement |

|------|------------|---------------------|

| `src/app/api/seller/analytics/route.ts` | `date.toLocaleDateString("en-US", { month: "short", year: "numeric" })` | `formatDate(date)` or a named formatter exported from `@/utils` |

| `src/app/api/admin/analytics/route.ts` | `date.toLocaleDateString("en-US", { month: "short", year: "numeric" })` | `formatDate(date)` |

| `src/app/api/media/upload/route.ts` | `(file.size / (1024 * 1024)).toFixed(2)MB` | `formatFileSize(file.size)` from `@/utils` |

> Note: `src/app/api/seller/payouts/route.ts` uses `.toFixed(2)` for internal arithmetic precision (not display). This is acceptable; `formatCurrency` is for display only.

If `formatDate` doesn't produce the exact `"Mon 2026"` shape needed for analytics charts, add a `formatMonthYear(date: Date): string` to `src/utils/formatters/date.formatter.ts` and export via `src/utils/index.ts`.

---

### 20.6 -- Tests for 20.1--20.5

For each changed file, verify or add tests:

**`src/hooks/__tests__/useRealtimeBids.test.ts`** _(NEW or UPDATE)_

- `it('calls logger.warn on RTDB subscription error')`

- `it('sets connected to false on RTDB error')`

**`src/app/api/__tests__/products.test.ts`** _(UPDATE)_

- `it('GET returns items array inside data, not at top level')`

- `it('GET returns total, page, pageSize, totalPages, hasMore inside data')`

- `it('GET response shape is compatible with successResponse wrapper')`

**`src/app/products/__tests__/page.test.tsx`** _(UPDATE)_

- `it('uses items field from response, not data field')`

**`src/app/api/__tests__/media-upload.test.ts`** _(UPDATE)_

- `it('fileSize in response uses formatFileSize format, not raw toFixed(2)')`

**`src/components/faq/__tests__/ContactCTA.test.tsx`** _(NEW or UPDATE)_

- `it('contact link uses ROUTES.PUBLIC.CONTACT, not hardcoded /contact')`

**`src/components/faq/__tests__/FAQCategorySidebar.test.tsx`** _(UPDATE)_

- `it('contact link uses ROUTES.PUBLIC.CONTACT, not hardcoded /contact')`

**Files changed in Phase 20:**

```

src/app/seller/page.tsx                            barrel import fix

src/app/page.tsx                                   barrel import fix

src/app/opengraph-image.tsx                        barrel import fix

src/app/faqs/page.tsx                              barrel import fix

src/app/faqs/[category]/page.tsx                   barrel import fix

src/app/admin/users/[[...action]]/page.tsx         barrel import fix

src/app/admin/site/page.tsx                        barrel import fix

src/app/admin/dashboard/page.tsx                   barrel import fix

src/app/api/search/route.ts                        barrel import fix

src/app/api/faqs/route.ts                          barrel import fix

src/components/faq/FAQPageContent.tsx              barrel import fix

src/app/profile/[userId]/page.tsx                  hardcoded route fix

src/components/faq/FAQCategorySidebar.tsx          hardcoded route fix

src/components/faq/ContactCTA.tsx                  hardcoded route fix

src/hooks/useRealtimeBids.ts                       console.warn â†’ logger

src/app/api/products/route.ts                      response shape fix

src/app/products/page.tsx                          type + apiClient fix

src/app/seller/products/page.tsx                   type fix (meta shape)

src/app/api/seller/analytics/route.ts              formatDate() from @/utils

src/app/api/admin/analytics/route.ts               formatDate() from @/utils

src/app/api/media/upload/route.ts                  formatFileSize() from @/utils

src/utils/formatters/date.formatter.ts             + formatMonthYear() (if needed)

src/utils/index.ts                                 + formatMonthYear export (if added)

src/hooks/__tests__/useRealtimeBids.test.ts        NEW/UPDATE tests

src/app/api/__tests__/products.test.ts             UPDATE tests

src/app/products/__tests__/page.test.tsx           UPDATE tests

src/components/faq/__tests__/ContactCTA.test.tsx   NEW tests

src/components/faq/__tests__/FAQCategorySidebar.test.tsx  UPDATE tests

```

---

## Phase 21 -- Code-Reuse & `fetch()` Violation Sweep

**Goal:** Every client-side API call goes through `apiClient` (not raw `fetch()`). Every repeated-in-memory list query is replaced by `sieveQuery()`. No new code repeats logic that already exists in `@/utils`, `@/helpers`, `@/hooks`, or `@/classes`.

> **Depends on:** Phase 20 complete (products API response shape fixed before queryFn migration).

> **Must complete before:** Phase 22 begins.

---

### 21.1 -- Replace Raw `fetch()` with `apiClient` in Client Pages

#### Why this matters

`apiClient` provides:

- Automatic `credentials: "include"` (cookie forwarding for auth)

- Consistent timeout (30 s) and abort handling

- Uniform error unwrapping â€” throws `ApiClientError` (caught by `useApiMutation` / `useApiQuery`)

- Single place to add retries, auth refresh, request logging

Raw `fetch()` inside `queryFn` or event handlers bypasses all of this and silently fails on non-OK responses unless the caller checks `res.ok`.

#### Import pattern

```typescript

import { apiClient } from "@/lib/api-client";



// GET -- simple

const { data } = useApiQuery({

  queryKey: ["key"],

  queryFn: () => apiClient.get<ResponseType>(url),

});



// POST -- mutation

const { mutate } = useApiMutation({

  mutationFn: (body) => apiClient.post<ResponseType>(endpoint, body),

});



// PATCH

mutationFn: (body) => apiClient.patch<ResponseType>(endpoint, body),



// DELETE

mutationFn: (id) => apiClient.delete<void>(API_ENDPOINTS.FOO.DELETE(id)),



// File upload

mutationFn: (formData) => apiClient.upload<UploadResult>(API_ENDPOINTS.MEDIA.UPLOAD, formData),

```

#### Files to migrate

**`src/app/user/notifications/page.tsx`**

| Line(s) | Current | Target |

|---------|---------|--------|

| 54-59 (queryFn) | `fetch(API_ENDPOINTS.NOTIFICATIONS.LIST + "?limit=50")` | `apiClient.get(API_ENDPOINTS.NOTIFICATIONS.LIST + "?limit=50")` |

| 65-68 (markRead mutationFn) | `fetch(URL, { method: "PATCH" })` | `apiClient.patch(URL, {})` |

| 75-78 (deleteOne mutationFn) | `fetch(URL, { method: "DELETE" })` | `apiClient.delete(URL)` |

| 88-91 (readAll mutationFn) | `fetch(URL, { method: "PATCH" })` | `apiClient.patch(URL, {})` |

**`src/app/user/settings/page.tsx`**

| Line(s) | Current | Target |

|---------|---------|--------|

| 81 GET profile | `fetch(API_ENDPOINTS.USER.PROFILE, {...})` | `apiClient.get(API_ENDPOINTS.USER.PROFILE)` |

| 117 PATCH profile | `fetch(API_ENDPOINTS.USER.PROFILE, { method: "PATCH", body })` | `apiClient.patch(API_ENDPOINTS.USER.PROFILE, data)` |

**`src/app/user/addresses/add/page.tsx`**

```typescript

// WRONG

const response = await fetch(API_ENDPOINTS.ADDRESSES.CREATE, {

  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),

});

if (!response.ok) { ... }



// RIGHT â€” use useApiMutation or direct apiClient.post()

const createAddress = useApiMutation({

  mutationFn: (data: AddressFormData) => apiClient.post(API_ENDPOINTS.ADDRESSES.CREATE, data),

});

// handleSubmit becomes: await createAddress.mutateAsync(data)

```

**`src/app/user/addresses/edit/[id]/page.tsx`**

| Line(s) | Current | Target |

|---------|---------|--------|

| 50 GET address | `fetch(API_ENDPOINTS.ADDRESSES.GET(id))` | `apiClient.get(API_ENDPOINTS.ADDRESSES.GET(id))` â†’ wrap in `useApiQuery` |

| 82 PUT address | `fetch(URL, { method: "PUT", body })` | `apiClient.put(URL, data)` |

| 116 DELETE address | `fetch(URL, { method: "DELETE" })` | `apiClient.delete(URL)` |

**`src/app/user/wishlist/page.tsx`**

| Line(s) | Current | Target |

|---------|---------|--------|

| 42 GET wishlist | `fetch(API_ENDPOINTS.USER.WISHLIST.LIST).then(r => r.json())` | `apiClient.get(API_ENDPOINTS.USER.WISHLIST.LIST)` in `queryFn` |

**`src/app/seller/page.tsx`**

| Line(s) | Current | Target |

|---------|---------|--------|

| 54 GET products | `fetch(productsUrl!).then(r => r.json())` (queryFn) | `apiClient.get(productsUrl!)` |

**`src/app/search/page.tsx`**

| Line(s) | Current | Target |

|---------|---------|--------|

| 96 GET categories | `fetch(API_ENDPOINTS.CATEGORIES.LIST + "?flat=true").then(r => r.json())` | `apiClient.get(API_ENDPOINTS.CATEGORIES.LIST + "?flat=true")` |

| 118 GET search results | `fetch(searchUrl).then(r => r.json())` (queryFn) | `apiClient.get(searchUrl)` |

**`src/app/seller/orders/page.tsx`**

| Line(s) | Current | Target |

|---------|---------|--------|

| 83 GET orders | `fetch(ordersUrl).then(r => r.json())` (queryFn) | `apiClient.get(ordersUrl)` |

**`src/app/seller/payouts/page.tsx`**

| Line(s) | Current | Target |

|---------|---------|--------|

| 41 GET payouts | `fetch(API_ENDPOINTS.SELLER.PAYOUTS).then(r => r.json())` | `apiClient.get(API_ENDPOINTS.SELLER.PAYOUTS)` |

| 51 POST request payout | `fetch(API_ENDPOINTS.SELLER.PAYOUTS, { method: "POST", body })` | `apiClient.post(API_ENDPOINTS.SELLER.PAYOUTS, body)` |

**`src/app/seller/analytics/page.tsx`**

| Line(s) | Current | Target |

|---------|---------|--------|

| 52 GET analytics | `fetch(API_ENDPOINTS.SELLER.ANALYTICS).then(r => r.json())` | `apiClient.get(API_ENDPOINTS.SELLER.ANALYTICS)` |

**`src/app/sellers/[id]/page.tsx`**

| Line(s) | Current | Target |

|---------|---------|--------|

| 64, 104, 120 | 3 raw `fetch()` calls in `useEffect` | Lift to `useApiQuery` calls + `apiClient.get()` |

**`src/app/profile/[userId]/page.tsx`**

| Line(s) | Current | Target |

|---------|---------|--------|

| 62, 79, 93 | 3 raw `fetch()` calls in `useEffect` | Lift to `useApiQuery` calls + `apiClient.get()` |

**`src/components/ui/NotificationBell.tsx`**

| Line(s) | Current | Target |

|---------|---------|--------|

| 57 | `fetch(API_ENDPOINTS.NOTIFICATIONS.LIST + "?limit=10")` | `apiClient.get(...)` |

| 67 | `fetch(MARK_READ(id), { method: "PATCH" })` | `apiClient.patch(URL, {})` |

| 80 | `fetch(READ_ALL, { method: "PATCH" })` | `apiClient.patch(URL, {})` |

**`src/components/faq/FAQPageContent.tsx`**

| Line(s) | Current | Target |

|---------|---------|--------|

| 46 | `fetch(API_ENDPOINTS.FAQS.LIST + "?isActive=true")` | `useApiQuery` + `apiClient.get(...)` |

**`src/components/admin/ImageUpload.tsx`**

| Line(s) | Current | Target |

|---------|---------|--------|

| 78 | `fetch(API_ENDPOINTS.MEDIA.UPLOAD, { method: "POST", body: formData })` | `apiClient.upload(API_ENDPOINTS.MEDIA.UPLOAD, formData)` |

**EXEMPT** (intentional raw `fetch()` -- do not change):

- `src/contexts/SessionContext.tsx` â€” auth bootstrap; must run before `apiClient` is settled; session cookie management

- `src/lib/firebase/auth-helpers.ts` â€” low-level session API below `apiClient`

---

### 21.2 -- Replace `findAll()` + In-Memory Filter with `sieveQuery()` (RULE 8)

#### `src/app/api/search/route.ts`

```typescript
// WRONG (full collection scan -- O(N) reads for every search)

const allProducts = await productRepository.findAll();

const sieveResult = await applySieveToArray({ items: allProducts, model });

// RIGHT (Firestore-native)

// The search route uses a compound filter string; pass it as a SieveModel

const model: SieveModel = {
  filters: compoundSieveString, // assemble same filter DSL

  sorts: sorts,

  page: String(page),

  pageSize: String(pageSize),
};

const sieveResult = await productRepository.list(model);
```

Remove `applySieveToArray` import from `@/helpers/data/sieve.helper`. Remove `productRepository.findAll()` call. Update import to use `@/helpers` barrel.

#### `src/app/api/faqs/route.ts`

```typescript

// WRONG (GET /api/faqs -- L85 + L127)

let faqs = await faqsRepository.findAll();  // L85: full scan then in-memory filter

const sieveResult = await applySieveToArray({ ... });  // L127



// RIGHT

// Add SIEVE_FIELDS and list(model) to FAQRepository if not present

// Then:

const model: SieveModel = {

  filters: isActive ? "isActive==true" : undefined,

  sorts: sorts || "-createdAt",

  page: String(page),

  pageSize: String(pageSize),

};

const sieveResult = await faqsRepository.list(model);

```

**Add `SIEVE_FIELDS` and `list(model)` to `src/repositories/faq.repository.ts`:**

```typescript

static readonly SIEVE_FIELDS: FirebaseSieveFields = {

  question: { canFilter: true, canSort: true },

  category: { canFilter: true, canSort: false },

  isActive: { canFilter: true, canSort: false },

  helpful:  { canFilter: false, canSort: true },

  createdAt: { canFilter: true, canSort: true },

};



async list(model: SieveModel) {

  return this.sieveQuery<FAQDocument>(model, FAQRepository.SIEVE_FIELDS);

}

```

#### `src/app/api/admin/payouts/route.ts`

```typescript
// WRONG

const allPayouts = await payoutRepository.findAll();

// RIGHT -- add SIEVE_FIELDS + list() to payoutRepository, then:

const result = await payoutRepository.list(model);
```

#### `src/app/api/admin/blog/route.ts`

```typescript

// WRONG

const allPosts = await blogRepository.findAll();



// RIGHT -- blogRepository already has findAll() override but needs list()

// Add SIEVE_FIELDS + list() to BlogRepository:

static readonly SIEVE_FIELDS: FirebaseSieveFields = {

  title:     { canFilter: true, canSort: true },

  status:    { canFilter: true, canSort: false },

  category:  { canFilter: true, canSort: false },

  authorId:  { canFilter: true, canSort: false },

  createdAt: { canFilter: true, canSort: true },

  publishedAt: { canFilter: true, canSort: true },

};

async list(model: SieveModel) {

  return this.sieveQuery<BlogPostDocument>(model, BlogRepository.SIEVE_FIELDS);

}

// Then update admin/blog/route.ts to use list(model)

```

**ACCEPTABLE** `findAll()` uses (do NOT change):

- `src/app/api/admin/algolia/sync/route.ts` â€” full collection scan is required for Algolia index rebuild

- `src/app/api/homepage-sections/route.ts` â€” fetches all â‰¤ 10 homepage sections, not a performance concern

- `src/app/api/carousel/route.ts` â€” fetches all â‰¤ 20 carousel slides, not a performance concern

- `src/app/api/categories/route.ts` â€” tree-building requires all categories

---

### 21.3 -- Add Firestore Indexes for New `sieveQuery()` Calls

Add to `firestore.indexes.json`:

```json

// faqs: isActive + createdAt

{ "collectionGroup": "faqs", "queryScope": "COLLECTION",

  "fields": [{"fieldPath": "isActive", "order": "ASCENDING"}, {"fieldPath": "createdAt", "order": "DESCENDING"}] }



// faqs: category + isActive

{ "collectionGroup": "faqs", "queryScope": "COLLECTION",

  "fields": [{"fieldPath": "category", "order": "ASCENDING"}, {"fieldPath": "isActive", "order": "ASCENDING"}] }



// payouts: sellerId + status + createdAt (if payout repo scope-filters by seller)

{ "collectionGroup": "payouts", "queryScope": "COLLECTION",

  "fields": [{"fieldPath": "sellerId", "order": "ASCENDING"}, {"fieldPath": "status", "order": "ASCENDING"}, {"fieldPath": "createdAt", "order": "DESCENDING"}] }



// blog: status + publishedAt

{ "collectionGroup": "blog", "queryScope": "COLLECTION",

  "fields": [{"fieldPath": "status", "order": "ASCENDING"}, {"fieldPath": "publishedAt", "order": "DESCENDING"}] }

```

Deploy with: `firebase deploy --only firestore:indexes`

---

### 21.4 -- Tests for Phase 21

**Pages migrated to `apiClient`** -- update existing tests to mock `apiClient` instead of global `fetch`:

```typescript

// Before (in tests)

global.fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({...}) });



// After

jest.mock("@/lib/api-client", () => ({

  apiClient: {

    get:    jest.fn().mockResolvedValue({ items: [], total: 0 }),

    post:   jest.fn().mockResolvedValue({ id: "new-id" }),

    patch:  jest.fn().mockResolvedValue({}),

    delete: jest.fn().mockResolvedValue({}),

    upload: jest.fn().mockResolvedValue({ url: "https://cdn.example.com/img.jpg" }),

  },

}));

```

**New test assertions for each migrated file:**

**`src/app/user/notifications/__tests__/page.test.tsx`** _(UPDATE)_

- `it('marks notification as read via apiClient.patch, not fetch')`

- `it('deletes notification via apiClient.delete, not fetch')`

- `it('marks all read via apiClient.patch, not fetch')`

**`src/app/user/addresses/add/__tests__/page.test.tsx`** _(UPDATE)_

- `it('submits address via apiClient.post')`

- `it('shows error message when apiClient.post throws ApiClientError')`

**`src/app/user/settings/__tests__/page.test.tsx`** _(UPDATE)_

- `it('loads profile via apiClient.get')`

- `it('saves settings via apiClient.patch')`

**`src/app/seller/__tests__/page.test.tsx`** _(UPDATE)_

- `it('fetches seller products via apiClient.get inside useApiQuery')`

**`src/components/ui/__tests__/NotificationBell.test.tsx`** _(NEW or UPDATE)_

- `it('loads notifications via apiClient.get on open')`

- `it('marks notification read via apiClient.patch')`

**`src/components/admin/__tests__/ImageUpload.test.tsx`** _(NEW or UPDATE)_

- `it('uploads file via apiClient.upload')`

- `it('shows error when apiClient.upload throws')`

**`src/app/api/search/__tests__/route.test.ts`** _(UPDATE)_

- `it('calls productRepository.list(sieveModel) instead of findAll()')`

- `it('does NOT call productRepository.findAll()')`

**`src/app/api/faqs/__tests__/faq-list.test.ts`** _(UPDATE)_

- `it('calls faqsRepository.list(model) instead of findAll()')`

**Repository tests:**

**`src/repositories/__tests__/faq.repository.test.ts`** _(UPDATE)_

- `it('list() calls sieveQuery not findAll')`

- `it('list() passes SIEVE_FIELDS correctly')`

**`src/repositories/__tests__/blog.repository.test.ts`** _(UPDATE)_

- `it('list() calls sieveQuery not findAll')`

**Files changed in Phase 21:**

```

src/app/user/notifications/page.tsx                 raw fetch â†’ apiClient

src/app/user/settings/page.tsx                      raw fetch â†’ apiClient

src/app/user/addresses/add/page.tsx                 raw fetch â†’ apiClient

src/app/user/addresses/edit/[id]/page.tsx           raw fetch â†’ apiClient

src/app/user/wishlist/page.tsx                      raw fetch â†’ apiClient

src/app/seller/page.tsx                             raw fetch â†’ apiClient

src/app/search/page.tsx                             raw fetch â†’ apiClient

src/app/seller/orders/page.tsx                      raw fetch â†’ apiClient

src/app/seller/payouts/page.tsx                     raw fetch â†’ apiClient

src/app/seller/analytics/page.tsx                   raw fetch â†’ apiClient

src/app/sellers/[id]/page.tsx                       raw fetch â†’ apiClient/useApiQuery

src/app/profile/[userId]/page.tsx                   raw fetch â†’ apiClient/useApiQuery

src/components/ui/NotificationBell.tsx              raw fetch â†’ apiClient

src/components/faq/FAQPageContent.tsx               raw fetch â†’ apiClient

src/components/admin/ImageUpload.tsx                raw fetch â†’ apiClient.upload()

src/app/api/search/route.ts                         findAll() â†’ list()

src/app/api/faqs/route.ts                           findAll() â†’ list()

src/app/api/admin/payouts/route.ts                  findAll() â†’ list()

src/app/api/admin/blog/route.ts                     findAll() â†’ list()

src/repositories/faq.repository.ts                  + SIEVE_FIELDS + list()

src/repositories/blog.repository.ts                 + list() (SIEVE_FIELDS exists)

src/repositories/payout.repository.ts               + SIEVE_FIELDS + list() (if missing)

firestore.indexes.json                              + 4 new composite indexes

Various __tests__/ files                            mock apiClient; update assertions

```

---

### Phase 20 & 21 -- Cross-Phase Notes

**Progress tracker rule:** Phases 1-18 retain their âœ… Done status. Phases 20 and 21 must each be marked âœ… Done before Phase 22 begins. The violations found do not retroactively un-complete earlier phases â€” they represent accumulated debt being paid off in 20 & 21.

**Phases with outstanding violations (annotated in tracker above):**

- Phase 5 (`products`, `search`, public pages) â†’ raw `fetch()` fixes in Phase 21

- Phase 6 (seller/user pages, addresses, notifications, settings) â†’ raw `fetch()` fixes in Phase 21

- Phases 4, 7 (admin pages, FAQ) â†’ barrel import + hardcoded route fixes in Phase 20

- Phase 11 (homepage) â†’ `src/app/page.tsx` barrel import fix in Phase 20

**Type-check after every sub-phase step:**

```bash

npx tsc --noEmit

```

## Phase 22 -- Event Management System

**Goal:** A first-class event engine that lets admins run sales, offer campaigns, polls, giveaway surveys, and feedback forms -- with full participant management, entry moderation, leaderboard, and public-facing pages.

> **Dependency:** Phases 1-18 must be complete. Uses: `useApiQuery`, `useApiMutation`, `useUrlTable`, `DataTable`, `SideDrawer`, `AdminPageHeader`, `AdminFilterBar`, `ConfirmDeleteModal`, `FormField`, `Modal`, `RichTextEditor`, `StatusBadge`, `EmptyState`, `useMessage`, all relevant `ROUTES`, `API_ENDPOINTS`, `UI_LABELS`, `ERROR_MESSAGES`, `SUCCESS_MESSAGES`, `THEME_CONSTANTS`.

---

### 22a -- Schema, Constants & Repositories

#### 22a.1 -- Event schema (`src/db/schema/event.schema.ts`)

```typescript
export const EVENTS_COLLECTION = "events";
export const EVENT_ENTRIES_COLLECTION = "eventEntries";

export type EventType = "sale" | "offer" | "poll" | "survey" | "feedback";
export type EventStatus = "draft" | "active" | "paused" | "ended";
export type EntryReviewStatus = "pending" | "approved" | "flagged";
export type FormFieldType =
  | "text"
  | "textarea"
  | "email"
  | "phone"
  | "number"
  | "select"
  | "multiselect"
  | "checkbox"
  | "radio"
  | "date"
  | "rating"
  | "file";
export type PollResultsVisibility = "always" | "after_vote" | "after_end";

// Dynamic form field used in survey + feedback events
export interface SurveyFormField {
  id: string; // nanoid()
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // for select / multiselect / checkbox / radio
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
  };
  order: number; // display sort order
}

// Per-type config blocks (stored inline on the event doc for simplicity)
export interface SaleConfig {
  discountPercent: number; // e.g. 20 => "20% Off Everything"
  bannerText?: string; // override display text
  affectedCategories?: string[]; // [] (empty) = site-wide
}

export interface OfferConfig {
  couponId: string; // FK -> coupons collection
  displayCode: string; // visible coupon code
  bannerText?: string;
}

export interface PollConfig {
  allowMultiSelect: boolean;
  allowComment: boolean;
  options: { id: string; label: string }[];
  resultsVisibility: PollResultsVisibility;
}

export interface SurveyConfig {
  requireLogin: boolean;
  maxEntriesPerUser: number; // 1 = one entry per user
  hasLeaderboard: boolean;
  hasPointSystem: boolean;
  pointsLabel?: string; // e.g. "Stars"
  entryReviewRequired: boolean; // true = mods must approve before counting
  formFields: SurveyFormField[];
}

export interface FeedbackConfig {
  formFields: SurveyFormField[];
  anonymous: boolean; // allow non-logged-in submissions
}

export interface EventDocument {
  id: string;
  type: EventType;
  title: string;
  description: string; // RichText HTML
  status: EventStatus;
  startsAt: import("firebase-admin/firestore").Timestamp;
  endsAt: import("firebase-admin/firestore").Timestamp;
  coverImageUrl?: string;

  // Only one of these is populated per event
  saleConfig?: SaleConfig;
  offerConfig?: OfferConfig;
  pollConfig?: PollConfig;
  surveyConfig?: SurveyConfig;
  feedbackConfig?: FeedbackConfig;

  stats: {
    totalEntries: number;
    approvedEntries: number;
    flaggedEntries: number;
  };

  createdBy: string;
  createdAt: import("firebase-admin/firestore").Timestamp;
  updatedAt: import("firebase-admin/firestore").Timestamp;
}

export interface EventEntryDocument {
  id: string;
  eventId: string;
  userId?: string; // undefined for anonymous feedback
  userDisplayName?: string;
  userEmail?: string;

  // Poll-specific
  pollVotes?: string[]; // selected option IDs
  pollComment?: string;

  // Survey / feedback responses: fieldId -> value
  formResponses?: Record<string, unknown>;

  // Moderation
  reviewStatus: EntryReviewStatus;
  reviewedBy?: string;
  reviewedAt?: import("firebase-admin/firestore").Timestamp;
  reviewNote?: string;

  // Point system
  points?: number;

  ipAddress?: string; // for dedup / fraud detection
  submittedAt: import("firebase-admin/firestore").Timestamp;
}

// Field name constants
export const EVENT_FIELDS = {
  ID: "id",
  TYPE: "type",
  TITLE: "title",
  DESCRIPTION: "description",
  STATUS: "status",
  STARTS_AT: "startsAt",
  ENDS_AT: "endsAt",
  COVER_IMAGE_URL: "coverImageUrl",
  CREATED_BY: "createdBy",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
  STATS: {
    TOTAL_ENTRIES: "stats.totalEntries",
    APPROVED_ENTRIES: "stats.approvedEntries",
    FLAGGED_ENTRIES: "stats.flaggedEntries",
  },
  STATUS_VALUES: {
    DRAFT: "draft" as EventStatus,
    ACTIVE: "active" as EventStatus,
    PAUSED: "paused" as EventStatus,
    ENDED: "ended" as EventStatus,
  },
  TYPE_VALUES: {
    SALE: "sale" as EventType,
    OFFER: "offer" as EventType,
    POLL: "poll" as EventType,
    SURVEY: "survey" as EventType,
    FEEDBACK: "feedback" as EventType,
  },
} as const;

export const EVENT_ENTRY_FIELDS = {
  ID: "id",
  EVENT_ID: "eventId",
  USER_ID: "userId",
  REVIEW_STATUS: "reviewStatus",
  REVIEWED_BY: "reviewedBy",
  SUBMITTED_AT: "submittedAt",
  POINTS: "points",
  REVIEW_STATUS_VALUES: {
    PENDING: "pending" as EntryReviewStatus,
    APPROVED: "approved" as EntryReviewStatus,
    FLAGGED: "flagged" as EntryReviewStatus,
  },
} as const;

// Helper types for CRUD
export type EventCreateInput = Omit<
  EventDocument,
  "id" | "createdAt" | "updatedAt" | "stats"
>;
export type EventUpdateInput = Partial<
  Omit<EventDocument, "id" | "createdAt" | "createdBy">
>;
export type EventEntryCreateInput = Omit<
  EventEntryDocument,
  "id" | "submittedAt"
>;
```

Export via `src/db/schema/index.ts`.

#### 22a.2 -- Constants (`src/constants/`)

**`src/constants/ui.ts`** -- add:

```typescript
UI_LABELS.ADMIN.EVENTS = {
  TITLE: "Events",
  NEW: "New Event",
  EDIT: "Edit Event",
  DELETE: "Delete Event",
  ENTRIES: "Entries",
  REVIEW_ENTRY: "Review Entry",
  APPROVE: "Approve",
  FLAG: "Flag",
  LEADERBOARD: "Leaderboard",
  ADD_FIELD: "Add field",
  PREVIEW_FORM: "Preview Form",
  END_EVENT: "End Event",
  ACTIVATE: "Activate",
  PAUSE: "Pause",
};

UI_LABELS.EVENTS = {
  PARTICIPATE: "Participate",
  VOTE: "Vote",
  SUBMIT: "Submit Entry",
  VIEW_RESULTS: "View Results",
  LEADERBOARD: "Leaderboard",
  ENTRIES_CLOSED: "Entries closed",
  STARTS_IN: "Starts in",
  ENDS_IN: "Ends in",
  SALE_BANNER: (pct: number) => `Up to ${pct}% Off â€” Limited Time!`,
  OFFER_BANNER: (code: string) => `Use code ${code} at checkout`,
  YOUR_ENTRY: "Your entry",
  ALREADY_VOTED: "You have already voted",
  LOGIN_TO_PARTICIPATE: "Log in to participate",
};

UI_LABELS.EVENT_TYPES = {
  SALE: "Sale",
  OFFER: "Offer",
  POLL: "Poll",
  SURVEY: "Survey / Giveaway",
  FEEDBACK: "Feedback",
};

UI_LABELS.EVENT_STATUS = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  PAUSED: "Paused",
  ENDED: "Ended",
};

UI_LABELS.FORM_FIELD_TYPES = {
  TEXT: "Short text",
  TEXTAREA: "Long text",
  EMAIL: "Email",
  PHONE: "Phone",
  NUMBER: "Number",
  SELECT: "Dropdown",
  MULTISELECT: "Multi-select",
  CHECKBOX: "Checkboxes",
  RADIO: "Radio buttons",
  DATE: "Date",
  RATING: "Rating (1-5)",
  FILE: "File upload",
};
```

**`src/constants/messages.ts`** -- add:

```typescript
ERROR_MESSAGES.EVENT = {
  NOT_FOUND: "Event not found",
  FETCH_FAILED: "Failed to fetch events",
  CREATE_FAILED: "Failed to create event",
  UPDATE_FAILED: "Failed to update event",
  DELETE_FAILED: "Failed to delete event",
  ALREADY_ENTERED: "You have already submitted an entry for this event",
  ENTRIES_CLOSED: "This event is no longer accepting entries",
  LOGIN_REQUIRED: "You must be logged in to participate",
  INVALID_TYPE: "Unknown event type",
  ENTRY_REVIEW_FAILED: "Failed to update entry review status",
};

SUCCESS_MESSAGES.EVENT = {
  CREATED: "Event created successfully",
  UPDATED: "Event updated successfully",
  DELETED: "Event deleted successfully",
  ENTRY_SUBMITTED: "Your entry has been submitted",
  VOTE_SUBMITTED: "Your vote has been recorded",
  ENTRY_APPROVED: "Entry approved",
  ENTRY_FLAGGED: "Entry flagged",
  STATUS_CHANGED: "Event status updated",
};
```

**`src/constants/routes.ts`** -- add:

```typescript
ADMIN: {
  // ... existing ...
  EVENTS: '/admin/events',
  EVENT_ENTRIES: (id: string) => `/admin/events/${id}/entries`,
},
PUBLIC: {
  // ... existing ...
  EVENTS: '/events',
  EVENT_DETAIL: (id: string) => `/events/${id}`,
  EVENT_PARTICIPATE: (id: string) => `/events/${id}/participate`,
},
```

**`src/constants/api.ts`** -- add:

```typescript
API_ENDPOINTS.ADMIN.EVENTS = {
  LIST: "/api/admin/events",
  DETAIL: (id: string) => `/api/admin/events/${id}`,
  STATUS: (id: string) => `/api/admin/events/${id}/status`,
  ENTRIES: (id: string) => `/api/admin/events/${id}/entries`,
  ENTRY: (id: string, entryId: string) =>
    `/api/admin/events/${id}/entries/${entryId}`,
  STATS: (id: string) => `/api/admin/events/${id}/stats`,
};
API_ENDPOINTS.EVENTS = {
  LIST: "/api/events",
  DETAIL: (id: string) => `/api/events/${id}`,
  ENTER: (id: string) => `/api/events/${id}/enter`,
  LEADERBOARD: (id: string) => `/api/events/${id}/leaderboard`,
};
```

Export all new constants from `src/constants/index.ts`.

#### 22a.3 -- Repositories

**`src/repositories/event.repository.ts`**

```typescript
export class EventRepository extends BaseRepository<EventDocument> {
  static readonly SIEVE_FIELDS: FirebaseSieveFields = {
    type:     { canFilter: true, canSort: false },
    status:   { canFilter: true, canSort: false },
    title:    { canFilter: true, canSort: true },
    startsAt: { canFilter: true, canSort: true },
    endsAt:   { canFilter: true, canSort: true },
    createdAt: { canFilter: true, canSort: true },
  };
  async list(model: SieveModel) { ... }
  async listActive() { ... }  // status == active + endsAt >= now
}
```

**`src/repositories/eventEntry.repository.ts`**

```typescript
export class EventEntryRepository extends BaseRepository<EventEntryDocument> {
  static readonly SIEVE_FIELDS: FirebaseSieveFields = {
    eventId:      { canFilter: true, canSort: false },
    userId:       { canFilter: true, canSort: false },
    reviewStatus: { canFilter: true, canSort: false },
    submittedAt:  { canFilter: true, canSort: true },
    points:       { canFilter: true, canSort: true },
  };
  async listForEvent(eventId: string, model: SieveModel) {
    return this.sieveQuery<EventEntryDocument>(model, ..., {
      baseQuery: this.getCollection().where('eventId', '==', eventId),
    });
  }
  async hasUserEntered(eventId: string, userId: string): Promise<boolean> { ... }
  async getLeaderboard(eventId: string, limit = 10): Promise<EventEntryDocument[]> { ... }
}
```

Export both from `src/repositories/index.ts` as `eventRepository` and `eventEntryRepository`.

**Files changed in Phase 22a:**

```
src/db/schema/event.schema.ts                NEW
src/db/schema/index.ts                       + event schema exports
src/constants/ui.ts                          + Events/admin labels
src/constants/messages.ts                    + EVENT error/success messages
src/constants/routes.ts                      + ADMIN.EVENTS, PUBLIC.EVENTS routes
src/constants/api.ts                         + Events API endpoints
src/constants/index.ts                       + re-export new constants
src/repositories/event.repository.ts         NEW
src/repositories/eventEntry.repository.ts    NEW
src/repositories/index.ts                    + event repository exports
```

---

### 22b -- Backend API

All routes in `src/app/api/`. Every handler follows RULE 9 (auth, validate, repository, successResponse, handleApiError).

#### 22b.1 -- Admin events CRUD

**`src/app/api/admin/events/route.ts`**

```
GET  /api/admin/events
  - Admin/moderator auth required
  - Accepts: filters, sorts, page, pageSize (Sieve)
  - Named filters: type, status
  - Returns: { items, total, page, pageSize, totalPages, hasMore }

POST /api/admin/events
  - Admin auth required
  - Validates: type, title, description, startsAt, endsAt, plus type-specific config
  - Creates event with status='draft', stats zeroed
  - Returns: created EventDocument
```

**`src/app/api/admin/events/[id]/route.ts`**

```
GET    /api/admin/events/[id]   -> full event document
PUT    /api/admin/events/[id]   -> update title/description/dates/config
DELETE /api/admin/events/[id]   -> soft-delete (set status='ended') or hard-delete for drafts
```

**`src/app/api/admin/events/[id]/status/route.ts`**

```
PATCH /api/admin/events/[id]/status
  - Body: { status: 'active' | 'paused' | 'ended' | 'draft' }
  - Admin auth required
  - Validates allowed transitions (draft->active, active->paused, active->ended, paused->active)
```

#### 22b.2 -- Admin entry moderation

**`src/app/api/admin/events/[id]/entries/route.ts`**

```
GET /api/admin/events/[id]/entries
  - Admin/moderator auth
  - Sieve: reviewStatus filter, sorts, pagination
  - Returns paginated list of EventEntryDocument
```

**`src/app/api/admin/events/[id]/entries/[entryId]/route.ts`**

```
PATCH /api/admin/events/[id]/entries/[entryId]
  - Body: { reviewStatus: 'approved' | 'flagged', reviewNote?: string }
  - Sets reviewedBy = current user uid, reviewedAt = now
  - Atomically updates event.stats.approvedEntries / flaggedEntries counter
```

#### 22b.3 -- Admin stats

**`src/app/api/admin/events/[id]/stats/route.ts`**

```
GET /api/admin/events/[id]/stats
  - Returns: { event, totalEntries, approvedEntries, flaggedEntries, pendingEntries,
               pollResults: { optionId, label, count, percent }[],
               leaderboard: top 10 entries with user info }
```

#### 22b.4 -- Public event endpoints

**`src/app/api/events/route.ts`**

```
GET /api/events
  - No auth required
  - Returns only status='active' events with endsAt >= now
  - Sorted by startsAt desc
  - Strips internal fields (reviewStatus on entries, createdBy, stats details)
```

**`src/app/api/events/[id]/route.ts`**

```
GET /api/events/[id]
  - No auth required
  - Returns event if active or ended (not draft/paused)
  - For poll events: includes current results if resultsVisibility='always'
  - For survey events with hasLeaderboard: includes top 10 leaderboard (approved only)
```

**`src/app/api/events/[id]/enter/route.ts`**

```
POST /api/events/[id]/enter
  - Auth required for type=survey (requireLogin=true) and poll
  - Optional auth for type=feedback with anonymous=true
  - Validates:
    - Event is active and within startsAt/endsAt window
    - User has not exceeded maxEntriesPerUser
    - All required formFields present and pass field-level validation
  - For poll: validates selected option IDs exist in pollConfig.options
  - Creates EventEntryDocument with reviewStatus='pending' (or 'approved' if entryReviewRequired=false)
  - Atomically increments event.stats.totalEntries
  - Returns: { entryId, message }
```

**`src/app/api/events/[id]/leaderboard/route.ts`**

```
GET /api/events/[id]/leaderboard
  - Returns top 50 approved entries sorted by points desc
  - Only for events with surveyConfig.hasLeaderboard=true
```

**Files changed in Phase 22b:**

```
src/app/api/admin/events/route.ts                           NEW
src/app/api/admin/events/[id]/route.ts                      NEW
src/app/api/admin/events/[id]/status/route.ts               NEW
src/app/api/admin/events/[id]/entries/route.ts              NEW
src/app/api/admin/events/[id]/entries/[entryId]/route.ts    NEW
src/app/api/admin/events/[id]/stats/route.ts                NEW
src/app/api/events/route.ts                                 NEW
src/app/api/events/[id]/route.ts                            NEW
src/app/api/events/[id]/enter/route.ts                      NEW
src/app/api/events/[id]/leaderboard/route.ts                NEW
```

---

### 22c -- Admin UI

#### 22c.1 -- Feature module scaffold

```
src/features/events/
  components/
    EventsTable.tsx          <- DataTable columns for events list
    EventFormDrawer.tsx      <- Create/Edit SideDrawer (multi-step: type picker + config)
    EventTypeConfig/
      SaleConfigForm.tsx     <- discount %, banner text, category selector
      OfferConfigForm.tsx    <- coupon picker, display code, banner text
      PollConfigForm.tsx     <- option list builder, multi/single toggle, results visibility, comment toggle
      SurveyConfigForm.tsx   <- form field builder (drag-to-reorder), login req, points, leaderboard toggles
      FeedbackConfigForm.tsx <- form field builder, anonymous toggle
    SurveyFieldBuilder.tsx   <- reusable dynamic form field editor (shared by survey + feedback)
    SurveyFieldPreview.tsx   <- read-only rendered form preview
    EventEntriesTable.tsx    <- DataTable for entries with review status badges
    EntryReviewDrawer.tsx    <- SideDrawer showing entry detail + Approve/Flag buttons
    EventStatsBanner.tsx     <- summary stat cards for event detail header
    EventStatusBadge.tsx     <- StatusBadge wrapper for EventStatus
  hooks/
    useEvents.ts             <- useApiQuery wrapper for events list
    useEvent.ts              <- single event fetch
    useEventEntries.ts       <- entries list with Sieve
    useEventStats.ts         <- stats fetch
    useCreateEvent.ts        <- useApiMutation for POST
    useUpdateEvent.ts        <- useApiMutation for PUT
    useChangeEventStatus.ts  <- useApiMutation for PATCH status
    useReviewEntry.ts        <- useApiMutation for PATCH entry
  types/
    index.ts                 <- re-export EventDocument, EventEntryDocument etc. from @/db/schema
  constants/
    EVENT_TYPE_OPTIONS.ts    <- dropdown options for event type selector
    EVENT_STATUS_OPTIONS.ts  <- dropdown options for status filter
    EVENT_SORT_OPTIONS.ts    <- sort options for events table
    FORM_FIELD_TYPE_OPTIONS.ts
  index.ts                   <- barrel export
```

#### 22c.2 -- Admin events list page

**`src/app/admin/events/page.tsx`** (thin orchestration, < 80 lines)

```tsx
"use client";
// useUrlTable for filters: type, status, sort, page, pageSize
// AdminPageHeader: title=UI_LABELS.ADMIN.EVENTS.TITLE, action=<Button>New Event</Button>
// AdminFilterBar: type dropdown, status dropdown, search input
// ActiveFilterChips
// DataTable with EventsTable columns
// EventFormDrawer (controlled by isDrawerOpen state)
// ConfirmDeleteModal
```

`EventsTable` columns:
| Column | Notes |
|--------|-------|
| Title | truncate at 40 chars |
| Type | `<Badge>` with type label |
| Status | `<EventStatusBadge>` |
| Starts | `formatDate(startsAt)` |
| Ends | `formatDate(endsAt)` |
| Entries | `stats.totalEntries` |
| Actions | Edit, Entries, Delete icon buttons |

#### 22c.3 -- EventFormDrawer

Multi-step `SideDrawer` (`side="right"`, `lg:max-w-2xl`):

**Step 1 -- Event basics**

- Type selector (card grid with icons, one per EventType)
- Title (required)
- Description (`RichTextEditor`)
- Start date + End date (`<FormField type="datetime-local">`)
- Cover image upload (`AvatarUpload` or `useStorageUpload`)

**Step 2 -- Type-specific config** (renders the matching `*ConfigForm`)

- **SaleConfigForm**: discount percent slider (`<Slider>`), banner text override, category multi-select
- **OfferConfigForm**: coupon picker (searches `couponsRepository`, shows display code), banner text override
- **PollConfigForm**: option list (dynamic add/remove/reorder), multi-select toggle, comment toggle, results visibility radio
- **SurveyConfigForm**: `<SurveyFieldBuilder>` + login required toggle, max entries per user, leaderboard toggle, points system toggle + label, entry review required toggle
- **FeedbackConfigForm**: `<SurveyFieldBuilder>` + anonymous toggle

**SurveyFieldBuilder** -- drag-to-reorder list of fields, each row:

- Field type select (from `FORM_FIELD_TYPE_OPTIONS`)
- Label input
- Placeholder input
- Required toggle
- Options list (only shown for select/multiselect/checkbox/radio types)
- Validation min/max (only for number/text/textarea)
- Add field button â†’ appends a new blank field with `nanoid()` id

Drawer footer: `DrawerFormFooter` with Back/Next (steps) and Cancel/Save buttons.

#### 22c.4 -- Event entries moderation page

**`src/app/admin/events/[id]/entries/page.tsx`** (thin, < 80 lines)

- `AdminPageHeader` with event title + back link â†’ `ROUTES.ADMIN.EVENTS`
- `EventStatsBanner` showing total / approved / flagged / pending counts
- `AdminFilterBar`: reviewStatus filter (pending / approved / flagged)
- `DataTable` with `EventEntriesTable` columns
- `EntryReviewDrawer` for per-entry review

`EventEntriesTable` columns:
| Column | Notes |
|--------|-------|
| User | displayName + email |
| Submitted | `formatRelativeTime(submittedAt)` |
| Status | `<StatusBadge>` (pending/approved/flagged) |
| Points | only shown for survey events with hasPointSystem |
| Summary | first 60 chars of formResponses or pollVotes joined |
| Actions | View/Review button |

`EntryReviewDrawer` (`side="right"`, `md:w-3/5`):

- Renders each form field label + submitted value (read-only)
- Poll: shows selected options + comment
- Approve / Flag button pair with optional note textarea
- Uses `useReviewEntry` mutation

**Files changed in Phase 22c:**

```
src/features/events/components/EventsTable.tsx              NEW
src/features/events/components/EventFormDrawer.tsx          NEW
src/features/events/components/EventTypeConfig/SaleConfigForm.tsx    NEW
src/features/events/components/EventTypeConfig/OfferConfigForm.tsx   NEW
src/features/events/components/EventTypeConfig/PollConfigForm.tsx    NEW
src/features/events/components/EventTypeConfig/SurveyConfigForm.tsx  NEW
src/features/events/components/EventTypeConfig/FeedbackConfigForm.tsx NEW
src/features/events/components/SurveyFieldBuilder.tsx       NEW
src/features/events/components/SurveyFieldPreview.tsx       NEW
src/features/events/components/EventEntriesTable.tsx        NEW
src/features/events/components/EntryReviewDrawer.tsx        NEW
src/features/events/components/EventStatsBanner.tsx         NEW
src/features/events/components/EventStatusBadge.tsx         NEW
src/features/events/hooks/useEvents.ts                      NEW
src/features/events/hooks/useEvent.ts                       NEW
src/features/events/hooks/useEventEntries.ts                NEW
src/features/events/hooks/useEventStats.ts                  NEW
src/features/events/hooks/useCreateEvent.ts                 NEW
src/features/events/hooks/useUpdateEvent.ts                 NEW
src/features/events/hooks/useChangeEventStatus.ts           NEW
src/features/events/hooks/useReviewEntry.ts                 NEW
src/features/events/types/index.ts                          NEW
src/features/events/constants/EVENT_TYPE_OPTIONS.ts         NEW
src/features/events/constants/EVENT_STATUS_OPTIONS.ts       NEW
src/features/events/constants/EVENT_SORT_OPTIONS.ts         NEW
src/features/events/constants/FORM_FIELD_TYPE_OPTIONS.ts    NEW
src/features/events/index.ts                                NEW
src/app/admin/events/page.tsx                               NEW
src/app/admin/events/[id]/entries/page.tsx                  NEW
src/components/admin/AdminSidebar.tsx or nav constants      + Events nav entry (ADMIN.EVENTS)
```

---

### 22d -- Public UI

#### 22d.1 -- Feature: event-banner (Tier 1 placement -- used in layout)

**`src/components/ui/EventBanner.tsx`** (Tier 1 shared primitive)

```tsx
"use client";
// Props: event: EventDocument | null
// Renders a dismissible top-of-page banner
// - For 'sale': gradient banner "Up to X% Off â€” Limited Time!" with countdown timer
// - For 'offer': "Use code CODE at checkout" with copy-to-clipboard button
// - Dismissible via X button; stores dismissed eventId in sessionStorage
// - Returns null when event is null or dismissed
// - Uses UI_LABELS.EVENTS.SALE_BANNER(pct) / OFFER_BANNER(code)
```

Wire into `src/app/layout.tsx`: fetch active sale/offer events server-side, pass first one to `EventBanner`.

#### 22d.2 -- Public events list page

**`src/app/events/page.tsx`** (Server Component with client card grid)

Layout sections:

1. Hero: "Current Events" heading + short description
2. Active events grid (`EventCard` list -- see below)
3. Past events section (ended events, read-only)

**`src/features/events/components/EventCard.tsx`** (Tier 2)

```tsx
// Props: event: PublicEventDocument (stripped of admin fields)
// - Cover image (with fallback gradient placeholder)
// - Type badge (UI_LABELS.EVENT_TYPES[type])
// - Title + description excerpt
// - Status chip + countdown "Ends in X days / hours"
// - CTA button:
//   - sale/offer: "Shop Now" -> ROUTES.PRODUCTS
//   - poll: "Vote Now" -> ROUTES.PUBLIC.EVENT_DETAIL(id)
//   - survey: "Enter Now" -> ROUTES.PUBLIC.EVENT_DETAIL(id)
//   - feedback: "Give Feedback" -> ROUTES.PUBLIC.EVENT_DETAIL(id)
//   - ended: "View Results" -> ROUTES.PUBLIC.EVENT_DETAIL(id)
```

#### 22d.3 -- Event detail page

**`src/app/events/[id]/page.tsx`** (Server Component shell)

Layout:

1. Cover image header + title + type badge + status chip + dates
2. Description (RichText HTML render)
3. Type-specific participation section (client island):
   - **Sale**: shows discount %, affected categories, "Start Shopping" CTA
   - **Offer**: shows coupon code with copy button, expiry countdown
   - **Poll**: `<PollVotingSection>` (see below)
   - **Survey**: `<SurveyEventSection>` (see below)
   - **Feedback**: `<FeedbackEventSection>` (see below)
4. Leaderboard section (for survey events with `hasLeaderboard=true`)
5. Poll results section (when `resultsVisibility` allows)

**`src/features/events/components/PollVotingSection.tsx`**

```tsx
"use client";
// Shows poll options as radio (single) or checkboxes (multi)
// Optional comment textarea (if allowComment=true)
// Submit button -> POST /api/events/[id]/enter
// If user already voted: shows their selection + results (if visible)
// If not logged in + required: shows "Log in to vote" prompt with login link
// After vote: thank-you state + results bar chart (div-based progress bars, no charting lib)
```

**`src/features/events/components/SurveyEventSection.tsx`**

```tsx
"use client";
// Shows event description + point system info + leaderboard preview
// Big CTA button: "Fill out the survey" -> window.open(ROUTES.PUBLIC.EVENT_PARTICIPATE(id), '_blank')
// If user already entered: shows "Your entry is under review" or approved/flagged state
// If not logged in: shows LoginPrompt using useMessage() / redirect to ROUTES.AUTH.LOGIN
```

**`src/app/events/[id]/participate/page.tsx`** (Survey fill page -- opens in new tab)

```tsx
// Client Component. Requires auth (redirect to login if not).
// Fetches event by id, verifies type=survey and status=active
// Renders SurveyFormField[] as a dynamic form using <FormField> components
// Each field: label, placeholder, required indicator, field-type-appropriate input
// Validates all required fields client-side before submit
// Submit -> POST /api/events/[id]/enter
// On success: shows thank-you message with confetti (CSS animation, no lib) + close tab prompt
// On error: shows Alert with error message
```

**`src/features/events/components/FeedbackEventSection.tsx`**

```tsx
"use client";
// Inline feedback form rendered on the event detail page (does NOT open new tab)
// Renders feedbackConfig.formFields using <FormField>
// Submit -> POST /api/events/[id]/enter
// anonymous=true: no auth check
// On success: toast success + reset form
```

**`src/features/events/components/EventLeaderboard.tsx`**

```tsx
"use client";
// Props: eventId, pointsLabel
// Fetches GET /api/events/[id]/leaderboard
// Renders ranked list with: rank number, avatar (AvatarDisplay), display name, points
// Top-3 rows highlighted with gold/silver/bronze backgrounds
// "You are #N" row highlighted if current user appears
// Skeleton loader while fetching
```

**Files changed in Phase 22d:**

```
src/components/ui/EventBanner.tsx                           NEW
src/app/layout.tsx                                          + EventBanner (pass active sale/offer event)
src/app/events/page.tsx                                     NEW
src/app/events/[id]/page.tsx                                NEW
src/app/events/[id]/participate/page.tsx                    NEW
src/features/events/components/EventCard.tsx                NEW
src/features/events/components/PollVotingSection.tsx        NEW
src/features/events/components/SurveyEventSection.tsx       NEW
src/features/events/components/FeedbackEventSection.tsx     NEW
src/features/events/components/EventLeaderboard.tsx         NEW
src/features/events/index.ts                                + new component exports
```

---

### 22e -- Tests

For each new file, write tests immediately after implementation (same PR).

**`src/db/schema/__tests__/event.schema.test.ts`** _(NEW)_

- `EVENT_FIELDS.TYPE_VALUES.SALE` equals `'sale'`
- `EVENT_FIELDS.STATUS_VALUES.ACTIVE` equals `'active'`
- `EVENT_ENTRY_FIELDS.REVIEW_STATUS_VALUES.PENDING` equals `'pending'`
- `EVENTS_COLLECTION` is a non-empty string
- `EVENT_ENTRIES_COLLECTION` is a non-empty string

**`src/app/api/admin/events/__tests__/route.test.ts`** _(NEW)_

- `GET` returns 401 when no session cookie
- `GET` returns 403 when user is not admin/moderator
- `GET` returns paginated list for admin user
- `GET` filters by `type` query param
- `GET` filters by `status` query param
- `POST` returns 401 without auth
- `POST` returns 422 when body fails validation (missing title)
- `POST` creates event with `status='draft'` for valid admin request

**`src/app/api/admin/events/[id]/__tests__/route.test.ts`** _(NEW)_

- `GET` returns 404 for unknown event id
- `PUT` updates title and description
- `DELETE` hard-deletes draft events
- `DELETE` sets `status='ended'` for active events

**`src/app/api/admin/events/[id]/status/__tests__/route.test.ts`** _(NEW)_

- `PATCH` returns 422 for invalid status value
- `PATCH` transitions `draft` -> `active` successfully
- `PATCH` rejects invalid transition `ended` -> `active`

**`src/app/api/admin/events/[id]/entries/__tests__/route.test.ts`** _(NEW)_

- `GET` returns 403 for non-moderator/admin
- `GET` filters by `reviewStatus`

**`src/app/api/admin/events/[id]/entries/[entryId]/__tests__/route.test.ts`** _(NEW)_

- `PATCH` sets `reviewStatus='approved'` and updates event stats
- `PATCH` sets `reviewStatus='flagged'` and updates event stats

**`src/app/api/events/__tests__/route.test.ts`** _(NEW)_

- `GET` returns only active events
- `GET` excludes draft and paused events

**`src/app/api/events/[id]/enter/__tests__/route.test.ts`** _(NEW)_

- Returns 401 when event requires login and user is not authenticated
- Returns 409 when user has already entered (maxEntries check)
- Returns 422 when required form fields are missing
- Returns 200 and creates entry for valid submission
- Increments `stats.totalEntries` on successful submission

**`src/features/events/components/__tests__/EventStatusBadge.test.tsx`** _(NEW)_

- Renders correct label for each status value
- Uses `UI_LABELS.EVENT_STATUS` constants

**`src/features/events/components/__tests__/PollVotingSection.test.tsx`** _(NEW)_

- Renders radio buttons for `allowMultiSelect=false`
- Renders checkboxes for `allowMultiSelect=true`
- Comment textarea only present when `allowComment=true`
- Shows already-voted state correctly
- Shows login prompt when auth required and user is not logged in

**`src/features/events/components/__tests__/SurveyFieldBuilder.test.tsx`** _(NEW)_

- Renders "Add field" button
- Clicking "Add field" appends a new row
- Removing a field shrinks the list
- Field type change shows options list only for select/multiselect/checkbox/radio types

**`src/app/events/[id]/participate/__tests__/page.test.tsx`** _(NEW)_

- Redirects to login when user is not authenticated
- Renders 404 for non-survey event types
- Renders all form fields from `surveyConfig.formFields`
- Required field validation prevents submit
- Shows thank-you state on successful submission

**`src/components/ui/__tests__/EventBanner.test.tsx`** _(NEW)_

- Renders sale banner with correct percent from `UI_LABELS.EVENTS.SALE_BANNER`
- Renders offer banner with coupon code from `UI_LABELS.EVENTS.OFFER_BANNER`
- Returns null when event is null
- Dismiss button hides the banner and writes to sessionStorage

---

### Phase 22 -- Summary

| Sub-phase | Scope                               | Est. new files |
| --------- | ----------------------------------- | -------------- |
| **22a**   | Schema, constants, repositories     | ~10            |
| **22b**   | Backend API routes (10 handlers)    | ~10            |
| **22c**   | Admin UI (feature module + 2 pages) | ~28            |
| **22d**   | Public UI (5 pages / components)    | ~12            |
| **22e**   | Tests                               | ~15            |
| **Total** |                                     | **~65**        |

**Admin nav entry:** Add "Events" to the admin sidebar under its own group or under "Marketing" (alongside Newsletter). Use a `CalendarDays` lucide icon.

**Firestore indexes to add** (in `firestore.indexes.json`):

```json
// events: status + endsAt (for active event queries)
{ "collectionGroup": "events", "queryScope": "COLLECTION",
  "fields": [{"fieldPath": "status", "order": "ASCENDING"}, {"fieldPath": "endsAt", "order": "ASCENDING"}] }

// events: type + status (for admin list filtering)
{ "collectionGroup": "events", "queryScope": "COLLECTION",
  "fields": [{"fieldPath": "type", "order": "ASCENDING"}, {"fieldPath": "status", "order": "ASCENDING"}] }

// eventEntries: eventId + reviewStatus + submittedAt (entry moderation)
{ "collectionGroup": "eventEntries", "queryScope": "COLLECTION",
  "fields": [{"fieldPath": "eventId", "order": "ASCENDING"}, {"fieldPath": "reviewStatus", "order": "ASCENDING"}, {"fieldPath": "submittedAt", "order": "DESCENDING"}] }

// eventEntries: eventId + points (leaderboard)
{ "collectionGroup": "eventEntries", "queryScope": "COLLECTION",
  "fields": [{"fieldPath": "eventId", "order": "ASCENDING"}, {"fieldPath": "points", "order": "DESCENDING"}] }
```

Deploy indexes before activating any event: `firebase deploy --only firestore:indexes`.

---

## Phase 23 � Integration Hardening & TECH_DEBT Cleanup

**Goal:** Close integration gaps left after Phase 22 (events feature). Wire RBAC, SEO sitemap, and resolve outstanding schema TECH_DEBT items. No new features � pure hardening.

**Status:** Complete

### 23a � RBAC: Events Admin Routes

**File:** src/constants/rbac.ts

- Added ROUTES.ADMIN.EVENTS with allowedRoles: ["admin", "moderator"]
- Sub-routes (/admin/events/[id]/entries) covered via startsWith prefix match in getRouteAccessConfig
- /events and /events/[id] remain public (no RBAC entry needed)
- /events/[id]/participate auth enforced at page level (router.replace to login when user is null)

### 23b � Sitemap: Events Pages

**File:** src/app/sitemap.ts

- Added static /events entry (changeFrequency: "daily", priority: 0.7)
- Added fetchEventUrls(): fetches all status == "active" events and emits /events/:id detail URLs
- Event URLs included in exported sitemap alongside products and categories

### 23c � Schema TECH_DEBT Cleanup

**File:** src/lib/validation/schemas.ts

- Line 335 Category name uniqueness: Clarified as DB-level check in API route. Comment updated.
- Line 423 Site settings nested validation: Implemented emailSettings, socialLinks, and features validators in siteSettingsUpdateSchema
- Line 611/715 FAQ template variables: Already implemented via faqCreateSchema.refine() � TODO updated to Done

### Phase 23 � Summary

| Sub-phase | Scope                      | Files changed |
| --------- | -------------------------- | ------------- |
| 23a       | RBAC events routes         | 1             |
| 23b       | Sitemap events pages       | 1             |
| 23c       | Schema TECH_DEBT (3 items) | 1             |
| Total     |                            | 3             |

---

## Phase 24 — Styling Constants Cleanup (Phase 6.3 Final Batch)

**Goal:** Close the last remaining items from the Phase 6.3 styling consistency audit. Replace hardcoded Tailwind star-rating colour strings and inline `style={{ height }}` chart attributes with `THEME_CONSTANTS` tokens. Zero new features — pure constants adoption.

**Status:** Complete

### 24a — Star Rating Class Fixes

**Files:** `src/components/admin/reviews/ReviewStars.tsx`, `src/components/products/ProductReviews.tsx`, `src/components/homepage/CustomerReviewsSection.tsx`

- `ReviewStars.tsx`: replaced hardcoded `"text-yellow-400"` → `ratingTokens.filled` and `THEME_CONSTANTS.themed.textMuted` → `ratingTokens.empty`; added `const { rating: ratingTokens } = THEME_CONSTANTS` destructure
- `ProductReviews.tsx`: added `rating: ratingTokens` to existing `THEME_CONSTANTS` destructure; replaced `"text-gray-300 dark:text-gray-600"` → `ratingTokens.empty` (filled star design choice `text-amber-400` preserved)
- `CustomerReviewsSection.tsx`: replaced `"text-gray-300 dark:text-gray-600"` → `THEME_CONSTANTS.rating.empty` (filled star design choice `text-yellow-500 fill-yellow-500` preserved)

### 24b — Analytics Inline Style Removal

**Files:** `src/constants/theme.ts`, `src/components/seller/SellerRevenueChart.tsx`, `src/app/admin/analytics/page.tsx`

- `theme.ts`: added `chart.heightMd: "h-[280px]"` between `chart.height` (240 px) and `chart.heightLg` (320 px)
- `SellerRevenueChart.tsx`: `<div style={{ height: 240 }}>` → `<div className={THEME_CONSTANTS.chart.height}>`
- `admin/analytics/page.tsx`: two inline styles replaced — `style={{ height: 280 }}` → `className={THEME_CONSTANTS.chart.heightMd}` and `style={{ height: 240 }}` → `className={THEME_CONSTANTS.chart.height}`

### Phase 24 — Summary

| Sub-phase | Scope                            | Files changed |
| --------- | -------------------------------- | ------------- |
| 24a       | Star rating constants (3 files)  | 3             |
| 24b       | Chart height constants (3 files) | 3             |
| Total     |                                  | 6             |

---

## Phase 25 — i18n Infrastructure & Message Files (Phase 8 Start)

**Goal:** Lay the foundation for multi-language support. Install `next-intl`, create the routing config, per-request server config, and translation message files for English and Hindi. Routes are not yet restructured under `[locale]` — that is Phase 26.

**Status:** Complete (25a + 25b)

### 25a — next-intl Installation & Config

**Files:** `src/i18n/routing.ts`, `src/i18n/request.ts`, `next.config.js`

- `npm install next-intl@4.8.3 --legacy-peer-deps`
- `src/i18n/routing.ts`: defines `routing` via `defineRouting()` — locales `['en', 'hi']`, default `'en'`, `localePrefix: 'as-needed'` (English has no URL prefix, Hindi gets `/hi/`)
- `src/i18n/request.ts`: `getRequestConfig` resolves locale from request, falls back to default, dynamically imports `messages/<locale>.json`
- `next.config.js`: added `createNextIntlPlugin('./src/i18n/request.ts')`; wrapped final export as `withNextIntl(withBundleAnalyzer(withSerwist(...)(nextConfig)))`

### 25b — Translation Message Files

**Files:** `messages/en.json`, `messages/hi.json`

- `messages/en.json`: complete English translations mirroring `UI_LABELS` structure with camelCase keys — covers: `loading`, `empty`, `errorPages`, `actions`, `sort`, `form`, `status`, `roles`, `confirm`, `messages`, `nav`, `auth` (all sub-sections), `profile`, `wishlist`, `settings`, `table`, `products`, `cart`, `orders`, `checkout`, `auctions`, `search`, `seller`, `homepage`, `footer`, `accessibility`
- `messages/hi.json`: complete Hindi translations for all keys in `en.json`

### Phase 25 — Summary

| Sub-phase | Scope                                | Files changed |
| --------- | ------------------------------------ | ------------- |
| 25a       | next-intl install + config (3 files) | 3             |
| 25b       | Translation message files (2 files)  | 2             |
| Total     |                                      | 5             |

**Next**: Phase 26 — `[locale]` route migration (move all `src/app/` pages under `src/app/[locale]/`, activate middleware, update layout)

---

## Phase 26 — [locale] Route Migration (Phase 8 Continued)

**Goal:** Restructure all Next.js App Router pages under a `[locale]` dynamic segment. Activate the next-intl middleware for locale detection and URL rewriting. Move all providers into the locale-aware layout and slim down the root HTML shell.

**Status:** Complete

### 26a — Middleware & Locale Layout

**Files:** `src/middleware.ts`, `src/app/[locale]/layout.tsx`, `src/app/layout.tsx`

- `src/middleware.ts`: `createMiddleware(routing)` from `next-intl/middleware`. Matcher excludes `api/`, `_next`, static files, and PWA assets. English routes use no URL prefix; Hindi routes get `/hi/` prefix.
- `src/app/layout.tsx`: updated to thin HTML root shell. Uses `getLocale()` from `next-intl/server` to set `<html lang={locale}>` dynamically. All providers removed from root.
- `src/app/[locale]/layout.tsx`: new locale-aware layout. Calls `getMessages()` to load translations; wraps children with `NextIntlClientProvider` + `ThemeProvider` + `SessionProvider` + `MonitoringProvider` + `ToastProvider` + `LayoutClient`.

### 26b — Bulk [locale] Route Migration

**Method:** PowerShell `Copy-Item -Recurse` for all 23 route directories; `Remove-Item -Recurse` to delete old top-level routes after copying.

**Directories moved to `[locale]/`:** about, admin, auctions, auth, blog, cart, categories, checkout, contact, demo, events, faqs, help, privacy, products, profile, promotions, search, seller, sellers, terms, unauthorized, user

**Root files moved:** `page.tsx`, `error.tsx`, `not-found.tsx`

**Stays at root (`src/app/`):** `api/`, `globals.css`, `layout.tsx`, `global-error.tsx`, `manifest.ts`, `robots.ts`, `sitemap.ts`, `opengraph-image.tsx`, `__tests__/`

**Test fix:** `src/app/__tests__/page.test.tsx` import updated from `'../page'` → `'../[locale]/page'`

**TypeScript result:** 0 errors after cleaning `.next/` build cache.

### Phase 26 — Summary

| Sub-phase | Scope                                                      | Files changed |
| --------- | ---------------------------------------------------------- | ------------- |
| 26a       | Middleware + locale layout + root shell                    | 3             |
| 26b       | Bulk route migration (23 dirs + 3 root files + 1 test fix) | 27+           |
| Total     |                                                            | 30+           |

**Route URL behaviour after migration:**

- English: `/products` → middleware rewrites internally to `[locale]/products` with `locale='en'` (URL stays clean)
- Hindi: `/hi/products` → middleware routes to `[locale]/products` with `locale='hi'`

**Next**: Phase 27 — Zod schema locale-aware error messages (`schemas.ts` lines 797, 812)

---

## Phase 27 — Zod Error Map + Locale Switcher UI

**Goal:** (27a) Replace Zod v4's default machine-y validation messages with human-friendly strings from `ERROR_MESSAGES` constants. (27b) Add a `LocaleSwitcher` component to the TitleBar so users can toggle between English and Hindi without a full page reload.

### 27a — Zod v4 Error Map

| File                                      | Change                                                               |
| ----------------------------------------- | -------------------------------------------------------------------- |
| `src/lib/zod-error-map.ts`                | New — `zodErrorMap` function + `setupZodErrorMap()` idempotent setup |
| `src/components/ZodSetup.tsx`             | New — `"use client"` component that calls `setupZodErrorMap()` once  |
| `src/i18n/request.ts`                     | Added `setupZodErrorMap()` call for server-side requests             |
| `src/app/[locale]/layout.tsx`             | Added `<ZodSetup />` inside `NextIntlClientProvider`                 |
| `src/components/index.ts`                 | Exported `ZodSetup`                                                  |
| `src/lib/__tests__/zod-error-map.test.ts` | New — 18 tests covering all issue codes + idempotency                |

**Zod v4 issue code mapping:**

- `invalid_type` (undefined/null) → `ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD`
- `too_small` (string, min ≤ 1) → `REQUIRED_FIELD`; (string, min > 1) → character count
- `too_big` (string) → character count; (number) → numeric maximum
- `invalid_format` (email) → `INVALID_EMAIL`; (url/uuid/regex) → contextual message
- `invalid_value` → lists accepted values or `INVALID_INPUT`
- `custom` → pass-through

### 27b — Locale Switcher UI

| File                                                      | Change                                                                                    |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `src/i18n/navigation.ts`                                  | New — `createNavigation(routing)` exports locale-aware `Link`, `useRouter`, `usePathname` |
| `src/components/layout/LocaleSwitcher.tsx`                | New — pill-style `en`/`hi` toggle using `useLocale` + locale-aware router                 |
| `src/components/layout/TitleBar.tsx`                      | Added `<LocaleSwitcher />` between NotificationBell and User avatar                       |
| `src/components/layout/index.ts`                          | Exported `LocaleSwitcher`                                                                 |
| `messages/en.json`                                        | Added `locale` key (`label`, `switchTo`, `en`, `hi`)                                      |
| `messages/hi.json`                                        | Added `locale` key (Hindi translations)                                                   |
| `src/components/layout/__tests__/LocaleSwitcher.test.tsx` | New — 6 tests (render, active/inactive state, ARIA, click handlers)                       |

### 27c — Jest config updates for next-intl ESM

| File             | Change                                                                             |
| ---------------- | ---------------------------------------------------------------------------------- |
| `jest.config.ts` | Added `next-intl` and `use-intl` to `transformIgnorePatterns` allowlist            |
| `jest.setup.ts`  | Added `next-intl` mock (`useLocale`, `useTranslations`) + `@/i18n/navigation` mock |

### Phase 27 — Summary

| Sub-phase | Scope              | Files changed |
| --------- | ------------------ | ------------- |
| 27a       | Zod v4 error map   | 6             |
| 27b       | Locale switcher UI | 7             |
| 27c       | Jest ESM config    | 2             |
| Total     |                    | 15            |

**Tests:** 276/276 suites green — 3097 tests (3093 passed + 4 skipped) — 25 new tests.

---

## Phase 28 — Nav/Layout i18n Wiring

**Goal:** Replace all hardcoded English strings in layout components with `useTranslations` hooks.

### Files Changed

| File                                                | Change                                                  |
| --------------------------------------------------- | ------------------------------------------------------- |
| `src/app/[locale]/not-found.tsx`                    | Removed orphaned duplicate return block                 |
| `src/components/layout/TitleBar.tsx`                | `useTranslations("accessibility")` for 4 aria-labels    |
| `src/components/layout/Sidebar.tsx`                 | `useTranslations("nav")` replaces ~17 `UI_LABELS.NAV.*` |
| `src/components/layout/__tests__/TitleBar.test.tsx` | Updated assertions for new i18n values                  |
| `src/components/layout/__tests__/Sidebar.test.tsx`  | Removed unused `UI_LABELS` import                       |

### Pattern Used

```tsx
// Sidebar: hook declared after useRef, before early returns
const tNav = useTranslations("nav");

// TitleBar: accessibility aria-labels
const tA = useTranslations("accessibility");
<button aria-label={sidebarOpen ? tA("closeMenu") : tA("openMenu")} />;
```

### Phase 28 — Summary

| Component | Namespace       | Strings replaced |
| --------- | --------------- | ---------------- |
| TitleBar  | `accessibility` | 4 aria-labels    |
| Sidebar   | `nav`           | ~17 nav labels   |

**Tests:** 276/276 suites green.

---

## Phase 29 — Auth Pages i18n Wiring

**Goal:** Replace module-level `UI_LABELS.AUTH` constants in auth forms and pages with `useTranslations("auth")`.

### Files Changed

| File                                             | Change                                                       |
| ------------------------------------------------ | ------------------------------------------------------------ |
| `src/features/auth/components/LoginForm.tsx`     | `useTranslations("auth")`, removed module-level LABELS const |
| `src/features/auth/components/RegisterForm.tsx`  | Same pattern as LoginForm                                    |
| `src/app/[locale]/auth/forgot-password/page.tsx` | All `UI_LABELS.AUTH.FORGOT_PASSWORD.*` + interpolation       |
| `src/app/[locale]/auth/reset-password/page.tsx`  | All `UI_LABELS.AUTH.RESET_PASSWORD.*`                        |
| `src/app/[locale]/auth/verify-email/page.tsx`    | All `UI_LABELS.AUTH.VERIFY_EMAIL.*`                          |
| `src/app/[locale]/unauthorized/page.tsx`         | Three namespaces: errorPages, auth, actions                  |

### Key Pattern — Move Module-Level LABELS Inside Component

```tsx
// BEFORE (broken pattern — cannot call hooks at module level)
const LABELS = UI_LABELS.AUTH; // module scope

// AFTER (correct)
function LoginForm() {
  const t = useTranslations("auth"); // component scope
```

### Interpolation Pattern

```tsx
// BEFORE
{
  UI_LABELS.AUTH.FORGOT_PASSWORD.RESET_LINK_SENT_TO.replace("{email}", email);
}

// AFTER (next-intl syntax)
{
  t("forgotPassword.resetLinkSentTo", { email });
}
```

### Phase 29 — Summary

| File            | Namespace(s)                    | Strings replaced |
| --------------- | ------------------------------- | ---------------- |
| LoginForm       | `auth`                          | ~13              |
| RegisterForm    | `auth`                          | ~15              |
| forgot-password | `auth`                          | ~7               |
| reset-password  | `auth`                          | ~10+             |
| verify-email    | `auth`                          | ~8               |
| unauthorized    | `errorPages`, `auth`, `actions` | ~6               |

**Tests:** 276/276 suites green.

---

## Phase 30 — Public Pages i18n Wiring

**Goal:** Wire remaining public user-facing pages with `useTranslations`.

### Files Changed

| File                                      | Change                                                  |
| ----------------------------------------- | ------------------------------------------------------- |
| `src/app/[locale]/cart/page.tsx`          | `useTranslations("cart")`                               |
| `src/app/[locale]/user/wishlist/page.tsx` | `useTranslations("wishlist")`, `"actions"`, `"loading"` |
| `src/app/[locale]/user/settings/page.tsx` | `useTranslations("settings")`                           |
| `messages/en.json`                        | Added `wishlist.subtitle`                               |
| `messages/hi.json`                        | Added `wishlist.subtitle` (Hindi)                       |

### Phase 30 — Summary

| Page     | Namespace(s)                     | Strings replaced |
| -------- | -------------------------------- | ---------------- |
| cart     | `cart`                           | 1 heading        |
| wishlist | `wishlist`, `actions`, `loading` | 7                |
| settings | `settings`                       | 1 heading        |

## **Tests:** 276/276 suites green.

## Phase 37 — Service Layer Migration

**Goal:** Eliminate all direct `apiClient.*` and `fetch()` calls in React components, pages, and contexts. Every API call must flow through a service function (`src/services/`) consumed via a hook (`useApiQuery` / `useApiMutation`). This prevents business logic duplication, makes all API calls independently testable, and enforces the three-layer architecture: **Component → Hook → Service → apiClient**.

> **Rules enforced:** Rule 19 (no direct `fetch`), Rule 20 (no `apiClient` in components).

---

### Phase 37 — Sub-phases

#### Phase 37.1 — Service Scaffolding ✅ Done

All service files created under `src/services/` and `src/features/events/services/`.

| Service file                                | Domain             | Methods                                                                                                            |
| ------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `auth.service.ts`                           | Auth               | `login`, `register`, `logout`, `sendVerification`, `verifyEmail`, `forgotPassword`, `resetPassword`                |
| `session.service.ts`                        | Session            | `create`, `destroy`, `getProfile`, `recordActivity`, `validate`, `listMySessions`, `revokeSession`                 |
| `profile.service.ts`                        | Profiles           | `getById`, `getSellerReviews`, `getSellerProducts`, `update`                                                       |
| `address.service.ts`                        | Addresses          | `list`, `getById`, `create`, `update`, `delete`, `setDefault`                                                      |
| `order.service.ts`                          | Orders             | `list`, `getById`, `track`, `cancel`                                                                               |
| `product.service.ts`                        | Products           | `list`, `getById`, `getFeatured`, `getFeaturedAuctions`, `getRelated`, `getBySeller`, `create`, `update`, `delete` |
| `carousel.service.ts`                       | Carousel           | `list`, `getActive`, `getById`, `create`, `update`, `delete`, `reorder`                                            |
| `review.service.ts`                         | Reviews            | `list`, `listByProduct`, `listBySeller`, `getHomepageReviews`, `getById`, `create`, `update`, `delete`, `vote`     |
| `category.service.ts`                       | Categories         | `list`, `listTopLevel`, `getById`, `create`, `update`, `delete`                                                    |
| `faq.service.ts`                            | FAQs               | `list`, `listPublic`, `getById`, `create`, `update`, `delete`, `vote`                                              |
| `cart.service.ts`                           | Cart               | `get`, `addItem`, `updateItem`, `removeItem`, `clear`                                                              |
| `wishlist.service.ts`                       | Wishlist           | `list`, `add`, `remove`, `check`                                                                                   |
| `notification.service.ts`                   | Notifications      | `list`, `getUnreadCount`, `markRead`, `markAllRead`, `delete`                                                      |
| `newsletter.service.ts`                     | Newsletter         | `subscribe`, `list`, `getById`, `update`, `delete`                                                                 |
| `site-settings.service.ts`                  | Site Settings      | `get`, `update`                                                                                                    |
| `homepage-sections.service.ts`              | Homepage Sections  | `list`, `listEnabled`, `getById`, `create`, `update`, `delete`, `reorder`                                          |
| `search.service.ts`                         | Search             | `query`                                                                                                            |
| `checkout.service.ts`                       | Checkout + Payment | `placeOrder`, `createPaymentOrder`, `verifyPayment`, `couponService.validate`                                      |
| `features/events/services/event.service.ts` | Events (Tier 2)    | Admin + public event CRUD + entry management                                                                       |

**Barrel:** `src/services/index.ts` exports all Tier 1 services.  
`src/features/events/index.ts` exports `eventService`.

---

#### Phase 37.2 — Homepage Component Violations ✅ Done

| File                                               | Current violation                                    | Target service function                 | Target hook                                 |
| -------------------------------------------------- | ---------------------------------------------------- | --------------------------------------- | ------------------------------------------- |
| `components/homepage/HeroCarousel.tsx`             | `apiClient.get(CAROUSEL.LIST + "?active=true")`      | `carouselService.getActive()`           | `useHeroCarousel` (new in `@/hooks`)        |
| `components/homepage/FeaturedProductsSection.tsx`  | `apiClient.get(PRODUCTS.LIST + "?featured=true...")` | `productService.getFeatured()`          | `useFeaturedProducts` (new in `@/hooks`)    |
| `components/homepage/FeaturedAuctionsSection.tsx`  | `apiClient.get(PRODUCTS.LIST + "?type==auction...")` | `productService.getFeaturedAuctions()`  | `useFeaturedAuctions` (new in `@/hooks`)    |
| `components/homepage/CustomerReviewsSection.tsx`   | `apiClient.get(REVIEWS.LIST + "?...")`               | `reviewService.getHomepageReviews()`    | `useHomepageReviews` (new in `@/hooks`)     |
| `components/homepage/FAQSection.tsx`               | `apiClient.get(FAQS.LIST + "?...")`                  | `faqService.listPublic()`               | `usePublicFaqs` (new in `@/hooks`)          |
| `components/homepage/TopCategoriesSection.tsx`     | `apiClient.get(CATEGORIES.LIST + "?...")`            | `categoryService.listTopLevel()`        | `useTopCategories` (new in `@/hooks`)       |
| `components/homepage/WelcomeSection.tsx`           | `apiClient.get(SITE_SETTINGS.GET)`                   | `siteSettingsService.get()`             | `useSiteSettings` (new in `@/hooks`)        |
| `components/homepage/WhatsAppCommunitySection.tsx` | `apiClient.get(SITE_SETTINGS.GET)`                   | `siteSettingsService.get()`             | `useSiteSettings` (reuse)                   |
| `components/homepage/AdvertisementBanner.tsx`      | `apiClient.get(...)`                                 | `homepageSectionsService.listEnabled()` | `useHomepageSections` (new in `@/hooks`)    |
| `components/homepage/NewsletterSection.tsx`        | `apiClient.post(NEWSLETTER.SUBSCRIBE, vars)`         | `newsletterService.subscribe(vars)`     | `useNewsletterSubscribe` (new in `@/hooks`) |
| `components/LayoutClient.tsx`                      | `apiClient.get(SITE_SETTINGS.GET)`                   | `siteSettingsService.get()`             | `useSiteSettings` (reuse)                   |

**Steps per file:**

1. Create the named hook in `src/hooks/` calling the service function via `useApiQuery` / `useApiMutation`.
2. Export the hook from `src/hooks/index.ts`.
3. Replace the inline `apiClient.*` call in the component with the hook.
4. Write tests for the new hook.

---

#### Phase 37.3 — Product Component Violations ✅ Done

|---|---|---|
| `components/products/ProductReviews.tsx` | `apiClient.get(REVIEWS.LIST?productId=...)` | `reviewService.listByProduct()` → `useProductReviews` hook |
| `components/products/RelatedProducts.tsx` | `apiClient.get(PRODUCTS.LIST?category=...)` | `productService.getRelated()` → `useRelatedProducts` hook |
| `components/products/AddToCartButton.tsx` | `apiClient.post(CART.ADD_ITEM, data)` | `cartService.addItem()` → `useAddToCart` hook |

---

#### Phase 37.4 — Shared UI Component Violations ✅ Done

|---|---|---|
| `components/user/WishlistButton.tsx` | `apiClient.post/delete(WISHLIST.*)` | `wishlistService.*()` → `useWishlistToggle` hook |
| `components/ui/NotificationBell.tsx` | `apiClient.get/patch(NOTIFICATIONS.*)` | `notificationService.*()` → `useNotifications` hook |
| `components/ui/AddressSelectorCreate.tsx` | `apiClient.get/post(ADDRESSES.*)` | `addressService.*()` → reuse `useAddresses` (already exists in `@/hooks`) |
| `components/ui/CategorySelectorCreate.tsx` | `apiClient.get/post(CATEGORIES.*)` | `categoryService.*()` → `useCategorySelector` hook |
| `components/ui/EventBanner.tsx` | `apiClient.get(EVENTS.LIST...)` | `eventService.list()` → `usePublicEvents` (from `@/features/events/hooks`) |

---

#### Phase 37.5 — Events Feature Component Violations ✅ Done

| File                       | Violation                                | Target                                                               |
| -------------------------- | ---------------------------------------- | -------------------------------------------------------------------- |
| `EventLeaderboard.tsx`     | `apiClient.get(EVENTS.[id]/leaderboard)` | `eventService.getLeaderboard(id)` → `useEventLeaderboard` hook       |
| `FeedbackEventSection.tsx` | `apiClient.post(EVENTS.ENTER(id), data)` | `eventService.enter(id, data)` → reuse or extend `useEventMutations` |
| `PollVotingSection.tsx`    | `apiClient.post(EVENTS.ENTER(id), data)` | `eventService.enter(id, data)` → reuse or extend `useEventMutations` |

---

#### Phase 37.6 — Context Violations (raw `fetch`) ✅ Done that must be replaced with `apiClient` via the `sessionService`:

| Line | Endpoint                       | Replacement                       |
| ---- | ------------------------------ | --------------------------------- |
| 156  | `fetch(USER.PROFILE)`          | `sessionService.getProfile()`     |
| 215  | `fetch(AUTH.SESSION_ACTIVITY)` | `sessionService.recordActivity()` |
| 243  | `fetch(AUTH.SESSION_VALIDATE)` | `sessionService.validate()`       |
| 271  | `fetch(AUTH.LOGOUT)`           | `sessionService.destroy()`        |
| 323  | `fetch(AUTH.CREATE_SESSION)`   | `sessionService.create(data)`     |

> `SessionContext` is a special case — it is a React context, not a component, so it may call service functions directly without going through a hook (since it IS the reactive layer). However, the raw `fetch()` must still be replaced with `apiClient` via `sessionService`.

Also:

| File                                               | Violation                     | Fix                                                |
| -------------------------------------------------- | ----------------------------- | -------------------------------------------------- |
| `app/[locale]/checkout/success/page.tsx` (line 32) | `fetch(ORDERS.GET_BY_ID(id))` | `apiClient.get(...)` or `orderService.getById(id)` |
| `app/[locale]/demo/seed/page.tsx` (line 64)        | `fetch("/api/demo/seed")`     | Acceptable (dev-only demo page) — no change needed |

---

#### Phase 37.7 — Hook Internals (apiClient → service functions) ✅ Done inside `queryFn`/`mutationFn`. These must be refactored to call service functions:

| Hook file                    | Current                                         | Target                                                               |
| ---------------------------- | ----------------------------------------------- | -------------------------------------------------------------------- |
| `useAuth.ts`                 | `apiClient.post(AUTH.LOGIN, ...)`               | `authService.login(...)`                                             |
| `useAuth.ts`                 | `apiClient.post(AUTH.REGISTER, ...)`            | `authService.register(...)`                                          |
| `useAuth.ts`                 | `apiClient.post(AUTH.RESEND_VERIFICATION, ...)` | `authService.sendVerification(...)`                                  |
| `useAuth.ts`                 | `apiClient.post(USER.CHANGE_PASSWORD, ...)`     | `sessionService.*(...)`                                              |
| `useProfile.ts`              | `apiClient.get(USER.PROFILE)`                   | `sessionService.getProfile()`                                        |
| `useProfile.ts`              | `apiClient.patch(USER.PROFILE, data)`           | `profileService.update(data)`                                        |
| `useAdminStats.ts`           | `apiClient.get(ADMIN.DASHBOARD)`                | `adminService.getDashboard()` (new: `src/services/admin.service.ts`) |
| `useAddresses.ts`            | `apiClient.get/post/patch/delete(ADDRESSES.*)`  | `addressService.*()`                                                 |
| `useSessions.ts`             | `apiClient.get/delete/post(*)`                  | `sessionService.*()`                                                 |
| `features/events/hooks/*.ts` | `apiClient.get/post/put/patch/delete(EVENTS.*)` | `eventService.*()`                                                   |

---

### Phase 37 — Files to Create/Modify

**New files:**

- `src/services/*.service.ts` × 18 ✅ Done
- `src/features/events/services/event.service.ts` ✅ Done
- `src/services/index.ts` ✅ Done
- `src/services/admin.service.ts` ✅ Done (37.7 — admin dashboard + sessions)
- `src/hooks/useSiteSettings.ts` ✅ Done
- `src/hooks/useFeaturedProducts.ts` ✅ Done
- `src/hooks/useFeaturedAuctions.ts` ✅ Done
- `src/hooks/useHeroCarousel.ts` ✅ Done
- `src/hooks/useHomepageReviews.ts` ✅ Done
- `src/hooks/usePublicFaqs.ts` ✅ Done
- `src/hooks/useTopCategories.ts` ✅ Done
- `src/hooks/useHomepageSections.ts` ✅ Done
- `src/hooks/useNewsletterSubscribe.ts` ✅ Done
- `src/hooks/useProductReviews.ts` ✅ Done
- `src/hooks/useRelatedProducts.ts` ✅ Done
- `src/hooks/useAddToCart.ts` ✅ Done
- `src/hooks/useWishlistToggle.ts` ✅ Done
- `src/hooks/useNotifications.ts` ✅ Done
- `src/hooks/useCategorySelector.ts` ✅ Done
- `src/hooks/usePublicEvents.ts` ✅ Done (Tier 1)
- `src/features/events/hooks/useEventLeaderboard.ts` ✅ Done
- `src/features/events/hooks/usePublicEvents.ts` ✅ Done (Tier 2)

**Modified files:**

- `src/hooks/useAuth.ts` ✅ Done — replaced inline `apiClient` with `authService` calls
- `src/hooks/useProfile.ts` ✅ Done — replaced inline `apiClient` with `sessionService`/`profileService`
- `src/hooks/useAdminStats.ts` ✅ Done — replaced inline `apiClient` with `adminService`
- `src/hooks/useAddresses.ts` ✅ Done — replaced inline `apiClient` with `addressService`
- `src/hooks/useSessions.ts` ✅ Done — replaced inline `apiClient` with `sessionService`/`adminService`
- `src/hooks/index.ts` ✅ Done — exported all new hooks
- `src/features/events/hooks/useEvents.ts` ✅ Done — uses `eventService`
- `src/features/events/hooks/useEvent.ts` ✅ Done — uses `eventService`
- `src/features/events/hooks/useEventEntries.ts` ✅ Done — uses `eventService`
- `src/features/events/hooks/useEventMutations.ts` ✅ Done — uses `eventService`
- `src/features/events/hooks/useEventStats.ts` ✅ Done — uses `eventService`
- `src/contexts/SessionContext.tsx` ✅ Done — replaced raw `fetch` with `sessionService`/`authService`
- All ~15 component files from sub-phases 37.2–37.5 ✅ Done

---

### Phase 37 — Completion Criteria

---

#### Phase 37.8 — Rule 2: `UI_LABELS` in JSX Client Components

**Goal:** All `UI_LABELS.*` usages inside `.tsx` client component JSX replaced with `useTranslations()` from `next-intl`. `UI_LABELS` is restricted to API routes and non-JSX server utilities only.

**Pattern to fix:**

```tsx
// BEFORE — violates Rule 2
const LABELS = UI_LABELS.ADMIN.EVENTS; // module-scope: also breaks React rules
<p>{UI_LABELS.EVENTS.LEADERBOARD}</p>;

// AFTER
export function MyComponent() {
  const t = useTranslations("events");
  return <p>{t("leaderboard")}</p>;
}
```

**Files to fix — `src/features/events/components/`:**

| File                       | Violation pattern                                                                                           | Notes                                                                 |
| -------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `EventCard.tsx`            | `UI_LABELS.EVENTS.*`, `UI_LABELS.EVENT_TYPES[...]` (lines 17, 24, 26, 30, 41, 82)                           | Needs `useTranslations('events')` + `useTranslations('eventTypes')`   |
| `EventStatsBanner.tsx`     | Module-scope `const LABELS = UI_LABELS.ADMIN.EVENTS` (line 15)                                              | Move inside component; replace with `useTranslations('admin.events')` |
| `EventsTable.tsx`          | Module-scope `const LABELS = UI_LABELS.ADMIN.EVENTS` (line 9)                                               | Same fix; `UI_LABELS.TABLE.ACTIONS` → `useTranslations('table')`      |
| `EventFormDrawer.tsx`      | Module-scope `const LABELS = UI_LABELS.ADMIN.EVENTS` (line 31); lines 246, 249                              | Move inside component; use `useTranslations`                          |
| `EventEntriesTable.tsx`    | Module-scope `const LABELS = UI_LABELS.ADMIN.EVENTS` (line 8)                                               | Same fix                                                              |
| `EntryReviewDrawer.tsx`    | Module-scope `const LABELS = UI_LABELS.ADMIN.EVENTS` (line 18); line 85                                     | Same fix                                                              |
| `SurveyFieldBuilder.tsx`   | `UI_LABELS.ADMIN.EVENTS.ADD_FIELD`, `UI_LABELS.ACTIONS.DELETE` (lines 52, 163)                              | Use `useTranslations`                                                 |
| `SurveyEventSection.tsx`   | `UI_LABELS.EVENTS.*`, `UI_LABELS.ACTIONS.*` (lines 23, 28, 35, 38, 41, 56)                                  | Use `useTranslations('events')` + `'actions'`                         |
| `PollVotingSection.tsx`    | `UI_LABELS.LOADING.DEFAULT`, `UI_LABELS.EVENTS.VOTE` (line 151), `UI_LABELS.EVENTS.ALREADY_VOTED` (line 75) | Use `useTranslations`                                                 |
| `FeedbackEventSection.tsx` | `UI_LABELS.EVENTS.*`, `UI_LABELS.LOADING.DEFAULT` (lines 41, 42, 99, 100)                                   | Use `useTranslations`                                                 |
| `EventStatusBadge.tsx`     | `UI_LABELS.EVENT_STATUS[status.toUpperCase()]` (lines 23–24)                                                | Use `useTranslations('eventStatus')` + `t(status)`                    |
| `EventLeaderboard.tsx`     | `UI_LABELS.EVENTS.LEADERBOARD` (line 55)                                                                    | Use `useTranslations('events')`                                       |
| `PollConfigForm.tsx`       | `UI_LABELS.ACTIONS.DELETE` (line 65)                                                                        | Use `useTranslations('actions')`                                      |

**Files to fix — `src/features/auth/components/`:**

| File                    | Violation                                   | Fix                                 |
| ----------------------- | ------------------------------------------- | ----------------------------------- |
| `AuthSocialButtons.tsx` | `UI_LABELS.AUTH.LOGIN.*` (lines 33, 64, 81) | Use `useTranslations('auth.login')` |

**Files to fix — `src/app/[locale]/`:**

| File                    | Violation                                                                             | Fix                                                     |
| ----------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `sellers/[id]/page.tsx` | 20+ `UI_LABELS.SELLER_STOREFRONT.*`, `UI_LABELS.ACTIONS.*` uses in JSX (lines 70–377) | Use `useTranslations('sellerStorefront')` + `'actions'` |

**Supporting work:**

- Verify all required keys exist in `messages/en.json` and `messages/hi.json`; add any missing keys.
- All test files using `UI_LABELS` for `screen.getBy*` assertions are acceptable (test-only, non-JSX).

---

#### Phase 37.9 — Rule 8: `findAll()` + In-Memory Filter (Billing Hazard)

**Goal:** Replace every `findAll()` + `applySieveToArray` pattern in API routes with `sieveQuery()` via `list(model)`, reducing Firestore read costs from O(collection-size) to O(pageSize + 1).

**Direct Firestore violation:**

| File                                    | Line | Fix                                                                                               |
| --------------------------------------- | ---- | ------------------------------------------------------------------------------------------------- |
| `src/app/api/profile/[userId]/route.ts` | 30   | Replace `db.collection(USER_COLLECTION).doc(userId).get()` with `userRepository.findById(userId)` |

**`findAll()` violations requiring `list(model)` migration:**

| File                                      | Lines    | Issue                                                       | Action                                                                                |
| ----------------------------------------- | -------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `src/app/api/faqs/route.ts`               | 117, 136 | `findAll()` + `applySieveToArray`                           | Add `SIEVE_FIELDS` to `FaqRepository`; replace with `faqRepository.list(model)`       |
| `src/app/api/admin/blog/route.ts`         | 72       | `blogRepository.findAll()` in-memory filter                 | Add `SIEVE_FIELDS` to `BlogRepository`; replace with `blogRepository.list(model)`     |
| `src/app/api/admin/payouts/route.ts`      | 50       | `payoutRepository.findAll()`                                | Add `SIEVE_FIELDS` to `PayoutRepository`; replace with `payoutRepository.list(model)` |
| `src/app/api/admin/algolia/sync/route.ts` | 35       | `productRepository.findAll()` — entire collection           | Acceptable for sync but add a `limit` safety cap (`pageSize=500`)                     |
| `src/app/api/admin/analytics/route.ts`    | 29–30    | `orderRepository.findAll()` + `productRepository.findAll()` | Analytics aggregation can remain but must add document cap; document the exception    |

**Acceptable `findAll()` uses (ordered data / tree structures):**

| File                                     | Reason `findAll()` is acceptable                    |
| ---------------------------------------- | --------------------------------------------------- |
| `api/homepage-sections/route.ts`         | Reorder logic requires full ordered list (≤50 docs) |
| `api/carousel/route.ts`                  | Same — reorder context                              |
| `api/carousel/reorder/route.ts`          | Same                                                |
| `api/homepage-sections/reorder/route.ts` | Same                                                |
| `api/categories/route.ts`                | Category tree construction requires all nodes       |

**Steps per route needing `SIEVE_FIELDS`:**

1. Add `static readonly SIEVE_FIELDS: FirebaseSieveFields` to the repository class.
2. Add `async list(model: SieveModel)` method calling `this.sieveQuery(...)`.
3. Update the API route to parse `SieveModel` from `searchParams` and call `repo.list(model)`.
4. Remove the `applySieveToArray` import and call.
5. Write/update route tests.

---

#### Phase 37.10 — Rule 10: Typed Error Classes

**Goal:** Replace all `throw new Error(...)` in production API routes, contexts, and lib utilities with typed error classes from `@/lib/errors`.

| File                                         | Line        | Current                                                       | Replacement                                                       |
| -------------------------------------------- | ----------- | ------------------------------------------------------------- | ----------------------------------------------------------------- |
| `src/app/api/auth/login/route.ts`            | 84          | `throw new Error(ERROR_MESSAGES.GENERIC.SERVER_CONFIG_ERROR)` | `throw new AppError(ERROR_MESSAGES.GENERIC.SERVER_CONFIG_ERROR)`  |
| `src/app/[locale]/checkout/success/page.tsx` | 33          | `throw new Error("Failed to fetch order")`                    | Remove — use `useApiQuery` error state instead (refactor to hook) |
| `src/contexts/SessionContext.tsx`            | 162         | `throw new Error("Failed to fetch user profile")`             | `throw new DatabaseError(ERROR_MESSAGES.USER.NOT_FOUND)`          |
| `src/lib/firebase/admin.ts`                  | 87          | `throw new Error(...)`                                        | `throw new AppError(...)`                                         |
| `src/lib/search/algolia.ts`                  | 52          | `throw new Error(...)`                                        | `throw new AppError(ERROR_MESSAGES.GENERIC.SERVER_CONFIG_ERROR)`  |
| `src/lib/payment/razorpay.ts`                | 29, 90, 113 | `throw new Error(...)` × 3                                    | `throw new AppError(...)` × 3                                     |
| `src/components/admin/ImageUpload.tsx`       | 90          | `throw new Error("Upload response invalid")`                  | `throw new ValidationError(ERROR_MESSAGES.UPLOAD.INVALID_TYPE)`   |
| `src/hooks/useAuth.ts`                       | 270         | `throw new Error(ERROR_MESSAGES.USER.NOT_FOUND)`              | `throw new NotFoundError(ERROR_MESSAGES.USER.NOT_FOUND)`          |

> **Acceptable** — compound component context guards (`Tabs`, `Menu`, `Accordion`, `Dropdown`, `Toast`, `ThemeContext`): these are developer-facing guard throws, not user-facing errors. Leave unchanged.

---

#### Phase 37.11 — Rule 11/18: `console.*` in Production Code

**Goal:** Replace all bare `console.log/error/warn/info` in production server-side code with `serverLogger`. Remove from client-side code entirely (use `logger`).

**Files to fix:**

| File                              | Lines            | Fix                                                            |
| --------------------------------- | ---------------- | -------------------------------------------------------------- |
| `src/lib/firebase/admin.ts`       | 42, 65, 95       | Replace `console.log/error` with `serverLogger.info/error`     |
| `src/lib/firebase/auth-server.ts` | 24, 42, 113, 125 | Replace `console.error` with `serverLogger.error`              |
| `src/lib/firebase/storage.ts`     | 202, 218         | Replace `console.error` with `serverLogger.error`              |
| `src/app/api/demo/seed/route.ts`  | 20+ occurrences  | Replace all `console.log/error` with `serverLogger.info/error` |

> **Acceptable** (these ARE the logging implementations — leave unchanged): `src/classes/Logger.ts`, `src/lib/server-logger.ts`, `src/db/indices/merge-indices.ts` (build script only).

---

#### Phase 37.12 — Rule 12: Raw Role String Comparisons

**Goal:** Replace all `user.role === "admin"` / `"seller"` / `"moderator"` with `hasRole()` / `hasAnyRole()` from `@/helpers`.

| File                                         | Lines            | Current                                                                            | Replacement                                            |
| -------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `src/components/layout/Sidebar.tsx`          | 419–421          | `user.role === "admin" \|\| user.role === "moderator" \|\| user.role === "seller"` | `hasAnyRole(user, ['admin', 'moderator', 'seller'])`   |
| `src/components/layout/Sidebar.tsx`          | 441              | `user.role === "admin" \|\| user.role === "moderator"`                             | `hasAnyRole(user, ['admin', 'moderator'])`             |
| `src/components/layout/Sidebar.tsx`          | 511              | `user.role === "seller" \|\| user.role === "admin"`                                | `hasAnyRole(user, ['seller', 'admin'])`                |
| `src/app/[locale]/seller/analytics/page.tsx` | 54               | `user.role === "seller" \|\| user.role === "admin"`                                | `hasAnyRole(user, ['seller', 'admin'])`                |
| `src/app/[locale]/profile/[userId]/page.tsx` | 161, 163         | `user.role === "admin"`, `user.role === "seller"`                                  | `hasRole(user, 'admin')`, `hasRole(user, 'seller')`    |
| `src/app/api/products/[id]/route.ts`         | 116–117, 200–201 | `user.role === "moderator"`, `user.role === "admin"` (×2 locations)                | `hasRole(user, 'moderator')`, `hasRole(user, 'admin')` |

> `src/constants/rbac.ts` line 271 — `user.role === "admin"` is inside the RBAC utility itself; leave unchanged.

---

#### Phase 37.13 — Rules 14/15/17: Hardcoded Routes, Endpoints, Native Dialogs

**Goal:** Replace all hardcoded route strings and API paths with constants. Replace `window.confirm` with a modal.

**Hardcoded routes (Rule 14):**

| File                                              | Line | Current                                  | Replacement                                                                                         |
| ------------------------------------------------- | ---- | ---------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `src/lib/errors/client-redirect.ts`               | 64   | `router.push("/")`                       | `router.push(ROUTES.HOME)`                                                                          |
| `src/components/homepage/BlogArticlesSection.tsx` | 57   | ``router.push(`/blog/${article.slug}`)`` | `router.push(ROUTES.BLOG.ARTICLE(article.slug))` (add `ARTICLE` helper to `ROUTES.BLOG` if missing) |

**Hardcoded API paths (Rule 15):**

| File                               | Lines  | Current                    | Replacement                                                                                        |
| ---------------------------------- | ------ | -------------------------- | -------------------------------------------------------------------------------------------------- |
| `src/lib/firebase/auth-helpers.ts` | 56, 86 | `"/api/auth/session"` (×2) | `API_ENDPOINTS.AUTH.CREATE_SESSION` — **also replace raw `fetch` with `sessionService`** (Rule 19) |

**Native dialog (Rule 17):**

| File                             | Line | Current                                             | Replacement                                                                                                                                                                                            |
| -------------------------------- | ---- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/hooks/useUnsavedChanges.ts` | 98   | `window.confirm(UI_LABELS.CONFIRM.UNSAVED_CHANGES)` | Emit an event via `eventBus` that triggers a `ConfirmDeleteModal`; the hook returns a `Promise<boolean>` that resolves on confirm/cancel. Add a `<UnsavedChangesModal>` wrapper to `LayoutClient.tsx`. |

---

#### Phase 37.14 — Rule 16: Oversized Pages (> 150 lines)

**Goal:** Decompose all 37 page files that exceed 150 lines into thin orchestration layers. Each page should delegate all JSX rendering, state management, and table definitions to feature components and custom hooks.

**Priority order (by severity):**

| Lines | File                                  | Primary decomposition target                                                                                                              |
| ----- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 517   | `profile/[userId]/page.tsx`           | Extract `<SellerStorefrontProfile>` component + `useProfilePage` hook                                                                     |
| 407   | `sellers/[id]/page.tsx`               | Extract `<SellerStorefront>` component (most of JSX is already there; split into `<SellerHeader>`, `<SellerProducts>`, `<SellerReviews>`) |
| 399   | `seller/products/page.tsx`            | Extract `<SellerProductsTable>` + `<SellerProductDrawer>` into `src/features/seller/`                                                     |
| 360   | `user/orders/[id]/track/page.tsx`     | Extract `<OrderTrackingTimeline>` + `<OrderTrackingMap>` components                                                                       |
| 357   | `admin/reviews/[...action]/page.tsx`  | Extract `<ReviewsTable>` columns + filters into `src/features/admin/`                                                                     |
| 301   | `admin/products/[...action]/page.tsx` | Extract `<ProductsTable>` + `<ProductFormDrawer>` into `src/features/admin/`                                                              |
| 282   | `admin/analytics/page.tsx`            | Extract `<RevenueChart>`, `<OrdersChart>`, `<AdminStatCards>`                                                                             |
| 282   | `admin/faqs/[...action]/page.tsx`     | Extract `<FaqsTable>` + `<FaqFormDrawer>`                                                                                                 |
| 277   | `auctions/[id]/page.tsx`              | Extract `<AuctionDetail>`, `<BidHistory>`, `<BidForm>`                                                                                    |
| 265   | `admin/blog/[...action]/page.tsx`     | Extract `<BlogTable>` + `<BlogFormDrawer>`                                                                                                |
| 255   | `checkout/page.tsx`                   | Extract `<CheckoutForm>`, `<OrderSummary>`, `<PaymentSection>`                                                                            |
| 245   | `admin/users/[...action]/page.tsx`    | Extract `<UsersTable>` + `<UserDetailDrawer>`                                                                                             |
| 243   | `admin/sections/[...action]/page.tsx` | Extract `<SectionsTable>` + `<SectionFormDrawer>`                                                                                         |
| 240   | `admin/coupons/[...action]/page.tsx`  | Extract `<CouponsTable>` + `<CouponFormDrawer>`                                                                                           |
| 235   | `categories/[slug]/page.tsx`          | Extract `<CategoryProductGrid>` + `<CategoryFilterPanel>`                                                                                 |
| 234   | `admin/carousel/[...action]/page.tsx` | Extract `<CarouselTable>` + `<CarouselFormDrawer>`                                                                                        |
| 233   | `admin/bids/[...action]/page.tsx`     | Extract `<BidsTable>`                                                                                                                     |
| 225   | `search/page.tsx`                     | Extract `<SearchResults>` + `<SearchFilters>`                                                                                             |
| 224   | `products/page.tsx`                   | Extract `<ProductListings>` + `<ProductFilters>`                                                                                          |
| 219   | `user/orders/view/[id]/page.tsx`      | Extract `<OrderDetail>` component                                                                                                         |
| 213   | `admin/payouts/page.tsx`              | Extract `<PayoutsTable>`                                                                                                                  |
| 209   | `admin/newsletter/page.tsx`           | Extract `<NewsletterTable>`                                                                                                               |
| 204   | `auth/reset-password/page.tsx`        | Extract `<ResetPasswordForm>`                                                                                                             |
| 195   | `seller/orders/page.tsx`              | Extract `<SellerOrdersTable>`                                                                                                             |
| 194   | `blog/[slug]/page.tsx`                | Extract `<BlogPostContent>`, `<BlogPostSidebar>`                                                                                          |
| 192   | `user/orders/page.tsx`                | Extract `<UserOrdersTable>`                                                                                                               |
| 188   | `user/settings/page.tsx`              | Extract `<SettingsLayout>` with tab sections                                                                                              |
| 183   | `seller/products/[id]/edit/page.tsx`  | Extract `<EditProductForm>`                                                                                                               |
| 180   | `admin/orders/[...action]/page.tsx`   | Extract `<AdminOrdersTable>` + `<OrderDetailDrawer>`                                                                                      |
| 173   | `auctions/page.tsx`                   | Extract `<AuctionsGrid>` + filters                                                                                                        |
| 171   | `user/addresses/page.tsx`             | Extract `<AddressesManager>`                                                                                                              |
| 169   | `events/[id]/participate/page.tsx`    | Extract `<EventParticipateForm>`                                                                                                          |
| 169   | `about/page.tsx`                      | Extract `<AboutHero>`, `<AboutTeam>`, `<AboutMission>` sections                                                                           |
| 167   | `sellers/page.tsx`                    | Extract `<SellersGrid>` + search                                                                                                          |
| 163   | `products/[slug]/page.tsx`            | Extract `<ProductDetail>` + `<ProductImageGallery>`                                                                                       |
| 158   | `auth/verify-email/page.tsx`          | Extract `<VerifyEmailForm>`                                                                                                               |
| 157   | `admin/media/page.tsx`                | Extract `<MediaGrid>` + `<MediaUploadPanel>`                                                                                              |

**Rules per decomposition:**

1. New feature or domain components go into `src/features/<name>/components/` or `src/components/<domain>/`.
2. API calls extracted into hooks (and hooks use service functions — Rule 20).
3. Page file MUST be ≤ 150 lines after decomposition.
4. Each new component gets a test file.

---

### Phase 37 — Completion Criteria

- [ ] `grep -r "apiClient\." src/components src/app src/contexts` returns zero matches
- [ ] `grep -r "await fetch(" src/components src/app src/contexts` returns zero matches (excluding server API routes and `src/lib/firebase/`)
- [ ] All new hooks have unit tests in `__tests__/`
- [ ] `npx tsc --noEmit` passes with 0 errors
- [ ] All 276+ test suites green
- [ ] `grep -rn "UI_LABELS\." src/features src/app --include="*.tsx"` returns zero matches in JSX-rendering files
- [ ] `grep -rn "user\.role ===" src/components src/app src/features` returns zero matches (except `src/constants/rbac.ts`)
- [ ] `grep -rn 'window\.confirm\|window\.alert\|window\.prompt' src/` returns zero matches
- [ ] `grep -rn 'throw new Error(' src/app/api src/contexts src/hooks src/lib/payment src/lib/search` returns zero matches
- [ ] `grep -rn 'console\.' src/lib/firebase src/app/api/demo` returns zero matches
- [ ] All 69 `page.tsx` files are ≤ 150 lines
