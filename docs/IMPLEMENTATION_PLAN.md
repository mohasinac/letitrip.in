# Frontend Implementation Plan

> **Source:** Derived from `FRONTEND_REFACTOR_PLAN.md` audit (Feb 20, 2026)  
> **Principle:** Each phase is independently shippable. Later phases depend on earlier ones. Tests are last.

---

## Phase Overview

> **Testing strategy:** Every sub-step in every phase includes tests written immediately after the implementation code. There is no separate test phase. Tests ship in the same PR as the code they cover.

| Phase  | Name                                              | Sections                             | Risk                              | Est. files (impl + tests) |
| ------ | ------------------------------------------------- | ------------------------------------ | --------------------------------- | ------------------------- |
| **1**  | Foundation ï¿½ deps, constants, schema + cleanup  | F1, G, C4, G-remaining               | ?? Zero breaking                  | ~12                       |
| **2**  | Shared UI primitives                              | B1ï¿½B5, A1ï¿½A3                     | ?? Additive only                  | ~18                       |
| **3**  | Infrastructure wiring                             | A4ï¿½A5, barrel exports              | ?? Minor API change               | ~8                        |
| **4**  | Admin pages                                       | A (admin)                            | ?? Admin-only impact              | ~14                       |
| **5**  | Public list pages                                 | A+B (public)                         | ?? User-facing                    | ~10                       |
| **6**  | Seller & user pages + CRUD drawers                | A+B+D (seller/user)                  | ?? Seller-facing                  | ~10                       |
| **7**  | FAQ routes + homepage tabs                        | E                                    | ?? New routes                     | ~8                        |
| **8**  | Footer & navigation rewrite                       | F2ï¿½F5                              | ?? Visual, site-wide              | ~8                        |
| **9**  | Inline create drawers                             | C1ï¿½C3                              | ?? Schema change                  | ~10                       |
| **10** | Gestures + accessibility                          | H                                    | ?? Cross-cutting                  | ~22                       |
| **11** | Homepage sections                                 | I                                    | ?? Public-facing                  | ~20                       |
| **12** | Dashboard page styling                            | J                                    | ?? Internal-facing                | ~16                       |
| **13** | Non-tech friendly UX                              | K                                    | ?? User-facing, site-wide         | ~28                       |
| **14** | Code deduplication                                | L                                    | ?? Minor breaking (route renames) | ~12                       |
| **15** | SEO ï¿½ full-stack coverage                       | M                                    | ?? Additive + schema change       | ~30                       |
| **16** | Newsletter admin management                       | N                                    | ?? Additive                       | ~8                        |
| **17** | Next.js 16 compatibility ï¿½ async params         | Maintenance                          | ?? Zero breaking                  | ~5                        |
| **18** | Dedicated test phase                              | All phases 1ï¿½17                    | ?? Non-breaking (tests only)      | ~90 test files            |
| **19** | Test coverage for Phases 22–45                    | Services, Events, views, pages       | ⚡ Non-breaking (tests only)      | ~79 new test files        |
| **20** | Standards gap-fix sweep                           | All phases 1-18                      | Ã¢Å¡Â Ã¯Â¸Â Cross-cutting         | ~45                       |
| **21** | Code-reuse & fetch() violation sweep              | All phases 1-18                      | Ã¢Å¡Â Ã¯Â¸Â Cross-cutting         | ~40                       |
| **22** | Event management system                           | Schema, API, Admin UI, Public UI     | âš¡ New vertical feature          | ~65                       |
| **23** | Integration hardening & tech-debt cleanup         | Maintenance sweep                    | âš¡ Additive                      | ~15                       |
| **24** | Styling constants cleanup                         | THEME_CONSTANTS gap-fix              | âš¡ Additive                      | ~10                       |
| **25** | i18n infrastructure & message files               | next-intl install + routing          | âš¡ Additive                      | ~8                        |
| **26** | `[locale]` route migration                        | All `src/app/` pages moved           | âš ï¸ Cross-cutting               | ~35                       |
| **27** | Zod error map + locale switcher UI                | Zod v4 map, LocaleSwitcher           | âš¡ Additive                      | ~8                        |
| **28** | Nav/Layout i18n wiring                            | TitleBar, Sidebar aria-labels        | âš¡ Additive                      | ~5                        |
| **29** | Auth pages i18n wiring                            | LoginForm, RegisterForm, auth pages  | âš¡ Additive                      | ~12                       |
| **30** | Public pages i18n wiring                          | cart, wishlist, settings pages       | âš¡ Additive                      | ~6                        |
| **31** | User portal pages i18n wiring                     | dashboard, orders, profile, etc.     | âš¡ Additive                      | ~8                        |
| **32** | Products/checkout/search/auctions i18n wiring     | 9 pages, ICU plurals                 | âš¡ Additive                      | ~9                        |
| **33** | Static/content pages i18n wiring                  | about, terms, privacy, sellers, etc. | âš¡ Additive                      | ~9                        |
| **34** | Seller portal pages i18n wiring                   | 7 seller pages                       | âš¡ Additive                      | ~7                        |
| **35** | Admin pages i18n wiring (batch 1)                 | dashboard, analytics, media, etc.    | âš¡ Additive                      | ~6                        |
| **36** | Admin pages i18n wiring (batch 2)                 | users, products, orders, etc.        | âš¡ Additive                      | ~13                       |
| **37** | Service layer migration                           | All API-calling components, contexts | âš ï¸ Cross-cutting               | ~32                       |
| **38** | Page extraction batch 1                           | blog, auctions, user/orders          | âš¡ Additive                      | ~5                        |
| **39** | Page extraction batch 2                           | seller/orders, seller/products       | âš¡ Additive                      | ~4                        |
| **40** | apiClient elimination â€” seller pages            | analytics, payouts, seller/page      | âš¡ Additive                      | ~3                        |
| **41** | apiClient elimination â€” admin pages             | media, site, orders                  | âš¡ Additive                      | ~3                        |
| **42** | apiClient elimination â€” user address+track      | addresses/add, edit, track           | âš¡ Additive                      | ~3                        |
| **43** | apiClient elimination â€” user profile+promotions | profile, wishlist, promotions        | âš¡ Additive                      | ~4                        |
| **44** | apiClient elimination â€” blog, products, edit    | blog/[slug], products/[slug], edit   | âš¡ Additive                      | ~3                        |
| **45** | apiClient elimination — cart + events             | cart, events, Rule 20 complete       | ⚡ Additive                       | ~4                        |
| **46** | Admin feature view Rule 20 compliance             | `src/features/admin/components/`     | ⚠️ Cross-cutting                  | ~30                       |

---

## Progress Tracker

> Update this table as work proceeds. One phase at a time ï¿½ mark **In Progress** before starting, **Done** when every file change and test in that phase is complete and `npx tsc --noEmit` passes.

