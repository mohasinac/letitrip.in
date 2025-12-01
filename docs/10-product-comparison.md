# Product Comparison Feature

## Current State

> **Status**: ✅ IMPLEMENTED
> **Priority**: ✅ Complete

### Implemented Files

1. **Constants**: `src/constants/comparison.ts`
2. **Service**: `src/services/comparison.service.ts`
3. **Context**: `src/contexts/ComparisonContext.tsx`
4. **CompareButton**: `src/components/products/CompareButton.tsx`
5. **ComparisonBar**: `src/components/products/ComparisonBar.tsx`
6. **Compare Page**: `src/app/compare/page.tsx`
7. **Layout Updated**: `src/app/layout.tsx` - includes ComparisonProvider
8. **ProductCard Updated**: `src/components/cards/ProductCard.tsx` - includes CompareButton

### Features

- Add/remove products to comparison (max 4)
- Floating comparison bar at bottom of screen
- Side-by-side comparison table with:
  - Price comparison (highlights lowest)
  - Rating comparison (highlights highest)
  - Condition, stock status, seller info
- Product card integration with compare button
- Cross-tab sync via localStorage
- Dark mode support
- Mobile responsive

---

## Implementation Details

### 1. Create Comparison Constants

**File**: `src/constants/comparison.ts`

```typescript
export const COMPARISON_CONFIG = {
  MAX_PRODUCTS: 4,
  MIN_PRODUCTS: 2,
  STORAGE_KEY: "product_comparison",
};

export const COMPARISON_FIELDS = [
  { key: "price", label: "Price" },
  { key: "condition", label: "Condition" },
  { key: "category", label: "Category" },
  { key: "brand", label: "Brand" },
  { key: "rating", label: "Rating" },
  { key: "seller", label: "Seller" },
  { key: "location", label: "Location" },
  { key: "warranty", label: "Warranty" },
];
```

### 2. Create Comparison Service

**File**: `src/services/comparison.service.ts`

Implement:

- `addToComparison(productId: string): boolean`
- `removeFromComparison(productId: string): void`
- `getComparisonProducts(): string[]`
- `clearComparison(): void`
- `isInComparison(productId: string): boolean`
- `getComparisonCount(): number`

### 3. Create Comparison Context

**File**: `src/contexts/ComparisonContext.tsx`

Provide:

- `comparisonProducts: string[]`
- `addToComparison: (productId: string) => void`
- `removeFromComparison: (productId: string) => void`
- `clearComparison: () => void`
- `isInComparison: (productId: string) => boolean`
- `canAddMore: boolean`

### 4. Create Compare Button Component

**File**: `src/components/products/CompareButton.tsx`

- Toggle button for adding/removing from comparison
- Show disabled state when max products reached
- Visual feedback for comparison state

### 5. Create Comparison Bar Component

**File**: `src/components/products/ComparisonBar.tsx`

- Fixed bottom bar showing selected products (thumbnails)
- "Compare Now" button (enabled when 2+ products)
- Quick remove individual products
- Clear all button
- Product count indicator

### 6. Create Compare Page

**File**: `src/app/compare/page.tsx`

Layout:

- Side-by-side product comparison table
- Dynamic columns based on selected products
- Sticky product headers with images
- Highlight differences between products
- Remove product from comparison
- Add to cart/wishlist actions per product

### 7. Update Product Card

**File**: `src/components/products/ProductCard.tsx`

Add:

- Compare checkbox/button in card actions
- Comparison state indicator

### 8. Update Layout

**File**: `src/app/layout.tsx`

Add:

- `ComparisonProvider` wrapper
- `ComparisonBar` component (conditionally rendered)

---

## UI/UX Guidelines

### Comparison Bar

- Position: Fixed bottom, above footer
- Height: ~80px
- Show only when products are in comparison
- Animate in/out smoothly
- Mobile: Stack vertically or use drawer

### Comparison Table

- Sticky first column (field labels)
- Sticky header row (product images/names)
- Highlight cells with best values (lowest price, highest rating)
- Collapsible specification groups
- Empty state: "Add products to compare"

### Mobile Responsiveness

- 2-product comparison max on mobile
- Swipeable product columns
- Condensed field labels

---

## API Requirements

None - client-side only feature using localStorage.

---

## Testing Checklist

- [ ] Add product to comparison
- [ ] Remove product from comparison
- [ ] Max products limit enforced
- [ ] Comparison persists across page navigation
- [ ] Comparison clears on browser close (sessionStorage) or persists (localStorage)
- [ ] Compare page renders correctly with 2-4 products
- [ ] Empty comparison state handled
- [ ] Mobile comparison bar works
- [ ] Dark mode support
