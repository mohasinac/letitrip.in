# API Pagination Guide

## Overview

All API routes in the application now use a standardized pagination system with two approaches:

- **Cursor-based pagination** (recommended for most use cases)
- **Offset-based pagination** (for specific scenarios requiring page numbers)

## Cursor-Based Pagination (Recommended)

Cursor-based pagination is more efficient for large datasets and provides better performance.

### Request Parameters

| Parameter                | Type   | Default | Max       | Description                |
| ------------------------ | ------ | ------- | --------- | -------------------------- |
| `limit`                  | number | 20-50\* | 100-200\* | Number of items per page   |
| `startAfter` or `cursor` | string | -       | -         | Document ID to start after |

\*Default and max values vary by endpoint

### Response Format

```json
{
  "success": true,
  "data": [...],
  "count": 20,
  "pagination": {
    "limit": 20,
    "hasNextPage": true,
    "nextCursor": "doc123xyz",
    "count": 20
  }
}
```

### Example Usage

```javascript
// First page
const response = await fetch("/api/products?limit=20");

// Next page
const nextPage = await fetch(
  `/api/products?limit=20&startAfter=${response.pagination.nextCursor}`
);

// Alternative: use 'cursor' parameter
const nextPage = await fetch(
  `/api/products?limit=20&cursor=${response.pagination.nextCursor}`
);
```

### Frontend Implementation Example

```typescript
function usePaginatedData(endpoint: string, limit: number = 20) {
  const [data, setData] = useState([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const url = cursor
      ? `${endpoint}?limit=${limit}&cursor=${cursor}`
      : `${endpoint}?limit=${limit}`;

    const response = await fetch(url);
    const result = await response.json();

    setData((prev) => [...prev, ...result.data]);
    setCursor(result.pagination.nextCursor);
    setHasMore(result.pagination.hasNextPage);
    setLoading(false);
  };

  return { data, loadMore, hasMore, loading };
}
```

## Offset-Based Pagination

Offset-based pagination uses page numbers. Less efficient for large datasets but familiar to users.

### Request Parameters

| Parameter | Type   | Default | Max | Description             |
| --------- | ------ | ------- | --- | ----------------------- |
| `page`    | number | 1       | -   | Page number (1-indexed) |
| `limit`   | number | 20      | 100 | Items per page          |

### Response Format

```json
{
  "success": true,
  "data": [...],
  "count": 20,
  "pagination": {
    "page": 1,
    "limit": 20,
    "hasNextPage": true,
    "hasPrevPage": false,
    "totalPages": 10
  }
}
```

### Example Usage

```javascript
// Page 1
const response = await fetch("/api/payments?page=1&limit=20");

// Page 2
const nextPage = await fetch("/api/payments?page=2&limit=20");
```

## API Endpoints Using Pagination

### Cursor-Based Endpoints

| Endpoint         | Default Limit | Max Limit | Description             |
| ---------------- | ------------- | --------- | ----------------------- |
| `/api/users`     | 50            | 200       | List users (admin only) |
| `/api/products`  | 50            | 200       | List products           |
| `/api/orders`    | 50            | 200       | List orders             |
| `/api/auctions`  | 50            | 200       | List auctions           |
| `/api/tickets`   | 20            | 100       | List support tickets    |
| `/api/reviews`   | 20            | 100       | List reviews            |
| `/api/returns`   | 20            | 100       | List returns            |
| `/api/favorites` | 50            | 200       | List favorites          |

### Offset-Based Endpoints

| Endpoint        | Default Limit | Max Limit | Description   |
| --------------- | ------------- | --------- | ------------- |
| `/api/payments` | 20            | 100       | List payments |
| `/api/payouts`  | 20            | 100       | List payouts  |

## Implementation for Developers

### Using Cursor Pagination in Your API Route

```typescript
import { executeCursorPaginatedQuery } from "@/app/api/lib/utils/pagination";
import { Collections } from "@/app/api/lib/firebase/collections";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Build your query with filters and sorting
  let query = Collections.products()
    .where("status", "==", "published")
    .orderBy("created_at", "desc");

  // Execute paginated query
  const response = await executeCursorPaginatedQuery(
    query,
    searchParams,
    (id) => Collections.products().doc(id).get(),
    (doc) => ({
      id: doc.id,
      ...doc.data(),
    }),
    50, // defaultLimit
    200 // maxLimit
  );

  return NextResponse.json(response);
}
```

### Using Offset Pagination in Your API Route

