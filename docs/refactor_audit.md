# Implementation Plan ï¿½ Rules Compliance Refactor

> **Scope**: `src/` ï¿½ 843 source files  
> **Last audit**: 2026-03-02 (re-run #4)  
> **Scan strategy**: Every file appears exactly once. Open it, fix every violation listed, close it. Do not revisit.  
> **Policy**: No backward-compat shims. No `@deprecated` stubs. No dual implementations. Delete old code in the same commit as new code.

---

## Scan Order Overview

| #                                                                                                      | File                                                      | Rules                                                                               | Violations                                                                                |
| ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **WAVE 0 ï¿½ Prerequisites** (nothing else can proceed without these)                                  |                                                           |                                                                                     |
| ~~01~~                                                                                                 | ~~`src/utils/formatters/date.formatter.ts`~~              | 5                                                                                   | ? DONE ï¿½ Added `nowMs`, `isSameMonth`, `currentYear`, `nowISO`                          |
| ~~02~~                                                                                                 | ~~`src/utils/index.ts`~~                                  | 5                                                                                   | ? DONE ï¿½ Already barrel-exported via formatters                                         |
| ~~03~~                                                                                                 | ~~`src/utils/formatters/number.formatter.ts`~~            | 5                                                                                   | ? DONE ï¿½ `formatNumber` extended with `decimals` option                                 |
| ~~04~~                                                                                                 | ~~`src/constants/api-endpoints.ts`~~                      | 19,20                                                                               | ? DONE ï¿½ Added `REALTIME.TOKEN` (DEMO.SEED already existed)                             |
| ~~05~~                                                                                                 | ~~`src/constants/messages.ts`~~                           | 13                                                                                  | ? DONE ï¿½ Added `AUTH.INVALID_SIGNATURE`, `VALIDATION.INVALID_JSON`                      |
| ~~06~~                                                                                                 | ~~`src/constants/index.ts`~~                              | 13                                                                                  | ? DONE ï¿½ `ERROR_MESSAGES` already exported                                              |
| ~~07~~                                                                                                 | ~~`src/services/demo.service.ts`~~                        | 20,21                                                                               | ? DONE ï¿½ Created service                                                                |
| ~~08~~                                                                                                 | ~~`src/services/realtime-token.service.ts`~~              | 11,21                                                                               | ? DONE ï¿½ Created service                                                                |
| ~~09~~                                                                                                 | ~~`src/services/index.ts`~~                               | 20,21                                                                               | ? DONE ï¿½ Exported both new services                                                     |
| ~~10~~                                                                                                 | ~~`src/components/admin/SessionTableColumns.ts`~~         | 8,32                                                                                | ? DONE ï¿½ Created `SessionTableColumns.tsx`                                              |
| ~~11~~                                                                                                 | ~~`src/components/seller/PayoutTableColumns.ts`~~         | 8,32                                                                                | ? DONE ï¿½ Created `PayoutTableColumns.tsx`                                               |
| **WAVE 1 ï¿½ Tier 1 Primitives** (used everywhere ï¿½ fix before any feature code)                     |                                                           |                                                                                     |
| ~~12~~                                                                                                 | ~~`src/components/ui/SideDrawer.tsx`~~                    | 7,31                                                                                | ~~L263 h4?Heading ï¿½ L266 p?Text~~ ? DONE                                                |
| ~~13~~                                                                                                 | ~~`src/components/ui/FilterFacetSection.tsx`~~            | 5                                                                                   | ~~L184 toLocaleString?formatNumber~~ ? DONE                                               |
| ~~14~~                                                                                                 | ~~`src/components/ui/TablePagination.tsx`~~               | 5                                                                                   | ~~L74 toLocaleString?formatNumber~~ ? DONE                                                |
| ~~15~~                                                                                                 | ~~`src/components/ui/CategorySelectorCreate.tsx`~~        | 7,31                                                                                | ~~L126 label?Label~~ ? DONE                                                               |
| ~~16~~                                                                                                 | ~~`src/components/ui/ImageGallery.tsx`~~                  | 32                                                                                  | ~~L277 overflow-x-auto?HorizontalScroller~~ ? DONE                                        |
| **WAVE 2 ï¿½ Multi-violation files** (all violations in a file fixed in one pass, highest count first) |                                                           |                                                                                     |
| ~~17~~ `src/components/products/ProductReviews.tsx`                                                    | 5,7,31,32                                                 | L91 h2 ï¿½ L103 toFixed ï¿½ L144,147,182,202,206,232 pï¿½6 ï¿½ L212 overflow-x-auto |
| ~~18~~ `src/components/admin/AdminSessionsManager.tsx`                                                 | 5,8,32                                                    | L24,L279 new Date() ï¿½ L167ï¿½295 raw table                                        |
| ~~19~~ `src/features/events/components/EventFormDrawer.tsx`                                            | 7,31                                                      | L281,304,313,333 labelï¿½4 ï¿½ L295,347 pï¿½2                                       |
| ~~20~~ `src/features/events/components/SurveyFieldBuilder.tsx`                                         | 7,31                                                      | L53,72,108,129 labelï¿½4 ï¿½ L60 p                                                  |
| ~~21~~ `src/features/events/components/EventTypeConfig/PollConfigForm.tsx`                             | 7,31                                                      | L47,82,94,99 labelï¿½4                                                              |
| ~~22~~ `src/features/events/components/EventParticipateView.tsx`                                       | 7,31                                                      | L76 h2 ï¿½ L202 h1 ï¿½ L142,166 labelï¿½2                                           |
| ~~23~~ `src/features/admin/components/AdminReviewsView.tsx`                                            | 7,31                                                      | L227,247,267 labelï¿½3                                                              |
| ~~24~~ `src/components/user/settings/AccountInfoCard.tsx`                                              | 7,31                                                      | L48 h3 ï¿½ L53,56,61,64,69,72,77,80 pï¿½8                                           |
| ~~25~~ `src/components/seller/SellerStorefrontView.tsx`                                                | 5,7,31                                                    | L87 h1 ï¿½ L177,235 h2ï¿½2 ï¿½ L129,244 toFixedï¿½2                                 |
| ~~26~~ `src/components/user/profile/PublicProfileView.tsx`                                             | 5,7,31                                                    | L58 h1 ï¿½ L124,230 h2ï¿½2 ï¿½ L133,430 toFixedï¿½2                                 |
| ~~27~~ `src/features/admin/components/AdminAnalyticsView.tsx`                                          | 7,31                                                      | L165,218,248 h2ï¿½3 ï¿½ L103,268 pï¿½2                                              |
| ~~28~~ `src/components/promotions/CouponCard.tsx`                                                      | 7,31                                                      | L45 h3 ï¿½ L48,58,64,85 pï¿½4                                                       |
| ~~29~~ `src/features/categories/components/CategoryProductsView.tsx`                                   | 7,31                                                      | L126 h1 ï¿½ L91,130,171 pï¿½3                                                       |
| ~~30~~ `src/features/events/components/FeedbackEventSection.tsx`                                       | 7,31                                                      | L37,38 pï¿½2 ï¿½ L59 label                                                          |
| ~~31~~ `src/features/events/components/PollVotingSection.tsx`                                          | 7,31                                                      | L63,95 pï¿½2 ï¿½ L105 label                                                         |
| ~~32~~ `src/lib/monitoring/cache-metrics.ts`                                                           | 5                                                         | L183,205 toFixed ï¿½ L188,212 toLocaleString                                        |
| ~~33~~ `src/components/seller/SellerPayoutHistoryTable.tsx`                                            | 7,8,31,32                                                 | L59ï¿½61 h2 ï¿½ L76ï¿½120 raw table                                                 |
| ~~34~~ `src/features/seller/components/SellerOrdersView.tsx`                                           | 7,31,32                                                   | L113,172 pï¿½2 ï¿½ L124 overflow-x-auto                                             |
| ~~35~~ `src/features/auth/components/LoginForm.tsx`                                                    | 7,31                                                      | L100 p ï¿½ L158 label                                                               |
| ~~36~~ `src/features/auth/components/RegisterForm.tsx`                                                 | 7,31                                                      | L162 p ï¿½ L259 label                                                               |
| ~~37~~ `src/app/global-error.tsx`                                                                      | 7,31                                                      | L66 h1 ï¿½ L71 p                                                                    |
| ~~38~~ `src/components/promotions/ProductSection.tsx`                                                  | 7,31                                                      | L23 h2 ï¿½ L24 p                                                                    |
| ~~39~~ `src/features/events/components/EventTypeConfig/SurveyConfigForm.tsx`                           | 7,31                                                      | L24,38 labelï¿½2                                                                    |
| **WAVE 3 ï¿½ Single-violation files**                                                                  |                                                           |                                                                                     |
| ~~40~~ `src/features/search/components/SearchView.tsx`                                                 | 7,31                                                      | L122 h1 ï¿½ L125 p                                                                  |
| ~~41~~ `src/features/products/components/AuctionsView.tsx`                                             | 7,31                                                      | L91 h1 ï¿½ L94 p                                                                    |
| ~~42~~ `src/features/products/components/ProductsView.tsx`                                             | 7,31                                                      | L123 h1 ï¿½ L126 p                                                                  |
| ~~43~~ `src/components/seller/SellerTopProducts.tsx`                                                   | 7,31                                                      | L28ï¿½30 h2                                                                         |
| ~~44~~ `src/components/seller/SellerPayoutRequestForm.tsx`                                             | 7,31                                                      | L75ï¿½77 h2                                                                         |
| ~~45~~ `src/components/seller/SellerRevenueChart.tsx`                                                  | 7,31                                                      | L54ï¿½56 h2                                                                         |
| ~~46~~ `src/components/user/profile/ProfileHeader.tsx`                                                 | 7,31                                                      | L62 h1                                                                              |
| ~~47~~ `src/components/user/settings/ProfileInfoForm.tsx`                                              | 7,31                                                      | L86 h3                                                                              |
| ~~48~~ `src/components/user/addresses/AddressForm.tsx`                                                 | 7,31                                                      | L188 label                                                                          |
| ~~49~~ `src/components/user/notifications/NotificationsBulkActions.tsx`                                | 7,31                                                      | L24 h1                                                                              |
| ~~50~~ `src/features/seller/components/SellerStatCard.tsx`                                             | 7,31                                                      | L45 p                                                                               |
| ~~51~~ `src/features/seller/components/SellerProductCard.tsx`                                          | 7,31                                                      | L42,46 pï¿½2                                                                        |
| ~~52~~ `src/features/events/components/SurveyEventSection.tsx`                                         | 7,31                                                      | L49 p                                                                               |
| ~~53~~ `src/features/events/components/EventTypeConfig/FeedbackConfigForm.tsx`                         | 7,31                                                      | L25 label                                                                           |
| ~~54~~ `src/components/admin/products/ProductTableColumns.tsx`                                         | 5                                                         | L69 toLocaleString?formatCurrency                                                   |
| ~~55~~ `src/components/admin/coupons/CouponTableColumns.tsx`                                           | 5                                                         | L88 toLocaleString?formatCurrency                                                   |
| ~~56~~ `src/components/admin/AdminStatsCards.tsx`                                                      | 5                                                         | L92 toLocaleString?formatNumber                                                     |
| ~~57~~ `src/components/homepage/TopCategoriesSection.tsx`                                              | 5                                                         | L148 toLocaleString?formatNumber                                                    |
| ~~58~~ `src/components/homepage/WhatsAppCommunitySection.tsx`                                          | 5                                                         | L86 toLocaleString?formatNumber                                                     |
| ~~59~~ `src/components/faq/FAQAccordion.tsx`                                                           | 5                                                         | L150 toLocaleString?formatNumber                                                    |
| ~~60~~ `src/components/admin/ImageUpload.tsx`                                                          | 5                                                         | L65 toFixed?formatNumber                                                            |
| ~~61~~ `src/components/modals/ImageCropModal.tsx`                                                      | 5                                                         | L218,342,343 toFixed?Math.round                                                     |
| ~~62~~ `src/features/admin/components/AdminPayoutsView.tsx`                                            | 5                                                         | L61,68 new Date()?isSameMonth/nowMs                                                 |
| ~~63~~ `src/components/homepage/FeaturedAuctionsSection.tsx`                                           | 5                                                         | L165 new Date()?nowMs                                                               |
| ~~64~~ `src/components/auctions/AuctionCard.tsx`                                                       | 5                                                         | L35 Date.now()?nowMs                                                                |
| ~~65~~ `src/components/layout/Footer.tsx`                                                              | 5                                                         | L206 getFullYear()?currentYear                                                      |
| ~~66~~ `src/components/feedback/Toast.tsx`                                                             | 5                                                         | L72 Date.now()?nowMs                                                                |
| ~~67~~ `src/components/ErrorBoundary.tsx`                                                              | 5                                                         | L115 toISOString()?nowISO                                                           |
| ~~68~~ `src/lib/email.ts`                                                                              | 5                                                         | L350,397 toLocaleString?formatDateTime                                              |
| ~~69~~ `src/features/user/components/UserOrdersView.tsx`                                               | 32                                                        | L94 overflow-x-auto?Tabs                                                            |
| ~~70~~ `src/components/homepage/FAQSection.tsx`                                                        | 32                                                        | L58 overflow-x-auto?Tabs                                                            |
| ~~71~~ `src/components/products/ProductImageGallery.tsx`                                               | 32                                                        | L48 overflow-x-auto?HorizontalScroller                                              |
| ~~72~~ `src/components/homepage/HeroCarousel.tsx`                                                      | 32                                                        | L155 overflow-x-auto?HorizontalScroller                                             |
| ~~73~~ `src/components/layout/BottomNavbar.tsx`                                                        | 32                                                        | L111 overflow-x-auto ï¿½ remove or HorizontalScroller                               |
| ~~74~~ `src/app/api/payment/webhook/route.ts`                                                          | 13                                                        | L48,56 raw error strings?error classes                                              |
| ~~75~~ `src/app/api/auth/login/route.ts`                                                               | 12                                                        | L61 direct Firestore?userRepository                                                 |
| ~~76~~ `src/app/api/auth/register/route.ts`                                                            | 12                                                        | L76 direct Firestore?userRepository                                                 |
| ~~77~~ `src/app/api/auth/session/route.ts`                                                             | 12                                                        | L49 direct Firestore?sessionRepository                                              |
| ~~78~~ `src/hooks/useRealtimeBids.ts`                                                                  | 11                                                        | L17 wrong Firebase import?realtimeApp + custom token                                |
| ~~79~~ `src/contexts/SessionContext.tsx`                                                               | 11                                                        | L25 Firebase type?AuthUser                                                          |
| **WAVE 4 ï¿½ Page decompositions** (largest first)                                                     |                                                           |                                                                                     |
| ~~80~~                                                                                                 | ~~`src/app/[locale]/demo/seed/page.tsx`~~                 | 10,20                                                                               | DONE — 4 lines, DemoSeedView (Rule 20 fixed via demoService)                              |
| ~~81~~                                                                                                 | ~~`src/app/[locale]/user/settings/page.tsx`~~             | 10                                                                                  | DONE — 4 lines, UserSettingsView                                                          |
| ~~82~~                                                                                                 | ~~`src/app/[locale]/blog/[slug]/page.tsx`~~               | 10                                                                                  | DONE — 10 lines, BlogPostView                                                             |
| ~~83~~                                                                                                 | ~~`src/app/[locale]/seller/products/[id]/edit/page.tsx`~~ | 10                                                                                  | DONE — 14 lines, SellerEditProductView                                                    |
| ~~84~~                                                                                                 | ~~`src/app/[locale]/user/addresses/page.tsx`~~            | 10                                                                                  | DONE — 4 lines, UserAddressesView                                                         |
| ~~85~~                                                                                                 | ~~`src/app/[locale]/products/[slug]/page.tsx`~~           | 10                                                                                  | DONE — 10 lines, ProductDetailView (view has violations, see W5)                          |
| ~~86~~                                                                                                 | ~~`src/app/[locale]/sellers/page.tsx`~~                   | 10                                                                                  | DONE — 13 lines, SellersListView (view has violations, see W5)                            |
| ~~87~~                                                                                                 | ~~`src/app/[locale]/about/page.tsx`~~                     | 10                                                                                  | DONE — 13 lines, AboutView                                                                |
| ~~88~~                                                                                                 | ~~`src/app/[locale]/admin/media/page.tsx`~~               | 10                                                                                  | DONE — 4 lines, AdminMediaView                                                            |
| ~~89~~                                                                                                 | ~~`src/app/[locale]/cart/page.tsx`~~                      | 10                                                                                  | DONE — 4 lines, CartView                                                                  |
| ~~90~~                                                                                                 | `src/app/[locale]/admin/site/page.tsx`                    | 10                                                                                  | 162 lines ? AdminSiteView                                                                 |
| ~~91~~                                                                                                 | `src/app/[locale]/user/notifications/page.tsx`            | 10                                                                                  | 156 lines ? UserNotificationsView                                                         |
| ~~92~~                                                                                                 | `src/app/[locale]/admin/events/page.tsx`                  | 10                                                                                  | 153 lines ? AdminEventsView                                                               |
| ~~93~~                                                                                                 | `src/app/[locale]/user/addresses/edit/[id]/page.tsx`      | 10                                                                                  | 150 lines ? UserEditAddressView                                                           |
| **WAVE 5 — Newly discovered violations** (re-run #4 audit, 2026-03-02)                                 |                                                           |                                                                                     |
| 94                                                                                                     | `src/components/user/addresses/AddressCard.tsx`           | 7,31                                                                                | L65 h3, L98,101,102,103,104,107 p×6 → Heading/Text                                        |
| 95                                                                                                     | `src/features/seller/components/SellersListView.tsx`      | 7,31                                                                                | L34 h1, L35,62,63,115,137,152 p×6, L72,101,123,145 h2×4, L85,112,134 h3×3                 |
| 96                                                                                                     | `src/components/user/orders/OrderTrackingView.tsx`        | 7,31                                                                                | L256 h1, L259 p, L293 h2 → Heading/Text                                                   |
| 97                                                                                                     | `src/components/user/notifications/NotificationItem.tsx`  | 7,31                                                                                | L58,65,68 p×3 → Text                                                                      |
| 98                                                                                                     | `src/features/products/components/ProductDetailView.tsx`  | 7,31                                                                                | L66 h1, L69 p → Heading/Text                                                              |
| 99                                                                                                     | `src/components/user/addresses/AddressForm.tsx`           | 7,8,31                                                                              | L188 label + L189 input[checkbox] → Checkbox from @/components                            |
| 100                                                                                                    | `src/components/user/profile/ProfileStatsGrid.tsx`        | 7,31                                                                                | L127 p → Text                                                                             |
| 101                                                                                                    | `src/components/user/settings/EmailVerificationCard.tsx`  | 7,31                                                                                | L53 h3 → Heading(3)                                                                       |
| 102                                                                                                    | `src/components/user/settings/PhoneVerificationCard.tsx`  | 7,31                                                                                | L58 h3 → Heading(3)                                                                       |
| 103                                                                                                    | `src/components/ui/AddressSelectorCreate.tsx`             | 7,31                                                                                | L99 raw label → Label                                                                     |
| 104                                                                                                    | `src/components/utility/Search.tsx`                       | 7,31                                                                                | L142 p → Text                                                                             |
| 105                                                                                                    | `src/components/ui/FilterFacetSection.tsx`                | 7,31                                                                                | L160 p → Text (missed in task 13)                                                         |
| ~~TS~~                                                                                                 | ~~test files~~                                            | —                                                                                   | DONE — SurveyConfigForm.test.tsx missing `order`, cache-metrics.test.ts spread/arg errors |

---

## Execution Protocol

After completing all tasks in a wave:

```bash
npx tsc --noEmit   # 0 errors required before proceeding
```

After completing all four waves:

```bash
npx tsc --noEmit
npm run build
npm test
npm run lint
```

Each task requires:

- `__tests__` file created or updated for every changed source file
- `docs/CHANGELOG.md` entry
- `docs/GUIDE.md` updated for any new utility function, component, or service

---

## WAVE 0 ï¿½ Detailed Tasks

---

### 01 ï¿½ `src/utils/formatters/date.formatter.ts`

**Rule 5** ï¿½ Add three missing utility functions. These are referenced by tasks 18, 29, 62ï¿½67.

```ts
// ADD ï¿½ after existing exports

/** True when two dates fall in the same calendar month and year. */
export function isSameMonth(a: Date | number, b: Date | number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth()
  );
}

/** Returns the current four-digit year as a string. */
export function currentYear(): string {
  return new Date(nowMs()).getFullYear().toString();
}

/** Returns the current instant as an ISO 8601 string. */
export function nowISO(): string {
  return new Date(nowMs()).toISOString();
}
```

- [x] Add `isSameMonth`, `currentYear`, `nowISO` to `src/utils/formatters/date.formatter.ts`
- [x] `npx tsc --noEmit src/utils/formatters/date.formatter.ts`

---

### 02 ï¿½ `src/utils/index.ts`

**Rule 5** ï¿½ Re-export the three new date functions.

```ts
// ADD to the date-formatter export line (or add individually)
export { isSameMonth, currentYear, nowISO } from "./formatters/date.formatter";
```

- [x] Update barrel; `npx tsc --noEmit src/utils/index.ts`

---

### 03 ï¿½ `src/utils/formatters/number.formatter.ts`

**Rule 5** ï¿½ Extend `formatNumber` in-place with a `decimals` option. Do not create a new function.

```ts
// BEFORE (example signature)
export function formatNumber(num: number, locale: string = "en-US"): string {
  return new Intl.NumberFormat(locale).format(num);
}

// AFTER ï¿½ extend, do not duplicate
export function formatNumber(
  num: number,
  locale: string = "en-US",
  options?: { decimals?: number },
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: options?.decimals,
    maximumFractionDigits: options?.decimals,
  }).format(num);
}
```

- [x] Extend `formatNumber` in `src/utils/formatters/number.formatter.ts`
- [x] Verify all existing callers still compile: `npx tsc --noEmit src/utils/`

---

### 04 ï¿½ `src/constants/api-endpoints.ts`

**Rules 19, 20** ï¿½ Add two missing endpoint constants.

```ts
// ADD inside the exported API_ENDPOINTS object
DEMO: {
  SEED: '/api/demo/seed',
},
REALTIME: {
  TOKEN: '/api/realtime/token',
},
```

- [x] Edit file; `npx tsc --noEmit src/constants/api-endpoints.ts`

---

### 05 ï¿½ `src/constants/messages.ts`

**Rule 13** ï¿½ Add two missing error message constants.

```ts
// ADD inside ERROR_MESSAGES.AUTH
INVALID_SIGNATURE: 'Invalid webhook signature.',

// ADD inside ERROR_MESSAGES.VALIDATION
INVALID_JSON: 'Request body contains invalid JSON.',
```

- [x] Edit file; `npx tsc --noEmit src/constants/messages.ts`

---

### 06 ï¿½ `src/constants/index.ts`

**Rule 13** ï¿½ Confirm `ERROR_MESSAGES` is re-exported (no change needed if already barrel-exported).

- [x] Verify `ERROR_MESSAGES` is exported; add re-export if absent

---

### 07 ï¿½ `src/services/demo.service.ts`

**Rules 20, 21** ï¿½ New service file. Delete the direct `fetch()` in the page when task 80 runs.

```ts
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export const demoService = {
  seed: (payload: unknown) => apiClient.post(API_ENDPOINTS.DEMO.SEED, payload),
};
```

- [x] Create `src/services/demo.service.ts`
- [x] Create `src/services/__tests__/demo.service.test.ts`

---

### 08 ï¿½ `src/services/realtime-token.service.ts`

**Rules 11, 21** ï¿½ New service file.

```ts
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export const realtimeTokenService = {
  getToken: () =>
    apiClient.post<{ customToken: string; expiresAt: number }>(
      API_ENDPOINTS.REALTIME.TOKEN,
      {},
    ),
};
```

- [x] Create `src/services/realtime-token.service.ts`
- [x] Create `src/services/__tests__/realtime-token.service.test.ts`

---

### 09 ï¿½ `src/services/index.ts`

**Rules 20, 21** ï¿½ Export both new services.

```ts
// ADD
export * from "./demo.service";
export * from "./realtime-token.service";
```

- [x] Update barrel; `npx tsc --noEmit src/services/index.ts`

---

### 10 ï¿½ `src/components/admin/SessionTableColumns.ts`

**Rules 8, 32** ï¿½ New column definitions file required before task 18.

```ts
import type { ColumnDef } from '@/components';
import type { Session } from '@/types';   // use actual session type from codebase
import { Text, Caption } from '@/components';
import { formatDateTime, isFuture } from '@/utils';
import { StatusBadge } from '@/components';

export const SESSION_TABLE_COLUMNS: ColumnDef<Session>[] = [
  { key: 'device', header: 'Device', render: (s) => <Text size="sm">{s.device?.browser ?? 'ï¿½'}</Text> },
  { key: 'ip', header: 'IP', render: (s) => <Caption>{s.ipAddress}</Caption> },
  { key: 'lastActivity', header: 'Last Active', render: (s) => <Caption>{formatDateTime(s.lastActivity)}</Caption> },
  { key: 'expires', header: 'Status', render: (s) => <StatusBadge active={isFuture(s.expiresAt)} /> },
];
```

Adjust field names to match the actual `Session` type in the codebase.

- [x] Create `src/components/admin/SessionTableColumns.ts`
- [x] `npx tsc --noEmit src/components/admin/SessionTableColumns.ts`

---

### 11 ï¿½ `src/components/seller/PayoutTableColumns.ts`

**Rules 8, 32** ï¿½ New column definitions file required before task 33.

```ts
import type { ColumnDef } from '@/components';
import type { Payout } from '@/types';    // use actual payout type
import { Text, Caption } from '@/components';
import { formatDateTime, formatCurrency } from '@/utils';
import { StatusBadge } from '@/components';

export const PAYOUT_TABLE_COLUMNS: ColumnDef<Payout>[] = [
  { key: 'amount', header: 'Amount', render: (p) => <Text weight="medium">{formatCurrency(p.amount, 'INR', 'en-IN')}</Text> },
  { key: 'status', header: 'Status', render: (p) => <StatusBadge active={p.status === 'paid'} /> },
  { key: 'processedAt', header: 'Processed', render: (p) => <Caption>{p.processedAt ? formatDateTime(p.processedAt) : 'ï¿½'}</Caption> },
];
```

Adjust field names to match the actual `Payout` type.

- [x] Create `src/components/seller/PayoutTableColumns.ts`
- [x] `npx tsc --noEmit src/components/seller/PayoutTableColumns.ts`

---

## WAVE 1 ï¿½ Detailed Tasks

Typography fix pattern used throughout:

```tsx
import { Heading, Text, Label } from "@/components";
// h1ï¿½h6 ? <Heading level={n}>
// p     ? <Text variant="secondary"?> (match the semantic intent)
// label ? <Label required?={...}>
// After: delete unused THEME_CONSTANTS.typography / themed destructures
```

---

### 12 ï¿½ `src/components/ui/SideDrawer.tsx` L263, L266

**Rules 7, 31** ?? Tier 1

```tsx
// DELETE L263
<h4 className={...}>{title}</h4>
// REPLACE
<Heading level={4}>{title}</Heading>

// DELETE L266
<p className={...}>{description}</p>
// REPLACE
<Text variant="secondary" size="sm">{description}</Text>
```

- [x] Fix L263, L266; remove dead `typography`/`themed` imports; update `__tests__/SideDrawer.test.tsx`

---

### 13 ï¿½ `src/components/ui/FilterFacetSection.tsx` L184

**Rule 5** ?? Tier 1

```tsx
// DELETE
{
  opt.count.toLocaleString();
}
// REPLACE
import { formatNumber } from "@/utils";
{
  formatNumber(opt.count);
}
```

- [x] Fix L184; update `__tests__/FilterFacetSection.test.tsx`

---

### 14 ï¿½ `src/components/ui/TablePagination.tsx` L74

**Rule 5** ?? Tier 1

```tsx
// DELETE
{
  total.toLocaleString();
}
// REPLACE
import { formatNumber } from "@/utils";
{
  formatNumber(total);
}
```

- [x] Fix L74; update `__tests__/TablePagination.test.tsx`

---

### 15 ï¿½ `src/components/ui/CategorySelectorCreate.tsx` L126

**Rules 7, 31** ?? Tier 1

```tsx
// DELETE
<label className="block text-sm font-medium mb-1">{...}</label>
// REPLACE
import { Label } from '@/components';
<Label>{...}</Label>
```

- [x] Fix L126; update `__tests__/CategorySelectorCreate.test.tsx`

---

### 16 ï¿½ `src/components/ui/ImageGallery.tsx` L277

**Rule 32** ?? Tier 1

```tsx
// DELETE
<div className="mt-4 flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory touch-pan-x">
  {thumbnails}
</div>;
// REPLACE
import { HorizontalScroller } from "@/components";
<HorizontalScroller snapToItems className="mt-4 pb-2">
  {thumbnails}
</HorizontalScroller>;
```

- [x] Fix L277; update `__tests__/ImageGallery.test.tsx`

---

## WAVE 2 ï¿½ Detailed Tasks

---

### 17 ï¿½ `src/components/products/ProductReviews.tsx`

**Rules 5, 7, 31, 32** ï¿½ 9 violations; fix all in one pass.

```tsx
// L91: h2 ? Heading
<Heading level={2}>{...}</Heading>

// L103: toFixed(1) ? formatNumber
import { formatNumber } from '@/utils';
{formatNumber(avgRating, 'en-US', { decimals: 1 })}

// L144, 147, 182, 202, 206, 232: p ? Text (match variant to intent)
<Text variant="secondary" size="sm">{...}</Text>

// L212: overflow-x-auto ? HorizontalScroller
import { HorizontalScroller } from '@/components';
<HorizontalScroller className="pb-1 pt-1">{attachments}</HorizontalScroller>
```

- [x] Fix all 9 instances in one edit; update `__tests__/ProductReviews.test.tsx`

---

### 18 ï¿½ `src/components/admin/AdminSessionsManager.tsx`

**Rules 5, 8, 32** ï¿½ date violations + raw table; fix all in one pass.

```tsx
// L24: raw new Date()
import { nowMs, isFuture } from "@/utils";
const now = nowMs(); // replace const now = new Date();

// L279: date comparison
isFuture(session.expiresAt); // replace: new Date(session.expiresAt) > new Date()

// L167ï¿½295: delete entire <table>...</table> block
// REPLACE with DataTable using columns from task 10
import { DataTable } from "@/components";
import { SESSION_TABLE_COLUMNS } from "./SessionTableColumns";
<DataTable columns={SESSION_TABLE_COLUMNS} data={sessions} loading={loading} />;
```

Delete all `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` tags and their enclosing divs.

- [x] Fix dates L24, L279; replace raw table L167ï¿½295 with DataTable; update `__tests__/AdminSessionsManager.test.tsx`

---

### 19 ï¿½ `src/features/events/components/EventFormDrawer.tsx`

**Rules 7, 31** ï¿½ 6 violations.

```tsx
// L281, 304, 313, 333: label ? Label
import { Label } from '@/components';
<Label>{...}</Label>   // ï¿½4

// L295, 347: p ? Text
import { Text } from '@/components';
<Text size="xs" variant="secondary">{...}</Text>  // ï¿½2
```

- [x] Fix all 6; update `__tests__/EventFormDrawer.test.tsx`

---

### 20 ï¿½ `src/features/events/components/SurveyFieldBuilder.tsx`

**Rules 7, 31** ï¿½ 5 violations.

```tsx
// L53, 72, 108, 129: label ? Label  (ï¿½4)
<Label>{...}</Label>

// L60: p ? Text
<Text size="sm" variant="muted" className="italic">{...}</Text>
```

- [x] Fix all 5; update `__tests__/SurveyFieldBuilder.test.tsx`

---

### 21 ï¿½ `src/features/events/components/EventTypeConfig/PollConfigForm.tsx`

**Rules 7, 31** ï¿½ 4 label violations.

```tsx
// L47, 82, 94, 99: label ? Label  (ï¿½4)
import { Label } from '@/components';
<Label>{...}</Label>
```

- [x] Fix all 4; update `__tests__/PollConfigForm.test.tsx`

---

### 22 ï¿½ `src/features/events/components/EventParticipateView.tsx`

**Rules 7, 31** ï¿½ 4 violations.

```tsx
// L76: h2 ? Heading(2)
// L202: h1 ? Heading(1)
// L142, 166: label ? Label  (ï¿½2)
import { Heading, Label } from "@/components";
```

- [x] Fix all 4; update `__tests__/EventParticipateView.test.tsx`

---

### 23 ï¿½ `src/features/admin/components/AdminReviewsView.tsx`

**Rules 7, 31** ï¿½ 3 label violations.

```tsx
// L227, 247, 267: label ? Label  (ï¿½3)
import { Label } from '@/components';
<Label>{...}</Label>
```

- [x] Fix all 3; update `__tests__/AdminReviewsView.test.tsx`

---

### 24 ï¿½ `src/components/user/settings/AccountInfoCard.tsx`

**Rules 7, 31** ï¿½ 9 violations.

```tsx
// L48: h3 ? Heading(3)
import { Heading, Text } from '@/components';
<Heading level={3}>{...}</Heading>

// L53, 56, 61, 64, 69, 72, 77, 80: p ? Text  (ï¿½8)
<Text size="sm" variant="secondary">{...}</Text>
```

- [x] Fix all 9; update `__tests__/AccountInfoCard.test.tsx`

---

### 25 ï¿½ `src/components/seller/SellerStorefrontView.tsx`

**Rules 5, 7, 31** ï¿½ 5 violations.

```tsx
// L87: h1 ? Heading(1)
// L177, 235: h2 ? Heading(2)  (ï¿½2)
import { Heading } from "@/components";

// L129, 244: toFixed(1) ? formatNumber  (ï¿½2)
import { formatNumber } from "@/utils";
{
  formatNumber(reviewsData.averageRating, "en-US", { decimals: 1 });
}
```

- [x] Fix all 5; update `__tests__/SellerStorefrontView.test.tsx`

---

### 26 ï¿½ `src/components/user/profile/PublicProfileView.tsx`

**Rules 5, 7, 31** ï¿½ 5 violations.

```tsx
// L58: h1 ? Heading(1)
// L124, 230: h2 ? Heading(2)  (ï¿½2)
import { Heading } from "@/components";

// L133, 430: toFixed(1) ? formatNumber  (ï¿½2)
import { formatNumber } from "@/utils";
{
  formatNumber(value, "en-US", { decimals: 1 });
}
```

- [x] Fix all 5; update `__tests__/PublicProfileView.test.tsx`

---

### 27 ï¿½ `src/features/admin/components/AdminAnalyticsView.tsx`

**Rules 7, 31** ï¿½ 5 violations.

```tsx
// L165, 218, 248: h2 ? Heading(2)  (ï¿½3)
import { Heading, Text } from '@/components';
<Heading level={2}>{...}</Heading>

// L103, 268: p ? Text  (ï¿½2)
<Text size="sm" variant="secondary">{...}</Text>
```

- [x] Fix all 5; update `__tests__/AdminAnalyticsView.test.tsx`

---

### 28 ï¿½ `src/components/promotions/CouponCard.tsx`

**Rules 7, 31** ï¿½ 5 violations.

```tsx
// L45: h3 ? Heading(3)
import { Heading, Text } from '@/components';
<Heading level={3}>{...}</Heading>

// L48, 58, 64, 85: p ? Text  (ï¿½4)
<Text size="sm">{...}</Text>
```

- [x] Fix all 5; update `__tests__/CouponCard.test.tsx`

---

### 29 ï¿½ `src/features/categories/components/CategoryProductsView.tsx`

**Rules 7, 31** ï¿½ 4 violations.

```tsx
// L126: h1 ? Heading(1)
import { Heading, Text } from '@/components';
<Heading level={1}>{...}</Heading>

// L91, 130, 171: p ? Text  (ï¿½3)
<Text variant="secondary" size="sm">{...}</Text>
```

- [x] Fix all 4; update `__tests__/CategoryProductsView.test.tsx`

---

### 30 ï¿½ `src/features/events/components/FeedbackEventSection.tsx`

**Rules 7, 31** ï¿½ 3 violations.

```tsx
// L37, 38: p ? Text  (ï¿½2)
import { Text, Label } from '@/components';
<Text weight="medium">{...}</Text>
<Text size="sm">{...}</Text>

// L59: label ? Label
<Label>{...}</Label>
```

- [x] Fix all 3; update `__tests__/FeedbackEventSection.test.tsx`

---

### 31 ï¿½ `src/features/events/components/PollVotingSection.tsx`

**Rules 7, 31** ï¿½ 3 violations.

```tsx
// L63, 95: p ? Text  (ï¿½2)
import { Text, Label } from '@/components';
<Text size="sm">{...}</Text>

// L105: label ? Label
<Label>{...}</Label>
```

- [x] Fix all 3; update `__tests__/PollVotingSection.test.tsx`

---

### 32 ï¿½ `src/lib/monitoring/cache-metrics.ts`

**Rule 5** ï¿½ 4 violations; all number/date formatting.

```ts
// L183: hitRate.toFixed(2)
import { formatNumber } from "@/utils";
formatNumber(hitRate, "en-US", { decimals: 2 });

// L188: new Date(stats.metrics.lastReset).toLocaleString()
import { formatDateTime } from "@/utils";
formatDateTime(stats.metrics.lastReset);

// L205: same pattern as L183
formatNumber(value, "en-US", { decimals: 2 });

// L212: same pattern as L188
formatDateTime(value);
```

- [x] Fix all 4; update `__tests__/cache-metrics.test.ts`

---

### 33 ï¿½ `src/components/seller/SellerPayoutHistoryTable.tsx`

**Rules 7, 8, 31, 32** ï¿½ heading + raw table; fix both in one pass.

```tsx
// L59ï¿½61: h2 ? Heading(2)
import { Heading } from '@/components';
<Heading level={2}>{...}</Heading>

// L76ï¿½120: delete entire <table>...</table> block
// REPLACE with DataTable using columns from task 11
import { DataTable } from '@/components';
import { PAYOUT_TABLE_COLUMNS } from './PayoutTableColumns';
<DataTable columns={PAYOUT_TABLE_COLUMNS} data={payouts} loading={loading} />
```

- [x] Fix heading; replace raw table; update `__tests__/SellerPayoutHistoryTable.test.tsx`

---

### 34 ï¿½ `src/features/seller/components/SellerOrdersView.tsx`

**Rules 7, 31, 32** ï¿½ 3 violations.

```tsx
// L113, 172: p ? Text  (ï¿½2)
import { Text } from '@/components';
<Text size="sm">{...}</Text>

// L124: overflow-x-auto status tab row ? Tabs
import { Tabs } from '@/components';
// DELETE: <div className={`flex gap-1 overflow-x-auto border-b ...`}>...</div>
// REPLACE:
<Tabs
  variant="line"
  activeId={table.get('status') || STATUS_TABS[0].id}
  onChange={(id) => table.set('status', id)}
  items={STATUS_TABS.map(t => ({ id: t.id, label: t.label, content: null }))}
/>
```

- [x] Fix all 3; update `__tests__/SellerOrdersView.test.tsx`

---

### 35 ï¿½ `src/features/auth/components/LoginForm.tsx`

**Rules 7, 31** ï¿½ 2 violations.

```tsx
// L100: p ? Text
import { Text, Label } from '@/components';
<Text size="sm" className="mt-2 text-center">{...}</Text>

// L158: label ? Label
<Label>{...}</Label>
```

- [x] Fix both; update `__tests__/LoginForm.test.tsx`

---

### 36 ï¿½ `src/features/auth/components/RegisterForm.tsx`

**Rules 7, 31** ï¿½ 2 violations.

```tsx
// L162: p ? Text
<Text size="sm" className="mt-2 text-center">{...}</Text>

// L259: label ? Label
<Label>{...}</Label>
```

- [x] Fix both; update `__tests__/RegisterForm.test.tsx`

---

### 37 ï¿½ `src/app/global-error.tsx`

**Rules 7, 31** ï¿½ 2 violations.

```tsx
// L66: h1 ? Heading(1)
import { Heading, Text } from '@/components';
<Heading level={1}>{...}</Heading>

// L71: p ? Text
<Text variant="secondary">{...}</Text>
```

- [x] Fix both; update `src/app/__tests__/global-error.test.tsx`

---

### 38 ï¿½ `src/components/promotions/ProductSection.tsx`

**Rules 7, 31** ï¿½ 2 violations.

```tsx
// L23: h2 ? Heading(2)
import { Heading, Text } from '@/components';
<Heading level={2}>{...}</Heading>

// L24: p ? Text
<Text variant="secondary" className="mt-1">{...}</Text>
```

- [x] Fix both; update `__tests__/ProductSection.test.tsx`

---

### 39 ï¿½ `src/features/events/components/EventTypeConfig/SurveyConfigForm.tsx`

**Rules 7, 31** ï¿½ 2 label violations.

```tsx
// L24, 38: label ? Label  (ï¿½2)
import { Label } from '@/components';
<Label>{...}</Label>
```

- [x] Fix both; update `__tests__/SurveyConfigForm.test.tsx`

---

## WAVE 3 ï¿½ Detailed Tasks

All typography fixes use the same pattern: import `Heading`/`Text`/`Label` from `@/components`, replace raw tag, delete unused Tailwind class string variables.

---

### 40 ï¿½ `src/features/search/components/SearchView.tsx` L122, L125

`<h1>` ? `<Heading level={1}>` ï¿½ `<p>` ? `<Text>`

- [x] Fix; update `__tests__/SearchView.test.tsx`

### 41 ï¿½ `src/features/products/components/AuctionsView.tsx` L91, L94

`<h1>` ? `<Heading level={1}>` ï¿½ `<p>` ? `<Text>`

- [x] Fix; update `__tests__/AuctionsView.test.tsx`

### 42 ï¿½ `src/features/products/components/ProductsView.tsx` L123, L126

`<h1>` ? `<Heading level={1}>` ï¿½ `<p>` ? `<Text>`

- [x] Fix; update `__tests__/ProductsView.test.tsx`

### 43 ï¿½ `src/components/seller/SellerTopProducts.tsx` L28ï¿½30

`<h2>` ? `<Heading level={2}>`

- [x] Fix; update `__tests__/SellerTopProducts.test.tsx`

### 44 ï¿½ `src/components/seller/SellerPayoutRequestForm.tsx` L75ï¿½77

`<h2>` ? `<Heading level={2}>`

- [x] Fix; update `__tests__/SellerPayoutRequestForm.test.tsx`

### 45 ï¿½ `src/components/seller/SellerRevenueChart.tsx` L54ï¿½56

`<h2>` ? `<Heading level={2}>`

- [x] Fix; update `__tests__/SellerRevenueChart.test.tsx`

### 46 ï¿½ `src/components/user/profile/ProfileHeader.tsx` L62

`<h1>` ? `<Heading level={1}>`

- [x] Fix; update `__tests__/ProfileHeader.test.tsx`

### 47 ï¿½ `src/components/user/settings/ProfileInfoForm.tsx` L86

`<h3>` ? `<Heading level={3}>`

- [x] Fix; update `__tests__/ProfileInfoForm.test.tsx`

### 48 ï¿½ `src/components/user/addresses/AddressForm.tsx` L188

`<label>` ? `<Label>`

- [x] Fix; update `__tests__/AddressForm.test.tsx`

### 49 ï¿½ `src/components/user/notifications/NotificationsBulkActions.tsx` L24

`<h1>` ? `<Heading level={1}>`

- [x] Fix; update `__tests__/NotificationsBulkActions.test.tsx`

### 50 ï¿½ `src/features/seller/components/SellerStatCard.tsx` L45

`<p>` ? `<Text size="3xl" weight="bold">` (preserve the large bold stat style via props, not class string)

- [x] Fix; update `__tests__/SellerStatCard.test.tsx`

### 51 ï¿½ `src/features/seller/components/SellerProductCard.tsx` L42, L46

`<p>` ? `<Text>` ï¿½2

- [x] Fix; update `__tests__/SellerProductCard.test.tsx`

### 52 ï¿½ `src/features/events/components/SurveyEventSection.tsx` L49

`<p>` ? `<Text size="sm" variant="secondary">`

- [x] Fix; update `__tests__/SurveyEventSection.test.tsx`

### 53 ï¿½ `src/features/events/components/EventTypeConfig/FeedbackConfigForm.tsx` L25

`<label>` ? `<Label>`

- [x] Fix; update `__tests__/FeedbackConfigForm.test.tsx`

---

### 54 ï¿½ `src/components/admin/products/ProductTableColumns.tsx` L69

**Rule 5**

```tsx
// DELETE: ?{product.price?.toLocaleString("en-IN") ?? "0"}
// REPLACE:
import { formatCurrency } from "@/utils";
{
  formatCurrency(product.price ?? 0, "INR", "en-IN");
}
```

- [x] Fix; update `__tests__/ProductTableColumns.test.tsx`

### 55 ï¿½ `src/components/admin/coupons/CouponTableColumns.tsx` L88

**Rule 5**

```tsx
// DELETE: ?{discount.value.toLocaleString("en-IN")}
// REPLACE:
{
  formatCurrency(discount.value, "INR", "en-IN");
}
```

- [x] Fix; update `__tests__/CouponTableColumns.test.tsx`

### 56 ï¿½ `src/components/admin/AdminStatsCards.tsx` L92

**Rule 5**

```tsx
// DELETE: {card.value.toLocaleString()}
// REPLACE:
{
  formatNumber(card.value);
}
```

- [x] Fix; update `__tests__/AdminStatsCards.test.tsx`

### 57 ï¿½ `src/components/homepage/TopCategoriesSection.tsx` L148

**Rule 5**

```tsx
// DELETE: {(category.metrics?.totalItemCount ?? 0).toLocaleString()}
// REPLACE:
{
  formatNumber(category.metrics?.totalItemCount ?? 0);
}
```

- [x] Fix; update `__tests__/TopCategoriesSection.test.tsx`

### 58 ï¿½ `src/components/homepage/WhatsAppCommunitySection.tsx` L86

**Rule 5**

```tsx
// DELETE: {config.memberCount.toLocaleString()} members
// REPLACE:
{
  formatNumber(config.memberCount);
}
{
  t("members");
}
```

- [x] Fix; update `__tests__/WhatsAppCommunitySection.test.tsx`

### 59 ï¿½ `src/components/faq/FAQAccordion.tsx` L150

**Rule 5**

```tsx
// DELETE: {faq.stats.views.toLocaleString()} views
// REPLACE:
{
  formatNumber(faq.stats.views);
}
{
  t("views");
}
```

- [x] Fix; update `__tests__/FAQAccordion.test.tsx`

### 60 ï¿½ `src/components/admin/ImageUpload.tsx` L65

**Rule 5**

```tsx
// DELETE: `File size (${fileSizeMB.toFixed(2)}MB) exceeds ...`
// REPLACE:
`File size (${formatNumber(fileSizeMB, "en-US", { decimals: 2 })}MB) exceeds ...`;
```

- [x] Fix; update `__tests__/ImageUpload.test.tsx`

### 61 ï¿½ `src/components/modals/ImageCropModal.tsx` L218, L342, L343

**Rule 5**

```tsx
// DELETE all .toFixed(0) calls ï¿½ they are already integer values
// L218:
{Math.round(zoom * 100)}%               // was: {Math.round(zoom * 100).toFixed(0)}%
// L342:
{Math.round(position.x)}                // was: {position.x.toFixed(0)}
// L343:
{Math.round(position.y)}                // was: {position.y.toFixed(0)}
```

- [x] Fix all 3; update `__tests__/ImageCropModal.test.tsx`

---

### 62 ï¿½ `src/features/admin/components/AdminPayoutsView.tsx` L61, L68

**Rule 5**

```tsx
import { isSameMonth, nowMs } from "@/utils";
// DELETE: new Date(p.processedAt).getMonth() === new Date().getMonth()
// REPLACE:
isSameMonth(p.processedAt, nowMs());
```

- [x] Fix both lines; update `__tests__/AdminPayoutsView.test.tsx`

### 63 ï¿½ `src/components/homepage/FeaturedAuctionsSection.tsx` L165

**Rule 5**

```tsx
// DELETE: const now = new Date().getTime();
import { nowMs } from "@/utils";
const now = nowMs();
```

- [x] Fix; update `__tests__/FeaturedAuctionsSection.test.tsx`

### 64 ï¿½ `src/components/auctions/AuctionCard.tsx` L35

**Rule 5**

```tsx
// DELETE: const diff = end.getTime() - Date.now();
import { nowMs } from "@/utils";
const diff = end.getTime() - nowMs();
```

- [x] Fix; update `__tests__/AuctionCard.test.tsx`

### 65 ï¿½ `src/components/layout/Footer.tsx` L206

**Rule 5**

```tsx
// DELETE: year: new Date().getFullYear().toString()
import { currentYear } from "@/utils";
year: currentYear();
```

- [x] Fix; update `__tests__/Footer.test.tsx`

### 66 ï¿½ `src/components/feedback/Toast.tsx` L72

**Rule 5**

```tsx
// DELETE: const id = Date.now().toString();
import { nowMs } from "@/utils";
const id = nowMs().toString();
```

- [x] Fix; update `__tests__/Toast.test.tsx`

### 67 ï¿½ `src/components/ErrorBoundary.tsx` L115

**Rule 5**

```tsx
// DELETE: timestamp: new Date().toISOString()
import { nowISO } from "@/utils";
timestamp: nowISO();
```

- [x] Fix; update `__tests__/ErrorBoundary.test.tsx`

### 68 ï¿½ `src/lib/email.ts` L350, L397

**Rule 5**

```ts
// DELETE both:
new Date().toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" });
new Date().toLocaleString();

// REPLACE both:
import { formatDateTime, nowMs } from "@/utils";
formatDateTime(nowMs());
```

- [x] Fix both; update `src/lib/__tests__/email.test.ts`

---

### 69 ï¿½ `src/features/user/components/UserOrdersView.tsx` L94

**Rule 32**

```tsx
// DELETE: <div className={`flex gap-1 overflow-x-auto border-b ...`}>...</div>
// REPLACE:
import { Tabs } from "@/components";
<Tabs
  variant="line"
  activeId={table.get("status") || STATUS_TABS[0].id}
  onChange={(id) => table.set("status", id)}
  items={STATUS_TABS.map((t) => ({ id: t.id, label: t.label, content: null }))}
/>;
```

- [x] Fix; update `__tests__/UserOrdersView.test.tsx`

### 70 ï¿½ `src/components/homepage/FAQSection.tsx` L58

**Rule 32**

```tsx
// DELETE: <div className={`flex gap-1 overflow-x-auto ... border-b ...`}>...</div>
// REPLACE:
import { Tabs } from "@/components";
<Tabs
  variant="pill"
  activeId={activeCategory}
  onChange={setActiveCategory}
  items={categories.map((cat) => ({ id: cat, label: cat, content: null }))}
/>;
```

- [x] Fix; update `__tests__/FAQSection.test.tsx`

### 71 ï¿½ `src/components/products/ProductImageGallery.tsx` L48

**Rule 32**

```tsx
// DELETE: <div className="flex gap-2 overflow-x-auto pb-1">
// REPLACE:
import { HorizontalScroller } from '@/components';
<HorizontalScroller snapToItems className="pb-1">
```

- [x] Fix; update `__tests__/ProductImageGallery.test.tsx`

### 72 ï¿½ `src/components/homepage/HeroCarousel.tsx` L155

**Rule 32**

```tsx
// DELETE: <div className={`absolute inset-0 flex overflow-x-auto snap-x snap-mandatory ...`}>
// REPLACE:
import { HorizontalScroller } from '@/components';
<HorizontalScroller snapToItems className="absolute inset-0">
```

- [x] Fix; update `__tests__/HeroCarousel.test.tsx`

### 73 ï¿½ `src/components/layout/BottomNavbar.tsx` L111

**Rule 32** ï¿½ Preferred fix: remove scroll; fallback: HorizontalScroller.

```tsx
// AUDIT FIRST: count nav items, measure at 375 px
// If items fit without scroll:
className={`flex items-stretch ${layout.bottomNavHeight}`}  // remove overflow-x-auto entirely

// If scroll is genuinely required:
import { HorizontalScroller } from '@/components';
<HorizontalScroller className={layout.bottomNavHeight}>{navItems}</HorizontalScroller>
```

- [x] Audit at 375 px; apply appropriate fix; update `__tests__/BottomNavbar.test.tsx`

---

### 74 ï¿½ `src/app/api/payment/webhook/route.ts` L48, L56

**Rule 13**

```ts
// DELETE:
return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

// REPLACE ï¿½ throw inside try, caught by handleApiError:
import { AuthenticationError, ValidationError } from "@/lib/errors";
import { ERROR_MESSAGES } from "@/constants";
throw new AuthenticationError(ERROR_MESSAGES.AUTH.INVALID_SIGNATURE);
throw new ValidationError(ERROR_MESSAGES.VALIDATION.INVALID_JSON);
// catch block must be: return handleApiError(error);
```

- [x] Fix both lines; update `__tests__/route.test.ts`

---

### 75 ï¿½ `src/app/api/auth/login/route.ts` L61

**Rule 12**

```ts
// DELETE:
const db = getFirestore(getAdminApp());
// ... all direct db.collection() / doc() calls

// REPLACE:
import { userRepository } from "@/repositories";
const user = await userRepository.findByEmail(email);
```

Delete unused `getFirestore`, `getAdminApp` imports.

- [x] Refactor; update `__tests__/route.test.ts`

### 76 ï¿½ `src/app/api/auth/register/route.ts` L76

**Rule 12**

```ts
// DELETE: const db = getFirestore(getAdminApp());
import { userRepository } from "@/repositories";
const existing = await userRepository.findByEmail(email);
await userRepository.create(newUserData);
```

- [x] Refactor; update `__tests__/route.test.ts`

### 77 ï¿½ `src/app/api/auth/session/route.ts` L49

**Rule 12**

```ts
// DELETE: const db = getFirestore(getAdminApp());
import { sessionRepository } from "@/repositories";
await sessionRepository.create(sessionData);
```

- [x] Refactor; update `__tests__/route.test.ts`

---

### 78 ï¿½ `src/hooks/useRealtimeBids.ts` L17

**Rule 11**

```ts
// DELETE:
import { realtimeDb } from "@/lib/firebase/config";

// REPLACE:
import { realtimeApp } from "@/lib/firebase/realtime";
import { getDatabase } from "firebase/database";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { realtimeTokenService } from "@/services";

// Inside hook, before attaching listeners:
const tokenData = await realtimeTokenService.getToken();
await signInWithCustomToken(getAuth(realtimeApp), tokenData.customToken);
const db = getDatabase(realtimeApp);
```

- [x] Fix; update `__tests__/useRealtimeBids.test.ts`

### 79 ï¿½ `src/contexts/SessionContext.tsx` L25

**Rule 11**

```ts
// DELETE:
import type { User } from "firebase/auth";

// REPLACE:
import type { AuthUser } from "@/types/auth";
```

Replace all uses of `User` in the file with `AuthUser`. Add missing fields to `src/types/auth/index.ts` if needed ï¿½ do not keep `User` as a fallback.

- [x] Fix; update `src/types/auth/index.ts` if needed; update `__tests__/SessionContext.test.tsx`

---

## WAVE 4 ï¿½ Page Decompositions

**Pattern for every page**:

1. Create the view component in the target path (all state, hooks, JSX, handlers move here).
2. Export the view component from the feature barrel (`index.ts`).
3. Reduce the page to:

```tsx
import { XxxView } from "@/features/xxx"; // or '@/components/xxx'
export default function XxxPage() {
  return <XxxView />;
}
```

4. Verify `page.tsx` is = 30 lines after extraction (usually much less).
5. Create `__tests__/<ViewName>.test.tsx` for the new view component.

---

### 80 ï¿½ `src/app/[locale]/demo/seed/page.tsx` ï¿½ 648 lines

**Rules 10, 20**

Extract to `src/features/admin/components/DemoSeedView.tsx`.  
Inside `DemoSeedView`, replace the direct `fetch('/api/demo/seed', ...)` call with `demoService.seed(payload)` (created in task 07).

- [x] Create `DemoSeedView.tsx`; gut page; export from `src/features/admin/index.ts`; create `__tests__/DemoSeedView.test.tsx`

### 81 ï¿½ `src/app/[locale]/user/settings/page.tsx` ï¿½ 211 lines

Extract to `src/features/user/components/UserSettingsView.tsx`

- [x] Create view; gut page; export from `src/features/user/index.ts`; create `__tests__`

### 82 ï¿½ `src/app/[locale]/blog/[slug]/page.tsx` ï¿½ 210 lines

Extract to `src/features/blog/components/BlogPostView.tsx`

- [x] Create view; gut page; export from `src/features/blog/index.ts`; create `__tests__`

### 83 ï¿½ `src/app/[locale]/seller/products/[id]/edit/page.tsx` ï¿½ 202 lines

Extract to `src/features/seller/components/SellerEditProductView.tsx`

- [x] Create view; gut page; export from `src/features/seller/index.ts`; create `__tests__`

### 84 ï¿½ `src/app/[locale]/user/addresses/page.tsx` ï¿½ 189 lines

Extract to `src/features/user/components/UserAddressesView.tsx`

- [x] Create view; gut page; export from `src/features/user/index.ts`; create `__tests__`

### 85 ï¿½ `src/app/[locale]/products/[slug]/page.tsx` ï¿½ 179 lines

Extract to `src/features/products/components/ProductDetailView.tsx`

- [x] Create view; gut page; export from `src/features/products/index.ts`; create `__tests__`

### 86 ï¿½ `src/app/[locale]/sellers/page.tsx` ï¿½ 179 lines

Extract to `src/features/seller/components/SellersListView.tsx`

- [x] Create view; gut page; export from `src/features/seller/index.ts`; create `__tests__`

### 87 ï¿½ `src/app/[locale]/about/page.tsx` ï¿½ 177 lines

Extract to `src/components/about/AboutView.tsx`

- [x] Create view; gut page; create `__tests__`

### 88 ï¿½ `src/app/[locale]/admin/media/page.tsx` ï¿½ 174 lines

Extract to `src/features/admin/components/AdminMediaView.tsx`

- [x] Create view; gut page; export from `src/features/admin/index.ts`; create `__tests__`

### 89 ï¿½ `src/app/[locale]/cart/page.tsx` ï¿½ 164 lines

Extract to `src/features/cart/components/CartView.tsx`

- [x] Create view; gut page; export from `src/features/cart/index.ts`; create `__tests__`

### 90 ï¿½ `src/app/[locale]/admin/site/page.tsx` ï¿½ 162 lines

Extract to `src/features/admin/components/AdminSiteView.tsx`

- [x] Create view; gut page; export from `src/features/admin/index.ts`; create `__tests__`

### 91 ï¿½ `src/app/[locale]/user/notifications/page.tsx` ï¿½ 156 lines

Extract to `src/features/user/components/UserNotificationsView.tsx`

- [x] Create view; gut page; export from `src/features/user/index.ts`; create `__tests__`

### 92 ï¿½ `src/app/[locale]/admin/events/page.tsx` ï¿½ 153 lines

Extract to `src/features/admin/components/AdminEventsView.tsx`

- [x] Create view; gut page; export from `src/features/admin/index.ts`; create `__tests__`

### 93 ï¿½ `src/app/[locale]/user/addresses/edit/[id]/page.tsx` ï¿½ 150 lines

Extract to `src/features/user/components/UserEditAddressView.tsx`

- [x] Create view; gut page; export from `src/features/user/index.ts`; create `__tests__`

---

## WAVE 5 — Newly Discovered Violations (re-run #4, 2026-03-02)

All typography fixes follow the same pattern: import `Heading`/`Text`/`Label` from `@/components`, replace raw tag, delete unused class variables.

---

### 94 — `src/components/user/addresses/AddressCard.tsx`

**Rules 7, 31** — 7 violations.

```tsx
// L65: h3 → Heading(3)
import { Heading, Text } from '@/components';
<Heading level={3}>{address.label}</Heading>

// L98, 101, 102, 103, 104, 107: p → Text  (×6)
<Text size="sm" weight="medium">{address.recipientName}</Text>
<Text size="sm">{address.phone}</Text>
<Text size="sm">{address.addressLine1}</Text>
{address.addressLine2 && <Text size="sm">{address.addressLine2}</Text>}
<Text size="sm">{...}</Text>
<Text size="sm">{address.country}</Text>
```

- [x] Fix all 7; update `__tests__/AddressCard.test.tsx`

---

### 95 — `src/features/seller/components/SellersListView.tsx`

**Rules 7, 31** — 13 violations.

```tsx
import { Heading, Text } from "@/components";
// L34: h1 → Heading(1)
// L72, 101, 123, 145: h2 → Heading(2)  (×4)
// L85, 112, 134: h3 → Heading(3)  (×3)
// L35, 62, 63, 115, 137, 152: p → Text  (×6) — match colour variants to context
```

- [x] Fix all 13; update `__tests__/SellersListView.test.tsx`

---

### 96 — `src/components/user/orders/OrderTrackingView.tsx`

**Rules 7, 31** — 3 violations.

```tsx
import { Heading, Text } from "@/components";
// L256: h1 → Heading(1)
// L259: p → Text variant="secondary" size="sm"
// L293: h2 → Heading(2)
```

- [x] Fix all 3; update `__tests__/OrderTrackingView.test.tsx`

---

### 97 — `src/components/user/notifications/NotificationItem.tsx`

**Rules 7, 31** — 3 violations.

```tsx
import { Text } from "@/components";
// L58: p font-semibold → Text weight="semibold" size="sm"
// L65: p → Text size="sm" variant="secondary"
// L68: p → Text size="xs" variant="secondary"
```

- [x] Fix all 3; update `__tests__/NotificationItem.test.tsx`

---

### 98 — `src/features/products/components/ProductDetailView.tsx`

**Rules 7, 31** — 2 violations (in "not found" state block).

```tsx
import { Heading, Text } from "@/components";
// L66: h1 → Heading(1)
// L69: p → Text variant="secondary" size="sm"
```

- [x] Fix both; update `__tests__/ProductDetailView.test.tsx`

---

### 99 — `src/components/user/addresses/AddressForm.tsx`

**Rules 7, 8, 31** — checkbox wrapper uses raw `<label>` + `<input type="checkbox">`. Replace the entire block with `<Checkbox>` from `@/components`.

```tsx
// DELETE L188–196:
<label className="flex items-center gap-2">
  <input type="checkbox" checked={formData.isDefault} onChange={...} className="..." />
  <span className="text-sm">Set as default address</span>
</label>

// REPLACE:
import { Checkbox } from '@/components';
<Checkbox
  checked={formData.isDefault}
  onChange={(checked) => handleChange('isDefault', checked)}
  label={t('form.setAsDefault')}
/>
```

- [x] Fix; add translation key `form.setAsDefault`; update `__tests__/AddressForm.test.tsx`

---

### 100 — `src/components/user/profile/ProfileStatsGrid.tsx`

**Rules 7, 31** — 1 violation.

```tsx
// L127: <p className="text-3xl font-bold mt-1">{stat.value}</p>
import { Text } from "@/components";
<Text size="3xl" weight="bold" className="mt-1">
  {stat.value}
</Text>;
```

- [x] Fix; update `__tests__/ProfileStatsGrid.test.tsx`

---

### 101 — `src/components/user/settings/EmailVerificationCard.tsx`

**Rules 7, 31** — 1 violation.

```tsx
// L53: <h3 className={typography.cardTitle}>
import { Heading } from '@/components';
<Heading level={3}>{...}</Heading>
```

- [x] Fix; update `__tests__/EmailVerificationCard.test.tsx`

---

### 102 — `src/components/user/settings/PhoneVerificationCard.tsx`

**Rules 7, 31** — 1 violation.

```tsx
// L58: <h3 className={typography.cardTitle}>
import { Heading } from '@/components';
<Heading level={3}>{...}</Heading>
```

- [x] Fix; update `__tests__/PhoneVerificationCard.test.tsx`

---

### 103 — `src/components/ui/AddressSelectorCreate.tsx`

**Rules 7, 31** — 1 violation.

```tsx
// L99: <label className={`block ${typography.label} mb-1`}>{label}</label>
import { Label } from "@/components";
<Label className="mb-1">{label}</Label>;
```

- [x] Fix; update `__tests__/AddressSelectorCreate.test.tsx`

---

### 104 — `src/components/utility/Search.tsx`

**Rules 7, 31** — 1 violation.

```tsx
// L142: <p className={`${THEME_CONSTANTS.themed.textSecondary} text-sm`}>
import { Text } from '@/components';
<Text variant="secondary" size="sm">{...}</Text>
```

- [x] Fix; update `__tests__/Search.test.tsx`

---

### 105 — `src/components/ui/FilterFacetSection.tsx`

**Rules 7, 31** — 1 violation (missed in task 13).

```tsx
// L160: <p className={`text-xs ${themed.textSecondary} py-1`}>
import { Text } from "@/components";
<Text size="xs" variant="secondary" className="py-1">
  {tTable("noResults")}
</Text>;
```

- [x] Fix; update `__tests__/FilterFacetSection.test.tsx`

---

## Final Verification Gate

```bash
npx tsc --noEmit          # 0 errors
npm run build             # 0 errors
npm test                  # all green
npm run lint              # 0 errors
```

Then re-run the audit to confirm zero remaining violations.

---

## Summary

| Wave                       | Tasks   | Files touched           | Violations cleared                       |
| -------------------------- | ------- | ----------------------- | ---------------------------------------- |
| 0 — Prerequisites          | 11      | 9 new + 2 modified      | Unblocks everything                      |
| 1 — Tier 1 Primitives      | 5       | 5                       | 5 (propagates to entire app)             |
| 2 — Multi-violation files  | 23      | 23                      | ~70 individual violations                |
| 3 — Single-violation files | 40      | 40                      | ~50 individual violations                |
| 4 — Page decompositions    | 14      | 14 pages + 14 new views | 14 Rule 10 violations                    |
| 5 — Newly discovered       | 12      | 12                      | ~30 Typography (Rules 7,8,31) violations |
| **Total**                  | **105** | **117 files**           | **All audit re-run #4 violations**       |
