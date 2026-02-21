# Comprehensive Frontend Refactor Plan

> **Status:** Audit complete — ready to implement (Feb 20, 2026)  
> **Scope:** All list pages · Filter drawers · Inline CRUD drawers · FAQ categories · Footer & Navigation · Constants hygiene

---

## Master Scope — Quick Reference

| #   | Area                                                    | Status   | Key deliverables                                                                                                            |
| --- | ------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------- |
| A   | **List pages** — pagination, filter, sort + view toggle | Audit ✅ | `useUrlTable`, `TablePagination`, `SortDropdown`, `DataTable` grid/list view, `AdminFilterBar withCard`, 15 page migrations |
| B   | **Filter left drawer** — searchable, paginated facets   | Audit ✅ | `FilterDrawer`, `FilterFacetSection`, `ActiveFilterChips` — all Tier 1 shared primitives; `SideDrawer` left-side prop       |
| C   | **Inline create via drawer** — categories + addresses   | Audit ✅ | `CategorySelectorCreate`, `AddressSelectorCreate`, `pickupAddressId` on `ProductForm`                                       |
| D   | **All CRUD as right drawers**                           | Audit ✅ | Seller product new/edit pages → drawers; audit remaining full-page CRUD                                                     |
| E   | **FAQ category tabs + `/faqs/[cat]` routes**            | Audit ✅ | Homepage tabs, dynamic route, `FAQCategorySidebar` URL links                                                                |
| F   | **Footer & navigation modernisation**                   | Audit ✅ | Add `lucide-react`, rewrite `EnhancedFooter`, fix `Footer`, update nav constants                                            |
| G   | **Constants audit — hardcoded string gaps**             | Audit ✅ | `EnhancedFooter`, `UserFilters`, `FAQCategorySidebar`, `SearchFiltersRow`                                                   |
| H   | **Gestures + accessibility**                            | Audit ✅ | `useSwipe`, `useLongPress`, `usePullToRefresh`; ARIA on all components; focus management                                    |
| I   | **Homepage sections**                                   | Audit ✅ | All 12 sections audited; swipeable mobile layouts; skeleton loading; merged TrustFeatures                                   |
| J   | **Dashboard page styling**                              | Audit ✅ | Admin/seller/user dashboards; stat cards; charts; `AdminPageHeader` standardisation                                         |
| K   | **Non-tech friendly UX**                                | Audit ✅ | Plain language; empty states; onboarding; helper text; human error messages; touch targets                                  |
| L   | **Code deduplication audit**                            | Audit ✅ | Remove confirmed duplicate components, routes, lib files; enforce base-form/extend pattern                                  |
| M   | **SEO — full-stack coverage**                           | Audit ✅ | Sitemap, robots, JSON-LD, per-page metadata, SEO model fields, media alt text, slug URLs                                    |

---

## Viewport Targets

Users access this app on mobile phones, standard desktop monitors, and widescreens (1440p/4K/ultrawide). Every component built in this refactor must be correct at all three.

| Class          | Breakpoint       | Tailwind prefix               | Key behaviour                                                                                          |
| -------------- | ---------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Mobile**     | < 640 px         | _(default)_                   | Full-screen drawers; hamburger/bottom nav; single-column; filter drawer replaces sidebar               |
| **Desktop**    | 640 px – 1535 px | `sm:` · `md:` · `lg:` · `xl:` | Partial drawers (`md:w-3/5`); sidebars visible at `lg+`; inline `AdminFilterBar`                       |
| **Widescreen** | ≥ 1536 px        | `2xl:`                        | Max-width cap (`max-w-screen-2xl`); wider drawers for complex forms; admin three-panel layout possible |

### Breakpoint decision map

| Component                                          | < lg (mobile/tablet)                             | ≥ lg (desktop)                                     | ≥ 2xl (widescreen)                           |
| -------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------- | -------------------------------------------- |
| `FilterDrawer`                                     | Opens from left on "Filters" button              | Not used — `ProductFilters` sidebar always visible | Same as lg                                   |
| `SideDrawer` (CRUD)                                | `w-full` (full screen)                           | `md:w-3/5`                                         | `lg:max-w-2xl` for `ProductForm` and similar |
| `AdminFilterBar` (`withCard=true`)                 | Collapses or scrolls horizontally                | Full inline grid                                   | Wider grid with more columns                 |
| `AdminFilterBar` (`withCard=false`, public/seller) | Collapses into `FilterDrawer` trigger button     | Inline row of controls                             | Same as lg                                   |
| Footer                                             | Single-column stack                              | `lg:grid-cols-5`                                   | Capped at `max-w-screen-2xl mx-auto`         |
| `DataTable`                                        | Horizontal scroll; grid/list toggle always shown | Full columns (table) or card grid (grid/list)      | Extra columns in table; wider grid cards     |
| `TablePagination`                                  | Compact (prev/next + page number)                | Full strip with per-page selector                  | Same as lg                                   |
| View toggle                                        | Only grid+list (table hidden — too wide)         | All three: table, grid, list                       | Same as lg                                   |

> **Widescreen rule:** No component or page layout stretches edge-to-edge on ≥ 1536 px. All page wrappers: `max-w-screen-2xl mx-auto px-4 lg:px-8 2xl:px-12`.

---

## Section A — List Pages: Pagination, Filtering & Sorting

> **Goal:** All filter, sort, search, and pagination state lives in the URL (query params). Every page is bookmark-able / shareable at any filter state. Replace all ad-hoc raw button pagination with the canonical `<Pagination>` component.

---

## Current State Audit

> Findings from reading every affected page file. Issues beyond the original planning notes are marked **🆕**.

### Admin Pages

| Page             | Lines | pageSize                             | Filter (Sieve)                                                   | Sort UI | Pagination UI         | queryKey                           |
| ---------------- | ----- | ------------------------------------ | ---------------------------------------------------------------- | ------- | --------------------- | ---------------------------------- |
| `admin/users`    | 257   | `500`                                | ✅ manual — tab→disabled/role, search→`@=*`                      | ❌ none | ❌ DataTable internal | local vars — not URL               |
| `admin/orders`   | 189   | `200`                                | ✅ manual — status tab                                           | ❌ none | ❌ DataTable internal | local vars — not URL               |
| `admin/products` | 283   | `200`                                | ❌ **none at all** — just `pageSize=200`, no status or search 🆕 | ❌ none | ❌ DataTable internal | `['admin','products']` — no filter |
| `admin/reviews`  | 367   | ❌ **none** — fetches all reviews 🆕 | ✅ manual — status, rating, search                               | ❌ none | ❌ DataTable internal | local vars — not URL               |
| `admin/bids`     | 240   | `200`                                | ✅ manual — status tab                                           | ❌ none | ❌ DataTable internal | local vars — not URL               |
| `admin/coupons`  | 235   | ❌ **none** — fetches all 🆕         | ❌ **none at all** — no search or filter 🆕                      | ❌ none | ❌ DataTable internal | `['admin','coupons']` — no filter  |
| `admin/faqs`     | 258   | ❌ **none** — fetches all            | ❌ **none at all** — no search or filter                         | ❌ none | ❌ DataTable internal | `['faqs','list']` — no filter      |

**Common admin issues:**

- All use `pageSize=200–500` — DataTable then client-slices for its internal page footer
- `queryKey` is individual local state variables, not `table.params.toString()` → cache invalidation is fragile
- No `sorts` param ever sent — server always returns `createdAt` order regardless of what DataTable shows
- `admin/reviews` sends no `pageSize` at all → API uses its own default; grows unbounded as reviews accumulate 🆕

### Public Pages

| Page                         | Lines | State                                    | Pagination UI                                                                      | Issues                                                                                                                                                                              |
| ---------------------------- | ----- | ---------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auctions/page.tsx`          | 138   | local `sort`, `page` — not URL           | raw `<button>` prev/next                                                           | Not URL-driven; `fetch()` instead of `apiClient.get()` 🆕                                                                                                                           |
| `blog/page.tsx`              | 133   | local `activeCategory`, `page` — not URL | raw `<Button>` prev/next                                                           | Not URL-driven; no result count shown                                                                                                                                               |
| `categories/[slug]/page.tsx` | 216   | local `sort`, `page` — not URL           | raw `<button>` prev/next                                                           | Not URL-driven; disabled bug: `products.length < PAGE_SIZE` (should be `page >= totalPages`)                                                                                        |
| `products/page.tsx`          | 255   | ✅ URL-driven via `useSearchParams`      | raw `<button>` prev/next — 3 copies (mobile strip, desktop sidebar, main) 🆕       | Uses `router.push()` not `router.replace()` — pollutes browser history on every filter keystroke 🆕; ~50 lines of manual `updateUrl` + `useEffect` sync that `useUrlTable` replaces |
| `search/page.tsx`            | 229   | ✅ URL-driven via `useSearchParams`      | callbacks `onPrevPage`/`onNextPage` → raw `<button>` inside `SearchResultsSection` | Manual `buildUrl` helper (~30 lines); `router.replace` ✅ but not via `useUrlTable`                                                                                                 |

### Seller Pages

| Page                       | Lines | State                           | Pagination UI | Issues                                                                                                                   |
| -------------------------- | ----- | ------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `seller/products/page.tsx` | 131   | local; hardcoded `pageSize=100` | ❌ none       | No filter, no search, no sort bar; data grows silently past 100                                                          |
| `seller/orders/page.tsx`   | 187   | local `statusFilter` only       | ❌ none       | No `page` param sent to API at all; revenue total calculates from current page subset, will be wrong after pagination 🆕 |

### User Pages

| Page                   | Lines | State                     | Pagination UI | Issues                                                                             |
| ---------------------- | ----- | ------------------------- | ------------- | ---------------------------------------------------------------------------------- |
| `user/orders/page.tsx` | 136   | none — fetches ALL orders | ❌ none       | No status filter, no pagination; uses non-standard `data?.data?.orders` nesting 🆕 |

---

## Infrastructure Already Complete

All API routes already accept and respect these params:

| Param      | Type         | Example                          |
| ---------- | ------------ | -------------------------------- |
| `page`     | number       | `1`                              |
| `pageSize` | number       | `25`                             |
| `filters`  | Sieve string | `status==pending`                |
| `sorts`    | Sieve string | `-createdAt` (prefix `-` = desc) |

The frontend just doesn't use them properly yet.

---

## What Will Be Built

### 1. `useUrlTable` Hook — `src/hooks/useUrlTable.ts`

A single URL-driven hook that replaces every page's hand-rolled `useSearchParams` + `updateUrl` / `buildUrl` / `useEffect` sync pattern.

```typescript
interface UseUrlTableOptions {
  defaults?: Record<string, string>; // used when param absent from URL
  resetPageOn?: string[]; // keys that reset page→1 on change
  // default: all except "page" / "pageSize"
}

interface UseUrlTableReturn {
  params: ReadonlyURLSearchParams;
  get: (key: string) => string;
  getNumber: (key: string, fallback?: number) => number;

  set: (key: string, value: string) => void;
  setMany: (updates: Record<string, string>) => void;
  clear: (keys?: string[]) => void;

  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSort: (sort: string) => void;

