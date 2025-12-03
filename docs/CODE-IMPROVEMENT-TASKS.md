# Code Improvement Tasks

> **Generated**: December 3, 2025
> **Status**: Analysis Complete - Ready for Implementation
> **Estimated Total Effort**: 86-130 hours (with reusable components)
> **Potential Lines Saved**: ~13,000 lines via shared components
> **Total Tasks**: 17 improvement areas identified

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

## Updated Summary Statistics

| Task                               | Priority     | Effort (hours) | Status |
| ---------------------------------- | ------------ | -------------- | ------ |
| Task 1: Large Files                | HIGH         | 12-18          | ⬜     |
| Task 2: Constants Usage            | HIGH         | 8-12           | ⬜     |
| Task 3: New Constants              | MEDIUM       | 4-6            | ⬜     |
| Task 4: HTML Wrappers              | HIGH         | 8-12           | ⬜     |
| Task 5: Sieve Processing           | HIGH         | 6-10           | ⬜     |
| Task 6: Wizard Navigation          | HIGH         | 4-6            | ⬜     |
| Task 7: Category/Shop Display      | MEDIUM       | 4-6            | ⬜     |
| Task 8: API Debouncing             | HIGH         | 4-6            | ⬜     |
| Task 9: Performance                | MEDIUM       | 6-10           | ⬜     |
| Task 10: Graph View                | MEDIUM       | 6-8            | ⬜     |
| Task 11: Mobile/Dark Mode          | HIGH         | 8-12           | 🔄     |
| Task 12: Code Quality              | MEDIUM       | 4-6            | ⬜     |
| Task 13: Accessibility             | MEDIUM       | 4-6            | ⬜     |
| Task 14: Test Coverage             | LOW          | 8-12           | ⬜     |
| **Task 15: User Verification**     | **CRITICAL** | **20-30**      | ⬜     |
| **Task 16: IP Tracking**           | **HIGH**     | **6-8**        | ⬜     |
| **Task 17: Events System**         | **MEDIUM**   | **24-32**      | ⬜     |
| **Task 18: Nav/Filter/Dark**       | **HIGH**     | **16-24**      | 🔄     |
| **Task 19: URL Params/Pagination** | **HIGH**     | **20-28**      | ⬜     |
| **Task 20: Firestore Indexes**     | **HIGH**     | **2-4**        | ✅     |
| **Task 21: Navigation Cleanup**    | **HIGH**     | **6-12**       | ⬜     |
| **TOTAL**                          | -            | **180-268**    | -      |

### Progress Summary

| Category              | Fixed | Remaining |
| --------------------- | ----- | --------- |
| User Page Dark Mode   | 2     | 10+       |
| Seller Page Dark Mode | 0     | 5+        |
| Admin Page Dark Mode  | 0     | 6+        |
| Firestore Indexes     | 3     | Monitor   |
| Search Issues         | 3     | 2         |

---

_Document maintained by: AI Agent_
_Last Updated: December 3, 2025_
