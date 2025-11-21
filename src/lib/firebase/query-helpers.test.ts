/**
 * Tests for firebase/query-helpers.ts
 * Testing Firebase query helper functions
 */

import { describe, it, expect, jest, beforeEach } from "@jest/globals";
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
  encodeCursor,
  hasMorePages,
  getPageInfo,
  estimatePages,
  type PaginationConfig,
  type QueryFilter,
  type QuerySort,
  type QueryConfig,
  type PaginatedResult,
} from "./query-helpers";

// Mock Firebase functions
jest.mock("firebase/firestore", () => ({
  limit: jest.fn((n) => ({ type: "limit", value: n })),
  startAfter: jest.fn((cursor) => ({ type: "startAfter", cursor })),
  endBefore: jest.fn((cursor) => ({ type: "endBefore", cursor })),
  limitToLast: jest.fn((n) => ({ type: "limitToLast", value: n })),
  orderBy: jest.fn((field, direction) => ({
    type: "orderBy",
    field,
    direction,
  })),
  where: jest.fn((field, operator, value) => ({
    type: "where",
    field,
    operator,
    value,
  })),
}));

// Import mocked functions
import {
  limit,
  startAfter,
  endBefore,
  limitToLast,
  orderBy,
  where,
} from "firebase/firestore";

// Mock document snapshot
const createMockDoc = (id: string, data: any = {}) => ({
  id,
  data: () => data,
  ref: { path: `test/${id}` },
  metadata: {
    hasPendingWrites: false,
    fromCache: false,
    isEqual: () => false,
  },
  exists: () => true,
  get: (field: string) => data[field],
  toJSON: () => ({ id, ...data }),
});

describe("buildPaginationConstraints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should build constraints for first page", () => {
    const config: PaginationConfig = {
      pageSize: 20,
    };

    const constraints = buildPaginationConstraints(config);

    expect(constraints).toHaveLength(1);
    expect(limit).toHaveBeenCalledWith(20);
  });

  it("should build constraints with sort for first page", () => {
    const config: PaginationConfig = {
      pageSize: 20,
      sortField: "created_at",
      sortDirection: "desc",
    };

    const constraints = buildPaginationConstraints(config);

    expect(constraints).toHaveLength(2);
    expect(orderBy).toHaveBeenCalledWith("created_at", "desc");
    expect(limit).toHaveBeenCalledWith(20);
  });

  it("should build constraints for next page", () => {
    const mockCursor = createMockDoc("doc1");
    const config: PaginationConfig = {
      pageSize: 20,
      afterCursor: mockCursor as any,
    };

    const constraints = buildPaginationConstraints(config);

    expect(constraints).toHaveLength(2);
    expect(startAfter).toHaveBeenCalledWith(mockCursor as any);
    expect(limit).toHaveBeenCalledWith(20);
  });

  it("should build constraints for previous page", () => {
    const mockCursor = createMockDoc("doc1");
    const config: PaginationConfig = {
      pageSize: 20,
      beforeCursor: mockCursor as any,
    };

    const constraints = buildPaginationConstraints(config);

    expect(constraints).toHaveLength(2);
    expect(endBefore).toHaveBeenCalledWith(mockCursor as any);
    expect(limitToLast).toHaveBeenCalledWith(20);
  });
});

describe("buildFilterConstraints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should build filter constraints", () => {
    const filters: QueryFilter[] = [
      { field: "status", operator: "==", value: "active" },
      { field: "price", operator: ">", value: 100 },
    ];

    const constraints = buildFilterConstraints(filters);

    expect(constraints).toHaveLength(2);
    expect(where).toHaveBeenCalledWith("status", "==", "active");
    expect(where).toHaveBeenCalledWith("price", ">", 100);
  });

  it("should handle empty filters array", () => {
    const constraints = buildFilterConstraints([]);

    expect(constraints).toHaveLength(0);
  });
});

describe("buildSortConstraints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should build sort constraints", () => {
    const sorts: QuerySort[] = [
      { field: "created_at", direction: "desc" },
      { field: "name", direction: "asc" },
    ];

    const constraints = buildSortConstraints(sorts);

    expect(constraints).toHaveLength(2);
    expect(orderBy).toHaveBeenCalledWith("created_at", "desc");
    expect(orderBy).toHaveBeenCalledWith("name", "asc");
  });

  it("should handle empty sorts array", () => {
    const constraints = buildSortConstraints([]);

    expect(constraints).toHaveLength(0);
  });
});

