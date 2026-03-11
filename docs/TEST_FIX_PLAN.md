# Test Suite Fix Plan

**Date**: 2026-03-11  
**Baseline**: 309 failed suites / 1281 failed tests out of 480 suites / 3895 tests  
**Goal**: Green CI — 0 failing suites

---

## Root Cause Analysis

Six distinct root causes account for essentially all 309 failures:

| #    | Root Cause                                                                          | Suites Affected | Effort |
| ---- | ----------------------------------------------------------------------------------- | --------------- | ------ |
| RC-1 | Deleted adapter hooks (`useApiQuery`/`useApiMutation`) referenced in 134 test files | ~160            | High   |
| RC-2 | Hook test files that directly `import`/`mock` the deleted relative modules          | 7               | Low    |
| RC-3 | `useUrlTable.test.ts` mocks `next/navigation` but hook uses `@/i18n/navigation`     | 12 tests        | Low    |
| RC-4 | Components moved between tiers, test imports wrong relative path                    | 6               | Low    |
| RC-5 | Component rendering output changed, tests check stale selectors/text                | ~80             | High   |
| RC-6 | Missing React providers in test wrappers (`ToastProvider`, `QueryClientProvider`)   | ~15             | Medium |

---

## RC-1 — Deleted Adapter Hooks in Test Mocks

### Background

During migration stage C4 (TanStack Query v5), the adapter hooks `useApiQuery` and `useApiMutation` were deleted from `src/hooks/`. Their tests were not updated.

**134 test files** still reference these deleted hooks in two ways:

**A)** As entries inside `jest.mock("@/hooks", () => ({ useApiQuery: ..., useApiMutation: ... }))`.  
Because the entire `@/hooks` barrel is replaced by this mock, any hook the component _now_ calls (e.g. `usePendingTable`, `useMediaCrop`, `useUrlTable`) is **not** in the mock → `TypeError: (0 , _hooks.xxx) is not a function`.

**B)** As direct relative imports `from '../useApiQuery'` / `from '../useApiMutation'` in hook-specific tests → `Cannot find module` error.

### Affected Files (134)

<details>
<summary>Click to expand full list</summary>

