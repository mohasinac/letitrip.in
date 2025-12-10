/**
 * Unit Tests for Pagination Utilities
 * Testing cursor-based and offset-based pagination
 */

import {
  applyCursorPagination,
  applyOffsetPagination,
  createCursorPaginatedResponse,
  createCursorPaginationMeta,
  createOffsetPaginatedResponse,
  createOffsetPaginationMeta,
  executeCursorPaginatedQuery,
  executeOffsetPaginatedQuery,
  PaginationConfig,
  parsePaginationParams,
} from "../pagination";

// Mock Firestore types
const mockDocSnapshot = (id: string, data: any, exists: boolean = true) => ({
  id,
  exists,
  data: () => data,
  ref: { id },
  get: (field: string) => data[field],
});

const mockQuerySnapshot = (docs: any[]) => ({
  docs,
  size: docs.length,
  empty: docs.length === 0,
});

describe("parsePaginationParams", () => {
  describe("Basic Parameter Parsing", () => {
    it("should parse limit parameter", () => {
      const params = new URLSearchParams("limit=50");
      const result = parsePaginationParams(params);
      expect(result.limit).toBe(50);
    });

    it("should parse startAfter cursor parameter", () => {
      const params = new URLSearchParams("startAfter=doc123");
      const result = parsePaginationParams(params);
      expect(result.startAfter).toBe("doc123");
    });

    it("should parse cursor parameter as alias for startAfter", () => {
      const params = new URLSearchParams("cursor=doc456");
      const result = parsePaginationParams(params);
      expect(result.startAfter).toBe("doc456");
    });

    it("should parse page parameter", () => {
      const params = new URLSearchParams("page=3");
      const result = parsePaginationParams(params);
      expect(result.page).toBe(3);
    });

    it("should parse all parameters together", () => {
      const params = new URLSearchParams("limit=25&page=2&cursor=abc");
      const result = parsePaginationParams(params);
      expect(result.limit).toBe(25);
      expect(result.page).toBe(2);
      expect(result.startAfter).toBe("abc");
    });
  });

  describe("Default Values", () => {
    it("should use default limit when not provided", () => {
      const params = new URLSearchParams();
      const result = parsePaginationParams(params, 30);
      expect(result.limit).toBe(30);
    });

    it("should use standard default limit of 20", () => {
      const params = new URLSearchParams();
      const result = parsePaginationParams(params);
      expect(result.limit).toBe(20);
    });

    it("should set defaultLimit and maxLimit in config", () => {
      const params = new URLSearchParams();
      const result = parsePaginationParams(params, 15, 75);
      expect(result.defaultLimit).toBe(15);
      expect(result.maxLimit).toBe(75);
    });
  });

  describe("Limit Validation and Constraints", () => {
    it("should enforce maximum limit", () => {
      const params = new URLSearchParams("limit=200");
      const result = parsePaginationParams(params, 20, 100);
      expect(result.limit).toBe(100);
    });

    it("should accept limit equal to max limit", () => {
      const params = new URLSearchParams("limit=100");
      const result = parsePaginationParams(params, 20, 100);
      expect(result.limit).toBe(100);
    });

    it("should use default for zero limit", () => {
      const params = new URLSearchParams("limit=0");
      const result = parsePaginationParams(params, 20);
      expect(result.limit).toBe(20);
    });

    it("should use default for negative limit", () => {
      const params = new URLSearchParams("limit=-10");
      const result = parsePaginationParams(params, 25);
      expect(result.limit).toBe(25);
    });
  });

  describe("Invalid Input Handling", () => {
    it("should handle invalid limit format", () => {
      const params = new URLSearchParams("limit=invalid");
      const result = parsePaginationParams(params, 20);
      expect(result.limit).toBe(20);
    });

    it("should handle invalid page format", () => {
      const params = new URLSearchParams("page=invalid");
      const result = parsePaginationParams(params);
      expect(result.page).toBeUndefined();
    });

    it("should handle zero page number", () => {
      const params = new URLSearchParams("page=0");
      const result = parsePaginationParams(params);
      expect(result.page).toBeUndefined();
    });

    it("should handle negative page number", () => {
      const params = new URLSearchParams("page=-5");
      const result = parsePaginationParams(params);
      expect(result.page).toBeUndefined();
    });

    it("should handle float values for limit", () => {
      const params = new URLSearchParams("limit=25.7");
      const result = parsePaginationParams(params);
      expect(result.limit).toBe(25);
    });

    it("should handle float values for page", () => {
      const params = new URLSearchParams("page=2.8");
      const result = parsePaginationParams(params);
      expect(result.page).toBe(2);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty search params", () => {
      const params = new URLSearchParams();
      const result = parsePaginationParams(params);
      expect(result.limit).toBe(20);
      expect(result.startAfter).toBeUndefined();
      expect(result.page).toBeUndefined();
    });

    it("should handle limit of 1", () => {
      const params = new URLSearchParams("limit=1");
      const result = parsePaginationParams(params);
      expect(result.limit).toBe(1);
    });

    it("should prefer startAfter over cursor when both provided", () => {
      const params = new URLSearchParams("startAfter=abc&cursor=xyz");
      const result = parsePaginationParams(params);
      expect(result.startAfter).toBe("abc");
    });

    it("should handle very large limit values", () => {
      const params = new URLSearchParams("limit=999999");
      const result = parsePaginationParams(params, 20, 100);
      expect(result.limit).toBe(100);
    });

    it("should handle whitespace in parameters", () => {
      const params = new URLSearchParams("limit= 50 ");
      const result = parsePaginationParams(params);
      expect(result.limit).toBe(50);
    });
  });
});

