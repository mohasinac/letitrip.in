# API Routes Pagination & Filtering Fix - Implementation Plan

## Overview
Apply the same cursor-based pagination and Firebase query optimization to all API routes, following the pattern established for products API.

## Pattern to Apply

### Standard Query Pattern
```typescript
// Parse params
const startAfter = searchParams.get("startAfter");
const limit = parseInt(searchParams.get("limit") || "50");
const sortBy = searchParams.get("sortBy") || "created_at";
const sortOrder = searchParams.get("sortOrder") || "desc";

// Build base query with filters
let query = baseQuery;
if (filter1) query = query.where("field1", "==", filter1);
if (filter2) query = query.where("field2", ">=", filter2);

// Add sorting
query = query.orderBy(sortBy, sortOrder as any);

// Apply cursor pagination
if (startAfter) {
  const startDoc = await Collections.collection().doc(startAfter).get();
  if (startDoc.exists) query = query.startAfter(startDoc);
}

// Fetch limit + 1 to check hasNextPage
query = query.limit(limit + 1);
const snapshot = await query.get();
const docs = snapshot.docs;

// Check if there's a next page
const hasNextPage = docs.length > limit;
const resultDocs = hasNextPage ? docs.slice(0, limit) : docs;

// Transform and return
const data = resultDocs.map(doc => ({ id: doc.id, ...doc.data() }));
const nextCursor = hasNextPage && resultDocs.length > 0
  ? resultDocs[resultDocs.length - 1].id
  : null;

return NextResponse.json({
  success: true,
  data,
  count: data.length,
  pagination: {
    limit,
    hasNextPage,
    nextCursor
  }
});
```

## API Routes to Update

### 1. Auctions API (`src/app/api/auctions/route.ts`)
**Current Issues**:
- Fetches ALL auctions, paginates in memory
- No filter support (status, category, price range)
- No sorting options

**Filters to Add**:
- `status` - auction status filter
- `categoryId` - category filter
- `shopId` - shop filter
- `minBid` - minimum current bid
- `maxBid` - maximum current bid
- `featured` - featured auctions only
- `search` - text search (name, description)

**Sort Options**:
- `created_at` (default)
- `end_time` (ending soon first)
- `current_bid` (highest/lowest)
- `bid_count` (most popular)

**Indexes Needed**:
```json
{
  "collectionGroup": "auctions",
  "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "current_bid", "order": "ASCENDING" },
    { "fieldPath": "created_at", "order": "DESCENDING" }
  ]
},
{
  "collectionGroup": "auctions",
  "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "end_time", "order": "ASCENDING" },
    { "fieldPath": "created_at", "order": "DESCENDING" }
  ]
},
{
  "collectionGroup": "auctions",
  "fields": [
    { "fieldPath": "category_id", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "created_at", "order": "DESCENDING" }
  ]
},
{
  "collectionGroup": "auctions",
  "fields": [
    { "fieldPath": "shop_id", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "created_at", "order": "DESCENDING" }
  ]
}
```

### 2. Users API (`src/app/api/users/route.ts`)
**Current Issues**:
- Likely fetches all users for pagination
- No filtering support

**Filters to Add**:
- `role` - user role filter (admin, seller, user)
- `isBanned` - banned status
- `isVerified` - verification status
- `search` - text search (name, email)

**Sort Options**:
- `created_at` (default)
- `last_login`
- `name`

**Indexes Needed**:
```json
{
  "collectionGroup": "users",
  "fields": [
    { "fieldPath": "role", "order": "ASCENDING" },
    { "fieldPath": "is_banned", "order": "ASCENDING" },
    { "fieldPath": "created_at", "order": "DESCENDING" }
  ]
},
{
  "collectionGroup": "users",
  "fields": [
    { "fieldPath": "role", "order": "ASCENDING" },
    { "fieldPath": "last_login", "order": "DESCENDING" }
  ]
}
```

### 3. Reviews API (`src/app/api/reviews/route.ts`)
**Current Issues**:
- Product/shop reviews likely paginated in memory

**Filters to Add**:
- `productId` - reviews for specific product
- `shopId` - reviews for specific shop
- `userId` - reviews by user
- `rating` - filter by rating (1-5)
- `minRating` / `maxRating` - rating range
- `verified` - verified purchase only
- `approved` - approved reviews only

