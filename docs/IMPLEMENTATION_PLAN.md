# Frontend Implementation Plan

> **Source:** Derived from `FRONTEND_REFACTOR_PLAN.md` audit (Feb 20, 2026)  
> **Principle:** Each phase is independently shippable. Later phases depend on earlier ones. Tests are last.

---

## Phase Overview

> **Testing strategy:** Every sub-step in every phase includes tests written immediately after the implementation code. There is no separate test phase. Tests ship in the same PR as the code they cover.

| Phase  | Name                                           | Sections               | Risk                              | Est. files (impl + tests) |
| ------ | ---------------------------------------------- | ---------------------- | --------------------------------- | ------------------------- |
| **1**  | Foundation — deps, constants, schema + cleanup | F1, G, C4, G-remaining | 🟢 Zero breaking                  | ~12                       |
| **2**  | Shared UI primitives                           | B1–B5, A1–A3           | 🟢 Additive only                  | ~18                       |
| **3**  | Infrastructure wiring                          | A4–A5, barrel exports  | 🟡 Minor API change               | ~8                        |
| **4**  | Admin pages                                    | A (admin)              | 🟡 Admin-only impact              | ~14                       |
| **5**  | Public list pages                              | A+B (public)           | 🟡 User-facing                    | ~10                       |
| **6**  | Seller & user pages + CRUD drawers             | A+B+D (seller/user)    | 🟡 Seller-facing                  | ~10                       |
| **7**  | FAQ routes + homepage tabs                     | E                      | 🟡 New routes                     | ~8                        |
| **8**  | Footer & navigation rewrite                    | F2–F5                  | 🟠 Visual, site-wide              | ~8                        |
| **9**  | Inline create drawers                          | C1–C3                  | 🟠 Schema change                  | ~10                       |
| **10** | Gestures + accessibility                       | H                      | 🟠 Cross-cutting                  | ~22                       |
| **11** | Homepage sections                              | I                      | 🟡 Public-facing                  | ~20                       |
| **12** | Dashboard page styling                         | J                      | 🟡 Internal-facing                | ~16                       |
| **13** | Non-tech friendly UX                           | K                      | 🟠 User-facing, site-wide         | ~28                       |
| **14** | Code deduplication                             | L                      | 🟡 Minor breaking (route renames) | ~12                       |
| **15** | SEO — full-stack coverage                      | M                      | 🟢 Additive + schema change       | ~30                       |
| **16** | Newsletter admin management                    | N                      | 🟢 Additive                       | ~8                        |
| **17** | Next.js 16 compatibility — async params        | Maintenance            | 🟢 Zero breaking                  | ~5                        |
| **18** | Dedicated test phase                           | All phases 1–17        | 🟢 Non-breaking (tests only)      | ~90 test files            |

---

## Progress Tracker

> Update this table as work proceeds. One phase at a time — mark **In Progress** before starting, **Done** when every file change and test in that phase is complete and `npx tsc --noEmit` passes.

| Phase  | Status         | Started    | Completed  | Notes                                                                                                                                                                                           |
| ------ | -------------- | ---------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1**  | ✅ Done        | 2026-02-21 | 2026-02-21 |                                                                                                                                                                                                 |
| **2**  | ✅ Done        | 2026-02-21 | 2026-02-21 | 48 tests · 9 components/hooks · 0 TS errors                                                                                                                                                     |
| **3**  | ✅ Done        | 2026-02-21 | 2026-02-21 | 12 tests · externalPagination · SearchResultsSection Pagination                                                                                                                                 |
| **4**  | ✅ Done        | 2026-02-21 | 2026-02-21 | 7 admin pages · useUrlTable · server pagination · filter bars · FAQs data bug fixed · 0 TS errors                                                                                               |
| **5**  | ✅ Done        | 2026-02-21 | 2026-02-21 | products · search · auctions · blog · categories/[slug] · FilterDrawer · ActiveFilterChips                                                                                                      |
| **6**  | ✅ Done        | 2026-02-21 | 2026-02-21 | seller/products drawer · seller/orders · user/orders · CRUD drawers verified                                                                                                                    |
| **7**  | ✅ Done        | 2026-02-21 | 2026-02-21 | FAQ dynamic route · category tabs · FAQCategorySidebar URL update                                                                                                                               |
| **8**  | ✅ Done        | 2026-02-21 | 2026-02-21 | Footer 5-col rewrite · EnhancedFooter deleted · lucide-react nav icons · Sidebar polish                                                                                                         |
| **9**  | ✅ Done        | 2026-02-21 | 2026-02-21 | CategorySelectorCreate · AddressSelectorCreate · ProductForm wired                                                                                                                              |
| **10** | ✅ Done        | 2026-02-21 | 2026-02-21 | useLongPress · usePullToRefresh · SideDrawer focus trap · Tabs keyboard · HeroCarousel ARIA                                                                                                     |
| **11** | ✅ Done        | 2026-02-21 | 2026-02-21 | TrustFeaturesSection (merged) · HomepageSkeleton · mobile snap-scroll carousels · lucide icons · useSwipe · useApiMutation newsletter                                                           |
| **12** | ✅ Done        | 2026-02-21 | 2026-02-21 | AdminStatsCards lucide+stat tokens · AdminDashboardSkeleton · SellerStatCard ReactNode icon · RecentActivityCard lucide · AdminPageHeader description+breadcrumb · user/profile hooks order fix |
| **13** | ✅ Done        | 2026-02-21 | 2026-02-21 | Button isLoading+touch targets · EmptyState actionHref · SORT/HELP_TEXT/ACTIONS constants · messages human-friendly · search EmptyState+lucide · products empty state · seller onboarding       |
| **14** | ✅ Done        | 2026-02-21 | 2026-02-21 | AutoBreadcrumbs extracted · validation schemas merged · profile PATCH on USER.PROFILE · 4 files deleted · 0 TS errors                                                                           |
| **15** | ✅ Done        | 2026-02-21 | 2026-02-21 | sitemap · robots · OG image · JSON-LD helpers · product slug URLs · per-page metadata · noIndex for auth/admin/seller/user/checkout/cart                                                        |
| **16** | ✅ Done        | 2026-02-22 | 2026-02-22 | newsletter subscriber list · stats · unsubscribe/resubscribe/delete · Sieve-powered API · admin nav entry                                                                                       |
| **17** | ✅ Done        | 2026-02-21 | 2026-02-21 | Next.js 16 async params migration: 4 route handlers + faqs page · .next cache cleared · 0 TS errors                                                                                             |
| **18** | ⬜ Not started | —          | —          | Dedicated test phase — all sub-phases below                                                                                                                                                     |

**Status legend:** ⬜ Not started · 🔵 In progress · ✅ Done · ⏸ Blocked

---

## Viewport Targets

Every component and page **must look and work correctly at all three viewport classes.** Design decisions, breakpoint choices, and layout switches in every phase are governed by this matrix.

| Class          | Breakpoint       | Tailwind prefix               | Typical device                           | Key layout rules                                                                                                               |
| -------------- | ---------------- | ----------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Mobile**     | < 640 px         | _(default)_                   | Phone portrait/landscape                 | Single column; drawers full-screen (`w-full`); bottom nav or hamburger; no visible sidebars                                    |
| **Desktop**    | 640 px – 1535 px | `sm:` · `md:` · `lg:` · `xl:` | Tablet portrait → standard 1080p monitor | Two-column layouts appear at `lg`; drawers partial-width (`md:w-3/5`); sidebars visible at `lg+`                               |
| **Widescreen** | ≥ 1536 px        | `2xl:`                        | 1440p / 4K / ultrawide                   | Max-width containers cap at `max-w-screen-2xl`; admin sidebar + main + detail panel can coexist; DataTable gains extra columns |

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