| Phase                                                                                                                           | Status         | Started    | Completed  | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------- | -------------- | ---------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| **1**                                                                                                                           | ? Done         | 2026-02-21 | 2026-02-21 |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **2**                                                                                                                           | ? Done         | 2026-02-21 | 2026-02-21 | 48 tests ï¿½ 9 components/hooks ï¿½ 0 TS errors                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **3**                                                                                                                           | ? Done         | 2026-02-21 | 2026-02-21 | 12 tests ï¿½ externalPagination ï¿½ SearchResultsSection Pagination                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **4**                                                                                                                           | ? Done         | 2026-02-21 | 2026-02-21 | 7 admin pages ï¿½ useUrlTable ï¿½ server pagination ï¿½ filter bars ï¿½ FAQs data bug fixed ï¿½ 0 TS errors ï¿½ **gap fix: admin FAQs TablePagination + paginated response type**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **5**                                                                                                                           | ? Done         | 2026-02-21 | 2026-02-21 | products ï¿½ search ï¿½ auctions ï¿½ blog ï¿½ categories/[slug] ï¿½ FilterDrawer ï¿½ ActiveFilterChips ï¿½ **gap fix: search/auctions/categories FilterDrawer+ActiveFilterChips wired** Ã¢Å¡Â Ã¯Â¸Â raw fetch() violations Ã¢â€ â€™ Phase 21; barrel import violations Ã¢â€ â€™ Phase 20                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **6**                                                                                                                           | ? Done         | 2026-02-21 | 2026-02-21 | seller/products drawer ï¿½ seller/orders ï¿½ user/orders ï¿½ CRUD drawers verified ï¿½ **gap fix: seller/products FilterDrawer+ActiveFilterChips ï¿½ user/orders TablePagination** Ã¢Å¡Â Ã¯Â¸Â raw fetch() in addresses/notifications/settings/wishlist/sellers pages Ã¢â€ â€™ Phase 21                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **7**                                                                                                                           | ? Done         | 2026-02-21 | 2026-02-21 | FAQ dynamic route ï¿½ category tabs ï¿½ FAQCategorySidebar URL update ï¿½ **gap fix: FAQCategorySidebar `<Link>` with ROUTES.PUBLIC.FAQ_CATEGORY**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **8**                                                                                                                           | ? Done         | 2026-02-21 | 2026-02-21 | Footer 5-col rewrite ï¿½ EnhancedFooter deleted ï¿½ lucide-react nav icons ï¿½ Sidebar polish                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **9**                                                                                                                           | ? Done         | 2026-02-21 | 2026-02-21 | CategorySelectorCreate ï¿½ AddressSelectorCreate ï¿½ ProductForm wired                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **10**                                                                                                                          | ? Done         | 2026-02-21 | 2026-02-21 | useLongPress ï¿½ usePullToRefresh ï¿½ SideDrawer focus trap ï¿½ Tabs keyboard ï¿½ HeroCarousel ARIA                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **11**                                                                                                                          | ? Done         | 2026-02-21 | 2026-02-21 | TrustFeaturesSection (merged) ï¿½ HomepageSkeleton ï¿½ mobile snap-scroll carousels ï¿½ lucide icons ï¿½ useSwipe ï¿½ useApiMutation newsletter                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **12**                                                                                                                          | ? Done         | 2026-02-21 | 2026-02-21 | AdminStatsCards lucide+stat tokens ï¿½ AdminDashboardSkeleton ï¿½ SellerStatCard ReactNode icon ï¿½ RecentActivityCard lucide ï¿½ AdminPageHeader description+breadcrumb ï¿½ user/profile hooks order fix                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **13**                                                                                                                          | ? Done         | 2026-02-21 | 2026-02-21 | Button isLoading+touch targets ï¿½ EmptyState actionHref ï¿½ SORT/HELP_TEXT/ACTIONS constants ï¿½ messages human-friendly ï¿½ search EmptyState+lucide ï¿½ products empty state ï¿½ seller onboarding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **14**                                                                                                                          | ? Done         | 2026-02-21 | 2026-02-21 | AutoBreadcrumbs extracted ï¿½ validation schemas merged ï¿½ profile PATCH on USER.PROFILE ï¿½ 4 files deleted ï¿½ 0 TS errors                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **15**                                                                                                                          | ? Done         | 2026-02-21 | 2026-02-21 | sitemap ï¿½ robots ï¿½ OG image ï¿½ JSON-LD helpers ï¿½ product slug URLs ï¿½ per-page metadata ï¿½ noIndex for auth/admin/seller/user/checkout/cart                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **16**                                                                                                                          | ? Done         | 2026-02-22 | 2026-02-22 | newsletter subscriber list ï¿½ stats ï¿½ unsubscribe/resubscribe/delete ï¿½ Sieve-powered API ï¿½ admin nav entry                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **17**                                                                                                                          | ? Done         | 2026-02-21 | 2026-02-21 | Next.js 16 async params migration: 4 route handlers + faqs page ï¿½ .next cache cleared ï¿½ 0 TS errors                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **18**                                                                                                                          | âœ… Done       | 2026-02-21 | 2026-02-24 | 274/274 suites green â€” 3070 tests (3066 passed + 4 skipped) â€” 0 failures. 11 new test files added across 3 batches: FilterDrawer/admin list pages, API routes (admin-users, admin-sessions), cart/checkout/checkout-success/sellers/sellers-[id] pages. All 18 sub-phases (18.1â€“18.19) complete.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **19**                                                                                                                          | ⏳ Not started | --         | --         | 10 sub-phases: 19.1 service tests (26 services, ~130 tests) → 19.2 admin-events API (~45) → 19.3 public-events API (~20) → 19.4 cart/checkout/notifications/promotions APIs (~44) → 19.5–19.7 page tests (~29) → 19.8–19.9 events feature components + hooks (~70) → 19.10 all other feature views (~55). Total: ~393 new tests across ~79 new files. See Phase Details section below.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **20**                                                                                                                          | âœ… Done       | 2026-02-23 | 2026-02-23 | Gap-fix sweep complete â€” 274/274 suites green (3072 tests, +2 new). Barrel imports: 7 pages fixed; exceptions: `opengraph-image.tsx` keeps `@/constants/seo` (edge runtime), `api/search` + `api/faqs` keep `@/helpers/data/sieve.helper` (intentionally not in barrel). Hardcoded routes: 3 files fixed. `console.warn â†’ logger.warn` in `useRealtimeBids`. Products API response shape: `successResponse({items,...})` (was `{data,meta}`); consuming pages updated. `formatMonthYear`/`formatFileSize` replace inline logic in 3 API routes. Tests: all 6 Phase 20 suites updated/extended. Pre-existing flaky test in `token.helper.test.ts` (timing-sensitive, passes in isolation) noted and unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **21**                                                                                                                          | âœ… Done       | 2026-02-24 | 2026-02-24 | Code-reuse & fetch() violation sweep â€” 15 files migrated from raw fetch() â†’ apiClient (wishlist, analytics, payouts, orders, seller/page, settings, addresses/add+edit, notifications, NotificationBell, FAQPageContent, ImageUpload, sellers/[id], profile/[userId], search/page). sieveQuery() added to faqs.repository.ts; api/faqs/route.ts dual-path (Firestore-native when no tags/search); api/search/route.ts fully replaced findAll()+applySieveToArray with productRepository.list(). Firestore indexes added for faqs/payouts/posts. Tests updated (public-search + faqs suites). 27/27 tests green.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **22**                                                                                                                          | âœ… Done       | 2026-02-24 | 2026-02-24 | Event management system complete (22aâ€“22d). Schema + constants + repositories (EventDocument, EventEntryDocument, 5 event types, SIEVE_FIELDS). 10 API routes (admin CRUD, status, entries, stats, public list/detail/enter/leaderboard). Admin UI feature module (EventFormDrawer with 5 type-config sub-forms, EventsTable, EventEntriesTable, EntryReviewDrawer, EventStatsBanner, SurveyFieldBuilder). Public UI (EventBanner in layout, EventCard, PollVotingSection, FeedbackEventSection, SurveyEventSection, EventLeaderboard, /events, /events/[id], /events/[id]/participate). 0 TS errors. 22e (tests) skipped per user instruction.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **23**                                                                                                                          | âœ… Done       | 2026-02-24 | 2026-02-24 | Integration hardening â€” tech-debt cleanup, dead-code removal, type-safety sweep. 0 TS errors.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **24**                                                                                                                          | âœ… Done       | 2026-02-24 | 2026-02-24 | Styling constants cleanup â€” THEME_CONSTANTS gap-fix batch, raw Tailwind strings replaced with constants in 6.3 final batch. 0 TS errors.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **25**                                                                                                                          | âœ… Done       | 2026-02-24 | 2026-02-24 | i18n infrastructure â€” next-intl installed; `src/i18n/routing.ts` + `src/i18n/request.ts`; `messages/en.json` + `messages/hi.json` (550 keys each). 0 TS errors.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **26**                                                                                                                          | âœ… Done       | 2026-02-24 | 2026-02-24 | `[locale]` route migration â€” middleware activated; all 23 route dirs moved under `src/app/[locale]/`; root layout slimmed to HTML shell; 274/274 suites green.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **27**                                                                                                                          | âœ… Done       | 2026-02-25 | 2026-02-25 | Zod v4 error map + LocaleSwitcher â€” `src/lib/zod-error-map.ts` (custom `zodErrorMap` + `setupZodErrorMap`); `ZodSetup` client component wired in layout; `src/i18n/navigation.ts` (`createNavigation`); `LocaleSwitcher` pill UI in TitleBar; `locale` key added to en.json + hi.json; jest.config.ts updated (`next-intl` + `use-intl` in transform allowlist); `@/i18n/navigation` mock in jest.setup.ts; 25 new tests; 276/276 suites green â€” 3097 tests.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **28**                                                                                                                          | âœ… Done       | 2026-02-26 | 2026-02-26 | Nav/Layout i18n wiring â€” `TitleBar` aria-labels â†’ `useTranslations("accessibility")` (4 strings); `Sidebar` â†’ `useTranslations("nav")` (~17 strings); orphaned duplicate return block removed from `not-found.tsx`; TitleBar + Sidebar tests updated; 276/276 suites green.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **29**                                                                                                                          | âœ… Done       | 2026-02-26 | 2026-02-26 | Auth pages i18n wiring â€” `LoginForm`/`RegisterForm` module-level `LABELS` const moved inside component as `useTranslations("auth")`; `forgot-password`, `reset-password`, `verify-email`, `unauthorized` pages fully wired; next-intl interpolation `t("key", { var })` pattern applied; 276/276 suites green.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **30**                                                                                                                          | âœ… Done       | 2026-02-26 | 2026-02-26 | Public pages i18n wiring â€” `cart/page`, `user/wishlist/page`, `user/settings/page` wired; `wishlist.subtitle` key added to `en.json` + `hi.json`; all existing page tests updated to use i18n-resolved values; 276/276 suites green â€” 3097 tests.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **31**                                                                                                                          | âœ… Done       | 2026-02-27 | 2026-02-27 | User pages i18n wiring â€” all user portal pages (`dashboard`, `orders`, `orders/[id]`, `profile`, `addresses`, `notifications`, `reviews`, `bids`) wired with `useTranslations`; `userDashboard.*`, `userOrders.*`, `userProfile.*`, `userAddresses.*`, `userNotifications.*`, `userReviews.*`, `userBids.*` namespaces added to `en.json` + `hi.json`; 0 TS errors.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **32**                                                                                                                          | âœ… Done       | 2026-02-26 | 2026-02-26 | Products/checkout/search/auctions i18n wiring â€” `ProductsView` filter-chip labels (`filterCategory`, `filterMinPrice`, `filterMaxPrice`, `filterPriceValue`) converted from hardcoded strings to `t()`; `AuctionCard` fully wired to `useTranslations("auctions")` â€” `UI_LABELS.AUCTIONS_PAGE.*` eliminated, `formatCountdown` updated to accept `endedLabel` param, `totalBids` ICU plural used; `auctions/page` `filterBidRange` label translated; `checkout/success` raw `fetch()` replaced with `orderService.getById()`; `auctions.filterBidRange`, `auctions.endingSoon`, `products.filterCategory/filterMinPrice/filterMaxPrice/filterPriceValue` keys added to `en.json` + `hi.json`; 0 TS errors.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |                                |
| **33**                                                                                                                          | âœ… Done       | 2026-02-26 | 2026-02-26 | Static/content pages i18n wiring â€” `promotions/page` converted from `UI_LABELS.PROMOTIONS_PAGE` + hardcoded `"ðŸŽ‰ Exclusive Offers"` to `useTranslations("promotions")`; `promotions` top-level namespace added (`title`, `subtitle`, `exclusiveOffersBadge`, `dealsTitle/Subtitle`, `featuredTitle/Subtitle`, `couponsTitle/Subtitle`, `emptyDeals`, `checkBack`, `emptyCoupons`) to `en.json` + `hi.json`; `about`, `terms`, `privacy`, `sellers`, `help`, `contact`, `blog`, `blog/[slug]` already wired in prior sessions; 0 TS errors.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |                                |
| **34**                                                                                                                          | âœ… Done       | 2026-02-26 | 2026-02-26 | Seller portal pages i18n wiring â€” `seller/products/[id]/edit` hardcoded validation strings (`"Title is required"`, `"Description is required"`, `"Category is required"`) replaced with `t("titleRequired")` / `t("descriptionRequired")` / `t("categoryRequired")`; keys added to `sellerProducts` namespace in `en.json` + `hi.json`; all other seller pages (`page`, `analytics`, `orders`, `payouts`, `products`) already wired in prior sessions; 0 TS errors.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |                                |
| **35**                                                                                                                          | âœ… Done       | 2026-02-27 | 2026-02-27 | Admin pages i18n wiring batch 1 â€” `admin/dashboard`, `admin/analytics`, `admin/media`, `admin/newsletter`, `admin/payouts`, `admin/site`. Module-level `LABELS`/`STATUS_TABS` aliases moved inside components. `adminDashboard.*`, `adminAnalytics.*`, `adminMedia.*`, `adminNewsletter.*`, `adminPayouts.*`, `adminSite.*` namespaces added to `en.json` + `hi.json`. 0 TS errors.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **36**                                                                                                                          | âœ… Done       | 2026-02-27 | 2026-02-28 | Admin pages i18n wiring batch 2 â€” `admin/users`, `admin/products`, `admin/orders`, `admin/reviews`, `admin/bids`, `admin/blog`, `admin/categories`, `admin/faqs`, `admin/carousel`, `admin/sections`, `admin/coupons`, `admin/events`, `admin/events/[id]/entries`. All remaining `UI_LABELS.ADMIN.*` replaced.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **37**                                                                                                                          | âœ… Done       | 2026-02-28 | 2026-02-26 | Service Layer Migration â€” all 37.1â€“37.14 complete. New services: `bidService`, `contactService`, `mediaService` (added to `@/services` barrel). apiClient violations eliminated from: `Sidebar.tsx` (â†’ `authService.logout`), `FAQPageContent.tsx` (â†’ `faqService.list`), `FAQHelpfulButtons.tsx` (â†’ `faqService.vote` + `useTranslations("faq")`), `PromoCodeInput.tsx` (â†’ `couponService.validate` + `useTranslations("cart")`), `PlaceBidForm.tsx` (â†’ `bidService.create` + `useTranslations("auctions"/"actions"/"loading")`), `AuctionDetailView.tsx` (â†’ `productService.getById` + `bidService.listByProduct`), `ContactForm.tsx` (â†’ `contactService.send` + `useTranslations("contact")`), `CheckoutView.tsx` (â†’ `addressService`/`cartService`/`checkoutService`), `ImageUpload.tsx` (â†’ `mediaService.upload`), `user/notifications/page.tsx` (â†’ `notificationService`), `user/settings/page.tsx` (â†’ `profileService.update`). All page.tsx files â‰¤ 150 lines. i18n keys added: `auctions.minimumBidError`, `auctions.bidFailed`, `auctions.auctionEndedInfo`, `auctions.loginToBid`, `auctions.yourBidLabel`, `cart.promoInvalid`, `cart.promoCode`, `cart.promoApply`, `cart.promoRemove`, `cart.promoPlaceholder`, `faq.wasThisHelpful`, `faq.thanksForFeedback`, `contact` form keys (12). `couponService.validate` param fixed (`total`â†’`orderTotal`). `faqService.vote` signature fixed to `{ vote: "helpful" | "not-helpful" }`. 0 TS errors. |
| **38**                                                                                                                          | âœ… Done       | 2026-02-28 | 2026-02-28 | Page Extraction batch 1 â€” `blogService.list/getBySlug()` added to `@/services`. `sellerService.listProducts(uid)` added. `AuctionsView.tsx` extracted from `auctions/page.tsx` (192â†’13 lines) using `productService.listAuctions()`; raw `fetch()` replaced. `UserOrdersView.tsx` extracted from `user/orders/page.tsx` (206â†’13 lines) using `orderService.list()`. `blog/page.tsx` queryFn migrated to `blogService.list()`. 0 TS errors.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **39**                                                                                                                          | âœ… Done       | 2026-02-28 | 2026-02-28 | Page Extraction batch 2 â€” `SellerOrdersView.tsx` extracted from `seller/orders/page.tsx` (215â†’5 lines) using `sellerService.listOrders()`. `SellerProductsView.tsx` extracted from `seller/products/page.tsx` (326â†’5 lines) using `sellerService.listProducts()`; circular import fixed via relative paths. i18n keys: `orders.tabAll/Pending/Confirmed/Shipped/Delivered/Cancelled`. 0 TS errors.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **40**                                                                                                                          | âœ… Done       | 2026-02-28 | 2026-02-28 | apiClient elimination â€” seller pages: `seller/analytics` (â†’ `sellerService.getAnalytics()`), `seller/payouts` (â†’ `sellerService.listPayouts()`, `sellerService.requestPayout()`), `seller/page` (â†’ `sellerService.listProducts(uid)`). Removed `API_ENDPOINTS` import from `seller/page`. 0 TS errors.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **41**                                                                                                                          | âœ… Done       | 2026-02-28 | 2026-02-28 | apiClient elimination â€” admin pages: `admin/media` (â†’ `mediaService.crop/trim()`), `admin/site` (â†’ `siteSettingsService.get/update()`), `admin/orders` (â†’ `adminService.listOrders/updateOrder()`). `adminService.listOrders()` and `updateOrder()` added to `admin.service.ts`. 0 TS errors.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **42**                                                                                                                          | âœ… Done       | 2026-02-28 | 2026-02-28 | apiClient elimination â€” user address + track pages: `user/addresses/add` (â†’ `addressService.create()`), `user/addresses/edit/[id]` (â†’ `addressService.getById/update/delete()`), `user/orders/[id]/track` (â†’ `orderService.getById()`). 0 TS errors.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **43**                                                                                                                          | âœ… Done       | 2026-02-28 | 2026-02-28 | apiClient elimination â€” `user/profile` (â†’ `orderService.list()` + `addressService.list()`), `user/wishlist` (â†’ `wishlistService.list()`), `promotions` (â†’ `promotionsService.list()`). New `promotionsService` created and exported from `@/services`. 0 TS errors.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **44**                                                                                                                          | âœ… Done       | 2026-02-28 | 2026-02-28 | apiClient elimination â€” `blog/[slug]` (â†’ `blogService.getBySlug()`), `products/[slug]` (â†’ `productService.getById()`, removed unused `API_ENDPOINTS`), `seller/products/[id]/edit` (â†’ `productService.getById/update()`). 0 TS errors.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **45**                                                                                                                          | âœ… Done       | 2026-02-28 | 2026-02-28 | apiClient elimination â€” `cart` (â†’ `cartService.get/updateItem/removeItem()`), `events` (â†’ `eventService.list()`), `events/[id]` (â†’ `eventService.getById()`), `events/[id]/participate` (â†’ `eventService.getById/enter()`). **Rule 20 FULLY COMPLIANT â€” zero `apiClient` direct calls in any `page.tsx` under `src/app/[locale]/`.** 0 TS errors.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **46**                                                                                                                          | Done           | 2026-02-26 | 2026-02-26 | Admin feature view Rule 20 compliance � \dminService\ expanded with 18 new methods. \couponService\ created (\list\, \create\, \update\, \delete\, \alidate\); consolidated from \checkout.service.ts\. \                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| eviewService.listAdmin()\ added. All 13 \Admin\*View.tsx\ components migrated � zero \piClient\ imports remaining. 0 TS errors. |