  buildSieveParams: (sieveFilters: string) => string;
  // → ?filters=<sieveFilters>&sorts=<sort>&page=<page>&pageSize=<pageSize>

  buildSearchParams: () => string;
  // → ?q=...&category=...&minPrice=...&maxPrice=...&sort=...&page=...&pageSize=...
}
```

**Key behaviours:**

- Reads from `useSearchParams()` — zero derived state, always in sync with URL
- Writes via `router.replace()` — never `router.push()` — won't pollute browser history
- `set()` auto-resets `page → "1"` unless key is `"page"` or `"pageSize"`
- `setMany()` batches into one navigation call

**What this eliminates (code to be deleted):**

| Page                         | Removed code                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------- |
| `products/page.tsx`          | `useState` for `category`/`minPrice`/`maxPrice`, `useEffect` URL sync, `updateUrl()` helper (~35 lines) |
| `search/page.tsx`            | `buildUrl()` helper, `debouncedPush` setup, page callbakcs (~30 lines)                                  |
| `auctions/page.tsx`          | `useState` for `sort`/`page`, `useMemo` URL builder                                                     |
| `blog/page.tsx`              | `useState` for `activeCategory`/`page`                                                                  |
| `categories/[slug]/page.tsx` | `useState` for `sort`/`page`, `useMemo` URL builder                                                     |
| All admin pages              | Individual filter `useState` vars + manual `filtersArr` builder                                         |

**Usage — admin page:**

```tsx
const table = useUrlTable({ defaults: { pageSize: "25", sort: "-createdAt" } });

const filtersArr: string[] = [];
if (table.get("status")) filtersArr.push(`status==${table.get("status")}`);
if (table.get("q")) filtersArr.push(`title@=*${table.get("q")}`);

const { data } = useApiQuery({
  queryKey: ["admin", "orders", table.params.toString()],
  queryFn: () =>
    apiClient.get(
      `${API_ENDPOINTS.ADMIN.ORDERS}${table.buildSieveParams(filtersArr.join(","))}`,
    ),
});
```

**Usage — public page:**

```tsx
const table = useUrlTable({
  defaults: { pageSize: "24", sort: "auctionEndDate" },
});

const { data } = useApiQuery({
  queryKey: ["auctions", table.params.toString()],
  queryFn: () =>
    apiClient.get(
      `${API_ENDPOINTS.PRODUCTS.LIST}${table.buildSieveParams("isAuction==true,status==published")}`,
    ),
});
```

---

### 2. `SortDropdown` Component — `src/components/ui/SortDropdown.tsx`

A labelled `<select>` for sort options, styled consistently.  
Fully controlled — `value` / `onChange`. Used by `AdminFilterBar`, and any page that needs a standalone sort control (public, seller, user). Import from `@/components`.

```typescript
interface SortOption {
  value: string;
  label: string;
}
interface SortDropdownProps {
  value: string;
  onChange: (sort: string) => void;
  options: SortOption[];
  label?: string; // default: UI_LABELS.TABLE.SORT_BY
  className?: string;
}
```

---

### 3. `TablePagination` Component — `src/components/ui/TablePagination.tsx`

Footer bar wrapping `<Pagination>` with a result count and optional per-page selector.

```typescript
interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[]; // default: [10, 25, 50, 100]
  isLoading?: boolean;
}
```

Renders: `[Showing 26–50 of 134 results]   [« ‹ 2 › »]   [Per page: 25 ▼]`

---

### 4. `DataTable` — Add `externalPagination` Prop

Remove `DataTable` internal pagination entirely. `DataTable` becomes a pure display component — no internal page state, no page slicing, no footer. Every call site gets `<TablePagination>` added directly below it. Update all call sites in the same PR.

---

### 5. `DataTable` — Grid / List / Table View Toggle

Add optional view-mode props so ANY page (public product listings, auctions, categories, search, seller products) can switch between table rows, card grids, and compact card lists — **without building a separate grid component**.

**`DataTable` already has `mobileCardRender`** — a prop that renders cards on mobile (`md:hidden`) while keeping the desktop table. The view toggle builds on this exact mechanism without adding duplicate functionality:

```typescript
interface DataTableProps<T> {
  // EXISTING — unchanged (backward compat):
  mobileCardRender?: (item: T) => ReactNode; // CSS-driven mobile card; still works when no viewMode

  // NEW view-mode props:
  showViewToggle?: boolean; // show toggle icons in toolbar; default: false
  viewMode?: "table" | "grid" | "list"; // controlled
  defaultViewMode?: "table" | "grid" | "list"; // uncontrolled default; default: 'table'
  onViewModeChange?: (mode: "table" | "grid" | "list") => void;
  // renderCard falls back to mobileCardRender; only needed if card layout differs per context:
  renderCard?: (item: T) => ReactNode;
}
```

**View mode behaviours:**

- `table` — existing row/column layout, unchanged
- `grid` — `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4`, renders `mobileCardRender` (or `renderCard`) per cell
- `list` — `flex flex-col gap-2`, renders card per row (compact)

**Toggle icons:** Inline SVGs — no external icon library required. Styled to match the existing SideDrawer close-button pattern:

```tsx
// Active:   bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 ring-indigo-300
// Inactive: THEME_CONSTANTS.themed.hover + ring-1 ring-gray-200 dark:ring-gray-700
// Shared:   p-2 rounded-lg transition-colors
```

On `xs` (mobile) only grid + list icons are shown — table mode is too wide for narrow viewports.

**URL integration — parent manages mode via `useUrlTable`:**

```tsx
const table = useUrlTable({ defaults: { view: 'grid' } });
<DataTable
  showViewToggle
  viewMode={(table.get('view') || 'grid') as 'table' | 'grid' | 'list'}
  onViewModeChange={(mode) => table.set('view', mode)}
  mobileCardRender={(product) => <ProductCard product={product} />}
  ...
/>
```

> Note: `view` param changes do **not** reset `page → 1` (handled in `useUrlTable.set()`).

**Pages enabling view toggle:**

| Page                         | Default | Available modes   | Mobile modes               |
| ---------------------------- | ------- | ----------------- | -------------------------- |
| `products/page.tsx`          | `grid`  | table, grid, list | grid, list                 |
| `auctions/page.tsx`          | `grid`  | grid, list        | grid, list                 |
| `categories/[slug]/page.tsx` | `grid`  | grid, list        | grid, list                 |
| `search/page.tsx`            | `grid`  | grid, list        | grid, list                 |
| `seller/products/page.tsx`   | `grid`  | table, grid       | grid only                  |
| Admin pages                  | `table` | table only        | — (`showViewToggle=false`) |

---

### 6. `AdminFilterBar` — Add `withCard` Prop (Reuse over New File)

**No new file.** `AdminFilterBar` already exists with exactly the right props (`children`, `columns`, `className`). Its only admin-specific trait is the `<Card>` wrapper. Adding a single `withCard` prop makes it serve both contexts:

```typescript
interface AdminFilterBarProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;   // unchanged
  className?: string;          // unchanged
  withCard?: boolean;          // NEW — default: true (zero breaking change)
}

// Public/seller pages — bare grid, no card:
<AdminFilterBar withCard={false} columns={2}>
  <SortDropdown ... />
  <Input placeholder={UI_PLACEHOLDERS.SEARCH} />
</AdminFilterBar>

// Admin pages — unchanged, Card wrapper included:
<AdminFilterBar columns={3}>
  <Input ... />
  <Select ... />
  <SortDropdown ... />