> **Widescreen rule:** Never let content stretch edge-to-edge on ≥ 1536 px. All page wrappers use `max-w-screen-2xl mx-auto px-4 lg:px-8 2xl:px-12`. If a component currently uses a narrower max-width, preserve it — do not widen just because more space is available.

---

## Phase 1 — Foundation

**Goal:** All prerequisites in place. Nothing breaks. No UI changes.

### 1.1 Install `lucide-react`

```bash
npm install lucide-react
```

### 1.2 Add missing constants

**`src/constants/ui.ts`** — add these keys:

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
UI_LABELS.ACTIONS.VIEW_ALL_ARROW = "View all →";
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

**`src/constants/messages.ts`** — add:

```typescript
SUCCESS_MESSAGES.CATEGORY.CREATED = "Category created successfully";
SUCCESS_MESSAGES.ADDRESS.CREATED = "Address saved successfully";
```

**`src/constants/routes.ts`** — add:

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
src/constants/ui.ts                 + ~30 new label/placeholder keys; + ROLE_OPTIONS → UI_LABELS.ROLES.*
src/constants/messages.ts           + 2 new success messages
src/constants/routes.ts             + FAQ_CATEGORY helper + 6 new routes
src/db/schema/product.schema.ts     + pickupAddressId field
src/components/admin/users/UserFilters.tsx    replace ROLE_OPTIONS strings → UI_LABELS.ROLES.*
src/components/faq/FAQCategorySidebar.tsx     move FAQ_CATEGORY_OPTIONS → @/constants
src/components/search/SearchFiltersRow.tsx   replace inline input class → THEME_CONSTANTS.input.base
```

### 1.4 Tests — Phase 1

**`src/constants/__tests__/seo.test.ts`** _(verify existing or create)_:

- `generateMetadata()` sets correct `title`, `description`, `openGraph`, `twitter`, `alternates.canonical`
- `noIndex: true` produces `robots: { index: false, follow: false }`

**`src/db/schema/__tests__/product.schema.test.ts`** _(add assertions)_:

- `PRODUCT_FIELDS.PICKUP_ADDRESS_ID` equals `'pickupAddressId'`
- `'pickupAddressId'` is present in `PRODUCT_UPDATABLE_FIELDS`

**`src/components/admin/users/__tests__/UserFilters.test.tsx`** _(update)_:

- Role dropdown option labels match `UI_LABELS.ROLES.*` — no hardcoded string literals in render output

---

## Phase 2 — Shared UI Primitives

**Goal:** All new reusable components created and barrel-exported. No page uses them yet.

### 2.1 `SideDrawer` — Add `side` prop

**`src/components/ui/SideDrawer.tsx`:**

Add `side: 'left' | 'right'` to `SideDrawerProps`. All existing call sites use `side="right"` — update them directly. Delete the hardcoded `right-0` class.

```tsx
// Position classes based on side
const positionClass =
  side === "left"
    ? "left-0 w-full sm:w-96 md:w-[420px]"
    : "right-0 w-full md:w-3/5 lg:max-w-2xl";
```

**After adding the prop:** grep all `<SideDrawer` usages and add `side="right"` to each existing call site, then remove the hardcoded fallback.

### 2.2 `FilterFacetSection` — `src/components/ui/FilterFacetSection.tsx`

**Tier 1 — Shared primitive. Not admin-specific.** Used on public pages (products, search, categories/[slug], auctions), seller pages (seller/products), and any admin list page that adopts the drawer pattern.

```tsx
"use client";
// Props: title, options: {value, label, count?}[], selected: string[],
//        onChange, searchable=true, pageSize=10, className
// - Internal useState for searchQuery + visibleCount (starts at pageSize)
// - Filters options by searchQuery (client-side)
// - Shows visibleCount items, "Load 10 more" increments visibleCount
// - Selected chips rendered above list with × dismiss
// - Collapses via <Accordion> or local isCollapsed state
```

**Key implementation rules:**

- Use `UI_LABELS.TABLE.LOAD_MORE` for the load button
- Use `UI_PLACEHOLDERS` for search input: `UI_LABELS.FILTERS.SEARCH_IN(title)`
- Use `THEME_CONSTANTS.input.base` for search input styling
- Chips use `THEME_CONSTANTS.badge.*` tokens

### 2.3 `FilterDrawer` — `src/components/ui/FilterDrawer.tsx`

**Tier 1 — Shared primitive. Not admin-specific.** Used by: `products/page.tsx` (mobile), `search/page.tsx`, `categories/[slug]/page.tsx`, `auctions/page.tsx`, `seller/products/page.tsx`. Admin list pages that need a toggleable filter panel on smaller viewports use it too.

```tsx
"use client";
// Wraps <SideDrawer side="left" mode="view" title="Filters">
// Header shows active filter count badge when activeCount > 0
// Footer: <DrawerFormFooter> styled with "Clear All" + "Apply" buttons
// Children: one or more <FilterFacetSection /> instances
```

### 2.4 `ActiveFilterChips` — `src/components/ui/ActiveFilterChips.tsx`

**Tier 1 — Shared primitive. Not admin-specific.** Renders on every list page that has active filters — public, seller, and admin alike. Sits below the `FilterDrawer` trigger or inline `AdminFilterBar`.

```tsx
"use client";
// Props: filters: {key, label, value}[], onRemove(key), onClearAll
// Horizontal flex-wrap row of chips
// Each chip: "[Label: Value ×]"
// "Clear all" text button at end when filters.length > 1
// Hidden when filters.length === 0 (returns null)
```

### 2.5 `useUrlTable` hook — `src/hooks/useUrlTable.ts`

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

### 2.6 `SortDropdown` — `src/components/ui/SortDropdown.tsx`

```tsx
// Props: value, onChange, options: {value, label}[], label?, className?
// Renders: labelled <select> using THEME_CONSTANTS.input.base
// Label defaults to UI_LABELS.TABLE.SORT_BY
// Used by <AdminFilterBar>, <FilterBar>, and any page needing a standalone sort control
// NOT admin-specific — lives in src/components/ui/
```

### 2.7 `TablePagination` — `src/components/ui/TablePagination.tsx`

```tsx
// Props: currentPage, totalPages, pageSize, total, onPageChange,
//        onPageSizeChange?, pageSizeOptions=[10,25,50,100], isLoading?
// Renders: result count text + <Pagination> + per-page <select>
// Result count: "Showing {from}–{to} of {total} results"
// Uses UI_LABELS.TABLE.SHOWING / OF / RESULTS / PER_PAGE
// Uses THEME_CONSTANTS for all styling
// NOT admin-specific — lives in src/components/ui/
```

### 2.8 `AdminFilterBar` — Add `withCard` prop — `src/components/admin/AdminFilterBar.tsx`

**No new file.** `AdminFilterBar` already exists and already accepts `children`, `columns`, `className`. Its only distinction from a bare `FilterBar` is the `<Card>` wrapper. Extend it in-place:

```tsx
interface AdminFilterBarProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4; // unchanged
  className?: string; // unchanged
  withCard?: boolean; // NEW — default: true (backward compat)
}

// Implementation: when withCard=false, render the inner grid div directly (no Card).
// This covers every non-admin filter bar without a new file or new import path.
// Usage on public/seller pages:
//   <AdminFilterBar withCard={false} columns={2}>…</AdminFilterBar>
// Usage on admin pages (unchanged — withCard defaults to true):
//   <AdminFilterBar columns={3}>…</AdminFilterBar>
```

> No new export needed — `AdminFilterBar` is already exported from `@/components`.

### 2.9 `DataTable` — Grid / List / Table View Toggle — `src/components/admin/DataTable.tsx`

**Reuses existing code.** `DataTable` already has `mobileCardRender?: (item: T) => ReactNode` — it renders cards on `< md` and the table on `≥ md` via CSS. The view toggle extends this pattern: instead of breakpoint-driven CSS hiding, the user explicitly picks the mode.

```tsx
// EXISTING prop kept (backward compat):
//   mobileCardRender?: (item: T) => ReactNode   — unchanged; still hides/shows via CSS if no viewMode

