# Firestore Index Status & Monitoring

**Date:** November 2, 2025  
**Status:** 🔄 Index Building in Progress

## Recently Deployed Index

### Products Collection - Stock Filter Index

**Index Configuration:**

```json
{
  "collectionGroup": "products",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "quantity", "order": "ASCENDING" },
    { "fieldPath": "__name__", "order": "ASCENDING" }
  ]
}
```

**Purpose:**

- Enables filtering products by status AND quantity (in-stock filtering)
- Required for query: `products.where("status", "==", "active").where("quantity", ">", 0)`
- Used by: `/api/products?inStock=true` endpoint

**Deployment:**

- Deployed: November 2, 2025
- Command: `firebase deploy --only firestore:indexes`
- Status: Building (typically takes 5-15 minutes)

---

## How to Check Index Status

### Method 1: Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/project/justforview1/firestore/indexes)
2. Navigate to: Firestore Database > Indexes
3. Look for the index with fields: `status`, `quantity`, `__name__`
4. Status should be:
   - 🔄 **Building** - Index is being created (wait a few minutes)
   - ✅ **Enabled** - Index is ready to use
   - ❌ **Error** - Something went wrong (check error message)

### Method 2: Firebase CLI

```powershell
firebase firestore:indexes
```

### Method 3: Test the Query

Try accessing a category page with stock filter:

```
https://your-domain.com/categories/any-category?inStock=true
```

If the page loads without errors, the index is ready!

---

## Temporary Fallback Solution

**What We Did:**
We implemented a graceful fallback in the products API to handle the period while the index is building:

```typescript
// Try to use Firestore query
try {
  query = query.where("quantity", ">", 0);
} catch (error) {
  // Fall back to in-memory filtering
  useInMemoryStockFilter = true;
}

// Later, after fetching products
if (useInMemoryStockFilter) {
  products = products.filter((product) => {
    const stock = product.quantity ?? product.stock ?? 0;
    return stock > 0;
  });
}
```

**Benefits:**

- ✅ Site continues to work while index builds
- ✅ Automatic switch to optimal query once index is ready
- ✅ No downtime or user-facing errors
- ⚠️ Slightly slower performance during fallback (filters in-memory)

---

## Expected Timeline

| Time     | Status         | User Impact               |
| -------- | -------------- | ------------------------- |
| 0 min    | Index deployed | Using in-memory fallback  |
| 2-5 min  | Index building | Using in-memory fallback  |
| 5-15 min | Index ready    | Full performance restored |

---

## Monitoring During Index Build

### Signs Index is Still Building:

- Console warning: "Stock filter index not ready, using in-memory filtering"
- OR console warning: "Composite index not ready, using fallback query"
- Category pages work but may be slightly slower
- All products shown regardless of stock filter

### Signs Index is Ready:

- No console warnings about indexes
- Stock filter works correctly
- Page load times are optimal
- Only in-stock items shown when filter applied

---

## If Index Fails to Build

### Common Causes:

1. **Collection is empty** - Index can't be built on empty collection
2. **Field name mismatch** - Check if products use `quantity` or `stock`
3. **Permissions issue** - Check Firebase project permissions
4. **Firebase quota limits** - Check project quotas

### Troubleshooting Steps:

#### 1. Check Index Status

```powershell
firebase firestore:indexes
```

#### 2. Verify Products Collection

- Ensure products exist in Firestore
- Check field names match the index

#### 3. Manual Index Creation

If automatic deployment failed, create manually:

1. Go to Firebase Console > Firestore > Indexes
2. Click "Create Index"
3. Set up:
   - Collection: `products`
   - Fields:
     - `status` (Ascending)
     - `quantity` (Ascending)
     - `__name__` (Ascending)
4. Click "Create"

#### 4. Check Error Logs

```powershell
firebase functions:log
```

---

## Related Indexes

### All Products Indexes

We have several indexes for the products collection:

1. **Status + Stock** (NEW)

   - Fields: `status`, `stock`, `__name__`
   - Purpose: In-stock filter for products using `stock` field

2. **Status + Quantity** (NEW)

   - Fields: `status`, `quantity`, `__name__`
   - Purpose: In-stock filter for products using `quantity` field

3. **Status + Category + CreatedAt**

   - Purpose: Category filtering with date sorting

4. **Status + Category + Price**

   - Purpose: Category filtering with price sorting

5. **Status + Featured + CreatedAt**
   - Purpose: Featured products listing

And more... (see `firestore.indexes.json` for complete list)

---

## Future Improvements

### 1. Standardize Stock Field

Currently, products have two different fields:

- Old products: `quantity`
- New products: `stock`

**Recommendation:** Migrate all to use `stock` field

### 2. Index Monitoring

Set up automated monitoring:

- Alert when index build fails
- Track index usage and performance
- Notify when new indexes are needed

### 3. Development Environment

Create separate Firebase project for development:

- Test index changes before production
- Avoid production downtime
- Faster iteration

---

## Contact & Support

If you encounter issues with indexes:

1. Check Firebase Console for error messages
2. Review application logs for query errors
3. Verify index is fully built (not in "Building" state)
4. Check this document's troubleshooting section

---

## Deployment Checklist

When deploying new indexes:

- [ ] Test index configuration locally (if possible)
- [ ] Deploy during low-traffic period
- [ ] Implement fallback mechanism (in-memory filtering)
- [ ] Monitor Firebase Console for build status
- [ ] Test queries after deployment
- [ ] Verify no errors in application logs
- [ ] Check index is marked as "Enabled"
- [ ] Remove fallback code after confirmed working (optional)

---

## Quick Commands

```powershell
# Deploy indexes
firebase deploy --only firestore:indexes

# Check index status
firebase firestore:indexes

# Watch for errors (in another terminal)
npm run dev

# Test category page
# Visit: http://localhost:3000/categories/electronics?inStock=true
```

---

## Status Log

| Date        | Action                             | Status      |
| ----------- | ---------------------------------- | ----------- |
| Nov 2, 2025 | Deployed `status + quantity` index | 🔄 Building |
| Nov 2, 2025 | Implemented fallback mechanism     | ✅ Complete |
| Nov 2, 2025 | Updated documentation              | ✅ Complete |

---

_This document will be updated as the index build completes._