</AdminFilterBar>
```

Import path is unchanged: `import { AdminFilterBar } from '@/components'`. All existing admin pages continue working without modification.

---

### 7. `SearchResultsSection` — Replace Callbacks with `onPageChange`

Currently accepts `onPrevPage` / `onNextPage` and renders raw `<button>`.

**Change:** Replace with `currentPage`, `totalPages`, `onPageChange` props using `<Pagination>`. `search/page.tsx` passes `(page) => table.setPage(page)`.

---

## API Param Styles

Two conventions in use — do not mix on the same endpoint:

### Style A — Sieve (`/api/products`, `/api/admin/*`, `/api/seller/*`)

```
?filters=status==published,category==electronics&sorts=-createdAt&page=2&pageSize=25
```

- `sorts` (with **s**), sign prefix for direction

### Style B — Named params (`/api/search` only)

```
?q=shoes&category=footwear&minPrice=100&maxPrice=500&sort=-createdAt&page=2&pageSize=24
```

- `sort` (no **s**)

**Algolia sort gap:** The Algolia path ignores the `sort` param — Algolia sorting requires replica indices not yet configured. In-memory fallback handles it correctly. Fix is out of scope for this refactor.

---

## Per-Page Param Map

### Admin Pages

| Page         | URL Params                                            | Default Sort | API Endpoint     | Additional changes 🆕                             |
| ------------ | ----------------------------------------------------- | ------------ | ---------------- | ------------------------------------------------- |
| **Users**    | `page`, `pageSize`, `sort`, `q`, `status`(\*), `role` | `-createdAt` | `ADMIN.USERS`    | Drop `pageSize=500`                               |
| **Orders**   | `page`, `pageSize`, `sort`, `status`                  | `-createdAt` | `ADMIN.ORDERS`   | Drop `pageSize=200`                               |
| **Products** | `page`, `pageSize`, `sort`, `q`, `status`             | `-createdAt` | `ADMIN.PRODUCTS` | Add search + status filter bar (currently absent) |
| **Reviews**  | `page`, `pageSize`, `sort`, `q`, `status`, `rating`   | `-createdAt` | `ADMIN.REVIEWS`  | Add explicit `pageSize` (currently missing)       |
| **Bids**     | `page`, `pageSize`, `sort`, `status`                  | `-bidDate`   | `ADMIN.BIDS`     | Drop `pageSize=200`                               |
| **Coupons**  | `page`, `pageSize`, `sort`, `q`                       | `-createdAt` | `ADMIN.COUPONS`  | Add search bar (currently absent)                 |
| **FAQs**     | `page`, `pageSize`, `sort`, `q`                       | `-createdAt` | `FAQS.LIST`      | Add search bar (currently absent)                 |

(\*) `status` for Users maps tab labels to Sieve clauses — see Sieve mapping section below.

Categories, Carousel, Sections — small datasets, skip.

### Public Pages

| Page                   | URL Params                                              | API Style           | Changes                                                                                                               |
| ---------------------- | ------------------------------------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **products/**          | `page`, `sort`, `category`, `minPrice`, `maxPrice`      | Sieve               | Replace raw buttons → `<Pagination>`; switch `router.push` → `replace`; replace manual `updateUrl` with `useUrlTable` |
| **search/**            | `q`, `page`, `sort`, `category`, `minPrice`, `maxPrice` | Named               | Replace manual `buildUrl` with `useUrlTable`; fix `SearchResultsSection` `onPageChange`                               |
| **auctions/**          | `page`, `sort`                                          | Sieve               | Full conversion: local state → `useUrlTable`; raw `<button>` → `<Pagination>`; `fetch()` → `apiClient.get()`          |
| **blog/**              | `page`, `category`                                      | Named (`/api/blog`) | Full conversion: local state → `useUrlTable`; raw buttons → `<Pagination>`                                            |
| **categories/[slug]/** | `page`, `sort`                                          | Sieve               | Full conversion: local state → `useUrlTable`; raw buttons → `<Pagination>`; fix disabled bug                          |

### Seller Pages

| Page                | URL Params                      | Changes                                                                                                    |
| ------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **seller/products** | `page`, `pageSize`, `sort`, `q` | Add `useUrlTable`; add search/sort bar; real server pagination (drop `pageSize=100`)                       |
| **seller/orders**   | `page`, `sort`, `status`        | Add `useUrlTable`; send `page` param to API; add `<TablePagination>`; fix revenue total to use API meta 🆕 |

### User Pages

| Page            | URL Params       | Changes                                                            |
| --------------- | ---------------- | ------------------------------------------------------------------ |
| **user/orders** | `page`, `status` | Add `useUrlTable`; add status filter tabs; add `<TablePagination>` |

---

## Sieve Filter Mapping per Page

These are the Sieve clauses each page builds from its URL params before calling `table.buildSieveParams()`.

### Users

| URL param       | Sieve clause                    |
| --------------- | ------------------------------- |
| `status=active` | `disabled==false`               |
| `status=banned` | `disabled==true`                |
| `status=admins` | `role==admin`                   |
| `role=<value>`  | `role==<value>`                 |
| `q=<term>`      | `(displayName\|email)@=*<term>` |

### Orders (admin + seller)

| URL param        | Sieve clause      |
| ---------------- | ----------------- |
| `status=<value>` | `status==<value>` |

### Products (admin + seller)

| URL param        | Sieve clause      |
| ---------------- | ----------------- |
| `status=<value>` | `status==<value>` |
| `q=<term>`       | `title@=*<term>`  |

### Reviews

| URL param        | Sieve clause                     |
| ---------------- | -------------------------------- |
| `status=<value>` | `status==<value>`                |
| `rating=<value>` | `rating==<value>`                |
| `q=<term>`       | `(userName\|userEmail)@=*<term>` |

### Bids

| URL param        | Sieve clause      |
| ---------------- | ----------------- |
| `status=<value>` | `status==<value>` |

### Coupons

| URL param  | Sieve clause    |
| ---------- | --------------- |
| `q=<term>` | `code@=*<term>` |

### FAQs

| URL param  | Sieve clause        |
| ---------- | ------------------- |
| `q=<term>` | `question@=*<term>` |

### Auctions / Categories / Seller Products

Base Sieve filter is hardcoded (e.g. `isAuction==true,status==published`). Only `sort` comes from URL.

### Products (public) + Search

These use the existing pre-built filter string — no changes to Sieve logic, just replace the pagination UI and URL management.

---

## File Change List

### New Files

```
src/hooks/useUrlTable.ts
src/components/ui/SortDropdown.tsx
src/components/ui/TablePagination.tsx
```

### Modified — Infrastructure

```
src/hooks/index.ts                                  — export useUrlTable
src/components/ui/index.ts                          — export SortDropdown, TablePagination
src/components/admin/AdminFilterBar.tsx             — add withCard?: boolean prop (non-breaking, default: true)
src/components/admin/DataTable.tsx                  — add externalPagination + view toggle; reuse mobileCardRender
src/components/search/SearchResultsSection.tsx      — onPrevPage/onNextPage → onPageChange + <Pagination>
```

### Modified — Admin Pages

```
src/app/admin/users/[[...action]]/page.tsx          — useUrlTable; drop pageSize=500; externalPagination
src/app/admin/orders/[[...action]]/page.tsx         — useUrlTable; drop pageSize=200; externalPagination
src/app/admin/products/[[...action]]/page.tsx       — useUrlTable; ADD filter+search bar; externalPagination
src/app/admin/reviews/[[...action]]/page.tsx        — useUrlTable; add explicit pageSize; externalPagination
src/app/admin/bids/[[...action]]/page.tsx           — useUrlTable; drop pageSize=200; externalPagination
src/app/admin/coupons/[[...action]]/page.tsx        — useUrlTable; ADD search bar; externalPagination
src/app/admin/faqs/[[...action]]/page.tsx           — useUrlTable; ADD search bar; externalPagination
```

### Modified — Public / Seller / User Pages

```
src/app/products/page.tsx                           — useUrlTable; push→replace; raw buttons → <Pagination>
src/app/search/page.tsx                             — useUrlTable; onPrevPage/onNextPage → onPageChange
src/app/auctions/page.tsx                           — useUrlTable; fetch() → apiClient.get(); raw buttons → <Pagination>
src/app/blog/page.tsx                               — useUrlTable; raw buttons → <Pagination>
src/app/categories/[slug]/page.tsx                  — useUrlTable; raw buttons → <Pagination>; fix disabled bug
src/app/seller/products/page.tsx                    — useUrlTable; add search/sort bar; drop pageSize=100
src/app/seller/orders/page.tsx                      — useUrlTable; send page param; <TablePagination>; fix revenue total
src/app/user/orders/page.tsx                        — useUrlTable; add status tabs; <TablePagination>
```

### Unchanged Files

```
src/components/ui/Pagination.tsx                    — already correct
src/helpers/data/pagination.helper.ts               — already correct
All API routes (src/app/api/**/)                    — already correct
src/lib/search/algolia.ts                           — already correct (sort gap noted, out of scope)
```

---

## Implementation Order

1. `useUrlTable` hook + barrel export (`src/hooks/index.ts`)
2. `SortDropdown` + `TablePagination` components + barrel exports (`src/components/ui/index.ts`); add `withCard` prop to `AdminFilterBar` (existing file, non-breaking)
3. `DataTable` — `externalPagination` prop + grid/list view toggle (`viewMode`, `showViewToggle`); reuses existing `mobileCardRender`
4. `SearchResultsSection` — `onPageChange` + `<Pagination>`
5. **Admin**: Users → Orders → Products (+ filter bar) → Reviews → Bids → Coupons (+ search) → FAQs (+ search)
6. **Public**: `products` (+ view toggle) → `search` (+ view toggle) → `auctions` (+ view toggle) → `blog` → `categories/[slug]` (+ view toggle)
7. **Seller**: `seller/products` (+ view toggle) → `seller/orders` (fix revenue total)
8. **User**: `user/orders`

---

## Key Invariants

- **Filter/sort/search changes always reset `page → 1`** — automatic inside `useUrlTable.set()` / `setMany()`
- **`router.replace()` not `router.push()`** — filter changes must not pollute browser history
- **`queryKey` uses `table.params.toString()`** — single cache-bust string that covers all param combinations
- **`AdminFilterBar` wraps filter + sort controls** — `columns` prop adjusts grid to content
- **Pages remain < 150 lines of JSX** — filter sub-components accept URL param values + setters as props
- **`products/page.tsx` `sort` param** maps to `sorts` API param (different names) — page handles translation
- **`/api/search` `sort` param** maps to `sort` (no `s`) on this endpoint only
- **Seller revenue total** must read from API `meta.totalRevenue` (or a separate aggregation), not from `orders.reduce()` after pagination is added — otherwise shows only current-page revenue
- **`categories/[slug]` disabled fix**: `page >= totalPages`, NOT `products.length < PAGE_SIZE`
- **`auctions/page.tsx`** must use `apiClient.get()` — raw `fetch()` bypasses auth headers and error handling

---

## Section B — Filter Left Drawer: Searchable, Paginated Facets

### Current State

| Component            | Location                                     | Type                          | Issues                                                                                                                |
| -------------------- | -------------------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `ProductFilters`     | `src/components/products/ProductFilters.tsx` | `<aside>` in left column      | Only category (dropdown) + price range; no seller, brand, rating, stock filters; not a drawer — always visible inline |
| `SearchFiltersRow`   | `src/components/search/SearchFiltersRow.tsx` | Horizontal inline row         | Category dropdown + price range only; no drawer                                                                       |
| `SideDrawer`         | `src/components/ui/SideDrawer.tsx`           | Right-side drawer             | Hardcoded `right-0` — no `side` prop; no left variant                                                                 |
| `AdminFilterBar`     | `src/components/admin/AdminFilterBar.tsx`    | Card-wrapped grid             | Inline only — admin filter bar, not a drawer                                                                          |
| `FAQCategorySidebar` | `src/components/faq/FAQCategorySidebar.tsx`  | Left sidebar (always visible) | Correct pattern on desktop; should become left drawer on mobile                                                       |

**No `FilterDrawer` or `FilterFacetSection` component exists.** The filter system has no searchable facets, no paginated option lists, no active-filter chips, no left-drawer wrapper.

### What Will Be Built

#### B1. `SideDrawer` — Add `side` Prop

Add `side: 'left' | 'right'` to `SideDrawerProps`. Delete the hardcoded `right-0` class. Update all existing `<SideDrawer` call sites to pass `side="right"` explicitly. Left drawers slide in from `left-0`.

```typescript
interface SideDrawerProps {
  // ... existing props
  side?: "left" | "right"; // NEW — default: 'right'
}
```

Width on left side: `w-full sm:w-96 md:w-[420px]` (narrower than right drawers — filters don't need full half-screen).

#### B2. `FilterFacetSection` Component — `src/components/ui/FilterFacetSection.tsx`

**Tier 1 — Shared primitive. Not admin-specific.** Used on public pages (products, search, categories/[slug], auctions), seller pages (seller/products), and any admin list page that adopts the drawer filter pattern.

A single collapsible filter group (e.g. "Category", "Seller", "Brand", "Rating"). Each instance is **self-contained**: it has its own search input, shows 10 items, and has a "Load 10 more" button. Selected values render as removable chips below the label.

```typescript
interface FilterFacetOption {
  value: string;
  label: string; // display name (e.g. seller display name, category name)
  count?: number; // optional result count badge
}

interface FilterFacetSectionProps {
  title: string; // section heading
  options: FilterFacetOption[]; // all available options (full list)
  selected: string[]; // currently selected values
  onChange: (values: string[]) => void; // multi-select
  searchable?: boolean; // show search input (default: true)
  pageSize?: number; // items per "page" (default: 10)
  className?: string;
}
```

**Behaviour:**

- Renders up to `pageSize` options initially (default 10)
- Search input filters the displayed list in real time (client-side, from `options`)
- "Load 10 more" button appends the next 10 (never fetches — all options are passed via props)
- Selected values render as chips with a `×` clear button above the list
- Single-select mode: `onChange` receives an array of at most 1 item

**Usage:**

```tsx
<FilterFacetSection
  title="Category"
  options={categories.map(c => ({ value: c.id, label: c.name, count: c.productCount }))}
  selected={[table.get('category')].filter(Boolean)}
  onChange={([val]) => table.set('category', val ?? '')}
/>
<FilterFacetSection
  title="Seller"
  options={sellers.map(s => ({ value: s.id, label: s.displayName }))}
  selected={table.get('seller') ? [table.get('seller')] : []}
  onChange={([val]) => table.set('seller', val ?? '')}
