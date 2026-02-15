# 🛣️ Phase 3: Feature Implementation - API Route TODOs

**Start Date**: After Phase 1 (can run in parallel with Phase 2)  
**Target Duration**: 5-10 days  
**Status**: 🟡 BLOCKED (waiting for Phase 1)  
**Parallel with**: Phase 2 & 4

---

## 📋 Quick Start Checklist

- [ ] **3.1** Run TODO audit to get exact count and locations
- [ ] **3.2** Create prioritization spreadsheet
- [ ] **3.3** Organize TODOs by route file and dependency
- [ ] **3.4** Implement by priority (dependencies first)
- [ ] **3.5** Add tests for each implementation
- [ ] **VERIFICATION** All 87 TODOs implemented and tested

---

## Phase 3.1: TODO Audit & Organization

### Subtask 3.1.1: Extract All Route TODOs

**Command**:

```bash
# Get all TODOs in API routes with line numbers
$output = @()
Get-ChildItem -Path "src/app/api" -Include "route.ts" -Recurse | ForEach-Object {
  Select-String -Path $_.FullName -Pattern "TODO|FIXME" -Raw |
    ForEach-Object {
      $output += "$($_.FullName):$($_)"
    }
}
$output | Out-File "docs/ROUTE_TODOS_AUDIT.txt"
```

**Expected Output**: ~87 TODOs across 11 files

### Subtask 3.1.2: Categorize and Prioritize

**Create**: `docs/PHASE3_ROUTE_TODO_MATRIX.md`

```markdown
# API Route TODO Matrix

## Summary

- Total TODOs: 87
- Files affected: 11
- Estimated effort: 60-80 hours

## By Route File

### Auth Routes (src/app/api/auth/\*)

**TODOs: 8 | Effort: Medium | Priority: HIGH**

| TODO | Location             | Description               | Dependency | Effort |
| ---- | -------------------- | ------------------------- | ---------- | ------ |
| 1    | login/route.ts:45    | Multi-factor auth support | -          | 4h     |
| 2    | register/route.ts:32 | Email verification flow   | -          | 3h     |
| ...  | ...                  | ...                       | ...        | ...    |

### User Routes (src/app/api/user/\*)

**TODOs: 12 | Effort: Medium | Priority: HIGH**

### Product Routes (src/app/api/products/\*)

**TODOs: 15 | Effort: Large | Priority: MEDIUM**

### Order Routes (src/app/api/orders/\*)

**TODOs: 10 | Effort: Large | Priority: MEDIUM**

### Admin Routes (src/app/api/admin/\*)

**TODOs: 18 | Effort: Large | Priority: MEDIUM**

### Review Routes (src/app/api/reviews/\*)

**TODOs: 8 | Effort: Medium | Priority: MEDIUM**

### Other Routes

**TODOs: 16 | Effort: Varies | Priority: LOW**

## Recommended Implementation Order

1. Auth routes (enable other features)
2. User routes (enable profile management)
3. Product routes (core marketplace feature)
4. Order routes (enable transactions)
5. Review routes (enable feedback)
6. Admin routes (backend management)
7. Other routes (optional features)
```

---

## Phase 3.2: Implementation Strategy by Route

### Key Principles

1. **Dependency-First**: Implement routes that unblock others first
   - Auth → User → Product → Order → Reviews → Admin

2. **Batch by File**: Implement all TODOs in one route file together
   - Allows testing whole file at once
   - Maintains consistency

3. **Test as You Go**: Add tests for each implementation
   - Prevents regressions
   - Validates against schema

4. **Document Implementation**: Update CHANGELOG.md after each file

---

### Auth Routes Implementation

**Files**: `src/app/api/auth/*/route.ts`  
**Typical TODOs**:

- Multi-factor authentication
- OAuth provider setup
- Token refresh logic
- Session invalidation
- Password reset flow

**Template**:

```typescript
/**
 * TODO: Add multi-factor auth support
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify basic auth
    // 2. If mfa enabled, send challenge
    // 3. Return mfa token instead of session
    // 4. Client sends mfa token + code to separate endpoint
    // 5. Validate mfa and return session
  } catch (error) {
    return handleApiError(error);
  }
}
```

**Testing Approach**:

- [ ] Happy path: Successful auth flow
- [ ] Error path 1: Invalid credentials
- [ ] Error path 2: Account locked
- [ ] Error path 3: MFA required

---

### Product Routes Implementation

**Files**: `src/app/api/products/*/route.ts`  
**Typical TODOs**:

- Search and filtering
- Pagination with cursors
- Bulk operations
- Inventory management
- Product analytics