// NEW props:
//   showViewToggle?: boolean                           — show toggle icons in toolbar; default: false
//   viewMode?: 'table' | 'grid' | 'list'              — controlled mode
//   defaultViewMode?: 'table' | 'grid' | 'list'       — uncontrolled default; default: 'table'
//   onViewModeChange?: (mode: 'table'|'grid'|'list') => void

// When showViewToggle=true, mobileCardRender (or a separate renderCard alias) is used for
// grid + list rendering. If mobileCardRender is provided it doubles as renderCard — no
// duplicate prop needed. If caller wants different card layouts for mobile-auto vs view-toggle,
// they pass renderCard separately (optional second prop; falls back to mobileCardRender).

// Render modes:
// table: existing row layout unchanged
// grid:  grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 — card per cell
// list:  flex flex-col gap-2 — card per row (compact)

// Toggle icons: inline SVGs (no external icon library required)
// Match SideDrawer close-button style: p-2 rounded-lg ring-1 ring-gray-200 dark:ring-gray-700
//   hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
// Active mode: bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 ring-indigo-300
// On xs (mobile): only grid + list offered (table columns too wide)

// URL integration — parent uses useUrlTable:
//   viewMode={(table.get('view') || 'grid') as ViewMode}
//   onViewModeChange={(mode) => table.set('view', mode)}
// Note: 'view' param does NOT reset page → 1 (handled in useUrlTable.set guard)
```

**Files changed in Phase 2:**

```
src/components/ui/SideDrawer.tsx             + side: 'left'|'right' prop (existing file)
src/components/ui/FilterFacetSection.tsx     NEW
src/components/ui/FilterDrawer.tsx           NEW
src/components/ui/ActiveFilterChips.tsx      NEW
src/hooks/useUrlTable.ts                     NEW
src/components/ui/SortDropdown.tsx           NEW  (Tier 1 — not admin-specific)
src/components/ui/TablePagination.tsx        NEW  (Tier 1 — wraps existing Pagination)
src/components/admin/AdminFilterBar.tsx      + withCard?: boolean prop (existing file, no new file)
src/components/admin/DataTable.tsx           + showViewToggle/viewMode/onViewModeChange; reuses mobileCardRender
```

### 2.10 Tests — Phase 2

**`src/hooks/__tests__/useUrlTable.test.ts`** _(new)_:

- `set(key, val)` updates the param and resets `page` to `"1"`
- `set('page', val)` does NOT reset page — only changes page
- `set('pageSize', val)` does NOT reset page
- `set('view', val)` does NOT reset page — view toggle is non-destructive
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
- Chip `×` calls `onChange` with value removed
- Keyboard: `Enter` selects focused option; `Escape` clears search input
- ARIA: `role="group"` on wrapper; `aria-checked` on selected options

**`src/components/ui/__tests__/FilterDrawer.test.tsx`** _(new)_:

- Closed when `isOpen=false`; open when `isOpen=true`
- Active count badge shown for `activeCount > 0`, hidden at 0
- "Clear All" calls `onClear`
- `Escape` keydown triggers `onClose`
- Focus trapped inside when open; first focusable element receives focus

**`src/components/ui/__tests__/ActiveFilterChips.test.tsx`** _(new)_:

- One chip per filter; chip `×` calls `onRemove(key)` with correct key
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
- `<label htmlFor>` matches `<select id>` — accessible

**`src/components/ui/__tests__/TablePagination.test.tsx`** _(new)_:

- "Showing X–Y of Z results" text correct (uses `UI_LABELS.TABLE.*`)
- `onPageChange` called with correct page on navigation
- `onPageSizeChange` called when per-page selector changes
- `role="navigation"` on the wrapper
- Prev/next disabled when `isLoading=true`

**`src/components/admin/__tests__/DataTable.viewToggle.test.tsx`** _(new)_:

- `showViewToggle=false` → no toggle icons rendered (default)
- `showViewToggle=true` → table/grid/list toggle bar visible
- On xs viewport → only grid + list icons shown (table hidden)
- Clicking grid icon → `onViewModeChange('grid')` called; `mobileCardRender` output rendered per item
- Clicking list icon → `onViewModeChange('list')` called; `mobileCardRender` output rendered per item
- Clicking table icon → `onViewModeChange('table')` called; column headers rendered
- `defaultViewMode='grid'` → starts in grid mode without external `onViewModeChange`
- Controlled (`viewMode` prop) → does not maintain own state; updates on prop change only
- Active toggle icon has `bg-indigo-50 text-indigo-600` highlight
- Toggle icons are `<button>` elements with `aria-label` and `aria-pressed`
- `mobileCardRender` without `showViewToggle` → original CSS mobile-card behaviour unchanged

---

## Phase 3 — Infrastructure Wiring

**Goal:** Update barrel exports, refactor `DataTable`, fix `SearchResultsSection`. Update all importers directly — no shims, no re-exports.

### 3.1 Barrel exports

**`src/hooks/index.ts`:** Add `useUrlTable` export.

**`src/components/ui/index.ts`:** Add `FilterFacetSection`, `FilterDrawer`, `ActiveFilterChips`, `SortDropdown`, `TablePagination` exports. Remove any old filter component exports being replaced (e.g. `SearchFiltersRow` if fully deleted).

**`src/components/admin/index.ts`:** No removals needed — `AdminFilterBar` already exported; `SortDropdown` and `TablePagination` were never in `admin/`. Keep `AdminPageHeader`, `AdminFilterBar`, `DrawerFormFooter`, `DataTable`. No new admin-only components added in this phase.

**`src/components/index.ts`:** Add new barrel entries. Remove entries for deleted components (`EnhancedFooter`, old pagination buttons, etc.).

### 3.2 `DataTable` — Remove internal pagination

**`src/components/admin/DataTable.tsx`:**

The current `DataTable` has `showPagination` (default: `true`) and `pageSize` (default: `10`) for in-memory pagination. These props are **deprecated in this phase but not yet removed** — removing them is a breaking change requiring all call sites to be updated first.

Strategy:

1. Add `externalPagination?: boolean` prop (default: `false`). When `true`, internal pagination is disabled regardless of `showPagination`.
2. Mark `showPagination` and `pageSize` as `@deprecated` in JSDoc — they still work.
3. Each admin page migration (Phase 4) passes `externalPagination` and adds `<TablePagination>` externally.
4. After all call sites are migrated (end of Phase 6), remove the deprecated props in a cleanup PR.

```tsx
interface DataTableProps<T> {
  // Deprecated — will be removed after full migration:
  /** @deprecated Use externalPagination + <TablePagination> instead */
  showPagination?: boolean;
  /** @deprecated Use externalPagination + <TablePagination> instead */
  pageSize?: number;