/>
```

#### B3. `FilterDrawer` Component — `src/components/ui/FilterDrawer.tsx`

**Tier 1 — Shared primitive. Not admin-specific.** Used by: public pages (products, search, categories/[slug], auctions), seller pages (seller/products), and admin list pages that need a toggleable filter panel.

A left `SideDrawer` that wraps one or more `FilterFacetSection` groups, plus an "Apply" + "Clear All" footer.

```typescript
interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
  activeCount: number; // number of active filters — shown in header badge
  children: ReactNode; // one or more <FilterFacetSection /> instances
}
```

**Replaces `ProductFilters` `<aside>` on mobile** — on ≥ lg breakpoint `ProductFilters` remains as an always-visible left sidebar; below lg a "Filters (n)" button opens `FilterDrawer` from the left.

#### B4. Pages That Need Updating

| Page                           | Change                                                                                              |
| ------------------------------ | --------------------------------------------------------------------------------------------------- |
| `products/page.tsx`            | Wrap `ProductFilters` in `FilterDrawer` on mobile; keep as sidebar on lg+; add Seller, Brand facets |
| `search/page.tsx`              | Replace `SearchFiltersRow` with `FilterDrawer` trigger + `FilterFacetSection` groups                |
| `categories/[slug]/page.tsx`   | Add `FilterDrawer` (Brand, Rating, Price) triggered by "Filters" button                             |
| `auctions/page.tsx`            | Add `FilterDrawer` (Status, Price, End date range)                                                  |
| `seller/products/page.tsx`     | Add `FilterDrawer` (Status, Category, Price) triggered by "Filters" button                          |
| `admin/products/[[...action]]` | Keep `AdminFilterBar` inline (admin is always desktop); `FilterDrawer` optional for mobile admin    |

#### B5. Active Filter Chips Bar

**Tier 1 — Shared primitive. Not admin-specific.** Used on every list page that has active filters — public, seller, and admin alike.

A horizontal strip of `×`-dismissable chips shown above the results grid/list when any filter is active. Each chip shows the field label + value (e.g. "Category: Electronics × ").

```typescript
// src/components/ui/ActiveFilterChips.tsx
interface ActiveFilterChipsProps {
  filters: Array<{ key: string; label: string; value: string }>;
  onRemove: (key: string) => void;
  onClearAll: () => void;
}
```

---

## Section C — Inline Create via SideDrawer: Categories & Addresses

### Current State

| Need                              | Current situation                            | Gap                                                               |
| --------------------------------- | -------------------------------------------- | ----------------------------------------------------------------- |
| Category selector on product form | Plain `<select>` populated from API          | No inline create; if category missing user must go to admin panel |
| Address selector on product form  | ❌ **Not present at all**                    | No `pickupAddressId` field on `ProductDocument` or `ProductForm`  |
| `AddressForm` component           | Exists in `src/components/user/`             | Not wired to a drawer from product creation                       |
| `CategoryForm` component          | Exists in `src/components/admin/categories/` | Not accessible from seller product form                           |

### What Will Be Built

#### C1. `CategorySelectorCreate` — `src/components/ui/CategorySelectorCreate.tsx`

A controlled field combining a searchable `<select>` (or `<Combobox>`-style input) with a "＋ New category" button that opens a right `SideDrawer` containing `CategoryForm`.

```typescript
interface CategorySelectorCreateProps {
  value: string;
  onChange: (categoryId: string) => void;
  showCreateButton?: boolean; // hide for non-seller users (default: true)
  label?: string;
}
```

**Behaviour:**

- Dropdown lists all active categories from `GET /api/categories`
- "＋ New category" triggers `<SideDrawer mode="create">` with `<CategoryForm>` embedded
- On successful category creation → auto-selects the new category + closes drawer + refreshes category list
- Uses `useApiMutation` for the create call and `useApiQuery` cache invalidation

#### C2. `AddressSelectorCreate` — `src/components/ui/AddressSelectorCreate.tsx`

Same pattern as above but for the user's saved addresses.

```typescript
interface AddressSelectorCreateProps {
  value: string; // selected addressId
  onChange: (addressId: string) => void;
  userId: string;
  label?: string; // default: UI_LABELS.FORM.PICKUP_ADDRESS
}
```

**Behaviour:**

- Lists user's saved addresses from `GET /api/user/addresses`
- "＋ Add new address" opens right `SideDrawer mode="create"` with `<AddressForm>`
- On save → auto-selects new address + closes drawer

#### C3. `ProductDocument` + `ProductForm` — Add `pickupAddressId`

```typescript
// src/db/schema — ProductDocument addition
pickupAddressId?: string;   // FK → user's address

// src/components/admin/products/ProductForm — new field
<AddressSelectorCreate
  value={formData.pickupAddressId ?? ''}
  onChange={(id) => handleChange('pickupAddressId', id)}
  userId={user.uid}
  label={UI_LABELS.ADMIN.PRODUCTS.PICKUP_ADDRESS}
/>
```

Also add `PRODUCT_FIELDS.PICKUP_ADDRESS_ID` to `src/db/schema/product.schema.ts`.

#### C4. New constants required

```typescript
// src/constants/ui.ts
UI_LABELS.FORM.PICKUP_ADDRESS = "Pickup Address";
UI_LABELS.ACTIONS.ADD_ADDRESS = "Add new address";
UI_LABELS.ACTIONS.ADD_CATEGORY = "New category";
UI_PLACEHOLDERS.SELECT_ADDRESS = "Select a pickup address...";
UI_PLACEHOLDERS.SELECT_CATEGORY = "Select a category...";
```

---

## Section D — All CRUD as Right Drawers

### Current State

| Page / Form                | Current UI                                       | Status                          |
| -------------------------- | ------------------------------------------------ | ------------------------------- |
| Admin users create/edit    | `UserDetailDrawer` (SideDrawer)                  | ✅ Already drawer               |
| Admin orders edit          | Inline DataTable actions                         | ❌ Modal/inline — no drawer     |
| Admin products create      | Full page `/admin/products/new` ❌ (check)       | 🔍 Needs verification           |
| Admin products edit        | Full page `/admin/products/[id]/edit` ❌ (check) | 🔍 Needs verification           |
| Admin reviews edit/delete  | Inline DataTable actions                         | ❌ Inline only                  |
| Admin bids edit/delete     | Inline DataTable actions                         | ❌ Inline only                  |
| Admin coupons create/edit  | Check if drawer or page                          | 🔍 Needs verification           |
| Admin FAQs create/edit     | Check `FaqForm` usage                            | 🔍 Needs verification           |
| Seller products create     | Full page `/seller/products/new/page.tsx`        | ❌ Full page — should be drawer |
| Seller products edit       | Full page `/seller/products/[id]/edit/page.tsx`  | ❌ Full page — should be drawer |
| User addresses create/edit | Check `AddressForm` usage                        | 🔍 Needs verification           |

### Rules

- **Mobile**: `SideDrawer` occupies full screen (`w-full`)
- **Tablet (md)**: SideDrawer is 3/5 width (`md:w-3/5`) — this is the current default ✅
- **Desktop (lg+)**: SideDrawer uses `lg:max-w-2xl` or larger for complex forms like `ProductForm`
- **Delete actions**: Always `SideDrawer mode="delete"` — red header, confirms before deletion, never a separate page
- **Unsaved changes warning**: `SideDrawer` already has built-in `isDirty` prop handling — always pass `isDirty` from form state ✅

### What Will Be Built

#### D1. Seller Product New/Edit → Drawer

Replace `src/app/seller/products/new/page.tsx` and `src/app/seller/products/[id]/edit/page.tsx` with drawer triggers from the seller products list page. The pages can remain as redirect stubs for direct URL access.

```tsx
// seller/products/page.tsx — add button
<Button onClick={() => setDrawerMode('create')}>
  {UI_LABELS.ACTIONS.ADD_PRODUCT}
</Button>

<SideDrawer isOpen={drawerMode === 'create'} mode="create" title={LABELS.CREATE_TITLE}>
  <ProductForm ... />
  <DrawerFormFooter onSave={handleSave} onCancel={close} isLoading={isSaving} />
</SideDrawer>
```

#### D2. Admin products — verify and migrate if needed

Check whether `admin/products/[[...action]]` already uses `SideDrawer` for create/edit (the `[[...action]]` pattern suggests it may). If not, migrate same as D1.

#### D3. Admin reviews / bids / orders

Add `SideDrawer mode="edit"` for status changes and `SideDrawer mode="delete"` for deletions — triggered from DataTable row action buttons.

---

## Section E — FAQ Category Tabs + `/faqs/[cat]` Routes

### Current State

| Location              | Current behaviour                                 | Gap                                  |
| --------------------- | ------------------------------------------------- | ------------------------------------ |
| Homepage `FAQSection` | Fetches 6 `featured=true` FAQs — no category tabs | No tabs; all categories mixed        |
| `/faqs` page          | Uses `?category=<key>` query param for filtering  | Should be `/faqs/<cat>` URL segments |
| `FAQCategorySidebar`  | Renders links to `?category=<key>` (query param)  | Should link to `/faqs/<cat>`         |
| `ROUTES.PUBLIC.FAQS`  | `/faqs` only — no category sub-route              | Missing `FAQ_CATEGORY` route helper  |

### What Will Be Built

#### E1. Homepage `FAQSection` — Add Category Tabs

Replace the single `?featured=true&limit=6` fetch with a tabbed interface:

- Default selected tab: **General**
- Tabs show all 7 FAQ category labels from `FAQ_CATEGORIES` (existing constant in `FAQCategorySidebar`)
- Each tab click fetches `GET /api/faqs?category=<key>&limit=6` (or filters client-side if already fetched)
- Active filter chip shows the selected tab (dismissable → returns to "General")
- "View all →" button links to `ROUTES.PUBLIC.FAQ_CATEGORY(selectedCategory)` → e.g. `/faqs/general`

```tsx
// Updated FAQSection
const [activeCategory, setActiveCategory] = useState<FAQCategoryKey>("general");

const { data } = useApiQuery({
  queryKey: ["faqs", "homepage", activeCategory],
  queryFn: () =>
    apiClient.get(
      `${API_ENDPOINTS.FAQS.LIST}?category=${activeCategory}&limit=6`,
    ),
});
```

Tab bar uses `<SectionTabs>` component (already in `@/components`).

#### E2. Dynamic Route — `src/app/faqs/[category]/page.tsx`

New dynamic segment for category-scoped FAQ pages:

```
/faqs/general     → General FAQs
/faqs/shipping    → Shipping & Delivery FAQs
/faqs/payment     → Payment & Coupons FAQs
... etc.
```

This is a new page file that renders the existing `FAQPageContent` logic but with the category pre-selected from `params.category` rather than `searchParams.category`.

```typescript
// src/app/faqs/[category]/page.tsx
export async function generateStaticParams() {
  return Object.keys(FAQ_CATEGORIES).map((cat) => ({ category: cat }));
}
```

Rewrite `src/app/faqs/page.tsx` to drop `?category=` query param handling entirely. Update all internal links (sidebar, section, homepage) to use the `/faqs/<key>` segment form.

#### E3. `ROUTES` Update

```typescript
// src/constants/routes.ts
FAQS: "/faqs",
FAQ_CATEGORY: (category: string) => `/faqs/${category}`,
```

#### E4. `FAQCategorySidebar` — Update Links

Change all links from `?category=<key>` (query param) to `/faqs/<key>` (URL segment), using `ROUTES.PUBLIC.FAQ_CATEGORY(key)`.

```tsx
// BEFORE
href={`${ROUTES.PUBLIC.FAQS}?category=${key}`}
// AFTER
href={ROUTES.PUBLIC.FAQ_CATEGORY(key)}
```

---

## Section F — Footer & Navigation Modernisation

### Current State

| Component        | File                                         | Issues                                                                                                                                                                               |
| ---------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Footer`         | `src/components/layout/Footer.tsx`           | Basic 4-col grid; inline SVG path strings; only 2 social icons; minimal link list                                                                                                    |
| `EnhancedFooter` | `src/components/homepage/EnhancedFooter.tsx` | **Emoji icons** (📘📷🐦) for social; **all strings hardcoded** — no `UI_LABELS`, no `ROUTES`; hardcoded hrefs like `"/careers"`, `"/press"`; duplicate of `Footer` with more content |
| Navigation icons | `src/constants/navigation.tsx`               | All icons are raw inline SVG `<path>` elements — no icon library; verbose and hard to maintain                                                                                       |
| Nav constants    | `src/constants/navigation.tsx`               | ✅ Uses `UI_LABELS`, `ROUTES`, `SITE_CONFIG` correctly                                                                                                                               |