**Status legend:** ? Not started ï¿½ ?? In progress ï¿½ ? Done ï¿½ ? Blocked

---

## Viewport Targets

Every component and page **must look and work correctly at all three viewport classes.** Design decisions, breakpoint choices, and layout switches in every phase are governed by this matrix.

| Class          | Breakpoint         | Tailwind prefix                     | Typical device                           | Key layout rules                                                                                                               |
| -------------- | ------------------ | ----------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Mobile**     | < 640 px           | _(default)_                         | Phone portrait/landscape                 | Single column; drawers full-screen (`w-full`); bottom nav or hamburger; no visible sidebars                                    |
| **Desktop**    | 640 px ï¿½ 1535 px | `sm:` ï¿½ `md:` ï¿½ `lg:` ï¿½ `xl:` | Tablet portrait ? standard 1080p monitor | Two-column layouts appear at `lg`; drawers partial-width (`md:w-3/5`); sidebars visible at `lg+`                               |
| **Widescreen** | = 1536 px          | `2xl:`                              | 1440p / 4K / ultrawide                   | Max-width containers cap at `max-w-screen-2xl`; admin sidebar + main + detail panel can coexist; DataTable gains extra columns |

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

> **Widescreen rule:** Never let content stretch edge-to-edge on = 1536 px. All page wrappers use `max-w-screen-2xl mx-auto px-4 lg:px-8 2xl:px-12`. If a component currently uses a narrower max-width, preserve it ï¿½ do not widen just because more space is available.