```
src/app/[locale]/admin/analytics/__tests__/page.test.tsx
src/app/[locale]/admin/bids/[[...action]]/__tests__/page.test.tsx
src/app/[locale]/admin/blog/[[...action]]/__tests__/page.test.tsx
src/app/[locale]/admin/carousel/[[...action]]/__tests__/page.test.tsx
src/app/[locale]/admin/categories/[[...action]]/__tests__/page.test.tsx
src/app/[locale]/admin/coupons/[[...action]]/__tests__/page.test.tsx
src/app/[locale]/admin/events/[id]/entries/__tests__/page.test.tsx
src/app/[locale]/admin/events/__tests__/page.test.tsx
src/app/[locale]/admin/faqs/[[...action]]/__tests__/page.test.tsx
src/app/[locale]/admin/media/__tests__/page.test.tsx
src/app/[locale]/admin/orders/[[...action]]/__tests__/page.test.tsx
src/app/[locale]/admin/payouts/__tests__/page.test.tsx
src/app/[locale]/admin/products/[[...action]]/__tests__/page.test.tsx
src/app/[locale]/admin/reviews/[[...action]]/__tests__/page.test.tsx
src/app/[locale]/admin/sections/[[...action]]/__tests__/page.test.tsx
src/app/[locale]/admin/site/__tests__/page.test.tsx
src/app/[locale]/admin/users/[[...action]]/__tests__/page.test.tsx
src/app/[locale]/auctions/[id]/__tests__/page.test.tsx
src/app/[locale]/auctions/__tests__/page.test.tsx
src/app/[locale]/blog/[slug]/__tests__/page.test.tsx
src/app/[locale]/blog/__tests__/page.test.tsx
src/app/[locale]/cart/__tests__/page.test.tsx
src/app/[locale]/categories/[slug]/__tests__/page.test.tsx
src/app/[locale]/categories/__tests__/page.test.tsx
src/app/[locale]/checkout/__tests__/page.test.tsx
src/app/[locale]/events/[id]/__tests__/page.test.tsx
src/app/[locale]/events/[id]/participate/__tests__/page.test.tsx
src/app/[locale]/events/__tests__/page.test.tsx
src/app/[locale]/faqs/__tests__/page.test.tsx
src/app/[locale]/products/[slug]/__tests__/page.test.tsx
src/app/[locale]/products/__tests__/page.test.tsx
src/app/[locale]/profile/[userId]/__tests__/page.test.tsx
src/app/[locale]/promotions/__tests__/page.test.tsx
src/app/[locale]/search/__tests__/page.test.tsx
src/app/[locale]/seller/analytics/__tests__/page.test.tsx
src/app/[locale]/seller/orders/__tests__/page.test.tsx
src/app/[locale]/seller/payouts/__tests__/page.test.tsx
src/app/[locale]/seller/products/[id]/edit/__tests__/page.test.tsx
src/app/[locale]/seller/products/__tests__/page.test.tsx
src/app/[locale]/sellers/[id]/__tests__/page.test.tsx
src/app/[locale]/user/notifications/__tests__/page.test.tsx
src/app/[locale]/user/orders/[id]/track/__tests__/page.test.tsx
src/app/[locale]/user/orders/__tests__/page.test.tsx
src/app/[locale]/user/orders/view/[id]/__tests__/page.test.tsx
src/app/[locale]/user/profile/__tests__/page.test.tsx
src/app/[locale]/user/wishlist/__tests__/page.test.tsx
src/components/products/__tests__/ProductReviews.test.tsx
src/features/admin/components/__tests__/AdminAnalyticsView.test.tsx
src/features/admin/components/__tests__/AdminBidsView.test.tsx
src/features/admin/components/__tests__/AdminBlogView.test.tsx
src/features/admin/components/__tests__/AdminCarouselView.test.tsx
src/features/admin/components/__tests__/AdminCategoriesView.test.tsx
src/features/admin/components/__tests__/AdminCouponsView.test.tsx
src/features/admin/components/__tests__/AdminFaqsView.test.tsx
src/features/admin/components/__tests__/AdminMediaView.test.tsx
src/features/admin/components/__tests__/AdminPayoutsView.test.tsx
src/features/admin/components/__tests__/AdminProductsView.test.tsx
src/features/admin/components/__tests__/AdminReviewsView.test.tsx
src/features/admin/components/__tests__/AdminSectionsView.test.tsx
src/features/admin/components/__tests__/AdminSiteView.test.tsx
src/features/admin/components/__tests__/AdminUsersView.test.tsx
src/features/admin/components/__tests__/ProductForm.test.tsx
src/features/admin/hooks/__tests__/useAdminAnalytics.test.ts
src/features/admin/hooks/__tests__/useAdminBids.test.ts
src/features/admin/hooks/__tests__/useAdminBlog.test.ts
src/features/admin/hooks/__tests__/useAdminCarousel.test.ts
src/features/admin/hooks/__tests__/useAdminCategories.test.ts
src/features/admin/hooks/__tests__/useAdminCoupons.test.ts
src/features/admin/hooks/__tests__/useAdminFaqs.test.ts
src/features/admin/hooks/__tests__/useAdminOrders.test.ts
src/features/admin/hooks/__tests__/useAdminPayouts.test.ts
src/features/admin/hooks/__tests__/useAdminProducts.test.ts
src/features/admin/hooks/__tests__/useAdminReviews.test.ts
src/features/admin/hooks/__tests__/useAdminSections.test.ts
src/features/admin/hooks/__tests__/useAdminUsers.test.ts
src/features/blog/components/__tests__/BlogPostView.test.tsx
src/features/cart/components/__tests__/CartView.test.tsx
src/features/categories/components/__tests__/CategoryProductsView.test.tsx
src/features/categories/hooks/__tests__/useCategoryProducts.test.ts
src/features/events/components/__tests__/EventParticipateView.test.tsx
src/features/events/components/__tests__/FeedbackEventSection.test.tsx
src/features/events/components/__tests__/PollVotingSection.test.tsx
src/features/events/hooks/__tests__/useEvent.test.ts
src/features/events/hooks/__tests__/useEventEntries.test.ts
src/features/events/hooks/__tests__/useEventLeaderboard.test.ts
src/features/events/hooks/__tests__/useEventMutations.test.ts
src/features/events/hooks/__tests__/useEvents.test.ts
src/features/events/hooks/__tests__/useEventStats.test.ts
src/features/events/hooks/__tests__/useFeedbackSubmit.test.ts
src/features/events/hooks/__tests__/usePollVote.test.ts
src/features/homepage/components/__tests__/AdvertisementBanner.test.tsx
src/features/homepage/components/__tests__/BlogArticlesSection.test.tsx
src/features/homepage/components/__tests__/CustomerReviewsSection.test.tsx
src/features/homepage/components/__tests__/HeroCarousel.test.tsx
src/features/homepage/components/__tests__/TopCategoriesSection.test.tsx
src/features/homepage/components/__tests__/WelcomeSection.test.tsx
src/features/homepage/components/__tests__/WhatsAppCommunitySection.test.tsx
src/features/products/components/__tests__/AuctionsView.test.tsx
src/features/products/components/__tests__/ProductDetailView.test.tsx
src/features/products/components/__tests__/ProductsView.test.tsx
src/features/products/hooks/__tests__/useAuctions.test.ts
src/features/products/hooks/__tests__/useProducts.test.ts
src/features/search/components/__tests__/SearchView.test.tsx
src/features/search/hooks/__tests__/useSearch.test.ts
src/features/seller/components/__tests__/SellerAuctionsView.test.tsx
src/features/seller/components/__tests__/SellerCreateProductView.test.tsx
src/features/seller/components/__tests__/SellerDashboardView.test.tsx
src/features/seller/components/__tests__/SellerEditProductView.test.tsx
src/features/seller/components/__tests__/SellerOrdersView.test.tsx
src/features/seller/hooks/__tests__/useSellerOrders.test.ts
src/features/seller/hooks/__tests__/useSellerPayoutSettings.test.ts
src/features/seller/hooks/__tests__/useSellerShipping.test.ts
src/features/seller/hooks/__tests__/useSellerStore.test.ts
src/features/user/components/__tests__/OrderDetailView.test.tsx
src/features/user/components/__tests__/UserNotificationsView.test.tsx
src/features/user/components/__tests__/UserOrdersView.test.tsx
src/features/user/hooks/__tests__/useOrderDetail.test.ts
src/features/user/hooks/__tests__/useUserOrders.test.ts
src/hooks/__tests__/useAddresses.test.ts
src/hooks/__tests__/useApiMutation.test.ts      ← DELETE (RC-2)
src/hooks/__tests__/useApiQuery.test.ts         ← DELETE (RC-2)
src/hooks/__tests__/useAuctionDetail.test.ts    ← RC-2 variant
src/hooks/__tests__/useBlogPosts.test.ts
src/hooks/__tests__/useCategorySelector.test.ts ← RC-2 variant
src/hooks/__tests__/useCheckout.test.ts
src/hooks/__tests__/useContactSubmit.test.ts
src/hooks/__tests__/useCouponValidate.test.ts
src/hooks/__tests__/useFaqVote.test.ts          ← RC-2 variant
src/hooks/__tests__/useLogout.test.ts           ← RC-2 variant
src/hooks/__tests__/useMediaUpload.test.ts
src/hooks/__tests__/usePlaceBid.test.ts         ← RC-2 variant
src/hooks/__tests__/useProfileStats.test.ts
src/hooks/__tests__/usePromotions.test.ts
src/hooks/__tests__/usePublicEvents.test.ts
```