**Two footers exist** (`Footer` + `EnhancedFooter`). It is unclear which is actually rendered in the app layout. This needs to be resolved — one canonical footer.

### What Will Be Built

#### F1. Add `lucide-react` Icon Library

`lucide-react` is the recommended choice: tree-shakable, TypeScript-first, ships with 1400+ icons, works well with Next.js App Router.

```bash
npm install lucide-react
```

Add to `src/constants/index.ts` comment block as the canonical icon source. Export a small icon wrapper if needed.

#### F2. Rewrite Canonical Footer — `src/components/layout/Footer.tsx`

Replace the current basic `Footer` with a rich, modern layout:

**Five-column layout:**

- Col 1 (2× wide on lg): Brand logo/name, tagline, social icons (via `lucide-react`: `Facebook`, `Instagram`, `Twitter`, `Youtube`, `Linkedin`)
- Col 2: **Shop** — Products, Auctions, Categories, Promotions
- Col 3: **Support** — FAQs, Help Center, Contact, Track Order
- Col 4: **Sellers** — Sell on Platform, Seller Dashboard, Seller Guide
- Col 5: **Legal** — Terms, Privacy, Cookie Policy, Refund Policy

**Bottom bar:** Copyright + payment method icons + "Made in India 🇮🇳" badge

**Rules:**

- All strings from `UI_LABELS.FOOTER.*` — add new keys as needed
- All hrefs from `ROUTES.*` — add missing routes as needed
- All styling via `THEME_CONSTANTS` — no raw Tailwind repeated classes
- No emoji — use `lucide-react` icons for social and icons for bottom badges
- Dark/light mode via `themed.*` tokens ✅

#### F3. Delete `EnhancedFooter`

`src/components/homepage/EnhancedFooter.tsx` — delete after replacing with the canonical footer. Remove the import from wherever it's rendered.

#### F4. Update `navigation.tsx` — Use `lucide-react` Icons

Replace all inline SVG path strings with imported icon components:

```tsx
// BEFORE
import { Home, ShoppingBag, Gavel, Users, Search, Tag, BookOpen } from 'lucide-react';

// AFTER — in MAIN_NAV_ITEMS
{
  href: ROUTES.PUBLIC.HOME,
  label: UI_LABELS.NAV.HOME,
  icon: <Home className="w-5 h-5" />,
},
```

This reduces `navigation.tsx` by ~150 lines of SVG path data.

#### F5. UI Improvements — Application-Wide

- **Header/navbar**: Add subtle backdrop-blur on scroll; active route indicator with indigo underline; better mobile hamburger animation
- **Sidebar (admin/seller)**: Active state icon highlight; collapsible groups with smooth animation
- **Button hover states**: Ensure all `Button` variants use `THEME_CONSTANTS` hover tokens, no raw hover classes
- **Card shadows**: Use `THEME_CONSTANTS.card.shadow` consistently — audit for raw `shadow-md`, `shadow-lg` strings

---

## Section G — Constants Audit: Hardcoded String Gaps

### Files with confirmed violations

| File                                                | Violation                                                                                 | Fix                                                              |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `src/components/homepage/EnhancedFooter.tsx`        | All link labels, section titles, descriptions hardcoded                                   | Replace with `UI_LABELS.FOOTER.*`; deleted in F3 anyway          |
| `src/components/admin/users/UserFilters.tsx` L34-40 | `"All Roles"`, `"User"`, `"Seller"`, `"Moderator"`, `"Admin"` hardcoded in `ROLE_OPTIONS` | Add `UI_LABELS.ROLES.*` constants                                |
| `src/components/faq/FAQCategorySidebar.tsx`         | All category labels, icons, descriptions hardcoded inside the file                        | Move to `src/constants/ui.ts` as `FAQ_CATEGORY_OPTIONS` constant |
| `src/components/search/SearchFiltersRow.tsx` L45    | Raw `input` Tailwind string built inline (not from `THEME_CONSTANTS`)                     | Use `THEME_CONSTANTS.input.base`                                 |
| `src/app/seller/products/new/page.tsx` L84          | `"Title is required"`, `"Description is required"` raw error strings                      | Use `ERROR_MESSAGES.VALIDATION.*`                                |
| `src/components/homepage/FAQSection.tsx` L134       | `→` arrow hardcoded after `{UI_LABELS.ACTIONS.VIEW_ALL}`                                  | Use `UI_LABELS.ACTIONS.VIEW_ALL_ARROW` or arrow inside constant  |
| `src/constants/navigation.tsx` (after F4)           | Replace inline SVG paths with `lucide-react` imports                                      | Done in F4                                                       |

### New constants required

```typescript
// src/constants/ui.ts — additions needed
UI_LABELS.ROLES = {
  ALL: "All Roles",
  USER: "User",
  SELLER: "Seller",
  MODERATOR: "Moderator",
  ADMIN: "Admin",
};
UI_LABELS.ADMIN.PRODUCTS.PICKUP_ADDRESS = "Pickup Address";
UI_LABELS.ACTIONS.ADD_ADDRESS = "Add new address";
UI_LABELS.ACTIONS.ADD_CATEGORY = "New category";
UI_LABELS.ACTIONS.VIEW_ALL_ARROW = "View all →";

UI_PLACEHOLDERS.SELECT_ADDRESS = "Select a pickup address...";
UI_PLACEHOLDERS.SELECT_CATEGORY = "Select a category...";

// src/constants/messages.ts
SUCCESS_MESSAGES.CATEGORY.CREATED = "Category created successfully";
SUCCESS_MESSAGES.ADDRESS.CREATED = "Address saved successfully";

// src/constants/routes.ts
ROUTES.PUBLIC.FAQ_CATEGORY = (category: string) => `/faqs/${category}`;
```

---

## Section H — Gestures + Accessibility

### Gesture hooks

| Hook               | Location                        | New / extend                                                            |
| ------------------ | ------------------------------- | ----------------------------------------------------------------------- |
| `useSwipe`         | `src/hooks/useSwipe.ts`         | Extend existing — add `onSwipeUp`/`onSwipeDown`, `preventScroll` option |
| `useLongPress`     | `src/hooks/useLongPress.ts`     | New — fires callback after 500 ms hold; handles both mouse and touch    |
| `usePullToRefresh` | `src/hooks/usePullToRefresh.ts` | New — returns `containerRef`, `isPulling`, `progress (0–1)`             |

**Swipe targets:**

| Component                 | Gesture          | Action                |
| ------------------------- | ---------------- | --------------------- |
| `SideDrawer` (left)       | Swipe right      | Close                 |
| `SideDrawer` (right)      | Swipe left       | Close                 |
| `FilterDrawer`            | Swipe right      | Close                 |
| `HeroCarousel`            | Swipe left/right | Next/prev slide       |
| `Tabs` / `SectionTabs`    | Swipe left/right | Switch tab            |
| `DataTable` rows (mobile) | Swipe left       | Reveal action buttons |
| Product image gallery     | Swipe left/right | Next/prev image       |

**Pull-to-refresh targets:** `user/orders`, `seller/products`, `seller/orders`, `auctions/page.tsx`

### ARIA requirements (all new + modified components)

| Component                | Required attributes                                                                                                        |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------- | ---------- | ------ |
| `SideDrawer`             | `role="dialog"` `aria-modal="true"` `aria-labelledby={titleId}` — focus trapped inside; focus returned to trigger on close |
| `FilterDrawer`           | `role="complementary"` `aria-label="Filters"`                                                                              |
| `FilterFacetSection`     | `role="group"` `aria-labelledby`; options use `aria-checked`                                                               |
| `ActiveFilterChips`      | `role="list"`; chips `role="listitem"`; remove button `aria-label="Remove [label] filter"`                                 |
| `TablePagination`        | `role="navigation"` `aria-label="Pagination"`; current page `aria-current="page"`                                          |
| `DataTable`              | `role="table"`; sortable headers `aria-sort="ascending                                                                     | descending | none"` |
| `Tabs` / `SectionTabs`   | `role="tablist"`; tabs `role="tab"` `aria-selected`; panels `role="tabpanel"`                                              |
| `HeroCarousel`           | `aria-roledescription="carousel"`; slides `aria-label="Slide N of M"`                                                      |
| `CategorySelectorCreate` | `aria-haspopup="dialog"` on trigger button                                                                                 |
| All icon-only buttons    | `aria-label` describing the action                                                                                         |
| All form inputs          | `aria-describedby` wired to error/help text elements                                                                       |

### Keyboard navigation

| Component                      | Key behaviour                                      |
| ------------------------------ | -------------------------------------------------- |
| `SideDrawer` / `FilterDrawer`  | `Esc` closes; focus trapped                        |
| `FilterFacetSection`           | `↑`/`↓` navigates options; `Enter`/`Space` selects |
| `Tabs` / `SectionTabs`         | `←`/`→` switches tabs                              |
| `HeroCarousel`                 | `←`/`→` changes slide; `Space` toggles autoplay    |
| `DataTable` rows               | `Tab` navigates; `Enter` opens row action          |
| `Modal` / `ConfirmDeleteModal` | `Esc` dismisses; focus on Cancel by default        |

### Colour contrast + motion

- All text/background combinations must meet WCAG AA (4.5:1 body, 3:1 large)
- Add `prefers-reduced-motion` guard to `tailwind.config.js` and `globals.css`
- Autoplay (carousel) stops entirely when `prefers-reduced-motion: reduce`

---

## Section I — Homepage Sections

### Current state audit