---

---

## Phase Details

> This section contains step-by-step implementation plans for phases that have not yet been completed. Completed phases show only their summary in the Progress Tracker above.

---

### Phase 19 — Test Coverage for Phases 22–45

**Goal:** Eliminate every test-coverage gap introduced in Phases 22–45. Every new API route, feature component, service method, and page added in those phases must have a corresponding test. `npx tsc --noEmit` must stay green throughout.

**Why this exists:** Phases 22–45 shipped rapidly to complete the impl plan. Tests were deferred per user instructions. Phase 19 (previously reserved) is now designated as the catch-up test phase for all post-Phase-18 work.

**Scope summary:**

- 26 service files in `src/services/` zero tests at present
- 10 admin events API routes zero tests
- 4 public events API routes zero tests
- 5 other API routes with no tests (cart, checkout, notifications, payment, promotions)
- 8 pages with no tests (events 3, admin/events 2, user/notifications, user/orders/track, seller/products/edit)
- 30+ feature components with no tests (events feature 16, admin views 13, seller/user/public views 7)
- 7 event hooks with no tests

**Definition of done:** All 276+ existing suites still green. Minimum 120 new tests added (net). `npx tsc --noEmit` passes.

---

#### 19.1 — Service Layer Unit Tests

**Files to create:** `src/services/__tests__/*.service.test.ts` (one test file per service, or grouped by domain)

