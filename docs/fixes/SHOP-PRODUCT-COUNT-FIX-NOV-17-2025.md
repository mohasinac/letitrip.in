# Shop Product Count Fix - November 17, 2025

## Summary

Fixed shop product counts showing incorrect values due to boolean field filtering and field name mismatches.

## Problem

### Symptom

- Shops showing 0 products when they actually have products
- Shop lists displaying incorrect product counts
- Shop stats showing wrong numbers
- Frontend unable to access product count values

### Root Causes

**Issue 1: Boolean Field Filter**

```typescript
// ❌ WRONG - Excludes products with undefined is_deleted
const productsCount = await Collections.products()
  .where("shop_id", "==", shop.id)
  .where("status", "==", "published")
  .where("is_deleted", "==", false) // ❌ Excludes undefined!
  .count()
  .get();

return {
  ...shop,
  product_count: productsCount.data().count, // Returns 0 if products have undefined is_deleted
};
```

**Issue 2: Field Name Mismatch**

```typescript
// API returns: product_count (snake_case from Firestore)
// Type expects: totalProducts (camelCase)
// Transformer maps: shopBE.totalProducts
// Result: Frontend gets undefined for productCount
```

## Solution

### Fix 1: Filter in Application Code

Changed from Firestore filter to application-level filtering:

```typescript
// ✅ CORRECT - Get all published products, filter in code
const productsSnapshot = await Collections.products()
  .where("shop_id", "==", shop.id)
  .where("status", "==", "published")
  .get();

// Filter in application code to handle undefined is_deleted
const validProducts = productsSnapshot.docs.filter(
  (doc) => doc.data().is_deleted !== true
);

return {
  ...shop,
  product_count: validProducts.length,
  totalProducts: validProducts.length, // ✅ Add camelCase alias
};
```

### Fix 2: Add CamelCase Aliases

Added camelCase aliases in all shop API responses:

```typescript
// ✅ CORRECT - Map all snake_case fields to camelCase
let shops = snapshot.docs.map((doc) => {
  const data: any = doc.data();
  return {
    id: doc.id,
    ...data,
    // Add camelCase aliases
    ownerId: data.owner_id,
    isVerified: data.is_verified,
    isFeatured: data.is_featured,
    isBanned: data.is_banned,
    showOnHomepage: data.show_on_homepage,
    totalProducts: data.total_products || data.product_count || 0,
    reviewCount: data.review_count || 0,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
});
```

## Files Modified

### 1. `src/app/api/shops/route.ts`

**Changes:**

- ✅ Replaced `.where("is_deleted", "==", false).count()` with get all + filter
- ✅ Added camelCase aliases in initial shop mapping
- ✅ Added `totalProducts` alongside `product_count` in product count calculation

**Before:**

```typescript
const productsCount = await Collections.products()
  .where("shop_id", "==", shop.id)
  .where("status", "==", "published")
  .where("is_deleted", "==", false)
  .count()
  .get();

return {
  ...shop,
  product_count: productsCount.data().count,
};
```

**After:**

```typescript
const productsSnapshot = await Collections.products()
  .where("shop_id", "==", shop.id)
  .where("status", "==", "published")
  .get();

const validProducts = productsSnapshot.docs.filter(
  (doc) => doc.data().is_deleted !== true
);

return {
  ...shop,
  product_count: validProducts.length,
  totalProducts: validProducts.length,
};
```

### 2. `src/app/api/shops/[slug]/route.ts`

**Changes:**

- ✅ Added camelCase aliases when mapping shop data
- ✅ Includes `totalProducts` field from `product_count`

**Before:**

```typescript
const shop: any = { id: shopDoc.id, ...shopDoc.data() };
```

**After:**

```typescript
const data: any = shopDoc.data();
const shop: any = {
  id: shopDoc.id,
  ...data,
  // Add camelCase aliases
  ownerId: data.owner_id,
  isVerified: data.is_verified,
  isFeatured: data.is_featured,
  isBanned: data.is_banned,
  showOnHomepage: data.show_on_homepage,
  totalProducts: data.total_products || data.product_count || 0,
  reviewCount: data.review_count || 0,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
};
```

### 3. `src/app/api/shops/[slug]/stats/route.ts`

**Changes:**

- ✅ Added filtering for `is_deleted !== true` when counting products

**Before:**