describe("applyCursorPagination", () => {
  let mockQuery: any;
  let mockGetStartDoc: jest.Mock;

  beforeEach(() => {
    mockQuery = {
      startAfter: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };
    mockGetStartDoc = jest.fn();
  });

  describe("Basic Pagination", () => {
    it("should fetch correct number of documents", async () => {
      const docs = Array.from({ length: 5 }, (_, i) =>
        mockDocSnapshot(`doc${i}`, { value: i })
      );
      mockQuery.get.mockResolvedValue(mockQuerySnapshot(docs));

      const config: PaginationConfig = { limit: 5 };
      const result = await applyCursorPagination(mockQuery, config);

      expect(mockQuery.limit).toHaveBeenCalledWith(6); // limit + 1
      expect(result.docs.length).toBe(5);
      expect(result.hasNextPage).toBe(false);
      expect(result.nextCursor).toBeNull();
    });

    it("should detect next page when more docs available", async () => {
      const docs = Array.from({ length: 11 }, (_, i) =>
        mockDocSnapshot(`doc${i}`, { value: i })
      );
      mockQuery.get.mockResolvedValue(mockQuerySnapshot(docs));

      const config: PaginationConfig = { limit: 10 };
      const result = await applyCursorPagination(mockQuery, config);

      expect(result.docs.length).toBe(10);
      expect(result.hasNextPage).toBe(true);
      expect(result.nextCursor).toBe("doc9");
    });

    it("should use default limit when not specified", async () => {
      const docs = Array.from({ length: 5 }, (_, i) =>
        mockDocSnapshot(`doc${i}`, { value: i })
      );
      mockQuery.get.mockResolvedValue(mockQuerySnapshot(docs));

      const config: PaginationConfig = { defaultLimit: 15 };
      const result = await applyCursorPagination(mockQuery, config);

      expect(mockQuery.limit).toHaveBeenCalledWith(16);
    });
  });

  describe("Cursor Handling", () => {
    it("should apply cursor when provided with valid doc", async () => {
      const startDoc = mockDocSnapshot("start123", { value: 0 });
      mockGetStartDoc.mockResolvedValue(startDoc);

      const docs = Array.from({ length: 5 }, (_, i) =>
        mockDocSnapshot(`doc${i}`, { value: i })
      );
      mockQuery.get.mockResolvedValue(mockQuerySnapshot(docs));

      const config: PaginationConfig = {
        limit: 5,
        startAfter: "start123",
      };
      await applyCursorPagination(mockQuery, config, mockGetStartDoc);

      expect(mockGetStartDoc).toHaveBeenCalledWith("start123");
      expect(mockQuery.startAfter).toHaveBeenCalledWith(startDoc);
    });

    it("should skip invalid cursor and continue", async () => {
      mockGetStartDoc.mockResolvedValue(null);

      const docs = Array.from({ length: 5 }, (_, i) =>
        mockDocSnapshot(`doc${i}`, { value: i })
      );
      mockQuery.get.mockResolvedValue(mockQuerySnapshot(docs));

      const config: PaginationConfig = {
        limit: 5,
        startAfter: "invalid",
      };
      const result = await applyCursorPagination(
        mockQuery,
        config,
        mockGetStartDoc
      );

      expect(mockQuery.startAfter).not.toHaveBeenCalled();
      expect(result.docs.length).toBe(5);
    });

    it("should handle cursor doc that doesn't exist", async () => {
      const nonExistentDoc = mockDocSnapshot("ghost", {}, false);
      mockGetStartDoc.mockResolvedValue(nonExistentDoc);

      const docs = Array.from({ length: 5 }, (_, i) =>
        mockDocSnapshot(`doc${i}`, { value: i })
      );
      mockQuery.get.mockResolvedValue(mockQuerySnapshot(docs));

      const config: PaginationConfig = {
        limit: 5,
        startAfter: "ghost",
      };
      await applyCursorPagination(mockQuery, config, mockGetStartDoc);

      expect(mockQuery.startAfter).not.toHaveBeenCalled();
    });

    it("should handle cursor fetch error gracefully", async () => {
      mockGetStartDoc.mockRejectedValue(new Error("Cursor error"));

      const docs = Array.from({ length: 5 }, (_, i) =>
        mockDocSnapshot(`doc${i}`, { value: i })
      );
      mockQuery.get.mockResolvedValue(mockQuerySnapshot(docs));

      const config: PaginationConfig = {
        limit: 5,
        startAfter: "bad",
      };
      const result = await applyCursorPagination(
        mockQuery,
        config,
        mockGetStartDoc
      );

      expect(result.docs.length).toBe(5);
    });
  });

  describe("Next Cursor Generation", () => {
    it("should return last document ID as next cursor", async () => {
      const docs = Array.from({ length: 6 }, (_, i) =>
        mockDocSnapshot(`doc${i}`, { value: i })
      );
      mockQuery.get.mockResolvedValue(mockQuerySnapshot(docs));

      const config: PaginationConfig = { limit: 5 };
      const result = await applyCursorPagination(mockQuery, config);

      expect(result.nextCursor).toBe("doc4");
    });

    it("should return null cursor when no next page", async () => {
      const docs = Array.from({ length: 3 }, (_, i) =>
        mockDocSnapshot(`doc${i}`, { value: i })
      );
      mockQuery.get.mockResolvedValue(mockQuerySnapshot(docs));

      const config: PaginationConfig = { limit: 5 };
      const result = await applyCursorPagination(mockQuery, config);

      expect(result.nextCursor).toBeNull();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty result set", async () => {
      mockQuery.get.mockResolvedValue(mockQuerySnapshot([]));

      const config: PaginationConfig = { limit: 5 };
      const result = await applyCursorPagination(mockQuery, config);

      expect(result.docs).toEqual([]);
      expect(result.hasNextPage).toBe(false);
      expect(result.nextCursor).toBeNull();
    });

    it("should handle single document result", async () => {
      const docs = [mockDocSnapshot("doc1", { value: 1 })];
      mockQuery.get.mockResolvedValue(mockQuerySnapshot(docs));

      const config: PaginationConfig = { limit: 5 };
      const result = await applyCursorPagination(mockQuery, config);

      expect(result.docs.length).toBe(1);
      expect(result.hasNextPage).toBe(false);
    });

    it("should handle limit of 1", async () => {
      const docs = [
        mockDocSnapshot("doc1", { value: 1 }),
        mockDocSnapshot("doc2", { value: 2 }),
      ];
      mockQuery.get.mockResolvedValue(mockQuerySnapshot(docs));

      const config: PaginationConfig = { limit: 1 };
      const result = await applyCursorPagination(mockQuery, config);

      expect(result.docs.length).toBe(1);
      expect(result.hasNextPage).toBe(true);
      expect(result.nextCursor).toBe("doc1");
    });

    it("should not call getStartDoc when no cursor provided", async () => {
      const docs = Array.from({ length: 5 }, (_, i) =>
        mockDocSnapshot(`doc${i}`, { value: i })
      );
      mockQuery.get.mockResolvedValue(mockQuerySnapshot(docs));

      const config: PaginationConfig = { limit: 5 };
      await applyCursorPagination(mockQuery, config, mockGetStartDoc);

      expect(mockGetStartDoc).not.toHaveBeenCalled();
    });
  });
});

