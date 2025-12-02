# Product Comparison Feature - Resource Documentation

## Overview

Client-side product comparison feature allowing users to compare up to 4 products side-by-side using localStorage for persistence.

## Files

### Core Implementation

| File                                        | Purpose                            | Lines |
| ------------------------------------------- | ---------------------------------- | ----- |
| `src/constants/comparison.ts`               | Comparison configuration constants | ~25   |
| `src/services/comparison.service.ts`        | Comparison data management         | ~120  |
| `src/contexts/ComparisonContext.tsx`        | React context provider             | ~85   |
| `src/components/products/CompareButton.tsx` | Add/remove toggle button           | ~65   |
| `src/components/products/ComparisonBar.tsx` | Fixed bottom bar with thumbnails   | ~150  |
| `src/app/compare/page.tsx`                  | Side-by-side comparison page       | ~280  |

### Integration Points

- `src/components/cards/ProductCard.tsx` - Includes CompareButton
- `src/app/layout.tsx` - Wraps with ComparisonProvider

## Configuration

```typescript
// src/constants/comparison.ts
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

## Service API

### ComparisonService Methods

```typescript
class ComparisonService {
  // Add product to comparison
  addToComparison(productId: string): boolean;

  // Remove product from comparison
  removeFromComparison(productId: string): void;

  // Get all comparison product IDs
  getComparisonProducts(): string[];

  // Clear all products
  clearComparison(): void;

  // Check if product is in comparison
  isInComparison(productId: string): boolean;

  // Get count of products
  getComparisonCount(): number;
}
```

## Context API

```typescript
interface ComparisonContextValue {
  comparisonProducts: string[];
  addToComparison: (productId: string) => void;
  removeFromComparison: (productId: string) => void;
  clearComparison: () => void;
  isInComparison: (productId: string) => boolean;
  canAddMore: boolean; // true if < MAX_PRODUCTS
}
```

## Component Usage

### CompareButton

```tsx
import { CompareButton } from "@/components/products/CompareButton";

<CompareButton productId={product.id} />;
```

**Props**:

- `productId: string` - Product ID to add/remove
- `className?: string` - Additional CSS classes
- `size?: 'sm' | 'md' | 'lg'` - Button size

### ComparisonBar

```tsx
import { ComparisonBar } from "@/components/products/ComparisonBar";

// Automatically shown when products in comparison
<ComparisonBar />;
```

**Features**:

- Fixed bottom positioning
- Product thumbnails with remove buttons
- "Compare Now" button (enabled when 2+ products)
- "Clear All" button
- Product count indicator
- Animates in/out smoothly

## Comparison Page

### URL

`/compare`

### Features

- Side-by-side product table
- Sticky product headers with images
- Highlight differences:
  - Lowest price (green)
  - Highest rating (green)
- Remove product from comparison
- Add to cart/wishlist per product
- Empty state: "Add products to compare"

### Layout

```
┌─────────────────────────────────────────┐
│ Header                                   │
├─────────────────────────────────────────┤
│ Sticky Header Row                        │
│ ┌─────────┬─────────┬─────────┬────────┐│
│ │ Field   │ Prod 1  │ Prod 2  │ Prod 3 ││
│ ├─────────┼─────────┼─────────┼────────┤│
│ │ Price   │ ₹999 ✓  │ ₹1,299  │ ₹1,499 ││
│ │ Rating  │ 4.2 ⭐  │ 4.8 ⭐✓ │ 4.5 ⭐ ││
│ │ Stock   │ In Stock│ In Stock│ Low    ││
│ └─────────┴─────────┴─────────┴────────┘│
└─────────────────────────────────────────┘
```

## Storage Schema

```typescript
// localStorage key: 'product_comparison'
interface ComparisonStorage {
  productIds: string[];
  updatedAt: string; // ISO timestamp
}

// Example
{
  productIds: ['abc123', 'def456', 'ghi789'],
  updatedAt: '2025-12-03T10:30:00Z'
}
```

## Business Rules

1. **Max Products**: Maximum 4 products can be compared at once
2. **Min Products**: Comparison page requires at least 2 products
3. **Persistence**: Stored in localStorage, survives page refresh
4. **Cross-Tab Sync**: Updates across browser tabs via storage events
5. **No Auto-Remove**: Products stay in comparison until manually removed
6. **Product Availability**: Deleted/unpublished products filtered out

## UI/UX Guidelines

### CompareButton States

- **Default**: Outlined button with compare icon
- **Active**: Filled button (product in comparison)
- **Disabled**: Grayed out when MAX_PRODUCTS reached
- **Hover**: Show tooltip "Add to compare" or "Remove from compare"

### ComparisonBar

- **Position**: Fixed bottom, z-index above content
- **Height**: 80px desktop, 64px mobile
- **Animation**: Slide up from bottom (300ms ease-out)
- **Responsive**: Stack vertically on mobile if needed

### Comparison Table

- **Desktop**: Show all products side-by-side
- **Mobile**: 2 products max, swipeable columns
- **Highlight**: Green background for best values
- **Icons**: ✓ for best, ⭐ for ratings

## Testing

### Unit Tests

```typescript
// ComparisonService
- Add product to empty comparison
- Add product when at max capacity (should fail)
- Remove product from comparison
- Clear all products
- Check if product is in comparison
- Get comparison count

// ComparisonContext
- Provider wraps children correctly
- Context values update on actions
- canAddMore reflects MAX_PRODUCTS limit
```

### Integration Tests

```typescript
// CompareButton
- Clicking adds product to comparison
- Clicking again removes product
- Button disabled when max reached
- Visual state reflects comparison status

// ComparisonBar
- Appears when products added
- Hides when all products removed
- "Compare Now" navigates to /compare
- "Clear All" removes all products
- Individual remove buttons work

// Compare Page
- Loads products by IDs
- Displays comparison table correctly
- Highlights best values
- Handles missing products gracefully
- Empty state shown when < 2 products
```

### E2E Tests

```typescript
- User adds 3 products to comparison
- ComparisonBar shows 3 thumbnails
- User clicks "Compare Now"
- Comparison page shows 3 products side-by-side
- User removes 1 product from comparison
- Table updates to show 2 products
- User closes tab and reopens
- Comparison persists (localStorage)
```

## Performance Considerations

- **Batch Loading**: Fetch all comparison products in single API call
- **Lazy Loading**: Only load full product data on /compare page
- **Debouncing**: Debounce localStorage writes (300ms)
- **Memoization**: Memoize comparison table cells to avoid re-renders

## Accessibility

- CompareButton has aria-label "Add to compare" / "Remove from compare"
- ComparisonBar has role="complementary" and aria-label "Product comparison"
- Comparison table uses proper table semantics (<table>, <th>, <td>)
- Keyboard navigation: Tab through products, Enter to remove
- Screen readers announce comparison count changes

## Future Enhancements

- [ ] Share comparison link (encode product IDs in URL)
- [ ] Print comparison view
- [ ] Export comparison as PDF/image
- [ ] Compare auctions (separate feature)
- [ ] Comparison history (track past comparisons)
- [ ] Email comparison to self
- [ ] Add notes per product in comparison

## Related Documentation

- Epic: `TDD/epics/E002-product-catalog.md` (F002.8: Product Comparison)
- Implementation: `docs/10-product-comparison.md`
- Test Cases: `TDD/resources/products/TEST-CASES.md` (Comparison section)
