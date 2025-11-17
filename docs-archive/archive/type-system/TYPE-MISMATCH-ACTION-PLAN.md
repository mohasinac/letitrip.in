# Type System Mismatches - Action Required

## Critical Issue: Property Name Mismatches

The codebase uses different property names than what's defined in FE types. This needs systematic fixing.

### ProductCardFE Property Mapping

| **Code Uses**   | **Type Has**     | **Fix Needed**                               |
| --------------- | ---------------- | -------------------------------------------- |
| `images[0]`     | `primaryImage`   | Change to `primaryImage`                     |
| `originalPrice` | `compareAtPrice` | Change to `compareAtPrice`                   |
| `rating`        | `averageRating`  | Change to `averageRating`                    |
| `stockCount`    | `stockStatus`    | Use `stockStatus` string OR add `stockCount` |
| `condition`     | ❌ Not in Card   | Use ProductFE or add to Card                 |

### CategoryFE Property Mapping

| **Code Uses** | **Type Has**   | **Fix Needed**                             |
| ------------- | -------------- | ------------------------------------------ |
| `banner`      | ❌ Not in type | Add `banner: string \| null` to CategoryFE |

### ShopFE Property Mapping

| **Code Uses**  | **Type Has**    | **Fix Needed**            |
| -------------- | --------------- | ------------------------- |
| `productCount` | `totalProducts` | Change to `totalProducts` |

## Recommended Solutions

### Option A: Update Types (Add Missing Properties)

**Pros**: Matches existing code expectations
**Cons**: Types become bloated
**Time**: 1-2 hours

```typescript
// Add to ProductCardFE:
export interface ProductCardFE {
  // ...existing fields
  images: string[]; // Add this (duplicate of primaryImage as array)
  originalPrice: number | null; // Alias for compareAtPrice
  rating: number; // Alias for averageRating
  stockCount: number; // Actual count
  condition: ProductCondition; // Add this
}

// Add to CategoryFE:
export interface CategoryFE {
  // ...existing fields
  banner: string | null; // Add this
}
```

### Option B: Update Code (Use Correct Property Names) ⭐ **RECOMMENDED**

**Pros**: Types stay clean and intentional
**Cons**: More files to update
**Time**: 3-4 hours but cleaner

Update all pages/components to use:

- `primaryImage` instead of `images[0]`
- `compareAtPrice` instead of `originalPrice`
- `averageRating` instead of `rating`
- `stockStatus` instead of `stockCount` (with conditional logic)

### Option C: Hybrid Approach ⚡ **FASTEST**

**Pros**: Quick wins + progressive enhancement
**Cons**: Mixed patterns temporarily
**Time**: 2 hours immediate, 2 hours later

1. Add missing **essential** properties to types (banner, stockCount)
2. Use type aliases for major renames
3. Create helper functions for complex mappings
4. Update code progressively

## Immediate Action Plan

### Step 1: Extend Types (30 min)

```typescript
// In src/types/frontend/category.types.ts
export interface CategoryFE {
  // ...existing
  banner?: string | null; // Add for backwards compat
}

// In src/types/frontend/product.types.ts
export interface ProductCardFE {
  // ...existing

  // Backwards compatibility aliases
  images?: string[]; // Computed from primaryImage
  originalPrice?: number | null; // Alias for compareAtPrice
  rating?: number; // Alias for averageRating
  stockCount?: number; // Actual stock number
  condition?: ProductCondition; // Product condition
}
```

### Step 2: Update Transforms (30 min)

Update `toFEProductCard()` to populate alias fields:

```typescript
export function toFEProductCard(productBE: ProductBE): ProductCardFE {
  return {
    // ...existing mappings

    // Backwards compatibility
    images: [productBE.images[0] || ""],
    originalPrice: productBE.compareAtPrice,
    rating: productBE.averageRating,
    stockCount: productBE.stockCount,
    condition: productBE.condition,
  };
}
```

### Step 3: Fix High-Impact Files (2 hours)

1. `categories/[slug]/page.tsx` (24 errors)
2. `products/[slug]/page.tsx` (13 errors)
3. `shops/[slug]/page.tsx` (6 errors)
4. Product components (cards, lists)

### Step 4: Document Migration (15 min)

Add deprecation notices in type comments

## Files Affected (Priority Order)

**High Priority** (Block many other fixes):

- [ ] `src/types/frontend/product.types.ts`
- [ ] `src/types/frontend/category.types.ts`
- [ ] `src/types/transforms/product.transforms.ts`

**Medium Priority** (Public pages):

- [ ] `src/app/categories/[slug]/page.tsx` (24 errors)
- [ ] `src/app/products/[slug]/page.tsx` (13 errors)
- [ ] `src/app/shops/[slug]/page.tsx` (6 errors)
- [ ] `src/app/auctions/[slug]/page.tsx` (10 errors)

**Lower Priority** (Admin/Complex):

- [ ] Admin pages (many errors, need more work)
- [ ] Seller components

## Decision

**Choose Option C (Hybrid)** for fastest resolution:

1. ✅ Add backwards-compat properties to ProductCardFE
2. ✅ Add banner to CategoryFE
3. ✅ Update transforms to populate these
4. ✅ Fix pages to work immediately
5. 📅 Later: Deprecate old properties, migrate code progressively

**Estimated Time**: 3 hours to reduce errors to ~150-180
**Estimated Impact**: ~40-50 errors fixed immediately