  // New — enables external pagination:
  externalPagination?: boolean; // disables internal page state and slice when true
}
```

**This session's PR:** Add `externalPagination` prop only. No existing call sites break.
**Phase 4–6 PRs:** Each page adds `externalPagination` + `<TablePagination>`.
**Cleanup PR (after Phase 6):** Remove `showPagination`, `pageSize`, internal state, and `paginatedData` slice.

### 3.3 `SearchResultsSection` — Replace pagination props

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

### 3.4 Tests — Phase 3

**`src/components/admin/__tests__/DataTable.test.tsx`** _(update pagination section)_:

- When `externalPagination=true`: all passed rows rendered — no internal page slicing; no pagination footer inside DataTable
- When `externalPagination=false` (default): existing `showPagination`/`pageSize` behaviour unchanged (backward compat)
- `aria-sort` attribute updated on sort column header click
- Existing column-render and row-action tests remain unchanged

**`src/components/search/__tests__/SearchResultsSection.test.tsx`** _(update)_:

- Delete tests for `onPrevPage` / `onNextPage` (props removed)
- `onPageChange(n)` called with correct page number on nav
- `<Pagination>` rendered; no raw `<button>Prev</button>` / `<button>Next</button>`

---

## Phase 4 — Admin Pages

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
  queryKey: ['admin', 'resource', table.params.toString()],  // ← key change
  queryFn: () => apiClient.get(
    `${API_ENDPOINTS.ADMIN.RESOURCE}${table.buildSieveParams(filtersArr.join(','))}`
  ),
});

// 4. Replace DataTable pagination
<DataTable
  columns={...}
  data={data?.items ?? []}
  loading={isLoading}
  externalPagination   // ← new prop
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
| **Users**    | Search input + Role dropdown + Status tabs           | `status=active` → `disabled==false`; `status=banned` → `disabled==true`; `status=admins` → `role==admin` |
| **Orders**   | Status tabs + Sort dropdown                          | `status==<value>`                                                                                        |
| **Products** | Search input + Status dropdown + Sort dropdown       | Add these — currently absent                                                                             |
| **Reviews**  | Search input + Status dropdown + Rating (1–5) + Sort | `rating==<value>` added                                                                                  |
| **Bids**     | Status tabs + Sort dropdown                          | `status==<value>`; default sort `-bidDate`                                                               |
| **Coupons**  | Search input + Sort dropdown                         | Search → `code@=*<term>`; currently absent                                                               |
| **FAQs**     | Search input + Sort dropdown                         | Search → `question@=*<term>`; currently absent                                                           |

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

### 4.x Tests — Phase 4

For each page add/update `src/app/admin/<name>/__tests__/page.test.tsx`:

**Common assertions (every admin page):**

- Filter/sort state changes update `?` URL params via `router.replace()` not `router.push()`
- `queryKey` contains `table.params.toString()` — cache busts on filter change
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

## Phase 5 — Public List Pages ✅ Done

**Goal:** `products`, `search`, `auctions`, `blog`, `categories/[slug]` all URL-driven with `<Pagination>` and filter drawers.

### 5.1 `products/page.tsx`

- Replace ~50 lines of `useState` + `useEffect` + `updateUrl()` with `useUrlTable` (defaults: `{ view: 'grid', sort: '-createdAt' }`)
- Switch `router.push` → `router.replace` (automatic via `useUrlTable`)
- Replace 3 copies of raw `<button>` pagination → single `<Pagination>`
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

- Convert local `sort`/`page` state → `useUrlTable` (defaults: `{ view: 'grid' }`)
- Replace raw `<button>` prev/next → `<Pagination>`
- Replace `fetch()` → `apiClient.get()`
- Add `<FilterDrawer>` with Price range, Sort direction
- **View toggle:** grid + list modes; pass `mobileCardRender` with auction card component

### 5.4 `blog/page.tsx`

- Convert local `activeCategory`/`page` state → `useUrlTable`
- Replace raw `<Button>` prev/next → `<Pagination>`
- Add result count display

### 5.5 `categories/[slug]/page.tsx`

- Convert local `sort`/`page` state → `useUrlTable` (defaults: `{ view: 'grid' }`)
- Replace raw `<button>` prev/next → `<Pagination>`
- **Fix disabled bug:** change `products.length < PAGE_SIZE` → `page >= totalPages`
- Add `<FilterDrawer>` with Brand, Rating, Price facets
- **View toggle:** grid + list modes; pass `mobileCardRender` with `<ProductCard>`

**Files changed in Phase 5:**

```
src/app/products/page.tsx
src/app/search/page.tsx
src/app/auctions/page.tsx
src/app/blog/page.tsx
src/app/categories/[slug]/page.tsx
src/components/products/ProductFilters.tsx    — wrap with FilterDrawer on mobile
src/components/search/SearchFiltersRow.tsx    — replaced by FilterDrawer pattern
```

### 5.6 Tests — Phase 5

**`src/app/products/__tests__/page.test.tsx`** _(update)_:

- URL params drive the API query — no local `useState` for filters
- `router.replace()` used (not `push()`) on filter change
- `<Pagination>` rendered; no raw prev/next buttons
- `FilterDrawer` trigger button visible on mobile viewport mock

**`src/app/search/__tests__/page.test.tsx`** _(update)_:

- `onPageChange` wired to `table.setPage()` — verify correct page param in URL
- `buildUrl` helper deleted; URL built via `useUrlTable`

**`src/app/auctions/__tests__/page.test.tsx`** _(update)_:

- Uses `apiClient.get()` not raw `fetch()` — mock `apiClient`, not `fetch`
- `sort` and `page` state in URL params; `<Pagination>` rendered

**`src/app/categories/[slug]/__tests__/page.test.tsx`** _(update)_:

- Disabled "next" condition is `page >= totalPages` not `products.length < PAGE_SIZE`
- `FilterDrawer` present with brand/rating/price facets
- View toggle rendered; switching to `grid` or `list` mode updates `?view=` URL param
- `mobileCardRender` with `<ProductCard>` renders correctly in grid/list view

---

## Phase 6 — Seller & User Pages + CRUD Drawers ✅ Done

### 6.1 `seller/products/page.tsx`

- Add `useUrlTable` with `pageSize=25`, `sort=-createdAt`, `view='grid'`
- Add search input + sort dropdown in `<AdminFilterBar withCard={false}>`
- Add `<FilterDrawer>` with Status, Category, Price facets (mobile — `AdminFilterBar` row stays for md+)
- Add `<ActiveFilterChips>` above the product grid/table
- Drop hardcoded `pageSize=100` — use real server pagination
- Add `<TablePagination>` below `<DataTable externalPagination>`
- **View toggle:** grid + table modes (seller benefits from both; `mobileCardRender` with product card)
- Add "New product" button that opens `<SideDrawer mode="create">` with `<ProductForm>`
- Add edit/delete buttons per row that open `<SideDrawer mode="edit">` / `<SideDrawer mode="delete">`
- **Delete `seller/products/new/page.tsx` and `seller/products/[id]/edit/page.tsx`** — these routes no longer exist. Any external links to `/seller/products/new` should be updated to open the seller products list page where the drawer is triggered.

### 6.2 `seller/orders/page.tsx`

- Add `useUrlTable` with `pageSize=25`
- Add status filter tabs (All / Pending / Confirmed / Shipped / Delivered / Cancelled) — maps to `status==<value>` Sieve filter
- Send `page` param to API (currently missing)
- Add `<TablePagination>` below table
- **Fix revenue total:** read from `data?.meta?.totalRevenue` — remove `orders.reduce()` calculation that breaks with pagination

### 6.3 `user/orders/page.tsx`

- Add `useUrlTable` with `pageSize=10`
- Add status filter tabs (All / Pending / Confirmed / Shipped / Delivered / Cancelled)
- Add `<TablePagination>`
- Fix non-standard `data?.data?.orders` nesting — use consistent `data?.items`

### 6.4 Admin CRUD drawers verification

Read and verify these pages/components — confirm drawer vs full-page:

- `admin/products/[[...action]]` — does the `[[...action]]` already open drawers?
- `admin/coupons/[[...action]]` — check `FaqForm` usage pattern
- `admin/faqs/[[...action]]` — the `FaqForm` component exists, check integration

Apply `SideDrawer mode="edit"` for status changes on reviews/bids/orders if inline actions are confirmed.

**Files changed in Phase 6:**

```
src/app/seller/products/page.tsx               rewrite with drawer + useUrlTable
src/app/seller/products/new/page.tsx           DELETE
src/app/seller/products/[id]/edit/page.tsx     DELETE
src/app/seller/orders/page.tsx                 useUrlTable + revenue fix
src/app/user/orders/page.tsx                   useUrlTable + status tabs
```

### 6.5 Tests — Phase 6

**`src/app/seller/products/__tests__/page.test.tsx`** _(update)_:

- No navigation to `/seller/products/new` — "Add product" click opens `SideDrawer`
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

## Phase 7 — FAQ Routes + Homepage Tabs ✅ Done

### 7.1 New dynamic route

**`src/app/faqs/[category]/page.tsx`** — new file:

```tsx
// Accepts params.category (validated against FAQ_CATEGORIES keys)
// Renders same FAQPageContent but with category pre-selected
// generateStaticParams() returns all 7 FAQ_CATEGORIES keys
// Invalid category → redirect to /faqs
```

### 7.2 `src/app/faqs/page.tsx` — rewrite to use segment

```tsx
// DELETE the ?category= query param handling entirely
// Rewrite to render default (no-category) FAQ list or redirect to /faqs/general
// Update all internal links that previously used ?category= (done in 7.4)
```

### 7.3 `FAQSection.tsx` — add category tabs

```tsx
// Replace single featured=true fetch with tabbed interface
// Default tab: 'general'
// Use <SectionTabs> from @/components with FAQ_CATEGORIES labels
// Per-tab fetch: GET /api/faqs?category=<key>&limit=6
// "View all →" links to ROUTES.PUBLIC.FAQ_CATEGORY(activeCategory)
// Remove hardcoded → arrow — use UI_LABELS.ACTIONS.VIEW_ALL_ARROW
```

### 7.4 `FAQCategorySidebar.tsx` — update links

```tsx
// Change all href from `${ROUTES.PUBLIC.FAQS}?category=${key}`
//                   to ROUTES.PUBLIC.FAQ_CATEGORY(key)
// Move FAQ_CATEGORIES constant out of this file → import from @/constants
```

**Files changed in Phase 7:**

```
src/app/faqs/[category]/page.tsx     NEW
src/app/faqs/page.tsx                + redirect logic
src/components/homepage/FAQSection.tsx   + category tabs
src/components/faq/FAQCategorySidebar.tsx  + URL updates
```

### 7.5 Tests — Phase 7

**`src/app/faqs/[category]/__tests__/page.test.tsx`** _(new)_:

- Valid category slug renders the correct filtered FAQ list
- Invalid slug redirects to `/faqs`
- `generateStaticParams` returns all 7 category values

**`src/components/homepage/__tests__/FAQSection.test.tsx`** _(update)_:

- Tabs render one per FAQ category
- Active tab triggers fetch with `?category=<key>`
- "View all →" link points to `ROUTES.PUBLIC.FAQ_CATEGORY(activeCategory)` — not a raw string
- Delete any single-fetch / no-tab tests

**`src/components/faq/__tests__/FAQCategorySidebar.test.tsx`** _(update)_:

- All `href` values use `/faqs/<category>` path — no `?category=` query-string format
- `FAQ_CATEGORY_OPTIONS` imported from `@/constants` (moved in Phase 1)

---

## Phase 8 — Footer & Navigation ✅ Done

### 8.1 Rewrite `Footer` — `src/components/layout/Footer.tsx`

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

### 8.3 Update `navigation.tsx` — use `lucide-react`

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

### 8.4 UI polish — application-wide

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

### 8.5 Tests — Phase 8

**`src/components/layout/__tests__/Footer.test.tsx`** _(update)_:

- All link `href` values use `ROUTES.*` — no hardcoded path strings
- Social icon links have `aria-label` describing the platform
- No `EnhancedFooter` import anywhere in the codebase (grep assertion in CI)
- Delete all `EnhancedFooter.test.tsx` tests

**`src/components/layout/__tests__/Sidebar.test.tsx`** _(update)_:

- Active nav item has the accent background class from `THEME_CONSTANTS`
- Non-active items do not have the accent class
- All icons are `lucide-react` elements — no inline SVG `<path>` strings

---

## Phase 9 — Inline Create Drawers ✅ Done

### 9.1 `CategorySelectorCreate` — `src/components/ui/CategorySelectorCreate.tsx`

```tsx
// Internal state: [categoryDrawerOpen, setOpen]
// Fetches categories via useApiQuery(['categories'])
// Renders: searchable <select> or Combobox + "＋ New category" button
// Button opens <SideDrawer mode="create" title="New Category">
//   <CategoryForm onSuccess={(newId) => { onChange(newId); setOpen(false); invalidateQuery('categories') }} />
// </SideDrawer>
```

### 9.2 `AddressSelectorCreate` — `src/components/ui/AddressSelectorCreate.tsx`

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

### 9.4 Tests — Phase 9

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

## Phase 10 — Gestures + Accessibility ✅ Done

**Goal:** Every interactive component works correctly with touch gestures, keyboard navigation, and screen readers. Accessibility is built in, not bolted on.

### 10.1 Gesture hooks — `src/hooks/useSwipe.ts` (verify/extend existing)

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

### 10.2 Long-press hook — `src/hooks/useLongPress.ts`

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

**Apply to:** DataTable row → long-press on mobile opens context menu (edit/delete/view).

### 10.3 Pull-to-refresh — `src/hooks/usePullToRefresh.ts`

```typescript
export function usePullToRefresh(onRefresh: () => Promise<void>): {
  containerRef: RefObject<HTMLDivElement>;
  isPulling: boolean;
  progress: number; // 0–1
};
```

**Apply to:** `user/orders`, `seller/products`, `seller/orders`, `auctions/page.tsx` — any page that lists user-owned data and benefits from a manual refresh on mobile.

### 10.4 Keyboard navigation

Every component must be keyboard-navigable with no mouse required:

| Component                      | Key behaviour                                                                    |
| ------------------------------ | -------------------------------------------------------------------------------- |
| `SideDrawer`                   | `Esc` closes; focus trapped inside while open; focus returns to trigger on close |
| `FilterDrawer`                 | `Esc` closes; `Tab` cycles through facets                                        |
| `FilterFacetSection`           | `Enter`/`Space` selects option; `↑`/`↓` navigates list                           |
| `Modal` / `ConfirmDeleteModal` | `Esc` dismisses; focus trapped                                                   |
| `Tabs` / `SectionTabs`         | `←`/`→` switch tabs                                                              |
| `DataTable`                    | `Tab` navigates rows; `Enter` opens row action                                   |
| `SortDropdown`                 | Standard `<select>` keyboard already works; verify                               |
| `HeroCarousel`                 | `←`/`→` navigates slides                                                         |

### 10.5 ARIA attributes — component-by-component

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
// In tailwind.config.js — add to theme extend:
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

### 10.x Tests — Phase 10

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
- `minDistance` option respected — no callback on tiny movement

**`src/components/ui/__tests__/SideDrawer.test.tsx`** _(update — add gesture assertions)_:

- Swipe-right on left drawer triggers `onClose`
- Swipe-left on right drawer triggers `onClose`
- Swipe shorter than threshold does not close

**`src/components/homepage/__tests__/HeroCarousel.test.tsx`** _(update)_:

- Swipe left advances to next slide
- Swipe right returns to previous slide
- Arrow key `→` / `←` navigates slides
- `aria-roledescription="carousel"` present; each slide has `aria-label`
- Autoplay paused when carousel receives focus

**`tailwind.config.js` / `globals.css` — manual check (no automated test needed):**

- Confirm `@media (prefers-reduced-motion: reduce)` rule disables transitions; add note in PR description

---

## Phase 11 — Homepage Sections

**Goal:** Each homepage section is visually distinctive, tells the user what to do next, and works beautifully across mobile / desktop / widescreen.

### Current state of homepage sections

| Component                  | File                           | Current issues                                                                                            |
| -------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `HeroCarousel`             | `HeroCarousel.tsx`             | No gesture support; no reduced-motion; no autoplay pause on focus; indicator dots not keyboard-accessible |
| `FeaturedProductsSection`  | `FeaturedProductsSection.tsx`  | Grid only — no horizontal scroll on mobile; no "View all" CTA link; static content                        |
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
- Keyboard: `←`/`→` keys change slide; `Space` toggles pause
- ARIA carousel roles (Phase 11 spec)
- Slide indicators: real `<button>` elements with `aria-label="Go to slide N"`
- Replace inline SVG arrow icons with `lucide-react` `ChevronLeft` / `ChevronRight`

#### 11.2 `FeaturedProductsSection` + `FeaturedAuctionsSection`

- **Mobile:** horizontal scroll carousel (`overflow-x-auto snap-x snap-mandatory`) with swipe via `useSwipe`
- **Desktop/widescreen:** 4-column grid
- "View all products / auctions →" CTA button using `ROUTES.PUBLIC.PRODUCTS` / `ROUTES.PUBLIC.AUCTIONS`
- `FeaturedAuctionsSection`: add visible countdown chip on each card (e.g. `Ends in 2h 14m`)
- All strings via `UI_LABELS.HOMEPAGE.*` — add new keys as needed

#### 11.3 `TopCategoriesSection`

- Add product count badge to each category card
- Add hover scale + shadow animation (`hover:scale-105 transition-transform`)
- Mobile: 2-column grid; desktop: 4-column; widescreen: 6-column
- Use `lucide-react` icons mapped from category slug (fallback: `Tag`)

#### 11.4 `CustomerReviewsSection`

- Mobile: swipeable carousel via `useSwipe`
- Desktop: 3-column masonry-style grid
- Each review card: star rating (filled/empty stars using `lucide-react` `Star`), verified badge, truncated text with "Read more" toggle
- Load 6 reviews; "See all reviews →" links to reviews page

#### 11.5 `TrustIndicatorsSection` + `SiteFeaturesSection`

- Merge into a single `TrustFeaturesSection` component (they serve the same purpose — delete one)
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

- `src/components/homepage/HomepageSkeleton.tsx` — skeleton placeholders for each section while data loads
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

### 11.9 Tests — Phase 11

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

**`src/components/homepage/__tests__/TrustIndicatorsSection.test.tsx`** _(update — post-merge)_:

- 4 items rendered with icon + label + description
- Icons are `lucide-react` elements — no inline SVG `<path>` strings
- `SiteFeaturesSection` no longer imported anywhere (grep check)

**`src/components/homepage/__tests__/HomepageSkeleton.test.tsx`** _(new)_:

- Renders without crashing
- Uses `THEME_CONSTANTS.skeleton.*` classes — no raw colour strings

---

## Phase 12 — Dashboard Page Styling

**Goal:** Admin, seller, and user dashboards feel polished and structured. Stats are glanceable, actions are prominent, and the layout works at all three viewport sizes.

### 12.1 Admin dashboard

**Current issues:**

- Stats cards likely use raw Tailwind — standardise to `THEME_CONSTANTS.card.stat.*`
- No skeleton loading state during data fetch
- Charts (Recharts) may not be responsive on mobile
- Action shortcuts (quick links to users/orders/products) may be text-only

**Changes:**

- Wrap all stat cards in `THEME_CONSTANTS.card.stat.<colour>` tokens (indigo, emerald, amber, red)
- Add `AdminDashboardSkeleton` for loading state
- Make Recharts `<ResponsiveContainer>` and add `<Tooltip>` with accessible labels
- Add a "Quick actions" card row: New Product / Manage Orders / View Reviews — icon + label buttons
- Mobile: single-column stack; desktop: 2-col stats + 1 chart; widescreen: 4-col stats + charts side by side

### 12.2 Seller dashboard

**Changes:**

- Stat cards: Revenue (total + this month), Active listings, Pending orders, Average rating
- Earnings chart: Recharts `<AreaChart>` of last 30 days revenue — responsive
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

- `title` — from `UI_LABELS.*`
- `description` — one-line plain-English explanation of what this page is for
- `actions` slot — primary action button (e.g. "Add product")
- Breadcrumb trail (where applicable)

Audit all admin/seller/user pages — any that render their own `<h1>` or title block must be migrated to `<AdminPageHeader>`.

**Files changed in Phase 12:**

```
src/app/admin/page.tsx                           (dashboard) + skeleton + quick actions
src/app/seller/page.tsx                          (dashboard) + earnings chart + attention card
src/app/user/page.tsx  (or profile dashboard)   recent orders + formatted stats
src/components/admin/AdminPageHeader.tsx         + description prop + breadcrumb slot
src/components/layout/Sidebar.tsx               active state + grouping + mobile bottom sheet
src/constants/ui.ts                              + description strings for all pages
```

### 12.6 Tests — Phase 12

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

## Phase 13 — Non-Tech Friendly UX

**Goal:** The application should be approachable and intuitive for everyday users — shoppers, small-business sellers, first-time buyers — not just developers or power users. Plain language replaces jargon. Flows are guided. Errors are helpful. Feedback is immediate and human.

### 13.1 Plain language throughout

Replace all technical or ambiguous labels with plain, human phrasing:

| Current (or likely)               | Replace with                                                                      |
| --------------------------------- | --------------------------------------------------------------------------------- |
| `"Submit"`                        | `"Place order"` / `"Save changes"` / `"Send message"` (context-specific)          |
| `"Validation failed"`             | `"Please check the highlighted fields"`                                           |
| `"Internal server error"`         | `"Something went wrong. Please try again."`                                       |
| `"Unauthenticated"`               | `"Please sign in to continue"`                                                    |
| `"pageSize"` visible in UI        | Remove — never expose API param names to users                                    |
| `"status==active"` visible in UI  | Remove — never expose Sieve DSL to users                                          |
| Filter label `"Sort"`             | `"Sort by"` with plain option names like `"Newest first"`, `"Price: low to high"` |
| `"createdAt"` in any visible text | `"Date added"` / `"Joined"`                                                       |
| `"updatedAt"`                     | `"Last updated"`                                                                  |

Add these to `UI_LABELS` — context-specific action labels override generic ones:

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
| `user/orders` — no orders       | "You haven't placed any orders yet"                                        | "Start shopping →"       |
| `seller/products` — no listings | "You don't have any products listed yet"                                   | "Add your first product" |
| `seller/orders` — no sales      | "No orders yet — your orders will appear here once customers start buying" | "View my listings"       |
| `admin/reviews` — no reviews    | "No reviews match your filters"                                            | "Clear filters"          |
| Search results — 0 hits         | "No results for '[query]'" + suggestion to try different terms             | "Clear search"           |
| Wishlist / saved items — empty  | "Nothing saved yet"                                                        | "Browse products"        |

### 13.3 Guided onboarding flows

First-visit experiences for new users:

- **New buyer:** After first sign-up → brief 3-step tooltip tour: "Browse products", "Add to cart", "Checkout"
- **New seller:** After seller role granted → checklist card on seller dashboard: "Add a profile photo", "List your first product", "Set up payment details" — each item becomes a `✓` when completed
- **Empty product form:** Inline helper text explains each field in plain language (e.g. "A clear title helps buyers find your item — be specific, e.g. 'Blue cotton kurta, size M'")

### 13.4 Inline help text for all form fields

Every form field should have a `helperText` prop with a plain-English one-liner:

| Field               | Helper text                                                       |
| ------------------- | ----------------------------------------------------------------- |
| Product title       | "Be specific — e.g. 'Handmade leather wallet, brown'"             |
| Product price       | "Set a fair price. You can change it anytime."                    |
| Auction start price | "This is the lowest bid you'll accept"                            |
| Auction end date    | "When should bidding close?"                                      |
| Category            | "Pick the best fit — buyers search by category"                   |
| Pickup address      | "Where should the buyer collect from, or where do you ship from?" |
| Coupon code         | "Letters and numbers only, no spaces"                             |

Store all helper text in `UI_HELP_TEXT.*` in `src/constants/ui.ts`.

### 13.5 Improved error messages

Errors must be:

1. **Specific** — tell the user exactly what went wrong
2. **Actionable** — tell them how to fix it
3. **Human** — no codes, no stack traces, no HTTP status numbers visible

```typescript
// src/constants/messages.ts — replace generic messages
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

