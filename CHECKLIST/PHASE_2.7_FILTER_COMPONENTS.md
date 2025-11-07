# Phase 2.7: Filter Components - Quick Reference

## ✅ Completed Components

### Resource-Specific Filter Components

All filter components are located in `/src/components/filters/`:

1. **ProductFilters** - Product filtering (price, category, stock, condition, rating, features)
2. **ShopFilters** - Shop filtering (verified, rating, featured, homepage, banned)
3. **OrderFilters** - Order filtering (status, date range, amount, shop)
4. **ReturnFilters** - Return filtering (status, reason, date, admin intervention)
5. **CouponFilters** - Coupon filtering (type, status, expiry date, shop)
6. **UserFilters** - User filtering (role, status, verification, registration date)
7. **CategoryFilters** - Category filtering (featured, homepage, parent, leaf)
8. **ReviewFilters** - Review filtering (rating, verified purchase, media, status)
9. **AuctionFilters** - Auction filtering (status, time left, bid range, featured)

### Utilities

- **`useFilters` Hook** (`/src/hooks/useFilters.ts`) - Filter state management with URL sync and persistence
- **Filter Helpers** (`/src/lib/filter-helpers.ts`) - Utility functions for filter operations

---

## 📖 Usage Guide

### Basic Usage with useFilters Hook

```tsx
import { useFilters } from "@/hooks/useFilters";
import { ProductFilters, type ProductFilterValues } from "@/components/filters";

function ProductsPage() {
  const {
    filters,
    appliedFilters,
    updateFilters,
    applyFilters,
    resetFilters,
    hasActiveFilters,
    activeFilterCount,
  } = useFilters<ProductFilterValues>(
    {}, // Initial filters
    {
      syncWithUrl: true, // Sync with URL params
      persist: true, // Persist to localStorage
      storageKey: "product-filters",
      onChange: (newFilters) => {
        // Fetch data with new filters
        fetchProducts(newFilters);
      },
    }
  );

  return (
    <div className="flex gap-6">
      {/* Sidebar with filters */}
      <aside className="w-80">
        <ProductFilters
          filters={filters}
          onChange={updateFilters}
          onApply={applyFilters}
          onReset={resetFilters}
        />
      </aside>

      {/* Main content */}
      <main className="flex-1">
        {hasActiveFilters && <div>{activeFilterCount} filter(s) active</div>}
        {/* Product list using appliedFilters */}
      </main>
    </div>
  );
}
```

### With FilterSidebar Component

```tsx
import { FilterSidebar } from "@/components/common/FilterSidebar";
import { ProductFilters } from "@/components/filters";
import { useFilters } from "@/hooks/useFilters";

function ProductsPage() {
  const { filters, appliedFilters, updateFilters, applyFilters, resetFilters } =
    useFilters<ProductFilterValues>({}, { syncWithUrl: true });

  return (
    <div className="flex gap-6">
      <FilterSidebar>
        <ProductFilters
          filters={filters}
          onChange={updateFilters}
          onApply={applyFilters}
          onReset={resetFilters}
        />
      </FilterSidebar>

      <main className="flex-1">{/* Content using appliedFilters */}</main>
    </div>
  );
}
```

---

## 🔧 Filter Component API

All filter components share the same API:

### Props

```typescript
interface FilterProps<T> {
  /** Current filter values (local state, not yet applied) */
  filters: T;
  /** Update filter values (doesn't apply them yet) */
  onChange: (filters: T) => void;
  /** Apply current filters (trigger data fetch) */
  onApply: () => void;
  /** Reset filters to initial state */
  onReset: () => void;
}
```

### Filter Value Types

#### ProductFilterValues

```typescript
{
  priceMin?: number;
  priceMax?: number;
  categories?: string[];
  stock?: 'in_stock' | 'out_of_stock' | 'low_stock';
  condition?: ('new' | 'like_new' | 'good' | 'fair')[];
  featured?: boolean;
  returnable?: boolean;
  rating?: number;
}
```

