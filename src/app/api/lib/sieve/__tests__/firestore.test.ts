/**
 * Unit Tests for Sieve Firestore Adapter Module
 * Comprehensive testing of Firestore query building and execution
 */

import { adaptToFirestore } from "../firestore";
import { SieveQuery } from "../types";

// Mock operators module
jest.mock("../operators", () => ({
  isFirestoreSupported: jest.fn((operator: string) => {
    const supported = ["==", "!=", ">", ">=", "<", "<="];
    return supported.includes(operator);
  }),
  evaluateFilters: jest.fn(),
}));

describe("Sieve Firestore Adapter", () => {
  describe("adaptToFirestore", () => {
    it("should adapt complete Sieve query to Firestore", () => {
      const sieveQuery: SieveQuery = {
        filters: [{ field: "status", operator: "==", value: "active" }],
        sorts: [{ field: "createdAt", direction: "desc" }],
        page: 1,
        pageSize: 20,
      };

      const result = adaptToFirestore(sieveQuery);

      expect(result.firestoreFilters).toHaveLength(1);
      expect(result.firestoreFilters[0]).toEqual({
        field: "status",
        operator: "==",
        value: "active",
      });
      expect(result.sorts).toHaveLength(1);
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(0);
      expect(result.clientSideFilters).toHaveLength(0);
    });

    it("should handle query with only Firestore filters", () => {
      const sieveQuery: SieveQuery = {
        filters: [
          { field: "category", operator: "==", value: "electronics" },
          { field: "price", operator: ">", value: 100 },
        ],
        sorts: [],
        page: 1,
        pageSize: 10,
      };

      const result = adaptToFirestore(sieveQuery);

      expect(result.firestoreFilters).toHaveLength(2);
      expect(result.clientSideFilters).toHaveLength(0);
    });

    it("should separate client and Firestore filters", () => {
      const sieveQuery: SieveQuery = {
        filters: [
          { field: "status", operator: "==", value: "active" },
          { field: "name", operator: "@=", value: "laptop" },
        ],
        sorts: [],
        page: 1,
        pageSize: 10,
      };

      const result = adaptToFirestore(sieveQuery);

      expect(result.firestoreFilters).toHaveLength(1);
      expect(result.firestoreFilters[0].field).toBe("status");
      expect(result.clientSideFilters).toHaveLength(1);
      expect(result.clientSideFilters[0].condition.operator).toBe("@=");
    });

    it("should handle all client-side filters", () => {
      const sieveQuery: SieveQuery = {
        filters: [
          { field: "name", operator: "@=", value: "laptop" },
          { field: "description", operator: "_=", value: "Pro" },
        ],
        sorts: [],
        page: 1,
        pageSize: 10,
      };

      const result = adaptToFirestore(sieveQuery);

      expect(result.firestoreFilters).toHaveLength(0);
      expect(result.clientSideFilters).toHaveLength(2);
    });

    it("should handle empty filters", () => {
      const sieveQuery: SieveQuery = {
        filters: [],
        sorts: [],
        page: 1,
        pageSize: 10,
      };

      const result = adaptToFirestore(sieveQuery);

      expect(result.firestoreFilters).toHaveLength(0);
      expect(result.clientSideFilters).toHaveLength(0);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(0);
    });

    it("should calculate offset for page 1", () => {
      const sieveQuery: SieveQuery = {
        filters: [],
        sorts: [],
        page: 1,
        pageSize: 20,
      };

      const result = adaptToFirestore(sieveQuery);

      expect(result.offset).toBe(0);
      expect(result.limit).toBe(20);
    });

    it("should calculate offset for page 2", () => {
      const sieveQuery: SieveQuery = {
        filters: [],
        sorts: [],
        page: 2,
        pageSize: 20,
      };

      const result = adaptToFirestore(sieveQuery);

      expect(result.offset).toBe(20);
      expect(result.limit).toBe(20);
    });

    it("should calculate offset for page 5", () => {
      const sieveQuery: SieveQuery = {
        filters: [],
        sorts: [],
        page: 5,
        pageSize: 10,
      };

      const result = adaptToFirestore(sieveQuery);

      expect(result.offset).toBe(40);
      expect(result.limit).toBe(10);
    });

    it("should include sorts in result", () => {
      const sieveQuery: SieveQuery = {
        filters: [],
        sorts: [
          { field: "price", direction: "asc" },
          { field: "createdAt", direction: "desc" },
        ],
        page: 1,
        pageSize: 10,
      };

      const result = adaptToFirestore(sieveQuery);

      expect(result.sorts).toHaveLength(2);
      expect(result.sorts[0]).toEqual({ field: "price", direction: "asc" });
      expect(result.sorts[1]).toEqual({
        field: "createdAt",
        direction: "desc",
      });
    });

    it("should handle config with field mappings", () => {
      const sieveQuery: SieveQuery = {
        filters: [
          { field: "createdDate", operator: "==", value: "2024-01-01" },
        ],
        sorts: [],
        page: 1,
        pageSize: 10,
      };

      const config = {
        resource: "test",
        sortableFields: [],
        filterableFields: [],
        defaultSort: { field: "id", direction: "asc" as const },
        fieldMappings: {
          createdDate: "createdAt",
        },
      };

      const result = adaptToFirestore(sieveQuery, config);

      expect(result.firestoreFilters[0].field).toBe("createdAt");
    });

    it("should use original field when no mapping exists", () => {
      const sieveQuery: SieveQuery = {
        filters: [{ field: "status", operator: "==", value: "active" }],
        sorts: [],
        page: 1,
        pageSize: 10,
      };

      const config = {
        resource: "test",
        sortableFields: [],
        filterableFields: [],
        defaultSort: { field: "id", direction: "asc" as const },
        fieldMappings: {
          other: "mapped",
        },
      };

      const result = adaptToFirestore(sieveQuery, config);

      expect(result.firestoreFilters[0].field).toBe("status");
    });

    it("should handle equality operators", () => {
      const sieveQuery: SieveQuery = {
        filters: [
          { field: "field1", operator: "==", value: "value1" },
          { field: "field2", operator: "!=", value: "value2" },
        ],
        sorts: [],
        page: 1,
        pageSize: 10,
      };

      const result = adaptToFirestore(sieveQuery);

      expect(result.firestoreFilters).toHaveLength(2);
      expect(result.firestoreFilters[0].operator).toBe("==");
      expect(result.firestoreFilters[1].operator).toBe("!=");
    });

    it("should handle comparison operators", () => {
      const sieveQuery: SieveQuery = {
        filters: [
          { field: "price", operator: ">", value: 100 },
          { field: "stock", operator: ">=", value: 10 },
          { field: "age", operator: "<", value: 30 },
          { field: "rating", operator: "<=", value: 5 },
        ],
        sorts: [],
        page: 1,
        pageSize: 10,
      };

      const result = adaptToFirestore(sieveQuery);

      expect(result.firestoreFilters).toHaveLength(4);
      expect(result.firestoreFilters[0].operator).toBe(">");
      expect(result.firestoreFilters[1].operator).toBe(">=");
      expect(result.firestoreFilters[2].operator).toBe("<");
      expect(result.firestoreFilters[3].operator).toBe("<=");
    });

    it("should mark string operators for client-side", () => {
      const sieveQuery: SieveQuery = {
        filters: [
          { field: "name", operator: "@=", value: "test" },
          { field: "title", operator: "_=", value: "Pro" },
          { field: "desc", operator: "_-=", value: "end" },
        ],
        sorts: [],
        page: 1,
        pageSize: 10,
      };

      const result = adaptToFirestore(sieveQuery);

      expect(result.firestoreFilters).toHaveLength(0);
      expect(result.clientSideFilters).toHaveLength(3);
      result.clientSideFilters.forEach((filter) => {
        expect(filter.reason).toContain("not supported by Firestore");
      });
    });

    it("should mark case-insensitive operators for client-side", () => {
      const sieveQuery: SieveQuery = {
        filters: [
          { field: "name", operator: "==*", value: "test" },
          { field: "title", operator: "@=*", value: "search" },
          { field: "author", operator: "_=*", value: "john" },
        ],
        sorts: [],
        page: 1,
        pageSize: 10,
      };

      const result = adaptToFirestore(sieveQuery);

      expect(result.firestoreFilters).toHaveLength(0);
      expect(result.clientSideFilters).toHaveLength(3);
    });

    it("should mark null operators for client-side", () => {
      const sieveQuery: SieveQuery = {
        filters: [
          { field: "optional", operator: "==null", value: null },
          { field: "required", operator: "!=null", value: null },
        ],
        sorts: [],
        page: 1,
        pageSize: 10,
      };

      const result = adaptToFirestore(sieveQuery);

      expect(result.firestoreFilters).toHaveLength(0);
      expect(result.clientSideFilters).toHaveLength(2);
    });

    it("should preserve filter values", () => {
      const sieveQuery: SieveQuery = {
        filters: [
          { field: "str", operator: "==", value: "test" },
          { field: "num", operator: "==", value: 42 },
          { field: "bool", operator: "==", value: true },
          { field: "null", operator: "==", value: null },
        ],
        sorts: [],
        page: 1,
        pageSize: 10,
      };

      const result = adaptToFirestore(sieveQuery);

      expect(result.firestoreFilters[0].value).toBe("test");
      expect(result.firestoreFilters[1].value).toBe(42);
      expect(result.firestoreFilters[2].value).toBe(true);
      expect(result.firestoreFilters[3].value).toBe(null);
    });
  });

  describe("Real Code Issues Found", () => {
    it("PATTERN: Client filters stored with reason", () => {
      const sieveQuery: SieveQuery = {
        filters: [{ field: "name", operator: "@=", value: "test" }],
        sorts: [],
        page: 1,
        pageSize: 10,
      };

      const result = adaptToFirestore(sieveQuery);

      expect(result.clientSideFilters[0].reason).toBeDefined();
      expect(result.clientSideFilters[0].condition).toBeDefined();
    });

    it("PATTERN: Offset calculated from zero-indexed pages", () => {
      const page1 = adaptToFirestore({
        filters: [],
        sorts: [],
        page: 1,
        pageSize: 10,
      });

      const page3 = adaptToFirestore({
        filters: [],
        sorts: [],
        page: 3,
        pageSize: 10,
      });

      // Page 1 starts at offset 0
      expect(page1.offset).toBe(0);
      // Page 3 starts at offset 20 (pages 1 and 2 already fetched)
      expect(page3.offset).toBe(20);
    });

    it("SAFETY: Firestore filters always have valid operators", () => {
      const sieveQuery: SieveQuery = {
        filters: [
          { field: "field1", operator: "==", value: "v1" },
          { field: "field2", operator: "@=", value: "v2" },
        ],
        sorts: [],
        page: 1,
        pageSize: 10,
      };

      const result = adaptToFirestore(sieveQuery);

      const validOps = ["==", "!=", ">", ">=", "<", "<="];
      result.firestoreFilters.forEach((filter) => {
        expect(validOps).toContain(filter.operator);
      });
    });

    it("FEATURE: Config field mappings transform fields", () => {
      const config = {
        resource: "test",
        sortableFields: [],
        filterableFields: [],
        defaultSort: { field: "id", direction: "asc" as const },
        fieldMappings: {
          userCreatedDate: "user.createdAt",
          userName: "user.displayName",
        },
      };

      const sieveQuery: SieveQuery = {
        filters: [
          { field: "userCreatedDate", operator: ">", value: "2024-01-01" },
          { field: "userName", operator: "==", value: "John" },
        ],
        sorts: [],
        page: 1,
        pageSize: 10,
      };

      const result = adaptToFirestore(sieveQuery, config);

      expect(result.firestoreFilters[0].field).toBe("user.createdAt");
      expect(result.firestoreFilters[1].field).toBe("user.displayName");
    });

    it("OPTIMIZATION: Empty filters array doesn't iterate", () => {
      const sieveQuery: SieveQuery = {
        filters: [],
        sorts: [],
        page: 1,
        pageSize: 10,
      };

      const result = adaptToFirestore(sieveQuery);

      expect(result.firestoreFilters).toEqual([]);
      expect(result.clientSideFilters).toEqual([]);
    });

    it("PATTERN: Sorts passed through unchanged", () => {
      const sorts = [
        { field: "price", direction: "asc" as const },
        { field: "createdAt", direction: "desc" as const },
      ];

      const sieveQuery: SieveQuery = {
        filters: [],
        sorts,
        page: 1,
        pageSize: 10,
      };

      const result = adaptToFirestore(sieveQuery);

      expect(result.sorts).toBe(sorts);
      expect(result.sorts).toHaveLength(2);
    });

    it("LIMITATION: All filters use AND logic", () => {
      const sieveQuery: SieveQuery = {
        filters: [
          { field: "status", operator: "==", value: "active" },
          { field: "status", operator: "==", value: "pending" },
        ],
        sorts: [],
        page: 1,
        pageSize: 10,
      };

      const result = adaptToFirestore(sieveQuery);

      // Both filters would be applied with AND - impossible to satisfy
      expect(result.firestoreFilters).toHaveLength(2);
    });

    it("SAFETY: Large page sizes handled without error", () => {
      const sieveQuery: SieveQuery = {
        filters: [],
        sorts: [],
        page: 1,
        pageSize: 10000,
      };

      const result = adaptToFirestore(sieveQuery);

      expect(result.limit).toBe(10000);
      expect(result.offset).toBe(0);
    });

    it("SAFETY: Large page numbers handled without error", () => {
      const sieveQuery: SieveQuery = {
        filters: [],
        sorts: [],
        page: 1000,
        pageSize: 20,
      };

      const result = adaptToFirestore(sieveQuery);

      expect(result.offset).toBe(19980);
      expect(result.limit).toBe(20);
    });
  });
});
