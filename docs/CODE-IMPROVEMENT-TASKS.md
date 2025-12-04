# Code Improvement Tasks

> **Generated**: December 3, 2025
> **Last Updated**: December 4, 2025
> **Status**: ✅ BUILD PASSING - Ready for Release
> **Estimated Total Effort**: 254-378 hours
> **Potential Lines Saved**: ~17,500 lines via shared components
> **Total Tasks**: 25 improvement areas identified

## 🚀 IMPLEMENTATION PRIORITY ORDER

### Priority #1: Create All Components (Current Phase)

**Focus**: Build all reusable components with mobile and dark mode support

- ✅ Task 23: Form/Wizard selector components (AddressSelectorWithCreate, etc.)
- ✅ Task 24: Detail page section components (ShopAbout, CategoryHeader, etc.)
- ✅ Task 25: Validation constants (Already created)
- Component requirements:
  - Dark mode support (all components)
  - Mobile responsive (all components)
  - Descriptive comment explaining purpose
  - Merge similar functionality where possible

### Priority #2: Split Large Files

**Focus**: Break down large files to use new components

- Task 1: Large File Splitting
- Update files to use newly created components
- Extract inline logic to components

### Priority #3: Navigation Changes

**Focus**: Navigation improvements and cleanup

- Task 21: Navigation Cleanup
- Consolidate navigation components
- Improve mobile navigation

### Priority #4: Dark Mode & Mobile Responsiveness

**Focus**: Complete dark mode and mobile support

- Task 11: Mobile/Dark Mode
- Task 18: Nav/Filter/Dark
- Fix remaining dark mode issues
- Complete mobile responsiveness

### Priority #5: Remaining Tasks

**Focus**: All other improvement tasks

- Tasks 2-10, 12-20, 22
- Performance, accessibility, testing
- API improvements, hooks consolidation

## 🎉 BUILD STATUS: PASSING

The application successfully builds and is ready for release. All critical type errors have been resolved.

### Recent Fixes Applied (December 3, 2025)

| Issue                          | File(s)                                                                   | Resolution                                                                                                                                                                                                                               |
| ------------------------------ | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | ----------- |
| Email service architecture     | `src/services/email.service.ts`, `src/app/api/lib/email/email.service.ts` | Separated frontend/backend email services properly                                                                                                                                                                                       |
| Missing DemoStep settings      | `src/app/admin/demo/page.tsx`                                             | Added `settings` step to all status objects (4 locations)                                                                                                                                                                                |
| EmptyState prop type           | `src/app/search/page.tsx`                                                 | Changed `href` to `onClick` with router.push                                                                                                                                                                                             |
| ShopFormData incomplete        | `src/components/seller/shop-wizard/types.ts`                              | Added all missing fields used by wizard steps                                                                                                                                                                                            |
| FormCheckbox missing label     | `src/components/seller/shop-wizard/SettingsStep.tsx`                      | Added label prop to FormCheckbox components                                                                                                                                                                                              |
| Removed stale files            | `src/app/page.old.tsx`                                                    | Deleted file with outdated types                                                                                                                                                                                                         |
| **Task 2: COLLECTIONS**        | 15+ API routes                                                            | ✅ Migrated hardcoded collection names to COLLECTIONS constant                                                                                                                                                                           |
| **Task 2: SUBCOLLECTIONS**     | `src/constants/database.ts`                                               | ✅ Added SHOP_FOLLOWING, SHOP_SETTINGS, REVIEW_HELPFUL_VOTES, TICKET_MESSAGES, SESSIONS                                                                                                                                                  |
| **Task 11: Dark Mode**         | 17+ pages fixed                                                           | ✅ user/won-auctions, watchlist, tickets, messages, following, riplimit, bids; seller/messages, support-tickets, orders, my-shops, revenue, analytics; admin/users, orders/[id], support-tickets/[id], admin/tickets, admin/tickets/[id] |
| **Task 12: Console.log**       | 7 files fixed                                                             | ✅ Removed debug console.log from admin/orders, shops, products, users, hero-slides pages                                                                                                                                                |
| **Task 4: DateDisplay**        | 2 files fixed                                                             | ✅ admin/orders/[id] and admin/support-tickets/[id] now use DateDisplay component                                                                                                                                                        |
| **Task 1: File Splitting**     | `src/app/admin/demo/page.tsx`                                             | ✅ Split 1797 lines → 400 lines + 8 reusable components                                                                                                                                                                                  |
| **Task 22: useLoadingState**   | 45+ pages                                                                 | ✅ Migrated to useLoadingState hook: 45+ pages across user, seller, admin, and public routes                                                                                                                                             |
| **StatsCard Dark Mode**        | `src/components/common/StatsCard.tsx`                                     | ✅ Added dark mode support and StatsCardGrid component                                                                                                                                                                                   |
| **StatsCardGrid Migration**    | 15 pages                                                                  | ✅ Migrated to StatsCardGrid: admin/tickets, support-tickets, returns, reviews, auctions/moderation, coupons, payouts + seller/orders, returns + user/page, user/bids, user/won-auctions, user/watchlist, user/reviews + seller/page     |
| **SimplePagination Migration** | 7 pages                                                                   | ✅ Migrated to SimplePagination: admin/reviews, auctions/moderation, payouts, support-tickets + seller/returns + user/returns + seller/reviews                                                                                           |
| **useLoadingState Fixes**      | 5 pages                                                                   | ✅ Fixed useLoadingState destructuring: admin/returns, admin/coupons, admin/auctions/moderation, admin/reviews, seller/returns (isLoading: loading alias, { initialData: [] } options)                                                   |
| **Null Safety Fixes**          | 5 pages                                                                   | ✅ Fixed null safety for arrays: admin/returns, admin/coupons, admin/auctions/moderation, admin/reviews, seller/returns (array                                                                                                           |     | []) pattern |

---

## ✅ COMPLETED TASKS

### Task 1: Large File Splitting (In Progress)

**Status**: 🟡 IN PROGRESS (10% - First major file split)

**Files Split**:

- ✅ `src/app/admin/demo/page.tsx` - Reduced from 1797 lines to ~400 lines
  - Created `components/types.ts` - TypeScript interfaces
  - Created `components/config.ts` - Step configurations and constants
  - Created `components/DemoStepCard.tsx` - Step progress card
  - Created `components/DemoStats.tsx` - Stats sidebar
  - Created `components/DemoCredentials.tsx` - Test user credentials section
  - Created `components/DemoScaleControl.tsx` - Scale slider component
  - Created `components/DemoActionButtons.tsx` - Generate/cleanup buttons
  - Created `components/DemoDeletionResult.tsx` - Deletion summary
  - Created `components/DemoProgressBar.tsx` - Progress bar component

### Task 2: COLLECTIONS/SUBCOLLECTIONS Migration (Partial - In Progress)

**Status**: 🟢 COMPLETE (95%+)

**Files Fixed**:

- ✅ `src/app/api/tickets/[id]/route.ts` - Using COLLECTIONS.SUPPORT_TICKETS, SUBCOLLECTIONS.TICKET_MESSAGES
- ✅ `src/app/api/tickets/route.ts` - Using COLLECTIONS.SUPPORT_TICKETS
- ✅ `src/app/api/tickets/[id]/reply/route.ts` - Using COLLECTIONS.SUPPORT_TICKETS, SUBCOLLECTIONS.TICKET_MESSAGES
- ✅ `src/app/api/tickets/bulk/route.ts` - Using COLLECTIONS.SUPPORT_TICKETS, SUBCOLLECTIONS.TICKET_MESSAGES
- ✅ `src/app/api/auth/register/route.ts` - Using COLLECTIONS.USERS
- ✅ `src/app/api/auth/google/route.ts` - Using COLLECTIONS.USERS
- ✅ `src/app/api/auth/login/route.ts` - Using COLLECTIONS.USERS
- ✅ `src/app/api/auth/me/route.ts` - Using COLLECTIONS.USERS
- ✅ `src/app/api/auth/reset-password/route.ts` - Using COLLECTIONS.USERS, COLLECTIONS.SESSIONS
- ✅ `src/app/api/middleware/rbac-auth.ts` - Using COLLECTIONS.USERS
- ✅ `src/app/api/lib/session.ts` - Using COLLECTIONS.SESSIONS and COLLECTIONS.USERS
- ✅ `src/app/api/lib/auth.ts` - Using COLLECTIONS.USERS
- ✅ `src/app/api/lib/bulk-operations.ts` - Using COLLECTIONS.USERS
- ✅ `src/app/api/lib/firebase/transactions.ts` - Using COLLECTIONS for orders, products, auctions, bids, returns, refunds
- ✅ `src/app/api/user/addresses/route.ts` - Using COLLECTIONS.ADDRESSES
- ✅ `src/app/api/user/addresses/[id]/route.ts` - Using COLLECTIONS.ADDRESSES
- ✅ `src/app/api/reviews/[id]/helpful/route.ts` - Using SUBCOLLECTIONS.REVIEW_HELPFUL_VOTES
- ✅ `src/app/api/shops/[slug]/follow/route.ts` - Using SUBCOLLECTIONS.SHOP_FOLLOWING
- ✅ `src/app/api/shops/following/route.ts` - Using SUBCOLLECTIONS.SHOP_FOLLOWING
- ✅ `src/app/api/seller/settings/route.ts` - Using SUBCOLLECTIONS.SHOP_SETTINGS
- ✅ `src/app/api/categories/[slug]/products/route.ts` - Using COLLECTIONS.CATEGORIES, COLLECTIONS.PRODUCTS
- ✅ `src/app/api/test-data/cleanup/route.ts` - Using COLLECTIONS.BIDS, COLLECTIONS.NOTIFICATIONS
- ✅ `src/app/api/test-data/generate-users/route.ts` - Using COLLECTIONS.USERS
- ✅ `src/app/api/test-data/generate-categories/route.ts` - Using COLLECTIONS.CATEGORIES
- ✅ `src/app/api/admin/debug/products-by-category/route.ts` - Using COLLECTIONS.PRODUCTS, COLLECTIONS.CATEGORIES
- ✅ `src/app/api/admin/demo/stats/route.ts` - Using all COLLECTIONS
- ✅ `src/app/api/admin/demo/summary/route.ts` - Using all COLLECTIONS
- ✅ `src/app/api/admin/demo/sessions/route.ts` - Using COLLECTIONS.CATEGORIES
- ✅ `src/app/api/admin/demo/progress/[sessionId]/route.ts` - Using all COLLECTIONS
- ✅ `src/app/api/admin/demo/analytics/[sessionId]/route.ts` - Using all COLLECTIONS
- ✅ `src/app/api/admin/demo/visualization/[sessionId]/route.ts` - Using all COLLECTIONS
- ✅ `src/app/api/admin/demo/generate/settings/route.ts` - Using all settings COLLECTIONS
- ✅ `src/app/api/admin/demo/cleanup/[step]/route.ts` - Using COLLECTIONS.CONVERSATIONS, COLLECTIONS.MESSAGES
- ✅ `src/app/api/admin/demo/cleanup-all/route.ts` - Using COLLECTIONS for all lookups

**Constants Added**:

- ✅ `COLLECTIONS.SESSIONS` - For session management
- ✅ `COLLECTIONS.SITE_SETTINGS` - For site configuration
- ✅ `COLLECTIONS.PAYMENT_SETTINGS` - For payment configuration
- ✅ `COLLECTIONS.SHIPPING_ZONES` - For shipping zones
- ✅ `COLLECTIONS.SHIPPING_CARRIERS` - For shipping carriers
- ✅ `COLLECTIONS.EMAIL_TEMPLATES` - For email templates
- ✅ `COLLECTIONS.EMAIL_SETTINGS` - For email settings
- ✅ `COLLECTIONS.NOTIFICATION_SETTINGS` - For notification settings
- ✅ `COLLECTIONS.FEATURE_FLAGS` - For feature flags
- ✅ `COLLECTIONS.BUSINESS_RULES` - For business rules
- ✅ `COLLECTIONS.RIPLIMIT_SETTINGS` - For RipLimit settings
- ✅ `COLLECTIONS.ANALYTICS_SETTINGS` - For analytics settings
- ✅ `COLLECTIONS.HOMEPAGE_SETTINGS` - For homepage settings
- ✅ `SUBCOLLECTIONS.SHOP_FOLLOWING` - For user following shops
- ✅ `SUBCOLLECTIONS.SHOP_SETTINGS` - For seller settings
- ✅ `SUBCOLLECTIONS.REVIEW_HELPFUL_VOTES` - For helpful vote tracking
- ✅ `SUBCOLLECTIONS.TICKET_MESSAGES` - For support ticket messages

### Task 11: Dark Mode Support (Partial - In Progress)

**Status**: 🟢 COMPLETE (100%)

**Files Fixed**:

- ✅ `src/app/user/won-auctions/page.tsx` - Full dark mode support added
- ✅ `src/app/user/watchlist/page.tsx` - Full dark mode support added
- ✅ `src/app/user/tickets/page.tsx` - Full dark mode support added
- ✅ `src/app/user/tickets/[id]/page.tsx` - Full dark mode support added
- ✅ `src/app/user/messages/page.tsx` - Full dark mode support added
- ✅ `src/app/user/orders/[id]/page.tsx` - Order tracking timeline dark mode
- ✅ `src/app/seller/messages/page.tsx` - Full dark mode support added
- ✅ `src/app/seller/support-tickets/page.tsx` - Full dark mode support added
- ✅ `src/app/seller/help/page.tsx` - FAQ, contact section dark mode
- ✅ `src/app/seller/products/page.tsx` - Table/grid view dark mode
- ✅ `src/app/seller/my-shops/create/page.tsx` - Full page dark mode
- ✅ `src/app/seller/coupons/create/page.tsx` - Full page dark mode
- ✅ `src/app/products/create/page.tsx` - Full page dark mode
- ✅ `src/app/products/[slug]/edit/page.tsx` - Full page dark mode
- ✅ `src/app/admin/users/page.tsx` - Full dark mode support added
- ✅ `src/app/admin/orders/[id]/page.tsx` - Full dark mode support added
- ✅ `src/app/admin/support-tickets/[id]/page.tsx` - Full dark mode support added
- ✅ `src/app/admin/component-demo/page.tsx` - Full dark mode support added
- ✅ `src/app/admin/tickets/page.tsx` - Full dark mode support (stats, filters, table, mobile cards)
- ✅ `src/app/admin/tickets/[id]/page.tsx` - Full dark mode support (all sections)
- ✅ `src/app/admin/page.tsx` - Full dark mode support (dashboard)
- ✅ `src/app/admin/hero-slides/create/page.tsx` - Full dark mode support added
- ✅ `src/app/admin/hero-slides/[id]/edit/page.tsx` - Full dark mode support added
- ✅ `src/app/admin/static-assets/page.tsx` - Full dark mode support added
- ✅ `src/app/admin/riplimit/page.tsx` - Full dark mode support added
- ✅ `src/app/admin/reviews/page.tsx` - Full dark mode support added
- ✅ `src/app/admin/payouts/page.tsx` - Already had dark mode
- ✅ `src/app/admin/returns/page.tsx` - Already had dark mode
- ✅ `src/components/common/StatsCard.tsx` - Added dark mode support
- ✅ `src/components/admin/AdminPageHeader.tsx` - Added dark mode support
- ✅ `src/components/admin/LoadingSpinner.tsx` - Added dark mode support

**All major pages now have dark mode support!**

---

### Task 12: Console.log Removal

**Status**: 🟢 COMPLETE (100%)

**Files Fixed**:

- ✅ `src/components/layout/FeaturedShopsSection.tsx` - Removed debug console.log
- ✅ `src/components/layout/FeaturedProductsSection.tsx` - Removed debug console.log
- ✅ `src/components/layout/FeaturedCategoriesSection.tsx` - Removed debug console.log
- ✅ `src/components/layout/FeaturedAuctionsSection.tsx` - Removed debug console.log
- ✅ `src/contexts/AuthContext.tsx` - Removed debug console.log (kept console.error for real errors)
- ✅ Admin pages (orders, shops, products, users, hero-slides) - Removed previously

---

### Task 4: Date Formatting Migration (Partial - In Progress)

**Status**: 🟡 IN PROGRESS (60% complete)

**Files Fixed**:

- ✅ `src/app/admin/orders/[id]/page.tsx` - Using DateDisplay component
- ✅ `src/app/admin/support-tickets/[id]/page.tsx` - Using DateDisplay component
- ✅ `src/app/admin/demo/page.tsx` - Using DateDisplay for summary.createdAt

**Remaining**:

- Files with inline date formatting in CSV exports (acceptable for file generation)
- Complex computed date displays (like "Best Day" in analytics)

---

## 🔄 Task 22: Reusable Hooks, Contexts & Functions Analysis (NEW)

**Priority**: HIGH
**Effort**: 8-12 hours
**Goal**: Consolidate duplicate patterns into reusable hooks and utilities

### Existing Reusable Hooks (Already Available)

These hooks exist and should be used consistently across the codebase:

| Hook                   | Location                          | Purpose                             | Usage Status |
| ---------------------- | --------------------------------- | ----------------------------------- | ------------ |
| `useDebounce`          | `src/hooks/useDebounce.ts`        | Debounce values (search, filters)   | ⚠️ Underused |
| `useDebouncedCallback` | `src/hooks/useDebounce.ts`        | Debounce function calls             | ⚠️ Underused |
| `useThrottle`          | `src/hooks/useDebounce.ts`        | Throttle rapid updates              | ⚠️ Underused |
| `useApi`               | `src/hooks/useDebounce.ts`        | API calls with retry & debounce     | ⚠️ Underused |
| `useFilters`           | `src/hooks/useFilters.ts`         | Filter state with URL sync          | ⚠️ Underused |
| `useLoadingState`      | `src/hooks/useLoadingState.ts`    | Loading/error/data state management | ⚠️ Underused |
| `useMultiLoadingState` | `src/hooks/useLoadingState.ts`    | Multiple parallel loading states    | ⚠️ Underused |
| `useSafeLoad`          | `src/hooks/useSafeLoad.ts`        | Safe data loading with dependencies | ⚠️ Underused |
| `useAdminLoad`         | `src/hooks/useSafeLoad.ts`        | Admin-specific data loading         | ⚠️ Underused |
| `useMobile`            | `src/hooks/useMobile.ts`          | Mobile detection                    | ✅ Used      |
| `useMediaUpload`       | `src/hooks/useMediaUpload.ts`     | Image/file upload handling          | ✅ Used      |
| `useSlugValidation`    | `src/hooks/useSlugValidation.ts`  | Slug uniqueness checking            | ✅ Used      |
| `useNavigationGuard`   | `src/hooks/useNavigationGuard.ts` | Unsaved changes protection          | ⚠️ Underused |
| `useCart`              | `src/hooks/useCart.ts`            | Cart operations                     | ✅ Used      |
| `useHeaderStats`       | `src/hooks/useHeaderStats.ts`     | Header counts (cart, notifications) | ✅ Used      |

### Existing Contexts (Already Available)

| Context                 | Location                                 | Purpose                    | Hydration Safe |
| ----------------------- | ---------------------------------------- | -------------------------- | -------------- |
| `AuthContext`           | `src/contexts/AuthContext.tsx`           | User authentication & role | ✅ Yes         |
| `ThemeContext`          | `src/contexts/ThemeContext.tsx`          | Dark/light theme           | ✅ Yes         |
| `ComparisonContext`     | `src/contexts/ComparisonContext.tsx`     | Product comparison         | ⚠️ Check       |
| `UploadContext`         | `src/contexts/UploadContext.tsx`         | File upload state          | ⚠️ Check       |
| `ViewingHistoryContext` | `src/contexts/ViewingHistoryContext.tsx` | Recently viewed items      | ⚠️ Check       |

### Existing Utility Functions (Already Available)

| Function                  | Location                | Purpose                  |
| ------------------------- | ----------------------- | ------------------------ |
| `cn()`                    | `src/lib/utils.ts`      | Tailwind class merging   |
| `formatCurrency()`        | `src/lib/formatters.ts` | Price formatting ₹1,499  |
| `formatCompactCurrency()` | `src/lib/formatters.ts` | Compact price ₹1.5L      |
| `formatDate()`            | `src/lib/formatters.ts` | Date formatting          |
| `formatRelativeTime()`    | `src/lib/formatters.ts` | "2 hours ago"            |
| `formatNumber()`          | `src/lib/formatters.ts` | Number formatting        |
| `formatCompactNumber()`   | `src/lib/formatters.ts` | 1.5K, 2.3M               |
| `formatPercentage()`      | `src/lib/formatters.ts` | Percentage display       |
| `formatPhoneNumber()`     | `src/lib/formatters.ts` | Phone formatting         |
| `formatFileSize()`        | `src/lib/formatters.ts` | 1.5 MB                   |
| `formatDuration()`        | `src/lib/formatters.ts` | 2h 30m                   |
| `formatOrderId()`         | `src/lib/formatters.ts` | #ORD-ABC123              |
| `formatTimeRemaining()`   | `src/lib/formatters.ts` | Countdown display        |
| `formatAddress()`         | `src/lib/formatters.ts` | Address formatting       |
| `truncateText()`          | `src/lib/formatters.ts` | Text truncation          |
| `slugToTitle()`           | `src/lib/formatters.ts` | Slug to title conversion |

### Patterns to Consolidate

#### Pattern 1: Repeated Loading/Error State (Found in 30+ components)

**Current (Duplicated)**:

```tsx
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [data, setData] = useState<T | null>(null);

const loadData = async () => {
  setLoading(true);
  setError(null);
  try {
    const result = await service.getData();
    setData(result);
  } catch (e) {
    setError(e.message);
  } finally {
    setLoading(false);
  }
};
```

**Should Use**:

```tsx
import { useLoadingState } from "@/hooks/useLoadingState";

const { data, isLoading, error, execute } = useLoadingState<T>();

useEffect(() => {
  execute(() => service.getData());
}, []);
```

**Files to Migrate**:

- All admin list pages (`/admin/users`, `/admin/products`, etc.)
- All seller list pages (`/seller/products`, `/seller/orders`, etc.)
- All user pages with data fetching

#### Pattern 2: URL Filter Sync (Found in 15+ pages)

**Current (Duplicated)**:

```tsx
const searchParams = useSearchParams();
const router = useRouter();
const [filters, setFilters] = useState({});

// Manual URL sync logic repeated...
```

**Should Use**:

```tsx
import { useFilters } from "@/hooks/useFilters";

const { filters, appliedFilters, applyFilters, resetFilters } = useFilters(
  {
    status: "",
    sort: "-createdAt",
  },
  { syncWithUrl: true },
);
```

#### Pattern 3: Debounced Search (Found in 10+ components)

**Current (Duplicated)**:

```tsx
const [searchTerm, setSearchTerm] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState("");

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(searchTerm);
  }, 300);
  return () => clearTimeout(timer);
}, [searchTerm]);
```

**Should Use**:

```tsx
import { useDebounce } from "@/hooks/useDebounce";

const [searchTerm, setSearchTerm] = useState("");
const debouncedSearch = useDebounce(searchTerm, 300);
```

#### Pattern 4: Admin Role Check + Data Load (Found in 12+ admin pages)

