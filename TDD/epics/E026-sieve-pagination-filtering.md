# Epic E026: Sieve-Style Pagination & Filtering

## Overview

Implement a Sieve-inspired pagination and filtering system for all API endpoints, providing page-based navigation (instead of cursor-based), powerful filtering operators, and sorting capabilities. This is a backend-only implementation that the frontend will consume through standardized query parameters.

**Inspired By**: [Biarity/Sieve](https://github.com/Biarity/Sieve) for ASP.NET Core

## Scope

- Replace cursor-based pagination with page-based pagination
- Implement Sieve-style filter operators for all resources
- Add multi-field sorting support
- Create reusable pagination components for frontend
- Standardize query parameter format across all APIs
- Backend handles all filtering/sorting/pagination logic

## Query Parameter Format

### Pagination

```
?page=1              // Page number (1-indexed)
&pageSize=20         // Items per page (default: 20, max: 100)
```

### Sorting

```
?sorts=createdAt     // Sort ascending by createdAt
?sorts=-createdAt    // Sort descending (prefix with -)
?sorts=price,-createdAt  // Multi-sort: price asc, then createdAt desc
```

### Filtering

```
?filters=price>100              // Greater than
?filters=price>=100             // Greater than or equal
?filters=price<500              // Less than
?filters=price<=500             // Less than or equal
?filters=status==published      // Equals
?filters=status!=draft          // Not equals
?filters=title@=awesome         // Contains (case-insensitive)
?filters=title_=New             // Starts with
?filters=title_-=Sale           // Ends with
?filters=category@=*electronics // Case-insensitive contains
```

### Combined Filters (AND/OR)

```
?filters=price>100,price<500    // AND: both conditions
?filters=(status|type)==active  // OR: status OR type equals active
?filters=price>100|price<50     // OR: price > 100 OR price < 50
```

## Filter Operators

| Operator | Description                    | Example              |
| -------- | ------------------------------ | -------------------- |
| `==`     | Equals                         | `status==published`  |
| `!=`     | Not equals                     | `status!=draft`      |
| `>`      | Greater than                   | `price>100`          |
| `<`      | Less than                      | `price<500`          |
| `>=`     | Greater than or equal          | `price>=100`         |
| `<=`     | Less than or equal             | `price<=500`         |
| `@=`     | Contains                       | `title@=awesome`     |
| `_=`     | Starts with                    | `title_=New`         |
| `_-=`    | Ends with                      | `title_-=Sale`       |
| `!@=`    | Does not contain               | `title!@=test`       |
| `!_=`    | Does not start with            | `title!_=Draft`      |
| `!_-=`   | Does not end with              | `title!_-=Old`       |
| `@=*`    | Contains (case-insensitive)    | `title@=*AWESOME`    |
| `_=*`    | Starts with (case-insensitive) | `title_=*new`        |
| `==*`    | Equals (case-insensitive)      | `status==*PUBLISHED` |
| `==null` | Is null/undefined              | `deletedAt==null`    |
| `!=null` | Is not null/undefined          | `shopId!=null`       |

## Features

### F026.1: Sieve Query Parser

**Priority**: P0 (Critical)

Create a reusable query parser that converts Sieve-style query parameters into Firestore/database queries.

```typescript
// lib/sieve/parser.ts
interface SieveQuery {
  page: number;
  pageSize: number;
  sorts: SortField[];
  filters: FilterCondition[];
}

interface SortField {
  field: string;
  direction: "asc" | "desc";
}

interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: string | number | boolean | null;
  isOr?: boolean;
}

function parseSieveQuery(searchParams: URLSearchParams): SieveQuery;
function applyToFirestore(query: Query, sieve: SieveQuery): Query;
```

#### User Stories

**US026.1.1**: Parse Pagination Parameters

```
As an API consumer
I want to specify page and pageSize
So that I get paginated results with page numbers

Acceptance Criteria:
- page defaults to 1 if not specified
- pageSize defaults to 20 if not specified
- pageSize max is 100 (configurable)
- Invalid page returns error
- Response includes totalPages and totalCount
```

**US026.1.2**: Parse Sort Parameters

```
As an API consumer
I want to sort by multiple fields
So that I get ordered results

Acceptance Criteria:
- sorts parameter accepts comma-separated fields
- Prefix "-" indicates descending order
- Invalid field names return error (or are ignored with warning)
- Default sort is createdAt descending
```

**US026.1.3**: Parse Filter Parameters

```
As an API consumer
I want to filter with various operators
So that I get precise results

Acceptance Criteria:
- All operators in the table above work
- Multiple filters with comma are AND logic
- Pipe (|) in values means OR logic
- Parentheses group fields for OR logic
- Escape characters work (\, for literal comma)
```

---

### F026.2: API Response Format

**Priority**: P0 (Critical)

Standardize API response format for paginated endpoints.

```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  meta?: {
    appliedFilters: FilterCondition[];
    appliedSorts: SortField[];
  };
}
```

#### User Stories

**US026.2.1**: Consistent Response Structure

```
As a frontend developer
I want consistent pagination metadata
So that I can build reusable pagination components

Acceptance Criteria:
- All list endpoints return PaginatedResponse
- totalCount is accurate after filtering
- totalPages calculated correctly
- hasNextPage/hasPreviousPage are boolean flags
- meta shows what filters/sorts were applied
```

---

### F026.3: Resource Sieve Configuration

**Priority**: P1 (High)

Define which fields can be sorted/filtered for each resource.

```typescript
// lib/sieve/config.ts
interface SieveConfig {
  resource: string;
  sortableFields: string[];
  filterableFields: {
    field: string;
    operators: FilterOperator[];
    type: "string" | "number" | "boolean" | "date";
  }[];
  defaultSort: SortField;
  maxPageSize: number;
}

const productSieveConfig: SieveConfig = {
  resource: "products",
  sortableFields: ["createdAt", "price", "name", "stock", "rating"],
  filterableFields: [
    { field: "status", operators: ["==", "!="], type: "string" },
    { field: "price", operators: [">", "<", ">=", "<=", "=="], type: "number" },
    { field: "categoryId", operators: ["==", "!="], type: "string" },
    { field: "shopId", operators: ["=="], type: "string" },
    { field: "name", operators: ["@=", "_=", "@=*"], type: "string" },
    { field: "createdAt", operators: [">", "<", ">=", "<="], type: "date" },
  ],
  defaultSort: { field: "createdAt", direction: "desc" },
  maxPageSize: 50,
};
```

---

### F026.4: Frontend Pagination Components

**Priority**: P1 (High)

Create reusable pagination components that work with Sieve responses.

#### Components to Create

| Component            | Description                        | Status  |
| -------------------- | ---------------------------------- | ------- |
| `Pagination`         | Page number navigation with arrows | 🔲 Todo |
| `PageSizeSelector`   | Dropdown to select items per page  | 🔲 Todo |
| `PaginationInfo`     | "Showing 1-20 of 500 items" text   | 🔲 Todo |
| `PaginationControls` | Combined pagination + page size    | 🔲 Todo |
| `useSievePagination` | Hook for managing pagination state | 🔲 Todo |
| `useSieveFilters`    | Hook for managing filter state     | 🔲 Todo |
| `useSieveSorts`      | Hook for managing sort state       | 🔲 Todo |
| `useSieveQuery`      | Combined hook for full Sieve state | 🔲 Todo |

#### User Stories

**US026.4.1**: Pagination Component

```
As a user viewing a list
I want page number navigation
So that I can jump to specific pages

Acceptance Criteria:
- Shows current page and total pages
- Previous/Next arrows
- First/Last page buttons
- Page number buttons (with ellipsis for large ranges)
- Touch-friendly on mobile (48px targets)
- Disabled states for first/last page
```

**US026.4.2**: Page Size Selector

```
As a user viewing a list
I want to choose how many items per page
So that I can see more or fewer items

Acceptance Criteria:
- Dropdown with options: 10, 20, 50, 100
- Current selection shown
- Changing resets to page 1
- Persists preference in localStorage
```

**US026.4.3**: useSieveQuery Hook

```
As a developer
I want a hook to manage Sieve query state
So that I can easily build filtered lists

Acceptance Criteria:
- Syncs state with URL search params
- Provides setPage, setPageSize, setSort, addFilter, removeFilter
- Returns current pagination metadata
- Works with React Query for data fetching
```

---

### F026.5: API Endpoint Updates

**Priority**: P0 (Critical)

Update all list endpoints to support Sieve parameters.

#### Endpoints to Update

| Endpoint               | Sortable Fields                | Filterable Fields                       |
| ---------------------- | ------------------------------ | --------------------------------------- |
| `GET /api/products`    | createdAt, price, name, stock  | status, price, categoryId, shopId, name |
| `GET /api/auctions`    | createdAt, currentBid, endTime | status, currentBid, categoryId, shopId  |
| `GET /api/orders`      | createdAt, total, status       | status, paymentStatus, shopId, userId   |
| `GET /api/users`       | createdAt, name, email         | role, status, email, name               |
| `GET /api/shops`       | createdAt, name, rating        | status, verified, name                  |
| `GET /api/reviews`     | createdAt, rating              | rating, status, productId, userId       |
| `GET /api/categories`  | createdAt, name, order         | status, parentId, name                  |
| `GET /api/coupons`     | createdAt, discount, expiresAt | status, type, shopId, code              |
| `GET /api/returns`     | createdAt, status              | status, orderId, shopId                 |
| `GET /api/tickets`     | createdAt, priority, status    | status, priority, category, assignedTo  |
| `GET /api/blog`        | createdAt, publishedAt, title  | status, category, author                |
| `GET /api/hero-slides` | createdAt, order               | status, position                        |
| `GET /api/payouts`     | createdAt, amount, status      | status, shopId, method                  |
| `GET /api/favorites`   | createdAt                      | type, userId                            |

---

## Implementation Checklist

### Phase 1: Core Infrastructure (Week 1)

- [ ] Create `lib/sieve/types.ts` - TypeScript types
- [ ] Create `lib/sieve/parser.ts` - Query parser
- [ ] Create `lib/sieve/operators.ts` - Operator implementations
- [ ] Create `lib/sieve/firestore.ts` - Firestore query builder
- [ ] Create `lib/sieve/config.ts` - Resource configurations
- [ ] Create `lib/sieve/index.ts` - Public exports
- [ ] Write unit tests for parser
- [ ] Write unit tests for operators

### Phase 2: API Integration (Week 2)

- [ ] Update products API to use Sieve
- [ ] Update auctions API to use Sieve
- [ ] Update orders API to use Sieve
- [ ] Update users API to use Sieve
- [ ] Update shops API to use Sieve
- [ ] Update all remaining list APIs
- [ ] Add pagination metadata to responses
- [ ] Write API integration tests

### Phase 3: Frontend Components (Week 3)

- [ ] Create Pagination component
- [ ] Create PageSizeSelector component
- [ ] Create PaginationInfo component
- [ ] Create PaginationControls component
- [ ] Create useSievePagination hook
- [ ] Create useSieveFilters hook
- [ ] Create useSieveSorts hook
- [ ] Create useSieveQuery hook
- [ ] Write component tests

### Phase 4: Page Integration (Week 4)

- [ ] Integrate pagination in products page
- [ ] Integrate pagination in auctions page
- [ ] Integrate pagination in admin tables
- [ ] Integrate pagination in seller tables
- [ ] Integrate pagination in user tables
- [ ] Update mobile pagination components
- [ ] Performance testing

---

## Technical Guidelines

### Parser Implementation

```typescript
// lib/sieve/parser.ts
export function parseSieveQuery(searchParams: URLSearchParams): SieveQuery {
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = Math.min(
    parseInt(searchParams.get("pageSize") || "20", 10),
    100
  );

  const sorts = parseSorts(searchParams.get("sorts") || "-createdAt");
  const filters = parseFilters(searchParams.get("filters") || "");

  return { page, pageSize, sorts, filters };
}

function parseSorts(sortsParam: string): SortField[] {
  return sortsParam.split(",").map((field) => {
    const desc = field.startsWith("-");
    return {
      field: desc ? field.slice(1) : field,
      direction: desc ? "desc" : "asc",
    };
  });
}

function parseFilters(filtersParam: string): FilterCondition[] {
  // Parse filter syntax: field{operator}value
  const operators = [
    "==",
    "!=",
    ">=",
    "<=",
    ">",
    "<",
    "@=*",
    "@=",
    "_=*",
    "_=",
    "_-=",
    "!@=",
    "!_=",
  ];
  // Implementation...
}
```

### Firestore Integration

```typescript
// lib/sieve/firestore.ts
export function applyToFirestore(
  baseQuery: Query,
  sieve: SieveQuery,
  config: SieveConfig
): { query: Query; needsClientFilter: FilterCondition[] } {
  let query = baseQuery;
  const needsClientFilter: FilterCondition[] = [];

  // Apply filters (Firestore has limitations)
  for (const filter of sieve.filters) {
    if (canApplyToFirestore(filter, config)) {
      query = applyFirestoreFilter(query, filter);
    } else {
      needsClientFilter.push(filter);
    }
  }

  // Apply sorts
  for (const sort of sieve.sorts) {
    query = query.orderBy(sort.field, sort.direction);
  }

  // Apply pagination
  query = query.limit(sieve.pageSize);
  if (sieve.page > 1) {
    // For Firestore, we need to use startAfter with last doc
    // This requires fetching count or using offset
  }

  return { query, needsClientFilter };
}
```

---

## Acceptance Criteria

- [ ] All list APIs support page, pageSize, sorts, filters
- [ ] Response includes complete pagination metadata
- [ ] All filter operators work correctly
- [ ] Invalid parameters return helpful error messages
- [ ] Frontend pagination components are reusable
- [ ] URL state syncs with pagination/filter state
- [ ] Performance is acceptable (< 500ms for filtered queries)
- [ ] Mobile pagination is touch-friendly

---

## Dependencies

- E019: Common Code Architecture
- E002: Product Catalog
- E003: Auction System

## Related Epics

- E025: Mobile Component Integration (mobile pagination)
- E015: Search & Discovery

---

## Test Documentation

**Test Cases**: `TDD/resources/sieve/TEST-CASES.md`
**API Specs**: `TDD/resources/sieve/API-SPECS.md`
