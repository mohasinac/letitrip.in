# Products API Pagination and Filtering Issues - Nov 17, 2025

## Problem

The products API (`/api/products`) is not properly leveraging Firebase's query capabilities:

1. **Fetches all products first** - Query runs without limit, fetching entire result set
2. **Client-side filtering** - Price range and search filters applied in memory after fetch
3. **In-memory pagination** - Slicing results in memory instead of using Firebase pagination
4. **Performance impact** - As product count grows, this becomes increasingly slow
5. **Pagination breaks after filters** - Total count doesn't match filtered count correctly

### Current Flow (BAD)

```typescript
// 1. Fetch ALL products from Firebase
const countSnapshot = await query.get(); // Gets EVERYTHING
let allProducts = countSnapshot.docs.map(...); // In memory

// 2. Filter in JavaScript
if (minPrice) allProducts = allProducts.filter(...);
if (maxPrice) allProducts = allProducts.filter(...);
if (search) allProducts = allProducts.filter(...);

// 3. Paginate in JavaScript
const paginatedProducts = allProducts.slice(offset, offset + limit);
```

### What Should Happen (GOOD)

```typescript
// 1. Build Firebase query with ALL filters
query = query.where("price", ">=", minPrice);
query = query.where("price", "<=", maxPrice);

// 2. Apply limit and pagination at query level
query = query.limit(limit);
if (lastDoc) query = query.startAfter(lastDoc);

// 3. Execute single optimized query
const snapshot = await query.get();
```

## Root Cause

File: `src/app/api/products/route.ts` (Lines 75-115)

The API is trying to avoid composite index requirements by not adding filters to the Firestore query. However, this defeats the purpose of using a database - filtering should happen at the data layer, not the application layer.

## Issues This Causes

### 1. Pagination Breaks

- Total count includes unfiltered products
- Page numbers don't match actual filtered results
- "Page 2" might have no results if filters eliminate first page items

### 2. Performance Degrades

- With 1000 products, fetches all 1000 even if user wants 20
- JavaScript filtering is slow compared to database indexes
- Memory usage scales with total product count, not page size

### 3. Index Requirements Ignored

- Firebase composite indexes exist for a reason
- Proper indexes make filtered queries fast
- Current approach sacrifices performance to avoid creating indexes

### 4. Search is Inefficient

- Text search on entire dataset in memory
- Case-insensitive comparison on every product
- Should use proper search index (Algolia/Typesense) or at minimum field-based queries

## Required Composite Indexes

For proper Firebase querying, these indexes are needed:

```json
{
  "indexes": [
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "shop_id", "order": "ASCENDING" },
        { "fieldPath": "price", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category_id", "order": "ASCENDING" },
        { "fieldPath": "price", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "price", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "shop_id", "order": "ASCENDING" },
        { "fieldPath": "category_id", "order": "ASCENDING" },
        { "fieldPath": "price", "order": "ASCENDING" }
      ]
    }
  ]
}
```

## Recommended Solution

### Option 1: Use Firebase Queries Properly (RECOMMENDED)

**Pros:**

- Fast, scalable, database-native
- Pagination works correctly
- Supports complex filters
- No memory overhead

**Cons:**

- Requires composite indexes (which should exist anyway)
- Need to handle index creation during deployment

**Implementation:**

```typescript
// Build complete Firebase query
let query = baseQuery;

// Add filters to query (not JS array)
if (shopId) query = query.where("shop_id", "==", shopId);
if (categoryId) query = query.where("category_id", "==", categoryId);
if (status) query = query.where("status", "==", status);
if (minPrice) query = query.where("price", ">=", minPrice);
if (maxPrice) query = query.where("price", "<=", maxPrice);

// Add sorting
query = query.orderBy("price", "asc");

// Add pagination at query level
query = query.limit(limit);
if (startAfterDoc) query = query.startAfter(startAfterDoc);

// Execute single optimized query
const snapshot = await query.get();
```

### Option 2: Use Cursor-Based Pagination

Instead of page numbers, use document cursors for next/previous:

```typescript
// Request includes lastDocId from previous page
const lastDocId = searchParams.get("lastDocId");
if (lastDocId) {
  const lastDoc = await Collections.products().doc(lastDocId).get();
  query = query.startAfter(lastDoc);
}

query = query.limit(limit + 1); // Fetch one extra to check hasNext

const docs = snapshot.docs;
const hasNext = docs.length > limit;
const results = docs.slice(0, limit);

return {
  data: results,
  pagination: {
    hasNext,
    lastDocId: results[results.length - 1]?.id,
  },
};
```

### Option 3: Hybrid Approach

- Use Firebase queries for filterable fields (shop, category, status, price)
- Use separate search service (Algolia/Typesense) for text search
- Keep pagination at database level

## Search-Specific Issue

Text search in Firebase is not efficient. Options:

### Option A: Use Search Service (BEST)

- Algolia, Typesense, or MeiliSearch
- Full-text search with typo tolerance
- Faceted filtering
- Fast and scalable

### Option B: Use Array-contains for Tags

```typescript
// Store searchable terms in array
product.searchTerms = ["laptop", "dell", "xps", "13"];

// Query with array-contains
query = query.where("searchTerms", "array-contains", searchTerm);
```

### Option C: Field-specific Prefix Search

```typescript
// Search only in name field with prefix
query = query
  .where("name", ">=", search)
  .where("name", "<=", search + "\uf8ff");
```

## Migration Steps

### Phase 1: Add Required Indexes

1. Update `firestore.indexes.json` with composite indexes
2. Deploy indexes to Firebase
3. Wait for index build completion

### Phase 2: Update API

1. Move filtering from JS to Firebase queries
2. Add proper orderBy clauses
3. Implement cursor-based pagination
4. Update pagination response format

### Phase 3: Update Frontend

1. Update service to use cursor pagination
2. Handle `lastDocId` in pagination state
3. Update UI to use next/prev instead of page numbers
4. Add loading states for page transitions

### Phase 4: Add Search Service (Optional)

1. Set up Algolia/Typesense
2. Sync products to search index
3. Update search endpoint to use search service
4. Keep Firebase for browse/filter

## Impact

### Before (Current)

- Fetches 1000 products to show 20
- 5-10 second response time with filters
- Pagination shows wrong counts
- Memory usage: O(total products)

### After (Fixed)

- Fetches exactly 20 products
- <500ms response time
- Pagination accurate
- Memory usage: O(page size)

## Related Files

- `src/app/api/products/route.ts` - Main API needing fixes
- `src/services/products.service.ts` - Frontend service (looks OK)
- `firestore.indexes.json` - Need to add composite indexes
- `src/app/api/lib/firebase/queries.ts` - Query builder functions

## References

- User feedback: "pagination may not work after apply filter"
- Firebase docs: https://firebase.google.com/docs/firestore/query-data/queries
- Composite indexes: https://firebase.google.com/docs/firestore/query-data/indexing

## Priority

**HIGH** - This affects core product browsing functionality and will cause major performance issues as the product catalog grows. Should be fixed before launch.
