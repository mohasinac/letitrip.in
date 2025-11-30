# Unified Component Cards

## Current State

**Status**: 🟡 ProductCard unified - Admin products page updated

### Analysis Summary

| Resource | Public Card                 | Admin/Seller         | Consistency Issue         |
| -------- | --------------------------- | -------------------- | ------------------------- |
| Product  | `ProductCard.tsx` ✅        | Uses unified card ✅ | Unified with variant prop |
| Auction  | `AuctionCard.tsx` ✅        | Table/DataTable view | Needs variant support     |
| Category | `CategoryCard.tsx` ✅       | Table view only      | Needs variant support     |
| Shop     | `ShopCard.tsx` (2 versions) | Table view only      | Seller has own ShopCard   |
| Review   | `ReviewCard.tsx` ✅         | Table view only      | No card view in admin     |
| Order    | No dedicated card           | Table view only      | Inline render in pages    |
| Blog     | `BlogCard.tsx` ✅           | Table view only      | No card view in admin     |

### ProductCard Unified ✅

```typescript
// src/components/cards/ProductCard.tsx now supports variants:
type ProductCardVariant = "public" | "admin" | "seller" | "compact";

interface ProductCardProps {
  // ... base props
  variant?: ProductCardVariant;
  // Admin/Seller specific
  status?: ProductStatus;
  sku?: string;
  stockCount?: number;
  salesCount?: number;
  // Actions
  onEdit?: (slug: string) => void;
  onDelete?: (slug: string) => void;
  onSelect?: (id: string, selected: boolean) => void;
  isSelected?: boolean;
}
```

### Admin Products Page Updated ✅

`/admin/products` grid view now uses unified `ProductCard` with `variant="admin"`:

- Shows status badge
- Shows SKU
- Shows stock count
- Shows sales stats
- Edit/View buttons
- Selection support for bulk actions

---

## Implementation Plan

### 1. Create Unified Card Components

Each card should support:

- **Grid view** (for public pages and admin grid mode)
- **Compact view** (for widgets, sidebars)
- **Table row view** (for admin/seller data tables)
- Dark mode in all variants
- Consistent props interface

### 2. Add View Mode Toggle to Admin/Seller

Add grid/table toggle to list pages:

- `/admin/products` - Grid | Table views
- `/admin/auctions` - Grid | Table views
- `/admin/categories` - Grid | Table views
- `/seller/products` - Grid | Table views

### 3. Create Missing Cards

**OrderCard** - Create dedicated component:

```typescript
// src/components/cards/OrderCard.tsx
interface OrderCardProps {
  order: OrderFE;
  variant: "grid" | "compact" | "row";
  onViewDetails?: () => void;
  onUpdateStatus?: () => void;
}
```

### 4. Consolidate Duplicate Cards

Merge `SellerShopCard` into main `ShopCard`:

```typescript
// src/components/cards/ShopCard.tsx
interface ShopCardProps {
  shop: ShopFE;
  variant: "grid" | "compact" | "row" | "management";
  showManageButton?: boolean;
  onEdit?: () => void;
  onViewProducts?: () => void;
}
```

---

## Implementation Checklist

### Phase 1: Update Card Props

- [x] Add `variant` prop to ProductCard ✅
- [ ] Add `variant` prop to AuctionCard
- [ ] Add `variant` prop to CategoryCard
- [ ] Add `variant` prop to ShopCard
- [x] Ensure ProductCard has dark mode support ✅
- [ ] Add consistent action handlers

### Phase 2: Create Row Variants

- [ ] ProductCard row variant for tables
- [ ] AuctionCard row variant for tables
- [ ] CategoryCard row variant for tables
- [ ] ShopCard row variant for tables
- [ ] ReviewCard row variant for tables

### Phase 3: Create Missing Cards

- [ ] OrderCard with all variants
- [ ] Merge SellerShopCard into ShopCard

### Phase 4: Update Admin/Seller Pages

- [x] Admin products page uses unified ProductCard ✅
- [ ] Update auction list page
- [ ] Update category list page
- [ ] Update shop list page

---

## Card Interface Standards

```typescript
// Base card props for all resource cards
interface BaseCardProps<T> {
  data: T;
  variant?: "grid" | "compact" | "row";
  selected?: boolean;
  onSelect?: (id: string) => void;
  className?: string;
}

// Example: ProductCard
interface ProductCardProps extends BaseCardProps<ProductFE> {
  onAddToCart?: (id: string) => void;
  onQuickView?: (id: string) => void;
  onEdit?: (id: string) => void; // For admin/seller
  onDelete?: (id: string) => void; // For admin/seller
  showActions?: boolean;
}
```

---

## File Changes Required

1. **Update existing cards**: Add variant support
2. **Create OrderCard**: New component
3. **Merge SellerShopCard**: Into ShopCard
4. **Create ViewModeToggle**: Component for admin pages
5. **Update admin list pages**: Use cards with toggle