**Example TODOs**:

```typescript
/**
 * TODO: Implement advanced search with relevance scoring
 * - Full-text search across title, description, tags
 * - Relevance scoring based on title matches
 * - Faceted search results
 */

/**
 * TODO: Add pagination with cursor support
 * - Convert offset-based to cursor-based
 * - Better for large datasets
 * - Stable across deletions
 */

/**
 * TODO: Implement inventory reservation system
 * - Reserve items during checkout
 * - Release after timeout or cancellation
 * - Prevent overselling
 */
```

---

## Phase 3.3: Implementation Checklist Template

**Use for each route file**:

```markdown
## [Route File Name] - Implementation Plan

### File: src/app/api/[path]/route.ts

**Status**: 🟡 NOT STARTED  
**TODOs**: N  
**Estimated Effort**: Xh  
**Priority**: [HIGH/MEDIUM/LOW]

### Dependencies:

- [ ] Dependency 1
- [ ] Dependency 2

### Subtasks:

- [ ] TODO 1: Description
  - Files: route.ts, test.ts
  - Constants: ERROR_MESSAGES._, SUCCESS_MESSAGES._
  - Repositories: repo.\*
  - Effort: 1h
  - Status: ⬜ Not started

- [ ] TODO 2: Description
  - Effort: 2h
  - Status: ⬜ Not started

### Testing:

- [ ] Happy path tests
- [ ] Error case tests
- [ ] Integration tests
- [ ] Schema validation tests

### Verification:

- [ ] npm test -- src/app/api/[path]/**tests**/route.test.ts
- [ ] No TypeScript errors
- [ ] All tests passing
```

---

## Phase 3.4: Example: Complete Product Route Implementation

### Product Search & Filtering TODOs

**File**: `src/app/api/products/route.ts`

**Original TODOs**:

1. Implement advanced search
2. Add faceted filtering
3. Add sorting options
4. Optimize with indexing

**Implementation**:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifySessionCookie } from "@/lib/firebase/auth-server";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { productRepository } from "@/repositories";
import { z } from "zod";

/**
 * TODO: Implement advanced search with relevance scoring
 * TODO: Add faceted search results
 * TODO: Implement cursor-based pagination
 */

const searchSchema = z.object({
  q: z.string().optional(), // Search query
  category: z.string().optional(), // Category filter
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  condition: z.enum(["new", "used", "refurbished"]).optional(),
  inStock: z.coerce.boolean().optional(),
  sortBy: z.enum(["relevance", "price", "rating", "newest"]).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
  facets: z.boolean().default(false), // Return facet counts
});