**Sort Options**:
- `created_at` (default)
- `rating` (highest/lowest)
- `helpful_count` (most helpful)

**Indexes Needed**:
```json
{
  "collectionGroup": "reviews",
  "fields": [
    { "fieldPath": "product_id", "order": "ASCENDING" },
    { "fieldPath": "isApproved", "order": "ASCENDING" },
    { "fieldPath": "rating", "order": "DESCENDING" }
  ]
},
{
  "collectionGroup": "reviews",
  "fields": [
    { "fieldPath": "shop_id", "order": "ASCENDING" },
    { "fieldPath": "rating", "order": "DESCENDING" },
    { "fieldPath": "created_at", "order": "DESCENDING" }
  ]
},
{
  "collectionGroup": "reviews",
  "fields": [
    { "fieldPath": "user_id", "order": "ASCENDING" },
    { "fieldPath": "created_at", "order": "DESCENDING" }
  ]
}
```

### 4. Shops API (`src/app/api/shops/route.ts`)
**Current Issues**:
- All shops fetched for pagination

**Filters to Add**:
- `isVerified` - verified shops only
- `isFeatured` - featured shops
- `isBanned` - exclude banned
- `categoryId` - shops in category
- `search` - text search (name, description)

**Sort Options**:
- `created_at` (default)
- `name` (alphabetical)
- `rating` (highest rated)
- `product_count` (most products)

**Indexes Needed**:
```json
{
  "collectionGroup": "shops",
  "fields": [
    { "fieldPath": "is_verified", "order": "ASCENDING" },
    { "fieldPath": "is_featured", "order": "DESCENDING" },
    { "fieldPath": "created_at", "order": "DESCENDING" }
  ]
},
{
  "collectionGroup": "shops",
  "fields": [
    { "fieldPath": "is_verified", "order": "ASCENDING" },
    { "fieldPath": "rating", "order": "DESCENDING" }
  ]
},
{
  "collectionGroup": "shops",
  "fields": [
    { "fieldPath": "is_banned", "order": "ASCENDING" },
    { "fieldPath": "is_verified", "order": "ASCENDING" },
    { "fieldPath": "name", "order": "ASCENDING" }
  ]
}
```

### 5. Categories API (`src/app/api/categories/route.ts`)
**Current Issues**:
- Small dataset but should follow pattern for consistency

**Filters to Add**:
- `parentId` - child categories
- `level` - category level
- `featured` - featured categories
- `hasProducts` - only categories with products

**Sort Options**:
- `sort_order` (default)
- `name` (alphabetical)
- `product_count` (most products)

**Indexes Needed**:
```json
{
  "collectionGroup": "categories",
  "fields": [
    { "fieldPath": "parent_id", "order": "ASCENDING" },
    { "fieldPath": "sort_order", "order": "ASCENDING" }
  ]
},
{
  "collectionGroup": "categories",
  "fields": [
    { "fieldPath": "level", "order": "ASCENDING" },
    { "fieldPath": "sort_order", "order": "ASCENDING" }
  ]
},
{
  "collectionGroup": "categories",
  "fields": [
    { "fieldPath": "is_featured", "order": "DESCENDING" },
    { "fieldPath": "product_count", "order": "DESCENDING" }
  ]
}
```

### 6. Orders API (`src/app/api/orders/route.ts`)
**Current Issues**:
- User/shop orders likely paginated in memory

**Filters to Add**:
- `userId` - user's orders
- `shopId` - shop's orders
- `status` - order status filter
- `paymentStatus` - payment status
- `minAmount` / `maxAmount` - order amount range
- `dateFrom` / `dateTo` - date range

**Sort Options**:
- `created_at` (default)
- `updated_at` (recently updated)
- `total_amount` (highest/lowest)

**Indexes Needed**:
```json
{
  "collectionGroup": "orders",
  "fields": [
    { "fieldPath": "user_id", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "created_at", "order": "DESCENDING" }
  ]
},
{
  "collectionGroup": "orders",
  "fields": [
    { "fieldPath": "shop_id", "order": "ASCENDING" },
    { "fieldPath": "payment_status", "order": "ASCENDING" },
    { "fieldPath": "created_at", "order": "DESCENDING" }
  ]
},
{
  "collectionGroup": "orders",
  "fields": [
    { "fieldPath": "user_id", "order": "ASCENDING" },
    { "fieldPath": "total_amount", "order": "DESCENDING" }
  ]
}
```