- Every `<Button>` that triggers an async action accepts `isLoading` prop — show spinner + disable during mutation
- `useApiMutation` should surface `isPending` to the calling component automatically
- Long page loads (> 500ms): show skeleton screens (Phase 12/13) not blank white pages
- File uploads: show `<Progress>` bar with percentage
- Form saves: replace button text with "Saving..." then "Saved ✓" for 2 seconds on success

### 13.7 Conversational toast messages

Replace all generic toast messages with friendly, specific ones:

| Action             | Toast message                                              |
| ------------------ | ---------------------------------------------------------- |
| Order placed       | "Your order is confirmed! We'll notify you when it ships." |
| Product listed     | "Your product is live — shoppers can find it now."         |
| Review submitted   | "Thanks for your review! It helps other shoppers."         |
| Profile updated    | "Your profile has been updated."                           |
| Password changed   | "Password changed. You're all set."                        |
| Bid placed         | "Bid placed! You'll be notified if someone outbids you."   |
| Item added to cart | "'[Product name]' added to your cart."                     |

Store all in `SUCCESS_MESSAGES.*` — add new keys as needed.

### 13.8 Mobile-first touch targets

All interactive elements on mobile must meet minimum 44×44 px touch target size (WCAG 2.5.5):

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

### 13.9 Tests — Phase 13

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