**Test approach:** Mock `apiClient` at the top of each file. Assert each service method:

1. Calls the correct `apiClient` method (`get` / `post` / `patch` / `put` / `delete`)
2. Passes the correct `API_ENDPOINTS.*` constant as the URL
3. Forwards the correct payload / URL params to `apiClient`
4. Returns the raw `apiClient` result without transformation

**Files and methods to cover:**

| Test file                                                                                                           | Service methods                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `address.service.test.ts`                                                                                           | `list`, `getById`, `create`, `update`, `delete`, `setDefault`                                                                                                                                                                                                             |
| `admin.service.test.ts`                                                                                             | `listUsers`, `updateUser`, `deleteUser`, `listOrders`, `updateOrder`, `getStats`, `getDashboard`, `listBids`, `updateBidStatus`, `listReviews`, `updateReviewStatus`, `listNewsletter`, `updateNewsletterStatus`, `deleteNewsletterEntry`, `listPayouts`, `approvePayout` |
| `auth.service.test.ts`                                                                                              | `login`, `register`, `logout`, `forgotPassword`, `resetPassword`, `sendVerification`, `verifyEmail`                                                                                                                                                                       |
| `bid.service.test.ts`                                                                                               | `create`, `listByProduct`, `getById`                                                                                                                                                                                                                                      |
| `blog.service.test.ts`                                                                                              | `list`, `getBySlug`                                                                                                                                                                                                                                                       |
| `carousel.service.test.ts`                                                                                          | `list`, `create`, `update`, `delete`, `reorder`                                                                                                                                                                                                                           |
| `cart.service.test.ts`                                                                                              | `get`, `addItem`, `updateItem`, `removeItem`, `clear`                                                                                                                                                                                                                     |
| `category.service.test.ts`                                                                                          | `listAll`, `listTree`, `getById`, `create`, `update`, `delete`                                                                                                                                                                                                            |
| `checkout.service.test.ts`                                                                                          | `createOrder`, `verifyPayment`                                                                                                                                                                                                                                            |
| `contact.service.test.ts`                                                                                           | `send`                                                                                                                                                                                                                                                                    |
| `event.service.test.ts` (in `@/services`) — delegate to `features/events/services/event.service.test.ts` (see 19.3) |
| `faq.service.test.ts`                                                                                               | `list`, `vote`                                                                                                                                                                                                                                                            |
| `homepage-sections.service.test.ts`                                                                                 | `list`, `create`, `update`, `delete`, `reorder`                                                                                                                                                                                                                           |
| `media.service.test.ts`                                                                                             | `upload`, `crop`, `trim`                                                                                                                                                                                                                                                  |
| `newsletter.service.test.ts`                                                                                        | `subscribe`                                                                                                                                                                                                                                                               |
| `notification.service.test.ts`                                                                                      | `list`, `markRead`, `markAllRead`, `getUnreadCount`                                                                                                                                                                                                                       |
| `order.service.test.ts`                                                                                             | `list`, `getById`, `cancel`                                                                                                                                                                                                                                               |
| `product.service.test.ts`                                                                                           | `list`, `listAuctions`, `getById`, `create`, `update`, `delete`, `getFeatured`                                                                                                                                                                                            |
| `profile.service.test.ts`                                                                                           | `get`, `update`, `addPhone`, `verifyPhone`, `deleteAccount`, `getPublic`, `getReviews`                                                                                                                                                                                    |
| `promotions.service.test.ts`                                                                                        | `list`                                                                                                                                                                                                                                                                    |
| `review.service.test.ts`                                                                                            | `list`, `create`, `vote`                                                                                                                                                                                                                                                  |
| `search.service.test.ts`                                                                                            | `search`                                                                                                                                                                                                                                                                  |
| `seller.service.test.ts`                                                                                            | `listProducts`, `getAnalytics`, `listOrders`, `listPayouts`, `requestPayout`                                                                                                                                                                                              |
| `session.service.test.ts`                                                                                           | `list`, `revoke`, `revokeAll`                                                                                                                                                                                                                                             |
| `site-settings.service.test.ts`                                                                                     | `get`, `update`                                                                                                                                                                                                                                                           |
| `wishlist.service.test.ts`                                                                                          | `list`, `add`, `remove`                                                                                                                                                                                                                                                   |

**Pattern for every method test:**

```ts
import { apiClient } from "@/lib/api-client";
import { productService } from "@/services";
import { API_ENDPOINTS } from "@/constants";

jest.mock("@/lib/api-client");
const mockGet = jest.mocked(apiClient.get);

describe("productService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("list() calls GET with the correct endpoint and params string", async () => {
    mockGet.mockResolvedValueOnce({ items: [], total: 0 } as never);
    await productService.list("page=1&pageSize=10");
    expect(mockGet).toHaveBeenCalledWith(
      `${API_ENDPOINTS.PRODUCTS.LIST}?page=1&pageSize=10`,
    );
  });
});
```

**Est. test count:** ~130 tests across 25 test files.

---

#### 19.2 — Admin Events API Route Tests

**File to create:** `src/app/api/__tests__/admin-events.test.ts`

**Routes covered:**

- `GET /api/admin/events` — list with Sieve (filters, sorts, page, pageSize)
- `POST /api/admin/events` — create event (all 5 type configs: offer, poll, feedback, survey, sale)
- `GET /api/admin/events/[id]` — get by ID
- `PUT /api/admin/events/[id]` — update
- `DELETE /api/admin/events/[id]` — delete
- `PATCH /api/admin/events/[id]/status` — change status (active ended, etc.)
- `GET /api/admin/events/[id]/stats` — stats aggregation
- `GET /api/admin/events/[id]/entries` — list entries with Sieve
- `PATCH /api/admin/events/[id]/entries/[entryId]` — approve/reject entry

**Test cases per route:**

1. **Auth guard** — missing session cookie 401
2. **Role guard** — non-admin session 403
3. **Validation** — missing required fields 400 with validation errors
4. **Not found** — event ID does not exist 404
5. **Happy path** — correct input 200 with expected shape

**Mock setup:**

```ts
jest.mock("@/repositories", () => ({
  eventRepository: {
    list: jest.fn().mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 25,
      totalPages: 0,
      hasMore: false,
    }),
    findById: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({ id: "evt_1" }),
    update: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
  },
  eventEntryRepository: { list: jest.fn(), update: jest.fn() },
}));
```

**Est. test count:** ~45 tests.

---

#### 19.3 — Public Events API Route Tests

**File to create:** `src/app/api/__tests__/public-events.test.ts`

**Routes covered:**

- `GET /api/events` — public list (only active + within date range)
- `GET /api/events/[id]` — public detail (not found if inactive)
- `POST /api/events/[id]/enter` — submit entry (requires auth; validates by event type)
- `GET /api/events/[id]/leaderboard` — leaderboard for offer/sale type events