describe("buildQueryConstraints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should build complete query constraints", () => {
    const config: QueryConfig = {
      filters: [{ field: "status", operator: "==", value: "active" }],
      sorts: [{ field: "created_at", direction: "desc" }],
      pagination: { pageSize: 20 },
    };

    const constraints = buildQueryConstraints(config);

    expect(constraints).toHaveLength(3); // 1 filter + 1 sort + 1 limit
    expect(where).toHaveBeenCalledWith("status", "==", "active");
    expect(orderBy).toHaveBeenCalledWith("created_at", "desc");
    expect(limit).toHaveBeenCalledWith(20);
  });

  it("should handle pagination with sortField (no additional sorts)", () => {
    const config: QueryConfig = {
      sorts: [{ field: "name", direction: "asc" }],
      pagination: {
        pageSize: 20,
        sortField: "created_at",
        sortDirection: "desc",
      },
    };

    const constraints = buildQueryConstraints(config);

    expect(constraints).toHaveLength(2); // 1 orderBy from pagination + 1 limit
    expect(orderBy).toHaveBeenCalledWith("created_at", "desc");
    expect(limit).toHaveBeenCalledWith(20);
  });

  it("should handle empty config", () => {
    const constraints = buildQueryConstraints({});

    expect(constraints).toHaveLength(0);
  });
});

describe("processPaginatedResults", () => {
  it("should process results with full page", () => {
    const mockDocs = Array.from({ length: 20 }, (_, i) =>
      createMockDoc(`doc${i}`, { name: `Item ${i}` })
    ) as any[];

    const result = processPaginatedResults(mockDocs, 20, false);

    expect(result.data).toHaveLength(20);
    expect(result.hasNextPage).toBe(true);
    expect(result.hasPrevPage).toBe(true);
    expect(result.nextCursor).toBe(mockDocs[19]);
    expect(result.prevCursor).toBe(mockDocs[0]);
    expect(result.pageSize).toBe(20);
  });

  it("should process results with partial page", () => {
    const mockDocs = Array.from({ length: 15 }, (_, i) =>
      createMockDoc(`doc${i}`, { name: `Item ${i}` })
    ) as any[];

    const result = processPaginatedResults(mockDocs, 20, false);

    expect(result.data).toHaveLength(15);
    expect(result.hasNextPage).toBe(false);
    expect(result.hasPrevPage).toBe(true);
    expect(result.nextCursor).toBe(null);
    expect(result.prevCursor).toBe(mockDocs[0]);
  });

  it("should process results with previous cursor", () => {
    const mockDocs = Array.from({ length: 20 }, (_, i) =>
      createMockDoc(`doc${i}`, { name: `Item ${i}` })
    ) as any[];

    const result = processPaginatedResults(mockDocs, 20, true);

    expect(result.hasPrevPage).toBe(true);
  });

  it("should handle empty results", () => {
    const result = processPaginatedResults([], 20, false);

    expect(result.data).toHaveLength(0);
    expect(result.hasNextPage).toBe(false);
    expect(result.hasPrevPage).toBe(false);
    expect(result.nextCursor).toBe(null);
    expect(result.prevCursor).toBe(null);
  });
});

describe("Pagination convenience functions", () => {
  it("should create first page config", () => {
    const config = firstPage(20, "created_at", "desc");

    expect(config).toEqual({
      pageSize: 20,
      sortField: "created_at",
      sortDirection: "desc",
    });
  });

  it("should create first page config with defaults", () => {
    const config = firstPage();

    expect(config).toEqual({
      pageSize: 20,
    });
  });

  it("should create next page config", () => {
    const mockCursor = createMockDoc("doc1") as any;
    const config = nextPage(20, mockCursor, "created_at", "desc");

    expect(config).toEqual({
      pageSize: 20,
      afterCursor: mockCursor,
      sortField: "created_at",
      sortDirection: "desc",
    });
  });

  it("should create prev page config", () => {
    const mockCursor = createMockDoc("doc1") as any;
    const config = prevPage(20, mockCursor, "created_at", "desc");

    expect(config).toEqual({
      pageSize: 20,
      beforeCursor: mockCursor,
      sortField: "created_at",
      sortDirection: "desc",
    });
  });
});

