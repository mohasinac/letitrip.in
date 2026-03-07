# Listing Pages & Filter System

> Comprehensive reference for all listing views, filter components, URL-state hooks, and filter utilities in `letitrip.in`.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [URL State Hooks](#2-url-state-hooks)
   - [useUrlTable](#21-useurltable)
   - [usePendingTable](#22-usependingtable)
3. [Filter Primitives (Tier 1 UI)](#3-filter-primitives-tier-1-ui)
   - [FilterFacetSection](#31-filterfacetsection)
   - [SwitchFilter](#32-switchfilter)
   - [RangeFilter](#33-rangefilter)
4. [Filter Utilities](#4-filter-utilities)
5. [Domain Filter Components (Tier 1 Shared)](#5-domain-filter-components-tier-1-shared)
   - [ProductFilters](#51-productfilters)
   - [ReviewFilters](#52-reviewfilters)
   - [BlogFilters](#53-blogfilters)
   - [EventFilters](#54-eventfilters)
   - [CategoryFilters](#55-categoryfilters)
   - [UserFilters](#56-userfilters)
   - [OrderFilters](#57-orderfilters)
   - [BidFilters](#58-bidfilters)
   - [CouponFilters](#59-couponfilters)
   - [FaqFilters](#510-faqfilters)
   - [SessionFilters](#511-sessionfilters)
   - [CarouselFilters](#512-carouselfilters)
   - [HomepageSectionFilters](#513-homepagesectionfilters)
   - [NewsletterFilters](#514-newsletterfilters)
   - [NotificationFilters](#515-notificationfilters)
   - [PayoutFilters](#516-payoutfilters)
   - [RipCoinFilters](#517-ripcoinfilters)
   - [EventEntryFilters](#518-evententryfilters)
6. [Public Listing Views](#6-public-listing-views)
7. [User Listing Views](#7-user-listing-views)
8. [Seller Listing Views](#8-seller-listing-views)
9. [Admin Listing Views (selected)](#9-admin-listing-views-selected)
10. [Pattern Reference](#10-pattern-reference)

---

## 1. Architecture Overview

All filter/sort/pagination state lives in URL query params. This makes every listing page:

- **Bookmark-safe** — share any filtered/sorted/paginated state as a URL
- **History-friendly** — back/forward works correctly
- **SSR-compatible** — server can read params for initial render

```
ListingLayout                    ← shell (FilterDrawer, Search, Sort, ActiveChips, Pagination slots)
  └─ <DomainFilters table={pendingTable} />   ← writes staged state only
  └─ useUrlTable / usePendingTable            ← owns committed URL state
```

**Two filter-commit patterns** exist in the codebase:

| Pattern                    | Hook                            | How filters apply                                 |
| -------------------------- | ------------------------------- | ------------------------------------------------- |
| **Staged (correct)**       | `usePendingTable`               | User clicks "Apply" → URL updates once            |
| **Inline staged (legacy)** | Manual `useState` + `useEffect` | Same UX but more boilerplate — should be migrated |

New views must use `usePendingTable`. The inline-staged views are listed under [Pattern Reference](#10-pattern-reference).

---

## 2. URL State Hooks

### 2.1 `useUrlTable`

**File:** `src/hooks/useUrlTable.ts`  
**Import:** `import { useUrlTable } from '@/hooks';`

Manages all list state via `next/navigation` `useSearchParams` + `useRouter`. Every `set()` / `setMany()` calls `router.replace()` — never `router.push()`.

```ts
const table = useUrlTable({
  defaults: { pageSize: "25", sort: "-createdAt", status: "pending" },
});
```

**API:**

| Method              | Signature                                    | Notes                                                 |
| ------------------- | -------------------------------------------- | ----------------------------------------------------- |
| `get`               | `(key: string) => string`                    | Returns param, or default, or `""`                    |
| `getNumber`         | `(key: string, fallback?: number) => number` | Parses param as int; returns fallback on NaN          |
| `set`               | `(key: string, value: string) => void`       | Writes one param; resets `page` → `"1"` automatically |
| `setMany`           | `(updates: Record<string, string>) => void`  | Batch writes; same page-reset logic                   |
| `clear`             | `(keys?: string[]) => void`                  | Removes specified keys (or all) and resets page       |
| `setPage`           | `(page: number) => void`                     | Writes `page` without resetting it                    |
| `setPageSize`       | `(n: number) => void`                        | Writes `pageSize`                                     |
| `setSort`           | `(v: string) => void`                        | Writes `sort` or `sorts`                              |
| `buildSieveParams`  | `(sieveFilters: SieveFilter[]) => string`    | Builds `?filters=…&sorts=…&page=…&pageSize=…`         |
| `buildSearchParams` | `() => string`                               | Builds `?q=…&sort=…&page=…&pageSize=…`                |

**Rules:**

- Never use `router.push()` for filter changes — `set()` uses `replace()` internally.
- Always include `table.params.toString()` in the `useApiQuery` `queryKey` to bust the cache when params change.
- `page` is automatically reset to `"1"` on any filter/sort change — no manual reset needed.

---

### 2.2 `usePendingTable`

**File:** `src/hooks/usePendingTable.ts`  
**Import:** `import { usePendingTable } from '@/hooks';`

Wraps `usePendingFilters` to provide a `PendingTable` that satisfies the `UrlTable` interface. Staged filters are held in local state until the user clicks **Apply** — only then are they flushed to the URL.

```ts
const { pendingTable, filterActiveCount, onFilterApply, onFilterClear } =
  usePendingTable(table, ["status", "rating", "minPrice", "maxPrice"]);
```

**Parameters:**

- `table` — the `UrlTable` from `useUrlTable`
- `stagedKeys` — array of URL param keys to stage (everything else passes directly to the real table)

**Returns:**

| Field               | Type         | Description                                                             |
| ------------------- | ------------ | ----------------------------------------------------------------------- |
| `pendingTable`      | `UrlTable`   | Pass to the filter component — reads/writes staged state                |
| `filterActiveCount` | `number`     | Count of keys in `stagedKeys` that have a non-empty committed URL value |
| `onFilterApply`     | `() => void` | Flush staged state → URL (pass to `ListingLayout.onFilterApply`)        |
| `onFilterClear`     | `() => void` | Clear staged state + remove all `stagedKeys` from URL                   |

**Usage pattern (canonical):**

```tsx
const table = useUrlTable({ defaults: { pageSize: '25' } });
const { pendingTable, filterActiveCount, onFilterApply, onFilterClear } =
  usePendingTable(table, ['status', 'category', 'minPrice', 'maxPrice']);

// Pass pendingTable to the filter component, and real table everywhere else:
<ListingLayout
  filterContent={<ProductFilters table={pendingTable} />}
  filterActiveCount={filterActiveCount}
  onFilterApply={onFilterApply}
  onFilterClear={onFilterClear}
  sortSlot={<SortDropdown value={table.get('sort')} ... />}
/>
```

---

## 3. Filter Primitives (Tier 1 UI)

These live in `src/components/ui/` and `src/components/filters/`. They are generic — no domain knowledge.

### 3.1 `FilterFacetSection`

**File:** `src/components/ui/FilterFacetSection.tsx`  
**Import:** `import { FilterFacetSection } from '@/components';`

A collapsible group of checkboxes (multi) or radios (single) with optional inline search and "Load more".

| Prop               | Type                                                 | Default   | Description                                     |
| ------------------ | ---------------------------------------------------- | --------- | ----------------------------------------------- |
| `title`            | `string`                                             | required  | Section heading                                 |
| `options`          | `{ value: string; label: string; count?: number }[]` | required  | All available options                           |
| `selected`         | `string[]`                                           | required  | Currently selected values                       |
| `onChange`         | `(selected: string[]) => void`                       | required  | Called with full new selection                  |
| `searchable`       | `boolean`                                            | `true`    | Show inline search input                        |
| `pageSize`         | `number`                                             | `10`      | Options shown before "Load more"                |
| `defaultCollapsed` | `boolean`                                            | `false`   | Section starts collapsed                        |
| `maxSelections`    | `number`                                             | —         | Cap on simultaneous selections (multi only)     |
| `showSelectAll`    | `boolean`                                            | `false`   | "Select all / Deselect all" toggle (multi only) |
| `selectionMode`    | `"multi" \| "single"`                                | `"multi"` | Checkbox vs radio behaviour                     |
| `className`        | `string`                                             | `""`      |                                                 |

Shows a small badge with the count of selected values in the header. Automatically disables unselected options when `maxSelections` is reached.

---

### 3.2 `SwitchFilter`

**File:** `src/components/filters/SwitchFilter.tsx`  
**Import:** `import { SwitchFilter } from '@/components';`

A collapsible section containing a single Toggle switch. Used for binary/boolean fields.

| Prop               | Type                         | Default  | Description            |
| ------------------ | ---------------------------- | -------- | ---------------------- |
| `title`            | `string`                     | required | Section heading        |
| `label`            | `string`                     | required | Text beside the toggle |
| `checked`          | `boolean`                    | required | Current ON/OFF state   |
| `onChange`         | `(checked: boolean) => void` | required |                        |
| `defaultCollapsed` | `boolean`                    | `false`  |                        |
| `className`        | `string`                     | `""`     |                        |

**Convention:** callers store `"true"` in the URL param when ON, `""` (empty) when OFF:

```tsx
<SwitchFilter
  title={t("featured")}
  label={t("showFeaturedOnly")}
  checked={table.get("featured") === "true"}
  onChange={(v) => table.set("featured", v ? "true" : "")}
/>
```

---

### 3.3 `RangeFilter`

**File:** `src/components/filters/RangeFilter.tsx`  
**Import:** `import { RangeFilter } from '@/components';`

A collapsible section with min/max inputs. Supports numeric (price) and date ranges. Shows a badge `1` in the header if either value is set; provides a "Clear range" button.

| Prop                              | Type                  | Default    | Description                |
| --------------------------------- | --------------------- | ---------- | -------------------------- |
| `title`                           | `string`              | required   | Section heading            |
| `minValue`                        | `string`              | required   | Controlled min             |
| `maxValue`                        | `string`              | required   | Controlled max             |
| `onMinChange`                     | `(v: string) => void` | required   |                            |
| `onMaxChange`                     | `(v: string) => void` | required   |                            |
| `type`                            | `"number" \| "date"`  | `"number"` | Input type                 |
| `prefix`                          | `string`              | —          | Symbol prefix (e.g. `"₹"`) |
| `minLabel / maxLabel`             | `string`              | —          | Labels above inputs        |
| `minPlaceholder / maxPlaceholder` | `string`              | —          |                            |
| `defaultCollapsed`                | `boolean`             | `true`     |                            |
| `className`                       | `string`              | `""`       |                            |

---

## 4. Filter Utilities

**File:** `src/components/filters/filterUtils.ts`  
**Import:** `import { getFilterLabel, getFilterValue, FilterOption } from '@/components';`

Two pure helpers for working with any `{ value: string; label: string }[]` options array.

```ts
type FilterOption = { value: string; label: string };

getFilterLabel(options: ReadonlyArray<FilterOption>, value: string): string | undefined
getFilterValue(options: ReadonlyArray<FilterOption>, label: string): string | undefined
```

Use `getFilterLabel` when building `ActiveFilter` chips (replacing inline `.find()` patterns):

```ts
// ✅ correct
const label = getFilterLabel(statusOptions, statusFilter) ?? statusFilter;

// ❌ avoid
const label =
  statusOptions.find((o) => o.value === statusFilter)?.label ?? statusFilter;
```

---

## 5. Domain Filter Components (Tier 1 Shared)

All domain filter components live in `src/components/filters/` and are exported from `@/components`. They all accept a `table: UrlTable` prop and render `FilterFacetSection`, `SwitchFilter`, and/or `RangeFilter` sections. Pass `pendingTable` (from `usePendingTable`) for staged-filter UX.

**`UrlTable` interface** (source of truth: `src/components/filters/ProductFilters.tsx`):

```ts
interface UrlTable {
  get: (key: string) => string;
  set: (key: string, value: string) => void;
  setMany: (updates: Record<string, string>) => void;
}
```

---

### 5.1 `ProductFilters`

**Exports:** `ProductFilters`, `PRODUCT_CONDITION_OPTIONS`  
**Props:**

| Prop              | Type             | Required | Description                           |
| ----------------- | ---------------- | -------- | ------------------------------------- |
| `table`           | `UrlTable`       | ✓        |                                       |
| `categoryOptions` | `FilterOption[]` | ✓        | Dynamic — load from API               |
| `brandOptions`    | `FilterOption[]` | —        | Dynamic from products                 |
| `sellerOptions`   | `FilterOption[]` | —        | Dynamic from stores                   |
| `tagOptions`      | `FilterOption[]` | —        | Dynamic from product tags             |
| `showStatus`      | `boolean`        | —        | Show status facet (admin/seller only) |
| `statusOptions`   | `FilterOption[]` | —        | Defaults to published/draft/archived  |

**URL params written:**

| Param                      | Multi       | Values                                 |
| -------------------------- | ----------- | -------------------------------------- |
| `category`                 | `\|`-joined | dynamic                                |
| `condition`                | `\|`-joined | `new`, `used`, `refurbished`, `broken` |
| `minPrice`, `maxPrice`     | n/a         | numeric (₹)                            |
| `brand`                    | single      | dynamic                                |
| `seller`                   | single      | dynamic                                |
| `tags`                     | `\|`-joined | dynamic                                |
| `status` (if `showStatus`) | `\|`-joined | `published`, `draft`, `archived`       |

---

### 5.2 `ReviewFilters`

**Exports:** `ReviewFilters`, `REVIEW_SORT_OPTIONS`  
**Sort options:** `["-createdAt", "createdAt", "-rating", "rating"]` with i18n keys `sortNewest`, `sortOldest`, `sortHighestRated`, `sortLowestRated`

| Prop      | Type                  | Default   |
| --------- | --------------------- | --------- |
| `table`   | `UrlTable`            | required  |
| `variant` | `"admin" \| "public"` | `"admin"` |

**URL params written:**

| Param      | Visible in | Values                                         |
| ---------- | ---------- | ---------------------------------------------- |
| `status`   | admin      | `\|`-joined: `pending`, `approved`, `rejected` |
| `rating`   | both       | `\|`-joined: `5`,`4`,`3`,`2`,`1`               |
| `verified` | admin      | SwitchFilter: `"true"` / `""`                  |
| `featured` | admin      | SwitchFilter: `"true"` / `""`                  |

---

### 5.3 `BlogFilters`

**Exports:** `BlogFilters`, `BLOG_SORT_OPTIONS`  
**Sort options:** `-createdAt`, `createdAt`, `title`, `-title`, `-views`, `-readTimeMinutes`, `-publishedAt`, `publishedAt`

| Param        | Values                                                        |
| ------------ | ------------------------------------------------------------- |
| `status`     | `\|`-joined: `draft`, `published`, `archived`                 |
| `category`   | `\|`-joined: `news`, `tips`, `guides`, `updates`, `community` |
| `isFeatured` | SwitchFilter: `"true"` / `""`                                 |

---

### 5.4 `EventFilters`

**Exports:** `EventFilters`, `EVENT_SORT_OPTIONS`  
**Sort options:** `title`, `-title`, `-startsAt`, `startsAt`, `-endsAt`, `endsAt`, `-stats.totalEntries`, `-createdAt`

| Param                | Values                                                |
| -------------------- | ----------------------------------------------------- |
| `type`               | single: `sale`, `offer`, `poll`, `survey`, `feedback` |
| `status`             | single: `draft`, `active`, `paused`, `ended`          |
| `dateFrom`, `dateTo` | RangeFilter `type="date"`                             |

---

### 5.5 `CategoryFilters`

**Exports:** `CategoryFilters`, `CATEGORY_SORT_OPTIONS`  
**Sort options:** `name`, `-name`, `order`, `tier`, `-metrics.productCount`, `-metrics.totalItemCount`, `-createdAt`

All facets are `selectionMode="single"`:

| Param          | Values                                 |
| -------------- | -------------------------------------- |
| `tier`         | `1` (Top-level), `2` (Sub), `3` (Leaf) |
| `isActive`     | `true`, `false`                        |
| `isFeatured`   | `true`, `false`                        |
| `isSearchable` | `true`, `false`                        |
| `isLeaf`       | `true`, `false`                        |

---

### 5.6 `UserFilters`

**Exports:** `UserFilters`, `USER_SORT_OPTIONS`  
**Sort options:** `-createdAt`, `createdAt`, `displayName`, `-displayName`, `role`, `-updatedAt`

| Param                      | Type                      | Values                                    |
| -------------------------- | ------------------------- | ----------------------------------------- |
| `role`                     | `\|`-joined               | `user`, `seller`, `moderator`, `admin`    |
| `emailVerified`            | SwitchFilter              | `"true"` / `""`                           |
| `disabled`                 | SwitchFilter              | `"true"` / `""` (shows disabled accounts) |
| `storeStatus`              | `\|`-joined               | `pending`, `approved`, `rejected`         |
| `createdFrom`, `createdTo` | RangeFilter `type="date"` |                                           |

---

### 5.7 `OrderFilters`

**Exports:** `OrderFilters`, `ORDER_ADMIN_SORT_OPTIONS`, `ORDER_SELLER_SORT_OPTIONS`  
**Props:** `table`, `variant?: "admin" | "seller"` (default `"admin"`)  
**Sort (admin):** `-createdAt`, `createdAt`, `-totalPrice`, `totalPrice`, `-orderDate`, `orderDate`, `userName`, `productTitle`  
**Sort (seller):** Same minus `productTitle`

| Param                    | Visible in | Values                                                                               |
| ------------------------ | ---------- | ------------------------------------------------------------------------------------ |
| `status`                 | both       | `\|`-joined: `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`, `returned` |
| `paymentStatus`          | both       | `\|`-joined: `pending`, `paid`, `failed`, `refunded`                                 |
| `payoutStatus`           | admin only | `\|`-joined: `eligible`, `requested`, `paid`                                         |
| `minAmount`, `maxAmount` | both       | RangeFilter `type="number"` (₹)                                                      |
| `dateFrom`, `dateTo`     | both       | RangeFilter `type="date"`                                                            |

---

### 5.8 `BidFilters`

**Exports:** `BidFilters`, `BID_SORT_OPTIONS`  
**Sort:** `-bidAmount`, `bidAmount`, `-bidDate`, `bidDate`, `-createdAt`

| Param                    | Values                                                 |
| ------------------------ | ------------------------------------------------------ |
| `status`                 | single: `active`, `outbid`, `won`, `lost`, `cancelled` |
| `isWinning`              | SwitchFilter: `"true"` / `""`                          |
| `minAmount`, `maxAmount` | RangeFilter `type="number"` (₹)                        |

---

### 5.9 `CouponFilters`

**Exports:** `CouponFilters`, `COUPON_SORT_OPTIONS`  
**Sort:** `code`, `-code`, `name`, `-discount.value`, `discount.value`, `-validity.endDate`, `validity.endDate`, `-createdAt`, `createdAt`

| Param                | Values                                                        |
| -------------------- | ------------------------------------------------------------- |
| `type`               | single: `percentage`, `fixed`, `free_shipping`, `buy_x_get_y` |
| `validityIsActive`   | SwitchFilter: `"true"` / `""`                                 |
| `dateFrom`, `dateTo` | RangeFilter `type="date"`                                     |

---

### 5.10 `FaqFilters`

**Exports:** `FaqFilters`, `FAQ_SORT_OPTIONS`  
**Sort:** `question`, `-question`, `-stat.helpful`, `-stat.notHelpful`, `-stat.views`, `-createdAt`, `createdAt`

| Param      | Values                                                                                |
| ---------- | ------------------------------------------------------------------------------------- |
| `category` | single: `general`, `products`, `shipping`, `returns`, `payment`, `account`, `sellers` |
| `isActive` | SwitchFilter: `"true"` / `""`                                                         |

---

### 5.11 `SessionFilters`

**Exports:** `SessionFilters`, `SESSION_SORT_OPTIONS`  
**Sort:** `-lastActivity`, `lastActivity`, `-expiresAt`, `expiresAt`, `-createdAt`

| Param      | Values                  |
| ---------- | ----------------------- |
| `isActive` | single: `true`, `false` |

---

### 5.12 `CarouselFilters`

**Exports:** `CarouselFilters`, `CAROUSEL_SORT_OPTIONS`  
**Sort:** `order`, `-order`, `-createdAt`, `createdAt`, `-updatedAt`

| Param    | Values                  |
| -------- | ----------------------- |
| `active` | single: `true`, `false` |

---

### 5.13 `HomepageSectionFilters`

**Exports:** `HomepageSectionFilters`, `HOMEPAGE_SECTION_SORT_OPTIONS`  
**Sort:** `order`, `-order`, `-createdAt`, `createdAt`, `-updatedAt`

| Param     | Values                                                                                                                                                         |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`    | single: `welcome`, `trust_indicators`, `categories`, `products`, `auctions`, `banner`, `features`, `reviews`, `whatsapp`, `faq`, `blog_articles`, `newsletter` |
| `enabled` | single: `true`, `false`                                                                                                                                        |

---

### 5.14 `NewsletterFilters`

**Exports:** `NewsletterFilters`, `NEWSLETTER_SORT_OPTIONS`  
**Sort:** `email`, `-email`, `-subscribedAt`, `subscribedAt`, `-createdAt`

| Param    | Values                                                               |
| -------- | -------------------------------------------------------------------- |
| `status` | single: `active`, `unsubscribed`                                     |
| `source` | single: `footer`, `homepage`, `checkout`, `popup`, `admin`, `import` |

---

### 5.15 `NotificationFilters`

**Exports:** `NotificationFilters`, `NOTIFICATION_SORT_OPTIONS`  
**Sort:** `-createdAt`, `createdAt`, `priority`, `-priority`

| Param         | Values                                                                                                                                                                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`        | single: `order_placed`, `order_confirmed`, `order_shipped`, `order_delivered`, `order_cancelled`, `payment_received`, `payment_failed`, `bid_placed`, `bid_won`, `bid_outbid`, `review_posted`, `review_approved`, `product_approved`, `product_rejected`, `system` |
| `priority`    | single: `low`, `normal`, `high`                                                                                                                                                                                                                                     |
| `isRead`      | single: `true`, `false`                                                                                                                                                                                                                                             |
| `relatedType` | single: `order`, `product`, `bid`, `review`, `blog`, `user`                                                                                                                                                                                                         |

---

### 5.16 `PayoutFilters`

**Exports:** `PayoutFilters`, `PAYOUT_SORT_OPTIONS`  
**Sort:** `-requestedAt`, `requestedAt`, `-processedAt`, `-amount`, `amount`, `sellerName`, `-createdAt`

| Param                    | Multi       | Values                                         |
| ------------------------ | ----------- | ---------------------------------------------- |
| `status`                 | `\|`-joined | `pending`, `processing`, `completed`, `failed` |
| `paymentMethod`          | `\|`-joined | `bank_transfer`, `upi`                         |
| `minAmount`, `maxAmount` | n/a         | RangeFilter `type="number"` (₹)                |

---

### 5.17 `RipCoinFilters`

**Exports:** `RipCoinFilters`, `RIPCOIN_SORT_OPTIONS`  
**Sort:** `-createdAt`, `createdAt`, `-amount`, `amount`

| Param  | Values                                                                                      |
| ------ | ------------------------------------------------------------------------------------------- |
| `type` | single: `purchase`, `engage`, `release`, `forfeit`, `return`, `admin_grant`, `admin_deduct` |

---

### 5.18 `EventEntryFilters`

**Exports:** `EventEntryFilters`, `EVENT_ENTRY_SORT_OPTIONS`  
**Sort:** `-submittedAt`, `submittedAt`, `-points`, `points`, `userDisplayName`

| Param          | Values                                   |
| -------------- | ---------------------------------------- |
| `reviewStatus` | single: `pending`, `approved`, `flagged` |

---

## 6. Public Listing Views

### `ProductsView`

**File:** `src/features/products/components/ProductsView.tsx`  
**Route:** `/products`  
**Filter:** Inline staged state (legacy — no `usePendingTable`, no `ProductFilters` component)  
**Filter pattern:** Raw `FilterFacetSection` for `category` + `RangeFilter` for price  
**Sort param:** `sort`  
**Sort options:** Newest, Oldest, Price Low→High, Price High→Low, Name A→Z, Name Z→A (`PRODUCT_SORT_VALUES`)  
**Default sort:** `PRODUCT_SORT_VALUES.NEWEST`  
**URL params:** `q`, `category` (comma-joined), `minPrice`, `maxPrice`, `sort`, `page`

---

### `AuctionsView`

**File:** `src/features/products/components/AuctionsView.tsx`  
**Route:** `/auctions`  
**Filter:** Inline staged state (legacy)  
**Filter content:** Raw `FilterFacetSection` with 4 price buckets (`PRICE_BUCKETS`: ₹0–500, ₹500–2000, ₹2000–10000, ₹10000+)  
**Sort param:** `sort`  
**Sort options:** Ending Soon, Ending Latest, Lowest Bid, Highest Bid, Most Bids  
**Default sort:** `"auctionEndDate"`  
**URL params:** `q`, `priceRange`, `sort`, `page`

---

### `BlogListView`

**File:** `src/features/blog/components/BlogListView.tsx`  
**Route:** `/blog`  
**Filter component:** Inline staged `FilterFacetSection` for `category` using `BLOG_CATEGORY_TABS` options (not `BlogFilters`)  
**Sort param:** `sort`  
**Sort options:** Newest, Oldest, Title A→Z  
**Default sort:** `"-publishedAt"`  
**URL params:** `q`, `category`, `sort`, `page`

---

### `EventsListView`

**File:** `src/features/events/components/EventsListView.tsx`  
**Route:** `/events`  
**Filter:** Inline staged (legacy)  
**Filter content:** Raw `FilterFacetSection` for `status` + `type`  
**Sort param:** `sort`  
**Sort options (keys):** `-startsAt` (Newest), `endsAt` (Ending Soon), `-endsAt` (Ending Latest)  
**Default sort:** `"-startsAt"`  
**URL params:** `q`, `status`, `type`, `sort`, `page`

---

### `StoresListView`

**File:** `src/features/stores/components/StoresListView.tsx`  
**Route:** `/stores`  
**Filter:** None — search only  
**Sort param:** `sorts` (Sieve)  
**Sort options:** Newest, Oldest, Name A→Z, Name Z→A, Most Products  
**Default sort:** `"-createdAt"`  
**URL params:** `q`, `sorts`, `page`

---

### `CategoriesListView`

**File:** `src/features/categories/components/CategoriesListView.tsx`  
**Route:** `/categories`  
**Filter:** None — client-side string search only  
**Sort:** None  
**URL params:** `q` only

---

### `CategoryProductsView`

**File:** `src/features/categories/components/CategoryProductsView.tsx`  
**Route:** `/categories/[slug]`  
**Filter:** Inline staged (legacy) — `FilterFacetSection` with `PRICE_BUCKET_KEYS` (₹0–500, ₹500–2000, ₹2000–10000, ₹10000+)  
**Sort param:** `sort`  
**Sort options:** Uses `PRODUCT_SORT_VALUES`  
**URL params:** `q`, `sort`, `page`, price bucket param

---

### `ReviewsListView`

**File:** `src/features/reviews/components/ReviewsListView.tsx`  
**Route:** `/reviews`  
**Filter component:** `ReviewFilters` with `variant="public"` — rating only  
**Staged via:** `usePendingTable(table, ["rating"])`  
**Sort param:** `sorts`  
**Sort options:** `REVIEW_SORT_OPTIONS` (Newest, Oldest, Highest Rated, Lowest Rated)  
**Default sort:** `"-rating"`  
**URL params:** `q`, `rating`, `sorts`, `page`

---

## 7. User Listing Views

### `UserNotificationsView`

**File:** `src/features/user/components/UserNotificationsView.tsx`  
**Route:** `/account/notifications`  
**Filter:** Inline raw `FilterFacetSection` for `type` (no staged/pending pattern)  
**Sort:** None — chronological only  
**URL params:** `q`, `type`, `page`

---

## 8. Seller Listing Views

### `SellerProductsView`

**File:** `src/features/seller/components/SellerProductsView.tsx`  
**Route:** `/seller/products`  
**Filter component:** `ProductFilters` with `showStatus`, dynamic `categoryOptions`  
**Staged via:** `usePendingTable(table, ["status", "category", "condition", "minPrice", "maxPrice"])`  
**Sort param:** `sort`  
**Sort options:** Newest, Oldest, Title A→Z, Price High→Low, Price Low→High  
**Default sort:** `"-createdAt"`  
**URL params:** `q`, `status`, `category`, `condition`, `minPrice`, `maxPrice`, `sort`, `page`

---

### `SellerOrdersView`

**File:** `src/features/seller/components/SellerOrdersView.tsx`  
**Route:** `/seller/orders`  
**Filter component:** `OrderFilters` with `variant="seller"`  
**Staged via:** `usePendingTable` (staged keys include `status`, `paymentStatus`, `minAmount`, `maxAmount`, `dateFrom`, `dateTo`)  
**Sort param:** `sorts` (Sieve)  
**Sort options:** `ORDER_SELLER_SORT_OPTIONS` (Newest, Oldest, Amount High→Low, Amount Low→High, Order Date, Customer A→Z)  
**Default sort:** `"-orderDate"`  
**URL params:** `q`, `sorts`, `page` + all filter params above

---

### `SellerAuctionsView`

**File:** `src/features/seller/components/SellerAuctionsView.tsx`  
**Route:** `/seller/auctions`  
**Filter:** Inline raw `FilterFacetSection` for `status` (no `usePendingTable`, no `EventFilters`)  
**Sort param:** `sorts`  
**Default sort:** `"-createdAt"`  
**URL params:** `q`, `status`, `sorts`, `page`

---

## 9. Admin Listing Views (selected)

### `AdminReviewsView`

**File:** `src/features/admin/components/AdminReviewsView.tsx`  
**Route:** `/admin/reviews`  
**Filter component:** `ReviewFilters` with `variant="admin"`  
**Staged via:** `usePendingTable(table, ["status", "rating", "verified", "featured"])`  
**Sort param:** `sort`  
**Sort options:** `REVIEW_SORT_OPTIONS` (Newest, Oldest, Highest Rated, Lowest Rated)  
**Default sort:** `"-createdAt"`, default status: `"pending"`  
**URL params:** `q`, `status`, `rating`, `verified`, `featured`, `sort`, `page`

---

## 10. Pattern Reference

### Staged-filter pattern comparison

#### ✅ Canonical — `usePendingTable`

```tsx
const table = useUrlTable({ defaults: { pageSize: "25" } });
const { pendingTable, filterActiveCount, onFilterApply, onFilterClear } =
  usePendingTable(table, ["status", "rating"]);

<ListingLayout
  filterContent={<ReviewFilters table={pendingTable} variant="public" />}
  filterActiveCount={filterActiveCount}
  onFilterApply={onFilterApply}
  onFilterClear={onFilterClear}
/>;
```

Used by: `ReviewsListView`, `SellerProductsView`, `SellerOrdersView`, `AdminReviewsView`

#### ⚠️ Legacy — inline staged state

```tsx
const [staged, setStaged] = useState(filter ? [filter] : []);
useEffect(() => setStaged(filter ? [filter] : []), [filter]);
const onApply = () => table.set("rating", staged[0] || "");
```

Used by: `ProductsView`, `AuctionsView`, `BlogListView`, `EventsListView`, `CategoryProductsView`, `SellerAuctionsView`, `UserNotificationsView`

Migrate to `usePendingTable` when touching these views.

---

### Sort param naming

| Param name | Used by                               | Backend                       |
| ---------- | ------------------------------------- | ----------------------------- |
| `sort`     | Public views, most seller/admin views | Custom search endpoint        |
| `sorts`    | Sieve-backed endpoints                | Sieve DSL (`-field` for desc) |

---

### Multi-select URL encoding

| Encoding                | Used by                                                                                                                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `\|`-joined (`a\|b\|c`) | `ProductFilters`, `ReviewFilters` (status), `OrderFilters`, `BidFilters`, `PayoutFilters`, `UserFilters`                                                                                          |
| Comma-joined (`a,b,c`)  | Some legacy public views (`ProductsView.category`)                                                                                                                                                |
| Single value            | `CategoryFilters`, `SessionFilters`, `CarouselFilters`, `HomepageSectionFilters`, `NewsletterFilters`, `NotificationFilters`, `RipCoinFilters`, `EventEntryFilters`, `FaqFilters`, `EventFilters` |

---

### `ActiveFilterChips` — building chip data

```ts
import { getFilterLabel } from "@/components";

const activeFilters = useMemo<ActiveFilter[]>(() => {
  const chips: ActiveFilter[] = [];
  if (statusFilter)
    chips.push({
      key: "status",
      label: t("filterStatus"),
      value: getFilterLabel(statusOptions, statusFilter) ?? statusFilter,
    });
  return chips;
}, [statusFilter, statusOptions, t]);
```

Never use raw `.find((o) => o.value === x)?.label` — always use `getFilterLabel`.