**Test cases per route:**

1. Happy path 200 with sanitised public shape
2. Inactive event hidden from public list
3. `POST /enter` with missing session 401
4. `POST /enter` with wrong entry type payload 400
5. `POST /enter` when event deadline passed 400 with meaningful error message
6. Leaderboard on non-leaderboard event type 400 or empty

**Est. test count:** ~20 tests.

---

#### 19.4 — Missing Public API Route Tests

**Files to create:**

**`src/app/api/__tests__/cart.test.ts`**

- `GET /api/cart` — returns cart for authenticated user; 401 if no session
- `POST /api/cart` — add item; 400 if productId missing; 404 if product not found
- `PUT /api/cart/[itemId]` — update quantity; 400 if qty < 1
- `DELETE /api/cart/[itemId]` — remove item; 404 if item not in cart
- Est. ~16 tests

**`src/app/api/__tests__/checkout.test.ts`**

- `POST /api/checkout` — creates Razorpay order; 401 without session; 400 if cart empty; 400 if invalid coupon
- `POST /api/payment/verify` — verifies Razorpay signature; 400 with tampered signature; 200 marks order confirmed
- Est. ~12 tests

**`src/app/api/__tests__/notifications.test.ts`**

- `GET /api/notifications` — list; 401 without session
- `PATCH /api/notifications/[id]` — mark read; 404 if not found
- `POST /api/notifications/read-all` — marks all read; returns count
- `GET /api/notifications/unread-count` — returns integer
- Est. ~12 tests

**`src/app/api/__tests__/promotions.test.ts`**

- `GET /api/promotions` — returns active deals + coupons; no auth required
- Est. ~4 tests

---

#### 19.5 — Public Events Page Tests

**Files to create:**

**`src/app/[locale]/events/__tests__/page.test.tsx`**

- Renders `<EventsView>` wrapper
- Page title metadata uses `useTranslations("events")` key
- Passing: renders without crashing

**`src/app/[locale]/events/[id]/__tests__/page.test.tsx`**

- Renders event detail view with params `{ id: 'evt_1' }`
- Passes `id` prop to the detail component correctly

**`src/app/[locale]/events/[id]/participate/__tests__/page.test.tsx`**

- Renders participation form view with params `{ id: 'evt_1' }`
- Participation view receives `id` prop

**Pattern (thin page test):**

```tsx
import { render, screen } from "@testing-library/react";
import EventsPage from "../page";

jest.mock("@/features/events", () => ({
  EventsView: () => <div data-testid="events-view" />,
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

it("renders EventsView", () => {
  render(<EventsPage />);
  expect(screen.getByTestId("events-view")).toBeInTheDocument();
});
```

**Est. test count:** ~9 tests (3 per page).

---

#### 19.6 — Admin Events Page Tests

**Files to create:**

**`src/app/[locale]/admin/events/__tests__/page.test.tsx`**

- Renders admin events page (which delegates to `EventsTable` + `AdminPageHeader`)
- Auth/role guard: redirects if no session (test via `ProtectedRoute` mock)
- EventsTable receives props

**`src/app/[locale]/admin/events/[id]/entries/__tests__/page.test.tsx`**

- Renders event entries page with params `{ id: 'evt_1' }`
- Delegates to `EventEntriesTable` with correct `eventId` prop

**Est. test count:** ~8 tests.

---

#### 19.7 — Missing User & Seller Page Tests

**Files to create:**

**`src/app/[locale]/user/notifications/__tests__/page.test.tsx`**

- Renders notification list (uses `notificationService` via hook)
- Empty state shown when zero notifications
- Mark-as-read button present

**`src/app/[locale]/user/orders/[id]/track/__tests__/page.test.tsx`**

- Renders with `params: { id: 'order_1' }` passes `orderId` to tracking view
- Thin wrapper test; delegates to `OrderDetailView` or inline tracking component

**`src/app/[locale]/seller/products/[id]/edit/__tests__/page.test.tsx`**

- Renders `ProductForm` pre-populated with existing product data
- `params: { id: 'prod_1' }` wires to `productService.getById()` via hook
- Loading skeleton shown while data is fetching
- Form submission calls `productService.update()`

**Est. test count:** ~12 tests.

---

#### 19.8 — Events Public Feature Component Tests

**Files to create in `src/features/events/components/__tests__/` :**

| Test file                       | Component              | Key assertions                                                                                    |
| ------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------- |
| `EventCard.test.tsx`            | `EventCard`            | Renders title, type badge, end date; link href correct; `EventStatusBadge` shown                  |
| `EventStatusBadge.test.tsx`     | `EventStatusBadge`     | Correct colour class per status (draft/active/ended/cancelled)                                    |
| `EventLeaderboard.test.tsx`     | `EventLeaderboard`     | Renders ranked entries; shows empty state when no entries; "You" row highlighted for current user |
| `PollVotingSection.test.tsx`    | `PollVotingSection`    | Option buttons rendered; clicking option calls `eventService.enter()`; disabled after submission  |
| `FeedbackEventSection.test.tsx` | `FeedbackEventSection` | Rating slider present; submit button calls `eventService.enter()` with rating payload             |
| `SurveyEventSection.test.tsx`   | `SurveyEventSection`   | Renders dynamic form fields from `surveyFields`; validates required fields before submit          |

**Est. test count:** ~30 tests.

---

#### 19.9 — Events Admin Feature Component Tests

**Files to create in `src/features/events/components/__tests__/` :**

| Test file                     | Component            | Key assertions                                                                                                            |
| ----------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `EventsTable.test.tsx`        | `EventsTable`        | Renders `DataTable` with correct columns; status filter tab changes `useUrlTable` state; new event button triggers drawer |
| `EventStatsBanner.test.tsx`   | `EventStatsBanner`   | Renders stat cards for total entries, active events, ended events                                                         |
| `EventEntriesTable.test.tsx`  | `EventEntriesTable`  | Renders entries list; approve/reject buttons call `useEventMutations`                                                     |
| `EntryReviewDrawer.test.tsx`  | `EntryReviewDrawer`  | Opens on review click; displays entry details; approve/reject fires mutation and closes                                   |
| `SurveyFieldBuilder.test.tsx` | `SurveyFieldBuilder` | Add field button adds a row; delete removes; field type select has all options                                            |

**Event hooks to test (in `src/features/events/hooks/__tests__/`) :**

| Test file                     | Hook                  | Key assertions                                                                               |
| ----------------------------- | --------------------- | -------------------------------------------------------------------------------------------- |
| `useEvents.test.ts`           | `useEvents`           | Calls `eventService.list()` via `useApiQuery`; `queryKey` includes url param string          |
| `useEvent.test.ts`            | `useEvent`            | Calls `eventService.getById(id)`                                                             |
| `usePublicEvents.test.ts`     | `usePublicEvents`     | Calls `eventService.list()` with `status==active` filter                                     |
| `useEventStats.test.ts`       | `useEventStats`       | Queries stats endpoint; returns stat shape                                                   |
| `useEventMutations.test.ts`   | `useEventMutations`   | `createEvent`, `updateEvent`, `deleteEvent`, `changeStatus` each call correct service method |
| `useEventEntries.test.ts`     | `useEventEntries`     | Queries entries for given `eventId`                                                          |
| `useEventLeaderboard.test.ts` | `useEventLeaderboard` | Queries leaderboard endpoint                                                                 |

**Est. test count:** ~40 tests.

---

#### 19.10 — Feature View Component Tests