describe("applyOffsetPagination", () => {
  let mockQuery: any;

  beforeEach(() => {
    mockQuery = {
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };
  });

  describe("Basic Offset Pagination", () => {
    it("should apply correct offset for page 1", async () => {
      const docs = Array.from({ length: 10 }, (_, i) =>
        mockDocSnapshot(`doc${i}`, { value: i })
      );
      mockQuery.get.mockResolvedValue(mockQuerySnapshot(docs));

      const config: PaginationConfig = { page: 1, limit: 10 };
      await applyOffsetPagination(mockQuery, config);

      expect(mockQuery.offset).toHaveBeenCalledWith(0);
      expect(mockQuery.limit).toHaveBeenCalledWith(11);
    });

    it("should apply correct offset for page 2", async () => {
      const docs = Array.from({ length: 10 }, (_, i) =>
        mockDocSnapshot(`doc${i}`, { value: i })
      );
      mockQuery.get.mockResolvedValue(mockQuerySnapshot(docs));

      const config: PaginationConfig = { page: 2, limit: 10 };
      await applyOffsetPagination(mockQuery, config);

      expect(mockQuery.offset).toHaveBeenCalledWith(10);
    });

    it("should apply correct offset for page 5 with limit 20", async () => {
      const docs = Array.from({ length: 20 }, (_, i) =>
        mockDocSnapshot(`doc${i}`, { value: i })
      );
      mockQuery.get.mockResolvedValue(mockQuerySnapshot(docs));

      const config: PaginationConfig = { page: 5, limit: 20 };
      await applyOffsetPagination(mockQuery, config);

      expect(mockQuery.offset).toHaveBeenCalledWith(80);
    });

    it("should default to page 1 when not specified", async () => {
      const docs = Array.from({ length: 10 }, (_, i) =>
        mockDocSnapshot(`doc${i}`, { value: i })
      );
      mockQuery.get.mockResolvedValue(mockQuerySnapshot(docs));

      const config: PaginationConfig = { limit: 10 };
      const result = await applyOffsetPagination(mockQuery, config);

      expect(result.page).toBe(1);
      expect(mockQuery.offset).toHaveBeenCalledWith(0);
    });
  });

  describe("Page Navigation Detection", () => {
    it("should detect next page exists", async () => {
      const docs = Array.from({ length: 11 }, (_, i) =>
        mockDocSnapshot(`doc${i}`, { value: i })
      );
      mockQuery.get.mockResolvedValue(mockQuerySnapshot(docs));

      const config: PaginationConfig = { page: 1, limit: 10 };
      const result = await applyOffsetPagination(mockQuery, config);

      expect(result.hasNextPage).toBe(true);
      expect(result.docs.length).toBe(10);
    });

    it("should detect no next page", async () => {
      const docs = Array.from({ length: 10 }, (_, i) =>
        mockDocSnapshot(`doc${i}`, { value: i })
      );
      mockQuery.get.mockResolvedValue(mockQuerySnapshot(docs));

      const config: PaginationConfig = { page: 1, limit: 10 };
      const result = await applyOffsetPagination(mockQuery, config);

      expect(result.hasNextPage).toBe(false);
    });

    it("should detect previous page exists on page 2", async () => {
      const docs = Array.from({ length: 10 }, (_, i) =>
        mockDocSnapshot(`doc${i}`, { value: i })
      );
      mockQuery.get.mockResolvedValue(mockQuerySnapshot(docs));

      const config: PaginationConfig = { page: 2, limit: 10 };
      const result = await applyOffsetPagination(mockQuery, config);

      expect(result.hasPrevPage).toBe(true);
    });

    it("should detect no previous page on page 1", async () => {
      const docs = Array.from({ length: 10 }, (_, i) =>
        mockDocSnapshot(`doc${i}`, { value: i })
      );
      mockQuery.get.mockResolvedValue(mockQuerySnapshot(docs));

      const config: PaginationConfig = { page: 1, limit: 10 };
      const result = await applyOffsetPagination(mockQuery, config);

      expect(result.hasPrevPage).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty results", async () => {
      mockQuery.get.mockResolvedValue(mockQuerySnapshot([]));

      const config: PaginationConfig = { page: 1, limit: 10 };
      const result = await applyOffsetPagination(mockQuery, config);

      expect(result.docs).toEqual([]);
      expect(result.hasNextPage).toBe(false);
      expect(result.hasPrevPage).toBe(false);
    });

    it("should handle last page with partial results", async () => {
      const docs = Array.from({ length: 5 }, (_, i) =>
        mockDocSnapshot(`doc${i}`, { value: i })
      );
      mockQuery.get.mockResolvedValue(mockQuerySnapshot(docs));

      const config: PaginationConfig = { page: 3, limit: 10 };
      const result = await applyOffsetPagination(mockQuery, config);

      expect(result.docs.length).toBe(5);
      expect(result.hasNextPage).toBe(false);
      expect(result.hasPrevPage).toBe(true);
    });

    it("should use default limit when not specified", async () => {
      const docs = Array.from({ length: 20 }, (_, i) =>
        mockDocSnapshot(`doc${i}`, { value: i })
      );
      mockQuery.get.mockResolvedValue(mockQuerySnapshot(docs));

      const config: PaginationConfig = { page: 1, defaultLimit: 20 };
      await applyOffsetPagination(mockQuery, config);

      expect(mockQuery.limit).toHaveBeenCalledWith(21);
    });
  });
});