| Component                                        | Issues                                                                                 |
| ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `HeroCarousel`                                   | No swipe; no reduced-motion; indicator dots not keyboard-accessible; inline SVG arrows |
| `FeaturedProductsSection`                        | Grid only — no horizontal scroll on mobile; no "View all" CTA                          |
| `FeaturedAuctionsSection`                        | No live countdown chip; no urgency indicator; no horizontal mobile scroll              |
| `TopCategoriesSection`                           | No product count badge; no hover animation; not swipeable mobile                       |
| `CustomerReviewsSection`                         | Static grid; no swipe; no star rating; no verified badge                               |
| `TrustIndicatorsSection` + `SiteFeaturesSection` | Duplicate purpose; inline SVG icons; no scroll-in animation                            |
| `BlogArticlesSection`                            | Grid only; no horizontal mobile scroll                                                 |
| `NewsletterSection`                              | No loading state; uses `alert()` or no feedback; no success state                      |
| `WelcomeSection`                                 | Hardcoded copy; no CTA tracking                                                        |
| `WhatsAppCommunitySection`                       | Emoji/inline icon; hardcoded URL                                                       |
| `AdvertisementBanner`                            | Static                                                                                 |

### What changes

| Component                   | Key changes                                                                                                          |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `HeroCarousel`              | `useSwipe`; keyboard `←`/`→`; ARIA carousel roles; `lucide-react` chevron icons; pause on focus                      |
| `FeaturedProductsSection`   | Mobile: `snap-x` swipe carousel; desktop: 4-col grid; "View all →" CTA via `ROUTES`                                  |
| `FeaturedAuctionsSection`   | Same as above + countdown chip on each card                                                                          |
| `TopCategoriesSection`      | Product count badge; `hover:scale-105`; mobile 2-col, desktop 4-col, widescreen 6-col; `lucide-react` category icons |
| `CustomerReviewsSection`    | Mobile swipe; desktop 3-col grid; star rating (`lucide-react` `Star`); verified badge                                |
| `TrustIndicatorsSection`    | Merge `SiteFeaturesSection` into this → delete `SiteFeaturesSection`; `lucide-react` icons; scroll-in fade           |
| `NewsletterSection`         | `useApiMutation`; `useMessage()` toast; loading + success states; no `alert()`                                       |
| `WhatsAppCommunitySection`  | `lucide-react` icon; URL from `SITE_CONFIG` / `siteSettingsRepository`                                               |
| **New: `HomepageSkeleton`** | Skeleton placeholders for all sections; prevents layout shift                                                        |

All section strings moved to `UI_LABELS.HOMEPAGE.*`. Delete `SiteFeaturesSection.tsx`.

---

## Section J — Dashboard Page Styling

### Admin dashboard

- Stat cards → `THEME_CONSTANTS.card.stat.<colour>` (indigo / emerald / amber / red)
- Skeleton loading state (`AdminDashboardSkeleton`)
- Recharts `<ResponsiveContainer>` + accessible `<Tooltip>`
- "Quick actions" row: New Product / Manage Orders / View Reviews — icon + label
- Mobile: 1-col; desktop: 2-col stats + chart; widescreen: 4-col stats + side-by-side charts

### Seller dashboard

- Stats: Revenue (total + this month), Active listings, Pending orders, Avg rating
- `<AreaChart>` of last 30 days revenue (Recharts, responsive)
- "Needs attention" card: orders awaiting shipment, low-stock listings, unanswered reviews
- Numbers via `formatCurrency()` + `formatRelativeTime()` from `@/utils`

### User dashboard / profile

- `ProfileStatsGrid`: `formatCurrency()` for spend totals; `formatRelativeTime()` for member-since
- "Recent orders" card: last 3 orders, status badge, "View all" link
- Address cards: `THEME_CONSTANTS.card.*`; primary address gets "Primary" badge
- Empty sections: `<EmptyState>` component (no raw strings)

### Shared admin/seller sidebar

- Active item: `THEME_CONSTANTS.themed.accent` bg + white text/icon
- Hover: subtle background shift
- Section grouping: divider + group label (`Orders`, `Products`, `Settings`)
- Mobile: bottom sheet or left-slide-in
- Widescreen: full labels + icons (not icon-only)

### `AdminPageHeader` standardisation

Every admin/seller/user page must use `<AdminPageHeader>` with:

- `title` from `UI_LABELS.*`
- `description` — one-sentence plain-English purpose
- `actions` slot — primary CTA button
- Optional breadcrumb trail

Audit all pages and migrate any that render their own `<h1>` or title block.

---

## Section K — Non-Tech Friendly UX

### Plain language

Replace all API jargon with human-readable text:

| Remove                                                           | Use instead                                                              |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `"Submit"` (generic)                                             | Context-specific: `"Place order"`, `"Save changes"`, `"Send message"`    |
| `"Validation failed"`                                            | `"Please check the highlighted fields"`                                  |
| `"Internal server error"`                                        | `"Something went wrong. Please try again."`                              |
| `"Unauthenticated"`                                              | `"Please sign in to continue"`                                           |
| `"Sort"` label                                                   | `"Sort by"` with options: `"Newest first"`, `"Price: low to high"`, etc. |
| `"createdAt"` in visible text                                    | `"Date added"` / `"Joined"`                                              |
| Never show: `pageSize`, `filters=`, Sieve DSL, HTTP status codes | —                                                                        |

### Contextual empty states (`<EmptyState>` component)

| Page / section           | Message                                                    | CTA                      |
| ------------------------ | ---------------------------------------------------------- | ------------------------ |
| `user/orders` empty      | "You haven't placed any orders yet"                        | "Start shopping →"       |
| `seller/products` empty  | "You don't have any products listed yet"                   | "Add your first product" |
| `seller/orders` no sales | "Your orders will appear here once customers start buying" | "View my listings"       |
| Search 0 results         | "No results for '[query]'"                                 | "Clear search"           |
| `admin/reviews` no match | "No reviews match your filters"                            | "Clear filters"          |

### Guided onboarding

- **New buyer:** 3-step tooltip tour on first visit — Browse → Add to cart → Checkout
- **New seller:** Dashboard checklist card: "Add profile photo", "List first product", "Set up payment" — items tick when done
- **Empty product form:** Inline helper text on each field in plain English

### Form field helper text (`UI_HELP_TEXT.*`)

All form fields get a `helperText` prop (stored in `UI_HELP_TEXT`):

| Field               | Helper text                                                    |
| ------------------- | -------------------------------------------------------------- |
| Product title       | "Be specific — e.g. 'Handmade leather wallet, brown'"          |
| Product price       | "Set a fair price. You can change it anytime."                 |
| Auction start price | "This is the lowest bid you'll accept"                         |
| Category            | "Pick the best fit — buyers search by category"                |
| Pickup address      | "Where should the buyer collect from, or where you ship from?" |
| Coupon code         | "Letters and numbers only, no spaces"                          |

### Human error messages

```typescript
ERROR_MESSAGES.VALIDATION.REQUIRED = "This field is required";
ERROR_MESSAGES.VALIDATION.INVALID_EMAIL =
  "Enter a valid email, e.g. name@example.com";
ERROR_MESSAGES.AUTH.WRONG_PASSWORD =
  "Incorrect email or password. Please try again.";
ERROR_MESSAGES.AUTH.EMAIL_IN_USE =
  "An account with this email already exists. Try signing in.";
ERROR_MESSAGES.GENERIC.TRY_AGAIN =
  "Something went wrong. Please try again in a moment.";
ERROR_MESSAGES.NETWORK.OFFLINE =
  "You appear to be offline. Check your connection and try again.";
```

### Conversational success toasts

```typescript
SUCCESS_MESSAGES.ORDER.PLACED =
  "Your order is confirmed! We'll notify you when it ships.";
SUCCESS_MESSAGES.PRODUCT.LISTED =
  "Your product is live — shoppers can find it now.";
SUCCESS_MESSAGES.REVIEW.SUBMITTED =
  "Thanks for your review! It helps other shoppers.";
SUCCESS_MESSAGES.BID.PLACED =
  "Bid placed! You'll be notified if someone outbids you.";
```

### Loading + progress states

- Every async `<Button>` shows spinner + disabled state while pending (`isLoading` prop)
- File uploads: `<Progress>` bar with percentage
- Form saves: button text → "Saving..." → "Saved ✓" for 2 s on success
- All page-level loads: skeleton screens (Sections I / J), not blank white

### Mobile touch targets

All interactive elements ≥ 44×44 px on mobile (WCAG 2.5.5). Add to `THEME_CONSTANTS`:

```typescript
THEME_CONSTANTS.touch.target = "min-h-[44px]";
THEME_CONSTANTS.touch.targetSm = "min-h-[36px]"; // chips + secondary actions
```

---

## Section L — Code Deduplication Audit

> **Goal:** Eliminate every confirmed duplicate in components, lib, routes, and hooks. Prefer extending the existing canonical file over creating a new one. New code must always check `@/components`, `@/hooks`, `@/utils`, `@/lib` for an existing implementation before building fresh.

### Confirmed Duplicates Found in Audit

#### Components

| Duplicate                 | Canonical (KEEP)                        | Duplicate (DELETE)                           | Action                                                             |
| ------------------------- | --------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------ |
| `Breadcrumbs.tsx`         | `src/components/layout/Breadcrumbs.tsx` | `src/components/utility/Breadcrumbs.tsx`     | Delete utility version; grep all imports and update to layout path |
| `EnhancedFooter.tsx`      | `src/components/layout/Footer.tsx`      | `src/components/homepage/EnhancedFooter.tsx` | Already in Section F plan; delete + update layout                  |
| `SiteFeaturesSection.tsx` | `TrustIndicatorsSection.tsx` (merged)   | `SiteFeaturesSection.tsx`                    | Already in Section I plan; merge + delete                          |

#### Lib

| Duplicate              | Canonical (KEEP)                | Duplicate (DELETE)                  | Action                                                              |
| ---------------------- | ------------------------------- | ----------------------------------- | ------------------------------------------------------------------- |
| Zod validation schemas | `src/lib/validation/schemas.ts` | `src/lib/api/validation-schemas.ts` | Merge all schemas into canonical file; update all API route imports |

#### API Routes

