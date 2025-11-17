# Fix Summary: Addresses Index & Price Validation

## Issues Fixed

### 1. **Addresses Query Index Missing**

**Error:**

```
FAILED_PRECONDITION: The query requires an index
Query: addresses.where(userId).orderBy(isDefault, desc).orderBy(createdAt, desc)
```

**Root Cause:**
The `/api/user/addresses` route was querying with a composite index that didn't exist:

- `userId` (ASCENDING)
- `isDefault` (DESCENDING)
- `createdAt` (DESCENDING)

**Fix Applied:**
Added composite index to `firestore.indexes.json`:

```json
{
  "collectionGroup": "addresses",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "isDefault", "order": "DESCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" },
    { "fieldPath": "__name__", "order": "ASCENDING" }
  ]
}
```

**Deployment:**
Run: `firebase deploy --only firestore:indexes`

---

### 2. **Product Price Undefined Error**

**Error:**

```
Error: can't access property "toLocaleString", price is undefined
Resource: demo-charizard-vmax-37
Stack: formatPrice@http://localhost:3000/_next/static/chunks/src_fc0d8b33._.js:4463:16
```

**Root Cause:**
The `formatPrice()` function in `src/types/transforms/product.transforms.ts` didn't handle undefined/null prices, causing the error page to crash when displaying products with missing price data.

**Fix Applied:**
Updated `formatPrice()` function to handle edge cases:

**Before:**

```typescript
function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}
```

**After:**

```typescript
function formatPrice(price: number | undefined | null): string {
  if (price === undefined || price === null || isNaN(price)) {
    return "₹0";
  }
  return `₹${price.toLocaleString("en-IN")}`;
}
```

**Impact:**

- Error pages no longer crash when product price is missing
- Displays "₹0" as fallback for invalid prices
- Prevents similar issues with other currency formatting

---

## Files Modified

1. **firestore.indexes.json**

   - Added addresses composite index

2. **src/types/transforms/product.transforms.ts**
   - Updated `formatPrice()` with null safety

---

## Testing

### Addresses Query

```bash
# After index deployment completes:
# 1. Visit http://localhost:3000/user/addresses
# 2. Should load without errors
# 3. Verify addresses are sorted: default first, then by date
```

### Price Validation

```bash
# Test with products that have missing/invalid prices:
# 1. Visit product with undefined price
# 2. Should display "₹0" instead of crashing
# 3. Error page should load correctly
```

---

## Data Cleanup Recommendations

While the fixes prevent crashes, consider cleaning up any products with invalid prices:

```typescript
// Optional cleanup script (not included)
// Find products with missing prices:
const productsRef = db.collection("products");
const badProducts = await productsRef.where("price", "==", null).get();

// Or products where price is 0:
const zeroPrice = await productsRef.where("price", "==", 0).get();
```

---

## Prevention

**Product Validation:**
Consider adding server-side validation in product creation/update APIs:

```typescript
if (!price || price <= 0) {
  return NextResponse.json(
    { error: "Price is required and must be greater than 0" },
    { status: 400 }
  );
}
```

**Form Validation:**
Ensure product forms require price input before submission.

---

## Status

✅ **Firestore Index**: Added (deployment in progress)  
✅ **Price Formatting**: Fixed (null-safe)  
🔄 **Index Deployment**: Running `firebase deploy --only firestore:indexes`  
⏳ **Index Build Time**: ~5-10 minutes after deployment
