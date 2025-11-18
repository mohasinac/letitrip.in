# Pagination Quick Reference Guide

**Last Updated**: November 19, 2025  
**For**: Frontend & Backend Developers

## TL;DR

### Backend API

```typescript
import { executeCursorPaginatedQuery } from "@/app/api/lib/utils/pagination";

// One line pagination!
const result = await executeCursorPaginatedQuery(
  query,
  limit,
  cursor,
  maxLimit
);
return NextResponse.json(result);
```

### Service Layer

```typescript
async list(): Promise<PaginatedResponseFE<T>> {
  const response = await apiService.get<PaginatedResponseBE<T>>(endpoint);
  return {
    data: response.data.map(transform),
    count: response.count,
    pagination: response.pagination,
  };
}
```

### UI Component

```typescript
const response = await service.list();
setItems(response.data);
setCount(response.count);
setHasNext(response.pagination.hasNextPage);
```

---

## Response Structures

### Backend API Response

```typescript
{
  success: true,
  data: T[],           // Array of items
  count: number,       // Total count
  pagination: {
    // For cursor pagination:
    limit: number,
    hasNextPage: boolean,
    nextCursor: string | null,
    count: number

    // OR for offset pagination:
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

### Service Layer Response

```typescript
{
  data: T[],           // Transformed FE items
  count: number,       // Total count
  pagination: CursorPaginationMeta | OffsetPaginationMeta
}
```

---

## Common Patterns

### Pattern 1: Cursor-Based List (Most Common)

**When to use**: Real-time data, live feeds, infinite scroll

```typescript
// Component State
const [items, setItems] = useState<T[]>([]);
const [cursors, setCursors] = useState<(string | null)[]>([null]);
const [currentPage, setCurrentPage] = useState(1);
const [hasNextPage, setHasNextPage] = useState(false);

// Load Function
const loadItems = async () => {
  const cursor = cursors[currentPage - 1];
  const response = await service.list({
    startAfter: cursor || undefined,
    limit: 20,
  });

  setItems(response.data || []);

  // Access pagination metadata
  if ("hasNextPage" in response.pagination) {
    setHasNextPage(response.pagination.hasNextPage || false);

    if ("nextCursor" in response.pagination) {
      const cursorPagination = response.pagination as any;
      if (cursorPagination.nextCursor) {
        setCursors((prev) => {
          const newCursors = [...prev];
          newCursors[currentPage] = cursorPagination.nextCursor;
          return newCursors;
        });
      }
    }
  }
};

// Navigation
const handleNextPage = () => {
  if (hasNextPage) {
    setCurrentPage((prev) => prev + 1);
  }
};

const handlePrevPage = () => {
  if (currentPage > 1) {
    setCurrentPage((prev) => prev - 1);
  }
};
```

### Pattern 2: Offset-Based List (Admin Pages)

**When to use**: Admin dashboards, reports, need page numbers

```typescript
// Component State
const [items, setItems] = useState<T[]>([]);
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [totalItems, setTotalItems] = useState(0);
const limit = 20;

// Load Function
const loadItems = async () => {
  const response = await service.list({
    page: currentPage,
    limit,
  });

  setItems(response.data || []);
  setTotalItems(response.count || 0);

  // Calculate pages from count
  setTotalPages(Math.ceil((response.count || 0) / limit));
};

// Navigation
const handleNextPage = () => {
  if (currentPage < totalPages) {
    setCurrentPage((prev) => prev + 1);
  }
};

const handlePrevPage = () => {
  if (currentPage > 1) {
    setCurrentPage((prev) => prev - 1);
  }
};
```

---

## Migration Cheat Sheet

### Old → New

| Old Code                       | New Code                            |
| ------------------------------ | ----------------------------------- |
| `response.total`               | `response.count`                    |
| `response.hasMore`             | `response.pagination.hasNextPage`   |
| `response.nextCursor`          | `response.pagination.nextCursor`    |
| `response.totalPages`          | `Math.ceil(response.count / limit)` |
| `response.products`            | `response.data`                     |
| `response.posts`               | `response.data`                     |
| `data.map(...)` (from service) | `response.data.map(...)`            |

### Type Imports

```typescript
// Old
import { PaginatedResponse } from "@/types/api";

