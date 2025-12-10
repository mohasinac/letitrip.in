/**
 * Unit Tests: Firestore Query Builders
 * File: src/app/api/lib/firebase/queries.ts
 */

import {
  QueryFilter,
  QueryOptions,
  UserRole,
  applyFilters,
  applyOrdering,
  applyPagination,
  buildQuery,
  getAuctionsQuery,
  getOrdersQuery,
  getProductsQuery,
  getReturnsQuery,
  getShopsQuery,
  getSupportTicketsQuery,
  userOwnsResource,
  userOwnsShop,
} from "@/app/api/lib/firebase/queries";
import { COLLECTIONS } from "@/constants/database";

// Create mock collection ref that will be reused
let mockCollectionRef: any;

// Mock Collections
jest.mock("@/app/api/lib/firebase/collections", () => ({
  Collections: {
    shops: jest.fn(() => mockCollectionRef),
    products: jest.fn(() => mockCollectionRef),
    orders: jest.fn(() => mockCollectionRef),
    auctions: jest.fn(() => mockCollectionRef),
    returns: jest.fn(() => mockCollectionRef),
    supportTickets: jest.fn(() => mockCollectionRef),
  },
  getDocumentById: jest.fn(),
}));

describe("Firestore Query Builders", () => {
  let mockQuery: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockQuery = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      startAfter: jest.fn().mockReturnThis(),
    };

    mockCollectionRef = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      startAfter: jest.fn().mockReturnThis(),
    };
  });

  describe("applyFilters", () => {
    it("should apply single filter", () => {
      const filters: QueryFilter[] = [
        { field: "status", operator: "==", value: "active" },
      ];

      applyFilters(mockQuery, filters);

      expect(mockQuery.where).toHaveBeenCalledWith("status", "==", "active");
      expect(mockQuery.where).toHaveBeenCalledTimes(1);
    });

    it("should apply multiple filters", () => {
      const filters: QueryFilter[] = [
        { field: "status", operator: "==", value: "active" },
        { field: "price", operator: ">", value: 100 },
        { field: "category", operator: "in", value: ["electronics", "books"] },
      ];

      applyFilters(mockQuery, filters);

      expect(mockQuery.where).toHaveBeenCalledTimes(3);
      expect(mockQuery.where).toHaveBeenNthCalledWith(
        1,
        "status",
        "==",
        "active"
      );
      expect(mockQuery.where).toHaveBeenNthCalledWith(2, "price", ">", 100);
      expect(mockQuery.where).toHaveBeenNthCalledWith(3, "category", "in", [
        "electronics",
        "books",
      ]);
    });

    it("should return query unchanged with empty filters", () => {
      const result = applyFilters(mockQuery, []);

      expect(mockQuery.where).not.toHaveBeenCalled();
      expect(result).toBe(mockQuery);
    });

    it("should handle array_contains operator", () => {
      const filters: QueryFilter[] = [
        { field: "tags", operator: "array-contains", value: "featured" },
      ];

      applyFilters(mockQuery, filters);

      expect(mockQuery.where).toHaveBeenCalledWith(
        "tags",
        "array-contains",
        "featured"
      );
    });
  });

  describe("applyPagination", () => {
    it("should apply limit", () => {
      applyPagination(mockQuery, 10);

      expect(mockQuery.limit).toHaveBeenCalledWith(10);
    });

    it("should apply startAfter", () => {
      const lastDoc = { id: "doc123" };

      applyPagination(mockQuery, undefined, lastDoc);

      expect(mockQuery.startAfter).toHaveBeenCalledWith(lastDoc);
    });

    it("should apply both limit and startAfter", () => {
      const lastDoc = { id: "doc123" };

      applyPagination(mockQuery, 20, lastDoc);

      expect(mockQuery.limit).toHaveBeenCalledWith(20);
      expect(mockQuery.startAfter).toHaveBeenCalledWith(lastDoc);
    });

    it("should return query unchanged with no pagination", () => {
      const result = applyPagination(mockQuery);

      expect(mockQuery.limit).not.toHaveBeenCalled();
      expect(mockQuery.startAfter).not.toHaveBeenCalled();
      expect(result).toBe(mockQuery);
    });
  });

  describe("applyOrdering", () => {
    it("should apply ordering with default desc direction", () => {
      applyOrdering(mockQuery, { field: "created_at" });

      expect(mockQuery.orderBy).toHaveBeenCalledWith("created_at", "desc");
    });

    it("should apply ordering with asc direction", () => {
      applyOrdering(mockQuery, { field: "price", direction: "asc" });

      expect(mockQuery.orderBy).toHaveBeenCalledWith("price", "asc");
    });

    it("should return query unchanged with no ordering", () => {
      const result = applyOrdering(mockQuery);

      expect(mockQuery.orderBy).not.toHaveBeenCalled();
      expect(result).toBe(mockQuery);
    });
  });

  describe("buildQuery", () => {
    it("should build query with all options", () => {
      const options: QueryOptions = {
        filters: [{ field: "status", operator: "==", value: "active" }],
        orderBy: { field: "created_at", direction: "desc" },
        limit: 10,
        startAfter: { id: "doc123" },
      };

      buildQuery(mockQuery, options);

      expect(mockQuery.where).toHaveBeenCalled();
      expect(mockQuery.orderBy).toHaveBeenCalled();
      expect(mockQuery.limit).toHaveBeenCalled();
      expect(mockQuery.startAfter).toHaveBeenCalled();
    });

    it("should build query with filters only", () => {
      const options: QueryOptions = {
        filters: [{ field: "category", operator: "==", value: "books" }],
      };

      buildQuery(mockQuery, options);

      expect(mockQuery.where).toHaveBeenCalled();
      expect(mockQuery.orderBy).not.toHaveBeenCalled();
      expect(mockQuery.limit).not.toHaveBeenCalled();
    });

    it("should build query with ordering only", () => {
      const options: QueryOptions = {
        orderBy: { field: "price", direction: "asc" },
      };

      buildQuery(mockQuery, options);

      expect(mockQuery.where).not.toHaveBeenCalled();
      expect(mockQuery.orderBy).toHaveBeenCalled();
    });

    it("should return base query with empty options", () => {
      const result = buildQuery(mockQuery, {});

      expect(mockQuery.where).not.toHaveBeenCalled();
      expect(mockQuery.orderBy).not.toHaveBeenCalled();
      expect(result).toBe(mockQuery);
    });
  });

  describe("getShopsQuery", () => {
    it("should return all shops for ADMIN", () => {
      const query = getShopsQuery(UserRole.ADMIN);

      expect(query).toBeDefined();
      expect(mockCollectionRef.where).not.toHaveBeenCalled();
    });

    it("should filter by owner_id for SELLER", () => {
      const query = getShopsQuery(UserRole.SELLER, "seller123");

      expect(mockCollectionRef.where).toHaveBeenCalledWith(
        "owner_id",
        "==",
        "seller123"
      );
    });

    it("should filter by is_verified for USER", () => {
      const query = getShopsQuery(UserRole.USER);

      expect(mockCollectionRef.where).toHaveBeenCalledWith(
        "is_verified",
        "==",
        true
      );
    });

    it("should filter by is_verified for default role", () => {
      const query = getShopsQuery("guest" as UserRole);

      expect(mockCollectionRef.where).toHaveBeenCalledWith(
        "is_verified",
        "==",
        true
      );
    });
  });

  describe("getProductsQuery", () => {
    it("should return all products for ADMIN", () => {
      const query = getProductsQuery(UserRole.ADMIN);

      expect(query).toBeDefined();
      expect(mockCollectionRef.where).not.toHaveBeenCalled();
    });

    it("should filter by shop_id for SELLER", () => {
      const query = getProductsQuery(UserRole.SELLER, "shop123");

      expect(mockCollectionRef.where).toHaveBeenCalledWith(
        "shop_id",
        "==",
        "shop123"
      );
    });

    it("should throw error if shopId missing for SELLER", () => {
      expect(() => getProductsQuery(UserRole.SELLER)).toThrow(
        "shopId is required for seller product queries"
      );
    });

    it("should filter by status=published for USER", () => {
      const query = getProductsQuery(UserRole.USER);

      expect(mockCollectionRef.where).toHaveBeenCalledWith(
        "status",
        "==",
        "published"
      );
    });

    it("should filter by status=published for default role", () => {
      const query = getProductsQuery("guest" as UserRole);

      expect(mockCollectionRef.where).toHaveBeenCalledWith(
        "status",
        "==",
        "published"
      );
    });
  });

  describe("getOrdersQuery", () => {
    it("should return all orders for ADMIN", () => {
      const query = getOrdersQuery(UserRole.ADMIN);

      expect(query).toBeDefined();
      expect(mockCollectionRef.where).not.toHaveBeenCalled();
    });

    it("should return base query for SELLER", () => {
      const query = getOrdersQuery(UserRole.SELLER, undefined, "shop123");

      expect(query).toBeDefined();
      // Seller filtering happens in API route (order_items check)
      expect(mockCollectionRef.where).not.toHaveBeenCalled();
    });

    it("should filter by user_id for USER", () => {
      const query = getOrdersQuery(UserRole.USER, "user123");

      expect(mockCollectionRef.where).toHaveBeenCalledWith(
        "user_id",
        "==",
        "user123"
      );
    });

    it("should throw error if userId missing for USER", () => {
      expect(() => getOrdersQuery(UserRole.USER)).toThrow(
        "userId is required for user order queries"
      );
    });
  });

  describe("getAuctionsQuery", () => {
    it("should return all auctions for ADMIN", () => {
      const query = getAuctionsQuery(UserRole.ADMIN);

      expect(query).toBeDefined();
      expect(mockCollectionRef.where).not.toHaveBeenCalled();
    });

    it("should filter by shop_id for SELLER", () => {
      const query = getAuctionsQuery(UserRole.SELLER, "shop123");

      expect(mockCollectionRef.where).toHaveBeenCalledWith(
        "shop_id",
        "==",
        "shop123"
      );
    });

    it("should throw error if shopId missing for SELLER", () => {
      expect(() => getAuctionsQuery(UserRole.SELLER)).toThrow(
        "shopId is required for seller auction queries"
      );
    });

    it("should filter by status=active for USER", () => {
      const query = getAuctionsQuery(UserRole.USER);

      expect(mockCollectionRef.where).toHaveBeenCalledWith(
        "status",
        "==",
        "active"
      );
    });

    it("should filter by status=active for default role", () => {
      const query = getAuctionsQuery("guest" as UserRole);

      expect(mockCollectionRef.where).toHaveBeenCalledWith(
        "status",
        "==",
        "active"
      );
    });
  });

  describe("getReturnsQuery", () => {
    it("should return all returns for ADMIN", () => {
      const query = getReturnsQuery(UserRole.ADMIN);

      expect(query).toBeDefined();
      expect(mockCollectionRef.where).not.toHaveBeenCalled();
    });

    it("should filter by shop_id for SELLER", () => {
      const query = getReturnsQuery(UserRole.SELLER, undefined, "shop123");

      expect(mockCollectionRef.where).toHaveBeenCalledWith(
        "shop_id",
        "==",
        "shop123"
      );
    });

    it("should throw error if shopId missing for SELLER", () => {
      expect(() => getReturnsQuery(UserRole.SELLER)).toThrow(
        "shopId is required for seller return queries"
      );
    });

    it("should filter by user_id for USER", () => {
      const query = getReturnsQuery(UserRole.USER, "user123");

      expect(mockCollectionRef.where).toHaveBeenCalledWith(
        "user_id",
        "==",
        "user123"
      );
    });

    it("should throw error if userId missing for USER", () => {
      expect(() => getReturnsQuery(UserRole.USER)).toThrow(
        "userId is required for user return queries"
      );
    });
  });

  describe("getSupportTicketsQuery", () => {
    it("should return all tickets for ADMIN", () => {
      const query = getSupportTicketsQuery(UserRole.ADMIN);

      expect(query).toBeDefined();
      expect(mockCollectionRef.where).not.toHaveBeenCalled();
    });

    it("should filter by shop_id for SELLER", () => {
      const query = getSupportTicketsQuery(
        UserRole.SELLER,
        undefined,
        "shop123"
      );

      expect(mockCollectionRef.where).toHaveBeenCalledWith(
        "shop_id",
        "==",
        "shop123"
      );
    });

    it("should throw error if shopId missing for SELLER", () => {
      expect(() => getSupportTicketsQuery(UserRole.SELLER)).toThrow(
        "shopId is required for seller ticket queries"
      );
    });

    it("should filter by user_id for USER", () => {
      const query = getSupportTicketsQuery(UserRole.USER, "user123");

      expect(mockCollectionRef.where).toHaveBeenCalledWith(
        "user_id",
        "==",
        "user123"
      );
    });

    it("should throw error if userId missing for USER", () => {
      expect(() => getSupportTicketsQuery(UserRole.USER)).toThrow(
        "userId is required for user ticket queries"
      );
    });
  });

  describe("userOwnsResource", () => {
    it("should return true if user owns resource", async () => {
      const { getDocumentById } = await import(
        "@/app/api/lib/firebase/collections"
      );
      (getDocumentById as jest.Mock).mockResolvedValue({
        id: "resource123",
        owner_id: "user123",
      });

      const result = await userOwnsResource("shops", "resource123", "user123");

      expect(result).toBe(true);
      expect(getDocumentById).toHaveBeenCalledWith("shops", "resource123");
    });

    it("should return false if user does not own resource", async () => {
      const { getDocumentById } = await import(
        "@/app/api/lib/firebase/collections"
      );
      (getDocumentById as jest.Mock).mockResolvedValue({
        id: "resource123",
        owner_id: "other_user",
      });

      const result = await userOwnsResource("shops", "resource123", "user123");

      expect(result).toBe(false);
    });

    it("should return false if resource not found", async () => {
      const { getDocumentById } = await import(
        "@/app/api/lib/firebase/collections"
      );
      (getDocumentById as jest.Mock).mockResolvedValue(null);

      const result = await userOwnsResource("shops", "nonexistent", "user123");

      expect(result).toBe(false);
    });

    it("should use custom owner field", async () => {
      const { getDocumentById } = await import(
        "@/app/api/lib/firebase/collections"
      );
      (getDocumentById as jest.Mock).mockResolvedValue({
        id: "resource123",
        creator_id: "user123",
      });

      const result = await userOwnsResource(
        "shops",
        "resource123",
        "user123",
        "creator_id"
      );

      expect(result).toBe(true);
    });

    it("should handle errors gracefully", async () => {
      const { getDocumentById } = await import(
        "@/app/api/lib/firebase/collections"
      );
      (getDocumentById as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const result = await userOwnsResource("shops", "resource123", "user123");

      expect(result).toBe(false);
    });
  });

  describe("userOwnsShop", () => {
    it("should check shop ownership", async () => {
      const { getDocumentById } = await import(
        "@/app/api/lib/firebase/collections"
      );
      (getDocumentById as jest.Mock).mockResolvedValue({
        id: "shop123",
        owner_id: "seller123",
      });

      const result = await userOwnsShop("shop123", "seller123");

      expect(result).toBe(true);
      expect(getDocumentById).toHaveBeenCalledWith(
        COLLECTIONS.SHOPS,
        "shop123"
      );
    });

    it("should return false if not owner", async () => {
      const { getDocumentById } = await import(
        "@/app/api/lib/firebase/collections"
      );
      (getDocumentById as jest.Mock).mockResolvedValue({
        id: "shop123",
        owner_id: "other_seller",
      });

      const result = await userOwnsShop("shop123", "seller123");

      expect(result).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle complex filter combinations", () => {
      const filters: QueryFilter[] = [
        { field: "price", operator: ">=", value: 10 },
        { field: "price", operator: "<=", value: 1000 },
        { field: "stock", operator: ">", value: 0 },
        { field: "tags", operator: "array-contains", value: "sale" },
      ];

      applyFilters(mockQuery, filters);

      expect(mockQuery.where).toHaveBeenCalledTimes(4);
    });

    it("should handle Unicode in filter values", () => {
      const filters: QueryFilter[] = [
        { field: "name", operator: "==", value: "产品名称" },
        { field: "category", operator: "==", value: "📱 Electronics" },
      ];

      applyFilters(mockQuery, filters);

      expect(mockQuery.where).toHaveBeenCalledWith("name", "==", "产品名称");
      expect(mockQuery.where).toHaveBeenCalledWith(
        "category",
        "==",
        "📱 Electronics"
      );
    });

    it("should handle large limit values", () => {
      applyPagination(mockQuery, 10000);

      expect(mockQuery.limit).toHaveBeenCalledWith(10000);
    });

    it("should handle zero limit", () => {
      applyPagination(mockQuery, 0);

      // Zero is falsy, so limit should not be called
      expect(mockQuery.limit).not.toHaveBeenCalled();
    });
  });
});
