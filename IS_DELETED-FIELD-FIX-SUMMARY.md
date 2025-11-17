# is_deleted Field Fix Summary

**Date**: November 17, 2025  
**Issue**: Products/Auctions with missing `is_deleted` field not being counted  
**Root Cause**: Checking `is_deleted === false` returns false for undefined values

---

## Problem Description

### Original Issue

All category product counts showed **0** even though 300 published products existed in the database.

### Root Cause Analysis

1. Demo products were created without the `is_deleted` field (field was undefined)
2. Counting logic used `is_deleted === false` condition
3. In JavaScript: `undefined === false` evaluates to `false`
4. Result: All products were excluded from counts

### Impact

- ❌ Category product counts: 0 (should be 300)
- ❌ Category pages showed "No products"
- ❌ Search and filtering affected
- ❌ Admin dashboard stats incorrect

---

## Files Fixed

### 1. ✅ `src/lib/category-hierarchy.ts`

**Function**: `countLeafCategoryProducts()`

**Before**:

```typescript
const productsSnapshot = await db
  .collection("products")
  .where("category_id", "==", categoryId)
  .where("status", "==", "published")
  .where("is_deleted", "==", false) // ❌ Excludes undefined
  .count()
  .get();
```

**After**:

```typescript
const productsSnapshot = await db
  .collection("products")
  .where("category_id", "==", categoryId)
  .where("status", "==", "published")
  .get();

// Filter out deleted products (handles both is_deleted: true and missing field)
const validProducts = productsSnapshot.docs.filter(
  (doc) => doc.data().is_deleted !== true // ✅ Includes undefined
);

return validProducts.length;
```

**Why This Works**:

- `undefined !== true` = `true` ✅ (includes products without field)
- `false !== true` = `true` ✅ (includes explicitly not deleted)
- `true !== true` = `false` ❌ (excludes deleted products)

---

### 2. ✅ `src/app/api/admin/debug/products-by-category/route.ts`

**Changed 3 instances**:

**Before**:

```typescript
p.status === "published" && p.is_deleted === false;
```

**After**:

```typescript
p.status === "published" && p.is_deleted !== true;
```

**Locations**:

- Line 30: Published product count for specific category
- Line 63: Published increment in main loop
- Line 87: Summary published count

---

## The Fix Pattern

### ❌ **WRONG** - Excludes undefined:

```typescript
if (product.is_deleted === false) { ... }
if (product.is_deleted == false) { ... }
if (!product.is_deleted) { ... }  // Also wrong for false values
```

### ✅ **CORRECT** - Includes undefined:

```typescript
if (product.is_deleted !== true) { ... }
```

### Truth Table:

| `is_deleted` value | `=== false` | `!== true` |
| ------------------ | ----------- | ---------- |
| `undefined`        | ❌ false    | ✅ true    |
| `false`            | ✅ true     | ✅ true    |
| `true`             | ❌ false    | ❌ false   |

---

## Testing Results

### Before Fix

```bash
$ curl http://localhost:3000/api/admin/debug/products-by-category

{
  "totalProducts": 300,
  "publishedProducts": 0,  ❌
  "categoriesWithProducts": 37
}
```

### After Fix

```bash
$ curl http://localhost:3000/api/admin/categories/rebuild-counts -X POST

{
  "success": true,
  "updated": 81,
  "details": {
    "categoryCounts": {
      "ypeU6BbH9pdCsLJnisip": { "name": "DEMO_Pokemon TCG", "count": 18 },
      "w1ZRd4wJ2lFfg1IhAh59": { "name": "DEMO_Beyblades", "count": 96 },
      "TIpvDKSGU1phLwEbDtJd": { "name": "DEMO_Trading Card Games", "count": 34 },
      ...
    }
  }
}
```

### Verification

```bash
$ curl http://localhost:3000/api/admin/debug/products-by-category

{
  "totalProducts": 300,
  "publishedProducts": 300,  ✅
  "categoriesWithProducts": 37,
  "productsByCategory": {
    "WhPr9OzY1SI0cs4LMaC5": {
      "total": 8,
      "published": 8  ✅
    },
    ...
  }
}
```

---

## Remaining Work

### Additional API Routes to Check

These routes may have similar issues (need verification):

1. **Products API** - `src/app/api/products/route.ts`
   - Check if list endpoint filters by `is_deleted`
2. **Auctions API** - `src/app/api/auctions/route.ts`
   - Check if auction listing filters deleted items
3. **Search API** - `src/app/api/search/route.ts`

   - Verify search doesn't return deleted items

4. **Admin Stats** - `src/app/api/admin/stats/route.ts`
   - Dashboard counts may be affected

### Recommended Pattern for All Future Code

**Always use**:

```typescript
.where("is_deleted", "!=", true)  // Firestore query
// OR
.filter(doc => doc.data().is_deleted !== true)  // JS filter
```

**Never use**:

```typescript
.where("is_deleted", "==", false)  // ❌ Excludes undefined
```

---

## Database Migration (Optional)

To prevent future issues, consider adding the field explicitly to all documents:

```typescript
// Migration script
const db = getFirestoreAdmin();
const productsRef = db.collection("products");
const batch = db.batch();

const snapshot = await productsRef.where("is_deleted", "==", null).get();

snapshot.docs.forEach((doc) => {
  if (doc.data().is_deleted === undefined) {
    batch.update(doc.ref, { is_deleted: false });
  }
});

await batch.commit();
```

---

## Related Issues Fixed

1. ✅ Category product counts now show correct numbers
2. ✅ Parent categories sum children counts correctly
3. ✅ Leaf categories count products directly
4. ✅ Debug endpoint provides accurate statistics
5. ✅ Rebuild endpoint works correctly

---

## Key Learnings

### 1. **undefined !== false** in JavaScript

- Always consider undefined as a valid state
- Explicit checks are safer than implicit comparisons

### 2. **Firestore Field Patterns**

- Fields may not exist in older documents
- Queries can't check for "not equal to false" directly
- Need to fetch and filter in code for complex conditions

### 3. **Boolean Field Best Practices**

- Set default values when creating documents
- Use `!== true` for checking if field is not true
- Document field behavior in type definitions

---

## Prevention Checklist

For all future boolean fields in Firestore:

- [ ] Add default value in create operations
- [ ] Use `!== true` when checking false/undefined
- [ ] Add migration for existing documents
- [ ] Document field behavior in types
- [ ] Test with undefined/false/true values
- [ ] Add validation in API routes

---

## Summary

**Problem**: `is_deleted === false` excluded products without the field  
**Solution**: Changed to `is_deleted !== true` to include undefined values  
**Result**: All 300 products now counted correctly across 37 categories  
**Status**: ✅ **FIXED**

---

**Related Documentation**:

- [CATEGORY-COUNT-VERIFICATION.md](./CATEGORY-COUNT-VERIFICATION.md)
- [DEBUG-CATEGORY-COUNTS.md](./DEBUG-CATEGORY-COUNTS.md)
- [LATEST-FIXES-NOV-17-2025.md](./LATEST-FIXES-NOV-17-2025.md)
