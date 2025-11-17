# Price Utilities and Null Safety Improvements - Nov 17, 2025

## Overview

Created centralized price formatting utilities with comprehensive null safety to prevent `toLocaleString()` errors throughout the application. This also sets up the foundation for multi-currency support in the future.

## Changes Made

### 1. New Price Utility Library

**File**: `src/lib/price.utils.ts`

**Functions**:

- `formatPrice(value, currency, showSymbol)` - Main price formatter with null safety
- `formatINR(value)` - Quick INR formatter (most common use case)
- `safeToLocaleString(value, locale)` - Safe number formatting without symbol
- `formatPriceRange(min, max, currency)` - Format price ranges
- `formatDiscount(originalPrice, currentPrice)` - Calculate and format discount %
- `parsePrice(value)` - Parse string to number safely

**Features**:

- Returns "N/A" for null/undefined/NaN values
- Supports INR, USD, EUR, GBP (extensible)
- Configurable symbol position (before/after)
- Locale-aware number formatting
- Zero minimum configuration for Indian market

### 2. Auction Page Fixes

**File**: `src/app/auctions/[slug]/page.tsx`

**Fixed Errors**:

1. Line 565: `auction.startingPrice.toLocaleString()` → `formatINR(auction.startingPrice)`
2. Line 463: Current bid display → `formatINR(auction.currentBid || auction.currentPrice)`

**Changes**:

- Added price utility imports
- Replaced all manual price formatting with `formatINR()`
- All auction prices now have null safety

### 3. Product Page Fixes

**File**: `src/app/products/[slug]/page.tsx`

**Changes**:

- Added price utility imports (`formatINR`, `formatDiscount`)
- Replaced manual price displays with utility functions
- Replaced manual discount calculation with `formatDiscount()`
- All product prices now have null safety

**Before**:

```tsx
₹{product.price.toLocaleString()}
```

**After**:

```tsx
{
  formatINR(product.price);
}
```

## Benefits

### 1. Null Safety

- No more `cannot read property 'toLocaleString' of undefined` errors
- Graceful fallbacks to "N/A" or "0"
- Handles null, undefined, and NaN consistently

### 2. Consistency

- Uniform price formatting across entire app
- Single source of truth for price display logic
- Easy to update formatting globally

### 3. Future-Ready

- Multi-currency support ready
- Easy to add new currencies
- Configurable locale settings
- Symbol position per currency

### 4. Maintainability

- Centralized logic for price formatting
- Easier to test
- Reduced code duplication

## Usage Examples

```typescript
import {
  formatINR,
  formatPrice,
  formatDiscount,
  formatPriceRange,
} from "@/lib/price.utils";

// Basic INR formatting
formatINR(1999); // "₹1,999"
formatINR(null); // "N/A"

// Multi-currency
formatPrice(100, "USD"); // "$100"
formatPrice(100, "EUR"); // "100€"

// Discount calculation
formatDiscount(2999, 1999); // "-33%"
formatDiscount(1000, 1200); // null (no discount)

// Price ranges
formatPriceRange(100, 500); // "₹100 - ₹500"
```

## Migration Path

### Phase 1: Critical Pages (✅ Complete)

- ✅ Auction detail page
- ✅ Product detail page

### Phase 2: Product Display Components (Next)

- ProductCard components
- ProductVariants
- SellerProducts
- SimilarProducts

### Phase 3: Admin & Seller Pages

- Product creation forms
- Product edit forms
- Order management
- Analytics dashboards

### Phase 4: Cart & Checkout

- Cart items
- Order summary
- Payment displays

## Search Patterns to Fix

To find remaining instances that need updating:

```bash
# Find manual toLocaleString() calls
grep -r "toLocaleString()" --include="*.tsx" --include="*.ts" src/

# Find manual ₹ symbols
grep -r "₹{" --include="*.tsx" src/

# Find manual price calculations
grep -r "compareAtPrice - price" --include="*.tsx" src/
```

## Testing Checklist

- [x] Auction page with undefined startingPrice
- [x] Auction page with null currentBid
- [x] Product page with null price
- [x] Product page with null compareAtPrice
- [ ] Product cards in listings
- [ ] Cart item prices
- [ ] Checkout summary
- [ ] Seller dashboard prices

## Related Issues Fixed

1. **auction.startingPrice is undefined** - Fixed with `formatINR()` null safety
2. **Manual discount calculations** - Replaced with `formatDiscount()` utility
3. **Inconsistent price formatting** - Now uses centralized utils
4. **No multi-currency support** - Foundation laid for future expansion

## Notes

- All new price displays should use `formatINR()` by default
- For forms/inputs, use `parsePrice()` to safely parse user input
- For price comparisons in logic, check for null first or use utility
- Currency config can be extended in `CURRENCY_CONFIGS` object

## Next Steps

1. Update all product card components to use utilities
2. Update admin/seller product forms
3. Update cart and checkout pages
4. Add unit tests for price utilities
5. Consider adding currency selector for multi-region support
