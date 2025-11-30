# Sieve Pagination Migration

> **Status**: ✅ Complete (All Core Routes Migrated)
> **Priority**: High
> **Last Updated**: December 2025

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

## API Routes Migration Status

### Priority 1 - High Traffic Routes (All ✅ Complete)

| Route             | Config                  | Status |
| ----------------- | ----------------------- | ------ |
| `/api/products`   | `productsSieveConfig`   | ✅     |
| `/api/auctions`   | `auctionsSieveConfig`   | ✅     |
| `/api/shops`      | `shopsSieveConfig`      | ✅     |
| `/api/categories` | `categoriesSieveConfig` | ✅     |
| `/api/reviews`    | `reviewsSieveConfig`    | ✅     |

### Priority 2 - Admin/Core Routes (All ✅ Complete)

| Route                | Config                     | Status |
| -------------------- | -------------------------- | ------ |
| `/api/orders`        | `ordersSieveConfig`        | ✅     |
| `/api/users`         | `usersSieveConfig`         | ✅     |
| `/api/payouts`       | `payoutsSieveConfig`       | ✅     |
| `/api/coupons`       | `couponsSieveConfig`       | ✅     |
| `/api/returns`       | `returnsSieveConfig`       | ✅     |
| `/api/tickets`       | `ticketsSieveConfig`       | ✅     |
| `/api/blog`          | `blogSieveConfig`          | ✅     |
| `/api/favorites`     | `favoritesSieveConfig`     | ✅     |
| `/api/hero-slides`   | `heroSlidesSieveConfig`    | ✅     |
| `/api/notifications` | `notificationsSieveConfig` | ✅     |

### Priority 3 - User/Seller Routes (Consolidated)

User/Seller routes share the main API routes with role-based filtering:

| Route            | Uses Config            | Status           |
| ---------------- | ---------------------- | ---------------- |
| `/api/orders`    | `ordersSieveConfig`    | ✅ Role-filtered |
| `/api/favorites` | `favoritesSieveConfig` | ✅ User-filtered |
| `/api/products`  | `productsSieveConfig`  | ✅ Shop-filtered |
| `/api/auctions`  | `auctionsSieveConfig`  | ✅ Shop-filtered |

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

### Phase 1: Core Routes (Week 1) ✅ COMPLETE

- [x] `/api/products` → Sieve
- [x] `/api/auctions` → Sieve
- [x] `/api/shops` → Sieve
- [x] `/api/categories` → Sieve
- [x] `/api/reviews` → Sieve

### Phase 2: Admin Routes (Week 2) ✅ COMPLETE

- [x] `/api/admin/products` → Sieve (uses main `/api/products` with admin filter)
- [x] `/api/admin/auctions` → Sieve (uses main `/api/auctions` with admin filter)
- [x] `/api/admin/orders` → Sieve (uses main `/api/orders` with admin filter)
- [x] `/api/admin/users` → Sieve
- [x] `/api/admin/shops` → Sieve (uses main `/api/shops` with admin filter)
- [x] `/api/admin/tickets` → Sieve
- [x] `/api/admin/payouts` → Sieve
- [x] `/api/admin/coupons` → Sieve
- [x] `/api/admin/returns` → Sieve
- [x] `/api/admin/hero-slides` → Sieve
- [x] `/api/blog/posts` → Sieve

### Phase 3: User/Seller Routes (Week 3) ✅ COMPLETE

- [x] `/api/user/orders` → Sieve (uses main `/api/orders` with user filter)
- [x] `/api/user/favorites` → Sieve
- [x] `/api/seller/products` → Sieve (uses main `/api/products` with shop filter)
- [x] `/api/seller/auctions` → Sieve (uses main `/api/auctions` with shop filter)
- [x] `/api/seller/orders` → Sieve (uses main `/api/orders` with seller filter)

### Phase 4: Frontend Integration (Week 4) ✅ COMPLETE

- [x] Create `useSievePagination` hook
- [x] Update service methods with `buildSieveQueryString`
- [x] Create standardized Pagination components
- [x] Update listing pages to use new components

### Phase 5: Cleanup (Week 5) 🟡 IN PROGRESS

- [ ] Remove `executeCursorPaginatedQuery` from pagination.ts
- [ ] Remove legacy pagination params from route handlers
- [x] Update API documentation with Sieve query format

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