**Goal:** Every view component under `src/features/` (except events, already covered in 19.8–19.9) must have a smoke + behaviour test.

**Files to create:**

**Admin views** (`src/features/admin/components/__tests__/`) — 13 components:

| Test file                      | Component             | Key assertions                                                             |
| ------------------------------ | --------------------- | -------------------------------------------------------------------------- |
| `AdminAnalyticsView.test.tsx`  | `AdminAnalyticsView`  | Renders revenue chart, orders chart, top products section                  |
| `AdminBidsView.test.tsx`       | `AdminBidsView`       | DataTable rendered; status filter tab works; `useUrlTable` state reflected |
| `AdminBlogView.test.tsx`       | `AdminBlogView`       | Post list table visible; "New Post" button present                         |
| `AdminCarouselView.test.tsx`   | `AdminCarouselView`   | Slides table rendered; reorder button visible                              |
| `AdminCategoriesView.test.tsx` | `AdminCategoriesView` | Category tree rendered; "Add Category" button triggers drawer              |
| `AdminCouponsView.test.tsx`    | `AdminCouponsView`    | DataTable with code/discount columns; status filter                        |
| `AdminFaqsView.test.tsx`       | `AdminFaqsView`       | DataTable; category filter; "New FAQ" button                               |
| `AdminNewsletterView.test.tsx` | `AdminNewsletterView` | Subscriber count stat; subscriber table; unsubscribe action                |
| `AdminPayoutsView.test.tsx`    | `AdminPayoutsView`    | Payout list; pending/approved filter tabs                                  |
| `AdminProductsView.test.tsx`   | `AdminProductsView`   | DataTable with title/price/status columns; status filter tabs work         |
| `AdminReviewsView.test.tsx`    | `AdminReviewsView`    | Review table with rating stars; approve/reject actions                     |
| `AdminSectionsView.test.tsx`   | `AdminSectionsView`   | Sections table; reorder visible                                            |
| `AdminUsersView.test.tsx`      | `AdminUsersView`      | User table; role filter; search box                                        |

**Public/Seller/User views:**

| Test file                                                     | Component              | Key assertions                                                   |
| ------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------- |
| `features/products/__tests__/AuctionsView.test.tsx`           | `AuctionsView`         | Renders auction product cards; FilterDrawer toggle; empty state  |
| `features/products/__tests__/ProductsView.test.tsx`           | `ProductsView`         | Renders product grid; category filter chips; sort dropdown       |
| `features/categories/__tests__/CategoryProductsView.test.tsx` | `CategoryProductsView` | Renders products for the given category slug; empty state        |
| `features/search/__tests__/SearchView.test.tsx`               | `SearchView`           | Renders search results; "no results" empty state for empty query |
| `features/seller/__tests__/SellerOrdersView.test.tsx`         | `SellerOrdersView`     | Order table with status tabs; uses `useUrlTable`                 |
| `features/seller/__tests__/SellerProductsView.test.tsx`       | `SellerProductsView`   | Product table; "Add Product" button; status filter               |
| `features/seller/__tests__/SellerProductCard.test.tsx`        | `SellerProductCard`    | Renders product name, price, status badge; edit/delete actions   |
| `features/user/__tests__/UserOrdersView.test.tsx`             | `UserOrdersView`       | Order list; status filter tabs; "No orders" empty state          |
| `features/user/__tests__/OrderDetailView.test.tsx`            | `OrderDetailView`      | Order details rendered; items list; status timeline              |

**Est. test count:** ~55 tests.

---

#### Phase 19 — Total Estimate

| Sub-phase                            | New test files    | Est. new tests |
| ------------------------------------ | ----------------- | -------------- |
| 19.1 Service layer                   | ~25 files         | ~130           |
| 19.2 Admin events API                | 1 file            | ~45            |
| 19.3 Public events API               | 1 file            | ~20            |
| 19.4 Other missing APIs              | 4 files           | ~44            |
| 19.5 Public events pages             | 3 files           | ~9             |
| 19.6 Admin events pages              | 2 files           | ~8             |
| 19.7 User/seller pages               | 3 files           | ~12            |
| 19.8 Events public components        | ~6 files          | ~30            |
| 19.9 Events admin components + hooks | ~12 files         | ~40            |
| 19.10 Feature view components        | ~22 files         | ~55            |
| **Total**                            | **~79 new files** | **~393 tests** |

**Execution order:** 19.1 19.2 19.3 19.4 19.5 19.6 19.7 19.8 19.9 19.10  
Each sub-phase is independently committable. Run `npx tsc --noEmit && npx jest --passWithNoTests` after each.

---

---

### Phase 46 — Admin Feature View Rule 20 Compliance

**Goal:** Eliminate all `apiClient` direct calls from the 13 admin feature view components in `src/features/admin/components/`. These were built during Phases 22–37 before the service layer was fully established and were never migrated. This phase completes Rule 20 compliance across the **entire codebase** (not just pages, but all feature components too).

**Rule 20 violation inventory:**
All 13 files import `apiClient` directly:
`AdminAnalyticsView`, `AdminBidsView`, `AdminBlogView`, `AdminCarouselView`, `AdminCategoriesView`, `AdminCouponsView`, `AdminFaqsView`, `AdminNewsletterView`, `AdminPayoutsView`, `AdminProductsView`, `AdminReviewsView`, `AdminSectionsView`, `AdminUsersView`

**Additional gaps discovered:**

- `couponService` does not exist in `src/services/` — `AdminCouponsView` has no service to delegate to
- `adminService` has only 5 methods; 13 admin views need ~18 additional methods
- `blogService` only has `list` + `getBySlug`; no admin CRUD

**Execution order:** 46.1 46.2 46.3 46.4 46.5 46.6  
Run `npx tsc --noEmit` after each sub-phase. Commit each sub-phase independently.

---

#### 46.1 — Expand `adminService`

**File:** `src/services/admin.service.ts`

Add the following methods (all use existing `API_ENDPOINTS` constants):

```ts
// Analytics
getAnalytics: () =>
  apiClient.get(API_ENDPOINTS.ADMIN.ANALYTICS),

// Users
listUsers: (params?: string) =>
  apiClient.get(`${API_ENDPOINTS.ADMIN.USERS}${params ? `?${params}` : ''}`),
updateUser: (uid: string, data: unknown) =>
  apiClient.patch(API_ENDPOINTS.ADMIN.USER_BY_ID(uid), data),
deleteUser: (uid: string) =>
  apiClient.delete(API_ENDPOINTS.ADMIN.USER_BY_ID(uid)),

// Bids (admin — all bids, not per-product)
listBids: (params?: string) =>
  apiClient.get(`${API_ENDPOINTS.ADMIN.BIDS}${params ? `?${params}` : ''}`),

// Blog (admin endpoints)
listBlog: (params?: string) =>
  apiClient.get(`${API_ENDPOINTS.ADMIN.BLOG}${params ? `?${params}` : ''}`),
createBlogPost: (data: unknown) =>
  apiClient.post(API_ENDPOINTS.ADMIN.BLOG, data),
updateBlogPost: (id: string, data: unknown) =>
  apiClient.patch(API_ENDPOINTS.ADMIN.BLOG_BY_ID(id), data),
deleteBlogPost: (id: string) =>
  apiClient.delete(API_ENDPOINTS.ADMIN.BLOG_BY_ID(id)),

// Newsletter (admin)
listNewsletter: (params?: string) =>
  apiClient.get(`${API_ENDPOINTS.ADMIN.NEWSLETTER}${params ? `?${params}` : ''}`),
updateNewsletterEntry: (id: string, data: unknown) =>
  apiClient.patch(API_ENDPOINTS.ADMIN.NEWSLETTER_BY_ID(id), data),
deleteNewsletterEntry: (id: string) =>
  apiClient.delete(API_ENDPOINTS.ADMIN.NEWSLETTER_BY_ID(id)),

// Payouts (admin)
listPayouts: (params?: string) =>
  apiClient.get(`${API_ENDPOINTS.ADMIN.PAYOUTS}${params ? `?${params}` : ''}`),
updatePayout: (id: string, data: unknown) =>
  apiClient.patch(API_ENDPOINTS.ADMIN.PAYOUT_BY_ID(id), data),

// Products (admin — full access, not seller-scoped)
listAdminProducts: (params?: string) =>
  apiClient.get(`${API_ENDPOINTS.ADMIN.PRODUCTS}${params ? `?${params}` : ''}`),
createAdminProduct: (data: unknown) =>
  apiClient.post(API_ENDPOINTS.ADMIN.PRODUCTS, data),
updateAdminProduct: (id: string, data: unknown) =>
  apiClient.patch(API_ENDPOINTS.ADMIN.PRODUCT_BY_ID(id), data),
deleteAdminProduct: (id: string) =>
  apiClient.delete(API_ENDPOINTS.ADMIN.PRODUCT_BY_ID(id)),
```