// New
import {
  PaginatedResponseFE,
  PaginatedResponseBE,
} from "@/types/shared/common.types";
import {
  CursorPaginationMeta,
  OffsetPaginationMeta,
} from "@/types/shared/pagination.types";
```

---

## Common Mistakes to Avoid

### ❌ DON'T: Access pagination properties directly

```typescript
const hasMore = response.hasMore; // Won't work!
const nextCursor = response.nextCursor; // Won't work!
```

### ✅ DO: Access through pagination object

```typescript
const hasMore = response.pagination.hasNextPage;
const nextCursor =
  "nextCursor" in response.pagination ? response.pagination.nextCursor : null;
```

### ❌ DON'T: Use old property names

```typescript
setTotal(response.total); // Won't work!
setItems(response.products); // Won't work!
```

### ✅ DO: Use new standardized names

```typescript
setTotal(response.count);
setItems(response.data);
```

### ❌ DON'T: Calculate totalPages from pagination

```typescript
setTotalPages(response.pagination.totalPages); // Cursor pagination doesn't have this!
```

### ✅ DO: Calculate from count and limit

```typescript
setTotalPages(Math.ceil((response.count || 0) / limit));
```

---

## Type Guard Helpers

```typescript
// Check if cursor pagination
function isCursorPagination(
  pagination: CursorPaginationMeta | OffsetPaginationMeta
): pagination is CursorPaginationMeta {
  return "hasNextPage" in pagination;
}

// Check if offset pagination
function isOffsetPagination(
  pagination: CursorPaginationMeta | OffsetPaginationMeta
): pagination is OffsetPaginationMeta {
  return "totalPages" in pagination;
}

// Usage
if (isCursorPagination(response.pagination)) {
  setHasNext(response.pagination.hasNextPage);
  setCursor(response.pagination.nextCursor);
} else {
  setTotalPages(response.pagination.totalPages);
  setCurrentPage(response.pagination.page);
}
```

---

## API Route Examples

### Cursor Pagination (Recommended)

```typescript
import {
  executeCursorPaginatedQuery,
  parsePaginationParams,
} from "@/app/api/lib/utils/pagination";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { limit, cursor } = parsePaginationParams(searchParams);

  let query = db.collection("items").orderBy("created_at", "desc");

  // Apply filters
  const status = searchParams.get("status");
  if (status) {
    query = query.where("status", "==", status);
  }

  // Execute with pagination
  const result = await executeCursorPaginatedQuery(query, limit, cursor, 200);
  return NextResponse.json(result);
}
```

### Offset Pagination (Special Cases)

```typescript
import {
  executeOffsetPaginatedQuery,
  parsePaginationParams,
} from "@/app/api/lib/utils/pagination";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { limit, page } = parsePaginationParams(searchParams, {
    usePage: true,
  });

  let query = db.collection("payments").orderBy("created_at", "desc");

  // Execute with offset pagination
  const result = await executeOffsetPaginatedQuery(query, page, limit, 100);
  return NextResponse.json(result);
}
```

---

## Service Examples

### Basic List Service

```typescript
async list(filters?: MyFilters): Promise<PaginatedResponseFE<MyTypeFE>> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
  }

  const endpoint = `/api/myroute?${params.toString()}`;
  const response = await apiService.get<PaginatedResponseBE<MyTypeBE>>(endpoint);

  return {
    data: response.data.map(toFEType),
    count: response.count,
    pagination: response.pagination,
  };
}
```

### Service with Custom Transformation

```typescript
async list(filters?: MyFilters): Promise<PaginatedResponseFE<MyTypeFE>> {
  const endpoint = buildUrl("/api/myroute", filters);
  const response = await apiService.get<PaginatedResponseBE<MyTypeBE>>(endpoint);

  // Complex transformation
  const transformedData = response.data.map(item => ({
    ...toFEType(item),
    customField: computeCustomField(item),
    nested: {
      data: transformNestedData(item.nested)
    }
  }));

  return {
    data: transformedData,
    count: response.count,
    pagination: response.pagination,
  };
}
```

---

## Testing Examples

### Test API Route

```typescript
import { executeCursorPaginatedQuery } from "@/app/api/lib/utils/pagination";