#### ShopFilterValues

```typescript
{
  verified?: boolean;
  rating?: number;
  featured?: boolean;
  homepage?: boolean;
  banned?: boolean;
}
```

#### OrderFilterValues

```typescript
{
  status?: string[];
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  shopId?: string;
}
```

#### AuctionFilterValues

```typescript
{
  status?: string[];
  timeLeft?: string;
  bidMin?: number;
  bidMax?: number;
  featured?: boolean;
}
```

---

## 🎯 useFilters Hook API

### Parameters

```typescript
useFilters<T>(
  initialFilters: T,
  options?: {
    persist?: boolean;        // Persist to localStorage (default: false)
    storageKey?: string;      // localStorage key (default: 'filters')
    syncWithUrl?: boolean;    // Sync with URL params (default: true)
    onChange?: (filters: T) => void; // Callback on filter change
  }
)
```

### Return Value

```typescript
{
  filters: T;                 // Current filter values (not yet applied)
  appliedFilters: T;          // Applied filter values (use for queries)
  updateFilters: (filters: T) => void;  // Update without applying
  applyFilters: () => void;   // Apply current filters
  resetFilters: () => void;   // Reset to initial state
  clearFilter: (key: keyof T) => void;  // Clear specific filter
  hasActiveFilters: boolean;  // Whether any filters are active
  activeFilterCount: number;  // Number of active filters
}
```

---

## 🛠️ Filter Helper Functions

### buildQueryFromFilters

Convert filter values to query object (removes empty values):

```typescript
const query = buildQueryFromFilters(filters);
// { priceMin: 100, condition: ['new', 'like_new'] }
```

### filtersToSearchParams

Convert filters to URLSearchParams:

```typescript
const params = filtersToSearchParams(filters);
// URLSearchParams with serialized filter values
```

### searchParamsToFilters

Parse URLSearchParams to filter values:

```typescript
const filters = searchParamsToFilters(searchParams, initialFilters);
```

### getActiveFilterCount

Count active filters:

```typescript
const count = getActiveFilterCount(filters); // 3
```

### hasActiveFilters

Check if any filters are active:

```typescript
if (hasActiveFilters(filters)) {
  // Show clear all button
}
```

### filtersToSummary

Get human-readable filter summary:

```typescript
const summary = filtersToSummary(filters, {
  priceMin: "Min Price",
  condition: "Condition",
});
// ['Min Price: 100', 'Condition: new, like_new']
```

---

## 🎨 Styling

All filter components use Tailwind CSS with consistent styling:

- Blue accent color (`bg-blue-600`, `text-blue-600`)
- Gray text and borders
- Rounded corners (`rounded-lg`)
- Focus rings for accessibility
- Responsive design (mobile-friendly)

---

## 📋 Integration Checklist

When integrating filter components:

- [ ] Import filter component and `useFilters` hook
- [ ] Define initial filter values (empty object or defaults)
- [ ] Set up `useFilters` with appropriate options (URL sync, persistence)
- [ ] Pass filter values and handlers to filter component
- [ ] Use `appliedFilters` (not `filters`) for data fetching
- [ ] Show active filter count/badges if desired
- [ ] Implement data fetching on filter change
- [ ] Test URL synchronization (back/forward navigation)
- [ ] Test filter persistence (localStorage)
- [ ] Verify mobile responsiveness

---

## 🚀 Next Steps

Filter components are ready for integration in:

- Phase 3: Seller Dashboard pages (products, orders, returns, coupons)
- Phase 4: Seller order management pages
- Phase 5: Admin Dashboard pages (shops, users, orders, categories, auctions)
- Phase 6: User pages (orders, favorites, search results, auction listings)

See `FEATURE_IMPLEMENTATION_CHECKLIST.md` for detailed integration points.