| Route                               | Overlapping Route                      | Resolution                                                                                                                                        |
| ----------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /api/profile/update`          | `PUT /api/user/profile`                | Consolidate: `/api/user/profile` becomes the single owner of GET + PUT. `/api/profile/update` → 301 redirect or delete after updating all callers |
| `POST /api/profile/update-password` | `POST /api/user/change-password`       | Consolidate: `/api/user/change-password` becomes canonical. Delete `/api/profile/update-password` + grep all callers                              |
| `POST /api/profile/add-phone`       | Verify `/api/user/profile` phone field | Consolidate under `/api/user/profile/phone` if overlapping; keep separate only if genuinely different flows                                       |

### Base-Form / Extend Pattern (Mandatory Going Forward)

When building any new component, hook, or util:

1. **Search first:** `grep -r "similar-keyword" src/components src/hooks src/utils` before implementing
2. **Extend if similar:** If an existing component does 70%+ of what you need, add a prop or subcomponent rather than creating a new file
3. **Base component pattern:** For form drawers with shared structure (header + body + `<DrawerFormFooter>`), extract the shared wrapper into a `BaseFormDrawer` HOC or compound component
4. **Barrel discipline:** All new exports go through barrel `index.ts` — never import from deep paths

### Pre-Implementation Grep Commands

Run before every new component:

```bash
# Check for existing component with similar name
grep -r "ComponentKeyword" src/components --include="*.tsx" -l
# Check for existing hook
grep -r "useHookKeyword" src/hooks --include="*.ts" -l
# Check for existing util
grep -r "functionKeyword" src/utils src/helpers --include="*.ts" -l
```

### Files Changed (Section L)

**Deleted:**

- `src/components/utility/Breadcrumbs.tsx`
- `src/components/homepage/EnhancedFooter.tsx` _(with Section F)_
- `src/components/homepage/SiteFeaturesSection.tsx` _(with Section I)_
- `src/app/api/profile/update/route.ts` _(callers migrated to `/api/user/profile`)_
- `src/app/api/profile/update-password/route.ts` _(callers migrated to `/api/user/change-password`)_

**Merged:**

- `src/lib/api/validation-schemas.ts` → merged into `src/lib/validation/schemas.ts`; file deleted

---

## Section M — SEO: Full-Stack Coverage

> **Goal:** Every page has correct `<title>`, `<meta description>`, Open Graph tags, Twitter card, canonical URL, and JSON-LD structured data. Products, categories, and blog posts have user-editable SEO fields. All images have descriptive `alt` text. Sitemap + robots.txt exist and include all indexable routes. Web crawlers can discover and rank all content.

### Existing Infrastructure

`src/constants/seo.ts` already exports:

- `SEO_CONFIG` — site-wide defaults and page-specific static metadata
- `generateMetadata(config)` — wraps Next.js `Metadata`, adds OG + Twitter + canonical
- `generateProfileMetadata(user)` — public user profile pages
- Used in: `src/app/layout.tsx` ✅ and a handful of static pages

**Gap:** Most pages do NOT call `generateMetadata()`. No dynamic/model-driven metadata. No JSON-LD. No sitemap. No robots.txt.

### New Helper Functions (extend `src/constants/seo.ts`)

```typescript
// Product detail page — driven by ProductDocument fields
export function generateProductMetadata(product: {
  title: string;
  description: string;
  price: number;
  images: string[];
  slug: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}): Metadata;

// Category page
export function generateCategoryMetadata(category: {
  name: string;
  description?: string;
  slug: string;
  imageUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
}): Metadata;

// Blog post
export function generateBlogMetadata(post: {
  title: string;
  excerpt: string;
  slug: string;
  coverImage: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}): Metadata;

// Auction
export function generateAuctionMetadata(auction: {
  title: string;
  description: string;
  currentBid: number;
  images: string[];
  slug: string;
  endDate: string;
  seoTitle?: string;
  seoDescription?: string;
}): Metadata;