### 7. Blog Posts API (`src/app/api/blog/route.ts`)
**Current Issues**:
- All posts fetched for pagination

**Filters to Add**:
- `status` - published, draft
- `category` - blog category
- `featured` - featured posts
- `authorId` - posts by author
- `tags` - filter by tags
- `search` - text search (title, excerpt)

**Sort Options**:
- `publishedAt` (default)
- `created_at`
- `view_count` (most viewed)
- `title` (alphabetical)

**Indexes Needed**:
```json
{
  "collectionGroup": "blog_posts",
  "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "publishedAt", "order": "DESCENDING" }
  ]
},
{
  "collectionGroup": "blog_posts",
  "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "category", "order": "ASCENDING" },
    { "fieldPath": "publishedAt", "order": "DESCENDING" }
  ]
},
{
  "collectionGroup": "blog_posts",
  "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "is_featured", "order": "DESCENDING" },
    { "fieldPath": "publishedAt", "order": "DESCENDING" }
  ]
}
```

### 8. Support Tickets API (`src/app/api/tickets/route.ts`)
**Current Issues**:
- Tickets likely paginated in memory

**Filters to Add**:
- `userId` - user's tickets
- `status` - ticket status
- `category` - ticket category
- `priority` - ticket priority
- `assignedTo` - assigned admin

**Sort Options**:
- `created_at` (default)
- `updated_at` (recently updated)
- `priority` (highest first)

**Indexes Needed**:
```json
{
  "collectionGroup": "support_tickets",
  "fields": [
    { "fieldPath": "user_id", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "created_at", "order": "DESCENDING" }
  ]
},
{
  "collectionGroup": "support_tickets",
  "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "priority", "order": "DESCENDING" }
  ]
},
{
  "collectionGroup": "support_tickets",
  "fields": [
    { "fieldPath": "assignedTo", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "updated_at", "order": "DESCENDING" }
  ]
}
```

## Implementation Priority

### Phase 1 (HIGH PRIORITY - User-Facing)
1. ✅ Products API - DONE
2. 🔄 Auctions API
3. 🔄 Shops API
4. 🔄 Reviews API
5. 🔄 Categories API

### Phase 2 (MEDIUM PRIORITY - Secondary Features)
6. 🔄 Blog Posts API
7. 🔄 Orders API
8. 🔄 Users API (admin only)

### Phase 3 (LOW PRIORITY - Admin/Support)
9. 🔄 Support Tickets API
10. 🔄 Favorites API
11. 🔄 Cart API (usually small, not critical)

## Testing Checklist

For each API route:
- [ ] Filters work correctly
- [ ] Sorting works correctly
- [ ] Cursor pagination works (prev/next)
- [ ] Empty results handled
- [ ] Invalid cursor handled gracefully
- [ ] Indexes are being used (check Firebase logs)
- [ ] Response time < 500ms
- [ ] No memory issues with large datasets

## Deployment Steps

1. **Add all indexes to `firestore.indexes.json`**
2. **Deploy indexes**: `firebase deploy --only firestore:indexes`
3. **Wait for indexes to build** (check Firebase Console)
4. **Update API routes** (one at a time, test each)
5. **Update frontend services** (add startAfter param)
6. **Update frontend pages** (cursor-based pagination UI)
7. **Test thoroughly**
8. **Monitor performance** (Firebase Console)

## Performance Targets

- API response time: < 500ms
- Memory usage: O(page size), not O(total count)
- Network transfer: Only requested page data
- Database queries: Single optimized query per request
- Pagination: Works correctly with all filter combinations

## Status Tracking

| API Route | Status | Filters | Sorting | Pagination | Indexes | Frontend |
|-----------|--------|---------|---------|------------|---------|----------|
| Products | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Auctions | 🔄 | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Shops | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Reviews | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Categories | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Blog | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Orders | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Users | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Tickets | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |

Legend:
- ✅ Complete
- 🔄 In Progress
- ⏳ Pending
- ❌ Blocked

## Notes

- Text search remains in-memory for all routes (recommend Algolia/Typesense in Phase 2)
- Total count not returned (performance tradeoff)
- Page numbers replaced with Prev/Next navigation
- All changes are backwards compatible with existing code
- Gradual rollout possible (update one route at a time)
