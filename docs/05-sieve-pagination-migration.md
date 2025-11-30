# Sieve Pagination Migration

> **Status**: 🔴 In Progress
> **Priority**: High
> **Last Updated**: November 30, 2025

## Current State

The codebase has **two pagination systems**:

| System                   | Location                              | Status               |
| ------------------------ | ------------------------------------- | -------------------- |
| Sieve (modern, standard) | `src/app/api/lib/sieve/`              | ✅ Fully implemented |
| Cursor/Offset (legacy)   | `src/app/api/lib/utils/pagination.ts` | ⚠️ Being phased out  |

## Sieve Query Format

```
GET /api/products?page=1&pageSize=20&sorts=-createdAt,price&filters=status==published,price>100
```

**Supported Operators:**

| Operator | Description                 | Example             |
| -------- | --------------------------- | ------------------- |
| `==`     | Equals                      | `status==published` |
| `!=`     | Not equals                  | `status!=draft`     |
| `>`      | Greater than                | `price>100`         |
| `>=`     | Greater than or equal       | `price>=100`        |
| `<`      | Less than                   | `stock<10`          |
| `<=`     | Less than or equal          | `stock<=0`          |
| `@=`     | Contains (case-sensitive)   | `name@=blade`       |
| `_=`     | Starts with                 | `name_=Storm`       |
| `@=*`    | Contains (case-insensitive) | `name@=*BLADE`      |
| `==null` | Is null/undefined           | `deletedAt==null`   |
| `!=null` | Is not null                 | `paidAt!=null`      |

## API Routes to Migrate

### Priority 1 - High Traffic Routes

| Route             | Current Pagination            | Config                  | Status |
| ----------------- | ----------------------------- | ----------------------- | ------ |
| `/api/products`   | `executeCursorPaginatedQuery` | `productsSieveConfig`   | ⬜     |
| `/api/auctions`   | `executeCursorPaginatedQuery` | `auctionsSieveConfig`   | ⬜     |
| `/api/shops`      | `executeCursorPaginatedQuery` | `shopsSieveConfig`      | ⬜     |
| `/api/categories` | Manual offset                 | `categoriesSieveConfig` | ⬜     |
| `/api/reviews`    | Manual limit                  | `reviewsSieveConfig`    | ⬜     |

### Priority 2 - Admin Routes

| Route                    | Current Pagination            | Config                  | Status |
| ------------------------ | ----------------------------- | ----------------------- | ------ |
| `/api/admin/products`    | `executeCursorPaginatedQuery` | `productsSieveConfig`   | ⬜     |
| `/api/admin/auctions`    | Manual                        | `auctionsSieveConfig`   | ⬜     |
| `/api/admin/orders`      | `executeCursorPaginatedQuery` | `ordersSieveConfig`     | ⬜     |
| `/api/admin/users`       | `executeCursorPaginatedQuery` | `usersSieveConfig`      | ⬜     |
| `/api/admin/shops`       | Manual limit                  | `shopsSieveConfig`      | ⬜     |
| `/api/admin/tickets`     | Manual                        | `ticketsSieveConfig`    | ⬜     |
| `/api/admin/payouts`     | Manual                        | `payoutsSieveConfig`    | ⬜     |
| `/api/admin/coupons`     | Manual                        | `couponsSieveConfig`    | ⬜     |
| `/api/admin/returns`     | Manual                        | `returnsSieveConfig`    | ⬜     |
| `/api/admin/hero-slides` | Manual                        | `heroSlidesSieveConfig` | ⬜     |
| `/api/blog/posts`        | Manual                        | `blogSieveConfig`       | ⬜     |

### Priority 3 - User/Seller Routes

| Route                  | Current Pagination            | Config                 | Status |
| ---------------------- | ----------------------------- | ---------------------- | ------ |
| `/api/user/orders`     | Manual limit                  | `ordersSieveConfig`    | ⬜     |
| `/api/user/favorites`  | Manual                        | `favoritesSieveConfig` | ⬜     |
| `/api/seller/products` | `executeCursorPaginatedQuery` | `productsSieveConfig`  | ⬜     |
| `/api/seller/auctions` | `executeCursorPaginatedQuery` | `auctionsSieveConfig`  | ⬜     |
| `/api/seller/orders`   | Manual                        | `ordersSieveConfig`    | ⬜     |

## Migration Pattern

### Before (Legacy Cursor Pagination)

```typescript
import { executeCursorPaginatedQuery } from "@/app/api/lib/utils/pagination";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") || "20");
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  let query = db
    .collection("products")
    .where("status", "==", "published")
    .orderBy(sortBy, sortOrder);

  const result = await executeCursorPaginatedQuery(
    query,
    searchParams,
    getProductByIdForCursor,
    transformProduct,
    limit,
    100
  );

  return NextResponse.json(result);
}
```

### After (Sieve Pagination)