// Search results page (dynamic based on query)
export function generateSearchMetadata(
  query: string,
  category?: string,
): Metadata;
```

### JSON-LD Structured Data — `src/lib/seo/json-ld.ts` (NEW)

All exported as plain `Record<string, unknown>` — rendered via `<script type="application/ld+json">` in page layout.

| Function                         | Schema.org Type                                | Used on                        |
| -------------------------------- | ---------------------------------------------- | ------------------------------ |
| `productJsonLd(product)`         | `Product`                                      | Product detail page            |
| `reviewJsonLd(review)`           | `Review`                                       | Product detail page            |
| `aggregateRatingJsonLd(product)` | `AggregateRating`                              | Product detail page            |
| `breadcrumbJsonLd(items)`        | `BreadcrumbList`                               | All content pages              |
| `faqJsonLd(faqs)`                | `FAQPage`                                      | `/faqs` and `/faqs/[category]` |
| `blogPostJsonLd(post)`           | `BlogPosting`                                  | Blog post detail               |
| `organizationJsonLd()`           | `Organization`                                 | Home page + layout             |
| `searchBoxJsonLd()`              | `WebSite` with `potentialAction: SearchAction` | Home page                      |
| `auctionJsonLd(auction)`         | `Product` with `offers`                        | Auction detail page            |

### SEO Fields on Firestore Models

Add optional SEO override fields to these schemas — populated via admin/seller forms, fall back to auto-generated values if blank:

| Schema file                          | New fields                                                                                                                                |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `src/db/schema/products.ts`          | `seoTitle?: string`, `seoDescription?: string`, `seoKeywords?: string[]`, `slug: string` (required, auto-generated from title if not set) |
| `src/db/schema/blog-posts.ts`        | `seoTitle?: string`, `seoDescription?: string`, `seoKeywords?: string[]` (slug already exists — verify)                                   |
| `src/db/schema/categories.ts`        | `seoTitle?: string`, `seoDescription?: string` (slug already exists — verify)                                                             |
| `src/db/schema/products.ts` (images) | Each image object: add `altText: string` field (auto-generated from `product.title + image index` if blank)                               |

**SEO field constants (add to `src/db/schema/products.ts`):**

```typescript
export const PRODUCT_SEO_FIELDS = {
  SEO_TITLE: "seoTitle",
  SEO_DESCRIPTION: "seoDescription",
  SEO_KEYWORDS: "seoKeywords",
  SLUG: "slug",
} as const;
```

### Sitemap — `src/app/sitemap.ts` (NEW)

```typescript
// Generates Next.js MetadataRoute.Sitemap
// Includes:
// - All static pages (home, products, auctions, blog, categories, faqs, about, contact, terms, privacy)
// - All published products (dynamic — fetched from productRepository + slug)
// - All blog posts (dynamic — fetched from blogRepository + slug)
// - All categories (dynamic — fetched from categoriesRepository + slug)
// - All /faqs/[category] routes (dynamic — from CATEGORY_VALUES)
// Priority + changeFrequency per content type:
// home: 1.0 / daily
// products: 0.8 / weekly
// categories: 0.7 / weekly
// blog posts: 0.6 / monthly (or weekly if recently published)
// static pages: 0.4 / monthly
```

### Robots.txt — `src/app/robots.ts` (NEW)

```typescript
// Disallows: /admin/*, /api/*, /seller/*, /user/*, /auth/*, /checkout/*
// Allows: everything else
// Sitemap: https://letitrip.in/sitemap.xml
```

### OpenGraph Image — `src/app/opengraph-image.tsx` (NEW)

Dynamic OG image using Next.js `ImageResponse`. Shows site logo + tagline for the default (non-page-specific) OG image. Each major section (`/products/`, `/blog/`, `/auctions/`) can optionally have its own `opengraph-image.tsx`.

### Image SEO Rules

| Context                        | Alt text rule                                                       | File naming rule                                                                           |
| ------------------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Product images                 | `product.title + " - image " + (index+1)` or `image.altText` if set | `{productSlug}-{index}.{ext}` — set at upload time via `src/app/api/media/upload/route.ts` |
| Category images                | `category.name + " category banner"`                                | `category-{slug}.{ext}`                                                                    |
| Blog cover images              | `post.title + " cover image"`                                       | `blog-{slug}-cover.{ext}`                                                                  |
| User avatars                   | `user.displayName + " profile photo"`                               | `avatar-{uid}.{ext}`                                                                       |
| Carousel slides                | `slide.title` (admin sets this)                                     | `carousel-{id}.{ext}`                                                                      |
| All `<img>` and `<Image>` tags | Must have non-empty `alt` — linting rule                            | —                                                                                          |

### URL / Slug Rules

| Resource       | Current URL          | Target URL           | Change needed                                                                                                 |
| -------------- | -------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------- |
| Product detail | `/products/[id]`     | `/products/[slug]`   | Add `slug` to `ProductDocument`; route param becomes slug; ID lookup via `productRepository.findBySlug(slug)` |
| Blog post      | `/blog/[slug]`       | `/blog/[slug]`       | Already slug-based ✅                                                                                         |
| Category       | `/categories/[slug]` | `/categories/[slug]` | Already slug-based ✅                                                                                         |
| FAQ category   | `/faqs/[category]`   | `/faqs/[category]`   | Already slug-based (new route from Section E) ✅                                                              |
| Seller profile | `/sellers/[id]`      | `/sellers/[slug]`    | Add `slug` to `UserDocument` for sellers                                                                      |

### Per-Page Metadata Coverage

All pages that currently export NO metadata must add `export async function generateMetadata()` or a static `export const metadata`:

| Page                                 | Metadata type   | Function to use                               |
| ------------------------------------ | --------------- | --------------------------------------------- |
| `src/app/page.tsx`                   | Static          | `generateMetadata(SEO_CONFIG.pages.home)` ✅  |
| `src/app/products/page.tsx`          | Static          | `generateMetadata(SEO_CONFIG.pages.products)` |
| `src/app/products/[slug]/page.tsx`   | Dynamic         | `generateProductMetadata(product)`            |
| `src/app/auctions/page.tsx`          | Static          | `generateMetadata(SEO_CONFIG.pages.auctions)` |
| `src/app/auctions/[id]/page.tsx`     | Dynamic         | `generateAuctionMetadata(auction)`            |
| `src/app/categories/[slug]/page.tsx` | Dynamic         | `generateCategoryMetadata(category)`          |
| `src/app/blog/page.tsx`              | Static          | `generateMetadata(SEO_CONFIG.pages.blog)`     |
| `src/app/blog/[slug]/page.tsx`       | Dynamic         | `generateBlogMetadata(post)`                  |
| `src/app/faqs/page.tsx`              | Static          | `generateMetadata(SEO_CONFIG.pages.faqs)`     |
| `src/app/faqs/[category]/page.tsx`   | Dynamic         | based on category                             |
| `src/app/search/page.tsx`            | Dynamic         | `generateSearchMetadata(q, category)`         |
| `src/app/about/page.tsx`             | Static          | `generateMetadata(SEO_CONFIG.pages.about)`    |
| `src/app/contact/page.tsx`           | Static          | `generateMetadata(SEO_CONFIG.pages.contact)`  |
| `src/app/sellers/[id]/page.tsx`      | Dynamic         | `generateProfileMetadata(user)`               |
| All admin/seller/user pages          | `noIndex: true` | `generateMetadata({ ..., noIndex: true })`    |

---

## Master File Change List (All Sections)

### New Files

```
src/hooks/useUrlTable.ts                                  — Section A
src/components/ui/FilterFacetSection.tsx                  — Section B
src/components/ui/FilterDrawer.tsx                        — Section B
src/components/ui/ActiveFilterChips.tsx                   — Section B
src/components/ui/CategorySelectorCreate.tsx              — Section C
src/components/ui/AddressSelectorCreate.tsx               — Section C
src/components/ui/SortDropdown.tsx                        — Section A (Tier 1 — not admin-specific)
src/components/ui/TablePagination.tsx                     — Section A (Tier 1 — wraps existing Pagination)
src/app/faqs/[category]/page.tsx                          — Section E
```

### Modified — Shared Infrastructure

```
src/components/ui/SideDrawer.tsx                          — add side prop (Section B)
src/components/ui/index.ts (or barrel)                    — export new components (incl. SortDropdown, TablePagination)
src/hooks/index.ts                                        — export useUrlTable
src/components/admin/AdminFilterBar.tsx                   — add withCard?: boolean prop; default: true; no breaking change (Section A)
src/components/admin/DataTable.tsx                        — externalPagination + view toggle; reuses mobileCardRender (Section A)
src/components/search/SearchResultsSection.tsx            — onPageChange (Section A)
src/components/products/ProductFilters.tsx                — add FilterDrawer on mobile (Section B)
src/components/faq/FAQCategorySidebar.tsx                 — URL links + move labels to constants (Section E, G)
src/components/homepage/FAQSection.tsx                    — add category tabs (Section E)
src/components/layout/Footer.tsx                          — rewrite canonical footer (Section F)
src/constants/ui.ts                                       — add missing UI_LABELS (Section G)
src/constants/messages.ts                                 — add missing SUCCESS_MESSAGES (Section G)
src/constants/routes.ts                                   — add FAQ_CATEGORY route helper (Section E, G)
src/constants/navigation.tsx                              — lucide-react icons (Section F)
src/db/schema/product.schema.ts                           — add pickupAddressId field (Section C)
```

> **Import update rule:** When any file is deleted, grep the entire `src/` tree for its old import path and update every match before merging. No re-export shims.

### Modified — Admin Pages (Section A)

```
src/app/admin/users/[[...action]]/page.tsx
src/app/admin/orders/[[...action]]/page.tsx
src/app/admin/products/[[...action]]/page.tsx             — add filter+search bar
src/app/admin/reviews/[[...action]]/page.tsx              — add explicit pageSize
src/app/admin/bids/[[...action]]/page.tsx
src/app/admin/coupons/[[...action]]/page.tsx              — add search bar
src/app/admin/faqs/[[...action]]/page.tsx                 — add search bar
```

### Modified — Public / Seller / User Pages (Sections A, B, C, D)

```
src/app/products/page.tsx                                 — useUrlTable; push→replace; FilterDrawer
src/app/search/page.tsx                                   — useUrlTable; FilterDrawer
src/app/auctions/page.tsx                                 — useUrlTable; FilterDrawer; fetch→apiClient
src/app/blog/page.tsx                                     — useUrlTable; <Pagination>
src/app/categories/[slug]/page.tsx                        — useUrlTable; FilterDrawer; fix disabled bug
src/app/faqs/page.tsx                                     — drop ?category= handling; rewrite
src/app/seller/products/page.tsx                          — useUrlTable; open create/edit via SideDrawer
src/app/seller/orders/page.tsx                            — useUrlTable; <TablePagination>; fix revenue
src/app/user/orders/page.tsx                              — useUrlTable; status tabs; <TablePagination>
```

### New Files — Sections H, I, J, K

```
src/hooks/useLongPress.ts                                 — Section H
src/hooks/usePullToRefresh.ts                             — Section H
src/components/homepage/HomepageSkeleton.tsx              — Section I
```

### New Files — Sections L, M

```
src/lib/seo/json-ld.ts                                    — Section M (JSON-LD helpers)
src/lib/seo/index.ts                                      — Section M (barrel)
src/app/sitemap.ts                                        — Section M
src/app/robots.ts                                         — Section M
src/app/opengraph-image.tsx                               — Section M
```

### Modified — Sections H, I, J, K

```
src/hooks/useSwipe.ts                                     — extend (Section H)
src/hooks/index.ts                                        — + useLongPress, usePullToRefresh
src/components/ui/SideDrawer.tsx                          — gestures + ARIA + focus trap (H)
src/components/ui/FilterDrawer.tsx                        — gesture + ARIA (H)
src/components/ui/FilterFacetSection.tsx                  — keyboard + ARIA (H)
src/components/ui/ActiveFilterChips.tsx                   — ARIA list roles (H)
src/components/ui/Tabs.tsx  (or SectionTabs)              — keyboard tablist (H)
src/components/ui/Button.tsx                              — isLoading prop; min touch target (K)
src/components/ui/FormField.tsx                           — helperText prop (K)
src/components/ui/EmptyState.tsx                          — illustration slot; audit props (K)
src/components/admin/DataTable.tsx                        — row swipe; aria-sort (H)
src/components/admin/TablePagination.tsx                  — ARIA nav (H)
src/components/admin/AdminPageHeader.tsx                  — description + breadcrumb (J)
src/components/layout/Sidebar.tsx                         — active state + grouping (J)
src/components/homepage/HeroCarousel.tsx                  — swipe + ARIA + lucide icons (H, I)
src/components/homepage/FeaturedProductsSection.tsx       — mobile snap carousel + CTA (I)
src/components/homepage/FeaturedAuctionsSection.tsx       — snap carousel + countdown (I)
src/components/homepage/TopCategoriesSection.tsx          — count badge + hover + lucide icons (I)
src/components/homepage/CustomerReviewsSection.tsx        — swipe + star rating + badge (I)
src/components/homepage/TrustIndicatorsSection.tsx        — merge + lucide icons + scroll-in (I)
src/components/homepage/NewsletterSection.tsx             — mutation + toast + success state (I, K)
src/components/homepage/WhatsAppCommunitySection.tsx      — lucide icon + config URL (I)
src/app/admin/page.tsx                                    — quick actions + skeleton (J)
src/app/seller/page.tsx                                   — earnings chart + attention card (J)
src/app/user/page.tsx  (or profile)                       — recent orders + formatted stats (J)
src/constants/ui.ts                                       — UI_LABELS.HOMEPAGE.*, UI_HELP_TEXT.*, touch
src/constants/messages.ts                                 — human error + success messages (K)
src/constants/theme.ts                                    — THEME_CONSTANTS.touch.* (K)
tailwind.config.js                                        — reduced-motion (H)
src/app/globals.css                                       — prefers-reduced-motion rule (H)
```

### Modified — Sections L, M

```
src/constants/seo.ts                                      — add generateProduct/Category/Blog/Auction/SearchMetadata
src/db/schema/products.ts                                 — add seoTitle, seoDescription, seoKeywords, slug, image altText
src/db/schema/blog-posts.ts                               — add seoTitle, seoDescription, seoKeywords; verify slug
src/db/schema/categories.ts                               — add seoTitle, seoDescription; verify slug
src/app/api/media/upload/route.ts                         — SEO-friendly filename generation
src/components/admin/ProductForm.tsx (or seller equiv)    — SEO tab: seoTitle, seoDescription, seoKeywords, altText fields
src/components/admin/BlogForm.tsx                         — SEO tab: seoTitle, seoDescription, seoKeywords
src/app/products/page.tsx                                 — add generateMetadata export (M)
src/app/products/[slug]/page.tsx                          — rename from [id]; add generateProductMetadata (L, M)
src/app/auctions/page.tsx                                 — add generateMetadata export (M)
src/app/blog/page.tsx                                     — add generateMetadata export (M)
src/app/blog/[slug]/page.tsx                              — add generateBlogMetadata export (M)
src/app/categories/[slug]/page.tsx                        — add generateCategoryMetadata export (M)
src/app/faqs/page.tsx                                     — add generateMetadata export (M)
src/app/faqs/[category]/page.tsx                          — add per-category metadata (M)
src/app/search/page.tsx                                   — add generateSearchMetadata (M)
src/app/about/page.tsx                                    — add generateMetadata (M)
src/app/contact/page.tsx                                  — add generateMetadata (M)
src/lib/validation/schemas.ts                             — merge in validation-schemas.ts content (L)
```

### Deleted Files (All Sections)

```
src/components/homepage/EnhancedFooter.tsx                — Section F (replaced by updated Footer.tsx)
src/components/homepage/SiteFeaturesSection.tsx           — Section I (merged into TrustIndicatorsSection)
src/app/seller/products/new/page.tsx                      — Section D (drawer from list page)
src/app/seller/products/[id]/edit/page.tsx                — Section D (drawer from list page)
src/components/utility/Breadcrumbs.tsx                    — Section L (canonical is layout/Breadcrumbs.tsx)
src/lib/api/validation-schemas.ts                         — Section L (merged into lib/validation/schemas.ts)
src/app/api/profile/update/route.ts                       — Section L (callers → /api/user/profile)
src/app/api/profile/update-password/route.ts              — Section L (callers → /api/user/change-password)
```

> **Import update rule:** When any file is deleted, `grep -r "OldName" src/` and update every match before merging. No re-export shims.

---

## Master Implementation Order

1. **Install `lucide-react`** + update `navigation.tsx` and `Footer` (Section F)
2. **Constants additions** (`UI_LABELS`, `UI_HELP_TEXT`, `ROUTES`, `SUCCESS_MESSAGES`, `THEME_CONSTANTS.touch`) — Sections G, K
3. **`useUrlTable` hook** + barrel export — Section A
4. **`SideDrawer` — add `side` prop** + update all existing call sites explicitly — Section B
5. **`FilterFacetSection`** + **`FilterDrawer`** + **`ActiveFilterChips`** — Section B
6. **`SortDropdown`** + **`TablePagination`** + **`FilterBar`** — Section A (all in `src/components/ui/`; refactor `AdminFilterBar` as thin wrapper)
7. **`DataTable` remove internal pagination** + **grid/list view toggle** + **`SearchResultsSection` `onPageChange`** — Section A
8. **Export all new components** from barrel files
9. **`CategorySelectorCreate`** + **`AddressSelectorCreate`** + `ProductDocument.pickupAddressId` — Section C
10. **Gesture hooks** (`useLongPress`, `usePullToRefresh`, extend `useSwipe`) — Section H
11. **ARIA + keyboard + focus management** on all new and modified components — Section H
12. **`prefers-reduced-motion`** + touch target constants — Sections H, K
13. **Admin pages** (Section A): Users → Orders → Products → Reviews → Bids → Coupons → FAQs
14. **FAQ routes**: `/faqs/[category]`; `FAQSection` tabs; `FAQCategorySidebar` links — Section E
15. **Seller product create/edit → Drawer** — Section D
16. **Public pages** (Sections A + B): `products` (+ view toggle) → `search` (+ view toggle) → `auctions` (+ view toggle) → `blog` → `categories/[slug]` (+ view toggle)
17. **Seller pages** (Section A): `seller/products` (+ view toggle) → `seller/orders`
18. **User pages** (Section A): `user/orders`
19. **Homepage sections** (Section I): HeroCarousel → Featured → Categories → Reviews → TrustFeatures → Newsletter → WhatsApp → HomepageSkeleton; delete `SiteFeaturesSection`
20. **Dashboard styling** (Section J): admin dashboard → seller dashboard → user dashboard → sidebar → `AdminPageHeader` audit
21. **Non-tech UX** (Section K): plain language sweep → empty states → onboarding flows → form helper text → human toasts → touch targets → loading states
22. **Delete `EnhancedFooter`**; verify single footer in layout
23. **Constants cleanup** — remaining hardcoded string violations (Section G)
24. **Code deduplication** (Section L): delete `utility/Breadcrumbs.tsx`; merge `lib/api/validation-schemas.ts` → `lib/validation/schemas.ts`; consolidate `/api/profile/update` → `/api/user/profile` and `/api/profile/update-password` → `/api/user/change-password`; grep all call sites and update
25. **SEO** (Section M): extend `src/constants/seo.ts` with 5 new `generate*Metadata` functions; create `src/lib/seo/json-ld.ts` (9 JSON-LD helpers); add `sitemap.ts` + `robots.ts` + `opengraph-image.tsx`; add SEO schema fields to `products`, `blog-posts`, `categories`; add SEO tab to `ProductForm` + `BlogForm`; add `export const metadata` / `generateMetadata` to every public page; rename `/products/[id]` → `/products/[slug]`; update media upload to use SEO-friendly file naming