```typescript
const productsSnap = await Collections.products()
  .where("shop_id", "==", shop.id)
  .get();
const products = productsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
const productCount = products.length;
```

**After:**

```typescript
const productsSnap = await Collections.products()
  .where("shop_id", "==", shop.id)
  .get();
const allProducts = productsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
// Filter out deleted products (is_deleted !== true to include undefined)
const products = allProducts.filter((p: any) => p.is_deleted !== true);
const productCount = products.length;
```

## Data Flow

### Before Fix

```
Firestore: products with is_deleted = undefined
    ↓
API: .where("is_deleted", "==", false)  ← Excludes undefined
    ↓
API: Returns { product_count: 0 }
    ↓
Transformer: Maps totalProducts = shopBE.totalProducts  ← Gets undefined
    ↓
Frontend: shop.productCount = undefined  ← Shows 0 or error
```

### After Fix

```
Firestore: products with is_deleted = undefined
    ↓
API: .get() all published products
    ↓
API: Filter .is_deleted !== true  ← Includes undefined
    ↓
API: Returns { product_count: 10, totalProducts: 10 }
    ↓
Transformer: Maps totalProducts = shopBE.totalProducts  ← Gets 10
    ↓
Frontend: shop.productCount = 10  ← Shows correct count
```

## Testing

### Manual Testing

```bash
# Test shop list
curl "http://localhost:3000/api/shops" | jq '.data[0] | {name, product_count, totalProducts}'

# Expected output:
# {
#   "name": "Demo Shop",
#   "product_count": 10,
#   "totalProducts": 10
# }

# Test individual shop
curl "http://localhost:3000/api/shops/demo-shop" | jq '.shop | {name, totalProducts}'

# Expected output:
# {
#   "name": "Demo Shop",
#   "totalProducts": 10
# }

# Test shop stats
curl "http://localhost:3000/api/shops/demo-shop/stats" | jq '.data.metrics.productCount'

# Expected output: 10
```

### Frontend Testing

1. **Shop List Page** (`/shops`)

   - ✅ Product counts should display correctly
   - ✅ "X products" should show accurate numbers

2. **Shop Detail Page** (`/shops/[slug]`)

   - ✅ Product count in header should be correct
   - ✅ Stats should match actual products

3. **Seller Dashboard** (`/seller/my-shops`)
   - ✅ Shop cards show correct product counts
   - ✅ Shop stats page shows accurate numbers

## Related Issues

This fix addresses the same root cause as:

1. **Category Product Counts** - Same `is_deleted === false` issue
2. **Boolean Field Filtering** - Same pattern across codebase
3. **Snake Case vs Camel Case** - Same field mapping issue

## Key Learnings

### ❌ Never Use Firestore Boolean Filters for Optional Fields

```typescript
// BAD - Excludes undefined
.where("is_deleted", "==", false)
.where("is_active", "==", true)
```

### ✅ Always Filter in Application Code

```typescript
// GOOD - Includes undefined
const snapshot = await query.get();
const filtered = snapshot.docs.filter((doc) => doc.data().is_deleted !== true);
```

### ❌ Never Return Only Snake_case

```typescript
// BAD - Frontend can't access camelCase fields
return { id: doc.id, ...doc.data() };
```

### ✅ Always Add CamelCase Aliases

```typescript
// GOOD - Frontend can access both formats
const data = doc.data();
return {
  id: doc.id,
  ...data,
  totalProducts: data.product_count || 0,
  isVerified: data.is_verified,
};
```

## Impact

### Before

- ❌ Shops showing 0 products incorrectly
- ❌ Shop lists unreliable
- ❌ Seller dashboard showing wrong data
- ❌ Shop stats incorrect

### After

- ✅ Accurate product counts for all shops
- ✅ Reliable shop listings
- ✅ Correct seller dashboard data
- ✅ Accurate shop statistics
- ✅ Both snake_case and camelCase fields available

## Statistics

- **Files Modified**: 3
- **Lines Changed**: ~60
- **Issues Fixed**: 2 (boolean filtering + field mapping)
- **Zero Errors**: All files compile successfully ✅

## Documentation Updated

- ✅ Added section 8 to `COMMON-ISSUES-AND-SOLUTIONS.md`
- ✅ Updated "Most Common Issues" list
- ✅ Added testing commands
- ✅ Added before/after examples

---

**Status**: ✅ Complete - Shop product counts now accurate

**Last Updated**: November 17, 2025