export async function GET(request: NextRequest) {
  try {
    // 1. Parse and validate query params
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams);
    const validation = searchSchema.safeParse(queryParams);

    if (!validation.success) {
      return ApiErrors.validationError(validation.error.issues);
    }

    const params = validation.data;

    // 2. TODO: Build search query with relevance scoring
    // Weight: title (weight: 3) > description (weight: 1) > tags (weight: 2)
    const filters: any = {};

    if (params.q) {
      // TODO: Full-text search implementation
      // For now, simple contains search
      filters.titleContains = params.q;
    }

    if (params.category) {
      filters.category = params.category;
    }

    if (params.minPrice || params.maxPrice) {
      filters.priceRange = {
        min: params.minPrice,
        max: params.maxPrice,
      };
    }

    if (params.condition) {
      filters.condition = params.condition;
    }

    if (params.inStock !== undefined) {
      filters.inStock = params.inStock;
    }

    // 3. TODO: Implement cursor-based pagination
    // Current: productRepository.search(filters, { offset, limit })
    // Enhanced: productRepository.searchCursor(filters, { cursor, limit })

    const products = await productRepository.search(filters, {
      limit: params.limit,
      cursor: params.cursor,
      sortBy: params.sortBy || "relevance",
    });

    // 4. TODO: Add faceted search results
    let facets: any = undefined;
    if (params.facets) {
      facets = {
        categories: await productRepository.getCategories(filters),
        priceRanges: [
          { min: 0, max: 100, count: 0 },
          { min: 100, max: 500, count: 0 },
          { min: 500, max: 2000, count: 0 },
          { min: 2000, count: 0 },
        ],
        conditions: [
          { type: "new", count: 0 },
          { type: "used", count: 0 },
          { type: "refurbished", count: 0 },
        ],
        ratings: [
          { stars: 5, count: 0 },
          { stars: 4, count: 0 },
          { stars: 3, count: 0 },
        ],
      };
    }

    // 5. Return response
    return successResponse(
      {
        products: products.items,
        pagination: {
          nextCursor: products.nextCursor,
          hasMore: products.hasMore,
        },
        facets,
      },
      SUCCESS_MESSAGES.PRODUCT.FETCHED,
    );
  } catch (error) {
    return handleApiError(error);
  }
}
```

**Tests**:

```typescript
describe("GET /api/products - Search & Filtering", () => {
  // TODO: Setup test data
  const testProducts = getSeedProducts();

  describe("Basic search", () => {
    it("should find products by search query", async () => {
      const response = await GET(
        new NextRequest("http://localhost/api/products?q=iPhone"),
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.products).toHaveLength(1);
      expect(data.data.products[0].title).toContain("iPhone");
    });
  });

  describe("Filtering", () => {
    it("should filter by price range", async () => {
      const response = await GET(
        new NextRequest(
          "http://localhost/api/products?minPrice=100&maxPrice=1000",
        ),
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      data.data.products.forEach((p) => {
        expect(p.price).toBeGreaterThanOrEqual(100);
        expect(p.price).toBeLessThanOrEqual(1000);
      });
    });
  });

  describe("Pagination", () => {
    it("should support cursor-based pagination", async () => {
      const firstPage = await GET(
        new NextRequest("http://localhost/api/products?limit=10"),
      );
      const data1 = await firstPage.json();

      if (data1.data.pagination.nextCursor) {
        const secondPage = await GET(
          new NextRequest(
            `http://localhost/api/products?limit=10&cursor=${data1.data.pagination.nextCursor}`,
          ),
        );
        const data2 = await secondPage.json();

        expect(data2.data.products[0].id).not.toBe(data1.data.products[0].id);
      }
    });
  });

  describe("Faceted search", () => {
    it("should return facet counts when requested", async () => {
      const response = await GET(
        new NextRequest("http://localhost/api/products?facets=true"),
      );
      const data = await response.json();

      expect(data.data.facets).toBeDefined();
      expect(data.data.facets.categories).toBeDefined();
      expect(Array.isArray(data.data.facets.priceRanges)).toBe(true);
    });
  });
});
```

---

## Phase 3.5: Batch Implementation by Module

### Recommended Order

**Week 1**:

- Day 1: Auth routes (8 TODOs)
- Day 2: User routes (12 TODOs)
- Day 3-4: Product routes (15 TODOs)

**Week 2**:

- Day 1-2: Order routes (10 TODOs)
- Day 2-3: Review routes (8 TODOs)
- Day 3-4: Admin routes (18 TODOs)

**Week 3**:

- Day 1-2: Other routes (16 TODOs)
- Day 3: Integration testing
- Day 4: Performance optimization

---

## Phase 3.6: Verification

### For Each Completed Route File:

```bash
# 1. Type check the route
npx tsc --noEmit src/app/api/[path]/route.ts

# 2. Run route tests
npm test -- src/app/api/__tests__/[name].test.ts

# 3. Run integration tests
npm run test:integration

# 4. Check coverage
npm test -- --coverage src/app/api/[path]
```

### Final Verification:

```bash
# All API tests pass
npm test -- src/app/api

# No TypeScript errors
npx tsc --noEmit

# All 87 TODOs implemented
grep -r "TODO" src/app/api --include="*.ts" | wc -l  # Should be ~0
```

---

## 📊 Progress Tracking

Use this table to track implementation:

| Route File  | TODOs  | Status | Tests | % Complete |
| ----------- | ------ | ------ | ----- | ---------- |
| auth/\*     | 8      | ⬜     | ⬜    | 0%         |
| user/\*     | 12     | ⬜     | ⬜    | 0%         |
| products/\* | 15     | ⬜     | ⬜    | 0%         |
| orders/\*   | 10     | ⬜     | ⬜    | 0%         |
| reviews/\*  | 8      | ⬜     | ⬜    | 0%         |
| admin/\*    | 18     | ⬜     | ⬜    | 0%         |
| other/\*    | 16     | ⬜     | ⬜    | 0%         |
| **TOTAL**   | **87** |        |       | **0%**     |

Legend: ⬜ Not started | 🟨 In progress | ✅ Complete

---

When Complete:

- Mark Phase 3 as ✅ COMPLETE in [IMPLEMENTATION_TRACKER.md](../IMPLEMENTATION_TRACKER.md)
- Update progress table above
- Proceed to Phase 4 (Test Hardening)

---

Generated: February 12, 2026 | Next: [Phase 4 Plan](./PHASE4_TEST_HARDENING.md)