</details>

### Fix Pattern for RC-1

Every `jest.mock("@/hooks", () => ({...}))` block must be updated:

```diff
- jest.mock("@/hooks", () => ({
-   useApiQuery: jest.fn(() => ({ data: null, isLoading: false, refetch: jest.fn() })),
-   useApiMutation: () => ({ mutate: jest.fn(), isLoading: false }),
-   useMessage: () => ({ ... }),
-   useUrlTable: jest.fn(() => ({ ... })),
- }));
+ jest.mock("@/hooks", () => ({
+   ...jest.requireActual("@/hooks"),   // ← provides all real exports incl. usePendingTable
+   useMessage: jest.fn(() => ({ showError: jest.fn(), showSuccess: jest.fn() })),
+   useUrlTable: jest.fn(() => ({ ... })),
+   // only override hooks the test needs to control
+ }));
```

For tests that also use data fetching, mock `@tanstack/react-query` instead of the adapter:

```ts
jest.mock("@tanstack/react-query", () => ({
  ...jest.requireActual("@tanstack/react-query"),
  useQuery: jest.fn(() => ({ data: null, isLoading: false, error: null })),
  useMutation: jest.fn(() => ({ mutate: jest.fn(), isPending: false })),
}));
```

**Note**: For hook-specific tests (`useAdminProducts.test.ts`, etc.) that test the hook itself (not via rendering), mock `@/services/xxx` and `@tanstack/react-query` instead of the `@/hooks` barrel.