**Current (Duplicated)**:

```tsx
const { user, isAdmin } = useAuth();
const [loading, setLoading] = useState(false);

useEffect(() => {
  if (!user || !isAdmin) return;
  loadData();
}, [user?.uid, isAdmin]);
```

**Should Use**:

```tsx
import { useAdminLoad } from "@/hooks/useSafeLoad";

useAdminLoad(loadData, {
  user: currentUser,
  requiredRole: "admin",
  deps: [filter1, filter2],
});
```

### New Hooks to Create

| Hook               | Purpose                               | Reduces Code In        |
| ------------------ | ------------------------------------- | ---------------------- |
| `useUrlPagination` | URL-based pagination state            | All list pages         |
| `useSortableList`  | Sorting + filtering + pagination      | Admin/seller tables    |
| `useBulkSelection` | Checkbox selection for bulk actions   | All table pages        |
| `useFormWithDraft` | Auto-save form drafts to localStorage | All create/edit forms  |
| `useConfirmAction` | Confirm dialog state management       | Delete/bulk operations |

### Migration Checklist

#### Phase 1: Replace Manual Loading States (4-6 hours)

- [ ] Audit pages using `useState(false)` for loading
- [ ] Replace with `useLoadingState` hook
- [ ] Test all affected pages

#### Phase 2: Consolidate Filter Logic (4-6 hours)

- [ ] Audit pages with manual filter state
- [ ] Replace with `useFilters` hook
- [ ] Ensure URL sync works

#### Phase 3: Add Debounce to Search (2-3 hours)

- [ ] Find all search inputs without debounce
- [ ] Add `useDebounce` hook
- [ ] Test search functionality

#### Phase 4: Create New Hooks (6-8 hours)

- [ ] Create `useUrlPagination`
- [ ] Create `useSortableList`
- [ ] Create `useBulkSelection`
- [ ] Create `useFormWithDraft`

---

## Executive Summary

This document identifies code quality issues, refactoring opportunities, and improvements needed across the JustForView.in auction platform. Issues are categorized by priority and include effort estimates.

**Key Finding**: Creating 8 reusable components first will reduce effort by 60-65% and eliminate ~13,000 lines of duplicated code across 60+ files.

---

## 🚨 NEW FEATURE REQUIREMENTS

> **See**: [EVENTS-AND-VERIFICATION-CHECKLIST.md](./EVENTS-AND-VERIFICATION-CHECKLIST.md) for full implementation details

### Priority Features (Required Before Launch)

| Feature                  | Priority      | Effort | Status         |
| ------------------------ | ------------- | ------ | -------------- |
| Email OTP Verification   | P1 - CRITICAL | 8-12h  | ⬜ Not Started |
| Phone OTP Verification   | P1 - CRITICAL | 8-12h  | ⬜ Not Started |
| Verification Enforcement | P1 - CRITICAL | 4-6h   | ⬜ Not Started |
| IP Tracking & Logging    | P2 - HIGH     | 6-8h   | ⬜ Not Started |
| Events Management System | P3 - MEDIUM   | 24-32h | ⬜ Not Started |

**Total New Feature Effort**: 50-70 hours

---

## Table of Contents