describe("Pagination Metadata Functions", () => {
  describe("createCursorPaginationMeta", () => {
    it("should create correct cursor pagination metadata", () => {
      const meta = createCursorPaginationMeta(10, 20, true, "cursor123");

      expect(meta).toEqual({
        count: 10,
        limit: 20,
        hasNextPage: true,
        nextCursor: "cursor123",
      });
    });

    it("should handle null cursor", () => {
      const meta = createCursorPaginationMeta(5, 10, false, null);

      expect(meta.nextCursor).toBeNull();
      expect(meta.hasNextPage).toBe(false);
    });

    it("should handle zero count", () => {
      const meta = createCursorPaginationMeta(0, 10, false, null);

      expect(meta.count).toBe(0);
    });
  });

  describe("createOffsetPaginationMeta", () => {
    it("should create correct offset pagination metadata with total", () => {
      const meta = createOffsetPaginationMeta(2, 10, 10, true, true, 100);

      expect(meta).toEqual({
        page: 2,
        limit: 10,
        total: 100,
        hasNextPage: true,
        hasPrevPage: true,
        totalPages: 10,
      });
    });

    it("should calculate total pages correctly", () => {
      const meta = createOffsetPaginationMeta(1, 15, 15, true, false, 47);

      expect(meta.totalPages).toBe(4); // Math.ceil(47/15)
    });

    it("should handle undefined total", () => {
      const meta = createOffsetPaginationMeta(1, 10, 10, true, false);

      expect(meta.total).toBeUndefined();
      expect(meta.totalPages).toBeUndefined();
    });

    it("should handle zero total", () => {
      const meta = createOffsetPaginationMeta(1, 10, 0, false, false, 0);

      expect(meta.total).toBe(0);
      expect(meta.totalPages).toBe(0);
    });

    it("should handle single page scenario", () => {
      const meta = createOffsetPaginationMeta(1, 10, 5, false, false, 5);

      expect(meta.totalPages).toBe(1);
      expect(meta.hasNextPage).toBe(false);
      expect(meta.hasPrevPage).toBe(false);
    });
  });
});