## Phase 14 — Code Deduplication ✅ Done

> **Sections:** L  
> **Risk:** 🟡 Minor breaking — two API route renames; one lib file merge; one component delete  
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
| `src/app/api/profile/update/route.ts`          | `PUT /api/user/profile`          | Update `API_ENDPOINTS.PROFILE.UPDATE` constant → `API_ENDPOINTS.USER.PROFILE`; update all hooks/pages calling the old endpoint |
| `src/app/api/profile/update-password/route.ts` | `POST /api/user/change-password` | Update `API_ENDPOINTS.PROFILE.UPDATE_PASSWORD` → `API_ENDPOINTS.USER.CHANGE_PASSWORD`; update all callers                      |

**Before deleting:** ensure `PUT /api/user/profile` handles all fields previously handled by `/api/profile/update`.

### 14.4 Pre-Implementation Rule (Enforce via PR Template)

Add to PR checklist:

- [ ] Searched `src/components`, `src/hooks`, `src/utils` for similar existing code before creating a new file
- [ ] If an existing component was extended, named the new prop descriptively (not a boolean flag)
- [ ] Ran grep for any deleted file paths — zero remaining imports

### Files Changed in Phase 14

```
# Deleted
src/components/utility/Breadcrumbs.tsx
src/lib/api/validation-schemas.ts
src/app/api/profile/update/route.ts
src/app/api/profile/update-password/route.ts

# Modified (import updates only)
src/constants/api-endpoints.ts                            — PROFILE.UPDATE → USER.PROFILE; PROFILE.UPDATE_PASSWORD → USER.CHANGE_PASSWORD
src/lib/validation/schemas.ts                             — merge content from api/validation-schemas.ts
All files importing utility/Breadcrumbs or api/validation-schemas
```

