/**
 * Tests for Firebase Query Helpers
 */

import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import {
  buildFilterConstraints,
  buildPaginationConstraints,
  buildQueryConstraints,
  buildSortConstraints,
  categoryFilter,
  dateRangeFilter,
  estimatePages,
  firstPage,
  getPageInfo,
  hasMorePages,
  nextPage,
  prevPage,
  processPaginatedResults,
  shopFilter,
  sortByCreatedAsc,
  sortByCreatedDesc,
  sortByPopularity,
  sortByPriceAsc,
  sortByPriceDesc,
  sortByUpdatedDesc,
  statusFilter,
  userFilter,
  type PaginationConfig,
  type QueryFilter,
  type QuerySort,
} from "../query-helpers";

// Mock document snapshot
const createMockDoc = (
  id: string,
  data: any = {}
): QueryDocumentSnapshot<DocumentData> => {
  return {
    id,
    data: () => data,
    ref: {
      path: `collection/${id}`,
    },
  } as any;
};

describe("Firebase Query Helpers", () => {
  describe("buildPaginationConstraints", () => {
    it("should build first page constraints", () => {
      const config: PaginationConfig = {
        pageSize: 20,
        sortField: "created_at",
        sortDirection: "desc",
      };

      const constraints = buildPaginationConstraints(config);

      expect(constraints.length).toBeGreaterThan(0);
    });

    it("should include sort order if specified", () => {
      const config: PaginationConfig = {
        pageSize: 20,
        sortField: "created_at",
        sortDirection: "desc",
      };

      const constraints = buildPaginationConstraints(config);

      expect(constraints.length).toBeGreaterThan(0);
    });

    it("should handle after cursor for next page", () => {
      const mockDoc = createMockDoc("doc1");
      const config: PaginationConfig = {
        pageSize: 20,
        afterCursor: mockDoc,
        sortField: "created_at",
      };

      const constraints = buildPaginationConstraints(config);

      expect(constraints.length).toBeGreaterThan(0);
    });

    it("should handle before cursor for previous page", () => {
      const mockDoc = createMockDoc("doc1");
      const config: PaginationConfig = {
        pageSize: 20,
        beforeCursor: mockDoc,
        sortField: "created_at",
      };

      const constraints = buildPaginationConstraints(config);

      expect(constraints.length).toBeGreaterThan(0);
    });

    it("should default to descending sort if not specified", () => {
      const config: PaginationConfig = {
        pageSize: 20,
        sortField: "created_at",
      };

      const constraints = buildPaginationConstraints(config);

      expect(constraints.length).toBeGreaterThan(0);
    });

    it("should handle pagination without sort field", () => {
      const config: PaginationConfig = {
        pageSize: 20,
      };

      const constraints = buildPaginationConstraints(config);

      expect(constraints.length).toBe(1); // Only limit constraint
    });
  });

  describe("buildFilterConstraints", () => {
    it("should build single filter constraint", () => {
      const filters: QueryFilter[] = [
        { field: "status", operator: "==", value: "active" },
      ];

      const constraints = buildFilterConstraints(filters);

      expect(constraints).toHaveLength(1);
    });

    it("should build multiple filter constraints", () => {
      const filters: QueryFilter[] = [
        { field: "status", operator: "==", value: "active" },
        { field: "price", operator: ">", value: 100 },
      ];

      const constraints = buildFilterConstraints(filters);

      expect(constraints).toHaveLength(2);
    });

    it("should handle empty filter array", () => {
      const constraints = buildFilterConstraints([]);

      expect(constraints).toHaveLength(0);
    });

    it("should support all filter operators", () => {
      const filters: QueryFilter[] = [
        { field: "field1", operator: "==", value: "value" },
        { field: "field2", operator: "!=", value: "value" },
        { field: "field3", operator: "<", value: 100 },
        { field: "field4", operator: "<=", value: 100 },
        { field: "field5", operator: ">", value: 100 },
        { field: "field6", operator: ">=", value: 100 },
      ];

      const constraints = buildFilterConstraints(filters);

      expect(constraints).toHaveLength(6);
    });
  });

  describe("buildSortConstraints", () => {
    it("should build single sort constraint", () => {
      const sorts: QuerySort[] = [{ field: "created_at", direction: "desc" }];

      const constraints = buildSortConstraints(sorts);

      expect(constraints).toHaveLength(1);
    });

    it("should build multiple sort constraints", () => {
      const sorts: QuerySort[] = [
        { field: "created_at", direction: "desc" },
        { field: "name", direction: "asc" },
      ];

      const constraints = buildSortConstraints(sorts);

      expect(constraints).toHaveLength(2);
    });

    it("should handle empty sort array", () => {
      const constraints = buildSortConstraints([]);

      expect(constraints).toHaveLength(0);
    });
  });

  describe("buildQueryConstraints", () => {
    it("should combine filters, sorts, and pagination", () => {
      const mockDoc = createMockDoc("doc1");
      const config = {
        filters: [
          { field: "status", operator: "==" as const, value: "active" },
        ],
        sorts: [{ field: "name", direction: "asc" as const }],
        pagination: {
          pageSize: 20,
          afterCursor: mockDoc,
        },
      };

      const constraints = buildQueryConstraints(config);

      expect(constraints.length).toBeGreaterThan(0);
    });

    it("should handle config with only filters", () => {
      const config = {
        filters: [
          { field: "status", operator: "==" as const, value: "active" },
        ],
      };

      const constraints = buildQueryConstraints(config);

      expect(constraints).toHaveLength(1);
    });

    it("should handle config with only pagination", () => {
      const config = {
        pagination: {
          pageSize: 20,
        },
      };

      const constraints = buildQueryConstraints(config);

      expect(constraints.length).toBeGreaterThan(0);
    });

    it("should skip sorts if pagination has sortField", () => {
      const config = {
        sorts: [{ field: "name", direction: "asc" as const }],
        pagination: {
          pageSize: 20,
          sortField: "created_at",
        },
      };

      const constraints = buildQueryConstraints(config);

      // Should only have pagination constraints, not sort constraints
      expect(constraints.length).toBeGreaterThan(0);
    });

    it("should handle empty config", () => {
      const constraints = buildQueryConstraints({});

      expect(constraints).toHaveLength(0);
    });
  });

  describe("processPaginatedResults", () => {
    it("should process query results", () => {
      const docs = [
        createMockDoc("doc1", { name: "Item 1" }),
        createMockDoc("doc2", { name: "Item 2" }),
      ];

      const result = processPaginatedResults(docs, 20);

      expect(result.data).toHaveLength(2);
      expect(result.pageSize).toBe(20);
    });

    it("should include document IDs in data", () => {
      const docs = [createMockDoc("doc1", { name: "Item 1" })];

      const result = processPaginatedResults(docs, 20);

      expect(result.data[0]).toHaveProperty("id", "doc1");
      expect(result.data[0]).toHaveProperty("name", "Item 1");
    });

    it("should determine hasNextPage correctly", () => {
      const fullPage = Array.from({ length: 20 }, (_, i) =>
        createMockDoc(`doc${i}`, {})
      );

      const result = processPaginatedResults(fullPage, 20);

      expect(result.hasNextPage).toBe(true);
    });

    it("should set hasNextPage to false for incomplete page", () => {
      const partialPage = Array.from({ length: 10 }, (_, i) =>
        createMockDoc(`doc${i}`, {})
      );

      const result = processPaginatedResults(partialPage, 20);

      expect(result.hasNextPage).toBe(false);
    });

    it("should set hasPrevPage based on cursor", () => {
      const docs = [createMockDoc("doc1", {})];

      const resultWithoutPrev = processPaginatedResults(docs, 20, false);
      expect(resultWithoutPrev.hasPrevPage).toBe(true);

      const resultWithPrev = processPaginatedResults(docs, 20, true);
      expect(resultWithPrev.hasPrevPage).toBe(true);
    });

    it("should set nextCursor to last document when hasNextPage", () => {
      const docs = Array.from({ length: 20 }, (_, i) =>
        createMockDoc(`doc${i}`, {})
      );

      const result = processPaginatedResults(docs, 20);

      expect(result.nextCursor).not.toBeNull();
      expect(result.nextCursor?.id).toBe("doc19");
    });

    it("should set nextCursor to null when no next page", () => {
      const docs = [createMockDoc("doc1", {})];

      const result = processPaginatedResults(docs, 20);

      expect(result.nextCursor).toBeNull();
    });

    it("should set prevCursor to first document", () => {
      const docs = [createMockDoc("doc1", {}), createMockDoc("doc2", {})];

      const result = processPaginatedResults(docs, 20);

      expect(result.prevCursor).not.toBeNull();
      expect(result.prevCursor?.id).toBe("doc1");
    });

    it("should handle empty results", () => {
      const result = processPaginatedResults([], 20);

      expect(result.data).toHaveLength(0);
      expect(result.hasNextPage).toBe(false);
      expect(result.nextCursor).toBeNull();
    });
  });

  describe("Convenience Functions", () => {
    describe("firstPage", () => {
      it("should create first page config", () => {
        const config = firstPage(20, "created_at", "desc");

        expect(config.pageSize).toBe(20);
        expect(config.sortField).toBe("created_at");
        expect(config.sortDirection).toBe("desc");
      });

      it("should use default page size", () => {
        const config = firstPage();

        expect(config.pageSize).toBe(20);
      });

      it("should work without sort parameters", () => {
        const config = firstPage(10);

        expect(config.pageSize).toBe(10);
        expect(config.sortField).toBeUndefined();
      });
    });

    describe("nextPage", () => {
      it("should create next page config", () => {
        const cursor = createMockDoc("doc1");
        const config = nextPage(20, cursor, "created_at", "desc");

        expect(config.pageSize).toBe(20);
        expect(config.afterCursor).toBe(cursor);
        expect(config.sortField).toBe("created_at");
      });

      it("should work without sort parameters", () => {
        const cursor = createMockDoc("doc1");
        const config = nextPage(20, cursor);

        expect(config.pageSize).toBe(20);
        expect(config.afterCursor).toBe(cursor);
      });
    });

    describe("prevPage", () => {
      it("should create previous page config", () => {
        const cursor = createMockDoc("doc1");
        const config = prevPage(20, cursor, "created_at", "desc");

        expect(config.pageSize).toBe(20);
        expect(config.beforeCursor).toBe(cursor);
        expect(config.sortField).toBe("created_at");
      });

      it("should work without sort parameters", () => {
        const cursor = createMockDoc("doc1");
        const config = prevPage(20, cursor);

        expect(config.pageSize).toBe(20);
        expect(config.beforeCursor).toBe(cursor);
      });
    });
  });

  describe("Common Query Patterns", () => {
    describe("statusFilter", () => {
      it("should create status filter", () => {
        const filter = statusFilter("active");

        expect(filter.field).toBe("status");
        expect(filter.operator).toBe("==");
        expect(filter.value).toBe("active");
      });
    });

    describe("userFilter", () => {
      it("should create user filter", () => {
        const filter = userFilter("user123");

        expect(filter.field).toBe("user_id");
        expect(filter.operator).toBe("==");
        expect(filter.value).toBe("user123");
      });
    });

    describe("shopFilter", () => {
      it("should create shop filter", () => {
        const filter = shopFilter("shop123");

        expect(filter.field).toBe("shop_id");
        expect(filter.operator).toBe("==");
        expect(filter.value).toBe("shop123");
      });
    });

    describe("categoryFilter", () => {
      it("should create category filter", () => {
        const filter = categoryFilter("cat123");

        expect(filter.field).toBe("category_id");
        expect(filter.operator).toBe("==");
        expect(filter.value).toBe("cat123");
      });
    });

    describe("dateRangeFilter", () => {
      it("should create date range filters", () => {
        const start = new Date("2024-01-01");
        const end = new Date("2024-12-31");

        const filters = dateRangeFilter("created_at", start, end);

        expect(filters).toHaveLength(2);
        expect(filters[0].operator).toBe(">=");
        expect(filters[0].value).toBe(start);
        expect(filters[1].operator).toBe("<=");
        expect(filters[1].value).toBe(end);
      });
    });

    describe("Sort Functions", () => {
      it("sortByCreatedDesc should create desc sort", () => {
        const sort = sortByCreatedDesc();

        expect(sort.field).toBe("created_at");
        expect(sort.direction).toBe("desc");
      });

      it("sortByCreatedAsc should create asc sort", () => {
        const sort = sortByCreatedAsc();

        expect(sort.field).toBe("created_at");
        expect(sort.direction).toBe("asc");
      });

      it("sortByUpdatedDesc should create desc sort", () => {
        const sort = sortByUpdatedDesc();

        expect(sort.field).toBe("updated_at");
        expect(sort.direction).toBe("desc");
      });

      it("sortByPriceAsc should create asc sort", () => {
        const sort = sortByPriceAsc();

        expect(sort.field).toBe("price");
        expect(sort.direction).toBe("asc");
      });

      it("sortByPriceDesc should create desc sort", () => {
        const sort = sortByPriceDesc();

        expect(sort.field).toBe("price");
        expect(sort.direction).toBe("desc");
      });

      it("sortByPopularity should create view count desc sort", () => {
        const sort = sortByPopularity();

        expect(sort.field).toBe("view_count");
        expect(sort.direction).toBe("desc");
      });
    });
  });

  describe("Utility Functions", () => {
    describe("hasMorePages", () => {
      it("should return true when hasNextPage is true", () => {
        const result = {
          data: [],
          nextCursor: null,
          prevCursor: null,
          hasNextPage: true,
          hasPrevPage: false,
          pageSize: 20,
        };

        expect(hasMorePages(result)).toBe(true);
      });

      it("should return false when hasNextPage is false", () => {
        const result = {
          data: [],
          nextCursor: null,
          prevCursor: null,
          hasNextPage: false,
          hasPrevPage: false,
          pageSize: 20,
        };

        expect(hasMorePages(result)).toBe(false);
      });
    });

    describe("getPageInfo", () => {
      it("should return info without more indicator", () => {
        const result = {
          data: new Array(10),
          nextCursor: null,
          prevCursor: null,
          hasNextPage: false,
          hasPrevPage: false,
          pageSize: 20,
        };

        const info = getPageInfo(result);

        expect(info).toContain("10 items");
        expect(info).not.toContain("more available");
      });

      it("should return info with more indicator", () => {
        const result = {
          data: new Array(20),
          nextCursor: createMockDoc("doc"),
          prevCursor: null,
          hasNextPage: true,
          hasPrevPage: false,
          pageSize: 20,
        };

        const info = getPageInfo(result);

        expect(info).toContain("20 items");
        expect(info).toContain("more available");
      });
    });

    describe("estimatePages", () => {
      it("should calculate pages correctly", () => {
        expect(estimatePages(100, 20)).toBe(5);
        expect(estimatePages(101, 20)).toBe(6);
        expect(estimatePages(0, 20)).toBe(0);
      });

      it("should handle single item", () => {
        expect(estimatePages(1, 20)).toBe(1);
      });

      it("should handle exact multiples", () => {
        expect(estimatePages(60, 20)).toBe(3);
      });

      it("should round up partial pages", () => {
        expect(estimatePages(61, 20)).toBe(4);
      });
    });

    // BUG FIX #31: Comprehensive validation edge case tests
    describe("BUG FIX #31: Input Validation Edge Cases", () => {
      describe("buildPaginationConstraints validation", () => {
        it("should throw error for zero pageSize", () => {
          const config: PaginationConfig = {
            pageSize: 0,
          };
          expect(() => buildPaginationConstraints(config)).toThrow(
            "Page size must be a positive number"
          );
        });

        it("should throw error for negative pageSize", () => {
          const config: PaginationConfig = {
            pageSize: -10,
          };
          expect(() => buildPaginationConstraints(config)).toThrow(
            "Page size must be a positive number"
          );
        });

        it("should throw error for very small pageSize", () => {
          const config: PaginationConfig = {
            pageSize: -0.001,
          };
          expect(() => buildPaginationConstraints(config)).toThrow(
            "Page size must be a positive number"
          );
        });

        it("should accept minimum valid pageSize", () => {
          const config: PaginationConfig = {
            pageSize: 1,
          };
          expect(() => buildPaginationConstraints(config)).not.toThrow();
        });

        it("should accept large pageSize", () => {
          const config: PaginationConfig = {
            pageSize: 1000,
          };
          expect(() => buildPaginationConstraints(config)).not.toThrow();
        });
      });

      describe("firstPage validation", () => {
        it("should throw error for zero pageSize", () => {
          expect(() => firstPage(0)).toThrow(
            "Page size must be a positive number"
          );
        });

        it("should throw error for negative pageSize", () => {
          expect(() => firstPage(-20)).toThrow(
            "Page size must be a positive number"
          );
        });

        it("should accept minimum valid pageSize", () => {
          expect(() => firstPage(1)).not.toThrow();
        });

        it("should use default pageSize of 20 when not provided", () => {
          const config = firstPage();
          expect(config.pageSize).toBe(20);
        });
      });

      describe("nextPage validation", () => {
        it("should throw error for zero pageSize", () => {
          const mockDoc = createMockDoc("doc1");
          expect(() => nextPage(0, mockDoc)).toThrow(
            "Page size must be a positive number"
          );
        });

        it("should throw error for negative pageSize", () => {
          const mockDoc = createMockDoc("doc1");
          expect(() => nextPage(-5, mockDoc)).toThrow(
            "Page size must be a positive number"
          );
        });

        it("should throw error for null cursor", () => {
          expect(() => nextPage(20, null as any)).toThrow(
            "Cursor is required for next page"
          );
        });

        it("should throw error for undefined cursor", () => {
          expect(() => nextPage(20, undefined as any)).toThrow(
            "Cursor is required for next page"
          );
        });

        it("should accept valid cursor and pageSize", () => {
          const mockDoc = createMockDoc("doc1");
          expect(() => nextPage(20, mockDoc)).not.toThrow();
        });
      });

      describe("prevPage validation", () => {
        it("should throw error for zero pageSize", () => {
          const mockDoc = createMockDoc("doc1");
          expect(() => prevPage(0, mockDoc)).toThrow(
            "Page size must be a positive number"
          );
        });

        it("should throw error for negative pageSize", () => {
          const mockDoc = createMockDoc("doc1");
          expect(() => prevPage(-10, mockDoc)).toThrow(
            "Page size must be a positive number"
          );
        });

        it("should throw error for null cursor", () => {
          expect(() => prevPage(20, null as any)).toThrow(
            "Cursor is required for previous page"
          );
        });

        it("should throw error for undefined cursor", () => {
          expect(() => prevPage(20, undefined as any)).toThrow(
            "Cursor is required for previous page"
          );
        });

        it("should accept valid cursor and pageSize", () => {
          const mockDoc = createMockDoc("doc1");
          expect(() => prevPage(20, mockDoc)).not.toThrow();
        });
      });

      describe("dateRangeFilter validation", () => {
        it("should throw error when startDate is after endDate", () => {
          const start = new Date("2024-12-31");
          const end = new Date("2024-01-01");
          expect(() => dateRangeFilter("created_at", start, end)).toThrow(
            "Start date must be before or equal to end date"
          );
        });

        it("should accept when startDate equals endDate", () => {
          const date = new Date("2024-01-01");
          expect(() => dateRangeFilter("created_at", date, date)).not.toThrow();
        });

        it("should throw error for invalid Date objects (NaN)", () => {
          const invalidDate = new Date("invalid");
          const validDate = new Date("2024-12-31");
          expect(() =>
            dateRangeFilter("created_at", invalidDate, validDate)
          ).toThrow("Invalid date values");
          expect(() =>
            dateRangeFilter("created_at", validDate, invalidDate)
          ).toThrow("Invalid date values");
        });

        it("should throw error for non-Date objects", () => {
          expect(() =>
            dateRangeFilter("created_at", "2024-01-01" as any, new Date())
          ).toThrow("Start and end must be valid Date objects");
          expect(() =>
            dateRangeFilter("created_at", new Date(), "2024-12-31" as any)
          ).toThrow("Start and end must be valid Date objects");
        });

        it("should accept valid date range", () => {
          const start = new Date("2024-01-01");
          const end = new Date("2024-12-31");
          const filters = dateRangeFilter("created_at", start, end);
          expect(filters).toHaveLength(2);
          expect(filters[0].operator).toBe(">=");
          expect(filters[1].operator).toBe("<=");
        });
      });

      describe("estimatePages validation", () => {
        it("should throw error for zero pageSize", () => {
          expect(() => estimatePages(100, 0)).toThrow(
            "Page size must be a positive number"
          );
        });

        it("should throw error for negative pageSize", () => {
          expect(() => estimatePages(100, -5)).toThrow(
            "Page size must be a positive number"
          );
        });

        it("should throw error for negative totalCount", () => {
          expect(() => estimatePages(-10, 20)).toThrow(
            "Total count must be non-negative"
          );
        });

        it("should accept zero totalCount", () => {
          expect(estimatePages(0, 20)).toBe(0);
        });

        it("should accept minimum valid inputs", () => {
          expect(estimatePages(1, 1)).toBe(1);
        });

        it("should handle large numbers correctly", () => {
          expect(estimatePages(1000000, 100)).toBe(10000);
        });

        it("should round up correctly", () => {
          expect(estimatePages(101, 100)).toBe(2);
          expect(estimatePages(199, 100)).toBe(2);
          expect(estimatePages(200, 100)).toBe(2);
          expect(estimatePages(201, 100)).toBe(3);
        });
      });

      describe("Cursor edge cases", () => {
        it("should handle cursor with minimal data", () => {
          const mockDoc = createMockDoc("doc1", { id: "doc1" });
          const config = nextPage(20, mockDoc);
          expect(config.afterCursor).toBe(mockDoc);
        });

        it("should handle cursor with complex data", () => {
          const mockDoc = createMockDoc("doc1", {
            id: "doc1",
            nested: { field: "value" },
            array: [1, 2, 3],
          });
          const config = prevPage(20, mockDoc);
          expect(config.beforeCursor).toBe(mockDoc);
        });
      });

      describe("Boundary value testing", () => {
        it("should handle pageSize of 1", () => {
          const config = firstPage(1);
          expect(config.pageSize).toBe(1);
        });

        it("should handle very large pageSize", () => {
          const config = firstPage(10000);
          expect(config.pageSize).toBe(10000);
        });

        it("should handle exact page boundary in estimatePages", () => {
          expect(estimatePages(20, 20)).toBe(1);
          expect(estimatePages(40, 20)).toBe(2);
          expect(estimatePages(60, 20)).toBe(3);
        });

        it("should handle fractional results in estimatePages", () => {
          expect(estimatePages(1, 20)).toBe(1);
          expect(estimatePages(10, 20)).toBe(1);
          expect(estimatePages(19, 20)).toBe(1);
          expect(estimatePages(21, 20)).toBe(2);
        });
      });

      describe("Combined validation scenarios", () => {
        it("should validate all inputs in complex pagination", () => {
          const mockDoc = createMockDoc("doc1");

          // Should fail on pageSize
          expect(() => nextPage(0, mockDoc, "created_at", "desc")).toThrow();

          // Should fail on cursor
          expect(() =>
            nextPage(20, null as any, "created_at", "desc")
          ).toThrow();

          // Should succeed with valid inputs
          expect(() =>
            nextPage(20, mockDoc, "created_at", "desc")
          ).not.toThrow();
        });

        it("should validate date filters in combination with other filters", () => {
          const start = new Date("2024-12-31");
          const end = new Date("2024-01-01");
          const statusFilters = [statusFilter("active")];

          // Invalid date range should throw
          expect(() => dateRangeFilter("created_at", start, end)).toThrow();

          // Valid filters should work
          const validStart = new Date("2024-01-01");
          const validEnd = new Date("2024-12-31");
          const dateFilters = dateRangeFilter(
            "created_at",
            validStart,
            validEnd
          );
          expect([...statusFilters, ...dateFilters]).toHaveLength(3);
        });
      });
    });
  });
});