describe("Paginated Response Functions", () => {
  describe("createCursorPaginatedResponse", () => {
    it("should create correct cursor paginated response", () => {
      const data = [{ id: 1 }, { id: 2 }];
      const response = createCursorPaginatedResponse(data, 10, true, "next123");

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.count).toBe(2);
      expect(response.pagination).toMatchObject({
        limit: 10,
        hasNextPage: true,
        nextCursor: "next123",
      });
    });

    it("should handle empty data array", () => {
      const response = createCursorPaginatedResponse([], 10, false, null);

      expect(response.data).toEqual([]);
      expect(response.count).toBe(0);
    });
  });

  describe("createOffsetPaginatedResponse", () => {
    it("should create correct offset paginated response with total", () => {
      const data = [{ id: 1 }, { id: 2 }];
      const response = createOffsetPaginatedResponse(
        data,
        2,
        10,
        true,
        true,
        50
      );

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.count).toBe(2);
      expect(response.pagination).toMatchObject({
        page: 2,
        limit: 10,
        total: 50,
        totalPages: 5,
      });
    });

    it("should handle last page correctly", () => {
      const data = [{ id: 1 }];
      const response = createOffsetPaginatedResponse(
        data,
        5,
        10,
        false,
        true,
        41
      );

      expect(response.pagination.hasNextPage).toBe(false);
      expect(response.pagination.hasPrevPage).toBe(true);
      expect(response.pagination.totalPages).toBe(5);
    });
  });
});