### 14.5 Tests — Phase 14

**Grep assertions (run as CI checks on this PR):**

- `grep -r "utility/Breadcrumbs" src/` → 0 matches
- `grep -r "api/validation-schemas" src/` → 0 matches
- `grep -r "/api/profile/update" src/` → 0 matches (except history)
- `grep -r "EnhancedFooter" src/` → 0 matches

**`src/lib/validation/__tests__/schemas.test.ts`** _(update)_:

- All Zod schemas previously in `api/validation-schemas.ts` are present in the merged file
- No duplicate schema names exist after merge

---

## Phase 15 — SEO: Full-Stack Coverage

> **Sections:** M  
> **Risk:** 🟢 Additive (new files + metadata exports + schema fields) with one breaking URL change (`/products/[id]` → `/products/[slug]`)  
> **Important order:** schema fields first → slug generation → URL rename → JSON-LD helpers → page metadata → sitemap/robots last

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

### 15.2 JSON-LD Helpers — `src/lib/seo/json-ld.ts` (NEW)

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

**`src/db/schema/products.ts`** — add to `ProductDocument` interface:

```typescript
slug: string;               // required; auto-generated from title at create time; unique
seoTitle?: string;          // user override; max 60 chars
seoDescription?: string;    // user override; max 160 chars
seoKeywords?: string[];     // user override; max 10 tags
// Per-image alt text: extend each image object
images: Array<{ url: string; altText: string; }>;
```

**`src/db/schema/blog-posts.ts`** — verify `slug` exists; add `seoTitle?`, `seoDescription?`, `seoKeywords?`

**`src/db/schema/categories.ts`** — verify `slug` exists; add `seoTitle?`, `seoDescription?`

Add `PRODUCT_SEO_FIELDS` constant object (see Section M for spec).

### 15.4 Product URL Migration: `[id]` → `[slug]`

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

**`ProductForm`** — add "SEO" tab/accordion (collapsible, below main fields):

```
│ SEO (optional — leave blank for auto-generated)           │
├─────────────────────────────────────────────────────────────┤
│ SEO Title (max 60 chars)       [___________________________] │
│ SEO Description (max 160)      [___________________________] │
│ Keywords (comma-separated)     [___________________________] │
│ Image Alt Text (each image)    shown per-image in upload UI  │
```

**`BlogForm`** — same SEO tab pattern.

### 15.6 Sitemap + Robots + OG Image

**`src/app/sitemap.ts`** — fetches from repositories server-side; generates `MetadataRoute.Sitemap`; called at build/request time by Next.js.

**`src/app/robots.ts`** — static; disallows admin/api/seller/user/auth/checkout segments; exposes `sitemap` URL.

**`src/app/opengraph-image.tsx`** — uses `ImageResponse` (Next.js built-in); renders LetItRip branding for social shares where a page-specific OG image isn’t available.

### 15.7 Media Upload: SEO-Friendly Filenames