---

## RC-2 — Direct Relative Imports of Deleted Modules

### Files to DELETE (hook no longer exists)

| File                                         | Action                                  |
| -------------------------------------------- | --------------------------------------- |
| `src/hooks/__tests__/useApiQuery.test.ts`    | **Delete** — adapter hook deleted in C4 |
| `src/hooks/__tests__/useApiMutation.test.ts` | **Delete** — adapter hook deleted in C4 |

### Files to REWRITE mocks (hook tests for hooks that use TanStack internally)

These files call `jest.mock("../useApiMutation")` or `jest.mock("../useApiQuery")` but the actual hook now calls TanStack Query directly.

**Fix**: Replace the relative module mock with a TanStack Query mock.

```diff
// useFaqVote.test.ts, useLogout.test.ts, usePlaceBid.test.ts
- jest.mock("../useApiMutation", () => ({
-   useApiMutation: jest.fn((opts) => ({
-     mutate: (payload) => opts.mutationFn(payload),
-   })),
- }));
+ jest.mock("@tanstack/react-query", () => ({
+   ...jest.requireActual("@tanstack/react-query"),
+   useMutation: jest.fn((opts) => ({
+     mutate: (payload: unknown) => opts.mutationFn(payload),
+     mutateAsync: (payload: unknown) => opts.mutationFn(payload),
+     isPending: false,
+     error: null,
+   })),
+ }));
```

```diff
// useAuctionDetail.test.ts, useCategorySelector.test.ts
- jest.mock("../useApiQuery", () => ({
-   useApiQuery: jest.fn((opts) => { opts.queryFn(); ... }),
- }));
+ jest.mock("@tanstack/react-query", () => ({
+   ...jest.requireActual("@tanstack/react-query"),
+   useQuery: jest.fn((opts) => { opts.queryFn?.(); return { data: null, isLoading: false }; }),
+ }));
```

| File                                              | Current mock                     | Fix                                      |
| ------------------------------------------------- | -------------------------------- | ---------------------------------------- |
| `src/hooks/__tests__/useFaqVote.test.ts`          | `jest.mock("../useApiMutation")` | Replace with TanStack `useMutation` mock |
| `src/hooks/__tests__/useLogout.test.ts`           | `jest.mock("../useApiMutation")` | Replace with TanStack `useMutation` mock |
| `src/hooks/__tests__/usePlaceBid.test.ts`         | `jest.mock("../useApiMutation")` | Replace with TanStack `useMutation` mock |
| `src/hooks/__tests__/useAuctionDetail.test.ts`    | `jest.mock("../useApiQuery")`    | Replace with TanStack `useQuery` mock    |
| `src/hooks/__tests__/useCategorySelector.test.ts` | `jest.mock("../useApiQuery")`    | Replace with TanStack `useQuery` mock    |