```typescript
import {
  parseSieveQuery,
  executeSieveQuery,
  productsSieveConfig,
} from "@/app/api/lib/sieve";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sieveQuery = parseSieveQuery(searchParams, productsSieveConfig);

  // Add mandatory filters
  sieveQuery.filters.push({
    field: "status",
    operator: "==",
    value: "published",
  });

  const result = await executeSieveQuery(
    "products",
    sieveQuery,
    productsSieveConfig
  );

  return NextResponse.json({
    success: true,
    data: result.data.map(transformProduct),
    pagination: result.pagination,
    meta: result.meta,
  });
}
```

## Sieve Config Reference

All configs are in `src/app/api/lib/sieve/config.ts`:

| Config                  | Sortable Fields                                               | Default Sort |
| ----------------------- | ------------------------------------------------------------- | ------------ |
| `productsSieveConfig`   | createdAt, updatedAt, price, name, stock, rating, reviewCount | -createdAt   |
| `auctionsSieveConfig`   | createdAt, endTime, currentBid, startingPrice, bidCount       | -createdAt   |
| `ordersSieveConfig`     | createdAt, updatedAt, totalAmount, status                     | -createdAt   |
| `usersSieveConfig`      | createdAt, updatedAt, displayName, email                      | -createdAt   |
| `shopsSieveConfig`      | createdAt, updatedAt, name, rating, reviewCount, productCount | -createdAt   |
| `reviewsSieveConfig`    | createdAt, rating                                             | -createdAt   |
| `categoriesSieveConfig` | createdAt, updatedAt, name, sortOrder                         | sortOrder    |
| `couponsSieveConfig`    | createdAt, expiresAt, discountPercent, usageCount             | -createdAt   |
| `returnsSieveConfig`    | createdAt, updatedAt, status                                  | -createdAt   |
| `ticketsSieveConfig`    | createdAt, updatedAt, status, priority                        | -createdAt   |
| `blogSieveConfig`       | createdAt, updatedAt, publishedAt, title                      | -publishedAt |
| `heroSlidesSieveConfig` | createdAt, sortOrder                                          | sortOrder    |
| `payoutsSieveConfig`    | createdAt, amount, status                                     | -createdAt   |
| `favoritesSieveConfig`  | createdAt                                                     | -createdAt   |

## Migration Checklist

### Phase 1: Core Routes (Week 1)

- [ ] `/api/products` → Sieve
- [ ] `/api/auctions` → Sieve
- [ ] `/api/shops` → Sieve
- [ ] `/api/categories` → Sieve
- [ ] `/api/reviews` → Sieve

### Phase 2: Admin Routes (Week 2)

- [ ] `/api/admin/products` → Sieve
- [ ] `/api/admin/auctions` → Sieve
- [ ] `/api/admin/orders` → Sieve
- [ ] `/api/admin/users` → Sieve
- [ ] `/api/admin/shops` → Sieve
- [ ] `/api/admin/tickets` → Sieve
- [ ] `/api/admin/payouts` → Sieve
- [ ] `/api/admin/coupons` → Sieve
- [ ] `/api/admin/returns` → Sieve
- [ ] `/api/admin/hero-slides` → Sieve
- [ ] `/api/blog/posts` → Sieve

### Phase 3: User/Seller Routes (Week 3)

- [ ] `/api/user/orders` → Sieve
- [ ] `/api/user/favorites` → Sieve
- [ ] `/api/seller/products` → Sieve
- [ ] `/api/seller/auctions` → Sieve
- [ ] `/api/seller/orders` → Sieve

### Phase 4: Frontend Integration (Week 4)

- [ ] Create `useSievePagination` hook
- [ ] Update service methods with `buildSieveQueryString`
- [ ] Create standardized Pagination components
- [ ] Update listing pages to use new components

### Phase 5: Cleanup (Week 5)

- [ ] Remove `executeCursorPaginatedQuery` from pagination.ts
- [ ] Remove legacy pagination params from route handlers
- [ ] Update API documentation with Sieve query format

## Creating Sieve Middleware

Create a reusable middleware for common Sieve operations:

```typescript
// src/app/api/lib/middleware/sieve.middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { parseSieveQuery, SieveConfig, SieveQuery } from "../sieve";

export interface SieveContext {
  sieveQuery: SieveQuery;
  mandatoryFilters: Array<{ field: string; operator: string; value: any }>;
}

export function withSieve(config: SieveConfig) {
  return function (
    handler: (
      request: NextRequest,
      context: SieveContext
    ) => Promise<NextResponse>
  ) {
    return async function (request: NextRequest): Promise<NextResponse> {
      const searchParams = request.nextUrl.searchParams;
      const sieveQuery = parseSieveQuery(searchParams, config);

      const context: SieveContext = {
        sieveQuery,
        mandatoryFilters: [],
      };

      return handler(request, context);
    };
  };
}
```

Usage:

```typescript
import { withSieve } from "@/app/api/lib/middleware/sieve.middleware";
import { productsSieveConfig, executeSieveQuery } from "@/app/api/lib/sieve";

export const GET = withSieve(productsSieveConfig)(async (request, context) => {
  context.sieveQuery.filters.push({
    field: "status",
    operator: "==",
    value: "published",
  });

  const result = await executeSieveQuery(
    "products",
    context.sieveQuery,
    productsSieveConfig
  );

  return NextResponse.json(result);
});
```
