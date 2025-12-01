# Doc 20: Empty Section Fallback UI - Products

> **Status**: ✅ Complete
> **Priority**: ✅ Complete
> **Last Updated**: December 2025

## Problem

When no similar products or seller products were available, the components returned `null` - showing nothing instead of a helpful message with a link to browse all products.

## Solution

Updated `SimilarProducts.tsx` and `SellerProducts.tsx` to show a styled "empty state" card with:

- An icon (Package/Store)
- "No similar items" message
- "View All Products" button linking to `/products`

## Changes Made

### File: `src/components/product/SellerProducts.tsx`

**Before:**

```tsx
if (!products || products.length === 0) {
  return null;
}
```

**After:**

```tsx
if (!products || products.length === 0) {
  return (
    <div className="space-y-4 mt-8">
      <div className="flex items-center gap-2">
        <Store className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          More from {shopName}
        </h3>
      </div>
      <div className="flex flex-col items-center justify-center py-12 px-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
        <Store className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
          No other products from this seller yet
        </p>
        <a
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          View All Products
        </a>
      </div>
    </div>
  );
}
```

### File: `src/components/product/SimilarProducts.tsx`

Added `Package` icon import and empty state:

```tsx
if (!products || products.length === 0) {
  return (
    <div className="space-y-4 mt-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        More from {parentCategoryName}
      </h2>
      <div className="flex flex-col items-center justify-center py-12 px-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
        <Package className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
          No similar products available right now
        </p>
        <a
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          View All Products
        </a>
      </div>
    </div>
  );
}
```

## Result

- Users always see helpful section headers even when no items exist
- Clear call-to-action buttons guide users to browse all products
- Consistent dark mode support with dashed border styling