1. [Task 1: Large Files Needing Component Splitting](#task-1-large-files-needing-component-splitting)
2. [Task 2: Unused Constants & Missing COLLECTIONS/FIELDS Usage](#task-2-unused-constants--missing-collectionsfields-usage)
3. [Task 3: Constants That Can Be Reused](#task-3-constants-that-can-be-reused)
4. [Task 4: HTML/Value Wrappers Not Being Used](#task-4-htmlvalue-wrappers-not-being-used)
5. [Task 5: Sieve Processing Not Used Everywhere](#task-5-sieve-processing-not-used-everywhere)
6. [Task 6: Wizard Navigation Issues](#task-6-wizard-navigation-issues)
7. [Task 7: Products/Auctions Missing Category & Shop Display](#task-7-productsauctions-missing-category--shop-display)
8. [Task 8: API Debouncing Issues](#task-8-api-debouncing-issues)
9. [Task 9: Performance & Cost Optimization](#task-9-performance--cost-optimization)
10. [Task 10: Category Graph View & Table Config](#task-10-category-graph-view--table-config)
11. [Task 11: Mobile & Dark Mode Support](#task-11-mobile--dark-mode-support)
12. [Task 12: Code Quality & Type Safety](#task-12-code-quality--type-safety-issues)
13. [Task 13: Accessibility Improvements](#task-13-accessibility-improvements)
14. [Task 14: Test Coverage Gaps](#task-14-test-coverage-gaps)
15. [Task 15: User Verification System](#task-15-user-verification-system) ⭐ NEW
16. [Task 16: IP Tracking & Security](#task-16-ip-tracking--security) ⭐ NEW
17. [Task 17: Events Management System](#task-17-events-management-system) ⭐ NEW
18. [Task 18: Navigation, Filters & Dark Mode Consistency](#task-18-navigation-filters--dark-mode-consistency-new---high-priority)
19. [Task 19: URL-Based Filtering, Sorting & Pagination](#task-19-url-based-filtering-sorting--pagination-new---high-priority)
20. [Task 20: Firestore Indexes & Query Optimization](#task-20-firestore-indexes--query-optimization-new)
21. [Task 21: Navigation Component Cleanup & Refactoring](#task-21-navigation-component-cleanup--refactoring-new)
22. [Task 22: Reusable Hooks, Contexts & Functions](#task-22-reusable-hooks-contexts--functions-analysis-new) ⭐ NEW
23. [Task 23: Form & Wizard Component Reusability](#task-23-form--wizard-component-reusability-new) ⭐ NEW

---

## Task 1: Large Files Needing Component Splitting

**Priority**: HIGH
**Effort**: 12-18 hours (reduced due to shared components)
**Goal**: Split files >350 lines into smaller, reusable components

---

### 🔄 COMPONENT REUSE ANALYSIS

Many large files share identical patterns and can use shared components. This significantly reduces effort.

#### Already Existing Reusable Components

| Component              | Location                                         | Used By                         |
| ---------------------- | ------------------------------------------------ | ------------------------------- |
| `InlineEditRow`        | `src/components/common/InlineEditRow.tsx`        | All admin/seller table pages    |
| `QuickCreateRow`       | `src/components/common/QuickCreateRow.tsx`       | All admin/seller table pages    |
| `BulkActionBar`        | `src/components/common/BulkActionBar.tsx`        | All admin/seller table pages    |
| `TableCheckbox`        | `src/components/common/TableCheckbox.tsx`        | All admin/seller table pages    |
| `UnifiedFilterSidebar` | `src/components/common/UnifiedFilterSidebar.tsx` | All list pages                  |
| `StatusBadge`          | `src/components/common/StatusBadge.tsx`          | All tables                      |
| `ConfirmDialog`        | `src/components/common/ConfirmDialog.tsx`        | All delete/action confirmations |
| `ViewToggle`           | `src/components/seller/ViewToggle.tsx`           | All grid/table view pages       |
| `StatsCard`            | `src/components/common/StatsCard.tsx`            | Dashboard pages                 |

#### NEW Components to Create (Shared Across Multiple Files)

| Component            | Create Location                                  | Will Reduce Lines In            |
| -------------------- | ------------------------------------------------ | ------------------------------- |
| `AdminResourcePage`  | `src/components/admin/AdminResourcePage.tsx`     | ALL 12+ admin list pages        |
| `SellerResourcePage` | `src/components/seller/SellerResourcePage.tsx`   | ALL 6+ seller list pages        |
| `PeriodSelector`     | `src/components/common/PeriodSelector.tsx`       | 3 analytics pages (duplicated!) |
| `AnalyticsStatCard`  | `src/components/analytics/AnalyticsStatCard.tsx` | 3 analytics pages (duplicated!) |
| `ResourcePageHeader` | `src/components/common/ResourcePageHeader.tsx`   | ALL admin/seller pages          |
| `CursorPagination`   | `src/components/common/CursorPagination.tsx`     | ALL paginated pages             |
| `ResourceStats`      | `src/components/common/ResourceStats.tsx`        | Admin pages with stats sections |
| `SettingsSection`    | `src/components/settings/SettingsSection.tsx`    | ALL settings pages              |
| `PolicyPage`         | `src/components/common/PolicyPage.tsx`           | 5 legal/policy pages            |
| `TransactionList`    | `src/components/common/TransactionList.tsx`      | 4 transaction/history pages     |
| `StatsCardGrid`      | `src/components/common/StatsCardGrid.tsx`        | 8 dashboard pages               |

#### Pattern: Admin List Pages (12+ pages share this exact pattern)

```typescript
// Current: Each page has 600-900 lines of repeated code:
// - Same imports (InlineEditRow, BulkActionBar, TableCheckbox, etc.)
// - Same state management (loading, error, selectedIds, editingId, etc.)
// - Same pagination logic (cursors, currentPage, hasNextPage)
// - Same filter handling (showFilters, filterValues, handleFilterChange)
// - Same bulk action handling
// - Same table structure

// SOLUTION: Create AdminResourcePage wrapper
// Pages would shrink from 600-900 lines to 100-200 lines!

<AdminResourcePage
  resourceName="products"
  service={productsService}
  fields={PRODUCT_FIELDS}
  bulkActions={getProductBulkActions}
  filters={PRODUCT_FILTERS}
  renderRow={(item, editing) => <ProductRow item={item} editing={editing} />}
  renderCard={(item) => <ProductCard item={item} />}
/>
```

---

### Files Requiring Immediate Splitting (>500 lines, non-test files)

| File                                             | Lines | Priority | Components to Extract                                          |
| ------------------------------------------------ | ----- | -------- | -------------------------------------------------------------- |
| `src/app/admin/demo/page.tsx`                    | 1679  | HIGH     | DemoDataControls, DemoDataStats, DemoDataActions, DemoProgress |
| `src/app/admin/users/page.tsx`                   | 976   | HIGH     | UserTable, UserFilters, UserActions, UserBulkActions           |
| `src/constants/form-fields.ts`                   | 950   | MEDIUM   | Split by entity: product-fields.ts, auction-fields.ts, etc.    |
| `src/app/admin/homepage/page.tsx`                | 839   | HIGH     | SectionManager, SectionCard, BannerEditor, SectionOrderManager |
| `src/app/admin/riplimit/page.tsx`                | 828   | HIGH     | RipLimitStats, TransactionTable, AccountsTable, RefundModal    |
| `src/constants/inline-fields.ts`                 | 813   | MEDIUM   | Split by entity like form-fields.ts                            |
| `src/app/admin/featured-sections/page.tsx`       | 785   | HIGH     | FeaturedSectionCard, SectionItemList, AddItemModal             |
| `src/app/admin/auctions/page.tsx`                | 777   | HIGH     | AuctionTable, AuctionFilters, AuctionStats                     |
| `src/components/common/SearchableDropdown.tsx`   | 775   | MEDIUM   | SearchInput, OptionList, LoadingState, EmptyState              |
| `src/constants/filters.ts`                       | 765   | MEDIUM   | Product filters, auction filters, order filters                |
| `src/app/admin/shops/page.tsx`                   | 730   | HIGH     | ShopTable, ShopFilters, ShopStats, VerificationModal           |
| `src/app/seller/settings/page.tsx`               | 712   | HIGH     | ProfileSettings, NotificationSettings, PaymentSettings         |
| `src/app/user/riplimit/page.tsx`                 | 704   | MEDIUM   | RipLimitBalance, PurchaseSection, TransactionHistory           |
| `src/app/seller/reviews/page.tsx`                | 693   | MEDIUM   | ReviewTable, ReviewFilters, ReviewResponse                     |
| `src/app/admin/categories/page.tsx`              | 686   | HIGH     | CategoryTable, CategoryTree, CategoryFilters                   |
| `src/app/admin/products/page.tsx`                | 679   | HIGH     | ProductTable, ProductFilters, ProductStats                     |
| `src/app/admin/blog/page.tsx`                    | 665   | MEDIUM   | BlogTable, BlogFilters, BlogStats                              |
| `src/components/media/ImageEditor.tsx`           | 655   | MEDIUM   | CropTool, FilterPanel, AdjustmentSliders                       |
| `src/app/seller/products/page.tsx`               | 652   | HIGH     | SellerProductTable, SellerProductFilters                       |
| `src/app/shipping-policy/page.tsx`               | 652   | LOW      | Already static content                                         |
| `src/app/admin/coupons/page.tsx`                 | 652   | MEDIUM   | CouponTable, CouponFilters, CouponStats                        |
| `src/app/admin/blog/tags/page.tsx`               | 647   | LOW      | TagTable, TagFilters                                           |
| `src/components/cards/AuctionCard.tsx`           | 646   | MEDIUM   | AuctionCardHeader, AuctionCardBidInfo, AuctionCardActions      |
| `src/app/seller/auctions/page.tsx`               | 644   | HIGH     | SellerAuctionTable, SellerAuctionFilters                       |
| `src/app/admin/settings/payment/page.tsx`        | 631   | MEDIUM   | PaymentProviderCard, ProviderConfigForm                        |
| `src/components/common/UnifiedFilterSidebar.tsx` | 629   | HIGH     | FilterSection, PriceRangeFilter, CategoryFilter, etc.          |
| `src/app/admin/orders/page.tsx`                  | 626   | HIGH     | OrderTable, OrderFilters, OrderStats                           |
| `src/app/cookie-policy/page.tsx`                 | 624   | LOW      | Static content                                                 |
| `src/app/admin/settings/notifications/page.tsx`  | 604   | MEDIUM   | NotificationChannels, NotificationTemplates                    |
| `src/app/admin/auctions/live/page.tsx`           | 597   | MEDIUM   | LiveAuctionCard, LiveBidStream                                 |
| `src/app/products/page.tsx`                      | 579   | HIGH     | ProductGrid, ProductFilters, ProductSort                       |
| `src/components/seller/CouponForm.tsx`           | 577   | HIGH     | CouponBasicInfo, CouponConditions, CouponLimits                |
| `src/components/common/SmartAddressForm.tsx`     | 570   | MEDIUM   | AddressFields, PincodeValidator, MapPreview                    |
| `src/app/admin/blog/categories/page.tsx`         | 563   | LOW      | BlogCategoryTable                                              |
| `src/app/user/messages/page.tsx`                 | 561   | MEDIUM   | ConversationList, MessageThread, MessageInput                  |
| `src/app/checkout/page.tsx`                      | 560   | HIGH     | CheckoutSteps, AddressStep, PaymentStep, ConfirmStep           |
| `src/constants/bulk-actions.ts`                  | 552   | MEDIUM   | Split by entity                                                |
| `src/components/layout/MainNavBar.tsx`           | 552   | HIGH     | NavLinks, NavSearch, NavUser, NavMobile                        |
| `src/app/admin/analytics/sales/page.tsx`         | 540   | MEDIUM   | SalesCharts, SalesMetrics, SalesTable                          |

### 📊 File Groupings by Shared Component Patterns

These files share nearly identical code and should use the same base components:

#### Group A: Admin Resource Pages (Can Use `AdminResourcePage`)

All these pages have identical structure with table, filters, bulk actions, inline edit:

| File                                     | Lines      | After Refactor |
| ---------------------------------------- | ---------- | -------------- |
| `src/app/admin/users/page.tsx`           | 976        | ~150 lines     |
| `src/app/admin/auctions/page.tsx`        | 777        | ~150 lines     |
| `src/app/admin/shops/page.tsx`           | 730        | ~150 lines     |
| `src/app/admin/categories/page.tsx`      | 686        | ~150 lines     |
| `src/app/admin/products/page.tsx`        | 679        | ~150 lines     |
| `src/app/admin/blog/page.tsx`            | 665        | ~150 lines     |
| `src/app/admin/coupons/page.tsx`         | 652        | ~150 lines     |
| `src/app/admin/orders/page.tsx`          | 626        | ~150 lines     |
| `src/app/admin/reviews/page.tsx`         | 394        | ~120 lines     |
| `src/app/admin/support-tickets/page.tsx` | 388        | ~120 lines     |
| `src/app/admin/returns/page.tsx`         | 424        | ~120 lines     |
| `src/app/admin/payouts/page.tsx`         | 410        | ~120 lines     |
| **Total Savings**                        | **~7,800** | **~1,800**     |

#### Group B: Seller Resource Pages (Can Use `SellerResourcePage`)

| File                               | Lines      | After Refactor |
| ---------------------------------- | ---------- | -------------- |
| `src/app/seller/products/page.tsx` | 652        | ~150 lines     |
| `src/app/seller/auctions/page.tsx` | 644        | ~150 lines     |
| `src/app/seller/orders/page.tsx`   | 476        | ~120 lines     |
| `src/app/seller/coupons/page.tsx`  | 407        | ~120 lines     |
| `src/app/seller/reviews/page.tsx`  | 693        | ~150 lines     |
| `src/app/seller/returns/page.tsx`  | 472        | ~120 lines     |
| **Total Savings**                  | **~3,350** | **~810**       |

#### Group C: Analytics Pages (Share `PeriodSelector`, `AnalyticsStatCard`, Chart components)

| File                                        | Lines | Duplicated Components            |
| ------------------------------------------- | ----- | -------------------------------- |
| `src/app/admin/analytics/sales/page.tsx`    | 540   | PeriodSelector, StatCard, charts |
| `src/app/admin/analytics/auctions/page.tsx` | 534   | PeriodSelector, StatCard, charts |
| `src/app/admin/analytics/users/page.tsx`    | 521   | PeriodSelector, StatCard, charts |

**Solution**: Extract shared components:

- `PeriodSelector` (~50 lines) - identical in all 3 files
- `AnalyticsStatCard` (~40 lines) - identical in all 3 files
- `TrendChart` component for line/bar charts

#### Group D: Settings Pages (Share `SettingsSection`, `SettingsForm`)

| File                                            | Lines | Pattern                    |
| ----------------------------------------------- | ----- | -------------------------- |
| `src/app/seller/settings/page.tsx`              | 712   | Multiple settings sections |
| `src/app/admin/settings/payment/page.tsx`       | 631   | Provider cards + forms     |
| `src/app/admin/settings/notifications/page.tsx` | 604   | Channel configs            |
| `src/app/admin/settings/shipping/page.tsx`      | 510   | Provider configs           |
| `src/app/admin/settings/general/page.tsx`       | 402   | Form sections              |
| `src/app/admin/settings/email/page.tsx`         | 461   | Template configs           |

**Solution**: Create `SettingsSection` and `ProviderConfigCard` components

#### Group E: Public List Pages (Share filtering and grid/list views)

| File                          | Lines | Pattern               |
| ----------------------------- | ----- | --------------------- |
| `src/app/products/page.tsx`   | 579   | Filter sidebar + grid |
| `src/app/auctions/page.tsx`   | 460   | Filter sidebar + grid |
| `src/app/shops/page.tsx`      | 310   | Filter sidebar + grid |
| `src/app/categories/page.tsx` | 428   | Filter sidebar + grid |

**Solution**: Create `PublicResourcePage` wrapper

#### Group F: RipLimit Pages (Share transaction tables and stats)

| File                              | Lines | Pattern                      |
| --------------------------------- | ----- | ---------------------------- |
| `src/app/admin/riplimit/page.tsx` | 828   | Stats + tables + modals      |
| `src/app/user/riplimit/page.tsx`  | 704   | Balance + purchase + history |

**Solution**: Create shared RipLimit components:

- `RipLimitStats` component
- `RipLimitTransactionTable` component
- `RipLimitPurchaseFlow` component

---

### Files to Review (350-500 lines)

| File                                        | Lines | Notes                                     |
| ------------------------------------------- | ----- | ----------------------------------------- |
| `src/app/admin/analytics/auctions/page.tsx` | 534   | Split charts and metrics                  |
| `src/app/admin/analytics/users/page.tsx`    | 521   | Split user analytics components           |
| `src/app/admin/settings/shipping/page.tsx`  | 510   | Split shipping providers                  |
| `src/constants/navigation.ts`               | 510   | Split by role: admin, seller, user        |
| `src/components/cards/ProductCard.tsx`      | 506   | Extract ProductCardImage, ProductCardInfo |
| `src/app/user/reviews/page.tsx`             | 488   | Split review list and filters             |
| `src/app/user/returns/page.tsx`             | 487   | Split return list and forms               |
| `src/app/seller/help/page.tsx`              | 478   | Already help content                      |
| `src/app/seller/orders/page.tsx`            | 476   | Split order table and filters             |
| `src/app/admin/dashboard/page.tsx`          | 476   | Already uses StatCard components          |
| `src/app/seller/page.tsx`                   | 475   | Split dashboard sections                  |

### Refactoring Pattern

```typescript
// BEFORE: Large monolithic component
export default function AdminUsersPage() {
  // 900+ lines of code
}

// AFTER: Split into focused components
// src/components/admin/users/UserTable.tsx
// src/components/admin/users/UserFilters.tsx
// src/components/admin/users/UserBulkActions.tsx
// src/app/admin/users/page.tsx (orchestration only, <200 lines)
```

---

## Task 2: Unused Constants & Missing COLLECTIONS/FIELDS Usage

**Priority**: HIGH
**Effort**: 8-12 hours
**Goal**: Use COLLECTIONS constant in all API routes instead of hardcoded strings

### Files Using Hardcoded Collection Names (Need Fix)

| File                                                    | Issue                         | Fix                            |
| ------------------------------------------------------- | ----------------------------- | ------------------------------ |
| `src/app/api/tickets/[id]/route.ts:72`                  | `db.collection("users")`      | Use `Collections.users()`      |
| `src/app/api/test-data/generate-users/route.ts:35`      | `db.collection("users")`      | Use `Collections.users()`      |
| `src/app/api/test-data/generate-categories/route.ts:45` | `db.collection("categories")` | Use `Collections.categories()` |
| `src/lib/category-hierarchy.ts`                         | Multiple hardcoded            | Use COLLECTIONS constants      |
| `src/app/api/tickets/route.ts`                          | `"support_tickets"`           | Use COLLECTIONS constant       |
| `src/app/api/tickets/[id]/reply/route.ts`               | Multiple hardcoded            | Use COLLECTIONS constants      |
| `src/app/api/tickets/bulk/route.ts`                     | Multiple hardcoded            | Use COLLECTIONS constants      |
| `src/app/api/user/addresses/route.ts`                   | `"addresses"`                 | `COLLECTIONS.ADDRESSES`        |
| `src/app/api/user/addresses/[id]/route.ts`              | `"addresses"`                 | `COLLECTIONS.ADDRESSES`        |
| `src/app/api/reviews/[id]/helpful/route.ts`             | `"helpful_votes"`             | Add to SUBCOLLECTIONS          |
| `src/app/api/middleware/rbac-auth.ts`                   | `"users"`                     | `COLLECTIONS.USERS`            |
| `src/app/api/lib/auth.ts`                               | `"users"`                     | `COLLECTIONS.USERS`            |
| `src/app/api/lib/session.ts`                            | `"sessions"`, `"users"`       | Add SESSIONS, use USERS        |
| `src/app/api/lib/firebase/transactions.ts`              | 8+ hardcoded collections      | Use all COLLECTIONS            |
| `src/app/api/lib/bulk-operations.ts`                    | `"users"`, `"temp"`           | Use COLLECTIONS                |
| `src/app/api/categories/[slug]/products/route.ts`       | Multiple hardcoded            | Use COLLECTIONS constants      |
| `src/app/api/auth/google/route.ts`                      | `"users"`                     | `COLLECTIONS.USERS`            |
| `src/app/api/auth/register/route.ts`                    | `"users"`                     | `COLLECTIONS.USERS`            |
| `src/app/api/test-data/cleanup/route.ts`                | Multiple hardcoded            | Use COLLECTIONS constants      |
| `src/app/api/shops/following/route.ts`                  | `"following"`                 | Add to SUBCOLLECTIONS          |
| `src/app/api/shops/[slug]/follow/route.ts`              | `"following"`                 | Add to SUBCOLLECTIONS          |
| `src/app/api/seller/settings/route.ts`                  | `"settings"`                  | Add to SUBCOLLECTIONS          |

### Missing from COLLECTIONS constant

```typescript
// Add to src/constants/database.ts
SESSIONS: "sessions",
```

### Missing from SUBCOLLECTIONS constant

```typescript
HELPFUL_VOTES: "helpful_votes",
SHOP_FOLLOWING: "following",
SHOP_SETTINGS: "settings",
```

### API Routes Not Using Collections Helper

Need to audit all API routes in:

- `src/app/api/products/`
- `src/app/api/auctions/`
- `src/app/api/orders/`
- `src/app/api/shops/`
- `src/app/api/users/`
- `src/app/api/categories/`
- `src/app/api/reviews/`
- `src/app/api/payments/`
- `src/app/api/payouts/`
- `src/app/api/coupons/`
- `src/app/api/returns/`
- `src/app/api/tickets/`

### Constants Not Being Used

| Constant File  | Location                      | Usage Status                         |
| -------------- | ----------------------------- | ------------------------------------ |
| `COLLECTIONS`  | `src/constants/database.ts`   | Partially used - need full migration |
| `FIELDS`       | `src/constants/database.ts`   | Rarely used - need migration         |
| `QUERY_LIMITS` | `src/constants/database.ts`   | Should use for pagination defaults   |
| `API_ROUTES`   | `src/constants/api-routes.ts` | Partially used - many direct strings |
| `ROUTES`       | `src/constants/routes.ts`     | Good usage, some gaps                |

### Migration Example

```typescript
// BEFORE
const docRef = await db.collection("users").doc(userId).get();

// AFTER
import { Collections } from "@/app/api/lib/firebase/collections";
const docRef = await Collections.users().doc(userId).get();
```

---

## Task 3: Constants That Can Be Reused

**Priority**: MEDIUM
**Effort**: 4-6 hours
**Goal**: Identify values that should be constants

### Values That Should Be Constants

| Current Usage            | Suggested Constant           | Location                    |
| ------------------------ | ---------------------------- | --------------------------- |
| `"published"` status     | `PRODUCT_STATUSES.PUBLISHED` | `src/constants/statuses.ts` |
| `"live"` auction status  | `AUCTION_STATUSES.LIVE`      | `src/constants/statuses.ts` |
| `20` default page size   | `QUERY_LIMITS.DEFAULT`       | Already exists, not used    |
| `"₹"` currency symbol    | `CURRENCY.SYMBOL`            | `src/constants/site.ts`     |
| `"en-IN"` locale         | `LOCALE.DEFAULT`             | `src/constants/site.ts`     |
| API error messages       | `ERROR_MESSAGES`             | New constant needed         |
| Form validation messages | `VALIDATION_MESSAGES`        | New constant needed         |

### Constants to Create

```typescript
// src/constants/messages.ts
export const ERROR_MESSAGES = {
  UNAUTHORIZED: "You must be logged in to perform this action",
  FORBIDDEN: "You don't have permission to perform this action",
  NOT_FOUND: "The requested resource was not found",
  VALIDATION_FAILED: "Please check your input and try again",
  SERVER_ERROR: "Something went wrong. Please try again later",
};

export const SUCCESS_MESSAGES = {
  CREATED: "Successfully created",
  UPDATED: "Successfully updated",
  DELETED: "Successfully deleted",
  SAVED: "Changes saved successfully",
};
```

---

## Task 4: HTML/Value Wrappers Not Being Used

**Priority**: HIGH
**Effort**: 8-12 hours
**Goal**: Replace raw HTML with wrapper components

### Components That Should Use Wrappers

Based on AI-AGENT-GUIDE.md, these wrappers exist but aren't consistently used:

#### Form Wrappers (src/components/forms/)

- `FormField` - Label + Input wrapper
- `FormInput` - Input wrapper
- `FormSelect` - Select wrapper
- `FormTextarea` - Textarea wrapper
- `FormCheckbox` - Checkbox wrapper
- `FormRadio` - Radio wrapper

#### Value Display Components (src/components/common/values/)

- `Price` - Currency formatting
- `DateDisplay` - Date formatting
- `RelativeDate` - "2 hours ago"
- `DateRange` - Date range display
- `TimeRemaining` - Countdown
- `PhoneNumber` - Phone formatting
- `Email` - Email with link
- `PaymentStatus` - Status badge
- `ShippingStatus` - Status badge
- `StockStatus` - Stock indicator
- `Rating` - Star rating
- `OrderId` - Order ID with copy
- `Address` - Address formatting
- `Quantity` - Number formatting
- `Weight` - Weight with units
- `Dimensions` - Dimension formatting
- `SKU` - SKU with copy
- `BidCount` - Bid count display
- `Percentage` - Percentage display
- `TruncatedText` - Text truncation
- `AuctionStatus` - Auction state

### Files Using Inline Date Formatting (Need Fix)

| File                                          | Issue                                          | Should Use                       |
| --------------------------------------------- | ---------------------------------------------- | -------------------------------- |
| `src/app/user/messages/page.tsx`              | `new Date().toLocaleTimeString()`              | `DateDisplay` with `includeTime` |
| `src/app/admin/users/page.tsx`                | `new Date(u.createdAt).toLocaleDateString()`   | `DateDisplay`                    |
| `src/app/admin/support-tickets/[id]/page.tsx` | `new Date(date).toLocaleDateString()`          | `DateDisplay`                    |
| `src/app/admin/orders/[id]/page.tsx`          | `new Date(date).toLocaleString()`              | `DateDisplay` with `includeTime` |
| `src/app/admin/demo/page.tsx`                 | `new Date(summary.createdAt).toLocaleString()` | `DateDisplay`                    |

### Files Likely Not Using Wrappers

Need to scan for:

- Raw `<input>` elements not wrapped in FormInput
- Raw `<label>` elements not wrapped in FormLabel
- Inline price formatting like `₹{price.toLocaleString()}`
- Inline date formatting like `new Date().toLocaleDateString()`
- Raw status strings not using StatusBadge components

### Example Migration

```tsx
// BEFORE
<span className="text-green-600">₹{product.price.toLocaleString('en-IN')}</span>
<span className="text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>

// AFTER
import { Price, DateDisplay } from '@/components/common/values';
<Price amount={product.price} />
<DateDisplay date={order.createdAt} />
```

---

## Task 5: Sieve Processing Not Used Everywhere

**Priority**: HIGH
**Effort**: 6-10 hours
**Goal**: Implement Sieve pagination across all list endpoints

### Current Sieve Implementation

Location: `src/app/api/lib/sieve/`

- `config.ts` - Sieve configurations for each entity
- `parser.ts` - Query string parsing
- `firestore.ts` - Firestore query execution
- `operators.ts` - Filter operators
- `types.ts` - Type definitions

Middleware: `src/app/api/lib/sieve-middleware.ts`

### API Routes NOT Using Sieve

| Route             | Current Implementation | Priority |
| ----------------- | ---------------------- | -------- |
| `/api/products`   | Custom pagination      | HIGH     |
| `/api/auctions`   | Custom pagination      | HIGH     |
| `/api/orders`     | Custom pagination      | HIGH     |
| `/api/shops`      | Custom pagination      | HIGH     |
| `/api/categories` | Custom pagination      | MEDIUM   |
| `/api/reviews`    | Custom pagination      | MEDIUM   |
| `/api/users`      | Custom pagination      | MEDIUM   |
| `/api/tickets`    | Custom pagination      | LOW      |
| `/api/coupons`    | Custom pagination      | LOW      |
| `/api/payments`   | Custom pagination      | LOW      |
| `/api/payouts`    | Custom pagination      | LOW      |

### Homepage Sections (Should Use Sieve)

| Component                       | Current Implementation | Should Use                                        |
| ------------------------------- | ---------------------- | ------------------------------------------------- |
| `LatestProductsSection.tsx`     | Direct API call        | Sieve with `sorts=-createdAt`                     |
| `HotAuctionsSection.tsx`        | Direct API call        | Sieve with `filters=status==live&sorts=-bidCount` |
| `FeaturedProductsSection.tsx`   | Direct API call        | Sieve with `filters=featured==true`               |
| `FeaturedAuctionsSection.tsx`   | Direct API call        | Sieve with `filters=featured==true`               |
| `FeaturedCategoriesSection.tsx` | Direct API call        | Sieve                                             |
| `FeaturedShopsSection.tsx`      | Direct API call        | Sieve with `filters=verified==true`               |
| `RecentReviewsSection.tsx`      | Direct API call        | Sieve with `sorts=-createdAt`                     |

### Migration Example

```typescript
// BEFORE: Custom implementation
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  // ... custom query logic
}

// AFTER: Using Sieve middleware
import { withSieve } from "@/app/api/lib/sieve-middleware";
import { productsSieveConfig } from "@/app/api/lib/sieve/config";

export const GET = withSieve(productsSieveConfig, {
  collection: "products",
  mandatoryFilters: [sieveFilters.published()],
  transform: transformProductToFrontend,
});
```

---

## Task 6: Wizard Navigation Issues

**Priority**: HIGH
**Effort**: 4-6 hours
**Goal**: Allow navigation to any step + always visible submit button

### Current Issues

1. **WizardSteps** component has `onStepClick` but it's optional
2. **WizardActionBar** doesn't have step navigation
3. Submit button only visible at the bottom, not always accessible
4. Validate button separate from submit flow

### Wizard Files to Fix

| Wizard          | Location                                   | Issues             |
| --------------- | ------------------------------------------ | ------------------ |
| Category Wizard | `src/app/admin/categories/create/page.tsx` | No step navigation |
| Coupon Wizard   | `src/components/seller/CouponForm.tsx`     | No step navigation |
| Product Wizard  | `src/app/seller/products/create/page.tsx`  | Limited navigation |
| Auction Wizard  | `src/app/seller/auctions/create/page.tsx`  | Limited navigation |
| Shop Wizard     | `src/app/seller/my-shops/create/page.tsx`  | Limited navigation |
| Blog Wizard     | `src/app/admin/blog/create/page.tsx`       | No step navigation |

### Required Changes

1. **WizardSteps**: Make `onStepClick` required for all wizards
2. **WizardActionBar**:
   - Add step navigation (prev/next)
   - Make submit always visible
   - Show validation status per step
3. **All Wizards**: Enable clicking any step to navigate

### Proposed WizardActionBar Enhancement

```tsx
interface WizardActionBarProps {
  // Existing props...

  // New navigation props
  currentStep: number;
  totalSteps: number;
  onPreviousStep?: () => void;
  onNextStep?: () => void;
  canNavigate?: boolean; // Enable/disable step clicking
}
```

---

## Task 7: Products/Auctions Missing Category & Shop Display

**Priority**: MEDIUM
**Effort**: 4-6 hours
**Goal**: Display category and shop info on products/auctions

### Required Changes

1. **Product Detail Page** (`src/app/products/[slug]/page.tsx`)
   - Show category breadcrumb
   - Show shop info with link
   - Show related products from same category

2. **Auction Detail Page** (`src/app/auctions/[slug]/page.tsx`)
   - Show category breadcrumb
   - Show shop info with link
   - Show similar auctions

3. **Product/Auction Cards**
   - Show category tag
   - Show shop name

4. **Create/Edit Forms**
   - Shop selector (auto-select if only one shop)
   - Category selector with breadcrumb preview

### Data Requirements

Products and Auctions should include:

```typescript
interface ProductWithRelations {
  // Existing fields...
  category: {
    id: string;
    name: string;
    slug: string;
    breadcrumb: string[]; // ["Electronics", "Phones", "Smartphones"]
  };
  shop: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    verified: boolean;
  };
}
```

---

## Task 8: API Debouncing Issues

**Priority**: HIGH
**Effort**: 4-6 hours
**Goal**: Prevent API spam on errors and rapid requests

### Common Anti-patterns Found

1. **Search inputs** - No debounce on keystroke
2. **Filter changes** - Immediate API calls
3. **Error retries** - Infinite retry loops
4. **useEffect dependencies** - Over-fetching

### Files to Audit

| Pattern           | Files to Check                             |
| ----------------- | ------------------------------------------ |
| Search inputs     | `SearchBar.tsx`, `SearchableDropdown.tsx`  |
| Autocomplete      | `CategorySelector.tsx`, `ShopSelector.tsx` |
| Infinite scroll   | Product/Auction list pages                 |
| Real-time updates | Auction bid components                     |
| Form auto-save    | Wizard forms                               |

### Required Fixes

1. **Add debounce to search inputs** (300-500ms)
2. **Add retry limits** (max 3 retries)
3. **Add exponential backoff** for failed requests
4. **Use AbortController** to cancel pending requests
5. **Cache responses** where appropriate

### Debounce Hook Already Exists

```typescript
// src/hooks/useDebounce.ts - USE THIS
import { useDebounce } from "@/hooks/useDebounce";

const debouncedSearchTerm = useDebounce(searchTerm, 300);
```

---

## Task 9: Performance & Cost Optimization

**Priority**: MEDIUM
**Effort**: 6-10 hours
**Goal**: Reduce API calls, memory usage, and improve performance

### Optimization Opportunities

#### 1. API Call Reduction

| Issue                       | Solution                            | Impact |
| --------------------------- | ----------------------------------- | ------ |
| Multiple header data calls  | Single `/api/header-stats` endpoint | HIGH   |
| Separate cart count call    | Include in header stats             | HIGH   |
| Separate notification count | Include in header stats             | HIGH   |
| Re-fetching on every page   | Cache in context/SWR                | HIGH   |

#### 2. Memory Optimization

| Issue                      | Solution                             | Impact |
| -------------------------- | ------------------------------------ | ------ |
| Large image loads          | Use Next.js Image with proper sizing | MEDIUM |
| All categories loaded      | Virtual scrolling for large lists    | MEDIUM |
| Full product data in lists | Projection queries (select fields)   | HIGH   |

#### 3. Bundle Size

| Issue               | Solution                    | Impact |
| ------------------- | --------------------------- | ------ |
| Large icon imports  | Tree-shaking lucide-react   | MEDIUM |
| Full lodash imports | Import individual functions | LOW    |
| Unused components   | Code splitting              | MEDIUM |

#### 4. Caching Strategy

```typescript
// Implement SWR or React Query for data fetching
import useSWR from "swr";

const { data, error, isLoading } = useSWR("/api/products", fetcher, {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 60000, // 1 minute
});
```

---

## Task 10: Category Graph View & Table Config

**Priority**: MEDIUM
**Effort**: 6-8 hours
**Goal**: Add hierarchical graph view and improve table displays

### Category Graph View

Create a top-down tree visualization showing:

- Category hierarchy
- Product count per category
- Auction count per category
- Expandable/collapsible nodes

```
Electronics (150 products, 45 auctions)
├── Phones (80 products, 20 auctions)
│   ├── Smartphones (60 products, 15 auctions)
│   └── Feature Phones (20 products, 5 auctions)
└── Laptops (70 products, 25 auctions)
```

### Library Suggestion

- `react-d3-tree` or `@visx/hierarchy` for tree visualization
- Responsive design for mobile

### Table Configuration Improvements

| Table      | Current Issues   | Fixes Needed                                     |
| ---------- | ---------------- | ------------------------------------------------ |
| Categories | Shows all fields | Show: Name, Parent, Products, Active             |
| Products   | Too many columns | Show: Image, Name, Price, Stock, Status          |
| Auctions   | Missing key info | Show: Image, Title, Current Bid, Time Left, Bids |
| Orders     | Too verbose      | Show: Order #, Customer, Total, Status, Date     |
| Users      | Too many fields  | Show: Name, Email, Role, Status, Created         |

### Inline Form Improvements

| Form                  | Current Issues      | Fixes Needed                      |
| --------------------- | ------------------- | --------------------------------- |
| Quick Create Product  | Too many fields     | Name, Price, Category, Stock only |
| Quick Create Category | All fields shown    | Name, Parent, Active only         |
| Quick Edit Row        | All fields editable | Status, Featured only             |

---

## Task 11: Mobile & Dark Mode Support

**Priority**: HIGH
**Effort**: 8-12 hours
**Goal**: Ensure full mobile responsiveness and dark mode support

### Components Missing Dark Mode

Audit all components for:

```tsx
// Required pattern
className = "bg-white dark:bg-gray-800 text-gray-900 dark:text-white";
```

### Mobile Responsiveness Issues

| Component      | Issue                | Fix                            |
| -------------- | -------------------- | ------------------------------ |
| DataTable      | Not responsive       | Use MobileDataTable on mobile  |
| Admin sidebar  | Fixed width          | Collapsible on mobile          |
| Wizard forms   | Form too wide        | Full-width on mobile           |
| Filters        | Takes too much space | Collapsible filter panel       |
| Action buttons | Too small on mobile  | Min-height 44px (touch target) |

### Existing Mobile Components to Use

- `MobileDataTable` - Mobile-friendly table
- `MobileSwipeActions` - Swipe for actions
- `MobileSidebar` - Collapsible sidebar
- `BottomNav` - Mobile navigation
- `MobileNavRow` - Mobile nav row

### Testing Checklist

- [ ] Test all admin pages on mobile
- [ ] Test all seller pages on mobile
- [ ] Test all user pages on mobile
- [ ] Test public pages on mobile
- [ ] Test dark mode on all pages
- [ ] Verify touch targets are 44px minimum

---

## Implementation Priority & Roadmap

### Sprint 1 (Week 1-2) - Critical Fixes

- [ ] Task 2: Fix COLLECTIONS usage in API routes (8h)
- [ ] Task 6: Fix wizard navigation (4h)
- [ ] Task 8: Add debouncing to API calls (4h)

### Sprint 2 (Week 3-4) - Performance

- [ ] Task 5: Implement Sieve pagination (8h)
- [ ] Task 9: Performance optimizations (6h)
- [ ] Task 4: Value wrapper migrations (6h)

### Sprint 3 (Week 5-6) - Refactoring

- [ ] Task 1: Split large files - Phase 1 (12h)
- [ ] Task 3: Create missing constants (4h)

### Sprint 4 (Week 7-8) - Features & Polish

- [ ] Task 7: Category/Shop display (4h)
- [ ] Task 10: Category graph view (6h)
- [ ] Task 11: Mobile/Dark mode fixes (8h)

### Sprint 5 (Week 9-10) - Completion

- [ ] Task 1: Split large files - Phase 2 (12h)
- [ ] Final testing and bug fixes (8h)

---

## Summary Statistics

| Task                          | Priority | Effort (hours) | Files Affected | Notes                                                 |
| ----------------------------- | -------- | -------------- | -------------- | ----------------------------------------------------- |
| Task 1: Large Files           | HIGH     | 12-18          | 40+ files      | **Reduced** - shared components eliminate duplication |
| Task 2: Constants Usage       | HIGH     | 8-12           | 30+ files      |                                                       |
| Task 3: New Constants         | MEDIUM   | 4-6            | 10+ files      |                                                       |
| Task 4: HTML Wrappers         | HIGH     | 8-12           | 50+ files      |                                                       |
| Task 5: Sieve Processing      | HIGH     | 6-10           | 15+ files      |                                                       |
| Task 6: Wizard Navigation     | HIGH     | 4-6            | 6 files        |                                                       |
| Task 7: Category/Shop Display | MEDIUM   | 4-6            | 10+ files      |                                                       |
| Task 8: API Debouncing        | HIGH     | 4-6            | 20+ files      |                                                       |
| Task 9: Performance           | MEDIUM   | 6-10           | 30+ files      |                                                       |
| Task 10: Graph View           | MEDIUM   | 6-8            | 5+ files       |                                                       |
| Task 11: Mobile/Dark Mode     | HIGH     | 8-12           | 50+ files      |                                                       |
| Task 12: Code Quality         | MEDIUM   | 4-6            | 15+ files      | Console logs, type safety                             |
| Task 13: Accessibility        | MEDIUM   | 4-6            | 30+ files      | ARIA, keyboard nav, alt text                          |
| Task 14: Test Coverage        | LOW      | 8-12           | 10+ files      | New components, theming tests                         |
| **TOTAL**                     | -        | **86-130**     | **300+ files** |                                                       |

### Effort Comparison: With vs Without Reusable Components

| Approach                           | Effort        | Savings |
| ---------------------------------- | ------------- | ------- |
| **Without Reusable Components**    | 160-270 hours | -       |
| **With Reusable Components First** | 67-90 hours   | 60-65%  |

---

## 🎯 Recommended Implementation Order

### Phase 1: Create Core Reusable Components (20-25 hours)

| Component            | Hours | Impact                           | Lines Saved |
| -------------------- | ----- | -------------------------------- | ----------- |
| `AdminListPage`      | 8-12  | Fixes 12 admin/seller list pages | ~6,800      |
| `PolicyPage`         | 2-3   | Fixes 5 legal pages              | ~1,800      |
| `StatsCardGrid`      | 2-3   | Reduces 8 dashboard pages        | ~1,050      |
| `PaginationControls` | 1-2   | Used in 15+ pages                | ~520        |
| `PeriodSelector`     | 1-2   | Used in 5 analytics pages        | ~190        |
| `SettingsSection`    | 3-4   | Reduces 6 settings pages         | ~1,400      |
| `TransactionList`    | 2-3   | Reduces 4 transaction pages      | ~800        |
| **TOTAL**            | 20-25 | **60 files**                     | **~12,560** |

### Phase 2: Migrate to Reusable Components (15-20 hours)

| Task                                        | Files | Hours |
| ------------------------------------------- | ----- | ----- |
| Migrate admin list pages to `AdminListPage` | 12    | 6-8   |
| Migrate legal pages to `PolicyPage`         | 5     | 2-3   |
| Migrate dashboards to use `StatsCardGrid`   | 8     | 3-4   |
| Migrate settings pages to `SettingsSection` | 6     | 4-5   |

### Phase 3: Remaining Unique Splits (20-30 hours)

| File                                | Hours | Notes                         |
| ----------------------------------- | ----- | ----------------------------- |
| `admin/demo/page.tsx`               | 4-6   | Unique - needs custom split   |
| `admin/homepage/page.tsx`           | 3-4   | Unique CMS functionality      |
| `components/SearchableDropdown.tsx` | 3-4   | Extract hook + sub-components |
| `components/cards/AuctionCard.tsx`  | 2-3   | Extract badges, timer         |
| `components/media/ImageEditor.tsx`  | 3-4   | Extract tool components       |
| `user/messages/page.tsx`            | 2-3   | Chat-specific components      |
| `MainNavBar.tsx`                    | 2-3   | Extract menu components       |

### Phase 4: Constants & Formatting Migration (12-15 hours)

| Task                         | Files | Hours |
| ---------------------------- | ----- | ----- |
| Database constants migration | 22    | 6-8   |
| Date formatting migration    | 5     | 1     |
| Add missing COLLECTIONS      | 4     | 1     |
| Sieve API route migration    | 7     | 4-5   |

### Implementation Timeline

```
Week 1: AdminListPage + PolicyPage components
        → Instantly fixes 17 large files

Week 2: StatsCardGrid + PaginationControls + SettingsSection
        → Fixes 20+ more files

Week 3: Database constants migration + remaining unique splits
        → Prevents data issues, clean up leftovers

Week 4: Sieve integration + polish
        → Better pagination, homepage optimization
```

---

## Quick Wins (Can be done in <2 hours each)

1. ✅ Replace hardcoded collection names in 3 identified files
2. ✅ Add `QUERY_LIMITS.DEFAULT` to pagination defaults
3. ✅ Enable `onStepClick` in all wizards
4. ✅ Add debounce to SearchBar components
5. ✅ Create `/api/header-stats` for combined header data
6. ✅ Add retry limits to error handling
7. ✅ **Enhanced RichTextEditor with images, tables, and advanced formatting**

---

## Recent Improvements

### RichTextEditor Enhancements (December 2025)

The `RichTextEditor` component (`src/components/common/RichTextEditor.tsx`) has been significantly enhanced with:

**New Features:**

- 📷 **Image Upload** - Upload from device or paste URL, with drag & drop support
- 📊 **Tables** - Visual table picker with customizable rows/columns
- 🎨 **Text Colors** - 9 color options for text formatting
- 🖍️ **Highlighting** - 7 highlight color options
- 📐 **Text Alignment** - Left, center, right, and justify
- 💻 **Code Blocks** - Inline code and code block support
- ➖ **Horizontal Rules** - Insert dividers
- 📝 **Subscript/Superscript** - For scientific notation
- 🔗 **Enhanced Links** - Modal with URL and text customization
- ⌨️ **Keyboard Shortcuts** - Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+K

**New Props:**

```typescript
imageUploadContext?: "product" | "shop" | "auction" | "category" | "blog";
imageUploadContextId?: string;
onImageUpload?: (url: string) => void;
```

**Exported Tool Presets:**

- `DEFAULT_TOOLS` - All available tools
- `BASIC_TOOLS` - Simple formatting only (bold, italic, underline, lists, link)

**Usage Example:**

```tsx
import RichTextEditor, { BASIC_TOOLS } from "@/components/common/RichTextEditor";

// Full-featured editor
<RichTextEditor
  value={content}
  onChange={setContent}
  imageUploadContext="blog"
  imageUploadContextId={blogId}
/>

// Simple editor
<RichTextEditor
  value={content}
  onChange={setContent}
  tools={BASIC_TOOLS}
/>
```

---

## Task 12: Code Quality & Type Safety Issues

**Priority**: MEDIUM
**Effort**: 4-6 hours
**Goal**: Clean up code quality issues found during audit

### Console Statements to Remove/Replace

Found 20+ console statements in production code that should use proper logging:

| File                                     | Issue               | Fix                          |
| ---------------------------------------- | ------------------- | ---------------------------- |
| `src/hooks/useSlugValidation.ts:117`     | `console.error`     | Use error logger             |
| `src/lib/validations/helpers.ts:37,65`   | `console.error`     | Use error logger             |
| `src/services/shops.service.ts:296`      | `console.error`     | Use error logger             |
| `src/services/riplimit.service.ts:60`    | `console.error`     | Use error logger             |
| `src/lib/payment-logos.ts:51`            | `console.warn`      | Use warning logger or remove |
| `src/hooks/useSafeLoad.ts:57,63,72`      | `console.log/error` | Remove debug logs            |
| `src/services/location.service.ts:141`   | `console.error`     | Use error logger             |
| `src/hooks/useNavigationGuard.ts:91,139` | `console.error`     | Use error logger             |

**Solution**: Use `src/lib/firebase-error-logger.ts` for proper error logging.

### Type Safety Issues - `as unknown as` Casts

Found 16 unsafe type casts that should be properly typed:

| File                                             | Issue                                  |
| ------------------------------------------------ | -------------------------------------- |
| `src/components/layout/SearchBar.tsx:126,149`    | Event type casting                     |
| `src/hooks/useLoadingState.ts:184,188`           | Generic type casting                   |
| `src/app/api/lib/riplimit/*.ts`                  | Timestamp type casting (8 occurrences) |
| `src/app/api/lib/sieve/firestore.ts:134,140,174` | Record type casting                    |

**Solution**: Create proper type definitions or use type guards.

### `any` Types in Test Files

Found 20+ usages of `any` type in test files - acceptable but should use proper types where possible.

### Missing Error Boundaries

Components that could benefit from error boundaries:

- `src/components/cards/AuctionCard.tsx` - Complex with timers
- `src/components/cards/ProductCard.tsx` - Image loading
- `src/app/checkout/page.tsx` - Payment flow
- `src/app/admin/demo/page.tsx` - Demo data generation

---

## Task 13: Accessibility Improvements

**Priority**: MEDIUM  
**Effort**: 4-6 hours
**Goal**: Improve accessibility across the application

### Missing Alt Text

| File                                           | Issue                           |
| ---------------------------------------------- | ------------------------------- |
| `src/components/common/OptimizedImage.tsx:121` | `<img>` without alt in fallback |

### Missing ARIA Labels

Audit needed for:

- Modal dialogs - ensure proper `aria-modal` and `aria-labelledby`
- Dropdown menus - ensure proper `aria-expanded` and `aria-haspopup`
- Loading states - ensure `aria-busy` is used
- Form errors - ensure `aria-invalid` and `aria-describedby`

### Keyboard Navigation

Verify all interactive elements are keyboard accessible:

- [ ] All buttons focusable
- [ ] All links focusable
- [ ] Modal traps focus
- [ ] Escape closes modals
- [ ] Tab order is logical

---

## Task 14: Test Coverage Gaps

**Priority**: LOW
**Effort**: 8-12 hours
**Goal**: Improve test coverage for critical paths

### Theming Tests TODO

Found `it.todo()` tests in `TDD/resources/theming/TEST-CASES.md`:

- Color tokens in `:root`
- Dark theme overrides
- Spacing, typography, shadow, border-radius tokens
- Tailwind class definitions

### Components Needing Tests

| Component                  | Reason                    |
| -------------------------- | ------------------------- |
| `AdminResourcePage` (new)  | Will be used by 12+ pages |
| `SellerResourcePage` (new) | Will be used by 6+ pages  |
| `SearchableDropdown.tsx`   | Complex state management  |
| `UnifiedFilterSidebar.tsx` | Complex filter logic      |
| `ImageEditor.tsx`          | Image manipulation logic  |

---

## Task 15: User Verification System ⭐ NEW

**Priority**: CRITICAL (P1)
**Effort**: 20-30 hours
**Goal**: Require email & phone verification before purchases/bidding

> **Full Details**: See [EVENTS-AND-VERIFICATION-CHECKLIST.md](./EVENTS-AND-VERIFICATION-CHECKLIST.md)

### Summary

Users MUST verify their email and phone number before:

- Placing orders (checkout)
- Bidding on auctions
- Participating in events
- Uploading profile images (optional)

### Key Components to Create

| Component                                        | Purpose                       |
| ------------------------------------------------ | ----------------------------- |
| `src/services/otp.service.ts`                    | OTP generation & verification |
| `src/services/sms.service.ts`                    | SMS sending via MSG91/Twilio  |
| `src/components/auth/EmailVerificationModal.tsx` | Email OTP flow                |
| `src/components/auth/PhoneVerificationModal.tsx` | Phone OTP flow                |
| `src/components/auth/OTPInput.tsx`               | 6-digit OTP input             |
| `src/components/auth/VerificationGate.tsx`       | Block unverified users        |
| `src/hooks/useVerificationCheck.ts`              | Check verification status     |

### API Endpoints

| Endpoint                             | Purpose          |
| ------------------------------------ | ---------------- |
| `POST /api/auth/verify-email/send`   | Send email OTP   |
| `POST /api/auth/verify-email/verify` | Verify email OTP |
| `POST /api/auth/verify-phone/send`   | Send SMS OTP     |
| `POST /api/auth/verify-phone/verify` | Verify phone OTP |

### Database Updates

```typescript
// Add to COLLECTIONS constant
OTP_VERIFICATIONS: "otp_verifications",

// User document additions
emailVerifiedAt: Timestamp | null;
phoneVerifiedAt: Timestamp | null;
```

### Checklist

- [ ] Email OTP generation & storage
- [ ] Email OTP verification API
- [ ] Phone OTP via SMS provider
- [ ] Phone OTP verification API
- [ ] Verification UI modals
- [ ] Verification enforcement in checkout
- [ ] Verification enforcement in bidding
- [ ] Profile verification badges

---

## Task 16: IP Tracking & Security ⭐ NEW

**Priority**: HIGH (P2)
**Effort**: 6-8 hours
**Goal**: Track user IPs for security and fraud prevention

> **Full Details**: See [EVENTS-AND-VERIFICATION-CHECKLIST.md](./EVENTS-AND-VERIFICATION-CHECKLIST.md)

### Summary

Track IP addresses for all critical user actions to:

- Prevent fraud (multiple accounts)
- Detect suspicious activity
- Comply with legal requirements
- Enable rate limiting

### Key Components

| Component                              | Purpose                  |
| -------------------------------------- | ------------------------ |
| `src/app/api/middleware/ip-tracker.ts` | Extract IP from requests |
| `src/services/ip-tracker.service.ts`   | Log activities with IP   |

### Actions to Track

- Login / Registration
- Email/Phone verification
- Placing orders
- Placing bids
- Event registration
- Event voting

### Database Schema

```typescript
// Add to COLLECTIONS
USER_ACTIVITIES: "user_activities",

interface UserActivity {
  id: string;
  userId: string;
  action: string;
  ipAddress: string;
  userAgent: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  createdAt: Timestamp;
}
```

### Checklist

- [ ] IP extraction middleware
- [ ] User activity logging service
- [ ] Log login/registration
- [ ] Log orders and bids
- [ ] Log verification attempts
- [ ] Rate limiting by IP
- [ ] Admin activity report

---

## Task 17: Events Management System ⭐ NEW

**Priority**: MEDIUM (P3)
**Effort**: 24-32 hours
**Goal**: Full event management with giveaways, contests, polls, tournaments

> **Full Details**: See [EVENTS-AND-VERIFICATION-CHECKLIST.md](./EVENTS-AND-VERIFICATION-CHECKLIST.md)

### Summary

Create a comprehensive events system supporting:

- **Giveaways** - Random winner selection
- **Draws** - Ticket-based raffles
- **Contests** - Submissions with voting
- **Polls** - User voting on options
- **Tournaments** - Multi-stage competitions

### Business Rules

- Maximum 2 live events at a time
- Requires user verification to participate
- IP tracking for fraud prevention
- Google Forms integration for external entries
- Rich text editor for event descriptions

### Key Pages

| Page                      | Purpose             |
| ------------------------- | ------------------- |
| `/admin/events`           | Admin event list    |
| `/admin/events/create`    | Create event wizard |
| `/admin/events/[id]`      | Edit event          |
| `/events`                 | Public events list  |
| `/events/[slug]`          | Event details       |
| `/events/[slug]/register` | Event registration  |
| `/events/[slug]/vote`     | Voting page         |
| `/events/[slug]/results`  | Results display     |

### Key Components

| Component            | Purpose            |
| -------------------- | ------------------ |
| `EventCard.tsx`      | Event listing card |
| `EventBanner.tsx`    | Hero banner        |
| `EventCountdown.tsx` | Timer component    |
| `PollVoting.tsx`     | Poll voting UI     |
| `WinnersSection.tsx` | Display winners    |
| `PrizeShowcase.tsx`  | Show prizes        |

### Database Collections

```typescript
// Add to COLLECTIONS
EVENTS: "events",
EVENT_REGISTRATIONS: "event_registrations",
EVENT_VOTES: "event_votes",
EVENT_OPTIONS: "event_options",
```

### Checklist

- [ ] Database schema & types
- [ ] Event CRUD APIs (admin)
- [ ] Event list/detail APIs (public)
- [ ] Registration API with verification check
- [ ] Voting API with IP tracking
- [ ] Admin event management pages
- [ ] Public event pages
- [ ] Event registration flow
- [ ] Voting UI for polls/contests
- [ ] Winners display section
- [ ] Google Forms integration
- [ ] Results import from Excel/CSV
- [ ] 2 live events limit enforcement

---

## Task 18: Navigation, Filters & Dark Mode Consistency (NEW - HIGH PRIORITY)

### Problem

Multiple inconsistencies across admin, seller, user, and public pages:

1. **Tabbed Layout Missing**: Only 3 admin sections use TabNav (blog, settings, auctions) despite tabs.ts defining more
2. **UnifiedFilterSidebar Underutilized**: Many list pages use custom inline filters instead
3. **Dark Mode Gaps**: 20+ files have `bg-white` without `dark:bg-*` variant
4. **Navigation Links Broken**: navigation.ts has outdated/non-existent routes
5. **Sort/Dropdown Bars Inconsistent**: Different patterns across pages

### Pages Missing Tabbed Layout (Should Match Blog Pattern)

#### Admin Content Management

| Page                        | Status          | Action Needed                  |
| --------------------------- | --------------- | ------------------------------ |
| `/admin/homepage`           | ❌ No TabNav    | Add layout.tsx with TabNav     |
| `/admin/hero-slides`        | ❌ No TabNav    | Merge under Content Management |
| `/admin/featured-sections`  | ❌ No TabNav    | Merge under Content Management |
| `/admin/featured-products`  | ❌ No TabNav    | Merge under Content Management |
| `/admin/featured-auctions`  | ❌ No TabNav    | Merge under Content Management |
| `/admin/featured-countdown` | ❌ No TabNav    | Merge under Content Management |
| `/admin/categories`         | ❌ No TabNav    | Add layout.tsx with TabNav     |
| `/admin/component-demo`     | ❌ No dark mode | Add dark mode styles           |

#### Admin Marketplace

| Page              | TabNav | Filter           | Dark Mode |
| ----------------- | ------ | ---------------- | --------- |
| `/admin/products` | ❌     | ✅ UnifiedFilter | ⚠️ Check  |
| `/admin/auctions` | ✅     | ✅ UnifiedFilter | ⚠️ Check  |
| `/admin/shops`    | ❌     | ✅ UnifiedFilter | ⚠️ Check  |
| `/admin/users`    | ❌     | ❌ Custom inline | ⚠️ Check  |

#### Admin Transactions

| Page              | TabNav | Filter           | Dark Mode |
| ----------------- | ------ | ---------------- | --------- |
| `/admin/orders`   | ❌     | ❌ Custom inline | ❌        |
| `/admin/payments` | ❌     | ❌ Custom inline | ⚠️ Check  |
| `/admin/payouts`  | ❌     | ✅ UnifiedFilter | ⚠️ Check  |
| `/admin/coupons`  | ❌     | ✅ UnifiedFilter | ⚠️ Check  |
| `/admin/returns`  | ❌     | ✅ UnifiedFilter | ⚠️ Check  |

#### Admin Support

| Page                     | TabNav | Filter           | Dark Mode |
| ------------------------ | ------ | ---------------- | --------- |
| `/admin/support-tickets` | ❌     | ✅ UnifiedFilter | ⚠️ Check  |
| `/admin/reviews`         | ❌     | ✅ UnifiedFilter | ⚠️ Check  |

### Seller Pages Needing Review

| Page                | Filter              | Dark Mode |
| ------------------- | ------------------- | --------- |
| `/seller/products`  | ✅ UnifiedFilter    | ⚠️ Check  |
| `/seller/orders`    | ✅ UnifiedFilter    | ⚠️ Check  |
| `/seller/returns`   | ✅ UnifiedFilter    | ⚠️ Check  |
| `/seller/analytics` | ❌ No filter needed | ⚠️ Check  |
| `/seller/payouts`   | ⚠️ Needs review     | ⚠️ Check  |

### User Pages Needing Review

| Page                  | Filter           | Dark Mode   |
| --------------------- | ---------------- | ----------- |
| `/user/orders`        | ❌ Custom inline | ✅ Fixed    |
| `/user/favorites`     | ❌ None          | ✅ Fixed    |
| `/user/reviews`       | ✅ Has filters   | ✅ Has dark |
| `/user/addresses`     | ❌ None          | ✅ Has dark |
| `/user/settings`      | ✅ TabNav exists | ⚠️ Check    |
| `/user/won-auctions`  | ❌ None          | ❌ Missing  |
| `/user/watchlist`     | ❌ None          | ❌ Missing  |
| `/user/tickets`       | ❌ None          | ❌ Missing  |
| `/user/tickets/[id]`  | ❌ None          | ❌ Missing  |
| `/user/bids`          | ❌ None          | ⚠️ Check    |
| `/user/history`       | ❌ None          | ⚠️ Check    |
| `/user/messages`      | ❌ None          | ⚠️ Check    |
| `/user/notifications` | ❌ None          | ⚠️ Check    |
| `/user/returns`       | ❌ None          | ⚠️ Check    |

### Seller Pages Dark Mode Status

| Page                      | Dark Mode  |
| ------------------------- | ---------- |
| `/seller/messages`        | ❌ Missing |
| `/seller/support-tickets` | ❌ Missing |
| `/seller/products`        | ⚠️ Check   |
| `/seller/orders`          | ⚠️ Check   |
| `/seller/returns`         | ⚠️ Check   |
| `/seller/analytics`       | ⚠️ Check   |
| `/seller/payouts`         | ⚠️ Check   |

### Admin Pages Dark Mode Status

| Page                          | Dark Mode  |
| ----------------------------- | ---------- |
| `/admin/users`                | ❌ Missing |
| `/admin/tickets`              | ❌ Missing |
| `/admin/tickets/[id]`         | ❌ Missing |
| `/admin/support-tickets/[id]` | ❌ Missing |
| `/admin/orders/[id]`          | ❌ Missing |
| `/admin/component-demo`       | ❌ Missing |
| `/admin/page.tsx` (dashboard) | ⚠️ Check   |

### Public Pages Needing Review

| Page        | Filter            | Dark Mode |
| ----------- | ----------------- | --------- |
| `/products` | ✅ UnifiedFilter  | ⚠️ Check  |
| `/auctions` | ⚠️ Custom sidebar | ⚠️ Check  |
| `/shops`    | ✅ UnifiedFilter  | ⚠️ Check  |
| `/search`   | ⚠️ Custom sidebar | ⚠️ Check  |
| `/compare`  | ❌ None           | ⚠️ Check  |

### Dark Mode Issues Found (50+ instances)

#### User Pages (Fixed)

- ✅ `/user/orders/page.tsx` - Fixed
- ✅ `/user/favorites/page.tsx` - Fixed

#### User Pages (Needs Fix)

```
src/app/user/won-auctions/page.tsx (10+ instances)
src/app/user/watchlist/page.tsx
src/app/user/tickets/page.tsx
src/app/user/tickets/[id]/page.tsx
```

#### Seller Pages (Needs Fix)

```
src/app/seller/messages/page.tsx (6+ instances)
src/app/seller/support-tickets/page.tsx (12+ instances)
```

#### Admin Pages (Needs Fix)

```
src/app/admin/users/page.tsx (10+ instances)
src/app/admin/tickets/page.tsx
src/app/admin/tickets/[id]/page.tsx
src/app/admin/support-tickets/[id]/page.tsx
src/app/admin/orders/[id]/page.tsx
src/app/admin/component-demo/page.tsx
```

#### Components (Needs Fix)

```
src/components/common/LoadingStates.tsx
src/components/common/PageHeader.tsx
src/components/forms/FormField.tsx
```

### Broken Navigation Links

From `navigation.ts`:

```typescript
// USER_MENU_ITEMS - These routes may not exist or are outdated
{
  href: "/user/payments";
} // ❓ Verify exists
{
  href: "/user/notifications";
} // ❓ Verify exists
{
  href: "/user/security";
} // ❓ Verify exists

// SELLER_MENU_ITEMS - These routes may not exist
{
  href: "/seller/promotions";
} // ❓ Verify exists
{
  href: "/seller/customers";
} // ❓ Verify exists

// ADMIN_MENU_ITEMS - Verified working
// Most admin routes exist but some submenu items may be outdated
```

### Implementation Checklist

#### Phase 1: Admin Content Management Consolidation

- [ ] Create `/admin/content` with TabNav layout
- [ ] Migrate hero-slides, featured-sections, featured-products under tabs
- [ ] Update navigation.ts to point to new routes
- [ ] Add dark mode to all content management pages

#### Phase 2: Admin Marketplace Consistency

- [ ] Add TabNav to products, shops
- [ ] Replace custom inline filters with UnifiedFilterSidebar
- [ ] Fix dark mode gaps

#### Phase 3: Admin Transactions Consistency

- [ ] Add TabNav or consistent layout to orders, payments, payouts
- [ ] Replace custom filters with UnifiedFilterSidebar
- [ ] Fix dark mode (especially orders/[id])

#### Phase 4: Seller Pages

- [ ] Audit all seller pages for filter consistency
- [ ] Fix dark mode gaps
- [ ] Ensure all use UnifiedFilterSidebar where applicable

#### Phase 5: User Pages

- [ ] Audit all user pages for consistency
- [ ] Add filters where needed
- [ ] Fix dark mode gaps

#### Phase 6: Public Pages

- [ ] Audit products, auctions, shops, search
- [ ] Unify filter sidebar implementations
- [ ] Ensure dark mode works across all

#### Phase 7: Navigation Cleanup

- [ ] Audit all routes in navigation.ts
- [ ] Remove or fix broken links
- [ ] Update tabs.ts to match actual routes
- [ ] Test all navigation flows

### Key Components to Use

| Component              | Purpose                   | Location                                         |
| ---------------------- | ------------------------- | ------------------------------------------------ |
| `TabNav`               | Tabbed section navigation | `src/components/navigation/TabNav.tsx`           |
| `UnifiedFilterSidebar` | Consistent filter UI      | `src/components/common/UnifiedFilterSidebar.tsx` |
| `SortDropdown`         | Standard sort controls    | `src/components/common/SortDropdown.tsx`         |
| `Pagination`           | Standard pagination       | `src/components/common/Pagination.tsx`           |

### Reference Implementation

See `/admin/blog/layout.tsx` for proper TabNav implementation:

```tsx
// Example pattern to follow
import TabNav from "@/components/navigation/TabNav";
import { ADMIN_BLOG_TABS } from "@/constants/tabs";

export default function BlogLayout({ children }) {
  return (
    <div className="space-y-6">
      <TabNav tabs={ADMIN_BLOG_TABS} baseUrl="/admin/blog" />
      {children}
    </div>
  );
}
```

---

## Task 19: URL-Based Filtering, Sorting & Pagination (NEW - HIGH PRIORITY)

### Problem

Currently filters, sorts, searches, and pagination are handled inconsistently:

1. **Filters not in URL**: State is lost on page refresh/share
2. **Instant filter changes**: Should wait for "Apply" button (except sort/pagination)
3. **Pagination inconsistent**: Different styles across pages, no custom limit/page input
4. **Search bar issues**: Empty search allowed, content type dropdown broken
5. **Search page stuck on skeleton**: When visited without query

### Requirements

#### URL Parameter Pattern

All list pages MUST use URL search params for state:

```
/products?category=electronics&minPrice=100&maxPrice=500&sort=price_asc&page=2&limit=20
/auctions?status=active&sort=ending_soon&page=1&limit=12
/admin/orders?status=pending&dateFrom=2025-01-01&sort=created_desc&page=1
/search?q=laptop&type=products&sort=relevance&page=1&limit=24
```

#### Filter Behavior

| Action      | Trigger            | Updates URL |
| ----------- | ------------------ | ----------- |
| **Filters** | Click "Apply"      | Yes         |
| **Sort**    | Instant on change  | Yes         |
| **Page**    | Instant on change  | Yes         |
| **Limit**   | Instant on change  | Yes         |
| **Search**  | Click Search/Enter | Yes         |

#### Pagination Features

- Page size selector: 12, 24, 48, 96 items
- Page number input for jumping to specific page
- Previous/Next buttons
- First/Last page buttons
- Show current page and total pages
- Persist limit in URL

### Pages Requiring Updates

#### Public Pages

| Page                 | Filter | Sort | Pagination | URL Params |
| -------------------- | ------ | ---- | ---------- | ---------- |
| `/products`          | ⚠️     | ⚠️   | ⚠️         | ❌         |
| `/auctions`          | ⚠️     | ⚠️   | ⚠️         | ❌         |
| `/shops`             | ⚠️     | ⚠️   | ⚠️         | ❌         |
| `/search`            | ⚠️     | ⚠️   | ⚠️         | Partial    |
| `/categories/[slug]` | ⚠️     | ⚠️   | ⚠️         | ❌         |

#### Admin Pages

| Page                     | Filter | Sort | Pagination | URL Params |
| ------------------------ | ------ | ---- | ---------- | ---------- |
| `/admin/products`        | ⚠️     | ⚠️   | ⚠️         | ❌         |
| `/admin/auctions/*`      | ⚠️     | ⚠️   | ⚠️         | ❌         |
| `/admin/orders`          | ⚠️     | ⚠️   | ⚠️         | ❌         |
| `/admin/users`           | ⚠️     | ⚠️   | ⚠️         | ❌         |
| `/admin/shops`           | ⚠️     | ⚠️   | ⚠️         | ❌         |
| `/admin/payments`        | ⚠️     | ⚠️   | ⚠️         | ❌         |
| `/admin/payouts`         | ⚠️     | ⚠️   | ⚠️         | ❌         |
| `/admin/coupons`         | ⚠️     | ⚠️   | ⚠️         | ❌         |
| `/admin/returns`         | ⚠️     | ⚠️   | ⚠️         | ❌         |
| `/admin/reviews`         | ⚠️     | ⚠️   | ⚠️         | ❌         |
| `/admin/support-tickets` | ⚠️     | ⚠️   | ⚠️         | ❌         |
| `/admin/blog/posts`      | ⚠️     | ⚠️   | ⚠️         | ❌         |

#### Seller Pages

| Page               | Filter | Sort | Pagination | URL Params |
| ------------------ | ------ | ---- | ---------- | ---------- |
| `/seller/products` | ⚠️     | ⚠️   | ⚠️         | ❌         |
| `/seller/orders`   | ⚠️     | ⚠️   | ⚠️         | ❌         |
| `/seller/returns`  | ⚠️     | ⚠️   | ⚠️         | ❌         |

#### User Pages

| Page           | Filter | Sort | Pagination | URL Params |
| -------------- | ------ | ---- | ---------- | ---------- |
| `/user/orders` | ⚠️     | ⚠️   | ⚠️         | ❌         |

### Implementation Plan

#### Phase 1: Create Reusable Hooks & Components

```typescript
// src/hooks/useUrlFilters.ts
interface UseUrlFiltersOptions {
  defaultFilters: Record<string, any>;
  defaultSort: string;
  defaultPage: number;
  defaultLimit: number;
}

// Returns:
// - filters: current filter values from URL
// - pendingFilters: filters being edited (before Apply)
// - setFilter: update pending filter
// - applyFilters: push filters to URL
// - resetFilters: clear all filters
// - sort: current sort value
// - setSort: update sort (instant)
// - page: current page
// - setPage: update page (instant)
// - limit: current limit
// - setLimit: update limit (instant)
```

```typescript
// src/components/common/AdvancedPagination.tsx
interface AdvancedPaginationProps {
  currentPage: number;
  totalPages: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  limitOptions?: number[]; // Default: [12, 24, 48, 96]
  showPageInput?: boolean; // Default: true
}
```

#### Phase 2: Update UnifiedFilterSidebar

- Add "Apply Filters" button
- Add "Reset Filters" button
- Show pending changes indicator
- Integrate with useUrlFilters hook

#### Phase 3: Fix Search Functionality

- ✅ Prevent empty search submissions (DONE)
- ✅ Fix search page skeleton on empty query (DONE)
- [ ] Content type dropdown working
- [ ] Use URL params for search state
- [ ] Add sort options to search results
- [ ] Add pagination to search results

#### Phase 4: Update All List Pages

For each page:

1. Import and use `useUrlFilters` hook
2. Read initial state from URL params
3. Update API calls to use URL-based filters
4. Replace local pagination with `AdvancedPagination`
5. Add Apply/Reset buttons to filter sidebar

### Search Bar Issues Fixed

| Issue                         | Status                   |
| ----------------------------- | ------------------------ |
| Empty text search allowed     | ✅                       |
| Search page stuck on skeleton | ✅                       |
| Content type dropdown empty   | 🔄 Needs constants check |

### Checklist

- [x] Prevent empty text search
- [x] Fix search page empty query handling
- [ ] Create `useUrlFilters` hook
- [ ] Create `AdvancedPagination` component
- [ ] Update `UnifiedFilterSidebar` with Apply button
- [ ] Update all public list pages
- [ ] Update all admin list pages
- [ ] Update all seller list pages
- [ ] Update all user list pages
- [ ] Test URL sharing/bookmarking
- [ ] Test browser back/forward navigation

---

## Task 20: Firestore Indexes & Query Optimization (NEW)

### Problem

Several API queries fail due to missing composite indexes. Firestore requires composite indexes for queries that combine multiple filters or filters with orderBy clauses.

### Recently Added Indexes (Deployed Dec 3, 2025)

| Collection | Fields                                          | Purpose                      |
| ---------- | ----------------------------------------------- | ---------------------------- |
| products   | status + created_at + stock_count               | Products with inStock filter |
| products   | is_featured + status + created_at + stock_count | Featured products in stock   |
| products   | category_id + status + created_at               | Products by category         |

### Query Patterns That May Need Indexes

Review these API routes for missing index requirements:

#### Products API (`/api/products`)

- status + is_featured + stock_count + created_at
- shop_id + status + stock_count + created_at
- category_id + status + stock_count + price
- price range queries with sorting

#### Auctions API (`/api/auctions`)

- status + is_featured + end_time
- status + bid_count + created_at
- shop_id + status + end_time

#### Orders API (`/api/orders`)

- user_id + status + created_at
- shop_id + status + payment_status + created_at

### How to Add New Indexes

1. When you see `FAILED_PRECONDITION` error, click the provided link
2. Or manually add to `firestore.indexes.json`:

```json
{
  "collectionGroup": "products",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "created_at", "order": "DESCENDING" },
    { "fieldPath": "stock_count", "order": "DESCENDING" }
  ]
}
```

3. Deploy with: `firebase deploy --only firestore:indexes`

### Checklist

- [x] Add products status + created_at + stock_count index
- [x] Add products is_featured + status + created_at + stock_count index
- [x] Add products category_id + status + created_at index
- [x] Deploy indexes to Firebase
- [ ] Monitor for additional missing index errors
- [ ] Document all required indexes in README

---

## Task 21: Navigation Component Cleanup & Refactoring (NEW)

### Problem

The navigation system has evolved over time and now contains:

1. **"More" button** in admin/seller layouts that should be removed (mobile uses BottomNav)
2. **MobileSidebar** has full navigation but should only have dashboard links (admin/seller/user)
3. **BottomNav** needs to be scrollable and take 100% width
4. **Outdated navigation code** and inconsistent component naming
5. **No backward compatibility needed** - clean break

### Current State

| Component            | Location                                  | Issues                       |
| -------------------- | ----------------------------------------- | ---------------------------- |
| `AdminSidebar`       | `src/components/admin/AdminSidebar.tsx`   | Has "More" menu button       |
| `SellerSidebar`      | `src/components/seller/SellerSidebar.tsx` | Has "More" menu button       |
| `AdminLayoutClient`  | `src/app/admin/AdminLayoutClient.tsx`     | Mobile nav implementation    |
| `SellerLayoutClient` | `src/app/seller/SellerLayoutClient.tsx`   | Mobile nav implementation    |
| `MobileSidebar`      | `src/components/layout/MobileSidebar.tsx` | Full navigation items        |
| `BottomNav`          | `src/components/layout/BottomNav.tsx`     | Not scrollable, width issues |
| `MobileNavRow`       | `src/components/layout/MobileNavRow.tsx`  | Used for admin/seller mobile |

### Required Changes

#### 1. Remove "More" Button from Sidebars

- Delete overflow/more menu from `AdminSidebar`
- Delete overflow/more menu from `SellerSidebar`
- Mobile users use BottomNav (rendered above the main BottomNav)

#### 2. Simplify MobileSidebar

Remove full navigation, only keep dashboard links:

```tsx
// MobileSidebar should only have:
- Dashboard (User): /user
- Dashboard (Seller): /seller (if seller)
- Dashboard (Admin): /admin (if admin)
// No other navigation items - handled by BottomNav
```

#### 3. Fix BottomNav

```tsx
// Requirements:
- 100% width container
- Horizontal scroll if items overflow
- Proper touch scrolling on mobile
- No visible scrollbar (use CSS)
```

#### 4. Component Renaming (Optional but Recommended)

| Current Name         | Suggested Name         | Reason           |
| -------------------- | ---------------------- | ---------------- |
| `MobileNavRow`       | `AdminMobileNav`       | More descriptive |
| `AdminLayoutClient`  | `AdminMobileProvider`  | Clearer purpose  |
| `SellerLayoutClient` | `SellerMobileProvider` | Clearer purpose  |

#### 5. Navigation Code Cleanup

Files to audit and clean:

- `src/constants/navigation.ts` - Remove unused items
- `src/constants/tabs.ts` - Remove unused tabs
- `src/components/layout/Header.tsx` - Check for legacy nav code
- `src/components/layout/MainNavBar.tsx` - Check for legacy code

### Implementation Checklist

#### Phase 1: Remove "More" Buttons

- [ ] `AdminSidebar.tsx` - Remove more/overflow button
- [ ] `SellerSidebar.tsx` - Remove more/overflow button
- [ ] Remove any related state/handlers for "more" menu

#### Phase 2: Simplify MobileSidebar

- [ ] Remove full navigation items from MobileSidebar
- [ ] Add only dashboard links (user/seller/admin based on role)
- [ ] Test mobile sidebar shows correct links

#### Phase 3: Fix BottomNav

- [ ] Make container 100% width
- [ ] Add `overflow-x-auto` with hidden scrollbar
- [ ] Add `scroll-smooth` for touch scrolling
- [ ] Test horizontal scroll works on mobile

#### Phase 4: Cleanup & Rename

- [ ] Audit `navigation.ts` for dead code
- [ ] Audit `tabs.ts` for dead code
- [ ] Rename components if desired
- [ ] Update imports across codebase

### Code Examples

#### BottomNav Scroll Fix

```tsx
// Current (broken)
<div className="fixed bottom-0 left-0 right-0">
  <div className="flex justify-around">

// Fixed
<div className="fixed bottom-0 left-0 right-0 w-full">
  <div className="flex w-full overflow-x-auto scrollbar-hide scroll-smooth">
    <div className="flex min-w-full">
```

#### MobileSidebar Simplified

```tsx
// Only dashboard links
const dashboardLinks = [
  { href: "/user", label: "My Account", icon: User },
  ...(isSeller
    ? [{ href: "/seller", label: "Seller Dashboard", icon: Store }]
    : []),
  ...(isAdmin
    ? [{ href: "/admin", label: "Admin Dashboard", icon: Shield }]
    : []),
];
```

### Estimated Effort

| Task                   | Hours    |
| ---------------------- | -------- |
| Remove "More" buttons  | 1-2      |
| Simplify MobileSidebar | 1-2      |
| Fix BottomNav scroll   | 1-2      |
| Code cleanup & rename  | 2-4      |
| Testing                | 1-2      |
| **Total**              | **6-12** |

---

## Task 23: Form & Wizard Component Reusability (NEW)

**Priority**: HIGH
**Effort**: 12-18 hours
**Goal**: Maximize reuse of existing complex form components in wizards and eliminate duplicate address/contact/email form code

### 🎯 Problem Statement

Wizards and forms are currently split into steps but are NOT leveraging the powerful reusable components that already exist:

1. **SmartAddressForm** exists but shop wizard uses basic textarea for address
2. **MobileInput** exists but shop wizard uses basic input for phone
3. **PincodeInput** exists but not used anywhere in wizards
4. **StateSelector** exists but shop wizard doesn't use it
5. **CategorySelectorWithCreate** exists but wizards use basic dropdowns
6. **ShopSelector** exists but product/auction wizards use basic dropdowns
7. Required fields scattered across multiple steps instead of consolidated in Step 1
8. Submit button not always visible - need mandatory finish button at bottom

### 🔍 Current Issues Analysis

#### Issue 1: Shop Wizard ContactLegalStep NOT Using Reusable Components

**Current Code** (`src/components/seller/shop-wizard/ContactLegalStep.tsx`):

```tsx
// ❌ WRONG: Using basic FormTextarea for address
<FormField label="Address" id="address" required error={errors.address}>
  <FormTextarea
    value={formData.address || ""}
    onChange={(e) => onChange("address", e.target.value)}
    placeholder="Street, City, State, Pincode"
  />
</FormField>

// ❌ WRONG: Using basic FormInput for phone
<FormField label="Phone" id="phone" required error={errors.phone}>
  <FormInput
    value={formData.phone || ""}
    onChange={(e) => onChange("phone", e.target.value)}
    placeholder="+91 98765 43210"
  />
</FormField>

// ❌ WRONG: Using basic FormInput for email
<FormField label="Email" id="email" required error={errors.email}>
  <FormInput
    type="email"
    value={formData.email || ""}
    onChange={(e) => onChange("email", e.target.value)}
    placeholder="you@example.com"
  />
</FormField>
```

**Should Be**:

```tsx
import { SmartAddressForm } from "@/components/common/SmartAddressForm";
import { MobileInput } from "@/components/common/MobileInput";

// ✅ CORRECT: Use SmartAddressForm inline mode
<div className="space-y-4">
  <h3>Business Address</h3>
  <SmartAddressForm
    mode="inline"
    showGPS={true}
    initialData={{
      fullName: formData.businessName,
      mobileNumber: formData.phone,
      email: formData.email,
      // ... other fields
    }}
    onSuccess={(address) => {
      // Update formData with smart address
      onChange("addressLine1", address.addressLine1);
      onChange("city", address.city);
      onChange("state", address.state);
      onChange("pincode", address.postalCode);
    }}
  />
</div>;
```

#### Issue 2: Required Fields NOT in Step 1

**Current**: Shop wizard has required fields in Step 3 (Contact & Legal)
**Should Be**: All required fields in Step 1 (Basic Info)

Move these to BasicInfoStep:

- ✅ Shop Name (already there)
- ✅ Slug (already there)
- ✅ Description (already there)
- ⚠️ **Category** (already there but optional - make required)
- ❌ **Email** (currently in Step 3 - MOVE to Step 1)
- ❌ **Phone** (currently in Step 3 - MOVE to Step 1)
- ❌ **Business Address** (currently in Step 3 - MOVE to Step 1)

#### Issue 3: No Always-Visible Finish Button

**Current**: WizardActionBar only at bottom, users need to scroll to submit
**Should**: Sticky WizardActionBar with finish button always visible

The `WizardActionBar` component exists but not all wizards use it properly:

```tsx
// ✅ Product Wizard - CORRECT (uses WizardActionBar)
<WizardActionBar
  onSaveDraft={handleSaveDraft}
  onValidate={handleValidate}
  onSubmit={handleSubmit}
  isSubmitting={loading}
  isSaving={isSaving}
  isValid={isFormValid}
  submitLabel="Create Product"
/>

// ❌ Shop Wizard - WRONG (manual buttons, not sticky)
<div className="flex items-center justify-between">
  <button onClick={prevStep}>Previous</button>
  <button onClick={nextStep}>Next</button>
</div>
```

#### Issue 4: Category Selection Using Basic Dropdown

**Current**: Product/Auction wizards use basic `FormSelect` for categories
**Should Use**: `CategorySelectorWithCreate` for better UX

```tsx
// ❌ WRONG: Basic dropdown in shop wizard BasicInfoStep
<FormSelect
  id="shop-category"
  label="Primary Category"
  value={formData.category}
  onChange={(e) => onChange("category", e.target.value)}
  options={[
    { value: "", label: "Select a category" },
    { value: "electronics", label: "Electronics" },
    { value: "fashion", label: "Fashion" },
    // ... hardcoded categories
  ]}
/>;

// ✅ CORRECT: Use CategorySelectorWithCreate
import { CategorySelectorWithCreate } from "@/components/seller/CategorySelectorWithCreate";

<CategorySelectorWithCreate
  value={formData.categoryId}
  onChange={(categoryId, category) => {
    onChange("categoryId", categoryId);
    if (category) {
      onChange("categoryName", category.name);
    }
  }}
  required
  error={errors.categoryId}
  placeholder="Select or create a category"
  onCategoryCreated={(newCategory) => {
    // Auto-select newly created category
    onChange("categoryId", newCategory.id);
  }}
/>;
```

**Benefits**:

- ✅ Tree view showing category hierarchy
- ✅ Search across all categories
- ✅ Inline category creation (no page navigation)
- ✅ Breadcrumb display of selected path
- ✅ Leaf-only selection for products (seller mode)
- ✅ Real-time category validation

#### Issue 5: Shop Selection Using Basic Dropdown

**Current**: Product/Auction wizards don't have shop selector or use manual logic
**Should Use**: `ShopSelector` for multi-shop sellers

```tsx
// ❌ CURRENT: No shop selection in product/auction wizards
// Assumes single shop or uses hardcoded shopId

// ✅ CORRECT: Use ShopSelector
import ShopSelector from "@/components/seller/ShopSelector";

<ShopSelector
  value={formData.shopId}
  onChange={(shopId, slug) => {
    onChange("shopId", shopId);
    if (slug) {
      onChange("shopSlug", slug);
    }
  }}
  includeAllOption={false}
  disabled={loading}
  className="flex-1"
/>;
```

**Benefits**:

- ✅ Auto-loads user's shops
- ✅ Handles multi-shop sellers
- ✅ Auto-selects if only one shop
- ✅ Returns both ID and slug
- ✅ Consistent shop selection across wizards
- ✅ Loading state handled internally

### 📋 Existing Reusable Components Available

| Component                    | Location                                               | Features                                        | Used In Wizards? |
| ---------------------------- | ------------------------------------------------------ | ----------------------------------------------- | ---------------- |
| `SmartAddressForm`           | `src/components/common/SmartAddressForm.tsx`           | GPS, pincode lookup, state selector, validation | ❌ NO            |
| `MobileInput`                | `src/components/common/MobileInput.tsx`                | Country code picker, validation, WhatsApp/Call  | ❌ NO            |
| `PincodeInput`               | `src/components/common/PincodeInput.tsx`               | Auto-lookup, area selector, validation          | ❌ NO            |
| `StateSelector`              | `src/components/common/StateSelector.tsx`              | Searchable Indian states dropdown               | ❌ NO            |
| `CategorySelector`           | `src/components/common/CategorySelector.tsx`           | Tree view, search, breadcrumb, leaf-only        | ⚠️ Partial       |
| `CategorySelectorWithCreate` | `src/components/seller/CategorySelectorWithCreate.tsx` | CategorySelector + inline create dialog         | ❌ NO            |
| `ShopSelector`               | `src/components/seller/ShopSelector.tsx`               | Searchable shop dropdown with auto-load         | ❌ NO            |
| `Email` (display)            | `src/components/common/values/Email.tsx`               | Email formatting with mailto link               | ⚠️ Display only  |
| `PhoneNumber` (display)      | `src/components/common/values/PhoneNumber.tsx`         | Phone formatting with click-to-call             | ⚠️ Display only  |
| `Address` (display)          | `src/components/common/values/Address.tsx`             | Address formatting                              | ⚠️ Display only  |
| `GPSButton`                  | `src/components/common/GPSButton.tsx`                  | GPS location detection                          | ❌ NO            |
| `WizardActionBar`            | `src/components/forms/WizardActionBar.tsx`             | Sticky action bar with save/validate/submit     | ✅ YES (partial) |
| `FormField`                  | `src/components/forms/FormField.tsx`                   | Label + input + error wrapper                   | ✅ YES           |
| `FormInput`                  | `src/components/forms/FormInput.tsx`                   | Basic input wrapper                             | ✅ YES           |
| `FormSelect`                 | `src/components/forms/FormSelect.tsx`                  | Select dropdown wrapper                         | ✅ YES           |

### 🔧 Wizards Requiring Updates

| Wizard                        | Location                                   | Issues to Fix                                                                                                                                     |
| ----------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Shop Creation Wizard**      | `src/app/seller/my-shops/create/page.tsx`  | 1. Use SmartAddressForm<br>2. Use MobileInput<br>3. Use CategorySelectorWithCreate<br>4. Move required fields to Step 1<br>5. Add WizardActionBar |
| **Product Creation Wizard**   | `src/app/seller/products/create/page.tsx`  | 1. Use CategorySelectorWithCreate<br>2. Use ShopSelector<br>✅ Already uses WizardActionBar                                                       |
| **Auction Creation Wizard**   | `src/app/seller/auctions/create/page.tsx`  | 1. Use CategorySelectorWithCreate<br>2. Use ShopSelector<br>✅ Already uses WizardActionBar                                                       |
| **Category Creation Wizard**  | `src/app/admin/categories/create/page.tsx` | Check if needs WizardActionBar                                                                                                                    |
| **Blog Post Creation Wizard** | `src/app/admin/blog/create/page.tsx`       | Check if needs WizardActionBar                                                                                                                    |
| **Coupon Creation Form**      | `src/components/seller/CouponForm.tsx`     | 1. Use ShopSelector<br>2. Consider wizardizing if complex                                                                                         |

### 🎯 Implementation Plan

#### Phase 1: Shop Wizard Refactoring (6-8 hours)

**Step 1: Restructure BasicInfoStep** (Add required fields)

```tsx
// src/components/seller/shop-wizard/BasicInfoStep.tsx
import { FormInput, FormTextarea, FormSelect } from "@/components/forms";
import { MobileInput } from "@/components/common/MobileInput";
import SlugInput from "@/components/common/SlugInput";

export default function BasicInfoStep({
  formData,
  onChange,
  errors,
}: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      {/* Section 1: Basic Shop Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Shop Information</h3>

        <FormInput
          label="Shop Name"
          value={formData.name}
          onChange={(e) => onChange("name", e.target.value)}
          required
          error={errors.name}
        />

        <SlugInput
          label="Shop URL Slug"
          value={formData.slug}
          onChange={(v) => onChange("slug", v)}
          required
          error={errors.slug}
        />

        <FormTextarea
          label="Description"
          value={formData.description}
          onChange={(e) => onChange("description", e.target.value)}
          required
          helperText={`${
            formData.description?.length || 0
          }/500 characters (min 20)`}
          error={errors.description}
        />

        <FormSelect
          label="Primary Category"
          value={formData.category}
          onChange={(e) => onChange("category", e.target.value)}
          required
          error={errors.category}
          options={[
            { value: "", label: "Select a category" },
            { value: "electronics", label: "Electronics" },
            { value: "fashion", label: "Fashion" },
            // ... more categories
          ]}
        />
      </div>

      {/* Section 2: Contact Info (MOVED FROM STEP 3) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Contact Information</h3>

        <MobileInput
          label="Primary Contact Number"
          value={formData.phone || ""}
          onChange={(v) => onChange("phone", v)}
          countryCode={formData.countryCode || "+91"}
          onCountryCodeChange={(code) => onChange("countryCode", code)}
          required
          error={errors.phone}
        />

        <FormInput
          label="Business Email"
          type="email"
          value={formData.email || ""}
          onChange={(e) => onChange("email", e.target.value)}
          required
          error={errors.email}
          placeholder="contact@yourshop.com"
        />
      </div>
    </div>
  );
}
```

**Step 2: Update ContactLegalStep** (Use SmartAddressForm inline mode)

```tsx
// src/components/seller/shop-wizard/ContactLegalStep.tsx
import { SmartAddressForm } from "@/components/common/SmartAddressForm";
import { FormInput } from "@/components/forms";

export default function ContactLegalStep({
  formData,
  onChange,
  errors,
}: ContactLegalStepProps) {
  return (
    <div className="space-y-6">
      {/* Business Address - Use SmartAddressForm */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Business Address</h3>
        <SmartAddressForm
          mode="inline"
          showGPS={true}
          initialData={{
            fullName: formData.businessName || formData.name,
            mobileNumber: formData.phone,
            addressLine1: formData.addressLine1,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            type: "work" as const,
          }}
          onSuccess={(address) => {
            onChange("addressLine1", address.addressLine1);
            onChange("addressLine2", address.addressLine2);
            onChange("city", address.city);
            onChange("state", address.state);
            onChange("pincode", address.postalCode);
          }}
        />
      </div>

      {/* Legal Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Legal Information (Optional)</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            label="GSTIN"
            value={formData.gstin || ""}
            onChange={(e) => onChange("gstin", e.target.value)}
            placeholder="22AAAAA0000A1Z5"
          />
          <FormInput
            label="PAN"
            value={formData.pan || ""}
            onChange={(e) => onChange("pan", e.target.value)}
            placeholder="ABCDE1234F"
          />
          <FormInput
            label="CIN"
            value={formData.cin || ""}
            onChange={(e) => onChange("cin", e.target.value)}
            placeholder="U12345DL2020PTC123456"
          />
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Update Shop Wizard Page** (Add WizardActionBar)

```tsx
// src/app/seller/my-shops/create/page.tsx
import { WizardActionBar } from "@/components/forms/WizardActionBar";

export default function CreateShopWizardPage() {
  // ... existing state

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* ... existing header and progress bar */}

      {/* Step Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ... step components */}
      </div>

      {/* ✅ ADD: Sticky Action Bar (always visible) */}
      <WizardActionBar
        onSaveDraft={handleSaveDraft}
        onValidate={handleValidate}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isSaving={isSaving}
        isValid={isFormValid}
        submitLabel="Create Shop"
        showSaveDraft={true}
        showValidate={true}
      />
    </div>
  );
}
```

**Step 4: Update ShopFormData Type**

```tsx
// src/components/seller/shop-wizard/types.ts
export interface ShopFormData {
  // Step 1: Basic Info (ALL REQUIRED FIELDS)
  name: string;
  slug: string;
  description: string;
  category: string; // REQUIRED
  phone: string; // MOVED from Step 3
  email: string; // MOVED from Step 3
  countryCode?: string;

  // Step 2: Branding (optional)
  logoUrl?: string;
  bannerUrl?: string;
  themeColor?: string;
  tagline?: string;
  about?: string;

  // Step 3: Contact & Legal (now mostly optional)
  addressLine1?: string; // From SmartAddressForm
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gstin?: string;
  pan?: string;
  cin?: string;

  // Step 4: Banking (optional)
  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  ifsc?: string;

  // Step 5: Policies (optional)
  returnPolicy?: string;
  shippingPolicy?: string;
  tos?: string;
  privacy?: string;

  // Step 6: Settings (optional)
  defaultShippingFee?: number;
  supportEmail?: string;
  enableCOD?: boolean;
  enableReturns?: boolean;
  showContact?: boolean;
}
```

#### Phase 2: Validate Other Wizards (2-4 hours)

**Check List**:

- [ ] Product Wizard - Already good ✅
- [ ] Auction Wizard - Already good ✅
- [ ] Category Wizard - Needs WizardActionBar check
- [ ] Blog Wizard - Needs WizardActionBar check
- [ ] Coupon Form - Evaluate if needs wizard structure

#### Phase 3: Create Reusable Wizard Step Components (4-6 hours)

These can be shared across multiple wizards:

**ContactInfoStep** (Reusable contact section)

```tsx
// src/components/wizards/ContactInfoStep.tsx
import { MobileInput } from "@/components/common/MobileInput";
import { FormInput } from "@/components/forms";

interface ContactInfoStepProps {
  phone: string;
  email: string;
  countryCode?: string;
  onPhoneChange: (phone: string) => void;
  onEmailChange: (email: string) => void;
  onCountryCodeChange: (code: string) => void;
  errors?: {
    phone?: string;
    email?: string;
  };
}

export function ContactInfoStep({ ... }: ContactInfoStepProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Contact Information</h3>

      <MobileInput
        label="Mobile Number"
        value={phone}
        onChange={onPhoneChange}
        countryCode={countryCode}
        onCountryCodeChange={onCountryCodeChange}
        required
        error={errors?.phone}
      />

      <FormInput
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        required
        error={errors?.email}
      />
    </div>
  );
}
```

**BusinessAddressStep** (Reusable address section)

```tsx
// src/components/wizards/BusinessAddressStep.tsx
import { SmartAddressForm } from "@/components/common/SmartAddressForm";

interface BusinessAddressStepProps {
  businessName: string;
  phone: string;
  email: string;
  initialAddress?: {
    addressLine1?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  onAddressChange: (address: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pincode: string;
  }) => void;
}

export function BusinessAddressStep({ ... }: BusinessAddressStepProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Business Address</h3>
      <SmartAddressForm
        mode="inline"
        showGPS={true}
        initialData={{
          fullName: businessName,
          mobileNumber: phone,
          type: "work" as const,
          ...initialAddress,
        }}
        onSuccess={(address) => {
          onAddressChange({
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2 || "",
            city: address.city,
            state: address.state,
            pincode: address.postalCode,
          });
        }}
      />
    </div>
  );
}
```

#### Phase 4: Create Reusable Dropdown Components with Inline Create (6-8 hours)

These dropdown components should be created to provide consistent UX across wizards, inline forms, and checkout:

**AddressSelectorWithCreate** (Reusable saved address dropdown + inline create)

```tsx
// src/components/common/AddressSelectorWithCreate.tsx
import { useState, useEffect } from "react";
import { Plus, MapPin, CheckCircle } from "lucide-react";
import { SmartAddressForm } from "@/components/common/SmartAddressForm";
import { addressService } from "@/services/address.service";
import type { AddressFE } from "@/types/frontend/address.types";

interface AddressSelectorWithCreateProps {
  value: string | null; // addressId
  onChange: (addressId: string | null, address: AddressFE | null) => void;
  userId: string;
  addressType?: "home" | "work" | "other" | "all"; // Filter by type
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
  showCreateButton?: boolean;
}

export function AddressSelectorWithCreate({
  value,
  onChange,
  userId,
  addressType = "all",
  placeholder = "Select saved address",
  error,
  required = false,
  className = "",
  showCreateButton = true,
}: AddressSelectorWithCreateProps) {
  const [addresses, setAddresses] = useState<AddressFE[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, [userId, addressType]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const allAddresses = await addressService.list();

      // Filter by type if specified
      const filtered =
        addressType === "all"
          ? allAddresses
          : allAddresses.filter((addr) => addr.addressType === addressType);

      setAddresses(filtered);

      // Auto-select default address if no selection
      if (!value && filtered.length > 0) {
        const defaultAddr = filtered.find((a) => a.isDefault) || filtered[0];
        onChange(defaultAddr.id, defaultAddr);
      }
    } catch (error) {
      console.error("Failed to load addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = (newAddress: AddressFE) => {
    setAddresses((prev) => [...prev, newAddress]);
    onChange(newAddress.id, newAddress);
    setShowCreateDialog(false);
  };

  const selectedAddress = addresses.find((addr) => addr.id === value);

  return (
    <>
      <div className={`relative ${className}`}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Delivery Address {required && <span className="text-red-500">*</span>}
        </label>

        <div className="flex gap-2">
          {/* Dropdown */}
          <div className="flex-1 relative">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={`w-full px-4 py-3 text-left border rounded-lg flex items-center justify-between
                ${
                  error
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }
                bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700`}
            >
              {selectedAddress ? (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {selectedAddress.fullName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {selectedAddress.addressLine1}, {selectedAddress.city}
                    </p>
                  </div>
                  {selectedAddress.isDefault && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
              ) : (
                <span className="text-sm text-gray-500">{placeholder}</span>
              )}
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsOpen(false)}
                />
                <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                  {addresses.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      No saved addresses found. Create one to continue.
                    </div>
                  ) : (
                    addresses.map((addr) => (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => {
                          onChange(addr.id, addr);
                          setIsOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b last:border-b-0
                          ${
                            addr.id === value
                              ? "bg-blue-50 dark:bg-blue-900/20"
                              : ""
                          }`}
                      >
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {addr.fullName}
                              </p>
                              {addr.isDefault && (
                                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {addr.addressLine1}
                              {addr.addressLine2 && `, ${addr.addressLine2}`}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              {addr.city}, {addr.state} - {addr.postalCode}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {addr.phoneNumber}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          {/* Create Button */}
          {showCreateButton && (
            <button
              type="button"
              onClick={() => setShowCreateDialog(true)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
              title="Add new address"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">New</span>
            </button>
          )}
        </div>

        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>

      {/* Create Address Dialog */}
      {showCreateDialog && (
        <SmartAddressForm
          onClose={() => setShowCreateDialog(false)}
          onSuccess={handleCreateSuccess}
          mode="modal"
          showGPS={true}
        />
      )}
    </>
  );
}
```

**Usage Examples**:

```tsx
// In Shop Wizard (save business address to user's addresses)
<AddressSelectorWithCreate
  value={formData.businessAddressId}
  onChange={(id, address) => {
    onChange("businessAddressId", id);
    if (address) {
      onChange("addressLine1", address.addressLine1);
      onChange("city", address.city);
      // ... update form fields
    }
  }}
  userId={user.uid}
  addressType="work"
  required
/>

// In Checkout Page
<AddressSelectorWithCreate
  value={selectedAddressId}
  onChange={(id, address) => setSelectedAddress(address)}
  userId={user.uid}
  addressType="all"
  placeholder="Select delivery address"
  required
/>

// In Product/Auction Create (pickup address)
<AddressSelectorWithCreate
  value={formData.pickupAddressId}
  onChange={(id) => onChange("pickupAddressId", id)}
  userId={user.uid}
  addressType="all"
  showCreateButton={true}
/>
```

**Key Benefits**:

- ✅ Reuses user's saved addresses across ALL wizards and forms
- ✅ Addresses saved to same location (user addresses collection)
- ✅ Inline create with SmartAddressForm (GPS, pincode lookup)
- ✅ Visual preview of each address
- ✅ Default address auto-selection
- ✅ Filter by address type (home/work/other)
- ✅ Consistent UX in checkout, wizards, and inline forms

**Similar Components to Create**:

1. **CategorySelectorWithCreate** ✅ Already exists
2. **ShopSelectorWithCreate** (for multi-shop sellers)
3. **AddressSelectorWithCreate** ⭐ New (detailed above)
4. **PaymentMethodSelectorWithCreate** (saved cards/UPI)
5. **ShippingMethodSelector** (with carrier options)
6. **BankAccountSelectorWithCreate** (saved bank accounts for payouts)
7. **TaxDetailsSelectorWithCreate** (saved GST/PAN details)
8. **ProductVariantSelector** (size, color, etc. with inline add)
9. **CouponSelector** (apply existing coupons - sellers create in dashboard)
10. **TagSelectorWithCreate** (product tags with inline create)

---

#### Phase 5: Additional Reusable Selector Components (8-12 hours)

**BankAccountSelectorWithCreate** (For seller payouts)

```tsx
// src/components/seller/BankAccountSelectorWithCreate.tsx
interface BankAccount {
  id: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountType: "savings" | "current";
  isDefault: boolean;
  isPrimary: boolean;
}

interface BankAccountSelectorWithCreateProps {
  value: string | null;
  onChange: (accountId: string | null, account: BankAccount | null) => void;
  sellerId: string;
  required?: boolean;
  error?: string;
}

// Features:
// - Load saved bank accounts from seller profile
// - Inline create with bank account form
// - IFSC code validation and auto-fill bank details
// - Set default/primary account
// - Verification status indicator
// - Used in: Seller onboarding, payout requests, shop settings
```

**TaxDetailsSelectorWithCreate** (For business compliance)

```tsx
// src/components/seller/TaxDetailsSelectorWithCreate.tsx
interface TaxDetails {
  id: string;
  gstin: string;
  pan: string;
  cin?: string;
  businessName: string;
  businessType: "individual" | "proprietorship" | "partnership" | "company";
  isVerified: boolean;
  isDefault: boolean;
}

interface TaxDetailsSelectorWithCreateProps {
  value: string | null;
  onChange: (detailsId: string | null, details: TaxDetails | null) => void;
  sellerId: string;
  required?: boolean;
  showVerificationStatus?: boolean;
}

// Features:
// - Load saved tax details (GST/PAN/CIN)
// - Inline create with validation
// - GSTIN format validation (22AAAAA0000A1Z5)
// - PAN format validation (ABCDE1234F)
// - Auto-fetch business details from GSTIN API
// - Verification status badge
// - Used in: Shop creation, invoice generation, tax filing
```

**ProductVariantSelector** (For selecting alternative products from same category)

```tsx
// src/components/common/ProductVariantSelector.tsx
interface ProductVariant {
  id: string; // Product ID
  productId: string;
  name: string; // Product name
  shopId: string;
  shopName: string;
  sellerId: string;
  sellerName: string;
  categoryId: string; // Same leaf category as current product
  price: number;
  originalPrice?: number; // For discount display
  stock: number;
  rating?: number;
  reviewCount?: number;
  images: string[];
  attributes?: {
    color?: string;
    size?: string;
    brand?: string;
    [key: string]: string | undefined;
  };
  shippingTime?: string; // "2-3 days"
  isFulfillmentByPlatform?: boolean;
}

interface ProductVariantSelectorProps {
  currentProductId: string;
  categoryId: string; // Leaf category to find variants from
  selectedVariantId: string | null;
  onChange: (variantId: string, variant: ProductVariant) => void;
  maxVariants?: number; // Default 10
  sortBy?: "price" | "rating" | "shipping"; // Default: price
}

// Features:
// - Loads all products from same leaf category (cross-seller)
// - Small card layout (Amazon-style "Other Sellers on Amazon")
// - Shows: Product image, price, seller name, rating, shipping time
// - Price comparison (lowest price highlighted)
// - Stock availability indicator
// - Seller rating/trust badge
// - Fast shipping badge (FBP - Fulfillment by Platform)
// - Discount percentage display
// - Click card to navigate to that product page
// - Used in: Product detail page (as "Similar Products" or "Other Options")
// Note: Products A, B, C under leaf category "ball" are variants of each other
// Example: If viewing Product A, shows B and C as alternatives from any seller
```

**CouponSelector** (For applying discounts during checkout)

```tsx
// src/components/checkout/CouponSelector.tsx
interface Coupon {
  id: string;
  code: string;
  discountType: "percentage" | "fixed" | "freeShipping";
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  validFrom: Date;
  validUntil: Date;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
}

interface CouponSelectorProps {
  value: string | null; // couponId or code
  onChange: (couponId: string | null, coupon: Coupon | null) => void;
  orderValue: number;
  userId?: string;
  shopId?: string;
}

// Features:
// - Load applicable coupons (user-specific, shop-specific, global)
// - Manual code entry with validation
// - Display discount calculation preview
// - Expiry warning (expires soon badge)
// - Usage limit indicator
// - Invalid code error handling
// - Auto-apply best coupon suggestion
// - Remove applied coupon button
// - Used in: Checkout, cart
// Note: Sellers create coupons in dashboard (src/app/seller/coupons), not inline
```

**TagSelectorWithCreate** (For product/blog tags)

```tsx
// src/components/common/TagSelectorWithCreate.tsx
interface Tag {
  id: string;
  name: string;
  slug: string;
  color?: string;
  usageCount?: number;
}

interface TagSelectorWithCreateProps {
  value: string[]; // Array of tag IDs
  onChange: (tagIds: string[], tags: Tag[]) => void;
  entityType: "product" | "blog" | "shop";
  maxTags?: number;
  allowCreate?: boolean;
  suggestions?: Tag[];
}

// Features:
// - Multi-select tag picker with chips
// - Tag suggestions based on entity type
// - Inline tag creation (name → auto-slug)
// - Color picker for tags
// - Popular tags display
// - Tag usage count indicator
// - Drag-to-reorder selected tags
// - Max tags limit enforcement
// - Used in: Product create/edit, blog create/edit, shop settings
```

**ShippingMethodSelector** (For checkout and order fulfillment)

```tsx
// src/components/checkout/ShippingMethodSelector.tsx
interface ShippingMethod {
  id: string;
  carrier: string; // "Delhivery", "BlueDart", "India Post"
  service: string; // "Standard", "Express", "Same Day"
  estimatedDays: { min: number; max: number };
  cost: number;
  isFree: boolean;
  features: string[]; // ["Tracking", "Insurance", "Signature Required"]
  cutoffTime?: string; // "5:00 PM"
}

interface ShippingMethodSelectorProps {
  methods: ShippingMethod[];
  selectedMethodId: string | null;
  onChange: (methodId: string, method: ShippingMethod) => void;
  deliveryAddress: string; // For calculating rates
  orderWeight?: number;
  orderValue?: number;
}

// Features:
// - Visual shipping method cards
// - Delivery time estimation
// - Cost comparison
// - Features display (tracking, insurance)
// - Free shipping badge
// - Cutoff time warning
// - Recommended option highlight
// - Real-time rate calculation
// - Used in: Checkout, seller order fulfillment
```

**PaymentMethodSelectorWithCreate** (For checkout)

```tsx
// src/components/checkout/PaymentMethodSelectorWithCreate.tsx
interface SavedPaymentMethod {
  id: string;
  type: "card" | "upi" | "netbanking" | "wallet";
  displayName: string; // "HDFC •••• 4242"
  last4?: string; // For cards
  upiId?: string; // For UPI
  bankName?: string; // For netbanking
  walletProvider?: string; // "Paytm", "PhonePe"
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

interface PaymentMethodSelectorWithCreateProps {
  value: string | null; // payment method ID
  onChange: (
    methodId: string | null,
    method: SavedPaymentMethod | null,
  ) => void;
  userId: string;
  orderValue: number;
  allowNewMethod?: boolean;
  supportedTypes?: Array<"card" | "upi" | "netbanking" | "wallet" | "cod">;
}

// Features:
// - Load saved payment methods
// - Visual method cards with icons
// - CVV re-entry for saved cards
// - Inline add new payment method
// - Payment method type selector
// - Expiry date validation
// - Default method auto-select
// - Security badges (PCI DSS, SSL)
// - COD availability check
// - Used in: Checkout, subscription payments
```

**ContactSelectorWithCreate** (For support/emergency contacts)

```tsx
// src/components/common/ContactSelectorWithCreate.tsx
interface Contact {
  id: string;
  name: string;
  relationship?: string; // "Emergency", "Alternate", "Business"
  phone: string;
  email?: string;
  isPrimary: boolean;
}

// Features:
// - Load saved contacts
// - Inline contact creation with MobileInput
// - Phone number validation
// - Set primary contact
// - Contact type/relationship
// - Used in: User settings, order tracking, seller profile
```

**DocumentSelectorWithUpload** (For KYC/verification documents)

```tsx
// src/components/common/DocumentSelectorWithUpload.tsx
interface Document {
  id: string;
  type: "aadhar" | "pan" | "gstin" | "license" | "passport";
  documentNumber: string;
  uploadedUrl: string;
  verificationStatus: "pending" | "verified" | "rejected";
  expiryDate?: Date;
  uploadedAt: Date;
}

// Features:
// - Load uploaded documents
// - Document type selector
// - File upload with preview
// - OCR for auto-filling details
// - Verification status badge
// - Expiry date tracking
// - Document viewer
// - Re-upload functionality
// - Used in: Seller onboarding, user verification, compliance
```

**TemplateSelectorWithCreate** (For email/message templates)

```tsx
// src/components/admin/TemplateSelectorWithCreate.tsx
interface Template {
  id: string;
  name: string;
  category: "email" | "sms" | "notification" | "invoice";
  subject?: string;
  content: string;
  variables: string[]; // ["{{customerName}}", "{{orderNumber}}"]
  isDefault: boolean;
}

// Features:
// - Load saved templates
// - Category filtering
// - Template preview with variables
// - Inline template editor
// - Variable insertion helper
// - Rich text editor
// - Template duplication
// - Used in: Email settings, bulk messaging, order notifications
```

### 📊 Benefits Summary

| Improvement                            | Impact                                   | Lines Saved     |
| -------------------------------------- | ---------------------------------------- | --------------- |
| Use SmartAddressForm                   | GPS, validation, UX                      | ~200 lines      |
| Use MobileInput                        | Country codes, WhatsApp                  | ~100 lines      |
| Use PincodeInput                       | Auto-lookup, validation                  | ~150 lines      |
| Use CategorySelectorWithCreate         | Tree view, search, inline create         | ~300 lines      |
| Use ShopSelector                       | Auto-load shops, consistent UX           | ~100 lines      |
| Use AddressSelectorWithCreate          | Saved addresses, inline create, checkout | ~400 lines      |
| Use BankAccountSelectorWithCreate      | Saved bank accounts, IFSC validation     | ~300 lines      |
| Use TaxDetailsSelectorWithCreate       | GST/PAN validation, compliance           | ~300 lines      |
| Use ProductVariantSelector             | Cross-seller alternatives, price compare | ~250 lines      |
| Use CouponSelector                     | Discount calculation, auto-apply         | ~200 lines      |
| Use TagSelectorWithCreate              | Multi-select, suggestions, inline create | ~200 lines      |
| Use ShippingMethodSelector             | Carrier comparison, rate calculation     | ~250 lines      |
| Use PaymentMethodSelectorWithCreate    | Saved cards/UPI, security                | ~350 lines      |
| Use ContactSelectorWithCreate          | Emergency contacts, validation           | ~150 lines      |
| Use DocumentSelectorWithUpload         | KYC, OCR, verification tracking          | ~300 lines      |
| Use TemplateSelectorWithCreate         | Email/SMS templates, variable insertion  | ~250 lines      |
| Consolidate required fields            | Better UX, less back-nav                 | N/A             |
| Add WizardActionBar everywhere         | Consistent UX                            | ~50 lines       |
| Create reusable wizard step components | Cross-wizard reuse                       | ~500 lines      |
| **Total**                              | -                                        | **~4250 lines** |

### ✅ Validation & Testing Checklist

**Basic Wizard Components**:

- [ ] Shop wizard Step 1 has all required fields
- [ ] SmartAddressForm works in inline mode
- [ ] MobileInput country code persists
- [ ] PincodeInput auto-fills city/state
- [ ] CategorySelectorWithCreate shows tree view
- [ ] CategorySelectorWithCreate inline create works
- [ ] ShopSelector auto-loads user's shops
- [ ] ShopSelector auto-selects if only one shop
- [ ] WizardActionBar stays visible on scroll
- [ ] Save draft works at any step
- [ ] Validate button checks all steps
- [ ] Submit button only enabled when valid
- [ ] Mobile responsive (test on iPhone/Android)
- [ ] Dark mode works in all steps
- [ ] Form data persists when navigating steps
- [ ] GPS button works in SmartAddressForm
- [ ] WhatsApp/Call buttons work in MobileInput
- [ ] Category tree navigation works properly
- [ ] Shop dropdown shows all user's shops

**New Selector Components**:

- [ ] AddressSelectorWithCreate loads saved addresses
- [ ] BankAccountSelectorWithCreate validates IFSC codes
- [ ] TaxDetailsSelectorWithCreate validates GST/PAN formats
- [ ] ProductVariantSelector loads same-category products cross-seller
- [ ] CouponSelector validates coupon codes and calculates discount
- [ ] TagSelectorWithCreate enforces max tags limit
- [ ] ShippingMethodSelector displays delivery estimates
- [ ] PaymentMethodSelectorWithCreate handles CVV re-entry
- [ ] ContactSelectorWithCreate validates phone numbers
- [ ] DocumentSelectorWithUpload previews uploaded files
- [ ] TemplateSelectorWithCreate substitutes variables correctly

### 🎯 Success Criteria

**Wizard Integration**:

1. ✅ Shop wizard uses SmartAddressForm in ContactLegalStep
2. ✅ Shop wizard uses MobileInput in BasicInfoStep
3. ✅ Shop wizard uses CategorySelectorWithCreate in BasicInfoStep
4. ✅ Product/Auction wizards use CategorySelectorWithCreate
5. ✅ Product/Auction wizards use ShopSelector
6. ✅ All required fields in Step 1 of all wizards
7. ✅ WizardActionBar used in all wizards (sticky at bottom)
8. ✅ No duplicate address/phone/email/category/shop form code
9. ✅ GPS, pincode lookup, state selector available in all address forms
10. ✅ Category tree view with search and inline create works
11. ✅ Shop dropdown auto-loads and handles multi-shop sellers
12. ✅ Validation works consistently across all wizards
13. ✅ Mobile UX improved with proper touch targets

**New Selector Components**:

14. ✅ AddressSelectorWithCreate used in checkout and wizards
15. ✅ BankAccountSelectorWithCreate used in seller onboarding
16. ✅ TaxDetailsSelectorWithCreate used in shop creation
17. ✅ ProductVariantSelector shows alternatives from same leaf category (cross-seller)
18. ✅ CouponSelector used in checkout for applying existing coupons
19. ✅ TagSelectorWithCreate used in product/blog creation (sellers only)
20. ✅ ShippingMethodSelector used in checkout
21. ✅ PaymentMethodSelectorWithCreate used in checkout
22. ✅ ContactSelectorWithCreate used in user settings
23. ✅ DocumentSelectorWithUpload used in seller verification
24. ✅ TemplateSelectorWithCreate used in admin settings
25. ✅ All selectors save data to shared collections
26. ✅ Inline create only available for user-owned resources
27. ✅ All selectors work in dark mode

### 📝 Files to Modify

**Existing Wizard Updates**:

| File                                                        | Changes                                         |
| ----------------------------------------------------------- | ----------------------------------------------- |
| `src/app/seller/my-shops/create/page.tsx`                   | Add WizardActionBar, CategorySelectorWithCreate |
| `src/components/seller/shop-wizard/BasicInfoStep.tsx`       | Add phone/email, use CategorySelectorWithCreate |
| `src/components/seller/shop-wizard/ContactLegalStep.tsx`    | Replace textarea with SmartAddressForm          |
| `src/components/seller/shop-wizard/types.ts`                | Update ShopFormData with address fields         |
| `src/app/seller/products/create/page.tsx`                   | Add CategorySelectorWithCreate, ShopSelector    |
| `src/components/seller/product-wizard/RequiredInfoStep.tsx` | Use CategorySelectorWithCreate, ShopSelector    |
| `src/app/seller/auctions/create/page.tsx`                   | Add CategorySelectorWithCreate, ShopSelector    |
| `src/components/seller/auction-wizard/RequiredInfoStep.tsx` | Use CategorySelectorWithCreate, ShopSelector    |
| `src/app/admin/categories/create/page.tsx`                  | Verify WizardActionBar usage                    |
| `src/app/admin/blog/create/page.tsx`                        | Verify WizardActionBar usage                    |

**New Reusable Wizard Step Components**:

| File                                               | Purpose                                        |
| -------------------------------------------------- | ---------------------------------------------- |
| `src/components/wizards/ContactInfoStep.tsx`       | Reusable contact section with MobileInput      |
| `src/components/wizards/BusinessAddressStep.tsx`   | Reusable address section with SmartAddressForm |
| `src/components/wizards/CategorySelectionStep.tsx` | Reusable category selection with create option |
| `src/components/wizards/ShopSelectionStep.tsx`     | Reusable shop selection for multi-shop sellers |

**New Selector Components (Phase 4 & 5)**:

| File                                                          | Purpose                                           |
| ------------------------------------------------------------- | ------------------------------------------------- |
| `src/components/common/AddressSelectorWithCreate.tsx`         | Saved address dropdown + inline create            |
| `src/components/checkout/PaymentMethodSelectorWithCreate.tsx` | Saved payment methods dropdown + inline create    |
| `src/components/seller/BankAccountSelectorWithCreate.tsx`     | Saved bank accounts + IFSC validation             |
| `src/components/seller/TaxDetailsSelectorWithCreate.tsx`      | GST/PAN validation + inline create                |
| `src/components/common/ProductVariantSelector.tsx`            | Cross-seller alternative products (same category) |
| `src/components/checkout/CouponSelector.tsx`                  | Coupon code input + discount calculation          |
| `src/components/common/TagSelectorWithCreate.tsx`             | Multi-select tags + inline create (sellers)       |
| `src/components/checkout/ShippingMethodSelector.tsx`          | Carrier comparison + rate calculation             |
| `src/components/common/ContactSelectorWithCreate.tsx`         | Emergency contacts + MobileInput                  |
| `src/components/common/DocumentSelectorWithUpload.tsx`        | KYC documents + OCR + verification tracking       |
| `src/components/admin/TemplateSelectorWithCreate.tsx`         | Email/SMS templates + variable insertion          |

**Pages Using New Selectors**:

| File                                         | Selectors to Add                                                           |
| -------------------------------------------- | -------------------------------------------------------------------------- |
| `src/app/checkout/page.tsx`                  | AddressSelectorWithCreate, PaymentMethodSelectorWithCreate, CouponSelector |
| `src/app/seller/my-shops/create/page.tsx`    | AddressSelectorWithCreate, BankAccountSelectorWithCreate                   |
| `src/app/seller/onboarding/page.tsx`         | TaxDetailsSelectorWithCreate, DocumentSelectorWithUpload                   |
| `src/app/seller/products/create/page.tsx`    | TagSelectorWithCreate                                                      |
| `src/app/seller/products/[id]/edit/page.tsx` | TagSelectorWithCreate                                                      |
| `src/app/products/[id]/page.tsx`             | ProductVariantSelector (show alternatives from same category)              |
| `src/app/admin/blog/create/page.tsx`         | TagSelectorWithCreate                                                      |
| `src/app/admin/settings/templates/page.tsx`  | TemplateSelectorWithCreate                                                 |
| `src/app/user/settings/contacts/page.tsx`    | ContactSelectorWithCreate                                                  |

### 🚀 Estimated Effort Breakdown

| Phase                                      | Hours     |
| ------------------------------------------ | --------- |
| Phase 1: Shop Wizard Refactoring           | 6-8       |
| Phase 2: Validate Other Wizards            | 2-4       |
| Phase 3: Reusable Step Components          | 4-6       |
| Phase 4: Core Reusable Dropdown Components | 6-8       |
| Phase 5: Advanced Selector Components      | 8-12      |
| Phase 6: Integration & Testing             | 4-6       |
| **Total**                                  | **30-44** |

---

## Task 24: Detail Page Section Components 📄

### 🎯 Problem Statement

Detail pages (Product, Shop, Category, Auction) contain reusable sections that could be componentized and shared across different detail pages and contexts. Currently, these sections are partially implemented but lack consistency and reusability across the platform.

### 🔍 Current Issues

1. **Product detail sections exist** but are not documented as reusable
2. **Shop detail page** only has ShopHeader, missing other sections
3. **Category detail page** has no dedicated section components
4. **Auction detail page** lacks structured section components
5. **Inconsistent section structure** across different detail pages
6. **Similar sections reimplemented** instead of reused (e.g., reviews, related items)
7. **No standardized section layout** for detail pages

### 📦 Existing Product Detail Components

| Component              | Path                                            | Purpose                             | Status |
| ---------------------- | ----------------------------------------------- | ----------------------------------- | ------ |
| **ProductGallery**     | `src/components/product/ProductGallery.tsx`     | Image/video gallery with thumbnails | ✅     |
| **ProductInfo**        | `src/components/product/ProductInfo.tsx`        | Price, stock, seller, actions       | ✅     |
| **ProductDescription** | `src/components/product/ProductDescription.tsx` | Description, specs, features        | ✅     |
| **ProductReviews**     | `src/components/product/ProductReviews.tsx`     | Review list and form                | ✅     |
| **ProductVariants**    | `src/components/product/ProductVariants.tsx`    | Cross-seller alternatives           | ✅     |
| **SellerProducts**     | `src/components/product/SellerProducts.tsx`     | More from this seller               | ✅     |
| **SimilarProducts**    | `src/components/product/SimilarProducts.tsx`    | Similar/recommended products        | ✅     |

### 🏪 Shop Detail Components (Needed)

| Component        | Path                                   | Purpose                                     | Status     |
| ---------------- | -------------------------------------- | ------------------------------------------- | ---------- |
| **ShopHeader**   | `src/components/shop/ShopHeader.tsx`   | Shop banner, logo, name, rating, follow     | ✅         |
| **ShopAbout**    | `src/components/shop/ShopAbout.tsx`    | Description, policies, contact              | ❌ CREATE  |
| **ShopStats**    | `src/components/shop/ShopStats.tsx`    | Products count, followers, sales, rating    | ❌ CREATE  |
| **ShopProducts** | `src/components/shop/ShopProducts.tsx` | Product grid with filters (already in page) | 🔄 EXTRACT |
| **ShopAuctions** | `src/components/shop/ShopAuctions.tsx` | Auction grid with filters (already in page) | 🔄 EXTRACT |
| **ShopReviews**  | `src/components/shop/ShopReviews.tsx`  | Shop review list and form                   | ❌ CREATE  |
| **ShopPolicies** | `src/components/shop/ShopPolicies.tsx` | Return, shipping, warranty policies         | ❌ CREATE  |

### 📂 Category Detail Components (Needed)

| Component                   | Path                                                  | Purpose                                     | Status     |
| --------------------------- | ----------------------------------------------------- | ------------------------------------------- | ---------- |
| **CategoryHeader**          | `src/components/category/CategoryHeader.tsx`          | Category name, image, description           | ❌ CREATE  |
| **CategoryBreadcrumb**      | `src/components/category/CategoryBreadcrumb.tsx`      | Breadcrumb navigation (use existing)        | ✅ EXISTS  |
| **SubcategoryGrid**         | `src/components/category/SubcategoryGrid.tsx`         | Child categories grid (already in page)     | 🔄 EXTRACT |
| **CategoryProducts**        | `src/components/category/CategoryProducts.tsx`        | Product grid with filters (already in page) | 🔄 EXTRACT |
| **CategoryStats**           | `src/components/category/CategoryStats.tsx`           | Product count, seller count, price range    | ❌ CREATE  |
| **SimilarCategories**       | `src/components/category/SimilarCategories.tsx`       | Related categories                          | ✅ EXISTS  |
| **CategoryFeaturedSellers** | `src/components/category/CategoryFeaturedSellers.tsx` | Top sellers in category                     | ❌ CREATE  |

### 🔨 Auction Detail Components (Needed)

| Component              | Path                                            | Purpose                                                  | Status    |
| ---------------------- | ----------------------------------------------- | -------------------------------------------------------- | --------- |
| **AuctionGallery**     | `src/components/auction/AuctionGallery.tsx`     | Image/video gallery (reuse ProductGallery)               | 🔄 REUSE  |
| **AuctionInfo**        | `src/components/auction/AuctionInfo.tsx`        | Current bid, time left, reserve, bid button              | ❌ CREATE |
| **LiveCountdown**      | `src/components/auction/LiveCountdown.tsx`      | Real-time countdown timer                                | ✅ EXISTS |
| **LiveBidHistory**     | `src/components/auction/LiveBidHistory.tsx`     | Live bid feed with real-time updates                     | ✅ EXISTS |
| **AutoBidSetup**       | `src/components/auction/AutoBidSetup.tsx`       | Auto-bid configuration                                   | ✅ EXISTS |
| **AuctionDescription** | `src/components/auction/AuctionDescription.tsx` | Description, condition, specs (reuse ProductDescription) | 🔄 REUSE  |
| **AuctionReviews**     | `src/components/auction/AuctionReviews.tsx`     | Seller reviews (reuse ShopReviews)                       | 🔄 REUSE  |
| **AuctionSellerInfo**  | `src/components/auction/AuctionSellerInfo.tsx`  | Seller info, shop link, contact                          | ❌ CREATE |
| **SimilarAuctions**    | `src/components/auction/SimilarAuctions.tsx`    | Similar ongoing auctions                                 | ❌ CREATE |

### 🎨 Implementation Plan

#### Phase 1: Extract Existing Inline Sections (4-6 hours)

**Shop Page Sections** (`src/app/shops/[slug]/page.tsx`):

- Extract products tab content → `ShopProducts.tsx`
- Extract auctions tab content → `ShopAuctions.tsx`
- Add filter and view mode props

**Category Page Sections** (`src/app/categories/[slug]/page.tsx`):

- Extract subcategories section → `SubcategoryGrid.tsx`
- Extract products section → `CategoryProducts.tsx`
- Add filter and sort props

#### Phase 2: Create Missing Shop Components (3-5 hours)

```tsx
// src/components/shop/ShopAbout.tsx
interface ShopAboutProps {
  description: string;
  established?: Date;
  location?: string;
  policies: {
    returnPolicy?: string;
    shippingPolicy?: string;
    warrantyPolicy?: string;
  };
  contactInfo: {
    email?: string;
    phone?: string;
    whatsapp?: string;
  };
}

// Features:
// - Formatted description with line breaks
// - Shop establishment date
// - Location display
// - Contact buttons (email, call, WhatsApp)
// - Policy tabs/accordion
```

```tsx
// src/components/shop/ShopStats.tsx
interface ShopStatsProps {
  productCount: number;
  auctionCount: number;
  followerCount: number;
  rating: number;
  reviewCount: number;
  totalSales?: number;
  responseTime?: string; // "Within 2 hours"
  shipmentTime?: string; // "1-2 days"
}

// Features:
// - Grid of stat cards
// - Icons for each stat
// - Responsive layout (2x2 → 3x2 → 4x2)
// - Animated count-up on scroll
```

```tsx
// src/components/shop/ShopReviews.tsx
interface ShopReviewsProps {
  shopId: string;
  initialReviews?: Review[];
  allowReview: boolean; // User must have purchased
}

// Features:
// - Reuse ReviewList component
// - Filter by rating (5★, 4★, etc.)
// - Sort by recent/helpful
// - Review form (if eligible)
// - Average rating breakdown (5★: 60%, 4★: 30%...)
```

#### Phase 3: Create Category Components (2-4 hours)

```tsx
// src/components/category/CategoryHeader.tsx
interface CategoryHeaderProps {
  name: string;
  description?: string;
  image?: string;
  productCount: number;
  parentCategory?: { name: string; slug: string };
}

// Features:
// - Large banner with category image
// - Category name and description
// - Product count badge
// - Parent category link
```

```tsx
// src/components/category/CategoryStats.tsx
interface CategoryStatsProps {
  productCount: number;
  sellerCount: number;
  priceRange: { min: number; max: number };
  avgRating?: number;
  topBrands?: string[];
}

// Features:
// - Price range display (₹1,000 - ₹50,000)
// - Number of sellers
// - Average product rating
// - Popular brands in category
```

#### Phase 4: Create Auction Components (3-5 hours)

```tsx
// src/components/auction/AuctionInfo.tsx
interface AuctionInfoProps {
  auctionId: string;
  currentBid: number;
  reservePrice?: number;
  reserveMet: boolean;
  buyNowPrice?: number;
  bidCount: number;
  timeLeft: number; // milliseconds
  minBidIncrement: number;
  userMaxBid?: number; // For auto-bid display
  canBid: boolean;
  onPlaceBid: (amount: number) => Promise<void>;
  onBuyNow?: () => Promise<void>;
}

// Features:
// - Large current bid display
// - Reserve price indicator
// - Time left (use LiveCountdown)
// - Bid input with increment buttons
// - Buy now button (if available)
// - Bid history link
// - Watch button
```

```tsx
// src/components/auction/AuctionSellerInfo.tsx
interface AuctionSellerInfoProps {
  seller: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
    reviewCount: number;
    memberSince: Date;
  };
  shop: {
    id: string;
    name: string;
    slug: string;
  };
}

// Features:
// - Seller avatar and name
// - Seller rating and review count
// - Member since date
// - Shop link button
// - Contact seller button
// - View seller's auctions link
```

#### Phase 5: Documentation & Testing (2-4 hours)

- Update component documentation
- Add Storybook stories for new components
- Write unit tests for new components
- Update detail pages to use new components
- Test responsive layouts
- Test dark mode

### 📊 Benefits Summary

| Improvement                                   | Impact                          | Lines Saved      |
| --------------------------------------------- | ------------------------------- | ---------------- |
| Extract ShopProducts/ShopAuctions             | Reusable in seller dashboard    | ~300 lines       |
| Extract CategoryProducts/SubcategoryGrid      | Reusable in search results      | ~250 lines       |
| Create ShopAbout/Stats/Reviews/Policies       | Consistent shop detail pages    | ~400 lines       |
| Create CategoryHeader/Stats/FeaturedSellers   | Consistent category pages       | ~300 lines       |
| Create AuctionInfo/SellerInfo/SimilarAuctions | Consistent auction detail pages | ~350 lines       |
| Reuse ProductGallery for AuctionGallery       | No duplicate gallery code       | ~200 lines       |
| **Total**                                     | -                               | **~1,800 lines** |

### ✅ Validation Checklist

**Product Detail Sections**:

- [ ] ProductGallery works with images and videos
- [ ] ProductInfo shows accurate stock and pricing
- [ ] ProductDescription renders markdown properly
- [ ] ProductReviews loads and submits correctly
- [ ] ProductVariants shows same-category alternatives
- [ ] SellerProducts filters by shop correctly
- [ ] SimilarProducts shows relevant recommendations

**Shop Detail Sections**:

- [ ] ShopHeader displays correctly with follow button
- [ ] ShopAbout renders policies and contact info
- [ ] ShopStats displays accurate counts
- [ ] ShopProducts has working filters and pagination
- [ ] ShopAuctions shows ongoing auctions
- [ ] ShopReviews allows eligible users to review

**Category Detail Sections**:

- [ ] CategoryHeader shows proper breadcrumb
- [ ] SubcategoryGrid navigates correctly
- [ ] CategoryProducts has working filters
- [ ] CategoryStats shows accurate data

**Auction Detail Sections**:

- [ ] AuctionInfo bid input validates correctly
- [ ] LiveCountdown updates in real-time
- [ ] LiveBidHistory shows latest bids
- [ ] AutoBidSetup saves preferences
- [ ] AuctionSellerInfo links work

**General**:

- [ ] All sections work in dark mode
- [ ] All sections are mobile responsive
- [ ] All sections handle loading states
- [ ] All sections handle error states

### 🎯 Success Criteria

1. ✅ All product detail components documented and working
2. ✅ Shop detail page has 6+ reusable section components
3. ✅ Category detail page has 5+ reusable section components
4. ✅ Auction detail page has 7+ reusable section components
5. ✅ ProductGallery reused for AuctionGallery
6. ✅ ReviewList reused across product/shop/auction pages
7. ✅ All sections support dark mode
8. ✅ All sections are mobile responsive
9. ✅ Consistent section structure across all detail pages
10. ✅ Filters and sorting work in all grid sections
11. ✅ Real-time updates work in auction sections
12. ✅ All sections have proper error handling

### 📝 Files to Modify/Create

**Shop Components**:
| File | Action |
| ---------------------------------------------- | --------- |
| `src/components/shop/ShopAbout.tsx` | CREATE |
| `src/components/shop/ShopStats.tsx` | CREATE |
| `src/components/shop/ShopProducts.tsx` | EXTRACT |
| `src/components/shop/ShopAuctions.tsx` | EXTRACT |
| `src/components/shop/ShopReviews.tsx` | CREATE |
| `src/components/shop/ShopPolicies.tsx` | CREATE |

**Category Components**:
| File | Action |
| ----------------------------------------------------- | ------- |
| `src/components/category/CategoryHeader.tsx` | CREATE |
| `src/components/category/SubcategoryGrid.tsx` | EXTRACT |
| `src/components/category/CategoryProducts.tsx` | EXTRACT |
| `src/components/category/CategoryStats.tsx` | CREATE |
| `src/components/category/CategoryFeaturedSellers.tsx` | CREATE |

**Auction Components**:
| File | Action |
| ---------------------------------------------------- | ------ |
| `src/components/auction/AuctionGallery.tsx` | ALIAS |
| `src/components/auction/AuctionInfo.tsx` | CREATE |
| `src/components/auction/AuctionDescription.tsx` | ALIAS |
| `src/components/auction/AuctionSellerInfo.tsx` | CREATE |
| `src/components/auction/SimilarAuctions.tsx` | CREATE |

**Pages to Update**:
| File | Changes |
| -------------------------------------- | ---------------------------------------------- |
| `src/app/shops/[slug]/page.tsx` | Use ShopProducts, ShopAuctions, ShopAbout, etc |
| `src/app/categories/[slug]/page.tsx` | Use CategoryHeader, SubcategoryGrid, etc |
| `src/app/auctions/[slug]/page.tsx` | Use AuctionInfo, AuctionGallery, etc |

### 🚀 Estimated Effort Breakdown

| Phase                               | Hours     |
| ----------------------------------- | --------- |
| Phase 1: Extract Inline Sections    | 4-6       |
| Phase 2: Create Shop Components     | 3-5       |
| Phase 3: Create Category Components | 2-4       |
| Phase 4: Create Auction Components  | 3-5       |
| Phase 5: Documentation & Testing    | 2-4       |
| **Total**                           | **12-18** |

---

## Task 25: Validation Consolidation & Address Selector Updates 🔐

### 🎯 Problem Statement

The codebase has validation logic scattered across multiple files with inconsistent messages and rules. Additionally, forms use `SmartAddressForm` directly instead of `AddressSelectorWithCreate`, missing the opportunity for users to select existing addresses quickly.

### 🔍 Current Issues

1. **Validation messages duplicated** across 50+ files (Zod schemas, form components, API routes)
2. **Inconsistent error messages** for same validation (e.g., "Email invalid" vs "Please enter valid email")
3. **Hardcoded validation rules** (min/max lengths, patterns) repeated everywhere
4. **No centralized validation constants** - changes require updating multiple files
5. **SmartAddressForm used directly** in wizards instead of selector with dropdown
6. **GPS validation not needed** - adds complexity and permission issues for simple forms
7. **No reusable validation helpers** - same logic reimplemented multiple times
8. **API and frontend validations differ** - leads to inconsistent UX

### 📊 Current Validation Files

| File                                        | Purpose                   | Issues                       |
| ------------------------------------------- | ------------------------- | ---------------------------- |
| `src/lib/validations/*.schema.ts`           | Zod schemas (7 files)     | Hardcoded messages and rules |
| `src/lib/form-validation.ts`                | Generic validators        | Separate from Zod schemas    |
| `src/lib/validation/inline-edit-schemas.ts` | Inline edit validation    | Different messages           |
| `src/app/api/lib/validation-middleware.ts`  | API validation            | Different from frontend      |
| `src/components/forms/*.tsx`                | Form component validation | Inline validation logic      |
| `src/hooks/useSlugValidation.ts`            | Async validation          | Unique but inconsistent      |

### ✅ Solution: Centralized Validation Constants

Created `src/constants/validation-messages.ts` with:

1. **VALIDATION_RULES** - All min/max lengths, patterns, ranges
2. **VALIDATION_MESSAGES** - All error messages (consistent across app)
3. **Validation Helpers** - Reusable functions (isValidEmail, isValidPhone, etc.)

**Benefits**:

- ✅ Single source of truth for all validation rules
- ✅ Consistent error messages across frontend and API
- ✅ Easy to update rules globally (e.g., change min password length)
- ✅ TypeScript autocomplete for all messages
- ✅ Reusable helpers reduce code duplication
- ✅ Better maintainability and testability

### 🔄 Migration Strategy

#### Phase 1: Update Zod Schemas (4-6 hours)

Replace hardcoded values with constants:

**Before**:

```ts
// src/lib/validations/address.schema.ts
export const addressSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be less than 100 characters"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
});
```

**After**:

```ts
// src/lib/validations/address.schema.ts
import {
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
} from "@/constants/validation-messages";

export const addressSchema = z.object({
  fullName: z
    .string()
    .min(VALIDATION_RULES.NAME.MIN_LENGTH, VALIDATION_MESSAGES.NAME.TOO_SHORT)
    .max(VALIDATION_RULES.NAME.MAX_LENGTH, VALIDATION_MESSAGES.NAME.TOO_LONG),
  phone: z
    .string()
    .regex(VALIDATION_RULES.PHONE.PATTERN, VALIDATION_MESSAGES.PHONE.INVALID),
  pincode: z
    .string()
    .regex(
      VALIDATION_RULES.ADDRESS.PINCODE.PATTERN,
      VALIDATION_MESSAGES.ADDRESS.PINCODE_INVALID,
    ),
});
```

**Files to Update** (7 Zod schema files):

- `src/lib/validations/address.schema.ts`
- `src/lib/validations/product.schema.ts`
- `src/lib/validations/shop.schema.ts`
- `src/lib/validations/auction.schema.ts`
- `src/lib/validations/category.schema.ts`
- `src/lib/validations/review.schema.ts`
- `src/lib/validations/user.schema.ts`

#### Phase 2: Update Form Components (3-5 hours)

Replace inline validation with centralized helpers:

**Before**:

```tsx
// Some form component
const validateEmail = (email: string) => {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Invalid email address";
  }
  return null;
};
```

**After**:

```tsx
import {
  isValidEmail,
  VALIDATION_MESSAGES,
} from "@/constants/validation-messages";

const validateEmail = (email: string) => {
  if (!isValidEmail(email)) {
    return VALIDATION_MESSAGES.EMAIL.INVALID;
  }
  return null;
};
```

#### Phase 3: Replace SmartAddressForm with AddressSelectorWithCreate (4-6 hours)

**Shop Creation Wizard** - Currently uses SmartAddressForm:

**Before**:

```tsx
// src/components/seller/shop-wizard/ContactLegalStep.tsx
<SmartAddressForm
  value={formData.businessAddress}
  onChange={(address) => onChange("businessAddress", address)}
  mode="inline"
  showGPS={true} // ❌ Not needed - adds complexity
  required
/>
```

**After**:

```tsx
// src/components/seller/shop-wizard/ContactLegalStep.tsx
<AddressSelectorWithCreate
  value={formData.businessAddressId}
  onChange={(id, address) => {
    onChange("businessAddressId", id);
    if (address) {
      onChange("businessAddress", address); // Store full object if needed
    }
  }}
  userId={user.uid}
  addressType="work"
  required
  placeholder="Select business address or add new"
  showCreateButton
/>
// User can:
// 1. Select from existing saved addresses (dropdown)
// 2. Click "New" to open SmartAddressForm modal
// 3. SmartAddressForm saves to user addresses collection
// 4. New address auto-selected in dropdown
```

**Benefits**:

- ✅ Faster workflow - select existing address in 1 click
- ✅ Reuses saved addresses across wizards, forms, checkout
- ✅ GPS only shown when user explicitly creates new address
- ✅ Consistent UX - same pattern everywhere

**Files to Update**:
| File | Change |
| ---- | ------ |
| `src/components/seller/shop-wizard/ContactLegalStep.tsx` | Replace SmartAddressForm |
| `src/components/seller/product-wizard/ShippingStep.tsx` | Add AddressSelectorWithCreate |
| `src/components/seller/auction-wizard/PickupStep.tsx` | Add AddressSelectorWithCreate |
| `src/app/checkout/page.tsx` | Use AddressSelectorWithCreate (already planned) |
| `src/app/user/settings/addresses/page.tsx` | Keep SmartAddressForm for CRUD |

#### Phase 4: Remove Unnecessary GPS Validation (2-3 hours)

**Issues with GPS**:

1. ❌ Permission prompts interrupt user flow
2. ❌ Doesn't work in all browsers/devices
3. ❌ Not accurate for business addresses
4. ❌ Adds complexity for simple "select address" flow
5. ❌ Users prefer typing known addresses

**Keep GPS**:

- ✅ In SmartAddressForm modal (optional feature)
- ✅ User explicitly clicks "Use GPS" button
- ✅ Only for creating NEW addresses

**Remove GPS**:

- ❌ From inline forms
- ❌ From wizard steps
- ❌ As required validation
- ❌ From address selectors

**Changes**:

```tsx
// src/components/common/SmartAddressForm.tsx
interface SmartAddressFormProps {
  // ...
  showGPS?: boolean; // Keep as optional feature
  requireGPS?: boolean; // ❌ REMOVE - never require GPS
}

// Remove GPS validation errors:
// ❌ "GPS permission denied"
// ❌ "Location not available"
// ❌ "GPS timeout"
```

#### Phase 5: Update API Validation Middleware (2-4 hours)

Ensure API uses same validation constants:

**Before**:

```ts
// src/app/api/products/route.ts
if (data.name.length < 3) {
  return NextResponse.json({ error: "Name too short" }, { status: 400 });
}
```

**After**:

```ts
import {
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
} from "@/constants/validation-messages";

if (data.name.length < VALIDATION_RULES.PRODUCT.NAME.MIN_LENGTH) {
  return NextResponse.json(
    { error: VALIDATION_MESSAGES.PRODUCT.NAME_TOO_SHORT },
    { status: 400 },
  );
}
```

#### Phase 6: Update Tests (3-4 hours)

Update test assertions to use centralized messages:

**Before**:

```ts
expect(error).toBe("Email is required");
```

**After**:

```ts
import { VALIDATION_MESSAGES } from "@/constants/validation-messages";

expect(error).toBe(VALIDATION_MESSAGES.REQUIRED.FIELD("Email"));
```

### 📊 Benefits Summary

| Improvement                          | Impact                       | Lines Saved      |
| ------------------------------------ | ---------------------------- | ---------------- |
| Centralized validation constants     | Single source of truth       | ~500 lines       |
| Consistent error messages            | Better UX                    | N/A              |
| Reusable validation helpers          | Less duplication             | ~300 lines       |
| AddressSelectorWithCreate in wizards | Faster address entry         | ~400 lines       |
| Remove GPS requirement               | Better UX, less errors       | ~200 lines       |
| Update API validation                | Frontend/backend consistency | ~100 lines       |
| **Total**                            | -                            | **~1,500 lines** |

### ✅ Validation Checklist

**Centralized Constants**:

- [x] Created `src/constants/validation-messages.ts`
- [x] All VALIDATION_RULES defined
- [x] All VALIDATION_MESSAGES defined
- [x] Validation helper functions added

**Schema Updates (UI - Priority #1)**:

- [ ] address.schema.ts uses constants
- [ ] product.schema.ts uses constants
- [ ] shop.schema.ts uses constants
- [ ] auction.schema.ts uses constants
- [ ] category.schema.ts uses constants
- [ ] review.schema.ts uses constants
- [ ] user.schema.ts uses constants

**Form Component Updates (UI - Priority #1)**:

- [ ] Form components use validation helpers
- [ ] Error messages consistent with constants
- [ ] No hardcoded validation rules

**Address Selector Updates (UI - Priority #1)**:

- [ ] Shop wizard uses AddressSelectorWithCreate
- [ ] Product wizard uses AddressSelectorWithCreate
- [ ] Auction wizard uses AddressSelectorWithCreate
- [ ] Checkout page uses AddressSelectorWithCreate
- [ ] GPS removed from required validations
- [ ] GPS kept as optional feature in SmartAddressForm

**API Updates (Backend - Priority #1)**:

- [ ] API routes use VALIDATION_RULES
- [ ] API error messages use VALIDATION_MESSAGES
- [ ] Frontend and API validations match

**Test Updates (Priority #5)**:

- [ ] Test assertions use VALIDATION_MESSAGES
- [ ] Validation helper tests added
- [ ] All tests passing

### 🎯 Success Criteria

1. ✅ All validation rules in one constants file
2. ✅ All error messages consistent across app
3. ✅ Zod schemas use centralized constants
4. ✅ Form components use validation helpers
5. ✅ API validation matches frontend validation
6. ✅ AddressSelectorWithCreate used in all wizards
7. ✅ Users can select existing addresses quickly
8. ✅ GPS not required for address entry
9. ✅ GPS available as optional feature
10. ✅ No hardcoded validation messages in code
11. ✅ All tests updated and passing
12. ✅ TypeScript shows autocomplete for all messages

### 📝 Files to Create/Modify

**New Files**:
| File | Purpose |
| ---- | ------- |
| `src/constants/validation-messages.ts` | ✅ Created - Centralized validation constants |

**Update Zod Schemas** (7 files):
| File | Changes |
| ---- | ------- |
| `src/lib/validations/address.schema.ts` | Use VALIDATION_RULES and VALIDATION_MESSAGES |
| `src/lib/validations/product.schema.ts` | Use VALIDATION_RULES and VALIDATION_MESSAGES |
| `src/lib/validations/shop.schema.ts` | Use VALIDATION_RULES and VALIDATION_MESSAGES |
| `src/lib/validations/auction.schema.ts` | Use VALIDATION_RULES and VALIDATION_MESSAGES |
| `src/lib/validations/category.schema.ts` | Use VALIDATION_RULES and VALIDATION_MESSAGES |
| `src/lib/validations/review.schema.ts` | Use VALIDATION_RULES and VALIDATION_MESSAGES |
| `src/lib/validations/user.schema.ts` | Use VALIDATION_RULES and VALIDATION_MESSAGES |

**Update Form Components**:
| File | Changes |
| ---- | ------- |
| `src/lib/form-validation.ts` | Use validation helpers from constants |
| `src/components/common/SmartAddressForm.tsx` | Remove requireGPS, keep showGPS as optional |
| `src/components/seller/shop-wizard/ContactLegalStep.tsx` | Replace with AddressSelectorWithCreate |
| `src/components/seller/product-wizard/ShippingStep.tsx` | Add AddressSelectorWithCreate |
| `src/components/seller/auction-wizard/PickupStep.tsx` | Add AddressSelectorWithCreate |

**Update API Routes** (20+ files):
| Pattern | Changes |
| ------- | ------- |
| `src/app/api/*/route.ts` | Use VALIDATION_RULES and VALIDATION_MESSAGES |

**Update Tests**:
| Pattern | Changes |
| ------- | ------- |
| `**/*.test.ts` | Update assertions to use VALIDATION_MESSAGES |

### 🚀 Estimated Effort Breakdown

| Phase                                           | Hours     | Priority |
| ----------------------------------------------- | --------- | -------- |
| Phase 1: Update Zod Schemas (UI)                | 4-6       | **#1**   |
| Phase 2: Update Form Components (UI)            | 3-5       | **#1**   |
| Phase 3: Replace SmartAddressForm with Selector | 4-6       | **#1**   |
| Phase 4: Remove Unnecessary GPS Validation      | 2-3       | **#1**   |
| Phase 5: Update API Validation (Backend)        | 2-4       | **#1**   |
| Phase 6: Update Tests                           | 3-4       | **#5**   |
| **Total**                                       | **16-24** | -        |

### 📋 Detailed Implementation Tasks

#### Task 25.1: Update Zod Schemas to Use Constants (UI) ⚡ Priority #1

**Effort**: 4-6 hours

**Files to Update**:

```bash
# Frontend Zod schemas
src/lib/validations/address.schema.ts
src/lib/validations/product.schema.ts
src/lib/validations/shop.schema.ts
src/lib/validations/auction.schema.ts
src/lib/validations/category.schema.ts
src/lib/validations/review.schema.ts
src/lib/validations/user.schema.ts
```

**Steps**:

1. Import VALIDATION_RULES and VALIDATION_MESSAGES
2. Replace hardcoded min/max values with VALIDATION_RULES.\*.MIN_LENGTH
3. Replace hardcoded regex patterns with VALIDATION_RULES.\*.PATTERN
4. Replace hardcoded error strings with VALIDATION_MESSAGES.\*
5. Test each schema with sample data

**Example Changes**:

```ts
// Before
z.string().min(2, "Name must be at least 2 characters");

// After
import {
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
} from "@/constants/validation-messages";
z.string().min(
  VALIDATION_RULES.NAME.MIN_LENGTH,
  VALIDATION_MESSAGES.NAME.TOO_SHORT,
);
```

---

#### Task 25.2: Update Form Components to Use Helpers (UI) ⚡ Priority #1

**Effort**: 3-5 hours

**Files to Update**:

```bash
# Form validation utilities
src/lib/form-validation.ts

# Form components with inline validation
src/components/forms/*.tsx
src/components/checkout/*.tsx
src/components/seller/*-wizard/*.tsx
```

**Steps**:

1. Import validation helpers (isValidEmail, isValidPhone, etc.)
2. Replace inline regex with helper functions
3. Replace hardcoded error messages with VALIDATION_MESSAGES
4. Test form validation in browser

**Example Changes**:

```ts
// Before
const validateEmail = (email: string) => {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Invalid email";
  }
};

// After
import {
  isValidEmail,
  VALIDATION_MESSAGES,
} from "@/constants/validation-messages";
const validateEmail = (email: string) => {
  if (!isValidEmail(email)) {
    return VALIDATION_MESSAGES.EMAIL.INVALID;
  }
};
```

---

#### Task 25.3: Update API Routes to Use Constants (Backend) ⚡ Priority #1

**Effort**: 2-4 hours

**Files to Update**:

```bash
# API route handlers
src/app/api/products/route.ts
src/app/api/shops/route.ts
src/app/api/auctions/route.ts
src/app/api/categories/route.ts
src/app/api/reviews/route.ts
src/app/api/users/route.ts
src/app/api/addresses/route.ts

# API validation middleware
src/app/api/lib/validation-middleware.ts
```

**Steps**:

1. Import VALIDATION_RULES and VALIDATION_MESSAGES in each API route
2. Replace hardcoded validation checks with VALIDATION_RULES
3. Replace hardcoded error messages with VALIDATION_MESSAGES
4. Test API endpoints with invalid data
5. Verify error messages match frontend

**Example Changes**:

```ts
// Before
if (data.name.length < 3) {
  return NextResponse.json({ error: "Name too short" }, { status: 400 });
}

// After
import {
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
} from "@/constants/validation-messages";
if (data.name.length < VALIDATION_RULES.PRODUCT.NAME.MIN_LENGTH) {
  return NextResponse.json(
    { error: VALIDATION_MESSAGES.PRODUCT.NAME_TOO_SHORT },
    { status: 400 },
  );
}
```

---

#### Task 25.4: Create and Integrate AddressSelectorWithCreate ⚡ Priority #1

**Effort**: 4-6 hours

**Steps**:

1. Verify AddressSelectorWithCreate component (from Task 23 Phase 4)
2. Replace SmartAddressForm in shop wizard
3. Replace SmartAddressForm in product wizard
4. Replace SmartAddressForm in auction wizard
5. Update checkout page
6. Test address selection and creation flow

**Files to Update**:

```bash
src/components/seller/shop-wizard/ContactLegalStep.tsx
src/components/seller/product-wizard/ShippingStep.tsx
src/components/seller/auction-wizard/PickupStep.tsx
src/app/checkout/page.tsx
```

---

#### Task 25.5: Remove GPS Requirement ⚡ Priority #1

**Effort**: 2-3 hours

**Steps**:

1. Update SmartAddressForm to make showGPS optional (not required)
2. Remove requireGPS prop if exists
3. Remove GPS validation errors from forms
4. Keep GPS as optional feature in modal
5. Test address forms without GPS

**Files to Update**:

```bash
src/components/common/SmartAddressForm.tsx
src/components/common/GPSButton.tsx
src/components/checkout/AddressForm.tsx
```

---

## Updated Summary Statistics

| Task                                       | Priority     | Effort (hours) | Status |
| ------------------------------------------ | ------------ | -------------- | ------ |
| Task 1: Large Files                        | HIGH         | 12-18          | ⬜     |
| Task 2: Constants Usage                    | HIGH         | 8-12           | ⬜     |
| Task 3: New Constants                      | MEDIUM       | 4-6            | ⬜     |
| Task 4: HTML Wrappers                      | HIGH         | 8-12           | ⬜     |
| Task 5: Sieve Processing                   | HIGH         | 6-10           | ⬜     |
| Task 6: Wizard Navigation                  | HIGH         | 4-6            | ⬜     |
| Task 7: Category/Shop Display              | MEDIUM       | 4-6            | ⬜     |
| Task 8: API Debouncing                     | HIGH         | 4-6            | ⬜     |
| Task 9: Performance                        | MEDIUM       | 6-10           | ⬜     |
| Task 10: Graph View                        | MEDIUM       | 6-8            | ⬜     |
| Task 11: Mobile/Dark Mode                  | HIGH         | 8-12           | 🔄     |
| Task 12: Code Quality                      | MEDIUM       | 4-6            | ⬜     |
| Task 13: Accessibility                     | MEDIUM       | 4-6            | ⬜     |
| Task 14: Test Coverage                     | LOW          | 8-12           | ⬜     |
| **Task 15: User Verification**             | **CRITICAL** | **20-30**      | ⬜     |
| **Task 16: IP Tracking**                   | **HIGH**     | **6-8**        | ⬜     |
| **Task 17: Events System**                 | **MEDIUM**   | **24-32**      | ⬜     |
| **Task 18: Nav/Filter/Dark**               | **HIGH**     | **16-24**      | 🔄     |
| **Task 19: URL Params/Pagination**         | **HIGH**     | **20-28**      | ⬜     |
| **Task 20: Firestore Indexes**             | **HIGH**     | **2-4**        | ✅     |
| **Task 21: Navigation Cleanup**            | **HIGH**     | **6-12**       | ⬜     |
| **Task 22: Hooks/Contexts Consolidation**  | **HIGH**     | **16-24**      | ⬜     |
| **Task 23: Form/Wizard Reusability**       | **HIGH**     | **30-44**      | ⬜     |
| **Task 24: Detail Page Sections**          | **MEDIUM**   | **12-18**      | ⬜     |
| **Task 25: Validation & Selector Updates** | **HIGH**     | **16-24**      | ⬜     |
| **TOTAL**                                  | -            | **254-378**    | -      |

### Progress Summary

| Category                 | Fixed | Remaining |
| ------------------------ | ----- | --------- |
| User Page Dark Mode      | 2     | 10+       |
| Seller Page Dark Mode    | 0     | 5+        |
| Admin Page Dark Mode     | 0     | 6+        |
| Firestore Indexes        | 3     | Monitor   |
| Search Issues            | 3     | 2         |
| Hooks Consolidation      | 0     | 30+ files |
| Context Hydration Checks | 0     | 3         |

### Reusable Code Summary

| Category            | Existing | To Create | Underutilized |
| ------------------- | -------- | --------- | ------------- |
| Hooks               | 15       | 5         | 8             |
| Contexts            | 5        | 0         | 3             |
| Utility Functions   | 20+      | 0         | Many          |
| Form Components     | 8        | 14        | ✅ Well used  |
| Selector Components | 3        | 11        | ⚠️ New        |
| Value Components    | 20+      | 0         | ⚠️ Underused  |

---

_Document maintained by: AI Agent_
_Last Updated: December 3, 2025_
