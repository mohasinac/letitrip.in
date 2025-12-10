/**
 * Unit Tests for Firebase Query Builders
 * Comprehensive testing of role-based filtering and query patterns
 */

import { Collections } from "../collections";
import {
  applyFilters,
  applyOrdering,
  applyPagination,
  buildQuery,
  getAuctionsQuery,
  getOrdersQuery,
  getProductsQuery,
  getShopsQuery,
  QueryFilter,
  QueryOptions,
  UserRole,
} from "../queries";

// Mock dependencies
jest.mock("../collections");

describe("Firebase Queries", () => {
  let mockQuery: any;
  let mockWhere: jest.Mock;
  let mockOrderBy: jest.Mock;
  let mockLimit: jest.Mock;
  let mockStartAfter: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create chained mock methods
    mockStartAfter = jest.fn(function (this: any) {
      return this;
    });
    mockLimit = jest.fn(function (this: any) {
      return this;
    });
    mockOrderBy = jest.fn(function (this: any) {
      return this;
    });
    mockWhere = jest.fn(function (this: any) {
      return this;
    });

    mockQuery = {
      where: mockWhere,
      orderBy: mockOrderBy,
      limit: mockLimit,
      startAfter: mockStartAfter,
    };

    // Setup Collections mocks to return mockQuery
    (Collections.shops as jest.Mock).mockReturnValue(mockQuery);
    (Collections.products as jest.Mock).mockReturnValue(mockQuery);
    (Collections.orders as jest.Mock).mockReturnValue(mockQuery);
    (Collections.auctions as jest.Mock).mockReturnValue(mockQuery);
  });

  describe("applyFilters", () => {
    it("should apply single filter to query", () => {
      const filters: QueryFilter[] = [
        { field: "status", operator: "==", value: "published" },
      ];

      const result = applyFilters(mockQuery, filters);

      expect(mockWhere).toHaveBeenCalledWith("status", "==", "published");
      expect(result).toBe(mockQuery);
    });

    it("should apply multiple filters to query", () => {
      const filters: QueryFilter[] = [
        { field: "status", operator: "==", value: "published" },
        { field: "price", operator: ">", value: 100 },
        { field: "category", operator: "==", value: "electronics" },
      ];

      applyFilters(mockQuery, filters);

      expect(mockWhere).toHaveBeenCalledTimes(3);
      expect(mockWhere).toHaveBeenNthCalledWith(1, "status", "==", "published");
      expect(mockWhere).toHaveBeenNthCalledWith(2, "price", ">", 100);
      expect(mockWhere).toHaveBeenNthCalledWith(
        3,
        "category",
        "==",
        "electronics"
      );
    });

    it("should handle empty filters array", () => {
      const result = applyFilters(mockQuery, []);

      expect(mockWhere).not.toHaveBeenCalled();
      expect(result).toBe(mockQuery);
    });

    it("should support all comparison operators", () => {
      const operators = ["==", "!=", "<", "<=", ">", ">="];

      operators.forEach((op) => {
        jest.clearAllMocks();
        const filters: QueryFilter[] = [
          { field: "value", operator: op as any, value: 10 },
        ];

        applyFilters(mockQuery, filters);

        expect(mockWhere).toHaveBeenCalledWith("value", op, 10);
      });
    });

    it("should support array operators", () => {
      const arrayOperators = ["in", "not-in", "array-contains"];

      arrayOperators.forEach((op) => {
        jest.clearAllMocks();
        const filters: QueryFilter[] = [
          { field: "tags", operator: op as any, value: ["tag1", "tag2"] },
        ];

        applyFilters(mockQuery, filters);

        expect(mockWhere).toHaveBeenCalledWith("tags", op, ["tag1", "tag2"]);
      });
    });

    it("should handle null values", () => {
      const filters: QueryFilter[] = [
        { field: "deletedAt", operator: "==", value: null },
      ];

      applyFilters(mockQuery, filters);

      expect(mockWhere).toHaveBeenCalledWith("deletedAt", "==", null);
    });

    it("should handle boolean values", () => {
      const filters: QueryFilter[] = [
        { field: "is_verified", operator: "==", value: true },
        { field: "is_banned", operator: "==", value: false },
      ];

      applyFilters(mockQuery, filters);

      expect(mockWhere).toHaveBeenNthCalledWith(1, "is_verified", "==", true);
      expect(mockWhere).toHaveBeenNthCalledWith(2, "is_banned", "==", false);
    });
  });

  describe("applyOrdering", () => {
    it("should apply ordering with field and direction", () => {
      const orderBy = { field: "created_at", direction: "desc" as const };

      const result = applyOrdering(mockQuery, orderBy);

      expect(mockOrderBy).toHaveBeenCalledWith("created_at", "desc");
      expect(result).toBe(mockQuery);
    });

    it("should use desc as default direction", () => {
      const orderBy = { field: "price" };

      applyOrdering(mockQuery, orderBy);

      expect(mockOrderBy).toHaveBeenCalledWith("price", "desc");
    });

    it("should handle asc direction", () => {
      const orderBy = { field: "name", direction: "asc" as const };

      applyOrdering(mockQuery, orderBy);

      expect(mockOrderBy).toHaveBeenCalledWith("name", "asc");
    });

    it("should return query unchanged when no ordering", () => {
      const result = applyOrdering(mockQuery);

      expect(mockOrderBy).not.toHaveBeenCalled();
      expect(result).toBe(mockQuery);
    });

    it("should handle undefined orderBy", () => {
      const result = applyOrdering(mockQuery, undefined);

      expect(mockOrderBy).not.toHaveBeenCalled();
      expect(result).toBe(mockQuery);
    });
  });

  describe("applyPagination", () => {
    it("should apply limit only", () => {
      const result = applyPagination(mockQuery, 20);

      expect(mockLimit).toHaveBeenCalledWith(20);
      expect(mockStartAfter).not.toHaveBeenCalled();
      expect(result).toBe(mockQuery);
    });

    it("should apply startAfter only", () => {
      const mockDoc = { id: "doc123" };

      const result = applyPagination(mockQuery, undefined, mockDoc);

      expect(mockStartAfter).toHaveBeenCalledWith(mockDoc);
      expect(mockLimit).not.toHaveBeenCalled();
      expect(result).toBe(mockQuery);
    });

    it("should apply both limit and startAfter", () => {
      const mockDoc = { id: "doc123" };

      applyPagination(mockQuery, 50, mockDoc);

      expect(mockLimit).toHaveBeenCalledWith(50);
      expect(mockStartAfter).toHaveBeenCalledWith(mockDoc);
    });

    it("should return query unchanged when no pagination", () => {
      const result = applyPagination(mockQuery);

      expect(mockLimit).not.toHaveBeenCalled();
      expect(mockStartAfter).not.toHaveBeenCalled();
      expect(result).toBe(mockQuery);
    });

    it("should handle zero limit", () => {
      applyPagination(mockQuery, 0);

      expect(mockLimit).not.toHaveBeenCalled();
    });
  });

  describe("buildQuery", () => {
    it("should build query with all options", () => {
      const options: QueryOptions = {
        filters: [{ field: "status", operator: "==", value: "active" }],
        orderBy: { field: "created_at", direction: "desc" },
        limit: 10,
      };

      buildQuery(mockQuery, options);

      expect(mockWhere).toHaveBeenCalledWith("status", "==", "active");
      expect(mockOrderBy).toHaveBeenCalledWith("created_at", "desc");
      expect(mockLimit).toHaveBeenCalledWith(10);
    });

    it("should build query with only filters", () => {
      const options: QueryOptions = {
        filters: [{ field: "price", operator: ">", value: 50 }],
      };

      buildQuery(mockQuery, options);

      expect(mockWhere).toHaveBeenCalled();
      expect(mockOrderBy).not.toHaveBeenCalled();
      expect(mockLimit).not.toHaveBeenCalled();
    });

    it("should build query with only ordering", () => {
      const options: QueryOptions = {
        orderBy: { field: "name", direction: "asc" },
      };

      buildQuery(mockQuery, options);

      expect(mockWhere).not.toHaveBeenCalled();
      expect(mockOrderBy).toHaveBeenCalled();
      expect(mockLimit).not.toHaveBeenCalled();
    });

    it("should build query with only pagination", () => {
      const options: QueryOptions = {
        limit: 25,
      };

      buildQuery(mockQuery, options);

      expect(mockWhere).not.toHaveBeenCalled();
      expect(mockOrderBy).not.toHaveBeenCalled();
      expect(mockLimit).toHaveBeenCalled();
    });

    it("should handle empty options", () => {
      const options: QueryOptions = {};

      const result = buildQuery(mockQuery, options);

      expect(mockWhere).not.toHaveBeenCalled();
      expect(mockOrderBy).not.toHaveBeenCalled();
      expect(mockLimit).not.toHaveBeenCalled();
      expect(result).toBe(mockQuery);
    });

    it("should apply operations in correct order: filters -> ordering -> pagination", () => {
      const callOrder: string[] = [];

      mockWhere.mockImplementation(() => {
        callOrder.push("where");
        return mockQuery;
      });
      mockOrderBy.mockImplementation(() => {
        callOrder.push("orderBy");
        return mockQuery;
      });
      mockLimit.mockImplementation(() => {
        callOrder.push("limit");
        return mockQuery;
      });

      const options: QueryOptions = {
        filters: [{ field: "status", operator: "==", value: "active" }],
        orderBy: { field: "created_at" },
        limit: 10,
      };

      buildQuery(mockQuery, options);

      expect(callOrder).toEqual(["where", "orderBy", "limit"]);
    });
  });

  describe("getShopsQuery", () => {
    beforeEach(() => {
      (Collections.shops as jest.Mock).mockReturnValue(mockQuery);
    });

    it("should return all shops query for admin", () => {
      const result = getShopsQuery(UserRole.ADMIN);

      expect(Collections.shops).toHaveBeenCalled();
      expect(mockWhere).not.toHaveBeenCalled();
      expect(result).toBe(mockQuery);
    });

    it("should return owner shops query for seller", () => {
      const userId = "seller123";

      getShopsQuery(UserRole.SELLER, userId);

      expect(Collections.shops).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalledWith("owner_id", "==", userId);
    });

    it("should return verified shops query for user", () => {
      getShopsQuery(UserRole.USER);

      expect(Collections.shops).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalledWith("is_verified", "==", true);
    });

    it("should return verified shops query for default role", () => {
      getShopsQuery("guest" as any);

      expect(mockWhere).toHaveBeenCalledWith("is_verified", "==", true);
    });
  });

  describe("getProductsQuery", () => {
    beforeEach(() => {
      (Collections.products as jest.Mock).mockReturnValue(mockQuery);
    });

    it("should return all products query for admin", () => {
      const result = getProductsQuery(UserRole.ADMIN);

      expect(Collections.products).toHaveBeenCalled();
      expect(mockWhere).not.toHaveBeenCalled();
      expect(result).toBe(mockQuery);
    });

    it("should return shop products query for seller", () => {
      const shopId = "shop123";

      getProductsQuery(UserRole.SELLER, shopId);

      expect(Collections.products).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalledWith("shop_id", "==", shopId);
    });

    it("should throw error for seller without shopId", () => {
      expect(() => getProductsQuery(UserRole.SELLER)).toThrow(
        "shopId is required for seller product queries"
      );
    });

    it("should return published products query for user", () => {
      getProductsQuery(UserRole.USER);

      expect(Collections.products).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalledWith("status", "==", "published");
    });

    it("should return published products query for default role", () => {
      getProductsQuery("guest" as any);

      expect(mockWhere).toHaveBeenCalledWith("status", "==", "published");
    });
  });

  describe("getOrdersQuery", () => {
    beforeEach(() => {
      (Collections.orders as jest.Mock).mockReturnValue(mockQuery);
    });

    it("should return all orders query for admin", () => {
      const result = getOrdersQuery(UserRole.ADMIN);

      expect(Collections.orders).toHaveBeenCalled();
      expect(mockWhere).not.toHaveBeenCalled();
      expect(result).toBe(mockQuery);
    });

    it("should return base orders query for seller", () => {
      const result = getOrdersQuery(UserRole.SELLER, "seller123", "shop123");

      expect(Collections.orders).toHaveBeenCalled();
      expect(mockWhere).not.toHaveBeenCalled();
      expect(result).toBe(mockQuery);
    });

    it("should return user orders query for user", () => {
      const userId = "user123";

      getOrdersQuery(UserRole.USER, userId);

      expect(Collections.orders).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalledWith("user_id", "==", userId);
    });

    it("should throw error for user without userId", () => {
      expect(() => getOrdersQuery(UserRole.USER)).toThrow(
        "userId is required for user order queries"
      );
    });

    it("should return user orders query for default role", () => {
      const userId = "user456";

      getOrdersQuery("customer" as any, userId);

      expect(mockWhere).toHaveBeenCalledWith("user_id", "==", userId);
    });
  });

  describe("getAuctionsQuery", () => {
    beforeEach(() => {
      (Collections.auctions as jest.Mock).mockReturnValue(mockQuery);
    });

    it("should return all auctions query for admin", () => {
      const result = getAuctionsQuery(UserRole.ADMIN);

      expect(Collections.auctions).toHaveBeenCalled();
      expect(mockWhere).not.toHaveBeenCalled();
      expect(result).toBe(mockQuery);
    });

    it("should return shop auctions query for seller", () => {
      const shopId = "shop123";

      getAuctionsQuery(UserRole.SELLER, shopId);

      expect(Collections.auctions).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalledWith("shop_id", "==", shopId);
    });

    it("should return active auctions query for user", () => {
      getAuctionsQuery(UserRole.USER);

      expect(Collections.auctions).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalledWith("status", "==", "active");
    });
  });

  describe("Real Code Issues Found", () => {
    it("PATTERN: applyPagination is deprecated but still functional", () => {
      // Test confirms the function works but should be replaced
      applyPagination(mockQuery, 10);

      expect(mockLimit).toHaveBeenCalledWith(10);
    });

    it("ISSUE: getShopsQuery for seller doesn't include public shops", () => {
      // Current implementation only shows own shops, not public verified shops
      // This is a business logic decision, not a bug
      getShopsQuery(UserRole.SELLER, "seller123");

      expect(mockWhere).toHaveBeenCalledWith("owner_id", "==", "seller123");
      // Does not query for is_verified=true shops
    });

    it("ISSUE: getOrdersQuery for seller returns base query requiring additional filtering", () => {
      // Seller orders need to be filtered by order_items in API route
      const result = getOrdersQuery(UserRole.SELLER, "seller123", "shop123");

      // Returns unfiltered query - additional logic needed in API route
      expect(mockWhere).not.toHaveBeenCalled();
    });

    it("PATTERN: User role defaults to USER behavior for unknown roles", () => {
      // When an unknown role is provided, functions default to USER permissions
      getProductsQuery("unknown_role" as any);

      expect(mockWhere).toHaveBeenCalledWith("status", "==", "published");
    });

    it("PATTERN: All role-based queries call Collections helper first", () => {
      getShopsQuery(UserRole.ADMIN);
      getProductsQuery(UserRole.ADMIN);
      getOrdersQuery(UserRole.ADMIN);

      expect(Collections.shops).toHaveBeenCalled();
      expect(Collections.products).toHaveBeenCalled();
      expect(Collections.orders).toHaveBeenCalled();
    });

    it("SAFETY: Functions throw descriptive errors for missing required parameters", () => {
      expect(() => getProductsQuery(UserRole.SELLER)).toThrow(
        "shopId is required for seller product queries"
      );

      expect(() => getOrdersQuery(UserRole.USER)).toThrow(
        "userId is required for user order queries"
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle very large limit values", () => {
      applyPagination(mockQuery, 999999);

      expect(mockLimit).toHaveBeenCalledWith(999999);
    });

    it("should handle negative limit values", () => {
      applyPagination(mockQuery, -10);

      expect(mockLimit).toHaveBeenCalledWith(-10);
    });

    it("should handle empty string as filter value", () => {
      const filters: QueryFilter[] = [
        { field: "name", operator: "==", value: "" },
      ];

      applyFilters(mockQuery, filters);

      expect(mockWhere).toHaveBeenCalledWith("name", "==", "");
    });

    it("should handle undefined as filter value", () => {
      const filters: QueryFilter[] = [
        { field: "optional", operator: "==", value: undefined },
      ];

      applyFilters(mockQuery, filters);

      expect(mockWhere).toHaveBeenCalledWith("optional", "==", undefined);
    });

    it("should chain multiple where clauses correctly", () => {
      const filters: QueryFilter[] = [
        { field: "field1", operator: "==", value: "value1" },
        { field: "field2", operator: "==", value: "value2" },
        { field: "field3", operator: "==", value: "value3" },
      ];

      applyFilters(mockQuery, filters);

      // Each where should be called on the returned query from previous where
      expect(mockWhere).toHaveBeenCalledTimes(3);
    });
  });
});