---

## RC-3 — `useUrlTable` Tests Mock Wrong Router Package

### File: `src/hooks/__tests__/useUrlTable.test.ts`

**Root cause**: `useUrlTable.ts` imports `useRouter` from `@/i18n/navigation` (the next-intl router), **not** from `next/navigation`. The test mocks `next/navigation` only, so `router.replace()` is called through the un-mocked i18n router and `mockReplace` never fires.

**8 of 12 tests fail** with `TypeError: Cannot read properties of undefined (reading '0')` because `mockReplace.mock.calls` is empty.

**Fix**:

```diff
+ const mockReplace = jest.fn();
+ let mockSearchParamsMap: Map<string, string> = new Map();

+ jest.mock("@/i18n/navigation", () => ({
+   useRouter: () => ({ replace: mockReplace }),
+   usePathname: () => "/admin/products",
+ }));

  jest.mock("next/navigation", () => ({
-   useRouter: () => ({ replace: mockReplace }),
-   usePathname: () => "/admin/products",
    useSearchParams: () => ({
      get: (key: string) => mockSearchParamsMap.get(key) ?? null,
      toString: () => {
        const p = new URLSearchParams();
        mockSearchParamsMap.forEach((v, k) => p.set(k, v));
        return p.toString();
      },
    }),
  }));
```

---

## RC-4 — Components Moved Between Tiers, Tests Use Wrong Import Path

### Sub-case A: Feature components in `src/components/products/__tests__/`

These four components moved from `src/components/products/` to `src/features/products/components/`.  
The test files remain at the old location and use `import ... from "../ComponentName"` which no longer resolves.

**Action**: Move the four test files to `src/features/products/components/__tests__/`. No import changes needed since relative paths stay valid.

| Test file (current location)                                 | Move to                                                               |
| ------------------------------------------------------------ | --------------------------------------------------------------------- |
| `src/components/products/__tests__/AddToCartButton.test.tsx` | `src/features/products/components/__tests__/AddToCartButton.test.tsx` |
| `src/components/products/__tests__/ProductInfo.test.tsx`     | `src/features/products/components/__tests__/ProductInfo.test.tsx`     |
| `src/components/products/__tests__/ProductReviews.test.tsx`  | `src/features/products/components/__tests__/ProductReviews.test.tsx`  |
| `src/components/products/__tests__/RelatedProducts.test.tsx` | `src/features/products/components/__tests__/RelatedProducts.test.tsx` |

### Sub-case B: Admin feature component tests with wrong path

| File                                                           | Current `import`         | Correct location of actual file                         | Fix                                                                                    |
| -------------------------------------------------------------- | ------------------------ | ------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `src/components/admin/__tests__/SessionTableColumns.test.tsx`  | `../SessionTableColumns` | `src/features/admin/components/SessionTableColumns.tsx` | Change import to `@/features/admin/components/SessionTableColumns` (or move test file) |
| `src/features/admin/components/__tests__/ProductForm.test.tsx` | `../ProductForm`         | `src/components/products/ProductForm.tsx`               | Change import to `@/components/products/ProductForm`                                   |

### Sub-case C: `FAQSearchBar` ghost mock

**File**: `src/features/faq/components/__tests__/FAQPageContent.test.tsx`

`jest.mock("../FAQSearchBar", ...)` resolves a module that **does not exist anywhere** in the codebase. The `FAQPageContent` component itself no longer imports `FAQSearchBar`.

**Fix**: Remove the `jest.mock("../FAQSearchBar", ...)` block entirely.

