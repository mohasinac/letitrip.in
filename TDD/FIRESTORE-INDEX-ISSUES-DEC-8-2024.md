# Firestore Index Issues - December 8, 2024

## Overview

Multiple API routes are failing with `FAILED_PRECONDITION` errors due to missing Firestore composite indexes. This is **not a code bug** - it's a database configuration issue that requires creating indexes in Firebase Console.

## Issue Type

**Infrastructure/Configuration Issue** - Not a code bug

## Impact

- **Severity**: High - Multiple features broken in development
- **User Impact**: Categories, products, shops, reviews, blog, and cart features failing
- **Environment**: Development (local Firestore emulator or cloud instance)

## Missing Indexes Summary

### 1. Products Collection (3 indexes needed)

**Index 1: Featured Products**

```
Collection: products
Fields:
  - is_featured (Ascending)
  - status (Ascending)
  - created_at (Descending)
  - stock_count (Descending)
```

[Create Index](https://console.firebase.google.com/v1/r/project/letitrip-in-app/firestore/indexes?create_composite=ClBwcm9qZWN0cy9sZXRpdHJpcC1pbi1hcHAvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3Byb2R1Y3RzL2luZGV4ZXMvXxABGg8KC2lzX2ZlYXR1cmVkEAEaCgoGc3RhdHVzEAEaDgoKY3JlYXRlZF9hdBACGg8KC3N0b2NrX2NvdW50EAIaDAoIX19uYW1lX18QAg)

**Index 2: Recent Products**

```
Collection: products
Fields:
  - status (Ascending)
  - created_at (Descending)
  - stock_count (Descending)
```

[Create Index](https://console.firebase.google.com/v1/r/project/letitrip-in-app/firestore/indexes?create_composite=ClBwcm9qZWN0cy9sZXRpdHJpcC1pbi1hcHAvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3Byb2R1Y3RzL2luZGV4ZXMvXxABGgoKBnN0YXR1cxABGg4KCmNyZWF0ZWRfYXQQAhoPCgtzdG9ja19jb3VudBACGgwKCF9fbmFtZV9fEAI)

### 2. Categories Collection (1 index needed)

**Featured Categories**

```
Collection: categories
Fields:
  - featured (Ascending)
  - isActive (Ascending)
  - featured_order (Ascending)
```

[Create Index](https://console.firebase.google.com/v1/r/project/letitrip-in-app/firestore/indexes?create_composite=ClJwcm9qZWN0cy9sZXRpdHJpcC1pbi1hcHAvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2NhdGVnb3JpZXMvaW5kZXhlcy9fEAEaDAoIZmVhdHVyZWQQARoMCghpc0FjdGl2ZRABGhIKDmZlYXR1cmVkX29yZGVyEAEaDAoIX19uYW1lX18QAQ)

### 3. Shops Collection (1 index needed)

**Featured Shops**

```
Collection: shops
Fields:
  - featured (Ascending)
  - featured_order (Ascending)
```

[Create Index](https://console.firebase.google.com/v1/r/project/letitrip-in-app/firestore/indexes?create_composite=Ck1wcm9qZWN0cy9sZXRpdHJpcC1pbi1hcHAvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3Nob3BzL2luZGV4ZXMvXxABGgwKCGZlYXR1cmVkEAEaEgoOZmVhdHVyZWRfb3JkZXIQARoMCghfX25hbWVfXxAB)

### 4. Reviews Collection (1 index needed)

**Recent High-Rated Reviews**

```
Collection: reviews
Fields:
  - isApproved (Ascending)
  - rating (Descending)
  - created_at (Descending)
```

[Create Index](https://console.firebase.google.com/v1/r/project/letitrip-in-app/firestore/indexes?create_composite=Ck9wcm9qZWN0cy9sZXRpdHJpcC1pbi1hcHAvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3Jldmlld3MvaW5kZXhlcy9fEAEaDgoKaXNBcHByb3ZlZBABGgoKBnJhdGluZxACGg4KCmNyZWF0ZWRfYXQQAhoMCghfX25hbWVfXxAC)

### 5. Blog Posts Collection (1 index needed)

**Featured Blog Posts**

```
Collection: blog_posts
Fields:
  - is_featured (Ascending)
  - status (Ascending)
  - publishedAt (Descending)
```

[Create Index](https://console.firebase.google.com/v1/r/project/letitrip-in-app/firestore/indexes?create_composite=ClJwcm9qZWN0cy9sZXRpdHJpcC1pbi1hcHAvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2Jsb2dfcG9zdHMvaW5kZXhlcy9fEAEaDwoLaXNfZmVhdHVyZWQQARoKCgZzdGF0dXMQARoPCgtwdWJsaXNoZWRBdBACGgwKCF9fbmFtZV9fEAI)

### 6. Carts Collection (1 index needed)

**User Cart Items**

```
Collection: carts
Fields:
  - user_id (Ascending)
  - added_at (Descending)
```

[Create Index](https://console.firebase.google.com/v1/r/project/letitrip-in-app/firestore/indexes?create_composite=Ck1wcm9qZWN0cy9sZXRpdHJpcC1pbi1hcHAvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2NhcnRzL2luZGV4ZXMvXxABGgsKB3VzZXJfaWQQARoMCghhZGRlZF9hdBACGgwKCF9fbmFtZV9fEAI)

## Affected API Routes

| Route                                          | Status | Index Needed     |
| ---------------------------------------------- | ------ | ---------------- |
| `/api/products?featured=true&status=published` | 500    | Products Index 1 |
| `/api/products?status=published&inStock=true`  | 500    | Products Index 2 |
| `/api/homepage/categories/featured`            | 500    | Categories Index |
| `/api/homepage/shops/featured`                 | 500    | Shops Index      |
| `/api/homepage/reviews`                        | 500    | Reviews Index    |
| `/api/blog?featured=true&status=published`     | 500    | Blog Posts Index |
| `/api/cart`                                    | 500    | Carts Index      |

## Solutions

### Option 1: Create Indexes via Firebase Console (Recommended for Production)

1. Click each "Create Index" link above
2. Firebase Console will pre-fill the index configuration
3. Click "Create Index" button
4. Wait 1-5 minutes for index to build

### Option 2: Use Firestore Index Deployment Script

The project has a `firestore-indexes/` directory with index definitions:

```powershell
# Deploy all indexes
cd firestore-indexes
node deploy-indexes.js
```

Individual index files:

- `products.js` - Products indexes
- `categories.js` - Categories indexes
- `shops.js` - Shops indexes
- `reviews.js` - Reviews indexes
- `blog_posts.js` - Blog posts indexes (may need to be created)
- `carts.js` - Cart indexes (may need to be created)

### Option 3: Add to firestore.indexes.json

Add these to your `firestore.indexes.json` file:

```json
{
  "indexes": [
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "is_featured", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" },
        { "fieldPath": "stock_count", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" },
        { "fieldPath": "stock_count", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "categories",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "featured", "order": "ASCENDING" },
        { "fieldPath": "isActive", "order": "ASCENDING" },
        { "fieldPath": "featured_order", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "shops",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "featured", "order": "ASCENDING" },
        { "fieldPath": "featured_order", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "reviews",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isApproved", "order": "ASCENDING" },
        { "fieldPath": "rating", "order": "DESCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "blog_posts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "is_featured", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "publishedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "carts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "user_id", "order": "ASCENDING" },
        { "fieldPath": "added_at", "order": "DESCENDING" }
      ]
    }
  ]
}
```

Then deploy:

```powershell
firebase deploy --only firestore:indexes
```

## Why This Happens

Firestore requires composite indexes for queries with:

- Multiple `where()` clauses on different fields
- `where()` + `orderBy()` on different fields
- Multiple `orderBy()` clauses
- Range filters on multiple fields

These queries need indexes because they can't be efficiently executed without them.

## Prevention

### For Development

Use Firestore emulator with auto-generated indexes:

```powershell
firebase emulators:start --import=./firestore-export --export-on-exit
```

The emulator will automatically create needed indexes and export them.

### For Production

1. **Test queries in development first** - Firestore will show index creation URLs
2. **Use the deploy-indexes script** - Automates index creation
3. **Monitor Firestore usage** - Firebase Console shows index usage stats
4. **Review firestore.indexes.json** - Keep it updated with all needed indexes

## Testing After Index Creation

Once indexes are created, test these routes:

```powershell
# Featured products
curl http://localhost:3000/api/products?featured=true&status=published&inStock=true&pageSize=10

# Recent products
curl http://localhost:3000/api/products?status=published&inStock=true&sorts=-created_at&pageSize=10

# Featured categories
curl http://localhost:3000/api/homepage/categories/featured?categoryLimit=6

# Featured shops
curl http://localhost:3000/api/homepage/shops/featured?shopLimit=4

# Recent reviews
curl http://localhost:3000/api/homepage/reviews?minRating=4&limit=10

# Featured blog posts
curl http://localhost:3000/api/blog?featured=true&status=published&limit=10

# Cart
curl http://localhost:3000/api/cart
```

All should return 200 status codes.

## Related Documentation

- [Firestore Index Documentation](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Index Best Practices](https://firebase.google.com/docs/firestore/query-data/index-overview)
- [Managing Indexes](https://firebase.google.com/docs/firestore/query-data/index-management)

## Status

- **Discovered**: December 8, 2024
- **Type**: Infrastructure/Configuration Issue
- **Priority**: High (blocks development features)
- **Resolved**: December 8, 2024 ✅
- **Resolution Time**: ~5 minutes
- **Method**: Automated deployment via deploy-indexes.js script

## Resolution Summary

### Indexes Added

Created two new index definition files:

- `firestore-indexes/blog-posts.js` - 4 indexes for blog functionality
- `firestore-indexes/carts.js` - 3 indexes for cart operations

### Indexes Enhanced

Added missing composite indexes to existing files:

- **products.js**: Added 2 new indexes for featured/in-stock filtering
- **categories.js**: Added 1 index for featured_order sorting
- **shops.js**: Added 1 index for featured_order sorting
- **reviews.js**: Added 1 index for approved high-rated reviews

### Deployment Results

```
📊 Total: 112 indexes, 2 field overrides
✓ Successfully deployed to Firebase project: letitrip-in-app
```

All 7 missing indexes have been created and deployed successfully.

---

**Note**: This was NOT a code bug. The code was correct - it just needed database indexes to be created in Firebase. All indexes are now live and the application should work correctly.
