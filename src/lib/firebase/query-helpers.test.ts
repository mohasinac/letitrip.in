/**
 * Tests for Firebase Query Helpers
 *
 * Run with: npm test src/lib/firebase/query-helpers.test.ts
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import {
  buildPaginationConstraints,
  buildFilterConstraints,
  buildSortConstraints,
  buildQueryConstraints,
  processPaginatedResults,
  firstPage,
  nextPage,
  prevPage,
  statusFilter,
  userFilter,
  shopFilter,
  categoryFilter,
  dateRangeFilter,
  sortByCreatedDesc,
  sortByCreatedAsc,
  sortByUpdatedDesc,
  sortByPriceAsc,
  sortByPriceDesc,
  sortByPopularity,
  hasMorePages,
  getPageInfo,
  estimatePages,
  type PaginationConfig,
  type QueryFilter,
  type QuerySort,
  type PaginatedResult,
} from "./query-helpers";

// ============================================================================
// Pagination Config Tests
// ============================================================================

describe("Pagination Config Helpers", () => {
  it("should create first page config", () => {
    const config = firstPage(20, "created_at", "desc");

    assert.strictEqual(config.pageSize, 20);
    assert.strictEqual(config.sortField, "created_at");
    assert.strictEqual(config.sortDirection, "desc");
    assert.strictEqual(config.afterCursor, undefined);
    assert.strictEqual(config.beforeCursor, undefined);
  });

  it("should create first page config with defaults", () => {
    const config = firstPage();

    assert.strictEqual(config.pageSize, 20);
    assert.strictEqual(config.sortField, undefined);
  });

  it("should create next page config", () => {
    const mockCursor = { id: "doc1" } as any;
    const config = nextPage(20, mockCursor, "created_at", "desc");

    assert.strictEqual(config.pageSize, 20);
    assert.strictEqual(config.afterCursor, mockCursor);
    assert.strictEqual(config.beforeCursor, undefined);
    assert.strictEqual(config.sortField, "created_at");
  });

  it("should create previous page config", () => {
    const mockCursor = { id: "doc1" } as any;
    const config = prevPage(20, mockCursor, "created_at", "desc");

    assert.strictEqual(config.pageSize, 20);
    assert.strictEqual(config.beforeCursor, mockCursor);
    assert.strictEqual(config.afterCursor, undefined);
    assert.strictEqual(config.sortField, "created_at");
  });
});

// ============================================================================
// Filter Tests
// ============================================================================

describe("Filter Helpers", () => {
  it("should create status filter", () => {
    const filter = statusFilter("active");

    assert.strictEqual(filter.field, "status");
    assert.strictEqual(filter.operator, "==");
    assert.strictEqual(filter.value, "active");
  });

  it("should create user filter", () => {
    const filter = userFilter("user123");

    assert.strictEqual(filter.field, "user_id");
    assert.strictEqual(filter.operator, "==");
    assert.strictEqual(filter.value, "user123");
  });

  it("should create shop filter", () => {
    const filter = shopFilter("shop456");

    assert.strictEqual(filter.field, "shop_id");
    assert.strictEqual(filter.operator, "==");
    assert.strictEqual(filter.value, "shop456");
  });

  it("should create category filter", () => {
    const filter = categoryFilter("cat789");

    assert.strictEqual(filter.field, "category_id");
    assert.strictEqual(filter.operator, "==");
    assert.strictEqual(filter.value, "cat789");
  });

  it("should create date range filter", () => {
    const startDate = new Date("2025-01-01");
    const endDate = new Date("2025-12-31");
    const filters = dateRangeFilter("created_at", startDate, endDate);

    assert.strictEqual(filters.length, 2);
    assert.strictEqual(filters[0].field, "created_at");
    assert.strictEqual(filters[0].operator, ">=");
    assert.strictEqual(filters[0].value, startDate);
    assert.strictEqual(filters[1].field, "created_at");
    assert.strictEqual(filters[1].operator, "<=");
    assert.strictEqual(filters[1].value, endDate);
  });

  it("should build filter constraints", () => {
    const filters: QueryFilter[] = [
      { field: "status", operator: "==", value: "active" },
      { field: "price", operator: ">", value: 100 },
    ];

    const constraints = buildFilterConstraints(filters);

    assert.strictEqual(constraints.length, 2);
    // Firestore constraints are opaque objects, just verify count
  });
});

// ============================================================================
// Sort Tests
// ============================================================================

describe("Sort Helpers", () => {
  it("should create sort by created desc", () => {
    const sort = sortByCreatedDesc();

    assert.strictEqual(sort.field, "created_at");
    assert.strictEqual(sort.direction, "desc");
  });

  it("should create sort by created asc", () => {
    const sort = sortByCreatedAsc();

    assert.strictEqual(sort.field, "created_at");
    assert.strictEqual(sort.direction, "asc");
  });

  it("should create sort by updated desc", () => {
    const sort = sortByUpdatedDesc();

    assert.strictEqual(sort.field, "updated_at");
    assert.strictEqual(sort.direction, "desc");
  });

  it("should create sort by price asc", () => {
    const sort = sortByPriceAsc();

    assert.strictEqual(sort.field, "price");
    assert.strictEqual(sort.direction, "asc");
  });

  it("should create sort by price desc", () => {
    const sort = sortByPriceDesc();

    assert.strictEqual(sort.field, "price");
    assert.strictEqual(sort.direction, "desc");
  });

  it("should create sort by popularity", () => {
    const sort = sortByPopularity();

    assert.strictEqual(sort.field, "view_count");
    assert.strictEqual(sort.direction, "desc");
  });

  it("should build sort constraints", () => {
    const sorts: QuerySort[] = [
      { field: "created_at", direction: "desc" },
      { field: "name", direction: "asc" },
    ];

    const constraints = buildSortConstraints(sorts);

    assert.strictEqual(constraints.length, 2);
  });
});

// ============================================================================
// Pagination Constraint Tests
// ============================================================================

describe("Pagination Constraints", () => {
  it("should build constraints for first page", () => {
    const config: PaginationConfig = {
      pageSize: 20,
      sortField: "created_at",
      sortDirection: "desc",
    };

    const constraints = buildPaginationConstraints(config);

    // Should have orderBy + limit
    assert.strictEqual(constraints.length, 2);
  });

  it("should build constraints for next page", () => {
    const mockCursor = { id: "doc1" } as any;
    const config: PaginationConfig = {
      pageSize: 20,
      afterCursor: mockCursor,
      sortField: "created_at",
      sortDirection: "desc",
    };

    const constraints = buildPaginationConstraints(config);

    // Should have orderBy + startAfter + limit
    assert.strictEqual(constraints.length, 3);
  });

  it("should build constraints for previous page", () => {
    const mockCursor = { id: "doc1" } as any;
    const config: PaginationConfig = {
      pageSize: 20,
      beforeCursor: mockCursor,
      sortField: "created_at",
      sortDirection: "desc",
    };

    const constraints = buildPaginationConstraints(config);

    // Should have orderBy + endBefore + limitToLast
    assert.strictEqual(constraints.length, 3);
  });

  it("should build constraints without sort field", () => {
    const config: PaginationConfig = {
      pageSize: 20,
    };

    const constraints = buildPaginationConstraints(config);

    // Should have only limit
    assert.strictEqual(constraints.length, 1);
  });
});

// ============================================================================
// Complete Query Config Tests
// ============================================================================

describe("Complete Query Config", () => {
  it("should build constraints with filters only", () => {
    const constraints = buildQueryConstraints({
      filters: [{ field: "status", operator: "==", value: "active" }],
    });

    assert.strictEqual(constraints.length, 1);
  });

  it("should build constraints with sorts only", () => {
    const constraints = buildQueryConstraints({
      sorts: [{ field: "created_at", direction: "desc" }],
    });

    assert.strictEqual(constraints.length, 1);
  });

  it("should build constraints with pagination only", () => {
    const constraints = buildQueryConstraints({
      pagination: {
        pageSize: 20,
        sortField: "created_at",
        sortDirection: "desc",
      },
    });

    // orderBy + limit
    assert.strictEqual(constraints.length, 2);
  });

  it("should build constraints with everything", () => {
    const mockCursor = { id: "doc1" } as any;
    const constraints = buildQueryConstraints({
      filters: [{ field: "status", operator: "==", value: "active" }],
      sorts: [{ field: "price", direction: "asc" }],
      pagination: {
        pageSize: 20,
        afterCursor: mockCursor,
        sortField: "created_at",
        sortDirection: "desc",
      },
    });

    // filter + orderBy (from pagination, not sorts) + startAfter + limit
    assert.ok(constraints.length >= 3);
  });
});

// ============================================================================
// Paginated Result Tests
// ============================================================================

describe("Paginated Results", () => {
  it("should process results for first page", () => {
    const mockDocs = [
      {
        id: "doc1",
        data: () => ({ name: "Item 1" }),
        ref: { path: "items/doc1" },
      },
      {
        id: "doc2",
        data: () => ({ name: "Item 2" }),
        ref: { path: "items/doc2" },
      },
    ] as any[];

    const result = processPaginatedResults<any>(mockDocs, 20, false);

    assert.strictEqual(result.data.length, 2);
    assert.strictEqual(result.data[0].id, "doc1");
    assert.strictEqual(result.data[0].name, "Item 1");
    assert.strictEqual(result.pageSize, 20);
    assert.strictEqual(result.hasNextPage, false);
    assert.strictEqual(result.hasPrevPage, true); // Should be true because docs.length > 0
    assert.ok(result.nextCursor === null);
    assert.ok(result.prevCursor !== null);
  });

  it("should process full page results", () => {
    const mockDocs = Array.from({ length: 20 }, (_, i) => ({
      id: `doc${i}`,
      data: () => ({ name: `Item ${i}` }),
      ref: { path: `items/doc${i}` },
    })) as any[];

    const result = processPaginatedResults(mockDocs, 20, false);

    assert.strictEqual(result.data.length, 20);
    assert.strictEqual(result.hasNextPage, true);
    assert.ok(result.nextCursor !== null);
  });

  it("should process results with previous cursor", () => {
    const mockDocs = [
      {
        id: "doc1",
        data: () => ({ name: "Item 1" }),
        ref: { path: "items/doc1" },
      },
    ] as any[];

    const result = processPaginatedResults(mockDocs, 20, true);

    assert.strictEqual(result.hasPrevPage, true);
  });

  it("should process empty results", () => {
    const result = processPaginatedResults([], 20, false);

    assert.strictEqual(result.data.length, 0);
    assert.strictEqual(result.hasNextPage, false);
    assert.strictEqual(result.hasPrevPage, false);
    assert.strictEqual(result.nextCursor, null);
    assert.strictEqual(result.prevCursor, null);
  });
});

// ============================================================================
// Utility Function Tests
// ============================================================================

describe("Utility Functions", () => {
  it("should detect more pages", () => {
    const resultWithMore: PaginatedResult<any> = {
      data: [],
      nextCursor: {} as any,
      prevCursor: null,
      hasNextPage: true,
      hasPrevPage: false,
      pageSize: 20,
    };

    assert.strictEqual(hasMorePages(resultWithMore), true);
  });

  it("should detect no more pages", () => {
    const resultNoMore: PaginatedResult<any> = {
      data: [],
      nextCursor: null,
      prevCursor: null,
      hasNextPage: false,
      hasPrevPage: false,
      pageSize: 20,
    };

    assert.strictEqual(hasMorePages(resultNoMore), false);
  });

  it("should generate page info with more", () => {
    const result: PaginatedResult<any> = {
      data: Array(20).fill({}),
      nextCursor: {} as any,
      prevCursor: null,
      hasNextPage: true,
      hasPrevPage: false,
      pageSize: 20,
    };

    const info = getPageInfo(result);

    assert.ok(info.includes("20 items"));
    assert.ok(info.includes("more available"));
  });

  it("should generate page info without more", () => {
    const result: PaginatedResult<any> = {
      data: Array(5).fill({}),
      nextCursor: null,
      prevCursor: null,
      hasNextPage: false,
      hasPrevPage: false,
      pageSize: 20,
    };

    const info = getPageInfo(result);

    assert.ok(info.includes("5 items"));
    assert.ok(!info.includes("more available"));
  });

  it("should estimate total pages", () => {
    assert.strictEqual(estimatePages(100, 20), 5);
    assert.strictEqual(estimatePages(95, 20), 5);
    assert.strictEqual(estimatePages(101, 20), 6);
    assert.strictEqual(estimatePages(0, 20), 0);
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe("Integration Tests", () => {
  it("should work with common product listing pattern", () => {
    const config = buildQueryConstraints({
      filters: [statusFilter("active"), categoryFilter("electronics")],
      pagination: firstPage(20, "created_at", "desc"),
    });

    // Should have: status filter, category filter, orderBy, limit
    assert.ok(config.length >= 4);
  });

  it("should work with shop products pattern", () => {
    const mockCursor = { id: "doc1" } as any;
    const config = buildQueryConstraints({
      filters: [shopFilter("shop123"), statusFilter("active")],
      pagination: nextPage(20, mockCursor, "created_at", "desc"),
    });

    // Should have: shop filter, status filter, orderBy, startAfter, limit
    assert.ok(config.length >= 5);
  });

  it("should work with date range query", () => {
    const startDate = new Date("2025-01-01");
    const endDate = new Date("2025-12-31");

    const config = buildQueryConstraints({
      filters: [
        statusFilter("completed"),
        ...dateRangeFilter("created_at", startDate, endDate),
      ],
      sorts: [sortByCreatedDesc()],
    });

    // Should have: status filter, date start filter, date end filter, orderBy
    assert.strictEqual(config.length, 4);
  });

  it("should work with price sorting", () => {
    const config = buildQueryConstraints({
      filters: [statusFilter("active")],
      sorts: [sortByPriceAsc()],
      pagination: firstPage(20),
    });

    // filters + sorts (price sort, no pagination sort) + limit
    assert.ok(config.length >= 3);
  });
});

console.log("All query helper tests completed!");