describe("Filter convenience functions", () => {
  it("should create status filter", () => {
    const filter = statusFilter("active");

    expect(filter).toEqual({
      field: "status",
      operator: "==",
      value: "active",
    });
  });

  it("should create user filter", () => {
    const filter = userFilter("user123");

    expect(filter).toEqual({
      field: "user_id",
      operator: "==",
      value: "user123",
    });
  });

  it("should create shop filter", () => {
    const filter = shopFilter("shop123");

    expect(filter).toEqual({
      field: "shop_id",
      operator: "==",
      value: "shop123",
    });
  });

  it("should create category filter", () => {
    const filter = categoryFilter("cat123");

    expect(filter).toEqual({
      field: "category_id",
      operator: "==",
      value: "cat123",
    });
  });

  it("should create date range filter", () => {
    const startDate = new Date("2023-01-01");
    const endDate = new Date("2023-12-31");
    const filters = dateRangeFilter("created_at", startDate, endDate);

    expect(filters).toHaveLength(2);
    expect(filters[0]).toEqual({
      field: "created_at",
      operator: ">=",
      value: startDate,
    });
    expect(filters[1]).toEqual({
      field: "created_at",
      operator: "<=",
      value: endDate,
    });
  });
});

describe("Sort convenience functions", () => {
  it("should create sort by created desc", () => {
    const sort = sortByCreatedDesc();

    expect(sort).toEqual({
      field: "created_at",
      direction: "desc",
    });
  });

  it("should create sort by created asc", () => {
    const sort = sortByCreatedAsc();

    expect(sort).toEqual({
      field: "created_at",
      direction: "asc",
    });
  });

  it("should create sort by updated desc", () => {
    const sort = sortByUpdatedDesc();

    expect(sort).toEqual({
      field: "updated_at",
      direction: "desc",
    });
  });

  it("should create sort by price asc", () => {
    const sort = sortByPriceAsc();

    expect(sort).toEqual({
      field: "price",
      direction: "asc",
    });
  });

  it("should create sort by price desc", () => {
    const sort = sortByPriceDesc();

    expect(sort).toEqual({
      field: "price",
      direction: "desc",
    });
  });

  it("should create sort by popularity", () => {
    const sort = sortByPopularity();

    expect(sort).toEqual({
      field: "view_count",
      direction: "desc",
    });
  });
});

describe("Utility functions", () => {
  it("should encode cursor", () => {
    const mockDoc = createMockDoc("doc123") as any;
    const encoded = encodeCursor(mockDoc);

    expect(encoded).toBeTruthy();
    const decoded = JSON.parse(Buffer.from(encoded, "base64").toString());
    expect(decoded.id).toBe("doc123");
    expect(decoded.path).toBe("test/doc123");
  });

  it("should handle encode cursor error", () => {
    const mockDoc = {
      id: "doc123",
      ref: { path: "test/doc123" },
      // Missing data method to cause error
    } as any;

    // Mock Buffer.from to throw an error
    const originalBufferFrom = Buffer.from;
    Buffer.from = jest.fn(() => {
      throw new Error("Buffer error");
    });

    const encoded = encodeCursor(mockDoc);
    expect(encoded).toBe("");

    // Restore original Buffer.from
    Buffer.from = originalBufferFrom;
  });

  it("should check if has more pages", () => {
    const resultWithMore: PaginatedResult<any> = {
      data: [],
      nextCursor: null,
      prevCursor: null,
      hasNextPage: true,
      hasPrevPage: false,
      pageSize: 20,
    };

    const resultWithoutMore: PaginatedResult<any> = {
      data: [],
      nextCursor: null,
      prevCursor: null,
      hasNextPage: false,
      hasPrevPage: false,
      pageSize: 20,
    };

    expect(hasMorePages(resultWithMore)).toBe(true);
    expect(hasMorePages(resultWithoutMore)).toBe(false);
  });

  it("should get page info", () => {
    const result: PaginatedResult<any> = {
      data: [{ id: "1" }, { id: "2" }],
      nextCursor: null,
      prevCursor: null,
      hasNextPage: true,
      hasPrevPage: false,
      pageSize: 20,
    };

    const info = getPageInfo(result);
    expect(info).toBe("Showing 2 items (more available)");
  });

  it("should get page info without more pages", () => {
    const result: PaginatedResult<any> = {
      data: [{ id: "1" }],
      nextCursor: null,
      prevCursor: null,
      hasNextPage: false,
      hasPrevPage: false,
      pageSize: 20,
    };

    const info = getPageInfo(result);
    expect(info).toBe("Showing 1 items");
  });

  it("should estimate pages", () => {
    expect(estimatePages(100, 20)).toBe(5);
    expect(estimatePages(101, 20)).toBe(6);
    expect(estimatePages(20, 20)).toBe(1);
    expect(estimatePages(0, 20)).toBe(0);
  });
});