---

## RC-5 — Component Rendering Output Changed

These tests perform DOM assertions (text, ARIA roles, data-testid) against a component whose output has changed. The tests are not broken in principle — they just need their assertions updated to match current rendering.

This is the **highest effort** category and must be fixed **per test file** by reading current output and updating selectors. Use `screen.debug()` to inspect rendered output during fix.

### Priority sub-groups

**5a — Translation key changes** (~15 suites)  
Tests expected `"Available Products"` but component now renders translation key or different label.  
Examples: `StoreCard.test.tsx`, `CustomerReviewsSection.test.tsx`

**5b — UI structure changes** (~30 suites)  
Tests use `getByRole("listbox")`, `getByRole("button", { name: "Sort" })`, etc. but the component changed its ARIA structure.  
Examples: `LocaleSwitcher.test.tsx`, `ProductGrid.test.tsx`, `ImageCropModal.test.tsx`

**5c — Admin table column tests** (~15 suites)  
Tests for `FaqTableColumns`, `ReviewTableColumns`, `OrderTableColumns`, `BidTableColumns`, `UserTableColumns`, `SectionTableColumns` rendering cells that changed format.

**5d — Admin view tests** (overlapping with RC-1, after fixing mocks these still may fail)  
`AdminTabs.test.tsx`, `AdminStatsCards.test.tsx`, `BackgroundSettings.test.tsx`, `CategoryTreeView.test.tsx`

**5e — Async RSC tested as client component** (~5 suites)  
`profile/[userId]/page.test.tsx` triggers: `<PublicProfilePage> is an async Client Component`.  
The page must be accessed as RSC in tests — either mock it as a sync wrapper or use `React.use()` mock.

---

## RC-6 — Missing Providers in Test Wrappers

### Problem A: `ToastProvider` missing

Several tests fail with:

```
Error: useToast must be used within ToastProvider
```

**Affected tests**: `FAQAccordion.test.tsx`, `FAQHelpfulButtons.test.tsx`, `faqVote.test.ts`, `CouponCard.test.tsx`, and any component that renders a toast-using child.

**Fix — Option 1** (preferred): Add `ToastProvider` to the test's `render` wrapper:

```ts
const renderWithProviders = (ui: ReactElement) =>
  render(<ToastProvider>{ui}</ToastProvider>);
```

**Fix — Option 2**: Add a global `jest.mock("@/components/ui/ToastProvider", ...)` to mock the context.

**Fix — Option 3** (global): Add `ToastProvider` to `jest.setup.ts` using a custom render helper exported from `src/__tests__/test-utils.tsx`.

### Problem B: `QueryClientProvider` missing

Some hooks tested via `renderHook` need a `QueryClient` wrapper. Use the pattern:

```ts
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);
renderHook(() => useMyHook(), { wrapper });
```

---

## Phased Implementation Plan

### Phase 1 — Quick Wins (2–4 hours, ~20 suites fixed)

| Step | Action                                                                                          | Files                                                                               |
| ---- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 1.1  | **Delete** the two deleted-hook test files                                                      | `useApiQuery.test.ts`, `useApiMutation.test.ts`                                     |
| 1.2  | **Rewrite mocks** in 5 hook tests from relative adapter mock → TanStack mock                    | `useFaqVote`, `useLogout`, `usePlaceBid`, `useAuctionDetail`, `useCategorySelector` |
| 1.3  | **Fix** `useUrlTable.test.ts` — mock `@/i18n/navigation` instead of `next/navigation.useRouter` | `useUrlTable.test.ts`                                                               |
| 1.4  | **Move** 4 product component test files to `features/products/components/__tests__/`            | `AddToCartButton`, `ProductInfo`, `ProductReviews`, `RelatedProducts`               |
| 1.5  | **Fix** 2 mislocated component imports                                                          | `SessionTableColumns.test.tsx`, `ProductForm.test.tsx`                              |
| 1.6  | **Remove** ghost `FAQSearchBar` mock from `FAQPageContent.test.tsx`                             | 1 file                                                                              |