**`src/app/api/media/upload/route.ts`** — when saving files to Firebase Storage, use:

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
src/constants/seo.ts                                      — +5 generateXMetadata functions; +page defaults
src/db/schema/products.ts                                 — slug field; SEO fields; image altText
src/db/schema/blog-posts.ts                               — SEO fields
src/db/schema/categories.ts                               — SEO fields
src/repositories/product.repository.ts                   — findBySlug(); findByIdOrSlug()
src/app/api/products/route.ts                             — slugify on create
src/app/api/media/upload/route.ts                         — SEO-friendly filename
src/app/products/[slug]/page.tsx                          — renamed from [id]; generateProductMetadata
src/app/products/[id]/page.tsx                            — permanentRedirect to [slug] version
src/components/admin/ProductForm.tsx (or seller equiv)    — SEO tab
src/components/admin/BlogForm.tsx                         — SEO tab
src/constants/routes.ts                                   — ROUTES.PRODUCT.DETAIL uses slug
All public page files (see Section M per-page table)      — add metadata export
```

### 15.9 Tests — Phase 15

**`src/constants/__tests__/seo.test.ts`** _(update — full coverage)_:

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
  └── Phase 2 (new UI components + hook — consume Phase 1 constants)
        └── Phase 3 (barrel exports + DataTable/SearchResultsSection wiring)
              ├── Phase 4 (admin pages — consume Phase 2+3)
              ├── Phase 5 (public pages — consume Phase 2+3)
              └── Phase 6 (seller/user pages — consume Phase 2+3)
                    └── Phase 7 (FAQ routes — can run in parallel with 4–6)
Phase 8 (footer/nav — depends only on Phase 1)
Phase 9 (inline create — depends on Phase 2 for SideDrawer side prop)
Phase 10 (gestures + a11y — depends on Phase 2 for all new components)
Phase 11 (homepage sections — depends on Phase 1 + Phase 10 for gestures/a11y)
Phase 12 (dashboard styling — depends on Phase 1 for lucide + constants)
Phase 13 (non-tech UX — depends on Phase 1 for constants; touches pages from 4–6)
Phase 14 (code deduplication — depends on Phase 1 for API_ENDPOINTS constants; can run independently)
Phase 15 (SEO — depends on Phase 1 for slug utils; Phase 9 for ProductForm extension; touches public pages from 5)
```

**Parallelizable work:**

- Phases 4, 5, 6, 7 can all proceed in parallel once Phase 3 is done
- Phase 8 can proceed as soon as Phase 1 is done
- Phase 10, 11, 12 can proceed in parallel once Phase 2 is done
- Phase 13 can be tackled incrementally alongside phases 4–12
- **Phase 14 (dedup)** can proceed independently at any time; route deletes must happen after callers are updated
- **Phase 15 (SEO)** schema fields can be added early (Phase 1/9); metadata exports added anytime after Phase 5; sitemap/robots last

**Import update rule (applies to every phase):**  
When a file is deleted or a component is moved, immediately grep the entire codebase for its old import path and update every match. Do not leave stale imports or add re-export shims. Use `grep -r "OldComponentName" src/` before closing a PR.

---

## Checklist per PR

Before merging any phase:

- [ ] `npx tsc --noEmit` on all changed files — zero errors
- [ ] All imports updated to new locations — no dead imports left behind
- [ ] All deleted components/files: grep for any remaining import of the deleted path — zero matches
- [ ] All new components import from `@/components`, `@/hooks`, `@/utils`, `@/constants` — never from deep paths
- [ ] No raw UI text — all strings from `UI_LABELS`, `UI_PLACEHOLDERS`, `ERROR_MESSAGES`, `SUCCESS_MESSAGES`
- [ ] No raw repeated Tailwind strings — all from `THEME_CONSTANTS`
- [ ] No `console.log` — use `logger` (client) / `serverLogger` (API)
- [ ] No `router.push()` for filter/sort changes — only `router.replace()`
- [ ] Page files stay under 150 lines of JSX
- [ ] `npm run lint` passes
- [ ] All interactive elements have `aria-label` or visible label wired via `htmlFor`
- [ ] All new `<button>` elements work with keyboard (`Enter`/`Space`)
- [ ] All modals/drawers trap focus and return it on close
- [ ] No user-visible text contains API jargon (`pageSize`, `createdAt`, Sieve DSL, HTTP status codes)
- [ ] Touch targets on mobile: all interactive elements ≥ 44×44 px (`THEME_CONSTANTS.touch.target`)
- [ ] `prefers-reduced-motion` respected for all animations/transitions
- [ ] Tested at mobile (375 px), desktop (1280 px), and widescreen (1536 px+) viewport widths
- [ ] Searched for existing similar component/hook/util before creating a new file (Phase 14 rule)
- [ ] No `alt=""` on meaningful images — all product/category/blog images have descriptive alt text
- [ ] All new/modified public pages export `metadata` or `generateMetadata()` (Phase 15 rule)
- [ ] Deleted API route paths are updated in `API_ENDPOINTS` constants and all callers

---

## Phase 17 — Next.js 16 Compatibility: Async Params

> **Audit source:** `npx tsc --noEmit` — 8 errors in `.next/dev/types/validator.ts` (Feb 21, 2026)  
> **Root cause:** Next.js 15+ made `params` in route handlers and page components a `Promise`. Four API routes and one page file still use the old synchronous `params: { id: string }` interface, causing type-checker failures.

### Background

In Next.js 15 / 16 the `context.params` object passed to route handlers and page components is a `Promise`. The `.next/dev/types/validator.ts` auto-generated validator enforces this — a `RouteContext` whose `params` is **not** a `Promise` will fail the constraint check.

**Pattern before (Next.js 13/14 — broken in 15/16):**

```typescript
interface RouteContext {
  params: { id: string };
}
export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id } = params; // ❌ sync access
}
```

**Pattern after (Next.js 15/16 compatible):**

```typescript
interface RouteContext {
  params: Promise<{ id: string }>;
}
export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params; // ✅ async access
}
```

### 17.1 API Routes to migrate (4 files)

| File                                                   | Param key                   |
| ------------------------------------------------------ | --------------------------- |
| `src/app/api/user/addresses/[id]/route.ts`             | `id` (GET · PATCH · DELETE) |
| `src/app/api/user/addresses/[id]/set-default/route.ts` | `id` (POST)                 |
| `src/app/api/user/orders/[id]/route.ts`                | `id` (GET)                  |
| `src/app/api/user/orders/[id]/cancel/route.ts`         | `id` (POST)                 |

For each:

1. Change `params: { id: string }` → `params: Promise<{ id: string }>` in `RouteContext`
2. Change `const { id } = params` → `const { id } = await params` in every handler

### 17.2 Page file to migrate (1 file)

**`src/app/faqs/[category]/page.tsx`** — server component, not an async function, uses `params` prop:

```tsx
// BEFORE (sync — incompatible with Next.js 15/16)
interface Props { params: { category: string }; }
export default function FAQCategoryPage({ params }: Props) {
  const { category } = params;
  ...
}

// AFTER — make component async and await params
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
| `src/app/products/[id]/page.js`                | Phase 15 (renamed → `[slug]`) |
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

### 17.5 Tests — Phase 17

Update any test files that mock `params` as a plain object to use `Promise.resolve(...)`:

**`src/app/api/__tests__/` affected tests** — search for mock params patterns and update:

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

| Sub   | Status      | Notes |
| ----- | ----------- | ----- |
| 18.1  | Not started |       |
| 18.2  | Not started |       |
| 18.3  | Not started |       |
| 18.4  | Not started |       |
| 18.5  | Not started |       |
| 18.6  | Not started |       |
| 18.7  | Not started |       |
| 18.8  | Not started |       |
| 18.9  | Not started |       |
| 18.10 | Not started |       |
| 18.11 | Not started |       |
| 18.12 | Not started |       |
| 18.13 | Not started |       |
| 18.14 | Not started |       |
| 18.15 | Not started |       |
| 18.16 | Not started |       |
| 18.17 | Not started |       |
| 18.18 | Not started |       |
| 18.19 | Not started |       |

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