describe("GET /api/items", () => {
  it("should return paginated response", async () => {
    const response = await fetch("/api/items?limit=10");
    const data = await response.json();

    expect(data).toHaveProperty("success", true);
    expect(data).toHaveProperty("data");
    expect(data).toHaveProperty("count");
    expect(data).toHaveProperty("pagination");
    expect(data.pagination).toHaveProperty("hasNextPage");
    expect(data.pagination).toHaveProperty("nextCursor");
  });
});
```

### Test Service

```typescript
import { myService } from "@/services/my.service";

describe("myService.list", () => {
  it("should return transformed data", async () => {
    const response = await myService.list({ limit: 5 });

    expect(response).toHaveProperty("data");
    expect(response).toHaveProperty("count");
    expect(response).toHaveProperty("pagination");
    expect(Array.isArray(response.data)).toBe(true);
  });
});
```

---

## Performance Tips

### ✅ DO: Use appropriate limits

```typescript
// For lists with thumbnails
const response = await service.list({ limit: 50 });

// For detailed views
const response = await service.list({ limit: 20 });

// For admin reports
const response = await service.list({ limit: 100 });
```

### ✅ DO: Cache cursors for navigation

```typescript
const [cursors, setCursors] = useState<(string | null)[]>([null]);
// Allows back/forward navigation without re-fetching
```

### ✅ DO: Debounce search/filter changes

```typescript
import { useDebouncedValue } from "@/hooks/useDebounce";

const debouncedSearch = useDebouncedValue(searchQuery, 500);
useEffect(() => {
  loadItems();
}, [debouncedSearch]);
```

### ❌ DON'T: Fetch all data at once

```typescript
// Bad - will timeout for large collections
const response = await service.list({ limit: 10000 });
```

### ❌ DON'T: Use offset pagination for large datasets

```typescript
// Bad - slow for page 1000
const response = await service.list({ page: 1000, limit: 100 });

// Good - use cursor pagination instead
const response = await service.list({ startAfter: lastCursor, limit: 100 });
```

---

## Troubleshooting

### Issue: "Property 'hasNextPage' does not exist"

**Solution**: Access through `response.pagination.hasNextPage`

### Issue: "Property 'total' does not exist"

**Solution**: Use `response.count` instead

### Issue: "Property 'products' does not exist"

**Solution**: Use `response.data` instead

### Issue: "Cannot read property 'map' of undefined"

**Solution**: Ensure you're accessing `response.data.map()` not `response.map()`

### Issue: "Type 'string | null' is not assignable to 'string | undefined'"

**Solution**: Use `cursor || undefined` instead of just `cursor`

---

## Resources

- **Full Documentation**: `docs/fixes/API-PAGINATION-REFACTOR-COMPLETE-NOV-19-2025.md`
- **Type Definitions**: `src/types/shared/common.types.ts` & `pagination.types.ts`
- **Pagination Utility**: `src/app/api/lib/utils/pagination.ts`
- **Example Implementation**: Check any service in `src/services/`

---

## Getting Help

If you encounter issues:

1. Check this guide first
2. Review the full documentation
3. Look at existing implementations (services/pages)
4. Check TypeScript errors - they're usually helpful!
5. Ask in team chat with specific error messages

**Remember**: The new pagination system is consistent across the entire app. Once you understand one implementation, you understand them all! 🎉