### Phase 2 — Barrel Mock Cleanup (4–8 hours, ~150 suites fixed)

For all 134 RC-1 files (excluding the 7 handled in Phase 1):

1. Open each file.
2. Replace `jest.mock("@/hooks", () => ({...}))` factory with the spread pattern:
   ```ts
   jest.mock("@/hooks", () => ({
     ...jest.requireActual("@/hooks"),
     // keep only hooks the test needs to control
   }));
   ```
3. Remove `useApiQuery` / `useApiMutation` entries.
4. Where tests mock TanStack data: replace with `jest.mock("@tanstack/react-query", ...)`.
5. For hook-specific tests (feature hooks `useAdminXxx`, `useSellerXxx`, etc.): mock the service layer (`@/services/xxx`) instead of `@/hooks`.

**Batch by sub-directory** for efficiency:

- `src/features/admin/hooks/__tests__/` (13 files) — shared mock pattern, can use one template
- `src/features/admin/components/__tests__/` (15 files) — same
- `src/app/[locale]/admin/*/` (17 page tests) — same
- Feature-specific (`events`, `seller`, `user`, `products`, etc.)

### Phase 3 — Provider Wrappers (1–2 hours, ~15 suites fixed)

1. Create `src/__tests__/test-utils.tsx` with `renderWithProviders(ui)` helper that wraps `ToastProvider` + `QueryClientProvider`.
2. Update all failing tests that throw "useToast must be used within ToastProvider" to use `renderWithProviders`.

### Phase 4 — Rendering Assertion Updates (8–16 hours, ~80 suites fixed)

For each RC-5 file:

1. Run the test in isolation.
2. Add temporary `screen.debug()` to see current rendered output.
3. Update assertions to match current output.
4. Re-run to verify.

**Start with highest-value / fastest returns**:

- `src/components/admin/__tests__/AdminStatsCards.test.tsx`
- `src/components/layout/__tests__/LocaleSwitcher.test.tsx`
- `src/features/admin/components/__tests__/*TableColumns.test.tsx` (5 files, similar pattern)
- `src/features/stores/components/__tests__/StoreCard.test.tsx`

### Phase 5 — Async Server Component Tests (1–2 hours, ~5 suites fixed)

For `src/app/[locale]/profile/[userId]/__tests__/page.test.tsx` and similar:

Pattern: The page is an `async` RSC but tests call it like a sync component.  
Fix: Mock `React.use` at top of test (already done in some tests via `jest.mock("react", ...)`), or mock the entire page component as a sync thin wrapper.

---

## Verification Checkpoints

After each phase run:

```bash
npx jest --forceExit --passWithNoTests 2>&1 | Select-String "Test Suites:|Tests:"
```

Target milestones:

- After Phase 1: ≤ 290 failing suites
- After Phase 2: ≤ 140 failing suites
- After Phase 3: ≤ 125 failing suites
- After Phase 4: ≤ 45 failing suites
- After Phase 5: ≤ 10 failing suites (residual edge cases)

---

## Key Conventions to Follow During Fixes

- **No `useApiQuery` / `useApiMutation`** in any mock — they don't exist in `@/hooks` anymore.
- **Prefer `jest.requireActual` spread** over full manual barrel mocks to avoid stale mocks on next migration.
- **Prefer `jest.mock("@tanstack/react-query", ...)`** for data-fetching hook tests.
- **Prefer `jest.mock("@/services/xxx", ...)`** for feature-hook unit tests that test hook logic only.
- **Move tests with components, not import paths** — tests belong next to the component they test.
- **Delete, don't stub** — tests for deleted hooks should be deleted, not kept with empty stubs.
- **Do not add `@deprecated` note** — just delete obsolete tests.
- **Run `npx tsc --noEmit` after each phase** to confirm no TS errors were introduced.