```typescript
import { executeOffsetPaginatedQuery } from "@/app/api/lib/utils/pagination";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  let query = Collections.payments().orderBy("created_at", "desc");

  const response = await executeOffsetPaginatedQuery(
    query,
    searchParams,
    (doc) => ({ id: doc.id, ...doc.data() }),
    20, // defaultLimit
    100 // maxLimit
  );

  return NextResponse.json(response);
}
```

### Manual Pagination Control

If you need more control, use the lower-level functions:

```typescript
import {
  parsePaginationParams,
  applyCursorPagination,
  createCursorPaginatedResponse,
} from "@/app/api/lib/utils/pagination";

const config = parsePaginationParams(searchParams, 20, 100);
const { docs, hasNextPage, nextCursor } = await applyCursorPagination(
  query,
  config,
  (id) => Collections.products().doc(id).get()
);

const data = docs.map((doc) => transformDoc(doc));
const response = createCursorPaginatedResponse(
  data,
  config.limit || 20,
  hasNextPage,
  nextCursor
);
```

## Best Practices

### 1. Choose the Right Pagination Type

- **Use cursor-based** for:

  - Infinite scroll UIs
  - Large datasets
  - Real-time data feeds
  - Performance-critical endpoints

- **Use offset-based** for:
  - Traditional pagination with page numbers
  - Small datasets
  - Admin dashboards requiring specific page access

### 2. Set Appropriate Limits

```typescript
// Public endpoints (users browse)
defaultLimit: 20 - 50;
maxLimit: 100 - 200;

// Admin endpoints (bulk operations)
defaultLimit: 50 - 100;
maxLimit: 200 - 500;

// Resource-intensive endpoints
defaultLimit: 10 - 20;
maxLimit: 50 - 100;
```

### 3. Always Add Sorting

Pagination requires consistent ordering:

```typescript
// ✅ Good - Explicit ordering
query.orderBy("created_at", "desc");

// ❌ Bad - No ordering (unpredictable results)
query.limit(20);
```

### 4. Validate Cursor Values

The utility automatically validates cursors:

```typescript
// Invalid cursors are safely ignored
// Query continues without cursor
```

### 5. Handle Empty Results

```typescript
if (response.data.length === 0 && !response.pagination.hasNextPage) {
  // End of data
}
```

## Migration from Old Pagination

### Before

```typescript
const limit = parseInt(searchParams.get("limit") || "50");
const startAfter = searchParams.get("startAfter");

if (startAfter) {
  const startDoc = await Collections.products().doc(startAfter).get();
  if (startDoc.exists) {
    query = query.startAfter(startDoc);
  }
}

query = query.limit(limit + 1);
const snapshot = await query.get();
const hasNextPage = snapshot.docs.length > limit;
// ... manual pagination logic
```

### After

```typescript
const response = await executeCursorPaginatedQuery(
  query,
  searchParams,
  (id) => Collections.products().doc(id).get(),
  (doc) => ({ id: doc.id, ...doc.data() }),
  50,
  200
);

return NextResponse.json(response);
```

## Performance Considerations

### Cursor-Based Pagination

**Pros:**

- O(1) complexity for navigation
- Efficient for large datasets
- No skipped/duplicate items on updates
- Scales well

**Cons:**

- Can't jump to specific page
- Cursor becomes invalid if document deleted

### Offset-Based Pagination

**Pros:**

- Can jump to any page
- Familiar UX pattern
- Page numbers visible

**Cons:**

- O(n) complexity (scans offset documents)
- Slower for deep pages
- Can show duplicates/skip items on updates
- Doesn't scale well

## Testing Pagination

```typescript
// Test first page
const page1 = await fetch("/api/products?limit=5");
expect(page1.data.length).toBeLessThanOrEqual(5);

// Test pagination continuity
const page2 = await fetch(
  `/api/products?limit=5&cursor=${page1.pagination.nextCursor}`
);
expect(page2.data[0].id).not.toBe(page1.data[page1.data.length - 1].id);

// Test limit enforcement
const overLimit = await fetch("/api/products?limit=99999");
expect(overLimit.data.length).toBeLessThanOrEqual(200); // maxLimit
```

## Common Issues

### Issue: nextCursor is null but hasNextPage is true

**Cause:** Empty result set or query error

**Solution:** Check query filters and data availability

### Issue: Inconsistent results between pages

**Cause:** Missing or unstable sort order

**Solution:** Always use explicit `orderBy` with consistent field

### Issue: Performance degradation

**Cause:** Using offset pagination on large collections

**Solution:** Switch to cursor-based pagination

## Related Documentation

- [API Route Consolidation](../fixes/API-ROUTE-CONSOLIDATION.md)
- [Firebase Queries Guide](./FIREBASE-QUERIES.md)
- [RBAC Auth Middleware](./RBAC-AUTH-GUIDE.md)