describe("executeCursorPaginatedQuery", () => {
  let mockQuery: any;
  let mockGetStartDoc: jest.Mock;
  let mockTransformDoc: jest.Mock;

  beforeEach(() => {
    mockQuery = {
      startAfter: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };
    mockGetStartDoc = jest.fn();
    mockTransformDoc = jest.fn((doc) => ({ id: doc.id, transformed: true }));
  });

  it("should execute query and return formatted response", async () => {
    const docs = Array.from({ length: 10 }, (_, i) =>
      mockDocSnapshot(`doc${i}`, { value: i })
    );
    mockQuery.get.mockResolvedValue(mockQuerySnapshot(docs));

    const params = new URLSearchParams("limit=10");
    const result = await executeCursorPaginatedQuery(
      mockQuery,
      params,
      mockGetStartDoc,
      mockTransformDoc
    );

    expect(result.success).toBe(true);
    expect(result.data.length).toBe(10);
    expect(result.data[0]).toMatchObject({ id: "doc0", transformed: true });
    expect(mockTransformDoc).toHaveBeenCalledTimes(10);
  });

  it("should apply cursor from params", async () => {
    const startDoc = mockDocSnapshot("start", { value: 0 });
    mockGetStartDoc.mockResolvedValue(startDoc);

    const docs = Array.from({ length: 5 }, (_, i) =>
      mockDocSnapshot(`doc${i}`, { value: i })
    );
    mockQuery.get.mockResolvedValue(mockQuerySnapshot(docs));

    const params = new URLSearchParams("limit=5&cursor=start");
    await executeCursorPaginatedQuery(
      mockQuery,
      params,
      mockGetStartDoc,
      mockTransformDoc
    );

    expect(mockGetStartDoc).toHaveBeenCalledWith("start");
  });

  it("should use custom default and max limits", async () => {
    const docs = Array.from({ length: 25 }, (_, i) =>
      mockDocSnapshot(`doc${i}`, { value: i })
    );
    mockQuery.get.mockResolvedValue(mockQuerySnapshot(docs));

    const params = new URLSearchParams();
    const result = await executeCursorPaginatedQuery(
      mockQuery,
      params,
      mockGetStartDoc,
      mockTransformDoc,
      25,
      50
    );

    expect(result.pagination.limit).toBe(25);
  });
});

describe("executeOffsetPaginatedQuery", () => {
  let mockQuery: any;
  let mockTransformDoc: jest.Mock;

  beforeEach(() => {
    mockQuery = {
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };
    mockTransformDoc = jest.fn((doc) => ({ id: doc.id, transformed: true }));
  });

  it("should execute query and return formatted response", async () => {
    const docs = Array.from({ length: 10 }, (_, i) =>
      mockDocSnapshot(`doc${i}`, { value: i })
    );
    mockQuery.get.mockResolvedValue(mockQuerySnapshot(docs));

    const params = new URLSearchParams("page=1&limit=10");
    const result = await executeOffsetPaginatedQuery(
      mockQuery,
      params,
      mockTransformDoc
    );

    expect(result.success).toBe(true);
    expect(result.data.length).toBe(10);
    expect(result.pagination.page).toBe(1);
    expect(mockTransformDoc).toHaveBeenCalledTimes(10);
  });

  it("should apply correct page offset", async () => {
    const docs = Array.from({ length: 10 }, (_, i) =>
      mockDocSnapshot(`doc${i}`, { value: i })
    );
    mockQuery.get.mockResolvedValue(mockQuerySnapshot(docs));

    const params = new URLSearchParams("page=3&limit=10");
    await executeOffsetPaginatedQuery(mockQuery, params, mockTransformDoc);

    expect(mockQuery.offset).toHaveBeenCalledWith(20);
  });

  it("should include total in response", async () => {
    const docs = Array.from({ length: 10 }, (_, i) =>
      mockDocSnapshot(`doc${i}`, { value: i })
    );
    mockQuery.get.mockResolvedValue(mockQuerySnapshot(docs));

    const params = new URLSearchParams("page=2&limit=20");
    const result = await executeOffsetPaginatedQuery(
      mockQuery,
      params,
      mockTransformDoc,
      20,
      100,
      150
    );

    expect(result.pagination.total).toBe(150);
    expect(result.pagination.totalPages).toBe(8); // Math.ceil(150/20)
  });
  it("should handle empty results", async () => {
    mockQuery.get.mockResolvedValue(mockQuerySnapshot([]));

    const params = new URLSearchParams("page=10&limit=10");
    const result = await executeOffsetPaginatedQuery(
      mockQuery,
      params,
      mockTransformDoc
    );

    expect(result.data).toEqual([]);
    expect(result.count).toBe(0);
  });
});