**TS check:** `npx tsc --noEmit src/services/admin.service.ts`

---

#### 46.2 — Create `couponService`

**File to create:** `src/services/coupon.service.ts`

```ts
/**
 * Coupon Service
 * Pure async functions for coupon/promo-code API calls.
 * Import via `@/services` barrel — NEVER call apiClient directly in components.
 */
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export const couponService = {
  /** List coupons with optional Sieve params (admin only) */
  list: (params?: string) =>
    apiClient.get(
      `${API_ENDPOINTS.ADMIN.COUPONS}${params ? `?${params}` : ""}`,
    ),

  /** Create a coupon (admin only) */
  create: (data: unknown) => apiClient.post(API_ENDPOINTS.ADMIN.COUPONS, data),

  /** Update a coupon by ID (admin only) */
  update: (id: string, data: unknown) =>
    apiClient.patch(API_ENDPOINTS.ADMIN.COUPON_BY_ID(id), data),

  /** Delete a coupon by ID (admin only) */
  delete: (id: string) =>
    apiClient.delete(API_ENDPOINTS.ADMIN.COUPON_BY_ID(id)),

  /** Validate a promo code at checkout */
  validate: (code: string, orderTotal: number) =>
    apiClient.post(API_ENDPOINTS.COUPONS.VALIDATE, { code, orderTotal }),
};
```

Then add to `src/services/index.ts`:

```ts
export * from "./coupon.service";
```

---

#### 46.3 — Migrate Views Where Services Already Exist

Services already have all required methods. Just replace `apiClient` imports and calls with the service:

| Component                 | Replace with                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------ |
| `AdminCarouselView.tsx`   | `carouselService.list()`, `.create()`, `.update(id, data)`, `.delete(id)`            |
| `AdminCategoriesView.tsx` | `categoryService.list('view=tree')`, `.create()`, `.update(id, data)`, `.delete(id)` |
| `AdminFaqsView.tsx`       | `faqService.list(params)`, `.create()`, `.update(id, data)`, `.delete(id)`           |
| `AdminReviewsView.tsx`    | `reviewService.list(params)`, `.update(id, data)`, `.delete(id)`                     |
| `AdminSectionsView.tsx`   | `homepageSectionsService.list()`, `.create()`, `.update(id, data)`, `.delete(id)`    |

**Pattern per view:**

```tsx
// BEFORE
import { apiClient } from '@/lib/api-client';
queryFn: () => apiClient.get(API_ENDPOINTS.CAROUSEL.LIST),

// AFTER
import { carouselService } from '@/services';
queryFn: () => carouselService.list(),
```

Remove `import { apiClient }` and `import { API_ENDPOINTS }` lines from each file after migration (if they become unused).

---

#### 46.4 — Migrate Views Using Expanded `adminService`

| Component                 | Replace with                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------- |
| `AdminAnalyticsView.tsx`  | `adminService.getAnalytics()`                                                                           |
| `AdminBidsView.tsx`       | `adminService.listBids(params)`                                                                         |
| `AdminNewsletterView.tsx` | `adminService.listNewsletter(params)`, `.updateNewsletterEntry(id, data)`, `.deleteNewsletterEntry(id)` |
| `AdminPayoutsView.tsx`    | `adminService.listPayouts(params)`, `.updatePayout(id, data)`                                           |
| `AdminUsersView.tsx`      | `adminService.listUsers(params)`, `.updateUser(uid, data)`, `.deleteUser(uid)`                          |

---

#### 46.5 — Migrate Blog + Products Views

**`AdminBlogView.tsx`** use new `adminService` blog methods:

- `queryFn: () => adminService.listBlog(params)`
- `mutationFn: (data) => adminService.createBlogPost(data)`
- `mutationFn: ({ id, data }) => adminService.updateBlogPost(id, data)`
- `mutationFn: (id) => adminService.deleteBlogPost(id)`

**`AdminProductsView.tsx`** use new `adminService` product methods:

- `queryFn: () => adminService.listAdminProducts(params)`
- `mutationFn: (data) => adminService.createAdminProduct(data)`
- `mutationFn: ({ id, data }) => adminService.updateAdminProduct(id, data)`
- `mutationFn: (id) => adminService.deleteAdminProduct(id)`

---

#### 46.6 — Migrate Coupons View

**`AdminCouponsView.tsx`** use new `couponService`:

- `queryFn: () => couponService.list(params)`
- `mutationFn: (data) => couponService.create(data)`
- `mutationFn: ({ id, data }) => couponService.update(id, data)`
- `mutationFn: (id) => couponService.delete(id)`

---

#### Phase 46 — Checklist

After all 6 sub-phases:

- [ ] `src/services/admin.service.ts` — 18 new methods added
- [ ] `src/services/coupon.service.ts` — created with 5 methods
- [ ] `src/services/index.ts` — `couponService` exported
- [ ] `AdminAnalyticsView.tsx` — zero `apiClient` imports
- [ ] `AdminBidsView.tsx` — zero `apiClient` imports
- [ ] `AdminBlogView.tsx` — zero `apiClient` imports
- [ ] `AdminCarouselView.tsx` — zero `apiClient` imports
- [ ] `AdminCategoriesView.tsx` — zero `apiClient` imports
- [ ] `AdminCouponsView.tsx` — zero `apiClient` imports
- [ ] `AdminFaqsView.tsx` — zero `apiClient` imports
- [ ] `AdminNewsletterView.tsx` — zero `apiClient` imports
- [ ] `AdminPayoutsView.tsx` — zero `apiClient` imports
- [ ] `AdminProductsView.tsx` — zero `apiClient` imports
- [ ] `AdminReviewsView.tsx` — zero `apiClient` imports
- [ ] `AdminSectionsView.tsx` — zero `apiClient` imports
- [ ] `AdminUsersView.tsx` — zero `apiClient` imports
- [ ] `npx tsc --noEmit` passes with 0 errors
- [ ] All existing test suites still green

**Note:** Phase 19 service tests (19.1) should be updated to include the new `adminService` methods and `couponService` after this phase completes.

---
